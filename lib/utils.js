import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export async function callAIAssistant(payload) {
    const response = await fetch('/.netlify/functions/gemini-api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error response from server' }));
        throw new Error(errorBody.error || `Request failed with status ${response.status}`);
    }
    return response.json();
}
