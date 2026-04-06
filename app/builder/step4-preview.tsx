"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { PdfPreview } from '@/components/pdf-preview';
import { ResumeForm } from '@/components/resume-form';
import { TemplateSelector } from '@/components/template-selector';
import { SectionOrderEditor } from '@/components/section-order-editor';
import { AuthGuardCard } from '@/components/auth-guard-card';
import { useAuth } from '@/components/auth-provider';
import {
    ArrowLeft,
    Edit2,
    TrendingUp,
    TrendingDown,
    Target,
    CheckCircle2,
    XCircle,
    Minus,
    Sparkles,
} from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateLatex } from '@/lib/latex-generator';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MatchBreakdownEntry, MatchCategoryKey } from '@/lib/match-score-types';
import { estimateResumeVolume, getTemplateFitCopy, getTemplateFitLevel } from '@/lib/latex-layout';
import { Badge } from '@/components/ui/badge';

const CATEGORY_LABEL: Record<MatchCategoryKey, string> = {
    required_skills: 'Required skills',
    preferred_skills: 'Preferred skills',
    responsibilities: 'Responsibilities',
    buzzwords: 'Buzzwords',
};

function ScoreRing({
    value,
    label,
    size = 100,
    gradKey,
}: {
    value: number;
    label: string;
    size?: number;
    gradKey: string;
}) {
    const pct = Math.round(value * 100);
    const r = (size - 12) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - value);
    const color = pct >= 80 ? 'text-green-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500';
    const gradientId = `grad-${gradKey}`;
    const gradientColors =
        pct >= 80
            ? { from: '#22c55e', to: '#4ade80' }
            : pct >= 50
              ? { from: '#eab308', to: '#facc15' }
              : { from: '#ef4444', to: '#f87171' };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={gradientColors.from} />
                            <stop offset="100%" stopColor={gradientColors.to} />
                        </linearGradient>
                    </defs>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={6}
                        className="text-muted/30"
                    />
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        strokeWidth={6}
                        strokeLinecap="round"
                        stroke={`url(#${gradientId})`}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        strokeDasharray={circ}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn('text-2xl font-bold', color)}>{pct}%</span>
                </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
    );
}

const DEFAULT_WEIGHT: Record<MatchCategoryKey, number> = {
    required_skills: 40,
    preferred_skills: 20,
    responsibilities: 25,
    buzzwords: 15,
};

function BreakdownRow({
    catKey,
    after,
    before,
}: {
    catKey: MatchCategoryKey;
    after: MatchBreakdownEntry;
    before?: MatchBreakdownEntry;
}) {
    const color =
        after.ratio >= 80 ? 'bg-green-500' : after.ratio >= 50 ? 'bg-yellow-500' : 'bg-red-500';
    const weight = after.weightPercent ?? DEFAULT_WEIGHT[catKey];
    const wc =
        after.weightedContribution ?? (after.ratio / 100) * (weight / 100);
    const pts = Math.round(wc * 100);
    const delta =
        before !== undefined && typeof before.ratio === 'number' ? after.ratio - before.ratio : null;

    return (
        <div className="space-y-1.5 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                <span className="text-xs font-medium text-foreground">{CATEGORY_LABEL[catKey]}</span>
                <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold tabular-nums">{after.ratio}%</span>
                    {delta !== null && delta !== 0 && (
                        <span
                            className={cn(
                                'inline-flex items-center gap-0.5 font-medium tabular-nums',
                                delta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                            )}
                        >
                            {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {delta > 0 ? '+' : ''}
                            {delta}%
                        </span>
                    )}
                    {delta === 0 && before !== undefined && (
                        <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                            <Minus className="h-3 w-3" /> 0%
                        </span>
                    )}
                </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                    className={cn('h-full rounded-full', color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${after.ratio}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
            <p className="text-[11px] leading-snug text-muted-foreground">
                Worth <span className="font-medium text-foreground">{weight}%</span> of the overall match. This
                category currently adds{' '}
                <span className="font-medium text-foreground">{pts}</span> points toward your score (out of{' '}
                {weight} possible from this bucket). Tailoring that surfaces more JD phrases here raises this
                number.
            </p>
        </div>
    );
}

function diffKeywords(before: MatchBreakdownEntry | undefined, after: MatchBreakdownEntry) {
    const bM = new Set(before?.matched ?? []);
    const aM = new Set(after.matched);
    const gained = [...aM].filter((x) => !bM.has(x));
    const lost = [...bM].filter((x) => !aM.has(x));
    return { gained, lost };
}

const CATEGORY_KEYS: MatchCategoryKey[] = [
    'required_skills',
    'preferred_skills',
    'responsibilities',
    'buzzwords',
];

function getBulletSignals(data: NonNullable<ReturnType<typeof useAppStore.getState>['resumeData']>) {
    const bullets = [
        ...data.experience.flatMap((item) => item.bullets),
        ...data.internships.flatMap((item) => item.bullets),
        ...data.projects.flatMap((item) => item.bullets),
    ].filter(Boolean);

    const findings: string[] = [];
    const longBullet = bullets.find((bullet) => bullet.length > 185);
    if (longBullet) findings.push('A few bullets are too long. Try keeping each bullet closer to 1-2 lines.');

    const lowImpact = bullets.find((bullet) => !/\d|%|\$|x|ms|million|kpi|uptime|users/i.test(bullet));
    if (lowImpact) findings.push('Some bullets do not show measurable impact yet. Add numbers, scale, or outcomes where possible.');

    const weakVerb = bullets.find((bullet) => /^(worked on|helped|responsible for|involved in)/i.test(bullet.trim()));
    if (weakVerb) findings.push('A few bullets use soft opening verbs. Prefer stronger action verbs like Built, Reduced, Led, Improved, Automated.');

    return findings.slice(0, 3);
}

export function Step4Preview() {
    const { setStep, resumeData, generatedResume, setGeneratedResume, template, originalScore, tailoredScore } =
        useAppStore();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [layoutSheetOpen, setLayoutSheetOpen] = useState(false);
    const { user } = useAuth();

    const confidenceScore = generatedResume?.confidenceScore || 0;

    useEffect(() => {
        if (!resumeData) return;
        const prev = useAppStore.getState().generatedResume;
        const newLatex = generateLatex(resumeData, template);
        setGeneratedResume(resumeData, newLatex, prev?.confidenceScore ?? 0);
    }, [template, resumeData, setGeneratedResume]);

    const handleSheetOpenChange = (open: boolean) => {
        if (!open && resumeData) {
            const newLatex = generateLatex(resumeData, template);
            setGeneratedResume(resumeData, newLatex, confidenceScore);
        }
        setSheetOpen(open);
    };

    const beforeScore = originalScore?.score ?? 0;
    const afterScore = tailoredScore?.score ?? confidenceScore;
    const improvement = Math.round((afterScore - beforeScore) * 100);
    const currentData = generatedResume?.data ?? resumeData;
    const templateFit = currentData ? getTemplateFitLevel(currentData, template) : null;
    const templateFitCopy = templateFit ? getTemplateFitCopy(templateFit) : null;
    const resumeVolume = currentData ? estimateResumeVolume(currentData) : 0;
    const bulletSignals = currentData ? getBulletSignals(currentData) : [];

    const tabDefault = useMemo(() => {
        const tb = tailoredScore?.breakdown;
        if (!tb) return 'required_skills';
        const weakest = CATEGORY_KEYS.reduce((a, k) => (tb[k].ratio < tb[a].ratio ? k : a), 'required_skills');
        return weakest;
    }, [tailoredScore?.breakdown]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Final Resume</h2>
                        <p className="text-sm text-muted-foreground">Switch templates or make edits.</p>
                    </div>
                    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
                        <div className="flex items-center gap-2">
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                                </Button>
                            </SheetTrigger>
                            <Sheet open={layoutSheetOpen} onOpenChange={setLayoutSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Customize Layout
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[360px] sm:w-[420px] overflow-y-auto">
                                    <SheetHeader className="mb-6">
                                        <SheetTitle>Customize Layout</SheetTitle>
                                        <SheetDescription>Reorder sections and control the flow of the final LaTeX resume.</SheetDescription>
                                    </SheetHeader>
                                    <SectionOrderEditor />
                                    <div className="mt-4 flex justify-end">
                                        <Button onClick={() => setLayoutSheetOpen(false)}>Apply Changes</Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <SheetTitle>Edit Resume Details</SheetTitle>
                                <SheetDescription>Changes update the preview on save.</SheetDescription>
                            </SheetHeader>
                            <ResumeForm />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="rounded-xl border bg-card p-4 transition-all duration-300 hover:border-primary/25 hover:shadow-md hover:shadow-primary/5">
                    <TemplateSelector />
                </div>

                {templateFitCopy ? (
                    <div className="rounded-xl border bg-card p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold">Layout outlook</h3>
                                <p className="text-sm text-muted-foreground">
                                    {templateFitCopy.detail}. Resume volume score: {resumeVolume}.
                                </p>
                            </div>
                            <Badge
                                variant={
                                    templateFit === 'recommended'
                                        ? 'default'
                                        : templateFit === 'multi_page_risk'
                                          ? 'destructive'
                                          : 'secondary'
                                }
                                className={cn(
                                    templateFit === 'tight' && 'bg-amber-500/10 text-amber-700 border-amber-200',
                                    templateFit === 'good' && 'bg-slate-500/10 text-slate-700 border-slate-200'
                                )}
                            >
                                {templateFitCopy.label}
                            </Badge>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                            If you add more projects, certifications, or long bullets, switch toward `compact`, `classic`, or `ats`
                            before export.
                        </p>
                    </div>
                ) : null}

                {bulletSignals.length > 0 ? (
                    <div className="rounded-xl border bg-card p-4">
                        <h3 className="text-sm font-semibold">Bullet feedback</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Quick heuristics on the current resume content.
                        </p>
                        <div className="mt-3 space-y-2">
                            {bulletSignals.map((signal) => (
                                <div key={signal} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                    {signal}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {!user ? <AuthGuardCard /> : null}

                <PdfPreview />

                <div className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                        Start Over
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-5 space-y-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                >
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm">Match score</h3>
                    </div>

                    <div className="flex justify-center gap-6">
                        <ScoreRing value={beforeScore} label="Before tailor" size={90} gradKey="before" />
                        <ScoreRing value={afterScore} label="After tailor" size={90} gradKey="after" />
                    </div>

                    <div className="text-center">
                        <p className="text-xl font-semibold">
                            {Math.round(afterScore * 100)}% {afterScore >= 0.8 ? 'Strong match' : afterScore >= 0.6 ? 'Good match' : 'Needs work'}
                        </p>
                        <p className="text-xs text-muted-foreground">Score combines skills, responsibilities, preferred terms, and resume wording alignment.</p>
                    </div>

                    {originalScore && tailoredScore && (
                        <div
                            className={cn(
                                'flex items-center justify-center gap-1.5 text-sm font-medium',
                                improvement > 0 && 'text-green-600 dark:text-green-400',
                                improvement < 0 && 'text-red-600 dark:text-red-400',
                                improvement === 0 && 'text-muted-foreground',
                            )}
                        >
                            {improvement > 0 && (
                                <>
                                    <TrendingUp className="h-4 w-4" />+{improvement}% improvement (better keyword alignment)
                                </>
                            )}
                            {improvement < 0 && (
                                <>
                                    <TrendingDown className="h-4 w-4" />
                                    {improvement}% change after tailoring
                                </>
                            )}
                            {improvement === 0 && (
                                <>
                                    <Minus className="h-4 w-4" />
                                    No change vs original (keywords already aligned)
                                </>
                            )}
                        </div>
                    )}

                    <p className="text-[11px] text-muted-foreground leading-relaxed text-center px-1">
                        Scores compare your resume text to the JD keywords we extracted (required skills 40%,
                        responsibilities 25%, preferred skills 20%, buzzwords 15%). Editing content or the JD
                        changes which phrases count as matched.
                    </p>
                </motion.div>

                {tailoredScore?.breakdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-5 space-y-3 transition-all duration-300 hover:border-primary/25 hover:shadow-md hover:shadow-primary/8"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-sm">Why your score looks like this</h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Each block shows one JD bucket, its weight in the total score, and how much the tailored version improved it.
                        </p>
                        <div className="space-y-2">
                            {CATEGORY_KEYS.map((k) => (
                                <BreakdownRow
                                    key={k}
                                    catKey={k}
                                    after={tailoredScore.breakdown[k] as MatchBreakdownEntry}
                                    before={originalScore?.breakdown?.[k] as MatchBreakdownEntry | undefined}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {tailoredScore?.breakdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-5 space-y-3 transition-all duration-300 hover:border-primary/25 hover:shadow-md hover:shadow-primary/8"
                    >
                        <h3 className="font-semibold text-sm">Keyword-level impact</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            <span className="text-green-600 dark:text-green-400 font-medium">Newly matched</span>{' '}
                            phrases appeared after tailoring.
                            <span className="text-amber-600 dark:text-amber-400 font-medium"> Regressed</span> ones
                            were in the original resume text but missing after edits (rare).
                        </p>

                        <Tabs defaultValue={tabDefault} className="w-full">
                            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
                                {CATEGORY_KEYS.map((k) => (
                                    <TabsTrigger
                                        key={k}
                                        value={k}
                                        className="text-[10px] px-2 py-1.5 shrink-0 data-[state=active]:bg-background"
                                    >
                                        {CATEGORY_LABEL[k].split(' ')[0]}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {CATEGORY_KEYS.map((k) => {
                                const after = tailoredScore.breakdown[k] as MatchBreakdownEntry;
                                const before = originalScore?.breakdown?.[k] as MatchBreakdownEntry | undefined;
                                const { gained, lost } = diffKeywords(before, after);
                                return (
                                    <TabsContent key={k} value={k} className="mt-3 space-y-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {gained.map((kw) => (
                                                <span
                                                    key={`g-${kw}`}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-400 text-[11px] font-medium border border-green-500/20"
                                                >
                                                    <TrendingUp className="h-3 w-3" /> {kw}
                                                </span>
                                            ))}
                                            {lost.map((kw) => (
                                                <span
                                                    key={`l-${kw}`}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-400 text-[11px] font-medium border border-amber-500/20"
                                                >
                                                    <TrendingDown className="h-3 w-3" /> {kw}
                                                </span>
                                            ))}
                                            {gained.length === 0 && lost.length === 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    No keyword-level change in this bucket compared to your original
                                                    parsed resume.
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Currently matched in resume
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {after.matched.map((kw) => (
                                                    <span
                                                        key={kw}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[11px] font-medium"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3" /> {kw}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground pt-1">
                                                Still missing from resume
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {after.missing.map((kw) => (
                                                    <span
                                                        key={kw}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-medium"
                                                    >
                                                        <XCircle className="h-3 w-3" /> {kw}
                                                    </span>
                                                ))}
                                            </div>
                                            {after.missing.slice(0, 2).map((kw) => (
                                                <div key={`suggest-${kw}`} className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                                                    Add <span className="font-medium text-foreground">{kw}</span> to improve score in this bucket.
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                );
                            })}
                        </Tabs>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
