"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ALL_TEMPLATES, ResumeTemplate } from "@/lib/templates-data";
import {
  CoverflowCarousel,
  CoverflowCarouselHandle,
  CoverflowSlide,
} from "@/components/ui/coverflow-carousel";
import { ArrowRight } from "lucide-react";

const SHOWCASE_TEMPLATES: ResumeTemplate[] = [
  ALL_TEMPLATES.find((t) => t.id === "modern") || ALL_TEMPLATES[0],
  ALL_TEMPLATES.find((t) => t.id === "ats_safe") || ALL_TEMPLATES[1],
  ALL_TEMPLATES.find((t) => t.id === "classic") || ALL_TEMPLATES[2],
  ALL_TEMPLATES.find((t) => t.id === "engineering") || ALL_TEMPLATES[3],
  ALL_TEMPLATES.find((t) => t.id === "two_column") || ALL_TEMPLATES[4],
  ALL_TEMPLATES.find((t) => t.id === "compact") || ALL_TEMPLATES[5],
  ALL_TEMPLATES.find((t) => t.id === "executive") || ALL_TEMPLATES[6],
  ALL_TEMPLATES.find((t) => t.id === "switch") || ALL_TEMPLATES[7],
  ALL_TEMPLATES.find((t) => t.id === "impact") || ALL_TEMPLATES[8],
  ALL_TEMPLATES.find((t) => t.id === "cadence") || ALL_TEMPLATES[9],
  ALL_TEMPLATES.find((t) => t.id === "harbor") || ALL_TEMPLATES[10],
  ALL_TEMPLATES.find((t) => t.id === "focus") || ALL_TEMPLATES[11],
  ALL_TEMPLATES.find((t) => t.id === "forma") || ALL_TEMPLATES[12],
  ALL_TEMPLATES.find((t) => t.id === "atelier") || ALL_TEMPLATES[13],
  ALL_TEMPLATES.find((t) => t.id === "nordic") || ALL_TEMPLATES[14],
];

export function TemplateCarouselShowcase() {
  const carouselRef = useRef<CoverflowCarouselHandle>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const totalCount = ALL_TEMPLATES.length;
  const pillRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pillStripRef = useRef<HTMLDivElement>(null);

  // The strip only shows a handful of the 15 pills at once (overflow-x-auto,
  // hidden scrollbar) — without this, using the carousel's prev/next arrows
  // moves the active template forward while its pill can silently scroll out
  // of view, so the strip stops reflecting what's actually selected.
  //
  // This deliberately does NOT use scrollIntoView(): that walks every
  // scrollable ancestor up to and including the browser window, so on the
  // very first render (activeIdx starts at 0, and this section sits below
  // the fold) it was scrolling the entire page down to this strip on load —
  // not just centering the pill within its own row. Computing and applying
  // the offset directly on the strip's own scroll container keeps this
  // change fully local to that one element.
  useEffect(() => {
    const strip = pillStripRef.current;
    const btn = pillRefs.current[activeIdx];
    if (!strip || !btn) return;
    const target =
      btn.offsetLeft - strip.clientWidth / 2 + btn.offsetWidth / 2;
    strip.scrollTo({ left: target, behavior: "smooth" });
  }, [activeIdx]);

  const slides: CoverflowSlide[] = React.useMemo(
    () =>
      SHOWCASE_TEMPLATES.map((t) => ({
        id: t.id,
        src: t.previewImage,
        alt: t.name,
        title: t.name,
        subtitle: t.description || t.subtitle,
        meta: [
          { label: "Category", value: t.categoryLabel || "Professional" },
          { label: "Layout", value: t.layout === "two_column" ? "Two Column" : "Single Column" },
          { label: "ATS", value: t.isAtsCompliant ? "Safe" : "Standard" },
        ],
      })),
    [],
  );

  return (
    <section
      id="templates"
      className="scroll-mt-[30px] pt-16 pb-24 sm:pt-20 sm:pb-28 bg-transparent text-foreground overflow-hidden"
      aria-labelledby="templates-title"
    >
      <div className="container-marketing-tight">
        
        {/* Editorial Heading */}
        <div className="mb-12 sm:mb-16 flex items-end justify-between gap-10 max-[900px]:items-start max-[900px]:gap-6 max-[600px]:flex-col">
          <div>
            <h2
              id="templates-title"
              className="font-semibold text-display-lg text-foreground"
            >
              One resume.
              <br />
              52 looks.
            </h2>
          </div>
          <p className="max-w-[340px] text-muted-foreground text-[15px] sm:text-[16px] leading-relaxed">
            {totalCount} templates, all free. Pick one you like. You can change the typography, color, and layout dynamically in the editor.
          </p>
        </div>

        {/* 3D Coverflow Carousel Container */}
        <div className="relative isolate py-2">
          <CoverflowCarousel
            ref={carouselRef}
            slides={slides}
            cardWidth="clamp(210px, 24vw, 290px)"
            cardHeightRatio={1.414}
            rotate={38}
            depth={0.54}
            perspective={3.2}
            falloff={0.62}
            fade={0.14}
            gap={0.12}
            loop={true}
            showNavigation={true}
            showCaption={true}
            showAction={true}
            actionText="Open in Editor"
            onSelect={(idx) => setActiveIdx(idx)}
          />
        </div>

        {/* Streamlined Single-Row Template Capsule Strip */}
        <div className="mt-8 flex flex-col items-center">
          <div ref={pillStripRef} className="w-full max-w-3xl overflow-x-auto no-scrollbar py-2 px-2">
            <fieldset
              className="flex items-center justify-start sm:justify-center gap-1.5 p-1 rounded-full bg-card/80 border border-border backdrop-blur-md w-max mx-auto shadow-xs"
              aria-label="Choose a template"
            >
              {SHOWCASE_TEMPLATES.map((item, itemIdx) => (
                <button
                  type="button"
                  key={item.id}
                  ref={(el) => { pillRefs.current[itemIdx] = el; }}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                    itemIdx === activeIdx
                      ? "bg-foreground text-background font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                  aria-pressed={itemIdx === activeIdx}
                  onClick={() => carouselRef.current?.goTo(itemIdx)}
                >
                  {item.name}
                </button>
              ))}
            </fieldset>
          </div>

          <Link
            href="/templates"
            className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>Explore all {totalCount} templates in gallery</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}

export default TemplateCarouselShowcase;
