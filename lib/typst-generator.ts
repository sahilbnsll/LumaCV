import { ResumeData, TemplateType } from './resume-schema';

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
  skills: Array<{ category: string; items: string }>;
  experience: Array<{
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
  }>;
  projects: Array<{
    name: string;
    stack: string;
    description: string;
    url: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url: string;
  }>;
  awards: Array<{
    title: string;
    awarder: string;
    date: string;
    description: string;
  }>;
  publications: Array<{
    title: string;
    publisher: string;
    date: string;
    url: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
}

/**
 * Normalizes template names to one of the 6 core Typst templates.
 */
export function normalizeTemplateName(template?: string): 'classic' | 'modern' | 'engineering' | 'compact' | 'two_column' | 'ats_safe' {
  const t = (template || 'modern').toLowerCase();
  if (t === 'classic' || t === 'academic') return 'classic';
  if (t === 'engineering' || t === 'startup') return 'engineering';
  if (t === 'compact' || t === 'dense') return 'compact';
  if (t === 'two_column' || t === 'two-column') return 'two_column';
  if (t === 'ats_safe' || t === 'ats-safe' || t === 'ats') return 'ats_safe';
  return 'modern';
}

/**
 * Converts LumaCV ResumeData schema into clean, flat Typst resume data.
 * All keys are guaranteed present with sensible empty fallbacks so templates never throw KeyError.
 * No concept of variants: pure, direct data.
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

  const skills = (data.skills || []).map((s) => ({
    category: s.category || 'Skills',
    items: s.items || '',
  }));

  const experience = (data.experience || []).map((exp) => ({
    role: exp.title || 'Role',
    company: exp.company || 'Company',
    dates: exp.dates || '',
    location: exp.location?.trim() || '',
    bullets: (exp.bullets || []).filter((b) => Boolean(b && b.trim())),
  }));

  const education = (data.education || []).map((edu) => ({
    degree: edu.degree || 'Degree',
    specialization: edu.fieldOfStudy?.trim() || '',
    institution: edu.institution || 'Institution',
    dates: edu.dates || '',
    gpa: edu.gpa?.trim() || '',
  }));

  const projects = (data.projects || []).map((proj) => {
    let desc = proj.description?.trim() || '';
    if (proj.bullets && proj.bullets.length > 0) {
      const bulletText = proj.bullets.filter(Boolean).join('; ');
      desc = desc ? `${desc} (${bulletText})` : bulletText;
    }
    return {
      name: proj.name || 'Project',
      stack: proj.techStack?.trim() || '',
      description: desc || proj.name,
      url: proj.link?.trim() || '',
    };
  });

  const certifications = (data.certifications || []).map((c) => ({
    name: c.name,
    issuer: c.issuer?.trim() || '',
    date: c.date?.trim() || '',
    url: c.link?.trim() || '',
  }));

  const awards = (data.achievements || []).map((a) => ({
    title: a.name,
    awarder: a.context?.trim() || '',
    date: a.date?.trim() || '',
    description: a.description?.trim() || '',
  }));

  const publications = (data.publications || []).map((pub) => ({
    title: pub.title,
    publisher: pub.platform?.trim() || '',
    date: pub.date?.trim() || '',
    url: pub.link?.trim() || '',
  }));

  const languages = (data.languages || []).map((l) => ({
    language: l.language,
    proficiency: l.proficiency?.trim() || '',
  }));

  return {
    personal: {
      name: p.name || 'Your Name',
      headline,
      contact,
    },
    summary: data.summary?.trim() || '',
    skills,
    experience,
    education,
    projects,
    certifications,
    awards,
    publications,
    languages,
  };
}

/**
 * Returns a complete, standalone Typst document as a string.
 */
export function generateTypst(
  data: ResumeData,
  template: TemplateType = 'modern',
  theme: string = 'none'
): string {
  const typstData = resumeDataToTypstData(data);
  const jsonString = JSON.stringify(typstData, null, 2);

  const tmpl = normalizeTemplateName(template);
  const renderFn =
    tmpl === 'classic'
      ? 'render-classic'
      : tmpl === 'engineering'
      ? 'render-engineering'
      : tmpl === 'compact'
      ? 'render-compact'
      : tmpl === 'two_column'
      ? 'render-two-column'
      : tmpl === 'ats_safe'
      ? 'render-ats-safe'
      : 'render-modern';

  const templateFile =
    tmpl === 'classic'
      ? 'classic.typ'
      : tmpl === 'engineering'
      ? 'engineering.typ'
      : tmpl === 'compact'
      ? 'compact.typ'
      : tmpl === 'two_column'
      ? 'two_column.typ'
      : tmpl === 'ats_safe'
      ? 'ats_safe.typ'
      : 'modern.typ';

  const defaultTheme =
    tmpl === 'two_column' ? 'two-column' : tmpl === 'ats_safe' ? 'ats-safe' : tmpl;
  const themeArg = theme && theme !== 'none' ? `"${theme}"` : `"${defaultTheme}"`;


  return `// =============================================================================
// LumaCV Generated Resume (Typst)
// Template: ${tmpl}
// =============================================================================

#import "/templates/${templateFile}": ${renderFn}

#let data = json(bytes(\`\`\`json
${jsonString}
\`\`\`.text))

#${renderFn}(data, theme: ${themeArg})
`;
}

