-- Add subscription columns to users table
-- Run this in Supabase SQL Editor

-- Add subscription_status column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';

-- Add subscription_id column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_id TEXT;

-- Add subscription_expires_at column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster subscription queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_status 
ON users(subscription_status);

CREATE INDEX IF NOT EXISTS idx_users_subscription_expires 
ON users(subscription_expires_at);

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('subscription_status', 'subscription_id', 'subscription_expires_at');
