import React, { useState, useEffect } from 'react';
import { Prompt } from '../types';
import {
  CalendarIcon, GlobeIcon, CopyIcon
} from './Icons';

interface MyPromptsPageProps {
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


const MyPromptsPage: React.FC<MyPromptsPageProps> = ({ onSelectPrompt, onNavigateToCommunity }) => {
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedPrompts');
      if (saved) {
        setSavedPrompts(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to parse saved prompts from localStorage", error);
      setSavedPrompts([]);
    }
  }, []);

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
                    <p className="mt-2 text-gray-500">Explore the community to find prompts you like and save them for later.</p>
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