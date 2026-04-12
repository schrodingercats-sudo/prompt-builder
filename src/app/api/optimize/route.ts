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

    const systemInstruction = `You are a world-class prompt engineering expert. Your task is to analyze a user's prompt for building a web application and enhance it to be more detailed, specific, and effective for a large language model.
    
    The user will provide a base prompt, an optional image for context, and optional context tags.
    
    You must return a JSON object with two keys:
    1. "prompt": The rewritten, enhanced, and more detailed prompt.
    2. "suggestions": An array of 3-4 strings, where each string is a concise suggestion for how the user could have improved their original prompt.
    
    Context from user: ${(context || []).join(', ')}`;

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
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: {
              type: Type.STRING,
              description: 'The rewritten, enhanced, and detailed prompt.',
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'An array of suggestions for improving the original prompt.',
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
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: 'Failed to optimize prompt. Please try again.' },
      { status: 500 }
    );
  }
}
