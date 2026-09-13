"use client";

import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Plus, Save, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { notify } from '@/lib/notify';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { ResumeData, ResumeDataSchema } from '@/lib/resume-schema';
import { DraggableItemList } from '@/components/draggable-item-list';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

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

const emptyResumeData: ResumeData = {
    personalInfo: {
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        portfolio: '',
        title: '',
        tagline: '',
        location: '',
    },
    summary: '',
    techStackSummary: '',
    sectionOrder: ['summary', 'techStackSummary', 'skills', 'keyMetrics', 'experience', 'internships', 'education', 'projects', 'certifications', 'achievements', 'openSource', 'publications', 'leadership', 'volunteering', 'conferences', 'languages', 'interests', 'products', 'devopsContributions', 'securityContributions', 'additionalInfo', 'customSections'],
    skills: [{ category: '', items: '' }],
    keyMetrics: [],
    experience: [{ title: '', company: '', location: '', dates: '', bullets: [''] }],
    internships: [],
    education: [{ institution: '', degree: '', fieldOfStudy: '', location: '', dates: '', gpa: '', coursework: '', honors: '' }],
    projects: [],
    certifications: [],
    achievements: [],
    publications: [],
    openSource: [],
    leadership: [],
    volunteering: [],
    conferences: [],
    languages: [],
    interests: [],
    products: [],
    devopsContributions: [],
    securityContributions: [],
    additionalInfo: {
        availability: '',
        workAuthorization: '',
        relocation: '',
        travel: '',
        notes: '',
    },
    customSections: [],
};

// ────────────────────────────────────────────────────────────────────────────
// CollapsibleCard
// ────────────────────────────────────────────────────────────────────────────
function CollapsibleCard({
    title,
    defaultOpen = false,
    children,
    actionButton,
}: {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
    actionButton?: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Card className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden transition-all duration-200 hover:border-border">
            <CardHeader
                className="flex cursor-pointer select-none flex-row items-center justify-between p-5 py-4 hover:bg-muted/30 transition-colors"
                onClick={(event) => {
                    if ((event.target as HTMLElement).closest('.action-btn-no-toggle')) return;
                    setOpen((prev) => !prev);
                }}
            >
                <CardTitle className="flex items-center gap-2.5 text-sm sm:text-base font-display font-semibold tracking-tight text-foreground">
                    <div className="h-6 w-6 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center text-muted-foreground transition-transform duration-200">
                        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                    <span>{title}</span>
                </CardTitle>
                {actionButton ? <div className="action-btn-no-toggle">{actionButton}</div> : null}
            </CardHeader>
            {open ? <CardContent className="p-5 pt-0 space-y-6">{children}</CardContent> : null}
        </Card>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// DynamicSectionList — with drag-and-drop reordering
// ────────────────────────────────────────────────────────────────────────────
function DynamicSectionList({
    title,
    form,
    name,
    defaultOpen,
    emptyItem,
    renderItem,
}: {
    title: string;
    form: UseFormReturn<ResumeData>;
    name: ArraySectionName;
    defaultOpen?: boolean;
    emptyItem: ResumeData[ArraySectionName][number];
    renderItem: (index: number) => React.ReactNode;
}) {
    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: name as never,
    });

    return (
        <CollapsibleCard
            title={title}
            defaultOpen={defaultOpen}
            actionButton={
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        append(emptyItem);
                        notify.added(title);
                    }}
                    className="h-7 px-2.5 text-xs rounded-lg border-border hover:border-primary/40 gap-1.5 cursor-pointer active:scale-95"
                >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    <span>Add</span>
                </Button>
            }
        >
            <div className="space-y-3 pt-2">
                {fields.length > 0 ? (
                    <DraggableItemList
                        fields={fields}
                        onReorder={(from, to) => {
                            move(from, to);
                            notify.sectionMoved(title);
                        }}
                        onRemove={(index) => {
                            remove(index);
                            notify.deleted(title);
                        }}
                        renderItem={renderItem}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground bg-muted/10">
                        <p>No entries added yet.</p>
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() => {
                                append(emptyItem);
                                notify.added(title);
                            }}
                            className="text-primary font-medium text-xs mt-1 cursor-pointer"
                        >
                            + Add an entry
                        </Button>
                    </div>
                )}
            </div>
        </CollapsibleCard>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// NestedBulletList — bullet array editor (for experience, project bullets, etc.)
// ────────────────────────────────────────────────────────────────────────────
function NestedBulletList({
    form,
    path,
    buttonLabel = 'Add Bullet',
    placeholder,
}: {
    form: UseFormReturn<ResumeData>;
    path: string;
    buttonLabel?: string;
    placeholder?: string;
}) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: path as never,
    });

    return (
        <div className="space-y-2">
            {fields.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-center group">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0 mt-3" />
                    <Input
                        {...form.register(`${path}.${index}` as never)}
                        placeholder={placeholder}
                        className="flex-1 text-sm"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            remove(index);
                            notify.deleted('Bullet point');
                        }}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500 hover:bg-rose-500/10"
                        title="Remove bullet"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                    append('' as never);
                    notify.added('Bullet point');
                }}
                className="mt-1 h-7 px-2.5 text-xs gap-1.5 border-dashed hover:border-primary/40"
            >
                <Plus className="h-3 w-3 text-primary" /> {buttonLabel}
            </Button>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// ExperienceFields
// ────────────────────────────────────────────────────────────────────────────
function ExperienceFields({
    form,
    basePath,
    organizationLabel,
}: {
    form: UseFormReturn<ResumeData>;
    basePath: `experience.${number}` | `internships.${number}`;
    organizationLabel: string;
}) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Title</Label>
                    <Input {...form.register(`${basePath}.title`)} placeholder="DevOps Engineer" />
                </div>
                <div className="space-y-2">
                    <Label>{organizationLabel}</Label>
                    <Input {...form.register(`${basePath}.company`)} placeholder="Company or Organization" />
                </div>
                <div className="space-y-2">
                    <Label>Dates</Label>
                    <Input {...form.register(`${basePath}.dates`)} placeholder="Jan 2023 - Present" />
                </div>
                <div className="space-y-2">
                    <Label>Location</Label>
                    <Input {...form.register(`${basePath}.location`)} placeholder="Bengaluru, India / Remote" />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Impact Bullets</Label>
                <NestedBulletList
                    form={form}
                    path={`${basePath}.bullets`}
                    placeholder="Improved deployment speed by 40% using GitHub Actions and Docker"
                />
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// ProjectFields — full field coverage with separate impactBullets + bullets
// ────────────────────────────────────────────────────────────────────────────
function ProjectFields({
    form,
    index,
}: {
    form: UseFormReturn<ResumeData>;
    index: number;
}) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input {...form.register(`projects.${index}.name`)} placeholder="My Awesome Project" />
                </div>
                <div className="space-y-2">
                    <Label>Your Role</Label>
                    <Input {...form.register(`projects.${index}.role`)} placeholder="Lead Developer" />
                </div>
                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input {...form.register(`projects.${index}.startDate` as never)} placeholder="Jan 2024" />
                </div>
                <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input {...form.register(`projects.${index}.endDate` as never)} placeholder="Present" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Project Link / URL</Label>
                    <Input
                        {...form.register(`projects.${index}.link`)}
                        placeholder="https://github.com/you/project"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                        {...form.register(`projects.${index}.description`)}
                        className="min-h-[80px]"
                        placeholder="Brief overview of what the project does and why it matters."
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Tech Stack</Label>
                    <Input
                        {...form.register(`projects.${index}.techStack`)}
                        placeholder="Next.js, Node.js, PostgreSQL, Docker"
                    />
                </div>
            </div>

            {/* Impact Summary (single-line, backward-compatible) */}
            <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                    Impact Summary
                    <span className="text-[10px] text-muted-foreground font-normal">(single line)</span>
                </Label>
                <Input
                    {...form.register(`projects.${index}.impact`)}
                    placeholder="Used by 5k+ students across 3 campuses"
                />
            </div>

            {/* Impact / Result Bullets — new multi-bullet field */}
            <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3">
                <Label className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    Impact / Result Bullets
                    <span className="text-[10px] text-muted-foreground font-normal">(quantified outcomes)</span>
                </Label>
                <NestedBulletList
                    form={form}
                    path={`projects.${index}.impactBullets`}
                    buttonLabel="Add Impact Bullet"
                    placeholder="Reduced page load time by 60% → 400ms P95 via lazy loading & CDN"
                />
            </div>

            {/* Highlight / Feature Bullets */}
            <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
                <Label className="flex items-center gap-1.5">
                    Highlights / Feature Bullets
                    <span className="text-[10px] text-muted-foreground font-normal">(key features, not outcomes)</span>
                </Label>
                <NestedBulletList
                    form={form}
                    path={`projects.${index}.bullets`}
                    buttonLabel="Add Highlight"
                    placeholder="Built ATS-friendly Typst output with multi-template support"
                />
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// ResumeForm — main export
// ────────────────────────────────────────────────────────────────────────────
export function ResumeForm() {
    const resumeData = useAppStore((state) => state.resumeData);
    const setResumeData = useAppStore((state) => state.setResumeData);
    const [autosaveState, setAutosaveState] = useState<'idle' | 'saving' | 'saved' | 'invalid'>('idle');
    const autosaveTimer = useRef<number | null>(null);

    const form = useForm<ResumeData>({
        resolver: zodResolver(ResumeDataSchema),
        defaultValues: resumeData || emptyResumeData,
        mode: 'onBlur',
    });

    const syncedRef = useRef<string | null>(null);
    useEffect(() => {
        if (!resumeData) return;
        const key = `${resumeData.personalInfo.name}|${resumeData.experience.length}|${resumeData.education.length}`;
        if (syncedRef.current === key) return;
        syncedRef.current = key;
        setTimeout(() => form.reset(resumeData), 0);
    }, [resumeData, form]);

    useEffect(() => {
        const subscription = form.watch((values) => {
            if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
            setAutosaveState('saving');
            autosaveTimer.current = window.setTimeout(() => {
                const parsed = ResumeDataSchema.safeParse(values);
                if (parsed.success) {
                    setResumeData(parsed.data);
                    setAutosaveState('saved');
                } else {
                    setAutosaveState('invalid');
                }
            }, 500);
        });
        return () => {
            subscription.unsubscribe();
            if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
        };
    }, [form, setResumeData]);

    const onSubmit = (data: ResumeData) => {
        setResumeData(data);
        setAutosaveState('saved');
        notify.saved('All sections synchronized');
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Status bar */}
            <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold">Core Sections</h3>
                        <p className="text-xs text-muted-foreground">
                            Drag entries to reorder · changes autosave and recompile the PDF instantly.
                        </p>
                    </div>
                    <div className="text-xs">
                        {autosaveState === 'saving' && (
                            <StatusBadge state="saving" savingLabel="Autosaving…" />
                        )}
                        {autosaveState === 'saved' && (
                            <StatusBadge state="saved" savedLabel="All changes saved" />
                        )}
                        {autosaveState === 'invalid' && (
                            <StatusBadge state="failed" failedLabel="Fix validation issues to save" />
                        )}
                        {autosaveState === 'idle' && (
                            <StatusBadge state="idle" idleLabel="Autosave ready" />
                        )}
                    </div>
                </div>
            </div>

            {/* ── Personal Information ── */}
            <CollapsibleCard title="Personal Information" defaultOpen>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input {...form.register('personalInfo.name')} />
                        {form.formState.errors.personalInfo?.name ? (
                            <p className="text-xs text-red-500">{form.formState.errors.personalInfo.name.message}</p>
                        ) : null}
                    </div>
                    <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input {...form.register('personalInfo.title')} placeholder="Senior Backend Engineer" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Tagline</Label>
                        <Input {...form.register('personalInfo.tagline')} placeholder="Platform engineer building reliable cloud systems" />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" {...form.register('personalInfo.email')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input {...form.register('personalInfo.phone')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input {...form.register('personalInfo.location')} placeholder="Mumbai, India" />
                    </div>
                    <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <Input {...form.register('personalInfo.linkedin')} placeholder="https://linkedin.com/in/username" />
                    </div>
                    <div className="space-y-2">
                        <Label>GitHub</Label>
                        <Input {...form.register('personalInfo.github')} placeholder="https://github.com/username" />
                    </div>
                    <div className="space-y-2">
                        <Label>Portfolio / Website</Label>
                        <Input {...form.register('personalInfo.portfolio')} placeholder="https://your-portfolio.com" />
                    </div>
                </div>
            </CollapsibleCard>

            {/* ── Professional Summary ── */}
            <CollapsibleCard title="Professional Summary" defaultOpen>
                <Textarea
                    {...form.register('summary')}
                    className="min-h-[120px]"
                    placeholder="Summarize total experience, domains, top tools, and strongest impact in 2-4 lines."
                />
                {form.formState.errors.summary ? (
                    <p className="text-xs text-red-500">{form.formState.errors.summary.message}</p>
                ) : null}
            </CollapsibleCard>

            {/* ── Tech Stack Summary ── */}
            <CollapsibleCard title="Tech Stack Summary" defaultOpen>
                <Input
                    {...form.register('techStackSummary')}
                    placeholder="AWS | Terraform | Kubernetes | Docker | GitHub Actions | Prometheus"
                />
            </CollapsibleCard>

            {/* ── Skills ── */}
            <DynamicSectionList
                title="Skills"
                form={form}
                name="skills"
                defaultOpen
                emptyItem={{ category: '', items: '' }}
                renderItem={(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input {...form.register(`skills.${index}.category`)} placeholder="Languages / Cloud / Databases" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Items</Label>
                            <Input {...form.register(`skills.${index}.items`)} placeholder="Python, TypeScript, Go" />
                        </div>
                    </div>
                )}
            />

            {/* ── Key Metrics ── */}
            <DynamicSectionList
                title="Key Metrics"
                form={form}
                name="keyMetrics"
                emptyItem={{ label: '', value: '', context: '' }}
                renderItem={(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Label</Label>
                            <Input {...form.register(`keyMetrics.${index}.label`)} placeholder="Infrastructure Cost" />
                        </div>
                        <div className="space-y-2">
                            <Label>Value</Label>
                            <Input {...form.register(`keyMetrics.${index}.value`)} placeholder="Reduced by 35%" />
                        </div>
                        <div className="space-y-2">
                            <Label>Context</Label>
                            <Input {...form.register(`keyMetrics.${index}.context`)} placeholder="After workload rightsizing" />
                        </div>
                    </div>
                )}
            />

            {/* ── Work Experience ── */}
            <DynamicSectionList
                title="Work Experience"
                form={form}
                name="experience"
                defaultOpen
                emptyItem={{ title: '', company: '', location: '', dates: '', bullets: [''] }}
                renderItem={(index) => (
                    <ExperienceFields form={form} basePath={`experience.${index}`} organizationLabel="Company" />
                )}
            />

            {/* ── Internships ── */}
            <DynamicSectionList
                title="Internships"
                form={form}
                name="internships"
                emptyItem={{ title: '', company: '', location: '', dates: '', bullets: [''] }}
                renderItem={(index) => (
                    <ExperienceFields form={form} basePath={`internships.${index}`} organizationLabel="Organization" />
                )}
            />

            {/* ── Education ── */}
            <DynamicSectionList
                title="Education"
                form={form}
                name="education"
                defaultOpen
                emptyItem={{ institution: '', degree: '', fieldOfStudy: '', location: '', dates: '', gpa: '', coursework: '', honors: '' }}
                renderItem={(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Institution</Label>
                            <Input {...form.register(`education.${index}.institution`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Degree</Label>
                            <Input {...form.register(`education.${index}.degree`)} placeholder="Master of Science" />
                        </div>
                        <div className="space-y-2">
                            <Label>Field of Study</Label>
                            <Input {...form.register(`education.${index}.fieldOfStudy`)} placeholder="Computer Science" />
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input {...form.register(`education.${index}.location`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Dates</Label>
                            <Input {...form.register(`education.${index}.dates`)} placeholder="2022 - 2024" />
                        </div>
                        <div className="space-y-2">
                            <Label>GPA / Percentage</Label>
                            <Input {...form.register(`education.${index}.gpa`)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Relevant Coursework</Label>
                            <Input {...form.register(`education.${index}.coursework`)} placeholder="Distributed Systems, Computer Networks" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Honors</Label>
                            <Input {...form.register(`education.${index}.honors`)} placeholder="Dean's List, Merit Scholarship" />
                        </div>
                    </div>
                )}
            />

            {/* ── Projects ── (with full field coverage + impactBullets) */}
            <DynamicSectionList
                title="Projects"
                form={form}
                name="projects"
                emptyItem={{
                    name: '',
                    description: '',
                    techStack: '',
                    role: '',
                    startDate: '',
                    endDate: '',
                    dates: '',
                    impact: '',
                    impactBullets: [],
                    link: '',
                    bullets: [],
                } as never}
                renderItem={(index) => <ProjectFields form={form} index={index} />}
            />

            {/* ────── Advanced Sections ────── */}
            <div className="rounded-lg border bg-muted/20 p-4">
                <h3 className="text-sm font-semibold">Advanced Sections</h3>
                <p className="text-xs text-muted-foreground">Use these when they genuinely strengthen the resume. Core sections should stay strongest.</p>
            </div>

            {/* ── Certifications ── */}
            <DynamicSectionList
                title="Certifications"
                form={form}
                name="certifications"
                emptyItem={{ name: '', issuer: '', date: '', expiryDate: '', credentialId: '', link: '' }}
                renderItem={(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Certification Name</Label>
                            <Input {...form.register(`certifications.${index}.name`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Issuer</Label>
                            <Input {...form.register(`certifications.${index}.issuer`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Issued</Label>
                            <Input {...form.register(`certifications.${index}.date`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input {...form.register(`certifications.${index}.expiryDate`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Credential ID</Label>
                            <Input {...form.register(`certifications.${index}.credentialId`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Credential Link</Label>
                            <Input {...form.register(`certifications.${index}.link`)} />
                        </div>
                    </div>
                )}
            />

            {/* ── Achievements & Awards ── */}
            <DynamicSectionList
                title="Achievements & Awards"
                form={form}
                name="achievements"
                emptyItem={{ name: '', context: '', date: '', rank: '', description: '', link: '' }}
                renderItem={(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input {...form.register(`achievements.${index}.name`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Context</Label>
                            <Input {...form.register(`achievements.${index}.context`)} placeholder="Hackathon / Company / University" />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input {...form.register(`achievements.${index}.date`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Rank / Result</Label>
                            <Input {...form.register(`achievements.${index}.rank`)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Textarea {...form.register(`achievements.${index}.description`)} className="min-h-[90px]" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Link</Label>
                            <Input {...form.register(`achievements.${index}.link`)} />
                        </div>
                    </div>
                )}
            />

            {/* ── Open Source Contributions ── */}
            <DynamicSectionList
                title="Open Source Contributions"
                form={form}
                name="openSource"
                emptyItem={{ project: '', contribution: '', dates: '', impact: '', link: '', bullets: [] }}
                renderItem={(index) => (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Project / Repository</Label>
                                <Input {...form.register(`openSource.${index}.project`)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Contribution Type</Label>
                                <Input {...form.register(`openSource.${index}.contribution`)} placeholder="Maintainer, PR author, feature contributor" />
                            </div>
                            <div className="space-y-2">
                                <Label>Dates</Label>
                                <Input {...form.register(`openSource.${index}.dates`)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Link</Label>
                                <Input {...form.register(`openSource.${index}.link`)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Impact</Label>
                                <Input {...form.register(`openSource.${index}.impact`)} placeholder="Merged 12 PRs improving test reliability and docs" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Details</Label>
                            <NestedBulletList form={form} path={`openSource.${index}.bullets`} />
                        </div>
                    </div>
                )}
            />

            {/* ── Publications & Blogs ── */}
            <DynamicSectionList
                title="Publications & Blogs"
                form={form}
                name="publications"
                emptyItem={{ title: '', platform: '', date: '', authors: '', description: '', link: '' }}
                renderItem={(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input {...form.register(`publications.${index}.title`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Platform / Journal / Blog</Label>
                            <Input {...form.register(`publications.${index}.platform`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input {...form.register(`publications.${index}.date`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Authors</Label>
                            <Input {...form.register(`publications.${index}.authors`)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Textarea {...form.register(`publications.${index}.description`)} className="min-h-[90px]" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Link</Label>
                            <Input {...form.register(`publications.${index}.link`)} />
                        </div>
                    </div>
                )}
            />

            {/* ── Leadership ── */}
            <DynamicSectionList
                title="Leadership"
                form={form}
                name="leadership"
                emptyItem={{ role: '', organization: '', location: '', dates: '', bullets: [] }}
                renderItem={(index) => (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Input {...form.register(`leadership.${index}.role`)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Organization</Label>
                                <Input {...form.register(`leadership.${index}.organization`)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input {...form.register(`leadership.${index}.location`)} />
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <Label>Dates</Label>
                                <Input {...form.register(`leadership.${index}.dates`)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Details</Label>
                            <NestedBulletList form={form} path={`leadership.${index}.bullets`} />
                        </div>
                    </div>
                )}
            />

            {/* ── Volunteering ── */}
            <DynamicSectionList
                title="Volunteering"
                form={form}
                name="volunteering"
                emptyItem={{ role: '', organization: '', location: '', dates: '', bullets: [] }}
                renderItem={(index) => (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Input {...form.register(`volunteering.${index}.role`)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Organization</Label>
                                <Input {...form.register(`volunteering.${index}.organization`)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input {...form.register(`volunteering.${index}.location`)} />
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <Label>Dates</Label>
                                <Input {...form.register(`volunteering.${index}.dates`)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Details</Label>
                            <NestedBulletList form={form} path={`volunteering.${index}.bullets`} />
                        </div>
                    </div>
                )}
            />

            {/* ── Conferences & Talks ── */}
            <DynamicSectionList
                title="Conferences & Talks"
                form={form}
                name="conferences"
                emptyItem={{ name: '', topic: '', role: '', date: '', location: '', description: '', link: '' }}
                renderItem={(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Event Name</Label>
                            <Input {...form.register(`conferences.${index}.name`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Topic</Label>
                            <Input {...form.register(`conferences.${index}.topic`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input {...form.register(`conferences.${index}.role`)} placeholder="Speaker / Panelist / Attendee" />
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input {...form.register(`conferences.${index}.date`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input {...form.register(`conferences.${index}.location`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Link</Label>
                            <Input {...form.register(`conferences.${index}.link`)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Textarea {...form.register(`conferences.${index}.description`)} className="min-h-[90px]" />
                        </div>
                    </div>
                )}
            />

            {/* ── Languages ── */}
            <DynamicSectionList
                title="Languages"
                form={form}
                name="languages"
                emptyItem={{ language: '', proficiency: '' }}
                renderItem={(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Language</Label>
                            <Input {...form.register(`languages.${index}.language`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Proficiency</Label>
                            <Input {...form.register(`languages.${index}.proficiency`)} placeholder="Native / Fluent / Intermediate" />
                        </div>
                    </div>
                )}
            />

            {/* ── Interests & Hobbies ── */}
            <DynamicSectionList
                title="Interests & Hobbies"
                form={form}
                name="interests"
                emptyItem={{ name: '', details: '' }}
                renderItem={(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Interest</Label>
                            <Input {...form.register(`interests.${index}.name`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Details</Label>
                            <Input {...form.register(`interests.${index}.details`)} placeholder="Competitive chess, technical blogging, mentoring" />
                        </div>
                    </div>
                )}
            />

            {/* ── Products / Systems Owned ── */}
            <DynamicSectionList
                title="Products / Systems Owned"
                form={form}
                name="products"
                emptyItem={{ name: '', responsibility: '', scale: '', impact: '' }}
                renderItem={(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input {...form.register(`products.${index}.name`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Responsibility</Label>
                            <Input {...form.register(`products.${index}.responsibility`)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Scale</Label>
                            <Input {...form.register(`products.${index}.scale`)} placeholder="50k MAU, 2TB/day, global fleet" />
                        </div>
                        <div className="space-y-2">
                            <Label>Impact</Label>
                            <Input {...form.register(`products.${index}.impact`)} />
                        </div>
                    </div>
                )}
            />

            {/* ── DevOps / SRE Contributions ── */}
            <CollapsibleCard title="DevOps / SRE Contributions">
                <NestedBulletList
                    form={form}
                    path="devopsContributions"
                    buttonLabel="Add Contribution"
                    placeholder="Built reusable CI/CD pipelines with GitHub Actions and Terraform"
                />
            </CollapsibleCard>

            {/* ── Security / Compliance Work ── */}
            <CollapsibleCard title="Security / Compliance Work">
                <NestedBulletList
                    form={form}
                    path="securityContributions"
                    buttonLabel="Add Contribution"
                    placeholder="Implemented IAM least-privilege policies and audit controls"
                />
            </CollapsibleCard>

            {/* ── Additional Information ── */}
            <CollapsibleCard title="Additional Information">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Availability</Label>
                        <Input {...form.register('additionalInfo.availability')} placeholder="Immediate / 30 days notice" />
                    </div>
                    <div className="space-y-2">
                        <Label>Work Authorization</Label>
                        <Input {...form.register('additionalInfo.workAuthorization')} placeholder="Authorized to work in India / US" />
                    </div>
                    <div className="space-y-2">
                        <Label>Relocation</Label>
                        <Input {...form.register('additionalInfo.relocation')} placeholder="Open to relocate" />
                    </div>
                    <div className="space-y-2">
                        <Label>Travel</Label>
                        <Input {...form.register('additionalInfo.travel')} placeholder="Open to occasional travel" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Notes</Label>
                        <Textarea {...form.register('additionalInfo.notes')} className="min-h-[90px]" />
                    </div>
                </div>
            </CollapsibleCard>

            {/* ── Custom Sections ── */}
            <DynamicSectionList
                title="Custom Sections"
                form={form}
                name="customSections"
                emptyItem={{ title: '', items: [] }}
                renderItem={(index) => (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Section Title</Label>
                            <Input {...form.register(`customSections.${index}.title`)} placeholder="References / Patents / Community" />
                        </div>
                        <div className="space-y-2">
                            <Label>Items</Label>
                            <NestedBulletList form={form} path={`customSections.${index}.items`} buttonLabel="Add Item" />
                        </div>
                    </div>
                )}
            />

            {/* Sticky Save Button */}
            <div className="sticky bottom-4 z-10 pt-4">
                <Button type="submit" className="w-full shadow-lg" size="lg">
                    <Save className="mr-2 h-4 w-4" /> Save Resume Data
                </Button>
            </div>
        </form>
    );
}
