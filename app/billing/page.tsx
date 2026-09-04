"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { ArrowLeft, Check, Sparkles, Heart, Copy, CheckCheck, Wallet, ShieldCheck, Zap, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function BillingPage() {
    const [copied, setCopied] = useState(false);
    const paymentHandle = "sahil.bansal@superyes";

    const handleCopy = () => {
        navigator.clipboard.writeText(paymentHandle);
        setCopied(true);
        toast.success(`Copied "${paymentHandle}" to clipboard!`);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary flex flex-col justify-between">
            <AppHeader />

            <main id="main-content" className="mx-auto max-w-4xl px-4 sm:px-6 py-10 flex-1">
                {/* Back to Dashboard */}
                <div className="mb-6">
                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 -ml-2">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to My Resumes
                        </Link>
                    </Button>
                </div>

                <div className="border-b border-border/50 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-2">
                            <Sparkles className="h-3 w-3" />
                            <span>100% Free Launch Access</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
                            Transparent Access & Community Support
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                            LumaCV is completely free for all job applicants. Support our independent serverless infrastructure directly.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-medium">All Executive Features Unlocked</span>
                    </div>
                </div>

                {/* Active Plan: Free Launch Pass */}
                <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-card mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-display">
                                    Current Plan
                                </span>
                                <span className="rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                                    Full Access Free
                                </span>
                            </div>
                            <h2 className="text-lg font-display font-bold text-foreground">
                                Unlimited Tailoring & Vector PDF Exports
                            </h2>
                            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                                You currently have unrestricted access to all 6 executive templates, fact-checking verification, and sub-50ms vector rendering. Automated subscription gateways will be integrated in a later release.
                            </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                            <Button asChild size="sm" className="h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs">
                                <Link href="/builder">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Create New Resume</span>
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>All 6 Executive Templates</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>100% Fact-Checked Tailoring</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>Sub-50ms Typst Compilation</span>
                        </div>
                    </div>
                </div>

                {/* Direct Community Contribution Card */}
                <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/[0.06] via-card to-background p-6 sm:p-8 shadow-elevated relative overflow-hidden mb-8">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
                            <span>Community Backer Program</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-foreground">
                            Support LumaCV&apos;s Independent Development
                        </h3>

                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            LumaCV is engineered independently by Sahil Bansal without venture capital or intrusive paywalls. If this tool helped you prepare for interviews or saved hours of formatting, help offset serverless hosting and AI inference costs:
                        </p>

                        {/* Payment / UPI Handle Box */}
                        <div className="mt-4 rounded-xl border border-border/80 bg-background/90 p-4 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                                    <Wallet className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block font-display">
                                        UPI & Support Handle
                                    </span>
                                    <span className="font-mono text-sm sm:text-base font-bold text-foreground">
                                        {paymentHandle}
                                    </span>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCopy}
                                aria-label="Copy UPI contribution handle"
                                className="h-8 px-3 text-xs font-medium border-border/80 hover:bg-primary hover:text-primary-foreground gap-1.5 shrink-0"
                            >
                                {copied ? (
                                    <>
                                        <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Copy Handle</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Server className="h-3.5 w-3.5 text-primary" />
                                <span>Covers Vercel serverless compute runtime</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Funds LLM analysis & parsing tokens</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ & Support Note */}
                <div className="rounded-xl border border-border/60 bg-muted/15 p-5 space-y-3 text-xs text-muted-foreground">
                    <h4 className="font-display font-semibold text-foreground text-sm">Have billing questions or feedback?</h4>
                    <p className="leading-relaxed">
                        If you represent an educational institution, bootcamp, or career counseling non-profit interested in batch processing, reach out directly at <a href="mailto:connect@sahilbansal.net" className="text-primary hover:underline font-medium">connect@sahilbansal.net</a>.
                    </p>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
