import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError, NotFoundError } from '@/lib/api/errorHandler';
import { requireAuth } from '@/lib/auth/session';
import { initAuthStore, findUserById, saveUserRecord } from '@/lib/data/authStore';
import { DbAddress } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await initAuthStore();
    const session = await requireAuth(request);
    const record = findUserById(session.id);
    if (!record) {
      throw new NotFoundError('User not found.');
    }
    return successResponse(record.addresses || [], 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await initAuthStore();
    const session = await requireAuth(request);
    const record = findUserById(session.id);
    if (!record) {
      throw new NotFoundError('User not found.');
    }

    const body = await request.json();
    const { fullName, phone, addressLine1, addressLine2, landmark, city, state, postalCode, country, isDefaultShipping, isDefaultBilling } = body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      throw new ValidationError('Required address fields are missing.');
    }

    const newAddressId = crypto.randomUUID();
    const now = new Date().toISOString();

    // If marked as default, unset other defaults
    if (isDefaultShipping) {
      record.addresses.forEach((a) => (a.is_default_shipping = false));
    }
    if (isDefaultBilling) {
      record.addresses.forEach((a) => (a.is_default_billing = false));
    }

    const newAddress: DbAddress = {
      id: newAddressId,
      user_id: session.id,
      full_name: fullName,
      phone,
      address_line1: addressLine1,
      address_line2: addressLine2 || '',
      landmark: landmark || '',
      city,
      state,
      postal_code: postalCode,
      country: country || 'India',
      is_default_shipping: isDefaultShipping || record.addresses.length === 0,
      is_default_billing: isDefaultBilling || record.addresses.length === 0,
      created_at: now,
      updated_at: now,
    };

    record.addresses.push(newAddress);
    saveUserRecord(record);

    return successResponse(newAddress, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
