"use client";

import React from 'react';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MatchScoreResponse } from '@/lib/match-score-types';

interface ScoreGapAnalysisProps {
    scoreNumber: number;
    scoreResponse: MatchScoreResponse | null;
}

export const ScoreGapAnalysis = React.memo(function ScoreGapAnalysis({ scoreNumber, scoreResponse }: ScoreGapAnalysisProps) {
    const gapAnalysis = scoreResponse?.gapAnalysis;
    const isTargetAchieved = scoreNumber >= 92;

    const defaultReason = isTargetAchieved
        ? `Strong ${scoreNumber}% ATS match. Candidate satisfies primary technical requirements with minor secondary buzzwords remaining.`
        : `Current ATS score is ${scoreNumber}%. Review missing requirements below to unlock higher alignment.`;

    return (
        <div
            className={cn(
                "rounded-xl border p-4 space-y-2.5 text-xs transition-all",
                isTargetAchieved
                    ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                    : "border-amber-500/30 bg-amber-500/[0.04]"
            )}
        >
            <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-2">
                    <Target className={cn("h-4 w-4", isTargetAchieved ? "text-emerald-500" : "text-amber-500")} />
                    Score Analysis & Remaining Gaps
                </span>
                <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-background/80 border border-border/60">
                    {isTargetAchieved ? 'Target Achieved' : 'Optimization Potential'}
                </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
                {gapAnalysis?.scoreReason || defaultReason}
            </p>

            {/* List of Remaining Gaps */}
            {gapAnalysis?.remainingGaps && gapAnalysis.remainingGaps.length > 0 && scoreNumber < 98 && (
                <div className="pt-2 border-t border-border/40 dark:border-white/5 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block">
                        Identified Competency Gaps:
                    </span>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                        {gapAnalysis.remainingGaps.slice(0, 5).map((gap, i) => (
                            <div
                                key={i}
                                className="flex items-start justify-between gap-2 p-2 rounded-lg bg-background/60 border border-border/40 text-[11px]"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                                        <span>{gap.missingItem}</span>
                                        <span className="text-[9px] font-mono text-muted-foreground px-1.5 py-0.2 rounded bg-muted/60">
                                            {gap.category}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                                        {gap.recommendation}
                                    </p>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-amber-500 shrink-0">
                                    {gap.impact}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
