"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PulsingHeartProps {
  className?: string;
  size?: number;
}

// Phosphor Heart Icon SVG path (weight="fill")
function PhosphorHeart({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z" />
    </svg>
  );
}

// Phosphor Sparkle Icon SVG path (weight="fill")
function PhosphorSparkle({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M216,128a88.1,88.1,0,0,0-80-80,8,8,0,0,0-16,0,88.1,88.1,0,0,0-80,80,8,8,0,0,0,0,16,88.1,88.1,0,0,0,80,80,8,8,0,0,0,16,0,88.1,88.1,0,0,0,80-80A8,8,0,0,0,216,128Z" />
    </svg>
  );
}

export function PulsingHeart({ className, size = 48 }: PulsingHeartProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative mx-auto inline-flex items-center justify-center select-none pointer-events-none",
        className
      )}
    >
      {/* Self-contained 100% GPU-accelerated continuous animation styles */}
      <style>{`
        @keyframes heart-pulse-continuous {
          0% {
            transform: scale(1) translateZ(0);
          }
          50% {
            transform: scale(1.15) translateZ(0);
          }
          100% {
            transform: scale(1) translateZ(0);
          }
        }

        @keyframes heart-aura-continuous {
          0% {
            transform: scale(1.18) translateZ(0);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.32) translateZ(0);
            opacity: 0.85;
          }
          100% {
            transform: scale(1.18) translateZ(0);
            opacity: 0.5;
          }
        }

        @keyframes heart-ripple-continuous {
          0% {
            transform: scale(1.02) translateZ(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.72) translateZ(0);
            opacity: 0;
          }
        }

        @keyframes sparkle-continuous-1 {
          0% {
            transform: scale(0.8) rotate(0deg) translateZ(0);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.22) rotate(90deg) translateZ(0);
            opacity: 1;
          }
          100% {
            transform: scale(0.8) rotate(180deg) translateZ(0);
            opacity: 0.65;
          }
        }

        @keyframes sparkle-continuous-2 {
          0% {
            transform: scale(1.2) rotate(180deg) translateZ(0);
            opacity: 1;
          }
          50% {
            transform: scale(0.75) rotate(90deg) translateZ(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.2) rotate(0deg) translateZ(0);
            opacity: 1;
          }
        }

        .anim-heart-pulse {
          animation: heart-pulse-continuous 1.2s ease-in-out infinite;
          will-change: transform;
          backface-visibility: hidden;
        }

        .anim-heart-aura {
          animation: heart-aura-continuous 1.2s ease-in-out infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .anim-heart-ripple-1 {
          animation: heart-ripple-continuous 1.6s cubic-bezier(0.1, 0.7, 0.3, 1) infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .anim-heart-ripple-2 {
          animation: heart-ripple-continuous 1.6s cubic-bezier(0.1, 0.7, 0.3, 1) infinite -0.8s;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .anim-sparkle-1 {
          animation: sparkle-continuous-1 2.2s ease-in-out infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .anim-sparkle-2 {
          animation: sparkle-continuous-2 2.2s ease-in-out infinite;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }
      `}</style>

      {/* 1. Ambient soft pink bloom aura */}
      <div className="pointer-events-none absolute -inset-5 rounded-full bg-rose-500/20 blur-xl" />

      {/* 2. Concentric Soft Pink Heart Outline (Synchronized continuous breathing) */}
      <div className="absolute inset-0 flex items-center justify-center text-pink-300 dark:text-pink-400/50 anim-heart-aura pointer-events-none">
        <PhosphorHeart size={size} />
      </div>

      {/* 3. Ripple Wave 1 (Continuous outward radiating pulse) */}
      <div className="absolute inset-0 flex items-center justify-center text-rose-400 anim-heart-ripple-1 pointer-events-none">
        <PhosphorHeart size={size} />
      </div>

      {/* 4. Ripple Wave 2 (Interleaved 50% phase offset - eliminates any gap or pause) */}
      <div className="absolute inset-0 flex items-center justify-center text-rose-400 anim-heart-ripple-2 pointer-events-none">
        <PhosphorHeart size={size} />
      </div>

      {/* 5. Main Center Vibrant Red Heart (Seamless continuous pulse - zero pause) */}
      <div className="relative inline-flex items-center justify-center text-[#ff2a5f] dark:text-rose-500 drop-shadow-[0_2px_12px_rgba(244,63,94,0.45)] anim-heart-pulse">
        <PhosphorHeart size={size} />
      </div>

      {/* 6. Top-Right Golden Twinkling Sparkle (Continuous shimmer, never pauses) */}
      <div className="absolute -top-2.5 -right-3 text-amber-400 z-10 drop-shadow-xs anim-sparkle-1">
        <PhosphorSparkle size={Math.round(size * 0.38)} className="text-amber-400" />
      </div>

      {/* 7. Bottom-Left Golden Twinkling Sparkle (Continuous counter-shimmer) */}
      <div className="absolute -bottom-1.5 -left-3 text-amber-400 z-10 drop-shadow-xs anim-sparkle-2">
        <PhosphorSparkle size={Math.round(size * 0.34)} className="text-amber-400" />
      </div>
    </div>
  );
}

export default PulsingHeart;
