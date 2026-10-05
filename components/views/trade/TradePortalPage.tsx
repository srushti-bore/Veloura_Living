'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileText,
  FileSpreadsheet,
  Package,
  UserCheck,
  Sparkles,
  ShieldCheck,
  Plus,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Download,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { TradePartner, ProjectRFQ, SwatchSampleBoxOrder, VIPConciergeBooking } from '@/types/trade';
import { TradeStore } from '@/lib/data/tradeStore';
import { useCurrency } from '@/providers/CurrencyProvider';
import { TradeRegisterModal } from './TradeRegisterModal';
import { TradeRFQBuilderModal } from './TradeRFQBuilderModal';
import { SwatchBoxOrderDrawer } from './SwatchBoxOrderDrawer';
import { VIPConciergeBookingModal } from './VIPConciergeBookingModal';
import Link from 'next/link';

export const TradePortalPage: React.FC = () => {
  const { formatPrice } = useCurrency();

  // Initial State from Store
  const [partner, setPartner] = useState<TradePartner | undefined>(() => TradeStore.getTradePartner('trade_partner_001'));
  const [rfqs, setRfqs] = useState<ProjectRFQ[]>(() => TradeStore.getRFQs());
  const [swatchBoxes, setSwatchBoxes] = useState<SwatchSampleBoxOrder[]>(() => TradeStore.getSwatchBoxOrders());
  const [bookings, setBookings] = useState<VIPConciergeBooking[]>(() => TradeStore.getVIPBookings());

  // Modal Triggers
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRFQOpen, setIsRFQOpen] = useState(false);
  const [isSwatchBoxOpen, setIsSwatchBoxOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  // Sync list handlers
  const handlePartnerRegistered = (newPartner: TradePartner) => {
    setPartner(newPartner);
  };

  const handleRFQCreated = (newRFQ: ProjectRFQ) => {
    setRfqs((prev) => [newRFQ, ...prev]);
  };

  const handleSwatchOrderPlaced = (newBox: SwatchSampleBoxOrder) => {
    setSwatchBoxes((prev) => [newBox, ...prev]);
  };

  const handleBookingConfirmed = (newBooking: VIPConciergeBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  return (
    <main className="min-h-screen bg-[#0E0C0A] text-[#FAF7F2] pt-24 pb-20">
      {/* Background Ambient Glows */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-[#8B5A2B]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-[#4A2C1A]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* 1. Hero Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2A1F18] border border-[#8B5A2B]/40 text-[#D8B486] text-xs font-semibold uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5 text-[#D8B486]" />
            <span>Architect & Interior Designer Trade Enclave</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#FAF7F2] leading-tight">
            The Atelier Trade & VIP Concierge Portal
          </h1>

          <p className="text-sm sm:text-base text-stone-400 leading-relaxed">
            Elevate commercial projects and private residences. Access tiered commercial privileges, instant GST tax quotations, complimentary 8K material swatch boxes, and dedicated spatial project leads.
          </p>
        </section>

        {/* 2. Active Trade Account Status Bar */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#211914] via-[#1A1410] to-[#211914] border border-[#8B5A2B]/40 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest text-[#A9794F] font-semibold">
                  Active Trade Membership
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[11px] font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Partner
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#FAF7F2]">
                {partner?.businessName || 'Studio Milan Architectural Interiors'}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400">
                <div>
                  <span className="text-stone-300 font-medium">Contact:</span> {partner?.contactPerson}
                </div>
                <div>
                  <span className="text-stone-300 font-medium">GSTIN:</span> {partner?.gstin}
                </div>
                <div>
                  <span className="text-stone-300 font-medium">Dedicated Lead:</span> {partner?.dedicatedManagerName}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setIsRFQOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#8B5A2B] to-[#765236] hover:from-[#A9794F] hover:to-[#8B5A2B] text-xs font-semibold text-white shadow-xl transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Project RFQ</span>
              </button>

              <button
                onClick={() => setIsSwatchBoxOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2A1F18] border border-[#8B5A2B]/40 hover:border-[#8B5A2B] text-xs font-semibold text-[#FAF7F2] transition-all cursor-pointer"
              >
                <Package className="w-4 h-4 text-[#D8B486]" />
                <span>Order Swatch Box</span>
              </button>

              <button
                onClick={() => setIsConciergeOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2A1F18] border border-[#8B5A2B]/40 hover:border-[#8B5A2B] text-xs font-semibold text-[#FAF7F2] transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#D8B486]" />
                <span>Book Concierge</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. Trade Privilege Tiers */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-widest font-semibold text-[#D8B486]">
              Trade Privilege Matrix
            </h3>
            <span className="text-xs text-stone-400">Cumulative Annual or Single Project Volume</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bronze Tier */}
            <div className="p-6 rounded-3xl bg-[#16120F] border border-white/5 space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#B9AA99] font-bold">
                    Bronze Tier
                  </span>
                  <div className="text-3xl font-serif font-bold text-[#FAF7F2] mt-1">15% Off</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/5 text-stone-300 text-xs font-mono">
                  ₹5L – ₹10L
                </span>
              </div>
              <ul className="space-y-2 text-xs text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>Trade pricing on all catalog pieces</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>3D CAD / Revit / BIM mesh downloads</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>Priority workshop fulfillment</span>
                </li>
              </ul>
            </div>

            {/* Silver Tier (Active) */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#2A1F18] to-[#16120F] border border-[#8B5A2B] shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#8B5A2B] text-white text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-bl-xl">
                Current Active Tier
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#D8B486] font-bold">
                    Silver Tier
                  </span>
                  <div className="text-3xl font-serif font-bold text-[#D8B486] mt-1">20% Off</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#8B5A2B]/20 text-[#D8B486] text-xs font-mono mt-5">
                  ₹10L – ₹25L
                </span>
              </div>
              <ul className="space-y-2 text-xs text-[#FAF7F2]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D8B486]" />
                  <span>Everything in Bronze Tier</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D8B486]" />
                  <span>Complimentary 8K Swatch Sample Boxes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D8B486]" />
                  <span>Complimentary In-Home White-Glove Setup</span>
                </li>
              </ul>
            </div>

            {/* Gold Tier */}
            <div className="p-6 rounded-3xl bg-[#16120F] border border-white/5 space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#A9794F] font-bold">
                    Gold Bespoke Tier
                  </span>
                  <div className="text-3xl font-serif font-bold text-[#FAF7F2] mt-1">25% Off</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/5 text-stone-300 text-xs font-mono">
                  &gt; ₹25L
                </span>
              </div>
              <ul className="space-y-2 text-xs text-stone-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>Everything in Silver Tier</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>Dedicated Senior Trade Project Manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>Custom Millwork & Bespoke Dimensions</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Active Project RFQs & Quotations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm uppercase tracking-widest font-semibold text-[#D8B486]">
                Project Quotations & RFQ Ledger ({rfqs.length})
              </h3>
              <p className="text-xs text-stone-400">Formal commercial estimates and tax breakdowns</p>
            </div>
            <button
              onClick={() => setIsRFQOpen(true)}
              className="flex items-center gap-1.5 text-xs text-[#D8B486] hover:text-white font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New RFQ</span>
            </button>
          </div>

          <div className="rounded-3xl bg-[#16120F] border border-white/5 overflow-hidden">
            {rfqs.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-sm">
                No active RFQs. Click "New Project RFQ" to generate your first commercial estimate.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-[#211B16] text-[#FAF7F2] uppercase text-[10px] tracking-wider border-b border-white/5">
                    <tr>
                      <th className="p-4">Quotation #</th>
                      <th className="p-4">Project Title & Location</th>
                      <th className="p-4">Pieces</th>
                      <th className="p-4">Trade Value</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rfqs.map((rfq) => (
                      <tr key={rfq.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-mono font-medium text-[#FAF7F2]">
                          {rfq.quotationNumber}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-[#FAF7F2]">{rfq.projectTitle}</div>
                          <div className="text-[11px] text-stone-400">{rfq.projectLocation}</div>
                        </td>
                        <td className="p-4">
                          {rfq.lineItems.reduce((acc, item) => acc + item.quantity, 0)} Units
                        </td>
                        <td className="p-4 font-mono font-medium text-[#D8B486]">
                          {formatPrice(rfq.grandTotalINR)}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#8B5A2B]/20 text-[#D8B486] border border-[#8B5A2B]/30 font-medium uppercase text-[10px]">
                            {rfq.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <a
                              href={`/api/trade/quotation/${rfq.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A1F18] border border-[#8B5A2B]/40 hover:border-[#8B5A2B] text-[11px] text-[#FAF7F2] font-medium transition-all"
                              title="Open Printable Commercial Tax Quotation"
                            >
                              <Download className="w-3 h-3 text-[#D8B486]" />
                              <span>Quotation</span>
                            </a>
                            <a
                              href={`/api/trade/rfq/${rfq.id}/export`}
                              download
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F1914] border border-white/10 hover:border-[#8B5A2B]/60 text-[11px] text-[#D8B486] hover:text-white font-medium transition-all"
                              title="Download Excel / CSV Project Bill of Materials"
                            >
                              <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                              <span>CSV BOM</span>
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* 5. Two Column: Swatch Boxes + VIP Concierge Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Swatch Sample Box Tracker */}
          <section className="p-6 rounded-3xl bg-[#16120F] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D8B486]" />
                <h3 className="text-sm uppercase tracking-widest font-semibold text-[#FAF7F2]">
                  Sample Box Deliveries
                </h3>
              </div>
              <button
                onClick={() => setIsSwatchBoxOpen(true)}
                className="text-xs text-[#D8B486] hover:text-white font-medium transition-colors"
              >
                + Order Box
              </button>
            </div>

            <div className="space-y-3">
              {swatchBoxes.map((box) => (
                <div
                  key={box.id}
                  className="p-4 rounded-2xl bg-[#211B16] border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-[#FAF7F2]">{box.recipientName}</div>
                      <div className="text-stone-400 text-[11px]">
                        {box.shippingAddress}, {box.city} ({box.postalCode})
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-medium border border-emerald-800">
                      {box.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-400 text-[11px] pt-1 border-t border-white/5">
                    <span>Tracking: <strong className="text-stone-300 font-mono">{box.trackingNumber}</strong></span>
                    <span>{box.courierPartner}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* VIP Concierge Bookings */}
          <section className="p-6 rounded-3xl bg-[#16120F] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D8B486]" />
                <h3 className="text-sm uppercase tracking-widest font-semibold text-[#FAF7F2]">
                  VIP Consultations
                </h3>
              </div>
              <button
                onClick={() => setIsConciergeOpen(true)}
                className="text-xs text-[#D8B486] hover:text-white font-medium transition-colors"
              >
                + Book Session
              </button>
            </div>

            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-2xl bg-[#211B16] border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-[#FAF7F2]">{booking.serviceType.replace(/_/g, ' ')}</div>
                      <div className="text-[#D8B486] text-[11px]">{booking.scheduledDate} ({booking.timeSlot})</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#8B5A2B]/20 text-[#D8B486] text-[10px] font-medium border border-[#8B5A2B]/30">
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-400 text-[11px] pt-1 border-t border-white/5">
                    <span>Lead: {booking.conciergeSpecialist}</span>
                    <a
                      href={booking.meetingLinkOrAddress}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D8B486] hover:underline flex items-center gap-1"
                    >
                      <span>Join Room</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      <TradeRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={handlePartnerRegistered}
      />

      <TradeRFQBuilderModal
        isOpen={isRFQOpen}
        onClose={() => setIsRFQOpen(false)}
        partner={partner}
        onRFQCreated={handleRFQCreated}
      />

      <SwatchBoxOrderDrawer
        isOpen={isSwatchBoxOpen}
        onClose={() => setIsSwatchBoxOpen(false)}
        partner={partner}
        onOrderPlaced={handleSwatchOrderPlaced}
      />

      <VIPConciergeBookingModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
        onBookingConfirmed={handleBookingConfirmed}
      />
    </main>
  );
};
