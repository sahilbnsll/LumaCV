"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColorSwatch {
    id: string;
    label: string;
    hex: string;
    description: string;
}

export const COLOR_SWATCHES: ColorSwatch[] = [
    { id: 'none', label: 'Default Slate', hex: '#64748B', description: 'Neutral balanced slate tone' },
    { id: 'navy', label: 'Deep Navy', hex: '#1E3A8A', description: 'Classic corporate banking navy' },
    { id: 'cobalt', label: 'Cobalt Blue', hex: '#1E40AF', description: 'Modern tech vibrant cobalt' },
    { id: 'emerald', label: 'Emerald Green', hex: '#047857', description: 'Prestigious natural emerald' },
    { id: 'burgundy', label: 'Burgundy Wine', hex: '#881337', description: 'Executive warm burgundy' },
    { id: 'teal', label: 'Nordic Teal', hex: '#0E7490', description: 'Contemporary editorial teal' },
    { id: 'slate', label: 'Graphite', hex: '#334155', description: 'Industrial high-contrast dark graphite' },
    { id: 'black', label: 'Pure Black', hex: '#000000', description: 'Minimalist high-contrast monochrome' },
];

export function ColorPaletteSelector({ className }: { className?: string }) {
    const theme = useAppStore((s) => s.theme || 'none');
    const setTheme = useAppStore((s) => s.setTheme);

    const activeSwatch = COLOR_SWATCHES.find((s) => s.id === theme) || COLOR_SWATCHES[0];

    return (
        <div className={cn(
            "flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border border-border/70 dark:border-white/10 bg-card/70 dark:bg-[#0e1014]/70 backdrop-blur-md shadow-xs flex-wrap sm:flex-nowrap",
            className
        )}>
            {/* Left: Section Label with Active Color Pill */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Palette className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={2.2} />
                    <span>Accent Palette:</span>
                </div>
                <span className="inline-flex text-[11px] font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted/40 dark:bg-white/[0.04] border border-border/50">
                    {activeSwatch.label}
                </span>
            </div>

            {/* Right: Swatches Selector */}
            <div 
                role="radiogroup" 
                aria-label="Resume Accent Color Palette"
                className="flex items-center gap-1.5 sm:gap-2 flex-wrap"
            >
                {COLOR_SWATCHES.map((swatch) => {
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
                                "group relative h-6 w-6 sm:h-6.5 sm:w-6.5 rounded-full transition-all flex items-center justify-center cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                isSelected
                                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-sm"
                                    : "opacity-80 hover:opacity-100 hover:scale-115"
                            )}
                            style={{ backgroundColor: swatch.hex }}
                        >
                            {isSelected && (
                                <Check className="h-3 w-3 text-white stroke-[3] drop-shadow-xs" />
                            )}
                            {/* Hover tooltip label placed above */}
                            <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 bg-popover text-popover-foreground text-[10px] font-medium px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap z-50 border border-border/80">
                                {swatch.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
