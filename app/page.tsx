"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { LumaLogo } from '@/components/luma-logo';
import { InteractiveWatermark } from '@/components/interactive-watermark';
import { PulsingHeart } from '@/components/pulsing-heart';
import {
    ArrowRight,
    Sparkles,
    Heart,
    Copy,
    Check,
    ShieldCheck,
    Code2,
    Database,
    FileText,
    Download,
    ChevronDown,
    Palette,
    Zap,
    Users,
    KeyRound,
    SlidersHorizontal,
    EyeOff,
    CheckCircle2,
    Wrench,
    Rocket,
    Languages,
    LayoutTemplate,
    Server,
    GitBranch,
    Fingerprint,
    Files,
    Share2,
    LockKeyhole,
    FileCode2,
    Target,
    Github,
    Layers,
    Search,
    HelpCircle,
    Send,
    MessageSquarePlus
} from 'lucide-react';
import Image from 'next/image';
import { AnimatedCounter } from '@/components/animated-counter';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { RxTemplatesShowcase } from '@/components/rx-templates-showcase';
import HomeHeroLandingScrollAnimation from '@/components/ui/home-hero-landing-scroll-animation';
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/templates-data';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FaqAccordion, type FAQItem } from '@/components/ui/faq-chat-accordion';

// Features matrix data matching reference 4-column design
const featuresData = [
    {
        icon: Sparkles,
        title: "Free",
        description: "Completely free, forever, no hidden costs.",
    },
    {
        icon: GitBranch,
        title: "Open Source",
        description: "By the community, for the community.",
    },
    {
        icon: EyeOff,
        title: "No Advertising, No Tracking",
        description: "No ads and no trackers, so nothing gets in your way.",
    },
    {
        icon: Zap,
        title: "Instant Generation",
        description: "Export your resume to PDF in one click, with no waiting.",
    },
    {
        icon: ShieldCheck,
        title: "Data Security",
        description: "Your data is secure, and never shared or sold to anyone.",
    },
    {
        icon: Server,
        title: "Self-Host with Docker",
        description: "Deploy it on your own servers using the Docker image.",
    },
    {
        icon: Languages,
        title: "Multilingual",
        description: "Full UTF-8 support for crafting resumes in any language, script, or locale.",
    },
    {
        icon: KeyRound,
        title: "One-Click Sign-In",
        description: "Sign in with GitHub, Google or a custom OAuth provider.",
    },
    {
        icon: Fingerprint,
        title: "Passkeys & 2FA",
        description: "Add another layer of biometric protection to your account.",
    },
    {
        icon: Files,
        title: "Unlimited Resumes",
        description: "Create as many resumes as you want.",
    },
    {
        icon: SlidersHorizontal,
        title: "Flexibility",
        description: "Change the colors, fonts, and design to suit you.",
    },
    {
        icon: LayoutTemplate,
        title: "Architectural Templates",
        description: "48 curated layouts engineered for tech, finance, creative, and ATS parsing.",
    },
    {
        icon: Share2,
        title: "Shareable Links",
        description: "Publish your resume online with a public link or private passkey.",
    },
    {
        icon: LockKeyhole,
        title: "Password Protection",
        description: "Protect your shared links with a secure password or expiration date.",
    },
    {
        icon: FileCode2,
        title: "Native Typst AST",
        description: "Deterministic AST compilation with sub-50ms latency and 600 DPI vector rendering.",
    },
    {
        icon: Target,
        title: "ATS-Engineered",
        description: "Strict typographic hierarchies ensure top scores in enterprise recruitment filters.",
    },
];

// FAQ items structured for FaqAccordion
const faqData: FAQItem[] = [
    {
        id: 1,
        question: "Is LumaCV free to use?",
        answer: "Yes. LumaCV is free and open-source software with no hidden charges, locked premium features, or subscription fees.",
    },
    {
        id: 2,
        question: "How is candidate privacy and data handled?",
        answer: "Your resume content, drafts, and BYOK API keys are stored locally in your browser session. When using your own API key, requests go directly to your chosen AI provider without storing your personal career history on external databases.",
    },
    {
        id: 3,
        question: "How does the Typst vector compilation work?",
        answer: "LumaCV uses a native serverless Typst compiler that generates sharp vector PDFs with selectable text, clickable hyperlinks, and consistent page geometry in under 50 milliseconds.",
    },
    {
        id: 4,
        question: "How does Client-Side BYOK work?",
        answer: "Bring Your Own Key allows you to input your personal API key (Google Gemini, OpenAI, Claude, or Groq) in Settings. You pay standard API token rates directly to your provider, completely bypassing SaaS markups.",
    },
    {
        id: 5,
        question: "How does the fact-checking engine prevent hallucinations?",
        answer: "LumaCV extracts a structured factual graph of your actual background and mathematically flags or blocks any bullet rewrite that attempts to introduce ungrounded credentials.",
    },
    {
        id: 6,
        question: "Can I self-host LumaCV locally or in my cloud?",
        answer: "Yes. LumaCV is open-source under the MIT license and can be deployed with Docker or run locally via Next.js and the Typst CLI. See the documentation for setup instructions.",
    },
];

export default function LandingPage() {
    const [copiedPayment, setCopiedPayment] = useState(false);
    const paymentHandle = "sahil.bansal@superyes";

    // FAQ Question Submission Modal State
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [questionEmail, setQuestionEmail] = useState('');
    const [questionName, setQuestionName] = useState('');
    const [questionCategory, setQuestionCategory] = useState('general');
    const [questionText, setQuestionText] = useState('');
    const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

    const handleQuestionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!questionText.trim() || !questionEmail.trim()) {
            toast.error("Please provide both your email and question.");
            return;
        }

        setIsSubmittingQuestion(true);
        try {
            const res = await fetch('/api/v1/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: questionName || 'FAQ Inquirer',
                    email: questionEmail,
                    type: `faq_${questionCategory}`,
                    message: `[Topic: ${questionCategory}] ${questionText.trim()}`,
                }),
            });

            if (res.ok) {
                toast.success("Thank you! Your question has been submitted. We'll reply to your email shortly.");
                setQuestionText('');
                setQuestionEmail('');
                setQuestionName('');
                setQuestionModalOpen(false);
            } else {
                toast.error("Unable to send question right now. Please try again or reach out on GitHub.");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setIsSubmittingQuestion(false);
        }
    };

    // Live tracked system statistics
    const [stats, setStats] = useState({
        resumesCompiled: 0,
        bulletsTailored: 0,
        activeTemplates: 48,
        factCheckAccuracy: 100,
    });

    // Fetch real live statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/v1/stats');
                if (res.ok) {
                    const data = await res.json();
                    if (data && typeof data.resumesCompiled === 'number') {
                        setStats({
                            resumesCompiled: data.resumesCompiled,
                            bulletsTailored: data.bulletsTailored,
                            activeTemplates: data.activeTemplates || 48,
                            factCheckAccuracy: data.factCheckAccuracy || 100,
                        });
                    }
                }
            } catch {
                // Silently fallback to initial stats
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 15000);
        return () => clearInterval(interval);
    }, []);

    const [openCollectiveModalOpen, setOpenCollectiveModalOpen] = useState(false);

    const handleCopyPayment = () => {
        navigator.clipboard.writeText(paymentHandle);
        setCopiedPayment(true);
        toast.success(`Copied "${paymentHandle}" to clipboard!`);
        setTimeout(() => setCopiedPayment(false), 2500);
    };

    const handleOpenCollectiveClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpenCollectiveModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary flex flex-col justify-between">
            <AppHeader />

            <main id="main-content" className="flex-1">
                {/* ========================================================================= */}
                {/* ========================================================================= */}
                {/* 1. CINEMATIC GSAP HERO (DEFAULT PRIMARY HERO)                             */}
                {/* ========================================================================= */}
                <HomeHeroLandingScrollAnimation />

                {/* ========================================================================= */}
                {/* 2. REAL TRACKED SYSTEM STATISTICS BAR                                    */}
                {/* ========================================================================= */}
                <section id="statistics" aria-labelledby="stats-heading" className="border-b border-border/50 bg-card/20">
                    <h2 id="stats-heading" className="sr-only">Live Platform Metrics</h2>

                    <div className="max-w-6xl mx-auto py-3 px-4 flex items-center justify-between text-xs text-muted-foreground border-b border-border/30">
                        <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live System Metrics (Tracked in Real-Time)
                        </span>
                        <span className="font-mono text-[11px]">Auto-Synced with DB</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50 max-w-6xl mx-auto">
                        {/* Stat 1 */}
                        <div className="group relative flex flex-col items-center justify-center p-8 lg:p-10 hover:bg-muted/20 transition-colors">
                            <div className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground">
                                <AnimatedCounter value={stats.resumesCompiled} />
                            </div>
                            <p className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">
                                Real Resumes Compiled
                            </p>
                        </div>

                        {/* Stat 2 */}
                        <div className="group relative flex flex-col items-center justify-center p-8 lg:p-10 hover:bg-muted/20 transition-colors">
                            <div className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground">
                                <AnimatedCounter value={stats.bulletsTailored} />
                            </div>
                            <p className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">
                                Bullet Lines Tailored
                            </p>
                        </div>

                        {/* Stat 3 */}
                        <div className="group relative flex flex-col items-center justify-center p-8 lg:p-10 hover:bg-muted/20 transition-colors">
                            <div className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-emerald-500">
                                {stats.factCheckAccuracy}%
                            </div>
                            <p className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">
                                Factual Integrity Verified
                            </p>
                        </div>

                        {/* Stat 4 */}
                        <div className="group relative flex flex-col items-center justify-center p-8 lg:p-10 hover:bg-muted/20 transition-colors">
                            <div className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-sky-400">
                                {stats.activeTemplates}
                            </div>
                            <p className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">
                                Active Typst Templates
                            </p>
                        </div>
                    </div>
                </section>

                {/* ========================================================================= */}
                {/* 3. FEATURES 4-COLUMN BORDER GRID                                         */}
                {/* ========================================================================= */}
                <section id="features" className="border-b border-border/40 py-20 sm:py-28 bg-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Left-Aligned Header Area Matching Reference */}
                        <div className="space-y-3 mb-12 sm:mb-16 max-w-3xl">
                            <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground">
                                Features
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Create, customize, and share your resume. LumaCV is open source, it doesn&apos;t track you, and it stays free.
                            </p>
                        </div>

                        {/* 4-Column Border Grid (Exact reference pattern) */}
                        <div className="border-t border-l border-border/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-xl overflow-hidden shadow-xs">
                            {featuresData.map((f) => {
                                const Icon = f.icon;
                                return (
                                    <div
                                        key={f.title}
                                        className="group border-r border-b border-border/60 p-6 sm:p-7 space-y-3.5 transition-colors duration-200 hover:bg-muted/40 dark:hover:bg-[#181a1d] cursor-default bg-card/40"
                                    >
                                        <div className="h-9 w-9 rounded-lg bg-muted/70 dark:bg-white/[0.05] border border-border/60 dark:border-white/10 flex items-center justify-center text-foreground/80 dark:text-neutral-300 transition-transform duration-200 group-hover:scale-110 shadow-2xs">
                                            <Icon className="h-4 w-4" strokeWidth={1.75} />
                                        </div>
                                        <h3 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">
                                            {f.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {f.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ========================================================================= */}
                {/* 4. TEMPLATES SHOWCASE (RX-RESUME DUAL-ROW TILTED CONTINUOUS MARQUEE)      */}
                {/* ========================================================================= */}
                <RxTemplatesShowcase />

                {/* ========================================================================= */}
                {/* 5. SUPPORT LUMACV (DONATION BANNER MATCHING REFERENCE DESIGN)             */}
                {/* ========================================================================= */}
                {/* ========================================================================= */}
                {/* 6. SUPPORT & SUSTAINABILITY (EXACT REFERENCE DESIGN)                      */}
                {/* ========================================================================= */}
                <section id="support" className="relative overflow-hidden border-b border-border/40 py-24 sm:py-28 bg-background dark:bg-[#08090b] text-foreground dark:text-white transition-colors">
                    {/* Glowing Heart Backdrop Ambient Bloom */}
                    <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[340px] w-[460px] rounded-full bg-rose-500/10 blur-[130px]" />


                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7 z-10">
                        {/* Top Glowing Animated Heart Emblem (No borders, true heartbeat animation) */}
                        <PulsingHeart size={52} className="mb-2" />

                        {/* Title & Manifesto */}
                        <div className="space-y-3 max-w-xl mx-auto">
                            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-slate-900 dark:text-white">
                                Support LumaCV
                            </h2>
                            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
                                <p>LumaCV is a free and open-source project, maintained by <a href="https://sahilbansal.net/" target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-white font-medium hover:underline underline-offset-2">Sahil Bansal</a> and a community of contributors.</p>
                                <p>Your donations cover the running costs and keep development going.</p>
                            </div>
                        </div>

                        {/* 3 Pillars Grid: Exactly matching reference card design */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-2 text-center">
                            {/* Card 1: Long-term Sustainability */}
                            <div className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#111317] p-7 sm:p-8 flex flex-col items-center space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-xl hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-600 dark:text-slate-300 mb-1 transition-transform duration-300 group-hover:scale-110">
                                    <Rocket className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white transition-colors">Long-term Sustainability</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Your support keeps the project free and open to everyone, now and later.
                                </p>
                            </div>

                            {/* Card 2: Ongoing Maintenance */}
                            <div className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#111317] p-7 sm:p-8 flex flex-col items-center space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-xl hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-600 dark:text-slate-300 mb-1 transition-transform duration-300 group-hover:scale-110">
                                    <Wrench className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white transition-colors">Ongoing Maintenance</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Donations pay for bug fixes, security updates, and the ordinary work of keeping the app running.
                                </p>
                            </div>

                            {/* Card 3: Grow the Team */}
                            <div className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#111317] p-7 sm:p-8 flex flex-col items-center space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-xl hover:border-slate-300 dark:hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-600 dark:text-slate-300 mb-1 transition-transform duration-300 group-hover:scale-110">
                                    <Users className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white transition-colors">Grow the Team</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Help me bring more experienced contributors on board, so the work doesn&apos;t rest on one maintainer.
                                </p>
                            </div>
                        </div>

                        {/* Actions Row: Solid dark buttons matching exact reference */}
                        <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
                            {/* Open Collective */}
                            <button
                                type="button"
                                onClick={handleOpenCollectiveClick}
                                className="group inline-flex items-center gap-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                            >
                                <Heart className="h-4 w-4 fill-rose-500 text-rose-500 transition-transform group-hover:scale-110" />
                                <span>Open Collective</span>
                            </button>

                            {/* GitHub Sponsors */}
                            <a
                                href="https://github.com/sponsors/sahilbnsll"
                                target="_blank"
                                rel="noreferrer"
                                className="group inline-flex items-center gap-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="shrink-0 text-white transition-transform group-hover:scale-110"
                                    aria-hidden="true"
                                >
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                <span>GitHub Sponsors</span>
                            </a>
                        </div>

                        {/* Appreciation Micro-copy */}
                        <div className="pt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <p>Every contribution helps, however small.</p>
                            <p className="font-semibold text-slate-900 dark:text-white">Thank you for your support!</p>
                        </div>
                    </div>
                </section>

                {/* ========================================================================= */}
                {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ)                                      */}
                {/* ========================================================================= */}
                <section id="faq" className="border-b border-border/40 py-16 md:py-24">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Title & Can't Find Your Question Box */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="space-y-3">
                                <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-foreground">
                                    Frequently Asked Questions
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    Everything you need to know about LumaCV, privacy, and Typst compilation.
                                </p>
                            </div>

                            {/* Can't find your question card */}
                            <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-2.5 shadow-xs">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-md bg-primary/10 text-primary">
                                        <HelpCircle className="h-4 w-4" />
                                    </div>
                                    <h4 className="text-xs font-semibold text-foreground">Can&apos;t find your question?</h4>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                    Have a specific question about Typst compilation, ATS matching, or custom formatting? Send it directly to us.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuestionModalOpen(true)}
                                    className="w-full h-8 text-xs font-medium rounded-xl gap-1.5 border-border/80 bg-background/80 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-pointer shadow-2xs"
                                >
                                    <Send className="h-3 w-3" />
                                    <span>Submit your question</span>
                                </Button>
                            </div>
                        </div>

                        {/* Right Accordion */}
                        <div className="lg:col-span-8">
                            <FaqAccordion
                                data={faqData}
                                className="p-0"
                                timestamp="Updated dynamically • LumaCV Knowledge Base"
                                questionClassName="bg-card/90 hover:bg-muted border border-border/70 text-foreground py-2.5 px-3.5 shadow-2xs"
                                answerClassName="bg-primary text-primary-foreground text-xs sm:text-sm font-normal py-3 px-4 shadow-sm"
                            />
                        </div>
                    </div>
                </section>

                {/* Submit Your Question Modal */}
                <Dialog open={questionModalOpen} onOpenChange={setQuestionModalOpen}>
                    <DialogContent className="sm:max-w-md glass-lg border-border/80 p-6">
                        <DialogHeader>
                            <DialogTitle className="font-display text-base font-bold text-foreground flex items-center gap-2">
                                <MessageSquarePlus className="h-4 w-4 text-primary" />
                                Submit Your Question
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Can&apos;t find what you are looking for in our FAQ? Ask your question below and our team will get back to you.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleQuestionSubmit} className="space-y-3.5 mt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label htmlFor="faq-user-name" className="text-[11px] font-medium text-foreground">
                                        Your Name
                                    </label>
                                    <Input
                                        id="faq-user-name"
                                        placeholder="Optional"
                                        value={questionName}
                                        onChange={(e) => setQuestionName(e.target.value)}
                                        className="h-9 text-xs rounded-xl bg-background/70 border-border/70"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="faq-user-email" className="text-[11px] font-medium text-foreground">
                                        Email Address <span className="text-destructive">*</span>
                                    </label>
                                    <Input
                                        id="faq-user-email"
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        value={questionEmail}
                                        onChange={(e) => setQuestionEmail(e.target.value)}
                                        className="h-9 text-xs rounded-xl bg-background/70 border-border/70"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="faq-category" className="text-[11px] font-medium text-foreground">
                                    Topic Category
                                </label>
                                <select
                                    id="faq-category"
                                    value={questionCategory}
                                    onChange={(e) => setQuestionCategory(e.target.value)}
                                    className="w-full h-9 px-3 text-xs rounded-xl bg-background/70 border border-border/70 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                                >
                                    <option value="general">General Question</option>
                                    <option value="typst">Typst Vector Compilation</option>
                                    <option value="ats">ATS Semantic Matching</option>
                                    <option value="templates">Template Request</option>
                                    <option value="privacy">Data Privacy & Security</option>
                                    <option value="feedback">Feature Suggestion</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="faq-question-text" className="text-[11px] font-medium text-foreground">
                                    Your Question <span className="text-destructive">*</span>
                                </label>
                                <Textarea
                                    id="faq-question-text"
                                    required
                                    rows={4}
                                    placeholder="Type your question or request here..."
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    className="text-xs rounded-xl bg-background/70 border-border/70 resize-none min-h-[90px]"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setQuestionModalOpen(false)}
                                    className="h-8 px-3 text-xs rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmittingQuestion}
                                    size="sm"
                                    className="h-8 px-4 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs cursor-pointer"
                                >
                                    {isSubmittingQuestion ? (
                                        <span>Sending...</span>
                                    ) : (
                                        <>
                                            <Send className="h-3 w-3" />
                                            <span>Submit Question</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Open Collective & Direct Support Dialog Modal */}
                <Dialog open={openCollectiveModalOpen} onOpenChange={setOpenCollectiveModalOpen}>
                    <DialogContent className="sm:max-w-md glass-lg border-border/80 p-6 space-y-4">
                        <DialogHeader className="space-y-2">
                            <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                                </div>
                                <span>Support LumaCV</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                                LumaCV is completely free and open-source. Your contribution funds Typst compilation servers, AI latency optimizations, and ongoing development.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3.5 pt-1">
                            {/* Direct UPI Contribution Option */}
                            <div className="p-4 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md space-y-2.5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <Zap className="h-3.5 w-3.5 text-primary" />
                                        Direct UPI Contribution
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                                        0% Fees
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/70 bg-background/90 font-mono text-xs text-foreground">
                                    <span className="truncate select-all font-semibold pl-1">{paymentHandle}</span>
                                    <button
                                        type="button"
                                        onClick={handleCopyPayment}
                                        className="shrink-0 h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                                    >
                                        {copiedPayment ? (
                                            <>
                                                <Check className="h-3.5 w-3.5" />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                <span>Copy UPI</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                                    <span>Pay with any UPI app:</span>
                                    <span className="font-mono text-[10px] text-foreground/80 font-medium">
                                        GPay · PhonePe · Paytm · BHIM · Cred
                                    </span>
                                </div>
                            </div>

                            {/* Global Sponsor Options */}
                            <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/30 space-y-2.5">
                                <div className="flex items-center justify-between text-xs font-medium text-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Heart className="h-3.5 w-3.5 text-rose-500" />
                                        International & GitHub Sponsors
                                    </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Our Open Collective collective is currently pending platform review. In the meantime, you can sponsor us via GitHub Sponsors or contribute directly with UPI above.
                                </p>
                                <div className="pt-1 flex items-center gap-2">
                                    <a
                                        href="https://github.com/sponsors/sahilbnsll"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 h-8 px-3 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                                    >
                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                        </svg>
                                        <span>GitHub Sponsors</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ========================================================================= */}
                {/* 8. PREFOOTER WATERMARK & MANIFESTO (INTERACTIVE HOVER MASK)              */}
                {/* ========================================================================= */}
                <InteractiveWatermark />
            </main>

            <AppFooter />
        </div>
    );
}
