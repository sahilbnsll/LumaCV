"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { extractTextFromPdf } from '@/lib/pdf-parser';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function Step1JD() {
    const { jd, setJD, setFile, setExtractedText, setStep, setResumeDataFromParse } = useAppStore();
    const [isParsing, setIsParsing] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are supported currently');
            return;
        }
        setFile(file);
        setIsParsing(true);
        toast.info('Extracting text from resume...');
        try {
            const text = await extractTextFromPdf(file);
            setExtractedText(text);
            if (text.trim().length < 10) {
                toast.error('Could not read enough text from this PDF. Try another file or fill details manually.');
                return;
            }
            toast.info('Analyzing resume structure...');
            const response = await fetch('/api/v1/resume/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extractedText: text }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                const detail = typeof payload?.details === 'string' ? payload.details : typeof payload?.error === 'string' ? payload.error : 'Request failed';
                throw new Error(detail);
            }
            setResumeDataFromParse(payload);
            toast.success('Resume parsed successfully!');
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`Could not parse resume: ${message}. You can enter details manually on the next step.`);
        } finally {
            setIsParsing(false);
        }
    }, [setFile, setExtractedText, setResumeDataFromParse]);

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        multiple: false
    });

    const handleNext = () => {
        if (!jd.trim()) { toast.error('Please enter a job description'); return; }
        if (!useAppStore.getState().resumeData) {
            toast.info('No resume uploaded — you can fill details manually on the next step.');
        }
        setStep(2);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Target Job Description</h2>
                    <p className="text-sm text-muted-foreground mt-1">Paste the full JD you want to tailor your resume for.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="jd">Job Description</Label>
                    <Textarea
                        id="jd"
                        placeholder="Paste the complete job description here..."
                        className="min-h-[420px] resize-none text-sm leading-relaxed bg-muted/30 border-border/50 focus:border-primary shadow-inner"
                        value={jd}
                        onChange={(e) => setJD(e.target.value)}
                    />
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-5">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Your Resume</h2>
                    <p className="text-sm text-muted-foreground mt-1">Upload your existing PDF resume to auto-fill details.</p>
                </div>

                <div
                    {...getRootProps()}
                    className={`relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer h-[420px] flex flex-col items-center justify-center ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02] shadow-[0_0_30px_rgba(99,102,241,0.15)]' : isParsing ? 'border-primary/50 bg-primary/5 animate-pulse' : 'border-border/50 hover:border-primary/40 hover:bg-muted/30'
                        }`}
                >
                    <input {...getInputProps()} />
                    {isParsing ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <div className="absolute inset-0 h-12 w-12 rounded-full bg-primary/20 animate-ping" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Analyzing your resume...</p>
                                <p className="text-xs text-muted-foreground mt-1">Powered by AI</p>
                            </div>
                        </div>
                    ) : acceptedFiles[0] ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <FileText className="h-8 w-8 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">{acceptedFiles[0].name}</p>
                                <p className="text-xs text-muted-foreground">{(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <p className="text-xs text-green-500 font-medium">Parsed successfully</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-center px-6">
                            <div className="bg-muted p-4 rounded-full">
                                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium">Drag & drop your resume here</p>
                                <p className="text-xs text-muted-foreground mt-1">PDF up to 5MB</p>
                            </div>
                            <Button variant="secondary" size="sm" type="button">Select File</Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleNext} disabled={!jd.trim() || isParsing} size="lg" className="glow-sm">
                        Next: Edit Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
