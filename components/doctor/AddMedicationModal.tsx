'use client';

import React, { useState, useRef } from "react";
import { AudioRecorder } from "@/lib/audioRecorder";
import toast from "react-hot-toast";
import {
  Mic,
  StopCircle,
  Loader2,
  Globe,
  X,
  Plus,
  Pill,
  Send,
  Sparkles,
} from 'lucide-react';

export interface NewMedicationData {
  name: string;
  category: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface AddMedicationModalProps {
  onClose: () => void;
  onAdd: (medications: NewMedicationData[]) => void;
  patientId?: string;
  appointmentId?: string;
}

export default function AddMedicationModal({
  onClose,
  onAdd,
  patientId,
  appointmentId,
}: AddMedicationModalProps) {
  const [medications, setMedications] = useState<NewMedicationData[]>([
    { name: "", category: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micLanguage, setMicLanguage] = useState("en-IN");
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Refs
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const recordedAudioRef = useRef<{ base64: string; mimeType: string } | null>(null);

  const micLanguageLabels: Record<string, string> = {
    "kn-IN": "Kannada",
    "hi-IN": "Hindi",
    "en-IN": "English",
  };

  // ---- Recording functions ----
  const startRecording = async () => {
    if (audioRecorderRef.current) {
      try { await audioRecorderRef.current.stop(); } catch (e) {}
      audioRecorderRef.current = null;
    }

    recordedAudioRef.current = null;
    setHasRecordedAudio(false);
    setRecordedAudioUrl(null);

    const recorder = new AudioRecorder();
    audioRecorderRef.current = recorder;
    setIsConnecting(true);

    try {
      await recorder.start();
      setIsConnecting(false);
      setIsRecording(true);
      toast.success(`🎙️ Recording in ${micLanguageLabels[micLanguage] ?? micLanguage}. Speak clearly.`);
    } catch (err) {
      audioRecorderRef.current = null;
      setIsConnecting(false);
      const message = err instanceof Error ? err.message : "Failed to start recording";
      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
      ) {
        toast.error("Microphone permission denied. Please allow access and try again.");
      } else {
        toast.error(message);
      }
    }
  };

  const stopRecording = async () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) {
      setIsRecording(false);
      setIsConnecting(false);
      return;
    }

    try {
      const audioRes = await recorder.stop();
      const audioDataObj = {
        base64: audioRes.base64,
        mimeType: audioRes.mimeType,
      };
      recordedAudioRef.current = audioDataObj;
      const dataUrl = `data:${audioRes.mimeType};base64,${audioRes.base64}`;
      setRecordedAudioUrl(dataUrl);
      setHasRecordedAudio(true);
      toast.success("🎙️ Recording captured. Click 'Extract with AI' to process.");
    } catch (recorderErr) {
      console.warn("Audio recorder stop error:", recorderErr);
      toast.error("Failed to capture recording.");
    } finally {
      audioRecorderRef.current = null;
      setIsRecording(false);
      setIsConnecting(false);
    }
  };

  // ---- Process voice directly ----
  const handleProcessVoice = async () => {
    const audioData = recordedAudioRef.current;
    if (!audioData) {
      toast.error("No audio recording found. Please speak into the microphone.");
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("🧠 AI is extracting medications from your voice...");

    try {
      const response = await fetch("/api/doctors/parse-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: audioData.base64,
          mimeType: audioData.mimeType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse prescription.");
      }

      const parsedMeds = await response.json();
      if (parsedMeds && parsedMeds.length > 0) {
        const newMeds: NewMedicationData[] = parsedMeds.map((med: any) => ({
          name: med.name || "",
          category: med.category || "Other",
          dosage: med.dosage || "",
          frequency: med.frequency || "Once daily",
          duration: med.duration || "7 days",
          instructions: med.instructions || "",
        }));
        setMedications((prev) => [...prev, ...newMeds]);
        toast.success(`✅ ${newMeds.length} medication(s) extracted from voice!`);
        // Clear audio after successful parse
        recordedAudioRef.current = null;
        setHasRecordedAudio(false);
        setRecordedAudioUrl(null);
      } else {
        toast.error("No medications could be extracted. Please try again or enter manually.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Error processing voice: " + error.message);
    } finally {
      toast.dismiss(loadingToast);
      setIsProcessing(false);
    }
  };

  // ---- Manual row management ----
  const handleAddRow = () => {
    setMedications([
      ...medications,
      { name: "", category: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    } else {
      toast.error("At least one medication is required.");
    }
  };

  const handleChange = (index: number, field: keyof NewMedicationData, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  // ---- Submit handler ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validMedications = medications.filter(
      (med) => med.name.trim() && med.dosage.trim()
    );
    if (validMedications.length === 0) {
      toast.error("Please add at least one medication with name and dosage.");
      return;
    }

    // For now, we just pass the medications back to the parent
    // (the parent handles saving to the database)
    onAdd(validMedications);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Add Medications</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter prescriptions manually or via voice AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Voice dictation section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                AI Prescription Dictation
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-sm">
                  <Globe className="h-4 w-4 text-blue-500 shrink-0" />
                  <select
                    className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer pr-1"
                    value={micLanguage}
                    onChange={(e) => setMicLanguage(e.target.value)}
                    disabled={isRecording || isConnecting}
                  >
                    <option value="en-IN">English</option>
                    <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
                    <option value="hi-IN">हिंदी (Hindi / Hinglish)</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isConnecting || isProcessing}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition ${
                    isRecording
                      ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                      : isConnecting
                        ? "bg-amber-500 text-white"
                        : isProcessing
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isRecording ? (
                    <StopCircle className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {isConnecting
                    ? "Connecting..."
                    : isRecording
                      ? "Stop"
                      : isProcessing
                        ? "Processing..."
                        : "Record"}
                </button>
                {isProcessing && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Extracting...
                  </span>
                )}
              </div>
            </div>

            {hasRecordedAudio && recordedAudioUrl && (
              <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200">
                <audio controls src={recordedAudioUrl} className="w-full h-8" />
                <div className="flex justify-end mt-1 gap-2">
                  <button
                    type="button"
                    onClick={handleProcessVoice}
                    disabled={isProcessing}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    {isProcessing ? 'Processing...' : 'Extract with AI'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      recordedAudioRef.current = null;
                      setHasRecordedAudio(false);
                      setRecordedAudioUrl(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear audio
                  </button>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                <span>Recording in <strong>{micLanguageLabels[micLanguage] ?? micLanguage}</strong>. Speak clearly.</span>
              </div>
            )}
          </div>

          {/* Manual medications list */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700">Medications to Add ({medications.length})</h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Row
              </button>
            </div>

            {medications.map((med, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 relative">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-slate-700">Medication #{index + 1}</h4>
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Name *</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => handleChange(index, "name", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g. Amoxicillin"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Category</label>
                    <select
                      value={med.category}
                      onChange={(e) => handleChange(index, "category", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="Other">Other</option>
                      <option value="Antibiotic">Antibiotic</option>
                      <option value="Analgesic">Analgesic</option>
                      <option value="Antihypertensive">Antihypertensive</option>
                      <option value="Antidiabetic">Antidiabetic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Dosage *</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleChange(index, "dosage", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g. 500mg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Frequency</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => handleChange(index, "frequency", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g. Twice daily"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Duration</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => handleChange(index, "duration", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g. 7 days"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Instructions</label>
                    <textarea
                      value={med.instructions}
                      onChange={(e) => handleChange(index, "instructions", e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                      placeholder="e.g. Take with food"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddRow}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-400 transition flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Another Medication
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Add to Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}