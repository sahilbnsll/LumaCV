"use client";

import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { ResumeData, ResumeDataSchema } from '@/lib/resume-schema';

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
        <Card className="rounded-2xl border-border/70 dark:border-white/10 bg-card/90 dark:bg-[#0e1014]/90 shadow-sm backdrop-blur-md overflow-hidden transition-all duration-200 hover:border-border dark:hover:border-white/20">
            <CardHeader
                className="flex cursor-pointer select-none flex-row items-center justify-between p-5 py-4 hover:bg-muted/30 dark:hover:bg-white/[0.02] transition-colors"
                onClick={(event) => {
                    if ((event.target as HTMLElement).closest('.action-btn-no-toggle')) return;
                    setOpen((prev) => !prev);
                }}
            >
                <CardTitle className="flex items-center gap-2.5 text-sm sm:text-base font-display font-semibold tracking-tight text-foreground">
                    <div className="h-6 w-6 rounded-lg bg-muted/60 dark:bg-white/5 border border-border/60 dark:border-white/10 flex items-center justify-center text-muted-foreground transition-transform duration-200">
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
    const { fields, append, remove } = useFieldArray({
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
                    onClick={() => append(emptyItem)}
                    className="h-7 px-2.5 text-xs rounded-lg border-border/70 dark:border-white/10 hover:border-primary/40 gap-1.5 cursor-pointer active:scale-95"
                >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    <span>Add</span>
                </Button>
            }
        >
            <div className="space-y-4 pt-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="relative space-y-4 rounded-xl border border-border/60 dark:border-white/10 bg-muted/25 dark:bg-white/[0.02] p-4 sm:p-5 transition-all">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2.5 top-2.5 h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                            onClick={() => remove(index)}
                            title="Remove item"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <div className="pr-6">{renderItem(index)}</div>
                    </div>
                ))}
                {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 dark:border-white/10 p-6 text-center text-xs text-muted-foreground bg-muted/10">
                        <p>No entries added yet.</p>
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() => append(emptyItem)}
                            className="text-primary font-medium text-xs mt-1 cursor-pointer"
                        >
                            + Add an entry
                        </Button>
                    </div>
                ) : null}
            </div>
        </CollapsibleCard>
    );
}

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
                <div key={item.id} className="flex gap-2">
                    <Input {...form.register(`${path}.${index}` as never)} placeholder={placeholder} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append('')} className="mt-2">
                <Plus className="mr-2 h-3 w-3" /> {buttonLabel}
            </Button>
        </div>
    );
}

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
                <NestedBulletList form={form} path={`${basePath}.bullets`} placeholder="Improved deployment speed by 40% using GitHub Actions and Docker" />
            </div>
        </div>
    );
}

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
        toast.success('Resume details saved.');
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold">Core Sections</h3>
                        <p className="text-xs text-muted-foreground">Focus on the essentials first: header, summary, skills, experience, education, and projects.</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {autosaveState === 'saving' && 'Autosaving…'}
                        {autosaveState === 'saved' && 'All changes saved'}
                        {autosaveState === 'invalid' && 'Draft changed - fix validation issues to save'}
                        {autosaveState === 'idle' && 'Autosave ready'}
                    </div>
                </div>
            </div>

            <CollapsibleCard title="Personal Information" defaultOpen>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input {...form.register('personalInfo.name')} />
                        {form.formState.errors.personalInfo?.name ? <p className="text-xs text-red-500">{form.formState.errors.personalInfo.name.message}</p> : null}
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

            <CollapsibleCard title="Professional Summary" defaultOpen>
                <Textarea {...form.register('summary')} className="min-h-[120px]" placeholder="Summarize total experience, domains, top tools, and strongest impact in 2-4 lines." />
                {form.formState.errors.summary ? <p className="text-xs text-red-500">{form.formState.errors.summary.message}</p> : null}
            </CollapsibleCard>

            <CollapsibleCard title="Tech Stack Summary" defaultOpen>
                <Input {...form.register('techStackSummary')} placeholder="AWS | Terraform | Kubernetes | Docker | GitHub Actions | Prometheus" />
            </CollapsibleCard>

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
                            <Input {...form.register(`keyMetrics.${index}.context`)} placeholder="After workload rightsizing and reserved capacity planning" />
                        </div>
                    </div>
                )}
            />

            <DynamicSectionList
                title="Work Experience"
                form={form}
                name="experience"
                defaultOpen
                emptyItem={{ title: '', company: '', location: '', dates: '', bullets: [''] }}
                renderItem={(index) => <ExperienceFields form={form} basePath={`experience.${index}`} organizationLabel="Company" />}
            />

            <DynamicSectionList
                title="Internships"
                form={form}
                name="internships"
                emptyItem={{ title: '', company: '', location: '', dates: '', bullets: [''] }}
                renderItem={(index) => <ExperienceFields form={form} basePath={`internships.${index}`} organizationLabel="Organization" />}
            />

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

            <DynamicSectionList
                title="Projects"
                form={form}
                name="projects"
                emptyItem={{ name: '', description: '', techStack: '', role: '', dates: '', impact: '', link: '', bullets: [] }}
                renderItem={(index) => (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Project Name</Label>
                                <Input {...form.register(`projects.${index}.name`)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Your Role</Label>
                                <Input {...form.register(`projects.${index}.role`)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Dates</Label>
                                <Input {...form.register(`projects.${index}.dates`)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Project Link</Label>
                                <Input {...form.register(`projects.${index}.link`)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Description</Label>
                                <Textarea {...form.register(`projects.${index}.description`)} className="min-h-[90px]" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Tech Stack</Label>
                                <Input {...form.register(`projects.${index}.techStack`)} placeholder="Next.js, Node.js, PostgreSQL" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Impact / Result</Label>
                                <Input {...form.register(`projects.${index}.impact`)} placeholder="Used by 5k+ students across 3 campuses" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Highlights</Label>
                            <NestedBulletList form={form} path={`projects.${index}.bullets`} placeholder="Built ATS-friendly Typst output with multi-template support" />

                        </div>
                    </div>
                )}
            />

            <div className="rounded-lg border bg-muted/20 p-4">
                <h3 className="text-sm font-semibold">Advanced Sections</h3>
                <p className="text-xs text-muted-foreground">Use these when they genuinely strengthen the resume. Core sections should stay strongest.</p>
            </div>

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

            <CollapsibleCard title="DevOps / SRE Contributions">
                <NestedBulletList form={form} path="devopsContributions" buttonLabel="Add Contribution" placeholder="Built reusable CI/CD pipelines with GitHub Actions and Terraform" />
            </CollapsibleCard>

            <CollapsibleCard title="Security / Compliance Work">
                <NestedBulletList form={form} path="securityContributions" buttonLabel="Add Contribution" placeholder="Implemented IAM least-privilege policies and audit controls" />
            </CollapsibleCard>

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

            <div className="sticky bottom-4 z-10 pt-4">
                <Button type="submit" className="w-full shadow-lg" size="lg">
                    <Save className="mr-2 h-4 w-4" /> Save Resume Data
                </Button>
            </div>
        </form>
    );
}
