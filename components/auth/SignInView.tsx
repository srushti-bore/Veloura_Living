'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';
import { SocialAuthButtons } from './SocialAuthButtons';

interface SignInViewProps {
  onSubmit: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<any>;
  onForgotPassword: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
  successMessage?: string | null;
  initialEmail?: string;
  allowRememberMe?: boolean;
  onNotice?: (msg: string) => void;
}

export const SignInView: React.FC<SignInViewProps> = ({
  onSubmit,
  onForgotPassword,
  isLoading,
  errorMessage,
  clearError,
  successMessage,
  initialEmail = '',
  allowRememberMe = true,
  onNotice,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    await onSubmit({
      email: cleanEmail,
      password,
      rememberMe: allowRememberMe ? rememberMe : false,
    });
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="w-full space-y-4">
      {/* Success Notification Banner */}
      {successMessage && !validationError && !errorMessage && (
        <div className="p-3 bg-[#F2F7F2] border border-[#3A724B]/30 text-[#244C31] text-xs font-sans rounded-xl animate-fade-in flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#3A724B] shrink-0" />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {/* Validation or API Error Banner */}
      {(validationError || errorMessage) && (
        <div className="p-3 bg-[#FAF0E6] border border-[#7A4E2D]/30 text-[#4A2C1A] text-xs font-sans rounded-xl animate-fade-in">
          <p className="font-medium">{validationError || errorMessage}</p>
        </div>
      )}

      {/* Email Address Input */}
      <AuthInput
        type="email"
        name="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (validationError) setValidationError(null);
        }}
        icon={<Mail className="w-4 h-4" />}
        required
        autoComplete="email"
        aria-label="Email address"
      />

      {/* Password Input */}
      <AuthInput
        type="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (validationError) setValidationError(null);
        }}
        icon={<Lock className="w-4 h-4" />}
        showPasswordToggle
        required
        autoComplete="current-password"
        aria-label="Password"
      />

      {/* Auxiliary Row: Remember me & Forgot Password? */}
      <div className="flex items-center justify-between text-xs font-sans pt-0.5">
        {allowRememberMe ? (
          <label className="flex items-center gap-2 text-[#5C4535] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#D8C4AD] text-[#4A2C1A] accent-[#4A2C1A] focus:ring-[#7A4E2D] focus:ring-offset-0 cursor-pointer"
            />
            <span>Remember me</span>
          </label>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onForgotPassword}
          className="text-[#5C4535] hover:text-[#2B1D14] transition-colors hover:underline cursor-pointer"
        >
          Forgot password?
        </button>
      </div>

      {/* Primary Continue Button */}
      <div className="pt-1">
        <AuthButton
          type="submit"
          variant="primary"
          isLoading={isLoading}
          showArrow
        >
          Continue
        </AuthButton>
      </div>

      {/* Social Providers */}
      <div className="pt-1">
        <SocialAuthButtons returnUrl="/" onNotice={onNotice} />
      </div>
    </form>
  );
};
