"use client";

import React, { useEffect, useState } from "react";
import { Users, FileText, Sparkles, type LucideIcon } from "lucide-react";

export function formatStatValue(val: number): string {
  if (!Number.isFinite(val) || val <= 0) return "0";
  return val.toLocaleString("en-US");
}

function useCountUp(target: number) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }

    const duration = 1000;
    let startTime: number | null = null;
    let frameId: number;

    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return value;
}

interface StatItemData {
  icon: LucideIcon;
  label: string;
  value: number;
}

const DEFAULT_STATS = {
  usersCount: 3,
  resumesCompiled: 125,
  bulletsTailored: 174,
};

function StatItem({ stat, index }: { stat: StatItemData; index: number }) {
  const value = useCountUp(stat.value);
  const Icon = stat.icon;

  return (
    <div
      className={`flex flex-col justify-center ${
        index === 0
          ? "md:pr-8 lg:pr-12 pb-6 md:pb-0"
          : index === 1
          ? "md:px-8 lg:px-12 py-6 md:py-0"
          : "md:pl-8 lg:pl-12 pt-6 md:pt-0"
      }`}
    >
      <dt className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium tracking-tight">
        <Icon className="size-4 shrink-0 text-muted-foreground/80" />
        <span>{stat.label}</span>
      </dt>

      <dd className="mt-3 sm:mt-4 font-bold text-4xl sm:text-5xl md:text-6xl lg:text-[68px] leading-none tracking-tight text-foreground font-sans select-all tabular-nums">
        {formatStatValue(value)}
      </dd>
    </div>
  );
}

export function TruthfulFoundations() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [asOfDate, setAsOfDate] = useState("As of Sep 12, 2026, 2:57 PM.");

  useEffect(() => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      ", " +
      now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }) +
      ".";
    setAsOfDate(`As of ${formatted}`);
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/v1/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load platform stats");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setStats({
          usersCount:
            typeof data.usersCount === "number"
              ? data.usersCount
              : DEFAULT_STATS.usersCount,
          resumesCompiled:
            typeof data.resumesCompiled === "number"
              ? data.resumesCompiled
              : DEFAULT_STATS.resumesCompiled,
          bulletsTailored:
            typeof data.bulletsTailored === "number"
              ? data.bulletsTailored
              : DEFAULT_STATS.bulletsTailored,
        });
      })
      .catch((err) => {
        console.warn("[TruthfulFoundations] Could not fetch live database stats:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const statItems: StatItemData[] = [
    {
      icon: Users,
      label: "Users",
      value: stats.usersCount,
    },
    {
      icon: FileText,
      label: "Resumes",
      value: stats.resumesCompiled,
    },
    {
      icon: Sparkles,
      label: "Bullet Points Optimized",
      value: stats.bulletsTailored,
    },
  ];

  return (
    <section
      className="container-marketing-tight py-14 sm:py-20 overflow-hidden"
      id="community"
      aria-labelledby="community-title"
    >
      <div className="mb-6 sm:mb-8">
        <h2
          id="community-title"
          className="font-semibold text-2xl sm:text-3xl lg:text-[34px] leading-tight tracking-[-0.03em] text-foreground"
        >
          Growing, out in the open.
        </h2>
      </div>

      <div className="border-y border-border/40 py-8 sm:py-10">
        <dl className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40">
          {statItems.map((stat, i) => (
            <StatItem
              key={stat.label}
              stat={stat}
              index={i}
            />
          ))}
        </dl>
      </div>

      <div className="pt-3 sm:pt-4">
        <p className="text-[11px] sm:text-xs text-muted-foreground/80 font-sans tracking-tight">
          {asOfDate}
        </p>
      </div>
    </section>
  );
}

export default TruthfulFoundations;
