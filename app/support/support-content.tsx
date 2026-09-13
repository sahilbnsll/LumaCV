"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Heart, Rocket, Wrench, Users, Copy, Check, ArrowLeft,
    Zap, QrCode, Coffee, ExternalLink, ShieldCheck
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { EditorialFooter } from '@/components/landing/editorial-footer';
import { PulsingHeart } from '@/components/pulsing-heart';
import { UpiDonationDialog } from '@/components/upi-donation-dialog';
import { SUPPORT_CONFIG } from '@/lib/support-config';
import { notify } from '@/lib/notify';
import { Button } from '@/components/ui/button';

export default function SupportPageContent() {
    const [upiModalOpen, setUpiModalOpen] = useState(false);
    const [copiedUpi, setCopiedUpi] = useState(false);

    const handleCopyUpi = async () => {
        try {
            await navigator.clipboard.writeText(SUPPORT_CONFIG.upi.id);
            setCopiedUpi(true);
            notify.copied(`UPI ID: ${SUPPORT_CONFIG.upi.id}`);
            setTimeout(() => setCopiedUpi(false), 2200);
        } catch {
            notify.error('Could not copy UPI ID', 'Please copy manually.');
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-foreground flex flex-col justify-between selection:bg-rose-500/20 selection:text-rose-500 transition-colors">
            <AppHeader />

            <main className="flex-1 relative overflow-hidden py-12 sm:py-16 flex items-center justify-center">
                {/* Glowing Ambient Bloom */}
                <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[640px] rounded-full bg-gradient-to-tr from-rose-500/10 via-pink-500/5 to-amber-500/10 blur-[130px]" />

                <div className="relative max-w-5xl w-full mx-auto px-4 sm:px-6 space-y-10 z-10 text-center">
                    {/* Top Back Link */}
                    <div className="flex justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/60 dark:bg-card hover:bg-muted px-4 py-1.5 rounded-full border border-border/70 dark:border-white/10 shadow-2xs"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back to Home</span>
                        </Link>
                    </div>

                    {/* Top Animated Heart Emblem */}
                    <div className="flex justify-center">
                        <PulsingHeart size={52} className="mb-1 drop-shadow-sm" />
                    </div>

                    {/* Title & Manifesto */}
                    <div className="space-y-3 max-w-2xl mx-auto">
                        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-foreground">
                            Support LumaCV
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
                    </div>

                    {/* 3 Impact Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 text-center">
                        <div className="group rounded-3xl border border-border/80 dark:border-white/10 bg-card p-6 flex flex-col items-center space-y-3 shadow-xs hover:border-border hover:shadow-md transition-all">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                                <Rocket className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-sm text-foreground">Long-term Sustainability</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Ensures LumaCV remains 100% free with no paywalls or locked resume exports.
                            </p>
                        </div>

                        <div className="group rounded-3xl border border-border/80 dark:border-white/10 bg-card p-6 flex flex-col items-center space-y-3 shadow-xs hover:border-border hover:shadow-md transition-all">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-1 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                                <Wrench className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-sm text-foreground">Ongoing Maintenance</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Covers Typst engine updates, bug fixes, and continuous cloud server infrastructure.
                            </p>
                        </div>

                        <div className="group rounded-3xl border border-border/80 dark:border-white/10 bg-card p-6 flex flex-col items-center space-y-3 shadow-xs hover:border-border hover:shadow-md transition-all">
                            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                                <Users className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-sm text-foreground">Community & Features</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Funds new template designs, AI optimization integrations, and contributor tooling.
                            </p>
                        </div>
                    </div>

                    {/* ── 3 Unified Support Methods (Equal Weight & Clear Hierarchy) ── */}
                    <div className="space-y-5 pt-4">
                        <div className="text-center space-y-1">
                            <h2 className="font-display text-xl font-bold text-foreground tracking-tight">
                                Choose How to Contribute
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Three simple, secure methods to support ongoing development.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                            {/* Method 1: Support via UPI */}
                            <div className="rounded-3xl border border-border/80 dark:border-white/10 bg-card p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all hover:shadow-md">
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                                            <QrCode className="h-5 w-5" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            0% Gateway Fees
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-display font-bold text-base text-foreground">
                                            Support via UPI
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                            Instant Indian UPI transfer. Scan dynamic QR or pay directly via Google Pay, PhonePe, Paytm, or BHIM.
                                        </p>
                                    </div>

                                    {/* Copy UPI VPA snippet */}
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/70 dark:border-white/10 text-xs">
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
                                            {copiedUpi ? (
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

                            {/* Method 2: Buy Me a Coffee */}
                            <div className="rounded-3xl border border-border/80 dark:border-white/10 bg-card p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all hover:shadow-md">
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
                                            Support development from anywhere in the world using cards, Apple Pay, Google Pay, or PayPal.
                                        </p>
                                    </div>

                                    <div className="flex items-center p-2.5 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/70 dark:border-white/10 text-xs">
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

                            {/* Method 3: GitHub Sponsors */}
                            <div className="rounded-3xl border border-border/80 dark:border-white/10 bg-card p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-rose-500/40 dark:hover:border-rose-500/40 transition-all hover:shadow-md">
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
                                            Back the project directly on GitHub. Every sponsorship directly supports open-source maintenance.
                                        </p>
                                    </div>

                                    <div className="flex items-center p-2.5 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/70 dark:border-white/10 text-xs">
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

                    {/* Secondary Navigation to Billing Overview */}
                    <div className="pt-2">
                        <Link
                            href="/billing"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Zap className="h-3.5 w-3.5 text-primary" />
                            <span>Looking for Plan & Infrastructure details? View Billing Overview →</span>
                        </Link>
                    </div>

                    {/* Appreciation Note */}
                    <div className="pt-2 text-xs text-muted-foreground space-y-1">
                        <p>Every contribution helps keep LumaCV open and free for job seekers worldwide.</p>
                        <p className="font-semibold text-foreground">Thank you for your support!</p>
                    </div>
                </div>

                {/* In-Place UPI Dialog: Never navigates away from the page */}
                <UpiDonationDialog
                    open={upiModalOpen}
                    onOpenChange={setUpiModalOpen}
                />
            </main>

            <EditorialFooter />
        </div>
    );
}
