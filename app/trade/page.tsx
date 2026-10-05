import type { Metadata } from 'next';
import { TradePortalPage } from '@/components/views/trade/TradePortalPage';

export const metadata: Metadata = {
  title: 'Trade & VIP Concierge Atelier | Veloura Living',
  description:
    'Dedicated portal for Architects, Interior Designers, and Hospitality Developers. Access 15%–25% tiered trade discounts, instant GST project estimates, and complimentary 8K swatch sample boxes.',
  openGraph: {
    title: 'Trade & VIP Concierge Atelier — Veloura Living',
    description: 'Commercial B2B privileges, bulk project RFQ builder, and private spatial consultation bookings.',
    images: ['/images/materials/veloura_swatch_walnut.jpg'],
  },
};

export default function TradePage() {
  return <TradePortalPage />;
}
