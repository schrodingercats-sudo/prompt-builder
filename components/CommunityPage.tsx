import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Prompt } from '../types';
import {
  // Fix: Removed non-existent and unused LovableHeartIcon.
  ChevronDownIcon, CalendarIcon, GlobeIcon, CopyIcon, LovableAiIcon, CursorIcon, VercelIcon,
  SearchIcon, FilterIcon, ShoppingCartIcon, ChartBarIcon, VideoCameraIcon, ChatBubbleIcon, SparklesIcon, ReplitIcon, BoltIcon
} from './Icons';

interface CommunityPageProps {
  onNavigateToLanding: () => void;
  onSelectPrompt: (prompt: Prompt) => void;
}

const tinderPromptContent = `
\`\`\`markdown
## APPLICATION OVERVIEW
Spark5 is a mobile-first, interactive web app designed for real-time dating. It leverages a swipe-based matching system to connect users who are currently online, allowing them to engage in instant chat. The app emphasizes user verification and safety, ensuring a secure environment for all users.

## CORE FEATURES
- **User Verification**: Secure signup process via email and phone number, with verification codes sent to ensure authenticity.
- **Swipe-Based Matching**: Users can swipe right to "Spark" a match or left to pass, with profiles displaying essential information and interests.
- **Instant Chat with Spark Timer**: Upon matching, users can chat instantly, with the option to engage in a 5-minute "Spark Timer" to decide whether to keep or delete the match.
- **Profile Customization**: Users set up profiles after signup, including name, age, gender preferences, location, and interests, with a user-friendly interface.
- **Filters for Matching**: Users can apply filters for age range and country, ensuring better matches according to their preferences.
- **Safety Features**: Block/report options, harmful link filtering, and automatic content moderation to maintain a safe dating environment.

## DESIGN SPECIFICATIONS
- **Visual Style**: Minimalist with a clean, simple design that emphasizes usability. The interface includes ample white space and a minimal color palette to enhance readability.
- **Color Mode**: Light theme featuring dark text on light backgrounds, with a gradient accent using shades of pink, orange, and red.
- **Layout**:
  - Main navigation at the bottom with icons for Home, Matches, Chat, and Settings.
  - Swipe screen prominently displays user profiles in a card format, allowing for easy interaction.
  - Settings and profile editing screens feature straightforward forms and toggles for user status and account management.
- **Typography**:
  - Primary font: A modern, friendly typeface for headers (bold).
  - Body text: Clear, legible font ensuring easy readability.
  - Use of bold headers to create a visual hierarchy and guide user attention.

## TECHNICAL REQUIREMENTS
- **Framework**: React with TypeScript to ensure a robust, scalable application structure.
- **Styling**: Tailwind CSS for rapid UI development and responsive design.
- **UI Components**: Utilize shadcn/ui for customizable components that align with the app's aesthetic.
- **State Management**: Consider using Redux or Context API for managing user states and real-time chat functionality.

## IMPLEMENTATION STEPS
1.  **Setup Project**: Initialize a new React project with TypeScript and Tailwind CSS.
2.  **Design Layouts**: Create the main layout structure, including navigation and key screens (Welcome, Swipe, Matches, Chat, Settings).
3.  **Implement User Authentication**: Build the signup and login flows using email/phone verification processes, integrating backend APIs for user management.
4.  **Develop Swipe Functionality**: Create swipeable cards for user profiles, integrating animations for swiping left and right.
5.  **Chat Feature**: Implement real-time chat functionality with a Spark Timer, ensuring messages can include text, emojis, and media uploads.
6.  **Filters and Settings**: Add user preference filters for age and country and implement user status settings (Online, DND, Offline).
7.  **Safety Protocols**: Integrate safety features including blocking/reporting users, harmful content filtering, and auto-verification processes.
8.  **Testing and Launch**: Conduct thorough testing for usability, responsiveness, and security before launching the application.

## USER EXPERIENCE
Users begin their journey with a welcoming landing page that guides them through the signup process. Once verified, they create their profile by selecting interests and preferences. The swipe screen presents potential matches dynamically, allowing users to interact with intuitive gestures. Matches lead to an instant chat interface, where users can engage in conversation, supported by a timer feature to enhance decision-making. The app ensures users feel safe and empowered through robust security measures, enhancing their overall experience on Spark5.
\`\`\`
`;


const allPrompts: Prompt[] = [
    { title: 'Build a web application called Script Studio', optimizedFor: 'Lovable', timeAgo: '1h ago', Icon: LovableAiIcon, CardIcon: ShoppingCartIcon, tags: ['lovable', 'productivity', 'writing'], content: '## APPLICATION OVERVIEW\nScript Studio is a collaborative screenwriting tool...' },
    { title: 'Create a management dashboard for a SaaS product', optimizedFor: 'Cursor', timeAgo: '4h ago', Icon: CursorIcon, CardIcon: ShoppingCartIcon, tags: ['cursor', 'dashboard', 'data'], content: '## APPLICATION OVERVIEW\nAn analytics dashboard for business intelligence...' },
    { title: 'Dashboard de Performance Multicanal', optimizedFor: 'v0 (Vercel)', timeAgo: '4h ago', Icon: VercelIcon, CardIcon: ChartBarIcon, tags: ['v0', 'analytics'], content: '## APPLICATION OVERVIEW\nDashboard for multichannel performance tracking...' },
    { title: 'Crie um app de delivery de comida conectando restaurantes e clientes,...', optimizedFor: 'Replit', timeAgo: '5h ago', Icon: ReplitIcon, CardIcon: VideoCameraIcon, tags: ['replit', 'food-delivery', 'mobile'], content: '## APPLICATION OVERVIEW\nA food delivery app connecting restaurants and customers...' },
    { title: 'Um app de delivery de comida conectando restaurantes e clientes,...', optimizedFor: 'Lovable', timeAgo: '5h ago', Icon: LovableAiIcon, CardIcon: VideoCameraIcon, tags: ['lovable', 'food-delivery', 'mobile'], content: '## APPLICATION OVERVIEW\nA food delivery app connecting restaurants and customers...' },
    { title: 'DESIGN + UI SPEC (Tinder-style with)', optimizedFor: 'Bolt', timeAgo: '5h ago', Icon: BoltIcon, CardIcon: ChatBubbleIcon, tags: ['bolt', 'Enhanced', 'minimalist', 'light mode'], content: tinderPromptContent },
    { title: 'Ok je veux je veux que chaque utilisateur...', optimizedFor: 'v0 (Vercel)', timeAgo: '6h ago', Icon: VercelIcon, CardIcon: ChatBubbleIcon, tags: ['v0', 'social'], content: '## APPLICATION OVERVIEW\nA social media application...' },
    { title: 'Necesito armar un sistema para una empresa de catering llamada...', optimizedFor: 'Cursor', timeAgo: '6h ago', Icon: CursorIcon, CardIcon: ShoppingCartIcon, tags: ['cursor', 'business', 'management'], content: '## APPLICATION OVERVIEW\nA catering management system...' },
    { title: 'Crie um app que será responsável por gerar hashtags com ia para...', optimizedFor: 'Lovable', timeAgo: '7h ago', Icon: LovableAiIcon, CardIcon: ChatBubbleIcon, tags: ['lovable', 'social-media', 'ai'], content: '## APPLICATION OVERVIEW\nAn AI-powered hashtag generator...' },
    { title: 'A test automation environment for my existing DanRyanDistribution...', optimizedFor: 'Lovable', timeAgo: '7h ago', Icon: LovableAiIcon, CardIcon: ChartBarIcon, tags: ['lovable', 'testing', 'automation'], content: '## APPLICATION OVERVIEW\nA test automation environment...' },
    { title: 'Build a coin flip gambling website with', optimizedFor: 'Cursor', timeAgo: '8h ago', Icon: CursorIcon, CardIcon: ShoppingCartIcon, tags: ['cursor', 'game', 'web3'], content: '## APPLICATION OVERVIEW\nA coin flip gambling website...' },
    { title: 'Crie um aplicativo onde vai mostra que tenho 2 ingressos disponiveis...', optimizedFor: 'Lovable', timeAgo: '9h ago', Icon: LovableAiIcon, CardIcon: SparklesIcon, tags: ['lovable', 'ticketing'], content: '## APPLICATION OVERVIEW\nA ticket management application...' },
    { title: 'Generate a marketing website for a SaaS product', optimizedFor: 'v0 (Vercel)', timeAgo: '10h ago', Icon: VercelIcon, CardIcon: ShoppingCartIcon, tags: ['v0', 'marketing', 'saas'], content: '## APPLICATION OVERVIEW\nA marketing website for a SaaS product...' },
    { title: 'Build a simple blog with posts and comments', optimizedFor: 'Lovable', timeAgo: '11h ago', Icon: LovableAiIcon, CardIcon: ChatBubbleIcon, tags: ['lovable', 'blog', 'content'], content: '## APPLICATION OVERVIEW\nA simple blog with posts and comments...' },
    { title: 'Create a weather application with a 5-day forecast', optimizedFor: 'Cursor', timeAgo: '12h ago', Icon: CursorIcon, CardIcon: ChartBarIcon, tags: ['cursor', 'weather', 'api'], content: '## APPLICATION OVERVIEW\nA weather application with a 5-day forecast...' },
];


const PromptCard: React.FC<{
  prompt: Prompt;
  onSelect: () => void;
}> = ({ prompt, onSelect }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when copying
    navigator.clipboard.writeText(prompt.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={onSelect} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-lg text-left w-full">
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <prompt.CardIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 text-base leading-tight flex-1">{prompt.title}</h3>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 font-medium px-2.5 py-1 rounded-md text-xs">
            <prompt.Icon className="h-4 w-4" />
            <span>Optimized for {prompt.optimizedFor}</span>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{prompt.timeAgo}</span>
            </div>
            <div className="flex items-center gap-1">
              <GlobeIcon className="h-3 w-3" />
              <span>Public</span>
            </div>
          </div>
          <div
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Copy prompt"
            role="button"
          >
            <CopyIcon className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
    </button>
  );
};


const CommunityPage: React.FC<CommunityPageProps> = ({ onNavigateToLanding, onSelectPrompt }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All Platforms');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const platforms = ['All Platforms', 'Lovable', 'Cursor', 'v0 (Vercel)', 'Replit', 'Bolt'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredPrompts = useMemo(() => {
    return allPrompts.filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPlatform = platformFilter === 'All Platforms' || prompt.optimizedFor === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [searchQuery, platformFilter]);


  return (
    <div className="p-4 md:p-8">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-gray-900 leading-tight">Community Prompts</h1>
        <p className="mt-6 text-base md:text-lg text-gray-600">Discover and use prompts created by our community. All prompts are public and ready to use in your projects.</p>
      </div>
      
      <div className="mt-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full flex-grow">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search prompts..." 
              className="w-full pl-12 pr-4 py-3 bg-white text-base border border-gray-200/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div ref={dropdownRef} className="relative w-full md:w-auto">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full md:w-48 bg-white border border-gray-200/80 rounded-xl shadow-sm px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-5 w-5 text-gray-500" />
                  <span>{platformFilter}</span>
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 top-full mt-2 w-full bg-white border border-gray-200/80 rounded-xl shadow-lg animate-fade-in-up">
                  <div className="p-1" role="listbox">
                    {platforms.map((platform) => (
                      <button
                        key={platform}
                        onClick={() => {
                          setPlatformFilter(platform);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        role="option"
                        aria-selected={platformFilter === platform}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-gray-500 font-medium whitespace-nowrap">{filteredPrompts.length} prompts</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((p, i) => <PromptCard key={`${p.title}-${i}`} prompt={p} onSelect={() => onSelectPrompt(p)} />)}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;