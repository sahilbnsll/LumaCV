import { DEFAULT_SECTION_ORDER, ResumeData, ResumeDataSchema } from '@/lib/resume-schema';

function str(v: unknown): string {
    if (v === null || v === undefined) return '';
    return String(v).trim();
}

function mapArray<T>(raw: unknown, mapper: (item: Record<string, unknown>) => T | null): T[] {
    if (!Array.isArray(raw)) {
        if (typeof raw === 'object' && raw !== null) {
            const item = mapper(raw as Record<string, unknown>);
            return item ? [item] : [];
        }
        return [];
    }

    const result: T[] = [];
    for (const item of raw) {
        if (typeof item === 'object' && item !== null) {
            const mapped = mapper(item as Record<string, unknown>);
            if (mapped) result.push(mapped);
        } else if (typeof item === 'string') {
            const mapped = mapper({ _rawString: item });
            if (mapped) result.push(mapped);
        }
    }
    return result;
}

function mapStringList(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    return raw.map(str).filter(Boolean);
}

function mapExperienceArray(raw: unknown, fallbackTitle: string, fallbackOrg: string): ResumeData['experience'] {
    return mapArray(raw, (o) => {
        let bullets = (Array.isArray(o.bullets) ? o.bullets.map(str) : []).filter(Boolean);
        if (bullets.length === 0) {
            const detail = str(o.description ?? o.summary ?? o.impact);
            if (detail) bullets = [detail];
        }
        if (bullets.length === 0) bullets = ['Please review and add impact details.'];

        return {
            title: str(o.title ?? o.role ?? o.position) || fallbackTitle,
            company: str(o.company ?? o.organization ?? o.employer) || fallbackOrg,
            location: str(o.location) || undefined,
            dates: str(o.dates ?? o.period ?? o.date ?? o.duration) || 'Dates',
            bullets,
        };
    });
}

function firstNonEmpty(...values: unknown[]): string | undefined {
    for (const value of values) {
        const result = str(value);
        if (result) return result;
    }
    return undefined;
}

export function normalizeResumeFromLLM(raw: unknown): ResumeData {
    const base = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};

    const piRaw = base.personalInfo ?? base.basics;
    const pi = typeof piRaw === 'object' && piRaw !== null ? (piRaw as Record<string, unknown>) : {};
    const profiles = Array.isArray(pi.profiles) ? pi.profiles : [];
    const githubProfile = profiles.find(
        (profile) => typeof profile === 'object' && profile !== null && /github/i.test(str((profile as Record<string, unknown>).network))
    ) as Record<string, unknown> | undefined;
    const linkedinProfile = profiles.find(
        (profile) => typeof profile === 'object' && profile !== null && /linkedin/i.test(str((profile as Record<string, unknown>).network))
    ) as Record<string, unknown> | undefined;

    const name = firstNonEmpty(pi.name) ?? 'Unknown';
    const title = firstNonEmpty(pi.title, pi.label);
    const tagline = firstNonEmpty(pi.tagline, pi.headline);
    const location = firstNonEmpty(
        pi.location,
        typeof pi.location === 'object' && pi.location !== null
            ? [
                  str((pi.location as Record<string, unknown>).city),
                  str((pi.location as Record<string, unknown>).region),
                  str((pi.location as Record<string, unknown>).countryCode),
              ]
                  .filter(Boolean)
                  .join(', ')
            : '',
    );
    const phone = firstNonEmpty(pi.phone);
    const email = firstNonEmpty(pi.email);
    const linkedin = firstNonEmpty(pi.linkedin, linkedinProfile?.url);
    const github = firstNonEmpty(pi.github, githubProfile?.url);
    const portfolio = firstNonEmpty(pi.portfolio, pi.website, pi.url);

    let summary = str(base.summary ?? base.profile ?? base.objective);
    if (summary.length < 10) {
        summary = summary.length > 0
            ? `${summary} Please review and expand this summary.`
            : 'Professional background summarized from your resume. Please review and edit.';
    }

    let techStackSummary = firstNonEmpty(base.techStackSummary, base.techSummary, base.stack);
    if (!techStackSummary && Array.isArray(base.skills) && base.skills.length > 0) {
        techStackSummary = base.skills
            .slice(0, 3)
            .map((item) => {
                if (typeof item === 'string') return str(item);
                if (typeof item === 'object' && item !== null) return str((item as Record<string, unknown>).items ?? (item as Record<string, unknown>).keywords);
                return '';
            })
            .filter(Boolean)
            .join(' | ');
    }

    let skills = mapArray(base.skills, (o) => {
        const keywords = Array.isArray(o.keywords) ? o.keywords.map(str).filter(Boolean).join(', ') : '';
        return {
            category: str(o.category ?? o.name) || 'General',
            items: str(o.items) || keywords || 'See resume for details',
        };
    });
    if (skills.length === 0) skills = [{ category: 'Skills', items: 'See resume text for details.' }];

    let experience = mapExperienceArray(base.experience ?? base.work, 'Position', 'Company');
    if (experience.length === 0) {
        experience = [{
            title: 'Experience',
            company: 'See resume',
            location: undefined,
            dates: 'Dates',
            bullets: ['Details could not be structured automatically. Please review and edit.'],
        }];
    }

    const internships = mapExperienceArray(base.internships, 'Intern', 'Organization');

    let education = mapArray(base.education, (ed) => ({
        institution: str(ed.institution ?? ed.school ?? ed.university ?? ed.college ?? ed.name) || 'Institution',
        degree: str(ed.degree ?? ed.studyType ?? ed.program) || 'Degree',
        fieldOfStudy: str(ed.fieldOfStudy ?? ed.major ?? ed.field) || undefined,
        location: str(ed.location) || undefined,
        dates: str(ed.dates ?? ed.period ?? [str(ed.startDate), str(ed.endDate)].filter(Boolean).join(' - ') ?? ed.year ?? ed.graduationDate) || 'Dates',
        gpa: str(ed.gpa ?? ed.score) || undefined,
        coursework: str(ed.coursework ?? ed.relevantCoursework) || undefined,
        honors: str(ed.honors ?? ed.awards) || undefined,
    }));
    if (education.length === 0) {
        education = [{ institution: 'Institution', degree: 'Degree', fieldOfStudy: undefined, location: undefined, dates: 'Dates', gpa: undefined, coursework: undefined, honors: undefined }];
    }

    const projects = mapArray(base.projects, (o) => ({
        name: str(o.name ?? o.title) || 'Project',
        description: str(o.description ?? o.summary) || undefined,
        techStack: str(o.techStack ?? o.technologies ?? o.stack) || undefined,
        role: str(o.role ?? o.contribution) || undefined,
        dates: str(o.dates ?? o.period ?? o.date) || undefined,
        impact: str(o.impact ?? o.result) || undefined,
        link: str(o.link ?? o.url ?? o.website) || undefined,
        bullets: (Array.isArray(o.bullets) ? o.bullets.map(str) : []).filter(Boolean),
    }));

    const certifications = mapArray(base.certifications ?? base.certificates, (o) => ({
        name: str(o.name ?? o.title ?? o._rawString) || 'Certification',
        issuer: str(o.issuer ?? o.organization ?? o.authority) || undefined,
        date: str(o.date ?? o.issueDate ?? o.year) || undefined,
        expiryDate: str(o.expiryDate ?? o.expirationDate) || undefined,
        credentialId: str(o.credentialId ?? o.id) || undefined,
        link: str(o.link ?? o.url) || undefined,
    }));

    const achievements = mapArray(base.achievements ?? base.awards, (o) => ({
        name: str(o.name ?? o.title ?? o._rawString) || 'Achievement',
        context: str(o.context ?? o.organization ?? o.event) || undefined,
        date: str(o.date ?? o.year) || undefined,
        rank: str(o.rank ?? o.result) || undefined,
        description: str(o.description ?? o.summary) || undefined,
        link: str(o.link ?? o.url) || undefined,
    }));

    const publications = mapArray(base.publications ?? base.blogs, (o) => ({
        title: str(o.title ?? o.name ?? o._rawString) || 'Publication',
        platform: str(o.platform ?? o.publisher ?? o.journal) || undefined,
        date: str(o.date ?? o.year ?? o.publishDate) || undefined,
        authors: str(o.authors ?? o.author) || undefined,
        description: str(o.description ?? o.summary) || undefined,
        link: str(o.link ?? o.url) || undefined,
    }));

    const openSource = mapArray(base.openSource ?? base.opensource, (o) => ({
        project: str(o.project ?? o.name ?? o.repository ?? o._rawString) || 'Open Source Project',
        contribution: str(o.contribution ?? o.role) || undefined,
        dates: str(o.dates ?? o.period ?? o.date) || undefined,
        impact: str(o.impact ?? o.result) || undefined,
        link: str(o.link ?? o.url) || undefined,
        bullets: (Array.isArray(o.bullets) ? o.bullets.map(str) : []).filter(Boolean),
    }));

    const leadership = mapArray(base.leadership, (o) => ({
        role: str(o.role ?? o.title) || 'Role',
        organization: str(o.organization ?? o.company) || 'Organization',
        location: str(o.location) || undefined,
        dates: str(o.dates ?? o.period ?? o.date) || undefined,
        bullets: (Array.isArray(o.bullets) ? o.bullets.map(str) : []).filter(Boolean),
    }));

    const volunteering = mapArray(base.volunteering ?? base.volunteer, (o) => ({
        role: str(o.role ?? o.title) || 'Volunteer',
        organization: str(o.organization ?? o.company) || 'Organization',
        location: str(o.location) || undefined,
        dates: str(o.dates ?? o.period ?? o.date) || undefined,
        bullets: (Array.isArray(o.bullets) ? o.bullets.map(str) : []).filter(Boolean),
    }));

    const conferences = mapArray(base.conferences ?? base.talks, (o) => ({
        name: str(o.name ?? o.event ?? o._rawString) || 'Event Name',
        topic: str(o.topic ?? o.title) || undefined,
        role: str(o.role) || undefined,
        date: str(o.date ?? o.year) || undefined,
        location: str(o.location) || undefined,
        description: str(o.description ?? o.summary) || undefined,
        link: str(o.link ?? o.url) || undefined,
    }));

    const languages = mapArray(base.languages, (o) => ({
        language: str(o.language ?? o.name ?? o._rawString) || 'Language',
        proficiency: str(o.proficiency ?? o.level ?? o.fluency) || undefined,
    }));

    const interests = mapArray(base.interests ?? base.hobbies, (o) => ({
        name: str(o.name ?? o._rawString) || 'Interest',
        details: str(o.details ?? o.description ?? (Array.isArray(o.keywords) ? o.keywords.map(str).filter(Boolean).join(', ') : '')) || undefined,
    }));

    const keyMetrics = mapArray(base.keyMetrics ?? base.metrics ?? base.highlights, (o) => ({
        label: str(o.label ?? o.name ?? o.title) || 'Metric',
        value: str(o.value ?? o.metric ?? o.result ?? o._rawString) || 'Impact',
        context: str(o.context ?? o.description) || undefined,
    }));

    const products = mapArray(base.products ?? base.systemsOwned, (o) => ({
        name: str(o.name ?? o.system ?? o.product ?? o._rawString) || 'Product or System',
        responsibility: str(o.responsibility ?? o.role) || undefined,
        scale: str(o.scale) || undefined,
        impact: str(o.impact ?? o.result) || undefined,
    }));

    const devopsContributions = mapStringList(base.devopsContributions ?? base.sreContributions ?? base.devops);
    const securityContributions = mapStringList(base.securityContributions ?? base.security ?? base.compliance);

    const additionalRaw = base.additionalInfo ?? base.additionalInformation;
    const additionalInfo = typeof additionalRaw === 'object' && additionalRaw !== null
        ? {
              availability: str((additionalRaw as Record<string, unknown>).availability) || undefined,
              workAuthorization: str((additionalRaw as Record<string, unknown>).workAuthorization) || undefined,
              relocation: str((additionalRaw as Record<string, unknown>).relocation) || undefined,
              travel: str((additionalRaw as Record<string, unknown>).travel) || undefined,
              notes: str((additionalRaw as Record<string, unknown>).notes) || undefined,
          }
        : {};

    const customSections = mapArray(base.customSections ?? base.additionalSections, (o) => ({
        title: str(o.title ?? o.name) || 'Additional Section',
        items: Array.isArray(o.items)
            ? o.items.map(str).filter(Boolean)
            : mapStringList(o.bullets ?? o.points ?? (str(o.content) ? [str(o.content)] : [])),
    }));

    let confidenceScore: number | undefined;
    if (typeof base.confidenceScore === 'number' && Number.isFinite(base.confidenceScore)) {
        confidenceScore = Math.min(1, Math.max(0, base.confidenceScore));
    }

    const candidate: ResumeData = {
        personalInfo: {
            name,
            title,
            tagline,
            location,
            phone,
            email,
            linkedin,
            github,
            portfolio,
        },
        summary,
        techStackSummary,
        sectionOrder: Array.isArray(base.sectionOrder)
            ? [...new Set(base.sectionOrder.map(str).filter(Boolean))].filter((item): item is ResumeData['sectionOrder'][number] =>
                (DEFAULT_SECTION_ORDER as readonly string[]).includes(item)
              )
            : [...DEFAULT_SECTION_ORDER],
        skills,
        keyMetrics,
        experience,
        internships,
        education,
        projects,
        certifications,
        achievements,
        publications,
        openSource,
        leadership,
        volunteering,
        conferences,
        languages,
        interests,
        products,
        devopsContributions,
        securityContributions,
        additionalInfo,
        customSections,
        confidenceScore,
    };

    const seen = new Set(candidate.sectionOrder);
    for (const key of DEFAULT_SECTION_ORDER) {
        if (!seen.has(key)) candidate.sectionOrder.push(key);
    }

    return ResumeDataSchema.parse(candidate);
}
