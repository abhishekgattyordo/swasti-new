// // app/api/patient/health/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { ai, generateWithRetry } from '@/lib/gemini';

// export async function POST(request: NextRequest) {
//   try {
//     const { patientData } = await request.json();

//     if (!patientData) {
//       return NextResponse.json(
//         { error: 'Missing patient data' },
//         { status: 400 }
//       );
//     }

//     console.log('📊 Analyzing health data...');

//     // Check for API key
//     if (!process.env.GEMINI_API_KEY) {
//       console.error('Critical: GEMINI_API_KEY is missing from environment variables.');
//       return NextResponse.json(
//         {
//           error: 'Server Configuration Error',
//           details: 'The AI API key is not configured. Please check your environment variables.',
//         },
//         { status: 500 }
//       );
//     }

// const model = "gemini-3-flash-preview";

//     const prompt = `
//       You are an advanced AI Personalized Health Recommendations Engine.
//       Analyze the following patient data and provide comprehensive, deep wellness recommendations.
      
//       Patient Profile:
//       ${JSON.stringify(patientData, null, 2)}
      
//       Please provide your analysis in the following JSON format:
//       {
//         "status": "success",
//         "summary": "Deep overall health summary explaining the 'why' behind current status",
//         "deepAnalysis": "A detailed scientific and physiological exploration of the patient's current health state based on the metrics provided (Age, BMI, BP, Symptoms, etc.). Connect different markers together.",
//         "riskAssessment": [
//           { "condition": "Diabetes", "riskLevel": "Low/Medium/High", "reason": "Detailed physiological explanation for this risk", "prevention": "Evidence-based preventive steps" }
//         ],
//         "dietRecommendations": {
//           "focus": "Main goal",
//           "recommendations": ["Detailed bullet points with scientific context"],
//           "foodsToAvoid": ["Items to limit with explanations of their impact"]
//         },
//         "exercisePlan": {
//           "type": "Recommended exercise types",
//           "frequency": "Frequency",
//           "routine": ["Specific exercises with anatomical focus"],
//           "safetyPrecautions": ["What to watch out for scientifically"]
//         },
//         "mentalWellness": {
//           "assessment": "Detailed psychological/sleep analysis",
//           "advice": ["Actionable steps with neurological context"]
//         },
//         "preventiveCare": ["Screenings or checkups with clinical reasoning"],
//         "criticalAlert": "Only if emergency symptoms are detected, otherwise null"
//       }
      
//       Safety Rules:
//       1. Always state you are an AI, not a doctor.
//       2. If emergency symptoms (chest pain, stroke signs) are detected, set "criticalAlert" to a strong warning and prioritize it.
//       3. Pay close attention to "currentProblems" or "symptoms" provided by the patient and address them in the summary and relevant sections.
//       4. Use medically aware, safe, and professional language. Focus on realistic, sustainable habits.
//     `;

//     // Use retry logic for API calls
//     const responseText = await generateWithRetry(model, prompt, {
//       temperature: 0.3,
//     });

//     console.log('✅ Gemini Response Received');

//     try {
//       const parsedResponse = JSON.parse(responseText);
//       return NextResponse.json(parsedResponse);
//     } catch (parseError) {
//       console.error('Failed to parse Gemini response:', parseError);
//       return NextResponse.json(
//         {
//           error: 'Invalid analysis format',
//           details: 'The AI returned an unparseable response.',
//         },
//         { status: 500 }
//       );
//     }
//   } catch (error: any) {
//     console.error('Gemini API Error:', error);
//     return NextResponse.json(
//       {
//         error: 'Failed to analyze health data',
//         details: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }


// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ai, generateWithRetry } from '@/lib/gemini';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { patientData, userId, saveToHistory = true } = await request.json();

    if (!patientData) {
      return NextResponse.json(
        { error: 'Missing patient data' },
        { status: 400 }
      );
    }

    console.log('📊 Analyzing health data...');

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('Critical: GEMINI_API_KEY is missing from environment variables.');
      return NextResponse.json(
        {
          error: 'Server Configuration Error',
          details: 'The AI API key is not configured. Please check your environment variables.',
        },
        { status: 500 }
      );
    }

    const model = "gemini-3-flash-preview";

    const prompt = `
      You are an advanced AI Personalized Health Recommendations Engine.
      Analyze the following patient data and provide comprehensive, deep wellness recommendations.
      
      Patient Profile:
      ${JSON.stringify(patientData, null, 2)}
      
      Please provide your analysis in the following JSON format:
      {
        "status": "success",
        "summary": "Deep overall health summary explaining the 'why' behind current status",
        "deepAnalysis": "A detailed scientific and physiological exploration of the patient's current health state based on the metrics provided (Age, BMI, BP, Symptoms, etc.). Connect different markers together.",
        "riskAssessment": [
          { "condition": "Diabetes", "riskLevel": "Low/Medium/High", "reason": "Detailed physiological explanation for this risk", "prevention": "Evidence-based preventive steps" }
        ],
        "dietRecommendations": {
          "focus": "Main goal",
          "recommendations": ["Detailed bullet points with scientific context"],
          "foodsToAvoid": ["Items to limit with explanations of their impact"]
        },
        "exercisePlan": {
          "type": "Recommended exercise types",
          "frequency": "Frequency",
          "routine": ["Specific exercises with anatomical focus"],
          "safetyPrecautions": ["What to watch out for scientifically"]
        },
        "mentalWellness": {
          "assessment": "Detailed psychological/sleep analysis",
          "advice": ["Actionable steps with neurological context"]
        },
        "preventiveCare": ["Screenings or checkups with clinical reasoning"],
        "criticalAlert": "Only if emergency symptoms are detected, otherwise null"
      }
      
      Safety Rules:
      1. Always state you are an AI, not a doctor.
      2. If emergency symptoms (chest pain, stroke signs) are detected, set "criticalAlert" to a strong warning and prioritize it.
      3. Pay close attention to "currentProblems" or "symptoms" provided by the patient and address them in the summary and relevant sections.
      4. Use medically aware, safe, and professional language. Focus on realistic, sustainable habits.
    `;

    // Use retry logic for API calls
    const responseText = await generateWithRetry(model, prompt, {
      temperature: 0.3,
    });

    console.log('✅ Gemini Response Received');

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return NextResponse.json(
        {
          error: 'Invalid analysis format',
          details: 'The AI returned an unparseable response.',
        },
        { status: 500 }
      );
    }

    // ============================================
    // AUTO-SAVE TO DATABASE
    // ============================================
    let savedRecord = null;
    if (userId && saveToHistory) {
      try {
        // Determine risk level from assessment
        let riskLevel = 'Low';
        if (parsedResponse.riskAssessment && parsedResponse.riskAssessment.length > 0) {
          const hasHighRisk = parsedResponse.riskAssessment.some((r: any) => r.riskLevel === 'High');
          const hasMediumRisk = parsedResponse.riskAssessment.some((r: any) => r.riskLevel === 'Medium');
          if (hasHighRisk) riskLevel = 'High';
          else if (hasMediumRisk) riskLevel = 'Medium';
        }

        // Create table if not exists
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Insert the analysis record
        const insertResult = await query(
          `INSERT INTO health_analysis_history (
            user_id, 
            patient_name, 
            patient_age, 
            patient_gender, 
            patient_data, 
            analysis_report, 
            summary,
            risk_level
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id`,
          [
            userId,
            patientData.name || 'Unknown',
            patientData.age || null,
            patientData.gender || null,
            JSON.stringify(patientData),
            JSON.stringify(parsedResponse),
            parsedResponse.summary || '',
            riskLevel
          ]
        );

        savedRecord = { id: insertResult.rows[0].id, saved: true };
        console.log('✅ Analysis auto-saved to database with ID:', insertResult.rows[0].id);
        
      } catch (dbError: any) {
        console.error('Database save error:', dbError);
        savedRecord = { saved: false, error: dbError.message };
      }
    }

    // Return response with save status
    return NextResponse.json({
      ...parsedResponse,
      _saved: savedRecord ? savedRecord.saved : false,
      _savedId: savedRecord?.id || null,
      _savedError: savedRecord?.error || null
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze health data',
        details: error.message,
      },
      { status: 500 }
    );
  }
}