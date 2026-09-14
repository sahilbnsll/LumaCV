"use client";

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { AppHeader } from '@/components/app-header';
import { EditorialFooter } from '@/components/landing/editorial-footer';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    User,
    Check,
    CheckCircle2,
    KeyRound,
    Shield,
    ShieldCheck,
    LogOut,
    ArrowLeft,
    ArrowUpRight,
    Download,
    Eye,
    EyeOff,
    FileCode2,
    LayoutDashboard,
    Target,
    Palette,
    Wand2,
    Briefcase,
    SlidersHorizontal,
    Trash2,
    RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notify } from '@/lib/notify';
import { ALL_TEMPLATES } from '@/lib/templates-data';
import { getLocalResumes } from '@/lib/user-resumes-store';
import { AVATAR_OPTIONS, getAvatarUrl } from '@/lib/avatar-options';
import {
    UserApiKeys,
    getUserApiKeys,
    saveUserApiKeys,
    clearUserApiKeys,
    countConfiguredKeys,
    PROVIDER_AVAILABLE_MODELS
} from '@/lib/ai-keys';

type SettingsTab = 'profile' | 'preferences' | 'authentication' | 'api-keys' | 'data';

// Navigation groups for LumaCV app
const APP_NAV_ITEMS = [
    {
        id: 'resumes',
        title: 'Resumes',
        href: '/dashboard',
        icon: LayoutDashboard,
        badge: 'Vault',
    },
    {
        id: 'editor',
        title: 'Resume Editor',
        href: '/editor',
        icon: FileCode2,
        badge: 'Typst',
    },
    {
        id: 'ats',
        title: 'ATS Checker',
        href: '/ats',
        icon: Target,
        badge: 'Audit',
    },
    {
        id: 'templates',
        title: 'Templates',
        href: '/templates',
        icon: Palette,
        badge: '52+',
    },
    {
        id: 'builder',
        title: 'AI Tailoring',
        href: '/builder',
        icon: Wand2,
        badge: 'AI',
    },
    {
        id: 'applications',
        title: 'Job Tracker',
        href: '/applications',
        icon: Briefcase,
        badge: 'Pipeline',
    },
];

const SETTINGS_NAV_ITEMS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
    { id: 'authentication', label: 'Authentication', icon: ShieldCheck },
    { id: 'api-keys', label: 'API Keys', icon: KeyRound },
    { id: 'data', label: 'Data & Privacy', icon: Download },
];

function ProfileWorkstationContent() {
    const { user, supabase, signOut, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const { theme } = useTheme();
    const [, startTransition] = useTransition();

    // Active tab management (supports URL query sync ?tab=)
    const initialTab = (searchParams.get('tab') as SettingsTab) || 'profile';
    const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

    useEffect(() => {
        const paramTab = searchParams.get('tab') as SettingsTab;
        if (paramTab && ['profile', 'preferences', 'authentication', 'api-keys', 'data'].includes(paramTab)) {
            setActiveTab(paramTab);
        }
    }, [searchParams]);

    const handleTabChange = (tab: SettingsTab) => {
        setActiveTab(tab);
        startTransition(() => {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url.toString());
        });
    };

    // -------------------------------------------------------------
    // TAB 1: PROFILE STATE & DIRTY TRACKING
    // -------------------------------------------------------------
    const initialName = user?.user_metadata?.full_name || '';
    const initialUsername =
        user?.user_metadata?.username ||
        (user?.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '') : 'user');

    const initialAvatarId: string | null = user?.user_metadata?.avatar_id || null;

    const [name, setName] = useState(initialName);
    const [username, setUsername] = useState(initialUsername);
    const [avatarId, setAvatarId] = useState<string | null>(initialAvatarId);
    const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
    const [profileSaveState, setProfileSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    useEffect(() => {
        if (user) {
            if (user.user_metadata?.full_name) setName(user.user_metadata.full_name);
            if (user.user_metadata?.username) setUsername(user.user_metadata.username);
            setAvatarId(user.user_metadata?.avatar_id || null);
        }
    }, [user]);

    const isProfileDirty = name !== initialName || username !== initialUsername || avatarId !== initialAvatarId;

    const handleProfileCancel = () => {
        setName(initialName);
        setUsername(initialUsername);
        setAvatarId(initialAvatarId);
        setProfileSaveState('idle');
    };

    const handleProfileSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!name.trim()) {
            notify.error('Missing name', 'Please enter your full name');
            return;
        }

        setProfileSaveState('saving');

        try {
            if (supabase && user) {
                const { error } = await supabase.auth.updateUser({
                    data: {
                        full_name: name.trim(),
                        username: username.trim().toLowerCase(),
                        avatar_id: avatarId,
                    },
                });
                if (error) throw error;

                // The `handle_new_user` DB trigger that populates public.profiles
                // only fires on signup (auth.users INSERT), not on later
                // auth.updateUser() calls, so username/avatar changes here also
                // need to reach public.profiles directly, or username login
                // (which reads from public.profiles) silently keeps resolving
                // the old value.
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: name.trim(),
                        username: username.trim().toLowerCase(),
                        avatar_id: avatarId,
                    })
                    .eq('id', user.id);
                if (profileError) throw profileError;
            } else {
                // Local guest session save
                localStorage.setItem('lumacv_guest_name', name.trim());
                localStorage.setItem('lumacv_guest_username', username.trim().toLowerCase());
                if (avatarId) localStorage.setItem('lumacv_guest_avatar_id', avatarId);
                else localStorage.removeItem('lumacv_guest_avatar_id');
            }

            setProfileSaveState('saved');
            notify.saved('Profile information updated');
            setTimeout(() => setProfileSaveState('idle'), 2500);
        } catch (err) {
            setProfileSaveState('error');
            notify.error("Couldn't update profile", err instanceof Error ? err.message : undefined);
            setTimeout(() => setProfileSaveState('idle'), 3000);
        }
    };

    // -------------------------------------------------------------
    // TAB 2: PREFERENCES STATE
    // -------------------------------------------------------------
    const [autoCompile, setAutoCompile] = useState(true);
    const [atsSafeMode, setAtsSafeMode] = useState(true);
    const [defaultTemplate, setDefaultTemplate] = useState('modern');
    const [exportFormat, setExportFormat] = useState<'pdf' | 'typst'>('pdf');

    useEffect(() => {
        try {
            const savedAuto = localStorage.getItem('lumacv_pref_autocompile');
            if (savedAuto !== null) setAutoCompile(savedAuto === 'true');
            const savedAts = localStorage.getItem('lumacv_pref_atssafe');
            if (savedAts !== null) setAtsSafeMode(savedAts === 'true');
            const savedTpl = localStorage.getItem('lumacv_pref_default_template');
            if (savedTpl) setDefaultTemplate(savedTpl);
            const savedFmt = localStorage.getItem('lumacv_pref_exportformat');
            if (savedFmt === 'pdf' || savedFmt === 'typst') setExportFormat(savedFmt);
        } catch {}
    }, []);

    const handleSavePreferences = (
        updatedVals: Partial<{
            autoCompile: boolean;
            atsSafeMode: boolean;
            defaultTemplate: string;
            exportFormat: 'pdf' | 'typst';
        }>
    ) => {
        try {
            const nextAuto = updatedVals.autoCompile !== undefined ? updatedVals.autoCompile : autoCompile;
            const nextAts = updatedVals.atsSafeMode !== undefined ? updatedVals.atsSafeMode : atsSafeMode;
            const nextTpl = updatedVals.defaultTemplate !== undefined ? updatedVals.defaultTemplate : defaultTemplate;
            const nextFmt = updatedVals.exportFormat !== undefined ? updatedVals.exportFormat : exportFormat;

            if (updatedVals.autoCompile !== undefined) setAutoCompile(nextAuto);
            if (updatedVals.atsSafeMode !== undefined) setAtsSafeMode(nextAts);
            if (updatedVals.defaultTemplate !== undefined) setDefaultTemplate(nextTpl);
            if (updatedVals.exportFormat !== undefined) setExportFormat(nextFmt);

            localStorage.setItem('lumacv_pref_autocompile', String(nextAuto));
            localStorage.setItem('lumacv_pref_atssafe', String(nextAts));
            localStorage.setItem('lumacv_pref_default_template', nextTpl);
            localStorage.setItem('lumacv_pref_exportformat', nextFmt);

            notify.saved('Preferences updated');
        } catch {
            notify.error("Couldn't save preferences", 'Local storage write error');
        }
    };

    // -------------------------------------------------------------
    // TAB 3: AUTHENTICATION / PASSWORD STATE
    // -------------------------------------------------------------
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [passwordSaveState, setPasswordSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !user) {
            notify.error('Sign in required', 'Password update requires a signed-in account');
            return;
        }
        if (newPassword.length < 6) {
            notify.error('Password too short', 'Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            notify.error('Password mismatch', 'Passwords do not match');
            return;
        }

        setUpdatingPassword(true);
        setPasswordSaveState('saving');
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error) throw error;

            setPasswordSaveState('saved');
            notify.saved('Password successfully updated');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSaveState('idle'), 2500);
        } catch (err) {
            setPasswordSaveState('error');
            notify.error("Couldn't update password", err instanceof Error ? err.message : undefined);
            setTimeout(() => setPasswordSaveState('idle'), 3000);
        } finally {
            setUpdatingPassword(false);
        }
    };

    // -------------------------------------------------------------
    // TAB 4: AI PROVIDER KEYS (BYOK) STATE
    // -------------------------------------------------------------
    const [userApiKeys, setUserApiKeys] = useState<UserApiKeys>({});
    const [showKeyVisibility, setShowKeyVisibility] = useState<Record<string, boolean>>({});
    const [keysSavedState, setKeysSavedState] = useState<'idle' | 'saved'>('idle');

    useEffect(() => {
        setUserApiKeys(getUserApiKeys());
    }, []);

    const activeKeysCount = countConfiguredKeys(userApiKeys);

    const handleSaveAiKeys = () => {
        saveUserApiKeys(userApiKeys);
        const count = countConfiguredKeys(userApiKeys);
        setKeysSavedState('saved');
        if (count > 0) {
            notify.saved(`${count} custom AI provider key${count > 1 ? 's' : ''} stored`);
        } else {
            notify.info('Default quotas active', 'Using standard free-tier quotas');
        }
        setTimeout(() => setKeysSavedState('idle'), 2000);
    };

    const handleClearAiKeys = () => {
        clearUserApiKeys();
        setUserApiKeys({});
        notify.info('AI keys cleared', 'Reset to system default quotas');
    };

    // -------------------------------------------------------------
    // TAB 5: DATA & PRIVACY STATE
    // -------------------------------------------------------------
    const [isExporting, setIsExporting] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const handleExportData = () => {
        setIsExporting(true);
        try {
            const localResumes = getLocalResumes();
            const exportPayload = {
                exportedAt: new Date().toISOString(),
                software: 'LumaCV',
                profile: {
                    name: name || user?.user_metadata?.full_name || 'Guest User',
                    username,
                    email: user?.email || 'guest@lumacv.local',
                },
                preferences: {
                    theme,
                    autoCompile,
                    atsSafeMode,
                    defaultTemplate,
                    exportFormat,
                },
                resumesCount: localResumes.length,
                resumes: localResumes,
            };

            const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lumacv-account-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            notify.saved('Account data exported as JSON');
        } catch {
            notify.error('Export failed', 'Could not generate backup file');
        } finally {
            setIsExporting(false);
        }
    };

    const handleClearLocalData = () => {
        try {
            localStorage.removeItem('lumacv_resumes');
            localStorage.removeItem('lumacv_pref_autocompile');
            localStorage.removeItem('lumacv_pref_atssafe');
            localStorage.removeItem('lumacv_pref_default_template');
            localStorage.removeItem('lumacv_pref_exportformat');
            clearUserApiKeys();
            setUserApiKeys({});
            setShowClearConfirm(false);
            notify.saved('Local storage and cache cleared');
        } catch {
            notify.error('Clear failed', 'Unable to reset local storage');
        }
    };

    // User Monogram Initials
    const initials = (name || user?.email || 'User')
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    // Loading Skeleton
    if (authLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
                <AppHeader />
                <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                    <div className="flex gap-8">
                        <div className="w-64 space-y-3 hidden lg:block">
                            <div className="h-10 bg-muted/40 rounded-lg animate-pulse" />
                            <div className="h-10 bg-muted/40 rounded-lg animate-pulse" />
                            <div className="h-10 bg-muted/40 rounded-lg animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-6">
                            <div className="h-24 bg-muted/30 rounded-2xl animate-pulse" />
                            <div className="h-64 bg-muted/20 rounded-2xl animate-pulse" />
                        </div>
                    </div>
                </main>
                <EditorialFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            <div className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
                {/* Top Bar with Back Link */}
                <div className="mb-4 flex items-center">
                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 -ml-2 cursor-pointer">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back to Resumes</span>
                        </Link>
                    </Button>
                </div>

                {/* Main 2-Column Workstation Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* ------------------------------------------------------------- */}
                    {/* LEFT COLUMN: FIXED WORKSTATION SIDEBAR                        */}
                    {/* ------------------------------------------------------------- */}
                    <aside className="lg:col-span-3 space-y-6">
                        {/* User Identity Snippet with Direct Sign Out (Top-Left) */}
                        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                    {avatarId && getAvatarUrl(avatarId) ? (
                                        <img
                                            src={getAvatarUrl(avatarId)!}
                                            alt=""
                                            className="size-11 rounded-xl border border-primary/30 shadow-2xs bg-muted/30"
                                        />
                                    ) : (
                                        <div className="size-11 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center font-display font-bold text-sm shadow-2xs">
                                            {initials}
                                        </div>
                                    )}
                                    <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
                                        <Check className="size-2 text-white stroke-[3]" />
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-foreground truncate">
                                        {name || (user ? 'Authenticated' : 'Guest Workstation')}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate font-mono">
                                        {user?.email || 'guest@lumacv.local'}
                                    </p>
                                </div>
                            </div>

                            {user ? (
                                <button
                                    type="button"
                                    onClick={() => signOut()}
                                    className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl text-xs font-medium text-rose-500 hover:text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer shadow-2xs"
                                    title="Sign out of your account"
                                >
                                    <LogOut className="size-3.5" />
                                    <span>Sign Out</span>
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs transition-colors"
                                >
                                    <span>Sign In / Register</span>
                                </Link>
                            )}
                        </div>

                        {/* Settings Subnav Tabs */}
                        <div className="rounded-2xl border border-border/70 bg-card p-2 shadow-xs space-y-1">
                            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                                Settings
                            </div>
                            {SETTINGS_NAV_ITEMS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => handleTabChange(tab.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
                                            isActive
                                                ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className={cn("size-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                                            <span>{tab.label}</span>
                                        </div>
                                        {tab.id === 'api-keys' && activeKeysCount > 0 && (
                                            <span className={cn(
                                                "text-[10px] font-bold px-1.5 py-0.2 rounded-full border font-mono",
                                                isActive ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                            )}>
                                                {activeKeysCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}

                            {user && (
                                <>
                                    <div className="my-1 border-t border-border/40" />
                                    <button
                                        type="button"
                                        onClick={() => signOut()}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
                                        title="Sign out of your account"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <LogOut className="size-4 text-rose-500" />
                                            <span>Sign Out</span>
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* App Workspaces Group (Direct links matching screenshot) */}
                        <div className="rounded-2xl border border-border/70 bg-card p-2 shadow-xs space-y-1">
                            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                                App Workspaces
                            </div>
                            {APP_NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className="group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span>{item.title}</span>
                                        </div>
                                        <ArrowUpRight className="size-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Open Source License / MIT credit */}
                        <div className="p-3 text-[11px] text-muted-foreground/80 leading-relaxed border-t border-border/40">
                            <p className="font-semibold text-foreground/90">LumaCV Studio</p>
                            <p className="mt-0.5">Licensed under MIT. Open-source Typst document engine.</p>
                            <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                                <span>v2.8.0</span>
                                <span>●</span>
                                <Link href="https://github.com/sahilbnsll/LumaCV" target="_blank" className="hover:text-primary underline">
                                    GitHub
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* ------------------------------------------------------------- */}
                    {/* RIGHT COLUMN: FOCUSED ACTIVE SETTINGS TAB PANE                */}
                    {/* ------------------------------------------------------------- */}
                    <main className="lg:col-span-9 min-w-0">
                        {/* Mobile horizontal pill navigation */}
                        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
                            {SETTINGS_NAV_ITEMS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => handleTabChange(tab.id)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                                            isActive
                                                ? "bg-primary text-primary-foreground border-primary font-semibold"
                                                : "bg-card text-muted-foreground border-border/70 hover:bg-muted/50"
                                        )}
                                    >
                                        <Icon className="size-3.5" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* --------------------------------------------------------- */}
                        {/* TAB 1: PROFILE (Personal Information, Username, Email)    */}
                        {/* --------------------------------------------------------- */}
                        {activeTab === 'profile' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6 max-w-2xl"
                            >
                                <div className="border-b border-border/50 pb-4">
                                    <h1 className="text-xl font-bold font-display tracking-tight text-foreground flex items-center gap-2">
                                        <User className="size-5 text-primary" />
                                        <span>Profile Information</span>
                                    </h1>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Update your personal details, public display handle, and account identity.
                                    </p>
                                </div>

                                <form onSubmit={handleProfileSave} className="space-y-5">
                                    {/* Avatar Control */}
                                    <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4">
                                        <Label className="text-xs font-semibold text-foreground">Avatar</Label>
                                        <div className="flex items-center gap-4">
                                            {avatarId && getAvatarUrl(avatarId) ? (
                                                <img
                                                    src={getAvatarUrl(avatarId)!}
                                                    alt=""
                                                    className="size-16 rounded-2xl border-2 border-primary/20 shadow-xs bg-muted/30"
                                                />
                                            ) : (
                                                <div className="size-16 rounded-2xl bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center font-display font-bold text-xl shadow-xs">
                                                    {initials}
                                                </div>
                                            )}
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-medium text-foreground">
                                                    {avatarId ? 'Custom avatar selected' : 'Auto-generated Monogram'}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    {avatarId
                                                        ? 'Shown in the header and account menu instead of your initials.'
                                                        : 'Derived automatically from your full name initials for clean document stamping and header identity.'}
                                                </p>
                                                <div className="flex items-center gap-2 pt-0.5">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setAvatarPickerOpen(true)}
                                                        className="h-7 text-[11px] px-2.5 rounded-lg cursor-pointer"
                                                    >
                                                        {avatarId ? 'Change Avatar' : 'Choose Avatar'}
                                                    </Button>
                                                    {avatarId && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setAvatarId(null)}
                                                            className="h-7 text-[11px] px-2.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                                                        >
                                                            Use Initials
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Avatar Picker Dialog: a fixed, curated set of 24 predefined
                                        avatars (DiceBear "Notionists" style, MIT licensed), bundled
                                        as static SVGs, not generated per-user, so the same 24 options
                                        are offered to everyone rather than an infinite random space. */}
                                    <Dialog open={avatarPickerOpen} onOpenChange={setAvatarPickerOpen}>
                                        <DialogContent className="max-w-md rounded-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-sm font-bold">Choose an avatar</DialogTitle>
                                                <DialogDescription className="text-xs">
                                                    Pick one of {AVATAR_OPTIONS.length} predefined avatars, or keep your initials.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 py-2 max-h-[360px] overflow-y-auto">
                                                {AVATAR_OPTIONS.map((avatar) => {
                                                    const isSelected = avatarId === avatar.id;
                                                    return (
                                                        <button
                                                            key={avatar.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setAvatarId(avatar.id);
                                                                setAvatarPickerOpen(false);
                                                            }}
                                                            className={cn(
                                                                "relative aspect-square rounded-xl border-2 p-1 transition-all cursor-pointer hover:scale-105",
                                                                isSelected ? "border-primary ring-2 ring-primary/30" : "border-border/60 hover:border-primary/40"
                                                            )}
                                                            aria-label={`Avatar option ${avatar.id}`}
                                                            aria-pressed={isSelected}
                                                        >
                                                            <img src={avatar.url} alt="" className="w-full h-full rounded-lg bg-muted/30" />
                                                            {isSelected && (
                                                                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
                                                                    <Check className="size-2.5 stroke-[3]" />
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setAvatarId(null);
                                                        setAvatarPickerOpen(false);
                                                    }}
                                                    className="text-xs cursor-pointer"
                                                >
                                                    Use Initials Instead
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Name & Username */}
                                    <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="profile-name" className="text-xs font-medium">
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="profile-name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="John Doe"
                                                    className="h-9 text-xs bg-muted/20 rounded-xl border-border/70 focus-visible:ring-primary"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="profile-username" className="text-xs font-medium">
                                                    Username Handle
                                                </Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-mono">@</span>
                                                    <Input
                                                        id="profile-username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                                                        placeholder="johndoe"
                                                        className="h-9 text-xs pl-7 font-mono bg-muted/20 rounded-xl border-border/70 lowercase"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Email Address */}
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="profile-email" className="text-xs font-medium">
                                                    Email Address
                                                </Label>
                                                {user?.email ? (
                                                    <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                                                        <CheckCircle2 className="size-3" />
                                                        <span>Verified</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-amber-500 font-medium">
                                                        Guest Session
                                                    </span>
                                                )}
                                            </div>
                                            <Input
                                                id="profile-email"
                                                value={user?.email || 'guest@lumacv.local'}
                                                disabled
                                                className="h-9 text-xs bg-muted/30 text-muted-foreground cursor-not-allowed rounded-xl"
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                                Email is linked directly to your authentication provider.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dirty Save State Bar */}
                                    <AnimatePresence>
                                        {isProfileDirty && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 6 }}
                                                transition={{ duration: 0.15 }}
                                                className="flex items-center justify-end gap-2.5 pt-2"
                                            >
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleProfileCancel}
                                                    className="h-8.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    Cancel
                                                </Button>

                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    disabled={profileSaveState === 'saving'}
                                                    className="h-8.5 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-2xs cursor-pointer rounded-xl"
                                                >
                                                    {profileSaveState === 'saving' ? (
                                                        <>
                                                            <span className="size-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                                            <span>Saving...</span>
                                                        </>
                                                    ) : profileSaveState === 'saved' ? (
                                                        <>
                                                            <Check className="size-3.5 stroke-[3]" />
                                                            <span>Saved</span>
                                                        </>
                                                    ) : profileSaveState === 'error' ? (
                                                        <>
                                                            <RotateCcw className="size-3.5" />
                                                            <span>Retry</span>
                                                        </>
                                                    ) : (
                                                        <span>Save Changes</span>
                                                    )}
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </motion.div>
                        )}

                        {/* --------------------------------------------------------- */}
                        {/* TAB 2: PREFERENCES (Theme, Resume Defaults, Auto-compile) */}
                        {/* --------------------------------------------------------- */}
                        {activeTab === 'preferences' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6 max-w-2xl"
                            >
                                <div className="border-b border-border/50 pb-4">
                                    <h1 className="text-xl font-bold font-display tracking-tight text-foreground flex items-center gap-2">
                                        <SlidersHorizontal className="size-5 text-primary" />
                                        <span>Studio Preferences</span>
                                    </h1>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Configure editor aesthetics, default typst archetypes, and compiler behaviors.
                                    </p>
                                </div>

                                {/* 1. Appearance / Theme (Visual Cards) */}
                                <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3.5">
                                    <div>
                                        <Label className="text-xs font-semibold text-foreground">Appearance Theme</Label>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Select interface color scheme or match system device settings.
                                        </p>
                                    </div>

                                    <ThemeToggle variant="cards" />
                                </div>

                                {/* 2. Typst Resume Defaults */}
                                <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4">
                                    <Label className="text-xs font-semibold text-foreground">Typst Resume Defaults</Label>

                                    {/* Default Template */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="pref-template" className="text-xs font-medium">
                                            Default Blueprint Template
                                        </Label>
                                        <select
                                            id="pref-template"
                                            value={defaultTemplate}
                                            onChange={(e) => handleSavePreferences({ defaultTemplate: e.target.value })}
                                            className="w-full h-9 text-xs rounded-xl border border-border/70 bg-background px-3 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                                        >
                                            {ALL_TEMPLATES.map((tmpl) => (
                                                <option key={tmpl.id} value={tmpl.id}>
                                                    {tmpl.name} ({tmpl.categoryLabel})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Default Export Format */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium">Default Download Format</Label>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            {[
                                                { id: 'pdf', label: 'PDF Vector Document' },
                                                { id: 'typst', label: 'Typst Source Code (.typ)' },
                                            ].map((fmt) => (
                                                <button
                                                    key={fmt.id}
                                                    type="button"
                                                    onClick={() => handleSavePreferences({ exportFormat: fmt.id as 'pdf' | 'typst' })}
                                                    className={cn(
                                                        "h-9 px-3 rounded-xl border text-xs font-medium transition-all text-center flex items-center justify-center cursor-pointer",
                                                        exportFormat === fmt.id
                                                            ? "border-primary bg-primary/10 text-primary font-semibold shadow-2xs"
                                                            : "border-border/70 bg-muted/20 text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    {fmt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Compiler Behaviors */}
                                <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3">
                                    <Label className="text-xs font-semibold text-foreground">Compiler & Audit Behavior</Label>

                                    <div className="space-y-2.5">
                                        {/* Auto-compile switch */}
                                        <label className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/50 cursor-pointer">
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-medium text-foreground block">
                                                    Live Typst Auto-Compilation
                                                </span>
                                                <span className="text-[11px] text-muted-foreground block">
                                                    Recompile PDF instantly on keystrokes in the document editor
                                                </span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={autoCompile}
                                                onChange={(e) => handleSavePreferences({ autoCompile: e.target.checked })}
                                                className="size-4 rounded-sm border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                                            />
                                        </label>

                                        {/* ATS Guard switch */}
                                        <label className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/50 cursor-pointer">
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-medium text-foreground block">
                                                    ATS Diagnostic Safety Checks
                                                </span>
                                                <span className="text-[11px] text-muted-foreground block">
                                                    Flag non-standard glyphs, unparseable tables, and multi-column risks
                                                </span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={atsSafeMode}
                                                onChange={(e) => handleSavePreferences({ atsSafeMode: e.target.checked })}
                                                className="size-4 rounded-sm border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* --------------------------------------------------------- */}
                        {/* TAB 3: AUTHENTICATION & SECURITY                          */}
                        {/* --------------------------------------------------------- */}
                        {activeTab === 'authentication' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6 max-w-2xl"
                            >
                                <div className="border-b border-border/50 pb-4">
                                    <h1 className="text-xl font-bold font-display tracking-tight text-foreground flex items-center gap-2">
                                        <ShieldCheck className="size-5 text-primary" />
                                        <span>Authentication & Security</span>
                                    </h1>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Manage your account credentials, login password, and active browser sessions.
                                    </p>
                                </div>

                                {/* Active Session Status */}
                                <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3">
                                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                                                <Shield className="size-4" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-foreground block">Session Security</span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {user ? `Active session for ${user.email}` : 'Private local session (guest)'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 text-xs">
                                        <span className="text-muted-foreground">Provider:</span>
                                        <span className="font-medium text-foreground font-mono">
                                            {user ? user.app_metadata?.provider || 'Supabase Auth' : 'Local Storage Cache'}
                                        </span>
                                    </div>
                                </div>

                                {/* Password Change Form */}
                                <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4">
                                    <div>
                                        <Label className="text-xs font-semibold text-foreground">Change Account Password</Label>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Ensure your password is at least 6 characters and includes mixed symbols.
                                        </p>
                                    </div>

                                    {user ? (
                                        <form onSubmit={handleChangePassword} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="auth-new-pass" className="text-xs font-medium">
                                                        New Password
                                                    </Label>
                                                    <Input
                                                        id="auth-new-pass"
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="h-9 text-xs bg-muted/20 rounded-xl border-border/70"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label htmlFor="auth-confirm-pass" className="text-xs font-medium">
                                                        Confirm Password
                                                    </Label>
                                                    <Input
                                                        id="auth-confirm-pass"
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className="h-9 text-xs bg-muted/20 rounded-xl border-border/70"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-1">
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    disabled={updatingPassword || !newPassword}
                                                    className="h-8.5 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 cursor-pointer rounded-xl"
                                                >
                                                    {passwordSaveState === 'saving' ? (
                                                        <>
                                                            <span className="size-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                                            <span>Updating...</span>
                                                        </>
                                                    ) : passwordSaveState === 'saved' ? (
                                                        <>
                                                            <Check className="size-3.5 stroke-[3]" />
                                                            <span>Updated</span>
                                                        </>
                                                    ) : (
                                                        <span>Update Password</span>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="p-4 rounded-xl border border-dashed border-border/70 bg-muted/15 text-center space-y-2">
                                            <p className="text-xs text-muted-foreground">
                                                Sign in or create an account to activate cloud password protection.
                                            </p>
                                            <Button asChild size="sm" className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 rounded-xl">
                                                <Link href="/login">Sign In / Register</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Sign Out Control */}
                                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-5 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="text-xs font-semibold text-foreground block">Session Logout</span>
                                        <span className="text-[11px] text-muted-foreground block">
                                            Sign out of your active account session on this device.
                                        </span>
                                    </div>

                                    {user ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => signOut()}
                                            className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/30 gap-1.5 cursor-pointer rounded-xl"
                                        >
                                            <LogOut className="size-3.5" />
                                            <span>Sign Out</span>
                                        </Button>
                                    ) : (
                                        <Button asChild size="sm" className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 rounded-xl">
                                            <Link href="/login">Sign In</Link>
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* --------------------------------------------------------- */}
                        {/* TAB 4: API KEYS (BYOK AI Provider Keys)                   */}
                        {/* --------------------------------------------------------- */}
                        {activeTab === 'api-keys' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6 max-w-2xl"
                            >
                                <div className="border-b border-border/50 pb-4 flex items-center justify-between">
                                    <div>
                                        <h1 className="text-xl font-bold font-display tracking-tight text-foreground flex items-center gap-2">
                                            <KeyRound className="size-5 text-primary" />
                                            <span>AI Provider Keys (BYOK)</span>
                                        </h1>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Bring Your Own Key to unlock frontier models and your personal quota.
                                        </p>
                                    </div>
                                    {activeKeysCount > 0 && (
                                        <span className="rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold font-mono">
                                            {activeKeysCount} Active
                                        </span>
                                    )}
                                </div>

                                {/* Zero Server Storage Guarantee */}
                                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-4 flex items-start gap-3 text-xs text-muted-foreground">
                                    <ShieldCheck className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-foreground block">Zero Server Storage (Privacy Shield)</span>
                                        <span>
                                            Your API keys are stored strictly inside your local browser storage and transmitted directly to LLM runtime endpoints via encrypted client headers. If left blank, LumaCV uses default system quotas.
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Google Gemini */}
                                    <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-2.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <Label htmlFor="key-gemini" className="font-semibold text-foreground">
                                                Google Gemini API Key
                                            </Label>
                                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1">
                                                Get Gemini Key <ArrowUpRight className="size-3" />
                                            </a>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="key-gemini"
                                                type={showKeyVisibility.gemini ? 'text' : 'password'}
                                                placeholder="AIzaSy..."
                                                value={userApiKeys.gemini || ''}
                                                onChange={(e) => setUserApiKeys((prev) => ({ ...prev, gemini: e.target.value }))}
                                                className="h-9 text-xs font-mono bg-muted/20 pr-9 rounded-xl border-border/70"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowKeyVisibility((p) => ({ ...p, gemini: !p.gemini }))}
                                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                                {showKeyVisibility.gemini ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                                            <span>Selected Model:</span>
                                            <select
                                                value={userApiKeys.geminiModel || PROVIDER_AVAILABLE_MODELS.gemini[0]}
                                                onChange={(e) => setUserApiKeys((p) => ({ ...p, geminiModel: e.target.value }))}
                                                className="h-7 text-[11px] rounded-lg border border-border bg-background px-2 font-mono text-foreground"
                                            >
                                                {PROVIDER_AVAILABLE_MODELS.gemini.map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* OpenAI */}
                                    <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-2.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <Label htmlFor="key-openai" className="font-semibold text-foreground">
                                                OpenAI API Key
                                            </Label>
                                            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1">
                                                Get OpenAI Key <ArrowUpRight className="size-3" />
                                            </a>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="key-openai"
                                                type={showKeyVisibility.openai ? 'text' : 'password'}
                                                placeholder="sk-proj-..."
                                                value={userApiKeys.openai || ''}
                                                onChange={(e) => setUserApiKeys((prev) => ({ ...prev, openai: e.target.value }))}
                                                className="h-9 text-xs font-mono bg-muted/20 pr-9 rounded-xl border-border/70"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowKeyVisibility((p) => ({ ...p, openai: !p.openai }))}
                                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                                {showKeyVisibility.openai ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                                            <span>Selected Model:</span>
                                            <select
                                                value={userApiKeys.openaiModel || PROVIDER_AVAILABLE_MODELS.openai[0]}
                                                onChange={(e) => setUserApiKeys((p) => ({ ...p, openaiModel: e.target.value }))}
                                                className="h-7 text-[11px] rounded-lg border border-border bg-background px-2 font-mono text-foreground"
                                            >
                                                {PROVIDER_AVAILABLE_MODELS.openai.map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Anthropic Claude */}
                                    <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-2.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <Label htmlFor="key-anthropic" className="font-semibold text-foreground">
                                                Anthropic Claude Key
                                            </Label>
                                            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1">
                                                Get Anthropic Key <ArrowUpRight className="size-3" />
                                            </a>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="key-anthropic"
                                                type={showKeyVisibility.anthropic ? 'text' : 'password'}
                                                placeholder="sk-ant-api03-..."
                                                value={userApiKeys.anthropic || ''}
                                                onChange={(e) => setUserApiKeys((prev) => ({ ...prev, anthropic: e.target.value }))}
                                                className="h-9 text-xs font-mono bg-muted/20 pr-9 rounded-xl border-border/70"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowKeyVisibility((p) => ({ ...p, anthropic: !p.anthropic }))}
                                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                                {showKeyVisibility.anthropic ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                                            <span>Selected Model:</span>
                                            <select
                                                value={userApiKeys.anthropicModel || PROVIDER_AVAILABLE_MODELS.anthropic[0]}
                                                onChange={(e) => setUserApiKeys((p) => ({ ...p, anthropicModel: e.target.value }))}
                                                className="h-7 text-[11px] rounded-lg border border-border bg-background px-2 font-mono text-foreground"
                                            >
                                                {PROVIDER_AVAILABLE_MODELS.anthropic.map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Groq Cloud */}
                                    <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-2.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <Label htmlFor="key-groq" className="font-semibold text-foreground">
                                                Groq Cloud Key
                                            </Label>
                                            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1">
                                                Get Groq Key <ArrowUpRight className="size-3" />
                                            </a>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="key-groq"
                                                type={showKeyVisibility.groq ? 'text' : 'password'}
                                                placeholder="gsk_..."
                                                value={userApiKeys.groq || ''}
                                                onChange={(e) => setUserApiKeys((prev) => ({ ...prev, groq: e.target.value }))}
                                                className="h-9 text-xs font-mono bg-muted/20 pr-9 rounded-xl border-border/70"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowKeyVisibility((p) => ({ ...p, groq: !p.groq }))}
                                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                                {showKeyVisibility.groq ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                                            <span>Selected Model:</span>
                                            <select
                                                value={userApiKeys.groqModel || PROVIDER_AVAILABLE_MODELS.groq[0]}
                                                onChange={(e) => setUserApiKeys((p) => ({ ...p, groqModel: e.target.value }))}
                                                className="h-7 text-[11px] rounded-lg border border-border bg-background px-2 font-mono text-foreground"
                                            >
                                                {PROVIDER_AVAILABLE_MODELS.groq.map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearAiKeys}
                                        className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                                    >
                                        Reset to Defaults
                                    </Button>

                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleSaveAiKeys}
                                        className="h-8.5 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 cursor-pointer rounded-xl shadow-2xs"
                                    >
                                        {keysSavedState === 'saved' ? (
                                            <>
                                                <Check className="size-3.5 stroke-[3]" />
                                                <span>Keys Saved</span>
                                            </>
                                        ) : (
                                            <span>Save AI Keys</span>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* --------------------------------------------------------- */}
                        {/* TAB 5: DATA & PRIVACY (Backup, JSON Export, Cache Reset)   */}
                        {/* --------------------------------------------------------- */}
                        {activeTab === 'data' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6 max-w-2xl"
                            >
                                <div className="border-b border-border/50 pb-4">
                                    <h1 className="text-xl font-bold font-display tracking-tight text-foreground flex items-center gap-2">
                                        <Download className="size-5 text-primary" />
                                        <span>Data & Privacy Controls</span>
                                    </h1>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Export an offline backup of all resumes and profile data, or reset client cache.
                                    </p>
                                </div>

                                {/* Export Data Card */}
                                <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-3">
                                    <div className="space-y-1">
                                        <span className="text-xs font-semibold text-foreground block">
                                            Export Account & Resumes Backup
                                        </span>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Download a complete JSON file containing your profile info, settings, customized AI configuration, and all local resumes.
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleExportData}
                                        disabled={isExporting}
                                        className="h-8.5 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 cursor-pointer rounded-xl shadow-2xs"
                                    >
                                        <Download className="size-3.5" />
                                        <span>{isExporting ? 'Exporting...' : 'Export My Data (JSON)'}</span>
                                    </Button>
                                </div>

                                {/* Local Storage & Privacy */}
                                <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-xs font-semibold text-foreground block">Client-side Storage & Cache</span>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            LumaCV operates with zero telemetry tracking. All Typst documents and compile caches reside securely on your browser device.
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-medium text-foreground block">Reset Local Cache</span>
                                            <span className="text-[11px] text-muted-foreground block">
                                                Clears locally stored drafts and cached compiler artifacts
                                            </span>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowClearConfirm(true)}
                                            className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/30 rounded-xl cursor-pointer"
                                        >
                                            <Trash2 className="size-3.5" />
                                            <span>Clear Cache</span>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>

            <EditorialFooter />

            <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-destructive">Clear Local Cache?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            This clears locally stored drafts, cached compiler artifacts, and saved preferences on this device. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="pt-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowClearConfirm(false)}
                            className="h-8 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleClearLocalData}
                            className="h-8 text-xs font-semibold"
                        >
                            Confirm Reset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ProfileWorkstationPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader variant="metaballs" size={40} className="text-primary" />
                        <p className="text-xs font-mono">Loading Profile & Settings...</p>
                    </div>
                </div>
            }
        >
            <ProfileWorkstationContent />
        </Suspense>
    );
}
