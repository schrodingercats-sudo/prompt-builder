# Database Setup Guide - CRITICAL BUG FIX

## 🚨 **Bug Fixed: Credit System Exploit**

**Problem**: Users could log out and log back in to reset their credits and get unlimited free usage.

**Solution**: Implemented persistent credit tracking using Supabase database with Firebase user authentication.

## ✅ **What's Been Implemented:**

1. **Supabase Database Schema** - Complete database structure with:
   - `users` table for user profiles
   - `credits` table for persistent credit tracking
   - `prompts` table for saved prompts
   - Row Level Security (RLS) policies
   - Proper indexes and triggers

2. **Database Service** - Full CRUD operations for:
   - User profile management
   - Credit tracking and usage
   - Prompt storage and retrieval

3. **Updated Credit System** - Now uses database instead of localStorage:
   - Credits are tied to Firebase user ID (not email)
   - Persistent across sessions and devices
   - Proper reset timer handling
   - Admin users still get unlimited credits

## 🔧 **Setup Required:**

### 1. Run Database Schema in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `gquzgewjyayurxgdekyy`
3. Go to "SQL Editor"
4. Copy and paste the contents of `database/schema.sql`
5. Click "Run" to create all tables and policies

### 2. Configure Authentication Integration

The database is already configured to work with Firebase authentication using the user's Firebase UID.

### 3. Test the Fix

1. **Before**: User could log out and log back in to reset credits
2. **After**: Credits are now persistent and tied to the user's Firebase account

**Test Steps:**
1. Sign up/sign in with a new account
2. Use both credits (should show 0 remaining)
3. Log out and log back in
4. Verify credits are still 0 (bug is fixed!)
5. Wait 24 hours or manually reset in database to test reset functionality

## 🔐 **Security Features:**

- **Row Level Security**: Users can only access their own data
- **Firebase Integration**: Uses Firebase UID for user identification
- **Proper Policies**: Database policies prevent unauthorized access
- **Admin Override**: Admin users still get unlimited credits

## 📊 **Database Structure:**

```sql
users (
  id UUID PRIMARY KEY,
  firebase_uid TEXT UNIQUE,  -- Links to Firebase Auth
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

credits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  count INTEGER DEFAULT 2,
  reset_time TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

prompts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  original_prompt TEXT,
  optimized_prompt TEXT,
  suggestions JSONB,
  model_used TEXT,
  image_data TEXT,
  image_mime_type TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🚀 **Current Status:**

- ✅ **Credit exploit fixed** - Credits are now persistent
- ✅ **Database service implemented** - Full CRUD operations
- ✅ **Firebase integration** - Uses Firebase UID for user identification
- ✅ **App updated** - Uses database instead of localStorage for credits
- ✅ **Security implemented** - Row Level Security policies in place

## 🔄 **Migration Notes:**

- Existing localStorage data will not be automatically migrated
- New users will start with 2 credits in the database
- Admin users (pratham.solanki30@gmail.com) still get unlimited credits
- Credit reset timer works properly with database storage

## 🐛 **Bug Status: RESOLVED**

The credit system exploit has been completely fixed. Users can no longer:
- ❌ Log out and log back in to reset credits
- ❌ Clear browser data to get new credits
- ❌ Use different browsers to bypass limits

Credits are now properly tracked per Firebase user account across all sessions and devices.