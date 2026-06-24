"use client";

import { Loader2, Mic, MicOff } from "lucide-react";
import type { LiveMicStatus } from "@/hooks/useLiveTranscription";

interface LiveMicButtonProps {
  status: LiveMicStatus;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
  className?: string;
  title?: string;
}

export function LiveMicButton({
  status,
  onClick,
  disabled = false,
  size = 16,
  className = "",
  title,
}: LiveMicButtonProps) {
  const isConnecting = status === "connecting";
  const isListening = status === "listening";

  const defaultTitle = isConnecting
    ? "Connecting microphone..."
    : isListening
      ? "Stop listening"
      : "Start listening";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isConnecting}
      title={title ?? defaultTitle}
      aria-busy={isConnecting}
      aria-pressed={isListening}
      className={className}
    >
      {isConnecting ? (
        <Loader2 size={size} className="animate-spin" />
      ) : isListening ? (
        <MicOff size={size} />
      ) : (
        <Mic size={size} />
      )}
    </button>
  );
}

interface LiveMicStatusLineProps {
  status: LiveMicStatus;
  interimText?: string;
  className?: string;
}

export function LiveMicStatusLine({
  status,
  interimText,
  className = "text-xs mt-1",
}: LiveMicStatusLineProps) {
  if (status === "connecting") {
    return (
      <p className={`${className} text-amber-600 animate-pulse flex items-center gap-1.5`}>
        <Loader2 className="w-3 h-3 animate-spin shrink-0" />
        Connecting microphone...
      </p>
    );
  }

  if (status === "listening") {
    if (interimText?.trim()) {
      return <p className={`${className} text-blue-600 italic`}>{interimText}</p>;
    }
    return (
      <p className={`${className} text-blue-600 animate-pulse flex items-center gap-1.5`}>
        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
        Listening...
      </p>
    );
  }

  return null;
}

export function liveMicButtonLabel(status: LiveMicStatus): string {
  if (status === "connecting") return "Connecting...";
  if (status === "listening") return "Stop Dictation";
  return "Start Dictation";
}
