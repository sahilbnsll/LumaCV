import { Metadata } from 'next';
import SupportPageContent from './support-content';

export const metadata: Metadata = {
    title: 'Donate & Sponsor | LumaCV',
    description: 'Support LumaCV\'s development through UPI donations, Buy Me a Coffee, or GitHub Sponsors — keeping the project free and open-source for everyone.',
    openGraph: {
        title: 'Donate & Sponsor | LumaCV',
        description: 'Support LumaCV\'s development through UPI donations, Buy Me a Coffee, or GitHub Sponsors.',
        url: '/support',
    },
    twitter: {
        title: 'Donate & Sponsor | LumaCV',
        description: 'Support LumaCV\'s development through UPI donations, Buy Me a Coffee, or GitHub Sponsors.',
    },
    alternates: { canonical: '/support' },
};

export default function SupportPage() {
    return <SupportPageContent />;
}
