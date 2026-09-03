import { ResumeData } from './resume-schema';

export interface FactValidationIssue {
    section: string;
    itemIndex: number;
    bulletIndex?: number;
    issueType: 'unsupported_metric' | 'invented_company' | 'modified_date' | 'unsupported_credential';
    originalText: string;
    tailoredText: string;
    reason: string;
}

export interface FactValidationResult {
    passed: boolean;
    issues: FactValidationIssue[];
    preservedMetricsCount: number;
    verifiedEmployersCount: number;
    cleanedResume: ResumeData;
}

// Regex to identify quantitative metrics: percentages, currencies, multipliers, data volumes, SLAs
const METRIC_REGEX = /\b(\$?\d+(?:,\d+)*(?:\.\d+)?%?|\d+(?:x|k|m|b|gb|tb|ms|s)?)\b/gi;

function extractMetricsFromText(text: string): Set<string> {
    const metrics = new Set<string>();
    const matches = text.match(METRIC_REGEX) || [];
    for (const m of matches) {
        const cleaned = m.trim().toLowerCase();
        // Ignore standalone single digits or years like 2024, 2023 unless with currency or percent
        if (/^(19|20)\d{2}$/.test(cleaned)) continue;
        if (/^\d$/.test(cleaned)) continue;
        metrics.add(cleaned);
    }
    return metrics;
}

function collectAllSourceMetrics(resume: ResumeData): Set<string> {
    const allMetrics = new Set<string>();

    const scanText = (str?: string) => {
        if (!str) return;
        const set = extractMetricsFromText(str);
        set.forEach(m => allMetrics.add(m));
    };

    scanText(resume.summary);
    scanText(resume.techStackSummary);

    (resume.experience || []).forEach(exp => {
        (exp.bullets || []).forEach(scanText);
    });

    (resume.projects || []).forEach(p => {
        scanText(p.description);
        (p.bullets || []).forEach(scanText);
    });

    (resume.internships || []).forEach(i => {
        (i.bullets || []).forEach(scanText);
    });

    (resume.keyMetrics || []).forEach(km => {
        scanText(km.value);
        scanText(km.context);
    });

    return allMetrics;
}

/**
 * Validates tailored resume content against source resume evidence.
 * Reverts hallucinated metrics, restored dates, and enforces ground truth.
 */
export function validateAndCleanTailoredResume(
    source: ResumeData,
    tailored: ResumeData
): FactValidationResult {
    const issues: FactValidationIssue[] = [];
    const sourceMetrics = collectAllSourceMetrics(source);
    let preservedMetricsCount = 0;
    let verifiedEmployersCount = 0;

    // Deep clone tailored resume to produce a cleaned version
    const cleaned: ResumeData = JSON.parse(JSON.stringify(tailored));

    // 1. Lock personalInfo: always preserve source contact details
    cleaned.personalInfo = {
        ...source.personalInfo,
        title: tailored.personalInfo?.title || source.personalInfo.title,
    };

    // 2. Validate and clean Work Experience
    if (cleaned.experience && source.experience) {
        cleaned.experience = cleaned.experience.map((exp, expIdx) => {
            const srcExp = source.experience[expIdx];
            if (!srcExp) return exp;

            verifiedEmployersCount++;

            // Lock company name and dates to source of truth
            if (exp.company !== srcExp.company) {
                issues.push({
                    section: 'experience',
                    itemIndex: expIdx,
                    issueType: 'invented_company',
                    originalText: srcExp.company,
                    tailoredText: exp.company,
                    reason: 'Company name was altered during tailoring. Restored original company name.',
                });
                exp.company = srcExp.company;
            }

            if (exp.dates !== srcExp.dates) {
                issues.push({
                    section: 'experience',
                    itemIndex: expIdx,
                    issueType: 'modified_date',
                    originalText: srcExp.dates,
                    tailoredText: exp.dates,
                    reason: 'Employment dates were altered during tailoring. Restored original dates.',
                });
                exp.dates = srcExp.dates;
            }

            // Check each bullet for unsupported metrics
            exp.bullets = (exp.bullets || []).map((bullet, bIdx) => {
                const srcBullet = srcExp.bullets?.[bIdx] || '';
                const tailoredBulletMetrics = extractMetricsFromText(bullet);

                for (const tm of Array.from(tailoredBulletMetrics)) {
                    if (sourceMetrics.has(tm)) {
                        preservedMetricsCount++;
                    } else {
                        // Hallucinated metric detected! Revert to original source bullet
                        issues.push({
                            section: 'experience',
                            itemIndex: expIdx,
                            bulletIndex: bIdx,
                            issueType: 'unsupported_metric',
                            originalText: srcBullet,
                            tailoredText: bullet,
                            reason: `Detected ungrounded metric "${tm}". Reverted to truthful phrasing from source resume.`,
                        });
                        return srcBullet || bullet;
                    }
                }
                return bullet;
            });

            return exp;
        });
    }

    // 3. Validate and clean Education
    if (cleaned.education && source.education) {
        cleaned.education = cleaned.education.map((edu, eduIdx) => {
            const srcEdu = source.education[eduIdx];
            if (!srcEdu) return edu;

            // Lock institution, degree, and dates
            edu.institution = srcEdu.institution;
            edu.degree = srcEdu.degree;
            edu.dates = srcEdu.dates;
            return edu;
        });
    }

    // 4. Validate and clean Projects
    if (cleaned.projects && source.projects) {
        cleaned.projects = cleaned.projects.map((proj, pIdx) => {
            const srcProj = source.projects[pIdx];
            if (!srcProj) return proj;

            proj.name = srcProj.name;
            if (proj.bullets && srcProj.bullets) {
                proj.bullets = proj.bullets.map((b, bIdx) => {
                    const srcB = srcProj.bullets?.[bIdx] || '';
                    const metrics = extractMetricsFromText(b);
                    for (const m of Array.from(metrics)) {
                        if (!sourceMetrics.has(m)) {
                            issues.push({
                                section: 'projects',
                                itemIndex: pIdx,
                                bulletIndex: bIdx,
                                issueType: 'unsupported_metric',
                                originalText: srcB,
                                tailoredText: b,
                                reason: `Detected unsupported metric "${m}" in project bullet. Restored source phrasing.`,
                            });
                            return srcB || b;
                        }
                    }
                    return b;
                });
            }
            return proj;
        });
    }

    return {
        passed: issues.length === 0,
        issues,
        preservedMetricsCount,
        verifiedEmployersCount,
        cleanedResume: cleaned,
    };
}
