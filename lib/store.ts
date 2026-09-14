import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResumeData, AnalyzeJDResponse, TemplateType, GenerateResumeResponse } from './resume-schema';
import { normalizeAnalyzeJDFromLLM } from './normalize-jd';
import type { MatchScoreResponse } from './match-score-types';

type ArraySectionName =
    | 'skills'
    | 'keyMetrics'
    | 'experience'
    | 'internships'
    | 'education'
    | 'projects'
    | 'certifications'
    | 'achievements'
    | 'publications'
    | 'openSource'
    | 'leadership'
    | 'volunteering'
    | 'conferences'
    | 'languages'
    | 'interests'
    | 'products'
    | 'customSections';

interface AppState {
    step: number;

    /** Bumps when resumeData is set, remount ResumeForm so fields populate. */
    resumeDataRevision: number;

    // Step 1: Inputs
    jd: string;
    file: File | null;
    extractedText: string;

    // Step 2: Data
    resumeData: ResumeData | null;

    /**
     * Immutable snapshot of resumeData captured right before AI tailoring runs.
     * Used only to diff "before vs after" in Step 4, never mutated, never exported.
     */
    preTailorSnapshot: ResumeData | null;

    // Step 3: Analysis
    jdAnalysis: AnalyzeJDResponse | null;

    // Step 4: Generation
    generatedResume: {
        data: ResumeData;
        typst: string;
        confidenceScore?: number;
        auditTrail?: GenerateResumeResponse['auditTrail'];
        atsAlignmentSummary?: GenerateResumeResponse['atsAlignmentSummary'];
    } | null;

    // Score tracking
    originalScore: MatchScoreResponse | null;
    tailoredScore: MatchScoreResponse | null;

    // Options
    template: TemplateType;
    theme: string;
    tailorMode: 'optimize' | 'tailor';

    /**
     * Which mode the Step 4 right panel is in:
     * - 'optimize': AI analysis/diff/keywords tabs (default after optimization run)
     * - 'edit': Manual resume editor + template selector + section order
     */
    editorMode: 'optimize' | 'edit';

    // Actions
    setStep: (step: number) => void;
    setJD: (jd: string) => void;
    setFile: (file: File | null) => void;
    setExtractedText: (text: string) => void;
    setResumeData: (data: ResumeData) => void;
    /** After /api/parse-resume, bumps form key so Step 2 fields populate. */
    setResumeDataFromParse: (data: ResumeData) => void;
    setPreTailorSnapshot: (data: ResumeData | null) => void;
    /** Replaces one bullet's text in-place (used by the Step 4 diff viewer's accept/revert toggle). */
    setBulletText: (expIdx: number, bulletIdx: number, text: string) => void;
    setAnalysis: (analysis: AnalyzeJDResponse) => void;
    setGeneratedResume: (
        data: ResumeData,
        typst: string,
        score?: number,
        auditTrail?: GenerateResumeResponse['auditTrail'],
        atsAlignmentSummary?: GenerateResumeResponse['atsAlignmentSummary']
    ) => void;

    setOriginalScore: (score: AppState['originalScore']) => void;
    setTailoredScore: (score: AppState['tailoredScore']) => void;
    setTemplate: (template: TemplateType) => void;
    setTheme: (theme: string) => void;
    setTailorMode: (mode: 'optimize' | 'tailor') => void;
    setEditorMode: (mode: 'optimize' | 'edit') => void;

    /**
     * Reorders an array section within resumeData (e.g. experience, projects).
     * Moves item at fromIndex to toIndex. No-op if indices are out of bounds.
     */
    reorderResumeSection: (section: ArraySectionName, fromIndex: number, toIndex: number) => void;

    reset: () => void;
}

export { type ArraySectionName };

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            step: 1,
            resumeDataRevision: 0,
            jd: '',
            file: null,
            extractedText: '',
            resumeData: null,
            preTailorSnapshot: null,
            jdAnalysis: null,
            generatedResume: null,
            originalScore: null,
            tailoredScore: null,
            template: 'modern',
            theme: 'none',
            tailorMode: 'optimize',
            editorMode: 'optimize',

            setStep: (step) => set({ step }),
            setJD: (jd) => set({ jd }),
            setFile: (file) => set({ file }),
            setExtractedText: (text) => set({ extractedText: text }),
            setResumeData: (data) => set({ resumeData: data }),
            setResumeDataFromParse: (data) =>
                set((s) => ({
                    resumeData: data,
                    resumeDataRevision: s.resumeDataRevision + 1,
                })),
            setPreTailorSnapshot: (data) => set({ preTailorSnapshot: data }),
            setBulletText: (expIdx, bulletIdx, text) =>
                set((state) => {
                    if (!state.resumeData) return {};
                    const experience = state.resumeData.experience ?? [];
                    if (!experience[expIdx] || !experience[expIdx].bullets[bulletIdx]) return {};
                    const nextExperience = experience.map((exp, i) => {
                        if (i !== expIdx) return exp;
                        const nextBullets = [...exp.bullets];
                        nextBullets[bulletIdx] = text;
                        return { ...exp, bullets: nextBullets };
                    });
                    const nextResumeData = { ...state.resumeData, experience: nextExperience };
                    return {
                        resumeData: nextResumeData,
                        generatedResume: state.generatedResume
                            ? { ...state.generatedResume, data: nextResumeData }
                            : state.generatedResume,
                    };
                }),
            setAnalysis: (analysis) => {
                if (!analysis) {
                    set({ jdAnalysis: null });
                    return;
                }
                try {
                    set({ jdAnalysis: normalizeAnalyzeJDFromLLM(analysis) });
                } catch {
                    set({ jdAnalysis: analysis });
                }
            },
            setGeneratedResume: (data, typst, score, auditTrail, atsAlignmentSummary) => set({
                resumeData: data,
                generatedResume: { data, typst, confidenceScore: score, auditTrail, atsAlignmentSummary }
            }),

            setOriginalScore: (score) => set({ originalScore: score }),
            setTailoredScore: (score) => set({ tailoredScore: score }),
            setTemplate: (template) => set({ template }),
            setTheme: (theme) => set({ theme }),
            setTailorMode: (tailorMode) => set({ tailorMode }),
            setEditorMode: (editorMode) => set({ editorMode }),

            reorderResumeSection: (section, fromIndex, toIndex) =>
                set((state) => {
                    if (!state.resumeData) return {};
                    const arr = (state.resumeData[section] as unknown[]) ?? [];
                    if (
                        fromIndex < 0 ||
                        toIndex < 0 ||
                        fromIndex >= arr.length ||
                        toIndex >= arr.length ||
                        fromIndex === toIndex
                    ) {
                        return {};
                    }
                    const next = [...arr];
                    const [moved] = next.splice(fromIndex, 1);
                    next.splice(toIndex, 0, moved);
                    return {
                        resumeData: {
                            ...state.resumeData,
                            [section]: next,
                        },
                    };
                }),

            reset: () => set({
                step: 1,
                resumeDataRevision: 0,
                jd: '',
                file: null,
                extractedText: '',
                resumeData: null,
                preTailorSnapshot: null,
                jdAnalysis: null,
                generatedResume: null,
                originalScore: null,
                tailoredScore: null,
                template: 'modern',
                theme: 'none',
                tailorMode: 'optimize',
                editorMode: 'optimize',
            }),
        }),
        {
            name: 'resume-builder-storage',
            partialize: (state) => ({
                step: state.step,
                jd: state.jd,
                extractedText: state.extractedText,
                resumeData: state.resumeData,
                preTailorSnapshot: state.preTailorSnapshot,
                resumeDataRevision: state.resumeDataRevision,
                jdAnalysis: state.jdAnalysis,
                generatedResume: state.generatedResume,
                originalScore: state.originalScore,
                tailoredScore: state.tailoredScore,
                template: state.template,
                theme: state.theme,
                editorMode: state.editorMode,
            }),

            /**
             * Prefer in-memory state for fields that may be set before persist rehydration finishes,
             * otherwise rehydration can overwrite parsed resumeData with null from storage.
             */
            merge: (persistedState, currentState) => {
                const p = persistedState as Partial<AppState>;
                const c = currentState as AppState;

                let cleanJdAnalysis = p.jdAnalysis ?? null;
                if (cleanJdAnalysis) {
                    try {
                        cleanJdAnalysis = normalizeAnalyzeJDFromLLM(cleanJdAnalysis);
                    } catch {
                        // ignore
                    }
                }

                let cleanTailoredScore = p.tailoredScore ?? null;
                if (
                    cleanTailoredScore?.gapAnalysis?.scoreReason?.includes('[object Object]') ||
                    cleanTailoredScore?.gapAnalysis?.remainingGaps?.some((g: any) =>
                        String(g?.missingItem || '').includes('[object Object]')
                    )
                ) {
                    cleanTailoredScore = null;
                }

                return {
                    ...c,
                    ...p,
                    resumeData: c.resumeData ?? p.resumeData ?? null,
                    preTailorSnapshot: c.preTailorSnapshot ?? p.preTailorSnapshot ?? null,
                    jdAnalysis: c.jdAnalysis ?? cleanJdAnalysis,
                    tailoredScore: c.tailoredScore ?? cleanTailoredScore,
                    generatedResume: c.generatedResume ?? p.generatedResume ?? null,
                    jd: c.jd && c.jd.length > 0 ? c.jd : (p.jd ?? ''),
                    extractedText:
                        c.extractedText && c.extractedText.length > 0 ? c.extractedText : (p.extractedText ?? ''),
                };
            },
        }
    )
);
