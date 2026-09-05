"use client";

import React from "react";
import { MorphingCardStack, Component, type CardData } from "@/components/ui/morphing-card-stack";
import { Zap, ShieldCheck, Target, KeyRound, EyeOff, FileCode2 } from "lucide-react";

export const lumacvEngineCards: CardData[] = [
  {
    id: "1",
    title: "Typst Vector Engine",
    tag: "<50ms Native AST",
    badge: "600 DPI Vector",
    description: "Deterministic typesetting compiled directly via native Rust Typst binaries. Delivers crisp, hyper-legible vector PDFs with zero browser rendering overhead or formatting drift.",
    icon: <Zap className="h-5 w-5 text-primary" />,
  },
  {
    id: "2",
    title: "Factual Integrity Shield",
    tag: "Anti-Hallucination",
    badge: "100% Ground Truth",
    description: "Extracts an immutable fact graph from your real experience. Mathematically blocks AI bullet rewrites from fabricating ungrounded tools, metrics, or certifications.",
    icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: "3",
    title: "ATS Semantic Matcher",
    tag: "Enterprise Parser",
    badge: "Taleo · Workday",
    description: "Multi-layered entity parsing analyzes keyword density, section taxonomy, and chronological continuity against Fortune 500 recruitment algorithms.",
    icon: <Target className="h-5 w-5 text-cyan-400" />,
  },
  {
    id: "4",
    title: "Client-Side BYOK Engine",
    tag: "Zero SaaS Markup",
    badge: "OpenAI · Claude · Gemini",
    description: "Direct browser-to-provider streaming via your personal API keys. You pay fractions of a cent per resume directly to providers without any recurring monthly subscriptions.",
    icon: <KeyRound className="h-5 w-5 text-amber-400" />,
  },
  {
    id: "5",
    title: "Total Data Sovereignty",
    tag: "Zero Telemetry",
    badge: "100% Private Local DB",
    description: "Your drafts, career history, and credentials stay securely in your browser. No third-party tracking pixels, no telemetry, and full one-click Docker self-hosting support.",
    icon: <EyeOff className="h-5 w-5 text-rose-400" />,
  },
  {
    id: "6",
    title: "Native Typst AST & Export",
    tag: "Full Code Ownership",
    badge: "Typst + PDF + LaTeX",
    description: "Download raw Typst source code, version-control your career in Git, or compile directly from your terminal using the open-source Typst CLI ecosystem.",
    icon: <FileCode2 className="h-5 w-5 text-violet-400" />,
  },
];

// Aliases for compatibility
export const lumacvCardData = lumacvEngineCards;
export const cardData = lumacvEngineCards;

export function DemoOne() {
  return <Component cards={lumacvEngineCards} defaultLayout="stack" />;
}

export default function MorphingCardStackDemo() {
  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <MorphingCardStack cards={lumacvEngineCards} defaultLayout="stack" />
    </div>
  );
}
