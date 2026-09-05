"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES, TemplateCategoryId, ResumeTemplate } from '@/lib/templates-data';
import { useAppStore } from '@/lib/store';
import { TemplateType } from '@/lib/resume-schema';
import {
    ArrowLeft,
    Search,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Eye,
    X,
    Filter,
    Layers,
    FileText,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function TemplatesPage() {
    const router = useRouter();
    const { setTemplate } = useAppStore();
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategoryId>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null);

    const filteredTemplates = useMemo(() => {
        return ALL_TEMPLATES.filter((tmpl) => {
            const matchesCategory = selectedCategory === 'all' || tmpl.category === selectedCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q ||
                tmpl.name.toLowerCase().includes(q) ||
                tmpl.description.toLowerCase().includes(q) ||
                tmpl.badge.toLowerCase().includes(q) ||
                tmpl.style.toLowerCase().includes(q) ||
                tmpl.categoryLabel.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    const handleSelectTemplate = (templateId: string) => {
        setTemplate(templateId as TemplateType);
        router.push('/builder');
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
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

                    <Button asChild size="sm" className="h-8 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 gap-1.5 rounded-xl shadow-xs">
                        <Link href="/builder">
                            <span>Open Resume Builder</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>

                {/* Header Title Section */}
                <div className="text-center space-y-3 pb-8 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-medium">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>48 Typst Architectural Systems</span>
                    </div>

                    <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight">
                        Explore All Templates
                    </h1>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Deterministic vector typography engineered for human recruiters and enterprise ATS systems. Select any template to immediately customize in the real-time Typst engine.
                    </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="mb-8 p-3 rounded-2xl bg-card/70 border border-border/80 shadow-xs backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                        {TEMPLATE_CATEGORIES.map((cat) => {
                            const active = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                                        active
                                            ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <span>{cat.label}</span>
                                    <span className={cn(
                                        "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                                        active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                                    )}>
                                        {cat.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Field */}
                    <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name, role, or style..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-1.5 text-xs bg-background border border-border/70 rounded-xl placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                aria-label="Clear search"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Templates Grid Catalog */}
                {filteredTemplates.length === 0 ? (
                    <div className="py-24 text-center space-y-3 bg-muted/10 rounded-2xl border border-dashed border-border/60">
                        <p className="text-sm font-semibold text-foreground">No templates match your search</p>
                        <p className="text-xs text-muted-foreground">Try clearing filters or search terms</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                            className="mt-2 text-xs rounded-xl"
                        >
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredTemplates.map((tmpl) => (
                            <div
                                key={tmpl.id}
                                className="group relative flex flex-col rounded-2xl border border-border/70 bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1"
                            >
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

                                    {/* Top Corner Badges */}
                                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                                        <span className="px-2 py-0.5 rounded-md bg-background/90 backdrop-blur-md border border-border/60 text-[10px] font-semibold text-foreground shadow-xs">
                                            {tmpl.badge}
                                        </span>

                                        {tmpl.isAtsCompliant && (
                                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/90 backdrop-blur-md text-[10px] font-semibold text-white shadow-xs">
                                                <CheckCircle2 className="h-2.5 w-2.5" />
                                                <span>ATS Safe</span>
                                            </span>
                                        )}
                                    </div>

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
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                                {tmpl.name}
                                            </h3>
                                            <span className="text-[10px] font-mono text-muted-foreground">
                                                {tmpl.categoryLabel}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-muted-foreground/80 font-mono">
                                            {tmpl.style}
                                        </p>

                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-1">
                                            {tmpl.description}
                                        </p>
                                    </div>

                                    <div className="pt-2 flex items-center justify-between border-t border-border/50 text-xs">
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
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 hover:bg-background text-foreground border border-border/60 transition-colors cursor-pointer"
                                aria-label="Close preview"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {/* Large A4 Preview Image */}
                            <div className="relative flex-1 bg-muted/30 p-6 flex items-center justify-center overflow-auto max-h-[55vh] md:max-h-none">
                                <div className="relative aspect-[1/1.414] w-full max-w-[420px] shadow-2xl rounded-lg overflow-hidden border border-border/60">
                                    <Image
                                        src={previewTemplate.previewImage}
                                        alt={previewTemplate.name}
                                        fill
                                        sizes="420px"
                                        className="object-cover object-top"
                                    />
                                </div>
                            </div>

                            {/* Template Details & Actions Sidebar */}
                            <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/70 bg-background/50 space-y-6">
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

            <AppFooter />
        </div>
    );
}
