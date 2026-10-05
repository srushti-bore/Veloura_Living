'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, MessageSquare, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';
import { VIPConciergeBooking, ConciergeServiceType } from '@/types/trade';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (booking: VIPConciergeBooking) => void;
}

export const VIPConciergeBookingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onBookingConfirmed,
}) => {
  const [clientName, setClientName] = useState('Ar. Matteo Rossi');
  const [email, setEmail] = useState('matteo@studiomilan.it');
  const [phone, setPhone] = useState('+91 98200 88776');
  const [serviceType, setServiceType] = useState<ConciergeServiceType>('TRADE_PROJECT_KICKOFF');
  const [scheduledDate, setScheduledDate] = useState('2026-10-15');
  const [timeSlot, setTimeSlot] = useState('02:00 PM - 03:30 PM IST');
  const [locationOrVirtual, setLocationOrVirtual] = useState('Atelier Virtual Spatial Tour (Google Meet)');
  const [roomDetails, setRoomDetails] = useState('Penthouse Master Suite (4,500 sq ft)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/concierge/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          email,
          phone,
          serviceType,
          scheduledDate,
          timeSlot,
          locationOrVirtual,
          roomDetails,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onBookingConfirmed(data.data);
        onClose();
      } else {
        setErrorMsg(data.error?.message || 'Failed to book concierge consultation.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Veloura Concierge Atelier! I am ${clientName} (${email}). I would like to schedule a private spatial consultation for: ${roomDetails || 'Residential Project'}.`
    );
    window.open(`https://wa.me/919820088776?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-[#181411] border border-[#8B5A2B]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-[#FAF7F2] overflow-hidden"
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
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#A9794F] font-semibold">
              Private Atelier Appointment
            </span>
            <h3 className="font-serif text-2xl font-medium tracking-tight text-[#FAF7F2]">
              Book VIP Spatial Concierge
            </h3>
          </div>
        </div>

        <p className="text-xs text-stone-400 mb-5 leading-relaxed">
          Schedule a dedicated 1-on-1 session with Senior Architect Elena Bianchi. Includes 3D floor plan layout reviews, custom fabric pairing, and commercial project timelines.
        </p>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Your Name / Studio *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Consultation Type *
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ConciergeServiceType)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              >
                <option value="TRADE_PROJECT_KICKOFF">Trade Project Architectural Kickoff</option>
                <option value="IN_HOME_SPATIAL">In-Home White-Glove Spatial Consultation</option>
                <option value="VIRTUAL_ATELIER_TOUR">Atelier Milan Virtual 3D Tour</option>
                <option value="MATERIALS_CONSULTATION">8K Macro Materials & Swatch Matching</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Preferred Date *
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Preferred Time Slot *
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              >
                <option value="10:00 AM - 11:30 AM IST">10:00 AM - 11:30 AM IST (Morning)</option>
                <option value="02:00 PM - 03:30 PM IST">02:00 PM - 03:30 PM IST (Afternoon)</option>
                <option value="05:00 PM - 06:30 PM IST">05:00 PM - 06:30 PM IST (Evening)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                Location / Virtual *
              </label>
              <input
                type="text"
                required
                value={locationOrVirtual}
                onChange={(e) => setLocationOrVirtual(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
              Project / Space Details
            </label>
            <input
              type="text"
              value={roomDetails}
              onChange={(e) => setRoomDetails(e.target.value)}
              placeholder="e.g. 4-BHK Sea-Facing Penthouse, living room layout review"
              className="w-full px-3.5 py-2 rounded-xl bg-[#211B16] border border-white/10 text-xs text-white outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1E2E22] border border-emerald-600/40 hover:border-emerald-500 text-xs font-medium text-emerald-300 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Instant WhatsApp Concierge</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#8B5A2B] to-[#765236] hover:from-[#A9794F] hover:to-[#8B5A2B] text-xs font-medium text-white shadow-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Confirm Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
