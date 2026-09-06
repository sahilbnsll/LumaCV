import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumacv.sahilbansal.net';
  const now = new Date();

  const routes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/builder', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/templates', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/features', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/demo', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/docs', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/showcase', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/billing', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/support', changeFrequency: 'monthly' as const, priority: 0.5 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
