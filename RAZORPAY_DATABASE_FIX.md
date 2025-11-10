# Razorpay Payment Database Fix

## 🚨 Critical Issue

**Error**: `Failed to update subscription: Could not find the 'subscription_expires_at' column of 'users' in the schema cache`

**Root Cause**: The `subscription_expires_at` column (and possibly other subscription columns) don't exist in your Supabase `users` table.

## ✅ Immediate Fix

### Step 1: Add Missing Columns to Supabase

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run This SQL Script**:

```sql
-- Add subscription columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_id TEXT;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_status 
ON users(subscription_status);

CREATE INDEX IF NOT EXISTS idx_users_subscription_expires 
ON users(subscription_expires_at);

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('subscription_status', 'subscription_id', 'subscription_expires_at');
```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify Output**:
   - Should show 3 rows with the column details
   - If you see the columns listed, the fix worked!

### Step 2: Test Payment Flow

1. **Go to your website**: https://promptimzer.vercel.app/
2. **Sign in** with your test account
3. **Click "Upgrade to Pro"**
4. **Complete payment** with Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
5. **Verify**:
   - Should see "Payment successful!"
   - Should see "Pro" badge
   - Should have unlimited credits

## 📋 What These Columns Do

### `subscription_status`
- **Type**: TEXT
- **Default**: 'free'
- **Values**: 'free', 'pro', 'active', 'cancelled'
- **Purpose**: Tracks user's subscription tier

### `subscription_id`
- **Type**: TEXT
- **Purpose**: Stores Razorpay payment ID for reference
- **Example**: `pay_NjKxXXXXXXXXXX`

### `subscription_expires_at`
- **Type**: TIMESTAMP WITH TIME ZONE
- **Purpose**: Tracks when Pro subscription expires
- **Example**: `2026-01-10 12:00:00+00`

## 🔍 Verify Database Schema

After running the SQL, verify your `users` table has these columns:

```sql
-- Check all columns in users table
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

Expected columns:
- ✅ `id` (UUID)
- ✅ `firebase_uid` (TEXT)
- ✅ `email` (TEXT)
- ✅ `display_name` (TEXT)
- ✅ `email_verified` (BOOLEAN)
- ✅ `subscription_status` (TEXT) ← **NEW**
- ✅ `subscription_id` (TEXT) ← **NEW**
- ✅ `subscription_expires_at` (TIMESTAMP) ← **NEW**
- ✅ `created_at` (TIMESTAMP)
- ✅ `updated_at` (TIMESTAMP)

## 🧪 Test Subscription Flow

### Test 1: New Payment
```sql
-- Check if subscription was recorded
SELECT 
  email,
  subscription_status,
  subscription_id,
  subscription_expires_at
FROM users
WHERE email = 'your-test-email@example.com';
```

Expected result:
```
email                    | subscription_status | subscription_id      | subscription_expires_at
-------------------------|---------------------|----------------------|------------------------
test@example.com         | pro                 | pay_NjKxXXXXXXXXXX  | 2026-01-10 12:00:00+00
```

### Test 2: Check Active Subscriptions
```sql
-- Get all active Pro users
SELECT 
  email,
  subscription_status,
  subscription_expires_at,
  CASE 
    WHEN subscription_expires_at > NOW() THEN 'Active'
    ELSE 'Expired'
  END as status
FROM users
WHERE subscription_status = 'pro'
ORDER BY subscription_expires_at DESC;
```

## 🐛 Troubleshooting

### Issue 1: "Column already exists" Error
**Solution**: This is fine! It means the column was already added. Continue to next step.

### Issue 2: "Permission denied" Error
**Solution**: 
1. Make sure you're logged into Supabase
2. Check you have admin access to the project
3. Try running each ALTER TABLE statement separately

### Issue 3: Payment Still Fails After Adding Columns
**Solution**:
1. **Clear Supabase cache**:
   ```sql
   -- Force schema refresh
   NOTIFY pgrst, 'reload schema';
   ```

2. **Restart your app**:
   - In Vercel dashboard, trigger a redeploy
   - Or wait 5 minutes for cache to clear

3. **Check database connection**:
   ```typescript
   // Test in browser console
   const { data, error } = await supabase
     .from('users')
     .select('subscription_status, subscription_id, subscription_expires_at')
     .limit(1);
   console.log('Columns exist:', data);
   ```

### Issue 4: "Schema cache" Error Persists
**Solution**:
1. **Restart Supabase PostgREST**:
   - Go to Supabase Dashboard
   - Settings → API
   - Click "Restart API"

2. **Wait 2-3 minutes** for restart to complete

3. **Test again**

## 📊 Monitor Subscriptions

### Query Active Subscriptions
```sql
SELECT 
  COUNT(*) as total_pro_users,
  COUNT(CASE WHEN subscription_expires_at > NOW() THEN 1 END) as active_pro_users,
  COUNT(CASE WHEN subscription_expires_at <= NOW() THEN 1 END) as expired_pro_users
FROM users
WHERE subscription_status = 'pro';
```

### Query Recent Payments
```sql
SELECT 
  email,
  subscription_id,
  subscription_expires_at,
  updated_at as payment_date
FROM users
WHERE subscription_status = 'pro'
ORDER BY updated_at DESC
LIMIT 10;
```

### Query Expiring Soon
```sql
SELECT 
  email,
  subscription_expires_at,
  subscription_expires_at - NOW() as time_remaining
FROM users
WHERE subscription_status = 'pro'
  AND subscription_expires_at > NOW()
  AND subscription_expires_at < NOW() + INTERVAL '7 days'
ORDER BY subscription_expires_at ASC;
```

## 🔐 Security Considerations

### Row Level Security (RLS)
Make sure users can only see their own subscription data:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = firebase_uid);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = firebase_uid);

-- Policy: Service role can do anything (for admin)
CREATE POLICY "Service role has full access"
ON users FOR ALL
USING (auth.role() = 'service_role');
```

## 📝 Update Application Code

After adding columns, verify your code is using them correctly:

### In `databaseService.ts`:
```typescript
async updateUserSubscription(firebaseUid: string, subscriptionData: {
  subscription_status: string;
  subscription_id: string;
  subscription_expires_at: string;
}): Promise<void> {
  const profile = await this.getUserProfile(firebaseUid);
  if (!profile) {
    throw new Error('User profile not found');
  }

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: subscriptionData.subscription_status,
      subscription_id: subscriptionData.subscription_id,
      subscription_expires_at: subscriptionData.subscription_expires_at,
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id);

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
}
```

### In `UpgradeModal.tsx`:
```typescript
// After successful payment
const expiryDate = new Date();
expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from now

await databaseService.updateUserSubscription(user.id, {
  subscription_status: 'pro',
  subscription_id: response.razorpay_payment_id,
  subscription_expires_at: expiryDate.toISOString()
});
```

## ✅ Success Checklist

After running the SQL script, verify:

- [ ] SQL script ran without errors
- [ ] Verification query shows 3 columns
- [ ] Test payment completes successfully
- [ ] User sees "Pro" badge after payment
- [ ] User has unlimited credits
- [ ] Subscription data appears in database
- [ ] No more "schema cache" errors

## 🚀 Next Steps

1. **Run the SQL script** in Supabase SQL Editor
2. **Wait 2-3 minutes** for schema cache to refresh
3. **Test payment flow** with Razorpay test card
4. **Verify in database** that subscription was recorded
5. **Monitor for errors** in browser console

## 📞 Still Having Issues?

If the error persists after following all steps:

1. **Check Supabase logs**:
   - Dashboard → Logs → API Logs
   - Look for errors related to "users" table

2. **Verify Supabase connection**:
   - Check `.env.local` has correct Supabase URL and key
   - Test connection in browser console

3. **Contact Supabase support**:
   - If schema cache won't refresh
   - If columns won't add

---

## Summary

The issue is that your Supabase database is missing the subscription columns. Run the SQL script above to add them, wait a few minutes for the cache to refresh, then test the payment flow again. The payment should complete successfully and activate Pro features immediately.
