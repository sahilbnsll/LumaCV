"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AppHeader } from "@/components/app-header";
import { LumaStreamHero } from "@/components/landing/luma-stream-hero";

// Below-the-fold sections are code-split into separate chunks so the initial
// bundle only has to parse/execute the hero, SSR stays on (no ssr:false) so
// crawlers and first paint still get full HTML content, this only affects how
// the client JS is chunked and fetched.
const ResumeStackHero = dynamic(() => import("@/components/landing/resume-stack-hero").then((m) => m.ResumeStackHero));
const TruthfulFoundations = dynamic(() => import("@/components/landing/truthful-foundations").then((m) => m.TruthfulFoundations));
const TemplateCarouselShowcase = dynamic(() => import("@/components/landing/template-carousel-showcase").then((m) => m.TemplateCarouselShowcase));
const StandaloneEditorFeature = dynamic(() => import("@/components/landing/standalone-editor-feature").then((m) => m.StandaloneEditorFeature));
const AtsInspectorShowcase = dynamic(() => import("@/components/landing/ats-inspector-showcase").then((m) => m.AtsInspectorShowcase));
const FactPreservingAiShowcase = dynamic(() => import("@/components/landing/fact-preserving-ai-showcase").then((m) => m.FactPreservingAiShowcase));
const ExportFormatShowcase = dynamic(() => import("@/components/landing/export-format-showcase").then((m) => m.ExportFormatShowcase));
const SupportProjectSection = dynamic(() => import("@/components/landing/support-project-section").then((m) => m.SupportProjectSection));
const FinalCtaSection = dynamic(() => import("@/components/landing/final-cta-section").then((m) => m.FinalCtaSection));
const EditorialFooter = dynamic(() => import("@/components/landing/editorial-footer").then((m) => m.EditorialFooter));

export default function HomeContent() {
  return (
    <div className="homepage min-h-screen flex flex-col bg-transparent text-foreground selection:bg-primary/20 selection:text-foreground">
      {/* Universal Navigation Header */}
      <AppHeader />

      {/* Main Editorial Story Flow */}
      <main id="main-content" className="flex-1 flex flex-col overflow-x-clip w-full max-w-full">
        {/* 1. First Hero: 3D Dual-Rail Image Stream Corridor showcasing Typst templates. This is the page's one <h1>. */}
        <LumaStreamHero />

        {/* 2. Interactive Resume Stack Hero with 3D sculpture and live candidate dock */}
        <ResumeStackHero />

        {/* 2. Truthful Foundations: Verified facts derived from single sources of truth */}
        <TruthfulFoundations />

        {/* 3. Template Showcase: 3D fan carousel with dynamic ALL_TEMPLATES library */}
        <TemplateCarouselShowcase />

        {/* 4. Standalone Editor Feature: Direct-manipulation workstation highlight */}
        <StandaloneEditorFeature />

        {/* 5. ATS Scanner Showcase: Plaintext extraction & section analysis */}
        <AtsInspectorShowcase />

        {/* 6. AI Review Showcase: Fact-preserving bullet optimization without hallucination */}
        <FactPreservingAiShowcase />

        {/* 7. Export Showcase: Real client-side downloads for PDF, JSON, MD, and TYP */}
        <ExportFormatShowcase />

        {/* 8. Support & Open Source: Centralized UPI dialog, Buy Me a Coffee, GitHub */}
        <SupportProjectSection />

        {/* 9. Final Closing CTA */}
        <FinalCtaSection />
      </main>

      {/* 10. Editorial Footer with 4-column directory and subtle watermark */}
      <EditorialFooter />
    </div>
  );
}
