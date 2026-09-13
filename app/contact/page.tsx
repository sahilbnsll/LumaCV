import { Metadata } from 'next';
import ContactPageContent from './contact-content';

export const metadata: Metadata = {
    title: 'Contact | LumaCV',
    description: 'Get in touch with the LumaCV team for support, bug reports, or partnership inquiries.',
    openGraph: {
        title: 'Contact | LumaCV',
        description: 'Get in touch with the LumaCV team for support, bug reports, or partnership inquiries.',
        url: '/contact',
    },
    twitter: {
        title: 'Contact | LumaCV',
        description: 'Get in touch with the LumaCV team for support, bug reports, or partnership inquiries.',
    },
    alternates: { canonical: '/contact' },
};

export default function ContactPage() {
    return <ContactPageContent />;
}
