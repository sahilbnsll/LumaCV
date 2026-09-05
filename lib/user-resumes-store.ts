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
