"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Check, RotateCcw, Clock, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ResumeData } from '@/lib/resume-schema';
import { toast } from 'sonner';

export interface VersionSnapshot {
    id: string;
    versionNumber: number;
    label: string;
    timestamp: string;
    score: number;
    template: string;
    resumeData: ResumeData;
}

interface VersionHistoryDrawerProps {
    open: boolean;
    onClose: () => void;
    currentResume: ResumeData;
    originalResume?: ResumeData | null;
    currentScore: number;
    originalScore?: number;
    onRestoreVersion: (data: ResumeData, label: string) => void;
}

export function VersionHistoryDrawer({
    open,
    onClose,
    currentResume,
    originalResume,
    currentScore,
    originalScore = 65,
    onRestoreVersion,
}: VersionHistoryDrawerProps) {
    const [selectedVersionId, setSelectedVersionId] = useState<string>('current');

    // Build timeline snapshots
    const versions: VersionSnapshot[] = [
        {
            id: 'current',
            versionNumber: 2,
            label: 'Current Tailored Draft',
            timestamp: 'Just now (Working draft)',
            score: currentScore,
            template: 'Active',
            resumeData: currentResume,
        },
        ...(originalResume ? [{
            id: 'original',
            versionNumber: 1,
            label: 'Original Source Resume',
            timestamp: 'Initial upload baseline',
            score: originalScore,
            template: 'Source',
            resumeData: originalResume,
        }] : []),
    ];

    const handleRestore = (ver: VersionSnapshot) => {
        onRestoreVersion(ver.resumeData, ver.label);
        toast.success(`Restored "${ver.label}"`);
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/60 backdrop-blur-xs"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                        className="relative z-10 w-full max-w-md h-full bg-card border-l border-border/60 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
                    >
                        <div>
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-border/50">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                        <History className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-foreground">Version History</h2>
                                        <p className="text-[11px] text-muted-foreground">Snapshot timeline of changes & scores</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Timeline list */}
                            <div className="mt-6 space-y-4">
                                {versions.map((ver) => {
                                    const isSelected = selectedVersionId === ver.id;

                                    const isCurrent = ver.id === 'current';
                                    return (
                                        <div
                                            key={ver.id}
                                            onClick={() => setSelectedVersionId(ver.id)}
                                            className={`rounded-xl border p-4 transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'border-primary/60 bg-primary/[0.03] shadow-xs'
                                                    : 'border-border/60 bg-muted/10 hover:border-border'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[11px] font-bold text-primary">
                                                        v{ver.versionNumber}.0
                                                    </span>
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {ver.label}
                                                    </span>
                                                </div>

                                                <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                                                    ver.score >= 80
                                                        ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                                                        : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                                }`}>
                                                    {ver.score}/100 Match
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3">
                                                <Clock className="h-3 w-3" />
                                                <span>{ver.timestamp}</span>
                                            </div>

                                            <div className="rounded-lg bg-muted/30 p-2.5 text-[11px] text-muted-foreground space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Experience Roles:</span>
                                                    <span className="font-medium text-foreground">{ver.resumeData.experience?.length || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Skill Categories:</span>
                                                    <span className="font-medium text-foreground">{ver.resumeData.skills?.length || 0}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
                                                {isCurrent ? (
                                                    <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                                                        <Check className="h-3 w-3" />
                                                        Currently Active in Workspace
                                                    </span>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRestore(ver);
                                                        }}
                                                        className="h-7 text-xs gap-1.5 border-border/80 hover:bg-primary hover:text-primary-foreground"
                                                    >
                                                        <RotateCcw className="h-3 w-3" />
                                                        <span>Restore This Version</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Drawer Bottom Info */}
                        <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>All version restores preserve your fact-checked verification locks.</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
