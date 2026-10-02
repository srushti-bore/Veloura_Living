'use client';

import React, { useState, useEffect } from 'react';
import { SpatialRoomStudio } from '@/components/studio/SpatialRoomStudio';
import { MaterialTextureStudio } from '@/components/studio/MaterialTextureStudio';
import { Sparkles, Compass, Layers, SunMedium, ShieldCheck, ArrowRight } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

export const StudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'spatial' | 'materials'>('spatial');
  const { navigate } = useStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#211E1B] pb-24">
      {/* Studio Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#211E1B] to-[#342418] text-[#F5E6D3] py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C49A6C_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B5A2B]/30 border border-[#8B5A2B]/40 text-[#EADBC8] text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#C49A6C]" />
            Veloura Intelligence & Spatial Studio
          </div>
          
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Design Your Space With <span className="italic font-light text-[#C49A6C]">Architectural Precision</span>
          </h1>

          <p className="text-sm sm:text-base text-[#DED7CD] max-w-2xl mx-auto font-light leading-relaxed">
            Experience real-time circulation clearance, diurnal lighting simulation across 4 time-zones, and tactile material grain analysis before making a generational heirloom investment.
          </p>

          {/* Studio Tab Switcher */}
          <div className="pt-6 flex justify-center">
            <div className="inline-flex p-1.5 bg-[#171412] rounded-2xl border border-white/10 shadow-2xl">
              <button
                onClick={() => setActiveTab('spatial')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 interactive-pill cursor-pointer ${
                  activeTab === 'spatial'
                    ? 'bg-[#8B5A2B] text-white shadow-lg font-semibold'
                    : 'text-[#DED7CD]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4" />
                2D Spatial Floorplan Planner
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 interactive-pill cursor-pointer ${
                  activeTab === 'materials'
                    ? 'bg-[#8B5A2B] text-white shadow-lg font-semibold'
                    : 'text-[#DED7CD]/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-4 h-4" />
                Tactile Material Laboratory
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Studio Viewport */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {activeTab === 'spatial' ? (
          <div className="space-y-16 animate-fadeIn">
            <SpatialRoomStudio />
            
            {/* Callout to Material Lab */}
            <div className="bg-[#F7F4EF] rounded-3xl p-8 border border-[#4A2C1A]/10 flex flex-col md:flex-row items-center justify-between gap-6 interactive-card hover:border-[#8B5A2B]/30">
              <div className="space-y-2 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B5A2B]">Next-Level Tactility</span>
                <h3 className="font-display text-2xl font-semibold text-[#4A2C1A]">Curious about hardwood grain & Martindale ratings?</h3>
                <p className="text-sm text-[#7D7368] max-w-xl">
                  Inspect the physical micro-structures of our Belgian bouclé, Appalachian black walnut, and vegetable-tanned Tuscan saddle leather.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('materials')}
                className="btn-primary-shimmer active:scale-[0.98] px-6 py-3 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-2 shadow-md cursor-pointer group"
              >
                <span>Open Material Swatch Lab</span>
                <ArrowRight className="w-4 h-4 interactive-arrow" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-16 animate-fadeIn">
            <MaterialTextureStudio />
            
            {/* Callout to Spatial Planner */}
            <div className="bg-[#F7F4EF] rounded-3xl p-8 border border-[#4A2C1A]/10 flex flex-col md:flex-row items-center justify-between gap-6 interactive-card hover:border-[#8B5A2B]/30">
              <div className="space-y-2 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B5A2B]">Spatial Arrangement</span>
                <h3 className="font-display text-2xl font-semibold text-[#4A2C1A]">Ready to map these materials into your floorplan?</h3>
                <p className="text-sm text-[#7D7368] max-w-xl">
                  Simulate your custom suite in 2D with real-time clearance calculation and day-to-night ambient lighting.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('spatial')}
                className="btn-primary-shimmer active:scale-[0.98] px-6 py-3 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-2 shadow-md cursor-pointer group"
              >
                <span>Launch Spatial Floorplan</span>
                <ArrowRight className="w-4 h-4 interactive-arrow" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
