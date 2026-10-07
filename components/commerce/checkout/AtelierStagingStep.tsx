'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/providers/CheckoutProvider';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export const AtelierStagingStep: React.FC = () => {
  const router = useRouter();
  const { atelier, updateAtelier, markStepCompleted } = useCheckout();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markStepCompleted(3);
    router.push('/checkout/review');
  };

  const toggleService = (service: string) => {
    const current = atelier.additionalServices || [];
    if (current.includes(service)) {
      updateAtelier({ additionalServices: current.filter((s) => s !== service) });
    } else {
      updateAtelier({ additionalServices: [...current, service] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Counter & Heading */}
      <div>
        <span className="text-xs font-sans text-[#7A6B60]">
          Step 3 of 5
        </span>
        <h2 className="font-serif text-3xl sm:text-[34px] font-normal text-[#2B1810] tracking-tight mt-1">
          Atelier Staging
        </h2>
        <p className="text-xs sm:text-[13px] text-[#7A6B60] leading-relaxed mt-2 max-w-lg">
          Select your staging preferences and white-glove installation services.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-1">
        
        {/* Delivery Method Radios */}
        <div className="space-y-3">
          <label className="text-xs font-sans text-[#2B1810] font-medium block">
            Delivery Experience
          </label>
          <div className="space-y-2.5">
            {[
              {
                id: 'white_glove',
                title: 'White-Glove Delivery & Installation',
                desc: 'Delivered inside room of choice, unboxed, assembled by master joiners, packaging removed.',
                price: 'Complimentary',
                recommended: true,
              },
              {
                id: 'standard',
                title: 'Standard Doorstep Delivery',
                desc: 'Carefully packaged and safely delivered to your threshold or building entrance.',
                price: 'Complimentary',
              },
              {
                id: 'express',
                title: 'Express Priority Staging',
                desc: 'Guaranteed 48-hour expedited workshop dispatch with dedicated staging concierge.',
                price: '₹2,500',
              },
            ].map((option) => {
              const isSelected = (atelier.deliveryMethod || 'white_glove') === option.id;
              return (
                <label
                  key={option.id}
                  onClick={() => updateAtelier({ deliveryMethod: option.id as any })}
                  className={`flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F9F4ED] border-[#3B2314] shadow-sm'
                      : 'bg-[#F9F4ED]/60 border-[#D9CBC0] hover:border-[#3B2314]/60'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-[#3B2314] bg-[#3B2314]' : 'border-[#D9CBC0] bg-transparent'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#F5EFE6]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-[13px] font-sans font-medium text-[#2B1810]">
                          {option.title}
                        </span>
                        {option.recommended && (
                          <span className="text-[9px] font-sans px-2 py-0.5 rounded-full bg-[#3B2314]/10 text-[#3B2314] font-medium">
                            Signature
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#7A6B60] leading-relaxed mt-0.5">
                        {option.desc}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-mono font-medium shrink-0 pl-3 ${
                      option.price === 'Complimentary' ? 'text-[#486B4D]' : 'text-[#2B1810]'
                    }`}
                  >
                    {option.price}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Additional Services Checkboxes */}
        <div className="space-y-3 pt-1">
          <label className="text-xs font-sans text-[#2B1810] font-medium block">
            Additional Atelier Services (Optional)
          </label>
          <div className="space-y-2.5">
            {[
              {
                id: 'Precision Alignment',
                label: 'Precision Level Alignment & Felt Floor Protection',
                desc: 'Felt pads applied to all contact points and laser-leveled alignment.',
                price: 'Complimentary',
              },
              {
                id: 'Old Furniture Removal',
                label: 'Eco-Friendly Old Furniture Removal',
                desc: 'Responsible disassembly and sustainable recycling of existing piece.',
                price: '₹1,200',
              },
              {
                id: 'Wall Anchoring',
                label: 'Architectural Wall Anchoring',
                desc: 'Safety anti-tip anchoring for high storage cabinets and bookcases.',
                price: 'Complimentary',
              },
            ].map((srv) => {
              const isChecked = (atelier.additionalServices || []).includes(srv.id);
              return (
                <label
                  key={srv.id}
                  onClick={() => toggleService(srv.id)}
                  className={`flex items-start justify-between p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    isChecked ? 'bg-[#F9F4ED] border-[#3B2314]' : 'bg-[#F9F4ED]/60 border-[#D9CBC0]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked ? 'bg-[#3B2314] border-[#3B2314] text-[#F5EFE6]' : 'border-[#D9CBC0] bg-transparent'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-sans font-medium text-[#2B1810]">{srv.label}</div>
                      <div className="text-[11px] text-[#7A6B60] mt-0.5">{srv.desc}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-medium shrink-0 pl-3 ${
                      srv.price === 'Complimentary' ? 'text-[#486B4D]' : 'text-[#2B1810]'
                    }`}
                  >
                    {srv.price}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Special Instructions */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-sans text-[#2B1810] font-medium block">
            Special Staging &amp; Access Instructions (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Service elevator access, gate pass requirements, preferred delivery slot..."
            value={atelier.specialInstructions ?? ''}
            onChange={(e) => updateAtelier({ specialInstructions: e.target.value })}
            className="w-full bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-xl p-3.5 text-xs sm:text-[13px] text-[#2B1810] placeholder:text-[#A6978A] focus:outline-none focus:border-[#3B2314] transition-colors"
          />
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="pt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/checkout/delivery')}
            className="border border-[#D9CBC0] bg-transparent rounded-xl px-6 py-3 text-xs font-medium text-[#2B1810] flex items-center gap-2 hover:bg-[#EFE6DC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="bg-[#3B2314] hover:bg-[#2B1810] text-[#F5EFE6] rounded-xl px-8 py-3.5 text-xs font-medium transition-colors cursor-pointer shadow-sm flex items-center gap-2"
          >
            <span>Continue to Order Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
