"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ALL_TEMPLATES, ResumeTemplate } from '@/lib/templates-data';
import { useAppStore } from '@/lib/store';
import { TemplateType } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type TemplateMarqueeItem = {
    id: string;
    template: ResumeTemplate;
};

function TemplateItem({ template }: { template: ResumeTemplate }) {
    const router = useRouter();
    const { setTemplate } = useAppStore();

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        setTemplate(template.id as TemplateType);
        router.push('/builder');
    };

    return (
        <motion.div
            onClick={handleSelect}
            className="group relative shrink-0 cursor-pointer will-change-transform"
            initial={{ scale: 1, zIndex: 10 }}
            whileHover={{ scale: 1.05, zIndex: 30 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
        >
            <div className="relative aspect-[1/1.414] w-48 sm:w-56 md:w-64 lg:w-72 overflow-hidden rounded-lg border border-border/80 dark:border-white/10 bg-card shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:border-primary/50">
                {/* Real High-Resolution A4 Rendered Template Preview */}
                <Image
                    src={template.previewImage}
                    alt={`${template.name} resume template`}
                    fill
                    sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 288px"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    priority={false}
                />

                {/* Subtle dark gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4 text-white" />

                {/* Template Name & Action on Hover */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0 text-white z-10 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                        <p className="font-display font-bold text-sm text-white drop-shadow-md truncate">
                            {template.name}
                        </p>
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                            {template.badge}
                        </span>
                    </div>

                    <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed text-justify">
                        {template.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[11px] font-medium text-emerald-400">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>ATS Safe</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-primary-foreground font-semibold">
                            <span>Use Template</span>
                            <ArrowRight className="h-3 w-3" />
                        </span>
                    </div>
                </div>

                {/* Shimmer light reflection effect on hover */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full rotate-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </div>
        </motion.div>
    );
}

type MarqueeRowProps = {
    items: TemplateMarqueeItem[];
    direction: "left" | "right";
    duration?: number;
};

function MarqueeRow({ items, direction, duration = 45 }: MarqueeRowProps) {
    const animateX = direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"];

    return (
        <div className="overflow-hidden w-full flex">
            <motion.div
                className="flex gap-x-4 sm:gap-x-6 will-change-transform shrink-0"
                animate={{ x: animateX }}
                transition={{
                    x: {
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                        duration,
                        ease: "linear",
                    },
                }}
            >
                {items.map(({ id, template }) => (
                    <TemplateItem key={id} template={template} />
                ))}
            </motion.div>
        </div>
    );
}

export function RxTemplatesShowcase() {
    // Split all 48 templates into 2 continuous horizontal marquee streams
    const { row1, row2 } = useMemo(() => {
        const halfway = Math.ceil(ALL_TEMPLATES.length / 2);
        const firstHalf = ALL_TEMPLATES.slice(0, halfway);
        const secondHalf = ALL_TEMPLATES.slice(halfway);

        // Duplicate each set once to guarantee seamless -50% continuous looping
        const r1: TemplateMarqueeItem[] = [
            ...firstHalf.map((tmpl) => ({ id: `r1-${tmpl.id}-1`, template: tmpl })),
            ...firstHalf.map((tmpl) => ({ id: `r1-${tmpl.id}-2`, template: tmpl })),
        ];

        const r2: TemplateMarqueeItem[] = [
            ...secondHalf.map((tmpl) => ({ id: `r2-${tmpl.id}-1`, template: tmpl })),
            ...secondHalf.map((tmpl) => ({ id: `r2-${tmpl.id}-2`, template: tmpl })),
        ];

        return { row1: r1, row2: r2 };
    }, []);

    return (
        <section id="templates" className="relative overflow-hidden border-b border-border/40 py-16 md:py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 md:mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight">
                            Templates
                        </h2>

                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Every template has a different look, so pick the one that fits how you want to come across. LumaCV
                            has 48 of them right now, with more on the way.
                        </p>
                    </div>

                    <Button asChild size="lg" className="h-10 px-5 text-xs font-semibold rounded-xl gap-2 shadow-xs shrink-0 self-start md:self-auto">
                        <Link href="/templates">
                            <span>Browse All 48 Templates</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Reactive Resume Style Tilted Continuous Dual-Row Marquee */}
            <div className="relative mt-4 -rotate-2 sm:-rotate-3 lg:-rotate-4 py-8 overflow-hidden select-none">
                <div className="flex flex-col gap-y-5 sm:gap-y-7 min-h-[300px] sm:min-h-[360px] md:min-h-[420px]">
                    {/* Row 1: Leftward gentle flow */}
                    <MarqueeRow items={row1} direction="left" duration={95} />

                    {/* Row 2: Rightward gentle flow */}
                    <MarqueeRow items={row2} direction="right" duration={105} />
                </div>

                {/* Subtle edge gradient fade masks */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-background via-background/60 to-transparent z-20" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-background via-background/60 to-transparent z-20" />
            </div>
        </section>
    );
}

export default RxTemplatesShowcase;
