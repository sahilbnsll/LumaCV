"use client";

import Link from 'next/link';
import { Github, Linkedin, ShieldCheck, Heart, BriefcaseBusiness } from 'lucide-react';
import { LumaLogo } from '@/components/luma-logo';

export function AppFooter() {
    return (
        <footer className="glass border-t border-border/50 text-muted-foreground transition-colors">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-border/40">
                    {/* Brand column */}
                    <div className="md:col-span-2 space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2.5 group">
                            <LumaLogo size={26} />
                            <span className="font-display text-base font-bold tracking-tight text-foreground">
                                LumaCV
                            </span>
                        </Link>

                        <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                            A free, open-source resume studio built for factual accuracy, ATS alignment, and clean typeset output.
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h4 className="font-display text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                            Platform
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link href="/builder" className="hover:text-foreground transition-colors">
                                    Resume Builder
                                </Link>
                            </li>
                            <li>
                                <Link href="/demo" className="hover:text-foreground transition-colors">
                                    Live Sample CV
                                </Link>
                            </li>
                            <li>
                                <Link href="/templates" className="hover:text-foreground transition-colors">
                                    Templates Gallery (48)
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                                    My Resumes
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs" className="hover:text-foreground transition-colors">
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                            Access & Support
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link href="/docs#byok" className="hover:text-foreground transition-colors">
                                    AI Provider Keys (BYOK)
                                </Link>
                            </li>
                            <li>
                                <Link href="/billing" className="hover:text-foreground transition-colors">
                                    Community Access & Tiering
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-foreground transition-colors">
                                    Help & Inquiries
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="hover:text-foreground transition-colors">
                                    Support Center
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:connect@sahilbansal.net" className="hover:text-foreground transition-colors">
                                    connect@sahilbansal.net
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                            Trust & Open Source
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <Link href="/privacy" className="hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs#contributing" className="hover:text-foreground transition-colors">
                                    Contributing Guide
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs#license" className="hover:text-foreground transition-colors">
                                    MIT License
                                </Link>
                            </li>
                            <li className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 pt-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <span>Zero Model Training</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom row */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
                    <p>© {new Date().getFullYear()} LumaCV. Designed & built by <a href="https://sahilbansal.net/" target="_blank" rel="noreferrer" className="text-foreground hover:underline font-medium">Sahil Bansal</a>.</p>
                    
                    <div className="flex items-center gap-4">
                        <a href="https://sahilbansal.net/" target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1.5 transition-colors group" aria-label="Sahil Bansal Portfolio">
                            <BriefcaseBusiness className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span>Portfolio</span>
                        </a>
                        <a href="https://github.com/sahilbnsll/LumaCV" target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1 transition-colors" aria-label="GitHub repository">
                            <Github className="h-3.5 w-3.5" />
                            <span>GitHub</span>
                        </a>
                        <a href="https://github.com/sponsors/sahilbnsll" target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1 transition-colors text-rose-500/90 hover:text-rose-500 font-medium" aria-label="GitHub Sponsors">
                            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                            <span>Sponsor</span>
                        </a>
                        <a href="https://www.linkedin.com/in/sahilbansal24/" target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1 transition-colors" aria-label="LinkedIn profile">
                            <Linkedin className="h-3.5 w-3.5" />
                            <span>LinkedIn</span>
                        </a>
                        <span className="text-border">•</span>
                        <span className="text-muted-foreground/70">MIT Open Source</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
