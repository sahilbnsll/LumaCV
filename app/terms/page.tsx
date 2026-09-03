"use client";

import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { ArrowLeft, Shield, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
                <div className="mb-6">
                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 -ml-2">
                        <Link href="/">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Home
                        </Link>
                    </Button>
                </div>

                <div className="space-y-2 border-b border-border/60 pb-6 mb-8">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-2">
                        <Shield className="h-3 w-3" />
                        <span>Legal Terms</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
                    <p className="text-sm text-muted-foreground">Last updated: September 2026</p>
                </div>

                <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using LumaCV (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            2. Service Description & User Content
                        </h2>
                        <p>
                            LumaCV provides career optimization tools, including structured resume editing, ATS alignment analysis, and native document compilation. You retain 100% ownership of all resume text, career history, and job descriptions you submit.
                        </p>
                        <p>
                            We do not sell, rent, or use your personal career data to train public artificial intelligence models.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            3. Factual Truth & User Responsibility
                        </h2>
                        <p>
                            LumaCV is designed to enhance phrasing and maximize keyword alignment for job descriptions while preserving factual truth. However, you are solely responsible for reviewing and validating the accuracy of all generated resumes before submitting them to prospective employers.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            4. Subscriptions, Payments & Cancellations
                        </h2>
                        <p>
                            Certain features of LumaCV are offered on a paid subscription basis. Subscriptions automatically renew unless cancelled prior to the renewal date. You may cancel your subscription at any time through your Account settings.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            5. Limitation of Liability
                        </h2>
                        <p>
                            LumaCV does not guarantee job interviews, offers, or employment outcomes. To the maximum extent permitted by law, LumaCV and its creators shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            6. Inquiries & Legal Notices
                        </h2>
                        <p>
                            For inquiries, legal notices, or account assistance, reach out to our team at{' '}
                            <a href="mailto:connect@sahilbansal.net" className="text-primary hover:underline font-medium">connect@sahilbansal.net</a>.
                        </p>
                    </section>
                </div>

            </main>
        </div>
    );
}
