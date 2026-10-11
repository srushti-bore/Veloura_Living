'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';
import { SocialAuthButtons } from './SocialAuthButtons';

interface SignUpViewProps {
  onSubmit: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<any>;
  isLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
  onNotice?: (msg: string) => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({
  onSubmit,
  isLoading,
  errorMessage,
  clearError,
  onNotice,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!firstName.trim()) {
      setValidationError('Please enter your first name.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    await onSubmit({
      email: cleanEmail,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="w-full space-y-3.5">
      {/* Validation or API Error Banner */}
      {(validationError || errorMessage) && (
        <div className="p-3 bg-[#FAF0E6] border border-[#7A4E2D]/30 text-[#4A2C1A] text-xs font-sans rounded-xl animate-fade-in">
          <p className="font-medium">{validationError || errorMessage}</p>
        </div>
      )}

      {/* Name Inputs (2 Columns) */}
      <div className="grid grid-cols-2 gap-2.5">
        <AuthInput
          type="text"
          name="firstName"
          placeholder="First name"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
            if (validationError) setValidationError(null);
          }}
          icon={<User className="w-4 h-4" />}
          required
          autoComplete="given-name"
          aria-label="First name"
        />
        <AuthInput
          type="text"
          name="lastName"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
          aria-label="Last name"
        />
      </div>

      {/* Email Input */}
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

      {/* Phone Input (Optional) */}
      <AuthInput
        type="tel"
        name="phone"
        placeholder="Phone number (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        icon={<Phone className="w-4 h-4" />}
        autoComplete="tel"
        aria-label="Phone number"
      />

      {/* Password Input */}
      <AuthInput
        type="password"
        name="password"
        placeholder="Password (minimum 6 characters)"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (validationError) setValidationError(null);
        }}
        icon={<Lock className="w-4 h-4" />}
        showPasswordToggle
        required
        autoComplete="new-password"
        aria-label="Password"
      />

      {/* Submit Button */}
      <div className="pt-1">
        <AuthButton
          type="submit"
          variant="primary"
          isLoading={isLoading}
          showArrow
        >
          Create Account
        </AuthButton>
      </div>

      {/* Social Providers */}
      <div className="pt-0.5">
        <SocialAuthButtons returnUrl="/" onNotice={onNotice} />
      </div>
    </form>
  );
};
