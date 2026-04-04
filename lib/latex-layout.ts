import type { ResumeData, TemplateType } from './resume-schema';

/** Rough text volume for layout heuristics (not exact page measurement). */
export function estimateResumeVolume(data: ResumeData): number {
    let v = data.summary.length;
    for (const e of data.experience) {
        v += 120;
        v += e.bullets.join(' ').length;
    }
    for (const s of data.skills) {
        v += s.category.length + s.items.length + 40;
    }
    v += data.certifications.join(' ').length + data.certifications.length * 24;
    const ed = data.education;
    v += (ed.institution?.length ?? 0) + (ed.degree?.length ?? 0) + (ed.dates?.length ?? 0) + 40;
    return v;
}

export type PaginationMode = 'one_page' | 'multi_page_ok';

export type LayoutAdjust = {
    mode: PaginationMode;
    fontSize?: string;
    geometry?: string;
    lineSpread?: string;
    extraPreamble?: string;
};

const THRESHOLDS: Record<TemplateType, { tight: number; overflow: number }> = {
    modern: { tight: 3800, overflow: 999999 },
    classic: { tight: 3600, overflow: 999999 },
    ats: { tight: 4000, overflow: 999999 },
    executive: { tight: 3000, overflow: 999999 },
    minimal: { tight: 2800, overflow: 999999 },
    compact: { tight: 4800, overflow: 11000 },
    creative: { tight: 3000, overflow: 999999 },
    tech: { tight: 3600, overflow: 999999 },
};

/** Very long resumes: squeeze further while staying on one page (non-compact only). */
const HARD_VOLUME = 8200;

function midTighten(template: TemplateType): LayoutAdjust {
    switch (template) {
        case 'executive':
            return {
                mode: 'one_page',
                fontSize: '10pt',
                geometry: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in',
                lineSpread: '\\linespread{0.89}',
            };
        case 'minimal':
            return {
                mode: 'one_page',
                fontSize: '10pt',
                geometry: 'top=0.34in,bottom=0.34in,left=0.42in,right=0.42in',
                lineSpread: '\\linespread{0.92}',
            };
        case 'creative':
            return {
                mode: 'one_page',
                fontSize: '10pt',
                geometry: 'top=0.30in,bottom=0.30in,left=0.36in,right=0.36in',
                lineSpread: '\\linespread{0.86}',
            };
        case 'classic':
            return {
                mode: 'one_page',
                fontSize: '10pt',
                geometry: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in',
                lineSpread: '\\linespread{0.90}',
            };
        case 'ats':
            return {
                mode: 'one_page',
                fontSize: '10pt',
                geometry: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in',
                lineSpread: '\\linespread{0.90}',
            };
        case 'tech':
            return {
                mode: 'one_page',
                fontSize: '10pt',
                geometry: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in',
                lineSpread: '\\linespread{0.88}',
            };
        default:
            return {
                mode: 'one_page',
                fontSize: '10pt',
                geometry: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in',
                lineSpread: '\\linespread{0.89}',
            };
    }
}

function hardTighten(): LayoutAdjust {
    return {
        mode: 'one_page',
        fontSize: '9pt',
        geometry: 'top=0.28in,bottom=0.28in,left=0.32in,right=0.32in',
        lineSpread: '\\linespread{0.84}',
    };
}

/**
 * Non-compact templates always target one page (no multi_page_ok).
 * Compact may relax to two pages only when volume exceeds its overflow threshold.
 */
export function resolveLayout(data: ResumeData, template: TemplateType): LayoutAdjust {
    const vol = estimateResumeVolume(data);

    if (template === 'compact') {
        const { tight, overflow } = THRESHOLDS.compact;
        if (vol >= overflow) {
            return { mode: 'multi_page_ok' };
        }
        if (vol <= tight) {
            return { mode: 'one_page' };
        }
        return {
            mode: 'one_page',
            fontSize: '8pt',
            geometry: 'top=0.24in,bottom=0.24in,left=0.28in,right=0.28in',
            lineSpread: '\\linespread{0.86}',
        };
    }

    const { tight } = THRESHOLDS[template];
    if (vol > HARD_VOLUME) {
        return hardTighten();
    }
    if (vol <= tight) {
        return { mode: 'one_page' };
    }
    return midTighten(template);
}
