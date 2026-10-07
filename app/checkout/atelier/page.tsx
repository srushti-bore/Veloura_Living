import React from 'react';
import { CheckoutLayout } from '@/components/commerce/checkout/CheckoutLayout';
import { AtelierStagingStep } from '@/components/commerce/checkout/AtelierStagingStep';

export const metadata = {
  title: 'Atelier Staging & Scheduling — Checkout | Veloura Living',
  description: 'Choose your preferred installation window, placement room, and property access details.',
};

export default function AtelierPage() {
  return (
    <CheckoutLayout currentStepNum={3} backHref="/checkout/delivery" backLabel="Back to Delivery Destination">
      <AtelierStagingStep />
    </CheckoutLayout>
  );
}
