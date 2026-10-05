'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ConfigurableFurniturePiece,
  LightingEnvironment,
} from '@/types/configurator';
import {
  CONFIGURABLE_PIECES,
  calculateConfiguredPrice,
} from '@/lib/data/configuratorMaterials';
import { ThreeStudioViewport, ThreeStudioViewportHandle } from '@/components/three/configurator/ThreeStudioViewport';
import { ConfiguratorSidebar } from '@/components/three/configurator/ConfiguratorSidebar';
import { ARPlacementModal } from '@/components/three/configurator/ARPlacementModal';
import { ARBridgeService } from '@/lib/services/arBridgeService';
import { useStore } from '@/providers/AppProvider';
import { Product } from '@/types';
import { ArrowLeft, Sparkles, Share2, Check } from 'lucide-react';
import Link from 'next/link';

export const ConfiguratorStudioPage: React.FC = () => {
  const searchParams = useSearchParams();
  const viewportRef = useRef<ThreeStudioViewportHandle>(null);
  const { allProducts, addToCart, setIsCartOpen } = useStore();

  const pieceParam = searchParams.get('piece') || searchParams.get('slug');
  const initialPiece =
    CONFIGURABLE_PIECES.find((p) => p.id === pieceParam || p.slug === pieceParam) ||
    CONFIGURABLE_PIECES[0];

  const [activePiece, setActivePiece] = useState<ConfigurableFurniturePiece>(initialPiece);
  const [partMaterials, setPartMaterials] = useState<Record<string, string>>(() => {
    const fromUrl = ARBridgeService.deserializeConfigFromQuery(new URLSearchParams(searchParams.toString()));
    return Object.keys(fromUrl).length > 0 ? fromUrl : initialPiece.defaultConfiguration;
  });

  const [lighting, setLighting] = useState<LightingEnvironment>('morning-sun');
  const [showCalipers, setShowCalipers] = useState<boolean>(true);
  const [explodedProgress, setExplodedProgress] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isARModalOpen, setIsARModalOpen] = useState<boolean>(false);
  const [sharedToast, setSharedToast] = useState<boolean>(false);

  // Sync state if URL param changes
  useEffect(() => {
    if (pieceParam) {
      const found = CONFIGURABLE_PIECES.find((p) => p.id === pieceParam || p.slug === pieceParam);
      if (found && found.id !== activePiece.id) {
        setActivePiece(found);
        setPartMaterials(found.defaultConfiguration);
      }
    }
  }, [pieceParam, activePiece.id]);

  const handleSelectPiece = (piece: ConfigurableFurniturePiece) => {
    setActivePiece(piece);
    setPartMaterials(piece.defaultConfiguration);
    setExplodedProgress(0);
    if (viewportRef.current) {
      viewportRef.current.resetCamera();
    }
  };

  const handleSelectMaterial = (partId: string, materialId: string) => {
    setPartMaterials((prev) => ({
      ...prev,
      [partId]: materialId,
    }));
  };

  const handleResetCamera = () => {
    if (viewportRef.current) {
      viewportRef.current.resetCamera();
    }
  };

  const handleCaptureSnapshot = () => {
    if (!viewportRef.current) return;
    const dataUrl = viewportRef.current.captureSnapshot();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `veloura-custom-${activePiece.slug}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = () => {
    const query = ARBridgeService.serializeConfigToQuery(partMaterials);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/configurator?piece=${activePiece.id}&${query}`;

    navigator.clipboard.writeText(shareUrl);
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 2500);
  };

  const handleAddToCart = () => {
    const priceCalc = calculateConfiguredPrice(activePiece, partMaterials);

    // Find base catalog product or synthesize high-fidelity customized entity
    const existingProduct = allProducts.find((p) => p.slug === activePiece.slug || p.name.includes(activePiece.name.split(' ')[0]));

    const customProduct: Product = existingProduct
      ? {
          ...existingProduct,
          price: priceCalc.finalPriceINR,
          salePrice: undefined,
          name: `${activePiece.name} (Custom Atelier)`,
        }
      : {
          id: `prod-custom-${activePiece.id}-${Date.now()}`,
          sku: `VL-3D-${activePiece.slug.toUpperCase().slice(0, 8)}`,
          name: `${activePiece.name} (Custom Atelier)`,
          slug: activePiece.slug,
          category: activePiece.room === 'dining' ? 'Dining' : 'Seating',
          room: (activePiece.room === 'dining' ? 'dining' : activePiece.room === 'office' ? 'office' : 'living') as any,
          furnitureType: activePiece.name,
          price: priceCalc.finalPriceINR,
          rating: 5.0,
          reviewCount: 1,
          stock: 5,
          availability: 'made_to_order',
          isNew: true,
          featured: true,
          images: ['/images/materials/veloura_swatch_walnut.jpg'],
          colors: ['Custom Finish'],
          materials: ['Solid Hardwood', 'Custom Upholstery'],
          dimensions: {
            width: `${activePiece.dimensions.widthCm} cm`,
            depth: `${activePiece.dimensions.depthCm} cm`,
            height: `${activePiece.dimensions.heightCm} cm`,
          },
          tags: ['Custom', '3D Configurator', 'Atelier'],
          description: activePiece.description,
          story: activePiece.tagline,
          craftsmanship: 'Custom tailored architectural piece manufactured to order.',
          care: 'Wipe with soft lint-free microfiber cloth.',
          shippingEstimate: '4-6 Weeks Custom Atelier Build',
          warranty: '10-Year Structural Frame Warranty',
          variants: [],
          complementaryProductIds: [],
        };

    // Custom synthetic variant capturing all configured materials
    const customVariant = {
      id: `var-custom-${Date.now()}`,
      name: `${activePiece.name} — Custom Spec`,
      productId: customProduct.id,
      colorName: 'Atelier Custom',
      colorHex: '#8B5A2B',
      material: Object.values(partMaterials).join(', '),
      price: priceCalc.finalPriceINR,
      sku: `VL-3D-${activePiece.slug.toUpperCase().slice(0, 8)}-${Date.now().toString().slice(-4)}`,
      stock: 5,
      image: '/images/materials/veloura_swatch_walnut.jpg',
    };

    addToCart(customProduct, customVariant, 1);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#FAF7F2] flex flex-col">
      {/* 3D Studio Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Left: Sticky 3D Viewport */}
        <section className="flex-1 relative min-h-[520px] lg:min-h-[calc(100vh-130px)] lg:sticky lg:top-20 bg-radial from-[#281C15]/55 via-[#130F0C] to-[#0A0807] flex items-center justify-center select-none overflow-hidden">
          {/* Floating Top Bar Controls inside Canvas */}
          <div className="absolute top-5 inset-x-6 z-20 flex items-center justify-between pointer-events-none">
            <Link
              href="/shop"
              className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#16120E]/85 backdrop-blur-md border border-white/10 hover:border-[#8B5A2B]/60 text-xs text-stone-300 hover:text-white transition-all shadow-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Catalog</span>
            </Link>

            <button
              onClick={handleShare}
              className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#16120E]/85 backdrop-blur-md border border-white/10 hover:border-[#8B5A2B]/60 text-xs text-stone-300 hover:text-white transition-all cursor-pointer shadow-lg"
            >
              {sharedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{sharedToast ? 'Link Copied!' : 'Share Config'}</span>
            </button>
          </div>

          <ThreeStudioViewport
            ref={viewportRef}
            piece={activePiece}
            partMaterials={partMaterials}
            lighting={lighting}
            showCalipers={showCalipers}
            explodedProgress={explodedProgress}
            autoRotate={autoRotate}
          />
        </section>

        {/* Right: Configurator Sidebar */}
        <ConfiguratorSidebar
          pieces={CONFIGURABLE_PIECES}
          activePiece={activePiece}
          onSelectPiece={handleSelectPiece}
          partMaterials={partMaterials}
          onSelectMaterial={handleSelectMaterial}
          lighting={lighting}
          onChangeLighting={setLighting}
          showCalipers={showCalipers}
          onToggleCalipers={() => setShowCalipers((prev) => !prev)}
          explodedProgress={explodedProgress}
          onChangeExploded={setExplodedProgress}
          autoRotate={autoRotate}
          onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
          onResetCamera={handleResetCamera}
          onOpenARModal={() => setIsARModalOpen(true)}
          onCaptureSnapshot={handleCaptureSnapshot}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* AR Placement Modal */}
      <ARPlacementModal
        isOpen={isARModalOpen}
        onClose={() => setIsARModalOpen(false)}
        piece={activePiece}
        partMaterials={partMaterials}
      />
    </div>
  );
};
