import { ResumeData, TemplateType } from './resume-schema';
import { notify } from './notify';
import { generateTypst } from './typst-generator';
import { sanitizeResumeData } from './sanitize-resume-data';

/**
 * Extracts a short, readable message from a Zod `.error.format()` object
 * (`{ fieldName: { _errors: ["message"] }, nested: { field: {...} } }`)
 * instead of assuming server error details are always a plain string.
 */
function summarizeZodFormatError(details: unknown, depth = 0): string {
  if (!details || typeof details !== 'object' || depth > 3) return '';
  const obj = details as Record<string, unknown>;
  const messages: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key === '_errors') {
      if (Array.isArray(value) && value.length) messages.push(...value.filter((m): m is string => typeof m === 'string'));
      continue;
    }
    const nested = summarizeZodFormatError(value, depth + 1);
    if (nested) messages.push(`${key}: ${nested}`);
  }
  return messages.slice(0, 3).join('; ');
}

/**
 * Trigger browser file download for a given Blob or string content
 */
export function triggerFileDownload(content: Blob | string, filename: string, mimeType = 'text/plain') {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate semantic Markdown representation of a resume
 */
export function resumeToMarkdown(data: ResumeData): string {
  const p = data.personalInfo || { name: 'Resume' };
  const lines: string[] = [];

  // Header
  lines.push(`# ${p.name || 'Resume'}`);
  if (p.title) lines.push(`**${p.title}**\n`);

  // Contact Meta
  const contactParts: string[] = [];
  if (p.email) contactParts.push(p.email);
  if (p.phone) contactParts.push(p.phone);
  if (p.location) contactParts.push(p.location);
  if (p.linkedin) contactParts.push(p.linkedin);
  if (p.github) contactParts.push(p.github);
  if (p.portfolio) contactParts.push(p.portfolio);

  if (contactParts.length > 0) {
    lines.push(contactParts.join(' • ') + '\n');
  }

  // Summary
  if (data.summary?.trim()) {
    lines.push('## Professional Summary');
    lines.push(data.summary.trim() + '\n');
  }

  // Tech Stack
  if (data.techStackSummary?.trim()) {
    lines.push('## Tech Stack');
    lines.push('`' + data.techStackSummary.trim() + '`\n');
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    lines.push('## Experience');
    for (const exp of data.experience) {
      lines.push(`### ${exp.title}, ${exp.company}`);
      const meta = [exp.dates, exp.location].filter(Boolean).join(' | ');
      if (meta) lines.push(`*${meta}*`);

      if (exp.bullets && exp.bullets.length > 0) {
        for (const b of exp.bullets) {
          if (b?.trim()) lines.push(`- ${b.trim()}`);
        }
      } else if (exp.description?.trim()) {
        lines.push(exp.description.trim());
      }
      lines.push('');
    }
  }

  // Education
  if (data.education && data.education.length > 0) {
    lines.push('## Education');
    for (const edu of data.education) {
      lines.push(`### ${edu.degree || 'Degree'}, ${edu.institution}`);
      const meta = [edu.dates, edu.location, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join(' | ');
      if (meta) lines.push(`*${meta}*`);
      lines.push('');
    }
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    lines.push('## Skills');
    for (const sk of data.skills) {
      lines.push(`- **${sk.category}:** ${sk.items}`);
    }
    lines.push('');
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    lines.push('## Projects');
    for (const prj of data.projects) {
      lines.push(`### ${prj.name}`);
      if (prj.techStack) lines.push(`*Technologies: ${prj.techStack}*`);
      if (prj.link) lines.push(`*Link: ${prj.link}*`);
      if (prj.bullets && prj.bullets.length > 0) {
        for (const b of prj.bullets) {
          if (b?.trim()) lines.push(`- ${b.trim()}`);
        }
      } else if (prj.description) {
        lines.push(prj.description);
      }
      lines.push('');
    }
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    lines.push('## Certifications');
    for (const cert of data.certifications) {
      const meta = [cert.issuer, cert.date].filter(Boolean).join(' | ');
      lines.push(`- **${cert.name}**${meta ? ` (${meta})` : ''}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export type ExportFormatType = 'pdf' | 'docx' | 'md' | 'json' | 'typ';

export interface ExportOptions {
  resumeData: ResumeData;
  format: ExportFormatType;
  template?: string;
  theme?: { color?: string; font?: string };
  typstCode?: string;
  customFilename?: string;
}

/**
 * Universal Resume Exporter: handles PDF, Word (DOCX), Markdown, JSON, and Typst downloads
 */
export async function exportResume(opts: ExportOptions): Promise<boolean> {
  const { resumeData: rawResumeData, format, template = 'modern', theme = { color: 'cobalt' }, typstCode, customFilename } = opts;
  // Sanitize once, here, for every format, instead of guarding individual
  // .trim() call sites inside the generators. A malformed field (an
  // AI-tailored field that ended up an array/object instead of a string)
  // used to either crash the generator directly or get rejected by the
  // server's Zod schema with a 400 that this function's own error path
  // then mishandled. Coercing to well-formed data up front means a
  // malformed resume actually exports successfully instead of failing in
  // either of those ways. JSON export is the one exception, it uses the
  // raw data so a user exporting for backup/reimport gets exactly what's
  // actually in their resume, not a silently "fixed" copy.
  const resumeData = sanitizeResumeData(rawResumeData);
  const safeName = (resumeData.personalInfo?.name || 'Resume').toLowerCase().replace(/\s+/g, '-');
  const baseName = customFilename || `${safeName}`;

  try {
    if (format === 'pdf') {
      const res = await fetch('/api/v1/resume/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData,
          template,
          theme: theme?.color || 'none',
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        triggerFileDownload(blob, `${baseName}-${template}.pdf`, 'application/pdf');
        notify.success('Download complete', `${baseName}-${template}.pdf`);
        return true;
      }

      // No fabricated fallback: a fake "PDF" (really markdown text with a
      // %PDF header slapped on) isn't a valid PDF and no reader can open
      // it, this used to report success anyway, silently handing the user
      // a corrupt file. Surface the real failure instead.
      //
      // errBody.details on a 400 is Zod's error.format() output, a nested
      // OBJECT describing which fields failed, not a string. Passing it
      // straight through as a notification description used to crash
      // inside notify.ts's title.trim() with a generic, unhelpful "(r ||
      // "").trim is not a function", masking the actual validation error
      // that would have said which field was wrong. Extract a real
      // message string from it instead of assuming the shape.
      let serverMessage = '';
      try {
        const errBody = await res.json();
        if (typeof errBody?.details === 'string') {
          serverMessage = errBody.details;
        } else if (errBody?.details && typeof errBody.details === 'object') {
          serverMessage = summarizeZodFormatError(errBody.details);
        } else if (typeof errBody?.error === 'string') {
          serverMessage = errBody.error;
        }
      } catch {
        // Response wasn't JSON, fall through with no extra detail.
      }
      notify.error(
        'PDF export failed',
        serverMessage || (res.status === 429 ? 'Too many requests, please wait a moment and try again.' : 'Please try again.')
      );
      return false;
    }

    if (format === 'docx') {
      // A genuine OOXML .docx built directly from the same resumeData the
      // PDF compiles from (lib/docx-generator.ts), every section in the
      // user's real order, the resume's actual accent color. Not the old
      // fixed-layout HTML-flavored-as-.doc workaround, this is what a
      // .docx file is actually supposed to be, so the real extension and
      // MIME type are correct again. Dynamically imported: the `docx`
      // library added ~100KB to the editor's initial bundle when it was a
      // static import, most sessions never click "Export as Word."
      const { generateDocxBlob } = await import('./docx-generator');
      const blob = await generateDocxBlob(resumeData, theme?.color || 'none');
      triggerFileDownload(blob, `${baseName}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      notify.success('Word document exported', `${baseName}.docx`);
      return true;
    }

    if (format === 'md') {
      const md = resumeToMarkdown(resumeData);
      triggerFileDownload(md, `${baseName}.md`, 'text/markdown');
      notify.success('Markdown exported', `${baseName}.md`);
      return true;
    }

    if (format === 'json') {
      // Raw, unsanitized data: a JSON export is for backup/reimport, it
      // should reflect exactly what's actually stored, not a silently
      // "fixed" copy.
      const json = JSON.stringify(rawResumeData, null, 2);
      triggerFileDownload(json, `${baseName}.json`, 'application/json');
      notify.success('JSON exported', `${baseName}.json`);
      return true;
    }

    if (format === 'typ') {
      let code = typstCode;
      if (!code) {
        try {
          code = generateTypst(resumeData, (template as TemplateType) || 'modern', theme?.color || 'none');
        } catch {
          code = `// LumaCV Typst Source\n// Template: ${template}\n`;
        }
      }
      triggerFileDownload(code, `${baseName}.typ`, 'text/plain');
      notify.success('Typst source exported', `${baseName}.typ`);
      return true;
    }

    return false;
  } catch (err: unknown) {
    console.error('Export error:', err);
    notify.error('Export failed', err instanceof Error ? err.message : 'Please try again');
    return false;
  }
}
