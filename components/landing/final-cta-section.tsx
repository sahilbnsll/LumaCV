"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileEdit } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-transparent text-center overflow-hidden"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.15]">
            Build one. It&apos;s yours to keep.
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
            No signup forms, credit cards, or paywalls. Choose an open template, edit
            directly in your browser, and download a publication-grade vector PDF.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/editor">
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-7 text-sm font-medium rounded-xl shadow-sm gap-2"
            >
              <FileEdit className="w-4 h-4" />
              <span>Start in Standalone Editor</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/builder">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-7 text-sm font-medium rounded-xl border-border/80 hover:bg-muted/40"
            >
              <span>Target a Specific Job Description</span>
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Free and open source under the MIT License.
        </p>

      </div>
    </section>
  );
}

export default FinalCtaSection;
