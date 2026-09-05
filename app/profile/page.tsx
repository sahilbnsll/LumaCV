"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User,
    Shield,
    CheckCircle2,
    LogOut,
    ArrowLeft,
    KeyRound,
    Lock,
    MessageSquareQuote,
    Star,
    Send,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedbackCard } from '@/components/ui/feedback-card';
import {
    UserApiKeys,
    getUserApiKeys,
    saveUserApiKeys,
    clearUserApiKeys,
    countConfiguredKeys,
    PROVIDER_AVAILABLE_MODELS
} from '@/lib/ai-keys';

import { toast } from 'sonner';

export default function ProfilePage() {
    const { user, supabase, signOut } = useAuth();

    const [name, setName] = useState(user?.user_metadata?.full_name || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [feedbackName, setFeedbackName] = useState(user?.user_metadata?.full_name || '');
    const [feedbackCompany, setFeedbackCompany] = useState('');
    const [feedbackEmail, setFeedbackEmail] = useState(user?.email || '');
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackType, setFeedbackType] = useState<'review' | 'feature' | 'bug' | 'general'>('review');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    useEffect(() => {
        if (user) {
            if (!name && user.user_metadata?.full_name) setName(user.user_metadata.full_name);
            if (!feedbackName && user.user_metadata?.full_name) setFeedbackName(user.user_metadata.full_name);
            if (!feedbackEmail && user.email) setFeedbackEmail(user.email);
        }
    }, [user, name, feedbackName, feedbackEmail]);

    const [userApiKeys, setUserApiKeys] = useState<UserApiKeys>({});

    useEffect(() => {
        setUserApiKeys(getUserApiKeys());
    }, []);

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackMessage.trim()) {
            toast.error("Please enter your feedback message.");
            return;
        }

        setFeedbackSubmitting(true);
        try {
            const res = await fetch('/api/v1/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: feedbackName || (user?.user_metadata?.full_name ?? 'Anonymous User'),
                    email: feedbackEmail || (user?.email ?? ''),
                    company: feedbackCompany,
                    rating: feedbackRating,
                    type: feedbackType,
                    message: feedbackMessage,
                }),
            });

            if (!res.ok) throw new Error('Feedback submission failed');

            setFeedbackSubmitted(true);
            toast.success("Thank you! Your feedback has been recorded.");
            setFeedbackMessage('');
            setFeedbackCompany('');
        } catch {
            toast.error("Failed to submit feedback. Please try again.");
        } finally {
            setFeedbackSubmitting(false);
        }
    };


    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !user) {
            toast.error('Authentication is not active in this session.');
            return;
        }
        setUpdatingProfile(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: name.trim() },
            });
            if (error) throw error;
            toast.success('Name updated successfully');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update name');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !user) {
            toast.error('Authentication is not active in this session.');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error) throw error;
            toast.success('Password updated successfully');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update password');
        } finally {
            setUpdatingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            <main className="flex-1 mx-auto max-w-2xl px-4 sm:px-6 py-8 w-full">
                {/* Back to Dashboard */}
                <div className="mb-6">
                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 -ml-2 cursor-pointer">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to My Resumes
                        </Link>
                    </Button>
                </div>

                <div className="border-b border-border/50 pb-5">
                    <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">Account & Security</h1>
                    <p className="mt-1 text-xs text-muted-foreground">Manage your credentials, authentication status, and active plan.</p>
                </div>

                <div className="mt-8 space-y-6">
                    {/* 1. Account & Identity */}
                    <div className="rounded-xl border border-border/70 bg-card p-6 space-y-5 shadow-sm">
                        <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold font-display text-foreground">Profile Information</h2>
                                <p className="text-[11px] text-muted-foreground">Your personal contact details</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateName} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Full Name"
                                    className="h-9 text-xs bg-muted/20 rounded-lg border-border/70"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    autoComplete="email"
                                    value={user?.email || 'guest@lumacv.local'}
                                    disabled
                                    className="h-9 text-xs bg-muted/30 text-muted-foreground cursor-not-allowed rounded-lg"
                                />
                                <span className="text-[10px] text-muted-foreground">
                                    Email is linked to your authentication provider.
                                </span>
                            </div>

                            {user && (
                                <div className="pt-1">
                                    <Button type="submit" size="sm" disabled={updatingProfile} className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 cursor-pointer">
                                        {updatingProfile ? 'Saving...' : 'Update Name'}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* 2. Change Password */}
                    {user && (
                        <div className="rounded-xl border border-border/70 bg-card p-6 space-y-5 shadow-sm">
                            <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                    <KeyRound className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold font-display text-foreground">Change Password</h2>
                                    <p className="text-[11px] text-muted-foreground">Update your account login password</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="new-password" text-xs>New Password</Label>
                                        <Input
                                            id="new-password"
                                            name="password"
                                            autoComplete="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-9 text-xs bg-muted/20 rounded-lg border-border/70"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="confirm-password" text-xs>Confirm New Password</Label>
                                        <Input
                                            id="confirm-password"
                                            name="confirmPassword"
                                            autoComplete="new-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-9 text-xs bg-muted/20 rounded-lg border-border/70"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={updatingPassword || !newPassword}
                                    className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 cursor-pointer"
                                >
                                    {updatingPassword ? 'Updating...' : 'Update Password'}
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* 3. AI Provider Keys (BYOK) */}
                    <div id="api-keys" className="rounded-xl border border-border/70 bg-card p-6 space-y-5 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-border/40">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                    <KeyRound className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-sm font-semibold text-foreground">AI Provider Keys (BYOK)</h2>
                                        {countConfiguredKeys(userApiKeys) > 0 && (
                                            <span className="rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.2 text-[10px] font-bold">
                                                {countConfiguredKeys(userApiKeys)} Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">Bring Your Own Key to use your personal quotas</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04] p-3 text-xs text-muted-foreground flex items-start gap-2.5">
                            <Shield className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold text-foreground block">Zero Server Storage</span>
                                <span>Keys are kept strictly in your local browser storage and transmitted via encrypted headers directly to LLM runtimes. If left blank, LumaCV uses default system quotas.</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-1">
                            {/* Google Gemini */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-muted/15 border border-border/50">
                                <div className="flex items-center justify-between text-xs">
                                    <Label htmlFor="gemini-key" className="font-medium">Google Gemini Key</Label>
                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline">
                                        Get Gemini Key ↗
                                    </a>
                                </div>
                                <Input
                                    id="gemini-key"
                                    type="password"
                                    placeholder="AIzaSy..."
                                    value={userApiKeys.gemini || ''}
                                    onChange={(e) => setUserApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                                    className="h-8 text-xs font-mono bg-background"
                                />

                                {userApiKeys.gemini?.trim() ? (
                                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/40">
                                        <span className="text-[11px] font-medium text-foreground">Selected Model:</span>
                                        <select
                                            value={userApiKeys.geminiModel || PROVIDER_AVAILABLE_MODELS.gemini[0]}
                                            onChange={(e) => setUserApiKeys(prev => ({ ...prev, geminiModel: e.target.value }))}
                                            className="h-7 text-[11px] rounded-md border border-border bg-background px-2 font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                                        >
                                            {PROVIDER_AVAILABLE_MODELS.gemini.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                                        <Lock className="h-3 w-3 text-muted-foreground/60" />
                                        <span>Free tier model: <strong>gemini-2.5-flash</strong></span>
                                    </div>
                                )}
                            </div>

                            {/* OpenAI */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-muted/15 border border-border/50">
                                <div className="flex items-center justify-between text-xs">
                                    <Label htmlFor="openai-key" className="font-medium">OpenAI Key</Label>
                                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline">
                                        Get OpenAI Key ↗
                                    </a>
                                </div>
                                <Input
                                    id="openai-key"
                                    type="password"
                                    placeholder="sk-proj-..."
                                    value={userApiKeys.openai || ''}
                                    onChange={(e) => setUserApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                                    className="h-8 text-xs font-mono bg-background"
                                />

                                {userApiKeys.openai?.trim() ? (
                                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/40">
                                        <span className="text-[11px] font-medium text-foreground">Selected Model:</span>
                                        <select
                                            value={userApiKeys.openaiModel || PROVIDER_AVAILABLE_MODELS.openai[0]}
                                            onChange={(e) => setUserApiKeys(prev => ({ ...prev, openaiModel: e.target.value }))}
                                            className="h-7 text-[11px] rounded-md border border-border bg-background px-2 font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                                        >
                                            {PROVIDER_AVAILABLE_MODELS.openai.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                                        <Lock className="h-3 w-3 text-muted-foreground/60" />
                                        <span>Enter your key to unlock <strong>gpt-4o</strong>, <strong>gpt-4o-mini</strong>, <strong>o3-mini</strong></span>
                                    </div>
                                )}
                            </div>

                            {/* Anthropic Claude */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-muted/15 border border-border/50">
                                <div className="flex items-center justify-between text-xs">
                                    <Label htmlFor="anthropic-key" className="font-medium">Anthropic Claude Key</Label>
                                    <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline">
                                        Get Anthropic Key ↗
                                    </a>
                                </div>
                                <Input
                                    id="anthropic-key"
                                    type="password"
                                    placeholder="sk-ant-api03-..."
                                    value={userApiKeys.anthropic || ''}
                                    onChange={(e) => setUserApiKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                                    className="h-8 text-xs font-mono bg-background"
                                />

                                {userApiKeys.anthropic?.trim() ? (
                                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/40">
                                        <span className="text-[11px] font-medium text-foreground">Selected Model:</span>
                                        <select
                                            value={userApiKeys.anthropicModel || PROVIDER_AVAILABLE_MODELS.anthropic[0]}
                                            onChange={(e) => setUserApiKeys(prev => ({ ...prev, anthropicModel: e.target.value }))}
                                            className="h-7 text-[11px] rounded-md border border-border bg-background px-2 font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                                        >
                                            {PROVIDER_AVAILABLE_MODELS.anthropic.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                                        <Lock className="h-3 w-3 text-muted-foreground/60" />
                                        <span>Enter your key to unlock <strong>claude-3-5-sonnet</strong>, <strong>claude-3-5-haiku</strong></span>
                                    </div>
                                )}
                            </div>

                            {/* Groq Cloud */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-muted/15 border border-border/50">
                                <div className="flex items-center justify-between text-xs">
                                    <Label htmlFor="groq-key" className="font-medium">Groq Cloud Key</Label>
                                    <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline">
                                        Get Groq Key ↗
                                    </a>
                                </div>
                                <Input
                                    id="groq-key"
                                    type="password"
                                    placeholder="gsk_..."
                                    value={userApiKeys.groq || ''}
                                    onChange={(e) => setUserApiKeys(prev => ({ ...prev, groq: e.target.value }))}
                                    className="h-8 text-xs font-mono bg-background"
                                />

                                {userApiKeys.groq?.trim() ? (
                                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/40">
                                        <span className="text-[11px] font-medium text-foreground">Selected Model:</span>
                                        <select
                                            value={userApiKeys.groqModel || PROVIDER_AVAILABLE_MODELS.groq[0]}
                                            onChange={(e) => setUserApiKeys(prev => ({ ...prev, groqModel: e.target.value }))}
                                            className="h-7 text-[11px] rounded-md border border-border bg-background px-2 font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                                        >
                                            {PROVIDER_AVAILABLE_MODELS.groq.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                                        <Lock className="h-3 w-3 text-muted-foreground/60" />
                                        <span>Free tier model: <strong>qwen/qwen3.6-27b</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    clearUserApiKeys();
                                    setUserApiKeys({});
                                    toast.info('Cleared custom AI keys');
                                }}
                                className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            >
                                Clear Keys
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    saveUserApiKeys(userApiKeys);
                                    const count = countConfiguredKeys(userApiKeys);
                                    if (count > 0) {
                                        toast.success(`Saved ${count} custom AI key${count > 1 ? 's' : ''} to browser storage`);
                                    } else {
                                        toast.info('Using default system quotas');
                                    }
                                }}
                                className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                            >
                                Save AI Keys
                            </Button>
                        </div>
                    </div>

                    {/* 4. Authentication Status & Current Plan */}
                    <div className="rounded-xl border border-border/70 bg-card p-6 space-y-4 shadow-sm">
                        <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                <Shield className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold font-display text-foreground">Authentication & Plan</h2>
                                <p className="text-[11px] text-muted-foreground">Account tier and session status</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                                <span className="text-muted-foreground text-[10px] block">Authentication Status</span>
                                <div className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span>{user ? 'Authenticated User' : 'Local Guest Session'}</span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                                <span className="text-muted-foreground text-[10px] block">Active Plan</span>
                                <div className="mt-1 flex items-center gap-1.5 font-medium text-foreground">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Launch Pioneer (Full Access Free)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Community Feedback & Suggestions */}
                    <div id="feedback" className="rounded-xl border border-border/70 bg-card p-6 space-y-5 shadow-sm scroll-mt-20">
                        <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                                <MessageSquareQuote className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold font-display text-foreground">Feedback & Suggestions</h2>
                                <p className="text-[11px] text-muted-foreground">Share your ideas, report bugs, or leave a review for the open-source community</p>
                            </div>
                        </div>

                        {/* Quick Interactive Emoji Reaction */}
                        <div className="flex justify-center pb-1">
                            <FeedbackCard questionText="Quick Impression:" className="w-full max-w-sm bg-muted/20 border-border/60" />
                        </div>

                        {feedbackSubmitted ? (
                            <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-3">
                                <CheckCircle2 className="h-7 w-7 text-emerald-500 mx-auto" />
                                <h3 className="font-display font-semibold text-sm text-foreground">Feedback Logged!</h3>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    Thank you! Your submission has been saved directly to our roadmap queue.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFeedbackSubmitted(false)}
                                    className="h-7 text-xs font-medium cursor-pointer"
                                >
                                    Submit Another Note
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Your Name</Label>
                                        <Input
                                            type="text"
                                            value={feedbackName}
                                            onChange={(e) => setFeedbackName(e.target.value)}
                                            placeholder="e.g. Alex Chen"
                                            className="h-9 text-xs bg-muted/20 rounded-lg border-border/70"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Company / Role</Label>
                                        <Input
                                            type="text"
                                            value={feedbackCompany}
                                            onChange={(e) => setFeedbackCompany(e.target.value)}
                                            placeholder="e.g. Acme Corp / Engineer"
                                            className="h-9 text-xs bg-muted/20 rounded-lg border-border/70"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Email</Label>
                                        <Input
                                            type="email"
                                            value={feedbackEmail}
                                            onChange={(e) => setFeedbackEmail(e.target.value)}
                                            placeholder="For replies (optional)"
                                            className="h-9 text-xs bg-muted/20 rounded-lg border-border/70"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Category</Label>
                                        <div className="grid grid-cols-4 gap-1 p-1 h-9 items-center rounded-lg border border-border/70 bg-muted/20">
                                            {[
                                                { id: 'review', label: 'Review' },
                                                { id: 'feature', label: 'Feature' },
                                                { id: 'bug', label: 'Bug' },
                                                { id: 'general', label: 'General' },
                                            ].map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setFeedbackType(cat.id as 'review' | 'feature' | 'bug' | 'general')}
                                                    className={cn(
                                                        "h-7 rounded-md text-[11px] font-medium transition-all text-center flex items-center justify-center cursor-pointer",
                                                        feedbackType === cat.id
                                                            ? "bg-background text-foreground font-semibold shadow-xs border border-border/60"
                                                            : "text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Rating</Label>
                                        <div className="flex items-center justify-between px-3 h-9 rounded-lg border border-border/70 bg-muted/20">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setFeedbackRating(star)}
                                                        className="p-0.5 text-muted-foreground hover:text-amber-400 transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                                                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                                    >
                                                        <Star
                                                            className={cn(
                                                                "h-3.5 w-3.5 transition-colors",
                                                                star <= feedbackRating
                                                                    ? "text-amber-400 fill-amber-400"
                                                                    : "text-muted-foreground/30 dark:text-neutral-700"
                                                            )}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono text-[10px] font-semibold">
                                                {feedbackRating} / 5 Stars
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Your Feedback or Details</Label>
                                        <span className="text-[10px] text-muted-foreground">Markdown supported</span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={feedbackMessage}
                                        onChange={(e) => setFeedbackMessage(e.target.value)}
                                        placeholder="Tell us what you like, report bugs, or recommend features/templates..."
                                        required
                                        className="w-full min-h-[90px] rounded-lg border border-border/70 bg-muted/20 p-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-y leading-relaxed"
                                    />
                                </div>

                                <div className="pt-1 flex items-center justify-between border-t border-border/40">
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        <span>Directly reviewed by maintainers</span>
                                    </span>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={feedbackSubmitting}
                                        className="h-8 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-lg shadow-xs cursor-pointer"
                                    >
                                        <Send className="h-3 w-3" />
                                        <span>{feedbackSubmitting ? 'Sending...' : 'Submit Feedback'}</span>
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* 6. Sign Out */}
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-semibold font-display text-foreground">Session Control</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Sign out of your active LumaCV account.</p>
                        </div>

                        {user ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => signOut()}
                                className="h-8 text-xs text-red-500 hover:bg-red-500/10 border-red-500/30 gap-1.5 shrink-0 cursor-pointer"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Sign Out</span>
                            </Button>
                        ) : (
                            <Button asChild size="sm" className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 cursor-pointer">
                                <Link href="/login">Sign In</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
