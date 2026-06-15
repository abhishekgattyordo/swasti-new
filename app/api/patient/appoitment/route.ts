





// import { NextRequest, NextResponse } from "next/server";
// import fs from "fs";
// import path from "path";
// import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// // -------------------------------------------------------------
// // 1. Database Type Declarations
// // -------------------------------------------------------------
// export interface Doctor {
//   id: string;
//   name: string;
//   specialty: string;
//   location: string;
//   timings: string;
//   languages: string[];
// }

// export interface Appointment {
//   id: string;
//   patientName: string;
//   patientPhone: string;
//   doctorId: string;
//   doctorName: string;
//   specialty: string;
//   date: string;
//   time: string;
//   reason: string;
//   status: "booked" | "cancelled";
//   createdAt: string;
// }

// // -------------------------------------------------------------
// // 2. Persistent Storage Paths & Decoupled File Access Helpers
// // -------------------------------------------------------------
// const DB_FILE = path.join(process.cwd(), "appointments-db.json");
// const DOCTORS_FILE = path.join(process.cwd(), "doctors-db.json");

// function loadDoctors(): Doctor[] {
//   try {
//     if (fs.existsSync(DOCTORS_FILE)) {
//       const data = fs.readFileSync(DOCTORS_FILE, "utf-8");
//       return JSON.parse(data);
//     }
//   } catch (error) {
//     console.error("Error reading doctors database file:", error);
//   }
//   return [];
// }

// function loadAppointments(): Appointment[] {
//   try {
//     if (fs.existsSync(DB_FILE)) {
//       const data = fs.readFileSync(DB_FILE, "utf-8");
//       return JSON.parse(data);
//     }
//   } catch (error) {
//     console.error("Error reading database file:", error);
//   }
//   return [];
// }

// function saveAppointments(appointments: Appointment[]): void {
//   try {
//     fs.writeFileSync(DB_FILE, JSON.stringify(appointments, null, 2), "utf-8");
//   } catch (error) {
//     console.error("Error writing database file:", error);
//   }
// }

// // -------------------------------------------------------------
// // 3. Billing Portal & Request Recovery Helpers
// // -------------------------------------------------------------

// /**
//  * Sends model usage statistics and tokens to the centralized AI Billing Config Portal.
//  * Maps attributes to keep the external usage tracking charts synchronized.
//  */
// async function logUsageExternal(
//   model: string,
//   inputTokens: number,
//   outputTokens: number,
//   responseTimeMs: number,
//   status: "success" | "error",
//   errorDetails?: string
// ) {
//   try {
//     const portalUrl = 
//       process.env.PORTAL_API_URL || 
//       process.env.NEXT_PUBLIC_PORTAL_API_URL || 
//       "https://ais-dev-wr2tv2qn5p6rikguengqgn-673578198570.asia-southeast1.run.app";
                      
//     const url = `${portalUrl.replace(/\/$/, "")}/api/external-log`;
//     console.log(`[Billing Log] Shipping token usage to portal: ${url}`);
    
//     await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         projectName: "Aarogya Voice Assistant",
//         model,
//         inputTokens,
//         outputTokens,
//         responseTimeMs,
//         status,
//         errorDetails,
//         userRole: "patient"
//       })
//     });
//     console.log(`[Billing Log] Successfully logged ${inputTokens + outputTokens} tokens to the portal.`);
//   } catch (err) {
//     console.error("[Billing Log] Failed to ship external log to portal:", err);
//   }
// }

// /**
//  * Executes a function with a backoff-recovery policy for 503 and 429 transient errors.
//  */
// async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
//   let lastError: any = null;
//   for (let i = 0; i < retries; i++) {
//     try {
//       return await fn();
//     } catch (err: any) {
//       lastError = err;
//       const errMsg = String(err.message || "").toLowerCase();
//       const errStatus = Number(err.status) || 0;
      
//       const isTransient = 
//         errStatus === 503 || 
//         errStatus === 429 || 
//         errMsg.includes("503") || 
//         errMsg.includes("unavailable") ||
//         errMsg.includes("429") ||
//         errMsg.includes("resource_exhausted") ||
//         errMsg.includes("rate limit") ||
//         errMsg.includes("overloaded") ||
//         errMsg.includes("high demand");
        
//       if (isTransient && i < retries - 1) {
//         console.warn(`[Gemini API] Request failed with transient error: ${err.message || err}. Retrying in ${delay}ms...`);
//         await new Promise((resolve) => setTimeout(resolve, delay));
//         delay *= 2; // exponential backoff
//       } else {
//         throw err;
//       }
//     }
//   }
//   throw lastError;
// }

// // -------------------------------------------------------------
// // 4. Gemini API Client Initialization
// // -------------------------------------------------------------
// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY || "",
//   httpOptions: {
//     headers: { "User-Agent": "aistudio-build" },
//   },
// });

// async function generateContentWithFallback(aiInstance: any, params: any) {
//   const modelsToTry = [
//     params.model || "gemini-3.5-flash",
//     "gemini-3.1-flash-lite",
//     "gemini-flash-latest",
//   ];
//   let lastError: any = null;

//   for (const modelName of modelsToTry) {
//     try {
//       console.log(`[Gemini API] Attempting call with model: ${modelName}`);
//       const updatedParams = { ...params, model: modelName };
      
//       const response = await fetchWithRetry(async () => {
//         return await aiInstance.models.generateContent(updatedParams);
//       }, 3, 1000);

//       console.log(`[Gemini API] Success using model: ${modelName}`);
//       (response as any).modelUsed = modelName;
//       return response;
//     } catch (err: any) {
//       lastError = err;
//       const errMsg = err.message || JSON.stringify(err);
//       console.warn(`[Gemini API] Model ${modelName} call failed. Error: ${errMsg}. Trying next option...`);
//     }
//   }
//   throw lastError;
// }

// function getLangCode(text: string, userLangCode?: string): string {
//   const lower = text.toLowerCase();
//   if (userLangCode === "tu") return "tu";
//   if (userLangCode === "kn") return "kn";

//   const hasKannadaScript = /[\u0c80-\u0cff]/.test(text);
//   if (hasKannadaScript || lower.includes("tulu") || lower.includes("ತುಳು")) return "tu";
//   if (lower.includes("beku") || lower.includes("naale") || lower.includes("hesaru")) return "kn";
//   if (/[\u0900-\u097f]/.test(text) || lower.includes("mujhe") || lower.includes("chahiye")) return "hi";
//   return "en";
// }

// // -------------------------------------------------------------
// // 5. Gemini Function Declarations (Tools)
// // -------------------------------------------------------------
// const getDoctorsTool: FunctionDeclaration = {
//   name: "getDoctorsList",
//   description: "Get the full list of doctors, their specialties, location, timings, and spoken languages.",
//   parameters: { type: Type.OBJECT, properties: {} },
// };

// const getPatientAppointmentsTool: FunctionDeclaration = {
//   name: "getPatientAppointments",
//   description: "Retrieve all active or historic appointments associated with the logged‑in patient (uses patientId from request, no need to ask for phone number).",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       patientPhone: { type: Type.STRING, description: "Optional – ignored; the system uses the authenticated patient ID." },
//     },
//   },
// };

// const bookAppointmentTool: FunctionDeclaration = {
//   name: "bookAppointment",
//   description: "Books a new appointment for a doctor at a designated date and time.",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       patientName: { type: Type.STRING, description: "The full name of the patient." },
//       patientPhone: { type: Type.STRING, description: "The phone contact of the patient." },
//       doctorId: { type: Type.STRING, description: "The unique ID of the doctor (e.g. 'doc1')." },
//       date: { type: Type.STRING, description: "Appointment date in YYYY-MM-DD format (Current Year is 2026)." },
//       time: { type: Type.STRING, description: "Preferred hourly slot, e.g., '10:00 AM' or '04:30 PM'." },
//       reason: { type: Type.STRING, description: "Optional description of the medical symptoms or reason for visit." },
//     },
//     required: ["patientName", "patientPhone", "doctorId", "date", "time"],
//   },
// };

// const cancelAppointmentTool: FunctionDeclaration = {
//   name: "cancelAppointment",
//   description: "Cancels an existing appointment using its appointment ID.",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       appointmentId: { type: Type.STRING, description: "The ID of the appointment to cancel." },
//     },
//     required: ["appointmentId"],
//   },
// };

// const rescheduleAppointmentTool: FunctionDeclaration = {
//   name: "rescheduleAppointment",
//   description: "Reschedules an existing appointment to a new date and time slot.",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       appointmentId: { type: Type.STRING, description: "The ID of the existing appointment." },
//       newDate: { type: Type.STRING, description: "The new date in YYYY-MM-DD format." },
//       newTime: { type: Type.STRING, description: "The new time slot, e.g. '11:00 AM'." },
//     },
//     required: ["appointmentId", "newDate", "newTime"],
//   },
// };

// const getDoctorSlotsTool: FunctionDeclaration = {
//   name: "getDoctorSlots",
//   description: "Get available hourly slots for a specific doctor on a given date (formatted YYYY-MM-DD).",
//   parameters: {
//     type: Type.OBJECT,
//     properties: {
//       doctorId: { type: Type.STRING, description: "The unique ID of the doctor (e.g. '1', '3')." },
//       date: { type: Type.STRING, description: "The date of query in YYYY-MM-DD format (Current Year is 2026)." },
//     },
//     required: ["doctorId", "date"],
//   },
// };

// // -------------------------------------------------------------
// // 6. App Router Response Handler Method
// // -------------------------------------------------------------
// export async function POST(req: NextRequest) {
//   try {
//     const { message, history, userLanguageCode, patientId } = await req.json();

//     if (!message) {
//       return NextResponse.json({ error: "No message text provided" }, { status: 400 });
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
//       throw new Error("Missing GEMINI_API_KEY in Environment Settings");
//     }

//     // In-memory session store for appointments (key = patientId)
//     const sessionAppointments = new Map<string, any[]>();

//     // Dynamic Doctors Cache load from http://localhost:3000/api/doctors
//     let DOCTORS: Doctor[] = [];
//     try {
//       DOCTORS = await fetchDoctorsFromAPI();
//     } catch (e) {
//       console.warn("API load failed, falling back to disk", e);
//     }
//     if (!DOCTORS || DOCTORS.length === 0) {
//       DOCTORS = loadDoctors();
//     }

//     // Ensure each doctor has a 'name' field (combine firstName + lastName)
//     DOCTORS = DOCTORS.map((doc: any) => ({
//       ...doc,
//       name: `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || `Doctor ${doc.id}`,
//     }));

//     // System instructions (updated to use patientId, no phone number)
//     let systemInstruction = `You are "Aarogya Voice Assistant", an expert, friendly, compassionate, and highly professional multilingual medical receptionist.
// Your single goal is to help patients interact with our clinic which includes:
// - Find doctors by specialty, language, and clinical schedules.
// - Check current availability.
// - Book a new appointment.
// - Reschedule an existing appointment.
// - Cancel an existing appointment.

// Our doctors are stored in a database and you MUST call tools/functions to search them, query patient bookings, create appointments, cancel, or reschedule. DO NOT fake booking receipts or details! Real processes are wired into our tools.

// Key ResponsResponsibilities & Flow Control:
// 1. Speak natural, highly conversational, professional, concise, empathetic, and patient speech.
// 2. Auto-detect user language and speak in that exact tongue (English, Hindi, Kannada, Tulu, Tamil, Telugu, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, etc.).
// 3. If they switch languages (e.g. from English to Hindi or Kannada or Tulu or Marathi), immediately switch to that language yourself! Always match the user.
// 4. Limit yourself to asking EXACTLY ONE clear question at a time. Do NOT ask for multiple pieces of information at once! Let the patient feel they are talking to a human.
// 5. Translate time/date constraints natively (Current Year is 2026, and today's date is Thursday, June 4, 2026. Thus 'tomorrow' is '2026-06-05', 'this Friday' is '2026-06-05', etc.). Please map conversational times correctly.
// 6. Before bookings are completed, you MUST summarize and ask for patient's explicit verbal or typed confirmation! Say something like: "I am ready to book Dr. X (Specialty) on Date at Time for PatientName. Is this correct?" Once validated, trigger the bookAppointment tool.
// 7. For cancellation or rescheduling, call 'getPatientAppointments' (no arguments needed – it uses the logged‑in patient ID automatically). Then present the list with numbers (e.g., "1. Dr. X on date at time") and ask the user to reply with the number. When the user chooses, call 'cancelAppointment' or 'rescheduleAppointment' with the exact appointment ID from that list. Do NOT ask for phone number.

// Tone is strictly calm, comforting, humble, helpful, and concise (receptionist voice output will be read aloud, so do not write long markdown blocks or verbose bullet lists). Keep text flows clean and human.`;

//     if (userLanguageCode === "tu") {
//       systemInstruction += `\n\nCRITICAL LANGUAGE DIRECTIVE FOR TULU (tu):
// - The user has explicitly selected Tulu as their conversation language.
// - You MUST respond fully in the TULU language (NOT Kannada, NOT English).
// - Write Tulu using the Kannada script or phonetic Latin.
// - Examples of Tulu script vocabulary to strictly use:
//   * "ಆರೋಗ್ಯ ರಿಸೆಪ್ಷನ್ ಗೆ ಈರೆಗ್ ಎದ್ಕೊಣು ಉಲ್ಲೆ!" (Welcome to Aarogya Reception!)
//   * "ರೋಗಿದ ಪೂರ್ತಿ ಪುದರ್ ಪನ್ಪರಾ?" (Patient's full name please?)
//   * "ಮೊಬೈಲ್ ನಂಬರ್ ಪನ್ಲೆ ದಯಪಂದ್." (Please tell me your mobile number.)
//   * "ಬುಕ್ ಮಲ್ಪೆರೆ ರೆಡಿ ಉಲ್ಲೆರ್." (Ready to book.)
//   * "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾದ್ ರದ್ದಾತ್ಂಡ್." (Appointment cancelled successfully.)
//   * "ರೋಗ ಗುಣ ಆವಡ್ ಪಂದ್ ಹಾರೈಸುವೆ." (Wish you speedy recovery.)
//   * "ಪೊಸ ತಾರೀಕ್ ಬೊಕ್ಕ ಸಮಯ ಓವನ್ ಮಲ್ಪೊಡು ಪನ್ಲೆ." (Please tell me the new date and time.)
// - DO NOT use Kannada words like "ಬನ್ನಿ", "ನಿಮಗೆ", "ಹೇಗಿದ್ದೀರಾ", "ಮಾಡಿ", "ಹೆಸರು", "ಇದ್ದಾರೆ" in Tulu responses. Keep Tulu and Kannada completely separate!`;
//     } else if (userLanguageCode === "kn") {
//       systemInstruction += `\n\nCRITICAL LANGUAGE DIRECTIVE FOR KANNADA (kn):
// - The user has explicitly selected Kannada as their conversation language.
// - You MUST respond fully in the KANNADA language (NOT Tulu, NOT English).
// - Examples of Kannada script vocabulary:
//   * "ಆರೋಗ್ಯ ರಿಸೆಪ್ಷನ್ ಗೆ ಸ್ವಾಗತ!" (Welcome to Aarogya Reception!)
//   * "ರೋಗಿಯ ಪೂರ್ಣ ಹೆಸರನ್ನು ತಿಳಿಸುವಿರಾ?" (Patient's full name please?)
//   * "ನಿಮ್ಮ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನೀಡಿ." (Please tell me your 10-digit mobile number.)
//   * "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿದೆ." (Appointment successfully booked.)
//   * "ಶೀಘ್ರವಾಗಿ ಗುಣಮುಖರಾಗಲಿ ಎಂದು ಹಾರೈಸುತ್ತೇನೆ." (Wish you speedy recovery.)
// - Keep Tulu and Kannada completely separate!`;
//     } else if (userLanguageCode) {
//       systemInstruction += `\n\nUser explicit language preference has value code "${userLanguageCode}". Please respond in this language if appropriate.`;
//     }

//     const contents: any[] = [];
//     if (history && Array.isArray(history)) {
//       history.forEach((h: any) => {
//         contents.push({
//           role: h.sender === "user" ? "user" : "model",
//           parts: [{ text: h.text }],
//         });
//       });
//     }

//     contents.push({
//       role: "user",
//       parts: [{ text: message }],
//     });

//     // -------------------------------------------------------------
//     // FIRST TURN GEMINI CALL (with exponential retry and logging metrics)
//     // -------------------------------------------------------------
//     const startFirst = Date.now();
//     let response;
//     let firstCallSuccess = false;
//     let firstModelUsed = "gemini-3.5-flash";
//     let firstInputTokens = 0;
//     let firstOutputTokens = 0;
//     let firstErrorDetails = "";

//     try {
//       response = await generateContentWithFallback(ai, {
//         model: "gemini-3.5-flash",
//         contents,
//         config: {
//           systemInstruction,
//           tools: [
//             {
//               functionDeclarations: [
//                 getDoctorsTool,
//                 getPatientAppointmentsTool,
//                 bookAppointmentTool,
//                 cancelAppointmentTool,
//                 rescheduleAppointmentTool,
//                 getDoctorSlotsTool,
//               ],
//             },
//           ],
//         },
//       });
//       firstCallSuccess = true;
//       firstModelUsed = (response as any).modelUsed || "gemini-3.5-flash";
//       const usage = response.usageMetadata || {};
//       firstInputTokens = usage.promptTokenCount || usage.inputTokenCount || 0;
//       firstOutputTokens = usage.candidatesTokenCount || usage.outputTokenCount || 0;
//     } catch (err: any) {
//       firstErrorDetails = err.message || JSON.stringify(err);
//       throw err;
//     } finally {
//       const durationFirst = Date.now() - startFirst;
//       await logUsageExternal(
//         firstModelUsed,
//         firstInputTokens,
//         firstOutputTokens,
//         durationFirst,
//         firstCallSuccess ? "success" : "error",
//         firstErrorDetails || undefined
//       );
//     }

//     let responseText = response.text || "";
//     const functionCalls = response.functionCalls;
//     let toolResults: any[] = [];
//     let skipSecondTurn = false;   // Flag to bypass AI summarization for slots

//     if (functionCalls && functionCalls.length > 0) {
//       const functionResponseParts: any[] = [];

//       for (const call of functionCalls) {
//         const { name, args } = call;
//         let result: any = null;

//         if (name === "getDoctorsList") {
//           result = { doctors: DOCTORS };
//         } else if (name === "getPatientAppointments") {
//           // Use authenticated patientId from request body (no phone number needed)
//           if (!patientId) {
//             result = { error: "Patient not logged in. Please log in and try again." };
//           } else {
//             try {
//               const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
//               const url = `${baseUrl}/api/appointments/patient/${patientId}`;
//               const aptResponse = await fetch(url, {
//                 method: "GET",
//                 headers: {
//                   Cookie: req.headers.get("cookie") || "",
//                   Authorization: req.headers.get("authorization") || "",
//                 },
//               });
//               const data = await aptResponse.json();
//               if (aptResponse.ok && data.success) {
//                 const appointments = data.data || [];
//                 // Store in session
//                 sessionAppointments.set(patientId, appointments);
//                 result = { appointments };
//               } else {
//                 result = { error: data.message || "Failed to fetch appointments" };
//               }
//             } catch (err) {
//               console.error("❌ Failed to fetch appointments:", err);
//               result = { error: "Unable to fetch appointments at this time." };
//             }
//           }
//         } else if (name === "bookAppointment") {
//           const { patientName, patientPhone, doctorId, date, time, reason } = args as any;

//           function extractNumericId(rawId: string): string {
//             const match = rawId.match(/\d+/);
//             return match ? match[0] : rawId;
//           }
//           const normalizedDoctorId = extractNumericId(String(doctorId));

//           let time24 = time;
//           if (time.includes("PM") && !time.startsWith("12")) {
//             const hour = parseInt(time.split(":")[0]) + 12;
//             time24 = `${hour}:${time.split(":")[1].split(" ")[0]}`;
//           } else if (time.includes("AM") && time.startsWith("12")) {
//             time24 = `00:${time.split(":")[1].split(" ")[0]}`;
//           } else {
//             time24 = time.split(" ")[0];
//           }

//           const createResult = await createAppointmentViaAPI(
//             req,
//             normalizedDoctorId,
//             patientId,
//             date,
//             time24,
//             reason || "in-person",
//           );

//           if (createResult.success) {
//             result = {
//               success: true,
//               appointment: createResult.data.appointment || createResult.data,
//             };
//           } else {
//             result = {
//               error: createResult.data?.message || "Failed to book appointment",
//             };
//           }
//         } else if (name === "cancelAppointment") {
//           let { appointmentId } = args as any;
//           // If user provided a number (e.g., "2") instead of UUID, resolve it
//           if (appointmentId && !appointmentId.includes('-')) {
//             const storedApts = sessionAppointments.get(patientId) || [];
//             const idx = parseInt(appointmentId) - 1;
//             if (storedApts[idx]) {
//               appointmentId = storedApts[idx].id;
//             } else {
//               result = { error: "Invalid appointment number. Please choose a number from the list." };
//               skipSecondTurn = true;
//               responseText = "Invalid selection. Please reply with the number of the appointment you want to cancel.";
//               break;
//             }
//           }
//           if (!appointmentId) {
//             result = { error: "Appointment ID is required" };
//           } else {
//             try {
//               const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
//               const url = `${baseUrl}/api/appointments/${appointmentId}`;
//               const cancelResponse = await fetch(url, {
//                 method: "PUT",
//                 headers: {
//                   "Content-Type": "application/json",
//                   Cookie: req.headers.get("cookie") || "",
//                   Authorization: req.headers.get("authorization") || "",
//                 },
//                 body: JSON.stringify({ status: "CANCELLED" }),
//               });
//               const data = await cancelResponse.json();
//               if (cancelResponse.ok && data.success) {
//                 result = { success: true, appointment: data.data };
//               } else {
//                 result = { error: data.message || "Failed to cancel appointment" };
//               }
//             } catch (err) {
//               console.error("❌ Failed to cancel appointment:", err);
//               result = { error: "Unable to cancel appointment at this time." };
//             }
//           }
//         } else if (name === "rescheduleAppointment") {
//           let { appointmentId, newDate, newTime } = args as any;
//           // If user provided a number, resolve to actual ID
//           if (appointmentId && !appointmentId.includes('-')) {
//             const storedApts = sessionAppointments.get(patientId) || [];
//             const idx = parseInt(appointmentId) - 1;
//             if (storedApts[idx]) {
//               appointmentId = storedApts[idx].id;
//             } else {
//               result = { error: "Invalid appointment number. Please choose a number from the list." };
//               skipSecondTurn = true;
//               responseText = "Invalid selection. Please reply with the number of the appointment you want to reschedule.";
//               break;
//             }
//           }
//           if (!appointmentId) {
//             result = { error: "Appointment ID is required" };
//           } else if (!newDate || !newTime) {
//             result = { error: "New date and time are required." };
//           } else {
//             try {
//               const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
//               const url = `${baseUrl}/api/appointments/${appointmentId}`;
//               const payload = {
//                 appointment_date: newDate,
//                 appointment_time: newTime,
//               };
//               const rescheduleResponse = await fetch(url, {
//                 method: "PUT",
//                 headers: {
//                   "Content-Type": "application/json",
//                   Cookie: req.headers.get("cookie") || "",
//                   Authorization: req.headers.get("authorization") || "",
//                 },
//                 body: JSON.stringify(payload),
//               });
//               const data = await rescheduleResponse.json();
//               if (rescheduleResponse.ok && data.success) {
//                 result = { success: true, appointment: data.data };
//               } else {
//                 result = { error: data.message || "Failed to reschedule appointment" };
//               }
//             } catch (err) {
//               console.error("❌ Failed to reschedule appointment:", err);
//               result = { error: "Unable to reschedule appointment at this time." };
//             }
//           }
//         } else if (name === "getDoctorSlots") {
//           const { doctorId, date } = args as any;

//           function extractNumericId(rawId: string): string {
//             const match = rawId.match(/\d+/);
//             return match ? match[0] : rawId;
//           }

//           const normalizedDoctorId = extractNumericId(String(doctorId));
//           console.log("🔍 getDoctorSlots called with:", {
//             original: doctorId,
//             normalized: normalizedDoctorId,
//             date,
//           });

//           const slotsResponse = await fetchDoctorSlots(req, normalizedDoctorId, date);
//           console.log("📡 Slot API response:", slotsResponse);

//           if (slotsResponse.success) {
//             const doc = DOCTORS.find((d) => d.id === normalizedDoctorId);
//             const docName = doc?.name || `Doctor ${normalizedDoctorId}`;
//             const slots = slotsResponse.slots || [];

//             if (slots.length > 0) {
//               const slotsStr = slots.join(", ");
//               responseText = `📅 Available slots for Dr. ${docName} on ${date}: ${slotsStr}. Which timing would you prefer?`;
//               result = {
//                 success: true,
//                 doctorId: normalizedDoctorId,
//                 date,
//                 slots,
//               };
//             } else {
//               // No slots available – give clear message
//               responseText = `❌ Dr. ${docName} has **no available slots** on ${date}. The doctor may be off that day. Please try another date or a different doctor.`;
//               result = {
//                 success: false,
//                 error: "No slots available",
//                 doctorId: normalizedDoctorId,
//                 date,
//                 slots: [],
//               };
//             }
//             skipSecondTurn = true;   // Skip the second AI call
//           } else {
//             result = { error: slotsResponse.message || "Failed to fetch slots" };
//           }
//         }

//         toolResults.push({ name, result });
//         functionResponseParts.push({
//           functionResponse: {
//             name,
//             response: result,
//           },
//         });
//       }

//       // Conditionally execute second AI turn only if we didn't produce a final response
//       if (!skipSecondTurn) {
//         const modelTurn = response.candidates?.[0]?.content;
//         const userTurn = {
//           role: "user",
//           parts: functionResponseParts,
//         };

//         const secondTurnContents = [...contents, modelTurn, userTurn];

//         // -------------------------------------------------------------
//         // SECOND TURN GEMINI CALL (with exponential retry and logging metrics)
//         // -------------------------------------------------------------
//         const startSecond = Date.now();
//         let secondResponse;
//         let secondCallSuccess = false;
//         let secondModelUsed = "gemini-3.5-flash";
//         let secondInputTokens = 0;
//         let secondOutputTokens = 0;
//         let secondErrorDetails = "";

//         try {
//           secondResponse = await generateContentWithFallback(ai, {
//             model: "gemini-3.5-flash",
//             contents: secondTurnContents,
//             config: {
//               systemInstruction,
//               tools: [
//                 {
//                   functionDeclarations: [
//                     getDoctorsTool,
//                     getPatientAppointmentsTool,
//                     bookAppointmentTool,
//                     cancelAppointmentTool,
//                     rescheduleAppointmentTool,
//                     getDoctorSlotsTool,
//                   ],
//                 },
//               ],
//             },
//           });
//           secondCallSuccess = true;
//           secondModelUsed = (secondResponse as any).modelUsed || "gemini-3.5-flash";
//           const usage = secondResponse.usageMetadata || {};
//           secondInputTokens = usage.promptTokenCount || usage.inputTokenCount || 0;
//           secondOutputTokens = usage.candidatesTokenCount || usage.outputTokenCount || 0;
//         } catch (err: any) {
//           secondErrorDetails = err.message || JSON.stringify(err);
//           throw err;
//         } finally {
//           const durationSecond = Date.now() - startSecond;
//           await logUsageExternal(
//             secondModelUsed,
//             secondInputTokens,
//             secondOutputTokens,
//             durationSecond,
//             secondCallSuccess ? "success" : "error",
//             secondErrorDetails || undefined
//           );
//         }

//         responseText = secondResponse.text || "";
//       }

//       // Defensive UI Fallback: If Gemini returned empty or generic text, construct localized response
//       if (!responseText || responseText.trim() === "Execution complete.") {
//         console.log("⚠️ Next.js: Second turn returned empty or generic text. Activating fallback...");

//         // 1. Availability checking fallback
//         const slotResult = toolResults.find((t) => t.name === "getDoctorSlots")?.result;
//         if (slotResult && slotResult.success && slotResult.slots?.length > 0) {
//           const { doctorId, date, slots } = slotResult;
//           const doc = DOCTORS.find((d) => d.id === String(doctorId));
//           const docName = doc ? doc.name : `Dr. Doctor (ID: ${doctorId})`;
//           const slotsStr = slots.join(", ");
//           responseText = `Here are the available slots for ${docName} on ${date}: ${slotsStr}. Which timing would you prefer?`;
//         } else if (slotResult && slotResult.success === false && slotResult.error === "No slots available") {
//           const docName = slotResult.doctorId ? `Dr. ${DOCTORS.find(d => d.id === String(slotResult.doctorId))?.name || slotResult.doctorId}` : "the doctor";
//           responseText = `❌ ${docName} has **no available slots** on ${slotResult.date}. The doctor may be off that day. Please try another date or a different doctor.`;
//         }

//         // 2. Doctor Search / Find fallback
//         const doctorsResult = toolResults.find((t) => t.name === "getDoctorsList")?.result;
//         if (!responseText && doctorsResult && doctorsResult.doctors) {
//           const docNames = doctorsResult.doctors.map((d: any) => `${d.name} (${d.specialty})`).join(", ");
//           if (userLanguageCode === "tu") {
//             responseText = `ನಮ್ಮ ಆಸ್ಪತ್ರೆಡ್ ಇತ್ತೆ ಉಪ್ಪುನ ವೈದ್ಯರುಲು ಇಂಚ ಉಲ್ಲೆರ್: ${docNames}. ಈರೆಗ್ ಒವ್ವೇ ವೈದ್ಯರೆನ್ ಸಂಪರ್ಕ ಮಲ್ಪೊಡು ಪನ್ಲೆ?`;
//           } else if (userLanguageCode === "kn") {
//             responseText = `ನಮ್ಮ ಕ್ಲಿನಿಕ್‌ನಲ್ಲಿ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ವೈದ್ಯರುಗಳು ಹೀಗಿದ್ದಾರೆ: ${docNames}. ನಿಮಗೆ ಯಾರನ್ನು ಸಂಪರ್ಕಿಸಲು ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬೇಕು ಎಂದು ತಿಳಿಸಿ.`;
//           } else if (userLanguageCode === "hi") {
//             responseText = `हमारे क्लिनिक में उपलब्ध डॉक्टर इस प्रकार हैं: ${docNames}। आप किस डॉक्टर से अपॉइंटमेंट लेना चाहेंगे?`;
//           } else {
//             responseText = `We have the following doctors available in our clinic: ${docNames}. Whom would you like to consult?`;
//           }
//         }

//         // 3. Appointment Booking fallback
//         const bookResult = toolResults.find((t) => t.name === "bookAppointment")?.result;
//         if (!responseText && bookResult && bookResult.success) {
//           const apt = bookResult.appointment;
//           if (userLanguageCode === "tu") {
//             responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರೆಗ್ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾದ್ ಬುಕ್ ಆಂಡ್! ತಾರೀಕ್: ${apt.date}, ಸಮಯ: ${apt.time}, ರೋಗಿದ ಪುದರ್: ${apt.patientName}. ಆರೋಗ್ಯ ಶೀಘ್ರವಾಗಿ ಗುಣ ಆವಡ್ ಪಂದ್ ಹಾರೈಸುವೆ.`;
//           } else if (userLanguageCode === "kn") {
//             responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರವರೊಂದಿಗೆ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಬುಕ್ ಆಗಿದೆ! ದಿನಾಂಕ: ${apt.date}, ಸಮಯ: ${apt.time}, ರೋಗಿಯ ಹೆಸರು: ${apt.patientName}. ಶೀಘ್ರವಾಗಿ ಗುಣಮುಖರಾಗಲಿ ಎಂದು ಹಾರೈಸುತ್ತೇನೆ.`;
//           } else if (userLanguageCode === "hi") {
//             responseText = `डॉ. ${apt.doctorName} के साथ आपका अपॉइंटमेंट सफलतापूर्वक बुक हो गया है! दिनांक: ${apt.date}, समय: ${apt.time}, मरीज: ${apt.patientName}। आपके शीघ्र स्वस्थ होने की कामना करते हैं।`;
//           } else {
//             responseText = `Your appointment has been successfully booked with Dr. ${apt.doctorName} on ${apt.date} at ${apt.time} for the patient ${apt.patientName}. Wishing you a speedy recovery!`;
//           }
//         }

//         // 4. Cancellation fallback
//         const cancelResult = toolResults.find((t) => t.name === "cancelAppointment")?.result;
//         if (!responseText && cancelResult && cancelResult.success) {
//           const apt = cancelResult.appointment;
//           if (userLanguageCode === "tu") {
//             responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರೆಗ್ ಇತ್ತಿನ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾದ್ ರದ್ದಾತ್ಂಡ್. ತಾರೀಕ್: ${apt.date}, ಸಮಯ: ${apt.time}.`;
//           } else if (userLanguageCode === "kn") {
//             responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರೊಂದಿಗಿನ ನಿಮ್ಮ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ರದ್ದಾಗಿದೆ. ದಿನಾಂಕ: ${apt.date}, ಸಮಯ: ${apt.time}.`;
//           } else if (userLanguageCode === "hi") {
//             responseText = `डॉ. ${apt.doctorName} के साथ आपका अपॉइंटमेंट सफलतापूर्वक रद्द कर दिया गया है। दिनांक: ${apt.date}, समय: ${apt.time}।`;
//           } else {
//             responseText = `Your appointment with Dr. ${apt.doctorName} on ${apt.date} at ${apt.time} has been successfully cancelled.`;
//           }
//         }

//         // 5. Rescheduling fallback
//         const rescheduleResult = toolResults.find((t) => t.name === "rescheduleAppointment")?.result;
//         if (!responseText && rescheduleResult && rescheduleResult.success) {
//           const apt = rescheduleResult.appointment;
//           if (userLanguageCode === "tu") {
//             responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರೆಗ್ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾದ್ ರದ್ದಾದ್ ಬೊಕ್ಕ ಪೊಸ ಸಮಯೊಗು ಬದಲಾತ್ಂಡ್. ಪೊಸ ತಾರೀಕ್: ${apt.date}, ಪೊಸ ಸಮಯ: ${apt.time}.`;
//           } else if (userLanguageCode === "kn") {
//             responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರೊಂದಿಗಿನ ನಿಮ್ಮ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಮರುನಿಗದಿಗೊಳಿಸಲಾಗಿದೆ. ಹೊಸ ದಿನಾಂಕ: ${apt.date}, ಹೊಸ ಸಮಯ: ${apt.time}.`;
//           } else if (userLanguageCode === "hi") {
//             responseText = `डॉ. ${apt.doctorName} के साथ आपका अपॉइंटमेंट सफलतापूर्वक ಮರುನಿಗದಿಗೊಳಿಸಿದೆ। नया दिनांक: ${apt.date}, नया समय: ${apt.time}।`;
//           } else {
//             responseText = `Your appointment with Dr. ${apt.doctorName} has been successfully rescheduled to ${apt.date} at ${apt.time}.`;
//           }
//         }

//         // 6. Get Patient Appointments list fallback – show with numbers
//         const aptsResult = toolResults.find((t) => t.name === "getPatientAppointments")?.result;
//         if (!responseText && aptsResult) {
//           if (aptsResult.error) {
//             responseText = aptsResult.error;
//           } else if (!aptsResult.appointments || aptsResult.appointments.length === 0) {
//             responseText = "You have no upcoming appointments. Would you like to book one?";
//           } else {
//             const aptList = aptsResult.appointments;
//             // Store in session again (ensure it's there)
//             sessionAppointments.set(patientId, aptList);
//             const listStr = aptList
//               .map((a: any, idx: number) => `${idx+1}. Dr. ${a.doctorName || a.doctor_name || `Doctor (ID: ${a.doctorId || a.doctor_id})`} on ${a.date || a.appointment_date} at ${a.time || a.appointment_time}`)
//               .join("\n");
//             responseText = `Please choose the appointment by number:\n\n${listStr}\n\nWhich one would you like to cancel or reschedule?`;
//           }
//         }

//         if (!responseText) {
//           responseText = "Execution complete.";
//         }
//       }
//     }

//     return NextResponse.json({
//       text: responseText,
//       toolResults,
//       isSimulated: false,
//       lang: getLangCode(responseText, userLanguageCode),
//     });
//   } catch (error: any) {
//     console.error("Gemini API error in Next.js router:", error.message || error);
//     return NextResponse.json({ error: error.message || "Failed to process chat query" }, { status: 500 });
//   }
// }

// // -------------------------------------------------------------
// // 7. Helper Functions
// // -------------------------------------------------------------
// export async function fetchDoctorsFromAPI(): Promise<Doctor[]> {
//   try {
//     const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/doctors`, {
//       cache: "no-store",
//     });
//     const data = await response.json();
//     return data.success ? data.data : data.doctors || [];
//   } catch (error) {
//     console.error("❌ Failed to fetch doctors from API:", error);
//     return [];
//   }
// }

// export async function fetchDoctorSlots(request: NextRequest, doctorId: number | string, date: string) {
//   try {
//     const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
//     const url = `${baseUrl}/api/doctors-appoitment/${doctorId}/slots?date=${date}`;
//     console.log("🌍 SLOT URL:", url);

//     const response = await fetch(url, {
//       method: "GET",
//       cache: "no-store",
//       headers: {
//         Cookie: request.headers.get("cookie") || "",
//         Authorization: request.headers.get("authorization") || "",
//         "Content-Type": "application/json",
//       },
//     });

//     console.log("📡 Response status:", response.status, response.statusText);
//     const data = await response.json();
//     console.log("🕒 SLOT API RESPONSE:", JSON.stringify(data, null, 2));
//     return data;
//   } catch (error) {
//     console.error("❌ Failed to fetch slots:", error);
//     return { success: false, slots: [], error: error.message };
//   }
// }

// async function createAppointmentViaAPI(
//   request: NextRequest,
//   doctorId: string,
//   patientId: string,
//   date: string,
//   time: string,
//   consultationType: string = "in-person",
// ) {
//   try {
//     const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
//     const url = `${baseUrl}/api/appointments/patient`;

//     const payload = {
//       doctor_id: doctorId,
//       patient_id: patientId,
//       appointment_date: date,
//       appointment_time: time,
//       consultation_type: consultationType,
//       notes: "Booked via AI Assistant",
//     };

//     console.log("📤 Creating appointment via API:", payload);

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Cookie: request.headers.get("cookie") || "",
//         Authorization: request.headers.get("authorization") || "",
//       },
//       body: JSON.stringify(payload),
//     });

//     const data = await response.json();
//     console.log("✅ API response:", data);

//     return { success: response.ok, data };
//   } catch (error) {
//     console.error("❌ API call failed:", error);
//     return { success: false, data: { message: error.message } };
//   }
// }





// app/api/patient/ai-appoitment/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// -------------------------------------------------------------
// 1. Database Type Declarations (unchanged)
// -------------------------------------------------------------
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  timings: string;
  languages: string[];
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  reason: string;
  status: "booked" | "cancelled";
  createdAt: string;
}

// -------------------------------------------------------------
// 2. Persistent Storage Paths & Helpers (unchanged)
// -------------------------------------------------------------
const DB_FILE = path.join(process.cwd(), "appointments-db.json");
const DOCTORS_FILE = path.join(process.cwd(), "doctors-db.json");

function loadDoctors(): Doctor[] {
  try {
    if (fs.existsSync(DOCTORS_FILE)) {
      const data = fs.readFileSync(DOCTORS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading doctors database file:", error);
  }
  return [];
}

function loadAppointments(): Appointment[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading database file:", error);
  }
  return [];
}

function saveAppointments(appointments: Appointment[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(appointments, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// -------------------------------------------------------------
// 3. Billing Helpers (NEW – Render integration)
// -------------------------------------------------------------
const BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

/**
 * Fetch the active Gemini API key from the billing server.
 */
async function fetchActiveApiKey(): Promise<string> {
  const res = await fetch(BILLING_URL);
  if (!res.ok) throw new Error(`Billing server error: ${res.status}`);
  const data = await res.json();
  const key = data.apiKey || data.customApiKey || data.token;
  if (!key) throw new Error("No API key returned from billing server");
  return key;
}

/**
 * Send token usage telemetry to the billing server.
 */
async function sendTelemetry(
  activeToken: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  responseTimeMs: number,
  status: "success" | "error",
  errorDetails?: string
) {
  try {
    await fetch(TELEMETRY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${activeToken}`,
      },
      body: JSON.stringify({
        projectName: "Aarogya Voice Assistant (Patient)",
        model,
        inputTokens,
        outputTokens,
        responseTimeMs,
        status,
        errorDetails,
        userRole: "patient",
      }),
    });
  } catch (err) {
    console.error("Telemetry send failed:", err);
  }
}

/**
 * Executes a function with backoff recovery for transient errors (503, 429).
 */
async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  let lastError: any = null;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err.message || "").toLowerCase();
      const errStatus = Number(err.status) || 0;
      const isTransient =
        errStatus === 503 ||
        errStatus === 429 ||
        errMsg.includes("503") ||
        errMsg.includes("unavailable") ||
        errMsg.includes("429") ||
        errMsg.includes("resource_exhausted") ||
        errMsg.includes("rate limit") ||
        errMsg.includes("overloaded") ||
        errMsg.includes("high demand");

      if (isTransient && i < retries - 1) {
        console.warn(`[Gemini] Transient error, retrying in ${delay}ms: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

// -------------------------------------------------------------
// 4. Gemini API Helpers (uses dynamic client, no static instance)
// -------------------------------------------------------------
async function generateContentWithFallback(aiClient: any, params: any) {
  const modelsToTry = [
    params.model || "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini] Attempting with model: ${modelName}`);
      const updatedParams = { ...params, model: modelName };

      const response = await fetchWithRetry(async () => {
        return await aiClient.models.generateContent(updatedParams);
      }, 3, 1000);

      console.log(`[Gemini] Success with model: ${modelName}`);
      (response as any).modelUsed = modelName;
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini] Model ${modelName} failed: ${err.message}. Trying next...`);
    }
  }
  throw lastError;
}

function getLangCode(text: string, userLangCode?: string): string {
  const lower = text.toLowerCase();
  if (userLangCode === "tu") return "tu";
  if (userLangCode === "kn") return "kn";

  const hasKannadaScript = /[\u0c80-\u0cff]/.test(text);
  if (hasKannadaScript || lower.includes("tulu") || lower.includes("ತುಳು")) return "tu";
  if (lower.includes("beku") || lower.includes("naale") || lower.includes("hesaru")) return "kn";
  if (/[\u0900-\u097f]/.test(text) || lower.includes("mujhe") || lower.includes("chahiye")) return "hi";
  return "en";
}

// -------------------------------------------------------------
// 5. Gemini Function Declarations (unchanged)
// -------------------------------------------------------------
const getDoctorsTool: FunctionDeclaration = {
  name: "getDoctorsList",
  description: "Get the full list of doctors, their specialties, location, timings, and spoken languages.",
  parameters: { type: Type.OBJECT, properties: {} },
};

const getPatientAppointmentsTool: FunctionDeclaration = {
  name: "getPatientAppointments",
  description: "Retrieve all active or historic appointments associated with the logged‑in patient (uses patientId from request, no need to ask for phone number).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientPhone: { type: Type.STRING, description: "Optional – ignored; the system uses the authenticated patient ID." },
    },
  },
};

const bookAppointmentTool: FunctionDeclaration = {
  name: "bookAppointment",
  description: "Books a new appointment for a doctor at a designated date and time.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientName: { type: Type.STRING, description: "The full name of the patient." },
      patientPhone: { type: Type.STRING, description: "The phone contact of the patient." },
      doctorId: { type: Type.STRING, description: "The unique ID of the doctor (e.g. 'doc1')." },
      date: { type: Type.STRING, description: "Appointment date in YYYY-MM-DD format (Current Year is 2026)." },
      time: { type: Type.STRING, description: "Preferred hourly slot, e.g., '10:00 AM' or '04:30 PM'." },
      reason: { type: Type.STRING, description: "Optional description of the medical symptoms or reason for visit." },
    },
    required: ["patientName", "patientPhone", "doctorId", "date", "time"],
  },
};

const cancelAppointmentTool: FunctionDeclaration = {
  name: "cancelAppointment",
  description: "Cancels an existing appointment using its appointment ID.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      appointmentId: { type: Type.STRING, description: "The ID of the appointment to cancel." },
    },
    required: ["appointmentId"],
  },
};

const rescheduleAppointmentTool: FunctionDeclaration = {
  name: "rescheduleAppointment",
  description: "Reschedules an existing appointment to a new date and time slot.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      appointmentId: { type: Type.STRING, description: "The ID of the existing appointment." },
      newDate: { type: Type.STRING, description: "The new date in YYYY-MM-DD format." },
      newTime: { type: Type.STRING, description: "The new time slot, e.g. '11:00 AM'." },
    },
    required: ["appointmentId", "newDate", "newTime"],
  },
};

const getDoctorSlotsTool: FunctionDeclaration = {
  name: "getDoctorSlots",
  description: "Get available hourly slots for a specific doctor on a given date (formatted YYYY-MM-DD).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      doctorId: { type: Type.STRING, description: "The unique ID of the doctor (e.g. '1', '3')." },
      date: { type: Type.STRING, description: "The date of query in YYYY-MM-DD format (Current Year is 2026)." },
    },
    required: ["doctorId", "date"],
  },
};

// -------------------------------------------------------------
// 6. Main Route Handler (UPDATED with dynamic billing)
// -------------------------------------------------------------
export async function POST(req: NextRequest) {
  let activeToken = "";
  let firstStart = 0,
    secondStart = 0;

  try {
    const { message, history, userLanguageCode, patientId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message text provided" }, { status: 400 });
    }

    // 1. Fetch Gemini API key from Render billing server
    activeToken = await fetchActiveApiKey();

    // 2. Create Gemini client dynamically (per request)
    const aiClient = new GoogleGenAI({
      apiKey: activeToken,
      httpOptions: { headers: { "User-Agent": "aistudio-patient-assistant" } },
    });

    // In-memory session store for appointments (key = patientId)
    const sessionAppointments = new Map<string, any[]>();

    // Dynamic Doctors Cache load from http://localhost:3000/api/doctors
    let DOCTORS: Doctor[] = [];
    try {
      DOCTORS = await fetchDoctorsFromAPI();
    } catch (e) {
      console.warn("API load failed, falling back to disk", e);
    }
    if (!DOCTORS || DOCTORS.length === 0) {
      DOCTORS = loadDoctors();
    }

    // Ensure each doctor has a 'name' field (combine firstName + lastName)
    DOCTORS = DOCTORS.map((doc: any) => ({
      ...doc,
      name: `${doc.firstName || ""} ${doc.lastName || ""}`.trim() || `Doctor ${doc.id}`,
    }));

    // System instructions (unchanged)
    let systemInstruction = `You are "Aarogya Voice Assistant", an expert, friendly, compassionate, and highly professional multilingual medical receptionist.
Your single goal is to help patients interact with our clinic which includes:
- Find doctors by specialty, language, and clinical schedules.
- Check current availability.
- Book a new appointment.
- Reschedule an existing appointment.
- Cancel an existing appointment.

Our doctors are stored in a database and you MUST call tools/functions to search them, query patient bookings, create appointments, cancel, or reschedule. DO NOT fake booking receipts or details! Real processes are wired into our tools.

Key Responsibilities & Flow Control:
1. Speak natural, highly conversational, professional, concise, empathetic, and patient speech.
2. Auto-detect user language and speak in that exact tongue (English, Hindi, Kannada, Tulu, Tamil, Telugu, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, etc.).
3. If they switch languages, immediately switch to that language yourself! Always match the user.
4. Limit yourself to asking EXACTLY ONE clear question at a time. Do NOT ask for multiple pieces of information at once! Let the patient feel they are talking to a human.
5. Translate time/date constraints natively (Current Year is 2026, today's date is June 15, 2026. 'tomorrow' is '2026-06-16', 'this Friday' is '2026-06-19', etc.). Map conversational times correctly.
6. Before bookings are completed, you MUST summarize and ask for patient's explicit verbal or typed confirmation! Say something like: "I am ready to book Dr. X (Specialty) on Date at Time for PatientName. Is this correct?" Once validated, trigger the bookAppointment tool.
7. For cancellation or rescheduling, call 'getPatientAppointments' (no arguments needed – it uses the logged‑in patient ID automatically). Then present the list with numbers (e.g., "1. Dr. X on date at time") and ask the user to reply with the number. When the user chooses, call 'cancelAppointment' or 'rescheduleAppointment' with the exact appointment ID from that list. Do NOT ask for phone number.

Tone is strictly calm, comforting, humble, helpful, and concise (receptionist voice output will be read aloud, so do not write long markdown blocks or verbose bullet lists). Keep text flows clean and human.`;

    if (userLanguageCode === "tu") {
      systemInstruction += `\n\nCRITICAL LANGUAGE DIRECTIVE FOR TULU (tu):
- You MUST respond fully in TULU language (NOT Kannada, NOT English).
- Write Tulu using the Kannada script or phonetic Latin.
- DO NOT use Kannada words like "ಬನ್ನಿ", "ನಿಮಗೆ", "ಹೇಗಿದ್ದೀರಾ", etc. Keep Tulu and Kannada separate.`;
    } else if (userLanguageCode === "kn") {
      systemInstruction += `\n\nCRITICAL LANGUAGE DIRECTIVE FOR KANNADA (kn):
- You MUST respond fully in KANNADA language (NOT Tulu, NOT English).`;
    } else if (userLanguageCode) {
      systemInstruction += `\n\nUser explicit language preference is "${userLanguageCode}". Respond in that language if appropriate.`;
    }

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        });
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // ========== FIRST TURN GEMINI CALL ==========
    firstStart = Date.now();
    let response;
    let firstCallSuccess = false;
    let firstModelUsed = "gemini-3.5-flash";
    let firstInputTokens = 0,
      firstOutputTokens = 0;
    let firstErrorDetails = "";

    try {
      response = await generateContentWithFallback(aiClient, {
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          tools: [
            {
              functionDeclarations: [
                getDoctorsTool,
                getPatientAppointmentsTool,
                bookAppointmentTool,
                cancelAppointmentTool,
                rescheduleAppointmentTool,
                getDoctorSlotsTool,
              ],
            },
          ],
        },
      });
      firstCallSuccess = true;
      firstModelUsed = (response as any).modelUsed || "gemini-3.5-flash";
      const usage = response.usageMetadata || {};
      firstInputTokens = usage.promptTokenCount || usage.inputTokenCount || 0;
      firstOutputTokens = usage.candidatesTokenCount || usage.outputTokenCount || 0;
    } catch (err: any) {
      firstErrorDetails = err.message || JSON.stringify(err);
      throw err;
    } finally {
      const durationFirst = Date.now() - firstStart;
      await sendTelemetry(
        activeToken,
        firstModelUsed,
        firstInputTokens,
        firstOutputTokens,
        durationFirst,
        firstCallSuccess ? "success" : "error",
        firstErrorDetails
      );
    }

    let responseText = response.text || "";
    const functionCalls = response.functionCalls;
    let toolResults: any[] = [];
    let skipSecondTurn = false;

    if (functionCalls && functionCalls.length > 0) {
      const functionResponseParts: any[] = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        let result: any = null;

        if (name === "getDoctorsList") {
          result = { doctors: DOCTORS };
        } else if (name === "getPatientAppointments") {
          if (!patientId) {
            result = { error: "Patient not logged in. Please log in and try again." };
          } else {
            try {
              const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
              const url = `${baseUrl}/api/appointments/patient/${patientId}`;
              const aptResponse = await fetch(url, {
                method: "GET",
                headers: {
                  Cookie: req.headers.get("cookie") || "",
                  Authorization: req.headers.get("authorization") || "",
                },
              });
              const data = await aptResponse.json();
              if (aptResponse.ok && data.success) {
                const appointments = data.data || [];
                sessionAppointments.set(patientId, appointments);
                result = { appointments };
              } else {
                result = { error: data.message || "Failed to fetch appointments" };
              }
            } catch (err) {
              console.error("❌ Failed to fetch appointments:", err);
              result = { error: "Unable to fetch appointments at this time." };
            }
          }
        } else if (name === "bookAppointment") {
          const { patientName, patientPhone, doctorId, date, time, reason } = args as any;

          function extractNumericId(rawId: string): string {
            const match = rawId.match(/\d+/);
            return match ? match[0] : rawId;
          }
          const normalizedDoctorId = extractNumericId(String(doctorId));

          let time24 = time;
          if (time.includes("PM") && !time.startsWith("12")) {
            const hour = parseInt(time.split(":")[0]) + 12;
            time24 = `${hour}:${time.split(":")[1].split(" ")[0]}`;
          } else if (time.includes("AM") && time.startsWith("12")) {
            time24 = `00:${time.split(":")[1].split(" ")[0]}`;
          } else {
            time24 = time.split(" ")[0];
          }

          const createResult = await createAppointmentViaAPI(
            req,
            normalizedDoctorId,
            patientId,
            date,
            time24,
            reason || "in-person"
          );

          if (createResult.success) {
            result = {
              success: true,
              appointment: createResult.data.appointment || createResult.data,
            };
          } else {
            result = {
              error: createResult.data?.message || "Failed to book appointment",
            };
          }
        } else if (name === "cancelAppointment") {
          let { appointmentId } = args as any;
          if (appointmentId && !appointmentId.includes("-")) {
            const storedApts = sessionAppointments.get(patientId) || [];
            const idx = parseInt(appointmentId) - 1;
            if (storedApts[idx]) {
              appointmentId = storedApts[idx].id;
            } else {
              result = { error: "Invalid appointment number. Please choose a number from the list." };
              skipSecondTurn = true;
              responseText = "Invalid selection. Please reply with the number of the appointment you want to cancel.";
              break;
            }
          }
          if (!appointmentId) {
            result = { error: "Appointment ID is required" };
          } else {
            try {
              const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
              const url = `${baseUrl}/api/appointments/${appointmentId}`;
              const cancelResponse = await fetch(url, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Cookie: req.headers.get("cookie") || "",
                  Authorization: req.headers.get("authorization") || "",
                },
                body: JSON.stringify({ status: "CANCELLED" }),
              });
              const data = await cancelResponse.json();
              if (cancelResponse.ok && data.success) {
                result = { success: true, appointment: data.data };
              } else {
                result = { error: data.message || "Failed to cancel appointment" };
              }
            } catch (err) {
              console.error("❌ Failed to cancel appointment:", err);
              result = { error: "Unable to cancel appointment at this time." };
            }
          }
        } else if (name === "rescheduleAppointment") {
          let { appointmentId, newDate, newTime } = args as any;
          if (appointmentId && !appointmentId.includes("-")) {
            const storedApts = sessionAppointments.get(patientId) || [];
            const idx = parseInt(appointmentId) - 1;
            if (storedApts[idx]) {
              appointmentId = storedApts[idx].id;
            } else {
              result = { error: "Invalid appointment number. Please choose a number from the list." };
              skipSecondTurn = true;
              responseText = "Invalid selection. Please reply with the number of the appointment you want to reschedule.";
              break;
            }
          }
          if (!appointmentId) {
            result = { error: "Appointment ID is required" };
          } else if (!newDate || !newTime) {
            result = { error: "New date and time are required." };
          } else {
            try {
              const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
              const url = `${baseUrl}/api/appointments/${appointmentId}`;
              const payload = {
                appointment_date: newDate,
                appointment_time: newTime,
              };
              const rescheduleResponse = await fetch(url, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Cookie: req.headers.get("cookie") || "",
                  Authorization: req.headers.get("authorization") || "",
                },
                body: JSON.stringify(payload),
              });
              const data = await rescheduleResponse.json();
              if (rescheduleResponse.ok && data.success) {
                result = { success: true, appointment: data.data };
              } else {
                result = { error: data.message || "Failed to reschedule appointment" };
              }
            } catch (err) {
              console.error("❌ Failed to reschedule appointment:", err);
              result = { error: "Unable to reschedule appointment at this time." };
            }
          }
        } else if (name === "getDoctorSlots") {
          const { doctorId, date } = args as any;
          const normalizedDoctorId = String(doctorId).match(/\d+/)?.[0] || doctorId;
          const slotsResponse = await fetchDoctorSlots(req, normalizedDoctorId, date);
          if (slotsResponse.success) {
            const doc = DOCTORS.find((d) => d.id === normalizedDoctorId);
            const docName = doc?.name || `Doctor ${normalizedDoctorId}`;
            const slots = slotsResponse.slots || [];
            if (slots.length > 0) {
              const slotsStr = slots.join(", ");
              responseText = `📅 Available slots for Dr. ${docName} on ${date}: ${slotsStr}. Which timing would you prefer?`;
              result = {
                success: true,
                doctorId: normalizedDoctorId,
                date,
                slots,
              };
            } else {
              responseText = `❌ Dr. ${docName} has **no available slots** on ${date}. Please try another date or a different doctor.`;
              result = {
                success: false,
                error: "No slots available",
                doctorId: normalizedDoctorId,
                date,
                slots: [],
              };
            }
            skipSecondTurn = true;
          } else {
            result = { error: slotsResponse.message || "Failed to fetch slots" };
          }
        }

        toolResults.push({ name, result });
        functionResponseParts.push({
          functionResponse: {
            name,
            response: result,
          },
        });
      }

      // ========== SECOND TURN (if needed) ==========
      if (!skipSecondTurn) {
        const modelTurn = response.candidates?.[0]?.content;
        const userTurn = {
          role: "user",
          parts: functionResponseParts,
        };
        const secondTurnContents = [...contents, modelTurn, userTurn];

        secondStart = Date.now();
        let secondResponse;
        let secondCallSuccess = false;
        let secondModelUsed = "gemini-3.5-flash";
        let secondInputTokens = 0,
          secondOutputTokens = 0;
        let secondErrorDetails = "";

        try {
          secondResponse = await generateContentWithFallback(aiClient, {
            model: "gemini-3.5-flash",
            contents: secondTurnContents,
            config: {
              systemInstruction,
              tools: [
                {
                  functionDeclarations: [
                    getDoctorsTool,
                    getPatientAppointmentsTool,
                    bookAppointmentTool,
                    cancelAppointmentTool,
                    rescheduleAppointmentTool,
                    getDoctorSlotsTool,
                  ],
                },
              ],
            },
          });
          secondCallSuccess = true;
          secondModelUsed = (secondResponse as any).modelUsed || "gemini-3.5-flash";
          const usage = secondResponse.usageMetadata || {};
          secondInputTokens = usage.promptTokenCount || usage.inputTokenCount || 0;
          secondOutputTokens = usage.candidatesTokenCount || usage.outputTokenCount || 0;
        } catch (err: any) {
          secondErrorDetails = err.message || JSON.stringify(err);
          throw err;
        } finally {
          const durationSecond = Date.now() - secondStart;
          await sendTelemetry(
            activeToken,
            secondModelUsed,
            secondInputTokens,
            secondOutputTokens,
            durationSecond,
            secondCallSuccess ? "success" : "error",
            secondErrorDetails
          );
        }
        responseText = secondResponse.text || "";
      }

      // Defensive fallback (unchanged)
      if (!responseText || responseText.trim() === "Execution complete.") {
        console.log("⚠️ Next.js: Second turn returned empty or generic text. Activating fallback...");

        const slotResult = toolResults.find((t) => t.name === "getDoctorSlots")?.result;
        if (slotResult && slotResult.success && slotResult.slots?.length > 0) {
          const { doctorId, date, slots } = slotResult;
          const doc = DOCTORS.find((d) => d.id === String(doctorId));
          const docName = doc ? doc.name : `Dr. Doctor (ID: ${doctorId})`;
          const slotsStr = slots.join(", ");
          responseText = `Here are the available slots for ${docName} on ${date}: ${slotsStr}. Which timing would you prefer?`;
        } else if (slotResult && slotResult.success === false && slotResult.error === "No slots available") {
          const docName = slotResult.doctorId
            ? `Dr. ${DOCTORS.find((d) => d.id === String(slotResult.doctorId))?.name || slotResult.doctorId}`
            : "the doctor";
          responseText = `❌ ${docName} has **no available slots** on ${slotResult.date}. Please try another date or a different doctor.`;
        }

        const doctorsResult = toolResults.find((t) => t.name === "getDoctorsList")?.result;
        if (!responseText && doctorsResult && doctorsResult.doctors) {
          const docNames = doctorsResult.doctors.map((d: any) => `${d.name} (${d.specialty})`).join(", ");
          if (userLanguageCode === "tu") {
            responseText = `ನಮ್ಮ ಆಸ್ಪತ್ರೆಡ್ ಇತ್ತೆ ಉಪ್ಪುನ ವೈದ್ಯರುಲು ಇಂಚ ಉಲ್ಲೆರ್: ${docNames}. ಈರೆಗ್ ಒವ್ವೇ ವೈದ್ಯರೆನ್ ಸಂಪರ್ಕ ಮಲ್ಪೊಡು ಪನ್ಲೆ?`;
          } else if (userLanguageCode === "kn") {
            responseText = `ನಮ್ಮ ಕ್ಲಿನಿಕ್‌ನಲ್ಲಿ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ವೈದ್ಯರುಗಳು ಹೀಗಿದ್ದಾರೆ: ${docNames}. ನಿಮಗೆ ಯಾರನ್ನು ಸಂಪರ್ಕಿಸಲು ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬೇಕು ಎಂದು ತಿಳಿಸಿ.`;
          } else if (userLanguageCode === "hi") {
            responseText = `हमारे क्लिनिक में उपलब्ध डॉक्टर इस प्रकार हैं: ${docNames}। आप किस डॉक्टर से अपॉइंटमेंट लेना चाहेंगे?`;
          } else {
            responseText = `We have the following doctors available in our clinic: ${docNames}. Whom would you like to consult?`;
          }
        }

        const bookResult = toolResults.find((t) => t.name === "bookAppointment")?.result;
        if (!responseText && bookResult && bookResult.success) {
          const apt = bookResult.appointment;
          if (userLanguageCode === "tu") {
            responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರೆಗ್ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾದ್ ಬುಕ್ ಆಂಡ್! ತಾರೀಕ್: ${apt.date}, ಸಮಯ: ${apt.time}, ರೋಗಿದ ಪುದರ್: ${apt.patientName}. ಆರೋಗ್ಯ ಶೀಘ್ರವಾಗಿ ಗುಣ ಆವಡ್ ಪಂದ್ ಹಾರೈಸುವೆ.`;
          } else if (userLanguageCode === "kn") {
            responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರವರೊಂದಿಗೆ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಬುಕ್ ಆಗಿದೆ! ದಿನಾಂಕ: ${apt.date}, ಸಮಯ: ${apt.time}, ರೋಗಿಯ ಹೆಸರು: ${apt.patientName}. ಶೀಘ್ರವಾಗಿ ಗುಣಮುಖರಾಗಲಿ ಎಂದು ಹಾರೈಸುತ್ತೇನೆ.`;
          } else if (userLanguageCode === "hi") {
            responseText = `डॉ. ${apt.doctorName} के साथ आपका अपॉइंटमेंट सफलतापूर्वक बुक हो गया है! दिनांक: ${apt.date}, समय: ${apt.time}, मरीज: ${apt.patientName}। आपके शीघ्र स्वस्थ होने की कामना करते हैं।`;
          } else {
            responseText = `Your appointment has been successfully booked with Dr. ${apt.doctorName} on ${apt.date} at ${apt.time} for the patient ${apt.patientName}. Wishing you a speedy recovery!`;
          }
        }

        const cancelResult = toolResults.find((t) => t.name === "cancelAppointment")?.result;
        if (!responseText && cancelResult && cancelResult.success) {
          const apt = cancelResult.appointment;
          if (userLanguageCode === "tu") {
            responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರೆಗ್ ಇತ್ತಿನ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾದ್ ರದ್ದಾತ್ಂಡ್. ತಾರೀಕ್: ${apt.date}, ಸಮಯ: ${apt.time}.`;
          } else if (userLanguageCode === "kn") {
            responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರೊಂದಿಗಿನ ನಿಮ್ಮ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ರದ್ದಾಗಿದೆ. ದಿನಾಂಕ: ${apt.date}, ಸಮಯ: ${apt.time}.`;
          } else if (userLanguageCode === "hi") {
            responseText = `डॉ. ${apt.doctorName} के साथ आपका अपॉइंटमेंट सफलतापूर्वक रद्द कर दिया गया है। दिनांक: ${apt.date}, समय: ${apt.time}।`;
          } else {
            responseText = `Your appointment with Dr. ${apt.doctorName} on ${apt.date} at ${apt.time} has been successfully cancelled.`;
          }
        }

        const rescheduleResult = toolResults.find((t) => t.name === "rescheduleAppointment")?.result;
        if (!responseText && rescheduleResult && rescheduleResult.success) {
          const apt = rescheduleResult.appointment;
          if (userLanguageCode === "tu") {
            responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರೆಗ್ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾದ್ ರದ್ದಾದ್ ಬೊಕ್ಕ ಪೊಸ ಸಮಯೊಗು ಬದಲಾತ್ಂಡ್. ಪೊಸ ತಾರೀಕ್: ${apt.date}, ಪೊಸ ಸಮಯ: ${apt.time}.`;
          } else if (userLanguageCode === "kn") {
            responseText = `ಡಾಕ್ಟರ್ ${apt.doctorName} ರೊಂದಿಗಿನ ನಿಮ್ಮ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಮರುನಿಗದಿಗೊಳಿಸಲಾಗಿದೆ. ಹೊಸ ದಿನಾಂಕ: ${apt.date}, ಹೊಸ ಸಮಯ: ${apt.time}.`;
          } else if (userLanguageCode === "hi") {
            responseText = `डॉ. ${apt.doctorName} के साथ आपका अपॉइंटमेंट सफलतापूर्वक ಮರುನಿಗದಿಗೊಳಿಸಿದೆ। नया दिनांक: ${apt.date}, नया समय: ${apt.time}।`;
          } else {
            responseText = `Your appointment with Dr. ${apt.doctorName} has been successfully rescheduled to ${apt.date} at ${apt.time}.`;
          }
        }

        const aptsResult = toolResults.find((t) => t.name === "getPatientAppointments")?.result;
        if (!responseText && aptsResult) {
          if (aptsResult.error) {
            responseText = aptsResult.error;
          } else if (!aptsResult.appointments || aptsResult.appointments.length === 0) {
            responseText = "You have no upcoming appointments. Would you like to book one?";
          } else {
            const aptList = aptsResult.appointments;
            sessionAppointments.set(patientId, aptList);
            const listStr = aptList
              .map(
                (a: any, idx: number) =>
                  `${idx + 1}. Dr. ${a.doctorName || a.doctor_name || `Doctor (ID: ${a.doctorId || a.doctor_id})`} on ${a.date || a.appointment_date} at ${a.time || a.appointment_time}`
              )
              .join("\n");
            responseText = `Please choose the appointment by number:\n\n${listStr}\n\nWhich one would you like to cancel or reschedule?`;
          }
        }

        if (!responseText) {
          responseText = "Execution complete.";
        }
      }
    }

    return NextResponse.json({
      text: responseText,
      toolResults,
      isSimulated: false,
      lang: getLangCode(responseText, userLanguageCode),
    });
  } catch (error: any) {
    console.error("Gemini API error in Next.js router:", error.message || error);
    // If we have an active token and measured any request duration, send error telemetry
    if (activeToken && (firstStart > 0 || secondStart > 0)) {
      const duration = firstStart > 0 ? Date.now() - firstStart : 0;
      await sendTelemetry(activeToken, "gemini-3.5-flash", 0, 0, duration, "error", error.message);
    }
    return NextResponse.json({ error: error.message || "Failed to process chat query" }, { status: 500 });
  }
}

// -------------------------------------------------------------
// 7. Helper Functions (unchanged)
// -------------------------------------------------------------
export async function fetchDoctorsFromAPI(): Promise<Doctor[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/doctors`, {
      cache: "no-store",
    });
    const data = await response.json();
    return data.success ? data.data : data.doctors || [];
  } catch (error) {
    console.error("❌ Failed to fetch doctors from API:", error);
    return [];
  }
}

export async function fetchDoctorSlots(request: NextRequest, doctorId: number | string, date: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/doctors-appoitment/${doctorId}/slots?date=${date}`;
    console.log("🌍 SLOT URL:", url);

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: request.headers.get("cookie") || "",
        Authorization: request.headers.get("authorization") || "",
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Response status:", response.status, response.statusText);
    const data = await response.json();
    console.log("🕒 SLOT API RESPONSE:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch slots:", error);
    return { success: false, slots: [], error: (error as Error).message };
  }
}

async function createAppointmentViaAPI(
  request: NextRequest,
  doctorId: string,
  patientId: string,
  date: string,
  time: string,
  consultationType: string = "in-person"
) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/appointments/patient`;

    const payload = {
      doctor_id: doctorId,
      patient_id: patientId,
      appointment_date: date,
      appointment_time: time,
      consultation_type: consultationType,
      notes: "Booked via AI Assistant",
    };

    console.log("📤 Creating appointment via API:", payload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
        Authorization: request.headers.get("authorization") || "",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("✅ API response:", data);
    return { success: response.ok, data };
  } catch (error) {
    console.error("❌ API call failed:", error);
    return { success: false, data: { message: (error as Error).message } };
  }
}