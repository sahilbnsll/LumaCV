# LumaCV Changelog

All notable changes, architectural milestones, and version releases for LumaCV are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.15.2] - 2026-09-15

### Changed
- **Every Vercel deploy re-downloaded and re-extracted the ~50MB Typst binary from GitHub, even for doc-only or one-line changes.** `bin/` is gitignored (it has to be, the Linux and Windows binaries are platform-specific), so it doesn't exist at the start of a fresh build, only `node_modules` survives between builds via Vercel's dependency cache, keyed on the lockfile. `scripts/install-typst.mjs` now also stashes a copy under `node_modules/.cache/typst-bin/<version>/` after downloading; on a build where that cache is still warm (dependencies unchanged), it's a local file copy instead of a network fetch. Verified locally end to end: a fresh install downloads and populates the cache, a second run with `bin/` cleared restores from the cache instead of hitting the network, and the restored binary runs and reports its version correctly. Whether this actually helps on a given Vercel build depends on whether Vercel's cache was warm for that build, watch the deploy log for `[install-typst] Restoring ... from node_modules cache` vs `Downloading Typst ...` to see which happened.

---

## [2.15.1] - 2026-09-15

### Fixed
- **Downloaded PDF and Word exports were both silently corrupt.** Reported directly by a user whose downloaded `.pdf` and `.docx` files wouldn't open in anything.
  - **PDF**: whenever `POST /api/v1/resume/compile` failed, `lib/resume-export.ts` fell back to a fabricated "PDF", really just the resume's markdown text with a `%PDF-1.5 Vector PDF Stream` string prepended, not a valid PDF by any real structure, and reported a success toast anyway. No PDF reader can open it, and the false "Download complete" message hid the real failure completely. The fallback is gone: a failed compile now shows a real error (the server's actual message when available) and the export correctly reports failure instead of handing over a corrupt file.
  - **Word**: `resumeToWordHtml()` generates Word's legacy HTML-flavored document format (an `mso`-annotated HTML file, not a real OOXML package), but it was being saved with a `.docx` extension and the real OOXML MIME type. Modern Word validates a `.docx` file's actual contents against its extension and refuses to open it, "the file appears to be corrupted." Now saved as `.doc` with `application/msword`, the correct pairing for what's actually being generated, which Word opens natively. Fixed in every download menu that offers the format (editor, dashboard, homepage export demo, `/demo`, the builder), not just the one route.

### Docs
- `docs/troubleshooting.md`: added a "Downloaded PDF or Word file won't open" entry under Typst Compiler & PDF Generation, documenting the root cause and explicitly warning against reaching for another silent fallback if a similar report comes in again.
- `AGENTS.md`: added a Do Not Break entry for the export module, no fabricated fallback files on a failed compile, and keep the Word export's extension/MIME type matched to what it actually generates.
- `README.md`: corrected the Features list's "Dual export" claim (it undersold the app by two formats) to list all five real export formats.

---

## [2.15.0] - 2026-09-14

### Security
- **Added a real Content-Security-Policy and HSTS**, and consolidated every security header into `next.config.mjs`'s `headers()` as the single source of truth (`middleware.ts` previously set an overlapping, sometimes-conflicting `X-Frame-Options` of its own; it now only handles the Supabase session-cookie refresh and `X-DNS-Prefetch-Control`). The CSP's `script-src` still needs `'unsafe-inline'` (an inline JSON-LD script in the root layout, plus `image-stream-hero.tsx`'s runtime `<style>` injection), a nonce-based CSP that closes this gap is a larger, deferred follow-up, not silently dropped. `frame-src` is `'self' blob:`, not `'none'`: the resume editor's live PDF preview renders through a `blob:` URL iframe, and an initial `'none'` draft broke it, caught in testing before it shipped.
- **Closed an open-redirect / phishing vector**: an unvalidated `?redirect=`/`?next=` query param flowed into both the client-side post-login `router.push()` and, more seriously, the `emailRedirectTo` sent to Supabase for signup confirmation emails, meaning a link like `/signup?redirect=https://evil.example/phish` would carry through into a real, trusted confirmation email from this app's own domain, redirecting the victim to a phishing page after a genuine click. Added `sanitizeRedirectPath()` (`lib/app-url.ts`), which rejects absolute URLs and protocol-relative paths (`//evil.example`) and falls back to `/dashboard`; wired into both the client auth form and the server-side `/auth/confirm` route.
- **Added request validation and size limits that were missing on several routes**: `PATCH /api/v1/applications/[id]` wrote every client-supplied field straight into the database update with no shape validation beyond an `undefined` check; `POST /api/v1/applications/import-ai-map` accepted raw `headers`/`sampleRows` arrays with no bound; `POST /api/v1/resume/score`, `/resume/analyze-jd`, and `/resume/export-typ` had no request-size cap ahead of parsing and, in score's case, no `.max()` on the resume text field at all. Added Zod schemas and a content-length guard (rejecting anything over 2MB before it's parsed) to each.
- **Stopped leaking raw Postgres/internal error text to clients** on the applications and resumes CRUD routes (`error.message` from a caught Supabase exception was returned directly in the response body, which can include column/constraint names). These routes don't need that detail client-side, unlike the AI/compile/parse routes, which return genuinely actionable messages (a Typst compile error, an "analysis failed" reason) and were deliberately left as-is. The real error is now logged server-side instead.

### Fixed
- **Resume autosave silently failed 100% of the time for any session that hadn't loaded an existing saved resume** (i.e. every fresh "Start blank" or freshly-parsed-from-upload session): the editor's default draft id (`editor-<user-id>-default`, or `local-editor-default` if auth hadn't resolved yet) was never a valid UUID, but got sent straight to `POST /api/v1/resumes`, whose `id` column is `uuid`. Every autosave failed against Postgres with `22P02`, while succeeding in the localStorage fallback right next to it, hiding the failure with no visible error. Also fixed the specific case where the id got stuck on the unauthenticated fallback forever, because it was computed once in a `useState` initializer that closed over `user` before auth had actually resolved. Replaced with `defaultDraftResumeId()`, a real UUID deterministically derived from the user's own id (so the same draft slot is still resumed across visits), and switched to a `useMemo` that recomputes once auth resolves instead of a one-shot `useState`. Verified against a production build: `POST /api/v1/resumes` went from `500` to `200` for a fresh editor session.
- **The ATS-checker demo's default resume thumbnail was a raw, unoptimized 441 KB PNG** (`<img src="/templates/alex-morgan-modern.png">`, no resizing, no compression) displayed at roughly 235px wide, the single largest item in the homepage's image weight, and real cost under mobile network throttling. Switched the default thumbnail to `next/image` (responsive, auto WebP/AVIF); the one remaining plain `<img>` is for a user-dropped PDF's client-rendered `blob:` thumbnail, which `next/image` can't optimize, so it correctly stays as-is.
- Reverted `next.config.mjs`'s `optimizeCss` flag from the 2.14.0 release: it turned out not to actually defer any CSS (confirmed via a fresh trace showing identical render-blocking behavior with the flag on or off), so 2.14.0's changelog entry claiming it fixed render-blocking CSS was wrong. Corrected here rather than left standing.

### Performance
- **Deferred `useScroll`'s expensive target-element measurement** on the homepage hero (`luma-stream-hero.tsx`): Framer Motion's `useScroll(target)` synchronously measures the target's full `offsetParent` chain on setup, a real, traced forced reflow costing roughly 1.2s of the homepage's LCP render delay on a throttled mobile CPU, worsened by eight other below-the-fold sections all mounting at the same moment. Now passes no target (cheap window-scroll tracking) until the critical render window has passed, then upgrades to the real element, keeping the expensive measurement out of first paint's way without changing the scroll effect itself.
- **Scoped roughly 40 components' hover/tap/focus transitions off Tailwind's `transition-all`** and onto the specific properties each element actually animates (e.g. `transition-[background-color,border-color,box-shadow,transform]` instead of `transition-all`). `transition-all` puts every animatable property, including layout-affecting ones like `padding` and `width`, on the browser's watch list even when only a color or transform ever changes on interaction, which Lighthouse flags as a non-composited animation and which costs real main-thread work on every hover/tap. Covers the app header, user menu, auth form, theme toggle, feedback widgets, the applications board and cards, the template browser and filters, the tailor-mode picker, the builder's workflow bar, the resume editor's drag/expand states (the single most-used surface in the app), and the remaining homepage sections. Left untouched anywhere a layout property is the actual, intended animation (progress bars, step-indicator dots, the floating feedback widget's position) and the shared `Card`/`Tabs` primitives, whose consumers override `className` too unpredictably to safely narrow without auditing every call site.
- Added a `preconnect` hint for the Supabase origin: `AuthProvider` fires a `getSession()` request on every page's first mount, and nothing was warming that connection ahead of time.
- **Net measured effect** (mobile Lighthouse, PageSpeed Insights, throttled Slow 4G + 4x CPU, checked directly against production across this release, not a synthetic estimate): Performance score 63 → mid-70s/low-80s across repeated runs; Total Blocking Time 240ms → as low as 10-20ms; LCP improved substantially though it remains the most run-to-run-volatile metric, which is inherent to this test methodology on a page with a continuous scroll-driven 3D hero, not something introduced by this release.

### Docs
- Investigated a true progressive-hydration approach for the homepage's below-the-fold sections (deferring each section's hydration until idle or near-viewport, to stop them competing with the hero's LCP paint). Implemented and tested it against a production build; it does not work as hoped, React 18 does not keep a Suspense boundary's server-rendered HTML visible while a deliberately-delayed `next/dynamic` import is pending, it swaps to the fallback (blank) immediately on hydration and only remounts once the import resolves, causing a multi-second content flash worse than the problem it was meant to fix. Reverted before shipping. A real fix would need a static-HTML-shell-swapped-for-a-live-tree "islands" pattern, meaningfully more custom engineering with its own UX tradeoffs (a window where visible content isn't yet interactive); not attempted this release.
- `AGENTS.md`: corrected the Security section's now-stale claim that headers are set redundantly in both `next.config.js` and `middleware.ts` (headers are consolidated in `next.config.mjs` only, as of this release); corrected the Auth section's claim that `middleware.ts` sets "baseline security headers" (it no longer does); added the redirect-sanitization and resume-id-must-be-a-real-UUID invariants to Security / Do Not Break.
- `docs/architecture.md` §3.7: documented the CSP and HSTS headers, and the `frame-src 'self' blob:` / PDF-preview reasoning, alongside the pre-existing header list.
- `docs/deployment.md`: corrected the post-deploy `curl -I` verification section, which told readers to expect `X-Frame-Options: SAMEORIGIN` (the actual, correct value is `DENY`) and didn't mention CSP or HSTS at all; corrected a stale claim that `middleware.ts` sets the app's security headers.

---

## [2.14.0] - 2026-09-14

### Fixed
- **The homepage's "One resume. 52 looks." carousel was still loading 6.7 MB of raw images**, a separate bug from the image-stream-hero fix earlier this release cycle: a different component (`coverflow-carousel.tsx`) used raw `<img>` tags pointing directly at the full-resolution source PNGs. This is why the PageSpeed score barely moved after the first image fix, the larger of the two offenders was still live. Switched to `next/image`, confirmed via network trace that every request now routes through the image optimizer.
- **Render-blocking CSS** (~2.3s combined across two stylesheets under PageSpeed's throttling profile): enabled Next.js's `optimizeCss`, which inlines above-the-fold CSS into the HTML response instead of blocking on two full `<link>` stylesheets. Verified with a full production build and a visual pass across light/dark mode, the editor, and the templates gallery, no missing styles, no regressions.
- **Non-composited color animation** on the export-format showcase: 4 cards were animating `backgroundColor`/`color` through Framer Motion's `animate` prop, forcing a main-thread repaint every frame, even though each card's color never actually changes (it's a permanent per-card value in a deck-shuffle animation, only position/scale/opacity change). Moved the colors to a static style object instead, same visual result, zero animation cost. The download button's color genuinely does transition between formats and was left as-is rather than force a riskier visual redesign for one small element.

### Docs
- A full re-read of both PageSpeed Insights reports (not just the summary) confirmed everything else already passes or is informational only: minified CSS/JS, unused CSS, cache lifetimes, duplicated JavaScript, font-display, and Cumulative Layout Shift (a literal 0.000). An "unknown AWS endpoint" that appeared in the critical path in an earlier report was investigated and confirmed to not exist anywhere in this codebase or its dependencies, almost certainly a Search-Console test-harness artifact, not a real site issue.

---

## [2.13.0] - 2026-09-14

### Added
- **Vercel Speed Insights**, alongside the existing Analytics integration in the root layout, real Core Web Vitals data collection on every deployed page.
- Google Search Console site-verification file (`public/google55d5a1739e977f91.html`), required to claim ownership of the production domain. Per Google's own instructions, do not remove this file even after verification succeeds, it stays live as ongoing proof of ownership.

### Fixed
- **`/demo` was an orphan page**: fully built with its own metadata and listed in `sitemap.ts` at priority 0.8, but linked from nowhere on the site, neither the footer nor the mobile/guest navigation menu. Added it to both, since a page search engines can only reach via the sitemap (never through an actual link) sends a weak discovery signal.
- **`/forgot-password` and `/reset-password` had no page-specific metadata**: both were `"use client"` at the top of `page.tsx`, which structurally cannot export `metadata`, so they fell back to the generic root "LumaCV" browser tab title. Split into the same thin server `page.tsx` (metadata) + client `*-content.tsx` pattern every other page already uses. (`/settings` was deliberately left as-is, it's a pure client-side redirect, the same intentional pattern already used by `/support`.)

### Docs
- An SEO/indexing audit of the codebase (sitemap, robots.txt, canonical tags, per-page metadata, heading structure, alt text, JSON-LD, internal/broken links) found the site's actual on-page SEO already correctly implemented; the two real findings above were the only genuine gaps. If Google still isn't indexing the site after this release, the cause is outside this repository, check Vercel's Deployment Protection setting (a "Require Log In" gate blocks Googlebot exactly like it blocks anyone else), Search Console's coverage report, and domain/DNS verification.

---

## [2.12.0] - 2026-09-14

### Fixed
- **The job application tracker was completely non-functional**: `user_applications`, the table both `/api/v1/applications` routes read and write, did not exist anywhere in the live database (it was never captured in `supabase/schema.sql`, only assumed present). Every save silently fell into an error fallback that returned an empty list, so nothing anyone entered was ever actually persisted. Added the table, its RLS policies, and an index on `(user_id, updated_at)` matching the route's actual query. Migration required, see Database below.
- **`/applications` shipped 486 kB of First Load JS**, well above the ~200 kB target: the CSV/XLSX import dialog was a static import, so the `xlsx` library loaded for every visitor even if they never opened it. Lazy-loaded via `next/dynamic`, cutting the route to 373 kB.
- **No loading state on 7 routes** (dashboard, applications, editor, ats, templates, profile, billing): route transitions showed a blank screen until data finished fetching. Added `loading.tsx` skeletons built on a new shared `components/ui/skeleton.tsx`.
- **The "Skip to main content" link was broken on nearly every page**: its target, `id="main-content"`, existed on only 6 of the app's ~20 routes. Every keyboard and screen-reader user's skip link silently went nowhere on the homepage, dashboard, applications, ats, editor, builder, profile, docs, not-found, and the password-reset flow. Added the id everywhere the link needs it to land.
- **Heading order skipped a level** (h2 to h4) in the homepage's live-preview mockup; **a mobile-menu button's animated "Menu"/"Close" text didn't match its `aria-label`**, both flagged by an automated accessibility audit and fixed.
- **Several color-contrast failures below WCAG AA**, found via the same audit: white button text on the dark-mode primary blue measured 3.52:1 against a 4.5:1 requirement; the homepage hero's selectable accent-color headline text measured as low as 2.26:1 on its near-black background; two export-format badges used partially-transparent white text that could never reach 4.5:1 against their red background at any usable opacity. Fixed by splitting the dark-mode primary color into two tokens (`--primary` for backgrounds, `--primary-text` for text on dark surfaces, since no single lightness satisfies both roles), lightening the hero's accent color only for its own dark-background display (the actual resume-editor palette colors are untouched), and removing the opacity reductions on the export badges.
- Unbounded `/api/v1/resumes` and `/api/v1/applications` list queries had no upper bound at all. Added safety-cap limits (300/500 rows); the board/kanban and dashboard views still need the full set client-side for search and grouping, so this isn't full pagination.

### Changed
- Added AVIF to `next.config.mjs`'s image format priority (Next's built-in optimizer already converts template previews to WebP/AVIF on demand, this is a small additional win, not a rework of the image pipeline, which was already correctly using `next/image`).

### Database
- `supabase/schema.sql` gained the `user_applications` table (see Fixed above). **Run the updated script (or just this new section) in the Supabase SQL Editor** for the application tracker to start actually saving data.

### Docs
- `AGENTS.md`: documented the loading-state pattern, the `--primary`/`--primary-text` token split (with the reasoning, so it doesn't get collapsed back into one token later), and the sitewide `id="main-content"` requirement under "Do Not Break."

---

## [2.11.1] - 2026-09-14

### Security
- Fixed 3 Supabase database-linter warnings: `set_updated_at()` and `increment_platform_stat()` had a mutable `search_path` (added `set search_path = public`); `handle_new_user()`, `increment_platform_stat()`, and `set_updated_at()` were all `SECURITY DEFINER`/trigger-only functions callable directly via Supabase's auto-generated `/rest/v1/rpc/...` API by any `anon`/`authenticated` caller (Postgres grants `EXECUTE` to `PUBLIC` by default). `increment_platform_stat()` in particular let anyone corrupt the public homepage stats by calling it directly with an arbitrary key/amount, bypassing the app entirely. Revoked public execute on all three; the app's own server-side (service-role) calls are unaffected.
- The remaining two advisor findings were reviewed and left as-is: `feedback` table's public `INSERT`-only policy is intentional (a public feedback form with no read/update/delete access for anon), and `rls_auto_enable()` isn't defined anywhere in this repo's `schema.sql`, likely a stray function created directly in the dashboard, flagged for manual review rather than guessed at.

---

## [2.11.0] - 2026-09-14

### Added
- **Profile avatar picker**: choose from 56 predefined avatars (DiceBear "Notionists" style, MIT licensed, bundled as static SVGs — no third-party network calls at runtime) in Profile → Avatar, or keep the auto-generated initials monogram. Shows consistently in the header, account menu, and profile sidebar. Stored as `avatar_id` in both `auth.users.user_metadata` and `public.profiles` (new column, migration required — see `supabase/schema.sql`).
- **"Optimize Resume" (AI tailoring) link** added to the account dropdown menu — it was already in the mobile full-screen nav and the Cmd+K command palette, but missing from the profile dropdown, a real feature-parity gap.

### Fixed
- **Color palette dropdown clipped off-screen on mobile** (Resume Editor): it was anchored `right-0` to its trigger button, which doesn't sit near the screen's right edge on mobile, so the panel overflowed past the left edge of the viewport. Now positions relative to the viewport on mobile instead of the button.
- **Cropped text in two homepage showcase cards**: "RESUME SECTIONS (DRAG TO REORDER)" / "Live Sync" and "LIVE VECTOR OUTPUT" / "Instant Preview" each split their own text mid-word on mobile instead of wrapping as clean units; a "Deliverable" stat and the "Copy phrasing" button in another card overflowed their card for the same underlying reason (flex rows with no wrap handling). All four now wrap correctly.
- **Card-stack shadow bleeding into the format list** (export format showcase, mobile): the card fan's large soft shadow exceeded the stacked layout's gap, making the ".pdf" row look like it was sitting in the card's shadow.
- **Account dropdown menu touch targets**: rows were ~28px tall, under the 44px touch-target guideline already used elsewhere in the app; increased to `min-h-touch` with larger icons.

### Docs
- Documented the `username` and `avatar_id` `profiles` columns in `docs/supabase-setup.md`'s schema summary (both existed in code but were missing from this doc).
- Updated `AGENTS.md`'s database/file-map sections for the new `avatar_id` column and `lib/avatar-options.ts`.

---

## [2.10.0] - 2026-09-14

### Security
- **Cross-user data overwrite (IDOR)**: `POST /api/v1/resumes` and `POST /api/v1/applications` upserted a client-supplied `id` with no ownership check, so a signed-in user could pass another user's row id and overwrite their resume/application, contingent entirely on Supabase RLS being configured to catch it. Both routes now verify the existing row's `user_id` before upserting and return `404` on mismatch.
- **Unlimited account enumeration**: `POST /api/v1/auth/resolve-username` returns a real account email for any valid username and had no rate limiting. Added the same per-IP limiter the AI routes use.
- **AI cost-abuse gap**: `POST /api/v1/applications/import-ai-map` was the only AI-calling route with no rate limiting. Added it, matching the tailor/parse/analyze-jd routes' BYOK-aware policy.

### Fixed
- **Social share preview was broken**: the Open Graph/Twitter image was a 1191x1684 portrait template render mislabeled as 1200x630 in metadata, rendering cropped/broken previews on Slack, X, LinkedIn, and iMessage. Replaced with `app/opengraph-image.tsx`, a generated 1200x630 branded card that always matches its declared dimensions.
- **Homepage had no page-specific SEO metadata**: `app/page.tsx` was a `"use client"` component, which structurally cannot export `metadata`, so Google indexed the highest-value URL on the site under the generic root title. Split into a server `app/page.tsx` (metadata) + client `app/home-content.tsx` (the actual landing page), the same pattern every other page already used.
- **Two `<h1>` elements on the homepage**: both `LumaStreamHero` and `ResumeStackHero` rendered their own `<h1>`. Demoted the second to `<h2>`.
- **No root-layout error boundary**: `app/error.tsx` only catches errors thrown beneath the root layout; if `app/layout.tsx` itself threw, users got Next's unstyled default error screen. Added `app/global-error.tsx`.
- Removed the unused `swiper` dependency (zero imports anywhere in the codebase).
- Removed unused imports across ~30 files (icons, unused Radix subcomponents, etc.), confirmed via a full `tsc --noEmit --noUnusedLocals` pass.
- Removed 8 confirmed zero-import dead files: `components/buy-me-coffee.tsx`, `components/ui/buy-me-coffee.tsx` (these two additionally disagreed on the donation URL, a real trap if either got imported later), `components/resume-form.tsx`, `components/stats-social-proof.tsx`, `components/why-lumacv.tsx`, `components/kokonutui/profile-dropdown.tsx`, `components/ui/cards-stack.tsx`, `components/ui/marquee.tsx`, `components/ui/morphing-card-stack-demo.tsx`.

### Docs
- Corrected a cluster of stale claims that had drifted from the actual implementation: `docs/ats-scoring.md`'s scoring-pillar table described a "formatting compliance" pillar that was never implemented (the real weighting is `required_skills` 40% / `responsibilities` 25% / `preferred_skills` 20% / `buzzwords` 15%, per `app/api/v1/resume/score/route.ts`); `CONTRIBUTING.md`/`docs/deployment.md` described the Typst compiler as WASM (it shells out to a native CLI binary via `child_process`); several docs said "48 templates" against the real count of 52; `docs/architecture.md` still listed the removed `/api/v1/jd/analyze` route and repeated the corrected "sub-50ms" claim in three more places.
- Added the 8 real API routes missing from `docs/api-reference.md` (`resumes`, `resumes/[id]`, `applications`, `applications/[id]`, `applications/import-ai-map`, `auth/resolve-username`, `resume/export-typ`, `internal/infra-check`) — a third of the actual API surface had no documentation.
- Removed `ANTHROPIC_API_KEY` and `TYPST_BIN_PATH` from documented environment variables (README, CONTRIBUTING, deployment.md) — neither is read anywhere in the code; Claude is BYOK-only by design and the Typst binary path isn't configurable.
- Fixed a fabricated-looking changelog reference to a nonexistent `QSTASH_URL` variable (corrected to the real `UPSTASH_REDIS_REST_URL`, which genuinely is per-instance).
- Removed `walkthrough.md`, a stale single-session dev scratch note fully superseded by this changelog and `docs/ats-scoring.md`.
- Added `AGENTS.md`, a canonical technical-context document for AI coding agents (architecture, data flow, auth/security model, environment variables, and explicit "do not break" invariants). Force-added despite the project's existing `.gitignore` rule for agent-context files (which still excludes `CLAUDE.md`/`gemini.md`), since this one is meant to travel with the repo for anyone cloning it.

### Added
- `app/manifest.ts` — a web app manifest was missing despite `viewport.themeColor` already being set.

### Changed
- **Mobile fixes**: the hero resume stack was cropped/half-cut on mobile (fixed with CSS container queries instead of a fixed-px scale); the templates gallery had the resume name hidden behind its tag row and a preview modal you couldn't scroll on mobile; the resume editor's mobile header had the Import/Template buttons colliding with the candidate name; toast notifications were oversized on mobile.
- **Docs page**: added a mobile variant of the chapter "paper stack" card UI (previously desktop-only), then fixed a translucency bug in it where scrolled page content bled through the stacked cards.
- Corrected footer social links (X, LinkedIn, GitHub) and reworded the footer/billing page to make clear the project is solo-maintained and open to contributions, with a new "Contribute" link.

---

## [2.9.0] - 2026-09-13

### Fixed
- **Production Typst font resolution**: `theme.typ`'s font-sans/font-serif stacks list "Inter" and "JetBrains Mono" as the primary choice, but neither ships in Typst's own embedded fonts (only DejaVu Sans Mono, Libertinus Serif, New Computer Modern), and production (Vercel/Linux) passed no `--font-path` at all. Every sans-serif template (the majority of the 52) was silently falling through the entire font chain in production and rendering in the wrong fallback font. Bundled Inter + JetBrains Mono as single variable-font files (`typst/fonts/`, SIL OFL licensed) and wired `--font-path` on both platforms; verified a real compile now resolves both fonts with zero warnings.
- **Liquid-glass dialogs nearly opaque in light mode**: the modal overlay was a flat `bg-black/50`, which crushed the page behind a liquid-glass panel into a uniform dim with nothing left for the glass blur to actually reveal. Lightened and blurred the overlay (`bg-black/15 backdrop-blur-[2px]` in light mode) so the real page shows through, softened, behind the panel.
- **Header effectively invisible once scrolled**: the shared `AppHeader` (every page except the editor) used a flat `bg-background/95` with a very faint border, which blended almost seamlessly into a dark page once scrolled past the fold. Switched to the project's own `.glass-nav` utility (the same treatment the editor's headers already used) so every page now shares one consistent, clearly-visible header.
- **Editor header inconsistency**: the editor's two custom headers used a smaller, lighter-weight logo + wordmark (`size=22`, `font-semibold`) than every other page's shared header (`size=26`, `font-bold`, tighter tracking); unified.
- **Animation jank from layout-triggering CSS**: three progress bars animated `width` (forces reflow every frame) instead of `transform: scaleX` (GPU-composited): the AI-tailoring pipeline progress bar, the wizard stepper's connector fill, and the ATS score breakdown bars.
- **Metaballs loader console error**: `<circle> attribute cx: Expected length, "undefined"`. A redundant static `cx` prop raced with the same circle's own Framer Motion animation on mount.
- **Feedback endpoint had no rate limiting** despite emailing the admin and writing to Supabase/disk on every call: an open spam/cost vector. Added the same IP-based limiter used elsewhere.

### Changed
- **Merged `/billing` and `/support`** into one canonical `/billing` page. Both pages duplicated the same three support-method cards and UPI dialog almost verbatim. `/support` now redirects. Rebuilt with liquid-glass throughout, verified in both themes and at mobile/tablet/desktop widths.
- **Loading animations**: replaced generic `Loader2` spinners on every primary/full-page loading state with the new `Loader` component's distinctive variants, and removed the literal "document scanner" laser-sweep-and-crosshair visual from the Typst compile HUD in favor of the same component.
- **Footer wordmark**: added a cursor-following gradient reveal masked to the letter glyphs (ported from the previously-unused `InteractiveWatermark` component's technique: `mask-image` circle reveal, not a rectangle behind the text), and switched the hardcoded version string to a live GitHub releases API fetch.
- **Removed several overstated trust badges** ("100% Client-Side Privacy," "No ads, paywalls, or tracking," "Drafts persist... without an account") that didn't hold up against the app's actual auth-gated behavior for compiling/exporting/AI features; swapped for accurate copy where a claim needed replacing rather than just deleting it.
- Added a portfolio link to the footer's social row, and an explicit Dashboard link to the mobile nav's quick-link row (previously reachable only via "My Resumes" or the desktop header).
- AI Generation Mode selector (Step 2) redesigned with real icon badges and a proper radio-style selection indicator instead of a checkmark that only appeared once selected.

### Security
- Rate-limited the public `/api/v1/feedback` endpoint (IP-based, same limiter used for AI provider calls).

### Docs
- Corrected the "sub-50ms Typst compilation" claim in the README and API reference. That figure is Typst's internal typesetting time; real end-to-end request latency is dominated by process-spawn overhead (measured ~280-300ms), not typesetting. `/api/v1/resume/score` genuinely is sub-50ms Edge Runtime (pure deterministic string matching, no process spawn); that claim was accurate and left as-is.
- Fixed a stale `localhost:3000` template-gallery link and an incorrect rate-limit figure (doc said 30 req/min, code is 90) in the API reference.
- Moved `future_plans.md` into `docs/roadmap.md` for a cleaner repo root.

---

## [2.8.0] - 2026-09-13

### Fixed
- **Homepage scroll smoothness**: the hero's scroll-linked zoom used spring physics (`useSpring`) to smooth the scrubbing, which by construction settles toward a moving target; it could not be simultaneously lag-free and jitter-free no matter how it was tuned. Replaced with a damped `requestAnimationFrame` lerp (the Lenis/Apple "smooth the read, never hijack scroll" technique): a shadow progress value is nudged 12% of the way toward the real scroll position every frame, continuously trailing it rather than settling. Native scroll, momentum, and `prefers-reduced-motion` behavior are untouched.
- **Sticky header jank**: the header's `backdrop-filter` blur sat directly above the hero's continuously animating (not scroll-linked) resume-card corridor, forcing a full re-blur of that actively-changing content every frame regardless of whether the page was actually scrolling. Removed the blur entirely in favor of a near-opaque background.
- **Navigation drawer scroll lag**: the full-screen nav's glass panel and scrim were re-blurring the still-animating hero corridor behind them the entire time the drawer was open, competing with the drawer's own list scroll for frame budget. The corridor's CSS animation now pauses (`animation-play-state: paused`) the instant the drawer opens via a `nav-open` body class, and resumes on close. Also dropped the panel's blur from a heavy `2xl` radius to `md`, and removed a permanently-held `will-change: transform, opacity` on every list item that kept 8–10 GPU layers alive indefinitely after their entrance animation finished.
- **MIT License link**: footer linked to `blob/main/LICENSE` on a repo whose default branch is `master`, producing a 404. Corrected to `blob/master/LICENSE`.

### Changed
- **Nav drawer open/close timing**: slowed and re-eased the GSAP timeline (panel slide 0.32s/0.22s → 0.6s/0.5s, using the same Apple-style `[0.16, 1, 0.3, 1]` deceleration curve already defined elsewhere in the app) so it reads as a deliberate glide instead of a snap; removed the "Open Source" header label and "Typst Vector Engine" status line as unnecessary chrome.
- Added the site footer to the resume editor workspace page (`/editor`), which previously had none.

### Docs
- `.env.example`: clarified that `UPSTASH_REDIS_REST_URL` is unique per Upstash database instance/region (not a fixed global endpoint) and must be copied from each account's own Upstash console; documented the previously-undocumented `FEEDBACK_NOTIFICATION_EMAIL` / `FEEDBACK_RECIPIENT_EMAIL` aliases the feedback-email code already read.

---

## [2.7.0] - 2026-09-13

### Fixed
- **Username Sign-In**: Fixed a data-sync bug where changing your username from Settings updated Supabase auth metadata but never reached the `public.profiles` table username login actually queries against, so a saved username could never resolve at sign-in. Settings now writes both; the DB trigger that seeds `public.profiles` on sign-up now also fires on profile updates.
- **REST API Reference accuracy**: Corrected documented endpoints, request bodies, and response shapes in `/docs` to match the real route handlers (`/api/v1/resume/compile`, not a `/typst/compile` that never existed; real field names for parse/tailor/score).
- **Per-page metadata**: `/dashboard`, `/applications`, `/billing`, and `/profile` previously fell back to the generic root `<title>LumaCV</title>` and had no page-specific Open Graph data. Each now has its own browser-tab title, description, and OG/Twitter metadata, and is marked `noindex` as private workspace pages.
- **Apple touch icon**: was pointed at an SVG, which iOS home-screen bookmarking doesn't render; now points at the PNG mark.

### Changed
- **Docs page rebuilt**: replaced the 3-column sidebar/tabs/TOC layout with a single continuous reading column and a right-hand rail of chapter cards that stack and animate in sync with real scroll position (not estimated scroll distance); the active card always matches the chapter actually on screen. Removed every decorative eyebrow-pill/badge across the site (homepage, docs, billing, support, applications, templates, contact, terms, privacy) per an ongoing "no cheap AI-looking chrome" pass.
- **Kinetic navigation drawer**: rebuilt as a plain-CSS sticky/GPU-accelerated slide instead of a framer-motion `layout` animation, which doesn't support `position: sticky` reliably; fixed a header/backdrop desync bug in the process.
- **Magnetic dock**: replaced per-icon rainbow gradients with flat, single-tone tiles that hold up in both light and dark mode.

### Removed
- All residual internal references to the "reactive-resume" reference clone used during earlier development (`tsconfig.json`, `.eslintrc.json`, `.gitignore`, code comments). Nothing shipped ever depended on it; this was just dev-tooling residue.

---

## [2.6.0] - 2026-09-13

### Added
- **Atmospheric Dual-Mode Moving Contour Lines**: Replicated the dark mode background effect in light mode (`FloatingPathsBackground`) with delicate Apple slate tones (`text-slate-400`), smooth cross-theme transitions, and calibrated background opacities (`opacity-25` light / `opacity-35` dark) that never interfere with foreground legibility.
- **Universal Kinetic Menu Drawer (`FullScreenNav`)**: Added full-screen kinetic navigation with rotating glyph trigger (`KineticMenuButton`) accessible across all pages, including the resume editor toolbar, auth screens, templates, and dashboard.
- **10 Categorized Navigation Destinations**: Expanded menu drawer with rich route badges (`Live Workstation`, `Interactive Gallery`, `Free Tier & Pro`, `Community Backing`, etc.) and real-time interactive SVG ambient shape hover micro-interactions.
- **Apple-Grade Fluid Spring Physics**: Calibrated GSAP transitions and timeline staggers with Apple natural curve (`cubic-bezier(0.16, 1, 0.3, 1)`) for buttery smooth, instant responsiveness with zero input delay.
- **Elevated Magnetic Floating Dock**: Refined dock physics, high-contrast glass backdrop, curated vibrant gradient badges, and pure white icons with specular highlights.
- **Unified Support & Sustainability Suite**: Redesigned `/billing` and `/support` with a centralized Apple-grade glassmorphic UPI donation dialog featuring dynamic QR code generation, real-time custom amount validation, and 1-tap copy, unified with Buy Me a Coffee and GitHub Sponsors.

### Improved
- **Light & Dark Mode Contrast Harmony**: Refined card elevation, grouped background tokens, and frosted glass navigation across all viewports.
- **Full 52-Template Visual Support**: Verified complete compilation, metadata, and asset pipeline for all 52 Typst resume archetypes.

---

## [2.5.0] - 2026-03-12

### Added
- **Modern 3-Column Documentation Hub**: Replaced flat docs layout with a 3-column layout featuring a sticky categorized navigation sidebar, top domain switcher tabs, and a sticky right-hand "On this page" TOC with real-time ScrollSpy.
- **Spotlight Command Palette (`⌘K` / `/`)**: Fast in-browser fuzzy search across all documentation chapters, REST API endpoints, Typst systems, and BYOK providers with keyboard navigation (`↑`/`↓`/`Enter`/`Esc`).
- **Interactive REST API Reference**: Comprehensive specifications for `/api/v1/resume/parse`, `/tailor`, `/score`, and `/typst/compile` with request parameter schemas, headers tables, and multi-language snippets (`cURL`, `TypeScript`, `Python`).
- **Interactive BYOK Playground**: Live provider switcher for Google Gemini 2.5, OpenAI GPT-4o, Anthropic Claude 3.5, and Groq Cloud with latency benchmarks and context token limits.
- **Docker Compose Self-Hosting Specification**: Added standardized `docker-compose.yml` configuration for single-command deployment with pre-installed Typst binary.
- **Project Changelog**: Comprehensive chronological release tracker integrated directly into the documentation interface and repository root.

### Fixed & Hardened
- **ATS Keyword Object Leakage**: Purged `[object Object]` stringification in `normalize-jd.ts`, `app/api/v1/resume/score/route.ts`, and `app/api/v1/resume/tailor/route.ts`.
- **Store Hydration Defense**: Added defensive validation in `lib/store.ts` (`merge` and `setAnalysis`) to automatically purge corrupted scores from browser `localStorage`.
- **Build & Dev Runtime Isolation**: Resolved Webpack cache runtime conflicts between `next build` and active development server instances.

---

## [2.4.0] - 2026-02-18

### Added
- **Deterministic 4-Vector ATS Scoring**:
  - Required Skills & Technical Toolchains (Weight: 40%)
  - Responsibilities & Action Verbs (Weight: 25%)
  - Preferred Skills & Methodologies (Weight: 20%)
  - Industry Terminology & Nomenclature (Weight: 15%)
- **Bullet Diff Studio**: Side-by-side visual diff inspector in Step 4 allowing candidates to review and selectively revert individual tailored bullets with 1 click.
- **ATS Keyword Categorization**: Real-time breakdown of Missing, Partial, and Matched requirements with clear rationale.

### Security
- **Anti-Hallucination Guardrails**: Implemented immutable ground-truth verification in `lib/fact-validator.ts` preventing AI models from inventing employers, degrees, or employment dates.

---

## [2.3.0] - 2026-01-20

### Added
- **Client-Side BYOK (Bring Your Own Key)**:
  - Google Gemini (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite`)
  - OpenAI (`gpt-4o`, `gpt-4o-mini`, `o3-mini`)
  - Anthropic Claude (`claude-3-5-sonnet`, `claude-3-5-haiku`)
  - Groq Cloud (`qwen/qwen3.6-27b`, `llama-3.3-70b-versatile`)
- **Encrypted Local Storage**: BYOK keys persist exclusively in browser encrypted `localStorage` (`luma_byok_keys`) and pass directly through TLS request headers (`x-gemini-api-key`, etc.). Zero server-side key retention.

---

## [2.2.0] - 2025-12-10

### Changed
- **Typst Native Compilation Engine**: Replaced Puppeteer and headless Chromium with the native Rust Typst binary.
- **Latency Optimization**: Reduced PDF generation latency from ~3,500ms to 15ms–45ms.
- **Vector PDF Output**: 100% crisp vector rendering with native mathematical page-break fitting and zero rasterization artifacts.

### Added
- **48 Typst Template Systems**:
  - ATS-Optimized Archetype (13 templates)
  - Modern & Tech Archetype (10 templates)
  - Executive & Advisory Archetype (10 templates)
  - Editorial & Creative Archetype (10 templates)
  - Academic & Research Archetype (5 templates)
- **Typst Source Code Export**: Direct `.typ` source download for local compilation and version control.

---

## [2.1.0] - 2025-11-15

### Added
- **In-Browser Web Worker PDF Extraction**: Uses Mozilla `pdfjs-dist` to parse uploaded PDF text and hyperlinks locally in the browser without server uploads.
- **Schema Recovery & Validation**: Strict Zod schemas paired with `jsonrepair` to recover malformed JSON responses from LLM endpoints.

---

## [2.0.0] - 2025-10-01

### Added
- **Initial Open Source Release**: Full platform release under the permissive MIT License.
- **PostgreSQL Row Level Security (RLS)**: Isolated candidate workspaces enforcing `auth.uid() = user_id`.
- **SSR Cookie Sessions**: Authentication managed via `@supabase/ssr` with Edge middleware verification.
- **Semantic Design Tokens**: Full dark/light mode design system built with Tailwind CSS.
