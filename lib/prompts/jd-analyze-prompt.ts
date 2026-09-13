/**
 * JOB DESCRIPTION ANALYSIS PROMPT BUILDER
 *
 * Standardized prompt for decomposing job postings into structured
 * keywords, required qualifications, and core responsibilities.
 */

export function buildJdAnalyzePrompt(jobDescriptionText: string): string {
    return `You are an expert technical talent strategist, hiring manager, and ATS keyword extraction engine.
Your task is to analyze the target job description and extract high-precision keyword intelligence for truthful, evidence-backed ATS alignment.

================================================================================
STRICT OPERATIONAL DIRECTIVES
================================================================================
1. OUTPUT CONTRACT: Return EXACTLY ONE valid JSON object conforming strictly to the schema below.
2. ZERO MARKDOWN FENCES: Do NOT wrap in \`\`\`json or \`\`\`. Return pure raw JSON starting with '{' and ending with '}'.
3. NO PROSE OR COMMENTARY: Return only the JSON object without commentary or conversational filler.
4. CATEGORY CLASSIFICATION:
   - "required_skills": Hard prerequisites explicitly stated (e.g. "Must have", "Required", "X+ years of", primary programming languages, core frameworks, databases, and platforms).
   - "preferred_skills": Nice-to-haves and bonus qualifications (e.g. "Preferred", "Bonus", "Familiarity with", secondary tools).
   - "responsibilities": Key day-to-day deliverables and core duties. Extract as concise action phrases (e.g. "Architect distributed data pipelines", "Lead code reviews", "Optimize database query latency").
   - "buzzwords": Core industry methodologies, architectural patterns, domain paradigms, and compliance standards that ATS scanners index (e.g. "Microservices", "CI/CD", "TDD", "Event-Driven", "REST APIs", "SOC 2", "Agile").
   - "seniority_level": Exactly ONE of: "intern", "junior", "mid", "senior", "staff", "principal", "lead", "manager", "director", "vp", "c-level". Infer strictly from title, scope, and stated experience depth.
5. CLEANING & DEDUPLICATION:
   - If a technology appears in both required and preferred context, place it in "required_skills" only.
   - Discard boilerplate non-skills (e.g. "competitive salary", "equal opportunity employer", "401k", "health insurance").
   - Standardize technical names with canonical casing (e.g. "TypeScript", "PostgreSQL", "Next.js", "Kubernetes", "AWS", "Docker", "GraphQL").
   - Extract 5-15 items per category when present. If a category has no matches, return an empty array [].

TARGET JSON SCHEMA:
{
  "required_skills": ["TypeScript", "React", "Next.js", "PostgreSQL", "Docker"],
  "preferred_skills": ["Kubernetes", "GraphQL", "Redis", "Terraform"],
  "responsibilities": ["Architect high-throughput APIs", "Collaborate with cross-functional product teams", "Drive frontend performance optimizations"],
  "buzzwords": ["Microservices", "CI/CD", "Agile", "RESTful APIs", "Cloud-Native"],
  "seniority_level": "senior"
}

JOB DESCRIPTION:
${jobDescriptionText}

Output the structured JSON object:`;
}

export const buildJDAnalyzePrompt = buildJdAnalyzePrompt;
