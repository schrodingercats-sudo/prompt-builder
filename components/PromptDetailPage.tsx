import React, { useState, useEffect } from 'react';
import { Prompt } from '../types';
import {
  // Fix: Removed non-existent and unused LovableHeartIcon.
  ChevronDownIcon, CopyIcon, ArrowLeftIcon, ClockIcon, CheckIcon
} from './Icons';

interface PromptDetailPageProps {
  prompt: Prompt;
  onNavigateBack: () => void;
}

const PromptDetailPage: React.FC<PromptDetailPageProps> = ({ prompt, onNavigateBack }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy Prompt');
  const [isSaved, setIsSaved] = useState(false);

  // Function to safely retrieve prompts from localStorage
  const getSavedPrompts = (): Prompt[] => {
    try {
      const saved = localStorage.getItem('savedPrompts');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse saved prompts:", error);
      return [];
    }
  };

  // Check if the prompt is already saved when the component mounts
  useEffect(() => {
    const savedPrompts = getSavedPrompts();
    // Use title as a simple unique identifier
    const alreadySaved = savedPrompts.some(p => p.title === prompt.title);
    if (alreadySaved) {
      setIsSaved(true);
    }
  }, [prompt.title]);


  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content.replace(/```markdown|```/g, '').trim());
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy Prompt'), 2000);
  };

  const handleSave = () => {
    if (isSaved) return;

    const savedPrompts = getSavedPrompts();
    const newSavedPrompts = [...savedPrompts, prompt];
    localStorage.setItem('savedPrompts', JSON.stringify(newSavedPrompts));
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <button onClick={onNavigateBack} className="inline-flex items-center gap-2 px-4 py-2 mb-4 md:mb-8 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Community
        </button>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            {prompt.tags.map(tag => (
                                <span key={tag} className={`capitalize text-xs font-medium px-2.5 py-1 rounded-md ${
                                    tag === 'lovable' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4">{prompt.title}</h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0 sm:ml-4">
                        <ClockIcon className="w-5 h-5" />
                        <span>{prompt.timeAgo}</span>
                    </div>
                </div>
            </div>

            <div className="px-6 md:px-8 pb-6 md:pb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Generated Prompt</h2>
                <div className="mt-4 bg-gray-50 border border-gray-200/80 rounded-xl p-4 max-h-[60vh] overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {/* We remove the ```markdown and ``` from the string before rendering */}
                        <code>{prompt.content.replace(/```markdown|```/g, '').trim()}</code>
                    </pre>
                </div>
            </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
                onClick={handleCopy}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white rounded-lg shadow-sm transition-colors ${
                  copyButtonText === 'Copied!' ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'
                }`}
            >
                {copyButtonText === 'Copied!' ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                {copyButtonText}
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaved}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {isSaved ? (
                <>
                  <CheckIcon className="w-5 h-5 text-green-600" />
                  Saved!
                </>
              ) : 'Save to Account' }
            </button>
        </div>
        
        <div className="mt-12 text-center">
              <button onClick={onNavigateBack} className="px-6 py-3 text-base font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                Explore More Community Prompts
            </button>
        </div>
    </div>
  );
};

export default PromptDetailPage;