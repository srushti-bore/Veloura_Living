/**
 * 🏛️ Veloura Living — Brevo Transactional Email Engine (Backend Standalone)
 * Unified, resilient transactional email service communicating with Brevo REST API (v3).
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

export interface SendEmailResult {
  success: boolean;
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

  async sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
    const apiKey = this.getApiKey();
    const sender = payload.sender || this.getDefaultSender();

    const validRecipients = payload.to.filter((r) => r.email && r.email.includes('@'));
    if (validRecipients.length === 0) {
      return {
        success: false,
        error: 'No valid recipient email addresses provided.',
      };
    }

    if (!apiKey || apiKey.includes('placeholder') || apiKey.includes('your-') || apiKey.length < 10) {
      const recipientDomains = validRecipients.map((r) => r.email.split('@')[1]).join(', ');
      console.log(`[Brevo Simulation Mode] Dispatched email subject="${payload.subject}" to domains=[${recipientDomains}]`);
      return {
        success: true,
        messageId: `mock_brevo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        status: 200,
        isMock: true,
      };
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
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

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        const messageId = responseData.messageId || `msg_${Date.now()}`;
        console.log(`[Brevo Dispatch] event=EMAIL_DISPATCH status=${response.status} messageId=${messageId}`);
        return {
          success: true,
          messageId,
          status: response.status,
          isMock: false,
        };
      } else {
        const sanitizedError = responseData.message || responseData.error || `HTTP ${response.status}`;
        console.error(`[Brevo Dispatch Error] status=${response.status} message="${sanitizedError}"`);
        return {
          success: false,
          status: response.status,
          error: `Brevo API error (${response.status}): ${sanitizedError}`,
          isMock: false,
        };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Network request failed';
      console.error(`[Brevo Network Failure] message="${errorMsg}"`);
      return {
        success: false,
        error: `Brevo network error: ${errorMsg}`,
        isMock: false,
      };
    }
  }

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
  <title>${title} | Veloura Living</title>
</head>
<body style="margin: 0; padding: 0; background-color: #150E0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF7F2;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #150E0A; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #1C140E; border: 1px solid #3D271D; border-radius: 8px; overflow: hidden;" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color: #150E0A; padding: 32px 24px; text-align: center; border-bottom: 1px solid #3D271D;">
              <h1 style="font-family: 'Georgia', serif; font-size: 24px; letter-spacing: 0.25em; text-transform: uppercase; color: #FAF7F2; margin: 0; font-weight: 300;">VELOURA</h1>
              <div style="font-size: 10px; letter-spacing: 0.4em; color: #D8B486; margin-top: 4px; text-transform: uppercase;">ARCHITECTURAL ATELIER</div>
            </td>
          </tr>
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
            </td>
          </tr>
          <tr>
            <td style="background-color: #150E0A; padding: 24px 32px; border-top: 1px solid #3D271D; text-align: center; font-size: 11px; color: #736254;">
              <p style="margin: 0;">Veloura Living Private Limited &bull; Worli, Mumbai &bull; concierge@velouraliving.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n==================================================\n🔐 [DEV OTP VERIFICATION CODE]: ${otp} (for ${email})\n==================================================\n`);
    }

    return this.sendEmail({
      to: [{ email, name: options?.name }],
      subject: `🏛️ Veloura Living — ${isRegister ? 'Activate Your Account' : 'Security Verification Code'} [${otp.slice(0, 3)}...]`,
      htmlContent,
      tags: ['auth-otp', isRegister ? 'register-otp' : 'login-otp'],
    });
  }

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
          <tr>
            <td style="background-color: #150E0A; padding: 32px 24px; text-align: center; border-bottom: 1px solid #3D271D;">
              <h1 style="font-family: 'Georgia', serif; font-size: 24px; letter-spacing: 0.25em; text-transform: uppercase; color: #FAF7F2; margin: 0; font-weight: 300;">VELOURA</h1>
              <div style="font-size: 10px; letter-spacing: 0.4em; color: #D8B486; margin-top: 4px; text-transform: uppercase;">ORDER CONFIRMATION</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="font-family: 'Georgia', serif; font-size: 22px; color: #FAF7F2; margin-top: 0; margin-bottom: 12px; font-weight: normal;">
                Thank you, ${recipientName}.
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #C5B5A5; margin-top: 0; margin-bottom: 24px;">
                Your bespoke architectural commission <strong>${orderNumber}</strong> has been received and confirmed.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tbody>${itemsHtml}</tbody>
              </table>
              <div style="border-top: 1px solid #3D271D; padding-top: 12px; font-size: 16px; font-weight: bold; color: #D8B486; text-align: right;">
                Grand Total: ₹${grandTotal}
              </div>
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

  public static getInstance(): BrevoEmailService {
    if (!BrevoEmailService.instance) {
      BrevoEmailService.instance = new BrevoEmailService();
    }
    return BrevoEmailService.instance;
  }
}

export const brevoEmailService = BrevoEmailService.getInstance();
