"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import type { LoaderVariant } from "@/components/ui/loader";

interface DocumentScanner3DProps {
  stage: "extracting" | "mapping" | string;
  statusMessage: string;
  className?: string;
}

const STAGE_CONFIG: Record<string, { variant: LoaderVariant; label: string; color: string }> = {
  extracting: {
    variant: "helix",
    label: "Reading your resume",
    color: "text-primary",
  },
  mapping: {
    variant: "metaballs",
    label: "Mapping your experience",
    color: "text-primary",
  },
};

const DEFAULT_CONFIG = STAGE_CONFIG.extracting;

export function DocumentScanner3D({
  stage,
  statusMessage,
  className,
}: DocumentScanner3DProps) {
  const config = STAGE_CONFIG[stage] ?? DEFAULT_CONFIG;

  return (
    <div className={cn("flex flex-col items-center gap-5 py-4 select-none w-full", className)}>
      {/* Loader */}
      <Loader
        variant={config.variant}
        size={48}
        speed={1.2}
        label={config.label}
        className={config.color}
      />

      {/* Stage label */}
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="text-center space-y-1"
      >
        <p className="text-[13px] font-medium text-foreground tracking-tight">
          {config.label}
        </p>
        {statusMessage && (
          <p className="text-[11px] text-muted-foreground">{statusMessage}</p>
        )}
      </motion.div>
    </div>
  );
}
