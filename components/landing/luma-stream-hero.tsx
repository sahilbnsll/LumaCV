"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers, ShieldCheck } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion, useMotionValueEvent } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ImageStreamHero, StreamImage } from "@/components/ui/image-stream-hero";
import { cn } from "@/lib/utils";
import { SPRING_PRESETS } from "@/lib/motion";

const TEMPLATE_STREAM_IMAGES: StreamImage[] = [
  { src: "/templates/modern.png", alt: "Vector Modern Tech Resume" },
  { src: "/templates/matrix.png", alt: "Gridline Systems Architecture Resume" },
  { src: "/templates/boutique.png", alt: "Boutique Editorial Serif Resume" },
  { src: "/templates/executive.png", alt: "Executive Leadership Resume" },
  { src: "/templates/engineering.png", alt: "Platform Systems Cloud Resume" },
  { src: "/templates/editorial.png", alt: "Editorial Print Magazine Resume" },
  { src: "/templates/two_column.png", alt: "Duplex Asymmetric Rail Resume" },
  { src: "/templates/compact.png", alt: "Compact 1-Page Resume" },
  { src: "/templates/classic.png", alt: "Heritage Ivy League Resume" },
  { src: "/templates/terminal.png", alt: "Terminal Monospace CLI Resume" },
  { src: "/templates/nordic.png", alt: "Nordic Scandinavian Restraint Resume" },
  { src: "/templates/impact.png", alt: "Apex Achievement-First Resume" },
  { src: "/templates/cadence.png", alt: "Cadence Typographic Rhythm Resume" },
  { src: "/templates/product.png", alt: "Prism Product Strategy Resume" },
  { src: "/templates/startup.png", alt: "Velocity 0-to-1 Scale Resume" },
  { src: "/templates/grad.png", alt: "Ascent Early Career Resume" },
];

export function LumaStreamHero() {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [pointerActive, setPointerActive] = useState(true);

  // Track scroll through the pinned hero zoom track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, SPRING_PRESETS.scroll);

  // 1. Center hero content fades out and lifts gracefully as scroll zoom starts
  const contentY = useTransform(smoothProgress, [0.05, 0.32], [0, -70]);
  const contentOpacity = useTransform(smoothProgress, [0.05, 0.28], [1, 0]);
  const contentScale = useTransform(smoothProgress, [0.05, 0.30], [1, 0.92]);

  // 2. 3D Resume Stream Corridor: zooms up dramatically toward the viewer before revealing next section
  const corridorScale = useTransform(smoothProgress, [0.06, 0.78], [1.0, 2.45]);
  const corridorOpacity = useTransform(smoothProgress, [0.65, 0.92], [1, 0.15]);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    setPointerActive(latest < 0.22);
  });

  return (
    <section
      ref={containerRef}
      aria-label="Resume Showcase Corridor"
      className={cn(
        "relative w-full",
        prefersReducedMotion ? "h-auto" : "h-[200vh] sm:h-[225vh]"
      )}
    >
      <div
        className={cn(
          "w-full overflow-hidden flex flex-col justify-center border-b border-border/40 bg-background/30",
          prefersReducedMotion
            ? "relative min-h-[620px] sm:min-h-[680px] lg:min-h-[720px]"
            : "sticky top-0 h-screen"
        )}
      >
        <motion.div
          style={{
            scale: prefersReducedMotion ? 1 : corridorScale,
            opacity: prefersReducedMotion ? 1 : corridorOpacity,
            transformOrigin: "50% 54%",
            transformPerspective: 1200,
          }}
          className="w-full h-full flex flex-col justify-center will-change-transform"
        >
          <ImageStreamHero
            images={TEMPLATE_STREAM_IMAGES}
            cards={6}
            speed={24}
            axis={54}
            className="w-full h-full min-h-[620px] sm:min-h-screen flex items-center justify-center"
          >
            <motion.div
              style={{
                y: prefersReducedMotion ? 0 : contentY,
                opacity: prefersReducedMotion ? 1 : contentOpacity,
                scale: prefersReducedMotion ? 1 : contentScale,
              }}
              className="relative z-10 flex h-full min-h-[620px] sm:min-h-screen flex-col items-center justify-between py-12 sm:py-16 px-4 text-center pointer-events-none will-change-transform"
            >
              {/* Subtle soft backdrop wash ensuring center headline & CTAs remain 100% crisp and readable */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-full max-w-2xl h-[380px] rounded-full bg-radial from-background/90 via-background/55 to-transparent blur-2xl -z-10"
              />

              {/* Center Callout Headlines */}
              <div
                className={cn(
                  "max-w-3xl space-y-4 px-4 my-auto",
                  pointerActive ? "pointer-events-auto" : "pointer-events-none"
                )}
              >
                <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl drop-shadow-xs">
                  Your career story,
                  <br />
                  <span className="text-muted-foreground">
                    typeset with perfection.
                  </span>
                </h1>

                <p className="mx-auto max-w-xl text-balance text-sm sm:text-base text-muted-foreground leading-relaxed drop-shadow-xs">
                  Build interview-winning resumes with instant vector PDF compilation, zero AI hallucinations, and battle-tested machine readability across all ATS systems.
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    variant="invert"
                    className="h-11 sm:h-12 px-6 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02]"
                  >
                    <Link href="/editor" className="flex items-center gap-2">
                      <span>Build Your Resume</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-11 sm:h-12 rounded-xl px-6 text-xs sm:text-sm font-medium border-border/80 bg-background/80 hover:bg-muted/70 backdrop-blur-md transition-all shadow-2xs"
                  >
                    <Link href="/templates" className="flex items-center gap-2">
                      <Layers className="size-4 text-muted-foreground" />
                      <span>Explore 52 Templates</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Bottom Trust Line */}
              <div
                className={cn(
                  "flex items-center justify-center gap-4 text-[11px] sm:text-xs text-muted-foreground/80 font-medium",
                  pointerActive ? "pointer-events-auto" : "pointer-events-none"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  100% Client-Side Privacy
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">Free &amp; Open Source</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">No Hidden Subscriptions</span>
              </div>
            </motion.div>
          </ImageStreamHero>
        </motion.div>
      </div>
    </section>
  );
}

export default LumaStreamHero;
