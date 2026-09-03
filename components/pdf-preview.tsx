"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ServerCrash, RefreshCcw } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { hashTextBrowser } from '@/lib/content-hash';
import { useAuth } from './auth-provider';


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
    const { resumeData, generatedResume, template, theme } = useAppStore();
    const { user, loading: authLoading } = useAuth();
    const typstCode = generatedResume?.typst || '';
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
            body: JSON.stringify({
                resumeData,
                template,
                theme,
                typstCode,
            }),
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
    }, [typstCode, resumeData, template, theme]);

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
        if (!typstCode.trim()) {
            setCompileError('No document to compile yet.');
            return;
        }
        setAuthRequired(false);
        const compileHash = await hashTextBrowser(typstCode);
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
                body: JSON.stringify({ typstCode }),
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
    }, [authRequired, fallbackDirectCompile, typstCode, pollJob]);

    useEffect(() => {
        if (!typstCode) return;
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
    }, [typstCode, compilePdf, authLoading, user]);

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

            <div className="relative h-[820px] rounded-xl border border-border/80 overflow-hidden bg-white shadow-xl">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-xs font-semibold text-foreground">
                                {status === 'queued' ? 'Formatting layout…' : 'Compiling pixel-perfect PDF…'}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Rendering vector fonts and ATS-safe geometry.
                            </p>
                        </div>
                    </div>
                )}

                {pdfUrl ? (
                    <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-0"
                        title="Resume Document Preview"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3 p-8 text-center bg-muted/10">
                        {!loading && (
                            <>
                                <p className="text-sm font-medium text-foreground">
                                    {compileError ? 'Could not render preview' : statusCopy}
                                </p>
                                {compileError && (
                                    <div className="max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-left">
                                        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-destructive">
                                            <ServerCrash className="h-4 w-4" />
                                            <span>Formatting issue detected</span>
                                        </div>
                                        <p className="text-xs text-destructive whitespace-pre-wrap font-mono">
                                            {compileError}
                                        </p>
                                    </div>
                                )}
                                <p className="text-xs max-w-sm text-muted-foreground">
                                    Compiling your resume with sub-50ms native typography and strict ATS scanner alignment.
                                </p>
                                <Button variant="outline" size="sm" onClick={() => compilePdf()} className="h-8 text-xs">
                                    <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                                    Regenerate PDF
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>


            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Rendering: Vector PDF</span>
                <span>{compileMeta?.hash ? `Hash: ${compileMeta.hash.slice(0, 8)}` : 'Standard'}</span>
            </div>
        </div>
    );
}

