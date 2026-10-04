'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FilterState } from '@/providers/AppProvider';
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  X,
  Check,
  Sparkles,
  Coins,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface Props {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredCount: number;
  totalCount: number;
  materialsList: string[];
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

const SORT_OPTIONS: { value: FilterState['sortBy']; label: string }[] = [
  { value: 'featured', label: 'Featured / Veloura Signature' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Customer Rating' }
];

export const ShopFilterSidebar: React.FC<Props> = ({
  filters,
  setFilters,
  resetFilters,
  filteredCount,
  totalCount,
  materialsList,
  searchQuery,
  setSearchQuery
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isMaterialOpen, setIsMaterialOpen] = useState(true);
  const [isSortOpen, setIsSortOpen] = useState(true);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Track scroll position for floating luxury elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 160);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortDropdownOpen]);

  // Determine active filters
  const hasActiveFilters =
    filters.room !== 'all' ||
    filters.material !== 'all' ||
    filters.category !== 'all' ||
    filters.maxPrice < 200000 ||
    Boolean(searchQuery?.trim());

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === filters.sortBy)?.label || 'Featured';

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ease-out space-y-5 p-5 sm:p-6 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-soft-lg border-[#8B5A2B]/25 ring-1 ring-[#8B5A2B]/10'
          : 'bg-white border-[#4A2C1A]/10 shadow-soft-sm'
      }`}
    >
      {/* Header: Title + Live Counter + Reset */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#EEE9E1]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#8B5A2B]" />
          <h3 className="font-display font-bold text-base text-[#211E1B]">
            Refine Catalog
          </h3>
          <span className="text-[10px] font-bold text-[#8B5A2B] bg-[#F5E6D3] px-2 py-0.5 rounded-full">
            {filteredCount}/{totalCount}
          </span>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="text-[11px] font-semibold text-[#8B5A2B] hover:text-[#4A2C1A] flex items-center gap-1 group cursor-pointer transition-colors"
          title="Reset All Filters"
        >
          <RotateCcw className="w-3 h-3 group-hover:-rotate-90 transition-transform duration-300" />
          <span>Reset</span>
        </button>
      </div>

      {/* Active Filter Chips Strip */}
      {hasActiveFilters && (
        <div className="bg-[#FCFAF7] rounded-xl p-2.5 border border-[#D8C4AD]/40 space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#735E4E]">
            <span>Active Filters</span>
            <span className="text-[9px] text-[#9C9287]">Tap to clear</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filters.room !== 'all' && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, room: 'all' }))}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5E6D3] text-[#4A2C1A] text-[10px] font-semibold hover:bg-[#EADBC8] transition-colors"
              >
                <span>Room: {filters.room}</span>
                <X className="w-2.5 h-2.5 text-[#8B5A2B]" />
              </button>
            )}

            {filters.material !== 'all' && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, material: 'all' }))}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5E6D3] text-[#4A2C1A] text-[10px] font-semibold hover:bg-[#EADBC8] transition-colors"
              >
                <span>Material: {filters.material}</span>
                <X className="w-2.5 h-2.5 text-[#8B5A2B]" />
              </button>
            )}

            {filters.maxPrice < 200000 && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, maxPrice: 200000 }))}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5E6D3] text-[#4A2C1A] text-[10px] font-semibold hover:bg-[#EADBC8] transition-colors"
              >
                <span>≤ ₹{filters.maxPrice.toLocaleString('en-IN')}</span>
                <X className="w-2.5 h-2.5 text-[#8B5A2B]" />
              </button>
            )}

            {searchQuery?.trim() && setSearchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5E6D3] text-[#4A2C1A] text-[10px] font-semibold hover:bg-[#EADBC8] transition-colors"
              >
                <span>Query: "{searchQuery}"</span>
                <X className="w-2.5 h-2.5 text-[#8B5A2B]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Collapsible Price Range Slider */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#4A2C1A] hover:text-[#8B5A2B] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>Max Investment</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#8B5A2B] lowercase">
              ₹{filters.maxPrice.toLocaleString('en-IN')}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#735E4E] transition-transform duration-200 ${
                isPriceOpen ? 'rotate-180 text-[#8B5A2B]' : ''
              }`}
            />
          </div>
        </button>

        {isPriceOpen && (
          <div className="space-y-2 pt-1 animate-fadeIn">
            <input
              type="range"
              min={20000}
              max={200000}
              step={5000}
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
              }
              className="w-full accent-[#8B5A2B] cursor-pointer transition-all"
            />
            <div className="flex justify-between text-[10px] text-[#9C9287] font-medium">
              <span>₹20,000</span>
              <span>₹2,00,000</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Collapsible Material Craft Selector */}
      <div className="space-y-2.5 pt-3 border-t border-[#EEE9E1]">
        <button
          type="button"
          onClick={() => setIsMaterialOpen(!isMaterialOpen)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#4A2C1A] hover:text-[#8B5A2B] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>Material Craft</span>
          </span>
          <div className="flex items-center gap-1.5">
            {filters.material !== 'all' && (
              <span className="text-[10px] font-semibold text-[#8B5A2B] bg-[#F5E6D3] px-1.5 py-0.2 rounded-md">
                {filters.material}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#735E4E] transition-transform duration-200 ${
                isMaterialOpen ? 'rotate-180 text-[#8B5A2B]' : ''
              }`}
            />
          </div>
        </button>

        {isMaterialOpen && (
          <div className="flex flex-wrap gap-1.5 pt-1 animate-fadeIn">
            {materialsList.map((mat) => {
              const isSelected = filters.material === mat;
              return (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, material: mat }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#8B5A2B] text-white font-semibold shadow-sm'
                      : 'bg-[#FCFAF7] text-[#514A43] hover:bg-[#F5E6D3] hover:text-[#4A2C1A] border border-[#EEE9E1]'
                  }`}
                >
                  {mat === 'all' ? 'All Materials' : mat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Collapsible Custom Luxury Sort Dropdown */}
      <div className="space-y-2.5 pt-3 border-t border-[#EEE9E1]" ref={sortDropdownRef}>
        <button
          type="button"
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#4A2C1A] hover:text-[#8B5A2B] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>Sort Order</span>
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#735E4E] transition-transform duration-200 ${
              isSortOpen ? 'rotate-180 text-[#8B5A2B]' : ''
            }`}
          />
        </button>

        {isSortOpen && (
          <div className="relative pt-1 animate-fadeIn">
            {/* Custom Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="w-full bg-[#FCFAF7] border border-[#DED7CD] hover:border-[#8B5A2B] rounded-xl px-3.5 py-2.5 text-xs text-[#211E1B] flex items-center justify-between transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20"
              aria-haspopup="listbox"
              aria-expanded={isSortDropdownOpen}
            >
              <span className="truncate font-medium">{currentSortLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8B5A2B] transition-transform duration-200 flex-shrink-0 ${
                  isSortDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Custom Popover Options Menu */}
            {isSortDropdownOpen && (
              <div
                className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#D8C4AD] rounded-xl shadow-xl overflow-hidden py-1 z-30 animate-fadeIn"
                role="listbox"
              >
                {SORT_OPTIONS.map((option) => {
                  const isSelected = filters.sortBy === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, sortBy: option.value }));
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#F5E6D3]/70 text-[#4A2C1A] font-bold'
                          : 'text-[#514A43] hover:bg-[#F7F0E7] hover:text-[#211E1B]'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#8B5A2B] flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
