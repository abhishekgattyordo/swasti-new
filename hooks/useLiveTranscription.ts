// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   LiveTranscriptionSession,
//   mapMicLocale,
//   type LiveTranscriptState,
// } from "@/lib/speech";

// export type LiveMicStatus = "idle" | "connecting" | "listening";

// interface ToggleOptions {
//   micLanguage: string;
//   clearOnStart?: boolean;
// }

// interface UseLiveTranscriptionOptions {
//   onError?: (message: string) => void;
//   onStart?: () => void;
//   onStop?: (state: LiveTranscriptState) => void;
// }

// function micErrorMessage(err: unknown): string {
//   if (
//     err instanceof DOMException &&
//     (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
//   ) {
//     return "Microphone permission denied. Please allow access and try again.";
//   }
//   return err instanceof Error ? err.message : "Failed to start recording";
// }

// export function useLiveTranscription(options: UseLiveTranscriptionOptions = {}) {
//   const [status, setStatus] = useState<LiveMicStatus>("idle");
//   const [fullText, setFullText] = useState("");
//   const [interimText, setInterimText] = useState("");
//   const sessionRef = useRef<LiveTranscriptionSession | null>(null);
//   const statusRef = useRef<LiveMicStatus>("idle");

//   const onErrorRef = useRef(options.onError);
//   const onStartRef = useRef(options.onStart);
//   const onStopRef = useRef(options.onStop);

//   useEffect(() => {
//     onErrorRef.current = options.onError;
//     onStartRef.current = options.onStart;
//     onStopRef.current = options.onStop;
//   }, [options.onError, options.onStart, options.onStop]);

//   useEffect(() => {
//     statusRef.current = status;
//   }, [status]);

//   useEffect(() => {
//     return () => {
//       sessionRef.current?.cancel();
//     };
//   }, []);

//   const stop = useCallback(async () => {
//     const session = sessionRef.current;
//     if (!session) {
//       setStatus("idle");
//       return null;
//     }

//     try {
//       const state = await session.stop();
//       setFullText(state.fullText);
//       setInterimText("");
//       onStopRef.current?.(state);
//       return state;
//     } catch (err) {
//       console.error("Stop error:", err);
//       return null;
//     } finally {
//       sessionRef.current = null;
//       setStatus("idle");
//     }
//   }, []);

//   const toggle = useCallback(async ({ micLanguage, clearOnStart = true }: ToggleOptions) => {
//     if (statusRef.current === "connecting") return;

//     if (statusRef.current === "listening") {
//       await stop();
//       return;
//     }

//     sessionRef.current?.cancel();
//     if (clearOnStart) {
//       setFullText("");
//       setInterimText("");
//     }

//     const session = new LiveTranscriptionSession();
//     sessionRef.current = session;
//     setStatus("connecting");

//     try {
//       await session.start(
//         (state) => {
//           setFullText(state.fullText);
//           setInterimText(state.interimText);
//         },
//         { language: mapMicLocale(micLanguage) }
//       );
//       setStatus("listening");
//       onStartRef.current?.();
//     } catch (err) {
//       sessionRef.current = null;
//       setStatus("idle");
//       onErrorRef.current?.(micErrorMessage(err));
//     }
//   }, [stop]);

//   const cancel = useCallback(() => {
//     sessionRef.current?.cancel();
//     sessionRef.current = null;
//     setStatus("idle");
//     setInterimText("");
//   }, []);

//   return {
//     status,
//     isConnecting: status === "connecting",
//     isListening: status === "listening",
//     isActive: status !== "idle",
//     fullText,
//     interimText,
//     setFullText,
//     setInterimText,
//     toggle,
//     stop,
//     cancel,
//   };
// }




"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LiveTranscriptionSession,
  mapMicLocale,
  type LiveTranscriptionState,
} from "@/lib/speech";

export type LiveMicStatus = "idle" | "connecting" | "listening";

interface ToggleOptions {
  micLanguage: string;
  clearOnStart?: boolean;
}

interface UseLiveTranscriptionOptions {
  onError?: (message: string) => void;
  onStart?: () => void;
  onStop?: (state: LiveTranscriptionState) => void;
}

function micErrorMessage(err: unknown): string {
  if (
    err instanceof DOMException &&
    (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
  ) {
    return "Microphone permission denied. Please allow access and try again.";
  }
  return err instanceof Error ? err.message : "Failed to start recording";
}

export function useLiveTranscription(options: UseLiveTranscriptionOptions = {}) {
  const [status, setStatus] = useState<LiveMicStatus>("idle");
  const [fullText, setFullText] = useState("");
  const [interimText, setInterimText] = useState("");
  const sessionRef = useRef<LiveTranscriptionSession | null>(null);
  const statusRef = useRef<LiveMicStatus>("idle");

  const onErrorRef = useRef(options.onError);
  const onStartRef = useRef(options.onStart);
  const onStopRef = useRef(options.onStop);

  useEffect(() => {
    onErrorRef.current = options.onError;
    onStartRef.current = options.onStart;
    onStopRef.current = options.onStop;
  }, [options.onError, options.onStart, options.onStop]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    return () => {
      sessionRef.current?.cancel();
    };
  }, []);

  const stop = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) {
      setStatus("idle");
      return null;
    }

    try {
      const state = await session.stop();
      setFullText(state.fullText);
      setInterimText("");
      onStopRef.current?.(state);
      return state;
    } catch (err) {
      console.error("Stop error:", err);
      return null;
    } finally {
      sessionRef.current = null;
      setStatus("idle");
    }
  }, []);

  const toggle = useCallback(async ({ micLanguage, clearOnStart = true }: ToggleOptions) => {
    if (statusRef.current === "connecting") return;

    if (statusRef.current === "listening") {
      await stop();
      return;
    }

    sessionRef.current?.cancel();
    if (clearOnStart) {
      setFullText("");
      setInterimText("");
    }

    const session = new LiveTranscriptionSession();
    sessionRef.current = session;
    setStatus("connecting");

    try {
      await session.start(
        (state) => {
          setFullText(state.fullText);
          setInterimText(state.interimText);
        },
        { language: mapMicLocale(micLanguage) }
      );
      setStatus("listening");
      onStartRef.current?.();
    } catch (err) {
      sessionRef.current = null;
      setStatus("idle");
      onErrorRef.current?.(micErrorMessage(err));
    }
  }, [stop]);

  const cancel = useCallback(() => {
    sessionRef.current?.cancel();
    sessionRef.current = null;
    setStatus("idle");
    setInterimText("");
  }, []);

  return {
    status,
    isConnecting: status === "connecting",
    isListening: status === "listening",
    isActive: status !== "idle",
    fullText,
    interimText,
    setFullText,
    setInterimText,
    toggle,
    stop,
    cancel,
  };
}