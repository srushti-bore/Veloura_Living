import React from 'react';
import { CheckoutLayout } from '@/components/commerce/checkout/CheckoutLayout';
import { DeliveryStep } from '@/components/commerce/checkout/DeliveryStep';

export const metadata = {
  title: 'Delivery Destination — Checkout | Veloura Living',
  description: 'Provide your architectural destination for white-glove assembly and delivery.',
};

export default function DeliveryPage() {
  return (
    <CheckoutLayout currentStepNum={2} backHref="/checkout/identity" backLabel="Back to Client Identity">
      <DeliveryStep />
    </CheckoutLayout>
  );
}
