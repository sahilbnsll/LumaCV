import type { ResumeData, TemplateType } from './resume-schema';

export function estimateResumeVolume(data: ResumeData): number {
    // Be defensive: callers may pass partially-filled objects that bypass zod defaults.
    const summary = data.summary ?? '';
    const techStackSummary = data.techStackSummary ?? '';
    const keyMetrics = data.keyMetrics ?? [];
    const skills = data.skills ?? [];
    const experience = data.experience ?? [];
    const internships = data.internships ?? [];
    const education = data.education ?? [];
    const projects = data.projects ?? [];
    const certifications = data.certifications ?? [];
    const achievements = data.achievements ?? [];
    const publications = data.publications ?? [];
    const languages = data.languages ?? [];
    const interests = data.interests ?? [];
    const products = data.products ?? [];
    const openSource = data.openSource ?? [];
    const leadership = data.leadership ?? [];
    const volunteering = data.volunteering ?? [];
    const conferences = data.conferences ?? [];
    const devopsContributions = data.devopsContributions ?? [];
    const securityContributions = data.securityContributions ?? [];
    const customSections = data.customSections ?? [];

    let volume = summary.length + techStackSummary.length;

    for (const metric of keyMetrics) {
        volume += (metric.label?.length ?? 0) + (metric.value?.length ?? 0) + (metric.context?.length ?? 0) + 24;
    }
    for (const skill of skills) {
        volume += skill.category.length + skill.items.length + 40;
    }
    for (const exp of [...experience, ...internships]) {
        volume += 120;
        volume += exp.bullets.join(' ').length;
    }
    for (const edu of education) {
        volume += (edu.institution?.length ?? 0) + (edu.degree?.length ?? 0) + (edu.fieldOfStudy?.length ?? 0) + (edu.dates?.length ?? 0) + 48;
    }
    for (const project of projects) {
        volume += (project.name?.length ?? 0) + (project.description?.length ?? 0) + (project.techStack?.length ?? 0) + (project.impact?.length ?? 0) + project.bullets.join(' ').length + 64;
    }
    for (const cert of certifications) {
        volume += (cert.name?.length ?? 0) + (cert.issuer?.length ?? 0) + (cert.credentialId?.length ?? 0) + 32;
    }
    for (const item of [...achievements, ...publications, ...languages, ...interests, ...products]) {
        volume += JSON.stringify(item).length + 24;
    }
    for (const item of [...openSource, ...leadership, ...volunteering, ...conferences]) {
        volume += JSON.stringify(item).length + 40;
    }
    volume += devopsContributions.join(' ').length;
    volume += securityContributions.join(' ').length;
    volume += JSON.stringify(data.additionalInfo ?? {}).length;
    volume += customSections.reduce((sum, section) => sum + section.title.length + section.items.join(' ').length + 24, 0);

    return volume;
}

export type PaginationMode = 'one_page' | 'multi_page_ok';

export type LayoutAdjust = {
    mode: PaginationMode;
    fontSize?: string;
    geometry?: string;
    lineSpread?: string;
    extraPreamble?: string;
};

export const THRESHOLDS: Record<string, { tight: number; overflow: number }> = {
    modern: { tight: 3800, overflow: 5600 },
    classic: { tight: 3600, overflow: 5400 },
    engineering: { tight: 4200, overflow: 6500 },
    compact: { tight: 4800, overflow: 7600 },
    two_column: { tight: 3500, overflow: 5200 },
    ats_safe: { tight: 4000, overflow: 6000 },
    // legacy aliases
    ats: { tight: 4000, overflow: 6000 },
    executive: { tight: 4200, overflow: 6500 },
    minimal: { tight: 3600, overflow: 5400 },
    creative: { tight: 3600, overflow: 5400 },
    tech: { tight: 4200, overflow: 6500 },
};

export type TemplateFitLevel = 'recommended' | 'good' | 'tight' | 'multi_page_risk';

export function getTemplateFitLevel(data: ResumeData, template: TemplateType): TemplateFitLevel {
    const volume = estimateResumeVolume(data);
    const threshold = THRESHOLDS[template] || THRESHOLDS.modern;
    const { tight, overflow } = threshold;

    if (volume > overflow) return 'multi_page_risk';
    if (volume > tight) return 'tight';

    const sections =
        (data.experience?.length ?? 0) +
        (data.projects?.length ?? 0) +
        (data.education?.length ?? 0) +
        (data.certifications?.length ?? 0) +
        (data.achievements?.length ?? 0) +
        (data.publications?.length ?? 0) +
        (data.openSource?.length ?? 0) +
        (data.leadership?.length ?? 0) +
        (data.volunteering?.length ?? 0) +
        (data.conferences?.length ?? 0);

    if (template === 'compact') return volume > tight * 0.82 ? 'recommended' : 'good';
    if (template === 'two_column') return sections <= 8 ? 'recommended' : 'good';
    if (template === 'ats_safe' || template === 'classic') return sections >= 6 ? 'recommended' : 'good';
    if (template === 'engineering') return (data.skills?.length ?? 0) >= 4 ? 'recommended' : 'good';

    return volume < tight * 0.8 ? 'recommended' : 'good';
}


export function getTemplateFitCopy(level: TemplateFitLevel): { label: string; detail: string } {
    switch (level) {
        case 'recommended':
            return { label: 'Recommended', detail: 'Best balance of density and readability' };
        case 'good':
            return { label: 'Good fit', detail: 'Should stay clean with your current content' };
        case 'tight':
            return { label: 'Tight fit', detail: 'Works, but extra content may feel dense' };
        case 'multi_page_risk':
            return { label: 'Multi-page risk', detail: 'Likely to compress hard or spill with more content' };
    }
}

function midTighten(template: TemplateType): LayoutAdjust {
    switch (template) {
        case 'executive':
            return { mode: 'one_page', geometry: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in', lineSpread: '\\linespread{0.91}' };
        case 'minimal':
            return { mode: 'one_page', geometry: 'top=0.34in,bottom=0.34in,left=0.42in,right=0.42in', lineSpread: '\\linespread{0.94}' };
        case 'creative':
            return { mode: 'one_page', geometry: 'top=0.30in,bottom=0.30in,left=0.36in,right=0.36in', lineSpread: '\\linespread{0.88}' };
        case 'classic':
            return { mode: 'one_page', geometry: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in', lineSpread: '\\linespread{0.92}' };
        case 'ats':
            return { mode: 'one_page', geometry: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in', lineSpread: '\\linespread{0.92}' };
        case 'tech':
            return { mode: 'one_page', geometry: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in', lineSpread: '\\linespread{0.90}' };
        default:
            return { mode: 'one_page', geometry: 'top=0.32in,bottom=0.32in,left=0.36in,right=0.36in', lineSpread: '\\linespread{0.91}' };
    }
}

export function resolveLayout(data: ResumeData, template: TemplateType): LayoutAdjust {
    const volume = estimateResumeVolume(data);
    const { tight, overflow } = THRESHOLDS[template] || THRESHOLDS.modern;

    if (volume > overflow) {
        return { mode: 'multi_page_ok' };
    }
    if (volume > tight) {
        return midTighten(template);
    }
    return { mode: 'one_page' };
}
