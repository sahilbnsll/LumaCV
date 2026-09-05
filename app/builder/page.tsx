"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BuilderWorkflowBar } from '@/components/builder-workflow-bar';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/components/auth-provider';
import { Step1JD } from './step1-jd';
import { Step2Details } from './step2-details';
import { Step3Processing } from './step3-processing';
import { Step4Preview } from './step4-preview';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BuilderPage() {
    const { user, loading: authLoading } = useAuth();
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

    if (!ready || authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs font-mono">Initializing workspace...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
                <AppHeader />
                <main className="flex-1 mx-auto max-w-xl px-4 sm:px-6 py-16 sm:py-24 w-full flex items-center justify-center">
                    <div className="w-full rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md p-8 sm:p-10 text-center shadow-xl shadow-black/5 dark:shadow-black/20">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-5">
                            <Lock className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Authentication Required
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                            Sign in to your account to upload, tailor, edit, and export resumes. Your resumes and drafts are saved securely to your private workspace.
                        </p>

                        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button asChild size="default" className="w-full sm:w-auto h-10 px-6 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xs">
                                <Link href="/login?redirect=/builder">
                                    Sign In to Continue
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="default" className="w-full sm:w-auto h-10 px-6 text-xs font-medium border-border/80 bg-background/80 hover:bg-muted rounded-xl">
                                <Link href="/signup?redirect=/builder">
                                    Create Free Account
                                </Link>
                            </Button>
                        </div>
                    </div>
                </main>
                <AppFooter />
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
