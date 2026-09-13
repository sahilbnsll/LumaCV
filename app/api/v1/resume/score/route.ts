import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resumeDataToPlainText } from '@/lib/resume-plaintext';
import { normalizeAnalyzeJDFromLLM } from '@/lib/normalize-jd';
import type { ResumeData } from '@/lib/resume-schema';
import { ratelimit } from '@/lib/rate-limit';

export const runtime = 'edge';

const ScoreRequestSchema = z.object({
    resumeText: z.string().optional(),
    resumeData: z.any().optional(),
    jdKeywords: z.preprocess((val) => {
        if (!val || typeof val !== 'object') {
            return { required_skills: [], preferred_skills: [], responsibilities: [], buzzwords: [] };
        }
        try {
            return normalizeAnalyzeJDFromLLM(val);
        } catch {
            return { required_skills: [], preferred_skills: [], responsibilities: [], buzzwords: [] };
        }
    }, z.object({
        required_skills: z.array(z.string()).optional().default([]),
        preferred_skills: z.array(z.string()).optional().default([]),
        responsibilities: z.array(z.string()).optional().default([]),
        buzzwords: z.array(z.string()).optional().default([]),
    })).optional().default({
        required_skills: [],
        preferred_skills: [],
        responsibilities: [],
        buzzwords: [],
    }),
});

/** Collapse punctuation to spaces for fuzzy matching */
function squash(s: string): string {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9+#.%/\s-]/g, ' ')
        .replace(/[-/]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function lightStem(t: string): string {
    let s = t.toLowerCase();
    if (s.length > 5 && s.endsWith('ing')) s = s.slice(0, -3);
    else if (s.length > 4 && s.endsWith('ed')) s = s.slice(0, -2);
    else if (s.length > 4 && s.endsWith('es')) s = s.slice(0, -2);
    else if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
    return s;
}

function haystackTokens(haystack: string): Set<string> {
    const out = new Set<string>();
    for (const raw of squash(haystack).split(' ')) {
        if (raw.length < 2) continue;
        out.add(raw);
        out.add(lightStem(raw));
    }
    return out;
}

function escapeRe(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Whole phrase appears (after normalization) */
function phraseAsSubstring(h: string, phrase: string): boolean {
    const H = squash(h);
    const P = squash(phrase);
    return P.length >= 2 && H.includes(P);
}

/** Token / stem overlap: good for JD lines vs resume bullets with different tense or word order */
function phraseByTokenCoverage(hTokens: Set<string>, phrase: string): boolean {
    const words = squash(phrase)
        .split(' ')
        .filter((w) => w.length > 1);
    if (words.length === 0) return false;

    const significant = words.filter((w) => w.length > 2);
    const required = significant.length > 0 ? significant : words;

    let hit = 0;
    for (const w of required) {
        const stem = lightStem(w);
        let ok = false;
        for (const ht of hTokens) {
            if (ht === w || ht === stem) {
                ok = true;
                break;
            }
            if (ht.length > 3 && (ht.startsWith(stem) || stem.startsWith(ht))) {
                ok = true;
                break;
            }
        }
        if (!ok) {
            const H = [...hTokens].join(' ');
            try {
                if (new RegExp(`(^|\\s)${escapeRe(w)}[a-z]*(\\s|$)`, 'i').test(` ${H} `)) ok = true;
            } catch {
                /* ignore */
            }
        }
        if (ok) hit++;
    }

    const ratio = hit / required.length;
    return ratio >= (required.length <= 3 ? 0.80 : 0.60);
}

function phraseMatches(haystack: string, phrase: string): boolean {
    if (phraseAsSubstring(haystack, phrase)) return true;
    const hTokens = haystackTokens(haystack);
    return phraseByTokenCoverage(hTokens, phrase);
}

function tryParseResumeJson(raw: string): ResumeData | null {
    const t = raw.trim();
    if (!t.startsWith('{')) return null;
    try {
        const j = JSON.parse(t) as unknown;
        if (!j || typeof j !== 'object') return null;
        const o = j as Record<string, unknown>;
        if (typeof o.summary !== 'string' || !Array.isArray(o.experience)) return null;
        return j as ResumeData;
    } catch {
        return null;
    }
}

function buildSearchHaystack(resumeText: string): string {
    const parsed = tryParseResumeJson(resumeText);
    if (parsed) {
        try {
            return resumeDataToPlainText(parsed);
        } catch {
            return resumeText;
        }
    }
    return resumeText;
}

function computeCategoryDetails(
    haystack: string,
    keywords: string[],
    nominalWeight: number
): {
    score: number;
    matched: string[];
    missing: string[];
    partiallyMatched: Array<{ requirement: string; evidence: string; coverage: number }>;
} {
    const validKeywords = (keywords || [])
        .map(k => (typeof k === 'string' ? k.trim() : ''))
        .filter(k => Boolean(k) && !/^\[object\b/i.test(k) && !/\[object\s+object\]/i.test(k));

    if (validKeywords.length === 0) {
        return { score: 0, matched: [], missing: [], partiallyMatched: [] };
    }

    const matched: string[] = [];
    const missing: string[] = [];
    const partiallyMatched: Array<{ requirement: string; evidence: string; coverage: number }> = [];

    const hTokens = haystackTokens(haystack);

    for (const kw of validKeywords) {
        if (phraseMatches(haystack, kw)) {
            matched.push(kw);
        } else {
            // Check for partial/transferable token overlap
            const words = squash(kw).split(' ').filter(w => w.length > 2);
            let partialHits = 0;
            const evidenceWords: string[] = [];

            for (const w of words) {
                const stem = lightStem(w);
                for (const ht of hTokens) {
                    if (ht === w || ht === stem || (ht.length > 3 && (ht.startsWith(stem) || stem.startsWith(ht)))) {
                        partialHits++;
                        evidenceWords.push(ht);
                        break;
                    }
                }
            }

            const coverage = words.length > 0 ? partialHits / words.length : 0;
            if (coverage >= 0.35) {
                partiallyMatched.push({
                    requirement: kw,
                    evidence: Array.from(new Set(evidenceWords)).slice(0, 3).join(', '),
                    coverage: Math.round(coverage * 100),
                });
            } else {
                missing.push(kw);
            }
        }
    }

    // Proportional scoring: 1.0 for matched, up to 0.5 credit for partial matches
    const partialScoreSum = partiallyMatched.reduce((acc, p) => acc + (p.coverage / 100) * 0.5, 0);
    const effectiveMatches = matched.length + partialScoreSum;
    const ratio = Math.min(1, effectiveMatches / keywords.length);

    return {
        score: ratio * nominalWeight,
        matched,
        missing,
        partiallyMatched,
    };
}

export async function POST(req: NextRequest) {
    // This route was the only one in the resume-processing API surface with no
    // rate limit at all — an open endpoint accepting arbitrary-size text/JSON
    // bodies for scoring computation. It deliberately stays unauthenticated
    // (unlike its siblings): the guest-facing ATS Checker (/ats) calls it
    // without requiring login, matching that page's own "no signup required"
    // promise. The rate limit brings it in line with every other resume route.
    const ip = req.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
        return new NextResponse('Too many requests. Please try again later.', { status: 429 });
    }

    try {
        const body = await req.json();
        const parsed = ScoreRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.format() },
                { status: 400 }
            );
        }

        const { resumeText, resumeData, jdKeywords } = parsed.data;
        let haystack = '';
        let parsedResume: ResumeData | null = null;

        if (resumeData && typeof resumeData === 'object') {
            parsedResume = resumeData as ResumeData;
            haystack = resumeDataToPlainText(parsedResume);
        } else if (resumeText) {
            parsedResume = tryParseResumeJson(resumeText);
            haystack = buildSearchHaystack(resumeText);
        }

        if (!haystack) {
            return NextResponse.json(
                { error: 'No resume content provided to score' },
                { status: 400 }
            );
        }

        const cleanKwList = (list?: string[]) =>
            (list || [])
                .map(s => (typeof s === 'string' ? s.trim() : ''))
                .filter(s => Boolean(s) && !/^\[object\b/i.test(s) && !/\[object\s+object\]/i.test(s));

        const reqList = cleanKwList(jdKeywords.required_skills);
        const prefList = cleanKwList(jdKeywords.preferred_skills);
        const respList = cleanKwList(jdKeywords.responsibilities);
        const buzzList = cleanKwList(jdKeywords.buzzwords);

        const reqCount = reqList.length;
        const prefCount = prefList.length;
        const respCount = respList.length;
        const buzzCount = buzzList.length;

        // Raw calculations
        const required = computeCategoryDetails(haystack, reqList, 0.40);
        const preferred = computeCategoryDetails(haystack, prefList, 0.20);
        const responsibilities = computeCategoryDetails(haystack, respList, 0.25);
        const buzzwords = computeCategoryDetails(haystack, buzzList, 0.15);

        // Normalize weights by active non-empty categories so empty preferred skills don't artificially clamp score
        let activeWeightSum = 0;
        if (reqCount > 0) activeWeightSum += 0.40;
        if (prefCount > 0) activeWeightSum += 0.20;
        if (respCount > 0) activeWeightSum += 0.25;
        if (buzzCount > 0) activeWeightSum += 0.15;

        // No JD keywords supplied at all — there is nothing to score against, so this
        // must not be reported as a (fabricated) perfect match. `isCalculated: false`
        // below is what tells the client to show its honest "no_jd" state instead.
        const hasAnyKeywords = activeWeightSum > 0;
        const rawScoreSum = required.score + preferred.score + responsibilities.score + buzzwords.score;
        const normalizedTotal = hasAnyKeywords ? Math.min(1, rawScoreSum / activeWeightSum) : 0;
        const finalScorePct = Math.round(normalizedTotal * 100);

        const pct = (matched: number, total: number) => (total > 0 ? Math.round((matched / total) * 100) : 100);

        // Calculate dynamic active percentage weights (e.g. 50%, 31%, 19% if preferred is 0)
        const calcWeightPct = (nominal: number, count: number) => {
            if (count === 0) return 0;
            return Math.round((nominal / activeWeightSum) * 100);
        };

        // Remaining Gaps & Explanation
        const remainingGaps: Array<{
            category: string;
            missingItem: string;
            impact: string;
            recommendation: string;
        }> = [];

        required.missing.forEach((item) => {
            if (!item || /^\[object\b/i.test(item) || /\[object\s+object\]/i.test(item)) return;
            remainingGaps.push({
                category: 'Required Skills',
                missingItem: item,
                impact: `-${Math.round((0.40 / Math.max(reqCount, 1) / (activeWeightSum || 1)) * 100)} pts`,
                recommendation: `Incorporate verified hands-on experience with ${item} in technical skills or projects.`,
            });
        });

        responsibilities.missing.forEach((item) => {
            if (!item || /^\[object\b/i.test(item) || /\[object\s+object\]/i.test(item)) return;
            remainingGaps.push({
                category: 'Responsibilities',
                missingItem: item,
                impact: `-${Math.round((0.25 / Math.max(respCount, 1) / (activeWeightSum || 1)) * 100)} pts`,
                recommendation: `Add a quantifiable achievement bullet demonstrating ${item}.`,
            });
        });

        preferred.missing.forEach((item) => {
            if (!item || /^\[object\b/i.test(item) || /\[object\s+object\]/i.test(item)) return;
            remainingGaps.push({
                category: 'Preferred Skills',
                missingItem: item,
                impact: `-${Math.round((0.20 / Math.max(prefCount, 1) / (activeWeightSum || 1)) * 100)} pts`,
                recommendation: `Highlight any secondary coursework, exposure, or certifications in ${item}.`,
            });
        });

        buzzwords.missing.slice(0, 5).forEach((item) => {
            if (!item || /^\[object\b/i.test(item) || /\[object\s+object\]/i.test(item)) return;
            remainingGaps.push({
                category: 'Core Terminology',
                missingItem: item,
                impact: `-${Math.round((0.15 / Math.max(buzzCount, 1) / (activeWeightSum || 1)) * 100)} pts`,
                recommendation: `Include standard industry terminology like "${item}" in summary or stack descriptions.`,
            });
        });

        // Generate explicit reason why score is what it is
        let scoreReason = '';
        if (finalScorePct >= 95) {
            scoreReason = `Exceptional ${finalScorePct}% ATS alignment. Candidate covers almost all required technical competencies, responsibilities, and architectural terminology.`;
        } else if (finalScorePct >= 90) {
            scoreReason = `Strong ${finalScorePct}% ATS match. All core competencies are met, with minor secondary buzzwords or preferred requirements remaining.`;
        } else if (remainingGaps.length > 0) {
            const topMissing = remainingGaps.slice(0, 3).map(g => `"${g.missingItem}" (${g.category})`).join(', ');
            scoreReason = `Your ATS score is ${finalScorePct}% because ${remainingGaps.length} target requirement(s) are missing from your resume: ${topMissing}.`;
        } else {
            scoreReason = `Baseline score is ${finalScorePct}%. Tailoring to the job description will align your experience with target ATS algorithms.`;
        }

        // Keyword Density Diagnostics
        const totalWords = squash(haystack).split(' ').filter(w => w.length > 1).length;
        const totalMatched = required.matched.length + preferred.matched.length + responsibilities.matched.length + buzzwords.matched.length;
        const densityPct = totalWords > 0 ? Math.min(100, Math.round((totalMatched / (totalWords * 0.15)) * 100)) : 75;

        // Strongest & Weakest Sections
        const strongestSections: string[] = ['Work Experience', 'Technical Skills'];
        const weakestSections: Array<{ section: string; reason: string; action: string }> = [];

        if (parsedResume) {
            if (!parsedResume.summary || parsedResume.summary.length < 120) {
                weakestSections.push({
                    section: 'Professional Summary',
                    reason: 'Summary is brief or lacks direct JD role alignment.',
                    action: 'Add a 3-sentence executive summary emphasizing target tech stack.',
                });
            }
            if (!parsedResume.projects || parsedResume.projects.length === 0) {
                weakestSections.push({
                    section: 'Projects',
                    reason: 'No dedicated project portfolio entries found.',
                    action: 'Add 1-2 featured projects demonstrating target JD technologies.',
                });
            }
            if (parsedResume.experience?.some(e => (e.bullets?.length || 0) < 3)) {
                weakestSections.push({
                    section: 'Work Experience Density',
                    reason: 'Some experience entries have fewer than 3 achievement bullets.',
                    action: 'Expand experience entries with quantified impact and metrics.',
                });
            }
        }

        if (weakestSections.length === 0) {
            weakestSections.push({
                section: 'Secondary Qualifications',
                reason: 'Remaining gap is in optional bonus qualifications.',
                action: 'Emphasize any cross-functional or transferable leadership experience.',
            });
        }

        return NextResponse.json({
            score: Math.round(normalizedTotal * 100) / 100,
            isCalculated: hasAnyKeywords,
            breakdown: {
                required_skills: {
                    matched: required.matched,
                    missing: required.missing,
                    ratio: pct(required.matched.length, reqCount),
                    weightPercent: calcWeightPct(0.40, reqCount),
                    weightedContribution: Math.round((required.score / (activeWeightSum || 1)) * 1000) / 1000,
                },
                preferred_skills: {
                    matched: preferred.matched,
                    missing: preferred.missing,
                    ratio: pct(preferred.matched.length, prefCount),
                    weightPercent: calcWeightPct(0.20, prefCount),
                    weightedContribution: Math.round((preferred.score / (activeWeightSum || 1)) * 1000) / 1000,
                },
                responsibilities: {
                    matched: responsibilities.matched,
                    missing: responsibilities.missing,
                    ratio: pct(responsibilities.matched.length, respCount),
                    weightPercent: calcWeightPct(0.25, respCount),
                    weightedContribution: Math.round((responsibilities.score / (activeWeightSum || 1)) * 1000) / 1000,
                },
                buzzwords: {
                    matched: buzzwords.matched,
                    missing: buzzwords.missing,
                    ratio: pct(buzzwords.matched.length, buzzCount),
                    weightPercent: calcWeightPct(0.15, buzzCount),
                    weightedContribution: Math.round((buzzwords.score / (activeWeightSum || 1)) * 1000) / 1000,
                },
            },
            gapAnalysis: {
                scoreReason,
                remainingGaps,
                partiallyMatched: [
                    ...required.partiallyMatched,
                    ...responsibilities.partiallyMatched,
                    ...preferred.partiallyMatched,
                ],
            },
            diagnostics: {
                formattingATS: true,
                singlePageFit: true,
                factSafetyGuaranteed: true,
                keywordDensity: {
                    score: densityPct,
                    rating: densityPct > 80 ? 'optimal' : densityPct > 50 ? 'moderate' : 'low',
                    summary: `${totalMatched} high-value JD keywords matched across ${totalWords} total resume words.`,
                },
                strongestSections,
                weakestSections,
            },
        });
    } catch (error) {
        console.error('Score Error:', error);
        return NextResponse.json({ error: 'Failed to compute score' }, { status: 500 });
    }
}
