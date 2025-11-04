import React from 'react';
import {
  LovableHeartIcon, HomeIcon, FolderIcon, FlaskIcon, HelpIcon,
  CreditCardIcon, SparklesIcon, PlusIcon, WarningIcon, ChevronDownIcon, GlobeIcon
} from './Icons';

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeNav, setActiveNav }) => {
  const navItems = [
    { name: 'Home', icon: <HomeIcon className="h-5 w-5" /> },
    { name: 'My prompts', icon: <FolderIcon className="h-5 w-5" /> },
    { name: 'Community', icon: <GlobeIcon className="h-5 w-5" /> },
    { name: 'Lab', icon: <FlaskIcon className="h-5 w-5" />, tag: 'Upgrade' },
    { name: 'Help', icon: <HelpIcon className="h-5 w-5" /> },
  ];

  return (
    <nav className="w-72 flex-shrink-0 bg-[#FBFBFB] border-r border-gray-200 flex flex-col justify-between p-4">
      <div>
        <div className="flex items-center gap-2 mb-8 px-2">
          <LovableHeartIcon className="h-8 w-8" />
          <span className="font-bold text-lg text-gray-800">Promptify</span>
        </div>
        
        <button className="w-full bg-black text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 mb-6 hover:bg-gray-800 transition-colors">
          <PlusIcon className="h-5 w-5" />
          New Prompt
        </button>

        <ul className="space-y-1">
          {navItems.map(item => (
            <li key={item.name}>
              <a
                href="#"
                onClick={() => setActiveNav(item.name)}
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
            <span>Free Plan</span>
            <CreditCardIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Credits</span>
              <span>2 / 2</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-yellow-500 h-1.5 rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>
          <div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800 flex items-start gap-2">
            <WarningIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Low credits</p>
              <p>Only 2 credits remaining.</p>
            </div>
          </div>
          <button className="w-full mt-3 bg-[#7C3AED] text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-2">
            <SparklesIcon className="h-4 w-4"/>
            Get 100 prompts
          </button>
        </div>

        <div className="flex items-center justify-between p-1">
           <div className="flex items-center gap-2">
            <img src={`https://i.pravatar.cc/40?u=pratham.solanki30`} alt="User avatar" className="rounded-full w-8 h-8" />
            <div>
                <p className="font-semibold text-sm">pratham.solanki30</p>
                <p className="text-xs text-gray-500">pratham.solanki30@...</p>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-800">
            <ChevronDownIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
