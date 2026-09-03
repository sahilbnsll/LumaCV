"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
    const { supabase } = useAuth();
    const router = useRouter();
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
                const emailRedirectTo = `${window.location.origin}/auth/confirm?next=/dashboard`;
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
                router.push('/dashboard');
                router.refresh();
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success('Logged in successfully.');
                router.push('/dashboard');
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
                    <Label htmlFor="fullName" className="text-xs font-medium text-foreground">Full Name</Label>
                    <Input
                        id="fullName"
                        type="text"
                        placeholder="Jane Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-9 text-xs"
                    />
                </div>
            )}

            <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 text-xs"
                />
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium text-foreground">Password</Label>
                    {mode === 'login' && (
                        <Link
                            href="/forgot-password"
                            className="text-[11px] text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
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

            <Button
                type="submit"
                className="w-full h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm mt-2"
                disabled={loading}
            >
                <span>{loading ? 'Please wait…' : mode === 'signup' ? 'Create Free Account' : 'Sign In'}</span>
                {!loading && <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
        </form>
    );
}
