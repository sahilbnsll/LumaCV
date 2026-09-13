"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-provider';
import { UserMenu } from '@/components/user-menu';
import { Github, Star } from 'lucide-react';
import { CommandMenu } from '@/components/command-menu';
import { LumaLogo } from '@/components/luma-logo';
import { FullScreenNav, KineticMenuButton } from '@/components/full-screen-nav';

export function AppHeader() {
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [starCount, setStarCount] = useState<string | null>(null);

    useEffect(() => {
        // Fetch LumaCV's own real GitHub star count
        fetch('https://api.github.com/repos/sahilbnsll/LumaCV')
            .then((res) => res.json())
            .then((data) => {
                if (data && typeof data.stargazers_count === 'number') {
                    setStarCount(data.stargazers_count.toLocaleString());
                }
            })
            .catch(() => {
                // Leave starCount null — the pill hides the count rather than showing a fake one
            });
    }, []);

    return (
        <>
        <header className="w-full bg-background/90 backdrop-blur-md border-b border-border/40 sticky top-0 z-50 transition-colors">
            <div className="w-full max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left: LumaCV Brand Logo (No navbar) */}
                <div className="flex items-center">
                    <Link
                        href="/"
                        className="group flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                        aria-label="LumaCV homepage"
                    >
                        <LumaLogo size={26} />
                        <span className="font-display font-bold tracking-[-0.03em] text-base sm:text-lg text-foreground">
                            LumaCV
                        </span>
                    </Link>
                </div>

                {/* Right: Docs Link, GitHub Star Pill, Theme Toggle, User/Mobile Controls */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Headless Command Palette Listener (Active via Cmd+K / Ctrl+K) */}
                    <CommandMenu hideTrigger={true} />

                    {user && (
                        <Link
                            href="/dashboard"
                            className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            Dashboard
                        </Link>
                    )}

                    {!user && (
                        <>
                            {/* Docs Link */}
                            <Link
                                href="/docs"
                                className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                Docs
                            </Link>

                            {/* GitHub Star Pill Button */}
                            <a
                                href="https://github.com/sahilbnsll/LumaCV"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:inline-flex h-9 items-center gap-2 rounded-md border border-border/80 bg-card/60 hover:bg-muted/80 text-foreground px-3 text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
                                title="View source code and star on GitHub"
                                aria-label={starCount ? `GitHub Star (${starCount} stars)` : 'View source code on GitHub'}
                            >
                                <Github className="size-4 shrink-0 transition-transform group-hover:scale-110 text-foreground" />
                                {starCount && (
                                    <span className="font-mono text-xs font-semibold tracking-tight text-foreground">
                                        {starCount}
                                    </span>
                                )}
                                <Star className="size-3.5 shrink-0 text-muted-foreground group-hover:text-amber-400 group-hover:fill-amber-400/20 transition-colors" />
                            </a>
                        </>
                    )}

                    {/* Theme Toggle Button */}
                    <ThemeToggle />

                    {/* Authenticated Workspace User Profile Menu */}
                    {user && <UserMenu />}

                    {/* Menu Trigger — opens the kinetic full-screen navigation overlay */}
                    <KineticMenuButton open={mobileMenuOpen} onClick={() => setMobileMenuOpen((v) => !v)} />
                </div>
            </div>
        </header>

        {/* Rendered as a sibling, not a header child: the header's own backdrop-blur
            creates a containing block for position:fixed descendants (a CSS
            filter/backdrop-filter side effect), which broke this overlay's sizing
            and let it render see-through when nested inside the header. */}
        <FullScreenNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        </>
    );
}

export default AppHeader;
