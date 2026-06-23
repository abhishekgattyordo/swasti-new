export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: number;
}

export interface TranscriptUtterance {
  speaker: number;
  text: string;
  start: number;
  end: number;
}

export interface Transcript {
  text: string;
  words: TranscriptWord[];
  utterances: TranscriptUtterance[];
  durationSeconds: number;
  confidence: number;
}

export interface TranscriptionResult {
  transcript: Transcript;
}

export interface StreamTranscriptEvent {
  transcript: string;
  isFinal: boolean;
}

export interface LiveTranscriptState {
  interimText: string;
  finalLines: string[];
  fullText: string;
}

export interface StreamingConnectionConfig {
  websocketUrl: string;
  model: string;
  language: string;
  access_token: string;
  expires_in: number;
  options: ReturnType<typeof import("./config").getSpeechStreamingOptions>;
}
