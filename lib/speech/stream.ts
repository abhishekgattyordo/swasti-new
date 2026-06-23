import { DeepgramClient } from "@deepgram/sdk";
import {
  getSpeechApiKey,
  getSpeechModel,
  getSpeechStreamingOptions,
} from "./config";
import type { StreamTranscriptEvent } from "./types";

export interface LiveListenOptions {
  sampleRate?: number;
  encoding?: string;
  language?: string;
}

export async function createListenConnection(options: LiveListenOptions = {}) {
  const client = new DeepgramClient({ apiKey: getSpeechApiKey() });

  return client.listen.v1.connect({
    model: getSpeechModel(),
    ...getSpeechStreamingOptions(),
    encoding: options.encoding,
    sample_rate: options.sampleRate?.toString(),
  } as Parameters<typeof client.listen.v1.connect>[0]);
}

export async function transcribeLiveAudioUrl(
  streamUrl: string,
  onEvent: (event: StreamTranscriptEvent) => void
): Promise<string> {
  const connection = await createListenConnection();
  const finalLines: string[] = [];

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      connection.close();
      if (error) reject(error);
      else resolve(finalLines.join(" "));
    };

    connection.on("message", (data) => {
      if (data.type !== "Results" || !data.channel?.alternatives?.[0]) return;

      const transcript = data.channel.alternatives[0].transcript ?? "";
      if (!transcript.trim()) return;

      const isFinal = Boolean(data.is_final);
      onEvent({ transcript, isFinal });

      if (isFinal) {
        finalLines.push(transcript.trim());
      }
    });

    connection.on("error", (error) => finish(error));
    connection.on("close", () => finish());

    connection.connect();

    void connection
      .waitForOpen()
      .then(async () => {
        const response = await fetch(streamUrl, { redirect: "follow" });
        if (!response.ok) {
          throw new Error(`Failed to fetch stream URL (${response.status})`);
        }
        if (!response.body) {
          throw new Error("Stream URL returned no audio body");
        }

        const reader = response.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          connection.sendMedia(value);
        }

        connection.sendCloseStream({ type: "CloseStream" });
        await new Promise((resolveClose) => setTimeout(resolveClose, 750));
        finish();
      })
      .catch((error: unknown) => {
        finish(error instanceof Error ? error : new Error("Stream failed"));
      });
  });
}
