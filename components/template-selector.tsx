"use client";

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { TemplateType } from '@/lib/resume-schema';
import { cn } from '@/lib/utils';
import {
    Palette,
    Check,
    Search,
    ShieldCheck,
    Cpu,
    Briefcase,
    Sparkles,
    GraduationCap,
    SlidersHorizontal,
} from 'lucide-react';
import { getTemplateFitCopy, getTemplateFitLevel } from '@/lib/typst-layout';
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES, ResumeTemplate } from '@/lib/templates-data';
import Image from 'next/image';
import { InteractiveSelector } from '@/components/ui/interactive-selector';

const colorSwatches = [
    { id: 'none', label: 'Default Slate', hex: '#64748B' },
    { id: 'navy', label: 'Deep Navy', hex: '#1E3A8A' },
    { id: 'cobalt', label: 'Cobalt Blue', hex: '#1E40AF' },
    { id: 'emerald', label: 'Emerald Green', hex: '#047857' },
    { id: 'burgundy', label: 'Burgundy Wine', hex: '#881337' },
    { id: 'teal', label: 'Nordic Teal', hex: '#0E7490' },
    { id: 'slate', label: 'Graphite', hex: '#334155' },
    { id: 'black', label: 'Pure Black', hex: '#000000' },
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
                "h-28 w-full rounded-lg border overflow-hidden relative transition-all duration-300 bg-muted/20 shadow-xs",
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
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 180px"
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
    const { template, setTemplate, theme = 'none', setTheme, resumeData } = useAppStore();
    const [viewMode, setViewMode] = useState<'interactive' | 'grid'>('interactive');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categoryIcons: Record<string, React.ReactNode> = {
        all: <SlidersHorizontal className="h-3.5 w-3.5" />,
        ats: <ShieldCheck className="h-3.5 w-3.5" />,
        tech: <Cpu className="h-3.5 w-3.5" />,
        executive: <Briefcase className="h-3.5 w-3.5" />,
        creative: <Sparkles className="h-3.5 w-3.5" />,
        academic: <GraduationCap className="h-3.5 w-3.5" />,
    };

    const filteredTemplates = useMemo(() => {
        return ALL_TEMPLATES.filter((tmpl) => {
            const matchesCategory = selectedCategory === 'all' || tmpl.category === selectedCategory;
            const matchesSearch =
                !searchQuery.trim() ||
                tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tmpl.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tmpl.style.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    const activeTemplateObj = useMemo(() => {
        return ALL_TEMPLATES.find((t) => t.id === template) || ALL_TEMPLATES[0];
    }, [template]);

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-2.5">
            {/* Top Toolbar: Pinned Color Palette & View Controls (Single Compact Line, 0 Scroll) */}
            <div className="shrink-0 flex items-center justify-between gap-2.5 p-2 px-3 rounded-xl border border-border/80 bg-muted/25 dark:bg-[#12141a]/80 shadow-2xs">
                {/* Left: Compact Color Dots */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <Palette className="h-3 w-3 text-primary" />
                        Color:
                    </span>

                    <div
                        role="radiogroup"
                        aria-label="Accent Color Palette"
                        className="flex items-center gap-1.5"
                    >
                        {colorSwatches.map((swatch) => {
                            const isSelected = theme === swatch.id;
                            return (
                                <button
                                    key={swatch.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    aria-label={`${swatch.label} accent color`}
                                    onClick={() => setTheme(swatch.id)}
                                    className={cn(
                                        "relative h-5 w-5 sm:h-5.5 sm:w-5.5 rounded-full transition-all flex items-center justify-center cursor-pointer",
                                        isSelected
                                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-xs"
                                            : "hover:scale-115 opacity-80 hover:opacity-100"
                                    )}
                                    style={{ backgroundColor: swatch.hex }}
                                    title={swatch.label}
                                >
                                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: View Mode Toggle & Search */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="inline-flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setViewMode('interactive')}
                            className={cn(
                                "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                                viewMode === 'interactive'
                                    ? "bg-background text-foreground shadow-xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            title="Interactive Expanding Archetype Selector"
                        >
                            <Sparkles className="h-3 w-3 text-primary" />
                            <span>Interactive</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                                viewMode === 'grid'
                                    ? "bg-background text-foreground shadow-xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            title="All 48 Templates Grid"
                        >
                            <SlidersHorizontal className="h-3 w-3" />
                            <span>All 48</span>
                        </button>
                    </div>

                    {viewMode === 'grid' && (
                        <div className="relative w-36 sm:w-44">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-7 pr-2 py-0.5 text-xs bg-muted/30 border border-border/70 rounded-md placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* View Mode Content */}
            {viewMode === 'interactive' ? (
                <div className="flex-1 flex flex-col min-h-0 justify-between gap-2 overflow-hidden">
                    <InteractiveSelector
                        selectedId={template}
                        onSelect={(id) => setTemplate(id)}
                        className="flex-1 min-h-0"
                    />
                    <div className="shrink-0 flex items-center justify-between px-1 text-xs text-muted-foreground">
                        <span className="text-[11px] truncate">
                            Click any archetype to expand. Changes recompile live into your vector PDF.
                        </span>
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className="text-xs font-semibold text-primary hover:underline cursor-pointer shrink-0 ml-2"
                        >
                            Browse all 48 templates →
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-2">
                    {/* Category Pills (Pinned at top of grid) */}
                    <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border/30">
                        {TEMPLATE_CATEGORIES.map((cat) => {
                            const isCurrent = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer",
                                        isCurrent
                                            ? "bg-primary text-primary-foreground shadow-xs"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                    )}
                                >
                                    {categoryIcons[cat.id]}
                                    <span>{cat.label}</span>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.2 rounded-full",
                                        isCurrent ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                                    )}>
                                        {cat.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Template Grid with Contained Smooth Scrolling: strictly fills remaining height */}
                    <div
                        role="radiogroup"
                        aria-label="Select resume layout template"
                        className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5"
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
                                    onClick={() => setTemplate(tmpl.id as TemplateType)}
                                    className={cn(
                                        "group relative flex flex-col justify-between rounded-xl border p-2 text-left transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
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
                                        <span className="text-[10px] text-muted-foreground block truncate">{tmpl.badge}</span>
                                    </div>

                                    {/* Fit pill */}
                                    <div className="mt-1 pt-1 border-t border-border/40 flex items-center justify-between">
                                        <span className={cn(
                                            "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                                            fitLevel === 'recommended' || fitLevel === 'good'
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                        )}>
                                            {fitCopy.label}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground/80 font-mono">
                                            {tmpl.style.split(' ')[0]}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {filteredTemplates.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground text-xs space-y-1">
                            <p>No templates found matching &ldquo;{searchQuery}&rdquo;</p>
                            <button
                                type="button"
                                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                                className="text-primary hover:underline font-medium"
                            >
                                Clear search filter
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
                                {activeTemplateObj.categoryLabel}
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{activeTemplateObj.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
