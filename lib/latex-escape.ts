/**
 * Escapes LaTeX special characters AND converts Unicode to LaTeX equivalents.
 * MUST be called on ALL user input before inserting into templates.
 *
 * Three-phase approach:
 * 1a. Convert Unicode chars to simple ASCII equivalents (dashes, quotes, etc.)
 * 1b. Replace Unicode that needs LaTeX commands with placeholder tokens
 * 2.  Escape the 10 LaTeX-special ASCII characters
 * 3.  Swap placeholder tokens back to actual LaTeX commands
 *
 * This prevents pdflatex from garbling Unicode into random glyphs like {, }
 * while also preventing Phase 2 from corrupting the LaTeX commands inserted
 * by Phase 1b.
 */

// Placeholder prefix unlikely to appear in resume text
const PH = '\x00LTXPH';
let phIdx = 0;
const placeholders: [string, string][] = [];

function ph(latex: string): string {
    const token = `${PH}${phIdx++}${PH}`;
    placeholders.push([token, latex]);
    return token;
}

// Pre-build the placeholder map (runs once at module load)
const UNICODE_LATEX_MAP: [RegExp, string][] = [
    // Arrows
    [/\u2192/g, ph('$\\rightarrow$')],
    [/\u2190/g, ph('$\\leftarrow$')],
    [/\u2194/g, ph('$\\leftrightarrow$')],
    [/\u21D2/g, ph('$\\Rightarrow$')],
    // Symbols that need LaTeX commands
    [/\u2022/g, ph('\\textbullet{}')],
    [/\u00B7/g, ph('\\textperiodcentered{}')],
    [/\u00A9/g, ph('\\textcopyright{}')],
    [/\u00AE/g, ph('\\textregistered{}')],
    [/\u2122/g, ph('\\texttrademark{}')],
    [/\u00B0/g, ph('\\textdegree{}')],
    [/\u00B1/g, ph('$\\pm$')],
    [/\u2264/g, ph('$\\leq$')],
    [/\u2265/g, ph('$\\geq$')],
    [/\u2260/g, ph('$\\neq$')],
    [/\u223C/g, ph('$\\sim$')],
    [/\u00D7/g, ph('$\\times$')],
    [/\u00F7/g, ph('$\\div$')],
];

export function escapeLatex(text: string | undefined | null): string {
    if (!text) return '';

    // ── Phase 1a: Convert Unicode to simple ASCII equivalents ──
    let t = text
        // Dashes — the #1 culprit for the "{" rendering bug in pdflatex
        .replace(/\u2014/g, '---')     // em-dash —
        .replace(/\u2013/g, '--')      // en-dash –
        .replace(/\u2012/g, '--')      // figure dash ‒
        .replace(/\u2015/g, '---')     // horizontal bar ―
        // Quotation marks
        .replace(/\u201C/g, '``')      // left double "
        .replace(/\u201D/g, "''")      // right double "
        .replace(/\u2018/g, '`')       // left single '
        .replace(/\u2019/g, "'")       // right single / apostrophe '
        .replace(/\u201E/g, ',,')      // double low-9 „
        .replace(/\u00AB/g, '<<')      // left guillemet «
        .replace(/\u00BB/g, '>>')      // right guillemet »
        // Ellipsis & dots
        .replace(/\u2026/g, '...')     // …
        // Triangular bullet
        .replace(/\u2023/g, '>')       // ‣
        // Invisible / zero-width characters
        .replace(/\u00A0/g, '~')       // non-breaking space
        .replace(/\u200B/g, '')        // zero-width space
        .replace(/\u200C/g, '')        // zero-width non-joiner
        .replace(/\u200D/g, '')        // zero-width joiner
        .replace(/\uFEFF/g, '');       // BOM

    // ── Phase 1b: Replace Unicode with placeholder tokens ──
    // These will survive Phase 2 escaping and get swapped back in Phase 3
    for (const [re, replacement] of UNICODE_LATEX_MAP) {
        t = t.replace(re, replacement);
    }

    // ── Phase 2: Escape LaTeX-special ASCII characters ──
    t = t
        .replace(/\\/g, '\\textbackslash{}')  // Backslash MUST be first
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');

    // ── Phase 3: Swap placeholders back to real LaTeX ──
    for (const [token, latex] of placeholders) {
        t = t.replaceAll(token, latex);
    }

    return t;
}

/**
 * Escapes an array of strings
 */
export function escapeLatexArray(items: string[]): string[] {
    return items.map(escapeLatex);
}
