"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/components/auth-provider';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
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
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            <div className="px-4 py-16 flex items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-card p-8 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <Lock className="h-4 w-4" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">Set New Password</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Enter your new secure account password.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-medium text-foreground">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-9 text-xs pr-9"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm mt-3"
                        >
                            <span>{loading ? 'Saving password...' : 'Update Password & Continue'}</span>
                            {!loading && <ArrowRight className="h-3.5 w-3.5" />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
