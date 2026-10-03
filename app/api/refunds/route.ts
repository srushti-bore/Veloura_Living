import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, UnauthorizedError } from '@/lib/api/errorHandler';
import { getSession } from '@/lib/auth/session';
import { hasAnyRole } from '@/lib/auth/rbac';
import { getRefunds, createRefundRecord } from '@/lib/data/postPurchaseStore';
import { PaymentStatusEnum } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    // Require staff / admin privileges to inspect financial refunds ledger
    if (!session || !hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'ORDER_MANAGER'])) {
      throw new UnauthorizedError('Administrative privileges required to view refund transactions.');
    }

    const { searchParams } = new URL(request.url);
    const returnId = searchParams.get('returnId') || undefined;
    const orderId = searchParams.get('orderId') || undefined;
    const status = (searchParams.get('status') as PaymentStatusEnum) || undefined;

    const refunds = getRefunds({ returnId, orderId, status });
    return successResponse(refunds, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || !hasAnyRole(session.roles, ['ADMIN', 'MANAGER', 'ORDER_MANAGER'])) {
      throw new UnauthorizedError('Administrative privileges required to initiate refunds.');
    }

    const body = await request.json();
    const { orderId, amount, reason, paymentId, returnId } = body;

    if (!orderId || !amount || amount <= 0 || !reason) {
      throw new ValidationError('orderId, valid positive amount, and reason are required.');
    }

    const refund = createRefundRecord({
      orderId,
      paymentId: paymentId || 'pay_manual_gateway',
      amount: Number(amount),
      reason,
      returnId,
    });

    return successResponse(refund, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
