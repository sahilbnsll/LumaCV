"use client";

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';

const steps = [
    { id: 1, name: 'Upload & JD' },
    { id: 2, name: 'Edit Details' },
    { id: 3, name: 'AI Tailor' },
    { id: 4, name: 'Preview' },
];

export function WizardStepper() {
    const currentStep = useAppStore((state) => state.step);

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-center gap-1 md:gap-3">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;

                    return (
                        <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center relative">
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                                        isCompleted
                                            ? "border-primary bg-primary text-primary-foreground shadow-md"
                                            : isCurrent
                                                ? "border-primary bg-primary/10 text-primary glow-sm"
                                                : "border-muted-foreground/20 bg-muted/50 text-muted-foreground hover:border-primary/35 hover:bg-muted transition-colors"
                                    )}
                                >
                                    {isCompleted ? (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <Check className="h-5 w-5" />
                                        </motion.div>
                                    ) : (
                                        <span className="text-sm font-semibold">{step.id}</span>
                                    )}
                                </motion.div>
                                <span
                                    className={cn(
                                        "mt-2 text-xs font-medium transition-colors whitespace-nowrap",
                                        isCurrent ? "text-primary" : isCompleted ? "text-foreground/70" : "text-muted-foreground/60",
                                    )}
                                >
                                    {step.name}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="relative w-12 md:w-24 h-[2px] mx-2 md:mx-3 mb-6">
                                    <div className="absolute inset-0 bg-muted-foreground/15 rounded-full" />
                                    <motion.div
                                        className="absolute inset-y-0 left-0 bg-primary rounded-full"
                                        initial={{ width: "0%" }}
                                        animate={{ width: isCompleted ? "100%" : "0%" }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
