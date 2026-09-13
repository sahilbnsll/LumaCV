/**
 * LumaCV Motion System
 *
 * Centralized motion tokens, spring physics presets, Apple-inspired cubic-bezier
 * easings, and shared Framer Motion variants.
 *
 * Design Principles:
 * 1. Physical Coherence: Smooth deceleration curves modeled after Apple UI.
 * 2. Instant Feedback: Controls respond immediately without lag or sluggish delays.
 * 3. Bidirectional Reversibility: Scroll scrubbing and interactive states work symmetrically.
 * 4. 60fps GPU Compositing: Prefer opacity and transform3d properties.
 * 5. Accessibility First: Full respects for prefers-reduced-motion.
 */

import { type Transition, type Variants } from "framer-motion";

// ── 1. Easing Curves (Cubic Bezier) ──────────────────────────────────────────

export const TRANSITION_EASINGS = {
  /** Apple signature fluid deceleration curve */
  apple: [0.16, 1, 0.3, 1] as const,
  /** Smooth general-purpose deceleration */
  smooth: [0.23, 1, 0.32, 1] as const,
  /** Balanced in-out for symmetric transitions */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Quick snappy punch for micro-interactions */
  snappy: [0.25, 1, 0.5, 1] as const,
  /** CSS string equivalents for style props */
  css: {
    apple: "cubic-bezier(0.16, 1, 0.3, 1)",
    smooth: "cubic-bezier(0.23, 1, 0.32, 1)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    snappy: "cubic-bezier(0.25, 1, 0.5, 1)",
  },
} as const;

// ── 2. Standardized Spring Presets ──────────────────────────────────────────

export const SPRING_PRESETS = {
  /**
   * Scroll Spring: Used for all homepage and continuous scroll-linked scrubbers.
   * Provides immediate physical inertia without lagging behind or ringing.
   */
  scroll: {
    stiffness: 280,
    damping: 32,
    mass: 0.08,
    restDelta: 0.001,
  },
  /**
   * Snappy: For tabs, badges, buttons, active pill indicator slides.
   */
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 28,
    mass: 0.6,
  },
  /**
   * Gentle: For dialog modals, popovers, drawer sheets, and large cards.
   */
  gentle: {
    type: "spring" as const,
    stiffness: 240,
    damping: 25,
    mass: 0.9,
  },
  /**
   * Interactive: For hover cards, 3D tilt tracking, and drag-and-drop elements.
   */
  interactive: {
    type: "spring" as const,
    stiffness: 280,
    damping: 26,
    mass: 0.8,
  },
  /**
   * Bouncy: Subtle playful overshoot for achievement badges, checkmarks, sparkles.
   */
  bouncy: {
    type: "spring" as const,
    stiffness: 320,
    damping: 18,
    mass: 0.7,
  },
} as const;

// ── 3. Standard Timings (Milliseconds) ──────────────────────────────────────

export const MOTION_DURATIONS = {
  instant: 0.12,
  fast: 0.18,
  normal: 0.26,
  drawer: 0.28,
  slow: 0.45,
} as const;

// ── 4. Shared Animation Variants ────────────────────────────────────────────

export const MOTION_VARIANTS = {
  /** Subtle scale & fade for modals, dialogs, and popovers */
  fadeScale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: MOTION_DURATIONS.normal,
        ease: TRANSITION_EASINGS.apple,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: MOTION_DURATIONS.fast,
        ease: TRANSITION_EASINGS.apple,
      },
    },
  } satisfies Variants,

  /** Step change transition (wizard steps, upload state switches) */
  stepFade: {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATIONS.normal,
        ease: TRANSITION_EASINGS.apple,
      },
    },
    exit: {
      opacity: 0,
      y: -6,
      transition: {
        duration: MOTION_DURATIONS.fast,
        ease: TRANSITION_EASINGS.apple,
      },
    },
  } satisfies Variants,

  /** Clean vertical slide up for cards, list items */
  slideUp: {
    initial: { opacity: 0, y: 14 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_DURATIONS.normal,
        ease: TRANSITION_EASINGS.apple,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: MOTION_DURATIONS.fast,
        ease: TRANSITION_EASINGS.apple,
      },
    },
  } satisfies Variants,

  /** Crossfade for preview frames & tab bodies */
  crossfade: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: MOTION_DURATIONS.fast,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: MOTION_DURATIONS.instant,
        ease: "easeIn",
      },
    },
  } satisfies Variants,
} as const;

// ── 5. Standard Transition Presets ──────────────────────────────────────────

export const TRANSITION_PRESETS = {
  /** Responsive micro-interaction transition */
  micro: {
    duration: MOTION_DURATIONS.fast,
    ease: TRANSITION_EASINGS.apple,
  } satisfies Transition,
  /** Normal state switch transition */
  normal: {
    duration: MOTION_DURATIONS.normal,
    ease: TRANSITION_EASINGS.apple,
  } satisfies Transition,
  /** Smooth page/drawer glide transition */
  drawer: {
    duration: MOTION_DURATIONS.drawer,
    ease: TRANSITION_EASINGS.apple,
  } satisfies Transition,
} as const;
