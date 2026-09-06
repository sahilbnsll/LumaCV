"use client";

import { useAppStore } from '@/lib/store';
import { ResumeDataSchema } from '@/lib/resume-schema';
import { Button } from '@/components/ui/button';
import { ResumeForm } from '@/components/resume-form';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { TailorModeSelector } from '@/components/tailor-mode-selector';

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

            {/* AI Tailoring Mode Selection Card - on top so candidate sets mode first */}
            <div className="pb-1">
                <TailorModeSelector className="p-4 sm:p-5 rounded-2xl border border-border/70 dark:border-white/10 bg-card/40 backdrop-blur-sm" />
            </div>

            {/* Main Form Component */}
            <ResumeForm key={formKey} />

            {/* Bottom Nav Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-border/60 dark:border-white/10 gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="h-10 px-3 sm:px-4 text-xs font-medium rounded-xl border-border/70 dark:border-white/10 hover:bg-muted/40 gap-1.5 cursor-pointer transition-all shrink-0"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Back to Upload & JD</span>
                    <span className="sm:hidden">Back</span>
                </Button>

                <Button
                    onClick={handleNext}
                    size="sm"
                    className="h-10 px-4 sm:px-6 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
                >
                    <span className="hidden sm:inline">Continue to AI Generation</span>
                    <span className="sm:hidden">Continue</span>
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
