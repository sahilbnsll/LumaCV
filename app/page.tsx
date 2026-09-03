"use client";

import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import {
    ArrowRight,
    Zap,
    Shield,
    CheckCircle2,
    Sparkles,
    Cpu,
    FileCheck,
    Github,
    Linkedin,
    ChevronRight,
    Heart,
    Copy,
    CheckCheck,
    Wallet
} from 'lucide-react';
import { MiniLayoutRepresentation } from '@/components/template-selector';
import { TemplateType } from '@/lib/resume-schema';
import { SpotlightCard } from '@/components/spotlight-card';
import { AnimatedCounter } from '@/components/animated-counter';
import { toast } from 'sonner';





const templates = [
    {
        id: 'modern',
        name: 'Modern',
        style: 'Clean Sans-Serif',
        tag: 'Flagship Tech',
        desc: 'Contemporary layout with contact icons and subtle category badges. Ideal for software engineers and product teams.',
    },
    {
        id: 'classic',
        name: 'Classic',
        style: 'Ivy League Serif',
        tag: 'Executive & Finance',
        desc: 'Traditional Harvard-style serif typography with elegant horizontal rules. Respected by conservative hiring committees.',
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
        desc: 'Engineered with tight line-heights and margins to fit extensive work histories onto a crisp, single page.',
    },
    {
        id: 'two_column',
        name: 'Two-Column',
        style: 'Asymmetric Sidebar',
        tag: 'Design & Data',
        desc: 'Organized split layout placing technical competencies and education in a dedicated left column.',
    },
    {
        id: 'ats_safe',
        name: 'ATS Safe',
        style: 'Linear Pure Text',
        tag: '100% Machine Scannable',
        desc: 'Strictly linear single-column structure guaranteed to parse cleanly across older enterprise ATS systems.',
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
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />


            {/* 1. HERO SECTION */}
            <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40">
                {/* Subtle ambient lighting */}
                <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[640px] rounded-full bg-primary/10 blur-[120px]" />

                <div className="mx-auto max-w-6xl px-4 sm:px-6 relative">
                    <div className="mx-auto max-w-3xl text-center">
                        {/* Micro badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs text-primary font-medium shadow-xs">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Native Vector Engine • Sub-50ms PDF Compilation</span>
                        </div>

                        {/* Value Proposition */}
                        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                            One resume. Tailored to every job in{' '}
                            <span className="gradient-brand">30 seconds</span>.
                        </h1>

                        <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Stop sending generic resumes. LumaCV analyzes the job description, matches your real achievements to required skills, and compiles pixel-perfect, ATS-safe PDFs in milliseconds.
                        </p>

                        {/* CTAs */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button asChild size="lg" className="h-11 px-6 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/20">
                                <Link href="/builder">
                                    Start Tailoring — Free
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>

                            <Button asChild variant="outline" size="lg" className="h-11 px-6 text-sm font-medium border-border/70 hover:bg-muted/40">
                                <Link href="/demo">
                                    View Live Sample
                                </Link>
                            </Button>

                        </div>

                        {/* Trust markers */}
                        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground/70">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Zero LaTeX compile lag
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                No fake claims or hallucinations
                            </span>
                        </div>
                    </div>

                    {/* Realistic Product Showcase Mockup */}
                    <div className="mt-14 rounded-2xl border border-white/[0.1] bg-card/60 p-2 sm:p-3 shadow-2xl backdrop-blur-md">
                        {/* Chrome window dots */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                            </div>
                            <span className="text-[11px] font-mono text-muted-foreground/80">
                                LumaCV Workspace — Senior Software Engineer @ Stripe
                            </span>
                            <div className="text-[11px] font-medium text-emerald-500 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <AnimatedCounter value={89} suffix="/100 ATS Match" />
                            </div>

                        </div>

                        {/* Workspace split preview */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 sm:p-4 bg-background/50 rounded-xl mt-2">
                            {/* Left: Document View */}
                            <div className="lg:col-span-7 rounded-lg border border-border/60 bg-card p-5 space-y-4 text-left shadow-sm">
                                <div className="border-b border-border/50 pb-3">
                                    <h2 className="text-base font-bold text-foreground">ALEX CHEN</h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        San Francisco, CA • alex.chen@example.com • github.com/alexchen • linkedin.com/in/alexchen
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-primary tracking-wider uppercase">PROFESSIONAL EXPERIENCE</h3>
                                    <div className="mt-2 space-y-3 text-xs">
                                        <div>
                                            <div className="flex justify-between font-semibold">
                                                <span>Senior Full Stack Engineer — Vercel</span>
                                                <span className="text-muted-foreground font-normal">2022 – Present</span>
                                            </div>
                                            <ul className="mt-1.5 space-y-1 list-disc pl-4 text-muted-foreground text-[11px] leading-relaxed">
                                                <li>
                                                    Architected distributed Edge rendering pipeline utilizing <span className="bg-primary/15 text-primary font-medium px-1 rounded">Next.js App Router</span> and <span className="bg-primary/15 text-primary font-medium px-1 rounded">TypeScript</span>, reducing p99 response times by 38%.
                                                </li>
                                                <li>
                                                    Spearheaded migration of core services to micro-frontends, cutting bundle size by 420KB and accelerating developer release velocity.
                                                </li>
                                            </ul>
                                        </div>

                                        <div>
                                            <div className="flex justify-between font-semibold">
                                                <span>Software Engineer — Cloudflare</span>
                                                <span className="text-muted-foreground font-normal">2020 – 2022</span>
                                            </div>
                                            <ul className="mt-1.5 space-y-1 list-disc pl-4 text-muted-foreground text-[11px] leading-relaxed">
                                                <li>
                                                    Engineered high-throughput caching service in <span className="bg-primary/15 text-primary font-medium px-1 rounded">Rust</span> handling 150k+ req/sec with 99.99% uptime SLA.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: ATS Intelligence Card */}
                            <div className="lg:col-span-5 rounded-lg border border-border/60 bg-card p-4 space-y-4 flex flex-col justify-between text-left">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-foreground">ATS Match Breakdown</span>
                                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">+22 pts</span>
                                    </div>

                                    <div className="mt-3 space-y-2.5 text-xs">
                                        <div>
                                            <div className="flex justify-between text-[11px] mb-1">
                                                <span className="text-muted-foreground">Required Skills</span>
                                                <span className="font-semibold">94%</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[11px] mb-1">
                                                <span className="text-muted-foreground">Responsibilities Alignment</span>
                                                <span className="font-semibold">88%</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                <div className="h-full bg-primary rounded-full w-[88%]" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[11px] mb-1">
                                                <span className="text-muted-foreground">Tech Stack Keywords</span>
                                                <span className="font-semibold">85%</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                <div className="h-full bg-primary rounded-full w-[85%]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Explainable AI snippet */}
                                    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/[0.04] p-3 text-[11px]">
                                        <span className="font-semibold text-primary block mb-1">Explainable AI Adjustment</span>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Re-emphasized your distributed systems metrics and elevated Next.js 14 to match Stripe’s job requirements.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">PDF Compilation</span>
                                    <span className="font-mono text-emerald-500 text-[11px]">Native Engine • 28ms</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. CORE FEATURES SECTION */}
            <section id="features" className="py-20 border-b border-border/40">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Built for candidates who care about craft.
                        </h2>
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                            No bloated AI templates. Every element is engineered for recruiter readability and strict ATS algorithmic compliance.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <SpotlightCard className="flex flex-col justify-between hover:border-primary/40 transition-colors">
                            <div>
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
                                    <Cpu className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">Native Vector Typesetting</h3>
                                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                    Compiles pixel-perfect resumes in &lt; 50ms without slow third-party web servers or PDF distortion.
                                </p>
                            </div>
                            <span className="mt-4 text-[11px] font-mono text-emerald-500">20-45ms execution</span>
                        </SpotlightCard>

                        <SpotlightCard className="flex flex-col justify-between hover:border-primary/40 transition-colors">
                            <div>
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
                                    <Zap className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">AI Alignment Engine</h3>
                                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                    Intelligent semantic mapping matches your actual achievements to the target role with high-availability cloud routing.
                                </p>
                            </div>
                            <span className="mt-4 text-[11px] font-mono text-primary">Context-Aware AI</span>
                        </SpotlightCard>

                        <SpotlightCard className="flex flex-col justify-between hover:border-primary/40 transition-colors">
                            <div>
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">Factual Preservation</h3>
                                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                    Tailors language and highlights relevant achievements while strictly forbidding hallucinated dates or skills.
                                </p>
                            </div>
                            <span className="mt-4 text-[11px] font-mono text-emerald-500">Zero Hallucination</span>
                        </SpotlightCard>

                        <SpotlightCard className="flex flex-col justify-between hover:border-primary/40 transition-colors">
                            <div>
                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
                                    <FileCheck className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">4-Vector ATS Scoring</h3>
                                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                    Weighted analysis across Required Skills (40%), Preferred Skills (20%), Responsibilities (25%), and Industry Buzzwords (15%).
                                </p>
                            </div>
                            <span className="mt-4 text-[11px] font-mono text-primary">Granular Diagnostics</span>
                        </SpotlightCard>
                    </div>

                </div>
            </section>

            {/* 3. VISUAL TEMPLATES SHOWCASE */}
            <section id="templates" className="py-20 border-b border-border/40">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            6 Executive-Grade Templates
                        </h2>

                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                            Engineered by hiring managers and designers. Each template is tested for both human scanning and machine parsing.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(t => (
                            <div
                                key={t.id}
                                className="group rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-5 flex flex-col justify-between hover:border-primary/40 hover:shadow-lg transition-all"
                            >
                                <div>
                                    {/* Compact stylized structural mini representation */}
                                    <div className="mb-4">
                                        <MiniLayoutRepresentation type={t.id as TemplateType} />
                                    </div>



                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm text-foreground">{t.name}</h3>
                                        <span className="text-[10px] font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                                            {t.tag}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                        {t.desc}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
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

            {/* 4. WORKFLOW / HOW IT WORKS */}
            <section id="workflow" className="py-20 border-b border-border/40">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            The 4-Step Tailoring Workflow
                        </h2>
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                            From generic PDF to an interview-winning resume in under a minute.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { n: '01', title: 'Upload & Parse', desc: 'Drop your existing PDF. Text and credentials are parsed client-side with 0 data loss.' },
                            { n: '02', title: 'Add Job Description', desc: 'Paste the target JD. The analyzer extracts required competencies and industry keywords.' },
                            { n: '03', title: 'AI Alignment', desc: 'Experience bullets are rewritten to emphasize quantifiable metrics matching the target role.' },
                            { n: '04', title: 'Live Split Review', desc: 'Review changes side-by-side with an 88/100 score, adjust templates, and download PDF.' },
                        ].map(step => (
                            <div key={step.n} className="rounded-xl border border-white/[0.08] bg-card p-6">
                                <span className="font-mono text-2xl font-bold text-primary/40">{step.n}</span>
                                <h3 className="mt-3 text-sm font-semibold text-foreground">{step.title}</h3>
                                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. PRICING & CONTRIBUTION SECTION */}
            <section id="pricing" className="py-20 border-b border-border/40">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="text-center max-w-xl mx-auto">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-3">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>100% Free • All Features Unlocked</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Transparent Access, Community Supported
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            LumaCV is completely free for all job applicants. Payment gateways will be integrated in a future release. If this tool helps you, support our independent servers and inference.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {/* Free Full Access Card */}
                        <div className="rounded-2xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-7 flex flex-col justify-between shadow-xs">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-base text-foreground">Launch Pioneer</h3>
                                    <span className="rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold">
                                        Free Forever
                                    </span>
                                </div>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-3xl font-extrabold text-foreground">$0</span>
                                    <span className="text-xs text-muted-foreground">/ free open access</span>
                                </div>
                                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                                    Full access to our vector engine, AI tailoring, and executive ATS templates with no credit card required.
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
                                <Button asChild className="w-full text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                                    <Link href="/builder">Start Tailoring Free</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Direct Contribution Card */}
                        <div className="relative rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/[0.05] via-card to-background p-7 flex flex-col justify-between shadow-xl">
                            <div className="absolute -top-3 right-6 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground tracking-wide uppercase shadow-xs">
                                Community Support
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
                                        <h3 className="font-semibold text-base text-foreground">Contribute to LumaCV</h3>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                        LumaCV is built and operated independently. If this project helped you land an interview or save hours of formatting, help offset server & AI compute costs:
                                    </p>
                                </div>

                                {/* Payment ID box */}
                                <div className="rounded-xl border border-border/80 bg-background/90 p-3.5 backdrop-blur-xs flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 truncate">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                                            <Wallet className="h-4 w-4" />
                                        </div>
                                        <div className="truncate">
                                            <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                                                UPI & Support ID
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
                                        className="h-7 px-2 text-xs font-medium border-border/80 hover:bg-primary hover:text-primary-foreground gap-1 shrink-0"
                                    >
                                        {copiedPayment ? (
                                            <>
                                                <CheckCheck className="h-3 w-3 text-emerald-500" />
                                                <span className="text-[11px]">Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3 w-3" />
                                                <span className="text-[11px]">Copy ID</span>
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <p className="text-[11px] text-muted-foreground">
                                    We will integrate automated payment gateways and pro subscription options in a future release.
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


            {/* 6. AUTHENTIC CREATOR / ABOUT SECTION */}
            <section id="about" className="py-20 border-b border-border/40">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="rounded-2xl border border-white/[0.08] bg-card p-8 sm:p-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-5 border border-primary/20">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            Why LumaCV was created
                        </h2>
                        <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Most resume tools are bloated subscription traps that generate generic AI buzzwords or take 10 seconds to compile distorted PDFs. LumaCV was engineered to be fast, authentic, and uncompromising: deterministic ATS keyword matching, sub-50ms native document compilation, and strict ground-truth fact checking that guarantees zero hallucinated experience.
                        </p>

                        <div className="mt-6 flex items-center justify-center gap-4 text-xs">
                            <span className="font-medium text-foreground">Designed & Built by Sahil Bansal</span>
                            <span className="text-muted-foreground">•</span>
                            <a href="https://github.com/sahilbnsll" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                                <Github className="h-3.5 w-3.5" /> GitHub
                            </a>
                            <a href="https://www.linkedin.com/in/sahilbansal24/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. FOOTER */}
            <footer className="py-12 text-center text-xs text-muted-foreground bg-muted/10 border-t border-border/40">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-border/40">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-semibold tracking-tight text-sm text-foreground">LumaCV</span>
                            <span className="text-[11px] text-muted-foreground">— Tailor one resume to every job.</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-5 text-xs">
                            <Link href="/builder" className="hover:text-foreground transition-colors">Resume Builder</Link>
                            <Link href="/demo" className="hover:text-foreground transition-colors">Live Demo</Link>
                            <Link href="/dashboard" className="hover:text-foreground transition-colors">My Resumes</Link>
                            <Link href="/billing" className="hover:text-foreground transition-colors">Pricing</Link>
                            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                            <Link href="/contact" className="hover:text-foreground transition-colors">Contact Support</Link>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
                        <p>© {new Date().getFullYear()} LumaCV. All rights reserved.</p>
                        <p className="text-muted-foreground/80">Privacy-First • Zero Model Training • Deterministic ATS Scorer</p>
                    </div>
                </div>
            </footer>

        </div>
    );
}
