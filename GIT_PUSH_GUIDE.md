# 🚀 Git Push Guide - Promptify to GitHub

## 📋 **Quick Push Commands**

Run these commands in your terminal (in the project directory):

```bash
# 1. Initialize git (if not already done)
git init

# 2. Add your GitHub repository as remote
git remote add origin https://github.com/schrodingercats-sudo/prompt-builder.git

# 3. Add all files to staging
git add .

# 4. Commit with a descriptive message
git commit -m "feat: Complete Promptify app with Firebase auth, Supabase integration, and security fixes

✨ Features:
- Firebase Authentication (Google OAuth + Email/Password)
- Supabase database integration for persistent data
- Smart prompt saving with public/private logic
- Automatic upgrade popup when credits run out
- Password reset functionality
- Account deletion with blacklist security
- Smart profile pictures (Google photo or initial avatar)
- Content-based icons for saved prompts
- Credit system with refresh exploit fix
- Comparison slider with real before/after images

🔒 Security:
- Blacklist system prevents deleted account recreation
- Persistent credit tracking (no refresh/logout bypass)
- Row Level Security policies in Supabase
- Proper Firebase authentication flow

🎨 UI/UX:
- Responsive design for all screen sizes
- Loading states and error handling
- Professional upgrade modal
- Smart avatar system
- Interactive comparison slider"

# 5. Push to GitHub
git push -u origin main

# If the branch is named 'master' instead of 'main', use:
# git push -u origin master
```

## 🔐 **Important: Protect Sensitive Files**

### **Before pushing, make sure `.gitignore` includes:**

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Firebase service account
*.json
promptify-e5a82-firebase-adminsdk-*.json

# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
build/
.vite/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Kiro specs (optional - remove if you want to include them)
.kiro/
```

### **Create `.gitignore` file:**

```bash
# Create .gitignore if it doesn't exist
echo "node_modules/" > .gitignore
echo ".env.local" >> .gitignore
echo "*.json" >> .gitignore
echo "dist/" >> .gitignore
echo ".vite/" >> .gitignore
```

## 📝 **Files to Push:**

### **Source Code:**
- ✅ `components/` - All React components
- ✅ `services/` - Firebase, Supabase, database services
- ✅ `database/` - SQL schema files
- ✅ `App.tsx` - Main app component
- ✅ `types.ts` - TypeScript types
- ✅ `index.tsx` - Entry point
- ✅ `vite.config.ts` - Vite configuration
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `package.json` - Dependencies

### **Documentation:**
- ✅ `README.md` - Project documentation
- ✅ `FIREBASE_SETUP.md` - Firebase setup guide
- ✅ `FIREBASE_EMAIL_SETUP.md` - Email configuration
- ✅ `DATABASE_SETUP.md` - Database setup guide
- ✅ `URGENT_DATABASE_SETUP.md` - Quick database setup
- ✅ `.env.example` - Environment variable template

### **DO NOT Push:**
- ❌ `.env.local` - Contains sensitive API keys
- ❌ `promptify-e5a82-firebase-adminsdk-*.json` - Firebase service account
- ❌ `node_modules/` - Dependencies (too large)
- ❌ `dist/` - Build output

## 🔄 **If Repository Already Exists:**

If you get an error about the repository already existing:

```bash
# Option 1: Force push (overwrites remote)
git push -u origin main --force

# Option 2: Pull first, then push
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## 🌐 **After Pushing:**

### **1. Set up GitHub Secrets (for deployment):**
Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

### **2. Enable GitHub Pages (optional):**
- Go to Settings → Pages
- Select branch: `main`
- Select folder: `/dist` (after building)

### **3. Add Repository Description:**
> "Promptify - AI-powered prompt optimization tool with Firebase authentication and Supabase database integration"

### **4. Add Topics:**
- `react`
- `typescript`
- `firebase`
- `supabase`
- `vite`
- `ai`
- `prompt-engineering`

## 🎯 **Verify Push:**

After pushing, check:
1. Go to https://github.com/schrodingercats-sudo/prompt-builder
2. Verify all files are there
3. Check that `.env.local` is NOT visible
4. Verify README.md displays correctly

## 🆘 **Troubleshooting:**

### **Authentication Error:**
```bash
# If you get authentication error, use personal access token
git remote set-url origin https://YOUR_TOKEN@github.com/schrodingercats-sudo/prompt-builder.git
```

### **Large File Error:**
```bash
# If files are too large, check .gitignore
git rm --cached node_modules -r
git commit -m "Remove node_modules"
```

### **Merge Conflicts:**
```bash
# If there are conflicts
git pull origin main
# Resolve conflicts manually
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

## ✅ **Success!**

Your code is now on GitHub at:
https://github.com/schrodingercats-sudo/prompt-builder

🎉 **Next steps:**
- Set up CI/CD for automatic deployment
- Configure environment variables for production
- Set up Supabase database
- Configure Firebase email templates
- Deploy to Vercel/Netlify