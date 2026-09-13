import { Metadata } from 'next';
import TemplatesPageContent from './templates-content';

export const metadata: Metadata = {
    title: 'Resume Templates — 52 Free Typst Designs | LumaCV',
    description: 'Browse 52 free, ATS-optimized resume templates rendered with sub-50ms Typst vector typesetting. Preview, filter by style, and start building instantly.',
    openGraph: {
        title: 'Resume Templates — 52 Free Typst Designs | LumaCV',
        description: 'Browse 52 free, ATS-optimized resume templates rendered with sub-50ms Typst vector typesetting.',
        url: '/templates',
    },
    twitter: {
        title: 'Resume Templates — 52 Free Typst Designs | LumaCV',
        description: 'Browse 52 free, ATS-optimized resume templates rendered with sub-50ms Typst vector typesetting.',
    },
    alternates: { canonical: '/templates' },
};

export default function TemplatesPage() {
    return <TemplatesPageContent />;
}
