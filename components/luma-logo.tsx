"use client";

import { cn } from '@/lib/utils';

interface LumaLogoProps {
    className?: string;
    size?: number;
    showWordmark?: boolean;
    wordmarkClassName?: string;
}

export function LumaLogo({
    className,
    size = 24,
    showWordmark = false,
    wordmarkClassName,
}: LumaLogoProps) {
    return (
        <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 transition-transform duration-300 hover:scale-115 hover:rotate-12 active:scale-95 text-foreground drop-shadow-2xs"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M 100,8 L 108.78,55.86 L 130.61,26.09 L 125,62.58 L 165.05,34.95 L 137.42,75 L 173.91,69.39 L 144.14,91.22 L 192,100 L 144.14,108.78 L 173.91,130.61 L 137.42,125 L 165.05,165.05 L 125,137.42 L 130.61,173.91 L 108.78,144.14 L 100,192 L 91.22,144.14 L 69.39,173.91 L 75,137.42 L 34.95,165.05 L 62.58,125 L 26.09,130.61 L 55.86,108.78 L 8,100 L 55.86,91.22 L 26.09,69.39 L 62.58,75 L 34.95,34.95 L 75,62.58 L 69.39,26.09 L 91.22,55.86 Z M 100,51 L 106.12,85.22 L 134.65,65.35 L 114.78,93.88 L 149,100 L 114.78,106.12 L 134.65,134.65 L 106.12,114.78 L 100,149 L 93.88,114.78 L 65.35,134.65 L 85.22,106.12 L 51,100 L 85.22,93.88 L 65.35,65.35 L 93.88,85.22 Z"
                    fill="currentColor"
                />
            </svg>

            {showWordmark && (
                <span className={cn("font-display font-bold tracking-tight text-foreground flex items-center gap-0.5", wordmarkClassName)}>
                    <span>Luma</span>
                    <span className="text-primary font-black">CV</span>
                </span>
            )}
        </div>
    );
}
