import { ResumeData, TemplateType } from './resume-schema';
import { escapeLatex } from './latex-escape';
import { resolveLayout, type LayoutAdjust } from './latex-layout';

// ============================================================================
// Utility Helpers
// ============================================================================

type PI = ResumeData['personalInfo'];

/** Normalize URL — avoid double https:// */
function hrefUrl(raw: string | undefined): string {
    const t = (raw ?? '').trim();
    if (!t) return '';
    if (/^https?:\/\//i.test(t)) return t;
    return `https://${t}`;
}

/** Strip scheme for display text */
function stripScheme(raw: string): string {
    return raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
}

/** Escape only URL-special chars inside \\href{URL} */
function safeHref(url: string): string {
    return url.replace(/%/g, '\\%').replace(/#/g, '\\#');
}

/** Build contact parts array with escaped values and \\href links */
function buildContactParts(
    p: PI,
    opts: { linkColor?: string; underline?: boolean; separator?: string } = {}
): string[] {
    const { linkColor, underline } = opts;
    const parts: string[] = [];
    const wrapLink = (url: string, text: string) => {
        let display = escapeLatex(text);
        if (underline) display = `\\underline{${display}}`;
        if (linkColor) display = `\\color{${linkColor}}${display}`;
        return `\\href{${safeHref(url)}}{${display}}`;
    };

    if (p.phone) parts.push(escapeLatex(p.phone));
    if (p.email) parts.push(wrapLink(`mailto:${p.email}`, p.email));
    const li = hrefUrl(p.linkedin);
    if (li) parts.push(wrapLink(li, stripScheme(p.linkedin!)));
    const port = hrefUrl(p.portfolio);
    if (port) parts.push(wrapLink(port, stripScheme(p.portfolio!)));
    return parts;
}

// ============================================================================
// Preamble Builder
// ============================================================================

function buildPreamble(o: {
    fontSize: string;
    fontPkg: string;
    geometry: string;
    colors: string;
    sectionFmt: string;
    commands: string;
    lineSpread: string;
    extra: string;
}): string {
    return `\\documentclass[${o.fontSize},a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{tabularx}
${o.fontPkg}
\\usepackage[${o.geometry}]{geometry}
\\pagestyle{empty}
\\setlength{\\headheight}{0pt}
\\setlength{\\headsep}{0pt}
\\setlength{\\tabcolsep}{0in}
\\raggedbottom
\\raggedright
${o.colors}
${o.sectionFmt}
\\pdfgentounicode=1
${o.commands}
${o.lineSpread}
${o.extra}
\\begin{document}
`;
}

// ---- Subheading command variants (different per template) ----

const SUBHEADING_DEFAULT = `\\newcommand{\\resumeSubheading}[4]{
  \\vspace{2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{3pt}
}`;

const SUBHEADING_EXECUTIVE = `\\newcommand{\\resumeSubheading}[4]{
  \\vspace{4pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      {\\large\\textbf{#1}} & {\\small #2} \\\\
      \\textit{#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{4pt}
}`;

const SUBHEADING_CREATIVE = `\\newcommand{\\resumeSubheading}[4]{
  \\vspace{1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{\\color{primary}#1} & #2 \\\\
      \\textit{\\small\\color{primary!70!black}#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{2pt}
}`;

const SUBHEADING_TECH = `\\newcommand{\\resumeSubheading}[4]{
  \\vspace{2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\texttt{\\textbf{#1}} & {\\small\\ttfamily #2} \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{2pt}
}`;

/** Classic: even vertical rhythm between experience/education blocks */
const SUBHEADING_CLASSIC = `\\newcommand{\\resumeSubheading}[4]{
  \\vspace{2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{3pt}
}`;

/** Compact: avoid negative vglue inside narrow minipage (prevents overlap) */
const SUBHEADING_COMPACT = `\\newcommand{\\resumeSubheading}[4]{
  \\vspace{4pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & {\\footnotesize #2} \\\\
      \\textit{\\scriptsize #3} & \\textit{\\scriptsize #4} \\\\
    \\end{tabular*}\\vspace{3pt}
}`;

/** Common list command definitions */
function listCmds(bullet: string, listLM: string): string {
    return `
\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=${listLM},label={},itemsep=1pt,topsep=3pt,parsep=1pt]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[label={${bullet}},itemsep=1pt,topsep=2pt,parsep=1pt]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{3pt}}`;
}

/** Compact minipage: readable density without negative vglue overlap */
function listCmdsCompact(bullet: string, listLM: string): string {
    return `
\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=${listLM},label={},itemsep=1pt,topsep=3pt,parsep=1pt]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[label={${bullet}},itemsep=1pt,topsep=2pt,parsep=1pt]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{3pt}}`;
}

/** Tightly compressed lists for creative/long resumes */
function listCmdsCreative(bullet: string, listLM: string): string {
    return `
\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=${listLM},label={},itemsep=0pt,topsep=1pt,parsep=0pt]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[label={${bullet}},itemsep=0pt,topsep=1pt,parsep=0pt]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{1pt}}`;
}

type PreambleTemplate = {
    fontSize: string;
    fontPkg: string;
    geometry: string;
    geometryRelaxed?: string;
    colors: string;
    sectionFmt: string;
    commands: string;
    lineSpread: string;
    lineSpreadRelaxed?: string;
    fontSizeRelaxed?: string;
    extra: string;
};

const PREAMBLE_BY_TEMPLATE: Record<TemplateType, PreambleTemplate> = {
    modern: {
        fontSize: '10pt',
        fontPkg: '\\usepackage{charter}',
        geometry: 'top=0.36in,bottom=0.36in,left=0.4in,right=0.4in',
        geometryRelaxed: 'top=0.5in,bottom=0.5in,left=0.5in,right=0.5in',
        colors: '\\definecolor{linkblue}{HTML}{0077B5}',
        sectionFmt:
            '\\titleformat{\\section}{\\vspace{2pt}\\scshape\\raggedright\\normalsize}{}{0em}{}{}[\\vspace{3pt}{\\color{black}\\rule{\\linewidth}{0.45pt}}\\vspace{5pt}]',
        commands: SUBHEADING_DEFAULT + listCmds('\\textbullet', '0.15in'),
        lineSpread: '\\linespread{0.92}',
        lineSpreadRelaxed: '\\linespread{0.98}',
        extra: '\\titlespacing{\\section}{0pt}{5pt}{4pt}',
    },
    classic: {
        fontSize: '10pt',
        fontPkg: '\\usepackage{mathpazo}',
        geometry: 'top=0.36in,bottom=0.36in,left=0.4in,right=0.4in',
        geometryRelaxed: 'top=0.58in,bottom=0.58in,left=0.62in,right=0.62in',
        colors: '',
        sectionFmt:
            '\\titleformat{\\section}{\\vspace{2pt}\\bfseries\\raggedright\\normalsize\\MakeUppercase}{}{0em}{}{}[\\vspace{4pt}{\\rule{\\linewidth}{0.65pt}}\\vspace{6pt}]',
        commands: SUBHEADING_CLASSIC + listCmds('--', '0in'),
        lineSpread: '\\linespread{0.94}',
        lineSpreadRelaxed: '\\linespread{1.02}',
        extra: '\\titlespacing{\\section}{0pt}{6pt}{5pt}',
    },
    ats: {
        fontSize: '10pt',
        fontPkg: '',
        geometry: 'top=0.36in,bottom=0.36in,left=0.4in,right=0.4in',
        geometryRelaxed: 'top=0.5in,bottom=0.5in,left=0.5in,right=0.5in',
        colors: '',
        sectionFmt:
            '\\titleformat{\\section}{\\vspace{2pt}\\bfseries\\raggedright\\normalsize}{}{0em}{}{}[\\vspace{3pt}{\\rule{\\linewidth}{0.45pt}}\\vspace{5pt}]',
        commands: SUBHEADING_DEFAULT + listCmds('\\textbullet', '0.15in'),
        lineSpread: '\\linespread{0.94}',
        lineSpreadRelaxed: '\\linespread{1.0}',
        extra: '\\titlespacing{\\section}{0pt}{5pt}{4pt}',
    },
    executive: {
        fontSize: '10pt',
        fontPkg: '\\usepackage{mathpazo}',
        geometry: 'top=0.36in,bottom=0.36in,left=0.42in,right=0.42in',
        geometryRelaxed: 'top=0.58in,bottom=0.58in,left=0.64in,right=0.64in',
        colors: '\\definecolor{darknavy}{HTML}{1B2A4A}',
        sectionFmt:
            '\\titleformat{\\section}{\\vspace{5pt}\\color{darknavy}\\scshape\\raggedright\\normalsize}{}{0em}{}{}[\\vspace{4pt}{\\color{darknavy}\\rule{\\linewidth}{0.5pt}}\\vspace{6pt}]',
        commands: SUBHEADING_EXECUTIVE + listCmds('--', '0in'),
        lineSpread: '\\linespread{0.95}',
        lineSpreadRelaxed: '\\linespread{1.05}',
        extra: '\\titlespacing{\\section}{0pt}{6pt}{6pt}',
    },
    minimal: {
        fontSize: '10pt',
        fontPkg: '\\usepackage{helvet}\n\\renewcommand{\\familydefault}{\\sfdefault}',
        geometry: 'top=0.38in,bottom=0.38in,left=0.48in,right=0.48in',
        geometryRelaxed: 'top=0.72in,bottom=0.72in,left=0.76in,right=0.76in',
        colors: '',
        sectionFmt: '\\titleformat{\\section}{\\vspace{3pt}\\bfseries\\raggedright\\normalsize}{}{0em}{}{}[\\vspace{3pt}]',
        commands: SUBHEADING_DEFAULT + listCmds('$\\cdot$', '0in'),
        lineSpread: '\\linespread{0.96}',
        lineSpreadRelaxed: '\\linespread{1.08}',
        extra: '\\titlespacing{\\section}{0pt}{8pt}{6pt}',
    },
    compact: {
        fontSize: '9pt',
        fontPkg: '\\usepackage{helvet}\n\\renewcommand{\\familydefault}{\\sfdefault}',
        geometry: 'top=0.26in,bottom=0.26in,left=0.32in,right=0.32in',
        geometryRelaxed: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in',
        fontSizeRelaxed: '9pt',
        colors: '\\definecolor{accent}{HTML}{3E0097}',
        sectionFmt:
            '\\titleformat{\\section}{\\vspace{6pt}\\color{accent}\\bfseries\\scshape\\raggedright\\normalsize}{}{0em}{}{}[\\vspace{6pt}{\\color{accent}\\rule{\\linewidth}{0.55pt}}\\vspace{10pt}]',
        commands: SUBHEADING_COMPACT + listCmdsCompact('\\textbullet', '0in'),
        lineSpread: '\\linespread{0.96}',
        lineSpreadRelaxed: '\\linespread{0.98}',
        extra: '',
    },
    creative: {
        fontSize: '10pt',
        fontPkg: '\\usepackage{charter}',
        geometry: 'top=0.34in,bottom=0.34in,left=0.4in,right=0.4in',
        geometryRelaxed: 'top=0.5in,bottom=0.5in,left=0.5in,right=0.5in',
        colors: '\\definecolor{primary}{HTML}{0077B5}\n\\definecolor{lightbg}{HTML}{E8F4F8}',
        sectionFmt: '\\titleformat{\\section}{\\vspace{2pt}\\raggedright\\small}{}{0em}{\\creativesection}',
        commands: SUBHEADING_CREATIVE + listCmdsCreative('$\\diamond$', '0.12in'),
        lineSpread: '\\linespread{0.90}',
        lineSpreadRelaxed: '\\linespread{1.0}',
        extra: '\\newcommand{\\creativesection}[1]{\\par\\vspace{2pt}\\noindent\\colorbox{primary}{\\parbox{\\dimexpr\\textwidth-2\\fboxsep}{\\color{white}\\bfseries\\scshape\\small\\strut\\quad #1}}\\par\\vspace{2pt}}\n\\titlespacing{\\section}{0pt}{3pt}{3pt}',
    },
    tech: {
        fontSize: '10pt',
        fontPkg: '\\usepackage{lmodern}',
        geometry: 'top=0.36in,bottom=0.36in,left=0.4in,right=0.4in',
        geometryRelaxed: 'top=0.52in,bottom=0.52in,left=0.52in,right=0.52in',
        colors: '\\definecolor{techgray}{RGB}{80,80,80}',
        sectionFmt:
            '\\titleformat{\\section}{\\vspace{2pt}\\ttfamily\\bfseries\\raggedright\\normalsize}{}{0em}{\\techsection}[\\vspace{3pt}{\\color{techgray}\\rule{\\linewidth}{0.45pt}}\\vspace{2pt}]',
        commands: SUBHEADING_TECH + listCmds('$\\triangleright$', '0.15in'),
        lineSpread: '\\linespread{0.92}',
        lineSpreadRelaxed: '\\linespread{0.98}',
        extra: '\\newcommand{\\techsection}[1]{// \\MakeUppercase{#1}}\n\\titlespacing{\\section}{0pt}{5pt}{4pt}',
    },
};

function getPreamble(t: TemplateType, layout: LayoutAdjust): string {
    const c = PREAMBLE_BY_TEMPLATE[t] ?? PREAMBLE_BY_TEMPLATE.modern;
    let fontSize = c.fontSize;
    let geometry = c.geometry;
    let lineSpread = c.lineSpread;
    if (layout.mode === 'multi_page_ok') {
        if (c.geometryRelaxed) geometry = c.geometryRelaxed;
        if (c.lineSpreadRelaxed) lineSpread = c.lineSpreadRelaxed;
        if (c.fontSizeRelaxed) fontSize = c.fontSizeRelaxed;
    }
    if (layout.fontSize) fontSize = layout.fontSize;
    if (layout.geometry) geometry = layout.geometry;
    if (layout.lineSpread) lineSpread = layout.lineSpread;
    const extra = `${c.extra}${layout.extraPreamble ?? ''}`;
    return buildPreamble({
        fontSize,
        fontPkg: c.fontPkg,
        geometry,
        colors: c.colors,
        sectionFmt: c.sectionFmt,
        commands: c.commands,
        lineSpread,
        extra,
    });
}

// ============================================================================
// Header Generators — each template has a distinct header layout
// ============================================================================

function modernHeader(p: PI): string {
    const parts = buildContactParts(p, { underline: true });
    return `
\\begin{center}
    {\\Huge\\scshape ${escapeLatex(p.name)}}\\par\\vspace{2pt}
    ${p.title ? `{\\small ${escapeLatex(p.title)}}\\par\\vspace{4pt}` : ''}
    ${p.tagline ? `{\\small\\itshape ${escapeLatex(p.tagline)}}\\par\\vspace{4pt}` : ''}
    {\\small ${parts.join('{\\,\\textbar\\,}')}}
\\end{center}
`;
}

function classicHeader(p: PI): string {
    const emailEsc = escapeLatex(p.email);
    const phoneEsc = escapeLatex(p.phone);
    const li = hrefUrl(p.linkedin);
    const port = hrefUrl(p.portfolio);

    const rightLines: string[] = [];
    if (p.email) rightLines.push(`Email: \\href{mailto:${p.email}}{${emailEsc}}`);
    if (p.phone) rightLines.push(`Phone: ${phoneEsc}`);
    if (li) rightLines.push(`\\href{${safeHref(li)}}{LinkedIn}`);
    if (port) rightLines.push(`\\href{${safeHref(port)}}{Portfolio}`);

    return `
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  \\textbf{\\Large ${escapeLatex(p.name)}} & ${rightLines[0] || ''} \\\\
  ${p.title ? `\\textit{${escapeLatex(p.title)}}` : ''} & ${rightLines[1] || ''} \\\\
  ${rightLines.length > 2 ? `& ${rightLines.slice(2).join(' $\\cdot$ ')} \\\\` : ''}
\\end{tabular*}
\\vspace{2pt}
`;
}

function atsHeader(p: PI): string {
    const parts: string[] = [];
    if (p.phone) parts.push(escapeLatex(p.phone));
    if (p.email) parts.push(`\\href{mailto:${p.email}}{${escapeLatex(p.email)}}`);
    const li = hrefUrl(p.linkedin);
    if (li) parts.push(`\\href{${safeHref(li)}}{LinkedIn}`);

    return `
\\begin{center}
    \\textbf{\\Huge ${escapeLatex(p.name)}}\\par\\vspace{4pt}
    ${p.title ? `{\\large ${escapeLatex(p.title)}}\\par\\vspace{4pt}` : ''}
    {\\small ${parts.join(' \\textbar{} ')}}
\\end{center}
`;
}

function executiveHeader(p: PI): string {
    const parts: string[] = [];
    if (p.phone) parts.push(escapeLatex(p.phone));
    if (p.email) parts.push(`\\href{mailto:${p.email}}{${escapeLatex(p.email)}}`);
    const li = hrefUrl(p.linkedin);
    if (li) parts.push(`\\href{${safeHref(li)}}{LinkedIn}`);
    const port = hrefUrl(p.portfolio);
    if (port) parts.push(`\\href{${safeHref(port)}}{Portfolio}`);

    return `
\\begin{center}
    {\\fontsize{21}{25}\\selectfont\\scshape ${escapeLatex(p.name)}}\\par\\vspace{4pt}
    ${p.title ? `{\\large\\itshape ${escapeLatex(p.title)}}\\par\\vspace{4pt}` : ''}
    {\\small ${parts.join(' $\\cdot$ ')}}
\\end{center}
\\vspace{1pt}
\\noindent\\rule{\\textwidth}{0.5pt}
\\vspace{1pt}
`;
}

function minimalHeader(p: PI): string {
    const parts: string[] = [];
    if (p.email) parts.push(`\\href{mailto:${p.email}}{${escapeLatex(p.email)}}`);
    if (p.phone) parts.push(escapeLatex(p.phone));
    const li = hrefUrl(p.linkedin);
    if (li) parts.push(`\\href{${safeHref(li)}}{LinkedIn}`);
    const port = hrefUrl(p.portfolio);
    if (port) parts.push(`\\href{${safeHref(port)}}{Portfolio}`);

    return `
\\noindent{\\LARGE\\bfseries ${escapeLatex(p.name)}}\\par\\vspace{2pt}
${p.title ? `\\noindent{\\normalsize\\color{gray} ${escapeLatex(p.title)}}\\par\\vspace{6pt}` : '\\vspace{4pt}'}
\\noindent{\\small ${parts.join('{\\,\\textbar\\,}')}}\\par\\vspace{3pt}
`;
}

function compactHeader(p: PI): string {
    const parts: string[] = [];
    if (p.phone) parts.push(escapeLatex(p.phone));
    if (p.email) parts.push(`\\href{mailto:${p.email}}{\\color{accent}${escapeLatex(p.email)}}`);
    const li = hrefUrl(p.linkedin);
    if (li) parts.push(`\\href{${safeHref(li)}}{\\color{accent}LinkedIn}`);
    const port = hrefUrl(p.portfolio);
    if (port) parts.push(`\\href{${safeHref(port)}}{\\color{accent}Portfolio}`);

    return `
\\begin{center}
    {\\large\\bfseries ${escapeLatex(p.name)}}\\par\\vspace{2pt}
    ${p.title ? `{\\scriptsize\\color{accent} ${escapeLatex(p.title)}}\\par\\vspace{2pt}` : ''}
    {\\footnotesize ${parts.join('{\\,\\textbar\\,}')}}
\\end{center}
\\vspace{6pt}
`;
}

function creativeHeader(p: PI): string {
    const parts = buildContactParts(p, { linkColor: 'primary' });
    return `
\\vspace*{10pt}
\\begin{center}
    {\\fontsize{22}{26}\\selectfont\\bfseries\\color{primary} ${escapeLatex(p.name)}}\\par\\vspace{1pt}
    ${p.title ? `{\\large\\color{gray} ${escapeLatex(p.title)}}\\par\\vspace{2pt}` : ''}
    ${p.tagline ? `{\\itshape\\color{primary!60!black} ${escapeLatex(p.tagline)}}\\par\\vspace{2pt}` : ''}
    {\\small ${parts.join(' $\\diamond$ ')}}
\\end{center}
\\vspace{-4pt}
`;
}

function techHeader(p: PI): string {
    const parts: string[] = [];
    if (p.email) parts.push(`\\href{mailto:${p.email}}{${escapeLatex(p.email)}}`);
    if (p.phone) parts.push(escapeLatex(p.phone));
    const li = hrefUrl(p.linkedin);
    if (li) parts.push(`\\href{${safeHref(li)}}{linkedin}`);
    const port = hrefUrl(p.portfolio);
    if (port) parts.push(`\\href{${safeHref(port)}}{portfolio}`);

    return `
\\noindent{\\fontsize{19}{23}\\selectfont\\ttfamily\\bfseries ${escapeLatex(p.name)}}\\par\\vspace{3pt}
${p.title ? `\\noindent{\\ttfamily\\small\\color{techgray} // ${escapeLatex(p.title)}}\\par\\vspace{3pt}` : ''}
\\noindent{\\ttfamily\\footnotesize ${parts.join('{\\,\\textbar\\,}')}}
\\vspace{3pt}
\\noindent\\rule{\\textwidth}{0.4pt}
`;
}

function getHeader(t: TemplateType, p: PI): string {
    switch (t) {
        case 'modern':    return modernHeader(p);
        case 'classic':   return classicHeader(p);
        case 'ats':       return atsHeader(p);
        case 'executive': return executiveHeader(p);
        case 'minimal':   return minimalHeader(p);
        case 'compact':   return compactHeader(p);
        case 'creative':  return creativeHeader(p);
        case 'tech':      return techHeader(p);
        default:          return modernHeader(p);
    }
}

// ============================================================================
// Section Generators — template-aware formatting
// ============================================================================

function educationHasContent(edu: ResumeData['education']): boolean {
    const i = (edu.institution ?? '').trim();
    const d = (edu.degree ?? '').trim();
    const dt = (edu.dates ?? '').trim();
    if (!i && !d && !dt) return false;
    const ph = (s: string) => /^(institution|degree|dates)$/i.test(s);
    if (ph(i) && ph(d) && ph(dt)) return false;
    return true;
}

/** Summary / Professional Summary */
function summarySection(t: TemplateType, summary: string): string {
    if (!summary) return '';
    const esc = escapeLatex(summary);

    switch (t) {
        case 'executive':
            return `
\\section{Professional Summary}
\\resumeSubHeadingListStart
\\resumeItem{${esc}}
\\resumeSubHeadingListEnd
\\vspace{2pt}
`;
        case 'minimal':
            return `
\\section{Summary}
{\\small ${esc}}
\\vspace{3pt}
`;
        case 'compact':
            return `
\\section{Summary}
{\\small ${esc}}
\\vspace{10pt}
`;
        case 'classic':
            return `
\\section{Summary}
\\resumeSubHeadingListStart
\\resumeItem{${esc}}
\\resumeSubHeadingListEnd
\\vspace{6pt}
`;
        case 'tech':
            return `
\\section{Summary}
\\resumeSubHeadingListStart
\\resumeItem{${esc}}
\\resumeSubHeadingListEnd
\\vspace{2pt}
`;
        case 'creative':
            return `
\\section{Summary}
\\resumeSubHeadingListStart
\\resumeItem{${esc}}
\\resumeSubHeadingListEnd
\\vspace{2pt}
`;
        default:
            return `
\\section{Summary}
\\resumeSubHeadingListStart
\\resumeItem{${esc}}
\\resumeSubHeadingListEnd
\\vspace{6pt}
`;
    }
}

/** Skills — formatting varies significantly per template */
function skillsSection(t: TemplateType, skills: ResumeData['skills']): string {
    if (skills.length === 0) return '';

    switch (t) {
        // Executive: two-column tabular (bold category | items)
        case 'executive':
            return `
\\section{Core Competencies}
\\renewcommand{\\arraystretch}{1.15}
\\begin{tabularx}{\\textwidth}{@{}>{{\\bfseries}}l@{\\hskip 10pt}X@{}}
${skills.map((s) => `${escapeLatex(s.category)} & ${escapeLatex(s.items)} \\\\`).join('\n')}
\\end{tabularx}
\\vspace{8pt}
`;
        // Minimal: clean inline, no list environment
        case 'minimal':
            return `
\\section{Skills}
${skills.map((s) => `\\noindent\\textbf{${escapeLatex(s.category)}:} ${escapeLatex(s.items)}`).join('\\par\\vspace{3pt}\n')}
\\vspace{3pt}
`;
        // Tech: monospace categories
        case 'tech':
            return `
\\section{Skills}
\\resumeSubHeadingListStart
${skills.map((s) => `\\resumeItem{\\texttt{${escapeLatex(s.category)}:} ${escapeLatex(s.items)}}`).join('\n')}
\\resumeSubHeadingListEnd
`;
        // Creative: colored categories
        case 'creative':
            return `
\\section{Skills}
\\resumeSubHeadingListStart
${skills.map((s) => `\\resumeItem{\\textbf{\\color{primary}${escapeLatex(s.category)}:} ${escapeLatex(s.items)}}`).join('\n')}
\\resumeSubHeadingListEnd
`;
        // Compact left-column: dense scriptsize
        case 'compact':
            return `
\\section{Skills}
${skills.map((s) => `{\\scriptsize\\textbf{${escapeLatex(s.category)}:} ${escapeLatex(s.items)}}\\par\\vspace{2pt}`).join('\n')}
`;
        // Classic: inline dash-separated
        case 'classic':
            return `
\\section{Skills}
\\vspace{4pt}
${skills.map((s) => `\\noindent\\textbf{${escapeLatex(s.category)}:} ${escapeLatex(s.items)}`).join('\\par\\vspace{6pt}\n')}
\\vspace{6pt}
`;
        // Modern, ATS: standard bullet list
        default:
            return `
\\section{Skills}
\\resumeSubHeadingListStart
${skills.map((s) => `\\resumeItem{\\textbf{${escapeLatex(s.category)}:} ${escapeLatex(s.items)}}`).join('\n')}
\\resumeSubHeadingListEnd
`;
    }
}

/** Experience — uses \\resumeSubheading (styled per-template via preamble) */
function experienceSection(t: TemplateType, experience: ResumeData['experience']): string {
    if (experience.length === 0) return '';

    const sectionName = t === 'executive' ? 'Professional Experience' : 'Experience';

    const entries = experience
        .map((exp) => {
            const bullets = exp.bullets
                .map((b) => `\\resumeItem{${escapeLatex(b)}}`)
                .join('\n');
            return `
\\resumeSubheading
{${escapeLatex(exp.title)}}{${escapeLatex(exp.dates)}}
{${escapeLatex(exp.company)}}{${escapeLatex(exp.location || '')}}
\\resumeItemListStart
${bullets}
\\resumeItemListEnd`;
        })
        .join('\n');

    return `
\\section{${sectionName}}
\\resumeSubHeadingListStart
${entries}
\\resumeSubHeadingListEnd
`;
}

/** Education */
function educationSection(t: TemplateType, edu: ResumeData['education']): string {
    if (!educationHasContent(edu)) return '';

    // Compact uses simpler formatting for narrow left column
    if (t === 'compact') {
        return `
\\section{Education}
{\\small\\textbf{${escapeLatex(edu.institution)}}}\\\\
{\\scriptsize\\textit{${escapeLatex(edu.degree)}}}\\\\
{\\scriptsize ${escapeLatex(edu.dates)}${edu.gpa ? ` \\hfill GPA: \\textbf{${escapeLatex(edu.gpa)}}` : ''}}
\\vspace{10pt}
`;
    }

    const tail = t === 'creative' ? '\\vspace{2pt}\n' : '\n';
    return `
\\section{Education}
\\resumeSubHeadingListStart
\\resumeSubheading
{${escapeLatex(edu.institution)}}{${escapeLatex(edu.dates)}}
{${escapeLatex(edu.degree)}}{${edu.gpa ? `GPA: \\textbf{${escapeLatex(edu.gpa)}}` : ''}}
\\resumeSubHeadingListEnd${tail}`;
}

/** Certifications */
function certificationsSection(t: TemplateType, certs: string[]): string {
    if (certs.length === 0) return '';

    if (t === 'compact') {
        return `
\\section{Certifications}
\\begin{itemize}[leftmargin=0.1in,label=\\textbullet,itemsep=0pt,topsep=0pt,parsep=0pt]
${certs.map((c) => `\\item {\\scriptsize ${escapeLatex(c)}}`).join('\n')}
\\end{itemize}
`;
    }

    const tail = '';
    return `
\\section{Certifications}
\\resumeSubHeadingListStart
${certs.map((c) => `\\resumeItem{${escapeLatex(c)}}`).join('\n')}
\\resumeSubHeadingListEnd${tail}
`;
}

// ============================================================================
// Compact Two-Column Layout
// ============================================================================

function generateCompactLatex(data: ResumeData): string {
    const { personalInfo, summary, skills, experience, education, certifications } = data;

    const layout = resolveLayout(data, 'compact');
    const preamble = getPreamble('compact', layout);
    const header = compactHeader(personalInfo);

    // ---- LEFT COLUMN: Education, Skills, Certifications ----
    const leftParts: string[] = [];
    leftParts.push(educationSection('compact', education));
    if (skills.length > 0) leftParts.push(skillsSection('compact', skills));
    if (certifications.length > 0) leftParts.push(certificationsSection('compact', certifications));

    // ---- RIGHT COLUMN: Summary, Experience ----
    const rightParts: string[] = [];
    if (summary) rightParts.push(summarySection('compact', summary));
    if (experience.length > 0) rightParts.push(experienceSection('compact', experience));

    return `${preamble}
${header}
\\vspace{4pt}
\\noindent
\\begin{minipage}[t]{0.31\\textwidth}
${leftParts.join('\n')}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.655\\textwidth}
${rightParts.join('\n')}
\\end{minipage}

\\end{document}`;
}

// ============================================================================
// Main Export
// ============================================================================

export function generateLatex(data: ResumeData, template: TemplateType = 'modern'): string {
    // Compact has a fundamentally different two-column layout
    if (template === 'compact') {
        return generateCompactLatex(data);
    }

    const { personalInfo, summary, skills, experience, education, certifications } = data;

    const layout = resolveLayout(data, template);
    const preamble = getPreamble(template, layout);
    const header = getHeader(template, personalInfo);
    const sections = [
        summarySection(template, summary),
        skillsSection(template, skills),
        experienceSection(template, experience),
        educationSection(template, education),
        certificationsSection(template, certifications),
    ].join('\n');

    return `${preamble}
${header}
${sections}
\\end{document}`;
}
