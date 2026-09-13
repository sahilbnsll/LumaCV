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

          {/* ── Right Column: 3D Skewed Physical Paper Support Memo ── */}
          <div className="w-full max-w-[480px] lg:ml-auto">
            <div className="transform-[perspective(1000px)_rotateY(-7deg)_rotateZ(2deg)] hover:transform-[perspective(1000px)_rotateY(-3deg)_rotateZ(1deg)] transition-transform duration-300 relative rounded-[2px_4px_2px_2px] bg-[#d9dad5] px-[30px] sm:px-[35px] pt-[29px] pb-6 text-[#2d2e30] shadow-[1px_1px_0_#fafaf3_inset,1px_2px_0_#a9aaa6,2px_4px_0_#6b6c6a,8px_19px_30px_#0005] after:absolute after:top-0 after:right-0 after:size-[26px] after:rounded-[0_0_0_4px] after:bg-[#f4f5ec] after:shadow-[-1px_2px_2px_#0002] after:content-['']">
              
              {/* Memo Header: Logo & Brand */}
              <div className="flex items-center gap-[11px] pr-5 text-[14px] font-medium tracking-[-0.02em] text-[#2d2e30]">
                <LumaLogo size={22} />
                <span className="font-semibold font-display">LumaCV</span>
              </div>

              {/* Memo Title */}
              <h3 className="mt-[28px] mb-6 font-display font-semibold text-[26px] sm:text-[28px] leading-[1.2] tracking-[-0.045em] text-[#2d2e30]">
                Support the project
              </h3>

              {/* Channel 1: GitHub Sponsors */}
              <a 
                href={SUPPORT_CONFIG.githubSponsors.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link flex min-h-[64px] items-center gap-[14px] border-t border-[#2d2e3038] text-[14px] font-medium text-[#2d2e30] hover:text-black transition-colors focus-visible:outline-[#37383a]"
              >
                <Github className="size-[21px] shrink-0 text-[#2d2e30]" aria-hidden="true" />
                <span>GitHub Sponsors</span>
                <ArrowUpRight className="ml-auto size-5 text-[#2d2e30] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/link:translate-x-1 group-hover/link:-translate-y-1" aria-hidden="true" />
              </a>

              {/* Channel 2: Buy Me a Coffee */}
              <a 
                href={SUPPORT_CONFIG.buyMeACoffee.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link flex min-h-[64px] items-center gap-[14px] border-t border-[#2d2e3038] text-[14px] font-medium text-[#2d2e30] hover:text-black transition-colors focus-visible:outline-[#37383a]"
              >
                <Coffee className="size-[21px] shrink-0 text-[#2d2e30]" aria-hidden="true" />
                <span>Buy Me a Coffee</span>
                <ArrowUpRight className="ml-auto size-5 text-[#2d2e30] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/link:translate-x-1 group-hover/link:-translate-y-1" aria-hidden="true" />
              </a>

              {/* Channel 3: Direct UPI (India) */}
              <button 
                type="button"
                onClick={() => setUpiOpen(true)}
                className="group/link flex min-h-[64px] w-full items-center gap-[14px] border-t border-[#2d2e3038] text-[14px] font-medium text-[#2d2e30] hover:text-black transition-colors focus-visible:outline-[#37383a] text-left cursor-pointer"
              >
                <QrCode className="size-[21px] shrink-0 text-[#2d2e30]" aria-hidden="true" />
                <div className="flex flex-col">
                  <span>Direct UPI (India)</span>
                  <span className="text-[11px] font-normal opacity-75">GPay · PhonePe · Paytm</span>
                </div>
                <ArrowUpRight className="ml-auto size-5 text-[#2d2e30] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/link:translate-x-1 group-hover/link:-translate-y-1" aria-hidden="true" />
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
