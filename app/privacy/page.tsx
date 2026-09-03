"use client";

import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
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
                        <Lock className="h-3 w-3" />
                        <span>Privacy Commitment</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
                    <p className="text-sm text-muted-foreground">Last updated: September 2026</p>
                </div>

                <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            1. Data Privacy Principles
                        </h2>
                        <p>
                            We believe your career history and resumes belong exclusively to you. When you use LumaCV to tailor a resume or analyze a job description:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li><strong>Resume Content:</strong> Extracted directly in your browser session for tailoring.</li>
                            <li><strong>Job Descriptions:</strong> Analyzed strictly for keyword matching and requirement extraction.</li>
                            <li><strong>Zero AI Training:</strong> Your private resumes are never shared, sold, or used to train third-party language models.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            2. Account Storage & Security
                        </h2>
                        <p>
                            If you create an account, your resumes and tailored drafts are stored in secure cloud infrastructure protected by row-level encryption. You can export or permanently delete your resumes at any time from your dashboard.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            3. Privacy-Conscious Analytics
                        </h2>
                        <p>
                            We collect anonymized, non-identifying telemetry (such as error rates, PDF compile speed, and feature clicks) to improve system performance. We strictly never log resume text, employer names, or candidate identities.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            4. Data Inquiries & Deletion
                        </h2>
                        <p>
                            To request complete data deletion or if you have privacy questions, please contact our team at{' '}
                            <a href="mailto:connect@sahilbansal.net" className="text-primary hover:underline font-medium">connect@sahilbansal.net</a>.
                        </p>

                    </section>
                </div>
            </main>
        </div>
    );
}
