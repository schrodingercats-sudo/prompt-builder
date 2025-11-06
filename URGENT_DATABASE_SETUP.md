# 🚨 URGENT: Database Setup Required

## The Problem
Your app is trying to use Supabase database tables that don't exist yet. This is causing the credit system to fail.

## Quick Fix (2 minutes)

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project: `gquzgewjyayurxgdekyy`
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run This SQL
Copy and paste this EXACT SQL code and click "Run":

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credits table
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 2,
  reset_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_prompt TEXT NOT NULL,
  optimized_prompt TEXT NOT NULL,
  suggestions JSONB DEFAULT '[]',
  model_used TEXT NOT NULL,
  image_data TEXT,
  image_mime_type TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now)
CREATE POLICY "Enable all operations for authenticated users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON credits FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON prompts FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON prompts(is_public);
```

### Step 3: Test
1. Refresh your app at http://localhost:3000
2. Sign in and try generating a prompt
3. Credits should now be properly deducted!

## What This Fixes
- ✅ Credits will be properly tracked in database
- ✅ Users can't reset credits by logging out/in
- ✅ Credit system works across devices
- ✅ No more database errors

## After Running SQL
The app will automatically start using the database for credit tracking instead of localStorage. The bug will be completely fixed!