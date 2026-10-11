'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, RotateCw, ArrowLeft } from 'lucide-react';
import { AuthButton } from './AuthButton';

interface OtpVerificationViewProps {
  email: string;
  challengeToken: string;
  onVerify: (otp: string) => Promise<any>;
  onResend: () => Promise<any>;
  onBackToSignIn: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
  successMessage?: string | null;
}

export const OtpVerificationView: React.FC<OtpVerificationViewProps> = ({
  email,
  onVerify,
  onResend,
  onBackToSignIn,
  isLoading,
  errorMessage,
  clearError,
  successMessage,
}) => {
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (!cleanOtp || cleanOtp.length !== 6) {
      setValidationError('Please enter a valid 6-digit verification code.');
      return;
    }

    await onVerify(cleanOtp);
  };

  const handleResendClick = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setResendStatus(null);
    setValidationError(null);
    clearError();

    try {
      const res = await onResend();
      if (res.success) {
        setCooldown(res.cooldownSeconds || 30);
        setResendStatus(res.message || 'New verification code dispatched.');
        setOtp('');
      } else {
        setValidationError(res.message || 'Failed to resend code.');
      }
    } catch {
      setValidationError('Network error occurred during resend.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="w-full space-y-4">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBackToSignIn}
          className="inline-flex items-center gap-1.5 text-xs font-sans text-[#7A4E2D] hover:text-[#2B1D14] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      </div>

      {/* Target Notice */}
      <div className="p-3.5 bg-[#FAF7F2] border border-[#E2D8CC] rounded-xl space-y-1">
        <div className="flex items-center gap-2 text-[#4A2C1A]">
          <ShieldCheck className="w-4 h-4 text-[#7A4E2D]" />
          <span className="text-xs font-medium font-sans">
            Mandatory Security Verification
          </span>
        </div>
        <p className="text-[11px] font-sans text-[#735E4E] leading-relaxed">
          A 6-digit authentication passcode was sent to{' '}
          <strong className="text-[#2B1D14] font-semibold">{email}</strong>.
        </p>
      </div>

      {/* Success / Resend Status Banner */}
      {(resendStatus || successMessage) && !validationError && !errorMessage && (
        <div className="p-3 bg-[#F2F7F2] border border-[#3A724B]/30 text-[#244C31] text-xs font-sans rounded-xl animate-fade-in">
          {resendStatus || successMessage}
        </div>
      )}

      {/* Error Banner */}
      {(validationError || errorMessage) && (
        <div className="p-3 bg-[#FAF0E6] border border-[#7A4E2D]/30 text-[#4A2C1A] text-xs font-sans rounded-xl animate-fade-in">
          {validationError || errorMessage}
        </div>
      )}

      {/* 6-Digit Code Input */}
      <div className="space-y-1">
        <label
          htmlFor="otp-code-input"
          className="block text-[11px] font-sans font-medium uppercase tracking-[0.12em] text-[#5C4535]"
        >
          Security Code
        </label>
        <input
          id="otp-code-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            setOtp(val);
            if (validationError) setValidationError(null);
          }}
          placeholder="••••••"
          className="w-full py-3.5 px-4 bg-[#FAF7F2] border border-[#E2D8CC] focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] focus:bg-white rounded-xl text-center text-2xl font-mono tracking-[0.5em] text-[#2B1D14] placeholder-[#C2B5A8] focus:outline-none transition-all"
          autoFocus
          required
        />
      </div>

      {/* Submit Button */}
      <AuthButton
        type="submit"
        variant="primary"
        isLoading={isLoading}
        showArrow
      >
        Verify &amp; Access Atelier
      </AuthButton>

      {/* Resend Action */}
      <div className="flex items-center justify-between text-xs font-sans pt-1">
        <span className="text-[#735E4E]">Didn&apos;t receive code?</span>
        <button
          type="button"
          onClick={handleResendClick}
          disabled={cooldown > 0 || isResending}
          className="inline-flex items-center gap-1.5 font-medium text-[#4A2C1A] hover:text-[#2B1D14] disabled:text-[#A89887] transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          <span>{cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}</span>
        </button>
      </div>
    </form>
  );
};
