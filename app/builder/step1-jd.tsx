"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    FileText,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    FileCheck2,
    UploadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { extractTextFromPdf } from '@/lib/pdf-parser';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import { getCustomKeyHeaders } from '@/lib/ai-keys';




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
    const { jd, setJD, setFile, setExtractedText, setStep, setResumeDataFromParse, resumeData } = useAppStore();
    const [parseStage, setParseStage] = useState<'idle' | 'extracting' | 'mapping' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileSize, setFileSize] = useState<string | null>(null);


    const onDrop = useCallback(async (acceptedFiles: File[]) => {
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
            setStatusMessage('Mapping your experience and credentials...');

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
            setStatusMessage('Resume parsed successfully');
            toast.success('Resume parsed into structured format!');
            trackEvent('resume_uploaded', { fileName: file.name, sizeKb: Math.round(file.size / 1024) });
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            setParseStage('error');
            setStatusMessage(`Parsing note: ${message}. You can still review details manually.`);
            toast.error('Could not auto-parse all fields. You can verify them on the next step.');
        }
    }, [setFile, setExtractedText, setResumeDataFromParse]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        multiple: false
    });

    const handleNext = () => {
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* 1. Left: Job Description Input */}
                <div className="rounded-xl border border-border/70 bg-card p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold font-display tracking-tight text-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                Target Job Description
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Paste the role requirements you want to tailor for.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleUseSampleJD}
                            className="h-8 text-xs border-border/70 hover:bg-muted/50 gap-1.5 cursor-pointer"
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
                            placeholder="Paste the complete job description here, including responsibilities, qualifications, and required tech stack..."
                            value={jd}
                            onChange={(e) => setJD(e.target.value)}
                            className="min-h-[380px] resize-none text-xs leading-relaxed bg-muted/20 border-border/60 focus-visible:ring-1 focus-visible:ring-primary font-mono rounded-lg"
                        />

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                            <span>{wordCount} words</span>
                            <span>{wordCount > 100 ? '✓ Good length for analysis' : 'Paste at least 50+ words for best matching'}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Right: Resume Upload */}
                <div className="rounded-xl border border-border/70 bg-card p-5 space-y-4 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold font-display tracking-tight text-foreground flex items-center gap-2">
                                    <FileCheck2 className="h-4 w-4 text-primary" />
                                    Your Current Resume
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Upload your PDF. Parsing runs with strict factual preservation.
                                </p>
                            </div>
                        </div>



                        {/* Dropzone Card */}
                        <div
                            {...getRootProps()}
                            className={`mt-4 relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[340px] flex flex-col items-center justify-center p-6 text-center ${
                                isDragActive
                                    ? 'border-primary bg-primary/5 scale-[1.01]'
                                    : parseStage === 'extracting' || parseStage === 'mapping'
                                        ? 'border-primary/40 bg-primary/[0.02]'
                                        : parseStage === 'success' || resumeData
                                            ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                                            : 'border-border/60 hover:border-primary/50 hover:bg-muted/20'
                            }`}
                        >
                            <input {...getInputProps()} />

                            <AnimatePresence mode="wait">
                                {parseStage === 'extracting' || parseStage === 'mapping' ? (
                                    <motion.div
                                        key="parsing"
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-4 w-full max-w-xs mx-auto"
                                    >
                                        {/* Animated document skeleton with scanning beam */}
                                        <div className="relative h-28 w-24 mx-auto rounded-lg border border-primary/30 bg-muted/40 p-2.5 overflow-hidden shadow-inner flex flex-col justify-between">
                                            <div className="space-y-1.5">
                                                <div className="h-2 w-3/4 bg-foreground/25 rounded" />
                                                <div className="h-1.5 w-full bg-foreground/15 rounded" />
                                                <div className="h-1.5 w-5/6 bg-foreground/15 rounded" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="h-1.5 w-full bg-foreground/15 rounded" />
                                                <div className="h-1.5 w-2/3 bg-foreground/15 rounded" />
                                            </div>
                                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                                        </div>

                                        <div>
                                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                                                <span>{parseStage === 'extracting' ? 'Reading your resume' : 'Mapping your experience'}</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                                {statusMessage}
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : parseStage === 'success' || resumeData ? (

                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-3"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mx-auto">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-foreground">
                                                {fileName || 'Resume Loaded'}
                                            </h3>
                                            {fileSize && (
                                                <span className="text-[11px] text-muted-foreground">{fileSize} • PDF Document</span>
                                            )}
                                        </div>
                                        <div className="rounded-lg border border-border/40 bg-muted/30 p-2.5 text-xs text-left space-y-1 max-w-xs mx-auto">
                                            <div className="text-[11px] text-muted-foreground">Extracted candidate details:</div>
                                            <div className="font-medium text-foreground truncate">
                                                {resumeData?.personalInfo.name || 'Candidate Name'}
                                            </div>

                                            <div className="text-[11px] text-muted-foreground">
                                                {resumeData?.experience.length || 0} roles • {resumeData?.skills.length || 0} skill categories
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground hover:text-foreground">
                                            Click or drop to replace with a different PDF
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div key="idle" className="space-y-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 mx-auto">
                                            <UploadCloud className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-foreground">
                                                Drop your PDF resume here
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                or click to browse your local files
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/80 bg-muted/40 px-2.5 py-1 rounded-full border border-border/50">
                                            <span>PDF only</span>
                                            <span>•</span>
                                            <span>Text will be extracted on device</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="text-[11px] text-muted-foreground/70 flex items-center justify-between pt-2">
                        <span>No resume? You can enter details manually on Step 2.</span>
                    </div>
                </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div className="text-xs text-muted-foreground">
                    Step 1 of 4: Setup & Inputs
                </div>

                <Button
                    onClick={handleNext}
                    size="sm"
                    className="h-9 px-5 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm"
                >
                    Continue to Details Review
                    <ArrowRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}


