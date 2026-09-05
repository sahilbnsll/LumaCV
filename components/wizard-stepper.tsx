"use client";

import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';

const steps = [
    { id: 1, number: '01', name: 'Upload & JD', shortName: 'Job' },
    { id: 2, number: '02', name: 'Review Details', shortName: 'Details' },
    { id: 3, number: '03', name: 'AI Tailoring', shortName: 'Tailor' },
    { id: 4, number: '04', name: 'Studio & Export', shortName: 'Studio' },
];

export function WizardStepper() {
    const { step: currentStep, setStep } = useAppStore();

    return (
        <nav aria-label="Resume studio workflow steps" className="flex items-center gap-1 sm:gap-2">
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
                                "relative flex items-center gap-2 rounded-xl px-2.5 sm:px-3 py-1.5 transition-all text-xs group min-h-[36px] focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-hidden select-none",
                                isCurrent && "bg-card/80 dark:bg-white/[0.07] border border-border/80 dark:border-white/15 shadow-sm font-semibold backdrop-blur-md",
                                isCompleted && "hover:bg-muted/50 dark:hover:bg-white/[0.04] cursor-pointer text-foreground/90",
                                !isAccessible && "cursor-not-allowed opacity-35"
                            )}
                            title={isCompleted ? `Return to Step ${step.id}: ${step.name}` : undefined}
                        >
                            {/* Step Badge Indicator */}
                            <div
                                className={cn(
                                    "flex h-5 w-5 sm:h-5.5 sm:w-5.5 shrink-0 items-center justify-center rounded-lg text-[10px] font-mono font-bold transition-all duration-300",
                                    isCompleted
                                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400"
                                        : isCurrent
                                            ? "bg-primary text-primary-foreground shadow-xs shadow-primary/40 ring-2 ring-primary/25"
                                            : "border border-border/70 dark:border-white/10 bg-muted/30 text-muted-foreground"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-3 w-3 stroke-[3]" />
                                ) : (
                                    <span>{step.id}</span>
                                )}
                            </div>

                            {/* Step Title with Active Glow dot */}
                            <div className="flex items-center gap-1.5">
                                <span
                                    className={cn(
                                        "text-xs transition-colors whitespace-nowrap font-medium",
                                        isCurrent 
                                            ? "text-foreground font-semibold" 
                                            : isCompleted 
                                                ? "text-foreground/80" 
                                                : "text-muted-foreground"
                                    )}
                                >
                                    <span className="hidden sm:inline">{step.name}</span>
                                    <span className="sm:hidden">{step.shortName}</span>
                                </span>

                                {isCurrent && (
                                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                                    </span>
                                )}
                            </div>
                        </button>

                        {/* Delicate Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="w-2.5 sm:w-5 mx-0.5 sm:mx-1 h-[1px] bg-border/50 dark:bg-white/10 relative overflow-hidden" aria-hidden="true">
                                {isCompleted && (
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 0.3 }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-primary"
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
