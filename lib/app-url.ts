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
