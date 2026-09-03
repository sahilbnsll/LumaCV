import { ResumeData, TemplateType } from './resume-schema';
import { AnalyzeJDResponse } from './resume-schema';
import { MatchScoreResponse } from './match-score-types';

export type ProjectSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ProjectBulletDiff {
    id: string;
    section: 'experience' | 'projects' | 'internships';
    itemIndex: number;
    bulletIndex: number;
    original: string;
    tailored: string;
    accepted: boolean;
    rationale?: string;
}

export interface ResumeProject {
    id: string;
    version: number;
    title: string;
    targetJobTitle?: string;
    targetJobCompany?: string;
    currentStep: 1 | 2 | 3 | 4;
    sourceResumeText?: string;
    sourceResumeData?: ResumeData;
    verifiedResumeData?: ResumeData;
    jdRaw?: string;
    jdAnalysis?: AnalyzeJDResponse;
    originalScore?: MatchScoreResponse;
    tailoredScore?: MatchScoreResponse;
    tailoredResumeData?: ResumeData;
    bulletDiffs?: ProjectBulletDiff[];
    templateId: TemplateType;
    themeId: string;
    typstSource?: string;
    confidenceScore?: number;
    factValidationReport?: {
        passed: boolean;
        issuesCount: number;
        preservedMetricsCount: number;
        verifiedEmployersCount: number;
    };
    saveStatus: ProjectSaveStatus;
    lastSavedAt?: string;
    createdAt: string;
    updatedAt: string;
}

const LOCAL_PROJECTS_KEY = 'lumacv_active_projects';
const ACTIVE_PROJECT_ID_KEY = 'lumacv_current_project_id';

export function getStoredProjects(): ResumeProject[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch {
        return [];
    }
}

export function getStoredProjectById(id: string): ResumeProject | null {
    const list = getStoredProjects();
    return list.find(p => p.id === id) || null;
}

export function saveStoredProject(project: ResumeProject): void {
    if (typeof window === 'undefined') return;
    try {
        const list = getStoredProjects();
        const now = new Date().toISOString();
        const updatedProject: ResumeProject = {
            ...project,
            version: (project.version || 1) + 1,
            lastSavedAt: now,
            updatedAt: now,
            saveStatus: 'saved',
        };

        const existingIndex = list.findIndex(p => p.id === project.id);
        if (existingIndex >= 0) {
            list[existingIndex] = updatedProject;
        } else {
            list.unshift(updatedProject);
        }

        localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(list));
        localStorage.setItem(ACTIVE_PROJECT_ID_KEY, project.id);
    } catch (e) {
        console.error('Failed to save project:', e);
    }
}

export function deleteStoredProject(id: string): void {
    if (typeof window === 'undefined') return;
    try {
        const list = getStoredProjects().filter(p => p.id !== id);
        localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(list));
        if (localStorage.getItem(ACTIVE_PROJECT_ID_KEY) === id) {
            localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
        }
    } catch (e) {
        console.error('Failed to delete project:', e);
    }
}

export function formatSaveStatus(lastSavedAt?: string, status?: ProjectSaveStatus): string {
    if (status === 'saving') return 'Saving changes...';
    if (status === 'error') return 'Autosave error (cached locally)';
    if (!lastSavedAt) return 'Ready';

    const d = new Date(lastSavedAt);
    if (isNaN(d.getTime())) return 'Saved';

    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 10) return 'Saved just now';
    if (diffSec < 60) return `Saved ${diffSec}s ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin === 1) return 'Saved 1 minute ago';
    if (diffMin < 60) return `Saved ${diffMin} minutes ago`;

    return `Saved at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}
