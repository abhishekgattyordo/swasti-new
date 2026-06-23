const SPEECH_API_KEY = "075773010956af940b6a16a73f9222046362a379";
const SPEECH_LANGUAGE = "multi";

export function isSpeechConfigured(): boolean {
  return Boolean(SPEECH_API_KEY);
}

export function getSpeechApiKey(): string {
  return SPEECH_API_KEY;
}

/**
 * Primary languages for HIS: English, Kannada, Hindi.
 * Use `multi` for live code-switching (recommended).
 */
export const PRIMARY_LANGUAGES = ["English", "Kannada", "Hindi"] as const;

export function getSpeechLanguage(): string {
  return SPEECH_LANGUAGE;
}

export function isMultilingualMode(): boolean {
  return getSpeechLanguage() === "multi";
}

export function getModelForLanguage(language: string): string {
  if (language === "en") {
    return "nova-3-medical";
  }

  if (
    language === "multi" ||
    language === "hi" ||
    language === "kn" ||
    language === "ta" ||
    language === "ml"
  ) {
    return "nova-3";
  }

  return "nova-3-medical";
}

export function getSpeechModel(): string {
  return getModelForLanguage(getSpeechLanguage());
}

export function getSpeechTranscriptionOptions() {
  return {
    smart_format: true,
    punctuate: true,
    diarize: true,
    utterances: true,
    language: getSpeechLanguage(),
  } as const;
}

export function getSpeechStreamingOptions() {
  const language = getSpeechLanguage();

  const options: Record<string, string | boolean> = {
    smart_format: true,
    punctuate: true,
    diarize: true,
    interim_results: true,
    language,
  };

  if (language === "multi") {
    options.endpointing = "100";
  }

  return options;
}
