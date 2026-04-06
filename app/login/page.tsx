import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background px-4 py-16">
            <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-sm">
                <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Sign in to unlock PDF and LaTeX downloads.
                </p>
                <div className="mt-6">
                    <AuthForm mode="login" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                    Don&apos;t have an account? <Link href="/signup" className="text-primary underline">Create one</Link>
                </p>
            </div>
        </div>
    );
}
