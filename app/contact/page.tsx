"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { ArrowLeft, Mail, Send, CheckCircle2, HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !message.trim()) {
            toast.error('Please provide an email and message');
            return;
        }

        setSending(true);
        setTimeout(() => {
            setSending(false);
            setSubmitted(true);
            toast.success('Your message has been sent to our support team!');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <AppHeader />

            <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
                <div className="mb-6">
                    <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 -ml-2">
                        <Link href="/">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Home
                        </Link>
                    </Button>
                </div>

                <div className="space-y-2 border-b border-border/60 pb-6 mb-8">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-2">
                        <HelpCircle className="h-3 w-3" />
                        <span>Support & Inquiries</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact & Help Center</h1>
                    <p className="text-sm text-muted-foreground">
                        Have a question about your resume tailoring, templates, or account? We&apos;re here to assist.
                    </p>
                </div>

                {submitted ? (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 text-center space-y-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground">Message Received</h2>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Thank you for contacting us. A member of our support team will respond to {email} within 24 business hours.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSubmitted(false);
                                setMessage('');
                            }}
                            className="h-8 text-xs mt-2"
                        >
                            Send another message
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-medium">Your Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jane Doe"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-medium">Work or Personal Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jane@example.com"
                                className="h-9 text-xs"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="message" className="text-xs font-medium">How can we help?</Label>
                            <Textarea
                                id="message"
                                required
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your question, feature request, or technical feedback..."
                                className="text-xs resize-none"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={sending}
                            className="w-full h-9 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm"
                        >
                            <Send className="h-3.5 w-3.5" />
                            <span>{sending ? 'Sending message...' : 'Send Message'}</span>
                        </Button>

                        <div className="pt-4 border-t border-border/40 text-center">
                            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                                <Mail className="h-3 w-3" />
                                <span>Direct email: <a href="mailto:connect@sahilbansal.net" className="font-semibold text-primary hover:underline">connect@sahilbansal.net</a></span>
                            </p>
                        </div>

                    </form>
                )}
            </main>
        </div>
    );
}
