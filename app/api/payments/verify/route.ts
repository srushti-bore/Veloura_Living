import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, NotFoundError } from '@/lib/api/errorHandler';
import { recordPaymentTransaction, getOrderByIdOrNumber } from '@/lib/data/orderStore';
import { PaymentStatusEnum } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      transactionRef,
      status = 'SUCCESS',
    } = body;

    if (!orderId) {
      throw new ValidationError('Order ID is required.');
    }

    const order = getOrderByIdOrNumber(orderId);

    const ref = razorpayPaymentId || transactionRef || `pay_${Date.now()}`;
    const gatewayOrderId = razorpayOrderId || undefined;
    const paymentStatus: PaymentStatusEnum = status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';

    let updatedOrder = null;
    if (order) {
      updatedOrder = recordPaymentTransaction({
        orderId: order.id,
        transactionRef: ref,
        gatewayName: 'Razorpay',
        gatewayOrderId,
        status: paymentStatus,
        rawResponse: {
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    if (paymentStatus === 'FAILED') {
      return errorResponse('Payment transaction was declined or failed.', 400, 'PAYMENT_FAILED');
    }

    return successResponse(
      {
        message: 'Payment verified successfully.',
        transactionRef: ref,
        gatewayOrderId,
        order: updatedOrder || { id: orderId, paymentStatus: 'Paid' },
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
