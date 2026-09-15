import { ResumeData, TemplateType } from './resume-schema';
import { notify } from './notify';
import { generateTypst } from './typst-generator';

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

/**
 * Generate native Word (.docx compatible) HTML XML document
 */
export function resumeToWordHtml(data: ResumeData): string {
  const p = data.personalInfo || { name: 'Resume' };

  let expHtml = '';
  if (data.experience && data.experience.length > 0) {
    expHtml = `<h2>Experience</h2>` + data.experience.map((exp) => {
      const bulletsHtml = (exp.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join('');
      return `
        <div class="job-header">
          <span class="job-title">${escapeHtml(exp.title)}</span> &mdash; 
          <span class="company">${escapeHtml(exp.company)}</span>
          <span class="date-loc">${escapeHtml(exp.dates || '')}</span>
        </div>
        ${bulletsHtml ? `<ul>${bulletsHtml}</ul>` : `<p>${escapeHtml(exp.description || '')}</p>`}
      `;
    }).join('');
  }

  let eduHtml = '';
  if (data.education && data.education.length > 0) {
    eduHtml = `<h2>Education</h2>` + data.education.map((edu) => {
      return `
        <div class="job-header">
          <span class="job-title">${escapeHtml(edu.degree || 'Degree')}</span> &mdash; 
          <span class="company">${escapeHtml(edu.institution)}</span>
          <span class="date-loc">${escapeHtml(edu.dates || '')}</span>
        </div>
      `;
    }).join('');
  }

  let skillsHtml = '';
  if (data.skills && data.skills.length > 0) {
    skillsHtml = `<h2>Skills</h2><ul>` + data.skills.map((sk) => {
      return `<li><strong>${escapeHtml(sk.category)}:</strong> ${escapeHtml(sk.items)}</li>`;
    }).join('') + `</ul>`;
  }

  let projectsHtml = '';
  if (data.projects && data.projects.length > 0) {
    projectsHtml = `<h2>Projects</h2>` + data.projects.map((prj) => {
      const bulletsHtml = (prj.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join('');
      return `
        <div class="job-header">
          <span class="job-title">${escapeHtml(prj.name)}</span>
          ${prj.techStack ? `<span class="date-loc">${escapeHtml(prj.techStack)}</span>` : ''}
        </div>
        ${bulletsHtml ? `<ul>${bulletsHtml}</ul>` : `<p>${escapeHtml(prj.description || '')}</p>`}
      `;
    }).join('');
  }

  const contactList = [p.email, p.phone, p.location, p.linkedin, p.github, p.portfolio]
    .filter((x): x is string => Boolean(x))
    .map(escapeHtml)
    .join(' &bull; ');

  return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${escapeHtml(p.name || 'Resume')}</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
@page Section1 { size: 8.5in 11.0in; margin: 0.75in 0.75in 0.75in 0.75in; mso-header-margin: .5in; mso-footer-margin: .5in; mso-paper-source: 0; }
div.Section1 { page: Section1; }
body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.35; color: #1a1a1a; margin: 0; }
h1 { font-size: 22pt; margin: 0 0 2pt 0; font-weight: bold; color: #111; }
.title { font-size: 13pt; color: #333; font-weight: 600; margin: 0 0 4pt 0; }
.meta { color: #555; font-size: 9.5pt; margin-bottom: 14pt; }
h2 { font-size: 11.5pt; margin-top: 14pt; margin-bottom: 4pt; border-bottom: 1.5pt solid #222; text-transform: uppercase; letter-spacing: 0.5pt; color: #111; padding-bottom: 1.5pt; font-weight: bold; }
.job-header { margin-top: 8pt; margin-bottom: 2pt; font-size: 11pt; }
.job-title { font-weight: bold; color: #111; }
.company { font-weight: 600; color: #333; }
.date-loc { font-style: italic; color: #666; font-size: 9.5pt; float: right; }
ul { margin: 3pt 0 7pt 16pt; padding: 0; }
li { margin-bottom: 2pt; font-size: 10pt; line-height: 1.4; color: #222; }
p { margin: 3pt 0; font-size: 10pt; line-height: 1.4; color: #222; }
</style>
</head>
<body>
<div class="Section1">
  <h1>${escapeHtml(p.name || 'Resume')}</h1>
  ${p.title ? `<p class="title">${escapeHtml(p.title)}</p>` : ''}
  ${contactList ? `<p class="meta">${contactList}</p>` : ''}

  ${data.summary ? `<h2>Summary</h2><p>${escapeHtml(data.summary)}</p>` : ''}
  ${expHtml}
  ${eduHtml}
  ${skillsHtml}
  ${projectsHtml}
</div>
</body>
</html>
`.trim();
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
  const { resumeData, format, template = 'modern', theme = { color: 'cobalt' }, typstCode, customFilename } = opts;
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
          theme,
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
      let serverMessage = '';
      try {
        const errBody = await res.json();
        serverMessage = errBody?.details || errBody?.error || '';
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
      // resumeToWordHtml() produces Word's legacy HTML-flavored document
      // format (mso conditional comments + an office:word XML namespace),
      // not a real OOXML package, that's what a .docx file actually is (a
      // zip archive of XML parts). Modern Word validates the extension
      // against the real content and refuses to open this as .docx with a
      // "can't open, contents are damaged" error. .doc + application/msword
      // is the correct pairing for this format, and Word opens it natively.
      const htmlDoc = resumeToWordHtml(resumeData);
      const blob = new Blob([htmlDoc], { type: 'application/msword' });
      triggerFileDownload(blob, `${baseName}.doc`, 'application/msword');
      notify.success('Word document exported', `${baseName}.doc`);
      return true;
    }

    if (format === 'md') {
      const md = resumeToMarkdown(resumeData);
      triggerFileDownload(md, `${baseName}.md`, 'text/markdown');
      notify.success('Markdown exported', `${baseName}.md`);
      return true;
    }

    if (format === 'json') {
      const json = JSON.stringify(resumeData, null, 2);
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
