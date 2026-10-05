import { NextRequest, NextResponse } from 'next/server';
import { TradeStore } from '@/lib/data/tradeStore';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ rfqId: string }> }
) {
  try {
    const { rfqId } = await context.params;
    const rfq = TradeStore.getRFQById(rfqId);

    if (!rfq) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Project RFQ not found' } },
        { status: 404 }
      );
    }

    // Generate RFC-4180 compliant CSV content
    const headers = [
      'Line Item #',
      'Product Name',
      'SKU',
      'Custom Finish / Material',
      'Quantity',
      'Unit Base Price (INR)',
      'Total Base Value (INR)',
      'Applied Tier Discount Rate',
      'Tier Discount Amount (INR)',
      'Taxable Value (INR)',
      'GST 18% (INR)',
      'Net Payable (INR)'
    ];

    const discountRate = rfq.tierDiscountRate;

    const rows = rfq.lineItems.map((item, index) => {
      const itemBase = item.totalPriceINR;
      const itemDiscount = Math.round(itemBase * discountRate);
      const itemTaxable = itemBase - itemDiscount;
      const itemGst = Math.round(itemTaxable * 0.18);
      const itemNet = itemTaxable + itemGst;

      return [
        index + 1,
        `"${item.productName.replace(/"/g, '""')}"`,
        `"${item.sku}"`,
        `"${(item.customFinish || 'Curated Atelier Standard').replace(/"/g, '""')}"`,
        item.quantity,
        item.unitBasePriceINR,
        itemBase,
        `${(discountRate * 100).toFixed(0)}%`,
        itemDiscount,
        itemTaxable,
        itemGst,
        itemNet
      ].join(',');
    });

    // Summary Rows
    const summaryRows = [
      '',
      `"","","","","","Subtotal (INR)",${rfq.subtotalINR},"","","","",""`,
      `"","","","","","Trade Tier Discount (${(discountRate * 100).toFixed(0)}%)",-${rfq.tierDiscountINR},"","","","",""`,
      `"","","","","","Taxable Value (INR)",${rfq.taxableINR},"","","","",""`,
      `"","","","","","Statutory 18% GST (INR)",${rfq.gstINR},"","","","",""`,
      `"","","","","","White-Glove Commercial Logistics",0,"","","","",""`,
      `"","","","","","Grand Total Payable (INR)",${rfq.grandTotalINR},"","","","",""`
    ];

    const csvContent = [
      `"VELOURA LIVING — PROJECT BILL OF MATERIALS (BOM)"`,
      `"Quotation Number:","${rfq.quotationNumber}"`,
      `"Project Title:","${rfq.projectTitle.replace(/"/g, '""')}"`,
      `"Project Location:","${rfq.projectLocation.replace(/"/g, '""')}"`,
      `"Trade Partner / Client:","${rfq.businessName.replace(/"/g, '""')} (${rfq.contactPerson.replace(/"/g, '""')})"`,
      `"Date of Generation:","${new Date().toLocaleDateString('en-IN')}"`,
      '',
      headers.join(','),
      ...rows,
      ...summaryRows
    ].join('\r\n');

    const filename = `Veloura_BOM_${rfq.quotationNumber.replace(/\//g, '_')}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to export CSV BOM' } },
      { status: 500 }
    );
  }
}
