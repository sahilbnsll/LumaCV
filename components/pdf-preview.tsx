"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    RotateCcw,
    Download,
    ExternalLink,
    ZoomIn,
    ZoomOut,
    FileText,
    Zap,
    AlertCircle,
    Sparkles,
    Loader2,
    ChevronDown,
    LogIn,
    UserPlus,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { notify } from '@/lib/notify';
import { Badge } from '@/components/ui/badge';
import { hashTextBrowser } from '@/lib/content-hash';
import { generateTypst } from '@/lib/typst-generator';
import { AnimatePresence } from 'framer-motion';
import { TypstCompileVisualizer } from '@/components/ui/typst-compile-visualizer';
import { cn } from '@/lib/utils';
import { exportResume, ExportFormatType } from '@/lib/resume-export';

type PreviewStatus = 'idle' | 'compiling' | 'ready' | 'failed';

type CompileMeta = {
    provider?: string;
    hash?: string;
    fromCache?: boolean;
    compileTimeMs?: number;
};

const previewCache = new Map<string, { url: string; meta: CompileMeta }>();

const MAX_RETRIES = 2;
const RETRY_DELAYS = [500, 1500]; // ms

export function PdfPreview() {
    const pathname = usePathname();
    const resumeData = useAppStore((s) => s.resumeData);
    const generatedResume = useAppStore((s) => s.generatedResume);
    const template = useAppStore((s) => s.template);
    const theme = useAppStore((s) => s.theme);
    const typstCode = generatedResume?.typst || '';

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<PreviewStatus>('idle');
    const [compileError, setCompileError] = useState<string | null>(null);
    const [isAuthError, setIsAuthError] = useState(false);
    const [compileMeta, setCompileMeta] = useState<CompileMeta | null>(null);
    const [zoom, setZoom] = useState<number>(100);
    const [compileDuration, setCompileDuration] = useState<number | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);

    const debounceRef = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    // Monotonic counter, ensures stale responses are discarded
    const requestIdRef = useRef<number>(0);

    const candidateName = useMemo(
        () => resumeData?.personalInfo?.name || 'Resume',
        [resumeData?.personalInfo?.name]
    );

    /**
     * Core compile function with:
     * - AbortController to cancel previous in-flight request
     * - Monotonic request ID to discard stale responses
     * - In-memory cache hit fast path
     * - Retry loop with exponential backoff
     * - Last-successful-PDF preservation on failure
     */
    const compilePdf = useCallback(
        async (force = false) => {
            // 1. Resolve active Typst source, prefer fresh Typst generated from current resumeData
            let effectiveTypstCode = '';
            if (resumeData) {
                try {
                    effectiveTypstCode = generateTypst(resumeData, template, theme);
                } catch (err) {
                    console.warn('Could not generate Typst code from resumeData:', err);
                }
            }
            if (!effectiveTypstCode) {
                effectiveTypstCode = typstCode.trim();
            }

            if (!effectiveTypstCode && !resumeData) {
                setStatus('idle');
                return;
            }

            // 2. Compute cache key
            const compileHash = await hashTextBrowser(
                effectiveTypstCode || JSON.stringify(resumeData || '') + template + theme
            );

            // 3. Check in-memory cache (skip on force)
            if (!force) {
                const cached = previewCache.get(compileHash);
                if (cached) {
                    setCompileMeta({ ...cached.meta, fromCache: true });
                    setCompileError(null);
                    setPdfUrl((prev) => {
                        if (prev && prev.startsWith('blob:') && prev !== cached.url) {
                            URL.revokeObjectURL(prev);
                        }
                        return cached.url;
                    });
                    setStatus('ready');
                    setRetryCount(0);
                    return;
                }
            }

            // 4. Cancel any in-flight request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // 5. Assign this compile a unique ID
            const thisRequestId = ++requestIdRef.current;

            setStatus('compiling');
            setCompileError(null);
            setIsAuthError(false);
            setRetryCount(0);

            const startTimestamp = performance.now();

            // 6. Retry loop
            for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
                // Bail if a newer compile has started
                if (requestIdRef.current !== thisRequestId) return;

                if (attempt > 0) {
                    setRetryCount(attempt);
                    await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt - 1] ?? 1500));
                    // Re-check after sleep
                    if (requestIdRef.current !== thisRequestId) return;
                }

                const controller = new AbortController();
                abortControllerRef.current = controller;

                try {
                    const response = await fetch('/api/v1/resume/compile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            typstCode: effectiveTypstCode || undefined,
                            resumeData: resumeData ?? undefined,
                            template,
                            theme,
                        }),
                        signal: controller.signal,
                    });

                    // Discard if superseded
                    if (requestIdRef.current !== thisRequestId) return;

                    const contentType = response.headers.get('content-type') || '';

                    if (!response.ok) {
                        let detail = `HTTP ${response.status}`;
                        // Read the body once as text, then try to parse it as JSON,
                        // calling response.json() and, on failure, response.text() on
                        // the same Response throws "body stream already read" because
                        // .json() already consumed the stream even when parsing fails.
                        try {
                            const raw = (await response.text()).trim();
                            if (raw) {
                                try {
                                    const errJson = JSON.parse(raw);
                                    detail = (errJson.details as string) || (errJson.error as string) || detail;
                                } catch {
                                    detail = raw.slice(0, 400);
                                }
                            }
                        } catch {
                            // Body unreadable, keep the HTTP status fallback.
                        }
                        // 4xx errors are not retryable
                        if (response.status < 500) {
                            throw Object.assign(new Error(detail), {
                                retryable: false,
                                authError: response.status === 401,
                            });
                        }
                        throw new Error(detail);
                    }

                    if (!contentType.includes('pdf')) {
                        const text = await response.text();
                        throw Object.assign(
                            new Error(text.slice(0, 300) || 'Server did not return a valid PDF.'),
                            { retryable: false }
                        );
                    }

                    const blob = await response.blob();

                    // Final stale check before mutating state
                    if (requestIdRef.current !== thisRequestId) return;

                    const elapsed = Math.round(performance.now() - startTimestamp);
                    setCompileDuration(elapsed);

                    const url = URL.createObjectURL(blob);
                    const meta: CompileMeta = {
                        provider: response.headers.get('X-Compile-Provider') || 'Typst Native Engine',
                        hash: response.headers.get('X-Compile-Hash') || compileHash,
                        compileTimeMs: elapsed,
                    };

                    previewCache.set(compileHash, { url, meta });
                    setCompileMeta(meta);

                    setPdfUrl((prev) => {
                        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
                        return url;
                    });

                    setStatus('ready');
                    setCompileError(null);
                    setRetryCount(0);
                    return; // success, stop retry loop

                } catch (error) {
                    if ((error as Error).name === 'AbortError') return; // intentionally cancelled
                    if (requestIdRef.current !== thisRequestId) return;

                    const isLastAttempt = attempt >= MAX_RETRIES;
                    const isRetryable = (error as any).retryable !== false;

                    if (isLastAttempt || !isRetryable) {
                        const message = error instanceof Error ? error.message : 'Compilation failed';
                        const authFailure = (error as { authError?: boolean }).authError === true;
                        console.error('[PdfPreview] compile error:', error);
                        setCompileError(message);
                        setIsAuthError(authFailure);
                        setStatus('failed');
                        // DO NOT clear pdfUrl, preserve last successful PDF
                        if (!authFailure) {
                            notify.error('Compilation failed', message.slice(0, 80), {
                                retry: () => compilePdf(true),
                            });
                        }
                        return;
                    }
                    // Otherwise loop continues to next attempt
                }
            }
        },
        [typstCode, resumeData, template, theme]
    );

    // Debounced auto-compile on data/template/theme change
    useEffect(() => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            compilePdf();
        }, 300);

        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
        };
    }, [compilePdf]);

    const handleZoomIn = () => setZoom((prev) => Math.min(150, prev + 10));
    const handleZoomOut = () => setZoom((prev) => Math.max(70, prev - 10));
    const handleResetZoom = () => setZoom(100);

    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const [exportingFormat, setExportingFormat] = useState<ExportFormatType | null>(null);
    const downloadMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
                setDownloadMenuOpen(false);
            }
        };
        if (downloadMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [downloadMenuOpen]);

    const handleExportFormat = async (fmt: ExportFormatType) => {
        if (fmt === 'pdf' && pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            notify.success('Download started', `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`);
            setDownloadMenuOpen(false);
            return;
        }

        if (!resumeData) {
            notify.error('No resume data', 'Please input resume information first');
            return;
        }

        setExportingFormat(fmt);
        try {
            await exportResume({
                resumeData,
                format: fmt,
                template,
                theme: { color: theme },
                typstCode,
                customFilename: `${candidateName.toLowerCase().replace(/\s+/g, '-')}-resume`,
            });
        } finally {
            setExportingFormat(null);
            setDownloadMenuOpen(false);
        }
    };

    const handleDownload = () => handleExportFormat('pdf');

    const handleOpenInNewTab = () => {
        if (!pdfUrl) return;
        window.open(pdfUrl, '_blank');
        notify.info('PDF opened in new tab');
    };

    const isLoading = status === 'compiling';
    const hasPdf = !!pdfUrl;

    return (
        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            {/* ================================================================= */}
            {/* 1. TOP EXECUTIVE TOOLBAR                                            */}
            {/* ================================================================= */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card relative z-20">
                {/* Left: Document Status & Badges */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-xs font-medium text-foreground shadow-2xs">
                        {status === 'ready' ? (
                            <>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                    {compileDuration ? `Compiled in ${compileDuration}ms` : 'Ready'}
                                </span>
                            </>
                        ) : isLoading ? (
                            <>
                                <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                                <span className="text-[11px] font-mono text-primary font-semibold">
                                    {retryCount > 0 ? `Retry ${retryCount}/${MAX_RETRIES}…` : 'Compiling…'}
                                </span>
                            </>
                        ) : status === 'failed' && isAuthError ? (
                            <>
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                <span className="text-[11px] font-mono text-amber-500 font-semibold">
                                    Sign in required
                                </span>
                            </>
                        ) : status === 'failed' ? (
                            <>
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                <span className="text-[11px] font-mono text-rose-500 font-semibold">
                                    Compile Error {hasPdf ? '(last PDF preserved)' : ''}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                <span className="text-[11px] font-mono text-amber-500 font-semibold">
                                    Preparing…
                                </span>
                            </>
                        )}
                    </div>

                    <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        {template} • {theme}
                    </Badge>

                    {compileMeta?.fromCache && (
                        <span className="hidden md:inline-flex text-[10px] font-mono text-muted-foreground/80">
                            (Cached)
                        </span>
                    )}
                </div>

                {/* Right: Zoom & Quick Action Controls */}
                <div className="flex items-center gap-1.5 ml-auto">
                    {/* Zoom Controls */}
                    <div className="hidden sm:flex items-center rounded-lg border border-border bg-background p-0.5 shadow-2xs">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded"
                            onClick={handleZoomOut}
                            disabled={zoom <= 70}
                            title="Zoom Out"
                        >
                            <ZoomOut className="h-3.5 w-3.5" />
                        </Button>
                        <button
                            type="button"
                            onClick={handleResetZoom}
                            className="px-1.5 text-[10px] font-mono font-medium hover:text-primary transition-colors"
                            title="Reset Zoom"
                        >
                            {zoom}%
                        </button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded"
                            onClick={handleZoomIn}
                            disabled={zoom >= 150}
                            title="Zoom In"
                        >
                            <ZoomIn className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {/* Recompile Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => compilePdf(true)}
                        disabled={isLoading}
                        className="h-7 px-2.5 text-xs gap-1.5 shadow-2xs"
                        title="Recompile PDF"
                    >
                        <RotateCcw className={cn('h-3 w-3', isLoading && 'animate-spin text-primary')} />
                        <span className="hidden md:inline">Recompile</span>
                    </Button>

                    {/* Open in New Tab */}
                    {hasPdf && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleOpenInNewTab}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Open in new window"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                    )}

                    {/* Multi-Format Download Split Button */}
                    {hasPdf && (
                        <div ref={downloadMenuRef} className="relative inline-flex items-center rounded-lg shadow-2xs">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleExportFormat('pdf')}
                                disabled={exportingFormat !== null}
                                className="h-7 px-2.5 sm:px-3 text-xs gap-1.5 bg-primary text-primary-foreground rounded-l-lg rounded-r-none border-r border-primary-foreground/20 cursor-pointer"
                                title="Download Vector PDF"
                            >
                                {exportingFormat === 'pdf' ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Download className="h-3.5 w-3.5" />
                                )}
                                <span className="font-medium hidden sm:inline">Download PDF</span>
                                <span className="font-medium sm:hidden">PDF</span>
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                                disabled={exportingFormat !== null}
                                className="h-7 px-1.5 text-xs bg-primary text-primary-foreground rounded-l-none rounded-r-lg cursor-pointer"
                                title="Export formats (Word, Markdown, JSON, Typst)"
                            >
                                <ChevronDown className="h-3 w-3" />
                            </Button>

                            {downloadMenuOpen && (
                                <div className="absolute right-0 top-9 z-[60] p-1.5 rounded-xl border border-border bg-popover shadow-xl w-56 text-xs text-popover-foreground space-y-0.5">
                                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                                        Download Resume As
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleExportFormat('pdf')}
                                        className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium cursor-pointer text-left transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
                                            <span>Vector PDF (Typst)</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-red-500 font-semibold">.pdf</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleExportFormat('docx')}
                                        className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium cursor-pointer text-left transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                                            <span>Word Document</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-amber-500 font-semibold">.doc</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleExportFormat('md')}
                                        className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium cursor-pointer text-left transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                                            <span>Plaintext Markdown</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-emerald-500 font-semibold">.md</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleExportFormat('json')}
                                        className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium cursor-pointer text-left transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
                                            <span>JSON Resume Data</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-blue-500 font-semibold">.json</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleExportFormat('typ')}
                                        className="flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted font-medium cursor-pointer text-left transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-purple-400 shrink-0" />
                                            <span>Typst Source Code</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-purple-500 font-semibold">.typ</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ================================================================= */}
            {/* 2. MAIN DOCUMENT DESK CANVAS                                       */}
            {/* ================================================================= */}
            {/* min-h is viewport-relative (clamped to sane bounds) rather than fixed
                per-breakpoint pixel tiers, so short/landscape viewports don't force
                empty scroll space just to satisfy a flat minimum. */}
            <div className="relative min-h-[clamp(420px,70vh,820px)] bg-muted/40 dark:bg-[#0d0e11] flex items-center justify-center p-2.5 sm:p-6 overflow-auto">
                {/* Desk Ambient Sheen in Dark Mode */}
                <div className="absolute inset-0 bg-[radial-gradient(#0071e3_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

                {/* PDF Document Sheet Frame, bg-white is intentional and stays literal in
                    both themes: this represents actual paper, which real printed resumes
                    and PDFs are always white regardless of the app's own light/dark theme. */}
                <div
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                    className="relative w-full max-w-[760px] aspect-[8.5/11] max-h-full rounded-xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.7)] border border-border overflow-hidden transition-transform duration-200 flex flex-col"
                >
                    {/* COMPILING OVERLAY */}
                    <AnimatePresence>
                        {isLoading && (
                            <TypstCompileVisualizer
                                templateName={template.toUpperCase()}
                                themeName={theme}
                            />
                        )}
                    </AnimatePresence>

                    {/* PDF IFRAME */}
                    {hasPdf ? (
                        <iframe
                            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full border-0 rounded-xl"
                            title="Resume PDF Preview"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 bg-card">
                            {status === 'failed' && isAuthError ? (
                                <div className="max-w-md w-full rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-4 shadow-sm">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                                        <LogIn className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-foreground">Sign in to compile & preview</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Your draft is saved on this device. Sign in to generate the PDF preview and export your resume.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 pt-1">
                                        <Button asChild size="sm" className="h-8 px-3 text-xs font-semibold gap-1.5">
                                            <Link href={`/login?redirect=${encodeURIComponent(pathname || '/editor')}`}>
                                                <LogIn className="h-3.5 w-3.5" />
                                                Sign In
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs font-medium gap-1.5">
                                            <Link href={`/signup?redirect=${encodeURIComponent(pathname || '/editor')}`}>
                                                <UserPlus className="h-3.5 w-3.5" />
                                                Create Account
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : status === 'failed' ? (
                                <div className="max-w-md w-full rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-left space-y-3 shadow-sm">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
                                        <AlertCircle className="h-5 w-5 shrink-0" />
                                        <span>Compilation Error</span>
                                    </div>
                                    <p className="text-xs text-rose-700 dark:text-rose-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                        {compileError || 'Unknown rendering issue.'}
                                    </p>
                                    <div className="pt-2 flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => compilePdf(true)}
                                            disabled={isLoading}
                                            className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            Retry Compilation
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 max-w-sm">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-sm">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-base font-bold text-foreground tracking-tight">
                                            Generating Document Preview
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Compiling your resume with native Typst typography and strict ATS alignment.
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => compilePdf(true)}
                                        disabled={isLoading}
                                        className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-1.5"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Compile Preview Now
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error banner overlaid on top of existing PDF (non-blocking) */}
                    {status === 'failed' && hasPdf && isAuthError && (
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/10 backdrop-blur-sm border-t border-primary/30 px-4 py-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <LogIn className="h-3.5 w-3.5 text-primary shrink-0" />
                                <p className="text-[11px] text-foreground truncate">
                                    Sign in to keep previewing changes to this resume
                                </p>
                            </div>
                            <Button asChild size="sm" className="h-7 px-2.5 text-xs shrink-0 gap-1.5">
                                <Link href={`/login?redirect=${encodeURIComponent(pathname || '/editor')}`}>
                                    Sign In
                                </Link>
                            </Button>
                        </div>
                    )}
                    {status === 'failed' && hasPdf && !isAuthError && (
                        <div className="absolute bottom-0 left-0 right-0 bg-rose-950/90 backdrop-blur-sm border-t border-rose-500/30 px-4 py-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                                <p className="text-[11px] text-rose-300 font-mono truncate">
                                    {compileError?.slice(0, 120) || 'Compile error, last PDF preserved'}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => compilePdf(true)}
                                disabled={isLoading}
                                className="h-7 px-2.5 text-xs bg-rose-600 hover:bg-rose-700 text-white shrink-0 gap-1.5"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Retry
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* ================================================================= */}
            {/* 3. BOTTOM TELEMETRY FOOTER                                         */}
            {/* ================================================================= */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-border bg-muted/20 text-[10px] font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-foreground font-medium">
                        <Zap className="h-3 w-3 text-primary" />
                        Typst Vector AST
                    </span>
                    <span>•</span>
                    <span>Single-Page Flow</span>
                    {retryCount > 0 && isLoading && (
                        <>
                            <span>•</span>
                            <span className="text-amber-500">Retry {retryCount}/{MAX_RETRIES}</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {compileMeta?.hash && (
                        <span>AST: {compileMeta.hash.slice(0, 8)}</span>
                    )}
                    <span>Target: Standard A4 / US Letter</span>
                </div>
            </div>
        </div>
    );
}
