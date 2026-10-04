/**
 * 🏛️ Veloura Living — Test Suite 4: Post-Purchase, Returns, Reviews & Invoicing
 * Reference: docs/Veloura-Living_SRS_Final.md (TST-001, RET-001 to RET-006, REV-001 to REV-004, DOC-001 to DOC-003)
 */

import {
  getCategoryReturnWindow,
  createReturnRequest,
  createReview,
  initPostPurchaseStore,
} from '../lib/data/postPurchaseStore';
import { generateGstInvoiceForOrder } from '../lib/services/invoiceService';

export function runPostPurchaseTests(): { passed: number; failed: number; errors: string[] } {
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

  console.log('\n--- 4. Testing Post-Purchase, Returns & Invoicing (RET, REV, DOC) ---');
  initPostPurchaseStore();

  // Test 1: Category-Wise Return Windows (RET-001)
  assert(getCategoryReturnWindow('Solis Bouclé Lounge Chair') === 7, 'Furniture return window is 7 days');
  assert(getCategoryReturnWindow('Astrid Brass Mirror') === 10, 'Decor/Mirror return window is 10 days');
  assert(getCategoryReturnWindow('Merino Wool Textured Rug') === 14, 'Textiles/Rug return window is 14 days');

  // Test 2: Verified purchase reviews check (REV-001, REV-003)
  const review = createReview({
    productId: '99999999-9999-9999-9999-999999999901',
    userId: '33333333-3333-3333-3333-333333333303',
    rating: 5,
    title: 'Flawless Bouclé Quality',
    comment: 'The craftsmanship exceeded our expectations for our gallery room.',
  });
  assert(review.id.startsWith('rev-') && review.rating === 5, 'Verified purchase review created with star rating');

  // Test 3: GST Invoicing generation (DOC-001, DOC-003)
  const invoice = generateGstInvoiceForOrder('44444444-1111-1111-1111-111111111101');
  assert(invoice !== null, 'GST Invoice generated for order');
  if (invoice) {
    assert(invoice.invoiceNumber.startsWith('VL/'), `Invoice number generated with FY sequence: ${invoice.invoiceNumber}`);
    assert(invoice.sellerDetails.gstin.length > 0, `Seller GSTIN included: ${invoice.sellerDetails.gstin}`);
    assert(invoice.items.length > 0 && invoice.grandTotal > 0, 'Invoice itemized lines and grand total populated');
  }

  return { passed, failed, errors };
}
