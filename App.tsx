import React, { useState, useCallback, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CommunityPage from './components/CommunityPage';
import MyPromptsPage from './components/MyPromptsPage';
import PromptDetailPage from './components/PromptDetailPage';
import SettingsPage from './components/SettingsPage';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import { Prompt } from './types';
import { LogoIcon } from './components/Icons';

type User = {
  email: string;
};

type CreditsState = {
  count: number;
  resetTime: number | null;
};

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState<PageState>({ name: 'dashboard' });
  const [activeNav, setActiveNav] = useState('Home');
  const [initialPrompt, setInitialPrompt] = useState<InitialPrompt>(null);
  const [pendingPrompt, setPendingPrompt] = useState<InitialPrompt>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [dashboardKey, setDashboardKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [credits, setCredits] = useState<CreditsState>({ count: 2, resetTime: null });

  const isUserAdmin = currentUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!currentUser) return;

    if (isUserAdmin) {
      setCredits({ count: Infinity, resetTime: null });
      return;
    }
    
    const creditsKey = `promptifyCredits_${currentUser.email}`;
    try {
      const savedCreditsRaw = localStorage.getItem(creditsKey);
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
        localStorage.setItem(creditsKey, JSON.stringify({ count: 2, resetTime: null }));
        setCredits({ count: 2, resetTime: null });
      }
    } catch (error) {
      console.error("Failed to manage credits in localStorage:", error);
      setCredits({ count: 2, resetTime: null });
    }
  }, [currentUser, isUserAdmin]);

  const handleUseCredit = useCallback(() => {
    if (!currentUser || isUserAdmin) return;
    
    const creditsKey = `promptifyCredits_${currentUser.email}`;
    setCredits(prevCredits => {
      const newCount = Math.max(0, prevCredits.count - 1);
      const newResetTime = newCount === 0 && !prevCredits.resetTime ? Date.now() + 24 * 60 * 60 * 1000 : prevCredits.resetTime;
      const newCredits: CreditsState = {
        count: newCount,
        resetTime: newResetTime,
      };
      localStorage.setItem(creditsKey, JSON.stringify(newCredits));
      return newCredits;
    });
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

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setInitialPrompt(pendingPrompt);
    setPage({ name: 'dashboard' });
    setActiveNav('Home');
    setPendingPrompt(null);
  }, [pendingPrompt]);

  const handleLogout = useCallback(() => {
      setCurrentUser(null);
      setPage({ name: 'dashboard' }); // Reset to default page for next login
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
  
  const handleDeleteAccount = useCallback(() => {
    if (!currentUser) return;
    try {
        const usersRaw = localStorage.getItem('promptifyUsers');
        let users = usersRaw ? JSON.parse(usersRaw) : [];
        users = users.filter((u: User) => u.email !== currentUser.email);
        localStorage.setItem('promptifyUsers', JSON.stringify(users));
    } catch (e) {
        console.error("Failed to remove user from database", e);
    }
    localStorage.removeItem(`savedPrompts_${currentUser.email}`);
    localStorage.removeItem(`promptifyCredits_${currentUser.email}`);
    handleLogout();
  }, [currentUser, handleLogout]);

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
        return <Dashboard key={dashboardKey} initialPrompt={initialPrompt} credits={credits} onUseCredit={handleUseCredit} />;
      case 'community':
        return <CommunityPage onNavigateToLanding={handleNavigateToLanding} onSelectPrompt={handleSelectPrompt} />;
      case 'myPrompts':
        return <MyPromptsPage currentUser={currentUser} onSelectPrompt={handleSelectPrompt} onNavigateToCommunity={handleNavigateToCommunity} />;
      case 'promptDetail':
        return <PromptDetailPage currentUser={currentUser} prompt={page.prompt} onNavigateBack={handleNavigateToCommunity} />;
      case 'settings':
        return <SettingsPage onDeleteAccount={handleDeleteAccount} />;
      default:
        return <Dashboard key={dashboardKey} initialPrompt={initialPrompt} credits={credits} onUseCredit={handleUseCredit} />;
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
    </div>
  );
};

export default App;
