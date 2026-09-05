import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { ShieldCheck } from 'lucide-react';
import { LumaLogo } from '@/components/luma-logo';

export const metadata: Metadata = {
    title: 'Sign In — LumaCV',
    description: 'Sign in to access your tailored resumes, cloud version history, and Typst typesetting engine.',
};

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary relative overflow-hidden">
            <AppHeader />

            {/* Ambient background glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] max-w-[90vw] h-[360px] bg-primary/8 rounded-full blur-3xl pointer-events-none -z-10" />

            <main className="flex-1 px-3 sm:px-4 py-12 sm:py-20 flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-8 md:p-10 shadow-xl backdrop-blur-xl transition-all">
                    <div className="flex items-center justify-between mb-6 pb-5 border-b border-border/60">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-foreground border border-border/60 shadow-xs">
                                <LumaLogo size={22} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Sign In</h1>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Welcome back to your resume workspace
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            <span>Encrypted</span>
                        </span>
                    </div>

                    <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted/20" />}>
                        <AuthForm mode="login" />
                    </Suspense>

                    <div className="mt-8 pt-6 border-t border-border/60 text-center">
                        <p className="text-xs text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none rounded">
                                Create free account
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
