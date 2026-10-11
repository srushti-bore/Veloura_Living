'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';

interface ForgotPasswordViewProps {
  onBackToSignIn: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onBackToSignIn,
  isLoading,
  setIsLoading,
  errorMessage,
  setErrorMessage,
}) => {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        setResetSent(true);
        if (data.data?.demoToken) {
          setDemoToken(data.data.demoToken);
        }
      } else {
        setErrorMessage(data.error?.message || 'Password reset request failed.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Network error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-[#FAF0E6] border border-[#7A4E2D]/30 text-[#4A2C1A] text-xs font-sans rounded-xl animate-fade-in">
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {resetSent ? (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-[#F2F7F2] border border-[#3A724B]/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-[#244C31]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3A724B]" />
              <p className="text-xs font-medium font-sans">
                Recovery instructions dispatched.
              </p>
            </div>
            <p className="text-[11px] text-[#244C31]/80 font-sans leading-relaxed">
              If an account is associated with <span className="font-semibold">{email}</span>, a secure password reset link has been dispatched to your inbox.
            </p>
          </div>

          {demoToken && (
            <div className="p-3 bg-[#FCFAF7] border border-[#D8C4AD] rounded-xl text-[11px] font-mono text-[#7A4E2D] break-all">
              <span className="font-sans font-medium block mb-1 uppercase tracking-wider text-[10px] text-[#A9794F]">
                Development Reset Link:
              </span>
              /auth/reset-password?token={demoToken}
            </div>
          )}

          <AuthButton type="button" variant="secondary" onClick={onBackToSignIn}>
            Return to Sign In
          </AuthButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <AuthInput
            type="email"
            name="email"
            placeholder="Enter your registered email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            icon={<Mail className="w-4 h-4" />}
            required
            autoComplete="email"
            aria-label="Email address"
          />

          <AuthButton
            type="submit"
            variant="primary"
            isLoading={isLoading}
            showArrow
          >
            Send Recovery Instructions
          </AuthButton>
        </form>
      )}
    </div>
  );
};
