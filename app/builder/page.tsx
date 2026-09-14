import { Metadata } from 'next';
import BuilderPageContent from './builder-content';

export const metadata: Metadata = {
    title: 'AI Resume Optimizer, Tailor to Any Job Description | LumaCV',
    description: 'Upload your resume, paste a job description, and get an ATS-optimized, fact-checked rewrite in seconds, compiled to a vector PDF with Typst.',
    openGraph: {
        title: 'AI Resume Optimizer, Tailor to Any Job Description | LumaCV',
        description: 'Upload your resume, paste a job description, and get an ATS-optimized, fact-checked rewrite in seconds.',
        url: '/builder',
    },
    twitter: {
        title: 'AI Resume Optimizer, Tailor to Any Job Description | LumaCV',
        description: 'Upload your resume, paste a job description, and get an ATS-optimized, fact-checked rewrite in seconds.',
    },
    alternates: { canonical: '/builder' },
};

export default function BuilderPage() {
    return <BuilderPageContent />;
}
