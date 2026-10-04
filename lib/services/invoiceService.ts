/**
 * 🏛️ Veloura Living — GST Invoicing Engine
 * Reference: docs/Veloura-Living_SRS_Final.md (DOC-001, DOC-002, DOC-003, PRC-002)
 */

import { getOrderById } from '@/lib/data/orderStore';

export interface GstInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  financialYear: string;
  sellerDetails: {
    legalName: string;
    tradeName: string;
    gstin: string;
    address: string;
    state: string;
    stateCode: string;
    email: string;
  };
  buyerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    gstin?: string;
  };
  orderRef: {
    orderId: string;
    orderNumber: string;
    orderDate: string;
    paymentRef: string;
  };
  items: Array<{
    description: string;
    sku: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    taxableValue: number;
    cgstRate: number;
    cgstAmount: number;
    sgstRate: number;
    sgstAmount: number;
    igstRate: number;
    igstAmount: number;
    total: number;
  }>;
  subtotal: number;
  totalTax: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  shippingTotal: number;
  grandTotal: number;
  amountInWords: string;
}

let invoiceSequence = 1042; // Seeded sequential counter

export function generateInvoiceNumber(): { invoiceNumber: string; financialYear: string } {
  invoiceSequence += 1;
  const now = new Date();
  const year = now.getFullYear();
  const nextYear = (year + 1).toString().slice(-2);
  const financialYear = `${year}-${nextYear}`;
  const paddedSeq = invoiceSequence.toString().padStart(4, '0');
  return {
    invoiceNumber: `VL/${financialYear}/${paddedSeq}`,
    financialYear,
  };
}

export function generateGstInvoiceForOrder(orderId: string): GstInvoiceData | null {
  const order = getOrderById(orderId);
  if (!order) return null;

  const { invoiceNumber, financialYear } = generateInvoiceNumber();
  const isInterState = order.customer_info?.state?.toLowerCase() !== 'maharashtra';

  const sellerState = 'Maharashtra';
  const sellerGstin = process.env.BUSINESS_GSTIN || '27AABCV1234F1Z5';

  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const items = order.items.map((item) => {
    // 18% GST calculation (9% CGST + 9% SGST for Maharashtra, 18% IGST for other states)
    const lineTotal = item.unit_price * item.quantity;
    const taxableValue = Math.round((lineTotal / 1.18) * 100) / 100;
    totalTaxable += taxableValue;

    let cgstRate = 0;
    let cgstAmount = 0;
    let sgstRate = 0;
    let sgstAmount = 0;
    let igstRate = 0;
    let igstAmount = 0;

    if (isInterState) {
      igstRate = 18;
      igstAmount = Math.round(taxableValue * 0.18);
      totalIgst += igstAmount;
    } else {
      cgstRate = 9;
      cgstAmount = Math.round(taxableValue * 0.09);
      sgstRate = 9;
      sgstAmount = Math.round(taxableValue * 0.09);
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;
    }

    return {
      description: item.product_name,
      sku: item.sku,
      hsnCode: '94036000', // Wooden Furniture HSN
      quantity: item.quantity,
      unitPrice: item.unit_price,
      taxableValue,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      total: lineTotal,
    };
  });

  return {
    invoiceNumber,
    invoiceDate: new Date().toISOString().split('T')[0],
    financialYear,
    sellerDetails: {
      legalName: 'Veloura Living Luxury Studio Private Limited',
      tradeName: 'Veloura Living',
      gstin: sellerGstin,
      address: 'Gallery 4, Studio Pavilion, Worli Sea Face, Mumbai 400018',
      state: sellerState,
      stateCode: '27',
      email: 'concierge@velouraliving.com',
    },
    buyerDetails: {
      name: order.customer_info?.full_name || 'Client',
      email: order.customer_info?.email || 'client@example.com',
      phone: order.customer_info?.phone || '',
      address: `${order.customer_info?.address_line1 || ''}, ${order.customer_info?.city || ''}, ${order.customer_info?.postal_code || ''}`,
      state: order.customer_info?.state || 'Maharashtra',
    },
    orderRef: {
      orderId: order.id,
      orderNumber: order.order_number,
      orderDate: order.created_at,
      paymentRef: order.payment_intent_id || 'PAY-ONLINE-VERIFIED',
    },
    items,
    subtotal: order.subtotal,
    totalTax: totalCgst + totalSgst + totalIgst,
    cgstTotal: totalCgst,
    sgstTotal: totalSgst,
    igstTotal: totalIgst,
    shippingTotal: order.shipping_total || 0,
    grandTotal: order.grand_total,
    amountInWords: `Indian Rupees ${Math.round(order.grand_total).toLocaleString('en-IN')} Only`,
  };
}

export function renderInvoiceHtml(invoice: GstInvoiceData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GST Tax Invoice — ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif; margin: 40px; color: #2A1A12; line-height: 1.5; font-size: 13px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2A1A12; padding-bottom: 20px; }
    .title { font-size: 24px; font-weight: bold; color: #4A2C1A; letter-spacing: 1px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 24px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #FAF7F2; border: 1px solid #EAD8C7; padding: 10px; text-align: left; font-size: 12px; }
    td { border: 1px solid #EAD8C7; padding: 10px; }
    .totals { margin-left: auto; width: 320px; }
    .totals table { margin: 0; }
    .badge { background: #2A1A12; color: #FFF; padding: 3px 8px; border-radius: 3px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">VELOURA LIVING</div>
      <div>GST TAX INVOICE</div>
      <div><strong>Invoice No:</strong> ${invoice.invoiceNumber}</div>
      <div><strong>Date:</strong> ${invoice.invoiceDate}</div>
    </div>
    <div style="text-align: right;">
      <strong>${invoice.sellerDetails.legalName}</strong><br>
      GSTIN: ${invoice.sellerDetails.gstin}<br>
      ${invoice.sellerDetails.address}<br>
      State: ${invoice.sellerDetails.state} (Code: ${invoice.sellerDetails.stateCode})
    </div>
  </div>

  <div class="grid">
    <div>
      <strong>Billed To:</strong><br>
      ${invoice.buyerDetails.name}<br>
      ${invoice.buyerDetails.address}<br>
      State: ${invoice.buyerDetails.state}<br>
      Email: ${invoice.buyerDetails.email} | Phone: ${invoice.buyerDetails.phone}
    </div>
    <div style="text-align: right;">
      <strong>Order Reference:</strong><br>
      Order ID: ${invoice.orderRef.orderNumber}<br>
      Payment Ref: ${invoice.orderRef.paymentRef}<br>
      Order Date: ${new Date(invoice.orderRef.orderDate).toLocaleDateString()}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item Description</th>
        <th>HSN</th>
        <th>SKU</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Taxable Value</th>
        <th>Tax Rate</th>
        <th>Total (INR)</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items
        .map(
          (i) => `<tr>
        <td><strong>${i.description}</strong></td>
        <td>${i.hsnCode}</td>
        <td>${i.sku}</td>
        <td>${i.quantity}</td>
        <td>₹${i.unitPrice.toLocaleString('en-IN')}</td>
        <td>₹${i.taxableValue.toLocaleString('en-IN')}</td>
        <td>18% GST</td>
        <td>₹${i.total.toLocaleString('en-IN')}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td><strong>Subtotal</strong></td><td style="text-align:right;">₹${invoice.subtotal.toLocaleString('en-IN')}</td></tr>
      ${invoice.cgstTotal > 0 ? `<tr><td>CGST (9%)</td><td style="text-align:right;">₹${invoice.cgstTotal.toLocaleString('en-IN')}</td></tr>` : ''}
      ${invoice.sgstTotal > 0 ? `<tr><td>SGST (9%)</td><td style="text-align:right;">₹${invoice.sgstTotal.toLocaleString('en-IN')}</td></tr>` : ''}
      ${invoice.igstTotal > 0 ? `<tr><td>IGST (18%)</td><td style="text-align:right;">₹${invoice.igstTotal.toLocaleString('en-IN')}</td></tr>` : ''}
      <tr><td>Shipping</td><td style="text-align:right;">${invoice.shippingTotal === 0 ? 'FREE' : `₹${invoice.shippingTotal.toLocaleString('en-IN')}`}</td></tr>
      <tr style="font-size: 14px; font-weight: bold; background: #FAF7F2;"><td>Grand Total</td><td style="text-align:right;">₹${invoice.grandTotal.toLocaleString('en-IN')}</td></tr>
    </table>
  </div>

  <p style="margin-top: 40px; font-size: 11px; color: #765236;">
    * This is a computer-generated GST tax invoice valid under Section 31 of the CGST Act, 2017.
  </p>
</body>
</html>`;
}
