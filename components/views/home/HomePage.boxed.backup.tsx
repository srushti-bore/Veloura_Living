'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { FloatingFurnitureCanvas } from '../../three/FloatingFurnitureCanvas';
import { RoomScene } from '../../rooms/RoomScene';
import { ProductCard } from '../../products/ProductCard';
import { HeroComparisonSlider } from '../../hero/HeroComparisonSlider';
import { Interactive360Viewer } from '../../products/Interactive360Viewer';
import { AIInteriorQuizModal } from '../../quiz/AIInteriorQuizModal';
import { animationPresets } from '../../../lib/animations/gsap';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Play,
  Layers,
  Heart,
  RotateCw
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { rooms, allProducts, navigate, setIsAIOpen, addToCart } = useStore();
  const [selectedRoomTab, setSelectedRoomTab] = useState<string>('living-room');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<string>('all');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    // 1. GSAP 7-step editorial reveal for hero
    animationPresets.heroReveal();
    // 2. Initialize scroll triggered section reveals
    animationPresets.initScrollSections();
    // 3. Stagger cards in bestsellers
    animationPresets.staggerCards('.bestsellers-grid', '.product-card-item');
  }, []);

  const currentRoom = rooms.find((r) => r.id === selectedRoomTab) || rooms[0];

  // Signature Bestsellers
  const bestsellers = allProducts.filter((p) => p.bestseller || p.featured).slice(0, 6);

  // Bundle Items for "Complete the Room"
  const bundleProducts = allProducts.filter((p) => p.room === 'living-room').slice(0, 3);
  const bundleOriginalPrice = bundleProducts.reduce((sum, p) => sum + p.price, 0);
  const bundleDiscountedPrice = Math.round(bundleOriginalPrice * 0.85); // 15% bundle savings

  const handleAddBundleToCart = () => {
    bundleProducts.forEach((p) => addToCart(p));
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      {/* 1. HERO SECTION (Clean 2D Editorial Presentation) */}
      <section className="relative min-h-[85vh] lg:min-h-[92vh] flex items-center pt-8 pb-16 overflow-hidden border-b border-[#4A2C1A]/10">
        {/* Subtle Warm Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-[#F5E6D3]/40 via-[#EADBC8]/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Hero Narrative (6 Columns) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Eyebrow */}
              <div className="hero-eyebrow inline-flex items-center gap-2 bg-[#F5E6D3] text-[#4A2C1A] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-[0.15em] uppercase border border-[#8B5A2B]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>Furniture Intelligence Platform</span>
              </div>

              {/* Display Headline */}
              <h1 className="hero-headline font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-[#211E1B] tracking-tight leading-[1.05]">
                Timeless Furniture <br />
                <span className="italic font-normal text-[#8B5A2B]">for Living.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="hero-subtext text-base sm:text-lg text-[#746B61] leading-relaxed max-w-xl">
                Thoughtfully designed furniture for modern homes. Explore, experience and bring your ideal space to life — guided by architectural proportions and the power of AI.
              </p>

              {/* CTAs */}
              <div className="hero-ctas flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => navigate('/shop')}
                  className="hero-cta-primary btn-primary-shimmer px-8 py-4 rounded-full text-sm font-semibold tracking-wide shadow-soft-md hover:shadow-soft-xl flex items-center gap-2.5 group cursor-pointer"
                >
                  <span>Explore Collections</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="hero-cta-secondary btn-secondary-refined px-5 py-4 rounded-full text-sm font-semibold flex items-center gap-2 cursor-pointer group"
                >
                  <Play className="w-4 h-4 fill-current text-[#8B5A2B] group-hover:scale-110 transition-transform" />
                  <span>Room Cinema</span>
                </button>

                <button
                  onClick={() => setIsQuizOpen(true)}
                  className="px-5 py-4 rounded-full text-sm font-semibold bg-[#F5E6D3] text-[#4A2C1A] hover:bg-[#EADBC8] border border-[#8B5A2B]/20 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-[#8B5A2B]" />
                  <span>30-Sec Space Quiz</span>
                </button>
              </div>

              {/* Core Reassurance Metrics */}
              <div className="hero-metrics pt-8 border-t border-[#EEE9E1] grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="font-display font-bold text-xl sm:text-2xl text-[#4A2C1A]">4</div>
                  <div className="text-xs text-[#9C9287] uppercase tracking-wider font-medium mt-0.5">Living Spaces</div>
                </div>
                <div>
                  <div className="font-display font-bold text-xl sm:text-2xl text-[#4A2C1A]">100%</div>
                  <div className="text-xs text-[#9C9287] uppercase tracking-wider font-medium mt-0.5">Solid Hardwood</div>
                </div>
                <div>
                  <div className="font-display font-bold text-xl sm:text-2xl text-[#4A2C1A]">100 Yr</div>
                  <div className="text-xs text-[#9C9287] uppercase tracking-wider font-medium mt-0.5">Craft Warranty</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual & Interactive Comparison Engine */}
            <div className="hero-visual-card lg:col-span-6 relative space-y-3">
              {/* Ambient Warm Backlight */}
              <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-tr from-[#8B5A2B]/25 via-[#F5E6D3]/35 to-[#4A2C1A]/10 rounded-[36px] blur-2xl -z-10 opacity-80" />

              {/* Room Tab Selector Bar */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-1 p-1 bg-white/90 backdrop-blur-md rounded-full border border-[#4A2C1A]/15 shadow-sm">
                  {rooms.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoomTab(r.slug)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                        selectedRoomTab === r.slug
                          ? 'bg-[#4A2C1A] text-white shadow-sm'
                          : 'text-[#514A43] hover:text-[#211E1B]'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B5A2B]">
                  <SlidersHorizontal className="w-3 h-3" />
                  Drag Slider to Reveal
                </span>
              </div>

              {/* Interactive Before/After Split Comparison Slider */}
              <HeroComparisonSlider selectedRoomSlug={selectedRoomTab} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FURNITURE INTELLIGENCE VIBE MATCHER BAR */}
      <section className="bg-white border-y border-[#EEE9E1] py-8 shadow-soft-sm scroll-reveal-text">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FCFAF7] rounded-2xl p-4 sm:p-6 border border-[#DED7CD] flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[#4A2C1A] text-[#F5E6D3] shadow-md flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#211E1B]">
                  What furniture belongs in your space?
                </h3>
                <p className="text-xs text-[#746B61] mt-0.5">
                  Select your room aesthetic to receive instant proportion and wood finish matching.
                </p>
              </div>
            </div>

            {/* Quick Aesthetic Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { name: 'Warm Minimal', tag: 'warm-minimal' },
                { name: 'Organic Walnut', tag: 'organic-walnut' },
                { name: 'Tactile Bouclé', tag: 'tactile-boucle' },
                { name: 'Japandi Rest', tag: 'japandi' }
              ].map((chip) => (
                <button
                  key={chip.tag}
                  onClick={() => {
                    setSelectedStyleFilter(chip.tag);
                    navigate('/shop');
                  }}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-[#F5E6D3] text-[#514A43] hover:text-[#4A2C1A] border border-[#DED7CD] transition-colors shadow-sm cursor-pointer active:scale-95"
                >
                  {chip.name}
                </button>
              ))}
              <button
                onClick={() => setIsQuizOpen(true)}
                className="btn-primary-shimmer px-4 py-2 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Take 30-Sec Space Quiz
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY — FOUR LIVING SPACES */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 scroll-reveal-text">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B] mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Four Living Spaces</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#211E1B]">
              Discover by Room Architecture
            </h2>
            <p className="text-sm text-[#746B61] mt-2 max-w-lg leading-relaxed">
              Rooms are discovery environments, not generic categories. Explore each space to reveal individual handcrafted pieces.
            </p>
          </div>

          <button
            onClick={() => navigate('/rooms')}
            className="mt-4 md:mt-0 text-sm font-bold text-[#4A2C1A] hover:text-[#8B5A2B] flex items-center gap-1.5 transition-colors group cursor-pointer"
          >
            <span>View All 4 Room Studies</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 Room Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => navigate(`/rooms/${room.slug}`)}
              className="group interactive-card cursor-pointer bg-white rounded-3xl overflow-hidden border border-[#4A2C1A]/10 hover:border-[#8B5A2B]/40 shadow-soft-sm flex flex-col scroll-reveal-img"
            >
              {/* Room Image */}
              <div className="relative aspect-[4/3] bg-[#F7F4EF] overflow-hidden">
                <img
                  src={room.categoryImage}
                  alt={room.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Hotspot Count Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#4A2C1A] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                  {room.hotspots.length} Staged Pieces
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#EADBC8] block">
                    Living Space
                  </span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white group-hover:text-[#F5E6D3] transition-colors leading-tight">
                    {room.name}
                  </h3>
                </div>
              </div>

              {/* Card Bottom Specs */}
              <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                <p className="text-xs text-[#746B61] line-clamp-2 leading-relaxed mb-4">
                  {room.subheadline}
                </p>

                <div className="pt-3 border-t border-[#F7F4EF] flex items-center justify-between text-xs font-semibold text-[#8B5A2B]">
                  <span>Explore {room.name} Catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INTERACTIVE ROOM SCENE EXPERIENCE (HOTSPOTS) */}
      <section className="py-16 bg-[#F7F4EF] border-y border-[#EEE9E1]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 scroll-reveal-text">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B] bg-[#F5E6D3] px-3.5 py-1 rounded-full inline-block mb-3">
              Spatial Staging Suite
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#211E1B]">
              Experience Furniture in Context
            </h2>
            <p className="text-xs sm:text-sm text-[#746B61] mt-2">
              Switch rooms below to explore each environment with clickable hotspots mapped to individual catalog pieces.
            </p>

            {/* Room Tabs */}
            <div className="inline-flex items-center gap-2 p-1.5 bg-white rounded-full border border-[#DED7CD] shadow-sm mt-6 overflow-x-auto max-w-full">
              {rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoomTab(r.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    selectedRoomTab === r.id
                      ? 'bg-[#4A2C1A] text-white shadow-sm'
                      : 'text-[#514A43] hover:text-[#211E1B] hover:bg-[#FCFAF7]'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Room Canvas */}
          <RoomScene room={currentRoom} />
        </div>
      </section>

      {/* 4.5 360° INTERACTIVE ARCHITECTURAL INSPECTOR */}
      <section className="py-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 scroll-reveal-text">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B] bg-[#F5E6D3] px-3.5 py-1 rounded-full inline-block mb-2">
            Tactile Inspection
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#211E1B]">
            Rotate, Zoom & Inspect Proportions in 360°
          </h2>
          <p className="text-xs sm:text-sm text-[#746B61] mt-1.5">
            Test furniture stability, curved timber joinery, and tactile Belgian bouclé upholstery from every angle.
          </p>
        </div>

        {allProducts.length > 0 && (
          <Interactive360Viewer product={allProducts[0]} />
        )}
      </section>

      {/* 5. BESTSELLERS / SIGNATURE CURATION */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 scroll-reveal-text">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B] mb-2">
              Handcrafted Essentials
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#211E1B]">
              Signature Pieces for Living
            </h2>
            <p className="text-sm text-[#746B61] mt-1.5">
              Pieces chosen for their enduring proportions, dense natural wood grains, and tactile upholstery.
            </p>
          </div>

          <button
            onClick={() => navigate('/shop')}
            className="mt-4 md:mt-0 text-sm font-bold text-[#4A2C1A] hover:text-[#8B5A2B] flex items-center gap-1.5 group cursor-pointer"
          >
            <span>View Complete 24-Piece Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Product Cards Grid with GSAP Stagger */}
        <div className="bestsellers-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. COMPLETE THE ROOM BUNDLE SHOWCASE */}
      <section className="py-20 bg-[#4A2C1A] text-white relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Bundle Description */}
            <div className="lg:col-span-5 space-y-6 scroll-reveal-text">
              <div className="inline-flex items-center gap-2 bg-[#8B5A2B] text-white px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Complete the Room Curation
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5E6D3] leading-tight">
                The Warm Minimalist Living Room Suite
              </h2>

              <p className="text-sm text-[#C6BDB1] leading-relaxed">
                Curated by our senior architectural team to ensure flawless proportion, unified wood grain undertones, and tactile balance. Includes the Sectional Sofa, Kyoto Walnut Coffee Table, and Dune Wool Rug.
              </p>

              {/* Price Calculation Box */}
              <div className="p-5 rounded-2xl bg-[#332E29] border border-[#8B5A2B]/40 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[#9C9287]">Individual Value</span>
                  <span className="text-sm text-[#9C9287] line-through">
                    ₹{bundleOriginalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-[#F5E6D3]">Complete 3-Piece Suite</span>
                  <span className="font-display font-bold text-2xl sm:text-3xl text-white">
                    ₹{bundleDiscountedPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[11px] text-[#557A5A] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Includes 15% Suite Savings (₹{(bundleOriginalPrice - bundleDiscountedPrice).toLocaleString('en-IN')}) + Complimentary White Glove Care</span>
                </div>
              </div>

              {/* Bundle Action */}
              <button
                onClick={handleAddBundleToCart}
                className="btn-primary-shimmer w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Add 3-Piece Suite to Cart</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Staged Bundle Visuals */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {bundleProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="group bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between scroll-reveal-img transition-all duration-300 hover:border-white/30 hover:bg-white/15"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/20 mb-3">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#EADBC8] uppercase tracking-wider">
                      Piece 0{idx + 1}
                    </span>
                    <h4 className="font-display font-semibold text-sm text-white truncate">
                      {p.name}
                    </h4>
                    <span className="text-xs font-bold text-[#F5E6D3] block mt-1">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6.5 VELOURA SPATIAL STUDIO & MATERIAL LAB BANNER */}
      <section className="py-16 bg-[#FCFAF7] border-y border-[#EEE9E1]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#211E1B] via-[#352519] to-[#4A2C1A] text-white rounded-3xl p-8 sm:p-12 shadow-soft-xl border border-white/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5A2B]/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5A2B]/40 border border-[#8B5A2B]/50 text-[#EADBC8] text-[11px] font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#C49A6C]" />
                  Proprietary Furniture Intelligence Studio
                </div>

                <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-tight">
                  Simulate Floorplans & <span className="italic font-light text-[#C49A6C]">Diurnal Lighting</span> in 2D
                </h2>

                <p className="text-xs sm:text-sm text-[#DED7CD] max-w-2xl font-light leading-relaxed">
                  Avoid proportion mistakes before buying. Drag and rotate modular furniture pieces onto an interactive architectural grid, calculate walking clearance (38"+ pathway meter), and switch between Soft Dawn, Daylight, Golden Hour, and Ambient Night.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => navigate('/studio')}
                    className="btn-primary-shimmer px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-white flex items-center gap-2 shadow-lg cursor-pointer group"
                  >
                    <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                    <span>Launch 2D Spatial Studio</span>
                  </button>

                  <button
                    onClick={() => navigate('/studio')}
                    className="px-5 py-3.5 rounded-full text-xs sm:text-sm font-medium text-[#F5E6D3] hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Inspect Material Swatches & Hardness</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C49A6C]">
                  Live Studio Diagnostics
                </div>
                <div className="space-y-2.5 text-xs text-[#EADBC8]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[#A89F91]">Circulation Clearance</span>
                    <span className="font-semibold text-emerald-400">38" (Optimal Flow)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[#A89F91]">Material Harmony</span>
                    <span className="font-semibold text-[#F5E6D3]">98% (Walnut + Bouclé)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A89F91]">Lighting Modes</span>
                    <span className="font-semibold text-[#F5E6D3]">4 Diurnal Presets</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CRAFTSMANSHIP & MATERIAL STORIES */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 scroll-reveal-text">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B] mb-2 block">
            Material Sourcing & Philosophy
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#211E1B]">
            Generational Hardwoods & Tactile Textures
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-3xl border border-[#4A2C1A]/10 shadow-soft-sm space-y-4 interactive-card scroll-reveal-img">
            <div className="w-12 h-12 rounded-2xl bg-[#F5E6D3] flex items-center justify-center text-[#8B5A2B] group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#4A2C1A]">Solid American Walnut</h3>
            <p className="text-xs sm:text-sm text-[#746B61] leading-relaxed">
              Harvested from slow-growth northern forests for dense, tight ring structures. Hand-finished with organic botanical waxes to let the grain breathe.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-3xl border border-[#4A2C1A]/10 shadow-soft-sm space-y-4 interactive-card scroll-reveal-img">
            <div className="w-12 h-12 rounded-2xl bg-[#F5E6D3] flex items-center justify-center text-[#8B5A2B] group-hover:scale-110 transition-transform duration-300">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#4A2C1A]">Belgian Wool Bouclé & Flax</h3>
            <p className="text-xs sm:text-sm text-[#746B61] leading-relaxed">
              Looped yarns with natural lanolin retention for organic stain resistance and an unmistakable cloud-like hand feel.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-3xl border border-[#4A2C1A]/10 shadow-soft-sm space-y-4 interactive-card scroll-reveal-img">
            <div className="w-12 h-12 rounded-2xl bg-[#F5E6D3] flex items-center justify-center text-[#8B5A2B] group-hover:scale-110 transition-transform duration-300">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#4A2C1A]">Zero-Creak Joinery</h3>
            <p className="text-xs sm:text-sm text-[#746B61] leading-relaxed">
              Interlocking mortise-and-tenon joints engineered to withstand humidity shifts across decades without loosening.
            </p>
          </div>
        </div>
      </section>

      {/* 8. ARCHITECTURAL CINEMA EXPERIENCE VIDEO MODAL */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsVideoModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-5xl bg-[#1C1815] border border-white/15 rounded-3xl overflow-hidden shadow-2xl text-white animate-scaleUp flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8B5A2B]/40 border border-[#8B5A2B] flex items-center justify-center text-[#F5E6D3]">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B5A2B] bg-[#8B5A2B]/20 px-2 py-0.5 rounded">
                      4K Ultra-HD
                    </span>
                    <span className="text-xs text-[#9C9287]">Spatial Cinema Tour</span>
                  </div>
                  <h3 className="font-display font-bold text-base sm:text-xl text-[#FCFAF7] mt-0.5">
                    Veloura Living — Architectural Spaces in Motion
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close video player"
              >
                ✕
              </button>
            </div>

            {/* Room Chapters Switcher Tabs with Mini Frame Thumbnails */}
            <div className="px-4 sm:px-6 py-3 bg-black/60 border-b border-white/10 flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-2.5">
                {[
                  {
                    id: 'living-room',
                    label: 'Living Room Villa',
                    time: '01:24',
                    thumb: '/images/video/veloura_video_frame_living.jpg'
                  },
                  {
                    id: 'bedroom',
                    label: 'Bedroom Sanctuary',
                    time: '01:10',
                    thumb: '/images/video/veloura_video_frame_bedroom.jpg'
                  },
                  {
                    id: 'dining',
                    label: 'Dining Pavilion',
                    time: '00:58',
                    thumb: '/images/video/veloura_video_frame_dining.jpg'
                  },
                  {
                    id: 'office',
                    label: 'Study & Workshop',
                    time: '01:45',
                    thumb: '/images/video/veloura_video_frame_office.jpg'
                  }
                ].map((chap) => (
                  <button
                    key={chap.id}
                    onClick={() => setSelectedRoomTab(chap.id)}
                    className={`flex items-center gap-2 p-1.5 pr-3.5 rounded-2xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer border ${
                      selectedRoomTab === chap.id
                        ? 'bg-[#8B5A2B] text-white border-[#F5E6D3]/40 shadow-lg'
                        : 'bg-white/5 text-[#DED7CD] border-white/10 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <img
                      src={chap.thumb}
                      alt={chap.label}
                      className="w-8 h-6 rounded-lg object-cover bg-black/40"
                    />
                    <span>{chap.label}</span>
                    <span className="text-[10px] opacity-75 font-normal font-mono">({chap.time})</span>
                  </button>
                ))}
              </div>

              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#EADBC8] font-medium bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                Architectural Lighting Sim
              </span>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center group/player">
              <video
                key={selectedRoomTab}
                controls
                autoPlay
                playsInline
                loop
                className="w-full h-full object-cover"
                poster={
                  selectedRoomTab === 'bedroom'
                    ? '/images/video/veloura_video_frame_bedroom.jpg'
                    : selectedRoomTab === 'dining'
                    ? '/images/video/veloura_video_frame_dining.jpg'
                    : selectedRoomTab === 'office'
                    ? '/images/video/veloura_video_frame_office.jpg'
                    : '/images/video/veloura_video_frame_living.jpg'
                }
              >
                <source
                  src={
                    selectedRoomTab === 'bedroom'
                      ? 'https://assets.mixkit.co/videos/preview/mixkit-bright-modern-minimalist-bedroom-42468-large.mp4'
                      : selectedRoomTab === 'dining'
                      ? 'https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-dining-room-41005-large.mp4'
                      : selectedRoomTab === 'office'
                      ? 'https://assets.mixkit.co/videos/preview/mixkit-carpenter-measuring-a-piece-of-wood-in-his-workshop-43753-large.mp4'
                      : 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-with-living-room-and-kitchen-40291-large.mp4'
                  }
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Bottom Scene Product Explorer Drawer */}
            <div className="p-4 sm:p-5 bg-[#141210] border-t border-white/10 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B]">
                    Featured in this Scene
                  </span>
                  <span className="text-xs text-[#9C9287]">
                    ({currentRoom.name} Architectural Collection)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    navigate(`/rooms/${currentRoom.slug}`);
                  }}
                  className="text-xs font-bold text-[#F5E6D3] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Full Room Suite</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3 Key Furniture Pieces in this Scene */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {allProducts
                  .filter((p) => p.room === currentRoom.id)
                  .slice(0, 3)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/10 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-black/40 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-display font-semibold text-xs text-white truncate">
                            {product.name}
                          </h5>
                          <span className="text-[11px] font-bold text-[#F5E6D3] block">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            addToCart(product);
                          }}
                          className="btn-primary-shimmer p-2 rounded-lg text-white text-xs cursor-pointer"
                          title="Add to Cart"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setIsVideoModalOpen(false);
                            navigate(`/products/${product.slug}`);
                          }}
                          className="btn-secondary-refined p-2 rounded-lg text-xs cursor-pointer"
                          title="Inspect Details"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Space Personality Quiz Modal */}
      <AIInteriorQuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </div>
  );
};
