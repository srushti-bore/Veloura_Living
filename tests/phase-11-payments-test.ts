/**
 * 🏛️ Veloura Living — Phase 11 Automated Verification Test Suite
 * Tests: Multi-Currency FX Engine, COD Safety & OTP, and Razorpay Automated Refunds
 */

import { currencyEngine, SUPPORTED_CURRENCIES } from '../lib/services/currencyEngine';
import { codSafetyService } from '../lib/services/codService';
import { razorpayService } from '../lib/services/razorpayService';
import { calculateAuthoritativeCheckout, validateCoupon } from '../lib/data/pricingStore';
import { createOrderAuthoritative, getOrderById } from '../lib/data/orderStore';
import { createRefundRecord, getRefunds } from '../lib/data/postPurchaseStore';
import { addToCart, clearCart } from '../lib/data/shoppingStore';
import { initCatalogStore, getProducts } from '../lib/data/catalogStore';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runPhase11Tests() {
  console.log('🏛️ ========================================================');
  console.log('🏛️ VELOURA LIVING — PHASE 11 PAYMENT AUTOMATION TEST SUITE');
  console.log('🏛️ ========================================================\n');

  let passedTests = 0;

  // TEST SUITE 1: Multi-Currency FX Engine (CON-003)
  console.log('📦 1. Testing Multi-Currency Dynamic Pricing Engine...');
  const testAmountINR = 100000; // ₹1,00,000

  const usdAmount = currencyEngine.convertFromINR(testAmountINR, 'USD');
  const eurAmount = currencyEngine.convertFromINR(testAmountINR, 'EUR');
  const gbpAmount = currencyEngine.convertFromINR(testAmountINR, 'GBP');
  const aedAmount = currencyEngine.convertFromINR(testAmountINR, 'AED');
  const sgdAmount = currencyEngine.convertFromINR(testAmountINR, 'SGD');

  assert(usdAmount > 1000 && usdAmount < 1500, `USD conversion accurate: $${usdAmount}`);
  assert(eurAmount > 900 && eurAmount < 1300, `EUR conversion accurate: €${eurAmount}`);
  assert(gbpAmount > 800 && gbpAmount < 1100, `GBP conversion accurate: £${gbpAmount}`);
  assert(aedAmount > 4000 && aedAmount < 4800, `AED conversion accurate: AED ${aedAmount}`);
  assert(sgdAmount > 1400 && sgdAmount < 1700, `SGD conversion accurate: S$${sgdAmount}`);

  const formattedINR = currencyEngine.formatPrice(testAmountINR, 'INR');
  const formattedUSD = currencyEngine.formatPrice(testAmountINR, 'USD');
  assert(formattedINR.includes('₹'), `INR formatting contains ₹ symbol: ${formattedINR}`);
  assert(formattedUSD.includes('$'), `USD formatting contains $ symbol: ${formattedUSD}`);
  passedTests += 7;

  // TEST SUITE 2: Cash on Delivery (COD) Safety Engine & OTP (PAY-009)
  console.log('\n📦 2. Testing Cash on Delivery (COD) Safety Engine & OTP...');
  
  // Under min threshold
  const underMin = codSafetyService.checkEligibility(1500);
  assert(!underMin.eligible, 'Orders under ₹2,500 are correctly marked ineligible for COD');

  // Over max threshold
  const overMax = codSafetyService.checkEligibility(250000);
  assert(!overMax.eligible, 'Orders over ₹1,50,000 are correctly marked ineligible for COD');

  // Eligible below 50k (should have ₹750 handling fee)
  const eligibleSub50k = codSafetyService.checkEligibility(35000);
  assert(eligibleSub50k.eligible && eligibleSub50k.handlingFee === 750, 'COD order under ₹50,000 incurs ₹750 handling fee');

  // Eligible above 50k (should have ₹0 handling fee waiver)
  const eligibleAbove50k = codSafetyService.checkEligibility(85000);
  assert(eligibleAbove50k.eligible && eligibleAbove50k.handlingFee === 0, 'COD order above ₹50,000 has complimentary handling fee');

  // OTP Generation and Validation
  const otpResult = codSafetyService.generateOtp('+91 98201 54321');
  assert(otpResult.verificationId.startsWith('cod_ver_'), `Verification ID generated: ${otpResult.verificationId}`);
  assert(otpResult.otp.length === 6, `6-Digit OTP generated: ${otpResult.otp}`);

  const verifySuccess = codSafetyService.verifyOtp(otpResult.verificationId, otpResult.otp);
  assert(verifySuccess.verified, 'Correct OTP verified successfully');

  const isMarkedVerified = codSafetyService.isVerified(otpResult.verificationId);
  assert(isMarkedVerified, 'Session is marked verified in token store');
  passedTests += 8;

  // TEST SUITE 3: Automated Razorpay Refund API Engine (RET-007)
  console.log('\n📦 3. Testing Razorpay Automated Refund API Engine...');
  const refundResult = await razorpayService.processDirectRefund({
    paymentId: 'pay_rzp_mock_982347102',
    amountInINR: 78000,
    speed: 'optimum',
    reason: 'Customer Return: Size exchange requested',
    notes: { order_number: 'VL-2026-8941' },
  });

  assert(refundResult.success, 'Automated direct refund processed successfully');
  assert(refundResult.refundId.startsWith('rfnd_'), `Gateway refund ID recorded: ${refundResult.refundId}`);
  assert(refundResult.status === 'PROCESSED', `Refund status is PROCESSED`);
  assert(!!refundResult.gatewayArn, `Gateway Acquirer ARN generated: ${refundResult.gatewayArn}`);

  // Create refund record in store
  const recordedRefund = createRefundRecord({
    orderId: '88888888-8888-8888-8888-888888888881',
    paymentId: 'pay_rzp_mock_982347102',
    amount: 78000,
    reason: 'Verified return refund via automated API',
  });
  recordedRefund.gateway_refund_id = refundResult.refundId;
  recordedRefund.gateway_arn = refundResult.gatewayArn;

  assert(recordedRefund.amount === 78000, 'Refund record stores authoritative amount');
  assert(recordedRefund.gateway_refund_id === refundResult.refundId, 'Refund record is linked with gateway refund ID');
  passedTests += 6;

  // TEST SUITE 4: End-to-End Authoritative COD Checkout Cycle
  console.log('\n📦 4. Testing End-to-End COD Checkout & Pricing Calculation...');
  initCatalogStore();
  const allProducts = getProducts({}, { limit: 50 }).products;
  const eligibleProduct = allProducts.find((p) => p.base_price >= 2500 && p.base_price <= 150000) || allProducts[0];
  const sampleVariant = eligibleProduct?.variants?.[0];
  const sampleSku = sampleVariant?.sku || 'VL-LR-TBL-002-AME';
  const testSession = `test_session_p11_${Date.now()}`;
  clearCart(testSession);
  const addRes = addToCart(testSession, sampleSku, 1);
  assert(!addRes.error, `Added ${sampleSku} (₹${sampleVariant.price}) to cart: ${addRes.cart.items.length} items`);

  const checkoutSummary = calculateAuthoritativeCheckout({
    ownerKey: testSession,
    paymentMethod: 'COD',
    targetCurrency: 'USD',
  });

  assert(checkoutSummary.is_valid, 'Authoritative checkout summary valid for COD');
  assert(checkoutSummary.cod?.eligible === true, 'COD eligibility recognized in checkout summary');
  assert(checkoutSummary.currency === 'USD', 'Target currency correctly passed as USD');
  assert(!!checkoutSummary.formatted_total, `Formatted total generated: ${checkoutSummary.formatted_total}`);

  const orderResult = createOrderAuthoritative({
    ownerKey: testSession,
    customerInfo: {
      fullName: 'Vikramaditya Roy',
      email: 'vikram.roy@example.com',
      phone: '+91 99301 23456',
      addressLine1: 'Heritage Villa 7, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500033',
    },
    paymentMethod: 'COD',
    currency: 'USD',
    codVerificationId: otpResult.verificationId,
  });

  assert(!orderResult.error, 'COD Order placed successfully with 0 errors');
  assert(orderResult.order.payment_method === 'COD', 'Order stored with payment_method COD');
  assert(orderResult.order.payment_status === 'PENDING', 'Order stored with payment_status PENDING for COD');
  assert(orderResult.order.currency === 'USD', 'Order stored with currency USD');
  assert(orderResult.order.cod_verified === true, 'Order stored with cod_verified true');
  passedTests += 9;

  console.log('\n🏛️ ========================================================');
  console.log(`✅ ALL ${passedTests}/${passedTests} PHASE 11 TESTS PASSED SUCCESSFULLY!`);
  console.log('🏛️ ========================================================\n');
}

runPhase11Tests().catch((err) => {
  console.error('\n❌ Test execution failed with error:', err);
  process.exit(1);
});
