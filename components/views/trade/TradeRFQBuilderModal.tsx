'use client';

import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, CheckCircle, Calculator } from 'lucide-react';
import { TradePartner, ProjectRFQ, RFQLineItem } from '@/types/trade';
import { useStore } from '@/providers/AppProvider';
import { useCurrency } from '@/providers/CurrencyProvider';
import { TradeStore } from '@/lib/data/tradeStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  partner?: TradePartner;
  onRFQCreated: (rfq: ProjectRFQ) => void;
}

export const TradeRFQBuilderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  partner,
  onRFQCreated,
}) => {
  const { allProducts } = useStore();
  const { formatPrice } = useCurrency();

  const [projectTitle, setProjectTitle] = useState('Villa Bellissima Penthouse');
  const [projectLocation, setProjectLocation] = useState('Worli Sea Face, Mumbai');
  const [targetDate, setTargetDate] = useState('2026-11-30');
  const [notes, setNotes] = useState('Requires freight elevator booking & white-glove carpentry crew.');

  const [lineItems, setLineItems] = useState<
    { productId: string; productName: string; sku: string; customFinish: string; unitBasePriceINR: number; quantity: number }[]
  >([
    {
      productId: 'prod-lr-01',
      productName: 'Serpentine Modular Sectional Sofa',
      sku: 'VL-LR-SF-001-OAT',
      customFinish: 'Belgian Wool Bouclé & Appalachian Walnut Plinth',
      unitBasePriceINR: 185000,
      quantity: 2,
    },
    {
      productId: 'prod-din-01',
      productName: 'Aurelia Sculptural Dining Table',
      sku: 'VL-DN-TBL-001-TRA',
      customFinish: 'Honed Roman Travertine & Solid Walnut Pedestals',
      unitBasePriceINR: 145000,
      quantity: 1,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddLine = () => {
    const firstProd = allProducts[0];
    if (firstProd) {
      setLineItems((prev) => [
        ...prev,
        {
          productId: firstProd.id,
          productName: firstProd.name,
          sku: firstProd.sku || `VL-${firstProd.slug.toUpperCase().slice(0, 8)}`,
          customFinish: 'Custom Atelier Finish',
          unitBasePriceINR: firstProd.price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveLine = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const selected = allProducts.find((p) => p.id === productId);
    if (!selected) return;

    setLineItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: selected.id,
              productName: selected.name,
              sku: selected.sku || `VL-${selected.slug.toUpperCase().slice(0, 8)}`,
              unitBasePriceINR: selected.price,
            }
          : item
      )
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const safeQty = Math.max(1, qty);
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: safeQty } : item))
    );
  };

  const handleFinishChange = (index: number, finish: string) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, customFinish: finish } : item))
    );
  };

  // Calculations
  const subtotal = lineItems.reduce((acc, item) => acc + item.unitBasePriceINR * item.quantity, 0);
  const tierCalc = TradeStore.determineTier(subtotal);
  const discountRate = partner ? Math.max(partner.discountRate, tierCalc.discountRate) : tierCalc.discountRate;
  const discountAmount = Math.round(subtotal * discountRate);
  const taxable = Math.max(0, subtotal - discountAmount);
  const gst = Math.round(taxable * 0.18);
  const grandTotal = taxable + gst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      setErrorMsg('Please add at least one line item to the RFQ.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/trade/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradePartnerId: partner?.id,
          businessName: partner?.businessName || 'Studio Milan Architectural Interiors',
          contactPerson: partner?.contactPerson || 'Ar. Matteo Rossi',
          email: partner?.email || 'matteo@studiomilan.it',
          phone: partner?.phone || '+91 98200 88776',
          projectTitle,
          projectLocation,
          targetInstallationDate: targetDate,
          lineItems,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onRFQCreated(data.data);
        onClose();
      } else {
        setErrorMsg(data.error?.message || 'Failed to generate RFQ.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#181411] border border-[#8B5A2B]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-[#FAF7F2] my-8 overflow-hidden"
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
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#A9794F] font-semibold">
              Commercial Estimation Engine
            </span>
            <h3 className="font-serif text-2xl font-medium tracking-tight text-[#FAF7F2]">
              Create Project Bill of Materials (RFQ)
            </h3>
          </div>
        </div>

        <p className="text-xs text-stone-400 mb-6 leading-relaxed">
          Configure multiple architectural pieces for your commercial or residential project. Dynamic tier discounts, 18% GST itemization, and official PDF/HTML estimates are generated instantly.
        </p>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Project Location *
              </label>
              <input
                type="text"
                required
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Target Installation Date *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          {/* Line Items Bill of Materials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-stone-300 font-semibold">
                Bill of Materials ({lineItems.length} Pieces)
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#8B5A2B]/30 hover:bg-[#8B5A2B] text-xs text-[#D8B486] hover:text-white border border-[#8B5A2B]/40 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Piece</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-[#8B5A2B]/30 pr-1">
              {lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#211B16] border border-white/5 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <div className="sm:col-span-4">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#181411] border border-white/10 text-xs text-white outline-none"
                    >
                      {allProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatPrice(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={item.customFinish}
                      onChange={(e) => handleFinishChange(idx, e.target.value)}
                      placeholder="Custom Spec / Finish"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#181411] border border-white/10 text-xs text-stone-300 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-1">
                    <span className="text-[10px] text-stone-400">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                      className="w-14 px-2 py-1.5 rounded-lg bg-[#181411] border border-white/10 text-xs text-white text-center outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-[#FAF7F2]">
                      {formatPrice(item.unitBasePriceINR * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quotation Valuation Summary Box */}
          <div className="p-4 rounded-2xl bg-[#2A1F18]/80 border border-[#8B5A2B]/40 space-y-2">
            <div className="flex justify-between text-xs text-stone-300">
              <span>Catalog Subtotal:</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#D8B486]">
              <span>Trade Privilege Discount ({Math.round(discountRate * 100)}% Off):</span>
              <span className="font-mono">-{formatPrice(discountAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-300">
              <span>Taxable Project Base:</span>
              <span className="font-mono">{formatPrice(taxable)}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-300">
              <span>Statutory GST (18%):</span>
              <span className="font-mono">{formatPrice(gst)}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-300">
              <span>White-Glove Commercial Installation:</span>
              <span className="text-emerald-400 font-medium">Complimentary (₹0)</span>
            </div>
            <div className="flex justify-between text-sm font-serif font-bold text-[#FAF7F2] pt-2 border-t border-[#8B5A2B]/30">
              <span>Estimated Grand Total:</span>
              <span className="text-base text-[#D8B486] font-mono">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B5A2B] to-[#765236] hover:from-[#A9794F] hover:to-[#8B5A2B] text-sm font-medium text-white shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                <span>Submit & Generate Formal Trade Quotation</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
