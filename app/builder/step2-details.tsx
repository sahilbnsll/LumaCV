"use client";

import { useAppStore } from '@/lib/store';
import { ResumeDataSchema } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { ResumeForm } from '@/components/resume-form';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function Step2Details() {
    const setStep = useAppStore((s) => s.setStep);
    const resumeData = useAppStore((s) => s.resumeData);
    const resumeDataRevision = useAppStore((s) => s.resumeDataRevision);

    const formKey = resumeData
        ? `rf-${resumeDataRevision}-${resumeData.personalInfo.name}`
        : 'rf-empty';

    const handleNext = () => {
        const { resumeData: rd } = useAppStore.getState();
        if (!rd) {
            toast.error('Add resume details first — upload a PDF on step 1 or fill the form and click Save Changes.');
            return;
        }
        const parsed = ResumeDataSchema.safeParse(rd);
        if (!parsed.success) {
            toast.error('Some required fields are missing. Fix errors in the form and click Save Changes.');
            return;
        }
        setStep(3);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/40 gap-2">
                <div>
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                        Review & Verify Experience
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Verify your parsed work history, education, and technical competencies before AI alignment.
                    </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 w-fit">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Factual Source of Truth</span>
                </div>
            </div>

            <ResumeForm key={formKey} />

            <div className="flex items-center justify-between pt-6 border-t border-border/40">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="h-9 text-xs border-border/60 hover:bg-muted/40 gap-1.5"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Upload & JD
                </Button>

                <Button
                    onClick={handleNext}
                    size="sm"
                    className="h-9 px-5 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm"
                >
                    Continue to AI Tailoring
                    <ArrowRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
