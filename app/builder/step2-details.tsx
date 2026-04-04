"use client";

import { useAppStore } from '@/lib/store';
import { ResumeDataSchema } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { ResumeForm } from '@/components/resume-form';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
            <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">Review & Edit Details</h2>
                <p className="text-sm text-muted-foreground">Review the parsed information and make corrections.</p>
            </div>

            <ResumeForm key={formKey} />

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext} size="lg" className="glow-sm">
                    Next: AI Tailor <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
