"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Target, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        const seen = localStorage.getItem('lumacv_onboarding_completed');
        if (!seen) {
            const timer = setTimeout(() => setIsOpen(true), 600);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('lumacv_onboarding_completed', 'true');
        setIsOpen(false);
    };

    const steps = [
        {
            icon: FileText,
            title: '1. Ground-Truth Source Data',
            description: 'Upload your existing PDF resume. LumaCV treats your dates, employers, metrics, and achievements as unalterable truth—guaranteeing zero AI hallucinations.',
        },
        {
            icon: Target,
            title: '2. Target Job Description',
            description: 'Paste any target job description. The engine extracts prioritized competencies, required technologies, and recruiter keywords.',
        },
        {
            icon: Sparkles,
            title: '3. Vector Compilation & Diffs',
            description: 'Experience bullets are rewritten using executive action formulas. Review changes side-by-side with 1-click Accept / Revert controls and instant PDF downloads.',
        },
    ];

    const current = steps[step - 1];
    const Icon = current.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="fixed inset-0 bg-background/80 backdrop-blur-md"
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Welcome to LumaCV onboarding guide"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative z-10 w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-5"
                    >
                        <button
                            onClick={handleDismiss}
                            aria-label="Close welcome guide"
                            className="absolute top-3.5 right-3.5 h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-semibold font-display text-sm text-foreground">Welcome to LumaCV</span>
                        </div>

                        {/* Step Card */}
                        <div className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25">
                                <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">{current.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {current.description}
                            </p>
                        </div>

                        {/* Stepper Dots & Action */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                            <div className="flex items-center gap-1.5">
                                {steps.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`h-1.5 rounded-full transition-all ${
                                            step === idx + 1 ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                                        }`}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                {step < steps.length ? (
                                    <Button
                                        size="sm"
                                        onClick={() => setStep(step + 1)}
                                        className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                                    >
                                        <span>Next</span>
                                        <ArrowRight className="h-3 w-3" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={handleDismiss}
                                        className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Get Started</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
