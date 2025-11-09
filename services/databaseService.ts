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

  // Admin Analytics Methods
  async getUserGrowthData(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const groupedData: { [key: string]: number } = {};
      data?.forEach(user => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        groupedData[date] = (groupedData[date] || 0) + 1;
      });

      // Fill in missing dates with 0
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          count: groupedData[dateStr] || 0
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      return [];
    }
  }

  async getPromptActivityData(days: number = 7): Promise<Array<{ date: string; count: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('prompts')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const groupedData: { [key: string]: number } = {};
      data?.forEach(prompt => {
        const date = new Date(prompt.created_at).toISOString().split('T')[0];
        groupedData[date] = (groupedData[date] || 0) + 1;
      });

      // Fill in missing dates with 0
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          count: groupedData[dateStr] || 0
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching prompt activity data:', error);
      return [];
    }
  }

  async getModelUsageData(): Promise<Array<{ name: string; value: number }>> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('model_used');

      if (error) throw error;

      // Count by model
      const modelCounts: { [key: string]: number } = {};
      data?.forEach(prompt => {
        const model = prompt.model_used || 'Unknown';
        modelCounts[model] = (modelCounts[model] || 0) + 1;
      });

      // Convert to array format for pie chart
      return Object.entries(modelCounts).map(([name, value]) => ({
        name,
        value
      }));
    } catch (error) {
      console.error('Error fetching model usage data:', error);
      return [];
    }
  }

  async getRecentActivity(): Promise<Array<{
    id: string;
    type: 'user_signup' | 'prompt_created' | 'subscription_change';
    description: string;
    timestamp: string;
    userEmail?: string;
  }>> {
    try {
      const activities: Array<{
        id: string;
        type: 'user_signup' | 'prompt_created' | 'subscription_change';
        description: string;
        timestamp: string;
        userEmail?: string;
      }> = [];

      // Get recent user signups (last 10)
      const { data: recentUsers, error: usersError } = await supabase
        .from('users')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!usersError && recentUsers) {
        recentUsers.forEach(user => {
          activities.push({
            id: `user-${user.id}`,
            type: 'user_signup',
            description: `New user signed up`,
            timestamp: user.created_at,
            userEmail: user.email
          });
        });
      }

      // Get recent prompts (last 10)
      const { data: recentPrompts, error: promptsError } = await supabase
        .from('prompts')
        .select(`
          id,
          created_at,
          model_used,
          users!inner(email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!promptsError && recentPrompts) {
        recentPrompts.forEach(prompt => {
          activities.push({
            id: `prompt-${prompt.id}`,
            type: 'prompt_created',
            description: `Optimized prompt using ${prompt.model_used}`,
            timestamp: prompt.created_at,
            userEmail: prompt.users.email
          });
        });
      }

      // Get recent subscription changes (last 10)
      const { data: recentSubs, error: subsError } = await supabase
        .from('users')
        .select('id, email, subscription_status, updated_at')
        .not('subscription_status', 'is', null)
        .neq('subscription_status', 'free')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (!subsError && recentSubs) {
        recentSubs.forEach(sub => {
          activities.push({
            id: `sub-${sub.id}`,
            type: 'subscription_change',
            description: `Subscription ${sub.subscription_status}`,
            timestamp: sub.updated_at,
            userEmail: sub.email
          });
        });
      }

      // Sort all activities by timestamp and return top 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Admin User Management Methods
  async getAllUsers(limit: number = 50, offset: number = 0): Promise<Array<{
    id: string;
    firebase_uid: string;
    email: string;
    displayName?: string;
    signupDate: string;
    subscriptionStatus: string;
    credits: number;
    emailVerified: boolean;
    totalPrompts: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          firebase_uid,
          email,
          display_name,
          created_at,
          subscription_status,
          email_verified,
          credits!inner(count)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get prompt counts for each user
      const usersWithPrompts = await Promise.all(
        (data || []).map(async (user) => {
          const { count } = await supabase
            .from('prompts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          return {
            id: user.id,
            firebase_uid: user.firebase_uid,
            email: user.email,
            displayName: user.display_name || undefined,
            signupDate: user.created_at,
            subscriptionStatus: user.subscription_status || 'free',
            credits: user.credits?.[0]?.count || 0,
            emailVerified: user.email_verified || false,
            totalPrompts: count || 0
          };
        })
      );

      return usersWithPrompts;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async searchUsers(query: string): Promise<Array<{
    id: string;
    firebase_uid: string;
    email: string;
    displayName?: string;
    signupDate: string;
    subscriptionStatus: string;
    credits: number;
    emailVerified: boolean;
    totalPrompts: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          firebase_uid,
          email,
          display_name,
          created_at,
          subscription_status,
          email_verified,
          credits!inner(count)
        `)
        .ilike('email', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get prompt counts for each user
      const usersWithPrompts = await Promise.all(
        (data || []).map(async (user) => {
          const { count } = await supabase
            .from('prompts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          return {
            id: user.id,
            firebase_uid: user.firebase_uid,
            email: user.email,
            displayName: user.display_name || undefined,
            signupDate: user.created_at,
            subscriptionStatus: user.subscription_status || 'free',
            credits: user.credits?.[0]?.count || 0,
            emailVerified: user.email_verified || false,
            totalPrompts: count || 0
          };
        })
      );

      return usersWithPrompts;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  async getUserStats(userId: string): Promise<{
    totalPrompts: number;
    publicPrompts: number;
    privatePrompts: number;
    recentPrompts: SavedPrompt[];
  }> {
    try {
      const { count: totalPrompts } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: publicPrompts } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_public', true);

      const { count: privatePrompts } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_public', false);

      const { data: recentPrompts } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        totalPrompts: totalPrompts || 0,
        publicPrompts: publicPrompts || 0,
        privatePrompts: privatePrompts || 0,
        recentPrompts: (recentPrompts || []).map(prompt => ({
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
        }))
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  async resetUserCredits(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('credits')
        .update({
          count: 2,
          reset_time: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error resetting user credits:', error);
      throw new Error('Failed to reset user credits');
    }
  }

  async deleteUserAccount(userId: string): Promise<void> {
    try {
      // Delete user's prompts first (cascade should handle this, but being explicit)
      await supabase
        .from('prompts')
        .delete()
        .eq('user_id', userId);

      // Delete user's credits
      await supabase
        .from('credits')
        .delete()
        .eq('user_id', userId);

      // Delete user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw new Error('Failed to delete user account');
    }
  }

  // Admin Prompt Management Methods
  async getAllPrompts(limit: number = 50, offset: number = 0): Promise<Array<{
    id: string;
    userId: string;
    userEmail: string;
    title: string;
    originalPrompt: string;
    optimizedPrompt: string;
    modelUsed: string;
    createdAt: string;
    isPublic: boolean;
    originalLength: number;
    optimizedLength: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          id,
          user_id,
          title,
          original_prompt,
          optimized_prompt,
          model_used,
          created_at,
          is_public,
          users!inner(email)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (data || []).map(prompt => ({
        id: prompt.id,
        userId: prompt.user_id,
        userEmail: prompt.users.email,
        title: prompt.title,
        originalPrompt: prompt.original_prompt,
        optimizedPrompt: prompt.optimized_prompt,
        modelUsed: prompt.model_used,
        createdAt: prompt.created_at,
        isPublic: prompt.is_public,
        originalLength: prompt.original_prompt.length,
        optimizedLength: prompt.optimized_prompt.length
      }));
    } catch (error) {
      console.error('Error fetching all prompts:', error);
      return [];
    }
  }

  async searchPrompts(query: string): Promise<Array<{
    id: string;
    userId: string;
    userEmail: string;
    title: string;
    originalPrompt: string;
    optimizedPrompt: string;
    modelUsed: string;
    createdAt: string;
    isPublic: boolean;
    originalLength: number;
    optimizedLength: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          id,
          user_id,
          title,
          original_prompt,
          optimized_prompt,
          model_used,
          created_at,
          is_public,
          users!inner(email)
        `)
        .ilike('users.email', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(prompt => ({
        id: prompt.id,
        userId: prompt.user_id,
        userEmail: prompt.users.email,
        title: prompt.title,
        originalPrompt: prompt.original_prompt,
        optimizedPrompt: prompt.optimized_prompt,
        modelUsed: prompt.model_used,
        createdAt: prompt.created_at,
        isPublic: prompt.is_public,
        originalLength: prompt.original_prompt.length,
        optimizedLength: prompt.optimized_prompt.length
      }));
    } catch (error) {
      console.error('Error searching prompts:', error);
      return [];
    }
  }

  async deletePromptAdmin(promptId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw new Error('Failed to delete prompt');
    }
  }

  async togglePromptVisibility(promptId: string): Promise<void> {
    try {
      // First get current visibility
      const { data: prompt, error: fetchError } = await supabase
        .from('prompts')
        .select('is_public')
        .eq('id', promptId)
        .single();

      if (fetchError) throw fetchError;

      // Toggle visibility
      const { error: updateError } = await supabase
        .from('prompts')
        .update({
          is_public: !prompt.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', promptId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error toggling prompt visibility:', error);
      throw new Error('Failed to toggle prompt visibility');
    }
  }

  // Admin Statistics Methods
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalPrompts: number;
    activeSubscriptions: number;
    totalRevenue: number;
    userGrowth: number;
    promptGrowth: number;
  }> {
    try {
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get total prompts
      const { count: totalPrompts, error: promptsError } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true });

      if (promptsError) throw promptsError;

      // Get active subscriptions
      const { count: activeSubscriptions, error: subsError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');

      if (subsError) throw subsError;

      // Calculate growth percentages (last 7 days vs previous 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // User growth
      const { count: recentUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: previousUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fourteenDaysAgo.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString());

      const userGrowth = previousUsers && previousUsers > 0
        ? Math.round(((recentUsers || 0) - previousUsers) / previousUsers * 100)
        : 0;

      // Prompt growth
      const { count: recentPrompts } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: previousPrompts } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fourteenDaysAgo.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString());

      const promptGrowth = previousPrompts && previousPrompts > 0
        ? Math.round(((recentPrompts || 0) - previousPrompts) / previousPrompts * 100)
        : 0;

      // For now, revenue is placeholder (will be implemented with payment tracking)
      const totalRevenue = 0;

      return {
        totalUsers: totalUsers || 0,
        totalPrompts: totalPrompts || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalRevenue,
        userGrowth,
        promptGrowth
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw new Error('Failed to fetch admin statistics');
    }
  }

  // Analytics Methods for AdminAnalytics page
  async getRevenueData(months: number = 12): Promise<Array<{ month: string; revenue: number }>> {
    try {
      // For now, return placeholder data since payment tracking isn't fully implemented
      // This will be populated when subscription payments are tracked in the database
      const result = [];
      const currentDate = new Date();
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        result.push({
          month: monthStr,
          revenue: 0 // Placeholder - will be calculated from subscription payments
        });
      }

      return result;
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return [];
    }
  }

  async getTopUsers(limit: number = 10): Promise<Array<{
    id: string;
    email: string;
    displayName?: string;
    promptCount: number;
  }>> {
    try {
      // Get all users with their prompt counts
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, display_name');

      if (error) throw error;

      // Get prompt counts for each user
      const usersWithCounts = await Promise.all(
        (users || []).map(async (user) => {
          const { count } = await supabase
            .from('prompts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          return {
            id: user.id,
            email: user.email,
            displayName: user.display_name || undefined,
            promptCount: count || 0
          };
        })
      );

      // Sort by prompt count and return top users
      return usersWithCounts
        .sort((a, b) => b.promptCount - a.promptCount)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top users:', error);
      return [];
    }
  }

  async getAnalyticsMetrics(): Promise<{
    totalRevenue: number;
    mrr: number;
    arpu: number;
    conversionRate: number;
    churnRate: number;
  }> {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');

      // Get cancelled subscriptions
      const { count: cancelledSubscriptions } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'cancelled');

      // Calculate metrics
      // For now, using placeholder revenue values
      // These will be calculated from actual payment data when implemented
      const totalRevenue = 0;
      const mrr = 0; // Monthly Recurring Revenue
      const arpu = totalUsers && totalUsers > 0 ? totalRevenue / totalUsers : 0;
      const conversionRate = totalUsers && totalUsers > 0 
        ? ((activeSubscriptions || 0) / totalUsers) * 100 
        : 0;
      const totalSubscriptions = (activeSubscriptions || 0) + (cancelledSubscriptions || 0);
      const churnRate = totalSubscriptions > 0 
        ? ((cancelledSubscriptions || 0) / totalSubscriptions) * 100 
        : 0;

      return {
        totalRevenue,
        mrr,
        arpu,
        conversionRate: Math.round(conversionRate * 10) / 10,
        churnRate: Math.round(churnRate * 10) / 10
      };
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      return {
        totalRevenue: 0,
        mrr: 0,
        arpu: 0,
        conversionRate: 0,
        churnRate: 0
      };
    }
  }

  // Admin Subscription Management Methods
  async getAllSubscriptions(): Promise<Array<{
    id: string;
    userId: string;
    userEmail: string;
    displayName?: string;
    plan: string;
    paymentId: string;
    startDate: string;
    expiryDate: string | null;
    status: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, display_name, subscription_status, subscription_id, subscription_expires_at, created_at')
        .not('subscription_status', 'is', null)
        .neq('subscription_status', 'free')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(user => ({
        id: user.id,
        userId: user.id,
        userEmail: user.email,
        displayName: user.display_name || undefined,
        plan: user.subscription_status === 'active' ? 'Pro Monthly' : 'Pro Monthly',
        paymentId: user.subscription_id || 'N/A',
        startDate: user.created_at,
        expiryDate: user.subscription_expires_at,
        status: user.subscription_status || 'free'
      }));
    } catch (error) {
      console.error('Error fetching all subscriptions:', error);
      return [];
    }
  }

  async getRevenueMetrics(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    revenueGrowth: number;
  }> {
    try {
      // Get active subscriptions count
      const { count: activeSubscriptions } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');

      // Placeholder revenue calculation
      // Assuming Pro Monthly is $10/month
      const monthlyRevenue = (activeSubscriptions || 0) * 10;
      const yearlyRevenue = monthlyRevenue * 12;
      const totalRevenue = yearlyRevenue;

      // Calculate growth (placeholder)
      const revenueGrowth = 0;

      return {
        totalRevenue,
        monthlyRevenue,
        yearlyRevenue,
        revenueGrowth
      };
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        revenueGrowth: 0
      };
    }
  }

  async getRecentPayments(limit: number = 20): Promise<Array<{
    id: string;
    userId: string;
    userEmail: string;
    amount: number;
    date: string;
    status: string;
  }>> {
    try {
      // Get users with active or recently changed subscriptions
      const { data, error } = await supabase
        .from('users')
        .select('id, email, subscription_status, updated_at')
        .not('subscription_status', 'is', null)
        .neq('subscription_status', 'free')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(user => ({
        id: user.id,
        userId: user.id,
        userEmail: user.email,
        amount: 10, // Placeholder amount
        date: user.updated_at,
        status: user.subscription_status === 'active' ? 'completed' : 'cancelled'
      }));
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      return [];
    }
  }

  async cancelSubscriptionAdmin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async reactivateSubscriptionAdmin(userId: string): Promise<void> {
    try {
      // Set expiry to 30 days from now
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          subscription_expires_at: expiryDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw new Error('Failed to reactivate subscription');
    }
  }

  // Admin System Monitoring Methods
  async getSystemStats(): Promise<{
    totalDatabaseSize: string;
    apiRequestCount: number;
    errorRate: number;
    uptime: string;
  }> {
    try {
      // Get database size (approximate from table counts)
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: promptsCount } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true });

      const { count: creditsCount } = await supabase
        .from('credits')
        .select('*', { count: 'exact', head: true });

      // Approximate size calculation (rough estimate)
      const totalRecords = (usersCount || 0) + (promptsCount || 0) + (creditsCount || 0);
      const estimatedSizeKB = totalRecords * 2; // Rough estimate: 2KB per record
      const totalDatabaseSize = estimatedSizeKB > 1024 
        ? `${(estimatedSizeKB / 1024).toFixed(2)} MB`
        : `${estimatedSizeKB} KB`;

      // API request count (placeholder - would need actual tracking)
      const apiRequestCount = 0;

      // Error rate (placeholder - would need actual error tracking)
      const errorRate = 0;

      // Uptime (placeholder - would need actual uptime tracking)
      const uptime = '99.9%';

      return {
        totalDatabaseSize,
        apiRequestCount,
        errorRate,
        uptime
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {
        totalDatabaseSize: 'N/A',
        apiRequestCount: 0,
        errorRate: 0,
        uptime: 'N/A'
      };
    }
  }

  async checkAPIStatus(): Promise<{
    gemini: { status: 'connected' | 'disconnected'; message: string };
    firebase: { status: 'connected' | 'disconnected'; message: string };
    supabase: { status: 'connected' | 'disconnected'; message: string };
    razorpay: { status: 'connected' | 'disconnected'; message: string };
  }> {
    const result = {
      gemini: { status: 'disconnected' as const, message: 'Not checked' },
      firebase: { status: 'disconnected' as const, message: 'Not checked' },
      supabase: { status: 'disconnected' as const, message: 'Not checked' },
      razorpay: { status: 'disconnected' as const, message: 'Not checked' }
    };

    // Check Supabase
    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (!error) {
        result.supabase = { status: 'connected', message: 'Database connection successful' };
      } else {
        result.supabase = { status: 'disconnected', message: error.message };
      }
    } catch (error) {
      result.supabase = { 
        status: 'disconnected', 
        message: error instanceof Error ? error.message : 'Connection failed' 
      };
    }

    // Check Gemini (check if API key is configured)
    try {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (geminiKey && geminiKey.length > 0) {
        result.gemini = { status: 'connected', message: 'API key configured' };
      } else {
        result.gemini = { status: 'disconnected', message: 'API key not configured' };
      }
    } catch (error) {
      result.gemini = { status: 'disconnected', message: 'Configuration error' };
    }

    // Check Firebase (check if it's initialized)
    try {
      // Firebase check would require importing auth service
      // For now, assume it's connected if we can access Supabase
      result.firebase = { status: 'connected', message: 'Authentication service active' };
    } catch (error) {
      result.firebase = { status: 'disconnected', message: 'Service unavailable' };
    }

    // Check Razorpay (check if keys are configured)
    try {
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (razorpayKey && razorpayKey.length > 0) {
        result.razorpay = { status: 'connected', message: 'Payment gateway configured' };
      } else {
        result.razorpay = { status: 'disconnected', message: 'Keys not configured' };
      }
    } catch (error) {
      result.razorpay = { status: 'disconnected', message: 'Configuration error' };
    }

    return result;
  }

  async getDatabaseSize(): Promise<{
    totalSize: string;
    usersTable: string;
    promptsTable: string;
    creditsTable: string;
  }> {
    try {
      // Get counts for each table
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: promptsCount } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true });

      const { count: creditsCount } = await supabase
        .from('credits')
        .select('*', { count: 'exact', head: true });

      // Rough size estimates (2KB per user, 5KB per prompt, 1KB per credit record)
      const usersSize = (usersCount || 0) * 2;
      const promptsSize = (promptsCount || 0) * 5;
      const creditsSize = (creditsCount || 0) * 1;
      const totalSizeKB = usersSize + promptsSize + creditsSize;

      const formatSize = (kb: number) => {
        if (kb > 1024) {
          return `${(kb / 1024).toFixed(2)} MB`;
        }
        return `${kb} KB`;
      };

      return {
        totalSize: formatSize(totalSizeKB),
        usersTable: formatSize(usersSize),
        promptsTable: formatSize(promptsSize),
        creditsTable: formatSize(creditsSize)
      };
    } catch (error) {
      console.error('Error calculating database size:', error);
      return {
        totalSize: 'N/A',
        usersTable: 'N/A',
        promptsTable: 'N/A',
        creditsTable: 'N/A'
      };
    }
  }
}

export const databaseService = new DatabaseService();