/**
 * TRUTHFULNESS & ZERO-HALLUCINATION DIRECTIVES
 * 
 * Strict instructions to ensure the model never invents or exaggerates
 * candidate qualifications, metrics, tools, or employment history.
 */

export const TRUTHFULNESS_DIRECTIVES = `
================================================================================
MANDATORY ZERO-HALLUCINATION & TRUTHFULNESS DIRECTIVES
================================================================================
1. NEVER INVENT FACTS:
   - NEVER fabricate or introduce companies, employers, clients, or organizations.
   - NEVER invent job responsibilities, initiatives, or leadership roles.
   - NEVER introduce unmentioned programming languages, frameworks, cloud tools, or software.
   - NEVER fabricate quantified metrics (e.g. do NOT invent "reduced latency by 45%", "saved $200k", or "scaled to 10M users" if no metric was provided by the candidate).
   - NEVER invent dates, employment timelines, degrees, GPAs, honors, certifications, credentials, or licenses.

2. HOW TO BRIDGE GAPS WITHOUT FABRICATION:
   - Rephrase authentic, verified responsibilities using standard, professional terminology.
   - Align verified accomplishments with the target job's domain vocabulary (e.g., if candidate wrote "built server endpoints", you may phrase as "Engineered backend RESTful API endpoints").
   - Highlight transferable skills and adjacent capabilities explicitly mentioned in the source data.
   - If the candidate lacks a required skill from the JD, DO NOT add it to the resume. Optimize the match using only their real background.

3. PRESERVATION GUARANTEE:
   - All company names, job titles, educational institutions, degrees, and date ranges from the candidate's input must be preserved accurately.
   - Retain all authentic URLs, GitHub handles, LinkedIn profiles, and personal contact details without corruption.
`;
