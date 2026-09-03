"use client";

import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowRight, Home } from 'lucide-react';


export default function NotFound() {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary flex flex-col justify-between">
            <AppHeader />

            <main className="flex-1 flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/30 border border-border/80 text-muted-foreground/60 shadow-inner">
                        <FileQuestion className="h-8 w-8 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <span className="font-mono text-xs text-primary font-bold uppercase tracking-widest">
                            Error 404
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Page Not Found
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            The document or page you requested could not be located. It may have been moved, renamed, or deleted.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Button asChild size="sm" className="w-full sm:w-auto h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm">
                            <Link href="/">
                                <Home className="h-3.5 w-3.5" />
                                <span>Go to Homepage</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto h-9 text-xs font-medium gap-1.5">
                            <Link href="/dashboard">
                                <span>Go to My Resumes</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>

            <footer className="py-6 border-t border-border/40 text-center text-xs text-muted-foreground">
                <p>© {new Date().getFullYear()} LumaCV. All rights reserved.</p>
            </footer>
        </div>
    );
}
