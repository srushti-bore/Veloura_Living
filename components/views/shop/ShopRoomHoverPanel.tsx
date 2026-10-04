'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShopRoomPanelData, ShopRoomSubcategory, ShopRoomFeaturedHero } from '@/types/shopHover';
import {
  Armchair,
  Layers,
  Bed,
  Lamp,
  Briefcase,
  BookOpen,
  FolderKanban,
  Sparkles,
  ArrowRight,
  ChevronRight,
  X,
  Compass,
  Building,
  CheckCircle2
} from 'lucide-react';

interface Props {
  roomData: ShopRoomPanelData;
  isOpen: boolean;
  onClose: () => void;
  onSelectSubcategory: (item: ShopRoomSubcategory) => void;
  onSelectHero: (hero: ShopRoomFeaturedHero) => void;
  onPrimaryCta: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ShopRoomHoverPanel: React.FC<Props> = ({
  roomData,
  isOpen,
  onClose,
  onSelectSubcategory,
  onSelectHero,
  onPrimaryCta,
  onMouseEnter,
  onMouseLeave
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sofa':
      case 'armchair':
      case 'chair':
        return <Armchair className="w-4 h-4" />;
      case 'bed':
        return <Bed className="w-4 h-4" />;
      case 'table':
        return <Layers className="w-4 h-4" />;
      case 'storage':
      case 'wardrobe':
        return <FolderKanban className="w-4 h-4" />;
      case 'lighting':
      case 'pendant':
        return <Lamp className="w-4 h-4" />;
      case 'desk':
      case 'briefcase':
        return <Briefcase className="w-4 h-4" />;
      case 'book':
        return <BookOpen className="w-4 h-4" />;
      case 'mirror':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={panelRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-3xl p-6 lg:p-7 shadow-2xl border border-[#D8C4AD]/60 animate-fadeIn"
      role="region"
      aria-label={`${roomData.label} navigation menu`}
    >
      {/* 3-Column Layout Matching Reference Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Section 1: Left Highlight Overview Card */}
        <div className="lg:col-span-4 bg-[#F7F0E7]/80 rounded-2xl p-6 flex flex-col justify-between border border-[#D8C4AD]/40">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B5A2B] block">
              {roomData.eyebrow}
            </span>
            <h3 className="font-display text-2xl lg:text-3xl font-bold text-[#211E1B] leading-tight">
              {roomData.headline}
            </h3>
            <p className="text-xs text-[#735E4E] leading-relaxed">
              {roomData.description}
            </p>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={onPrimaryCta}
              className="w-full bg-[#4A2C1A] hover:bg-[#8B5A2B] text-white py-3 px-5 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>{roomData.primaryCtaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Section 2: Middle Categorized Disciplines List */}
        <div className="lg:col-span-4 flex flex-col justify-center space-y-1.5 py-1">
          {roomData.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSubcategory(item)}
              className="w-full text-left p-2.5 rounded-xl hover:bg-[#F7F0E7]/60 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-9 h-9 rounded-xl bg-[#F5E6D3]/60 text-[#8B5A2B] flex items-center justify-center flex-shrink-0 group-hover:bg-[#8B5A2B] group-hover:text-white transition-all shadow-xs">
                  {renderIcon(item.iconName)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#211E1B] group-hover:text-[#8B5A2B] transition-colors truncate">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#8B5A2B]/10 text-[#8B5A2B] text-[8px] font-bold uppercase tracking-wider flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-[10px] text-[#735E4E] truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-[#9C9287] group-hover:text-[#8B5A2B] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Section 3: Right Featured Hero Lifestyle Photography */}
        <div className="lg:col-span-4 flex">
          <div
            onClick={() => onSelectHero(roomData.featuredHero)}
            className="group relative w-full rounded-2xl overflow-hidden shadow-sm border border-[#D8C4AD]/50 bg-[#F5EFE6] cursor-pointer flex flex-col justify-end min-h-[260px]"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectHero(roomData.featuredHero);
              }
            }}
          >
            {!heroLoaded && (
              <div className="absolute inset-0 bg-[#EFE8DC] animate-pulse flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#8B5A2B]/30 animate-spin" />
              </div>
            )}

            <img
              src={roomData.featuredHero.image}
              alt={roomData.featuredHero.title}
              loading="lazy"
              onLoad={() => setHeroLoaded(true)}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
            />

            {/* Gradient Overlay & Editorial Caption */}
            <div className="relative z-10 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white space-y-1">
              {roomData.featuredHero.tag && (
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[9px] font-bold uppercase tracking-wider text-white inline-block mb-1">
                  {roomData.featuredHero.tag}
                </span>
              )}
              <h4 className="font-display font-bold text-lg text-white leading-tight group-hover:text-[#F5E6D3] transition-colors">
                {roomData.featuredHero.title}
              </h4>
              {roomData.featuredHero.subtitle && (
                <p className="text-[11px] text-white/80 line-clamp-1">
                  {roomData.featuredHero.subtitle}
                </p>
              )}
              <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-[#F5E6D3] group-hover:underline">
                <span>Explore Featured Piece</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
