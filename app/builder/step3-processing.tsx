"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAppStore } from '@/lib/store';
import { 
    AlertCircle, 
    Search, 
    Cpu, 
    Sparkles, 
    ShieldCheck, 
    FileCode2, 
    Check, 
    RotateCcw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { resumeDataToPlainText } from '@/lib/resume-plaintext';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import { getCustomKeyHeaders } from '@/lib/ai-keys';
import { Step3CompilingAnimation } from '@/components/step3-compiling-animation';

interface Stage {
    id: string;
    stepNumber: string;
    title: string;
    shortTitle: string;
    subtitle: string;
    tag: string;
    icon: React.ComponentType<{ className?: string }>;
}

const PIPELINE_STAGES: Stage[] = [
    {
        id: 'analyzing',
        stepNumber: '01',
        title: 'Job Requirements & Keyword Analysis',
        shortTitle: 'Role Requirements & Keywords',
        subtitle: 'Extracting tech stacks, seniority markers, and ATS priority keywords from your target job description.',
        tag: 'JD ANALYSIS',
        icon: Search,
    },
    {
        id: 'mapping',
        stepNumber: '02',
        title: 'Experience Alignment & Competency Mapping',
        shortTitle: 'Experience Semantic Alignment',
        subtitle: 'Cross-referencing your career achievements against role requirements to calculate your baseline match.',
        tag: 'EXPERIENCE MATCH',
        icon: Cpu,
    },
    {
        id: 'optimizing',
        stepNumber: '03',
        title: 'Impact Metric & Language Optimization',
        shortTitle: 'Quantified Impact Tuning',
        subtitle: 'Tailoring action verbs, scope, and measurable outcomes to mirror target job demands clearly.',
        tag: 'IMPACT TUNING',
        icon: Sparkles,
    },
    {
        id: 'checking',
        stepNumber: '04',
        title: 'Factual Integrity & Accuracy Audit',
        shortTitle: 'Factual Consistency Audit',
        subtitle: 'Auditing all claims against your source background — guaranteeing zero fabricated dates or skills.',
        tag: 'ACCURACY AUDIT',
        icon: ShieldCheck,
    },
    {
        id: 'preparing',
        stepNumber: '05',
        title: 'Document Assembly & Final Formatting',
        shortTitle: 'Document Assembly',
        subtitle: 'Compiling layout tokens and preparing the final Typst document for PDF generation.',
        tag: 'DOCUMENT BUILD',
        icon: FileCode2,
    },
];

export function Step3Processing() {
    const router = useRouter();
    const setStep = useAppStore((s) => s.setStep);
    const jd = useAppStore((s) => s.jd);
    const resumeData = useAppStore((s) => s.resumeData);
    const setAnalysis = useAppStore((s) => s.setAnalysis);
    const setGeneratedResume = useAppStore((s) => s.setGeneratedResume);
    const setOriginalScore = useAppStore((s) => s.setOriginalScore);
    const setTailoredScore = useAppStore((s) => s.setTailoredScore);
    const template = useAppStore((s) => s.template);
    const theme = useAppStore((s) => s.theme);
    const tailorMode = useAppStore((s) => s.tailorMode);

    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [completedStages, setCompletedStages] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [retryTrigger, setRetryTrigger] = useState(0);

    const handleRetry = () => {
        setErrorMessage(null);
        setCurrentStageIndex(0);
        setCompletedStages([]);
        setRetryTrigger(prev => prev + 1);
    };

    useEffect(() => {
        let isCancelled = false;

        const executeTailoringPipeline = async () => {
            if (!jd || !resumeData) {
                router.push('/builder');
                return;
            }

            const startTime = Date.now();
            trackEvent('tailoring_started', { template, theme });

            try {
                // Stage 1: Analyzing Job Description
                setCurrentStageIndex(0);
                const analyzeRes = await fetch('/api/v1/resume/analyze-jd', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        ...getCustomKeyHeaders()
                    },
                    body: JSON.stringify({ jd }),
                });

                if (!analyzeRes.ok) throw new Error('Failed to extract target role keywords');
                const analysisData = await analyzeRes.json();
                if (isCancelled) return;
                setAnalysis(analysisData);
                setCompletedStages(prev => [...prev, 'analyzing']);

                // Stage 2: Semantic Mapping & Baseline Score
                setCurrentStageIndex(1);
                try {
                    const origText = resumeDataToPlainText(resumeData);
                    const origScoreRes = await fetch('/api/v1/resume/score', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resumeText: origText, jdKeywords: analysisData }),
                    });
                    if (origScoreRes.ok && !isCancelled) {
                        setOriginalScore(await origScoreRes.json());
                    }
                } catch {
                    // Non-critical baseline
                }
                if (isCancelled) return;
                setCompletedStages(prev => [...prev, 'mapping']);

                // Stage 3: Optimizing terminology & impact metrics
                setCurrentStageIndex(2);
                const generateRes = await fetch('/api/v1/resume/tailor', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        ...getCustomKeyHeaders()
                    },
                    body: JSON.stringify({ resumeData, jdKeywords: analysisData, template, theme, tailorMode }),
                });

                if (!generateRes.ok) throw new Error('Failed to tailor experience bullets');
                const generatedData = await generateRes.json();
                if (isCancelled) return;
                setCompletedStages(prev => [...prev, 'optimizing']);

                // Stage 4: Checking for unsupported claims
                setCurrentStageIndex(3);
                await new Promise(resolve => setTimeout(resolve, 450));
                if (isCancelled) return;
                setCompletedStages(prev => [...prev, 'checking']);

                // Stage 5: Preparing your resume document
                setCurrentStageIndex(4);
                const docCode = generatedData.typstCode || '';
                setGeneratedResume(generatedData.tailoredResume, docCode, generatedData.confidenceScore, generatedData.auditTrail);

                // Final score compute
                try {
                    const tailoredText = resumeDataToPlainText(generatedData.tailoredResume);
                    const tailScoreRes = await fetch('/api/v1/resume/score', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resumeText: tailoredText, jdKeywords: analysisData }),
                    });
                    if (tailScoreRes.ok && !isCancelled) {
                        setTailoredScore(await tailScoreRes.json());
                    }
                } catch {
                    // Non-critical
                }
                if (isCancelled) return;
                setCompletedStages(prev => [...prev, 'preparing']);

                trackEvent('tailoring_completed', {
                    template,
                    theme,
                    durationMs: Date.now() - startTime,
                });

                // Smooth transition into Step 4
                setTimeout(() => {
                    if (!isCancelled) setStep(4);
                }, 600);

            } catch (error) {
                if (isCancelled) return;
                console.error('Pipeline error:', error);
                const msg = error instanceof Error ? error.message : 'Unknown error during tailoring';
                setErrorMessage(msg);
                toast.error(msg);
                trackEvent('tailoring_failed', { error: msg });
            }
        };

        executeTailoringPipeline();

        return () => {
            isCancelled = true;
        };
    }, [jd, resumeData, template, theme, tailorMode, retryTrigger, router, setAnalysis, setGeneratedResume, setOriginalScore, setTailoredScore, setStep]);

    const activeStage = PIPELINE_STAGES[currentStageIndex];

    return (
        <div className="relative min-h-[720px] max-w-5xl mx-auto flex flex-col items-center justify-center p-4 py-8">
            {/* Ambient Radial Bloom (Homepage Hero Glow) */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-b from-primary/20 via-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="text-center space-y-3 pb-6 relative z-10">

                <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
                    Tailoring Your Resume
                </h1>

                <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    Aligning your experience with the role, refining impact, and auditing every claim for accuracy.
                </p>
            </div>

            {/* Main Unified Arena Panel */}
            <div className="w-full max-w-2xl rounded-3xl glass-lg p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 overflow-hidden">
                {/* Visual Holographic Core Animation */}
                {errorMessage ? (
                    <div className="flex flex-col items-center py-6 space-y-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/25 shadow-inner">
                            <AlertCircle className="h-8 w-8" />
                        </div>
                        <div className="space-y-1 text-center">
                            <h2 className="text-base font-bold text-foreground">Tailoring Pipeline Paused</h2>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">{errorMessage}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <Step3CompilingAnimation
                            stageIndex={currentStageIndex}
                            stageId={activeStage?.id || 'stage'}
                        />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStage?.id || 'stage'}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-1.5"
                            >
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/60 dark:bg-white/5 border border-border/60 dark:border-white/10 text-[10px] font-mono font-medium text-muted-foreground">
                                    <span>STAGE {activeStage?.stepNumber} / 05</span>
                                    <span>•</span>
                                    <span className="text-primary font-semibold">{activeStage?.tag}</span>
                                </div>

                                <h2 className="text-lg sm:text-xl font-bold font-display text-foreground tracking-tight">
                                    {activeStage?.title}
                                </h2>

                                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                                    {activeStage?.subtitle}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}

                {/* Precision Progress Bar */}
                {!errorMessage && (
                    <div className="space-y-2 pt-2">
                        <div className="h-2 w-full rounded-full bg-muted/60 dark:bg-white/5 overflow-hidden relative border border-border/40 dark:border-white/10 p-0.5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary via-cyan-400 to-primary rounded-full shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                                initial={{ width: "15%" }}
                                animate={{ width: `${((currentStageIndex + 1) / PIPELINE_STAGES.length) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>

                        <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-muted-foreground text-[11px]">
                                Step {currentStageIndex + 1} of {PIPELINE_STAGES.length}
                            </span>
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className="text-foreground font-bold">
                                    {Math.round(((currentStageIndex + 1) / PIPELINE_STAGES.length) * 100)}%
                                </span>
                                <span className="text-primary font-medium text-[10px] tracking-wider uppercase">
                                    {completedStages.length === PIPELINE_STAGES.length ? 'Finalizing' : 'Processing'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pipeline Checklist */}
                <div className="space-y-2 pt-1">
                    {PIPELINE_STAGES.map((stage, idx) => {
                        const isDone = completedStages.includes(stage.id);
                        const isCurrent = currentStageIndex === idx && !errorMessage;
                        const StageIcon = stage.icon;

                        return (
                            <div
                                key={stage.id}
                                className={`flex items-center justify-between gap-3.5 rounded-xl px-3.5 py-2.5 transition-all text-xs border ${
                                    isCurrent
                                        ? 'bg-primary/[0.08] dark:bg-primary/[0.12] border-primary/40 shadow-xs ring-1 ring-primary/25'
                                        : isDone
                                            ? 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.05] border-emerald-500/20'
                                            : 'bg-muted/10 dark:bg-white/[0.01] border-border/40 dark:border-white/5 opacity-40'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {/* Icon Badge */}
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                        isDone
                                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                                            : isCurrent
                                                ? 'bg-primary/20 border border-primary/40 text-primary'
                                                : 'bg-muted/40 dark:bg-white/5 border border-border/60 text-muted-foreground'
                                    }`}>
                                        {isDone ? (
                                            <Check className="h-4 w-4 stroke-[3]" />
                                        ) : (
                                            <StageIcon className={`h-4 w-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                                        )}
                                    </div>

                                    {/* Title */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[10px] text-muted-foreground">
                                                {stage.stepNumber}
                                            </span>
                                            <span className={`font-medium truncate ${
                                                isCurrent 
                                                    ? 'text-foreground font-semibold' 
                                                    : isDone 
                                                        ? 'text-foreground/90' 
                                                        : 'text-muted-foreground'
                                            }`}>
                                                {stage.shortTitle}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Tag */}
                                <div className="shrink-0">
                                    {isDone ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                            <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                                            DONE
                                        </span>
                                    ) : isCurrent ? (
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/30 shadow-[0_0_8px_rgba(56,189,248,0.25)]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                                            ACTIVE
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-mono text-muted-foreground/60 px-2 py-0.5">
                                            QUEUED
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Error actions */}
                {errorMessage && (
                    <div className="mt-6 flex justify-center gap-3 pt-4 border-t border-border/40">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStep(2)}
                            className="h-9 text-xs rounded-xl border-border/70 dark:border-white/10 gap-1.5"
                        >
                            Back to Details
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleRetry}
                            className="h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-xl shadow-xs"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retry Tailoring</span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
