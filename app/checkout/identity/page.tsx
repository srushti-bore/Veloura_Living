import React from 'react';
import { CheckoutLayout } from '@/components/commerce/checkout/CheckoutLayout';
import { IdentityStep } from '@/components/commerce/checkout/IdentityStep';

export const metadata = {
  title: 'Client Identity — Checkout | Veloura Living',
  description: 'Provide your client contact details for bespoke white-glove delivery tracking.',
};

export default function IdentityPage() {
  return (
    <CheckoutLayout currentStepNum={1} backHref="/shop" backLabel="Return to Catalog">
      <IdentityStep />
    </CheckoutLayout>
  );
}
