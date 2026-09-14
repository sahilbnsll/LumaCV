"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  JobApplication,
  APPLICATION_STAGES,
  ApplicationStatus,
} from "@/lib/application-schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  FileText,
  Sparkles,
  Edit,
  Trash2,
  Copy,
  Check,
  Activity,
} from "lucide-react";

interface ApplicationDetailSheetProps {
  application: JobApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (app: JobApplication) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
}

export function ApplicationDetailSheet({
  application,
  open,
  onOpenChange,
  onEdit,
  onStatusChange,
  onDelete,
}: ApplicationDetailSheetProps) {
  const [copied, setCopied] = useState(false);

  if (!application) return null;

  const currentStage = APPLICATION_STAGES.find(
    (s) => s.key === application.status
  ) || APPLICATION_STAGES[0];

  const initial = (application.company || "?").charAt(0).toUpperCase();

  const handleCopyJd = () => {
    if (!application.jobDescription) return;
    navigator.clipboard.writeText(application.jobDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <SheetHeader className="space-y-3 pb-4 border-b border-border/60">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary/80 border border-border flex items-center justify-center font-bold text-lg text-foreground shrink-0 shadow-sm select-none">
                {initial}
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-xl font-semibold text-foreground tracking-tight truncate">
                  {application.company}
                </SheetTitle>
                <SheetDescription className="text-sm font-medium text-foreground/80 truncate mt-0.5">
                  {application.position}
                </SheetDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(application)}
                className="h-8 text-xs gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onDelete(application.id);
                  onOpenChange(false);
                }}
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                title="Delete Application"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stage Picker Bar */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-medium text-muted-foreground">Current Stage</span>
            <Select
              value={application.status}
              onValueChange={(val) => onStatusChange(application.id, val as ApplicationStatus)}
            >
              <SelectTrigger className="h-8 w-[160px] text-xs font-semibold rounded-xl">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: currentStage.accentHex }}
                  />
                  <span>{currentStage.label}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STAGES.map((s) => (
                  <SelectItem key={s.key} value={s.key} className="text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: s.accentHex }}
                      />
                      <span>{s.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SheetHeader>

        {/* Primary Action Buttons Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {application.resumeId ? (
            <Button asChild variant="outline" className="w-full justify-center gap-1.5 text-xs font-medium border-border/80">
              <Link href={`/editor?id=${encodeURIComponent(application.resumeId)}`}>
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Open Resume</span>
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled
              className="w-full justify-center gap-1.5 text-xs text-muted-foreground"
            >
              <FileText className="w-3.5 h-3.5 opacity-50" />
              <span>No Resume</span>
            </Button>
          )}

          <Button asChild variant="outline" className="w-full justify-center gap-1.5 text-xs font-medium border-border/80">
            <Link href={application.resumeId ? `/ats?id=${encodeURIComponent(application.resumeId)}` : '/ats'}>
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>ATS Audit</span>
            </Link>
          </Button>

          {application.jobDescription ? (
            <Button asChild className="w-full justify-center gap-1.5 text-xs font-medium shadow-sm">
              <Link
                href={`/dashboard?tab=tailor&jd=${encodeURIComponent(
                  application.jobDescription.slice(0, 1000)
                )}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span>Tailor JD</span>
              </Link>
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => onEdit(application)}
              className="w-full justify-center gap-1.5 text-xs text-muted-foreground"
            >
              <Sparkles className="w-3.5 h-3.5 opacity-50" />
              <span>Add JD</span>
            </Button>
          )}
        </div>

        {/* Metadata Bento Grid */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px] mb-1">Workplace & Location</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">
                {application.location || "Unspecified"}
                {application.remoteType && application.remoteType !== "unspecified"
                  ? ` (${application.remoteType})`
                  : ""}
              </span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px] mb-1">Target Compensation</span>
            <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{application.salary || "Not specified"}</span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px] mb-1">Applied Date</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>
                {application.appliedDate
                  ? new Date(application.appliedDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Not applied yet"}
              </span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px] mb-1">External Link</span>
            {application.url ? (
              <a
                href={application.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 text-primary hover:underline font-medium truncate"
              >
                <span className="truncate">{application.url.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <span className="text-muted-foreground/60">None provided</span>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Notes & Next Steps
            </h4>
          </div>
          <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
            {application.notes ? application.notes : (
              <span className="text-muted-foreground italic">
                No recruiter notes or interview logs added yet. Click Edit to add follow-up reminders.
              </span>
            )}
          </div>
        </div>

        {/* Job Description (Collapsible / Reader) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Job Description
            </h4>
            {application.jobDescription && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyJd}
                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy JD"}</span>
              </Button>
            )}
          </div>
          <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 text-xs text-foreground font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
            {application.jobDescription ? (
              application.jobDescription
            ) : (
              <span className="text-muted-foreground font-sans italic">
                No job description saved. Paste the role requirements here to enable AI resume tailoring and ATS match checking.
              </span>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
