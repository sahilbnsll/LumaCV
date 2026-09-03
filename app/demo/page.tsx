"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { DEMO_RESUME_DATA } from '@/lib/demo-data';
import { TemplateType } from '@/lib/resume-schema';
import { generateTypst } from '@/lib/typst-generator';
import {
    Download,
    ArrowRight,
    TrendingUp,
    CheckCircle2,
    Check,
    Undo2,
    Palette,
    Layers,
    FileCheck
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MiniLayoutRepresentation } from '@/components/template-selector';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';


const templateOptions: Array<{ id: TemplateType; name: string; style: string }> = [
    { id: 'modern', name: 'Modern', style: 'Clean Sans-Serif' },
    { id: 'classic', name: 'Classic', style: 'Ivy League Serif' },
    { id: 'engineering', name: 'Engineering', style: 'High-Density Technical' },
    { id: 'compact', name: 'Compact', style: 'Space-Optimized' },
    { id: 'two_column', name: 'Two-Column', style: 'Asymmetric Sidebar' },
    { id: 'ats_safe', name: 'ATS-Safe', style: 'Linear Pure Text' },
];

const colorSwatches = [
    { id: 'none', label: 'Default Slate', hex: '#64748B' },
    { id: 'navy', label: 'Deep Navy', hex: '#1E3A8A' },
    { id: 'cobalt', label: 'Cobalt Blue', hex: '#1E40AF' },
    { id: 'emerald', label: 'Emerald Green', hex: '#047857' },
    { id: 'burgundy', label: 'Burgundy Wine', hex: '#881337' },
    { id: 'teal', label: 'Nordic Teal', hex: '#0E7490' },
    { id: 'slate', label: 'Graphite', hex: '#334155' },
    { id: 'black', label: 'Pure Black', hex: '#000000' },
];

export default function DemoPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
    const [selectedTheme, setSelectedTheme] = useState('none');
    const [activeTab, setActiveTab] = useState<'score' | 'diff' | 'keywords'>('score');
    const [revertedMap, setRevertedMap] = useState<Record<number, boolean>>({});

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
        const toastId = toast.loading('Compiling pixel-perfect demo PDF...');
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
            a.download = `Alex_Morgan_Tailored_${selectedTemplate}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Downloaded Sample PDF', { id: toastId });
        } catch {
            toast.error('Compile failed', { id: toastId });
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            {/* Public Demo Notification Banner */}
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5">
                <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-foreground">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-semibold">Interactive Demo Mode:</span>
                        <span className="text-muted-foreground">
                            Viewing sample candidate (Alex Morgan) tailored for <strong>Senior Full Stack Engineer @ Stripe</strong>.
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild size="sm" className="h-7 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm">
                            <Link href="/builder">
                                Tailor Your Own Resume
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
                {/* Demo Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card">
                    <div>
                        <h1 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                            <span>Alex Morgan — Senior Full Stack Engineer @ Stripe</span>
                            <span className="rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                                {demoScore}/100 Match
                            </span>
                        </h1>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Sub-50ms native formatting • ATS-ready vector document
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleDownloadDemoPdf}
                            className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Sample PDF</span>
                        </Button>

                        <Button asChild variant="outline" size="sm" className="h-8 text-xs font-medium border-border/70 hover:bg-muted/40">
                            <Link href="/builder">Start With Your Resume</Link>
                        </Button>
                    </div>
                </div>

                {/* 60/40 Split Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* LEFT (60%): Live Preview & Visual Templates Below */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* Live Sample Preview Frame */}
                        <div className="rounded-xl border border-border/70 overflow-hidden bg-white shadow-xl h-[760px] relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`/templates/${selectedTemplate}.png`}
                                alt={`${selectedTemplate} template preview`}
                                className="w-full h-full object-contain object-top"
                            />
                        </div>


                        {/* Design & Template Controls (Positioned Below Document) */}
                        <div className="rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-4 space-y-3.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Layers className="h-3.5 w-3.5 text-primary" />
                                    Choose Typesetting Template
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    Click any template to switch instantly
                                </span>
                            </div>

                            {/* Template mini cards with real PNGs */}
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                                {templateOptions.map((opt) => {
                                    const isSelected = selectedTemplate === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => setSelectedTemplate(opt.id)}
                                            className={cn(
                                                "group flex flex-col rounded-lg border p-1.5 text-left transition-all",
                                                isSelected
                                                    ? "border-primary ring-2 ring-primary/40 bg-primary/[0.04] shadow-sm"
                                                    : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
                                            )}
                                        >
                                            <MiniLayoutRepresentation type={opt.id} isSelected={isSelected} />
                                            <div className="mt-2 flex items-center justify-between text-[11px]">
                                                <span className="font-semibold text-foreground truncate">{opt.name}</span>
                                                {isSelected && <Check className="h-3 w-3 text-primary stroke-[3]" />}
                                            </div>
                                        </button>

                                    );
                                })}
                            </div>

                            {/* Color Swatches */}
                            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                    <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                                    Accent Palette
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {colorSwatches.map((swatch) => (
                                        <button
                                            key={swatch.id}
                                            onClick={() => setSelectedTheme(swatch.id)}
                                            className={cn(
                                                "h-5 w-5 rounded-full border transition-transform",
                                                selectedTheme === swatch.id
                                                    ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110"
                                                    : "border-border/60 hover:scale-105 opacity-80 hover:opacity-100"
                                            )}
                                            style={{ backgroundColor: swatch.hex }}
                                            title={swatch.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT (40%): Focused Intelligence Tabs */}
                    <div className="lg:col-span-5 rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-4 shadow-md space-y-4">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'score' | 'diff' | 'keywords')} className="w-full">
                            <TabsList className="grid grid-cols-3 h-8 bg-muted/40 p-0.5 text-xs">
                                <TabsTrigger value="score" className="text-[11px]">Match Score</TabsTrigger>
                                <TabsTrigger value="diff" className="text-[11px]">AI Diffs</TabsTrigger>
                                <TabsTrigger value="keywords" className="text-[11px]">Keywords</TabsTrigger>
                            </TabsList>

                            {/* TAB 1: Match Score & Analysis */}
                            <TabsContent value="score" className="space-y-4 mt-4">
                                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                                        ATS Alignment Score
                                    </span>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="text-3xl font-extrabold text-foreground tabular-nums">
                                            {demoScore}
                                        </span>
                                        <span className="text-xs text-muted-foreground">/ 100</span>
                                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                                            <TrendingUp className="h-3 w-3" />
                                            +{delta} pts from original
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Calculated from Stripe Senior Full Stack JD requirements.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {[
                                        { label: 'Required Skills', ratio: 94, weight: 40 },
                                        { label: 'Responsibilities Alignment', ratio: 88, weight: 25 },
                                        { label: 'Preferred Stack & Tools', ratio: 84, weight: 20 },
                                        { label: 'Core Technical Terminology', ratio: 90, weight: 15 },
                                    ].map((cat) => (
                                        <div key={cat.label} className="rounded-lg border border-border/40 bg-muted/20 p-2.5 space-y-1 text-xs">
                                            <div className="flex justify-between font-medium">
                                                <span>{cat.label}</span>
                                                <span className="font-semibold text-emerald-500">{cat.ratio}%</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cat.ratio}%` }} />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground block">
                                                Weight: {cat.weight}% of total score
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Quality Checks & Page Warnings */}
                                <div className="rounded-lg border border-border/40 bg-muted/10 p-3 space-y-2 text-xs">
                                    <span className="font-semibold text-foreground block flex items-center gap-1.5">
                                        <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
                                        Document Quality & Layout Checks
                                    </span>
                                    <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                                        <li className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                            <span><strong>Page Fit:</strong> Fits cleanly onto 1 page with no overflow.</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                            <span><strong>Action Verbs:</strong> 100% of experience bullets start with strong past-tense verbs.</span>
                                        </li>
                                        <li className="flex items-center gap-1.5">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                            <span><strong>Quantifiable Metrics:</strong> 6 quantifiable impact metrics included.</span>
                                        </li>
                                    </ul>
                                </div>
                            </TabsContent>

                            {/* TAB 2: AI Diffs */}
                            <TabsContent value="diff" className="space-y-3 mt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-foreground">
                                        Before → After Bullet Alignments
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">3 changes</span>
                                </div>

                                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                                    {explainableBullets.map((item, idx) => {
                                        const isReverted = revertedMap[idx];
                                        return (
                                            <div key={idx} className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2 text-xs">
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span className="font-semibold text-foreground">{item.role} • {item.company}</span>
                                                    <button
                                                        onClick={() => setRevertedMap(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                                        className="text-primary hover:underline flex items-center gap-1 font-medium"
                                                    >
                                                        {isReverted ? (
                                                            <>
                                                                <Undo2 className="h-3 w-3" /> Re-apply AI Version
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check className="h-3 w-3 text-emerald-500" /> Accepted
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Before / After comparison */}
                                                <div className="space-y-1.5">
                                                    <div className="p-2 rounded bg-muted/40 text-[11px] text-muted-foreground line-through">
                                                        {item.original}
                                                    </div>
                                                    <div className="p-2 rounded bg-primary/[0.06] border border-primary/20 text-[11px] text-foreground font-medium">
                                                        {item.tailored}
                                                    </div>
                                                </div>

                                                <div className="text-[10px] text-muted-foreground leading-relaxed">
                                                    <strong className="text-primary">Reason:</strong> {item.reason}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                            {/* TAB 3: Keywords */}
                            <TabsContent value="keywords" className="space-y-4 mt-4">
                                <div>
                                    <span className="text-xs font-semibold text-foreground block">
                                        Target JD Keywords & Coverage
                                    </span>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Core technical requirements identified in Stripe Senior Full Stack Engineer role.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[11px] font-medium text-emerald-500 flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Matched in Resume (14 terms)
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['TypeScript', 'React 19', 'Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'WebSockets', 'GraphQL', 'AWS (ECS)', 'Docker', 'Distributed Systems', 'CI/CD', 'p99 Latency', 'Core Web Vitals'].map(k => (
                                            <span key={k} className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-border/40">
                                    <span className="text-[11px] font-medium text-muted-foreground">
                                        Missing from Resume (Optional Terms)
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['Apache Kafka', 'gRPC', 'FinOps'].map(k => (
                                            <span key={k} className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        These terms were mentioned as preferred qualifications in the JD.
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
