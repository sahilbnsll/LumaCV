"use client";

import React, { useState, useEffect } from "react";
import {
  JobApplication,
  APPLICATION_STAGES,
  ApplicationStatus,
  CreateApplicationInput,
} from "@/lib/application-schema";
import { getLocalResumes, SavedResume } from "@/lib/user-resumes-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Briefcase, MapPin, DollarSign, Link as LinkIcon, FileText } from "lucide-react";

interface ApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateApplicationInput, id?: string) => Promise<void>;
  initialData?: JobApplication | null;
  defaultStage?: ApplicationStatus;
  userId?: string;
}

export function ApplicationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  defaultStage = "applied",
  userId,
}: ApplicationFormDialogProps) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [remoteType, setRemoteType] = useState<"remote" | "hybrid" | "onsite" | "unspecified">("unspecified");
  const [status, setStatus] = useState<ApplicationStatus>(defaultStage);
  const [appliedDate, setAppliedDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [salary, setSalary] = useState("");
  const [url, setUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ company?: string; position?: string }>({});

  useEffect(() => {
    if (userId) {
      const resumes = getLocalResumes(userId);
      setSavedResumes(resumes);
    }
  }, [userId, open]);

  useEffect(() => {
    if (initialData) {
      setCompany(initialData.company || "");
      setPosition(initialData.position || "");
      setLocation(initialData.location || "");
      setRemoteType(initialData.remoteType || "unspecified");
      setStatus(initialData.status || "applied");
      setAppliedDate(
        initialData.appliedDate ? initialData.appliedDate.split("T")[0] : ""
      );
      setDeadline(
        initialData.deadline ? initialData.deadline.split("T")[0] : ""
      );
      setSalary(initialData.salary || "");
      setUrl(initialData.url || "");
      setJobDescription(initialData.jobDescription || "");
      setNotes(initialData.notes || "");
      setResumeId(initialData.resumeId || "");
    } else {
      setCompany("");
      setPosition("");
      setLocation("");
      setRemoteType("unspecified");
      setStatus(defaultStage);
      setAppliedDate(new Date().toISOString().split("T")[0]);
      setDeadline("");
      setSalary("");
      setUrl("");
      setJobDescription("");
      setNotes("");
      setResumeId("");
    }
    setErrors({});
  }, [initialData, defaultStage, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { company?: string; position?: string } = {};

    if (!company.trim()) newErrors.company = "Company name is required";
    if (!position.trim()) newErrors.position = "Role / Position is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          company: company.trim(),
          position: position.trim(),
          location: location.trim(),
          remoteType,
          status,
          appliedDate: appliedDate ? new Date(appliedDate).toISOString() : undefined,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
          salary: salary.trim(),
          url: url.trim(),
          jobDescription: jobDescription.trim(),
          notes: notes.trim(),
          resumeId: resumeId === "none" ? "" : resumeId,
          tags: [],
        },
        initialData?.id
      );
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {initialData ? "Edit Application" : "Track New Job Application"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Keep track of role requirements, recruiter notes, and interview stages.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Company Name *</span>
              </Label>
              <Input
                placeholder="e.g. Stripe, Linear, Vercel"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={errors.company ? "border-destructive text-xs" : "text-xs"}
              />
              {errors.company && (
                <span className="text-[11px] text-destructive">{errors.company}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Job Title / Role *</span>
              </Label>
              <Input
                placeholder="e.g. Senior Frontend Engineer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={errors.position ? "border-destructive text-xs" : "text-xs"}
              />
              {errors.position && (
                <span className="text-[11px] text-destructive">{errors.position}</span>
              )}
            </div>
          </div>

          {/* Stage & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Pipeline Stage</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as ApplicationStatus)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STAGES.map((s) => (
                    <SelectItem key={s.key} value={s.key} className="text-xs">
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

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Workplace Type</Label>
              <Select
                value={remoteType}
                onValueChange={(val) =>
                  setRemoteType(val as "remote" | "hybrid" | "onsite" | "unspecified")
                }
              >
                <SelectTrigger className="text-xs capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unspecified" className="text-xs">Unspecified</SelectItem>
                  <SelectItem value="remote" className="text-xs">Remote</SelectItem>
                  <SelectItem value="hybrid" className="text-xs">Hybrid</SelectItem>
                  <SelectItem value="onsite" className="text-xs">Onsite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Location</span>
              </Label>
              <Input
                placeholder="e.g. San Francisco / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Salary, Link, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Salary / Pay</span>
              </Label>
              <Input
                placeholder="e.g. $160k - $190k"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Date Applied</Label>
              <Input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Job URL</span>
              </Label>
              <Input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Linked Resume Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Linked LumaCV Resume</span>
            </Label>
            <Select
              value={resumeId || "none"}
              onValueChange={(val) => setResumeId(val === "none" ? "" : val)}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select a resume used for this application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs text-muted-foreground">
                  None (no linked resume)
                </SelectItem>
                {savedResumes.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    {r.title} {r.targetJobTitle ? `(${r.targetJobTitle})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Description (collapsible / readable) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Job Description (JD)</Label>
            <Textarea
              placeholder="Paste the raw job description, requirements, or qualifications here..."
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Recruiter Notes / Next Steps</Label>
            <Textarea
              placeholder="e.g. Recruiter mentioned round 2 is a 45 min systems design interview..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs leading-relaxed"
            />
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-xs">
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
