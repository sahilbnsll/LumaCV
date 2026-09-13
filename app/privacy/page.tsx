import { Metadata } from 'next';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { EditorialFooter } from '@/components/landing/editorial-footer';
import { ArrowLeft, CheckCircle2, EyeOff, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Privacy Policy | LumaCV',
    description: 'How LumaCV handles your data: client-side file parsing, what gets sent to AI providers, cloud resume storage, and how to request deletion.',
    openGraph: {
        title: 'Privacy Policy | LumaCV',
        description: 'How LumaCV handles your data: client-side file parsing, what gets sent to AI providers, cloud resume storage, and how to request deletion.',
        url: '/privacy',
    },
    twitter: {
        title: 'Privacy Policy | LumaCV',
        description: 'How LumaCV handles your data: client-side file parsing, what gets sent to AI providers, cloud resume storage, and how to request deletion.',
    },
    alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary flex flex-col justify-between">
            <AppHeader />

            <main id="main-content" className="mx-auto max-w-reading px-4 sm:px-6 py-12 flex-1">
                <div className="mb-6">
                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 -ml-2">
                        <Link href="/">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Home
                        </Link>
                    </Button>
                </div>

                <div className="space-y-3 border-b border-border/50 pb-6 mb-8">
                    <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                        Privacy Policy
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Last updated: September 2026</span>
                        <span>•</span>
                        <span>4 min read</span>
                    </div>
                </div>

                {/* Privacy Guarantee Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-display font-bold text-foreground">
                            <EyeOff className="h-4 w-4 text-primary" />
                            <span>Parsing happens in your browser</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Your PDF or DOCX file is read locally. Only the extracted text is sent to our server when you use an AI feature — the file itself never leaves your device.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-display font-bold text-foreground">
                            <Server className="h-4 w-4 text-emerald-500" />
                            <span>Your own API keys stay local</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            If you supply your own AI provider key (BYOK), it's kept in your browser's local storage and sent only as a per-request header — we never store it on our servers.
                        </p>
                    </div>
                </div>

                <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            1. What we process, and where
                        </h2>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs">
                            <li><strong>Resume files (PDF/DOCX):</strong> parsed entirely client-side (<code>pdfjs-dist</code>/<code>mammoth</code>). The file is not uploaded; only the extracted plain text is sent to our server, and only when you use an AI feature (parsing, ATS analysis, or optimization).</li>
                            <li><strong>Job descriptions:</strong> the text you paste is sent to our server solely to extract keywords or tailor your resume against it.</li>
                            <li><strong>Saved resumes:</strong> if you're signed in, resumes you explicitly save are stored server-side in Supabase (PostgreSQL), scoped to your account. If you're using the local demo/guest mode, resumes are kept only in your browser's local storage and never reach our server.</li>
                            <li><strong>Feedback you submit:</strong> your message, and any name/email/rating you choose to include, is emailed to the project maintainer and best-effort logged for follow-up. This isn't rate-limited or authenticated — don't include anything you wouldn't want in an email.</li>
                            <li><strong>Aggregate usage counts:</strong> we track platform-wide totals (resumes compiled, bullets tailored, user count) — not tied to your individual activity — shown on the homepage.</li>
                            <li><strong>Page-view analytics:</strong> we use Vercel Analytics for aggregate, privacy-respecting traffic metrics (no cross-site tracking, no ad identifiers).</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            2. Account & cloud storage
                        </h2>
                        <p>
                            Signing in uses Supabase Authentication (email/password, or OAuth if enabled). Resumes you save while signed in are stored in our Supabase database, associated with your account, and our API only ever queries resumes matching your own user ID. A local-only demo mode is also available that skips account creation entirely and keeps everything in your browser.
                        </p>
                        <p>
                            <strong>Deleting your data:</strong> there is currently no self-service "delete my account" control in the product. To request deletion of your account and associated resumes, email <a href="mailto:connect@sahilbansal.net" className="text-primary hover:underline font-medium">connect@sahilbansal.net</a> and we'll process it manually. You can export your locally-saved resumes at any time from Profile → Data.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            3. Third-party AI providers
                        </h2>
                        <p>
                            When you use an AI feature, the relevant text (resume content and/or job description) is sent to whichever provider is configured — currently Google Gemini, Groq, Mistral AI, OpenRouter, OpenAI, GitHub Models, or (if you supply your own key) Anthropic. Each provider has its own data-handling and retention policy, and OpenRouter in particular can route to different underlying model vendors depending on availability. We don't independently verify or guarantee each provider's training-data practices — if that's a concern for you, use the BYOK option with a provider whose terms you've reviewed, or the local Standalone Editor, which performs no AI processing at all.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            4. Questions & data requests
                        </h2>
                        <p>
                            To ask about your data, request a copy, or request deletion, email <a href="mailto:connect@sahilbansal.net" className="text-primary hover:underline font-medium">connect@sahilbansal.net</a>. Depending on where you live, you may have specific legal rights (e.g. under GDPR or CCPA) regarding your personal data — this page describes what LumaCV actually does technically, and isn't a substitute for legal advice about your rights in your jurisdiction.
                        </p>
                    </section>
                </div>
            </main>

            <EditorialFooter />
        </div>
    );
}
