import { Metadata } from 'next';
import EditorPageContent from './editor-content';

export const metadata: Metadata = {
    title: 'Resume Editor, Manual Typst Studio | LumaCV',
    description: 'Edit your resume directly with real-time vector compilation. Reorder sections, switch templates, and export to PDF, DOCX, Markdown, or JSON, no account required to start.',
    openGraph: {
        title: 'Resume Editor, Manual Typst Studio | LumaCV',
        description: 'Edit your resume directly with real-time vector compilation. Switch templates and export in any format.',
        url: '/editor',
    },
    twitter: {
        title: 'Resume Editor, Manual Typst Studio | LumaCV',
        description: 'Edit your resume directly with real-time vector compilation. Switch templates and export in any format.',
    },
    alternates: { canonical: '/editor' },
};

export default function EditorPage() {
    return <EditorPageContent />;
}
