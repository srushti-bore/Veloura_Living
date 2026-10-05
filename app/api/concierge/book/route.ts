import { NextRequest } from 'next/server';
import { TradeStore } from '@/lib/data/tradeStore';
import { sendSuccess, sendError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || undefined;
    const bookings = TradeStore.getVIPBookings(email);
    return sendSuccess(bookings);
  } catch (error: any) {
    return sendError(error.message || 'Failed to retrieve VIP concierge bookings', 'INTERNAL_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientName,
      email,
      phone,
      serviceType,
      scheduledDate,
      timeSlot,
      locationOrVirtual,
      roomDetails,
    } = body;

    if (!clientName || !email || !phone || !serviceType || !scheduledDate || !timeSlot) {
      return sendError(
        'clientName, email, phone, serviceType, scheduledDate, and timeSlot are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    const booking = TradeStore.bookVIPConcierge({
      clientName,
      email,
      phone,
      serviceType,
      scheduledDate,
      timeSlot,
      locationOrVirtual: locationOrVirtual || 'Atelier Virtual Spatial Tour',
      roomDetails,
    });

    return sendSuccess(booking, 201);
  } catch (error: any) {
    return sendError(error.message || 'Failed to book VIP concierge appointment', 'INTERNAL_ERROR', 500);
  }
}
