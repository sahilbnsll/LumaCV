/**
 * RESUME TAILORING & OPTIMIZATION PROMPT BUILDER
 * 
 * Generates context-first, standardized prompts for resume optimization
 * and targeted job alignment with zero hallucination and strict schema compliance.
 */

import { TRUTHFULNESS_DIRECTIVES } from './truthfulness-rules';
import { ATS_DIRECTIVES } from './ats-rules';
import { SECTION_DIRECTIVES } from './section-rules';
import { QUALITY_SELF_CHECK_DIRECTIVES } from './quality-self-check';
import { SCORING_RUBRIC_DIRECTIVES } from './scoring-rules';
import { ResumeData, AnalyzeJDResponse } from '@/lib/resume-schema';

export interface BuildTailorPromptOptions {
    resumeData: ResumeData;
    jdKeywords?: AnalyzeJDResponse | null;
    /** Raw job description text, when jdKeywords isn't already extracted, the
     *  model extracts it itself as part of this same completion instead of a
     *  separate analyze-jd API call. */
    jd?: string | null;
    tailorMode: 'optimize' | 'tailor';
    template?: string;
    theme?: string;
}

export function buildTailorPrompt({
    resumeData,
    jdKeywords,
    jd,
    tailorMode,
    template = 'modern',
    theme = 'none',
}: BuildTailorPromptOptions): string {
    const needsKeywordExtraction = !jdKeywords && !!jd?.trim();
    const isOptimizeOnly = tailorMode === 'optimize';

    const modeInstructions = isOptimizeOnly
        ? `
================================================================================
OPERATIONAL MODE: 100% FACT-PRESERVING RESUME OPTIMIZATION
================================================================================
1. PRIMARY GOAL: Maximize grammatical punch, executive tone, action-verb clarity, and ATS scannability.
2. STRICT EVIDENCE LOCK: Use EXCLUSIVELY the technologies, projects, roles, and metrics present in the candidate's input.
3. PRESERVE STRONG CONTENT: If existing bullet points or summaries are already strong, professional, and clear, PRESERVE THEM. Do not rewrite for the sake of rewriting.
4. ZERO INVENTION: Never add unstated technologies, certifications, metrics, or responsibilities.
${needsKeywordExtraction ? `5. Even though this mode does not rewrite for JD alignment, you MUST still extract structured job intelligence (required skills, preferred skills, responsibilities, buzzwords, seniority level) from the raw job description text provided later in this prompt, and return it as "jdKeywords" in your JSON output (see OUTPUT CONTRACT below).` : ''}
`
        : `
================================================================================
OPERATIONAL MODE: AGGRESSIVE JD ALIGNMENT & MAXIMUM ATS TARGETING
================================================================================
CORE OBJECTIVE:
Given the candidate's existing resume + target Job Description, rewrite the resume to maximize ATS match against the target Job Description. This mode is INTENTIONALLY MUCH MORE AGGRESSIVE than 100% Fact-Preserving mode.

PREFER “STRONGLY REWRITE TO MAXIMIZE RELEVANCE” OVER “MAKE ONLY MINOR WORDING CHANGES.”
It is expected and acceptable for the final resume to look substantially different from the original wording.
Do NOT preserve original sentence structure simply because it exists in the source resume.

CRITICAL RULE: “BEND THE WORDING, NOT THE FACTS.”
You may aggressively reinterpret, reframe, restructure, and rewrite existing experience, but you MUST NOT fabricate:
- A company or organization
- A job or employment position
- A degree or university
- A certification or credential
- A technology the candidate has never mentioned or used
- A responsibility with no reasonable connection to existing experience
- Metrics or numerical results that do not exist in the source input
- Employment dates or graduation timelines
- Job titles
- URLs or links

EXPLICITLY SURFACE RELATED EXPERIENCE USING JD TERMINOLOGY:
When the resume contains experience that is reasonably related to a JD requirement, you SHOULD explicitly surface that relationship using the terminology from the JD.
Example:
  Existing input: "Managed AWS infrastructure using Terraform."
  Target JD: "Experience managing cloud infrastructure using Infrastructure as Code, Terraform, AWS, and CI/CD."
  Preferred aggressive rewrite: "Managed AWS cloud infrastructure using Terraform-based Infrastructure as Code and integrated infrastructure changes into CI/CD workflows."
Do NOT weaken the output unnecessarily just because the exact JD wording is not already present.

KEYWORD ALIGNMENT & SEMANTIC BRIDGING:
1. Extract required skills, technologies, responsibilities, tools, methodologies, and domain terminology from the JD:
${needsKeywordExtraction ? `   The structured job intelligence below has NOT been pre-extracted, derive it
   yourself from the raw job description text provided later in this prompt
   (required skills, preferred/bonus skills, core responsibilities, industry
   buzzwords, seniority level), then use your own extraction for the rest of
   this section. You MUST also return it as "jdKeywords" in your JSON output
   (see OUTPUT CONTRACT below) so it isn't silently discarded.` : `   - Required Technologies: ${JSON.stringify(jdKeywords?.required_skills || [])}
   - Preferred / Bonus Technologies: ${JSON.stringify(jdKeywords?.preferred_skills || [])}
   - Core Engineering Deliverables: ${JSON.stringify((jdKeywords?.responsibilities || []).slice(0, 8))}
   - Industry Methodologies: ${JSON.stringify(jdKeywords?.buzzwords || [])}
   - Seniority Level: ${JSON.stringify(jdKeywords?.seniority_level || 'Senior')}`}
2. Map each requirement against existing resume evidence:
   - Direct matches: Match verbatim terminology.
   - Strong semantic matches: Bridge equivalent concepts (e.g. Kubernetes ↔ container orchestration).
   - Partial/indirect matches: Explicitly articulate the transferable relationship using JD keywords.
   - Unsupported requirements: NEVER invent or claim skills the candidate does not have.
3. Maximize coverage of direct, semantic, and partial matches. Never fabricate unsupported requirements.
4. Semantic matching equivalencies (where candidate experience supports the relationship, include both the JD terminology and the concrete technology):
   - “container orchestration” ↔ Kubernetes
   - “Infrastructure as Code” / “IaC” ↔ Terraform / CloudFormation
   - “cloud monitoring & observability” ↔ CloudWatch / Prometheus / Grafana / Datadog
   - “continuous delivery & integration” ↔ CI/CD pipelines / GitHub Actions / GitLab CI / Jenkins
   - “containerized workloads” ↔ Docker / Kubernetes workloads
   - “event-driven architectures” ↔ Kafka / RabbitMQ / SQS
   - “distributed caching & low latency” ↔ Redis / Memcached
   - “relational data modeling” ↔ PostgreSQL / MySQL / SQL

ATS KEYWORD PRIORITIZATION ORDER:
Optimize in this approximate order:
1. Required JD keywords
2. Core responsibilities
3. Required technical skills
4. Relevant tools & platforms
5. Domain terminology
6. Preferred qualifications
7. General wording quality
(Do not optimize for keyword density alone; keywords must remain readable and contextually meaningful.)

SECTION-BY-SECTION AGGRESSIVE REWRITE STRATEGY:
1. PROFESSIONAL SUMMARY:
   - Rewrite specifically for the target JD.
   - Include the most important relevant technologies, responsibilities, and domain terminology from the JD that are supported by candidate experience.
   - Remove generic fluff statements that do not improve JD relevance.
2. WORK EXPERIENCE:
   - Prioritize and reorder bullets within each role: put the strongest matching evidence and most JD-relevant bullets FIRST.
   - Rewrite bullets using the language, responsibilities, and concepts emphasized in the JD.
   - Use JD terminology wherever supported by candidate experience.
   - Combine related technologies/concepts when this improves ATS coverage.
   - Replace weak/general wording with commanding, JD-aligned executive verbs.
3. PROJECTS:
   - Emphasize technologies, architecture, responsibilities, and outcomes relevant to the JD.
   - Reframe existing project work around the target role.
   - Ensure technical keywords appear naturally in high-value sentence positions.
4. TECHNICAL SKILLS:
   - Reorganize skill categories and items so the most relevant JD technologies appear first.
   - Preserve only skills supported by candidate's existing resume/profile.
   - Where a technology has common ATS aliases, use both terms (e.g., "Kubernetes (K8s)", "Amazon Web Services (AWS)", "TypeScript / JavaScript", "CI/CD").

QUALITY SELF-CHECK BEFORE RETURNING:
- Maximum realistic JD keyword coverage achieved.
- Strong semantic alignment without inventing unsupported claims.
- Important keywords appear in genuine, readable context.
- Resume remains highly readable, commanding, and professional.
- No unsupported factual claims introduced.
- Structured data (companies, titles, dates, links) fully preserved.
- No duplicate keyword stuffing or unnatural repetition.
`;

    return `You are an elite, world-class executive resume strategist, principal engineer recruiter, and ATS compliance authority.
Your mission is to produce an exceptionally high-caliber, truthful, ATS-optimized resume in strictly valid JSON format matching the ResumeData schema.

${TRUTHFULNESS_DIRECTIVES}

${ATS_DIRECTIVES}

${SECTION_DIRECTIVES}

${SCORING_RUBRIC_DIRECTIVES}

${QUALITY_SELF_CHECK_DIRECTIVES}

${modeInstructions}

================================================================================
OUTPUT CONTRACT & SCHEMA REQUIREMENTS
================================================================================
1. You MUST return EXACTLY ONE valid JSON object without markdown fences (no \`\`\`json or \`\`\`). Output pure raw JSON.
2. Structure:
   You may return either:
   Option A (Recommended for Aggressive Alignment):
   {
     "tailoredResume": { /* complete ResumeData object */ },
     "atsAlignmentSummary": {
       "overallScore": 92, // 0 to 100
       "matchedRequirements": ["Directly matched JD requirement 1", "..."],
       "partiallyMatchedRequirements": ["Transferable/semantically matched requirement 1", "..."],
       "unsupportedRequirements": ["Truthfully missing JD requirement 1 (NEVER fabricate!)", "..."],
       "incorporatedKeywords": ["High-value JD keyword 1", "Keyword 2", "..."]
     }${needsKeywordExtraction ? `,
     "jdKeywords": {
       "required_skills": ["..."],
       "preferred_skills": ["..."],
       "responsibilities": ["..."],
       "buzzwords": ["..."],
       "seniority_level": "Senior"
     }` : ''}
   }
   Option B: The complete ResumeData JSON object directly (with confidenceScore).
3. Every top-level section present in the source input must be retained in the output.
4. In projects: provide both "highlights" and "impactBullets" as arrays of clean strings. NEVER output raw bracket markers like "[Highlight 1]" or "(Result)".
5. In personalInfo: preserve candidate's name, email, phone, location, linkedin, and github exactly as provided.
6. Provide an honest confidenceScore between 0 and 1 reflecting real parsing and alignment fidelity, do NOT default to a comfortable-looking number. A resume with weak JD overlap or low-confidence parsing should score low; there is no minimum floor.
${needsKeywordExtraction ? '7. You MUST include the "jdKeywords" object shown above, derived from the raw job description text below.' : ''}

================================================================================
CANDIDATE SOURCE RESUME JSON:
================================================================================
${JSON.stringify(resumeData, null, 2)}

${jdKeywords ? `
================================================================================
TARGET JOB INTELLIGENCE:
================================================================================
${JSON.stringify(jdKeywords, null, 2)}
` : ''}
${needsKeywordExtraction ? `
================================================================================
TARGET JOB DESCRIPTION (raw text, extract structured intelligence yourself):
================================================================================
${jd!.trim().substring(0, 14000)}
` : ''}

Generate and output the complete optimized ResumeData JSON object now:`;
}
