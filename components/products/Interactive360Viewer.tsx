'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useStore } from '@/hooks/useStore';
import { RotateCw, ZoomIn, Compass, ShoppingBag } from 'lucide-react';
import { triggerLuxuryToast } from '@/components/common/LuxuryToast';

interface Props {
  product: Product;
}

export const Interactive360Viewer: React.FC<Props> = ({ product }) => {
  const { addToCart, navigate } = useStore();
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const totalAngles = product.images.length > 1 ? product.images.length : 4;
  const angles = product.images.length > 1
    ? product.images
    : [
        product.images[0],
        product.images[0],
        product.images[0],
        product.images[0]
      ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - startX;
      if (Math.abs(deltaX) > 40) {
        if (deltaX > 0) {
          setCurrentAngleIndex((prev) => (prev + 1) % totalAngles);
        } else {
          setCurrentAngleIndex((prev) => (prev - 1 + totalAngles) % totalAngles);
        }
        setStartX(e.clientX);
      }
    }

    if (isZoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPos({ x, y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const calculatedAngleDegrees = Math.round((currentAngleIndex / totalAngles) * 360);

  return (
    <div className="bg-white rounded-3xl border border-[#4A2C1A]/10 shadow-soft-xl overflow-hidden p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEE9E1] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5A2B]/15 text-[#8B5A2B] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <RotateCw className="w-3 h-3" />
            360° Architectural Inspector
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#211E1B]">
            {product.name}
          </h3>
          <p className="text-xs text-[#746B61]">
            Drag horizontally to rotate camera angle or hover for 16K grain inspection.
          </p>
        </div>

        {/* Angle HUD badge */}
        <div className="flex items-center gap-3 bg-[#FCFAF7] px-4 py-2 rounded-2xl border border-[#EEE9E1] self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#9C9287] block">Perspective</span>
            <span className="font-mono text-sm font-bold text-[#4A2C1A]">{calculatedAngleDegrees}° Angle</span>
          </div>
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className={`p-2 rounded-xl transition-all ${
              isZoomed ? 'bg-[#8B5A2B] text-white shadow-sm' : 'bg-white text-[#514A43] hover:text-[#211E1B] border'
            }`}
            title="Toggle Micro-Texture Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive 360 Canvas Viewport */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-[#F7F4EF] overflow-hidden cursor-grab active:cursor-grabbing select-none border border-[#EEE9E1] group"
      >
        <img
          src={angles[currentAngleIndex]}
          alt={`${product.name} 360 rotation`}
          className="w-full h-full object-cover transition-transform duration-200"
          style={{
            transform: isZoomed
              ? `scale(2.2) translate(-${(zoomPos.x - 50) * 0.4}%, -${(zoomPos.y - 50) * 0.4}%)`
              : 'scale(1)',
          }}
        />

        {/* Drag Hint Overlay */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border border-white/20 shadow-lg group-hover:opacity-0 transition-opacity duration-300">
            <RotateCw className="w-3.5 h-3.5 text-[#EADBC8] animate-spin" style={{ animationDuration: '4s' }} />
            <span>Drag Left / Right to Inspect 360°</span>
          </div>
        </div>

        {/* Spatial Dimension Pins */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-white/50 text-[11px] text-[#4A2C1A] space-y-0.5">
          <span className="font-bold block text-[10px] uppercase text-[#8B5A2B]">Proportions</span>
          <div>W: {product.dimensions.width}</div>
          <div>D: {product.dimensions.depth}</div>
          <div>H: {product.dimensions.height}</div>
        </div>
      </div>

      {/* Quick Angle Selector Chips & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['Front (0°)', 'Perspective (90°)', 'Rear Timber (180°)', 'Detail Profile (270°)'].map((label, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentAngleIndex(idx % totalAngles)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentAngleIndex === (idx % totalAngles)
                  ? 'bg-[#4A2C1A] text-white shadow-sm'
                  : 'bg-[#FCFAF7] border border-[#EEE9E1] text-[#746B61] hover:bg-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/studio')}
            className="px-4 py-2.5 rounded-full border border-[#4A2C1A]/20 hover:bg-[#F7F4EF] text-xs font-semibold text-[#4A2C1A] flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Map in 2D Studio</span>
          </button>

          <button
            onClick={() => {
              addToCart(product);
              triggerLuxuryToast({
                type: 'cart',
                title: 'Added to Bag',
                subtitle: product.name,
                imageUrl: product.images[0],
                price: product.price,
              });
            }}
            className="btn-primary-shimmer px-5 py-2.5 rounded-full text-xs font-semibold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Quick Add • ₹{product.price.toLocaleString('en-IN')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default Interactive360Viewer;
