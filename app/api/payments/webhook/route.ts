import { NextRequest, NextResponse } from 'next/server';
import { recordPaymentTransaction, getOrderByIdOrNumber } from '@/lib/data/orderStore';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // In a live environment, verify HMAC-SHA256 signature using RAZORPAY_WEBHOOK_SECRET
    let event: any = {};
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.notes?.order_id || paymentEntity?.order_id;

    if (orderId && eventType === 'payment.captured') {
      const existing = getOrderByIdOrNumber(orderId);
      if (existing) {
        recordPaymentTransaction({
          orderId: existing.id,
          transactionRef: paymentEntity.id,
          gatewayName: 'Razorpay Webhook',
          gatewayOrderId: paymentEntity.order_id,
          status: 'SUCCESS',
          rawResponse: paymentEntity,
        });
      }
    } else if (orderId && eventType === 'payment.failed') {
      const existing = getOrderByIdOrNumber(orderId);
      if (existing) {
        recordPaymentTransaction({
          orderId: existing.id,
          transactionRef: paymentEntity.id,
          gatewayName: 'Razorpay Webhook',
          gatewayOrderId: paymentEntity.order_id,
          status: 'FAILED',
          rawResponse: paymentEntity,
        });
      }
    } else if (eventType === 'refund.processed') {
      const refundEntity = event.payload?.refund?.entity;
      console.log('[Webhook] Razorpay Refund Processed:', refundEntity?.id, refundEntity?.amount);
    } else if (eventType === 'refund.failed') {
      const refundEntity = event.payload?.refund?.entity;
      console.warn('[Webhook] Razorpay Refund Failed:', refundEntity?.id, refundEntity?.reason);
    }

    return NextResponse.json({ status: 'ok', received: true }, { status: 200 });
  } catch (error) {
    console.error('[Payment Webhook Error]:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
