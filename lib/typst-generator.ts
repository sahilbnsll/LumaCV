import { DEFAULT_SECTION_ORDER, ResumeData, TemplateType } from './resume-schema';
import { ALL_TEMPLATES } from './templates-data';

// `a || b || ''` only falls through to '' when a and b are falsy, an empty
// array or object is truthy, so a malformed field (e.g. AI-tailored output
// that put an array where a string belongs) reaches `.trim()` on a
// non-string and throws "x.trim is not a function", crashing the whole
// export. Coerce to a real string first so a bad field degrades to '',
// not a hard failure.
function safeTrim(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

export interface TypstPersonalContact {
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  website: string;
  location: string;
}

export interface TypstResumeData {
  personal: {
    name: string;
    headline: string;
    contact: TypstPersonalContact;
  };
  summary: string;
  techStackSummary?: string;
  skills: Array<{ category: string; items: string; skills: string[] }>;
  experience: Array<{
    role: string;
    company: string;
    dates: string;
    location: string;
    bullets: string[];
  }>;
  internships: Array<{
    role: string;
    company: string;
    dates: string;
    location: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    specialization: string;
    institution: string;
    dates: string;
    gpa: string;
    coursework?: string;
    honors?: string;
    location?: string;
  }>;
  projects: Array<{
    name: string;
    /** Tech stack as a comma-separated string */
    stack: string;
    /** Single prose description line */
    description: string;
    /** Project URL / link */
    url: string;
    /** Contributor role (e.g. "Lead Developer") */
    role: string;
    /** Date range string (e.g. "Jan 2024 – Present") */
    dates: string;
    /** Single-line impact summary (backward-compatible) */
    impact: string;
    /** Multi-bullet quantified results / impact */
    impactBullets: string[];
    /** Feature / highlight bullets rendered as a bullet list */
    bullets: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  awards: Array<{
    title: string;
    awarder: string;
    date: string;
    description: string;
    rank?: string;
    url?: string;
  }>;
  achievements: Array<{
    title: string;
    awarder: string;
    date: string;
    description: string;
    rank?: string;
    url?: string;
  }>;
  publications: Array<{
    title: string;
    publisher: string;
    date: string;
    url: string;
    authors?: string;
    description?: string;
    citation?: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  keyMetrics: Array<{
    label: string;
    value: string;
    context?: string;
  }>;
  openSource: Array<{
    project: string;
    contribution: string;
    dates: string;
    impact: string;
    url: string;
    bullets: string[];
  }>;
  leadership: Array<{
    role: string;
    organization: string;
    location: string;
    dates: string;
    bullets: string[];
  }>;
  volunteering: Array<{
    role: string;
    organization: string;
    location: string;
    dates: string;
    bullets: string[];
  }>;
  conferences: Array<{
    name: string;
    topic: string;
    role: string;
    date: string;
    location: string;
    description: string;
    url: string;
  }>;
  interests: Array<{
    name: string;
    details: string;
  }>;
  products: Array<{
    name: string;
    responsibility: string;
    scale: string;
    impact: string;
  }>;
  devopsContributions: string[];
  securityContributions: string[];
  additionalInfo: {
    availability?: string;
    workAuthorization?: string;
    relocation?: string;
    travel?: string;
    notes?: string;
  };
  customSections: Array<{
    title: string;
    items: string[];
  }>;
  sectionOrder: string[];
}

/**
 * Normalizes template names across all 48 supported templates,
 * resolving aliases safely while defaulting to 'modern'.
 */
export function normalizeTemplateName(template?: string): string {
  if (!template) return 'modern';
  const t = template.toLowerCase();
  const found = ALL_TEMPLATES.find((x) => x.id === t);
  if (found) return found.id;
  if (t === 'ats') return 'ats_safe';
  if (t === 'minimal') return 'compact';
  if (t === 'creative') return 'boutique';
  if (t === 'tech') return 'engineering';
  return 'modern';
}

/**
 * Converts LumaCV ResumeData schema into clean, flat Typst resume data.
 * All keys are guaranteed present with sensible empty fallbacks so templates never throw KeyError.
 * Supplies both `items` string and `skills` array for complete backward and forward compatibility.
 */
export function resumeDataToTypstData(data: ResumeData): TypstResumeData {
  const p = data.personalInfo || { name: 'Your Name' };

  const contact: TypstPersonalContact = {
    phone: safeTrim(p.phone),
    email: safeTrim(p.email),
    linkedin: safeTrim(p.linkedin),
    github: safeTrim(p.github),
    website: safeTrim(p.portfolio),
    location: safeTrim(p.location),
  };

  const headline = safeTrim(p.title, p.tagline);

  const skills = (data.skills || []).map((s) => {
    const rawItems = s.items || '';
    const skillsArray = rawItems
      .split(/[,•|·]/)
      .map((x) => x.trim())
      .filter(Boolean);

    return {
      category: s.category || 'Skills',
      items: rawItems,
      skills: skillsArray.length > 0 ? skillsArray : [s.category || 'Skills'],
    };
  });

  const cleanBulletText = (s: unknown) => {
    if (typeof s !== 'string') return '';
    return s.replace(/^\[(?:Highlight|Impact|Feature|Result)[^\]]*\]\s*/i, '').trim();
  };

  const experience = (data.experience || []).map((exp) => {
    const resolvedDates = (() => {
      const sd = safeTrim(exp.startDate);
      const ed = safeTrim(exp.endDate);
      if (sd || ed) return [sd, ed].filter(Boolean).join(' – ');
      return safeTrim(exp.dates);
    })();

    const cleanBullets = (exp.bullets || []).map(cleanBulletText).filter(Boolean);
    const cleanHighlights = (exp.highlights || []).map(cleanBulletText).filter(Boolean);
    const cleanImpactBullets = (exp.impactBullets || []).map(cleanBulletText).filter(Boolean);

    return {
      id: exp.id || '',
      role: exp.title || 'Role',
      company: exp.company || 'Company',
      companyUrl: safeTrim(exp.companyUrl),
      dates: resolvedDates,
      location: safeTrim(exp.location),
      description: safeTrim(exp.description),
      technologies: safeTrim(exp.technologies),
      bullets: cleanBullets,
      highlights: cleanHighlights,
      impactBullets: cleanImpactBullets,
    };
  });

  const internships = (data.internships || []).map((intern) => ({
    role: intern.title || 'Intern',
    company: intern.company || 'Company',
    dates: intern.dates || '',
    location: safeTrim(intern.location),
    bullets: (intern.bullets || []).filter((b): b is string => typeof b === 'string' && b.trim().length > 0),
  }));

  // If experience is empty but internships are provided, use internships in experience so templates don't show empty work experience
  const resolvedExperience = experience.length > 0 ? experience : internships;

  const education = (data.education || []).map((edu) => {
    const resolvedDates = (() => {
      const sd = safeTrim(edu.startDate);
      const ed = safeTrim(edu.endDate);
      if (sd || ed) return [sd, ed].filter(Boolean).join(' – ');
      return safeTrim(edu.dates);
    })();

    return {
      id: edu.id || '',
      degree: edu.degree || 'Degree',
      specialization: safeTrim(edu.fieldOfStudy),
      institution: edu.institution || 'Institution',
      dates: resolvedDates,
      location: safeTrim(edu.location),
      gpa: safeTrim(edu.gpa),
      coursework: safeTrim(edu.coursework),
      honors: safeTrim(edu.honors),
    };
  });

  const projects = (data.projects || []).map((proj) => {
    // Resolve dates, prefer explicit startDate/endDate, fall back to combined dates string
    const resolvedDates = (() => {
      const sd = safeTrim((proj as any).startDate);
      const ed = safeTrim((proj as any).endDate);
      if (sd || ed) return [sd, ed].filter(Boolean).join(' – ');
      return safeTrim(proj.dates);
    })();

    const cleanBullets = (proj.bullets || []).map(cleanBulletText).filter(Boolean);
    const cleanHighlights = (proj.highlights || []).map(cleanBulletText).filter(Boolean);
    const cleanImpactBullets = (proj.impactBullets || []).map(cleanBulletText).filter(Boolean);

    return {
      id: proj.id || '',
      name: proj.name || 'Project',
      stack: safeTrim(proj.techStack),
      // Keep description as a clean prose string, do NOT append bullets in parentheses
      description: safeTrim(proj.description),
      url: safeTrim(proj.link),
      role: safeTrim(proj.role),
      dates: resolvedDates,
      impact: safeTrim(proj.impact),
      // Separate arrays, templates can render them as distinct bullet groups
      impactBullets: cleanImpactBullets,
      highlights: cleanHighlights,
      bullets: cleanBullets,
    };
  });

  const certifications = (data.certifications || []).map((c) => ({
    name: c.name,
    issuer: safeTrim(c.issuer),
    date: safeTrim(c.date),
    url: safeTrim(c.link),
    expiryDate: safeTrim(c.expiryDate),
    credentialId: safeTrim(c.credentialId),
  }));

  const awards = (data.achievements || []).map((a) => ({
    name: a.name,
    title: a.name,
    awarder: safeTrim(a.context, (a as any).awarder),
    context: safeTrim(a.context, (a as any).awarder),
    date: safeTrim(a.date),
    description: safeTrim(a.description),
    rank: safeTrim(a.rank),
    url: safeTrim(a.link, (a as any).url),
    link: safeTrim(a.link, (a as any).url),
  }));

  const publications = (data.publications || []).map((pub) => {
    const title = pub.title;
    const publisher = safeTrim(pub.platform, (pub as any).publisher);
    const date = safeTrim(pub.date);
    const authors = safeTrim(pub.authors);
    const citParts = [
      authors,
      title ? `"${title}"` : '',
      publisher,
      date ? `(${date})` : '',
    ].filter(Boolean);

    return {
      title,
      name: title,
      publisher,
      date,
      authors,
      description: safeTrim(pub.description),
      url: safeTrim(pub.link, (pub as any).url),
      link: safeTrim(pub.link, (pub as any).url),
      citation: citParts.join(', '),
    };
  });

  const languages = (data.languages || []).map((l) => ({
    name: l.language,
    language: l.language,
    proficiency: safeTrim(l.proficiency),
  }));

  const keyMetrics = (data.keyMetrics || []).map((m) => ({
    label: m.label,
    value: m.value,
    context: safeTrim(m.context),
  }));

  const openSource = (data.openSource || []).map((os) => ({
    project: os.project,
    contribution: safeTrim(os.contribution),
    dates: safeTrim(os.dates),
    impact: safeTrim(os.impact),
    url: safeTrim(os.link),
    bullets: (os.bullets || []).filter((b): b is string => typeof b === 'string' && b.trim().length > 0),
  }));

  const leadership = (data.leadership || []).map((l) => ({
    role: l.role,
    organization: l.organization,
    location: safeTrim(l.location),
    dates: safeTrim(l.dates),
    bullets: (l.bullets || []).filter((b): b is string => typeof b === 'string' && b.trim().length > 0),
  }));

  const volunteering = (data.volunteering || []).map((v) => ({
    role: v.role,
    organization: v.organization,
    location: safeTrim(v.location),
    dates: safeTrim(v.dates),
    bullets: (v.bullets || []).filter((b): b is string => typeof b === 'string' && b.trim().length > 0),
  }));

  const conferences = (data.conferences || []).map((c) => ({
    name: c.name,
    topic: safeTrim(c.topic),
    role: safeTrim(c.role),
    date: safeTrim(c.date),
    location: safeTrim(c.location),
    description: safeTrim(c.description),
    url: safeTrim(c.link),
  }));

  const interests = (data.interests || []).map((i) => ({
    name: i.name,
    details: safeTrim(i.details),
  }));

  const products = (data.products || []).map((p) => ({
    name: p.name,
    responsibility: safeTrim(p.responsibility),
    scale: safeTrim(p.scale),
    impact: safeTrim(p.impact),
  }));

  return {
    personal: {
      name: p.name || 'Your Name',
      headline,
      contact,
    },
    summary: safeTrim(data.summary),
    techStackSummary: safeTrim(data.techStackSummary),
    skills,
    experience: resolvedExperience,
    internships,
    education,
    projects,
    certifications,
    awards,
    achievements: awards,
    publications,
    languages,
    keyMetrics,
    openSource,
    leadership,
    volunteering,
    conferences,
    interests,
    products,
    devopsContributions: (data.devopsContributions || []).filter(Boolean),
    securityContributions: (data.securityContributions || []).filter(Boolean),
    additionalInfo: {
      availability: safeTrim(data.additionalInfo?.availability),
      workAuthorization: safeTrim(data.additionalInfo?.workAuthorization),
      relocation: safeTrim(data.additionalInfo?.relocation),
      travel: safeTrim(data.additionalInfo?.travel),
      notes: safeTrim(data.additionalInfo?.notes),
    },
    customSections: (data.customSections || []).map((cs) => ({
      title: cs.title,
      items: (cs.items || []).filter(Boolean),
    })),
    sectionOrder: (data.sectionOrder && data.sectionOrder.length > 0) ? data.sectionOrder : [...DEFAULT_SECTION_ORDER],
  };
}

/**
 * Returns a complete, standalone Typst document as a string across any of the 48 templates.
 */
export function generateTypst(
  data: ResumeData,
  template: TemplateType = 'modern',
  theme: string = 'none'
): string {
  const typstData = resumeDataToTypstData(data);
  const jsonString = JSON.stringify(typstData, null, 2);

  const tmplSlug = normalizeTemplateName(template);
  const tmplObj = ALL_TEMPLATES.find((t) => t.id === tmplSlug) || ALL_TEMPLATES.find((t) => t.id === 'modern')!;

  const defaultTheme =
    tmplSlug === 'two_column' ? 'two-column' : tmplSlug === 'ats_safe' ? 'ats-safe' : tmplSlug;
  const themeArg = theme && theme !== 'none' ? `"${theme}"` : `"${defaultTheme}"`;

  // Escape backtick triples inside the JSON (extremely rare in practice, but safe to handle).
  const safeJson = jsonString.replace(/`{3,}/g, '` ` `');

  return `// =============================================================================
// LumaCV Generated Resume (Typst)
// Template: ${tmplObj.name} (${tmplObj.id})
// =============================================================================

#import "/templates/${tmplObj.sourceFile}": render

#let data = {
  let raw = \`\`\`
${safeJson}
\`\`\`
  json(bytes(raw.text))
}

#render(data, theme: ${themeArg})
`;
}

