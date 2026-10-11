'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { AuthContainer } from './AuthContainer';
import { AuthHeader } from './AuthHeader';
import { SignInView } from './SignInView';
import { SignUpView } from './SignUpView';
import { ForgotPasswordView } from './ForgotPasswordView';
import { OtpVerificationView } from './OtpVerificationView';
import { OtpProcessingView } from './OtpProcessingView';
import { AuthSuccessView } from './AuthSuccessView';
import { AuthFooter } from './AuthFooter';
import { AuthViewMode } from './types';

interface AuthExperienceProps {
  isStandalone?: boolean;
  initialView?: AuthViewMode;
  returnUrl?: string;
  onSuccess?: () => void;
}

export const AuthExperience: React.FC<AuthExperienceProps> = ({
  isStandalone = false,
  initialView = 'signin',
  returnUrl: propReturnUrl,
  onSuccess,
}) => {
  const router = useRouter();
  const [returnUrl, setReturnUrl] = useState(propReturnUrl || '');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qUrl = params.get('returnUrl') || params.get('redirect');
      if (qUrl && !propReturnUrl) setReturnUrl(qUrl);

      const qEmail = params.get('email');
      if (qEmail) setPrefilledEmail(qEmail);

      const qView = params.get('view');
      if (qView && ['signin', 'signup', 'otp', 'forgot'].includes(qView)) {
        setInternalView(qView as AuthViewMode);
      }
    }
  }, [propReturnUrl]);

  const {
    user,
    isAuthenticated,
    isAdmin,
    isAuthModalOpen,
    authModalView,
    otpChallenge,
    closeAuthModal,
    openAuthModal,
    login,
    register,
    verifyOtp,
    resendOtp,
    clearSession,
  } = useAuth();

  // Internal view state for standalone page, or synced with modal
  const [internalView, setInternalView] = useState<AuthViewMode>(initialView);
  const activeView =
    isStandalone || internalView === 'processing' || internalView === 'success'
      ? internalView
      : authModalView;

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authenticatedUserName, setAuthenticatedUserName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [prefilledEmail, setPrefilledEmail] = useState<string>('');

  // Close modal on Escape key if in modal mode
  useEffect(() => {
    if (isStandalone) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStandalone, isAuthModalOpen, closeAuthModal]);

  // If already authenticated and on standalone /login page on initial landing, redirect according to server-verified role.
  // Never prematurely redirect while the user is viewing the Login Successful screen!
  useEffect(() => {
    if (isStandalone && isAuthenticated && user && !isSuccess && activeView !== 'success') {
      if (user.roles?.includes('ADMIN')) {
        router.push('/admin');
      } else if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push('/account');
      }
    }
  }, [isStandalone, isAuthenticated, user, router, returnUrl, isSuccess, activeView]);

  const setViewMode = useCallback(
    (view: AuthViewMode) => {
      setErrorMessage(null);
      setNoticeMessage(null);
      setIsVerifying(false);
      setIsSuccess(false);
      setIsRedirecting(false);
      if (view !== 'signin') setSuccessMessage(null);

      if (isStandalone || view === 'processing' || view === 'success') {
        setInternalView(view);
      } else {
        openAuthModal(view);
      }
    },
    [isStandalone, openAuthModal]
  );

  // If in modal mode and modal is closed, render nothing
  if (!isStandalone && !isAuthModalOpen) return null;

  const handleSignIn = async (credentials: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setNoticeMessage(null);

    const res = await login({
      email: credentials.email,
      password: credentials.password,
    });
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Invalid email or password.');
    } else if (res.requiresOtp) {
      setPrefilledEmail(credentials.email);
      setViewMode('otp');
    } else {
      // In case server bypassed OTP, show reference-matched Login Successful with Continue button
      const resolvedName = user?.profile?.firstName || credentials.email.split('@')[0] || 'User';
      setAuthenticatedUserName(resolvedName);
      setIsSuccess(true);
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
    setNoticeMessage(null);
    setSuccessMessage(null);

    const res = await register(data);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Registration failed. Please verify your details.');
    } else if (res.requiresOtp) {
      setPrefilledEmail(data.email);
      setViewMode('otp');
    } else {
      setPrefilledEmail(data.email);
      setSuccessMessage('Account created successfully. Please sign in with your credentials.');
      setViewMode('signin');
    }
    return res;
  };

  const handleVerifyOtp = async (otp: string) => {
    const targetEmail = otpChallenge?.email || prefilledEmail;
    const challengeToken = otpChallenge?.challengeToken || '';
    const challengeType = otpChallenge?.type || 'LOGIN';

    setIsLoading(true);
    setIsVerifying(true);
    setErrorMessage(null);
    setNoticeMessage(null);

    try {
      const res = await verifyOtp({
        email: targetEmail,
        challengeToken,
        otp,
      });

      if (!res.success) {
        setIsVerifying(false);
        setIsLoading(false);
        setErrorMessage(res.message || 'Invalid verification code. Please check and try again.');
        return res;
      }

      // Strict Flow 1: New User Registration Flow
      if (challengeType === 'REGISTER') {
        // Step 5 & 6: The new Customer account is created and persisted securely.
        // Direct the user to the existing Sign In view because authentication requires separate login.
        // Completing registration alone must NOT display the Login Successful screen
        // or grant an active authenticated session.
        await clearSession();
        setIsVerifying(false);
        setIsLoading(false);
        setIsSuccess(false);
        setPrefilledEmail(targetEmail);
        setSuccessMessage('Account created and verified successfully. Please enter your password to sign in.');
        setViewMode('signin');
        return res;
      }

      // Strict Flow 2: Existing User (or New User who signed in) Login OTP Flow
      // Step 8 & 9: Server verified login OTP. Valid authenticated session established.
      // Only now display the Login Successful screen matching the attached reference image!
      setIsVerifying(false);
      setIsLoading(false);
      const resolvedName =
        res.user?.profile?.firstName ||
        user?.profile?.firstName ||
        res.user?.email?.split('@')[0] ||
        user?.email?.split('@')[0] ||
        'User';
      setAuthenticatedUserName(resolvedName);
      setIsSuccess(true);
      // Wait for user to click "Continue" button — do NOT auto-redirect!
      return res;
    } catch {
      setIsVerifying(false);
      setIsLoading(false);
      setErrorMessage('Network error during verification. Please try again.');
      return { success: false, message: 'Network error' };
    }
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

  // Authoritative server-verified role-based redirect executed upon Continue click
  const handlePostAuthRedirect = async () => {
    setIsRedirecting(true);
    if (onSuccess) onSuccess();

    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        const verifiedRoles: string[] = meData?.data?.user?.roles || [];

        if (verifiedRoles.includes('ADMIN')) {
          router.push('/admin');
          if (!isStandalone) closeAuthModal();
          return;
        }
      }
    } catch {
      // ignore network error
    }

    if (returnUrl) {
      router.push(returnUrl);
    } else if (isStandalone) {
      router.push('/account');
    }

    if (!isStandalone) {
      closeAuthModal();
    }
  };

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'signup':
        return 'Create your account';
      case 'otp':
        return 'Verify Your Email';
      case 'forgot':
        return 'Recover password';
      case 'signin':
      default:
        return 'Sign in to your account';
    }
  };

  const getHeaderSubtitle = () => {
    if (activeView === 'otp') {
      const emailDisplay = otpChallenge?.email || prefilledEmail || 'user@example.com';
      return (
        <span className="inline-block text-[#5C4535] leading-relaxed">
          We&apos;ve sent a 6-digit OTP to
          <span className="block font-medium text-[#2B1D14] mt-0.5">{emailDisplay}</span>
        </span>
      );
    }
    return undefined;
  };

  const isProcessingScreen = isVerifying || activeView === 'processing';
  const isSuccessScreen = isSuccess || activeView === 'success';

  const content = (
    <AuthContainer
      onClose={closeAuthModal}
      showCloseButton={!isStandalone && !isProcessingScreen && !isSuccessScreen}
    >
      {isProcessingScreen ? (
        <OtpProcessingView />
      ) : isSuccessScreen ? (
        <AuthSuccessView
          userName={
            authenticatedUserName ||
            user?.profile?.firstName ||
            user?.email?.split('@')[0] ||
            'User'
          }
          onContinue={handlePostAuthRedirect}
          isLoading={isRedirecting}
        />
      ) : (
        <div className="flex flex-col justify-between h-full space-y-5">
          {/* Top Header with official logo and view heading */}
          <AuthHeader
            title={getHeaderTitle()}
            subtitle={getHeaderSubtitle()}
            align={activeView === 'otp' ? 'center' : 'left'}
          />

          {/* Dynamic Provider / Feature Notice (e.g. Apple sign-in guidance) */}
          {noticeMessage && (
            <div className="p-3 bg-[#FAF4ED] border border-[#D8B486]/50 text-[#7A4E2D] text-xs font-sans rounded-xl animate-fade-in flex items-start justify-between gap-2">
              <span>{noticeMessage}</span>
              <button
                type="button"
                onClick={() => setNoticeMessage(null)}
                className="text-[#7A4E2D] hover:text-[#4A2C1A] text-xs font-semibold"
              >
                ✕
              </button>
            </div>
          )}

          {/* View Switcher */}
          <div className="flex-1 flex flex-col justify-center">
            {activeView === 'signin' && (
              <SignInView
                onSubmit={handleSignIn}
                onForgotPassword={() => setViewMode('forgot')}
                isLoading={isLoading}
                errorMessage={errorMessage}
                clearError={() => setErrorMessage(null)}
                successMessage={successMessage}
                initialEmail={prefilledEmail}
                onNotice={(msg) => setNoticeMessage(msg)}
              />
            )}

            {activeView === 'signup' && (
              <SignUpView
                onSubmit={handleSignUp}
                isLoading={isLoading}
                errorMessage={errorMessage}
                clearError={() => setErrorMessage(null)}
                onNotice={(msg) => setNoticeMessage(msg)}
              />
            )}

            {activeView === 'otp' && (
              <OtpVerificationView
                email={otpChallenge?.email || prefilledEmail || 'user@example.com'}
                challengeToken={otpChallenge?.challengeToken || ''}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onBackToSignIn={() => setViewMode('signin')}
                isLoading={isLoading}
                errorMessage={errorMessage}
                clearError={() => setErrorMessage(null)}
                successMessage={successMessage}
              />
            )}

            {activeView === 'forgot' && (
              <ForgotPasswordView
                onBackToSignIn={() => setViewMode('signin')}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
              />
            )}
          </div>

          {/* Bottom Footer with View Switch and Legal Links (hidden on OTP view where Back to login is integrated) */}
          {activeView !== 'otp' && (
            <AuthFooter
              view={activeView}
              onSwitchView={setViewMode}
              termsUrl="/terms"
              privacyUrl="/privacy"
            />
          )}
        </div>
      )}
    </AuthContainer>
  );

  // Standalone Full-Page Layout on warm ivory/sand canvas
  if (isStandalone) {
    return (
      <div className="min-h-screen w-full bg-[#EFE8DF] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 font-sans select-text">
        {content}
      </div>
    );
  }

  // Modal Backdrop Mode (when opened from Header or in-flow actions)
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#2B1810]/60 backdrop-blur-xs animate-fade-in"
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {content}
    </div>
  );
};
