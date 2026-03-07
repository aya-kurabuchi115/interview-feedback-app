import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

export const MODELS = {
  flash: "gemini-2.5-flash",
  pro: "gemini-2.5-pro",
} as const;

