"use client";

import React from "react";
import Link from "next/link";
import {
  JobApplication,
  APPLICATION_STAGES,
  ApplicationStatus,
} from "@/lib/application-schema";
import {
  MapPin,
  Calendar,
  ExternalLink,
  MoreVertical,
  FileText,
  DollarSign,
  ArrowRight,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApplicationCardProps {
  application: JobApplication;
  onSelect: (app: JobApplication) => void;
  onEdit: (app: JobApplication) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export function ApplicationCard({
  application,
  onSelect,
  onEdit,
  onStatusChange,
  onDelete,
  isDragging,
}: ApplicationCardProps) {
  const currentStage = APPLICATION_STAGES.find(
    (s) => s.key === application.status
  ) || APPLICATION_STAGES[0];

  const initial = (application.company || "?").charAt(0).toUpperCase();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify(application));
    e.dataTransfer.setData("text/plain", application.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(application)}
      className={cn(
        "group relative rounded-xl border bg-card p-3.5 shadow-sm transition-all duration-150 cursor-pointer hover:shadow-md hover:border-foreground/25 active:scale-[0.99]",
        isDragging && "opacity-40 border-dashed border-primary",
        "border-border/70"
      )}
    >
      {/* Top Row: Company Badge + Status Dot + Quick Menu */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-secondary/80 border border-border flex items-center justify-center font-semibold text-xs text-foreground shrink-0 select-none">
            {initial}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-foreground truncate leading-tight">
              {application.company}
            </h4>
            <p className="text-xs font-medium text-muted-foreground truncate leading-tight mt-0.5">
              {application.position}
            </p>
          </div>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0 -mr-1 -mt-1"
            >
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">Open options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onSelect(application)}>
              <FileText className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(application)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Application
            </DropdownMenuItem>

            {application.url && (
              <DropdownMenuItem asChild>
                <a
                  href={application.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Job Posting
                </a>
              </DropdownMenuItem>
            )}

            {application.resumeId && (
              <DropdownMenuItem asChild>
                <Link
                  href={`/editor?id=${encodeURIComponent(application.resumeId)}`}
                  className="flex items-center cursor-pointer text-primary"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Open Linked Resume
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Move to Stage Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowRight className="w-4 h-4 mr-2" />
                Move to stage
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Change pipeline stage
                </DropdownMenuLabel>
                {APPLICATION_STAGES.map((stg) => (
                  <DropdownMenuItem
                    key={stg.key}
                    disabled={stg.key === application.status}
                    onClick={() => onStatusChange(application.id, stg.key)}
                    className="flex items-center justify-between text-xs"
                  >
                    <span>{stg.shortLabel}</span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: stg.accentHex }}
                    />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(application.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Application
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Meta tags & Indicators */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
        {application.location && (
          <span className="inline-flex items-center gap-1 bg-secondary/60 px-1.5 py-0.5 rounded text-[10px] font-medium border border-border/50">
            <MapPin className="w-3 h-3 text-muted-foreground/70" />
            <span className="truncate max-w-[120px]">{application.location}</span>
          </span>
        )}

        {application.remoteType && application.remoteType !== "unspecified" && (
          <span className="inline-flex items-center capitalize bg-secondary/60 px-1.5 py-0.5 rounded text-[10px] font-medium border border-border/50">
            {application.remoteType}
          </span>
        )}

        {application.salary && (
          <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-medium border border-emerald-500/20">
            <DollarSign className="w-3 h-3" />
            <span className="truncate max-w-[90px]">{application.salary}</span>
          </span>
        )}
      </div>

      {/* Footer Info: Applied Date & Linked Resume Chip */}
      <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-muted-foreground/60" />
          <span>
            {application.appliedDate
              ? new Date(application.appliedDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "Not sent"}
          </span>
        </div>

        {application.resumeId && (
          <Link
            href={`/editor?id=${encodeURIComponent(application.resumeId)}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20"
            title="Open linked resume in Editor"
          >
            <FileText className="w-3 h-3" />
            <span>Resume</span>
          </Link>
        )}
      </div>
    </div>
  );
}
