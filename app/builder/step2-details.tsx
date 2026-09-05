"use client";

import { useAppStore } from '@/lib/store';
import { ResumeDataSchema } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { ResumeForm } from '@/components/resume-form';
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
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
        <div className="space-y-6 max-w-5xl mx-auto py-2">
            {/* Editorial Top Headline */}
            <div className="text-center space-y-2.5 pb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-medium shadow-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Step 2 • Experience & Profile Details</span>
                </div>

                <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight">
                    Review & Refine Career Details
                </h1>

                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    Review your extracted chronology, bullet points, and skills. All edits are saved directly to your workspace.
                </p>
            </div>

            {/* Main Form Component */}
            <ResumeForm key={formKey} />

            {/* Bottom Nav Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-border/60 dark:border-white/10">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="h-10 px-4 text-xs font-medium rounded-xl border-border/70 dark:border-white/10 hover:bg-muted/40 gap-1.5 cursor-pointer transition-all"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Upload & JD</span>
                </Button>

                <Button
                    onClick={handleNext}
                    size="sm"
                    className="h-10 px-6 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                    <span>Continue to AI Tailoring</span>
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
