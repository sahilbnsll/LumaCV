import { ResumeData, ResumeDataSchema } from '@/lib/resume-schema';

function str(v: unknown): string {
    if (v === null || v === undefined) return '';
    return String(v).trim();
}

/** LLMs / parsers often emit `education` as an array or use alternate field names. */
function coerceEducation(raw: unknown): ResumeData['education'] {
    let ed: Record<string, unknown> = {};
    if (Array.isArray(raw)) {
        const first = raw.find((x) => typeof x === 'object' && x !== null) as Record<string, unknown> | undefined;
        if (first) ed = first;
    } else if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
        ed = raw as Record<string, unknown>;
    }

    const institution =
        str(ed.institution ?? ed.school ?? ed.university ?? ed.college ?? ed.name) || 'Institution';
    const degree =
        str(ed.degree ?? ed.program ?? ed.major ?? ed.fieldOfStudy ?? ed.field) || 'Degree';
    const dates =
        str(ed.dates ?? ed.year ?? ed.graduationDate ?? ed.endDate ?? ed.period) || 'Dates';
    const gpa = str(ed.gpa) || undefined;

    return { institution, degree, dates, gpa };
}

/**
 * Coerce messy LLM JSON into data that passes ResumeDataSchema.
 * Handles missing keys, empty bullets, short summaries, and minor type drift.
 */
export function normalizeResumeFromLLM(raw: unknown): ResumeData {
    const base =
        typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};

    const piRaw = base.personalInfo;
    const pi =
        typeof piRaw === 'object' && piRaw !== null
            ? (piRaw as Record<string, unknown>)
            : {};

    const name = str(pi.name) || 'Unknown';
    const title = str(pi.title) || undefined;
    const tagline = str(pi.tagline) || undefined;
    const phone = str(pi.phone) || undefined;
    const email = str(pi.email) || undefined;
    const linkedin = str(pi.linkedin) || undefined;
    const portfolio = str(pi.portfolio) || undefined;

    let summary = str(base.summary);
    if (summary.length < 10) {
        summary =
            summary.length > 0
                ? `${summary} — Please review and expand this summary.`
                : 'Professional background summarized from your resume. Please review and edit.';
    }

    let skills: ResumeData['skills'] = [];
    if (Array.isArray(base.skills)) {
        for (const s of base.skills) {
            if (typeof s !== 'object' || s === null) continue;
            const o = s as Record<string, unknown>;
            const category = str(o.category) || 'General';
            const items = str(o.items) || 'See resume for details';
            skills.push({ category, items });
        }
    }
    if (skills.length === 0) {
        skills = [{ category: 'Skills', items: 'See resume text for details.' }];
    }

    let experience: ResumeData['experience'] = [];
    if (Array.isArray(base.experience)) {
        for (const e of base.experience) {
            if (typeof e !== 'object' || e === null) continue;
            const o = e as Record<string, unknown>;
            let bullets: string[] = [];
            if (Array.isArray(o.bullets)) {
                bullets = o.bullets
                    .map((b) => str(b))
                    .filter((b) => b.length > 0);
            }
            if (bullets.length === 0) {
                bullets = ['Key contributions and responsibilities (please edit).'];
            }
            experience.push({
                title: str(o.title) || 'Position',
                company: str(o.company) || 'Company',
                location: str(o.location) || undefined,
                dates: str(o.dates) || 'Dates',
                bullets,
            });
        }
    }
    if (experience.length === 0) {
        experience = [
            {
                title: 'Experience',
                company: 'See resume',
                dates: '—',
                bullets: ['Details could not be structured automatically — please edit.'],
            },
        ];
    }

    let certifications: string[] = [];
    if (Array.isArray(base.certifications)) {
        certifications = base.certifications.map((c) => str(c)).filter((c) => c.length > 0);
    }

    const education = coerceEducation(base.education);

    let confidenceScore: number | undefined;
    if (typeof base.confidenceScore === 'number' && Number.isFinite(base.confidenceScore)) {
        confidenceScore = Math.min(1, Math.max(0, base.confidenceScore));
    }

    const candidate: ResumeData = {
        personalInfo: {
            name,
            title,
            tagline,
            phone,
            email,
            linkedin,
            portfolio,
        },
        summary,
        skills,
        experience,
        certifications,
        education,
        confidenceScore,
    };

    return ResumeDataSchema.parse(candidate);
}
