import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CommunityPage from './components/CommunityPage';
import PromptDetailPage from './components/PromptDetailPage';
import Sidebar from './components/Sidebar';
import { Prompt } from './types';
import { LovableHeartIcon } from './components/Icons';

type PageState =
  | { name: 'landing' }
  | { name: 'dashboard' }
  | { name: 'community' }
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
    }
    setIsSidebarOpen(false);
  }, []);

  if (page.name === 'landing') {
    return <LandingPage onStart={handleStart} onNavigateToCommunity={handleNavigateToCommunity} onSelectPrompt={handleSelectPrompt} />;
  }
  
  const renderContent = () => {
    switch (page.name) {
      case 'dashboard':
        return <Dashboard key={dashboardKey} initialPrompt={initialPrompt} onLogout={handleLogout} />;
      case 'community':
        return <CommunityPage onNavigateToLanding={handleNavigateToLanding} onSelectPrompt={handleSelectPrompt} />;
      case 'promptDetail':
        return <PromptDetailPage prompt={page.prompt} onNavigateBack={handleNavigateToCommunity} />;
      default:
        return <Dashboard key={dashboardKey} initialPrompt={initialPrompt} onLogout={handleLogout} />;
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
