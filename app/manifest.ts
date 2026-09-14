import { MetadataRoute } from 'next';

// No manifest existed despite `viewport.themeColor` already being set in
// app/layout.tsx, so there was no installable-PWA metadata (name, icons,
// start_url) for browsers/OSes that look for one. Reuses the same icon
// assets already referenced in app/layout.tsx's `icons` field.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LumaCV, Open-Source Resume Builder',
    short_name: 'LumaCV',
    description: 'Free, open-source resume builder with instant Typst vector PDF typesetting and client-side privacy.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/logo.png', type: 'image/png', sizes: '320x320' },
    ],
  };
}
