import { NextRequest } from 'next/server';
import { TradeStore } from '@/lib/data/tradeStore';
import { sendSuccess, sendError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('email') || searchParams.get('partnerId') || 'trade_partner_001';

    const partner = TradeStore.getTradePartner(identifier);
    if (!partner) {
      return sendError('Trade partner not found', 'NOT_FOUND', 404);
    }

    const rfqs = TradeStore.getRFQs(partner.id);
    const swatchBoxes = TradeStore.getSwatchBoxOrders(partner.id);

    return sendSuccess({
      partner,
      rfqsCount: rfqs.length,
      swatchBoxesCount: swatchBoxes.length,
    });
  } catch (error: any) {
    return sendError(error.message || 'Failed to retrieve trade status', 'INTERNAL_ERROR', 500);
  }
}
