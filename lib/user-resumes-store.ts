import { ResumeData } from './resume-schema';
import { AnalyzeJDResponse } from './resume-schema';
import { MatchScoreResponse } from './match-score-types';


export interface SavedResume {
    id: string;
    userId?: string;
    title: string;
    targetJobTitle?: string;
    targetJobCompany?: string;
    templateId: string;
    themeId?: string;
    resumeData: ResumeData;
    jd?: string;
    jdAnalysis?: AnalyzeJDResponse;
    generatedResume?: {
        data: ResumeData;
        typst?: string;
        confidenceScore?: number;
    };
    originalScore?: MatchScoreResponse;
    tailoredScore?: MatchScoreResponse;
    typstCode?: string;
    atsScore?: number;
    lastStep?: number;
    createdAt: string;
    updatedAt: string;
}


const LOCAL_STORAGE_KEY = 'lumacv_saved_resumes';

export function formatResumeDate(dateString?: string | null): string {
    if (!dateString) return 'Recently';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recently';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return 'Just now';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24 && d.getDate() === now.getDate()) return 'Today';
    if (diffHours < 48) return 'Yesterday';

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}

export function getLocalResumes(userId?: string): SavedResume[] {
    if (typeof window === 'undefined') return [];
    if (!userId) return []; // Unauthenticated users cannot access saved resumes
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((item: unknown) => {
                const it = item as SavedResume;
                return it.userId === userId;
            })
            .map((item: unknown) => {
                const it = item as SavedResume;
                return {
                    ...it,
                    createdAt: it.createdAt || it.updatedAt || new Date().toISOString(),
                    updatedAt: it.updatedAt || it.createdAt || new Date().toISOString(),
                };
            });

    } catch {
        return [];
    }
}

/** Row shape returned by GET /api/v1/resumes (snake_case Supabase columns). */
interface SavedResumeRow {
    id?: string;
    user_id?: string;
    title?: string;
    target_job_title?: string;
    target_job_company?: string;
    template_id?: string;
    resume_data?: (ResumeData & { _snapshot?: Partial<SavedResume> }) | null;
    jd?: string;
    typst_code?: string;
    ats_score?: number;
    created_at?: string;
    updated_at?: string;
}

function mapResumeRow(row: SavedResumeRow): SavedResume {
    const snapshot = row.resume_data?._snapshot;
    return {
        id: String(row.id || ''),
        userId: row.user_id ? String(row.user_id) : undefined,
        title: String(row.title || 'Professional Resume'),
        targetJobTitle: row.target_job_title || undefined,
        targetJobCompany: row.target_job_company || undefined,
        templateId: String(row.template_id || 'modern'),
        resumeData: row.resume_data as ResumeData,
        jd: snapshot?.jd || row.jd,
        jdAnalysis: snapshot?.jdAnalysis,
        generatedResume: snapshot?.generatedResume,
        originalScore: snapshot?.originalScore,
        tailoredScore: snapshot?.tailoredScore,
        typstCode: row.typst_code,
        atsScore: typeof row.ats_score === 'number' && row.ats_score > 0 ? row.ats_score : undefined,
        lastStep: snapshot?.lastStep || 4,
        createdAt: String(row.created_at || row.updated_at || new Date().toISOString()),
        updatedAt: String(row.updated_at || row.created_at || new Date().toISOString()),
    };
}

/**
 * The signed-in user's saved resumes, from the server first (the real
 * source of truth, synced across devices) with a same-device localStorage
 * fallback on network failure or an empty/unconfigured Supabase table.
 * Several pages (dashboard, ATS checker) need this same "list what this
 * user has saved" data; pulling it from localStorage alone, as the ATS
 * checker used to, misses anything saved from a different device/session.
 */
export async function fetchSavedResumes(userId?: string): Promise<SavedResume[]> {
    if (!userId) return [];
    try {
        const res = await fetch('/api/v1/resumes');
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.resumes) && data.resumes.length > 0) {
                return data.resumes.map((row: unknown) => mapResumeRow(row as SavedResumeRow));
            }
        }
    } catch {
        // Network/server failure, fall through to the local fallback below.
    }
    return getLocalResumes(userId);
}

export function saveLocalResume(resume: SavedResume, userId?: string): void {
    if (typeof window === 'undefined') return;
    const effectiveUserId = userId || resume.userId;
    if (!effectiveUserId) return; // Do not persist unauthenticated resumes to history
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        let list: SavedResume[] = [];
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) list = parsed;
            } catch {
                list = [];
            }
        }
        const now = new Date().toISOString();
        const fullItem: SavedResume = {
            ...resume,
            userId: effectiveUserId,
            createdAt: resume.createdAt || now,
            updatedAt: now,
        };
        const existingIndex = list.findIndex(r => r.id === resume.id);
        if (existingIndex >= 0) {
            list[existingIndex] = fullItem;
        } else {
            list.unshift(fullItem);
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

export function deleteLocalResume(id: string, userId?: string): void {
    if (typeof window === 'undefined') return;
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) return;
        const list = JSON.parse(raw);
        if (!Array.isArray(list)) return;
        const filtered = list.filter((r: SavedResume) => {
            if (userId && r.userId !== userId) return true;
            return r.id !== id;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
        console.error('Failed to delete from localStorage:', e);
    }
}

export function clearLocalResumes(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
        console.error('Failed to clear local resumes:', e);
    }
}

export function getLocalResumeById(id: string, userId?: string): SavedResume | null {
    if (!userId) return null;
    const list = getLocalResumes(userId);
    return list.find(r => r.id === id) || null;
}

/**
 * Deterministic per-user id for the editor's "default draft" resume, the
 * one it falls back to when opened without a saved resume's real id (e.g.
 * `/editor` with no `?id=`). Must be a real UUID, unlike the old
 * `editor-<uid>-default` scheme, because autosave upserts it straight into
 * Supabase's `user_resumes.id` (a uuid column); derived from the user's
 * own (already-UUID) id so it stays stable across visits without needing
 * storage or randomness.
 */
export function defaultDraftResumeId(userId: string): string {
    const hex = userId.replace(/-/g, '').padEnd(20, '0');
    return `${hex.slice(0, 8)}-0000-4000-8000-${hex.slice(8, 20)}`;
}
