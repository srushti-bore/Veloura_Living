'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { gsap } from 'gsap';

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
  initialCooldown?: number;
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
  initialCooldown = 45,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState<number>(initialCooldown);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const boxesContainerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. GSAP subtle staggered entrance for the 6 OTP input boxes
  useEffect(() => {
    if (!boxesContainerRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        boxesContainerRef.current?.children || [],
        { opacity: 0, y: 12, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.05,
          ease: 'power2.out',
        }
      );
    }, boxesContainerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // 2. Countdown timer ticking every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Format seconds to mm:ss (e.g. 45 -> 00:45)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 3. Digit input changes & auto-advance
  const handleDigitChange = (index: number, value: string) => {
    if (validationError) setValidationError(null);
    clearError();
    setResendStatus(null);

    // Support pasted multi-character input in a single field
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      handlePasteCode(cleaned);
      return;
    }

    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Focus next box if digit entered
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 filled
    if (char && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        onVerify(fullCode);
      }
    }
  };

  // 4. Keyboard navigation (Backspace, Left/Right arrows)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current box is empty, clear previous box and focus it
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 5. Paste handler
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    handlePasteCode(pasted);
  };

  const handlePasteCode = (code: string) => {
    const clean = code.slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = clean[i] || '';
    }
    setDigits(newDigits);

    const focusIdx = Math.min(clean.length, 5);
    inputRefs.current[focusIdx]?.focus();

    if (clean.length === 6) {
      onVerify(clean);
    }
  };

  // 6. Manual form submission via "Verify" button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const fullCode = digits.join('').trim();
    if (fullCode.length !== 6) {
      setValidationError('Please enter all 6 digits of the verification code.');
      // Focus first empty digit
      const emptyIdx = digits.findIndex((d) => !d);
      if (emptyIdx !== -1) {
        inputRefs.current[emptyIdx]?.focus();
      }
      return;
    }

    await onVerify(fullCode);
  };

  // 7. Resend OTP handler
  const handleResendClick = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setResendStatus(null);
    setValidationError(null);
    clearError();

    try {
      const res = await onResend();
      if (res.success) {
        setCooldown(res.cooldownSeconds || 45);
        setResendStatus(res.message || 'A fresh verification code has been dispatched.');
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setValidationError(res.message || 'Unable to dispatch new code. Please try again shortly.');
      }
    } catch {
      setValidationError('A temporary network error occurred. Please check your connection.');
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      <form onSubmit={handleSubmit} autoComplete="off" className="w-full flex flex-col items-center space-y-6">
        {/* Success / Resend Notification Banner */}
        {(resendStatus || successMessage) && !validationError && !errorMessage && (
          <div className="w-full p-3 bg-[#F2F7F2] border border-[#3A724B]/30 text-[#244C31] text-xs font-sans rounded-xl animate-fade-in text-center font-medium">
            {resendStatus || successMessage}
          </div>
        )}

        {/* Validation or API Error Banner */}
        {(validationError || errorMessage) && (
          <div className="w-full p-3 bg-[#FAF0E6] border border-[#7A4E2D]/30 text-[#4A2C1A] text-xs font-sans rounded-xl animate-fade-in text-center font-medium">
            {validationError || errorMessage}
          </div>
        )}

        {/* Six Individual OTP Input Boxes */}
        <div
          ref={boxesContainerRef}
          className="flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 w-full py-1 select-none"
        >
          {digits.map((digit, index) => {
            const hasError = Boolean(validationError || errorMessage);
            const isFilled = Boolean(digit);

            return (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                id={`otp-digit-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                autoFocus={index === 0}
                aria-label={`Digit ${index + 1} of 6`}
                className={`w-11 h-14 sm:w-13 sm:h-16 md:w-14 md:h-17 rounded-xl sm:rounded-2xl text-center text-xl sm:text-2xl font-sans font-medium text-[#2B1D14] bg-[#FAF7F2] border transition-all duration-200 outline-none select-none shadow-[0_1px_3px_rgba(43,29,20,0.04)] ${
                  hasError
                    ? 'border-[#A34235] text-[#A34235] focus:ring-1 focus:ring-[#A34235]'
                    : isFilled
                    ? 'border-[#D4C3B2] bg-[#FAF5EE]'
                    : 'border-[#E6DDD0] hover:border-[#D8C7B5] focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] focus:bg-white'
                }`}
              />
            );
          })}
        </div>

        {/* Countdown Timer & Resend Action */}
        <div className="text-center font-sans text-xs sm:text-sm text-[#735E4E] pt-0.5">
          {cooldown > 0 ? (
            <p className="font-light tracking-wide">
              Resend OTP in <span className="font-mono font-medium text-[#4A2C1A]">{formatTime(cooldown)}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendClick}
              disabled={isResending}
              className="font-medium text-[#4A2C1A] hover:text-[#2B1D14] underline underline-offset-4 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isResending ? 'Dispatching new OTP...' : 'Resend OTP'}
            </button>
          )}
        </div>

        {/* Prominent Brown Verify Button */}
        <div className="w-full pt-1">
          <button
            type="submit"
            disabled={isLoading || !isComplete}
            className="w-full py-3.5 sm:py-4 px-6 bg-[#452611] hover:bg-[#341C0C] active:scale-[0.99] text-[#FAF7F2] rounded-xl font-sans text-sm sm:text-base font-medium tracking-wide shadow-[0_2px_10px_rgba(69,38,17,0.22)] hover:shadow-[0_4px_16px_rgba(69,38,17,0.30)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                <span>Verifying...</span>
              </span>
            ) : (
              <span>Verify</span>
            )}
          </button>
        </div>

        {/* Back to login link */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onBackToSignIn}
            className="font-sans text-xs sm:text-sm text-[#735E4E] hover:text-[#2B1D14] transition-colors cursor-pointer hover:underline underline-offset-4 font-light"
          >
            Back to login
          </button>
        </div>
      </form>

      {/* Subtle 4-Point Luxury Star/Sparkle Asset matching bottom right of reference card */}
      <div className="hidden sm:block absolute bottom-6 right-6 text-[#D8C4AD]/50 pointer-events-none">
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
        </svg>
      </div>
    </div>
  );
};
