import { AnalyzeJDResponse, AnalyzeJDResponseSchema } from '@/lib/resume-schema';

function isObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function cleanString(s: string): string {
    const trimmed = s.trim();
    if (!trimmed) return '';
    // Reject "[object Object]", "[object ...]", etc.
    if (/^\[object\b/i.test(trimmed) || /\[object\s+object\]/i.test(trimmed)) {
        return '';
    }
    // Clean leading bullets or list numbering like "1. ", "1) ", "- ", "• "
    const unbulleted = trimmed.replace(/^[-*•\s]+|^\(?\d+[\.\)]\s+/, '').trim();
    if (unbulleted.length < 2 || unbulleted.length > 150) return '';
    if (/^\[object\b/i.test(unbulleted) || /\[object\s+object\]/i.test(unbulleted)) {
        return '';
    }
    return unbulleted;
}

function extractString(item: unknown): string {
    if (item === null || item === undefined) return '';
    if (typeof item === 'string') return cleanString(item);
    if (typeof item === 'number' || typeof item === 'boolean') return cleanString(String(item));
    if (isObject(item)) {
        // Check standard skill/keyword fields
        const candidate =
            item.skill ??
            item.name ??
            item.title ??
            item.keyword ??
            item.requirement ??
            item.item ??
            item.value ??
            item.text ??
            item.technology ??
            item.competency ??
            item.description;
        if (typeof candidate === 'string') {
            const cleaned = cleanString(candidate);
            if (cleaned) return cleaned;
        }
        // Fallback: look for any string property in the object
        for (const val of Object.values(item)) {
            if (typeof val === 'string') {
                const cleaned = cleanString(val);
                if (cleaned) return cleaned;
            }
        }
    }
    return '';
}

export function stringArray(v: unknown): string[] {
    if (!v) return [];

    let items: unknown[] = [];
    if (Array.isArray(v)) {
        items = v;
    } else if (typeof v === 'string') {
        // In case the model or caller returned a delimited string instead of array
        items = v.split(/[\n,;•]+/).map(s => s.trim()).filter(Boolean);
    } else if (isObject(v)) {
        // If an object of grouped categories was passed, e.g. { languages: [...], frameworks: [...] }
        items = Object.values(v).flat();
    } else {
        items = [v];
    }

    const seen = new Set<string>();
    const result: string[] = [];

    for (const rawItem of items) {
        const str = extractString(rawItem);
        if (str && !seen.has(str.toLowerCase())) {
            seen.add(str.toLowerCase());
            result.push(str);
        }
    }

    return result;
}

/** Coerce LLM output into AnalyzeJDResponseSchema shape. */
export function normalizeAnalyzeJDFromLLM(raw: unknown): AnalyzeJDResponse {
    const base = isObject(raw) ? raw : {};

    const candidate: Record<string, unknown> = {
        required_skills: stringArray(base.required_skills ?? base.requiredSkills ?? base.skills),
        preferred_skills: stringArray(base.preferred_skills ?? base.preferredSkills ?? base.bonus_skills),
        responsibilities: stringArray(base.responsibilities ?? base.duties ?? base.roles),
        buzzwords: stringArray(base.buzzwords ?? base.keywords ?? base.methodologies),
    };

    const seniority = base.seniority_level ?? base.seniorityLevel ?? base.seniority;
    if (typeof seniority === 'string' && seniority.trim()) {
        const cleanedSeniority = cleanString(seniority);
        if (cleanedSeniority) candidate.seniority_level = cleanedSeniority;
    }

    return AnalyzeJDResponseSchema.parse(candidate);
}
