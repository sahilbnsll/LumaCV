"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { ShieldCheck, Sparkles, Check, Target, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { notify } from '@/lib/notify';

export function TailorModeSelector({ className }: { className?: string }) {
    const tailorMode = useAppStore((s) => s.tailorMode);
    const setTailorMode = useAppStore((s) => s.setTailorMode);
    const hasJd = useAppStore((s) => Boolean(s.jd && s.jd.trim().length > 20));

    const handleSelectMode = (mode: 'optimize' | 'tailor') => {
        setTailorMode(mode);
        if (mode === 'optimize') {
            notify.success('Optimization mode enabled', '100% Fact-preserving enhancements');
        } else {
            notify.info('Alignment mode enabled', 'Aggressive job description keyword matching');
        }
    };

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MODE 1: Optimize Resume (Strictly Fact-Preserving) */}
                <div
                    onClick={() => handleSelectMode('optimize')}
                    className={cn(
                        "group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-[border-color,background-color,box-shadow,transform] duration-200 cursor-pointer text-left select-none",
                        tailorMode === 'optimize'
                            ? "border-emerald-500/70 bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08] ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/5 -translate-y-0.5"
                            : "border-border/70 bg-card/60 hover:border-emerald-500/30 hover:bg-card/90 hover:-translate-y-0.5 hover:shadow-sm"
                    )}
                >
                    <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-colors",
                                tailorMode === 'optimize'
                                    ? "bg-emerald-500 text-white shadow-sm"
                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/15"
                            )}>
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <span
                                className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded-full shrink-0 transition-[background-color,color,box-shadow,transform,opacity]",
                                    tailorMode === 'optimize'
                                        ? "bg-emerald-500 text-white shadow-xs scale-100 opacity-100"
                                        : "border border-border/70 text-transparent scale-90 opacity-60"
                                )}
                            >
                                <Check className="h-3 w-3 stroke-[3]" />
                            </span>
                        </div>

                        <div>
                            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                                100% Fact-Preserving
                            </span>
                            <h4 className="font-display font-bold text-base text-foreground">
                                Optimize Resume
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Enhances grammar, executive phrasing, bullet structure, and ATS formatting using <strong className="text-foreground/90">only the verified tools and roles already in your resume</strong>.
                            </p>
                        </div>

                        <div className="pt-2.5 border-t border-border/40 space-y-1.5 text-[11px] text-muted-foreground">
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
                    onClick={() => handleSelectMode('tailor')}
                    className={cn(
                        "group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-[border-color,background-color,box-shadow,transform] duration-200 cursor-pointer text-left select-none",
                        tailorMode === 'tailor'
                            ? "border-primary/70 bg-primary/[0.05] ring-2 ring-primary/30 shadow-md shadow-primary/5 -translate-y-0.5"
                            : "border-border/70 bg-card/60 hover:border-primary/30 hover:bg-card/90 hover:-translate-y-0.5 hover:shadow-sm"
                    )}
                >
                    <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-colors",
                                tailorMode === 'tailor'
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-primary/10 text-primary group-hover:bg-primary/15"
                            )}>
                                <Target className="h-5 w-5" />
                            </div>
                            <span
                                className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded-full shrink-0 transition-[background-color,color,box-shadow,transform,opacity]",
                                    tailorMode === 'tailor'
                                        ? "bg-primary text-white shadow-xs scale-100 opacity-100"
                                        : "border border-border/70 text-transparent scale-90 opacity-60"
                                )}
                            >
                                <Check className="h-3 w-3 stroke-[3]" />
                            </span>
                        </div>

                        <div>
                            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                                Target JD Alignment
                            </span>
                            <h4 className="font-display font-bold text-base text-foreground">
                                Aggressive JD Alignment
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Aggressively rewrites, reorders, and reframes experience to maximize ATS keyword match against the target job description, bending the wording, not the facts.
                            </p>
                        </div>

                        <div className="pt-2.5 border-t border-border/40 space-y-1.5 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1.5 text-primary font-medium">
                                <Sparkles className="h-3 w-3 shrink-0" />
                                <span>Maximizes ATS keyword coverage with target JD terminology</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Check className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span>Semantic matching & bullet reordering without inventing facts</span>
                            </div>
                        </div>
                    </div>

                    {!hasJd && tailorMode === 'tailor' && (
                        <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>No Job Description was provided in Step 1. Mode will adapt to industry best practices.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
