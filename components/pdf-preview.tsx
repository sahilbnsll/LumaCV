"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileCode, Copy, ServerCrash, RefreshCcw } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { hashTextBrowser } from '@/lib/content-hash';
import { useAuth } from './auth-provider';
import { AuthGuardCard } from './auth-guard-card';

type PreviewStatus = 'idle' | 'queued' | 'compiling' | 'ready' | 'failed';

type CompileMeta = {
    provider?: string;
    cycle?: number;
    attempts?: number;
    hash?: string;
    fromCache?: boolean;
};

const previewCache = new Map<string, { url: string; meta: CompileMeta }>();

export function PdfPreview() {
    const { resumeData, generatedResume } = useAppStore();
    const { user, loading: authLoading } = useAuth();
    const latexCode = generatedResume?.latex || '';
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<PreviewStatus>('idle');
    const [compileError, setCompileError] = useState<string | null>(null);
    const [compileMeta, setCompileMeta] = useState<CompileMeta | null>(null);
    const [authRequired, setAuthRequired] = useState(false);
    const debounceRef = useRef<number | null>(null);
    const pollRef = useRef<number | null>(null);

    const fallbackDirectCompile = useCallback(async (compileHash: string) => {
        const response = await fetch('/api/v1/resume/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latexCode }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (!response.ok) {
            if (response.status === 401) {
                setAuthRequired(true);
                throw new Error('Login required to generate preview.');
            }
            let detail = `HTTP ${response.status}`;
            let attemptSummary = '';
            try {
                const errJson = await response.json();
                detail = (errJson.details as string) || (errJson.error as string) || detail;
                if (Array.isArray(errJson.attempts) && errJson.attempts.length > 0) {
                    attemptSummary = ` Tried ${errJson.attempts.length} provider attempts.`;
                }
            } catch {
                detail = (await response.text()).slice(0, 400);
            }
            throw new Error(`${detail}${attemptSummary}`.trim());
        }
        if (!contentType.includes('pdf')) {
            const text = await response.text();
            throw new Error(text.slice(0, 300) || 'Server did not return a PDF.');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const meta = {
            provider: response.headers.get('X-Compile-Provider') || undefined,
            cycle: Number(response.headers.get('X-Compile-Cycle') || '') || undefined,
            attempts: Number(response.headers.get('X-Compile-Attempts') || '') || undefined,
            hash: response.headers.get('X-Compile-Hash') || compileHash,
        };
        previewCache.set(compileHash, { url, meta });
        setCompileMeta(meta);
        setPdfUrl((prev) => {
            if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
            return url;
        });
        setStatus('ready');
    }, [latexCode]);

    const pollJob = useCallback((hash: string) => {
        if (pollRef.current) window.clearInterval(pollRef.current);
        pollRef.current = window.setInterval(async () => {
            try {
                const response = await fetch(`/api/v1/resume/render?hash=${encodeURIComponent(hash)}`);
                if (response.status === 401) {
                    if (pollRef.current) window.clearInterval(pollRef.current);
                    setAuthRequired(true);
                    setStatus('idle');
                    setCompileError(null);
                    return;
                }
                const payload = await response.json().catch(() => ({}));
                if (payload.status === 'ready' && payload.url) {
                    if (pollRef.current) window.clearInterval(pollRef.current);
                    previewCache.set(hash, { url: payload.url, meta: { hash, attempts: payload.attempts, provider: payload.provider } });
                    setCompileMeta({ hash, attempts: payload.attempts, provider: payload.provider });
                    setPdfUrl((prev) => {
                        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
                        return payload.url;
                    });
                    setStatus('ready');
                    return;
                }
                if (payload.status === 'failed') {
                    if (pollRef.current) window.clearInterval(pollRef.current);
                    setCompileError(payload.error || 'Compile job failed.');
                    setCompileMeta({ hash, attempts: payload.attempts, provider: payload.provider });
                    setStatus('failed');
                    return;
                }
                if (payload.status === 'compiling' || payload.status === 'queued') {
                    setStatus(payload.status);
                    setCompileMeta({ hash, attempts: payload.attempts, provider: payload.provider });
                }
            } catch (error) {
                if (pollRef.current) window.clearInterval(pollRef.current);
                setCompileError(error instanceof Error ? error.message : 'Polling failed');
                setStatus('failed');
            }
        }, 1800);
    }, []);

    const compilePdf = useCallback(async () => {
        if (!latexCode.trim()) {
            setCompileError('No LaTeX to compile yet.');
            return;
        }
        setAuthRequired(false);
        const compileHash = await hashTextBrowser(latexCode);
        const cached = previewCache.get(compileHash);
        if (cached) {
            setCompileMeta({ ...cached.meta, fromCache: true });
            setCompileError(null);
            setPdfUrl((prev) => {
                if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
                return cached.url;
            });
            setStatus('ready');
            return;
        }
        if (pollRef.current) window.clearInterval(pollRef.current);
        setStatus('queued');
        setCompileError(null);
        try {
            const response = await fetch('/api/v1/resume/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latexCode }),
            });
            if (response.status === 401) {
                setAuthRequired(true);
                setStatus('idle');
                return;
            }
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.details || payload.error || `HTTP ${response.status}`);
            }
            if (payload.status === 'unsupported') {
                setStatus('compiling');
                await fallbackDirectCompile(compileHash);
                return;
            }
            if (payload.status === 'ready' && payload.url) {
                previewCache.set(compileHash, { url: payload.url, meta: { hash: compileHash, attempts: payload.attempts, provider: payload.provider } });
                setCompileMeta({ hash: compileHash, attempts: payload.attempts, provider: payload.provider });
                setPdfUrl((prev) => {
                    if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
                    return payload.url;
                });
                setStatus('ready');
                return;
            }
            if (payload.hash) {
                setCompileMeta({ hash: payload.hash, attempts: payload.attempts, provider: payload.provider });
                setStatus(payload.status === 'compiling' ? 'compiling' : 'queued');
                pollJob(payload.hash);
                return;
            }
            throw new Error('Preview job could not be started.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Compilation failed';
            if (!authRequired && message.toLowerCase().includes('login')) {
                setAuthRequired(true);
                setStatus('idle');
                setCompileError(null);
                return;
            }
            setCompileError(message);
            toast.error(`PDF compile failed: ${message.slice(0, 120)}`);
            console.error(error);
            setStatus('failed');
        }
    }, [authRequired, fallbackDirectCompile, latexCode, pollJob]);

    useEffect(() => {
        if (!latexCode) return;
        if (authLoading) return;
        if (!user) {
            // Avoid auto-compiling when logged out; keep UI in auth-gated state.
            setAuthRequired(true);
            setStatus('idle');
            setCompileError(null);
            setCompileMeta(null);
            setPdfUrl((prev) => {
                if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
                return null;
            });
            return;
        }
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            compilePdf();
        }, 450);
        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
            if (pollRef.current) window.clearInterval(pollRef.current);
        };
    }, [latexCode, compilePdf, authLoading, user]);

    const downloadTex = () => {
        if (!latexCode) return;
        if (!user) {
            toast.error('Login to download your LaTeX file.');
            return;
        }
        fetch('/api/v1/resume/export-tex', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latexCode,
                filename: `resume-${(resumeData?.personalInfo.name || 'resume').replace(/\s+/g, '-')}`,
            }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}));
                    throw new Error(payload.error || payload.details || 'Failed to export .tex');
                }
                const blob = await response.blob();
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `resume-${(resumeData?.personalInfo.name || 'resume').replace(/\s+/g, '-')}.tex`;
                a.click();
                URL.revokeObjectURL(a.href);
                toast.success('Downloaded .tex file');
            })
            .catch((error) => toast.error(error instanceof Error ? error.message : 'Export failed'));
    };

    const copyTex = async () => {
        if (!latexCode) return;
        if (!user) {
            toast.error('Login to copy LaTeX.');
            return;
        }
        try {
            await navigator.clipboard.writeText(latexCode);
            toast.success('LaTeX copied to clipboard — paste into Overleaf → New Project → Blank');
        } catch {
            toast.error('Could not copy to clipboard');
        }
    };

    const loading = status === 'queued' || status === 'compiling';
    const statusCopy =
        status === 'queued'
            ? 'Queued for PDF generation…'
            : status === 'compiling'
              ? 'Compiling PDF…'
              : 'Waiting for PDF…';

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
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Live Preview</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {generatedResume ? <Badge variant="secondary" className="text-[11px]">Resume tailored</Badge> : null}
                        {compileMeta?.hash ? <Badge variant="outline" className="text-[11px]">Content hashed</Badge> : null}
                        {status === 'queued' ? <Badge variant="secondary" className="text-[11px]">Generating preview</Badge> : null}
                        {status === 'compiling' ? <Badge variant="secondary" className="text-[11px]">Rendering resume</Badge> : null}
                        {status === 'ready' ? <Badge variant="secondary" className="text-[11px]">Preview ready</Badge> : null}
                        {authRequired ? <Badge variant="outline" className="text-[11px]">Login required</Badge> : null}
                        {compileError && !authRequired ? (
                            <Badge variant="destructive" className="text-[11px]">
                                Failed, retry
                            </Badge>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="relative h-[800px] border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/15">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {status === 'queued' ? 'Generating preview' : 'Rendering resume'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Your preview is being prepared in the background.
                            </p>
                        </div>
                    </div>
                )}

                {!user && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                        <div className="w-full max-w-md p-4">
                            <AuthGuardCard />
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
                                    {compileError ? 'Could not build preview' : statusCopy}
                                </p>
                                {compileError && (
                                    <div className="max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-left">
                                        <div className="mb-1 flex items-center gap-2 text-sm font-medium text-destructive">
                                            <ServerCrash className="h-4 w-4" />
                                            {authRequired ? 'Login required' : 'Compile failed after fallbacks'}
                                        </div>
                                        <p className="text-sm text-destructive whitespace-pre-wrap">
                                            {authRequired ? 'Login to generate your preview.' : compileError}
                                        </p>
                                    </div>
                                )}
                                <p className="text-sm max-w-md">
                                    Download the .tex file and open it in Overleaf (New Project → Upload
                                    project), or copy the LaTeX and paste into a blank project. The old
                                    &quot;snip&quot; upload often showed Overleaf&apos;s default template instead of
                                    your resume.
                                </p>
                                <Button variant="outline" size="sm" onClick={() => compilePdf()} disabled={!user}>
                                    <RefreshCcw className="mr-2 h-4 w-4" />
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
                        <Button type="button" variant="outline" onClick={downloadTex} disabled={!user}>
                            <FileCode className="mr-2 h-4 w-4" />
                            Download .tex
                        </Button>
                        <Button type="button" variant="outline" onClick={copyTex} disabled={!user}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy LaTeX
                        </Button>
                    </>
                )}

                {pdfUrl && (
                    user ? (
                        <Button asChild>
                            <a href={pdfUrl} download={`Resume-${resumeData.personalInfo.name.replace(/\s+/g, '-')}.pdf`}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </a>
                        </Button>
                    ) : (
                        <Button type="button" disabled>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    )
                )}
            </div>
        </div>
    );
}
