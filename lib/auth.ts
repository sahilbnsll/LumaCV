import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from './supabase/server';

export async function requireUser() {
    try {
        const supabase = createSupabaseServerClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            return {
                user: null,
                response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
            };
        }

        return { user, response: null };
    } catch (error) {
        return {
            user: null,
            response: NextResponse.json(
                { error: 'Auth unavailable', details: error instanceof Error ? error.message : 'Unknown error' },
                { status: 503 }
            ),
        };
    }
}
