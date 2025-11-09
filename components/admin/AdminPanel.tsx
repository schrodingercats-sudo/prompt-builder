import React, { useState } from 'react';
import { AuthUser } from '../../services/authService';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminPrompts from './AdminPrompts';
import AdminAnalytics from './AdminAnalytics';
import AdminSubscriptions from './AdminSubscriptions';
import AdminSettings from './AdminSettings';
import ErrorBoundary from './ErrorBoundary';
import SkipToMain from './SkipToMain';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

interface AdminPanelProps {
  currentUser: AuthUser;
  onNavigateBack: () => void;
}

type AdminPage = 'dashboard' | 'users' | 'prompts' | 'analytics' | 'subscriptions' | 'settings';

const ADMIN_EMAIL = 'pratham.solanki30@gmail.com';

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onNavigateBack }) => {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser.email === ADMIN_EMAIL;

  // Redirect non-admin users
  if (!isAdmin) {
    onNavigateBack();
    return null;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard currentUser={currentUser} />;
      case 'users':
        return <AdminUsers currentUser={currentUser} />;
      case 'prompts':
        return <AdminPrompts currentUser={currentUser} />;
      case 'analytics':
        return <AdminAnalytics currentUser={currentUser} />;
      case 'subscriptions':
        return <AdminSubscriptions currentUser={currentUser} />;
      case 'settings':
        return <AdminSettings currentUser={currentUser} />;
      default:
        return <AdminDashboard currentUser={currentUser} />;
    }
  };

  return (
    <>
      <SkipToMain />
      <KeyboardShortcutsHelp />
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <AdminSidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onBack={onNavigateBack}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Open navigation menu"
            aria-expanded={isSidebarOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Main content */}
        <main id="main-content" className="flex-1 overflow-y-auto" role="main" aria-label="Admin panel content">
          <ErrorBoundary>
            {renderPage()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
    </>
  );
};

export default AdminPanel;
