import { NextRequest, NextResponse } from 'next/server';
import { generateGstInvoiceForOrder, renderInvoiceHtml } from '@/lib/services/invoiceService';
import { handleApiError, NotFoundError } from '@/lib/api/errorHandler';
import { successResponse } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const invoice = generateGstInvoiceForOrder(orderId);

    if (!invoice) {
      throw new NotFoundError(`Invoice for order ${orderId} could not be found.`);
    }

    const format = request.nextUrl.searchParams.get('format');
    if (format === 'html' || format === 'pdf') {
      const html = renderInvoiceHtml(invoice);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="Invoice-${invoice.invoiceNumber.replace(/\//g, '-')}.html"`,
        },
      });
    }

    return successResponse(invoice, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
