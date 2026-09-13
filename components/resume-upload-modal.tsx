"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import {
    FileUp,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    ShieldCheck,
    X,
    ArrowRight
} from 'lucide-react';
import { extractTextFromFile } from '@/lib/document-parser';
import { getCustomKeyHeaders } from '@/lib/ai-keys';
import { ResumeData } from '@/lib/resume-schema';
import { notify } from '@/lib/notify';
import { motion, AnimatePresence } from 'framer-motion';
import { MOTION_VARIANTS } from '@/lib/motion';

interface ResumeUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onParsed: (data: ResumeData) => void;
}

type StepState = 'idle' | 'reading' | 'parsing' | 'success' | 'error';

export function ResumeUploadModal({ open, onOpenChange, onParsed }: ResumeUploadModalProps) {
    const [step, setStep] = useState<StepState>('idle');
    const [fileName, setFileName] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [parsedData, setParsedData] = useState<ResumeData | null>(null);

    const resetState = () => {
        setStep('idle');
        setFileName('');
        setErrorMessage('');
        setParsedData(null);
    };

    const handleClose = () => {
        if (step !== 'reading' && step !== 'parsing') {
            resetState();
            onOpenChange(false);
        }
    };

    const processFile = useCallback(async (file: File) => {
        setFileName(file.name);
        setStep('reading');
        setErrorMessage('');

        try {
            // Step 1: Client-side text extraction (Zero server upload of raw binary)
            const extractedText = await extractTextFromFile(file);

            if (!extractedText || extractedText.trim().length < 25) {
                throw new Error(
                    'No readable text could be extracted. The document may be scanned, image-only, or encrypted.'
                );
            }

            // Step 2: AI Parsing
            setStep('parsing');

            const response = await fetch('/api/v1/resume/parse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getCustomKeyHeaders(),
                },
                body: JSON.stringify({ extractedText }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Parsing failed with status ${response.status}`);
            }

            const data: ResumeData = await response.json();
            setParsedData(data);
            setStep('success');
            notify.success('Resume parsed successfully', file.name);

            // Auto-apply after a brief success flash — long enough to register,
            // short enough not to feel like the app is stalling after a parse
            // that (once the AI call itself returns) is already done.
            setTimeout(() => {
                onParsed(data);
                resetState();
                onOpenChange(false);
            }, 350);

        } catch (err) {
            console.error('Upload/parse error:', err);
            const msg = err instanceof Error ? err.message : 'Failed to process resume file';
            setErrorMessage(msg);
            setStep('error');
            notify.error('Parsing failed', msg);
        }
    }, [onParsed, onOpenChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                processFile(acceptedFiles[0]);
            }
        },
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
        },
        maxFiles: 1,
        disabled: step === 'reading' || step === 'parsing',
    });

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md p-6 border bg-background text-foreground shadow-2xl rounded-2xl">
                <DialogHeader className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <FileUp className="w-5 h-5 text-primary" />
                            Upload Existing Resume
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                        Import your existing PDF or Word resume. Our parser preserves all your factual experience, dates, URLs, and skills without rewriting.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 'idle' && (
                            <motion.div
                                key="idle"
                                variants={MOTION_VARIANTS.stepFade}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                                        isDragActive
                                            ? 'border-primary bg-primary/5 scale-[0.99]'
                                            : 'border-border/80 hover:border-primary/50 hover:bg-muted/40'
                                    }`}
                                >
                                    <input {...getInputProps()} />
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-foreground">
                                            {isDragActive ? 'Drop your file here' : 'Click to select or drag and drop'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            PDF (.pdf) or Word document (.docx) up to 10MB
                                        </p>
                                    </div>
                                    <div className="pt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Text extracted client-side in browser</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {(step === 'reading' || step === 'parsing') && (
                            <motion.div
                                key="processing"
                                variants={MOTION_VARIANTS.stepFade}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="py-8 px-4 rounded-xl border border-border bg-card/50 flex flex-col items-center justify-center text-center space-y-4"
                            >
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Loader variant="helix" size={28} className="text-primary" />
                                    </div>
                                    <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
                                </div>

                                <div className="space-y-1.5">
                                    <p className="text-sm font-semibold text-foreground">
                                        {step === 'reading' ? 'Reading Document Structure...' : 'Extracting Factual Schema...'}
                                    </p>
                                    <p className="text-xs text-muted-foreground max-w-xs line-clamp-1 font-mono">
                                        {fileName}
                                    </p>
                                </div>

                                {/* Sequential progress indicators */}
                                <div className="w-full max-w-xs space-y-2 pt-2">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="flex items-center gap-1.5 text-foreground font-medium">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            1. Document reading
                                        </span>
                                        <span className={step === 'parsing' ? 'text-emerald-500 font-semibold' : 'text-primary'}>
                                            {step === 'parsing' ? 'Complete' : 'In Progress'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="flex items-center gap-1.5 text-foreground font-medium">
                                            {step === 'parsing' ? (
                                                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                                            ) : (
                                                <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40" />
                                            )}
                                            2. Factual parsing
                                        </span>
                                        <span className="text-muted-foreground">
                                            {step === 'parsing' ? 'Processing...' : 'Waiting'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                variants={MOTION_VARIANTS.stepFade}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="py-8 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col items-center justify-center text-center space-y-3"
                            >
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">
                                        Resume Parsed Successfully!
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Loading your structured content into the editor...
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'error' && (
                            <motion.div
                                key="error"
                                variants={MOTION_VARIANTS.stepFade}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="py-6 px-4 rounded-xl border border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center text-center space-y-3"
                            >
                                <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-destructive">
                                        Parsing Error
                                    </p>
                                    <p className="text-xs text-muted-foreground max-w-sm">
                                        {errorMessage}
                                    </p>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={resetState}
                                        className="text-xs h-9 px-4"
                                    >
                                        Try Another File
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
