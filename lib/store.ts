import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResumeData, AnalyzeJDResponse, TemplateType, GenerateResumeResponse } from './resume-schema';
import type { MatchScoreResponse } from './match-score-types';

interface AppState {
    step: number;

    /** Bumps when resumeData is set — remount ResumeForm so fields populate. */
    resumeDataRevision: number;

    // Step 1: Inputs
    jd: string;
    file: File | null;
    extractedText: string;

    // Step 2: Data
    resumeData: ResumeData | null;

    // Step 3: Analysis
    jdAnalysis: AnalyzeJDResponse | null;

    // Step 4: Generation
    generatedResume: {
        data: ResumeData;
        typst: string;
        confidenceScore?: number;
        auditTrail?: GenerateResumeResponse['auditTrail'];
    } | null;


    // Score tracking
    originalScore: MatchScoreResponse | null;
    tailoredScore: MatchScoreResponse | null;

    // Options
    template: TemplateType;
    theme: string;
    tailorMode: 'optimize' | 'tailor';

    // Actions
    setStep: (step: number) => void;
    setJD: (jd: string) => void;
    setFile: (file: File | null) => void;
    setExtractedText: (text: string) => void;
    setResumeData: (data: ResumeData) => void;
    /** After /api/parse-resume — bumps form key so Step 2 fields populate. */
    setResumeDataFromParse: (data: ResumeData) => void;
    setAnalysis: (analysis: AnalyzeJDResponse) => void;
    setGeneratedResume: (data: ResumeData, typst: string, score?: number, auditTrail?: GenerateResumeResponse['auditTrail']) => void;

    setOriginalScore: (score: AppState['originalScore']) => void;
    setTailoredScore: (score: AppState['tailoredScore']) => void;
    setTemplate: (template: TemplateType) => void;
    setTheme: (theme: string) => void;
    setTailorMode: (mode: 'optimize' | 'tailor') => void;
    reset: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            step: 1,
            resumeDataRevision: 0,
            jd: '',
            file: null,
            extractedText: '',
            resumeData: null,
            jdAnalysis: null,
            generatedResume: null,
            originalScore: null,
            tailoredScore: null,
            template: 'modern',
            theme: 'none',
            tailorMode: 'optimize',

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
            setAnalysis: (analysis) => set({ jdAnalysis: analysis }),
            setGeneratedResume: (data, typst, score, auditTrail) => set({
                generatedResume: { data, typst, confidenceScore: score, auditTrail }
            }),


            setOriginalScore: (score) => set({ originalScore: score }),
            setTailoredScore: (score) => set({ tailoredScore: score }),
            setTemplate: (template) => set({ template }),
            setTheme: (theme) => set({ theme }),
            setTailorMode: (tailorMode) => set({ tailorMode }),

            reset: () => set({
                step: 1,
                resumeDataRevision: 0,
                jd: '',
                file: null,
                extractedText: '',
                resumeData: null,
                jdAnalysis: null,
                generatedResume: null,
                originalScore: null,
                tailoredScore: null,
                template: 'modern',
                theme: 'none',
                tailorMode: 'optimize',
            }),
        }),
        {
            name: 'resume-builder-storage',
            partialize: (state) => ({
                step: state.step,
                jd: state.jd,
                extractedText: state.extractedText,
                resumeData: state.resumeData,
                resumeDataRevision: state.resumeDataRevision,
                jdAnalysis: state.jdAnalysis,
                generatedResume: state.generatedResume,
                originalScore: state.originalScore,
                tailoredScore: state.tailoredScore,
                template: state.template,
                theme: state.theme,
            }),

            /**
             * Prefer in-memory state for fields that may be set before persist rehydration finishes,
             * otherwise rehydration can overwrite parsed resumeData with null from storage.
             */
            merge: (persistedState, currentState) => {
                const p = persistedState as Partial<AppState>;
                const c = currentState as AppState;
                return {
                    ...c,
                    ...p,
                    resumeData: c.resumeData ?? p.resumeData ?? null,
                    jdAnalysis: c.jdAnalysis ?? p.jdAnalysis ?? null,
                    generatedResume: c.generatedResume ?? p.generatedResume ?? null,
                    jd: c.jd && c.jd.length > 0 ? c.jd : (p.jd ?? ''),
                    extractedText:
                        c.extractedText && c.extractedText.length > 0 ? c.extractedText : (p.extractedText ?? ''),
                };
            },
        }
    )
);
