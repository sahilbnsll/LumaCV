"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';
import { useAuth } from '@/components/auth-provider';
import { ChevronRight } from 'lucide-react';
import { CommandMenu } from '@/components/command-menu';
import { LumaLogo } from '@/components/luma-logo';
import dynamic from 'next/dynamic';

const SterlingGateKineticNavigation = dynamic(
    () => import('@/components/ui/sterling-gate-kinetic-navigation').then((m) => m.SterlingGateKineticNavigation),
    {
        ssr: false,
        loading: () => <div className="h-9 w-9 rounded-xl border border-border/70 bg-card/60 animate-pulse" />,
    }
);

export function AppHeader() {
    const pathname = usePathname();
    const { user, loading } = useAuth();

    const isAppSection = pathname.startsWith('/builder') || pathname.startsWith('/dashboard') || pathname.startsWith('/profile');

    return (
        <header className="sticky top-0 z-40 glass-nav transition-colors">
            <div className="w-full flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left: Brand + Breadcrumbs */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link
                        href="/"
                        className="group flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                        aria-label="LumaCV homepage"
                    >
                        <LumaLogo size={22} />
                        <span className="font-display font-semibold tracking-tight text-sm text-foreground">
                            LumaCV
                        </span>
                    </Link>

                    {isAppSection && (
                        <nav aria-label="Breadcrumbs" className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                            <ChevronRight className="h-3 w-3 text-muted-foreground/50" strokeWidth={2} />
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

                {/* Right: Actions, Theme, Kinetic Navigation & User */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {isAppSection && <CommandMenu />}

                    <ThemeToggle />

                    {loading ? (
                        <div className="h-8 w-16 animate-pulse rounded-md bg-muted/40" />
                    ) : user ? (
                        <UserMenu />
                    ) : (
                        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2.5">
                            <Link
                                href="/login"
                                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/20"
                            >
                                Sign in
                            </Link>
                            <Button asChild size="sm" className="h-8 px-3.5 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs rounded-lg">
                                <Link href="/builder">
                                    Get Started
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Sterling Gate Kinetic Navigation (Interactive Explore / Fullscreen Gate) */}
                    <div className="flex items-center">
                        <SterlingGateKineticNavigation />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default AppHeader;
