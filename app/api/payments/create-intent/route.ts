import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, NotFoundError } from '@/lib/api/errorHandler';
import { getOrderByIdOrNumber } from '@/lib/data/orderStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      throw new ValidationError('Order ID is required to initiate payment.');
    }

    const order = getOrderByIdOrNumber(orderId);
    if (!order) {
      throw new NotFoundError(`Order '${orderId}' not found.`);
    }

    // In a live environment with Razorpay/Stripe, create the gateway order ID here
    const gatewayOrderId = `rzp_order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const paymentPayload = {
      orderId: order.id,
      orderNumber: order.order_number,
      amount: order.grand_total,
      amountInPaise: Math.round(order.grand_total * 100),
      currency: 'INR',
      gateway: 'Razorpay',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_veloura_living_demo',
      gatewayOrderId,
      prefill: {
        name: order.customer_info?.full_name,
        email: order.customer_info?.email,
        contact: order.customer_info?.phone,
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
