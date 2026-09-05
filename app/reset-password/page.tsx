"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { useAuth } from '@/components/auth-provider';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { LumaLogo } from '@/components/luma-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const { supabase } = useAuth();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (!supabase) {
            toast.error('Auth service unavailable in current session');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password,
            });
            if (error) throw error;
            toast.success('Password updated successfully!');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary relative overflow-hidden">
            <AppHeader />

            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] bg-primary/8 rounded-full blur-3xl pointer-events-none -z-10" />

            <main className="flex-1 px-4 py-16 sm:py-20 flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card/90 p-8 sm:p-10 shadow-xl backdrop-blur-xl transition-all">
                    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/60">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-foreground border border-border/60 shadow-xs">
                            <LumaLogo size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-display tracking-tight text-foreground">Set New Password</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Choose a new secure password for your account
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="new-password" className="text-xs font-medium text-foreground">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    className="h-10 text-sm rounded-lg pr-11 border-border/70 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-[11px] text-muted-foreground">Minimum 6 characters.</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirm-password" className="text-xs font-medium text-foreground">Confirm New Password</Label>
                            <Input
                                id="confirm-password"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    <span>Updating password…</span>
                                </>
                            ) : (
                                <>
                                    <span>Save New Password & Continue</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
