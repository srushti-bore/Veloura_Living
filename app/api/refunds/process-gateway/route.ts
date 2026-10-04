import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { razorpayService } from '@/lib/services/razorpayService';
import { getRefunds, createRefundRecord } from '@/lib/data/postPurchaseStore';
import { getOrderById } from '@/lib/data/orderStore';
import { notificationService } from '@/lib/services/notificationService';
import { sendSuccess, sendError } from '@/lib/api/response';

/**
 * POST /api/refunds/process-gateway
 * Triggers automated direct gateway refund via Razorpay API (RET-007)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, ['ADMIN', 'MANAGER', 'ORDER_MANAGER']);
    const body = await req.json();
    const { orderId, returnId, amountInINR, paymentId, speed = 'optimum', reason } = body;

    if (!orderId || !amountInINR) {
      return sendError('orderId and amountInINR are required', 'VALIDATION_ERROR', 400);
    }

    const order = getOrderById(orderId);
    if (!order) {
      return sendError(`Order ${orderId} not found`, 'NOT_FOUND', 404);
    }

    const resolvedPaymentId = paymentId || order.payment?.id || 'pay_system_generated';

    // Execute direct automated refund via Razorpay Gateway Service
    const gatewayResult = await razorpayService.processDirectRefund({
      paymentId: resolvedPaymentId,
      amountInINR,
      currency: order.currency || 'INR',
      speed,
      reason: reason || `Admin automated refund for order ${order.order_number}`,
      notes: {
        order_number: order.order_number,
        processed_by: session.email,
        return_id: returnId || 'DIRECT_CANCELLATION',
      },
    });

    // Record in refunds ledger
    const refundRecord = createRefundRecord({
      returnId,
      orderId,
      paymentId: resolvedPaymentId,
      amount: amountInINR,
      reason: reason || `Automated Gateway Refund (${gatewayResult.status})`,
    });

    refundRecord.gateway_refund_id = gatewayResult.refundId;
    refundRecord.gateway_arn = gatewayResult.gatewayArn;
    refundRecord.speed = gatewayResult.speed;
    refundRecord.status = gatewayResult.success ? 'SUCCESS' : 'FAILED';
    if (!gatewayResult.success) {
      refundRecord.failure_reason = gatewayResult.failureReason;
    }

    if (gatewayResult.success) {
      try {
        notificationService.notifyRefundProcessed(refundRecord, order);
      } catch (e) {
        // Non-blocking notification dispatch
      }
    }

    return sendSuccess({
      refund: refundRecord,
      gatewayResponse: gatewayResult,
      message: gatewayResult.success
        ? `Automated refund of ₹${amountInINR.toLocaleString('en-IN')} successfully disbursed via Razorpay.`
        : `Gateway refund failed: ${gatewayResult.failureReason}`,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return sendError(error.message || 'Failed to process automated gateway refund', error.code || 'INTERNAL_ERROR', status);
  }
}
