import { NextRequest } from 'next/server';
import { currencyEngine } from '@/lib/services/currencyEngine';
import { sendSuccess, sendError } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amountInINR, targetCurrency } = body;

    if (amountInINR === undefined || typeof amountInINR !== 'number') {
      return sendError('amountInINR must be a valid number', 'VALIDATION_ERROR', 400);
    }

    const currency = targetCurrency || 'INR';
    const convertedAmount = currencyEngine.convertFromINR(amountInINR, currency);
    const formattedPrice = currencyEngine.formatPrice(amountInINR, currency);
    const currencyConfig = currencyEngine.getCurrency(currency);

    return sendSuccess({
      amountInINR,
      targetCurrency: currencyConfig.code,
      convertedAmount,
      formattedPrice,
      rate: currencyConfig.rateFromINR,
      symbol: currencyConfig.symbol,
    });
  } catch (error: any) {
    return sendError(error.message || 'Currency conversion failed', 'BUSINESS_RULE_ERROR', 400);
  }
}
