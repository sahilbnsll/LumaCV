import { Metadata } from 'next';
import DemoPageContent from './demo-content';

export const metadata: Metadata = {
    title: 'Live Demo | LumaCV',
    description: 'See LumaCV in action — instant Typst PDF compilation, live ATS scoring, and AI-assisted resume tailoring, no signup required to explore.',
    openGraph: {
        title: 'Live Demo | LumaCV',
        description: 'See LumaCV in action — instant Typst PDF compilation, live ATS scoring, and AI-assisted resume tailoring.',
        url: '/demo',
    },
    twitter: {
        title: 'Live Demo | LumaCV',
        description: 'See LumaCV in action — instant Typst PDF compilation, live ATS scoring, and AI-assisted resume tailoring.',
    },
    alternates: { canonical: '/demo' },
};

export default function DemoPage() {
    return <DemoPageContent />;
}
