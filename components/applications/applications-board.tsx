"use client";

import React, { useState } from "react";
import {
  JobApplication,
  APPLICATION_STAGES,
  ApplicationStatus,
} from "@/lib/application-schema";
import { ApplicationCard } from "./application-card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApplicationsBoardProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onEditApplication: (app: JobApplication) => void;
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
  onDeleteApplication: (id: string) => void;
  onQuickAdd: (stage: ApplicationStatus) => void;
}

export function ApplicationsBoard({
  applications,
  onSelectApplication,
  onEditApplication,
  onStatusChange,
  onDeleteApplication,
  onQuickAdd,
}: ApplicationsBoardProps) {
  const [activeDragStage, setActiveDragStage] = useState<ApplicationStatus | null>(null);

  const handleDragOver = (e: React.DragEvent, stageKey: ApplicationStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (activeDragStage !== stageKey) {
      setActiveDragStage(stageKey);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, stageKey: ApplicationStatus) => {
    if (activeDragStage === stageKey) {
      setActiveDragStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: ApplicationStatus) => {
    e.preventDefault();
    setActiveDragStage(null);

    const applicationId = e.dataTransfer.getData("text/plain");
    if (!applicationId) return;

    onStatusChange(applicationId, targetStage);
  };

  return (
    <div className="w-full overflow-x-auto pb-6 pt-2 select-none">
      <div className="flex gap-4 min-w-[1240px] items-start">
        {APPLICATION_STAGES.map((stage) => {
          const stageApps = applications.filter((app) => app.status === stage.key);
          const isOver = activeDragStage === stage.key;

          return (
            <div
              key={stage.key}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={(e) => handleDragLeave(e, stage.key)}
              onDrop={(e) => handleDrop(e, stage.key)}
              className={cn(
                "w-[290px] shrink-0 rounded-2xl border p-3 bg-secondary/30 transition-[border-color,background-color,box-shadow] duration-150 flex flex-col max-h-[calc(100vh-210px)]",
                isOver
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border/60"
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border/40">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: stage.accentHex }}
                  />
                  <h3 className="text-xs font-semibold text-foreground tracking-tight truncate">
                    {stage.shortLabel}
                  </h3>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full font-medium bg-background border border-border text-muted-foreground">
                    {stageApps.length}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onQuickAdd(stage.key)}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-md"
                  title={`Add application to ${stage.shortLabel}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="sr-only">Add</span>
                </Button>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[120px]">
                {stageApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onSelect={onSelectApplication}
                    onEdit={onEditApplication}
                    onStatusChange={onStatusChange}
                    onDelete={onDeleteApplication}
                  />
                ))}

                {stageApps.length === 0 && (
                  <div
                    onClick={() => onQuickAdd(stage.key)}
                    className={cn(
                      "h-24 rounded-xl border border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors",
                      isOver
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/60 hover:border-border text-muted-foreground/60 hover:text-muted-foreground"
                    )}
                  >
                    <p className="text-[11px] font-medium">No roles in {stage.shortLabel}</p>
                    <span className="text-[10px] opacity-80 mt-0.5">Drop here or click to add</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
