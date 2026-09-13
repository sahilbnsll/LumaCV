"use client";

import React from 'react';
import {
    TemplateLayout,
    TemplateStyle,
    TemplateDensity,
    TemplateUseCase,
    ResumeTemplate,
} from '@/lib/templates-data';
import { Search, X, SlidersHorizontal, RotateCcw, Columns2, Square, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface TemplateFilterState {
    search: string;
    layout: 'all' | TemplateLayout;
    style: 'all' | TemplateStyle;
    density: 'all' | TemplateDensity;
    useCase: 'all' | TemplateUseCase;
}

export const INITIAL_TEMPLATE_FILTERS: TemplateFilterState = {
    search: '',
    layout: 'all',
    style: 'all',
    density: 'all',
    useCase: 'all',
};

interface TemplateFiltersProps {
    filters: TemplateFilterState;
    onChange: (next: TemplateFilterState) => void;
    totalCount: number;
    matchCount: number;
    compact?: boolean; // For embedded panels like TemplateSelector
}

export function TemplateFilters({
    filters,
    onChange,
    totalCount,
    matchCount,
    compact = false,
}: TemplateFiltersProps) {
    const isFiltered =
        filters.search.trim() !== '' ||
        filters.layout !== 'all' ||
        filters.style !== 'all' ||
        filters.density !== 'all' ||
        filters.useCase !== 'all';

    const handleReset = () => {
        onChange(INITIAL_TEMPLATE_FILTERS);
    };

    const layoutOptions: { id: 'all' | TemplateLayout; label: string }[] = [
        { id: 'all', label: 'All Layouts' },
        { id: 'single_column', label: 'Single Column' },
        { id: 'two_column', label: 'Two Column / Split' },
    ];

    const styleOptions: { id: 'all' | TemplateStyle; label: string }[] = [
        { id: 'all', label: 'All Styles' },
        { id: 'minimal', label: 'Minimal' },
        { id: 'classic', label: 'Classic' },
        { id: 'modern', label: 'Modern' },
        { id: 'professional', label: 'Professional' },
    ];

    const densityOptions: { id: 'all' | TemplateDensity; label: string }[] = [
        { id: 'all', label: 'All Densities' },
        { id: 'compact', label: 'Compact (1-Page)' },
        { id: 'balanced', label: 'Balanced' },
        { id: 'spacious', label: 'Spacious' },
    ];

    const useCaseOptions: { id: 'all' | TemplateUseCase; label: string }[] = [
        { id: 'all', label: 'All Roles' },
        { id: 'technical', label: 'Technical & Eng' },
        { id: 'executive', label: 'Executive & Lead' },
        { id: 'general', label: 'General / Product' },
        { id: 'academic', label: 'Academic & CV' },
    ];

    return (
        <div className={cn(
            "w-full rounded-2xl border border-border/80 bg-card shadow-2xs transition-all",
            compact ? "p-2.5 space-y-2.5 text-xs" : "p-4 space-y-4 text-sm"
        )}>
            {/* Search & Status Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search templates by role, layout, typeface, or tag..."
                        value={filters.search}
                        onChange={(e) => onChange({ ...filters, search: e.target.value })}
                        className={cn(
                            "w-full rounded-xl border border-border/60 bg-muted/40 pl-8.5 pr-8 py-1.5 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all",
                            compact ? "text-xs h-8" : "text-xs sm:text-sm h-9"
                        )}
                    />
                    {filters.search && (
                        <button
                            type="button"
                            onClick={() => onChange({ ...filters, search: '' })}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                    <span className="text-xs font-mono text-muted-foreground">
                        Showing <strong className="text-foreground">{matchCount}</strong> of {totalCount}
                    </span>

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Pill Rows */}
            <div className={cn(
                "grid gap-2 pt-1 border-t border-border/50",
                compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            )}>
                {/* Layout Filter */}
                <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                        <Columns2 className="h-2.5 w-2.5" />
                        Layout
                    </label>
                    <div className="flex flex-wrap gap-1">
                        {layoutOptions.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => onChange({ ...filters, layout: opt.id })}
                                className={cn(
                                    "px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border",
                                    filters.layout === opt.id
                                        ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                                        : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Style Filter */}
                <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        Aesthetic Style
                    </label>
                    <div className="flex flex-wrap gap-1">
                        {styleOptions.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => onChange({ ...filters, style: opt.id })}
                                className={cn(
                                    "px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border",
                                    filters.style === opt.id
                                        ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                                        : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Density Filter */}
                <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                        <Square className="h-2.5 w-2.5" />
                        Information Density
                    </label>
                    <div className="flex flex-wrap gap-1">
                        {densityOptions.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => onChange({ ...filters, density: opt.id })}
                                className={cn(
                                    "px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border",
                                    filters.density === opt.id
                                        ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                                        : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Use Case / Role Filter */}
                <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        Target Domain / Role
                    </label>
                    <div className="flex flex-wrap gap-1">
                        {useCaseOptions.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => onChange({ ...filters, useCase: opt.id })}
                                className={cn(
                                    "px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border",
                                    filters.useCase === opt.id
                                        ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                                        : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60 hover:text-foreground"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function filterResumeTemplates(
    templates: ResumeTemplate[],
    filters: TemplateFilterState
): ResumeTemplate[] {
    const q = filters.search.toLowerCase().trim();

    return templates.filter((tmpl) => {
        // Layout check
        if (filters.layout !== 'all' && tmpl.layout !== filters.layout) {
            return false;
        }

        // Style check
        if (filters.style !== 'all' && tmpl.style !== filters.style) {
            return false;
        }

        // Density check
        if (filters.density !== 'all' && tmpl.density !== filters.density) {
            return false;
        }

        // Use case check
        if (filters.useCase !== 'all' && tmpl.useCase !== filters.useCase) {
            return false;
        }

        // Text search check
        if (q) {
            const matchName = tmpl.name.toLowerCase().includes(q);
            const matchSub = tmpl.subtitle?.toLowerCase().includes(q);
            const matchDesc = tmpl.description.toLowerCase().includes(q);
            const matchBadge = tmpl.badge.toLowerCase().includes(q);
            const matchCategory = tmpl.categoryLabel.toLowerCase().includes(q);
            const matchTags = tmpl.tags?.some(t => t.toLowerCase().includes(q));

            if (!matchName && !matchSub && !matchDesc && !matchBadge && !matchCategory && !matchTags) {
                return false;
            }
        }

        return true;
    });
}
