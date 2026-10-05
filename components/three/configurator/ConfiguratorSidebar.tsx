'use client';

import React from 'react';
import {
  ConfigurableFurniturePiece,
  LightingEnvironment,
  MaterialOption,
} from '@/types/configurator';
import { MATERIAL_LIBRARY, calculateConfiguredPrice } from '@/lib/data/configuratorMaterials';
import { useCurrency } from '@/providers/CurrencyProvider';
import {
  Layers,
  Sun,
  Ruler,
  Rotate3d,
  Smartphone,
  Camera,
  ShoppingBag,
  Sparkles,
  Check,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface Props {
  pieces: ConfigurableFurniturePiece[];
  activePiece: ConfigurableFurniturePiece;
  onSelectPiece: (piece: ConfigurableFurniturePiece) => void;
  partMaterials: Record<string, string>;
  onSelectMaterial: (partId: string, materialId: string) => void;
  lighting: LightingEnvironment;
  onChangeLighting: (lighting: LightingEnvironment) => void;
  showCalipers: boolean;
  onToggleCalipers: () => void;
  explodedProgress: number;
  onChangeExploded: (progress: number) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onResetCamera: () => void;
  onOpenARModal: () => void;
  onCaptureSnapshot: () => void;
  onAddToCart: () => void;
}

const LIGHTING_OPTIONS: { id: LightingEnvironment; name: string; icon: string }[] = [
  { id: 'morning-sun', name: 'Morning Sun', icon: '🌅' },
  { id: 'golden-dusk', name: 'Golden Dusk', icon: '🌇' },
  { id: 'gallery-spotlight', name: 'Gallery Spotlight', icon: '🏛️' },
  { id: 'midnight-atelier', name: 'Midnight Atelier', icon: '🌑' },
];

export const ConfiguratorSidebar: React.FC<Props> = ({
  pieces,
  activePiece,
  onSelectPiece,
  partMaterials,
  onSelectMaterial,
  lighting,
  onChangeLighting,
  showCalipers,
  onToggleCalipers,
  explodedProgress,
  onChangeExploded,
  autoRotate,
  onToggleAutoRotate,
  onResetCamera,
  onOpenARModal,
  onCaptureSnapshot,
  onAddToCart,
}) => {
  const { formatPrice } = useCurrency();
  const priceData = calculateConfiguredPrice(activePiece, partMaterials);

  return (
    <aside className="w-full lg:w-[440px] xl:w-[480px] bg-[#14110E] border-t lg:border-t-0 lg:border-l border-[#8B5A2B]/25 flex flex-col h-full overflow-hidden text-[#FAF7F2] shrink-0 min-h-0 shadow-2xl">
      {/* 1. Header & Piece Selector (Sticky Top of Sidebar) */}
      <div className="shrink-0 p-5 border-b border-[#8B5A2B]/20 bg-[#191512]/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D8B486] animate-pulse shadow-[0_0_8px_#D8B486]" />
            <span className="text-[11px] uppercase tracking-widest text-[#D8B486] font-semibold">
              3D Spatial Atelier
            </span>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#8B5A2B]/20 text-[#D8B486] border border-[#8B5A2B]/35 font-medium uppercase tracking-wider">
            {activePiece.collection}
          </span>
        </div>

        {/* Piece Selection Scrollable Strip */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {pieces.map((p) => {
            const isSelected = p.id === activePiece.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPiece(p)}
                className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#8B5A2B] to-[#734A23] text-white border-[#D8B486]/70 shadow-lg ring-1 ring-[#D8B486]/40'
                    : 'bg-[#211B16] text-stone-300 border-white/5 hover:border-[#8B5A2B]/40 hover:text-white'
                }`}
              >
                <div className="truncate max-w-[140px] font-medium">{p.name}</div>
                <div className={`text-[10px] mt-0.5 font-mono ${isSelected ? 'text-amber-100' : 'text-stone-400'}`}>
                  {formatPrice(p.basePriceINR)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Scrollable Customization Content (Independent Scroll) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-[#8B5A2B]/40 hover:scrollbar-thumb-[#8B5A2B]/70 min-h-0">
        {/* Active Piece Description & Specs */}
        <div>
          <h2 className="font-serif text-2xl font-medium tracking-tight text-[#FAF7F2] mb-1">
            {activePiece.name}
          </h2>
          <p className="text-xs text-stone-400 leading-relaxed">{activePiece.tagline}</p>
        </div>

        {/* Customizable Parts Swatches */}
        <div className="space-y-4">
          {activePiece.parts.map((part) => {
            const currentMatId = partMaterials[part.id] || part.defaultMaterialId;
            const currentMat =
              MATERIAL_LIBRARY.find((m) => m.id === currentMatId) || MATERIAL_LIBRARY[0];
            const allowedMaterials = MATERIAL_LIBRARY.filter((m) =>
              part.allowedCategories.includes(m.category)
            );

            return (
              <div
                key={part.id}
                className="p-4 rounded-2xl bg-[#1C1713] border border-white/5 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                      {part.name}
                    </span>
                    <div className="text-sm font-medium text-[#FAF7F2] flex items-center gap-2 mt-0.5">
                      {currentMat.name}
                      {currentMat.upchargeINR > 0 && (
                        <span className="text-[10px] text-[#D8B486] font-normal font-mono">
                          (+{formatPrice(currentMat.upchargeINR)})
                        </span>
                      )}
                    </div>
                  </div>
                  {currentMat.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5A2B]/20 text-[#D8B486] border border-[#8B5A2B]/30 font-medium">
                      {currentMat.badge}
                    </span>
                  )}
                </div>

                {/* Swatch Options Grid */}
                <div className="grid grid-cols-4 gap-2.5 pt-1">
                  {allowedMaterials.map((mat) => {
                    const isSelected = mat.id === currentMatId;
                    return (
                      <button
                        key={mat.id}
                        onClick={() => onSelectMaterial(part.id, mat.id)}
                        className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#8B5A2B]/25 border-[#D8B486] shadow-md ring-1 ring-[#D8B486]'
                            : 'bg-[#241E19] border-white/5 hover:border-[#8B5A2B]/50'
                        }`}
                        title={`${mat.name} (${mat.origin})`}
                      >
                        {/* Swatch Color / Texture Circle */}
                        <div
                          className="w-8 h-8 rounded-full shadow-inner border border-white/20 relative flex items-center justify-center overflow-hidden"
                          style={{
                            backgroundColor: mat.colorHex,
                            backgroundImage: mat.textureUrl ? `url(${mat.textureUrl})` : undefined,
                            backgroundSize: 'cover',
                          }}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <span className="text-[10px] text-stone-300 font-medium text-center truncate w-full mt-1.5 leading-tight">
                          {mat.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Studio Lighting Presets */}
        <div className="p-4 rounded-2xl bg-[#1C1713] border border-white/5 space-y-3 shadow-md">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#D8B486]" />
            <span className="text-xs uppercase tracking-wider text-stone-300 font-medium">
              Studio Lighting Environment
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {LIGHTING_OPTIONS.map((opt) => {
              const isSelected = opt.id === lighting;
              return (
                <button
                  key={opt.id}
                  onClick={() => onChangeLighting(opt.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-[#8B5A2B] text-white border-[#D8B486]/60 shadow-md'
                      : 'bg-[#241E19] text-stone-300 border-white/5 hover:border-white/20'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="truncate">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Tools (Exploded View & Calipers) */}
        <div className="p-4 rounded-2xl bg-[#1C1713] border border-white/5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D8B486]" />
              <span className="text-xs uppercase tracking-wider text-stone-300 font-medium">
                Exploded Joinery View
              </span>
            </div>
            <span className="text-xs text-[#D8B486] font-mono font-semibold">
              {Math.round(explodedProgress * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodedProgress}
            onChange={(e) => onChangeExploded(parseFloat(e.target.value))}
            className="w-full accent-[#8B5A2B] bg-[#2A1A12] h-1.5 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <button
              onClick={onToggleCalipers}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showCalipers
                  ? 'bg-[#8B5A2B]/30 border-[#D8B486] text-[#FAF7F2]'
                  : 'bg-[#241E19] border-white/5 text-stone-400 hover:text-white'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              Dimensions
            </button>

            <button
              onClick={onToggleAutoRotate}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                autoRotate
                  ? 'bg-[#8B5A2B]/30 border-[#D8B486] text-[#FAF7F2]'
                  : 'bg-[#241E19] border-white/5 text-stone-400 hover:text-white'
              }`}
            >
              <Rotate3d className="w-3.5 h-3.5" />
              Auto-Rotate
            </button>

            <button
              onClick={onResetCamera}
              className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-white transition-colors"
            >
              Reset View
            </button>
          </div>
        </div>
      </div>

      {/* 3. Footer Actions & Price Drawer (Sticky Bottom of Sidebar) */}
      <div className="shrink-0 p-5 border-t border-[#8B5A2B]/20 bg-[#191512]/95 backdrop-blur-xl space-y-4">
        {/* Price Breakdown */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block">
              Configured Valuation
            </span>
            <div className="text-2xl font-serif font-medium text-[#FAF7F2]">
              {formatPrice(priceData.finalPriceINR)}
            </div>
          </div>
          {priceData.totalUpchargeINR > 0 && (
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block">Upgrades Included</span>
              <span className="text-xs text-[#D8B486] font-medium font-mono">
                +{formatPrice(priceData.totalUpchargeINR)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons: View in AR Room (with continuous luxury gold shimmer) + HD Snapshot */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Warm Brownish Shimmer AR Button */}
          <button
            onClick={onOpenARModal}
            className="btn-brownish-shimmer group flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl text-xs font-medium cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-[#D8B486] group-hover:scale-110 transition-transform" />
              <Sparkles className="w-2.5 h-2.5 text-[#FAF7F2] absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="font-medium tracking-wide">View in AR Room</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D8B486]/20 text-[#D8B486] font-bold uppercase tracking-wider border border-[#D8B486]/40">
              3D
            </span>
          </button>

          <button
            onClick={onCaptureSnapshot}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-[#241E19] border border-white/10 hover:border-[#8B5A2B]/50 hover:bg-[#2C241E] text-xs font-medium text-stone-300 hover:text-white transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#D8B486]" />
            <span>HD Snapshot</span>
          </button>
        </div>

        <button
          onClick={onAddToCart}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#8B5A2B] to-[#765236] hover:from-[#A9794F] hover:to-[#8B5A2B] text-white text-sm font-medium shadow-xl hover:shadow-[#8B5A2B]/25 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          Add Custom Build to Cart
          <ChevronRight className="w-4 h-4 ml-auto" />
        </button>
      </div>
    </aside>
  );
};
