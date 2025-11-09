import React from 'react';
import { 
  HomeIcon, 
  FolderIcon, 
  ChartBarIcon, 
  CreditCardIcon, 
  SettingsIcon,
  ArrowLeftIcon,
  CloseIcon
} from '../Icons';

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onBack: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  currentPage, 
  onNavigate, 
  onBack,
  isOpen,
  setIsOpen 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'users', label: 'Users', icon: FolderIcon },
    { id: 'prompts', label: 'Prompts', icon: FolderIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCardIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}
        aria-label="Admin navigation sidebar"
        role="navigation"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <p className="text-sm text-gray-400 mt-1">Promptify</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Close sidebar"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto" aria-label="Admin panel navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
                  ${isActive 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                     text-gray-300 hover:bg-gray-800 hover:text-white
                     transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Return to main application"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            <span className="font-medium">Back to App</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
