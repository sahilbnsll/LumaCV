"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './auth-provider';
import {
    FileText,
    Settings,
    LogOut,
    Sparkles,
    ChevronDown,
    CreditCard,
} from 'lucide-react';


import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';

export function UserMenu() {
    const { user, signOut } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (!user) return null;

    const email = user.email || 'user@example.com';
    const initials = email.slice(0, 2).toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                aria-expanded={open}
                aria-haspopup="true"
                aria-label="User menu"
            >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary">
                    {initials}
                </div>
                <span className="hidden text-xs font-medium text-foreground/80 sm:inline max-w-[140px] truncate">
                    {email}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="menu"
                        aria-label="User options"
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/70 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 text-xs text-foreground"
                    >
                        <div className="px-3 py-2 border-b border-border/50">
                            <p className="font-medium truncate">{email}</p>
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Active Plan: Community Free</span>
                            </div>
                        </div>

                        <div className="py-1 space-y-0.5">
                            <Link
                                href="/dashboard"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                            >
                                <FileText className="h-3.5 w-3.5 text-primary" />
                                <span>My Resumes</span>
                            </Link>

                            <Link
                                href="/builder"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                            >
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                <span>New Tailored Resume</span>
                            </Link>

                            <Link
                                href="/profile"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                            >
                                <Settings className="h-3.5 w-3.5" />
                                <span>Settings & Security</span>
                            </Link>

                            <Link
                                href="/billing"
                                onClick={() => setOpen(false)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                            >
                                <CreditCard className="h-3.5 w-3.5 text-primary" />
                                <span>Billing & Plan</span>
                            </Link>
                        </div>


                        <div className="border-t border-border/50 pt-1 pb-0.5 px-2 flex items-center justify-between text-muted-foreground">
                            <span className="text-[11px]">Theme</span>
                            <ThemeToggle />
                        </div>

                        <div className="border-t border-border/50 pt-1">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    signOut();
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
