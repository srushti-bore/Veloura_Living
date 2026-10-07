import React, { Suspense } from 'react';
import { CheckoutSuccess } from '@/components/commerce/checkout/CheckoutSuccess';

export const metadata = {
  title: 'Order Confirmed | Veloura Living',
  description: 'Your luxury bespoke furniture order has been confirmed and scheduled for atelier build.',
};

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#8B5A2B] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutSuccess />
    </Suspense>
  );
}
