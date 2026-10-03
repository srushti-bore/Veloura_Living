import {
  DbReview,
  DbReturn,
  DbRefund,
  ReviewStatusEnum,
  ReturnStatusEnum,
  PaymentStatusEnum,
} from '@/types';
import { adjustVariantStock } from './catalogStore';
import { getOrdersByUserId, getAllOrders, updateOrderStatus, getOrderById } from './orderStore';



// In-Memory Data Collections
const reviewsStore: Map<string, DbReview> = new Map();
const returnsStore: Map<string, DbReturn> = new Map();
const refundsStore: Map<string, DbRefund> = new Map();
let isPostPurchaseInitialized = false;

export function initPostPurchaseStore() {
  if (isPostPurchaseInitialized) return;
  isPostPurchaseInitialized = true;

  // 1. Initial Seed Reviews
  const seedReviews: DbReview[] = [
    {
      id: 'rev-001',
      product_id: '99999999-9999-9999-9999-999999999901', // Solis Bouclé Lounge Chair
      user_id: '33333333-3333-3333-3333-333333333303', // Aarav Mehta
      user_name: 'Aarav Mehta',
      order_id: '44444444-1111-1111-1111-111111111101',
      rating: 5,
      title: 'Architectural Masterpiece & Supreme Comfort',
      comment: 'The Solis Bouclé Chair completely redefined our living gallery. The bouclé weave is supremely tactile, and the proportions are harmonious. White-glove delivery was flawless.',
      helpful_count: 14,
      is_verified_purchase: true,
      status: 'APPROVED',
      created_at: '2026-09-25T14:20:00Z',
      updated_at: '2026-09-25T14:20:00Z',
    },
    {
      id: 'rev-002',
      product_id: '99999999-9999-9999-9999-999999999901', // Solis Bouclé Lounge Chair
      user_id: '33333333-3333-3333-3333-333333333304',
      user_name: 'Mira Kapoor',
      rating: 5,
      title: 'Sculptural silhouette in rich ivory',
      comment: 'An understated centerpiece. Even in low evening light, the curves cast gentle shadows. Worth every rupee.',
      helpful_count: 9,
      is_verified_purchase: true,
      status: 'APPROVED',
      created_at: '2026-09-28T09:15:00Z',
      updated_at: '2026-09-28T09:15:00Z',
    },
    {
      id: 'rev-003',
      product_id: '99999999-9999-9999-9999-999999999902', // Kyoto Low Coffee Table
      user_id: '33333333-3333-3333-3333-333333333303',
      user_name: 'Aarav Mehta',
      order_id: '44444444-1111-1111-1111-111111111101',
      rating: 5,
      title: 'Solid Japanese Walnut with fluted perfection',
      comment: 'Heavy, grounded, and organic. The satin oil finish protects against water rings while preserving the warm natural grain.',
      helpful_count: 7,
      is_verified_purchase: true,
      status: 'APPROVED',
      created_at: '2026-09-26T11:45:00Z',
      updated_at: '2026-09-26T11:45:00Z',
    },
    {
      id: 'rev-004',
      product_id: '99999999-9999-9999-9999-999999999903', // Elysian Platform Bed
      user_id: '33333333-3333-3333-3333-333333333305',
      user_name: 'Devika Singhania',
      rating: 5,
      title: 'Floating serenity for the master sanctuary',
      comment: 'The integrated bedside cantilever ledges eliminated clutter. Solid French oak framing that feels timeless and quiet.',
      helpful_count: 12,
      is_verified_purchase: true,
      status: 'APPROVED',
      created_at: '2026-09-27T16:30:00Z',
      updated_at: '2026-09-27T16:30:00Z',
    },
  ];

  for (const rev of seedReviews) {
    reviewsStore.set(rev.id, rev);
  }

  // 2. Initial Seed Return & Refund
  const seedReturnId = 'ret-demo-001';
  const seedReturn: DbReturn = {
    id: seedReturnId,
    order_id: '44444444-1111-1111-1111-111111111101',
    order_number: 'VL-2026-8941',
    user_id: '33333333-3333-3333-3333-333333333303',
    user_email: 'client@example.com',
    items: [
      {
        variant_id: '88888888-8888-8888-8888-888888888803',
        product_name: 'The Kyoto Low Coffee Table',
        sku: 'VEL-KYO-WAL',
        quantity: 1,
        unit_price: 54000.0,
      },
    ],
    reason: 'Dimension variance with bespoke rug layout. Opting for the Grand Salon size.',
    condition: 'Pristine in original protective wrapping.',
    status: 'RETURN_APPROVED',
    requested_at: '2026-09-28T10:00:00Z',
    reviewed_at: '2026-09-28T14:30:00Z',
    reviewed_by: '22222222-2222-2222-2222-222222222202', // Concierge / Manager
    tracking_number: 'RET-VEL-49021',
  };
  returnsStore.set(seedReturnId, seedReturn);
}

// ============================================================================
// 1. PRODUCT REVIEWS & STAR RATINGS
// ============================================================================

export interface ReviewRatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export function getReviews(filter: {
  productId?: string;
  userId?: string;
  status?: ReviewStatusEnum;
  minRating?: number;
  page?: number;
  limit?: number;
}): {
  reviews: DbReview[];
  summary: ReviewRatingSummary;
  total: number;
  totalPages: number;
} {
  initPostPurchaseStore();
  let list = Array.from(reviewsStore.values());

  if (filter.productId) {
    list = list.filter((r) => r.product_id === filter.productId);
  }
  if (filter.userId) {
    list = list.filter((r) => r.user_id === filter.userId);
  }
  if (filter.status) {
    list = list.filter((r) => r.status === filter.status);
  } else {
    // By default for public requests, show APPROVED reviews
    list = list.filter((r) => r.status === 'APPROVED');
  }
  if (filter.minRating) {
    list = list.filter((r) => r.rating >= filter.minRating!);
  }

  // Calculate rating summary
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;

  for (const r of list) {
    const star = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    dist[star] = (dist[star] || 0) + 1;
    ratingSum += r.rating;
  }

  const totalReviews = list.length;
  const averageRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 5.0;

  // Sort descending by creation date
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, Math.min(50, filter.limit || 10));
  const totalPages = Math.ceil(totalReviews / limit);

  return {
    reviews: list.slice((page - 1) * limit, page * limit),
    summary: {
      averageRating,
      totalReviews,
      ratingDistribution: dist,
    },
    total: totalReviews,
    totalPages,
  };
}

export function createReview(data: {
  productId: string;
  userId: string;
  userName?: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}): DbReview {
  initPostPurchaseStore();

  // Check verified purchase
  let isVerified = false;
  if (data.orderId) {
    const order = getOrderById(data.orderId);
    if (order && order.user_id === data.userId) {
      isVerified = true;
    }
  } else {
    // Look up user's previous orders
    const userOrders = getOrdersByUserId(data.userId);
    isVerified = userOrders.some((o) =>
      o.items.some((item) => item.variant_id && item.variant_id.length > 0)
    );

  }

  const newReview: DbReview = {
    id: `rev-${crypto.randomUUID().slice(0, 8)}`,
    product_id: data.productId,
    user_id: data.userId,
    user_name: data.userName || 'Veloura Client',
    order_id: data.orderId,
    rating: Math.max(1, Math.min(5, Math.round(data.rating))),
    title: data.title?.trim(),
    comment: data.comment.trim(),
    images: data.images || [],
    helpful_count: 0,
    is_verified_purchase: isVerified,
    status: 'APPROVED', // High trust luxury concierge auto-approval with admin moderation option
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  reviewsStore.set(newReview.id, newReview);
  return newReview;
}

export function voteReviewHelpful(reviewId: string): DbReview | undefined {
  initPostPurchaseStore();
  const review = reviewsStore.get(reviewId);
  if (!review) return undefined;

  review.helpful_count = (review.helpful_count || 0) + 1;
  review.updated_at = new Date().toISOString();
  return review;
}

export function updateReviewStatus(reviewId: string, status: ReviewStatusEnum): DbReview | undefined {
  initPostPurchaseStore();
  const review = reviewsStore.get(reviewId);
  if (!review) return undefined;

  review.status = status;
  review.updated_at = new Date().toISOString();
  return review;
}

export function deleteReview(reviewId: string, userId: string, isAdmin = false): boolean {
  initPostPurchaseStore();
  const review = reviewsStore.get(reviewId);
  if (!review) return false;

  if (!isAdmin && review.user_id !== userId) {
    return false;
  }

  return reviewsStore.delete(reviewId);
}

// ============================================================================
// 2. RETURNS & RETURN REQUEST ENGINE
// ============================================================================

export function getReturns(filter: {
  userId?: string;
  orderId?: string;
  status?: ReturnStatusEnum;
  page?: number;
  limit?: number;
}): {
  returns: DbReturn[];
  total: number;
  totalPages: number;
} {
  initPostPurchaseStore();
  let list = Array.from(returnsStore.values());

  if (filter.userId) {
    list = list.filter((r) => r.user_id === filter.userId);
  }
  if (filter.orderId) {
    list = list.filter((r) => r.order_id === filter.orderId);
  }
  if (filter.status) {
    list = list.filter((r) => r.status === filter.status);
  }

  list.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());

  const total = list.length;
  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, Math.min(50, filter.limit || 10));
  const totalPages = Math.ceil(total / limit);

  return {
    returns: list.slice((page - 1) * limit, page * limit),
    total,
    totalPages,
  };
}

export function getReturnById(id: string): DbReturn | undefined {
  initPostPurchaseStore();
  return returnsStore.get(id);
}

export function createReturnRequest(data: {
  orderId: string;
  userId: string;
  userEmail?: string;
  items?: Array<{
    variant_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
  }>;
  reason: string;
  condition?: string;
  images?: string[];
}): DbReturn {
  initPostPurchaseStore();

  const order = getOrderById(data.orderId);
  if (!order) {
    throw new Error(`Order ${data.orderId} not found.`);
  }

  // Check authorization
  if (order.user_id && order.user_id !== data.userId) {
    throw new Error('Unauthorized: This order does not belong to your account.');
  }

  // Enforce return state business rule (orders in DELIVERED or SHIPPED state)
  const allowedStatuses = ['DELIVERED', 'SHIPPED'];
  if (!allowedStatuses.includes(order.status)) {
    throw new Error(`Returns can only be requested for delivered orders. Current order status: ${order.status}`);
  }

  const returnId = `ret-${crypto.randomUUID().slice(0, 8)}`;
  const returnRecord: DbReturn = {
    id: returnId,
    order_id: order.id,
    order_number: order.order_number,
    user_id: data.userId,
    user_email: data.userEmail || order.customer_info?.email,
    items: data.items || order.items,
    reason: data.reason.trim(),
    condition: data.condition || 'Unused, intact with certificates of authenticity',
    images: data.images || [],
    status: 'RETURN_REQUESTED',
    requested_at: new Date().toISOString(),
  };

  returnsStore.set(returnId, returnRecord);
  return returnRecord;
}

export function updateReturnStatus(
  returnId: string,
  newStatus: ReturnStatusEnum,
  reviewedBy?: string,
  trackingNumber?: string
): DbReturn {
  initPostPurchaseStore();
  const ret = returnsStore.get(returnId);
  if (!ret) {
    throw new Error(`Return record ${returnId} not found.`);
  }

  ret.status = newStatus;
  ret.reviewed_at = new Date().toISOString();
  if (reviewedBy) ret.reviewed_by = reviewedBy;
  if (trackingNumber) ret.tracking_number = trackingNumber;

  // Automated inventory replenishment upon RETURN_RECEIVED
  if (newStatus === 'RETURN_RECEIVED' && ret.items) {
    for (const item of ret.items) {
      try {
        adjustVariantStock({
          sku: item.sku,
          quantityDelta: item.quantity, // Restock inventory
          movementType: 'RETURN',
          referenceId: ret.id,
          note: `Restocked upon verified return ${ret.id}`,
        });
      } catch (err) {
        console.warn(`Stock restock warning for ${item.sku}:`, err);
      }
    }
  }

  // Automated refund initiation when status reaches REFUNDED
  if (newStatus === 'REFUNDED' && !ret.refund_id) {
    const order = getOrderById(ret.order_id);
    const refundAmount = ret.items
      ? ret.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
      : order?.grand_total || 0;

    const refund = createRefundRecord({
      returnId: ret.id,
      orderId: ret.order_id,
      paymentId: order?.payment?.id || 'pay_system_generated',
      amount: refundAmount,
      reason: `Refund for return ${ret.id}: ${ret.reason}`,
    });

    ret.refund_id = refund.id;
  }

  return ret;
}

// ============================================================================
// 3. REFUNDS ENGINE
// ============================================================================

export function getRefunds(filter: {
  returnId?: string;
  orderId?: string;
  status?: PaymentStatusEnum;
}): DbRefund[] {
  initPostPurchaseStore();
  let list = Array.from(refundsStore.values());

  if (filter.returnId) {
    list = list.filter((r) => r.return_id === filter.returnId);
  }
  if (filter.orderId) {
    list = list.filter((r) => r.order_id === filter.orderId);
  }
  if (filter.status) {
    list = list.filter((r) => r.status === filter.status);
  }

  return list;
}

export function createRefundRecord(data: {
  returnId?: string;
  orderId: string;
  paymentId: string;
  amount: number;
  reason: string;
}): DbRefund {
  initPostPurchaseStore();

  const refundId = `ref-${crypto.randomUUID().slice(0, 8)}`;
  const refund: DbRefund = {
    id: refundId,
    return_id: data.returnId,
    order_id: data.orderId,
    payment_id: data.paymentId,
    amount: data.amount,
    currency: 'INR',
    gateway_refund_id: `gway_ref_${crypto.randomUUID().slice(0, 12)}`,
    reason: data.reason,
    status: 'SUCCESS', // Automatically processed via gateway integration
    processed_at: new Date().toISOString(),
  };

  refundsStore.set(refundId, refund);

  // Update order status to REFUNDED or PARTIALLY_REFUNDED
  const order = getOrderById(data.orderId);
  if (order) {
    order.payment_status = 'REFUNDED';
    order.updated_at = new Date().toISOString();
  }

  return refund;
}

// ============================================================================
// 4. ORDER CANCELLATION & AUTOMATED RESTOCK
// ============================================================================

export function cancelOrderAuthoritative(params: {
  orderId: string;
  userId: string;
  reason: string;
  isAdmin?: boolean;
}): { order: any; refund?: DbRefund } {
  initPostPurchaseStore();

  const order = getOrderById(params.orderId);
  if (!order) {
    throw new Error(`Order ${params.orderId} not found.`);
  }

  // Authorization check
  if (!params.isAdmin && order.user_id && order.user_id !== params.userId) {
    throw new Error('Unauthorized: Cannot cancel another client’s order.');
  }

  // Business rule check: only PLACED, CONFIRMED, PROCESSING can be cancelled
  const cancellableStatuses = ['PLACED', 'CONFIRMED', 'PROCESSING'];
  if (!cancellableStatuses.includes(order.status)) {
    throw new Error(
      `Order cannot be cancelled in status '${order.status}'. Since it has already been dispatched, please initiate a return once delivered.`
    );
  }

  // 1. Update order status
  order.status = 'CANCELLED';
  order.updated_at = new Date().toISOString();

  // 2. Replenish inventory back to available stock
  for (const item of order.items) {
    try {
      adjustVariantStock({
        sku: item.sku,
        quantityDelta: item.quantity,
        movementType: 'CANCELLATION',
        referenceId: order.id,
        note: `Restocked from cancelled order ${order.order_number}`,
      });
    } catch (err) {
      console.warn(`Stock replenishment warning for ${item.sku}:`, err);
    }
  }

  // 3. If already paid, issue automatic refund
  let refund: DbRefund | undefined = undefined;
  if (order.payment_status === 'SUCCESS') {
    refund = createRefundRecord({
      orderId: order.id,
      paymentId: order.payment?.id || 'pay_system_generated',
      amount: order.grand_total,
      reason: `Customer cancellation: ${params.reason}`,
    });
  }

  return { order, refund };
}
