import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { AppHeader } from '@/components/app-header';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            <div className="px-4 py-16 flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-8 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">Sign In</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Access your tailored resumes and cloud storage.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <AuthForm mode="login" />
                    </div>

                    <p className="mt-6 text-xs text-center text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-primary hover:underline font-medium">
                            Create free account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
