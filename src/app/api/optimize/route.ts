import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export async function POST(request: NextRequest) {
  if (!ai) {
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

    const systemInstruction = `You are a concise prompt engineering expert. Your task is to take a user's rough idea and rewrite it into a clear, focused prompt for an AI coding assistant.

CRITICAL RULES:
- Keep the optimized prompt between 100-300 words. NEVER exceed 400 words.
- Do NOT generate code, boilerplate, API specs, or directory structures.
- Do NOT add unnecessary sections like "Deliverables", "Architecture", or "Setup Instructions".
- Focus on WHAT to build, the key features, and the desired look and feel.
- If the user's input is very short or vague, make reasonable assumptions but keep the output proportionally brief.
- The optimized prompt should be a single, clear paragraph or short bullet list — not a full spec document.

You must return a JSON object with two keys:
1. "prompt": The rewritten, enhanced prompt (100-300 words max).
2. "suggestions": An array of 3-4 SHORT strings (max 15 words each) suggesting how the user could improve their original prompt.

User's context: ${(context || []).join(', ')}`;

    const textPart = { text: `Here is the user's prompt: "${prompt}"` };

    const parts = image
      ? [
          {
            inlineData: {
              data: image.data,
              mimeType: image.mimeType,
            },
          },
          textPart,
        ]
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
    if (!jsonText) {
      return NextResponse.json(
        { error: 'AI returned an empty response.' },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonText);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error('Error calling Gemini API:', err.message || error);

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
