'use client';

import React, { useState } from 'react';
import { Room, Product } from '@/types';
import { useStore } from '@/hooks/useStore';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  room: Room;
  onSelectProduct?: (product: Product) => void;
  fullWidth?: boolean;
  hideBottomRail?: boolean;
}

export const RoomScene: React.FC<Props> = ({ room, fullWidth = false, hideBottomRail = false }) => {
  const { allProducts, addToCart, navigate } = useStore();
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  const getProductForHotspot = (productId: string): Product | undefined => {
    return allProducts.find((p) => p.id === productId);
  };

  const activeHotspot = room.hotspots.find((h) => h.id === activeHotspotId);
  const activeProduct = activeHotspot ? getProductForHotspot(activeHotspot.productId) : null;

  return (
    <div className={`relative bg-white rounded-3xl overflow-hidden border border-[#4A2C1A]/15 shadow-soft-lg ${fullWidth ? 'w-full' : ''}`}>
      {/* Top Scene Metadata Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-[#FCFAF7] via-white to-[#F7F4EF] border-b border-[#EEE9E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#8B5A2B] bg-[#F5E6D3] px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Interactive Room Experience
            </span>
            <span className="text-xs text-[#9C9287]">
              • {room.hotspots.length} Clickable Pieces
            </span>
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-[#4A2C1A] mt-1">
            {room.name} — Spatial Staging
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/rooms/${room.slug}`)}
            className="text-xs font-semibold text-[#4A2C1A] hover:text-[#8B5A2B] flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#4A2C1A]/20 hover:bg-[#F5E6D3]/40 group transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span>Explore Full {room.name} Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 interactive-arrow" />
          </button>
        </div>
      </div>

      {/* Main Room Viewport with Interactive Hotspots */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#211E1B] overflow-hidden select-none">
        {/* High Resolution Room Photography */}
        <img
          src={room.heroImage || room.categoryImage}
          alt={`${room.name} interactive interior scene`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.01]"
        />

        {/* Subtle Vignette for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Hotspots Overlay */}
        {room.hotspots.map((hotspot) => {
          const isSelected = activeHotspotId === hotspot.id;
          const product = getProductForHotspot(hotspot.productId);

          return (
            <div
              key={hotspot.id}
              style={{
                left: `${hotspot.xPercent}%`,
                top: `${hotspot.yPercent}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              {/* Hotspot Target Button */}
              <button
                onClick={() => setActiveHotspotId(isSelected ? null : hotspot.id)}
                onMouseEnter={() => setActiveHotspotId(hotspot.id)}
                aria-label={`Inspect ${hotspot.name}`}
                className={`relative group flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isSelected ? 'scale-125' : 'hover:scale-110 active:scale-95'
                }`}
              >
                {/* Outer Ring Pulse */}
                <span className="absolute w-10 h-10 rounded-full bg-[#8B5A2B]/40 hotspot-pulse-anim pointer-events-none" />

                {/* Inner Core Dot */}
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-white ${
                    isSelected
                      ? 'bg-[#4A2C1A] text-white'
                      : 'bg-white text-[#4A2C1A] group-hover:bg-[#8B5A2B] group-hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                </span>

                {/* Floating Micro Label on Hover */}
                {!isSelected && (
                  <span className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                    {hotspot.name}
                  </span>
                )}
              </button>

              {/* Floating Product Preview Card on Active Hotspot */}
              {isSelected && product && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-soft-xl border border-[#4A2C1A]/15 z-30 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl bg-[#F7F4EF] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B]">
                        {hotspot.type}
                      </span>
                      <h4 className="font-display font-semibold text-sm text-[#211E1B] truncate">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-[#746B61] line-clamp-1 mt-0.5">
                        {hotspot.highlightDescription}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-sm font-bold text-[#4A2C1A]">
                          ₹{(product.salePrice || product.price).toLocaleString('en-IN')}
                        </span>
                        {product.salePrice && (
                          <span className="text-[10px] text-[#9C9287] line-through">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#EEE9E1]">
                    <button
                      onClick={() => addToCart(product)}
                      className="btn-primary-shimmer flex-1 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => navigate(`/products/${product.slug}`)}
                      className="bg-[#F7F4EF] hover:bg-[#EEE9E1] active:scale-95 text-[#4A2C1A] text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom Helper Bar on Desktop */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl p-3 px-4 flex items-center justify-between text-white text-xs z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8B5A2B] animate-ping" />
            <span className="font-medium">
              Click any glowing ring to reveal timber specifications, dimensions, and instant carting.
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[#EADBC8]">
            <span>100% Solid Hardwoods</span>
            <span>•</span>
            <span>Natural Oil Finish</span>
          </div>
        </div>
      </div>

      {/* Room Furniture Carousel / Bottom Staging Rail (Hidden on RoomDetailPage to avoid duplicate cards) */}
      {!hideBottomRail && (
        <div className="p-4 sm:p-6 bg-[#FCFAF7] border-t border-[#EEE9E1]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#746B61]">
              Featured Pieces in this {room.name}
            </span>
            <span className="text-xs text-[#9C9287]">
              Hover or click to cross-reference
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {room.hotspots.map((h) => {
              const product = getProductForHotspot(h.productId);
              if (!product) return null;
              const isSelected = activeHotspotId === h.id;

              return (
                <button
                  key={h.id}
                  onClick={() => {
                    setActiveHotspotId(isSelected ? null : h.id);
                    if (isSelected) {
                      navigate(`/products/${product.slug}`);
                    }
                  }}
                  className={`p-3 rounded-2xl text-left transition-all duration-200 border cursor-pointer interactive-card ${
                    isSelected
                      ? 'bg-white border-[#8B5A2B] shadow-md ring-2 ring-[#8B5A2B]/20'
                      : 'bg-white/80 border-[#EEE9E1] hover:border-[#DED7CD] hover:bg-white'
                  }`}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-[#F7F4EF] p-1 mb-2 flex items-center justify-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-wider">
                    {h.type}
                  </div>
                  <div className="text-xs font-semibold text-[#211E1B] truncate">
                    {product.name}
                  </div>
                  <div className="text-xs font-bold text-[#4A2C1A] mt-1">
                    ₹{(product.salePrice || product.price).toLocaleString('en-IN')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default RoomScene;
