# Email Receipt Setup Guide

## Overview

This guide explains how to set up automated email receipts for Razorpay payments using Resend email service.

## Features Implemented

✅ **Automatic Payment Receipts**: Users receive a professional email receipt immediately after successful payment
✅ **Beautiful HTML Email Template**: Responsive design with company branding
✅ **Detailed Payment Information**: Includes payment ID, amount, date, expiry, and plan details
✅ **Pro Features List**: Shows all benefits included in the subscription
✅ **Plain Text Fallback**: For email clients that don't support HTML

## Setup Instructions

### Step 1: Sign Up for Resend

1. **Go to Resend**: https://resend.com/
2. **Sign up** for a free account
3. **Verify your email**

### Step 2: Get API Key

1. **Go to API Keys**: https://resend.com/api-keys
2. **Click "Create API Key"**
3. **Name it**: "Promptimzer Production"
4. **Copy the API key** (starts with `re_`)

### Step 3: Add Domain (Optional but Recommended)

For production, you should verify your domain:

1. **Go to Domains**: https://resend.com/domains
2. **Click "Add Domain"**
3. **Enter your domain**: `promptimzer.com` (or your actual domain)
4. **Add DNS records** as shown by Resend:
   - SPF record
   - DKIM record
   - DMARC record (optional)
5. **Wait for verification** (usually 5-10 minutes)

**Note**: For testing, you can use Resend's default domain, but emails will be sent from `onboarding@resend.dev`

### Step 4: Add API Key to Environment Variables

1. **Open `.env.local`** in your project
2. **Add this line**:
   ```
   VITE_RESEND_API_KEY=re_your_actual_api_key_here
   ```
3. **Save the file**

### Step 5: Update Email Service (if using custom domain)

If you verified a custom domain, update `services/emailService.ts`:

```typescript
constructor() {
  this.resendApiKey = import.meta.env.VITE_RESEND_API_KEY || '';
  this.fromEmail = 'Promptimzer <noreply@promptimzer.com>'; // Change to your domain
}
```

### Step 6: Test Email Receipt

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Go to your website**: http://localhost:3000

3. **Sign in** with a test account

4. **Click "Upgrade to Pro"**

5. **Complete payment** with Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: Any future date

6. **Check your email** for the receipt

### Step 7: Deploy to Production

1. **Add environment variable to Vercel**:
   - Go to: https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add: `VITE_RESEND_API_KEY` = `re_your_api_key`
   - Click "Save"

2. **Redeploy**:
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Or push new commit to trigger deployment

## Email Template Features

### Receipt Email Includes:

1. **Header Section**:
   - Company logo/name
   - Success badge
   - Professional design

2. **Receipt Details**:
   - Receipt number (Payment ID)
   - Payment date
   - Plan name
   - Billing period
   - Expiry date
   - Payment method
   - Customer email

3. **Total Amount**:
   - Large, prominent display
   - Formatted in Indian Rupees (₹)

4. **Pro Features List**:
   - All benefits included
   - Checkmark icons
   - Easy to read

5. **Call-to-Action**:
   - Button to start using Pro features
   - Links to website

6. **Footer**:
   - Support contact
   - Company information
   - Copyright notice

## Email Template Preview

```
┌─────────────────────────────────────┐
│     🚀 Promptimzer                  │
│     ✓ Payment Successful            │
├─────────────────────────────────────┤
│                                     │
│     Payment Receipt                 │
│                                     │
│  Thank you for upgrading, John!     │
│                                     │
│  Receipt Number: #pay_NjKxXXXXXX   │
│  Payment Date: January 10, 2025     │
│  Plan: Promptimzer Pro - Yearly     │
│  Valid Until: January 10, 2026      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Total Amount Paid           │   │
│  │ ₹999                        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Your Pro Features:                 │
│  ✓ Unlimited prompt optimizations   │
│  ✓ Access to all AI models          │
│  ✓ Priority support                 │
│  ✓ Advanced suggestions             │
│  ✓ Image-based optimization         │
│  ✓ Save unlimited prompts           │
│  ✓ Community access                 │
│                                     │
│  [Start Using Pro Features]         │
│                                     │
│  Need help? support@promptimzer.com │
└─────────────────────────────────────┘
```

## Customization

### Change Email Styling

Edit `services/emailService.ts` → `generateReceiptHTML()` method:

```typescript
// Change colors
background-color: #8B5CF6; // Purple
color: #10B981; // Green

// Change fonts
font-family: 'Your Font', sans-serif;

// Change layout
padding: 40px; // Spacing
border-radius: 12px; // Rounded corners
```

### Add More Information

Add to receipt details:

```typescript
<div class="detail-row">
  <span class="detail-label">Tax ID</span>
  <span class="detail-value">GSTIN123456789</span>
</div>
```

### Change Currency

Update in `emailService.ts`:

```typescript
const formattedAmount = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD', // Change to USD, EUR, etc.
}).format(data.amount / 100);
```

## Troubleshooting

### Issue 1: Email Not Sending

**Check**:
1. API key is correct in `.env.local`
2. API key has send permissions
3. Check browser console for errors
4. Verify Resend account is active

**Solution**:
```typescript
// Add logging to emailService.ts
console.log('Sending email to:', data.userEmail);
console.log('API Key present:', !!this.resendApiKey);
```

### Issue 2: Email Goes to Spam

**Solutions**:
1. Verify your domain with Resend
2. Add SPF, DKIM, DMARC records
3. Use a professional "from" address
4. Avoid spam trigger words in subject

### Issue 3: Email Not Received

**Check**:
1. Spam/junk folder
2. Email address is correct
3. Resend dashboard for delivery status
4. Email provider isn't blocking

**Verify in Resend Dashboard**:
- Go to: https://resend.com/emails
- Check delivery status
- View error messages if any

### Issue 4: HTML Not Rendering

**Solutions**:
1. Test in different email clients
2. Use inline CSS (already done)
3. Avoid complex layouts
4. Provide plain text fallback (already done)

## Testing

### Test Email Locally

```typescript
// In browser console
import { emailService } from './services/emailService';

await emailService.sendPaymentReceipt({
  userEmail: 'your-email@example.com',
  userName: 'Test User',
  paymentId: 'pay_test123',
  amount: 99900, // ₹999 in paise
  currency: 'INR',
  paymentDate: new Date().toISOString(),
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  planName: 'Promptimzer Pro - Yearly'
});
```

### Test Different Scenarios

1. **Successful Payment**: Complete full payment flow
2. **Failed Payment**: Cancel payment, verify no email sent
3. **Different Plans**: Test monthly and yearly plans
4. **Different Amounts**: Verify amount formatting
5. **Long Names**: Test with long user names
6. **Special Characters**: Test with special chars in email

## Monitoring

### Check Email Delivery

1. **Resend Dashboard**: https://resend.com/emails
2. **View sent emails**
3. **Check delivery status**
4. **View open rates** (if tracking enabled)

### Track Metrics

```sql
-- In Supabase, track email sends
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  email_type TEXT,
  recipient TEXT,
  status TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);
```

## Security

### Protect API Key

1. **Never commit** `.env.local` to Git
2. **Use environment variables** only
3. **Rotate keys** periodically
4. **Limit permissions** to send only

### Validate Email Addresses

```typescript
// Add validation before sending
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(data.userEmail)) {
  throw new Error('Invalid email address');
}
```

## Cost

### Resend Pricing

- **Free Tier**: 3,000 emails/month
- **Pro Tier**: $20/month for 50,000 emails
- **Enterprise**: Custom pricing

For most startups, the free tier is sufficient.

## Best Practices

1. **Send Immediately**: Send receipt right after payment
2. **Include All Details**: Payment ID, amount, date, etc.
3. **Professional Design**: Use branded template
4. **Mobile Responsive**: Test on mobile devices
5. **Plain Text Fallback**: Always include
6. **Clear CTA**: Button to start using features
7. **Support Contact**: Include support email
8. **Legal Info**: Add company details, T&C link

## Next Steps

1. ✅ Set up Resend account
2. ✅ Add API key to environment
3. ✅ Test email receipt
4. ✅ Verify domain (optional)
5. ✅ Deploy to production
6. ✅ Monitor delivery
7. ✅ Customize template (optional)

## Support

If you need help:
- **Resend Docs**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **Email Issues**: Check Resend dashboard logs

---

## Summary

You now have a professional email receipt system that:
- Sends beautiful HTML receipts automatically
- Includes all payment details
- Works with Razorpay payments
- Is mobile responsive
- Has plain text fallback
- Is easy to customize

Users will receive their receipt immediately after successful payment!
