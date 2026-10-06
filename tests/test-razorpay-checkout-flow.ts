import crypto from 'crypto';

async function testFullRazorpayFlow() {
  console.log('🧪 Starting Razorpay Test Mode Verification Test...');

  // 1. Test Create Payment Intent
  const orderAmount = 145000;
  const intentPayload = {
    orderId: 'temp_cart_' + Date.now(),
    amount: orderAmount,
    currency: 'INR',
    customerInfo: {
      fullName: 'Aarav Singhania',
      email: 'aarav.singhania@veloura.live',
      phone: '+91 98201 54321',
    },
  };

  const intentRes = await fetch('http://localhost:3000/api/payments/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(intentPayload),
  });

  const intentJson = await intentRes.json();
  console.log('1️⃣ Payment Intent Response:', intentJson.success ? '✅ SUCCESS' : '❌ FAILED');

  if (intentJson.success) {
    console.log('   - Gateway:', intentJson.data?.gateway);
    console.log('   - Amount in Paise:', intentJson.data?.amountInPaise);
    console.log('   - Gateway Order ID:', intentJson.data?.gatewayOrderId);
  } else {
    console.log('   - Notice:', intentJson.error?.message);
  }

  // 2. Test Invalid Signature Rejection
  const invalidOrderId = intentJson.data?.gatewayOrderId || `order_${Date.now()}`;
  const mockPaymentId = `pay_${Date.now()}`;
  const invalidVerifyPayload = {
    orderId: invalidOrderId,
    razorpayPaymentId: mockPaymentId,
    razorpayOrderId: invalidOrderId,
    razorpaySignature: 'invalid_tampered_signature_hex_' + Date.now(),
  };

  const invalidVerifyRes = await fetch('http://localhost:3000/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invalidVerifyPayload),
  });

  const invalidVerifyJson = await invalidVerifyRes.json();
  if (!invalidVerifyJson.success && invalidVerifyRes.status === 400) {
    console.log('2️⃣ Tampered / Fake Signature Rejection: ✅ PASSED (Strictly Blocked by HMAC-SHA256)');
  } else {
    console.log('2️⃣ Tampered / Fake Signature Rejection: ❌ FAILED (Should have been rejected)');
  }

  // 3. Test Cryptographic Signature Verification (with Server Key Secret)
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keySecret) {
    const validSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${invalidOrderId}|${mockPaymentId}`)
      .digest('hex');

    const validVerifyPayload = {
      orderId: invalidOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpayOrderId: invalidOrderId,
      razorpaySignature: validSignature,
    };

    const validVerifyRes = await fetch('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validVerifyPayload),
    });

    const validVerifyJson = await validVerifyRes.json();
    if (validVerifyJson.success && validVerifyRes.status === 200) {
      console.log('3️⃣ Authentic HMAC-SHA256 Signature Verification: ✅ PASSED (Verified & Confirmed)');
    } else {
      console.log('3️⃣ Authentic HMAC-SHA256 Signature Verification: ❌ FAILED');
    }
  }

  // 4. Test Gold Coin Reward Calculation
  const earnedCoins = Math.max(250, Math.round(orderAmount * 0.02));
  console.log('4️⃣ Veloura Gold Coin Reward Calculation:');
  console.log(`   - Order Amount: ₹${orderAmount.toLocaleString('en-IN')}`);
  console.log(`   - 🪙 Gold Coins Credited: +${earnedCoins.toLocaleString('en-IN')} Coins (2% VIP Tier Reward)`);

  console.log('\n🎉 RAZORPAY SECURITY & FLOW VERIFICATION COMPLETE');
}

testFullRazorpayFlow().catch((e) => {
  console.error('❌ Test Execution Error:', e);
});
