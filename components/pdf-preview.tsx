"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileCode, Copy } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export function PdfPreview() {
    const { resumeData, generatedResume } = useAppStore();
    const latexCode = generatedResume?.latex || '';
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [compileError, setCompileError] = useState<string | null>(null);

    const compilePdf = useCallback(async () => {
        if (!latexCode.trim()) {
            setCompileError('No LaTeX to compile yet.');
            return;
        }
        setLoading(true);
        setCompileError(null);
        try {
            const response = await fetch('/api/v1/resume/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latexCode }),
            });

            const contentType = response.headers.get('content-type') || '';

            if (!response.ok) {
                let detail = `HTTP ${response.status}`;
                try {
                    const errJson = await response.json();
                    detail = (errJson.details as string) || (errJson.error as string) || detail;
                } catch {
                    detail = (await response.text()).slice(0, 400);
                }
                throw new Error(detail);
            }

            if (!contentType.includes('pdf')) {
                const text = await response.text();
                throw new Error(
                    text.slice(0, 300) || 'Server did not return a PDF (check LaTeX for errors).'
                );
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setPdfUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return url;
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Compilation failed';
            setCompileError(message);
            toast.error(`PDF compile failed: ${message.slice(0, 120)}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [latexCode]);

    useEffect(() => {
        if (!latexCode) return;
        compilePdf();
    }, [latexCode, compilePdf]);

    const downloadTex = () => {
        if (!latexCode) return;
        const blob = new Blob([latexCode], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `resume-${(resumeData?.personalInfo.name || 'resume').replace(/\s+/g, '-')}.tex`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success('Downloaded .tex file');
    };

    const copyTex = async () => {
        if (!latexCode) return;
        try {
            await navigator.clipboard.writeText(latexCode);
            toast.success('LaTeX copied to clipboard — paste into Overleaf → New Project → Blank');
        } catch {
            toast.error('Could not copy to clipboard');
        }
    };

    if (!resumeData) {
        return (
            <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-xl bg-muted/50">
                <p className="text-muted-foreground">No resume data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Live Preview</h3>
            </div>

            <div className="relative h-[800px] border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/15">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">Compiling PDF…</p>
                        </div>
                    </div>
                )}

                {pdfUrl ? (
                    <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full"
                        title="Resume Preview"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 p-8 text-center">
                        {!loading && (
                            <>
                                <p className="font-medium text-foreground">
                                    {compileError ? 'Could not build preview' : 'Waiting for PDF…'}
                                </p>
                                {compileError && (
                                    <p className="text-sm text-destructive max-w-md whitespace-pre-wrap">
                                        {compileError}
                                    </p>
                                )}
                                <p className="text-sm max-w-md">
                                    Download the .tex file and open it in Overleaf (New Project → Upload
                                    project), or copy the LaTeX and paste into a blank project. The old
                                    &quot;snip&quot; upload often showed Overleaf&apos;s default template instead of
                                    your resume.
                                </p>
                                <Button variant="outline" size="sm" onClick={() => compilePdf()}>
                                    Retry compile
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap justify-end gap-3">
                {latexCode && (
                    <>
                        <Button type="button" variant="outline" onClick={downloadTex}>
                            <FileCode className="mr-2 h-4 w-4" />
                            Download .tex
                        </Button>
                        <Button type="button" variant="outline" onClick={copyTex}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy LaTeX
                        </Button>
                    </>
                )}

                {pdfUrl && (
                    <Button asChild>
                        <a href={pdfUrl} download={`Resume-${resumeData.personalInfo.name.replace(/\s+/g, '-')}.pdf`}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}
