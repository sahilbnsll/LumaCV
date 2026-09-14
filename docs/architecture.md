# LumaCV System Architecture

This document details the engineering design, subsystem interactions, security posture, and data flows of LumaCV.

---

## 1. High-Level Architecture Overview

LumaCV is built as a high-throughput, deterministic resume engineering studio centered around six foundational architectural pillars:

1. **Client-Side Extraction**: Zero-upload PDF parsing running directly in the browser via `pdfjs-dist`, eliminating server-side file retention risks and heavy OCR dependencies.
2. **Dual-Mode AI Engine**: Multi-provider BYOK architecture supporting both standalone resume optimization (Mode 1) and targeted, adjacent-technology job description tailoring (Mode 2).
3. **Radical Explainability & Auditability**: Decomposed, modular audit UI (`components/builder/`) showing before $\rightarrow$ after diffs for every altered bullet, skill provenance tracking (`direct`, `transferable`, `inferred`), line-by-line JD evidence mapping, and score gap analysis.
4. **Normalized Dynamic ATS Scoring**: Edge-rendered deterministic scoring engine evaluating hard skills, responsibility alignment, keyword density, and formatting compliance without penalizing missing optional criteria.
5. **Native Typst Typesetting**: 100% native vector document generation using the compiled Typst CLI (typesetting itself completes in 20-45ms; end-to-end request latency is a few hundred ms, dominated by spawning the compiler process, not typesetting), replacing fragile HTML-to-PDF canvas rasterizers and heavyweight LaTeX toolchains.
6. **Hardened Production Security**: Strict Content Security Policy (CSP), anti-clickjacking frame restrictions, sanitized input validation via Zod, ephemeral client-held API keys, and verified transactional email delivery via Resend.

---

## 2. End-to-End Data Flow

```
[User's PDF Resume]
        │
        ▼ (Client-side pdfjs-dist)
[Raw Text + Extracted Link Annotations]
        │
        ▼ POST /api/v1/resume/parse
[LLM Parser (Gemini 2.5 Flash / Groq / Claude)]
        │
        ▼ (jsonrepair + normalizeResumeFromLLM)
[Structured ResumeData (JSON)]
        │
        ▼ (Zustand Store -> Step 2 Form)
[User Verification & Edits]
        │
        ▼ (Mode Selection: Mode 1 Optimize OR Mode 2 Tailor)
        ├─────────────────────────────────────────────┐
        │ Mode 1: Optimize                            │ Mode 2: Tailor to JD
        ▼                                             ▼
[POST /api/v1/resume/tailor (mode: optimize)]       [POST /api/v1/resume/analyze-jd]
        │                                             │ (Unified lib/jd-analysis.ts)
        │                                             ▼
        │                                   [POST /api/v1/resume/tailor (mode: tailor)]
        │                                             │
        └──────────────────────┬──────────────────────┘
                               ▼
     [Tailored ResumeData + Transparent Audit Trail]
        │
        ├──► [Step 4 Modular Review Studio]
        │     ├── ScoreGapAnalysis (`components/builder/score-gap-analysis.tsx`)
        │     ├── SkillsRationaleList (`components/builder/skills-rationale-list.tsx`)
        │     ├── JdEvidenceMap (`components/builder/jd-evidence-map.tsx`)
        │     └── BulletDiffViewer (`components/builder/bullet-diff-viewer.tsx`)
        │
        ▼ POST /api/v1/resume/compile
[Typst Native Engine (bin/typst)]
        │
        ▼ (20-45ms typeset, a few hundred ms end-to-end)
[High-Resolution Vector PDF Preview & Download]
```

---

## 3. Core Subsystems

### 3.1 Client-Side Document Text Extraction (`lib/document-parser.ts`, `lib/pdf-parser.ts`)
- Executes entirely on the client within the browser context (`typeof window !== 'undefined'`).
- PDF: loads `pdfjs-dist/build/pdf.min.mjs` (pdfjs-dist v6, ESM build) alongside the same-origin web worker `/pdf.worker.min.mjs`. Traverses document page streams to extract text tokens with preserved line-break spacing, and scans page annotation tables for embedded hyperlinks (GitHub, LinkedIn, portfolio) to attach to candidate contact data.
- DOCX: `mammoth` extracts raw text client-side.
- `.txt`/`.md`: read directly via the File API.

### 3.2 AI Client & BYOK Pipeline (`lib/llm-client.ts`)
Every AI call in the app goes through `generateStream()`, which fails over
across whichever of the following are configured, in this order, user BYOK
keys first (if supplied via request headers), then system keys:

| Provider | Models (heavy tasks) | Notes |
| :--- | :--- | :--- |
| **Google Gemini** | `gemini-2.5-flash`, `gemini-flash-latest` | Tried first; native JSON-friendly output |
| **Groq Cloud** | `groq/compound-mini`, `groq/compound`, `qwen/qwen3.8-27b`, `qwen/qwen3.6-27b`, `openai/gpt-oss-120b`, `openai/gpt-oss-20b` | OpenAI-compatible endpoint, called via `.chat()` (not the default Responses API) |
| **Mistral AI** | `codestral-latest`, `ministral-14b-latest`, `open-mistral-nemo` | OpenAI-compatible endpoint |
| **OpenRouter** | `nvidia/nemotron-3-super-120b-a12b:free`, `nvidia/nemotron-3.5-lightning:free`, `poolside/laguna-s-2.1:free` | Free-tier models, OpenAI-compatible endpoint |
| **OpenAI** (BYOK or `OPENAI_API_KEY`) | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo` | |
| **GitHub Models** | `gpt-4o-mini`, `Meta-Llama-3.1-8B-Instruct` | Free with a GitHub PAT, OpenAI-compatible endpoint |
| **Anthropic Claude** (BYOK only) | `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022` | |

By default there is no cap on how many models/providers are tried (`maxAttempts`
defaults to `Infinity`), on a genuine failure it fails over through everything
configured rather than giving up early, since resilience is the whole reason to
configure several providers. The SDK's own built-in per-call retry is disabled
(`maxRetries: 0`) so a rate-limited or quota-exhausted model fails over
immediately instead of burning tens of seconds retrying itself. Callers can
also pass a `validate(fullText)` predicate so a model whose output is
syntactically fine but substantively empty/wrong is treated as a failure too,
not accepted as a success.

**Security & Privacy**:
- BYOK keys supplied in request headers (`x-gemini-api-key`, etc.) exist ephemerally in memory only for the duration of the HTTP lifecycle. They are never written to disk, databases, or application log files.

### 3.3 Job Description Analysis (`lib/jd-analysis.ts`)
- Ingests raw job posting text and extracts required/preferred skills, core responsibilities, industry buzzwords, and seniority level as structured JSON.
- Used standalone by `POST /api/v1/resume/analyze-jd` (the ATS Checker), and inlined into the same completion as `POST /api/v1/resume/tailor` when the caller sends raw `jd` text instead of pre-extracted keywords, so Step 3 tailoring needs only one AI call total, not a separate analyze-then-tailor round trip.

### 3.4 Modular Review Architecture (`components/builder/`)
To ensure optimal frontend performance, eliminate re-render bottlenecks, and maintain code readability, the Step 4 preview interface is decomposed into isolated subcomponents:
- [`score-gap-analysis.tsx`](../components/builder/score-gap-analysis.tsx): Renders ATS score diagnostics, point deductions per missing requirement, and actionable recommendations.
- [`skills-rationale-list.tsx`](../components/builder/skills-rationale-list.tsx): Visualizes surfaced competencies with classification tags (`direct`, `transferable`, `inferred`) and technical rationale.
- [`jd-evidence-map.tsx`](../components/builder/jd-evidence-map.tsx): Line-by-line verification displaying how target job requirements are substantiated by resume bullet points.
- [`bullet-diff-viewer.tsx`](../components/builder/bullet-diff-viewer.tsx): Side-by-side before/after comparison cards for every modified bullet point with individual accept/restore controls.

### 3.5 Typst Typesetting Engine (`lib/typst-generator.ts` & `typst/`)
LumaCV uses **Typst**, a fast, memory-safe typesetting system written in Rust:
- **Fast Compilation**: Typst itself typesets complex, multi-page resumes in 20-45ms; total request latency (a few hundred ms) is dominated by spawning the compiler process, not the typesetting step.
- **52 Templates**: defined in `TemplateTypeSchema` (`lib/resume-schema.ts`), grouped into families (ATS-Optimized, Modern & Tech, Executive & Advisory, Editorial & Creative, Modern Technical & Minimalist, Academic & Research), plus 4 legacy aliases (`ats`, `minimal`, `creative`, `tech`) kept for backward compatibility that resolve to real templates rather than adding new designs.
- **Deterministic ATS Formatting**: Generates 100% vector text without font rasterization or embedded image artifacts, ensuring perfect optical character and text extraction for ATS parsers.

### 3.6 Transactional Feedback Service (`lib/email-service.ts`)
- Integrates directly with Resend for transactional user feedback and bug reporting.
- Utilizes the verified custom sending domain `sahilbansal.net` (`LumaCV <connect@sahilbansal.net>`).
- Features graceful fallbacks: if `RESEND_API_KEY` is not configured, submissions are logged locally without failing the user request.

### 3.7 Production Security & Hardening (`next.config.mjs`)
LumaCV enforces modern defense-in-depth HTTP security headers:
- `X-Frame-Options: DENY`: Blocks clickjacking and iframe embedding attacks.
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing exploits.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts referrer leaking across origins.
- `Permissions-Policy`: Restricts camera, microphone, and geolocation access.
- `outputFileTracingIncludes`: Guarantees native `bin/typst` binaries and `typst/` templates are bundled into Vercel and Docker production deployments.

---

## 4. API Endpoints Reference Summary

| Method | Endpoint | Runtime | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/resume/parse` | Node | Parses raw PDF/DOCX-extracted text into structured `ResumeData` (guest-allowed, identity-scoped rate limit) |
| `POST` | `/api/v1/resume/analyze-jd` | Node | JD analysis, extracts required/preferred skills, responsibilities, buzzwords |
| `POST` | `/api/v1/resume/tailor` | Node | Dual-mode bullet tailoring & transparent audit trail generator (auth required) |
| `POST` | `/api/v1/resume/compile` | Node | Compiles `ResumeData` or raw Typst into a PDF binary (demo resume bypasses auth; everything else requires it) |
| `POST` | `/api/v1/resume/export-typ` | Node | Exports the compiled resume as raw Typst source (auth required) |
| `POST` | `/api/v1/resume/score` | Edge | Deterministic 4-pillar normalized ATS scoring engine (public, no signup required) |
| `GET/POST` | `/api/v1/resumes` | Node | List/save the signed-in user's saved resumes (Supabase-backed) |
| `GET/PATCH/DELETE` | `/api/v1/resumes/[id]` | Node | Read, update, or delete a single owned resume |
| `GET/POST` | `/api/v1/applications` | Node | List/save job application tracker entries (auth required) |
| `PATCH/DELETE` | `/api/v1/applications/[id]` | Node | Update or delete a single owned application |
| `POST` | `/api/v1/applications/import-ai-map` | Node | AI-assisted spreadsheet column mapping for bulk application import (falls back to heuristic matching) |
| `POST` | `/api/v1/auth/resolve-username` | Node | Resolves a username to its account email for username-based sign-in (rate-limited) |
| `POST` | `/api/v1/feedback` | Node | User bug reports & feedback dispatched via Resend (IP rate-limited) |
| `GET` | `/api/v1/stats` | Edge | Aggregated, public compilation metrics and engine health |
| `POST` | `/api/v1/internal/infra-check` | Node | Internal Supabase Storage connectivity probe, gated behind a shared-secret header (`COMPILE_WORKER_SECRET`), not for client use |
