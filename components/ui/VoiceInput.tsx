"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function VoiceInput({ 
  onTranscript, 
  className = "",
  disabled = false 
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      setError("Voice input not supported in this browser");
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      onTranscript(transcriptText);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition:", err);
        setError("Failed to start voice input");
      }
    }
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-red-500 flex items-center gap-1">
        <MicOff className="w-3 h-3" />
        Voice not supported
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`
          p-2 rounded-full transition-all duration-200
          ${isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isListening ? "Stop listening" : "Start voice input"}
      >
        {isListening ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
      
      {isListening && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap z-10">
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full animate-pulse">
            Listening...
          </span>
        </div>
      )}
      
      {error && !isListening && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap z-10">
          <span className="text-xs text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
}