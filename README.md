# LumaCV

Open-source resume engineering platform built on Typst, Next.js 14, and transparent, privacy-first AI tailoring.

[Quickstart](#quickstart) · [Features](#features) · [Tailoring Modes](#tailoring-modes) · [Audit Trail](#audit-trail) · [Architecture](#architecture) · [Templates](#templates) · [BYOK & Privacy](#byok-and-privacy) · [Docs](docs/architecture.md) · [License](LICENSE)

---

## Overview

LumaCV is an open-source, deterministic resume creation and optimization platform for engineers, researchers, and technical leaders. It replaces HTML-to-PDF canvas wrappers and LaTeX toolchains with the Typst typesetting engine (under 50ms native compilation).

The AI pipeline operates in two modes — general resume optimization and job-description-targeted alignment — and is transparent by design: every change comes with a diff, a rationale, and a competency gap analysis, not a black-box rewrite.

---

## Features

- **Sub-50ms Typst compilation**: native vector typesetting with precise spacing and hierarchy.
- **Dual AI tailoring modes**: general optimization (Mode 1) and targeted JD alignment with adjacent-technology bridging (Mode 2) — see [Tailoring Modes](#tailoring-modes).
- **Transparent audit trail**: before/after bullet diffs, a skills rationale matrix, JD-to-resume evidence mapping, and score gap diagnostics — see [Audit Trail](#audit-trail).
- **Deterministic ATS scoring**: a normalized 4-pillar formula covering hard skills, responsibilities, keyword density, and formatting compliance.
- **52 Typst templates**: Classic/ATS-Optimized, Modern & Tech, and Executive & Advisory families — see [`lib/resume-schema.ts`](lib/resume-schema.ts).
- **Bring Your Own Key (BYOK)**: Google Gemini, OpenAI, Anthropic Claude, and Groq Cloud, plus five system-configured fallback providers so the app works without a BYOK key.
- **Dual export**: vector PDF or raw Typst source (`.typ`) for offline CLI builds.
- **Privacy-first**: client-side PDF/DOCX text extraction — the file never leaves the browser, only extracted text is sent server-side for AI features. Optional Supabase authentication. See the [Privacy Policy](https://lumacv.sahilbansal.net/privacy).
- Responsive across mobile, tablet, and desktop; self-hostable.

---

## Tailoring Modes

**Mode 1 — Resume Optimization (no JD required)**
Polishes passive phrasing into active, quantified language and removes filler, without altering any underlying facts.

**Mode 2 — Targeted JD Alignment (with a job posting)**
Parses the target job description and ATS keywords, bridges adjacent technical experience (for example container orchestration to Kubernetes, cloud IaC to Terraform), and mirrors recruiter keyword frequency without keyword stuffing. Never fabricates employers, titles, or dates. Produces a full audit trail, JD evidence map, and gap analysis.

Full prompting and safety rules: [AI Pipeline Guide](docs/ai-pipeline.md).

---

## Audit Trail

LumaCV exposes every editorial decision instead of hiding them behind a black-box rewrite:

1. **Before/after bullet diffs** with keywords highlighted and per-bullet revert.
2. **Skills rationale**, tagged by source: `direct` (explicitly in the original), `transferable` (adjacent competency), or `inferred` (implied by the existing stack).
3. **JD requirement to resume evidence map**, linking every requirement to the bullet that proves it.
4. **Competency gap analysis**, quantifying remaining gaps and their exact ATS point impact.
5. **Fabrication safety check**, confirming no unsupported claims, degrees, or dates were introduced.

---

## Templates

52 templates across three families — the authoritative list is `TemplateTypeSchema` in [`lib/resume-schema.ts`](lib/resume-schema.ts).

| Family | Examples | Best suited for |
| :--- | :--- | :--- |
| Classic & ATS-Optimized | `modern`, `classic`, `engineering`, `compact`, `two_column`, `ats_safe`, `skillsfirst`, `credential` | Enterprise/government ATS, traditional industries |
| Modern & Tech | `terminal`, `matrix`, `product`, `startup`, `mono`, `cadence` | Startups, software/product roles |
| Executive & Advisory | `executive`, `consultant` | Senior leadership, consulting |

Colorways: `none`, `navy`, `cobalt`, `emerald`, `burgundy`, `teal`, `slate`, `black`.

Browse all variations in the [template gallery](http://localhost:3000/templates).

---

## Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) v20+
- [Typst CLI](https://github.com/typst/typst) (optional locally; a bundled binary ships in `bin/typst.exe` for Windows and installs via `npm run postinstall` on Linux/macOS)
- A free [Supabase](https://supabase.com) project, for authentication and resume persistence
- Optionally, a [Resend](https://resend.com) API key for feedback delivery

### 1. Clone and install
```bash
git clone https://github.com/sahilbnsll/LumaCV.git
cd LumaCV
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
```

```env
# Application host
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase auth and database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional platform fallback AI keys (users can also provide BYOK in the UI)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-claude-key
GROQ_API_KEY=your-groq-key

# User feedback service (Resend)
RESEND_API_KEY=re_your_api_key
FEEDBACK_RECIPIENT_EMAIL=connect@sahilbansal.net
```

### 3. Initialize the database schema
Run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor to create tables, indexes, and Row Level Security policies.

### 4. Start the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

```
[User's PDF/DOCX Resume]
        |
        v (client-side pdfjs-dist / mammoth — file never leaves the browser)
[Raw Text + Extracted URLs]
        |
        v POST /api/v1/resume/parse
[LLM Parser — fails over across Gemini -> Groq -> Mistral -> OpenRouter -> OpenAI -> GitHub Models]
        |
        v (jsonrepair + normalizeResumeFromLLM)
[Structured ResumeData (JSON)]
        |
        v (Zustand store -> Step 2 form)
[User edits / verification]
        |
        v POST /api/v1/resume/tailor (raw `jd` text, or pre-extracted jdKeywords)
[Tailored ResumeData + audit trail — one AI call; the same completion also
 extracts JD keywords if the caller didn't already have them]
        |
        v POST /api/v1/resume/compile
[Typst native engine (bin/typst)]
        |
        v (under 50ms)
[Vector PDF preview and download]
```

Full technical detail: [Architecture Documentation](docs/architecture.md).

---

## BYOK and Privacy

LumaCV connects directly to AI providers using user-supplied keys (BYOK), and falls back to system-configured providers when no BYOK key is set.

| Provider | Access | Models | Notes |
| :--- | :--- | :--- | :--- |
| Google Gemini | BYOK + system | `gemini-2.5-flash`, `gemini-flash-latest` | First in the system fallback chain |
| Groq Cloud | BYOK + system | `groq/compound-mini`, `qwen/qwen3.8-27b`, `openai/gpt-oss-120b`, others | OpenAI-compatible endpoint |
| Mistral AI | System only | `codestral-latest`, `ministral-14b-latest` | OpenAI-compatible endpoint |
| OpenRouter | System only | Free-tier models, e.g. `nvidia/nemotron-3.5-lightning:free` | OpenAI-compatible endpoint |
| OpenAI | BYOK + system | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo` | |
| GitHub Models | System only | `gpt-4o-mini`, `Meta-Llama-3.1-8B-Instruct` | Free with a GitHub PAT |
| Anthropic Claude | BYOK only | `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022` | |

Exact model lists and failover order: [`lib/llm-client.ts`](lib/llm-client.ts).

BYOK keys are held only in local browser memory (`localStorage` / session headers) and sent over HTTPS directly to the model provider. They are never written to disk, a database, or server logs.

---

## Verification

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Production build
npm run build

# Visual regression across all 52 templates
node scripts/test-visual-regression.mjs
```

---

## Documentation

- [System Architecture](docs/architecture.md) — subsystem interactions, data flows, security model
- [AI Tailoring Pipeline](docs/ai-pipeline.md) — dual-mode prompting, adjacent bridging, anti-hallucination rules
- [ATS Scoring Engine](docs/ats-scoring.md) — normalized 4-pillar formula, dynamic weighting, gap analysis
- [API Reference (v1)](docs/api-reference.md) — endpoints, schemas, error codes
- [Production Deployment Guide](docs/deployment.md) — Vercel, Docker, self-hosted VPS
- [Supabase Setup & Schema](docs/supabase-setup.md) — authentication, database tables, RLS policies
- [Troubleshooting Guide](docs/troubleshooting.md) — common deployment and runtime issues
- [Contributing Guidelines](CONTRIBUTING.md) — branching strategy and PR guidelines

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for code conventions, bug reports, and feature proposals.

---

## License and Author

Created by [Sahil Bansal](https://sahilbansal.net/). Contact: [connect@sahilbansal.net](mailto:connect@sahilbansal.net)

Distributed under the [MIT License](LICENSE).
