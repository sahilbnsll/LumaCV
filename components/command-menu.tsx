"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    FileText,
    Plus,
    Layout,
    Sparkles,
    Settings,
    CreditCard,
    HelpCircle,
    Moon,
    Sun,
    X,
    Key,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/lib/store';
import { motionTokens } from '@/lib/design-tokens';

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { setTemplate } = useAppStore();
    const inputRef = useRef<HTMLInputElement>(null);

    // Global Cmd+K / Ctrl+K listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (open) {
            setQuery('');
            setSelectedIndex(0);
            const timer = setTimeout(() => inputRef.current?.focus(), 40);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const items = [
        {
            id: 'new-resume',
            label: 'New Tailored Resume',
            category: 'Navigation',
            icon: Plus,
            action: () => router.push('/builder'),
        },
        {
            id: 'my-resumes',
            label: 'My Resumes / Projects',
            category: 'Navigation',
            icon: FileText,
            action: () => router.push('/dashboard'),
        },
        {
            id: 'live-demo',
            label: 'Live Sample Resume',
            category: 'Navigation',
            icon: Sparkles,
            action: () => router.push('/demo'),
        },
        {
            id: 'billing',
            label: 'Community Access & Support',
            category: 'Account',
            icon: CreditCard,
            action: () => router.push('/billing'),
        },
        {
            id: 'settings',
            label: 'Account & Security Settings',
            category: 'Account',
            icon: Settings,
            action: () => router.push('/profile'),
        },
        {
            id: 'ai-keys',
            label: 'Configure AI Provider Keys (BYOK)',
            category: 'Account',
            icon: Key,
            action: () => router.push('/profile#api-keys'),
        },
        {
            id: 'template-modern',
            label: 'Switch Template: Modern (Clean Sans)',
            category: 'Templates',
            icon: Layout,
            action: () => {
                setTemplate('modern');
                router.push('/builder');
            },
        },
        {
            id: 'template-classic',
            label: 'Switch Template: Classic (Ivy League Serif)',
            category: 'Templates',
            icon: Layout,
            action: () => {
                setTemplate('classic');
                router.push('/builder');
            },
        },
        {
            id: 'template-engineering',
            label: 'Switch Template: Engineering (High-Density)',
            category: 'Templates',
            icon: Layout,
            action: () => {
                setTemplate('engineering');
                router.push('/builder');
            },
        },
        {
            id: 'template-compact',
            label: 'Switch Template: Compact (Space-Optimized)',
            category: 'Templates',
            icon: Layout,
            action: () => {
                setTemplate('compact');
                router.push('/builder');
            },
        },
        {
            id: 'template-two-column',
            label: 'Switch Template: Two-Column (Asymmetric Sidebar)',
            category: 'Templates',
            icon: Layout,
            action: () => {
                setTemplate('two_column');
                router.push('/builder');
            },
        },
        {
            id: 'template-ats-safe',
            label: 'Switch Template: ATS Safe (Linear Text)',
            category: 'Templates',
            icon: Layout,
            action: () => {
                setTemplate('ats_safe');
                router.push('/builder');
            },
        },
        {
            id: 'toggle-theme',
            label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
            category: 'Preferences',
            icon: theme === 'dark' ? Sun : Moon,
            action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
        },
        {
            id: 'support',
            label: 'Contact Support & Help Center',
            category: 'Help',
            icon: HelpCircle,
            action: () => router.push('/contact'),
        },
    ];

    const filteredItems = items.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (action: () => void) => {
        setOpen(false);
        action();
    };

    const handleKeyDownInMenu = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
        } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
            e.preventDefault();
            handleSelect(filteredItems[selectedIndex].action);
        }
    };

    return (
        <>
            {/* Responsive Command Palette Trigger Button */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/25 px-2 sm:px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden"
                aria-label="Open command palette (Cmd+K)"
                title="Command Palette (Cmd+K)"
            >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[11px] font-medium">Quick actions</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/80 bg-background/80 px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground shadow-2xs">
                    ⌘K
                </kbd>
            </button>

            {/* Accessible Dialog Overlay */}
            <AnimatePresence>
                {open && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="command-menu-title"
                        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
                    >
                        <h2 id="command-menu-title" className="sr-only">
                            Global Command Palette
                        </h2>

                        {/* Spatial Glass Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={motionTokens.transition.enter}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-background/80 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -8 }}
                            transition={motionTokens.transition.enter}
                            className="relative w-full max-w-lg rounded-2xl border border-border/70 bg-card p-0 shadow-modal z-10 overflow-hidden"
                            onKeyDown={handleKeyDownInMenu}
                        >
                            {/* Search Input Bar */}
                            <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3 bg-muted/10">
                                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                                <input
                                    ref={inputRef}
                                    role="combobox"
                                    aria-autocomplete="list"
                                    aria-expanded={true}
                                    aria-controls="command-results-list"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setSelectedIndex(0);
                                    }}
                                    placeholder="Search commands, templates, or navigation…"
                                    className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    aria-label="Close command palette"
                                    className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/40 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Options List */}
                            <div
                                id="command-results-list"
                                role="listbox"
                                aria-label="Available commands"
                                className="max-h-80 overflow-y-auto p-2 space-y-1"
                            >
                                {filteredItems.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-muted-foreground">
                                        No matching commands found.
                                    </div>
                                ) : (
                                    filteredItems.map((item, index) => {
                                        const Icon = item.icon;
                                        const isSelected = index === selectedIndex;
                                        return (
                                            <button
                                                key={item.id}
                                                role="option"
                                                aria-selected={isSelected}
                                                type="button"
                                                onClick={() => handleSelect(item.action)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                                                    isSelected
                                                        ? 'bg-primary text-primary-foreground font-medium shadow-xs'
                                                        : 'text-foreground/80 hover:bg-muted/40'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 truncate">
                                                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                                    <span className="truncate">{item.label}</span>
                                                </div>
                                                <span className={`text-[10px] tracking-wide uppercase font-mono px-1.5 py-0.5 rounded ${
                                                    isSelected
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-muted/60 text-muted-foreground'
                                                }`}>
                                                    {item.category}
                                                </span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {/* Keyboard Navigation Footer */}
                            <div className="border-t border-border/40 px-3 py-2 bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground">
                                <div className="flex items-center gap-3 font-mono">
                                    <span>↑↓ Navigate</span>
                                    <span>↵ Select</span>
                                    <span>ESC Close</span>
                                </div>
                                <span className="font-mono text-[9px] text-muted-foreground/70 uppercase">LumaCV Studio</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
