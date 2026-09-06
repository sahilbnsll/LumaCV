# LumaCV AI Pipeline: Dual-Mode Tailoring & Anti-Hallucination

This document details the engineering specifications, prompt structures, safety guardrails, and audit trail contracts governing LumaCV's AI tailoring engine.

---

## 1. Operating Modes Overview

LumaCV provides two distinct operating modes tailored to candidate workflows:

```
                          ┌──────────────────────────┐
                          │     User Resume Data     │
                          └─────────────┬────────────┘
                                        │
                       Target Job Description Provided?
                                       / \
                                     Yes  No
                                     /      \
                                    /        \
                                   ▼          ▼
                      ┌────────────────┐   ┌────────────────┐
                      │     MODE 2     │   │     MODE 1     │
                      │  Targeted JD   │   │  General Fact  │
                      │   Alignment    │   │  Optimization  │
                      └────────────────┘   └────────────────┘
```

### Mode 1: Resume Optimization (General Fact Enhancement)
- **Goal**: Polish phrasing, eliminate passive voice, and strengthen technical clarity without altering the candidate's core narrative.
- **When Used**: Selected when the user wants to polish their resume without a specific job posting target.
- **Transformation Rules**:
  - Replaces weak passive phrasing (*"responsible for maintaining servers"*) with authoritative action verbs (*"Engineered and maintained high-availability Linux server infrastructure"*).
  - Highlights quantifiable metrics and business impact where already present in the source text.
  - Fixes punctuation, capitalizations, tense consistency, and structural bloat.
  - Strictly preserves original technology stacks, employers, and dates.

### Mode 2: Targeted JD Alignment (Recruiter & ATS Optimization)
- **Goal**: Align the resume's terminology, keyword density, and bullet points directly with the target job posting.
- **When Used**: Selected when the user pastes a target job description in Step 3.
- **Transformation Rules**:
  - Ingests extracted JD competencies (required skills, preferred qualifications, core responsibilities, ATS keywords).
  - Performs **Adjacent Technical Bridging** to surface transferable experience.
  - Rearranges and emphasizes bullets that provide direct evidence for required job responsibilities.
  - Generates the full **Transparent Audit Trail** (`bulletDiffs`, `skillsRationale`, `jdEvidenceMap`, `scoreGapAnalysis`, `evidenceSafetyVerdict`).

---

## 2. Adjacent Technical Bridging Methodology

Recruiters and ATS scanners often filter out qualified candidates because their resumes use differing terminology for identical or adjacent competencies. LumaCV employs **Adjacent Technical Bridging** in Mode 2:

### Permitted Bridging Examples
| Candidate's Authentic Background | Job Posting Requirement | Permitted Bridging Transformation |
| :--- | :--- | :--- |
| Deployed Docker containers to AWS ECS | Kubernetes (K8s) | Highlight container lifecycle management and orchestration principles, noting familiarity with container control planes. |
| Built CI/CD pipelines in Jenkins | GitHub Actions / GitLab CI | Rephrase bullet to emphasize automated testing, continuous deployment pipelines, and artifact caching. |
| Designed RESTful APIs in Node.js | Microservices Architecture | Frame endpoints as modular microservices communicating over resilient HTTP/REST contracts with load balancing. |
| Optimized PostgreSQL queries | Database Scalability & Tuning | Emphasize indexing, query plan analysis, connection pooling, and latency reduction under high concurrent loads. |

### Anti-Fabrication Guardrails
Adjacent bridging **never** crosses into fraudulent claims. The model is bound by strict safety rules:
1. **Zero Employer Hallucination**: Never change company names or add past employers.
2. **Zero Degree or Credential Invention**: Never invent degrees, certifications, or educational institutions not present in the source text.
3. **Zero Date Alteration**: Employment dates, project durations, and graduation years remain 100% immutable.
4. **Zero Metric Fabrication**: Never invent arbitrary metrics (e.g. *"reduced latency by 47%"*) if no quantitative anchor exists in the original bullet. If a candidate says *"improved query speeds"*, the model improves the technical articulation (*"Optimized PostgreSQL queries via index restructuring to significantly reduce query execution time"*) without fabricating an exact percentage.

---

## 3. Prompt Architecture & Contracts

The tailoring pipeline prompts are structured in three strict tiers:

### Tier 1: System Persona & Constraints
Enforces the persona of an elite technical recruiter and typesetting editor:
- Must output valid JSON matching the exact TypeScript schema.
- Must reject markdown decorations in bullet strings.
- Must maintain a 1-to-1 mapping of experience IDs and bullet indices.

### Tier 2: Source Context Injection
```json
{
  "resumeData": { ... },
  "jobAnalysis": {
    "roleTitle": "Senior Backend Engineer",
    "requiredSkills": ["Go", "Kubernetes", "PostgreSQL"],
    "preferredSkills": ["Kafka", "Terraform"],
    "coreResponsibilities": ["Architect high-throughput services"],
    "atsKeywords": ["Go", "Kubernetes", "Microservices"]
  },
  "options": {
    "mode": "tailor",
    "strictFactuality": true
  }
}
```

### Tier 3: Chain-of-Verification Output Schema
The response format demands transparent audit metadata alongside the modified resume:

```typescript
interface TailorResponse {
  tailoredResume: ResumeData;
  auditTrail: {
    bulletDiffs: Array<{
      id: string;
      experienceId: string;
      bulletIndex: number;
      company: string;
      role: string;
      original: string;
      tailored: string;
      keywordsInjected: string[];
      accepted: boolean;
    }>;
    skillsRationale: Array<{
      skill: string;
      category: string;
      source: 'direct' | 'transferable' | 'inferred';
      rationale: string;
    }>;
    jdEvidenceMap: Array<{
      requirement: string;
      category: 'required' | 'preferred';
      evidenceBullets: string[];
      status: 'fully_met' | 'partially_met' | 'missing';
    }>;
    scoreGapAnalysis: {
      currentScore: number;
      maxPossibleScore: number;
      explanation: string;
      remainingGaps: Array<{
        requirement: string;
        category: 'required' | 'preferred';
        reason: string;
        scoreImpact: number;
        recommendation: string;
      }>;
    };
    evidenceSafetyVerdict: {
      passed: boolean;
      fabricationDetected: boolean;
      unsupportedClaims: string[];
      verificationNote: string;
    };
  };
}
```

---

## 4. Multi-Provider Fallback & Resilience

When calling LLM endpoints, LumaCV executes a resilient execution strategy:
1. **Client Key Priority**: If the user provides an API key via BYOK headers, LumaCV calls that provider directly.
2. **Platform Fallback**: If no user key is provided, the server attempts execution using the primary server key (`GEMINI_API_KEY`), falling back to secondary keys if configured.
3. **JSON Repair & Validation**: Model outputs are piped through `jsonrepair` before Zod schema validation to heal occasional trailing commas, unescaped quotes, or truncated JSON structures.
4. **Deterministic Typst Generation**: Once validated, the JSON resume is translated into Typst markup via `lib/typst-generator.ts` and compiled to vector PDF in under 50ms.
