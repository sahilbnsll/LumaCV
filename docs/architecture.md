# LumaCV System Architecture

This document details the engineering design, component interactions, security posture, and data flow of LumaCV.

---

## 1. High-Level Architecture Overview

LumaCV is built as a modern, high-throughput resume builder designed around four core pillars:
1. **Client-Side Extraction**: PDF parsing runs entirely in the browser using `pdfjs-dist`, avoiding heavy canvas or native binary dependencies on the server.
2. **Multi-Provider BYOK AI Engine**: Direct integration with Google Gemini, OpenAI, Anthropic Claude, and Groq Cloud, featuring client-side API key encryption, prompt caching, and zero telemetry.
3. **Native Typst Typesetting**: 100% native typesetting using the Typst compiler (< 50ms compile time), completely replacing legacy LaTeX toolchains and external compilation services.
4. **Resilient Persistence**: Client-side Zustand store with hydration guards combined with Supabase for user authentication and CV cloud storage.
5. **Modern Design System**: Powered by Next.js 14 App Router, Tailwind CSS, and `Geist` + `Geist Mono` typography.

---

## 2. End-to-End Data Flow

```
[User's PDF Resume]
        │
        ▼ (Client-side pdfjs-dist)
[Raw Text + Extracted URLs]
        │
        ▼ POST /api/v1/resume/parse
[LLM Parser (Gemini 2.5 Flash / Claude / Groq)]
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
[High-Resolution PDF Preview & Download]
```

---

## 3. Core Subsystems

### 3.1 PDF Text Extraction (`lib/pdf-parser.ts`)
- Runs exclusively on the client in the browser (`typeof window !== 'undefined'`).
- Loads `pdfjs-dist/build/pdf.min.js` with same-origin worker `/pdf.worker.min.js`.
- Iterates over document pages, extracting plain text chunks and hyperlink annotations (e.g. LinkedIn, GitHub, and Portfolio URLs embedded in text).
- Outputs normalized text with preserved line breaks directly to Step 1.

### 3.2 AI Client & BYOK Pipeline (`lib/llm-client.ts`)
The AI engine implements multi-provider failover with support for user-supplied keys:

| Provider | Supported Models | Primary Strength |
| :--- | :--- | :--- |
| **Google Gemini** | `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite` | Sub-400ms latency, native JSON schema support |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `o3-mini` | High compliance with strict schema constraints |
| **Anthropic Claude** | `claude-3-5-sonnet`, `claude-3-5-haiku` | Nuanced editorial vocabulary for senior roles |
| **Groq Cloud** | `qwen/qwen-2.5-32b`, `llama-3.3-70b` | Ultra-high token generation throughput |

**Security & Privacy**:
- Keys provided in headers (`x-gemini-api-key`, etc.) are held in ephemeral memory per request and never logged.
- The prompt caching layer (`lib/prompt-cache.ts`) deduplicates identical extraction and tailoring requests, avoiding redundant model calls.

### 3.3 Normalization Layer (`lib/normalize-resume.ts`)
LLMs can occasionally return schema variations. The normalization layer:
- Ensures all core arrays (`experience`, `education`, `projects`, `skills`) are non-null and correctly typed.
- Sanitizes bullet points, converting markdown bold to clean plain text where required.
- Enforces minimum summary lengths and ensures contact info has consistent URL formats (`https://`).

### 3.4 Typst Typesetting System (`lib/typst-generator.ts` & `typst/`)
LumaCV uses **Typst**, a next-generation markup-based typesetting system written in Rust:
- **Sub-50ms Compilation**: Compiles full multi-page resumes in 20–45ms.
- **48 Curated Layout Combinations**: 6 base archetypes (`modern`, `classic`, `engineering`, `compact`, `two_column`, `ats_safe`) mapped across 8 color themes (`none`, `navy`, `cobalt`, `emerald`, `burgundy`, `teal`, `slate`, `black`).
- **Deterministic ATS Formatting**: Generates 100% vector text without font rasterization or embedded image artifacts, ensuring perfect optical character and text extraction for ATS parsers.

### 3.5 Typography & Design Tokens
- **Typography**: Built on Vercel's `Geist Sans` and `Geist Mono` packages.
- **CSS Variables**: Theme tokens `--font-display`, `--font-ui`, `--font-sans`, and `--font-mono` are mapped to `var(--font-geist-sans)` and `var(--font-geist-mono)`.
- **Motion & Interactions**: Framer Motion and GSAP micro-animations with hardware acceleration and `prefers-reduced-motion` compliance.

### 3.6 Automated Testing & Visual Regression (`scripts/test-visual-regression.mjs`)
- Runs a 48-combination matrix across all templates and colorways.
- Verifies binary size, single-page boundary compliance, and compilation integrity in under 2 seconds.

---

## 4. API Endpoints Reference

| Method | Endpoint | Description | Timeout |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/resume/parse` | Parses raw resume text into structured `ResumeData` | 60s |
| `POST` | `/api/v1/jd/analyze` | Extracts keywords and required skills from a JD | 45s |
| `POST` | `/api/v1/resume/tailor` | Generates tailored bullets and Typst source code | 60s |
| `POST` | `/api/v1/resume/compile` | Compiles `ResumeData` or Typst source into PDF binary | 15s |
| `POST` | `/api/v1/resume/score` | Calculates deterministic ATS keyword alignment | Edge |
| `GET` | `/api/v1/stats` | Aggregated platform compilation and uptime telemetry | 10s |
| `POST` | `/api/v1/feedback` | User bug reports and feature requests | 10s |
