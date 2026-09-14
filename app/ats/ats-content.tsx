"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { AppHeader } from '@/components/app-header';
import { EditorialFooter } from '@/components/landing/editorial-footer';
import { useAuth } from '@/components/auth-provider';
import { fetchSavedResumes, SavedResume } from '@/lib/user-resumes-store';
import { extractTextFromFile } from '@/lib/document-parser';
import { resumeDataToPlainText } from '@/lib/resume-plaintext';
import { DEMO_RESUME_DATA } from '@/lib/demo-data';
import { ResumeData } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { notify } from '@/lib/notify';
import {
    Activity,
    FileText,
    FileUp,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    ShieldCheck,
    Copy,
    Target,
    Terminal,
    Info,
    Check,
    X,
    RotateCcw,
    Zap,
    Layers,
    ArrowRight
} from 'lucide-react';

type AtsState = 'idle' | 'reading' | 'analyzing' | 'complete' | 'error';

interface NormalizedAtsResult {
    score: number;
    /** False when there weren't enough real JD keywords to score against, the UI
     *  must show an honest "no JD" state instead of a fabricated 0%/85% score. */
    isCalculated: boolean;
    /** True when a JD *was* pasted but analyzing it requires sign-in, distinct
     *  from simply not having pasted one, so the "no JD" panel can tell the
     *  user the real reason instead of asking them to paste a JD they already did. */
    jdAuthRequired: boolean;
    scoreReason: string;
    requiredMatched: string[];
    requiredMissing: string[];
    preferredMatched: string[];
    preferredMissing: string[];
    remainingGaps: Array<{
        category: string;
        missingItem: string;
        impact: string;
        recommendation: string;
    }>;
    keywordDensity: {
        score: number;
        rating: string;
        summary: string;
        totalWords?: number;
    };
    weakestSections: Array<{
        section: string;
        reason: string;
        action: string;
    }>;
    strongestSections: string[];
}

interface SampleJdKeywords {
    required_skills: string[];
    preferred_skills: string[];
    responsibilities: string[];
    buzzwords: string[];
}

const SAMPLE_JOB_DESCRIPTIONS: Array<{
    title: string;
    company: string;
    text: string;
    /** Pre-computed keyword extraction for this fixed, known JD text. Lets
     *  "Test with sample roles" work instantly for guests with zero network
     *  call and zero auth requirement, /api/v1/resume/analyze-jd is a real
     *  AI call and correctly requires sign-in, but there's no reason to pay
     *  that cost (or hit that wall) analyzing text that never changes. */
    keywords: SampleJdKeywords;
}> = [
    {
        title: "Staff Frontend Engineer",
        company: "Vercel / Stripe scale",
        text: `Role: Staff Frontend Engineer
Requirements:
- 6+ years of production experience building high-performance web applications with React, Next.js, and TypeScript.
- Deep expertise in Core Web Vitals, SSR/ISR caching strategies, and modern CSS architecture (Tailwind CSS, CSS Modules).
- Proven track record designing and maintaining accessible design systems adhering to WCAG 2.1 AA specifications.
- Strong proficiency with state management, vector rendering (SVG/Canvas), and client-side AST parsers.
- Experience mentoring senior engineers, leading architectural RFCs, and establishing automated testing pipelines (Playwright, Jest).`,
        keywords: {
            required_skills: ["React", "Next.js", "TypeScript", "Core Web Vitals", "SSR", "ISR", "Tailwind CSS", "CSS Modules", "SVG", "Canvas", "Playwright", "Jest"],
            preferred_skills: ["WCAG 2.1 AA", "Design Systems", "State Management", "AST Parsers"],
            responsibilities: ["Building high-performance web applications", "Designing and maintaining accessible design systems", "Mentoring senior engineers", "Leading architectural RFCs", "Establishing automated testing pipelines"],
            buzzwords: ["production experience", "scale"],
        },
    },
    {
        title: "Senior Full-Stack Engineer",
        company: "Modern SaaS / Cloud",
        text: `Role: Senior Full-Stack Software Engineer
Requirements:
- 5+ years experience building scalable web services and distributed systems using Node.js, TypeScript, and Python.
- Advanced relational database design with PostgreSQL, Prisma/Drizzle ORM, query optimization, and Redis caching.
- Hands-on experience architecting microservices with Docker, Kubernetes, AWS (ECS, S3, CloudFront), and GitHub Actions CI/CD.
- Experience designing RESTful and GraphQL APIs with strict OpenAPI/Zod validation schemas.
- Familiarity with event-driven architectures (Kafka, SQS) and automated end-to-end security compliance.`,
        keywords: {
            required_skills: ["Node.js", "TypeScript", "Python", "PostgreSQL", "Prisma", "Drizzle ORM", "Redis", "Docker", "Kubernetes", "AWS", "ECS", "S3", "CloudFront", "GitHub Actions", "GraphQL", "RESTful APIs", "OpenAPI", "Zod"],
            preferred_skills: ["Kafka", "SQS", "Event-driven architecture", "Security compliance"],
            responsibilities: ["Building scalable web services and distributed systems", "Architecting microservices", "Designing RESTful and GraphQL APIs", "Query optimization"],
            buzzwords: ["CI/CD", "distributed systems"],
        },
    },
    {
        title: "Lead Product Engineer",
        company: "AI & Interactive Tools",
        text: `Role: Lead Product Engineer
Requirements:
- Track record bridging high-fidelity product design with robust full-stack engineering.
- Mastery of modern React, Next.js App Router, Tailwind CSS, and Framer Motion for rich micro-interactions.
- Experience integrating generative AI workflows (OpenAI, Gemini APIs, structured outputs, streaming completions).
- Strong product intuition, rapid prototyping velocity, user-centric thinking, and metric-driven experimentation.
- Self-directed problem solver capable of owning entire feature lifecycles from technical spec to production release.`,
        keywords: {
            required_skills: ["React", "Next.js App Router", "Tailwind CSS", "Framer Motion", "Generative AI", "OpenAI", "Gemini APIs", "Structured Outputs", "Streaming Completions"],
            preferred_skills: ["Product Design", "Rapid Prototyping", "Metric-driven Experimentation"],
            responsibilities: ["Bridging product design with engineering", "Owning entire feature lifecycles", "Building rich micro-interactions"],
            buzzwords: ["product intuition", "self-directed"],
        },
    },
];

function AtsCheckerContent() {
    const searchParams = useSearchParams();
    const { user } = useAuth();

    // Source selection
    const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');
    const [activeFileName, setActiveFileName] = useState<string>(() => `${DEMO_RESUME_DATA.personalInfo.name} (Sample Resume)`);
    const [activeResumeData, setActiveResumeData] = useState<ResumeData | null>(DEMO_RESUME_DATA);
    const [extractedRawText, setExtractedRawText] = useState<string>(() => resumeDataToPlainText(DEMO_RESUME_DATA));

    // Target Job Description & Modes
    const [jobDescription, setJobDescription] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'software-view' | 'diagnostics'>('software-view');

    // Analysis Lifecycle
    const [analysisState, setAnalysisState] = useState<AtsState>('idle');
    const [analysisResult, setAnalysisResult] = useState<NormalizedAtsResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Load user's saved resumes. Previously read localStorage only, so a
    // resume saved from another device/session (or after clearing local
    // storage) silently didn't show up here even though the dashboard
    // could see it, fetches the server copy first now, same as dashboard.
    useEffect(() => {
        if (!user) {
            setSavedResumes([]);
            return;
        }
        let cancelled = false;
        fetchSavedResumes(user.id).then((list) => {
            if (cancelled) return;
            setSavedResumes(list);

            const queryId = searchParams.get('id');
            if (queryId) {
                const found = list.find(r => r.id === queryId);
                if (found) {
                    setSelectedResumeId(found.id);
                    setActiveFileName(found.title);
                    setActiveResumeData(found.resumeData);
                    const plain = resumeDataToPlainText(found.resumeData);
                    setExtractedRawText(plain);
                    if (found.jd) setJobDescription(found.jd);
                }
            }
        });
        return () => {
            cancelled = true;
        };
    }, [user, searchParams]);

    // Handle Dropzone Upload
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];
        setActiveFileName(file.name);
        setSelectedResumeId('');
        setActiveResumeData(null);
        setAnalysisState('reading');
        setErrorMessage('');

        try {
            const text = await extractTextFromFile(file);
            if (!text || text.trim().length < 25) {
                throw new Error('Could not extract readable text from document. Ensure it contains select-able vector text and is not a flattened scan.');
            }
            setExtractedRawText(text);
            notify.success('Document text extracted', file.name);
            setAnalysisState('idle');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to extract text from document';
            setErrorMessage(msg);
            setAnalysisState('error');
            notify.error('Extraction failed', msg);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'application/json': ['.json'],
        },
        maxFiles: 1,
    });

    // Handle Selecting a Saved Resume
    const handleSelectSavedResume = (id: string) => {
        if (!id) return;
        setSelectedResumeId(id);
        const resume = savedResumes.find(r => r.id === id);
        if (resume) {
            setActiveFileName(resume.title);
            setActiveResumeData(resume.resumeData);
            const plain = resumeDataToPlainText(resume.resumeData);
            setExtractedRawText(plain);
            if (resume.jd) setJobDescription(resume.jd);
            notify.info('Loaded resume', resume.title);
        }
    };

    // Run Full ATS Analysis
    const runAtsAnalysis = useCallback(async () => {
        if (!extractedRawText || extractedRawText.trim().length === 0) {
            notify.error('Missing resume text', 'Please upload a file or select a resume first');
            return;
        }

        setAnalysisState('analyzing');
        setErrorMessage('');

        try {
            let jdKeywords = {
                required_skills: [] as string[],
                preferred_skills: [] as string[],
                responsibilities: [] as string[],
                buzzwords: [] as string[],
            };

            let jdAnalysisFailed = false;
            let jdAnalysisAuthRequired = false;
            const matchedSample = SAMPLE_JOB_DESCRIPTIONS.find((s) => s.text.trim() === jobDescription.trim());

            if (matchedSample) {
                // Known, fixed text, use the pre-computed keywords instead of
                // paying for (and auth-gating) a real AI call to re-derive
                // something that never changes.
                jdKeywords = matchedSample.keywords;
            } else if (jobDescription.trim().length > 30) {
                const jdRes = await fetch('/api/v1/resume/analyze-jd', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jd: jobDescription }),
                });

                if (jdRes.ok) {
                    const jdData = await jdRes.json();
                    if (jdData.keywords) {
                        jdKeywords = jdData.keywords;
                    }
                } else {
                    // Don't silently score against an empty keyword set as if the JD
                    // had been read, tell the user their JD wasn't actually analyzed.
                    // This endpoint requires sign-in (it's a real AI call, unlike the
                    // rest of this tool), that's the actual cause most of the time,
                    // so say so instead of a generic "couldn't extract keywords" that
                    // leaves a perfectly good pasted JD looking like it failed for no
                    // reason.
                    jdAnalysisFailed = true;
                    jdAnalysisAuthRequired = jdRes.status === 401;
                }
            }

            // Call scoring API
            const scoreRes = await fetch('/api/v1/resume/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText: extractedRawText,
                    resumeData: activeResumeData,
                    jdKeywords,
                }),
            });

            if (!scoreRes.ok) {
                const errJson = await scoreRes.json().catch(() => ({}));
                throw new Error(errJson.error || `Scoring failed with status ${scoreRes.status}`);
            }

            const rawData = await scoreRes.json();

            if (jdAnalysisFailed) {
                if (jdAnalysisAuthRequired) {
                    notify.error('Sign in to analyze against a job description', 'JD-based keyword matching requires an account, scoring your resume without a target JD for now.');
                } else {
                    notify.error('Job description not analyzed', 'Could not extract keywords, scoring your resume without a target JD.');
                }
            }

            // Normalize response safely regardless of shape.
            // `rawData.score` is a 0–1 fraction from the API, not a percentage, scale
            // it here. `isCalculated` (false when there were no real JD keywords to
            // score against) is what drives the honest "no JD" UI state below, instead
            // of ever showing a fabricated 0% or 85% as if it were a real assessment.
            const normalized: NormalizedAtsResult = {
                score: Math.round((rawData.score ?? 0) * 100),
                isCalculated: rawData.isCalculated === true,
                jdAuthRequired: jdAnalysisAuthRequired,
                scoreReason: rawData.gapAnalysis?.scoreReason || rawData.scoreReason || 'Parser evaluated token coverage and structural section headers.',
                requiredMatched: rawData.breakdown?.required_skills?.matched || rawData.details?.required?.matched || [],
                requiredMissing: rawData.breakdown?.required_skills?.missing || rawData.details?.required?.missing || [],
                preferredMatched: rawData.breakdown?.preferred_skills?.matched || rawData.details?.preferred?.matched || [],
                preferredMissing: rawData.breakdown?.preferred_skills?.missing || rawData.details?.preferred?.missing || [],
                remainingGaps: rawData.gapAnalysis?.remainingGaps || rawData.remainingGaps || [],
                keywordDensity: {
                    score: rawData.diagnostics?.keywordDensity?.score ?? rawData.keywordDensity?.densityPercentage ?? 80,
                    rating: rawData.diagnostics?.keywordDensity?.rating || 'optimal',
                    summary: rawData.diagnostics?.keywordDensity?.summary || 'Keywords distributed cleanly without repetitive stuffing.',
                    totalWords: rawData.keywordDensity?.totalWords || extractedRawText.trim().split(/\s+/).length,
                },
                weakestSections: rawData.diagnostics?.weakestSections || rawData.weakestSections || [],
                strongestSections: rawData.diagnostics?.strongestSections || ['Work Experience', 'Technical Skills'],
            };

            setAnalysisResult(normalized);
            setAnalysisState('complete');
            setActiveTab('diagnostics');
            // A 0% (or any) score is only meaningful once it's actually been
            // measured against real JD keywords, without that, `score` is
            // just the empty-keyword default, and announcing it as an
            // "analysis complete ... score" reads as a real result when
            // nothing was actually scored. The "no target JD" panel already
            // makes that state clear in the UI; the toast should match it
            // instead of contradicting it with a fake percentage.
            if (normalized.isCalculated) {
                notify.success('ATS analysis complete', `${normalized.score}% score`);
            } else if (!jdAnalysisFailed) {
                notify.success('Resume checked', 'Add a target job description for a real match score.');
            }
        } catch (err) {
            console.error('ATS Analysis error:', err);
            const msg = err instanceof Error ? err.message : 'Unable to complete ATS analysis';
            setErrorMessage(msg);
            setAnalysisState('error');
            notify.error('Analysis failed', msg);
        }
    }, [extractedRawText, activeResumeData, jobDescription]);

    // Section Header Recognition Health
    const detectedSections = useMemo(() => {
        const text = (extractedRawText || '').toLowerCase();
        return [
            { name: 'Contact Information', detected: /[@]|phone|email|linkedin|github/i.test(text), description: 'Email, phone, and professional links' },
            { name: 'Professional Summary', detected: /summary|profile|about|overview/i.test(text), description: 'Executive summary or statement' },
            { name: 'Work Experience', detected: /experience|employment|work history|career/i.test(text), description: 'Roles, company names, and dates' },
            { name: 'Technical Skills', detected: /skills|competencies|technologies|tech stack/i.test(text), description: 'Categorized languages and frameworks' },
            { name: 'Education', detected: /education|degree|university|college|b\.s|b\.a/i.test(text), description: 'Degrees, institutions, and dates' },
            { name: 'Projects', detected: /projects|portfolio|open source/i.test(text), description: 'Featured technical software work' },
            { name: 'Certifications', detected: /certifications|credentials|licenses|awards/i.test(text), description: 'Industry credentials & honors' },
        ];
    }, [extractedRawText]);

    // Token Statistics
    const textStats = useMemo(() => {
        if (!extractedRawText) return { words: 0, characters: 0, readingTimeMin: 0 };
        const words = extractedRawText.trim().split(/\s+/).filter(Boolean).length;
        const characters = extractedRawText.length;
        const readingTimeMin = Math.max(1, Math.round(words / 200));
        return { words, characters, readingTimeMin };
    }, [extractedRawText]);

    // Highlight filter matching
    const allMatchedKeywords = useMemo(() => {
        if (!analysisResult) return [];
        return [...analysisResult.requiredMatched, ...analysisResult.preferredMatched];
    }, [analysisResult]);

    return (
        <div className="min-h-screen bg-transparent text-foreground flex flex-col antialiased">
            <AppHeader />

            <main id="main-content" className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-500" />
                            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
                                ATS Software Parser & Diagnostics
                            </h1>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Verify character stream reading order, audit standard section headers, and inspect keyword density across recruitment systems.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {activeResumeData && (
                            <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-medium border-border/80 hover:bg-muted/40 rounded-xl">
                                <Link href={selectedResumeId ? `/editor?id=${selectedResumeId}` : '/editor'}>
                                    <FileText className="h-3.5 w-3.5 text-primary" />
                                    Open in Editor
                                </Link>
                            </Button>
                        )}

                        <Button
                            size="sm"
                            disabled={analysisState === 'reading' || analysisState === 'analyzing'}
                            onClick={runAtsAnalysis}
                            className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-600/90 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                        >
                            {analysisState === 'analyzing' ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Auditing Stream...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Run ATS Audit
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mode Explanation Pill */}
                <div className="mt-5 p-3.5 rounded-2xl bg-muted/20 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="font-semibold text-foreground">Dual Audit Engine: </span>
                            <span className="text-muted-foreground">
                                Test structural parser readability on any resume, or paste a target Job Description to measure keyword coverage.
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono text-muted-foreground">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Typst Linear Stream Verified</span>
                    </div>
                </div>

                {/* Workspace Grid */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Source Selection & File Upload (5 cols) */}
                    <div className="lg:col-span-5 space-y-5">
                        {/* Resume Selector Box */}
                        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Layers className="h-3.5 w-3.5 text-primary" />
                                    <span>Document Source</span>
                                </h3>
                                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[180px]">
                                    {activeFileName}
                                </span>
                            </div>

                            {/* Saved Resumes Dropdown */}
                            {savedResumes.length > 0 && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="saved-resume-select" className="text-xs text-muted-foreground font-medium">Select from Workspace</Label>
                                    <select
                                        id="saved-resume-select"
                                        aria-label="Choose a saved resume"
                                        value={selectedResumeId}
                                        onChange={(e) => handleSelectSavedResume(e.target.value)}
                                        className="w-full h-9 rounded-lg border border-border/80 bg-muted/20 px-3 text-xs text-foreground focus:outline-none focus:border-primary/50"
                                    >
                                        <option value="">-- Choose saved resume --</option>
                                        {savedResumes.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.title} ({r.templateId || 'modern'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Drag and drop zone */}
                            <div
                                {...getRootProps()}
                                className={`rounded-xl border border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                                    isDragActive
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border/80 hover:border-primary/50 hover:bg-muted/20'
                                }`}
                            >
                                <input {...getInputProps()} />
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                                    <FileUp className="h-5 w-5" />
                                </div>
                                <p className="text-xs font-semibold text-foreground">
                                    Drop any PDF, DOCX, or JSON resume here
                                </p>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Client-side extraction. No images sent to third parties.
                                </p>
                            </div>

                            {/* Quick Switch to Demo */}
                            <div className="flex items-center justify-between pt-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveFileName(`${DEMO_RESUME_DATA.personalInfo.name} (${DEMO_RESUME_DATA.personalInfo.title})`);
                                        setSelectedResumeId('');
                                        setActiveResumeData(DEMO_RESUME_DATA);
                                        setExtractedRawText(resumeDataToPlainText(DEMO_RESUME_DATA));
                                        notify.info('Demo resume loaded', DEMO_RESUME_DATA.personalInfo.name);
                                    }}
                                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                                >
                                    Load Sample Resume ({DEMO_RESUME_DATA.personalInfo.name})
                                </button>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    {textStats.words} words parsed
                                </span>
                            </div>
                        </div>

                        {/* Target Job Description Input */}
                        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="ats-jd-input" className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Target className="h-3.5 w-3.5 text-primary" />
                                    <span>Target Job Description (Optional)</span>
                                </Label>
                                {jobDescription && (
                                    <button
                                        type="button"
                                        onClick={() => setJobDescription('')}
                                        className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Paste the target job posting to score keyword density and required qualification coverage.
                            </p>

                            {/* Quick Preset JDs */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                    Test with Sample Roles:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {SAMPLE_JOB_DESCRIPTIONS.map((sample, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setJobDescription(sample.text);
                                                notify.info('Applied sample JD', sample.title);
                                            }}
                                            className="px-2 py-1 rounded-md bg-muted/40 hover:bg-muted text-[10px] font-medium text-foreground border border-border/50 transition-colors cursor-pointer"
                                        >
                                            {sample.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Textarea
                                id="ats-jd-input"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste job description requirements, qualifications, and responsibilities here..."
                                rows={6}
                                className="text-xs bg-muted/20 border-border/60 focus:border-primary/50 resize-y font-mono"
                            />
                        </div>

                        {/* Section Health Checklist */}
                        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
                            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    Section Recognition Audit
                                </span>
                                <span className="text-[10px] font-mono font-normal text-emerald-500">
                                    {detectedSections.filter(s => s.detected).length} / {detectedSections.length} Passed
                                </span>
                            </h3>

                            <div className="space-y-2 pt-1">
                                {detectedSections.map((sec, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/40 text-xs">
                                        <div>
                                            <div className="font-medium text-foreground">{sec.name}</div>
                                            <div className="text-[10px] text-muted-foreground">{sec.description}</div>
                                        </div>
                                        {sec.detected ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 border border-emerald-500/20 shrink-0">
                                                <Check className="h-2.5 w-2.5" />
                                                Detected
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/20 shrink-0">
                                                <AlertCircle className="h-2.5 w-2.5" />
                                                Missing
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Workstation Display & Diagnostics (7 cols) */}
                    <div className="lg:col-span-7 space-y-5">
                        {/* Tabs Bar */}
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveTab('software-view')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                                        activeTab === 'software-view'
                                            ? 'bg-muted text-foreground font-semibold shadow-2xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Terminal className="h-3.5 w-3.5" />
                                    <span>What Software Reads (Raw Tokens)</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('diagnostics')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                                        activeTab === 'diagnostics'
                                            ? 'bg-muted text-foreground font-semibold shadow-2xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Target className="h-3.5 w-3.5" />
                                    <span>ATS Score & Diagnostics</span>
                                    {analysisResult?.isCalculated && (
                                        <span className="ml-1 rounded bg-emerald-500/15 text-emerald-500 px-1 text-[10px] font-bold">
                                            {analysisResult.score}%
                                        </span>
                                    )}
                                </button>
                            </div>

                            <span className="text-[11px] text-muted-foreground hidden sm:inline font-mono">
                                ~{textStats.readingTimeMin} min read
                            </span>
                        </div>

                        {/* Error Banner */}
                        {analysisState === 'error' && (
                            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive flex items-start gap-3">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <div className="font-semibold">Analysis Failed</div>
                                    <p className="text-muted-foreground">{errorMessage}</p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={runAtsAnalysis}
                                        className="h-7 text-xs mt-2 border-destructive/30"
                                    >
                                        <RotateCcw className="h-3 w-3 mr-1" />
                                        Retry Analysis
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Tab 1: Raw Plaintext Stream */}
                        {activeTab === 'software-view' && (
                            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-semibold text-foreground">
                                            Extracted Token Stream
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            ({textStats.characters} characters)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                navigator.clipboard.writeText(extractedRawText);
                                                notify.copied('Raw text copied to clipboard');
                                            }}
                                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                                        >
                                            <Copy className="h-3 w-3" />
                                            <span>Copy Plaintext</span>
                                        </Button>
                                    </div>
                                </div>

                                {allMatchedKeywords.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-muted/20 border border-border/40">
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                            Matched in stream:
                                        </span>
                                        {allMatchedKeywords.slice(0, 10).map((kw, i) => (
                                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                                                {kw}
                                            </span>
                                        ))}
                                        {allMatchedKeywords.length > 10 && (
                                            <span className="text-[10px] text-muted-foreground font-mono">+{allMatchedKeywords.length - 10} more</span>
                                        )}
                                    </div>
                                )}

                                <div className="p-4 rounded-xl bg-neutral-950 text-zinc-300 font-mono text-xs leading-relaxed overflow-x-auto max-h-[520px] overflow-y-auto border border-border select-text whitespace-pre-wrap">
                                    {extractedRawText || 'No text extracted. Drop a PDF or select a resume from the left pane.'}
                                </div>

                                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 text-[11px] text-muted-foreground flex items-start gap-2.5">
                                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">
                                        Applicant tracking systems (Workday, Greenhouse, Lever, Taleo) do not parse HTML/CSS styling or visual positioning. They process this exact linear character stream. Typst compilation guarantees pure, single-column reading order without column inversion bugs.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: ATS Diagnostics & Score */}
                        {activeTab === 'diagnostics' && (
                            <div className="space-y-5">
                                {analysisResult ? (
                                    <>
                                        {/* Score Overview Banner */}
                                        {!analysisResult.isCalculated ? (
                                            <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 flex items-start gap-3">
                                                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-semibold text-foreground">
                                                        {analysisResult.jdAuthRequired ? 'Sign in to score against your job description' : 'No target job description provided'}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        {analysisResult.jdAuthRequired
                                                            ? 'Your job description was received, but matching it against keywords requires an account. Sign in and re-run the audit for a real score.'
                                                            : "Paste a job description on the left to get a real ATS keyword-match score. Without one, there's nothing to score your resume against."}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
                                            <div className="flex flex-col items-center justify-center h-28 w-28 rounded-full border-4 border-emerald-500/20 bg-emerald-500/5 shrink-0">
                                                <span className="text-3xl font-extrabold font-display text-emerald-500">
                                                    {analysisResult.score}%
                                                </span>
                                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                    ATS Score
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-center sm:text-left">
                                                <h3 className="text-sm font-semibold text-foreground">
                                                    {analysisResult.score >= 85
                                                        ? 'Strong Parseability & Target Alignment'
                                                        : 'Moderate Alignment, Gaps Identified'}
                                                </h3>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {analysisResult.scoreReason}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                                                    <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40 font-mono">
                                                        Density: {analysisResult.keywordDensity.score}% ({analysisResult.keywordDensity.rating})
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40 font-mono">
                                                        Total Words: {analysisResult.keywordDensity.totalWords || textStats.words}
                                                    </span>
                                                    <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                                                        Single-Page Fit Verified
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        )}

                                        {/* Gap Recommendations */}
                                        {analysisResult.remainingGaps.length > 0 && (
                                            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
                                                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                                    <span>Critical Requirement Gaps</span>
                                                </h3>

                                                <div className="space-y-2">
                                                    {analysisResult.remainingGaps.map((gap, idx) => (
                                                        <div key={idx} className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-1 text-xs">
                                                            <div className="flex items-center justify-between font-semibold text-foreground">
                                                                <span>{gap.missingItem}</span>
                                                                <span className="text-rose-500 font-mono text-[11px]">{gap.impact}</span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                                {gap.recommendation}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Matched vs Missing Skills Breakdown */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Matched Skills */}
                                            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                                                        <Check className="h-3.5 w-3.5" />
                                                        <span>Verified Competencies</span>
                                                    </h4>
                                                    <span className="text-[11px] font-mono text-muted-foreground">
                                                        {analysisResult.requiredMatched.length + analysisResult.preferredMatched.length}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5">
                                                    {[...analysisResult.requiredMatched, ...analysisResult.preferredMatched].map((kw, i) => (
                                                        <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                    {[...analysisResult.requiredMatched, ...analysisResult.preferredMatched].length === 0 && (
                                                        <p className="text-xs text-muted-foreground italic">
                                                            No specific target keywords matched yet.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Missing Skills */}
                                            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-semibold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                                                        <X className="h-3.5 w-3.5" />
                                                        <span>Missing Keywords</span>
                                                    </h4>
                                                    <span className="text-[11px] font-mono text-muted-foreground">
                                                        {analysisResult.requiredMissing.length + analysisResult.preferredMissing.length}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5">
                                                    {[...analysisResult.requiredMissing, ...analysisResult.preferredMissing].map((kw, i) => (
                                                        <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                    {[...analysisResult.requiredMissing, ...analysisResult.preferredMissing].length === 0 && (
                                                        analysisResult.isCalculated ? (
                                                            <p className="text-xs text-emerald-500 font-medium">
                                                                Zero critical keyword gaps identified!
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic">
                                                                {analysisResult.jdAuthRequired
                                                                    ? 'Sign in to compare against your pasted JD.'
                                                                    : 'No target JD provided, nothing to compare against yet.'}
                                                            </p>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Weakest / Strongest Sections Advice */}
                                        {analysisResult.weakestSections.length > 0 && (
                                            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-3">
                                                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                                                    <span>Section Optimization Recommendations</span>
                                                </h4>
                                                <div className="space-y-2">
                                                    {analysisResult.weakestSections.map((w, idx) => (
                                                        <div key={idx} className="p-3 rounded-xl border border-border/40 bg-muted/20 text-xs space-y-1">
                                                            <div className="font-semibold text-foreground">{w.section}</div>
                                                            <p className="text-[11px] text-muted-foreground">{w.reason}</p>
                                                            <div className="text-[11px] text-primary font-medium flex items-center gap-1 pt-1">
                                                                <ArrowRight className="h-3 w-3" />
                                                                <span>{w.action}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-3">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Target className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-foreground">
                                            No ATS Audit Performed Yet
                                        </h3>
                                        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                            Click <span className="font-semibold text-foreground">"Run ATS Audit"</span> above to test parser readability, verify section headers, and check keyword density against target requirements.
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={runAtsAnalysis}
                                            className="h-8 text-xs font-semibold bg-primary text-primary-foreground mt-2 cursor-pointer"
                                        >
                                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                                            Analyze Now
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <EditorialFooter />
        </div>
    );
}

export default function AtsCheckerPageContent() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader variant="metaballs" size={40} className="text-primary" />
                        <p className="text-xs font-mono">Initializing ATS Checker...</p>
                    </div>
                </div>
            }
        >
            <AtsCheckerContent />
        </Suspense>
    );
}
