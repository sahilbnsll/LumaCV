"use client";

import React from 'react';
import { Sparkles, CheckCircle2, Target, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MatchScoreResponse } from '@/lib/match-score-types';

interface SkillsRationaleListProps {
    auditTrailSkills?: Array<{
        skill: string;
        category: string;
        source: string;
        reason: string;
    }>;
    tailoredScore: MatchScoreResponse | null;
}

export const SkillsRationaleList = React.memo(function SkillsRationaleList({
    auditTrailSkills,
    tailoredScore,
}: SkillsRationaleListProps) {
    const matchedKeywords = tailoredScore?.breakdown?.required_skills?.matched || [
        'TypeScript',
        'React',
        'Next.js',
        'PostgreSQL',
        'APIs',
        'Docker',
        'AWS',
    ];
    const missingKeywords = tailoredScore?.breakdown?.required_skills?.missing || [];
    const partiallyMatched = tailoredScore?.gapAnalysis?.partiallyMatched || [];

    return (
        <div className="space-y-4">
            <div>
                <span className="text-xs font-semibold text-foreground block">
                    JD Keyword & Competency Alignment
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                    Transparent breakdown of matched, partially matched, and newly surfaced competencies.
                </p>
            </div>

            {/* Skills Added & Technical Source Rationale */}
            {auditTrailSkills && auditTrailSkills.length > 0 && (
                <div className="space-y-2.5 p-3.5 rounded-xl border border-primary/20 bg-primary/[0.03]">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            Skills Surfaced & Technical Source
                        </span>
                        <span className="text-[10px] font-mono text-primary font-semibold">
                            {auditTrailSkills.length} surfaced
                        </span>
                    </div>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {auditTrailSkills.map((item, i) => (
                            <div
                                key={i}
                                className="p-2 rounded-lg bg-background/70 border border-border/40 text-[11px] space-y-1"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-foreground font-mono">{item.skill}</span>
                                    <span
                                        className={cn(
                                            "text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded",
                                            item.source === 'direct'
                                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                                : item.source === 'transferable'
                                                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                                : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                        )}
                                    >
                                        {item.source}
                                    </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">{item.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Matched Keywords */}
            <div className="space-y-2">
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Direct Matched Keywords
                </span>
                <div className="flex flex-wrap gap-1.5">
                    {matchedKeywords.map((k) => (
                        <span
                            key={k}
                            className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-emerald-500"
                        >
                            {k}
                        </span>
                    ))}
                </div>
            </div>

            {/* Partially Matched Requirements */}
            {partiallyMatched.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-border/40 dark:border-white/5">
                    <span className="text-[11px] font-semibold text-blue-500 flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5" />
                        Partially Matched / Transferable Concepts
                    </span>
                    <div className="space-y-1.5">
                        {partiallyMatched.slice(0, 4).map((pm, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-lg bg-blue-500/[0.04] border border-blue-500/20 text-[11px]"
                            >
                                <span className="font-semibold text-foreground">{pm.requirement}</span>
                                <span className="text-[10px] font-mono text-blue-500">
                                    Matched via: <em>{pm.evidence}</em> ({pm.coverage}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Missing Terms */}
            {missingKeywords.length > 0 ? (
                <div className="space-y-2 pt-3 border-t border-border/40 dark:border-white/5">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                        Remaining Unmatched Terms
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {missingKeywords.map((k) => (
                            <span
                                key={k}
                                className="rounded-full border border-border/60 dark:border-white/10 bg-muted/40 dark:bg-white/5 px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground"
                            >
                                {k}
                            </span>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="pt-3 border-t border-border/40 dark:border-white/5 text-[11px] text-emerald-500 flex items-center gap-1.5 font-medium">
                    <Check className="h-3.5 w-3.5" />
                    <span>All primary required skills are represented in your resume.</span>
                </div>
            )}
        </div>
    );
});
