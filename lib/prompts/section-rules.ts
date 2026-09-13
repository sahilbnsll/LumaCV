/**
 * SECTION-SPECIFIC OPTIMIZATION RULES
 * 
 * Explicit constraints and formula standards for each distinct section
 * of the resume (Summary, Experience, Projects, Skills, Education, Credentials, Bullets).
 */

export const SECTION_DIRECTIVES = `
================================================================================
SECTION-SPECIFIC OPTIMIZATION FORMULAS & CONSTRAINTS
================================================================================

1. PROFESSIONAL SUMMARY:
   - Target Length: Exactly 2 to 3 high-signal, punchy sentences.
   - Formula: [Target Professional Title / Seniority] + [Verified Core Domain Focus & Years of Depth] + [Key Verified Technical Capabilities & Business Strengths].
   - Tone: Authoritative, direct, technical.
   - Forbidden: NO fluffy introductory claims ("A passionate software engineer seeking...", "Dynamic results-driven team player with proven track record...").
   - Quality rule: If the existing summary is already concise and accurately positioned, preserve it with minimal polish.

2. WORK EXPERIENCE & INTERNSHIPS:
   - Mandatory Bullet Formula:
     [Strong Action Verb] -> [Specific Technical Work] -> [Business / System Context] -> [Verified Outcome / Impact]
   - Example (Good): "Engineered distributed event-driven ingestion pipeline using Apache Kafka and Go, reducing data processing bottlenecks."
   - Example (Bad): "Responsible for working on Kafka pipelines and helped improve system performance."
   - Metadata Protection: Company names, job titles, locations, and employment dates MUST remain 100% identical to source.
   - Length: Each bullet should be 1 to 2 lines max in printed Typst output. Avoid 4-line run-on paragraphs.

3. PROJECTS & PORTFOLIO:
   - Mandatory Project Bullet Formula:
     [Technical Problem] -> [Architectural Implementation] -> [Technologies Used] -> [Result / Performance Milestone]
   - Structured Fields:
     * "highlights": Array of strings describing features engineered and technical implementations.
     * "impactBullets": Array of strings describing verified measurable outcomes, adoption stats, or reliability wins.
   - Bracket ban: Never wrap bullet text in raw bracket labels like "[Highlight 1]" or "(Result)".
   - URLs & Metadata: Project names, roles, repository links, and live URLs must be preserved accurately.

4. TECHNICAL SKILLS TAXONOMY:
   - Organize verified skills into clean, standardized categories:
     * Languages & Runtimes (e.g. TypeScript, Python, Go, Java, Rust, SQL)
     * Frameworks & Libraries (e.g. React.js, Next.js, FastAPI, Node.js, Spring Boot)
     * Cloud & Infrastructure (e.g. AWS, GCP, Docker, Kubernetes, Terraform)
     * Databases & Storage (e.g. PostgreSQL, Redis, MongoDB, Elasticsearch)
     * Developer Tools & Methodologies (e.g. Git, CI/CD, Kafka, GraphQL, Agile)
   - Deduplication: Standardize canonical naming (use "React.js" instead of multiple entries of "React", "ReactJS").
   - Strict Ground Truth: ONLY include technologies that the candidate has explicitly mentioned or used in experience/projects. DO NOT invent skills.

5. EDUCATION, CERTIFICATIONS & CREDENTIALS:
   - 100% Factual Preservation:
     * Institution name, degree title, and graduation year/dates must not be altered.
     * GPAs must only appear if explicitly provided in source; never invent or round up GPAs.
     * Coursework and honors must reflect actual achievements from source.
     * Certification names, issuing organizations, dates, credential IDs, and validation links must remain authentic.

6. INDIVIDUAL BULLET REFINEMENT:
   - One active verb per bullet opening.
   - Past tense for prior accomplishments ("Engineered", "Optimized"), present tense only for ongoing primary responsibilities ("Orchestrates", "Maintains").
   - Never remove verified numbers or metrics; never inject fabricated metrics.
`;
