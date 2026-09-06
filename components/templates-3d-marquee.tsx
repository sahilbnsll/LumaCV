"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Marquee } from '@/components/ui/marquee';
import { ALL_TEMPLATES, ResumeTemplate } from '@/lib/templates-data';
import { useAppStore } from '@/lib/store';
import { TemplateType } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Layers,
    LayoutTemplate,
    ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const TemplateCard = React.memo(function TemplateCard({ template }: { template: ResumeTemplate }) {
    const router = useRouter();
    const setTemplate = useAppStore((s) => s.setTemplate);
    const [imgError, setImgError] = useState(false);

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        setTemplate(template.id as TemplateType);
        router.push('/builder');
    };

    return (
        <div
            onClick={handleSelect}
            className="group relative w-[240px] sm:w-[270px] rounded-2xl border border-border/80 dark:border-white/10 bg-card/95 dark:bg-[#111317]/95 p-3.5 shadow-md hover:shadow-2xl transition-all duration-300 backdrop-blur-md cursor-pointer hover:border-primary/50 hover:scale-[1.02] flex flex-col gap-3"
        >
            {/* Header: Title & Badges */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-display font-semibold text-xs text-foreground tracking-tight truncate">
                        {template.name}
                    </span>
                    {template.isNew && (
                        <span className="shrink-0 px-1.5 py-0.2 rounded-full bg-primary/15 text-primary text-[9px] font-mono font-semibold border border-primary/30">
                            NEW
                        </span>
                    )}
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded-md bg-muted/60 dark:bg-white/[0.06] text-muted-foreground text-[10px] font-medium border border-border/40">
                    {template.badge}
                </span>
            </div>

            {/* Template Preview Image */}
            <div className="relative aspect-[1/1.3] w-full rounded-xl overflow-hidden border border-border/50 dark:border-white/5 bg-muted/30 dark:bg-black/40">
                <Image
                    src={imgError ? '/templates/modern.png' : template.previewImage}
                    alt={`${template.name} resume template`}
                    fill
                    sizes="(max-width: 640px) 240px, 270px"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImgError(true)}
                    priority={false}
                />

                {/* Subtle Hover Action Overlay */}
                <div className="absolute inset-0 bg-background/80 dark:bg-black/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-4 text-center gap-2">
                    <p className="text-[11px] text-foreground font-medium leading-snug line-clamp-3">
                        {template.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                        <span>Use This Template</span>
                        <ArrowRight className="h-3 w-3" />
                    </span>
                </div>
            </div>

            {/* Footer Metadata */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                <span className="truncate max-w-[150px]">{template.categoryLabel}</span>
                <span className="text-[10px] font-mono text-emerald-500 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                    ATS 100%
                </span>
            </div>
        </div>
    );
});

export function Templates3DMarquee() {
    // Distribute 48 templates into 4 balanced columns
    const { col1, col2, col3, col4 } = useMemo(() => {
        const c1: ResumeTemplate[] = [];
        const c2: ResumeTemplate[] = [];
        const c3: ResumeTemplate[] = [];
        const c4: ResumeTemplate[] = [];

        ALL_TEMPLATES.forEach((tmpl, i) => {
            const mod = i % 4;
            if (mod === 0) c1.push(tmpl);
            else if (mod === 1) c2.push(tmpl);
            else if (mod === 2) c3.push(tmpl);
            else c4.push(tmpl);
        });

        return { col1: c1, col2: c2, col3: c3, col4: c4 };
    }, []);

    return (
        <div className="relative w-full overflow-hidden">
            {/* 3D Perspective Stage */}
            <div className="relative flex h-[580px] sm:h-[680px] lg:h-[740px] w-full flex-row items-center justify-center overflow-hidden [perspective:850px]">
                <div
                    className="flex flex-row items-center gap-4 sm:gap-6 -translate-y-6 sm:-translate-y-4"
                    style={{
                        transform:
                            'translateX(-20px) translateY(-10px) translateZ(-80px) rotateX(20deg) rotateY(-10deg) rotateZ(16deg)',
                    }}
                >
                    {/* Column 1: Downwards */}
                    <Marquee vertical pauseOnHover repeat={3} className="[--duration:52s] [--gap:1.25rem]">
                        {col1.map((template) => (
                            <TemplateCard key={`c1-${template.id}`} template={template} />
                        ))}
                    </Marquee>

                    {/* Column 2: Upwards (reverse) */}
                    <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:44s] [--gap:1.25rem]">
                        {col2.map((template) => (
                            <TemplateCard key={`c2-${template.id}`} template={template} />
                        ))}
                    </Marquee>

                    {/* Column 3: Downwards */}
                    <Marquee vertical pauseOnHover repeat={3} className="[--duration:58s] [--gap:1.25rem]">
                        {col3.map((template) => (
                            <TemplateCard key={`c3-${template.id}`} template={template} />
                        ))}
                    </Marquee>

                    {/* Column 4: Upwards (reverse) */}
                    <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:46s] [--gap:1.25rem]">
                        {col4.map((template) => (
                            <TemplateCard key={`c4-${template.id}`} template={template} />
                        ))}
                    </Marquee>
                </div>

                {/* Soft Edge Gradient Masks */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-background via-background/80 to-transparent z-10" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-48 bg-gradient-to-r from-background via-background/70 to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-48 bg-gradient-to-l from-background via-background/70 to-transparent z-10" />
            </div>

            {/* Bottom Callout Bar: Direct link to interactive Morphing Card Deck */}
            <div className="relative z-20 -mt-12 text-center px-4 sm:px-6">
                <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-3 sm:px-6 rounded-2xl border border-border/80 dark:border-white/10 bg-card/90 dark:bg-[#111317]/90 backdrop-blur-xl shadow-xl">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Layers className="h-4 w-4 text-primary" />
                        <span>Hover over any card to pause and inspect.</span>
                    </div>

                    <span className="hidden sm:inline text-border">•</span>

                    <Button asChild size="sm" className="h-8 px-4 text-xs font-semibold gap-1.5 rounded-xl shadow-xs">
                        <Link href="/templates">
                            <span>Open Interactive Morphing Deck</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
