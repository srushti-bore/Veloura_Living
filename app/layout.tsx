import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import { Cormorant_Garamond, DM_Sans, Playfair_Display, Manrope } from 'next/font/google';
import { AppProvider } from '../providers/AppProvider';
import { SmoothScrollProvider } from '../providers/SmoothScrollProvider';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/commerce/CartDrawer';
import { AIShoppingAssistantDrawer } from '../components/ai/AIShoppingAssistantDrawer';
import { HotspotPreviewModal } from '../components/products/HotspotPreviewModal';
import { LuxuryToastContainer } from '../components/common/LuxuryToast';
import { LuxuryCursor } from '../components/common/LuxuryCursor';
import { AmbientSoundscape } from '../components/audio/AmbientSoundscape';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmsans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-dmsans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Veloura Living — Furniture Intelligence + Luxury Space Discovery',
  description: 'Timeless furniture for living. Explore, experience and curate your ideal space with Veloura Furniture Intelligence.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmsans.variable} ${playfair.variable} ${manrope.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#FAF7F2] text-[#211915] font-sans antialiased selection:bg-[#F4E8D7] selection:text-[#4A2C1A]">
        <AppProvider>
          <SmoothScrollProvider>
            <div className="flex flex-col min-h-screen bg-[#FCFAF7] text-[#211E1B]">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />

              {/* Global Modals & Drawers */}
              <CartDrawer />
              <AIShoppingAssistantDrawer />
              <HotspotPreviewModal />

              {/* Global Micro-Interaction Enhancements */}
              <LuxuryToastContainer />
              <LuxuryCursor />
              <AmbientSoundscape />
            </div>
          </SmoothScrollProvider>
        </AppProvider>
      </body>
    </html>
  );
}
