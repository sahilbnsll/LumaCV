"use client";

import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useInView } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    suffix?: string;
    prefix?: string;
}

export function AnimatedCounter({
    value,
    className = '',
    suffix = '',
    prefix = '',
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 120,
    });
    const isInView = useInView(ref, { once: true, margin: '0px' });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, isInView, value]);

    useEffect(() => {
        const unsubscribe = springValue.on('change', (latest) => {
            if (ref.current) {
                ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
            }
        });
        return () => unsubscribe();
    }, [springValue, prefix, suffix]);

    return (
        <span ref={ref} className={`tabular-nums font-mono ${className}`}>
            {prefix}{value}{suffix}
        </span>
    );
}
