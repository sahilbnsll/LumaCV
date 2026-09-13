"use client";

import React, { useState, useEffect } from "react";
import { AnimatedCounter } from "@/components/animated-counter";
import { ShieldCheck, LayoutTemplate, Sparkles, Activity } from "lucide-react";

export interface StatsSocialProofProps {
    stats: {
        usersCount: number;
        resumesCompiled: number;
        bulletsTailored: number;
        activeTemplates: number;
        factCheckAccuracy: number;
    };
}

/**
 * Custom SVG icons tailored to match Apple-inspired wireframe aesthetics
 */
function OverlappingUsersIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="8" cy="12" r="5" />
            <circle cx="16" cy="12" r="5" />
        </svg>
    );
}

function OverlappingDocsIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3" y="4" width="13" height="17" rx="2" transform="rotate(-6 3 4)" />
            <rect x="8" y="3" width="13" height="17" rx="2" transform="rotate(4 8 3)" />
        </svg>
    );
}

export function StatsSocialProof({ stats }: StatsSocialProofProps) {
    const [timestampText, setTimestampText] = useState<string>("As of Sep 11, 2026, 5:05 PM.");

    useEffect(() => {
        try {
            const now = new Date();
            const formatted = new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }).format(now);
            setTimestampText(`As of ${formatted}. Synchronized across compilation clusters.`);
        } catch {
            // Keep fallback
        }
    }, []);

    const statItems = [
        {
            id: "users",
            label: "Registered Users",
            icon: OverlappingUsersIcon,
            value: stats.usersCount,
            isCounter: true,
            className: "text-foreground",
        },
        {
            id: "resumes",
            label: "Real Resumes Compiled",
            icon: OverlappingDocsIcon,
            value: stats.resumesCompiled,
            isCounter: true,
            className: "text-foreground",
        },
        {
            id: "bullets",
            label: "Bullet Lines Tailored",
            icon: Sparkles,
            value: stats.bulletsTailored,
            isCounter: true,
            className: "text-foreground",
        },
        {
            id: "factCheck",
            label: "Factual Integrity Verified",
            icon: ShieldCheck,
            value: `${stats.factCheckAccuracy}%`,
            isCounter: false,
            className: "text-emerald-600 dark:text-emerald-400",
        },
        {
            id: "templates",
            label: "Active Typst Presets",
            icon: LayoutTemplate,
            value: stats.activeTemplates,
            isCounter: false,
            className: "text-foreground",
        },
    ];

    return (
        <section
            id="statistics"
            aria-labelledby="stats-heading"
            className="relative overflow-hidden border-y border-border/40 bg-background text-foreground transition-colors py-14 sm:py-18 lg:py-20"
        >
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                {/* Section Header: Native LumaCV Engineering Ethos */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border/70 w-fit">
                            <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
                            <span>Live Platform Telemetry</span>
                        </div>
                        <h2
                            id="stats-heading"
                            className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight"
                        >
                            Engineered for precision. Proven at scale.
                        </h2>
                    </div>
                    <p className="text-xs text-muted-foreground sm:text-right max-w-xs leading-relaxed">
                        Every resume compiled natively via Typst without SaaS lock-in or hallucinated claims.
                    </p>
                </div>

                {/* Top Divider Line across full container */}
                <div className="border-t border-border/40 my-6 sm:my-8" />

                {/* 5-Column Stats Row with Crisp Adaptive Dividers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 divide-border/40 sm:divide-x divide-border/40">
                    {statItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                className={`flex flex-col justify-between p-5 sm:p-6 lg:p-7 ${
                                    idx === 0 ? "sm:pl-0" : ""
                                } ${idx === statItems.length - 1 ? "lg:pr-0" : ""}`}
                            >
                                {/* Top: Icon + Label Row */}
                                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4">
                                    <Icon className="h-4 w-4 text-muted-foreground/80 shrink-0" />
                                    <span className="tracking-tight">{item.label}</span>
                                </div>

                                {/* Giant Bold Tabular Figure */}
                                <div
                                    className={`font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight tabular-nums drop-shadow-xs ${item.className}`}
                                >
                                    {item.isCounter && typeof item.value === "number" ? (
                                        <AnimatedCounter value={item.value} formatCommas={true} />
                                    ) : (
                                        <span>{item.value}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Divider Line & Live Status Footer */}
                <div className="border-t border-border/40 mt-6 sm:mt-8 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-xs text-muted-foreground">
                    <p suppressHydrationWarning>{timestampText}</p>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Real-time compiler telemetry active</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
