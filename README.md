<p align="center">
  <img src="public/icon.svg" width="72" height="72" alt="LumaCV Logo" />
</p>

<h1 align="center">LumaCV</h1>

<p align="center">
  <strong>The open-source resume engineering studio powered by Typst, Next.js 14, and privacy-first AI tailoring.</strong>
</p>

<p align="center">
  <a href="#quickstart">Quickstart</a> •
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#templates">48 Templates</a> •
  <a href="#byok-privacy">BYOK Privacy</a> •
  <a href="#testing">Verification</a> •
  <a href="docs/deployment.md">Deployment</a> •
  <a href="docs/api-reference.md">API Reference</a> •
  <a href="LICENSE">License</a>
</p>

---

## Overview

**LumaCV** is an open-source, deterministic resume creation and optimization platform built for engineers, researchers, and professionals. It replaces fragile HTML-to-PDF canvas wrappers and complex LaTeX distributions with the speed and typographic precision of the **Typst** typesetting engine (< 50ms compilation time).

Equipped with an anti-hallucination AI pipeline, LumaCV tailors experience bullet points and summaries to match job descriptions while strictly preserving ground-truth employment history, dates, and authentic metrics. Users maintain complete ownership of their data with client-side Bring-Your-Own-Key (BYOK) AI provider integration and complete Typst source code exports (`.typ`).

---

## Key Features

- ⚡ **Sub-50ms Typst Vector Typesetting**: Native Typst compilation delivers razor-sharp typographic hierarchy, micro-spacing, and pure vector output in milliseconds.
- 🛡️ **100% Fact-Preserving AI Tailoring**: Enhances phrasing and vocabulary to align with target role keywords while strictly safeguarding real-world dates, employers, and authentic achievements.
- 📐 **48 Architectural Template Combinations**: 6 core design archetypes (`Modern`, `Classic`, `Engineering`, `Compact`, `Two-Column`, `ATS-Safe`) across 8 curated executive colorways.
- 🔑 **Bring Your Own Key (BYOK)**: Native support for Google Gemini, OpenAI, Anthropic Claude, and Groq Cloud. Keys are held ephemerally in the browser and never logged or persisted on the server.
- 📊 **Deterministic ATS Scoring**: Real-time diagnostic evaluation across required competencies, responsibility alignment, and industry terminology.
- 🔍 **Interactive Bullet Diff Studio**: Granular side-by-side comparison of original vs. tailored experience points with individual accept/reject controls.
- 📦 **Dual Export Architecture**: Download print-ready vector PDFs or export raw Typst markup (`.typ`) for offline CLI builds.
- 🔒 **Privacy-First & Self-Hostable**: Client-side PDF text extraction via `pdfjs-dist`, optional Supabase authentication, and zero third-party telemetry.
- 🎨 **Typography System**: Designed with Vercel's `Geist Sans` and `Geist Mono` typography tokens for an ultra-clean, high-density editorial finish.

---

## Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) v18.17+ or v20+
- [Typst CLI](https://github.com/typst/typst) (optional locally; bundled binaries included in `bin/`)
- A free [Supabase](https://supabase.com) project (for user authentication and resume persistence)

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

Fill in your project credentials:
```env
# Host Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Auth & Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional Platform Fallback AI Keys (users can supply BYOK in UI)
GEMINI_API_KEY=your-gemini-key
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
        ▼ POST /api/v1/jd/analyze + POST /api/v1/resume/tailor
[Tailored ResumeData + Typst AST]
        │
        ▼ POST /api/v1/resume/compile
[Typst Native Engine (bin/typst)]
        │
        ▼ (< 50ms)
[High-Resolution Vector PDF Preview & Download]
```

Read the full [Architecture Documentation](docs/architecture.md) for deeper technical specifications.

---

## 48 Curated Typst Templates

LumaCV features 6 foundational typesetting archetypes paired with 8 executive color palettes:

| Archetype | Best Suited For | Key Visual Characteristics |
| :--- | :--- | :--- |
| **Modern** | Product Managers, Tech Leads | Clean sans-serif, category pill tags, streamlined contact bar |
| **Classic** | Finance, Law, Executive | Harvard-style serif typography, elegant horizontal rules |
| **Engineering** | Software, Systems, DevOps | High-density layout, dual-rule sections, explicit tech matrices |
| **Compact** | 10+ Year Veteran Careers | Maximum information density, single-page fit algorithm |
| **Two-Column** | Designers, Technical Writers | Asymmetric layout with structured sidebar for skills & awards |
| **ATS-Safe** | Enterprise & Government ATS | Pure single-column linear flow, guaranteed 100% parser indexability |

**Colorways**: `none`, `navy`, `cobalt`, `emerald`, `burgundy`, `teal`, `slate`, `black`.

Live-preview all combinations in the [Interactive Gallery](http://localhost:3000/templates).

---

## BYOK Privacy & Model Compatibility

LumaCV connects directly with the leading AI providers using user-provided API keys:

| Provider | Supported Models | Recommended Use Case |
| :--- | :--- | :--- |
| **Google Gemini** | `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite` | Ultra-low latency (< 400ms), structured outputs |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `o3-mini` | Benchmark schema compliance & formatting |
| **Anthropic Claude**| `claude-3-5-sonnet`, `claude-3-5-haiku` | Nuanced, natural executive vocabulary |
| **Groq Cloud** | `qwen/qwen-2.5-32b`, `llama-3.3-70b` | Maximum token generation speed |

> **Privacy Guarantee**: BYOK keys are held strictly in local browser storage (`localStorage`) and sent via encrypted HTTPS headers directly to the inference endpoints. They are never written to disk, database, or server logs.

---

## Verification & Quality Gates

Run the automated verification test suites before submitting changes:

```bash
# Type check with zero TypeScript errors
npx tsc --noEmit

# Production build test
npm run build

# Automated Visual Regression Audit (48 combinations)
npx tsx scripts/test-visual-regression.mjs
```

---

## Documentation Hub

Explore the complete documentation directory:
- [System Architecture](docs/architecture.md)
- [API Reference (v1)](docs/api-reference.md)
- [Production Deployment Guide](docs/deployment.md)
- [Supabase Setup & Schema](docs/supabase-setup.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

## Contributing

We welcome contributions! Check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on branch management, code conventions, and pull request workflows.

---

## License & Author

Created by [Sahil Bansal](https://sahilbansal.net/).  
Inquiries & Contact: [`connect@sahilbansal.net`](mailto:connect@sahilbansal.net)  

Distributed under the [MIT License](LICENSE).
