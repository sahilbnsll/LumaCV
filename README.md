# LumaCV — Open-Access AI Career Optimization & Resume Platform

LumaCV is a fast, authentic career utility that tailors your existing resume directly to any target job description. It preserves 100% of your real-world facts with zero hallucinations, scores alignment across four deterministic ATS vectors, and compiles pixel-perfect PDFs in milliseconds using a native vector typesetting engine.

---

## Key Capabilities

- **100% Fact-Checked Tailoring**: Re-aligns bullet points and elevates relevant metrics while strictly preserving your factual employment history. Zero invented employers, dates, skills, or achievements.
- **Sub-50ms Vector Compilation**: Powered by **Typst** — compiles crisp vector resumes in **< 50ms** locally and in serverless environments without heavy LaTeX runtimes.
- **6 Executive-Grade Templates**:
  - **Modern**: Clean sans-serif layout with contact icons and subtle accent rules (flagship tech style).
  - **Classic**: Harvard/Ivy-League style serif layout with elegant horizontal dividers.
  - **Engineering**: High-density dual-tone layout optimized for infrastructure and software engineers.
  - **Compact**: Space-optimized single-page layout for candidates with 5+ roles.
  - **Two-Column**: Asymmetric layout with skills and contact sidebar.
  - **ATS-Safe**: 100% linear text extraction format designed for strict enterprise applicant tracking systems.
- **8 Curated Color Palettes**: Default (Slate), Navy, Cobalt, Emerald, Burgundy, Teal, Graphite Slate, and High-Contrast Black.
- **Deterministic 4-Vector ATS Scoring**: Weighted diagnostic scoring across Required Skills (40%), Responsibilities (25%), Preferred Skills (20%), and Terminology (15%).
- **Interactive Bullet Diff Studio**: Side-by-side comparison of original vs. tailored bullets with 1-click Accept / Revert controls.
- **Universal Command Palette (`Cmd+K` / `Ctrl+K`)**: Fast keyboard-first navigation, instant template switching, theme toggles, and shortcut discovery.
- **Version History & Snapshot Rollback**: Slide-over history drawer tracking original vs. tailored versions with instant restoration.
- **First-Time User Onboarding Guide**: Visual 3-step walkthrough explaining the ground-truth data flow.
- **Cloud & Local Persistence**: Stores structured resume data (JSONB) in Supabase with automatic local session fallback.

---

## Pricing & Community Contribution

LumaCV is currently **100% free with all features unlocked** ($0 forever during open launch). Automated payment gateways and subscription tiers will be integrated in a later release.

If LumaCV helped you optimize your resume or land an interview call, consider supporting our independent server and inference costs:
- **UPI & Payment ID**: `sahil.bansal@superyes`
- **Support & Inquiries**: `connect@sahilbansal.net`

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router), React 18, TypeScript |

| **Styling** | Tailwind CSS, Radix UI primitives, Lucide Icons |
| **Animation** | Framer Motion (page transitions, spring counters, drawers, spotlights) |
| **State** | Zustand with `persist` middleware |
| **Typesetting Engine** | **Typst** (`bin/typst.exe` on Windows, native binary on Linux/macOS) |
| **AI Providers** | Multi-Provider Engine (Google Gemini, OpenAI, Anthropic Claude, Groq Cloud) |
| **BYOK Architecture** | Client-side key encryption, custom model selection, zero server credential storage |
| **PDF Extraction** | `pdfjs-dist` (client-side text parsing) |
| **Auth & Database** | Supabase (PostgreSQL, Row Level Security, Auth) |

---

## AI Architecture & Model Selection (BYOK)

LumaCV features a multi-provider AI engine designed for flexible performance and complete privacy:

- **Free Tier (Zero Setup)**: Automatically powered by optimized platform models (`gemini-2.5-flash` and `qwen/qwen3.6-27b`) with zero user configuration required. Free tier users are bounded to developer-tuned models for consistent latency and factual accuracy.
- **Bring Your Own Key (BYOK)**: Users can supply their personal API keys in **Settings (`/profile`)**:
  - **Google Gemini**: Choose between `gemini-2.5-flash`, `gemini-2.5-pro`, or `gemini-flash-latest`.
  - **OpenAI**: Choose between `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, or `o3-mini`.
  - **Anthropic Claude**: Choose between `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`, or `claude-3-opus-20240229`.
  - **Groq Cloud**: Choose between `qwen/qwen3.6-27b`, `llama-3.3-70b-versatile`, or `llama-3.1-8b-instant`.
- **Zero Server Storage**: Your keys never touch a database or server logs. They reside in your browser's encrypted local storage and are passed solely as per-request TLS headers.

---

## Agent Skills & Design Standards

LumaCV is integrated with the open agent skills ecosystem ([skills.sh](https://skills.sh)), ensuring that all UI/UX components adhere to anti-slop design principles, strict accessibility audits, and motion choreography:

- **[`taste-skill` / `design-taste-frontend`](https://github.com/Leonxlnx/taste-skill)**: Anti-slop frontend engineering skill enforcing intentional aesthetic inference, editorial typography, tailored color palettes, and avoiding generic AI templates.
- **[`web-design-guidelines`](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)**: Automated compliance auditor for Vercel Web Interface Guidelines, touch targets, WCAG contrast ratios, and responsive behaviors.
- **[`antigravity-design-expert`](https://github.com/sickn33/agentic-awesome-skills/tree/main/skills/antigravity-design-expert)**: Spatial UI engineering, subtle glassmorphism, 3D CSS transforms, and GSAP/motion choreography.
- **[`ui-ux-pro-max`](.agents/skills/ui-ux-pro-max/)**: Comprehensive design system intelligence with curated palettes, font pairings, and interaction guidelines.

Skills are tracked in `skills-lock.json` and can be synced across agents:
```bash
npx skills add Leonxlnx/taste-skill --agent antigravity -y --copy
npx skills add vercel-labs/agent-skills --skill web-design-guidelines --agent antigravity -y --copy
npx skills add sickn33/agentic-awesome-skills --skill antigravity-design-expert --agent antigravity -y --copy
```

---

## Getting Started

### Prerequisites

- Node.js 18.17+ or 20+
- A free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) or [Groq Cloud](https://console.groq.com/keys)
- (Optional) A free [Supabase](https://supabase.com) project for user authentication and CV saving

### 1. Clone & Install Dependencies

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

Configure your API keys in `.env.local`:

```env
# AI Providers (At least one required)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Optional for local testing, required for user auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Setup Database (Optional)

If using Supabase, execute [supabase/schema.sql](supabase/schema.sql) in the **Supabase SQL Editor** to create the tables (`profiles`, `user_resumes`, `resumes`) and RLS policies.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Quality Audits

Run the automated suites to verify type-safety, route availability, and visual regression:

```bash
# Type check across all 28 routes
npx tsc --noEmit

# Test all 13 application HTTP routes
node scripts/verify-routes.mjs

# Run automated 48-template visual regression matrix
npx tsx scripts/test-visual-regression.mjs

# Production bundle compilation
npm run build
```

---

## Project Structure

```
LumaCV/
├── .agents/skills/             # Open agent design, audit, and motion skills
├── app/                        # Next.js App Router (28 static & dynamic routes)
│   ├── api/v1/                 # REST API endpoints
│   │   ├── jd/analyze/         # Job description analysis
│   │   ├── resume/compile/     # Native Typst compilation
│   │   ├── resume/export-typ/  # Direct markup source download
│   │   ├── resume/parse/       # PDF text to structured JSON
│   │   ├── resume/render/      # Async render & signed URL management
│   │   ├── resume/score/       # ATS keyword match scoring
│   │   ├── resume/tailor/      # Resume tailoring
│   │   └── resumes/            # Project persistence endpoints
│   ├── billing/                # Pricing, free launch access & contribution info
│   ├── builder/                # 4-step wizard UI & review workspace
│   ├── contact/                # Help & support center
│   ├── dashboard/              # Saved resumes workspace & metrics
│   ├── demo/                   # Public interactive preview
│   ├── login/ & signup/        # Authentication pages
│   ├── privacy/ & terms/       # SaaS legal & privacy policies
│   └── profile/                # Account settings & typesetting defaults
├── components/                 # Reusable UI & design system components
│   ├── animated-counter.tsx    # Spring physics counter
│   ├── app-header.tsx          # Navigation shell with command trigger
│   ├── command-menu.tsx        # Universal Cmd+K command palette
│   ├── onboarding-modal.tsx    # First-time user guide
│   ├── spotlight-card.tsx      # Cursor-following radial light card
│   ├── template-selector.tsx   # Visual wireframe template picker
│   └── version-history-drawer.tsx # Snapshot timeline & rollback
├── docs/                       # Architectural diagrams & setup guides
├── lib/                        # Core utilities & services
│   ├── compiler-service.ts     # Typst compilation manager
│   ├── fact-validator.ts       # Anti-hallucination validation
│   ├── llm-client.ts           # Dual-provider AI streaming client
│   ├── typst-generator.ts      # Structured JSON to Typst code generator
│   └── user-resumes-store.ts   # Project persistence state
├── scripts/                    # Verification & audit automation
│   ├── test-visual-regression.mjs # 48-matrix layout audit
│   └── verify-routes.mjs       # Route health checker
├── skills-lock.json            # Agent skills lockfile
└── typst/                      # Typst typesetting templates & library
    ├── lib/
    │   ├── theme.typ           # Color palettes & typography tokens
    │   ├── utils.typ           # Markdown bold parsing & link formatters
    │   └── icons.typ           # Embedded SVG icons
    └── templates/              # 6 production Typst resume templates
        ├── modern.typ
        ├── classic.typ
        ├── engineering.typ
        ├── compact.typ
        ├── two_column.typ
        └── ats_safe.typ
```

---

## Deployment

LumaCV is optimized to deploy effortlessly on [Vercel](https://vercel.com):
- Native vector binary compiles inside the serverless runtime.
- Long-running AI generation routes are configured with `maxDuration = 60`.
- All static routes and template previews compile with 0 external build farm dependencies.

---

## License & Creator

Created by [Sahil Bansal](https://sahilbansal.vercel.app/).  
Inquiries: [`connect@sahilbansal.net`](mailto:connect@sahilbansal.net)  
Open source under the [MIT License](LICENSE).
