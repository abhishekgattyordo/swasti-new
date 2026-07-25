// import { NextResponse } from "next/server";
// import {
//   getSpeechLanguage,
//   getSpeechModel,
//   getStreamingConnectionConfig,
//   isSpeechConfigured,
// } from "@/lib/speech";

// export async function POST(request: Request) {
//   if (!isSpeechConfigured()) {
//     return NextResponse.json(
//       {
//         error: "Live speech is not available.",
//         code: "SPEECH_NOT_CONFIGURED",
//       },
//       { status: 503 }
//     );
//   }

//   let language: string | undefined;
//   try {
//     const body = await request.json();
//     if (typeof body?.language === "string" && body.language.trim()) {
//       language = body.language.trim();
//     }
//   } catch {
//     // No body — use default language from env.
//   }

//   try {
//     const config = await getStreamingConnectionConfig(
//       language ? { language } : undefined
//     );
//     return NextResponse.json(config);
//   } catch (error) {
//     const message =
//       error instanceof Error ? error.message : "Failed to create streaming config";

//     return NextResponse.json(
//       { error: message, code: "STREAM_CONFIG_ERROR" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   return NextResponse.json({
//     configured: isSpeechConfigured(),
//     model: isSpeechConfigured() ? getSpeechModel() : null,
//     language: isSpeechConfigured() ? getSpeechLanguage() : null,
//     liveTranscription: isSpeechConfigured(),
//   });
// }




import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const isConfigured = !!process.env.GOOGLE_SPEECH_API_KEY;

  if (!isConfigured) {
    return NextResponse.json(
      {
        error: "Live speech is not available.",
        code: "SPEECH_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  let language: string | undefined;
  try {
    const body = await request.json();
    if (typeof body?.language === "string" && body.language.trim()) {
      language = body.language.trim();
    }
  } catch {
    // No body — use default language from env.
  }

  try {
    // Build config from environment variables
    const config = {
      language: language || process.env.SPEECH_LANGUAGE || "en-US",
      model: process.env.SPEECH_MODEL || "latest_long",
      streaming: true,
      // You can add more fields as needed by your frontend
    };
    return NextResponse.json(config);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create streaming config";

    return NextResponse.json(
      { error: message, code: "STREAM_CONFIG_ERROR" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const isConfigured = !!process.env.GOOGLE_SPEECH_API_KEY;
  return NextResponse.json({
    configured: isConfigured,
    model: isConfigured ? (process.env.SPEECH_MODEL || "latest_long") : null,
    language: isConfigured ? (process.env.SPEECH_LANGUAGE || "en-US") : null,
    liveTranscription: isConfigured,
  });
}