import React, { useState, useCallback, useRef, useEffect } from 'react';
import { optimizePrompt } from '../services/geminiService';
import { OptimizedPromptResponse } from '../types';
import {
  WandIcon, CloseIcon, SunIcon, ZapIcon, CreditCardIcon, SparklesIcon,
  GlobeIcon, ImageIcon, RefreshIcon, PlusIcon, ChevronDownIcon,
  LovableAiIcon, CursorIcon, VercelIcon, ReplitIcon, BoltIcon, CopyIcon, CheckIcon
} from './Icons';

type CreditsState = {
  count: number;
  resetTime: number | null;
};

interface DashboardProps {
  initialPrompt: {
    text: string;
    image: { data: string; mimeType: string } | null;
  } | null;
  credits: CreditsState;
  onUseCredit: () => void;
}

const aiModels = [
    { name: 'Lovable AI', icon: LovableAiIcon },
    { name: 'Cursor AI', icon: CursorIcon },
    { name: 'v0 (Vercel)', icon: VercelIcon },
    { name: 'Replit AI', icon: ReplitIcon },
    { name: 'Bolt AI', icon: BoltIcon },
];

const Dashboard: React.FC<DashboardProps> = ({ initialPrompt, credits, onUseCredit }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizedPromptResponse | null>(null);
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [selectedModel, setSelectedModel] = useState(aiModels[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt.text);
      setImage(initialPrompt.image);
    }
  }, [initialPrompt]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to optimize.");
      return;
    }
    if (credits.count <= 0) {
      setError("You are out of credits for today. They will reset soon.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await optimizePrompt(prompt, [], image);
      setResult(response);
      onUseCredit();
    } catch (e: any)
    {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, image, credits.count, onUseCredit]);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage({ data: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCopyPrompt = useCallback(() => {
    if (result) {
        navigator.clipboard.writeText(result.prompt);
        setCopyStatus('copied');
        setTimeout(() => {
            setCopyStatus('idle');
        }, 2000);
    }
  }, [result]);

  const triggerFileInput = () => fileInputRef.current?.click();

  const removeImage = () => {
      setImage(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };
  
  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        
        <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-center text-gray-800 mb-10 md:mb-12">
                What do you want to build today?
            </h1>
            
            <div className="w-full max-w-3xl mx-auto">
                <div className="relative bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-gray-200/80">
                    <div className="absolute top-3 right-4 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <GlobeIcon className="h-4 w-4"/> Public
                    </div>
                     {image && (
                        <div className="p-5 pt-10 relative">
                            <img src={`data:${image.mimeType};base64,${image.data}`} alt="Prompt preview" className="rounded-lg max-h-48" />
                             <button onClick={removeImage} className="absolute top-2 left-2 bg-gray-700 text-white rounded-full p-1 shadow-md hover:bg-gray-900">
                                <CloseIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. Create a task management app with drag and drop functionality"
                        className="w-full h-36 p-5 pr-24 text-base text-gray-800 placeholder-gray-400 border-none resize-none focus:ring-0 bg-transparent"
                    />
                    <div className="flex items-center justify-between pt-2 pb-4 px-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500">
                           <button className="p-1.5 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors" aria-label="Upload Image" onClick={triggerFileInput}><ImageIcon className="h-5 w-5"/></button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <div ref={dropdownRef} className="relative">
                                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100">
                                    <selectedModel.icon className="h-5 w-5" />
                                    {selectedModel.name}
                                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10 animate-fade-in-up">
                                        {aiModels.map(model => (
                                            <button key={model.name} onClick={() => { setSelectedModel(model); setDropdownOpen(false); }} className="w-full flex items-center gap-3 p-3 text-sm hover:bg-gray-50 text-left">
                                                <model.icon className="h-5 w-5" />
                                                {model.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <button 
                      onClick={handleGenerate}
                      disabled={isLoading || !prompt.trim() || credits.count === 0}
                      className="bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:scale-105 enabled:hover:bg-gray-900">
                      {isLoading ? (
                      <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                      </>
                      ) : (
                      <>
                          Enhance Prompt
                          <WandIcon className="h-5 w-5" />
                      </>
                      )}
                  </button>
                </div>
            </div>

            {error && <div className="mt-6 text-red-600 bg-red-100 p-3 rounded-lg w-full max-w-3xl mx-auto">{error}</div>}

            {result && (
                <div className="mt-12 w-full max-w-3xl mx-auto space-y-8 animate-fade-in">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-purple-500" />Optimized Prompt</h3>
                        <div className="relative mt-2">
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 whitespace-pre-wrap font-mono text-sm overflow-x-auto pr-20">{result.prompt}</div>
                             <button
                                onClick={handleCopyPrompt}
                                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-all"
                            >
                                {copyStatus === 'copied' ? (
                                    <>
                                        <CheckIcon className="h-4 w-4 text-green-600" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <CopyIcon className="h-4 w-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><CreditCardIcon className="h-5 w-5 text-purple-500" />Key Suggestions</h3>
                        <ul className="mt-2 list-disc list-inside space-y-2 text-gray-600">
                        {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    </>
  );
};

export default Dashboard;