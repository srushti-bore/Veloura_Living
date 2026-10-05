import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import { Instrument_Serif, Instrument_Sans, Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { AppProvider } from '../providers/AppProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { CurrencyProvider } from '../providers/CurrencyProvider';
import { NotificationProvider } from '../providers/NotificationProvider';
import { PWAProvider } from '../providers/PWAProvider';
import { SmoothScrollProvider } from '../providers/SmoothScrollProvider';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/commerce/CartDrawer';
import { AIShoppingAssistantDrawer } from '../components/ai/AIShoppingAssistantDrawer';
import { NotificationCenterDrawer } from '../components/notifications/NotificationCenterDrawer';
import { HotspotPreviewModal } from '../components/products/HotspotPreviewModal';
import { AuthModal } from '../components/auth/AuthModal';
import { LuxuryToastContainer } from '../components/common/LuxuryToast';
import { LuxuryCursor } from '../components/common/LuxuryCursor';
import { AmbientSoundscape } from '../components/audio/AmbientSoundscape';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

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

export const metadata: Metadata = {
  metadataBase: new URL('https://veloura.luxury'),
  title: 'Veloura Living — Furniture Intelligence + Luxury Space Discovery',
  description: 'Timeless furniture for living. Explore, experience and curate your ideal space with Veloura Furniture Intelligence.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Veloura Living',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${instrumentSans.variable} ${cormorant.variable} ${dmsans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#2A1A12" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-[#FBF8F3] text-[#4A2C1A] font-sans antialiased selection:bg-[#F7F0E7] selection:text-[#3B2418]">
        <AuthProvider>
          <CurrencyProvider>
            <NotificationProvider>
              <PWAProvider>
                <AppProvider>
                  <SmoothScrollProvider>
                    <div className="flex flex-col min-h-screen bg-[#FBF8F3] text-[#4A2C1A]">
                      <Header />
                      <main className="flex-1">{children}</main>
                      <Footer />

                      {/* Global Modals & Drawers */}
                      <CartDrawer />
                      <AIShoppingAssistantDrawer />
                      <NotificationCenterDrawer />
                      <HotspotPreviewModal />
                      <AuthModal />

                      {/* Global Micro-Interaction Enhancements */}
                      <LuxuryToastContainer />
                      <LuxuryCursor />
                      <AmbientSoundscape />
                    </div>
                  </SmoothScrollProvider>
                </AppProvider>
              </PWAProvider>
            </NotificationProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
