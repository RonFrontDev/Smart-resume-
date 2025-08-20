import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { model, contents, config } = JSON.parse(event.body || '{}');

    if (!model || !contents) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing model or contents in request body' }) };
    }

    const response = await ai.models.generateContent({ model, contents, config });
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: response.text }),
    };

  } catch (error) {
    console.error("Gemini API call failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${errorMessage}` }),
    };
  }
};

export { handler };
