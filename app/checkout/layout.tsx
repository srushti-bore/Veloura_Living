import React from 'react';
import { CheckoutProvider } from '@/providers/CheckoutProvider';

export const metadata = {
  title: 'White-Glove Checkout | Veloura Living',
  description: 'Complete your luxury heirloom furniture order with complimentary white-glove delivery, assembly, and 10-year warranty.',
};

export default function CheckoutRootLayout({ children }: { children: React.ReactNode }) {
  return <CheckoutProvider>{children}</CheckoutProvider>;
}
