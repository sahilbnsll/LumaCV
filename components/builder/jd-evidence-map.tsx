"use client";

import React from 'react';
import { FileCheck, Sparkles, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AtsAlignmentSummary } from '@/lib/resume-schema';

export interface JdAlignmentMapItem {
    requirement: string;
    category: string;
    status: 'matched' | 'partially_matched' | 'missing';
    resumeEvidence: string;
}

interface JdEvidenceMapProps {
    alignmentMap?: JdAlignmentMapItem[];
    atsSummary?: AtsAlignmentSummary;
}

export const JdEvidenceMap = React.memo(function JdEvidenceMap({ alignmentMap, atsSummary }: JdEvidenceMapProps) {
    const isClean = (s?: string) => Boolean(s && !/^\[object\b/i.test(s) && !/\[object\s+object\]/i.test(s));
    const cleanMap = (alignmentMap || []).filter(m => isClean(m.requirement));
    const hasMap = cleanMap.length > 0;
    const hasSummary = Boolean(atsSummary);

    if (!hasMap && !hasSummary) {
        return null;
    }

    return (
        <div className="space-y-3 pt-3 border-t border-border/40">
            {hasSummary && atsSummary && (
                <div className="p-3 rounded-xl bg-primary/[0.04] border border-primary/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            ATS Alignment Summary
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            {atsSummary.overallScore}% ATS Match
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                        <div className="p-1.5 rounded-lg bg-background/80 border border-border/50">
                            <span className="block font-bold text-emerald-500 text-xs">
                                {atsSummary.matchedRequirements.length}
                            </span>
                            <span className="text-muted-foreground">Direct Match</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-background/80 border border-border/50">
                            <span className="block font-bold text-blue-500 text-xs">
                                {atsSummary.partiallyMatchedRequirements.length}
                            </span>
                            <span className="text-muted-foreground">Transferable</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-background/80 border border-border/50">
                            <span className="block font-bold text-amber-500 text-xs">
                                {atsSummary.unsupportedRequirements.length}
                            </span>
                            <span className="text-muted-foreground">Unsupported</span>
                        </div>
                    </div>

                    {atsSummary.incorporatedKeywords.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-border/40">
                            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                <Tag className="h-3 w-3 text-primary" />
                                Incorporated JD Keywords:
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {atsSummary.incorporatedKeywords.filter(isClean).map((kw, i) => (
                                    <span
                                        key={i}
                                        className="text-[9px] px-1.5 py-0.5 rounded bg-background border border-border/60 text-foreground font-mono"
                                    >
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {hasMap && (
                <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                        <FileCheck className="h-3.5 w-3.5 text-primary" />
                        JD Requirements Mapped to Resume Evidence
                    </span>
                    <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                        {cleanMap.map((mapItem, i) => (
                            <div
                                key={i}
                                className="p-2 rounded-lg bg-background/60 border border-border/40 text-[11px] space-y-0.5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-foreground">{mapItem.requirement}</span>
                                    <span
                                        className={cn(
                                            "text-[9px] font-mono uppercase font-bold",
                                            mapItem.status === 'matched' ? "text-emerald-500" : "text-blue-500"
                                        )}
                                    >
                                        {mapItem.status === 'matched' ? '✓ Direct Match' : '≈ Transferable'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    {mapItem.resumeEvidence}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
