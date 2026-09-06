import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAppUrl } from '@/lib/app-url';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const origin = request.nextUrl.origin || requestUrl.origin;
    const code = requestUrl.searchParams.get('code');
    const token_hash = requestUrl.searchParams.get('token_hash');
    const type = requestUrl.searchParams.get('type');
    const nextParam = requestUrl.searchParams.get('next') ?? '/builder';
    const safeNext = nextParam.startsWith('/') ? nextParam : '/builder';
    const emailTypes = new Set(['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']);

    const supabase = createSupabaseServerClient();

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            console.error('Session exchange error:', error);
            return NextResponse.redirect(getAppUrl('/login?error=Invalid+or+expired+link.+Please+log+in.', origin));
        }
    } else if (token_hash && type && emailTypes.has(type)) {
        const { error } = await supabase.auth.verifyOtp({
            type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email',
            token_hash,
        });
        if (error) {
            console.error('Verify OTP error:', error);
            return NextResponse.redirect(getAppUrl('/login?error=Invalid+or+expired+link.+Please+log+in.', origin));
        }
    }

    return NextResponse.redirect(getAppUrl(safeNext, origin));
}
