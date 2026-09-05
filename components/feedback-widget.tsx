"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackCard } from '@/components/ui/feedback-card';
import { MessageSquarePlus, Smile, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FeedbackWidget() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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

    return (
        <div ref={containerRef} className="fixed bottom-5 right-5 z-40 select-none">
            <AnimatePresence mode="wait">
                {!showFull ? (
                    <motion.button
                        key="compact-pill"
                        initial={{ opacity: 0, scale: 0.85, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 10 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                            setIsExpanded(true);
                            setIsPinned(true);
                        }}
                        onMouseEnter={() => setIsExpanded(true)}
                        className="group flex items-center gap-2 rounded-full glass-sm px-3.5 py-2 shadow-lg transition-all hover:border-primary/40 hover:shadow-xl cursor-pointer"
                        aria-label="Give Feedback"
                    >
                        <Smile className="h-4 w-4 text-primary group-hover:scale-115 group-hover:rotate-12 transition-transform duration-200" />
                        <span className="text-xs font-medium text-foreground tracking-tight">Feedback</span>
                    </motion.button>
                ) : (
                    <motion.div
                        key="expanded-card"
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
                            className="shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default FeedbackWidget;

