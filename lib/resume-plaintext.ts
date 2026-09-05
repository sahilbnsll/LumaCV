import type { ResumeData } from '@/lib/resume-schema';

export function resumeDataToPlainText(data: ResumeData): string {
    const parts: string[] = [];
    const pi = data.personalInfo;

    parts.push(
        pi?.name ?? '',
        pi?.title ?? '',
        pi?.tagline ?? '',
        pi?.location ?? '',
        pi?.email ?? '',
        pi?.phone ?? '',
        pi?.linkedin ?? '',
        pi?.github ?? '',
        pi?.portfolio ?? '',
        data.summary ?? '',
        data.techStackSummary ?? '',
    );

    for (const skill of data.skills ?? []) {
        parts.push(skill.category, skill.items);
    }

    for (const metric of data.keyMetrics ?? []) {
        parts.push(metric.label, metric.value, metric.context ?? '');
    }

    for (const exp of data.experience ?? []) {
        parts.push(exp.title, exp.company, exp.location ?? '', exp.dates, ...exp.bullets);
    }

    for (const internship of data.internships ?? []) {
        parts.push(internship.title, internship.company, internship.location ?? '', internship.dates, ...internship.bullets);
    }

    for (const edu of data.education ?? []) {
        parts.push(edu.institution, edu.degree, edu.fieldOfStudy ?? '', edu.location ?? '', edu.dates, edu.gpa ?? '', edu.coursework ?? '', edu.honors ?? '');
    }

    for (const project of data.projects ?? []) {
        parts.push(project.name, project.description ?? '', project.techStack ?? '', project.role ?? '', project.dates ?? '', project.impact ?? '', project.link ?? '', ...project.bullets);
    }

    for (const cert of data.certifications ?? []) {
        parts.push(cert.name, cert.issuer ?? '', cert.date ?? '', cert.expiryDate ?? '', cert.credentialId ?? '', cert.link ?? '');
    }

    for (const achievement of data.achievements ?? []) {
        parts.push(achievement.name, achievement.context ?? '', achievement.date ?? '', achievement.rank ?? '', achievement.description ?? '', achievement.link ?? '');
    }

    for (const publication of data.publications ?? []) {
        parts.push(publication.title, publication.platform ?? '', publication.date ?? '', publication.authors ?? '', publication.description ?? '', publication.link ?? '');
    }

    for (const contribution of data.openSource ?? []) {
        parts.push(contribution.project, contribution.contribution ?? '', contribution.dates ?? '', contribution.impact ?? '', contribution.link ?? '', ...contribution.bullets);
    }

    for (const item of data.leadership ?? []) {
        parts.push(item.role, item.organization, item.location ?? '', item.dates ?? '', ...item.bullets);
    }

    for (const item of data.volunteering ?? []) {
        parts.push(item.role, item.organization, item.location ?? '', item.dates ?? '', ...item.bullets);
    }

    for (const conference of data.conferences ?? []) {
        parts.push(conference.name, conference.topic ?? '', conference.role ?? '', conference.date ?? '', conference.location ?? '', conference.description ?? '', conference.link ?? '');
    }

    for (const language of data.languages ?? []) {
        parts.push(language.language, language.proficiency ?? '');
    }

    for (const interest of data.interests ?? []) {
        parts.push(interest.name, interest.details ?? '');
    }

    for (const product of data.products ?? []) {
        parts.push(product.name, product.responsibility ?? '', product.scale ?? '', product.impact ?? '');
    }

    parts.push(...(data.devopsContributions ?? []));
    parts.push(...(data.securityContributions ?? []));
    parts.push(
        data.additionalInfo?.availability ?? '',
        data.additionalInfo?.workAuthorization ?? '',
        data.additionalInfo?.relocation ?? '',
        data.additionalInfo?.travel ?? '',
        data.additionalInfo?.notes ?? '',
    );

    for (const section of data.customSections ?? []) {
        parts.push(section.title, ...section.items);
    }

    return parts.filter(Boolean).join('\n');
}
