"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";

export function DarkModeBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-700 opacity-25 dark:opacity-35"
    >
      <FloatingPathsBackground
        position={-1}
        className="w-full h-full min-h-screen"
      />
    </div>
  );
}

export default DarkModeBackground;
