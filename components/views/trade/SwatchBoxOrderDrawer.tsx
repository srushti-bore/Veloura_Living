'use client';

import React, { useState } from 'react';
import { X, Package, Check, Sparkles, Truck } from 'lucide-react';
import { MATERIAL_LIBRARY } from '@/lib/data/configuratorMaterials';
import { SwatchSampleBoxOrder, TradePartner } from '@/types/trade';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  partner?: TradePartner;
  onOrderPlaced: (order: SwatchSampleBoxOrder) => void;
}

export const SwatchBoxOrderDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  partner,
  onOrderPlaced,
}) => {
  const [selectedSwatches, setSelectedSwatches] = useState<string[]>([
    'mat-walnut',
    'mat-boucle',
    'mat-saddle-leather',
    'mat-travertine',
    'mat-spun-brass',
  ]);

  const [recipientName, setRecipientName] = useState(partner?.contactPerson || 'Ar. Matteo Rossi');
  const [shippingAddress, setShippingAddress] = useState('Level 14, One World Center, Lower Parel');
  const [city, setCity] = useState('Mumbai');
  const [postalCode, setPostalCode] = useState('400013');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleSwatch = (id: string) => {
    if (selectedSwatches.includes(id)) {
      setSelectedSwatches((prev) => prev.filter((s) => s !== id));
    } else {
      if (selectedSwatches.length >= 5) {
        setErrorMsg('You can select a maximum of 5 swatches for the complimentary curated box.');
        return;
      }
      setErrorMsg('');
      setSelectedSwatches((prev) => [...prev, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSwatches.length === 0) {
      setErrorMsg('Please select at least 1 material swatch.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/trade/swatch-box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradePartnerId: partner?.id,
          businessName: partner?.businessName || 'Studio Milan Architectural Interiors',
          recipientName,
          shippingAddress,
          city,
          postalCode,
          selectedSwatchIds: selectedSwatches,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onOrderPlaced(data.data);
        onClose();
      } else {
        setErrorMsg(data.error?.message || 'Failed to order sample box.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl h-full bg-[#181411] border-l border-[#8B5A2B]/40 shadow-2xl text-[#FAF7F2] flex flex-col p-6 sm:p-8 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#A9794F] font-semibold">
              Tactile Material Studio
            </span>
            <h3 className="font-serif text-2xl font-medium tracking-tight text-[#FAF7F2]">
              Curate Swatch Sample Box
            </h3>
          </div>
        </div>

        <p className="text-xs text-stone-400 mb-6 leading-relaxed">
          Select up to 5 physical material swatches. Delivered in our signature embossed luxury wooden box via complimentary express courier for client presentations.
        </p>

        {/* Selected Tray Badges */}
        <div className="p-4 rounded-2xl bg-[#211B16] border border-white/5 mb-6 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-300 font-medium">Curated Swatches ({selectedSwatches.length}/5)</span>
            <span className="text-emerald-400 font-medium">Complimentary (₹0)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSwatches.map((id) => {
              const mat = MATERIAL_LIBRARY.find((m) => m.id === id);
              if (!mat) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2A1F18] border border-[#8B5A2B]/40 text-xs text-[#FAF7F2]"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                    style={{ backgroundColor: mat.colorHex }}
                  />
                  <span>{mat.name.split(' ')[0]}</span>
                </span>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200">
            {errorMsg}
          </div>
        )}

        {/* Swatch Selection Grid */}
        <div className="space-y-2 mb-6">
          <span className="text-xs uppercase tracking-wider text-stone-400 font-medium block">
            Choose From 8K Macro Material Library
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {MATERIAL_LIBRARY.map((mat) => {
              const isSelected = selectedSwatches.includes(mat.id);
              return (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => toggleSwatch(mat.id)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-[#8B5A2B]/20 border-[#D8B486] shadow-md'
                      : 'bg-[#211B16] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 border border-white/20 relative flex items-center justify-center"
                    style={{ backgroundColor: mat.colorHex }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <div className="truncate">
                    <div className="text-xs text-[#FAF7F2] font-medium truncate">{mat.name}</div>
                    <div className="text-[10px] text-stone-400 capitalize">{mat.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Courier Destination Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Recipient / Studio *
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Studio Address *
              </label>
              <input
                type="text"
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B5A2B] to-[#765236] hover:from-[#A9794F] hover:to-[#8B5A2B] text-sm font-medium text-white shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Truck className="w-4 h-4" />
                <span>Dispatch Complimentary Swatch Box</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
