import { supabase, DbUser, DbPrompt, DbCredits } from './supabaseClient';
import { AuthUser } from './authService';
import { CreditsState, SavedPrompt } from '../types';

export class DatabaseService {
  // User Management
  async createUserProfile(user: AuthUser): Promise<DbUser> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        firebase_uid: user.id,
        email: user.email,
        display_name: user.displayName
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message} (Code: ${error.code})`);
    }

    return data;
  }

  async getUserProfile(firebaseUid: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return null;
      }
      throw new Error(`Failed to get user profile: ${error.message} (Code: ${error.code})`);
    }

    return data;
  }

  async getOrCreateUserProfile(user: AuthUser): Promise<DbUser> {
    let profile = await this.getUserProfile(user.id);
    
    if (!profile) {
      profile = await this.createUserProfile(user);
    }

    return profile;
  }

  // Credits Management
  async getUserCredits(firebaseUid: string): Promise<CreditsState> {
    const profile = await this.getUserProfile(firebaseUid);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const { data, error } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', profile.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Credits record not found, create default
        return await this.createDefaultCredits(profile.id);
      }
      throw new Error(`Failed to get user credits: ${error.message}`);
    }

    return {
      id: data.id,
      user_id: data.user_id,
      count: data.count,
      resetTime: data.reset_time ? new Date(data.reset_time).getTime() : null,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  async createDefaultCredits(userId: string): Promise<CreditsState> {
    const { data, error } = await supabase
      .from('credits')
      .insert({
        user_id: userId,
        count: 2,
        reset_time: null
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create default credits: ${error.message}`);
    }

    return {
      id: data.id,
      user_id: data.user_id,
      count: data.count,
      resetTime: null,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  async updateCredits(firebaseUid: string, credits: CreditsState): Promise<CreditsState> {
    const profile = await this.getUserProfile(firebaseUid);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const { data, error } = await supabase
      .from('credits')
      .update({
        count: credits.count,
        reset_time: credits.resetTime ? new Date(credits.resetTime).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update credits: ${error.message}`);
    }

    return {
      id: data.id,
      user_id: data.user_id,
      count: data.count,
      resetTime: data.reset_time ? new Date(data.reset_time).getTime() : null,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  async useCredit(firebaseUid: string): Promise<CreditsState> {
    const currentCredits = await this.getUserCredits(firebaseUid);
    
    if (currentCredits.count <= 0) {
      throw new Error('No credits available');
    }

    const newCount = currentCredits.count - 1;
    const newResetTime = newCount === 0 && !currentCredits.resetTime 
      ? Date.now() + 24 * 60 * 60 * 1000 
      : currentCredits.resetTime;

    return await this.updateCredits(firebaseUid, {
      ...currentCredits,
      count: newCount,
      resetTime: newResetTime
    });
  }

  // Prompts Management
  async savePrompt(firebaseUid: string, prompt: {
    title: string;
    originalPrompt: string;
    optimizedPrompt: string;
    suggestions: string[];
    modelUsed: string;
    imageData?: string;
    imageMimeType?: string;
    isPublic?: boolean;
  }): Promise<SavedPrompt> {
    const profile = await this.getOrCreateUserProfile({ id: firebaseUid, email: '', displayName: '' });

    const { data, error } = await supabase
      .from('prompts')
      .insert({
        user_id: profile.id,
        title: prompt.title,
        original_prompt: prompt.originalPrompt,
        optimized_prompt: prompt.optimizedPrompt,
        suggestions: prompt.suggestions,
        model_used: prompt.modelUsed,
        image_data: prompt.imageData,
        image_mime_type: prompt.imageMimeType,
        is_public: prompt.isPublic || false
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save prompt: ${error.message}`);
    }

    return {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      original_prompt: data.original_prompt,
      optimized_prompt: data.optimized_prompt,
      suggestions: data.suggestions,
      model_used: data.model_used,
      image_data: data.image_data,
      image_mime_type: data.image_mime_type,
      is_public: data.is_public,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  async getUserPrompts(firebaseUid: string): Promise<SavedPrompt[]> {
    const profile = await this.getUserProfile(firebaseUid);
    if (!profile) {
      return [];
    }

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user prompts: ${error.message}`);
    }

    return data.map(prompt => ({
      id: prompt.id,
      user_id: prompt.user_id,
      title: prompt.title,
      original_prompt: prompt.original_prompt,
      optimized_prompt: prompt.optimized_prompt,
      suggestions: prompt.suggestions,
      model_used: prompt.model_used,
      image_data: prompt.image_data,
      image_mime_type: prompt.image_mime_type,
      is_public: prompt.is_public,
      created_at: prompt.created_at,
      updated_at: prompt.updated_at
    }));
  }

  async deletePrompt(promptId: string): Promise<void> {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId);

    if (error) {
      throw new Error(`Failed to delete prompt: ${error.message}`);
    }
  }

  async getPublicPrompts(limit: number = 50): Promise<SavedPrompt[]> {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        users!inner(email, display_name)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get public prompts: ${error.message}`);
    }

    return data.map(prompt => ({
      id: prompt.id,
      user_id: prompt.user_id,
      title: prompt.title,
      original_prompt: prompt.original_prompt,
      optimized_prompt: prompt.optimized_prompt,
      suggestions: prompt.suggestions,
      model_used: prompt.model_used,
      image_data: prompt.image_data,
      image_mime_type: prompt.image_mime_type,
      is_public: prompt.is_public,
      created_at: prompt.created_at,
      updated_at: prompt.updated_at,
      // Add user info for community display
      user_email: prompt.users.email,
      user_display_name: prompt.users.display_name
    }));
  }

  // Subscription Management
  async updateUserSubscription(firebaseUid: string, subscriptionData: {
    subscription_status: string;
    subscription_id: string;
    subscription_expires_at: string;
  }): Promise<void> {
    const profile = await this.getUserProfile(firebaseUid);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: subscriptionData.subscription_status,
        subscription_id: subscriptionData.subscription_id,
        subscription_expires_at: subscriptionData.subscription_expires_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  async getUserSubscriptionStatus(firebaseUid: string): Promise<{
    status: string;
    expiresAt: string | null;
  }> {
    const profile = await this.getUserProfile(firebaseUid);
    if (!profile) {
      return { status: 'free', expiresAt: null };
    }

    return {
      status: profile.subscription_status || 'free',
      expiresAt: profile.subscription_expires_at || null
    };
  }

  async cancelSubscription(firebaseUid: string): Promise<void> {
    const profile = await this.getUserProfile(firebaseUid);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }
}

export const databaseService = new DatabaseService();