"use client";

import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from './auth-provider';

export function AuthGuardCard({ compact = false }: { compact?: boolean }) {
    const { user, loading } = useAuth();
    if (loading || user) return null;

    return (
        <div className={`rounded-xl border border-primary/20 bg-primary/5 ${compact ? 'p-3' : 'p-4'}`}>
            <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-4 w-4 text-primary" />
                <div className="space-y-1">
                    <p className="text-sm font-medium">Login to unlock downloads</p>
                    <p className="text-sm text-muted-foreground">
                        Sign in to download PDF, export LaTeX, and use copy actions.
                    </p>
                    <div className="flex gap-2 pt-1">
                        <Button asChild size="sm">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                            <Link href="/signup">Sign up</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
