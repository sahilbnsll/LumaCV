"use client";

import React, { useState, useRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveWatermarkProps {
    className?: string;
    text?: string;
}

export function InteractiveWatermark({
    className,
    text = "LumaCV",
}: InteractiveWatermarkProps) {
    const rawId = useId();
    const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const [cursor, setCursor] = useState({
        svgX: 500,
        svgY: 90,
        sectionPercentX: 50,
        sectionPercentY: 30,
        isHovered: false,
    });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const sectionRect = containerRef.current.getBoundingClientRect();
        const sectionPercentX = ((e.clientX - sectionRect.left) / sectionRect.width) * 100;
        const sectionPercentY = ((e.clientY - sectionRect.top) / sectionRect.height) * 100;

        let svgX = 500;
        let svgY = 90;

        if (svgRef.current) {
            const svgRect = svgRef.current.getBoundingClientRect();
            svgX = ((e.clientX - svgRect.left) / svgRect.width) * 1000;
            svgY = ((e.clientY - svgRect.top) / svgRect.height) * 180;
        }

        setCursor({
            svgX: Math.max(-150, Math.min(1150, svgX)),
            svgY: Math.max(-100, Math.min(280, svgY)),
            sectionPercentX,
            sectionPercentY,
            isHovered: true,
        });
    };

    const handleMouseEnter = () => setCursor(prev => ({ ...prev, isHovered: true }));
    const handleMouseLeave = () => setCursor(prev => ({ ...prev, isHovered: false }));

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative overflow-hidden pt-16 sm:pt-24 pb-20 sm:pb-28 text-center select-none cursor-default border-t border-border/40 transition-colors duration-500 bg-background",
                className
            )}
        >
            {/* Dynamic Ambient Cursor Sheen */}
            <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-500 will-change-transform"
                style={{
                    opacity: cursor.isHovered ? 1 : 0,
                    background: `radial-gradient(circle 220px at ${cursor.sectionPercentX}% ${cursor.sectionPercentY}%, rgba(244,63,94,0.06), transparent 70%)`,
                }}
            />

            {/* ========================================================================= */}
            {/* 1. TOP PORTION: Watermark with Cursor Glow (Matches Image 2)               */}
            {/* ========================================================================= */}
            <div className="relative w-full max-w-4xl mx-auto px-4 flex items-center justify-center pointer-events-none">
                <svg
                    ref={svgRef}
                    viewBox="0 0 1000 180"
                    className="w-full h-auto max-h-[180px] sm:max-h-[210px] select-none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Multi-tone Vibrant Gradient Stroke */}
                        <linearGradient id={`stroke-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f43f5e" />   {/* Rose / Coral */}
                            <stop offset="30%" stopColor="#fb7185" />  {/* Warm Pink */}
                            <stop offset="55%" stopColor="#c084fc" />  {/* Violet */}
                            <stop offset="80%" stopColor="#818cf8" />  {/* Indigo */}
                            <stop offset="100%" stopColor="#38bdf8" /> {/* Cyan */}
                        </linearGradient>

                        {/* Mask tracking cursor directly inside SVG coordinates */}
                        <mask id={`mask-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="180">
                            <circle
                                cx={cursor.svgX}
                                cy={cursor.svgY}
                                r={cursor.isHovered ? 115 : 0}
                                fill={`url(#radial-mask-elem-${id})`}
                                className="transition-[r] duration-300 ease-out"
                            />
                        </mask>

                        <radialGradient id={`radial-mask-elem-${id}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.75" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Layer 1: Base Faint Hollow Outline (always visible, matching Image 2) */}
                    <text
                        x="50%"
                        y="58%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        className="font-display font-extrabold text-[125px] sm:text-[145px] tracking-tight transition-colors duration-300 text-slate-300/80 dark:text-white/[0.12]"
                    >
                        {text}
                    </text>

                    {/* Layer 2: Radiant Coral/Purple/Cyan Gradient Stroke (revealed at mouse location) */}
                    <text
                        x="50%"
                        y="58%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="none"
                        stroke={`url(#stroke-grad-${id})`}
                        strokeWidth="2.25"
                        mask={`url(#mask-${id})`}
                        className="font-display font-extrabold text-[125px] sm:text-[145px] tracking-tight"
                    >
                        {text}
                    </text>
                </svg>
            </div>

            {/* ========================================================================= */}
            {/* 2. BOTTOM PORTION: Manifesto Typography (Cleanly Separated Below Logo)    */}
            {/* ========================================================================= */}
            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 space-y-3 z-10">
                <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-foreground">
                    By the community, for the community.
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    LumaCV gets better because people give it their time. Contributors on GitHub build the features and fix the bugs, and donors help keep development going. This project owes its progress to all of them.
                </p>
            </div>
        </section>
    );
}
