"use client";

import React, { useState } from 'react';
import { Target, CheckCircle2, AlertCircle, HelpCircle, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { MatchScoreResponse } from '@/lib/match-score-types';

export type ScoreStatus = 'not_calculated' | 'calculating' | 'calculated' | 'error' | 'no_jd';

interface ScoreGapAnalysisProps {
    scoreNumber: number;
    scoreResponse: MatchScoreResponse | null;
    scoreStatus?: ScoreStatus;
    onRetry?: () => void;
}

export const ScoreGapAnalysis = React.memo(function ScoreGapAnalysis({
    scoreNumber,
    scoreResponse,
    scoreStatus = 'calculated',
    onRetry,
}: ScoreGapAnalysisProps) {
    const [filterTab, setFilterTab] = useState<'all' | 'missing' | 'partial' | 'matched'>('missing');

    // Handle "no_jd"
    if (scoreStatus === 'no_jd') {
        return (
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Standalone Resume Mode</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    ATS scoring requires a target Job Description. You can edit and export this resume anytime, or provide a target JD to evaluate keyword match.
                </p>
            </div>
        );
    }

    // Handle "calculating"
    if (scoreStatus === 'calculating') {
        return (
            <div className="rounded-xl border border-primary/30 bg-primary/[0.04] p-4 space-y-2 text-xs animate-pulse">
                <div className="flex items-center gap-2 font-semibold text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Recalculating ATS Score & Gaps...</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Evaluating resume content across diagnostic competency pillars against your target JD requirements.
                </p>
            </div>
        );
    }

    // Handle "not_calculated" or "error"
    if (scoreStatus === 'error' || (scoreStatus === 'not_calculated' && !scoreResponse)) {
        return (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.05] p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-rose-600 dark:text-rose-400">
                        <AlertCircle className="h-4 w-4" />
                        <span>Unable to Calculate ATS Score</span>
                    </div>
                    {onRetry && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRetry}
                            className="h-7 px-2.5 text-[10px] gap-1 rounded-lg border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
                        >
                            <RefreshCw className="h-3 w-3" />
                            <span>Retry</span>
                        </Button>
                    )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    The score could not be determined for this version. Your resume content is preserved intact. Click retry to re-evaluate against the target JD.
                </p>
            </div>
        );
    }

    const gapAnalysis = scoreResponse?.gapAnalysis;
    const isTargetAchieved = scoreNumber >= 90;

    const isCleanItem = (text?: string) => Boolean(text && !/^\[object\b/i.test(text) && !/\[object\s+object\]/i.test(text));

    // Collect all matched, partially matched, and missing items across categories
    const allMatched: Array<{ item: string; category: string }> = [];
    if (scoreResponse?.breakdown) {
        Object.entries(scoreResponse.breakdown).forEach(([catKey, val]) => {
            const catLabel =
                catKey === 'required_skills'
                    ? 'Required Skill'
                    : catKey === 'preferred_skills'
                        ? 'Preferred Skill'
                        : catKey === 'responsibilities'
                            ? 'Responsibility'
                            : 'Core Terminology';
            val.matched?.forEach((item) => {
                if (isCleanItem(item)) allMatched.push({ item, category: catLabel });
            });
        });
    }

    const partialMatches = (gapAnalysis?.partiallyMatched || []).filter(
        (pm) => isCleanItem(pm.requirement)
    );
    const missingGaps = (gapAnalysis?.remainingGaps || []).filter(
        (g) => isCleanItem(g.missingItem)
    );

    const defaultReason = isTargetAchieved
        ? `Strong ${scoreNumber}% ATS alignment. Candidate satisfies primary technical requirements with minor secondary items remaining.`
        : `Current ATS score is ${scoreNumber}%. Review missing requirements below to unlock higher alignment.`;

    const rawReason = gapAnalysis?.scoreReason || '';
    const displayReason = (rawReason && !rawReason.includes('[object Object]')) ? rawReason : defaultReason;

    return (
        <div
            className={cn(
                "rounded-xl border p-4 space-y-3 text-xs transition-all",
                isTargetAchieved
                    ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                    : "border-amber-500/30 bg-amber-500/[0.04]"
            )}
        >
            <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-2">
                    <Target className={cn("h-4 w-4", isTargetAchieved ? "text-emerald-500" : "text-amber-500")} />
                    Score Analysis & Alignment Details
                </span>
                <span
                    className={cn(
                        "text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border",
                        isTargetAchieved
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    )}
                >
                    {isTargetAchieved ? 'Target Achieved' : 'Optimization Potential'}
                </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
                {displayReason}
            </p>

            {/* Filter pills: Missing | Partially Matched | Matched */}
            <div className="flex items-center gap-1.5 pt-1">
                <button
                    type="button"
                    onClick={() => setFilterTab('missing')}
                    className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer",
                        filterTab === 'missing'
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-2xs"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                    )}
                >
                    Missing ({missingGaps.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilterTab('partial')}
                    className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer",
                        filterTab === 'partial'
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-2xs"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                    )}
                >
                    Partial ({partialMatches.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilterTab('matched')}
                    className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer",
                        filterTab === 'matched'
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                    )}
                >
                    Matched ({allMatched.length})
                </button>
            </div>

            {/* Content per active filter */}
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {filterTab === 'missing' && (
                    <>
                        {missingGaps.length === 0 ? (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 italic py-1 flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                No critical missing requirements! All primary competencies addressed.
                            </p>
                        ) : (
                            missingGaps.map((gap, i) => (
                                <div
                                    key={i}
                                    className="flex items-start justify-between gap-2 p-2 rounded-lg bg-background/80 border border-rose-500/20 text-[11px]"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                                            <span>{gap.missingItem}</span>
                                            <span className="text-[9px] font-mono text-rose-500 px-1.5 py-0.2 rounded bg-rose-500/10">
                                                {gap.category}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                                            {gap.recommendation}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-rose-500 shrink-0">
                                        {gap.impact}
                                    </span>
                                </div>
                            ))
                        )}
                    </>
                )}

                {filterTab === 'partial' && (
                    <>
                        {partialMatches.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground italic py-1">
                                No partially matched items. Requirements are either fully covered or missing.
                            </p>
                        ) : (
                            partialMatches.map((pm, i) => (
                                <div
                                    key={i}
                                    className="p-2 rounded-lg bg-background/80 border border-amber-500/20 text-[11px] space-y-1"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-foreground">{pm.requirement}</span>
                                        <span className="text-[10px] font-mono font-semibold text-amber-500">
                                            {pm.coverage}% token overlap
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Found in resume: <span className="text-foreground font-mono">{pm.evidence}</span>
                                    </p>
                                </div>
                            ))
                        )}
                    </>
                )}

                {filterTab === 'matched' && (
                    <>
                        {allMatched.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground italic py-1">
                                No keywords matched yet. Use Aggressive JD Alignment to bridge terminology.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {allMatched.map((m, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                                    >
                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                        <span>{m.item}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
});
