"use client";

import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useInView } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    suffix?: string;
    prefix?: string;
    formatCommas?: boolean;
}

export function AnimatedCounter({
    value,
    className = '',
    suffix = '',
    prefix = '',
    formatCommas = true,
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 120,
    });
    const isInView = useInView(ref, { once: true, margin: '0px' });

    const formatNumber = (num: number) => {
        const rounded = Math.round(num);
        return formatCommas ? rounded.toLocaleString('en-US') : String(rounded);
    };

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        } else if (ref.current) {
            ref.current.textContent = `${prefix}${formatNumber(value)}${suffix}`;
        }
    }, [motionValue, isInView, value, prefix, suffix, formatCommas]);

    useEffect(() => {
        const unsubscribe = springValue.on('change', (latest) => {
            if (ref.current) {
                ref.current.textContent = `${prefix}${formatNumber(latest)}${suffix}`;
            }
        });
        return () => unsubscribe();
    }, [springValue, prefix, suffix, formatCommas]);

    return (
        <span ref={ref} className={`tabular-nums font-mono ${className}`}>
            {prefix}{formatNumber(value)}{suffix}
        </span>
    );
}
