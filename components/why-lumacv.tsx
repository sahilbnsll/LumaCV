"use client";

import React from 'react';

const PILLARS = [
    {
        title: "Typst Vector Speed",
        description: "Forget sluggish headless Chrome canvas exports. Typst compiles clean, infinite-resolution vector PDFs with crisp micro-typography and selectable hyperlinks in milliseconds.",
    },
    {
        title: "Dual Tailoring Modes",
        description: "Choose between 100% Fact-Preserving Optimization (conservative polish of your actual impact) or Aggressive JD Alignment. Both pass through an automated factual integrity auditor.",
    },
    {
        title: "Client-Side BYOK Privacy",
        description: "Bring Your Own Key for Gemini, Claude, OpenAI, or Groq. Pay raw token fractions directly to AI providers without markups, and keep your resume drafts private in your browser.",
    },
    {
        title: "48 Engineered Archetypes",
        description: "Engineered specifically to survive Workday, Taleo, and Greenhouse parsers without sacrificing visual elegance, typographic hierarchy, or print-ready proportion.",
    },
];

export function WhyLumaCV() {
    return (
        <section id="why-lumacv" className="relative border-b border-border/40 py-20 sm:py-28 overflow-hidden bg-background">
            {/* Ambient Lighting */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[340px] bg-gradient-to-r from-primary/10 via-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl opacity-60" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto space-y-3.5">
                    <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-foreground">
                        Why Engineers & Leaders Choose LumaCV
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        Commercial resume builders trap your data behind paywalls and output bloated raster PDFs. LumaCV is engineered from the ground up for technical rigor.
                    </p>
                </div>

                {/* 4 Architectural Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {PILLARS.map((pillar) => (
                        <div 
                            key={pillar.title}
                            className="group relative rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs p-6 space-y-3 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-xs flex flex-col justify-between"
                        >
                            <div className="space-y-2.5">
                                <h3 className="font-bold text-base text-foreground font-display">
                                    {pillar.title}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {pillar.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
