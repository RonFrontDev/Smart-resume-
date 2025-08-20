import { GoogleGenAI, Type } from "@google/genai";
import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { action, payload } = JSON.parse(event.body || '{}');
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            console.error('API key not configured.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API key is missing on the server.' }),
            };
        }

        const ai = new GoogleGenAI({ apiKey });

        let response;

        switch (action) {
            case 'generateCoverLetter': {
                const { userPrompt, systemInstruction } = payload;
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: userPrompt,
                    config: { systemInstruction }
                });
                break;
            }
            case 'analyzeSkillGap': {
                const { userPrompt, systemInstruction } = payload;
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: userPrompt,
                    config: {
                        systemInstruction,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                skillGaps: {
                                    type: Type.ARRAY,
                                    description: "List of skills or experiences from the job description that are weakly represented in the resume.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            skill: { type: Type.STRING, description: "The specific skill or requirement from the job description." },
                                            reason: { type: Type.STRING, description: "A brief explanation of why this is considered a gap based on the provided resume information." }
                                        }
                                    }
                                },
                                suggestions: {
                                    type: Type.ARRAY,
                                    description: "A list of actionable suggestions for improvement.",
                                    items: { type: Type.STRING }
                                },
                                matchPercentage: {
                                    type: Type.NUMBER,
                                    description: "An estimated percentage (0-100) of how well the resume matches the job description."
                                }
                            }
                        }
                    }
                });
                break;
            }
            case 'generateSummary': {
                 const { userPrompt, systemInstruction } = payload;
                 response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: userPrompt,
                    config: { systemInstruction }
                });
                break;
            }
            default:
                return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ result: response.text }),
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage }),
        };
    }
};
