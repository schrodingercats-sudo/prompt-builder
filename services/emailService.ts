// Email Service for sending payment receipts and notifications
// Using Resend API for email delivery

interface PaymentReceiptData {
  userEmail: string;
  userName: string;
  paymentId: string;
  amount: number;
  currency: string;
  paymentDate: string;
  expiryDate: string;
  planName: string;
}

export class EmailService {
  private resendApiKey: string;
  private fromEmail: string;

  constructor() {
    this.resendApiKey = import.meta.env.VITE_RESEND_API_KEY || '';
    this.fromEmail = 'Promptimzer <noreply@promptimzer.com>';
  }

  /**
   * Send payment receipt email to user after successful subscription
   */
  async sendPaymentReceipt(data: PaymentReceiptData): Promise<void> {
    if (!this.resendApiKey) {
      console.warn('Resend API key not configured. Email not sent.');
      return;
    }

    const emailHtml = this.generateReceiptHTML(data);
    const emailText = this.generateReceiptText(data);

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: data.userEmail,
          subject: `Payment Receipt - Promptimzer Pro Subscription`,
          html: emailHtml,
          text: emailText,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
      }

      console.log('Payment receipt email sent successfully to:', data.userEmail);
    } catch (error) {
      console.error('Error sending payment receipt email:', error);
      throw error;
    }
  }

  /**
   * Generate HTML email template for payment receipt
   */
  private generateReceiptHTML(data: PaymentReceiptData): string {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: data.currency,
    }).format(data.amount / 100); // Razorpay amounts are in paise

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #8B5CF6;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #8B5CF6;
      margin-bottom: 10px;
    }
    .success-badge {
      display: inline-block;
      background-color: #10B981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 10px;
    }
    .receipt-title {
      font-size: 24px;
      font-weight: bold;
      color: #1F2937;
      margin: 20px 0;
      text-align: center;
    }
    .receipt-details {
      background-color: #F9FAFB;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #6B7280;
      font-weight: 500;
    }
    .detail-value {
      color: #1F2937;
      font-weight: 600;
      text-align: right;
    }
    .total-row {
      background-color: #8B5CF6;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      margin: 20px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-label {
      font-size: 18px;
      font-weight: 600;
    }
    .total-amount {
      font-size: 28px;
      font-weight: bold;
    }
    .features {
      background-color: #F3F4F6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .features h3 {
      color: #1F2937;
      font-size: 18px;
      margin-bottom: 15px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      color: #4B5563;
    }
    .feature-item::before {
      content: "✓";
      color: #10B981;
      font-weight: bold;
      margin-right: 10px;
      font-size: 18px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      color: #6B7280;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background-color: #8B5CF6;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #7C3AED;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚀 Promptimzer</div>
      <div class="success-badge">✓ Payment Successful</div>
    </div>

    <h1 class="receipt-title">Payment Receipt</h1>
    
    <p style="text-align: center; color: #6B7280; margin-bottom: 30px;">
      Thank you for upgrading to Promptimzer Pro, ${data.userName}!
    </p>

    <div class="receipt-details">
      <div class="detail-row">
        <span class="detail-label">Receipt Number</span>
        <span class="detail-value">#${data.paymentId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment Date</span>
        <span class="detail-value">${new Date(data.paymentDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Plan</span>
        <span class="detail-value">${data.planName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Billing Period</span>
        <span class="detail-value">1 Year</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Valid Until</span>
        <span class="detail-value">${new Date(data.expiryDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment Method</span>
        <span class="detail-value">Razorpay</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Customer Email</span>
        <span class="detail-value">${data.userEmail}</span>
      </div>
    </div>

    <div class="total-row">
      <span class="total-label">Total Amount Paid</span>
      <span class="total-amount">${formattedAmount}</span>
    </div>

    <div class="features">
      <h3>Your Pro Features</h3>
      <div class="feature-item">Unlimited prompt optimizations</div>
      <div class="feature-item">Access to all AI models (Gemini 1.5 Flash, Pro, 2.0)</div>
      <div class="feature-item">Priority support</div>
      <div class="feature-item">Advanced prompt suggestions</div>
      <div class="feature-item">Image-based prompt optimization</div>
      <div class="feature-item">Save unlimited prompts</div>
      <div class="feature-item">Community access</div>
    </div>

    <div style="text-align: center;">
      <a href="https://promptimzer.vercel.app/" class="button">Start Using Pro Features</a>
    </div>

    <div class="footer">
      <p><strong>Need help?</strong> Contact us at support@promptimzer.com</p>
      <p style="margin-top: 10px;">
        This is an automated receipt. Please keep it for your records.
      </p>
      <p style="margin-top: 20px; font-size: 12px;">
        © ${new Date().getFullYear()} Promptimzer. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text version of receipt email
   */
  private generateReceiptText(data: PaymentReceiptData): string {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: data.currency,
    }).format(data.amount / 100);

    return `
PAYMENT RECEIPT - PROMPTIMZER PRO

✓ Payment Successful

Thank you for upgrading to Promptimzer Pro, ${data.userName}!

RECEIPT DETAILS
---------------
Receipt Number: #${data.paymentId}
Payment Date: ${new Date(data.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Plan: ${data.planName}
Billing Period: 1 Year
Valid Until: ${new Date(data.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Payment Method: Razorpay
Customer Email: ${data.userEmail}

TOTAL AMOUNT PAID: ${formattedAmount}

YOUR PRO FEATURES
-----------------
✓ Unlimited prompt optimizations
✓ Access to all AI models (Gemini 1.5 Flash, Pro, 2.0)
✓ Priority support
✓ Advanced prompt suggestions
✓ Image-based prompt optimization
✓ Save unlimited prompts
✓ Community access

Start using your Pro features: https://promptimzer.vercel.app/

Need help? Contact us at support@promptimzer.com

This is an automated receipt. Please keep it for your records.

© ${new Date().getFullYear()} Promptimzer. All rights reserved.
    `;
  }

  /**
   * Send welcome email to new Pro users
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    if (!this.resendApiKey) {
      console.warn('Resend API key not configured. Welcome email not sent.');
      return;
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
    .content { padding: 30px 20px; }
    .button { display: inline-block; background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Promptimzer Pro!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Welcome to the Pro tier! You now have access to all premium features.</p>
      <p>Here's what you can do now:</p>
      <ul>
        <li>Unlimited prompt optimizations</li>
        <li>Access to all AI models</li>
        <li>Priority support</li>
        <li>And much more!</li>
      </ul>
      <a href="https://promptimzer.vercel.app/" class="button">Get Started</a>
      <p>If you have any questions, feel free to reach out to us at support@promptimzer.com</p>
      <p>Happy optimizing!<br>The Promptimzer Team</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: userEmail,
          subject: 'Welcome to Promptimzer Pro! 🎉',
          html: emailHtml,
        }),
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }
}

export const emailService = new EmailService();
