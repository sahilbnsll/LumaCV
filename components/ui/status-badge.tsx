"use client";

import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusBadgeState = 'idle' | 'saving' | 'saved' | 'failed' | 'retrying';

interface StatusBadgeProps {
    state: StatusBadgeState;
    idleLabel?: string;
    savingLabel?: string;
    savedLabel?: string;
    failedLabel?: string;
    retryingLabel?: string;
    className?: string;
}

/**
 * Reusable status badge for async operations (save, compile, download, etc.)
 * Shows animated state transitions with appropriate icons and colours.
 */
export function StatusBadge({
    state,
    idleLabel = 'Ready',
    savingLabel = 'Saving…',
    savedLabel = 'Saved',
    failedLabel = 'Failed',
    retryingLabel = 'Retrying…',
    className,
}: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 text-[11px] font-mono font-medium transition-all duration-200',
                state === 'saving' && 'text-amber-500',
                state === 'saved' && 'text-emerald-500',
                state === 'failed' && 'text-rose-500',
                state === 'retrying' && 'text-amber-500',
                state === 'idle' && 'text-muted-foreground',
                className
            )}
        >
            {state === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
            {state === 'saved' && (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
            )}
            {state === 'failed' && <AlertCircle className="h-3 w-3" />}
            {state === 'retrying' && <Loader2 className="h-3 w-3 animate-spin" />}
            {state === 'idle' && <Clock className="h-3 w-3 opacity-50" />}

            <span>
                {state === 'idle' && idleLabel}
                {state === 'saving' && savingLabel}
                {state === 'saved' && savedLabel}
                {state === 'failed' && failedLabel}
                {state === 'retrying' && retryingLabel}
            </span>
        </span>
    );
}
