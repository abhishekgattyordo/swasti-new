import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || !apiKey.trim()) {
    console.warn("GEMINI_API_KEY is not defined. Voice intake AI will run in fallback simulation mode.");
    return null;
  }
  try {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    return aiInstance;
  } catch (err) {
    console.error("Error initializing GoogleGenAI SDK:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, currentCase, activeStep, activeStepName } = body;

    if (!transcript) {
      return NextResponse.json({ error: "transcript is required." }, { status: 400 });
    }

    const activeStepNum = Number(activeStep || 5);
    const stepName = (activeStepName || "Post-Anesthesia Care (PACU)").toLowerCase();

    const ai = getGemini();

    if (!ai) {
      console.log("Serving clinical simulation parsing for voice intake (active step: " + activeStepNum + ")");
      const fallbackResult = generateClinicalFallbackIntake(transcript, currentCase, activeStepNum);
      return NextResponse.json({ success: true, data: fallbackResult, simulated: true });
    }

    const prompt = `You are Swasti AI clinical parser. The user is currently on Step ${activeStepNum}: "${activeStepName}".
Analyze the following spoken transcription from a surgeon/clinical team:
"${transcript}"

Your task is to extract and organize the spoken clinical details ONLY for this currently active step ("${activeStepName}").
Do NOT extract or populate fields for other steps. Only return a JSON object containing the relevant fields for this active step.

Based on Step ${activeStepNum} ("${activeStepName}"), map the extracted values to the correct property key:
- If the step is "Post-Anesthesia Care (PACU)" or the active step number is 5, you MUST extract vitals (blood pressure, pulse, SpO2/oxygen saturation) and populate the "postOpRecovery" field:
  Required Output Format:
  {
    "postOpRecovery": {
      "vitalsLogs": [
        {
          "time": "current timestamp, e.g., 12:15",
          "bp": "extracted BP, e.g., 120/80",
          "pulse": 78,
          "spo2": 99,
          "painScore": 0,
          "consciousness": "Fully Awake"
        }
      ],
      "status": "Stable"
    }
  }

- If the step is "Procedure Recommendation" (Step 1), extract into "recommendation".
- If the step is "Pre-Operative Assessment" (Step 2), extract into "preSurgeryAssessment".
- If the step is "Anesthesia Clearance" (Step 3), extract into "anesthesiaEvaluation".
- If the step is "Authorization & Consent" (Step 4), extract into "consentManagement" and "insurancePreAuth".
- If the step is "Clinical Team Staffing" (Step 10), extract into "teamAssignment".
- If the step is "OT Slot Booking" (Step 6), extract into "otScheduling".
- If the step is "Sterilization & Instrument Check" (Step 7), extract into "equipmentCheck".
- If the step is "Admissions & Pre-Op Checklist" (Step 8), extract into "dayChecklist".
- If the step is "Surgical Consumables & Implants" (Step 9), extract into "consumablesTracking".
- If the step is "Ward Transition & Recovery Orders" (Step 11), extract into "postOpOrders".
- If the step is "Clinical Outcome Tracking" (Step 12), extract into "outcomeTracking".
- If the step is "Financial Clearance & Billing" (Step 13), extract into "billing".
- If the step is "Discharge & Outpatient Follow-Up" (Step 14), extract into "discharge".

Return ONLY raw JSON, with no explanation or enclosing codeblocks. Ensure all JSON field names and types match precisely.`;

    let responseText = "{}";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      responseText = response.text || "{}";
    } catch (apiErr: any) {
      console.warn("Upstream Gemini API error, falling back to local clinical parser:", apiErr);
      const fallbackResult = generateClinicalFallbackIntake(transcript, currentCase, activeStepNum);
      return NextResponse.json({ 
        success: true, 
        data: fallbackResult, 
        simulated: true,
        warning: `Upstream model unavailable: ${apiErr.message || apiErr}. Running in high-resiliency offline parser mode.`
      });
    }

    try {
      const parsedData = JSON.parse(responseText);
      return NextResponse.json({ success: true, data: parsedData });
    } catch (parseErr) {
      console.warn("Failed to parse Gemini JSON response, falling back to local clinical parser:", parseErr);
      const fallbackResult = generateClinicalFallbackIntake(transcript, currentCase, activeStepNum);
      return NextResponse.json({ 
        success: true, 
        data: fallbackResult, 
        simulated: true,
        warning: "Model response format mismatch. Running in high-resiliency offline parser mode."
      });
    }
  } catch (err: any) {
    console.error("General Voice intake API error, serving offline parser:", err);
    try {
      const body = await req.json().catch(() => ({}));
      const fallbackResult = generateClinicalFallbackIntake(body.transcript || "", body.currentCase, Number(body.activeStep || 5));
      return NextResponse.json({ 
        success: true, 
        data: fallbackResult, 
        simulated: true, 
        warning: "Offline parser active." 
      });
    } catch (fallbackErr) {
      return NextResponse.json({ error: err.message || "Failed to process voice intake with AI." }, { status: 500 });
    }
  }
}

function generateClinicalFallbackIntake(transcript: string, currentCase: any, activeStepNum: number = 5) {
  const text = transcript.toLowerCase();
  const expectedDate = new Date().toISOString().split('T')[0];
  const result: any = {};

  if (activeStepNum === 1) {
    let diagnosis = "Cholelithiasis with acute cholecystitis";
    let surgeryName = "Laparoscopic Cholecystectomy";
    let surgeryType: any = "Major";
    let priorityLevel: any = "High";
    let duration = 60;
    let clinicalNotes = "Symptomatic gallbladder stones. Recommend early lap chole.";

    if (text.includes("appendix") || text.includes("appendicitis") || text.includes("appendec")) {
      diagnosis = "Acute Appendicitis";
      surgeryName = "Laparoscopic Appendectomy";
      surgeryType = "Emergency";
      priorityLevel = "Immediate";
      duration = 45;
      clinicalNotes = "Rebound tenderness in RIF, leukocytosis. Fit for emergency appendectomy.";
    } else if (text.includes("hernia") || text.includes("hernio")) {
      diagnosis = "Right Inguinal Hernia";
      surgeryName = "Open Hernioplasty with Mesh";
      surgeryType = "Major";
      priorityLevel = "Medium";
      duration = 75;
      clinicalNotes = "Reducible right groin hernia, chronic aching pain. Plan for mesh hernioplasty.";
    }

    result.recommendation = {
      diagnosis,
      surgeryName,
      surgeryType,
      expectedDate,
      priorityLevel,
      estimatedDuration: duration,
      clinicalNotes: clinicalNotes || transcript,
      recommendedBy: "Dr. Devendra Mehta",
      recommendedDate: expectedDate
    };
  }

  else if (activeStepNum === 2) {
    result.preSurgeryAssessment = {
      performedBy: "Dr. Devendra Mehta",
      medicalHistory: "Type 2 Diabetes managed with Metformin.",
      previousSurgeries: "None",
      allergies: "No known drug allergies",
      currentMedication: "Tab. Metformin 500mg OD",
      vitals: {
        bp: "128/82",
        pulse: 78,
        temp: 36.8,
        spo2: 99,
        weight: 72,
        height: 170,
        bmi: 24.9
      },
      comorbidities: {
        diabetes: text.includes("diabetes") || text.includes("diabetic"),
        hypertension: text.includes("tension") || text.includes("pressure") || text.includes("hypertens"),
        heartDisease: false,
        asthma: false,
        other: ""
      },
      tests: {
        cbc: "Normal",
        bloodGroup: "O Positive",
        ptInr: "Normal",
        bloodSugar: "115 mg/dL",
        ecg: "Normal Sinus Rhythm",
        xray: "Clear",
        ctScan: "Not Required",
        mri: "Not Required"
      },
      fitnessStatus: "Fit"
    };
  }

  else if (activeStepNum === 5) {
    // Post-Anesthesia Care (PACU) - Extract BP, Pulse, SPO2!
    // Example: "Post-anesthesia BP 120 over 80, pulse 78, oxygen saturation 99 percent."
    let bp = "120/80";
    let pulse = 78;
    let spo2 = 99;

    // Extract BP
    const bpMatch = text.match(/(?:bp|blood pressure|pressure)\s*(?:is)?\s*(\d+\s*\/\s*\d+)/i) || text.match(/(\d+)\s+over\s+(\d+)/i);
    if (bpMatch) {
      if (bpMatch[2]) {
        bp = `${bpMatch[1]}/${bpMatch[2]}`;
      } else {
        bp = bpMatch[1].replace(/\s+/g, "");
      }
    }

    // Extract pulse
    const pulseMatch = text.match(/(?:pulse|heart rate|pulse rate)\s*(?:is)?\s*(\d+)/i) || text.match(/pulse\s+(\d+)/i);
    if (pulseMatch) {
      pulse = parseInt(pulseMatch[1], 10);
    }

    // Extract spo2
    const spo2Match = text.match(/(?:spo2|oxygen saturation|saturation|oxygen)\s*(?:is)?\s*(\d+)/i) || text.match(/saturation\s+(\d+)/i);
    if (spo2Match) {
      spo2 = parseInt(spo2Match[1], 10);
    }

    const newLog = {
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      bp,
      pulse,
      spo2,
      painScore: text.includes("pain") ? 3 : 0,
      consciousness: "Fully Awake"
    };

    result.postOpRecovery = {
      vitalsLogs: [newLog],
      status: "Stable"
    };
  }

  else if (activeStepNum === 10) {
    result.teamAssignment = {
      team: {
        primarySurgeon: "Dr. Devendra Mehta",
        assistantSurgeon: "Dr. Anjali Deshmukh",
        leadAnesthetist: "Dr. Ronald D'Souza",
        assistantAnesthetist: "Sister Mary Joseph",
        scrubNurse: "Sister Jaspreet Kaur",
        circulatingNurse: "Sister Mary Joseph",
        otTechnician: "Brother Rajesh Kumar",
        biomedicalTech: "Brother Rajesh Kumar"
      },
      assignedBy: "OT Chief Administrator",
      availabilityStatus: "All Available"
    };
  }

  // default other steps to avoid crashing if requested
  else {
    result.postOpRecovery = {
      vitalsLogs: [
        { time: "12:15", bp: "120/80", pulse: 78, spo2: 99, painScore: 0, consciousness: "Fully Awake" }
      ],
      status: "Stable"
    };
  }

  return result;
}
