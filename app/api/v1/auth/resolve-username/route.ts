import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ratelimit } from '@/lib/rate-limit';

// Resolves a chosen username to its account email so the client can sign in
// via normal email/password auth. Requires the service-role key because
// looking up another user's row in `profiles` is intentionally blocked for
// anon/authenticated clients by RLS.
export async function POST(req: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: 'Username sign-in is not configured.' }, { status: 501 });
    }

    // This endpoint returns a real account email for a valid username, so
    // without a limiter here it's a free, unlimited account-enumeration
    // primitive. Reuses the same per-IP limiter the AI routes use.
    const ip = req.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
        return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    let username: unknown;
    try {
        ({ username } = await req.json());
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (typeof username !== 'string' || !username.trim()) {
        return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', username.trim())
        .maybeSingle();

    if (error) {
        console.error('[resolve-username] lookup failed:', error);
        return NextResponse.json({ error: 'Unable to look up username right now.' }, { status: 500 });
    }

    // Same generic response whether the username doesn't exist or the lookup
    // is empty, don't let this endpoint be used to enumerate accounts.
    if (!data?.email) {
        return NextResponse.json({ error: 'No account found for that username.' }, { status: 404 });
    }

    return NextResponse.json({ email: data.email });
}
