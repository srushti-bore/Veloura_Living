'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { X } from 'lucide-react';
import { AuthLifestyleImage } from './AuthLifestyleImage';
import { AuthTabs } from './AuthTabs';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { OtpVerificationForm } from './OtpVerificationForm';

export function AuthExperience() {
  const {
    isAuthModalOpen,
    authModalView,
    otpChallenge,
    closeAuthModal,
    openAuthModal,
    login,
    register,
    verifyOtp,
    resendOtp,
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [prefilledEmail, setPrefilledEmail] = useState<string>('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await login(credentials);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || 'Invalid email or password.');
    } else if (res.requiresOtp) {
      setPrefilledEmail(credentials.email);
    }
    return res;
  };

  const handleSignUp = async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = await register(data);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || 'Registration failed. Please verify your details.');
    } else if (res.requiresOtp) {
      setPrefilledEmail(data.email);
    } else {
      setPrefilledEmail(data.email);
      setSuccessMessage('Account created successfully. Please sign in with your credentials.');
      openAuthModal('signin');
    }
    return res;
  };

  const handleVerifyOtp = async (otp: string) => {
    const targetEmail = otpChallenge?.email || prefilledEmail;
    const challengeToken = otpChallenge?.challengeToken || '';

    setIsLoading(true);
    setErrorMessage(null);
    const res = await verifyOtp({
      email: targetEmail,
      challengeToken,
      otp,
    });
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || 'Invalid verification code.');
    }
    return res;
  };

  const handleResendOtp = async () => {
    const targetEmail = otpChallenge?.email || prefilledEmail;
    const challengeToken = otpChallenge?.challengeToken || '';

    const res = await resendOtp({
      email: targetEmail,
      challengeToken,
    });
    return res;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#3B2418]/60 animate-fade-in"
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* 
        Solid Cream/Ivory Authentication Modal Container
        Strictly NO Glassmorphism: Solid surface, elegant borders, restrained luxury proportions
      */}
      <div
        className="relative w-full max-w-4xl bg-[#FBF8F3] rounded-xl md:rounded-2xl border border-[#D8C4AD] shadow-[0_25px_60px_-15px_rgba(59,36,24,0.25)] overflow-hidden transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Desktop / Tablet Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          {/* Left Side: Editorial Lifestyle Image (5 cols) */}
          <div className="hidden md:block md:col-span-5 relative">
            <AuthLifestyleImage />
          </div>

          {/* Right Side: Solid Authentication Surface (7 cols) */}
          <div className="col-span-1 md:col-span-7 flex flex-col justify-between p-6 sm:p-8 md:p-10 bg-[#FBF8F3]">
            {/* Top Bar / Branding */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      id="auth-modal-title"
                      className="font-serif text-xl sm:text-2xl font-medium tracking-[0.25em] text-[#4A2C1A]"
                    >
                      VELOURA
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#7A4E2D]" />
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#7A4E2D] font-sans font-medium">
                      Concierge Access
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#735E4E] font-sans font-light mt-0.5 tracking-wide">
                    Your space, thoughtfully curated.
                  </p>
                </div>

                {/* Subtle Close Button */}
                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="p-1.5 text-[#735E4E] hover:text-[#3B2418] hover:bg-[#F7F0E7] rounded-full transition-colors cursor-pointer"
                  aria-label="Close authentication modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs (Hidden in forgot-password and OTP verification mode) */}
              {authModalView !== 'forgot' && authModalView !== 'otp' && (
                <AuthTabs
                  activeTab={authModalView}
                  onTabChange={(tab) => {
                    setErrorMessage(null);
                    if (tab !== 'signin') setSuccessMessage(null);
                    openAuthModal(tab);
                  }}
                />
              )}

              {/* Active View Form */}
              <div className="mt-2">
                {authModalView === 'signin' && (
                  <SignInForm
                    onSubmit={handleSignIn}
                    onForgotPassword={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      openAuthModal('forgot');
                    }}
                    onSwitchToSignUp={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      openAuthModal('signup');
                    }}
                    isLoading={isLoading}
                    errorMessage={errorMessage}
                    clearError={() => setErrorMessage(null)}
                    successMessage={successMessage}
                    initialEmail={prefilledEmail}
                  />
                )}

                {authModalView === 'signup' && (
                  <SignUpForm
                    onSubmit={handleSignUp}
                    onSwitchToSignIn={() => {
                      setErrorMessage(null);
                      openAuthModal('signin');
                    }}
                    isLoading={isLoading}
                    errorMessage={errorMessage}
                    clearError={() => setErrorMessage(null)}
                  />
                )}

                {authModalView === 'otp' && (
                  <OtpVerificationForm
                    email={otpChallenge?.email || prefilledEmail || 'your email'}
                    challengeToken={otpChallenge?.challengeToken || ''}
                    onVerify={handleVerifyOtp}
                    onResend={handleResendOtp}
                    onBackToSignIn={() => {
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      openAuthModal('signin');
                    }}
                    isLoading={isLoading}
                    errorMessage={errorMessage}
                    clearError={() => setErrorMessage(null)}
                    successMessage={successMessage}
                  />
                )}

                {authModalView === 'forgot' && (
                  <ForgotPasswordForm
                    onBackToSignIn={() => {
                      setErrorMessage(null);
                      openAuthModal('signin');
                    }}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                  />
                )}
              </div>
            </div>

            {/* Bottom Footer Assurance Note */}
            <div className="mt-6 pt-4 border-t border-[#D8C4AD]/60 flex items-center justify-between text-[11px] font-sans text-[#735E4E]/80">
              <span>Private Architectural Atelier</span>
              <span>256-Bit Encrypted Concierge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
