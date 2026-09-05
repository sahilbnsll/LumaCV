"use client";

import React, { useState, useRef, useId, useMemo } from 'react';
import Link from 'next/link';
import { 
    Sparkles, 
    Check, 
    Copy, 
    ChevronDown, 
    RefreshCw, 
    ExternalLink, 
    Zap, 
    ShieldCheck, 
    SlidersHorizontal, 
    Maximize2, 
    Minimize2, 
    Layers, 
    Briefcase, 
    GraduationCap, 
    Award, 
    Cpu,
    FileCode2,
    Search,
    RotateCcw
} from 'lucide-react';
import { LumaLogo } from '@/components/luma-logo';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================================
// PERSONAS / MOCK DATA
// ============================================================================

interface RoleItem {
    title: string;
    company: string;
    period: string;
    bullets: string[];
}

interface Persona {
    id: string;
    filename: string;
    name: string;
    headline: string;
    roleCount: string;
    atsScore: number;
    vectorScore: number;
    roles: RoleItem[];
    skills: {
        category: string;
        items: string[];
    }[];
    education: {
        degree: string;
        school: string;
        period: string;
        gpa: string;
    };
    certifications: string[];
    typstSource: string;
}

const PERSONAS: Persona[] = [
    {
        id: 'alex-chen',
        filename: 'Alex_Chen_Stripe_Senior_Engineer.typ',
        name: 'ALEX CHEN',
        headline: 'Staff Full Stack Engineer • Stripe Alignment',
        roleCount: '3 roles',
        atsScore: 94,
        vectorScore: 94,
        roles: [
            {
                title: 'Staff Full Stack Engineer',
                company: 'Vercel Inc.',
                period: '2022 – Present',
                bullets: [
                    'Architected edge data delivery layer using Next.js App Router and TypeScript, reducing p99 API response latencies by 38% for 4M+ daily active sessions.',
                    'Engineered streaming vector compiler in Typst/Rust, dropping PDF generation compute time from 420ms down to sub-45ms.',
                    'Mentored a 14-engineer platform team and unified core design system primitives across 6 enterprise web properties.'
                ]
            },
            {
                title: 'Senior Software Engineer',
                company: 'Stripe',
                period: '2020 – 2022',
                bullets: [
                    'Led merchant settlement pipeline processing $8B+ annual transaction volume with 99.999% SLA across distributed Postgres and Kafka clusters.',
                    'Engineered real-time fraud mitigation heuristics preventing an estimated $12M in chargeback losses.'
                ]
            },
            {
                title: 'Software Engineer',
                company: 'Airbnb',
                period: '2018 – 2020',
                bullets: [
                    'Scaled inventory availability service handling 140k queries per second with zero-downtime distributed Redis failover.'
                ]
            }
        ],
        skills: [
            { category: 'Languages', items: ['TypeScript', 'Rust', 'Go', 'Python', 'SQL'] },
            { category: 'Frameworks', items: ['Next.js App Router', 'React 19', 'Node.js', 'Tailwind CSS'] },
            { category: 'Systems & Cloud', items: ['PostgreSQL', 'Apache Kafka', 'Docker', 'Kubernetes', 'AWS'] },
            { category: 'Typesetting', items: ['Typst 0.15', 'Vector AST', 'Typst Math'] }
        ],
        education: {
            degree: 'B.S. in Computer Science',
            school: 'Stanford University',
            period: '2014 – 2018',
            gpa: 'GPA 3.94 • Magna Cum Laude'
        },
        certifications: [
            'AWS Certified Solutions Architect — Professional (2023)',
            'Certified Kubernetes Administrator — CKA (2022)'
        ],
        typstSource: `#import "@preview/lumacv:2.0.0": *

#show: lumacv-theme.with(
  author: "Alex Chen",
  role: "Staff Full Stack Engineer",
  theme: "obsidian",
  font: "Plus Jakarta Sans",
)

= Work Experience
== Staff Full Stack Engineer — Vercel Inc. #h(1fr) 2022 -- Present
- Architected edge data delivery layer reducing p99 API latency by 38%.
- Engineered sub-45ms Typst vector compilation engine.`
    },
    {
        id: 'elena-rostova',
        filename: 'Elena_Rostova_AI_Research_Lead.typ',
        name: 'DR. ELENA ROSTOVA',
        headline: 'Principal AI Scientist • Anthropic Alignment',
        roleCount: '2 roles',
        atsScore: 97,
        vectorScore: 98,
        roles: [
            {
                title: 'Principal AI Research Scientist',
                company: 'Anthropic',
                period: '2023 – Present',
                bullets: [
                    'Led reinforcement learning from AI feedback (RLAIF) alignment workstreams, increasing reasoning benchmark fidelity by 24%.',
                    'Spearheaded constitutional AI safety protocols across multi-turn reasoning agents.'
                ]
            },
            {
                title: 'Senior Applied Scientist',
                company: 'Google DeepMind',
                period: '2020 – 2023',
                bullets: [
                    'Trained multimodal latent diffusion models serving 25M+ daily queries with KV-cache 4-bit quantization.',
                    'Published 4 first-author papers at NeurIPS and ICLR on efficient Transformer context scaling.'
                ]
            }
        ],
        skills: [
            { category: 'Core AI', items: ['PyTorch', 'JAX', 'CUDA C++', 'vLLM', 'Triton'] },
            { category: 'Architectures', items: ['Transformers', 'Diffusion Models', 'RLHF/RLAIF', 'MoE'] },
            { category: 'Compute', items: ['Distributed GPU Clusters', 'Slurm', 'DeepSpeed', 'NCCL'] }
        ],
        education: {
            degree: 'Ph.D. in Computer Science (Machine Learning)',
            school: 'Carnegie Mellon University',
            period: '2016 – 2020',
            gpa: 'Thesis: Scalable Alignment for Generative Models'
        },
        certifications: [
            'NeurIPS 2023 Outstanding Paper Award',
            'ICLR Best Reviewer Distinction (2022)'
        ],
        typstSource: `#import "@preview/lumacv:2.0.0": *

#show: lumacv-theme.with(
  author: "Dr. Elena Rostova",
  role: "Principal AI Scientist",
  theme: "cobalt",
)

= Research & Leadership
== Principal AI Scientist — Anthropic #h(1fr) 2023 -- Present
- Led RLAIF alignment workstreams (+24% reasoning accuracy).`
    },
    {
        id: 'marcus-vance',
        filename: 'Marcus_Vance_Design_Systems_Lead.typ',
        name: 'MARCUS VANCE',
        headline: 'Staff Product Designer • Figma Alignment',
        roleCount: '2 roles',
        atsScore: 92,
        vectorScore: 91,
        roles: [
            {
                title: 'Staff Product Designer',
                company: 'Figma',
                period: '2021 – Present',
                bullets: [
                    'Orchestrated multi-brand design token migration across 48 web surfaces, increasing design-to-production velocity by 65%.',
                    'Crafted next-generation variable typography and layout grid inspection engines in WebAssembly.'
                ]
            },
            {
                title: 'Senior UX Designer',
                company: 'Linear',
                period: '2019 – 2021',
                bullets: [
                    'Redesigned keyboard-first navigation architecture, cutting issue triaging times by 40% for 500k weekly developers.'
                ]
            }
        ],
        skills: [
            { category: 'Design', items: ['Design Systems', 'Design Tokens', 'Micro-Interactions', 'Spatial UI'] },
            { category: 'Engineering', items: ['React', 'CSS 3D Transforms', 'Figma Plugins API', 'SVG AST'] }
        ],
        education: {
            degree: 'B.Des in Human-Computer Interaction',
            school: 'Rhode Island School of Design (RISD)',
            period: '2015 – 2019',
            gpa: 'Honors in Digital Media Engineering'
        },
        certifications: [
            'Nielsen Norman Group UX Master Certified',
            'Apple Design Award Nominee (2021)'
        ],
        typstSource: `#import "@preview/lumacv:2.0.0": *

#show: lumacv-theme.with(
  author: "Marcus Vance",
  role: "Staff Product Designer",
  theme: "emerald",
)

= Experience
== Staff Product Designer — Figma #h(1fr) 2021 -- Present
- Orchestrated design token migration across 48 surfaces (+65% velocity).`
    }
];

// ============================================================================
// THEMES & FONTS CONFIG
// ============================================================================

interface ThemeConfig {
    id: string;
    label: string;
    primaryHex: string;
    accentBg: string;
    accentBorder: string;
    accentText: string;
    glowColor: string;
}

const THEMES: ThemeConfig[] = [
    { 
        id: 'obsidian', 
        label: 'Obsidian', 
        primaryHex: '#0284c7', 
        accentBg: 'bg-sky-500/10', 
        accentBorder: 'border-sky-500/30', 
        accentText: 'text-sky-400',
        glowColor: 'rgba(56,189,248,0.2)'
    },
    { 
        id: 'cobalt', 
        label: 'Cobalt', 
        primaryHex: '#2563eb', 
        accentBg: 'bg-blue-600/10', 
        accentBorder: 'border-blue-600/30', 
        accentText: 'text-blue-500',
        glowColor: 'rgba(37,99,235,0.2)'
    },
    { 
        id: 'emerald', 
        label: 'Emerald', 
        primaryHex: '#059669', 
        accentBg: 'bg-emerald-500/10', 
        accentBorder: 'border-emerald-500/30', 
        accentText: 'text-emerald-500',
        glowColor: 'rgba(16,185,129,0.2)'
    },
    { 
        id: 'burgundy', 
        label: 'Burgundy', 
        primaryHex: '#9f1239', 
        accentBg: 'bg-rose-600/10', 
        accentBorder: 'border-rose-600/30', 
        accentText: 'text-rose-500',
        glowColor: 'rgba(225,29,72,0.2)'
    },
    { 
        id: 'teal', 
        label: 'Teal', 
        primaryHex: '#0d9488', 
        accentBg: 'bg-teal-500/10', 
        accentBorder: 'border-teal-500/30', 
        accentText: 'text-teal-400',
        glowColor: 'rgba(20,184,166,0.2)'
    }
];

const FONTS = [
    { id: 'font-display', label: 'Plus Jakarta Sans', css: 'font-display' },
    { id: 'font-sans', label: 'Inter Sans', css: 'font-sans' },
    { id: 'font-mono', label: 'JetBrains Mono', css: 'font-mono' },
    { id: 'font-serif', label: 'Ivy Serif', css: 'font-serif' },
];

// ============================================================================
// MAIN INTERACTIVE COMPONENT
// ============================================================================

export function InteractiveHeroMockup() {
    // Active persona
    const [selectedPersonaId, setSelectedPersonaId] = useState<string>('alex-chen');
    const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

    // Active theme & font
    const [activeThemeId, setActiveThemeId] = useState<string>('obsidian');
    const [activeFontId, setActiveFontId] = useState<string>('font-display');

    // Navigation section
    const [activeSection, setActiveSection] = useState<'experience' | 'skills' | 'education' | 'certifications'>('experience');
    const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);

    // UI state toggles
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Compiling Typst state
    const [isCompiling, setIsCompiling] = useState(false);
    const [compileSpeed, setCompileSpeed] = useState<number>(34);
    const [copiedTypst, setCopiedTypst] = useState(false);

    // In-place editable values (keyed by persona)
    const [editedNames, setEditedNames] = useState<Record<string, string>>({});
    const [editedHeadlines, setEditedHeadlines] = useState<Record<string, string>>({});
    const [editedBullets, setEditedBullets] = useState<Record<string, Record<string, string>>>({});

    // 3D Tilt Card state
    const cardRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState<{ x: number; y: number; lightX: number; lightY: number }>({
        x: 0,
        y: 0,
        lightX: 50,
        lightY: 50
    });

    const currentPersona = useMemo(() => {
        return PERSONAS.find(p => p.id === selectedPersonaId) || PERSONAS[0];
    }, [selectedPersonaId]);

    const activeTheme = useMemo(() => {
        return THEMES.find(t => t.id === activeThemeId) || THEMES[0];
    }, [activeThemeId]);

    const activeFont = useMemo(() => {
        return FONTS.find(f => f.id === activeFontId) || FONTS[0];
    }, [activeFontId]);

    // Active editable text
    const candidateName = editedNames[currentPersona.id] !== undefined ? editedNames[currentPersona.id] : currentPersona.name;
    const candidateHeadline = editedHeadlines[currentPersona.id] !== undefined ? editedHeadlines[currentPersona.id] : currentPersona.headline;

    // Handle 3D perspective mouse movement
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || isZoomed) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Tilt limit between -3deg and +3deg
        const rotateY = ((x - centerX) / centerX) * 3.5;
        const rotateX = -((y - centerY) / centerY) * 3.5;

        setTilt({
            x: rotateX,
            y: rotateY,
            lightX: Math.round((x / rect.width) * 100),
            lightY: Math.round((y / rect.height) * 100)
        });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0, lightX: 50, lightY: 50 });
    };

    // Recompile Typst AST simulation
    const handleCompileTypst = () => {
        if (isCompiling) return;
        setIsCompiling(true);
        const randomMs = Math.floor(Math.random() * 18) + 26; // 26ms - 44ms
        setTimeout(() => {
            setCompileSpeed(randomMs);
            setIsCompiling(false);
            toast.success(`Typst 0.15.1 compiled in ${randomMs}ms! Zero raster artifacts.`, {
                icon: <Zap className="h-4 w-4 text-emerald-400" />
            });
        }, 320);
    };

    // Trigger ATS live scanner
    const handleScanATS = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setIsAtsModalOpen(true);
            toast.success(`ATS Audit complete: ${currentPersona.atsScore}/100 score for ${currentPersona.name}`, {
                icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />
            });
        }, 1200);
    };

    // Reset edits
    const handleReset = () => {
        setEditedNames(prev => {
            const copy = { ...prev };
            delete copy[currentPersona.id];
            return copy;
        });
        setEditedHeadlines(prev => {
            const copy = { ...prev };
            delete copy[currentPersona.id];
            return copy;
        });
        setEditedBullets(prev => {
            const copy = { ...prev };
            delete copy[currentPersona.id];
            return copy;
        });
        setActiveSection('experience');
        setSelectedRoleIndex(0);
        setIsSidebarCollapsed(false);
        setIsZoomed(false);
        toast.info(`Restored original demo values for ${currentPersona.name}`);
    };

    // Copy Typst code
    const handleCopyTypst = () => {
        navigator.clipboard.writeText(currentPersona.typstSource);
        setCopiedTypst(true);
        toast.success("Typst markup copied to clipboard!");
        setTimeout(() => setCopiedTypst(false), 2000);
    };

    return (
        <div className="w-full will-change-transform mb-12 md:mb-16">
            {/* 3D Spatial Frame with Dynamic Perspective */}
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={cn(
                    "relative mx-auto rounded-2xl border border-border/80 bg-card/75 backdrop-blur-2xl shadow-[0_24px_70px_-15px_rgba(0,0,0,0.8)] transition-all duration-300 group",
                    isZoomed ? "max-w-5xl scale-[1.02] shadow-[0_35px_100px_-10px_rgba(56,189,248,0.25)]" : "max-w-4xl hover:shadow-[0_30px_90px_-12px_rgba(56,189,248,0.2)]"
                )}
                style={{
                    perspective: '1200px',
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transition: isScanning || isCompiling ? 'transform 0.4s ease-out' : 'transform 0.15s ease-out, box-shadow 0.3s ease'
                }}
            >
                {/* Dynamic Cursor Light Glare Sheen */}
                <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-40 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(circle 500px at ${tilt.lightX}% ${tilt.lightY}%, ${activeTheme.glowColor}, transparent 70%)`
                    }}
                />

                {/* Laser Scanning Beam Animation Overlay */}
                {isScanning && (
                    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-2xl">
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981] animate-[scan_1.2s_ease-in-out_infinite]" />
                        <div className="absolute inset-0 bg-emerald-500/[0.04] backdrop-blur-[0.5px]" />
                    </div>
                )}

                {/* ========================================================================= */}
                {/* macOS WINDOW CHROME                                                       */}
                {/* ========================================================================= */}
                <div className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/50 text-xs select-none">
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-2">
                        {/* Red: Reset */}
                        <button
                            type="button"
                            onClick={handleReset}
                            title="Reset all edits to initial defaults"
                            className="group/btn relative flex h-3 w-3 items-center justify-center rounded-full bg-rose-500/90 border border-rose-600 transition-transform hover:scale-125 focus:outline-none"
                        >
                            <span className="opacity-0 group-hover/btn:opacity-100 text-[8px] font-bold text-rose-950 leading-none">✕</span>
                        </button>

                        {/* Yellow: Compact / Zen mode */}
                        <button
                            type="button"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            title={isSidebarCollapsed ? "Expand sidebar" : "Compact / Zen mode (collapse sidebar)"}
                            className="group/btn relative flex h-3 w-3 items-center justify-center rounded-full bg-amber-500/90 border border-amber-600 transition-transform hover:scale-125 focus:outline-none"
                        >
                            <span className="opacity-0 group-hover/btn:opacity-100 text-[8px] font-bold text-amber-950 leading-none">−</span>
                        </button>

                        {/* Green: Expand / Zoom */}
                        <button
                            type="button"
                            onClick={() => setIsZoomed(!isZoomed)}
                            title={isZoomed ? "Exit expanded preview" : "Expand preview size"}
                            className="group/btn relative flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/90 border border-emerald-600 transition-transform hover:scale-125 focus:outline-none"
                        >
                            <span className="opacity-0 group-hover/btn:opacity-100 text-[7px] font-bold text-emerald-950 leading-none">⤢</span>
                        </button>
                    </div>

                    {/* Interactive Persona / File Tab Switcher */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                            className="font-mono text-[11px] text-foreground hover:text-primary transition-colors flex items-center gap-2 bg-background/80 hover:bg-background px-3 py-1 rounded-md border border-border/60 shadow-xs focus:outline-none"
                        >
                            <LumaLogo size={14} />
                            <span className="font-semibold">{currentPersona.filename}</span>
                            <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", isPersonaMenuOpen && "rotate-180")} />
                        </button>

                        {/* Dropdown Menu */}
                        {isPersonaMenuOpen && (
                            <div 
                                className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-72 rounded-xl border border-border bg-popover/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 text-left animate-in fade-in zoom-in-95 duration-150"
                                onMouseLeave={() => setIsPersonaMenuOpen(false)}
                            >
                                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Switch Typst Document
                                </div>
                                {PERSONAS.map(persona => (
                                    <button
                                        key={persona.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedPersonaId(persona.id);
                                            setSelectedRoleIndex(0);
                                            setIsPersonaMenuOpen(false);
                                            toast.success(`Loaded ${persona.filename}`);
                                        }}
                                        className={cn(
                                            "w-full flex items-start gap-2 rounded-lg p-2 text-xs transition-colors text-left",
                                            selectedPersonaId === persona.id 
                                                ? "bg-primary/15 text-primary font-semibold" 
                                                : "hover:bg-muted/60 text-foreground"
                                        )}
                                    >
                                        <FileCode2 className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate font-mono text-[11px]">{persona.filename}</div>
                                            <div className="text-[10px] text-muted-foreground truncate">{persona.name} — {persona.headline}</div>
                                        </div>
                                        {selectedPersonaId === persona.id && (
                                            <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-1" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Interactive ATS Score Button */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleScanATS}
                            disabled={isScanning}
                            title="Click to run live ATS semantic scanner"
                            className="group/ats relative flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 transition-all hover:scale-105 shadow-xs focus:outline-none"
                        >
                            <ShieldCheck className={cn("h-3 w-3 text-emerald-400", isScanning && "animate-spin")} />
                            <span>ATS: {currentPersona.atsScore}/100</span>
                            <span className="hidden sm:inline-block text-[9px] text-emerald-400/80">Audit ⚡</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* MOCKUP INTERNAL CANVAS                                                    */}
                {/* ========================================================================= */}
                <div className="relative p-4 sm:p-6 grid grid-cols-12 gap-5 bg-background/40 text-left select-none">
                    
                    {/* --------------------------------------------------------------------- */}
                    {/* LEFT SIDEBAR: Interactive Sections, Themes, & Fonts                  */}
                    {/* --------------------------------------------------------------------- */}
                    {!isSidebarCollapsed && (
                        <div className="col-span-12 sm:col-span-3 space-y-4 sm:border-r border-border/40 sm:pr-4 text-[11px] transition-all">
                            {/* Section Nav */}
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                    <span>Sections</span>
                                    <span className="text-[9px] text-primary/80 font-mono">Interactive</span>
                                </div>

                                {/* Experience Tab */}
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('experience')}
                                    className={cn(
                                        "w-full p-2 rounded-lg font-medium flex items-center justify-between transition-all text-left",
                                        activeSection === 'experience'
                                            ? "bg-primary/15 text-primary border border-primary/30 shadow-xs"
                                            : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Briefcase className="h-3.5 w-3.5" />
                                        <span>Experience</span>
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background/60 border border-border/40 font-mono">
                                        {currentPersona.roleCount}
                                    </span>
                                </button>

                                {/* Skills Tab */}
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('skills')}
                                    className={cn(
                                        "w-full p-2 rounded-lg font-medium flex items-center justify-between transition-all text-left",
                                        activeSection === 'skills'
                                            ? "bg-primary/15 text-primary border border-primary/30 shadow-xs"
                                            : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Cpu className="h-3.5 w-3.5" />
                                        <span>Technical Skills</span>
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background/60 border border-border/40 font-mono">
                                        {currentPersona.skills.reduce((acc, s) => acc + s.items.length, 0)}
                                    </span>
                                </button>

                                {/* Education Tab */}
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('education')}
                                    className={cn(
                                        "w-full p-2 rounded-lg font-medium flex items-center justify-between transition-all text-left",
                                        activeSection === 'education'
                                            ? "bg-primary/15 text-primary border border-primary/30 shadow-xs"
                                            : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <GraduationCap className="h-3.5 w-3.5" />
                                        <span>Education</span>
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background/60 border border-border/40 font-mono">
                                        GPA 3.9+
                                    </span>
                                </button>

                                {/* Certifications Tab */}
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('certifications')}
                                    className={cn(
                                        "w-full p-2 rounded-lg font-medium flex items-center justify-between transition-all text-left",
                                        activeSection === 'certifications'
                                            ? "bg-primary/15 text-primary border border-primary/30 shadow-xs"
                                            : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Award className="h-3.5 w-3.5" />
                                        <span>Certifications</span>
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background/60 border border-border/40 font-mono">
                                        {currentPersona.certifications.length}
                                    </span>
                                </button>
                            </div>

                            {/* Theme Swatches */}
                            <div className="pt-3 border-t border-border/40 space-y-2">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span>Theme: <strong className="text-foreground">{activeTheme.label}</strong></span>
                                    <span className="text-[9px] text-primary">Live</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {THEMES.map(theme => (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveThemeId(theme.id);
                                                toast.success(`Theme switched to ${theme.label}`);
                                            }}
                                            title={`Switch theme to ${theme.label}`}
                                            className={cn(
                                                "h-5 w-5 rounded-full border-2 transition-all hover:scale-125 focus:outline-none",
                                                activeThemeId === theme.id ? "scale-115 border-foreground shadow-sm" : "border-border/60 opacity-70 hover:opacity-100"
                                            )}
                                            style={{ backgroundColor: theme.primaryHex }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Font Picker */}
                            <div className="pt-2 border-t border-border/40 space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span>Font: <strong className="text-foreground">{activeFont.label}</strong></span>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    {FONTS.map(font => (
                                        <button
                                            key={font.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveFontId(font.id);
                                                toast.info(`Typesetting with ${font.label}`);
                                            }}
                                            className={cn(
                                                "px-2 py-1 rounded text-[10px] font-medium border text-center transition-all truncate",
                                                activeFontId === font.id
                                                    ? "bg-primary/20 text-primary border-primary/40 font-bold"
                                                    : "bg-muted/30 hover:bg-muted/60 text-muted-foreground border-border/30"
                                            )}
                                        >
                                            {font.label.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Typst Compiler Quick Action */}
                            <div className="pt-3 border-t border-border/40">
                                <button
                                    type="button"
                                    onClick={handleCompileTypst}
                                    disabled={isCompiling}
                                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 p-2 text-[10.5px] font-semibold text-primary transition-all hover:scale-[1.02] shadow-xs"
                                >
                                    <Zap className={cn("h-3 w-3 text-primary", isCompiling && "animate-spin")} />
                                    <span>{isCompiling ? "Compiling Typst..." : "Recompile AST"}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --------------------------------------------------------------------- */}
                    {/* CENTER RESUME DOCUMENT CANVAS                                          */}
                    {/* --------------------------------------------------------------------- */}
                    <div className={cn(
                        "transition-all duration-300 bg-card rounded-xl border border-border/70 p-5 shadow-xs space-y-4 text-xs",
                        isSidebarCollapsed ? "col-span-12" : "col-span-12 sm:col-span-9",
                        activeFont.css
                    )}>
                        {/* Header: Candidate Identity (Directly In-Place Editable!) */}
                        <div className="flex items-start justify-between border-b border-border/50 pb-3 gap-3">
                            <div className="flex-1 space-y-1">
                                {/* Click to edit Name */}
                                <div className="group/name relative inline-block">
                                    <input
                                        type="text"
                                        value={candidateName}
                                        onChange={(e) => {
                                            setEditedNames(prev => ({ ...prev, [currentPersona.id]: e.target.value }));
                                        }}
                                        aria-label="Candidate Name"
                                        className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-foreground bg-transparent border-b border-dashed border-transparent hover:border-border/80 focus:border-primary focus:outline-none w-full max-w-sm transition-colors cursor-text"
                                    />
                                    <span className="opacity-0 group-hover/name:opacity-70 text-[9px] text-muted-foreground ml-1.5 transition-opacity">
                                        ✎ edit
                                    </span>
                                </div>

                                {/* Click to edit Headline */}
                                <div>
                                    <input
                                        type="text"
                                        value={candidateHeadline}
                                        onChange={(e) => {
                                            setEditedHeadlines(prev => ({ ...prev, [currentPersona.id]: e.target.value }));
                                        }}
                                        aria-label="Candidate Headline"
                                        className={cn(
                                            "text-[11px] font-mono font-medium bg-transparent border-b border-dashed border-transparent hover:border-border/80 focus:border-primary focus:outline-none w-full max-w-md transition-colors cursor-text",
                                            activeTheme.accentText
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Sub-50ms Typst Vector Interactive Pill */}
                            <button
                                type="button"
                                onClick={handleCompileTypst}
                                disabled={isCompiling}
                                title="Click to simulate instant Typst vector compilation"
                                className="shrink-0 flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 hover:bg-muted/80 px-2.5 py-1 text-[10px] text-muted-foreground hover:text-primary font-mono transition-all hover:scale-105 shadow-xs"
                            >
                                <Zap className={cn("h-3 w-3", isCompiling ? "text-amber-400 animate-spin" : "text-emerald-400")} />
                                <span>{isCompiling ? "Compiling..." : `Sub-${compileSpeed}ms Typst Vector`}</span>
                            </button>
                        </div>

                        {/* ----------------------------------------------------------------- */}
                        {/* VIEW 1: WORK EXPERIENCE                                           */}
                        {/* ----------------------------------------------------------------- */}
                        {activeSection === 'experience' && (
                            <div className="space-y-3.5 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <div className={cn("text-[10px] font-bold tracking-wider uppercase", activeTheme.accentText)}>
                                        WORK EXPERIENCE
                                    </div>

                                    {/* Role Switcher Pills */}
                                    <div className="flex items-center gap-1">
                                        {currentPersona.roles.map((role, idx) => (
                                            <button
                                                key={role.company}
                                                type="button"
                                                onClick={() => setSelectedRoleIndex(idx)}
                                                className={cn(
                                                    "px-2 py-0.5 rounded text-[9.5px] font-mono transition-all",
                                                    selectedRoleIndex === idx
                                                        ? cn("bg-primary/20 text-primary border border-primary/40 font-bold", activeTheme.accentText)
                                                        : "bg-muted/30 text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {role.company}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {currentPersona.roles[selectedRoleIndex] && (
                                    <div className="space-y-2 rounded-lg border border-border/40 bg-background/50 p-3.5 shadow-xs">
                                        <div className="flex flex-wrap items-center justify-between gap-1">
                                            <div className="font-semibold text-foreground text-xs">
                                                {currentPersona.roles[selectedRoleIndex].title} — <span className="text-primary">{currentPersona.roles[selectedRoleIndex].company}</span>
                                            </div>
                                            <span className="text-muted-foreground font-mono text-[10px]">
                                                {currentPersona.roles[selectedRoleIndex].period}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 pt-1">
                                            {currentPersona.roles[selectedRoleIndex].bullets.map((bullet, bIdx) => {
                                                const bulletText = editedBullets[currentPersona.id]?.[bIdx] ?? bullet;
                                                return (
                                                    <div key={bIdx} className="flex items-start gap-2 text-muted-foreground text-[10.5px] leading-relaxed group/bullet">
                                                        <span className="text-primary mt-0.5">•</span>
                                                        <span className="flex-1 select-text">
                                                            {bulletText}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ----------------------------------------------------------------- */}
                        {/* VIEW 2: TECHNICAL SKILLS                                          */}
                        {/* ----------------------------------------------------------------- */}
                        {activeSection === 'skills' && (
                            <div className="space-y-3 animate-in fade-in duration-200">
                                <div className={cn("text-[10px] font-bold tracking-wider uppercase", activeTheme.accentText)}>
                                    TECHNICAL COMPETENCIES & MATRIX
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {currentPersona.skills.map(group => (
                                        <div key={group.category} className="rounded-lg border border-border/40 bg-background/40 p-3 space-y-1.5">
                                            <div className="text-[10px] font-semibold text-foreground font-mono">{group.category}</div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {group.items.map(skill => (
                                                    <span
                                                        key={skill}
                                                        className="px-2 py-0.5 rounded-md bg-muted/60 hover:bg-primary/20 text-muted-foreground hover:text-primary text-[10px] font-mono border border-border/40 transition-colors cursor-pointer"
                                                        onClick={() => toast.info(`Keyword verified: "${skill}" matched in Typst index`)}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ----------------------------------------------------------------- */}
                        {/* VIEW 3: EDUCATION                                                 */}
                        {/* ----------------------------------------------------------------- */}
                        {activeSection === 'education' && (
                            <div className="space-y-3 animate-in fade-in duration-200">
                                <div className={cn("text-[10px] font-bold tracking-wider uppercase", activeTheme.accentText)}>
                                    EDUCATION & ACADEMIC CREDENTIALS
                                </div>

                                <div className="rounded-lg border border-border/40 bg-background/50 p-3.5 space-y-1.5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-foreground text-xs">{currentPersona.education.degree}</div>
                                            <div className="text-primary text-[11px] font-medium">{currentPersona.education.school}</div>
                                        </div>
                                        <div className="text-right text-[10px] font-mono text-muted-foreground">
                                            <div>{currentPersona.education.period}</div>
                                        </div>
                                    </div>
                                    <div className="text-[10.5px] text-muted-foreground font-mono pt-1">
                                        ✓ {currentPersona.education.gpa}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ----------------------------------------------------------------- */}
                        {/* VIEW 4: CERTIFICATIONS                                            */}
                        {/* ----------------------------------------------------------------- */}
                        {activeSection === 'certifications' && (
                            <div className="space-y-3 animate-in fade-in duration-200">
                                <div className={cn("text-[10px] font-bold tracking-wider uppercase", activeTheme.accentText)}>
                                    HONORS & PROFESSIONAL LICENSES
                                </div>

                                <div className="space-y-2">
                                    {currentPersona.certifications.map((cert, idx) => (
                                        <div key={idx} className="rounded-lg border border-border/40 bg-background/50 p-3 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <Award className="h-4 w-4 text-emerald-400 shrink-0" />
                                                <span className="font-medium text-foreground text-[11px]">{cert}</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                Verified
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer Status Bar with Real Action Triggers */}
                        <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-[10px] text-muted-foreground font-mono">
                            <button
                                type="button"
                                onClick={() => toast.success("Zero Hallucinations Guarantee: 100% verified against real work telemetry.")}
                                className="text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1 transition-colors"
                            >
                                <Check className="h-3 w-3" />
                                <span>100% Fact Verified</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <span>4-Vector Match Score: <strong className="text-foreground">{currentPersona.vectorScore}%</strong></span>
                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${currentPersona.vectorScore}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="pt-2 flex flex-wrap items-center justify-end gap-2 text-xs">
                            <button
                                type="button"
                                onClick={handleCopyTypst}
                                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted/80 px-3 py-1.5 text-[10.5px] font-medium text-foreground transition-all hover:scale-105 shadow-xs"
                            >
                                {copiedTypst ? (
                                    <>
                                        <Check className="h-3 w-3 text-emerald-400" />
                                        <span>Copied .typ AST!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3 text-muted-foreground" />
                                        <span>Copy Typst AST</span>
                                    </>
                                )}
                            </button>

                            <Link
                                href="/demo"
                                className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/15 hover:bg-primary/25 px-3 py-1.5 text-[10.5px] font-semibold text-primary transition-all hover:scale-105 shadow-xs"
                            >
                                <span>Open in Live Studio</span>
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ATS Breakdown Interactive Modal */}
            {isAtsModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
                    onClick={() => setIsAtsModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                <h3 className="font-bold text-foreground text-sm">ATS Deep Vector Audit</h3>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                {currentPersona.atsScore}/100 Score
                            </span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Full semantic parse against target enterprise filter criteria for <strong>{currentPersona.headline}</strong>.
                        </p>

                        <div className="space-y-2.5 text-xs">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">Factual Integrity & Verification</span>
                                    <span className="font-mono text-emerald-400 font-bold">100%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">Quantified Action Verb Density</span>
                                    <span className="font-mono text-emerald-400 font-bold">96%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '96%' }} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">Typst Vector Parser Compatibility</span>
                                    <span className="font-mono text-emerald-400 font-bold">100%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">Target Role Keyword Alignment</span>
                                    <span className="font-mono text-emerald-400 font-bold">94%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '94%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsAtsModalOpen(false)}
                                className="px-4 py-2 rounded-lg bg-muted text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
                            >
                                Close Audit
                            </button>

                            <Link
                                href="/demo"
                                onClick={() => setIsAtsModalOpen(false)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                            >
                                <span>Try Custom Resume</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
