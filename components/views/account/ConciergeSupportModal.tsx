'use client';

import React, { useState } from 'react';
import { X, Headphones, Sparkles, Phone, Mail, MessageSquare, Check, Clock } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

interface ConciergeSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
}

export const ConciergeSupportModal: React.FC<ConciergeSupportModalProps> = ({
  isOpen,
  onClose,
  customerName = 'Patron',
}) => {
  const { setIsAIOpen } = useStore();
  const [inquiryType, setInquiryType] = useState('SPATIAL_DESIGN');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
      onClose();
    }, 2000);
  };

  const handleOpenAIConsultant = () => {
    onClose();
    if (setIsAIOpen) setIsAIOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#21140D]/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#FAF7F2] rounded-3xl border border-[#E6DACD] shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EADBCC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EADBCC]/60 flex items-center justify-center text-[#55361F]">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#2B1810]">
                Veloura Atelier Concierge
              </h3>
              <p className="text-xs text-[#7D6B5D] font-sans font-light">
                Dedicated support for furniture commissions & delivery logistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7D6B5D] hover:text-[#2B1810] hover:bg-[#F2E8DC] rounded-full transition-colors cursor-pointer"
            aria-label="Close concierge dialogue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Options */}
        <div className="my-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleOpenAIConsultant}
            className="p-3.5 bg-white rounded-2xl border border-[#EADBCC] hover:border-[#8C6D58] hover:bg-[#F5EFE6] text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#2B1810]">Spatial AI Assistant</span>
              <Sparkles className="w-4 h-4 text-[#A9794F]" />
            </div>
            <p className="text-[11px] text-[#7D6B5D] font-light">Instant room dimension & palette advice</p>
          </button>

          <a
            href="tel:+9118002098899"
            className="p-3.5 bg-white rounded-2xl border border-[#EADBCC] hover:border-[#8C6D58] hover:bg-[#F5EFE6] text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#2B1810]">Atelier Hotline</span>
              <Phone className="w-4 h-4 text-[#A9794F]" />
            </div>
            <p className="text-[11px] text-[#7D6B5D] font-light">1800-209-8899 (Mon–Sat 9AM–8PM)</p>
          </a>
        </div>

        {/* Inquiry Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-[#EADBCC] space-y-4">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-[#7D6B5D]">
            Direct Concierge Dispatch
          </h4>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#7D6B5D] font-medium mb-1">
              Inquiry Subject
            </label>
            <select
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value)}
              className="w-full text-xs bg-[#FAF7F2] border border-[#EADBCC] rounded-xl px-3 py-2 text-[#2B1810] outline-none"
            >
              <option value="SPATIAL_DESIGN">Custom Spatial Design & Layout Consultation</option>
              <option value="ORDER_TELEMETRY">Order Delivery Status & Freight Inquiries</option>
              <option value="MATERIAL_SWATCHES">Timber & Bouclé Fabric Swatches Request</option>
              <option value="WARRANTY_CARE">10-Year Timber Warranty & Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#7D6B5D] font-medium mb-1">
              Your Message
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`How may our architectural team assist your home, ${customerName}?`}
              className="w-full text-xs bg-[#FAF7F2] border border-[#EADBCC] rounded-xl p-3 text-[#2B1810] placeholder-[#8C7A6B] outline-none resize-none font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#7D6B5D] flex items-center gap-1 font-light">
              <Clock className="w-3.5 h-3.5 text-[#A9794F]" /> Average response time: 2 hours
            </span>
            <button
              type="submit"
              disabled={isSubmitted}
              className="px-5 py-2.5 bg-[#3E2718] hover:bg-[#2B1810] text-[#FAF7F2] rounded-xl text-xs font-medium transition-all shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-75"
            >
              {isSubmitted ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inquiry Dispatched!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send to Concierge</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
