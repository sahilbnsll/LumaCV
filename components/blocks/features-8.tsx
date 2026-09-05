"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Users, 
  Zap, 
  CheckCircle2, 
  Heart, 
  Sparkles, 
  FileCode2, 
  ArrowRightLeft, 
  Target, 
  Cpu, 
  FileCheck, 
  Layers,
  Check,
  Activity,
  Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Features() {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <section id="features" className="relative overflow-hidden border-b border-border/40 py-20 sm:py-28 bg-background text-foreground">
      {/* Ambient background bloom */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 dark:bg-primary/[0.06] blur-[150px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/[0.04] blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 space-y-3.5">

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-foreground">
            Everything you need to engineer a winning resume
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            Built for complete candidate autonomy. Open-source, zero behavioral tracking, deterministic Typst rendering, and 100% free forever.
          </p>
        </div>

        {/* 6-Column High-Taste Bento Grid (3 Balanced Rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 sm:gap-5">
          
          {/* ========================================================================= */}
          {/* Card 1: 100% Factual Integrity (Dynamic Handdrawn Stroke + Star Sparkle)   */}
          {/* ========================================================================= */}
          <Card className="group relative col-span-full lg:col-span-2 flex flex-col justify-between overflow-hidden border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-0.5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="relative m-auto flex flex-col items-center justify-center pt-8 pb-8 px-6 text-center w-full">
              {/* Loop Ribbon Container with Weightless Antigravity Float */}
              <div className="relative flex h-28 w-64 items-center justify-center">
                {/* Ambient Soft Bloom behind 100% */}
                <motion.div
                  animate={{
                    scale: [0.92, 1.08, 0.92],
                    opacity: [0.35, 0.7, 0.35],
                  }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-none absolute inset-0 m-auto h-20 w-44 rounded-full bg-primary/15 dark:bg-primary/20 blur-xl"
                />

                {/* Handdrawn Loop SVG with Dynamic SVG Stroke Draw */}
                <svg
                  className="absolute inset-0 size-full overflow-visible transition-transform duration-700 group-hover:scale-105"
                  viewBox="0 0 254 104"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={`loop-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>

                  {/* Base Organic Ribbon (Translucent Ink Wash Foundation) */}
                  <path
                    d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                    className="text-primary/20 dark:text-primary/25"
                    fill="currentColor"
                  />

                  {/* Electric Kinetic Highlighter Stroke Following the EXACT Path & Direction of the Handdrawn Ribbon */}
                  <motion.path
                    d="M 160 18.5 C 180 19.5 198 22 212 25.5 C 230 30 246 40 247 54 C 248 66 242 74 233 80 C 216 89 194 93.5 168 96.5 C 148 98.5 130 100.5 113.5 100.5 C 90 100.5 68 98.5 48 95 C 28 91 16 84 10 70 C 5 58 6 51 9 45 C 14 36 21 30 34 24.5 C 50 18 70 14 92 11.5 C 114 9 138 6.5 162 6 C 188 5.5 212 8 228 13 C 236 15.5 243 18.5 246 22"
                    fill="none"
                    stroke={`url(#loop-gradient-${id})`}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="800"
                    animate={{
                      strokeDashoffset: [800, 0, 0, 800],
                      opacity: [0.35, 1, 1, 0.35],
                    }}
                    transition={{
                      duration: 3.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      times: [0, 0.52, 0.85, 1],
                    }}
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))",
                    }}
                  />

                  {/* Animated Star Twinkle Burst (✦ ⋆｡°✩) Directly at the Flourish End Point (246, 22) */}
                  <motion.g
                    transform="translate(245, 21)"
                    animate={{
                      scale: [0, 0, 1.25, 1, 0],
                      rotate: [0, 0, 45, 90, 180],
                      opacity: [0, 0, 1, 0.9, 0],
                    }}
                    transition={{
                      duration: 3.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      times: [0, 0.48, 0.58, 0.85, 1],
                    }}
                    style={{ transformOrigin: "0px 0px" }}
                  >
                    <path
                      d="M 0 -10 C 0 -4.5 4.5 0 10 0 C 4.5 0 0 4.5 0 10 C 0 4.5 -4.5 0 -10 0 C -4.5 0 0 -4.5 0 -10 Z"
                      className="fill-primary"
                      style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.9))" }}
                    />
                  </motion.g>

                  {/* Companion Micro Sparkle (⋆) */}
                  <motion.g
                    transform="translate(250, 32)"
                    animate={{
                      scale: [0, 0, 1.1, 0.8, 0],
                      opacity: [0, 0, 0.9, 0.7, 0],
                    }}
                    transition={{
                      duration: 3.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      times: [0, 0.52, 0.64, 0.85, 1],
                    }}
                    style={{ transformOrigin: "0px 0px" }}
                  >
                    <path
                      d="M 0 -6 C 0 -2.7 2.7 0 6 0 C 2.7 0 0 2.7 0 6 C 0 2.7 -2.7 0 -6 0 C -2.7 0 0 -2.7 0 -6 Z"
                      className="fill-sky-400"
                      style={{ filter: "drop-shadow(0 0 5px rgba(56, 189, 248, 0.9))" }}
                    />
                  </motion.g>
                </svg>

                {/* 100% Numeral with Weightless Antigravity Float */}
                <motion.span
                  animate={{
                    y: [0, -2.5, 0],
                  }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 font-display font-extrabold text-5xl sm:text-6xl text-foreground tracking-tight tabular-nums drop-shadow-sm select-none"
                >
                  100%
                </motion.span>
              </div>

              {/* Verified Trust Micro-Badge */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
                <CheckCircle2 className="size-3" />
                ZERO HALLUCINATIONS
              </div>

              <h3 className="mt-4 font-display font-bold text-2xl text-foreground tracking-tight">
                Factual Integrity
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs">
                Guaranteed zero-hallucination AI tailoring. Every line is strictly verified against your real career achievements.
              </p>
            </CardContent>
          </Card>

          {/* ========================================================================= */}
          {/* Card 2: Client-Side Privacy (Biometric Fingerprint Laser Scanner)         */}
          {/* ========================================================================= */}
          <Card className="group relative col-span-full sm:col-span-3 lg:col-span-2 overflow-hidden border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md hover:border-emerald-500/40 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-0.5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="pt-8 pb-7 flex flex-col justify-between h-full">
              {/* Biometric Scanner Housing */}
              <div className="relative mx-auto flex items-center justify-center">
                {/* Expanding Security Radar Aura */}
                <motion.div
                  animate={{ scale: [0.94, 1.06, 0.94], opacity: [0.3, 0.65, 0.3] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute -inset-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03]"
                />

                {/* Biometric Fingerprint Scanner Pod */}
                <div className="relative size-32 sm:size-36 rounded-2xl border border-border/90 dark:border-white/10 bg-muted/20 dark:bg-black/30 backdrop-blur-md p-2 flex items-center justify-center shadow-inner">
                  <svg
                    className="size-full overflow-visible"
                    viewBox="0 0 180 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id={`fp-laser-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="50%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                      <linearGradient id={`laser-trail-grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
                      </linearGradient>
                      {/* Dynamic vertical scan clipping window synchronized with laser */}
                      <clipPath id={`fp-scan-clip-${id}`}>
                        <motion.rect
                          x="10"
                          width="160"
                          height="46"
                          rx="6"
                          animate={{ y: [0, 154, 0] }}
                          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </clipPath>
                    </defs>

                    {/* High-Tech Biometric HUD Corner Brackets */}
                    <path d="M 14 26 L 14 14 L 26 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="text-emerald-500/60 dark:text-emerald-400/70" />
                    <path d="M 166 26 L 166 14 L 154 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="text-emerald-500/60 dark:text-emerald-400/70" />
                    <path d="M 14 174 L 14 186 L 26 186" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="text-emerald-500/60 dark:text-emerald-400/70" />
                    <path d="M 166 174 L 166 186 L 154 186" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="text-emerald-500/60 dark:text-emerald-400/70" />

                    {/* HUD Center Targeting Tick Marks */}
                    <line x1="6" y1="100" x2="14" y2="100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-emerald-500/40" />
                    <line x1="166" y1="100" x2="174" y2="100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-emerald-500/40" />

                    {/* 1. Base Fingerprint Ridges (Passive / Dark Unscanned State) */}
                    <g
                      className="text-muted-foreground/30 dark:text-muted-foreground/25"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {/* Core center loop whorls */}
                      <path d="M 90 95 C 85 95 82 100 82 108 C 82 120 80 134 78 144" />
                      <path d="M 90 85 C 78 85 72 94 72 108 C 72 124 70 138 67 152" />
                      <path d="M 90 73 C 70 73 62 86 62 108 C 62 130 60 148 57 164" />
                      <path d="M 90 61 C 62 61 52 78 52 108 C 52 134 50 156 46 172" />
                      <path d="M 90 49 C 54 49 42 70 42 108 C 42 140 40 164 36 180" />

                      {/* Right loop arches */}
                      <path d="M 90 95 C 95 95 98 100 98 108 C 98 123 100 136 103 146" />
                      <path d="M 90 85 C 102 85 108 94 108 108 C 108 127 110 142 113 154" />
                      <path d="M 90 73 C 110 73 118 86 118 108 C 118 131 120 149 123 166" />
                      <path d="M 90 61 C 118 61 128 78 128 108 C 128 136 130 157 134 174" />
                      <path d="M 90 49 C 126 49 138 70 138 108 C 138 142 140 166 144 182" />

                      {/* Outer overarching biometric whorls */}
                      <path d="M 90 37 C 46 37 32 64 32 108 C 32 148 30 172 26 188" />
                      <path d="M 90 37 C 134 37 148 64 148 108 C 148 150 150 174 154 190" />
                      <path d="M 90 25 C 38 25 22 56 22 108 C 22 154 20 178 16 194" />
                      <path d="M 90 25 C 142 25 158 56 158 108 C 158 156 160 180 164 196" />

                      {/* Delta splits */}
                      <path d="M 88 118 C 89 128 90 138 90 150" />
                      <path d="M 84 130 C 86 142 88 154 89 165" />
                      <path d="M 96 130 C 94 142 92 154 91 165" />
                    </g>

                    {/* 2. Active Laser-Illuminated Fingerprint Ridges (Fluorescing Under Laser) */}
                    <g clipPath={`url(#fp-scan-clip-${id})`}>
                      <g
                        stroke={`url(#fp-laser-grad-${id})`}
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: "drop-shadow(0 0 7px rgba(16, 185, 129, 0.85))" }}
                      >
                        <path d="M 90 95 C 85 95 82 100 82 108 C 82 120 80 134 78 144" />
                        <path d="M 90 85 C 78 85 72 94 72 108 C 72 124 70 138 67 152" />
                        <path d="M 90 73 C 70 73 62 86 62 108 C 62 130 60 148 57 164" />
                        <path d="M 90 61 C 62 61 52 78 52 108 C 52 134 50 156 46 172" />
                        <path d="M 90 49 C 54 49 42 70 42 108 C 42 140 40 164 36 180" />
                        <path d="M 90 95 C 95 95 98 100 98 108 C 98 123 100 136 103 146" />
                        <path d="M 90 85 C 102 85 108 94 108 108 C 108 127 110 142 113 154" />
                        <path d="M 90 73 C 110 73 118 86 118 108 C 118 131 120 149 123 166" />
                        <path d="M 90 61 C 118 61 128 78 128 108 C 128 136 130 157 134 174" />
                        <path d="M 90 49 C 126 49 138 70 138 108 C 138 142 140 166 144 182" />
                        <path d="M 90 37 C 46 37 32 64 32 108 C 32 148 30 172 26 188" />
                        <path d="M 90 37 C 134 37 148 64 148 108 C 148 150 150 174 154 190" />
                        <path d="M 90 25 C 38 25 22 56 22 108 C 22 154 20 178 16 194" />
                        <path d="M 90 25 C 142 25 158 56 158 108 C 158 156 160 180 164 196" />
                        <path d="M 88 118 C 89 128 90 138 90 150" />
                        <path d="M 84 130 C 86 142 88 154 89 165" />
                        <path d="M 96 130 C 94 142 92 154 91 165" />
                      </g>
                    </g>

                    {/* 3. Glowing Laser Scanner Beam Oscillating Up & Down */}
                    <motion.g
                      animate={{ y: [22, 178, 22] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* Laser Trail Glow Polygon */}
                      <polygon
                        points="16,-18 164,-18 164,0 16,0"
                        fill={`url(#laser-trail-grad-${id})`}
                      />
                      {/* Primary Laser Line */}
                      <line
                        x1="14"
                        y1="0"
                        x2="166"
                        y2="0"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        style={{ filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.95))" }}
                      />
                      {/* Laser Beacon Optical Nodes */}
                      <circle cx="16" cy="0" r="2.5" fill="#34d399" />
                      <circle cx="164" cy="0" r="2.5" fill="#34d399" />
                    </motion.g>
                  </svg>
                </div>
              </div>

              {/* Biometric Status Telemetry Pill */}
              <div className="mt-3 flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SECURE LOCAL ENCLAVE
                </span>
              </div>

              <div className="mt-4 space-y-2 text-center">
                <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
                  Client-Side Privacy
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Your resume data, career history, and API keys stay exclusively on your device. Zero telemetry, zero model training.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ========================================================================= */}
          {/* Card 3: Instant Typst Engine (Sub-50ms AST Compilation Telemetry Pipeline)*/}
          {/* ========================================================================= */}
          <Card className="group relative col-span-full sm:col-span-3 lg:col-span-2 overflow-hidden border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-0.5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="pt-7 pb-7 flex flex-col justify-between h-full">
              {/* Telemetry Compilation Dashboard Visual */}
              <div className="rounded-xl border border-border/80 bg-muted/20 backdrop-blur-sm p-3.5 space-y-3">
                {/* Header benchmark readout */}
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-xs font-bold text-foreground">Typst Native AST</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/25">
                    34.2ms Total
                  </span>
                </div>

                {/* 3-Stage Compilation Flow */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 rounded-lg bg-background/80 border border-border/70 space-y-0.5">
                    <span className="text-[9px] font-mono text-muted-foreground block">Lexer</span>
                    <span className="text-[11px] font-mono font-bold text-blue-500">1.8ms</span>
                  </div>
                  <div className="p-2 rounded-lg bg-background/80 border border-border/70 space-y-0.5">
                    <span className="text-[9px] font-mono text-muted-foreground block">AST Layout</span>
                    <span className="text-[11px] font-mono font-bold text-indigo-500">14.2ms</span>
                  </div>
                  <div className="p-2 rounded-lg bg-background/80 border border-border/70 space-y-0.5">
                    <span className="text-[9px] font-mono text-muted-foreground block">600 DPI PDF</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-500">18.2ms</span>
                  </div>
                </div>

                {/* Live Speed vs Legacy Comparison Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                    <span className="text-foreground font-semibold flex items-center gap-1">
                      <Zap className="size-3 text-primary" /> LumaCV Typst
                    </span>
                    <span className="text-emerald-500 font-bold">34ms (Instant)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
                    <motion.div 
                      animate={{ width: ["20%", "28%", "20%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" 
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-muted-foreground/80 pt-0.5">
                    <span>Legacy LaTeX / Puppeteer</span>
                    <span className="text-muted-foreground">2,800ms (80x Slower)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-center">
                <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
                  Instant Typst Engine
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Sub-50ms deterministic AST compilation generates razor-sharp 600 DPI vector PDFs with zero cloud bottleneck.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ========================================================================= */}
          {/* Card 4: ATS-Engineered Precision (Clean ATS Scoring Evaluation Graph)     */}
          {/* ========================================================================= */}
          <Card className="group relative col-span-full lg:col-span-3 overflow-hidden border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-0.5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="grid pt-8 pb-7 sm:grid-cols-2 gap-6 items-center">
              <div className="relative z-10 flex flex-col justify-between space-y-8">
                <div className="relative flex aspect-square size-12 rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <ShieldCheck className="m-auto size-6" strokeWidth={1.75} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-xl text-foreground tracking-tight">
                    ATS-Engineered Scoring
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Calibrated keyword density and strict semantic hierarchies maximize parse scores on enterprise filters like Workday, Greenhouse, and Lever.
                  </p>
                </div>
              </div>

              {/* Clean, Elegant ATS Pass-Rate Evaluation Chart */}
              <div className="rounded-xl relative -mb-4 sm:-mb-6 -mr-4 sm:-mr-6 mt-2 border-l border-t border-border/80 p-4 sm:ml-4 bg-muted/10 overflow-hidden space-y-2.5">
                {/* Simulated macOS Traffic Lights & Title */}
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <div className="flex gap-1.5">
                    <span className="block size-2 rounded-full bg-rose-500/80" />
                    <span className="block size-2 rounded-full bg-amber-500/80" />
                    <span className="block size-2 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground flex items-center gap-1">
                    <Activity className="size-3 text-primary" />
                    ATS Parser Score Evaluation
                  </span>
                </div>

                {/* Vector Area Curve Graph */}
                <div className="relative pt-2">
                  <svg className="w-full h-36 overflow-visible" viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <defs>
                      <linearGradient id={`ats-area-grad-${id}`} x1="0" y1="20" x2="0" y2="140" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0071e3" stopOpacity="0.35" />
                        <stop offset="60%" stopColor="#0071e3" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#0071e3" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Benchmark Guide Lines */}
                    <line x1="0" y1="25" x2="320" y2="25" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" className="text-emerald-500/30" />
                    <text x="4" y="21" className="font-mono text-[8.5px] fill-emerald-500 font-bold">95%+ Interview Benchmark</text>

                    <line x1="0" y1="70" x2="320" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" className="text-border/60" />
                    <text x="4" y="66" className="font-mono text-[8.5px] fill-muted-foreground">75% Semantic Threshold</text>

                    <line x1="0" y1="115" x2="320" y2="115" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" className="text-rose-500/30" />
                    <text x="4" y="111" className="font-mono text-[8.5px] fill-rose-500/70">50% Filter Drop-off</text>

                    {/* Shaded Area Under Curve */}
                    <path
                      d="M 0 120 C 50 118, 90 95, 140 65 C 190 35, 240 22, 320 18 L 320 140 L 0 140 Z"
                      fill={`url(#ats-area-grad-${id})`}
                    />

                    {/* Primary Ascending Score Curve */}
                    <motion.path
                      initial={{ pathLength: 0.2 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                      d="M 0 120 C 50 118, 90 95, 140 65 C 190 35, 240 22, 320 18"
                      stroke="#0071e3"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Milestone Dot 1: Unoptimized Raw */}
                    <circle cx="35" cy="119" r="3.5" className="fill-rose-500 stroke-card stroke-2" />
                    
                    {/* Milestone Dot 2: Keyword Matched */}
                    <circle cx="140" cy="65" r="3.5" className="fill-blue-400 stroke-card stroke-2" />

                    {/* Milestone Dot 3: LumaCV ATS Engineered (Peak) */}
                    <circle cx="310" cy="18" r="5" className="fill-primary drop-shadow-[0_0_8px_rgba(0,113,227,1)]" />
                    <circle cx="310" cy="18" r="9" className="stroke-primary/40 stroke-2 animate-ping" />
                  </svg>

                  {/* Tooltip Tag At Peak */}
                  <div className="absolute top-1 right-2 bg-card/95 border border-primary/40 shadow-sm rounded-lg px-2 py-1 text-[10px] font-mono flex items-center gap-1.5 backdrop-blur-md">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-foreground">99.4% Parsed</span>
                    <span className="text-primary font-semibold">(Workday)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ========================================================================= */}
          {/* Card 5: Open-Source Community & Autonomy (Zero Line Overlap on Icons)     */}
          {/* ========================================================================= */}
          <Card className="group relative col-span-full lg:col-span-3 overflow-hidden border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-0.5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="grid h-full pt-8 pb-7 sm:grid-cols-2 gap-6 items-center">
              <div className="relative z-10 flex flex-col justify-between space-y-8">
                <div className="relative flex aspect-square size-12 rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Users className="m-auto size-6" strokeWidth={1.75} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-xl text-foreground tracking-tight">
                    By Candidates, For Everyone
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    100% free and open-source. Maintained transparently, backed by community contributors, and free from paywalls or data mining.
                  </p>
                </div>
              </div>

              {/* Segmented Timeline Spine: Segment lines connect exclusively BETWEEN nodes, 100% avoiding icon overlap */}
              <div className="relative mt-4 sm:mt-0 px-2 sm:px-4 sm:-my-4">
                <div className="relative z-10 flex h-full flex-col justify-center space-y-3 py-2">
                  
                  {/* Node 1: Sahil Bansal */}
                  <div className="relative flex w-[calc(50%+1rem)] items-center justify-end gap-2.5">
                    <span className="block h-fit rounded-lg border border-border/80 bg-card/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-2xs whitespace-nowrap">
                      Sahil Bansal • Lead
                    </span>
                    {/* Opaque solid mask container ensures zero line bleed */}
                    <div className="size-8 rounded-full bg-card dark:bg-[#15171c] ring-4 ring-card dark:ring-[#15171c] border border-primary/40 flex items-center justify-center text-primary text-[11px] font-bold shrink-0 z-20 shadow-xs">
                      SB
                    </div>
                  </div>

                  {/* Segmented Vertical Connector 1 */}
                  <div className="relative ml-[calc(50%-0.5px)] h-4 w-px bg-border/80 z-0">
                    <motion.div
                      animate={{ y: ["-100%", "200%"] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary to-transparent"
                    />
                  </div>

                  {/* Node 2: Typst Engine Ecosystem */}
                  <div className="relative ml-[calc(50%-1rem)] flex items-center gap-2.5">
                    {/* Opaque solid mask container ensures zero line bleed */}
                    <motion.div 
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="size-8 rounded-full bg-card dark:bg-[#15171c] ring-4 ring-card dark:ring-[#15171c] border border-emerald-500/40 flex items-center justify-center text-emerald-500 text-xs font-bold shrink-0 z-20 shadow-xs"
                    >
                      <Zap className="size-3.5" />
                    </motion.div>
                    <span className="block h-fit rounded-lg border border-border/80 bg-card/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-2xs whitespace-nowrap">
                      Typst Vector Core
                    </span>
                  </div>

                  {/* Segmented Vertical Connector 2 */}
                  <div className="relative ml-[calc(50%-0.5px)] h-4 w-px bg-border/80 z-0">
                    <motion.div
                      animate={{ y: ["-100%", "200%"] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: 1.2 }}
                      className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-rose-500 to-transparent"
                    />
                  </div>

                  {/* Node 3: Open-Source Backers */}
                  <div className="relative flex w-[calc(50%+1rem)] items-center justify-end gap-2.5">
                    <span className="block h-fit rounded-lg border border-border/80 bg-card/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-2xs whitespace-nowrap">
                      100% Free Forever
                    </span>
                    {/* Opaque solid mask container ensures zero line bleed */}
                    <motion.div 
                      animate={{ scale: [1, 1.25, 1, 1.18, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.8 }}
                      className="size-8 rounded-full bg-card dark:bg-[#15171c] ring-4 ring-card dark:ring-[#15171c] border border-rose-500/40 flex items-center justify-center text-rose-500 text-xs font-bold shrink-0 z-20 shadow-xs"
                    >
                      <Heart className="size-3.5 fill-rose-500 text-rose-500" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ========================================================================= */}
          {/* Card 6: Semantic JD Keyword Gap Matcher (Elevated Effects & Circular HUD)  */}
          {/* ========================================================================= */}
          <Card className="group relative col-span-full lg:col-span-2 overflow-hidden border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="pt-7 pb-7 flex flex-col justify-between h-full">
              {/* Telemetry Visual Card: Live ATS Circular Match HUD & Interactive Chips */}
              <div className="relative p-3.5 rounded-xl border border-border/80 bg-muted/20 backdrop-blur-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-primary animate-pulse" />
                    <span className="text-xs font-mono font-bold text-foreground">JD Gap Telemetry</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    98.4% Match
                  </span>
                </div>

                {/* Circular Radar Match Score Visual */}
                <div className="flex items-center gap-3.5 p-2 rounded-lg bg-background/80 border border-border/70">
                  {/* Mini Circular Progress Ring */}
                  <div className="relative size-12 shrink-0 flex items-center justify-center">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-border/60"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: "98, 100" }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="text-primary"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-mono text-[10.5px] font-bold text-foreground">98%</span>
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="text-[11px] font-semibold text-foreground block">Enterprise ATS Alignment</span>
                    <span className="text-[9.5px] font-mono text-muted-foreground block">Workday, Greenhouse & Lever 100% Pass</span>
                  </div>
                </div>

                {/* Micro keyword badges with green checkmarks */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-background border border-emerald-500/30 text-foreground font-medium flex items-center gap-1 shadow-2xs">
                    <Check className="size-2.5 text-emerald-500" />
                    TypeScript
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-background border border-emerald-500/30 text-foreground font-medium flex items-center gap-1 shadow-2xs">
                    <Check className="size-2.5 text-emerald-500" />
                    Kubernetes
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-background border border-emerald-500/30 text-foreground font-medium flex items-center gap-1 shadow-2xs">
                    <Check className="size-2.5 text-emerald-500" />
                    System Architecture
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-center">
                <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
                  JD Semantic Matcher
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Real-time job description gap analysis. Pinpoints exact missing keywords and refines terminology without fabricating qualifications.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ========================================================================= */}
          {/* Card 7: Universal Bi-directional Ingestion & Vector Export (Flowing Stream)*/}
          {/* ========================================================================= */}
          <Card className="group relative col-span-full sm:col-span-3 lg:col-span-2 overflow-hidden border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="pt-7 pb-7 flex flex-col justify-between h-full">
              {/* Dynamic Ingestion & Export Circuit Pipeline */}
              <div className="relative p-4 rounded-xl border border-border/80 bg-muted/20 backdrop-blur-sm space-y-3">
                <div className="flex items-center justify-between gap-1">
                  {/* Left: Input Ingestion Source */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/80 bg-card/90 shadow-2xs">
                    <FileCheck className="size-3.5 text-primary" />
                    <span className="text-[11px] font-mono font-bold text-foreground">PDF / JSON</span>
                  </div>

                  {/* Dynamic Flow Circuit Line 1 */}
                  <div className="relative flex-1 h-[2px] bg-border/80 mx-1 overflow-hidden">
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 bottom-0 w-6 bg-gradient-to-r from-transparent via-primary to-transparent"
                    />
                  </div>

                  {/* Center: Luma AST Converter Core */}
                  <div className="size-8 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center text-primary shrink-0 shadow-sm relative group-hover:scale-110 transition-transform">
                    <ArrowRightLeft className="size-3.5 animate-pulse" />
                  </div>

                  {/* Dynamic Flow Circuit Line 2 */}
                  <div className="relative flex-1 h-[2px] bg-border/80 mx-1 overflow-hidden">
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: 0.9 }}
                      className="absolute top-0 bottom-0 w-6 bg-gradient-to-r from-transparent via-teal-400 to-transparent"
                    />
                  </div>

                  {/* Right: Output Vector Target */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/80 bg-card/90 shadow-2xs">
                    <Layers className="size-3.5 text-teal-500" />
                    <span className="text-[11px] font-mono font-bold text-foreground">600 DPI</span>
                  </div>
                </div>

                {/* Status Telemetry Banner */}
                <div className="p-2 rounded-lg bg-background/80 border border-border/70 flex items-center justify-between text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 text-foreground font-semibold">
                    <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
                    Lossless Roundtrip
                  </span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">100% Fidelity</span>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-center">
                <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
                  Universal Ingestion & Export
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Never trapped in proprietary silos. Seamlessly import existing PDFs or LinkedIn data, then export pure Typst source code or vector PDFs.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ========================================================================= */}
          {/* Card 8: Browser-Native WASM Engine (Interactive macOS IDE Experience)     */}
          {/* ========================================================================= */}
          <Card className="group relative col-span-full sm:col-span-3 lg:col-span-2 overflow-hidden border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="pt-7 pb-7 flex flex-col justify-between h-full">
              {/* Full macOS Dark IDE Terminal Preview */}
              <div className="relative rounded-xl border border-zinc-800/80 bg-zinc-950 text-zinc-200 font-mono text-[11px] shadow-md space-y-2 overflow-hidden p-3.5">
                {/* macOS Window Title Bar */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex gap-1.5">
                    <span className="size-2 rounded-full bg-rose-500/80" />
                    <span className="size-2 rounded-full bg-amber-500/80" />
                    <span className="size-2 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[9.5px] text-zinc-400 font-semibold flex items-center gap-1">
                    <Cpu className="size-3 text-amber-400" />
                    main.typ • WASM Core
                  </span>
                </div>

                {/* Syntax-Highlighted Code Editor Lines */}
                <div className="space-y-0.5 text-left text-[10px] leading-relaxed">
                  <div className="text-zinc-500">
                    <span className="text-zinc-600 mr-2 select-none">1</span>
                    <span className="text-blue-400">#import</span> <span className="text-emerald-300">&quot;@preview/lumacv&quot;</span>: *
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-zinc-600 mr-2 select-none">2</span>
                    <span className="text-blue-400">#show</span>: resume.with(<span className="text-amber-300">theme</span>: <span className="text-emerald-300">&quot;cobalt&quot;</span>)
                  </div>
                  <div className="text-zinc-300 bg-zinc-900/60 -mx-1.5 px-1.5 rounded">
                    <span className="text-zinc-600 mr-2 select-none">3</span>
                    <span className="text-purple-400">#header</span>(name: <span className="text-emerald-300">&quot;Alex Morgan&quot;</span>)
                  </div>
                </div>

                {/* Compilation Benchmark Status Footer */}
                <div className="border-t border-zinc-800/90 pt-2 flex items-center justify-between text-[9.5px] text-zinc-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                    AST 16.4ms
                  </span>
                  <span className="text-zinc-400">Zero Cloud Latency</span>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-center">
                <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
                  Browser-Native WebAssembly
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  No Docker, no Python, no Node.js required. The full Rust-powered Typst engine executes entirely within your browser via WASM.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}

export default Features;
