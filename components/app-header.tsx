"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { useAuth } from '@/components/auth-provider';
import { Sparkles, FileText, Plus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommandMenu } from '@/components/command-menu';

export function AppHeader() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const isAppSection = pathname.startsWith('/builder') || pathname.startsWith('/dashboard') || pathname.startsWith('/profile');



    return (
        <header className="sticky top-0 z-50 border-b border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-background/80 backdrop-blur-xl transition-colors">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Left: Brand + Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 shadow-sm transition-transform duration-300 group-hover:scale-105">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-medium tracking-tight text-sm text-foreground">
                            LumaCV
                        </span>
                        <span className="rounded-full bg-primary/10 border border-primary/20 px-1.5 py-0.2 text-[10px] font-medium text-primary tracking-wide">
                            v1.0
                        </span>
                    </Link>

                    {isAppSection && (
                        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                            {pathname.startsWith('/dashboard') && (
                                <span className="font-medium text-foreground">My Resumes</span>
                            )}
                            {pathname.startsWith('/builder') && (
                                <span className="font-medium text-foreground">Resume Builder</span>
                            )}
                            {pathname.startsWith('/profile') && (
                                <span className="font-medium text-foreground">Settings</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Center / Navigation Links */}
                <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
                    {isAppSection ? (
                        <>
                            <Link
                                href="/dashboard"
                                className={cn(
                                    "transition-colors hover:text-foreground flex items-center gap-1.5",
                                    pathname.startsWith('/dashboard') && "text-foreground font-semibold"
                                )}
                            >
                                <FileText className="h-3.5 w-3.5" />
                                My Resumes
                            </Link>
                            <Link
                                href="/builder"
                                className={cn(
                                    "transition-colors hover:text-foreground flex items-center gap-1.5",
                                    pathname.startsWith('/builder') && "text-foreground font-semibold"
                                )}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                New Resume
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="#features" className="transition-colors hover:text-foreground">Features</Link>
                            <Link href="#templates" className="transition-colors hover:text-foreground">Templates</Link>
                            <Link href="#workflow" className="transition-colors hover:text-foreground">Workflow</Link>
                            <Link href="#pricing" className="transition-colors hover:text-foreground">Pricing</Link>
                            <Link href="#about" className="transition-colors hover:text-foreground">About</Link>
                        </>
                    )}
                </nav>

                {/* Right: Actions & User */}
                <div className="flex items-center gap-2.5">
                    <CommandMenu />
                    {loading ? (
                        <div className="h-7 w-16 animate-pulse rounded-md bg-muted/40" />
                    ) : user ? (
                        <div className="flex items-center gap-2">
                            {pathname !== '/builder' && (
                                <Button asChild size="sm" className="h-8 text-xs font-medium gap-1.5 bg-primary hover:bg-primary/90">
                                    <Link href="/builder">
                                        <Plus className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">New Resume</span>
                                    </Link>
                                </Button>
                            )}
                            <UserMenu />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                                <Link href="/login">Sign in</Link>
                            </Button>
                            <Button asChild size="sm" className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Link href="/builder">Start Tailoring</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}


