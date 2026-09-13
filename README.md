<p align="center">
  <img src="public/icon.svg" width="72" height="72" alt="LumaCV Logo" />
</p>

<h1 align="center">LumaCV</h1>

<p align="center">
  <strong>The open-source resume engineering studio powered by Typst, Next.js 14, and transparent, privacy-first AI tailoring.</strong>
</p>

<p align="center">
  <a href="#quickstart">Quickstart</a> •
  <a href="#features">Features</a> •
  <a href="#two-tailoring-modes">Dual Tailoring Modes</a> •
  <a href="#transparent-audit-trail">Audit Trail</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#templates">52 Templates</a> •
  <a href="#byok-privacy">BYOK Privacy</a> •
  <a href="#testing">Verification</a> •
  <a href="docs/architecture.md">Docs Hub</a> •
  <a href="LICENSE">License</a>
</p>

---

## Overview

**LumaCV** is an open-source, deterministic resume creation and optimization platform built for engineers, researchers, and technical leaders. It replaces fragile HTML-to-PDF canvas wrappers and heavyweight LaTeX toolchains with the speed and typographic excellence of the **Typst** typesetting engine (< 50ms native compilation).

LumaCV features a **transparent, anti-hallucination AI pipeline** that operates in two specialized modes: general resume optimization and aggressive, job-description-targeted alignment with adjacent technology bridging. Crucially, LumaCV gives users complete visibility into **what changed and why** through a granular audit trail, competency gap analysis, and deterministic ATS score breakdown.

---

## Key Features

- ⚡ **Sub-50ms Typst Vector Typesetting**: Native Typst compilation produces razor-sharp typographic hierarchy, micro-spacing, and pure vector output in milliseconds.
- 🎯 **Dual AI Tailoring Modes**:
  - **Mode 1 (Resume Optimization)**: Enhances action verbs, tightens syntax, and highlights quantifiable metrics while preserving 100% of existing content facts.
  - **Mode 2 (Targeted JD Alignment)**: Bridges adjacent technologies (e.g., Docker/ECS $\rightarrow$ Kubernetes, CI/CD $\rightarrow$ GitHub Actions) and optimizes recruiter ATS keyword indexing with zero fabrication of titles, dates, or employers.
- 🔍 **Transparent Audit Trail & Explainability**:
  - **Before $\rightarrow$ After Diff Viewer**: Granular side-by-side comparison for every modified experience bullet with individual accept/restore controls.
  - **Skills Rationale Matrix**: Details why skills were added or emphasized, classified by source (`direct`, `transferable`, `inferred`).
  - **JD Evidence Mapping**: Line-by-line verification linking job posting requirements to resume proof.
  - **Score Gap Diagnostics**: Explains exactly why the ATS score isn't 100% and itemizes the exact point impact for each missing competency.
  - **Evidence Safety Guarantee**: Automated safety verdict confirming zero hallucinated metrics, employers, or credentials.
- 📊 **Dynamic Normalized ATS Scoring Engine**: Evaluates hard skills, core responsibilities, keyword density, and formatting compliance across a normalized 4-pillar formula that reaches 95–100% for well-matched candidates without artificial caps.
- 📐 **52 Typst Templates**: Spanning Classic/ATS-Optimized, Modern & Tech, and Executive & Advisory families with instant vector previews and offline CLI compatibility — see [`lib/resume-schema.ts`](lib/resume-schema.ts).
- 🌊 **Atmospheric Dual-Mode Floating Vector Lines**: Perpetual, GPU-accelerated contour waves flowing gracefully across both light and dark modes with calibrated Apple slate and cosmic white tones that never obscure foreground text or card elevation.
- 🧭 **Universal Kinetic Menu & Spring Motion**: Full-screen navigation drawer with rotating glyph trigger (`KineticMenuButton`) accessible from every view (Editor, Dashboard, Templates, Docs, Auth) powered by Apple fluid spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
- 🧲 **Magnetic Floating Dock**: macOS-grade bottom dock with calibrated spring physics, vivid gradient badges, high-contrast tooltips, and specular highlight icons for rapid workspace switching.
- 💳 **Unified Open-Source Sustainability Suite**: Centralized Apple-grade glassmorphic UPI dialog with dynamic SVG QR code generation and real-time custom amount verification, alongside GitHub Sponsors and Buy Me a Coffee channels.
- 📱 **Adaptive Responsive UI**: Tailored layouts across mobile, tablet, and desktop featuring swipeable touch snap carousels, responsive dialogs, and sticky action bars.
- 🔑 **Bring Your Own Key (BYOK)**: Native support for Google Gemini, OpenAI, Anthropic Claude, and Groq Cloud — plus five system-configured fallback providers (Gemini, Groq, Mistral, OpenRouter, GitHub Models) so the app works out of the box even without a BYOK key. Keys are held ephemerally in browser memory and are never persisted or logged.
- 📦 **Dual Export Architecture**: Instant vector PDF downloads or raw Typst source exports (`.typ`) for offline CLI builds.
- 📬 **Integrated User Feedback Service**: Direct bug and feature report dispatch powered by Resend.
- 🔒 **Privacy-First & Self-Hostable**: Client-side PDF/DOCX text extraction (`pdfjs-dist` / `mammoth`) — the file itself never leaves the browser, only extracted text is sent server-side for AI features. Optional Supabase authentication. (Aggregate, privacy-respecting page analytics via Vercel Analytics — see [Privacy Policy](https://lumacv.sahilbansal.net/privacy).)

---

## Two Tailoring Modes

LumaCV provides two distinct operating modes to serve different stages of the job search:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Mode 1: Resume Optimization (No JD Required)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Polishes passive phrasing into high-impact active verbs                   │
│ • Quantifies outcomes and surfaces engineering impact metrics               │
│ • Eliminates filler words, repetition, and grammatical inconsistencies       │
│ • 100% strict adherence to existing experience facts                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Mode 2: Targeted JD Alignment (With Target Job Posting)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Ingests and parses target job description requirements and ATS keywords   │
│ • Adjacent Technical Bridging: Highlights relevant transferable tooling    │
│   (e.g., container orchestration -> K8s, cloud IaC -> Terraform)            │
│ • Strategically mirrors recruiter keyword frequency without keyword stuffing│
│ • Anti-Hallucination Guardrails: NEVER fabricates employers, titles or dates│
│ • Generates full Audit Trail, JD Evidence Map, and Gap Analysis             │
└─────────────────────────────────────────────────────────────────────────────┘
```

Read the full [AI Pipeline Guide](docs/ai-pipeline.md) for comprehensive prompting and safety rules.

---

## Transparent Audit Trail

Unlike "black box" resume optimizers, LumaCV exposes every editorial decision:

1. **Before $\rightarrow$ After Bullet Diffs**: Every tailored bullet is presented with inline visual diffs, keywords injected, and individual revert buttons.
2. **Surfaced Skills & Rationale**: Identifies newly emphasized skills, citing the source:
   - `direct`: Explicitly mentioned in original experience.
   - `transferable`: Adjacent competency bridged from proven context.
   - `inferred`: Logically required by existing tech stack.
3. **JD Requirement to Resume Evidence Map**: Cross-references every requirement from the job posting against the exact resume bullet that proves it.
4. **Competency Gap Analysis**: Quantifies remaining gaps (e.g. missing niche tools) and shows the exact point penalty in the ATS score.
5. **Fabrication Safety Indicator**: Automated check confirming that zero unsupported claims, unauthorized degrees, or fabricated dates were introduced.

---

## 52 Curated Typst Templates

LumaCV ships 52 templates across three families — the authoritative list is
`TemplateTypeSchema` in [`lib/resume-schema.ts`](lib/resume-schema.ts):

| Family | Examples | Best Suited For |
| :--- | :--- | :--- |
| **Classic & ATS-Optimized** | `modern`, `classic`, `engineering`, `compact`, `two_column`, `ats_safe`, `skillsfirst`, `credential` | Enterprise/government ATS, traditional industries |
| **Modern & Tech** | `terminal`, `matrix`, `product`, `startup`, `mono`, `cadence` | Startups, software/product roles |
| **Executive & Advisory** | `executive`, `consultant` | Senior leadership, consulting |

**Colorways**: `none`, `navy`, `cobalt`, `emerald`, `burgundy`, `teal`, `slate`, `black`.

Explore all variations in the [Interactive Gallery](http://localhost:3000/templates).

---

## Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) v20+
- [Typst CLI](https://github.com/typst/typst) (optional locally; bundled binary included in `bin/typst.exe` for Windows and installed via `npm run postinstall` for Linux/macOS)
- A free [Supabase](https://supabase.com) project (for authentication and resume persistence)
- (Optional) A [Resend](https://resend.com) API key for user feedback delivery

### 1. Clone and Install
```bash
git clone https://github.com/sahilbnsll/LumaCV.git
cd LumaCV
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment credentials:
```env
# Application Host
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Auth & Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional Platform Fallback AI Keys (users can provide BYOK in UI)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-claude-key
GROQ_API_KEY=your-groq-key

# User Feedback Service (Resend)
RESEND_API_KEY=re_your_api_key
FEEDBACK_RECIPIENT_EMAIL=connect@sahilbansal.net
```

### 3. Initialize Database Schema
Run the SQL script located in [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor to configure tables, indexes, and Row Level Security (RLS) policies.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to launch LumaCV.

---

## Architecture Overview

```
[User's PDF/DOCX Resume]
        │
        ▼ (Client-side pdfjs-dist / mammoth — file never leaves the browser)
[Raw Text + Extracted URLs]
        │
        ▼ POST /api/v1/resume/parse
[LLM Parser — fails over across Gemini → Groq → Mistral → OpenRouter → OpenAI → GitHub Models]
        │
        ▼ (jsonrepair + normalizeResumeFromLLM)
[Structured ResumeData (JSON)]
        │
        ▼ (Zustand Store -> Step 2 Form)
[User Edits / Verification]
        │
        ▼ POST /api/v1/resume/tailor (raw `jd` text OR pre-extracted jdKeywords)
[Tailored ResumeData + Transparent Audit Trail — one AI call total; the same
 completion extracts JD keywords too if the caller didn't already have them]
        │
        ▼ POST /api/v1/resume/compile
[Typst Native Engine (bin/typst)]
        │
        ▼ (< 50ms)
[High-Resolution Vector PDF Preview & Download]
```

Read the full [Architecture Documentation](docs/architecture.md) for deeper technical specifications.

---

## BYOK Privacy & Model Compatibility

LumaCV connects directly with leading AI providers using user-provided API keys (BYOK), and falls back to system-configured providers when no BYOK key is set:

| Provider | Access | Models | Notes |
| :--- | :--- | :--- | :--- |
| **Google Gemini** | BYOK + system | `gemini-2.5-flash`, `gemini-flash-latest` | Tried first in the system fallback chain |
| **Groq Cloud** | BYOK + system | `groq/compound-mini`, `qwen/qwen3.8-27b`, `openai/gpt-oss-120b`, and others | OpenAI-compatible endpoint |
| **Mistral AI** | System only | `codestral-latest`, `ministral-14b-latest` | OpenAI-compatible endpoint |
| **OpenRouter** | System only | Free-tier models (e.g. `nvidia/nemotron-3.5-lightning:free`) | OpenAI-compatible endpoint |
| **OpenAI** | BYOK + system | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo` | |
| **GitHub Models** | System only | `gpt-4o-mini`, `Meta-Llama-3.1-8B-Instruct` | Free with a GitHub PAT |
| **Anthropic Claude** | BYOK only | `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022` | |

See [`lib/llm-client.ts`](lib/llm-client.ts) for the exact model lists and failover order.

> **Privacy Guarantee**: BYOK keys are held strictly in local browser memory (`localStorage` / session headers) and sent over encrypted HTTPS directly to model inference endpoints. They are never written to disk, database, or server logs.

---

## Verification & Quality Gates

Run automated verification suites before submitting pull requests:

```bash
# Type check with zero TypeScript errors
npx tsc --noEmit

# Production lint check
npm run lint

# Production build test
npm run build

# Automated Visual Regression Audit (all 52 templates)
node scripts/test-visual-regression.mjs
```

---

## Documentation Hub

Explore the complete documentation directory:
- [System Architecture](docs/architecture.md) - Subsystem interactions, data flows, and security model.
- [AI Tailoring Pipeline](docs/ai-pipeline.md) - Dual-mode prompting, adjacent bridging, and anti-hallucination rules.
- [ATS Scoring Engine](docs/ats-scoring.md) - Normalized 4-pillar formula, dynamic weighting, and gap analysis.
- [API Reference (v1)](docs/api-reference.md) - Complete endpoints, schemas, and error codes.
- [Production Deployment Guide](docs/deployment.md) - Vercel, Docker, and self-hosted VPS setups.
- [Supabase Setup & Schema](docs/supabase-setup.md) - Authentication, database tables, and RLS policies.
- [Troubleshooting Guide](docs/troubleshooting.md) - Common deployment and runtime solutions.
- [Contributing Guidelines](CONTRIBUTING.md) - Branching strategy and PR guidelines.

---

## Contributing

We welcome contributions! Check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code conventions, bug reporting, and feature proposals.

---

## License & Author

Created by [Sahil Bansal](https://sahilbansal.net/).  
Inquiries & Contact: [`connect@sahilbansal.net`](mailto:connect@sahilbansal.net)  

Distributed under the [MIT License](LICENSE).
