"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
    RotateCcw, 
    Download, 
    ExternalLink, 
    ZoomIn, 
    ZoomOut, 
    Maximize2, 
    FileText, 
    CheckCircle2, 
    Zap, 
    AlertCircle, 
    Sparkles,
    FileCode2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { hashTextBrowser } from '@/lib/content-hash';
import { generateTypst } from '@/lib/typst-generator';
import { motion, AnimatePresence } from 'framer-motion';
import { TypstCompileVisualizer } from '@/components/ui/typst-compile-visualizer';

type PreviewStatus = 'idle' | 'compiling' | 'ready' | 'failed';

type CompileMeta = {
    provider?: string;
    hash?: string;
    fromCache?: boolean;
    compileTimeMs?: number;
};

const previewCache = new Map<string, { url: string; meta: CompileMeta }>();

export function PdfPreview() {
    const { resumeData, generatedResume, template, theme } = useAppStore();
    const typstCode = generatedResume?.typst || '';

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<PreviewStatus>('idle');
    const [compileError, setCompileError] = useState<string | null>(null);
    const [compileMeta, setCompileMeta] = useState<CompileMeta | null>(null);
    const [zoom, setZoom] = useState<number>(100);
    const [compileDuration, setCompileDuration] = useState<number | null>(null);

    const debounceRef = useRef<number | null>(null);

    const candidateName = resumeData?.personalInfo?.name || 'Resume';

    const compilePdf = useCallback(async (force = false) => {
        // 1. Resolve active Typst source
        let effectiveTypstCode = typstCode.trim();
        if (!effectiveTypstCode && resumeData) {
            try {
                effectiveTypstCode = generateTypst(resumeData, template, theme);
            } catch (err) {
                console.warn('Could not generate fallback Typst code:', err);
            }
        }

        if (!effectiveTypstCode && !resumeData) {
            setStatus('idle');
            return;
        }

        const startTimestamp = performance.now();
        const compileHash = await hashTextBrowser(
            effectiveTypstCode || JSON.stringify(resumeData || '') + template + theme
        );

        // 2. Check in-memory cache
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
                return;
            }
        }

        setStatus('compiling');
        setCompileError(null);

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
                throw new Error(text.slice(0, 300) || 'Server did not return a valid PDF.');
            }

            const blob = await response.blob();
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
                if (prev && prev.startsWith('blob:')) {
                    URL.revokeObjectURL(prev);
                }
                return url;
            });

            setStatus('ready');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Compilation failed';
            console.error('PDF Preview compile error:', error);
            setCompileError(message);
            setStatus('failed');
            toast.error(`PDF compile error: ${message.slice(0, 100)}`);
        }
    }, [typstCode, resumeData, template, theme]);

    // Debounced automatic compilation whenever resume data or styling changes
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

    const handleDownload = () => {
        if (!pdfUrl) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started!');
    };

    const handleOpenInNewTab = () => {
        if (!pdfUrl) return;
        window.open(pdfUrl, '_blank');
    };

    const isLoading = status === 'compiling';

    return (
        <div className="flex flex-col rounded-2xl border border-border/80 dark:border-white/10 bg-card/90 dark:bg-[#0a0c10] shadow-xl overflow-hidden backdrop-blur-md">
            {/* ========================================================================= */}
            {/* 1. TOP EXECUTIVE TOOLBAR                                                  */}
            {/* ========================================================================= */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border/70 dark:border-white/10 bg-muted/30 dark:bg-[#101217]">
                {/* Left: Document Status & Badges */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border/70 dark:border-white/10 text-xs font-medium text-foreground shadow-2xs">
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
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                                </span>
                                <span className="text-[11px] font-mono text-primary font-semibold">
                                    Compiling AST...
                                </span>
                            </>
                        ) : status === 'failed' ? (
                            <>
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                <span className="text-[11px] font-mono text-rose-500 font-semibold">
                                    Compile Error
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                <span className="text-[11px] font-mono text-amber-500 font-semibold">
                                    Preparing...
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
                    <div className="hidden sm:flex items-center rounded-lg border border-border/70 dark:border-white/10 bg-background p-0.5 shadow-2xs">
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
                        <RotateCcw className={`h-3 w-3 ${isLoading ? 'animate-spin text-primary' : ''}`} />
                        <span className="hidden md:inline">Recompile</span>
                    </Button>

                    {/* Open in New Tab */}
                    {pdfUrl && (
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

                    {/* Download Button */}
                    {pdfUrl && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleDownload}
                            className="h-7 px-2.5 sm:px-3 text-xs gap-1.5 bg-primary text-primary-foreground shadow-2xs"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span className="font-medium hidden sm:inline">Download PDF</span>
                            <span className="font-medium sm:hidden">PDF</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. MAIN DOCUMENT DESK CANVAS                                              */}
            {/* ========================================================================= */}
            <div className="relative min-h-[500px] sm:min-h-[760px] md:min-h-[820px] bg-slate-200/70 dark:bg-[#07080a] flex items-center justify-center p-2.5 sm:p-6 overflow-auto">
                {/* Desk Ambient Sheen in Dark Mode */}
                <div className="absolute inset-0 bg-[radial-gradient(#0071e3_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.06] pointer-events-none" />

                {/* PDF Document Sheet Frame */}
                <div 
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                    className="relative w-full max-w-[760px] h-[520px] sm:h-[780px] md:h-[840px] rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.7)] border border-slate-300 dark:border-white/10 overflow-hidden transition-transform duration-200 flex flex-col"
                >
                    {/* ACTIVE COMPILING STATE (Luminous LiDAR Laser & Orbital AST Synthesis Visualizer) */}
                    <AnimatePresence>
                        {isLoading && (
                            <TypstCompileVisualizer
                                templateName={template.toUpperCase()}
                                themeName={theme}
                            />
                        )}
                    </AnimatePresence>

                    {/* PDF IFRAME / VIEWER */}
                    {pdfUrl ? (
                        <iframe
                            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full border-0 rounded-xl"
                            title="Resume PDF Preview"
                        />
                    ) : (
                        /* HIGH-CONTRAST EMPTY / ERROR STATE */
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 bg-slate-50 dark:bg-[#11141a]">
                            {status === 'failed' ? (
                                <div className="max-w-md w-full rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-left space-y-3 shadow-sm">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
                                        <AlertCircle className="h-5 w-5 shrink-0" />
                                        <span>Compilation Note</span>
                                    </div>
                                    <p className="text-xs text-rose-700 dark:text-rose-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                        {compileError || 'Unknown rendering issue.'}
                                    </p>
                                    <div className="pt-2 flex justify-end">
                                        <Button
                                            size="sm"
                                            onClick={() => compilePdf(true)}
                                            className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                                        >
                                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
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
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                            Generating Document Preview
                                        </h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            Compiling your resume with sub-50ms native typography and strict ATS scanner alignment.
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => compilePdf(true)}
                                        className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                    >
                                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                        Compile Preview Now
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 3. BOTTOM TELEMETRY FOOTER                                                */}
            {/* ========================================================================= */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-border/70 dark:border-white/10 bg-muted/20 dark:bg-[#0c0e13] text-[10px] font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-foreground font-medium">
                        <Zap className="h-3 w-3 text-primary" />
                        Typst Vector AST
                    </span>
                    <span>•</span>
                    <span>Single-Page Flow</span>
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
