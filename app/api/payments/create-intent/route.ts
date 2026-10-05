import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, NotFoundError } from '@/lib/api/errorHandler';
import { getOrderByIdOrNumber } from '@/lib/data/orderStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, currency = 'INR', customerInfo } = body;

    if (!orderId && !amount) {
      throw new ValidationError('Order ID or amount is required to initiate payment.');
    }

    const order = orderId ? getOrderByIdOrNumber(orderId) : null;
    const finalAmount = order ? order.grand_total : (amount || 0);

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY ||
      process.env.RAZORPAY_KEY ||
      process.env.RAZOR_PAY_KEY_ID ||
      process.env.RZP_KEY_ID ||
      process.env.NEXT_PUBLIC_RZP_KEY_ID ||
      '';

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_SECRET_KEY ||
      process.env.RAZORPAY_SECRET ||
      process.env.RAZOR_PAY_KEY_SECRET ||
      process.env.RZP_KEY_SECRET ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET ||
      '';

    let gatewayOrderId: string | null = null;

    // If live/test merchant keys are configured, create authentic Razorpay order
    if (keyId && keySecret && !keyId.includes('demo')) {
      try {
        const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(finalAmount * 100),
            currency: currency || 'INR',
            receipt: `rcpt_${Date.now().toString().slice(-8)}`,
            notes: {
              orderNumber: order?.order_number || `ORD-${Date.now().toString().slice(-6)}`,
            },
          }),
        });

        if (rzpResponse.ok) {
          const rzpData = await rzpResponse.json();
          gatewayOrderId = rzpData.id;
        } else {
          const errBody = await rzpResponse.json();
          console.warn('[Razorpay Order API Notice]:', errBody);
        }
      } catch (rzpErr) {
        console.warn('[Razorpay Order API Failed, falling back to direct checkout]:', rzpErr);
      }
    }

    const paymentPayload = {
      orderId: order?.id || orderId || gatewayOrderId || `ord_${Date.now()}`,
      orderNumber: order?.order_number || `ORD-${Date.now().toString().slice(-6)}`,
      amount: finalAmount,
      amountInPaise: Math.round(finalAmount * 100),
      currency: currency || 'INR',
      gateway: 'Razorpay',
      keyId: keyId || 'rzp_test_veloura_living_demo',
      gatewayOrderId, // Will be real 'order_...' or null
      prefill: {
        name: order?.customer_info?.full_name || customerInfo?.fullName || '',
        email: order?.customer_info?.email || customerInfo?.email || '',
        contact: order?.customer_info?.phone || customerInfo?.phone || '',
      },
      theme: {
        color: '#4A2C1A',
      },
    };

    return successResponse(paymentPayload, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
