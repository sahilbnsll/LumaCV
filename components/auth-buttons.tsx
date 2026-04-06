"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from './auth-provider';

export function AuthButtons() {
    const { user, loading, signOut } = useAuth();

    if (loading) {
        return <div className="text-xs text-muted-foreground">Checking session…</div>;
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                    <Link href="/signup">Sign up</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
                Logout
            </Button>
        </div>
    );
}
