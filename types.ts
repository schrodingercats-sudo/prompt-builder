// Fix: Add React import to resolve 'Cannot find namespace React' error.
import React from 'react';

export interface OptimizedPromptResponse {
  prompt: string;
  suggestions: string[];
}

export interface Prompt {
  title: string;
  optimizedFor: string;
  timeAgo: string;
  Icon: React.FC<{ className?: string }>;
  CardIcon: React.FC<{ className?: string }>;
  tags: string[];
  content: string;
}
