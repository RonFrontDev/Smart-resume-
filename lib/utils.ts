import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function callAIAssistant(action: string, payload: any) {
  try {
    const response = await fetch('/.netlify/functions/gemini-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data.result;
  } catch (error) {
    console.error(`API call failed for action "${action}":`, error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('An unknown network error occurred.');
  }
}
