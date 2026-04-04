"use client";

import { useAppStore } from '@/lib/store';
import { TemplateType } from '@/lib/resume-schema';
import { cn } from '@/lib/utils';
import { LayoutTemplate, FileText, AlignLeft, Briefcase, Minus, Columns2, Palette, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TemplateOption {
    value: TemplateType;
    label: string;
    description: string;
    icon: React.ReactNode;
    accent: string;
}

const options: TemplateOption[] = [
    { value: 'modern', label: 'Modern', description: 'Clean centered layout', icon: <LayoutTemplate className="w-5 h-5" />, accent: 'from-blue-500/20 to-violet-500/20' },
    { value: 'classic', label: 'Classic', description: 'Traditional two-column', icon: <FileText className="w-5 h-5" />, accent: 'from-amber-500/20 to-orange-500/20' },
    { value: 'ats', label: 'ATS', description: 'Optimized for parsers', icon: <AlignLeft className="w-5 h-5" />, accent: 'from-green-500/20 to-emerald-500/20' },
    { value: 'executive', label: 'Executive', description: 'Serif, conservative', icon: <Briefcase className="w-5 h-5" />, accent: 'from-slate-500/20 to-gray-500/20' },
    { value: 'minimal', label: 'Minimal', description: 'Whitespace-focused', icon: <Minus className="w-5 h-5" />, accent: 'from-zinc-500/20 to-neutral-500/20' },
    { value: 'compact', label: 'Compact', description: 'Dense, space-efficient', icon: <Columns2 className="w-5 h-5" />, accent: 'from-cyan-500/20 to-teal-500/20' },
    { value: 'creative', label: 'Creative', description: 'Bold accent colors', icon: <Palette className="w-5 h-5" />, accent: 'from-pink-500/20 to-rose-500/20' },
    { value: 'tech', label: 'Tech', description: 'Monospace, dev-focused', icon: <Code2 className="w-5 h-5" />, accent: 'from-indigo-500/20 to-purple-500/20' },
];

export function TemplateSelector() {
    const template = useAppStore((s) => s.template);
    const setTemplate = useAppStore((s) => s.setTemplate);

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Choose Template</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {options.map((opt) => {
                    const isSelected = template === opt.value;
                    return (
                        <motion.button
                            key={opt.value}
                            type="button"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setTemplate(opt.value)}
                            className={cn(
                                "relative flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer",
                                isSelected
                                    ? "border-primary bg-primary/5 ring-1 ring-primary glow-sm shadow-sm"
                                    : "border-border hover:border-primary/45 hover:bg-muted/50 hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5"
                            )}
                        >
                            <div className={cn(
                                "w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br",
                                opt.accent
                            )}>
                                {opt.icon}
                            </div>
                            <div>
                                <p className="text-xs font-semibold">{opt.label}</p>
                                <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{opt.description}</p>
                            </div>
                            {isSelected && (
                                <motion.div
                                    layoutId="template-indicator"
                                    className="absolute -top-px -right-px w-3 h-3 bg-primary rounded-full border-2 border-background"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
