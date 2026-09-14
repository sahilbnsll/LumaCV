import { Metadata } from 'next';
import ApplicationsContent from './applications-content';

export const metadata: Metadata = {
    title: 'Job Application Tracker | LumaCV',
    description: 'Track job applications across every stage, organize by company, role, and status, and tailor a resume version to each one.',
    openGraph: {
        title: 'Job Application Tracker | LumaCV',
        description: 'Track job applications across every stage, organize by company, role, and status, and tailor a resume version to each one.',
        url: '/applications',
    },
    twitter: {
        title: 'Job Application Tracker | LumaCV',
        description: 'Track job applications across every stage, organize by company, role, and status, and tailor a resume version to each one.',
    },
    alternates: { canonical: '/applications' },
    robots: { index: false, follow: false },
};

export default function ApplicationsPage() {
    return <ApplicationsContent />;
}
