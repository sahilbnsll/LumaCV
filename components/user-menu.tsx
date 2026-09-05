"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Pattern } from '@/components/ui/v-tabs-13';
import { cn } from '@/lib/utils';

export function UserMenu() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
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

    const email = user.email || 'sahilbansal.sb24@gmail.com';
    const fullName = user.user_metadata?.full_name || (email ? email.split('@')[0].replace('.', ' ') : 'Sahil Bansal');
    const initials = (fullName || 'U')
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <>
            <div className="relative" ref={menuRef}>
                {/* Minimal, compact Avatar trigger in header */}
                <button
                    onClick={() => setOpen(!open)}
                    className="group relative flex items-center gap-2 rounded-full border border-border/80 hover:border-border bg-background hover:bg-muted/50 p-1 pr-2.5 transition-all duration-200 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    aria-expanded={open}
                    aria-haspopup="true"
                    aria-label="Profile menu"
                >
                    {/* Clean Minimalist Monogram Avatar (No neon colors) */}
                    <div className="h-7 w-7 rounded-full bg-muted/80 border border-border flex items-center justify-center font-semibold text-[11px] text-foreground transition-colors group-hover:bg-muted shrink-0">
                        {initials}
                    </div>

                    <ChevronDown
                        className={cn(
                            "h-3 w-3 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
                            open && "rotate-180 text-foreground"
                        )}
                        strokeWidth={2}
                    />
                </button>

                {/* Minimalist Dropdown Menu (No icons, clean & simple) */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            role="menu"
                            aria-label="User options"
                            initial={{ opacity: 0, y: 6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.97 }}
                            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border/80 bg-popover/95 p-2 shadow-xl backdrop-blur-xl z-50 text-xs text-foreground"
                        >
                            {/* User Header */}
                            <div className="px-3 py-2.5 mb-1 rounded-xl bg-muted/40 border border-border/40">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-semibold text-xs text-foreground truncate capitalize">{fullName}</p>
                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/60 shrink-0">
                                        Free
                                    </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{email}</p>
                            </div>

                            {/* Clean Text-Only Items (No icons) */}
                            <div className="space-y-0.5 py-1">
                                <Link
                                    href="/dashboard"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                >
                                    <span>My Resumes</span>
                                </Link>

                                <Link
                                    href="/builder"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                >
                                    <span>Resume Builder</span>
                                    <span className="text-[10px] font-medium text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border/40">
                                        48 Presets
                                    </span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpen(false);
                                        setSettingsOpen(true);
                                    }}
                                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer text-left"
                                >
                                    <span>Account Settings</span>
                                </button>

                                <Link
                                    href="/support"
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                >
                                    <span>Support LumaCV</span>
                                </Link>

                                <div className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-muted-foreground">
                                    <span className="font-medium text-xs">Engine</span>
                                    <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                                        Typst Native
                                    </span>
                                </div>
                            </div>

                            {/* Theme Appearance */}
                            <div className="border-t border-border/50 my-1 pt-1.5 px-3 flex items-center justify-between text-muted-foreground">
                                <span className="text-[11px] font-medium">Appearance</span>
                                <ThemeToggle />
                            </div>

                            {/* Sign Out (Clean red text, no icon) */}
                            <div className="border-t border-border/50 pt-1">
                                <button
                                    onClick={async () => {
                                        setOpen(false);
                                        await signOut();
                                        router.push('/');
                                        toast.success("Signed out successfully.");
                                    }}
                                    className="flex w-full items-center justify-start rounded-xl px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                >
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Interactive Settings Modal tailored exclusively for LumaCV */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="max-w-3xl sm:max-w-4xl w-[95vw] p-0 overflow-hidden border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl">
                    <DialogHeader className="p-5 pb-2 border-b border-border/40">
                        <DialogTitle className="font-display text-lg font-bold text-foreground">
                            Account & Studio Settings
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Configure your AI keys, Typst compilation defaults, credentials, and feedback.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 sm:p-6">
                        <Pattern onClose={() => setSettingsOpen(false)} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
