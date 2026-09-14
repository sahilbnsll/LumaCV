"use client";

import React, { useState, useEffect } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { SPRING_PRESETS } from "@/lib/motion";
import { notify } from "@/lib/notify";
import { exportResume } from "@/lib/resume-export";
import { ResumeData } from "@/lib/resume-schema";
import { cn } from "@/lib/utils";

export interface FormatOption {
  id: "pdf" | "docx" | "md" | "json";
  ext: string;
  name: string;
  label: string;
  desc: string;
  recommended?: boolean;
  color: {
    bg: string;
    text: string;
    subtext: string;
    btnBg: string;
    btnHover: string;
    btnText: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    radioColor: string;
    ringColor: string;
  };
}

export const FORMATS: FormatOption[] = [
  {
    id: "pdf",
    ext: ".pdf",
    name: "Adobe PDF Document",
    label: "PDF",
    recommended: true,
    desc: "100% vector, selectable text, strict page budget, and universal ATS compatibility.",
    color: {
      bg: "#E5252A", // Official Adobe Acrobat / PDF Brand Red
      text: "#FFFFFF",
      subtext: "rgba(255, 255, 255, 0.85)",
      btnBg: "#E5252A",
      btnHover: "#C91C21",
      btnText: "#FFFFFF",
      badgeBg: "rgba(229, 37, 42, 0.15)",
      badgeBorder: "rgba(229, 37, 42, 0.45)",
      badgeText: "#EF4444",
      radioColor: "#E5252A",
      ringColor: "rgba(229, 37, 42, 0.4)",
    },
  },
  {
    id: "docx",
    ext: ".docx",
    name: "Microsoft Word Document",
    label: "Word",
    desc: "Editable document format compatible with Microsoft Word and Google Docs.",
    color: {
      bg: "#185ABD", // Official Microsoft Word 365 Brand Blue
      text: "#FFFFFF",
      subtext: "rgba(255, 255, 255, 0.85)",
      btnBg: "#185ABD",
      btnHover: "#124B99",
      btnText: "#FFFFFF",
      badgeBg: "rgba(24, 90, 189, 0.15)",
      badgeBorder: "rgba(24, 90, 189, 0.45)",
      badgeText: "#3B82F6",
      radioColor: "#185ABD",
      ringColor: "rgba(24, 90, 189, 0.4)",
    },
  },
  {
    id: "md",
    ext: ".md",
    name: "Plain Markdown",
    label: "Markdown",
    desc: "Clean markdown formatted for developer portfolios, GitHub, and LLM ingestion.",
    color: {
      bg: "#083C5D", // Official Markdown Mark Canonical Navy
      text: "#FFFFFF",
      subtext: "rgba(255, 255, 255, 0.85)",
      btnBg: "#083C5D",
      btnHover: "#062E47",
      btnText: "#FFFFFF",
      badgeBg: "rgba(8, 60, 93, 0.25)",
      badgeBorder: "rgba(56, 189, 248, 0.45)",
      badgeText: "#38BDF8",
      radioColor: "#38BDF8",
      ringColor: "rgba(56, 189, 248, 0.4)",
    },
  },
  {
    id: "json",
    ext: ".json",
    name: "Standard JSON Resume",
    label: "JSON",
    desc: "Structured JSON schema for data portability, backups, and programmatic pipelines.",
    color: {
      bg: "#F59E0B", // Official JSON / ECMA-404 Amber Gold
      text: "#0F172A",
      subtext: "rgba(15, 23, 42, 0.8)",
      btnBg: "#F59E0B",
      btnHover: "#D97706",
      btnText: "#0F172A",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeBorder: "rgba(245, 158, 11, 0.45)",
      badgeText: "#F59E0B",
      radioColor: "#F59E0B",
      ringColor: "rgba(245, 158, 11, 0.4)",
    },
  },
];

export function ExportFormatShowcase() {
  // Default to PDF to match primary workflow
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>(FORMATS[0]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [candidate, setCandidate] = useState({
    name: "Alex Morgan",
    title: "Product designer",
  });

  // Listen for real-time candidate updates from hero or workstation editor
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ name?: string; title?: string }>;
      if (custom.detail) {
        setCandidate((prev) => ({
          name: custom.detail?.name?.trim() || prev.name,
          title: custom.detail?.title?.trim() || prev.title,
        }));
      }
    };
    window.addEventListener("lumacv:candidate-updated", handler);
    return () => window.removeEventListener("lumacv:candidate-updated", handler);
  }, []);

  const selectedIndex = FORMATS.findIndex((f) => f.id === selectedFormat.id);
  const cycleFormat = (direction: 1 | -1) => {
    const next = (selectedIndex + direction + FORMATS.length) % FORMATS.length;
    setSelectedFormat(FORMATS[next]);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const sampleResumeData = {
        personalInfo: {
          name: candidate.name || "Alex Morgan",
          title: candidate.title || "Product designer",
          email: `${(candidate.name || "alex.morgan").toLowerCase().replace(/\s+/g, ".")}@domain.com`,
          phone: "+1 (415) 555-0192",
          location: "San Francisco, CA",
          portfolio: `https://portfolio.${(candidate.name || "alexmorgan").toLowerCase().replace(/\s+/g, "")}.design`,
        },
        summary: "Lead Product Designer specializing in design systems, component architecture, and developer-focused user experiences.",
        experience: [
          {
            id: "exp-1",
            company: "Linear Systems",
            title: "Staff Product Designer",
            location: "San Francisco, CA",
            dates: "2022 - Present",
            startDate: "2022-01",
            endDate: "Present",
            bullets: [
              "Architected cross-platform design token engine powering web, desktop, and mobile applications.",
              "Reduced customer issue triage latency by 42% through structured keyboard-first command menus.",
            ],
          },
          {
            id: "exp-2",
            company: "Vercel Inc.",
            title: "Senior UI/UX Engineer",
            location: "Remote",
            dates: "2020 - 2021",
            startDate: "2020-03",
            endDate: "2021-12",
            bullets: [
              "Designed vector SVG chart rendering pipeline used by 1.2M monthly developers.",
              "Authored accessibility standards achieving 100% WCAG AAA rating across core console pages.",
            ],
          },
        ],
        education: [
          {
            id: "edu-1",
            institution: "Rhode Island School of Design",
            degree: "Bachelor of Fine Arts",
            fieldOfStudy: "Graphic & Interface Design",
            dates: "2015 - 2019",
            location: "Providence, RI",
            startDate: "2015-09",
            endDate: "2019-05",
            gpa: "3.92",
          },
        ],
        skills: [
          {
            id: "sk-1",
            category: "Core Design",
            items: "Design Systems, Figma, Typographic Hierarchy, Micro-Interactions, Spatial Prototyping",
          },
          {
            id: "sk-2",
            category: "Frontend Engineering",
            items: "React, TypeScript, Next.js, Tailwind CSS, Framer Motion, WebGL",
          },
        ],
        projects: [],
        certifications: [],
        languages: [],
        interests: [],
      };

      await exportResume({
        resumeData: sampleResumeData as unknown as ResumeData,
        format: selectedFormat.id,
        template: "modern",
        theme: { color: "cobalt" },
        customFilename: `${(candidate.name || "alex-morgan").toLowerCase().replace(/\s+/g, "-")}-resume`,
      });
    } catch {
      notify.error("Download failed", "Please try again");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section
      className="scroll-mt-[30px] pt-16 pb-24 sm:pt-24 sm:pb-32 bg-transparent text-foreground relative overflow-hidden"
      id="export"
      aria-labelledby="export-title"
    >
      {/* Background Ghost Wireframes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 left-1/4 w-[340px] h-[480px] rounded-2xl border border-border/20 rotate-[-8deg]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 right-[10%] w-[320px] h-[460px] rounded-2xl border border-border/20 rotate-[14deg]"
      />

      <div className="relative mx-auto max-w-marketing px-6 sm:px-8">

        {/* Editorial Heading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 sm:mb-20 items-end">
          <div>
            <h2
              id="export-title"
              className="font-semibold text-display-xl text-foreground"
            >
              Export in
              <br />
              whatever format wins.
            </h2>
          </div>
          <div className="lg:pl-8 flex lg:justify-end">
            <p className="text-muted-foreground text-[15px] leading-relaxed max-w-[420px]">
              PDF for the ATS, DOCX when someone asks for edits, and Markdown or JSON if you're feeding it into your own tooling.
            </p>
          </div>
        </div>

        {/* 2-Column Composition (Left Card Fan • Right Format Rows) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ── Left Column: Physical Layered Card Fan ─────────────── */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-[270px] sm:w-[310px] aspect-[1/1.4] select-none">
              {/* Real deck-shuffle: every format is its own permanent card
                  (never remounted, never content-swapped) parked at a "slot"
                  position computed from its distance behind the selected one.
                  Changing selectedFormat just moves the slot targets, front
                  springs back and fades toward the rear, the next-up card
                  springs up to the front, exactly like fanning a real deck.
                  Only the front card is draggable/interactive. */}
              {FORMATS.map((fmt, i) => {
                const slot = (i - selectedIndex + FORMATS.length) % FORMATS.length;
                const isFront = slot === 0;
                const slotStyle = [
                  { x: 0, y: 0, rotate: -2, scale: 1, opacity: 1 },
                  { x: -10, y: 8, rotate: -6, scale: 0.96, opacity: 1 },
                  { x: -20, y: 16, rotate: -10, scale: 0.92, opacity: 0.85 },
                  { x: -30, y: 24, rotate: -14, scale: 0.88, opacity: 0.6 },
                ][slot];

                return (
                  <motion.div
                    key={fmt.id}
                    drag={isFront ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.55}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -60 || info.velocity.x < -400) cycleFormat(1);
                      else if (info.offset.x > 60 || info.velocity.x > 400) cycleFormat(-1);
                    }}
                    animate={{
                      ...slotStyle,
                      backgroundColor: fmt.color.bg,
                      color: fmt.color.text,
                    }}
                    whileHover={isFront ? { rotate: 0, scale: 1.03, y: -6 } : undefined}
                    whileDrag={isFront ? { rotate: 0, scale: 1.02, cursor: "grabbing" } : undefined}
                    transition={SPRING_PRESETS.snappy}
                    style={{ zIndex: 40 - slot }}
                    className={cn(
                      "absolute inset-0 rounded-2xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.5),0_8px_20px_rgba(0,0,0,0.25)] ring-1 ring-black/10 dark:ring-white/20 ring-inset",
                      isFront ? "cursor-grab active:cursor-grabbing touch-pan-y" : "pointer-events-none"
                    )}
                  >
                    {/* Top Header */}
                    <div className="flex items-center justify-between text-[11px] font-semibold tracking-tight">
                      <span className="font-bold tracking-wider uppercase text-[10.5px] opacity-90">
                        LUMACV • {fmt.label.toUpperCase()}
                      </span>
                      <span className="p-1 rounded-md bg-current/15 backdrop-blur-xs">
                        <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                      </span>
                    </div>

                    {/* Candidate Info */}
                    <div className="mt-1">
                      <h3 className="text-2xl font-bold tracking-tight leading-tight">
                        {candidate.name}
                      </h3>
                      <p className="text-xs font-semibold opacity-85 mt-0.5 tracking-wide">
                        {candidate.title}
                      </p>

                      {/* Faint skeleton layout lines */}
                      <div className="mt-4 space-y-1.5 opacity-35">
                        <div className="h-[2.5px] w-full bg-current rounded-full" />
                        <div className="h-[2.5px] w-5/6 bg-current rounded-full" />
                        <div className="h-[2.5px] w-2/3 bg-current rounded-full" />
                      </div>
                    </div>

                    {/* Big Bold Format Extension */}
                    <div className="my-auto py-5 text-center overflow-hidden">
                      <span className="inline-block font-extrabold text-[58px] sm:text-[68px] tracking-tighter font-mono leading-none select-none">
                        {fmt.ext}
                      </span>
                    </div>

                    {/* Card Bottom Bar */}
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider font-semibold opacity-90 pt-2 border-t border-current/20">
                      <span className="tracking-widest">Sample resume</span>
                      <ArrowDown className="size-3.5 stroke-[2.5]" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Right Column: Interactive Format List + Download CTA ───────────── */}
          <div className="lg:col-span-6 flex flex-col justify-between max-w-lg w-full mx-auto lg:mx-0">
            
            {/* Format Interactive Cards */}
            <div className="space-y-2.5">
              {FORMATS.map((fmt) => {
                const isSelected = selectedFormat.id === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    className={cn(
                      "w-full text-left p-3.5 sm:p-4 rounded-xl transition-all duration-200 cursor-pointer border flex items-center justify-between gap-4 group",
                      isSelected
                        ? "bg-muted/70 dark:bg-white/[0.06] border-foreground/20 shadow-xs"
                        : "bg-transparent border-border/40 hover:bg-muted/40 hover:border-border"
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-12 h-8 rounded-lg border text-xs font-mono font-bold transition-all",
                          isSelected
                            ? "shadow-xs scale-105"
                            : "bg-card border-border text-muted-foreground group-hover:text-foreground group-hover:border-foreground/30"
                        )}
                        style={{
                          backgroundColor: isSelected ? fmt.color.badgeBg : undefined,
                          color: isSelected ? fmt.color.badgeText : undefined,
                          borderColor: isSelected ? fmt.color.badgeBorder : undefined,
                        }}
                      >
                        {fmt.ext}
                      </span>
                      <div>
                        <div className="text-[14.5px] sm:text-[15px] font-semibold text-foreground tracking-tight flex items-center gap-2 uppercase">
                          <span>{fmt.label}</span>
                          {fmt.recommended && (
                            <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 font-medium normal-case">
                              Recommended
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Radio indicator */}
                    <div
                      className={cn(
                        "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                        isSelected ? "border-current" : "border-border/70 group-hover:border-muted-foreground"
                      )}
                      style={{
                        borderColor: isSelected ? fmt.color.radioColor : undefined,
                        boxShadow: isSelected ? `0 0 12px ${fmt.color.ringColor}` : "none",
                      }}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeRadioDot"
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: fmt.color.radioColor }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Download CTA Button matching Format Color */}
            <div className="mt-7">
              <motion.button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                animate={{
                  backgroundColor: selectedFormat.color.btnBg,
                  color: selectedFormat.color.btnText,
                }}
                whileHover={{ scale: 1.01, filter: "brightness(1.05)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full h-12 sm:h-[52px] rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 transition-shadow shadow-md cursor-pointer disabled:opacity-60"
                style={{
                  boxShadow: `0 10px 25px -5px ${selectedFormat.color.ringColor}`,
                }}
              >
                {isDownloading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Compiling {selectedFormat.label}...
                  </span>
                ) : (
                  <>
                    <span>Download Sample Resume ({selectedFormat.ext})</span>
                    <ArrowDown className="size-4 stroke-[2.5]" />
                  </>
                )}
              </motion.button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default ExportFormatShowcase;
