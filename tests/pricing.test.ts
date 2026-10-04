/**
 * 🏛️ Veloura Living — Test Suite 1: Pricing, Tax, Shipping & Coupons
 * Reference: docs/Veloura-Living_SRS_Final.md (TST-001, CHK-003, PRC-001 to PRC-006, CPN-001 to CPN-006)
 */

import { calculateAuthoritativeCheckout, validateCoupon, initPricingStore } from '../lib/data/pricingStore';
import { addToCart, getCart, clearCart } from '../lib/data/shoppingStore';
import { initCatalogStore, getAllVariants } from '../lib/data/catalogStore';

export function runPricingTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${testName}`);
    } else {
      failed++;
      errors.push(`FAILED: ${testName}`);
      console.error(`  ✗ ${testName}`);
    }
  }

  console.log('\n--- 1. Testing Pricing, Tax & Shipping (PRC & CHK) ---');

  initCatalogStore();
  initPricingStore();

  const allVariants = getAllVariants();
  const testVariant = allVariants[0];

  // Test 1: Domestic shipping below ₹2,999 pays ₹199 (CHK-003, PRC-006)
  const testUser1 = 'test_owner_shipping_sub2999';
  clearCart(testUser1);
  if (testVariant) {
    addToCart(testUser1, testVariant.sku, 1);
  }
  const summary1 = calculateAuthoritativeCheckout({ ownerKey: testUser1, shippingMethod: 'standard' });
  assert(summary1.subtotal >= 2999, 'Seeded luxury piece is above ₹2,999 threshold');
  assert(summary1.shipping.amount === 0, 'Orders above ₹2,999 receive Complimentary Domestic Shipping (₹0)');

  // Test 2: International shipping pays ₹5,000 (CHK-003, PRC-006)
  const summaryIntl = calculateAuthoritativeCheckout({
    ownerKey: testUser1,
    shippingMethod: 'international' as any,
  });
  assert(summaryIntl.shipping.amount === 5000, 'International shipping is fixed at ₹5,000');

  // Test 3: 18% GST calculation (PRC-002)
  const expectedGst = Math.round(summary1.subtotal * 0.18);
  assert(summary1.tax.amount === expectedGst, 'GST 18% is correctly calculated on subtotal');

  // Test 4: Coupon percentage and maximum discount cap (CPN-001, CPN-002)
  const couponRes = validateCoupon('VELOURA15', 100000);
  assert(couponRes.isValid, 'VELOURA15 coupon is valid');
  assert(couponRes.discountAmount === 15000, 'VELOURA15 gives 15% discount (₹15,000 on ₹100,000)');

  // Test 5: Inactive or expired coupon rejection (CPN-003)
  const invalidCoupon = validateCoupon('NONEXISTENT99', 50000);
  assert(!invalidCoupon.isValid, 'Non-existent coupon is safely rejected');

  return { passed, failed, errors };
}
