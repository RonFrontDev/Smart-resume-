import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SkillGapAnalysisResult } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function callAIAssistant(
  jobDescription: string,
  resumeContent: string
): Promise<SkillGapAnalysisResult> {
  const response = await fetch("/.netlify/functions/gemini-api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ jobDescription, resumeContent }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("API Error Response:", errorBody);
    throw new Error(`An API error occurred: ${response.statusText}`);
  }

  return response.json();
}
