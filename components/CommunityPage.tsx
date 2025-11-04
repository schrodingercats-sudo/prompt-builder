import React, { useState } from 'react';
import { Prompt } from '../types';
import {
  LovableHeartIcon, ChevronDownIcon, CalendarIcon, GlobeIcon, CopyIcon, LovableAiIcon,
  SearchIcon, FilterIcon, ShoppingCartIcon, ChartBarIcon, VideoCameraIcon, ChatBubbleIcon, SparklesIcon
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
    { title: 'Create a management dashboard application that', optimizedFor: 'Lovable', timeAgo: '4h ago', Icon: LovableAiIcon, CardIcon: ShoppingCartIcon, tags: ['lovable', 'dashboard', 'data'], content: '## APPLICATION OVERVIEW\nAn analytics dashboard for business intelligence...' },
    { title: '3. Dashboard de Performance Multicanal', optimizedFor: 'Lovable', timeAgo: '4h ago', Icon: LovableAiIcon, CardIcon: ChartBarIcon, tags: ['lovable', 'analytics'], content: '## APPLICATION OVERVIEW\nDashboard for multichannel performance tracking...' },
    { title: 'Crie um app de delivery de comida conectando restaurantes e clientes,...', optimizedFor: 'Lovable', timeAgo: '5h ago', Icon: LovableAiIcon, CardIcon: VideoCameraIcon, tags: ['lovable', 'food-delivery', 'mobile'], content: '## APPLICATION OVERVIEW\nA food delivery app connecting restaurants and customers...' },
    { title: 'Um app de delivery de comida conectando restaurantes e clientes,...', optimizedFor: 'Lovable', timeAgo: '5h ago', Icon: LovableAiIcon, CardIcon: VideoCameraIcon, tags: ['lovable', 'food-delivery', 'mobile'], content: '## APPLICATION OVERVIEW\nA food delivery app connecting restaurants and customers...' },
    { title: 'DESIGN + UI SPEC (Tinder-style with', optimizedFor: 'Lovable', timeAgo: '5h ago', Icon: LovableAiIcon, CardIcon: ChatBubbleIcon, tags: ['lovable', 'Enhanced', 'minimalist', 'light mode'], content: tinderPromptContent },
    { title: 'Ok je veux je veux que chaque utilisateur...', optimizedFor: 'Lovable', timeAgo: '6h ago', Icon: LovableAiIcon, CardIcon: ChatBubbleIcon, tags: ['lovable', 'social'], content: '## APPLICATION OVERVIEW\nA social media application...' },
    { title: 'Necesito armar un sistema para una empresa de catering llamada...', optimizedFor: 'Lovable', timeAgo: '6h ago', Icon: LovableAiIcon, CardIcon: ShoppingCartIcon, tags: ['lovable', 'business', 'management'], content: '## APPLICATION OVERVIEW\nA catering management system...' },
    { title: 'Crie um app que será responsável por gerar hashtags com ia para...', optimizedFor: 'Lovable', timeAgo: '7h ago', Icon: LovableAiIcon, CardIcon: ChatBubbleIcon, tags: ['lovable', 'social-media', 'ai'], content: '## APPLICATION OVERVIEW\nAn AI-powered hashtag generator...' },
    { title: 'A test automation environment for my existing DanRyanDistribution...', optimizedFor: 'Lovable', timeAgo: '7h ago', Icon: LovableAiIcon, CardIcon: ChartBarIcon, tags: ['lovable', 'testing', 'automation'], content: '## APPLICATION OVERVIEW\nA test automation environment...' },
    { title: 'Build a coin flip gambling website with', optimizedFor: 'Lovable', timeAgo: '8h ago', Icon: LovableAiIcon, CardIcon: ShoppingCartIcon, tags: ['lovable', 'game', 'web3'], content: '## APPLICATION OVERVIEW\nA coin flip gambling website...' },
    { title: 'Crie um aplicativo onde vai mostra que tenho 2 ingressos disponiveis...', optimizedFor: 'Lovable', timeAgo: '9h ago', Icon: LovableAiIcon, CardIcon: SparklesIcon, tags: ['lovable', 'ticketing'], content: '## APPLICATION OVERVIEW\nA ticket management application...' },
    { title: 'Generate a marketing website for a SaaS product', optimizedFor: 'Lovable', timeAgo: '10h ago', Icon: LovableAiIcon, CardIcon: ShoppingCartIcon, tags: ['lovable', 'marketing', 'saas'], content: '## APPLICATION OVERVIEW\nA marketing website for a SaaS product...' },
    { title: 'Build a simple blog with posts and comments', optimizedFor: 'Lovable', timeAgo: '11h ago', Icon: LovableAiIcon, CardIcon: ChatBubbleIcon, tags: ['lovable', 'blog', 'content'], content: '## APPLICATION OVERVIEW\nA simple blog with posts and comments...' },
    { title: 'Create a weather application with a 5-day forecast', optimizedFor: 'Lovable', timeAgo: '12h ago', Icon: LovableAiIcon, CardIcon: ChartBarIcon, tags: ['lovable', 'weather', 'api'], content: '## APPLICATION OVERVIEW\nA weather application with a 5-day forecast...' },
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
  const [currentPage, setCurrentPage] = useState(1);
  const promptsPerPage = 12;
  const totalPages = Math.ceil(allPrompts.length / promptsPerPage);
  
  const currentPrompts = allPrompts.slice(
    (currentPage - 1) * promptsPerPage,
    currentPage * promptsPerPage
  );

  return (
    <div className="min-h-screen w-full font-sans">
      <div className="relative z-10 px-6 container mx-auto">
        <header className="py-4">
          <nav className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-3 rounded-full border border-gray-200/50 shadow-sm">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLanding(); }} className="flex items-center gap-2">
              <LovableHeartIcon className="h-8 w-8" />
              <span className="font-bold text-xl text-gray-800">Promptify</span>
            </a>
            <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLanding(); }} className="hover:text-purple-600 transition-colors">Home</a>
              <a href="#" className="hover:text-purple-600 transition-colors">How it works</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Pricing</a>
              <a href="#" className="hover:text-purple-600 transition-colors">FAQ's</a>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 p-1.5 pr-3 bg-white border border-gray-200/80 rounded-full shadow-sm">
                <img src="https://i.pravatar.cc/40?u=pratham.solanki30" alt="User" className="h-8 w-8 rounded-full" />
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </nav>
        </header>

        <main className="py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold font-serif text-gray-900 leading-tight">Discover and use prompts created by our community</h1>
            <p className="mt-6 text-lg text-gray-600">All prompts are public and ready to use in your projects.</p>
          </div>
          
          <div className="mt-12 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full flex-grow">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Search prompts..." className="w-full pl-12 pr-4 py-3 bg-white text-base border border-gray-200/80 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none" />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button className="p-3 bg-white border border-gray-200/80 rounded-xl shadow-sm">
                  <FilterIcon className="h-5 w-5 text-gray-500" />
                </button>
                <div className="relative flex-grow">
                   <select className="w-full appearance-none bg-white border border-gray-200/80 rounded-xl shadow-sm px-4 py-3 pr-10 text-base font-medium text-gray-700 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none">
                     <option>All Platforms</option>
                     <option>Lovable</option>
                     <option>Cursor</option>
                     <option>Vercel v0</option>
                   </select>
                   <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                </div>
                 <span className="text-gray-500 font-medium whitespace-nowrap">{allPrompts.length} prompts</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentPrompts.map((p, i) => <PromptCard key={`${p.title}-${i}`} prompt={p} onSelect={() => onSelectPrompt(p)} />)}
            </div>
            
            <div className="mt-12 flex justify-center items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                    <button 
                      key={pageNumber} 
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-10 h-10 text-sm font-medium rounded-md ${currentPage === pageNumber ? 'bg-orange-500 text-white shadow-md' : 'bg-white border border-gray-300'}`}
                    >
                        {pageNumber}
                    </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm disabled:opacity-50"
                >
                  Next
                </button>
            </div>
          </div>
        </main>
      </div>
      <footer className="py-8 mt-16 border-t border-gray-200/80">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>Built with <span className="text-red-500">♡</span>, flow, and a lot of vibecoding by David Martín Suárez</p>
            <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLanding(); }} className="hover:text-gray-900">Home</a>
                <a href="#" className="hover:text-gray-900">Terms & Privacy</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default CommunityPage;