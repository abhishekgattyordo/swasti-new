export {
  isSpeechConfigured,
  getSpeechApiKey,
  getSpeechLanguage,
  getSpeechModel,
  getModelForLanguage,
  getSpeechTranscriptionOptions,
  getSpeechStreamingOptions,
  PRIMARY_LANGUAGES,
  isMultilingualMode,
  mapMicLocale,
} from "./config";

export {
  transcribeAudio,
  transcribeAudioUrl,
  formatTranscriptWithSpeakers,
  createLiveTranscriptionToken,
  getStreamingConnectionConfig,
  NoSpeechDetectedError,
  speechConfig,
} from "./client";

export {
  createListenConnection,
  transcribeLiveAudioUrl,
  type LiveListenOptions,
} from "./stream";

export { LiveTranscriptionSession, type LiveTranscriptState } from "./live";

export type {
  Transcript,
  TranscriptWord,
  TranscriptUtterance,
  TranscriptionResult,
  StreamTranscriptEvent,
  StreamingConnectionConfig,
} from "./types";
