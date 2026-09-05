import { AnalyzeJDResponse, AnalyzeJDResponseSchema } from '@/lib/resume-schema';

function stringArray(v: unknown): string[] {
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x).trim()).filter(Boolean);
}

/** Coerce LLM output into AnalyzeJDResponseSchema shape. */
export function normalizeAnalyzeJDFromLLM(raw: unknown): AnalyzeJDResponse {
    const base =
        typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};

    const candidate: Record<string, unknown> = {
        required_skills: stringArray(base.required_skills),
        preferred_skills: stringArray(base.preferred_skills),
        responsibilities: stringArray(base.responsibilities),
        buzzwords: stringArray(base.buzzwords),
    };

    if (typeof base.seniority_level === 'string' && base.seniority_level.trim()) {
        candidate.seniority_level = base.seniority_level.trim();
    }

    return AnalyzeJDResponseSchema.parse(candidate);
}
