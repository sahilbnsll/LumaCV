"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackCard } from '@/components/ui/feedback-card';
import { Smile, MessageSquarePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function FeedbackWidget() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Responsive screen detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Listen for custom open event from CommandMenu or other shortcuts
    useEffect(() => {
        const handleOpen = () => {
            setIsExpanded(true);
            setIsPinned(true);
        };
        window.addEventListener('open-feedback-widget', handleOpen);
        return () => window.removeEventListener('open-feedback-widget', handleOpen);
    }, []);

    // Click outside to collapse if pinned
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsExpanded(false);
                setIsPinned(false);
            }
        };

        if (isPinned || isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isPinned, isExpanded]);

    const showFull = isExpanded || isPinned;
    const isBuilder = pathname?.startsWith('/builder');

    return (
        <>
            {/* Mobile Modal Backdrop when Expanded */}
            {isMobile && showFull && (
                <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200"
                    onClick={() => {
                        setIsExpanded(false);
                        setIsPinned(false);
                    }}
                >
                    <div 
                        ref={containerRef}
                        className="w-full max-w-sm max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FeedbackCard
                            questionText="Enjoying LumaCV?"
                            showClose={true}
                            onClose={() => {
                                setIsExpanded(false);
                                setIsPinned(false);
                            }}
                            className="w-full shadow-2xl ring-1 ring-black/10 dark:ring-white/10"
                        />
                    </div>
                </div>
            )}

            {/* Desktop and Collapsed Mobile Placement */}
            {(!isMobile || !showFull) && (
                <div 
                    ref={!isMobile ? containerRef : undefined} 
                    className={cn(
                        "fixed z-30 select-none transition-all duration-300",
                        // Avoid overlapping mobile step navigation footer in builder
                        isBuilder 
                            ? "bottom-16 right-3 sm:bottom-6 sm:right-6" 
                            : "bottom-4 right-3 sm:bottom-6 sm:right-6"
                    )}
                >
                    <AnimatePresence mode="wait">
                        {!showFull ? (
                            <motion.button
                                key="compact-trigger"
                                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.85, y: 8 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => {
                                    setIsExpanded(true);
                                    setIsPinned(true);
                                }}
                                onMouseEnter={() => {
                                    if (!isMobile) setIsExpanded(true);
                                }}
                                className="group flex items-center justify-center sm:gap-2 rounded-full glass-sm p-2.5 sm:px-3.5 sm:py-2 shadow-lg transition-all hover:border-primary/50 hover:shadow-xl cursor-pointer border border-border/70 hover:scale-105 active:scale-95 bg-card/90 dark:bg-card/80 backdrop-blur-md"
                                aria-label="Give Feedback"
                            >
                                <Smile className="h-4 w-4 text-primary group-hover:scale-115 group-hover:rotate-12 transition-transform duration-200" />
                                <span className="hidden sm:inline text-xs font-medium text-foreground tracking-tight">Feedback</span>
                            </motion.button>
                        ) : (
                            !isMobile && (
                                <motion.div
                                    key="desktop-expanded-card"
                                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                                    onMouseLeave={() => {
                                        if (!isPinned) {
                                            setIsExpanded(false);
                                        }
                                    }}
                                >
                                    <FeedbackCard
                                        questionText="Enjoying LumaCV?"
                                        showClose={true}
                                        onClose={() => {
                                            setIsExpanded(false);
                                            setIsPinned(false);
                                        }}
                                        className="shadow-2xl ring-1 ring-black/5 dark:ring-white/10 w-[340px]"
                                    />
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            )}
        </>
    );
}

export default FeedbackWidget;
