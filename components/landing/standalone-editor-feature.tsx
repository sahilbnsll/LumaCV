"use client";

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  SlidersHorizontal,
  FileOutput,
  ArrowRight,
  Eye,
  Pencil,
  Check,
  RotateCcw,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ResumeData {
  personal: {
    name: string;
    title: string;
    email: string;
    location: string;
    github: string;
  };
  experience: {
    companyRole: string;
    bullet: string;
  };
  skills: {
    items: string;
  };
  education: {
    degree: string;
    institutionYear: string;
  };
}

export type SectionId = "personal" | "experience" | "skills" | "education";

interface SectionMeta {
  id: SectionId;
  title: string;
}

// ─── Default State ────────────────────────────────────────────────────────────

const INITIAL_SECTIONS: SectionMeta[] = [
  { id: "personal", title: "Personal Details" },
  { id: "experience", title: "Experience" },
  { id: "skills", title: "Core Skills" },
  { id: "education", title: "Education" },
];

const INITIAL_RESUME_DATA: ResumeData = {
  personal: {
    name: "Alex Morgan",
    title: "Staff Infrastructure & Systems Engineer",
    email: "alex.morgan@domain.com",
    location: "San Francisco, CA",
    github: "github.com/alexmorgan",
  },
  experience: {
    companyRole: "Acme Distributed Cloud, Principal Engineer",
    bullet:
      "Designed resilient multi-region control planes utilizing Typst-compiled runbooks and automated failover topologies.",
  },
  skills: {
    items: "TypeScript, Go, Kubernetes, Typst, Distributed Systems, Rust",
  },
  education: {
    degree: "B.S. in Computer Science, Magna Cum Laude",
    institutionYear: "UC Berkeley • Class of 2019",
  },
};

// ─── Section Editor Forms ─────────────────────────────────────────────────────

function SectionForm({
  sectionId,
  data,
  onChange,
  onClose,
}: {
  sectionId: SectionId;
  data: ResumeData;
  onChange: <K extends keyof ResumeData>(section: K, updates: Partial<ResumeData[K]>) => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-2.5 animate-in fade-in duration-200">
      {sectionId === "personal" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10.5px] uppercase font-semibold text-muted-foreground block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={data.personal.name}
                onChange={(e) => onChange("personal", { name: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Alex Morgan"
              />
            </div>
            <div>
              <label className="text-[10.5px] uppercase font-semibold text-muted-foreground block mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={data.personal.title}
                onChange={(e) => onChange("personal", { title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Staff Infrastructure Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10.5px] uppercase font-semibold text-muted-foreground block mb-1">
                Email
              </label>
              <input
                type="email"
                value={data.personal.email}
                onChange={(e) => onChange("personal", { email: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="alex@domain.com"
              />
            </div>
            <div>
              <label className="text-[10.5px] uppercase font-semibold text-muted-foreground block mb-1">
                Location
              </label>
              <input
                type="text"
                value={data.personal.location}
                onChange={(e) => onChange("personal", { location: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="text-[10.5px] uppercase font-semibold text-muted-foreground block mb-1">
                GitHub / URL
              </label>
              <input
                type="text"
                value={data.personal.github}
                onChange={(e) => onChange("personal", { github: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="github.com/alexmorgan"
              />
            </div>
          </div>
        </>
      )}

      {sectionId === "experience" && (
        <>
          <div>
            <label className="text-[10.5px] uppercase font-semibold text-muted-foreground block mb-1">
              Company & Role
            </label>
            <input
              type="text"
              value={data.experience.companyRole}
              onChange={(e) => onChange("experience", { companyRole: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Company, Role"
            />
          </div>
          <div>
            <label className="text-[10.5px] uppercase font-semibold text-muted-foreground block mb-1">
              Key Achievement Bullet
            </label>
            <textarea
              rows={2}
              value={data.experience.bullet}
              onChange={(e) => onChange("experience", { bullet: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
              placeholder="Designed resilient multi-region control planes..."
            />
          </div>
        </>
      )}

      {sectionId === "skills" && (
        <div>
          <label className="text-[10.5px] uppercase font-semibold text-muted-foreground block mb-1">
            Core Skills (comma-separated)
          </label>
          <textarea
            rows={2}
            value={data.skills.items}
            onChange={(e) => onChange("skills", { items: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
            placeholder="TypeScript, Go, Kubernetes..."
          />
        </div>
      )}

      {sectionId === "education" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[10.5px] uppercase font-semibold text-muted-foreground block mb-1">
              Degree & Honors
            </label>
            <input
              type="text"
              value={data.education.degree}
              onChange={(e) => onChange("education", { degree: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="B.S. in Computer Science"
            />
          </div>
          <div>
            <label className="text-[10.5px] uppercase font-semibold text-muted-foreground block mb-1">
              Institution & Year
            </label>
            <input
              type="text"
              value={data.education.institutionYear}
              onChange={(e) => onChange("education", { institutionYear: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-md bg-background border border-border/80 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="UC Berkeley • 2019"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <Check className="size-3" />
          <span>Done</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function StandaloneEditorFeature() {
  const [sections, setSections] = useState<SectionMeta[]>(INITIAL_SECTIONS);
  const [doc, setDoc] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [editingId, setEditingId] = useState<SectionId | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragSourceId = useRef<string | null>(null);

  // ── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    dragSourceId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragSourceId.current;
    if (!sourceId || sourceId === targetId) {
      setDragOverId(null);
      return;
    }
    setSections((prev) => {
      const next = [...prev];
      const srcIdx = next.findIndex((s) => s.id === sourceId);
      const tgtIdx = next.findIndex((s) => s.id === targetId);
      const [item] = next.splice(srcIdx, 1);
      next.splice(tgtIdx, 0, item);
      return next;
    });
    dragSourceId.current = null;
    setDragOverId(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragSourceId.current = null;
    setDragOverId(null);
  }, []);

  // ── Live Document State Update ─────────────────────────────────────────────

  const handleUpdate = useCallback(
    <K extends keyof ResumeData>(section: K, updates: Partial<ResumeData[K]>) => {
      setDoc((prev) => {
        const next = {
          ...prev,
          [section]: {
            ...prev[section],
            ...updates,
          },
        };
        if (section === "personal" && typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("lumacv:candidate-updated", {
              detail: {
                name: next.personal.name,
                title: next.personal.title,
              },
            })
          );
        }
        return next;
      });
    },
    []
  );

  const handleReset = useCallback(() => {
    setDoc(INITIAL_RESUME_DATA);
    setSections(INITIAL_SECTIONS);
    setEditingId(null);
  }, []);

  // Get dynamic summary for each section pill on left
  const getSectionSummary = (id: SectionId) => {
    switch (id) {
      case "personal":
        return `${doc.personal.name} • ${doc.personal.title}`;
      case "experience":
        return doc.experience.companyRole;
      case "skills":
        return doc.skills.items;
      case "education":
        return `${doc.education.degree}${doc.education.institutionYear ? ` • ${doc.education.institutionYear}` : ""}`;
    }
  };

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden">
      <div className="max-w-marketing mx-auto space-y-16">

        {/* Editorial Heading */}
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight">
            Full control over every line.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            No mandatory AI questionnaires, job-description requirements, or multi-step
            wizard hurdles. Jump directly into a responsive browser editor with real-time
            vector compilation and instant section reordering.
          </p>
        </div>

        {/* Workstation Simulation Mockup */}
        <div className="rounded-3xl border border-border/80 bg-card shadow-xl overflow-hidden">
          {/* Window Chrome */}
          <div className="px-5 py-3 border-b border-border/60 bg-muted/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 shrink-0" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 shrink-0" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 shrink-0" />
              {/* max-w was 260px on mobile, leaving no room for the status
                  badge on the right before the card's own overflow-hidden
                  clipped it mid-word ("Ve", "En", "Re..."). */}
              <span className="ml-2 text-xs font-mono text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                LumaCV Workstation, {doc.personal.name.replace(/\s+/g, "-")}-Resume.typ
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium shrink-0">
              <button
                type="button"
                onClick={handleReset}
                title="Reset sample data"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="size-1.5 rounded-full bg-zinc-400 shrink-0" />
                <span className="hidden sm:inline">Vector Engine Ready</span>
                <span className="sm:hidden">Ready</span>
              </div>
            </div>
          </div>

          {/* Split Pane */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/60">

            {/* Left: Interactive Section Cards with in-place editor */}
            <div className="lg:col-span-6 p-6 sm:p-8 space-y-4 bg-background/50">
              {/* Both labels together are wider than a mobile card, and this
                  row had no wrap handling, so the two spans each wrapped
                  their own text mid-phrase ("RESUME SEC-/TIONS...", "Live/
                  Sync") instead of the row wrapping as clean units.
                  flex-wrap lets the second label drop to its own line
                  intact rather than breaking inside either phrase. */}
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Resume Sections (Drag to Reorder)
                </span>
                <span className="text-xs text-zinc-400 font-medium flex items-center gap-1 shrink-0">
                  <span className="size-1.5 rounded-full bg-zinc-400" />
                  Live Sync
                </span>
              </div>

              <div className="space-y-3">
                {sections.map((sec) => {
                  const isEditing = editingId === sec.id;
                  return (
                    <div key={sec.id}>
                      <div
                        draggable={!isEditing}
                        onDragStart={(e) => handleDragStart(e, sec.id)}
                        onDragOver={(e) => handleDragOver(e, sec.id)}
                        onDrop={(e) => handleDrop(e, sec.id)}
                        onDragEnd={handleDragEnd}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col group shadow-xs ${
                          dragOverId === sec.id
                            ? "border-primary/60 bg-primary/5 scale-[1.01]"
                            : isEditing
                            ? "border-primary/50 bg-card ring-1 ring-primary/20 shadow-sm"
                            : "border-border/70 bg-card hover:border-primary/40 cursor-grab active:cursor-grabbing"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 w-full">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <GripVertical
                              className={`w-4 h-4 text-muted-foreground/60 transition-colors mt-0.5 shrink-0 ${
                                isEditing ? "opacity-30 cursor-not-allowed" : "group-hover:text-foreground cursor-grab"
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-foreground">{sec.title}</div>
                              {!isEditing && (
                                <div className="text-xs text-muted-foreground truncate max-w-[280px] sm:max-w-md">
                                  {getSectionSummary(sec.id)}
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditingId(isEditing ? null : sec.id)}
                            className={`ml-2 shrink-0 flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              isEditing
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                            }`}
                          >
                            {isEditing ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Done</span>
                              </>
                            ) : (
                              <>
                                <Pencil className="w-3 h-3" />
                                <span>Edit</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Interactive Form for the active section */}
                        {isEditing && (
                          <SectionForm
                            sectionId={sec.id}
                            data={doc}
                            onChange={handleUpdate}
                            onClose={() => setEditingId(null)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Differentiator Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
                <div className="p-3 rounded-xl bg-muted/20 border border-border/40">
                  <SlidersHorizontal className="w-4 h-4 text-primary mb-1.5" />
                  <div className="text-xs font-semibold text-foreground">Granular Typography</div>
                  <div className="text-[11px] text-muted-foreground">Fine-tune font size, margins, and accents.</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/40">
                  <FileOutput className="w-4 h-4 text-primary mb-1.5" />
                  <div className="text-xs font-semibold text-foreground">Multi-Format Export</div>
                  <div className="text-[11px] text-muted-foreground">PDF, DOCX, Markdown, or raw Typst source.</div>
                </div>
              </div>
            </div>

            {/* Right: Live Vector Output, mirrors every edit in real time */}
            <div className="lg:col-span-6 p-6 sm:p-8 bg-muted/10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Live Vector Output
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Instant Preview</span>
                  </div>
                </div>

                {/* Live Preview Document, mirrors left panel edits and order */}
                <div className="rounded-xl border border-border/80 bg-background p-6 shadow-sm space-y-4 text-left font-sans min-h-[280px]">
                  {sections.map((sec) => {
                    if (sec.id === "personal") {
                      return (
                        <div key="personal" className="border-b border-border/40 pb-3 transition-all">
                          <h4 className="text-lg sm:text-xl font-bold text-foreground tracking-tight transition-all">
                            {doc.personal.name || "Your Name"}
                          </h4>
                          <p className="text-xs text-primary font-medium transition-all mt-0.5">
                            {doc.personal.title || "Your Professional Title"}
                          </p>
                          <p className="text-[11px] text-muted-foreground pt-1 transition-all flex flex-wrap gap-x-2 gap-y-0.5">
                            {doc.personal.email && <span>{doc.personal.email}</span>}
                            {doc.personal.github && (
                              <span>
                                {doc.personal.email && "• "}
                                {doc.personal.github}
                              </span>
                            )}
                            {doc.personal.location && (
                              <span>
                                {(doc.personal.email || doc.personal.github) && "• "}
                                {doc.personal.location}
                              </span>
                            )}
                          </p>
                        </div>
                      );
                    }

                    if (sec.id === "experience") {
                      return (
                        <div key="experience" className="space-y-1.5 transition-all">
                          <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Experience
                          </div>
                          <div className="text-xs font-semibold text-foreground transition-all">
                            {doc.experience.companyRole || "Company & Role"}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed transition-all">
                            • {doc.experience.bullet || "Achievement details..."}
                          </p>
                        </div>
                      );
                    }

                    if (sec.id === "skills") {
                      return (
                        <div key="skills" className="space-y-1.5 transition-all">
                          <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Core Skills
                          </div>
                          <div className="text-[11px] text-muted-foreground transition-all leading-relaxed">
                            {doc.skills.items || "Skill tags..."}
                          </div>
                        </div>
                      );
                    }

                    if (sec.id === "education") {
                      return (
                        <div key="education" className="space-y-1 transition-all">
                          <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Education
                          </div>
                          <div className="text-xs font-medium text-foreground transition-all">
                            {doc.education.degree || "Degree"}
                          </div>
                          {doc.education.institutionYear && (
                            <div className="text-[11px] text-muted-foreground transition-all">
                              {doc.education.institutionYear}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 mt-6">
                <div className="text-xs text-muted-foreground">
                  Ready to craft your resume with zero friction?
                </div>
                <Link href="/editor">
                  <Button className="h-10 px-5 text-xs font-medium rounded-xl gap-2 shadow-sm">
                    <span>Open Standalone Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
