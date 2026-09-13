import { z } from "zod";

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface StageMetadata {
  key: ApplicationStatus;
  label: string;
  shortLabel: string;
  description: string;
  colorClass: string;
  borderClass: string;
  bgLightClass: string;
  badgeClass: string;
  accentHex: string;
}

export const APPLICATION_STAGES: StageMetadata[] = [
  {
    key: "saved",
    label: "Bookmarked / Saved",
    shortLabel: "Saved",
    description: "Roles discovered and being prepped",
    colorClass: "text-zinc-600 dark:text-zinc-400",
    borderClass: "border-zinc-300 dark:border-zinc-700",
    bgLightClass: "bg-zinc-100/70 dark:bg-zinc-800/40",
    badgeClass: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    accentHex: "#71717a",
  },
  {
    key: "applied",
    label: "Applied",
    shortLabel: "Applied",
    description: "Application submitted and pending reply",
    colorClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-300 dark:border-blue-800",
    bgLightClass: "bg-blue-50/70 dark:bg-blue-950/30",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    accentHex: "#3b82f6",
  },
  {
    key: "screening",
    label: "Screening / Recruiter",
    shortLabel: "Screening",
    description: "HR screening, recruiter call, or initial quiz",
    colorClass: "text-cyan-600 dark:text-cyan-400",
    borderClass: "border-cyan-300 dark:border-cyan-800",
    bgLightClass: "bg-cyan-50/70 dark:bg-cyan-950/30",
    badgeClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    accentHex: "#06b6d4",
  },
  {
    key: "interview",
    label: "Interview Process",
    shortLabel: "Interview",
    description: "Technical rounds, take-homes, or onsite loops",
    colorClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-300 dark:border-amber-800",
    bgLightClass: "bg-amber-50/70 dark:bg-amber-950/30",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    accentHex: "#f59e0b",
  },
  {
    key: "offer",
    label: "Offer Extended",
    shortLabel: "Offer",
    description: "Written or verbal offer received",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-300 dark:border-emerald-800",
    bgLightClass: "bg-emerald-50/70 dark:bg-emerald-950/30",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    accentHex: "#10b981",
  },
  {
    key: "rejected",
    label: "Archived / Rejected",
    shortLabel: "Rejected",
    description: "Role closed or candidate not selected",
    colorClass: "text-rose-600 dark:text-rose-400",
    borderClass: "border-rose-300 dark:border-rose-800",
    bgLightClass: "bg-rose-50/70 dark:bg-rose-950/30",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    accentHex: "#ef4444",
  },
  {
    key: "withdrawn",
    label: "Withdrawn",
    shortLabel: "Withdrawn",
    description: "Declined or withdrew candidacy",
    colorClass: "text-slate-500 dark:text-slate-400",
    borderClass: "border-slate-300 dark:border-slate-700",
    bgLightClass: "bg-slate-100/70 dark:bg-slate-800/40",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    accentHex: "#64748b",
  },
];

export const APPLICATION_STATUS_KEYS: [ApplicationStatus, ...ApplicationStatus[]] = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

export interface ContactPerson {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  position: string;
  location?: string;
  remoteType?: "remote" | "hybrid" | "onsite" | "unspecified";
  status: ApplicationStatus;
  appliedDate?: string; // ISO String
  deadline?: string;    // ISO String
  salary?: string;
  url?: string;
  jobDescription?: string;
  notes?: string;
  contacts?: ContactPerson[];
  resumeId?: string;    // Link to LumaCV resume
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export const applicationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Role / Position is required"),
  location: z.string().optional().default(""),
  remoteType: z.enum(["remote", "hybrid", "onsite", "unspecified"]).default("unspecified"),
  status: z.enum(APPLICATION_STATUS_KEYS).default("applied"),
  appliedDate: z.string().optional(),
  deadline: z.string().optional(),
  salary: z.string().optional().default(""),
  url: z.string().optional().default(""),
  jobDescription: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  contacts: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        linkedin: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  resumeId: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createApplicationInputSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional().default(""),
  remoteType: z.enum(["remote", "hybrid", "onsite", "unspecified"]).default("unspecified"),
  status: z.enum(APPLICATION_STATUS_KEYS).default("applied"),
  appliedDate: z.string().optional(),
  deadline: z.string().optional(),
  salary: z.string().optional().default(""),
  url: z.string().optional().default(""),
  jobDescription: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  resumeId: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
});

export type CreateApplicationInput = z.infer<typeof createApplicationInputSchema>;
export type UpdateApplicationInput = Partial<CreateApplicationInput>;
