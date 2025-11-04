import React, { useState } from 'react';
import { Prompt } from '../types';
import {
  LovableHeartIcon, ChevronDownIcon, CopyIcon, ArrowLeftIcon, ClockIcon
} from './Icons';

interface PromptDetailPageProps {
  prompt: Prompt;
  onNavigateBack: () => void;
}

const PromptDetailPage: React.FC<PromptDetailPageProps> = ({ prompt, onNavigateBack }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy Prompt');

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy Prompt'), 2000);
  };

  return (
    <div className="min-h-screen w-full font-sans">
      <div className="relative z-10 px-6 container mx-auto">
        {/* Header */}
        <header className="py-4">
          <nav className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-3 rounded-full border border-gray-200/50 shadow-sm">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateBack(); }} className="flex items-center gap-2">
              <LovableHeartIcon className="h-8 w-8" />
              <span className="font-bold text-xl text-gray-800">Promptify</span>
            </a>
            <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigateBack(); }} className="hover:text-purple-600 transition-colors">Home</a>
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

        <main className="max-w-4xl mx-auto py-12">
            <button onClick={onNavigateBack} className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
                <ArrowLeftIcon className="w-4 h-4" />
                Back
            </button>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-between items-start">
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
                            <h1 className="text-3xl font-bold text-gray-900 mt-4">{prompt.title}</h1>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0 ml-4">
                            <ClockIcon className="w-5 h-5" />
                            <span>{prompt.timeAgo}</span>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <h2 className="text-xl font-semibold text-gray-800">Generated Prompt</h2>
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
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-orange-500 rounded-lg shadow-sm hover:bg-orange-600 transition-colors"
                >
                    <CopyIcon className="w-5 h-5" />
                    {copyButtonText}
                </button>
                <button className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                    Save to Account
                </button>
            </div>
            
            <div className="mt-12 text-center">
                 <button onClick={onNavigateBack} className="px-6 py-3 text-base font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                    Explore More Community Prompts
                </button>
            </div>
        </main>
      </div>
    </div>
  );
};

export default PromptDetailPage;
