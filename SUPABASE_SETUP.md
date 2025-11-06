# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created

## 2. Get Your Project Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy your Project URL and anon public key
3. Update your `.env.local` file:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Set Up Google OAuth

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add your domain to authorized origins
   - Copy Client ID and Client Secret to Supabase

## 4. Configure Database Schema

The application will automatically create the necessary tables when you first run it. The schema includes:

- `users` table for user profiles
- `prompts` table for saved prompts
- `credits` table for credit tracking

## 5. Test the Setup

1. Start your development server: `npm run dev`
2. Try signing up with email/password
3. Try signing in with Google
4. Verify that authentication works correctly

## Current Status

✅ **Completed:**
- Supabase client configuration
- Authentication service with email/password and Google OAuth
- Updated AuthModal component (removed GitHub login)
- Updated App.tsx with Supabase authentication flow
- TypeScript types for new data models

🚧 **Next Steps:**
- Set up database schema in Supabase
- Implement database service for data persistence
- Create migration service for existing local data
- Update components to use cloud storage instead of localStorage

## Notes

- The app currently still uses localStorage for credits and prompts
- Google OAuth requires proper domain configuration in both Google Cloud Console and Supabase
- Make sure to add your production domain to authorized origins when deploying