import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Avoid crashing the whole app during import if envs are missing on Vercel.
// Provide a lazy-erroring stub so callers can catch and fall back (App already does).
const createErroringStub = () =>
  new Proxy({}, {
    get() {
      throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
  }) as any;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : createErroringStub();

// Database Types
export interface DbUser {
  id: string;
  firebase_uid: string;
  email: string;
  display_name?: string;
  email_verified?: boolean;
  verification_sent_at?: string;
  subscription_status: string;
  subscription_id?: string;
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DbPrompt {
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
}

export interface DbCredits {
  id: string;
  user_id: string;
  count: number;
  reset_time?: string;
  created_at: string;
  updated_at: string;
}