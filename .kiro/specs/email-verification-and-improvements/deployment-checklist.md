# Deployment Checklist

## Pre-Deployment

### Code Review
- [x] Email verification system implemented
- [x] Disposable email validation added
- [x] Database schema updated
- [x] Types updated for new fields
- [x] Copy button functionality verified
- [x] AI tool logos displaying correctly
- [x] Public prompts default for free users

### Testing
- [ ] Test email verification flow locally
- [ ] Test with disposable email (should be blocked)
- [ ] Test with valid email (should work)
- [ ] Test Google OAuth signup
- [ ] Test resend verification email
- [ ] Test copy button on all pages
- [ ] Test community page with public prompts
- [ ] Test mobile responsiveness

### Database
- [ ] Run database migration in Supabase
- [ ] Verify schema changes applied
- [ ] Test database connection
- [ ] Backup existing data

## Deployment Steps

### 1. Database Migration
```bash
# Run migration SQL in Supabase dashboard
# See database-migration.md for SQL commands
```

### 2. Environment Variables
Verify these are set in Vercel:
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `GEMINI_API_KEY`
- [ ] Firebase config variables

### 3. Deploy to Vercel
```bash
git push origin main
# Vercel will auto-deploy
```

### 4. Firebase Configuration
- [ ] Enable email verification in Firebase Console
- [ ] Customize email templates (optional)
  - Go to Firebase Console > Authentication > Templates
  - Update "Email address verification" template
  - Add spam folder reminder text
- [ ] Test email delivery

## Post-Deployment

### Verification
- [ ] Visit production URL
- [ ] Test signup flow
- [ ] Check email verification works
- [ ] Verify emails are being sent
- [ ] Check spam folder for test emails
- [ ] Test Google OAuth
- [ ] Verify community page loads
- [ ] Test copy button functionality
- [ ] Check mobile experience

### Monitoring
- [ ] Check Vercel deployment logs
- [ ] Monitor Firebase authentication logs
- [ ] Check Supabase logs for errors
- [ ] Monitor email delivery rates

### User Communication
- [ ] Notify existing users about email verification
- [ ] Update documentation/help center
- [ ] Prepare support responses for common issues

## Known Issues & Limitations

### Current Limitations
1. **Email Verification**: Users can still browse but cannot use credits until verified
2. **Dummy Prompts**: Still present in community - need manual cleanup
3. **Subscription**: Payment integration not yet implemented
4. **Firebase Templates**: Need manual customization in Firebase Console

### Future Improvements
1. Implement Stripe payment integration
2. Add private prompts for Pro users
3. Clean up dummy prompts from database
4. Add email verification reminder notifications
5. Implement email verification expiry

## Rollback Plan

If issues occur:

### Quick Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Database Rollback
```sql
-- See database-migration.md for rollback SQL
```

### Communication
- [ ] Notify users of temporary issues
- [ ] Post status update
- [ ] Provide ETA for fix

## Success Criteria

Deployment is successful when:
- [x] Code deployed without errors
- [ ] Email verification emails are being sent
- [ ] Users can verify their emails
- [ ] Disposable emails are blocked
- [ ] Community page shows public prompts
- [ ] Copy button works on all pages
- [ ] No critical errors in logs
- [ ] Mobile experience is smooth

## Support Preparation

### Common User Questions
1. **"I didn't receive verification email"**
   - Check spam folder
   - Use resend button
   - Verify email address is correct

2. **"Why can't I use credits?"**
   - Email must be verified first
   - Check verification modal

3. **"My email is blocked"**
   - Disposable/temporary emails not allowed
   - Use permanent email address

### Support Resources
- Link to help documentation
- Email support contact
- FAQ section
