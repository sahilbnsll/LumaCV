"use client";

import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';

/**
 * Single source of truth for theme switching UI. Two variants cover the two
 * real use cases in the app instead of each screen hand-rolling its own:
 * - "icon", compact binary dark/light toggle for header/toolbar contexts.
 * - "cards", light/dark/system picker for the Profile Preferences panel,
 *   where there's room to expose the "system" option explicitly.
 */
export function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'cards' }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return variant === 'icon'
            ? <div className="h-10 w-10 rounded-md border border-border bg-card/80 shadow-xs" />
            : <div className="grid grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[74px] rounded-xl border border-border/70 bg-muted/20" />
            ))}</div>;
    }

    if (variant === 'cards') {
        const options = [
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Laptop },
        ] as const;

        return (
            <div className="grid grid-cols-3 gap-3">
                {options.map((t) => {
                    const Icon = t.icon;
                    const isSelected = theme === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => { setTheme(t.id); notify.themeChanged(t.id); }}
                            className={cn(
                                "flex min-h-touch flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer gap-2",
                                isSelected
                                    ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs ring-2 ring-primary/20"
                                    : "border-border/70 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            )}
                            aria-pressed={isSelected}
                        >
                            <Icon className="size-5" />
                            <span className="text-xs">{t.label}</span>
                        </button>
                    );
                })}
            </div>
        );
    }

    const handleToggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        notify.themeChanged(next);
    };

    return (
        <button
            type="button"
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card/80 hover:bg-muted/70 text-foreground transition-colors duration-150 shadow-xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            onClick={handleToggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <Sun className="h-4.5 w-4.5 rotate-0 scale-100 opacity-100 transition-[transform,opacity] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] dark:-rotate-90 dark:scale-0 dark:opacity-0 text-foreground" strokeWidth={1.75} />
            <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 opacity-0 transition-[transform,opacity] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] dark:rotate-0 dark:scale-100 dark:opacity-100 text-foreground" strokeWidth={1.75} />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
