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

// 5-pointed celestial star icon (✩ / ★) with inner specular gleam
function CelestialStarFive({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 1.2L15.35 8L22.8 9.09L17.4 14.36L18.67 21.78L12 18.27L5.33 21.78L6.6 14.36L1.2 9.09L8.65 8L12 1.2Z"
        fill="currentColor"
      />
      {/* Specular starlight center core */}
      <circle cx="12" cy="12" r="2.2" fill="#FFFDF0" opacity="0.95" />
    </svg>
  );
}

// 4-pointed celestial diamond sparkle icon (✦ / ⋆) with inner core
function CelestialSparkleFour({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
        fill="currentColor"
      />
      {/* Specular starlight center core */}
      <circle cx="12" cy="12" r="2" fill="#FFFDF0" opacity="0.95" />
    </svg>
  );
}

export function PulsingHeart({ className, size = 48 }: PulsingHeartProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative mx-auto inline-flex items-center justify-center p-3 select-none pointer-events-none",
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

        @keyframes star-twinkle-top {
          0% {
            transform: scale(0.9) rotate(-10deg) translateZ(0);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.2) rotate(15deg) translateZ(0);
            opacity: 1;
            filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.95));
          }
          100% {
            transform: scale(0.9) rotate(-10deg) translateZ(0);
            opacity: 0.85;
          }
        }

        @keyframes star-twinkle-bottom {
          0% {
            transform: scale(1.18) rotate(12deg) translateZ(0);
            opacity: 1;
            filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.95));
          }
          50% {
            transform: scale(0.85) rotate(-12deg) translateZ(0);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.18) rotate(12deg) translateZ(0);
            opacity: 1;
            filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.95));
          }
        }

        @keyframes star-orbit-micro {
          0%, 100% {
            transform: scale(0.7) translateY(0) translateZ(0);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.3) translateY(-3px) translateZ(0);
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

        .anim-star-top {
          animation: star-twinkle-top 2.2s ease-in-out infinite;
          will-change: transform, opacity, filter;
          backface-visibility: hidden;
        }

        .anim-star-bottom {
          animation: star-twinkle-bottom 2.4s ease-in-out infinite -0.6s;
          will-change: transform, opacity, filter;
          backface-visibility: hidden;
        }

        .anim-star-micro {
          animation: star-orbit-micro 1.8s ease-in-out infinite -0.4s;
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
      <div className="relative inline-flex items-center justify-center text-[#ff2a5f] dark:text-rose-500 drop-shadow-[0_2px_14px_rgba(244,63,94,0.5)] anim-heart-pulse">
        <PhosphorHeart size={size} />
      </div>

      {/* 6. Top-Right Celestial Stars Cluster (⋆｡°✩ aesthetic) */}
      <div className="absolute -top-1 -right-1 z-10 pointer-events-none">
        {/* Main 5-Point Celestial Star ✩ */}
        <div className="anim-star-top text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]">
          <CelestialStarFive size={Math.round(size * 0.46)} />
        </div>
        {/* Companion Micro Twinkle Starlet ⋆ */}
        <div className="absolute -top-1 -right-2.5 anim-star-micro text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]">
          <CelestialSparkleFour size={Math.round(size * 0.24)} />
        </div>
        {/* Fairy Stardust Dot ° */}
        <div className="absolute top-4 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-300/80 animate-pulse" />
      </div>

      {/* 7. Bottom-Left Celestial Diamond Sparkle Star Cluster (✦ ⋆) */}
      <div className="absolute -bottom-1 -left-1 z-10 pointer-events-none">
        {/* Main 4-Point Diamond Sparkle Star ✦ */}
        <div className="anim-star-bottom text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]">
          <CelestialSparkleFour size={Math.round(size * 0.42)} />
        </div>
        {/* Companion Micro Starlet ⋆ */}
        <div className="absolute -bottom-1 -left-2 anim-star-micro text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]">
          <CelestialSparkleFour size={Math.round(size * 0.22)} />
        </div>
      </div>
    </div>
  );
}

export default PulsingHeart;



