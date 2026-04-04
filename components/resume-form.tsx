"use client";

import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResumeData, ResumeDataSchema } from '@/lib/resume-schema';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const emptyResumeData: ResumeData = {
    personalInfo: { name: '', email: '', phone: '', linkedin: '', portfolio: '', title: '', tagline: '' },
    summary: '',
    skills: [{ category: '', items: '' }],
    experience: [{ title: '', company: '', location: '', dates: '', bullets: [''] }],
    education: { institution: '', degree: '', dates: '' },
    certifications: [],
};


export function ResumeForm() {
    const resumeData = useAppStore((s) => s.resumeData);
    const setResumeData = useAppStore((s) => s.setResumeData);

    const form = useForm<ResumeData>({
        resolver: zodResolver(ResumeDataSchema),
        defaultValues: resumeData || emptyResumeData,
        mode: 'onBlur',
    });

    // Explicitly reset form when resumeData becomes available (after parse or hydration).
    // We track whether we've already synced this data to avoid resetting user edits.
    const syncedRef = useRef<string | null>(null);
    useEffect(() => {
        if (!resumeData) return;
        const key = resumeData.personalInfo.name + '|' + resumeData.experience.length;
        if (syncedRef.current === key) return;
        syncedRef.current = key;
        // Use setTimeout to ensure DOM refs from register() are attached
        setTimeout(() => form.reset(resumeData), 0);
    }, [resumeData, form]);

    const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
        control: form.control,
        name: 'experience'
    });

    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
        control: form.control,
        name: 'skills'
    });

    const onSubmit = (data: ResumeData) => {
        setResumeData(data);
        toast.success('Resume details saved!');
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...form.register('personalInfo.name')} />
                        {form.formState.errors.personalInfo?.name && (
                            <p className="text-xs text-red-500">{form.formState.errors.personalInfo.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...form.register('personalInfo.email')} />
                        {form.formState.errors.personalInfo?.email && (
                            <p className="text-xs text-red-500">{form.formState.errors.personalInfo.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" {...form.register('personalInfo.phone')} />
                        {form.formState.errors.personalInfo?.phone && (
                            <p className="text-xs text-red-500">{form.formState.errors.personalInfo.phone.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input id="linkedin" {...form.register('personalInfo.linkedin')} />
                        {form.formState.errors.personalInfo?.linkedin && (
                            <p className="text-xs text-red-500">{form.formState.errors.personalInfo.linkedin.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="portfolio">Portfolio</Label>
                        <Input id="portfolio" {...form.register('personalInfo.portfolio')} />
                        {form.formState.errors.personalInfo?.portfolio && (
                            <p className="text-xs text-red-500">{form.formState.errors.personalInfo.portfolio.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input id="title" {...form.register('personalInfo.title')} />
                        {form.formState.errors.personalInfo?.title && (
                            <p className="text-xs text-red-500">{form.formState.errors.personalInfo.title.message}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        {...form.register('summary')}
                        className="min-h-[100px]"
                        placeholder="Experienced software engineer with..."
                    />
                    {form.formState.errors.summary && (
                        <p className="text-xs text-red-500">{form.formState.errors.summary.message}</p>
                    )}
                </CardContent>
            </Card>

            {/* Experience */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Experience</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ title: '', company: '', dates: '', location: '', bullets: [''] })}>
                        <Plus className="h-4 w-4 mr-2" /> Add Job
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {expFields.map((field, index) => (
                        <div key={field.id} className="border p-4 rounded-lg space-y-4 relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                onClick={() => removeExp(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Job Title</Label>
                                    <Input {...form.register(`experience.${index}.title`)} />
                                    {form.formState.errors.experience?.[index]?.title && (
                                        <p className="text-xs text-red-500">{form.formState.errors.experience[index]?.title?.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Company</Label>
                                    <Input {...form.register(`experience.${index}.company`)} />
                                    {form.formState.errors.experience?.[index]?.company && (
                                        <p className="text-xs text-red-500">{form.formState.errors.experience[index]?.company?.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Dates</Label>
                                    <Input {...form.register(`experience.${index}.dates`)} placeholder="Jan 2020 - Present" />
                                    {form.formState.errors.experience?.[index]?.dates && (
                                        <p className="text-xs text-red-500">{form.formState.errors.experience[index]?.dates?.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input {...form.register(`experience.${index}.location`)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Achievements (Bullet Points)</Label>
                                <NestedBulletList nestIndex={index} form={form} />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Skills */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Skills</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendSkill({ category: '', items: '' })}>
                        <Plus className="h-4 w-4 mr-2" /> Add Category
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {skillFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-start">
                            <div className="flex-1 space-y-2">
                                <Label>Category</Label>
                                <Input {...form.register(`skills.${index}.category`)} placeholder="Languages, Tools..." />
                                {form.formState.errors.skills?.[index]?.category && (
                                    <p className="text-xs text-red-500">{form.formState.errors.skills[index]?.category?.message}</p>
                                )}
                            </div>
                            <div className="flex-[2] space-y-2">
                                <Label>Items</Label>
                                <Input {...form.register(`skills.${index}.items`)} placeholder="Java, Python, React..." />
                                {form.formState.errors.skills?.[index]?.items && (
                                    <p className="text-xs text-red-500">{form.formState.errors.skills[index]?.items?.message}</p>
                                )}
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="mt-8" onClick={() => removeSkill(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Education */}
            <Card>
                <CardHeader>
                    <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input {...form.register('education.institution')} />
                        {form.formState.errors.education?.institution && (
                            <p className="text-xs text-red-500">{form.formState.errors.education.institution.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input {...form.register('education.degree')} />
                        {form.formState.errors.education?.degree && (
                            <p className="text-xs text-red-500">{form.formState.errors.education.degree.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Dates</Label>
                        <Input {...form.register('education.dates')} />
                        {form.formState.errors.education?.dates && (
                            <p className="text-xs text-red-500">{form.formState.errors.education.dates.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>GPA (Optional)</Label>
                        <Input {...form.register('education.gpa')} />
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg">
                <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
        </form>
    );
}

interface NestedBulletListProps {
    nestIndex: number;
    form: UseFormReturn<ResumeData>;
}


function NestedBulletList({ nestIndex, form }: NestedBulletListProps) {
    // RHF's FieldArrayPath<ResumeData> only lists top-level arrays; nested bullet paths are valid at runtime.
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        // @ts-expect-error — dynamic `experience[n].bullets` path
        name: `experience.${nestIndex}.bullets`,
    });

    return (
        <div className="space-y-2">
            {fields.map((item, k) => (
                <div key={item.id} className="flex gap-2">
                    <Input {...form.register(`experience.${nestIndex}.bullets.${k}`)} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(k)}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            ))}
            {form.formState.errors.experience?.[nestIndex]?.bullets && (
                <p className="text-xs text-red-500">{form.formState.errors.experience[nestIndex]?.bullets?.message}</p>
            )}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append("New achievement" as never)}
                className="mt-2"
            >
                <Plus className="h-3 w-3 mr-2" /> Add Bullet
            </Button>
        </div>
    );
}
