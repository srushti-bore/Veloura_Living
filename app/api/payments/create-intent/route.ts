import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { getOrderByIdOrNumber } from '@/lib/data/orderStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, currency = 'INR', customerInfo } = body;

    const order = orderId ? getOrderByIdOrNumber(orderId) : null;
    const finalAmount = order ? order.grand_total : (amount || 0);

    if (finalAmount <= 0) {
      throw new ValidationError('A valid payment amount greater than zero is required.');
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY ||
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

    if (!keyId || !keySecret) {
      return errorResponse(
        'Razorpay credentials are not configured on the server. Please ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in server environment.',
        500,
        'GATEWAY_CONFIG_MISSING'
      );
    }

    const amountInPaise = Math.round(finalAmount * 100);
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now().toString().slice(-8)}`,
        notes: {
          orderId: order?.id || orderId || '',
          orderNumber: order?.order_number || `ORD-${Date.now().toString().slice(-6)}`,
        },
      }),
    });

    const rzpData = await rzpResponse.json().catch(() => ({}));

    if (!rzpResponse.ok) {
      const errorMessage =
        rzpData.error?.description ||
        rzpData.error?.message ||
        'Failed to create Razorpay Test Mode Order.';
      return errorResponse(errorMessage, rzpResponse.status || 500, 'RAZORPAY_ORDER_CREATION_FAILED');
    }

    const gatewayOrderId = rzpData.id;
    if (!gatewayOrderId) {
      return errorResponse('Invalid response received from Razorpay API.', 500, 'INVALID_GATEWAY_RESPONSE');
    }

    const paymentPayload = {
      orderId: order?.id || orderId || gatewayOrderId,
      orderNumber: order?.order_number || `ORD-${Date.now().toString().slice(-6)}`,
      amount: finalAmount,
      amountInPaise,
      currency: 'INR',
      gateway: 'Razorpay',
      keyId,
      gatewayOrderId,
      prefill: {
        name: order?.customer_info?.full_name || customerInfo?.fullName || '',
        email: order?.customer_info?.email || customerInfo?.email || '',
        contact: order?.customer_info?.phone || customerInfo?.phone || '',
      },
      theme: {
        color: '#1C140E',
      },
    };

    return successResponse(paymentPayload, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
