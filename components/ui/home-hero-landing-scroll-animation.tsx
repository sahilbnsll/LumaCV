"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { ArrowRight, FileText, Github, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Real LumaCV Typst Resume Renders showcasing the 5 architectural layout archetypes
const LUMACV_HERO_TEMPLATES = [
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

type HeroTemplateItem = (typeof LUMACV_HERO_TEMPLATES)[0];

interface InlineTemplateBoxProps {
  template: HeroTemplateItem;
  scale: MotionValue<number>;
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  onClick: () => void;
}

// Reusable inline template card component rendered strictly in-flow (zero layout thrashing, zero pixel jitter)
const InlineTemplateBox = React.memo(function InlineTemplateBox({
  template,
  scale,
  opacity,
  y,
  onClick,
}: InlineTemplateBoxProps) {
  return (
    <motion.span
      style={{ scale, opacity, y }}
      onClick={onClick}
      className="inline-flex align-middle mx-1 sm:mx-1.5 md:mx-2 h-7 w-11 sm:h-9 sm:w-14 md:h-11 md:w-18 lg:h-12 lg:w-20 rounded-md sm:rounded-lg overflow-hidden border border-border/80 dark:border-white/20 shadow-xs sm:shadow-md bg-card/90 backdrop-blur-xs relative group cursor-pointer select-none transition-all duration-200 hover:scale-110 hover:shadow-lg hover:border-primary/60 will-change-transform z-20"
      title={`Explore ${template.name} (${template.badge})`}
    >
      <img
        src={template.src}
        alt={template.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 pointer-events-none"
      />
      {/* Interactive hover tooltip badge */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-background/90 backdrop-blur-md py-0.5 px-1 text-[8px] sm:text-[9px] font-mono text-center text-foreground font-semibold truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {template.name.split(" ")[0]}
      </span>
      {/* Subtle border glow effect */}
      <span className="pointer-events-none absolute inset-0 rounded-md sm:rounded-lg ring-1 ring-inset ring-white/10 group-hover:ring-primary/40 transition-colors" />
    </motion.span>
  );
});

export const HomeHeroLandingScrollAnimation: React.FC = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeBgIndex, setActiveBgIndex] = useState(0);

  // Continuous smooth transition between resume renders
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBgIndex((prev) => (prev + 1) % LUMACV_HERO_TEMPLATES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Pure Framer-Motion scroll tracking with GPU-accelerated spring physics
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Silky smooth, jitter-free spring interpolation for 60/120/144Hz displays
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 24,
    mass: 0.1,
    restDelta: 0.0001,
  });

  // 0. Background Resume Showcase animation (Scroll: 0.00 -> 0.16)
  const bgResumeOpacity = useTransform(smoothProgress, [0, 0.16], [1, 0]);

  // 1. Initial Hero Header animations (Scroll: 0.00 -> 0.16)
  const heroOpacity = useTransform(smoothProgress, [0, 0.16], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.16], [0, -25]);
  const heroScale = useTransform(smoothProgress, [0, 0.16], [1, 0.96]);
  const heroPointerEvents = useTransform<number, React.CSSProperties['pointerEvents']>(smoothProgress, (p) => (p > 0.14 ? "none" : "auto"));

  // 2. Initial Bottom Template Dock animations (Scroll: 0.00 -> 0.14)
  const dockOpacity = useTransform(smoothProgress, [0, 0.14], [1, 0]);
  const dockY = useTransform(smoothProgress, [0, 0.14], [0, 30]);
  const dockScale = useTransform(smoothProgress, [0, 0.14], [1, 0.95]);
  const dockPointerEvents = useTransform<number, React.CSSProperties['pointerEvents']>(smoothProgress, (p) => (p > 0.12 ? "none" : "auto"));

  // 3. Kinetic Headline Master Container animations (Crossfades in at 0.10, fully visible 0.22 -> 0.86, exits 0.86 -> 0.96)
  const kineticOpacity = useTransform(smoothProgress, [0.10, 0.22, 0.86, 0.96], [0, 1, 1, 0]);
  const kineticY = useTransform(smoothProgress, [0.10, 0.22, 0.86, 0.96], [20, 0, 0, -20]);
  const kineticScale = useTransform(smoothProgress, [0.10, 0.22, 0.86, 0.96], [0.97, 1, 1, 0.97]);
  const kineticPointerEvents = useTransform<number, React.CSSProperties['pointerEvents']>(smoothProgress, (p) => (p >= 0.14 && p <= 0.92 ? "auto" : "none"));

  // 4. Staggered phrase & inline template card illumination across scroll (0.20 -> 0.82)
  const seg1TextOpacity = useTransform(smoothProgress, [0.20, 0.32], [0.40, 1]);
  const seg1CardOpacity = useTransform(smoothProgress, [0.20, 0.32], [0.35, 1]);
  const seg1CardScale = useTransform(smoothProgress, [0.20, 0.32], [0.85, 1]);
  const seg1CardY = useTransform(smoothProgress, [0.20, 0.32], [6, 0]);

  const seg2TextOpacity = useTransform(smoothProgress, [0.32, 0.44], [0.40, 1]);
  const seg2CardOpacity = useTransform(smoothProgress, [0.32, 0.44], [0.35, 1]);
  const seg2CardScale = useTransform(smoothProgress, [0.32, 0.44], [0.85, 1]);
  const seg2CardY = useTransform(smoothProgress, [0.32, 0.44], [6, 0]);

  const seg3TextOpacity = useTransform(smoothProgress, [0.44, 0.56], [0.40, 1]);
  const seg3CardOpacity = useTransform(smoothProgress, [0.44, 0.56], [0.35, 1]);
  const seg3CardScale = useTransform(smoothProgress, [0.44, 0.56], [0.85, 1]);
  const seg3CardY = useTransform(smoothProgress, [0.44, 0.56], [6, 0]);

  const seg4TextOpacity = useTransform(smoothProgress, [0.56, 0.68], [0.40, 1]);
  const seg4CardOpacity = useTransform(smoothProgress, [0.56, 0.68], [0.35, 1]);
  const seg4CardScale = useTransform(smoothProgress, [0.56, 0.68], [0.85, 1]);
  const seg4CardY = useTransform(smoothProgress, [0.56, 0.68], [6, 0]);

  const seg5TextOpacity = useTransform(smoothProgress, [0.68, 0.82], [0.40, 1]);
  const seg5CardOpacity = useTransform(smoothProgress, [0.68, 0.82], [0.35, 1]);
  const seg5CardScale = useTransform(smoothProgress, [0.68, 0.82], [0.85, 1]);
  const seg5CardY = useTransform(smoothProgress, [0.68, 0.82], [6, 0]);

  const scrollToTemplates = useCallback(() => {
    const target = document.getElementById("templates");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/templates");
    }
  }, [router]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[175vh] bg-background text-foreground"
    >
      {/* Sticky Fullscreen Stage (GPU Composited) */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Continuous Smooth Semi-Transparent Resume Showcase */}
        <motion.div
          style={{ opacity: bgResumeOpacity }}
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={LUMACV_HERO_TEMPLATES[activeBgIndex].name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                transform: "scale(1.15) translate3d(0, 0, 0)",
                transformOrigin: "top left",
              }}
            >
              <img
                src={LUMACV_HERO_TEMPLATES[activeBgIndex].src}
                alt={`${LUMACV_HERO_TEMPLATES[activeBgIndex].name} Typst Resume Template`}
                className="w-full h-full object-cover object-left-top opacity-[0.20] dark:opacity-[0.14] pointer-events-none select-none"
                style={{
                  objectPosition: "0% 0%",
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Asymmetric Vignette: delicate top-left reveal, soft fade across center and edges */}
          <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(ellipse_90%_90%_at_15%_15%,rgba(251,251,253,0.12)_0%,rgba(251,251,253,0.80)_50%,rgba(251,251,253,0.98)_85%)] dark:bg-[radial-gradient(ellipse_90%_90%_at_15%_15%,rgba(8,9,11,0.14)_0%,rgba(8,9,11,0.84)_50%,rgba(8,9,11,0.98)_85%)]" />

          {/* Central Radial Mask to guarantee pure text contrast in center */}
          <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(251,251,253,0.85)_0%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(8,9,11,0.88)_0%,transparent_75%)]" />

          {/* Floating Meta Tag Pill (Top Left - directly anchored over candidate name area) */}
          <div className="absolute top-5 sm:top-7 left-5 sm:left-7 z-2 hidden sm:inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card/85 backdrop-blur-md px-4 py-1.5 text-xs text-foreground shadow-sm transition-all duration-500">
            <span className={cn("h-2 w-2 rounded-full animate-pulse", LUMACV_HERO_TEMPLATES[activeBgIndex].accentDot)} />
            <span className="font-display font-semibold">{LUMACV_HERO_TEMPLATES[activeBgIndex].name}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="font-mono text-[11px] text-primary">{LUMACV_HERO_TEMPLATES[activeBgIndex].badge}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-muted-foreground text-[11px]">{LUMACV_HERO_TEMPLATES[activeBgIndex].tag}</span>
          </div>
        </motion.div>

        {/* Ambient Subtle Hero Glow */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[750px] rounded-full bg-primary/5 dark:bg-primary/[0.08] blur-[140px]" />
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
          className="relative z-30 max-w-3xl mx-auto text-center space-y-3.5 sm:space-y-4 px-4 will-change-transform mt-[-35px] sm:mt-[-45px]"
        >


          {/* Main Headline */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[3.65rem] tracking-tight text-foreground leading-[1.12] drop-shadow-xs">
              A free and open-source{" "}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-sky-400 bg-clip-text text-transparent">
                resume builder
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-muted-foreground font-normal leading-relaxed">
            AI-tailored resumes with 100% factual integrity, ATS scoring, and precision Typst typesetting — completely free.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 relative z-40">
            <Link
              href="/builder"
              className="group relative h-11 px-6 rounded-xl font-semibold text-xs sm:text-sm bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-white/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.98] select-none"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                scrollToTemplates();
              }}
              className="h-11 px-5 rounded-xl font-medium text-xs sm:text-sm border border-border/80 bg-card/90 hover:bg-muted/70 text-foreground backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.98] select-none shadow-xs"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span>Sample Typst Resumes</span>
            </button>
            <a
              href="https://github.com/sahilbnsll"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-4 rounded-xl font-medium text-xs sm:text-sm border border-border/60 bg-background/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-all cursor-pointer select-none"
            >
              <Github className="h-4 w-4" />
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
          {LUMACV_HERO_TEMPLATES.map((tmpl, index) => {
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
          className="absolute inset-0 flex items-center justify-center px-4 md:px-6 z-20 will-change-transform"
        >
          <div className="max-w-4xl mx-auto text-center px-2 sm:px-4">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] tracking-tight leading-[1.42] md:leading-[1.38] text-foreground select-none">
              {/* Segment 1 */}
              <motion.span
                style={{ opacity: seg1TextOpacity }}
                className="transition-opacity duration-200"
              >
                Deterministic Typst compilation
              </motion.span>
              <InlineTemplateBox
                template={LUMACV_HERO_TEMPLATES[0]}
                scale={seg1CardScale}
                opacity={seg1CardOpacity}
                y={seg1CardY}
                onClick={scrollToTemplates}
              />

              {/* Segment 2 */}
              <motion.span
                style={{ opacity: seg2TextOpacity }}
                className="transition-opacity duration-200"
              >
                builds the foundation
              </motion.span>
              <InlineTemplateBox
                template={LUMACV_HERO_TEMPLATES[2]}
                scale={seg2CardScale}
                opacity={seg2CardOpacity}
                y={seg2CardY}
                onClick={scrollToTemplates}
              />

              {/* Segment 3 */}
              <motion.span
                style={{ opacity: seg3TextOpacity }}
                className="transition-opacity duration-200"
              >
                where verified ATS precision
              </motion.span>
              <InlineTemplateBox
                template={LUMACV_HERO_TEMPLATES[4]}
                scale={seg3CardScale}
                opacity={seg3CardOpacity}
                y={seg3CardY}
                onClick={scrollToTemplates}
              />

              {/* Segment 4 */}
              <motion.span
                style={{ opacity: seg4TextOpacity }}
                className="transition-opacity duration-200"
              >
                and zero-hallucination AI
              </motion.span>
              <InlineTemplateBox
                template={LUMACV_HERO_TEMPLATES[1]}
                scale={seg4CardScale}
                opacity={seg4CardOpacity}
                y={seg4CardY}
                onClick={scrollToTemplates}
              />

              {/* Segment 5 */}
              <motion.span
                style={{ opacity: seg5TextOpacity }}
                className="transition-opacity duration-200"
              >
                engineer interview-winning
              </motion.span>
              <InlineTemplateBox
                template={LUMACV_HERO_TEMPLATES[3]}
                scale={seg5CardScale}
                opacity={seg5CardOpacity}
                y={seg5CardY}
                onClick={scrollToTemplates}
              />
              <motion.span
                style={{ opacity: seg5TextOpacity }}
                className="transition-opacity duration-200"
              >
                careers.
              </motion.span>
            </h2>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeHeroLandingScrollAnimation;
