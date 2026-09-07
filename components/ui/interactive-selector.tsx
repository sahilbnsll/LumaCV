"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
    Terminal,
    Cpu,
    GraduationCap,
    ShieldCheck,
    Columns2,
    Check,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { TemplateType } from '@/lib/resume-schema';
import { toast } from 'sonner';

export interface ArchetypeOption {
    id: TemplateType;
    title: string;
    archetype: string;
    description: string;
    image: string;
    icon: React.ReactNode;
    tag: string;
    fitLevel: string;
    accentDot: string;
}

export const TYPST_ARCHETYPES: ArchetypeOption[] = [
    {
        id: 'engineering',
        title: "Engineering Mono",
        archetype: "Monospace Telemetry",
        description: "DevOps, SRE, & Systems. Monospace typography with dense tech badge matrices.",
        image: "/templates/renders/engineering-emerald.png",
        icon: <Terminal className="h-4 w-4 text-emerald-500" />,
        tag: "DevOps & Cloud",
        fitLevel: "Systems Engineering",
        accentDot: "bg-emerald-500",
    },
    {
        id: 'modern',
        title: "Modern Cobalt",
        archetype: "Tech & Architecture",
        description: "Fullstack, Mobile, & Distributed Systems. Refined hierarchy with clean rules.",
        image: "/templates/renders/modern-cobalt.png",
        icon: <Cpu className="h-4 w-4 text-blue-500" />,
        tag: "Tech & Architecture",
        fitLevel: "Fullstack & Mobile",
        accentDot: "bg-blue-500",
    },
    {
        id: 'classic',
        title: "Harvard Classic",
        archetype: "Executive Serif",
        description: "Leadership, Finance, & Advisory. Ivy League serif typesetting with restrained balance.",
        image: "/templates/renders/classic-navy.png",
        icon: <GraduationCap className="h-4 w-4 text-indigo-500" />,
        tag: "Executive & Finance",
        fitLevel: "Director & Staff",
        accentDot: "bg-indigo-500",
    },
    {
        id: 'ats_safe',
        title: "ATS-Safe Linear",
        archetype: "Enterprise Standard",
        description: "High-volume corporate portals. Single-column format with zero parsing failures.",
        image: "/templates/renders/ats_safe-black.png",
        icon: <ShieldCheck className="h-4 w-4 text-zinc-500" />,
        tag: "Enterprise ATS",
        fitLevel: "100% Machine Parsable",
        accentDot: "bg-zinc-500",
    },
    {
        id: 'two_column',
        title: "Two-Column Split",
        archetype: "Structured Grid",
        description: "Product & Architecture. Balanced dual-column separating core achievements from stack.",
        image: "/templates/renders/two_column-teal.png",
        icon: <Columns2 className="h-4 w-4 text-teal-500" />,
        tag: "Product & Strategy",
        fitLevel: "Multi-Role Density",
        accentDot: "bg-teal-500",
    }
];

export interface InteractiveSelectorProps {
    selectedId?: string;
    onSelect?: (templateId: TemplateType) => void;
    showHeader?: boolean;
    className?: string;
}

export const InteractiveSelector: React.FC<InteractiveSelectorProps> = ({
    selectedId,
    onSelect,
    showHeader = false,
    className,
}) => {
    const storeTemplate = useAppStore((s) => s.template);
    const setTemplate = useAppStore((s) => s.setTemplate);
    const currentActiveTemplate = selectedId || storeTemplate || 'engineering';

    // Find initial index matching current store template or default to 0
    const initialIndex = Math.max(
        0,
        TYPST_ARCHETYPES.findIndex((opt) => opt.id === currentActiveTemplate)
    );

    const [activeIndex, setActiveIndex] = useState<number>(initialIndex);

    // Sync external selectedId if it changes
    useEffect(() => {
        const found = TYPST_ARCHETYPES.findIndex((opt) => opt.id === currentActiveTemplate);
        if (found !== -1 && found !== activeIndex) {
            setActiveIndex(found);
        }
    }, [currentActiveTemplate, activeIndex]);

    const handleOptionClick = useCallback((index: number) => {
        setActiveIndex(index);
        const selected = TYPST_ARCHETYPES[index];
        if (onSelect) {
            onSelect(selected.id);
        } else {
            setTemplate(selected.id);
            toast.success(`Typesetting switched to ${selected.title}`, {
                description: `${selected.archetype} layout compiled into vector preview.`,
                duration: 2500,
            });
        }
    }, [onSelect, setTemplate]);

    return (
        <div className={cn("w-full flex flex-col items-center justify-center select-none", className)}>
            {/* Optional Header Section */}
            {showHeader && (
                <div className="w-full max-w-2xl px-4 mb-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 mb-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        Signature Typst Archetypes
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-foreground tracking-tight">
                        Interactive Layout Engine Selector
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
                        Click any architectural archetype to expand and inspect its typography, density, and ATS telemetry.
                    </p>
                </div>
            )}

            {/* Mobile View: Clean Touch-Friendly Snap Scroll Carousel (< sm) */}
            <div className="sm:hidden w-full space-y-2.5">
                <div
                    role="tablist"
                    aria-label="Typst Archetype Selector"
                    className="w-full flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none p-1.5 rounded-2xl bg-muted/30 dark:bg-[#111317]/80 border border-border/80"
                >
                    {TYPST_ARCHETYPES.map((option, index) => {
                        const isActive = activeIndex === index;
                        const isSelectedInStore = storeTemplate === option.id;

                        return (
                            <div
                                key={option.id}
                                role="tab"
                                aria-selected={isActive}
                                tabIndex={0}
                                onClick={() => handleOptionClick(index)}
                                className={cn(
                                    "relative w-[230px] shrink-0 snap-center h-[260px] flex flex-col justify-end overflow-hidden rounded-xl cursor-pointer transition-all duration-300 border select-none",
                                    isActive
                                        ? "ring-2 ring-primary border-primary shadow-lg scale-[1.01]"
                                        : "border-border/60 opacity-85 hover:opacity-100"
                                )}
                            >
                                {/* High-Resolution Resume Thumbnail */}
                                <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
                                    <Image
                                        src={option.image}
                                        alt={`${option.title} preview`}
                                        fill
                                        priority={index < 2}
                                        sizes="240px"
                                        className={cn(
                                            "object-cover object-top transition-transform duration-500 pointer-events-none",
                                            isActive ? "scale-100 opacity-95" : "scale-105 opacity-65 grayscale-[20%]"
                                        )}
                                    />
                                </div>

                                {/* Gradient Shadow Overlay */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                {/* Top Badges */}
                                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-background/90 dark:bg-[#181a20]/90 text-foreground backdrop-blur-md border border-border/60 shadow-xs">
                                        <span className={cn("h-1.5 w-1.5 rounded-full", option.accentDot)} />
                                        <span className="font-mono">{option.tag}</span>
                                    </span>

                                    {isSelectedInStore && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground shadow-xs">
                                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                                            <span>Active</span>
                                        </span>
                                    )}
                                </div>

                                {/* Bottom Metadata & Action */}
                                <div className="relative z-10 p-3 w-full flex items-end justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div
                                            className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-lg backdrop-blur-md border shrink-0",
                                                isActive
                                                    ? "bg-background/90 dark:bg-[#1a1d24]/90 border-border"
                                                    : "bg-black/50 border-white/15"
                                            )}
                                        >
                                            {option.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-display font-bold text-sm text-white truncate drop-shadow-sm">
                                                {option.title}
                                            </h3>
                                            <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                                                {option.archetype}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOptionClick(index);
                                        }}
                                        className={cn(
                                            "shrink-0 h-7 px-2.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                                                : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                                        )}
                                    >
                                        <span>{isActive ? 'Selected' : 'Use'}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile Pagination Dot Indicators */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                    {TYPST_ARCHETYPES.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleOptionClick(i)}
                            aria-label={`Select template ${i + 1}`}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                activeIndex === i
                                    ? "w-5 bg-primary"
                                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Desktop View: Interactive Expanding Accordion (sm+) */}
            <div
                role="tablist"
                aria-label="Typst Archetype Selector"
                className="hidden sm:flex w-full h-full min-h-[240px] max-h-[290px] items-stretch gap-1.5 sm:gap-2 overflow-hidden rounded-2xl p-1.5 sm:p-2 bg-muted/40 dark:bg-[#111317]/80 border border-border/80 shadow-inner"
            >
                {TYPST_ARCHETYPES.map((option, index) => {
                    const isActive = activeIndex === index;
                    const isSelectedInStore = storeTemplate === option.id;

                    return (
                        <div
                            key={option.id}
                            role="tab"
                            aria-selected={isActive}
                            tabIndex={0}
                            onClick={() => handleOptionClick(index)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleOptionClick(index);
                                }
                            }}
                            className={cn(
                                "relative flex flex-col justify-end overflow-hidden rounded-xl cursor-pointer will-change-[flex,transform] transition-[flex] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                isActive
                                    ? "flex-[6] sm:flex-[7] ring-1 ring-primary/60 border border-border/80 shadow-xl z-10"
                                    : "flex-[1.1] sm:flex-[1] hover:flex-[1.4] sm:hover:flex-[1.3] border border-border/40 opacity-80 hover:opacity-100 z-1"
                            )}
                            style={{
                                transform: 'translate3d(0, 0, 0)',
                                opacity: 1,
                                transitionProperty: 'flex, opacity, transform',
                                transitionDuration: '300ms',
                                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                        >
                            {/* High-Resolution Typst Resume Render Background */}
                            <div className="absolute inset-0 w-full h-full overflow-hidden bg-background">
                                <Image
                                    src={option.image}
                                    alt={`${option.title} preview`}
                                    fill
                                    priority={index < 2}
                                    sizes="(max-width: 768px) 100vw, 600px"
                                    className={cn(
                                        "object-cover object-top transition-transform duration-700 ease-out will-change-transform pointer-events-none",
                                        isActive ? "scale-100 opacity-95" : "scale-110 opacity-60 filter grayscale-[25%]"
                                    )}
                                />
                            </div>

                            {/* Dual-layer Gradient Shadow (Ultra-smooth GPU composite layer) */}
                            <div
                                className={cn(
                                    "absolute inset-0 pointer-events-none transition-opacity duration-500",
                                    isActive
                                        ? "bg-gradient-to-t from-black/90 via-black/45 to-transparent opacity-100"
                                        : "bg-gradient-to-t from-black/80 via-black/30 to-black/20 opacity-90"
                                )}
                            />

                            {/* Top Badge: Selection Status */}
                            <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
                                {isActive && (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-background/85 dark:bg-[#181a20]/90 text-foreground backdrop-blur-md border border-border/60 shadow-xs animate-in fade-in duration-300">
                                        <span className={cn("h-1.5 w-1.5 rounded-full", option.accentDot)} />
                                        <span className="hidden sm:inline font-mono">{option.tag}</span>
                                        <span className="sm:hidden font-mono">{option.title.split(' ')[0]}</span>
                                    </span>
                                )}

                                {isSelectedInStore && (
                                    <span className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground shadow-xs">
                                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                                        <span className="hidden sm:inline">Active System</span>
                                    </span>
                                )}
                            </div>

                            {/* Bottom Label & Metadata Content */}
                            <div className="relative z-10 p-2.5 sm:p-4 w-full flex items-end justify-between gap-2 pointer-events-none">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    {/* Icon Pill */}
                                    <div
                                        className={cn(
                                            "min-w-[34px] max-w-[34px] h-[34px] sm:min-w-[40px] sm:max-w-[40px] sm:h-[40px] flex items-center justify-center rounded-xl backdrop-blur-md border transition-all duration-300 shrink-0",
                                            isActive
                                                ? "bg-background/90 dark:bg-[#1a1d24]/90 border-border shadow-md"
                                                : "bg-black/50 border-white/15"
                                        )}
                                    >
                                        {option.icon}
                                    </div>

                                    {/* Text Info: Smoothly reveals when card expands */}
                                    <div
                                        className={cn(
                                            "min-w-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                            isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3 pointer-events-none hidden sm:block"
                                        )}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-tight truncate drop-shadow-sm">
                                                {option.title}
                                            </h3>
                                            <span className="text-[10px] font-mono text-emerald-400 font-semibold hidden md:inline">
                                                • {option.archetype}
                                            </span>
                                        </div>
                                        <p className="text-[11px] sm:text-xs text-white/85 line-clamp-1 leading-relaxed mt-0.5">
                                            {option.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Active Selection Action Button */}
                                {isActive && (
                                    <div className="shrink-0 hidden sm:flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOptionClick(index);
                                            }}
                                            className="pointer-events-auto h-8 px-3 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>Apply System</span>
                                            <ArrowRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InteractiveSelector;

export const DemoOne = () => {
    return (
        <div className="w-full min-h-screen flex items-center justify-center p-4">
            <InteractiveSelector showHeader />
        </div>
    );
};
