import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { requireRole } from '@/lib/auth/session';
import { getAllOrders } from '@/lib/data/orderStore';
import { getProducts } from '@/lib/data/catalogStore';
import { getReviews, getReturns, getRefunds } from '@/lib/data/postPurchaseStore';
import { getAllUsers } from '@/lib/data/userRepository';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['ADMIN', 'MANAGER', 'PRODUCT_MANAGER', 'ORDER_MANAGER']);

    const { orders, total: totalOrders } = getAllOrders({ limit: 1000 });
    const { products, total: totalProducts } = getProducts({}, { limit: 1000 });
    const { reviews, summary: reviewSummary } = getReviews({ limit: 1000 });
    const { returns, total: totalReturns } = getReturns({ limit: 1000 });
    const refunds = getRefunds({});

    // Calculate Financials
    const totalGrossRevenue = orders
      .filter((o) => o.payment_status === 'SUCCESS' || o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.grand_total, 0);

    const averageOrderValue = totalOrders > 0 ? Math.round(totalGrossRevenue / totalOrders) : 0;

    const lowStockItems = products.filter((p) => p.availability === 'low_stock' || p.availability === 'out_of_stock');

    const ordersByStatus = {
      PLACED: orders.filter((o) => o.status === 'PLACED').length,
      CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
      PROCESSING: orders.filter((o) => o.status === 'PROCESSING').length,
      SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
      OUT_FOR_DELIVERY: orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length,
      DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    };

    const allUserRecords = getAllUsers();
    const totalCustomers = allUserRecords.filter((u) => !u.roles.includes('ADMIN')).length || 1;

    return successResponse(
      {
        totalRevenue: totalGrossRevenue,
        totalOrders,
        totalCustomers,
        averageOrderValue,
        totalProducts,
        activeProducts: products.filter((p) => p.availability !== 'out_of_stock').length,
        lowStockCount: lowStockItems.length,
        lowStockItems: lowStockItems.map((p) => ({
          id: p.id,
          name: p.name,
          total_inventory: p.total_inventory,
          availability: p.availability,
        })),
        ordersByStatus,
        returnsCount: totalReturns,
        pendingReturns: returns.filter((r) => r.status === 'RETURN_REQUESTED').length,
        refundsCount: refunds.length,
        totalRefundedAmount: refunds.reduce((sum, r) => sum + r.amount, 0),
        reviewsAverage: reviewSummary.averageRating,
        totalReviews: reviewSummary.totalReviews,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
