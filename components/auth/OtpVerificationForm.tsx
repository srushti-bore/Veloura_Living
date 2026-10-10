'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, ArrowRight, ArrowLeft, RotateCw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface OtpVerificationFormProps {
  email: string;
  challengeToken: string;
  onVerify: (otp: string) => Promise<{ success: boolean; message?: string }>;
  onResend: () => Promise<{ success: boolean; message?: string; cooldownSeconds?: number }>;
  onBackToSignIn: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
  successMessage?: string | null;
}

export function OtpVerificationForm({
  email,
  challengeToken,
  onVerify,
  onResend,
  onBackToSignIn,
  isLoading,
  errorMessage,
  clearError,
  successMessage,
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setValidationError('Please enter a valid 6-digit numeric verification code.');
      return;
    }

    await onVerify(cleanOtp);
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setResendStatus(null);
    setValidationError(null);
    clearError();

    try {
      const res = await onResend();
      if (res.success) {
        setCooldown(res.cooldownSeconds || 30);
        setResendStatus(res.message || 'New verification code dispatched to your email.');
        setOtp('');
      } else {
        setValidationError(res.message || 'Failed to resend verification code.');
      }
    } catch {
      setValidationError('Network error during resend. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <button
          type="button"
          onClick={onBackToSignIn}
          className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-[#7A4E2D] hover:text-[#3B2418] mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>

        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-[#7A4E2D]" />
          <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#4A2C1A] leading-tight">
            Security Verification.
          </h2>
        </div>
        <p className="font-sans text-xs text-[#735E4E] font-light">
          A 6-digit one-time code has been dispatched to{' '}
          <strong className="text-[#4A2C1A] font-medium">{email}</strong>.
        </p>
      </div>

      {/* Success Notification Banner */}
      {(successMessage || resendStatus) && !validationError && !errorMessage && (
        <div className="p-3 bg-[#F2F7F2] border-l-2 border-[#3A724B] text-[#244C31] text-xs font-sans rounded-sm animate-fade-in flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#3A724B] shrink-0" />
          <p className="font-medium">{resendStatus || successMessage}</p>
        </div>
      )}

      {/* Validation or API Error Banner */}
      {(validationError || errorMessage) && (
        <div className="p-3 bg-[#FAF0E6] border-l-2 border-[#7A4E2D] text-[#4A2C1A] text-xs font-sans rounded-sm animate-fade-in">
          <p className="font-medium">{validationError || errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        {/* 6-Digit OTP Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#4A2C1A]">
              6-Digit Authentication Code
            </label>
            <span className="text-[10px] text-[#B9AA99] font-mono">10m expiry</span>
          </div>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(val);
                if (validationError) setValidationError(null);
              }}
              placeholder="••••••"
              required
              className="w-full px-4 py-3 bg-[#FCFAF7] border border-[#D8C4AD] rounded-sm text-center font-mono text-xl tracking-[0.4em] text-[#4A2C1A] placeholder-[#B9AA99] focus:outline-none focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] transition-all"
            />
            <KeyRound className="absolute right-3.5 top-3.5 w-4 h-4 text-[#B9AA99] pointer-events-none" />
          </div>
        </div>

        {/* Primary Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full py-3 px-6 bg-[#3B2418] hover:bg-[#7A4E2D] text-[#FBF8F3] text-xs uppercase tracking-[0.2em] font-sans font-medium rounded-sm shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#FBF8F3]/30 border-t-[#FBF8F3] rounded-full animate-spin" />
                <span>Verifying Token...</span>
              </>
            ) : (
              <>
                <span>Verify &amp; Enter Atelier</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-[#E8D8C5]" />
              </>
            )}
          </button>
        </div>

        {/* Resend Cooldown Action */}
        <div className="pt-2 flex items-center justify-between text-xs font-sans text-[#735E4E]">
          <span>Did not receive code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="inline-flex items-center gap-1.5 font-medium text-[#7A4E2D] hover:text-[#3B2418] disabled:text-[#B9AA99] disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
            <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
