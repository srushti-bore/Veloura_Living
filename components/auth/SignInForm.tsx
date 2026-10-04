'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface SignInFormProps {
  onSubmit: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  onForgotPassword: () => void;
  onSwitchToSignUp: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
}

export function SignInForm({
  onSubmit,
  onForgotPassword,
  onSwitchToSignUp,
  isLoading,
  errorMessage,
  clearError,
}: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    await onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#4A2C1A] leading-tight mb-1">
          Welcome back.
        </h2>
        <p className="font-sans text-xs text-[#735E4E] font-light">
          Enter your private concierge credentials to access your spaces and orders.
        </p>
      </div>

      {/* Validation or API Error Banner */}
      {(validationError || errorMessage) && (
        <div className="p-3 bg-[#FAF0E6] border-l-2 border-[#7A4E2D] text-[#4A2C1A] text-xs font-sans rounded-sm animate-fade-in">
          <p className="font-medium">{validationError || errorMessage}</p>
        </div>
      )}

      {/* Email Address */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#4A2C1A]">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            name="veloura_user_email"
            autoComplete="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="client@example.com"
            required
            className="w-full px-3.5 py-2.5 bg-[#FCFAF7] border border-[#D8C4AD] rounded-sm text-xs font-sans text-[#4A2C1A] placeholder-[#B9AA99] focus:outline-none focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] transition-all"
          />
          <Mail className="absolute right-3 top-2.5 w-4 h-4 text-[#B9AA99] pointer-events-none" />
        </div>
      </div>

      {/* Password with Show/Hide Toggle */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#4A2C1A]">
            Password
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[11px] font-sans text-[#7A4E2D] hover:text-[#3B2418] transition-colors underline-offset-2 hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="veloura_user_password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="••••••••••••"
            required
            className="w-full px-3.5 py-2.5 bg-[#FCFAF7] border border-[#D8C4AD] rounded-sm text-xs font-sans text-[#4A2C1A] placeholder-[#B9AA99] focus:outline-none focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-[#B9AA99] hover:text-[#4A2C1A] transition-colors cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Primary Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 bg-[#3B2418] hover:bg-[#7A4E2D] text-[#FBF8F3] text-xs uppercase tracking-[0.2em] font-sans font-medium rounded-sm shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[#FBF8F3]/30 border-t-[#FBF8F3] rounded-full animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-[#E8D8C5]" />
            </>
          )}
        </button>
      </div>

      {/* Secondary Switch to Sign Up */}
      <div className="pt-2 text-center">
        <p className="text-xs font-sans text-[#735E4E] font-light">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-medium text-[#4A2C1A] hover:text-[#7A4E2D] underline-offset-2 hover:underline transition-colors cursor-pointer"
          >
            Create Account
          </button>
        </p>
      </div>
    </form>
  );
}
