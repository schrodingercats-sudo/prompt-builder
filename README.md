# 🚀 Promptify - AI Prompt Optimization Tool

Transform your basic prompts into detailed, optimized instructions for AI development tools like Lovable AI, Cursor, v0, Replit, and Bolt AI.

![Promptify Banner](https://github.com/schrodingercats-sudo/prompt-builder/assets/banner.png)

## ✨ Features

### 🎯 **Smart Prompt Optimization**
- **AI-Powered Enhancement**: Uses Google's Gemini AI to analyze and improve your prompts
- **Multi-Modal Support**: Upload images for additional context
- **Model-Specific Optimization**: Tailored for different AI development tools
- **Intelligent Suggestions**: Get actionable recommendations to improve your prompts

### 🔐 **Secure Authentication**
- **Firebase Authentication**: Secure user management with email/password and Google OAuth
- **Account Security**: Password reset functionality and secure account deletion
- **Anti-Abuse Protection**: Blacklist system prevents credit exploitation

### 💾 **Smart Data Management**
- **Cloud Storage**: Supabase integration for persistent data across devices
- **Automatic Saving**: All generated prompts are saved automatically
- **Smart Icons**: Content-based icons for easy prompt identification
- **Public/Private Prompts**: Free users get public prompts, paid users get private storage

### 💳 **Credit System**
- **Fair Usage**: 2 free credits per day for all users
- **Credit Protection**: Secure credit tracking prevents exploitation
- **Upgrade Prompts**: Smart upgrade suggestions when credits run out
- **Admin Unlimited**: Admin users get unlimited credits

### 🎨 **Beautiful UI/UX**
- **Modern Design**: Clean, responsive interface built with React and Tailwind CSS
- **Interactive Comparisons**: Before/after slider showing prompt improvements
- **Smart Loading States**: Smooth user experience with proper loading indicators
- **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend**: React 19.2.0 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom components
- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI Integration**: Google Gemini AI for prompt optimization
- **State Management**: React hooks with localStorage fallbacks

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase project
- Supabase project
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/schrodingercats-sudo/prompt-builder.git
   cd prompt-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API keys and configuration:
   ```env
   # Gemini AI API Key
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   # ... (see .env.example for all variables)
   
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Go to your Supabase dashboard
   - Run the SQL from `URGENT_DATABASE_SETUP.md`

5. **Configure Firebase**
   - Follow the steps in `FIREBASE_EMAIL_SETUP.md`
   - Enable Email/Password and Google authentication

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
prompt-builder/
├── components/           # React components
│   ├── AuthModal.tsx    # Authentication modal
│   ├── Dashboard.tsx    # Main prompt optimization interface
│   ├── LandingPage.tsx  # Marketing landing page
│   ├── MyPromptsPage.tsx # User's saved prompts
│   ├── UpgradeModal.tsx # Upgrade to Pro modal
│   └── ...
├── services/            # Business logic and API integrations
│   ├── authService.ts   # Firebase authentication
│   ├── databaseService.ts # Supabase database operations
│   ├── geminiService.ts # Google Gemini AI integration
│   └── blacklistService.ts # Anti-abuse protection
├── database/            # Database schema and setup
│   └── schema.sql       # Supabase database schema
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🔧 Configuration Files

- `URGENT_DATABASE_SETUP.md` - Database setup instructions
- `FIREBASE_EMAIL_SETUP.md` - Firebase email configuration
- `DATABASE_SETUP.md` - Comprehensive database guide
- `.env.example` - Environment variables template

## 🎯 Key Features Implemented

### ✅ **Authentication & Security**
- Firebase Auth with email/password and Google OAuth
- Password reset functionality
- Secure account deletion with blacklist protection
- Anti-credit-exploitation measures

### ✅ **Prompt Management**
- Automatic prompt saving after generation
- Smart content-based icons
- Public/private prompt logic
- Cross-device synchronization

### ✅ **Credit System**
- Secure credit tracking with database persistence
- Daily credit limits with reset functionality
- Upgrade prompts for free users
- Admin unlimited access

### ✅ **UI/UX Excellence**
- Responsive design for all devices
- Interactive before/after comparisons
- Smart loading states and error handling
- Professional upgrade modals

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push

### Environment Variables for Production
Make sure to set all environment variables from `.env.example` in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for prompt optimization
- **Firebase** for authentication and hosting
- **Supabase** for database and real-time features
- **Tailwind CSS** for beautiful styling
- **React** and **Vite** for the development experience

## 📞 Support

For support, email support@promptify.com or join our Discord community.

---

**Built with ❤️ by [schrodingercats-sudo](https://github.com/schrodingercats-sudo)**