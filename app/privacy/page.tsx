"use client";

import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { ArrowLeft, CheckCircle2, Lock, EyeOff, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Lock className="h-3 w-3" />
                        <span>Privacy Commitment</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                        Privacy Policy
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Last updated: September 2026</span>
                        <span>•</span>
                        <span>3 min read</span>
                        <span>•</span>
                        <span className="text-emerald-500 font-medium">Zero Model Training</span>
                    </div>
                </div>

                {/* Privacy Guarantee Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-display font-bold text-foreground">
                            <EyeOff className="h-4 w-4 text-primary" />
                            <span>Zero AI Model Training</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Your resume contents, employment history, and job descriptions are never sold, shared, or used to train public or proprietary AI models.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-display font-bold text-foreground">
                            <Server className="h-4 w-4 text-emerald-500" />
                            <span>Zero Server Key Storage</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Personal API keys provided under BYOK stay strictly in your local encrypted browser storage and are passed solely as per-request TLS headers.
                        </p>
                    </div>
                </div>

                <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            1. Data Collection & Processing Scope
                        </h2>
                        <p>
                            We believe your career history belongs exclusively to you. When you use LumaCV to tailor a resume or analyze a job description:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs">
                            <li><strong>Resume Content:</strong> Extracted directly client-side via WebAssembly/pdf.js. Only text tokens necessary for alignment are transmitted over encrypted TLS.</li>
                            <li><strong>Job Descriptions:</strong> Analyzed solely in-memory to extract competency requirements and calculate 4-vector matching.</li>
                            <li><strong>Document Telemetry:</strong> Anonymized performance metrics (e.g. compilation duration, page count) are logged to optimize our native vector engine.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            2. Cloud Storage & Account Security
                        </h2>
                        <p>
                            If you sign in with Supabase Authentication, your saved projects and snapshots are stored in PostgreSQL protected by Row-Level Security (RLS) policies. Only your authenticated user account possesses cryptographic permission to query or update your resumes. You can export your data or permanently wipe your account at any time.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            3. Third-Party AI Inference Providers
                        </h2>
                        <p>
                            LumaCV routes inference requests to Google Gemini, OpenAI, Anthropic, or Groq Cloud via their official enterprise APIs. All provider agreements explicitly state that API-transmitted payloads are not utilized to train foundational LLMs.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            4. Inquiries & Data Rights
                        </h2>
                        <p>
                            Under GDPR and CCPA, you have the right to inspect, correct, or request total deletion of all associated account records. Contact our engineering team at <a href="mailto:connect@sahilbansal.net" className="text-primary hover:underline font-medium">connect@sahilbansal.net</a>.
                        </p>
                    </section>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
