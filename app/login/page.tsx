import { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthExperience } from '@/components/auth/AuthExperience';

export const metadata: Metadata = {
  title: 'Sign In | Veloura Living',
  description:
    'Access your private Veloura Living concierge profile, spaces, and tailored orders.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#EFE8DF] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#7A4E2D]/30 border-t-[#7A4E2D] rounded-full animate-spin" />
        </div>
      }
    >
      <AuthExperience isStandalone />
    </Suspense>
  );
}
