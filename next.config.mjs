/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint now runs during builds — the real app code lints clean (0 errors),
  // and reference/scratch directories are excluded via .eslintrc.json so they
  // can't accidentally break a production deploy.
  poweredByHeader: false,
  compress: true,
  images: {
    // AVIF first: typically 20-30% smaller than WebP at the same quality,
    // next/image falls back to webp/original per-browser support automatically.
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./bin/**/*', './typst/**/*'],
    },
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-slot',
      'clsx',
      'tailwind-merge',
      'sonner',
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;

    // pdfjs-dist is only used client-side; avoid bundling it on the server
    // and prevent Next.js from generating overly-long chunk paths that 404.
    // The `$` suffix makes this an EXACT-match alias (bare `import
    // 'pdfjs-dist'` only) — without it, webpack treats the key as a path
    // prefix and rewrites every deeper subpath import too, which broke
    // `pdfjs-dist/legacy/build/pdf.min.mjs` (used for broader mobile/older-
    // browser worker compatibility) by resolving it as
    // 'pdfjs-dist/build/pdf.min.mjs/legacy/build/pdf.min.mjs'.
    if (!isServer) {
      config.resolve.alias['pdfjs-dist$'] = 'pdfjs-dist/build/pdf.min.mjs';
    }

    return config;
  },
  async headers() {
    // Wildcarded rather than reading the exact project ref from
    // NEXT_PUBLIC_SUPABASE_URL: the URL itself isn't a secret (it's paired
    // with the public anon key and protected by RLS), and the wildcard
    // means this doesn't need to change if the project ref ever does.
    const supabaseOrigins = 'https://*.supabase.co wss://*.supabase.co';
    // 'unsafe-inline' on script-src/style-src is a real, known gap, not an
    // oversight: the root layout renders an inline JSON-LD <script>, and
    // components/ui/image-stream-hero.tsx injects a <style> tag at runtime
    // for its keyframe animations. Closing this fully means a nonce-based
    // CSP threaded through every page, a larger, riskier change than this
    // pass covers. Everything else here (restricted origins, no plugins,
    // no framing, no base-uri override) is real, enforced hardening even
    // with that gap, this is materially better than no CSP at all.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      `connect-src 'self' ${supabaseOrigins} https://api.github.com`,
      // 'self' + blob: because the resume editor's live PDF preview embeds
      // a blob: URL in an <iframe>, confirmed by testing against the real
      // editor flow, 'none' silently broke the preview. This only affects
      // what this site can frame, not whether other sites can frame this
      // site, that's frame-ancestors below plus X-Frame-Options.
      "frame-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/icon.svg',
      },
    ];
  },
};

export default nextConfig;
