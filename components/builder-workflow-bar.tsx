"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ResumeDataSchema } from '@/lib/resume-schema';
import { WizardStepper } from './wizard-stepper';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    ArrowLeft,
    ArrowRight,
    RotateCcw
} from 'lucide-react';
import { notify } from '@/lib/notify';

export function BuilderWorkflowBar() {
    const step = useAppStore((s) => s.step);
    const setStep = useAppStore((s) => s.setStep);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleStep1Next = () => {
        setStep(2);
    };

    const handleStep2Next = () => {
        const currentResumeData = useAppStore.getState().resumeData;
        if (!currentResumeData) {
            notify.error('Resume details required', 'Upload a PDF or save your changes');
            return;
        }
        const parsed = ResumeDataSchema.safeParse(currentResumeData);
        if (!parsed.success) {
            notify.error('Missing required fields', 'Please fix errors in the form');
            return;
        }
        const currentJd = useAppStore.getState().jd;
        if (!currentJd.trim()) {
            notify.info('Direct preview', 'Opening Studio without AI tailoring');
            setStep(4);
            return;
        }
        setStep(3);
    };


    const handleReset = () => {
        useAppStore.getState().reset();
        notify.info('Session reset', 'Draft cleared');
        setShowResetConfirm(false);
    };

    return (
        <div className="sticky top-14 z-40 glass-nav py-2.5 px-4 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-marketing mx-auto">
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
                            className="h-8 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-xl shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-[color,background-color,border-color,box-shadow,transform] cursor-pointer"
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
                                className="h-8 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-xl shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-[color,background-color,border-color,box-shadow,transform] cursor-pointer"
                            >
                                <span>Continue to AI Tailor</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
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
                        onClick={() => setShowResetConfirm(true)}
                        className="text-muted-foreground/60 hover:text-destructive text-xs h-8 px-2.5 rounded-xl hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Reset session draft"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:ml-1 text-[11px]">Reset</span>
                    </Button>
                </div>
            </div>

            <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-destructive">Start Over?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Current form entries and any tailored draft will be reset. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="pt-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowResetConfirm(false)}
                            className="h-8 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleReset}
                            className="h-8 text-xs font-semibold"
                        >
                            Reset Draft
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
