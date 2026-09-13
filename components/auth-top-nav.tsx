"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { FullScreenNav, KineticMenuButton } from '@/components/full-screen-nav';

export function AuthTopNav() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <div className="absolute top-5 sm:top-7 inset-x-5 sm:inset-x-8 flex items-center justify-between z-20 pointer-events-none">
                <Link
                    href="/"
                    className="pointer-events-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group bg-card/70 dark:bg-card/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border/70 dark:border-white/10 shadow-2xs"
                >
                    <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span>Back to LumaCV</span>
                </Link>

                <div className="pointer-events-auto flex items-center gap-2">
                    <ThemeToggle />
                    <KineticMenuButton open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
                </div>
            </div>

            <FullScreenNav open={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
    );
}
