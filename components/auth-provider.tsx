"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import type { SupabaseClient } from '@supabase/supabase-js';

type AuthContextValue = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    supabase: SupabaseClient | null;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
    children,
    url,
    anonKey,
}: {
    children: React.ReactNode;
    url?: string;
    anonKey?: string;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = useMemo(() => {
        if (!url || !anonKey) return null;
        return createSupabaseBrowserClient(url, anonKey);
    }, [url, anonKey]);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session ?? null);
            setUser(data.session?.user ?? null);
            setLoading(false);
        });

        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession ?? null);
            setUser(nextSession?.user ?? null);
            setLoading(false);
        });

        return () => data.subscription.unsubscribe();
    }, [supabase]);

    const value: AuthContextValue = {
        user,
        session,
        loading,
        supabase,
        signOut: async () => {
            try {
                if (supabase) {
                    await supabase.auth.signOut();
                }
            } catch (e) {
                console.error("Supabase signOut error:", e);
            }
            if (typeof window !== 'undefined') {
                localStorage.removeItem('lumacv_saved_resumes');
                localStorage.removeItem('lumacv_resume_storage');
                localStorage.removeItem('lumacv_active_projects');
                localStorage.removeItem('lumacv_current_project_id');
                sessionStorage.clear();
            }
            setUser(null);
            setSession(null);
        },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
