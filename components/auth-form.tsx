"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { getAppUrl } from '@/lib/app-url';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
    const { supabase } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams?.get('redirect') || '/dashboard';

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!supabase) {
            toast.error('Supabase auth is not configured. Add SUPABASE keys to .env.local.');
            return;
        }
        setLoading(true);
        try {
            if (mode === 'signup') {
                const emailRedirectTo = getAppUrl(`/auth/confirm?next=${encodeURIComponent(redirectUrl)}`);
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo,
                        data: {
                            full_name: fullName.trim(),
                        },
                    },
                });
                if (error) throw error;
                toast.success('Account created! Welcome to LumaCV.');
                router.push(redirectUrl);
                router.refresh();
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success('Logged in successfully.');
                router.push(redirectUrl);
                router.refresh();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
                <div className="space-y-1.5">
                    <Label htmlFor="auth-fullName" className="text-xs font-medium text-foreground">Full Name</Label>
                    <Input
                        id="auth-fullName"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Jane Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={loading}
                        className="h-10 text-sm rounded-lg border-border/70 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                </div>
            )}

            <div className="space-y-1.5">
                <Label htmlFor="auth-email" className="text-xs font-medium text-foreground">Email Address</Label>
                <Input
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 text-sm rounded-lg border-border/70 focus-visible:ring-1 focus-visible:ring-primary"
                />
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor="auth-password" className="text-xs font-medium text-foreground">Password</Label>
                    {mode === 'login' && (
                        <Link
                            href="/forgot-password"
                            className="text-xs text-primary hover:text-primary/80 transition-colors focus-visible:underline focus-visible:outline-none"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>
                <div className="relative">
                    <Input
                        id="auth-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
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
                {mode === 'signup' && (
                    <p className="text-[11px] text-muted-foreground">Minimum 6 characters required.</p>
                )}
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-sm rounded-lg mt-2 transition-all cursor-pointer"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Authenticating…</span>
                    </>
                ) : (
                    <>
                        <span>{mode === 'signup' ? 'Create Free Account' : 'Sign In to LumaCV'}</span>
                        <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </Button>
        </form>
    );
}
