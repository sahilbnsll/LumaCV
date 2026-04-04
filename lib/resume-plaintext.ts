import type { ResumeData } from '@/lib/resume-schema';

/** Flatten structured resume into searchable text for JD keyword matching. */
export function resumeDataToPlainText(data: ResumeData): string {
    const parts: string[] = [];
    const pi = data.personalInfo;
    if (pi?.name) parts.push(pi.name);
    if (pi?.title) parts.push(pi.title);
    if (pi?.tagline) parts.push(pi.tagline);
    if (data.summary) parts.push(data.summary);
    for (const s of data.skills ?? []) {
        parts.push(s.category, s.items);
    }
    for (const e of data.experience ?? []) {
        parts.push(e.title, e.company, e.location ?? '', e.dates, ...e.bullets);
    }
    const ed = data.education;
    if (ed) {
        parts.push(ed.institution, ed.degree, ed.dates, ed.gpa ?? '');
    }
    parts.push(...(data.certifications ?? []));
    return parts.filter(Boolean).join('\n');
}
