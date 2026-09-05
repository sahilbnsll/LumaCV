"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Zap, ShieldCheck, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypstCompileVisualizerProps {
  templateName?: string;
  themeName?: string;
  className?: string;
}

const COMPILATION_PHASES = [
  { text: "Parsing Typst AST & Document Nodes", icon: Cpu, color: "text-primary" },
  { text: "Calculating Sub-millimeter Typography", icon: Sparkles, color: "text-cyan-500" },
  { text: "Validating ATS Linear Parseability", icon: ShieldCheck, color: "text-emerald-500" },
  { text: "Emitting Pure Vector PDF Buffers", icon: Zap, color: "text-indigo-500" },
];

export function TypstCompileVisualizer({
  templateName = "Standard",
  themeName = "default",
  className,
}: TypstCompileVisualizerProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Millisecond timer simulation for live telemetry feel
  useEffect(() => {
    const start = performance.now();
    const interval = setInterval(() => {
      setElapsedMs(Math.round(performance.now() - start));
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // Cycle compilation micro-stages
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % COMPILATION_PHASES.length);
    }, 450);
    return () => clearInterval(cycleInterval);
  }, []);

  const activePhase = COMPILATION_PHASES[phaseIndex];
  const ActiveIcon = activePhase.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "absolute inset-0 z-30 flex flex-col items-center justify-center p-4 overflow-hidden pointer-events-none",
        "bg-slate-900/35 dark:bg-black/55 backdrop-blur-[4px]",
        className
      )}
    >
      {/* 1. Full-Height Sweeping Laser Scanner Beam */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sweeping Laser Line with Neon Blur Glow */}
        <motion.div
          animate={{ y: ["-10%", "110%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 dark:via-cyan-300 to-transparent shadow-[0_0_15px_#0071e3,0_0_35px_#38bdf8]"
        />

        {/* Luminous Light Cone behind the beam */}
        <motion.div
          animate={{ y: ["-10%", "110%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-0 h-28 -top-28 bg-gradient-to-b from-transparent to-primary/10 dark:to-primary/20 pointer-events-none"
        />

        {/* Ambient Typst Mathematical Blueprint Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0071e3_1px,transparent_1px),linear-gradient(to_bottom,#0071e3_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.04] dark:opacity-[0.07]" />
      </div>

      {/* 2. Precision Corner Alignment Crosshairs (LiDAR Scanner Visual) */}
      <div className="absolute inset-6 pointer-events-none">
        {/* Top-Left */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary/70 dark:border-cyan-400/80 rounded-tl-sm" />
        {/* Top-Right */}
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary/70 dark:border-cyan-400/80 rounded-tr-sm" />
        {/* Bottom-Left */}
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary/70 dark:border-cyan-400/80 rounded-bl-sm" />
        {/* Bottom-Right */}
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary/70 dark:border-cyan-400/80 rounded-br-sm" />
      </div>

      {/* 3. Floating Holographic Synthesis HUD Capsule */}
      <motion.div
        initial={{ scale: 0.92, y: 8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: -4, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-md w-full rounded-2xl border border-border/80 dark:border-white/15 bg-background/95 dark:bg-[#0f1117]/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl pointer-events-auto space-y-4"
      >
        {/* Top Bar: Engine Status & Telemetry Counter */}
        <div className="flex items-center justify-between border-b border-border/50 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs font-semibold font-display text-foreground tracking-tight">
              Typst Native Vector Synthesis
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded-md bg-muted/60 dark:bg-white/5 text-primary font-semibold">
            <span>{elapsedMs}ms</span>
          </div>
        </div>

        {/* Center: Dual-Orbit Holographic Reactor + Document Simulation */}
        <div className="flex items-center gap-4 py-1">
          {/* Orbital Quantum Reactor */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            {/* Outer Orbital Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40 dark:border-cyan-400/40 animate-spin [animation-duration:6s]" />
            {/* Inner Counter-Rotating Ring */}
            <div className="absolute inset-1.5 rounded-full border-2 border-dotted border-indigo-400/50 [animation-direction:reverse] animate-spin [animation-duration:3.5s]" />
            {/* Glowing Core */}
            <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center shadow-[0_0_15px_#0071e3] text-white">
              <Zap className="h-3.5 w-3.5 fill-white" />
            </div>
          </div>

          {/* Phase Narrative */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phaseIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 min-w-0"
                >
                  <ActiveIcon className={cn("h-3.5 w-3.5 shrink-0", activePhase.color)} />
                  <span className="text-xs font-semibold text-foreground truncate">
                    {activePhase.text}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Compiling {templateName} with active {themeName} palette. Sub-50ms vector rendering.
            </p>
          </div>
        </div>

        {/* Bottom Progress Wave Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="h-1.5 w-full rounded-full bg-muted/60 dark:bg-white/5 overflow-hidden relative">
            <motion.div
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-full w-2/5 rounded-full bg-gradient-to-r from-transparent via-primary to-cyan-400 shadow-[0_0_8px_#0071e3]"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>Deterministic Layout</span>
            <span className="text-emerald-500 font-medium flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5" />
              100% Vector PDF
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TypstCompileVisualizer;
