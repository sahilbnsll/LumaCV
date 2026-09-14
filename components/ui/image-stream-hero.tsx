"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Card width is `p.cardWidth` cqw (19cqw by default) of the hero's own
// container, not the viewport, so this can't be a precise vw-based `sizes`
// string. These bounds comfortably cover the container's likely rendered
// width at both breakpoints (with headroom for the 3D stream's exit-scale
// growth, up to 1.28x) without falling back to the raw source PNGs
// (500KB+ each, at up to 15 cards eager-loading before this fix).
const STREAM_CARD_SIZES = "(max-width: 640px) 140px, 360px";

/* ── Continuous 3D Resume Stream Corridor ───────────────────────────
 *
 * Trajectory:
 * Deep background (center) -> Zoom/approach viewer -> Sweep outward (left/right) -> Fade out
 *
 * Characteristics:
 * 1. True 3D projection: cards emerge deep near vanishing point (Z: ~-250cqw)
 *    and advance toward the camera with geometric scale expansion.
 * 2. Center-first emergence: cards stay near the central corridor during
 *    approach, then bank and sweep outward laterally as they pass the viewer.
 * 3. Phase-interleaved dual rails: left and right streams are offset by half
 *    a phase step so cards alternate continuously without empty gaps.
 * 4. Butter-smooth dissolve: newborn cards fade in from depth; exiting cards
 *    fade out past the flanks to prevent clipping tears.
 * 5. Full prefers-reduced-motion accessibility support.
 * ─────────────────────────────────────────────────────────────────── */

export type CorridorPath = {
  /** Strength of the 3D perspective in cqw units. @default 42 */
  perspective?: number;
  /** Card width in cqw units. @default 19 */
  cardWidth?: number;
  /** Card height in cqw units (A4 aspect ~1.414 ratio). @default 26.8 */
  cardHeight?: number;
  /** Card border radius in cqw units. @default 0.5 */
  cardRadius?: number;
  /** Apparent scale at birth deep in background. @default 0.14 */
  birthScale?: number;
  /** Apparent scale at exit near viewport. @default 1.28 */
  exitScale?: number;
  /** Lateral offset from center at birth. @default 2.5 */
  lateralBirth?: number;
  /** Lateral offset from center at exit sweep. @default 64 */
  lateralExit?: number;
  /** Exponent controlling when lateral sweep happens. Keeps cards centered during approach. @default 2.5 */
  fanPower?: number;
  /** Y-rotation angle at birth, degrees. @default 4 */
  turnBirth?: number;
  /** Y-rotation angle at exit, degrees. @default 24 */
  turnExit?: number;
  /** Pitch angle (X-rotation) amplitude, degrees. @default 2 */
  pitchMax?: number;
  /** Roll angle (Z-rotation) at exit, degrees. @default 3 */
  bankExit?: number;
  /** Keyframe stops used to trace the curve. @default 36 */
  stops?: number;
};

const DEFAULT_PATH: Required<CorridorPath> = {
  perspective: 42,
  cardWidth: 19,
  cardHeight: 26.8,
  cardRadius: 0.5,
  birthScale: 0.14,
  exitScale: 1.28,
  lateralBirth: 2.5,
  lateralExit: 64,
  fanPower: 2.5,
  turnBirth: 4,
  turnExit: 24,
  pitchMax: 2,
  bankExit: 3,
  stops: 24,
};

/** Sample the continuous path so CSS keyframes execute seamlessly on the GPU. */
function generateKeyframes(dir: 1 | -1, name: string, p: Required<CorridorPath>) {
  const steps: string[] = [];
  for (let s = 0; s <= p.stops; s++) {
    const u = s / p.stops;

    // 1. Geometric scale growth (constant perceived visual rate)
    const scale = p.birthScale * Math.pow(p.exitScale / p.birthScale, u);

    // 2. Physical Z-depth according to standard perspective projection: scale = P / (P - z) => z = P * (1 - 1/scale)
    const z = p.perspective * (1 - 1 / scale);

    // 3. Lateral position: stays in the center corridor during deep approach, then smoothly sweeps outward
    const lateralFactor = Math.pow(u, p.fanPower);
    const x = dir * (p.lateralBirth + (p.lateralExit - p.lateralBirth) * lateralFactor);

    // 4. Aerodynamic 3D rotations: yaw (Y), pitch (X), roll/bank (Z)
    const turnY = -dir * (p.turnBirth + (p.turnExit - p.turnBirth) * Math.pow(u, 1.3));
    const pitchX = p.pitchMax * Math.sin(u * Math.PI);
    const bankZ = -dir * (p.bankExit * Math.pow(u, 1.5));

    // 5. Opacity: smooth fade-in from vanishing point, full visibility in corridor, smooth fade-out on outer flanks
    let opacity = 1;
    if (u < 0.10) {
      opacity = u / 0.10;
    } else if (u > 0.82) {
      opacity = (1 - u) / 0.18;
    }

    steps.push(
      `${(u * 100).toFixed(2)}%{` +
        `transform:translate3d(${x.toFixed(2)}cqw,0,${z.toFixed(2)}cqw) ` +
        `rotateX(${pitchX.toFixed(2)}deg) ` +
        `rotateY(${turnY.toFixed(2)}deg) ` +
        `rotateZ(${bankZ.toFixed(2)}deg);` +
        `opacity:${Math.max(0, Math.min(1, opacity)).toFixed(3)};}`
    );
  }
  return `@keyframes ${name}{${steps.join("")}}`;
}

export type StreamImage = {
  src: string;
  alt?: string;
};

export type ImageStreamHeroProps = {
  images: StreamImage[];
  cards?: number;
  speed?: number;
  axis?: number;
  path?: CorridorPath;
  children?: React.ReactNode;
  className?: string;
};

export function ImageStreamHero({
  images,
  cards = 8,
  speed = 26,
  axis = 54,
  path,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & ImageStreamHeroProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const rightAnim = `luma-stream-r-${id}`;
  const leftAnim = `luma-stream-l-${id}`;
  const cardClass = `luma-card-${id}`;

  const p = React.useMemo(() => ({ ...DEFAULT_PATH, ...path }), [path]);

  const css = React.useMemo(
    () =>
      `${generateKeyframes(1, rightAnim, p)}${generateKeyframes(-1, leftAnim, p)}` +
      `@media(prefers-reduced-motion:reduce){` +
      `.${cardClass}{animation:none!important;opacity:0.6!important;transform:none!important;}` +
      `}`,
    [rightAnim, leftAnim, cardClass, p]
  );

  // Distribute images evenly between left and right rails
  const totalCount = cards * 2;
  const rightImages = React.useMemo(
    () =>
      Array.from({ length: cards }, (_, i) => {
        const idx = (i * 2) % Math.max(images.length, 1);
        return images[idx] || images[0];
      }),
    [cards, images]
  );

  const leftImages = React.useMemo(
    () =>
      Array.from({ length: cards }, (_, i) => {
        const idx = (i * 2 + 1) % Math.max(images.length, 1);
        return images[idx] || images[0];
      }),
    [cards, images]
  );

  return (
    <div
      className={cn("relative overflow-hidden w-full", className)}
      {...props}
      style={{ containerType: "inline-size", ...props.style }}
    >
      <style>{css}</style>

      {/* 3D Viewport Space */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
        style={{
          perspective: `${p.perspective}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
        }}
      >
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Right Stream Rail */}
          {rightImages.map((img, i) => {
            const delay = -((i * speed) / cards);
            return (
              <div
                key={`right-${i}`}
                data-luma-stream-card="true"
                className={cn(
                  cardClass,
                  "absolute overflow-hidden bg-card rounded-[inherit] border border-border/50",
                  "shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.45)]",
                  "transition-opacity duration-300"
                )}
                style={{
                  left: "50%",
                  top: `${axis}%`,
                  width: `${p.cardWidth}cqw`,
                  height: `${p.cardHeight}cqw`,
                  marginLeft: `${-p.cardWidth / 2}cqw`,
                  marginTop: `${-p.cardHeight / 2}cqw`,
                  borderRadius: `${p.cardRadius}cqw`,
                  animation: `${rightAnim} ${speed}s linear infinite`,
                  animationDelay: `${delay.toFixed(3)}s`,
                  backfaceVisibility: "hidden",
                  willChange: "transform, opacity",
                }}
              >
                {img?.src ? (
                  <Image
                    src={img.src}
                    alt={img.alt ?? "Resume Template"}
                    fill
                    sizes={STREAM_CARD_SIZES}
                    className="object-cover object-top select-none pointer-events-none"
                    draggable={false}
                  />
                ) : null}
                {/* Delicate subtle Apple-style glass rim light */}
                <div className="absolute inset-0 rounded-[inherit] pointer-events-none border border-white/20 dark:border-white/10" />
              </div>
            );
          })}

          {/* Left Stream Rail (Interleaved by 0.5 phase step for unbroken continuous rhythm) */}
          {leftImages.map((img, i) => {
            const delay = -(((i + 0.5) * speed) / cards);
            return (
              <div
                key={`left-${i}`}
                data-luma-stream-card="true"
                className={cn(
                  cardClass,
                  "absolute overflow-hidden bg-card rounded-[inherit] border border-border/50",
                  "shadow-[0_10px_35px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_45px_rgba(0,0,0,0.45)]",
                  "transition-opacity duration-300"
                )}
                style={{
                  left: "50%",
                  top: `${axis}%`,
                  width: `${p.cardWidth}cqw`,
                  height: `${p.cardHeight}cqw`,
                  marginLeft: `${-p.cardWidth / 2}cqw`,
                  marginTop: `${-p.cardHeight / 2}cqw`,
                  borderRadius: `${p.cardRadius}cqw`,
                  animation: `${leftAnim} ${speed}s linear infinite`,
                  animationDelay: `${delay.toFixed(3)}s`,
                  backfaceVisibility: "hidden",
                  willChange: "transform, opacity",
                }}
              >
                {img?.src ? (
                  <Image
                    src={img.src}
                    alt={img.alt ?? "Resume Template"}
                    fill
                    sizes={STREAM_CARD_SIZES}
                    className="object-cover object-top select-none pointer-events-none"
                    draggable={false}
                  />
                ) : null}
                {/* Delicate subtle Apple-style glass rim light */}
                <div className="absolute inset-0 rounded-[inherit] pointer-events-none border border-white/20 dark:border-white/10" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Foreground Hero Content Layer */}
      {children}
    </div>
  );
}

export default ImageStreamHero;
