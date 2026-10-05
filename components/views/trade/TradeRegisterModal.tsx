'use client';

import React, { useState } from 'react';
import { X, Building2, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { TradeRole, TradePartner } from '@/types/trade';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (partner: TradePartner) => void;
}

export const TradeRegisterModal: React.FC<Props> = ({ isOpen, onClose, onRegistered }) => {
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tradeRole, setTradeRole] = useState<TradeRole>('INTERIOR_DESIGNER');
  const [gstin, setGstin] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handle1ClickDemo = () => {
    setBusinessName('Studio Milan Architectural Interiors');
    setContactPerson('Ar. Matteo Rossi');
    setEmail('matteo@studiomilan.it');
    setPhone('+91 98200 88776');
    setTradeRole('ARCHITECT');
    setGstin('27AAACS1234F1Z9');
    setWebsite('https://studiomilan.design');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/trade/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          contactPerson,
          email,
          phone,
          tradeRole,
          gstin,
          websiteOrPortfolio: website,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onRegistered(data.data);
        onClose();
      } else {
        setErrorMsg(data.error?.message || 'Failed to submit application.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-[#181411] border border-[#8B5A2B]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-[#FAF7F2] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#8B5A2B]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[#8B5A2B]/20 text-[#D8B486] border border-[#8B5A2B]/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#A9794F] font-semibold">
              Trade Privilege Enclave
            </span>
            <h3 className="font-serif text-2xl font-medium tracking-tight text-[#FAF7F2]">
              Apply for Trade Membership
            </h3>
          </div>
        </div>

        <p className="text-xs text-stone-400 mb-5 leading-relaxed">
          Exclusive to licensed architects, interior designers, and luxury developers. Unlock 15%–25% tier discounts, complimentary swatch sample boxes, and dedicated project management.
        </p>

        {/* 1-Click Fast Fill */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#2A1F18]/60 border border-[#8B5A2B]/30 mb-5">
          <div className="flex items-center gap-2 text-xs text-[#D8B486]">
            <Sparkles className="w-4 h-4 text-[#D8B486]" />
            <span>Fast Prototype Tester?</span>
          </div>
          <button
            type="button"
            onClick={handle1ClickDemo}
            className="px-3 py-1 rounded-lg bg-[#8B5A2B] hover:bg-[#A9794F] text-xs text-white font-medium shadow-sm transition-all"
          >
            1-Click Demo Fill
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Studio / Business Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Studio Milan Interiors"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#211B16] border border-white/10 focus:border-[#8B5A2B] text-xs text-white outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Principal Architect / Contact *
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Ar. Matteo Rossi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#211B16] border border-white/10 focus:border-[#8B5A2B] text-xs text-white outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Professional Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="matteo@studiomilan.it"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#211B16] border border-white/10 focus:border-[#8B5A2B] text-xs text-white outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Direct Phone / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 88776"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#211B16] border border-white/10 focus:border-[#8B5A2B] text-xs text-white outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Trade Discipline *
              </label>
              <select
                value={tradeRole}
                onChange={(e) => setTradeRole(e.target.value as TradeRole)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#211B16] border border-white/10 focus:border-[#8B5A2B] text-xs text-white outline-none transition-colors"
              >
                <option value="INTERIOR_DESIGNER">Interior Designer</option>
                <option value="ARCHITECT">Architectural Firm</option>
                <option value="HOSPITALITY_DEVELOPER">Hospitality & Hotel Developer</option>
                <option value="LUXURY_BUILDER">Luxury Residential Builder</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                GSTIN / Tax ID *
              </label>
              <input
                type="text"
                required
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="27AAACS1234F1Z9"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#211B16] border border-white/10 focus:border-[#8B5A2B] text-xs text-white uppercase outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
              Portfolio / Website Link
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://studiomilan.design"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#211B16] border border-white/10 focus:border-[#8B5A2B] text-xs text-white outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#8B5A2B] to-[#765236] hover:from-[#A9794F] hover:to-[#8B5A2B] text-sm font-medium text-white shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Submit & Activate Trade Account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
