import { NextRequest } from 'next/server';
import { TradeStore } from '@/lib/data/tradeStore';
import { sendSuccess, sendError } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, contactPerson, email, phone, tradeRole, gstin, websiteOrPortfolio } = body;

    if (!businessName || !contactPerson || !email || !phone || !tradeRole || !gstin) {
      return sendError(
        'businessName, contactPerson, email, phone, tradeRole, and gstin are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    const partner = TradeStore.registerTradePartner({
      businessName,
      contactPerson,
      email,
      phone,
      tradeRole,
      gstin,
      websiteOrPortfolio,
    });

    return sendSuccess(partner, 201);
  } catch (error: any) {
    return sendError(error.message || 'Failed to process trade application', 'INTERNAL_ERROR', 500);
  }
}
