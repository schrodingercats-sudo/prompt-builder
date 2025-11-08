# Promptify Architecture

## Overview
Promptify is a React-based web application that helps users optimize prompts for AI coding assistants.

## Tech Stack

### Frontend
- **React 19.2.0** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling

### Backend Services
- **Firebase Authentication** - User authentication (email/password + Google OAuth)
- **Supabase** - Database and storage for user data and prompts
- **Google Gemini AI** - Prompt optimization engine

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Community │  │My Prompts│  │ Settings │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ authService  │  │databaseService│  │geminiService │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Firebase   │    │   Supabase   │    │ Google Gemini│
│     Auth     │    │   Database   │    │      AI      │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Key Components

### Authentication Flow
1. **Firebase Auth** handles all authentication:
   - Email/password signup and login
   - Google OAuth
   - Email verification
   - Password reset

2. **Email Verification**:
   - Required for all new users
   - Blocks credit usage until verified
   - Disposable email domains blocked
   - Resend verification available

### Data Storage

#### Firebase (Authentication Only)
- User authentication state
- Email verification status
- OAuth provider data

#### Supabase (All Application Data)
- User profiles
- Prompts (original + optimized)
- Credits tracking
- Subscription status

### Database Schema

```sql
-- Users Table
users (
  id UUID PRIMARY KEY,
  firebase_uid TEXT UNIQUE,
  email TEXT,
  display_name TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_sent_at TIMESTAMP,
  subscription_status TEXT DEFAULT 'free',
  subscription_id TEXT,
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Prompts Table
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
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Credits Table
credits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  count INTEGER DEFAULT 2,
  reset_time TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## User Flow

### New User Signup
1. User enters email/password or uses Google OAuth
2. Email validation checks for disposable domains
3. Firebase creates authentication account
4. Verification email sent (Firebase)
5. User profile created in Supabase
6. Default credits (2) assigned
7. Email verification modal shown
8. User verifies email via link
9. Full access granted

### Prompt Optimization
1. User enters prompt text (+ optional image)
2. Selects target AI model (Lovable, Cursor, v0, etc.)
3. Credit check performed
4. Gemini AI optimizes prompt
5. Results displayed with suggestions
6. Prompt auto-saved to Supabase
7. Free users: prompt is public
8. Pro users: can choose public/private

### Community Features
- All public prompts visible to everyone
- Free users: all prompts are public
- Pro users: can make prompts private
- Search and filter by AI model
- Copy prompts to clipboard

## Security

### Authentication
- Firebase handles all auth security
- Email verification required
- Disposable emails blocked
- Secure password requirements

### Database
- Row Level Security (RLS) enabled
- Users can only access their own data
- Public prompts accessible to all
- API keys stored in environment variables

### API Keys
Required environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

Firebase config in `services/firebaseConfig.ts`

## Deployment

### Vercel (Frontend)
- Auto-deploys from GitHub main branch
- Environment variables configured in Vercel dashboard
- Build command: `npm run build`
- Output directory: `dist`

### Supabase (Database)
- Hosted database
- Automatic backups
- Connection via REST API

### Firebase (Auth)
- Hosted authentication
- Email templates customizable in console
- OAuth providers configured in console

## Credits System

### Free Users
- 2 credits per day
- Resets 24 hours after depletion
- All prompts are public
- Email verification required

### Admin Users
- Unlimited credits
- Can make prompts private
- Email: pratham.solanki30@gmail.com

### Future: Pro Users
- Unlimited credits (planned)
- Private prompts (planned)
- Stripe integration (planned)

## Error Handling

### Fallback Strategy
If Supabase is unavailable:
1. App falls back to localStorage
2. User data stored locally
3. Prompts saved to browser storage
4. Credits tracked in localStorage
5. Sync to database when available

### User Experience
- Loading states for all async operations
- Clear error messages
- Retry mechanisms
- Graceful degradation

## Performance

### Optimization
- Code splitting (planned)
- Lazy loading components (planned)
- Image optimization
- Caching strategies

### Bundle Size
- Current: ~888 KB (minified)
- Target: < 500 KB per chunk
- Consider dynamic imports

## Future Enhancements

### Phase 3: Subscription System
- Stripe payment integration
- Pro plan with private prompts
- Subscription management UI
- Billing portal

### Phase 4: Advanced Features
- Prompt versioning
- Collaboration features
- Analytics dashboard
- API access for developers
- Prompt templates library

## Development

### Local Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

### Environment
Copy `.env.local.example` to `.env.local` and fill in:
- Supabase credentials
- Firebase config
- Gemini API key

## Support

### Common Issues
1. **Build fails on Vercel**: Check all files are committed
2. **Auth not working**: Verify Firebase config
3. **Database errors**: Check Supabase connection
4. **Email not sending**: Check Firebase email settings

### Monitoring
- Vercel deployment logs
- Firebase authentication logs
- Supabase database logs
- Browser console for client errors
