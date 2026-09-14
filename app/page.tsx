import { Metadata } from 'next';
import HomeContent from './home-content';

// The homepage previously had no page-specific metadata: app/page.tsx was a
// "use client" component, which structurally cannot export `metadata`, so
// Google indexed it under the generic root title ("LumaCV") instead of a
// homepage-tuned title/description/canonical. The interactive landing page
// itself (HomeContent) stays a client component; this thin server wrapper
// only exists to carry metadata for the highest-value URL on the site.
export const metadata: Metadata = {
    title: 'LumaCV, Open-Source AI Resume Builder & Typst Typesetter',
    description: 'Build an ATS-optimized resume with instant Typst vector PDF typesetting, zero-hallucination AI tailoring, and client-side privacy. Free, open source, no signup required to start.',
    alternates: { canonical: '/' },
    openGraph: {
        title: 'LumaCV, Open-Source AI Resume Builder & Typst Typesetter',
        description: 'Build an ATS-optimized resume with instant Typst vector PDF typesetting, zero-hallucination AI tailoring, and client-side privacy.',
        url: '/',
    },
    twitter: {
        title: 'LumaCV, Open-Source AI Resume Builder & Typst Typesetter',
        description: 'Build an ATS-optimized resume with instant Typst vector PDF typesetting, zero-hallucination AI tailoring, and client-side privacy.',
    },
};

export default function HomePage() {
    return <HomeContent />;
}
