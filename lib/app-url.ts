/**
 * Canonical Application URL resolver.
 * Ensures all email verification, password reset, and auth callbacks
 * point to the active origin (works seamlessly on localhost, Vercel preview,
 * and https://lumacv.sahilbansal.net).
 */
export function getAppUrl(path: string = '', requestOrigin?: string): string {
    const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

    // 1. Explicit requestOrigin (from server request: request.nextUrl.origin)
    if (requestOrigin) {
        return `${requestOrigin.replace(/\/+$/, '')}${cleanPath}`;
    }

    // 2. Window location if running in browser (always reflects the exact host: localhost or lumacv.sahilbansal.net)
    if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin.replace(/\/+$/, '')}${cleanPath}`;
    }

    // 3. Explicit environment variable (NEXT_PUBLIC_APP_URL or APP_BASE_URL)
    const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL;
    if (envUrl) {
        return `${envUrl.replace(/\/+$/, '')}${cleanPath}`;
    }

    // 4. Vercel deployment URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}${cleanPath}`;
    }

    // 5. Default fallback based on NODE_ENV
    const defaultOrigin = process.env.NODE_ENV === 'production'
        ? 'https://lumacv.sahilbansal.net'
        : 'http://localhost:3000';

    return `${defaultOrigin}${cleanPath}`;
}

/**
 * Sanitizes a client-supplied redirect target (a `?redirect=`/`?next=` query
 * param) down to a same-origin relative path, or a fallback if it isn't one.
 * Without this, an attacker-crafted link like
 * `/login?redirect=https://evil.example/phish` would carry through into
 * both the post-login `router.push()` and (worse) the `emailRedirectTo`
 * sent to Supabase for the signup confirmation email, a link the user's own
 * email client shows as coming from this app's legitimate confirmation
 * email, redirecting to a phishing page after a real, trusted click.
 * Rejects anything with a scheme (`https://...`) and protocol-relative
 * URLs (`//evil.example`, which browsers resolve as a different host, not
 * a same-site path) in addition to requiring a leading `/`.
 */
export function sanitizeRedirectPath(path: string | null | undefined, fallback: string = '/dashboard'): string {
    if (!path) return fallback;
    const trimmed = path.trim();
    // Must be a single-slash relative path: rejects protocol-relative URLs
    // ("//evil.example" or "/\evil.example", the backslash form some
    // browsers also normalize to a protocol-relative URL) and, via the
    // "://" check, any absolute URL a lone leading slash wouldn't already
    // exclude.
    if (!/^\/(?!\/|\\)/.test(trimmed) || trimmed.includes('://')) {
        return fallback;
    }
    return trimmed;
}
