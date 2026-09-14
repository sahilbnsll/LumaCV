# AGENTS.md — LumaCV Technical Context for AI Coding Agents

This document is the canonical, fast-onboarding technical map of this repository. It's written for an AI agent (or a human) picking up this codebase cold. It is kept synchronized with the real implementation — if you change something this file describes, update the relevant section in the same change.

For deeper detail beyond what's here, see `docs/architecture.md`, `docs/api-reference.md`, `docs/ai-pipeline.md`, `docs/ats-scoring.md`, `docs/supabase-setup.md`, `docs/deployment.md`, `docs/troubleshooting.md`. This file is the index and the "why," not a replacement for them.

---

## WHAT

LumaCV is a free, open-source resume-building SaaS. A user pastes/uploads an existing resume (or starts blank), the app extracts and structures it, optionally tailors the bullet content against a target job description using an LLM, scores it against that job description with a deterministic (non-AI) ATS algorithm, and renders it to a vector PDF using the Typst typesetting engine — not a browser-to-PDF screenshot, not LaTeX.

## WHY

Most resume builders either (a) fake "ATS optimization" with vague, unverifiable scoring, or (b) let an LLM rewrite a resume with no guardrail against inventing job titles, dates, or metrics the candidate never had. LumaCV's whole design center is: **the AI can rephrase, it cannot invent.** Every AI-tailored resume is diffed against the original and run through `lib/fact-validator.ts`, which strips/reverts anything not traceable to the source resume. The ATS score is a plain deterministic keyword-match formula (see ATS section below), not another opaque model call, so the number is reproducible and explainable.

## HOW (high-level flow)

1. **Extraction** (client-side, no upload): `lib/document-parser.ts` extracts text from a PDF (`pdfjs-dist`) or DOCX (`mammoth`) entirely in the browser. The file itself never reaches the server, only the extracted plaintext does, and only when the user proceeds to parse/tailor.
2. **Parse**: `POST /api/v1/resume/parse` turns that plaintext into structured `ResumeData` (Zod-typed, `lib/resume-schema.ts`) via an LLM call.
3. **JD analysis** (optional): `POST /api/v1/resume/analyze-jd` extracts `required_skills` / `preferred_skills` / `responsibilities` / `buzzwords` from a pasted job description.
4. **Tailor**: `POST /api/v1/resume/tailor` rewrites bullets/summary either in JD-alignment mode or JD-free "optimize" mode, in the same completion as JD extraction when the caller only sent raw JD text. Output is fact-checked (`lib/fact-validator.ts`) before it's returned.
5. **Score**: `POST /api/v1/resume/score` computes a deterministic 0-100 ATS score (Edge runtime, no AI call), see the ATS section below.
6. **Compile**: `POST /api/v1/resume/compile` generates Typst markup (`lib/typst-generator.ts` + `typst/` templates) and spawns the native Typst CLI binary to produce a vector PDF.
7. **Persist**: authenticated users can save resumes/applications to Supabase (`/api/v1/resumes`, `/api/v1/applications`); guests keep everything in `localStorage`/Zustand only.

## WHERE important functionality lives

| Concern | Location |
|---|---|
| Resume/JD/template/theme types (source of truth) | `lib/resume-schema.ts` |
| LLM provider abstraction + fallback chain | `lib/llm-client.ts` |
| Anti-hallucination fact checking | `lib/fact-validator.ts` |
| JD keyword extraction | `lib/jd-analysis.ts` |
| Typst code generation | `lib/typst-generator.ts`, `lib/typst-layout.ts`, `typst/` |
| Typst CLI process execution | `lib/compiler-service.ts` |
| Deterministic ATS scoring | `app/api/v1/resume/score/route.ts` |
| Auth guard for API routes | `lib/auth.ts` (`requireUser()`) |
| Supabase client factories | `lib/supabase/server.ts` (server), `lib/supabase/client.ts` (browser) |
| Rate limiting | `lib/rate-limit.ts` (Upstash-backed `ratelimit`, plus an in-memory `compileRatelimit` for the compile route) |
| BYOK key extraction from request headers | `lib/ai-keys.ts` |
| Client-side document parsing | `lib/document-parser.ts`, `lib/pdf-parser.ts` |
| Global client state | `lib/store.ts` (Zustand: current resumeData/template/theme) |
| Toast/notification helper | `lib/notify.ts` |
| Predefined profile avatar options | `lib/avatar-options.ts` (56 static SVGs in `public/avatars/`, DiceBear "Notionists" style) |
| Design tokens (palettes, motion easings) | `lib/design-tokens.ts`, `lib/motion.ts` |
| Route-transition loading states | `app/*/loading.tsx` (skeletons built from `components/ui/skeleton.tsx`); most top-level routes have one, add one for any new route with a non-trivial data fetch |
| Main resume editor UI | `components/compact-resume-editor.tsx` |
| Builder 4-step wizard | `app/builder/step1-jd.tsx` .. `step4-preview.tsx` |
| Shared design system primitives | `components/ui/` (Radix + shadcn) |

## ARCHITECTURE

- **Framework**: Next.js 14.2 (App Router), React 18, TypeScript, Tailwind CSS 4.
- **Rendering**: almost everything under `app/*/page.tsx` is a thin server component carrying `metadata`, rendering a co-located `"use client"` `*-content.tsx` component that does the actual interactive work. This split exists specifically so pages can have real per-page SEO metadata (`export const metadata`) while the interactive UI stays client-rendered — a client component cannot export `metadata`, and most of this app's real functionality (forms, live preview, Zustand state) needs to be client-side. Follow this pattern for any new page.
- **State management**: Zustand (`lib/store.ts`) for the resume being edited (client-only, not synced automatically — see Data Flow). React Hook Form + Zod for form validation. No Redux, no React Query — data fetching is plain `fetch()` in `useEffect`/handlers.
- **Styling**: Tailwind utility classes against CSS custom-property design tokens (`app/globals.css`) so components adapt to light/dark automatically. Framer Motion is the primary animation library (28+ files); GSAP is used in exactly one place (`components/full-screen-nav.tsx`, an imperative open/close timeline) — these are not redundant, don't consolidate them.
- **`--primary` vs `--primary-text`**: `--primary` is tuned for `bg-primary` (buttons/fills, needs to stay dark enough for white text at 4.5:1). `--primary-text` is a separate token for the primary blue used directly as text color on a dark surface (small labels/badges), where a darker `--primary` would fail contrast instead. No single lightness satisfies both roles at once (verified), so don't collapse these back into one token — use `text-primary-text`, not `text-primary`, for primary-colored text sitting on a dark/near-black background.
- **No ORM**: Supabase JS client (`@supabase/supabase-js` / `@supabase/ssr`) executes queries directly against Postgres via PostgREST. Schema lives in `supabase/schema.sql`, protected by Row Level Security policies (every `user_*` table is scoped to `auth.uid()`).

## DATA FLOW

- A resume being actively edited lives in the Zustand store (`lib/store.ts`), **not** in a database row, until autosave fires. `components/compact-resume-editor.tsx` and `app/editor/editor-content.tsx` debounce-save to `localStorage` (`lib/user-resumes-store.ts`) always, and additionally `POST /api/v1/resumes` when the user is signed in.
- Guests get full functionality (parse, tailor, score, compile, export) except cloud save/sync and the application tracker — those require auth.
- BYOK API keys are **never persisted server-side**. They travel once per-request as `x-<provider>-api-key` headers (`lib/ai-keys.ts` reads them), get used for that single LLM call, and are discarded. If absent, the route falls back to the platform's own server-side keys (rate-limited) — except Anthropic Claude, which is BYOK-only with no server-side fallback key at all.

## DATABASE

Supabase Postgres. Key tables (`supabase/schema.sql`): `profiles` (username↔email mapping for username-login, plus `avatar_id` — one of `lib/avatar-options.ts`'s fixed predefined-avatar ids, null means show initials; one row per `auth.users` row), `user_resumes`, `user_applications`, `feedback`, `platform_stats`. Every `user_*` table has an RLS policy scoping reads/writes to `auth.uid() = user_id`.

**Do not rely on RLS alone from application code.** Two POST routes (`/api/v1/resumes`, `/api/v1/applications`) accept a client-supplied `id` for upserts; both now explicitly verify the existing row's `user_id` before upserting (added in this audit — see DO NOT BREAK). If you add another upsert-by-client-id endpoint, copy that ownership-check pattern, don't assume RLS is configured to catch it.

## API

15 routes under `app/api/v1/`. Full request/response contracts: `docs/api-reference.md`. Summary of the auth/rate-limit model, since that's the part most likely to matter when adding a new route:

- **Auth**: `requireUser()` (`lib/auth.ts`) calls `supabase.auth.getUser()` server-side — it validates the session cookie against Supabase, it does not trust anything the client claims about its own identity. Every route that touches user-owned data calls this first.
- **Rate limiting**: `ratelimit` from `lib/rate-limit.ts` (Upstash, 10 req/15min) guards every AI-calling route by IP, skipped when the caller supplies their own BYOK key (their own cost, their own limit). **This fails open if `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are unset** — every "rate-limited" route becomes silently unlimited. Always set these in production.
- **Validation**: Zod schemas (`TailorResumeRequestSchema`, `AnalyzeJDRequestSchema`, etc. in `lib/resume-schema.ts` or inline) validate AI-route input. `/applications` and `/resumes` POST routes use manual field checks, not Zod — lower priority to fix but worth Zod-ifying if you're touching those files anyway.
- **`middleware.ts` does not gate any API route.** It only refreshes the Supabase session cookie and sets `X-DNS-Prefetch-Control`. Authorization is 100% the individual route's responsibility.

## FRONTEND

- **Pages needing their own SEO metadata must be a server `page.tsx` + client `*-content.tsx` pair** (see Architecture). The homepage (`app/page.tsx` + `app/home-content.tsx`) is the canonical example of this split for a page that used to be 100% client.
- **Design tokens over arbitrary values**: colors/spacing should reference the semantic tokens already defined in `app/globals.css` (`bg-background`, `text-foreground`, `border-border`, palette-driven `primary`, etc.), not hardcoded hex or arbitrary Tailwind values, so both themes and the accent-palette system keep working.
- **Toasts**: use `lib/notify.ts`'s helpers (`notify.success/error/info/...`), not `sonner` directly — it encodes the app's Apple-HIG-inspired toast conventions (short action title + optional one-line context, deduped within 1.5s). Toast dimensions/spacing are controlled by a `[data-sonner-toast]` override block in `app/globals.css`, not by the component's own Tailwind `classNames` prop — same-specificity `!important` CSS resolves by source order, and that override block wins. If you need to change toast sizing, edit `globals.css`, not `components/ui/sonner.tsx`.
- **Standing UI requirements** (apply to every UI change, not just new features): must work in both light and dark mode, and must be responsive across mobile/tablet/desktop. Never reintroduce em-dash (`—`) characters in code, comments, or copy.

## AI

- **Provider abstraction**: `lib/llm-client.ts`. Fallback order when using platform (non-BYOK) keys: Groq → Gemini → Mistral → OpenRouter → OpenAI → GitHub Models, each with its own light/heavy model pool (`TaskType = 'heavy' | 'light'`). BYOK requests are routed to the specific provider the user supplied a key for. Anthropic Claude is BYOK-only.
- **Streaming**: `generateStream()` returns a text stream; routes collect it (`collectStream`) rather than proxying token-by-token to the client — the client sees a single JSON response, not an SSE stream.
- **JSON robustness**: model output is parsed with `JSON.parse`, falling back to `jsonrepair` on failure (models occasionally emit near-valid JSON — trailing commas, unquoted keys). Both `tailor` and `import-ai-map` routes do this.
- **Anti-hallucination**: `validateAndCleanTailoredResume()` (`lib/fact-validator.ts`) runs after every tailor call and strips anything not verifiable against the source resume, before the response is returned. Don't bypass this to "simplify" the tailor route.
- **Cost control**: the `tailor` route's `generateStream` call includes a `validate` callback that rejects a syntactically-valid-but-gutted response (empty resume where the source had content) and retries the next model in the fallback pool, instead of returning a hollow "success."

## AUTH

Supabase Auth (`@supabase/ssr`), email/password plus optional username-based sign-in (`profiles.username` → email lookup via `/api/v1/auth/resolve-username`, rate-limited since it discloses a real account email for a valid username). Session state is cookie-based; `middleware.ts` refreshes it on every request. `requireUser()` is the only sanctioned way to check auth inside an API route — don't read cookies/headers manually to infer identity.

## SECURITY

- **Never trust client-supplied ids for ownership**. See the Database section — both resume/application upserts now verify ownership server-side before writing.
- **Never echo secrets or raw provider error text to the client**. The applications/resumes CRUD routes log the real error server-side and return a generic message only. The AI, compile, and parse routes are the deliberate exception: their `details: error.message` is a genuinely actionable message for the user (a Typst compile error, a parse failure reason), not an info-disclosure gap, don't "fix" those into generic messages, and don't add `error.message` passthrough to any other route without the same justification.
- **Any `?redirect=`/`?next=`-style query param must go through `sanitizeRedirectPath()`** (`lib/app-url.ts`) before it's used in a client-side navigation or, especially, a server-side `emailRedirectTo`/redirect URL. An unvalidated one is an open redirect that can turn this app's own trusted confirmation emails into a phishing vector, not just a theoretical low-severity issue, it was a real, live bug fixed in 2.15.0.
- **The demo/compile bypass**: `POST /api/v1/resume/compile` skips auth only for one exact, hardcoded payload (`personalInfo.name === "Alex Morgan"`, the sample demo resume) so the public `/demo` page can compile without a session. It's still bound by the in-memory `compileRatelimit`. Don't widen this bypass condition.
- **`/api/v1/internal/infra-check`** is gated by a shared-secret header (`COMPILE_WORKER_SECRET`) checked against the env var, fails closed if unset. It is not meant to be called by the client app — don't wire it into any user-facing flow.
- **Security headers (CSP, HSTS, `X-Frame-Options`, etc.) are set in `next.config.mjs`'s `headers()` only**, the single source of truth as of 2.15.0. `middleware.ts` used to set an overlapping, occasionally-conflicting `X-Frame-Options` too; that duplication was removed, don't reintroduce it there. If you change the CSP, remember `frame-src` must keep `'self' blob:` (the editor's PDF preview renders through a `blob:` iframe, `'none'` silently breaks it with no console-visible layout symptom until you actually check DevTools).

## DEPLOYMENT

Vercel (recommended) — see `docs/deployment.md` for Docker/VPS alternatives. The Typst CLI binary ships from `bin/` (installed by the `postinstall` script `scripts/install-typst.mjs`) and is included in serverless function bundles via `experimental.outputFileTracingIncludes` in `next.config.js` — if you move `bin/` or `typst/`, update that config too, or compiles will 500 in production while working locally. Compilation shells out to a native binary via `child_process.spawn`; there is no WASM path (older docs said otherwise — corrected).

## ENVIRONMENT

Server-only (never exposed to the client): `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`/`SUPABASE_ANON_KEY` (server-side aliases, distinct from the `NEXT_PUBLIC_` ones), `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY`, `MISTRAL_API_KEY`, `OPENROUTER_API_KEY`, `GITHUB_MODELS_TOKEN`/`GITHUB_TOKEN`, `UPSTASH_REDIS_REST_URL`/`TOKEN`, `COMPILE_WORKER_SECRET`, `RESEND_API_KEY`, `FEEDBACK_*_EMAIL` vars, `APP_BASE_URL`, `VERCEL_URL`.

Client-exposed (`NEXT_PUBLIC_` prefix, intentionally public): `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the anon key is meant to be public; RLS is what actually protects data), `NEXT_PUBLIC_UPI_ID`, `NEXT_PUBLIC_BUYMEACOFFEE_URL`, `NEXT_PUBLIC_GITHUB_SPONSORS_URL`.

There is **no `ANTHROPIC_API_KEY`** (Claude is BYOK-only, don't add a server-side fallback for it without a deliberate product decision) and **no `TYPST_BIN_PATH`** (the binary path is resolved automatically, not configurable). Older docs claimed both existed; corrected in this audit.

## TESTING

**There is no automated test suite** — no Jest/Vitest/Playwright/Cypress in `package.json`. What exists are manual verification scripts in `scripts/` (`verify-routes.mjs`, `verify-apis.mjs`, `audit-all-templates.mjs`, `test-visual-regression.mjs`, `deep-verify-templates.mjs`) run by hand, not in CI. Before considering any change complete, at minimum run `npx tsc --noEmit -p .` and `npm run build`; for anything touching the Typst templates, also run the relevant `scripts/*.mjs` verifier. If you add real tests, this section should be rewritten to describe how to run them — don't leave it stale.

## CONVENTIONS

- Comments explain **why**, not what — a hidden constraint, a past bug, a non-obvious ordering requirement. Don't add comments that restate the code.
- No em-dashes (`—`) anywhere in code, comments, or UI copy — a standing project-wide rule, not a one-off request.
- Prefer editing existing files/patterns over introducing a new library or abstraction. This repo already has zero test framework, minimal external state-management, and one animation library doing 95% of the work — don't add a second one "just because."
- `lib/notify.ts`, not raw `sonner`, for toasts (see Frontend section).

## DO NOT BREAK

- The fact-validation step in the tailor pipeline (`lib/fact-validator.ts`) — this is the entire trust proposition of the product. Any change to the tailor route must keep calling `validateAndCleanTailoredResume()` on the AI output before it reaches the client.
- The ownership checks in `/api/v1/resumes` and `/api/v1/applications` POST handlers (client-supplied `id` must be verified against `user_id` before upsert) — removing these reopens a cross-user data-overwrite bug.
- `requireUser()` on every route that reads/writes user-owned data. If a route looks like it should be public, double-check that's actually intended (see the compile-route demo bypass for the one deliberate, narrowly-scoped exception) rather than assuming missing auth is fine.
- `app/opengraph-image.tsx`'s declared `size` (1200×630) must match what it actually renders — this is what fixed a previously-broken, wrong-aspect-ratio social preview image. If you replace it with a static asset again, the asset must genuinely be 1200×630.
- The `outputFileTracingIncludes` config in `next.config.js` for `bin/` and `typst/` — removing it silently breaks PDF compilation in production only (works fine in `next dev`).
- `id="main-content"` on every top-level route's primary `<main>` — the root layout's "Skip to main content" link (`app/layout.tsx`) targets this id sitewide. It was missing on most routes for a long time with no visible symptom (only a broken keyboard/screen-reader skip link), so a new page's `<main>` needs this id added explicitly, nothing enforces it automatically.
- Any resume/application `id` sent to `POST /api/v1/resumes` or `/api/v1/applications` must be a real UUID, the `id` columns are Postgres `uuid`. The editor's own client-generated default-draft id used to be a plain string (`editor-<uid>-default`), which silently 500'd on every autosave for a brand-new session while the localStorage fallback right next to it succeeded, masking the failure entirely. Use `defaultDraftResumeId()` (`lib/user-resumes-store.ts`) for any new client-side-generated id in this flow, don't hand-roll another string scheme.

## CHANGE PROCESS

1. Understand the existing pattern before adding a new one — grep for how a similar problem is already solved elsewhere in the repo (there is very likely a precedent).
2. For anything security-sensitive (auth, rate limiting, data ownership), trace the actual server-side enforcement yourself; don't assume a check exists because the client behaves correctly.
3. Keep documentation and code in sync in the same change — this file, `docs/*.md`, `README.md`, and `CHANGELOG.md` are cross-checked periodically (see the audit this file resulted from) and drift was a real, repeated problem before.

## VALIDATION

Before considering any change complete, run:
```bash
npx tsc --noEmit -p .
npm run build
npm run lint
```
All three should be clean (lint may report pre-existing warnings — mostly unused imports and `any` usage in older files — but should introduce no new ones). There is no test suite to run (see Testing). For UI changes, manually verify in both light and dark mode and at mobile/tablet/desktop widths — there's no automated visual regression coverage for most of the app.
