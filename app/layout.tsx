import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AuthProvider } from '@/components/auth-provider';
import dynamic from 'next/dynamic';

const FeedbackWidget = dynamic(
  () => import('@/components/feedback-widget').then((m) => m.FeedbackWidget),
  { ssr: false }
);
const DarkModeBackground = dynamic(
  () => import('@/components/dark-mode-background').then((m) => m.DarkModeBackground),
  { ssr: false }
);
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://lumacv.sahilbansal.net'),
  title: 'LumaCV',
  description: 'Free, open-source resume builder with instant Typst vector PDF typesetting, 100% factual ATS integrity, and client-side privacy.',
  applicationName: 'LumaCV',
  authors: [{ name: 'LumaCV Team' }],
  keywords: [
    'resume builder',
    'typst resume',
    'open source resume builder',
    'ats friendly resume',
    'free resume maker',
    'latex resume alternative',
    'vector pdf resume',
    'ai resume tailoring',
  ],
  creator: 'LumaCV',
  publisher: 'LumaCV',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lumacv.sahilbansal.net',
    siteName: 'LumaCV',
    title: 'LumaCV, Open-Source AI Resume Builder & Typst Typesetter',
    description: 'Free, open-source resume builder with instant Typst vector PDF typesetting, 100% factual ATS integrity, and client-side privacy.',
    // No `images` override here: app/opengraph-image.tsx generates a correctly-
    // sized (1200x630) social preview at request time and Next.js wires it into
    // this metadata automatically. The previous hardcoded image was a portrait
    // resume render mislabeled as 1200x630, so it rendered cropped on every
    // social platform, don't reintroduce a static override here.
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LumaCV, Open-Source AI Resume Builder & Typst Typesetter',
    description: 'Free, open-source resume builder with instant Typst vector PDF typesetting, 100% factual ATS integrity, and client-side privacy.',
    creator: '@sahilbansalll',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/icon.svg',
    // iOS home-screen icons need a raster format, SVG doesn't render there.
    apple: [{ url: '/logo.png', type: 'image/png', sizes: '320x320' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'LumaCV',
    url: 'https://lumacv.sahilbansal.net',
    description: 'Free, open-source AI resume builder with instant Typst vector PDF typesetting, 100% factual ATS integrity, and client-side privacy.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Instant Typst vector PDF typesetting',
      '100% factual ATS integrity guarantee',
      'Client-side privacy with zero telemetry',
      '52 professional resume design archetypes',
      'Real-time job description gap analysis',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only text-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-hidden"
        >
          Skip to main content
        </a>
        <AuthProvider url={supabaseUrl} anonKey={supabaseAnonKey}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <DarkModeBackground />
            <div className="relative z-10 flex flex-col min-h-screen">
              {children}
            </div>
            <FeedbackWidget />
            <Toaster />
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
