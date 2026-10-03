import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, NotFoundError } from '@/lib/api/errorHandler';
import { requireAuth } from '@/lib/auth/session';
import { initAuthStore, findUserById, saveUserRecord } from '@/lib/data/authStore';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initAuthStore();
    const session = await requireAuth(request);
    const { id } = await params;

    const record = findUserById(session.id);
    if (!record) {
      throw new NotFoundError('User not found.');
    }

    const addressIndex = record.addresses.findIndex((a) => a.id === id);
    if (addressIndex === -1) {
      throw new NotFoundError('Address not found.');
    }

    const body = await request.json();
    const target = record.addresses[addressIndex];

    if (body.isDefaultShipping) {
      record.addresses.forEach((a) => (a.is_default_shipping = false));
    }
    if (body.isDefaultBilling) {
      record.addresses.forEach((a) => (a.is_default_billing = false));
    }

    record.addresses[addressIndex] = {
      ...target,
      full_name: body.fullName ?? target.full_name,
      phone: body.phone ?? target.phone,
      address_line1: body.addressLine1 ?? target.address_line1,
      address_line2: body.addressLine2 ?? target.address_line2,
      landmark: body.landmark ?? target.landmark,
      city: body.city ?? target.city,
      state: body.state ?? target.state,
      postal_code: body.postalCode ?? target.postal_code,
      country: body.country ?? target.country,
      is_default_shipping: body.isDefaultShipping ?? target.is_default_shipping,
      is_default_billing: body.isDefaultBilling ?? target.is_default_billing,
      updated_at: new Date().toISOString(),
    };

    saveUserRecord(record);
    return successResponse(record.addresses[addressIndex], 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initAuthStore();
    const session = await requireAuth(request);
    const { id } = await params;

    const record = findUserById(session.id);
    if (!record) {
      throw new NotFoundError('User not found.');
    }

    const addressIndex = record.addresses.findIndex((a) => a.id === id);
    if (addressIndex === -1) {
      throw new NotFoundError('Address not found.');
    }

    record.addresses.splice(addressIndex, 1);
    saveUserRecord(record);

    return successResponse({ message: 'Address successfully removed.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
