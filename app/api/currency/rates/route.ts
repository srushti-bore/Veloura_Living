import { NextRequest } from 'next/server';
import { currencyEngine } from '@/lib/services/currencyEngine';
import { sendSuccess } from '@/lib/api/response';

export async function GET(request?: NextRequest) {
  const summary = currencyEngine.getRatesSummary();
  return sendSuccess(summary);
}
