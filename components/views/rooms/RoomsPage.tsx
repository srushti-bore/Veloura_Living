'use client';

import React from 'react';
import { useStore } from '@/hooks/useStore';
import { ArrowRight, Sparkles, Layers, Compass } from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const { rooms, navigate } = useStore();

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#F5E6D3] text-[#4A2C1A] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5 text-[#8B5A2B]" />
            <span>Spatial Architecture Discovery</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#211E1B]">
            Four Living Spaces
          </h1>
          <p className="text-sm sm:text-base text-[#746B61] leading-relaxed">
            In Veloura Living, rooms are complete discovery environments. Explore each room’s interactive staging, material harmonies, and individual handcrafted furniture catalog.
          </p>
        </div>

        {/* 4 Room Large Showcase Cards */}
        <div className="space-y-16">
          {rooms.map((room, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={room.id}
                className={`bg-white rounded-3xl overflow-hidden border border-[#4A2C1A]/10 shadow-soft-lg grid grid-cols-1 lg:grid-cols-12 items-center`}
              >
                {/* Visual */}
                <div
                  className={`lg:col-span-7 aspect-[16/10] bg-[#F7F4EF] relative overflow-hidden group cursor-pointer ${
                    !isEven ? 'lg:order-2' : ''
                  }`}
                  onClick={() => navigate(`/rooms/${room.slug}`)}
                >
                  <img
                    src={room.heroImage || room.categoryImage}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#4A2C1A] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {room.hotspots.length} Staged Hotspots
                  </div>
                </div>

                {/* Content Details */}
                <div className={`lg:col-span-5 p-8 sm:p-12 space-y-6 ${!isEven ? 'lg:order-1' : ''}`}>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B] block mb-1">
                      Living Space 0{index + 1}
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#211E1B]">
                      {room.name}
                    </h2>
                    <p className="text-sm font-medium text-[#4A2C1A] mt-1 italic">
                      "{room.headline}"
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#746B61] leading-relaxed">
                    {room.description}
                  </p>

                  {/* Palette Chips */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C9287] block mb-2">
                      Material & Tonal Palette
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {room.recommendedPalette.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-[#FCFAF7] border border-[#EEE9E1] px-2.5 py-1 rounded-full">
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: item.hex }} />
                          <span className="text-[11px] text-[#514A43] font-medium">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => navigate(`/rooms/${room.slug}`)}
                      className="btn-primary-shimmer px-7 py-4 rounded-full font-semibold text-xs sm:text-sm shadow-soft-md flex items-center gap-2 cursor-pointer group"
                    >
                      <span>Explore Interactive {room.name}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
