"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, RotateCcw, Copy, Check, FileUp, AlertTriangle } from "lucide-react";
import { extractTextFromPdf, renderPdfThumbnail } from "@/lib/pdf-parser";
import { extractTextFromFile } from "@/lib/document-parser";

// ─── Sample plaintext extracted from a Typst-compiled LumaCV resume ───────────

const SAMPLE_TEXT = `Alex Morgan
alex.morgan@domain.com | +1 (415) 555-0192 | San Francisco, CA | github.com/alexmorgan

SUMMARY
Staff Infrastructure & Systems Engineer with 8+ years architecting high-scale distributed systems, edge runtimes, and vector compilation engines.

EXPERIENCE
Acme Distributed Cloud, Principal Engineer | 2021 – Present
• Architected multi-region control planes utilizing Typst-compiled runbooks and automated failover topologies.
• Reduced p99 API response latencies by 38% for 4M+ daily active sessions across global edge clusters.
• Led cross-functional engineering team of 14 staff engineers across systems infrastructure and platform reliability.

Vercel Inc., Senior Systems Engineer | 2018 – 2021
• Engineered edge data delivery layer using Next.js App Router and TypeScript, serving 500M+ monthly requests.
• Decreased cold-start times of serverless functions by 52% through lazy module evaluation and optimized memory pooling.
• Authored core open-source runtime libraries adopted by 12,000+ enterprise developers.

EDUCATION
B.S. in Computer Science, Magna Cum Laude | UC Berkeley | 2018

CORE SKILLS
Languages: TypeScript, Go, Rust, Python, Typst, SQL
Infrastructure: Kubernetes, Docker, Kafka, AWS, Cloudflare Workers, Redis, PostgreSQL`;

// ─── Main Component ────────────────────────────────────────────────────────────

export function AtsInspectorShowcase() {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("alex-morgan-modern.pdf");
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Read sample ──────────────────────────────────────────────────────────

  const handleReadSample = useCallback(async () => {
    setIsExtracting(true);
    setFileName("alex-morgan-modern.pdf");
    setUploadedFileName(null);
    setCustomThumbnail(null);
    setWarningMsg(null);

    try {
      const res = await fetch("/templates/pdf/alex-morgan-modern.pdf");
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], "alex-morgan-modern.pdf", { type: "application/pdf" });
        const text = await extractTextFromPdf(file);
        setExtractedText(text.trim() || SAMPLE_TEXT);
      } else {
        setExtractedText(SAMPLE_TEXT);
      }
    } catch {
      setExtractedText(SAMPLE_TEXT);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  // ── Process uploaded file (PDF / DOCX) ───────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setUploadedFileName(file.name);
    setIsExtracting(true);
    setExtractedText(null);
    setWarningMsg(null);

    // 1. Generate live visual thumbnail if it's a PDF
    if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
      renderPdfThumbnail(file)
        .then((res) => {
          if (res?.thumbnailUrl) {
            setCustomThumbnail(res.thumbnailUrl);
          }
        })
        .catch(() => {});
    } else {
      setCustomThumbnail(null);
    }

    // 2. Extract actual plaintext
    try {
      let text = "";
      if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
        text = await extractTextFromPdf(file);
      } else {
        text = await extractTextFromFile(file);
      }

      const trimmed = (text || "").trim();

      if (trimmed.length < 15) {
        setWarningMsg(
          "No readable text layer found in this PDF. It appears to be an image-only scan or flattened graphic. ATS scanners will read 0 words from this document."
        );
        setExtractedText(
          `[ATS Warning: Empty Text Layer]\n\nZero selectable text could be extracted from "${file.name}".\n\nMost Applicant Tracking Systems (Workday, Greenhouse, Lever) require an embedded vector text layer to parse your experience and skills. If this was exported from Photoshop, Canva, or scanned from paper, re-export as a standard PDF with selectable text.`
        );
      } else {
        setExtractedText(trimmed);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setWarningMsg("Could not parse file. Please verify it is a valid, unencrypted PDF or DOCX.");
      setExtractedText(`[Extraction Error]: ${msg}`);
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  // ── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  // ── Copy text ────────────────────────────────────────────────────────────

  const handleCopy = useCallback(() => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  }, [extractedText]);

  // ── Reset ────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setExtractedText(null);
    setUploadedFileName(null);
    setCustomThumbnail(null);
    setFileName("alex-morgan-modern.pdf");
    setWarningMsg(null);
  }, []);

  return (
    <section
      className="relative py-20 sm:py-28 bg-transparent overflow-hidden text-foreground"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Background Ghost Wireframe Cards */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 w-[360px] h-[500px] rounded-2xl border border-border/40 rotate-[14deg]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-[15%] w-[320px] h-[450px] rounded-2xl border border-border/30 rotate-[-10deg]"
      />

      <div className="relative mx-auto max-w-marketing px-6 sm:px-8">

        {/* Header: two-column editorial layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14 sm:mb-18 items-end">
          <div>
            <h2 className="font-semibold text-display-xl text-foreground">
              What the parser
              <br />
              actually reads.
            </h2>
          </div>
          <div className="lg:pl-8 flex lg:justify-end">
            <p className="text-muted-foreground text-[14.5px] leading-relaxed max-w-[400px]">
              A resume can look flawless and still parse as noise. Pull the raw text layer from a real sample, or drop in your own, nothing leaves your browser.
            </p>
          </div>
        </div>

        {/* Three-part layout: resume preview • extract actions • raw text-layer output */}
        <div className="grid grid-cols-[minmax(180px,0.8fr)_auto_minmax(260px,1.25fr)] items-center gap-[38px] text-foreground max-[600px]:grid-cols-1 max-[900px]:grid-cols-[minmax(150px,0.8fr)_minmax(260px,1.2fr)] max-[600px]:gap-6 max-[900px]:gap-[25px]">

          {/* ── 1. Left: Tilted Real Resume Preview ── */}
          <div className="min-w-0 text-center max-[900px]:col-[1]">
            <div
              className={`relative transform-[perspective(1000px)_rotateY(9deg)_rotateZ(-5deg)] mx-auto mt-3 mb-[27px] aspect-[210/297] max-w-[235px] overflow-hidden bg-[#f5f4ef] text-[#414145] shadow-[12px_20px_36px_#0006] transition-transform duration-300 max-[600px]:max-w-[165px] max-[900px]:max-w-[180px] ${
                isDragging ? "ring-4 ring-primary scale-105" : "hover:transform-[perspective(1000px)_rotateY(0deg)_rotateZ(0deg)]"
              }`}
            >
              {customThumbnail ? (
                // A user-dropped PDF's thumbnail is a client-rendered blob:
                // URL, next/image's optimizer can't fetch/resize those, so
                // this one path stays a plain <img>.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={customThumbnail}
                  alt={fileName}
                  className="size-full object-cover pointer-events-none"
                  loading="lazy"
                />
              ) : (
                <Image
                  src="/templates/alex-morgan-modern.png"
                  alt={fileName}
                  fill
                  sizes="(max-width: 600px) 165px, (max-width: 900px) 180px, 235px"
                  className="object-cover pointer-events-none"
                />
              )}

              {isDragging && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white p-4 text-center">
                  <FileUp className="size-7 animate-bounce text-primary" />
                  <span className="text-xs font-semibold">Drop your PDF here</span>
                </div>
              )}
            </div>

            <p className="wrap-anywhere text-[14px] font-normal text-foreground">{fileName}</p>
            <span className="mt-[5px] block text-muted-foreground text-[12px]">
              {uploadedFileName ? "Processed locally, never uploaded" : "A real compiled sample"}
            </span>
          </div>

          {/* ── 2. Center: Action Button Card & Link ── */}
          <div className="flex flex-col items-center gap-[15px] max-[900px]:col-[1] max-[600px]:row-auto max-[900px]:row-[2] max-[600px]:flex-row max-[600px]:flex-wrap max-[600px]:justify-center max-[600px]:gap-2.5">
            <button
              type="button"
              onClick={handleReadSample}
              disabled={isExtracting}
              className="motion-safe:active:not-disabled:not-focus-visible:transform-[scale(0.97)] flex min-w-[140px] flex-col items-center gap-[14px] rounded border border-border bg-card px-4 py-5 text-foreground text-[13px] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:not-disabled:border-foreground/30 disabled:cursor-progress max-[900px]:flex-row max-[900px]:gap-2.5 max-[900px]:py-[13px] cursor-pointer shadow-xs"
            >
              {isExtracting && !uploadedFileName ? (
                <svg className="animate-spin h-5 w-5 text-[#deb89b]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <ArrowRight
                  className="w-5 h-5 text-[#deb89b] transition-colors"
                  strokeWidth={1.75}
                />
              )}
              <span className="text-[13px] font-medium text-foreground">
                {isExtracting && !uploadedFileName ? "Extracting…" : "Extract sample text"}
              </span>
            </button>

            <label className="relative inline-flex min-h-touch cursor-pointer items-center p-2 text-[13px] underline underline-offset-[5px] text-muted-foreground hover:text-foreground transition-colors">
              <span>{isExtracting && uploadedFileName ? "Extracting…" : "Or upload yours"}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="absolute inset-0 w-full cursor-pointer opacity-0"
                onChange={handleFileUpload}
              />
            </label>

            {extractedText && (
              <button
                type="button"
                onClick={handleReset}
                className="min-h-9 px-3 py-1.5 text-muted-foreground hover:text-foreground text-[12px] transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* ── 3. Right: Extracted Text Terminal ── */}
          <div className="min-w-0 overflow-hidden rounded border border-border bg-card shadow-xs max-[600px]:col-[1] max-[900px]:col-[2] max-[600px]:row-auto max-[900px]:row-[1/3]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-border border-b px-[22px] py-[18px] text-[13px]">
              <span className="font-medium text-foreground">Raw text layer</span>
              <span className="text-muted-foreground text-[11px] font-mono">
                {isExtracting ? "Extracting…" : extractedText ? "Extraction complete" : "Awaiting input"}
              </span>
            </div>

            {/* Warning banner if image scan */}
            {warningMsg && (
              <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{warningMsg}</span>
              </div>
            )}

            {/* Output Body (Exact h-80 = 320px with overscroll-contain) */}
            <section
              className="h-80 overflow-auto overscroll-contain p-[23px] text-left max-[600px]:h-[280px] max-[600px]:p-5"
              tabIndex={0}
              aria-label="Extracted text"
            >
              {!extractedText && !isExtracting && (
                <p className="max-w-[300px] text-[14px] leading-[1.8] text-muted-foreground">
                  Nothing extracted yet. Run the sample, or drop in a PDF to see exactly what an ATS parser pulls from it.
                </p>
              )}
              {isExtracting && (
                <div className="h-full flex flex-col items-center justify-center gap-2.5">
                  <svg className="animate-spin h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="text-muted-foreground text-[12px] font-mono">Extracting in your browser…</span>
                </div>
              )}
              {extractedText && !isExtracting && (
                <div className="space-y-2">
                  <div className="flex justify-end pb-1">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Copy extracted plaintext"
                    >
                      {hasCopied ? (
                        <>
                          <Check className="size-3 text-foreground" />
                          <span className="text-foreground">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="wrap-anywhere whitespace-pre-wrap font-mono text-[12px] leading-[1.9] text-foreground/90 select-text">
                    {extractedText}
                  </pre>
                </div>
              )}
            </section>

            {/* Footer with exact padding & arrow */}
            <Link
              href="/ats"
              className="flex items-center justify-between gap-[15px] border-border border-t px-[22px] py-[18px] text-[12px] text-foreground hover:underline hover:underline-offset-4 transition-colors group"
            >
              <span>Run the full ATS Checker</span>
              <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
