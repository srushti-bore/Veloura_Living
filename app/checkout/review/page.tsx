import React from 'react';
import { CheckoutLayout } from '@/components/commerce/checkout/CheckoutLayout';
import { OrderReviewStep } from '@/components/commerce/checkout/OrderReviewStep';

export const metadata = {
  title: 'Order & Vault Review — Checkout | Veloura Living',
  description: 'Review your handcrafted furniture order, custom monograph, and Privilege Vault coins.',
};

export default function ReviewPage() {
  return (
    <CheckoutLayout currentStepNum={4} backHref="/checkout/atelier" backLabel="Back to Atelier Staging">
      <OrderReviewStep />
    </CheckoutLayout>
  );
}
