# Email Verification & Platform Improvements

## Overview
Implement email verification system, fix community features, add subscription model, and improve UX across the platform.

## User Stories

### 1. Email Verification System
**As a user**, I want to verify my email address so that the platform can prevent fake/temporary email accounts.

**Acceptance Criteria:**
- Email verification required for both traditional signup and Google OAuth
- Verification code sent to email upon registration
- User cannot access full features until email is verified
- Verification emails include spam folder reminder
- Resend verification option available
- Block temporary/disposable email domains

### 2. Community Section for Free Users
**As a free user**, I want to share my prompts publicly in the community section.

**Acceptance Criteria:**
- Free users can view community prompts
- Free users' prompts are automatically public
- Prompts display with AI tool logo/icon
- Copy button works for all prompts
- Remove all dummy/fake prompts from database

### 3. Pro Plan for Private Prompts
**As a user**, I want to upgrade to Pro to keep my prompts private.

**Acceptance Criteria:**
- Pro plan subscription option available
- Pro users can toggle prompts between public/private
- Free users see upgrade prompt when trying to make prompts private
- Clear pricing and benefits displayed

### 4. UI/UX Improvements
**As a user**, I want better visual feedback and functionality.

**Acceptance Criteria:**
- AI tool logos displayed on prompt cards (Cursor, v0, Bolt, Replit, Lovable)
- Copy button functional on all prompts
- Email messages mention checking spam folder
- Consistent styling across all components

## Technical Requirements

### Email Verification
- Use Firebase Auth email verification
- Create verification flow component
- Add email domain validation/blacklist
- Store verification status in Supabase
- Send verification emails with custom templates

### Database Schema Updates
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verification_sent_at TIMESTAMP;

-- Add to prompts table (already has is_public)
-- Ensure is_public defaults to TRUE for free users
```

### Subscription System
- Add subscription status to user profile
- Integrate payment provider (Stripe recommended)
- Create upgrade modal with pricing
- Add subscription management in settings

### Community Features
- Filter prompts by is_public = true
- Add user attribution to public prompts
- Implement copy-to-clipboard functionality
- Add AI tool icons/logos

## Implementation Priority
1. Email verification system (HIGH)
2. Remove dummy prompts (HIGH)
3. Fix copy button (HIGH)
4. Community section for free users (MEDIUM)
5. Pro plan subscription (MEDIUM)
6. AI tool logos (LOW)
7. Email spam folder reminders (LOW)

## Dependencies
- Firebase Auth (already configured)
- Supabase (already configured)
- Payment provider (Stripe - needs setup)
- Email service (Firebase already handles this)

## Out of Scope
- Advanced analytics
- Social features (likes, comments)
- Prompt versioning
- Team/collaboration features
