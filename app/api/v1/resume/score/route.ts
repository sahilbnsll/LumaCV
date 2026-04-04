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

        const required = computeCategoryScore(haystack, jdKeywords.required_skills, 0.4);
        const preferred = computeCategoryScore(haystack, jdKeywords.preferred_skills, 0.2);
        const responsibilities = computeCategoryScore(haystack, jdKeywords.responsibilities, 0.25);
        const buzzwords = computeCategoryScore(haystack, jdKeywords.buzzwords, 0.15);

        const totalScore = Math.min(1, required.score + preferred.score + responsibilities.score + buzzwords.score);

        const pct = (matched: number, total: number) => (total > 0 ? Math.round((matched / total) * 100) : 100);

        return NextResponse.json({
            score: Math.round(totalScore * 100) / 100,
            breakdown: {
                required_skills: {
                    matched: required.matched,
                    missing: required.missing,
                    ratio: pct(required.matched.length, jdKeywords.required_skills.length),
                    weightPercent: 40,
                    weightedContribution: Math.round(required.score * 1000) / 1000,
                },
                preferred_skills: {
                    matched: preferred.matched,
                    missing: preferred.missing,
                    ratio: pct(preferred.matched.length, jdKeywords.preferred_skills.length),
                    weightPercent: 20,
                    weightedContribution: Math.round(preferred.score * 1000) / 1000,
                },
                responsibilities: {
                    matched: responsibilities.matched,
                    missing: responsibilities.missing,
                    ratio: pct(responsibilities.matched.length, jdKeywords.responsibilities.length),
                    weightPercent: 25,
                    weightedContribution: Math.round(responsibilities.score * 1000) / 1000,
                },
                buzzwords: {
                    matched: buzzwords.matched,
                    missing: buzzwords.missing,
                    ratio: pct(buzzwords.matched.length, jdKeywords.buzzwords.length),
                    weightPercent: 15,
                    weightedContribution: Math.round(buzzwords.score * 1000) / 1000,
                },
            },
        });
    } catch (error) {
        console.error('Score Error:', error);
        return NextResponse.json({ error: 'Failed to compute score' }, { status: 500 });
    }
}
