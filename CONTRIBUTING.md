# Contributing to LumaCV

Thank you for your interest in contributing to LumaCV! We welcome contributions from developers, designers, and typesetters of all experience levels.

LumaCV is an open-source resume engineering studio powered by Typst typesetting, Next.js 14, and privacy-preserving AI tailoring. Our mission is to produce factually accurate, beautifully typeset resumes that excel in applicant tracking systems without hallucinated claims or vendor lock-in.

---

## Code of Conduct

We are committed to providing a welcoming, respectful, and inclusive environment for everyone. Please be considerate, communicate clearly, and treat all community members with empathy and professional courtesy.

---

## How Can You Contribute?

You can contribute to LumaCV in several ways:
1. **Reporting Bugs**: Open an issue describing the unexpected behavior, steps to reproduce, browser/OS version, and screenshots if applicable.
2. **Suggesting Enhancements**: Submit an idea for a new feature, UX refinement, or template concept.
3. **Designing Typst Templates**: Create new professional, ATS-compliant Typst templates for our 48+ template gallery.
4. **Improving Documentation**: Fix typos, add examples, or clarify guides in `/docs` or the README.
5. **Submitting Pull Requests**: Implement bug fixes, performance optimizations, or new capabilities.

---

## Getting Started with Local Development

### Prerequisites
- **Node.js**: `v18.17.0` or higher (`v20.x` recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Typst**: Typst CLI (`v0.11.0` or newer) installed in your PATH, or rely on local bundled binaries in `bin/`
- **Supabase Account**: A free Supabase project for database tables and authentication

### 1. Clone the Repository
```bash
git clone https://github.com/sahilbnsll/LumaCV.git
cd LumaCV
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Provide the required keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
*(Optional: Provide `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY` for server-side fallback AI parsing, or use your own key in the UI settings via BYOK).*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
├── app/                  # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/           # Authentication routes (login, signup, password reset)
│   ├── api/v1/           # API handlers (compile, export, parse, tailor, jd)
│   ├── builder/          # 4-step resume studio workflow
│   ├── dashboard/        # Saved resumes management
│   ├── demo/             # Interactive live sample CV preview
│   ├── docs/             # Technical documentation center
│   ├── templates/        # 48-template interactive gallery
│   └── profile/          # User preferences and BYOK API keys
├── components/           # React UI components
│   ├── ui/               # Radix UI + shadcn primitive design system
│   ├── luma-logo.tsx     # Canonical product mark
│   └── resume-*.tsx      # Builder step forms and previewers
├── lib/                  # Shared utilities & business logic
│   ├── compiler-service.ts   # Typst process executor and WASM integration
│   ├── resume-store.ts       # Client-side Zustand persistence store
│   ├── supabase/             # Client and server Supabase SDK instances
│   └── types.ts              # Core resume schema definitions
├── typst/                # Typst templates, layout functions, and typography
└── prompts/              # Privacy-preserving LLM extraction and tailoring prompts
```

---

## Coding Guidelines

### TypeScript & React
- Write strict, fully-typed TypeScript code. Avoid `any`; use existing interfaces from `@/lib/types` or declare explicit types.
- Favor React Server Components (RSC) where possible. Use `"use client"` only for components requiring interactivity, hooks, or browser APIs.
- Keep components modular and reusable. Reuse design primitives in `@/components/ui`.

### Styling & Design System
- Use **Tailwind CSS** utility classes adhering to our defined theme tokens (e.g. `bg-background`, `text-foreground`, `border-border`, `primary`).
- Never use garish neon colors or unconstrained arbitrary values (`w-[137px]`). Adhere to standard spacing scales.
- Ensure all interactive elements have visible focus states, sensible ARIA labels, and work seamlessly in both dark and light modes.

### Typst Template Development
- All resume templates must accept standard schema parameters (`basics`, `work`, `education`, `skills`, `projects`, `certifications`).
- Maintain strict page margins (0.5in to 0.75in) to preserve clean page distribution across standard Letter and A4 formats.
- Avoid proprietary font dependencies; rely on system-standard or bundled open typography (e.g., Roboto, Inter, EB Garamond, Liberation Sans).

### Security & Privacy
- **Never commit secrets**, tokens, or real candidate resumes.
- User data must be isolated and gated behind session authentication (`requireUser()`).
- AI tailoring must uphold the zero-hallucination principle: prompts must forbid introducing unverified employers, dates, or quantitative metrics.

---

## Pull Request Checklist

Before submitting a pull request:
1. [ ] Run `npx tsc --noEmit` to confirm zero TypeScript compilation errors.
2. [ ] Run `npm run build` to verify production build integrity.
3. [ ] Verify that UI changes render cleanly across mobile and desktop viewports.
4. [ ] Ensure no debug logs (`console.log`), unused imports, or temporary files remain.
5. [ ] Write a clear, concise PR description outlining what changed and how it was tested.

---

## License

By contributing to LumaCV, you agree that your contributions will be licensed under the [MIT License](LICENSE).
