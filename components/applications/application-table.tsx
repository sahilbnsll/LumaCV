"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  JobApplication,
  APPLICATION_STAGES,
  ApplicationStatus,
} from "@/lib/application-schema";
import {
  ExternalLink,
  FileText,
  MoreHorizontal,
  ArrowUpDown,
  Trash2,
  Edit,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ApplicationTableProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onEditApplication: (app: JobApplication) => void;
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
  onDeleteApplication: (id: string) => void;
}

type SortField = "company" | "position" | "status" | "appliedDate" | "updatedAt";

export function ApplicationTable({
  applications,
  onSelectApplication,
  onEditApplication,
  onStatusChange,
  onDeleteApplication,
}: ApplicationTableProps) {
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedApplications = [...applications].sort((a, b) => {
    let comparison = 0;
    if (sortField === "company") {
      comparison = a.company.localeCompare(b.company);
    } else if (sortField === "position") {
      comparison = a.position.localeCompare(b.position);
    } else if (sortField === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (sortField === "appliedDate") {
      const dateA = a.appliedDate ? new Date(a.appliedDate).getTime() : 0;
      const dateB = b.appliedDate ? new Date(b.appliedDate).getTime() : 0;
      comparison = dateA - dateB;
    } else if (sortField === "updatedAt") {
      comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    return sortAsc ? comparison : -comparison;
  });

  if (applications.length === 0) {
    return (
      <div className="py-16 text-center border rounded-2xl border-dashed border-border/80 bg-card/40">
        <p className="text-sm font-medium text-foreground">No applications found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add an application or import from a spreadsheet to populate this table.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border border-border/70 rounded-2xl bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-xs font-semibold text-muted-foreground select-none">
              <th
                onClick={() => handleSort("company")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Company</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("position")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Role / Position</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("status")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stage</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-3 px-4 hidden md:table-cell">Location / Type</th>
              <th
                onClick={() => handleSort("appliedDate")}
                className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors hidden sm:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Applied</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-3 px-4 hidden lg:table-cell">Linked Resume</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {sortedApplications.map((app) => {
              const currentStage = APPLICATION_STAGES.find((s) => s.key === app.status) || APPLICATION_STAGES[0];
              const initial = (app.company || "?").charAt(0).toUpperCase();

              return (
                <tr
                  key={app.id}
                  onClick={() => onSelectApplication(app)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  {/* Company */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/80 border border-border flex items-center justify-center font-semibold text-xs text-foreground shrink-0 select-none">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-foreground block truncate max-w-[160px]">
                          {app.company}
                        </span>
                        {app.url && (
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-1 mt-0.5"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    <div className="truncate max-w-[200px]">{app.position}</div>
                    {app.salary && (
                      <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 block mt-0.5">
                        {app.salary}
                      </span>
                    )}
                  </td>

                  {/* Stage (with quick inline select) */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={app.status}
                      onValueChange={(val) => onStatusChange(app.id, val as ApplicationStatus)}
                    >
                      <SelectTrigger className="h-7 w-[130px] text-xs font-medium border-border/70 rounded-lg">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: currentStage.accentHex }}
                          />
                          <span className="truncate">{currentStage.shortLabel}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STAGES.map((s) => (
                          <SelectItem key={s.key} value={s.key} className="text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: s.accentHex }}
                              />
                              <span>{s.shortLabel}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Location / Remote */}
                  <td className="py-3.5 px-4 text-xs text-muted-foreground hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      {app.location ? (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                          <span className="truncate max-w-[140px]">{app.location}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground/40">-</span>
                      )}
                      {app.remoteType && app.remoteType !== "unspecified" && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-medium bg-secondary text-secondary-foreground">
                          {app.remoteType}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Applied Date */}
                  <td className="py-3.5 px-4 text-xs text-muted-foreground hidden sm:table-cell">
                    {app.appliedDate ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span>
                          {new Date(app.appliedDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40">-</span>
                    )}
                  </td>

                  {/* Linked Resume */}
                  <td className="py-3.5 px-4 text-xs hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                    {app.resumeId ? (
                      <Link
                        href={`/editor?id=${encodeURIComponent(app.resumeId)}`}
                        className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium text-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open Resume</span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground/40 text-xs">-</span>
                    )}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onSelectApplication(app)}>
                          <FileText className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditApplication(app)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Info
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteApplication(app.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
