import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const token_hash = requestUrl.searchParams.get('token_hash');
    const type = requestUrl.searchParams.get('type');
    const next = requestUrl.searchParams.get('next') ?? '/builder';
    const emailTypes = new Set(['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']);

    if (token_hash && type && emailTypes.has(type)) {
        const supabase = createSupabaseServerClient();
        await supabase.auth.verifyOtp({
            type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email',
            token_hash,
        });
    }

    return NextResponse.redirect(new URL(next, request.url));
}
