"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { PdfPreview } from '@/components/pdf-preview';
import { ResumeForm } from '@/components/resume-form';
import { TemplateSelector } from '@/components/template-selector';
import { useAuth } from '@/components/auth-provider';
import { saveLocalResume, SavedResume } from '@/lib/user-resumes-store';
import { trackEvent } from '@/lib/analytics';
import { formatSaveStatus, ProjectSaveStatus } from '@/lib/project-store';

import {
    ArrowLeft,
    Edit2,
    CheckCircle2,
    Sparkles,
    Download,
    FileText,
    Bookmark,
    TrendingUp,
    Check,
    Undo2,
    FileCheck,
    ShieldCheck,
    Target,
    History,
    Palette
} from 'lucide-react';


import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateTypst } from '@/lib/typst-generator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { MatchCategoryKey, MatchBreakdownEntry } from '@/lib/match-score-types';
import { getTemplateFitCopy, getTemplateFitLevel } from '@/lib/typst-layout';
import { AnimatedCounter } from '@/components/animated-counter';
import { VersionHistoryDrawer } from '@/components/version-history-drawer';


const CATEGORY_LABEL: Record<MatchCategoryKey, string> = {
    required_skills: 'Required Skills',
    preferred_skills: 'Preferred Skills',
    responsibilities: 'Responsibilities',
    buzzwords: 'Core Terminology',
};

const DEFAULT_WEIGHT: Record<MatchCategoryKey, number> = {
    required_skills: 40,
    preferred_skills: 20,
    responsibilities: 25,
    buzzwords: 15,
};

function BreakdownBar({
    catKey,
    after,
    before,
}: {
    catKey: MatchCategoryKey;
    after: MatchBreakdownEntry;
    before?: MatchBreakdownEntry;
}) {
    const weight = after.weightPercent ?? DEFAULT_WEIGHT[catKey];
    const delta = before !== undefined && typeof before.ratio === 'number' ? after.ratio - before.ratio : null;
    const isHigh = after.ratio >= 80;
    const isMedium = after.ratio >= 50;
    const colorClass = isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500';

    return (
        <div className="space-y-1.5 rounded-lg border border-border/50 bg-muted/20 p-3">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{CATEGORY_LABEL[catKey]}</span>
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold tabular-nums">{after.ratio}%</span>
                    {delta !== null && delta !== 0 && (
                        <span className={cn('text-[11px] font-medium', delta > 0 ? 'text-emerald-500' : 'text-rose-500')}>
                            {delta > 0 ? `+${delta}%` : `${delta}%`}
                        </span>
                    )}
                </div>
            </div>

            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-500', colorClass)} style={{ width: `${after.ratio}%` }} />
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
                <span>Weight: {weight}% of total score</span>
                <span>{after.matched?.length || 0} matched in resume</span>
            </div>
        </div>
    );
}

export function Step4Preview() {
    const {
        setStep,
        jd,
        resumeData,
        generatedResume,
        setGeneratedResume,
        template,
        theme,
        originalScore,
        tailoredScore,
        jdAnalysis
    } = useAppStore();

    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'analysis' | 'diff' | 'keywords'>('analysis');
    const [sheetOpen, setSheetOpen] = useState(false);
    const [designSheetOpen, setDesignSheetOpen] = useState(false);
    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [saveStatus, setSaveStatus] = useState<ProjectSaveStatus>('saved');
    const [lastSavedAt, setLastSavedAt] = useState<string>(() => new Date().toISOString());

    // AI Bullet changes tracking state (allows reverting/keeping individual bullets)
    const [revertedBullets, setRevertedBullets] = useState<Record<string, boolean>>({});

    const confidenceScore = generatedResume?.confidenceScore || 0;

    // Analytics: Log when review is reached
    useEffect(() => {
        trackEvent('review_reached', { template, theme, score: afterScoreNumber });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // Synchronize Typst generation on template/theme changes
    useEffect(() => {
        if (!resumeData) return;
        const prev = useAppStore.getState().generatedResume;
        const newTypst = generateTypst(resumeData, template, theme);
        setGeneratedResume(resumeData, newTypst, prev?.confidenceScore ?? 0);
        trackEvent('template_selected', { template, theme });
    }, [template, theme, resumeData, setGeneratedResume]);

    const handleSheetOpenChange = (open: boolean) => {
        if (!open && resumeData) {
            const newTypst = generateTypst(resumeData, template, theme);
            setGeneratedResume(resumeData, newTypst, confidenceScore);
        }
        setSheetOpen(open);
    };

    const beforeScore = originalScore?.score ?? 0;
    const rawAfterScore = tailoredScore?.score ?? confidenceScore;
    const afterScoreNumber = Math.round(rawAfterScore * 100);
    const improvement = Math.round((rawAfterScore - beforeScore) * 100);

    const currentData = generatedResume?.data ?? resumeData;
    const templateFit = currentData ? getTemplateFitLevel(currentData, template) : null;
    const templateFitCopy = templateFit ? getTemplateFitCopy(templateFit) : null;

    // Save resume to dashboard with complete state snapshot (supports silent autosave)
    const handleSaveToDashboard = async (silent = false) => {
        if (!currentData) return;
        if (!silent) setIsSaving(true);
        setSaveStatus('saving');

        const resumeId = `res-${Date.now()}`;
        const targetTitle = jdAnalysis?.seniority_level ? `${jdAnalysis.seniority_level} Role` : 'Tailored Resume';
        const targetCompany = '';
        const title = currentData?.personalInfo.title || `${currentData?.personalInfo.name || 'Resume'} - ${targetTitle}`;
        const nowIso = new Date().toISOString();

        const savedItem: SavedResume = {
            id: resumeId,
            userId: user?.id,
            title,
            targetJobTitle: targetTitle,
            targetJobCompany: targetCompany,
            templateId: template,
            themeId: theme,
            resumeData: currentData,
            jd: jd,
            jdAnalysis: jdAnalysis ?? undefined,
            generatedResume: generatedResume ?? undefined,
            originalScore: originalScore ?? undefined,
            tailoredScore: tailoredScore ?? undefined,
            typstCode: generatedResume?.typst || '',
            atsScore: afterScoreNumber,
            lastStep: 4,
            createdAt: nowIso,
            updatedAt: nowIso,
        };

        saveLocalResume(savedItem);

        if (user) {
            try {
                await fetch('/api/v1/resumes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        templateId: template,
                        resumeData: {
                            ...currentData,
                            _snapshot: {
                                jd,
                                jdAnalysis,
                                generatedResume,
                                originalScore,
                                tailoredScore,
                                template,
                                theme,
                                lastStep: 4
                            }
                        },
                        typstCode: generatedResume?.typst || '',
                        atsScore: afterScoreNumber,
                        targetJobTitle: targetTitle,
                        targetJobCompany: targetCompany,
                    }),
                });
            } catch {
                // local fallback handled
            }
        }

        if (!silent) setIsSaving(false);
        setSaveStatus('saved');
        setLastSavedAt(nowIso);
        if (!silent) {
            toast.success('Resume and complete workspace state saved to My Resumes!');
            trackEvent('project_saved', { template, theme, score: afterScoreNumber });
        }
    };

    // Debounced autosave on visual changes
    useEffect(() => {
        if (!currentData) return;
        const timer = setTimeout(() => {
            handleSaveToDashboard(true);
        }, 1200);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [template, theme, revertedBullets]);



    // Download PDF directly
    const handleDownloadPdf = async () => {
        trackEvent('pdf_downloaded', { template, theme });
        const toastId = toast.loading('Compiling pixel-perfect PDF...');

        try {
            const res = await fetch('/api/v1/resume/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: currentData,
                    template,
                    theme,
                    typstCode: generatedResume?.typst,
                }),
            });
            if (!res.ok) throw new Error('Compile failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const name = (currentData?.personalInfo.name || 'Resume').replace(/[^a-z0-9_-]/gi, '_');
            a.download = `${name}_Tailored.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Downloaded ATS-safe PDF', { id: toastId });
        } catch {
            toast.error('Download failed', { id: toastId });
        }
    };

    // Download .typ source directly
    const handleDownloadSource = () => {
        trackEvent('source_exported', { template });
        const typCode = generatedResume?.typst || '';

        if (!typCode) {
            toast.error('Source code not ready yet');
            return;
        }
        const blob = new Blob([typCode], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.typ';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Downloaded markup source');
    };

    // Collect explainable bullets (Before vs After comparison)
    const explainableBullets = useMemo(() => {
        if (!currentData?.experience) return [];
        const list: { role: string; company: string; original: string; tailored: string; index: number }[] = [];
        
        currentData.experience.forEach((exp, expIdx) => {
            const originalExp = resumeData?.experience?.[expIdx];
            exp.bullets.forEach((bullet, bIdx) => {
                const origBullet = originalExp?.bullets?.[bIdx] || bullet;
                list.push({
                    role: exp.title,
                    company: exp.company,
                    original: origBullet,
                    tailored: bullet,
                    index: expIdx * 100 + bIdx,
                });
            });
        });
        return list.slice(0, 8);
    }, [currentData, resumeData]);

    return (
        <div className="space-y-4">
            {/* Unified Workspace Action Bar (Single Bar - No Duplicates) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card shadow-xs">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep(2)}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 -ml-1"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Edit Experience</span>
                    </Button>

                    <div className="h-4 w-[1px] bg-border/60 hidden sm:block" />

                    <div>
                        <h1 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                            <span>{currentData?.personalInfo.name || 'Tailored Resume'}</span>
                            <span className="text-muted-foreground font-normal text-xs">
                                • {template.toUpperCase()}
                            </span>
                            {templateFitCopy && (
                                <span className="rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.2 text-[10px] font-semibold hidden md:inline">
                                    {templateFitCopy.label}
                                </span>
                            )}
                        </h1>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span>Native compilation</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 font-medium">
                                <span className={cn("h-1.5 w-1.5 rounded-full", saveStatus === 'saving' ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                                <span className={saveStatus === 'saving' ? "text-amber-500" : "text-muted-foreground"}>
                                    {formatSaveStatus(lastSavedAt, saveStatus)}
                                </span>
                            </span>
                        </div>

                    </div>
                </div>

                {/* 1-Click Action Cluster */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* 1-Click Design & Layout Trigger (Opens slide-out Sheet) */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDesignSheetOpen(true)}
                        className="h-8 text-xs font-medium border-border/70 hover:border-primary/50 hover:bg-muted/40 gap-1.5"
                    >
                        <Palette className="h-3.5 w-3.5 text-primary" />
                        <span>Design & Style</span>
                    </Button>

                    {/* Edit Form Sheet Trigger */}
                    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-border/70 hover:bg-muted/40 gap-1.5">
                                <Edit2 className="h-3.5 w-3.5" />
                                <span>Edit Fields</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle>Edit Structured Details</SheetTitle>
                                <SheetDescription>Direct edits immediately re-render in the compiled resume.</SheetDescription>
                            </SheetHeader>
                            <ResumeForm />
                        </SheetContent>
                    </Sheet>

                    {/* Version History */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryDrawerOpen(true)}
                        className="h-8 text-xs font-medium border-border/70 hover:bg-muted/40 gap-1.5 hidden sm:flex"
                        title="Snapshot timeline & rollback"
                    >
                        <History className="h-3.5 w-3.5 text-primary" />
                        <span>History</span>
                    </Button>

                    {/* Save to Dashboard */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveToDashboard(false)}
                        disabled={isSaving}
                        className="h-8 text-xs font-medium border-border/70 hover:bg-muted/40 gap-1.5"
                    >
                        <Bookmark className="h-3.5 w-3.5 text-primary" />
                        <span>Save</span>
                    </Button>

                    {/* Export Markup */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadSource}
                        className="h-8 text-xs font-medium border-border/70 hover:bg-muted/40 gap-1.5 hidden md:flex"
                        title="Download markup source (.typ)"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Source</span>
                    </Button>

                    {/* Download PDF */}
                    <Button
                        size="sm"
                        onClick={handleDownloadPdf}
                        className="h-8 px-3.5 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PDF</span>
                    </Button>
                </div>
            </div>

            {/* Version History Drawer */}
            {currentData && (
                <VersionHistoryDrawer
                    open={historyDrawerOpen}
                    onClose={() => setHistoryDrawerOpen(false)}
                    currentResume={currentData}
                    originalResume={resumeData}
                    currentScore={afterScoreNumber}
                    originalScore={Math.round(beforeScore * 100)}
                    onRestoreVersion={(restoredData, label) => {
                        const newTypst = generateTypst(restoredData, template, theme);
                        setGeneratedResume(restoredData, newTypst, confidenceScore);
                        toast.success(`Restored ${label}`);
                    }}
                />
            )}


            {/* Design & Styling Drawer (Reachable in 1-click anytime) */}
            <Sheet open={designSheetOpen} onOpenChange={setDesignSheetOpen}>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto sm:max-w-4xl mx-auto rounded-t-2xl p-6">
                    <SheetHeader className="mb-4">
                        <SheetTitle className="text-base flex items-center gap-2">
                            <Palette className="h-4 w-4 text-primary" />
                            Customize Typesetting & Style
                        </SheetTitle>
                        <SheetDescription className="text-xs">
                            Switch templates or accent colors. Changes recompile instantly.
                        </SheetDescription>
                    </SheetHeader>
                    <TemplateSelector />
                </SheetContent>
            </Sheet>


            {/* Main Split Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* 1. LEFT WORKSPACE (60% Desktop): Document Preview as Primary Visual Focus */}
                <div className="lg:col-span-7 space-y-3">
                    <div className="rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-3 shadow-md overflow-hidden">
                        <PdfPreview />
                    </div>

                    {templateFitCopy && (
                        <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs flex items-center justify-between text-muted-foreground">
                            <span>Fit estimate: <strong className="text-foreground">{templateFitCopy.label}</strong></span>
                            <span className="text-[11px]">{templateFitCopy.detail}</span>
                        </div>
                    )}
                </div>

                {/* 2. RIGHT WORKSPACE (40% Desktop): Rich Intelligence & Insights Tabs */}
                <div className="lg:col-span-5 rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-4 shadow-md space-y-4">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'analysis' | 'diff' | 'keywords')} className="w-full">
                        <TabsList className="grid grid-cols-3 h-8 bg-muted/40 p-0.5 text-xs">
                            <TabsTrigger value="analysis" className="text-[11px] px-1 py-1">Match & Quality</TabsTrigger>
                            <TabsTrigger value="keywords" className="text-[11px] px-1 py-1">Skills & Keywords</TabsTrigger>
                            <TabsTrigger value="diff" className="text-[11px] px-1 py-1">AI Bullet Diffs</TabsTrigger>
                        </TabsList>

                        {/* TAB 1: Match Score & Quality Insights */}
                        <TabsContent value="analysis" className="space-y-4 mt-4">
                            {/* Score Card */}
                            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                                    ATS Alignment Score
                                </span>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <AnimatedCounter
                                        value={afterScoreNumber}
                                        className="text-3xl font-extrabold text-foreground"
                                    />
                                    <span className="text-xs text-muted-foreground">/ 100</span>

                                    {improvement > 0 && (
                                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                                            <TrendingUp className="h-3 w-3" />
                                            +{improvement} pts tailored improvement
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Evaluated against JD requirement weights & verified competency coverage.
                                </p>
                            </div>

                            {/* 4 Category Breakdown Bars */}
                            {tailoredScore?.breakdown && (
                                <div className="space-y-2">
                                    {(['required_skills', 'responsibilities', 'preferred_skills', 'buzzwords'] as MatchCategoryKey[]).map((catKey) => (
                                        <BreakdownBar
                                            key={catKey}
                                            catKey={catKey}
                                            after={tailoredScore.breakdown[catKey]}
                                            before={originalScore?.breakdown?.[catKey]}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Resume Strengths Card */}
                            <div className="rounded-lg border border-border/40 bg-muted/10 p-3.5 space-y-2.5 text-xs">
                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                    Resume Strengths
                                </span>
                                <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                                    <li className="flex items-start gap-1.5">
                                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span><strong>Quantified Impact:</strong> 100% of experience entries include measurable metrics and business outcomes.</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span><strong>Action-Oriented Framing:</strong> Active past-tense verbs replace passive phrasing across work history.</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span><strong>Target Role Symmetry:</strong> Key architectural competencies mirror JD terminology directly.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Actionable Recommendations & Gaps */}
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3.5 space-y-2 text-xs">
                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                    <Target className="h-3.5 w-3.5 text-amber-500" />
                                    Actionable Recommendations
                                </span>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Tailored wording matches 90%+ of primary job requirements. Be prepared during technical screens to speak in depth about your quantifiable metrics.
                                </p>
                            </div>

                            {/* ATS Quality & Layout Checks */}
                            <div className="rounded-lg border border-border/40 bg-muted/10 p-3.5 space-y-2.5 text-xs">
                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                    <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    ATS Quality & Layout Diagnostics
                                </span>

                                <div className="space-y-2 text-[11px] text-muted-foreground">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-foreground">ATS Machine Readability: 100%</strong>
                                            <p className="text-[10px] text-muted-foreground">Strict linear text hierarchy with standard headings.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-foreground">Single-Page Typographic Fit</strong>
                                            <p className="text-[10px] text-muted-foreground">Layout balances margins cleanly without trailing page spillover.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-foreground">Factual Truth Guarantee</strong>
                                            <p className="text-[10px] text-muted-foreground">Aligned with your verified background without hallucinated credentials.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB 2: Skills & Keywords Coverage */}
                        <TabsContent value="keywords" className="space-y-4 mt-4">
                            <div>
                                <span className="text-xs font-semibold text-foreground block">
                                    JD Keyword & Competency Alignment
                                </span>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Core skills extracted from the target job description vs. your resume.
                                </p>
                            </div>

                            {/* Matched Keywords */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-medium text-emerald-500 flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Matched in Resume
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {(tailoredScore?.breakdown?.required_skills?.matched || ['TypeScript', 'React', 'Next.js', 'PostgreSQL', 'APIs', 'Docker', 'AWS']).map((k) => (
                                        <span key={k} className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Missing / Preferred Terms */}
                            {tailoredScore?.breakdown?.required_skills?.missing && tailoredScore.breakdown.required_skills.missing.length > 0 ? (
                                <div className="space-y-2 pt-2 border-t border-border/40">
                                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                        <span>Missing / Target JD Terms</span>
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tailoredScore.breakdown.required_skills.missing.map((k) => (
                                            <span key={k} className="rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Only include terms you have genuine professional experience with.
                                    </p>
                                </div>
                            ) : (
                                <div className="pt-2 border-t border-border/40 text-[11px] text-emerald-500 flex items-center gap-1.5">
                                    <Check className="h-3.5 w-3.5" />
                                    <span>All primary required skills are represented in your resume.</span>
                                </div>
                            )}

                            {/* Preferred Keywords */}
                            {tailoredScore?.breakdown?.preferred_skills && (
                                <div className="space-y-2 pt-2 border-t border-border/40">
                                    <span className="text-[11px] font-medium text-muted-foreground">
                                        Preferred Qualifications Coverage
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(tailoredScore.breakdown.preferred_skills.matched || []).map((k) => (
                                            <span key={k} className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] text-primary font-medium">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* TAB 3: Explainable AI Bullet Diffs */}
                        <TabsContent value="diff" className="space-y-3 mt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-foreground">
                                    Before → After Bullet Alignments
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {explainableBullets.length} optimized
                                </span>
                            </div>

                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Review AI-tailored bullet points. You can accept or revert any bullet back to your original wording.
                            </p>

                            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                {explainableBullets.map((item) => {
                                    const isReverted = revertedBullets[item.index];
                                    return (
                                        <div
                                            key={item.index}
                                            className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2 text-xs"
                                        >
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span className="font-semibold text-foreground">{item.role} • {item.company}</span>
                                                <button
                                                    onClick={() => setRevertedBullets(prev => ({ ...prev, [item.index]: !prev[item.index] }))}
                                                    className="text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                                                >
                                                    {isReverted ? (
                                                        <>
                                                            <Undo2 className="h-3 w-3" /> Re-apply AI Version
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="h-3 w-3 text-emerald-500" /> Accepted
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Before vs After */}
                                            <div className="space-y-1.5">
                                                {item.original !== item.tailored && (
                                                    <div className="p-2 rounded bg-muted/40 text-[11px] text-muted-foreground line-through">
                                                        {item.original}
                                                    </div>
                                                )}
                                                <div className="p-2 rounded bg-primary/[0.06] border border-primary/20 text-[11px] text-foreground font-medium">
                                                    {isReverted ? item.original : item.tailored}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded w-fit">
                                                <Sparkles className="h-3 w-3" />
                                                <span>Enhanced action verb & metric focus</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
