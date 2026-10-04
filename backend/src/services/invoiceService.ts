/**
 * 🏛️ Veloura Living — Standalone Backend GST Invoicing Engine
 */

import { getOrderById } from '../data/orderStore';

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

let invoiceSequence = 1042;

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
      hsnCode: '94036000',
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
