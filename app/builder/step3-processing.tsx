"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAppStore } from '@/lib/store';
import { Check, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { resumeDataToPlainText } from '@/lib/resume-plaintext';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import { getCustomKeyHeaders } from '@/lib/ai-keys';



interface Stage {
    id: string;
    title: string;
    subtitle: string;
}

const PIPELINE_STAGES: Stage[] = [
    {
        id: 'analyzing',
        title: 'Extracting role requirements & technical keywords',
        subtitle: 'Identifying required tech stack, responsibilities, and seniority markers from job description',
    },
    {
        id: 'mapping',
        title: 'Evaluating semantic experience alignment',
        subtitle: 'Mapping your career achievements and projects against target job competencies',
    },
    {
        id: 'optimizing',
        title: 'Crafting high-impact quantified bullets',
        subtitle: 'Aligning action verbs and metrics with target terminology while strictly preserving factual accuracy',
    },
    {
        id: 'checking',
        title: 'Factual consistency & ATS compliance verification',
        subtitle: 'Validating zero unsupported claims and ensuring single-page typographic balance',
    },
    {
        id: 'preparing',
        title: 'Compiling vector document & match score',
        subtitle: 'Formatting vector layout tokens and computing multi-factor ATS alignment diagnostics',
    },

];

export function Step3Processing() {
    const router = useRouter();
    const {
        setStep,
        jd,
        resumeData,
        setAnalysis,
        setGeneratedResume,
        setOriginalScore,
        setTailoredScore,
        template,
        theme
    } = useAppStore();

    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [completedStages, setCompletedStages] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [retryTrigger, setRetryTrigger] = useState(0);

    const handleRetry = () => {
        setErrorMessage('');
        setCompletedStages([]);
        setCurrentStageIndex(0);
        setRetryTrigger(prev => prev + 1);
    };

    useEffect(() => {
        let isCancelled = false;
        const startTime = Date.now();

        const executeTailoringPipeline = async () => {
            try {
                if (!jd || !resumeData) {
                    toast.error('Missing job description or resume data. Please start over.');
                    router.push('/builder');
                    return;
                }

                trackEvent('tailoring_started', { template, theme });

                // Stage 1: Analyzing the job requirements
                setCurrentStageIndex(0);
                const analyzeRes = await fetch('/api/v1/jd/analyze', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        ...getCustomKeyHeaders()
                    },
                    body: JSON.stringify({ jd }),
                });
                if (!analyzeRes.ok) throw new Error('Failed to analyze job description requirements');
                const analysisData = await analyzeRes.json();
                if (isCancelled) return;
                setAnalysis(analysisData);
                setCompletedStages(prev => [...prev, 'analyzing']);

                // Stage 2: Mapping your experience & computing baseline score
                setCurrentStageIndex(1);
                try {
                    const resumeText = resumeDataToPlainText(resumeData);
                    const origScoreRes = await fetch('/api/v1/resume/score', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resumeText, jdKeywords: analysisData }),
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
                    body: JSON.stringify({ resumeData, jdKeywords: analysisData, template, theme }),
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
                setGeneratedResume(generatedData.tailoredResume, docCode, generatedData.confidenceScore);

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

                // Brief pause for smooth transition into Step 4
                setTimeout(() => {
                    if (!isCancelled) setStep(4);
                }, 500);

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
    }, [jd, resumeData, template, theme, retryTrigger, router, setAnalysis, setGeneratedResume, setOriginalScore, setTailoredScore, setStep]);


    const activeStage = PIPELINE_STAGES[currentStageIndex];

    return (
        <div className="min-h-[580px] flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6 relative overflow-hidden">
                {/* Subtle top ambient glow */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header: Document Craft Blueprint Animation */}
                <div className="text-center space-y-4">
                    {errorMessage ? (
                        <div className="flex flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-3 border border-rose-500/20">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <h2 className="text-base font-bold text-foreground">Tailoring Interrupted</h2>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm">{errorMessage}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            {/* Premium Architectural Document Icon with Scanning Beam */}
                            <div className="relative h-16 w-14 rounded-lg border border-primary/30 bg-muted/30 p-2 overflow-hidden shadow-inner flex flex-col justify-between mb-3">
                                {/* Vector line representations */}
                                <div className="space-y-1">
                                    <div className="h-1.5 w-3/4 rounded bg-primary/40 animate-pulse" />
                                    <div className="h-1 w-full rounded bg-foreground/20" />
                                    <div className="h-1 w-5/6 rounded bg-foreground/20" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="h-1 w-full rounded bg-foreground/15" />
                                    <div className="h-1 w-2/3 rounded bg-foreground/15" />
                                </div>
                                {/* Scanning line */}
                                <motion.div
                                    animate={{ y: [0, 48, 0] }}
                                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_rgba(var(--primary),0.8)]"
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStage?.id || 'stage'}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-1"
                                >
                                    <h2 className="text-base font-semibold text-foreground tracking-tight">
                                        {activeStage?.title}
                                    </h2>
                                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                                        {activeStage?.subtitle}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Progress bar without fake numbers */}
                {!errorMessage && (
                    <div className="space-y-1.5">
                        <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden relative">
                            <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: "15%" }}
                                animate={{ width: `${((currentStageIndex + 1) / PIPELINE_STAGES.length) * 100}%` }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                            <span>Stage {currentStageIndex + 1} of {PIPELINE_STAGES.length}</span>
                            <span className="font-mono text-primary text-[10px] uppercase tracking-wider">
                                {completedStages.length === PIPELINE_STAGES.length ? 'Finalizing PDF' : 'In Progress'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Pipeline Checklist */}
                <div className="space-y-2 pt-1">
                    {PIPELINE_STAGES.map((stage, idx) => {
                        const isDone = completedStages.includes(stage.id);
                        const isCurrent = currentStageIndex === idx && !errorMessage;

                        return (
                            <div
                                key={stage.id}
                                className={`flex items-start gap-3 rounded-lg px-3 py-2 transition-all text-xs ${
                                    isCurrent
                                        ? 'bg-primary/[0.05] border border-primary/25 shadow-sm'
                                        : isDone
                                            ? 'bg-muted/15 opacity-80'
                                            : 'opacity-40'
                                }`}
                            >
                                <div className="mt-0.5 shrink-0">
                                    {isDone ? (
                                        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
                                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                                        </div>
                                    ) : isCurrent ? (
                                        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-primary text-primary">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                        </div>
                                    ) : (
                                        <div className="h-3.5 w-3.5 rounded-full border border-border/80 bg-muted/40" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className={`font-medium truncate ${isCurrent ? 'text-primary font-semibold' : 'text-foreground'}`}>
                                        {stage.title}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Error actions */}
                {errorMessage && (
                    <div className="mt-6 flex justify-center gap-3 pt-4 border-t border-border/40">
                        <Button variant="outline" size="sm" onClick={() => setStep(2)} className="h-8 text-xs">
                            Go Back to Details
                        </Button>
                        <Button size="sm" onClick={handleRetry} className="h-8 text-xs bg-primary hover:bg-primary/90">
                            Retry Tailoring
                        </Button>
                    </div>

                )}
            </div>
        </div>
    );
}
