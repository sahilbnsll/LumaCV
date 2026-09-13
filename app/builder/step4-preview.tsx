"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { PdfPreview } from '@/components/pdf-preview';
import { ResumeForm } from '@/components/resume-form';
import { TemplateSelector } from '@/components/template-selector';
import { SectionOrderEditor } from '@/components/section-order-editor';
import { useAuth } from '@/components/auth-provider';
import { saveLocalResume, SavedResume } from '@/lib/user-resumes-store';
import { trackEvent } from '@/lib/analytics';
import { formatSaveStatus, ProjectSaveStatus } from '@/lib/project-store';
import { StatusBadge } from '@/components/ui/status-badge';

import {
    ArrowLeft,
    PenLine,
    CheckCircle2,
    Sparkles,
    Download,
    FileCode2,
    Bookmark,
    TrendingUp,
    Check,
    Undo2,
    FileCheck,
    ShieldCheck,
    Target,
    History,
    Palette,
    Copy,
    CheckCheck,
    LayoutGrid,
    Loader2,
    Edit3,
    BarChart3,
    Layers,
    HelpCircle,
    AlertCircle,
    ChevronDown,
} from 'lucide-react';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateTypst } from '@/lib/typst-generator';
import { toast } from 'sonner';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import type { MatchCategoryKey, MatchBreakdownEntry, MatchScoreResponse } from '@/lib/match-score-types';
import { getTemplateFitCopy, getTemplateFitLevel } from '@/lib/typst-layout';
import { AnimatedCounter } from '@/components/animated-counter';
import { VersionHistoryDrawer } from '@/components/version-history-drawer';
import { ColorPaletteSelector } from '@/components/color-palette-selector';
import { ScoreGapAnalysis, type ScoreStatus } from '@/components/builder/score-gap-analysis';
import { SkillsRationaleList } from '@/components/builder/skills-rationale-list';
import { JdEvidenceMap } from '@/components/builder/jd-evidence-map';
import { BulletDiffViewer } from '@/components/builder/bullet-diff-viewer';
import { CompactResumeEditor } from '@/components/compact-resume-editor';
import { resumeDataToPlainText } from '@/lib/resume-plaintext';
import { exportResume, ExportFormatType } from '@/lib/resume-export';

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
                {/* transform:scaleX instead of width — width triggers layout/reflow
                    on every transition frame, scaleX is GPU-composited. */}
                <div
                    className={cn('h-full w-full origin-left rounded-full transition-transform duration-500 ease-out', colorClass)}
                    style={{ transform: `scaleX(${after.ratio / 100})` }}
                />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
                <span>Weight: {weight}% of total score</span>
                <span>{after.matched?.length || 0} matched in resume</span>
            </div>
        </div>
    );
}

export function Step4Preview() {
    const setStep = useAppStore((s) => s.setStep);
    const resumeData = useAppStore((s) => s.resumeData);
    const preTailorSnapshot = useAppStore((s) => s.preTailorSnapshot);
    const setBulletText = useAppStore((s) => s.setBulletText);
    const generatedResume = useAppStore((s) => s.generatedResume);
    const setGeneratedResume = useAppStore((s) => s.setGeneratedResume);
    const template = useAppStore((s) => s.template);
    const theme = useAppStore((s) => s.theme);
    const originalScore = useAppStore((s) => s.originalScore);
    const tailoredScore = useAppStore((s) => s.tailoredScore);
    const setTailoredScore = useAppStore((s) => s.setTailoredScore);
    const jdAnalysis = useAppStore((s) => s.jdAnalysis);
    const editorMode = useAppStore((s) => s.editorMode);
    const setEditorMode = useAppStore((s) => s.setEditorMode);

    const { user } = useAuth();
    const router = useRouter();

    // Right-panel tab state — 'analysis' | 'diff' | 'keywords' | 'edit'
    const [activeTab, setActiveTab] = useState<'analysis' | 'diff' | 'keywords' | 'edit'>('analysis');
    const [designSheetOpen, setDesignSheetOpen] = useState(false);
    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

    // Save state
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<ProjectSaveStatus>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

    // Download & Export state
    const [isDownloading, setIsDownloading] = useState(false);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [exportingFormat, setExportingFormat] = useState<ExportFormatType | null>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
                setExportMenuOpen(false);
            }
        };
        if (exportMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [exportMenuOpen]);

    // Bullet diff tracking — reverting/re-accepting a bullet here actually rewrites
    // the canonical resumeData (via setBulletText), not just this tab's own display,
    // so the exported/saved resume reflects what the diff viewer shows.
    const [revertedBullets, setRevertedBullets] = useState<Record<string, boolean>>({});
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleToggleRevert = useCallback((item: { index: number; original: string; tailored: string }) => {
        setRevertedBullets((prev) => {
            const next = !prev[item.index];
            const expIdx = Math.floor(item.index / 100);
            const bulletIdx = item.index % 100;
            setBulletText(expIdx, bulletIdx, next ? item.original : item.tailored);
            return { ...prev, [item.index]: next };
        });
    }, [setBulletText]);

    const handleCopyBullet = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('Bullet copied to clipboard');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const confidenceScore = generatedResume?.confidenceScore || 0;

    // Analytics
    useEffect(() => {
        trackEvent('review_reached', { template, theme, score: afterScoreNumber });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const jd = useAppStore((s) => s.jd);

    const [scoreStatus, setScoreStatus] = useState<ScoreStatus>(() => {
        const currentJd = useAppStore.getState().jd;
        const currentAnalysis = useAppStore.getState().jdAnalysis;
        if (!currentJd && !currentAnalysis) return 'no_jd';
        const ts = useAppStore.getState().tailoredScore;
        if (ts?.isCalculated) return 'calculated';
        return 'calculating';
    });

    // Re-generate Typst only when typst actually differs
    useEffect(() => {
        if (!resumeData) return;
        const prev = useAppStore.getState().generatedResume;
        const newTypst = generateTypst(resumeData, template, theme);
        if (newTypst !== prev?.typst) {
            setGeneratedResume(resumeData, newTypst, prev?.confidenceScore ?? 0, prev?.auditTrail, prev?.atsAlignmentSummary);
        }
        trackEvent('template_selected', { template, theme });
    }, [template, theme, resumeData, setGeneratedResume]);

    // Recalculate score function
    const recalculateScore = useCallback(async () => {
        const state = useAppStore.getState();
        const currentResume = state.resumeData;
        const currentJd = state.jd;
        const currentJdAnalysis = state.jdAnalysis;

        if (!currentResume) return;
        if (!currentJd && !currentJdAnalysis) {
            setScoreStatus('no_jd');
            return;
        }

        setScoreStatus('calculating');

        try {
            const tailoredText = resumeDataToPlainText(currentResume);
            const res = await fetch('/api/v1/resume/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: currentResume,
                    resumeText: tailoredText,
                    jdKeywords: currentJdAnalysis || {
                        required_skills: [],
                        preferred_skills: [],
                        responsibilities: [],
                        buzzwords: [],
                    },
                }),
            });

            if (res.ok) {
                const data: MatchScoreResponse = await res.json();
                setTailoredScore(data);
                setScoreStatus(data.isCalculated ? 'calculated' : 'no_jd');
            } else {
                console.warn('Scoring endpoint returned non-OK:', res.status);
                setScoreStatus('error');
            }
        } catch (err) {
            console.error('Score calculation error:', err);
            setScoreStatus('error');
        }
    }, [setTailoredScore]);

    // Recalculate on manual edit
    const initialMountRef = useRef(true);
    useEffect(() => {
        if (initialMountRef.current) {
            initialMountRef.current = false;
            const hasCorruptedScore =
                tailoredScore?.gapAnalysis?.scoreReason?.includes('[object Object]') ||
                tailoredScore?.gapAnalysis?.remainingGaps?.some(g => String(g?.missingItem || '').includes('[object Object]'));

            if (tailoredScore?.isCalculated && !hasCorruptedScore) {
                setScoreStatus('calculated');
            } else if (!jd && !jdAnalysis) {
                setScoreStatus('no_jd');
            } else {
                recalculateScore();
            }
            return;
        }

        if (!jd && !jdAnalysis) {
            setScoreStatus('no_jd');
            return;
        }

        setScoreStatus('calculating');
        const timer = setTimeout(() => {
            recalculateScore();
        }, 1000);

        return () => clearTimeout(timer);
    }, [resumeData, jd, jdAnalysis, recalculateScore]);

    // Sync editorMode with tab
    useEffect(() => {
        if (activeTab === 'edit') setEditorMode('edit');
        else setEditorMode('optimize');
    }, [activeTab, setEditorMode]);

    const beforeScore = originalScore?.score ?? 0;
    const rawAfterScore = tailoredScore?.score ?? (scoreStatus === 'calculated' ? confidenceScore : 0);
    const afterScoreNumber = Math.round(rawAfterScore * 100);
    const improvement = Math.round((rawAfterScore - beforeScore) * 100);

    const currentData = useMemo(
        () => generatedResume?.data ?? resumeData,
        [generatedResume?.data, resumeData]
    );
    const templateFit = useMemo(
        () => (currentData ? getTemplateFitLevel(currentData, template) : null),
        [currentData, template]
    );
    const templateFitCopy = useMemo(
        () => (templateFit ? getTemplateFitCopy(templateFit) : null),
        [templateFit]
    );

    // ── Save to dashboard ──────────────────────────────────────────────────
    const handleSaveToDashboard = async () => {
        if (!currentData) return;

        if (!user) {
            toast.error('Please sign in to save resumes to your account.', {
                action: {
                    label: 'Sign In',
                    onClick: () => router.push('/login?redirect=/builder'),
                },
            });
            return;
        }

        setIsSaving(true);
        setSaveStatus('saving');

        const currentJd = useAppStore.getState().jd;
        const resumeId = `res-${Date.now()}`;
        const targetTitle = jdAnalysis?.seniority_level
            ? `${jdAnalysis.seniority_level} Professional`
            : 'Executive Profile';
        const targetCompany = '';
        const candidateName = currentData?.personalInfo.name?.trim();
        const candidateRole = currentData?.personalInfo.title?.trim();
        const title =
            candidateRole && candidateName
                ? `${candidateName} — ${candidateRole}`
                : candidateName
                    ? `${candidateName} — ${targetTitle}`
                    : targetTitle;
        const nowIso = new Date().toISOString();

        const savedItem: SavedResume = {
            id: resumeId,
            userId: user.id,
            title,
            targetJobTitle: targetTitle,
            targetJobCompany: targetCompany,
            templateId: template,
            themeId: theme,
            resumeData: currentData,
            jd: currentJd,
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

        saveLocalResume(savedItem, user.id);

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
                            jd: currentJd,
                            jdAnalysis,
                            generatedResume,
                            originalScore,
                            tailoredScore,
                            template,
                            theme,
                            lastStep: 4,
                        },
                    },
                    typstCode: generatedResume?.typst || '',
                    atsScore: afterScoreNumber,
                    targetJobTitle: targetTitle,
                    targetJobCompany: targetCompany,
                }),
            });
            setSaveStatus('saved');
            setLastSavedAt(nowIso);
            notify.saved('Saved to My Resumes');
        } catch {
            setSaveStatus('error');
            notify.error("Couldn't save changes", 'Local backup preserved', {
                retry: handleSaveToDashboard,
            });
        } finally {
            setIsSaving(false);
            trackEvent('project_saved', { template, theme, score: afterScoreNumber });
        }
    };

    // ── Multi-Format Resume Export ─────────────────────────────────────────
    const handleExportFormat = async (fmt: ExportFormatType) => {
        if (!user) {
            notify.error('Sign in required', 'Please sign in to download your tailored resume', {
                action: {
                    label: 'Sign In',
                    onClick: () => router.push('/login?redirect=/builder'),
                },
            });
            return;
        }

        if (!currentData) {
            notify.error('No resume data', 'Please build or select a resume first');
            return;
        }

        setIsDownloading(true);
        setExportingFormat(fmt);

        try {
            await exportResume({
                resumeData: currentData,
                format: fmt,
                template,
                theme: { color: theme },
                typstCode: generatedResume?.typst,
                customFilename: `${(currentData.personalInfo?.name || 'Resume').toLowerCase().replace(/\s+/g, '-')}-tailored`,
            });
            trackEvent('resume_exported', { format: fmt, template, theme });
        } finally {
            setIsDownloading(false);
            setExportingFormat(null);
            setExportMenuOpen(false);
        }
    };

    const handleDownloadPdf = () => handleExportFormat('pdf');
    const handleDownloadSource = () => handleExportFormat('typ');

    // ── Explainable bullet diffs ───────────────────────────────────────────
    // Built from the server's auditTrail.bulletChanges — a stable snapshot of what
    // actually changed, captured once at generation time. This is deliberately NOT
    // derived by re-comparing currentData against resumeData on every render: once
    // preTailorSnapshot and currentData were decoupled (so Step 4 could show a real
    // before/after), a live positional diff would also make entries disappear the
    // moment a bullet was reverted back to its original text.
    const explainableBullets = useMemo(() => {
        const changes = generatedResume?.auditTrail?.bulletChanges;
        if (!changes?.length || !preTailorSnapshot?.experience) return [];

        return changes
            .map((bc) => {
                let expIdx = -1;
                let bIdx = -1;
                preTailorSnapshot.experience!.some((exp, ei) => {
                    if (exp.title !== bc.role || exp.company !== bc.company) return false;
                    const found = exp.bullets.findIndex((b) => b === bc.original);
                    if (found === -1) return false;
                    expIdx = ei;
                    bIdx = found;
                    return true;
                });
                return {
                    role: bc.role,
                    company: bc.company,
                    original: bc.original,
                    tailored: bc.tailored,
                    index: expIdx * 100 + bIdx,
                    reason: bc.reason,
                    changeType: bc.changeType,
                    evidenceSafety: bc.evidenceSafety,
                };
            })
            .filter((item) => item.index >= 0);
    }, [generatedResume?.auditTrail?.bulletChanges, preTailorSnapshot]);

    return (
        <div className="space-y-4">
            {/* ── Unified Action Bar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 glass-card shadow-lg relative z-20">
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStep(2)}
                        className="h-9 px-2.5 sm:px-3 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 gap-1.5 -ml-1 cursor-pointer transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline font-medium">Edit Experience</span>
                    </Button>

                    <div className="h-5 w-[1px] bg-border hidden sm:block" />

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                Step 04 • Studio
                            </span>
                            {editorMode === 'edit' && (
                                <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold hidden md:inline">
                                    Manual Edit Mode
                                </span>
                            )}
                            {templateFitCopy && editorMode !== 'edit' && (
                                <span className="rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold hidden md:inline">
                                    {templateFitCopy.label}
                                </span>
                            )}
                        </div>
                        <h1 className="text-sm sm:text-base font-bold font-display text-foreground tracking-tight flex items-center gap-2 mt-1">
                            <span>{currentData?.personalInfo.name || 'Tailored Resume'}</span>
                            <span className="text-muted-foreground font-normal text-xs">
                                • {template.toUpperCase()}
                            </span>
                        </h1>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span>Native Typst Compilation</span>
                            {lastSavedAt ? (
                                <>
                                    <span>•</span>
                                    <span className="inline-flex items-center gap-1.5 font-medium">
                                        <span
                                            className={cn(
                                                'h-1.5 w-1.5 rounded-full',
                                                saveStatus === 'saving'
                                                    ? 'bg-amber-500 animate-pulse'
                                                    : saveStatus === 'error'
                                                        ? 'bg-rose-500'
                                                        : 'bg-emerald-500'
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                saveStatus === 'saving'
                                                    ? 'text-amber-500'
                                                    : saveStatus === 'error'
                                                        ? 'text-rose-500'
                                                        : 'text-muted-foreground'
                                            )}
                                        >
                                            {formatSaveStatus(lastSavedAt, saveStatus)}
                                        </span>
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span>•</span>
                                    <span className="text-muted-foreground/70">Unsaved draft</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Cluster */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Templates */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDesignSheetOpen(true)}
                        className="h-9 px-3 rounded-xl text-xs font-semibold border-border bg-background/50 hover:bg-muted/40 hover:border-primary/50 gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                        <LayoutGrid className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                        <span>Templates</span>
                    </Button>

                    {/* Edit Resume tab switcher */}
                    <Button
                        variant={activeTab === 'edit' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setActiveTab(activeTab === 'edit' ? 'analysis' : 'edit')}
                        className={cn(
                            'h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer shadow-xs transition-all',
                            activeTab === 'edit'
                                ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                                : 'border-border bg-background/50 hover:bg-muted/40'
                        )}
                        title="Switch to manual edit mode"
                    >
                        <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
                        <span>{activeTab === 'edit' ? 'Exit Edit' : 'Edit Resume'}</span>
                    </Button>

                    {/* Version History */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setHistoryDrawerOpen(true)}
                        className="h-9 px-3 rounded-xl text-xs font-semibold border-border bg-background/50 hover:bg-muted/40 gap-1.5 hidden sm:flex cursor-pointer shadow-xs transition-all"
                        title="Snapshot timeline & rollback"
                    >
                        <History className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                        <span>History</span>
                    </Button>

                    {/* Save */}
                    <Button
                        variant={saveStatus === 'saved' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={handleSaveToDashboard}
                        disabled={isSaving}
                        className={cn(
                            'h-9 px-3 rounded-xl text-xs font-semibold border-border bg-background/50 hover:border-primary/50 hover:bg-muted/40 gap-1.5 cursor-pointer transition-all shadow-xs',
                            saveStatus === 'saved' && 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10',
                            saveStatus === 'error' && 'border-rose-500/30 text-rose-500 bg-rose-500/10'
                        )}
                        title="Save this tailored resume to My Resumes"
                    >
                        {isSaving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Bookmark
                                className={cn(
                                    'h-3.5 w-3.5',
                                    saveStatus === 'saved' ? 'text-emerald-500 fill-emerald-500/30' : 'text-primary'
                                )}
                                strokeWidth={2}
                            />
                        )}
                        <span>
                            {isSaving ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Retry Save' : 'Save Resume'}
                        </span>
                    </Button>

                    {/* Export Source */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadSource}
                        className="h-9 px-3 rounded-xl text-xs font-semibold border-border bg-background/50 hover:bg-muted/40 gap-1.5 hidden md:flex cursor-pointer shadow-xs transition-all"
                        title="Download markup source (.typ)"
                    >
                        <FileCode2 className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                        <span>Source</span>
                    </Button>

                    {/* Multi-Format Export Split Button */}
                    <div ref={exportMenuRef} className="relative inline-flex items-center rounded-xl shadow-xs">
                        <Button
                            size="sm"
                            onClick={() => handleExportFormat('pdf')}
                            disabled={isDownloading}
                            className="h-9 px-3 sm:px-4 rounded-l-xl rounded-r-none text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 border-r border-primary-foreground/20 cursor-pointer disabled:opacity-70"
                        >
                            {isDownloading && exportingFormat === 'pdf' ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                            ) : (
                                <Download className="h-3.5 w-3.5" strokeWidth={2} />
                            )}
                            <span className="hidden sm:inline">{isDownloading && exportingFormat === 'pdf' ? 'Compiling…' : 'Download PDF'}</span>
                            <span className="sm:hidden">PDF</span>
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setExportMenuOpen(!exportMenuOpen)}
                            disabled={isDownloading}
                            className="h-9 px-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-l-none rounded-r-xl cursor-pointer"
                            title="Export in other formats (Word, Markdown, JSON, Typst)"
                        >
                            <ChevronDown className="h-3.5 w-3.5" />
                        </Button>

                        {exportMenuOpen && (
                            <div className="absolute right-0 top-11 z-50 p-1.5 rounded-xl border border-border bg-popover/98 backdrop-blur-2xl shadow-xl w-56 text-xs text-foreground space-y-0.5">
                                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                                    Download Resume As
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleExportFormat('pdf')}
                                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium cursor-pointer text-left transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
                                        <span>Vector PDF (Typst)</span>
                                    </div>
                                    <span className="text-[10px] text-red-500 font-mono font-semibold">.pdf</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExportFormat('docx')}
                                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium cursor-pointer text-left transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                                        <span>Word Document</span>
                                    </div>
                                    <span className="text-[10px] text-amber-500 font-mono font-semibold">.docx</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExportFormat('md')}
                                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium cursor-pointer text-left transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                                        <span>Plaintext Markdown</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-500 font-mono font-semibold">.md</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExportFormat('json')}
                                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium cursor-pointer text-left transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                                        <span>JSON Resume Data</span>
                                    </div>
                                    <span className="text-[10px] text-blue-500 font-mono font-semibold">.json</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExportFormat('typ')}
                                    className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium cursor-pointer text-left transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-purple-400 shrink-0" />
                                        <span>Typst Source Code</span>
                                    </div>
                                    <span className="text-[10px] text-purple-500 font-mono font-semibold">.typ</span>
                                </button>
                            </div>
                        )}
                    </div>
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

            {/* Template Selection Sheet */}
            <Sheet open={designSheetOpen} onOpenChange={setDesignSheetOpen}>
                <SheetContent
                    side="bottom"
                    className="h-[88vh] max-h-[680px] flex flex-col overflow-hidden sm:max-w-5xl mx-auto rounded-t-3xl border-t border-border bg-background/95 backdrop-blur-2xl p-4 sm:p-5"
                >
                    <SheetHeader className="shrink-0 mb-2 text-left">
                        <SheetTitle className="text-base sm:text-lg font-bold font-display flex items-center gap-2 text-foreground">
                            <LayoutGrid className="h-4 w-4 text-primary" />
                            Select Resume Template
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                            Choose from 52 curated Typst layout archetypes. Changes recompile instantly into your vector PDF.
                        </SheetDescription>
                    </SheetHeader>
                    <TemplateSelector />
                </SheetContent>
            </Sheet>

            {/* ── Main Split Workspace ── */}
            {(() => {
                const isEditTab = activeTab === 'edit';
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        {/* LEFT: Live Resume Preview (Sticky on desktop while editing) */}
                        <div
                            className={cn(
                                "space-y-3 transition-all order-1 lg:order-1",
                                isEditTab
                                    ? "lg:col-span-5 xl:col-span-5 lg:sticky lg:top-4"
                                    : "lg:col-span-7"
                            )}
                        >
                            <ColorPaletteSelector />
                            <PdfPreview />
                            {templateFitCopy && (
                                <div className="rounded-xl border border-border bg-card/60 px-4 py-2.5 text-xs flex items-center justify-between text-muted-foreground backdrop-blur-md">
                                    <span>
                                        Fit estimate: <strong className="text-foreground">{templateFitCopy.label}</strong>
                                    </span>
                                    <span className="text-[11px] font-mono">{templateFitCopy.detail}</span>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Analysis & Edit Hub Column (Section Navigator + Editor Controls) */}
                        <div
                            className={cn(
                                "glass-card p-4 sm:p-5 shadow-xl space-y-4 transition-all order-2 lg:order-2",
                                isEditTab
                                    ? "lg:col-span-7 xl:col-span-7"
                                    : "lg:col-span-5"
                            )}
                        >
                            <Tabs
                                value={activeTab}
                                onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                                className="w-full"
                            >
                                <TabsList className="grid grid-cols-4 h-9 bg-muted/50 p-1 rounded-xl text-xs border border-border/50">
                                    <TabsTrigger
                                        value="analysis"
                                        className="text-[10px] sm:text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs px-1 sm:px-2"
                                    >
                                        <BarChart3 className="h-3 w-3 sm:mr-1" />
                                        <span className="hidden sm:inline">Match</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="keywords"
                                        className="text-[10px] sm:text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs px-1 sm:px-2"
                                    >
                                        <Sparkles className="h-3 w-3 sm:mr-1" />
                                        <span className="hidden sm:inline">Skills</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="diff"
                                        className="text-[10px] sm:text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs px-1 sm:px-2"
                                    >
                                        <Layers className="h-3 w-3 sm:mr-1" />
                                        <span className="hidden sm:inline">Diffs</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="edit"
                                        className={cn(
                                            'text-[10px] sm:text-xs font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-xs px-1 sm:px-2',
                                            activeTab === 'edit' && 'data-[state=active]:text-amber-600 dark:text-amber-400'
                                        )}
                                    >
                                        <Edit3 className="h-3 w-3 sm:mr-1" />
                                        <span className="hidden sm:inline">Edit</span>
                                    </TabsTrigger>
                                </TabsList>

                                {/* ── TAB 1: Match Score & Quality ── */}
                                <TabsContent value="analysis" className="space-y-4 mt-4">
                                    <div className="relative rounded-2xl border border-border bg-gradient-to-br from-muted/30 via-background to-muted/20 p-4 sm:p-5 shadow-xs overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className="relative h-20 w-20 shrink-0 flex items-center justify-center">
                                                {scoreStatus === 'calculating' ? (
                                                    <div className="flex flex-col items-center justify-center text-primary animate-pulse">
                                                        <Loader2 className="h-6 w-6 animate-spin mb-1" />
                                                        <span className="text-[9px] font-mono text-muted-foreground uppercase">Scoring</span>
                                                    </div>
                                                ) : scoreStatus === 'no_jd' ? (
                                                    <div className="flex flex-col items-center justify-center text-muted-foreground text-center">
                                                        <HelpCircle className="h-6 w-6 text-muted-foreground/60 mb-1" />
                                                        <span className="text-[8px] font-mono text-muted-foreground uppercase">No JD</span>
                                                    </div>
                                                ) : scoreStatus === 'error' ? (
                                                    <div className="flex flex-col items-center justify-center text-rose-500 text-center">
                                                        <AlertCircle className="h-6 w-6 text-rose-500 mb-1" />
                                                        <span className="text-[8px] font-mono text-rose-500 uppercase">Error</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                                                            <circle cx="40" cy="40" r="34" className="text-muted/30 dark:text-white/10 stroke-current" strokeWidth="6" fill="transparent" />
                                                            <circle
                                                                cx="40" cy="40" r="34"
                                                                className="text-primary stroke-current transition-all duration-1000 ease-out"
                                                                strokeWidth="6" strokeLinecap="round"
                                                                strokeDasharray="213.6"
                                                                strokeDashoffset={213.6 * (1 - Math.min(Math.max(afterScoreNumber, 0), 100) / 100)}
                                                                fill="transparent"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <AnimatedCounter value={afterScoreNumber} className="text-2xl font-bold font-display text-foreground leading-none" />
                                                            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">ATS</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-semibold">
                                                        {scoreStatus === 'no_jd'
                                                            ? 'Standalone Profile'
                                                            : scoreStatus === 'calculating'
                                                                ? 'Calculating Alignment'
                                                                : scoreStatus === 'error'
                                                                    ? 'Score Offline'
                                                                    : 'Alignment Score'}
                                                    </span>
                                                    {scoreStatus === 'calculated' && improvement > 0 && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-emerald-500 border border-emerald-500/20">
                                                            <TrendingUp className="h-3 w-3" />
                                                            +{improvement} pts
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {scoreStatus === 'no_jd'
                                                        ? 'Resume edited in standalone mode. Add a target JD to evaluate ATS keyword match.'
                                                        : scoreStatus === 'calculating'
                                                            ? 'Scanning updated content against target job description requirements...'
                                                            : scoreStatus === 'error'
                                                                ? 'Could not connect to scoring service. Your resume content is safe.'
                                                                : 'Evaluated across 4 diagnostic competency pillars against JD requirements.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <ScoreGapAnalysis
                                        scoreNumber={afterScoreNumber}
                                        scoreResponse={tailoredScore}
                                        scoreStatus={scoreStatus}
                                        onRetry={recalculateScore}
                                    />

                                    {scoreStatus === 'calculated' && tailoredScore?.breakdown && (
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2 text-xs">
                                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                                                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                                                Strongest Sections
                                            </span>
                                            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                                                {(tailoredScore?.diagnostics?.strongestSections || ['Work Experience', 'Technical Skills']).map((sec, i) => (
                                                    <li key={i} className="flex items-center gap-1.5">
                                                        <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                                                        <span className="font-medium text-foreground">{sec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2 text-xs">
                                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                                                <Target className="h-3.5 w-3.5 text-amber-500" />
                                                Areas for Expansion
                                            </span>
                                            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                                                {(tailoredScore?.diagnostics?.weakestSections || [
                                                    { section: 'Projects', reason: 'Feature projects matching target stack' },
                                                ]).slice(0, 2).map((w, i) => (
                                                    <li key={i} className="space-y-0.5">
                                                        <span className="font-medium text-foreground">{w.section}</span>
                                                        <p className="text-[10px] text-muted-foreground">{w.reason}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Verification trust badges */}
                                    <div className="rounded-xl border border-border bg-card/40 p-3 space-y-2 text-xs">
                                        <div className="flex items-start gap-2">
                                            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-foreground">Factual Truth & Evidence Safety</strong>
                                                <p className="text-[10px] text-muted-foreground">Candidate employers, degrees, and timelines are 100% authentic with zero unsupported claims.</p>
                                            </div>
                                        </div>
                                        {tailoredScore?.diagnostics?.keywordDensity && (
                                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
                                                <span className="font-mono text-muted-foreground">Keyword Density / Relevance:</span>
                                                <span className="font-mono font-semibold text-emerald-500">
                                                    {tailoredScore.diagnostics.keywordDensity.rating.toUpperCase()} ({tailoredScore.diagnostics.keywordDensity.score}%)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* ── TAB 2: Skills & Keywords ── */}
                                <TabsContent value="keywords" className="space-y-4 mt-4">
                                    <SkillsRationaleList
                                        auditTrailSkills={generatedResume?.auditTrail?.skillsAdded}
                                        tailoredScore={tailoredScore}
                                        isScoring={scoreStatus === 'calculating'}
                                    />
                                    <JdEvidenceMap
                                        alignmentMap={generatedResume?.auditTrail?.jdAlignmentMap}
                                        atsSummary={generatedResume?.atsAlignmentSummary}
                                    />
                                </TabsContent>

                                {/* ── TAB 3: AI Bullet Diffs ── */}
                                <TabsContent value="diff" className="space-y-3 mt-4">
                                    <BulletDiffViewer
                                        bullets={explainableBullets}
                                        revertedBullets={revertedBullets}
                                        onToggleRevert={handleToggleRevert}
                                    />
                                </TabsContent>

                                {/* ── TAB 4: Edit Resume (Compact, Non-Scrolling Layout) ── */}
                                <TabsContent value="edit" className="mt-4">
                                    <div className="space-y-4">
                                        {/* Compact Resume Editor with Sticky Navigator */}
                                        <CompactResumeEditor />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
