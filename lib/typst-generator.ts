import { ResumeData, TemplateType } from './resume-schema';
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
  skills: Array<{ category: string; items: string; skills: string[] }>;
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

