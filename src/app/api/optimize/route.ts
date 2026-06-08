import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const SYSTEM_PROMPT = `You are a concise prompt engineering expert. Your task is to take a user's rough idea and rewrite it into a clear, focused prompt for an AI coding assistant.

CRITICAL RULES:
- Keep the optimized prompt between 100-300 words. NEVER exceed 400 words.
- Do NOT generate code, boilerplate, API specs, or directory structures.
- Do NOT add unnecessary sections like "Deliverables", "Architecture", or "Setup Instructions".
- Focus on WHAT to build, the key features, and the desired look and feel.
- If the user's input is very short or vague, make reasonable assumptions but keep the output proportionally brief.
- The optimized prompt should be a single, clear paragraph or short bullet list — not a full spec document.

You must return a JSON object with two keys:
1. "prompt": The rewritten, enhanced prompt (100-300 words max).
2. "suggestions": An array of 3-4 SHORT strings (max 15 words each) suggesting how the user could improve their original prompt.`;

const NVIDIA_MODELS = [
  'deepseek/deepseek-r1',
  'meta/llama-3.3-70b-instruct',
  'mistralai/mistral-small-3.1-24b-instruct',
];

async function callGemini(prompt: string, context: string[], image?: { data: string; mimeType: string }) {
  if (!ai) throw new Error('Gemini not configured');

  const systemInstruction = `${SYSTEM_PROMPT}\n\nUser's context: ${context.join(', ')}`;
  const textPart = { text: `Here is the user's prompt: "${prompt}"` };

  const parts = image
    ? [{ inlineData: { data: image.data, mimeType: image.mimeType } }, textPart]
    : [textPart];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts },
    config: {
      systemInstruction,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prompt: {
            type: Type.STRING,
            description: 'The rewritten, focused prompt (100-300 words).',
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Array of 3-4 short suggestions (max 15 words each).',
          },
        },
        required: ['prompt', 'suggestions'],
      },
    },
  });

  const jsonText = response.text?.trim();
  if (!jsonText) throw new Error('AI returned an empty response.');
  return JSON.parse(jsonText);
}

async function callNvidia(prompt: string, context: string[]) {
  if (!NVIDIA_API_KEY) throw new Error('NVIDIA not configured');

  const userMessage = `User's context: ${context.join(', ')}\n\nHere is the user's prompt: "${prompt}"\n\nRespond ONLY with a valid JSON object containing "prompt" (string, 100-300 words) and "suggestions" (array of 3-4 short strings).`;

  let lastError: Error | null = null;

  for (const model of NVIDIA_MODELS) {
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        lastError = new Error(`NVIDIA ${model}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        lastError = new Error(`NVIDIA ${model}: empty response`);
        continue;
      }

      // Extract JSON from potential markdown code fences
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
      return JSON.parse(jsonMatch[1]!.trim());
    } catch (e) {
      lastError = e as Error;
      continue;
    }
  }

  throw lastError || new Error('All NVIDIA models failed');
}

export async function POST(request: NextRequest) {
  if (!ai && !NVIDIA_API_KEY) {
    return NextResponse.json(
      { error: 'AI service is not configured.' },
      { status: 503 }
    );
  }

  try {
    const { prompt, context, image } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required.' },
        { status: 400 }
      );
    }

    // Try Gemini first
    if (ai) {
      try {
        const result = await callGemini(prompt, context || [], image);
        return NextResponse.json({ ...result, model: 'gemini-2.5-flash' });
      } catch (geminiError) {
        const err = geminiError as { status?: number; message?: string };
        console.warn('Gemini failed, attempting NVIDIA fallback:', err.message || geminiError);

        // Only fallback on rate limit, access denied, or server errors
        if (!NVIDIA_API_KEY) throw geminiError;
      }
    }

    // Fallback to NVIDIA (no image support for text-only models)
    const result = await callNvidia(prompt, context || []);
    return NextResponse.json({ ...result, model: 'nvidia-fallback' });

  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('Error optimizing prompt:', err.message || error);

    if (err.status === 429 || (err.message && err.message.includes('429'))) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    if (err.status === 403 || (err.message && err.message.includes('403'))) {
      return NextResponse.json(
        { error: 'API key does not have access to this model.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to optimize prompt. Please try again.' },
      { status: 500 }
    );
  }
}
