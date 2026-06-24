



// // lib/gemini.ts
// import { GoogleGenAI } from "@google/genai";
// import dotenv from "dotenv";

// dotenv.config();

// // Validate API key on startup
// const apiKey = process.env.GEMINI_API_KEY;
// if (!apiKey) {
//   console.error("❌ GEMINI_API_KEY is not set in environment variables");
// }

// export const ai = new GoogleGenAI({
//   apiKey: apiKey || "",
//   httpOptions: {
//     headers: {
//       'User-Agent': 'aistudio-build',
//     },
//   },
// });

// // ✅ ADD: Retry logic for API calls
// export async function generateWithRetry(
//   model: string,
//   contents: string,
//   config?: any,
//   maxRetries: number = 3
// ): Promise<string> {
//   let attempts = 0;
  
//   while (attempts < maxRetries) {
//     try {
//       const result = await ai.models.generateContent({
//         model,
//         contents: [{ parts: [{ text: contents }] }],
//         config: {
//           responseMimeType: "application/json",
//           temperature: 0.3,
//           ...config,
//         },
//       });
      
//       return result.text || "{}";
//     } catch (error: any) {
//       attempts++;
      
//       // Retry on 503 (service busy) or rate limits
//       if ((error.status === 503 || error.status === 429) && attempts < maxRetries) {
//         const delay = 2000 * attempts;
//         console.warn(`⚠️ Gemini API ${error.status}. Retrying in ${delay}ms... (${attempts}/${maxRetries})`);
//         await new Promise(resolve => setTimeout(resolve, delay));
//       } else {
//         throw error;
//       }
//     }
//   }
  
//   throw new Error(`Max retries (${maxRetries}) exceeded`);
// }

// // ✅ ADD: Helper for different model types
// export const models = {
//   FLASH: "gemini-2.0-flash-exp",
//   PRO: "gemini-1.5-pro",
//   FLASH_LITE: "gemini-1.5-flash",
// };

// // ✅ ADD: Health check function
// export async function checkGeminiHealth(): Promise<boolean> {
//   try {
//     const result = await ai.models.generateContent({
//       model: models.FLASH,
//       contents: [{ parts: [{ text: "Say 'OK'" }] }],
//     });
//     console.log("✅ Gemini API is healthy");
//     return true;
//   } catch (error) {
//     console.error("❌ Gemini API health check failed:", error);
//     return false;
//   }
// }



// import { GoogleGenAI } from "@google/genai";

// // Available models
// export enum models {
//   FLASH = "gemini-3.5-flash",
//   PRO = "gemini-1.5-pro",
// }

// /**
//  * Dynamically generate content using raw API key retrieved from Aarogya Billing Gateway
//  */
// export async function generateContentWithDynamicKey(
//   dynamicToken: string,
//   modelName: models | string,
//   promptText: string
// ) {
//   if (!dynamicToken) {
//     throw new Error("Missing active API Key. Unable to generate message content dynamically.");
//   }

//   // Initialize client with latest recommended @google/genai SDK format
//   const aiClient = new GoogleGenAI({
//     apiKey: dynamicToken.trim()
//   });

//   const response = await aiClient.models.generateContent({
//     model: modelName,
//     contents: [
//       {
//         role: "user",
//         parts: [{ text: promptText }]
//       }
//     ],
//     config: {
//       temperature: 0.3,
//       responseMimeType: "application/json"
//     }
//   });

//   return response;
// }



// lib/gemini.ts
import { GoogleGenAI } from "@google/genai";

export enum models {
  FLASH = "gemini-3.5-flash",
  PRO = "gemini-1.5-pro",
}

/**
 * Generate content with automatic retry and fallback on transient errors.
 * Tries the primary model, then a list of fallback models.
 * Exponential backoff (1s, 2s, 4s) for each model.
 */
export async function generateContentWithDynamicKey(
  dynamicToken: string,
  primaryModel: models | string,
  promptText: string,
  maxRetriesPerModel = 2,
  baseDelay = 1000
) {
  if (!dynamicToken) {
    throw new Error("Missing active API Key. Unable to generate message content dynamically.");
  }

  // Define fallback models in order of preference (all are valid Gemini models)
  const fallbackModels = [
    "gemini-3.1-flash-lite",   // fast, stable
    "gemini-1.5-flash",       // reliable
    "gemini-1.5-pro",         // higher quality
  ];

  // Build unique list: primary first, then fallbacks (skip duplicates)
  const modelsToTry = [primaryModel, ...fallbackModels.filter(m => m !== primaryModel)];
  const uniqueModels = [...new Map(modelsToTry.map(m => [String(m), m])).values()];

  let lastError: any = null;

  for (const model of uniqueModels) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const aiClient = new GoogleGenAI({ apiKey: dynamicToken.trim() });
        const response = await aiClient.models.generateContent({
          model: model,
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          config: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        });
        // Attach the model that actually succeeded for telemetry/debugging
        (response as any).usedModel = model;
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err.message || "";
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("overloaded") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("resource_exhausted");

        if (isTransient && attempt < maxRetriesPerModel) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(`[Gemini] Model ${model} transient error (${errMsg}). Retry ${attempt + 1}/${maxRetriesPerModel} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        // Non-transient or retries exhausted: break to next model
        break;
      }
    }
    console.warn(`[Gemini] Model ${model} failed, trying next fallback...`);
  }

  throw lastError || new Error("All Gemini models failed after fallback and retries.");
}