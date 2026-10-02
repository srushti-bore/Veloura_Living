'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

export interface ToastData {
  id: string;
  type: 'cart' | 'wishlist-add' | 'wishlist-remove' | 'coupon' | 'info';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  price?: number;
  durationMs?: number;
}

// Global Event Dispatcher for Toasts
export const triggerLuxuryToast = (data: Omit<ToastData, 'id'>) => {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent('veloura-toast', {
    detail: { ...data, id: `toast-${Date.now()}-${Math.random()}` }
  });
  window.dispatchEvent(event);
};

export const LuxuryToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { navigate, setIsCartOpen } = useStore();

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastData>;
      if (customEvent.detail) {
        setToasts((prev) => [customEvent.detail, ...prev.slice(0, 2)]);
      }
    };

    window.addEventListener('veloura-toast', handleToastEvent);
    return () => window.removeEventListener('veloura-toast', handleToastEvent);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-md w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} navigate={navigate} setIsCartOpen={setIsCartOpen} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastData;
  onDismiss: () => void;
  navigate: (path: string) => void;
  setIsCartOpen: (open: boolean) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, navigate, setIsCartOpen }) => {
  const [progress, setProgress] = useState(100);
  const duration = toast.durationMs || 3600;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    const interval = 30;
    const step = (interval / duration) * 100;
    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, interval);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'cart':
        return <ShoppingBag className="w-4 h-4 text-[#8B5A2B]" />;
      case 'wishlist-add':
        return <Heart className="w-4 h-4 text-[#8B5A2B] fill-[#8B5A2B]" />;
      case 'wishlist-remove':
        return <Heart className="w-4 h-4 text-[#9C9287]" />;
      case 'coupon':
        return <Sparkles className="w-4 h-4 text-[#C49A6C]" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#8B5A2B]" />;
    }
  };

  return (
    <div className="pointer-events-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-soft-xl border border-[#4A2C1A]/12 p-3.5 sm:p-4 text-[#211E1B] animate-toast-in overflow-hidden relative group">
      {/* Top Animated Progress Bar */}
      <div
        className="absolute top-0 left-0 h-[2.5px] bg-gradient-to-r from-[#8B5A2B] to-[#C49A6C] transition-all duration-75"
        style={{ width: `${progress}%` }}
      />

      <div className="flex items-center justify-between gap-3">
        {/* Left Thumbnail or Icon */}
        <div className="flex items-center gap-3 min-w-0">
          {toast.imageUrl ? (
            <div className="w-12 h-12 rounded-xl bg-[#F7F4EF] overflow-hidden flex-shrink-0 border border-[#4A2C1A]/10">
              <img src={toast.imageUrl} alt={toast.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#F5E6D3] flex items-center justify-center flex-shrink-0">
              {getIcon()}
            </div>
          )}

          <div className="min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B] flex items-center gap-1">
                {toast.imageUrl && getIcon()}
                {toast.title}
              </span>
            </div>
            {toast.subtitle && (
              <p className="text-xs font-semibold text-[#211E1B] truncate max-w-[200px] sm:max-w-[240px]">
                {toast.subtitle}
              </p>
            )}
            {toast.price !== undefined && (
              <span className="text-[11px] font-medium text-[#746B61]">
                ₹{toast.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Right CTA / Dismiss */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {toast.type === 'cart' && (
            <button
              onClick={() => {
                setIsCartOpen(true);
                onDismiss();
              }}
              className="btn-primary-shimmer px-3 py-1.5 rounded-full text-[11px] font-semibold text-white shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <span>Bag</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {toast.type === 'wishlist-add' && (
            <button
              onClick={() => {
                navigate('/wishlist');
                onDismiss();
              }}
              className="text-[11px] font-semibold text-[#8B5A2B] hover:underline px-2 py-1 cursor-pointer"
            >
              Wishlist →
            </button>
          )}

          <button
            onClick={onDismiss}
            className="p-1 rounded-full text-[#9C9287] hover:text-[#211E1B] hover:bg-[#F7F4EF] transition-colors cursor-pointer"
            aria-label="Dismiss Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default LuxuryToastContainer;
