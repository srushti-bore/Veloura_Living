'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/providers/CheckoutProvider';
import { ArrowLeft, ArrowRight, AlertCircle, ChevronDown, Lock } from 'lucide-react';

const INDIAN_STATES = [
  'Maharashtra',
  'Delhi NCR',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'West Bengal',
  'Rajasthan',
  'Uttar Pradesh',
  'Kerala',
  'Goa',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Andhra Pradesh',
  'Bihar',
  'Odisha',
  'Chandigarh',
  'Uttarakhand'
];

export const DeliveryStep: React.FC = () => {
  const router = useRouter();
  const { delivery, updateDelivery, validateDelivery, markStepCompleted } = useCheckout();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateDelivery();
    if (!validation.isValid) {
      setError(validation.error || 'Please fill in all required address fields.');
      return;
    }
    setError(null);
    markStepCompleted(2);
    router.push('/checkout/atelier');
  };

  return (
    <div className="space-y-6">
      {/* Step Counter & Heading */}
      <div>
        <span className="text-xs font-sans text-[#7A6B60]">
          Step 2 of 5
        </span>
        <h2 className="font-serif text-3xl sm:text-[34px] font-normal text-[#2B1810] tracking-tight mt-1">
          Delivery Destination
        </h2>
        <p className="text-xs sm:text-[13px] text-[#7A6B60] leading-relaxed mt-2 max-w-lg">
          Enter your delivery address so we can prepare and coordinate your order for a smooth delivery experience.
        </p>
      </div>

      {/* Validation Error Alert */}
      {error && (
        <div className="p-3.5 bg-red-50/90 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Address Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        
        {/* Address Line 1 */}
        <div>
          <label className="text-xs font-sans text-[#2B1810] font-medium block mb-1.5">
            Address Line 1 <span className="text-red-700">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="House name, building, street"
            value={delivery.address ?? ''}
            onChange={(e) => updateDelivery({ address: e.target.value })}
            className="w-full bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl px-4 py-3 text-xs sm:text-[13px] text-[#2B1810] placeholder:text-[#A6978A] focus:outline-none focus:border-[#3B2314] transition-colors"
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="text-xs font-sans text-[#2B1810] font-medium block mb-1.5">
            Address Line 2
          </label>
          <input
            type="text"
            placeholder="Apartment, suite, floor (optional)"
            value={delivery.apartment ?? ''}
            onChange={(e) => updateDelivery({ apartment: e.target.value })}
            className="w-full bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl px-4 py-3 text-xs sm:text-[13px] text-[#2B1810] placeholder:text-[#A6978A] focus:outline-none focus:border-[#3B2314] transition-colors"
          />
        </div>

        {/* City & State Row (2 Columns matching reference) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-sans text-[#2B1810] font-medium block mb-1.5">
              City <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter city"
              value={delivery.city ?? ''}
              onChange={(e) => updateDelivery({ city: e.target.value })}
              className="w-full bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl px-4 py-3 text-xs sm:text-[13px] text-[#2B1810] placeholder:text-[#A6978A] focus:outline-none focus:border-[#3B2314] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-sans text-[#2B1810] font-medium block mb-1.5">
              State <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={delivery.state ?? ''}
                onChange={(e) => updateDelivery({ state: e.target.value })}
                className="w-full bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl px-4 py-3 text-xs sm:text-[13px] text-[#2B1810] focus:outline-none focus:border-[#3B2314] transition-colors appearance-none cursor-pointer pr-10"
              >
                <option value="" disabled className="text-[#A6978A]">
                  Select state
                </option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st} className="text-[#2B1810] bg-[#FAF7F2]">
                    {st}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#7A6B60]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* PIN Code & Country Row (2 Columns matching reference) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-sans text-[#2B1810] font-medium block mb-1.5">
              PIN Code <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter PIN code"
              maxLength={6}
              value={delivery.pincode ?? ''}
              onChange={(e) => updateDelivery({ pincode: e.target.value })}
              className="w-full bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl px-4 py-3 text-xs sm:text-[13px] text-[#2B1810] placeholder:text-[#A6978A] focus:outline-none focus:border-[#3B2314] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-sans text-[#2B1810] font-medium block mb-1.5">
              Country <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <select
                disabled
                value="India"
                className="w-full bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl px-4 py-3 text-xs sm:text-[13px] text-[#2B1810] focus:outline-none transition-colors appearance-none cursor-default pr-10"
              >
                <option value="India">India</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#7A6B60]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Reassurance Banner */}
        <div className="p-4 bg-[#EFE7DD]/90 border border-[#E2D6C7] rounded-2xl flex items-start gap-3.5 text-xs mt-2">
          <div className="w-8 h-8 rounded-full border border-[#D9CBC0] bg-[#F4ECE1] flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4 text-[#3B2314] stroke-[1.5]" />
          </div>
          <div className="text-xs leading-snug">
            <div className="font-semibold text-[#2B1810]">We deliver across India with care.</div>
            <div className="text-[#7A6B60] text-[11px] mt-0.5">
              Your order will be safely packed and delivered to your doorstep.
            </div>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="pt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/checkout/identity')}
            className="border border-[#D9CBC0] bg-transparent rounded-xl px-6 py-3 text-xs font-medium text-[#2B1810] flex items-center gap-2 hover:bg-[#EFE6DC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="bg-[#3B2314] hover:bg-[#2B1810] text-[#F5EFE6] rounded-xl px-8 py-3.5 text-xs font-medium transition-colors cursor-pointer shadow-sm flex items-center gap-2"
          >
            <span>Continue to Atelier Staging</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
