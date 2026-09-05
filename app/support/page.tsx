"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Rocket, Wrench, Users, Copy, Check, ArrowLeft, Zap } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { PulsingHeart } from '@/components/pulsing-heart';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function SupportPage() {
    const [copiedPayment, setCopiedPayment] = useState(false);
    const [openCollectiveModalOpen, setOpenCollectiveModalOpen] = useState(false);
    const paymentHandle = "sahil.bansal@superyes";

    const handleCopyPayment = () => {
        navigator.clipboard.writeText(paymentHandle);
        setCopiedPayment(true);
        toast.success(`Copied UPI ID: ${paymentHandle}`);
        setTimeout(() => setCopiedPayment(false), 2500);
    };

    const handleOpenCollectiveClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpenCollectiveModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-rose-500/20 selection:text-rose-500 transition-colors">
            <AppHeader />

            <main className="flex-1 relative overflow-hidden py-16 sm:py-24 flex items-center justify-center">
                {/* Glowing Heart Backdrop Ambient Bloom */}
                <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-rose-500/10 blur-[140px]" />


                <div className="relative max-w-4xl w-full mx-auto px-4 sm:px-6 text-center space-y-7 z-10">
                    {/* Back Link */}
                    <div className="flex justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/60 hover:bg-muted px-3.5 py-1.5 rounded-full border border-border/60"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back to Home</span>
                        </Link>
                    </div>

                    {/* Top Glowing Animated Heart Emblem (No borders, true heartbeat animation) */}
                    <PulsingHeart size={54} className="mb-2" />

                    {/* Title & Manifesto */}
                    <div className="space-y-3 max-w-xl mx-auto">
                        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white">
                            Support LumaCV
                        </h1>
                        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
                            <p>LumaCV is a free and open-source project, maintained by <a href="https://sahilbansal.net/" target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-white font-medium hover:underline underline-offset-2">Sahil Bansal</a> and a community of contributors.</p>
                            <p>Your donations cover the running costs and keep development going.</p>
                        </div>
                    </div>

                    {/* 3 Pillars Grid: Exactly matching reference card design */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-2 text-center">
                        {/* Card 1: Long-term Sustainability */}
                        <div className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#111317] p-7 sm:p-8 flex flex-col items-center space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-xl hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                            <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-600 dark:text-slate-300 mb-1 transition-transform duration-300 group-hover:scale-110">
                                <Rocket className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white transition-colors">Long-term Sustainability</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Your support keeps the project free and open to everyone, now and later.
                            </p>
                        </div>

                        {/* Card 2: Ongoing Maintenance */}
                        <div className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#111317] p-7 sm:p-8 flex flex-col items-center space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-xl hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                            <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-600 dark:text-slate-300 mb-1 transition-transform duration-300 group-hover:scale-110">
                                <Wrench className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white transition-colors">Ongoing Maintenance</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Donations pay for bug fixes, security updates, and the ordinary work of keeping the app running.
                            </p>
                        </div>

                        {/* Card 3: Grow the Team */}
                        <div className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#111317] p-7 sm:p-8 flex flex-col items-center space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-xl hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                            <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-600 dark:text-slate-300 mb-1 transition-transform duration-300 group-hover:scale-110">
                                <Users className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white transition-colors">Grow the Team</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Help me bring more experienced contributors on board, so the work doesn&apos;t rest on one maintainer.
                            </p>
                        </div>
                    </div>

                    {/* Actions Row: Solid dark buttons matching exact reference */}
                    <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
                        {/* Open Collective */}
                        <button
                            type="button"
                            onClick={handleOpenCollectiveClick}
                            className="group inline-flex items-center gap-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                        >
                            <Heart className="h-4 w-4 fill-rose-500 text-rose-500 transition-transform group-hover:scale-110" />
                            <span>Open Collective</span>
                        </button>

                        {/* GitHub Sponsors */}
                        <a
                            href="https://github.com/sponsors/sahilbnsll"
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center gap-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="shrink-0 text-white transition-transform group-hover:scale-110"
                                aria-hidden="true"
                            >
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            <span>GitHub Sponsors</span>
                        </a>
                    </div>

                    {/* Appreciation Micro-copy */}
                    <div className="pt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <p>Every contribution helps, however small.</p>
                        <p className="font-semibold text-slate-900 dark:text-white">Thank you for your support!</p>
                    </div>
                </div>

                {/* Open Collective & Direct Support Dialog Modal */}
                <Dialog open={openCollectiveModalOpen} onOpenChange={setOpenCollectiveModalOpen}>
                    <DialogContent className="sm:max-w-md glass-lg border-border/80 p-6 space-y-4">
                        <DialogHeader className="space-y-2">
                            <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                                </div>
                                <span>Support LumaCV</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                                LumaCV is completely free and open-source. Your contribution funds Typst compilation servers, AI latency optimizations, and ongoing development.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3.5 pt-1">
                            {/* Direct UPI Contribution Option */}
                            <div className="p-4 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md space-y-2.5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <Zap className="h-3.5 w-3.5 text-primary" />
                                        Direct UPI Contribution
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                                        0% Fees
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/70 bg-background/90 font-mono text-xs text-foreground">
                                    <span className="truncate select-all font-semibold pl-1">{paymentHandle}</span>
                                    <button
                                        type="button"
                                        onClick={handleCopyPayment}
                                        className="shrink-0 h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                                    >
                                        {copiedPayment ? (
                                            <>
                                                <Check className="h-3.5 w-3.5" />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                <span>Copy UPI</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                                    <span>Pay with any UPI app:</span>
                                    <span className="font-mono text-[10px] text-foreground/80 font-medium">
                                        GPay · PhonePe · Paytm · BHIM · Cred
                                    </span>
                                </div>
                            </div>

                            {/* Global Sponsor Options */}
                            <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/30 space-y-2.5">
                                <div className="flex items-center justify-between text-xs font-medium text-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Heart className="h-3.5 w-3.5 text-rose-500" />
                                        International & GitHub Sponsors
                                    </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Our Open Collective collective is currently pending platform review. In the meantime, you can sponsor us via GitHub Sponsors or contribute directly with UPI above.
                                </p>
                                <div className="pt-1 flex items-center gap-2">
                                    <a
                                        href="https://github.com/sponsors/sahilbnsll"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 h-8 px-3 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                                    >
                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                        </svg>
                                        <span>GitHub Sponsors</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>

            <AppFooter />
        </div>
    );
}
