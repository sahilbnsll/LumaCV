"use client";

import React, { useState, useRef, PointerEvent } from "react";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { motion, useSpring, useMotionTemplate, useReducedMotion } from "framer-motion";
import { ResumePreview } from "./resume-preview";
import { SPRING_PRESETS } from "@/lib/motion";
import { Button } from "@/components/ui/button";

// ─── 3 maximally distinct Typst-compiled templates ───────────────────────────
// Each shows a genuinely different layout: left-rule tech, two-column sidebar,
// centred serif editorial.

const HERO_TEMPLATES = [
  {
    id: "modern",
    name: "Vector",
    img: "/templates/modern.png",
    label: "Left-aligned · Sans · ATS-safe",
  },
  {
    id: "matrix",
    name: "Gridline",
    img: "/templates/matrix.png",
    label: "Two-column · Sidebar rail · Technical",
  },
  {
    id: "boutique",
    name: "Boutique",
    img: "/templates/boutique.png",
    label: "Centred serif · Skill matrix · Editorial",
  },
];

const ACCENT_COLORS = [
  { name: "Plum", value: "#735c9a" },
  { name: "Moss", value: "#507665" },
  { name: "Clay", value: "#a26046" },
  { name: "Cobalt", value: "#2563eb" },
];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4";
const dockLabel = "mb-[7px] block text-[11px] leading-[1.4] text-muted-foreground";
const dockButton =
  "relative grid min-h-touch min-w-touch cursor-pointer place-items-center bg-transparent text-[12px] text-muted-foreground hover:text-foreground transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]";

// ─── Stack position offsets for 3 papers ──────────────────────────────────────

function getPaperTransform(position: "front" | "left" | "right", spread: boolean) {
  if (spread) {
    return {
      front: "translate3d(0, -2%, 75px) rotateZ(0deg)",
      left: "translate3d(-38%, 2%, -80px) rotateX(-2deg) rotateY(-3deg) rotateZ(-26deg)",
      right: "translate3d(36%, -4%, -40px) rotateX(2deg) rotateY(3deg) rotateZ(26deg)",
    }[position];
  }
  return {
    front: "translate3d(0, 0, 40px) rotateZ(0deg)",
    left: "translate3d(-10%, 4%, -20px) rotateZ(-8deg)",
    right: "translate3d(10%, -2%, 0px) rotateZ(8deg)",
  }[position];
}

export function ResumeStackHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [accent, setAccent] = useState("#2563eb");
  const [selectedIdx, setSelectedIdx] = useState(0); // index into HERO_TEMPLATES
  const [spread, setSpread] = useState(false);
  const [dragging, setDragging] = useState(false);

  const reducedMotion = useReducedMotion();
  const dragOrigin = useRef<{
    id: number; x: number; y: number; rotateX: number; rotateY: number;
  } | null>(null);

  // Interactive drag physics without scroll dependence
  const rotateX = useSpring(10, SPRING_PRESETS.interactive);
  const rotateY = useSpring(-19, SPRING_PRESETS.interactive);

  const transform = useMotionTemplate`translate3d(0, 0, 0px) rotateX(${
    reducedMotion ? 0 : rotateX
  }deg) rotateY(${reducedMotion ? 0 : rotateY}deg) rotateZ(-7deg)`;

  const activeTemplateName = HERO_TEMPLATES[selectedIdx].name;

  // ── Drag handlers ─────────────────────────────────────────────────────────

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || event.button !== 0 || dragOrigin.current || reducedMotion) return;
    dragOrigin.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      rotateX: rotateX.get(),
      rotateY: rotateY.get(),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function turnPages(event: PointerEvent<HTMLDivElement>) {
    const origin = dragOrigin.current;
    if (!origin || origin.id !== event.pointerId) return;
    rotateX.set(origin.rotateX - Math.tanh((event.clientY - origin.y) / 170) * 18);
    rotateY.set(origin.rotateY + Math.tanh((event.clientX - origin.x) / 170) * 32);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (dragOrigin.current?.id !== event.pointerId) return;
    dragOrigin.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    rotateX.set(10);
    rotateY.set(-19);
  }

  // ── Build the 3-paper stack: front = selected, left & right = the other two ──

  const otherIndices = [0, 1, 2].filter((i) => i !== selectedIdx);
  const papers = [
    { ...HERO_TEMPLATES[selectedIdx], position: "front" as const, zIndex: 10 },
    { ...HERO_TEMPLATES[otherIndices[0]], position: "left" as const, zIndex: 5 },
    { ...HERO_TEMPLATES[otherIndices[1]], position: "right" as const, zIndex: 7 },
  ];

  return (
    <section ref={sectionRef} className="relative pt-[34px] pb-[62px] max-[900px]:pt-10 max-[540px]:pt-[30px] max-[540px]:pb-8 text-foreground overflow-hidden">
      <div className="container-marketing grid min-h-[710px] grid-cols-[1fr_1.12fr] items-center gap-[6px] max-[1100px]:min-h-[655px] max-[1100px]:grid-cols-[1fr_1.1fr] max-[900px]:grid-cols-1 max-[900px]:gap-[30px] max-[540px]:gap-[21px]">

        {/* ── Left editorial text ── */}
        <div className="relative z-1 pb-[22px] max-[900px]:max-w-[590px]">
          <h1
            id="hero-title"
            className="font-semibold text-display-hero max-[1100px]:text-[64px] max-[900px]:text-[clamp(55px,10vw,77px)] max-[540px]:text-[clamp(48px,11.65vw,63px)] text-foreground"
          >
            One resume,
            <br />
            compiled as
            <br />
            <span className="text-muted-foreground">
              <motion.span
                key={activeTemplateName}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="text-foreground"
                style={{ color: accent }}
              >
                {activeTemplateName}
              </motion.span>
              .
            </span>
          </h1>

          <p className="mt-7 max-w-[356px] text-muted-foreground text-[17px] leading-[1.65] max-[900px]:max-w-[410px] max-[540px]:mt-6 max-[540px]:max-w-[330px] max-[540px]:text-[15px]">
            Free and open source, compiled with Typst — so formatting never gets in the way.
          </p>

          <div className="mt-[30px] flex flex-wrap items-center gap-9 max-[1100px]:gap-7 max-[900px]:gap-9 max-[540px]:mt-[25px] max-[540px]:gap-7">
            <Button
              asChild
              variant="invert"
              className="min-h-[52px] px-6 py-3.5 text-sm max-[540px]:min-h-[48px] max-[540px]:px-5 max-[540px]:text-[13px]"
            >
              <Link href="/login">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>

            <a
              href="#templates"
              className="inline-flex min-h-touch items-center gap-2 text-sm text-muted-foreground underline-offset-[5px] hover:text-foreground hover:underline transition-colors max-[1100px]:text-[13px] max-[540px]:text-[12px]"
            >
              <span>Explore templates</span>
              <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>

          <p className="mt-[17px] text-muted-foreground text-[12px] leading-[1.9] max-[540px]:mt-[15px] max-[540px]:text-[11px]">
            <strong className="font-medium text-foreground">Free forever and open source.</strong>
            <br />
            No ads, paywalls, or tracking.
          </p>
        </div>

        {/* ── Right: 3D paper sculpture + interactive dock ── */}
        <div className="mx-auto w-full max-w-[620px] text-foreground max-[960px]:mt-[25px] max-[900px]:max-w-[560px]">

          {/* 3D Stage */}
          <div className="relative aspect-[620/600] select-none" style={{ perspective: "1400px" }}>
            {/* Floor shadow */}
            <div
              className="absolute right-[5%] bottom-0 left-[15%] h-[10%] rounded-full bg-black opacity-70 blur-[18px] pointer-events-none"
              aria-hidden="true"
            />

            {/* Draggable wrapper */}
            <div
              className={`absolute inset-0 cursor-grab touch-pan-y ${dragging ? "cursor-grabbing" : ""}`}
              onPointerDown={startDrag}
              onPointerMove={turnPages}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ transform, transformStyle: "preserve-3d" }}
              >
                {papers.map((p) => (
                  <article
                    key={p.id}
                    className="absolute top-[2%] left-[24%] aspect-[210/297] w-[56%] origin-[50%_80%] rounded-[2px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      transform: getPaperTransform(p.position, spread),
                      transformStyle: "preserve-3d",
                      zIndex: p.zIndex,
                    }}
                  >
                    {/* Paper face — live HTML preview, updates with name/accent/typeface.
                        bg-white is intentional and stays literal in both themes: this is a
                        physical paper mockup, not an app surface, so it doesn't follow dark mode. */}
                    <div className="absolute inset-0 border border-[#dedbd3] bg-white shadow-[0_25px_28px_#0004,0_2px_1px_#0006] overflow-hidden rounded-[2px]">
                      {/* Render at 794px (A4 width) then scale down to fit ~347px container */}
                      <div
                        style={{
                          width: 794,
                          height: 1123,
                          transform: "scale(0.4369)",
                          transformOrigin: "top left",
                          pointerEvents: "none",
                        }}
                      >
                        <ResumePreview
                          templateId={p.id as "modern" | "matrix" | "boutique"}
                          name="Alex Morgan"
                          accent={accent}
                          typeface="sans"
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Drag hint + Spread toggle */}
          <div className="flex items-center justify-between gap-3 px-2 pt-[14px] pb-[18px] text-muted-foreground">
            <p className="flex items-center gap-[9px] text-[12px]">
              <span aria-hidden="true">↔</span>
              <span>Drag to compare templates</span>
            </p>
            <button
              type="button"
              className={`flex min-h-touch cursor-pointer items-center gap-[14px] bg-transparent px-2 text-foreground text-[12px] hover:text-foreground/80 ${focusRing}`}
              aria-pressed={spread}
              onClick={() => setSpread(!spread)}
            >
              <span>{spread ? "Stack pages" : "Spread pages"}</span>
              <span className="font-light text-[21px]" aria-hidden="true">{spread ? "−" : "+"}</span>
            </button>
          </div>

          {/* Template switcher — 3 very different layouts, drives the headline above */}
          <fieldset className="mb-3 flex gap-2" aria-label="Choose a resume template">
            {HERO_TEMPLATES.map((tpl, i) => (
              <button
                key={tpl.id}
                type="button"
                className={`flex min-h-touch flex-1 cursor-pointer flex-col items-center justify-center gap-[4px] rounded-[4px] border p-2 text-[11px] transition-all ${
                  selectedIdx === i
                    ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
                } ${focusRing}`}
                aria-pressed={selectedIdx === i}
                onClick={() => setSelectedIdx(i)}
              >
                <span className="font-medium text-[12px]">{tpl.name}</span>
                <span className="text-[9.5px] text-muted-foreground/80 leading-tight hidden sm:block">{tpl.label}</span>
              </button>
            ))}
          </fieldset>

          {/* Accent color — the one live control, tied to the headline's accent word */}
          <fieldset className="flex items-center justify-between gap-4 rounded-[4px] border border-border bg-card px-[21px] py-[15px] shadow-sm">
            <legend className={dockLabel}>Accent color</legend>
            <div className="flex">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`${dockButton} ${focusRing}`}
                  aria-label={color.name}
                  aria-pressed={accent === color.value}
                  onClick={() => setAccent(color.value)}
                >
                  <span
                    className={`size-[23px] rounded-full transition-all ${
                      accent === color.value ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                </button>
              ))}
            </div>
          </fieldset>
        </div>

      </div>
    </section>
  );
}
