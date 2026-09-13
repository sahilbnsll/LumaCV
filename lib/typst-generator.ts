import { DEFAULT_SECTION_ORDER, ResumeData, TemplateType } from './resume-schema';
import { ALL_TEMPLATES } from './templates-data';

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
    phone: p.phone?.trim() || '',
    email: p.email?.trim() || '',
    linkedin: p.linkedin?.trim() || '',
    github: p.github?.trim() || '',
    website: p.portfolio?.trim() || '',
    location: p.location?.trim() || '',
  };

  const headline = p.title?.trim() || p.tagline?.trim() || '';

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

  const cleanBulletText = (s: string) => {
    return s.replace(/^\[(?:Highlight|Impact|Feature|Result)[^\]]*\]\s*/i, '').trim();
  };

  const experience = (data.experience || []).map((exp) => {
    const resolvedDates = (() => {
      const sd = exp.startDate?.trim();
      const ed = exp.endDate?.trim();
      if (sd || ed) return [sd, ed].filter(Boolean).join(' – ');
      return exp.dates?.trim() || '';
    })();

    const cleanBullets = (exp.bullets || []).map(cleanBulletText).filter(Boolean);
    const cleanHighlights = (exp.highlights || []).map(cleanBulletText).filter(Boolean);
    const cleanImpactBullets = (exp.impactBullets || []).map(cleanBulletText).filter(Boolean);

    return {
      id: exp.id || '',
      role: exp.title || 'Role',
      company: exp.company || 'Company',
      companyUrl: exp.companyUrl?.trim() || '',
      dates: resolvedDates,
      location: exp.location?.trim() || '',
      description: exp.description?.trim() || '',
      technologies: exp.technologies?.trim() || '',
      bullets: cleanBullets,
      highlights: cleanHighlights,
      impactBullets: cleanImpactBullets,
    };
  });

  const internships = (data.internships || []).map((intern) => ({
    role: intern.title || 'Intern',
    company: intern.company || 'Company',
    dates: intern.dates || '',
    location: intern.location?.trim() || '',
    bullets: (intern.bullets || []).filter((b) => Boolean(b && b.trim())),
  }));

  // If experience is empty but internships are provided, use internships in experience so templates don't show empty work experience
  const resolvedExperience = experience.length > 0 ? experience : internships;

  const education = (data.education || []).map((edu) => {
    const resolvedDates = (() => {
      const sd = edu.startDate?.trim();
      const ed = edu.endDate?.trim();
      if (sd || ed) return [sd, ed].filter(Boolean).join(' – ');
      return edu.dates?.trim() || '';
    })();

    return {
      id: edu.id || '',
      degree: edu.degree || 'Degree',
      specialization: edu.fieldOfStudy?.trim() || '',
      institution: edu.institution || 'Institution',
      dates: resolvedDates,
      location: edu.location?.trim() || '',
      gpa: edu.gpa?.trim() || '',
      coursework: edu.coursework?.trim() || '',
      honors: edu.honors?.trim() || '',
    };
  });

  const projects = (data.projects || []).map((proj) => {
    // Resolve dates — prefer explicit startDate/endDate, fall back to combined dates string
    const resolvedDates = (() => {
      const sd = (proj as any).startDate?.trim();
      const ed = (proj as any).endDate?.trim();
      if (sd || ed) return [sd, ed].filter(Boolean).join(' – ');
      return proj.dates?.trim() || '';
    })();

    const cleanBullets = (proj.bullets || []).map(cleanBulletText).filter(Boolean);
    const cleanHighlights = (proj.highlights || []).map(cleanBulletText).filter(Boolean);
    const cleanImpactBullets = (proj.impactBullets || []).map(cleanBulletText).filter(Boolean);

    return {
      id: proj.id || '',
      name: proj.name || 'Project',
      stack: proj.techStack?.trim() || '',
      // Keep description as a clean prose string — do NOT append bullets in parentheses
      description: proj.description?.trim() || '',
      url: proj.link?.trim() || '',
      role: proj.role?.trim() || '',
      dates: resolvedDates,
      impact: proj.impact?.trim() || '',
      // Separate arrays — templates can render them as distinct bullet groups
      impactBullets: cleanImpactBullets,
      highlights: cleanHighlights,
      bullets: cleanBullets,
    };
  });

  const certifications = (data.certifications || []).map((c) => ({
    name: c.name,
    issuer: c.issuer?.trim() || '',
    date: c.date?.trim() || '',
    url: c.link?.trim() || '',
    expiryDate: c.expiryDate?.trim() || '',
    credentialId: c.credentialId?.trim() || '',
  }));

  const awards = (data.achievements || []).map((a) => ({
    name: a.name,
    title: a.name,
    awarder: (a.context || (a as any).awarder || '').trim(),
    context: (a.context || (a as any).awarder || '').trim(),
    date: a.date?.trim() || '',
    description: a.description?.trim() || '',
    rank: a.rank?.trim() || '',
    url: (a.link || (a as any).url || '').trim(),
    link: (a.link || (a as any).url || '').trim(),
  }));

  const publications = (data.publications || []).map((pub) => {
    const title = pub.title;
    const publisher = (pub.platform || (pub as any).publisher || '').trim();
    const date = pub.date?.trim() || '';
    const authors = pub.authors?.trim() || '';
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
      description: pub.description?.trim() || '',
      url: (pub.link || (pub as any).url || '').trim(),
      link: (pub.link || (pub as any).url || '').trim(),
      citation: citParts.join(', '),
    };
  });

  const languages = (data.languages || []).map((l) => ({
    name: l.language,
    language: l.language,
    proficiency: l.proficiency?.trim() || '',
  }));

  const keyMetrics = (data.keyMetrics || []).map((m) => ({
    label: m.label,
    value: m.value,
    context: m.context?.trim() || '',
  }));

  const openSource = (data.openSource || []).map((os) => ({
    project: os.project,
    contribution: os.contribution?.trim() || '',
    dates: os.dates?.trim() || '',
    impact: os.impact?.trim() || '',
    url: os.link?.trim() || '',
    bullets: (os.bullets || []).filter(Boolean),
  }));

  const leadership = (data.leadership || []).map((l) => ({
    role: l.role,
    organization: l.organization,
    location: l.location?.trim() || '',
    dates: l.dates?.trim() || '',
    bullets: (l.bullets || []).filter(Boolean),
  }));

  const volunteering = (data.volunteering || []).map((v) => ({
    role: v.role,
    organization: v.organization,
    location: v.location?.trim() || '',
    dates: v.dates?.trim() || '',
    bullets: (v.bullets || []).filter(Boolean),
  }));

  const conferences = (data.conferences || []).map((c) => ({
    name: c.name,
    topic: c.topic?.trim() || '',
    role: c.role?.trim() || '',
    date: c.date?.trim() || '',
    location: c.location?.trim() || '',
    description: c.description?.trim() || '',
    url: c.link?.trim() || '',
  }));

  const interests = (data.interests || []).map((i) => ({
    name: i.name,
    details: i.details?.trim() || '',
  }));

  const products = (data.products || []).map((p) => ({
    name: p.name,
    responsibility: p.responsibility?.trim() || '',
    scale: p.scale?.trim() || '',
    impact: p.impact?.trim() || '',
  }));

  return {
    personal: {
      name: p.name || 'Your Name',
      headline,
      contact,
    },
    summary: data.summary?.trim() || '',
    techStackSummary: data.techStackSummary?.trim() || '',
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
      availability: data.additionalInfo?.availability?.trim() || '',
      workAuthorization: data.additionalInfo?.workAuthorization?.trim() || '',
      relocation: data.additionalInfo?.relocation?.trim() || '',
      travel: data.additionalInfo?.travel?.trim() || '',
      notes: data.additionalInfo?.notes?.trim() || '',
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

