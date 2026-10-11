import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { requireRole } from '@/lib/auth/session';
import { getAllUsers } from '@/lib/data/userRepository';
import { getOrdersByUserId } from '@/lib/data/orderStore';

export async function GET(request: NextRequest) {
  try {
    // Enforce admin/manager authorization
    await requireRole(request, ['ADMIN', 'MANAGER']);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';
    const status = searchParams.get('status')?.toUpperCase() || '';

    const allRecords = getAllUsers();

    // Filter to customers only
    let customers = allRecords.filter((rec) => {
      const isCustomer = !rec.roles.includes('ADMIN');
      if (!isCustomer) return false;

      if (status && rec.user.status !== status) return false;

      if (query) {
        const emailMatch = rec.user.email.toLowerCase().includes(query);
        const nameMatch =
          rec.profile?.first_name?.toLowerCase().includes(query) ||
          rec.profile?.last_name?.toLowerCase().includes(query);
        const phoneMatch = rec.profile?.phone?.toLowerCase().includes(query);
        if (!emailMatch && !nameMatch && !phoneMatch) return false;
      }

      return true;
    });

    // Map safely without any sensitive data
    const sanitized = customers.map((rec) => {
      const userOrders = getOrdersByUserId(rec.user.id);
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.grand_total || 0), 0);

      return {
        id: rec.user.id,
        email: rec.user.email,
        status: rec.user.status,
        createdAt: rec.user.created_at,
        firstName: rec.profile?.first_name || '',
        lastName: rec.profile?.last_name || '',
        fullName:
          [rec.profile?.first_name, rec.profile?.last_name].filter(Boolean).join(' ') ||
          rec.user.email.split('@')[0],
        phone: rec.profile?.phone || '—',
        avatarUrl: rec.profile?.avatar_url || '',
        ordersCount: userOrders.length,
        totalSpent,
        addresses: rec.addresses || [],
        recentOrders: userOrders.slice(0, 5).map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          grandTotal: o.grand_total,
          status: o.status,
          createdAt: o.created_at,
        })),
      };
    });

    return successResponse(sanitized, 200, {
      total: sanitized.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
