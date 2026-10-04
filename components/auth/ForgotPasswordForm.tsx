'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
}

export function ForgotPasswordForm({
  onBackToSignIn,
  isLoading,
  setIsLoading,
  errorMessage,
  setErrorMessage,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
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
    <div className="space-y-4">
      <div>
        <button
          type="button"
          onClick={onBackToSignIn}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#7A4E2D] hover:text-[#3B2418] mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>

        <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#4A2C1A] leading-tight mb-1">
          Recover Password.
        </h2>
        <p className="font-sans text-xs text-[#735E4E] font-light">
          Enter your registered email address to receive a secure password recovery token.
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-[#FAF0E6] border-l-2 border-[#7A4E2D] text-[#4A2C1A] text-xs font-sans rounded-sm">
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Success View */}
      {resetSent ? (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-[#F7F0E7] border border-[#D8C4AD] rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-[#4A2C1A]">
              <CheckCircle2 className="w-4 h-4 text-[#7A4E2D]" />
              <span className="font-sans font-medium text-xs">Reset Instructions Dispatched</span>
            </div>
            <p className="font-sans text-xs text-[#735E4E] font-light">
              A private reset link has been queued for <strong className="text-[#4A2C1A] font-medium">{email}</strong>.
            </p>

            {demoToken && (
              <div className="mt-3 pt-3 border-t border-[#D8C4AD]">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#735E4E] mb-1">
                  <KeyRound className="w-3 h-3 text-[#7A4E2D]" />
                  <span>Demo Environment Token:</span>
                </div>
                <code className="block p-2 bg-[#FBF8F3] border border-[#D8C4AD] text-[10px] font-mono text-[#4A2C1A] break-all rounded-sm select-all">
                  {demoToken}
                </code>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onBackToSignIn}
            className="w-full py-3 px-6 bg-[#3B2418] hover:bg-[#7A4E2D] text-[#FBF8F3] text-xs uppercase tracking-[0.2em] font-sans font-medium rounded-sm transition-all text-center cursor-pointer"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#4A2C1A]">
              Registered Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                required
                className="w-full px-3.5 py-2.5 bg-[#FCFAF7] border border-[#D8C4AD] rounded-sm text-xs font-sans text-[#4A2C1A] placeholder-[#B9AA99] focus:outline-none focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] transition-all"
              />
              <Mail className="absolute right-3 top-2.5 w-4 h-4 text-[#B9AA99] pointer-events-none" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-[#3B2418] hover:bg-[#7A4E2D] text-[#FBF8F3] text-xs uppercase tracking-[0.2em] font-sans font-medium rounded-sm shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#FBF8F3]/30 border-t-[#FBF8F3] rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Instructions</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-[#E8D8C5]" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
