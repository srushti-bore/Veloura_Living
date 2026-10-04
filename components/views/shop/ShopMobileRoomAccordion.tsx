'use client';

import React, { useState } from 'react';
import { SHOP_ROOM_HOVER_DATA } from '@/lib/data/shopRoomHoverData';
import { ShopRoomSubcategory, ShopRoomFeaturedHero } from '@/types/shopHover';
import { ChevronDown, Sparkles, Filter, ArrowRight } from 'lucide-react';

interface Props {
  activeRoom: string;
  onApplyRoomFilter: (roomType: string) => void;
  onSelectSubcategory: (item: ShopRoomSubcategory) => void;
  onSelectHero: (hero: ShopRoomFeaturedHero) => void;
}

export const ShopMobileRoomAccordion: React.FC<Props> = ({
  activeRoom,
  onApplyRoomFilter,
  onSelectSubcategory,
  onSelectHero
}) => {
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  const roomKeys = ['all', 'living-room', 'bedroom', 'dining', 'office'];

  const toggleRoom = (key: string) => {
    setExpandedRoom((prev) => (prev === key ? null : key));
  };

  return (
    <div className="lg:hidden bg-[#FBF8F3] border border-[#D8C4AD] rounded-2xl p-4 shadow-soft-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#D8C4AD]/40">
        <span className="text-xs font-bold uppercase tracking-wider text-[#4A2C1A] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
          <span>Explore Room Disciplines</span>
        </span>
        <span className="text-[10px] text-[#735E4E]">Tap to expand</span>
      </div>

      <div className="space-y-2">
        {roomKeys.map((key) => {
          const room = SHOP_ROOM_HOVER_DATA[key];
          if (!room) return null;
          const isExpanded = expandedRoom === key;

          return (
            <div
              key={key}
              className="border border-[#D8C4AD]/60 rounded-xl overflow-hidden bg-white transition-all"
            >
              {/* Accordion Trigger Header */}
              <button
                type="button"
                onClick={() => toggleRoom(key)}
                className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors ${
                  isExpanded ? 'bg-[#F7F0E7] text-[#4A2C1A]' : 'hover:bg-[#FCFAF7] text-[#211E1B]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${activeRoom === room.roomType ? 'bg-[#8B5A2B]' : 'bg-[#D8C4AD]'}`} />
                  <span className="font-semibold text-xs">{room.label}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#735E4E] transition-transform duration-200 ${
                    isExpanded ? 'rotate-180 text-[#8B5A2B]' : ''
                  }`}
                />
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-3.5 pt-2 bg-[#FCFAF7] border-t border-[#D8C4AD]/40 space-y-4 animate-fadeIn">
                  <p className="text-[11px] text-[#735E4E] leading-relaxed">
                    {room.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => onApplyRoomFilter(room.roomType)}
                    className="w-full py-2 rounded-lg bg-[#4A2C1A] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Filter className="w-3 h-3" />
                    <span>{room.primaryCtaText}</span>
                  </button>

                  {/* Items List */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B] block">
                      Disciplines & Pieces
                    </span>
                    <div className="space-y-1 pl-1">
                      {room.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelectSubcategory(item)}
                          className="w-full text-left py-1 text-xs text-[#514A43] hover:text-[#8B5A2B] flex items-center justify-between"
                        >
                          <span>{item.name}</span>
                          {typeof item.count === 'number' && (
                            <span className="text-[10px] text-[#9C9287]">{item.count}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Featured Hero Photo */}
                  {room.featuredHero && (
                    <div className="pt-2 border-t border-[#D8C4AD]/40 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#735E4E] block">
                        Featured Lifestyle
                      </span>
                      <div
                        onClick={() => onSelectHero(room.featuredHero)}
                        className="bg-white rounded-xl p-2 border border-[#D8C4AD]/50 flex items-center gap-3 cursor-pointer"
                      >
                        <img
                          src={room.featuredHero.image}
                          alt={room.featuredHero.title}
                          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          {room.featuredHero.tag && (
                            <span className="text-[8px] font-bold tracking-wider uppercase text-[#8B5A2B] block">
                              {room.featuredHero.tag}
                            </span>
                          )}
                          <h5 className="font-display font-bold text-xs text-[#211E1B] truncate">
                            {room.featuredHero.title}
                          </h5>
                          <span className="text-[10px] font-semibold text-[#8B5A2B] flex items-center gap-1 mt-0.5">
                            <span>View Piece</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
