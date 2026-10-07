'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/providers/CheckoutProvider';
import { useAuth } from '@/providers/AuthProvider';
import { ChevronDown, ArrowLeft, AlertCircle } from 'lucide-react';

export const IdentityStep: React.FC = () => {
  const router = useRouter();
  const { identity, updateIdentity, validateIdentity, markStepCompleted } = useCheckout();
  const { isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateIdentity();
    if (!validation.isValid) {
      setError(validation.error || 'Please fill in all required identity fields.');
      return;
    }
    setError(null);
    markStepCompleted(1);
    router.push('/checkout/delivery');
  };

  return (
    <div className="space-y-6">
      {/* Step Counter & Heading */}
      <div>
        <span className="text-xs font-sans text-[#7A6B60]">
          Step 1 of 5
        </span>
        <h2 className="font-serif text-3xl sm:text-[34px] font-normal text-[#2B1810] tracking-tight mt-1">
          Client Identity
        </h2>
        <p className="text-xs sm:text-[13px] text-[#7A6B60] leading-relaxed mt-2 max-w-lg">
          Let&apos;s get to know you. This helps us personalize your experience and keep you updated on your order.
        </p>
      </div>

      {/* Guest / Account Pill Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => updateIdentity({ isGuest: true })}
          className={`px-6 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            identity.isGuest || !isAuthenticated
              ? 'bg-[#3B2314] text-[#F5EFE6] font-medium shadow-sm'
              : 'bg-transparent text-[#5A483C] border border-[#D9CBC0] hover:border-[#3B2314]'
          }`}
        >
          Continue as Guest
        </button>
        <button
          type="button"
          onClick={() => {
            updateIdentity({ isGuest: false });
            const btn = document.querySelector('[data-auth-trigger="true"]') as HTMLButtonElement;
            if (btn) btn.click();
          }}
          className="px-6 py-2.5 rounded-xl border border-[#D9CBC0] bg-transparent text-[#5A483C] hover:border-[#3B2314] transition-colors cursor-pointer text-xs font-medium"
        >
          Already have an account?
        </button>
      </div>

      {/* Authenticated user notification if logged in */}
      {isAuthenticated && user && (
        <div className="p-3 bg-[#EFE7DD] border border-[#D9CBC0] rounded-xl text-xs text-[#557A5A] flex items-center gap-2">
          <span>
            Signed in as <strong>{identity.fullName || user.email}</strong>
          </span>
        </div>
      )}

      {/* Validation Error Alert */}
      {error && (
        <div className="p-3.5 bg-red-50/90 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Identity Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        
        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-sans text-[#2B1810] font-medium block mb-1.5">
              First Name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter your first name"
              value={identity.firstName ?? ''}
              onChange={(e) =>
                updateIdentity({
                  firstName: e.target.value,
                  fullName: `${e.target.value} ${identity.lastName ?? ''}`.trim(),
                })
              }
              className="w-full bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl px-4 py-3 text-xs sm:text-[13px] text-[#2B1810] placeholder:text-[#A6978A] focus:outline-none focus:border-[#3B2314] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-sans text-[#2B1810] font-medium block mb-1.5">
              Last Name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter your last name"
              value={identity.lastName ?? ''}
              onChange={(e) =>
                updateIdentity({
                  lastName: e.target.value,
                  fullName: `${identity.firstName ?? ''} ${e.target.value}`.trim(),
                })
              }
              className="w-full bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl px-4 py-3 text-xs sm:text-[13px] text-[#2B1810] placeholder:text-[#A6978A] focus:outline-none focus:border-[#3B2314] transition-colors"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="text-xs font-sans text-[#2B1810] font-medium block mb-1.5">
            Email Address <span className="text-red-700">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={identity.email ?? ''}
            onChange={(e) => updateIdentity({ email: e.target.value })}
            className="w-full bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl px-4 py-3 text-xs sm:text-[13px] text-[#2B1810] placeholder:text-[#A6978A] focus:outline-none focus:border-[#3B2314] transition-colors"
          />
        </div>

        {/* Phone Number with +91 Country Code */}
        <div>
          <label className="text-xs font-sans text-[#2B1810] font-medium block mb-1.5">
            Phone Number <span className="text-red-700">*</span>
          </label>
          <div className="flex items-center gap-2.5">
            <div className="bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl px-3.5 py-3 flex items-center gap-1.5 text-xs text-[#2B1810] font-medium shrink-0 cursor-default select-none">
              <span>+91</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7A6B60]" />
            </div>
            <input
              type="tel"
              required
              placeholder="Enter phone number"
              value={identity.phone ?? ''}
              onChange={(e) => updateIdentity({ phone: e.target.value })}
              className="w-full bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl px-4 py-3 text-xs sm:text-[13px] text-[#2B1810] placeholder:text-[#A6978A] focus:outline-none focus:border-[#3B2314] transition-colors"
            />
          </div>
        </div>

        {/* News & Offers Opt-in */}
        <div className="pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(identity.keepUpdated)}
              onChange={(e) => updateIdentity({ keepUpdated: e.target.checked })}
              className="w-4 h-4 rounded border-[#D9CBC0] text-[#3B2314] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#3B2314]"
            />
            <span className="text-xs text-[#5A483C]">
              Keep me updated with news, offers and design inspiration.
            </span>
          </label>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="pt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/shop')}
            className="border border-[#D9CBC0] bg-transparent rounded-xl px-6 py-3 text-xs font-medium text-[#2B1810] flex items-center gap-2 hover:bg-[#EFE6DC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="bg-[#3B2314] hover:bg-[#2B1810] text-[#F5EFE6] rounded-xl px-8 py-3.5 text-xs font-medium transition-colors cursor-pointer shadow-sm"
          >
            Continue to Delivery
          </button>
        </div>
      </form>
    </div>
  );
};
