"use client";

import React from 'react';
import { FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JdAlignmentMapItem {
    requirement: string;
    category: string;
    status: 'matched' | 'partially_matched' | 'missing';
    resumeEvidence: string;
}

interface JdEvidenceMapProps {
    alignmentMap?: JdAlignmentMapItem[];
}

export const JdEvidenceMap = React.memo(function JdEvidenceMap({ alignmentMap }: JdEvidenceMapProps) {
    if (!alignmentMap || alignmentMap.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2 pt-3 border-t border-border/40 dark:border-white/5">
            <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5 text-primary" />
                JD Requirements Mapped to Resume Evidence
            </span>
            <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                {alignmentMap.map((mapItem, i) => (
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
    );
});
