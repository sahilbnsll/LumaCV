"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { useAuth } from '@/components/auth-provider';
import { LumaLogo } from '@/components/luma-logo';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getAppUrl } from '@/lib/app-url';

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
            const redirectTo = getAppUrl('/reset-password');
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
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary relative overflow-hidden">
            <AppHeader />

            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] max-w-[90vw] h-[360px] bg-primary/8 rounded-full blur-3xl pointer-events-none -z-10" />

            <main className="flex-1 px-3 sm:px-4 py-12 sm:py-20 flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-8 md:p-10 shadow-xl backdrop-blur-xl transition-all">
                    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/60">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-foreground border border-border/60 shadow-xs">
                            <LumaLogo size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Reset Password</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Send a secure recovery link to your inbox
                            </p>
                        </div>
                    </div>

                    {sent ? (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-6 text-center space-y-3">
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 ring-4 ring-emerald-500/10">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground">Check Your Inbox</h2>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                We sent a password recovery link to <span className="font-medium text-foreground font-mono">{email}</span>. Click the link to choose your new password.
                            </p>
                            <div className="pt-2">
                                <Button asChild variant="outline" size="sm" className="h-9 text-xs rounded-lg">
                                    <Link href="/login">Return to Sign In</Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="reset-email" className="text-xs font-medium text-foreground">Account Email Address</Label>
                                <Input
                                    id="reset-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="jane@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className="h-10 text-sm rounded-lg border-border/70 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-sm rounded-lg mt-2 transition-all cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Dispatching link…</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send Password Reset Link</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            <div className="pt-4 text-center border-t border-border/60 mt-6">
                                <Link
                                    href="/login"
                                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-muted/40 transition-colors"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    <span>Return to sign in</span>
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
