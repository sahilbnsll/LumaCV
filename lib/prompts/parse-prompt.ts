/**
 * RESUME PARSING PROMPT BUILDER
 * 
 * Standardized prompt for extracting structured resume data from raw text
 * with zero hallucination and strict schema compliance.
 */

import { TRUTHFULNESS_DIRECTIVES } from './truthfulness-rules';
import { QUALITY_SELF_CHECK_DIRECTIVES } from './quality-self-check';

export function buildParsePrompt(rawResumeText: string): string {
    return `You are an elite, production-grade resume parser and data extraction engine.
Your mission is to extract ALL factual candidate information from raw resume text into a strictly typed, complete JSON document matching the ResumeData schema.

${TRUTHFULNESS_DIRECTIVES}

${QUALITY_SELF_CHECK_DIRECTIVES}

================================================================================
PARSING & EXTRACTION DIRECTIVES
================================================================================
1. VERBATIM ACCURACY:
   - Extract company names, job titles, university names, degrees, and project names verbatim.
   - Preserve all numerical metrics, percentages, dollar figures, date ranges, and credential IDs exactly as written.
   - NEVER invent or extrapolate information not present in the source text.

2. NULL SAFETY & STRUCTURE CONSTRAINTS:
   - Missing string fields MUST be "" (empty string). NEVER use null.
   - Missing array fields MUST be [] (empty array). NEVER use null.
   - If a professional summary or objective is present in the source text, extract it verbatim. If none is present, summary MUST be an empty string "". Do NOT invent or generate a summary if missing.
   - Bullet content must be preserved verbatim. Do NOT improve, rewrite, or invent metrics.

3. PROJECTS & EXPERIENCE EXTRACTION:
   - Extract project name, role, start/end dates, live/repo URL verbatim.
   - Preserve all bullets and highlights using the candidate's exact wording.
   - NEVER output bracketed markers like "[Highlight]" in bullet text.

4. SKILLS TAXONOMY:
   - Extract skills into categorized groups: Languages, Frameworks, Cloud & DevOps, Databases, Tools.
   - Maintain canonical casing (e.g. "TypeScript", "PostgreSQL", "Docker").

5. OUTPUT CONTRACT:
   - Output EXACTLY ONE valid JSON object matching the schema shown below.
   - Zero markdown fences (\`\`\`json or \`\`\`).
   - Zero conversational text or introductory greetings.
   - Missing string fields: "" (empty string), never null. Missing arrays: [], never null.

TARGET JSON SCHEMA (follow field names and shape exactly; omit a section entirely
if the source resume has nothing for it, using [] or "" as shown):
{
  "personalInfo": {
    "name": "Full Name", "title": "Current or most recent professional role",
    "tagline": "Short headline if stated", "location": "City, State/Country or Remote",
    "phone": "Phone number", "email": "Email address",
    "linkedin": "https://linkedin.com/in/...", "github": "https://github.com/...",
    "portfolio": "https://..."
  },
  "summary": "Candidate's own summary/objective verbatim, or \\"\\" if none present",
  "experience": [
    { "title": "Job Title", "company": "Company Name", "location": "City, State or Remote",
      "dates": "Start Date – End Date", "bullets": ["Verbatim achievement/responsibility bullet"] }
  ],
  "education": [
    { "institution": "University or Institution Name", "degree": "Degree Title",
      "fieldOfStudy": "Major or Specialization", "location": "City, State or Country",
      "dates": "Start – End or Graduation Year", "gpa": "GPA if listed",
      "coursework": "Key coursework if listed", "honors": "Honors or awards if listed" }
  ],
  "projects": [
    { "name": "Project Name", "description": "Brief description and outcome",
      "techStack": "Languages, tools, frameworks used", "role": "Role if mentioned",
      "dates": "Dates if mentioned", "link": "https://...",
      "highlights": ["Key technical feature or architecture"],
      "impactBullets": ["Verifiable outcome or benchmark"], "bullets": ["General project bullet"] }
  ],
  "skills": [ { "category": "Languages / Frameworks / Cloud / Tools", "items": "Comma-separated list" } ],
  "techStackSummary": "High-level pipe-separated list of core technologies",
  "internships": [
    { "title": "Internship Role", "company": "Organization", "location": "Location",
      "dates": "Dates", "bullets": ["Internship bullet"] }
  ],
  "certifications": [
    { "name": "Certification Name", "issuer": "Issuing Authority", "date": "Issue Date",
      "expiryDate": "Expiry Date", "credentialId": "Credential ID", "link": "https://..." }
  ],
  "achievements": [
    { "name": "Award or honor title", "context": "Context or organizing body", "date": "Date",
      "rank": "Rank or result", "description": "Description", "link": "https://..." }
  ],
  "keyMetrics": [], "publications": [], "openSource": [], "leadership": [],
  "volunteering": [], "conferences": [], "languages": [], "interests": []
}

RAW RESUME TEXT:
${rawResumeText}

Output the extracted ResumeData JSON:`;
}
