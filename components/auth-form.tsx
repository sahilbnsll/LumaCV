"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './auth-provider';
import { notify } from '@/lib/notify';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { getAppUrl, sanitizeRedirectPath } from '@/lib/app-url';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
    const { supabase } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    // Sanitized to a same-origin relative path: this value flows into both
    // router.push() and the emailRedirectTo sent to Supabase below, an
    // unvalidated absolute URL here would let an attacker-crafted signup
    // link's *legitimate* confirmation email redirect the victim to a
    // phishing page after a real, trusted click.
    const redirectUrl = sanitizeRedirectPath(searchParams?.get('redirect'));

    const [identifier, setIdentifier] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Save mock user for instant full account control
    const grantLocalAccess = (name: string, email: string) => {
        if (typeof window !== 'undefined') {
            const mockUser = {
                id: 'usr_' + Math.random().toString(36).substring(2, 9),
                email,
                user_metadata: { full_name: name },
                created_at: new Date().toISOString(),
            };
            localStorage.setItem('lumacv_local_user', JSON.stringify(mockUser));
        }
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        const isEmail = identifier.includes('@');
        const email = isEmail ? identifier : `${identifier}@lumacv.me`;

        try {
            if (supabase) {
                if (mode === 'signup') {
                    const emailRedirectTo = getAppUrl(`/auth/confirm?next=${encodeURIComponent(redirectUrl)}`);
                    const { error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            emailRedirectTo,
                            data: {
                                full_name: fullName.trim() || identifier,
                                // Only a real chosen username, never the email itself
                                username: isEmail ? null : identifier.trim(),
                            },
                        },
                    });
                    if (error) throw error;
                    notify.success('Account created', 'Welcome to LumaCV');
                } else {
                    // A bare username has no fixed relationship to its account email,
                    // look it up rather than guessing the old `@lumacv.me` convention.
                    let loginEmail = email;
                    if (!isEmail) {
                        const res = await fetch('/api/v1/auth/resolve-username', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: identifier.trim() }),
                        });
                        const body = await res.json();
                        if (!res.ok) throw new Error(body.error || 'No account found for that username.');
                        loginEmail = body.email;
                    }
                    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
                    if (error) throw error;
                    notify.success('Signed in', 'Welcome back');
                }
            } else {
                // Standalone local offline mode: gives user immediate full account control
                grantLocalAccess(fullName.trim() || identifier.split('@')[0], email);
                notify.success(mode === 'signup' ? 'Account created' : 'Signed in', 'Access granted with full control');
            }
            router.push(redirectUrl);
            router.refresh();
        } catch (error) {
            // If Supabase fails (e.g. invalid credentials or network), offer fallback
            notify.error('Sign in failed', error instanceof Error ? error.message : 'Please check your details');
        } finally {
            setLoading(false);
        }
    };

    const handleInstantDemo = () => {
        setLoading(true);
        grantLocalAccess('Alex Morgan', 'alex.morgan@domain.com');
        notify.success('Demo account active', 'Loaded with sample resumes and templates');
        router.push(redirectUrl);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <form onSubmit={submit} className="space-y-4">
                {mode === 'signup' && (
                    <div className="space-y-1.5">
                        <Label htmlFor="auth-fullName" className="text-xs font-medium text-foreground">
                            Full Name
                        </Label>
                        <Input
                            id="auth-fullName"
                            name="name"
                            type="text"
                            autoComplete="name"
                            placeholder="Alex Morgan"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            disabled={loading}
                            className="h-9 text-sm rounded-md bg-background border border-border focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label htmlFor="auth-identifier" className="text-xs font-medium text-foreground">
                        Email Address
                    </Label>
                    <Input
                        id="auth-identifier"
                        name="identifier"
                        type="text"
                        autoComplete="section-login username webauthn"
                        placeholder="john.doe@example.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        disabled={loading}
                        className="h-9 text-sm rounded-md lowercase bg-background border border-border focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <p className="text-[11px] text-muted-foreground">
                        No email handy? A username works too.
                    </p>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="auth-password" className="text-xs font-medium text-foreground">
                            Password
                        </Label>
                        {mode === 'login' && (
                            <Link
                                href="/forgot-password"
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        )}
                    </div>
                    <div className="relative flex items-center">
                        <Input
                            id="auth-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete={mode === 'signup' ? 'new-password' : 'section-login current-password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={loading}
                            className="h-9 text-sm rounded-md pr-10 bg-background border border-border focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-9 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer mt-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="size-4 animate-spin mr-2" />
                            <span>Signing in...</span>
                        </>
                    ) : (
                        <span>{mode === 'signup' ? 'Create Account' : 'Sign in'}</span>
                    )}
                </Button>
            </form>

            {/* Instant Demo Access Pill */}
            <button
                type="button"
                onClick={handleInstantDemo}
                disabled={loading}
                className="w-full py-2 px-3 rounded-md border border-dashed border-border/80 bg-muted/20 hover:bg-muted/40 text-[11.5px] font-mono text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
                <Zap className="size-3 text-amber-400" />
                <span>One-click Demo Account (Full Control)</span>
            </button>
        </div>
    );
}
