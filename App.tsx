import React, { useState, useCallback, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CommunityPage from './components/CommunityPage';
import MyPromptsPage from './components/MyPromptsPage';
import PromptDetailPage from './components/PromptDetailPage';
import SettingsPage from './components/SettingsPage';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import UpgradeModal from './components/UpgradeModal';
import { Prompt, CreditsState } from './types';
import { LogoIcon } from './components/Icons';
import { authService, AuthUser } from './services/authService';
import { databaseService } from './services/databaseService';
import { blacklistService } from './services/blacklistService';



type PageState =
  | { name: 'dashboard' }
  | { name: 'community' }
  | { name: 'myPrompts' }
  | { name: 'promptDetail'; prompt: Prompt }
  | { name: 'settings' };

type InitialPrompt = {
  text: string;
  image: { data: string; mimeType: string } | null;
} | null;

const ADMIN_EMAIL = 'pratham.solanki30@gmail.com';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<PageState>({ name: 'dashboard' });
  const [activeNav, setActiveNav] = useState('Home');
  const [initialPrompt, setInitialPrompt] = useState<InitialPrompt>(null);
  const [pendingPrompt, setPendingPrompt] = useState<InitialPrompt>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [dashboardKey, setDashboardKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [credits, setCredits] = useState<CreditsState>({ count: 2, resetTime: null });

  const isUserAdmin = currentUser?.email === ADMIN_EMAIL;

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    if (isUserAdmin) {
      setCredits({ count: Infinity, resetTime: null });
      return;
    }

    // Load credits from database
    const loadCredits = async () => {
      try {
        // First ensure user profile exists
        await databaseService.getOrCreateUserProfile(currentUser);

        // Get current credits
        let userCredits = await databaseService.getUserCredits(currentUser.id);

        // Check if credits need to be reset
        if (userCredits.resetTime && Date.now() > userCredits.resetTime) {
          userCredits = await databaseService.updateCredits(currentUser.id, {
            ...userCredits,
            count: 2,
            resetTime: null
          });
        }

        setCredits(userCredits);
      } catch (error) {
        console.error("Database not set up yet, using localStorage fallback");

        // Fallback to localStorage until database is set up
        // Use Firebase UID instead of email for better persistence
        const creditsKey = `promptifyCredits_${currentUser.id}`;
        const oldCreditsKey = `promptifyCredits_${currentUser.email}`;

        try {
          // Check for existing credits with new key (Firebase UID)
          let savedCreditsRaw = localStorage.getItem(creditsKey);

          // If not found, check old key (email) and migrate
          if (!savedCreditsRaw) {
            const oldCreditsRaw = localStorage.getItem(oldCreditsKey);
            if (oldCreditsRaw) {
              // Migrate from email-based to UID-based storage
              localStorage.setItem(creditsKey, oldCreditsRaw);
              localStorage.removeItem(oldCreditsKey);
              savedCreditsRaw = oldCreditsRaw;
            }
          }

          if (savedCreditsRaw) {
            const savedCredits = JSON.parse(savedCreditsRaw) as CreditsState;
            if (savedCredits.resetTime && Date.now() > savedCredits.resetTime) {
              const newCredits = { count: 2, resetTime: null };
              localStorage.setItem(creditsKey, JSON.stringify(newCredits));
              setCredits(newCredits);
            } else {
              setCredits(savedCredits);
            }
          } else {
            const newCredits = { count: 2, resetTime: null };
            localStorage.setItem(creditsKey, JSON.stringify(newCredits));
            setCredits(newCredits);
          }
        } catch (localError) {
          console.error("localStorage fallback failed:", localError);
          setCredits({ count: 2, resetTime: null });
        }
      }
    };

    loadCredits();
  }, [currentUser, isUserAdmin]);

  const handleUseCredit = useCallback(async () => {
    if (!currentUser || isUserAdmin) return;

    try {
      const updatedCredits = await databaseService.useCredit(currentUser.id);
      setCredits(updatedCredits);

      // Show upgrade modal if credits reach 0
      if (updatedCredits.count === 0) {
        setIsUpgradeModalOpen(true);
      }
    } catch (error) {
      console.error("Database not set up yet, using localStorage fallback");

      // Fallback to localStorage behavior until database is set up
      // Use Firebase UID instead of email for better persistence
      const creditsKey = `promptifyCredits_${currentUser.id}`;
      setCredits(prevCredits => {
        const newCount = Math.max(0, prevCredits.count - 1);
        const newResetTime = newCount === 0 && !prevCredits.resetTime ? Date.now() + 24 * 60 * 60 * 1000 : prevCredits.resetTime;
        const newCredits: CreditsState = {
          count: newCount,
          resetTime: newResetTime,
        };
        localStorage.setItem(creditsKey, JSON.stringify(newCredits));

        // Show upgrade modal if credits reach 0
        if (newCount === 0) {
          setIsUpgradeModalOpen(true);
        }

        return newCredits;
      });
    }
  }, [currentUser, isUserAdmin]);

  const handleAttemptStart = useCallback((text: string, image: { data: string; mimeType: string } | null) => {
    const promptData = { text, image };
    if (currentUser) {
      setInitialPrompt(promptData);
      setPage({ name: 'dashboard' });
      setActiveNav('Home');
    } else {
      setPendingPrompt(promptData);
      setIsAuthModalOpen(true);
    }
  }, [currentUser]);

  const handleLoginSuccess = useCallback((user: AuthUser) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setInitialPrompt(pendingPrompt);
    setPage({ name: 'dashboard' });
    setActiveNav('Home');
    setPendingPrompt(null);
  }, [pendingPrompt]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setPage({ name: 'dashboard' });
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }, []);

  const handleNavigateToCommunity = useCallback(() => {
    setPage({ name: 'community' });
    setActiveNav('Community');
  }, []);

  const handleNavigateToLanding = useCallback(() => {
    if (currentUser) {
      setPage({ name: 'dashboard' });
      setActiveNav('Home');
    }
  }, [currentUser]);

  const handleSelectPrompt = useCallback((prompt: Prompt) => setPage({ name: 'promptDetail', prompt }), []);

  const handleNewPrompt = useCallback(() => {
    setInitialPrompt(null);
    setDashboardKey(prevKey => prevKey + 1);
    setPage({ name: 'dashboard' });
    setActiveNav('Home');
    setIsSidebarOpen(false);
  }, []);

  const handleNavChange = useCallback((nav: string) => {
    setActiveNav(nav);
    if (nav === 'Home') {
      setInitialPrompt(null);
      setDashboardKey(prevKey => prevKey + 1);
      setPage({ name: 'dashboard' });
    } else if (nav === 'Community') {
      setPage({ name: 'community' });
    } else if (nav === 'My prompts') {
      setPage({ name: 'myPrompts' });
    } else if (nav === 'Settings') {
      setPage({ name: 'settings' });
    }
    setIsSidebarOpen(false);
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (!currentUser) return;
    try {
      // Add email to blacklist to prevent recreation
      blacklistService.addToBlacklist(currentUser.email);

      // Clean up local storage data
      localStorage.removeItem(`savedPrompts_${currentUser.email}`);
      localStorage.removeItem(`promptifyCredits_${currentUser.email}`);
      localStorage.removeItem(`promptifyCredits_${currentUser.id}`);

      // TODO: Clean up Supabase data when database is set up
      // await databaseService.deleteUserData(currentUser.id);

      // Firebase account deletion is handled in SettingsPage
      // This function is called after successful deletion
      setCurrentUser(null);
      setPage({ name: 'dashboard' });

      console.log(`Account ${currentUser.email} deleted and blacklisted`);
    } catch (e) {
      console.error("Failed to clean up account data", e);
    }
  }, [currentUser]);



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LandingPage onAttemptStart={handleAttemptStart} onNavigateToCommunity={() => { setPendingPrompt(null); setIsAuthModalOpen(true); }} onSelectPrompt={() => { setPendingPrompt(null); setIsAuthModalOpen(true); }} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  const renderContent = () => {
    switch (page.name) {
      case 'dashboard':
        return <Dashboard key={dashboardKey} initialPrompt={initialPrompt} credits={credits} onUseCredit={handleUseCredit} currentUser={currentUser} />;
      case 'community':
        return <CommunityPage onNavigateToLanding={handleNavigateToLanding} onSelectPrompt={handleSelectPrompt} />;
      case 'myPrompts':
        return <MyPromptsPage currentUser={currentUser!} onSelectPrompt={handleSelectPrompt} onNavigateToCommunity={handleNavigateToCommunity} />;
      case 'promptDetail':
        return <PromptDetailPage currentUser={currentUser} prompt={page.prompt} onNavigateBack={handleNavigateToCommunity} />;
      case 'settings':
        return <SettingsPage currentUser={currentUser!} onDeleteAccount={handleDeleteAccount} />;
      default:
        return <Dashboard key={dashboardKey} initialPrompt={initialPrompt} credits={credits} onUseCredit={handleUseCredit} currentUser={currentUser!} />;
    }
  };

  return (
    <div className="text-[#1E1E1E] flex h-screen bg-white overflow-hidden">
      <Sidebar
        currentUser={currentUser}
        activeNav={activeNav}
        setActiveNav={handleNavChange}
        onNewPrompt={handleNewPrompt}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        credits={credits}
        onLogout={handleLogout}

      />
      <main className="flex-1 relative overflow-y-auto">
        <div className="md:hidden p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8" />
            <span className="font-bold text-lg text-gray-800">Promptify</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-1">
            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {renderContent()}
      </main>
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </div>
  );
};

export default App;
