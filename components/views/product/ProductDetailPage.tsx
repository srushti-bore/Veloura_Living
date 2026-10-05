'use client';

import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { ProductCard } from '../../products/ProductCard';
import {
  Heart,
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Check,
  Plus,
  Minus,
  MessageSquare,
  Compass,
  Box,
} from 'lucide-react';
import { REVIEWS } from '../../../lib/data/mockData';
import { triggerLuxuryToast } from '../../common/LuxuryToast';
import { useCurrency } from '@/providers/CurrencyProvider';

interface Props {
  slug: string;
}

export const ProductDetailPage: React.FC<Props> = ({ slug }) => {
  const { allProducts, addToCart, isWishlisted, toggleWishlist, navigate, setIsAIOpen, setIsCartOpen } = useStore();
  const { formatPrice } = useCurrency();

  const product = allProducts.find((p) => p.slug === slug) || allProducts[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'story' | 'specs' | 'care' | 'shipping'>('story');
  const [isWishlistBurst, setIsWishlistBurst] = useState(false);

  const wishlisted = isWishlisted(product.id);

  const effectivePrice = selectedVariant?.salePrice || selectedVariant?.price || product.salePrice || product.price;
  const originalPrice = selectedVariant?.price || product.price;

  // Complementary Products for "Complete the Room"
  const complementaryProducts = allProducts.filter((p) =>
    product.complementaryProductIds.includes(p.id)
  );

  const productReviews = REVIEWS.filter((r) => r.productId === product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant || undefined, quantity);
    triggerLuxuryToast({
      type: 'cart',
      title: 'Added to Shopping Bag',
      subtitle: `${product.name} (Qty: ${quantity}${selectedVariant ? `, ${selectedVariant.name}` : ''})`,
      imageUrl: selectedVariant?.image || product.images[0],
      price: effectivePrice * quantity,
    });
  };

  const handleToggleWishlist = () => {
    setIsWishlistBurst(true);
    toggleWishlist(product.id);
    if (!wishlisted) {
      triggerLuxuryToast({
        type: 'wishlist-add',
        title: 'Saved to Wishlist',
        subtitle: product.name,
        imageUrl: product.images[0],
        price: effectivePrice,
      });
    } else {
      triggerLuxuryToast({
        type: 'wishlist-remove',
        title: 'Removed from Wishlist',
        subtitle: product.name,
      });
    }
    setTimeout(() => setIsWishlistBurst(false), 500);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant || undefined, quantity);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7] py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#9C9287]">
          <button onClick={() => navigate('/')} className="hover:text-[#4A2C1A] transition-colors cursor-pointer">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/shop')} className="hover:text-[#4A2C1A] transition-colors cursor-pointer">Shop</button>
          <span>/</span>
          <button onClick={() => navigate(`/rooms/${product.room}`)} className="hover:text-[#4A2C1A] capitalize transition-colors cursor-pointer">
            {product.room.replace('-', ' ')}
          </button>
          <span>/</span>
          <span className="text-[#211E1B] font-medium truncate">{product.name}</span>
        </div>

        {/* Product Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-[#4A2C1A]/10 shadow-soft-sm">
          {/* Left Gallery (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Main Image */}
            <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-[#F7F4EF] rounded-2xl overflow-hidden border border-[#EEE9E1] group">
              <img
                src={selectedVariant?.image || product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                {product.bestseller && (
                  <span className="bg-[#4A2C1A] text-[#F5E6D3] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md animate-badge-pop">
                    Signature Piece
                  </span>
                )}
                {product.salePrice && (
                  <span className="bg-[#8B5A2B] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md">
                    Privilege Savings
                  </span>
                )}
              </div>

              {/* Spatial AI Advisor Overlay */}
              <button
                onClick={() => setIsAIOpen(true)}
                className="absolute bottom-4 left-4 bg-white/90 hover:bg-white active:scale-95 backdrop-blur-md text-[#4A2C1A] text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all border border-[#8B5A2B]/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>Ask AI About Room Proportions</span>
              </button>
            </div>

            {/* Thumbnail Row */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F7F4EF] border-2 transition-all duration-200 flex-shrink-0 cursor-pointer interactive-pill ${
                    selectedImageIndex === idx
                      ? 'border-[#8B5A2B] ring-2 ring-[#8B5A2B]/20 shadow-md scale-100'
                      : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#DED7CD]'
                  }`}
                >
                  <img src={imgUrl} alt="Thumbnail angle" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Product Buying Actions (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-[#9C9287] mb-2">
                <span className="font-bold uppercase tracking-widest text-[#8B5A2B]">
                  {product.category} • {product.room.replace('-', ' ')}
                </span>
                <div className="flex items-center gap-1 text-[#A47A45]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-[#211E1B]">{product.rating}</span>
                  <span>({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Title & SKU */}
              <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[#211E1B] leading-tight mb-1">
                {product.name}
              </h1>
              <div className="text-[11px] text-[#9C9287] font-mono mb-4">
                SKU: {product.sku}
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 p-4 bg-[#FCFAF7] rounded-2xl border border-[#EEE9E1] mb-6">
                <span className="font-display font-bold text-2xl sm:text-3xl text-[#4A2C1A]">
                  {formatPrice(effectivePrice)}
                </span>
                {originalPrice > effectivePrice && (
                  <span className="text-sm text-[#9C9287] line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                <span className="text-[11px] text-[#557A5A] font-semibold ml-auto bg-[#557A5A]/10 px-2.5 py-0.5 rounded-full">
                  White-Glove Delivery Included
                </span>
              </div>

              {/* Material & Finish Selection */}
              {product.variants.length > 0 && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs font-semibold text-[#514A43]">
                    <span>Select Wood Finish & Material:</span>
                    <strong className="text-[#4A2C1A]">{selectedVariant?.name}</strong>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer interactive-swatch ${
                            isSelected
                              ? 'bg-white border-[#8B5A2B] ring-2 ring-[#8B5A2B]/20 text-[#4A2C1A] shadow-sm'
                              : 'bg-[#FCFAF7] border-[#EEE9E1] text-[#746B61] hover:bg-white hover:border-[#8B5A2B]/40'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 shadow-sm"
                            style={{ backgroundColor: v.colorHex }}
                          />
                          <span>{v.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#8B5A2B]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#DED7CD] rounded-xl bg-[#FCFAF7] p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-[#EEE9E1] active:scale-90 text-[#514A43] rounded-lg transition-all cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-bold text-sm text-[#211E1B]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-[#EEE9E1] active:scale-90 text-[#514A43] rounded-lg transition-all cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className="btn-primary-shimmer flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    <span>Add to Cart ({formatPrice(effectivePrice * quantity)})</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={handleToggleWishlist}
                    className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer active:scale-90 ${
                      isWishlistBurst ? 'animate-heart-burst' : ''
                    } ${
                      wishlisted
                        ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-md'
                        : 'bg-[#FCFAF7] text-[#514A43] border-[#DED7CD] hover:text-[#8B5A2B] hover:border-[#8B5A2B]'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-5 h-5 transition-transform ${wishlisted ? 'fill-current scale-110' : ''}`} />
                  </button>
                </div>

                {/* Buy Now Direct Button */}
                <button
                  onClick={handleBuyNow}
                  className="btn-primary-shimmer w-full py-3.5 rounded-xl font-semibold text-sm shadow-md text-center cursor-pointer active:scale-[0.98]"
                >
                  Buy Now with White-Glove Installation
                </button>

                {/* 3D Spatial Configurator CTA */}
                <button
                  onClick={() => navigate(`/configurator?slug=${product.slug}`)}
                  className="btn-brownish-shimmer w-full py-3.5 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase border border-[#D8B486]/50 hover:border-[#D8B486] flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer active:scale-[0.98]"
                >
                  <Box className="w-4 h-4 text-[#D8B486]" />
                  <span className="font-semibold tracking-wide">Customize in 3D Spatial Studio & AR</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#FAF7F2] animate-pulse" />
                </button>
              </div>
            </div>

            {/* Privilege Assurances */}
            <div className="pt-6 border-t border-[#EEE9E1] grid grid-cols-3 gap-2 text-center text-[11px] text-[#746B61]">
              <div className="space-y-1 p-2 rounded-xl hover:bg-[#FCFAF7] transition-colors">
                <Truck className="w-4 h-4 text-[#8B5A2B] mx-auto" />
                <span className="block font-medium">In-Home Assembly</span>
              </div>
              <div className="space-y-1 p-2 rounded-xl hover:bg-[#FCFAF7] transition-colors">
                <ShieldCheck className="w-4 h-4 text-[#8B5A2B] mx-auto" />
                <span className="block font-medium">10-Yr Guarantee</span>
              </div>
              <div className="space-y-1 p-2 rounded-xl hover:bg-[#FCFAF7] transition-colors">
                <RefreshCw className="w-4 h-4 text-[#8B5A2B] mx-auto" />
                <span className="block font-medium">30-Day In-Space Trial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specification & Story Tabs */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#4A2C1A]/10 shadow-soft-sm space-y-6">
          <div className="flex items-center gap-6 border-b border-[#EEE9E1] pb-4 overflow-x-auto">
            {[
              { id: 'story', label: 'Architectural Story' },
              { id: 'specs', label: 'Specifications & Dimensions' },
              { id: 'care', label: 'Wood & Textile Care' },
              { id: 'shipping', label: 'White-Glove Logistics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-sm font-bold tracking-wide transition-all duration-200 pb-1 border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#8B5A2B] text-[#4A2C1A]'
                    : 'border-transparent text-[#9C9287] hover:text-[#211E1B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-2 leading-relaxed text-sm text-[#514A43] animate-fadeIn">
            {activeTab === 'story' && (
              <div className="space-y-4 max-w-3xl">
                <p className="text-base text-[#211E1B] font-medium leading-relaxed">
                  {product.description}
                </p>
                <p>{product.story}</p>
                <div className="bg-[#FCFAF7] rounded-2xl p-5 border border-[#EEE9E1] mt-4">
                  <h4 className="font-display font-semibold text-sm text-[#4A2C1A] mb-1">
                    Craftsmanship Detail
                  </h4>
                  <p className="text-xs text-[#746B61]">{product.craftsmanship}</p>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#8B5A2B]">
                    Dimensions
                  </h4>
                  <ul className="text-xs space-y-1.5">
                    <li><strong>Overall Width:</strong> {product.dimensions.width}</li>
                    <li><strong>Overall Depth:</strong> {product.dimensions.depth}</li>
                    <li><strong>Overall Height:</strong> {product.dimensions.height}</li>
                    {product.dimensions.seatHeight && <li><strong>Seat Height:</strong> {product.dimensions.seatHeight}</li>}
                    {product.dimensions.weight && <li><strong>Total Weight:</strong> {product.dimensions.weight}</li>}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#8B5A2B]">
                    Materials & Warranty
                  </h4>
                  <ul className="text-xs space-y-1.5">
                    <li><strong>Primary Materials:</strong> {product.materials.join(', ')}</li>
                    <li><strong>Available Finishes:</strong> {product.colors.join(', ')}</li>
                    <li><strong>Warranty:</strong> {product.warranty}</li>
                    <li><strong>Assembly:</strong> Complimentary White-Glove Included</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-3 max-w-3xl text-xs sm:text-sm">
                <p>{product.care}</p>
                <p>Natural solid timber develops an heirloom patina with age. Avoid direct prolonged exposure to extreme dehumidifiers or open heating elements.</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3 max-w-3xl text-xs sm:text-sm">
                <p>{product.shippingEstimate}</p>
                <p>Our dedicated two-person white-glove team will unpack, place the furniture in your desired room location, perform all assembly, and remove all packing crates.</p>
              </div>
            )}
          </div>
        </div>

        {/* Complete the Room — Complementary Recommendations */}
        {complementaryProducts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#8B5A2B]">
                  Spatial Harmony
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#211E1B]">
                  Complete the Room
                </h2>
              </div>
              <button
                onClick={() => navigate(`/rooms/${product.room}`)}
                className="text-xs font-semibold text-[#8B5A2B] hover:text-[#4A2C1A] flex items-center gap-1 group cursor-pointer"
              >
                <span>View Full Room Staging</span>
                <span className="interactive-arrow">→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {complementaryProducts.map((comp) => (
                <ProductCard key={comp.id} product={comp} />
              ))}
            </div>
          </section>
        )}

        {/* Customer Reviews Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#4A2C1A]/10 shadow-soft-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EEE9E1]">
            <div>
              <h3 className="font-display font-bold text-2xl text-[#211E1B]">
                Architect & Client Reviews
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex text-[#A47A45]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#211E1B]">{product.rating} Out of 5.0</span>
                <span className="text-xs text-[#9C9287]">({product.reviewCount} verified homeowners)</span>
              </div>
            </div>

            <button
              onClick={() => alert('Review portal opened. Thank you for sharing your in-space experience.')}
              className="btn-secondary-refined active:scale-95 text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
            >
              Write In-Space Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productReviews.length > 0 ? (
              productReviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl bg-[#FCFAF7] border border-[#EEE9E1] space-y-3 interactive-card">
                  <div className="flex items-center justify-between">
                    <div className="flex text-[#A47A45]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#9C9287]">{rev.date}</span>
                  </div>
                  <h4 className="font-display font-semibold text-sm text-[#211E1B]">
                    {rev.title}
                  </h4>
                  <p className="text-xs text-[#746B61] leading-relaxed">
                    {rev.content}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-[#9C9287] pt-2 border-t border-[#EEE9E1]">
                    <span className="font-medium text-[#4A2C1A]">{rev.author} ({rev.city})</span>
                    <span className="text-[#557A5A]">Verified In-Home Delivery</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-6 text-xs text-[#9C9287]">
                Be the first to review this {product.name} in your living space.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
