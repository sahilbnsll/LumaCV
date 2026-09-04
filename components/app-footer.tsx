"use client";

import Link from 'next/link';
import { Sparkles, Github, Linkedin, ShieldCheck, Cpu } from 'lucide-react';

export function AppFooter() {
    return (
        <footer className="border-t border-border/50 bg-card/30 text-muted-foreground transition-colors">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-border/40">
                    {/* Brand column */}
                    <div className="md:col-span-2 space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2.5 group">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-xs group-hover:scale-105 transition-transform">
                                <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-display text-base font-bold tracking-tight text-foreground">
                                LumaCV
                            </span>
                            <span className="rounded-full bg-primary/10 border border-primary/20 px-1.5 py-0.2 text-[10px] font-medium text-primary">
                                v1.0
                            </span>
                        </Link>

                        <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                            Open-access AI career utility engineered for factual integrity, deterministic 4-vector ATS alignment, and sub-50ms native vector resume typesetting.
                        </p>

                        <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px]">Sub-50ms Serverless Vector Engine Active</span>
                        </div>
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
                                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                                    My Resumes
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile" className="hover:text-foreground transition-colors">
                                    AI Provider Keys (BYOK)
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
                                <Link href="/billing" className="hover:text-foreground transition-colors">
                                    Community Access & Contribution
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-foreground transition-colors">
                                    Help & Inquiries
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
                            Trust & Integrity
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
                            <li className="flex items-center gap-1 text-[11px] text-muted-foreground/80 pt-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                <span>Zero Model Training</span>
                            </li>
                            <li className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                                <Cpu className="h-3 w-3 text-primary" />
                                <span>Zero LaTeX Lag</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom row */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
                    <p>© {new Date().getFullYear()} LumaCV. Designed & built by <a href="https://github.com/sahilbnsll" target="_blank" rel="noreferrer" className="text-foreground hover:underline font-medium">Sahil Bansal</a>.</p>
                    
                    <div className="flex items-center gap-4">
                        <a href="https://github.com/sahilbnsll" target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1 transition-colors" aria-label="GitHub profile">
                            <Github className="h-3.5 w-3.5" />
                            <span>GitHub</span>
                        </a>
                        <a href="https://www.linkedin.com/in/sahilbansal24/" target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1 transition-colors" aria-label="LinkedIn profile">
                            <Linkedin className="h-3.5 w-3.5" />
                            <span>LinkedIn</span>
                        </a>
                        <span className="text-border">•</span>
                        <span className="text-muted-foreground/70">100% Free Open Launch</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
