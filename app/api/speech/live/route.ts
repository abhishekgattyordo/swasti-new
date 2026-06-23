import { NextResponse } from "next/server";
import {
  getSpeechLanguage,
  getSpeechModel,
  getStreamingConnectionConfig,
  isSpeechConfigured,
} from "@/lib/speech";

export async function POST(request: Request) {
  if (!isSpeechConfigured()) {
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
    const config = await getStreamingConnectionConfig(
      language ? { language } : undefined
    );
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
  return NextResponse.json({
    configured: isSpeechConfigured(),
    model: isSpeechConfigured() ? getSpeechModel() : null,
    language: isSpeechConfigured() ? getSpeechLanguage() : null,
    liveTranscription: isSpeechConfigured(),
  });
}
