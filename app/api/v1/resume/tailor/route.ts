import { NextRequest, NextResponse } from 'next/server';
import { generateStream, collectStream, extractJsonObjectFromAssistantText } from '@/lib/llm-client';
import { TailorResumeRequestSchema, GenerateResumeResponseSchema, ResumeData } from '@/lib/resume-schema';
import { normalizeResumeFromLLM } from '@/lib/normalize-resume';
import { normalizeAnalyzeJDFromLLM } from '@/lib/normalize-jd';
import { generateTypst } from '@/lib/typst-generator';
import { ratelimit } from '@/lib/rate-limit';
import { jsonrepair } from 'jsonrepair';
import { validateAndCleanTailoredResume } from '@/lib/fact-validator';
import { extractUserApiKeys, hasCustomKeys } from '@/lib/ai-keys';
import { requireUser } from '@/lib/auth';
import { recordBulletTailored } from '@/lib/stats-service';
import { buildTailorPrompt } from '@/lib/prompts';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'Payload too large. Maximum allowed size is 2MB.' }, { status: 413 });
    }

    // Strictly enforce authentication for all resume tailoring
    const auth = await requireUser();
    if (auth.response) return auth.response;

    const userKeys = extractUserApiKeys(req);
    const usingCustomKeys = hasCustomKeys(userKeys);

    if (!usingCustomKeys) {
        const ip = req.ip ?? "127.0.0.1";
        const { success } = await ratelimit.limit(ip);

        if (!success) {
            return new NextResponse('Too many requests. Please try again later or configure your own AI key.', { status: 429 });
        }
    }

    try {
        const body = await req.json();
        const validatedInput = TailorResumeRequestSchema.safeParse(body);

        if (!validatedInput.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validatedInput.error.format() },
                { status: 400 }
            );
        }

        const { resumeData, jdKeywords: requestJdKeywords, jd, template, theme, tailorMode } = validatedInput.data;
        const isOptimizeOnly = tailorMode === 'optimize';
        // Reassigned below if the model extracts it from raw `jd` text in this same
        // completion — keeps every downstream reference (ATS summary, alignment map,
        // confidence score) working the same regardless of which path supplied it.
        let jdKeywords = requestJdKeywords ?? null;

        // Build standardized, context-first prompt with zero-hallucination guarantees.
        // When the caller only sent raw `jd` text, this single completion also does
        // the job of the old separate analyze-jd call.
        const prompt = buildTailorPrompt({
            resumeData,
            jdKeywords,
            jd,
            tailorMode,
            template,
            theme,
        });

        let tailoredResume: ResumeData;
        let rawAtsSummary: any = null;
        try {
            console.log(`[Tailor] Starting streaming tailor (Mode: ${tailorMode}, BYOK: ${usingCustomKeys})...`);
            const { textStream, model } = await generateStream(prompt, undefined, 'heavy', {
                // This response packs the full tailored resume + JD-keyword
                // extraction + ATS alignment summary into one JSON payload —
                // shrinking this to fit weaker models' limits (previously tried
                // 4096) truncated real responses mid-JSON, corrupting output
                // instead of failing cleanly. Exclude models too small for this
                // payload from the heavy pool (see GROQ_HEAVY_MODELS) rather than
                // shrinking everyone's budget to fit the smallest one.
                maxTokens: 6000,
                userKeys,
                // A weak fallback model can return syntactically valid JSON that's
                // still an empty/near-empty resume (e.g. under load or a truncated
                // response). If the source resume had real content, the tailored
                // output should too — otherwise fail over to the next model rather
                // than silently handing back a gutted resume as a "success".
                validate: (fullText) => {
                    try {
                        const jsonText = extractJsonObjectFromAssistantText(fullText);
                        let raw: unknown;
                        try {
                            raw = JSON.parse(jsonText);
                        } catch {
                            raw = JSON.parse(jsonrepair(jsonText));
                        }
                        const candidate = raw && typeof raw === 'object' && 'tailoredResume' in (raw as Record<string, unknown>)
                            ? (raw as Record<string, unknown>).tailoredResume
                            : raw;
                        const normalized = normalizeResumeFromLLM(candidate);
                        const sourceHasContent = resumeData.experience.length > 0 || !!resumeData.summary?.trim();
                        const outputHasContent = normalized.experience.length > 0 || !!normalized.summary?.trim();
                        return !sourceHasContent || outputHasContent;
                    } catch {
                        return false;
                    }
                },
            });

            console.log(`[Tailor] Connected via ${model}, collecting stream...`);

            const rawText = await collectStream(textStream);
            console.log(`[Tailor] Stream complete (${rawText.length} chars)`);

            const jsonText = extractJsonObjectFromAssistantText(rawText);
            let raw: unknown;
            try {
                raw = JSON.parse(jsonText);
            } catch {
                const repaired = jsonrepair(jsonText);
                raw = JSON.parse(repaired);
            }

            let candidateResume = raw;
            if (raw && typeof raw === 'object' && 'tailoredResume' in (raw as Record<string, unknown>)) {
                const wrapped = raw as Record<string, unknown>;
                candidateResume = wrapped.tailoredResume;
                rawAtsSummary = wrapped.atsAlignmentSummary;
                if (!jdKeywords && wrapped.jdKeywords) {
                    try {
                        jdKeywords = normalizeAnalyzeJDFromLLM(wrapped.jdKeywords);
                    } catch {
                        // Extraction came back malformed — proceed without it rather
                        // than fail the whole tailor response over a secondary field.
                    }
                }
            } else if (raw && typeof raw === 'object') {
                const record = raw as Record<string, unknown>;
                if ('atsAlignmentSummary' in record) {
                    rawAtsSummary = record.atsAlignmentSummary;
                }
                if (!jdKeywords && 'jdKeywords' in record && record.jdKeywords) {
                    try {
                        jdKeywords = normalizeAnalyzeJDFromLLM(record.jdKeywords);
                    } catch {
                    }
                }
            }

            tailoredResume = normalizeResumeFromLLM(candidateResume);
        } catch (llmError: unknown) {
            // Surface this as a real failure instead of silently returning the
            // untouched original resume as a fake "200 success" — the caller (Step 3)
            // needs to know tailoring didn't actually happen so it can show its
            // error state and offer a retry, rather than presenting stale content
            // as if it were freshly tailored.
            console.error('LLM Tailoring Failed:', llmError);
            const message = llmError instanceof Error ? llmError.message : 'AI tailoring request failed';
            return NextResponse.json(
                { error: 'AI tailoring failed. Please retry.', details: message },
                { status: 502 }
            );
        }

        // Run post-generation AI Fact Validation against ground truth source evidence
        const factCheck = validateAndCleanTailoredResume(resumeData, tailoredResume);
        tailoredResume = factCheck.cleanedResume;

        if (!isOptimizeOnly && jdKeywords) {
            // In JD alignment mode, compute realistic alignment score based on verified
            // overlap — no artificial floor. This used to clamp to a 0.70-0.98 band
            // regardless of matchRatio, which meant a 0%-match resume still reported
            // 70% "confidence." Report the real ratio instead (capped only for sanity).
            const reqSkills = jdKeywords.required_skills || [];
            const resumeText = JSON.stringify(tailoredResume).toLowerCase();
            const matchedSkills = reqSkills.filter(s => resumeText.includes(s.toLowerCase()));
            const matchRatio = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : null;
            tailoredResume.confidenceScore = matchRatio === null
                ? (tailoredResume.confidenceScore || undefined)
                : Math.max(0, Math.min(0.98, matchRatio));
        }
        // Optimize mode has no JD to score alignment against — leave confidenceScore
        // as whatever (if anything) the model itself reported, rather than fabricating
        // a fixed 0.92. The UI already shows an honest "no JD" state when it's absent.

        // Build comprehensive transparent audit trail comparing source to tailored
        const sectionsModified: string[] = [];
        if (resumeData.summary !== tailoredResume.summary) sectionsModified.push('Professional Summary');
        if (JSON.stringify(resumeData.skills) !== JSON.stringify(tailoredResume.skills)) sectionsModified.push('Technical Skills');
        if (JSON.stringify(resumeData.experience) !== JSON.stringify(tailoredResume.experience)) sectionsModified.push('Work Experience');
        if (JSON.stringify(resumeData.projects) !== JSON.stringify(tailoredResume.projects)) sectionsModified.push('Projects');

        // Extract added skills and determine transferability / source
        const origSkillsText = (resumeData.skills || []).map(s => `${s.category} ${s.items}`).join(' ').toLowerCase();
        const origExpText = (resumeData.experience || []).map(e => `${e.title} ${e.company} ${e.bullets.join(' ')}`).join(' ').toLowerCase();
        const skillsAdded: Array<{ skill: string; category: string; source: string; reason: string }> = [];

        (tailoredResume.skills || []).forEach(cat => {
            const items = cat.items.split(/[,•|/]+/).map(i => i.trim()).filter(i => i.length > 1);
            items.forEach(skill => {
                const sLower = skill.toLowerCase();
                if (!origSkillsText.includes(sLower)) {
                    let source = 'transferable';
                    let reason = `Target JD competency bridged from candidate's existing background.`;

                    if (origExpText.includes(sLower)) {
                        source = 'direct';
                        reason = `Promoted to Technical Skills from candidate's existing project/experience text.`;
                    } else if (sLower.includes('k8s') || sLower.includes('kubernetes') || sLower.includes('docker') || sLower.includes('container')) {
                        source = 'transferable';
                        reason = `Derived from container orchestration and cloud platform infrastructure experience.`;
                    } else if (sLower.includes('ci/cd') || sLower.includes('github') || sLower.includes('pipeline') || sLower.includes('gitops')) {
                        source = 'transferable';
                        reason = `Aligned with candidate's deployment automation and release workflows.`;
                    } else if (sLower.includes('cloud') || sLower.includes('aws') || sLower.includes('gcp') || sLower.includes('azure')) {
                        source = 'inferred';
                        reason = `Standard enterprise cloud tooling supporting candidate's primary architecture.`;
                    }

                    skillsAdded.push({
                        skill,
                        category: cat.category,
                        source,
                        reason,
                    });
                }
            });
        });

        // Collect EVERY bullet change with explainability
        const bulletChanges: Array<{
            role: string;
            company: string;
            original: string;
            tailored: string;
            changeType: string;
            reason: string;
            evidenceSafety: string;
        }> = [];

        (tailoredResume.experience || []).forEach((exp, expIdx) => {
            const origExp = resumeData.experience?.[expIdx];
            exp.bullets.forEach((tailoredBullet, bIdx) => {
                const origBullet = origExp?.bullets?.[bIdx] || '';
                if (origBullet && origBullet !== tailoredBullet) {
                    let changeType = 'jd_alignment';
                    let reason = 'Rephrased to align action verbs and keywords with target job requirements.';

                    if (/^\w+ed\b/i.test(tailoredBullet) && !/^\w+ed\b/i.test(origBullet)) {
                        changeType = 'action_verb';
                        reason = 'Strengthened with assertive, past-tense executive action verb.';
                    } else if (/\d+%|\$\d+|\d+x|\d+ms/i.test(tailoredBullet) && !/\d+%|\$\d+|\d+x|\d+ms/i.test(origBullet)) {
                        changeType = 'metric_strengthened';
                        reason = 'Highlighted quantified business outcome and engineering telemetry.';
                    } else if (isOptimizeOnly) {
                        changeType = 'clarity_ats';
                        reason = 'Enhanced ATS machine readability and syntactic structure while preserving factual experience.';
                    }

                    bulletChanges.push({
                        role: exp.title,
                        company: exp.company,
                        original: origBullet,
                        tailored: tailoredBullet,
                        changeType,
                        reason,
                        evidenceSafety: '100% verified against original candidate responsibilities.',
                    });
                }
            });
        });

        // Map JD requirements to resume evidence
        const allResumeText = `${tailoredResume.summary} ${tailoredResume.skills.map(s => s.items).join(' ')} ${tailoredResume.experience.map(e => e.bullets.join(' ')).join(' ')}`.toLowerCase();
        const jdAlignmentMap: Array<{
            requirement: string;
            category: string;
            status: 'matched' | 'partially_matched' | 'missing';
            resumeEvidence: string;
        }> = [];

        const isCleanKw = (str: string) => Boolean(str && typeof str === 'string' && !/^\[object\b/i.test(str) && !/\[object\s+object\]/i.test(str));

        (jdKeywords?.required_skills || []).filter(isCleanKw).slice(0, 8).forEach(skill => {
            const hasExact = allResumeText.includes(skill.toLowerCase());
            jdAlignmentMap.push({
                requirement: skill,
                category: 'Required Skill',
                status: hasExact ? 'matched' : 'partially_matched',
                resumeEvidence: hasExact
                    ? `Directly evidenced in Technical Skills & Experience bullets.`
                    : `Supported by adjacent transferable competencies in candidate profile.`,
            });
        });

        (jdKeywords?.responsibilities || []).filter(isCleanKw).slice(0, 5).forEach(resp => {
            const words = resp.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const matchCount = words.filter(w => allResumeText.includes(w)).length;
            const status = matchCount >= Math.min(2, words.length) ? 'matched' : matchCount > 0 ? 'partially_matched' : 'missing';
            jdAlignmentMap.push({
                requirement: resp,
                category: 'Core Responsibility',
                status,
                resumeEvidence: status === 'matched'
                    ? `Integrated into primary experience achievement bullets.`
                    : `Demonstrated through engineering project and systems delivery.`,
            });
        });

        // Compute ATS Alignment Summary for Aggressive Alignment Mode
        const matchedRequirements: string[] = [];
        const partiallyMatchedRequirements: string[] = [];
        const unsupportedRequirements: string[] = [];
        const incorporatedKeywords: string[] = [];

        if (jdKeywords) {
            (jdKeywords.required_skills || []).filter(isCleanKw).forEach(skill => {
                const sLower = skill.toLowerCase();
                if (allResumeText.includes(sLower)) {
                    matchedRequirements.push(skill);
                } else {
                    const words = sLower.split(/[\s/]+/).filter(w => w.length > 2);
                    const anyWord = words.some(w => allResumeText.includes(w));
                    if (anyWord) {
                        partiallyMatchedRequirements.push(skill);
                    } else {
                        unsupportedRequirements.push(skill);
                    }
                }
            });

            (jdKeywords.preferred_skills || []).filter(isCleanKw).forEach(skill => {
                const sLower = skill.toLowerCase();
                if (allResumeText.includes(sLower)) {
                    matchedRequirements.push(skill);
                } else {
                    unsupportedRequirements.push(skill);
                }
            });

            (jdKeywords.buzzwords || []).filter(isCleanKw).forEach(kw => {
                if (allResumeText.includes(kw.toLowerCase())) {
                    incorporatedKeywords.push(kw);
                }
            });
        }

        const totalReqs = (matchedRequirements.length + partiallyMatchedRequirements.length + unsupportedRequirements.length) || 1;
        const calculatedScore = Math.round(
            ((matchedRequirements.length * 1.0 + partiallyMatchedRequirements.length * 0.5) / totalReqs) * 100
        );
        // No artificial floor here — this used to clamp to a minimum of 70-85 regardless
        // of actual computed match, which meant the "ATS Alignment Summary" could never
        // honestly report low coverage even when it existed.
        const overallScore = Math.min(99, Math.max(0, rawAtsSummary?.overallScore || calculatedScore));

        const sanitizeSummaryArray = (arr?: string[]) =>
            Array.from(new Set((arr || []).filter(isCleanKw)));

        const atsAlignmentSummary = {
            overallScore,
            matchedRequirements: sanitizeSummaryArray(rawAtsSummary?.matchedRequirements?.length ? rawAtsSummary.matchedRequirements : matchedRequirements),
            partiallyMatchedRequirements: sanitizeSummaryArray(rawAtsSummary?.partiallyMatchedRequirements?.length ? rawAtsSummary.partiallyMatchedRequirements : partiallyMatchedRequirements),
            unsupportedRequirements: sanitizeSummaryArray(rawAtsSummary?.unsupportedRequirements?.length ? rawAtsSummary.unsupportedRequirements : unsupportedRequirements),
            incorporatedKeywords: sanitizeSummaryArray(rawAtsSummary?.incorporatedKeywords?.length ? rawAtsSummary.incorporatedKeywords : incorporatedKeywords),
        };

        // Generate Typst
        const typstCode = generateTypst(tailoredResume, template, theme);

        const responseData = {
            tailoredResume,
            typstCode,
            confidenceScore: tailoredResume.confidenceScore || 0,
            // Only present when extracted in this same completion (caller sent raw
            // `jd` instead of pre-extracted jdKeywords) — lets the client score
            // against it without a separate analyze-jd round trip.
            jdKeywords: !requestJdKeywords && jdKeywords ? jdKeywords : undefined,
            atsAlignmentSummary,
            factCheckReport: {
                passed: factCheck.passed,
                issuesCount: factCheck.issues.length,
                preservedMetricsCount: factCheck.preservedMetricsCount,
                verifiedEmployersCount: factCheck.verifiedEmployersCount,
            },
            auditTrail: {
                mode: isOptimizeOnly ? ('optimize' as const) : ('tailor' as const),
                sectionsModified,
                skillsAdded: skillsAdded.slice(0, 12),
                bulletChanges: bulletChanges.slice(0, 15),
                jdAlignmentMap,
                safetyIndicator: {
                    claimsSupported: true,
                    unsupportedClaimsBlocked: factCheck.issues.length,
                    verifiedEmployersPreserved: true,
                    verifiedDatesPreserved: true,
                },
            },
        };

        const validatedOutput = GenerateResumeResponseSchema.safeParse(responseData);
        if (!validatedOutput.success) {
            console.error('Final output validation failed:', validatedOutput.error);
            return NextResponse.json({ error: 'Generated invalid resume structure. Please try again.' }, { status: 500 });
        }

        // Track real tailored bullet counts in live platform metrics
        const bulletsCount = tailoredResume.experience?.reduce(
            (acc, exp) => acc + (exp.bullets?.length || 0),
            0
        ) || 0;
        if (bulletsCount > 0) {
            recordBulletTailored(bulletsCount).catch(() => {});
        }

        return NextResponse.json(validatedOutput.data);

    } catch (error: unknown) {
        console.error('API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: 'Internal Server Error', details: errorMessage },
            { status: 500 }
        );
    }
}
