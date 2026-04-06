import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-background px-4 py-16">
            <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-sm">
                <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Save your progress and unlock resume exports.
                </p>
                <div className="mt-6">
                    <AuthForm mode="signup" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                    Already have an account? <Link href="/login" className="text-primary underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
