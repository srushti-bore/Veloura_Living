import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { successResponse, errorResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { recordPaymentTransaction, getOrderByIdOrNumber } from '@/lib/data/orderStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      throw new ValidationError(
        'Missing required payment verification parameters: razorpayPaymentId, razorpayOrderId, and razorpaySignature.'
      );
    }

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_SECRET_KEY ||
      process.env.RAZORPAY_SECRET ||
      process.env.RAZOR_PAY_KEY_SECRET ||
      process.env.RZP_KEY_SECRET ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET ||
      '';

    if (!keySecret) {
      return errorResponse(
        'Server payment gateway secret configuration is missing.',
        500,
        'GATEWAY_SECRET_MISSING'
      );
    }

    // Server-side cryptographic HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isSignatureValid =
      expectedSignature.length === razorpaySignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(razorpaySignature, 'utf-8')
      );

    if (!isSignatureValid) {
      if (orderId) {
        const order = getOrderByIdOrNumber(orderId);
        if (order) {
          recordPaymentTransaction({
            orderId: order.id,
            transactionRef: razorpayPaymentId,
            gatewayName: 'Razorpay',
            gatewayOrderId: razorpayOrderId,
            status: 'FAILED',
            rawResponse: {
              razorpayPaymentId,
              razorpayOrderId,
              razorpaySignature,
              error: 'Invalid HMAC-SHA256 signature',
              failedAt: new Date().toISOString(),
            },
          });
        }
      }

      return errorResponse(
        'Invalid payment signature. Verification failed.',
        400,
        'INVALID_PAYMENT_SIGNATURE'
      );
    }

    const order = orderId ? getOrderByIdOrNumber(orderId) : null;
    let updatedOrder = null;

    if (order) {
      updatedOrder = recordPaymentTransaction({
        orderId: order.id,
        transactionRef: razorpayPaymentId,
        gatewayName: 'Razorpay',
        gatewayOrderId: razorpayOrderId,
        status: 'SUCCESS',
        rawResponse: {
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    return successResponse(
      {
        message: 'Payment verified successfully.',
        transactionRef: razorpayPaymentId,
        gatewayOrderId: razorpayOrderId,
        order: updatedOrder || { id: orderId, paymentStatus: 'Paid' },
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
