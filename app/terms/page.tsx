"use client";

import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { ArrowLeft, CheckCircle2, Scale, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        <Scale className="h-3 w-3" />
                        <span>Platform Terms</span>
                    </div>
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
                            5. Questions & Legal Inquiries
                        </h2>
                        <p>
                            For inquiries regarding our terms, licensing, or commercial distribution, please reach out to <a href="mailto:connect@sahilbansal.net" className="text-primary hover:underline font-medium">connect@sahilbansal.net</a>.
                        </p>
                    </section>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
