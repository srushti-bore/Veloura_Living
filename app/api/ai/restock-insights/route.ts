import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { requireRole } from '@/lib/auth/session';
import { getProducts } from '@/lib/data/catalogStore';

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, ['ADMIN', 'MANAGER', 'PRODUCT_MANAGER']);

    const { products } = getProducts({}, { limit: 100 });

    const restockRecommendations = products.map((p) => {
      const currentStock = p.total_inventory;
      const dailyVelocity = Math.max(0.2, Number((p.base_price > 100000 ? 0.3 : 0.8).toFixed(2)));
      const daysUntilStockout = currentStock > 0 ? Math.round(currentStock / dailyVelocity) : 0;
      const recommendedReorder = currentStock <= 5 ? Math.max(10, 15 - currentStock) : 0;
      const priority = currentStock <= 2 ? 'CRITICAL' : currentStock <= 5 ? 'HIGH' : 'NORMAL';

      return {
        productId: p.id,
        productName: p.name,
        category: p.category_name,
        currentStock,
        dailyVelocityUnits: dailyVelocity,
        estimatedDaysUntilStockout: daysUntilStockout,
        recommendedReorderQuantity: recommendedReorder,
        restockUrgency: priority,
        aiRationale:
          currentStock <= 2
            ? 'High conversion velocity during seasonal living room refreshes. Restock immediately to prevent revenue loss.'
            : currentStock <= 5
            ? 'Velocity stable. Recommended replenishment with next artisan workshop batch.'
            : 'Optimal inventory balance maintained.',
      };
    });

    return successResponse(
      {
        totalSkusAudited: products.length,
        criticalAlertsCount: restockRecommendations.filter((r) => r.restockUrgency === 'CRITICAL').length,
        recommendedActionItems: restockRecommendations.filter((r) => r.recommendedReorderQuantity > 0),
        fullCatalogForecasts: restockRecommendations,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
