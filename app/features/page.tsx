"use client";

import React from 'react';
import Link from 'next/link';
import { 
    Sparkles,
    GitBranch,
    EyeOff,
    Zap,
    ShieldCheck,
    Server,
    Languages,
    KeyRound,
    Fingerprint,
    Files,
    SlidersHorizontal,
    LayoutTemplate,
    Share2,
    LockKeyhole,
    FileCode2,
    Target,
    ArrowRight,
    Layers
} from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { MorphingCardStack } from '@/components/ui/morphing-card-stack';
import { lumacvCardData } from '@/components/ui/morphing-card-stack-demo';

interface FeatureItem {
    icon: React.ElementType;
    title: string;
    description: string;
    isHighlighted?: boolean;
}

const ALL_FEATURES: FeatureItem[] = [
    {
        icon: Sparkles,
        title: "Free",
        description: "Completely free, forever, no hidden costs."
    },
    {
        icon: GitBranch,
        title: "Open Source",
        description: "By the community, for the community."
    },
    {
        icon: EyeOff,
        title: "No Advertising, No Tracking",
        description: "No ads and no trackers, so nothing gets in your way."
    },
    {
        icon: Zap,
        title: "Instant Generation",
        description: "Export your resume to PDF in one click, with sub-50ms Typst vector compilation."
    },
    {
        icon: ShieldCheck,
        title: "Data Security",
        description: "Your data is secure, encrypted, and never shared or sold to anyone."
    },
    {
        icon: Server,
        title: "Self-Host with Docker",
        description: "Deploy it on your own servers using the official Docker image."
    },
    {
        icon: Languages,
        title: "Multilingual",
        description: "Full UTF-8 support for crafting resumes in any language, script, or locale."
    },
    {
        icon: KeyRound,
        title: "One-Click Sign-In",
        description: "Sign in with GitHub, Google, or a custom OAuth provider with zero friction."
    },
    {
        icon: Fingerprint,
        title: "Passkeys & 2FA",
        description: "Add another layer of biometric protection to your resume studio account."
    },
    {
        icon: Files,
        title: "Unlimited Resumes",
        description: "Create as many tailored resume variations as you want."
    },
    {
        icon: SlidersHorizontal,
        title: "Flexibility",
        description: "Change colors, fonts, margins, and design tokens to suit your style."
    },
    {
        icon: LayoutTemplate,
        title: "Architectural Templates",
        description: "6 executive layouts engineered for tech, finance, and ATS parsing, with 8 color themes."
    },
    {
        icon: Share2,
        title: "Shareable Links",
        description: "Publish your resume online with a public link or private read-only passkey."
    },
    {
        icon: LockKeyhole,
        title: "Password Protection",
        description: "Protect your shared links with a secure password or expiration date."
    },
    {
        icon: FileCode2,
        title: "Native Typst AST",
        description: "Engineered with native vector Typst typesetting for sub-50ms deterministic rendering."
    },
    {
        icon: Target,
        title: "ATS-Engineered",
        description: "Strict typographic hierarchies ensure top scores in enterprise recruitment filters."
    }
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                {/* Header Section (Matching reference design) */}
                <div className="space-y-3 mb-12 sm:mb-16 max-w-3xl">
                    <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground">
                        Features
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        Create, customize, and share your resume. LumaCV is open source, it doesn&apos;t track you, and it stays free.
                    </p>
                </div>

                {/* 4-Column Border Grid (Exact reference pattern) */}
                <div className="border-t border-l border-border/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-xl overflow-hidden shadow-xs">
                    {ALL_FEATURES.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="group border-r border-b border-border/60 p-6 sm:p-7 space-y-3.5 transition-colors duration-200 hover:bg-muted/40 dark:hover:bg-[#181a1d] cursor-default bg-card/40"
                            >
                                {/* Subtle Icon Box */}
                                <div className="h-9 w-9 rounded-lg bg-muted/70 dark:bg-white/[0.05] border border-border/60 dark:border-white/10 flex items-center justify-center text-foreground/80 dark:text-neutral-300 transition-transform duration-200 group-hover:scale-110 shadow-2xs">
                                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                                </div>

                                {/* Feature Title */}
                                <h2 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">
                                    {item.title}
                                </h2>

                                {/* Feature Description */}
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Interactive Architecture Stack (MorphingCardStack Integration) */}
                <div className="mt-16 sm:mt-20 rounded-2xl border border-border/70 bg-card/50 backdrop-blur-md p-8 sm:p-10 shadow-sm space-y-6">
                    <div className="text-center space-y-2 max-w-xl mx-auto">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-medium">
                            <Layers className="h-3.5 w-3.5" />
                            <span>Interactive Architecture Stack</span>
                        </div>
                        <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                            Explore LumaCV Core Pillars
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Switch between stack, grid, and list viewports to inspect the underlying architectural components.
                        </p>
                    </div>

                    <div className="py-4 flex justify-center">
                        <MorphingCardStack cards={lumacvCardData} />
                    </div>
                </div>

                {/* Bottom CTA Banner */}
                <div className="mt-12 sm:mt-16 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="space-y-1.5 text-center sm:text-left">
                        <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                            Ready to craft your resume?
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Start building with sub-50ms instant feedback. No credit card required.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button asChild size="lg" className="h-11 px-6 text-xs sm:text-sm font-semibold gap-2 rounded-xl">
                            <Link href="/builder">
                                <span>Get Started</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-11 px-6 text-xs sm:text-sm font-medium rounded-xl">
                            <Link href="/demo">
                                <span>View Live Samples</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
