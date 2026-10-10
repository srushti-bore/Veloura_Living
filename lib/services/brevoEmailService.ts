/**
 * 🏛️ Veloura Living — Brevo Transactional Email Engine
 * Unified, resilient transactional email service communicating with Brevo REST API (v3).
 * Reference: Brevo SMTP API (https://api.brevo.com/v3/smtp/email)
 */

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoSender {
  email: string;
  name: string;
}

export interface SendEmailPayload {
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: BrevoSender;
  replyTo?: BrevoRecipient;
  tags?: string[];
  params?: Record<string, any>;
}

export type EmailDeliveryStatus =
  | 'ACCEPTED'          // Successfully accepted by Brevo REST API (HTTP 200/201)
  | 'REJECTED'          // Rejected by Brevo REST API (HTTP 4xx/5xx)
  | 'FAILED_PRECHECK'   // Failed prior to HTTP request (invalid email, missing API key in prod)
  | 'TIMEOUT_UNKNOWN'   // Network failure or timeout (cannot confirm acceptance)
  | 'SIMULATED';        // Development simulation mode (non-production only)

export interface SendEmailResult {
  success: boolean;
  deliveryStatus: EmailDeliveryStatus;
  messageId?: string;
  status?: number;
  error?: string;
  isMock?: boolean;
}

export class BrevoEmailService {
  private static instance: BrevoEmailService;

  private getApiKey(): string | undefined {
    return process.env.BREVO_API_KEY || process.env.SMTP_PASS || process.env.BREVO_KEY;
  }

  private getDefaultSender(): BrevoSender {
    const rawFrom = process.env.SMTP_FROM || process.env.BREVO_SENDER_NAME || 'Veloura Living Atelier';
    const rawEmail = process.env.SMTP_USER || process.env.BREVO_SENDER_EMAIL || 'concierge@velouraliving.com';
    
    const emailMatch = rawFrom.match(/<([^>]+)>/);
    const email = emailMatch ? emailMatch[1] : rawEmail;
    const name = rawFrom.includes('<') ? rawFrom.split('<')[0].trim() : 'Veloura Living Atelier';

    return {
      name: name || 'Veloura Living Atelier',
      email: email || 'concierge@velouraliving.com',
    };
  }

  /**
   * Dispatches a raw transactional email via Brevo REST API v3
   */
  async sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
    const apiKey = this.getApiKey();
    const sender = payload.sender || this.getDefaultSender();

    // Sanitize recipients
    const validRecipients = payload.to.filter((r) => r.email && r.email.includes('@'));
    if (validRecipients.length === 0) {
      return {
        success: false,
        deliveryStatus: 'FAILED_PRECHECK',
        error: 'No valid recipient email addresses provided.',
        isMock: false,
      };
    }

    // Check if live Brevo API key is available
    if (!apiKey || apiKey.includes('placeholder') || apiKey.includes('your-') || apiKey.length < 10) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Brevo Configuration Error] Live Brevo API key is missing or invalid in production environment.');
        return {
          success: false,
          deliveryStatus: 'FAILED_PRECHECK',
          error: 'Transactional email service is temporarily unavailable.',
          isMock: false,
        };
      }

      // Diagnostic safe log in development (no credentials, no OTP, no full email)
      const recipientDomains = validRecipients.map((r) => r.email.split('@')[1]).join(', ');
      console.log(`[Brevo Simulation Mode (Dev-Only)] Dispatched email subject="${payload.subject}" to domains=[${recipientDomains}]`);
      return {
        success: true,
        deliveryStatus: 'SIMULATED',
        messageId: `mock_brevo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        status: 200,
        isMock: true,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s network timeout

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          sender: {
            name: sender.name,
            email: sender.email,
          },
          to: validRecipients.map((r) => ({
            email: r.email.toLowerCase().trim(),
            name: r.name || undefined,
          })),
          subject: payload.subject,
          htmlContent: payload.htmlContent,
          textContent: payload.textContent || undefined,
          replyTo: payload.replyTo ? { email: payload.replyTo.email, name: payload.replyTo.name } : undefined,
          tags: payload.tags || ['veloura-transactional'],
        }),
      });

      clearTimeout(timeoutId);
      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        const messageId = responseData.messageId || `msg_${Date.now()}`;
        console.log(`[Brevo Dispatch] event=EMAIL_DISPATCH status=${response.status} messageId=${messageId}`);
        return {
          success: true,
          deliveryStatus: 'ACCEPTED',
          messageId,
          status: response.status,
          isMock: false,
        };
      } else {
        const sanitizedError = responseData.message || responseData.error || `HTTP ${response.status}`;
        console.error(`[Brevo Dispatch Error] status=${response.status} message="${sanitizedError}"`);
        return {
          success: false,
          deliveryStatus: 'REJECTED',
          status: response.status,
          error: `Brevo API error (${response.status}): ${sanitizedError}`,
          isMock: false,
        };
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError' || err.message?.includes('abort') || err.message?.includes('timeout');
      const errorMsg = isTimeout ? 'Email provider request timed out (delivery status unknown)' : (err.message || 'Network request failed');
      console.error(`[Brevo Network Failure] message="${errorMsg}"`);
      return {
        success: false,
        deliveryStatus: 'TIMEOUT_UNKNOWN',
        error: `Brevo network error: ${errorMsg}`,
        isMock: false,
      };
    }
  }

  /**
   * Dispatches a 6-digit authentication security OTP email
   */
  async sendOtpEmail(
    email: string,
    otp: string,
    options?: { name?: string; type?: 'LOGIN' | 'REGISTER' }
  ): Promise<SendEmailResult> {
    const isRegister = options?.type === 'REGISTER';
    const title = isRegister ? 'Verify Your Atelier Account' : 'Concierge Security Verification';
    const greeting = options?.name ? `Dear ${options.name},` : 'Distinguished Client,';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Veloura Living</title>
</head>
<body style="margin: 0; padding: 0; background-color: #150E0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF7F2;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #150E0A; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #1C140E; border: 1px solid #3D271D; border-radius: 8px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #150E0A; padding: 32px 24px; text-align: center; border-bottom: 1px solid #3D271D;">
              <h1 style="font-family: 'Georgia', serif; font-size: 24px; letter-spacing: 0.25em; text-transform: uppercase; color: #FAF7F2; margin: 0; font-weight: 300;">VELOURA</h1>
              <div style="font-size: 10px; letter-spacing: 0.4em; color: #D8B486; margin-top: 4px; text-transform: uppercase;">ARCHITECTURAL ATELIER</div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <div style="display: inline-block; background-color: #2A1D15; color: #D8B486; border: 1px solid #7A4E2D; padding: 4px 12px; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 2px; margin-bottom: 20px;">
                SECURITY AUTHENTICATION
              </div>

              <h2 style="font-family: 'Georgia', serif; font-size: 22px; color: #FAF7F2; margin-top: 0; margin-bottom: 12px; font-weight: normal;">
                ${title}
              </h2>

              <p style="font-size: 14px; line-height: 1.6; color: #C5B5A5; margin-top: 0; margin-bottom: 24px;">
                ${greeting}<br>
                ${isRegister ? 'Welcome to Veloura Living. Please use the verification code below to activate your private atelier profile.' : 'A sign-in attempt was initiated for your private account. Enter the one-time code below to complete authentication.'}
              </p>

              <!-- OTP Display Box -->
              <div style="background-color: #150E0A; border: 1px solid #7A4E2D; border-radius: 6px; padding: 24px; text-align: center; margin: 28px 0;">
                <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #D8B486; margin-bottom: 8px;">
                  ONE-TIME VERIFICATION CODE
                </div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: bold; letter-spacing: 12px; color: #FAF7F2; padding: 8px 0; text-indent: 12px;">
                  ${otp}
                </div>
                <div style="font-size: 11px; color: #8C7B6E; margin-top: 8px;">
                  Valid for 10 minutes &bull; Single-use security token
                </div>
              </div>

              <!-- Security Notice -->
              <p style="font-size: 12px; line-height: 1.6; color: #8C7B6E; margin-top: 24px; margin-bottom: 0; border-left: 2px solid #7A4E2D; padding-left: 12px;">
                <strong>Security Guarantee:</strong> Veloura Living will never ask for this code over the phone or message. If you did not request this verification, please contact our VIP Concierge immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #150E0A; padding: 24px 32px; border-top: 1px solid #3D271D; text-align: center; font-size: 11px; color: #736254; line-height: 1.6;">
              <p style="margin: 0;">Veloura Living Private Limited &bull; Architectural Furniture Atelier</p>
              <p style="margin: 4px 0 0 0;">Milan &bull; London &bull; Mumbai &bull; 24/7 VIP Concierge: concierge@velouraliving.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: [{ email, name: options?.name }],
      subject: `🏛️ Veloura Living — ${isRegister ? 'Activate Your Account' : 'Security Verification Code'}`,
      htmlContent,
      tags: ['auth-otp', isRegister ? 'register-otp' : 'login-otp'],
    });
  }

  /**
   * Dispatches a luxury dark order confirmation receipt
   */
  async sendOrderConfirmationEmail(order: any): Promise<SendEmailResult> {
    const customer = order.customer_info || order.customer || {};
    const recipientEmail = customer.email || 'customer@example.com';
    const recipientName = customer.full_name || customer.fullName || 'Valued Client';
    const orderNumber = order.order_number || 'VL-2026';
    const grandTotal = (order.grand_total || order.total || 0).toLocaleString('en-IN');
    const items = order.items || [];

    const itemsHtml = items
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #2A1D15; font-size: 13px; color: #FAF7F2;">
          <div style="font-weight: 500;">${item.product_name || 'Signature Furniture Piece'}</div>
          <div style="font-size: 11px; color: #8C7B6E;">SKU: ${item.sku || 'N/A'} &bull; Qty: ${item.quantity || 1}</div>
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #2A1D15; font-size: 13px; color: #D8B486; font-weight: 500;">
          ₹${((item.total_price || item.unit_price * (item.quantity || 1)) || 0).toLocaleString('en-IN')}
        </td>
      </tr>
    `
      )
      .join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Order Confirmation ${orderNumber} | Veloura Living</title>
</head>
<body style="margin: 0; padding: 0; background-color: #150E0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF7F2;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #150E0A; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #1C140E; border: 1px solid #3D271D; border-radius: 8px; overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #150E0A; padding: 32px 24px; text-align: center; border-bottom: 1px solid #3D271D;">
              <h1 style="font-family: 'Georgia', serif; font-size: 24px; letter-spacing: 0.25em; text-transform: uppercase; color: #FAF7F2; margin: 0; font-weight: 300;">VELOURA</h1>
              <div style="font-size: 10px; letter-spacing: 0.4em; color: #D8B486; margin-top: 4px; text-transform: uppercase;">ORDER CONFIRMATION & RECEIPT</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <div style="display: inline-block; background-color: #2A1D15; color: #D8B486; border: 1px solid #7A4E2D; padding: 4px 12px; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 2px; margin-bottom: 16px;">
                CONFIRMED & SCHEDULED
              </div>

              <h2 style="font-family: 'Georgia', serif; font-size: 22px; color: #FAF7F2; margin-top: 0; margin-bottom: 12px; font-weight: normal;">
                Thank you, ${recipientName}.
              </h2>

              <p style="font-size: 14px; line-height: 1.6; color: #C5B5A5; margin-top: 0; margin-bottom: 24px;">
                Your bespoke architectural commission <strong>${orderNumber}</strong> has been received and confirmed. Our master artisans have scheduled timber selection and carpentry.
              </p>

              <!-- Order Summary Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <thead>
                  <tr>
                    <th align="left" style="padding-bottom: 8px; border-bottom: 1px solid #3D271D; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #8C7B6E;">Piece</th>
                    <th align="right" style="padding-bottom: 8px; border-bottom: 1px solid #3D271D; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #8C7B6E;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Financial Totals -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #8C7B6E;">Subtotal</td>
                  <td align="right" style="padding: 4px 0; font-size: 12px; color: #C5B5A5;">₹${(order.subtotal || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #8C7B6E;">Statutory GST (18%)</td>
                  <td align="right" style="padding: 4px 0; font-size: 12px; color: #C5B5A5;">₹${(order.tax_total || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #8C7B6E;">White-Glove Delivery & Installation</td>
                  <td align="right" style="padding: 4px 0; font-size: 12px; color: #C5B5A5;">${order.shipping_total === 0 ? 'COMPLIMENTARY' : `₹${order.shipping_total?.toLocaleString('en-IN')}`}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0 0; border-top: 1px solid #3D271D; font-size: 15px; font-weight: bold; color: #FAF7F2;">Grand Total</td>
                  <td align="right" style="padding: 12px 0 0 0; border-top: 1px solid #3D271D; font-size: 16px; font-weight: bold; color: #D8B486;">₹${grandTotal}</td>
                </tr>
              </table>

              <!-- Delivery Address -->
              <div style="background-color: #150E0A; border: 1px solid #3D271D; border-radius: 6px; padding: 16px; font-size: 12px; line-height: 1.6; color: #C5B5A5; margin-bottom: 24px;">
                <div style="font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #D8B486; font-weight: 600; margin-bottom: 4px;">White-Glove Delivery Destination</div>
                ${customer.shipping_address || customer.addressLine1 || 'Client Residence'}, ${customer.city || 'Mumbai'}, ${customer.state || 'Maharashtra'} - ${customer.postal_code || customer.postalCode || ''}
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin-top: 24px;">
                <a href="http://localhost:3000/account" style="display: inline-block; background-color: #D8B486; color: #1C140E; text-decoration: none; padding: 14px 28px; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: bold; border-radius: 4px;">
                  Track Order in Vault
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #150E0A; padding: 24px 32px; border-top: 1px solid #3D271D; text-align: center; font-size: 11px; color: #736254; line-height: 1.6;">
              <p style="margin: 0;">Includes Veloura 10-Year Structural Timber & Frame Warranty.</p>
              <p style="margin: 4px 0 0 0;">Concierge Support: concierge@velouraliving.com &bull; +91 98200 12345</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: [{ email: recipientEmail, name: recipientName }],
      subject: `🏛️ Veloura Living — Order Confirmed: ${orderNumber}`,
      htmlContent,
      tags: ['order-confirmation', orderNumber],
    });
  }

  /**
   * Dispatches a gateway refund receipt with Acquirer Reference Number (ARN)
   */
  async sendRefundConfirmationEmail(refund: any, order?: any): Promise<SendEmailResult> {
    const customer = order?.customer_info || order?.customer || {};
    const recipientEmail = customer.email || 'client@example.com';
    const recipientName = customer.full_name || 'Valued Client';
    const orderNumber = order?.order_number || refund.data?.order_number || 'VL-2026';
    const amount = (refund.amount || 0).toLocaleString('en-IN');
    const arn = refund.gateway_arn || 'ARN_PROCESSING';
    const refundId = refund.gateway_refund_id || refund.id || 'rfnd_auto';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Refund Disbursed | Veloura Living</title>
</head>
<body style="margin: 0; padding: 0; background-color: #150E0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF7F2;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #150E0A; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #1C140E; border: 1px solid #3D271D; border-radius: 8px; overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <tr style="background-color: #150E0A; padding: 24px; text-align: center; border-bottom: 1px solid #3D271D;">
            <td style="padding: 24px; text-align: center;">
              <h1 style="font-family: 'Georgia', serif; font-size: 22px; letter-spacing: 0.25em; text-transform: uppercase; color: #FAF7F2; margin: 0; font-weight: 300;">VELOURA</h1>
              <div style="font-size: 9px; letter-spacing: 0.4em; color: #D8B486; margin-top: 2px;">FINANCIAL LEDGER</div>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="font-family: 'Georgia', serif; font-size: 20px; color: #FAF7F2; margin-top: 0;">Instant Refund Disbursed</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #C5B5A5;">
                Dear ${recipientName},<br>
                An instant gateway refund of <strong>₹${amount}</strong> has been successfully credited for order <strong>${orderNumber}</strong>.
              </p>

              <div style="background: #150E0A; border: 1px solid #3D271D; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 12px; color: #FAF7F2;">
                <div><strong>Refund Reference:</strong> ${refundId}</div>
                <div style="margin-top: 4px;"><strong>Bank Acquirer ARN:</strong> ${arn}</div>
                <div style="margin-top: 4px;"><strong>Amount Credited:</strong> ₹${amount}</div>
              </div>

              <p style="font-size: 12px; color: #8C7B6E; line-height: 1.5;">
                Funds typically reflect in your issuing bank account within 2–4 business hours for UPI/NetBanking or 3–5 days for credit cards.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: [{ email: recipientEmail, name: recipientName }],
      subject: `🏛️ Veloura Living — Refund Disbursed: ₹${amount} [Order ${orderNumber}]`,
      htmlContent,
      tags: ['refund-disbursed', orderNumber],
    });
  }

  /**
   * Singleton accessor
   */
  public static getInstance(): BrevoEmailService {
    if (!BrevoEmailService.instance) {
      BrevoEmailService.instance = new BrevoEmailService();
    }
    return BrevoEmailService.instance;
  }
}

export const brevoEmailService = BrevoEmailService.getInstance();
