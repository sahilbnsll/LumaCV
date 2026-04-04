"use client";

import { WizardStepper } from '@/components/wizard-stepper';
import { useAppStore } from '@/lib/store';
import { Step1JD } from './step1-jd';
import { Step2Details } from './step2-details';
import { Step3Processing } from './step3-processing';
import { Step4Preview } from './step4-preview';
import { useEffect, useState } from 'react';
import { Loader2, Sparkles, Moon, Sun, RotateCcw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function BuilderPage() {
    const currentStep = useAppStore((state) => state.step);
    const [ready, setReady] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (useAppStore.persist.hasHydrated()) {
            setReady(true);
            return;
        }
        const unsub = useAppStore.persist.onFinishHydration(() => setReady(true));
        const timer = setTimeout(() => setReady(true), 500);
        return () => { unsub(); clearTimeout(timer); };
    }, []);

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm">Loading your session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-6xl">
                    <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-card">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </span>
                        LumaCV
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive text-xs"
                            onClick={() => {
                                if (confirm('Start over? All progress will be lost.')) {
                                    useAppStore.getState().reset();
                                }
                            }}
                        >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                        </Button>
                        {mounted && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-6xl">
                <WizardStepper />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6"
                    >
                        {currentStep === 1 && <Step1JD />}
                        {currentStep === 2 && <Step2Details />}
                        {currentStep === 3 && <Step3Processing />}
                        {currentStep === 4 && <Step4Preview />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
