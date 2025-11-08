import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Prompt, SavedPrompt } from '../types';
import { databaseService } from '../services/databaseService';
import {
  ChevronDownIcon, CalendarIcon, GlobeIcon, CopyIcon, LovableAiIcon, CursorIcon, VercelIcon,
  SearchIcon, FilterIcon, ShoppingCartIcon, ChartBarIcon, VideoCameraIcon, ChatBubbleIcon, SparklesIcon, ReplitIcon, BoltIcon, WandIcon
} from './Icons';

interface CommunityPageProps {
  onNavigateToLanding: () => void;
  onSelectPrompt: (prompt: Prompt) => void;
}

// Helper function to get AI model icon
const getModelIcon = (modelName: string) => {
  const modelIconMap: Record<string, React.FC<{ className?: string }>> = {
    'Lovable AI': LovableAiIcon,
    'Cursor AI': CursorIcon,
    'v0 (Vercel)': VercelIcon,
    'Replit AI': ReplitIcon,
    'Bolt AI': BoltIcon,
  };
  return modelIconMap[modelName] || WandIcon;
};

// Helper function to get content icon based on prompt content
const getContentIcon = (title: string, content: string) => {
  const text = (title + ' ' + content).toLowerCase();
  
  if (text.includes('shop') || text.includes('ecommerce') || text.includes('store') || text.includes('cart')) {
    return ShoppingCartIcon;
  }
  if (text.includes('dashboard') || text.includes('analytics') || text.includes('chart')) {
    return ChartBarIcon;
  }
  if (text.includes('video') || text.includes('media') || text.includes('stream')) {
    return VideoCameraIcon;
  }
  if (text.includes('chat') || text.includes('message') || text.includes('social')) {
    return ChatBubbleIcon;
  }
  return SparklesIcon;
};

// Convert SavedPrompt from database to Prompt format for display
const convertToPrompt = (savedPrompt: SavedPrompt): Prompt => {
  const timeAgo = new Date(savedPrompt.created_at).toLocaleDateString();
  const modelIcon = getModelIcon(savedPrompt.model_used);
  const contentIcon = getContentIcon(savedPrompt.title, savedPrompt.original_prompt);
  
  return {
    title: savedPrompt.title,
    optimizedFor: savedPrompt.model_used,
    timeAgo,
    Icon: modelIcon,
    CardIcon: contentIcon,
    tags: savedPrompt.suggestions.slice(0, 3),
    content: savedPrompt.optimized_prompt
  };
};


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
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const platforms = ['All Platforms', 'Lovable AI', 'Cursor AI', 'v0 (Vercel)', 'Replit AI', 'Bolt AI'];

  // Load public prompts from database
  useEffect(() => {
    const loadPublicPrompts = async () => {
      setIsLoading(true);
      try {
        const publicPrompts = await databaseService.getPublicPrompts(50);
        const convertedPrompts = publicPrompts.map(convertToPrompt);
        setPrompts(convertedPrompts);
      } catch (error) {
        console.error('Failed to load public prompts:', error);
        // Show empty state if database fails
        setPrompts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicPrompts();
  }, []);

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
    return prompts.filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPlatform = platformFilter === 'All Platforms' || prompt.optimizedFor === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [prompts, searchQuery, platformFilter]);


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

        {isLoading ? (
          <div className="mt-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredPrompts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((p, i) => <PromptCard key={`${p.title}-${i}`} prompt={p} onSelect={() => onSelectPrompt(p)} />)}
          </div>
        ) : (
          <div className="mt-12 text-center py-16 px-6 bg-white rounded-2xl border border-gray-200/80">
            <GlobeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">No public prompts yet</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery || platformFilter !== 'All Platforms' 
                ? 'Try adjusting your search or filters.' 
                : 'Be the first to create and share a prompt with the community!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;