"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Card width is the --cf-card CSS var, a clamp() so it varies by caller
// (this component's own default is 180-270px, template-carousel-showcase
// overrides to 210-290px). These bounds cover both callers' ranges, plus
// headroom for the selected/center card's larger on-screen scale, without
// falling back to the raw source PNGs (500KB+ each, up to 15 slides).
const COVERFLOW_SLIDE_SIZES = "(max-width: 640px) 220px, 400px";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  id?: string;
  href?: string;
  meta?: { label: string; value: string }[];
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width, smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  /** Any CSS length. Everything else is derived from it, so the rake scales. */
  cardWidth?: string;
  /** Aspect ratio of the card. Defaults to 210/297 (A4 resume portrait). */
  cardHeightRatio?: number;
  /** Space between cards, as a fraction of card width. */
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  showAction?: boolean;
  actionText?: string;
  /** Names the carousel for assistive tech. */
  label?: string;
  className?: string;
  cardClassName?: string;
  onSelect?: (index: number, slide: CoverflowSlide) => void;
}

export interface CoverflowCarouselHandle {
  goTo: (index: number) => void;
  nudge: (by: number) => void;
  selectedIndex: number;
}

export const CoverflowCarousel = React.forwardRef<
  CoverflowCarouselHandle,
  CoverflowCarouselProps
>(function CoverflowCarousel(
  {
    slides,
    rotate = 42,
    depth = 0.58,
    perspective = 3.2,
    falloff = 0.58,
    fade = 0.1,
    cardWidth = "clamp(180px, 22vw, 270px)",
    cardHeightRatio = 1.414,
    gap = 0.08,
    loop = true,
    showCaption = true,
    showPagination = false,
    showNavigation = true,
    showAction = true,
    actionText = "Open in Editor",
    label = "Resume template coverflow carousel",
    className,
    cardClassName,
    onSelect,
  },
  ref,
) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = React.useRef(0);
  /** Where the current settle is headed. */
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);

  /** Nearest whole card, folded back into 0..count-1. */
  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  // Paint straight to the DOM for 60fps GPU performance without React re-render overhead
  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // Fold the distance into the shorter way round the ring.
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
      card.style.filter = `brightness(${Math.max(0.4, 1 - distance * 0.16)})`;
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      const nextIndex = indexAt(target);
      setSelected(nextIndex);
      if (onSelect && slides[nextIndex]) {
        onSelect(nextIndex, slides[nextIndex]);
      }

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, onSelect, paint, slides],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  React.useImperativeHandle(
    ref,
    () => ({
      goTo,
      nudge,
      selectedIndex: selected,
    }),
    [goTo, nudge, selected],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) {
      setSelected(index);
      if (onSelect && slides[index]) {
        onSelect(index, slides[index]);
      }
    }
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const active = slides[selected];

  return (
    <div
      className={cn("w-full select-none", className)}
      style={{ ["--cf-card" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden py-8 outline-none active:cursor-grabbing"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: `calc(var(--cf-card) * ${cardHeightRatio})`,
              transformStyle: "preserve-3d",
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                onClick={() => {
                  if (index !== selected) {
                    goTo(index);
                  }
                }}
                className={cn(
                  "absolute left-1/2 top-0 overflow-hidden rounded-[3px] border border-[#dedbd3] bg-[#eee] shadow-[0_25px_30px_#0005,0_2px_2px_#0007] will-change-transform cursor-pointer transition-shadow",
                  index === selected
                    ? "shadow-[0_35px_45px_#0007,0_4px_3px_#0009] ring-1 ring-white/10"
                    : "",
                  cardClassName,
                )}
                style={{
                  width: "var(--cf-card)",
                  aspectRatio: "210 / 297",
                }}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes={COVERFLOW_SLIDE_SIZES}
                  draggable={false}
                  className="select-none object-cover object-top pointer-events-none"
                />
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <div className="flex items-center justify-center gap-6 sm:gap-8 mt-6">
            <button
              type="button"
              aria-label="Previous template"
              onClick={() => nudge(-1)}
              className="inline-flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card/80 text-foreground transition-all hover:bg-muted active:scale-95 cursor-pointer backdrop-blur-sm shadow-xs"
            >
              <ChevronLeft className="size-5" />
            </button>

            <div className="grid min-w-[200px] max-w-[340px] justify-items-center gap-1 px-2" aria-live="polite">
              <strong className="font-semibold text-[22px] sm:text-[26px] text-foreground text-center tracking-tight">
                {active?.title || "Template"}
              </strong>
              <span className="text-muted-foreground text-[12px] font-mono tabular-nums tracking-wide">
                {selected + 1} of {count}
              </span>
            </div>

            <button
              type="button"
              aria-label="Next template"
              onClick={() => nudge(1)}
              className="inline-flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card/80 text-foreground transition-all hover:bg-muted active:scale-95 cursor-pointer backdrop-blur-sm shadow-xs"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>

      {showCaption && active?.title && (
        <div
          key={selected}
          className="mt-6 flex flex-col items-center px-4 duration-300 animate-in fade-in text-center max-w-xl mx-auto"
        >
          {active.subtitle && (
            <p className="text-[13.5px] text-muted-foreground leading-relaxed">
              {active.subtitle}
            </p>
          )}

          {active.meta && active.meta.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[12px]">
              {active.meta.map((row) => (
                <span
                  key={row.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border text-[12px]"
                >
                  <span className="text-muted-foreground font-normal">{row.label}:</span>
                  <span className="font-medium text-foreground">{row.value}</span>
                </span>
              ))}
            </div>
          )}

          {showAction && active.id && (
            <div className="mt-6">
              <Link
                href={`/editor?template=${active.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground px-6 py-2.5 text-[13px] font-medium text-background shadow-xs transition-all hover:bg-foreground/90 group cursor-pointer"
              >
                <span>{actionText}</span>
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {showPagination && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              className={cn(
                "size-2 rounded-full bg-foreground transition-opacity",
                index === selected ? "opacity-100" : "opacity-30",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
});
