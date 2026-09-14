# LumaCV API Reference (v1)

This document provides complete technical specifications for LumaCV's v1 REST API endpoints.

All API routes are served under `/api/v1/`.

---

## 1. Resume Compilation

### `POST /api/v1/resume/compile`
Compiles structured JSON resume data or raw Typst source markup into a native vector PDF using the local Typst compiler.

- **Runtime**: Node.js Serverless Function
- **Rate Limit**: 90 requests / minute (in-memory, per instance, see [`lib/rate-limit.ts`](../lib/rate-limit.ts))
- **Max Payload Size**: 2 MB
- **Timeout**: 15 seconds per Typst process (60s route-level max)

#### Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes | Request payload type |

#### Request Body
```json
{
  "resumeData": {
    "personalInfo": {
      "name": "Jane Doe",
      "title": "Senior Distributed Systems Engineer",
      "email": "jane@example.com",
      "phone": "+1 (555) 019-2834",
      "location": "San Francisco, CA",
      "linkedin": "linkedin.com/in/janedoe",
      "github": "github.com/janedoe",
      "portfolio": "janedoe.dev"
    },
    "summary": "Distributed systems engineer with 7+ years building high-throughput microservices...",
    "experience": [],
    "education": [],
    "skills": [],
    "projects": []
  },
  "template": "modern",
  "theme": "cobalt",
  "typstCode": "..." // Optional: raw Typst markup override, skips resumeData->Typst generation
}
```

#### Supported Templates (`template`)
52 templates across Classic/ATS-Optimized, Modern & Tech, and Executive &
Advisory families, the authoritative list is `TemplateTypeSchema` in
[`lib/resume-schema.ts`](../lib/resume-schema.ts) (e.g. `modern`, `classic`,
`engineering`, `compact`, `two_column`, `ats_safe`, `terminal`, `executive`, `mono`, ...).

#### Supported Themes (`theme`)
`none` | `navy` | `cobalt` | `emerald` | `burgundy` | `teal` | `slate` | `black`

#### Response
- **Status**: `200 OK`
- **Content-Type**: `application/pdf`
- **Body**: Binary vector PDF stream.

---

## 2. Resume Parsing

### `POST /api/v1/resume/parse`
Parses raw resume text, extracted client-side via `lib/document-parser.ts`
(PDF via `pdfjs-dist`, DOCX via `mammoth`, or plain text/markdown read
directly), into normalized, typed `ResumeData`.

- **Runtime**: Edge / Node.js
- **Rate Limit**: 10 requests / minute
- **Max Payload Size**: 2 MB
- **Timeout**: 60 seconds

#### Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes | Request payload type |
| `x-gemini-api-key` | `string` | Optional | User's BYOK Gemini API key |
| `x-openai-api-key` | `string` | Optional | User's BYOK OpenAI API key |
| `x-anthropic-api-key`| `string` | Optional | User's BYOK Claude API key |
| `x-groq-api-key` | `string` | Optional | User's BYOK Groq API key |

#### Request Body
```json
{
  "extractedText": "Extracted text content from the resume file..."
}
```

#### Response
Returns the `ResumeData` object directly (not wrapped), `personalInfo` (flat
`name`/`title`/`tagline`/`location`/`phone`/`email`/`linkedin`/`github`/`portfolio`),
`summary`, `experience`, `education`, `skills`, `projects`, plus optional
sections (`certifications`, `achievements`, `internships`, etc.).

If the model's output doesn't contain a real name, contact info, or any
experience/education/skills entries, e.g. a scanned/image PDF with no
extractable text, or every configured provider returning unusable output,
this returns `422` with `{ "error": "Could not read this resume", "details": "..." }`
instead of silently handing back a blank resume as a fake success.
```

---

## 3. Job Description Analysis

### `POST /api/v1/resume/analyze-jd`
Extracts required/preferred skills, core responsibilities, industry buzzwords,
and seniority level from a job posting, via `lib/jd-analysis.ts`. Used
standalone by the ATS Checker; the Step 3 tailoring pipeline instead extracts
this in the same completion as `/resume/tailor` (see below) to avoid a second
AI call. (A duplicate `/api/v1/jd/analyze` route existed with zero callers,
removed.)

- **Rate Limit**: 20 requests / minute
- **Timeout**: 45 seconds

#### Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes | Request payload type |
| BYOK API Key | `string` | Optional | Optional BYOK inference key |

#### Request Body
```json
{
  "jd": "We are seeking a Senior Backend Engineer proficient in Go, Kubernetes, and PostgreSQL to lead platform infrastructure..."
}
```

#### Response
```json
{
  "required_skills": ["Go", "Kubernetes", "PostgreSQL"],
  "preferred_skills": ["eBPF", "Kafka", "Terraform"],
  "responsibilities": ["Design high-throughput microservices in Go", "Manage multi-cluster Kubernetes deployments"],
  "buzzwords": ["Microservices", "Distributed Systems"],
  "seniority_level": "senior"
}
```

---

## 4. Anti-Hallucination Bullet Tailoring & Optimization

### `POST /api/v1/resume/tailor`
Tailors experience bullets, projects, and summaries to match job descriptions (Mode 2) or polishes language and metrics without a JD (Mode 1). Strictly preserves factual history with zero fabrication of employers, dates, or titles.

- **Rate Limit**: 10 requests / minute
- **Timeout**: 60 seconds

#### Request Body
```json
{
  "resumeData": { "...": "full ResumeData object" },
  "jdKeywords": { "...": "AnalyzeJDResponse, optional, pre-extracted via /resume/analyze-jd" },
  "jd": "raw job description text, optional, alternative to jdKeywords; the model extracts structured keywords itself in this same completion instead of requiring a separate call",
  "tailorMode": "tailor" | "optimize",
  "template": "modern",
  "theme": "none"
}
```
`tailorMode: "optimize"` is 100% fact-preserving polish with no JD; `"tailor"`
is aggressive JD alignment ("bend the wording, not the facts"). Pass either
`jdKeywords` (already extracted) or raw `jd` text (extracted server-side),
never both is required.

#### Response Body
See [`docs/ai-pipeline.md`](./ai-pipeline.md#3-prompt-architecture--contracts)
for the full, current `TailorResponse` shape (`tailoredResume`, `typstCode`,
`confidenceScore`, `atsAlignmentSummary`, `factCheckReport`, `auditTrail` with
`bulletChanges`/`jdAlignmentMap`/`safetyIndicator`), kept in one place to
avoid this reference drifting out of sync with the schema again.

---

## 5. Deterministic ATS Scoring

### `POST /api/v1/resume/score`
Calculates a deterministic ATS score across four weighted pillars (`required_skills` 40%, `responsibilities` 25%, `preferred_skills` 20%, `buzzwords` 15%), see [`docs/ats-scoring.md`](./ats-scoring.md) for the full formula.

- **Runtime**: Edge Runtime (Sub-50ms)
- **Rate Limit**: 60 requests / minute

Purely deterministic string/keyword matching against `jdKeywords`, no AI call,
which is why this can run on the Edge runtime in well under 50ms and why it's
called twice per Step 3 tailoring run (baseline + tailored) at effectively no
cost.

#### Request Body
```json
{
  "resumeData": { "...": "optional, either this or resumeText" },
  "resumeText": "plain-text resume, optional, either this or resumeData",
  "jdKeywords": { "required_skills": [], "preferred_skills": [], "responsibilities": [], "buzzwords": [] }
}
```

#### Response Body
```json
{
  "score": 0.87,
  "isCalculated": true,
  "breakdown": {
    "required_skills": { "matched": ["Go", "Kubernetes"], "missing": ["Kafka"], "ratio": 0.8, "weightPercent": 40, "weightedContribution": 0.32 },
    "preferred_skills": { "matched": [], "missing": ["Terraform"], "ratio": 0, "weightPercent": 20, "weightedContribution": 0 },
    "responsibilities": { "matched": ["..."], "missing": [], "ratio": 1, "weightPercent": 25, "weightedContribution": 0.25 },
    "buzzwords": { "matched": ["CI/CD"], "missing": [], "ratio": 1, "weightPercent": 15, "weightedContribution": 0.15 }
  }
}
```
`isCalculated: false` (with `score: 0`) means no JD keywords were provided at
all, the UI shows an explicit "no target job description" state rather than
a fabricated 0% or 100% score. Weights are renormalized across only the
categories that actually have keywords, so an empty `preferred_skills` array
never silently caps the achievable score.

---

## 6. User Feedback Service

### `POST /api/v1/feedback`
Submits user bug reports, feature suggestions, or general feedback. Best-effort
writes to a Supabase `feedback` table (if configured) and a local JSON file
(dev only, silently skipped on read-only serverless filesystems), then
dispatches a transactional email via Resend to the project owner. No
authentication required (anyone can submit), but IP-rate-limited via the same
limiter as the AI routes, since every submission triggers a real email.

#### Request Body
```json
{
  "name": "Optional display name",
  "email": "user@example.com",
  "company": "Optional",
  "rating": 5,
  "type": "issue" | "feature" | "general",
  "message": "Required, the only mandatory field",
  "page": "/builder"
}
```

#### Response
```json
{
  "success": true,
  "delivered": true,
  "message": "Thank you! Your feedback has been received."
}
```

---

## 7. Platform Diagnostics & Health

### `GET /api/v1/stats`
Returns privacy-safe aggregated platform counters shown on the homepage (user
count, resumes compiled, bullets tailored). Reads Redis first (if configured),
falls back to Supabase `platform_stats`/`user_resumes`, then a local JSON file,
taking the max across all three so a metric never regresses if one source
lags. Explicitly `no-store` (not cached), no auth required.

#### Response
```json
{
  "usersCount": 1240,
  "resumesCompiled": 18450,
  "bulletsTailored": 9310,
  "activeTemplates": 52,
  "factCheckAccuracy": 100
}
```

---

## 8. Saved Resumes

All routes below require an authenticated session (`requireUser()`), backed by
the Supabase `user_resumes` table, RLS-scoped to `auth.uid()`.

### `GET /api/v1/resumes`
Lists the signed-in user's saved resumes, newest-updated first.

### `POST /api/v1/resumes`
Creates or updates (upsert) a saved resume.

#### Request Body
```json
{
  "id": "optional, omit to create a new resume, include an owned id to update it",
  "title": "Untitled Resume",
  "templateId": "modern",
  "resumeData": { "...": "full ResumeData object, required" },
  "typstCode": "optional, the last compiled Typst source",
  "atsScore": 0.87,
  "targetJobTitle": "optional",
  "targetJobCompany": "optional"
}
```
If `id` is supplied and belongs to a different user, this returns `404` rather
than silently overwriting another account's resume.

### `GET /api/v1/resumes/[id]`
Fetches a single resume, scoped to the caller's own `user_id`.

### `PATCH /api/v1/resumes/[id]`
Partially updates a single owned resume (only supplied fields change).

### `DELETE /api/v1/resumes/[id]`
Deletes a single owned resume.

---

## 9. Job Application Tracker

All routes below require an authenticated session, backed by the Supabase
`user_applications` table.

### `GET /api/v1/applications`
Lists the signed-in user's tracked applications, newest-updated first.

### `POST /api/v1/applications`
Creates or updates (upsert) a tracked application.

#### Request Body
```json
{
  "id": "optional, omit to create, include an owned id to update",
  "company": "Required",
  "position": "Required",
  "location": "",
  "remoteType": "unspecified",
  "status": "applied",
  "appliedDate": "ISO date, defaults to now",
  "deadline": "ISO date, optional",
  "salary": "",
  "url": "",
  "jobDescription": "",
  "notes": "",
  "contacts": [],
  "resumeId": "optional, links to a saved resume",
  "tags": []
}
```
`company` and `position` are the only required fields. As with `/resumes`, an
`id` belonging to a different user returns `404` instead of overwriting it.

### `PATCH /api/v1/applications/[id]`
Partially updates a single owned application (only supplied fields change).

### `DELETE /api/v1/applications/[id]`
Deletes a single owned application.

### `POST /api/v1/applications/import-ai-map`
Given spreadsheet column headers and a few sample rows (from a bulk CSV/XLSX
import), maps them to the tracker's standard fields. Tries deterministic
alias matching first (`lib/application-import-parser.ts`); only calls the AI
model when the heuristic can't confidently resolve `company` and `position`.

- **Rate Limit**: same per-IP limiter as the other AI routes, skipped when the caller supplies a BYOK key.
- **Timeout**: 45 seconds

#### Request Body
```json
{
  "headers": ["Company Name", "Role", "Stage", "Applied On"],
  "sampleRows": [["Acme Corp", "Backend Engineer", "Interview", "2026-01-15"]]
}
```

#### Response
```json
{ "mapping": { "company": "Company Name", "position": "Role", "status": "Stage", "appliedDate": "Applied On" }, "source": "ai" }
```
`source` is `"heuristic"` when the AI call was skipped or failed and the app
fell back to alias matching.

---

## 10. Username Sign-In Resolution

### `POST /api/v1/auth/resolve-username`
Resolves a chosen username to its account email so the client can sign in via
Supabase's normal email/password auth (Supabase auth is email-based; LumaCV
layers optional usernames on top via the `profiles` table). Public, but
IP-rate-limited since it returns a real account email for a valid username.

#### Request Body
```json
{ "username": "sahilbansal" }
```

#### Response
`200 { "email": "..." }` on a match, `404 { "error": "No account found for that username." }`
otherwise (never distinguishes "wrong username" from "no account" beyond that).

---

## 11. Typst Source Export

### `POST /api/v1/resume/export-typ`
Returns the raw, human-readable Typst source (`.typ`) for a resume, for users
who want to compile it themselves with the Typst CLI. Requires authentication.

#### Response
- **Content-Type**: `text/plain`
- **Content-Disposition**: `attachment; filename="<sanitized-name>.typ"`

---

## 12. Internal Infrastructure Check

### `POST /api/v1/internal/infra-check`
A Supabase Storage connectivity probe used by internal tooling, not the
client app. Gated behind a shared-secret `x-worker-secret` header checked
against `COMPILE_WORKER_SECRET`; fails closed (`401`) if that env var is
unset. Not part of the public API surface.
