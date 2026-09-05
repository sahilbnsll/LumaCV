"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    FileText,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    FileCheck2,
    FileUp,
    ShieldCheck,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/components/auth-provider';
import { extractTextFromPdf } from '@/lib/pdf-parser';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import { getCustomKeyHeaders } from '@/lib/ai-keys';
import { DocumentScanner3D } from '@/components/document-scanner-3d';

const SAMPLE_JD = `Role: Senior Full Stack Engineer
Company: Stripe
Location: San Francisco, CA / Remote

About the Role:
We are looking for a Senior Full Stack Engineer to build and scale global payment infrastructure, developer interfaces, and real-time transaction dashboards. You will work across the stack using TypeScript, React/Next.js, Node.js, and PostgreSQL to deliver mission-critical software.

Responsibilities:
• Architect, build, and maintain high-performance web applications using modern React, Next.js App Router, and TypeScript.
• Collaborate with product and design teams to craft intuitive, accessible, and responsive user interfaces.
• Build reliable, secure backend APIs and microservices handling millions of financial events per day.
• Optimize application performance, improving p95 latency and client-side rendering efficiency.
• Participate in design reviews, uphold engineering standards, and mentor junior engineers.

Requirements:
• 4+ years of professional full-stack software engineering experience.
• Strong proficiency in TypeScript, modern JavaScript, React, and CSS architecture.
• Experience building and maintaining scalable REST or GraphQL APIs.
• Solid foundation in SQL, relational databases (PostgreSQL), and data modeling.
• Demonstrated understanding of distributed systems, caching strategies (Redis), and cloud infrastructure (AWS/GCP).
• Excellent communication skills and a user-centric mindset.`;

export function Step1JD() {
    const { user } = useAuth();
    const { jd, setJD, setFile, setExtractedText, setStep, setResumeDataFromParse, resumeData } = useAppStore();
    const [parseStage, setParseStage] = useState<'idle' | 'extracting' | 'mapping' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileSize, setFileSize] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!user) {
            toast.error('Please sign in to upload and parse your resume');
            return;
        }
        const file = acceptedFiles[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF documents are supported');
            return;
        }

        setFile(file);
        setFileName(file.name);
        setFileSize((file.size / 1024).toFixed(0) + ' KB');
        setParseStage('extracting');
        setStatusMessage('Reading your resume text...');

        try {
            const text = await extractTextFromPdf(file);
            setExtractedText(text);

            if (text.trim().length < 20) {
                setParseStage('error');
                toast.error('Could not extract text from this PDF. It might be scanned or protected.');
                return;
            }

            setParseStage('mapping');
            setStatusMessage('Analyzing your resume...');

            const response = await fetch('/api/v1/resume/parse', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getCustomKeyHeaders()
                },
                body: JSON.stringify({ extractedText: text }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                const detail = typeof payload?.details === 'string' ? payload.details : typeof payload?.error === 'string' ? payload.error : 'Parse failed';
                throw new Error(detail);
            }

            setResumeDataFromParse(payload);
            setParseStage('success');
            toast.success('Resume uploaded successfully');
            trackEvent('resume_uploaded', { fileName: file.name, fileSizeKb: (file.size / 1024).toFixed(0) });

        } catch (error) {
            console.error('Parse error:', error);
            setParseStage('error');
            const message = error instanceof Error ? error.message : 'Failed to parse resume';
            toast.error(message);
        }
    }, [setFile, setExtractedText, setResumeDataFromParse, user]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        disabled: parseStage === 'extracting' || parseStage === 'mapping',
    });

    const handleNext = () => {
        if (!user) {
            toast.error('Please sign in to proceed to details review');
            return;
        }
        if (!jd.trim()) {
            toast.error('Please paste a target job description or click "Try Sample JD"');
            return;
        }
        if (!resumeData && parseStage !== 'success') {
            toast.info('No resume uploaded yet — you can fill your experience manually.');
        }
        trackEvent('jd_submitted', { wordCount, charCount: jd.length });
        setStep(2);
    };

    const handleUseSampleJD = () => {
        setJD(SAMPLE_JD);
        toast.info('Sample JD (Stripe Senior Full Stack Engineer) loaded!');
    };

    const wordCount = jd.trim() ? jd.trim().split(/\s+/).length : 0;

    return (
        <div className="space-y-6 max-w-6xl mx-auto py-2">
            <div className="text-center space-y-2.5 pb-2">
                <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight">
                    Upload Resume & Target Role
                </h1>

                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    Paste the job description, then upload your resume PDF so we can tailor it to the role.
                </p>
            </div>

            {/* Split Input Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* 1. Left: Job Description Input */}
                <div className="glass-card p-5 sm:p-6 space-y-4 flex flex-col justify-between transition-all hover:border-primary/30">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                                <h2 className="text-sm sm:text-base font-semibold font-display tracking-tight text-foreground flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span>Target Job Description</span>
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Used to align keywords and tailor your resume to the role.
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleUseSampleJD}
                                className="h-8 text-xs rounded-xl border-border/70 dark:border-white/10 hover:border-primary/40 hover:bg-muted/40 gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
                            >
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <span>Try Sample JD</span>
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="jd" className="sr-only">Target job description text</label>
                            <Textarea
                                id="jd"
                                aria-label="Target job description"
                                placeholder="Paste the complete job description here, including responsibilities, requirements, and tech stack..."
                                value={jd}
                                onChange={(e) => setJD(e.target.value)}
                                className="min-h-[360px] resize-none text-xs leading-relaxed bg-muted/20 dark:bg-black/30 border-border/60 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-primary font-mono rounded-xl p-3.5 transition-all"
                            />

                            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                                <span className="font-mono">{wordCount} words detected</span>
                                <span className={wordCount > 80 ? "text-emerald-500 font-medium" : "text-muted-foreground"}>
                                    {wordCount > 80 ? '✓ Optimal density for AI calibration' : 'Paste 50+ words for best matching'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-border/40 dark:border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Zero Telemetry</span>
                        </span>
                    </div>
                </div>

                {/* 2. Right: Resume Upload & Scanner */}
                <div className="glass-card p-5 sm:p-6 space-y-4 flex flex-col justify-between transition-all hover:border-primary/30">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h2 className="text-sm sm:text-base font-semibold font-display tracking-tight text-foreground flex items-center gap-2">
                                    <FileCheck2 className="h-4 w-4 text-primary" />
                                    <span>Your Current Resume</span>
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Client-side PDF extraction with verifiable data mapping.
                                </p>
                            </div>

                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted dark:bg-white/5 text-muted-foreground border border-border/50 dark:border-white/10">
                                PDF Format
                            </span>
                        </div>

                        {/* Dropzone Card */}
                        <div
                            {...getRootProps()}
                            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer min-h-[360px] flex flex-col items-center justify-center p-6 text-center select-none ${
                                isDragActive
                                    ? 'border-primary bg-primary/10 scale-[1.01]'
                                    : parseStage === 'extracting' || parseStage === 'mapping'
                                        ? 'border-primary/50 bg-primary/[0.03]'
                                        : parseStage === 'success' || resumeData
                                            ? 'border-emerald-500/40 bg-emerald-500/[0.03]'
                                            : 'border-border/70 dark:border-white/10 hover:border-primary/50 hover:bg-muted/30 dark:hover:bg-white/[0.02]'
                            }`}
                        >
                            <input {...getInputProps()} />

                            <AnimatePresence mode="wait">
                                {parseStage === 'extracting' || parseStage === 'mapping' ? (
                                    <motion.div
                                        key="parsing"
                                        initial={{ opacity: 0, scale: 0.94 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.94 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full flex items-center justify-center py-1"
                                    >
                                        <DocumentScanner3D
                                            stage={parseStage}
                                            statusMessage={statusMessage}
                                        />
                                    </motion.div>
                                ) : parseStage === 'success' || resumeData ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-4 w-full max-w-sm mx-auto"
                                    >
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 mx-auto shadow-inner">
                                            <CheckCircle2 className="h-7 w-7" />
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="font-display font-semibold text-sm text-foreground">
                                                {fileName || 'Resume Ingested'}
                                            </h3>
                                            {fileSize && (
                                                <span className="text-[11px] font-mono text-muted-foreground">{fileSize} • Vector PDF</span>
                                            )}
                                        </div>

                                        {/* Extracted Details Pill Box */}
                                        <div className="rounded-xl border border-border/70 dark:border-white/10 bg-background/80 dark:bg-black/30 p-3.5 text-xs text-left space-y-1.5 backdrop-blur-xs">
                                            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Ingested Candidate:</div>
                                            <div className="font-display font-bold text-foreground text-sm truncate">
                                                {resumeData?.personalInfo.name || 'Candidate Name'}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                                                <span className="text-primary font-medium">{resumeData?.experience.length || 0} roles</span>
                                                <span>•</span>
                                                <span>{resumeData?.skills.length || 0} skill categories</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium pt-1"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                            <span>Replace with different PDF</span>
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div key="idle" className="space-y-4 max-w-xs mx-auto">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mx-auto transition-transform hover:scale-110">
                                            <FileUp className="h-7 w-7" strokeWidth={1.75} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <h3 className="font-display font-semibold text-sm sm:text-base text-foreground">
                                                Drop your PDF resume here
                                            </h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                or click to browse local files on your machine.
                                            </p>
                                        </div>

                                        <div className="inline-flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 dark:bg-white/[0.04] px-3 py-1 rounded-full border border-border/60 dark:border-white/10 font-mono">
                                            <span>PDF only</span>
                                            <span>•</span>
                                            <span>Private by default</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-border/40 dark:border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>No PDF resume yet?</span>
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="text-primary hover:underline font-medium cursor-pointer"
                        >
                            Enter details manually on Step 2 &rarr;
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-border/60 dark:border-white/10">
                <div className="text-xs font-mono text-muted-foreground">
                    Step 01 of 04
                </div>

                <Button
                    onClick={handleNext}
                    size="sm"
                    className="h-10 px-6 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                    <span>Continue to Details Review</span>
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
