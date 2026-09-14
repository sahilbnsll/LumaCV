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
            className="size-3.5 sm:size-4 text-emerald-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
        ),
        info: (
          <Info
            className="size-3.5 sm:size-4 text-primary shrink-0 mt-0.5"
            aria-hidden="true"
          />
        ),
        warning: (
          <AlertTriangle
            className="size-3.5 sm:size-4 text-amber-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
        ),
        error: (
          <AlertCircle
            className="size-3.5 sm:size-4 text-rose-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
        ),
        loading: (
          <Loader
            variant="spinner"
            size={14}
            className="text-primary shrink-0 mt-0.5"
          />
        ),
      }}
      toastOptions={{
        classNames: {
          // NOTE: width/padding/border-radius/font-size/close-button sizing
          // for the toast are NOT actually controlled here. A plain-CSS
          // `[data-sonner-toast] { ... !important }` override block in
          // globals.css (search "Apple-Inspired System Status Toast") beats
          // every one of these classes, `!`-prefixed or not, because it's a
          // later, equal-specificity `!important` rule. That block is the
          // real place to change toast dimensions; edit here only affects
          // things it doesn't touch (base color/font family/select-none).
          toast: "liquid-glass group/toast font-sans text-foreground select-none",
          title: "font-semibold tracking-tight",
          description: "font-normal",
          actionButton:
            "text-[11px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
          cancelButton:
            "text-[11px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
          closeButton: "hover:!bg-muted/60 text-muted-foreground hover:text-foreground transition-colors",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
