import { OptimizedPromptResponse } from '@/types';

export const optimizePrompt = async (
  prompt: string,
  context: string[],
  image?: { data: string; mimeType: string } | null
): Promise<OptimizedPromptResponse> => {
  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context, image }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to optimize prompt.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    throw new Error('Failed to optimize prompt. Please try again.');
  }
};
