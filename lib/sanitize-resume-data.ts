import { ResumeData } from './resume-schema';

/**
 * The real, recurring bug across two "fixes" that each turned out
 * incomplete: individual `.trim()` call sites scattered across
 * typst-generator.ts, docx-generator.ts, and every page that builds a
 * resume export (editor, builder step 4, demo, dashboard) each had to be
 * separately guarded against a field that isn't actually a string (an
 * AI-tailored field that ended up an array/object), and each time another
 * unguarded call site turned up somewhere else. That's the wrong shape of
 * fix, chasing call sites instead of the data.
 *
 * This sanitizes a ResumeData object ONCE, at every real entry point
 * (the compile API route server-side, exportResume() client-side before
 * any format branches), so every string field is guaranteed to actually
 * be a string and every array field is guaranteed to only contain the
 * item type it's supposed to, no matter which page or flow produced the
 * data or which field ended up malformed. Downstream code (typst-
 * generator, docx-generator, markdown export) can then use `.trim()`,
 * template literals, etc. on these fields without individually guarding
 * every single one.
 */

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function strOrUndef(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function strArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string');
}

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export function sanitizeResumeData(input: unknown): ResumeData {
  const data = obj(input);
  const p = obj(data.personalInfo);

  const sanitizeEntry = <T extends Record<string, unknown>>(
    item: unknown,
    stringKeys: (keyof T)[],
    arrayKeys: (keyof T)[] = []
  ): T => {
    const o = obj(item);
    const out: Record<string, unknown> = { ...o };
    for (const k of stringKeys) out[k as string] = str(o[k as string]);
    for (const k of arrayKeys) out[k as string] = strArray(o[k as string]);
    return out as T;
  };

  return {
    personalInfo: {
      name: str(p.name) || 'Your Name',
      title: strOrUndef(p.title),
      email: strOrUndef(p.email),
      phone: strOrUndef(p.phone),
      location: strOrUndef(p.location),
      linkedin: strOrUndef(p.linkedin),
      github: strOrUndef(p.github),
      portfolio: strOrUndef(p.portfolio),
      tagline: strOrUndef((p as any).tagline),
    } as ResumeData['personalInfo'],
    summary: str(data.summary),
    techStackSummary: strOrUndef(data.techStackSummary),
    sectionOrder: Array.isArray(data.sectionOrder) ? (data.sectionOrder as ResumeData['sectionOrder']) : undefined,
    skills: arr<any>(data.skills).map((s) => ({
      id: strOrUndef(obj(s).id),
      category: str(obj(s).category) || 'Skills',
      items: str(obj(s).items),
    })),
    keyMetrics: arr<any>(data.keyMetrics).map((m) =>
      sanitizeEntry(m, ['label', 'value', 'context'])
    ),
    experience: arr<any>(data.experience).map((e) => ({
      ...sanitizeEntry(e, ['id', 'title', 'company', 'location', 'startDate', 'endDate', 'dates', 'description', 'technologies', 'companyUrl', 'impact']),
      bullets: strArray(obj(e).bullets),
      impactBullets: strArray(obj(e).impactBullets),
      highlights: strArray(obj(e).highlights),
    })),
    internships: arr<any>(data.internships).map((e) => ({
      ...sanitizeEntry(e, ['id', 'title', 'company', 'location', 'startDate', 'endDate', 'dates', 'description', 'technologies', 'companyUrl', 'impact']),
      bullets: strArray(obj(e).bullets),
      impactBullets: strArray(obj(e).impactBullets),
      highlights: strArray(obj(e).highlights),
    })),
    education: arr<any>(data.education).map((e) =>
      sanitizeEntry(e, ['id', 'institution', 'degree', 'fieldOfStudy', 'location', 'startDate', 'endDate', 'dates', 'gpa', 'coursework', 'honors'])
    ),
    projects: arr<any>(data.projects).map((pr) => ({
      ...sanitizeEntry(pr, ['id', 'name', 'description', 'techStack', 'role', 'startDate', 'endDate', 'dates', 'impact', 'link']),
      bullets: strArray(obj(pr).bullets),
      impactBullets: strArray(obj(pr).impactBullets),
      highlights: strArray(obj(pr).highlights),
    })),
    certifications: arr<any>(data.certifications).map((c) =>
      sanitizeEntry(c, ['id', 'name', 'issuer', 'date', 'expiryDate', 'credentialId', 'link'])
    ),
    achievements: arr<any>(data.achievements).map((a) =>
      sanitizeEntry(a, ['id', 'name', 'context', 'date', 'rank', 'description', 'link'])
    ),
    publications: arr<any>(data.publications).map((pub) =>
      sanitizeEntry(pub, ['title', 'platform', 'date', 'authors', 'description', 'link'])
    ),
    openSource: arr<any>(data.openSource).map((os) => ({
      ...sanitizeEntry(os, ['project', 'contribution', 'dates', 'impact', 'link']),
      bullets: strArray(obj(os).bullets),
    })),
    leadership: arr<any>(data.leadership).map((l) => ({
      ...sanitizeEntry(l, ['role', 'organization', 'location', 'dates']),
      bullets: strArray(obj(l).bullets),
    })),
    volunteering: arr<any>(data.volunteering).map((v) => ({
      ...sanitizeEntry(v, ['role', 'organization', 'location', 'dates']),
      bullets: strArray(obj(v).bullets),
    })),
    conferences: arr<any>(data.conferences).map((c) =>
      sanitizeEntry(c, ['name', 'topic', 'role', 'date', 'location', 'description', 'link'])
    ),
    languages: arr<any>(data.languages).map((l) => sanitizeEntry(l, ['language', 'proficiency'])),
    interests: arr<any>(data.interests).map((i) => sanitizeEntry(i, ['name', 'details'])),
    products: arr<any>(data.products).map((pr) => sanitizeEntry(pr, ['name', 'responsibility', 'scale', 'impact'])),
    devopsContributions: strArray(data.devopsContributions),
    securityContributions: strArray(data.securityContributions),
    additionalInfo: sanitizeEntry(data.additionalInfo, ['availability', 'workAuthorization', 'relocation', 'travel', 'notes']),
    customSections: arr<any>(data.customSections).map((s) => ({
      title: str(obj(s).title) || 'Section',
      items: strArray(obj(s).items),
    })),
    confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : undefined,
  } as ResumeData;
}
