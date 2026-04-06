# Master Prompt: AI Resume Tailor Application (Updated)

Use this document as the product/engineering spec for the ResumeTailor app. It merges the original plan with **critical fixes** discovered in implementation.

---

## Critical fixes (must read)

### 1. LaTeX URL length limit

- **Problem:** Query strings cannot hold full resume LaTeX (~2KB+ encoded).
- **Solution:** `multipart/form-data` POST to `https://latexonline.cc/compile` with the `.tex` file as a blob field.
- **Impact:** Avoids HTTP 414 URI Too Long.

### 2. PDF.js client/server separation

- **Problem:** pdf.js expects browser APIs (Canvas, workers).
- **Solution:** Extract text **only in the browser**; send plain text to `/api/parse-resume`.
- **Impact:** No Node canvas polyfills; smaller server bundles.

### 3. LaTeX special-character escaping

- **Problem:** Characters like `&`, `#`, `$`, `%` break LaTeX.
- **Solution:** `escapeLatex()` on **all** user-controlled strings before template insertion.
- **Impact:** Stable PDF compilation.

### 3b. Line breaks in `center` (critical)

- **Problem:** In JS template strings, `\\[4pt]` becomes `\[4pt]` in the `.tex` file — `\[` opens **display math**, not “line break + 4pt”, corrupting the document and previews.
- **Solution:** Emit a real LaTeX line break as `\\\\[n pt]` from JS (four backslashes → `\\[n pt]` in TeX), or use a helper like `latexCenterBreak(n)`.
- **Overleaf “Open” via `snip`:** Overleaf’s legacy `snip` POST often injects the **default welcome project** instead of your file. Prefer **Download .tex** + upload, or **Copy LaTeX** into a blank project.

### 4. LLM JSON mode + response cleanup

- **Problem:** Some providers still wrap JSON in markdown fences.
- **Solution:** `response_format: { type: 'json_object' }` where supported, plus `extractJsonObjectFromAssistantText()` before `JSON.parse`.
- **Impact:** Fewer parse failures; fewer retries.

### 5. Zod contracts

- **Problem:** Ambiguous API payloads cause runtime errors.
- **Solution:** Zod for all API inputs/outputs; `normalizeResumeFromLLM()` to coerce messy model output into `ResumeDataSchema`.

### 6. LLM abstraction

- **Problem:** Vendor lock-in (Groq-only).
- **Solution:** `LLMClient` in `lib/llm-client.ts` with OpenRouter (OpenAI-compatible) as default when `OPENROUTER_API_KEY` is set, Groq as fallback.
- **Env:** `OPENROUTER_API_KEY`, optional `OPENROUTER_MODEL`, optional `GROQ_API_KEY`, optional `LLM_PROVIDER=openrouter|groq`.

### 7. Prompt versioning

- **Solution:** Prompts live under `/prompts/*.txt`; load and substitute placeholders in route handlers.

### 8. Zustand persist + Step 2 empty form (CRITICAL)

- **Problem:** `persist` rehydrates from `localStorage` **asynchronously**. If the user parses a resume **before** rehydration finishes, the stored snapshot (often `resumeData: null`) can **overwrite** the freshly parsed data. Step 2 then mounts with empty fields while the toast still says success.
- **Solution (use all):**
  1. **Wait for hydration** before rendering the wizard: `useAppStore.persist.hasHydrated()` / `onFinishHydration`.
  2. **Custom `merge`** on `persist`: prefer in-memory `resumeData`, `jdAnalysis`, `generatedResume` when non-null over rehydrated nulls; prefer non-empty `jd` / `extractedText` from memory when applicable.
  3. **`setResumeDataFromParse`** vs **`setResumeData`:** only the parse path bumps `resumeDataRevision` and should be used after `/api/parse-resume`. Manual “Save” uses `setResumeData` without bumping (avoids remounting the form on every save).
  4. **`<ResumeForm key={...} />`:** remount when `resumeDataRevision` changes after parse so `react-hook-form` default values bind to parsed data.

---

## Tech stack

- **Frontend:** Next.js 14+ (App Router), React 18, TypeScript  
- **UI:** shadcn/ui, Tailwind, Lucide  
- **LLM:** OpenRouter (default — JSON mode + retries  
- **PDF:** pdf.js — **client only**; worker served from `/public/pdf.worker.min.js`  
- **PDF → JSON:** `/api/parse-resume` + `prompts/resume-parse.txt` + normalization  
- **LaTeX:** `latex-generator` + `compile-latex` route (multipart)  
- **State:** Zustand + `persist` (with merge + hydration rules above)

---

## Environment variables

```bash
# Preferred (OpenRouter)
OPENROUTER_API_KEY=
# Optional; example: meta-llama/llama-3.3-70b-instruct
OPENROUTER_MODEL=

# Fallback
# GROQ_API_KEY=

# Optional: openrouter | groq
# LLM_PROVIDER=

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional rate limits
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
```

---

## Wizard flow (4 steps)

1. **Step 1:** JD textarea + PDF upload → pdf.js extract text → `POST /api/parse-resume` → `setResumeDataFromParse`.
2. **Step 2:** Review/edit `ResumeForm` → validate → `setStep(3)`.
3. **Step 3:** `analyze-jd` → `generate-resume` → store LaTeX + data.
4. **Step 4:** Preview PDF (`compile-latex`), template switch, optional edits.

---

## API routes (summary)

| Route | Role |
|--------|------|
| `POST /api/parse-resume` | Text → LLM → `normalizeResumeFromLLM` → JSON |
| `POST /api/analyze-jd` | JD → keywords JSON |
| `POST /api/generate-resume` | Tailor + LaTeX string |
| `POST /api/compile-latex` | LaTeX → PDF binary |

---

## Retry policy

- All LLM calls: **3 attempts**, exponential backoff (e.g. base 1s).

---

## Security & privacy

- No long-term server storage of resumes; ephemeral processing.
- Mention **OpenRouter** (and any other providers) + **LaTeX.Online** in privacy policy.
- Never commit API keys; use `.env.local` / host env.

---

## Testing checklist (additions)

- [ ] Parse PDF → Step 2 shows **filled** fields (not empty) after success toast.
- [ ] Hard refresh mid-wizard → persisted `resumeData` still appears in Step 2.
- [ ] Special characters in name/company (`AT&T`, `C#`, `$100K`) compile to PDF.

---

## Future enhancements

- DOCX upload path, ATS score widget, accounts, caching identical JDs, Sentry, etc.

---

*Last updated to match repo implementation: session persistence, OpenRouter, normalization layer, and Zustand hydration fixes.*
