import { NextRequest, NextResponse } from 'next/server';
import { TradeStore } from '@/lib/data/tradeStore';
import { sendError } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ rfqId: string }> }
) {
  try {
    const { rfqId } = await params;
    const rfq = TradeStore.getRFQById(rfqId);

    if (!rfq) {
      return sendError('Trade Quotation / RFQ not found', 'NOT_FOUND', 404);
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'html';

    if (format === 'json') {
      return NextResponse.json({ success: true, data: rfq });
    }

    const html = TradeStore.generateQuotationHTML(rfq);
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="Quotation-${rfq.quotationNumber.replace(/\//g, '-')}.html"`,
      },
    });
  } catch (error: any) {
    return sendError(error.message || 'Failed to render trade quotation', 'INTERNAL_ERROR', 500);
  }
}
