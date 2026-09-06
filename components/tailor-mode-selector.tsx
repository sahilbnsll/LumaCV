"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ShieldCheck, Sparkles, Check, Info, Target, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TailorModeSelector({ className }: { className?: string }) {
    const tailorMode = useAppStore((s) => s.tailorMode);
    const setTailorMode = useAppStore((s) => s.setTailorMode);
    const hasJd = useAppStore((s) => Boolean(s.jd && s.jd.trim().length > 20));

    return (
        <div className={cn("space-y-3.5", className)}>
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5 font-mono">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        Select AI Generation Mode
                    </label>
                    <p className="text-xs text-muted-foreground">
                        Explicitly control whether AI preserves 100% verified facts or optimizes aggressively for a job description.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* MODE 1: Optimize Resume (Strictly Fact-Preserving) */}
                <div
                    onClick={() => setTailorMode('optimize')}
                    className={cn(
                        "relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left select-none",
                        tailorMode === 'optimize'
                            ? "border-emerald-500/80 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.07] ring-2 ring-emerald-500/40 shadow-sm"
                            : "border-border/70 bg-card/60 hover:border-border hover:bg-card/90"
                    )}
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                <ShieldCheck className="h-3 w-3" />
                                100% Fact-Preserving
                            </span>
                            {tailorMode === 'optimize' && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                                    <Check className="h-3 w-3 stroke-[3]" />
                                </span>
                            )}
                        </div>

                        <div>
                            <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
                                <span>Optimize Resume</span>
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Enhances grammar, executive phrasing, bullet structure, and ATS formatting using <strong>only the verified tools and roles already in your resume</strong>.
                            </p>
                        </div>

                        <div className="pt-2 border-t border-border/40 dark:border-white/5 space-y-1 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                <Check className="h-3 w-3 shrink-0" />
                                <span>Zero hallucination: Never fabricates new tools or tasks</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Check className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span>High-impact action verbs and quantitative clarity</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODE 2: Tailor Resume to JD (Aggressive Target Alignment) */}
                <div
                    onClick={() => setTailorMode('tailor')}
                    className={cn(
                        "relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left select-none",
                        tailorMode === 'tailor'
                            ? "border-primary bg-primary/[0.04] dark:bg-primary/[0.07] ring-2 ring-primary/40 shadow-sm"
                            : "border-border/70 bg-card/60 hover:border-border hover:bg-card/90"
                    )}
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                                <Target className="h-3 w-3" />
                                Aggressive JD Alignment
                            </span>
                            {tailorMode === 'tailor' && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                                    <Check className="h-3 w-3 stroke-[3]" />
                                </span>
                            )}
                        </div>

                        <div>
                            <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
                                <span>Tailor Resume to JD</span>
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Intelligently rephrases and restructures experience to directly match the target job description, introducing relevant domain keywords and plausible context.
                            </p>
                        </div>

                        <div className="pt-2 border-t border-border/40 dark:border-white/5 space-y-1 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1.5 text-primary font-medium">
                                <Sparkles className="h-3 w-3 shrink-0" />
                                <span>Injects target JD terminology to maximize ATS match score</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Check className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span>Plausibly expands role scope to mirror required qualifications</span>
                            </div>
                        </div>
                    </div>

                    {!hasJd && tailorMode === 'tailor' && (
                        <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>No Job Description was provided in Step 1. Mode will adapt to industry best practices.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
