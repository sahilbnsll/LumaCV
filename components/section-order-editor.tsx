"use client";

import { useMemo, useState } from 'react';
import { GripVertical, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { DEFAULT_SECTION_ORDER, type ResumeSectionKey } from '@/lib/resume-schema';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';

const SECTION_LABELS: Record<ResumeSectionKey, string> = {
    summary: 'Summary',
    techStackSummary: 'Tech Stack Summary',
    skills: 'Skills',
    keyMetrics: 'Key Metrics',
    experience: 'Experience',
    internships: 'Internships',
    education: 'Education',
    projects: 'Projects',
    certifications: 'Certifications',
    achievements: 'Achievements',
    openSource: 'Open Source',
    publications: 'Publications',
    leadership: 'Leadership',
    volunteering: 'Volunteering',
    conferences: 'Conferences',
    languages: 'Languages',
    interests: 'Interests',
    products: 'Products & Systems',
    devopsContributions: 'DevOps / SRE Contributions',
    securityContributions: 'Security / Compliance Work',
    additionalInfo: 'Additional Information',
    customSections: 'Custom Sections',
};

export function SectionOrderEditor({ className, hideHeader }: { className?: string; hideHeader?: boolean }) {
    const resumeData = useAppStore((s) => s.resumeData);
    const setResumeData = useAppStore((s) => s.setResumeData);
    const [dragging, setDragging] = useState<ResumeSectionKey | null>(null);
    const [dragOverKey, setDragOverKey] = useState<ResumeSectionKey | null>(null);

    const order = useMemo(() => {
        const base = resumeData?.sectionOrder?.length ? resumeData.sectionOrder : [...DEFAULT_SECTION_ORDER];
        const seen = new Set<ResumeSectionKey>();
        const merged: ResumeSectionKey[] = [];
        for (const key of base) {
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(key);
            }
        }
        for (const key of DEFAULT_SECTION_ORDER) {
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(key);
            }
        }
        return merged;
    }, [resumeData?.sectionOrder]);

    if (!resumeData) return null;

    const saveOrder = (next: ResumeSectionKey[]) => {
        setResumeData({ ...resumeData, sectionOrder: next });
    };

    const move = (index: number, direction: -1 | 1) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= order.length) return;
        const next = [...order];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        saveOrder(next);
        notify.sectionMoved(SECTION_LABELS[order[index]] || 'Section', direction === -1 ? 'up' : 'down');
    };

    const reorder = (from: ResumeSectionKey, to: ResumeSectionKey) => {
        if (from === to) return;
        const next = [...order];
        const fromIndex = next.indexOf(from);
        const toIndex = next.indexOf(to);
        if (fromIndex === -1 || toIndex === -1) return;
        next.splice(fromIndex, 1);
        next.splice(toIndex, 0, from);
        saveOrder(next);
        notify.sectionMoved(SECTION_LABELS[from] || 'Section');
    };

    const handleResetToDefault = () => {
        saveOrder([...DEFAULT_SECTION_ORDER]);
        notify.info('Section order reset to default layout.');
    };

    return (
        <div className={cn('rounded-xl border border-border/70 bg-card p-4 space-y-3', className)}>
            {!hideHeader && (
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Resume Section Sequence</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Drag sections up or down to reposition their order in your compiled Typst resume.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResetToDefault}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                        title="Reset to default section order"
                    >
                        <RotateCcw className="h-3 w-3" />
                        <span>Reset</span>
                    </Button>
                </div>
            )}

            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                {order.map((key, index) => {
                    const isBeingDragged = dragging === key;
                    const isTargeted = dragOverKey === key && dragging !== key;

                    return (
                        <div
                            key={key}
                            draggable
                            onDragStart={() => setDragging(key)}
                            onDragOver={(event) => {
                                event.preventDefault();
                                if (dragOverKey !== key) setDragOverKey(key);
                            }}
                            onDragLeave={() => {
                                if (dragOverKey === key) setDragOverKey(null);
                            }}
                            onDrop={() => {
                                if (dragging) reorder(dragging, key);
                                setDragging(null);
                                setDragOverKey(null);
                            }}
                            onDragEnd={() => {
                                setDragging(null);
                                setDragOverKey(null);
                            }}
                            className={cn(
                                'flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition-[opacity,border-color,background-color,transform,box-shadow] select-none',
                                isBeingDragged && 'opacity-40 scale-[0.99] border-dashed border-primary/60 bg-primary/5',
                                isTargeted && 'border-primary ring-2 ring-primary/30 bg-primary/10',
                                !isBeingDragged && !isTargeted && 'border-border/60 bg-background/80 hover:border-border'
                            )}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-muted-foreground/50 hover:text-foreground touch-none">
                                    <GripVertical className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-mono text-[10px] text-muted-foreground w-4">
                                    {index + 1}.
                                </span>
                                <span className="font-medium text-foreground truncate">
                                    {SECTION_LABELS[key] || key}
                                </span>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => move(index, -1)}
                                    disabled={index === 0}
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                    title="Move section up"
                                >
                                    <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => move(index, 1)}
                                    disabled={index === order.length - 1}
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                    title="Move section down"
                                >
                                    <ArrowDown className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
