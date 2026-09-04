"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { useAuth } from '@/components/auth-provider';
import { Sparkles, FileText, Plus, ChevronRight, Menu, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommandMenu } from '@/components/command-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function AppHeader() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const isAppSection = pathname.startsWith('/builder') || pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
    const isHome = pathname === '/';

    const getNavLink = (hash: string) => isHome ? hash : `/${hash}`;

    return (
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-colors">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Left: Brand + Breadcrumbs */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link
                        href="/"
                        className="group flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                        aria-label="LumaCV homepage"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 shadow-xs transition-transform duration-300 group-hover:scale-105">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-display font-bold tracking-tight text-sm text-foreground">
                            LumaCV
                        </span>
                        <span className="rounded-full bg-primary/10 border border-primary/20 px-1.5 py-0.2 text-[10px] font-medium text-primary tracking-wide">
                            v1.0
                        </span>
                    </Link>

                    {isAppSection && (
                        <nav aria-label="Breadcrumbs" className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
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
                        </nav>
                    )}
                </div>

                {/* Center / Desktop Navigation Links */}
                <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-5 text-xs font-medium text-muted-foreground">
                    {isAppSection ? (
                        <>
                            <Link
                                href="/dashboard"
                                className={cn(
                                    "transition-colors hover:text-foreground flex items-center gap-1.5 py-1",
                                    pathname.startsWith('/dashboard') && "text-foreground font-semibold"
                                )}
                            >
                                <FileText className="h-3.5 w-3.5" />
                                <span>My Resumes</span>
                            </Link>
                            <Link
                                href="/builder"
                                className={cn(
                                    "transition-colors hover:text-foreground flex items-center gap-1.5 py-1",
                                    pathname.startsWith('/builder') && "text-foreground font-semibold"
                                )}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>New Resume</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href={getNavLink('#features')} className="transition-colors hover:text-foreground py-1">
                                Features
                            </Link>
                            <Link href={getNavLink('#templates')} className="transition-colors hover:text-foreground py-1">
                                Templates
                            </Link>
                            <Link href={getNavLink('#workflow')} className="transition-colors hover:text-foreground py-1">
                                Workflow
                            </Link>
                            <Link href="/demo" className={cn("transition-colors hover:text-foreground py-1", pathname === '/demo' && "text-foreground font-semibold")}>
                                Live Sample
                            </Link>
                            <Link href="/billing" className={cn("transition-colors hover:text-foreground py-1", pathname === '/billing' && "text-foreground font-semibold")}>
                                Pricing & Free Pass
                            </Link>
                        </>
                    )}
                </nav>

                {/* Right: Actions, Theme & User */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <CommandMenu />

                    <ThemeToggle />

                    {loading ? (
                        <div className="h-8 w-16 animate-pulse rounded-md bg-muted/40" />
                    ) : user ? (
                        <div className="flex items-center gap-2">
                            {pathname !== '/builder' && (
                                <Button asChild size="sm" className="h-8 text-xs font-medium gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                                    <Link href="/builder">
                                        <Plus className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">New Resume</span>
                                    </Link>
                                </Button>
                            )}
                            <UserMenu />
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                                <Link href="/login">Sign in</Link>
                            </Button>
                            <Button asChild size="sm" className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                                <Link href="/builder">
                                    <span>Start Free</span>
                                    <ArrowRight className="h-3 w-3 ml-1 hidden sm:inline" />
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Navigation Drawer Trigger */}
                    <div className="md:hidden">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    aria-label="Open mobile menu"
                                >
                                    <Menu className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[280px] p-6 bg-card border-border/70 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <SheetHeader className="text-left pb-4 border-b border-border/40">
                                        <SheetTitle className="font-display flex items-center gap-2 text-sm font-bold">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            <span>LumaCV Navigation</span>
                                        </SheetTitle>
                                    </SheetHeader>

                                    <div className="flex flex-col space-y-3 text-sm">
                                        <Link
                                            href="/builder"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center justify-between p-2 rounded-lg bg-primary/10 text-primary font-medium"
                                        >
                                            <span>Resume Builder</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setMobileOpen(false)}
                                            className="p-2 rounded-lg hover:bg-muted/40 text-foreground transition-colors"
                                        >
                                            My Resumes
                                        </Link>
                                        <Link
                                            href="/demo"
                                            onClick={() => setMobileOpen(false)}
                                            className="p-2 rounded-lg hover:bg-muted/40 text-foreground transition-colors"
                                        >
                                            Live Sample Resume
                                        </Link>
                                        <Link
                                            href="/billing"
                                            onClick={() => setMobileOpen(false)}
                                            className="p-2 rounded-lg hover:bg-muted/40 text-foreground transition-colors"
                                        >
                                            Pricing & Contribution
                                        </Link>
                                        <Link
                                            href="/profile"
                                            onClick={() => setMobileOpen(false)}
                                            className="p-2 rounded-lg hover:bg-muted/40 text-foreground transition-colors"
                                        >
                                            Settings & AI Keys
                                        </Link>
                                        <Link
                                            href="/contact"
                                            onClick={() => setMobileOpen(false)}
                                            className="p-2 rounded-lg hover:bg-muted/40 text-foreground transition-colors"
                                        >
                                            Help & Support
                                        </Link>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border/40 text-xs text-muted-foreground">
                                    <p className="font-mono text-[10px]">LumaCV v1.0 • Sub-50ms Vector Engine</p>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
