"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { TemplateType } from '@/lib/resume-schema';
import { cn } from '@/lib/utils';
import {
    Check,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    LayoutGrid,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { getTemplateFitCopy, getTemplateFitLevel } from '@/lib/typst-layout';
import { ALL_TEMPLATES, ResumeTemplate } from '@/lib/templates-data';
import Image from 'next/image';
import { notify } from '@/lib/notify';
import { TemplateFilters, filterResumeTemplates, INITIAL_TEMPLATE_FILTERS, TemplateFilterState } from '@/components/template-filters';

// A small, hand-picked shortcut so someone who doesn't want to scroll all 52
// templates can still land on something good immediately, one per broad
// archetype (tech, ATS-safe, executive/serif, engineering-dense, split-column,
// startup-modern), not a ranking of "the best" ones.
const POPULAR_TEMPLATE_IDS: TemplateType[] = [
    'modern',
    'ats_safe',
    'engineering',
    'classic',
    'two_column',
    'executive',
];

export function MiniLayoutRepresentation({
    type,
    template,
    isSelected = false
}: {
    type?: TemplateType;
    template?: ResumeTemplate;
    isSelected?: boolean;
}) {
    const tmpl = template || ALL_TEMPLATES.find((t) => t.id === type) || ALL_TEMPLATES[0];
    const previewSrc = tmpl.previewImage || `/templates/${tmpl.id}.png`;

    return (
        <div
            className={cn(
                "h-40 sm:h-52 w-full rounded-lg border overflow-hidden relative transition-[border-color,box-shadow] duration-300 bg-muted/20 shadow-xs",
                isSelected
                    ? "border-primary ring-2 ring-primary/40 shadow-md"
                    : "border-border/60 group-hover:border-primary/40 group-hover:shadow-xs"
            )}
        >
            <Image
                src={previewSrc}
                alt={`${tmpl.name} preview`}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 180px"
                priority={isSelected}
            />
            {tmpl.isAtsCompliant && (
                <span className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[9px] font-semibold flex items-center gap-0.5 shadow-xs backdrop-blur-xs">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    ATS
                </span>
            )}
        </div>
    );
}

export function TemplateSelector() {
    const template = useAppStore((s) => s.template);
    const setTemplate = useAppStore((s) => s.setTemplate);
    const resumeData = useAppStore((s) => s.resumeData);
    const [activeTab, setActiveTab] = useState<'popular' | 'all'>('popular');
    const [showFilters, setShowFilters] = useState(false);
    const popularScrollRef = useRef<HTMLDivElement>(null);
    // Hidden native scrollbar (no-scrollbar) means a plain mouse, no trackpad,
    // no shift+wheel habit, has no way to reach cards past the fold. These
    // arrow buttons are the mouse-accessible equivalent of the swipe/drag
    // gesture touch and trackpad users already have.
    const scrollPopularBy = (dir: 1 | -1) => {
        popularScrollRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
    };
    const [filters, setFilters] = useState<TemplateFilterState>(INITIAL_TEMPLATE_FILTERS);

    const filteredTemplates = useMemo(() => {
        return filterResumeTemplates(ALL_TEMPLATES, filters);
    }, [filters]);

    const activeTemplateObj = useMemo(() => {
        return ALL_TEMPLATES.find((t) => t.id === template) || ALL_TEMPLATES[0];
    }, [template]);

    const popularTemplates = useMemo(() => {
        return POPULAR_TEMPLATE_IDS
            .map((id) => ALL_TEMPLATES.find((t) => t.id === id))
            .filter((t): t is ResumeTemplate => Boolean(t));
    }, []);

    const handleSelect = (id: TemplateType) => {
        setTemplate(id);
        const tmpl = ALL_TEMPLATES.find((t) => t.id === id);
        notify.templateChanged(tmpl?.name || id);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
            {/* Nav bar between the two sections, each gets its own dedicated
                scroll area below instead of stacking both in one column,
                which is what caused the page to run out of room and clip
                instead of scroll once Popular Picks grew past one row. */}
            <div className="shrink-0 inline-flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 self-start">
                <button
                    type="button"
                    onClick={() => setActiveTab('popular')}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-[background-color,color,box-shadow] cursor-pointer",
                        activeTab === 'popular'
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Popular Picks</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-[background-color,color,box-shadow] cursor-pointer",
                        activeTab === 'all'
                            ? "bg-background text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>All {ALL_TEMPLATES.length}</span>
                </button>
            </div>

            {/* Popular Picks: single horizontally-scrollable row, a fast path
                for anyone who doesn't want to browse all 52. */}
            {activeTab === 'popular' && (
                <div className="shrink-0 relative group/scroll">
                    <button
                        type="button"
                        aria-label="Scroll left"
                        onClick={() => scrollPopularBy(-1)}
                        className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-md cursor-pointer opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-muted"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        aria-label="Scroll right"
                        onClick={() => scrollPopularBy(1)}
                        className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-md cursor-pointer opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-muted"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <div ref={popularScrollRef} className="w-full flex gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth">
                        {popularTemplates.map((tmpl) => {
                            const isSelected = template === tmpl.id;
                            return (
                                <button
                                    key={tmpl.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    aria-label={`${tmpl.name} template: ${tmpl.description}`}
                                    onClick={() => handleSelect(tmpl.id as TemplateType)}
                                    className={cn(
                                        "group shrink-0 w-36 sm:w-40 flex flex-col rounded-xl border p-2 text-left transition-[border-color,background-color,box-shadow] duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden",
                                        isSelected
                                            ? "border-primary ring-2 ring-primary/40 bg-primary/[0.04] shadow-sm"
                                            : "border-border/60 bg-muted/15 hover:border-primary/40 hover:bg-muted/30"
                                    )}
                                >
                                    <MiniLayoutRepresentation template={tmpl} isSelected={isSelected} />
                                    <div className="mt-1.5 flex items-center justify-between gap-1">
                                        <span className="text-xs font-semibold text-foreground truncate">{tmpl.name}</span>
                                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary stroke-[3]" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* All 52 Templates */}
            {activeTab === 'all' && (
                <div className="flex-1 flex flex-col min-h-0 space-y-2">
                    {/* Toolbar: Quick Controls */}
                    <div className="shrink-0 flex items-center justify-between gap-2.5 p-2 px-3 rounded-xl border border-border bg-muted/30 shadow-2xs flex-wrap sm:flex-nowrap">
                        <span className="text-xs text-muted-foreground font-mono">
                            {filteredTemplates.length} of {ALL_TEMPLATES.length} layouts
                        </span>
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-[background-color,color,border-color,box-shadow] cursor-pointer",
                                    showFilters
                                        ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                                        : "bg-muted/40 text-muted-foreground border-border/70 hover:text-foreground"
                                )}
                            >
                                <SlidersHorizontal className="h-3 w-3" />
                                <span>Filter & Search</span>
                            </button>
                        </div>
                    </div>

                    {/* Expandable Multi-Attribute Filters */}
                    {showFilters && (
                        <div className="shrink-0">
                            <TemplateFilters
                                filters={filters}
                                onChange={setFilters}
                                totalCount={ALL_TEMPLATES.length}
                                matchCount={filteredTemplates.length}
                                compact={true}
                            />
                        </div>
                    )}

                    {/* Templates Grid Cards */}
                    <div
                        role="radiogroup"
                        aria-label="Select resume layout template"
                        className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3"
                    >
                        {filteredTemplates.map((tmpl) => {
                            const isSelected = template === tmpl.id;
                            const fitLevel = resumeData
                                ? getTemplateFitLevel(resumeData, tmpl.id as TemplateType)
                                : 'recommended';
                            const fitCopy = getTemplateFitCopy(fitLevel);

                            return (
                                <button
                                    key={tmpl.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    aria-label={`${tmpl.name} template: ${tmpl.description}`}
                                    onClick={() => handleSelect(tmpl.id as TemplateType)}
                                    className={cn(
                                        "group relative flex flex-col justify-between rounded-xl border p-2 text-left transition-[border-color,background-color,box-shadow] duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden",
                                        isSelected
                                            ? "border-primary ring-2 ring-primary/40 bg-primary/[0.04] shadow-sm"
                                            : "border-border/60 bg-muted/15 hover:border-primary/40 hover:bg-muted/30"
                                    )}
                                >
                                    {/* Visual representation */}
                                    <MiniLayoutRepresentation template={tmpl} isSelected={isSelected} />

                                    {/* Label & Style */}
                                    <div className="mt-1.5 space-y-0.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-foreground truncate">{tmpl.name}</span>
                                            {isSelected && <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block truncate">{tmpl.subtitle || tmpl.badge}</span>
                                    </div>

                                    {/* Fit pill */}
                                    <div className="mt-1 pt-1 border-t border-border/40 flex items-center justify-between gap-1">
                                        <span className={cn(
                                            "text-[9px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap",
                                            fitLevel === 'recommended' || fitLevel === 'good'
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                        )}>
                                            {fitCopy.label}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground/80 font-mono capitalize shrink-0">
                                            {tmpl.layout === 'two_column' ? 'Split' : tmpl.density}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground text-xs space-y-1">
                            <p>No templates found matching your current filter criteria.</p>
                            <button
                                type="button"
                                onClick={() => setFilters(INITIAL_TEMPLATE_FILTERS)}
                                className="text-primary hover:underline font-medium"
                            >
                                Reset all filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Selected Template Detail Footnote */}
            {activeTemplateObj && (
                <div className="shrink-0 p-2 sm:p-2.5 px-3 rounded-lg border border-border/60 bg-muted/10 text-xs flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-xs">{activeTemplateObj.name}</span>
                            <span className="px-1.5 py-0.2 rounded bg-muted text-[10px] text-muted-foreground font-mono">
                                {activeTemplateObj.subtitle || activeTemplateObj.badge}
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{activeTemplateObj.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
