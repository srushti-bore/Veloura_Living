'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { useCheckout } from '@/providers/CheckoutProvider';
import { Check, ArrowRight, ShoppingBag } from 'lucide-react';

export const CheckoutSuccess: React.FC = () => {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const { orders } = useStore();
  const { createdOrderNumber, payment } = useCheckout();

  const displayOrderNumber = orderIdParam || createdOrderNumber || 'VL-24876';
  const matchedOrder = orders.find((o) => o.orderNumber === displayOrderNumber);

  return (
    <div className="min-h-screen bg-[#F4ECE1] py-12 sm:py-16 text-[#2B1810]">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Confirmed Container */}
        <div className="bg-[#EFE7DD] rounded-3xl border border-[#E2D6C7] overflow-hidden shadow-soft-sm grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Left Column: Order Confirmation Details (7 cols) */}
          <div className="lg:col-span-7 p-8 sm:p-12 space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Check Icon Badge */}
              <div className="w-12 h-12 rounded-full bg-[#3B2314] text-[#F5EFE6] flex items-center justify-center">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>

              {/* Title & Message */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A6B60] font-medium">
                  Confirmed
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1810] font-normal tracking-tight">
                  Order Confirmed
                </h1>
                <p className="text-xs sm:text-sm text-[#7A6B60] leading-relaxed max-w-md pt-1">
                  Thank you for choosing Veloura Living. Your order has been successfully placed and forwarded to our master atelier.
                </p>
              </div>

              {/* Order Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-[#D9CBC0]">
                <div>
                  <div className="text-[11px] text-[#7A6B60] font-sans">Order Number</div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-[#2B1810] mt-0.5">
                    #{displayOrderNumber}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-[#7A6B60] font-sans">Payment Status</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#557A5A]" />
                    <span className="text-xs font-medium text-[#557A5A] font-sans">
                      {payment.paymentMethod === 'cod' ? 'COD Pending' : 'Paid'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-[#7A6B60] font-sans">Estimated Delivery</div>
                  <div className="text-xs font-medium text-[#2B1810] mt-0.5 font-sans">
                    7–10 business days
                  </div>
                </div>
              </div>

              {/* Staging & Destination Summary */}
              {matchedOrder && matchedOrder.customer && (
                <div className="text-xs text-[#7A6B60] space-y-1">
                  <div>Delivery Destination:</div>
                  <div className="text-[#2B1810] font-medium">
                    {matchedOrder.customer.address}, {matchedOrder.customer.city} — {matchedOrder.customer.pincode}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/orders"
                className="px-6 py-3 bg-[#3B2314] hover:bg-[#2B1810] text-[#F5EFE6] rounded-xl font-sans font-medium text-xs tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Track Your Order</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/shop"
                className="px-6 py-3 border border-[#D9CBC0] bg-[#F9F4ED] hover:bg-[#E5D8CA] text-[#2B1810] rounded-xl font-sans font-medium text-xs tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Premium Furniture Image (5 cols) */}
          <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-[#E5D8CA]">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop&q=85"
              alt="Veloura Living Curated Furniture"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810]/50 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white text-xs space-y-1">
              <span className="font-serif text-sm block">Solitude Atelier Collection</span>
              <span className="text-white/80 text-[11px] block">Handcrafted joinery &amp; white-glove staging</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
