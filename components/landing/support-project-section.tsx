"use client";

import React, { useState } from "react";
import { SUPPORT_CONFIG } from "@/lib/support-config";
import { UpiDonationDialog } from "@/components/upi-donation-dialog";
import { LumaLogo } from "@/components/luma-logo";
import {
  QrCode,
  Coffee,
  Github,
  ArrowUpRight,
} from "lucide-react";

export function SupportProjectSection() {
  const [upiOpen, setUpiOpen] = useState(false);
  const githubUrl = "https://github.com/sahilbnsll/LumaCV";

  return (
    <section 
      id="support"
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-transparent text-foreground overflow-hidden selection:bg-primary/20"
      aria-labelledby="open-title"
    >
      {/* ── Background Editorial Wireframe Planes (LumaCV Signature Aesthetic) ── */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden" 
        aria-hidden="true"
      >
        {/* Left Tilted Wireframe Sheet */}
        <div 
          style={{ transform: "translateY(-50%) rotate(-16deg)" }}
          className="absolute top-1/2 left-[8%] w-[340px] sm:w-[460px] aspect-[210/297] rounded-[4px] border border-border/30 pointer-events-none"
        />
        {/* Right Tilted Wireframe Sheet */}
        <div 
          style={{ transform: "translateY(-50%) rotate(14deg)" }}
          className="absolute top-1/2 right-[5%] w-[380px] sm:w-[500px] aspect-[210/297] rounded-[4px] border border-border/40 pointer-events-none"
        />
        {/* Center Ambient Subtle Warm Tint */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-foreground/[0.015] rounded-full blur-[140px] pointer-events-none" 
        />
      </div>

      <div className="relative z-1 max-w-marketing mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] items-center gap-x-[90px] gap-y-[50px]">
          
          {/* ── Left Column: Editorial Typography & Philosophy ── */}
          <div className="max-w-[560px]">
            <h2 
              id="open-title" 
              className="font-display font-semibold text-display-2xl text-foreground"
            >
              Open source.
              <br />
              Open to contributions.
            </h2>

            <p className="mt-[26px] max-w-[460px] text-muted-foreground text-[16px] leading-[1.75]">
              LumaCV is free and open source. Sahil and a community of contributors keep it running. If
              you’d like to support the work, donations help cover hosting and development.
            </p>

            <div className="mt-7">
              <a 
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-[15px] font-medium text-foreground hover:underline underline-offset-4 group transition-colors"
              >
                <Github className="size-5" aria-hidden="true" />
                <span>Find us on GitHub</span>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* ── Right Column: Support Channels Card ── */}
          <div className="w-full max-w-[640px] lg:ml-auto [perspective:1600px]">
            {/* Notice-board tilt, more pronounced than a subtle hover-lift
                card: rotateY for depth, a touch of rotateZ so it reads as
                "hung on a wall slightly crooked" rather than a flat panel.
                Relaxes toward flat on hover instead of staying static. */}
            <div className="liquid-glass relative overflow-hidden px-10 sm:px-12 pt-10 pb-8 text-foreground shadow-xl shadow-black/[0.04] dark:shadow-black/30 [transform:rotateY(-12deg)_rotateX(3deg)_rotateZ(-1.5deg)] hover:[transform:rotateY(-3deg)_rotateX(0deg)_rotateZ(0deg)_translateY(-4px)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
              {/* Soft accent wash, the same restrained "one glow, one accent"
                  treatment used elsewhere on this page, not a flat plain card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/[0.08] blur-[60px]"
              />

              {/* Header: Logo & Brand */}
              <div className="relative flex items-center gap-3.5 text-[18px] font-medium tracking-[-0.02em] text-foreground">
                <LumaLogo size={30} />
                <span className="font-semibold font-display">LumaCV</span>
              </div>

              {/* Title */}
              <h3 className="relative mt-9 mb-8 font-display font-semibold text-[38px] sm:text-[44px] leading-[1.1] tracking-[-0.045em] text-foreground">
                Support the project
              </h3>

              {/* Channel 1: GitHub Sponsors */}
              <a
                href={SUPPORT_CONFIG.githubSponsors.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link relative flex min-h-[80px] items-center gap-5 border-t border-border/70 text-[18px] font-medium text-foreground/90 hover:text-foreground transition-colors focus-visible:outline-ring"
              >
                <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-muted/70 text-muted-foreground transition-colors group-hover/link:bg-foreground/10 group-hover/link:text-foreground">
                  <Github className="size-6" aria-hidden="true" />
                </span>
                <span>GitHub Sponsors</span>
                <ArrowUpRight className="ml-auto size-6 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/link:translate-x-1 group-hover/link:-translate-y-1" aria-hidden="true" />
              </a>

              {/* Channel 2: Buy Me a Coffee */}
              <a
                href={SUPPORT_CONFIG.buyMeACoffee.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link relative flex min-h-[80px] items-center gap-5 border-t border-border/70 text-[18px] font-medium text-foreground/90 hover:text-foreground transition-colors focus-visible:outline-ring"
              >
                <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors">
                  <Coffee className="size-6" aria-hidden="true" />
                </span>
                <span>Buy Me a Coffee</span>
                <ArrowUpRight className="ml-auto size-6 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/link:translate-x-1 group-hover/link:-translate-y-1" aria-hidden="true" />
              </a>

              {/* Channel 3: Direct UPI (India) */}
              <button
                type="button"
                onClick={() => setUpiOpen(true)}
                className="group/link relative flex min-h-[80px] w-full items-center gap-5 border-t border-border/70 text-[18px] font-medium text-foreground/90 hover:text-foreground transition-colors focus-visible:outline-ring text-left cursor-pointer"
              >
                <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors">
                  <QrCode className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col">
                  <span>Direct UPI (India)</span>
                  <span className="text-[14px] font-normal text-muted-foreground">GPay · PhonePe · Paytm</span>
                </div>
                <ArrowUpRight className="ml-auto size-6 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/link:translate-x-1 group-hover/link:-translate-y-1" aria-hidden="true" />
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Centralized UPI QR Modal */}
      <UpiDonationDialog open={upiOpen} onOpenChange={setUpiOpen} />
    </section>
  );
}

export default SupportProjectSection;
