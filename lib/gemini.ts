// // lib/gemini.ts
// import { GoogleGenAI } from "@google/genai";
// import dotenv from "dotenv";

// dotenv.config();

// export const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY || "",
//   httpOptions: {
//     headers: {
//       'User-Agent': 'aistudio-build',
//     }
//   }
// });




// lib/gemini.ts
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Validate API key on startup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables");
}

export const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ✅ ADD: Retry logic for API calls
export async function generateWithRetry(
  model: string,
  contents: string,
  config?: any,
  maxRetries: number = 3
): Promise<string> {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: contents }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
          ...config,
        },
      });
      
      return result.text || "{}";
    } catch (error: any) {
      attempts++;
      
      // Retry on 503 (service busy) or rate limits
      if ((error.status === 503 || error.status === 429) && attempts < maxRetries) {
        const delay = 2000 * attempts;
        console.warn(`⚠️ Gemini API ${error.status}. Retrying in ${delay}ms... (${attempts}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw new Error(`Max retries (${maxRetries}) exceeded`);
}

// ✅ ADD: Helper for different model types
export const models = {
  FLASH: "gemini-2.0-flash-exp",
  PRO: "gemini-1.5-pro",
  FLASH_LITE: "gemini-1.5-flash",
};

// ✅ ADD: Health check function
export async function checkGeminiHealth(): Promise<boolean> {
  try {
    const result = await ai.models.generateContent({
      model: models.FLASH,
      contents: [{ parts: [{ text: "Say 'OK'" }] }],
    });
    console.log("✅ Gemini API is healthy");
    return true;
  } catch (error) {
    console.error("❌ Gemini API health check failed:", error);
    return false;
  }
}