"use client";

import {
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Loader } from "@/components/ui/loader";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      visibleToasts={3}
      duration={3200}
      closeButton={true}
      richColors={false}
      gap={8}
      offset={20}
      icons={{
        success: (
          <CheckCircle2
            className="size-4 text-emerald-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
        ),
        info: (
          <Info
            className="size-4 text-primary shrink-0 mt-0.5"
            aria-hidden="true"
          />
        ),
        warning: (
          <AlertTriangle
            className="size-4 text-amber-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
        ),
        error: (
          <AlertCircle
            className="size-4 text-rose-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
        ),
        loading: (
          <Loader
            variant="spinner"
            size={16}
            className="text-primary shrink-0 mt-0.5"
          />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "liquid-glass group/toast font-sans text-foreground shadow-[0_4px_16px_-2px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.4),0_2px_8px_-2px_rgba(0,0,0,0.3)] !rounded-2xl flex items-start gap-2.5 p-3 pr-9 w-[340px] max-w-[calc(100vw-32px)] select-none",
          title: "text-[13px] font-semibold text-foreground tracking-tight leading-snug",
          description: "text-[12px] text-muted-foreground font-normal leading-relaxed mt-0.5",
          actionButton:
            "text-xs font-medium px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
          cancelButton:
            "text-xs font-medium px-2.5 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
          closeButton:
            "!static !transform-none !border-none !bg-transparent hover:!bg-muted/60 text-muted-foreground hover:text-foreground !w-6 !h-6 !rounded-md flex items-center justify-center transition-colors shrink-0",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
