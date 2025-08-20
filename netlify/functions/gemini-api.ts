import type { Handler } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key is not configured." }) };
  }
  
  try {
    const { jobDescription, resumeContent } = JSON.parse(event.body || "{}");
    if (!jobDescription || !resumeContent) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing jobDescription or resumeContent."}) };
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            matchingSkills: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        skill: { type: Type.STRING },
                        reasoning: { type: Type.STRING }
                    },
                    required: ["skill", "reasoning"]
                }
            },
            missingSkills: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        skill: { type: Type.STRING },
                        reasoning: { type: Type.STRING }
                    },
                    required: ["skill", "reasoning"]
                }
            },
            suggestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING
                }
            }
        },
        required: ["matchingSkills", "missingSkills", "suggestions"]
    };
    
    const prompt = `
      Analyze the provided resume content against the job description.
      Identify matching skills, missing skills, and provide actionable suggestions for improvement.

      Resume Content:
      ---
      ${resumeContent}
      ---

      Job Description:
      ---
      ${jobDescription}
      ---

      Based on the analysis, provide a JSON object with three properties:
      1.  'matchingSkills': An array of objects, where each object has a 'skill' (string) found in both the resume and job description, and a brief 'reasoning' (string).
      2.  'missingSkills': An array of objects, where each object has a 'skill' (string) mentioned in the job description but missing from the resume, and a brief 'reasoning' (string).
      3.  'suggestions': An array of strings with actionable advice on how to tailor the resume to better fit the job description.
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: response.text,
    };
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process the request with the AI model." }),
    };
  }
};

export { handler };
