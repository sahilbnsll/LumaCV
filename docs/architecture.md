# LumaCV System Architecture

This document details the engineering design, component interactions, and data flow of LumaCV.

---

## 1. High-Level Architecture Overview

LumaCV is built as a modern, high-throughput resume builder designed around four core pillars:
1. **Client-Side Extraction**: PDF parsing runs entirely in the browser using `pdfjs-dist`, avoiding heavy canvas/native binary dependencies on the server.
2. **Dual-Provider High-Quota AI Engine**: Direct integration with Google Gemini and Groq Cloud, implementing automatic model-to-model and provider-to-provider failovers.
3. **Native Typst Typesetting**: 100% native typesetting using the Typst compiler (< 50ms compile time), completely replacing legacy LaTeX toolchains and external compilation farms.
4. **Resilient Persistence**: Client-side Zustand store with hydration guards combined with Supabase for user authentication and CV cloud storage.

---

## 2. End-to-End Data Flow

```
[User's PDF Resume]
        │
        ▼ (Client-side pdfjs-dist)
[Raw Text + Extracted URLs]
        │
        ▼ POST /api/v1/resume/parse
[LLM Parser (Gemini 2.5 Flash / Groq Qwen)]
        │
        ▼ (jsonrepair + normalizeResumeFromLLM)
[Structured ResumeData (JSON)]
        │
        ▼ (Zustand Store -> Step 2 Form)
[User Edits / Verification]
        │
        ▼ POST /api/v1/jd/analyze + POST /api/v1/resume/tailor
[Tailored ResumeData + Typst Code]
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

### 3.2 AI Client & Failover Pipeline (`lib/llm-client.ts`)
The AI engine implements a two-tier priority failover matrix:

| Task Type | Provider Priority | Models in Chain |
| :--- | :--- | :--- |
| **Heavy** (Resume Parsing & Tailoring) | 1. Google Gemini<br>2. Groq Cloud | `gemini-2.5-flash`<br>`gemini-flash-latest`<br>`gemini-3.5-flash`<br>`qwen/qwen3.6-27b`<br>`openai/gpt-oss-120b` |
| **Light** (JD Analysis & Scoring) | 1. Google Gemini<br>2. Groq Cloud | `gemini-2.5-flash-lite`<br>`gemini-flash-lite-latest`<br>`qwen/qwen3.6-27b`<br>`openai/gpt-oss-20b` |

**Resilience Features**:
- 15-second abort controller timeout per model attempt.
- Automatic failover on empty stream, HTTP 429 (rate limit), or HTTP 5xx errors.
- Streaming response collection with server-side `jsonrepair` before JSON deserialization.

### 3.3 Normalization Layer (`lib/normalize-resume.ts`)
LLMs can occasionally return inconsistent schema variations (e.g. string dates vs date objects, missing arrays, unexpected section labels). The normalization layer:
- Ensures all core arrays (`experience`, `education`, `projects`, `skills`) are non-null and correctly typed.
- Sanitizes bullet points, converting markdown bold to clean plain text where required.
- Enforces minimum summary lengths and ensures contact info has consistent URL formats (`https://`).

### 3.4 Typst Typesetting System (`lib/typst-generator.ts` & `typst/`)
LumaCV uses **Typst**, a next-generation markup-based typesetting system written in Rust:
- **Zero LaTeX Dependencies**: No `pdflatex`, `xelatex`, TeX Live distributions, or third-party web services needed.
- **Sub-50ms Compilation**: Compiles full multi-page resumes in 20–45ms.
- **Embedded Templates**:
  - `modern.typ`: Contemporary sans-serif layout with subtle category badges and contact strip.
  - `classic.typ`: Harvard-style serif typography with elegant divider lines.
  - `engineering.typ`: Dual-rule technical density designed for software and platform engineers.
  - `compact.typ`: High-density single-page layout for long career histories.
  - `two_column.typ`: Asymmetrical layout with an organized sidebar.
  - `ats_safe.typ`: Pure linear layout designed for maximum ATS machine readability.
- **Theme Color Matrix**: Dynamic injection of 8 curated swatches (`modern`, `classic`, `engineering`, `compact`, `two-column`, `ats-safe`, `emerald`, `burgundy`, `navy`, `cobalt`, `teal`, `slate`, `black`).

### 3.5 State Management & Hydration (`lib/store.ts`)
- Built with Zustand and `persist` middleware (storing state in `localStorage`).
- Implements `resumeDataRevision` counter to ensure React Hook Form default values update cleanly when an AI parse completes.
- Hydration guards prevent empty persisted snapshots from overriding in-progress parsing workflows.

---

## 4. API Endpoints Reference

| Method | Endpoint | Description | Max Duration |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/resume/parse` | Parses raw resume text into structured `ResumeData` | 60s |
| `POST` | `/api/v1/jd/analyze` | Extracts keywords and required skills from a JD | 60s |
| `POST` | `/api/v1/resume/tailor` | Generates tailored bullets and Typst source code | 60s |
| `POST` | `/api/v1/resume/compile` | Compiles `ResumeData` or Typst source into PDF binary | 15s |
| `POST` | `/api/v1/resume/score` | Calculates ATS keyword alignment percentage | Edge |
| `POST` | `/api/v1/resume/render` | Initiates async PDF rendering and cache lookup | 10s |
| `GET` | `/api/v1/resume/render` | Polls async PDF render job status or returns signed URL | 10s |
| `POST` | `/api/v1/resume/export-typ` | Generates downloadable `.typ` source file | Standard |
