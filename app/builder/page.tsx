"use client";

import { useEffect, useState } from 'react';
import { BuilderWorkflowBar } from '@/components/builder-workflow-bar';
import { useAppStore } from '@/lib/store';
import { Step1JD } from './step1-jd';
import { Step2Details } from './step2-details';
import { Step3Processing } from './step3-processing';
import { Step4Preview } from './step4-preview';
import { AppHeader } from '@/components/app-header';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BuilderPage() {
    const currentStep = useAppStore((state) => state.step);
    const [ready, setReady] = useState(false);

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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs font-mono">Restoring document state...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            <BuilderWorkflowBar />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 py-4">


                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2"
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
