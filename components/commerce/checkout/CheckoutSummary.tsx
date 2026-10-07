'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { useCurrency } from '@/providers/CurrencyProvider';
import { useCheckout } from '@/providers/CheckoutProvider';
import { Sparkles } from 'lucide-react';

export const CheckoutSummary: React.FC = () => {
  const pathname = usePathname();
  const { cart, cartSubtotal, discountAmount, shippingCost, cartTotal } = useStore();
  const { formatPrice } = useCurrency();
  const { payment } = useCheckout();

  const codFee = payment.paymentMethod === 'cod' ? (cartTotal >= 50000 ? 0 : 750) : 0;
  const effectiveTotal = cartTotal + codFee;

  // Dynamic editorial banner data per checkout step
  const getEditorialBanner = () => {
    if (pathname?.includes('/delivery')) {
      return {
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
        quote: ['Crafted', 'with care,', 'delivered', 'with trust.']
      };
    }
    if (pathname?.includes('/atelier')) {
      return {
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80',
        quote: ['More', 'than furniture,', 'a reflection', 'of style.']
      };
    }
    if (pathname?.includes('/review')) {
      return {
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
        quote: ['More', 'than furniture,', "it's a feeling."]
      };
    }
    if (pathname?.includes('/payment')) {
      return {
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&auto=format&fit=crop&q=80',
        quote: ['Secure', 'payments', 'for a seamless', 'experience.']
      };
    }
    // Default / Identity / Review
    return {
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
      quote: ['Timeless', 'pieces for', 'modern', 'living.']
    };
  };

  const editorial = getEditorialBanner();

  return (
    <div className="bg-[#EFE7DD]/80 rounded-3xl p-6 border border-[#E2D6C7] space-y-6 sticky top-24">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <h3 className="font-serif text-lg text-[#2B1810] font-normal tracking-tight">
          Order Summary
        </h3>
        <span className="text-xs font-sans text-[#7A6B60]">
          {cart.length} {cart.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Itemized Product List */}
      <div className="space-y-4 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-14 h-14 object-cover rounded-xl border border-[#D9CBC0] shrink-0 bg-[#E5D8CA]"
              />
              <div className="min-w-0 pt-0.5">
                <div className="text-xs font-semibold text-[#2B1810] leading-snug truncate">
                  {item.product.name}
                </div>
                <div className="text-[11px] text-[#7A6B60] truncate mt-0.5">
                  {item.selectedColor} {item.selectedMaterial ? `+ ${item.selectedMaterial}` : ''}
                </div>
                <div className="text-[10px] text-[#7A6B60] mt-0.5">
                  Qty: {item.quantity}
                </div>
              </div>
            </div>
            <div className="font-mono text-xs font-semibold text-[#2B1810] shrink-0 pt-0.5 text-right">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-2.5 pt-3 border-t border-[#D9CBC0]/60 text-xs font-sans">
        <div className="flex justify-between text-[#5A483C]">
          <span>Subtotal</span>
          <span className="font-mono font-medium text-[#2B1810]">{formatPrice(cartSubtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-[#557A5A]">
            <span>Privilege Code</span>
            <span className="font-mono font-medium">- {formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-[#5A483C]">
          <span>Shipping</span>
          <span className={`font-sans font-medium ${shippingCost === 0 ? 'text-[#486B4D]' : 'text-[#2B1810]'}`}>
            {shippingCost === 0 ? 'Complimentary' : formatPrice(shippingCost)}
          </span>
        </div>

        {codFee > 0 && (
          <div className="flex justify-between text-[#5A483C]">
            <span>Cash on Delivery Handling</span>
            <span className="font-mono font-medium text-[#2B1810]">{formatPrice(codFee)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs sm:text-[13px] font-bold text-[#2B1810] pt-3 border-t border-[#D9CBC0]/60">
          <span>Total Payable (INR)</span>
          <span className="font-mono font-bold text-sm text-[#2B1810]">
            {formatPrice(effectiveTotal)}
          </span>
        </div>
      </div>

      {/* Editorial Banner Card at Bottom */}
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#E5D8CA] border border-[#D9CBC0]">
        <img
          src={editorial.image}
          alt="Veloura Editorial Furniture"
          className="w-full h-full object-cover"
        />
        {/* Editorial Text Overlay */}
        <div className="absolute top-4 left-4 max-w-[170px]">
          <p className="font-serif italic text-lg sm:text-[20px] text-[#2B1810] leading-[1.2] font-normal drop-shadow-sm">
            {editorial.quote.map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < editorial.quote.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>
        {/* Subtle Diamond Icon at Bottom-Right */}
        <div className="absolute bottom-4 right-4 text-white/80 drop-shadow">
          <Sparkles className="w-5 h-5 fill-white/40 text-white" />
        </div>
      </div>
    </div>
  );
};
