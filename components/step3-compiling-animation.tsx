"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/loader";
import type { LoaderVariant } from "@/components/ui/loader";

interface Step3CompilingAnimationProps {
  stageIndex: number;
  stageId: string;
}

// Each pipeline stage gets a distinct, intentionally chosen loader variant
// that semantically matches what's happening in that stage.
const STAGE_CONFIG: Array<{
  variant: LoaderVariant;
  label: string;
  description: string;
  color: string;
}> = [
  {
    // Stage 0: Analyzing JD — dot-matrix feels like parsing a grid of keywords
    variant: "dot-matrix",
    label: "Analyzing job requirements",
    description: "Extracting keywords, skills, and role signals",
    color: "text-primary",
  },
  {
    // Stage 1: Semantic mapping — metaballs visually merges two blobs (resume ↔ JD)
    variant: "metaballs",
    label: "Aligning your experience",
    description: "Matching your background against the role",
    color: "text-sky-500",
  },
  {
    // Stage 2: Impact tuning — morph transforms shapes, like rewriting bullets
    variant: "morph",
    label: "Tuning impact and language",
    description: "Strengthening action verbs and quantified outcomes",
    color: "text-violet-500",
  },
  {
    // Stage 3: Accuracy audit — newton's cradle represents precise, methodical checking
    variant: "newton",
    label: "Auditing for accuracy",
    description: "Verifying every claim against your source resume",
    color: "text-amber-500",
  },
  {
    // Stage 4: Document build — bars filling up signals construction / compilation
    variant: "bars",
    label: "Building your document",
    description: "Compiling the final Typst layout",
    color: "text-emerald-500",
  },
];

export function Step3CompilingAnimation({
  stageIndex,
  stageId,
}: Step3CompilingAnimationProps) {
  const config = STAGE_CONFIG[Math.min(stageIndex, STAGE_CONFIG.length - 1)];

  return (
    <div className="flex flex-col items-center gap-5 py-4 select-none w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={stageId}
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -8 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-4"
        >
          {/* Stage-specific loader */}
          <Loader
            variant={config.variant}
            size={52}
            speed={1.3}
            label={config.label}
            className={config.color}
          />

          {/* Stage text */}
          <div className="text-center space-y-1 max-w-xs">
            <p className="text-sm font-medium text-foreground tracking-tight">
              {config.label}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {config.description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
