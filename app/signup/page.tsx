import { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Sparkles, Check } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Create Free Account — LumaCV',
    description: 'Create your free LumaCV account to craft mathematically aligned Typst resumes with zero vendor lock-in.',
};

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary relative overflow-hidden">
            <AppHeader />

            {/* Ambient background glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[400px] bg-primary/8 rounded-full blur-3xl pointer-events-none -z-10" />

            <main className="flex-1 px-4 py-16 sm:py-20 flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/90 p-8 sm:p-10 shadow-xl backdrop-blur-xl transition-all">
                    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/60">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Create Free Account</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Start generating editorial-grade resumes in seconds
                            </p>
                        </div>
                    </div>

                    {/* Trust badges row */}
                    <div className="grid grid-cols-2 gap-2 mb-6 p-3 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>Zero paywalls</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>Client-side BYOK key</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>6 Typst templates</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>ATS-proof vectors</span>
                        </div>
                    </div>

                    <AuthForm mode="signup" />

                    <div className="mt-8 pt-6 border-t border-border/60 text-center">
                        <p className="text-xs text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none rounded">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
