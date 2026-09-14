"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { EditorialFooter } from '@/components/landing/editorial-footer';
import {
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
    Copy,
    Check,
    HelpCircle,
    CheckCircle2,
    Code2,
    Package,
    Settings,
    FileCheck2,
    ArrowUpRight,
    Globe,
    SlidersHorizontal,
    ArrowLeft,
    ArrowRight,
    Flame,
    Braces,
    Database,
    ShieldCheck,
    CheckCheck,
    History,
    Calendar,
    Milestone,
    Tag
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ==========================================
// DATA TYPES & CONFIGURATION
// ==========================================

export interface DocSection {
    id: string;
    title: string;
    category: string;
    domain: 'guides' | 'architecture' | 'engine' | 'ai' | 'api' | 'ops' | 'changelog';
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const DOC_SECTIONS: DocSection[] = [
    {
        id: 'overview',
        title: 'Product Overview & Philosophy',
        category: 'Getting Started',
        domain: 'guides',
        icon: Sparkles,
        description: 'Philosophy, deterministic ATS score engine, and zero-storage career privacy guarantees.'
    },
    {
        id: 'quickstart',
        title: 'Quickstart Walkthrough',
        category: 'Getting Started',
        domain: 'guides',
        icon: Terminal,
        description: 'End-to-end workflow from PDF upload to sub-50ms vector PDF download.'
    },
    {
        id: 'architecture',
        title: 'System Execution Pipeline',
        category: 'Architecture & Engine',
        domain: 'architecture',
        icon: GitBranch,
        description: 'Interactive execution flow across in-browser extraction, schema parsing, and compilation.'
    },
    {
        id: 'workflow',
        title: '4-Step Studio Workflow',
        category: 'Architecture & Engine',
        domain: 'architecture',
        icon: Layers,
        description: 'Deep dive into Upload, Details Review, AI Tailoring, and Typst Studio export.'
    },
    {
        id: 'auth-workspaces',
        title: 'Authentication & Session Model',
        category: 'Architecture & Engine',
        domain: 'architecture',
        icon: Lock,
        description: 'Row Level Security (RLS) and encrypted session workspace isolation.'
    },
    {
        id: 'typst-engine',
        title: 'Typst Vector Engine vs Chromium',
        category: 'Typst & Templates',
        domain: 'engine',
        icon: Cpu,
        description: 'Why Rust-based Typst delivers sub-50ms vector PDFs with zero rasterization.'
    },
    {
        id: 'templates',
        title: 'Template Architecture (52 Systems)',
        category: 'Typst & Templates',
        domain: 'engine',
        icon: FileText,
        description: 'Catalog of 52 architectural Typst templates across 5 professional archetypes.'
    },
    {
        id: 'byok',
        title: 'AI Pipeline & Client-Side BYOK',
        category: 'AI & Privacy',
        domain: 'ai',
        icon: KeyRound,
        description: 'Connect personal Google Gemini, OpenAI, Claude, or Groq API keys directly.'
    },
    {
        id: 'ats-scoring',
        title: 'Deterministic ATS Scoring Formula',
        category: 'AI & Privacy',
        domain: 'ai',
        icon: CheckCircle2,
        description: 'The 4-vector mathematical weighting algorithm and keyword matching mechanics.'
    },
    {
        id: 'factuality',
        title: 'Fact-Checking & Diff Studio',
        category: 'AI & Privacy',
        domain: 'ai',
        icon: Shield,
        description: 'Immutable ground truth verification preventing AI hallucinations of roles or dates.'
    },
    {
        id: 'security-privacy',
        title: 'Data Handling & Privacy Standards',
        category: 'AI & Privacy',
        domain: 'ai',
        icon: ShieldCheck,
        description: 'Zero model training, client header transmission, and encrypted local storage.'
    },
    {
        id: 'api-reference',
        title: 'REST API Reference & Schemas',
        category: 'API Reference',
        domain: 'api',
        icon: Braces,
        description: 'Complete endpoint specs for parsing, tailoring, scoring, and Typst compilation.'
    },
    {
        id: 'stack-dependencies',
        title: 'Tech Stack & Dependency Audit',
        category: 'Engineering & Ops',
        domain: 'ops',
        icon: Package,
        description: 'Next.js 14, Typst CLI 0.11, Zustand, pdfjs-dist, and Tailwind architecture.'
    },
    {
        id: 'configuration',
        title: 'Environment Variables & Config',
        category: 'Engineering & Ops',
        domain: 'ops',
        icon: Settings,
        description: 'Full environment variable reference for local development and self-hosted instances.'
    },
    {
        id: 'self-hosting',
        title: 'Docker & Self-Hosting Guide',
        category: 'Engineering & Ops',
        domain: 'ops',
        icon: Server,
        description: 'Deploy LumaCV fully isolated in containers with native Typst compilation.'
    },
    {
        id: 'shortcuts',
        title: 'Keyboard Shortcuts Reference',
        category: 'Engineering & Ops',
        domain: 'ops',
        icon: SlidersHorizontal,
        description: 'Power user keyboard navigation shortcuts in Studio and Documentation.'
    },
    {
        id: 'deployment',
        title: 'Production Deployment on Vercel',
        category: 'Engineering & Ops',
        domain: 'ops',
        icon: Globe,
        description: 'Serverless runtime configurations, timeout buffering, and Edge optimizations.'
    },
    {
        id: 'troubleshooting',
        title: 'Troubleshooting & FAQ',
        category: 'Support & Community',
        domain: 'ops',
        icon: HelpCircle,
        description: 'Common issues, font troubleshooting, rate limits, and PDF parsing edge-cases.'
    },
    {
        id: 'license',
        title: 'License & Open-Source Terms',
        category: 'Support & Community',
        domain: 'ops',
        icon: FileCheck2,
        description: 'Permissive MIT Open-Source license details and community contribution guidelines.'
    },
    {
        id: 'changelog',
        title: 'Changelog & Release Notes',
        category: 'Updates & Releases',
        domain: 'changelog',
        icon: History,
        description: 'Chronological release notes, architectural milestones, and performance benchmarks.'
    },
];

const OVERVIEW_FEATURE_CARDS = [
    {
        title: 'Zero Hallucinations',
        keywords: ['Immutable guardrails', 'Ground-truth diffing', 'No invented dates'],
        cardSummary: 'Immutable factual guardrails guarantee candidate employers, job titles, dates, and universities are never fabricated by AI models.',
        detail: 'Every AI rewrite is diffed against your original resume before it ever reaches you. Employers, job titles, dates, and universities are treated as immutable ground truth, the model can rephrase and reorganize, but it cannot invent.'
    },
    {
        title: 'Sub-50ms Typst Engine',
        keywords: ['Rust WASM', 'Native vector PDF', 'No Chromium'],
        cardSummary: 'Replaces bloated, pixelated Puppeteer/Chromium engines with native Rust Typst compilation for crisp, single-page vector PDFs.',
        detail: 'Most resume builders render through a headless Chromium instance, slow, memory-heavy, and prone to layout drift. LumaCV compiles directly through Typst’s Rust engine instead, producing crisp single-page vector PDFs in 15–45ms.'
    },
    {
        title: 'Client-Side BYOK',
        keywords: ['Bring your own key', 'TLS-only transit', 'Zero server storage'],
        cardSummary: 'Bring your own Google Gemini, OpenAI, Claude, or Groq API keys. Headers transmit encrypted over TLS with zero server database storage.',
        detail: 'Your API key never touches a database. It travels once, encrypted over TLS as a request header, is used for that single call, and is discarded, Gemini, OpenAI, Claude, and Groq are all supported.'
    },
    {
        title: '4-Vector ATS Scoring',
        keywords: ['Required Skills 40%', 'Responsibilities 25%', 'Deterministic, not vibes'],
        cardSummary: 'Deterministic alignment across Required Skills (40%), Responsibilities (25%), Preferred Skills (20%), and Terminology (15%).',
        detail: 'No black-box "AI vibe score." The match against a job description is computed from four weighted, inspectable vectors, Required Skills, Responsibilities, Preferred Skills, and Terminology, so you can see exactly why a number moved.'
    },
];

const BYOK_PROVIDERS = [
    {
        id: 'gemini',
        name: 'Google Gemini',
        tag: 'Fastest / Recommended',
        models: [
            { id: 'gemini-2.5-flash', latency: '350ms', tokenLimit: '1M tokens', cost: 'Free tier / Ultra low', recommended: true },
            { id: 'gemini-2.5-pro', latency: '1,100ms', tokenLimit: '2M tokens', cost: '$1.25 / 1M tokens' },
            { id: 'gemini-2.5-flash-lite', latency: '220ms', tokenLimit: '1M tokens', cost: 'Minimal latency' }
        ],
        headerKey: 'x-gemini-api-key',
        envKey: 'GEMINI_API_KEY',
        portalUrl: 'https://aistudio.google.com/app/apikey',
        notes: 'Native support for JSON structured outputs. Recommended for high reliability and zero rate limiting.'
    },
    {
        id: 'openai',
        name: 'OpenAI',
        tag: 'Industry Benchmark',
        models: [
            { id: 'gpt-4o', latency: '850ms', tokenLimit: '128K tokens', cost: '$2.50 / 1M tokens', recommended: true },
            { id: 'gpt-4o-mini', latency: '400ms', tokenLimit: '128K tokens', cost: '$0.15 / 1M tokens' },
            { id: 'o3-mini', latency: '1,900ms', tokenLimit: '200K tokens', cost: 'Reasoning model' }
        ],
        headerKey: 'x-openai-api-key',
        envKey: 'OPENAI_API_KEY',
        portalUrl: 'https://platform.openai.com/api-keys',
        notes: 'High compliance with strict schema constraints and deterministic markdown formatting.'
    },
    {
        id: 'claude',
        name: 'Anthropic Claude',
        tag: 'Nuanced Editorial Tone',
        models: [
            { id: 'claude-3-5-sonnet-20241022', latency: '1,050ms', tokenLimit: '200K tokens', cost: '$3.00 / 1M tokens', recommended: true },
            { id: 'claude-3-5-haiku-20241022', latency: '320ms', tokenLimit: '200K tokens', cost: '$0.80 / 1M tokens' }
        ],
        headerKey: 'x-anthropic-api-key',
        envKey: 'ANTHROPIC_API_KEY',
        portalUrl: 'https://console.anthropic.com/settings/keys',
        notes: 'Unmatched vocabulary and concise impact phrasing for senior, executive, and research resumes.'
    },
    {
        id: 'groq',
        name: 'Groq Cloud',
        tag: 'Near-Instant LPU Inference',
        models: [
            { id: 'qwen/qwen3.6-27b', latency: '160ms', tokenLimit: '128K tokens', cost: 'High speed open weights', recommended: true },
            { id: 'llama-3.3-70b-versatile', latency: '290ms', tokenLimit: '128K tokens', cost: 'Ultra low latency' }
        ],
        headerKey: 'x-groq-api-key',
        envKey: 'GROQ_API_KEY',
        portalUrl: 'https://console.groq.com/keys',
        notes: 'Optimal for near-instant live interactive tailoring directly in browser sessions.'
    }
];

const API_ENDPOINTS = [
    {
        method: 'POST',
        path: '/api/v1/resume/parse',
        title: 'Extract Resume Schema from PDF / Text',
        description: 'Accepts raw text or extracted PDF tokens and structures them into the verified LumaCV resume JSON schema.',
        headers: [
            { name: 'Content-Type', required: true, value: 'application/json' },
            { name: 'x-gemini-api-key', required: false, value: 'Personal Google API Key (optional BYOK)' },
            { name: 'x-openai-api-key', required: false, value: 'Personal OpenAI API Key (optional BYOK)' }
        ],
        bodyParams: [
            { name: 'extractedText', type: 'string', required: true, description: 'Raw plaintext extracted client-side from the candidate PDF (min. 10 characters).' }
        ],
        responseExample: `{
  "personalInfo": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "title": "Principal Distributed Systems Architect"
  },
  "experience": [
    {
      "company": "Tech Corp",
      "title": "Staff Engineer",
      "dates": "2021, Present",
      "bullets": [
        "Architected real-time streaming pipeline reducing event latency by 72%."
      ]
    }
  ]
}`
    },
    {
        method: 'POST',
        path: '/api/v1/resume/tailor',
        title: 'Tailor Bullets Against Target Job Description',
        description: 'Aligns candidate experience bullets with target JD requirements while enforcing immutable factual guardrails.',
        headers: [
            { name: 'Content-Type', required: true, value: 'application/json' },
            { name: 'x-gemini-api-key', required: false, value: 'Optional client key' },
            { name: 'x-openai-api-key', required: false, value: 'Optional client key' }
        ],
        bodyParams: [
            { name: 'resumeData', type: 'ResumeSchema', required: true, description: 'Candidate resume JSON payload.' },
            { name: 'jd', type: 'string', required: false, description: 'Raw target job description text (extracts its own jdKeywords in the same call).' },
            { name: 'jdKeywords', type: 'AnalyzeJDResponse', required: false, description: 'Pre-extracted JD keywords, if you already have them from /analyze-jd.' },
            { name: 'template', type: 'string', required: false, description: 'Registered template ID (default: "modern").' },
            { name: 'tailorMode', type: '"optimize" | "tailor"', required: false, description: 'Tailoring intensity mode (default: "optimize").' }
        ],
        responseExample: `{
  "tailoredResume": { ... },
  "typstCode": "#import \\"template.typ\\"...",
  "confidenceScore": 0.94,
  "atsAlignmentSummary": {
    "overallScore": 94,
    "matchedRequirements": ["Distributed Systems", "Kubernetes", "Rust", "Kafka"],
    "unsupportedRequirements": ["eBPF"]
  }
}`
    },
    {
        method: 'POST',
        path: '/api/v1/resume/score',
        title: 'Deterministic 4-Vector ATS Scoring',
        description: 'Computes mathematical alignment across Required Skills (40%), Responsibilities (25%), Preferred Skills (20%), and Terminology (15%).',
        headers: [
            { name: 'Content-Type', required: true, value: 'application/json' }
        ],
        bodyParams: [
            { name: 'resumeData', type: 'ResumeSchema', required: false, description: 'Structured resume object. Provide this or resumeText.' },
            { name: 'resumeText', type: 'string', required: false, description: 'Plaintext resume content, used when resumeData is omitted.' },
            { name: 'jdKeywords', type: 'AnalyzeJDResponse', required: true, description: 'Extracted required_skills, preferred_skills, responsibilities, and buzzwords.' }
        ],
        responseExample: `{
  "score": 0.92,
  "isCalculated": true,
  "breakdown": {
    "required_skills": { "matched": [...], "missing": [...], "ratio": 95, "weightPercent": 40 },
    "responsibilities": { "matched": [...], "missing": [...], "ratio": 90, "weightPercent": 25 },
    "preferred_skills": { "matched": [...], "missing": [...], "ratio": 88, "weightPercent": 20 },
    "buzzwords": { "matched": [...], "missing": [...], "ratio": 94, "weightPercent": 15 }
  }
}`
    },
    {
        method: 'POST',
        path: '/api/v1/resume/compile',
        title: 'Compile Resume to Vector PDF',
        description: 'Invokes the native Typst engine to produce a crisp vector PDF in 15ms–45ms with zero rasterization. Returns the file directly as a binary application/pdf stream, not a JSON envelope.',
        headers: [
            { name: 'Content-Type', required: true, value: 'application/json' }
        ],
        bodyParams: [
            { name: 'resumeData', type: 'ResumeSchema', required: true, description: 'Complete resume JSON data.' },
            { name: 'template', type: 'string', required: true, description: 'Registered template ID (e.g. "modern", "executive", "compact").' },
            { name: 'theme', type: 'string', required: false, description: 'Accent color palette identifier (default: "none").' },
            { name: 'typstCode', type: 'string', required: false, description: 'Pre-generated Typst source; skips server-side regeneration when provided.' }
        ],
        responseExample: `HTTP/1.1 200 OK
Content-Type: application/pdf
X-Compile-Provider: typst
X-Compile-Hash: 3f2a9c...

<binary PDF bytes>`
    }
];

interface ReleaseLog {
    version: string;
    date: string;
    title: string;
    summary: string;
    highlights: {
        category: 'Features' | 'Performance & Engine' | 'Security & Privacy' | 'Fixes & Hardening';
        items: string[];
    }[];
}

const CHANGELOG_RELEASES: ReleaseLog[] = [
    {
        version: 'v2.5.0',
        date: 'March 12, 2026',
        title: 'Modern Documentation Hub, ⌘K Command Palette & REST API Explorer',
        summary: 'Major release introducing a 3-column documentation architecture, instant Spotlight search, interactive API documentation, and hardened data normalization against stringified object payloads.',
        highlights: [
            {
                category: 'Features',
                items: [
                    'Redesigned documentation UI with 3-column layout, sticky category navigation, and right-hand ScrollSpy "On this page" TOC.',
                    'Added universal Spotlight Command Palette (⌘K / /) with fast fuzzy search across all topics, models, and API endpoints.',
                    'Shipped interactive REST API Explorer for /api/v1/resume/parse, /tailor, /score, and /compile with cURL, TypeScript, and Python snippets.',
                    'Added interactive BYOK model selector with real-time latency benchmarks for Gemini 2.5, GPT-4o, Claude 3.5, and Groq LPUs.'
                ]
            },
            {
                category: 'Fixes & Hardening',
                items: [
                    'Eliminated "[object Object]" keyword leakage in normalize-jd.ts, ATS score calculation, and tailoring summaries.',
                    'Implemented defensive store rehydration guards in lib/store.ts to auto-purge corrupted persisted scores.'
                ]
            }
        ]
    },
    {
        version: 'v2.4.0',
        date: 'February 18, 2026',
        title: 'Deterministic 4-Vector ATS Scoring Engine & Bullet Diff Studio',
        summary: 'Introduced mathematical ATS alignment scoring and side-by-side bullet diffing to give candidates granular control over AI modifications.',
        highlights: [
            {
                category: 'Features',
                items: [
                    'Deterministic 4-vector scoring: Required Skills (40%), Responsibilities (25%), Preferred Skills (20%), and Terminology (15%).',
                    'Side-by-side Bullet Diff Studio in Step 4 allowing 1-click single-line reversion of any tailored bullet.',
                    'Real-time ATS alignment gauge with categorized keyword gap feedback (Missing, Partial, Matched).'
                ]
            },
            {
                category: 'Security & Privacy',
                items: [
                    'Ground-truth validation guardrails ensuring AI models cannot hallucinate employer names, job titles, or dates of employment.'
                ]
            }
        ]
    },
    {
        version: 'v2.3.0',
        date: 'January 20, 2026',
        title: 'Multi-Provider Client-Side BYOK (Bring Your Own Key)',
        summary: 'Enabled candidates to bring their personal API keys with zero server-side storage and instant multi-model switching.',
        highlights: [
            {
                category: 'Security & Privacy',
                items: [
                    'Multi-provider support: Google Gemini 2.5 (Flash / Pro), OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, and Groq LPUs.',
                    'Client-side BYOK security: Keys are stored exclusively in browser localStorage (luma_byok_keys) and sent via TLS headers.',
                    'Zero database persistence or retention of candidate API credentials.'
                ]
            },
            {
                category: 'Performance & Engine',
                items: [
                    'Optimized token streaming and payload compression for long-context job descriptions.'
                ]
            }
        ]
    },
    {
        version: 'v2.2.0',
        date: 'December 10, 2025',
        title: 'Typst Rust WASM Engine Migration & 52 Architectural Templates',
        summary: 'Replaced headless Chromium (Puppeteer) with the Rust-based Typst engine, slashing compile times from 3,500ms down to sub-50ms.',
        highlights: [
            {
                category: 'Performance & Engine',
                items: [
                    'Typst compilation latency reduced to 15ms–45ms with 100% vector fidelity and mathematical page-break fitting.',
                    'Eliminated 450MB Puppeteer/Chromium dependency overhead in serverless runtimes.',
                    'Shipped 52 architectural Typst templates across 5 professional archetypes (ATS, Modern, Executive, Creative, Academic).'
                ]
            },
            {
                category: 'Features',
                items: [
                    'Interactive Color Palette selector with 8 curated color schemes matching typographic hierarchies.',
                    'Direct export of raw .typ source files for local command-line compilation.'
                ]
            }
        ]
    },
    {
        version: 'v2.1.0',
        date: 'November 15, 2025',
        title: 'In-Browser PDF Parsing & Zod Schema Recovery',
        summary: 'Client-side PDF text extraction in Web Workers with resilient JSON recovery for complex resumes.',
        highlights: [
            {
                category: 'Features',
                items: [
                    'Client-side PDF extraction powered by Mozilla pdfjs-dist Web Worker, preserving privacy before parsing.',
                    'Integrated jsonrepair for robust JSON syntax recovery on malformed LLM responses.',
                    'Complete Zod schema validation across all resume data layers.'
                ]
            }
        ]
    },
    {
        version: 'v2.0.0',
        date: 'October 01, 2025',
        title: 'Open Source Release & PostgreSQL Workspace Isolation',
        summary: 'Initial open-source release with Supabase Row Level Security (RLS) and dark/light design system tokens.',
        highlights: [
            {
                category: 'Security & Privacy',
                items: [
                    'PostgreSQL Row Level Security (RLS) enforcing strict user workspace isolation.',
                    'Cookie-based SSR session management with @supabase/ssr and Edge middleware.',
                    'Released under permissive MIT License for community contribution and self-hosting.'
                ]
            }
        ]
    }
];

// ==========================================
// OVERVIEW SECTION, plain chapter content. The page-level chapter stack
// (rendered once, on the right, spanning every chapter) is what stacks and
// syncs now; each chapter's own left-hand content is just its full writeup.
// ==========================================

function OverviewStackSection() {
    return (
        <section id="overview" className="scroll-mt-36 border-b border-border/40 pb-14 space-y-6">
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground">
                Product Overview & Philosophy
            </h1>
            <p className="max-w-prose text-sm text-foreground/90 font-medium leading-relaxed">
                LumaCV is a high-performance, open-source resume engineering platform. It pairs the Typst Rust WASM vector typesetting engine with a deterministic ATS scoring model, multi-provider AI tailoring, and client-side zero-storage privacy guarantees.
            </p>
            <div className="space-y-5">
                {OVERVIEW_FEATURE_CARDS.map((c) => (
                    <div key={c.title} className="space-y-1.5">
                        <h3 className="text-base font-bold text-foreground">{c.title}</h3>
                        <div className="flex flex-wrap gap-2">
                            {c.keywords.map((k) => (
                                <span
                                    key={k}
                                    className="text-xs font-medium text-muted-foreground border border-border/60 rounded-full px-2.5 py-1"
                                >
                                    {k}
                                </span>
                            ))}
                        </div>
                        <p className="max-w-prose text-sm text-muted-foreground leading-relaxed">
                            {c.detail}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ==========================================
// CHAPTER CARD STACK, driven entirely by `activeIndex` (which is itself
// derived from real section.offsetTop measurements, not scroll-distance
// estimates), so a card only becomes "current" exactly when its chapter's
// content is actually on screen. Every card is always mounted; only its
// transform/opacity animate, which is what makes the swap between chapters
// glide instead of jump.
// ==========================================

function ChapterCardStack({
    sections,
    activeIndex,
    onSelect,
    variant = 'rail',
}: {
    sections: typeof DOC_SECTIONS;
    activeIndex: number;
    onSelect: (id: string) => void;
    /** 'rail' is the sticky right-column deck on md+. 'inline' is a condensed,
     *  full-width version pinned above the chapter content on mobile, where
     *  there's no side column to put a rail in, sharing the same synced-to-
     *  scroll fan animation instead of losing it below md entirely. */
    variant?: 'rail' | 'inline';
}) {
    const isInline = variant === 'inline';

    return (
        <div
            className={cn(
                'sticky z-10',
                isInline ? 'md:hidden top-24 mb-10' : 'hidden md:block top-28'
            )}
        >
            <div className={cn('relative', isInline ? 'h-[300px] sm:h-[340px]' : 'h-[600px]')}>
                {/* Opaque backdrop plate, inline only: this deck sits directly in
                    the single-column content flow (not a side rail), so once you
                    scroll past it the page's own text ends up spatially right
                    behind it. The peeking cards fade toward transparent as they
                    recede, and without this solid plate underneath, that faded
                    edge let the scrolled-up heading/paragraph bleed through and
                    visually collide with the stack instead of reading as a card. */}
                {isInline && (
                    <div className="absolute inset-0 rounded-2xl bg-background" />
                )}
                {sections.map((s, i) => {
                    const delta = i - activeIndex;
                    const Icon = s.icon;

                    // Only the current card, 1 passed, and a few upcoming ever need
                    // to be in the DOM/visible, everything else is inert. The inline
                    // deck is narrower, so it fans a shorter, tighter run of cards
                    // to keep the peeking edges from crowding off the small screen.
                    const maxDelta = isInline ? 2 : 4;
                    if (delta < -1 || delta > maxDelta) return null;

                    const isActive = delta === 0;
                    const behind = delta < 0;
                    // Behind (already-read) cards peel up and away like a torn-off
                    // sheet, pivoting from a bottom corner. Upcoming cards fan out
                    // below-right in a real, visible deck. Real hand-dealt paper
                    // stacks don't curve in one mechanical direction, each sheet
                    // lands with its own slight twist, so the tilt alternates sign
                    // per card instead of accumulating linearly. The inline deck
                    // uses smaller absolute offsets, the same pixel spacing on a
                    // narrower card would read as an exaggerated, sloppy fan.
                    const dir = delta % 2 === 0 ? 1 : -1;
                    const translateY = behind ? (isInline ? -56 : -84) : delta * (isInline ? 14 : 32);
                    const translateX = behind ? (isInline ? -26 : -44) : delta * (isInline ? 7 : 16);
                    const rotate = behind
                        ? (isInline ? -8 : -11)
                        : isActive ? 0 : dir * (isInline ? 1.4 + delta * 0.5 : 2.2 + delta * 0.9);
                    const scale = behind ? 0.9 : 1 - delta * 0.05;
                    const opacity = behind ? 0 : Math.max(0, 1 - delta * 0.18);
                    // Depth cue: the active sheet casts the deepest, softest
                    // shadow (it's the one physically closest to the viewer);
                    // sheets further back in the deck flatten out beneath it.
                    const shadow = isActive
                        ? '0 28px 60px -16px rgb(0 0 0 / 0.4), 0 8px 20px -8px rgb(0 0 0 / 0.25)'
                        : `0 ${10 + Math.abs(delta) * 3}px ${24 + Math.abs(delta) * 5}px -12px rgb(0 0 0 / ${0.18 + Math.abs(delta) * 0.02})`;

                    return (
                        <div
                            key={s.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelect(s.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelect(s.id);
                                }
                            }}
                            className={cn(
                                'absolute inset-x-0 top-0 rounded-2xl border cursor-pointer origin-bottom-left',
                                isInline ? 'min-h-[220px] sm:min-h-[260px] p-5 sm:p-7' : 'min-h-[360px] p-8 sm:p-10',
                                'transition-[transform,opacity,box-shadow] duration-[650ms] ease-[cubic-bezier(0.34,1.1,0.4,1)]',
                                isActive
                                    ? 'border-primary bg-card ring-1 ring-primary/30'
                                    : 'border-border/70 bg-card hover:border-border'
                            )}
                            style={{
                                transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                                opacity,
                                boxShadow: shadow,
                                zIndex: 100 - Math.abs(delta),
                                pointerEvents: opacity < 0.05 ? 'none' : 'auto',
                            }}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className={cn(
                                    'rounded-xl flex items-center justify-center border shrink-0',
                                    isInline ? 'h-10 w-10 sm:h-11 sm:w-11' : 'h-14 w-14',
                                    isActive
                                        ? 'bg-primary/10 border-primary/30 text-primary'
                                        : 'bg-muted/40 border-border/60 text-muted-foreground'
                                )}>
                                    <Icon className={isInline ? 'h-5 w-5' : 'h-7 w-7'} />
                                </div>
                                <span className={cn('font-bold text-primary shrink-0', isInline ? 'text-2xl sm:text-3xl' : 'text-4xl')}>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            </div>
                            <h3 className={cn('font-bold tracking-tight text-foreground', isInline ? 'mt-3 sm:mt-4 text-lg sm:text-xl line-clamp-2' : 'mt-6 text-3xl')}>
                                {s.title}
                            </h3>
                            <p className={cn('text-muted-foreground leading-relaxed', isInline ? 'mt-1.5 sm:mt-2 text-xs sm:text-sm line-clamp-2' : 'mt-3 text-base line-clamp-5')}>
                                {s.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function DocsPageContent() {
    const [activeSection, setActiveSection] = useState('overview');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = useState('gemini');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'typescript' | 'python'>('curl');
    const [activeEndpointIndex, setActiveEndpointIndex] = useState(0);

    // Track scroll position instantaneously with requestAnimationFrame
    useEffect(() => {
        let ticking = false;

        const updateScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
            }

            const scrollPosition = window.scrollY + 140;
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

    // Handle hash navigation
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

    const scrollToSection = useCallback((id: string) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.replaceState(null, '', `#${id}`);
        }
    }, []);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Active BYOK Provider data
    const activeProviderData = useMemo(() => {
        return BYOK_PROVIDERS.find(p => p.id === selectedProvider) || BYOK_PROVIDERS[0];
    }, [selectedProvider]);

    // Index of active section for Prev/Next navigation
    const currentSectionIndex = useMemo(() => {
        return DOC_SECTIONS.findIndex(s => s.id === activeSection);
    }, [activeSection]);

    const prevSection = currentSectionIndex > 0 ? DOC_SECTIONS[currentSectionIndex - 1] : null;
    const nextSection = currentSectionIndex < DOC_SECTIONS.length - 1 ? DOC_SECTIONS[currentSectionIndex + 1] : null;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary relative font-sans">
            <AppHeader />

            {/* Reading Progress Indicator Bar */}
            <div
                className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-emerald-400 to-sky-400 z-50 origin-left transition-all duration-100 ease-out pointer-events-none"
                style={{ transform: `scaleX(${scrollProgress / 100})` }}
            />



            {/* Jump to section, the one nav aid kept after removing the sidebar/tabs/TOC. */}
            <div className="sticky top-14 z-20 bg-background/90 backdrop-blur-md border-b border-border/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
                    <Select value={activeSection} onValueChange={scrollToSection}>
                        <SelectTrigger size="sm" className="w-full sm:w-72 text-xs">
                            <SelectValue placeholder="Jump to section..." />
                        </SelectTrigger>
                        <SelectContent>
                            {DOC_SECTIONS.map((s, i) => (
                                <SelectItem key={s.id} value={s.id} className="text-xs">
                                    {String(i + 1).padStart(2, '0')}, {s.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Documentation content, no sidebar/tabs/TOC. Full chapter content on the
                left; a continuously-growing stack of chapter cards on the right, each
                one sticking in place as the next lands on top of it, the current
                chapter's card picked out with a primary border. */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px] gap-10 xl:gap-14 items-start">
                <main id="main-content" className="min-w-0 space-y-16 pb-28 text-sm text-muted-foreground leading-relaxed">

                    {/* Mobile-only chapter card stack: the same "real stack of paper"
                        deck as the desktop right rail, condensed and pinned above the
                        chapter content since there's no side column to put it in below
                        md. Kept in sync with the same activeIndex/onSelect as the rail
                        so both read as one component, not two different UIs. */}
                    <ChapterCardStack
                        variant="inline"
                        sections={DOC_SECTIONS}
                        activeIndex={currentSectionIndex}
                        onSelect={scrollToSection}
                    />

                    {/* SECTION 1: Product Overview, left column swaps headline/keywords/detail
                        in sync with whichever card is pinned at the top of the right-hand
                        stack as you scroll. */}
                    <OverviewStackSection />

                    {/* SECTION 2: Quickstart Walkthrough */}
                    <section id="quickstart" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Quickstart Walkthrough
                        </h2>

                        <p>
                            Generate an ATS-tailored, vector-typeset resume in four simple steps:
                        </p>

                        {/* Connected Numbered Stepper (Mintlify Style) */}
                        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
                            {/* Step 1 */}
                            <div className="relative group">
                                <div className="absolute -left-6 top-0 h-5 w-5 rounded-full bg-card border-2 border-primary text-[10px] font-bold font-mono text-primary flex items-center justify-center">
                                    1
                                </div>
                                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                    <h3 className="font-semibold text-foreground text-xs">Upload Resume PDF & Paste Target Job Description</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Open <Link href="/builder" className="text-primary hover:underline font-medium">/builder</Link>. Drag-and-drop your existing resume PDF. Mozilla <code className="font-mono text-foreground">pdfjs-dist</code> extracts text client-side in a Web Worker without uploading unparsed files to any server.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative group">
                                <div className="absolute -left-6 top-0 h-5 w-5 rounded-full bg-card border-2 border-primary text-[10px] font-bold font-mono text-primary flex items-center justify-center">
                                    2
                                </div>
                                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                    <h3 className="font-semibold text-foreground text-xs">Verify Profile Data & Experience Details</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Review parsed work experiences, education records, and skills taxonomy in Step 2. You can reorder sections, add missing achievements, and verify links.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative group">
                                <div className="absolute -left-6 top-0 h-5 w-5 rounded-full bg-card border-2 border-primary text-[10px] font-bold font-mono text-primary flex items-center justify-center">
                                    3
                                </div>
                                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                    <h3 className="font-semibold text-foreground text-xs">AI Bullet Tailoring & ATS Gap Optimization</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Choose Optimize (100% fact-preserving polish) or Tailor (aggressive JD alignment). The pipeline identifies missing keywords from the JD and refines bullet points while preserving 100% of your real employment facts.
                                    </p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="relative group">
                                <div className="absolute -left-6 top-0 h-5 w-5 rounded-full bg-card border-2 border-emerald-500 text-[10px] font-bold font-mono text-emerald-500 flex items-center justify-center">
                                    4
                                </div>
                                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                    <h3 className="font-semibold text-foreground text-xs">Select From 52 Typst Templates & Export Vector PDF</h3>
                                    <p className="text-xs text-muted-foreground">
                                        Inspect side-by-side bullet diffs in Step 4. Switch between 52 architectural templates across 8 curated palettes. Export crisp vector PDFs or pure <code className="font-mono text-foreground">.typ</code> code.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tip Callout */}
                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1 text-xs">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                Pro-Tip: Single Page Guarantee
                            </span>
                            <p className="text-muted-foreground">
                                Typst automatically balances margins and font leading based on content density to ensure clean single-page outputs without awkward orphan lines.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 3: System Architecture */}
                    <section id="architecture" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Interactive Execution Architecture
                        </h2>

                        <p>
                            LumaCV separates heavy vector typesetting and deterministic scoring into specialized runtime layers:
                        </p>

                        {/* Interactive Pipeline Stages Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <div className="text-[10px] font-mono text-primary font-bold">STAGE 01</div>
                                <div className="text-xs font-semibold text-foreground">Client PDF Extraction</div>
                                <p className="text-[11px] text-muted-foreground">Mozilla pdfjs-dist runs locally in web workers to extract tokens and URLs.</p>
                            </div>

                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <div className="text-[10px] font-mono text-primary font-bold">STAGE 02</div>
                                <div className="text-xs font-semibold text-foreground">Zod Schema Parsing</div>
                                <p className="text-[11px] text-muted-foreground">Validates structure and uses jsonrepair for robust JSON syntax recovery.</p>
                            </div>

                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <div className="text-[10px] font-mono text-primary font-bold">STAGE 03</div>
                                <div className="text-xs font-semibold text-foreground">4-Vector ATS Scoring</div>
                                <p className="text-[11px] text-muted-foreground">Evaluates alignment against JD requirements, verbs, and taxonomy.</p>
                            </div>

                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <div className="text-[10px] font-mono text-primary font-bold">STAGE 04</div>
                                <div className="text-xs font-semibold text-foreground">Multi-Provider BYOK</div>
                                <p className="text-[11px] text-muted-foreground">Gemini / OpenAI / Claude / Groq client keys transmitted via TLS headers.</p>
                            </div>

                            <div className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <div className="text-[10px] font-mono text-primary font-bold">STAGE 05</div>
                                <div className="text-xs font-semibold text-foreground">Fact Integrity Guard</div>
                                <p className="text-[11px] text-muted-foreground">Guarantees that job titles, employers, and degree dates remain unedited.</p>
                            </div>

                            <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/5 space-y-1.5">
                                <div className="text-[10px] font-mono text-emerald-500 font-bold">STAGE 06</div>
                                <div className="text-xs font-semibold text-foreground">Typst Native Vector PDF</div>
                                <p className="text-[11px] text-muted-foreground">Sub-50ms vector compilation across 52 templates with zero rasterization.</p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: 4-Step Workflow */}
                    <section id="workflow" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            4-Step Resume Studio Workflow
                        </h2>

                        <p>
                            The resume builder UI is designed as a focused, linear 4-step wizard that ensures complete verification before export:
                        </p>

                        <div className="space-y-4 pt-2">
                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                                    <span className="font-mono text-primary font-bold px-1.5 py-0.5 rounded bg-primary/10">Step 1: Upload & Target JD</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Extracts raw text from user-uploaded PDFs using in-browser Web Workers. Accepts target job descriptions and generates a baseline ATS keyword analysis.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                                    <span className="font-mono text-primary font-bold px-1.5 py-0.5 rounded bg-primary/10">Step 2: Experience & Details Editor</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Provides an interactive editor to inspect, correct, and reorder extracted sections. Changes hydrate the client-side Zustand store with immediate localStorage persistence.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                                    <span className="font-mono text-primary font-bold px-1.5 py-0.5 rounded bg-primary/10">Step 3: AI Tailoring & Alignment</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Applies the selected tailoring mode (Optimize or Tailor) to align bullet points with target role criteria while enforcing truth verification.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                                    <span className="font-mono text-primary font-bold px-1.5 py-0.5 rounded bg-primary/10">Step 4: Typesetting Studio & Diff Studio</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Live Typst compilation preview, side-by-side bullet diff inspector, template selector (52 templates), color palette picker, and instant vector PDF / .typ download.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: Authentication & Workspaces */}
                    <section id="auth-workspaces" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Authentication & Workspace Isolation
                        </h2>

                        <p>
                            LumaCV uses server-side cookie authentication to preserve drafts, track revision histories, and prevent unauthorized access:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                                    <Database className="h-4 w-4 text-primary" />
                                    <span>Row Level Security (RLS)</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    PostgreSQL policies enforce strict ownership: <code className="font-mono text-foreground">auth.uid() = user_id</code>. No user can read or overwrite another user&apos;s resumes.
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                                <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-emerald-500" />
                                    <span>HTTP-Only Secure Cookies</span>
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Sessions are verified at the Edge via <code className="font-mono text-foreground">middleware.ts</code> using encrypted, HTTP-only cookie headers.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6: Typst Vector Engine vs Chromium */}
                    <section id="typst-engine" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Typst Vector Typesetting vs Headless Chromium
                        </h2>

                        <p>
                            Most traditional resume builders rely on headless browsers (Puppeteer, Playwright) or heavy LaTeX distributions (TeX Live). LumaCV is built around <strong>Typst</strong>, a modern, Rust-based typesetting system.
                        </p>

                        {/* Benchmark Comparison Table */}
                        <div className="overflow-x-auto border border-border/70 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border/70 bg-muted/40 text-foreground font-semibold">
                                        <th className="p-3">Typesetting Engine</th>
                                        <th className="p-3">Average Compile Time</th>
                                        <th className="p-3">Output Format</th>
                                        <th className="p-3">Runtime Footprint</th>
                                        <th className="p-3">Page Break Fidelity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    <tr className="bg-primary/5 font-medium">
                                        <td className="p-3 font-semibold text-primary flex items-center gap-1.5">
                                            <Flame className="h-3.5 w-3.5 text-primary" />
                                            <span>Typst (LumaCV)</span>
                                        </td>
                                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">15ms – 45ms</td>
                                        <td className="p-3">Native Vector PDF</td>
                                        <td className="p-3 font-mono">~35 MB binary</td>
                                        <td className="p-3 text-emerald-600 dark:text-emerald-400">Mathematical Exact</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-muted-foreground">Puppeteer / Chromium</td>
                                        <td className="p-3 font-mono text-muted-foreground">1,800ms – 4,500ms</td>
                                        <td className="p-3 text-muted-foreground">Rasterized Web Print</td>
                                        <td className="p-3 font-mono text-muted-foreground">~450 MB Chromium</td>
                                        <td className="p-3 text-muted-foreground">Unpredictable CSS breaks</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-muted-foreground">pdflatex / XeLaTeX</td>
                                        <td className="p-3 font-mono text-muted-foreground">3,000ms – 8,000ms</td>
                                        <td className="p-3 text-muted-foreground">Vector PDF</td>
                                        <td className="p-3 font-mono text-muted-foreground">~3.5 GB TeX Live</td>
                                        <td className="p-3 text-muted-foreground">Mathematical Exact</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Typst Code Block Snippet */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                    <Code2 className="h-3.5 w-3.5 text-primary" />
                                    <span>Sample Typst Template Function (Rust AST)</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(`#let resume(title: "", author: (), body) = {
  set document(title: title, author: author.name)
  set page(paper: "a4", margin: (x: 1.5cm, y: 1.2cm))
  set text(font: "Liberation Sans", size: 10pt)
  body
}`, 'typst-code')}
                                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                                >
                                    {copiedId === 'typst-code' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                    <span>Copy Typst</span>
                                </button>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card font-mono text-xs text-foreground overflow-x-auto">
                                <pre className="leading-relaxed text-muted-foreground">
{`#let resume(title: "", author: (), body) = {
  set document(title: title, author: author.name)
  set page(paper: "a4", margin: (x: 1.5cm, y: 1.2cm))
  set text(font: "Liberation Sans", size: 10pt)
  body
}`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 7: Template Architecture */}
                    <section id="templates" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Template Catalog & Architecture (52 Systems)
                        </h2>

                        <p>
                            LumaCV provides 52 distinct Typst template systems organized into 5 professional archetypes. Explore them in the <Link href="/templates" className="text-primary hover:underline font-medium">Templates Gallery</Link>:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <strong className="text-foreground text-xs flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                    1. ATS-Optimized Archetype (14 Systems)
                                </strong>
                                <p className="text-xs text-muted-foreground">Linear typographic hierarchies designed for automated enterprise applicant tracking systems (`Apex`, `Catalyst`, `Stratum`, `Sentinel`, `Clearance`).</p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <strong className="text-foreground text-xs flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    2. Modern & Tech Archetype (11 Systems)
                                </strong>
                                <p className="text-xs text-muted-foreground">Clean, high-density layouts favored by software engineers, platform architects, and tech founders (`Vector`, `Platform`, `Gridline`, `Terminal`).</p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <strong className="text-foreground text-xs flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                                    3. Executive & Advisory Archetype (12 Systems)
                                </strong>
                                <p className="text-xs text-muted-foreground">Authoritative serif and mixed hierarchies designed for directors, consultants, and senior leaders (`Heritage`, `Executive`, `Advisory`, `Meridian`).</p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5">
                                <strong className="text-foreground text-xs flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    4. Editorial & Creative Archetype (13 Systems)
                                </strong>
                                <p className="text-xs text-muted-foreground">Design-forward typography, asymmetric balance, and clean editorial whitespace (`Boutique`, `Editorial`, `Atelier`, `Nordic`).</p>
                            </div>

                            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5 sm:col-span-2">
                                <strong className="text-foreground text-xs flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                                    5. Academic & Research Archetype (2 Systems)
                                </strong>
                                <p className="text-xs text-muted-foreground">Multi-page scholarly formats accommodating extensive publications, research grants, patents, and advisory boards (`Scholar`, `Discovery`).</p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 8: AI Pipeline & BYOK */}
                    <section id="byok" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">

                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                                AI Pipeline & Client-Side BYOK Setup
                            </h2>
                            <p className="text-sm text-foreground/85">
                                LumaCV supports community-tier models out of the box and empowers candidates to connect their personal API keys from Google, OpenAI, Anthropic, or Groq for unlimited high-throughput tailoring.
                            </p>
                        </div>

                        {/* Interactive Provider Switcher */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
                                {BYOK_PROVIDERS.map((provider) => (
                                    <button
                                        key={provider.id}
                                        type="button"
                                        onClick={() => setSelectedProvider(provider.id)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                                            selectedProvider === provider.id
                                                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
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
                                                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">{m.latency}</span>
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
                                    <span className="text-xs text-muted-foreground">Configure your personal keys in user settings:</span>
                                    <Link href="/profile" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-medium transition-colors">
                                        <span>Open Key Settings</span>
                                        <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 9: ATS Scoring Formula */}
                    <section id="ats-scoring" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
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
                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">0.25</span>
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

                    {/* SECTION 10: Fact-Checking & Diff Studio */}
                    <section id="factuality" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Fact-Checking & Integrity Verification
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
                    <section id="security-privacy" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
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

                    {/* SECTION 12: REST API Reference */}
                    <section id="api-reference" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            REST API Reference & Endpoints
                        </h2>

                        <p>
                            LumaCV exposes clean, documented REST route handlers for programmatic resume parsing, tailoring, scoring, and vector compilation:
                        </p>

                        {/* Endpoint Selector Tabs */}
                        <div className="space-y-4 pt-2">
                            <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
                                {API_ENDPOINTS.map((endpoint, idx) => (
                                    <button
                                        key={endpoint.path}
                                        type="button"
                                        onClick={() => setActiveEndpointIndex(idx)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5",
                                            activeEndpointIndex === idx
                                                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <span className="text-[10px] font-bold px-1 rounded bg-background/20">
                                            {endpoint.method}
                                        </span>
                                        <span className="truncate">{endpoint.path}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Active Endpoint Spec Card */}
                            {(() => {
                                const ep = API_ENDPOINTS[activeEndpointIndex];
                                return (
                                    <div className="p-5 rounded-xl border border-border/70 bg-card space-y-5 shadow-xs">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                                                        {ep.method}
                                                    </span>
                                                    <code className="text-xs font-mono font-semibold text-foreground">
                                                        {ep.path}
                                                    </code>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{ep.description}</p>
                                            </div>
                                        </div>

                                        {/* Headers Table */}
                                        <div className="space-y-2">
                                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                Request Headers
                                            </h4>
                                            <div className="overflow-x-auto border border-border/60 rounded-lg">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-border/60 bg-muted/30 text-foreground font-semibold">
                                                            <th className="p-2.5">Header</th>
                                                            <th className="p-2.5">Required</th>
                                                            <th className="p-2.5">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/40">
                                                        {ep.headers.map((h) => (
                                                            <tr key={h.name}>
                                                                <td className="p-2.5 font-mono text-primary font-medium">{h.name}</td>
                                                                <td className="p-2.5">{h.required ? <span className="text-emerald-500 font-semibold">Yes</span> : <span className="text-muted-foreground">Optional</span>}</td>
                                                                <td className="p-2.5 text-muted-foreground">{h.value}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Body Params */}
                                        <div className="space-y-2">
                                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                Request Body Parameters
                                            </h4>
                                            <div className="overflow-x-auto border border-border/60 rounded-lg">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-border/60 bg-muted/30 text-foreground font-semibold">
                                                            <th className="p-2.5">Parameter</th>
                                                            <th className="p-2.5">Type</th>
                                                            <th className="p-2.5">Required</th>
                                                            <th className="p-2.5">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/40">
                                                        {ep.bodyParams.map((p) => (
                                                            <tr key={p.name}>
                                                                <td className="p-2.5 font-mono text-foreground font-medium">{p.name}</td>
                                                                <td className="p-2.5 font-mono text-primary">{p.type}</td>
                                                                <td className="p-2.5">{p.required ? <span className="text-emerald-500 font-semibold">Yes</span> : <span className="text-muted-foreground">Optional</span>}</td>
                                                                <td className="p-2.5 text-muted-foreground">{p.description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Multi-language code snippet tabs */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Sample Request ({activeCodeLang.toUpperCase()})
                                                </h4>
                                                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60">
                                                    {(['curl', 'typescript', 'python'] as const).map((lang) => (
                                                        <button
                                                            key={lang}
                                                            type="button"
                                                            onClick={() => setActiveCodeLang(lang)}
                                                            className={cn(
                                                                "px-2 py-0.5 rounded text-[10px] font-mono capitalize transition-colors cursor-pointer",
                                                                activeCodeLang === lang
                                                                    ? "bg-primary text-primary-foreground font-bold"
                                                                    : "text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            {lang}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="relative rounded-xl border border-border/70 bg-card p-4 font-mono text-xs text-foreground">
                                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40 text-[11px] text-muted-foreground">
                                                    <span>Request Example</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(`curl -X POST "https://your-domain.com${ep.path}" \\
  -H "Content-Type: application/json" \\
  -d '{"key": "value"}'`, `code-${ep.path}`)}
                                                        className="hover:text-foreground flex items-center gap-1 cursor-pointer"
                                                    >
                                                        {copiedId === `code-${ep.path}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                                        <span>Copy</span>
                                                    </button>
                                                </div>
                                                <pre className="overflow-x-auto text-muted-foreground">
{activeCodeLang === 'curl' && `curl -X POST "https://your-domain.com${ep.path}" \\
  -H "Content-Type: application/json" \\
  -H "x-gemini-api-key: YOUR_GEMINI_API_KEY" \\
  -d '{ ...payload }'`}
{activeCodeLang === 'typescript' && `const res = await fetch("https://your-domain.com${ep.path}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-gemini-api-key": process.env.GEMINI_API_KEY
  },
  body: JSON.stringify({ ...payload })
});
const data = await res.json();`}
{activeCodeLang === 'python' && `import requests

res = requests.post(
    "https://your-domain.com${ep.path}",
    headers={
        "Content-Type": "application/json",
        "x-gemini-api-key": "YOUR_GEMINI_API_KEY"
    },
    json={ ...payload }
)
data = res.json()`}
                                                </pre>
                                            </div>
                                        </div>

                                        {/* Response JSON */}
                                        <div className="space-y-2">
                                            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                Sample Response (200 OK)
                                            </h4>
                                            <div className="p-4 rounded-xl border border-border/70 bg-card font-mono text-xs text-foreground overflow-x-auto">
                                                <pre className="leading-relaxed text-muted-foreground">{ep.responseExample}</pre>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </section>

                    {/* SECTION 13: Tech Stack & Dependencies */}
                    <section id="stack-dependencies" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Tech Stack & Dependency Audit
                        </h2>

                        <p>
                            LumaCV is built with modern, battle-tested technologies selected for performance, type safety, and minimal bundle size:
                        </p>

                        <div className="overflow-x-auto border border-border/70 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border/70 bg-muted/40 text-foreground font-semibold">
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
                                        <td className="p-3 font-semibold font-mono text-foreground">Typst Native CLI</td>
                                        <td className="p-3 font-mono">0.11.x</td>
                                        <td className="p-3">Native Rust compiler generating sub-50ms vector PDFs.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-semibold font-mono text-foreground">Tailwind CSS</td>
                                        <td className="p-3 font-mono">3.4.x</td>
                                        <td className="p-3">Semantic dark/light design tokens and typography styling.</td>
                                    </tr>
                                    <tr className="bg-card">
                                        <td className="p-3 font-semibold font-mono text-foreground">Zustand</td>
                                        <td className="p-3 font-mono">4.5.x</td>
                                        <td className="p-3">Reactive client store with persistent local storage hydration guards.</td>
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

                    {/* SECTION 14: Environment Variables */}
                    <section id="configuration" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Environment Variables & Configuration
                        </h2>

                        <p>
                            Configure the following variables in your <code className="font-mono text-foreground">.env.local</code> file:
                        </p>

                        <div className="overflow-x-auto border border-border/70 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-border/70 bg-muted/40 text-foreground font-semibold">
                                        <th className="p-3">Variable</th>
                                        <th className="p-3">Required</th>
                                        <th className="p-3">Purpose</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    <tr className="bg-card">
                                        <td className="p-3 font-mono text-foreground">GEMINI_API_KEY</td>
                                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Yes*</td>
                                        <td className="p-3">Server-side fallback API key for Google Gemini (Flash / Flash-Lite).</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 font-mono text-foreground">GROQ_API_KEY</td>
                                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Yes*</td>
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
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* SECTION 15: Self-Hosting & Docker */}
                    <section id="self-hosting" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">

                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Docker & Self-Hosting Guide
                        </h2>

                        <p>
                            Run LumaCV fully isolated in your private infrastructure with pre-installed Typst binary:
                        </p>

                        <div className="space-y-3">
                            <div className="relative rounded-xl border border-border/70 bg-card p-4 font-mono text-xs text-foreground">
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40 text-[11px] text-muted-foreground">
                                    <span>docker-compose.yml</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(`version: '3.8'

services:
  lumacv:
    image: ghcr.io/sahilbnsll/lumacv:latest
    container_name: lumacv-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - GROQ_API_KEY=\${GROQ_API_KEY}
      - NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}`, 'docker-compose')}
                                        className="hover:text-foreground flex items-center gap-1 cursor-pointer"
                                    >
                                        {copiedId === 'docker-compose' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                        <span>Copy</span>
                                    </button>
                                </div>
                                <pre className="leading-relaxed overflow-x-auto text-muted-foreground">
{`version: '3.8'

services:
  lumacv:
    image: ghcr.io/sahilbnsll/lumacv:latest
    container_name: lumacv-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - GROQ_API_KEY=\${GROQ_API_KEY}
      - NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}`}
                                </pre>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Start the service using Docker Compose:
                            </p>

                            <div className="relative rounded-xl border border-border/70 bg-card p-4 font-mono text-xs text-foreground">
                                <pre className="leading-relaxed overflow-x-auto">
{`docker-compose up -d`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 16: Keyboard Shortcuts */}
                    <section id="shortcuts" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Keyboard Shortcuts Reference
                        </h2>

                        <p>Speed up your resume engineering workflow with built-in hotkeys:</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card">
                                <span className="text-xs text-foreground">Spotlight Command Search</span>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 rounded bg-muted border border-border text-[11px] font-mono">⌘</kbd>
                                    <kbd className="px-2 py-1 rounded bg-muted border border-border text-[11px] font-mono">K</kbd>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card">
                                <span className="text-xs text-foreground">Export PDF in Studio</span>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 rounded bg-muted border border-border text-[11px] font-mono">⌘</kbd>
                                    <kbd className="px-2 py-1 rounded bg-muted border border-border text-[11px] font-mono">P</kbd>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card">
                                <span className="text-xs text-foreground">Close Modals / Drawers</span>
                                <kbd className="px-2 py-1 rounded bg-muted border border-border text-[11px] font-mono">Esc</kbd>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 17: Production Deployment */}
                    <section id="deployment" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                            Production Deployment Guide
                        </h2>

                        <p>
                            LumaCV is optimized for one-click serverless deployment on <strong>Vercel</strong>:
                        </p>

                        <ul className="list-disc pl-5 space-y-2 text-xs">
                            <li><strong>Native Typst Execution:</strong> The serverless compiler automatically provisions the platform-specific Typst binary in Node.js serverless functions.</li>
                            <li><strong>Timeout Buffering:</strong> Long-running AI endpoints (<code className="font-mono text-foreground">/api/v1/resume/parse</code>, <code className="font-mono text-foreground">/api/v1/resume/tailor</code>) are configured with <code className="font-mono text-foreground">maxDuration = 60</code>.</li>
                            <li><strong>Edge Compatibility:</strong> Real-time keyword scoring (<code className="font-mono text-foreground">/api/v1/resume/score</code>) executes in under 10ms.</li>
                        </ul>
                    </section>

                    {/* SECTION 18: Troubleshooting & FAQ */}
                    <section id="troubleshooting" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">
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

                    {/* SECTION 19: Changelog */}
                    <section id="changelog" className="space-y-6 scroll-mt-36 border-b border-border/40 pb-14">

                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                                Changelog & Version History
                            </h2>
                            <p className="text-sm text-foreground/85">
                                All notable updates, engine speedups, model integrations, and security hardening are documented here chronologically:
                            </p>
                        </div>

                        {/* Chronological Release Timeline */}
                        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80 pt-2">
                            {CHANGELOG_RELEASES.map((rel) => (
                                <div key={rel.version} className="relative group">
                                    {/* Timeline Pin */}
                                    <div className="absolute -left-6 top-1 h-5 w-5 rounded-full bg-card border-2 border-primary text-[10px] font-bold font-mono text-primary flex items-center justify-center">
                                        <Milestone className="h-2.5 w-2.5" />
                                    </div>

                                    <div className="p-5 rounded-xl border border-border/70 bg-card space-y-4 shadow-2xs hover:border-primary/40 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="px-2.5 py-0.5 rounded-md bg-primary text-primary-foreground font-mono text-xs font-bold shadow-xs">
                                                        {rel.version}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{rel.date}</span>
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-semibold text-foreground pt-1">
                                                    {rel.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {rel.summary}
                                        </p>

                                        {/* Categorized Highlights */}
                                        <div className="space-y-3 pt-1">
                                            {rel.highlights.map((hl) => (
                                                <div key={hl.category} className="space-y-1.5">
                                                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
                                                        <Tag className="h-3 w-3 text-primary" />
                                                        <span>{hl.category}</span>
                                                    </span>
                                                    <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                                                        {hl.items.map((item, i) => (
                                                            <li key={i}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 20: License */}
                    <section id="license" className="space-y-6 scroll-mt-36">
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

                    {/* Pagination Cards (Prev / Next Topic) */}
                    <div className="pt-10 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {prevSection ? (
                            <button
                                type="button"
                                onClick={() => scrollToSection(prevSection.id)}
                                className="p-4 rounded-xl border border-border/70 bg-card hover:border-primary/50 text-left transition-all group cursor-pointer"
                            >
                                <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1 mb-1">
                                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                                    <span>Previous Topic</span>
                                </span>
                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                                    {prevSection.title}
                                </span>
                            </button>
                        ) : <div />}

                        {nextSection && (
                            <button
                                type="button"
                                onClick={() => scrollToSection(nextSection.id)}
                                className="p-4 rounded-xl border border-border/70 bg-card hover:border-primary/50 text-right transition-all group cursor-pointer ml-auto w-full sm:w-auto"
                            >
                                <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center justify-end gap-1 mb-1">
                                    <span>Next Topic</span>
                                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                                    {nextSection.title}
                                </span>
                            </button>
                        )}
                    </div>

                </main>

                {/* Right rail, driven by activeSection, so it switches to a chapter's
                    card exactly when that chapter's content is on screen, with a
                    smooth animated glide between cards rather than a scroll-timed one. */}
                <ChapterCardStack
                    sections={DOC_SECTIONS}
                    activeIndex={currentSectionIndex}
                    onSelect={scrollToSection}
                />
            </div>

            <EditorialFooter />
        </div>
    );
}
