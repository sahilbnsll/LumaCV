"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { EditorialFooter } from "@/components/landing/editorial-footer";
import { useAuth } from "@/components/auth-provider";
import {
  JobApplication,
  APPLICATION_STAGES,
  ApplicationStatus,
  CreateApplicationInput,
} from "@/lib/application-schema";
import {
  fetchApplications,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} from "@/lib/applications-store";
import { ApplicationsBoard } from "@/components/applications/applications-board";
import { ApplicationTable } from "@/components/applications/application-table";
import { ApplicationStats } from "@/components/applications/application-stats";
import { ApplicationFormDialog } from "@/components/applications/application-form-dialog";
import { ApplicationDetailSheet } from "@/components/applications/application-detail-sheet";
import dynamic from "next/dynamic";

// Dynamically imported: this pulls in the `xlsx` library (spreadsheet
// parsing), which is large and only needed by the small fraction of users
// who actually click "Import". Statically importing it here shipped xlsx's
// full bundle to every visitor of /applications, even ones who never open
// the dialog.
const ApplicationImportDialog = dynamic(
  () => import("@/components/applications/application-import-dialog").then((m) => m.ApplicationImportDialog),
  { ssr: false }
);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutGrid,
  List,
  BarChart3,
  Plus,
  Upload,
  Download,
  Search,
  Briefcase,
  Sparkles,
  Lock,
} from "lucide-react";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

type ViewMode = "board" | "table" | "insights";

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");

  // Dialog & Drawer states
  const [formOpen, setFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [activeStageForNew, setActiveStageForNew] = useState<ApplicationStatus>("applied");

  const [detailApplication, setDetailApplication] = useState<JobApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [importOpen, setImportOpen] = useState(false);

  // Load applications
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchApplications(user.id);
        if (isMounted) {
          setApplications(data);
        }
      } catch (err) {
        console.error("Failed to load applications:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Status filter
      if (statusFilter !== "all" && app.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCompany = app.company.toLowerCase().includes(q);
        const matchPosition = app.position.toLowerCase().includes(q);
        const matchLocation = app.location?.toLowerCase().includes(q);
        const matchNotes = app.notes?.toLowerCase().includes(q);
        if (!matchCompany && !matchPosition && !matchLocation && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [applications, statusFilter, searchQuery]);

  // Handlers
  const handleCreateOrUpdate = async (data: CreateApplicationInput, id?: string) => {
    if (!user) return;

    if (id) {
      const updated = await updateApplication(id, data, user.id);
      if (updated) {
        setApplications((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
        if (detailApplication?.id === id) {
          setDetailApplication(updated);
        }
      }
    } else {
      const created = await createApplication(data, user.id);
      setApplications((prev) => [created, ...prev]);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    if (!user) return;

    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );

    if (detailApplication?.id === id) {
      setDetailApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    await updateApplicationStatus(id, newStatus, user.id);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setApplications((prev) => prev.filter((a) => a.id !== id));
    if (detailApplication?.id === id) {
      setDetailOpen(false);
      setDetailApplication(null);
    }
    await deleteApplication(id, user.id);
  };

  const handleQuickAdd = (stage: ApplicationStatus) => {
    setActiveStageForNew(stage);
    setEditingApplication(null);
    setFormOpen(true);
  };

  const handleOpenDetail = (app: JobApplication) => {
    setDetailApplication(app);
    setDetailOpen(true);
  };

  const handleOpenEdit = (app: JobApplication) => {
    setEditingApplication(app);
    setFormOpen(true);
  };

  const handleImportConfirmed = async (newApps: CreateApplicationInput[]) => {
    if (!user) return;
    for (const appInput of newApps) {
      await createApplication(appInput, user.id);
    }
    const refreshed = await fetchApplications(user.id);
    setApplications(refreshed);
  };

  const handleExportCsv = () => {
    if (applications.length === 0) {
      alert("No applications to export.");
      return;
    }

    const headers = [
      "Company",
      "Position",
      "Status",
      "Location",
      "Remote Type",
      "Salary",
      "Applied Date",
      "Job URL",
      "Notes",
    ];

    const rows = applications.map((a) => [
      `"${(a.company || "").replace(/"/g, '""')}"`,
      `"${(a.position || "").replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${(a.location || "").replace(/"/g, '""')}"`,
      `"${a.remoteType || ""}"`,
      `"${(a.salary || "").replace(/"/g, '""')}"`,
      `"${a.appliedDate || ""}"`,
      `"${(a.url || "").replace(/"/g, '""')}"`,
      `"${(a.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `lumacv_applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadSampleApplications = async () => {
    if (!user) return;
    const samples: CreateApplicationInput[] = [
      {
        company: "Linear",
        position: "Senior Frontend Engineer",
        location: "San Francisco, CA / Remote",
        remoteType: "remote",
        status: "interview",
        salary: "$180,000 - $220,000",
        appliedDate: new Date(Date.now() - 7 * 86400000).toISOString(),
        jobDescription: "Build high-speed desktop-class web applications with React, Next.js, and TypeScript.",
        notes: "Passed technical screen. System architecture round scheduled next Tuesday.",
        url: "https://linear.app/careers",
        resumeId: "",
        tags: ["Frontend", "React", "Desktop Web"],
      },
      {
        company: "Stripe",
        position: "Staff Full-Stack Engineer",
        location: "Seattle, WA / Remote",
        remoteType: "hybrid",
        status: "screening",
        salary: "$210,000 - $260,000",
        appliedDate: new Date(Date.now() - 3 * 86400000).toISOString(),
        jobDescription: "Design resilient payment APIs and developer infrastructure at global scale.",
        notes: "Recruiter reach-out via LinkedIn. Initial screening call confirmed.",
        url: "https://stripe.com/jobs",
        resumeId: "",
        tags: ["Full Stack", "Distributed Systems"],
      },
      {
        company: "Vercel",
        position: "Product Infrastructure Engineer",
        location: "San Francisco, CA",
        remoteType: "remote",
        status: "applied",
        salary: "$195,000 - $240,000",
        appliedDate: new Date().toISOString(),
        jobDescription: "Optimize edge runtimes, build developer tooling, and maintain Next.js ecosystem features.",
        notes: "Submitted tailored PDF resume compiled with Typst engine.",
        url: "https://vercel.com/careers",
        resumeId: "",
        tags: ["Next.js", "Edge Infrastructure"],
      },
    ];

    for (const sample of samples) {
      await createApplication(sample, user.id);
    }
    const refreshed = await fetchApplications(user.id);
    setApplications(refreshed);
    notify.success("Sample pipeline created", "3 applications added to board");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
        <AppHeader />
        <main className="flex-1 mx-auto max-w-6xl px-4 sm:px-6 py-24 w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground">Authenticating session...</p>
          </div>
        </main>
        <EditorialFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
        <AppHeader />
        <main className="flex-1 mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-24 w-full flex items-center justify-center">
          <div className="w-full rounded-2xl border border-border/80 bg-card p-8 sm:p-10 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-5">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Authentication Required
            </h1>
            <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Your job application pipeline is private to your account. Sign in to track applications, interview stages, and offers.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="default" className="w-full sm:w-auto h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium">
                <Link href="/login?redirect=/applications">Sign In to Continue</Link>
              </Button>
              <Button asChild variant="outline" size="default" className="w-full sm:w-auto h-10 px-6 border-border/80 text-sm font-medium hover:bg-muted/30">
                <Link href="/signup?redirect=/applications">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </main>
        <EditorialFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Workspace Top Banner & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Job Application Tracker
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Organize, track, and tailor your applications across interview rounds and offer stages.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(true)}
              className="text-xs font-medium gap-1.5 h-9 rounded-xl shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Import Sheet</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={applications.length === 0}
              className="text-xs font-medium gap-1.5 h-9 rounded-xl shadow-sm hidden sm:inline-flex"
            >
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Export CSV</span>
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setActiveStageForNew("applied");
                setEditingApplication(null);
                setFormOpen(true);
              }}
              className="text-xs font-semibold gap-1.5 h-9 rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </Button>
          </div>
        </div>

        {/* View Switcher, Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Left: View Mode Segmented Controls */}
          <div className="inline-flex items-center rounded-xl bg-secondary/80 border border-border p-1 gap-1 self-start">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                viewMode === "board"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("insights")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                viewMode === "insights"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>
          </div>

          {/* Right: Search & Quick Status Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search company, role, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8.5 h-9 text-xs rounded-xl bg-secondary/30 border-border/70"
              />
            </div>

            {/* Stage filter dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
                className="h-9 px-3 text-xs rounded-xl border border-border/70 bg-secondary/40 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Stages ({applications.length})</option>
                {APPLICATION_STAGES.map((s) => {
                  const count = applications.filter((a) => a.status === s.key).length;
                  return (
                    <option key={s.key} value={s.key}>
                      {s.shortLabel} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-muted-foreground">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-8 sm:p-10 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground font-display">
                Your Application Pipeline is Empty
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track your active job applications across interview rounds, log recruiter notes, and attach custom Typst resumes to every submission.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <Button
                size="sm"
                onClick={handleLoadSampleApplications}
                className="h-9 gap-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground shadow-xs cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Load Sample Roles (Linear, Stripe, Vercel)</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveStageForNew("applied");
                  setEditingApplication(null);
                  setFormOpen(true);
                }}
                className="h-9 gap-1.5 text-xs font-medium rounded-xl border-border/80 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Blank Application</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "board" && (
              <ApplicationsBoard
                applications={filteredApplications}
                onSelectApplication={handleOpenDetail}
                onEditApplication={handleOpenEdit}
                onStatusChange={handleStatusChange}
                onDeleteApplication={handleDelete}
                onQuickAdd={handleQuickAdd}
              />
            )}

            {viewMode === "table" && (
              <ApplicationTable
                applications={filteredApplications}
                onSelectApplication={handleOpenDetail}
                onEditApplication={handleOpenEdit}
                onStatusChange={handleStatusChange}
                onDeleteApplication={handleDelete}
              />
            )}

            {viewMode === "insights" && (
              <ApplicationStats
                applications={applications}
                onFilterByStatus={(stg) => {
                  if (stg) {
                    setStatusFilter(stg);
                    setViewMode("board");
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Modals & Drawers */}
      <ApplicationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreateOrUpdate}
        initialData={editingApplication}
        defaultStage={activeStageForNew}
        userId={user?.id}
      />

      <ApplicationDetailSheet
        application={detailApplication}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(app) => {
          setDetailOpen(false);
          handleOpenEdit(app);
        }}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />

      <ApplicationImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportConfirmed={handleImportConfirmed}
        existingApplications={applications}
      />

      <EditorialFooter />
    </div>
  );
}
