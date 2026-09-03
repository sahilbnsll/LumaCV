"use client";

import { useMemo, useState } from 'react';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { DEFAULT_SECTION_ORDER, type ResumeSectionKey } from '@/lib/resume-schema';

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

export function SectionOrderEditor() {
    const resumeData = useAppStore((s) => s.resumeData);
    const setResumeData = useAppStore((s) => s.setResumeData);
    const [dragging, setDragging] = useState<ResumeSectionKey | null>(null);

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
    };

    return (
        <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold">Section Order</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Drag sections or use arrows to control Typst output order.
            </p>

            <div className="mt-3 space-y-2">
                {order.map((key, index) => (
                    <div
                        key={key}
                        draggable
                        onDragStart={() => setDragging(key)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                            if (dragging) reorder(dragging, key);
                            setDragging(null);
                        }}
                        onDragEnd={() => setDragging(null)}
                        className="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
                    >
                        <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{SECTION_LABELS[key]}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button type="button" variant="ghost" size="icon" onClick={() => move(index, -1)} disabled={index === 0}>
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => move(index, 1)} disabled={index === order.length - 1}>
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
