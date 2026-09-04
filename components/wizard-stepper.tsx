"use client";

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';

const steps = [
    { id: 1, number: '01', name: 'Upload & Job' },
    { id: 2, number: '02', name: 'Review Details' },
    { id: 3, number: '03', name: 'AI Tailor' },
    { id: 4, number: '04', name: 'Review & Export' },
];

export function WizardStepper() {
    const { step: currentStep, setStep } = useAppStore();

    return (
        <nav aria-label="Resume creation steps" className="flex items-center gap-1 sm:gap-2">
            {steps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const isAccessible = step.id <= currentStep;

                return (
                    <div key={step.id} className="flex items-center">
                        <button
                            type="button"
                            disabled={!isAccessible}
                            aria-current={isCurrent ? "step" : undefined}
                            aria-label={`Step ${step.id}: ${step.name}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                            onClick={() => {
                                if (isAccessible && step.id !== currentStep) {
                                    setStep(step.id);
                                }
                            }}
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all text-xs group min-h-[36px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                                isCurrent && "bg-muted/60 font-semibold shadow-xs",
                                isCompleted && "hover:bg-muted/40 cursor-pointer",
                                !isAccessible && "cursor-not-allowed opacity-40"
                            )}
                            title={isCompleted ? `Return to Step ${step.id}: ${step.name}` : undefined}
                        >
                            <div
                                className={cn(
                                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all",
                                    isCompleted
                                        ? "bg-emerald-500 text-white"
                                        : isCurrent
                                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                                            : "border border-border/80 bg-muted/40 text-muted-foreground"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                ) : (
                                    <span>{step.id}</span>
                                )}
                            </div>

                            <span
                                className={cn(
                                    "hidden sm:inline text-xs transition-colors whitespace-nowrap",
                                    isCurrent ? "text-foreground font-semibold" : isCompleted ? "text-foreground/80" : "text-muted-foreground"
                                )}
                            >
                                {step.name}
                            </span>
                        </button>

                        {index < steps.length - 1 && (
                            <div className="w-3 sm:w-6 mx-1 h-[1px] bg-border/60 relative overflow-hidden" aria-hidden="true">
                                {isCompleted && (
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        className="h-full bg-emerald-500"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
