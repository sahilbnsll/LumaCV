"use client";

import React, { useState, useMemo, useCallback } from 'react';
import {
    User, FileText, Code2, Wrench, Briefcase, FolderGit2,
    GraduationCap, Award, Trophy, GitFork, BookOpen,
    Users, HeartHandshake, Mic2, Languages, Compass,
    Package, Terminal, Shield, PlusCircle, Check,
    ChevronLeft, ChevronRight, Trash2, ArrowUp, ArrowDown,
    Plus, CheckCircle2, ChevronDown, ChevronUp,
    GripVertical, SlidersHorizontal, Copy,
    Search, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { SectionOrderEditor } from '@/components/section-order-editor';
import { useAppStore } from '@/lib/store';
import { DEFAULT_SECTION_ORDER, type ResumeData, type ResumeSectionKey } from '@/lib/resume-schema';
import { cn } from '@/lib/utils';
import { notify } from '@/lib/notify';

export type EditorSectionKey = 'personalInfo' | ResumeSectionKey;

// Section array items have different shapes (experience has company/role,
// education has institution/degree, skills just has a name, etc.). This
// tries the fields most likely to identify the specific entry so reorder/
// duplicate toasts can say "Senior Engineer moved down" instead of a bare
// "Item repositioned" that leaves you guessing which one changed.
function getEntryLabel(item: unknown): string | undefined {
    if (!item || typeof item !== 'object') return undefined;
    const obj = item as Record<string, unknown>;
    const candidate =
        obj.role || obj.title || obj.company || obj.institution ||
        obj.degree || obj.name || obj.organization || obj.projectName;
    return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : undefined;
}

interface SectionMeta {
    key: EditorSectionKey;
    label: string;
    description: string;
    icon: React.ElementType;
}

const SECTION_METAS: SectionMeta[] = [
    { key: 'personalInfo', label: 'Personal Info', description: 'Contact details and header branding', icon: User },
    { key: 'summary', label: 'Summary', description: 'Targeted professional summary', icon: FileText },
    { key: 'techStackSummary', label: 'Tech Stack', description: 'High-level core architectural stack', icon: Code2 },
    { key: 'skills', label: 'Skills', description: 'Grouped technical competencies', icon: Wrench },
    { key: 'experience', label: 'Experience', description: 'Work history and career chronology', icon: Briefcase },
    { key: 'projects', label: 'Projects', description: 'Notable software & technical projects', icon: FolderGit2 },
    { key: 'education', label: 'Education', description: 'Degrees, coursework, and honors', icon: GraduationCap },
    { key: 'keyMetrics', label: 'Key Metrics', description: 'Quantifiable career highlights', icon: Trophy },
    { key: 'certifications', label: 'Certifications', description: 'Credentials and licenses', icon: Award },
    { key: 'achievements', label: 'Achievements', description: 'Honors, awards, and recognitions', icon: Trophy },
    { key: 'internships', label: 'Internships', description: 'Co-op and internship experiences', icon: Briefcase },
    { key: 'openSource', label: 'Open Source', description: 'OSS contributions and repositories', icon: GitFork },
    { key: 'publications', label: 'Publications', description: 'Research papers and articles', icon: BookOpen },
    { key: 'leadership', label: 'Leadership', description: 'Community & student leadership', icon: Users },
    { key: 'volunteering', label: 'Volunteering', description: 'Social impact & volunteering', icon: HeartHandshake },
    { key: 'conferences', label: 'Conferences', description: 'Talks and attendances', icon: Mic2 },
    { key: 'languages', label: 'Languages', description: 'Spoken and written proficiencies', icon: Languages },
    { key: 'interests', label: 'Interests', description: 'Personal pursuits and hobbies', icon: Compass },
    { key: 'products', label: 'Products & Systems', description: 'Commercial products delivered', icon: Package },
    { key: 'devopsContributions', label: 'DevOps & SRE', description: 'Infrastructure & platform highlights', icon: Terminal },
    { key: 'securityContributions', label: 'Security & Compliance', description: 'Security engineering & audits', icon: Shield },
    { key: 'additionalInfo', label: 'Additional Info', description: 'Work authorization & relocation', icon: PlusCircle },
    { key: 'customSections', label: 'Custom Sections', description: 'Arbitrary bespoke resume sections', icon: PlusCircle },
];

export type SectionCategory = 'all' | 'core' | 'projects' | 'credentials' | 'additional';

export const CATEGORY_MAP: Record<SectionCategory, string[]> = {
    all: SECTION_METAS.map((m) => m.key),
    core: ['personalInfo', 'summary', 'techStackSummary', 'skills'],
    projects: ['experience', 'projects', 'internships', 'keyMetrics', 'products', 'openSource'],
    credentials: ['education', 'certifications', 'achievements', 'publications', 'conferences'],
    additional: ['languages', 'leadership', 'volunteering', 'interests', 'devopsContributions', 'securityContributions', 'additionalInfo', 'customSections'],
};

export function CompactResumeEditor({ className }: { className?: string }) {
    const resumeData = useAppStore((s) => s.resumeData);
    const setResumeData = useAppStore((s) => s.setResumeData);

    const [activeSection, setActiveSection] = useState<EditorSectionKey>('personalInfo');
    const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(0);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<SectionCategory>('all');
    const [sectionSearchQuery, setSectionSearchQuery] = useState('');

    // Drag-and-drop states for items inside sections and section tabs
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
    const [draggedSectionKey, setDraggedSectionKey] = useState<ResumeSectionKey | null>(null);
    const [dragOverSectionKey, setDragOverSectionKey] = useState<ResumeSectionKey | null>(null);
    const [isSectionOrderModalOpen, setIsSectionOrderModalOpen] = useState(false);

    // Section item counts for navigator badges
    const sectionCounts = useMemo(() => {
        if (!resumeData) return {};
        return {
            personalInfo: resumeData.personalInfo?.name ? '✓' : '',
            summary: resumeData.summary ? '✓' : '',
            techStackSummary: resumeData.techStackSummary ? '✓' : '',
            skills: resumeData.skills?.length ? `${resumeData.skills.length}` : '',
            experience: resumeData.experience?.length ? `${resumeData.experience.length}` : '',
            projects: resumeData.projects?.length ? `${resumeData.projects.length}` : '',
            education: resumeData.education?.length ? `${resumeData.education.length}` : '',
            keyMetrics: resumeData.keyMetrics?.length ? `${resumeData.keyMetrics.length}` : '',
            certifications: resumeData.certifications?.length ? `${resumeData.certifications.length}` : '',
            achievements: resumeData.achievements?.length ? `${resumeData.achievements.length}` : '',
            internships: resumeData.internships?.length ? `${resumeData.internships.length}` : '',
            openSource: resumeData.openSource?.length ? `${resumeData.openSource.length}` : '',
            publications: resumeData.publications?.length ? `${resumeData.publications.length}` : '',
            leadership: resumeData.leadership?.length ? `${resumeData.leadership.length}` : '',
            volunteering: resumeData.volunteering?.length ? `${resumeData.volunteering.length}` : '',
            conferences: resumeData.conferences?.length ? `${resumeData.conferences.length}` : '',
            languages: resumeData.languages?.length ? `${resumeData.languages.length}` : '',
            interests: resumeData.interests?.length ? `${resumeData.interests.length}` : '',
            products: resumeData.products?.length ? `${resumeData.products.length}` : '',
            devopsContributions: resumeData.devopsContributions?.length ? `${resumeData.devopsContributions.length}` : '',
            securityContributions: resumeData.securityContributions?.length ? `${resumeData.securityContributions.length}` : '',
            additionalInfo: resumeData.additionalInfo?.workAuthorization ? '✓' : '',
            customSections: resumeData.customSections?.length ? `${resumeData.customSections.length}` : '',
        };
    }, [resumeData]);

    const sortedSectionMetas = useMemo(() => {
        const order = resumeData?.sectionOrder?.length ? resumeData.sectionOrder : DEFAULT_SECTION_ORDER;
        const personal = SECTION_METAS.find((m) => m.key === 'personalInfo')!;
        const remaining = SECTION_METAS.filter((m) => m.key !== 'personalInfo');
        remaining.sort((a, b) => {
            const idxA = order.indexOf(a.key as ResumeSectionKey);
            const idxB = order.indexOf(b.key as ResumeSectionKey);
            return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
        });
        return [personal, ...remaining];
    }, [resumeData?.sectionOrder]);

    const filteredSectionMetas = useMemo(() => {
        return sortedSectionMetas.filter((meta) => {
            if (selectedCategory !== 'all') {
                const allowed = CATEGORY_MAP[selectedCategory] || [];
                if (!allowed.includes(meta.key)) return false;
            }
            if (sectionSearchQuery.trim()) {
                const q = sectionSearchQuery.toLowerCase().trim();
                return (
                    meta.label.toLowerCase().includes(q) ||
                    meta.description.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [sortedSectionMetas, selectedCategory, sectionSearchQuery]);

    const activeMeta = sortedSectionMetas.find((m) => m.key === activeSection) || sortedSectionMetas[0];
    const currentIndex = sortedSectionMetas.findIndex((m) => m.key === activeSection);
    const prevSection = currentIndex > 0 ? sortedSectionMetas[currentIndex - 1] : null;
    const nextSection = currentIndex < sortedSectionMetas.length - 1 ? sortedSectionMetas[currentIndex + 1] : null;

    // Helper to update resume data
    const updateData = useCallback(
        (updater: (prev: ResumeData) => ResumeData) => {
            if (!resumeData) return;
            const updated = updater(resumeData);
            setResumeData(updated);
            setHasUnsavedChanges(true);
        },
        [resumeData, setResumeData]
    );

    // Section order mover
    const moveSectionOrder = (key: ResumeSectionKey, direction: 'up' | 'down') => {
        if (!resumeData) return;
        const currentOrder = [...(resumeData.sectionOrder?.length ? resumeData.sectionOrder : DEFAULT_SECTION_ORDER)];
        const idx = currentOrder.indexOf(key);
        if (idx < 0) return;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= currentOrder.length) return;
        const temp = currentOrder[idx];
        currentOrder[idx] = currentOrder[targetIdx];
        currentOrder[targetIdx] = temp;
        updateData((prev) => ({ ...prev, sectionOrder: currentOrder }));
        notify.sectionMoved(key, direction);
    };

    // Reorder items within any section array
    const reorderArrayItems = useCallback(
        (sectionKey: string, fromIndex: number, toIndex: number) => {
            if (!resumeData || fromIndex === toIndex) return;
            const currentList = [...((resumeData as any)[sectionKey] || [])];
            if (fromIndex < 0 || fromIndex >= currentList.length || toIndex < 0 || toIndex >= currentList.length) return;
            const [movedItem] = currentList.splice(fromIndex, 1);
            currentList.splice(toIndex, 0, movedItem);
            updateData((prev) => ({ ...prev, [sectionKey]: currentList }));
            setExpandedCardIndex(toIndex);
            const label = getEntryLabel(movedItem);
            notify.info('Item repositioned', label ? `${label} moved to position ${toIndex + 1}` : undefined);
        },
        [resumeData, updateData]
    );

    // 1-click arrow mover for items in any section array
    const moveArrayItem = useCallback(
        (sectionKey: string, index: number, direction: 'up' | 'down') => {
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            reorderArrayItems(sectionKey, index, targetIndex);
        },
        [reorderArrayItems]
    );

    // Duplicate any entry in a section array
    const duplicateArrayItem = useCallback(
        (sectionKey: string, index: number) => {
            if (!resumeData) return;
            const currentList = [...((resumeData as any)[sectionKey] || [])];
            if (index < 0 || index >= currentList.length) return;
            const itemToClone = JSON.parse(JSON.stringify(currentList[index]));
            currentList.splice(index + 1, 0, itemToClone);
            updateData((prev) => ({ ...prev, [sectionKey]: currentList }));
            setExpandedCardIndex(index + 1);
            const label = getEntryLabel(itemToClone);
            notify.info('Entry duplicated', label ? `Copy of "${label}" added below` : undefined);
        },
        [resumeData, updateData]
    );

    // Reorder section order via direct drag-and-drop
    const reorderSectionOrder = useCallback(
        (fromKey: ResumeSectionKey, toKey: ResumeSectionKey) => {
            if (!resumeData || fromKey === toKey) return;
            const order = [...(resumeData.sectionOrder?.length ? resumeData.sectionOrder : DEFAULT_SECTION_ORDER)];
            const fromIdx = order.indexOf(fromKey);
            const toIdx = order.indexOf(toKey);
            if (fromIdx === -1 || toIdx === -1) return;
            order.splice(fromIdx, 1);
            order.splice(toIdx, 0, fromKey);
            updateData((prev) => ({ ...prev, sectionOrder: order }));
            notify.sectionMoved(fromKey);
        },
        [resumeData, updateData]
    );

    if (!resumeData) {
        return (
            <div className="p-8 text-center text-muted-foreground text-xs">
                No resume data loaded. Please upload a resume or start in Step 1.
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col lg:flex-row gap-4 w-full', className)}>
            {/* ── LEFT PANE: Sticky Section Navigator ── */}
            <aside className="lg:w-52 xl:w-56 shrink-0">
                <div className="lg:sticky lg:top-4 rounded-2xl border border-border bg-card p-2.5 shadow-sm space-y-2">
                    <div className="px-1.5 pt-1 pb-1.5 flex items-center justify-between border-b border-border/40">
                        <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-muted-foreground">
                            Sections
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                            {filteredSectionMetas.length} / {sortedSectionMetas.length}
                        </span>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                        {(
                            [
                                { id: 'all', label: 'All' },
                                { id: 'core', label: 'Core' },
                                { id: 'projects', label: 'Projects' },
                                { id: 'credentials', label: 'Creds' },
                                { id: 'additional', label: 'More' },
                            ] as const
                        ).map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "px-2 py-0.5 rounded-lg font-medium transition-colors shrink-0 cursor-pointer",
                                    selectedCategory === cat.id
                                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter / Search Input */}
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input
                            placeholder="Filter sections..."
                            value={sectionSearchQuery}
                            onChange={(e) => setSectionSearchQuery(e.target.value)}
                            className="h-7 pl-7 pr-6 text-[11px] bg-muted/20 border-border/60 rounded-lg"
                        />
                        {sectionSearchQuery && (
                            <button
                                type="button"
                                onClick={() => setSectionSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    {/* Section List (Desktop: Vertical stack; Mobile: Horizontal scrolling row) */}
                    <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto max-h-[60vh] pr-0.5 no-scrollbar">
                        {filteredSectionMetas.length === 0 ? (
                            <div className="py-4 text-center text-xs text-muted-foreground space-y-1.5">
                                <p>No sections match</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        setSectionSearchQuery('');
                                    }}
                                    className="text-[11px] font-semibold text-primary hover:underline"
                                >
                                    Reset filters
                                </button>
                            </div>
                        ) : (
                            filteredSectionMetas.map((meta) => {
                                const Icon = meta.icon;
                                const isActive = activeSection === meta.key;
                                const count = (sectionCounts as any)[meta.key];
                                const canMove = meta.key !== 'personalInfo';
                                const isSectionDragging = draggedSectionKey === meta.key;
                                const isSectionDragOver = dragOverSectionKey === meta.key && draggedSectionKey !== meta.key;

                                return (
                                    <div
                                        key={meta.key}
                                        draggable={canMove}
                                        onDragStart={(e) => {
                                            if (!canMove) return;
                                            e.dataTransfer.setData('text/plain', meta.key);
                                            e.dataTransfer.effectAllowed = 'move';
                                            setDraggedSectionKey(meta.key as ResumeSectionKey);
                                        }}
                                        onDragOver={(e) => {
                                            if (!canMove || !draggedSectionKey) return;
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            if (dragOverSectionKey !== meta.key) {
                                                setDragOverSectionKey(meta.key as ResumeSectionKey);
                                            }
                                        }}
                                        onDragLeave={() => {
                                            if (dragOverSectionKey === meta.key) setDragOverSectionKey(null);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (canMove && draggedSectionKey && draggedSectionKey !== meta.key) {
                                                reorderSectionOrder(draggedSectionKey, meta.key as ResumeSectionKey);
                                            }
                                            setDraggedSectionKey(null);
                                            setDragOverSectionKey(null);
                                        }}
                                        onDragEnd={() => {
                                            setDraggedSectionKey(null);
                                            setDragOverSectionKey(null);
                                        }}
                                        className={cn(
                                            'group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer select-none shrink-0 lg:shrink',
                                            isSectionDragging && 'opacity-40 scale-[0.98] border border-dashed border-primary/50',
                                            isSectionDragOver && 'border border-primary ring-1 ring-primary/40 bg-primary/10',
                                            isActive
                                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                        )}
                                        onClick={() => {
                                            setActiveSection(meta.key);
                                            setExpandedCardIndex(0);
                                        }}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {canMove && (
                                                <div
                                                    className={cn(
                                                        'cursor-grab active:cursor-grabbing p-0.5 -ml-1 touch-none opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block',
                                                        isActive ? 'text-primary-foreground/70 hover:text-primary-foreground' : 'text-muted-foreground/40 hover:text-foreground'
                                                    )}
                                                    title="Drag section up/down"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <GripVertical className="h-3 w-3" />
                                                </div>
                                            )}
                                            <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-primary-foreground' : 'text-primary/70')} />
                                            <span className="truncate">{meta.label}</span>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0 ml-1">
                                            {count && (
                                                <span
                                                    className={cn(
                                                        'text-[10px] font-mono px-1.5 py-0.2 rounded-md',
                                                        isActive
                                                            ? 'bg-white/20 text-primary-foreground'
                                                            : 'bg-muted/60 text-muted-foreground'
                                                    )}
                                                >
                                                    {count}
                                                </span>
                                            )}

                                            {canMove && (
                                                <div className={cn(
                                                    'items-center transition-opacity gap-0.5',
                                                    isActive ? 'flex' : 'opacity-0 group-hover:opacity-100 hidden lg:flex'
                                                )}>
                                                    <button
                                                        type="button"
                                                        title="Move section up in PDF order"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveSectionOrder(meta.key as ResumeSectionKey, 'up');
                                                        }}
                                                        className={cn(
                                                            'p-0.5 rounded transition-colors',
                                                            isActive ? 'hover:bg-white/20 text-primary-foreground' : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                                                        )}
                                                    >
                                                        <ArrowUp className="h-2.5 w-2.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Move section down in PDF order"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveSectionOrder(meta.key as ResumeSectionKey, 'down');
                                                        }}
                                                        className={cn(
                                                            'p-0.5 rounded transition-colors',
                                                            isActive ? 'hover:bg-white/20 text-primary-foreground' : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground'
                                                        )}
                                                    >
                                                        <ArrowDown className="h-2.5 w-2.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Quick Action: Reorder Sections Dialog Trigger */}
                    <div className="pt-2 border-t border-border/40 mt-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsSectionOrderModalOpen(true)}
                            className="w-full h-8 text-[11px] font-semibold gap-1.5 rounded-xl border-border/70 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Open full section reorder dialog"
                        >
                            <SlidersHorizontal className="h-3 w-3" />
                            <span>Reorder Sections</span>
                        </Button>
                    </div>
                </div>
            </aside>

            {/* ── CENTER PANE: Active Section Workspace ── */}
            <main className="flex-1 min-w-0 space-y-4">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-border/60 gap-2">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <activeMeta.icon className="h-4 w-4 text-primary" />
                            <h2 className="font-semibold text-base text-foreground">{activeMeta.label}</h2>
                        </div>
                        <p className="text-xs text-muted-foreground">{activeMeta.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        {activeSection !== 'personalInfo' && (
                            <div className="flex items-center gap-1 bg-muted/40 border border-border/60 rounded-xl px-2 py-1 text-xs">
                                <span className="text-[11px] text-muted-foreground font-medium mr-0.5">
                                    Section Order:
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveSectionOrder(activeSection as ResumeSectionKey, 'up')}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                    title="Move this section up in resume output"
                                >
                                    <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveSectionOrder(activeSection as ResumeSectionKey, 'down')}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                    title="Move this section down in resume output"
                                >
                                    <ArrowDown className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsSectionOrderModalOpen(true)}
                                    className="h-6 px-1.5 text-[10px] font-semibold text-primary hover:text-primary/80 gap-1 ml-0.5"
                                    title="Reorder all resume sections"
                                >
                                    <SlidersHorizontal className="h-2.5 w-2.5" />
                                    Reposition
                                </Button>
                            </div>
                        )}
                        {hasUnsavedChanges && (
                            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                <Check className="h-2.5 w-2.5" />
                                Autosaved
                            </span>
                        )}
                    </div>
                </div>

                {/* Section Content Form */}
                <div key={activeSection} className="space-y-4 animate-in fade-in duration-200 ease-out">
                    {/* 1. PERSONAL INFO */}
                    {activeSection === 'personalInfo' && (
                        <Card className="rounded-2xl border-border bg-card/60 p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Full Name</Label>
                                    <Input
                                        value={resumeData.personalInfo?.name || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                personalInfo: { ...p.personalInfo, name: e.target.value },
                                            }))
                                        }
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Professional Title</Label>
                                    <Input
                                        value={resumeData.personalInfo?.title || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                personalInfo: { ...p.personalInfo, title: e.target.value },
                                            }))
                                        }
                                        placeholder="Senior DevOps Engineer"
                                    />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label className="text-xs">Tagline / Core Specialty</Label>
                                    <Input
                                        value={resumeData.personalInfo?.tagline || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                personalInfo: { ...p.personalInfo, tagline: e.target.value },
                                            }))
                                        }
                                        placeholder="Platform Engineering • SRE • Kubernetes"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Email</Label>
                                    <Input
                                        value={resumeData.personalInfo?.email || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                personalInfo: { ...p.personalInfo, email: e.target.value },
                                            }))
                                        }
                                        placeholder="jane@example.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Phone</Label>
                                    <Input
                                        value={resumeData.personalInfo?.phone || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                personalInfo: { ...p.personalInfo, phone: e.target.value },
                                            }))
                                        }
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Location</Label>
                                    <Input
                                        value={resumeData.personalInfo?.location || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                personalInfo: { ...p.personalInfo, location: e.target.value },
                                            }))
                                        }
                                        placeholder="San Francisco, CA (or Remote)"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">LinkedIn</Label>
                                    <Input
                                        value={resumeData.personalInfo?.linkedin || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                personalInfo: { ...p.personalInfo, linkedin: e.target.value },
                                            }))
                                        }
                                        placeholder="linkedin.com/in/janedoe"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">GitHub</Label>
                                    <Input
                                        value={resumeData.personalInfo?.github || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                personalInfo: { ...p.personalInfo, github: e.target.value },
                                            }))
                                        }
                                        placeholder="github.com/janedoe"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Portfolio / Website</Label>
                                    <Input
                                        value={resumeData.personalInfo?.portfolio || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                personalInfo: { ...p.personalInfo, portfolio: e.target.value },
                                            }))
                                        }
                                        placeholder="janedoe.dev"
                                    />
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* 2. PROFESSIONAL SUMMARY */}
                    {activeSection === 'summary' && (
                        <Card className="rounded-2xl border-border bg-card/60 p-4 space-y-2">
                            <Label className="text-xs font-semibold">Executive Professional Summary</Label>
                            <Textarea
                                rows={6}
                                value={resumeData.summary || ''}
                                onChange={(e) => updateData((p) => ({ ...p, summary: e.target.value }))}
                                placeholder="Targeted executive overview highlighting core competencies, notable scale achieved, and value delivered..."
                                className="text-xs leading-relaxed"
                            />
                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>Optimal length: 3–5 sentences (120–250 characters per sentence).</span>
                                <span className="font-mono">{resumeData.summary?.length || 0} characters</span>
                            </div>
                        </Card>
                    )}

                    {/* 3. TECH STACK SUMMARY */}
                    {activeSection === 'techStackSummary' && (
                        <Card className="rounded-2xl border-border bg-card/60 p-4 space-y-2">
                            <Label className="text-xs font-semibold">Architectural Tech Stack Overview</Label>
                            <Textarea
                                rows={4}
                                value={resumeData.techStackSummary || ''}
                                onChange={(e) => updateData((p) => ({ ...p, techStackSummary: e.target.value }))}
                                placeholder="e.g. AWS (EKS, Lambda), Terraform, Docker, Kubernetes, PostgreSQL, Prometheus..."
                                className="text-xs leading-relaxed"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Summary line displaying your primary tools and platforms across the top header of selected templates.
                            </p>
                        </Card>
                    )}

                    {/* 4. SKILLS */}
                    {activeSection === 'skills' && (
                        <div className="space-y-3">
                            {(resumeData.skills || []).map((skill, idx) => {
                                const isDragging = draggedItemIndex === idx;
                                const isDragOver = dragOverItemIndex === idx && draggedItemIndex !== idx;
                                const itemKey = skill.id || `skill-${idx}`;

                                return (
                                    <Card
                                        key={itemKey}
                                        draggable
                                        onDragStart={(e) => {
                                            const target = e.target as HTMLElement;
                                            if (['input', 'textarea', 'button'].includes(target.tagName.toLowerCase())) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('text/plain', String(idx));
                                            setDraggedItemIndex(idx);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            if (dragOverItemIndex !== idx) setDragOverItemIndex(idx);
                                        }}
                                        onDragLeave={() => {
                                            if (dragOverItemIndex === idx) setDragOverItemIndex(null);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (draggedItemIndex !== null && draggedItemIndex !== idx) {
                                                reorderArrayItems('skills', draggedItemIndex, idx);
                                            }
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        onDragEnd={() => {
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        className={cn(
                                            'rounded-xl border p-3.5 space-y-2 transition-all select-none',
                                            isDragging && 'opacity-40 scale-[0.99] border-dashed border-primary/60 bg-muted/30',
                                            isDragOver && 'border-primary ring-2 ring-primary/30 bg-primary/[0.03]',
                                            !isDragging && !isDragOver && 'border-border bg-card/60'
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div
                                                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/40 hover:text-foreground touch-none shrink-0"
                                                    title="Drag to reorder skill category"
                                                >
                                                    <GripVertical className="h-4 w-4" />
                                                </div>
                                                <Input
                                                    value={skill.category || ''}
                                                    onChange={(e) => {
                                                        const updated = [...(resumeData.skills || [])];
                                                        updated[idx] = { ...updated[idx], category: e.target.value };
                                                        updateData((p) => ({ ...p, skills: updated }));
                                                    }}
                                                    placeholder="Category (e.g. Cloud & Platforms)"
                                                    className="font-semibold text-xs h-8 max-w-[220px]"
                                                />
                                            </div>
                                            <div className="flex items-center gap-0.5 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveArrayItem('skills', idx, 'up')}
                                                    disabled={idx === 0}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move skill category up"
                                                >
                                                    <ArrowUp className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveArrayItem('skills', idx, 'down')}
                                                    disabled={idx === (resumeData.skills || []).length - 1}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move skill category down"
                                                >
                                                    <ArrowDown className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = (resumeData.skills || []).filter((_, i) => i !== idx);
                                                        updateData((p) => ({ ...p, skills: updated }));
                                                    }}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500 ml-1"
                                                    title="Delete category"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Textarea
                                            rows={2}
                                            value={skill.items || ''}
                                            onChange={(e) => {
                                                const updated = [...(resumeData.skills || [])];
                                                updated[idx] = { ...updated[idx], items: e.target.value };
                                                updateData((p) => ({ ...p, skills: updated }));
                                            }}
                                            placeholder="Comma-separated items: AWS, Docker, Kubernetes, Terraform, Linux"
                                            className="text-xs"
                                        />
                                    </Card>
                                );
                            })}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newId = `skill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                                    const updated = [...(resumeData.skills || []), { id: newId, category: '', items: '' }];
                                    updateData((p) => ({ ...p, skills: updated }));
                                }}
                                className="w-full h-9 rounded-xl border-dashed border-border/80 text-xs font-semibold gap-1.5 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Skill Category
                            </Button>
                        </div>
                    )}

                    {/* 5. WORK EXPERIENCE, Compact Summary Cards with Single Card Expansion */}
                    {activeSection === 'experience' && (
                        <div className="space-y-3">
                            {(resumeData.experience || []).map((exp, idx) => {
                                const isExpanded = expandedCardIndex === idx;
                                const isDragging = draggedItemIndex === idx;
                                const isDragOver = dragOverItemIndex === idx && draggedItemIndex !== idx;
                                const itemKey = exp.id || `exp-${idx}`;

                                return (
                                    <Card
                                        key={itemKey}
                                        draggable
                                        onDragStart={(e) => {
                                            const target = e.target as HTMLElement;
                                            if (['input', 'textarea', 'button', 'select'].includes(target.tagName.toLowerCase())) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('text/plain', String(idx));
                                            setDraggedItemIndex(idx);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            if (dragOverItemIndex !== idx) setDragOverItemIndex(idx);
                                        }}
                                        onDragLeave={() => {
                                            if (dragOverItemIndex === idx) setDragOverItemIndex(null);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (draggedItemIndex !== null && draggedItemIndex !== idx) {
                                                reorderArrayItems('experience', draggedItemIndex, idx);
                                            }
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        onDragEnd={() => {
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        className={cn(
                                            'rounded-2xl border transition-all overflow-hidden select-none',
                                            isDragging && 'opacity-40 scale-[0.99] border-dashed border-primary/60 bg-muted/30',
                                            isDragOver && 'border-primary ring-2 ring-primary/30 bg-primary/[0.03]',
                                            !isDragging && !isDragOver && (isExpanded ? 'border-primary/50 bg-card shadow-sm' : 'border-border bg-card/60 hover:border-border')
                                        )}
                                    >
                                        {/* Compact Summary Header */}
                                        <div
                                            className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                                            onClick={() => setExpandedCardIndex(isExpanded ? null : idx)}
                                        >
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div
                                                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/40 hover:text-foreground touch-none shrink-0"
                                                    title="Drag to reposition work experience"
                                                >
                                                    <GripVertical className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-xs text-foreground truncate">
                                                            {exp.title || 'Untitled Role'}
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">•</span>
                                                        <span className="text-xs text-muted-foreground truncate">
                                                            {exp.company || 'Company'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                                                        <span>{exp.dates || 'Dates'}</span>
                                                        {exp.location && <span>{exp.location}</span>}
                                                        <span className="font-mono text-primary/80">
                                                            {((exp.bullets?.length || 0) + (exp.impactBullets?.length || 0) + (exp.highlights?.length || 0))} bullet(s)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveArrayItem('experience', idx, 'up');
                                                    }}
                                                    disabled={idx === 0}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move experience up"
                                                >
                                                    <ArrowUp className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveArrayItem('experience', idx, 'down');
                                                    }}
                                                    disabled={idx === (resumeData.experience || []).length - 1}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move experience down"
                                                >
                                                    <ArrowDown className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        duplicateArrayItem('experience', idx);
                                                    }}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Duplicate experience entry"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const updated = (resumeData.experience || []).filter((_, i) => i !== idx);
                                                        updateData((p) => ({ ...p, experience: updated }));
                                                        if (expandedCardIndex === idx) setExpandedCardIndex(null);
                                                    }}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                                                    title="Delete experience"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                                <div className="ml-1 text-muted-foreground">
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Form Fields */}
                                        {isExpanded && (
                                            <div className="p-4 pt-0 border-t border-border/40 space-y-3 mt-1">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Job Title</Label>
                                                        <Input
                                                            value={exp.title || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.experience || [])];
                                                                updated[idx] = { ...updated[idx], title: e.target.value };
                                                                updateData((p) => ({ ...p, experience: updated }));
                                                            }}
                                                            placeholder="Senior DevOps Engineer"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Company Name</Label>
                                                        <Input
                                                            value={exp.company || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.experience || [])];
                                                                updated[idx] = { ...updated[idx], company: e.target.value };
                                                                updateData((p) => ({ ...p, experience: updated }));
                                                            }}
                                                            placeholder="Acme Corp"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Location</Label>
                                                        <Input
                                                            value={exp.location || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.experience || [])];
                                                                updated[idx] = { ...updated[idx], location: e.target.value };
                                                                updateData((p) => ({ ...p, experience: updated }));
                                                            }}
                                                            placeholder="Berlin, Germany (Hybrid)"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Dates / Tenure</Label>
                                                        <Input
                                                            value={exp.dates || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.experience || [])];
                                                                updated[idx] = { ...updated[idx], dates: e.target.value };
                                                                updateData((p) => ({ ...p, experience: updated }));
                                                            }}
                                                            placeholder="Jun 2024 – Present"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Company Website / URL</Label>
                                                        <Input
                                                            value={exp.companyUrl || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.experience || [])];
                                                                updated[idx] = { ...updated[idx], companyUrl: e.target.value };
                                                                updateData((p) => ({ ...p, experience: updated }));
                                                            }}
                                                            placeholder="https://company.com"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Technologies Used</Label>
                                                        <Input
                                                            value={exp.technologies || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.experience || [])];
                                                                updated[idx] = { ...updated[idx], technologies: e.target.value };
                                                                updateData((p) => ({ ...p, experience: updated }));
                                                            }}
                                                            placeholder="AWS, Kubernetes, Go, Terraform"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Quantified Impact / Metric Bullets */}
                                                <div className="space-y-2 pt-2 border-t border-border/30">
                                                    <Label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                                                        <span>Quantified Impact & Outcomes</span>
                                                        <span className="text-[10px] text-muted-foreground font-normal">
                                                            Percentages, cost savings, latency improvements
                                                        </span>
                                                    </Label>

                                                    {(exp.impactBullets || []).map((ib, ibIdx) => (
                                                        <div key={ibIdx} className="flex items-start gap-2">
                                                            <Textarea
                                                                rows={2}
                                                                value={ib || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...(resumeData.experience || [])];
                                                                    const newImpact = [...(updated[idx].impactBullets || [])];
                                                                    newImpact[ibIdx] = e.target.value;
                                                                    updated[idx] = { ...updated[idx], impactBullets: newImpact };
                                                                    updateData((p) => ({ ...p, experience: updated }));
                                                                }}
                                                                placeholder="Cut infrastructure cloud costs by 32% via autoscaling and spot compute..."
                                                                className="text-xs leading-relaxed"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const updated = [...(resumeData.experience || [])];
                                                                    const newImpact = (updated[idx].impactBullets || []).filter((_, i) => i !== ibIdx);
                                                                    updated[idx] = { ...updated[idx], impactBullets: newImpact };
                                                                    updateData((p) => ({ ...p, experience: updated }));
                                                                }}
                                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 shrink-0"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    ))}

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const updated = [...(resumeData.experience || [])];
                                                            const newImpact = [...(updated[idx].impactBullets || []), ''];
                                                            updated[idx] = { ...updated[idx], impactBullets: newImpact };
                                                            updateData((p) => ({ ...p, experience: updated }));
                                                        }}
                                                        className="h-7 text-[11px] gap-1 rounded-lg"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Add Quantified Metric
                                                    </Button>
                                                </div>

                                                {/* Bullets list */}
                                                <div className="space-y-2 pt-2 border-t border-border/30">
                                                    <Label className="text-xs font-semibold flex items-center justify-between">
                                                        <span>Responsibilities & Technical Achievements</span>
                                                        <span className="text-[10px] text-muted-foreground font-normal">
                                                            Action verb + technical details + outcome
                                                        </span>
                                                    </Label>

                                                    {(exp.bullets || []).map((bullet, bIdx) => (
                                                        <div key={bIdx} className="flex items-start gap-2">
                                                            <Textarea
                                                                rows={2}
                                                                value={bullet || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...(resumeData.experience || [])];
                                                                    const newBullets = [...(updated[idx].bullets || [])];
                                                                    newBullets[bIdx] = e.target.value;
                                                                    updated[idx] = { ...updated[idx], bullets: newBullets };
                                                                    updateData((p) => ({ ...p, experience: updated }));
                                                                }}
                                                                placeholder="Engineered automated Kubernetes CI/CD pipeline reducing deployment cycle by 45%..."
                                                                className="text-xs leading-relaxed"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const updated = [...(resumeData.experience || [])];
                                                                    const newBullets = (updated[idx].bullets || []).filter((_, i) => i !== bIdx);
                                                                    updated[idx] = { ...updated[idx], bullets: newBullets };
                                                                    updateData((p) => ({ ...p, experience: updated }));
                                                                }}
                                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 shrink-0"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    ))}

                                                    <div className="flex items-center justify-between pt-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const updated = [...(resumeData.experience || [])];
                                                                const newBullets = [...(updated[idx].bullets || []), ''];
                                                                updated[idx] = { ...updated[idx], bullets: newBullets };
                                                                updateData((p) => ({ ...p, experience: updated }));
                                                            }}
                                                            className="h-8 text-[11px] gap-1 rounded-lg"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add Bullet
                                                        </Button>

                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => setExpandedCardIndex(null)}
                                                            className="h-8 text-[11px] font-semibold gap-1 rounded-lg"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                            Done Editing Role
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                                    const updated = [
                                        ...(resumeData.experience || []),
                                        { id: newId, title: '', company: '', location: '', dates: '', bullets: [''], impactBullets: [] },
                                    ];
                                    updateData((p) => ({ ...p, experience: updated }));
                                    setExpandedCardIndex(updated.length - 1);
                                }}
                                className="w-full h-9 rounded-xl border-dashed border-border/80 text-xs font-semibold gap-1.5 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Work Experience
                            </Button>
                        </div>
                    )}

                    {/* 6. PROJECTS, Compact Summary Cards with Single Card Expansion */}
                    {activeSection === 'projects' && (
                        <div className="space-y-3">
                            {(resumeData.projects || []).map((project, idx) => {
                                const isExpanded = expandedCardIndex === idx;
                                const isDragging = draggedItemIndex === idx;
                                const isDragOver = dragOverItemIndex === idx && draggedItemIndex !== idx;
                                const itemKey = project.id || `proj-${idx}`;

                                return (
                                    <Card
                                        key={itemKey}
                                        draggable
                                        onDragStart={(e) => {
                                            const target = e.target as HTMLElement;
                                            if (['input', 'textarea', 'button', 'select'].includes(target.tagName.toLowerCase())) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('text/plain', String(idx));
                                            setDraggedItemIndex(idx);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            if (dragOverItemIndex !== idx) setDragOverItemIndex(idx);
                                        }}
                                        onDragLeave={() => {
                                            if (dragOverItemIndex === idx) setDragOverItemIndex(null);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (draggedItemIndex !== null && draggedItemIndex !== idx) {
                                                reorderArrayItems('projects', draggedItemIndex, idx);
                                            }
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        onDragEnd={() => {
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        className={cn(
                                            'rounded-2xl border transition-all overflow-hidden select-none',
                                            isDragging && 'opacity-40 scale-[0.99] border-dashed border-primary/60 bg-muted/30',
                                            isDragOver && 'border-primary ring-2 ring-primary/30 bg-primary/[0.03]',
                                            !isDragging && !isDragOver && (isExpanded ? 'border-primary/50 bg-card shadow-sm' : 'border-border bg-card/60 hover:border-border')
                                        )}
                                    >
                                        <div
                                            className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                                            onClick={() => setExpandedCardIndex(isExpanded ? null : idx)}
                                        >
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div
                                                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/40 hover:text-foreground touch-none shrink-0"
                                                    title="Drag to reposition project"
                                                >
                                                    <GripVertical className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-xs text-foreground truncate">
                                                            {project.name || 'Untitled Project'}
                                                        </span>
                                                        {project.techStack && (
                                                            <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.2 rounded bg-muted/60 truncate">
                                                                {project.techStack}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                                        {project.description || 'Project description...'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveArrayItem('projects', idx, 'up');
                                                    }}
                                                    disabled={idx === 0}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move project up"
                                                >
                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveArrayItem('projects', idx, 'down');
                                                    }}
                                                    disabled={idx === (resumeData.projects || []).length - 1}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move project down"
                                                >
                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        duplicateArrayItem('projects', idx);
                                                    }}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Duplicate project"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const updated = (resumeData.projects || []).filter((_, i) => i !== idx);
                                                        updateData((p) => ({ ...p, projects: updated }));
                                                        if (expandedCardIndex === idx) setExpandedCardIndex(null);
                                                    }}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                                                    title="Delete project"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <div className="ml-1 text-muted-foreground">
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-4 pt-0 border-t border-border/40 space-y-3 mt-1">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Project Name</Label>
                                                        <Input
                                                            value={project.name || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.projects || [])];
                                                                updated[idx] = { ...updated[idx], name: e.target.value };
                                                                updateData((p) => ({ ...p, projects: updated }));
                                                            }}
                                                            placeholder="Infrastructure Automation Suite"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Technologies Used</Label>
                                                        <Input
                                                            value={project.techStack || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.projects || [])];
                                                                updated[idx] = { ...updated[idx], techStack: e.target.value };
                                                                updateData((p) => ({ ...p, projects: updated }));
                                                            }}
                                                            placeholder="Terraform, AWS, Go, Docker"
                                                        />
                                                    </div>
                                                    <div className="space-y-1 sm:col-span-2">
                                                        <Label className="text-xs">High-Level Description</Label>
                                                        <Input
                                                            value={project.description || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.projects || [])];
                                                                updated[idx] = { ...updated[idx], description: e.target.value };
                                                                updateData((p) => ({ ...p, projects: updated }));
                                                            }}
                                                            placeholder="Modular platform providing self-service ephemeral staging clusters."
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Role</Label>
                                                        <Input
                                                            value={project.role || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.projects || [])];
                                                                updated[idx] = { ...updated[idx], role: e.target.value };
                                                                updateData((p) => ({ ...p, projects: updated }));
                                                            }}
                                                            placeholder="Lead Architect"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Dates / Duration</Label>
                                                        <Input
                                                            value={project.dates || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.projects || [])];
                                                                updated[idx] = { ...updated[idx], dates: e.target.value };
                                                                updateData((p) => ({ ...p, projects: updated }));
                                                            }}
                                                            placeholder="Jan 2024 – Present"
                                                        />
                                                    </div>
                                                    <div className="space-y-1 sm:col-span-2">
                                                        <Label className="text-xs">Repository or Demo Link</Label>
                                                        <Input
                                                            value={project.link || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(resumeData.projects || [])];
                                                                updated[idx] = { ...updated[idx], link: e.target.value };
                                                                updateData((p) => ({ ...p, projects: updated }));
                                                            }}
                                                            placeholder="https://github.com/example/repo"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Quantified Impact / Result Bullets */}
                                                <div className="space-y-2 pt-1 border-t border-border/30">
                                                    <Label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                                                        <span>Quantified Impact & Outcomes</span>
                                                        <span className="text-xs text-muted-foreground font-normal">Metrics, benchmarks, percentages</span>
                                                    </Label>
                                                    {(project.impactBullets || []).map((ib, ibIdx) => (
                                                        <div key={ibIdx} className="flex items-start gap-2">
                                                            <Textarea
                                                                rows={2}
                                                                value={ib || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...(resumeData.projects || [])];
                                                                    const newImpact = [...(updated[idx].impactBullets || [])];
                                                                    newImpact[ibIdx] = e.target.value;
                                                                    updated[idx] = { ...updated[idx], impactBullets: newImpact };
                                                                    updateData((p) => ({ ...p, projects: updated }));
                                                                }}
                                                                placeholder="Reduced cold-start provisioning latency from 18m to 90s (-91%)..."
                                                                className="text-xs leading-relaxed"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const updated = [...(resumeData.projects || [])];
                                                                    const newImpact = (updated[idx].impactBullets || []).filter((_, i) => i !== ibIdx);
                                                                    updated[idx] = { ...updated[idx], impactBullets: newImpact };
                                                                    updateData((p) => ({ ...p, projects: updated }));
                                                                }}
                                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 shrink-0"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const updated = [...(resumeData.projects || [])];
                                                            const newImpact = [...(updated[idx].impactBullets || []), ''];
                                                            updated[idx] = { ...updated[idx], impactBullets: newImpact };
                                                            updateData((p) => ({ ...p, projects: updated }));
                                                        }}
                                                        className="h-8 text-xs gap-1 rounded-lg"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Add Impact Metric
                                                    </Button>
                                                </div>

                                                {/* Highlights if present */}
                                                {((project.highlights && project.highlights.length > 0) || false) && (
                                                    <div className="space-y-2 pt-2 border-t border-border/30">
                                                        <Label className="text-xs font-semibold flex items-center justify-between">
                                                            <span>Project Highlights</span>
                                                            <span className="text-[10px] text-muted-foreground font-normal">Key features and highlights</span>
                                                        </Label>
                                                        {(project.highlights || []).map((hl, hlIdx) => (
                                                            <div key={hlIdx} className="flex items-start gap-2">
                                                                <Textarea
                                                                    rows={2}
                                                                    value={hl || ''}
                                                                    onChange={(e) => {
                                                                        const updated = [...(resumeData.projects || [])];
                                                                        const newHls = [...(updated[idx].highlights || [])];
                                                                        newHls[hlIdx] = e.target.value;
                                                                        updated[idx] = { ...updated[idx], highlights: newHls };
                                                                        updateData((p) => ({ ...p, projects: updated }));
                                                                    }}
                                                                    className="text-xs leading-relaxed"
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const updated = [...(resumeData.projects || [])];
                                                                        const newHls = (updated[idx].highlights || []).filter((_, i) => i !== hlIdx);
                                                                        updated[idx] = { ...updated[idx], highlights: newHls };
                                                                        updateData((p) => ({ ...p, projects: updated }));
                                                                    }}
                                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 shrink-0"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const updated = [...(resumeData.projects || [])];
                                                                const newHls = [...(updated[idx].highlights || []), ''];
                                                                updated[idx] = { ...updated[idx], highlights: newHls };
                                                                updateData((p) => ({ ...p, projects: updated }));
                                                            }}
                                                            className="h-7 text-[11px] gap-1 rounded-lg"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add Highlight
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Feature / Technical Bullets */}
                                                <div className="space-y-2 pt-2 border-t border-border/30">
                                                    <Label className="text-xs font-semibold flex items-center justify-between">
                                                        <span>Technical Features & Architecture</span>
                                                        <span className="text-xs text-muted-foreground font-normal">Core implementations</span>
                                                    </Label>
                                                    {(project.bullets || []).map((bullet, bIdx) => (
                                                        <div key={bIdx} className="flex items-start gap-2">
                                                            <Textarea
                                                                rows={2}
                                                                value={bullet || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...(resumeData.projects || [])];
                                                                    const newBullets = [...(updated[idx].bullets || [])];
                                                                    newBullets[bIdx] = e.target.value;
                                                                    updated[idx] = { ...updated[idx], bullets: newBullets };
                                                                    updateData((p) => ({ ...p, projects: updated }));
                                                                }}
                                                                placeholder="Architected cross-region failover handling 10k req/sec..."
                                                                className="text-xs leading-relaxed"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const updated = [...(resumeData.projects || [])];
                                                                    const newBullets = (updated[idx].bullets || []).filter((_, i) => i !== bIdx);
                                                                    updated[idx] = { ...updated[idx], bullets: newBullets };
                                                                    updateData((p) => ({ ...p, projects: updated }));
                                                                }}
                                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 shrink-0"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    ))}

                                                    <div className="flex items-center justify-between pt-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                const updated = [...(resumeData.projects || [])];
                                                                const newBullets = [...(updated[idx].bullets || []), ''];
                                                                updated[idx] = { ...updated[idx], bullets: newBullets };
                                                                updateData((p) => ({ ...p, projects: updated }));
                                                            }}
                                                            className="h-8 text-xs gap-1 rounded-lg"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add Feature Bullet
                                                        </Button>

                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => setExpandedCardIndex(null)}
                                                            className="h-8 text-xs font-semibold gap-1 rounded-lg"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                            Done Editing Project
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                                    const updated = [
                                        ...(resumeData.projects || []),
                                        { id: newId, name: '', techStack: '', description: '', bullets: [''], impactBullets: [], highlights: [] },
                                    ];
                                    updateData((p) => ({ ...p, projects: updated }));
                                    setExpandedCardIndex(updated.length - 1);
                                }}
                                className="w-full h-9 rounded-xl border-dashed border-border/80 text-xs font-semibold gap-1.5 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Project
                            </Button>
                        </div>
                    )}

                    {/* 7. EDUCATION */}
                    {activeSection === 'education' && (
                        <div className="space-y-3">
                            {(resumeData.education || []).map((edu, idx) => {
                                const isExpanded = expandedCardIndex === idx;
                                const isDragging = draggedItemIndex === idx;
                                const isDragOver = dragOverItemIndex === idx;
                                const itemKey = edu.id || `edu-${idx}`;

                                return (
                                    <Card
                                        key={itemKey}
                                        draggable
                                        onDragStart={(e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.closest('input, textarea, button, select')) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('text/plain', String(idx));
                                            setDraggedItemIndex(idx);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            if (dragOverItemIndex !== idx) setDragOverItemIndex(idx);
                                        }}
                                        onDragLeave={() => {
                                            if (dragOverItemIndex === idx) setDragOverItemIndex(null);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (draggedItemIndex !== null && draggedItemIndex !== idx) {
                                                reorderArrayItems('education', draggedItemIndex, idx);
                                            }
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        onDragEnd={() => {
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        className={cn(
                                            'rounded-2xl border transition-all overflow-hidden select-none p-3.5 space-y-3',
                                            isDragging && 'opacity-40 scale-[0.99] border-dashed border-primary/60 bg-muted/30',
                                            isDragOver && 'border-primary ring-2 ring-primary/30 bg-primary/[0.03]',
                                            !isDragging && !isDragOver && (isExpanded ? 'border-primary/50 bg-card shadow-sm' : 'border-border bg-card/60 hover:border-border')
                                        )}
                                    >
                                        <div
                                            className="flex items-center justify-between cursor-pointer select-none"
                                            onClick={() => setExpandedCardIndex(isExpanded ? null : idx)}
                                        >
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div
                                                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/40 hover:text-foreground touch-none shrink-0"
                                                    title="Drag to reposition education"
                                                >
                                                    <GripVertical className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold text-xs text-foreground truncate">
                                                        {edu.degree || 'Degree'} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                                        {edu.institution || 'University'} • {edu.dates || 'Graduation Date'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveArrayItem('education', idx, 'up');
                                                    }}
                                                    disabled={idx === 0}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move education up"
                                                >
                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveArrayItem('education', idx, 'down');
                                                    }}
                                                    disabled={idx === (resumeData.education || []).length - 1}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move education down"
                                                >
                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        duplicateArrayItem('education', idx);
                                                    }}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Duplicate education entry"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const updated = (resumeData.education || []).filter((_, i) => i !== idx);
                                                        updateData((p) => ({ ...p, education: updated }));
                                                        if (expandedCardIndex === idx) setExpandedCardIndex(null);
                                                    }}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                                                    title="Delete education"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <div className="ml-1 text-muted-foreground">
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Degree</Label>
                                                    <Input
                                                        value={edu.degree || ''}
                                                        onChange={(e) => {
                                                            const updated = [...(resumeData.education || [])];
                                                            updated[idx] = { ...updated[idx], degree: e.target.value };
                                                            updateData((p) => ({ ...p, education: updated }));
                                                        }}
                                                        placeholder="Bachelor of Science"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Field of Study</Label>
                                                    <Input
                                                        value={edu.fieldOfStudy || ''}
                                                        onChange={(e) => {
                                                            const updated = [...(resumeData.education || [])];
                                                            updated[idx] = { ...updated[idx], fieldOfStudy: e.target.value };
                                                            updateData((p) => ({ ...p, education: updated }));
                                                        }}
                                                        placeholder="Computer Science"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Institution</Label>
                                                    <Input
                                                        value={edu.institution || ''}
                                                        onChange={(e) => {
                                                            const updated = [...(resumeData.education || [])];
                                                            updated[idx] = { ...updated[idx], institution: e.target.value };
                                                            updateData((p) => ({ ...p, education: updated }));
                                                        }}
                                                        placeholder="University of California, Berkeley"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Dates</Label>
                                                    <Input
                                                        value={edu.dates || ''}
                                                        onChange={(e) => {
                                                            const updated = [...(resumeData.education || [])];
                                                            updated[idx] = { ...updated[idx], dates: e.target.value };
                                                            updateData((p) => ({ ...p, education: updated }));
                                                        }}
                                                        placeholder="2018 – 2022"
                                                    />
                                                </div>
                                                <div className="space-y-1 sm:col-span-2">
                                                    <Label className="text-xs">Relevant Coursework & Honors</Label>
                                                    <Input
                                                        value={edu.coursework || ''}
                                                        onChange={(e) => {
                                                            const updated = [...(resumeData.education || [])];
                                                            updated[idx] = { ...updated[idx], coursework: e.target.value };
                                                            updateData((p) => ({ ...p, education: updated }));
                                                        }}
                                                        placeholder="Distributed Systems, Cloud Architecture, Operating Systems"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newId = `edu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                                    const updated = [
                                        ...(resumeData.education || []),
                                        { id: newId, degree: '', fieldOfStudy: '', institution: '', dates: '' },
                                    ];
                                    updateData((p) => ({ ...p, education: updated }));
                                    setExpandedCardIndex(updated.length - 1);
                                }}
                                className="w-full h-9 rounded-xl border-dashed border-border/80 text-xs font-semibold gap-1.5 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Education
                            </Button>
                        </div>
                    )}

                    {/* 8. CERTIFICATIONS */}
                    {activeSection === 'certifications' && (
                        <div className="space-y-3">
                            {(resumeData.certifications || []).map((cert, idx) => {
                                const isDragging = draggedItemIndex === idx;
                                const isDragOver = dragOverItemIndex === idx;
                                const itemKey = cert.id || `cert-${idx}`;

                                return (
                                    <Card
                                        key={itemKey}
                                        draggable
                                        onDragStart={(e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.closest('input, textarea, button, select')) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('text/plain', String(idx));
                                            setDraggedItemIndex(idx);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            if (dragOverItemIndex !== idx) setDragOverItemIndex(idx);
                                        }}
                                        onDragLeave={() => {
                                            if (dragOverItemIndex === idx) setDragOverItemIndex(null);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (draggedItemIndex !== null && draggedItemIndex !== idx) {
                                                reorderArrayItems('certifications', draggedItemIndex, idx);
                                            }
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        onDragEnd={() => {
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        className={cn(
                                            'rounded-xl border p-3.5 space-y-3 transition-all',
                                            isDragging && 'opacity-40 scale-[0.99] border-dashed border-primary/60 bg-muted/30',
                                            isDragOver && 'border-primary ring-2 ring-primary/30 bg-primary/[0.03]',
                                            !isDragging && !isDragOver && 'border-border bg-card/60'
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div
                                                className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/40 hover:text-foreground touch-none shrink-0"
                                                title="Drag to reposition certification"
                                            >
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                            <Input
                                                value={cert.name || ''}
                                                onChange={(e) => {
                                                    const updated = [...(resumeData.certifications || [])];
                                                    updated[idx] = { ...updated[idx], name: e.target.value };
                                                    updateData((p) => ({ ...p, certifications: updated }));
                                                }}
                                                placeholder="AWS Certified Solutions Architect – Professional"
                                                className="font-semibold text-xs h-8 flex-1"
                                            />
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveArrayItem('certifications', idx, 'up')}
                                                    disabled={idx === 0}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move certification up"
                                                >
                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveArrayItem('certifications', idx, 'down')}
                                                    disabled={idx === (resumeData.certifications || []).length - 1}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move certification down"
                                                >
                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => duplicateArrayItem('certifications', idx)}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Duplicate certification"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = (resumeData.certifications || []).filter((_, i) => i !== idx);
                                                        updateData((p) => ({ ...p, certifications: updated }));
                                                    }}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                                                    title="Delete certification"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs pl-6">
                                            <Input
                                                value={cert.issuer || ''}
                                                onChange={(e) => {
                                                    const updated = [...(resumeData.certifications || [])];
                                                    updated[idx] = { ...updated[idx], issuer: e.target.value };
                                                    updateData((p) => ({ ...p, certifications: updated }));
                                                }}
                                                placeholder="Issuer (e.g. Amazon Web Services)"
                                                className="text-xs h-8"
                                            />
                                            <Input
                                                value={cert.date || ''}
                                                onChange={(e) => {
                                                    const updated = [...(resumeData.certifications || [])];
                                                    updated[idx] = { ...updated[idx], date: e.target.value };
                                                    updateData((p) => ({ ...p, certifications: updated }));
                                                }}
                                                placeholder="Date (e.g. 2024)"
                                                className="text-xs h-8"
                                            />
                                        </div>
                                    </Card>
                                );
                            })}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newId = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                                    const updated = [...(resumeData.certifications || []), { id: newId, name: '', issuer: '', date: '' }];
                                    updateData((p) => ({ ...p, certifications: updated }));
                                }}
                                className="w-full h-9 rounded-xl border-dashed border-border/80 text-xs font-semibold gap-1.5 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Certification
                            </Button>
                        </div>
                    )}

                    {/* 9. KEY METRICS */}
                    {activeSection === 'keyMetrics' && (
                        <div className="space-y-3">
                            {(resumeData.keyMetrics || []).map((metric, idx) => {
                                const isDragging = draggedItemIndex === idx;
                                const isDragOver = dragOverItemIndex === idx;

                                return (
                                    <Card
                                        key={idx}
                                        draggable
                                        onDragStart={(e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.closest('input, textarea, button, select')) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('text/plain', String(idx));
                                            setDraggedItemIndex(idx);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            if (dragOverItemIndex !== idx) setDragOverItemIndex(idx);
                                        }}
                                        onDragLeave={() => {
                                            if (dragOverItemIndex === idx) setDragOverItemIndex(null);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (draggedItemIndex !== null && draggedItemIndex !== idx) {
                                                reorderArrayItems('keyMetrics', draggedItemIndex, idx);
                                            }
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        onDragEnd={() => {
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        className={cn(
                                            'rounded-xl border p-3 space-y-2 transition-all',
                                            isDragging && 'opacity-40 scale-[0.99] border-dashed border-primary/60 bg-muted/30',
                                            isDragOver && 'border-primary ring-2 ring-primary/30 bg-primary/[0.03]',
                                            !isDragging && !isDragOver && 'border-border bg-card/60'
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/40 hover:text-foreground touch-none shrink-0"
                                                title="Drag to reposition metric"
                                            >
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                            <Input
                                                value={metric.value || ''}
                                                onChange={(e) => {
                                                    const updated = [...(resumeData.keyMetrics || [])];
                                                    updated[idx] = { ...updated[idx], value: e.target.value };
                                                    updateData((p) => ({ ...p, keyMetrics: updated }));
                                                }}
                                                placeholder="Value (e.g. $40K+ / 99.99%)"
                                                className="font-bold text-xs h-8 max-w-[140px]"
                                            />
                                            <Input
                                                value={metric.label || ''}
                                                onChange={(e) => {
                                                    const updated = [...(resumeData.keyMetrics || [])];
                                                    updated[idx] = { ...updated[idx], label: e.target.value };
                                                    updateData((p) => ({ ...p, keyMetrics: updated }));
                                                }}
                                                placeholder="Metric Label (e.g. Annual AWS Cost Savings)"
                                                className="text-xs h-8 flex-1"
                                            />
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveArrayItem('keyMetrics', idx, 'up')}
                                                    disabled={idx === 0}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move metric up"
                                                >
                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveArrayItem('keyMetrics', idx, 'down')}
                                                    disabled={idx === (resumeData.keyMetrics || []).length - 1}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move metric down"
                                                >
                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = (resumeData.keyMetrics || []).filter((_, i) => i !== idx);
                                                        updateData((p) => ({ ...p, keyMetrics: updated }));
                                                    }}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                                                    title="Delete metric"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const updated = [...(resumeData.keyMetrics || []), { label: '', value: '' }];
                                    updateData((p) => ({ ...p, keyMetrics: updated }));
                                }}
                                className="w-full h-9 rounded-xl border-dashed border-border/80 text-xs font-semibold gap-1.5 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Key Metric
                            </Button>
                        </div>
                    )}

                    {/* 10. ADDITIONAL INFO */}
                    {activeSection === 'additionalInfo' && (
                        <Card className="rounded-2xl border-border bg-card/60 p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Work Authorization</Label>
                                    <Input
                                        value={resumeData.additionalInfo?.workAuthorization || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                additionalInfo: { ...p.additionalInfo, workAuthorization: e.target.value },
                                            }))
                                        }
                                        placeholder="US Citizen / Permanent Resident"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Availability</Label>
                                    <Input
                                        value={resumeData.additionalInfo?.availability || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                additionalInfo: { ...p.additionalInfo, availability: e.target.value },
                                            }))
                                        }
                                        placeholder="Immediate / 2 Weeks Notice"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Relocation</Label>
                                    <Input
                                        value={resumeData.additionalInfo?.relocation || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                additionalInfo: { ...p.additionalInfo, relocation: e.target.value },
                                            }))
                                        }
                                        placeholder="Open to relocation"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Travel</Label>
                                    <Input
                                        value={resumeData.additionalInfo?.travel || ''}
                                        onChange={(e) =>
                                            updateData((p) => ({
                                                ...p,
                                                additionalInfo: { ...p.additionalInfo, travel: e.target.value },
                                            }))
                                        }
                                        placeholder="Up to 15%"
                                    />
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* 11. GENERIC REPEATABLE SECTIONS (Achievements, OSS, Publications, Leadership, etc.) */}
                    {!['personalInfo', 'summary', 'techStackSummary', 'skills', 'experience', 'projects', 'education', 'certifications', 'keyMetrics', 'additionalInfo'].includes(activeSection) && (
                        <div className="space-y-3">
                            {/* Generic fallback card for any secondary section */}
                            {Array.isArray((resumeData as any)[activeSection]) && ((resumeData as any)[activeSection] as any[]).map((item: any, idx: number) => {
                                const isDragging = draggedItemIndex === idx;
                                const isDragOver = dragOverItemIndex === idx;
                                const list = (resumeData as any)[activeSection] || [];

                                return (
                                    <Card
                                        key={idx}
                                        draggable
                                        onDragStart={(e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.closest('input, textarea, button, select')) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.dataTransfer.effectAllowed = 'move';
                                            e.dataTransfer.setData('text/plain', String(idx));
                                            setDraggedItemIndex(idx);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            if (dragOverItemIndex !== idx) setDragOverItemIndex(idx);
                                        }}
                                        onDragLeave={() => {
                                            if (dragOverItemIndex === idx) setDragOverItemIndex(null);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (draggedItemIndex !== null && draggedItemIndex !== idx) {
                                                reorderArrayItems(activeSection, draggedItemIndex, idx);
                                            }
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        onDragEnd={() => {
                                            setDraggedItemIndex(null);
                                            setDragOverItemIndex(null);
                                        }}
                                        className={cn(
                                            'rounded-xl border p-3 space-y-2 transition-all',
                                            isDragging && 'opacity-40 scale-[0.99] border-dashed border-primary/60 bg-muted/30',
                                            isDragOver && 'border-primary ring-2 ring-primary/30 bg-primary/[0.03]',
                                            !isDragging && !isDragOver && 'border-border bg-card/60'
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div
                                                className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/40 hover:text-foreground touch-none shrink-0"
                                                title="Drag to reposition item"
                                            >
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                            <Input
                                                value={item.title || item.name || item.role || item.project || (typeof item === 'string' ? item : '')}
                                                onChange={(e) => {
                                                    const updatedList = [...((resumeData as any)[activeSection] || [])];
                                                    if (typeof updatedList[idx] === 'string') {
                                                        updatedList[idx] = e.target.value;
                                                    } else {
                                                        const key = item.title ? 'title' : item.name ? 'name' : item.role ? 'role' : 'project';
                                                        updatedList[idx] = { ...updatedList[idx], [key]: e.target.value };
                                                    }
                                                    updateData((p) => ({ ...p, [activeSection]: updatedList }));
                                                }}
                                                placeholder="Entry Title / Description"
                                                className="font-semibold text-xs h-8 flex-1"
                                            />
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveArrayItem(activeSection, idx, 'up')}
                                                    disabled={idx === 0}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move item up"
                                                >
                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => moveArrayItem(activeSection, idx, 'down')}
                                                    disabled={idx === list.length - 1}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    title="Move item down"
                                                >
                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updatedList = ((resumeData as any)[activeSection] || []).filter((_: any, i: number) => i !== idx);
                                                        updateData((p) => ({ ...p, [activeSection]: updatedList }));
                                                    }}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                                                    title="Delete item"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        {item.bullets && Array.isArray(item.bullets) && (
                                            <div className="pl-6">
                                                <Textarea
                                                    rows={2}
                                                    value={item.bullets.join('\n')}
                                                    onChange={(e) => {
                                                        const updatedList = [...((resumeData as any)[activeSection] || [])];
                                                        updatedList[idx] = { ...updatedList[idx], bullets: e.target.value.split('\n') };
                                                        updateData((p) => ({ ...p, [activeSection]: updatedList }));
                                                    }}
                                                    placeholder="One bullet point per line..."
                                                    className="text-xs"
                                                />
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const currentList = (resumeData as any)[activeSection] || [];
                                    const newItem = activeSection === 'languages'
                                        ? { language: '', proficiency: '' }
                                        : activeSection === 'interests'
                                            ? { name: '', details: '' }
                                            : { title: '', bullets: [''] };
                                    updateData((p) => ({ ...p, [activeSection]: [...currentList, newItem] }));
                                }}
                                className="w-full h-9 rounded-xl border-dashed border-border/80 text-xs font-semibold gap-1.5 cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Entry to {activeMeta.label}
                            </Button>
                        </div>
                    )}
                </div>

                {/* ── BOTTOM NAVIGATION: Previous / Next Section ── */}
                <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between gap-3">
                    {prevSection ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setActiveSection(prevSection.key);
                                setExpandedCardIndex(0);
                            }}
                            className="h-9 px-3 text-xs font-medium rounded-xl gap-1.5 cursor-pointer hover:bg-muted/40"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            <span>Previous: {prevSection.label}</span>
                        </Button>
                    ) : (
                        <div />
                    )}

                    {nextSection ? (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                                setActiveSection(nextSection.key);
                                setExpandedCardIndex(0);
                            }}
                            className="h-9 px-4 text-xs font-semibold rounded-xl gap-1.5 cursor-pointer shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                            <span>Next: {nextSection.label}</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                notify.saved('All sections reviewed');
                            }}
                            className="h-9 px-4 text-xs font-semibold rounded-xl gap-1.5"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>All Sections Complete</span>
                        </Button>
                    )}
                </div>
            </main>

            {/* Reorder Sections Modal */}
            <Dialog open={isSectionOrderModalOpen} onOpenChange={setIsSectionOrderModalOpen}>
                <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">Reorder Resume Sections</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Drag or click the arrows to arrange the flow and sequence of sections compiled into your Typst resume.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-1 mt-2">
                        <SectionOrderEditor hideHeader />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
