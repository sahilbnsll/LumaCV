import { Metadata } from 'next';
import AtsCheckerPageContent from './ats-content';

export const metadata: Metadata = {
    title: 'Free ATS Resume Checker | LumaCV',
    description: 'Check whether your resume PDF is machine-readable by Applicant Tracking Systems. See exactly what text an ATS extracts, free and instant, no signup required.',
    openGraph: {
        title: 'Free ATS Resume Checker | LumaCV',
        description: 'Check whether your resume PDF is machine-readable by Applicant Tracking Systems, free and instant.',
        url: '/ats',
    },
    twitter: {
        title: 'Free ATS Resume Checker | LumaCV',
        description: 'Check whether your resume PDF is machine-readable by Applicant Tracking Systems, free and instant.',
    },
    alternates: { canonical: '/ats' },
};

export default function AtsCheckerPage() {
    return <AtsCheckerPageContent />;
}
