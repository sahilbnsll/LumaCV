import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumacv.sahilbansal.net';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /builder and /editor are deliberately excluded here, both have a
        // public, guest-visible entry point (linked from the signed-out nav
        // and listed in sitemap.ts) and only gate specific actions behind
        // sign-in, so they should stay crawlable. Everything below is either
        // always user-specific data or a transactional auth flow with no SEO
        // value, and indexing it would surface stale/private content.
        disallow: [
          '/api/',
          '/dashboard/',
          '/profile/',
          '/auth/',
          '/applications/',
          '/settings/',
          '/forgot-password/',
          '/reset-password/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
