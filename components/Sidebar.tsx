import React, { useState, useRef, useEffect } from 'react';
import {
  HomeIcon, FolderIcon,
  CreditCardIcon, SparklesIcon, PlusIcon, WarningIcon, ChevronDownIcon, GlobeIcon,
  SettingsIcon, TrashIcon, ChevronUpIcon, LogoutIcon, LogoIcon
} from './Icons';
import { AuthUser } from '../services/authService';
import { CreditsState } from '../types';

interface SidebarProps {
  currentUser: AuthUser;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onNewPrompt: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  credits: CreditsState;
  onLogout: () => void;

}

// User Avatar Component - Shows Google photo or initial letter
const UserAvatar: React.FC<{ user: AuthUser; size?: number }> = ({ user, size = 32 }) => {
  const [imageError, setImageError] = useState(false);
  
  const profilePicture = user.photoURL; // Google profile picture from Firebase
  const initial = user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase();
  
  // Generate a consistent color based on email
  const getColorFromEmail = (email: string) => {
    const colors = [
      'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (profilePicture && !imageError) {
    return (
      <img 
        src={profilePicture} 
        alt="User avatar" 
        className={`rounded-full flex-shrink-0`}
        style={{ width: size, height: size }}
        onError={() => setImageError(true)}
      />
    );
  }

  // Show initial letter avatar
  return (
    <div 
      className={`rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${getColorFromEmail(user.email)}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {initial}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeNav, setActiveNav, onNewPrompt, isOpen, setIsOpen, credits, onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  const isUnlimited = credits.count === Infinity;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (isUnlimited || credits.count > 0 || !credits.resetTime) {
      setTimeRemaining('');
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const distance = credits.resetTime! - now;

      if (distance < 0) {
        setTimeRemaining('Resetting credits...');
        clearInterval(intervalId);
        // This is a temporary solution for a client-side only app.
        // In a real app, credit reset would be handled server-side.
        setTimeout(() => window.location.reload(), 1500);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [credits.count, credits.resetTime, isUnlimited]);

  const navItems: { name: string; icon: React.ReactElement; tag?: string }[] = [
    { name: 'Home', icon: <HomeIcon className="h-5 w-5" /> },
    { name: 'My prompts', icon: <FolderIcon className="h-5 w-5" /> },
    { name: 'Community', icon: <GlobeIcon className="h-5 w-5" /> },
  ];

  const userMenuItems = [
    ...(currentUser.email === 'pratham.solanki30@gmail.com' 
      ? [{ name: 'Admin Panel', icon: <SettingsIcon className="h-5 w-5" /> }] 
      : []
    ),
    { name: 'Settings', icon: <SettingsIcon className="h-5 w-5" /> },
    { name: 'Sign Out', icon: <LogoutIcon className="h-5 w-5" />, isDestructive: true },
  ];
  
  const handleUserMenuClick = (itemName: string) => {
    setIsUserMenuOpen(false);
    switch (itemName) {
        case 'Admin Panel':
            setActiveNav('Admin Panel');
            break;
        case 'Settings':
            setActiveNav('Settings');
            break;
        case 'Sign Out':
            onLogout();
            break;
        default:
            break;
    }
  };


  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/30 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>
      <nav className={`w-72 flex-shrink-0 bg-[#FBFBFB] border-r border-gray-200 flex flex-col justify-between p-4 fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="hidden md:flex items-center gap-2 mb-8 px-2">
            <LogoIcon className="h-8 w-8" />
            <span className="font-bold text-lg text-gray-800">Promptify</span>
          </div>
          
          <button 
            onClick={onNewPrompt}
            className="w-full bg-black text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 mb-6 hover:bg-gray-800 transition-colors">
            <PlusIcon className="h-5 w-5" />
            New Prompt
          </button>

          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.name}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveNav(item.name);
                  }}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors text-gray-700 font-medium ${
                    activeNav === item.name
                      ? 'bg-purple-100 text-purple-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  {item.tag && (
                    <span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-0.5 rounded-full">{item.tag}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>{isUnlimited ? 'Admin Plan' : 'Free Plan'}</span>
              <CreditCardIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Credits</span>
                <span>{isUnlimited ? 'Unlimited' : `${credits.count} / 2`}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{width: isUnlimited ? '100%' : `${(credits.count / 2) * 100}%`}}></div>
              </div>
            </div>
            {!isUnlimited && credits.count <= 1 && (
              <div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800 flex items-start gap-2">
                <WarningIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  {credits.count === 1 && (
                    <>
                      <p className="font-bold">Low credits</p>
                      <p>Only 1 credit remaining.</p>
                    </>
                  )}
                  {credits.count === 0 && (
                    <>
                      <p className="font-bold">No credits left</p>
                      <p>Resets in: {timeRemaining}</p>
                    </>
                  )}
                </div>
              </div>
            )}
            {isUnlimited && (
              <div className="mt-3 p-2.5 bg-purple-50 border border-purple-200 rounded-md text-xs text-purple-800 flex items-start gap-2">
                <SparklesIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Admin Account</p>
                  <p>You have unlimited prompt generations.</p>
                </div>
              </div>
            )}
          </div>



          <div ref={userMenuRef} className="relative">
             {isUserMenuOpen && (
              <div className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-lg border animate-fade-in-up z-20">
                <div className="p-2">
                  {userMenuItems.map(item => (
                    <button 
                      key={item.name} 
                      onClick={() => handleUserMenuClick(item.name)}
                      className={`w-full flex items-center gap-3 p-2 text-sm rounded-md transition-colors ${item.isDestructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'}`}>
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors">
               <div className="flex items-center gap-2 overflow-hidden">
                <UserAvatar user={currentUser} size={32} />
                <div className="truncate">
                    <p className="font-semibold text-sm text-left truncate">{currentUser.displayName || currentUser.email.split('@')[0]}</p>
                    <p className="text-xs text-gray-500 text-left truncate">{currentUser.email}</p>
                </div>
              </div>
              <div className="text-gray-500 hover:text-gray-800 flex-shrink-0">
                {isUserMenuOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
              </div>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;