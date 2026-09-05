"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "underline";
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}

export function Tabs({
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  orientation = "horizontal",
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (val: string) => {
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      onValueChange?.(val);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider
      value={{
        value: activeValue,
        onValueChange: handleValueChange,
        orientation,
      }}
    >
      <div
        className={cn(
          "flex",
          orientation === "vertical" ? "flex-col sm:flex-row" : "flex-col",
          className
        )}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "underline";
}

export function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: TabsListProps) {
  const ctx = React.useContext(TabsContext);
  const orientation = ctx?.orientation || "horizontal";

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={cn(
        "relative flex gap-1",
        orientation === "vertical"
          ? "flex-row sm:flex-col sm:w-48 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0"
          : "flex-row items-center",
        variant === "underline"
          ? "border-b sm:border-b-0 sm:border-r border-border/50 p-1"
          : "rounded-xl bg-muted/60 p-1 border border-border/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTab({
  value,
  className,
  children,
  ...props
}: TabsTabProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTab must be used within Tabs");

  const isSelected = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "relative flex items-center rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 outline-none select-none text-left cursor-pointer",
        isSelected
          ? "text-foreground font-semibold bg-background/80 sm:bg-transparent shadow-xs sm:shadow-none"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        className
      )}
      {...props}
    >
      {isSelected && (
        <motion.div
          layoutId="v-tabs-active-indicator"
          className="absolute inset-0 rounded-xl bg-primary/10 sm:bg-muted/80 border border-primary/20 sm:border-border/60 -z-10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      {isSelected && (
        <motion.div
          layoutId="v-tabs-active-bar"
          className="hidden sm:block absolute right-0 top-2 bottom-2 w-0.5 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <div className="relative z-10 flex items-center gap-2.5 w-full">
        {children}
      </div>
    </button>
  );
}

export interface TabsPanelProps extends HTMLMotionProps<"div"> {
  value: string;
}

export function TabsPanel({
  value,
  className,
  children,
  ...props
}: TabsPanelProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsPanel must be used within Tabs");

  if (ctx.value !== value) return null;

  return (
    <motion.div
      role="tabpanel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
