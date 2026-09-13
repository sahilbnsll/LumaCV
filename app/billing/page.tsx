import { Metadata } from 'next';
import BillingContent from './billing-content';

export const metadata: Metadata = {
    title: 'Billing & Support | LumaCV',
    description: 'LumaCV is completely free for every job applicant. See what your plan includes and how to support the serverless Typst infrastructure.',
    openGraph: {
        title: 'Billing & Support | LumaCV',
        description: 'LumaCV is completely free for every job applicant. See what your plan includes and how to support the serverless Typst infrastructure.',
        url: '/billing',
    },
    twitter: {
        title: 'Billing & Support | LumaCV',
        description: 'LumaCV is completely free for every job applicant. See what your plan includes and how to support the serverless Typst infrastructure.',
    },
    alternates: { canonical: '/billing' },
    robots: { index: false, follow: false },
};

export default function BillingPage() {
    return <BillingContent />;
}
