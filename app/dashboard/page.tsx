import { Metadata } from 'next';
import DashboardContent from './dashboard-content';

export const metadata: Metadata = {
    title: 'My Resumes | LumaCV',
    description: 'Your resume workspace — manage saved resumes, track ATS match scores, and jump into the Typst studio or job application tracker.',
    openGraph: {
        title: 'My Resumes | LumaCV',
        description: 'Your resume workspace — manage saved resumes, track ATS match scores, and jump into the Typst studio or job application tracker.',
        url: '/dashboard',
    },
    twitter: {
        title: 'My Resumes | LumaCV',
        description: 'Your resume workspace — manage saved resumes, track ATS match scores, and jump into the Typst studio or job application tracker.',
    },
    alternates: { canonical: '/dashboard' },
    robots: { index: false, follow: false },
};

export default function DashboardPage() {
    return <DashboardContent />;
}
