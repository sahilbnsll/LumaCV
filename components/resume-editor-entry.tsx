"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    FileUp,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    Briefcase,
    FolderGit2,
    GraduationCap,
    Wrench,
    RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { extractTextFromFile } from '@/lib/document-parser';
import { getCustomKeyHeaders } from '@/lib/ai-keys';
import { ResumeData, ResumeDataSchema } from '@/lib/resume-schema';
import { DEMO_RESUME_DATA } from '@/lib/demo-data';
import { notify } from '@/lib/notify';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeEditorEntryProps {
    onComplete: (data: ResumeData) => void;
    onCancel?: () => void;
}

type ParseStage = 'idle' | 'reading' | 'parsing' | 'review' | 'error';

export function ResumeEditorEntry({ onComplete, onCancel }: ResumeEditorEntryProps) {
    const [stage, setStage] = useState<ParseStage>('idle');
    const [fileName, setFileName] = useState<string>('');
    const [fileSize, setFileSize] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [parsedData, setParsedData] = useState<ResumeData | null>(null);

    const processFile = useCallback(async (file: File) => {
        setFileName(file.name);
        setFileSize((file.size / 1024).toFixed(0) + ' KB');
        setStage('reading');
        setErrorMessage('');

        try {
            // Step 1: Read and extract document text client-side
            const extractedText = await extractTextFromFile(file);

            if (!extractedText || extractedText.trim().length < 25) {
                throw new Error(
                    'No readable text could be extracted. The document may be scanned, image-only, or encrypted.'
                );
            }

            // Step 2: Factual AI Parse into LumaCV schema
            setStage('parsing');

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
                throw new Error(errData.error || `Parsing failed with HTTP status ${response.status}`);
            }

            const data: ResumeData = await response.json();
            setParsedData(data);
            setStage('review');
            notify.success('Resume parsed successfully', file.name);

        } catch (err) {
            console.error('Parse error:', err);
            const msg = err instanceof Error ? err.message : 'Failed to parse resume document';
            setErrorMessage(msg);
            setStage('error');
            notify.error('Parsing failed', msg);
        }
    }, []);

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
        disabled: stage === 'reading' || stage === 'parsing',
    });

    const handleUseSample = () => {
        onComplete(DEMO_RESUME_DATA);
    };

    const handleStartBlank = () => {
        const blankData = ResumeDataSchema.parse({
            personalInfo: {
                name: 'Your Name',
                title: 'Professional Title',
                email: '',
                phone: '',
                location: '',
                linkedin: '',
                github: '',
                portfolio: '',
            },
            summary: '',
            skills: [],
            experience: [],
            projects: [],
            education: [],
            certifications: [],
            achievements: [],
            sectionOrder: [
                'summary',
                'experience',
                'projects',
                'education',
                'skills',
                'certifications',
                'achievements',
            ],
        });
        onComplete(blankData);
    };

    const handleAcceptReview = () => {
        if (parsedData) {
            onComplete(parsedData);
        }
    };

    const handleReset = () => {
        setStage('idle');
        setFileName('');
        setFileSize('');
        setErrorMessage('');
        setParsedData(null);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 py-12">
            <div className="w-full max-w-2xl mx-auto space-y-8">
                {/* Editorial Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground font-display">
                        Bring your resume. Leave with a better one.
                    </h1>

                    <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        Bring your existing resume. LumaCV turns it into a structured, editable resume you can customize without fighting a PDF editor.
                    </p>
                </div>

                {/* Main Action Surface */}
                <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/10 dark:shadow-black/40 space-y-6">
                    {/* STAGE 1: IDLE / DROPZONE */}
                    {stage === 'idle' && (
                        <div className="space-y-6">
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-2xl p-10 sm:p-12 text-center cursor-pointer transition-[border-color,background-color,box-shadow,transform] duration-300 flex flex-col items-center justify-center gap-4 ${
                                    isDragActive
                                        ? 'border-primary bg-primary/10 scale-[0.99] ring-4 ring-primary/20'
                                        : 'border-border/80 hover:border-primary/60 hover:bg-muted/40'
                                }`}
                            >
                                <input {...getInputProps()} />

                                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                    <FileUp className="w-8 h-8" />
                                </div>

                                <div className="space-y-1.5 max-w-sm">
                                    <p className="text-base font-semibold text-foreground">
                                        {isDragActive ? 'Drop your resume file now' : 'Upload your existing resume'}
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Drag and drop your document here, or click to browse from your computer
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                                        PDF (.pdf)
                                    </span>
                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                                        Word (.docx)
                                    </span>
                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                                        Plain Text (.txt)
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Client-side extraction · Factual verbatim import · Zero rewriting</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleUseSample}
                                        className="text-foreground hover:underline font-medium cursor-pointer"
                                    >
                                        Try sample resume
                                    </button>
                                    <span>·</span>
                                    <button
                                        type="button"
                                        onClick={handleStartBlank}
                                        className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                                    >
                                        Start blank
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STAGE 2: READING & PARSING PROGRESS */}
                    {(stage === 'reading' || stage === 'parsing') && (
                        <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Loader variant="helix" size={32} className="text-primary" />
                                </div>
                                <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1.5 -right-1.5 animate-pulse" />
                            </div>

                            <div className="space-y-1.5">
                                <h3 className="text-lg font-bold text-foreground">
                                    {stage === 'reading' ? 'Reading Document Structure...' : 'Extracting Factual Information...'}
                                </h3>
                                <p className="text-xs text-muted-foreground font-mono">
                                    {fileName} {fileSize ? `(${fileSize})` : ''}
                                </p>
                            </div>

                            {/* Multi-step progress timeline */}
                            <div className="w-full max-w-sm space-y-3 pt-2">
                                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span className="font-medium text-foreground">Document Reading</span>
                                    </div>
                                    <span className={stage === 'parsing' ? 'text-emerald-500 font-semibold' : 'text-primary'}>
                                        {stage === 'parsing' ? 'Complete' : 'In Progress...'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs">
                                    <div className="flex items-center gap-2">
                                        {stage === 'parsing' ? (
                                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border border-muted-foreground/40" />
                                        )}
                                        <span className="font-medium text-foreground">Factual Schema Mapping</span>
                                    </div>
                                    <span className="text-muted-foreground">
                                        {stage === 'parsing' ? 'Extracting verbatim...' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                                We extract dates, roles, URLs, and achievements verbatim without inventing or altering your accomplishments.
                            </p>
                        </div>
                    )}

                    {/* STAGE 3: PARSED RESULT REVIEW SUMMARY */}
                    {stage === 'review' && parsedData && (
                        <div className="space-y-6 py-2">
                            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/50">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Extraction Complete, Factual Schema Ready</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">
                                        {parsedData.personalInfo?.name || 'Candidate Resume'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {parsedData.personalInfo?.title || 'Professional Title'} {parsedData.personalInfo?.location ? `· ${parsedData.personalInfo.location}` : ''}
                                    </p>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="h-8 text-xs gap-1.5 rounded-xl"
                                    title="Upload a different document"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Change File</span>
                                </Button>
                            </div>

                            {/* Breakdown Chips */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 rounded-2xl border border-border/60 bg-muted/20 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Briefcase className="w-3.5 h-3.5 text-primary" />
                                        <span>Experience</span>
                                    </div>
                                    <div className="text-lg font-bold text-foreground">
                                        {parsedData.experience?.length || 0} <span className="text-xs font-normal text-muted-foreground">roles</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl border border-border/60 bg-muted/20 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <FolderGit2 className="w-3.5 h-3.5 text-primary" />
                                        <span>Projects</span>
                                    </div>
                                    <div className="text-lg font-bold text-foreground">
                                        {parsedData.projects?.length || 0} <span className="text-xs font-normal text-muted-foreground">projects</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl border border-border/60 bg-muted/20 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                                        <span>Education</span>
                                    </div>
                                    <div className="text-lg font-bold text-foreground">
                                        {parsedData.education?.length || 0} <span className="text-xs font-normal text-muted-foreground">degrees</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-2xl border border-border/60 bg-muted/20 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Wrench className="w-3.5 h-3.5 text-primary" />
                                        <span>Skills</span>
                                    </div>
                                    <div className="text-lg font-bold text-foreground">
                                        {parsedData.skills?.length || 0} <span className="text-xs font-normal text-muted-foreground">categories</span>
                                    </div>
                                </div>
                            </div>

                            {/* Summary snippet */}
                            {parsedData.summary && (
                                <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/10 space-y-1">
                                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Extracted Summary
                                    </div>
                                    <p className="text-xs text-foreground/90 line-clamp-3 leading-relaxed">
                                        {parsedData.summary}
                                    </p>
                                </div>
                            )}

                            {/* Proceed CTA */}
                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <span className="text-xs text-muted-foreground">
                                    All content will load into your manual editor where you have full control.
                                </span>

                                <Button
                                    onClick={handleAcceptReview}
                                    className="w-full sm:w-auto h-11 px-6 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl shadow-md cursor-pointer"
                                >
                                    <span>Open in Manual Editor</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STAGE 4: ERROR STATE */}
                    {stage === 'error' && (
                        <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
                                <AlertCircle className="w-7 h-7" />
                            </div>

                            <div className="space-y-1.5 max-w-md">
                                <h3 className="text-lg font-bold text-destructive">
                                    Unable to Parse Resume
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {errorMessage}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    className="text-xs h-9 px-4 rounded-xl cursor-pointer"
                                >
                                    Try Another Document
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleUseSample}
                                    className="text-xs h-9 px-4 rounded-xl cursor-pointer"
                                >
                                    Use Sample Resume
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
