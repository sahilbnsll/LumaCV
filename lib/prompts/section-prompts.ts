/**
 * SECTION-LEVEL MODULAR PROMPT BUILDERS
 * 
 * Provides targeted, lightweight prompts for optimizing individual resume sections
 * without sending the entire resume, optimizing token cost, latency, and focus.
 */

import { TRUTHFULNESS_DIRECTIVES } from './truthfulness-rules';
import { ATS_DIRECTIVES } from './ats-rules';
import { SECTION_DIRECTIVES } from './section-rules';
import { QUALITY_SELF_CHECK_DIRECTIVES } from './quality-self-check';
import { AnalyzeJDResponse, ExperienceItem, ProjectItem, SkillGroup } from '@/lib/resume-schema';

// ── 1. Summary Section Prompt ──────────────────────────────────────────────
export function buildSummaryPrompt({
    currentSummary,
    candidateRole,
    verifiedSkills,
    jdKeywords,
}: {
    currentSummary: string;
    candidateRole?: string;
    verifiedSkills: string[];
    jdKeywords?: AnalyzeJDResponse | null;
}): string {
    return `You are an executive resume strategist. Optimize the candidate's Professional Summary into 2-3 punchy, high-signal sentences.

${TRUTHFULNESS_DIRECTIVES}
${SECTION_DIRECTIVES}
${QUALITY_SELF_CHECK_DIRECTIVES}

INPUT CONTEXT:
- Candidate Target Role: ${candidateRole || 'Software Professional'}
- Current Summary: "${currentSummary || 'None provided'}"
- Candidate's Verified Skills: ${verifiedSkills.join(', ')}
${jdKeywords ? `- Target Job Required Skills: ${jdKeywords.required_skills.join(', ')}` : ''}
${jdKeywords ? `- Target Job Seniority: ${jdKeywords.seniority_level || 'Professional'}` : ''}

CONSTRAINTS:
1. Return EXACTLY ONE JSON object: { "summary": "optimized 2-3 sentences" }
2. NO markdown wrapping, no extra prose.
3. Use ONLY verified skills and capabilities already evidenced above. Do NOT invent new tools.

Output the JSON:`;
}

// ── 2. Experience Section Prompt ───────────────────────────────────────────
export function buildExperienceSectionPrompt({
    experience,
    jdKeywords,
}: {
    experience: ExperienceItem[];
    jdKeywords?: AnalyzeJDResponse | null;
}): string {
    return `You are a principal technical recruiter and resume editor. Refine the candidate's work experience bullets to maximize technical impact and ATS scannability while preserving 100% factual accuracy.

${TRUTHFULNESS_DIRECTIVES}
${ATS_DIRECTIVES}
${SECTION_DIRECTIVES}
${QUALITY_SELF_CHECK_DIRECTIVES}

MANDATORY RULES:
1. Apply the Action -> Technical Work -> Context -> Outcome formula to each bullet.
2. PRESERVE all company names, job titles, locations, and employment dates exactly as given.
3. NEVER invent numbers, percentages, or technologies.
4. If a bullet is already strong and truthful, keep it with minimal polish.
5. Return EXACTLY ONE JSON object: { "experience": [ ...refined experience array ] }

SOURCE EXPERIENCE DATA:
${JSON.stringify(experience, null, 2)}

${jdKeywords ? `TARGET JOB FOCUS:\n- Required Skills: ${jdKeywords.required_skills.join(', ')}\n- Key Responsibilities: ${jdKeywords.responsibilities.slice(0, 6).join('; ')}` : ''}

Output the JSON:`;
}

// ── 3. Projects Section Prompt ─────────────────────────────────────────────
export function buildProjectsSectionPrompt({
    projects,
    jdKeywords,
}: {
    projects: ProjectItem[];
    jdKeywords?: AnalyzeJDResponse | null;
}): string {
    return `You are an elite software engineering portfolio reviewer. Optimize the candidate's projects section into clear technical highlights and verifiable impact bullets.

${TRUTHFULNESS_DIRECTIVES}
${SECTION_DIRECTIVES}
${QUALITY_SELF_CHECK_DIRECTIVES}

MANDATORY RULES:
1. Apply the Problem -> Implementation -> Technology -> Result formula.
2. For each project, separate "highlights" (architectural features built) and "impactBullets" (outcomes/benchmarks).
3. BANNED: Do NOT format bullet text with bracket labels like "[Highlight 1]".
4. PRESERVE project names, roles, dates, and URLs exactly as provided.
5. Return EXACTLY ONE JSON object: { "projects": [ ...refined projects array ] }

SOURCE PROJECTS DATA:
${JSON.stringify(projects, null, 2)}

${jdKeywords ? `TARGET JOB FOCUS:\n- Target Stack: ${jdKeywords.required_skills.join(', ')}` : ''}

Output the JSON:`;
}

// ── 4. Skills Taxonomy Prompt ──────────────────────────────────────────────
export function buildSkillsSectionPrompt({
    skills,
    jdKeywords,
}: {
    skills: SkillGroup[];
    jdKeywords?: AnalyzeJDResponse | null;
}): string {
    return `You are an ATS parser and skills taxonomy engineer. Organize and categorize the candidate's verified skills into clean, standardized technical categories.

${TRUTHFULNESS_DIRECTIVES}
${SECTION_DIRECTIVES}
${QUALITY_SELF_CHECK_DIRECTIVES}

MANDATORY RULES:
1. Group skills into standard categories: Languages & Runtimes, Frameworks & Libraries, Cloud & Infrastructure, Databases & Storage, Developer Tools & Methodologies.
2. Deduplicate and use standard canonical casing (e.g. "TypeScript", "PostgreSQL", "Docker").
3. DO NOT add unverified skills that the candidate never listed or used.
4. Return EXACTLY ONE JSON object: { "skills": [ { "category": "...", "items": "Comma, Separated, Items" } ] }

CANDIDATE SKILLS:
${JSON.stringify(skills, null, 2)}

${jdKeywords ? `TARGET JOB REQUIRED SKILLS:\n${jdKeywords.required_skills.join(', ')}` : ''}

Output the JSON:`;
}

// ── 5. Single Bullet Refinement Prompt ──────────────────────────────────────
export function buildSingleBulletPrompt({
    bullet,
    roleTitle,
    company,
    jdKeywords,
}: {
    bullet: string;
    roleTitle?: string;
    company?: string;
    jdKeywords?: AnalyzeJDResponse | null;
}): string {
    return `You are a professional resume bullet writer. Refine a single resume bullet point to maximize impact, clarity, and executive strength.

${TRUTHFULNESS_DIRECTIVES}
${ATS_DIRECTIVES}
${QUALITY_SELF_CHECK_DIRECTIVES}

INPUT BULLET:
"${bullet}"
Role Context: ${roleTitle || 'Professional'} at ${company || 'Company'}
${jdKeywords ? `Target JD Keywords: ${jdKeywords.required_skills.slice(0, 6).join(', ')}` : ''}

CONSTRAINTS:
1. Begin with a single commanding action verb.
2. Highlight technical context and execution.
3. If the bullet contains a metric, preserve it verbatim. If it has no metric, DO NOT invent one.
4. Output EXACTLY ONE JSON object: { "bullet": "Refined single bullet point string" }

Output the JSON:`;
}
