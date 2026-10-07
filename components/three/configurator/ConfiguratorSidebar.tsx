import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Eye,
  Sliders,
  Compass,
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
  onSectionFocusChange?: (section: 'overview' | 'materials' | 'lighting' | 'joinery') => void;
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
  onSectionFocusChange,
}) => {
  const { formatPrice } = useCurrency();
  const priceData = calculateConfiguredPrice(activePiece, partMaterials);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const materialsRef = useRef<HTMLDivElement>(null);
  const lightingRef = useRef<HTMLDivElement>(null);
  const joineryRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<'overview' | 'materials' | 'lighting' | 'joinery'>('overview');
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);

  // Handle independent scroll progress and active section detection
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    setScrollProgress(Math.min(100, Math.max(0, progress)));

    if (scrollTop > 20) {
      setHasScrolled(true);
    }

    // Determine current section in view
    const lightingOffset = lightingRef.current?.offsetTop || 600;
    const joineryOffset = joineryRef.current?.offsetTop || 900;
    const materialsOffset = materialsRef.current?.offsetTop || 120;

    let current: 'overview' | 'materials' | 'lighting' | 'joinery' = 'overview';
    if (scrollTop >= joineryOffset - 180) {
      current = 'joinery';
    } else if (scrollTop >= lightingOffset - 180) {
      current = 'lighting';
    } else if (scrollTop >= materialsOffset - 140) {
      current = 'materials';
    }

    if (current !== activeSection) {
      setActiveSection(current);
      onSectionFocusChange?.(current);
    }
  };

  const scrollToSection = (section: 'overview' | 'materials' | 'lighting' | 'joinery') => {
    setActiveSection(section);
    onSectionFocusChange?.(section);

    let targetEl: HTMLElement | null = null;
    if (section === 'overview') targetEl = overviewRef.current;
    if (section === 'materials') targetEl = materialsRef.current;
    if (section === 'lighting') targetEl = lightingRef.current;
    if (section === 'joinery') targetEl = joineryRef.current;

    if (targetEl && scrollContainerRef.current) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside
      data-lenis-prevent="true"
      data-lenis-prevent-wheel="true"
      data-lenis-prevent-touch="true"
      className="w-full lg:w-[440px] xl:w-[480px] bg-[#14110E] border-t lg:border-t-0 lg:border-l border-[#8B5A2B]/25 flex flex-col h-auto lg:h-full lg:max-h-full overflow-hidden text-[#FAF7F2] shrink-0 min-h-0 shadow-2xl z-20 relative"
    >
      {/* 1. Header & Piece Selector (Sticky Top of Sidebar) */}
      <div className="shrink-0 p-4 sm:p-5 border-b border-[#8B5A2B]/20 bg-[#191512]/95 backdrop-blur-md z-20">
        <div className="flex items-center justify-between mb-3">
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
        <div
          data-lenis-prevent="true"
          className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none overscroll-contain"
        >
          {pieces.map((p) => {
            const isSelected = p.id === activePiece.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPiece(p)}
                className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left border cursor-pointer ${
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

      {/* 2. Interactive Section Jump Navigation & Golden Scroll Progress Meter */}
      <div className="shrink-0 bg-[#16120E] border-b border-[#8B5A2B]/15 z-20">
        {/* Golden Scroll Progress Bar */}
        <div className="w-full h-[2.5px] bg-[#241A13] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#8B5A2B] via-[#D8B486] to-[#FAF7F2] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(216,180,134,0.8)]"
            style={{ width: `${Math.max(12, scrollProgress)}%` }}
          />
        </div>

        {/* Quick Jump Section Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none overscroll-contain">
          {[
            { id: 'materials', label: 'Materials', icon: Sparkles },
            { id: 'lighting', label: 'Studio Light', icon: Sun },
            { id: 'joinery', label: '3D Tools', icon: Layers },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeSection === sec.id
                  ? 'bg-[#8B5A2B] text-white shadow-md border border-[#D8B486]/60 ring-1 ring-[#D8B486]/30'
                  : 'bg-[#221B16] text-stone-300 hover:text-white hover:bg-[#2C221C] border border-white/5'
              }`}
            >
              <sec.icon className="w-3 h-3 text-[#D8B486]" />
              <span>{sec.label}</span>
            </button>
          ))}
          <span className="text-[10px] text-stone-400 ml-auto font-mono shrink-0 pl-2">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>

      {/* 3. Scrollable Customization Content with Ambient Fade Masks */}
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top Ambient Glow Mask */}
        <div
          className={`absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-[#14110E] via-[#14110E]/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            scrollProgress > 4 ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Main Isolated Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scrollbar-thin scrollbar-thumb-[#8B5A2B]/60 hover:scrollbar-thumb-[#D8B486] min-h-0 overscroll-contain touch-pan-y scroll-smooth"
        >
          {/* Active Piece Description & Specs */}
          <div ref={overviewRef} className="scroll-mt-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#FAF7F2] mb-1">
              {activePiece.name}
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed">{activePiece.tagline}</p>
          </div>

          {/* Customizable Parts Swatches */}
          <div ref={materialsRef} className="space-y-4 scroll-mt-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs uppercase tracking-wider text-[#D8B486] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D8B486]" />
                Architectural Finishes ({activePiece.parts.length} Components)
              </span>
              <span className="text-[10px] text-stone-400 font-mono">8K PBR Textures</span>
            </div>

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
                  className="p-4 rounded-2xl bg-[#1C1713] hover:bg-[#201A16] border border-white/5 hover:border-[#8B5A2B]/40 transition-all duration-300 space-y-3 shadow-md group"
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
                          className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-[#8B5A2B]/30 border-[#D8B486] shadow-md ring-1 ring-[#D8B486]'
                              : 'bg-[#241E19] border-white/5 hover:border-[#8B5A2B]/50 hover:bg-[#2A221C]'
                          }`}
                          title={`${mat.name} (${mat.origin})`}
                        >
                          {/* Swatch Color / Texture Circle */}
                          <div
                            className="w-8 h-8 rounded-full shadow-inner border border-white/20 relative flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105"
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
          <div ref={lightingRef} className="p-4 rounded-2xl bg-[#1C1713] hover:bg-[#201A16] border border-white/5 hover:border-[#8B5A2B]/40 transition-all duration-300 space-y-3 shadow-md scroll-mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#D8B486]" />
                <span className="text-xs uppercase tracking-wider text-stone-300 font-semibold">
                  Studio Lighting Environment
                </span>
              </div>
              <span className="text-[10px] text-[#D8B486] font-mono">Diurnal Shadows</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {LIGHTING_OPTIONS.map((opt) => {
                const isSelected = opt.id === lighting;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onChangeLighting(opt.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#8B5A2B] text-white border-[#D8B486]/60 shadow-md ring-1 ring-[#D8B486]/30'
                        : 'bg-[#241E19] text-stone-300 border-white/5 hover:border-white/20 hover:bg-[#2A221C]'
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
          <div ref={joineryRef} className="p-4 rounded-2xl bg-[#1C1713] hover:bg-[#201A16] border border-white/5 hover:border-[#8B5A2B]/40 transition-all duration-300 space-y-4 shadow-md scroll-mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D8B486]" />
                <span className="text-xs uppercase tracking-wider text-stone-300 font-semibold">
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
              className="w-full accent-[#8B5A2B] bg-[#2A1A12] h-2 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <button
                onClick={onToggleCalipers}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer active:scale-95 ${
                  showCalipers
                    ? 'bg-[#8B5A2B]/40 border-[#D8B486] text-[#FAF7F2]'
                    : 'bg-[#241E19] border-white/5 text-stone-400 hover:text-white'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                Dimensions
              </button>

              <button
                onClick={onToggleAutoRotate}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer active:scale-95 ${
                  autoRotate
                    ? 'bg-[#8B5A2B]/40 border-[#D8B486] text-[#FAF7F2]'
                    : 'bg-[#241E19] border-white/5 text-stone-400 hover:text-white'
                }`}
              >
                <Rotate3d className="w-3.5 h-3.5" />
                Auto-Rotate
              </button>

              <button
                onClick={onResetCamera}
                className="px-3 py-1.5 rounded-lg text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                Reset View
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Ambient Glow Mask */}
        <div
          className={`absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#14110E] via-[#14110E]/80 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            scrollProgress < 92 ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Floating Scroll Cue Pill (Fades out once user scrolls) */}
        {!hasScrolled && (
          <div className="absolute bottom-4 right-6 z-20 pointer-events-none animate-bounce">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5A2B]/90 backdrop-blur-md text-white text-[10px] font-semibold border border-[#D8B486]/40 shadow-xl">
              <span>Scroll for Lighting & 3D Tools</span>
              <ChevronDown className="w-3 h-3 text-[#D8B486]" />
            </span>
          </div>
        )}
      </div>

      {/* 4. Footer Actions & Price Drawer (Sticky Bottom of Sidebar) */}
      <div className="shrink-0 p-4 sm:p-5 border-t border-[#8B5A2B]/20 bg-[#191512]/95 backdrop-blur-xl space-y-3.5 z-20">
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
            className="btn-brownish-shimmer group flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl text-xs font-medium cursor-pointer active:scale-95"
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
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-[#241E19] border border-white/10 hover:border-[#8B5A2B]/50 hover:bg-[#2C241E] text-xs font-medium text-stone-300 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4 text-[#D8B486]" />
            <span>HD Snapshot</span>
          </button>
        </div>

        <button
          onClick={onAddToCart}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#8B5A2B] to-[#765236] hover:from-[#A9794F] hover:to-[#8B5A2B] text-white text-sm font-medium shadow-xl hover:shadow-[#8B5A2B]/25 transition-all cursor-pointer active:scale-[0.98]"
        >
          <ShoppingBag className="w-4 h-4" />
          Add Custom Build to Cart
          <ChevronRight className="w-4 h-4 ml-auto" />
        </button>
      </div>
    </aside>
  );
};

