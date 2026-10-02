'use client';

import { useStore } from './useStore';

export const useCart = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCount,
    discountAmount,
    shippingCost,
    cartTotal,
    appliedCoupon,
    applyCouponCode
  } = useStore();

  return {
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCount,
    discountAmount,
    shippingCost,
    cartTotal,
    appliedCoupon,
    applyCouponCode
  };
};
