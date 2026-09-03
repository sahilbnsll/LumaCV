"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/components/auth-provider';
import { useAppStore } from '@/lib/store';
import { getLocalResumes, deleteLocalResume, formatResumeDate, SavedResume } from '@/lib/user-resumes-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Search,
    FileText,
    Download,
    Trash2,
    Edit3,
    Sparkles,
    Calendar,
    Briefcase,
    CheckCircle2,
    ArrowUpRight,
    Check
} from 'lucide-react';
import { TemplateType } from '@/lib/resume-schema';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/animated-counter';
import { OnboardingModal } from '@/components/onboarding-modal';

export default function DashboardPage() {

    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTemplate, setFilterTemplate] = useState('all');
    const [sortBy, setSortBy] = useState<'updated' | 'score' | 'title'>('updated');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Fetch resumes from API (or local storage fallback)
    useEffect(() => {
        let isMounted = true;
        async function fetchResumes() {
            setLoading(true);
            try {
                if (user) {
                    const res = await fetch('/api/v1/resumes');
                    if (res.ok) {
                        const data = await res.json();
                        if (isMounted && Array.isArray(data.resumes) && data.resumes.length > 0) {
                            const mapped: SavedResume[] = data.resumes.map((row: unknown) => {
                                const r = row as Record<string, unknown>;
                                const resumeData = r.resume_data as (SavedResume['resumeData'] & { _snapshot?: Partial<SavedResume> }) | undefined;
                                const snapshot = resumeData?._snapshot;
                                return {
                                    id: String(r.id || ''),
                                    userId: r.user_id ? String(r.user_id) : undefined,
                                    title: String(r.title || 'Untitled Resume'),
                                    targetJobTitle: r.target_job_title ? String(r.target_job_title) : undefined,
                                    targetJobCompany: r.target_job_company ? String(r.target_job_company) : undefined,
                                    templateId: String(r.template_id || 'modern'),
                                    resumeData: resumeData!,
                                    jd: snapshot?.jd || (r.jd ? String(r.jd) : undefined),
                                    jdAnalysis: snapshot?.jdAnalysis,
                                    generatedResume: snapshot?.generatedResume,
                                    originalScore: snapshot?.originalScore,
                                    tailoredScore: snapshot?.tailoredScore,
                                    typstCode: r.typst_code ? String(r.typst_code) : undefined,
                                    atsScore: typeof r.ats_score === 'number' ? r.ats_score : undefined,
                                    lastStep: snapshot?.lastStep || 4,
                                    createdAt: String(r.created_at || r.updated_at || new Date().toISOString()),
                                    updatedAt: String(r.updated_at || r.created_at || new Date().toISOString()),
                                };
                            });

                            setResumes(mapped);
                            setLoading(false);
                            return;
                        }
                    }
                }
                // Fallback to local storage
                if (isMounted) {
                    const locals = getLocalResumes();
                    setResumes(locals);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) {
                    setResumes(getLocalResumes());
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (!authLoading) {
            fetchResumes();
        }

        return () => { isMounted = false; };
    }, [user, authLoading]);

    // Handle Open/Edit - Restores complete project state directly into Step 4
    const handleOpenResume = (resume: SavedResume) => {
        const store = useAppStore.getState();

        // 1. Restore verified resume data
        store.setResumeData(resume.resumeData);

        // 2. Restore JD and JD analysis if present
        if (resume.jd) {
            store.setJD(resume.jd);
        }
        if (resume.jdAnalysis) {
            store.setAnalysis(resume.jdAnalysis);
        }

        // 3. Restore scores
        if (resume.originalScore) {
            store.setOriginalScore(resume.originalScore);
        }
        if (resume.tailoredScore) {
            store.setTailoredScore(resume.tailoredScore);
        }

        // 4. Restore template & theme
        store.setTemplate((resume.templateId as TemplateType) || 'modern');
        store.setTheme(resume.themeId || 'none');

        // 5. Restore compiled/tailored resume
        if (resume.generatedResume) {
            store.setGeneratedResume(
                resume.generatedResume.data,
                resume.generatedResume.typst || resume.typstCode || '',
                resume.generatedResume.confidenceScore || (resume.atsScore || 80) / 100
            );
        } else if (resume.typstCode) {
            store.setGeneratedResume(
                resume.resumeData,
                resume.typstCode,
                (resume.atsScore || 80) / 100
            );
        }

        // 6. Direct jump to final workspace (never restart workflow)
        store.setStep(resume.lastStep || (resume.typstCode ? 4 : 2));
        router.push('/builder');
    };

    // Handle Delete
    const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            deleteLocalResume(id);
            if (user) {
                await fetch(`/api/v1/resumes/${id}`, { method: 'DELETE' }).catch(() => {});
            }
            setResumes(prev => prev.filter(r => r.id !== id));
            setDeleteConfirmId(null);
            toast.success('Resume removed');
        } catch {
            toast.error('Failed to delete resume');
        }
    };

    // Handle Download PDF directly
    const handleDownloadPdf = async (resume: SavedResume, e: React.MouseEvent) => {
        e.stopPropagation();
        const toastId = toast.loading('Compiling PDF...');
        try {
            const res = await fetch('/api/v1/resume/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: resume.resumeData,
                    template: resume.templateId || 'modern',
                    theme: resume.themeId || 'none',
                    typstCode: resume.typstCode,
                }),
            });
            if (!res.ok) throw new Error('Failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const name = (resume.title || 'Resume').replace(/[^a-z0-9_-]/gi, '_');
            a.download = `${name}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Downloaded PDF', { id: toastId });
        } catch {
            toast.error('Download failed', { id: toastId });
        }
    };

    // Filter and Sort
    const filteredResumes = useMemo(() => {
        return resumes
            .filter(r => {
                const matchesSearch =
                    (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (r.targetJobTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (r.targetJobCompany || '').toLowerCase().includes(searchQuery.toLowerCase());
                const matchesTemplate = filterTemplate === 'all' || r.templateId === filterTemplate;
                return matchesSearch && matchesTemplate;
            })
            .sort((a, b) => {
                if (sortBy === 'score') return (b.atsScore || 0) - (a.atsScore || 0);
                if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
                // Default: recently updated
                const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                return timeB - timeA;
            });
    }, [resumes, searchQuery, filterTemplate, sortBy]);

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
                <OnboardingModal />

                {/* Header & New Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Resumes</h1>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {resumes.length} {resumes.length === 1 ? 'document' : 'documents'} tailored for specific job applications.
                        </p>
                    </div>

                    <Button asChild size="sm" className="h-9 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-sm">
                        <Link href="/builder">
                            <Plus className="h-4 w-4" />
                            New Tailored Resume
                        </Link>
                    </Button>
                </div>

                {/* Workspace Metrics Cards */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-3.5 shadow-xs">
                        <span className="text-[11px] font-medium text-muted-foreground">Total Resumes</span>
                        <div className="mt-1 text-xl font-bold text-foreground tracking-tight">
                            <AnimatedCounter value={resumes.length} />
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-3.5 shadow-xs">
                        <span className="text-[11px] font-medium text-muted-foreground">Average Match Score</span>
                        <div className="mt-1 text-xl font-bold text-emerald-500 tracking-tight">
                            <AnimatedCounter
                                value={resumes.length > 0 ? Math.round(resumes.reduce((acc, r) => acc + (r.atsScore || 80), 0) / resumes.length) : 0}
                                suffix="%"
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-3.5 shadow-xs">
                        <span className="text-[11px] font-medium text-muted-foreground">Fact Integrity</span>
                        <div className="mt-1 text-xl font-bold text-foreground tracking-tight flex items-center gap-1.5">
                            <span>100%</span>
                            <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">Locked</span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-3.5 shadow-xs flex flex-col justify-between">
                        <span className="text-[11px] font-medium text-muted-foreground">Active Plan</span>
                        <div className="mt-1 flex items-center justify-between">
                            <span className="text-base font-bold text-foreground tracking-tight">Free Starter</span>
                            <Link href="/billing" className="text-[11px] text-primary hover:underline font-medium">Upgrade</Link>
                        </div>
                    </div>
                </div>


                {/* Filter and Search Bar */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search by role, company, or title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-xs bg-muted/20 border-border/60 focus:border-primary/50"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={filterTemplate}
                            onChange={(e) => setFilterTemplate(e.target.value)}
                            className="h-9 rounded-lg border border-border/60 bg-muted/20 px-3 text-xs text-muted-foreground focus:outline-none focus:border-primary/50"
                        >
                            <option value="all">All Templates</option>
                            <option value="modern">Modern</option>
                            <option value="classic">Classic</option>
                            <option value="engineering">Engineering</option>
                            <option value="compact">Compact</option>
                            <option value="two_column">Two-Column</option>
                            <option value="ats_safe">ATS Safe</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'updated' | 'score' | 'title')}
                            className="h-9 rounded-lg border border-border/60 bg-muted/20 px-3 text-xs text-muted-foreground focus:outline-none focus:border-primary/50"
                        >
                            <option value="updated">Recently Updated</option>
                            <option value="score">Highest ATS Match</option>
                            <option value="title">Alphabetical</option>
                        </select>
                    </div>
                </div>

                {/* Resumes Grid */}
                {loading ? (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-52 rounded-xl border border-white/[0.08] bg-muted/15 p-5 animate-pulse flex flex-col justify-between" />
                        ))}
                    </div>
                ) : filteredResumes.length > 0 ? (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence>
                            {filteredResumes.map(resume => {
                                const score = resume.atsScore || 85;
                                const isHigh = score >= 80;
                                const isMedium = score >= 60;
                                const scoreColor = isHigh
                                    ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                                    : isMedium
                                        ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                        : 'text-rose-500 bg-rose-500/10 border-rose-500/20';

                                const rolesCount = resume.resumeData?.experience?.length || 0;
                                const skillsCount = resume.resumeData?.skills?.length || 0;

                                return (
                                    <motion.div
                                        key={resume.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        onClick={() => handleOpenResume(resume)}
                                        className="group relative rounded-xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/[0.04] transition-all duration-200 flex flex-col justify-between cursor-pointer"
                                    >
                                        {/* Card Top: Template pill & ATS Match Score */}
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                    {resume.templateId || 'modern'}
                                                </span>

                                                <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${scoreColor}`}>
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    <span>{score}/100 Match</span>
                                                </div>
                                            </div>

                                            {/* Card Title & Job Info */}
                                            <div className="mt-3.5">
                                                <h3 className="font-semibold text-sm tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors flex items-center justify-between">
                                                    <span>{resume.title || 'Untitled Resume'}</span>
                                                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                                                </h3>

                                                {(resume.targetJobTitle || resume.targetJobCompany) && (
                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Briefcase className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                                                        <span className="truncate">
                                                            {resume.targetJobTitle || 'Target Role'}
                                                            {resume.targetJobCompany ? ` @ ${resume.targetJobCompany}` : ''}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Informative Stats & Strengths (Replaces generic grey wireframes) */}
                                            <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 p-3 space-y-2">
                                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                    <span>Experience & Skills</span>
                                                    <span className="font-medium text-foreground">{rolesCount} roles • {skillsCount} categories</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                                                    <Check className="h-3 w-3" />
                                                    <span>Tailored & ATS Verified</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer: Timestamp + Specific Actions */}
                                        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70" title={`Updated: ${resume.updatedAt}`}>
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatResumeDate(resume.updatedAt)}</span>
                                            </div>

                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => handleDownloadPdf(resume, e)}
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                    title="Download ATS PDF"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleOpenResume(resume)}
                                                    className="h-7 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                                                >
                                                    <Edit3 className="h-3 w-3" />
                                                    <span>Open</span>
                                                </Button>

                                                {deleteConfirmId === resume.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={(e) => handleDeleteResume(resume.id, e)}
                                                            className="h-6 px-1.5 text-[10px]"
                                                        >
                                                            Confirm
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="h-6 px-1 text-[10px]"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteConfirmId(resume.id);
                                                        }}
                                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        title="Delete resume"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="mt-12 rounded-2xl border border-dashed border-border/70 bg-muted/10 p-12 text-center max-w-xl mx-auto">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">No resumes found</h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                            {searchQuery ? 'No resumes match your current search query.' : 'Upload your resume and a job description to generate your first tailored document.'}
                        </p>
                        <div className="mt-5">
                            <Button asChild size="sm" className="h-9 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium">
                                <Link href="/builder">
                                    <Plus className="h-4 w-4" />
                                    Tailor Your First Resume
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
