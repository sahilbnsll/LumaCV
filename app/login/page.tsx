import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { LumaLogo } from '@/components/luma-logo';
import { ArrowRight } from 'lucide-react';
import { AuthTopNav } from '@/components/auth-top-nav';

export const metadata: Metadata = {
    title: 'Sign in to your account, LumaCV',
    description: 'Sign in to access your resumes, full account settings, and live ATS checker.',
    alternates: { canonical: '/login' },
};

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-center items-center px-4 py-8 selection:bg-primary/20 selection:text-primary relative overflow-hidden">
            {/* Ambient subtle backdrop */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[90vw] h-[320px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Top Navigation with Menu & Theme */}
            <AuthTopNav />

            {/* Centered Auth Box */}
            <div className="w-full max-w-sm flex flex-col gap-y-6 animate-in fade-in-0 slide-in-from-top-4 duration-300 ease-out">
                {/* Brand Logo */}
                <div className="flex justify-center">
                    <Link
                        href="/"
                        className="size-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
                        title="LumaCV Home"
                    >
                        <LumaLogo size={28} />
                    </Link>
                </div>

                {/* Header */}
                <div className="space-y-1.5 text-center">
                    <h1 className="font-semibold text-2xl tracking-tight text-foreground">
                        Sign in to your account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/signup"
                            className="text-foreground hover:underline font-medium inline-flex items-center gap-1"
                        >
                            <span>Create one now</span>
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </p>
                </div>

                {/* Form & Social Auth */}
                <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted/20" />}>
                    <AuthForm mode="login" />
                </Suspense>

                {/* Footer note */}
                <p className="text-center text-[11.5px] text-muted-foreground pt-2">
                    Protected by client-side local encryption & optional cloud sync.
                </p>
            </div>
        </div>
    );
}
