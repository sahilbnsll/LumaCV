"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cpu, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { Loader } from "@/components/ui/loader";
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
  const [elapsedMs, setElapsedMs] = useState(38);
  const reducedMotion = useReducedMotion();

  // Throttled millisecond timer simulation: updates at 120ms intervals to prevent 20+ re-renders/sec
  useEffect(() => {
    if (reducedMotion) return;
    const start = performance.now();
    const interval = setInterval(() => {
      setElapsedMs(Math.round(performance.now() - start));
    }, 120);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Cycle compilation micro-stages smoothly
  useEffect(() => {
    if (reducedMotion) return;
    const cycleInterval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % COMPILATION_PHASES.length);
    }, 520);
    return () => clearInterval(cycleInterval);
  }, [reducedMotion]);

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
        "bg-background/60 backdrop-blur-[4px]",
        className
      )}
    >
      {/* Ambient Typst Mathematical Blueprint Grid, faint texture only, no
          laser-sweep / LiDAR-crosshair "document scanner" cliché. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[linear-gradient(to_right,#0071e3_1px,transparent_1px),linear-gradient(to_bottom,#0071e3_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.04] dark:opacity-[0.07]" />

      {/* Floating Holographic Synthesis HUD Capsule */}
      <motion.div
        initial={{ scale: 0.92, y: 8, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: -4, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-md w-full rounded-2xl border border-border bg-card/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl pointer-events-auto space-y-4"
      >
        {/* Top Bar: Engine Status & Telemetry Counter */}
        <div className="flex items-center justify-between border-b border-border pb-3">
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
          {/* Holographic Synthesis Core */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <Loader variant="helix" size={48} speed={0.9} className="text-primary dark:text-cyan-400" />
            <div className="absolute w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center shadow-[0_0_15px_#0071e3] text-white">
              <Zap className="h-3 w-3 fill-white" />
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
