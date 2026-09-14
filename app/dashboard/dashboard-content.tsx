"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { EditorialFooter } from '@/components/landing/editorial-footer';
import { useAuth } from '@/components/auth-provider';
import { useAppStore } from '@/lib/store';
import { getLocalResumes, saveLocalResume, deleteLocalResume, formatResumeDate, SavedResume } from '@/lib/user-resumes-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { getLocalApplications } from '@/lib/applications-store';
import {
    Plus,
    Search,
    FileText,
    Trash2,
    PenLine,
    Sparkles,
    Clock,
    Briefcase,
    CheckCircle2,
    ArrowUpRight,
    Check,
    Lock,
    Target,
    Copy,
    Edit3,
    FileUp,
    MoreVertical,
    Palette,
    FileCode2,
} from 'lucide-react';
import { MagneticDock, type DockItem } from '@/components/ui/magnetic-dock';
import { TemplateType, ResumeData, ResumeDataSchema } from '@/lib/resume-schema';
import { ALL_TEMPLATES } from '@/lib/templates-data';
import { DEMO_RESUME_DATA } from '@/lib/demo-data';
import { notify } from '@/lib/notify';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/animated-counter';
import { OnboardingModal } from '@/components/onboarding-modal';
import { ResumeUploadModal } from '@/components/resume-upload-modal';
import { exportResume, ExportFormatType } from '@/lib/resume-export';

// Hoisted: MagneticDock re-measures whenever its `items` array identity
// changes, so this needs to stay a stable reference rather than be rebuilt
// on every render. `id` is the real route, onSelect just router.push(id).
const DASHBOARD_DOCK_ITEMS: DockItem[] = [
    { id: '/builder', label: 'Optimize Resume', icon: <Sparkles />, tint: '#4f46e5' },
    { id: '/editor', label: 'Resume Editor', icon: <FileCode2 />, tint: '#0d9488' },
    { id: '/applications', label: 'Applications', icon: <Briefcase />, tint: '#b45309' },
    { id: '/ats', label: 'ATS Checker', icon: <Target />, tint: '#2563eb' },
    { id: '/templates', label: 'Templates', icon: <Palette />, tint: '#be185d' },
];

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [resumes, setResumes] = useState<SavedResume[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTemplate, setFilterTemplate] = useState('all');
    const [sortBy, setSortBy] = useState<'updated' | 'score' | 'title'>('updated');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [renameTarget, setRenameTarget] = useState<SavedResume | null>(null);
    const [renameTitle, setRenameTitle] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<SavedResume | null>(null);

    // Create form state
    const [newTitle, setNewTitle] = useState('Software Engineer Resume');
    const [newTemplate, setNewTemplate] = useState<TemplateType>('modern');
    const [newTargetRole, setNewTargetRole] = useState('');
    const [newStarterType, setNewStarterType] = useState<'demo' | 'blank'>('demo');
    const [isCreating, setIsCreating] = useState(false);

    // Fetch resumes from API or local storage fallback
    useEffect(() => {
        let isMounted = true;
        async function fetchResumes() {
            if (!user) {
                if (isMounted) {
                    setResumes([]);
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            try {
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
                                title: String(r.title || 'Professional Resume'),
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
                                atsScore: typeof r.ats_score === 'number' && r.ats_score > 0 ? r.ats_score : undefined,
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
                // Fallback to local storage STRICTLY for this authenticated user
                if (isMounted) {
                    const locals = getLocalResumes(user.id);
                    setResumes(locals);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) {
                    setResumes(getLocalResumes(user.id));
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

    // Handle Imported File
    const handleImportedResume = (data: ResumeData) => {
        if (!user) return;
        const newId = crypto.randomUUID();
        const title = data.personalInfo?.title ? `${data.personalInfo.title} (Imported)` : 'Imported Resume';
        const newResume: SavedResume = {
            id: newId,
            userId: user.id,
            title,
            templateId: 'modern',
            resumeData: data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        saveLocalResume(newResume, user.id);
        fetch('/api/v1/resumes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newResume),
        }).catch(() => {});
        setResumes(prev => [newResume, ...prev]);
        setIsImportModalOpen(false);
        notify.success('Resume imported successfully', title);
        router.push(`/editor?id=${newId}`);
    };

    // Create New Resume Handler
    const handleCreateResume = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsCreating(true);

        const newId = crypto.randomUUID();
        const initialData: ResumeData = newStarterType === 'demo'
            ? { ...DEMO_RESUME_DATA }
            : ResumeDataSchema.parse({
                personalInfo: {
                    name: user.user_metadata?.full_name || 'Your Name',
                    title: newTargetRole || 'Software Professional',
                    email: user.email || '',
                    phone: '',
                    location: '',
                },
                summary: 'Experienced professional dedicated to building scalable solutions.',
            });

        const newResume: SavedResume = {
            id: newId,
            userId: user.id,
            title: newTitle.trim() || 'Untitled Resume',
            targetJobTitle: newTargetRole.trim() || undefined,
            templateId: newTemplate,
            resumeData: initialData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            // Save locally
            saveLocalResume(newResume, user.id);

            // Sync with backend API
            fetch('/api/v1/resumes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newResume),
            }).catch(() => {});

            // Update app store
            const store = useAppStore.getState();
            store.setResumeData(initialData);
            store.setTemplate(newTemplate);

            notify.success('Resume created', newResume.title);
            setIsCreateModalOpen(false);
            router.push(`/editor?id=${newId}`);
        } catch {
            notify.error("Couldn't create resume", "Storage initialization failed");
        } finally {
            setIsCreating(false);
        }
    };

    // Duplicate Resume Handler
    const handleDuplicateResume = (resume: SavedResume, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!user) return;

        const newId = crypto.randomUUID();
        const copyTitle = `${resume.title} (Copy)`;
        const duplicated: SavedResume = {
            ...resume,
            id: newId,
            title: copyTitle,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        saveLocalResume(duplicated, user.id);
        fetch('/api/v1/resumes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(duplicated),
        }).catch(() => {});

        setResumes(prev => [duplicated, ...prev]);
        notify.success('Resume duplicated', copyTitle);
    };

    // Rename Resume Handler
    const handleSaveRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (!renameTarget || !user) return;
        const updatedTitle = renameTitle.trim() || renameTarget.title;

        const updatedResume: SavedResume = {
            ...renameTarget,
            title: updatedTitle,
            updatedAt: new Date().toISOString(),
        };

        saveLocalResume(updatedResume, user.id);
        fetch('/api/v1/resumes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedResume),
        }).catch(() => {});

        setResumes(prev => prev.map(r => r.id === renameTarget.id ? updatedResume : r));
        notify.saved('Resume renamed');
        setRenameTarget(null);
    };

    // Delete Resume Handler
    const handleConfirmDelete = async () => {
        if (!deleteTarget || !user) return;
        const id = deleteTarget.id;
        try {
            deleteLocalResume(id, user.id);
            await fetch(`/api/v1/resumes/${id}`, { method: 'DELETE' }).catch(() => {});
            setResumes(prev => prev.filter(r => r.id !== id));
            notify.deleted('Resume deleted');
            setDeleteTarget(null);
        } catch {
            notify.error("Couldn't delete resume", 'Storage error');
        }
    };

    // Handle Open in Standalone Editor
    const handleOpenInEditor = (resume: SavedResume) => {
        const store = useAppStore.getState();
        store.setResumeData(resume.resumeData);
        store.setTemplate((resume.templateId as TemplateType) || 'modern');
        store.setTheme(resume.themeId || 'none');
        notify.info('Opening Editor', resume.title || 'Resume');
        router.push(`/editor?id=${resume.id}`);
    };

    // Handle Open in AI Builder
    const handleOpenResume = (resume: SavedResume) => {
        const store = useAppStore.getState();
        store.setResumeData(resume.resumeData);
        if (resume.jd) store.setJD(resume.jd);
        if (resume.jdAnalysis) store.setAnalysis(resume.jdAnalysis);
        if (resume.originalScore) store.setOriginalScore(resume.originalScore);
        if (resume.tailoredScore) store.setTailoredScore(resume.tailoredScore);
        store.setTemplate((resume.templateId as TemplateType) || 'modern');
        store.setTheme(resume.themeId || 'none');

        if (resume.generatedResume) {
            store.setGeneratedResume(
                resume.generatedResume.data,
                resume.generatedResume.typst || resume.typstCode || '',
                resume.generatedResume.confidenceScore || (resume.atsScore ? resume.atsScore / 100 : 0.85)
            );
        } else if (resume.typstCode) {
            store.setGeneratedResume(
                resume.resumeData,
                resume.typstCode,
                resume.atsScore ? resume.atsScore / 100 : 0.85
            );
        }

        store.setStep(resume.lastStep || (resume.typstCode ? 4 : 2));
        notify.info('AI Optimizer', resume.title || 'Resume');
        router.push('/builder');
    };

    // Multi-format resume export handler
    const [downloadMenuResumeId, setDownloadMenuResumeId] = useState<string | null>(null);

    const handleExportResume = async (resume: SavedResume, fmt: ExportFormatType, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setDownloadMenuResumeId(null);
        await exportResume({
            resumeData: resume.resumeData,
            format: fmt,
            template: resume.templateId || 'modern',
            theme: { color: resume.themeId || 'none' },
            typstCode: resume.typstCode,
            customFilename: (resume.title || 'Resume').toLowerCase().replace(/\s+/g, '-'),
        });
    };

    const handleDownloadPdf = (resume: SavedResume, e: React.MouseEvent) => handleExportResume(resume, 'pdf', e);

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
                const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                return timeB - timeA;
            });
    }, [resumes, searchQuery, filterTemplate, sortBy]);

    // Honest ATS Score Metric: Only compute if scored resumes exist
    const { avgScore, scoredCount } = useMemo(() => {
        const scored = resumes.filter(r => typeof r.atsScore === 'number' && r.atsScore > 0);
        if (scored.length === 0) return { avgScore: null, scoredCount: 0 };
        const sum = scored.reduce((acc, r) => acc + (r.atsScore || 0), 0);
        return { avgScore: Math.round(sum / scored.length), scoredCount: scored.length };
    }, [resumes]);

    // Active applications count
    const applicationsCount = useMemo(() => {
        if (!user) return 0;
        return getLocalApplications(user.id).length;
    }, [user]);

    // Loading session gate
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

    // Unauthenticated lock gate
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
                            Resume history and studio documents are private to each user account. Sign in to view, manage, and download your resumes.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button asChild size="default" className="w-full sm:w-auto h-10 px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium">
                                <Link href="/login?redirect=/dashboard">
                                    Sign In to Continue
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="default" className="w-full sm:w-auto h-10 px-6 border-border/80 text-sm font-medium hover:bg-muted/30">
                                <Link href="/signup?redirect=/dashboard">Create Free Account</Link>
                            </Button>
                        </div>
                    </div>
                </main>
                <EditorialFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground flex flex-col antialiased">
            <AppHeader />

            <main id="main-content" className="flex-1 mx-auto max-w-6xl px-4 sm:px-6 py-8 w-full">
                <OnboardingModal />

                {/* Header & Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Resumes</h1>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {resumes.length} {resumes.length === 1 ? 'document' : 'documents'} created and managed in your workspace.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-9 gap-1.5 text-xs font-medium border-border/80 hover:bg-muted/40 rounded-xl"
                        >
                            <Link href="/applications">
                                <Briefcase className="h-3.5 w-3.5 text-primary" />
                                Job Tracker
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsImportModalOpen(true)}
                            className="h-9 gap-1.5 text-xs font-medium border-border/80 hover:bg-muted/40 rounded-xl"
                        >
                            <FileUp className="h-3.5 w-3.5 text-muted-foreground" />
                            Import File
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => {
                                setNewTitle(`Resume - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`);
                                setIsCreateModalOpen(true);
                            }}
                            className="h-9 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs"
                        >
                            <Plus className="h-4 w-4" />
                            New Resume
                        </Button>
                    </div>
                </div>

                {/* Workspace Metrics Cards */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs hover:border-border transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-muted-foreground">Total Resumes</span>
                            <FileText className="h-3.5 w-3.5 text-muted-foreground/70" strokeWidth={1.75} />
                        </div>
                        <div className="mt-1.5 text-xl font-bold font-display text-foreground tracking-tight">
                            <AnimatedCounter value={resumes.length} />
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground truncate">
                            {resumes.length === 1 ? '1 active draft' : `${resumes.length} active drafts`}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs hover:border-border transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-muted-foreground">Active Applications</span>
                            <Briefcase className="h-3.5 w-3.5 text-amber-500/80" strokeWidth={1.75} />
                        </div>
                        <div className="mt-1.5 text-xl font-bold font-display text-foreground tracking-tight flex items-center justify-between">
                            <AnimatedCounter value={applicationsCount} />
                            <Link href="/applications" className="text-[10px] font-medium text-primary hover:underline inline-flex items-center gap-0.5">
                                <span>Tracker</span>
                                <ArrowUpRight className="h-2.5 w-2.5" />
                            </Link>
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground truncate">
                            Tracked opportunities
                        </p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs hover:border-border transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-muted-foreground">Average ATS Match</span>
                            <Target className="h-3.5 w-3.5 text-emerald-500/80" strokeWidth={1.75} />
                        </div>
                        <div className="mt-1.5 text-xl font-bold font-display text-emerald-500 tracking-tight">
                            {avgScore !== null ? (
                                <AnimatedCounter value={avgScore} suffix="%" />
                            ) : (
                                <Link href="/ats" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                                    <span>Run ATS Audit</span>
                                    <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            )}
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground truncate">
                            {scoredCount > 0 ? `${scoredCount} scored documents` : 'No audits performed yet'}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs hover:border-border transition-colors flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-muted-foreground">Typst Templates</span>
                            <Palette className="h-3.5 w-3.5 text-purple-500/80" strokeWidth={1.75} />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-xl font-bold font-display text-foreground tracking-tight">
                                {ALL_TEMPLATES.length}
                            </span>
                            <Link href="/templates" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                                <span>Gallery</span>
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground truncate">
                            Vector-compiled designs
                        </p>
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
                            className="pl-9 h-9 text-xs bg-muted/20 border-border/60 focus:border-primary/50 rounded-lg"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            aria-label="Filter resumes by template"
                            value={filterTemplate}
                            onChange={(e) => setFilterTemplate(e.target.value)}
                            className="h-9 rounded-lg border border-border/60 bg-muted/20 px-3 text-xs text-muted-foreground focus:outline-none focus:border-primary/50"
                        >
                            <option value="all">All Templates ({ALL_TEMPLATES.length})</option>
                            <option value="modern">Modern</option>
                            <option value="classic">Classic</option>
                            <option value="engineering">Engineering</option>
                            <option value="compact">Compact</option>
                            <option value="two_column">Two-Column</option>
                            <option value="ats_safe">ATS Safe</option>
                            <option value="minimalist">Minimalist</option>
                        </select>

                        <select
                            aria-label="Sort resumes by"
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
                            <div key={i} className="h-56 rounded-xl border border-border/60 bg-muted/15 p-5 animate-pulse flex flex-col justify-between" />
                        ))}
                    </div>
                ) : (
                    <div className="mt-6 space-y-6">
                        {/* If searching or filtering with zero matches */}
                        {filteredResumes.length === 0 && resumes.length > 0 && (
                            <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 max-w-md mx-auto space-y-3">
                                <div className="h-10 w-10 mx-auto rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                                    <Search className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-sm text-foreground">No matching resumes found</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    No resumes match &quot;{searchQuery}&quot;. Try adjusting your search query or template filter.
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterTemplate('all');
                                    }}
                                    className="h-8 text-xs rounded-xl"
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* 1. First-Class "Create New Resume" Card */}
                            <motion.button
                                onClick={() => {
                                    setNewTitle(`Resume - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`);
                                    setIsCreateModalOpen(true);
                                }}
                                className="group rounded-2xl border border-dashed border-border/80 hover:border-primary/60 bg-card/40 hover:bg-muted/30 p-6 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer min-h-[240px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Plus className="h-6 w-6" strokeWidth={2.25} />
                                </div>
                                <h3 className="mt-4 font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                    Create New Resume
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground max-w-[210px] leading-relaxed">
                                    Start blank or initialize from verified demo data with instant Typst compilation.
                                </p>
                            </motion.button>

                            {/* 2. Resume Cards */}
                            <AnimatePresence>
                                {filteredResumes.map(resume => {
                                    const hasScore = typeof resume.atsScore === 'number' && resume.atsScore > 0;
                                    const score = resume.atsScore || 0;
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
                                            initial={{ opacity: 0, scale: 0.97 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.97 }}
                                            className="group relative rounded-2xl border border-border/70 bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                                        >
                                            {/* Top Meta: Template pill & Non-Zero ATS Match */}
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                                                        {resume.templateId || 'modern'}
                                                    </span>

                                                    {hasScore ? (
                                                        <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${scoreColor}`}>
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            <span>{score}% Match</span>
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            href={`/ats?id=${resume.id}`}
                                                            className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer"
                                                        >
                                                            <span>Check ATS</span>
                                                            <ArrowUpRight className="h-3 w-3" />
                                                        </Link>
                                                    )}
                                                </div>

                                                {/* Resume Title & Target Info */}
                                                <div className="mt-3.5">
                                                    <h3
                                                        onClick={() => handleOpenInEditor(resume)}
                                                        className="font-semibold text-sm tracking-tight text-foreground line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                                                        title="Click to open in editor"
                                                    >
                                                        {resume.title || 'Professional Resume'}
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

                                                {/* Summary Info Pill */}
                                                <div className="mt-4 rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1.5">
                                                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                        <span>Sections</span>
                                                        <span className="font-medium text-foreground">{rolesCount} roles • {skillsCount} skills</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px]">
                                                        <span className="text-emerald-500 font-medium flex items-center gap-1">
                                                            <Check className="h-3 w-3" />
                                                            Typst Vector PDF
                                                        </span>
                                                        <span className="text-muted-foreground">Deterministic</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Footer: Timestamp + Explicit Actions */}
                                            <div className="mt-5 pt-3.5 border-t border-border/40 flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70" title={`Updated: ${resume.updatedAt}`}>
                                                    <Clock className="h-3 w-3 text-muted-foreground/60" strokeWidth={1.75} />
                                                    <span>{formatResumeDate(resume.updatedAt)}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    {/* Primary CTA: Open Editor */}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenInEditor(resume)}
                                                        className="h-8 px-3 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-xl shadow-2xs cursor-pointer"
                                                    >
                                                        <PenLine className="h-3 w-3" />
                                                        <span>Open</span>
                                                    </Button>

                                                    {/* Secondary Actions: Radix Dropdown Menu */}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 w-8 p-0 rounded-xl border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
                                                                aria-label="More actions for this resume"
                                                            >
                                                                <MoreVertical className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl text-foreground">
                                                            <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                                Download Formats
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleExportResume(resume, 'pdf')} className="cursor-pointer">
                                                                <span className="h-2 w-2 rounded-full bg-red-500 mr-2 shrink-0" />
                                                                <span className="flex-1 text-xs">Vector PDF</span>
                                                                <span className="text-[10px] font-mono text-muted-foreground">.pdf</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleExportResume(resume, 'docx')} className="cursor-pointer">
                                                                <span className="h-2 w-2 rounded-full bg-amber-500 mr-2 shrink-0" />
                                                                <span className="flex-1 text-xs">Word Document</span>
                                                                <span className="text-[10px] font-mono text-muted-foreground">.docx</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleExportResume(resume, 'md')} className="cursor-pointer">
                                                                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 shrink-0" />
                                                                <span className="flex-1 text-xs">Markdown</span>
                                                                <span className="text-[10px] font-mono text-muted-foreground">.md</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleExportResume(resume, 'json')} className="cursor-pointer">
                                                                <span className="h-2 w-2 rounded-full bg-blue-500 mr-2 shrink-0" />
                                                                <span className="flex-1 text-xs">JSON Resume</span>
                                                                <span className="text-[10px] font-mono text-muted-foreground">.json</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleExportResume(resume, 'typ')} className="cursor-pointer">
                                                                <span className="h-2 w-2 rounded-full bg-purple-500 mr-2 shrink-0" />
                                                                <span className="flex-1 text-xs">Typst Source</span>
                                                                <span className="text-[10px] font-mono text-muted-foreground">.typ</span>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator className="my-1 border-border/40" />

                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/ats?id=${resume.id}`} className="cursor-pointer">
                                                                    <Target className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                                                    <span className="text-xs">Audit ATS Score</span>
                                                                </Link>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem onClick={() => handleOpenResume(resume)} className="cursor-pointer">
                                                                <Sparkles className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                                                <span className="text-xs">Tailor with AI</span>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem onClick={() => handleDuplicateResume(resume)} className="cursor-pointer">
                                                                <Copy className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                                                <span className="text-xs">Duplicate</span>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setRenameTarget(resume);
                                                                    setRenameTitle(resume.title);
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <Edit3 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                                                <span className="text-xs">Rename</span>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator className="my-1 border-border/40" />

                                                            <DropdownMenuItem
                                                                onClick={() => setDeleteTarget(resume)}
                                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                                <span className="text-xs">Delete Resume</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </main>

            {/* Create Resume Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-md border-border/80 bg-background/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-foreground">Create New Resume</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Create a standalone document with your chosen template. You can edit every field manually with live Typst preview.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateResume} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="resume-title" className="text-xs font-medium">Resume Title</Label>
                            <Input
                                id="resume-title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="e.g. Staff Software Engineer"
                                required
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="target-role" className="text-xs font-medium">Target Role (Optional)</Label>
                            <Input
                                id="target-role"
                                value={newTargetRole}
                                onChange={(e) => setNewTargetRole(e.target.value)}
                                placeholder="e.g. Distributed Systems Engineer"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="template-select" className="text-xs font-medium">Starter Template</Label>
                            <select
                                id="template-select"
                                value={newTemplate}
                                onChange={(e) => setNewTemplate(e.target.value as TemplateType)}
                                className="w-full h-9 rounded-md border border-border/80 bg-muted/20 px-3 text-xs text-foreground focus:outline-none focus:border-primary/50"
                            >
                                {ALL_TEMPLATES.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} ({t.tags.slice(0, 2).join(', ')})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Initial Content</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setNewStarterType('demo')}
                                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                                        newStarterType === 'demo'
                                            ? 'border-primary bg-primary/10 text-primary font-medium'
                                            : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                                    }`}
                                >
                                    <div className="font-semibold text-foreground">Demo Content</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">Pre-filled with senior engineer experience</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setNewStarterType('blank')}
                                    className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                                        newStarterType === 'blank'
                                            ? 'border-primary bg-primary/10 text-primary font-medium'
                                            : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                                    }`}
                                >
                                    <div className="font-semibold text-foreground">Blank Slate</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">Start fresh with your contact details</div>
                                </button>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="h-8 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isCreating}
                                className="h-8 text-xs font-semibold bg-primary text-primary-foreground"
                            >
                                {isCreating ? 'Creating...' : 'Create & Open'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Rename Resume Modal */}
            <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
                <DialogContent className="sm:max-w-sm border-border/80 bg-background/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-foreground">Rename Resume</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSaveRename} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="rename-input" className="text-xs font-medium">Resume Title</Label>
                            <Input
                                id="rename-input"
                                value={renameTitle}
                                onChange={(e) => setRenameTitle(e.target.value)}
                                required
                                autoFocus
                                className="h-9 text-xs"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setRenameTarget(null)}
                                className="h-8 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="h-8 text-xs font-semibold bg-primary text-primary-foreground"
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-sm border-border/80 bg-background/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-destructive">Delete Resume?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTarget?.title}"</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="pt-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTarget(null)}
                            className="h-8 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleConfirmDelete}
                            className="h-8 text-xs font-semibold"
                        >
                            Delete Resume
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Resume Modal */}
            <ResumeUploadModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onParsed={handleImportedResume}
            />

            {/* Quick-launch dock for the app's main sections */}
            <div className="sticky bottom-0 z-30 pointer-events-none">
                <div className="pointer-events-auto">
                    <MagneticDock
                        items={DASHBOARD_DOCK_ITEMS}
                        onSelect={(id) => router.push(id)}
                        magnetRadius={110}
                        maxScale={1.4}
                        lift={18}
                    />
                </div>
            </div>

            <EditorialFooter />
        </div>
    );
}
