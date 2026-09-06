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
  <a href="#templates">48 Templates</a> •
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
- 📐 **48 Architectural Template Combinations**: 6 core design archetypes (`Modern`, `Classic`, `Engineering`, `Compact`, `Two-Column`, `ATS-Safe`) across 8 curated executive colorways.
- 📱 **Adaptive Responsive UI**: Tailored layouts across mobile, tablet, and desktop featuring swipeable touch snap carousels and sticky action bars.
- 🔑 **Bring Your Own Key (BYOK)**: Native support for Google Gemini, OpenAI, Anthropic Claude, and Groq Cloud. Keys are held ephemerally in browser memory and are never persisted or logged.
- 📦 **Dual Export Architecture**: Instant vector PDF downloads or raw Typst source exports (`.typ`) for offline CLI builds.
- 📬 **Integrated User Feedback Service**: Direct bug and feature report dispatch powered by Resend with verified domain delivery.
- 🔒 **Privacy-First & Self-Hostable**: Client-side PDF text extraction via `pdfjs-dist`, optional Supabase authentication, and zero third-party tracking telemetry.

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

## 48 Curated Typst Templates

LumaCV provides 6 foundational typesetting archetypes paired with 8 executive color palettes:

| Archetype | Best Suited For | Key Visual Characteristics |
| :--- | :--- | :--- |
| **Modern** | Product Managers, Tech Leads | Clean sans-serif, category pill tags, streamlined contact bar |
| **Classic** | Finance, Law, Executive | Harvard-style serif typography, elegant horizontal rules |
| **Engineering** | Software, Systems, DevOps | High-density layout, dual-rule sections, explicit tech matrices |
| **Compact** | 10+ Year Veteran Careers | Maximum information density, single-page fit algorithm |
| **Two-Column** | Designers, Technical Writers | Asymmetric layout with structured sidebar for skills & awards |
| **ATS-Safe** | Enterprise & Government ATS | Pure single-column linear flow, guaranteed 100% parser indexability |

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
[User's PDF Resume]
        │
        ▼ (Client-side pdfjs-dist)
[Raw Text + Extracted URLs]
        │
        ▼ POST /api/v1/resume/parse
[LLM Parser (Gemini 2.5 Flash / Groq / Claude)]
        │
        ▼ (jsonrepair + normalizeResumeFromLLM)
[Structured ResumeData (JSON)]
        │
        ▼ (Zustand Store -> Step 2 Form)
[User Edits / Verification]
        │
        ▼ POST /api/v1/resume/analyze-jd + POST /api/v1/resume/tailor
[Tailored ResumeData + Transparent Audit Trail + Typst AST]
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

LumaCV connects directly with leading AI providers using user-provided API keys:

| Provider | Supported Models | Recommended Use Case |
| :--- | :--- | :--- |
| **Google Gemini** | `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite` | Ultra-low latency (< 400ms), structured outputs |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `o3-mini` | Benchmark schema compliance & formatting |
| **Anthropic Claude**| `claude-3-5-sonnet`, `claude-3-5-haiku` | Nuanced, natural executive vocabulary |
| **Groq Cloud** | `qwen/qwen-2.5-32b`, `llama-3.3-70b` | Maximum token generation speed |

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

# Automated Visual Regression Audit (48 combinations)
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
