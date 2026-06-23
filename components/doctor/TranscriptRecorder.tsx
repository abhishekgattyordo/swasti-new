// components/doctor/TranscriptRecorder.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface TranscriptRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  initialTranscript?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function TranscriptRecorder({ onTranscriptChange, initialTranscript = "" }: TranscriptRecorderProps) {
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [micLanguage, setMicLanguage] = useState("kn-IN");
  const [transcript, setTranscript] = useState(initialTranscript);
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState("");
  const [restartCount, setRestartCount] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef(initialTranscript);
  const shouldRestartRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update parent when transcript changes
  useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

  // ✅ Sync finalTranscriptRef with transcript state
  useEffect(() => {
    finalTranscriptRef.current = transcript;
  }, [transcript]);

  // ✅ Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
  }, []);

  // ✅ Handle recording duration with start/stop logic in event handlers
  const startDurationTimer = () => {
    setRecordingDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Initialize speech recognition with language support
  const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = micLanguage === "tulu" ? "kn-IN" : micLanguage;
    recognition.maxAlternatives = 1;
    
    return recognition;
  };

  const startRecognitionEngine = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      console.log("Recognition engine started");
    } catch (err) {
      console.error("Start error:", err);
    }
  };

  // Start recording with microphone
  const startRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      toast.error("Microphone permission denied. Please allow access and try again.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const recognition = initSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
    setEditableTranscript("");
    setRestartCount(0);
    shouldRestartRef.current = true;
    
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPiece + " ";
        } else {
          interim += transcriptPiece;
        }
      }
      
      if (final) {
        finalTranscriptRef.current += final;
        setTranscript(finalTranscriptRef.current);
        setEditableTranscript(finalTranscriptRef.current);
      }
      setInterimTranscript(interim);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'no-speech') {
        return;
      }
      if (event.error === 'network' || event.error === 'not-allowed') {
        toast.error(`Recording error: ${event.error}. Please check microphone.`);
        shouldRestartRef.current = false;
        setIsRecording(false);
        stopDurationTimer();
      }
    };
    
    recognition.onend = () => {
      if (shouldRestartRef.current) {
        console.log("Auto-restarting recognition...");
        setRestartCount((prev) => prev + 1);
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldRestartRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.error("Failed to restart, creating new instance:", err);
              const newRec = initSpeechRecognition();
              if (newRec) {
                newRec.onresult = recognition.onresult;
                newRec.onerror = recognition.onerror;
                newRec.onend = recognition.onend;
                recognitionRef.current = newRec;
                try {
                  newRec.start();
                } catch (e) {
                  toast.error("Auto-restart failed. Please click 'Stop Recording'.");
                  shouldRestartRef.current = false;
                  setIsRecording(false);
                  stopDurationTimer();
                }
              }
            }
          }
        }, 50);
      } else {
        setIsRecording(false);
        stopDurationTimer();
        if (finalTranscriptRef.current) {
          toast.success("Recording stopped. Click 'View Transcript' to see and edit the conversation.");
        }
      }
    };
    
    startRecognitionEngine();
    setIsRecording(true);
    startDurationTimer();
    toast.success(`🎤 Microphone calibrated for [${micLanguage}]. Speak continuously!`);
  };

  // Stop recording
  const stopRecording = () => {
    shouldRestartRef.current = false;
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Stop error", e);
      }
    }
    setIsRecording(false);
    stopDurationTimer();
  };

  // Clear transcript
  const clearTranscript = () => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setEditableTranscript("");
    toast.success("Transcript cleared");
  };

  // Open transcript dialog
  const openTranscriptDialog = () => {
    setEditableTranscript(transcript);
    setEditMode(true);
    setShowTranscriptDialog(true);
  };

  // Save edited transcript
  const saveEditedTranscript = () => {
    setTranscript(editableTranscript);
    finalTranscriptRef.current = editableTranscript;
    setEditMode(false);
    toast.success("Transcript updated successfully");
  };

  // Check if transcript exists (using state only)
  const hasTranscript = !!transcript;

  return (
    <>
      {/* AI Generate Button Section with Multi-Language Microphone */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600">
                auto_awesome
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Clinical Scribe
              </h3>
              <p className="text-xs text-slate-500">
                Record consultation in any Indian language
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap items-center">
            {/* Language Selection Dropdown */}
            <div className="flex items-center gap-1 bg-white border border-purple-200 px-3 py-2 rounded-lg shadow-2xs">
              <span className="material-symbols-outlined text-[18px] text-blue-500 shrink-0">globe</span>
              <select 
                className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer pr-1"
                value={micLanguage}
                onChange={(e) => {
                  setMicLanguage(e.target.value);
                  toast.success(`Microphone calibrated to: ${e.target.value === "kn-IN" ? "Kannada" : e.target.value}`);
                }}
              >
                <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
                <option value="hi-IN">हिंदी (Hindi / Hinglish)</option>
                <option value="ta-IN">தமிழ் (Tamil)</option>
                <option value="ml-IN">മലയാളം (Malayalam)</option>
                <option value="tulu">Tulu (ತುಳು)</option>
                <option value="en-IN">Indian English Accent</option>
                <option value="en-US">US English (Standard)</option>
              </select>
            </div>

            {/* Record Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md text-xs font-bold ${
                isRecording 
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isRecording ? "mic" : "mic"}
              </span>
              {isRecording ? `Recording... ${recordingDuration}s` : "Start Recording"}
            </button>
            
            {/* Stop Button */}
            {isRecording && (
              <button
                type="button"
                onClick={stopRecording}
                className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200 flex items-center gap-2 shadow-md text-xs font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">stop</span>
                Stop
              </button>
            )}
            
            {/* View/Edit Transcript Button */}
            <button
              type="button"
              onClick={openTranscriptDialog}
              disabled={!hasTranscript}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">
                view_list
              </span>
              View/Edit Transcript
              {hasTranscript && (
                <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                  {transcript.split(' ').length}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Recording Status Indicator */}
        {isRecording && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
            <span>
              Listening continuously... Calibrated for <strong>{micLanguage}</strong>. Speak naturally!
              {restartCount > 0 && ` (Auto-restarted ${restartCount} times)`}
            </span>
          </div>
        )}
        
        {/* Live Transcript Preview */}
        {hasTranscript && !showTranscriptDialog && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 shadow-3xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Live Transcript Preview:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openTranscriptDialog}
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={clearTranscript}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-600 line-clamp-3 font-mono leading-relaxed bg-slate-50/50 p-2.5 rounded-lg">
              {transcript}
            </p>
          </div>
        )}
      </div>

      {/* Transcript Dialog Modal - Editable */}
      {showTranscriptDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">
                  {editMode ? "edit" : "description"}
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {editMode ? "Edit Conversation Transcript" : "Conversation Transcript"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {!editMode && hasTranscript && (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-blue-600"
                    title="Edit transcript"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                )}
                {editMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setEditableTranscript(transcript);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-gray-600"
                    title="Cancel edit"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowTranscriptDialog(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {editMode ? (
                <textarea
                  value={editableTranscript}
                  onChange={(e) => setEditableTranscript(e.target.value)}
                  className="w-full h-full min-h-[400px] rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-4 shadow-sm font-mono"
                  placeholder="Edit the transcript here. You can add, remove, or modify any part of the conversation..."
                />
              ) : (
                <div className="bg-slate-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                    {transcript || "No transcript available. Click the microphone button to start recording."}
                  </pre>
                  {interimTranscript && !editMode && (
                    <div className="text-slate-400 italic mt-2">
                      {interimTranscript}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t">
              {editMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setEditableTranscript(transcript);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEditedTranscript}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      save
                    </span>
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={clearTranscript}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={!hasTranscript}
                  >
                    Clear Transcript
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTranscriptDialog(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}