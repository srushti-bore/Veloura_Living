'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { useCurrency } from '@/providers/CurrencyProvider';
import { useCheckout } from '@/providers/CheckoutProvider';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const OrderReviewStep: React.FC = () => {
  const router = useRouter();
  const { cart } = useStore();
  const { formatPrice } = useCurrency();
  const { identity, delivery, atelier, markStepCompleted } = useCheckout();

  const handleProceed = () => {
    markStepCompleted(4);
    router.push('/checkout/payment');
  };

  const getStagingLabel = () => {
    if (atelier.deliveryMethod === 'white_glove') return 'White-Glove Delivery & Installation';
    if (atelier.deliveryMethod === 'express') return 'Express Priority Staging (48h Dispatch)';
    return 'Standard Delivery (7-10 business days)';
  };

  return (
    <div className="space-y-6">
      {/* Step Counter & Heading */}
      <div>
        <span className="text-xs font-sans text-[#7A6B60]">
          Step 4 of 5
        </span>
        <h2 className="font-serif text-3xl sm:text-[34px] font-normal text-[#2B1810] tracking-tight mt-1">
          Order &amp; Vault Review
        </h2>
        <p className="text-xs sm:text-[13px] text-[#7A6B60] leading-relaxed mt-2 max-w-lg">
          Please review your details before proceeding to payment.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        {/* Card 1: Your Order */}
        <div className="bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-[13px] font-sans font-medium text-[#2B1810]">
              Your Order
            </h3>
            <Link
              href="/cart"
              className="text-xs font-medium text-[#2B1810] hover:text-[#3B2314] transition-colors"
            >
              Edit
            </Link>
          </div>

          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 pt-1"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-xl border border-[#D9CBC0] bg-[#E5D8CA] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-[13px] font-medium text-[#2B1810] truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[11px] text-[#7A6B60] truncate mt-0.5">
                      {item.selectedColor} • {item.selectedMaterial || 'Solid Ash Subframe'}
                    </div>
                    <div className="text-[11px] text-[#7A6B60] mt-0.5">
                      Qty: {item.quantity}
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xs sm:text-[13px] font-bold text-[#2B1810] shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Client Identity */}
        <div className="bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-2xl p-4 sm:p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-[13px] font-sans font-medium text-[#2B1810]">
              Client Identity
            </h3>
            <Link
              href="/checkout/identity"
              className="text-xs font-medium text-[#2B1810] hover:text-[#3B2314] transition-colors"
            >
              Edit
            </Link>
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="text-[#2B1810] font-normal">
              {identity.fullName || `${identity.firstName || 'Aarav'} ${identity.lastName || 'Singhania'}`}
            </div>
            <div className="text-[#7A6B60]">
              {identity.email || 'aarav.singhania@veloura.live'}
            </div>
            <div className="text-[#7A6B60]">
              {identity.phone || '+91 98201 54321'}
            </div>
          </div>
        </div>

        {/* Card 3: Delivery Destination */}
        <div className="bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-2xl p-4 sm:p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-[13px] font-sans font-medium text-[#2B1810]">
              Delivery Destination
            </h3>
            <Link
              href="/checkout/delivery"
              className="text-xs font-medium text-[#2B1810] hover:text-[#3B2314] transition-colors"
            >
              Edit
            </Link>
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="text-[#2B1810] font-normal">
              {delivery.address || 'Tower B, 34th Floor, Skyline Penthouse'}
            </div>
            <div className="text-[#7A6B60]">
              {delivery.apartment ? `${delivery.apartment}, ` : ''}
              {delivery.city || 'Worli Sea Face, Mumbai'} - {delivery.pincode || '400018'}
            </div>
          </div>
        </div>

        {/* Card 4: Atelier Staging */}
        <div className="bg-[#F9F4ED]/80 border border-[#D9CBC0] rounded-2xl p-4 sm:p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-[13px] font-sans font-medium text-[#2B1810]">
              Atelier Staging
            </h3>
            <Link
              href="/checkout/atelier"
              className="text-xs font-medium text-[#2B1810] hover:text-[#3B2314] transition-colors"
            >
              Edit
            </Link>
          </div>
          <div className="text-xs text-[#2B1810] font-normal">
            {getStagingLabel()}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="pt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/checkout/atelier')}
          className="border border-[#D9CBC0] bg-transparent rounded-xl px-6 py-3 text-xs font-medium text-[#2B1810] flex items-center gap-2 hover:bg-[#EFE6DC] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="bg-[#3B2314] hover:bg-[#2B1810] text-[#F5EFE6] rounded-xl px-8 py-3.5 text-xs font-medium transition-colors cursor-pointer shadow-sm flex items-center gap-2"
        >
          <span>Continue to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
