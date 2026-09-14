"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Check,
  Copy,
  Server,
  Code2,
  Database,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Scenario Definitions ──────────────────────────────────────────────────────

interface Scenario {
  id: string;
  role: string;
  category: string;
  icon: React.ElementType;
  original: string;
  grounded: {
    text: string;
    principle: string;
    actionVerb: string;
    tangibleDeliverable: string;
    activeScore: number;
    hallucinationRisk: string;
  };
  hallucinated: {
    text: string;
    inventedClaims: string[];
    riskLevel: "HIGH" | "CRITICAL";
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: "devops",
    role: "Senior Infrastructure Engineer",
    category: "Cloud & DevOps",
    icon: Server,
    original: "Worked on container deployment pipeline and helped team members.",
    grounded: {
      text: "Maintained container deployment pipelines and authored migration runbooks for internal platform engineering teams.",
      principle: "Replaced generic verb 'worked on' with active ownership ('Maintained') and clarified tangible deliverables ('authored migration runbooks') without inventing fake percentage gains.",
      actionVerb: "Maintained",
      tangibleDeliverable: "authored migration runbooks",
      activeScore: 96,
      hallucinationRisk: "0.0%",
    },
    hallucinated: {
      text: "Spearheaded enterprise Kubernetes architecture across 4,500 nodes, slashing cloud spend by 68% and generating $4.2M in annual cost savings.",
      inventedClaims: [
        "Fabricated '4,500 nodes' scale",
        "Invented '68% cloud spend' metric",
        "Fabricated '$4.2M annual cost savings'",
      ],
      riskLevel: "CRITICAL",
    },
  },
  {
    id: "frontend",
    role: "Senior Frontend Engineer",
    category: "Web & UI Systems",
    icon: Code2,
    original: "Made the dashboard faster and fixed several UI bugs using React and TypeScript.",
    grounded: {
      text: "Refactored dashboard state management to eliminate redundant re-renders, resolving high-priority accessibility and rendering bottlenecks in React.",
      principle: "Articulated exact technical mechanisms ('state refactoring', 'eliminating redundant renders') without claiming unmeasured or unverified millisecond drops.",
      actionVerb: "Refactored",
      tangibleDeliverable: "eliminated redundant re-renders",
      activeScore: 98,
      hallucinationRisk: "0.0%",
    },
    hallucinated: {
      text: "Revolutionized user engagement by 320% through bespoke Next.js micro-frontends, accelerating company valuation to $50M Series B.",
      inventedClaims: [
        "Invented '320% user engagement' metric",
        "Fabricated '$50M Series B valuation' impact",
        "Hallucinated company-level funding causation",
      ],
      riskLevel: "CRITICAL",
    },
  },
  {
    id: "data",
    role: "Staff Data Platform Engineer",
    category: "Data & Analytics",
    icon: Database,
    original: "Handled database queries and created daily ETL reports for stakeholders.",
    grounded: {
      text: "Engineered scheduled ETL transformation jobs in PostgreSQL and automated daily reporting pipelines for business stakeholders.",
      principle: "Elevated technical vocabulary ('scheduled ETL transformations', 'automated daily pipelines') while staying 100% faithful to the candidate's actual database scope.",
      actionVerb: "Engineered",
      tangibleDeliverable: "automated daily reporting pipelines",
      activeScore: 95,
      hallucinationRisk: "0.0%",
    },
    hallucinated: {
      text: "Architected real-time petabyte-scale streaming lakehouse ingesting 10B events/sec with zero downtime, driving 12x predictive accuracy.",
      inventedClaims: [
        "Fabricated 'petabyte-scale streaming'",
        "Invented '10B events/sec' throughput",
        "Invented '12x predictive accuracy' claim",
      ],
      riskLevel: "CRITICAL",
    },
  },
];

export function FactPreservingAiShowcase() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("devops");
  const [viewMode, setViewMode] = useState<"grounded" | "hallucinated">("grounded");
  const [isApplied, setIsApplied] = useState(false);
  const [copied, setCopied] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  const handleScenarioChange = (id: string) => {
    setSelectedScenarioId(id);
    setIsApplied(false);
    setCopied(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-transparent text-foreground overflow-hidden"
    >
      {/* Subtle fine dot matrix pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(120,120,120,0.15) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />

      <div className="relative max-w-marketing mx-auto space-y-9">

        {/* ── Editorial Header ── */}
        <div
          className="max-w-3xl space-y-3"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.12]">
            Strengthen your phrasing.{" "}
            <span className="text-muted-foreground font-medium">
              Never fabricate facts.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            Generic AI models frequently invent statistics and claim unverified impact. LumaCV
            constrains rewriting strictly to grammar, precision, and verified technical scope.
          </p>
        </div>

        {/* ── Workstation Mockup Window Stage ── */}
        <div
          className="rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
        >
          
          {/* Window Chrome Header */}
          <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="ml-2 text-xs font-mono text-muted-foreground truncate max-w-[140px] sm:max-w-none">
                LumaCV Workstation – Alex-Morgan-Resume.typ
              </span>
            </div>

            {/* Right: Role Scenarios Tabs */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/40">
                {SCENARIOS.map((sc) => {
                  const Icon = sc.icon;
                  const active = sc.id === selectedScenarioId;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleScenarioChange(sc.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-[background-color,color,border-color,box-shadow] cursor-pointer ${
                        active
                          ? "bg-background text-foreground shadow-xs border border-border/60"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Icon className={`w-3 h-3 ${active ? "text-foreground" : "text-muted-foreground"}`} />
                      <span>{sc.category}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground font-mono pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span>Vector Ready</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 space-y-6">

            {/* Current Scenario Info Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground font-medium">
                  Active Resume Entry • {scenario.category}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight mt-0.5">
                  {scenario.role}
                </h3>
              </div>

              {/* Contrast Switcher: Grounded vs Generic AI */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/70 border border-border self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("grounded")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-[background-color,color,border-color,box-shadow] cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "grounded"
                      ? "bg-background text-foreground border border-border shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
                  <span>LumaCV Grounded</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("hallucinated")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-[background-color,color,border-color,box-shadow] cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "hallucinated"
                      ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Generic AI (Hallucinated)</span>
                </button>
              </div>
            </div>

            {/* ── Main Comparison Stage: Side by Side or Interactive Diff ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

              {/* LEFT: Candidate's Original Raw Bullet (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-border bg-card/60 p-4 sm:p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      Original Input
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border">
                      Passive Phrasing
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                    <p className="text-sm text-foreground leading-relaxed font-sans">
                      • {scenario.original}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1 pt-1">
                    <p className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500/70" />
                      <span>Weak action verbs detected (e.g. <em>worked on</em>, <em>helped</em>)</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                      <span>Missing tangible engineering artifact & scope</span>
                    </p>
                  </div>
                </div>

                {/* Simulated action to toggle apply on current text */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Candidate Raw Evidence</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(scenario.original)}
                    className="hover:text-foreground font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* RIGHT: Selected View Mode: LumaCV Grounded vs Dangerous Generic AI (7 cols) */}
              <div className="lg:col-span-7">
                <AnimatePresence mode="wait">
                  {viewMode === "grounded" ? (
                    /* ── LUMACV GROUNDED PANEL ── */
                    <motion.div
                      key="grounded"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5 space-y-4 shadow-xl"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-muted text-foreground">
                            <Sparkles className="w-4 h-4 text-foreground" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-foreground tracking-wide uppercase font-mono">
                              LumaCV Grounding Recommendation
                            </span>
                            <p className="text-[11px] text-muted-foreground">Verified active voice, zero fake statistics</p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-muted/60 text-foreground border border-border">
                          <CheckCircle2 className="w-3 h-3 text-foreground" />
                          <span>Truth Score: 100%</span>
                        </span>
                      </div>

                      {/* Transformed Bullet Display */}
                      <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] font-mono text-muted-foreground">
                          <span>Synthesized Bullet Statement</span>
                          {isApplied && (
                            <span className="text-foreground font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Applied to Studio</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
                          • {scenario.grounded.text}
                        </p>
                      </div>

                      {/* Grounding Principles Breakdown */}
                      <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <strong className="text-muted-foreground font-mono uppercase tracking-wider shrink-0 mt-0.5">
                            Rule:
                          </strong>
                          <p className="text-foreground leading-relaxed">
                            {scenario.grounded.principle}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border font-mono text-[11px]">
                          <div>
                            <span className="text-muted-foreground block">Active Verb:</span>
                            <span className="text-foreground font-semibold">{scenario.grounded.actionVerb}</span>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            {/* Deliverable values ("authored migration runbooks",
                                etc.) run longer than Active Verb's single word,
                                and on mobile this cell only got half the row's
                                width (grid-cols-2), so `truncate` was cutting it
                                mid-word ("authored migratio…"). Full width + wrap
                                on mobile instead, matching how Fake Metrics
                                already spans the row. */}
                            <span className="text-muted-foreground block">Deliverable:</span>
                            <span className="text-foreground font-medium block">{scenario.grounded.tangibleDeliverable}</span>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-muted-foreground block">Fake Metrics:</span>
                            <span className="text-foreground font-semibold">0 Detected (Safe)</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        {/* The outer row already wrapped, but this inner pair
                            (Apply/Reset + Copy phrasing) didn't, so the two
                            buttons together were wider than the mobile card
                            and "Copy phrasing" ran past its right edge. */}
                        <div className="flex flex-wrap items-center gap-2">
                          {!isApplied ? (
                            <Button
                              onClick={() => setIsApplied(true)}
                              className="h-9 px-4 text-xs font-semibold rounded-xl bg-foreground hover:bg-foreground/90 text-background gap-2 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-[color,background-color,border-color,box-shadow,transform]"
                            >
                              <span>Apply wording to studio</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => setIsApplied(false)}
                              className="h-9 px-3.5 text-xs font-medium rounded-xl border-border text-foreground bg-card hover:bg-muted gap-2 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset wording</span>
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            onClick={() => handleCopy(scenario.grounded.text)}
                            className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground rounded-xl gap-1.5 cursor-pointer"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-foreground" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? "Copied!" : "Copy phrasing"}</span>
                          </Button>
                        </div>

                        <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                          Audited by Typst ATS Engine
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── DANGEROUS GENERIC AI PANEL (Contrast mode) ── */
                    <motion.div
                      key="hallucinated"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-2xl border border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/[0.14] p-4 sm:p-5 space-y-4 shadow-[0_15px_40px_rgba(244,63,94,0.12)]"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-rose-500/20">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tracking-wide uppercase font-mono">
                              Generic LLM / ChatGPT Resume Output
                            </span>
                            <p className="text-[11px] text-muted-foreground">Common pitfalls from unsupervised AI prompting</p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Interview Risk: CRITICAL</span>
                        </span>
                      </div>

                      {/* Hallucinated Bullet Display */}
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                        <div className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-medium">
                          Fabricated Resume Statement (Unverifiable in background checks)
                        </div>
                        <p className="text-sm sm:text-base font-medium text-rose-950 dark:text-rose-100 leading-relaxed">
                          • {scenario.hallucinated.text}
                        </p>
                      </div>

                      {/* Flagged Hallucinations */}
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold font-mono text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>LumaCV Guardrails Flagged 3 Severe Vulnerabilities:</span>
                        </div>
                        <ul className="space-y-1.5 pl-5 list-disc text-foreground/90 text-xs leading-relaxed">
                          {scenario.hallucinated.inventedClaims.map((claim, idx) => (
                            <li key={idx} className="text-rose-900 dark:text-rose-200/90">
                              <span className="font-medium text-rose-700 dark:text-rose-300">{claim}</span>, candidate never stated this metric in raw inputs.
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Call to switch back */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <Button
                          onClick={() => setViewMode("grounded")}
                          variant="invert"
                          className="h-9 px-4 text-xs font-semibold gap-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-background" />
                          <span>Switch back to Fact-Preserving AI</span>
                        </Button>

                        <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400/90">
                          ⚠️ Never submit unverified AI claims to recruiters
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* ── Subtext & Direct Navigation Footer ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-border gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <span className="size-1.5 rounded-full bg-zinc-400" />
                <span>AI optimization in LumaCV is strictly optional, transparent, and candidate-governed.</span>
              </div>
              
              <Link
                href="/builder"
                className="text-foreground/80 hover:text-foreground font-medium inline-flex items-center gap-1.5 transition-colors group"
              >
                <span>Launch Studio & try with your resume</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
