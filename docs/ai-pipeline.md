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

All prompts live under `lib/prompts/*.ts`, this is the single source of truth (an
earlier `prompts/*.txt` + `lib/prompt-cache.ts` filesystem-loaded variant was
removed: it silently diverged from the `.ts` builders and was never reliably
bundled into serverless deploys, so two different prompt qualities could be
running in dev vs. production without anyone noticing). Each builder composes
shared directive blocks so tone, safety rules, and output-schema conventions
stay identical across parse/analyze/tailor:

- `truthfulness-rules.ts`, zero-hallucination guarantees (never invent employers, dates, metrics, credentials).
- `ats-rules.ts`, keyword integration, action-verb formula, structured-impact bullet format.
- `section-rules.ts`, `scoring-rules.ts`, `quality-self-check.ts`, section-specific rewrite rules, the scoring rubric shown to the model, and a final self-check checklist appended before the model returns output.
- `parse-prompt.ts`, `jd-analyze-prompt.ts`, `tailor-prompt.ts`, the three entry-point builders, each ending with an explicit example JSON schema (field names and shape) rather than only prose, this measurably improves how reliably models return well-formed, complete JSON instead of truncated or malformed structures.

### Actual Tailor Response Shape
The tailor endpoint (`app/api/v1/resume/tailor/route.ts`) returns:

```typescript
interface TailorResponse {
  tailoredResume: ResumeData;
  typstCode: string;
  confidenceScore: number; // 0–1
  jdKeywords?: AnalyzeJDResponse; // present only when the caller sent raw `jd`
                                  // text instead of pre-extracted keywords,
                                  // this same completion also does the JD
                                  // extraction, so Step 3 needs only one AI call
  atsAlignmentSummary: {
    overallScore: number; // 0–99, no artificial floor
    matchedRequirements: string[];
    partiallyMatchedRequirements: string[];
    unsupportedRequirements: string[];
    incorporatedKeywords: string[];
  };
  factCheckReport: {
    passed: boolean;
    issuesCount: number;
    preservedMetricsCount: number;
    verifiedEmployersCount: number;
  };
  auditTrail: {
    mode: 'optimize' | 'tailor';
    sectionsModified: string[];
    skillsAdded: Array<{ skill: string; category: string; source: string; reason: string }>;
    bulletChanges: Array<{ role: string; company: string; original: string; tailored: string; changeType: string; reason: string; evidenceSafety: string }>;
    jdAlignmentMap: Array<{ requirement: string; category: string; status: 'matched' | 'partially_matched' | 'missing'; resumeEvidence: string }>;
    safetyIndicator: { claimsSupported: boolean; unsupportedClaimsBlocked: number; verifiedEmployersPreserved: boolean; verifiedDatesPreserved: boolean };
  };
}
```

`lib/fact-validator.ts`'s `validateAndCleanTailoredResume` runs against every
tailor response server-side before it's returned, populating `factCheckReport`
and stripping any claim it can't verify against the source resume.

---

## 4. Multi-Provider Fallback & Resilience

`lib/llm-client.ts`'s `generateStream()` is the single entry point every AI
call goes through (`/parse`, `/analyze-jd` via `lib/jd-analysis.ts`, `/tailor`,
and the applications column-mapper). Execution order:

1. **BYOK first**: if the caller supplied their own key(s) via headers, those providers are tried first, in the order Gemini → OpenAI → Anthropic → Groq (whichever the user configured).
2. **System fallback chain**: Gemini → Groq → Mistral → OpenRouter → OpenAI → GitHub Models, whichever of these have a server-side API key configured in the environment. Groq, Mistral, OpenRouter, and GitHub Models are all OpenAI-compatible endpoints called via `createOpenAI({ baseURL, apiKey }).chat(modelId)`, the `.chat()` call is required; calling the provider object directly routes through OpenAI's newer Responses API, which none of these four support.
3. **No artificial attempt cap**: by default every model of every configured provider is tried on failure (`maxAttempts` defaults to `Infinity`), that's the entire point of configuring several providers. The AI SDK's own built-in per-call retry is disabled (`maxRetries: 0`) so a rate-limited/quota-exhausted model fails over to the next one immediately instead of burning 30–90s retrying the same dead model with exponential backoff.
4. **Content-quality gate, not just error gate**: callers may pass a `validate(fullText)` predicate; a model that streams back syntactically valid but substantively empty/wrong JSON (e.g. a weak fallback model returning `{}` under load) is treated as a failure and the loop advances to the next model, rather than being accepted as a "success". `/parse` and `/tailor` both use this to guarantee the response actually contains real resume content before it's returned.
5. **JSON Repair & Validation**: model output is piped through `jsonrepair` before further parsing/Zod validation, to heal trailing commas, unescaped quotes, or minor truncation.
6. **Deterministic Typst Generation**: once validated, the JSON resume is translated into Typst markup via `lib/typst-generator.ts` and compiled to vector PDF in under 50ms.

Each API route caps `maxTokens` at a level that fits every configured model's
real limits (6000 for tailor's combined resume+JD+ATS-summary payload, 8000 for
parse) rather than shrinking it to fit the smallest model, a model whose
context window or per-minute token budget can't serve the request (e.g. Groq's
`allam-2-7b`, hard-capped at 4096 output tokens) is simply excluded from that
task's model pool instead of degrading everyone else's budget.
