"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Unhandled Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-inner">
                    <AlertTriangle className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                    <span className="font-mono text-xs text-rose-500 font-bold uppercase tracking-widest">
                        System Interruption
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Something Went Wrong
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        An unexpected error occurred during operation. Your resume drafts and local edits have been preserved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                        size="sm"
                        onClick={() => reset()}
                        className="w-full sm:w-auto h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Try Again</span>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto h-9 text-xs font-medium gap-1.5">
                        <Link href="/">
                            <Home className="h-3.5 w-3.5" />
                            <span>Homepage</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
