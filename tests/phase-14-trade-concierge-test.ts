/**
 * 🏛️ Veloura Living — Phase 14 Automated Test Suite
 * VIP Concierge & Interior Designer Trade B2B Portal
 */

import { TradeStore } from '../lib/data/tradeStore';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runPhase14Tests() {
  console.log('\n🏛️ =========================================================================');
  console.log('🏛️ VELOURA LIVING — PHASE 14 VIP CONCIERGE & TRADE B2B TEST SUITE');
  console.log('🏛️ =========================================================================\n');

  // --- 1. Trade Tier Determination Matrix ---
  console.log('📦 1. Testing Trade Privilege Tier Matrix...');
  const bronze = TradeStore.determineTier(600000);
  assert(bronze.tier === 'BRONZE_15', 'Orders under ₹10L receive BRONZE_15 Tier');
  assert(bronze.discountRate === 0.15, 'BRONZE_15 discount rate is 15% (0.15)');

  const silver = TradeStore.determineTier(1500000);
  assert(silver.tier === 'SILVER_20', 'Orders between ₹10L and ₹25L receive SILVER_20 Tier');
  assert(silver.discountRate === 0.2, 'SILVER_20 discount rate is 20% (0.20)');

  const gold = TradeStore.determineTier(3200000);
  assert(gold.tier === 'GOLD_25', 'Orders over ₹25L receive GOLD_25 Tier');
  assert(gold.discountRate === 0.25, 'GOLD_25 discount rate is 25% (0.25)');

  // --- 2. Trade Partner Registration & Retrieval ---
  console.log('\n📦 2. Testing Trade Partner Registration & Retrieval...');
  const newPartner = TradeStore.registerTradePartner({
    businessName: 'Atelier Aurelia Studio',
    contactPerson: 'Ar. Sophia Chen',
    email: 'sophia@aureliadesign.com',
    phone: '+91 98333 44556',
    tradeRole: 'ARCHITECT',
    gstin: '27AABCA5678F1Z2',
    websiteOrPortfolio: 'https://aureliadesign.com',
  });

  assert(!!newPartner.id, `Trade partner ID generated: ${newPartner.id}`);
  assert(newPartner.verified === true, 'Trade partner is auto-verified');
  assert(newPartner.gstin === '27AABCA5678F1Z2', 'GSTIN recorded in uppercase');
  assert(!!newPartner.dedicatedManagerName, 'Dedicated trade manager assigned');

  const retrieved = TradeStore.getTradePartner('sophia@aureliadesign.com');
  assert(retrieved?.businessName === 'Atelier Aurelia Studio', 'Partner successfully retrieved by email');

  // Idempotent re-registration returns existing
  const duplicate = TradeStore.registerTradePartner({
    businessName: 'Atelier Aurelia Studio',
    contactPerson: 'Ar. Sophia Chen',
    email: 'sophia@aureliadesign.com',
    phone: '+91 98333 44556',
    tradeRole: 'ARCHITECT',
    gstin: '27AABCA5678F1Z2',
  });
  assert(duplicate.id === newPartner.id, 'Re-registration returns existing partner ID without duplication');

  // --- 3. Project RFQ & Bill of Materials Calculation ---
  console.log('\n📦 3. Testing Project RFQ Calculation & GST Breakdown...');
  const lineItems = [
    {
      productId: 'prod-lr-01',
      productName: 'Serpentine Modular Sectional Sofa',
      sku: 'VL-LR-SF-001-OAT',
      customFinish: 'Belgian Bouclé & Solid Walnut',
      unitBasePriceINR: 185000,
      quantity: 3,
    },
    {
      productId: 'prod-din-01',
      productName: 'Aurelia Sculptural Dining Table',
      sku: 'VL-DN-TBL-001-TRA',
      customFinish: 'Honed Roman Travertine',
      unitBasePriceINR: 145000,
      quantity: 2,
    },
    {
      productId: 'prod-off-01',
      productName: 'Zenith Swivel Atelier Lounge Chair',
      sku: 'VL-OF-CHR-001-SAD',
      customFinish: 'Tuscan Saddle Leather',
      unitBasePriceINR: 94000,
      quantity: 4,
    },
  ];

  // Expected Math:
  // Subtotal = (185000 * 3) + (145000 * 2) + (94000 * 4) = 555000 + 290000 + 376000 = 12,21,000 INR
  // Subtotal > 10L => 20% Silver Tier Discount = 1221000 * 0.20 = 2,44,200 INR
  // Taxable = 1221000 - 244200 = 9,76,800 INR
  // 18% GST = 976800 * 0.18 = 1,75,824 INR
  // Shipping (Taxable >= 5L) = 0 INR
  // Grand Total = 976800 + 175824 = 11,52,624 INR

  const rfq = TradeStore.createProjectRFQ({
    tradePartnerId: newPartner.id,
    businessName: newPartner.businessName,
    contactPerson: newPartner.contactPerson,
    email: newPartner.email,
    phone: newPartner.phone,
    projectTitle: 'Palazzo Grand Penthouse',
    projectLocation: 'Juhu Beach, Mumbai',
    targetInstallationDate: '2026-12-15',
    lineItems,
    notes: 'Heavy stone tabletop requires crane balcony lift.',
  });

  assert(rfq.subtotalINR === 1221000, 'Catalog subtotal calculated correctly: ₹12,21,000');
  assert(rfq.tierDiscountRate === 0.2, 'Trade tier discount rate applied: 20% (0.20)');
  assert(rfq.tierDiscountINR === 244200, 'Trade discount amount calculated: ₹2,44,200');
  assert(rfq.taxableINR === 976800, 'Taxable value calculated: ₹9,76,800');
  assert(rfq.gstINR === 175824, 'Statutory 18% GST calculated: ₹1,75,824');
  assert(rfq.shippingINR === 0, 'White-Glove commercial logistics is complimentary (₹0)');
  assert(rfq.grandTotalINR === 1152624, 'Grand total payable calculated: ₹11,52,624');
  assert(rfq.quotationNumber.startsWith('VL/TRADE/2026-27/'), `Quotation number generated with FY prefix: ${rfq.quotationNumber}`);
  assert(rfq.status === 'SUBMITTED', 'Initial RFQ status is SUBMITTED');

  // --- 4. Physical Swatch Sample Box Ordering ---
  console.log('\n📦 4. Testing Physical Swatch Sample Box Ordering...');
  const swatchBox = TradeStore.orderSwatchSampleBox({
    tradePartnerId: newPartner.id,
    businessName: newPartner.businessName,
    recipientName: 'Ar. Sophia Chen',
    shippingAddress: '42 Nariman Point Commercial Tower',
    city: 'Mumbai',
    postalCode: '400021',
    selectedSwatchIds: ['mat-walnut', 'mat-boucle', 'mat-saddle-leather', 'mat-travertine', 'mat-spun-brass', 'mat-extra'],
  });

  assert(swatchBox.selectedSwatchIds.length === 5, 'Sample box constrained to maximum 5 swatches');
  assert(swatchBox.status === 'PROCESSING', 'Initial swatch box status is PROCESSING');
  assert(swatchBox.trackingNumber.startsWith('VL-SWATCH-'), `Tracking number assigned: ${swatchBox.trackingNumber}`);

  const partnerBoxes = TradeStore.getSwatchBoxOrders(newPartner.id);
  assert(partnerBoxes.length >= 1, 'Partner swatch boxes query returns order');

  // --- 5. VIP Concierge Consultation Scheduling ---
  console.log('\n📦 5. Testing VIP Concierge Consultation Scheduling...');
  const booking = TradeStore.bookVIPConcierge({
    clientName: 'Ar. Sophia Chen',
    email: 'sophia@aureliadesign.com',
    phone: '+91 98333 44556',
    serviceType: 'IN_HOME_SPATIAL',
    scheduledDate: '2026-10-20',
    timeSlot: '02:00 PM - 03:30 PM IST',
    locationOrVirtual: 'Juhu Beach Penthouse Site',
    roomDetails: 'Living & Master Bedroom Layout',
  });

  assert(booking.status === 'CONFIRMED', 'Concierge booking status is CONFIRMED');
  assert(!!booking.conciergeSpecialist, `Specialist assigned: ${booking.conciergeSpecialist}`);
  assert(booking.locationOrVirtual === 'Juhu Beach Penthouse Site', 'On-site physical address preserved');

  const partnerBookings = TradeStore.getVIPBookings('sophia@aureliadesign.com');
  assert(partnerBookings.length >= 1, 'Concierge bookings queried by email');

  // --- 6. Formal Trade Quotation HTML Generation ---
  console.log('\n📦 6. Testing Formal Trade Quotation HTML Generator...');
  const html = TradeStore.generateQuotationHTML(rfq);
  assert(html.includes('<!DOCTYPE html>'), 'HTML document contains DOCTYPE');
  assert(html.includes(rfq.quotationNumber), 'HTML document contains quotation number');
  assert(html.includes('Palazzo Grand Penthouse'), 'HTML document contains project title');
  assert(html.includes('27AABCV1234F1Z5'), 'HTML document contains Veloura Seller GSTIN');
  assert(html.includes('₹11,52,624'), 'HTML document contains formatted grand total');

  // --- 7. CSV Bill of Materials Export Verification ---
  console.log('\n📦 7. Testing CSV Bill of Materials Exporter...');
  const { GET: getCsvExport } = await import('../app/api/trade/rfq/[rfqId]/export/route');
  const { NextRequest } = await import('next/server');
  const csvRes = await getCsvExport(
    new NextRequest(`http://localhost:3000/api/trade/rfq/${rfq.id}/export`),
    { params: Promise.resolve({ rfqId: rfq.id }) }
  );
  assert(csvRes.status === 200, 'CSV export endpoint returns HTTP 200');
  assert(csvRes.headers.get('Content-Type')?.includes('text/csv') === true, 'Response Content-Type is text/csv');
  const csvText = await csvRes.text();
  assert(csvText.includes('PROJECT BILL OF MATERIALS (BOM)'), 'CSV contains BOM title');
  assert(csvText.includes(rfq.quotationNumber), 'CSV contains quotation number');
  assert(csvText.includes('Serpentine Modular Sectional Sofa'), 'CSV contains line item product name');
  assert(csvText.includes('Grand Total Payable (INR)'), 'CSV contains Grand Total row');

  // --- Summary ---
  console.log('\n🏛️ =========================================================================');
  console.log('📊 PHASE 14 VIP CONCIERGE & TRADE B2B TEST SUMMARY:');
  console.log(`   ✓ Passed: ${passed}`);
  console.log(`   ✗ Failed: ${failed}`);
  console.log(`   🎯 Total:  ${passed + failed}`);
  console.log('🏛️ =========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL PHASE 14 VIP CONCIERGE & TRADE B2B TESTS PASSED 100%!\n');
  }
}

runPhase14Tests().catch((err) => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
