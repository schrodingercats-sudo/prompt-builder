import React, { useState, useRef, useEffect } from 'react';
import { Prompt } from '../types';
// Fix: Replace non-existent LovableHeartIcon with LovableAiIcon.
import { LogoIcon, LovableAiIcon, VercelIcon, ReplitIcon, CursorIcon, BoltIcon, ImageIcon, ArrowRightIcon, GithubIcon, GoogleIcon, GridIcon, CalendarIcon, GlobeIcon, CopyIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon, CloseIcon, HeartIcon, ShoppingCartIcon, ChartBarIcon, VideoCameraIcon, ChatBubbleIcon } from './Icons';

interface LandingPageProps {
  onAttemptStart: (promptText: string, image: { data: string; mimeType: string } | null) => void;
  onNavigateToCommunity: () => void;
  onSelectPrompt: (prompt: Prompt) => void;
}

const CommunityPromptCard: React.FC<{
  prompt: Prompt;
  onSelect: () => void;
}> = ({ prompt, onSelect }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={onSelect} className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-5 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl text-left w-full h-full">
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-purple-100 rounded-lg">
              <prompt.CardIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-800 text-lg mt-4 truncate">{prompt.title}</h3>
          <div className="mt-3 inline-flex items-center gap-2 bg-purple-100 text-purple-800 font-medium px-3 py-1.5 rounded-lg text-sm">
            <prompt.Icon className="h-5 w-5" />
            <span>Optimized for {prompt.optimizedFor}</span>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              <span>{prompt.timeAgo}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GlobeIcon className="h-4 w-4" />
              <span>Public</span>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Copy prompt"
          >
            <CopyIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </button>
  );
};

const ComparisonSlider: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const startDragging = () => { isDragging.current = true; };
  const stopDragging = () => { isDragging.current = false; };

  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);


  useEffect(() => {
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);
    return () => {
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchend', stopDragging);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto aspect-[16/10] rounded-2xl overflow-hidden cursor-e-resize select-none shadow-2xl border-4 border-white/50"
      onMouseDown={startDragging}
      onMouseMove={handleMouseMove}
      onTouchStart={startDragging}
      onTouchMove={handleTouchMove}
    >
      <img src="https://before.edgeone.app/Screenshot%202025-11-06%20175550.png" alt="Without Promptify" className="absolute inset-0 w-full h-full object-contain bg-gray-100" draggable="false" />
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
        <img src="https://after.edgeone.app/Screenshot%202025-11-06%20175607.png" alt="With Promptify" className="absolute inset-0 w-full h-full object-contain bg-gray-100" draggable="false" />
      </div>
      <div className="absolute top-0 bottom-0 bg-white w-1.5 cursor-ew-resize pointer-events-none" style={{ left: `calc(${sliderPosition}% - 3px)` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -left-5 bg-white h-12 w-12 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200">
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
        </div>
      </div>
    </div>
  );
};


const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200/80 py-6">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
        <h3 className="text-lg font-medium text-gray-800">{q}</h3>
        {isOpen ? <ChevronUpIcon className="h-6 w-6 text-purple-600" /> : <ChevronDownIcon className="h-6 w-6 text-gray-500" />}
      </button>
      {isOpen && <p className="mt-4 text-gray-600 animate-fade-in">{a}</p>}
    </div>
  );
};

const BrandCarousel: React.FC = () => {
  const logos = [
    { id: "logo-1", description: "Astro", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/astro-wordmark.svg", className: "h-7 w-auto" },
    { id: "logo-2", description: "Figma", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/figma-wordmark.svg", className: "h-7 w-auto" },
    { id: "logo-3", description: "Next.js", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/nextjs-wordmark.svg", className: "h-7 w-auto" },
    { id: "logo-4", description: "React", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/react-wordmark.svg", className: "h-7 w-auto" },
    { id: "logo-5", description: "Shadcn UI", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcn-ui-wordmark.svg", className: "h-7 w-auto" },
    { id: "logo-6", description: "Supabase", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/supabase-wordmark.svg", className: "h-7 w-auto" },
    { id: "logo-7", description: "Tailwind CSS", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/tailwind-wordmark.svg", className: "h-4 w-auto" },
    { id: "logo-8", description: "Vercel", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/vercel-wordmark.svg", className: "h-7 w-auto" },
  ];

  const duplicatedLogos = [...logos, ...logos];

  return (
    <section className="py-16 sm:py-20 md:py-24">
      <div className="container mx-auto flex flex-col items-center text-center">
        <h2 className="my-6 text-3xl font-bold text-gray-800 md:text-4xl lg:text-5xl">
          Trusted by these companies
        </h2>
      </div>
      <div className="mt-10 w-full overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-24 md:w-48 lg:w-64 xl:w-96 z-10 bg-gradient-to-r from-[#f8fafc] to-transparent pointer-events-none"></div>
        <div className="flex animate-scroll [animation-play-state:running] hover:[animation-play-state:paused]">
          {duplicatedLogos.map((logo, index) => (
            <div key={index} className="flex-shrink-0 w-52 h-16 flex items-center justify-center">
              <img
                src={logo.image}
                alt={logo.description}
                className={`${logo.className} object-contain grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100`}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 right-0 w-24 md:w-48 lg:w-64 xl:w-96 z-10 bg-gradient-to-l from-[#f8fafc] to-transparent pointer-events-none"></div>
      </div>
    </section>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onAttemptStart, onNavigateToCommunity, onSelectPrompt }) => {
  const aiModels = [
    { name: 'Lovable AI', icon: LovableAiIcon },
    { name: 'Cursor AI', icon: CursorIcon },
    { name: 'v0 (Vercel)', icon: VercelIcon },
    { name: 'Replit AI', icon: ReplitIcon },
    { name: 'Bolt AI', icon: BoltIcon },
  ];
  const [promptText, setPromptText] = useState('');
  const [selectedModel, setSelectedModel] = useState(aiModels[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<{ data: string; mimeType: string; preview: string; } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fullDataUrl = reader.result as string;
        const base64String = fullDataUrl.split(',')[1];
        setImage({ data: base64String, mimeType: file.type, preview: fullDataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleStart = () => {
    const imageData = image ? { data: image.data, mimeType: image.mimeType } : null;
    onAttemptStart(promptText, imageData);
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

  const communityPrompts: Prompt[] = [
    { title: 'Build a web application called...', optimizedFor: 'Lovable', timeAgo: '1d ago', Icon: LovableAiIcon, CardIcon: ShoppingCartIcon, tags: ['lovable', 'web app'], content: 'A placeholder for a web application prompt.' },
    { title: 'Create a management dashboard applicatio...', optimizedFor: 'Cursor', timeAgo: '1d ago', Icon: CursorIcon, CardIcon: ShoppingCartIcon, tags: ['cursor', 'dashboard'], content: 'A placeholder for a management dashboard prompt.' },
    { title: '3. Dashboard de Performance...', optimizedFor: 'v0 (Vercel)', timeAgo: '2d ago', Icon: VercelIcon, CardIcon: ChartBarIcon, tags: ['v0', 'analytics'], content: 'A placeholder for a performance dashboard prompt.' },
    { title: 'Crie um app de delivery de comida...', optimizedFor: 'Replit', timeAgo: '2d ago', Icon: ReplitIcon, CardIcon: VideoCameraIcon, tags: ['replit', 'food delivery'], content: 'A placeholder for a food delivery app prompt.' },
    { title: 'Um app de delivery de comida conectando...', optimizedFor: 'Lovable', timeAgo: '3d ago', Icon: LovableAiIcon, CardIcon: VideoCameraIcon, tags: ['lovable', 'food delivery'], content: 'A placeholder for a food delivery app prompt connecting restaurants.' },
    { title: 'DESIGN + UI SPEC (Tinder-style with...', optimizedFor: 'Bolt', timeAgo: '5h ago', Icon: BoltIcon, CardIcon: ChatBubbleIcon, tags: ['lovable', 'Enhanced', 'minimalist', 'light mode'], content: tinderPromptContent },
    { title: 'Ok je veux je veux que chaque utilisateur...', optimizedFor: 'v0 (Vercel)', timeAgo: '4d ago', Icon: VercelIcon, CardIcon: ChatBubbleIcon, tags: ['v0', 'social'], content: 'A placeholder for a user-focused application prompt.' },
    { title: 'Necesito armar un sistema para una...', optimizedFor: 'Cursor', timeAgo: '5d ago', Icon: CursorIcon, CardIcon: ShoppingCartIcon, tags: ['cursor', 'system design'], content: 'A placeholder for a system design prompt.' },
    { title: 'Crie um app que será responsável por gera...', optimizedFor: 'Lovable', timeAgo: '5d ago', Icon: LovableAiIcon, CardIcon: ChatBubbleIcon, tags: ['lovable', 'ai', 'social media'], content: 'A placeholder for a content generation app prompt.' },
  ];

  const faqs = [
    { q: 'What is Promptify?', a: 'It\'s an AI-powered tool that helps you refine and enhance your prompts to get perfect outputs from large language models, helping you build AI-driven applications faster and more effectively.' },
    { q: 'Which AI models do you support?', a: 'We support a variety of popular code-generation AI models and are constantly adding more. Our prompts are optimized to work well with models like Vercel\'s v0, Cursor, Replit, and Lovable AI.' },
    { q: 'Is there a free plan?', a: 'Yes, we offer a free plan with a limited number of credits so you can try out our prompt optimizer. For more advanced features and higher usage, you can upgrade to a paid plan.' },
    { q: 'Can I use my own API key?', a: 'Currently, the service runs through our platform. We are exploring options for users to bring their own keys in the future for specific plans.' },
  ];


  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-[#1E1E1E] font-sans">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(219,234,254,0.7) 30%, rgba(165,180,252,0.5) 60%, rgba(129,140,248,0.6) 100%), radial-gradient(circle at 20% 30%, rgba(255,255,255,0.6) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(199,210,254,0.4) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(224,231,255,0.3) 0%, transparent 60%)` }} />

      <header className="fixed top-0 left-0 right-0 z-20 py-4 px-4 sm:px-6">
        <nav className="max-w-5xl mx-auto flex items-center justify-between bg-white/50 backdrop-blur-lg p-3 rounded-full border border-white/80 shadow-sm">
          <a href="#" className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8" />
            <span className="font-bold text-xl text-gray-800">Promptify</span>
          </a>
          <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
            <a href="#home" className="hover:text-purple-600 transition-colors">Home</a>
            <a href="#how-it-works" className="hover:text-purple-600 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-purple-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-purple-600 transition-colors">FAQ's</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onAttemptStart('', null)} className="bg-gray-800 text-white font-semibold px-4 py-2 rounded-full shadow-md hover:bg-gray-900 transition-all transform hover:scale-105">Sign In</button>
          </div>
        </nav>
      </header>

      <div className="relative z-10 px-4 sm:px-6 container mx-auto">
        <main>
          {/* Hero Section */}
          <section id="home" className="text-center flex flex-col items-center justify-center min-h-screen pt-28">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-serif text-gray-900 leading-tight">Build faster with us.</h1>
            <p className="mt-6 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">Turn simple ideas into detailed specifications effortlessly. Stop guessing, start building.</p>

            <div className="mt-12 w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200/50 p-4">
              <div className="relative">
                {image?.preview && (
                  <div className="relative mb-2">
                    <img src={image.preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                    <button onClick={removeImage} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 shadow-md hover:bg-gray-900">
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="e.g., A modern dashboard with charts and a data table"
                  className="w-full h-28 p-4 text-base text-gray-800 placeholder-gray-400 border-none resize-none focus:ring-0 bg-transparent"
                />
              </div>
              <div className="flex items-center pt-2 border-t border-gray-100">
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                  <button onClick={triggerFileSelect} className="p-2 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors" aria-label="Upload image">
                    <ImageIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <div ref={dropdownRef} className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
                      <selectedModel.icon className="h-5 w-5" />
                      {selectedModel.name}
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border animate-fade-in-up z-20">
                        {aiModels.map(model => (
                          <button key={model.name} onClick={() => { setSelectedModel(model); setDropdownOpen(false); }} className="w-full flex items-center gap-3 p-3 text-sm hover:bg-gray-50">
                            <model.icon className="h-5 w-5" />
                            {model.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={handleStart} className="bg-gray-800 text-white p-2.5 rounded-lg shadow-sm hover:bg-gray-900 transition-transform transform hover:scale-105" aria-label="Generate prompt">
                    <ArrowRightIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <BrandCarousel />

          {/* Community Section */}
          <section id="community" className="py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <span className="bg-gray-100 text-gray-600 font-medium px-4 py-1.5 rounded-full text-sm">Community</span>
                <h2 className="text-3xl md:text-5xl font-bold font-serif text-gray-900 mt-4">Discover prompts created by our community</h2>
              </div>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {communityPrompts.map((p, i) => <CommunityPromptCard key={`${p.title}-${i}`} prompt={p} onSelect={() => onSelectPrompt(p)} />)}
              </div>
              <div className="mt-12 text-center">
                <button onClick={onNavigateToCommunity} className="font-semibold text-gray-800 hover:text-purple-600 transition-colors inline-flex items-center gap-2 group">
                  View All Community Prompts
                  <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="py-24 bg-white/50 backdrop-blur-lg rounded-3xl my-12">
            <div className="text-center px-4">
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-gray-900">How it works</h2>
              <p className="mt-4 text-base md:text-lg text-gray-600">A simple, three-step process to perfection.</p>
            </div>
            <div className="mt-16 grid md:grid-cols-3 gap-8 text-center max-w-6xl mx-auto px-4">
              <div className="p-6">
                <div className="flex items-center justify-center h-16 w-16 bg-purple-100 text-purple-600 rounded-2xl text-2xl font-bold mx-auto">1</div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">Generate prompt</h3>
                <p className="mt-2 text-gray-600">Enter a brief description of the app you want to build and get an optimized prompt.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center h-16 w-16 bg-purple-100 text-purple-600 rounded-2xl text-2xl font-bold mx-auto">2</div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">Copy and paste</h3>
                <p className="mt-2 text-gray-600">Copy the generated prompt, review (and edit it if needed), then use it in your chosen platform.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center h-16 w-16 bg-purple-100 text-purple-600 rounded-2xl text-2xl font-bold mx-auto">3</div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">Get additional features</h3>
                <p className="mt-2 text-gray-600">Get smart suggestions for new features and start implementing them in your platform.</p>
              </div>
            </div>
          </section>

          {/* Comparison */}
          <section className="py-24 px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-gray-900">Without vs. With our tool</h2>
              <p className="mt-4 text-base md:text-lg text-gray-600 max-w-3xl mx-auto">Same idea, two very different results. Compare an app built with a raw prompt vs. one optimized by Promptify. Drag the slider to see the transformation.</p>
            </div>
            <div className="mt-12">
              <ComparisonSlider />
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="py-24 px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-gray-900">Pricing</h2>
              <p className="mt-4 text-base md:text-lg text-gray-600">Choose the plan that's right for you.</p>
            </div>
            <div className="mt-16 max-w-4xl mx-auto grid md:grid-cols-2 gap-y-10 md:gap-8 items-center">
              <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold">Free</h3>
                <p className="mt-2 text-gray-600">For trying out the basics</p>
                <p className="mt-8 text-5xl font-extrabold">$0 <span className="text-xl font-medium text-gray-500">/ month</span></p>
                <ul className="mt-8 space-y-4 text-gray-700">
                  <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-purple-500" /> 5 prompts / month</li>
                  <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-purple-500" /> Standard optimization</li>
                  <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-purple-500" /> Public prompts only</li>
                </ul>
                <button onClick={() => onAttemptStart('', null)} className="mt-8 w-full bg-white text-gray-800 font-semibold py-3 rounded-lg shadow-md border border-gray-200/80 hover:bg-gray-50">Get started</button>
              </div>
              <div className="bg-gray-800 text-white border-purple-400 border-2 rounded-2xl p-8 shadow-2xl md:scale-105">
                <p className="text-center font-semibold bg-purple-500 text-white py-1 px-3 rounded-full w-fit mx-auto text-sm">Most Popular</p>
                <h3 className="text-2xl font-bold mt-4">Pro</h3>
                <p className="mt-2 text-gray-300">For serious builders</p>
                <p className="mt-8 text-5xl font-extrabold">$29 <span className="text-xl font-medium text-gray-400">/ month</span></p>
                <ul className="mt-8 space-y-4 text-gray-200">
                  <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-purple-400" /> 100 prompts / month</li>
                  <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-purple-400" /> Advanced optimization</li>
                  <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-purple-400" /> Private prompts</li>
                  <li className="flex items-center gap-3"><CheckIcon className="h-6 w-6 text-purple-400" /> Priority support</li>
                </ul>
                <button onClick={() => onAttemptStart('', null)} className="mt-8 w-full bg-purple-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-purple-700">Go Pro</button>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="py-24 max-w-3xl mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="mt-12">
              {faqs.map(faq => <FAQItem key={faq.q} {...faq} />)}
            </div>
          </section>
        </main>

        <footer className="py-12 border-t border-gray-200/50 mt-16 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <a href="#" className="flex items-center gap-2">
              <LogoIcon className="h-8 w-8" />
              <span className="font-bold text-xl text-gray-800">Promptify</span>
            </a>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 font-medium text-gray-600">
              <a href="#how-it-works" className="hover:text-purple-600">How it works</a>
              <a href="#pricing" className="hover:text-purple-600">Pricing</a>
              <a href="#faq" className="hover:text-purple-600">FAQ's</a>
            </div>
            <p className="text-gray-500 text-center sm:text-left">&copy; 2024 Promptify. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;