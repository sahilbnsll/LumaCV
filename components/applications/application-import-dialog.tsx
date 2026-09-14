"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JobApplication,
  CreateApplicationInput,
  APPLICATION_STAGES,
  ApplicationStatus,
} from "@/lib/application-schema";
import {
  parseCsvText,
  parseExcelBuffer,
  suggestColumnMapping,
  processImportRecords,
  ParsedImportRow,
} from "@/lib/application-import-parser";
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportConfirmed: (applications: CreateApplicationInput[]) => Promise<void>;
  existingApplications: JobApplication[];
}

type ImportStep = "upload" | "mapping" | "review";

export function ApplicationImportDialog({
  open,
  onOpenChange,
  onImportConfirmed,
  existingApplications,
}: ApplicationImportDialogProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawRecords, setRawRecords] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());
  const [isAiMapping, setIsAiMapping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep("upload");
    setFile(null);
    setRawRecords([]);
    setHeaders([]);
    setColumnMapping({});
    setParsedRows([]);
    setSelectedRowIndices(new Set());
    setIsAiMapping(false);
    setIsSubmitting(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const fileName = selectedFile.name.toLowerCase();

    try {
      let records: Record<string, string>[] = [];
      if (fileName.endsWith(".csv") || fileName.endsWith(".tsv") || fileName.endsWith(".txt")) {
        const text = await selectedFile.text();
        records = parseCsvText(text);
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const buffer = await selectedFile.arrayBuffer();
        records = parseExcelBuffer(buffer);
      }

      if (records.length === 0) {
        alert("No readable data rows found in the selected file.");
        return;
      }

      const extractedHeaders = Object.keys(records[0]);
      setRawRecords(records);
      setHeaders(extractedHeaders);

      const initialMapping = suggestColumnMapping(extractedHeaders);
      setColumnMapping(initialMapping);

      setStep("mapping");
    } catch (err) {
      console.error("Failed to parse file:", err);
      alert("Failed to read file. Please ensure it is a valid CSV or Excel spreadsheet.");
    }
  };

  const handleRunAiMapping = async () => {
    if (headers.length === 0 || rawRecords.length === 0) return;

    setIsAiMapping(true);
    try {
      const res = await fetch("/api/v1/applications/import-ai-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers,
          sampleRows: rawRecords.slice(0, 5),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.mapping) {
          setColumnMapping(data.mapping);
        }
      }
    } catch (err) {
      console.warn("AI mapping error, retaining heuristic mapping:", err);
    } finally {
      setIsAiMapping(false);
    }
  };

  const handleProceedToReview = () => {
    const result = processImportRecords(rawRecords, columnMapping, existingApplications);
    setParsedRows(result.rows);

    // Default select all valid rows
    const validIndices = new Set<number>();
    result.rows.forEach((r, idx) => {
      if (r.errors.length === 0 && !r.isDuplicate) {
        validIndices.add(idx);
      }
    });
    setSelectedRowIndices(validIndices);

    setStep("review");
  };

  const handleRowFieldChange = (index: number, field: keyof ParsedImportRow, value: any) => {
    const updated = [...parsedRows];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    // Re-validate row
    const errors: string[] = [];
    if (!updated[index].company.trim()) errors.push("Missing Company name");
    if (!updated[index].position.trim()) errors.push("Missing Role / Position");
    updated[index].errors = errors;

    setParsedRows(updated);
  };

  const toggleRowSelection = (index: number) => {
    const next = new Set(selectedRowIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedRowIndices(next);
  };

  const handleConfirmImport = async () => {
    const toImport: CreateApplicationInput[] = [];

    parsedRows.forEach((r, idx) => {
      if (selectedRowIndices.has(idx) && r.errors.length === 0) {
        toImport.push({
          company: r.company.trim(),
          position: r.position.trim(),
          location: r.location?.trim() || "",
          remoteType: "unspecified",
          status: r.status,
          appliedDate: r.appliedDate || new Date().toISOString(),
          salary: r.salary?.trim() || "",
          url: r.url?.trim() || "",
          jobDescription: "",
          notes: r.notes?.trim() || "",
          resumeId: "",
          tags: [],
        });
      }
    });

    if (toImport.length === 0) {
      alert("Please select at least one valid row to import.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onImportConfirmed(toImport);
      onOpenChange(false);
      resetState();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetState();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                {step === "upload" && "Import Applications from Spreadsheet"}
                {step === "mapping" && "Verify Column Mapping"}
                {step === "review" && "Review Applications Before Saving"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {step === "upload" && "Upload CSV or Excel (.xlsx, .xls) to import job applications in bulk."}
                {step === "mapping" && "Match your spreadsheet columns with LumaCV's job tracking fields."}
                {step === "review" && "Check for duplicates, fix missing values, and select rows to import."}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-foreground">
              Step {step === "upload" ? "1" : step === "mapping" ? "2" : "3"} of 3
            </div>
          </div>
        </DialogHeader>

        {/* STEP 1: FILE UPLOAD */}
        {step === "upload" && (
          <div className="py-6 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-secondary/20 hover:bg-secondary/40"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">Click to upload spreadsheet</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Supports .csv, .xlsx, .xls, and .tsv formats exported from LinkedIn, Simplify, Huntr, or your own sheets.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.tsv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {step === "mapping" && (
          <div className="py-4 space-y-5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/60">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <div className="text-xs">
                  <span className="font-semibold text-foreground block">{file?.name}</span>
                  <span className="text-muted-foreground">
                    {rawRecords.length} rows found • {headers.length} columns
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={isAiMapping}
                onClick={handleRunAiMapping}
                className="text-xs gap-1.5 font-medium shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span>{isAiMapping ? "Analyzing with AI..." : "Smart Auto-Map with AI"}</span>
              </Button>
            </div>

            {/* Field Mappings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {[
                { key: "company", label: "Company Name *", required: true },
                { key: "position", label: "Role / Position *", required: true },
                { key: "status", label: "Stage / Status", required: false },
                { key: "location", label: "Location", required: false },
                { key: "appliedDate", label: "Date Applied", required: false },
                { key: "salary", label: "Salary / Compensation", required: false },
                { key: "url", label: "Job URL", required: false },
                { key: "notes", label: "Notes / Description", required: false },
              ].map((field) => (
                <div key={field.key} className="space-y-1.5 p-2.5 rounded-xl border border-border/60 bg-card">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">
                      {field.label}
                    </Label>
                    {field.required && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Required
                      </span>
                    )}
                  </div>
                  <Select
                    value={columnMapping[field.key] || "unmapped"}
                    onValueChange={(val) =>
                      setColumnMapping({
                        ...columnMapping,
                        [field.key]: val === "unmapped" ? "" : val,
                      })
                    }
                  >
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unmapped" className="text-xs text-muted-foreground">
                       , Do not map,
                      </SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h} className="text-xs font-medium">
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep("upload")} className="text-xs">
                Back to Upload
              </Button>
              <Button size="sm" onClick={handleProceedToReview} className="text-xs gap-1.5">
                <span>Continue to Review Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* STEP 3: INTERACTIVE REVIEW TABLE */}
        {step === "review" && (
          <div className="py-2 space-y-4">
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-muted/40 border border-border/60">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">
                  {selectedRowIndices.size} of {parsedRows.length} applications selected to import
                </span>
                <p className="text-[11px] text-muted-foreground">
                  You can edit values directly inside this table before saving.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const all = new Set<number>();
                    parsedRows.forEach((r, idx) => {
                      if (r.errors.length === 0) all.add(idx);
                    });
                    setSelectedRowIndices(all);
                  }}
                  className="h-7 text-[11px]"
                >
                  Select All Valid
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRowIndices(new Set())}
                  className="h-7 text-[11px]"
                >
                  Deselect All
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-border/70 rounded-xl overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-muted/70 text-muted-foreground font-semibold sticky top-0 z-10 border-b border-border/70">
                  <tr>
                    <th className="p-2.5 w-8 text-center">#</th>
                    <th className="p-2.5 w-10 text-center">Import</th>
                    <th className="p-2.5 min-w-[130px]">Company *</th>
                    <th className="p-2.5 min-w-[140px]">Role / Position *</th>
                    <th className="p-2.5 min-w-[110px]">Stage</th>
                    <th className="p-2.5 min-w-[100px]">Location</th>
                    <th className="p-2.5 min-w-[80px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {parsedRows.map((row, idx) => {
                    const isSelected = selectedRowIndices.has(idx);
                    const hasError = row.errors.length > 0;

                    return (
                      <tr
                        key={idx}
                        className={cn(
                          "transition-colors",
                          hasError
                            ? "bg-destructive/5"
                            : row.isDuplicate
                            ? "bg-amber-500/5"
                            : isSelected
                            ? "bg-primary/5"
                            : ""
                        )}
                      >
                        <td className="p-2.5 text-center text-muted-foreground font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={hasError}
                            onChange={() => toggleRowSelection(idx)}
                            className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={row.company}
                            onChange={(e) => handleRowFieldChange(idx, "company", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={row.position}
                            onChange={(e) => handleRowFieldChange(idx, "position", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <Select
                            value={row.status}
                            onValueChange={(val) =>
                              handleRowFieldChange(idx, "status", val as ApplicationStatus)
                            }
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {APPLICATION_STAGES.map((s) => (
                                <SelectItem key={s.key} value={s.key} className="text-xs">
                                  {s.shortLabel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Input
                            value={row.location}
                            onChange={(e) => handleRowFieldChange(idx, "location", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          {hasError ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-destructive font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{row.errors[0]}</span>
                            </span>
                          ) : row.isDuplicate ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Duplicate</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Ready</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep("mapping")} className="text-xs">
                Back to Mapping
              </Button>
              <Button
                size="sm"
                disabled={isSubmitting || selectedRowIndices.size === 0}
                onClick={handleConfirmImport}
                className="text-xs font-semibold gap-1.5"
              >
                {isSubmitting ? "Importing..." : `Import ${selectedRowIndices.size} Applications`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
