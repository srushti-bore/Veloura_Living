'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap';
import { useStore } from '@/hooks/useStore';
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Eye,
  SlidersHorizontal,
  Heart
} from 'lucide-react';
import { triggerLuxuryToast } from '@/components/common/LuxuryToast';

interface SceneData {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  quote: string;
  category: string;
  roomSlug: string;
  productId: string;
  productName: string;
  productPrice: number;
  furnitureImage: string;
  furnitureFallback: string;
  bgImage: string;
  bgFallback: string;
  objectImage: string;
  objectFallback: string;
  materialTag: string;
  specs: { label: string; value: string }[];
}

const SCENES: SceneData[] = [
  {
    id: 'scene-01',
    number: '01',
    title: 'Space Transformed by Proportion',
    subtitle: 'Sculptural Solis Lounge Chair • Raw American Walnut • Diurnal Sunlight',
    quote: 'Architecture becomes intimate the moment furniture respects the negative space around it.',
    category: 'Living Architecture',
    roomSlug: 'living-room',
    productId: 'prod-lr-03',
    productName: 'Solis Bouclé Occasional Chair',
    productPrice: 48999,
    furnitureImage: '/images/products/veloura_solis_boucle_chair.jpg',
    furnitureFallback: 'https://images.unsplash.com/photo-1580481077195-c3a824490796?auto=format&fit=crop&w=1200&q=80',
    bgImage: '/images/rooms/veloura_ultra_luxury_living_hero.jpg',
    bgFallback: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
    objectImage: '/images/products/veloura_arc_floor_lamp.jpg',
    objectFallback: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    materialTag: 'Belgian Bouclé & Travertine',
    specs: [
      { label: 'Wood Origin', value: 'Solid American Walnut' },
      { label: 'Upholstery', value: 'Looped Wool Bouclé' },
      { label: 'Joinery', value: 'Hand-Mitered Mortise' },
    ],
  },
  {
    id: 'scene-02',
    number: '02',
    title: 'The Artistry of the Shared Table',
    subtitle: 'Kyoto Sculptural Oval Table • Fluted Tambour Credenza • Organic Flax',
    quote: 'The dining space is the anchor of the modern home — a balance of generous wood grain and refined craft.',
    category: 'Dining Pavilion',
    roomSlug: 'dining',
    productId: 'prod-lr-02',
    productName: 'Kyoto Sculptural Walnut Table',
    productPrice: 64999,
    furnitureImage: '/images/products/veloura_kyoto_coffee_table.jpg',
    furnitureFallback: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
    bgImage: '/images/rooms/veloura_luxury_dining_hero.jpg',
    bgFallback: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1600&q=80',
    objectImage: '/images/products/veloura_dune_wool_rug.jpg',
    objectFallback: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    materialTag: 'Natural Botanical Wax Finish',
    specs: [
      { label: 'Proportion', value: '8-Seater Architectural Contour' },
      { label: 'Wood Density', value: 'Slow-Growth Hardwood' },
      { label: 'Finish', value: 'Non-Toxic Matte Wax' },
    ],
  },
  {
    id: 'scene-03',
    number: '03',
    title: 'Restorative Quietude & Repose',
    subtitle: 'Elysian Low-Profile Platform Bed • Travertine Nightstand • 432Hz Calm',
    quote: 'The bedroom should hold no visual noise — only pure silhouette, warm wood, and textiles that invite sleep.',
    category: 'Bedroom Sanctuary',
    roomSlug: 'bedroom',
    productId: 'prod-br-01',
    productName: 'Elysian Low-Profile Platform Bed',
    productPrice: 89999,
    furnitureImage: '/images/products/veloura_elysian_platform_bed.jpg',
    furnitureFallback: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    bgImage: '/images/rooms/veloura_luxury_bedroom_hero.jpg',
    bgFallback: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1600&q=80',
    objectImage: '/images/products/veloura_travertine_nightstand.jpg',
    objectFallback: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    materialTag: 'Flax Linen & Smoked Oak',
    specs: [
      { label: 'Platform Height', value: '11" Low Japandi Profile' },
      { label: 'Headboard', value: 'Floating Cushioned Linen' },
      { label: 'Acoustic Rating', value: 'Zero-Creak Interlocking Slat' },
    ],
  },
  {
    id: 'scene-04',
    number: '04',
    title: 'Generational Craft for the Study',
    subtitle: 'Kanso Minimalist Writing Desk • Saddle Leather Inlay • Lifelong Precision',
    quote: 'Furniture engineered to outlast generations, aging with a warm, unmistakable patina.',
    category: 'Architectural Study',
    roomSlug: 'office',
    productId: 'prod-of-01',
    productName: 'Kanso Minimalist Writing Desk',
    productPrice: 54999,
    furnitureImage: '/images/products/veloura_kanso_writing_desk.jpg',
    furnitureFallback: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
    bgImage: '/images/rooms/veloura_luxury_office_hero.jpg',
    bgFallback: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80',
    objectImage: '/images/products/veloura_zenith_leather_chair.jpg',
    objectFallback: 'https://images.unsplash.com/photo-1580481077197-0742d4a572a1?auto=format&fit=crop&w=600&q=80',
    materialTag: 'Saddle Leather & Kiln-Dried Oak',
    specs: [
      { label: 'Inlay', value: 'Full-Grain Italian Leather' },
      { label: 'Cable Channel', value: 'Concealed Brass Grommet' },
      { label: 'Warranty', value: '100-Year Structural Promise' },
    ],
  },
];

export const SceneChoreographyStage: React.FC = () => {
  const { navigate, addToCart, allProducts, setPreviewProduct, toggleWishlist, isWishlisted } = useStore();
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !stageRef.current) return;

    const stageEl = stageRef.current;

    const ctx = gsap.context(() => {
      // 1. Initial State for Containers and Layers
      gsap.set('.scene-stage-item', { opacity: 0, pointerEvents: 'none' });
      gsap.set('.scene-stage-item-0', { opacity: 1, pointerEvents: 'auto' });

      gsap.set('.scene-stage-item-0 .furniture-el', { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 });
      gsap.set('.scene-stage-item-0 .object-el', { x: 0, y: 0, rotation: 0, opacity: 1 });
      gsap.set('.scene-stage-item-0 .text-el', { y: 0, opacity: 1 });
      gsap.set('.scene-stage-item-0 .card-el', { y: 0, opacity: 1, scale: 1 });
      gsap.set('.scene-stage-item-0 .bg-el', { scale: 1, opacity: 0.95 });

      // 2. Master Scrubbed Timeline for Scene-to-Scene Choreography
      const masterTl = gsap.timeline({
        scrollTrigger: {
          id: 'scene-stage-trigger',
          trigger: stageEl,
          start: 'top top',
          end: '+=350%',
          pin: true,
          scrub: 1.0,
          anticipatePin: 1,
          onUpdate: (self) => {
            const prog = self.progress;
            setScrollProgress(prog);
            const sceneIdx = Math.min(
              SCENES.length - 1,
              Math.floor(prog * SCENES.length * 0.999)
            );
            setActiveSceneIndex(sceneIdx);
          },
        },
      });

      // ----------------------------------------------------
      // SECTION 1 -> SECTION 2 TRANSITION (Time: 0.0 -> 1.0)
      // ----------------------------------------------------
      // Scene 0 Elements Exit with Multi-Axis Choreography
      masterTl
        .to(
          '.scene-stage-item-0 .furniture-el',
          { x: -220, y: 80, scale: 0.84, rotation: -7, opacity: 0, duration: 1, ease: 'power2.inOut' },
          0
        )
        .to(
          '.scene-stage-item-0 .object-el',
          { x: 160, y: -60, rotation: 16, opacity: 0, duration: 1, ease: 'power2.inOut' },
          0
        )
        .to(
          '.scene-stage-item-0 .text-el',
          { y: -45, opacity: 0, duration: 0.8, ease: 'power2.inOut' },
          0
        )
        .to(
          '.scene-stage-item-0 .card-el',
          { y: 40, scale: 0.85, opacity: 0, duration: 0.8, ease: 'power2.inOut' },
          0
        )
        .to(
          '.scene-stage-item-0 .bg-el',
          { scale: 1.08, opacity: 0, duration: 1, ease: 'power2.inOut' },
          0.1
        )
        .to('.scene-stage-item-0', { opacity: 0, pointerEvents: 'none', duration: 0.4 }, 0.6)

        // Scene 1 Elements Enter with Smooth Stagger
        .set('.scene-stage-item-1', { opacity: 1, pointerEvents: 'auto' }, 0.4)
        .fromTo(
          '.scene-stage-item-1 .bg-el',
          { opacity: 0, scale: 0.94 },
          { opacity: 0.95, scale: 1, duration: 1, ease: 'power2.out' },
          0.4
        )
        .fromTo(
          '.scene-stage-item-1 .furniture-el',
          { x: 240, y: 40, scale: 0.88, rotation: 6, opacity: 0 },
          { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1, ease: 'power2.out' },
          0.45
        )
        .fromTo(
          '.scene-stage-item-1 .object-el',
          { x: -140, y: -40, rotation: -12, opacity: 0 },
          { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1, ease: 'power2.out' },
          0.5
        )
        .fromTo(
          '.scene-stage-item-1 .text-el',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' },
          0.48
        )
        .fromTo(
          '.scene-stage-item-1 .card-el',
          { y: 35, scale: 0.88, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' },
          0.52
        );

      // ----------------------------------------------------
      // SECTION 2 -> SECTION 3 TRANSITION (Time: 1.0 -> 2.0)
      // ----------------------------------------------------
      // Scene 1 Elements Exit
      masterTl
        .to(
          '.scene-stage-item-1 .furniture-el',
          { x: -220, y: -70, scale: 0.84, rotation: -8, opacity: 0, duration: 1, ease: 'power2.inOut' },
          1.0
        )
        .to(
          '.scene-stage-item-1 .object-el',
          { x: 180, y: 60, rotation: 14, opacity: 0, duration: 1, ease: 'power2.inOut' },
          1.0
        )
        .to(
          '.scene-stage-item-1 .text-el',
          { y: -45, opacity: 0, duration: 0.8, ease: 'power2.inOut' },
          1.0
        )
        .to(
          '.scene-stage-item-1 .card-el',
          { y: 40, scale: 0.85, opacity: 0, duration: 0.8, ease: 'power2.inOut' },
          1.0
        )
        .to(
          '.scene-stage-item-1 .bg-el',
          { scale: 1.08, opacity: 0, duration: 1, ease: 'power2.inOut' },
          1.1
        )
        .to('.scene-stage-item-1', { opacity: 0, pointerEvents: 'none', duration: 0.4 }, 1.6)

        // Scene 2 Elements Enter
        .set('.scene-stage-item-2', { opacity: 1, pointerEvents: 'auto' }, 1.4)
        .fromTo(
          '.scene-stage-item-2 .bg-el',
          { opacity: 0, scale: 0.94 },
          { opacity: 0.95, scale: 1, duration: 1, ease: 'power2.out' },
          1.4
        )
        .fromTo(
          '.scene-stage-item-2 .furniture-el',
          { x: 220, y: -50, scale: 0.86, rotation: 5, opacity: 0 },
          { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1, ease: 'power2.out' },
          1.45
        )
        .fromTo(
          '.scene-stage-item-2 .object-el',
          { x: -130, y: 50, rotation: -14, opacity: 0 },
          { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1, ease: 'power2.out' },
          1.5
        )
        .fromTo(
          '.scene-stage-item-2 .text-el',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' },
          1.48
        )
        .fromTo(
          '.scene-stage-item-2 .card-el',
          { y: 35, scale: 0.88, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' },
          1.52
        );

      // ----------------------------------------------------
      // SECTION 3 -> SECTION 4 TRANSITION (Time: 2.0 -> 3.0)
      // ----------------------------------------------------
      // Scene 2 Elements Exit
      masterTl
        .to(
          '.scene-stage-item-2 .furniture-el',
          { x: -240, y: 60, scale: 0.82, rotation: -6, opacity: 0, duration: 1, ease: 'power2.inOut' },
          2.0
        )
        .to(
          '.scene-stage-item-2 .object-el',
          { x: 160, y: -50, rotation: 12, opacity: 0, duration: 1, ease: 'power2.inOut' },
          2.0
        )
        .to(
          '.scene-stage-item-2 .text-el',
          { y: -45, opacity: 0, duration: 0.8, ease: 'power2.inOut' },
          2.0
        )
        .to(
          '.scene-stage-item-2 .card-el',
          { y: 40, scale: 0.85, opacity: 0, duration: 0.8, ease: 'power2.inOut' },
          2.0
        )
        .to(
          '.scene-stage-item-2 .bg-el',
          { scale: 1.08, opacity: 0, duration: 1, ease: 'power2.inOut' },
          2.1
        )
        .to('.scene-stage-item-2', { opacity: 0, pointerEvents: 'none', duration: 0.4 }, 2.6)

        // Scene 3 Elements Enter
        .set('.scene-stage-item-3', { opacity: 1, pointerEvents: 'auto' }, 2.4)
        .fromTo(
          '.scene-stage-item-3 .bg-el',
          { opacity: 0, scale: 0.94 },
          { opacity: 0.95, scale: 1, duration: 1, ease: 'power2.out' },
          2.4
        )
        .fromTo(
          '.scene-stage-item-3 .furniture-el',
          { x: 240, y: 45, scale: 0.88, rotation: 6, opacity: 0 },
          { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: 1, ease: 'power2.out' },
          2.45
        )
        .fromTo(
          '.scene-stage-item-3 .object-el',
          { x: -140, y: -40, rotation: -10, opacity: 0 },
          { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1, ease: 'power2.out' },
          2.5
        )
        .fromTo(
          '.scene-stage-item-3 .text-el',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' },
          2.48
        )
        .fromTo(
          '.scene-stage-item-3 .card-el',
          { y: 35, scale: 0.88, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' },
          2.52
        );
    }, stageEl);

    return () => {
      ctx.revert();
    };
  }, []);

  const currentScene = SCENES[activeSceneIndex];

  const handleQuickAdd = (scene: SceneData) => {
    const product = allProducts.find((p) => p.id === scene.productId);
    if (product) {
      addToCart(product);
      triggerLuxuryToast({
        type: 'cart',
        title: 'Added to Shopping Bag',
        subtitle: product.name,
        imageUrl: scene.furnitureImage,
        price: product.price,
      });
    }
  };

  const handleInspect = (scene: SceneData) => {
    const product = allProducts.find((p) => p.id === scene.productId);
    if (product) {
      setPreviewProduct(product);
    } else {
      navigate(`/rooms/${scene.roomSlug}`);
    }
  };

  const handleTabClick = (sIdx: number) => {
    const trigger = ScrollTrigger.getById('scene-stage-trigger');
    if (trigger) {
      const scrollStart = trigger.start;
      const scrollEnd = trigger.end;
      const targetProgress = sIdx / (SCENES.length - 1);
      const targetScroll = scrollStart + (scrollEnd - scrollStart) * targetProgress;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    } else {
      setActiveSceneIndex(sIdx);
    }
  };

  return (
    <div
      ref={stageRef}
      className="scene-stage-container relative w-full bg-[#FAF7F2] text-[#211915] border-y border-[#4A2C1A]/10 overflow-hidden select-none"
    >
      {/* Viewport Stage Pinned during Scroll */}
      <div className="scene-pinned-viewport h-[100vh] w-full flex flex-col justify-between py-6 sm:py-8 px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        {/* Top Editorial Stage Header Bar */}
        <div className="relative z-40 flex items-center justify-between w-full max-w-[1440px] mx-auto pb-4 border-b border-[#4A2C1A]/10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] bg-[#F4E8D7] text-[#4A2C1A] px-3 py-1 rounded-full border border-[#D8B486]/30 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3 h-3 text-[#A9794F]" />
              <span>Choreographed Spatial Theatre</span>
            </span>
            <span className="hidden sm:inline text-xs text-[#765236] font-medium">
              Scroll to Animate Multi-Layer Compositions
            </span>
          </div>

          {/* Minimal Editorial Progress Rail */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#4A2C1A]">
              <span className="text-sm font-bold text-[#A9794F]">
                {currentScene.number}
              </span>
              <span className="text-[#B9AA99]">/</span>
              <span className="text-[#765236]">04</span>
            </div>

            {/* Dynamic Scrub Progress Bar */}
            <div className="w-24 sm:w-36 h-1.5 bg-[#EADBC8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4A2C1A] transition-all duration-75 rounded-full"
                style={{ width: `${Math.max(6, scrollProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Layer Scenes Composition Stage */}
        <div className="relative flex-1 w-full max-w-[1440px] mx-auto my-auto flex items-center py-2">
          {SCENES.map((scene, idx) => {
            return (
              <div
                key={scene.id}
                className={`scene-stage-item scene-stage-item-${idx} absolute inset-0 w-full h-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 z-20`}
              >
                {/* Layer 0: Background Canvas with Soft Vignette & Depth Scaling */}
                <div className="bg-el absolute inset-0 -z-10 rounded-3xl overflow-hidden shadow-soft-xl border border-[#4A2C1A]/10 bg-[#F4E8D7]">
                  <img
                    src={scene.bgImage}
                    alt={scene.title}
                    onError={(e) => {
                      e.currentTarget.src = scene.bgFallback;
                    }}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/95 via-[#FAF7F2]/80 to-transparent lg:w-3/5" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
                </div>

                {/* Left Narrative Composition (Layer 5: Typography) */}
                <div className="text-el lg:w-1/2 space-y-4 sm:space-y-6 z-20 max-w-xl pl-2 sm:pl-4">
                  <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.2em] text-[#A9794F]">
                    <span>Scene {scene.number}</span>
                    <span className="w-8 h-px bg-[#A9794F]" />
                    <span>{scene.category}</span>
                  </div>

                  <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-[#211915] leading-[1.08] tracking-tight">
                    {scene.title}
                  </h2>

                  <p className="font-display italic text-base sm:text-xl text-[#765236] leading-relaxed">
                    "{scene.quote}"
                  </p>

                  <p className="text-xs sm:text-sm text-[#514A43] leading-relaxed font-sans">
                    {scene.subtitle}
                  </p>

                  {/* Material & Spec Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {scene.specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-[#4A2C1A]/10 text-[11px] font-sans text-[#2A1A12] shadow-xs"
                      >
                        <span className="text-[#B9AA99] mr-1">{spec.label}:</span>
                        <strong className="font-semibold">{spec.value}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Scene Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-2">
                    <button
                      onClick={() => handleQuickAdd(scene)}
                      className="btn-primary-shimmer px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-md hover:shadow-xl cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add Piece to Bag • ₹{scene.productPrice.toLocaleString('en-IN')}</span>
                    </button>

                    <button
                      onClick={() => navigate(`/rooms/${scene.roomSlug}`)}
                      className="btn-secondary-refined px-5 py-3.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer group active:scale-95"
                    >
                      <span>Explore {scene.category}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Right Staged Layers (Layer 2 Furniture + Layer 3 Object + Layer 4 Floating Spec Card) */}
                <div className="relative lg:w-1/2 h-[340px] sm:h-[440px] lg:h-[500px] w-full flex items-center justify-center">
                  {/* Layer 2: Main Staged Furniture Element with 3D Depth Transforms */}
                  <div className="furniture-el relative w-72 sm:w-96 lg:w-[420px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-[#F4E8D7] z-20">
                    <img
                      src={scene.furnitureImage}
                      alt={scene.productName}
                      onError={(e) => {
                        e.currentTarget.src = scene.furnitureFallback;
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-[#2A1A12]/85 backdrop-blur-md text-[#FAF7F2] text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                      {scene.materialTag}
                    </div>
                  </div>

                  {/* Layer 3: Floating Secondary Object / Craft Layer */}
                  <div className="object-el absolute -bottom-3 -left-3 sm:left-4 w-36 sm:w-44 aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/60 bg-white/95 backdrop-blur-md p-2 z-30 hidden sm:block">
                    <img
                      src={scene.objectImage}
                      alt="Material Study Asset"
                      onError={(e) => {
                        e.currentTarget.src = scene.objectFallback;
                      }}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="text-center mt-1 text-[9px] font-bold text-[#4A2C1A] tracking-wider uppercase">
                      Material Study
                    </div>
                  </div>

                  {/* Layer 4: Floating Product Spec Quickcard */}
                  <div className="card-el absolute -top-3 right-0 sm:right-4 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-[#4A2C1A]/10 z-30 max-w-[240px] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A9794F] font-mono">
                        Live Specimen
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(scene.productId);
                        }}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                          isWishlisted(scene.productId)
                            ? 'text-[#A9794F] bg-[#F4E8D7]'
                            : 'text-[#B9AA99] hover:text-[#4A2C1A]'
                        }`}
                        title="Wishlist Piece"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-[#211915] truncate">
                        {scene.productName}
                      </h4>
                      <span className="text-xs font-bold text-[#2A1A12] block">
                        ₹{scene.productPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#FAF7F2] flex items-center justify-between text-[11px] font-semibold text-[#765236]">
                      <button
                        onClick={() => handleInspect(scene)}
                        className="hover:text-[#2A1A12] flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect 360°</span>
                      </button>
                      <button
                        onClick={() => handleQuickAdd(scene)}
                        className="hover:text-[#A9794F] flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <span>+ Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Scene Quick Navigation Bar */}
        <div className="relative z-40 flex flex-wrap items-center justify-between gap-4 w-full max-w-[1440px] mx-auto pt-4 border-t border-[#4A2C1A]/10">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            {SCENES.map((scene, sIdx) => {
              const isActive = activeSceneIndex === sIdx;
              return (
                <button
                  key={scene.id}
                  onClick={() => handleTabClick(sIdx)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#2A1A12] text-[#FAF7F2] shadow-md scale-105 border border-[#2A1A12]'
                      : 'bg-white/80 text-[#765236] hover:bg-white hover:text-[#211915] border border-[#D8B486]/40 shadow-xs'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-75">{scene.number}</span>
                  <span className="whitespace-nowrap font-sans">{scene.category}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#765236]">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#A9794F]" />
              Scroll to Choreograph Next Composition
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneChoreographyStage;
