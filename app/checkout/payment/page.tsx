import React from 'react';
import { CheckoutLayout } from '@/components/commerce/checkout/CheckoutLayout';
import { PaymentStep } from '@/components/commerce/checkout/PaymentStep';

export const metadata = {
  title: 'Payment Engine & Authorization — Checkout | Veloura Living',
  description: 'Complete secure 256-bit encrypted Razorpay, UPI, or verified Cash on Delivery checkout.',
};

export default function PaymentPage() {
  return (
    <CheckoutLayout currentStepNum={5} backHref="/checkout/review" backLabel="Back to Order Review">
      <PaymentStep />
    </CheckoutLayout>
  );
}
