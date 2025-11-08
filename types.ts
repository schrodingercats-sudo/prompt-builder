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

// Supabase Data Models
export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  email_verified?: boolean;
  verification_sent_at?: string;
  subscription_status?: string;
  subscription_id?: string;
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedPrompt {
  id: string;
  user_id: string;
  title: string;
  original_prompt: string;
  optimized_prompt: string;
  suggestions: string[];
  model_used: string;
  image_data?: string;
  image_mime_type?: string;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_display_name?: string;
}

export interface CreditsState {
  id?: string;
  user_id?: string;
  count: number;
  resetTime: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface LocalStorageData {
  users: Array<{ email: string; password: string }>;
  prompts: SavedPrompt[];
  credits: CreditsState;
}
