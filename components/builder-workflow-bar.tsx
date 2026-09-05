"use client";

import { useAppStore } from '@/lib/store';
import { ResumeDataSchema } from '@/lib/resume-schema';
import { WizardStepper } from './wizard-stepper';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    ArrowRight,
    RotateCcw,
    Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export function BuilderWorkflowBar() {
    const { step, setStep, jd, resumeData } = useAppStore();

    const handleStep1Next = () => {
        if (!jd.trim()) {
            toast.error('Please paste a target job description or click "Try Sample JD"');
            return;
        }
        setStep(2);
    };

    const handleStep2Next = () => {
        if (!resumeData) {
            toast.error('Add resume details first — upload a PDF on step 1 or fill the form and save.');
            return;
        }
        const parsed = ResumeDataSchema.safeParse(resumeData);
        if (!parsed.success) {
            toast.error('Some required fields are missing. Please verify errors in the form.');
            return;
        }
        setStep(3);
    };


    const handleReset = () => {
        if (confirm('Start over? Current form entries and tailored draft will be reset.')) {
            useAppStore.getState().reset();
            toast.info('Draft session reset');
        }
    };

    return (
        <div className="sticky top-14 z-30 glass-nav py-2.5 px-4 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-7xl mx-auto">
                {/* Stepper (Left) */}
                <div className="flex-1">
                    <WizardStepper />
                </div>

                {/* Sticky Persistent Actions (Right) */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {/* Step-specific primary action */}
                    {step === 1 && (
                        <Button
                            size="sm"
                            onClick={handleStep1Next}
                            className="h-8 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-xl shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <span>Continue to Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    )}

                    {step === 2 && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStep(1)}
                                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-xl cursor-pointer"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Back</span>
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleStep2Next}
                                className="h-8 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-xl shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <span>Continue to AI Tailor</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex items-center gap-2 text-xs font-mono font-medium text-primary bg-primary/10 dark:bg-primary/15 px-3 py-1 rounded-full border border-primary/25 shadow-xs">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                            <span>Tailoring Pipeline Active</span>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium hidden sm:inline-flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Studio Export Ready</span>
                            </span>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-muted-foreground/60 hover:text-destructive text-xs h-8 px-2.5 rounded-xl hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Reset session draft"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:ml-1 text-[11px]">Reset</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
