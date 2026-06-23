import { DeepgramClient, type Deepgram } from "@deepgram/sdk";
import {
  getSpeechApiKey,
  getSpeechLanguage,
  getSpeechModel,
  getModelForLanguage,
  getSpeechStreamingOptions,
  getSpeechTranscriptionOptions,
} from "./config";
import type {
  StreamingConnectionConfig,
  Transcript,
  TranscriptUtterance,
  TranscriptWord,
  TranscriptionResult,
} from "./types";

const LIVE_LISTEN_URL = "wss://api.deepgram.com/v1/listen";

function getClient() {
  return new DeepgramClient({ apiKey: getSpeechApiKey() });
}

type ProviderWord = {
  word?: string;
  start?: number;
  end?: number;
  confidence?: number;
  speaker?: number;
};

function parseWords(words: ProviderWord[]): TranscriptWord[] {
  return words.map((w) => ({
    word: w.word ?? "",
    start: w.start ?? 0,
    end: w.end ?? 0,
    confidence: w.confidence ?? 0,
    speaker: w.speaker,
  }));
}

function parseUtterances(
  utterances: NonNullable<Deepgram.ListenV1Response["results"]["utterances"]>
): TranscriptUtterance[] {
  return utterances.map((u) => ({
    speaker: u.speaker ?? 0,
    text: u.transcript ?? "",
    start: u.start ?? 0,
    end: u.end ?? 0,
  }));
}

function assertListenResponse(
  response: Deepgram.ListenV1Response | Deepgram.ListenV1AcceptedResponse
): Deepgram.ListenV1Response {
  if (!("results" in response)) {
    throw new Error(
      "Transcription was queued for async processing. Provide a direct audio upload instead."
    );
  }
  return response;
}

function buildTranscript(response: Deepgram.ListenV1Response): Transcript {
  const channel = response.results.channels?.[0];
  const alternative = channel?.alternatives?.[0];

  if (!alternative) {
    throw new Error("No transcription results returned");
  }

  const text = alternative.transcript?.trim() ?? "";
  const words = alternative.words ? parseWords(alternative.words) : [];
  const utterances = response.results.utterances
    ? parseUtterances(response.results.utterances)
    : [];

  if (!text && words.length === 0 && utterances.length === 0) {
    const duration = response.metadata?.duration ?? 0;
    throw new NoSpeechDetectedError(duration);
  }

  const duration =
    response.metadata?.duration ??
    (words.length > 0 ? (words[words.length - 1].end ?? 0) : 0);

  return {
    text,
    words,
    utterances,
    durationSeconds: duration,
    confidence: alternative.confidence ?? 0,
  };
}

export class NoSpeechDetectedError extends Error {
  readonly durationSeconds: number;

  constructor(durationSeconds: number) {
    super(
      durationSeconds < 0.5
        ? "Recording is too short. Speak for at least 2–3 seconds and try again."
        : "No speech detected in the audio. Speak clearly and try again."
    );
    this.name = "NoSpeechDetectedError";
    this.durationSeconds = durationSeconds;
  }
}

const transcriptionOptions = getSpeechTranscriptionOptions();
const streamingOptions = getSpeechStreamingOptions();

function normalizeMimeType(mimeType: string): string {
  const base = mimeType.split(";")[0].trim().toLowerCase();
  if (!base || base === "application/octet-stream") {
    return "audio/wav";
  }
  return mimeType;
}

export async function transcribeAudio(
  audio: Buffer,
  mimeType: string
): Promise<TranscriptionResult> {
  if (audio.length < 500) {
    throw new NoSpeechDetectedError(0);
  }

  const client = getClient();
  const response = await client.listen.v1.media.transcribeFile(
    audio,
    {
      model: getSpeechModel(),
      ...transcriptionOptions,
    },
    {
      headers: {
        "Content-Type": normalizeMimeType(mimeType),
      },
    }
  );

  return { transcript: buildTranscript(assertListenResponse(response)) };
}

export async function transcribeAudioUrl(
  audioUrl: string
): Promise<TranscriptionResult> {
  const client = getClient();
  const response = await client.listen.v1.media.transcribeUrl({
    url: audioUrl,
    model: getSpeechModel(),
    ...transcriptionOptions,
  });

  return { transcript: buildTranscript(assertListenResponse(response)) };
}

export function formatTranscriptWithSpeakers(transcript: Transcript): string {
  if (transcript.utterances.length > 0) {
    return transcript.utterances
      .map((u) => `Speaker ${u.speaker + 1}: ${u.text}`)
      .join("\n");
  }
  return transcript.text;
}

export async function createLiveTranscriptionToken(ttlSeconds = 600): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const client = getClient();
  const response = await client.auth.v1.tokens.grant({
    ttl_seconds: ttlSeconds,
  });

  return {
    access_token: response.access_token,
    expires_in: response.expires_in ?? ttlSeconds,
  };
}

export async function getStreamingConnectionConfig(options?: {
  language?: string;
}): Promise<StreamingConnectionConfig> {
  const language = options?.language?.trim() || getSpeechLanguage();
  const model = getModelForLanguage(language);

  const token = await createLiveTranscriptionToken();

  return {
    model,
    language,
    options: {
      ...getSpeechStreamingOptions(),
      language,
    },
    websocketUrl: LIVE_LISTEN_URL,
    access_token: token.access_token,
    expires_in: token.expires_in,
  };
}

export const speechConfig = {
  model: getSpeechModel(),
  options: streamingOptions,
};
