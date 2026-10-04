/**
 * 🏛️ Veloura Living — Authoritative Pricing, Coupons & Checkout Calculation Store
 * Reference: docs/Veloura_Living_SRS.md (Section 12, 23, 32, Phase 5)
 */

import { DbCoupon, PaymentMethodEnum } from '@/types';
import { SEED_COUPONS } from './dbSeedData';
import { getCart, AuthoritativeCart } from './shoppingStore';
import { findUserById } from './authStore';
import { currencyEngine } from '@/lib/services/currencyEngine';
import { codSafetyService } from '@/lib/services/codService';

export interface CheckoutSummaryResult {
  cart: AuthoritativeCart;
  subtotal: number;
  discount: {
    code?: string;
    type?: 'PERCENTAGE' | 'FIXED';
    value?: number;
    amount: number;
    applied: boolean;
    message?: string;
  };
  tax: {
    rate: number; // 0.18 for 18% GST
    type: 'GST (9% CGST + 9% SGST)' | 'IGST (18%)';
    amount: number;
  };
  shipping: {
    method: string;
    carrier: string;
    amount: number;
    description: string;
    is_complimentary: boolean;
  };
  cod?: {
    eligible: boolean;
    fee: number;
    reason?: string;
  };
  grand_total: number;
  currency: string;
  converted_total?: number;
  formatted_total?: string;
  is_valid: boolean;
  errors: string[];
}

let couponsStore: DbCoupon[] = [];
let isPricingInitialized = false;

export function initPricingStore() {
  if (isPricingInitialized) return;
  isPricingInitialized = true;
  couponsStore = [...SEED_COUPONS];
}

// ============================================================================
// COUPONS
// ============================================================================

export function getCoupons(activeOnly = true): DbCoupon[] {
  initPricingStore();
  if (activeOnly) {
    return couponsStore.filter((c) => c.is_active);
  }
  return [...couponsStore];
}

export function getCouponByCode(code: string): DbCoupon | undefined {
  initPricingStore();
  return couponsStore.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
}

export function createCoupon(data: Omit<DbCoupon, 'id' | 'created_at' | 'usage_count'>): DbCoupon {
  initPricingStore();
  const newCoupon: DbCoupon = {
    ...data,
    id: crypto.randomUUID(),
    code: data.code.toUpperCase().trim(),
    usage_count: 0,
    created_at: new Date().toISOString(),
  };
  couponsStore.push(newCoupon);
  return newCoupon;
}

export function validateCoupon(
  code: string,
  subtotal: number,
  userId?: string
): { isValid: boolean; discountAmount: number; coupon?: DbCoupon; message: string } {
  initPricingStore();
  const coupon = getCouponByCode(code);

  if (!coupon) {
    return { isValid: false, discountAmount: 0, message: `Coupon code '${code}' is invalid.` };
  }

  if (!coupon.is_active) {
    return { isValid: false, discountAmount: 0, message: 'This coupon is no longer active.' };
  }

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { isValid: false, discountAmount: 0, message: 'This promotional offer has not started yet.' };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { isValid: false, discountAmount: 0, message: 'This coupon code has expired.' };
  }

  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { isValid: false, discountAmount: 0, message: 'Coupon usage limit has been reached.' };
  }

  if (coupon.min_order_value && subtotal < coupon.min_order_value) {
    return {
      isValid: false,
      discountAmount: 0,
      message: `Minimum order value of ₹${coupon.min_order_value.toLocaleString('en-IN')} required to apply ${coupon.code}.`,
    };
  }

  let discountAmount = 0;
  if (coupon.discount_type === 'PERCENTAGE') {
    discountAmount = (subtotal * coupon.discount_value) / 100;
    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
      discountAmount = coupon.max_discount_amount;
    }
  } else {
    discountAmount = coupon.discount_value;
  }

  // Ensure discount does not exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  return {
    isValid: true,
    discountAmount: Math.round(discountAmount),
    coupon,
    message: `${coupon.code} applied successfully! You saved ₹${Math.round(discountAmount).toLocaleString('en-IN')}.`,
  };
}

// ============================================================================
// AUTHORITATIVE CHECKOUT CALCULATION
// ============================================================================

export function calculateAuthoritativeCheckout(params: {
  ownerKey: string;
  shippingAddressId?: string;
  shippingMethod?: 'standard' | 'express' | 'fragile';
  couponCode?: string;
  paymentMethod?: PaymentMethodEnum;
  targetCurrency?: string;
}): CheckoutSummaryResult {
  const { ownerKey, shippingAddressId, shippingMethod = 'standard', couponCode, paymentMethod, targetCurrency = 'INR' } = params;
  const cart = getCart(ownerKey);

  const errors: string[] = [];
  if (cart.items.length === 0) {
    errors.push('Your cart is empty. Please add items before proceeding to checkout.');
  }

  // 1. Subtotal calculation
  const subtotal = cart.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  // 2. Coupon Validation & Discount
  let discountAmount = 0;
  let discountDetails: CheckoutSummaryResult['discount'] = {
    amount: 0,
    applied: false,
  };

  if (couponCode && couponCode.trim()) {
    const couponRes = validateCoupon(couponCode, subtotal, ownerKey);
    if (couponRes.isValid) {
      discountAmount = couponRes.discountAmount;
      discountDetails = {
        code: couponRes.coupon?.code,
        type: couponRes.coupon?.discount_type,
        value: couponRes.coupon?.discount_value,
        amount: discountAmount,
        applied: true,
        message: couponRes.message,
      };
    } else {
      discountDetails = {
        code: couponCode,
        amount: 0,
        applied: false,
        message: couponRes.message,
      };
    }
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  // 3. Tax Calculation (GST 18%)
  const taxAmount = Math.round(taxableAmount * 0.18);

  // 4. Shipping Tier Selection (Aligned with SRS v1.1 CHK-003 & PRC-006: Flat ₹199, Free >= ₹2,999, International ₹5,000)
  let shippingCost = 0;
  let shippingDescription = 'Complimentary White-Glove Delivery (Order above ₹2,999 threshold)';
  let isComplimentary = true;

  if (shippingMethod === ('international' as any)) {
    shippingCost = 5000;
    shippingDescription = 'Fixed International Priority Freight & Courier (₹5,000 flat)';
    isComplimentary = false;
  } else if (shippingMethod === 'express') {
    shippingCost = 999;
    shippingDescription = 'Express Priority Delivery (Within 48 Hours)';
    isComplimentary = false;
  } else if (shippingMethod === 'fragile') {
    shippingCost = 1499;
    shippingDescription = 'Specialized White-Glove Fragile Art & Mirror Assembly';
    isComplimentary = false;
  } else {
    // Standard domestic shipping (CHK-003: ₹199 flat, free for orders of ₹2,999 or more)
    if (subtotal < 2999 && subtotal > 0) {
      shippingCost = 199;
      shippingDescription = 'Standard Domestic Shipping (Orders below ₹2,999 threshold)';
      isComplimentary = false;
    } else {
      shippingCost = 0;
      shippingDescription = 'Complimentary Standard Domestic Shipping (Orders ₹2,999 or more)';
      isComplimentary = true;
    }
  }

  // 5. COD Handling Fee & Eligibility Calculation
  let codInfo: CheckoutSummaryResult['cod'] = undefined;
  let codFee = 0;

  if (paymentMethod === 'COD') {
    const eligibility = codSafetyService.checkEligibility(taxableAmount);
    codFee = eligibility.handlingFee;
    codInfo = {
      eligible: eligibility.eligible,
      fee: eligibility.handlingFee,
      reason: eligibility.reason,
    };
    if (!eligibility.eligible && eligibility.reason) {
      errors.push(eligibility.reason);
    }
  }

  // 6. Final Authoritative Grand Total
  const grandTotal = taxableAmount + taxAmount + shippingCost + codFee;

  // 7. Multi-Currency Conversion
  const convertedTotal = currencyEngine.convertFromINR(grandTotal, targetCurrency);
  const formattedTotal = currencyEngine.formatPrice(grandTotal, targetCurrency);

  return {
    cart,
    subtotal,
    discount: discountDetails,
    tax: {
      rate: 0.18,
      type: 'GST (9% CGST + 9% SGST)',
      amount: taxAmount,
    },
    shipping: {
      method: shippingMethod,
      carrier: 'Veloura White-Glove Logistics',
      amount: shippingCost,
      description: shippingDescription,
      is_complimentary: isComplimentary,
    },
    cod: codInfo,
    grand_total: grandTotal,
    currency: targetCurrency,
    converted_total: convertedTotal,
    formatted_total: formattedTotal,
    is_valid: errors.length === 0,
    errors,
  };
}

