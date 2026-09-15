import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from 'docx';
import { ResumeData, ResumeSectionKeySchema, DEFAULT_SECTION_ORDER } from './resume-schema';
import { PALETTES } from './design-tokens';

const BODY_FONT = 'Calibri';
const MONO_FONT = 'Consolas';

const INK = '1A1A1A';
const MUTED = '555555';
const RULE = 'CCCCCC';

/**
 * Builds a genuine OOXML .docx (not an HTML-flavored fake) directly from
 * the same ResumeData the PDF compiles from, section-for-section in the
 * user's actual configured order, so it's a real edit-in-Word document
 * that tracks what the PDF shows instead of a fixed, partial layout. It
 * can't clone any one of the 52 Typst templates' exact columns/spacing,
 * Word's layout engine and Typst's are different systems, but every
 * section and the resume's real accent color are represented.
 */
export async function generateDocxBlob(data: ResumeData, themeColor: string = 'none'): Promise<Blob> {
  const accent = (PALETTES[themeColor]?.hex || PALETTES.none.hex).replace('#', '');
  const p = data.personalInfo || { name: 'Resume' };

  const children: Paragraph[] = [];

  // ── Header ────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: p.name || 'Resume', bold: true, size: 44, font: BODY_FONT, color: INK })],
    })
  );

  const headline = p.title?.trim() || p.tagline?.trim();
  if (headline) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [new TextRun({ text: headline, bold: true, size: 26, font: BODY_FONT, color: accent })],
      })
    );
  }

  const contactRuns: (TextRun | ExternalHyperlink)[] = [];
  const contactItems: Array<{ label: string; href?: string }> = [
    { label: p.email || '', href: p.email ? `mailto:${p.email}` : undefined },
    { label: p.phone || '' },
    { label: p.location || '' },
    { label: p.linkedin || '', href: p.linkedin ? withProtocol(p.linkedin) : undefined },
    { label: p.github || '', href: p.github ? withProtocol(p.github) : undefined },
    { label: p.portfolio || '', href: p.portfolio ? withProtocol(p.portfolio) : undefined },
  ].filter((c) => c.label.trim());

  contactItems.forEach((item, i) => {
    if (i > 0) contactRuns.push(new TextRun({ text: '  •  ', size: 18, color: MUTED, font: BODY_FONT }));
    if (item.href) {
      contactRuns.push(
        new ExternalHyperlink({
          link: item.href,
          children: [new TextRun({ text: item.label, size: 18, color: accent, font: BODY_FONT, underline: {} })],
        })
      );
    } else {
      contactRuns.push(new TextRun({ text: item.label, size: 18, color: MUTED, font: BODY_FONT }));
    }
  });

  if (contactRuns.length) {
    children.push(new Paragraph({ spacing: { after: 240 }, children: contactRuns }));
  }

  // ── Sections, in the user's configured order ────────────────────────
  const order = data.sectionOrder?.length ? data.sectionOrder : [...DEFAULT_SECTION_ORDER];
  for (const key of order) {
    const block = renderSection(key, data, accent);
    if (block.length) children.push(...block);
  }

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function heading(text: string, accent: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 80 },
    border: { bottom: { color: accent, space: 2, style: 'single', size: 8 } },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 20, font: BODY_FONT, color: INK, characterSpacing: 10 })],
  });
}

function entryHeader(title: string, subtitle: string, dates: string, accent: string): Paragraph {
  return new Paragraph({
    spacing: { before: 140, after: 20 },
    tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
    children: [
      new TextRun({ text: title, bold: true, size: 21, font: BODY_FONT, color: INK }),
      ...(subtitle ? [new TextRun({ text: `  -  ${subtitle}`, bold: true, size: 21, font: BODY_FONT, color: accent })] : []),
      ...(dates ? [new TextRun({ text: `\t${dates}`, italics: true, size: 18, font: BODY_FONT, color: MUTED })] : []),
    ],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 20 },
    children: [new TextRun({ text, size: 20, font: BODY_FONT, color: '222222' })],
  });
}

function paragraph(text: string, opts: { italics?: boolean; mono?: boolean; size?: number } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({
        text,
        size: opts.size || 20,
        font: opts.mono ? MONO_FONT : BODY_FONT,
        italics: opts.italics,
        color: '222222',
      }),
    ],
  });
}

function renderSection(key: string, data: ResumeData, accent: string): Paragraph[] {
  const parsed = ResumeSectionKeySchema.safeParse(key);
  if (!parsed.success) return [];

  switch (parsed.data) {
    case 'summary': {
      const text = data.summary?.trim();
      return text ? [heading('Professional Summary', accent), paragraph(text)] : [];
    }
    case 'techStackSummary': {
      const text = data.techStackSummary?.trim();
      return text ? [heading('Tech Stack', accent), paragraph(text, { mono: true, size: 18 })] : [];
    }
    case 'skills': {
      const items = data.skills || [];
      if (!items.length) return [];
      return [
        heading('Skills', accent),
        ...items.map(
          (sk) =>
            new Paragraph({
              spacing: { after: 30 },
              children: [
                new TextRun({ text: `${sk.category}: `, bold: true, size: 20, font: BODY_FONT, color: INK }),
                new TextRun({ text: sk.items, size: 20, font: BODY_FONT, color: '222222' }),
              ],
            })
        ),
      ];
    }
    case 'keyMetrics': {
      const items = data.keyMetrics || [];
      if (!items.length) return [];
      return [
        heading('Key Metrics', accent),
        ...items.map((m) =>
          bullet(`${m.label}: ${m.value}${m.context ? ` (${m.context})` : ''}`)
        ),
      ];
    }
    case 'experience':
    case 'internships': {
      const items = key === 'experience' ? data.experience : data.internships;
      if (!items?.length) return [];
      const out: Paragraph[] = [heading(key === 'experience' ? 'Experience' : 'Internships', accent)];
      for (const exp of items) {
        out.push(entryHeader(exp.title, exp.company, exp.dates || '', accent));
        const bullets = exp.bullets?.length ? exp.bullets : exp.description ? [exp.description] : [];
        out.push(...bullets.filter(Boolean).map(bullet));
      }
      return out;
    }
    case 'education': {
      const items = data.education || [];
      if (!items.length) return [];
      const out: Paragraph[] = [heading('Education', accent)];
      for (const edu of items) {
        out.push(entryHeader(edu.degree || 'Degree', edu.institution, edu.dates || '', accent));
        const meta = [edu.gpa ? `GPA: ${edu.gpa}` : '', edu.honors].filter(Boolean).join(' · ');
        if (meta) out.push(paragraph(meta, { italics: true, size: 18 }));
      }
      return out;
    }
    case 'projects': {
      const items = data.projects || [];
      if (!items.length) return [];
      const out: Paragraph[] = [heading('Projects', accent)];
      for (const prj of items) {
        out.push(entryHeader(prj.name, prj.techStack || '', prj.dates || '', accent));
        const bullets = prj.bullets?.length ? prj.bullets : prj.description ? [prj.description] : [];
        out.push(...bullets.filter(Boolean).map(bullet));
      }
      return out;
    }
    case 'certifications': {
      const items = data.certifications || [];
      if (!items.length) return [];
      return [
        heading('Certifications', accent),
        ...items.map((c) => bullet(`${c.name}${c.issuer ? ` - ${c.issuer}` : ''}${c.date ? ` (${c.date})` : ''}`)),
      ];
    }
    case 'achievements': {
      const items = data.achievements || [];
      if (!items.length) return [];
      return [
        heading('Achievements', accent),
        ...items.map((a) => bullet(`${a.name}${a.context ? ` - ${a.context}` : ''}${a.date ? ` (${a.date})` : ''}`)),
      ];
    }
    case 'publications': {
      const items = data.publications || [];
      if (!items.length) return [];
      return [
        heading('Publications', accent),
        ...items.map((pub) => {
          const parts = [pub.authors, pub.title ? `"${pub.title}"` : '', pub.platform, pub.date ? `(${pub.date})` : ''].filter(Boolean);
          return bullet(parts.join(', '));
        }),
      ];
    }
    case 'openSource': {
      const items = data.openSource || [];
      if (!items.length) return [];
      const out: Paragraph[] = [heading('Open Source', accent)];
      for (const os of items) {
        out.push(entryHeader(os.project, '', os.dates || '', accent));
        out.push(...(os.bullets || []).filter(Boolean).map(bullet));
      }
      return out;
    }
    case 'leadership': {
      const items = data.leadership || [];
      if (!items.length) return [];
      const out: Paragraph[] = [heading('Leadership', accent)];
      for (const l of items) {
        out.push(entryHeader(l.role, l.organization, l.dates || '', accent));
        out.push(...(l.bullets || []).filter(Boolean).map(bullet));
      }
      return out;
    }
    case 'volunteering': {
      const items = data.volunteering || [];
      if (!items.length) return [];
      const out: Paragraph[] = [heading('Volunteering', accent)];
      for (const v of items) {
        out.push(entryHeader(v.role, v.organization, v.dates || '', accent));
        out.push(...(v.bullets || []).filter(Boolean).map(bullet));
      }
      return out;
    }
    case 'conferences': {
      const items = data.conferences || [];
      if (!items.length) return [];
      return [
        heading('Conferences', accent),
        ...items.map((c) => bullet(`${c.name}${c.topic ? ` - ${c.topic}` : ''}${c.date ? ` (${c.date})` : ''}`)),
      ];
    }
    case 'languages': {
      const items = data.languages || [];
      if (!items.length) return [];
      return [
        heading('Languages', accent),
        paragraph(items.map((l) => (l.proficiency ? `${l.language} (${l.proficiency})` : l.language)).join(' · ')),
      ];
    }
    case 'interests': {
      const items = data.interests || [];
      if (!items.length) return [];
      return [heading('Interests', accent), paragraph(items.map((i) => i.name).join(' · '))];
    }
    case 'products': {
      const items = data.products || [];
      if (!items.length) return [];
      return [
        heading('Products', accent),
        ...items.map((pr) => bullet(`${pr.name}${pr.responsibility ? ` - ${pr.responsibility}` : ''}`)),
      ];
    }
    case 'devopsContributions': {
      const items = data.devopsContributions || [];
      if (!items.length) return [];
      return [heading('DevOps Contributions', accent), ...items.map(bullet)];
    }
    case 'securityContributions': {
      const items = data.securityContributions || [];
      if (!items.length) return [];
      return [heading('Security Contributions', accent), ...items.map(bullet)];
    }
    case 'additionalInfo': {
      const info = data.additionalInfo;
      if (!info) return [];
      const lines = [
        info.availability ? `Availability: ${info.availability}` : '',
        info.workAuthorization ? `Work Authorization: ${info.workAuthorization}` : '',
        info.relocation ? `Relocation: ${info.relocation}` : '',
        info.travel ? `Travel: ${info.travel}` : '',
        info.notes || '',
      ].filter(Boolean);
      if (!lines.length) return [];
      return [heading('Additional Info', accent), ...lines.map((l) => paragraph(l))];
    }
    case 'customSections': {
      const items = data.customSections || [];
      if (!items.length) return [];
      const out: Paragraph[] = [];
      for (const section of items) {
        if (!section.items?.length) continue;
        out.push(heading(section.title, accent));
        out.push(...section.items.map(bullet));
      }
      return out;
    }
    default:
      return [];
  }
}
