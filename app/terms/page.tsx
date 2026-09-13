import { Metadata } from 'next';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { EditorialFooter } from '@/components/landing/editorial-footer';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Terms of Service | LumaCV',
    description: 'Terms of Service for using LumaCV\'s free, open-source resume building platform.',
    openGraph: {
        title: 'Terms of Service | LumaCV',
        description: 'Terms of Service for using LumaCV\'s free, open-source resume building platform.',
        url: '/terms',
    },
    twitter: {
        title: 'Terms of Service | LumaCV',
        description: 'Terms of Service for using LumaCV\'s free, open-source resume building platform.',
    },
    alternates: { canonical: '/terms' },
};

export default function TermsPage() {
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
                        Terms of Service
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Last updated: September 2026</span>
                        <span>•</span>
                        <span>3 min read</span>
                        <span>•</span>
                        <span className="text-primary font-medium">Open-Access Utility</span>
                    </div>
                </div>

                <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using LumaCV, you agree to these Terms of Service. LumaCV provides resume parsing, AI-assisted alignment, deterministic ATS scoring, and vector PDF compilation as an open-access utility.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            2. Authentic Candidate Responsibility
                        </h2>
                        <p>
                            LumaCV is engineered with strict fact-checking filters designed to prevent invented employers, dates, or skills. However, as the applicant, you remain solely responsible for the factual accuracy of all submitted materials and representation during hiring processes.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            3. Fair Usage & Automated Scraping
                        </h2>
                        <p>
                            LumaCV is offered freely to individual candidates. Automated bot traffic, DDoS attacks, or programmatic scraping of our serverless compilation endpoints without authorization is prohibited.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            4. Disclaimer of Warranties
                        </h2>
                        <p>
                            LumaCV provides algorithmic match scoring as a diagnostic heuristic. We do not guarantee employment, interview invitations, or hiring decisions. The service is provided &ldquo;as is&rdquo; without warranties of any kind.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            5. Open Source License
                        </h2>
                        <p>
                            LumaCV's source code is released under the MIT License and available on GitHub. These Terms of Service govern your use of the hosted application at this domain; the license governs your rights to the underlying code if you self-host or modify it.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            6. Third-Party AI Providers
                        </h2>
                        <p>
                            AI features route your input to third-party providers (Google Gemini, Groq, Mistral AI, OpenRouter, OpenAI, GitHub Models, or your own Anthropic key via BYOK). Your use of those features is also subject to each provider's own terms; LumaCV isn't responsible for their availability, output quality, or policies.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            7. Questions & Legal Inquiries
                        </h2>
                        <p>
                            For inquiries regarding our terms, licensing, or commercial distribution, please reach out to <a href="mailto:connect@sahilbansal.net" className="text-primary hover:underline font-medium">connect@sahilbansal.net</a>.
                        </p>
                    </section>
                </div>
            </main>

            <EditorialFooter />
        </div>
    );
}
