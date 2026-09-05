"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import HomeHeroLandingScrollAnimation from '@/components/ui/home-hero-landing-scroll-animation';
import { Button } from '@/components/ui/button';

export default function ScrollAnimationShowcasePage() {
    return (
        <div className="relative min-h-screen bg-[#fafafa]">
            {/* Floating Back Navigation */}
            <div className="fixed top-6 left-6 z-50">
                <Button asChild variant="outline" size="sm" className="gap-2 bg-white/90 backdrop-blur-md shadow-md rounded-full border-black/10">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return to LumaCV</span>
                    </Link>
                </Button>
            </div>

            <HomeHeroLandingScrollAnimation />
        </div>
    );
}
