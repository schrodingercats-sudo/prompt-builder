# Database Migration Guide

## Overview
This guide explains how to apply the database schema changes for email verification and subscription features.

## Prerequisites
- Access to Supabase dashboard
- Database connection established
- Backup of existing data (recommended)

## Migration Steps

### Step 1: Update Users Table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
```

### Step 2: Update Prompts Table Default

```sql
-- Change default value for is_public to true (free users = public by default)
ALTER TABLE prompts 
ALTER COLUMN is_public SET DEFAULT true;

-- Update existing prompts to be public (optional - only if you want to make all existing prompts public)
-- UPDATE prompts SET is_public = true WHERE is_public IS NULL OR is_public = false;
```

### Step 3: Verify Changes

```sql
-- Check users table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Check prompts table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'prompts';
```

### Step 4: Update Row Level Security Policies (if needed)

```sql
-- Allow users to view public prompts
CREATE POLICY IF NOT EXISTS "Anyone can view public prompts" ON prompts
  FOR SELECT USING (is_public = true);

-- Ensure users can update their own email verification status
-- (This is typically handled by the application, not directly by users)
```

## Rollback Plan

If you need to rollback these changes:

```sql
-- Remove new columns from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS email_verified,
DROP COLUMN IF EXISTS verification_sent_at,
DROP COLUMN IF EXISTS subscription_status,
DROP COLUMN IF EXISTS subscription_id,
DROP COLUMN IF EXISTS subscription_expires_at;

-- Revert prompts default
ALTER TABLE prompts 
ALTER COLUMN is_public SET DEFAULT false;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_email_verified;
DROP INDEX IF EXISTS idx_users_subscription_status;
```

## Testing

After migration, test the following:

1. **Email Verification**
   - Sign up with a new account
   - Verify email verification modal appears
   - Check that verification email is sent
   - Confirm verification status updates in database

2. **Public Prompts**
   - Create a new prompt as a free user
   - Verify it appears in community section
   - Check is_public = true in database

3. **Subscription Status**
   - Verify all users have subscription_status = 'free' by default
   - Test upgrade flow (when implemented)

## Notes

- The migration is backward compatible - existing functionality will continue to work
- Email verification is enforced in the application layer, not database constraints
- Subscription features are prepared but not fully implemented yet
- All new users will have email_verified = false by default
- All new prompts will be public by default (is_public = true)

## Next Steps

After successful migration:

1. Monitor application logs for any database errors
2. Test email verification flow with real users
3. Implement subscription payment integration (Phase 3)
4. Clean up dummy/test prompts from community section
5. Customize Firebase email templates in Firebase Console
