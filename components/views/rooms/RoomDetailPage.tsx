'use client';

import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { RoomScene } from '../../rooms/RoomScene';
import { ProductCard } from '../../products/ProductCard';
import { Sparkles, ArrowLeft, SlidersHorizontal, Compass, Layers, CheckCircle2 } from 'lucide-react';

interface Props {
  roomSlug: string;
}

export const RoomDetailPage: React.FC<Props> = ({ roomSlug }) => {
  const { rooms, allProducts, navigate, setIsAIOpen } = useStore();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const room = rooms.find((r) => r.slug === roomSlug) || rooms[0];

  // Filter individual catalog products strictly belonging to this room
  const roomProducts = allProducts.filter((p) => p.room === room.type);

  const categories = ['all', ...Array.from(new Set(roomProducts.map((p) => p.category)))];

  const displayedProducts = activeCategoryFilter === 'all'
    ? roomProducts
    : roomProducts.filter((p) => p.category === activeCategoryFilter);

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Back navigation & Room Header */}
        <div>
          <button
            onClick={() => navigate('/rooms')}
            className="text-xs font-semibold text-[#8B5A2B] hover:text-[#4A2C1A] flex items-center gap-1.5 mb-4 group cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to Living Spaces Hub</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#EEE9E1]">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B] bg-[#F5E6D3] px-3 py-0.5 rounded-full inline-block">
                Architectural Room Study
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#211E1B]">
                {room.name}
              </h1>
              <p className="text-sm sm:text-base text-[#746B61] leading-relaxed">
                {room.description}
              </p>
            </div>

            {/* AI Room Consultant button */}
            <button
              onClick={() => setIsAIOpen(true)}
              className="btn-secondary-refined active:scale-95 text-[#4A2C1A] px-5 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-[#8B5A2B]/30 shadow-sm self-start cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
              <span>Ask AI About {room.name} Proportions</span>
            </button>
          </div>
        </div>

        {/* 1. Interactive Staged Room Scene with Hotspots */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#4A2C1A]">
              1. Interactive Spatial Scene
            </h2>
            <span className="text-xs text-[#9C9287]">
              Hover any piece to view joinery & instant carting
            </span>
          </div>
          <RoomScene room={room} fullWidth hideBottomRail />
        </section>

        {/* 2. Individual Products Catalog for this Room */}
        <section className="pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEE9E1]">
            <div>
              <h2 className="font-display font-bold text-2xl text-[#211E1B]">
                2. Individual {room.name} Pieces ({roomProducts.length})
              </h2>
              <p className="text-xs text-[#746B61]">
                Every item featured in the room above is available as an individual handcrafted piece.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200 interactive-pill cursor-pointer ${
                    activeCategoryFilter === cat
                      ? 'bg-[#4A2C1A] text-white shadow-sm'
                      : 'bg-white text-[#514A43] hover:bg-[#F5E6D3] hover:text-[#4A2C1A] border border-[#DED7CD]'
                  }`}
                >
                  {cat === 'all' ? 'All Pieces' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} showRoomTag={false} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
