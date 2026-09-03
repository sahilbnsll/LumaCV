"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/components/auth-provider';
import { KeyRound, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const { supabase } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        if (!supabase) {
            toast.error('Auth service unavailable in current environment');
            return;
        }

        setLoading(true);
        try {
            const redirectTo = `${window.location.origin}/reset-password`;
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo,
            });
            if (error) throw error;
            setSent(true);
            toast.success('Password reset email sent!');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            <div className="px-4 py-16 flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-8 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <KeyRound className="h-4 w-4" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">Reset Password</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                We&apos;ll send you a secure link to reset your account password.
                            </p>
                        </div>
                    </div>

                    {sent ? (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6 text-center space-y-3 mt-4">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">Check Your Inbox</h2>
                            <p className="text-xs text-muted-foreground">
                                We sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
                            </p>
                            <Button asChild variant="outline" size="sm" className="h-8 text-xs mt-3">
                                <Link href="/login">Back to Sign In</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-medium text-foreground">Your Account Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="jane@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm mt-2"
                            >
                                <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
                                {!loading && <ArrowRight className="h-3.5 w-3.5" />}
                            </Button>

                            <div className="pt-3 text-center">
                                <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                                    <ArrowLeft className="h-3 w-3" />
                                    <span>Return to sign in</span>
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
