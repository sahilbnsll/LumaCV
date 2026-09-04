"use client";

import { useAppStore } from '@/lib/store';
import { TemplateType } from '@/lib/resume-schema';
import { cn } from '@/lib/utils';
import { Palette, Check } from 'lucide-react';
import { getTemplateFitCopy, getTemplateFitLevel } from '@/lib/typst-layout';

interface TemplateOption {
    value: TemplateType;
    label: string;
    description: string;
    style: string;
}

const templateOptions: TemplateOption[] = [
    {
        value: 'modern',
        label: 'Modern',
        style: 'Clean Sans-Serif',
        description: 'Left-aligned header with colored divider rule',
    },
    {
        value: 'classic',
        label: 'Classic',
        style: 'Ivy League Serif',
        description: 'Centered serif header with horizontal dividing rules',
    },
    {
        value: 'engineering',
        label: 'Engineering',
        style: 'High-Density Technical',
        description: 'Split header with top technical competencies block',
    },
    {
        value: 'compact',
        label: 'Compact',
        style: 'Space-Optimized',
        description: 'Split middle columns engineered for 1-page fit',
    },
    {
        value: 'two_column',
        label: 'Two-Column',
        style: 'Asymmetric Sidebar',
        description: '30% left sidebar for skills, 70% right for experience',
    },
    {
        value: 'ats_safe',
        label: 'ATS-Safe',
        style: 'Linear Pure Text',
        description: 'Strict linear layout for high-volume enterprise filters',
    },
];

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

/**
 * Compact, stylized structural mini resume representations
 * Visually communicates margins, headers, column splits, and accents cleanly without unreadable micro-text.
 */
export function MiniLayoutRepresentation({ type, isSelected = false }: { type: TemplateType; isSelected?: boolean }) {


    return (
        <div
            className={cn(
                "h-20 w-full rounded-md border p-2 flex flex-col justify-between transition-colors bg-card shadow-xs",
                isSelected
                    ? "border-primary bg-primary/[0.04]"
                    : "border-border/60 bg-muted/20 group-hover:border-primary/40 group-hover:bg-muted/30"
            )}
        >
            {type === 'modern' && (
                <div className="flex flex-col justify-between h-full">
                    {/* Header */}
                    <div>
                        <div className="flex items-center justify-between">
                            <div className="h-1.5 w-1/3 rounded-xs bg-foreground/60" />
                            <div className="h-1 w-1/4 rounded-xs bg-foreground/20" />
                        </div>
                        {/* Distinct Modern Accent Line */}
                        <div className="h-0.5 w-full bg-primary/70 my-1 rounded-full" />
                    </div>
                    {/* Body lines */}
                    <div className="space-y-1">
                        <div className="h-1 w-2/3 rounded-xs bg-foreground/30" />
                        <div className="h-1 w-full rounded-xs bg-foreground/15" />
                        <div className="h-1 w-4/5 rounded-xs bg-foreground/15" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="h-1 w-1/2 rounded-xs bg-foreground/30" />
                        <div className="h-1 w-full rounded-xs bg-foreground/15" />
                    </div>
                </div>
            )}

            {type === 'classic' && (
                <div className="flex flex-col justify-between h-full text-center">
                    {/* Centered Serif Header */}
                    <div className="flex flex-col items-center">
                        <div className="h-1.5 w-2/5 rounded-xs bg-foreground/60" />
                        <div className="h-0.5 w-1/2 rounded-xs bg-foreground/25 mt-0.5" />
                        <div className="h-[0.5px] w-full bg-border my-1" />
                    </div>
                    {/* Classic Sections */}
                    <div className="space-y-1 text-left">
                        <div className="flex justify-between items-center">
                            <div className="h-1 w-1/3 rounded-xs bg-foreground/40 font-serif" />
                            <div className="h-0.5 w-1/5 rounded-xs bg-foreground/20" />
                        </div>
                        <div className="h-1 w-full rounded-xs bg-foreground/15" />
                        <div className="h-1 w-5/6 rounded-xs bg-foreground/15" />
                    </div>
                    <div className="space-y-0.5 text-left">
                        <div className="h-1 w-1/4 rounded-xs bg-foreground/40" />
                        <div className="h-1 w-full rounded-xs bg-foreground/15" />
                    </div>
                </div>
            )}

            {type === 'engineering' && (
                <div className="flex flex-col justify-between h-full">
                    {/* Split Row Header */}
                    <div className="flex justify-between items-center border-b border-border/80 pb-1">
                        <div className="h-1.5 w-1/3 rounded-xs bg-primary/70 font-mono" />
                        <div className="h-1 w-1/3 rounded-xs bg-foreground/25" />
                    </div>
                    {/* Technical Competencies Grid Block */}
                    <div className="grid grid-cols-3 gap-0.5 bg-muted/40 p-0.5 rounded">
                        <div className="h-1 rounded-xs bg-primary/30" />
                        <div className="h-1 rounded-xs bg-foreground/20" />
                        <div className="h-1 rounded-xs bg-foreground/20" />
                    </div>
                    {/* High-density experience rows */}
                    <div className="space-y-0.5">
                        <div className="flex justify-between">
                            <div className="h-1 w-2/5 rounded-xs bg-foreground/40" />
                            <div className="h-0.5 w-1/4 rounded-xs bg-foreground/20" />
                        </div>
                        <div className="h-1 w-full rounded-xs bg-foreground/15" />
                        <div className="h-1 w-11/12 rounded-xs bg-foreground/15" />
                    </div>
                </div>
            )}

            {type === 'compact' && (
                <div className="flex flex-col justify-between h-full">
                    {/* Compact Header */}
                    <div className="flex items-center justify-between border-b border-border/70 pb-0.5">
                        <div className="h-1.5 w-1/3 rounded-xs bg-foreground/60" />
                        <div className="h-1 w-2/5 rounded-xs bg-foreground/20" />
                    </div>
                    {/* Space-Saving Split Column Middle */}
                    <div className="grid grid-cols-2 gap-1 py-0.5">
                        <div className="space-y-0.5 bg-muted/30 p-0.5 rounded">
                            <div className="h-1 w-3/4 rounded-xs bg-foreground/30" />
                            <div className="h-0.5 w-full rounded-xs bg-foreground/15" />
                        </div>
                        <div className="space-y-0.5 bg-muted/30 p-0.5 rounded">
                            <div className="h-1 w-3/4 rounded-xs bg-foreground/30" />
                            <div className="h-0.5 w-full rounded-xs bg-foreground/15" />
                        </div>
                    </div>
                    {/* Compact Linear Experience */}
                    <div className="space-y-0.5">
                        <div className="h-1 w-full rounded-xs bg-foreground/15" />
                        <div className="h-1 w-4/5 rounded-xs bg-foreground/15" />
                    </div>
                </div>
            )}

            {type === 'two_column' && (
                <div className="flex h-full gap-1.5">
                    {/* Left Shaded Sidebar (30%) */}
                    <div className="w-[32%] rounded bg-primary/[0.08] border border-primary/20 p-1 flex flex-col justify-between">
                        <div className="space-y-1">
                            <div className="h-1.5 w-full rounded-xs bg-primary/70" />
                            <div className="h-1 w-4/5 rounded-xs bg-foreground/30" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="h-0.5 w-full rounded-xs bg-foreground/20" />
                            <div className="h-0.5 w-3/4 rounded-xs bg-foreground/20" />
                        </div>
                    </div>
                    {/* Right Main Body (70%) */}
                    <div className="w-[68%] flex flex-col justify-between py-0.5">
                        <div className="space-y-1">
                            <div className="h-1.5 w-2/3 rounded-xs bg-foreground/50" />
                            <div className="h-1 w-full rounded-xs bg-foreground/15" />
                            <div className="h-1 w-5/6 rounded-xs bg-foreground/15" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="h-1 w-1/2 rounded-xs bg-foreground/30" />
                            <div className="h-1 w-full rounded-xs bg-foreground/15" />
                        </div>
                    </div>
                </div>
            )}

            {type === 'ats_safe' && (
                <div className="flex flex-col justify-between h-full">
                    {/* High-Contrast Linear Header */}
                    <div>
                        <div className="h-1.5 w-1/2 rounded-xs bg-foreground/80 font-mono" />
                        <div className="h-0.5 w-full bg-border my-0.5" />
                    </div>
                    {/* Strict Linear Blocks */}
                    <div className="space-y-0.5">
                        <div className="h-1 w-1/3 rounded-xs bg-foreground/50 uppercase font-mono" />
                        <div className="h-1 w-full rounded-xs bg-foreground/20" />
                        <div className="h-1 w-5/6 rounded-xs bg-foreground/15" />
                    </div>
                    <div className="space-y-0.5">
                        <div className="h-1 w-1/4 rounded-xs bg-foreground/50 uppercase font-mono" />
                        <div className="h-1 w-full rounded-xs bg-foreground/15" />
                    </div>
                </div>
            )}
        </div>
    );
}

export function TemplateSelector() {
    const { template, setTemplate, theme = 'none', setTheme, resumeData } = useAppStore();

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Typesetting Template
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Compact, layout-accurate representations. Click to switch instantly.
                </p>
            </div>

            {/* Compact Template Grid with ARIA radiogroup */}
            <div
                role="radiogroup"
                aria-label="Select resume layout template"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5"
            >
                {templateOptions.map((opt) => {
                    const isSelected = template === opt.value;
                    const fitLevel = resumeData ? getTemplateFitLevel(resumeData, opt.value) : 'recommended';
                    const fitCopy = getTemplateFitCopy(fitLevel);

                    return (
                        <button
                            key={opt.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`${opt.label} template: ${opt.description}`}
                            onClick={() => setTemplate(opt.value)}
                            className={cn(
                                "group relative flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                                isSelected
                                    ? "border-primary ring-2 ring-primary/40 bg-primary/[0.04] shadow-sm"
                                    : "border-border/60 bg-muted/15 hover:border-primary/40 hover:bg-muted/25"
                            )}
                        >
                            {/* Visual representation */}
                            <MiniLayoutRepresentation type={opt.value} isSelected={isSelected} />

                            {/* Label & Style */}
                            <div className="mt-2.5 space-y-0.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-foreground truncate">{opt.label}</span>
                                    {isSelected && <Check className="h-3.5 w-3.5 text-primary stroke-[3]" />}
                                </div>
                                <span className="text-[10px] text-muted-foreground block truncate">{opt.style}</span>
                            </div>

                            {/* Fit pill */}
                            <div className="mt-2 pt-1.5 border-t border-border/40 flex items-center justify-between">
                                <span className={cn(
                                    "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                                    fitLevel === 'recommended' || fitLevel === 'good' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                )}>
                                    {fitCopy.label}
                                </span>
                            </div>

                        </button>
                    );
                })}
            </div>

            {/* Accent Color Swatches with ARIA radiogroup & >=40px touch targets */}
            <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <div>
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                            Accent Color Palette
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            Applied to headings, rules, and bullet emphasis.
                        </span>
                    </div>
                </div>

                <div
                    role="radiogroup"
                    aria-label="Accent Color Palette"
                    className="flex items-center gap-1 flex-wrap"
                >
                    {colorSwatches.map((swatch) => (
                        <button
                            key={swatch.id}
                            type="button"
                            role="radio"
                            aria-checked={theme === swatch.id}
                            aria-label={`${swatch.label} accent color`}
                            onClick={() => setTheme(swatch.id)}
                            className="h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-muted/50 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                            title={swatch.label}
                        >
                            <span
                                className={cn(
                                    "h-6 w-6 rounded-full border transition-transform flex items-center justify-center",
                                    theme === swatch.id
                                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-xs"
                                        : "border-border/60 hover:scale-105 opacity-80 hover:opacity-100"
                                )}
                                style={{ backgroundColor: swatch.hex }}
                            >
                                {theme === swatch.id && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
