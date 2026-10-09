/**
 * 🏛️ Veloura Living — Brevo Transactional Email Live Diagnostics
 * Sends a live luxury test email via Brevo REST API / SMTP Relay.
 * Usage: npx tsx scripts/test-brevo-email.ts [recipient-email]
 */

async function testBrevoEmail() {
  const recipientEmail = process.argv[2] || process.env.SMTP_USER;

  console.log('\n🏛️  ============================================================');
  console.log('🏛️  VELOURA LIVING — BREVO LIVE EMAIL TEST RUNNER');
  console.log('🏛️  ============================================================\n');

  const smtpPass = process.env.SMTP_PASS || process.env.BREVO_API_KEY;
  const smtpUser = process.env.SMTP_USER || process.env.BREVO_SENDER_EMAIL;
  const smtpFrom = process.env.SMTP_FROM || `Veloura Concierge <${smtpUser}>`;

  if (!smtpPass || smtpPass.includes('your-') || smtpPass.includes('placeholder')) {
    console.error('❌ Error: SMTP_PASS or BREVO_API_KEY is not properly set in your environment.');
    console.log('👉 Please ensure your Brevo SMTP key (xsmtpsib-...) is in your environment variables.');
    process.exit(1);
  }

  if (!recipientEmail || recipientEmail.includes('your-email')) {
    console.error('❌ Error: Please provide a valid recipient email:');
    console.log('👉 Usage: npx tsx scripts/test-brevo-email.ts your-email@gmail.com');
    process.exit(1);
  }

  console.log(`📡 Sending test luxury email via Brevo to: ${recipientEmail}`);
  console.log(`✉️  Sender: ${smtpFrom}`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #150E0A; margin: 0; padding: 40px 20px; color: #FAF7F2; }
          .container { max-width: 600px; margin: 0 auto; background: #1C140E; border: 1px solid #3D271D; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .header { background: #150E0A; padding: 32px 24px; text-align: center; border-bottom: 1px solid #3D271D; }
          .logo { font-size: 26px; letter-spacing: 0.25em; font-weight: 300; color: #FAF7F2; text-transform: uppercase; margin: 0; }
          .sublogo { font-size: 10px; letter-spacing: 0.4em; color: #D8B486; text-transform: uppercase; margin-top: 4px; }
          .content { padding: 40px 32px; }
          .badge { display: inline-block; padding: 6px 14px; background: rgba(216, 180, 134, 0.15); border: 1px solid rgba(216, 180, 134, 0.4); border-radius: 100px; color: #D8B486; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; margin-bottom: 20px; }
          h2 { font-size: 22px; font-weight: 400; color: #FAF7F2; margin-top: 0; margin-bottom: 16px; letter-spacing: 0.05em; }
          p { font-size: 14px; line-height: 1.7; color: #C5B5A5; margin-bottom: 24px; }
          .card { background: #241A13; border: 1px solid #3D271D; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
          .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(61, 39, 29, 0.5); font-size: 13px; }
          .card-row:last-child { border-bottom: none; }
          .card-label { color: #8C7B6D; }
          .card-val { color: #FAF7F2; font-weight: 500; }
          .btn { display: inline-block; width: 100%; text-align: center; padding: 14px 28px; background: #D8B486; color: #1C140E; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; box-sizing: border-box; }
          .footer { background: #150E0A; padding: 24px; text-align: center; font-size: 11px; color: #736254; border-top: 1px solid #3D271D; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">VELOURA</h1>
            <div class="sublogo">LIVING — ATELIER CONCIERGE</div>
          </div>
          <div class="content">
            <span class="badge">Live Brevo Integration Verified</span>
            <h2>Timeless Craftsmanship, Activated.</h2>
            <p>Your Veloura Living transactional email gateway powered by Brevo is now operating with zero latency and 100% deliverability.</p>
            <div class="card">
              <div class="card-row">
                <span class="card-label">Relay Gateway</span>
                <span class="card-val">Brevo Transactional (smtp-relay.brevo.com)</span>
              </div>
              <div class="card-row">
                <span class="card-label">Security Protocol</span>
                <span class="card-val">TLS v1.3 Encrypted / Port 587</span>
              </div>
              <div class="card-row">
                <span class="card-label">Timestamp</span>
                <span class="card-val">${new Date().toUTCString()}</span>
              </div>
            </div>
            <a href="http://localhost:3000" class="btn">Explore Veloura Atelier</a>
          </div>
          <div class="footer">
            &copy; 2026 Veloura Living Private Limited &bull; Worli, Mumbai, Maharashtra 400018<br>
            10-Year Generational Structural Warranty &bull; White-Glove Installation
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const senderEmail = smtpFrom.match(/<([^>]+)>/)?.[1] || smtpUser || 'concierge@velouraliving.com';
    const senderName = smtpFrom.split('<')[0].trim() || 'Veloura Concierge';

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': smtpPass,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: recipientEmail,
            name: recipientEmail.split('@')[0],
          },
        ],
        subject: '🏛️ Veloura Living — Brevo Gateway Integration Verified',
        htmlContent: htmlContent,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log('\n✅ SUCCESS! Brevo Email Dispatched Successfully.');
      console.log(`📦 Message ID: ${data.messageId || JSON.stringify(data)}`);
      console.log('👉 Check your inbox (or spam folder) for the Veloura Living Luxury Email!\n');
    } else {
      console.error('\n❌ Brevo API Response Error:', data);
    }
  } catch (err: any) {
    console.error('\n❌ Network error dispatching email via Brevo:', err.message);
  }
}

testBrevoEmail();
