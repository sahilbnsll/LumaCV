"use client";

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { EditorialFooter } from '@/components/landing/editorial-footer';
import { PulsingHeart } from '@/components/pulsing-heart';
import {
    ArrowLeft, Check, Heart, Copy, Wallet, Zap, Server, Rocket, Wrench, Users,
    Coffee, QrCode, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUPPORT_CONFIG } from '@/lib/support-config';
import { notify } from '@/lib/notify';
import { UpiDonationDialog } from '@/components/upi-donation-dialog';

export default function BillingPage() {
    const [copied, setCopied] = useState(false);
    const [upiModalOpen, setUpiModalOpen] = useState(false);

    const handleCopyUpi = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(SUPPORT_CONFIG.upi.id);
            setCopied(true);
            notify.copied(`UPI ID: ${SUPPORT_CONFIG.upi.id}`);
            setTimeout(() => setCopied(false), 2200);
        } catch {
            notify.error('Failed to copy', 'Please copy the UPI ID manually.');
        }
    }, []);

    return (
        <div className="relative min-h-screen bg-transparent text-foreground antialiased selection:bg-primary/20 selection:text-primary flex flex-col justify-between overflow-hidden">
            {/* ── Background Editorial Wireframe Planes (LumaCV Signature Aesthetic) ── */}
            <div
                className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
                aria-hidden="true"
            >
                <div
                    style={{ transform: "translateY(-10%) rotate(-14deg)" }}
                    className="absolute top-0 left-[4%] w-[320px] sm:w-[440px] aspect-[210/297] rounded-[4px] border border-border/30 pointer-events-none"
                />
                <div
                    style={{ transform: "translateY(20%) rotate(12deg)" }}
                    className="absolute top-1/3 right-[2%] w-[360px] sm:w-[480px] aspect-[210/297] rounded-[4px] border border-border/30 pointer-events-none"
                />
                <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[640px] rounded-full bg-gradient-to-tr from-primary/10 via-rose-500/5 to-amber-500/10 blur-[130px]" />
            </div>

            <AppHeader />

            <main id="main-content" className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-10 flex-1 w-full space-y-10">
                {/* Back Link */}
                <div>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/60 dark:bg-card/60 hover:bg-muted px-4 py-1.5 rounded-full border border-border/70 dark:border-white/10 shadow-2xs"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to My Resumes</span>
                    </Link>
                </div>

                {/* Hero: Title & Manifesto */}
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <div className="flex justify-center">
                        <PulsingHeart size={44} className="drop-shadow-sm" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                        Billing &amp; Support
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        LumaCV is completely free and open source, developed by{' '}
                        <a
                            href="https://sahilbansal.net/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground font-semibold hover:underline underline-offset-2"
                        >
                            Sahil Bansal
                        </a>{' '}
                        and community contributors. Your support keeps compilation servers blazing fast and the project freely accessible to job seekers everywhere.
                    </p>
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 dark:bg-card/60 px-3.5 py-1.5 rounded-full border border-border/70 dark:border-white/10 shadow-2xs">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-semibold text-foreground">All 52 Templates Free · Forever</span>
                        </div>
                    </div>
                </div>

                {/* Active Plan Overview */}
                <div className="liquid-glass relative overflow-hidden p-6 sm:p-8">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                                    Current Plan
                                </span>
                                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold shadow-2xs">
                                    Full Access · Free Forever
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">
                                Unlimited Tailoring &amp; Vector PDF Exports
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                You currently have unrestricted access to all 52 Typst templates, local version history, native vector rendering, and ATS analysis.
                            </p>
                        </div>
                        <div className="shrink-0 flex items-center">
                            <Button asChild size="sm" className="h-10 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl shadow-xs transition-all active:scale-95">
                                <Link href="/editor">
                                    <span>Create New Resume</span>
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="relative z-10 mt-6 pt-6 border-t border-border/60 dark:border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                        {[
                            { icon: Zap, text: '52 Typst Templates' },
                            { icon: Server, text: 'Serverless Edge Compile' },
                            { icon: Check, text: 'Fact Verification' },
                            { icon: Zap, text: 'BYOK AI Keys' },
                            { icon: Wallet, text: 'ATS Score Engine' },
                            { icon: Check, text: 'Local Version History' },
                        ].map(({ icon: Icon, text }, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-xs text-foreground/90 font-medium">
                                <div className="h-5 w-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <Icon className="h-3.5 w-3.5" />
                                </div>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3 Impact Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    <div className="group liquid-glass p-6 flex flex-col items-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                            <Rocket className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-sm text-foreground">Long-term Sustainability</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Ensures LumaCV remains 100% free with no paywalls or locked resume exports.
                        </p>
                    </div>

                    <div className="group liquid-glass p-6 flex flex-col items-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                            <Wrench className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-sm text-foreground">Ongoing Maintenance</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Covers Typst engine updates, bug fixes, and continuous cloud server infrastructure.
                        </p>
                    </div>

                    <div className="group liquid-glass p-6 flex flex-col items-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                            <Users className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-sm text-foreground">Community &amp; Features</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Funds new template designs, AI optimization integrations, and contributor tooling.
                        </p>
                    </div>
                </div>

                {/* ── 3 Unified Support Methods ── */}
                <div className="space-y-4 pt-2">
                    <div className="text-center space-y-1">
                        <h2 className="text-xl font-display font-bold text-foreground tracking-tight">Support Development</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Pick the contribution method that works best for you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                        {/* 1. Support via UPI */}
                        <div className="liquid-glass p-6 flex flex-col justify-between space-y-5 transition-all hover:-translate-y-0.5">
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                                        <QrCode className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        0% Fees · India
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-display font-bold text-base text-foreground">
                                        Support via UPI
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                        Zero gateway fees. Scan dynamic QR or pay directly via Google Pay, PhonePe, Paytm, or BHIM.
                                    </p>
                                </div>

                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 dark:bg-white/5 border border-border/70 dark:border-white/10 text-xs">
                                    <span className="font-mono text-[11px] font-semibold truncate select-all text-foreground">
                                        {SUPPORT_CONFIG.upi.id}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyUpi}
                                        className="ml-2 shrink-0 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                        title="Copy UPI ID"
                                        aria-label="Copy UPI ID"
                                    >
                                        {copied ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="invert"
                                onClick={() => setUpiModalOpen(true)}
                                className="w-full min-h-touch text-xs sm:text-sm font-semibold gap-2 rounded-xl"
                            >
                                <QrCode className="h-4 w-4 text-emerald-400 shrink-0" />
                                <span>Scan UPI QR Code</span>
                            </Button>
                        </div>

                        {/* 2. Buy Me a Coffee */}
                        <div className="liquid-glass p-6 flex flex-col justify-between space-y-5 transition-all hover:-translate-y-0.5">
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="h-11 w-11 rounded-2xl bg-[#FFDD00]/15 border border-[#FFDD00]/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                                        <Coffee className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        Worldwide
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-display font-bold text-base text-foreground">
                                        Buy Me a Coffee
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                        Support development from anywhere in the world using credit/debit cards, Apple Pay, Google Pay, or PayPal.
                                    </p>
                                </div>

                                <div className="flex items-center p-2.5 rounded-xl bg-muted/40 dark:bg-white/5 border border-border/70 dark:border-white/10 text-xs">
                                    <span className="font-mono text-[11px] font-semibold truncate text-foreground">
                                        {SUPPORT_CONFIG.buyMeACoffee.display}
                                    </span>
                                </div>
                            </div>

                            <Button
                                asChild
                                className="w-full min-h-touch rounded-xl text-xs sm:text-sm font-bold gap-2 bg-[#FFDD00] hover:bg-[#ffea40] text-black transition-all shadow-xs active:scale-95"
                            >
                                <a
                                    href={SUPPORT_CONFIG.buyMeACoffee.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Coffee className="h-4 w-4 fill-black text-black shrink-0" />
                                    <span>Buy Me a Coffee</span>
                                    <ExternalLink className="h-3 w-3 ml-auto opacity-70" />
                                </a>
                            </Button>
                        </div>

                        {/* 3. GitHub Sponsors */}
                        <div className="liquid-glass p-6 flex flex-col justify-between space-y-5 transition-all hover:-translate-y-0.5">
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="h-11 w-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 shadow-2xs">
                                        <Heart className="h-5 w-5 fill-rose-500" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                        Monthly or One-Time
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-display font-bold text-base text-foreground">
                                        GitHub Sponsors
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                        Back the repository on GitHub. Supports ongoing Typst template additions, bug fixes, and community tooling.
                                    </p>
                                </div>

                                <div className="flex items-center p-2.5 rounded-xl bg-muted/40 dark:bg-white/5 border border-border/70 dark:border-white/10 text-xs">
                                    <span className="font-mono text-[11px] font-semibold truncate text-foreground">
                                        {SUPPORT_CONFIG.githubSponsors.display}
                                    </span>
                                </div>
                            </div>

                            <Button
                                asChild
                                variant="outline"
                                className="w-full min-h-touch rounded-xl text-xs sm:text-sm font-semibold gap-2 border-border/80 dark:border-white/10 hover:bg-muted text-foreground transition-all shadow-xs active:scale-95"
                            >
                                <a
                                    href={SUPPORT_CONFIG.githubSponsors.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="15"
                                        height="15"
                                        fill="currentColor"
                                        className="shrink-0 text-foreground"
                                        aria-hidden="true"
                                    >
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                    </svg>
                                    <span>GitHub Sponsors</span>
                                    <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Infrastructure transparency */}
                <div className="liquid-glass p-6 sm:p-7 space-y-4">
                    <div>
                        <h2 className="text-lg font-display font-bold text-foreground tracking-tight">Where Your Support Goes</h2>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                            LumaCV is independently maintained. Every contribution directly helps keep it free, ultra-fast, and open-source.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        {[
                            { icon: Server, title: 'Serverless Compute', desc: 'Edge function runtimes for Typst PDF compilation and native vector rendering.' },
                            { icon: Zap, title: 'AI Inference Pipelines', desc: 'Gemini Flash and Groq models for resume analysis, tailoring, and ATS parsing.' },
                            { icon: Heart, title: 'Open-Source Maintenance', desc: 'Active development, 52 Typst templates, continuous bug fixes, and feature additions.' },
                        ].map(({ icon: Icon, title, desc }, i) => (
                            <div key={i} className="rounded-2xl border border-border/70 dark:border-white/10 bg-muted/20 dark:bg-white/5 p-4 space-y-2 hover:border-border transition-colors">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-xs font-semibold text-foreground">{title}</p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Appreciation Note */}
                <div className="text-center text-xs text-muted-foreground space-y-1 pb-2">
                    <p>Every contribution helps keep LumaCV open and free for job seekers worldwide.</p>
                    <p className="font-semibold text-foreground">Thank you for your support!</p>
                </div>

                {/* In-Place UPI Dialog: Never navigates away from page */}
                <UpiDonationDialog
                    open={upiModalOpen}
                    onOpenChange={setUpiModalOpen}
                    initialAmount={99}
                />
            </main>

            <EditorialFooter />
        </div>
    );
}
