'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/hooks/useStore';
import { CheckoutStepper } from './CheckoutStepper';
import { CheckoutSummary } from './CheckoutSummary';
import { ShoppingBag } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  currentStepNum: 1 | 2 | 3 | 4 | 5;
  backHref?: string;
  backLabel?: string;
}

export const CheckoutLayout: React.FC<Props> = ({
  children,
  currentStepNum,
}) => {
  const { cart } = useStore();

  // If cart is empty, show refined luxury empty state
  if (cart.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#F4ECE1] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#E5D8CA] text-[#3B2314] flex items-center justify-center mb-4">
          <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#2B1810] mb-2 font-normal">
          Your shopping bag is empty.
        </h2>
        <p className="text-xs sm:text-sm text-[#7A6B60] max-w-md mb-6 leading-relaxed">
          Explore our rooms and curated furniture pieces to begin your white-glove order.
        </p>
        <Link
          href="/shop"
          className="bg-[#3B2314] hover:bg-[#2B1810] text-[#F5EFE6] px-8 py-3 rounded-xl text-xs font-sans font-medium uppercase tracking-wider transition-colors cursor-pointer"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4ECE1] py-8 sm:py-12 text-[#2B1810]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* 3-Column Architecture: Left Stepper (3 cols) | Center Form (5 cols) | Right Summary (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Vertical Stepper Rail & Checkout Title */}
          <div className="lg:col-span-3 min-h-[600px] flex flex-col justify-between">
            <CheckoutStepper currentStepNum={currentStepNum} />
          </div>

          {/* Center Column: Primary Form Content Area */}
          <main className="lg:col-span-5 min-w-0">
            {children}
          </main>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-4">
            <CheckoutSummary />
          </div>

        </div>

      </div>
    </div>
  );
};
