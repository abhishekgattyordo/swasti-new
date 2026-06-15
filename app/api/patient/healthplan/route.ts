





// // app/api/analyze/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { generateContentWithDynamicKey, models } from "@/lib/gemini";
// import { query } from "@/lib/db";

// // ✅ Your hosted Render billing server
// const DYNAMIC_BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
// const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

// export async function POST(request: NextRequest) {
//   const startTime = Date.now();
//   const targetModel = models.FLASH; // e.g., "gemini-1.5-flash"
//   let inputTokens = 0, outputTokens = 0;
//   let userIdVal = "anonymous";
//   let activeToken = "";

//   try {
//     const { patientData, userId, saveToHistory = true } = await request.json();
//     if (userId) userIdVal = String(userId);
//     if (!patientData) {
//       return NextResponse.json({ error: "Missing patient data" }, { status: 400 });
//     }

//     // 1. Fetch API key from your Render billing server
//     const billingRes = await fetch(DYNAMIC_BILLING_URL);
//     if (!billingRes.ok) throw new Error(`Billing server error: ${billingRes.status}`);
//     const configData = await billingRes.json();
//     activeToken = configData.apiKey || configData.customApiKey || configData.token;
//     if (!activeToken) throw new Error("No API key returned from billing server");

//     // 2. Build the prompt (strict JSON format)
//     const prompt = `
//       You are an advanced AI Personalized Health Recommendations Engine.
//       Analyze the following patient data and provide comprehensive, deep wellness recommendations.
      
//       Patient Profile:
//       ${JSON.stringify(patientData, null, 2)}
      
//       You MUST respond with **only** valid JSON (no markdown, no extra text) in this exact format:
//       {
//         "status": "success",
//         "summary": "Deep overall health summary explaining the 'why' behind current status",
//         "deepAnalysis": "A detailed scientific and physiological exploration...",
//         "riskAssessment": [
//           { "condition": "Diabetes", "riskLevel": "Low/Medium/High", "reason": "...", "prevention": "..." }
//         ],
//         "dietRecommendations": {
//           "focus": "Main dietary goal",
//           "recommendations": ["Rec 1", "Rec 2"],
//           "foodsToAvoid": ["Food 1", "Food 2"]
//         },
//         "exercisePlan": {
//           "type": "...",
//           "frequency": "...",
//           "routine": ["Ex 1", "Ex 2"],
//           "safetyPrecautions": ["Prec 1", "Prec 2"]
//         },
//         "mentalWellness": {
//           "assessment": "...",
//           "advice": ["Advice 1", "Advice 2"]
//         },
//         "preventiveCare": ["Care 1", "Care 2"],
//         "criticalAlert": "Only if emergency symptoms are detected, otherwise null"
//       }
      
//       Safety Rules:
//       1. Always state you are an AI, not a doctor.
//       2. If emergency symptoms (chest pain, stroke signs) are detected, set "criticalAlert" to a strong warning.
//       3. Pay close attention to "currentProblems" or "symptoms".
//       4. Use medically aware, safe, professional language.
//     `;

//     // 3. Call Gemini
//     const result = await generateContentWithDynamicKey(activeToken, targetModel, prompt);
//     const responseTimeMs = Date.now() - startTime;
//     const usage = result.usageMetadata || {};
//     inputTokens = usage.promptTokenCount || 0;
//     outputTokens = usage.candidatesTokenCount || 0;

//     // 4. Parse JSON and add fallbacks to prevent frontend crashes
//     let parsedResponse;
//     try {
//       parsedResponse = JSON.parse(result.text || "{}");
//     } catch (parseErr) {
//       console.error("JSON parse error, using fallback");
//       parsedResponse = {};
//     }

//     // Ensure every expected section exists
//     parsedResponse.status = parsedResponse.status || "success";
//     parsedResponse.summary = parsedResponse.summary || "Analysis complete. Please consult a healthcare provider.";
//     parsedResponse.deepAnalysis = parsedResponse.deepAnalysis || "No deep analysis available.";
//     parsedResponse.riskAssessment = Array.isArray(parsedResponse.riskAssessment) ? parsedResponse.riskAssessment : [];
//     parsedResponse.dietRecommendations = {
//       focus: parsedResponse.dietRecommendations?.focus || "Balanced nutrition",
//       recommendations: Array.isArray(parsedResponse.dietRecommendations?.recommendations) ? parsedResponse.dietRecommendations.recommendations : [],
//       foodsToAvoid: Array.isArray(parsedResponse.dietRecommendations?.foodsToAvoid) ? parsedResponse.dietRecommendations.foodsToAvoid : [],
//     };
//     parsedResponse.exercisePlan = {
//       type: parsedResponse.exercisePlan?.type || "Moderate physical activity",
//       frequency: parsedResponse.exercisePlan?.frequency || "3-5 times per week",
//       routine: Array.isArray(parsedResponse.exercisePlan?.routine) ? parsedResponse.exercisePlan.routine : [],
//       safetyPrecautions: Array.isArray(parsedResponse.exercisePlan?.safetyPrecautions) ? parsedResponse.exercisePlan.safetyPrecautions : [],
//     };
//     parsedResponse.mentalWellness = {
//       assessment: parsedResponse.mentalWellness?.assessment || "No specific mental wellness assessment.",
//       advice: Array.isArray(parsedResponse.mentalWellness?.advice) ? parsedResponse.mentalWellness.advice : [],
//     };
//     parsedResponse.preventiveCare = Array.isArray(parsedResponse.preventiveCare) ? parsedResponse.preventiveCare : [];
//     parsedResponse.criticalAlert = parsedResponse.criticalAlert || null;

//     // 5. Save to database (your existing code)
//     let savedRecord = null;
//     if (userId && saveToHistory) {
//       try {
//         let riskLevel = "Low";
//         if (parsedResponse.riskAssessment.length > 0) {
//           const hasHigh = parsedResponse.riskAssessment.some((r: any) => String(r.riskLevel).toLowerCase() === "high");
//           const hasMed = parsedResponse.riskAssessment.some((r: any) => String(r.riskLevel).toLowerCase() === "medium");
//           riskLevel = hasHigh ? "High" : hasMed ? "Medium" : "Low";
//         }

//         await query(`
//           CREATE TABLE IF NOT EXISTS health_analysis_history (
//             id SERIAL PRIMARY KEY,
//             user_id INTEGER,
//             patient_name VARCHAR(100),
//             patient_age INTEGER,
//             patient_gender VARCHAR(20),
//             patient_data JSONB,
//             analysis_report JSONB,
//             summary TEXT,
//             risk_level VARCHAR(20),
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//           )
//         `);

//         const insertResult = await query(
//           `INSERT INTO health_analysis_history (
//             user_id, patient_name, patient_age, patient_gender, patient_data, analysis_report, summary, risk_level
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
//           [
//             Number(userId),
//             patientData.name || "Unknown",
//             patientData.age ? Number(patientData.age) : null,
//             patientData.gender || null,
//             JSON.stringify(patientData),
//             JSON.stringify(parsedResponse),
//             parsedResponse.summary || "",
//             riskLevel,
//           ]
//         );

//         if (insertResult.rows?.length > 0) {
//           savedRecord = { id: insertResult.rows[0].id, saved: true };
//           console.log("✅ Analysis saved to DB. ID:", savedRecord.id);
//         }
//       } catch (dbError: any) {
//         console.error("⚠️ DB save error:", dbError.message);
//         savedRecord = { saved: false, error: dbError.message };
//       }
//     }

//     // 6. Send telemetry WITH authentication (Bearer token)
//     //    The billing server expects the same API key for non‑localhost requests.
//     fetch(TELEMETRY_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${activeToken}`, // ✅ critical fix
//       },
//       body: JSON.stringify({
//         projectName: "Hospital CRM (Next.js)",
//         model: targetModel,
//         inputTokens,
//         outputTokens,
//         responseTimeMs,
//         status: "success",
//         userRole: "doctor",
//       }),
//     }).catch(err => console.error("Telemetry error:", err));

//     // 7. Return response to frontend
//     return NextResponse.json({
//       ...parsedResponse,
//       _saved: savedRecord?.saved || false,
//       _savedId: savedRecord?.id || null,
//       _savedError: savedRecord?.error || null,
//     });
//   } catch (err: any) {
//     const errorDuration = Date.now() - startTime;
//     console.error("❌ Analysis error:", err);

//     // Send error telemetry (also with Bearer token)
//     if (activeToken) {
//       fetch(TELEMETRY_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${activeToken}`,
//         },
//         body: JSON.stringify({
//           projectName: "Hospital CRM (Next.js)",
//           model: targetModel,
//           inputTokens: 0,
//           outputTokens: 0,
//           responseTimeMs: errorDuration,
//           status: "error",
//           errorDetails: err.message,
//           userRole: "doctor",
//         }),
//       }).catch(() => {});
//     }

//     return NextResponse.json(
//       { error: "Health analysis failed", details: err.message },
//       { status: 500 }
//     );
//   }
// }



// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateContentWithDynamicKey, models } from "@/lib/gemini";
import { query } from "@/lib/db";

// ✅ Your hosted Render billing server
const DYNAMIC_BILLING_URL = "https://his-ai-billing.onrender.com/api/ai/billing";
const TELEMETRY_URL = "https://his-ai-billing.onrender.com/api/ai/log-usage";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const targetModel = models.FLASH; // e.g., "gemini-1.5-flash"
  let inputTokens = 0, outputTokens = 0;
  let userIdVal = "anonymous";
  let activeToken = "";

  try {
    const { patientData, userId, saveToHistory = true } = await request.json();
    if (userId) userIdVal = String(userId);
    if (!patientData) {
      return NextResponse.json({ error: "Missing patient data" }, { status: 400 });
    }

    // 1. Fetch API key from your Render billing server
    const billingRes = await fetch(DYNAMIC_BILLING_URL);
    if (!billingRes.ok) throw new Error(`Billing server error: ${billingRes.status}`);
    const configData = await billingRes.json();
    activeToken = configData.apiKey || configData.customApiKey || configData.token;
    if (!activeToken) throw new Error("No API key returned from billing server");

    // 2. Build the prompt (strict JSON format)
    const prompt = `
      You are an advanced AI Personalized Health Recommendations Engine.
      Analyze the following patient data and provide comprehensive, deep wellness recommendations.
      
      Patient Profile:
      ${JSON.stringify(patientData, null, 2)}
      
      You MUST respond with **only** valid JSON (no markdown, no extra text) in this exact format:
      {
        "status": "success",
        "summary": "Deep overall health summary explaining the 'why' behind current status",
        "deepAnalysis": "A detailed scientific and physiological exploration...",
        "riskAssessment": [
          { "condition": "Diabetes", "riskLevel": "Low/Medium/High", "reason": "...", "prevention": "..." }
        ],
        "dietRecommendations": {
          "focus": "Main dietary goal",
          "recommendations": ["Rec 1", "Rec 2"],
          "foodsToAvoid": ["Food 1", "Food 2"]
        },
        "exercisePlan": {
          "type": "...",
          "frequency": "...",
          "routine": ["Ex 1", "Ex 2"],
          "safetyPrecautions": ["Prec 1", "Prec 2"]
        },
        "mentalWellness": {
          "assessment": "...",
          "advice": ["Advice 1", "Advice 2"]
        },
        "preventiveCare": ["Care 1", "Care 2"],
        "criticalAlert": "Only if emergency symptoms are detected, otherwise null"
      }
      
      Safety Rules:
      1. Always state you are an AI, not a doctor.
      2. If emergency symptoms (chest pain, stroke signs) are detected, set "criticalAlert" to a strong warning.
      3. Pay close attention to "currentProblems" or "symptoms".
      4. Use medically aware, safe, professional language.
    `;

    // 3. Call Gemini
    const result = await generateContentWithDynamicKey(activeToken, targetModel, prompt);
    const responseTimeMs = Date.now() - startTime;
    const usage = result.usageMetadata || {};
    inputTokens = usage.promptTokenCount || 0;
    outputTokens = usage.candidatesTokenCount || 0;

    // 4. Parse JSON and add fallbacks to prevent frontend crashes
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(result.text || "{}");
    } catch (parseErr) {
      console.error("JSON parse error, using fallback");
      parsedResponse = {};
    }

    // Ensure every expected section exists
    parsedResponse.status = parsedResponse.status || "success";
    parsedResponse.summary = parsedResponse.summary || "Analysis complete. Please consult a healthcare provider.";
    parsedResponse.deepAnalysis = parsedResponse.deepAnalysis || "No deep analysis available.";
    parsedResponse.riskAssessment = Array.isArray(parsedResponse.riskAssessment) ? parsedResponse.riskAssessment : [];
    parsedResponse.dietRecommendations = {
      focus: parsedResponse.dietRecommendations?.focus || "Balanced nutrition",
      recommendations: Array.isArray(parsedResponse.dietRecommendations?.recommendations) ? parsedResponse.dietRecommendations.recommendations : [],
      foodsToAvoid: Array.isArray(parsedResponse.dietRecommendations?.foodsToAvoid) ? parsedResponse.dietRecommendations.foodsToAvoid : [],
    };
    parsedResponse.exercisePlan = {
      type: parsedResponse.exercisePlan?.type || "Moderate physical activity",
      frequency: parsedResponse.exercisePlan?.frequency || "3-5 times per week",
      routine: Array.isArray(parsedResponse.exercisePlan?.routine) ? parsedResponse.exercisePlan.routine : [],
      safetyPrecautions: Array.isArray(parsedResponse.exercisePlan?.safetyPrecautions) ? parsedResponse.exercisePlan.safetyPrecautions : [],
    };
    parsedResponse.mentalWellness = {
      assessment: parsedResponse.mentalWellness?.assessment || "No specific mental wellness assessment.",
      advice: Array.isArray(parsedResponse.mentalWellness?.advice) ? parsedResponse.mentalWellness.advice : [],
    };
    parsedResponse.preventiveCare = Array.isArray(parsedResponse.preventiveCare) ? parsedResponse.preventiveCare : [];
    parsedResponse.criticalAlert = parsedResponse.criticalAlert || null;

    // 5. Save to database (your existing code)
    let savedRecord = null;
    if (userId && saveToHistory) {
      try {
        let riskLevel = "Low";
        if (parsedResponse.riskAssessment.length > 0) {
          const hasHigh = parsedResponse.riskAssessment.some((r: any) => String(r.riskLevel).toLowerCase() === "high");
          const hasMed = parsedResponse.riskAssessment.some((r: any) => String(r.riskLevel).toLowerCase() === "medium");
          riskLevel = hasHigh ? "High" : hasMed ? "Medium" : "Low";
        }

        await query(`
          CREATE TABLE IF NOT EXISTS health_analysis_history (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            patient_name VARCHAR(100),
            patient_age INTEGER,
            patient_gender VARCHAR(20),
            patient_data JSONB,
            analysis_report JSONB,
            summary TEXT,
            risk_level VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        const insertResult = await query(
          `INSERT INTO health_analysis_history (
            user_id, patient_name, patient_age, patient_gender, patient_data, analysis_report, summary, risk_level
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [
            Number(userId),
            patientData.name || "Unknown",
            patientData.age ? Number(patientData.age) : null,
            patientData.gender || null,
            JSON.stringify(patientData),
            JSON.stringify(parsedResponse),
            parsedResponse.summary || "",
            riskLevel,
          ]
        );

        if (insertResult.rows?.length > 0) {
          savedRecord = { id: insertResult.rows[0].id, saved: true };
          console.log("✅ Analysis saved to DB. ID:", savedRecord.id);
        }
      } catch (dbError: any) {
        console.error("⚠️ DB save error:", dbError.message);
        savedRecord = { saved: false, error: dbError.message };
      }
    }

    // 6. Send telemetry WITH authentication (Bearer token) – role = "patient"
    fetch(TELEMETRY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${activeToken}`,
      },
      body: JSON.stringify({
        projectName: "Hospital CRM (Next.js)",
        model: targetModel,
        inputTokens,
        outputTokens,
        responseTimeMs,
        status: "success",
        userRole: "patient",   // ✅ fixed: now patient, not doctor
      }),
    }).catch(err => console.error("Telemetry error:", err));

    // 7. Return response to frontend
    return NextResponse.json({
      ...parsedResponse,
      _saved: savedRecord?.saved || false,
      _savedId: savedRecord?.id || null,
      _savedError: savedRecord?.error || null,
    });
  } catch (err: any) {
    const errorDuration = Date.now() - startTime;
    console.error("❌ Analysis error:", err);

    // Send error telemetry (also with role = "patient")
    if (activeToken) {
      fetch(TELEMETRY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          projectName: "Hospital CRM (Next.js)",
          model: targetModel,
          inputTokens: 0,
          outputTokens: 0,
          responseTimeMs: errorDuration,
          status: "error",
          errorDetails: err.message,
          userRole: "patient",
        }),
      }).catch(() => {});
    }

    return NextResponse.json(
      { error: "Health analysis failed", details: err.message },
      { status: 500 }
    );
  }
}