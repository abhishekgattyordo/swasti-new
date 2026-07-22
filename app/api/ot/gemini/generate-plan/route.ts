import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || !apiKey.trim()) {
    console.warn("GEMINI_API_KEY is not defined or is placeholder. AI will operate in simulated clinical fallback mode.");
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
    const { diagnosis, surgeryName, patientAge, patientGender } = body;

    if (!diagnosis || !surgeryName) {
      return NextResponse.json({ error: "diagnosis and surgeryName are required fields." }, { status: 400 });
    }

    const ai = getGemini();

    if (!ai) {
      console.log("Serving high-fidelity clinical fallback responses for", surgeryName);
      const mockPlan = getClinicalMockResponse(surgeryName, diagnosis, patientAge, patientGender);
      return NextResponse.json(mockPlan);
    }

    const prompt = `You are Swasti AI, an elite clinical co-pilot in an advanced Hospital Information System (HIS). 
Analyze this recommended surgical case:
- Patient Age: ${patientAge || "Unknown"}
- Patient Gender: ${patientGender || "Unknown"}
- Clinical Diagnosis: ${diagnosis}
- Proposed Surgery: ${surgeryName}

Provide a structured surgical preparation, evaluation, and post-operative recovery plan.
You must return your response in a strict JSON format matching this schema:
{
  "historyAlerts": "Crucial clinical history considerations or comorbidities to screen for",
  "preOpTests": ["Array of recommended lab/imaging tests (e.g. CBC, Blood Sugar, PT/INR, etc.)"],
  "anesthesiaType": "General, Regional, Spinal, or Local",
  "anesthesiaRisk": "Brief description of airway or anesthesia risks for this procedure",
  "suggestedEquipment": ["Required major equipment (e.g. Laparoscopic tower, C-Arm, Ventilator, Bipolar Cautery, etc.)"],
  "postOpMedications": "Specific medication list with dosages and intervals (Antibiotics, Analgesics, etc.)",
  "postOpNursingTasks": ["Array of concrete nursing checklists for Recovery Room / Ward"],
  "costSuggestion": {
    "surgeonFee": 25000,
    "implantsCost": 0,
    "otCharges": 15000,
    "totalEstimatedCost": 40000
  }
}
Return only the raw JSON. No markdown codeblocks. No explanation outside the JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["historyAlerts", "preOpTests", "anesthesiaType", "anesthesiaRisk", "suggestedEquipment", "postOpMedications", "postOpNursingTasks", "costSuggestion"],
          properties: {
            historyAlerts: { type: Type.STRING },
            preOpTests: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            anesthesiaType: { type: Type.STRING },
            anesthesiaRisk: { type: Type.STRING },
            suggestedEquipment: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            postOpMedications: { type: Type.STRING },
            postOpNursingTasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            costSuggestion: {
              type: Type.OBJECT,
              required: ["surgeonFee", "implantsCost", "otCharges", "totalEstimatedCost"],
              properties: {
                surgeonFee: { type: Type.INTEGER },
                implantsCost: { type: Type.INTEGER },
                otCharges: { type: Type.INTEGER },
                totalEstimatedCost: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Gemini API Error, reverting to local clinical knowledge:", error);
    try {
      const body = await req.json().catch(() => ({}));
      const { diagnosis, surgeryName, patientAge, patientGender } = body;
      const mockPlan = getClinicalMockResponse(surgeryName || "general", diagnosis || "general", patientAge, patientGender);
      return NextResponse.json({
        ...mockPlan,
        aiNotice: "Reverted to high-fidelity clinical simulation due to upstream API configuration constraint."
      });
    } catch {
      return NextResponse.json({ error: "Server error occurred" }, { status: 500 });
    }
  }
}

function getClinicalMockResponse(surgery: string, diagnosis: string, age?: number, gender?: string) {
  const sName = surgery.toLowerCase();
  
  if (sName.includes("chole") || sName.includes("gallbladder")) {
    return {
      historyAlerts: "Screen for previous upper abdominal incisions (risk of adhesions), active acute cholecystitis, or jaundice suggesting common bile duct stones.",
      preOpTests: ["Complete Blood Count (CBC)", "Liver Function Tests (LFT)", "PT/INR", "Random Blood Sugar", "Ultrasound of Whole Abdomen"],
      anesthesiaType: "General",
      anesthesiaRisk: "Standard general anesthesia risks. Intubation required. Ensure post-op anti-emetics due to high incidence of nausea in laparoscopic abdominal procedures.",
      suggestedEquipment: ["Laparoscopic Tower (High Definition)", "30-degree Laparoscope", "CO2 Insufflator", "Harmonic Scalpel / Cautery", "Endo-Bag for specimen retrieval"],
      postOpMedications: "Inj. Cefuroxime 1.5g IV BD for 2 doses, Tab. Paracetamol 650mg TDS, Tab. Pantoprazole 40mg OD (before food), Tab. Ondansetron 4mg TDS PRN.",
      postOpNursingTasks: [
        "Monitor vitals every 30 mins for 2 hours, then 4-hourly.",
        "Assess abdominal dressing for any active bleeding or bile leak.",
        "Encourage early mobilization (within 4 hours of shifted to ward).",
        "Maintain NPO status until bowel sounds return or as directed."
      ],
      costSuggestion: {
        surgeonFee: 25000,
        implantsCost: 0,
        otCharges: 15000,
        totalEstimatedCost: 85000
      }
    };
  } else if (sName.includes("hernia") || sName.includes("hernio")) {
    return {
      historyAlerts: "Check for history of chronic cough, severe constipation, or urinary straining (BPH) as these increase intra-abdominal pressure and hernia recurrence risk.",
      preOpTests: ["Complete Blood Count (CBC)", "Serum Creatinine", "ECG (especially for age > 40)", "Coagulation Profile (PT/INR)", "Urine Routine"],
      anesthesiaType: "Spinal",
      anesthesiaRisk: "Spinal anesthesia headache risk, urinary retention (extremely common in elderly males, monitor voiding post-op), transient hypotension.",
      suggestedEquipment: ["Standard Surgical Tray", "Electrosurgical Unit (Cautery)", "Surgical Mesh (Polypropylene)", "Surgical Marker", "Self-retaining Retractors"],
      postOpMedications: "Tab. Amoxicillin-Clavulanate 625mg BD for 5 days, Tab. Ibuprofen 400mg BD PC, Tab. Pantoprazole 40mg OD.",
      postOpNursingTasks: [
        "Monitor urine output carefully. Inform surgeon if patient hasn't voided within 6 hours post-spinal.",
        "Apply local ice pack to groin to reduce swelling.",
        "Strictly avoid any heavy lifting or strenuous coughing.",
        "Monitor surgical site for swelling, hematoma, or drainage."
      ],
      costSuggestion: {
        surgeonFee: 20000,
        implantsCost: 5000,
        otCharges: 12000,
        totalEstimatedCost: 72000
      }
    };
  } else if (sName.includes("append") || sName.includes("appendix")) {
    return {
      historyAlerts: "Verify time of last meal (Fasting status critical for emergency general anesthesia). Check for peritoneal signs indicative of perforation or abscess.",
      preOpTests: ["Complete Blood Count (CBC with differential)", "Random Blood Sugar", "Serum Electrolytes", "Urine Pregnancy Test (for females of childbearing age)", "Ultrasound of Abdomen/Pelvis"],
      anesthesiaType: "General",
      anesthesiaRisk: "Aspiration risk during induction (Full Stomach precautions, rapid sequence induction required).",
      suggestedEquipment: ["Emergency Laparoscopic / Open Appendectomy Tray", "Suction-Irrigation apparatus", "Bipolar and Monopolar Cautery", "Specimen Container"],
      postOpMedications: "Inj. Ceftriaxone 1g IV BD, Inj. Metronidazole 500mg IV TDS, Tab. Tramadol 50mg BD, Tab. Paracetamol 650mg QDS PRN.",
      postOpNursingTasks: [
        "Record temperature and pulse hourly (alert if spike suggests perforation or peritonitis).",
        "Maintain semi-Fowler position to localize any pelvic fluid.",
        "Ensure strict input-output charting and IV fluid maintenance.",
        "Inspect wounds for signs of wound infection (highest risk in gangrenous cases)."
      ],
      costSuggestion: {
        surgeonFee: 22000,
        implantsCost: 0,
        otCharges: 14000,
        totalEstimatedCost: 75000
      }
    };
  } else if (sName.includes("knee") || sName.includes("arthroplasty") || sName.includes("joint")) {
    return {
      historyAlerts: "Critical: Screen for dental infections, urinary tract infections, or active skin lesions (absolute contraindications due to hematogenous joint infection risk). Stop anticoagulants/aspirin under physician guidance.",
      preOpTests: ["Complete Blood Count (CBC)", "Coagulation Panel (PT/APTT)", "Renal Function Tests", "HbA1c (Target < 7.0% for joint replacement)", "ECG and Cardiology Clearance", "Digital Knee X-Rays (AP/Lateral, Standing)"],
      anesthesiaType: "Spinal",
      anesthesiaRisk: "Anesthesia block failure, hypotension, deep vein thrombosis (DVT) risk is extremely high for major joint replacements. Ensure pneumatic compression boots.",
      suggestedEquipment: ["Orthopedic Knee Arthroplasty Power Drills/Saws", "Alignment jigs and cutting guides", "Pneumatic Tourniquet", "Triathlon Knee Implant System", "Pulse Lavage Irrigation system"],
      postOpMedications: "Inj. Cefazolin 1g IV 8-hourly for 24h, Tab. Aspirin 75mg OD (DVT prophylaxis), Tab. Tapentadol 50mg BD, Inj. Iron sucrose if Hb drops.",
      postOpNursingTasks: [
        "Perform neurovascular checks of the operated limb (dorsalis pedis pulse, warmth, capillary refill, sensation, motor toe movement) hourly.",
        "Ensure knee immobilizer or leg is kept in neutral alignment.",
        "Manage patient-controlled analgesia (PCA) or epidural infusion pump.",
        "Ensure deep vein thrombosis (DVT) pump/compression sleeves are active."
      ],
      costSuggestion: {
        surgeonFee: 45000,
        implantsCost: 75000,
        otCharges: 25000,
        totalEstimatedCost: 230000
      }
    };
  } else {
    return {
      historyAlerts: "Standard pre-operative evaluation. Review complete drug list, past surgeries, and any history of bleeding disorders, cardiac conditions, or sleep apnea.",
      preOpTests: ["Complete Blood Count (CBC)", "Blood Grouping & Crossmatching", "Random Blood Sugar", "Serum Creatinine", "ECG", "Chest X-Ray"],
      anesthesiaType: "General",
      anesthesiaRisk: "Assess airway (Mallampati score). Screen for history of malignant hyperthermia or prolonged muscular blockade. Ensure fasting instructions (8h solids, 2h clear liquids).",
      suggestedEquipment: ["Standard Surgical Instrumentation Tray", "Electrosurgical Unit", "Physiological Patient Monitor", "Anesthesia Machine with Ventilator"],
      postOpMedications: "Tab. Paracetamol 650mg TDS, Tab. Amoxicillin-Clavulanate 625mg BD, Tab. Pantoprazole 40mg OD, Local analgesic gel.",
      postOpNursingTasks: [
        "Monitor vital signs every 1 hour for first 4 hours, then 4-hourly.",
        "Evaluate pain score (0-10 scale) and administer prescribed analgesics.",
        "Check dressing site for any bleeding, hematoma, or discharge.",
        "Initiate early oral sips once bowel sounds and swallowing are fully restored."
      ],
      costSuggestion: {
        surgeonFee: 18000,
        implantsCost: 0,
        otCharges: 10000,
        totalEstimatedCost: 55000
      }
    };
  }
}
