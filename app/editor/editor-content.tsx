"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/components/auth-provider';
import { TemplateType, ResumeData } from '@/lib/resume-schema';
import { ALL_TEMPLATES, ResumeTemplate } from '@/lib/templates-data';
import { PALETTES } from '@/lib/design-tokens';
import { PdfPreview } from '@/components/pdf-preview';
import { CompactResumeEditor } from '@/components/compact-resume-editor';
import { TemplateSelector } from '@/components/template-selector';
import { ResumeEditorEntry } from '@/components/resume-editor-entry';
import { ResumeUploadModal } from '@/components/resume-upload-modal';
import { LumaLogo } from '@/components/luma-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { Button } from '@/components/ui/button';
import { FullScreenNav, KineticMenuButton } from '@/components/full-screen-nav';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Download,
    Layout,
    Check,
    CheckCircle2,
    Eye,
    Edit3,
    FileText,
    Loader2,
    Save,
    FileUp,
    RotateCcw,
    Activity,
    ChevronDown
} from 'lucide-react';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import { getLocalResumes, saveLocalResume, SavedResume } from '@/lib/user-resumes-store';
import { resumeDataToPlainText } from '@/lib/resume-plaintext';
import { exportResume, ExportFormatType } from '@/lib/resume-export';
import { motion, AnimatePresence } from 'framer-motion';
import { MOTION_VARIANTS, TRANSITION_EASINGS } from '@/lib/motion';

function EditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const resumeData = useAppStore((s) => s.resumeData);
    const setResumeData = useAppStore((s) => s.setResumeData);
    const template = useAppStore((s) => s.template);
    const setTemplate = useAppStore((s) => s.setTemplate);
    const theme = useAppStore((s) => s.theme);
    const setTheme = useAppStore((s) => s.setTheme);

    const [isInitialized, setIsInitialized] = useState(false);
    const [viewMode, setViewMode] = useState<'entry' | 'editor'>('editor');
    const [templateSheetOpen, setTemplateSheetOpen] = useState(false);
    const [palettePopoverOpen, setPalettePopoverOpen] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Track current active resume ID from URL or generate default
    const queryId = searchParams.get('id');
    const [currentResumeId, setCurrentResumeId] = useState<string>(() => queryId || (user?.id ? `editor-${user.id}-default` : 'local-editor-default'));

    // 1. URL Query Param Synchronization & Initial Load
    useEffect(() => {
        const templateParam = searchParams.get('template');
        if (templateParam && ALL_TEMPLATES.some((t) => t.id === templateParam)) {
            setTemplate(templateParam as TemplateType);
        }

        const idParam = searchParams.get('id');
        if (idParam) {
            setCurrentResumeId(idParam);
            const savedList = getLocalResumes(user?.id);
            const found = savedList.find((r) => r.id === idParam);
            if (found && found.resumeData) {
                setResumeData(found.resumeData);
                if (found.templateId) setTemplate(found.templateId as TemplateType);
                if (found.themeId) setTheme(found.themeId);
                notify.success('Resume loaded', found.title);
                setViewMode('editor');
                setIsInitialized(true);
                return;
            }
        }

        // If explicitly requested new import via query param or store is unpopulated
        const importParam = searchParams.get('import');
        if (importParam === 'true' || !resumeData) {
            setViewMode('entry');
        } else {
            setViewMode('editor');
        }

        setIsInitialized(true);
    }, [searchParams, setResumeData, setTemplate, setTheme, user?.id]);

    // Active Template Object
    const activeTemplate = useMemo(() => {
        return ALL_TEMPLATES.find((t) => t.id === template) || ALL_TEMPLATES[0];
    }, [template]);

    // Candidate title
    const candidateName = useMemo(() => {
        return resumeData?.personalInfo?.name || 'Untitled Resume';
    }, [resumeData?.personalInfo?.name]);

    // 2. Autosave with visible feedback & identity preservation
    useEffect(() => {
        if (!resumeData || !isInitialized || viewMode !== 'editor') return;

        setSaveStatus('saving');
        const timer = setTimeout(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastSavedAt(timeString);
            setSaveStatus('saved');

            // Save to local storage & sync with API
            if (user?.id) {
                const existing = getLocalResumes(user.id).find(r => r.id === currentResumeId);
                const item: SavedResume = {
                    id: currentResumeId,
                    userId: user.id,
                    title: existing?.title || `${resumeData.personalInfo?.name || 'Resume'} — ${activeTemplate.name}`,
                    targetJobTitle: existing?.targetJobTitle,
                    targetJobCompany: existing?.targetJobCompany,
                    templateId: template,
                    themeId: theme,
                    resumeData: resumeData,
                    atsScore: existing?.atsScore,
                    createdAt: existing?.createdAt || now.toISOString(),
                    updatedAt: now.toISOString(),
                };
                saveLocalResume(item, user.id);
                fetch('/api/v1/resumes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item),
                }).catch(() => {});
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [resumeData, template, theme, isInitialized, user?.id, activeTemplate.name, viewMode, currentResumeId]);

    // Multi-format export handler
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadingFormat, setDownloadingFormat] = useState<ExportFormatType | null>(null);

    const handleDownloadFormat = async (fmt: ExportFormatType) => {
        if (!resumeData) return;
        setIsDownloading(true);
        setDownloadingFormat(fmt);
        try {
            await exportResume({
                resumeData,
                format: fmt,
                template,
                theme: { color: theme },
                customFilename: `${(resumeData.personalInfo?.name || 'Resume').toLowerCase().replace(/\s+/g, '-')}`,
            });
        } finally {
            setIsDownloading(false);
            setDownloadingFormat(null);
        }
    };

    const handleDownloadPdf = () => handleDownloadFormat('pdf');
    const handleDownloadJson = () => handleDownloadFormat('json');
    const handleDownloadMarkdown = () => handleDownloadFormat('md');

    const [exportMenuOpen, setExportMenuOpen] = useState(false);

    const handleImportComplete = (data: ResumeData) => {
        setResumeData(data);
        setViewMode('editor');
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs font-mono">Loading Resume Studio...</p>
                </div>
            </div>
        );
    }

    // ── STAGE 1 & 2: ENTRY FLOW (UPLOAD & AI PARSE) ──
    if (viewMode === 'entry') {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
                <header className="sticky top-0 z-40 glass-nav border-b border-border/60">
                    <div className="w-full flex h-14 items-center justify-between px-4 sm:px-6">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 hover:opacity-90 rounded-lg"
                            title="LumaCV Home"
                        >
                            <LumaLogo size={22} />
                            <span className="font-display font-semibold tracking-tight text-sm text-foreground">
                                LumaCV
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40 ml-1">
                                Resume Editor
                            </span>
                        </Link>

                        <div className="flex items-center gap-2">
                            {resumeData && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('editor')}
                                    className="text-xs text-muted-foreground hover:text-foreground h-8 cursor-pointer"
                                >
                                    Back to current draft
                                </Button>
                            )}
                            <ThemeToggle />
                            {user ? <UserMenu /> : null}
                            <KineticMenuButton open={mobileMenuOpen} onClick={() => setMobileMenuOpen((v) => !v)} />
                        </div>
                    </div>
                </header>

                <main className="flex-1">
                    <ResumeEditorEntry onComplete={handleImportComplete} />
                </main>

                <FullScreenNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            </div>
        );
    }

    // ── STAGE 3, 4, 5: MANUAL EDITOR WORKSPACE ──
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
            {/* ── TOP ACTION BAR (Clean Precision Navigation — Apple HIG) ── */}
            <header className="sticky top-0 z-40 glass-nav border-b border-border/60 transition-colors">
                <div className="w-full flex h-14 items-center justify-between px-3 sm:px-6">
                    {/* Left: Brand + Document Title */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="group flex items-center gap-2 hover:opacity-90 focus-visible:ring-1 focus-visible:ring-primary rounded-lg"
                            title="LumaCV Home"
                        >
                            <LumaLogo size={22} />
                            <span className="font-display font-semibold tracking-tight text-sm text-foreground hidden sm:inline">
                                LumaCV
                            </span>
                        </Link>

                        <div className="h-4 w-px bg-border/60 hidden sm:block" />

                        {/* Title Display */}
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-xs sm:text-sm text-foreground truncate max-w-[130px] sm:max-w-[220px]">
                                {candidateName}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40 hidden lg:inline">
                                Resume Editor
                            </span>
                        </div>
                    </div>

                    {/* Center / Action Controls */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                        {/* 1. Import / Upload Resume Trigger */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUploadModalOpen(true)}
                            className="h-8 px-2.5 sm:px-3 text-xs font-medium rounded-xl border-border/80 bg-background/80 hover:bg-muted/60 gap-1.5 cursor-pointer"
                            title="Import another resume (PDF or Word)"
                        >
                            <FileUp className="h-3.5 w-3.5 text-primary" />
                            <span className="hidden sm:inline">Import Resume</span>
                        </Button>

                        {/* 2. Template Selector Trigger */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTemplateSheetOpen(true)}
                            className="h-8 px-2.5 sm:px-3 text-xs font-medium rounded-xl border-border/80 bg-background/80 hover:bg-muted/60 gap-1.5 cursor-pointer"
                            title="Browse and select from 52 templates"
                        >
                            <Layout className="h-3.5 w-3.5 text-primary" />
                            <span className="hidden sm:inline font-semibold">{activeTemplate.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground hidden lg:inline">
                                ({ALL_TEMPLATES.length} templates)
                            </span>
                        </Button>

                        {/* 3. Check ATS Link */}
                        <Button asChild variant="outline" size="sm" className="h-8 px-2.5 sm:px-3 text-xs font-medium rounded-xl border-border/80 bg-background/80 hover:bg-muted/60 gap-1.5 cursor-pointer hidden lg:inline-flex">
                            <Link href={currentResumeId ? `/ats?id=${currentResumeId}` : '/ats'}>
                                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Check ATS</span>
                            </Link>
                        </Button>

                        {/* 4. Accent Color Palette Selector */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPalettePopoverOpen(!palettePopoverOpen)}
                                className="h-8 w-8 sm:w-auto sm:px-2.5 p-0 text-xs font-medium rounded-xl border-border/80 bg-background/80 hover:bg-muted/60 gap-1.5 cursor-pointer"
                                title="Change accent color palette"
                            >
                                <div
                                    className="h-3.5 w-3.5 rounded-full border border-black/20 shrink-0"
                                    style={{ backgroundColor: (PALETTES as Record<string, { hex: string; label: string }>)[theme]?.hex || '#64748B' }}
                                />
                                <span className="hidden sm:inline text-xs capitalize">
                                    {theme === 'none' ? 'Slate' : theme}
                                </span>
                            </Button>

                            <AnimatePresence>
                                {palettePopoverOpen && (
                                    <motion.div
                                        variants={MOTION_VARIANTS.fadeScale}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        className="absolute right-0 top-10 z-50 p-2.5 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xl w-52 space-y-1.5"
                                    >
                                        <div className="text-[11px] font-semibold text-muted-foreground px-1 pb-1 border-b border-border/40">
                                            Accent Color Palette
                                        </div>
                                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                                            {Object.entries(PALETTES).map(([key, pal]) => {
                                                const isSelected = theme === key;
                                                return (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        onClick={() => {
                                                            setTheme(key);
                                                            setPalettePopoverOpen(false);
                                                            notify.paletteApplied(pal.label);
                                                        }}
                                                        className={cn(
                                                            "h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer relative",
                                                            isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                                        )}
                                                        style={{ backgroundColor: pal.hex }}
                                                        title={pal.label}
                                                    >
                                                        {isSelected && <Check className="h-3 w-3 text-white stroke-[3]" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 5. Autosave Status Badge */}
                        <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground px-2 min-w-[120px]">
                            <AnimatePresence mode="wait">
                                {saveStatus === 'saving' ? (
                                    <motion.span
                                        key="saving"
                                        initial={{ opacity: 0, y: 3 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -3 }}
                                        transition={{ duration: 0.15, ease: TRANSITION_EASINGS.apple }}
                                        className="flex items-center gap-1 text-[11px] text-amber-500 font-medium"
                                    >
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Saving...
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="saved"
                                        initial={{ opacity: 0, y: 3 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -3 }}
                                        transition={{ duration: 0.15, ease: TRANSITION_EASINGS.apple }}
                                        className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium"
                                    >
                                        <CheckCircle2 className="h-3 w-3" />
                                        Saved {lastSavedAt && `at ${lastSavedAt}`}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 6. Export Options (Split Button with Radix DropdownMenu) */}
                        <div className="inline-flex items-center rounded-xl shadow-2xs">
                            <Button
                                size="sm"
                                onClick={handleDownloadPdf}
                                disabled={isDownloading}
                                className="h-8 px-3 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-l-xl rounded-r-none cursor-pointer select-none border-r border-primary-foreground/20"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>Compiling...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-3.5 w-3.5" />
                                        <span>PDF</span>
                                    </>
                                )}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="h-8 px-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-l-none rounded-r-xl cursor-pointer"
                                        title="Export formats (Word, Markdown, JSON, Typst)"
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl text-foreground">
                                    <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Export Formats
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleDownloadFormat('pdf')} className="cursor-pointer">
                                        <span className="h-2 w-2 rounded-full bg-red-500 mr-2 shrink-0" />
                                        <span className="flex-1 text-xs">Vector PDF (Typst)</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">.pdf</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownloadFormat('docx')} className="cursor-pointer">
                                        <span className="h-2 w-2 rounded-full bg-amber-500 mr-2 shrink-0" />
                                        <span className="flex-1 text-xs">Word Document</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">.docx</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownloadFormat('md')} className="cursor-pointer">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 shrink-0" />
                                        <span className="flex-1 text-xs">Plaintext Markdown</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">.md</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownloadFormat('json')} className="cursor-pointer">
                                        <span className="h-2 w-2 rounded-full bg-blue-500 mr-2 shrink-0" />
                                        <span className="flex-1 text-xs">JSON Resume Data</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">.json</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownloadFormat('typ')} className="cursor-pointer">
                                        <span className="h-2 w-2 rounded-full bg-purple-500 mr-2 shrink-0" />
                                        <span className="flex-1 text-xs">Typst Source</span>
                                        <span className="text-[10px] font-mono text-muted-foreground">.typ</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <ThemeToggle />
                        {user ? <UserMenu /> : null}
                        <KineticMenuButton open={mobileMenuOpen} onClick={() => setMobileMenuOpen((v) => !v)} />
                    </div>
                </div>

                {/* Mobile View Toggle (Preview vs Editor) */}
                <div className="flex lg:hidden items-center justify-center p-1.5 border-t border-border/40 bg-muted/20">
                    <div className="inline-flex rounded-xl p-0.5 bg-muted/60 border border-border/60 text-xs">
                        <button
                            type="button"
                            onClick={() => setMobileTab('editor')}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer min-h-[36px]",
                                mobileTab === 'editor'
                                    ? "bg-background text-foreground font-semibold shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Edit3 className="h-3.5 w-3.5 text-primary" />
                            <span>Edit Form</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileTab('preview')}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer min-h-[36px]",
                                mobileTab === 'preview'
                                    ? "bg-background text-foreground font-semibold shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            <span>Live Preview</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── MAIN WORKSPACE (LumaCV 3-Pane Layout: [Sections | Editor Workspace | Live Preview]) ── */}
            <main className="flex-1 w-full max-w-[1780px] mx-auto p-2 sm:p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* LEFT & CENTER COLUMNS: Sections Navigator & Active Section Workspace */}
                    <section
                        aria-label="Resume Content Editor"
                        className={cn(
                            "lg:col-span-7 xl:col-span-7 transition-all",
                            mobileTab === 'editor' ? 'block' : 'hidden lg:block'
                        )}
                    >
                        <CompactResumeEditor />
                    </section>

                    {/* RIGHT COLUMN: Sticky Live Resume Preview */}
                    <section
                        aria-label="Live Resume Preview"
                        className={cn(
                            "lg:col-span-5 xl:col-span-5 lg:sticky lg:top-20 z-10 transition-all",
                            mobileTab === 'preview' ? 'block' : 'hidden lg:block'
                        )}
                    >
                        <div className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md p-2 sm:p-3 shadow-md shadow-black/5 dark:shadow-black/20">
                            <PdfPreview />
                        </div>
                    </section>
                </div>
            </main>

            {/* ── TEMPLATES GALLERY DRAWER (Browse all 52 Typst templates) ── */}
            <Sheet open={templateSheetOpen} onOpenChange={setTemplateSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl p-4 sm:p-6 overflow-y-auto">
                    <SheetHeader className="pb-4 border-b border-border/50">
                        <SheetTitle className="font-display text-lg font-bold">
                            Choose Resume Template
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                            Switching templates instantly re-renders your Typst vector layout without altering or losing any of your resume content.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="pt-4 h-[calc(100vh-140px)] flex flex-col">
                        <TemplateSelector />
                    </div>
                </SheetContent>
            </Sheet>

            {/* ── UPLOAD EXISTING RESUME MODAL ── */}
            <ResumeUploadModal
                open={uploadModalOpen}
                onOpenChange={setUploadModalOpen}
                onParsed={(parsed) => setResumeData(parsed)}
            />

            {/* Full-Screen Kinetic Navigation Overlay */}
            <FullScreenNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </div>
    );
}

export default function EditorPageContent() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs font-mono">Initializing Editor...</p>
                    </div>
                </div>
            }
        >
            <EditorContent />
        </Suspense>
    );
}
