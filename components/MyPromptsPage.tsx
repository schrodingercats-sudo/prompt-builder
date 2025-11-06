import React, { useState, useEffect } from 'react';
import { Prompt, SavedPrompt } from '../types';
import { databaseService } from '../services/databaseService';
import { AuthUser } from '../services/authService';
import {
  CalendarIcon, GlobeIcon, CopyIcon, WandIcon,
  LovableAiIcon, CursorIcon, VercelIcon, ReplitIcon, BoltIcon,
  CreditCardIcon, SparklesIcon, HomeIcon, SunIcon, ZapIcon
} from './Icons';

interface MyPromptsPageProps {
  currentUser: AuthUser;
  onSelectPrompt: (prompt: Prompt) => void;
  onNavigateToCommunity: () => void;
}

// NOTE: This PromptCard component is duplicated from CommunityPage.tsx to keep changes minimal.
// In a larger application, this would be a shared component.
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
    <button onClick={onSelect} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-lg text-left w-full h-full flex flex-col">
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
    </button>
  );
};


const MyPromptsPage: React.FC<MyPromptsPageProps> = ({ currentUser, onSelectPrompt, onNavigateToCommunity }) => {
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Map model names to their corresponding icons (for "Optimized for" badge)
  const getModelIcon = (modelName: string) => {
    const modelIconMap: Record<string, React.FC<{ className?: string }>> = {
      'Lovable AI': LovableAiIcon,
      'Cursor AI': CursorIcon,
      'v0 (Vercel)': VercelIcon,
      'Replit AI': ReplitIcon,
      'Bolt AI': BoltIcon,
    };
    
    return modelIconMap[modelName] || WandIcon; // Default to WandIcon if model not found
  };

  // Intelligently detect app type from prompt content and assign appropriate icon
  const getContentIcon = (title: string, content: string) => {
    const text = (title + ' ' + content).toLowerCase();
    
    // E-commerce / Shopping
    if (text.includes('shop') || text.includes('ecommerce') || text.includes('store') || 
        text.includes('cart') || text.includes('buy') || text.includes('sell') || 
        text.includes('product') || text.includes('marketplace')) {
      return CreditCardIcon;
    }
    
    // SaaS / Business
    if (text.includes('saas') || text.includes('dashboard') || text.includes('analytics') || 
        text.includes('management') || text.includes('business') || text.includes('crm')) {
      return SparklesIcon;
    }
    
    // Home / Real Estate
    if (text.includes('home') || text.includes('house') || text.includes('real estate') || 
        text.includes('property') || text.includes('apartment')) {
      return HomeIcon;
    }
    
    // Health / Fitness / Wellness
    if (text.includes('health') || text.includes('fitness') || text.includes('wellness') || 
        text.includes('medical') || text.includes('doctor') || text.includes('exercise')) {
      return SunIcon;
    }
    
    // Tech / Development / AI
    if (text.includes('ai') || text.includes('tech') || text.includes('code') || 
        text.includes('developer') || text.includes('api') || text.includes('software')) {
      return ZapIcon;
    }
    
    // Garden / Nature / Environment
    if (text.includes('garden') || text.includes('plant') || text.includes('nature') || 
        text.includes('environment') || text.includes('green') || text.includes('eco')) {
      return SunIcon; // Using SunIcon for nature/garden themes
    }
    
    // Default for other content
    return WandIcon;
  };

  // Convert SavedPrompt to Prompt format for display
  const convertSavedPromptToPrompt = (savedPrompt: SavedPrompt): Prompt => {
    const timeAgo = new Date(savedPrompt.created_at).toLocaleDateString();
    const modelIcon = getModelIcon(savedPrompt.model_used); // For "Optimized for" badge
    const contentIcon = getContentIcon(savedPrompt.title, savedPrompt.original_prompt); // For title/card
    
    return {
      title: savedPrompt.title,
      optimizedFor: savedPrompt.model_used,
      timeAgo,
      Icon: modelIcon, // AI model icon for "Optimized for" badge
      CardIcon: contentIcon, // Content-based icon for the card title
      tags: savedPrompt.suggestions.slice(0, 3), // Use first 3 suggestions as tags
      content: savedPrompt.optimized_prompt
    };
  };

  useEffect(() => {
    const loadPrompts = async () => {
      try {
        setIsLoading(true);
        
        // Try to load from database first
        const userPrompts = await databaseService.getUserPrompts(currentUser.id);
        const convertedPrompts = userPrompts.map(convertSavedPromptToPrompt);
        setSavedPrompts(convertedPrompts);
      } catch (error) {
        console.error("Failed to load from database, trying localStorage fallback");
        
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem(`savedPrompts_${currentUser.email}`);
          if (saved) {
            const localPrompts = JSON.parse(saved);
            // Convert localStorage format to Prompt format
            const convertedPrompts = localPrompts.map((p: any) => {
              const modelName = p.modelUsed || 'AI';
              const modelIcon = getModelIcon(modelName); // For "Optimized for" badge
              const contentIcon = getContentIcon(p.title || '', p.originalPrompt || p.content || ''); // For title/card
              
              return {
                title: p.title || 'Untitled Prompt',
                optimizedFor: modelName,
                timeAgo: new Date(p.createdAt || Date.now()).toLocaleDateString(),
                Icon: modelIcon, // AI model icon for "Optimized for" badge
                CardIcon: contentIcon, // Content-based icon for the card title
                tags: p.suggestions?.slice(0, 3) || [],
                content: p.optimizedPrompt || p.content || ''
              };
            });
            setSavedPrompts(convertedPrompts);
          }
        } catch (localError) {
          console.error("Failed to parse saved prompts from localStorage", localError);
          setSavedPrompts([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPrompts();
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-gray-900 leading-tight">My Prompts</h1>
          <p className="mt-6 text-base md:text-lg text-gray-600">Loading your saved prompts...</p>
        </div>
        <div className="mt-12 max-w-7xl mx-auto flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
        <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-gray-900 leading-tight">My Prompts</h1>
            <p className="mt-6 text-base md:text-lg text-gray-600">Here are the prompts you've saved. Use them anytime to kickstart your next project.</p>
        </div>
        
        <div className="mt-12 max-w-7xl mx-auto">
            {savedPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedPrompts.map((p, i) => <PromptCard key={`${p.title}-${i}`} prompt={p} onSelect={() => onSelectPrompt(p)} />)}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white rounded-2xl border border-gray-200/80">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">No saved prompts yet</h3>
                    <p className="mt-2 text-gray-500">Generate some prompts to see them here, or explore the community to find prompts you like.</p>
                    <button 
                        onClick={onNavigateToCommunity} 
                        className="mt-6 bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-gray-900 transition-colors"
                    >
                        Explore Community
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default MyPromptsPage;