"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { LumaLogo } from '@/components/luma-logo';
import {
    Search,
    ChevronRight,
    Terminal,
    Shield,
    Cpu,
    Sparkles,
    FileText,
    Layers,
    KeyRound,
    Lock,
    GitBranch,
    Server,
    ExternalLink,
    Copy,
    Check,
    HelpCircle,
    CheckCircle2,
    Code2,
    Package,
    Settings,
    FileCheck2,
    Compass,
    ArrowUpRight,
    Zap,
    Globe,
    SlidersHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DocSection {
    id: string;
    title: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
}

const QUICK_JUMPS = [
    { id: 'quickstart', label: '⚡ Quickstart Guide' },
    { id: 'architecture', label: '📐 System Flow' },
    { id: 'byok', label: '🔑 BYOK API Keys' },
    { id: 'typst-engine', label: '🚀 Typst Engine' },
    { id: 'ats-scoring', label: '📊 ATS Scoring Formula' },
    { id: 'factuality', label: '🛡️ Factuality Diff Studio' },
];

const DOC_SECTIONS: DocSection[] = [
    { id: 'overview', title: 'Product Overview', category: 'Getting Started', icon: Sparkles },
    { id: 'quickstart', title: 'Quickstart Guide', category: 'Getting Started', icon: Terminal },
    { id: 'architecture', title: 'Interactive System Architecture', category: 'Core Concepts', icon: GitBranch },
    { id: 'workflow', title: '4-Step Resume Workflow', category: 'Core Concepts', icon: Layers },
    { id: 'auth-workspaces', title: 'Authentication & Workspaces', category: 'Core Concepts', icon: Lock },
    { id: 'typst-engine', title: 'Typst Vector Typesetting', category: 'Architecture & Engine', icon: Cpu },
    { id: 'templates', title: 'Template System (48 Systems)', category: 'Architecture & Engine', icon: FileText },
    { id: 'byok', title: 'AI Pipeline & Client-Side BYOK', category: 'Architecture & Engine', icon: KeyRound, badge: 'High Value' },
    { id: 'ats-scoring', title: 'Deterministic ATS Scoring', category: 'Architecture & Engine', icon: CheckCircle2 },
    { id: 'factuality', title: 'Factuality & Integrity Verification', category: 'Security & Privacy', icon: Shield },
    { id: 'security-privacy', title: 'Data Handling & Privacy Standards', category: 'Security & Privacy', icon: Server },
    { id: 'stack-dependencies', title: 'Tech Stack & Dependency Audit', category: 'Engineering', icon: Package },
    { id: 'configuration', title: 'Environment Variables & Config', category: 'Engineering', icon: Settings },
    { id: 'local-development', title: 'Local Development & Testing', category: 'Engineering', icon: Code2 },
    { id: 'shortcuts', title: 'Keyboard Shortcuts Reference', category: 'Engineering', icon: SlidersHorizontal },
    { id: 'deployment', title: 'Production Deployment Guide', category: 'Operations', icon: Globe },
    { id: 'troubleshooting', title: 'Troubleshooting & FAQ', category: 'Operations', icon: HelpCircle },
    { id: 'contributing', title: 'Contribution Workflow', category: 'Community', icon: GitBranch },
    { id: 'license', title: 'License & Open-Source Terms', category: 'Community', icon: FileCheck2 },
];

const BYOK_PROVIDERS = [
    {
        id: 'gemini',
        name: 'Google Gemini',
        tag: 'Fastest / Recommended',
        models: [
            { id: 'gemini-2.5-flash', latency: '400ms', tokenLimit: '1M tokens', cost: 'Free tier / Ultra low' },
            { id: 'gemini-2.5-pro', latency: '1,200ms', tokenLimit: '2M tokens', cost: '$1.25 / 1M tokens' },
            { id: 'gemini-2.5-flash-lite', latency: '250ms', tokenLimit: '1M tokens', cost: 'Minimal' }
        ],
        headerKey: 'x-gemini-api-key',
        envKey: 'GEMINI_API_KEY',
        portalUrl: 'https://aistudio.google.com/app/apikey',
        notes: 'Native support for JSON structured outputs. Recommended for production resilience.'
    },
    {
        id: 'openai',
        name: 'OpenAI',
        tag: 'Industry Benchmark',
        models: [
            { id: 'gpt-4o', latency: '900ms', tokenLimit: '128K tokens', cost: '$2.50 / 1M tokens' },
            { id: 'gpt-4o-mini', latency: '450ms', tokenLimit: '128K tokens', cost: '$0.15 / 1M tokens' },
            { id: 'o3-mini', latency: '2,100ms', tokenLimit: '200K tokens', cost: 'Reasoning model' }
        ],
        headerKey: 'x-openai-api-key',
        envKey: 'OPENAI_API_KEY',
        portalUrl: 'https://platform.openai.com/api-keys',
        notes: 'High compliance with strict schema constraints and markdown formatting.'
    },
    {
        id: 'claude',
        name: 'Anthropic Claude',
        tag: 'Nuanced Editorial Tone',
        models: [
            { id: 'claude-3-5-sonnet-20241022', latency: '1,100ms', tokenLimit: '200K tokens', cost: '$3.00 / 1M tokens' },
            { id: 'claude-3-5-haiku-20241022', latency: '350ms', tokenLimit: '200K tokens', cost: '$0.80 / 1M tokens' }
        ],
        headerKey: 'x-anthropic-api-key',
        envKey: 'ANTHROPIC_API_KEY',
        portalUrl: 'https://console.anthropic.com/settings/keys',
        notes: 'Unmatched vocabulary and concise impact phrasing for senior and executive resumes.'
    },
    {
        id: 'groq',
        name: 'Groq Cloud',
        tag: 'Near-Instant LPU Inference',
        models: [
            { id: 'qwen/qwen3.6-27b', latency: '180ms', tokenLimit: '128K tokens', cost: 'High speed open weights' },
            { id: 'llama-3.3-70b-versatile', latency: '320ms', tokenLimit: '128K tokens', cost: 'Low cost' }
        ],
        headerKey: 'x-groq-api-key',
        envKey: 'GROQ_API_KEY',
        portalUrl: 'https://console.groq.com/keys',
        notes: 'Optimal for low-latency live interactive tailoring directly in browser sessions.'
    }
];

export default function DocsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('overview');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = useState('gemini');
    const [scrollProgress, setScrollProgress] = useState(0);

    // Track scroll position instantaneously with requestAnimationFrame
    useEffect(() => {
        let ticking = false;

        const updateScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
            }

            const scrollPosition = window.scrollY + 130;
            const sections = DOC_SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section.offsetTop <= scrollPosition) {
                    setActiveSection(section.id);
                    break;
                }
            }
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        updateScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle initial hash navigation (including #byok and #ai-byok aliases)
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash) {
            const hash = window.location.hash.replace('#', '');
            const targetId = (hash === 'ai-byok' || hash === 'byok') ? 'byok' : hash;
            const el = document.getElementById(targetId);
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActiveSection(targetId);
                }, 150);
            }
        }
    }, []);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.replaceState(null, '', `#${id}`);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredSections = useMemo(() => {
        if (!searchQuery.trim()) return DOC_SECTIONS;
        const q = searchQuery.toLowerCase();
        return DOC_SECTIONS.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        DOC_SECTIONS.forEach(s => set.add(s.category));
        return Array.from(set);
    }, []);

    const activeProviderData = useMemo(() => {
        return BYOK_PROVIDERS.find(p => p.id === selectedProvider) || BYOK_PROVIDERS[0];
    }, [selectedProvider]);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary relative">
            <AppHeader />

            {/* Reading Progress Indicator Bar */}
            <div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-sky-400 z-50 origin-left transition-all duration-100 ease-out pointer-events-none"
                style={{ transform: `scaleX(${scrollProgress / 100})` }}
            />

            {/* Sub-Header Breadcrumbs & Global Search */}
            <div className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-14 z-30 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                            <LumaLogo size={16} />
                            <span>Home</span>
                        </Link>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
                        <span className="font-semibold text-foreground">Documentation</span>
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-medium border border-primary/20">
                            Production Specification
                        </span>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search docs (e.g. Typst, BYOK, ATS scoring)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 pl-9 pr-8 text-xs bg-muted/30 border-border/70 rounded-lg focus-visible:ring-1 focus-visible:ring-primary shadow-2xs"
                        />
                        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted border border-border text-muted-foreground pointer-events-none hidden sm:inline-block">
                            /
                        </kbd>
                    </div>
                </div>

                {/* Quick Navigation Chips */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 overflow-x-auto flex items-center gap-2 no-scrollbar text-xs">
                    <span className="text-[11px] font-medium text-muted-foreground shrink-0 flex items-center gap-1">
                        <Zap className="h-3 w-3 text-primary" />
                        Quick Jump:
                    </span>
                    {QUICK_JUMPS.map((qj) => {
                        const isActive = activeSection === qj.id;
                        return (
                            <button
                                key={qj.id}
                                type="button"
                                onClick={() => scrollToSection(qj.id)}
                                className={cn(
                                    "px-2.5 py-1 rounded-full transition-colors shrink-0 text-[11px] border cursor-pointer font-medium",
                                    isActive
                                        ? "bg-primary/15 text-primary border-primary/30 shadow-2xs"
                                        : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
                                )}
                            >
                                {qj.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                
                {/* Mobile / Tablet Collapsible Table of Contents (< lg) */}
                <div className="lg:hidden col-span-1 w-full">
                    <details className="group rounded-2xl border border-border/70 bg-card/70 backdrop-blur-md p-3.5 transition-all shadow-xs">
                        <summary className="flex items-center justify-between font-display text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer select-none">
                            <div className="flex items-center gap-2">
                                <Compass className="h-4 w-4 text-primary" />
                                <span className="text-foreground font-semibold">Table of Contents</span>
                                <span className="text-[10px] font-mono text-muted-foreground font-normal">
                                    ({DOC_SECTIONS.length} Topics)
                                </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                        </summary>

                        <nav className="mt-3 pt-3 border-t border-border/40 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                            {categories.map((category) => {
                                const sections = filteredSections.filter(s => s.category === category);
                                if (sections.length === 0) return null;
                                return (
                                    <div key={category} className="space-y-1">
                                        <h4 className="text-[11px] font-semibold text-foreground/75 uppercase tracking-wider px-2 py-0.5">
                                            {category}
                                        </h4>
                                        <div className="space-y-0.5">
                                            {sections.map((section) => {
                                                const isActive = activeSection === section.id;
                                                const Icon = section.icon;
                                                return (
                                                    <button
                                                        key={section.id}
                                                        type="button"
                                                        onClick={() => scrollToSection(section.id)}
                                                        className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg transition-colors text-left group cursor-pointer ${
                                                            isActive
                                                                ? 'bg-primary/10 text-primary font-medium'
                                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 truncate">
                                                            <Icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'}`} />
                                                            <span className="truncate">{section.title}</span>
                                                        </div>

                                                        {section.badge && (
                                                            <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                                                                {section.badge}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </nav>
                    </details>
                </div>

                {/* Left Sticky Navigation Sidebar (Desktop only) */}
                <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-36 space-y-6 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-3 no-scrollbar">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between font-display text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/40">
                            <div className="flex items-center gap-2">
                                <Compass className="h-3.5 w-3.5 text-primary" />
                                <span>Table of Contents</span>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground/80 font-normal">
                                {DOC_SECTIONS.length} Topics
                            </span>
                        </div>

                        <nav className="space-y-5">
                            {categories.map((category) => {
                                const sections = filteredSections.filter(s => s.category === category);
                                if (sections.length === 0) return null;
                                return (
                                    <div key={category} className="space-y-1">
                                        <h4 className="text-[11px] font-semibold text-foreground/75 uppercase tracking-wider px-2 py-0.5">
                                            {category}
                                        </h4>
                                        <div className="space-y-0.5">
                                            {sections.map((section) => {
                                                const isActive = activeSection === section.id;
                                                const Icon = section.icon;
                                                return (
                                                    <button
                                                        key={section.id}
                                                        type="button"
                                                        onClick={() => scrollToSection(section.id)}
                                                        className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg transition-colors text-left group cursor-pointer ${
                                                            isActive
                                                                ? 'bg-primary/10 text-primary font-medium'
                                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 truncate">
                                                            <Icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'}`} />
                                                            <span className="truncate">{section.title}</span>
                                                        </div>

                                                        {section.badge && (
                                                            <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                                                                {section.badge}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Main Article Documentation Content (Minimal, Clean Sections) */}
                <main className="lg:col-span-9 space-y-16 pb-28 text-sm text-muted-foreground leading-relaxed">
                    
                    {/* SECTION 1: Product Overview */}
                    <section id="overview" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            Getting Started • Chapter 01
                        </span>

                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
                            Product Overview & Philosophy
                        </h1>

                        <p className="text-base text-foreground/90 font-medium leading-relaxed">
                            LumaCV is an open-source, career-advancement platform designed to tailor professional resumes to target job descriptions with deterministic accuracy, sub-50ms Typst vector compilation, and zero external database storage of candidates&apos; private career narratives. All specifications, latency benchmarks, and algorithms correspond directly to active production code.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2 shadow-2xs hover:border-primary/40 transition-colors">
                                <span className="font-semibold text-xs text-foreground flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-emerald-500" />
                                    Zero Hallucinations
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    Deterministic verification guarantees that employers, employment dates, academic degrees, and numbers are never fabricated by AI models.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2 shadow-2xs hover:border-primary/40 transition-colors">
                                <span className="font-semibold text-xs text-foreground flex items-center gap-2">
                                    <Cpu className="h-4 w-4 text-primary" />
                                    Sub-50ms Typst Engine
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    Replaces slow, pixelated Chromium PDF generators with the Rust-based Typst typesetting engine for pixel-perfect vector rendering.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2 shadow-2xs hover:border-primary/40 transition-colors">
                                <span className="font-semibold text-xs text-foreground flex items-center gap-2">
                                    <KeyRound className="h-4 w-4 text-amber-500" />
                                    Client-Side BYOK
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    Bring your own Google Gemini, OpenAI, Claude, or Groq API keys with zero server-side credential persistence or retention.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: Quickstart Guide */}
                    <section id="quickstart" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Terminal className="h-3.5 w-3.5" />
                            Getting Started • Chapter 02
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Quickstart Guide
                        </h2>

                        <p>
                            Follow these simple steps to build your first tailored resume on LumaCV:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">1</div>
                                    <strong className="text-foreground text-xs">Create Account / Sign In</strong>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Authenticate at <Link href="/login" className="text-primary hover:underline font-medium">/login</Link> or <Link href="/signup" className="text-primary hover:underline font-medium">/signup</Link>. All resume drafts, templates, and export versions are scoped to your private user workspace.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">2</div>
                                    <strong className="text-foreground text-xs">Upload PDF & Paste Target JD</strong>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Navigate to <Link href="/builder" className="text-primary hover:underline font-medium">/builder</Link>. Paste your target job description and drag-and-drop your existing resume PDF for instant client-side extraction.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">3</div>
                                    <strong className="text-foreground text-xs">Verify Facts & Tailor Bullets</strong>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Step 2 lets you verify parsed fields. Step 3 tailors bullets using multi-provider models while enforcing ground-truth employment facts.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">4</div>
                                    <strong className="text-foreground text-xs">Select Template & Export Vector PDF</strong>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Choose from 48 architectural Typst templates across 8 curated palettes. Download crisp vector PDFs or pure <code className="font-mono text-foreground">.typ</code> source code.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: Interactive System Architecture */}
                    <section id="architecture" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <GitBranch className="h-3.5 w-3.5" />
                            Core Concepts • Chapter 03
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Interactive System Pipeline
                        </h2>

                        <p>
                            The diagram below depicts the execution lifecycle from PDF upload to vector compilation:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => scrollToSection('workflow')}
                                className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 text-left transition-all group"
                            >
                                <div className="text-[10px] font-mono text-primary font-bold mb-1">STAGE 01</div>
                                <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Client PDF Parse</div>
                                <p className="text-[11px] text-muted-foreground mt-1">Mozilla pdfjs-dist web worker in-browser extraction.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => scrollToSection('workflow')}
                                className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 text-left transition-all group"
                            >
                                <div className="text-[10px] font-mono text-primary font-bold mb-1">STAGE 02</div>
                                <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Schema Parsing</div>
                                <p className="text-[11px] text-muted-foreground mt-1">Zod schema validation + jsonrepair syntax recovery.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => scrollToSection('byok')}
                                className="p-3.5 rounded-xl border border-primary/40 bg-primary/5 text-left transition-all group"
                            >
                                <div className="text-[10px] font-mono text-primary font-bold mb-1">STAGE 03</div>
                                <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">BYOK AI Tailoring</div>
                                <p className="text-[11px] text-muted-foreground mt-1">Client header encryption with Gemini/OpenAI/Claude.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => scrollToSection('factuality')}
                                className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 text-left transition-all group"
                            >
                                <div className="text-[10px] font-mono text-primary font-bold mb-1">STAGE 04</div>
                                <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Fact Guardrails</div>
                                <p className="text-[11px] text-muted-foreground mt-1">Zero-hallucination verification & side-by-side diff.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => scrollToSection('typst-engine')}
                                className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 text-left transition-all group"
                            >
                                <div className="text-[10px] font-mono text-primary font-bold mb-1">STAGE 05</div>
                                <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Typst Engine</div>
                                <p className="text-[11px] text-muted-foreground mt-1">Sub-50ms vector compilation across 48 templates.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => scrollToSection('workflow')}
                                className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/5 text-left transition-all group"
                            >
                                <div className="text-[10px] font-mono text-emerald-500 font-bold mb-1">STAGE 06</div>
                                <div className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors">Vector PDF / .typ</div>
                                <p className="text-[11px] text-muted-foreground mt-1">Downloadable print-ready vector PDF or raw source.</p>
                            </button>
                        </div>
                    </section>

                    {/* SECTION 4: 4-Step Resume Workflow */}
                    <section id="workflow" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5" />
                            Core Concepts • Chapter 04
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            4-Step Resume Studio Workflow
                        </h2>

                        <div className="space-y-4 pt-2">
                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                                    <span className="font-mono text-primary font-bold">Step 1:</span>
                                    <span>Target Job Description & Client-Side Extraction</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Text extraction executes in your browser using Mozilla&apos;s <code className="text-foreground font-mono">pdfjs-dist</code> with a dedicated web worker (<code className="text-foreground font-mono">pdf.worker.min.js</code>). Text chunks and embedded hyperlink annotations (LinkedIn, GitHub, portfolios) are normalized locally before passing to the structured schema parser.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                                    <span className="font-mono text-primary font-bold">Step 2:</span>
                                    <span>Experience & Profile Details Verification</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Provides an interactive form to inspect, correct, and augment all extracted entries (personal info, experience bullets, education degrees, skills taxonomy). Edits automatically update the client-side Zustand store and hydrate the downstream typesetting engine.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                                    <span className="font-mono text-primary font-bold">Step 3:</span>
                                    <span>Dual-Vector Processing & Bullet Tailoring</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    The AI service evaluates alignment across four weighted vectors (Required Skills 40%, Responsibilities 25%, Preferred Skills 20%, Terminology 15%). Bullet points are strengthened to highlight quantifiable outcomes matching target role expectations, verified against the candidate&apos;s immutable factual background.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                                    <span className="font-mono text-primary font-bold">Step 4:</span>
                                    <span>Typesetting Studio, Template Picker & Export</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Features live Typst vector compilation, real-time zoom controls, side-by-side bullet diff inspection, color swatch adjustments, and instant download of production-ready vector PDFs or source <code className="text-foreground font-mono">.typ</code> markup.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: Authentication & Workspaces */}
                    <section id="auth-workspaces" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5" />
                            Core Concepts • Chapter 05
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Authentication & Workspaces
                        </h2>

                        <p>
                            To prevent data loss and ensure privacy, LumaCV requires candidate authentication before any meaningful resume operation (uploading, modifying details, tailoring, or exporting).
                        </p>

                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Session Security Model</h3>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs">
                                <li><strong>SSR Cookie Sessions:</strong> Handled using <code className="font-mono text-foreground">@supabase/ssr</code> via HTTP-only, secure cookies verified in <code className="font-mono text-foreground">middleware.ts</code>.</li>
                                <li><strong>Private Workspace Isolation:</strong> Resumes are stored in the <code className="font-mono text-foreground">user_resumes</code> PostgreSQL table protected by strict Row Level Security (RLS) policies enforcing <code className="font-mono text-foreground">auth.uid() = user_id</code>.</li>
                                <li><strong>Graceful Redirects:</strong> Visiting protected workspaces while unauthenticated preserves the intended target URL via <code className="font-mono text-foreground">?redirect=...</code>, returning users to their workspace immediately after login.</li>
                            </ul>
                        </div>
                    </section>

                    {/* SECTION 6: Typst Vector Typesetting */}
                    <section id="typst-engine" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Cpu className="h-3.5 w-3.5" />
                            Architecture & Engine • Chapter 06
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Typst Vector Typesetting Engine
                        </h2>

                        <p>
                            Unlike legacy tools that rely on headless browsers (Puppeteer, Playwright) or heavy LaTeX distributions, LumaCV is engineered natively around <strong>Typst</strong>, a modern, Rust-based typesetting system.
                        </p>

                        <div className="overflow-x-auto border border-border/70 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border/70 bg-muted/30 text-foreground font-semibold">
                                        <th className="p-3">Engine</th>
                                        <th className="p-3">Average Compile Time</th>
                                        <th className="p-3">Output Format</th>
                                        <th className="p-3">Runtime Footprint</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    <tr className="bg-card">
                                        <td className="p-3 font-semibold text-primary">Typst (LumaCV)</td>
                                        <td className="p-3 font-mono text-emerald-500 font-medium">15ms – 45ms</td>
                                        <td className="p-3">Native Vector PDF</td>
                                        <td className="p-3 font-mono">~35 MB binary</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-muted-foreground">Puppeteer / Chromium</td>
                                        <td className="p-3 font-mono text-muted-foreground">1,800ms – 4,500ms</td>
                                        <td className="p-3 text-muted-foreground">Rasterized Web Print</td>
                                        <td className="p-3 font-mono text-muted-foreground">~450 MB Chromium</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-muted-foreground">Legacy LaTeX (pdflatex)</td>
                                        <td className="p-3 font-mono text-muted-foreground">3,000ms – 8,000ms</td>
                                        <td className="p-3 text-muted-foreground">Vector PDF</td>
                                        <td className="p-3 font-mono text-muted-foreground">~3 GB TeX Live</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* SECTION 7: Template System */}
                    <section id="templates" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            Architecture & Engine • Chapter 07
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Template Catalog & Systems (48 Systems)
                        </h2>

                        <p>
                            LumaCV includes 48 distinct Typst template systems organized into 5 professional archetypes. Explore the full interactive catalog in our <Link href="/templates" className="text-primary hover:underline font-medium">Templates Gallery</Link>:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                                <strong className="text-foreground text-xs">1. ATS-Optimized (13 Systems)</strong>
                                <p className="text-[11px] text-muted-foreground">Linear typographic hierarchies designed for automated enterprise applicant tracking systems (`Impact`, `Switch`, `Grad`, `Leadership`, `Casework`).</p>
                            </div>
                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                                <strong className="text-foreground text-xs">2. Modern & Tech (10 Systems)</strong>
                                <p className="text-[11px] text-muted-foreground">Clean, high-density layouts favored by software engineers, platform architects, and tech founders (`Modern`, `Engineering`, `Compact`, `Terminal`).</p>
                            </div>
                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                                <strong className="text-foreground text-xs">3. Executive & Advisory (10 Systems)</strong>
                                <p className="text-[11px] text-muted-foreground">Authoritative serif and mixed hierarchies designed for directors, consultants, and senior leaders (`Classic`, `Executive`, `Consultant`, `Meridian`).</p>
                            </div>
                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                                <strong className="text-foreground text-xs">4. Editorial & Creative (10 Systems)</strong>
                                <p className="text-[11px] text-muted-foreground">Design-forward typography, asymmetric balance, and clean editorial whitespace (`Boutique`, `Editorial`, `Atelier`, `Swiss`, `Nordic`).</p>
                            </div>
                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1 sm:col-span-2">
                                <strong className="text-foreground text-xs">5. Academic & Research (5 Systems)</strong>
                                <p className="text-[11px] text-muted-foreground">Multi-page scholarly formats accommodating extensive publications, research grants, and advisory boards (`Academic`, `Research Modern`).</p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 8: AI Engine & BYOK */}
                    <section id="byok" className="space-y-6 scroll-mt-32 border-b border-border/40 pb-14">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                                <KeyRound className="h-3.5 w-3.5" />
                                Architecture & Engine • Chapter 08
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                                Bring Your Own Key (BYOK)
                            </span>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                                AI Pipeline & Client-Side BYOK Setup
                            </h2>
                            <p className="text-sm text-foreground/85">
                                LumaCV supports community-tier models out of the box and empowers candidates to connect their personal API keys from Google, OpenAI, Anthropic, or Groq for unlimited high-throughput tailoring.
                            </p>
                        </div>

                        {/* Interactive Provider Tab Switcher */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
                                {BYOK_PROVIDERS.map((provider) => (
                                    <button
                                        key={provider.id}
                                        type="button"
                                        onClick={() => setSelectedProvider(provider.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                                            selectedProvider === provider.id
                                                ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                                                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <span>{provider.name}</span>
                                        <span className="text-[10px] opacity-75 hidden sm:inline">({provider.tag})</span>
                                    </button>
                                ))}
                            </div>

                            {/* Active Provider Card */}
                            <div className="p-5 rounded-xl border border-border/70 bg-card space-y-4 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <span>{activeProviderData.name}</span>
                                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                                {activeProviderData.tag}
                                            </span>
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">{activeProviderData.notes}</p>
                                    </div>
                                    <a
                                        href={activeProviderData.portalUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium shrink-0"
                                    >
                                        <span>Get API Key</span>
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </a>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Supported Models & Latency Benchmarks
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {activeProviderData.models.map((m) => (
                                            <div key={m.id} className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                                                <div className="font-mono text-xs font-semibold text-foreground truncate">{m.id}</div>
                                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                    <span>Latency:</span>
                                                    <span className="font-mono text-emerald-500 font-medium">{m.latency}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                    <span>Context:</span>
                                                    <span className="font-mono">{m.tokenLimit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-border/40">
                                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Client Security Architecture
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                                        <li><strong>Storage:</strong> Stored strictly in browser encrypted <code className="font-mono text-foreground">localStorage</code> under key <code className="font-mono text-foreground">luma_byok_keys</code>.</li>
                                        <li><strong>Transmission:</strong> Transmitted exclusively as TLS headers (<code className="font-mono text-foreground">{activeProviderData.headerKey}</code>) during completion calls.</li>
                                        <li><strong>Zero Retention:</strong> Never saved to PostgreSQL, Supabase Auth tables, or application server logs.</li>
                                    </ul>
                                </div>

                                <div className="pt-2 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Ready to configure your personal keys?</span>
                                    <Link href="/profile" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-medium transition-colors">
                                        <span>Open Key Settings</span>
                                        <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 9: Deterministic ATS Scoring */}
                    <section id="ats-scoring" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Architecture & Engine • Chapter 09
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Deterministic ATS Scoring Formula
                        </h2>

                        <p>
                            LumaCV evaluates alignment between your resume and target job descriptions using a deterministic 4-vector algorithm defined in <code className="font-mono text-foreground">app/api/v1/resume/score/route.ts</code>:
                        </p>

                        <div className="space-y-3 pt-2">
                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-foreground">1. Required Skills & Technical Toolchains (Weight: 40%)</span>
                                    <span className="font-mono font-bold text-primary">0.40</span>
                                </div>
                                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full w-[40%]" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Measures exact and fuzzy matches for primary technical languages, libraries, and core qualifications specified in the JD requirements section.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-foreground">2. Responsibilities & Action Verbs (Weight: 25%)</span>
                                    <span className="font-mono font-bold text-emerald-500">0.25</span>
                                </div>
                                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[25%]" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Evaluates executive verbs (e.g., spearheaded, architected, orchestrated) and presence of measurable metrics (revenue, latency, scale).
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-foreground">3. Preferred Skills & Methodologies (Weight: 20%)</span>
                                    <span className="font-mono font-bold text-sky-500">0.20</span>
                                </div>
                                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                                    <div className="bg-sky-500 h-full w-[20%]" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Scans for secondary qualifications such as agile frameworks, CI/CD pipelines, and cloud certifications.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-foreground">4. Industry Terminology & Nomenclature (Weight: 15%)</span>
                                    <span className="font-mono font-bold text-amber-500">0.15</span>
                                </div>
                                <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full w-[15%]" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Ensures appropriate acronyms (e.g. SOC2, HIPAA, Kubernetes, Microservices) match standard industry taxonomy.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 10: Factuality & Safety */}
                    <section id="factuality" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5" />
                            Security & Privacy • Chapter 10
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Factuality & Integrity Verification
                        </h2>

                        <p>
                            Standard AI chatbots frequently hallucinate certifications, employers, or technologies you never used. LumaCV enforces strict anti-hallucination guardrails implemented in <code className="font-mono text-foreground">lib/fact-validator.ts</code>:
                        </p>

                        <ul className="list-disc pl-5 space-y-2 text-xs">
                            <li><strong>Immutable Ground Truth:</strong> Extracted company names, job titles, dates of employment, and university degrees cannot be modified or invented by the AI pipeline.</li>
                            <li><strong>Bullet Diff Studio:</strong> In Step 4, candidates can inspect side-by-side diffs of original vs. tailored bullets and selectively revert any individual line with a single click.</li>
                            <li><strong>Truth Verification Algorithm:</strong> Any newly suggested bullet point that introduces ungrounded credentials not substantiated by the source document is flagged or pruned.</li>
                        </ul>
                    </section>

                    {/* SECTION 11: Data Handling & Privacy */}
                    <section id="security-privacy" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Server className="h-3.5 w-3.5" />
                            Security & Privacy • Chapter 11
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Data Handling & Privacy Standards
                        </h2>

                        <p>
                            We treat candidate career histories as strictly confidential data:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                                <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                                    Zero Model Training
                                </span>
                                <p className="text-[11px] text-muted-foreground">Candidate resumes, drafts, and job descriptions are never used to train public or proprietary AI models.</p>
                            </div>
                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1">
                                <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                                    <Server className="h-3.5 w-3.5 text-emerald-500" />
                                    Row Level Security (RLS)
                                </span>
                                <p className="text-[11px] text-muted-foreground">Every cloud-saved resume is locked behind PostgreSQL Row Level Security accessible only to the authenticated session owner.</p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 12: Tech Stack & Dependencies */}
                    <section id="stack-dependencies" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5" />
                            Engineering • Chapter 12
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Tech Stack & Dependency Audit
                        </h2>

                        <p>
                            LumaCV is built with modern, battle-tested technologies selected for performance, type safety, and minimal bundle size:
                        </p>

                        <div className="overflow-x-auto border border-border/70 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border/70 bg-muted/30 text-foreground font-semibold">
                                        <th className="p-3">Package / Integration</th>
                                        <th className="p-3">Version</th>
                                        <th className="p-3">Role in LumaCV</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    <tr className="bg-card">
                                        <td className="p-3 font-semibold font-mono text-foreground">Next.js (App Router)</td>
                                        <td className="p-3 font-mono">14.2.x</td>
                                        <td className="p-3">Core web framework, serverless route handlers, and SSR streaming.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-semibold font-mono text-foreground">TypeScript</td>
                                        <td className="p-3 font-mono">5.x</td>
                                        <td className="p-3">Full end-to-end type safety across schemas, stores, and API payloads.</td>
                                    </tr>
                                    <tr className="bg-card">
                                        <td className="p-3 font-semibold font-mono text-foreground">Tailwind CSS</td>
                                        <td className="p-3 font-mono">3.4.x</td>
                                        <td className="p-3">Utility-first design system with semantic dark/light design tokens.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-semibold font-mono text-foreground">Typst CLI</td>
                                        <td className="p-3 font-mono">0.11.x</td>
                                        <td className="p-3">Native serverless compiler generating sub-50ms vector PDFs.</td>
                                    </tr>
                                    <tr className="bg-card">
                                        <td className="p-3 font-semibold font-mono text-foreground">Zustand</td>
                                        <td className="p-3 font-mono">4.5.x</td>
                                        <td className="p-3">Reactive client store with persistent local storage hydration guards.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-semibold font-mono text-foreground">Radix UI & Lucide</td>
                                        <td className="p-3 font-mono">Latest</td>
                                        <td className="p-3">Accessible headless primitives (Dialog, Tabs, Accordion) and uniform icons.</td>
                                    </tr>
                                    <tr className="bg-card">
                                        <td className="p-3 font-semibold font-mono text-foreground">Framer Motion</td>
                                        <td className="p-3 font-mono">12.x</td>
                                        <td className="p-3">Smooth spring animations, collapsible panels, and page transitions.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-semibold font-mono text-foreground">pdfjs-dist</td>
                                        <td className="p-3 font-mono">4.10.x</td>
                                        <td className="p-3">Client-side PDF text and hyperlink extraction via web worker.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* SECTION 13: Configuration & Environment Variables */}
                    <section id="configuration" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Settings className="h-3.5 w-3.5" />
                            Engineering • Chapter 13
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Environment Variables & Configuration
                        </h2>

                        <p>
                            Configure the following variables in your <code className="font-mono text-foreground">.env.local</code> file:
                        </p>

                        <div className="overflow-x-auto border border-border/70 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border/70 bg-muted/30 text-foreground font-semibold">
                                        <th className="p-3">Variable</th>
                                        <th className="p-3">Required</th>
                                        <th className="p-3">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    <tr className="bg-card">
                                        <td className="p-3 font-mono text-foreground">GEMINI_API_KEY</td>
                                        <td className="p-3 text-emerald-500 font-semibold">Yes*</td>
                                        <td className="p-3">Server-side fallback API key for Google Gemini (Flash / Flash-Lite).</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-mono text-foreground">GROQ_API_KEY</td>
                                        <td className="p-3 text-emerald-500 font-semibold">Yes*</td>
                                        <td className="p-3">Server-side secondary failover key for Groq Cloud (Qwen / Llama).</td>
                                    </tr>
                                    <tr className="bg-card">
                                        <td className="p-3 font-mono text-foreground">NEXT_PUBLIC_SUPABASE_URL</td>
                                        <td className="p-3 text-amber-500 font-semibold">Optional</td>
                                        <td className="p-3">Supabase project URL for cloud authentication & database persistence.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-mono text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
                                        <td className="p-3 text-amber-500 font-semibold">Optional</td>
                                        <td className="p-3">Supabase anonymous public key.</td>
                                    </tr>
                                    <tr className="bg-card">
                                        <td className="p-3 font-mono text-foreground">SUPABASE_SERVICE_ROLE_KEY</td>
                                        <td className="p-3 text-amber-500 font-semibold">Optional</td>
                                        <td className="p-3">Admin service role key for system operations.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* SECTION 14: Local Development */}
                    <section id="local-development" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Code2 className="h-3.5 w-3.5" />
                            Engineering • Chapter 14
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Local Development & Testing
                        </h2>

                        <p>To run LumaCV locally on your development machine:</p>

                        <div className="space-y-3">
                            <div className="relative rounded-xl border border-border/70 bg-card p-4 font-mono text-xs text-foreground">
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40 text-[11px] text-muted-foreground">
                                    <span>Terminal</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy("git clone https://github.com/sahilbnsll/LumaCV.git\ncd LumaCV\nnpm install\ncp .env.example .env.local\nnpm run dev", "dev-setup")}
                                        className="hover:text-foreground flex items-center gap-1 cursor-pointer"
                                    >
                                        {copiedId === "dev-setup" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                        <span>Copy</span>
                                    </button>
                                </div>
                                <pre className="leading-relaxed overflow-x-auto">
{`git clone https://github.com/sahilbnsll/LumaCV.git
cd LumaCV
npm install
cp .env.example .env.local
npm run dev`}
                                </pre>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Run the automated typecheck and validation tests:
                            </p>

                            <div className="relative rounded-xl border border-border/70 bg-card p-4 font-mono text-xs text-foreground">
                                <pre className="leading-relaxed overflow-x-auto">
{`# 1. Typecheck the entire repository
npx tsc --noEmit

# 2. Production build compilation
npm run build`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 15: Keyboard Shortcuts */}
                    <section id="shortcuts" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            Engineering • Chapter 15
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Keyboard Shortcuts Reference
                        </h2>

                        <p>Speed up your resume engineering workflow with these built-in hotkeys:</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card">
                                <span className="text-xs text-foreground">Universal Command Palette</span>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 rounded bg-muted border border-border text-[11px] font-mono">⌘</kbd>
                                    <kbd className="px-2 py-1 rounded bg-muted border border-border text-[11px] font-mono">K</kbd>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card">
                                <span className="text-xs text-foreground">Fast Search Documentation</span>
                                <kbd className="px-2 py-1 rounded bg-muted border border-border text-[11px] font-mono">/</kbd>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card">
                                <span className="text-xs text-foreground">Export PDF in Studio</span>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 rounded bg-muted border border-border text-[11px] font-mono">⌘</kbd>
                                    <kbd className="px-2 py-1 rounded bg-muted border border-border text-[11px] font-mono">P</kbd>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card">
                                <span className="text-xs text-foreground">Close Drawers / Modals</span>
                                <kbd className="px-2 py-1 rounded bg-muted border border-border text-[11px] font-mono">Esc</kbd>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 16: Deployment */}
                    <section id="deployment" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5" />
                            Operations • Chapter 16
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Production Deployment Guide
                        </h2>

                        <p>
                            LumaCV is optimized for one-click deployment on <strong>Vercel</strong>:
                        </p>

                        <ul className="list-disc pl-5 space-y-2 text-xs">
                            <li><strong>Native Typst Execution:</strong> The serverless compiler automatically provisions the platform-specific Typst binary in Node.js serverless functions.</li>
                            <li><strong>Timeout Buffering:</strong> Long-running AI endpoints (<code className="font-mono text-foreground">/api/v1/resume/parse</code>, <code className="font-mono text-foreground">/api/v1/resume/tailor</code>) are configured with <code className="font-mono text-foreground">maxDuration = 60</code>.</li>
                            <li><strong>Edge Compatibility:</strong> Real-time keyword scoring (<code className="font-mono text-foreground">/api/v1/resume/score</code>) runs on Vercel Edge for sub-10ms latency.</li>
                        </ul>
                    </section>

                    {/* SECTION 17: Troubleshooting */}
                    <section id="troubleshooting" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <HelpCircle className="h-3.5 w-3.5" />
                            Operations • Chapter 17
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Troubleshooting & Common Questions
                        </h2>

                        <div className="space-y-3 pt-2">
                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <strong className="text-foreground text-xs">Q: PDF text extraction returns empty or garbled text?</strong>
                                <p className="text-xs text-muted-foreground">
                                    If your PDF was created via a flat image scanner or is password-protected, text chunks cannot be extracted client-side. You can either export a fresh text-selectable PDF or skip straight to Step 2 to type your details into the structured fields manually.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <strong className="text-foreground text-xs">Q: &quot;Too many requests&quot; (HTTP 429) during peak hours?</strong>
                                <p className="text-xs text-muted-foreground">
                                    The free community quota enforces per-IP rate limits to prevent automated abuse. To bypass all platform rate limits, configure your own free personal API key in <Link href="/profile" className="text-primary hover:underline font-medium">Settings (BYOK)</Link>.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <strong className="text-foreground text-xs">Q: How do I compile Typst locally from the downloaded .typ file?</strong>
                                <p className="text-xs text-muted-foreground">
                                    Install Typst on your machine (<code className="font-mono text-foreground">brew install typst</code> on macOS, <code className="font-mono text-foreground">winget install Typst.Typst</code> on Windows), then run <code className="font-mono text-foreground">typst compile resume.typ</code>.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 18: Contributing */}
                    <section id="contributing" className="space-y-5 scroll-mt-32 border-b border-border/40 pb-14">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <GitBranch className="h-3.5 w-3.5" />
                            Community • Chapter 18
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Contribution Workflow
                        </h2>

                        <p>
                            LumaCV welcomes open-source contributions from developers, designers, and typography engineers!
                        </p>

                        <div className="space-y-3 pt-2">
                            <p className="text-xs text-muted-foreground">
                                Please review our <a href="https://github.com/sahilbnsll/LumaCV/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-1">CONTRIBUTING.md guidelines <ExternalLink className="h-3 w-3" /></a> before opening a pull request:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs">
                                <li><strong>Code Standards:</strong> Adhere to existing TypeScript conventions, semantic Tailwind tokens, and shadcn UI component patterns.</li>
                                <li><strong>Typesetting Templates:</strong> New Typst templates must reside in <code className="font-mono text-foreground">typst/templates/</code> and be registered in <code className="font-mono text-foreground">lib/templates-data.ts</code>.</li>
                                <li><strong>Verification:</strong> Ensure <code className="font-mono text-foreground">npx tsc --noEmit</code> and <code className="font-mono text-foreground">npm run build</code> pass with 0 errors before submitting.</li>
                            </ul>
                        </div>
                    </section>

                    {/* SECTION 19: License */}
                    <section id="license" className="space-y-5 scroll-mt-32">
                        <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <FileCheck2 className="h-3.5 w-3.5" />
                            Community • Chapter 19
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            License & Open-Source Terms
                        </h2>

                        <p>
                            LumaCV is open-source software licensed under the <strong>MIT License</strong>:
                        </p>

                        <div className="p-4 rounded-xl border border-border/70 bg-card/60 font-mono text-xs text-foreground/90 space-y-3">
                            <p className="font-semibold text-foreground">MIT License</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Copyright (c) 2026 Sahil Bansal & LumaCV Contributors.<br /><br />
                                Permission is hereby granted, free of charge, to any person obtaining a copy
                                of this software and associated documentation files (the &quot;Software&quot;), to deal
                                in the Software without restriction, including without limitation the rights
                                to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                                copies of the Software, and to permit persons to whom the Software is
                                furnished to do so, subject to the following conditions:<br /><br />
                                The above copyright notice and this permission notice shall be included in all
                                copies or substantial portions of the Software.
                            </p>
                        </div>
                    </section>

                </main>
            </div>

            <AppFooter />
        </div>
    );
}
