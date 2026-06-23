import type { LiveTranscriptState } from "./types";

interface StreamingConfigResponse {
  access_token: string;
  websocketUrl: string;
  model: string;
  language: string;
  message?: string;
  error?: string;
}

interface LiveResultMessage {
  type: string;
  is_final?: boolean;
  channel?: {
    alternatives?: { transcript?: string }[];
  };
}

function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  return buffer;
}

export class LiveTranscriptionSession {
  private socket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private mediaStream: MediaStream | null = null;
  private finalLines: string[] = [];
  private interimText = "";

  private getState(): LiveTranscriptState {
    const parts = [...this.finalLines];
    if (this.interimText.trim()) {
      parts.push(this.interimText.trim());
    }

    return {
      interimText: this.interimText,
      finalLines: [...this.finalLines],
      fullText: parts.join(" "),
    };
  }

  async start(
    onUpdate: (state: LiveTranscriptState) => void,
    options?: { language?: string }
  ): Promise<void> {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext();
    const sampleRate = Math.round(this.audioContext.sampleRate);

    const configResponse = await fetch("/api/speech/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        options?.language ? { language: options.language } : {}
      ),
    });
    const config = (await configResponse.json()) as StreamingConfigResponse;

    if (!configResponse.ok) {
      this.cleanup();
      throw new Error(config.error ?? config.message ?? "Failed to start streaming");
    }

    const params = new URLSearchParams({
      model: config.model,
      language: config.language,
      encoding: "linear16",
      sample_rate: String(sampleRate),
    });

    const websocketUrl = `${config.websocketUrl}?${params}`;
    this.socket = new WebSocket(websocketUrl, ["token", config.access_token]);

    await new Promise<void>((resolve, reject) => {
      const socket = this.socket;
      if (!socket) {
        reject(new Error("WebSocket not initialized"));
        return;
      }

      socket.onopen = () => resolve();
      socket.onerror = () => {
        this.cleanup();
        reject(new Error("Live transcription WebSocket connection failed"));
      };
    });

    this.socket.onmessage = (event) => {
      let data: LiveResultMessage;
      try {
        data = JSON.parse(event.data as string) as LiveResultMessage;
      } catch {
        return;
      }

      if (data.type !== "Results") return;

      const transcript = data.channel?.alternatives?.[0]?.transcript ?? "";
      if (!transcript.trim()) return;

      if (data.is_final) {
        this.finalLines.push(transcript.trim());
        this.interimText = "";
      } else {
        this.interimText = transcript;
      }

      onUpdate(this.getState());
    };

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    const silentGain = this.audioContext.createGain();
    silentGain.gain.value = 0;

    this.processor.onaudioprocess = (event) => {
      if (this.socket?.readyState !== WebSocket.OPEN) return;
      const pcm = floatTo16BitPCM(event.inputBuffer.getChannelData(0));
      this.socket.send(pcm);
    };

    source.connect(this.processor);
    this.processor.connect(silentGain);
    silentGain.connect(this.audioContext.destination);

    onUpdate(this.getState());
  }

  async stop(): Promise<LiveTranscriptState> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "CloseStream" }));
      await new Promise((resolve) => setTimeout(resolve, 750));
    }

    this.cleanup();
    return this.getState();
  }

  cancel(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.processor?.disconnect();
    this.processor = null;

    if (this.audioContext?.state !== "closed") {
      void this.audioContext?.close();
    }
    this.audioContext = null;

    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = null;

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.socket = null;
  }
}

export type { LiveTranscriptState };
