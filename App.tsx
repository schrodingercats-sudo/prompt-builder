import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CommunityPage from './components/CommunityPage';
import PromptDetailPage from './components/PromptDetailPage';
import Sidebar from './components/Sidebar';
import { Prompt } from './types';

type PageState =
  | { name: 'landing' }
  | { name: 'dashboard' }
  | { name: 'community' }
  | { name: 'promptDetail'; prompt: Prompt };

const App: React.FC = () => {
  const [page, setPage] = useState<PageState>({ name: 'landing' });
  const [activeNav, setActiveNav] = useState('Home');

  const handleLogin = useCallback(() => {
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

  const handleNavChange = useCallback((nav: string) => {
    setActiveNav(nav);
    if (nav === 'Home') {
      setPage({ name: 'dashboard' });
    } else if (nav === 'Community') {
      setPage({ name: 'community' });
    }
    // Other nav items can be handled here
  }, []);

  const renderPage = () => {
    if (page.name === 'landing') {
      return <LandingPage onLogin={handleLogin} onNavigateToCommunity={handleNavigateToCommunity} onSelectPrompt={handleSelectPrompt} />;
    }
    
    const renderPageContent = () => {
      switch (page.name) {
        case 'dashboard':
          return <Dashboard onLogout={handleLogout} />;
        case 'community':
          return <CommunityPage onNavigateToLanding={handleNavigateToLanding} onSelectPrompt={handleSelectPrompt} />;
        case 'promptDetail':
          return <PromptDetailPage prompt={page.prompt} onNavigateBack={handleNavigateToCommunity} />;
        default:
          return <Dashboard onLogout={handleLogout} />;
      }
    };

    return (
      <div className="flex h-screen bg-white overflow-hidden">
        <Sidebar activeNav={activeNav} setActiveNav={handleNavChange} />
        <main className="flex-1 relative overflow-y-auto">
          {renderPageContent()}
        </main>
      </div>
    );
  };

  return (
    <div className="text-[#1E1E1E]">
      {renderPage()}
    </div>
  );
};

export default App;
