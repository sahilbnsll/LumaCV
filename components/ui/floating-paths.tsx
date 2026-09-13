"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FloatingPathsBackground({
  position = -1,
  children,
  className,
}: {
  position?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
    duration: 20 + ((i * 7) % 11),
  }));

  return (
    <div className={cn("w-full relative", className)}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="w-full h-full text-slate-400 dark:text-white transition-colors duration-700"
          viewBox="0 0 696 316"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={0.08 + path.id * 0.022}
              initial={{ pathLength: 0.3, opacity: 0.6 }}
              animate={{
                pathLength: 1,
                opacity: [0.3, 0.65, 0.3],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: path.duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </svg>
      </div>
      {children}
    </div>
  );
}

export default FloatingPathsBackground;
