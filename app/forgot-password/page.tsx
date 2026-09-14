import { Metadata } from 'next';
import ForgotPasswordContent from './forgot-password-content';

export const metadata: Metadata = {
    title: 'Reset Your Password | LumaCV',
    description: 'Forgot your LumaCV password? Enter your account email to receive a secure password reset link.',
    alternates: { canonical: '/forgot-password' },
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordContent />;
}
