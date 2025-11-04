import React, { useState, useCallback, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CommunityPage from './components/CommunityPage';
import MyPromptsPage from './components/MyPromptsPage';
import PromptDetailPage from './components/PromptDetailPage';
import Sidebar from './components/Sidebar';
import { Prompt } from './types';
import { LovableHeartIcon } from './components/Icons';

type CreditsState = {
  count: number;
  resetTime: number | null;
};

type PageState =
  | { name: 'landing' }
  | { name: 'dashboard' }
  | { name: 'community' }
  | { name: 'myPrompts' }
  | { name: 'promptDetail'; prompt: Prompt };

type InitialPrompt = {
  text: string;
  image: { data: string; mimeType: string } | null;
} | null;

const App: React.FC = () => {
  const [page, setPage] = useState<PageState>({ name: 'landing' });
  const [activeNav, setActiveNav] = useState('Home');
  const [initialPrompt, setInitialPrompt] = useState<InitialPrompt>(null);
  const [dashboardKey, setDashboardKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [credits, setCredits] = useState<CreditsState>({ count: 2, resetTime: null });

  useEffect(() => {
    try {
      const savedCreditsRaw = localStorage.getItem('promptifyCredits');
      if (savedCreditsRaw) {
        const savedCredits = JSON.parse(savedCreditsRaw) as CreditsState;
        if (savedCredits.resetTime && Date.now() > savedCredits.resetTime) {
          const newCredits = { count: 2, resetTime: null };
          localStorage.setItem('promptifyCredits', JSON.stringify(newCredits));
          setCredits(newCredits);
        } else {
          setCredits(savedCredits);
        }
      } else {
        localStorage.setItem('promptifyCredits', JSON.stringify({ count: 2, resetTime: null }));
      }
    } catch (error) {
      console.error("Failed to manage credits in localStorage:", error);
      setCredits({ count: 2, resetTime: null });
    }
  }, []);

  const handleUseCredit = useCallback(() => {
    setCredits(prevCredits => {
      const newCount = Math.max(0, prevCredits.count - 1);
      const newResetTime = newCount === 0 ? Date.now() + 24 * 60 * 60 * 1000 : prevCredits.resetTime;
      const newCredits: CreditsState = {
        count: newCount,
        resetTime: newResetTime,
      };
      localStorage.setItem('promptifyCredits', JSON.stringify(newCredits));
      return newCredits;
    });
  }, []);

  const handleStart = useCallback((text: string, image: { data: string; mimeType: string } | null) => {
    setInitialPrompt({ text, image });
    setPage({ name: 'dashboard' });
    setActiveNav('Home');
  }, []);

  const handleLogout = useCallback(() => setPage({ name: 'landing' }), []);

  const handleNavigateToCommunity = useCallback(() => {
    setPage({ name: 'community' });
    setActiveNav('Community');
  }, []);
  
  const handleNavigateToLanding = useCallback(() => setPage({ name: 'landing' }), []);

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
    }
    setIsSidebarOpen(false);
  }, []);

  if (page.name === 'landing') {
    return <LandingPage onStart={handleStart} onNavigateToCommunity={handleNavigateToCommunity} onSelectPrompt={handleSelectPrompt} />;
  }
  
  const renderContent = () => {
    switch (page.name) {
      case 'dashboard':
        return <Dashboard key={dashboardKey} initialPrompt={initialPrompt} onLogout={handleLogout} credits={credits} onUseCredit={handleUseCredit} />;
      case 'community':
        return <CommunityPage onNavigateToLanding={handleNavigateToLanding} onSelectPrompt={handleSelectPrompt} />;
      case 'myPrompts':
        return <MyPromptsPage onSelectPrompt={handleSelectPrompt} onNavigateToCommunity={handleNavigateToCommunity} />;
      case 'promptDetail':
        return <PromptDetailPage prompt={page.prompt} onNavigateBack={handleNavigateToCommunity} />;
      default:
        return <Dashboard key={dashboardKey} initialPrompt={initialPrompt} onLogout={handleLogout} credits={credits} onUseCredit={handleUseCredit} />;
    }
  };

  return (
    <div className="text-[#1E1E1E] flex h-screen bg-white overflow-hidden">
      <Sidebar 
        activeNav={activeNav} 
        setActiveNav={handleNavChange} 
        onNewPrompt={handleNewPrompt} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        credits={credits}
      />
      <main className="flex-1 relative overflow-y-auto">
        <div className="md:hidden p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10">
           <div className="flex items-center gap-2">
              <LovableHeartIcon className="h-7 w-7" />
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