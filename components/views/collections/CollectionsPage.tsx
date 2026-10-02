'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/hooks/useStore';
import { aestheticCollectionsData, AestheticImageItem, AestheticCollectionSection } from '@/lib/data/aestheticCollections';
import {
  ArrowRight,
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  Check,
  Compass,
  Layers
} from 'lucide-react';

interface EditorialGalleryCardProps {
  item: AestheticImageItem;
  index: number;
  fallbackHero: string;
  onOpenLightbox: () => void;
}

const EditorialGalleryCard: React.FC<EditorialGalleryCardProps> = ({
  item,
  index,
  fallbackHero,
  onOpenLightbox
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(item.image);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      onClick={onOpenLightbox}
      className="group relative bg-white rounded-2xl overflow-hidden border border-[#4A2C1A]/10 shadow-soft-sm hover:shadow-soft-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* 4:5 Aspect Ratio Container with Warm Neutral Background & Skeleton */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5EFE6]">
        {/* Warm Skeleton Shimmer while Loading */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#EFE8DC] animate-pulse flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#8B5A2B]/30 animate-spin" />
          </div>
        )}

        <img
          src={imgSrc}
          alt={item.title}
          loading={index < 4 ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (!hasError) {
              setHasError(true);
              setImgSrc(fallbackHero);
            }
          }}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Subtle Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Floating Top Category Pill on Hover */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 shadow-sm">
            {item.category}
          </span>
          <span className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white shadow-sm">
            <Maximize2 className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Compact Editorial Metadata Footer */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between bg-white border-t border-[#EEE9E1]/80">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B5A2B] truncate mb-0.5">
          {item.materialTag}
        </div>
        <h3 className="font-display font-bold text-xs sm:text-sm text-[#211E1B] group-hover:text-[#8B5A2B] transition-colors line-clamp-1">
          {item.title}
        </h3>
        <div className="flex items-center justify-between mt-1 text-[10px] text-[#9C9287]">
          <span className="truncate max-w-[150px]">{item.category}</span>
          <span className="font-semibold text-[#8B5A2B] group-hover:translate-x-0.5 transition-transform flex-shrink-0">
            Inspect 4:5 →
          </span>
        </div>
      </div>
    </div>
  );
};

export const CollectionsPage: React.FC = () => {
  const { currentPath, navigate, setFilters, addToCart, allProducts } = useStore();
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Extract collection slug from URL if on /collections/:slug
  const activeSlug = currentPath.startsWith('/collections/')
    ? currentPath.replace('/collections/', '').trim()
    : null;

  const currentCollection = activeSlug
    ? aestheticCollectionsData.find((c) => c.slug === activeSlug || c.id === activeSlug)
    : null;

  // Lightbox keyboard navigation (ArrowLeft, ArrowRight, Escape)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxImageIndex === null || !currentCollection) return;

      if (e.key === 'Escape') {
        setLightboxImageIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxImageIndex((prev) =>
          prev !== null ? (prev + 1) % currentCollection.images.length : null
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxImageIndex((prev) =>
          prev !== null
            ? (prev - 1 + currentCollection.images.length) % currentCollection.images.length
            : null
        );
      }
    },
    [lightboxImageIndex, currentCollection]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch swipe support for Lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || lightboxImageIndex === null || !currentCollection) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (diff > 50) {
      // Swiped Left -> Next Image
      setLightboxImageIndex((prev) =>
        prev !== null ? (prev + 1) % currentCollection.images.length : null
      );
    } else if (diff < -50) {
      // Swiped Right -> Previous Image
      setLightboxImageIndex((prev) =>
        prev !== null
          ? (prev - 1 + currentCollection.images.length) % currentCollection.images.length
          : null
      );
    }
    touchStartXRef.current = null;
  };

  const handleAddToCart = (productId?: string) => {
    if (!productId) return;
    const prod = allProducts.find((p) => p.id === productId);
    if (prod) {
      addToCart(prod);
      setAddedProductId(productId);
      setTimeout(() => setAddedProductId(null), 2500);
    }
  };

  // =========================================================================
  // VIEW 1: INSIDE COLLECTION EDITORIAL GALLERY (When on /collections/:slug)
  // =========================================================================
  if (currentCollection) {
    const activeLightboxItem: AestheticImageItem | null =
      lightboxImageIndex !== null ? currentCollection.images[lightboxImageIndex] : null;

    const otherCollections = aestheticCollectionsData.filter((c) => c.id !== currentCollection.id);

    return (
      <div className="min-h-screen bg-[#FCFAF7] py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          {/* Breadcrumb & Navigation Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/collections')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B5A2B] hover:text-[#4A2C1A] bg-white px-4 py-2 rounded-full border border-[#DED7CD] transition-colors shadow-soft-sm cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>All Collections</span>
            </button>

            <span className="text-xs font-bold uppercase tracking-widest text-[#9C9287]">
              Veloura Lookbook Archive
            </span>
          </div>

          {/* Refined Editorial Collection Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#4A2C1A]/10 shadow-soft-md space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#EEE9E1]">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-[#F5E6D3] text-[#4A2C1A] px-3.5 py-1 rounded-full text-xs font-bold tracking-[0.15em] uppercase border border-[#8B5A2B]/20">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>Curated Aesthetic World</span>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#211E1B] tracking-tight">
                  {currentCollection.title}
                </h1>

                <p className="text-sm sm:text-base text-[#746B61] leading-relaxed">
                  {currentCollection.description}
                </p>

                {/* Material Tokens */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {currentCollection.materialTokens.map((token) => (
                    <span
                      key={token}
                      className="text-[11px] font-semibold text-[#4A2C1A] bg-[#F5E6D3]/70 px-3 py-1 rounded-full border border-[#8B5A2B]/15"
                    >
                      • {token}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setFilters((prev: any) => ({ ...prev, room: currentCollection.room as any }));
                    navigate('/shop');
                  }}
                  className="btn-primary-shimmer px-6 py-3.5 rounded-full text-xs font-bold tracking-wide text-white shadow-soft-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Shop Collection Pieces</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gallery Info Strip */}
            <div className="flex items-center justify-between text-xs text-[#746B61]">
              <span className="font-semibold text-[#4A2C1A]">
                Showing {currentCollection.piecesCount} Architectural Visuals • 4:5 Portrait Grid
              </span>
              <span className="hidden sm:inline text-[#9C9287]">
                Click any image to inspect in full 4:5 Lightbox
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4-COLUMN COMPACT 4:5 EDITORIAL GALLERY (15 Images)           */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {currentCollection.images.map((item, index) => (
              <EditorialGalleryCard
                key={item.id}
                item={item}
                index={index}
                fallbackHero={currentCollection.heroImage}
                onOpenLightbox={() => setLightboxImageIndex(index)}
              />
            ))}
          </div>

          {/* Explore Other Collections Bar */}
          <div className="pt-10 border-t border-[#4A2C1A]/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#211E1B]">
                Explore More Aesthetic Worlds
              </h3>
              <button
                onClick={() => navigate('/collections')}
                className="text-xs font-bold text-[#8B5A2B] hover:underline cursor-pointer"
              >
                View All Collections →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {otherCollections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => navigate(`/collections/${col.slug}`)}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#4A2C1A]/10 p-3.5 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer flex items-center gap-3.5"
                >
                  <div className="w-14 h-18 rounded-xl overflow-hidden aspect-[4/5] bg-[#F5EFE6] flex-shrink-0">
                    <img
                      src={col.heroImage}
                      alt={col.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-xs sm:text-sm text-[#211E1B] group-hover:text-[#8B5A2B] transition-colors truncate">
                      {col.title}
                    </h4>
                    <p className="text-[11px] text-[#746B61] line-clamp-1 mt-0.5">
                      {col.tagline}
                    </p>
                    <span className="text-[10px] font-bold text-[#8B5A2B] mt-1 inline-block">
                      15 Visuals →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4:5 FULLSCREEN EDITORIAL LIGHTBOX (Section 13 Compliance)   */}
        {/* ============================================================ */}
        {activeLightboxItem && lightboxImageIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6"
            onClick={() => setLightboxImageIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-[#1A1614] border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxImageIndex(null)}
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer border border-white/20 shadow-xl"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Image Viewer Area (Strict 4:5 Proportion) */}
              <div className="relative md:w-3/5 bg-black flex items-center justify-center overflow-hidden aspect-[4/5]">
                <img
                  src={activeLightboxItem.image}
                  alt={activeLightboxItem.title}
                  className="w-full h-full object-cover select-none"
                />

                {/* Visual Counter (01 / 15) */}
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <span className="px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold tracking-widest border border-white/20">
                    {String(lightboxImageIndex + 1).padStart(2, '0')} / {String(currentCollection.images.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Left Navigation Arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImageIndex(
                      (lightboxImageIndex - 1 + currentCollection.images.length) % currentCollection.images.length
                    );
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition-all cursor-pointer shadow-xl"
                  title="Previous Image (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Right Navigation Arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImageIndex((lightboxImageIndex + 1) % currentCollection.images.length);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition-all cursor-pointer shadow-xl"
                  title="Next Image (Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Right Architectural Details Panel */}
              <div className="p-6 sm:p-8 md:w-2/5 flex flex-col justify-between space-y-6 text-white overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C49A6C] bg-[#4A2C1A] px-2.5 py-1 rounded-full border border-[#C49A6C]/30">
                      {currentCollection.title}
                    </span>
                    <span className="text-[10px] font-bold text-white/70">
                      4:5 Portrait Archive
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white leading-tight">
                    {activeLightboxItem.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#DED7CD] leading-relaxed">
                    {activeLightboxItem.caption}
                  </p>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#C49A6C]">
                      Material & Finish Specification
                    </div>
                    <div className="text-xs font-semibold text-white">
                      {activeLightboxItem.materialTag}
                    </div>
                    <div className="text-[11px] text-[#A89F91]">
                      Curated for {currentCollection.room} architectural proportions.
                    </div>
                  </div>

                  {activeLightboxItem.price && (
                    <div className="pt-2">
                      <div className="text-[10px] uppercase font-bold text-[#A89F91]">Estimated Spec Value</div>
                      <div className="font-display font-bold text-xl sm:text-2xl text-[#E0C097]">
                        ₹{activeLightboxItem.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                  {activeLightboxItem.productSlug && (
                    <button
                      onClick={() => {
                        setLightboxImageIndex(null);
                        navigate(`/products/${activeLightboxItem.productSlug}`);
                      }}
                      className="w-full btn-primary-shimmer py-3.5 rounded-full text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>View Product Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {activeLightboxItem.productId && (
                    <button
                      onClick={() => handleAddToCart(activeLightboxItem.productId)}
                      className="w-full py-3 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {addedProductId === activeLightboxItem.productId ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-[#C49A6C]" />
                          <span>Add Piece to Cart</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: EXISTING AESTHETIC COLLECTION OVERVIEW (Strict Design Preservation)
  // =========================================================================
  const collections = [
    {
      id: 'col-warm-minimal',
      slug: 'warm-minimalist-living',
      title: 'Warm Minimalist Living',
      subtitle: 'Low horizontal profiles in tactile Belgian bouclé and oiled American walnut.',
      image: '/images/rooms/veloura_luxury_living_room_hero.jpg',
      room: 'living-room',
      piecesCount: 15
    },
    {
      id: 'col-japandi-rest',
      slug: 'japandi-rest-sanctuary',
      title: 'Japandi Rest Sanctuary',
      subtitle: 'Low-profile platform beds with zero-creak acoustic timber slats and pure flax linens.',
      image: '/images/rooms/veloura_luxury_bedroom_hero.jpg',
      room: 'bedroom',
      piecesCount: 15
    },
    {
      id: 'col-generational-wood',
      slug: 'heirloom-gathering-table',
      title: 'Heirloom Gathering Table',
      subtitle: 'Continuous slab solid walnut dining tables with steam-bent supportive seating.',
      image: '/images/rooms/veloura_luxury_dining_hero.jpg',
      room: 'dining',
      piecesCount: 15
    },
    {
      id: 'col-executive-study',
      slug: 'executive-residential-focus',
      title: 'Executive Residential Focus',
      subtitle: 'Concealed power channels and saddle leather task ergonomics for deep work.',
      image: '/images/rooms/veloura_luxury_office_hero.jpg',
      room: 'office',
      piecesCount: 15
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B] bg-[#F5E6D3] px-3.5 py-1 rounded-full inline-block">
            Curated Themes
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#211E1B]">
            Aesthetic Collections
          </h1>
          <p className="text-sm text-[#746B61] leading-relaxed">
            Cohesive spatial edits curated around singular material and proportion themes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => {
                navigate(`/collections/${col.slug}`);
              }}
              className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-[#4A2C1A]/10 shadow-soft-sm hover:shadow-soft-xl transition-all duration-500 flex flex-col justify-between"
            >
              <div className="aspect-[16/10] bg-[#F7F4EF] overflow-hidden relative">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#4A2C1A] text-xs font-bold px-3 py-1 rounded-full">
                  {col.piecesCount} Curated Pieces
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-display font-bold text-2xl text-white group-hover:text-[#F5E6D3] transition-colors">
                    {col.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex items-center justify-between">
                <p className="text-xs text-[#746B61] max-w-sm">{col.subtitle}</p>
                <span className="text-xs font-bold text-[#8B5A2B] flex items-center gap-1 group-hover:translate-x-1.5 transition-transform flex-shrink-0">
                  Explore Collection Gallery <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
