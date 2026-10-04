'use client';

import React, { useState } from 'react';
import { Product, ProductVariant } from '@/types';
import { useStore } from '@/hooks/useStore';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { triggerLuxuryToast } from '@/components/common/LuxuryToast';

interface Props {
  product: Product;
  showRoomTag?: boolean;
}

export const ProductCard: React.FC<Props> = ({ product, showRoomTag = true }) => {
  const { navigate, toggleWishlist, isWishlisted, addToCart, setPreviewProduct } = useStore();

  const [activeVariant, setActiveVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const wishlisted = isWishlisted(product.id);

  const formatPrice = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartAnimating(true);
    toggleWishlist(product.id);

    if (!wishlisted) {
      triggerLuxuryToast({
        type: 'wishlist-add',
        title: 'Saved to Wishlist',
        subtitle: product.name,
        imageUrl: product.images[0],
        price: activeVariant?.price || product.price,
      });
    } else {
      triggerLuxuryToast({
        type: 'wishlist-remove',
        title: 'Removed from Wishlist',
        subtitle: product.name,
      });
    }

    setTimeout(() => setIsHeartAnimating(false), 500);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, activeVariant || undefined);
    triggerLuxuryToast({
      type: 'cart',
      title: 'Added to Shopping Bag',
      subtitle: `${product.name} ${activeVariant ? `(${activeVariant.colorName})` : ''}`,
      imageUrl: product.images[0],
      price: activeVariant?.salePrice || activeVariant?.price || product.salePrice || product.price,
    });
  };

  const sellingPrice = activeVariant?.salePrice || activeVariant?.price || product.salePrice || product.price;
  const originalPrice = (activeVariant?.salePrice && activeVariant?.price) ? activeVariant.price : (product.salePrice ? product.price : null);
  const discountPercent = originalPrice && originalPrice > sellingPrice
    ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
    : null;

  return (
    <div
      data-cursor="VIEW"
      className="product-card-item group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#4A2C1A]/10 hover:border-[#8B5A2B]/35 hover:-translate-y-1 transition-all duration-300 hover:shadow-soft-md"
    >
      {/* Image Container with 4:5 Aspect Ratio for 100% Uniform Height */}
      <div className="relative aspect-[4/5] bg-[#F7F4EF] overflow-hidden">
        {/* Main Image with Subtle Zoom on Hover (Restrained 1.02 scale) */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />

        {/* Secondary Image hover reveal (only when a distinct alternate angle exists) */}
        {product.images[1] && product.images[1] !== product.images[0] && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate angle`}
            loading="lazy"
            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out"
          />
        )}

        {/* Subtle glass vignette on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.bestseller && (
            <span className="bg-[#4A2C1A] text-[#F5E6D3] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
              Signature Piece
            </span>
          )}
          {product.salePrice && (
            <span className="bg-[#8B5A2B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              Privilege Offer
            </span>
          )}
          {showRoomTag && (
            <span className="bg-[#FBF8F3] text-[#4A2C1A] text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#4A2C1A]/10 shadow-xs">
              {product.room.replace('-', ' ')}
            </span>
          )}
        </div>

        {/* Wishlist Button with Tactile Response */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 cursor-pointer active:scale-95 ${
            isHeartAnimating ? 'animate-heart-burst' : ''
          } ${
            wishlisted
              ? 'bg-[#8B5A2B] text-white shadow-sm'
              : 'bg-white/85 text-[#514A43] hover:bg-white hover:text-[#8B5A2B] shadow-xs'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 transition-transform duration-200 ${wishlisted ? 'fill-current scale-105' : ''}`} />
        </button>

        {/* Floating Quick Action Buttons on Desktop Hover */}
        <div className="absolute bottom-3 inset-x-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
          <button
            onClick={handleQuickAdd}
            className="btn-primary-shimmer flex-1 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewProduct(product);
            }}
            className="btn-secondary-refined p-2 rounded-xl shadow-md cursor-pointer hover:border-[#8B5A2B]"
            title="Spatial Quickview"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Content (Standardized Luxury E-Commerce Layout) */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Brand Header & Rating */}
          <div className="flex items-center justify-between text-xs text-[#8E867E] mb-1">
            <span className="font-medium text-[#746B61] text-[11px] sm:text-xs uppercase tracking-wider">
              Veloura Living
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#A47A45] text-[#A47A45]" />
              <span className="font-semibold text-[#211E1B]">{product.rating}</span>
              <span className="text-[#9C9287]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title (2-Line Clamp for Consistent Height) */}
          <button
            onClick={() => navigate(`/products/${product.slug}`)}
            className="text-left font-display font-semibold text-sm sm:text-base text-[#211E1B] hover:text-[#8B5A2B] transition-colors leading-snug line-clamp-2 min-h-[2.6rem] block mb-1.5 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </button>

          {/* Material & Dimension snippet */}
          <p className="text-xs text-[#746B61] line-clamp-1 mb-3">
            {activeVariant?.material || product.materials[0]} • {product.dimensions.width} W × {product.dimensions.depth} D
          </p>
        </div>

        {/* Bottom Price & Swatches with Standardized E-Commerce Layout */}
        <div className="pt-3 border-t border-[#F7F4EF] flex items-center justify-between gap-2">
          <div className="flex items-baseline flex-wrap gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg font-bold text-[#211E1B]">
              {formatPrice(sellingPrice)}
            </span>
            {originalPrice && originalPrice > sellingPrice && (
              <span className="text-xs sm:text-sm text-[#9C9287] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            {discountPercent && discountPercent > 0 && (
              <span className="text-xs sm:text-sm font-bold text-[#2E7D32]">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Interactive Swatch Dots with Tactile Ring Animation */}
          {product.variants && product.variants.length > 0 ? (
            <div className="flex items-center gap-1.5" title={`${product.variants.length} finishes available`}>
              {product.variants.slice(0, 4).map((v) => {
                const isSelected = activeVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVariant(v);
                    }}
                    onMouseEnter={() => setActiveVariant(v)}
                    className={`relative w-4 h-4 rounded-full transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-[#8B5A2B] scale-110 shadow-sm'
                        : 'hover:scale-110 opacity-75 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: v.colorHex }}
                    aria-label={v.colorName}
                    title={v.colorName}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-1 h-1 bg-white rounded-full shadow-xs" />
                      </span>
                    )}
                  </button>
                );
              })}
              {product.variants.length > 4 && (
                <span className="text-[10px] text-[#9C9287] font-medium pl-0.5">
                  +{product.variants.length - 4}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-[#557A5A] font-medium bg-[#557A5A]/10 px-2 py-0.5 rounded-full flex-shrink-0">
              In Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
