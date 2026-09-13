# LumaCV Changelog

All notable changes, architectural milestones, and version releases for LumaCV are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.8.0] - 2026-09-13

### Fixed
- **Homepage scroll smoothness**: the hero's scroll-linked zoom used spring physics (`useSpring`) to smooth the scrubbing, which by construction settles toward a moving target — it could not be simultaneously lag-free and jitter-free no matter how it was tuned. Replaced with a damped `requestAnimationFrame` lerp (the Lenis/Apple "smooth the read, never hijack scroll" technique): a shadow progress value is nudged 12% of the way toward the real scroll position every frame, continuously trailing it rather than settling. Native scroll, momentum, and `prefers-reduced-motion` behavior are untouched.
- **Sticky header jank**: the header's `backdrop-filter` blur sat directly above the hero's continuously animating (not scroll-linked) resume-card corridor, forcing a full re-blur of that actively-changing content every frame regardless of whether the page was actually scrolling. Removed the blur entirely in favor of a near-opaque background.
- **Navigation drawer scroll lag**: the full-screen nav's glass panel and scrim were re-blurring the still-animating hero corridor behind them the entire time the drawer was open, competing with the drawer's own list scroll for frame budget. The corridor's CSS animation now pauses (`animation-play-state: paused`) the instant the drawer opens via a `nav-open` body class, and resumes on close. Also dropped the panel's blur from a heavy `2xl` radius to `md`, and removed a permanently-held `will-change: transform, opacity` on every list item that kept 8–10 GPU layers alive indefinitely after their entrance animation finished.
- **MIT License link**: footer linked to `blob/main/LICENSE` on a repo whose default branch is `master`, producing a 404. Corrected to `blob/master/LICENSE`.

### Changed
- **Nav drawer open/close timing**: slowed and re-eased the GSAP timeline (panel slide 0.32s/0.22s → 0.6s/0.5s, using the same Apple-style `[0.16, 1, 0.3, 1]` deceleration curve already defined elsewhere in the app) so it reads as a deliberate glide instead of a snap; removed the "Open Source" header label and "Typst Vector Engine" status line as unnecessary chrome.
- Added the site footer to the resume editor workspace page (`/editor`), which previously had none.

### Docs
- `.env.example`: clarified that `QSTASH_URL` is provisioned per-region by Upstash (not a fixed global endpoint) and must be copied from each account's own QStash console; documented the previously-undocumented `FEEDBACK_NOTIFICATION_EMAIL` / `FEEDBACK_RECIPIENT_EMAIL` aliases the feedback-email code already read.

---

## [2.7.0] - 2026-09-13

### Fixed
- **Username Sign-In**: Fixed a data-sync bug where changing your username from Settings updated Supabase auth metadata but never reached the `public.profiles` table username login actually queries against — so a saved username could never resolve at sign-in. Settings now writes both; the DB trigger that seeds `public.profiles` on sign-up now also fires on profile updates.
- **REST API Reference accuracy**: Corrected documented endpoints, request bodies, and response shapes in `/docs` to match the real route handlers (`/api/v1/resume/compile`, not a `/typst/compile` that never existed; real field names for parse/tailor/score).
- **Per-page metadata**: `/dashboard`, `/applications`, `/billing`, and `/profile` previously fell back to the generic root `<title>LumaCV</title>` and had no page-specific Open Graph data. Each now has its own browser-tab title, description, and OG/Twitter metadata, and is marked `noindex` as private workspace pages.
- **Apple touch icon**: was pointed at an SVG, which iOS home-screen bookmarking doesn't render — now points at the PNG mark.

### Changed
- **Docs page rebuilt**: replaced the 3-column sidebar/tabs/TOC layout with a single continuous reading column and a right-hand rail of chapter cards that stack and animate in sync with real scroll position (not estimated scroll distance) — the active card always matches the chapter actually on screen. Removed every decorative eyebrow-pill/badge across the site (homepage, docs, billing, support, applications, templates, contact, terms, privacy) per an ongoing "no cheap AI-looking chrome" pass.
- **Kinetic navigation drawer**: rebuilt as a plain-CSS sticky/GPU-accelerated slide instead of a framer-motion `layout` animation, which doesn't support `position: sticky` reliably; fixed a header/backdrop desync bug in the process.
- **Magnetic dock**: replaced per-icon rainbow gradients with flat, single-tone tiles that hold up in both light and dark mode.

### Removed
- All residual internal references to the "reactive-resume" reference clone used during earlier development (`tsconfig.json`, `.eslintrc.json`, `.gitignore`, code comments) — nothing shipped ever depended on it, this was just dev-tooling residue.

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
