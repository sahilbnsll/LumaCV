"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { LumaLogo } from '@/components/luma-logo';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';

/* Kinetic full-screen nav, adapted from the "sterling-gate" pattern (GSAP
   CustomEase, simultaneous button/overlay/backdrop reveal with links
   following 0.35s later, per-item ambient shape swap on hover). Re-themed to
   LumaCV's own chart-color tokens instead of the original's indigo/purple/
   pink palette, and wired to the app's real destinations. */

if (typeof window !== 'undefined') {
    gsap.registerPlugin(CustomEase);
}

interface NavDestination {
    href: string;
    label: string;
    description?: string;
    badge?: string;
}

const AUTHED_DESTINATIONS: NavDestination[] = [
    { href: '/dashboard', label: 'My Resumes', description: 'All saved resumes, version histories & duplicates', badge: 'Hub' },
    { href: '/builder', label: 'Optimize Resume', description: 'AI-tailor resume bullets to any job description', badge: 'AI' },
    { href: '/editor', label: 'Resume Editor', description: 'Interactive Typst editor with live vector preview' },
    { href: '/applications', label: 'Applications Tracker', description: 'Kanban board for job interviews & status' },
    { href: '/ats', label: 'ATS Checker', description: 'Real-time keyword matching and parse scoring' },
    { href: '/templates', label: 'Templates Gallery', description: 'Browse all 52 high-density Typst designs', badge: '52 Free' },
    { href: '/billing', label: 'Billing & Support', description: 'Free forever plan, compute transparency & donations', badge: 'Sponsor' },
    { href: '/docs', label: 'Documentation', description: 'Guides, ATS tips, and Typst compiler syntax' },
    { href: '/profile', label: 'Profile & Settings', description: 'API keys, contact info, and preferences' },
];

const GUEST_DESTINATIONS: NavDestination[] = [
    { href: '/builder', label: 'Optimize Resume', description: 'AI-tailor resume bullets to any job description', badge: 'AI' },
    { href: '/templates', label: 'Templates Gallery', description: 'Browse all 52 high-density Typst designs', badge: '52 Free' },
    { href: '/ats', label: 'ATS Checker', description: 'Real-time keyword matching and parse scoring' },
    { href: '/editor', label: 'Resume Editor', description: 'Interactive visual Typst editor with vector PDF exports' },
    { href: '/docs', label: 'Documentation', description: 'Guides, ATS tips, and Typst compiler syntax' },
    { href: '/billing', label: 'Billing & Support', description: 'Free forever plan, compute transparency & donations', badge: 'Sponsor' },
    { href: '/contact', label: 'Contact & Feedback', description: 'Reach out to the maintainers & report issues' },
    { href: '/login', label: 'Sign In / Register', description: 'Access saved drafts, cloud sync, and tracker', badge: 'Account' },
];

function getMainEase() {
    try {
        if (!gsap.parseEase('main')) {
            CustomEase.create('main', '0.16, 1, 0.3, 1');
        }
        return 'main';
    } catch {
        return 'power3.out';
    }
}

/** The header's own menu-trigger button, text swap + rotating glyph, synced to `open`. */
export function KineticMenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
    const textRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.to(textRef.current, { yPercent: open ? -100 : 0, duration: 0.35, ease: 'power3.out' });
        gsap.to(iconRef.current, { rotate: open ? 315 : 0, duration: 0.35, ease: 'power3.out' });
    }, [open]);

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 min-h-touch text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            <div className="relative h-4 w-9 overflow-hidden text-xs font-semibold hidden sm:block">
                <div ref={textRef} style={{ willChange: 'transform' }}>
                    <p className="h-4 leading-4">Menu</p>
                    <p className="h-4 leading-4">Close</p>
                </div>
            </div>
            <div ref={iconRef} className="h-4 w-4 shrink-0" style={{ willChange: 'transform' }}>
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                    <path d="M7.33 16V0h1.34v16H7.33Z" fill="currentColor" />
                    <path d="M16 8.67H0V7.33h16v1.34Z" fill="currentColor" />
                </svg>
            </div>
        </button>
    );
}


export function FullScreenNav({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const destinations = user ? AUTHED_DESTINATIONS : GUEST_DESTINATIONS;

    const rootRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const linkRefs = useRef<Array<HTMLLIElement | null>>([]);
    const mounted = useRef(false);

    // Open/close timeline, hardware-accelerated GPU slide with Apple fluid easing
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            gsap.set(rootRef.current, { display: open ? 'flex' : 'none' });
            if (!open) return;
        }

        const tl = gsap.timeline();

        const mainEase = getMainEase();

        if (open) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('nav-open');
            // pointer-events flips synchronously, in the same tick the open/close
            // is triggered, instead of only at the tail end of the animated
            // timeline below. Without this, this element (fixed inset-0, z-100,
            // sitting above every header button) keeps swallowing every click on
            // the page for the ~0.5-0.7s the close tween takes to reach its final
            // `display: none` step, and indefinitely if the tab loses focus
            // mid-close, since GSAP's rAF ticker pauses in background tabs, that
            // was the "header stops responding, then works again later" bug.
            gsap.set(rootRef.current, { pointerEvents: 'auto' });
            tl.set(rootRef.current, { display: 'flex' })
                .fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' })
                .fromTo(panelRef.current, { xPercent: 100 }, { xPercent: 0, duration: 0.6, ease: mainEase }, '<')
                .fromTo(
                    linkRefs.current,
                    { opacity: 0, x: 16 },
                    { opacity: 1, x: 0, duration: 0.4, stagger: 0.035, ease: 'power2.out' },
                    '<+=0.18'
                );
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('nav-open');
            gsap.set(rootRef.current, { pointerEvents: 'none' });
            tl.to(linkRefs.current, { opacity: 0, x: 10, duration: 0.22, stagger: 0.018, ease: 'power2.in' })
                .to(panelRef.current, { xPercent: 100, duration: 0.5, ease: mainEase }, '<+=0.04')
                .to(overlayRef.current, { opacity: 0, duration: 0.35, ease: 'power2.out' }, '<')
                .set(rootRef.current, { display: 'none' });
        }

        return () => {
            tl.kill();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    return (
        <div
            ref={rootRef}
            style={{ display: 'none' }}
            className="fixed inset-0 z-[100]"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
        >
            {/* Click-outside scrim, dims the rest of the page, doesn't cover it */}
            {/* Click-outside scrim */}
            <div
                ref={overlayRef}
                onClick={onClose}
                className="absolute inset-0 bg-background/60 backdrop-blur-xs opacity-0 cursor-pointer"
            />

            {/* Clean Apple-grade glassmorphic drawer */}
            <div
                ref={panelRef}
                className="absolute inset-y-0 right-0 w-full max-w-xl lg:max-w-2xl flex flex-col bg-background/95 backdrop-blur-md border-l border-border/70 shadow-2xl overflow-hidden"
                style={{ willChange: 'transform' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-border/60 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <LumaLogo size={22} />
                        <span className="font-display font-bold text-base text-foreground">LumaCV</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <kbd className="hidden sm:inline text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded border border-border/60">
                            ESC
                        </kbd>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close menu"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-foreground hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                                <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Destinations List */}
                <nav className="flex-1 overflow-y-auto px-5 sm:px-8 py-4 sm:py-6">
                    <ul className="space-y-0.5">
                        {destinations.map((item, i) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'));
                            return (
                                <li
                                    key={item.href}
                                    ref={(el) => { linkRefs.current[i] = el; }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            "group relative flex items-baseline gap-3.5 sm:gap-5 py-2.5 rounded-2xl px-3.5 -mx-3.5 transition-all duration-150",
                                            isActive
                                                ? "bg-primary/10 text-foreground font-semibold"
                                                : "hover:bg-muted/60 text-foreground/90 hover:text-foreground"
                                        )}
                                    >
                                        <span className={cn(
                                            "font-mono text-xs sm:text-sm font-bold tabular-nums shrink-0 pt-0.5 transition-colors",
                                            isActive ? "text-primary" : "text-primary/70 group-hover:text-primary"
                                        )}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <span className="font-display font-bold tracking-tight text-xl sm:text-2xl lg:text-[25px]">
                                                    {item.label}
                                                </span>
                                                {item.badge && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                            {item.description && (
                                                <span className="text-[11px] sm:text-xs text-muted-foreground group-hover:text-muted-foreground/90 transition-colors line-clamp-1 mt-0.5">
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 px-5 sm:px-8 py-4 border-t border-border/60 text-xs text-muted-foreground shrink-0 bg-background/50">
                        {user ? (
                            <>
                                <Link href="/dashboard" onClick={onClose} className="hover:text-foreground transition-colors font-medium">
                                    Dashboard
                                </Link>
                                <span className="text-border">·</span>
                                <Link href="/profile" onClick={onClose} className="hover:text-foreground transition-colors font-medium">
                                    Settings
                                </Link>
                            </>
                        ) : (
                            <Link href="/login" onClick={onClose} className="hover:text-foreground transition-colors font-medium">
                                Sign in
                            </Link>
                        )}
                        <span className="text-border">·</span>
                        <Link href="/docs" onClick={onClose} className="hover:text-foreground transition-colors">
                            Docs
                        </Link>
                        <span className="text-border">·</span>
                        <Link href="/billing" onClick={onClose} className="hover:text-foreground transition-colors">
                            Billing &amp; Support
                        </Link>
                        <span className="text-border">·</span>
                        <Link href="/contact" onClick={onClose} className="hover:text-foreground transition-colors">
                            Contact
                        </Link>
                    </div>
            </div>
        </div>
    );
}
