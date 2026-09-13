import { Metadata } from 'next';
import DocsPageContent from './docs-content';

export const metadata: Metadata = {
    title: 'Documentation | LumaCV',
    description: 'Guides for using LumaCV: Typst templates, AI tailoring modes, BYOK provider keys, self-hosting with Docker, and troubleshooting.',
    openGraph: {
        title: 'Documentation | LumaCV',
        description: 'Guides for using LumaCV: Typst templates, AI tailoring modes, BYOK provider keys, self-hosting with Docker, and troubleshooting.',
        url: '/docs',
    },
    twitter: {
        title: 'Documentation | LumaCV',
        description: 'Guides for using LumaCV: Typst templates, AI tailoring modes, BYOK provider keys, self-hosting with Docker, and troubleshooting.',
    },
    alternates: { canonical: '/docs' },
};

export default function DocsPage() {
    return <DocsPageContent />;
}
