# Subscription Management Guide

## Overview
Users can now manage their subscriptions directly from the Settings page. This includes viewing current plan, upgrading, cancelling, and reactivating subscriptions.

## Features

### 1. View Current Subscription
- **Location**: Settings → Manage Subscription
- **Shows**:
  - Current plan status (Free, Pro, or Cancelled)
  - Renewal/expiry date
  - Plan features
  - Payment history (coming soon)

### 2. Upgrade to Pro
**For Free Users:**
- Click "Manage Subscription" in Settings
- Choose between Monthly (₹100) or Yearly (₹1000)
- Review Pro features
- Click "Upgrade to Pro"
- Complete payment via Razorpay
- Instant activation

**Pro Features:**
- ✅ Unlimited prompt optimizations
- ✅ Private prompts
- ✅ Priority support
- ✅ Advanced AI models
- ✅ No daily credit limits

### 3. Cancel Subscription
**For Pro Users:**
- Click "Manage Subscription" in Settings
- Scroll to "Cancel Subscription" section
- Click "Cancel Subscription"
- Confirm cancellation
- Retain Pro access until end of billing period

**What Happens:**
- Status changes to "Cancelled"
- Pro features remain active until expiry date
- No automatic renewal
- Can reactivate anytime before expiry

### 4. Reactivate Subscription
**For Cancelled Users:**
- Click "Manage Subscription" in Settings
- Click "Reactivate Pro Subscription"
- Choose plan (Monthly or Yearly)
- Complete payment
- Immediate reactivation

## User Flow Diagrams

### Free User → Pro User
```
Free User (2 credits/day)
       ↓
Settings → Manage Subscription
       ↓
Choose Plan (Monthly/Yearly)
       ↓
Pay with Razorpay
       ↓
Pro User (Unlimited credits)
```

### Pro User → Cancel → Reactivate
```
Pro User (Active)
       ↓
Settings → Cancel Subscription
       ↓
Cancelled (Pro access until expiry)
       ↓
Settings → Reactivate
       ↓
Pro User (Active again)
```

## UI Components

### Subscription Management Modal

**Sections:**
1. **Current Plan Card**
   - Status badge (Free/Pro/Cancelled)
   - Renewal/expiry date
   - Feature list

2. **Upgrade Section** (Free users only)
   - Plan selector (Monthly/Yearly)
   - Feature comparison
   - Upgrade button

3. **Cancel Section** (Pro users only)
   - Cancellation warning
   - Cancel button
   - Retention messaging

4. **Reactivate Section** (Cancelled users only)
   - Reactivation benefits
   - Plan selection
   - Reactivate button

## Status Indicators

### Free Plan
- Badge: 🆓 Free (Gray)
- Features: 2 credits/day, public prompts
- Action: Upgrade available

### Pro Plan
- Badge: ✨ Pro (Green)
- Features: Unlimited credits, private prompts
- Action: Cancel available

### Cancelled Plan
- Badge: ⚠️ Cancelled (Yellow)
- Features: Pro access until expiry
- Action: Reactivate available

## Payment Flow

### Upgrade Payment
1. User selects plan
2. Razorpay modal opens
3. User enters payment details
4. Payment processed
5. Subscription activated
6. Database updated
7. Credits become unlimited
8. Success message shown

### Cancellation
1. User clicks cancel
2. Confirmation dialog
3. Database updated to "cancelled"
4. Pro access retained until expiry
5. No refund (as per policy)
6. Can reactivate anytime

## Database Updates

### On Upgrade
```sql
UPDATE users SET
  subscription_status = 'pro',
  subscription_id = 'razorpay_payment_id',
  subscription_expires_at = 'expiry_date',
  updated_at = NOW()
WHERE firebase_uid = 'user_id';
```

### On Cancel
```sql
UPDATE users SET
  subscription_status = 'cancelled',
  updated_at = NOW()
WHERE firebase_uid = 'user_id';
```

### On Reactivate
```sql
UPDATE users SET
  subscription_status = 'pro',
  subscription_id = 'new_payment_id',
  subscription_expires_at = 'new_expiry_date',
  updated_at = NOW()
WHERE firebase_uid = 'user_id';
```

## Error Handling

### Payment Failures
- Error message displayed in modal
- User can retry payment
- No database changes on failure

### Network Errors
- Loading state shown
- Retry mechanism
- Fallback error message

### Database Errors
- Payment succeeds but DB update fails
- User notified to contact support
- Manual intervention required

## User Experience

### Smooth Transitions
- Loading states during API calls
- Success/error messages
- Instant UI updates
- No page reloads

### Clear Communication
- Status badges with icons
- Expiry date prominently displayed
- Feature lists for comparison
- Helpful error messages

### Mobile Responsive
- Modal adapts to screen size
- Touch-friendly buttons
- Scrollable content
- Easy navigation

## Testing Checklist

### Free User Tests
- [ ] View subscription status
- [ ] See "Free" badge
- [ ] View upgrade options
- [ ] Select monthly plan
- [ ] Select yearly plan
- [ ] Complete upgrade payment
- [ ] Verify Pro status
- [ ] Check unlimited credits

### Pro User Tests
- [ ] View Pro status
- [ ] See expiry date
- [ ] View Pro features
- [ ] Cancel subscription
- [ ] Verify cancelled status
- [ ] Check Pro access retained
- [ ] Verify no auto-renewal

### Cancelled User Tests
- [ ] View cancelled status
- [ ] See access expiry date
- [ ] Reactivate subscription
- [ ] Complete payment
- [ ] Verify Pro status restored
- [ ] Check new expiry date

## Support Scenarios

### "I can't upgrade"
- Check Razorpay keys configured
- Verify payment gateway working
- Check browser console for errors
- Try different payment method

### "I cancelled but still charged"
- Check subscription_status in database
- Verify no auto-renewal set
- Check Razorpay dashboard
- Process refund if needed

### "My Pro access expired"
- Check subscription_expires_at date
- Verify current date > expiry
- Offer reactivation
- Explain renewal process

## Future Enhancements

### Phase 1 (Current)
- ✅ View subscription status
- ✅ Upgrade to Pro
- ✅ Cancel subscription
- ✅ Reactivate subscription

### Phase 2 (Planned)
- [ ] Payment history
- [ ] Invoice downloads
- [ ] Email receipts
- [ ] Auto-renewal toggle

### Phase 3 (Future)
- [ ] Multiple payment methods
- [ ] Promo codes/discounts
- [ ] Team subscriptions
- [ ] Usage analytics

## Analytics to Track

### Conversion Metrics
- Free → Pro conversion rate
- Monthly vs Yearly preference
- Cancellation rate
- Reactivation rate

### Revenue Metrics
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Average Revenue Per User (ARPU)
- Customer Lifetime Value (LTV)

### User Behavior
- Time to upgrade
- Cancellation reasons
- Reactivation timing
- Feature usage by plan

## Best Practices

### For Users
1. Review features before upgrading
2. Choose yearly for better value
3. Cancel before renewal if needed
4. Contact support for issues

### For Admins
1. Monitor subscription metrics
2. Track payment failures
3. Follow up on cancellations
4. Provide excellent support

## Compliance

### Refund Policy
- No refunds on monthly plans
- Pro-rated refunds on yearly (optional)
- Cancellation anytime
- Access until period end

### Terms of Service
- Clear pricing displayed
- Auto-renewal disclosed
- Cancellation process explained
- Support contact provided

## Success! 🎉

Users can now fully manage their subscriptions with a beautiful, intuitive interface!
