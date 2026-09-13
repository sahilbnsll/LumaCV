"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface CardStickyProps extends React.HTMLAttributes<HTMLDivElement> {
    index: number;
    incrementY?: number;
    incrementZ?: number;
}

/** Scroll container for a set of sticky, staggered CardSticky children. */
const ContainerScroll = React.forwardRef<
    HTMLDivElement,
    React.HTMLProps<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
    return (
        <div ref={ref} className={cn("relative w-full", className)} {...props}>
            {children}
        </div>
    );
});
ContainerScroll.displayName = "ContainerScroll";

/** A card that sticks in place as the page scrolls past it, offset by `index` so the next card lands slightly lower/in front of the last, producing a stacked-deck reveal. Plain CSS position:sticky — no animation library involved. */
const CardSticky = React.forwardRef<HTMLDivElement, CardStickyProps>(
    ({ index, incrementY = 10, incrementZ = 10, children, className, style, ...props }, ref) => {
        const y = index * incrementY;
        const z = index * incrementZ;

        return (
            <div
                ref={ref}
                style={{
                    top: y,
                    zIndex: z,
                    ...style,
                }}
                className={cn("sticky", className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
CardSticky.displayName = "CardSticky";

export { ContainerScroll, CardSticky };
