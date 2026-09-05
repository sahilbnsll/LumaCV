"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { DEMO_RESUME_DATA } from '@/lib/demo-data';
import { TemplateType } from '@/lib/resume-schema';
import { generateTypst } from '@/lib/typst-generator';
import { PALETTES } from '@/lib/design-tokens';
import Image from 'next/image';
import {
    Download,
    ArrowRight,
    Check,
    Undo2,
    Palette,
    Sparkles,
    ShieldCheck,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MiniLayoutRepresentation } from '@/components/template-selector';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/animated-counter';

const templateOptions: Array<{ id: TemplateType; name: string; style: string }> = [
    { id: 'modern', name: 'Modern', style: 'Clean Sans-Serif' },
    { id: 'classic', name: 'Classic', style: 'Ivy League Serif' },
    { id: 'engineering', name: 'Engineering', style: 'High-Density Technical' },
    { id: 'compact', name: 'Compact', style: 'Space-Optimized' },
    { id: 'two_column', name: 'Two-Column', style: 'Asymmetric Sidebar' },
    { id: 'ats_safe', name: 'ATS-Safe', style: 'Linear Pure Text' },
];

export default function DemoPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
    const [selectedTheme, setSelectedTheme] = useState('none');
    const [activeTab, setActiveTab] = useState<'score' | 'diff' | 'keywords'>('score');
    const [revertedMap, setRevertedMap] = useState<Record<number, boolean>>({});
    const [zoomLevel, setZoomLevel] = useState<number>(100);

    const demoScore = 89;
    const originalScore = 67;
    const delta = demoScore - originalScore;

    const explainableBullets = useMemo(() => {
        return [
            {
                role: 'Staff Full Stack Engineer',
                company: 'Vercel Inc.',
                original: 'Worked on web applications with Next.js and helped improve latency for API routes.',
                tailored: 'Architected edge data delivery layer using Next.js App Router and TypeScript, reducing p99 API response latencies by 38% for 4M+ daily active sessions.',
                reason: 'Quantified impact metric (+38% p99) and highlighted target role stack keywords (Next.js App Router, TypeScript).',
            },
            {
                role: 'Staff Full Stack Engineer',
                company: 'Vercel Inc.',
                original: 'Helped reduce bundle size on the main console and improved web vitals.',
                tailored: 'Led frontend performance task force cutting total JavaScript bundle sizes across flagship web console by 310KB and improving Core Web Vitals to 99+.',
                reason: 'Replaced passive verb with leadership action verb and quantified performance gains (310KB, 99+ CWV).',
            },
            {
                role: 'Senior Software Engineer',
                company: 'Cloudflare',
                original: 'Built a proxy and caching layer for enterprise traffic with good uptime.',
                tailored: 'Engineered high-throughput caching and proxy orchestration services handling 180k+ requests/sec with a 99.99% uptime availability SLA.',
                reason: 'Aligned scale metrics (180k+ req/sec, 99.99% SLA) to match high-volume distributed systems requirement in Stripe JD.',
            }
        ];
    }, []);

    const handleDownloadDemoPdf = async () => {
        const toastId = toast.loading('Compiling pixel-perfect demo PDF…');
        try {
            const typstCode = generateTypst(DEMO_RESUME_DATA, selectedTemplate, selectedTheme);
            const res = await fetch('/api/v1/resume/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: DEMO_RESUME_DATA,
                    template: selectedTemplate,
                    theme: selectedTheme,
                    typstCode,
                }),
            });
            if (!res.ok) throw new Error('Compile failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Alex_Chen_Stripe_Sample_${selectedTemplate}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Downloaded compiled sample PDF', { id: toastId });
        } catch {
            toast.error('Sample compilation error', { id: toastId });
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary flex flex-col justify-between">
            <AppHeader />

            <main id="main-content" className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex-1">
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-6 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2">
                            <Sparkles className="h-3 w-3" />
                            <span>Interactive Demonstration</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
                            Live Optimization Sample
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                            Target Role: <strong className="text-foreground">Senior Full Stack Engineer @ Stripe</strong> • Candidate: Alex Chen
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleDownloadDemoPdf}
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs font-medium border-border/80 hover:bg-muted/40 gap-1.5"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Sample PDF</span>
                        </Button>

                        <Button asChild size="sm" className="h-9 px-4 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs">
                            <Link href="/builder">
                                <span>Tailor Your Own Resume</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Workspace Split Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Interactive Controls, ATS Score & Diffs */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* Interactive Template Bar */}
                        <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4 shadow-card">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-display font-bold uppercase tracking-wider text-foreground">
                                    Switch Typesetting Template
                                </span>
                                <span className="text-[11px] font-mono text-muted-foreground">
                                    Sub-50ms render
                                </span>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {templateOptions.map((t) => {
                                    const isSelected = selectedTemplate === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setSelectedTemplate(t.id)}
                                            className={cn(
                                                "group flex flex-col justify-between rounded-xl border p-2 text-left transition-all",
                                                isSelected
                                                    ? "border-primary ring-2 ring-primary/40 bg-primary/[0.04] shadow-xs"
                                                    : "border-border/60 bg-muted/20 hover:border-primary/40"
                                            )}
                                        >
                                            <MiniLayoutRepresentation type={t.id} isSelected={isSelected} />
                                            <span className="mt-2 text-[10px] font-semibold text-foreground block truncate">
                                                {t.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Accent Palette Swatches */}
                            <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Palette className="h-3.5 w-3.5 text-primary" />
                                    Accent Palette:
                                </span>

                                <div className="flex items-center gap-2">
                                    {Object.values(PALETTES).map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setSelectedTheme(p.id)}
                                            aria-label={`Select ${p.label} palette`}
                                            className={cn(
                                                "h-6 w-6 rounded-full border transition-transform flex items-center justify-center",
                                                selectedTheme === p.id
                                                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                                                    : "border-border/60 hover:scale-105 opacity-80 hover:opacity-100"
                                            )}
                                            style={{ backgroundColor: p.hex }}
                                            title={p.label}
                                        >
                                            {selectedTheme === p.id && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Analysis & Diff Tabs */}
                        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card space-y-4">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'score' | 'diff' | 'keywords')}>
                                <TabsList className="grid grid-cols-3 h-9 bg-muted/30 p-1">
                                    <TabsTrigger value="score" className="text-xs font-medium">ATS Match Score</TabsTrigger>
                                    <TabsTrigger value="diff" className="text-xs font-medium">Bullet Diff Studio</TabsTrigger>
                                    <TabsTrigger value="keywords" className="text-xs font-medium">Keywords</TabsTrigger>
                                </TabsList>

                                {/* TAB 1: ATS SCORE */}
                                <TabsContent value="score" className="space-y-4 mt-4">
                                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 flex items-center justify-between">
                                        <div>
                                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block font-display">
                                                Tailored Alignment Score
                                            </span>
                                            <div className="flex items-baseline gap-2 mt-0.5">
                                                <span className="text-3xl font-display font-bold text-foreground">
                                                    <AnimatedCounter value={demoScore} suffix="/100" />
                                                </span>
                                                <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    +{delta} pts tailored gain
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right text-[11px] text-muted-foreground font-mono">
                                            <span>Original: 67%</span>
                                            <span className="block text-emerald-500">Target Match: 89%</span>
                                        </div>
                                    </div>

                                    {/* 4 Vector Category Instruments */}
                                    <div className="space-y-2 text-xs">
                                        <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="font-medium text-foreground">Required Skills (Weight: 40%)</span>
                                                <span className="font-bold text-emerald-500 font-mono">94% (+27%)</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="font-medium text-foreground">Responsibilities Alignment (Weight: 25%)</span>
                                                <span className="font-bold text-primary font-mono">88% (+18%)</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                                                <div className="h-full bg-primary rounded-full w-[88%]" />
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="font-medium text-foreground">Preferred Competencies (Weight: 20%)</span>
                                                <span className="font-bold text-primary font-mono">85% (+20%)</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                                                <div className="h-full bg-primary rounded-full w-[85%]" />
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="font-medium text-foreground">Domain Terminology (Weight: 15%)</span>
                                                <span className="font-bold text-primary font-mono">90% (+15%)</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                                                <div className="h-full bg-primary rounded-full w-[90%]" />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* TAB 2: BULLET DIFF STUDIO */}
                                <TabsContent value="diff" className="space-y-3 mt-4">
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Click &ldquo;Revert&rdquo; to test live rollback to the candidate&apos;s un-tailored draft:
                                    </p>

                                    <div className="space-y-3">
                                        {explainableBullets.map((item, idx) => {
                                            const isReverted = revertedMap[idx];
                                            return (
                                                <div key={idx} className="rounded-xl border border-border/60 bg-muted/15 p-3.5 space-y-2 text-xs">
                                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                        <span className="font-semibold text-foreground">{item.role} • {item.company}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRevertedMap(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                                            className="text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                                                        >
                                                            {isReverted ? (
                                                                <>
                                                                    <Undo2 className="h-3 w-3" /> Re-apply Tailored
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Check className="h-3 w-3 text-emerald-500" /> Accepted
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        {isReverted ? (
                                                            <div className="p-2.5 rounded-lg bg-muted/40 text-[11px] text-muted-foreground font-mono">
                                                                {item.original}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="p-2 rounded-lg bg-muted/40 text-[10px] text-muted-foreground line-through font-mono">
                                                                    {item.original}
                                                                </div>
                                                                <div className="p-2.5 rounded-lg bg-primary/[0.06] border border-primary/20 text-[11px] text-foreground font-medium leading-relaxed">
                                                                    {item.tailored}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="text-[10px] text-muted-foreground bg-background/60 p-2 rounded border border-border/40">
                                                        <strong>Why:</strong> {item.reason}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </TabsContent>

                                {/* TAB 3: KEYWORDS */}
                                <TabsContent value="keywords" className="space-y-3 mt-4">
                                    <span className="text-xs font-semibold text-foreground block">
                                        Stripe Job Competencies Detected
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['Next.js App Router', 'TypeScript', 'PostgreSQL', 'Microservices', 'Distributed Systems', 'Redis', 'REST APIs', 'Edge Runtime', 'p99 Latency'].map(k => (
                                            <span key={k} className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                                                ✓ {k}
                                            </span>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Right Column: Live Responsive Document / Compiled PDF Preview */}
                    <div className="lg:col-span-6 space-y-4">
                        {/* Preview Top Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-display font-semibold text-foreground">Live Typeset Preview</span>
                                <span
                                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase transition-colors"
                                    style={{
                                        backgroundColor: `${PALETTES[selectedTheme]?.hex || '#3b82f6'}20`,
                                        color: PALETTES[selectedTheme]?.hex || '#3b82f6',
                                    }}
                                >
                                    {selectedTemplate.replace('_', ' ')} • {PALETTES[selectedTheme]?.label || 'Default'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                                {/* Zoom Controls */}
                                <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/60 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setZoomLevel(prev => Math.max(70, prev - 15))}
                                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                                        title="Zoom Out"
                                    >
                                        <ZoomOut className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setZoomLevel(100)}
                                        className="font-mono text-[10px] px-1.5 min-w-[34px] text-center font-medium hover:text-primary transition-colors"
                                        title="Reset Zoom"
                                    >
                                        {zoomLevel}%
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setZoomLevel(prev => Math.min(140, prev + 15))}
                                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                                        title="Zoom In"
                                    >
                                        <ZoomIn className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                                    <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: PALETTES[selectedTheme]?.hex || '#10b981' }} />
                                    <span>Typst 0.15.1</span>
                                </div>
                            </div>
                        </div>

                        {/* Document Canvas Container */}
                        <div
                            className="rounded-2xl border border-border/80 bg-muted/15 p-4 sm:p-6 shadow-modal text-left transition-all duration-300 overflow-auto flex flex-col items-center justify-start min-h-[680px] max-h-[920px]"
                        >
                            {/* Actual Compiled Typst Resume Document */}
                            <div
                                className="transition-all duration-300 w-full max-w-[640px] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-border/80 bg-white relative group"
                                style={{
                                    transform: `scale(${zoomLevel / 100})`,
                                    transformOrigin: 'top center',
                                }}
                            >
                                <Image
                                    key={`${selectedTemplate}-${selectedTheme}`}
                                    src={`/templates/renders/${selectedTemplate}-${selectedTheme}.png`}
                                    alt={`Compiled Typst resume in ${selectedTemplate} template with ${selectedTheme} palette`}
                                    width={1190}
                                    height={1684}
                                    className="w-full h-auto object-contain select-none transition-opacity duration-200"
                                    priority
                                />

                                {/* Subtle Overlay with quick actions */}
                                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border/80 shadow-md text-xs flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-muted-foreground">Typst Native Vector</span>
                                    <button
                                        onClick={handleDownloadDemoPdf}
                                        className="font-medium text-[11px] text-primary hover:underline flex items-center gap-1"
                                    >
                                        <Download className="h-3 w-3" />
                                        <span>Download PDF</span>
                                    </button>
                                </div>
                            </div>

                            {/* Canvas Bottom Status */}
                            <div className="w-full pt-4 mt-6 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5 font-medium" style={{ color: PALETTES[selectedTheme]?.hex || '#10b981' }}>
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Actual Typst Compiler Output • 100% Guaranteed 1-Page
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground/70">
                                    Typst Engine v0.15.1
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
