'use client';

import React, { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount,
    discountAmount,
    shippingCost,
    cartTotal,
    appliedCoupon,
    applyCouponCode,
    navigate
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; text: string } | null>(null);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 2999;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput);
    setCouponMessage({ success: res.success, text: res.message });
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-out Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FCFAF7] shadow-2xl flex flex-col justify-between animate-slideLeft border-l border-[#4A2C1A]/10">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white border-b border-[#EEE9E1] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8B5A2B]" />
              <h2 className="font-display font-bold text-lg text-[#4A2C1A]">
                Your Room Selection ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#9C9287] hover:text-[#211E1B] rounded-full hover:bg-[#F7F4EF] transition-all duration-300 hover:rotate-90 cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-[#F5E6D3]/60 px-5 py-3 border-b border-[#EADBC8]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#4A2C1A] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#8B5A2B]" />
                {cartSubtotal >= freeShippingThreshold ? (
                  <span className="text-[#557A5A] font-bold">Complimentary White-Glove Delivery Unlocked!</span>
                ) : (
                  <span>Add ₹{remainingForFreeShipping.toLocaleString('en-IN')} for Free White-Glove Care</span>
                )}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#EADBC8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8B5A2B] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Scrollable Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#F5E6D3] flex items-center justify-center text-[#8B5A2B] mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-display font-bold text-lg text-[#4A2C1A]">
                  Your room is waiting to be completed.
                </h3>
                <p className="text-xs text-[#9C9287] max-w-xs mt-1.5 leading-relaxed">
                  Discover heirloom solid wood tables, cloud-soft bouclé seating, and architectural lighting.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="mt-6 btn-primary-shimmer text-white text-xs font-semibold px-6 py-3 rounded-full shadow-md flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 interactive-arrow" />
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EEE9E1] shadow-soft-sm flex gap-3 sm:gap-4 relative group interactive-card hover:border-[#8B5A2B]/30"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-[#F7F4EF] flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display font-semibold text-sm text-[#211E1B] truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#9C9287] hover:text-[#A6544D] p-1 transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#746B61] mt-0.5 space-x-2">
                        <span>Finish: {item.selectedColor}</span>
                        <span>•</span>
                        <span>{item.selectedMaterial}</span>
                      </div>
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F7F4EF] mt-2">
                      <div className="flex items-center border border-[#DED7CD] rounded-lg bg-[#FCFAF7]">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#EEE9E1] active:scale-90 text-[#514A43] rounded-l-lg transition-all cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-[#211E1B]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#EEE9E1] active:scale-90 text-[#514A43] rounded-r-lg transition-all cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-[#4A2C1A]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Summary & Checkout Section */}
          {cart.length > 0 && (
            <div className="bg-white p-5 sm:p-6 border-t border-[#EEE9E1] space-y-4">
              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#9C9287] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon / Privilege Code"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#FCFAF7] border border-[#DED7CD] rounded-xl focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20 uppercase font-medium text-[#211E1B] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-secondary-refined active:scale-95 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {couponMessage && (
                <div className={`text-xs px-3 py-1.5 rounded-lg animate-fadeIn ${couponMessage.success ? 'bg-[#557A5A]/10 text-[#557A5A]' : 'bg-[#A6544D]/10 text-[#A6544D]'}`}>
                  {couponMessage.text}
                </div>
              )}

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-[#F5E6D3]/70 px-3 py-2 rounded-xl text-[#4A2C1A] font-medium animate-badge-pop">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" />
                    {appliedCoupon.code} Applied
                  </span>
                  <span className="font-bold text-[#557A5A]">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-[#746B61] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#211E1B]">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#557A5A]">
                    <span>Privilege Savings</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>White-Glove Delivery & Installation</span>
                  <span>
                    {shippingCost === 0 ? (
                      <strong className="text-[#557A5A] uppercase tracking-wider text-[11px]">Complimentary</strong>
                    ) : (
                      `₹${shippingCost.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#211E1B] pt-2 border-t border-[#EEE9E1]">
                  <span>Total Investment</span>
                  <span className="text-base text-[#4A2C1A]">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={handleProceedToCheckout}
                className="btn-primary-shimmer w-full text-white py-3.5 px-4 rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
              >
                <span>Proceed to White-Glove Checkout</span>
                <ArrowRight className="w-4 h-4 interactive-arrow" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9C9287]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B5A2B]" />
                <span>10-Year Warranty • Secure Encrypted Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CartDrawer;
