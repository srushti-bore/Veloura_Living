/**
 * 🏛️ Veloura Living — Order, Payment & White-Glove Shipment Store
 * Reference: docs/Veloura_Living_SRS.md (Section 13, 14, 15, 16, 68, 69, Phase 6)
 */

import {
  DbOrder,
  DbOrderItem,
  DbPayment,
  DbPaymentTransaction,
  DbShipment,
  OrderStatusEnum,
  PaymentStatusEnum,
  PaymentMethodEnum,
  ShipmentStatusEnum,
  CurrencyCode,
} from '@/types';
import { getCart, clearCart, AuthoritativeCart } from './shoppingStore';
import { calculateAuthoritativeCheckout } from './pricingStore';
import { notificationService } from '@/lib/services/notificationService';
import { updateVariantStock, getVariantBySku } from './catalogStore';
import { findUserById } from './authStore';
import { codSafetyService } from '@/lib/services/codService';
import { currencyEngine } from '@/lib/services/currencyEngine';

export interface DetailedOrder extends DbOrder {
  items: DbOrderItem[];
  payment?: DbPayment & { transactions: DbPaymentTransaction[] };
  shipment?: DbShipment & { events: { status: ShipmentStatusEnum; location: string; description: string; timestamp: string }[] };
  delivery_date?: string;
  payment_intent_id?: string;
  customer_info?: {
    full_name: string;
    email: string;
    phone: string;
    shipping_address: string;
    address_line1?: string;
    city: string;
    state: string;
    postal_code: string;
  };
}

// In-memory collections for active orders, payments & shipments
const ordersStore: Map<string, DetailedOrder> = new Map();
const idempotencyRegistry: Map<string, string> = new Map(); // idempotency_key -> order_id
let isOrderStoreInitialized = false;

export function initOrderStore() {
  if (isOrderStoreInitialized) return;
  isOrderStoreInitialized = true;

  // Initialize with initial mock orders for demonstration
  const initialOrderId = '44444444-1111-1111-1111-111111111101';
  const initialPaymentId = '55555555-1111-1111-1111-111111111101';
  const initialShipmentId = '66666666-1111-1111-1111-111111111101';

  const demoOrder: DetailedOrder = {
    id: initialOrderId,
    order_number: 'VL-2026-8941',
    user_id: '33333333-3333-3333-3333-333333333303', // Client account
    status: 'PROCESSING',
    payment_status: 'SUCCESS',
    subtotal: 132000.0,
    discount_total: 19800.0,
    tax_total: 20196.0,
    shipping_total: 0.0,
    grand_total: 132396.0,
    customer_notes: 'Please arrange freight elevator booking prior to arrival.',
    idempotency_key: 'idemp_demo_initial_01',
    created_at: '2026-09-24T10:30:00Z',
    updated_at: '2026-09-24T10:35:00Z',
    items: [
      {
        id: crypto.randomUUID(),
        order_id: initialOrderId,
        variant_id: '88888888-8888-8888-8888-888888888801',
        product_name: 'The Solis Bouclé Lounge Chair',
        sku: 'VEL-SOL-IVY',
        unit_price: 78000.0,
        quantity: 1,
        total_price: 78000.0,
        created_at: '2026-09-24T10:30:00Z',
      },
      {
        id: crypto.randomUUID(),
        order_id: initialOrderId,
        variant_id: '88888888-8888-8888-8888-888888888803',
        product_name: 'The Kyoto Low Coffee Table',
        sku: 'VEL-KYO-WAL',
        unit_price: 54000.0,
        quantity: 1,
        total_price: 54000.0,
        created_at: '2026-09-24T10:30:00Z',
      },
    ],
    customer_info: {
      full_name: 'Aarav Mehta',
      email: 'client@example.com',
      phone: '+91 98111 22334',
      shipping_address: 'Penthouse 42B, The Imperial Towers, Tardeo Main Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400034',
    },
    payment: {
      id: initialPaymentId,
      order_id: initialOrderId,
      payment_method: 'UPI',
      amount: 132396.0,
      currency: 'INR',
      status: 'SUCCESS',
      created_at: '2026-09-24T10:32:00Z',
      updated_at: '2026-09-24T10:32:15Z',
      transactions: [
        {
          id: crypto.randomUUID(),
          payment_id: initialPaymentId,
          transaction_ref: 'pay_rzp_mock_982347102',
          gateway_name: 'Razorpay',
          gateway_order_id: 'order_rzp_8941',
          status: 'SUCCESS',
          raw_response: { method: 'upi', bank: 'HDFC', vpa: 'aarav@okaxis' },
          created_at: '2026-09-24T10:32:15Z',
        },
      ],
    },
    shipment: {
      id: initialShipmentId,
      order_id: initialOrderId,
      tracking_number: 'VEL-WG-2026-8941',
      carrier: 'Veloura White-Glove Logistics',
      status: 'IN_TRANSIT',
      estimated_delivery: '2026-10-06T18:00:00Z',
      shipped_at: '2026-09-26T14:00:00Z',
      created_at: '2026-09-24T10:35:00Z',
      updated_at: '2026-09-26T14:00:00Z',
      events: [
        {
          status: 'PENDING',
          location: 'Veloura Craft Atelier, Bengaluru',
          description: 'Custom joinery and bouclé upholstery verified by Master Craftsman.',
          timestamp: '2026-09-24T11:00:00Z',
        },
        {
          status: 'PICKED_UP',
          location: 'Bengaluru Central Logistics Depot',
          description: 'Crated in custom shock-absorbing timber casings.',
          timestamp: '2026-09-25T16:30:00Z',
        },
        {
          status: 'IN_TRANSIT',
          location: 'Climate-Controlled Air Freight to Mumbai Hub',
          description: 'In transit via dedicated air freight carriage.',
          timestamp: '2026-09-26T14:00:00Z',
        },
      ],
    },
  };

  ordersStore.set(demoOrder.id, demoOrder);
  idempotencyRegistry.set('idemp_demo_initial_01', demoOrder.id);
}

// ============================================================================
// ORDER CREATION & LIFECYCLE
// ============================================================================

export function createOrder(params: {
  ownerKey: string;
  userId?: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  shippingMethod?: 'standard' | 'express' | 'fragile';
  paymentMethod: PaymentMethodEnum;
  couponCode?: string;
  currency?: CurrencyCode;
  codVerificationId?: string;
  customerNotes?: string;
  idempotencyKey?: string;
}): { order: DetailedOrder; isDuplicate: boolean; error?: string } {
  initOrderStore();
  const { ownerKey, userId, customerInfo, shippingMethod = 'standard', paymentMethod, couponCode, currency = 'INR', codVerificationId, customerNotes, idempotencyKey } = params;

  // 1. Idempotency Check (Prevent duplicate charges on network retries)
  if (idempotencyKey && idempotencyRegistry.has(idempotencyKey)) {
    const existingOrderId = idempotencyRegistry.get(idempotencyKey)!;
    const existingOrder = ordersStore.get(existingOrderId);
    if (existingOrder) {
      return { order: existingOrder, isDuplicate: true };
    }
  }

  // 2. Authoritative Price & Cart Calculation
  const checkoutSummary = calculateAuthoritativeCheckout({
    ownerKey,
    shippingMethod,
    couponCode,
    paymentMethod,
    targetCurrency: currency,
  });

  if (!checkoutSummary.is_valid || checkoutSummary.cart.items.length === 0) {
    return {
      order: {} as DetailedOrder,
      isDuplicate: false,
      error: checkoutSummary.errors[0] || 'Cannot place order with empty cart.',
    };
  }

  // 3. Inventory Stock Validation & Deduction (Concurrency Protection)
  for (const item of checkoutSummary.cart.items) {
    const variant = getVariantBySku(item.sku);
    if (!variant || variant.stock < item.quantity) {
      return {
        order: {} as DetailedOrder,
        isDuplicate: false,
        error: `Insufficient inventory for ${item.product_name} (${item.variant_name}). Only ${variant?.stock || 0} left.`,
      };
    }
  }

  // Deduct inventory stock
  for (const item of checkoutSummary.cart.items) {
    const variant = getVariantBySku(item.sku)!;
    updateVariantStock(item.sku, variant.stock - item.quantity);
  }

  // 4. Construct Order Record
  const orderId = crypto.randomUUID();
  const paymentId = crypto.randomUUID();
  const shipmentId = crypto.randomUUID();
  const orderNumber = `VL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const orderItems: DbOrderItem[] = checkoutSummary.cart.items.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    variant_id: item.variant_id,
    product_name: item.product_name,
    sku: item.sku,
    unit_price: item.unit_price,
    quantity: item.quantity,
    total_price: item.total_price,
    created_at: now,
  }));

  const estDeliveryDate = new Date();
  estDeliveryDate.setDate(estDeliveryDate.getDate() + (shippingMethod === 'express' ? 3 : 7));

  const trackingNumber = `VEL-WG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: DetailedOrder = {
    id: orderId,
    order_number: orderNumber,
    user_id: userId,
    status: 'PLACED',
    payment_status: paymentMethod === 'COD' ? 'PENDING' : 'INITIATED',
    payment_method: paymentMethod,
    currency,
    exchange_rate: currencyEngine.getCurrency(currency).rateFromINR,
    subtotal: checkoutSummary.subtotal,
    discount_total: checkoutSummary.discount.amount,
    tax_total: checkoutSummary.tax.amount,
    shipping_total: checkoutSummary.shipping.amount,
    cod_handling_fee: checkoutSummary.cod?.fee || 0,
    cod_verified: paymentMethod === 'COD' ? true : undefined,
    grand_total: checkoutSummary.grand_total,
    customer_notes: customerNotes,
    idempotency_key: idempotencyKey,
    created_at: now,
    updated_at: now,
    items: orderItems,
    customer_info: {
      full_name: customerInfo.fullName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      shipping_address: `${customerInfo.addressLine1}${customerInfo.addressLine2 ? `, ${customerInfo.addressLine2}` : ''}`,
      city: customerInfo.city,
      state: customerInfo.state,
      postal_code: customerInfo.postalCode,
    },
    payment: {
      id: paymentId,
      order_id: orderId,
      payment_method: paymentMethod,
      amount: checkoutSummary.grand_total,
      currency: currency || 'INR',
      status: paymentMethod === 'COD' ? 'PENDING' : 'INITIATED',
      created_at: now,
      updated_at: now,
      transactions: [],
    },

    shipment: {
      id: shipmentId,
      order_id: orderId,
      tracking_number: trackingNumber,
      carrier: 'Veloura White-Glove Logistics',
      status: 'PENDING',
      estimated_delivery: estDeliveryDate.toISOString(),
      created_at: now,
      updated_at: now,
      events: [
        {
          status: 'PENDING',
          location: 'Veloura Architectural Atelier',
          description: 'Order placed. White-glove artisan crafting and inspection scheduled.',
          timestamp: now,
        },
      ],
    },
  };

  ordersStore.set(orderId, newOrder);
  if (idempotencyKey) {
    idempotencyRegistry.set(idempotencyKey, orderId);
  }

  // 5. Clear cart after authoritative order placement
  clearCart(ownerKey);

  // 6. Trigger Multi-Channel Notifications (Email, SMS, WhatsApp & In-App)
  try {
    notificationService.notifyOrderPlaced(newOrder);
  } catch (e) {
    // Non-blocking notification dispatch
  }

  return { order: newOrder, isDuplicate: false };
}

export function getOrderById(id: string): DetailedOrder | undefined {
  return getOrderByIdOrNumber(id);
}

export function getOrderByIdOrNumber(idOrNumber: string): DetailedOrder | undefined {
  initOrderStore();
  if (ordersStore.has(idOrNumber)) {
    return ordersStore.get(idOrNumber);
  }
  for (const o of ordersStore.values()) {
    if (o.order_number.toUpperCase() === idOrNumber.toUpperCase()) {
      return o;
    }
  }
  return undefined;
}


export function getOrdersByUserId(userId: string): DetailedOrder[] {
  initOrderStore();
  return Array.from(ordersStore.values())
    .filter((o) => o.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getAllOrders(filters: {
  status?: OrderStatusEnum;
  paymentStatus?: PaymentStatusEnum;
  limit?: number;
  page?: number;
} = {}): { orders: DetailedOrder[]; total: number; totalPages: number } {
  initOrderStore();
  let list = Array.from(ordersStore.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (filters.status) {
    list = list.filter((o) => o.status === filters.status);
  }
  if (filters.paymentStatus) {
    list = list.filter((o) => o.payment_status === filters.paymentStatus);
  }

  const total = list.length;
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(100, filters.limit || 20));
  const totalPages = Math.ceil(total / limit);

  return {
    orders: list.slice((page - 1) * limit, page * limit),
    total,
    totalPages,
  };
}

export function updateOrderStatus(orderId: string, newStatus: OrderStatusEnum): DetailedOrder | undefined {
  initOrderStore();
  const order = ordersStore.get(orderId);
  if (!order) return undefined;

  order.status = newStatus;
  order.updated_at = new Date().toISOString();

  // Trigger automated shipment progression
  if (order.shipment) {
    if (newStatus === 'SHIPPED') {
      order.shipment.status = 'IN_TRANSIT';
      order.shipment.shipped_at = new Date().toISOString();
      order.shipment.events.push({
        status: 'IN_TRANSIT',
        location: 'Depot Transit Hub',
        description: 'Dispatched via dedicated white-glove climate-controlled carrier.',
        timestamp: new Date().toISOString(),
      });
    } else if (newStatus === 'OUT_FOR_DELIVERY') {
      order.shipment.status = 'OUT_FOR_DELIVERY';
      order.shipment.events.push({
        status: 'OUT_FOR_DELIVERY',
        location: 'Local Destination Depot',
        description: 'White-glove delivery team en route for placement and room assembly.',
        timestamp: new Date().toISOString(),
      });
    } else if (newStatus === 'DELIVERED') {
      order.shipment.status = 'DELIVERED';
      order.shipment.delivered_at = new Date().toISOString();
      order.shipment.events.push({
        status: 'DELIVERED',
        location: order.customer_info?.city || 'Client Residence',
        description: 'Delivered, placed, and inspected with client sign-off.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Trigger real-time multi-channel notification alerts
  try {
    if (newStatus === 'SHIPPED') {
      notificationService.notifyOrderShipped(order);
    } else if (newStatus === 'OUT_FOR_DELIVERY') {
      notificationService.notifyOrderOutForDelivery(order);
    } else if (newStatus === 'DELIVERED') {
      notificationService.notifyOrderDelivered(order);
    }
  } catch (e) {
    // Non-blocking notification dispatch
  }

  return order;
}

// ============================================================================
// PAYMENTS & WEBHOOKS
// ============================================================================

export function recordPaymentTransaction(params: {
  orderId: string;
  transactionRef: string;
  gatewayName: string;
  gatewayOrderId?: string;
  status: PaymentStatusEnum;
  rawResponse?: Record<string, any>;
}): DetailedOrder | undefined {
  initOrderStore();
  const order = ordersStore.get(params.orderId);
  if (!order) return undefined;

  const transaction: DbPaymentTransaction = {
    id: crypto.randomUUID(),
    payment_id: order.payment ? order.payment.id : crypto.randomUUID(),
    transaction_ref: params.transactionRef,
    gateway_name: params.gatewayName,
    gateway_order_id: params.gatewayOrderId,
    status: params.status,
    raw_response: params.rawResponse,
    created_at: new Date().toISOString(),
  };

  if (!order.payment) {
    order.payment = {
      id: transaction.payment_id,
      order_id: order.id,
      payment_method: 'CARD',
      amount: order.grand_total,
      currency: 'INR',
      status: params.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      transactions: [transaction],
    };
  } else {
    order.payment.status = params.status;
    order.payment.updated_at = new Date().toISOString();
    order.payment.transactions.push(transaction);
  }

  order.payment_status = params.status;
  if (params.status === 'SUCCESS') {
    order.status = 'CONFIRMED';
  } else if (params.status === 'FAILED') {
    order.status = 'CANCELLED';
  }
  order.updated_at = new Date().toISOString();

  return order;
}

export { createOrder as createOrderAuthoritative };

