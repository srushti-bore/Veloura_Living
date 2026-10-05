import { NextRequest } from 'next/server';
import { TradeStore } from '@/lib/data/tradeStore';
import { sendSuccess, sendError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId') || undefined;
    const boxes = TradeStore.getSwatchBoxOrders(partnerId);
    return sendSuccess(boxes);
  } catch (error: any) {
    return sendError(error.message || 'Failed to retrieve swatch sample box orders', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tradePartnerId,
      businessName,
      recipientName,
      shippingAddress,
      city,
      postalCode,
      selectedSwatchIds,
    } = body;

    if (!recipientName || !shippingAddress || !city || !postalCode || !selectedSwatchIds || selectedSwatchIds.length === 0) {
      return sendError(
        'recipientName, shippingAddress, city, postalCode, and at least 1 selected swatch are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    const box = TradeStore.orderSwatchSampleBox({
      tradePartnerId,
      businessName: businessName || recipientName,
      recipientName,
      shippingAddress,
      city,
      postalCode,
      selectedSwatchIds,
    });

    return sendSuccess(box, 201);
  } catch (error: any) {
    return sendError(error.message || 'Failed to order swatch sample box', 'INTERNAL_ERROR', 500);
  }
}
