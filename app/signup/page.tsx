import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { LumaLogo } from '@/components/luma-logo';
import { ArrowRight } from 'lucide-react';
import { AuthTopNav } from '@/components/auth-top-nav';

export const metadata: Metadata = {
    title: 'Create your account, LumaCV',
    description: 'Create your free account to craft tailored, typeset resumes with zero vendor lock-in.',
    alternates: { canonical: '/signup' },
};

export default function SignupPage() {
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
                        Create your account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-foreground hover:underline font-medium inline-flex items-center gap-1"
                        >
                            <span>Sign in</span>
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </p>
                </div>

                {/* Form & Social Auth */}
                <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted/20" />}>
                    <AuthForm mode="signup" />
                </Suspense>

                {/* Footer note */}
                <p className="text-center text-[11.5px] text-muted-foreground pt-2">
                    Free and open-source. No subscription traps or hidden fees.
                </p>
            </div>
        </div>
    );
}
