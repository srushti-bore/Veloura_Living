'use client';

import React, { useState } from 'react';
import { SocialProviderConfig } from './types';

interface SocialAuthButtonsProps {
  returnUrl?: string;
  className?: string;
  onNotice?: (message: string) => void;
  providers?: SocialProviderConfig[];
}

const defaultProviders: SocialProviderConfig[] = [
  {
    id: 'google',
    name: 'Google',
    label: 'Continue with Google',
    enabled: true,
  },
  {
    id: 'apple',
    name: 'Apple',
    label: 'Continue with Apple',
    enabled: false,
    unavailableNotice:
      'Apple Sign-In is being prepared for our upcoming Atelier release. Please continue with Google or your private email.',
  },
];

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  returnUrl = '/',
  className = '',
  onNotice,
  providers = defaultProviders,
}) => {
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  const handleProviderClick = (provider: SocialProviderConfig) => {
    if (!provider.enabled) {
      if (onNotice && provider.unavailableNotice) {
        onNotice(provider.unavailableNotice);
      }
      return;
    }

    if (provider.id === 'google') {
      setConnectingProvider('google');
      const destination = `/api/auth/google?returnUrl=${encodeURIComponent(returnUrl)}`;
      window.location.href = destination;
    }
  };

  return (
    <div className={`w-full space-y-2.5 ${className}`}>
      {providers.map((provider) => {
        const isConnecting = connectingProvider === provider.id;

        return (
          <button
            key={provider.id}
            type="button"
            onClick={() => handleProviderClick(provider)}
            disabled={Boolean(connectingProvider)}
            className="w-full py-3 px-4 bg-[#FAF7F2] hover:bg-[#F4ECE1] border border-[#E2D8CC] hover:border-[#D0C0B0] rounded-xl text-sm font-sans font-medium text-[#2B1D14] transition-all duration-200 flex items-center justify-center gap-3 shadow-xs hover:shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            {isConnecting ? (
              <span className="w-4 h-4 border-2 border-[#7A4E2D]/30 border-t-[#7A4E2D] rounded-full animate-spin" />
            ) : provider.id === 'google' ? (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            ) : provider.id === 'apple' ? (
              <svg className="w-4 h-4 shrink-0 fill-current text-[#2B1D14]" viewBox="0 0 170 170" aria-hidden="true">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.59-7.71-11.72-14-4.88-7.4-8.87-16.03-11.98-25.88-3.11-9.86-4.67-19.49-4.67-28.91 0-13.39 3.48-24.6 10.45-33.64 6.96-9.04 15.69-13.67 26.18-13.9 4.35 0 9.38 1.18 15.09 3.55 5.71 2.37 9.53 3.61 11.47 3.73 1.63-.12 5.58-1.42 11.86-3.9 6.27-2.48 11.39-3.5 15.35-3.07 15.52 1.34 26.96 7.37 34.33 18.09-13.9 8.44-20.69 19.98-20.36 34.61.32 11.42 4.67 20.89 13.06 28.4 3.81 3.51 8.16 6.13 13.06 7.86-2.61 7.62-5.71 14.86-9.3 21.72zM119.22 31.81c0-7.39 2.68-14.43 8.04-21.11 5.36-6.68 12.03-10.7 20.02-12.06.22 1.2.33 2.29.33 3.27 0 7.39-2.77 14.36-8.31 20.91-5.54 6.54-12.18 10.43-19.93 11.66-.05-.8-.15-1.69-.15-2.67z" />
              </svg>
            ) : null}
            <span>{isConnecting ? `Connecting to ${provider.name}...` : provider.label}</span>
          </button>
        );
      })}
    </div>
  );
};
