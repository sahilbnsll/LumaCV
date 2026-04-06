import { DEFAULT_SECTION_ORDER, ResumeData, ResumeSectionKey, TemplateType } from './resume-schema';
import { escapeLatex } from './latex-escape';
import { estimateResumeVolume, resolveLayout, type LayoutAdjust } from './latex-layout';

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
    const gh = hrefUrl(p.github);
    if (gh) parts.push(wrapLink(gh, stripScheme(p.github!)));
    const port = hrefUrl(p.portfolio);
    if (port) parts.push(wrapLink(port, stripScheme(p.portfolio!)));
    if (p.location) parts.push(escapeLatex(p.location));
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
\\usepackage[usenames,dvipsnames]{xcolor}
\\usepackage[hidelinks]{hyperref}
${o.fontPkg}
\\usepackage[${o.geometry}]{geometry}
\\pagestyle{empty}
\\setlength{\\headheight}{0pt}
\\setlength{\\headsep}{0pt}
\\setlength{\\tabcolsep}{0in}
\\setlength{\\parindent}{0pt}
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
  \\vspace{1pt}\\item
    {\\textbf{#1}}\\hfill {#2}\\\\
    {\\textit{\\small #3}}\\hfill {\\textit{\\small #4}}\\vspace{2pt}
}
\\newcommand{\\resumeSubheadingTwo}[2]{
  \\vspace{1pt}\\item
    {\\textbf{#1}}\\hfill {#2}\\vspace{2pt}
}`;

const SUBHEADING_EXECUTIVE = `\\newcommand{\\resumeSubheading}[4]{
  \\vspace{2pt}\\item
    {\\large\\textbf{#1}}\\hfill {\\small #2}\\\\
    {\\textit{#3}}\\hfill {\\textit{\\small #4}}\\vspace{2pt}
}
\\newcommand{\\resumeSubheadingTwo}[2]{
  \\vspace{2pt}\\item
    {\\large\\textbf{#1}}\\hfill {\\small #2}\\vspace{2pt}
}`;

const SUBHEADING_CREATIVE = `\\newcommand{\\resumeSubheading}[4]{
  \\vspace{1pt}\\item
    {\\textbf{\\color{primary}#1}}\\hfill {#2}\\\\
    {\\textit{\\small\\color{primary!70!black}#3}}\\hfill {\\textit{\\small #4}}\\vspace{1pt}
}
\\newcommand{\\resumeSubheadingTwo}[2]{
  \\vspace{1pt}\\item
    {\\textbf{\\color{primary}#1}}\\hfill {#2}\\vspace{1pt}
}`;

const SUBHEADING_TECH = `\\newcommand{\\resumeSubheading}[4]{
  \\vspace{1pt}\\item
    {\\texttt{\\textbf{#1}}}\\hfill {\\small\\ttfamily #2}\\\\
    {\\textit{\\small #3}}\\hfill {\\textit{\\small #4}}\\vspace{1pt}
}
\\newcommand{\\resumeSubheadingTwo}[2]{
  \\vspace{1pt}\\item
    {\\texttt{\\textbf{#1}}}\\hfill {\\small\\ttfamily #2}\\vspace{1pt}
}`;

/** Classic: even vertical rhythm between experience/education blocks */
const SUBHEADING_CLASSIC = `\\newcommand{\\resumeSubheading}[4]{
  \\vspace{1pt}\\item
    {\\textbf{#1}}\\hfill {#2}\\\\
    {\\textit{\\small #3}}\\hfill {\\textit{\\small #4}}\\vspace{2pt}
}
\\newcommand{\\resumeSubheadingTwo}[2]{
  \\vspace{1pt}\\item
    {\\textbf{#1}}\\hfill {#2}\\vspace{2pt}
}`;

/** Compact: avoid negative vglue inside narrow minipage (prevents overlap) */
const SUBHEADING_COMPACT = `\\newcommand{\\resumeSubheading}[4]{
  \\vspace{1pt}\\item
    {\\textbf{#1}}\\hfill {\\footnotesize #2}\\\\
    {\\textit{\\scriptsize #3}}\\hfill {\\textit{\\scriptsize #4}}\\vspace{1pt}
}
\\newcommand{\\resumeSubheadingTwo}[2]{
  \\vspace{1pt}\\item
    {\\textbf{#1}}\\hfill {\\footnotesize #2}\\vspace{1pt}
}`;

/** Common list command definitions */
function listCmds(): string {
    return `
\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}\\setlength{\\itemsep}{1pt}\\setlength{\\topsep}{3pt}\\setlength{\\parsep}{1pt}}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}\\setlength{\\itemsep}{1pt}\\setlength{\\topsep}{2pt}\\setlength{\\parsep}{1pt}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{3pt}}`;
}

/** Compact minipage: readable density without negative vglue overlap */
function listCmdsCompact(): string {
    return `
\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}\\setlength{\\itemsep}{1pt}\\setlength{\\topsep}{2pt}\\setlength{\\parsep}{1pt}}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}\\setlength{\\itemsep}{1pt}\\setlength{\\topsep}{1pt}\\setlength{\\parsep}{1pt}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{3pt}}`;
}

/** Tightly compressed lists for creative/long resumes */
function listCmdsCreative(): string {
    return `
\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}\\setlength{\\itemsep}{0pt}\\setlength{\\topsep}{1pt}\\setlength{\\parsep}{0pt}}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}\\setlength{\\itemsep}{0pt}\\setlength{\\topsep}{1pt}\\setlength{\\parsep}{0pt}}
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
        fontPkg: '',
        geometry: 'top=0.34in,bottom=0.34in,left=0.38in,right=0.38in',
        geometryRelaxed: 'top=0.5in,bottom=0.5in,left=0.5in,right=0.5in',
        colors: '\\definecolor{linkblue}{HTML}{0077B5}',
        sectionFmt:
            '\\makeatletter\\renewcommand\\section{\\@startsection{section}{1}{0pt}{4pt}{2pt}{\\normalfont\\scshape\\raggedright\\normalsize}}\\makeatother',
        commands: SUBHEADING_DEFAULT + listCmds(),
        lineSpread: '\\linespread{0.91}',
        lineSpreadRelaxed: '\\linespread{0.98}',
        extra: '',
    },
    classic: {
        fontSize: '10pt',
        fontPkg: '',
        geometry: 'top=0.34in,bottom=0.34in,left=0.38in,right=0.38in',
        geometryRelaxed: 'top=0.58in,bottom=0.58in,left=0.62in,right=0.62in',
        colors: '',
        sectionFmt:
            '\\makeatletter\\renewcommand\\section{\\@startsection{section}{1}{0pt}{4pt}{2pt}{\\normalfont\\bfseries\\raggedright\\normalsize\\MakeUppercase}}\\makeatother',
        commands: SUBHEADING_CLASSIC + listCmds(),
        lineSpread: '\\linespread{0.92}',
        lineSpreadRelaxed: '\\linespread{1.02}',
        extra: '',
    },
    ats: {
        fontSize: '10pt',
        fontPkg: '',
        geometry: 'top=0.34in,bottom=0.34in,left=0.38in,right=0.38in',
        geometryRelaxed: 'top=0.5in,bottom=0.5in,left=0.5in,right=0.5in',
        colors: '',
        sectionFmt:
            '\\makeatletter\\renewcommand\\section{\\@startsection{section}{1}{0pt}{4pt}{2pt}{\\normalfont\\bfseries\\raggedright\\normalsize}}\\makeatother',
        commands: SUBHEADING_DEFAULT + listCmds(),
        lineSpread: '\\linespread{0.92}',
        lineSpreadRelaxed: '\\linespread{1.0}',
        extra: '',
    },
    executive: {
        fontSize: '10pt',
        fontPkg: '',
        geometry: 'top=0.34in,bottom=0.34in,left=0.38in,right=0.38in',
        geometryRelaxed: 'top=0.56in,bottom=0.56in,left=0.58in,right=0.58in',
        colors: '\\definecolor{darknavy}{HTML}{172033}\n\\definecolor{startupaccent}{HTML}{0F766E}',
        sectionFmt:
            '\\makeatletter\\renewcommand\\section{\\@startsection{section}{1}{0pt}{4pt}{1pt}{\\normalfont\\color{startupaccent}\\bfseries\\raggedright\\normalsize}}\\makeatother',
        commands: SUBHEADING_EXECUTIVE + listCmds(),
        lineSpread: '\\linespread{0.93}',
        lineSpreadRelaxed: '\\linespread{1.05}',
        extra: '',
    },
    minimal: {
        fontSize: '10pt',
        fontPkg: '',
        geometry: 'top=0.34in,bottom=0.34in,left=0.4in,right=0.4in',
        geometryRelaxed: 'top=0.72in,bottom=0.72in,left=0.76in,right=0.76in',
        colors: '',
        sectionFmt: '\\makeatletter\\renewcommand\\section{\\@startsection{section}{1}{0pt}{4pt}{2pt}{\\normalfont\\bfseries\\raggedright\\normalsize}}\\makeatother',
        commands: SUBHEADING_DEFAULT + listCmds(),
        lineSpread: '\\linespread{0.94}',
        lineSpreadRelaxed: '\\linespread{1.08}',
        extra: '',
    },
    compact: {
        fontSize: '9pt',
        fontPkg: '',
        geometry: 'top=0.30in,bottom=0.30in,left=0.34in,right=0.34in',
        geometryRelaxed: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in',
        fontSizeRelaxed: '9pt',
        colors: '\\definecolor{accent}{HTML}{3E0097}',
        sectionFmt:
            '\\makeatletter\\renewcommand\\section{\\@startsection{section}{1}{0pt}{3pt}{1pt}{\\normalfont\\color{accent}\\bfseries\\scshape\\raggedright\\normalsize}}\\makeatother',
        commands: SUBHEADING_COMPACT + listCmdsCompact(),
        lineSpread: '\\linespread{0.93}',
        lineSpreadRelaxed: '\\linespread{0.98}',
        extra: '',
    },
    creative: {
        fontSize: '10pt',
        fontPkg: '',
        geometry: 'top=0.34in,bottom=0.34in,left=0.42in,right=0.42in',
        geometryRelaxed: 'top=0.52in,bottom=0.52in,left=0.54in,right=0.54in',
        colors: '\\definecolor{primary}{HTML}{1D4ED8}\n\\definecolor{lightbg}{HTML}{E8F4F8}\n\\definecolor{academicink}{HTML}{1E293B}',
        sectionFmt: '\\makeatletter\\renewcommand\\section{\\@startsection{section}{1}{0pt}{4pt}{1pt}{\\normalfont\\raggedright\\bfseries\\color{academicink}}}\\makeatother',
        commands: SUBHEADING_CREATIVE + listCmdsCreative(),
        lineSpread: '\\linespread{0.92}',
        lineSpreadRelaxed: '\\linespread{1.0}',
        extra: '',
    },
    tech: {
        fontSize: '10pt',
        fontPkg: '',
        geometry: 'top=0.34in,bottom=0.34in,left=0.38in,right=0.38in',
        geometryRelaxed: 'top=0.52in,bottom=0.52in,left=0.52in,right=0.52in',
        colors: '\\definecolor{techgray}{RGB}{80,80,80}',
        sectionFmt:
            '\\makeatletter\\renewcommand\\section{\\@startsection{section}{1}{0pt}{4pt}{2pt}{\\normalfont\\ttfamily\\bfseries\\raggedright\\normalsize}}\\makeatother',
        commands: SUBHEADING_TECH + listCmds(),
        lineSpread: '\\linespread{0.90}',
        lineSpreadRelaxed: '\\linespread{0.98}',
        extra: '',
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
\\vspace*{8pt}
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
    const gh = hrefUrl(p.github);
    if (gh) rightLines.push(`\\href{${safeHref(gh)}}{GitHub}`);
    if (port) rightLines.push(`\\href{${safeHref(port)}}{Portfolio}`);
    if (p.location) rightLines.push(escapeLatex(p.location));

    return `
\\vspace*{8pt}
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
    const gh = hrefUrl(p.github);
    if (gh) parts.push(`\\href{${safeHref(gh)}}{GitHub}`);
    if (p.location) parts.push(escapeLatex(p.location));

    return `
\\vspace*{8pt}
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
    const gh = hrefUrl(p.github);
    if (gh) parts.push(`\\href{${safeHref(gh)}}{GitHub}`);
    const port = hrefUrl(p.portfolio);
    if (port) parts.push(`\\href{${safeHref(port)}}{Portfolio}`);
    if (p.location) parts.push(escapeLatex(p.location));

    return `
\\vspace*{8pt}
\\noindent{\\fontsize{20}{24}\\selectfont\\bfseries ${escapeLatex(p.name)}}\\par\\vspace{2pt}
${p.title ? `\\noindent{\\small\\color{startupaccent} ${escapeLatex(p.title)}}\\par\\vspace{4pt}` : ''}
\\noindent{\\small ${parts.join(' $\\cdot$ ')}}\\par\\vspace{3pt}
\\noindent\\rule{\\textwidth}{0.6pt}
\\vspace{2pt}
`;
}

function minimalHeader(p: PI): string {
    const parts: string[] = [];
    if (p.email) parts.push(`\\href{mailto:${p.email}}{${escapeLatex(p.email)}}`);
    if (p.phone) parts.push(escapeLatex(p.phone));
    const li = hrefUrl(p.linkedin);
    if (li) parts.push(`\\href{${safeHref(li)}}{LinkedIn}`);
    const gh = hrefUrl(p.github);
    if (gh) parts.push(`\\href{${safeHref(gh)}}{GitHub}`);
    const port = hrefUrl(p.portfolio);
    if (port) parts.push(`\\href{${safeHref(port)}}{Portfolio}`);
    if (p.location) parts.push(escapeLatex(p.location));

    return `
\\vspace*{8pt}
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
    const gh = hrefUrl(p.github);
    if (gh) parts.push(`\\href{${safeHref(gh)}}{\\color{accent}GitHub}`);
    const port = hrefUrl(p.portfolio);
    if (port) parts.push(`\\href{${safeHref(port)}}{\\color{accent}Portfolio}`);
    if (p.location) parts.push(escapeLatex(p.location));

    return `
\\vspace*{8pt}
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
\\vspace*{12pt}
\\begin{center}
    {\\fontsize{21}{25}\\selectfont\\bfseries\\color{academicink} ${escapeLatex(p.name)}}\\par\\vspace{2pt}
    ${p.title ? `{\\normalsize\\color{primary} ${escapeLatex(p.title)}}\\par\\vspace{2pt}` : ''}
    ${p.tagline ? `{\\small\\itshape\\color{academicink} ${escapeLatex(p.tagline)}}\\par\\vspace{2pt}` : ''}
    {\\small ${parts.join(' $\\diamond$ ')}}
\\end{center}
\\vspace{-2pt}
`;
}

function techHeader(p: PI): string {
    const parts: string[] = [];
    if (p.email) parts.push(`\\href{mailto:${p.email}}{${escapeLatex(p.email)}}`);
    if (p.phone) parts.push(escapeLatex(p.phone));
    const li = hrefUrl(p.linkedin);
    if (li) parts.push(`\\href{${safeHref(li)}}{linkedin}`);
    const gh = hrefUrl(p.github);
    if (gh) parts.push(`\\href{${safeHref(gh)}}{github}`);
    const port = hrefUrl(p.portfolio);
    if (port) parts.push(`\\href{${safeHref(port)}}{portfolio}`);
    if (p.location) parts.push(escapeLatex(p.location));

    return `
\\vspace*{8pt}
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
    if (!edu || edu.length === 0) return false;
    const first = edu[0];
    const i = (first?.institution ?? '').trim();
    const d = (first?.degree ?? '').trim();
    const dt = (first?.dates ?? '').trim();
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

function simpleParagraphSection(title: string, value: string | undefined): string {
    if (!value) return '';
    return `
\\section{${escapeLatex(title)}}
{\\small ${escapeLatex(value)}}
\\vspace{3pt}
`;
}

function simpleBulletSection(title: string, items: string[]): string {
    const clean = items.map((item) => item.trim()).filter(Boolean);
    if (clean.length === 0) return '';
    return `
\\section{${escapeLatex(title)}}
\\resumeSubHeadingListStart
${clean.map((item) => `\\resumeItem{${escapeLatex(item)}}`).join('\n')}
\\resumeSubHeadingListEnd
`;
}

function simpleLineSection(
    title: string,
    items: Array<{ primary: string; secondary?: string; tertiary?: string; link?: string }>
): string {
    const clean = items.filter((item) => item.primary.trim().length > 0);
    if (clean.length === 0) return '';
    return `
\\section{${escapeLatex(title)}}
\\resumeSubHeadingListStart
${clean
    .map((item) => {
        let str = `\\textbf{${escapeLatex(item.primary)}}`;
        if (item.secondary) str += ` --- ${escapeLatex(item.secondary)}`;
        if (item.tertiary) str += ` (${escapeLatex(item.tertiary)})`;
        if (item.link) str += ` \\href{${safeHref(item.link)}}{[Link]}`;
        return `\\resumeItem{${str}}`;
    })
    .join('\n')}
\\resumeSubHeadingListEnd
`;
}

/** Skills — formatting varies significantly per template */
function skillsSection(t: TemplateType, skills: ResumeData['skills']): string {
    if (skills.length === 0) return '';

    switch (t) {
        // Executive: two-column tabular (bold category | items)
        case 'executive':
            return `
\\section{Core Competencies}
\\resumeSubHeadingListStart
${skills.map((s) => `\\resumeItem{\\textbf{${escapeLatex(s.category)}:} ${escapeLatex(s.items)}}`).join('\n')}
\\resumeSubHeadingListEnd
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
            const rightLine = escapeLatex(exp.dates);
            const subLine = escapeLatex(exp.company);
            const subRight = escapeLatex(exp.location || '');
            
            const heading = (!subLine && !subRight)
                ? `\\resumeSubheadingTwo\n{${escapeLatex(exp.title)}}{${rightLine}}`
                : `\\resumeSubheading\n{${escapeLatex(exp.title)}}{${rightLine}}\n{${subLine}}{${subRight}}`;
                
            return `
${heading}
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

    if (t === 'compact') {
        const entries = edu.map(e => `{\\small\\textbf{${escapeLatex(e.institution)}}}\\\\\n{\\scriptsize\\textit{${escapeLatex([e.degree, e.fieldOfStudy].filter(Boolean).join(', '))}}}\\\\\n{\\scriptsize ${escapeLatex(e.dates)}${e.gpa ? ` \\hfill GPA: \\textbf{${escapeLatex(e.gpa)}}` : ''}}${e.honors ? `\\\\\n{\\scriptsize ${escapeLatex(e.honors)}}` : ''}`).join('\\vspace{4pt}\n');
        return `
\\section{Education}
${entries}
\\vspace{10pt}
`;
    }

    const tail = t === 'creative' ? '\\vspace{2pt}\n' : '\n';
    const entries = edu.map(e => {
        const titleLine = escapeLatex(e.institution);
        const rightLine = escapeLatex(e.dates);
        const subLine = escapeLatex([e.degree, e.fieldOfStudy].filter(Boolean).join(', '));
        const subRight = [e.gpa ? `GPA: \\textbf{${escapeLatex(e.gpa)}}` : '', e.location ? escapeLatex(e.location) : ''].filter(Boolean).join(' \\quad ');
        
        if (!subLine && !subRight) {
            return `\\resumeSubheadingTwo\n{${titleLine}}{${rightLine}}`;
        }
        return `\\resumeSubheading\n{${titleLine}}{${rightLine}}\n{${subLine}}{${subRight}}`;
    }).join('\n');
    
    return `
\\section{Education}
\\resumeSubHeadingListStart
${entries}
\\resumeSubHeadingListEnd${tail}`;
}

/** Projects */
function projectsSection(t: TemplateType, projects: ResumeData['projects']): string {
    if (!projects || projects.length === 0) return '';

    const entries = projects.map(p => {
        const titleLine = `\\textbf{${escapeLatex(p.name)}}${p.link ? ` {\\footnotesize \\href{${safeHref(p.link)}}{[Link]}}` : ''}`;
        const rightLine = escapeLatex(p.dates || p.role || '');
        const subLine = escapeLatex([p.role, p.techStack].filter(Boolean).join(' | '));
        
        const projectBullets = [
            ...(p.description ? [p.description] : []),
            ...(p.impact ? [p.impact] : []),
            ...(p.bullets ?? []),
        ].filter(Boolean);
        const bullets = projectBullets.length > 0
            ? `\\resumeItemListStart\n${projectBullets.map(b => `\\resumeItem{${escapeLatex(b)}}`).join('\n')}\n\\resumeItemListEnd`
            : '';

        if (!subLine) {
            return `\\resumeSubheadingTwo\n{${titleLine}}{${rightLine}}\n${bullets}`;
        }
        return `\\resumeSubheading\n{${titleLine}}{${rightLine}}\n{${subLine}}{}\n${bullets}`;
    }).join('\n');
    
    return `
\\section{Projects}
\\resumeSubHeadingListStart
${entries}
\\resumeSubHeadingListEnd
`;
}

/** Certifications */
function certificationsSection(t: TemplateType, certs: ResumeData['certifications']): string {
    if (!certs || certs.length === 0) return '';

    if (t === 'compact') {
        return `
\\section{Certifications}
\\begin{itemize}\\setlength{\\itemsep}{0pt}\\setlength{\\topsep}{0pt}\\setlength{\\parsep}{0pt}
${certs.map((c) => `\\item {\\scriptsize ${escapeLatex(c.name)}${c.issuer ? ` - ${escapeLatex(c.issuer)}` : ''}}`).join('\n')}
\\end{itemize}
`;
    }

    return `
\\section{Certifications}
\\resumeSubHeadingListStart
${certs.map((c) => {
    let str = `\\textbf{${escapeLatex(c.name)}}`;
    if (c.issuer) str += ` --- ${escapeLatex(c.issuer)}`;
    if (c.date) str += ` (${escapeLatex(c.date)})`;
    if (c.expiryDate) str += ` [Expires: ${escapeLatex(c.expiryDate)}]`;
    if (c.credentialId) str += ` {\\small ID: ${escapeLatex(c.credentialId)}}`;
    if (c.link) str += ` \\href{${safeHref(c.link)}}{[Link]}`;
    return `\\resumeItem{${str}}`;
}).join('\n')}
\\resumeSubHeadingListEnd
`;
}

/** Publications */
function publicationsSection(t: TemplateType, pubs: ResumeData['publications']): string {
    if (!pubs || pubs.length === 0) return '';
    return `
\\section{Publications}
\\resumeSubHeadingListStart
${pubs.map((p) => {
    let str = `\\textbf{${escapeLatex(p.title)}}`;
    if (p.platform) str += ` --- ${escapeLatex(p.platform)}`;
    if (p.date) str += ` (${escapeLatex(p.date)})`;
    if (p.authors) str += ` {\\small ${escapeLatex(p.authors)}}`;
    if (p.description) str += ` --- ${escapeLatex(p.description)}`;
    if (p.link) str += ` \\href{${safeHref(p.link)}}{[Link]}`;
    return `\\resumeItem{${str}}`;
}).join('\n')}
\\resumeSubHeadingListEnd
`;
}

/** Achievements */
function achievementsSection(t: TemplateType, achievements: ResumeData['achievements']): string {
    if (!achievements || achievements.length === 0) return '';
    return `
\\section{Achievements}
\\resumeSubHeadingListStart
${achievements.map((a) => {
    let str = `\\textbf{${escapeLatex(a.name)}}`;
    if (a.context) str += ` --- ${escapeLatex(a.context)}`;
    if (a.date) str += ` (${escapeLatex(a.date)})`;
    if (a.rank) str += ` {\\small ${escapeLatex(a.rank)}}`;
    if (a.description) str += ` --- ${escapeLatex(a.description)}`;
    if (a.link) str += ` \\href{${safeHref(a.link)}}{[Link]}`;
    return `\\resumeItem{${str}}`;
}).join('\n')}
\\resumeSubHeadingListEnd
`;
}

function metricsSection(metrics: ResumeData['keyMetrics']): string {
    if (!metrics || metrics.length === 0) return '';
    return simpleLineSection(
        'Key Metrics',
        metrics.map((metric) => ({
            primary: `${metric.label}: ${metric.value}`,
            secondary: metric.context,
        }))
    );
}

function internshipsSection(t: TemplateType, internships: ResumeData['internships']): string {
    if (!internships || internships.length === 0) return '';
    return experienceSection(t, internships).replace('\\section{Experience}', '\\section{Internships}');
}

function openSourceSection(items: ResumeData['openSource']): string {
    if (!items || items.length === 0) return '';
    return `
\\section{Open Source}
\\resumeSubHeadingListStart
${items
    .map((item) => {
        const rightLine = escapeLatex(item.dates || item.impact || '');
        const subLine = escapeLatex(item.contribution || '');
        const subRight = item.link ? `\\href{${safeHref(item.link)}}{[Link]}` : '';
        const bullets = item.bullets.length > 0
            ? `\\resumeItemListStart\n${item.bullets.map((bullet) => `\\resumeItem{${escapeLatex(bullet)}}`).join('\n')}\n\\resumeItemListEnd`
            : '';
        const heading = subLine || subRight
            ? `\\resumeSubheading\n{${escapeLatex(item.project)}}{${rightLine}}\n{${subLine}}{${subRight}}`
            : `\\resumeSubheadingTwo\n{${escapeLatex(item.project)}}{${rightLine}}`;
        return `${heading}\n${bullets}`;
    })
    .join('\n')}
\\resumeSubHeadingListEnd
`;
}

function leadershipSection(title: string, items: ResumeData['leadership'] | ResumeData['volunteering']): string {
    if (!items || items.length === 0) return '';
    return `
\\section{${escapeLatex(title)}}
\\resumeSubHeadingListStart
${items
    .map((item) => {
        const heading = `\\resumeSubheading\n{${escapeLatex(item.role)}}{${escapeLatex(item.dates || '')}}\n{${escapeLatex(item.organization)}}{${escapeLatex(item.location || '')}}`;
        const bullets = item.bullets.length > 0
            ? `\\resumeItemListStart\n${item.bullets.map((bullet) => `\\resumeItem{${escapeLatex(bullet)}}`).join('\n')}\n\\resumeItemListEnd`
            : '';
        return `${heading}\n${bullets}`;
    })
    .join('\n')}
\\resumeSubHeadingListEnd
`;
}

function conferencesSection(items: ResumeData['conferences']): string {
    return simpleLineSection(
        'Conferences & Talks',
        items.map((item) => ({
            primary: item.name,
            secondary: [item.topic, item.role, item.location].filter(Boolean).join(' | '),
            tertiary: item.date,
            link: item.link,
        }))
    );
}

function languagesSection(items: ResumeData['languages']): string {
    return simpleLineSection(
        'Languages',
        items.map((item) => ({
            primary: item.language,
            secondary: item.proficiency,
        }))
    );
}

function interestsSection(items: ResumeData['interests']): string {
    return simpleLineSection(
        'Interests',
        items.map((item) => ({
            primary: item.name,
            secondary: item.details,
        }))
    );
}

function productsSection(items: ResumeData['products']): string {
    return simpleLineSection(
        'Products & Systems Owned',
        items.map((item) => ({
            primary: item.name,
            secondary: [item.responsibility, item.scale].filter(Boolean).join(' | '),
            tertiary: item.impact,
        }))
    );
}

function customSectionsSection(items: ResumeData['customSections']): string {
    if (!items || items.length === 0) return '';
    return items
        .filter((section) => section.title.trim().length > 0 && section.items.length > 0)
        .map((section) => simpleBulletSection(section.title, section.items))
        .join('\n');
}

function prepareResumeForRendering(data: ResumeData): ResumeData {
    const volume = estimateResumeVolume(data);
    const mode = volume > 4600 ? 'ultra' : volume > 3800 ? 'dense' : 'normal';

    const clone: ResumeData = JSON.parse(JSON.stringify(data));

    const limitBullets = <T extends { bullets?: string[] }>(items: T[], count: number): T[] =>
        items.map((item) => ({ ...item, bullets: (item.bullets ?? []).slice(0, count) }));

    if (mode !== 'normal') {
        clone.personalInfo.tagline = '';
        clone.summary = clone.summary.replace(/\s+/g, ' ').trim();
        clone.experience = limitBullets(clone.experience, mode === 'ultra' ? 2 : 3);
        clone.internships = limitBullets(clone.internships, 1);
        clone.projects = clone.projects.map((project) => ({
            ...project,
            bullets: project.bullets.slice(0, mode === 'ultra' ? 1 : 2),
        }));
        clone.openSource = clone.openSource.map((item) => ({
            ...item,
            bullets: item.bullets.slice(0, 1),
        }));
        clone.leadership = limitBullets(clone.leadership, 1);
        clone.volunteering = limitBullets(clone.volunteering, 1);
    }

    if (mode === 'dense') {
        clone.interests = [];
        clone.additionalInfo = {};
        clone.customSections = [];
    }

    if (mode === 'ultra') {
        clone.internships = [];
        clone.achievements = clone.achievements.slice(0, 1);
        clone.publications = [];
        clone.openSource = [];
        clone.leadership = [];
        clone.volunteering = [];
        clone.conferences = [];
        clone.interests = [];
        clone.products = [];
        clone.devopsContributions = [];
        clone.securityContributions = [];
        clone.additionalInfo = {};
        clone.customSections = [];
    }

    return clone;
}

function normalizedSectionOrder(order: ResumeData['sectionOrder'] | undefined): ResumeSectionKey[] {
    const incoming = Array.isArray(order) ? order : [];
    const seen = new Set<ResumeSectionKey>();
    const result: ResumeSectionKey[] = [];
    for (const key of incoming) {
        if (!seen.has(key)) {
            seen.add(key);
            result.push(key);
        }
    }
    for (const key of DEFAULT_SECTION_ORDER) {
        if (!seen.has(key)) {
            seen.add(key);
            result.push(key);
        }
    }
    return result;
}

// ============================================================================
// Compact Dense Single-Column Layout
// ============================================================================

function generateCompactLatex(data: ResumeData): string {
    const prepared = prepareResumeForRendering(data);
    const { personalInfo, summary, skills, experience, education, certifications } = prepared;

    const layout = resolveLayout(prepared, 'compact');
    const preamble = getPreamble('compact', layout);
    const header = compactHeader(personalInfo);

    const sectionBuilders: Partial<Record<ResumeSectionKey, string>> = {
        summary: summary ? summarySection('compact', summary) : '',
        techStackSummary: prepared.techStackSummary ? simpleParagraphSection('Tech Stack', prepared.techStackSummary) : '',
        skills: skills && skills.length > 0 ? skillsSection('compact', skills) : '',
        keyMetrics: prepared.keyMetrics && prepared.keyMetrics.length > 0 ? metricsSection(prepared.keyMetrics) : '',
        experience: experience && experience.length > 0 ? experienceSection('compact', experience) : '',
        internships: prepared.internships && prepared.internships.length > 0 ? internshipsSection('compact', prepared.internships) : '',
        projects: prepared.projects && prepared.projects.length > 0 ? projectsSection('compact', prepared.projects) : '',
        education: education && education.length > 0 ? educationSection('compact', education) : '',
        certifications: certifications && certifications.length > 0 ? certificationsSection('compact', certifications) : '',
        openSource: prepared.openSource && prepared.openSource.length > 0 ? openSourceSection(prepared.openSource) : '',
        languages: prepared.languages && prepared.languages.length > 0 ? languagesSection(prepared.languages) : '',
        devopsContributions: prepared.devopsContributions && prepared.devopsContributions.length > 0 ? simpleBulletSection('DevOps / SRE Contributions', prepared.devopsContributions) : '',
        securityContributions: prepared.securityContributions && prepared.securityContributions.length > 0 ? simpleBulletSection('Security / Compliance Work', prepared.securityContributions) : '',
    };
    const secList = normalizedSectionOrder(prepared.sectionOrder).map((key) => sectionBuilders[key] || '').filter(Boolean);

    return `${preamble}
${header}
${secList.join('\n')}
\\end{document}`;
}

// ============================================================================
// Main Export
// ============================================================================

export function generateLatex(data: ResumeData, template: TemplateType = 'modern'): string {
    if (template === 'compact') {
        return generateCompactLatex(data);
    }

    const prepared = prepareResumeForRendering(data);
    const { personalInfo, summary, skills, experience, education, certifications, projects, achievements, publications } = prepared;

    const layout = resolveLayout(prepared, template);
    const preamble = getPreamble(template, layout);
    const header = getHeader(template, personalInfo);
    
    let additionalInfoSection = '';
    if (prepared.additionalInfo) {
        const additionalItems = [
            prepared.additionalInfo.availability ? `Availability: ${prepared.additionalInfo.availability}` : '',
            prepared.additionalInfo.workAuthorization ? `Work Authorization: ${prepared.additionalInfo.workAuthorization}` : '',
            prepared.additionalInfo.relocation ? `Relocation: ${prepared.additionalInfo.relocation}` : '',
            prepared.additionalInfo.travel ? `Travel: ${prepared.additionalInfo.travel}` : '',
            prepared.additionalInfo.notes ?? '',
        ].filter(Boolean);
        if (additionalItems.length > 0) additionalInfoSection = simpleBulletSection('Additional Information', additionalItems);
    }
    const sectionBuilders: Partial<Record<ResumeSectionKey, string>> = {
        summary: summary ? summarySection(template, summary) : '',
        techStackSummary: prepared.techStackSummary ? simpleParagraphSection('Tech Stack Summary', prepared.techStackSummary) : '',
        keyMetrics: prepared.keyMetrics && prepared.keyMetrics.length > 0 ? metricsSection(prepared.keyMetrics) : '',
        skills: skills && skills.length > 0 ? skillsSection(template, skills) : '',
        experience: experience && experience.length > 0 ? experienceSection(template, experience) : '',
        internships: prepared.internships && prepared.internships.length > 0 ? internshipsSection(template, prepared.internships) : '',
        education: education && education.length > 0 ? educationSection(template, education) : '',
        projects: projects && projects.length > 0 ? projectsSection(template, projects) : '',
        certifications: certifications && certifications.length > 0 ? certificationsSection(template, certifications) : '',
        achievements: achievements && achievements.length > 0 ? achievementsSection(template, achievements) : '',
        openSource: prepared.openSource && prepared.openSource.length > 0 ? openSourceSection(prepared.openSource) : '',
        publications: publications && publications.length > 0 ? publicationsSection(template, publications) : '',
        leadership: prepared.leadership && prepared.leadership.length > 0 ? leadershipSection('Leadership', prepared.leadership) : '',
        volunteering: prepared.volunteering && prepared.volunteering.length > 0 ? leadershipSection('Volunteering', prepared.volunteering) : '',
        conferences: prepared.conferences && prepared.conferences.length > 0 ? conferencesSection(prepared.conferences) : '',
        languages: prepared.languages && prepared.languages.length > 0 ? languagesSection(prepared.languages) : '',
        interests: prepared.interests && prepared.interests.length > 0 ? interestsSection(prepared.interests) : '',
        products: prepared.products && prepared.products.length > 0 ? productsSection(prepared.products) : '',
        devopsContributions: prepared.devopsContributions && prepared.devopsContributions.length > 0 ? simpleBulletSection('DevOps / SRE Contributions', prepared.devopsContributions) : '',
        securityContributions: prepared.securityContributions && prepared.securityContributions.length > 0 ? simpleBulletSection('Security / Compliance Work', prepared.securityContributions) : '',
        additionalInfo: additionalInfoSection,
        customSections: prepared.customSections && prepared.customSections.length > 0 ? customSectionsSection(prepared.customSections) : '',
    };
    const sections = normalizedSectionOrder(prepared.sectionOrder)
        .filter((key) => {
            if (template === 'creative') return key !== 'internships' && key !== 'techStackSummary';
            if (template === 'executive') return key !== 'internships';
            return true;
        })
        .map((key) => sectionBuilders[key] || '')
        .filter(Boolean)
        .join('\n');

    return `${preamble}
${header}
${sections}
\\end{document}`;
}
