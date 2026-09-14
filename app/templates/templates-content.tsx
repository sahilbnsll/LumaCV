"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { EditorialFooter } from '@/components/landing/editorial-footer';
import { Button } from '@/components/ui/button';
import { ALL_TEMPLATES, ResumeTemplate } from '@/lib/templates-data';
import { useAppStore } from '@/lib/store';
import { TemplateType } from '@/lib/resume-schema';
import {
    ArrowLeft,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Eye,
    X,
    Check,
    Columns2,
    Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notify } from '@/lib/notify';
import { TemplateFilters, filterResumeTemplates, INITIAL_TEMPLATE_FILTERS, TemplateFilterState } from '@/components/template-filters';

export default function TemplatesPageContent() {
    const router = useRouter();
    const setTemplate = useAppStore((s) => s.setTemplate);
    const [filters, setFilters] = useState<TemplateFilterState>(INITIAL_TEMPLATE_FILTERS);
    const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);

    const filteredTemplates = useMemo(() => {
        return filterResumeTemplates(ALL_TEMPLATES, filters);
    }, [filters]);

    const handleSelectTemplate = (templateId: string) => {
        setTemplate(templateId as TemplateType);
        const tmpl = ALL_TEMPLATES.find(t => t.id === templateId);
        notify.templateChanged(tmpl?.name || templateId);
        router.push(`/editor?template=${templateId}`);
    };

    return (
        <div className="min-h-screen bg-transparent text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            <main id="main-content" className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
                {/* Top Navigation Bar */}
                <div className="mb-6 flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 -ml-2 cursor-pointer">
                        <Link href="/">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back to Home</span>
                        </Link>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button asChild size="sm" className="h-8 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 gap-1.5 rounded-xl shadow-xs">
                            <Link href="/editor">
                                <span>Open Resume Editor</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs font-medium border-border/80 hover:bg-muted/40 gap-1.5 rounded-xl hidden sm:inline-flex">
                            <Link href="/builder">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                <span>AI Optimizer</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Header Title Section */}
                <div className="text-center space-y-3 pb-8 max-w-2xl mx-auto">
                    <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight">
                        Explore All Templates
                    </h1>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Deterministic vector typography engineered for human recruiters and enterprise ATS systems. Filter by layout, aesthetic style, information density, or target role.
                    </p>
                </div>

                {/* Multi-Attribute Filter Bar */}
                <div className="mb-8">
                    <TemplateFilters
                        filters={filters}
                        onChange={setFilters}
                        totalCount={ALL_TEMPLATES.length}
                        matchCount={filteredTemplates.length}
                    />
                </div>

                {/* Templates Grid Catalog */}
                {filteredTemplates.length === 0 ? (
                    <div className="py-24 text-center space-y-3 bg-muted/10 rounded-2xl border border-dashed border-border/60">
                        <p className="text-sm font-semibold text-foreground">No templates match the selected combination</p>
                        <p className="text-xs text-muted-foreground">Try loosening filters or clearing your search term</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFilters(INITIAL_TEMPLATE_FILTERS)}
                            className="mt-2 text-xs rounded-xl"
                        >
                            Reset All Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredTemplates.map((tmpl) => (
                            <div
                                key={tmpl.id}
                                className="group relative flex flex-col rounded-2xl border border-border/70 bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1"
                            >
                                {/* Badge Strip: sits above the preview image (not overlaid on it), so
                                    it can never cover the resume's own header/name underneath. It used
                                    to be absolutely positioned on top of the thumbnail, which routinely
                                    blocked the candidate name every real resume preview renders right
                                    at the top of the page. */}
                                <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 bg-muted/50 border-b border-border/60">
                                    <span className="text-[10px] font-semibold text-foreground truncate">
                                        {tmpl.badge}
                                    </span>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {tmpl.layout === 'two_column' && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/90 text-white text-[9px] font-semibold flex items-center gap-0.5 shadow-xs">
                                                <Columns2 className="h-2.5 w-2.5" />
                                                Split
                                            </span>
                                        )}
                                        {tmpl.density === 'compact' && (
                                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/90 text-white text-[9px] font-semibold flex items-center gap-0.5 shadow-xs">
                                                <Square className="h-2.5 w-2.5" />
                                                1-Page
                                            </span>
                                        )}
                                        {tmpl.isAtsCompliant && (
                                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-[10px] font-semibold text-white shadow-xs">
                                                <CheckCircle2 className="h-2.5 w-2.5" />
                                                <span>ATS</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Preview Thumbnail (A4 proportions) */}
                                <div className="relative aspect-[1/1.414] w-full overflow-hidden bg-muted/40 border-b border-border/60">
                                    <Image
                                        src={tmpl.previewImage}
                                        alt={`${tmpl.name} template preview`}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                                        loading="lazy"
                                    />

                                    {/* Hover Actions Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2.5 p-4 backdrop-blur-[2px]">
                                        <button
                                            type="button"
                                            onClick={() => handleSelectTemplate(tmpl.id)}
                                            className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                                        >
                                            <span>Use Template</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPreviewTemplate(tmpl)}
                                            className="w-full py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium backdrop-blur-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>Preview Full Size</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Card Body & Justification */}
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-1">
                                            <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                                                {tmpl.name}
                                            </h3>
                                        </div>

                                        {/* 1-Line Layout Justification */}
                                        <p className="text-[11px] font-medium text-primary/90 dark:text-primary/80 line-clamp-1">
                                            {tmpl.subtitle || tmpl.badge}
                                        </p>

                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {tmpl.description}
                                        </p>

                                        {/* Tags */}
                                        {tmpl.tags && tmpl.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {tmpl.tags.slice(0, 3).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2.5 flex items-center justify-between border-t border-border/50 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewTemplate(tmpl)}
                                            className="text-[11px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 cursor-pointer"
                                        >
                                            <Eye className="h-3 w-3" />
                                            <span>Preview</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleSelectTemplate(tmpl.id)}
                                            className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>Select</span>
                                            <ArrowRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Full Preview Lightbox Modal */}
            <AnimatePresence>
                {previewTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-sm">
                        {/* Close Button: fixed to the viewport, not the scrolling card, so it
                            never scrolls out of reach on mobile and always sits in the same
                            predictable spot regardless of how tall the resume preview is. */}
                        <button
                            onClick={() => setPreviewTemplate(null)}
                            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] min-h-touch min-w-touch flex items-center justify-center rounded-full bg-background/95 hover:bg-background text-foreground border border-border/60 shadow-md transition-colors cursor-pointer"
                            aria-label="Close preview"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-4xl max-h-[88vh] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-y-auto"
                        >
                            {/* Large A4 Preview Image: height-driven (not width-driven) on
                                mobile so the aspect-ratio box always fits within the space
                                available without needing its own scroll. The old width-capped
                                box plus a fixed 50vh wrapper could ask for more height than
                                the wrapper had, and object-cover then cropped the overflow
                                instead of shrinking to fit. That's what was cutting the
                                resume off. object-contain is now also just a safety net: the
                                box's own aspect-ratio already matches the image exactly, so
                                nothing should ever need to crop. */}
                            <div className="relative flex-1 bg-muted/30 p-4 sm:p-6 flex items-center justify-center">
                                <div className="relative aspect-[1/1.414] h-[42vh] sm:h-[55vh] md:h-auto md:w-full md:max-w-[420px] shadow-2xl rounded-lg overflow-hidden border border-border/60">
                                    <Image
                                        src={previewTemplate.previewImage}
                                        alt={previewTemplate.name}
                                        fill
                                        sizes="420px"
                                        className="object-contain object-top"
                                    />
                                </div>
                            </div>

                            {/* Template Details & Actions Sidebar */}
                            <div className="w-full md:w-80 p-5 sm:p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/70 bg-background/50 space-y-6 shrink-0">
                                <div className="space-y-4">
                                    <div>
                                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                                            {previewTemplate.badge}
                                        </span>
                                        <h2 className="font-display font-bold text-2xl text-foreground mt-2">
                                            {previewTemplate.name}
                                        </h2>
                                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                            {previewTemplate.style}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                            Design & Purpose
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {previewTemplate.description}
                                        </p>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-border/60">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Category</span>
                                            <span className="font-medium text-foreground">{previewTemplate.categoryLabel}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">ATS Compliance</span>
                                            <span className="font-medium text-emerald-500 flex items-center gap-1">
                                                <Check className="h-3 w-3" />
                                                Verified Machine Scannable
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Typst Engine</span>
                                            <span className="font-mono text-foreground text-[11px]">{previewTemplate.sourceFile}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectTemplate(previewTemplate.id)}
                                        className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                                    >
                                        <span>Use This Template</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPreviewTemplate(null)}
                                        className="w-full py-2 px-4 rounded-xl border border-border/70 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        Back to Gallery
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <EditorialFooter />
        </div>
    );
}
