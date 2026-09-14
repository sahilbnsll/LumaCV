"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import {
    User,
    LayoutDashboard,
    Sparkles,
    FileCode2,
    Briefcase,
    Target,
    Palette,
    Settings,
    KeyRound,
    LogOut,
    ChevronDown,
} from 'lucide-react';
import { notify } from '@/lib/notify';
import { getAvatarUrl } from '@/lib/avatar-options';

export function UserMenu() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    if (!user) {
        return (
            <Link
                href="/login"
                className="group relative flex items-center gap-1.5 rounded-full border border-border/80 hover:border-primary/50 bg-background hover:bg-muted/50 py-1.5 px-3 transition-all duration-200 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                title="Sign in to your account"
                aria-label="Sign in"
            >
                <div className="h-6 w-6 rounded-full bg-muted/60 border border-border text-muted-foreground flex items-center justify-center text-xs transition-colors group-hover:bg-primary/10 group-hover:text-primary shrink-0">
                    <User className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Sign In
                </span>
            </Link>
        );
    }

    const email = user.email || '';
    const fullName =
        user.user_metadata?.full_name ||
        (email ? email.split('@')[0].replace(/[._]/g, ' ') : 'User');
    const initials = (fullName || 'U')
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    const avatarUrl = getAvatarUrl(user.user_metadata?.avatar_id);

    const handleSignOut = async () => {
        try {
            await signOut();
            notify.info('Signed out', 'You have been signed out of your account.');
            router.push('/');
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="group relative flex items-center gap-2 rounded-full border border-border/80 hover:border-primary/50 bg-background hover:bg-muted/50 p-1 pr-2.5 transition-all duration-200 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer select-none"
                    aria-label="User Account Menu"
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full border border-primary/20 bg-muted/30 shrink-0" />
                    ) : (
                        <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-semibold text-[11px] transition-colors group-hover:bg-primary/20 shrink-0">
                            {initials}
                        </div>
                    )}
                    <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors hidden sm:inline max-w-[110px] truncate">
                        {fullName.split(' ')[0]}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground/70 group-hover:text-foreground transition-colors shrink-0" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-60 p-1.5 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-xl text-foreground"
            >
                {/* User Identity Header, plain text, no status pill/badge clutter */}
                <DropdownMenuLabel className="px-2.5 py-2.5">
                    <div className="flex items-center gap-3">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full border border-primary/20 bg-muted/30 shrink-0" />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                {initials}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0 gap-0.5">
                            <span className="font-semibold text-xs text-foreground truncate capitalize">
                                {fullName}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate font-mono">
                                {email || 'Local User'}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 border-border/40" />

                {/* Workspace Navigation, one neutral icon weight, no per-item rainbow colors */}
                <DropdownMenuItem asChild>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-2.5 min-h-touch text-xs font-medium rounded-lg cursor-pointer hover:bg-muted"
                    >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        <span>My Resumes</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/builder"
                        className="flex items-center gap-3 px-2.5 min-h-touch text-xs font-medium rounded-lg cursor-pointer hover:bg-muted"
                    >
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                        <span>Optimize Resume</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/editor"
                        className="flex items-center gap-3 px-2.5 min-h-touch text-xs font-medium rounded-lg cursor-pointer hover:bg-muted"
                    >
                        <FileCode2 className="h-4 w-4 text-muted-foreground" />
                        <span>Resume Editor</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/applications"
                        className="flex items-center gap-3 px-2.5 min-h-touch text-xs font-medium rounded-lg cursor-pointer hover:bg-muted"
                    >
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>Applications</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/ats"
                        className="flex items-center gap-3 px-2.5 min-h-touch text-xs font-medium rounded-lg cursor-pointer hover:bg-muted"
                    >
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>ATS Checker</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/templates"
                        className="flex items-center gap-3 px-2.5 min-h-touch text-xs font-medium rounded-lg cursor-pointer hover:bg-muted"
                    >
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span>Templates</span>
                        <DropdownMenuShortcut className="text-[10px] text-muted-foreground font-mono">52</DropdownMenuShortcut>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 border-border/40" />

                {/* Preferences & Settings */}
                <DropdownMenuItem asChild>
                    <Link
                        href="/profile?tab=profile"
                        className="flex items-center gap-3 px-2.5 min-h-touch text-xs font-medium rounded-lg cursor-pointer hover:bg-muted"
                    >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/profile?tab=api-keys"
                        className="flex items-center gap-3 px-2.5 min-h-touch text-xs font-medium rounded-lg cursor-pointer hover:bg-muted"
                    >
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        <span>API Keys</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 border-border/40" />

                {/* Sign Out */}
                <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-2.5 min-h-touch text-xs font-medium rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

