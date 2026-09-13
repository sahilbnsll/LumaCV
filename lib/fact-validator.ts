import { ResumeData } from './resume-schema';

export interface FactValidationIssue {
    section: string;
    itemIndex: number;
    bulletIndex?: number;
    issueType: 'unsupported_metric' | 'invented_company' | 'modified_date' | 'modified_title' | 'modified_url' | 'unsupported_credential' | 'formatting_bracket';
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

function extractMetricsFromText(text?: string): Set<string> {
    const metrics = new Set<string>();
    if (!text) return metrics;
    const matches = text.match(METRIC_REGEX) || [];
    for (const m of matches) {
        const cleaned = m.trim().toLowerCase();
        // Ignore standalone single digits or years like 2024, 2023 unless accompanied by currency or percent
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
        (p.impactBullets || []).forEach(scanText);
        (p.highlights || []).forEach(scanText);
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

function cleanBulletText(text: string): string {
    if (!text) return '';
    // Strip raw brackets like [Highlight 1] or [Result] at the start of bullets
    return text.replace(/^\[[^\]]+\]\s*:?\s*/i, '').trim();
}

/**
 * Validates tailored resume content against source resume evidence.
 * Reverts hallucinated metrics, restored dates/companies/titles/URLs,
 * and enforces complete ground truth protection.
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

    // 1. Lock personalInfo: always preserve candidate contact identity
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

            // Lock company name to source of truth
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

            // Lock dates to source of truth
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

            // Lock job title to source of truth if candidate provided one
            if (srcExp.title && exp.title !== srcExp.title) {
                issues.push({
                    section: 'experience',
                    itemIndex: expIdx,
                    issueType: 'modified_title',
                    originalText: srcExp.title,
                    tailoredText: exp.title,
                    reason: 'Job title was modified. Restored authentic job title.',
                });
                exp.title = srcExp.title;
            }

            // Check each bullet for unsupported metrics and clean bracket formatting
            exp.bullets = (exp.bullets || []).map((bullet, bIdx) => {
                const srcBullet = srcExp.bullets?.[bIdx] || '';
                const sanitized = cleanBulletText(bullet);
                const tailoredBulletMetrics = extractMetricsFromText(sanitized);

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
                        return srcBullet || sanitized;
                    }
                }
                return sanitized;
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
            if (srcEdu.gpa) edu.gpa = srcEdu.gpa;
            if (srcEdu.coursework) edu.coursework = srcEdu.coursework;
            if (srcEdu.honors) edu.honors = srcEdu.honors;
            return edu;
        });
    }

    // 4. Validate and clean Projects
    if (cleaned.projects && source.projects) {
        cleaned.projects = cleaned.projects.map((proj, pIdx) => {
            const srcProj = source.projects[pIdx];
            if (!srcProj) return proj;

            // Lock project metadata: name, dates, role, link
            proj.name = srcProj.name;
            if (srcProj.link) proj.link = srcProj.link;
            if (srcProj.role) proj.role = srcProj.role;
            if (srcProj.dates) proj.dates = srcProj.dates;

            // Clean bullets
            const validateBullets = (bullets: string[] = [], srcBullets: string[] = []): string[] => {
                return bullets.map((b, bIdx) => {
                    const srcB = srcBullets[bIdx] || '';
                    const sanitized = cleanBulletText(b);
                    const metrics = extractMetricsFromText(sanitized);
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
                            return srcB || sanitized;
                        }
                    }
                    return sanitized;
                });
            };

            if (proj.bullets) proj.bullets = validateBullets(proj.bullets, srcProj.bullets);
            if (proj.highlights) proj.highlights = validateBullets(proj.highlights, srcProj.highlights);
            if (proj.impactBullets) proj.impactBullets = validateBullets(proj.impactBullets, srcProj.impactBullets);

            return proj;
        });
    }

    // 5. Validate Certifications
    if (cleaned.certifications && source.certifications) {
        cleaned.certifications = cleaned.certifications.map((cert, cIdx) => {
            const srcCert = source.certifications[cIdx];
            if (!srcCert) return cert;

            cert.name = srcCert.name;
            cert.issuer = srcCert.issuer;
            cert.date = srcCert.date;
            if (srcCert.credentialId) cert.credentialId = srcCert.credentialId;
            if (srcCert.link) cert.link = srcCert.link;
            return cert;
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
