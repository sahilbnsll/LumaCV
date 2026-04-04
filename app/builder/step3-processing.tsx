"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { resumeDataToPlainText } from '@/lib/resume-plaintext';

const stages = [
    { key: 'analyzing', label: 'Analyzing Job Description', sub: 'Extracting keywords and requirements' },
    { key: 'tailoring', label: 'Tailoring Your Resume', sub: 'Optimizing bullet points and skills' },
    { key: 'compiling', label: 'Finalizing Document', sub: 'Generating PDF-ready LaTeX' },
    { key: 'complete', label: 'Ready!', sub: 'Redirecting to preview...' },
];

export function Step3Processing() {
    const router = useRouter();
    const { setStep, jd, resumeData, setAnalysis, setGeneratedResume, setOriginalScore, setTailoredScore, template } = useAppStore();

    const [status, setStatus] = useState<'analyzing' | 'tailoring' | 'compiling' | 'complete' | 'error'>('analyzing');
    const [progress, setProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const hasStarted = useRef(false);

    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;

        const processResume = async () => {
            try {
                if (!jd || !resumeData) {
                    toast.error('Missing data. Please start over.');
                    router.push('/builder');
                    return;
                }

                setStatus('analyzing');
                setProgress(10);

                const analyzeRes = await fetch('/api/v1/jd/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jd }),
                });
                if (!analyzeRes.ok) throw new Error('Failed to analyze job description');
                const analysisData = await analyzeRes.json();
                setAnalysis(analysisData);
                setProgress(30);

                // Compute original score (before tailoring)
                try {
                    const resumeText = resumeDataToPlainText(resumeData);
                    const origScoreRes = await fetch('/api/v1/resume/score', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resumeText, jdKeywords: analysisData }),
                    });
                    if (origScoreRes.ok) {
                        setOriginalScore(await origScoreRes.json());
                    }
                } catch { /* non-critical */ }
                setProgress(40);

                setStatus('tailoring');
                setProgress(50);

                const generateRes = await fetch('/api/v1/resume/tailor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeData, jdKeywords: analysisData, template }),
                });
                if (!generateRes.ok) throw new Error('Failed to tailor resume');
                const generatedData = await generateRes.json();

                if (generatedData.confidenceScore < 0.5) {
                    toast.warning('Low confidence match. Manual review recommended.');
                }

                setStatus('compiling');
                setProgress(80);

                setGeneratedResume(generatedData.tailoredResume, generatedData.latexCode, generatedData.confidenceScore);

                // Compute tailored score (after)
                try {
                    const tailoredText = resumeDataToPlainText(generatedData.tailoredResume);
                    const tailScoreRes = await fetch('/api/v1/resume/score', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resumeText: tailoredText, jdKeywords: analysisData }),
                    });
                    if (tailScoreRes.ok) {
                        setTailoredScore(await tailScoreRes.json());
                    }
                } catch { /* non-critical */ }

                await new Promise(r => setTimeout(r, 600));
                setProgress(100);
                setStatus('complete');
                setTimeout(() => setStep(4), 800);

            } catch (error: unknown) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                setStatus('error');
                setErrorMsg(errorMessage);
                toast.error('Processing failed: ' + errorMessage);
            }
        };

        processResume();
    }, [jd, resumeData, template, setAnalysis, setGeneratedResume, setOriginalScore, setTailoredScore, setStep, router]);

    const currentStage = stages.find(s => s.key === status);

    return (
        <div className="max-w-lg mx-auto py-16 space-y-10">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                {status === 'complete' ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="flex justify-center">
                        <CheckCircle2 className="h-20 w-20 text-green-500" />
                    </motion.div>
                ) : status === 'error' ? (
                    <AlertCircle className="h-20 w-20 text-destructive mx-auto" />
                ) : (
                    <div className="flex justify-center relative">
                        <Loader2 className="h-20 w-20 text-primary animate-spin" />
                        <Sparkles className="h-6 w-6 text-primary absolute top-0 right-1/3 animate-pulse" />
                    </div>
                )}

                <div>
                    <h2 className="text-2xl font-bold">{status === 'error' ? 'Processing Failed' : currentStage?.label}</h2>
                    <p className="text-muted-foreground mt-2">{status === 'error' ? errorMsg : currentStage?.sub}</p>
                </div>
            </motion.div>

            <div className="space-y-3">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
            </div>

            {status === 'error' && (
                <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => setStep(2)}>Go Back</Button>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            )}
        </div>
    );
}
