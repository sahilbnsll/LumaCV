<p align="center">
  <img src="public/logo.svg" width="64" height="64" alt="LumaCV Logo" />
</p>

<h1 align="center">LumaCV</h1>

<p align="center">
  <strong>An open-source resume engineering studio powered by Typst, Next.js, and privacy-first AI tailoring.</strong>
</p>

<p align="center">
  <a href="#quickstart">Quickstart</a> •
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#templates">Templates</a> •
  <a href="#contributing">Contributing</a> •
  <a href="LICENSE">License</a> •
  <a href="http://localhost:3000/docs">Interactive Docs</a>
</p>

---

## Overview

**LumaCV** is a modern, open-source resume creation and optimization platform. It combines the typography and speed of the **Typst** typesetting engine with strict, anti-hallucination AI tailoring models to produce high-impact, ATS-optimized resumes.

Unlike traditional web-based builders that rely on lossy HTML-to-PDF canvas wrappers, LumaCV compiles directly to native vector PDFs using Typst. Users retain full ownership of their data with Bring-Your-Own-Key (BYOK) AI provider integration and complete source code exports (`.typ`).

---

## Features

- **Typst Vector Typesetting**: Native Typst compilation delivers precise typographic hierarchy, micro-spacing, and crisp vector output in milliseconds.
- **Fact-Preserving AI Tailoring**: Tailor experience bullets and summaries to target job descriptions while strictly preserving ground-truth employment history, dates, and authentic metrics.
- **48 Curated Templates**: Spanning ATS-Safe, Modern Tech, Executive, Editorial, and Academic layouts across 8 calibrated color palettes.
- **Bring Your Own Key (BYOK)**: Connect Google Gemini, OpenAI, Anthropic Claude, or Groq Cloud keys directly in client storage. Keys are never logged or stored on the server.
- **Deterministic ATS Scoring**: Real-time diagnostic evaluation across Required Skills, Responsibilities, Preferred Qualifications, and Terminology.
- **Interactive Bullet Diff Studio**: Side-by-side comparison of original vs. tailored experience points with individual accept/revert controls.
- **Dual Export Options**: Download print-ready vector PDFs or complete Typst markup (`.typ`) for local command-line compilation.
- **Session & Cloud Sync**: Gated workspace security with Supabase authentication and automatic local session recovery.

---

## Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) v18.17+ or v20+
- [Typst CLI](https://github.com/typst/typst) (optional locally if using the included `bin/` runtime)
- A free [Supabase](https://supabase.com) project for authentication and resume persistence

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

Fill in your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Default platform AI key (users can also bring their own in UI)
GEMINI_API_KEY=your-gemini-key
```

### 3. Initialize Database Schema
Run the schema script located in [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor to set up tables, foreign keys, and Row Level Security (RLS) policies.

### 4. Start Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to open LumaCV.

---

## Project Structure

```
LumaCV/
├── app/                  # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/           # Authentication (login, signup, password resets)
│   ├── api/v1/           # Protected API endpoints (compile, export, parse, tailor)
│   ├── builder/          # 4-step resume workspace
│   ├── dashboard/        # Saved resumes management
│   ├── demo/             # Public interactive sample CV
│   ├── docs/             # Technical documentation hub (/docs)
│   ├── templates/        # 48-template interactive gallery
│   └── profile/          # BYOK key settings and user preferences
├── components/           # UI components & design system primitives
│   ├── ui/               # Radix UI + shadcn/ui components
│   ├── luma-logo.tsx     # Canonical SVG brand mark
│   └── app-header.tsx    # Header with command bar and user session menu
├── lib/                  # Business logic and services
│   ├── compiler-service.ts   # Typst process executor and WASM integration
│   ├── resume-store.ts       # Client-side Zustand persistence store
│   └── supabase/             # Supabase client and server instances
├── typst/                # Typst templates, layout functions, and fonts
└── prompts/              # Privacy-preserving LLM extraction and tailoring prompts
```

---

## 48 Typst Architectural Templates

LumaCV includes 48 professionally designed Typst templates organized into five distinct archetypes:

1. **ATS-Optimized (13)**: `Impact`, `Switch`, `Grad`, `Leadership`, `Casework`, `Metrics`, `Skillsfirst`, `Credential`, `International`, `Projectled`, `Narrative`, `Strict`, `ATS-Safe`.
2. **Modern & Tech (10)**: `Modern`, `Engineering`, `Compact`, `Two-Column`, `Terminal`, `Matrix`, `Product`, `Startup`, `Mono`, `Cadence`.
3. **Executive & Advisory (10)**: `Classic`, `Executive`, `Consultant`, `Analyst`, `Meridian`, `Ledger`, `Harbor`, `Statement`, `Forma`, `Focus`.
4. **Editorial & Creative (10)**: `Boutique`, `Editorial`, `Portfolio`, `Atelier`, `Swiss`, `Nordic`, `Neo`, `Monochrome`, `Slate`, `Timeline`.
5. **Academic & Research (5)**: `Academic`, `Research Modern`, and specialized scholarly formats.

Explore and live-preview all templates in the [Interactive Gallery](http://localhost:3000/templates).

---

## Verification & Quality Checks

Run the automated suites to ensure TypeScript compilation, route health, and visual consistency:

```bash
# TypeScript compilation check
npx tsc --noEmit

# Production build test
npm run build
```

---

## Documentation

Full architectural guides, environment variable specifications, workflow breakdowns, and API references are available in the dedicated documentation center:
- Live in-app: [http://localhost:3000/docs](http://localhost:3000/docs)
- In repository: [`docs/`](docs/) and [`app/docs/page.tsx`](app/docs/page.tsx)

---

## Contributing

We welcome community contributions! Please review our [Contributing Guide](CONTRIBUTING.md) for details on code standards, local testing, and pull request workflows.

---

## License & Author

Created by [Sahil Bansal](https://sahilbansal.net/).  
Inquiries & Contact: [`connect@sahilbansal.net`](mailto:connect@sahilbansal.net)  

Distributed under the [MIT License](LICENSE).
