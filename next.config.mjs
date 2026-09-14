/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint now runs during builds — the real app code lints clean (0 errors),
  // and reference/scratch directories are excluded via .eslintrc.json so they
  // can't accidentally break a production deploy.
  poweredByHeader: false,
  compress: true,
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
    return [
      {
        source: '/(.*)',
        headers: [
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
