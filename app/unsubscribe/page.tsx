'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, MailCheck, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [loading, setLoading] = useState(true);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [resolvedEmail, setResolvedEmail] = useState(emailParam);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // If token is present, execute 1-click idempotent unsubscribe automatically
  useEffect(() => {
    async function handleAutoUnsubscribe() {
      if (!token && !emailParam) {
        setLoading(false);
        setError('No unsubscribe token or email specified. Please use the link provided in your email.');
        return;
      }

      try {
        const res = await fetch('/api/marketing/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token || undefined, email: emailParam || undefined }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUnsubscribed(true);
          setResolvedEmail(data.data?.email || emailParam);
          setMessage(data.data?.message || 'You have been unsubscribed from promotional emails.');
        } else {
          setError(data.error?.message || 'Failed to process unsubscribe request.');
        }
      } catch {
        setError('Network error processing request. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    handleAutoUnsubscribe();
  }, [token, emailParam]);

  const handleManualConfirm = async () => {
    if (!resolvedEmail && !token) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch('/api/marketing/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token || undefined, email: resolvedEmail || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUnsubscribed(true);
        setMessage(data.data?.message || 'You have been unsubscribed from promotional emails.');
      } else {
        setError(data.error?.message || 'Failed to update preferences.');
      }
    } catch {
      setError('Connection failure. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#150E0A] text-[#FAF7F2] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#7A4E2D] selection:text-white">
      {/* Top Header Logo */}
      <div className="max-w-md mx-auto w-full text-center mb-8">
        <div className="inline-flex items-center justify-center space-x-3 mb-2">
          <div className="relative w-12 h-12">
            <Image
              src="/logo-clean.png"
              alt="Veloura Living Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-serif text-2xl tracking-[0.2em] font-light text-[#FAF7F2] uppercase">
            Veloura
          </span>
        </div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#D8B486]">
          Architectural Atelier &bull; Privacy & Preferences
        </p>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="max-w-lg mx-auto w-full bg-[#1C140E] border border-[#3D271D] rounded-2xl shadow-2xl p-8 sm:p-10 relative overflow-hidden">
        {/* Subtle decorative gold line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B5A2B] to-transparent opacity-60" />

        {loading ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-10 h-10 border-2 border-[#8B5A2B] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#C5B5A5] font-light">Updating your email preferences…</p>
          </div>
        ) : error ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-12 h-12 bg-rose-950/40 border border-rose-800/40 rounded-full flex items-center justify-center mx-auto text-rose-300">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[#FAF7F2] font-normal mb-2">
                Preferences Update Issue
              </h2>
              <p className="text-xs text-rose-300 leading-relaxed max-w-sm mx-auto">
                {error}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[#4A3225] text-xs text-[#FAF7F2] hover:bg-[#2A1D15] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Atelier</span>
            </button>
          </div>
        ) : unsubscribed ? (
          <div className="text-center py-4 space-y-6">
            <div className="w-14 h-14 bg-emerald-950/40 border border-emerald-800/40 rounded-full flex items-center justify-center mx-auto text-emerald-300 shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2] font-normal tracking-tight">
                Unsubscribed Successfully
              </h1>
              <p className="text-xs text-[#C5B5A5] leading-relaxed max-w-sm mx-auto">
                {resolvedEmail ? (
                  <>
                    <span className="text-[#FAF7F2] font-medium">{resolvedEmail}</span> has been removed from all Veloura Living marketing campaigns.
                  </>
                ) : (
                  message
                )}
              </p>
            </div>

            {/* Transactional Assurance Banner */}
            <div className="p-4 bg-[#231A13] border border-[#3D271D] rounded-xl text-left flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-[#8B5A2B] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#A6978A] leading-relaxed">
                <strong className="text-[#FAF7F2] font-medium">Important Security Note:</strong> You will continue to receive critical transactional receipts, order fulfillment updates, and one-time authentication codes.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push('/shop')}
                className="w-full sm:w-auto bg-[#8B5A2B] hover:bg-[#A47A45] text-white px-6 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                Browse Collections
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full sm:w-auto border border-[#3D271D] hover:bg-[#2A1D15] text-[#C5B5A5] px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Atelier Home
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-6">
            <div className="w-14 h-14 bg-[#2A1D15] border border-[#7A4E2D] rounded-full flex items-center justify-center mx-auto text-[#D8B486]">
              <MailCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-[#FAF7F2] font-normal">
                Email Preferences
              </h2>
              <p className="text-xs text-[#C5B5A5] leading-relaxed max-w-sm mx-auto">
                Confirm unsubscribe from seasonal lookbooks and architectural showcases for{' '}
                <span className="text-white font-medium">{resolvedEmail}</span>.
              </p>
            </div>

            <button
              onClick={handleManualConfirm}
              disabled={isProcessing}
              className="w-full bg-[#8B5A2B] hover:bg-[#A47A45] text-white py-3 rounded-xl text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? 'Processing…' : 'Confirm Unsubscribe'}
            </button>
          </div>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-md mx-auto w-full text-center text-[11px] text-[#736254] mt-8 space-y-1">
        <p>Veloura Living Private Limited &bull; Architectural Furniture Atelier</p>
        <p>Milan &bull; London &bull; Mumbai &bull; concierge@velouraliving.com</p>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#150E0A] flex items-center justify-center text-[#FAF7F2]">
          <div className="w-8 h-8 border-2 border-[#8B5A2B] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
