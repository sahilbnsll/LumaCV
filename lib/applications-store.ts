import {
  JobApplication,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "./application-schema";

const STORAGE_KEY = "lumacv_saved_applications";

export function getLocalApplications(userId?: string): JobApplication[] {
  if (typeof window === "undefined") return [];
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item: JobApplication) => item.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (e) {
    console.error("Failed to read local applications:", e);
    return [];
  }
}

export function saveLocalApplication(app: JobApplication, userId?: string): void {
  if (typeof window === "undefined") return;
  const effectiveUserId = userId || app.userId;
  if (!effectiveUserId) return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: JobApplication[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      } catch {
        list = [];
      }
    }

    const now = new Date().toISOString();
    const itemToSave: JobApplication = {
      ...app,
      userId: effectiveUserId,
      createdAt: app.createdAt || now,
      updatedAt: now,
    };

    const idx = list.findIndex((x) => x.id === app.id && x.userId === effectiveUserId);
    if (idx >= 0) {
      list[idx] = itemToSave;
    } else {
      list.unshift(itemToSave);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save local application:", e);
  }
}

export function deleteLocalApplication(id: string, userId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;

    const filtered = list.filter((a: JobApplication) => {
      if (userId && a.userId !== userId) return true;
      return a.id !== id;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete local application:", e);
  }
}

/**
 * High-level Cloud + Local Sync Helpers
 */
export async function fetchApplications(userId: string): Promise<JobApplication[]> {
  if (!userId) return [];

  // Try API first
  try {
    const res = await fetch("/api/v1/applications", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.applications)) {
        // Sync to local cache
        if (typeof window !== "undefined") {
          data.applications.forEach((app: JobApplication) => saveLocalApplication(app, userId));
        }
        return data.applications;
      }
    }
  } catch (err) {
    console.warn("Applications API fetch failed, falling back to local storage:", err);
  }

  // Fallback to local storage
  return getLocalApplications(userId);
}

export async function createApplication(
  input: CreateApplicationInput,
  userId: string
): Promise<JobApplication> {
  const now = new Date().toISOString();
  const newApp: JobApplication = {
    id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    company: input.company.trim(),
    position: input.position.trim(),
    location: input.location?.trim() || "",
    remoteType: input.remoteType || "unspecified",
    status: input.status || "applied",
    appliedDate: input.appliedDate || now,
    deadline: input.deadline,
    salary: input.salary?.trim() || "",
    url: input.url?.trim() || "",
    jobDescription: input.jobDescription || "",
    notes: input.notes || "",
    resumeId: input.resumeId || "",
    tags: input.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  // Save locally first for instantaneous responsiveness
  saveLocalApplication(newApp, userId);

  // Sync to API in background
  try {
    const res = await fetch("/api/v1/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newApp),
    });
    if (res.ok) {
      const saved = await res.json();
      if (saved.application) {
        saveLocalApplication(saved.application, userId);
        return saved.application;
      }
    }
  } catch (e) {
    console.warn("Could not sync created application to server:", e);
  }

  return newApp;
}

export async function updateApplication(
  id: string,
  updates: UpdateApplicationInput,
  userId: string
): Promise<JobApplication | null> {
  const existing = getLocalApplications(userId).find((a) => a.id === id);
  if (!existing) return null;

  const updated: JobApplication = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveLocalApplication(updated, userId);

  try {
    await fetch(`/api/v1/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  } catch (e) {
    console.warn("Failed to patch application on server:", e);
  }

  return updated;
}

export async function updateApplicationStatus(
  id: string,
  newStatus: ApplicationStatus,
  userId: string
): Promise<void> {
  await updateApplication(id, { status: newStatus }, userId);
}

export async function deleteApplication(id: string, userId: string): Promise<void> {
  deleteLocalApplication(id, userId);

  try {
    await fetch(`/api/v1/applications/${id}`, {
      method: "DELETE",
    });
  } catch (e) {
    console.warn("Failed to delete application on server:", e);
  }
}
