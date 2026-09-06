"use client";

import React, { useState } from 'react';
import { Copy, CheckCheck, Undo2, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface ExplainableBullet {
    role: string;
    company: string;
    original: string;
    tailored: string;
    index: number;
    reason?: string;
    changeType?: string;
    evidenceSafety?: string;
}

interface BulletDiffViewerProps {
    bullets: ExplainableBullet[];
    revertedBullets: Record<string, boolean>;
    onToggleRevert: (index: number) => void;
}

export const BulletDiffViewer = React.memo(function BulletDiffViewer({
    bullets,
    revertedBullets,
    onToggleRevert,
}: BulletDiffViewerProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('Bullet copied to clipboard');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                    Before → After Bullet Alignments
                </span>
                <span className="text-[11px] text-muted-foreground">
                    {bullets.length} changed bullets
                </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
                Transparent audit of every modified bullet. Accept the enhanced version or restore your original phrasing anytime.
            </p>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {bullets.map((item) => {
                    const isReverted = revertedBullets[item.index];
                    const activeText = isReverted ? item.original : item.tailored;

                    return (
                        <div
                            key={item.index}
                            className="rounded-2xl border border-border/70 dark:border-white/10 bg-muted/20 dark:bg-[#13161c]/50 p-4 space-y-3 text-xs shadow-xs"
                        >
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-2 border-b border-border/40 dark:border-white/5">
                                <span className="font-semibold text-foreground truncate max-w-[200px]">
                                    {item.role} • {item.company}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(activeText, item.index)}
                                        aria-label="Copy bullet point text"
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none"
                                        title="Copy bullet"
                                    >
                                        {copiedIndex === item.index ? (
                                            <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onToggleRevert(item.index)}
                                        className={cn(
                                            "text-[11px] font-mono px-2.5 py-0.5 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none",
                                            isReverted
                                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/25 hover:bg-amber-500/20"
                                                : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 hover:bg-emerald-500/20"
                                        )}
                                    >
                                        {isReverted ? (
                                            <>
                                                <Undo2 className="h-3 w-3" />
                                                <span>Restore AI</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-3 w-3 text-emerald-500" />
                                                <span>Accepted</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Before vs After */}
                            <div className="space-y-2">
                                {item.original !== item.tailored && (
                                    <div className="p-3 rounded-xl bg-muted/40 dark:bg-white/[0.02] border border-border/40 dark:border-white/5 text-[11px] text-muted-foreground space-y-1">
                                        <span className="text-[10px] font-mono text-muted-foreground/80 uppercase tracking-wider block">
                                            Original Draft
                                        </span>
                                        <p className="line-through leading-relaxed opacity-75">{item.original}</p>
                                    </div>
                                )}
                                <div className="p-3 rounded-xl bg-primary/[0.06] border border-primary/20 text-[11px] text-foreground space-y-1">
                                    <span className="text-[10px] font-mono text-primary font-semibold uppercase tracking-wider block">
                                        {isReverted ? 'Original Kept' : 'Tailored Alignment'}
                                    </span>
                                    <p className="leading-relaxed font-medium">{activeText}</p>
                                </div>
                            </div>

                            {/* Why this changed & Evidence Safety */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/30 dark:border-white/5 text-[10px]">
                                <div className="flex items-center gap-1.5 text-emerald-500">
                                    <Sparkles className="h-3 w-3" />
                                    <span>{item.reason || 'Enhanced action verb & metric focus'}</span>
                                </div>
                                <span className="text-[9px] font-mono text-muted-foreground">
                                    {item.evidenceSafety || 'Verified against candidate history'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
