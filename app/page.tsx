"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import {
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Cpu,
    ChevronRight,
    Heart,
    Copy,
    CheckCheck,
    Wallet,
    Lock,
    Scale
} from 'lucide-react';
import { MiniLayoutRepresentation } from '@/components/template-selector';
import { TemplateType } from '@/lib/resume-schema';
import { AnimatedCounter } from '@/components/animated-counter';
import { toast } from 'sonner';

const templates = [
    {
        id: 'modern',
        name: 'Modern',
        style: 'Clean Sans-Serif',
        tag: 'Flagship Tech',
        desc: 'Left-aligned header with colored category dividers and contact icons. Engineered for product and engineering roles.',
    },
    {
        id: 'classic',
        name: 'Classic',
        style: 'Ivy League Serif',
        tag: 'Executive & Finance',
        desc: 'Traditional Harvard-style serif typography with elegant horizontal dividing rules. Respected by conservative hiring boards.',
    },
    {
        id: 'engineering',
        name: 'Engineering',
        style: 'Dual-Rule Technical',
        tag: 'Systems & DevOps',
        desc: 'High-density two-tier header designed specifically for infrastructure, platform, and backend engineers.',
    },
    {
        id: 'compact',
        name: 'Compact',
        style: 'Space-Optimized',
        tag: 'Senior (5+ Roles)',
        desc: 'Engineered with tight typographic line-heights and margins to fit extensive work histories onto a single crisp page.',
    },
    {
        id: 'two_column',
        name: 'Two-Column',
        style: 'Asymmetric Sidebar',
        tag: 'Design & Data',
        desc: 'Organized split layout placing technical competencies and education in a dedicated 30% left column.',
    },
    {
        id: 'ats_safe',
        name: 'ATS Safe',
        style: 'Linear Pure Text',
        tag: '100% Machine Scannable',
        desc: 'Strictly linear single-column structure guaranteed to parse cleanly across high-volume enterprise filters.',
    },
];

export default function LandingPage() {
    const [copiedPayment, setCopiedPayment] = useState(false);
    const paymentHandle = "sahil.bansal@superyes";

    const handleCopyPayment = () => {
        navigator.clipboard.writeText(paymentHandle);
        setCopiedPayment(true);
        toast.success(`Copied "${paymentHandle}" to clipboard!`);
        setTimeout(() => setCopiedPayment(false), 2500);
    };

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary flex flex-col justify-between">
            <AppHeader />

            <main id="main-content" className="flex-1">
                {/* 1. HERO SECTION */}
                <section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-28 border-b border-border/40">
                    {/* Ambient Lighting Accents */}
                    <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 h-[420px] w-[800px] rounded-full bg-primary/10 blur-[140px]" />
                    <div className="pointer-events-none absolute right-10 top-1/2 h-[260px] w-[260px] rounded-full bg-emerald-500/5 blur-[100px]" />

                    <div className="mx-auto max-w-6xl px-4 sm:px-6 relative">
                        <div className="mx-auto max-w-3xl text-center space-y-6">
                            {/* System Status Pill */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs text-primary font-medium shadow-xs">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Native Vector Engine • Sub-50ms Typst PDF Compilation</span>
                            </div>

                            {/* Main Value Proposition */}
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-foreground leading-[1.08]">
                                One authentic resume. Tailored to every job in{' '}
                                <span className="text-primary font-extrabold">30 seconds</span>.
                            </h1>

                            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Stop blasting generic PDF applications. LumaCV analyzes the target job description, maps your real-world achievements to required skills, and compiles pixel-perfect, ATS-proven PDFs in milliseconds.
                            </p>

                            {/* Primary Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                <Button asChild size="lg" className="h-11 px-7 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-elevated">
                                    <Link href="/builder">
                                        <span>Start Tailoring Free</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>

                                <Button asChild variant="outline" size="lg" className="h-11 px-6 text-sm font-medium border-border/80 hover:bg-muted/40">
                                    <Link href="/demo">
                                        View Live Sample CV
                                    </Link>
                                </Button>
                            </div>

                            {/* Trust Signals */}
                            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    Sub-50ms Vector Compilation
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    100% Fact Checked • Zero Fake Claims
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    Deterministic 4-Vector Scoring
                                </span>
                            </div>
                        </div>

                        {/* Interactive Product Showcase Mockup */}
                        <div className="mt-16 rounded-2xl border border-border/70 bg-card/75 p-2.5 sm:p-3.5 shadow-modal backdrop-blur-md">
                            {/* Window Header */}
                            <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/20 rounded-t-xl">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                                </div>
                                <span className="text-[11px] font-mono text-muted-foreground truncate px-2">
                                    LumaCV Studio — Senior Full Stack Engineer @ Stripe
                                </span>
                                <div className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <AnimatedCounter value={89} suffix="/100 ATS Match" />
                                </div>
                            </div>

                            {/* Split Showcase Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 sm:p-4 bg-background/60 rounded-xl mt-2">
                                {/* Left Document Surface */}
                                <div className="lg:col-span-7 rounded-xl border border-border/70 bg-card p-5 space-y-4 text-left shadow-card">
                                    <div className="border-b border-border/50 pb-3">
                                        <h2 className="text-base font-display font-bold text-foreground tracking-tight">ALEX CHEN</h2>
                                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                                            San Francisco, CA • alex.chen@example.com • github.com/alexchen • linkedin.com/in/alexchen
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-display font-bold text-primary tracking-wider uppercase">PROFESSIONAL EXPERIENCE</h3>
                                        <div className="mt-2.5 space-y-3 text-xs">
                                            <div>
                                                <div className="flex justify-between font-semibold text-foreground">
                                                    <span>Senior Full Stack Engineer — Vercel</span>
                                                    <span className="text-muted-foreground font-normal text-[11px]">2022 – Present</span>
                                                </div>
                                                <ul className="mt-1.5 space-y-1.5 list-disc pl-4 text-muted-foreground text-[11px] leading-relaxed">
                                                    <li>
                                                        Architected distributed Edge rendering pipeline utilizing <span className="bg-primary/15 text-primary font-medium px-1 rounded">Next.js App Router</span> and <span className="bg-primary/15 text-primary font-medium px-1 rounded">TypeScript</span>, reducing p99 response times by 38% for 4M+ daily active sessions.
                                                    </li>
                                                    <li>
                                                        Spearheaded modular micro-frontend rollout, cutting client bundle size by 310KB and accelerating team deployment frequency by 2.4x.
                                                    </li>
                                                </ul>
                                            </div>

                                            <div>
                                                <div className="flex justify-between font-semibold text-foreground">
                                                    <span>Software Engineer — Cloudflare</span>
                                                    <span className="text-muted-foreground font-normal text-[11px]">2020 – 2022</span>
                                                </div>
                                                <ul className="mt-1.5 space-y-1.5 list-disc pl-4 text-muted-foreground text-[11px] leading-relaxed">
                                                    <li>
                                                        Engineered high-throughput caching and proxy orchestration services in <span className="bg-primary/15 text-primary font-medium px-1 rounded">Rust</span> handling 180k+ req/sec with 99.99% uptime SLA.
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right ATS Intelligence Instrument */}
                                <div className="lg:col-span-5 rounded-xl border border-border/70 bg-card p-4 space-y-4 flex flex-col justify-between text-left shadow-card">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-display font-bold text-foreground">Deterministic ATS Diagnostic</span>
                                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                +22 pts tailored gain
                                            </span>
                                        </div>

                                        {/* 4 Vector Category Instruments */}
                                        <div className="space-y-2.5">
                                            <div className="p-2 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                                                <div className="flex justify-between text-[11px]">
                                                    <span className="font-medium text-foreground">Required Skills (Weight: 40%)</span>
                                                    <span className="font-bold text-emerald-500 font-mono">94%</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                                                </div>
                                            </div>

                                            <div className="p-2 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                                                <div className="flex justify-between text-[11px]">
                                                    <span className="font-medium text-foreground">Responsibilities Alignment (Weight: 25%)</span>
                                                    <span className="font-bold text-primary font-mono">88%</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full w-[88%]" />
                                                </div>
                                            </div>

                                            <div className="p-2 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                                                <div className="flex justify-between text-[11px]">
                                                    <span className="font-medium text-foreground">Preferred Competencies (Weight: 20%)</span>
                                                    <span className="font-bold text-primary font-mono">85%</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full w-[85%]" />
                                                </div>
                                            </div>

                                            <div className="p-2 rounded-lg bg-muted/20 border border-border/50 space-y-1">
                                                <div className="flex justify-between text-[11px]">
                                                    <span className="font-medium text-foreground">Domain Terminology (Weight: 15%)</span>
                                                    <span className="font-bold text-primary font-mono">90%</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full w-[90%]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Explainable AI Annotation */}
                                        <div className="rounded-lg border border-primary/25 bg-primary/[0.04] p-3 text-[11px]">
                                            <span className="font-semibold text-primary block mb-0.5">Explainable AI Alignment</span>
                                            <p className="text-muted-foreground leading-relaxed">
                                                Re-aligned Alex’s distributed Edge metrics and elevated Next.js App Router and TypeScript to directly address Stripe’s primary platform requirements.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground text-[11px]">Native Document Engine</span>
                                        <span className="font-mono text-emerald-500 text-[11px] font-semibold">Compiled in 28ms</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. THREE PILLARS OF CRAFT (ANTI-SLOP ARCHITECTURE) */}
                <section id="features" className="py-20 border-b border-border/40 bg-card/20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="text-center max-w-2xl mx-auto space-y-3">
                            <span className="text-xs font-display font-semibold uppercase tracking-wider text-primary">
                                Engineering Integrity
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                                Built for candidates who respect their craft.
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Most career tools are bloated subscription traps that invent generic buzzwords. LumaCV takes a radically different approach: native compilation speed, deterministic scoring, and strict factual truth.
                            </p>
                        </div>

                        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Pillar 1 */}
                            <div className="rounded-2xl border border-border/70 bg-card p-6 flex flex-col justify-between shadow-card hover:border-primary/50 transition-colors">
                                <div className="space-y-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                                        <Cpu className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-base font-display font-bold text-foreground">
                                        Sub-50ms Native Vector Engine
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Powered by <strong>Typst</strong>. Eliminates 10-second LaTeX compilation cold-starts, distorted HTML-to-canvas rendering, and slow third-party print farms. Generates crisp, lightweight vector PDFs in milliseconds.
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono">
                                    <span className="text-muted-foreground">Local & Serverless</span>
                                    <span className="text-emerald-500 font-semibold">&lt; 50ms latency</span>
                                </div>
                            </div>

                            {/* Pillar 2 */}
                            <div className="rounded-2xl border border-border/70 bg-card p-6 flex flex-col justify-between shadow-card hover:border-primary/50 transition-colors">
                                <div className="space-y-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                                        <Scale className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-base font-display font-bold text-foreground">
                                        Deterministic 4-Vector Scoring
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        An LLM should never arbitrarily invent your match score. We compute alignment mathematically across Required Skills (40%), Responsibilities (25%), Preferred Skills (20%), and Terminology (15%) with transparent deltas.
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono">
                                    <span className="text-muted-foreground">Explainable Weights</span>
                                    <span className="text-primary font-semibold">100% Deterministic</span>
                                </div>
                            </div>

                            {/* Pillar 3 */}
                            <div className="rounded-2xl border border-border/70 bg-card p-6 flex flex-col justify-between shadow-card hover:border-primary/50 transition-colors">
                                <div className="space-y-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-base font-display font-bold text-foreground">
                                        100% Fact-Checked Tailoring
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Preserves your authentic employment history with zero invented dates, companies, or credentials. AI re-aligns emphasis and highlights relevant metrics while strictly preserving your factual truth.
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-[11px] font-mono">
                                    <span className="text-muted-foreground">Ground Truth Parser</span>
                                    <span className="text-emerald-500 font-semibold">Zero Hallucinations</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. VISUAL TEMPLATES SHOWCASE */}
                <section id="templates" className="py-20 border-b border-border/40">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="text-center max-w-2xl mx-auto space-y-3">
                            <span className="text-xs font-display font-semibold uppercase tracking-wider text-primary">
                                Recruiter-Tested Typography
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                                6 Executive-Grade Typographic Templates
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Tested for both rapid human executive scanning and strict algorithmic machine parsing. Switch templates with 1 click without losing your tailored content.
                            </p>
                        </div>

                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map(t => (
                                <div
                                    key={t.id}
                                    className="group rounded-2xl border border-border/70 bg-card p-5 flex flex-col justify-between hover:border-primary/50 hover:shadow-elevated transition-all"
                                >
                                    <div>
                                        {/* Wireframe Mini Representation */}
                                        <div className="mb-4">
                                            <MiniLayoutRepresentation type={t.id as TemplateType} />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <h3 className="font-display font-bold text-sm text-foreground">{t.name}</h3>
                                            <span className="text-[10px] font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                                                {t.tag}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                            {t.desc}
                                        </p>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="text-[11px] font-medium">{t.style}</span>
                                        <Link href="/builder" className="text-primary hover:underline flex items-center gap-0.5 text-xs font-medium">
                                            Use Template <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. TAILORING WORKFLOW */}
                <section id="workflow" className="py-20 border-b border-border/40 bg-card/20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="text-center max-w-2xl mx-auto space-y-3">
                            <span className="text-xs font-display font-semibold uppercase tracking-wider text-primary">
                                Fast & Painless
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                                The 4-Step Optimization Flow
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Seamlessly move from a generic PDF to an interview-winning resume in under a minute.
                            </p>
                        </div>

                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[
                                { n: '01', title: 'Upload & Parse', desc: 'Drop your existing PDF. Text and credentials are parsed client-side with 0 data loss.' },
                                { n: '02', title: 'Target Job Description', desc: 'Paste the target JD. The engine extracts competencies, responsibilities, and key tech stack.' },
                                { n: '03', title: 'AI Alignment Studio', desc: 'Experience bullets are rewritten to emphasize quantifiable metrics matching the target role.' },
                                { n: '04', title: 'Live Split Review & Export', desc: 'Review bullet diffs side-by-side with match score telemetry and download vector PDF.' },
                            ].map(step => (
                                <div key={step.n} className="rounded-xl border border-border/70 bg-card p-5 space-y-3 shadow-card">
                                    <span className="font-mono text-2xl font-extrabold text-primary/40">{step.n}</span>
                                    <h3 className="text-sm font-display font-bold text-foreground">{step.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. PRICING & COMMUNITY ACCESS */}
                <section id="pricing" className="py-20 border-b border-border/40">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="text-center max-w-xl mx-auto space-y-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>100% Free • All Features Unlocked</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                                Transparent Access, Community Supported
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                LumaCV is completely free for all job applicants. If this tool helped you land an interview or save hours of formatting, help offset our server and AI inference costs.
                            </p>
                        </div>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {/* Free Access Card */}
                            <div className="rounded-2xl border border-border/70 bg-card p-7 flex flex-col justify-between shadow-card">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-display font-bold text-base text-foreground">Launch Pioneer</h3>
                                        <span className="rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold">
                                            Free Forever
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold text-foreground font-mono">$0</span>
                                        <span className="text-xs text-muted-foreground">/ free open access</span>
                                    </div>
                                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                                        Full access to our native vector engine, AI tailoring, and executive ATS templates with no credit card required.
                                    </p>

                                    <ul className="mt-6 space-y-2.5 text-xs text-foreground/80">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>Unlimited sub-50ms vector PDF exports</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>All 6 executive-grade templates</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>100% Fact Checked • Zero Hallucinations</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>Full AI Bullet Diff Studio (Accept / Revert)</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>Deterministic 4-vector ATS scoring</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8">
                                    <Button asChild className="w-full text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                                        <Link href="/builder">Start Tailoring Free</Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Community Contribution Card */}
                            <div className="relative rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/[0.05] via-card to-background p-7 flex flex-col justify-between shadow-elevated">
                                <div className="absolute -top-3 right-6 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground tracking-wide uppercase shadow-xs">
                                    Community Support
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
                                            <h3 className="font-display font-bold text-base text-foreground">Contribute to LumaCV</h3>
                                        </div>
                                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                            LumaCV is built and operated independently. Support server hosting and inference costs directly via UPI:
                                        </p>
                                    </div>

                                    {/* Payment Handle Box */}
                                    <div className="rounded-xl border border-border/80 bg-background/90 p-3.5 backdrop-blur-xs flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 truncate">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                                                <Wallet className="h-4 w-4" />
                                            </div>
                                            <div className="truncate">
                                                <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                                                    UPI & Support Handle
                                                </span>
                                                <span className="font-mono text-xs sm:text-sm font-bold text-foreground">
                                                    {paymentHandle}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCopyPayment}
                                            aria-label="Copy UPI handle to clipboard"
                                            className="h-8 px-2.5 text-xs font-medium border-border/80 hover:bg-primary hover:text-primary-foreground gap-1.5 shrink-0"
                                        >
                                            {copiedPayment ? (
                                                <>
                                                    <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="text-[11px]">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3.5 w-3.5" />
                                                    <span className="text-[11px]">Copy Handle</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <p className="text-[11px] text-muted-foreground">
                                        Automated payment gateways and pro tier options will be integrated in a later release.
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-border/40 text-center">
                                    <Link href="/billing" className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1">
                                        <span>Learn more about supporting this project</span>
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <AppFooter />
        </div>
    );
}
