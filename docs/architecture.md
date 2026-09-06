# LumaCV System Architecture

This document details the engineering design, subsystem interactions, security posture, and data flows of LumaCV.

---

## 1. High-Level Architecture Overview

LumaCV is built as a high-throughput, deterministic resume engineering studio centered around six foundational architectural pillars:

1. **Client-Side Extraction**: Zero-upload PDF parsing running directly in the browser via `pdfjs-dist`, eliminating server-side file retention risks and heavy OCR dependencies.
2. **Dual-Mode AI Engine**: Multi-provider BYOK architecture supporting both standalone resume optimization (Mode 1) and targeted, adjacent-technology job description tailoring (Mode 2).
3. **Radical Explainability & Auditability**: Decomposed, modular audit UI (`components/builder/`) showing before $\rightarrow$ after diffs for every altered bullet, skill provenance tracking (`direct`, `transferable`, `inferred`), line-by-line JD evidence mapping, and score gap analysis.
4. **Normalized Dynamic ATS Scoring**: Edge-rendered deterministic scoring engine evaluating hard skills, responsibility alignment, keyword density, and formatting compliance without penalizing missing optional criteria.
5. **Native Typst Typesetting**: 100% native vector document generation using the compiled Typst CLI (< 50ms compilation time), replacing fragile HTML-to-PDF canvas rasterizers and heavyweight LaTeX toolchains.
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
        ▼ (< 50ms)
[High-Resolution Vector PDF Preview & Download]
```

---

## 3. Core Subsystems

### 3.1 Client-Side PDF Text Extraction (`lib/pdf-parser.ts`)
- Executes entirely on the client within the browser context (`typeof window !== 'undefined'`).
- Loads `pdfjs-dist/build/pdf.min.js` alongside the same-origin web worker `/pdf.worker.min.js`.
- Traverses document page streams to extract text tokens with preserved line-break spacing.
- Scans page annotation tables for embedded hyperlinks (e.g. GitHub, LinkedIn, personal portfolios) and attaches them to candidate contact data.

### 3.2 AI Client & BYOK Pipeline (`lib/llm-client.ts`)
The AI engine implements multi-provider failover with support for user-supplied API keys:

| Provider | Supported Models | Primary Strength |
| :--- | :--- | :--- |
| **Google Gemini** | `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite` | Sub-400ms latency, native JSON schema mode |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `o3-mini` | Benchmark schema compliance & reasoning |
| **Anthropic Claude** | `claude-3-5-sonnet`, `claude-3-5-haiku` | Nuanced editorial vocabulary for executive roles |
| **Groq Cloud** | `qwen/qwen-2.5-32b`, `llama-3.3-70b` | Maximum token generation throughput |

**Security & Privacy**:
- BYOK keys supplied in request headers (`x-gemini-api-key`, etc.) exist ephemerally in memory only for the duration of the HTTP lifecycle. They are never written to disk, databases, or application log files.
- The prompt caching layer (`lib/prompt-cache.ts`) deduplicates identical extraction and tailoring requests, minimizing model latency.

### 3.3 Unified JD Analysis Service (`lib/jd-analysis.ts`)
- Replaces legacy redundant parsing logic across `/api/v1/jd/analyze` and `/api/v1/resume/analyze-jd`.
- Ingests raw job posting text and executes structured extraction with fallback parsing:
  - Role title, company, and seniority level classification.
  - Hard required competencies vs. preferred/bonus qualifications.
  - Core responsibility statements and high-value ATS keyword lists.
- Serves both API routes transparently, guaranteeing schema consistency.

### 3.4 Modular Review Architecture (`components/builder/`)
To ensure optimal frontend performance, eliminate re-render bottlenecks, and maintain code readability, the Step 4 preview interface is decomposed into isolated subcomponents:
- [`score-gap-analysis.tsx`](../components/builder/score-gap-analysis.tsx): Renders ATS score diagnostics, point deductions per missing requirement, and actionable recommendations.
- [`skills-rationale-list.tsx`](../components/builder/skills-rationale-list.tsx): Visualizes surfaced competencies with classification tags (`direct`, `transferable`, `inferred`) and technical rationale.
- [`jd-evidence-map.tsx`](../components/builder/jd-evidence-map.tsx): Line-by-line verification displaying how target job requirements are substantiated by resume bullet points.
- [`bullet-diff-viewer.tsx`](../components/builder/bullet-diff-viewer.tsx): Side-by-side before/after comparison cards for every modified bullet point with individual accept/restore controls.

### 3.5 Typst Typesetting Engine (`lib/typst-generator.ts` & `typst/`)
LumaCV uses **Typst**, a fast, memory-safe typesetting system written in Rust:
- **Sub-50ms Compilation**: Compiles complex, multi-page resumes in 20–45ms.
- **48 Curated Layout Combinations**: 6 base archetypes (`modern`, `classic`, `engineering`, `compact`, `two_column`, `ats_safe`) mapped across 8 color themes (`none`, `navy`, `cobalt`, `emerald`, `burgundy`, `teal`, `slate`, `black`).
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
| `POST` | `/api/v1/resume/parse` | Node/Edge | Parses raw PDF text into structured `ResumeData` |
| `POST` | `/api/v1/resume/analyze-jd` | Node/Edge | Primary JD analysis endpoint delegating to `lib/jd-analysis.ts` |
| `POST` | `/api/v1/jd/analyze` | Node/Edge | Backward-compatible JD analysis endpoint |
| `POST` | `/api/v1/resume/tailor` | Node/Edge | Dual-mode bullet tailoring & transparent audit trail generator |
| `POST` | `/api/v1/resume/compile` | Node | Compiles `ResumeData` or raw Typst into PDF binary (< 50ms) |
| `POST` | `/api/v1/resume/score` | Edge | Deterministic 4-pillar normalized ATS scoring engine |
| `POST` | `/api/v1/feedback` | Node/Edge | User bug reports & feedback dispatched via Resend |
| `GET` | `/api/v1/stats` | Edge | Aggregated compilation metrics and engine health |
