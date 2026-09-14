# LumaCV: Future Plans

Running list of features/ideas not yet built. Not prioritized or scheduled, just a scratchpad to pull from when planning what's next.

## Job-search workflow

- **Cover letter generator**: reuse the existing Typst pipeline + tailoring AI to generate a matching cover letter from the same resume + JD input.
- **LinkedIn/PDF import**: extend the existing resume parser to handle LinkedIn's "Export to PDF" profile format, not just freeform resumes.
- **Browser extension for job applications**: autofill application forms from a saved resume and log the application straight into `/applications`, instead of manual entry.
- **Paste-a-URL JD import**: let users paste a job posting URL (LinkedIn/Indeed) instead of pasting JD text manually; scrape/parse the posting server-side.
- **Interview-prep question bank**: generate likely interview questions from the same JD already used for tailoring, with suggested talking points drawn from the resume.
- **Skill-gap analysis**: beyond ATS keyword matching, surface which JD-required skills are missing from the resume and suggest learning resources.
- **Salary negotiation assistant**: use JD + role/location to suggest a market salary range and talking points, tied into the applications tracker.

## Product depth

- **Public shareable resume link** (`/r/[slug]`): a read-only page recruiters can open without an account; pairs naturally with a QR code on printed resumes.
- **Real payment integration**: `/billing` currently has no payment gateway wired at all (no Stripe/Razorpay), just UI. Needed before any paid tier is real.
- **Resume performance analytics**: once share links exist, track opens/views per resume version to see which one actually gets read.
- **A/B bullet testing**: generate multiple tailored variants of the same resume for one JD and compare ATS scores side by side.
- **Team/workspace mode**: for career coaches or university career centers managing many students' resumes under one account.
- **Public template marketplace**: let users submit/share their own Typst templates instead of only the 52 built-in ones.
- **Video resume / portfolio embed**: optional link block for a short intro video or portfolio site, rendered as a QR/link in the PDF.

## Trust & communication

- **Confirm transactional email delivery**: verify Supabase's own email (or a real provider) is actually configured for signup confirmation / password reset, not just assumed to work.
- **Magic-link / passwordless login**: alternative to password, using the same email flow already in place.
- **Application follow-up reminders**: email or in-app nudges ("it's been 2 weeks since you applied to X") tied to the applications tracker.
- **Resume tone/readability analyzer**: beyond ATS keyword scoring, flag jargon, passive voice, overly long bullets.
- **Duplicate/plagiarism-style check**: flag when a bullet is too close to generic boilerplate.

## Platform/scale

- **SSO/SAML**: for any future enterprise or university career-center customers.
- **Public API**: let third parties (job boards, ATS vendors) pull/push resume data programmatically.
- **Admin usage dashboard**: internal metrics dashboard on top of the existing `platform_stats` table (currently only exposed as public read-only counters, not an admin view).
- **Localization (i18n)**: multi-language UI and multi-language resume content/templates.
- **Zapier/webhook integration**: let the applications tracker push events to external tools.

## Already implemented (verified, in case future-you second-guesses)

- DOCX / Markdown / JSON / Typst export, already in `lib/resume-export.ts`.
- Rate limiting on AI endpoints, already in `lib/rate-limit.ts`, wired into `/api/v1/resume/*`.
- Resume version history, already in `components/version-history-drawer.tsx`.
- Username login (real DB-backed, not the old `@lumacv.me` trick), added this session; needs the SQL migration run in Supabase to go live (see chat history / `supabase/schema.sql`).
