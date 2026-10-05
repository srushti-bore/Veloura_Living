import { NextRequest } from 'next/server';
import { TradeStore } from '@/lib/data/tradeStore';
import { sendSuccess, sendError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get('partnerId') || undefined;
    const rfqs = TradeStore.getRFQs(partnerId);
    return sendSuccess(rfqs);
  } catch (error: any) {
    return sendError(error.message || 'Failed to retrieve project RFQs', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tradePartnerId,
      businessName,
      contactPerson,
      email,
      phone,
      projectTitle,
      projectLocation,
      targetInstallationDate,
      lineItems,
      notes,
    } = body;

    if (!businessName || !contactPerson || !email || !projectTitle || !lineItems || lineItems.length === 0) {
      return sendError(
        'businessName, contactPerson, email, projectTitle, and at least 1 line item are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    const rfq = TradeStore.createProjectRFQ({
      tradePartnerId,
      businessName,
      contactPerson,
      email,
      phone: phone || '+91 98200 00000',
      projectTitle,
      projectLocation: projectLocation || 'Mumbai, India',
      targetInstallationDate: targetInstallationDate || '2026-12-01',
      lineItems,
      notes,
    });

    return sendSuccess(rfq, 201);
  } catch (error: any) {
    return sendError(error.message || 'Failed to create project RFQ', 'INTERNAL_ERROR', 500);
  }
}
