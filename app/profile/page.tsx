import { Metadata } from 'next';
import ProfileContent from './profile-content';

export const metadata: Metadata = {
    title: 'Profile & Settings | LumaCV',
    description: 'Manage your LumaCV profile, preferences, authentication, BYOK API keys, and data & privacy controls.',
    openGraph: {
        title: 'Profile & Settings | LumaCV',
        description: 'Manage your LumaCV profile, preferences, authentication, BYOK API keys, and data & privacy controls.',
        url: '/profile',
    },
    twitter: {
        title: 'Profile & Settings | LumaCV',
        description: 'Manage your LumaCV profile, preferences, authentication, BYOK API keys, and data & privacy controls.',
    },
    alternates: { canonical: '/profile' },
    robots: { index: false, follow: false },
};

export default function ProfilePage() {
    return <ProfileContent />;
}
