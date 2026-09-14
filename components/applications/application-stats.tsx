"use client";

import React from "react";
import {
  JobApplication,
  APPLICATION_STAGES,
  ApplicationStatus,
} from "@/lib/application-schema";
import { Briefcase, CheckCircle2, TrendingUp, Clock } from "lucide-react";

interface ApplicationStatsProps {
  applications: JobApplication[];
  onFilterByStatus?: (status: ApplicationStatus | null) => void;
}

export function ApplicationStats({ applications, onFilterByStatus }: ApplicationStatsProps) {
  const total = applications.length;

  const activeCount = applications.filter(
    (a) => !["rejected", "withdrawn"].includes(a.status)
  ).length;

  const interviewCount = applications.filter((a) => a.status === "interview").length;
  const offerCount = applications.filter((a) => a.status === "offer").length;

  // Rate of getting at least screening or interview from applied
  const pastAppliedCount = applications.filter(
    (a) => !["saved", "applied"].includes(a.status)
  ).length;

  const responseRate =
    total > 0 ? Math.round((pastAppliedCount / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total In Pipeline</span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground tracking-tight">{total}</span>
            <span className="text-xs text-muted-foreground">({activeCount} active)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Interviewing</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground tracking-tight">{interviewCount}</span>
            <span className="text-xs text-muted-foreground">in active rounds</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Offers Received</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground tracking-tight">{offerCount}</span>
            <span className="text-xs text-muted-foreground">extended</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Response Rate</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground tracking-tight">{responseRate}%</span>
            <span className="text-xs text-muted-foreground">past submission</span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Distribution Bar */}
      {total > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Pipeline Stage Distribution</span>
            <span className="text-muted-foreground">{total} total positions tracked</span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-2.5 w-full rounded-full bg-secondary/80 flex overflow-hidden gap-0.5 p-0.5">
            {APPLICATION_STAGES.map((stg) => {
              const count = applications.filter((a) => a.status === stg.key).length;
              if (count === 0) return null;
              const widthPct = (count / total) * 100;
              return (
                <div
                  key={stg.key}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: stg.accentHex,
                  }}
                  title={`${stg.label}: ${count} (${Math.round(widthPct)}%)`}
                  className="h-full rounded-sm transition-all duration-300"
                />
              );
            })}
          </div>

          {/* Legend Pills */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs">
            {APPLICATION_STAGES.map((stg) => {
              const count = applications.filter((a) => a.status === stg.key).length;
              return (
                <button
                  key={stg.key}
                  type="button"
                  onClick={() => onFilterByStatus?.(stg.key)}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group text-[11px]"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: stg.accentHex }}
                  />
                  <span>{stg.shortLabel}</span>
                  <span className="font-semibold text-foreground/80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
