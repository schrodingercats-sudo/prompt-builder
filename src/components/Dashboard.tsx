'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { optimizePrompt } from '../services/geminiService';
import { OptimizedPromptResponse, CreditsState } from '../types';
import { databaseService } from '../services/databaseService';
import { AuthUser } from '../services/authService';
import {
  CloseIcon, ZapIcon, CreditCardIcon, SparklesIcon,
  GlobeIcon, ImageIcon, ChevronDownIcon, ArrowRightIcon,
  LovableAiIcon, CursorIcon, VercelIcon, ReplitIcon, BoltIcon, CopyIcon, CheckIcon
} from './Icons';

interface DashboardProps {
  initialPrompt: {
    text: string;
    image: { data: string; mimeType: string } | null;
  } | null;
  credits: CreditsState;
  onUseCredit: () => Promise<void>;
  currentUser: AuthUser;
}

const aiModels = [
    { name: 'Lovable AI', icon: LovableAiIcon },
    { name: 'Cursor AI', icon: CursorIcon },
    { name: 'v0 (Vercel)', icon: VercelIcon },
    { name: 'Replit AI', icon: ReplitIcon },
    { name: 'Bolt AI', icon: BoltIcon },
];

// Clarifying questions based on prompt context
const CLARIFYING_QUESTIONS = [
  {
    question: "What's the primary goal of this project?",
    options: [
      "Build a production-ready application",
      "Create a quick prototype or MVP",
      "Learning or experimentation",
      "Redesigning an existing product",
    ],
  },
  {
    question: "What tech stack do you prefer?",
    options: [
      "React + Tailwind CSS",
      "Next.js (Full-stack)",
      "Vue.js + CSS",
      "No preference — let AI decide",
    ],
  },
  {
    question: "What design style do you want?",
    options: [
      "Modern & minimal",
      "Bold & creative",
      "Corporate & professional",
      "Dark mode / glassmorphism",
    ],
  },
];

interface ClarifyingQuestionProps {
  question: typeof CLARIFYING_QUESTIONS[0];
  currentStep: number;
  totalSteps: number;
  onSelect: (answer: string) => void;
  onSkip: () => void;
  onCustomAnswer: (answer: string) => void;
}

const ClarifyingQuestion: React.FC<ClarifyingQuestionProps> = ({ question, currentStep, totalSteps, onSelect, onSkip, onCustomAnswer }) => {
  const [customText, setCustomText] = useState('');
  
  return (
    <div className="w-full max-w-3xl mx-auto mt-4 animate-fade-in">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">{question.question}</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{currentStep} of {totalSteps}</span>
            <button onClick={onSkip} className="text-xs font-medium text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-50 transition-colors">Skip</button>
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onSelect(option)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors text-left group"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center text-xs font-semibold text-gray-500 group-hover:text-purple-600">{i + 1}</span>
              {option}
            </button>
          ))}
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && customText.trim()) { onCustomAnswer(customText.trim()); setCustomText(''); } }}
              placeholder="Something else..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 bg-gray-50"
            />
            {customText.trim() && (
              <button
                onClick={() => { onCustomAnswer(customText.trim()); setCustomText(''); }}
                className="p-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ initialPrompt, credits, onUseCredit, currentUser }) => {
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

  // Clarifying questions state
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

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

  const savePromptToDatabase = useCallback(async (response: OptimizedPromptResponse) => {
    try {
      const title = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
      const isAdmin = currentUser.email === 'pratham.solanki30@gmail.com';
      const isPublic = !isAdmin;
      
      const promptData = {
        title,
        originalPrompt: prompt,
        optimizedPrompt: response.prompt,
        suggestions: response.suggestions,
        modelUsed: selectedModel.name,
        imageData: image?.data,
        imageMimeType: image?.mimeType,
        isPublic
      };

      await databaseService.savePrompt(currentUser.id, promptData);
    } catch (error) {
      console.error('Failed to save to database, using localStorage fallback');
      
      const savedPromptsKey = `savedPrompts_${currentUser.email}`;
      try {
        const existingPrompts = JSON.parse(localStorage.getItem(savedPromptsKey) || '[]');
        const newPrompt = {
          id: Date.now().toString(),
          title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
          originalPrompt: prompt,
          optimizedPrompt: response.prompt,
          suggestions: response.suggestions,
          modelUsed: selectedModel.name,
          imageData: image?.data,
          imageMimeType: image?.mimeType,
          createdAt: new Date().toISOString(),
          isPublic: currentUser.email !== 'pratham.solanki30@gmail.com'
        };
        
        existingPrompts.unshift(newPrompt);
        localStorage.setItem(savedPromptsKey, JSON.stringify(existingPrompts));
      } catch (localError) {
        console.error('Failed to save prompt to localStorage:', localError);
      }
    }
  }, [prompt, selectedModel, image, currentUser]);

  const runOptimize = useCallback(async (contextAnswers: string[]) => {
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
    setShowQuestions(false);
    try {
      const response = await optimizePrompt(prompt, contextAnswers, image);
      setResult(response);
      await onUseCredit();
      await savePromptToDatabase(response);
    } catch (e: any)
    {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, image, credits.count, onUseCredit, savePromptToDatabase]);

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to optimize.");
      return;
    }
    // Show clarifying questions
    setError(null);
    setResult(null);
    setShowQuestions(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
  }, [prompt]);

  const handleQuestionAnswer = useCallback((answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < CLARIFYING_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered — run optimization
      runOptimize(newAnswers);
    }
  }, [answers, currentQuestionIndex, runOptimize]);

  const handleSkipQuestion = useCallback(() => {
    if (currentQuestionIndex < CLARIFYING_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Skip last question — run with whatever answers we have
      runOptimize(answers);
    }
  }, [currentQuestionIndex, answers, runOptimize]);

  const handleSkipAllQuestions = useCallback(() => {
    runOptimize([]);
  }, [runOptimize]);
  
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
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
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
                            <button 
                              onClick={handleGenerate}
                              disabled={isLoading || !prompt.trim() || credits.count === 0}
                              className="bg-gray-800 text-white p-2.5 rounded-lg shadow-sm hover:bg-gray-900 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                              aria-label="Generate prompt"
                            >
                              {isLoading ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <ArrowRightIcon className="h-5 w-5" />
                              )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Clarifying questions */}
                {showQuestions && !isLoading && (
                  <div className="space-y-3">
                    <ClarifyingQuestion
                      question={CLARIFYING_QUESTIONS[currentQuestionIndex]}
                      currentStep={currentQuestionIndex + 1}
                      totalSteps={CLARIFYING_QUESTIONS.length}
                      onSelect={handleQuestionAnswer}
                      onSkip={handleSkipQuestion}
                      onCustomAnswer={handleQuestionAnswer}
                    />
                    {currentQuestionIndex === 0 && (
                      <div className="flex justify-center">
                        <button onClick={handleSkipAllQuestions} className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors">
                          Skip all questions and generate
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Loading state */}
                {isLoading && (
                  <div className="mt-8 flex flex-col items-center gap-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-medium">Optimizing your prompt...</span>
                    </div>
                  </div>
                )}
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