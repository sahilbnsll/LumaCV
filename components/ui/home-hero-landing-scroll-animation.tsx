"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { ArrowRight, FileText, Github, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const HomeHeroLandingScrollAnimation: React.FC = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeBgIndex, setActiveBgIndex] = useState(0);

  // Real LumaCV Typst Resume Renders showcasing the 5 architectural layout archetypes
  const lumacvHeroTemplates = [
    {
      src: "/templates/renders/modern-cobalt.png",
      name: "Modern Cobalt",
      badge: "Clean Typography",
      tag: "Tech & Engineering",
      accentDot: "bg-blue-500",
    },
    {
      src: "/templates/renders/engineering-emerald.png",
      name: "Engineering Mono",
      badge: "Monospace Layout",
      tag: "DevOps & Cloud",
      accentDot: "bg-emerald-500",
    },
    {
      src: "/templates/renders/classic-navy.png",
      name: "Harvard Classic",
      badge: "Serif Typeset",
      tag: "Executive & Finance",
      accentDot: "bg-indigo-500",
    },
    {
      src: "/templates/renders/two_column-teal.png",
      name: "Two-Column Split",
      badge: "Structured Layout",
      tag: "Product & Architecture",
      accentDot: "bg-teal-500",
    },
    {
      src: "/templates/renders/ats_safe-black.png",
      name: "ATS-Safe Linear",
      badge: "Machine-Readable",
      tag: "Enterprise Recruiting",
      accentDot: "bg-zinc-500",
    },
  ];

  // Continuous smooth transition between resume renders (auto-resets gracefully on user click)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBgIndex((prev) => (prev + 1) % lumacvHeroTemplates.length);
    }, 4800);
    return () => clearInterval(timer);
  }, [lumacvHeroTemplates.length, activeBgIndex]);

  // Pure Framer-Motion scroll tracking with GPU-accelerated spring physics
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Silky smooth, jitter-free spring interpolation for 60/120/144Hz displays
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 26,
    mass: 0.2,
    restDelta: 0.0005,
  });

  // 1. Initial Hero Header animations (Scroll: 0.00 -> 0.16)
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.15], [0, -35]);
  const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.96]);
  const heroPointerEvents = useTransform<number, React.CSSProperties['pointerEvents']>(smoothProgress, (p) => (p > 0.1 ? "none" : "auto"));

  // 2. Initial Bottom Template Dock animations (Scroll: 0.00 -> 0.16)
  const dockOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const dockY = useTransform(smoothProgress, [0, 0.15], [0, 45]);
  const dockScale = useTransform(smoothProgress, [0, 0.15], [1, 0.94]);
  const dockPointerEvents = useTransform<number, React.CSSProperties['pointerEvents']>(smoothProgress, (p) => (p > 0.1 ? "none" : "auto"));

  // 3. Kinetic Headline Master Container animations (Scroll: 0.12 -> 0.25)
  const kineticOpacity = useTransform(smoothProgress, [0.12, 0.22], [0, 1]);
  const kineticY = useTransform(smoothProgress, [0.12, 0.22], [30, 0]);
  const kineticScale = useTransform(smoothProgress, [0.12, 0.25], [0.96, 1]);
  const kineticPointerEvents = useTransform<number, React.CSSProperties['pointerEvents']>(smoothProgress, (p) => (p > 0.15 ? "auto" : "none"));

  // 4. Staggered phrase & inline template card illumination across scroll (0.20 -> 0.85)
  // Segment 1: "Deterministic Typst compilation" + Modern Cobalt
  const seg1TextOpacity = useTransform(smoothProgress, [0.18, 0.30], [0.22, 1]);
  const seg1CardOpacity = useTransform(smoothProgress, [0.18, 0.30], [0, 1]);
  const seg1CardScale = useTransform(smoothProgress, [0.18, 0.30], [0.75, 1]);
  const seg1CardY = useTransform(smoothProgress, [0.18, 0.30], [12, 0]);

  // Segment 2: "builds the foundation" + Harvard Classic
  const seg2TextOpacity = useTransform(smoothProgress, [0.30, 0.42], [0.22, 1]);
  const seg2CardOpacity = useTransform(smoothProgress, [0.30, 0.42], [0, 1]);
  const seg2CardScale = useTransform(smoothProgress, [0.30, 0.42], [0.75, 1]);
  const seg2CardY = useTransform(smoothProgress, [0.30, 0.42], [12, 0]);

  // Segment 3: "where verified ATS precision" + ATS-Safe Linear
  const seg3TextOpacity = useTransform(smoothProgress, [0.42, 0.54], [0.22, 1]);
  const seg3CardOpacity = useTransform(smoothProgress, [0.42, 0.54], [0, 1]);
  const seg3CardScale = useTransform(smoothProgress, [0.42, 0.54], [0.75, 1]);
  const seg3CardY = useTransform(smoothProgress, [0.42, 0.54], [12, 0]);

  // Segment 4: "and zero-hallucination AI" + Engineering Mono
  const seg4TextOpacity = useTransform(smoothProgress, [0.54, 0.66], [0.22, 1]);
  const seg4CardOpacity = useTransform(smoothProgress, [0.54, 0.66], [0, 1]);
  const seg4CardScale = useTransform(smoothProgress, [0.54, 0.66], [0.75, 1]);
  const seg4CardY = useTransform(smoothProgress, [0.54, 0.66], [12, 0]);

  // Segment 5: "engineer interview-winning" + Two-Column Split + "careers."
  const seg5TextOpacity = useTransform(smoothProgress, [0.66, 0.80], [0.22, 1]);
  const seg5CardOpacity = useTransform(smoothProgress, [0.66, 0.80], [0, 1]);
  const seg5CardScale = useTransform(smoothProgress, [0.66, 0.80], [0.75, 1]);
  const seg5CardY = useTransform(smoothProgress, [0.66, 0.80], [12, 0]);

  const scrollToTemplates = () => {
    const target = document.getElementById("templates");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/templates");
    }
  };

  // Reusable inline template card component rendered strictly in-flow (zero layout thrashing, zero pixel jitter)
  const InlineTemplateBox = ({
    template,
    scale,
    opacity,
    y,
  }: {
    template: (typeof lumacvHeroTemplates)[0];
    scale: MotionValue<number>;
    opacity: MotionValue<number>;
    y: MotionValue<number>;
  }) => (
    <motion.span
      style={{ scale, opacity, y }}
      onClick={scrollToTemplates}
      className="inline-flex align-middle mx-1.5 sm:mx-2 md:mx-2.5 h-8 w-11 sm:h-11 sm:w-16 md:h-14 md:w-20 lg:h-16 lg:w-24 rounded-lg sm:rounded-xl overflow-hidden border border-border/80 dark:border-white/20 shadow-md sm:shadow-lg bg-card/90 backdrop-blur-xs relative group cursor-pointer select-none transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:border-primary/60 will-change-transform z-20"
      title={`Explore ${template.name} (${template.badge})`}
    >
      <img
        src={template.src}
        alt={template.name}
        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 pointer-events-none"
      />
      {/* Interactive hover tooltip badge */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-background/90 backdrop-blur-md py-0.5 px-1 text-[8px] sm:text-[9px] font-mono text-center text-foreground font-semibold truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {template.name.split(" ")[0]}
      </span>
      {/* Subtle border glow effect */}
      <span className="pointer-events-none absolute inset-0 rounded-lg sm:rounded-xl ring-1 ring-inset ring-white/10 group-hover:ring-primary/40 transition-colors" />
    </motion.span>
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[260vh] bg-background text-foreground"
    >
      {/* Sticky Fullscreen Stage (GPU Composited) */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Continuous Smooth Semi-Transparent Resume Showcase */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          {lumacvHeroTemplates.map((tmpl, i) => {
            const isActive = activeBgIndex === i;
            return (
              <div
                key={tmpl.name}
                className="absolute inset-0 w-full h-full pointer-events-none transition-all ease-in-out"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "scale(1.24) translate3d(0, 0, 0)" : "scale(1.16) translate3d(0, 0, 0)",
                  transformOrigin: "top left",
                  transition: "opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1), transform 2.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <img
                  src={tmpl.src}
                  alt={`${tmpl.name} Typst Resume Template`}
                  className="w-full h-full object-cover object-left-top opacity-40 dark:opacity-32 pointer-events-none select-none"
                  style={{
                    objectPosition: "0% 0%",
                  }}
                />
              </div>
            );
          })}

          {/* Asymmetric Vignette: crystal-clear mapped to top-left candidate name, soft vignette toward center-right */}
          <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(ellipse_95%_95%_at_12%_12%,rgba(251,251,253,0.18)_0%,rgba(251,251,253,0.72)_46%,rgba(251,251,253,0.96)_82%)] dark:bg-[radial-gradient(ellipse_95%_95%_at_12%_12%,rgba(8,9,11,0.22)_0%,rgba(8,9,11,0.78)_46%,rgba(8,9,11,0.97)_82%)]" />

          {/* Floating Meta Tag Pill (Top Left - directly anchored over candidate name area) */}
          <div className="absolute top-5 sm:top-7 left-5 sm:left-7 z-2 hidden sm:inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card/85 backdrop-blur-md px-4 py-1.5 text-xs text-foreground shadow-sm transition-all duration-500">
            <span className={cn("h-2 w-2 rounded-full animate-pulse", lumacvHeroTemplates[activeBgIndex].accentDot)} />
            <span className="font-display font-semibold">{lumacvHeroTemplates[activeBgIndex].name}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="font-mono text-[11px] text-primary">{lumacvHeroTemplates[activeBgIndex].badge}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-muted-foreground text-[11px]">{lumacvHeroTemplates[activeBgIndex].tag}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. INITIAL HERO CONTENT (Scroll: 0.00 -> 0.16)                            */}
        {/* ========================================================================= */}
        <motion.div
          style={{
            opacity: heroOpacity,
            y: heroY,
            scale: heroScale,
            pointerEvents: heroPointerEvents,
          }}
          className="relative z-30 max-w-3xl mx-auto text-center space-y-3.5 sm:space-y-4 px-4 will-change-transform mt-[-40px] sm:mt-[-50px]"
        >
          {/* Tag Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono uppercase tracking-wider text-primary bg-primary/10 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              Finally, a modern way
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-1">
            <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground leading-[1.1] drop-shadow-xs">
              A free and open-source resume builder
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-muted-foreground font-normal leading-relaxed">
            AI-tailored resumes with 100% factual integrity, ATS scoring, and precision Typst typesetting — completely free.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 relative z-40">
            <Link
              href="/builder"
              className="h-10 px-5 rounded-xl font-semibold text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.98] select-none"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                scrollToTemplates();
              }}
              className="h-10 px-4 rounded-xl font-medium text-xs sm:text-sm border border-border/80 bg-card/90 hover:bg-card text-foreground backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.98] select-none shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Sample Typst Resumes</span>
            </button>
            <a
              href="https://github.com/sahilbnsll"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-3.5 rounded-xl font-medium text-xs sm:text-sm border border-border/50 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center gap-1.5 transition-all cursor-pointer select-none"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. INITIAL BOTTOM TEMPLATE DOCK (Scroll: 0.00 -> 0.16)                    */}
        {/* ========================================================================= */}
        <motion.div
          style={{
            opacity: dockOpacity,
            y: dockY,
            scale: dockScale,
            pointerEvents: dockPointerEvents,
          }}
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 sm:gap-3 w-[92%] max-w-2xl will-change-transform z-20"
        >
          {lumacvHeroTemplates.map((tmpl, index) => {
            const isActive = activeBgIndex === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveBgIndex(index)}
                className={cn(
                  "flex-1 h-20 sm:h-24 md:h-28 max-w-[125px] will-change-transform rounded-xl overflow-hidden border bg-card shadow-md relative group transition-all duration-300 hover:scale-105 cursor-pointer text-left select-none",
                  isActive
                    ? "border-primary ring-2 ring-primary/40 scale-[1.04] shadow-lg shadow-primary/10 z-10"
                    : "border-border/80 hover:border-primary/50 opacity-75 hover:opacity-100"
                )}
                title={`Preview ${tmpl.name} (Click to switch background)`}
              >
                <img
                  src={tmpl.src}
                  alt={tmpl.name}
                  className="w-full h-full object-cover object-top pointer-events-none"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-1 hidden sm:block text-center">
                  <span
                    className={cn(
                      "text-[9px] font-mono truncate block font-medium transition-colors",
                      isActive ? "text-primary font-bold" : "text-muted-foreground"
                    )}
                  >
                    {tmpl.name.split(" ")[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. KINETIC EDITORIAL HEADLINE WITH INLINE CARDS (Scroll: 0.18 -> 1.00)    */}
        {/* ========================================================================= */}
        <motion.div
          style={{
            opacity: kineticOpacity,
            y: kineticY,
            scale: kineticScale,
            pointerEvents: kineticPointerEvents,
          }}
          className="absolute inset-0 flex items-center justify-center px-4 md:px-8 z-20 will-change-transform"
        >
          <h1 className="max-w-[95vw] md:max-w-[88vw] lg:max-w-[82vw] text-center text-foreground font-display font-bold leading-[1.35] md:leading-[1.28] tracking-tight text-[clamp(1.5rem,4.8vw,4.25rem)] select-none">
            {/* Segment 1 */}
            <motion.span
              style={{ opacity: seg1TextOpacity }}
              className="transition-colors duration-200"
            >
              Deterministic Typst compilation
            </motion.span>
            <InlineTemplateBox
              template={lumacvHeroTemplates[0]}
              scale={seg1CardScale}
              opacity={seg1CardOpacity}
              y={seg1CardY}
            />

            {/* Segment 2 */}
            <motion.span
              style={{ opacity: seg2TextOpacity }}
              className="transition-colors duration-200"
            >
              builds the foundation
            </motion.span>
            <InlineTemplateBox
              template={lumacvHeroTemplates[2]}
              scale={seg2CardScale}
              opacity={seg2CardOpacity}
              y={seg2CardY}
            />

            {/* Segment 3 */}
            <motion.span
              style={{ opacity: seg3TextOpacity }}
              className="transition-colors duration-200"
            >
              where verified ATS precision
            </motion.span>
            <InlineTemplateBox
              template={lumacvHeroTemplates[4]}
              scale={seg3CardScale}
              opacity={seg3CardOpacity}
              y={seg3CardY}
            />

            {/* Segment 4 */}
            <motion.span
              style={{ opacity: seg4TextOpacity }}
              className="transition-colors duration-200"
            >
              and zero-hallucination AI
            </motion.span>
            <InlineTemplateBox
              template={lumacvHeroTemplates[1]}
              scale={seg4CardScale}
              opacity={seg4CardOpacity}
              y={seg4CardY}
            />

            {/* Segment 5 */}
            <motion.span
              style={{ opacity: seg5TextOpacity }}
              className="transition-colors duration-200"
            >
              engineer interview-winning
            </motion.span>
            <InlineTemplateBox
              template={lumacvHeroTemplates[3]}
              scale={seg5CardScale}
              opacity={seg5CardOpacity}
              y={seg5CardY}
            />
            <motion.span
              style={{ opacity: seg5TextOpacity }}
              className="transition-colors duration-200"
            >
              careers.
            </motion.span>
          </h1>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeHeroLandingScrollAnimation;
