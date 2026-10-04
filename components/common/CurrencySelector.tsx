'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/providers/CurrencyProvider';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const CurrencySelector: React.FC<{ className?: string; minimal?: boolean }> = ({ 
  className = '', 
  minimal = false 
}) => {
  const { currentCurrency, setCurrency, supportedCurrencies, currencyConfig } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs tracking-wider uppercase font-medium text-[#D8B486] hover:text-[#FAF7F2] bg-[#2A1A12]/40 hover:bg-[#2A1A12]/70 border border-[#8B5A2B]/20 hover:border-[#8B5A2B]/40 rounded-full transition-all duration-200 backdrop-blur-sm shadow-sm"
        aria-label="Select Currency"
      >
        <Globe className="w-3.5 h-3.5 text-[#A9794F]" />
        <span>{currencyConfig.code}</span>
        <span className="text-[#B9AA99] text-[10px]">({currencyConfig.symbol.trim()})</span>
        <ChevronDown className={`w-3 h-3 text-[#B9AA99] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#211915]/95 border border-[#8B5A2B]/30 shadow-2xl backdrop-blur-xl py-1.5 z-50 animate-fadeIn">
          <div className="px-3 py-1.5 border-b border-[#8B5A2B]/20">
            <span className="text-[10px] uppercase tracking-widest text-[#B9AA99] font-medium">Select Currency</span>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {supportedCurrencies.map((curr) => (
              <button
                key={curr.code}
                type="button"
                onClick={() => {
                  setCurrency(curr.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                  currentCurrency === curr.code
                    ? 'bg-[#4A2C1A]/60 text-[#D8B486] font-semibold'
                    : 'text-[#FAF7F2]/80 hover:bg-[#2A1A12]/80 hover:text-[#FAF7F2]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-mono font-bold text-[#A9794F]">{curr.symbol.trim()}</span>
                  <span className="text-left font-sans">{curr.code}</span>
                  <span className="text-[10px] text-[#B9AA99]">({curr.name})</span>
                </div>
                {currentCurrency === curr.code && (
                  <Check className="w-3.5 h-3.5 text-[#D8B486]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
