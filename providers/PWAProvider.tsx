'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WifiOff, Download, X, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAContextType {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  isOnline: true,
  isInstallable: false,
  isInstalled: false,
  promptInstall: async () => {},
});

export const usePWA = () => useContext(PWAContext);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [dismissedBanner, setDismissedBanner] = useState<boolean>(false);

  // 1. Service Worker Registration & Lifecycle
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('[Veloura PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[Veloura PWA] Service Worker registration failed:', error);
          });
      });
    }

    // 2. Online / Offline Network Monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // 3. BeforeInstallPrompt Capturing
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setIsInstallable(true);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log('[Veloura PWA] Application installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if running in standalone display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 4. Trigger Install Prompt
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[Veloura PWA] User accepted the installation prompt');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } catch (err) {
      console.error('[Veloura PWA] Error triggering install prompt:', err);
    }
  }, [deferredPrompt]);

  return (
    <PWAContext.Provider
      value={{
        isOnline,
        isInstallable,
        isInstalled,
        promptInstall,
      }}
    >
      {children}

      {/* Offline Status Floating Pill */}
      {!isOnline && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1C1815]/95 border border-[#8B5A2B]/40 text-[#FBF8F3] shadow-2xl backdrop-blur-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium tracking-wider uppercase font-sans">
              Offline Mode Active (Cached Spatial Data)
            </span>
          </div>
        </div>
      )}

      {/* Quiet Luxury PWA Install Pill Banner */}
      {isInstallable && showInstallBanner && !dismissedBanner && !isInstalled && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full transition-all duration-500 ease-out">
          <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-[#241A14] via-[#1C1815] to-[#120E0C] border border-[#8B5A2B]/40 text-[#FBF8F3] shadow-2xl backdrop-blur-xl">
            {/* Ambient gold glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#8B5A2B]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5A2B]/20 border border-[#8B5A2B]/40 flex items-center justify-center shrink-0 text-[#D8B486]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-6">
                <h4 className="text-sm font-serif font-medium text-[#FBF8F3] tracking-wide">
                  Experience Veloura Atelier App
                </h4>
                <p className="text-xs text-[#B9AA99] mt-0.5 leading-relaxed">
                  Install for instant offline spatial 3D studio, tactile swatches & fast checkout.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={promptInstall}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5A2B] hover:bg-[#A26B33] text-white text-xs font-medium tracking-wider transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Install App
                  </button>
                  <button
                    onClick={() => setDismissedBanner(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#B9AA99] hover:text-white text-xs transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>

              <button
                onClick={() => setDismissedBanner(true)}
                className="absolute top-3 right-3 text-[#B9AA99] hover:text-white p-1 transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </PWAContext.Provider>
  );
}
