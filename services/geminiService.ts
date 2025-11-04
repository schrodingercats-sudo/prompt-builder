
import { GoogleGenAI, Type } from "@google/genai";
import { OptimizedPromptResponse } from '../types';

// Assume process.env.API_KEY is available in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a mock service.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const MOCK_RESPONSE: OptimizedPromptResponse = {
  prompt: "Create a full-stack task management application with a modern, minimalist UI. It should feature real-time collaboration, drag-and-drop reordering of tasks, user authentication via OAuth, and a PostgreSQL database. The frontend should be built with React and Tailwind CSS, and the backend with Node.js and Express.",
  suggestions: [
    "Specify the desired frontend framework (e.g., React, Vue).",
    "Mention the backend technology stack (e.g., Node.js, Python/Django).",
    "Clarify the database type (e.g., SQL, NoSQL).",
    "Define the core features more granularly."
  ]
};

export const optimizePrompt = async (
  prompt: string,
  context: string[],
  image?: { data: string; mimeType: string } | null
): Promise<OptimizedPromptResponse> => {
  if (!ai) {
    // Simulate network delay for mock
    await new Promise(resolve => setTimeout(resolve, 1500));
    return MOCK_RESPONSE;
  }

  const systemInstruction = `You are a world-class prompt engineering expert. Your task is to analyze a user's prompt for building a web application and enhance it to be more detailed, specific, and effective for a large language model.
  
  The user will provide a base prompt, an optional image for context, and optional context tags.
  
  You must return a JSON object with two keys:
  1. "prompt": The rewritten, enhanced, and more detailed prompt.
  2. "suggestions": An array of 3-4 strings, where each string is a concise suggestion for how the user could have improved their original prompt.
  
  Context from user: ${context.join(', ')}`;

  const textPart = { text: `Here is the user's prompt: "${prompt}"` };
  
  // FIX: The original code caused a TypeScript error by initializing `parts` with only a text part,
  // which led to a narrow type inference. By constructing the array conditionally, TypeScript
  // can correctly infer a union type for `parts` that accepts both text and image parts.
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: {
              type: Type.STRING,
              description: "The rewritten, enhanced, and detailed prompt."
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of suggestions for improving the original prompt."
            }
          },
          required: ["prompt", "suggestions"]
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as OptimizedPromptResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to optimize prompt. Please check your API key and try again.");
  }
};
