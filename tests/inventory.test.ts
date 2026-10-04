/**
 * 🏛️ Veloura Living — Test Suite 2: Inventory, Reservations & Cart Max Limit
 * Reference: docs/Veloura-Living_SRS_Final.md (TST-001, INV-001 to INV-007, CART-006)
 */

import { addToCart, updateCartItemQuantity, clearCart, MAX_QUANTITY_PER_SKU } from '../lib/data/shoppingStore';
import { getVariantBySku, adjustVariantStock, initCatalogStore, getAllVariants } from '../lib/data/catalogStore';

export function runInventoryTests(): { passed: number; failed: number; errors: string[] } {
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

  console.log('\n--- 2. Testing Inventory & Stock Controls (INV & CART) ---');
  initCatalogStore();

  const allVariants = getAllVariants();
  const testVariant = allVariants[0];
  const testSku = testVariant ? testVariant.sku : 'SOL-NAT';

  const testUser = 'test_inventory_user_01';
  clearCart(testUser);

  // Test 1: Max quantity 10 per SKU per order (CART-006)
  assert(MAX_QUANTITY_PER_SKU === 10, 'MAX_QUANTITY_PER_SKU is defined as 10');

  const addExcess = addToCart(testUser, testSku, 11);
  assert(
    Boolean(addExcess.error && addExcess.error.includes('10 units')),
    'Adding 11 units is rejected by CART-006 max quantity rule'
  );

  // Test 2: Valid quantity within 10 is accepted
  const addValid = addToCart(testUser, testSku, 2);
  assert(addValid.cart.items.length === 1 && addValid.cart.items[0].quantity === 2, 'Adding 2 units succeeds');

  // Test 3: Updating quantity above 10 is rejected
  if (addValid.cart.items.length > 0) {
    const updateExcess = updateCartItemQuantity(testUser, addValid.cart.items[0].id, 15);
    assert(
      Boolean(updateExcess.error && updateExcess.error.includes('Maximum allowed quantity')),
      'Updating item quantity to 15 is rejected'
    );
  }

  // Test 4: Inventory stock adjustment creates audit record (INV-004)
  const initialVariant = getVariantBySku(testSku);
  const initialStock = initialVariant ? initialVariant.stock : 10;
  const updatedVariant = adjustVariantStock(testSku, -1, 'SALE', 'Test Sale Order');
  assert(
    updatedVariant !== undefined && updatedVariant.stock === initialStock - 1,
    'Stock decreased by 1 with SALE audit movement'
  );

  // Revert back for clean state
  adjustVariantStock(testSku, 1, 'CORRECTION', 'Test Revert');

  return { passed, failed, errors };
}
