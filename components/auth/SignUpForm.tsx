'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface SignUpFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  onSwitchToSignIn: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
}

export function SignUpForm({
  onSubmit,
  onSwitchToSignIn,
  isLoading,
  errorMessage,
  clearError,
}: SignUpFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!firstName.trim()) {
      setValidationError('Please enter your first name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match. Please verify.');
      return;
    }

    await onSubmit({
      email,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
      <div>
        <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#4A2C1A] leading-tight mb-1">
          Join The Atelier.
        </h2>
        <p className="font-sans text-xs text-[#735E4E] font-light">
          Create your private profile for tailored architectural curation &amp; wishlist sync.
        </p>
      </div>

      {/* Validation or API Error Banner */}
      {(validationError || errorMessage) && (
        <div className="p-3 bg-[#FAF0E6] border-l-2 border-[#7A4E2D] text-[#4A2C1A] text-xs font-sans rounded-sm animate-fade-in">
          <p className="font-medium">{validationError || errorMessage}</p>
        </div>
      )}

      {/* Name Fields (2 Columns) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label className="block text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#4A2C1A]">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Eleanor"
            required
            className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#D8C4AD] rounded-sm text-xs font-sans text-[#4A2C1A] placeholder-[#B9AA99] focus:outline-none focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#4A2C1A]">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Vance"
            className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#D8C4AD] rounded-sm text-xs font-sans text-[#4A2C1A] placeholder-[#B9AA99] focus:outline-none focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] transition-all"
          />
        </div>
      </div>

      {/* Email Address */}
      <div className="space-y-1">
        <label className="block text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#4A2C1A]">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="eleanor.vance@example.com"
            required
            className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#D8C4AD] rounded-sm text-xs font-sans text-[#4A2C1A] placeholder-[#B9AA99] focus:outline-none focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] transition-all"
          />
          <Mail className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#B9AA99] pointer-events-none" />
        </div>
      </div>

      {/* Phone Number (Optional Concierge Contact) */}
      <div className="space-y-1">
        <label className="block text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#4A2C1A]">
          Phone <span className="text-[10px] text-[#B9AA99] normal-case">(for White-Glove dispatch)</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#D8C4AD] rounded-sm text-xs font-sans text-[#4A2C1A] placeholder-[#B9AA99] focus:outline-none focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] transition-all"
          />
          <Phone className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#B9AA99] pointer-events-none" />
        </div>
      </div>

      {/* Password & Confirm Password (2 Columns) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label className="block text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#4A2C1A]">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Min. 6 chars"
              required
              className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#D8C4AD] rounded-sm text-xs font-sans text-[#4A2C1A] placeholder-[#B9AA99] focus:outline-none focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] transition-all"
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-sans font-medium uppercase tracking-[0.15em] text-[#4A2C1A]">
              Confirm
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[10px] text-[#7A4E2D] hover:text-[#3B2418] cursor-pointer"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Repeat password"
            required
            className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#D8C4AD] rounded-sm text-xs font-sans text-[#4A2C1A] placeholder-[#B9AA99] focus:outline-none focus:border-[#7A4E2D] focus:ring-1 focus:ring-[#7A4E2D] transition-all"
          />
        </div>
      </div>

      {/* Primary Create Account Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 bg-[#3B2418] hover:bg-[#7A4E2D] text-[#FBF8F3] text-xs uppercase tracking-[0.2em] font-sans font-medium rounded-sm shadow-sm transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[#FBF8F3]/30 border-t-[#FBF8F3] rounded-full animate-spin" />
              <span>Creating Profile...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-[#E8D8C5]" />
            </>
          )}
        </button>
      </div>

      {/* Secondary Switch to Sign In */}
      <div className="pt-1 text-center">
        <p className="text-xs font-sans text-[#735E4E] font-light">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-medium text-[#4A2C1A] hover:text-[#7A4E2D] underline-offset-2 hover:underline transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
}
