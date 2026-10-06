/**
 * 🏛️ Veloura Living — Razorpay Gateway & Automated Refund Service
 * Phase 11 Standard Implementation (PAY-001, RET-007)
 */

import crypto from 'crypto';

export interface RefundRequestOptions {
  paymentId: string;
  amountInINR: number;
  currency?: string;
  speed?: 'normal' | 'optimum';
  notes?: Record<string, string>;
  reason?: string;
}

export interface RefundResponseResult {
  success: boolean;
  refundId: string;
  amount: number;
  currency: string;
  speed: 'normal' | 'optimum';
  status: 'PROCESSED' | 'PENDING' | 'FAILED';
  gatewayArn?: string;
  failureReason?: string;
  processedAt: string;
  rawResponse?: Record<string, any>;
}

class RazorpayService {
  private get keyId(): string {
    return (
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY ||
      process.env.RAZOR_PAY_KEY_ID ||
      process.env.RZP_KEY_ID ||
      process.env.NEXT_PUBLIC_RZP_KEY_ID ||
      ''
    );
  }

  private get keySecret(): string {
    return (
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_SECRET_KEY ||
      process.env.RAZORPAY_SECRET ||
      process.env.RAZOR_PAY_KEY_SECRET ||
      process.env.RZP_KEY_SECRET ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET ||
      ''
    );
  }

  /**
   * Process automated direct refund via Razorpay API (RET-007)
   */
  public async processDirectRefund(options: RefundRequestOptions): Promise<RefundResponseResult> {
    const { paymentId, amountInINR, currency = 'INR', speed = 'optimum', notes, reason } = options;
    const amountInSubunits = Math.round(amountInINR * 100);

    if (!this.keyId || !this.keySecret) {
      return {
        success: false,
        refundId: `rfnd_err_${Date.now()}`,
        amount: amountInINR,
        currency,
        speed,
        status: 'FAILED',
        failureReason: 'Razorpay credentials are not configured on the server.',
        processedAt: new Date().toISOString(),
      };
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`;
      const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: amountInSubunits,
          speed,
          notes: {
            ...notes,
            reason: reason || 'Customer Return or Cancellation',
            system: 'Veloura Living Automation v2',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          refundId: `rfnd_failed_${Date.now()}`,
          amount: amountInINR,
          currency,
          speed,
          status: 'FAILED',
          failureReason: data.error?.description || data.error?.message || 'Gateway refund rejected',
          processedAt: new Date().toISOString(),
          rawResponse: data,
        };
      }

      return {
        success: true,
        refundId: data.id,
        amount: data.amount / 100,
        currency: data.currency,
        speed: data.speed === 'optimum' ? 'optimum' : 'normal',
        status: data.status === 'processed' ? 'PROCESSED' : 'PENDING',
        gatewayArn: data.acquirer_data?.arn || undefined,
        processedAt: new Date().toISOString(),
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        refundId: `rfnd_err_${Date.now()}`,
        amount: amountInINR,
        currency,
        speed,
        status: 'FAILED',
        failureReason: err.message || 'Network error during gateway refund',
        processedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Verify Razorpay Payment Signature using HMAC-SHA256
   */
  public verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!orderId || !paymentId || !signature || !this.keySecret) {
      return false;
    }
    try {
      const expected = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return (
        expected.length === signature.length &&
        crypto.timingSafeEqual(Buffer.from(expected, 'utf-8'), Buffer.from(signature, 'utf-8'))
      );
    } catch {
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();
