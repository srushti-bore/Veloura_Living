'use client';

import React from 'react';
import Link from 'next/link';
import { AuthViewMode } from './types';

interface AuthFooterProps {
  view: AuthViewMode;
  onSwitchView: (view: AuthViewMode) => void;
  termsUrl?: string;
  privacyUrl?: string;
  showSparkle?: boolean;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({
  view,
  onSwitchView,
  termsUrl = '/terms',
  privacyUrl = '/privacy',
  showSparkle = true,
}) => {
  return (
    <div className="relative w-full pt-4 text-center select-none">
      {/* Switch View Toggle */}
      {view === 'signin' && (
        <p className="text-xs font-sans text-[#735E4E]">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitchView('signup')}
            className="font-semibold text-[#2B1D14] hover:text-[#4A2C1A] hover:underline transition-colors cursor-pointer"
          >
            Create Account
          </button>
        </p>
      )}

      {view === 'signup' && (
        <p className="text-xs font-sans text-[#735E4E]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitchView('signin')}
            className="font-semibold text-[#2B1D14] hover:text-[#4A2C1A] hover:underline transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </p>
      )}

      {view === 'forgot' && (
        <p className="text-xs font-sans text-[#735E4E]">
          Remember your password?{' '}
          <button
            type="button"
            onClick={() => onSwitchView('signin')}
            className="font-semibold text-[#2B1D14] hover:text-[#4A2C1A] hover:underline transition-colors cursor-pointer"
          >
            Back to Sign In
          </button>
        </p>
      )}

      {/* Legal Disclaimers */}
      <p className="text-[11px] font-sans text-[#8C7A6D] mt-2 font-light">
        By continuing, you agree to our{' '}
        <Link
          href={termsUrl}
          className="text-[#5C4535] underline underline-offset-2 hover:text-[#2B1D14] transition-colors"
        >
          Terms of Service
        </Link>{' '}
        &amp;{' '}
        <Link
          href={privacyUrl}
          className="text-[#5C4535] underline underline-offset-2 hover:text-[#2B1D14] transition-colors"
        >
          Privacy Policy
        </Link>
        .
      </p>

      {/* Delicate 4-Point Luxury Star/Sparkle Asset matching the reference image's bottom right detail */}
      {showSparkle && (
        <div className="hidden sm:block absolute -bottom-2 -right-2 text-[#D8C4AD]/60 pointer-events-none">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
          </svg>
        </div>
      )}
    </div>
  );
};
