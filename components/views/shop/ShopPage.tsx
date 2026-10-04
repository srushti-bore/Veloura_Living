'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '@/hooks/useStore';
import { ProductCard } from '../../products/ProductCard';
import { ShopRoomHoverPanel } from './ShopRoomHoverPanel';
import { ShopMobileRoomAccordion } from './ShopMobileRoomAccordion';
import { ShopFilterSidebar } from './ShopFilterSidebar';
import { SHOP_ROOM_HOVER_DATA } from '@/lib/data/shopRoomHoverData';
import { ShopRoomSubcategory, ShopRoomFeaturedHero } from '@/types/shopHover';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { RoomType } from '../../../types';

export const ShopPage: React.FC = () => {
  const { allProducts, rooms, filters, setFilters, searchQuery, setSearchQuery, resetFilters, navigate } = useStore();

  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  // Shop Room Hover State
  const [hoveredRoomKey, setHoveredRoomKey] = useState<string | null>(null);
  const [isHoverPanelOpen, setIsHoverPanelOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const materialsList = ['all', 'Solid Walnut', 'Oak', 'Bouclé', 'Linen', 'Leather', 'Travertine'];

  // Hover Handlers with safety delay
  const handleRoomMouseEnter = (roomKey: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredRoomKey(roomKey);
    setIsHoverPanelOpen(true);
  };

  const handleRoomMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsHoverPanelOpen(false);
      setHoveredRoomKey(null);
    }, 180);
  };

  const handlePanelMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsHoverPanelOpen(true);
  };

  const handlePanelMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsHoverPanelOpen(false);
      setHoveredRoomKey(null);
    }, 180);
  };

  const handleSelectSubcategory = (item: ShopRoomSubcategory) => {
    if (item.href) {
      navigate(item.href);
    } else {
      setFilters((prev) => ({
        ...prev,
        ...(hoveredRoomKey && hoveredRoomKey !== 'all' ? { room: hoveredRoomKey as RoomType } : {}),
        category: item.categoryFilter || prev.category,
        material: item.materialFilter || prev.material,
        furnitureType: item.furnitureType || prev.furnitureType
      }));
    }
    setIsHoverPanelOpen(false);
    setHoveredRoomKey(null);
  };

  const handleSelectHero = (hero: ShopRoomFeaturedHero) => {
    if (hero.href) {
      navigate(hero.href);
    } else if (hero.targetRoom) {
      setFilters((prev) => ({
        ...prev,
        room: hero.targetRoom || 'all',
        category: hero.targetCategory || 'all'
      }));
    }
    setIsHoverPanelOpen(false);
    setHoveredRoomKey(null);
  };

  const handlePrimaryCta = () => {
    if (!hoveredRoomKey || hoveredRoomKey === 'all') {
      setFilters((prev) => ({ ...prev, room: 'all', category: 'all' }));
    } else {
      setFilters((prev) => ({ ...prev, room: hoveredRoomKey as RoomType, category: 'all' }));
    }
    setIsHoverPanelOpen(false);
    setHoveredRoomKey(null);
  };

  const handleApplyRoomFilter = (roomType: string) => {
    setFilters((prev) => ({ ...prev, room: roomType as any, category: 'all' }));
    setIsHoverPanelOpen(false);
    setHoveredRoomKey(null);
  };

  // Handle AI Search prompt
  const handleAISearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;

    const query = aiPromptInput.toLowerCase();
    let explanation = '';

    if (query.includes('living') || query.includes('sofa')) {
      setFilters((prev) => ({ ...prev, room: 'living-room' }));
      explanation = 'Derived spatial focus: Living Room seating & sculptural tables.';
    } else if (query.includes('bed') || query.includes('bedroom')) {
      setFilters((prev) => ({ ...prev, room: 'bedroom' }));
      explanation = 'Derived spatial focus: Bedroom sanctuary & low-profile platform beds.';
    } else if (query.includes('dining') || query.includes('table')) {
      setFilters((prev) => ({ ...prev, room: 'dining' }));
      explanation = 'Derived spatial focus: Dining tables & heirloom wood gathering.';
    } else if (query.includes('office') || query.includes('desk') || query.includes('work')) {
      setFilters((prev) => ({ ...prev, room: 'office' }));
      explanation = 'Derived spatial focus: Executive home study & ergonomic seating.';
    }

    if (query.includes('under') || query.includes('budget') || query.includes('lakh')) {
      setFilters((prev) => ({ ...prev, maxPrice: 70000 }));
      explanation += ' Filtered max investment to ₹70,000.';
    }

    setSearchQuery(aiPromptInput);
    setAiExplanation(explanation || 'Semantic spatial intent matched across catalog materials and dimensions.');
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Room
      if (filters.room !== 'all' && product.room !== filters.room) return false;

      // Category
      if (filters.category !== 'all' && product.category.toLowerCase() !== filters.category.toLowerCase()) return false;

      // Max Price
      const effectivePrice = product.salePrice || product.price;
      if (effectivePrice > filters.maxPrice) return false;

      // Material
      if (filters.material !== 'all') {
        const hasMaterial = product.materials.some((m) =>
          m.toLowerCase().includes(filters.material.toLowerCase())
        );
        if (!hasMaterial) return false;
      }

      // Keyword / AI Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        const matchMat = product.materials.some((m) => m.toLowerCase().includes(q));
        const matchType = product.furnitureType.toLowerCase().includes(q);
        const matchRoom = product.room.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchMat && !matchType && !matchRoom) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice || a.price;
      const priceB = b.salePrice || b.price;
      if (filters.sortBy === 'price-asc') return priceA - priceB;
      if (filters.sortBy === 'price-desc') return priceB - priceA;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured
    });
  }, [allProducts, filters, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header & AI Search Suite */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B] block mb-1">
                Veloura Complete Catalog
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#211E1B]">
                Discover Handcrafted Furniture
              </h1>
            </div>

            <div className="text-xs text-[#746B61]">
              Displaying <strong>{filteredProducts.length}</strong> of {allProducts.length} pieces
            </div>
          </div>

          {/* AI Natural Language Search Bar */}
          <form onSubmit={handleAISearch} className="relative">
            <div className="flex items-center bg-[#FCFAF7] border-2 border-[#8B5A2B]/30 rounded-2xl overflow-hidden focus-within:border-[#8B5A2B] focus-within:ring-2 focus-within:ring-[#8B5A2B]/20 shadow-inner p-1.5 transition-all duration-200">
              <div className="p-2 text-[#8B5A2B]">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <input
                type="text"
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                placeholder="Ask with natural intent: e.g., 'Warm beige sofa for small living room under ₹1.5 lakh' or 'Solid walnut 8-seater dining'..."
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[#211E1B] placeholder-[#9C9287] focus:outline-none"
              />
              <button
                type="submit"
                className="btn-primary-shimmer active:scale-[0.98] px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-sm"
              >
                <span>AI Search</span>
              </button>
            </div>

            {aiExplanation && (
              <div className="mt-2.5 px-3 py-2 bg-[#F5E6D3]/60 rounded-xl text-xs text-[#4A2C1A] flex items-center justify-between border border-[#8B5A2B]/20 animate-fadeIn">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  {aiExplanation}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAiExplanation(null);
                    setAiPromptInput('');
                    resetFilters();
                  }}
                  className="text-[#9C9287] hover:text-[#211E1B] p-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </form>

          {/* Primary Room Switcher Tabs with Hover Trigger Area */}
          <div
            className="relative border-t border-[#EEE9E1] pt-4"
            onMouseLeave={handleRoomMouseLeave}
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9C9287] mr-2">
                Room:
              </span>
              
              <button
                type="button"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, room: 'all' }));
                  setHoveredRoomKey('all');
                  setIsHoverPanelOpen(true);
                }}
                onMouseEnter={() => handleRoomMouseEnter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 interactive-pill cursor-pointer relative ${
                  filters.room === 'all'
                    ? 'bg-[#4A2C1A] text-white shadow-sm'
                    : 'bg-[#FCFAF7] text-[#514A43] hover:bg-[#EEE9E1] hover:text-[#211E1B]'
                } ${hoveredRoomKey === 'all' && isHoverPanelOpen ? 'ring-2 ring-[#8B5A2B]/40 bg-[#F5E6D3] text-[#4A2C1A]' : ''}`}
                aria-expanded={isHoverPanelOpen && hoveredRoomKey === 'all'}
                aria-haspopup="true"
              >
                All Living Spaces
              </button>

              {rooms.map((r) => {
                const isSelected = filters.room === r.type;
                const isHovered = hoveredRoomKey === r.type && isHoverPanelOpen;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, room: r.type }));
                      setHoveredRoomKey(r.type);
                      setIsHoverPanelOpen(true);
                    }}
                    onMouseEnter={() => handleRoomMouseEnter(r.type)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 interactive-pill cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#4A2C1A] text-white shadow-sm'
                        : 'bg-[#FCFAF7] text-[#514A43] hover:bg-[#EEE9E1] hover:text-[#211E1B]'
                    } ${isHovered ? 'ring-2 ring-[#8B5A2B]/40 bg-[#F5E6D3] text-[#4A2C1A]' : ''}`}
                    aria-expanded={isHovered}
                    aria-haspopup="true"
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>

            {/* Desktop Dynamic Floating Popover on Hover (Matching Reference Image) */}
            {isHoverPanelOpen && hoveredRoomKey && SHOP_ROOM_HOVER_DATA[hoveredRoomKey] && (
              <div className="hidden lg:block">
                <ShopRoomHoverPanel
                  roomData={SHOP_ROOM_HOVER_DATA[hoveredRoomKey]}
                  isOpen={isHoverPanelOpen}
                  onClose={() => {
                    setIsHoverPanelOpen(false);
                    setHoveredRoomKey(null);
                  }}
                  onMouseEnter={handlePanelMouseEnter}
                  onMouseLeave={handlePanelMouseLeave}
                  onSelectSubcategory={handleSelectSubcategory}
                  onSelectHero={handleSelectHero}
                  onPrimaryCta={handlePrimaryCta}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Room Explorer Accordion */}
        <div className="lg:hidden">
          <ShopMobileRoomAccordion
            activeRoom={filters.room}
            onApplyRoomFilter={handleApplyRoomFilter}
            onSelectSubcategory={handleSelectSubcategory}
            onSelectHero={handleSelectHero}
          />
        </div>

        {/* Main Content Layout with Sticky Filters Sidebar & Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filters Sidebar - Sticky on Desktop */}
          <div className="lg:col-span-3 lg:sticky lg:top-28 self-start">
            <ShopFilterSidebar
              filters={filters}
              setFilters={setFilters}
              resetFilters={resetFilters}
              filteredCount={filteredProducts.length}
              totalCount={allProducts.length}
              materialsList={materialsList}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#EEE9E1] shadow-soft-sm space-y-4 animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-[#F5E6D3] text-[#8B5A2B] flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-display font-bold text-xl text-[#211E1B]">
                  No furniture pieces match your current filters.
                </h3>
                <p className="text-xs text-[#746B61] max-w-sm mx-auto">
                  Try adjusting the maximum price slider or reset filters to browse our full architectural collection.
                </p>
                <button
                  onClick={resetFilters}
                  className="btn-primary-shimmer active:scale-[0.98] text-white px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
