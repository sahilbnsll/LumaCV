import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Security headers live in next.config.mjs's headers() as the single
  // source of truth (CSP, HSTS, X-Frame-Options, etc). This used to also
  // set X-Frame-Options/Referrer-Policy/Permissions-Policy here, duplicating
  // (and for X-Frame-Options, disagreeing with) that config, only
  // X-DNS-Prefetch-Control stays here since it's harmless to duplicate and
  // not worth adding to the static config for one header.
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    // Bypass all static files, images, icons, fonts, and internal Next.js assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)',
  ],
};
