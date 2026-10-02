'use client';

import React from 'react';
import { useStore } from '@/hooks/useStore';
import { X, Star, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

export const HotspotPreviewModal: React.FC = () => {
  const { previewProduct, setPreviewProduct, addToCart, navigate } = useStore();

  if (!previewProduct) return null;

  const formatPrice = (val: number) => '₹' + val.toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => setPreviewProduct(null)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#4A2C1A]/15 z-10 animate-scaleUp">
        <button
          onClick={() => setPreviewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white text-[#514A43] hover:text-[#211E1B] rounded-full shadow-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-[#F7F4EF] relative">
            <img
              src={previewProduct.images[0]}
              alt={previewProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-[#4A2C1A]/90 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
              {previewProduct.room.replace('-', ' ')}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-xs text-[#A47A45] mb-2">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-[#211E1B]">{previewProduct.rating}</span>
                <span className="text-[#9C9287]">({previewProduct.reviewCount} reviews)</span>
              </div>

              <h3 className="font-display font-bold text-xl sm:text-2xl text-[#211E1B] leading-tight mb-2">
                {previewProduct.name}
              </h3>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-xl font-bold text-[#4A2C1A]">
                  {formatPrice(previewProduct.salePrice || previewProduct.price)}
                </span>
                {previewProduct.salePrice && (
                  <span className="text-sm text-[#9C9287] line-through">
                    {formatPrice(previewProduct.price)}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#746B61] leading-relaxed line-clamp-3 mb-4">
                {previewProduct.description}
              </p>

              <div className="space-y-1.5 text-xs text-[#514A43] pt-3 border-t border-[#EEE9E1] mb-6">
                <div><strong>Materials:</strong> {previewProduct.materials.join(', ')}</div>
                <div><strong>Dimensions:</strong> {previewProduct.dimensions.width} W × {previewProduct.dimensions.depth} D × {previewProduct.dimensions.height} H</div>
                <div className="flex items-center gap-1 text-[#557A5A] pt-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{previewProduct.shippingEstimate}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  addToCart(previewProduct);
                  setPreviewProduct(null);
                }}
                className="w-full bg-[#4A2C1A] hover:bg-[#332E29] text-white py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                onClick={() => {
                  setPreviewProduct(null);
                  navigate(`/products/${previewProduct.slug}`);
                }}
                className="w-full bg-[#F7F4EF] hover:bg-[#EEE9E1] text-[#4A2C1A] py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Full Product Specifications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HotspotPreviewModal;
