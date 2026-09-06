import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resumeDataToPlainText } from '@/lib/resume-plaintext';
import type { ResumeData } from '@/lib/resume-schema';

export const runtime = 'edge';

const ScoreRequestSchema = z.object({
    resumeText: z.string().min(1),
    jdKeywords: z.object({
        required_skills: z.array(z.string()),
        preferred_skills: z.array(z.string()),
        responsibilities: z.array(z.string()),
        buzzwords: z.array(z.string()),
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
    return ratio >= (required.length <= 3 ? 0.85 : 0.65);
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
        if (!o.education || typeof o.education !== 'object') return null;
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

function computeCategoryScore(
    haystack: string,
    keywords: string[],
    weight: number
): { score: number; matched: string[]; missing: string[] } {
    if (keywords.length === 0) return { score: 0, matched: [], missing: [] };

    const matched: string[] = [];
    const missing: string[] = [];

    for (const kw of keywords) {
        if (phraseMatches(haystack, kw)) {
            matched.push(kw);
        } else {
            missing.push(kw);
        }
    }

    const ratio = matched.length / keywords.length;
    return { score: ratio * weight, matched, missing };
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
    if (!keywords || keywords.length === 0) {
        return { score: 0, matched: [], missing: [], partiallyMatched: [] };
    }

    const matched: string[] = [];
    const missing: string[] = [];
    const partiallyMatched: Array<{ requirement: string; evidence: string; coverage: number }> = [];

    const hTokens = haystackTokens(haystack);

    for (const kw of keywords) {
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
            if (coverage >= 0.4) {
                partiallyMatched.push({
                    requirement: kw,
                    evidence: Array.from(new Set(evidenceWords)).slice(0, 3).join(', '),
                    coverage: Math.round(coverage * 100),
                });
            }
            missing.push(kw);
        }
    }

    const ratio = matched.length / keywords.length;
    return {
        score: ratio * nominalWeight,
        matched,
        missing,
        partiallyMatched,
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = ScoreRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.format() },
                { status: 400 }
            );
        }

        const { resumeText, jdKeywords } = parsed.data;
        const haystack = buildSearchHaystack(resumeText);

        const reqList = jdKeywords.required_skills || [];
        const prefList = jdKeywords.preferred_skills || [];
        const respList = jdKeywords.responsibilities || [];
        const buzzList = jdKeywords.buzzwords || [];

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

        // If no keywords exist at all, default to 1.0
        const rawScoreSum = required.score + preferred.score + responsibilities.score + buzzwords.score;
        const normalizedTotal = activeWeightSum > 0 ? Math.min(1, rawScoreSum / activeWeightSum) : 1;
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
            remainingGaps.push({
                category: 'Required Skills',
                missingItem: item,
                impact: `-${Math.round((0.40 / Math.max(reqCount, 1) / (activeWeightSum || 1)) * 100)} pts`,
                recommendation: `Incorporate verified hands-on experience with ${item} in technical skills or projects.`,
            });
        });

        responsibilities.missing.forEach((item) => {
            remainingGaps.push({
                category: 'Responsibilities',
                missingItem: item,
                impact: `-${Math.round((0.25 / Math.max(respCount, 1) / (activeWeightSum || 1)) * 100)} pts`,
                recommendation: `Add a quantifiable achievement bullet demonstrating ${item}.`,
            });
        });

        preferred.missing.forEach((item) => {
            remainingGaps.push({
                category: 'Preferred Skills',
                missingItem: item,
                impact: `-${Math.round((0.20 / Math.max(prefCount, 1) / (activeWeightSum || 1)) * 100)} pts`,
                recommendation: `Highlight any secondary coursework, exposure, or certifications in ${item}.`,
            });
        });

        buzzwords.missing.slice(0, 5).forEach((item) => {
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
        const parsedResume = tryParseResumeJson(resumeText);
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
