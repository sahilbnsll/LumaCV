import { Metadata } from 'next';
import ResetPasswordContent from './reset-password-content';

export const metadata: Metadata = {
    title: 'Set a New Password | LumaCV',
    description: 'Choose a new password for your LumaCV account.',
    alternates: { canonical: '/reset-password' },
};

export default function ResetPasswordPage() {
    return <ResetPasswordContent />;
}
