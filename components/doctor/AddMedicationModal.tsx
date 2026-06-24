



"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLiveTranscription } from "@/hooks/useLiveTranscription";
import { LiveMicButton, LiveMicStatusLine } from "@/components/speech/LiveMicButton";

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
  initialValues?: Partial<NewMedicationData>;
  patientId?: string;
  appointmentId?: string;
}

interface WhatsAppStatus {
  patient: { sent: boolean; error?: string; messageId?: string };
  pharmacy: { sent: boolean; error?: string; messageId?: string };
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

  // WhatsApp states
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [inputMode, setInputMode] = useState<"speak" | "text">("speak");
  const [micLanguage, setMicLanguage] = useState("en-IN");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const {
    status: micStatus,
    isConnecting,
    isListening,
    isActive,
    fullText: transcript,
    interimText: interimTranscript,
    setFullText: setTranscript,
    toggle: handleToggleListening,
  } = useLiveTranscription({
    onError: (message) => alert(message),
  });

  useEffect(() => {
    if (isActive && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      let step = 0;

      const drawWave = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#137fec";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const points = 40;
        const width = canvas.width;
        const height = canvas.height;
        const midY = height / 2;
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * width;
          const amplitude = Math.sin((i / 4) - step / 8) * (5 + Math.random() * 8);
          const y = midY + amplitude;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        step += 1.2;
        animationRef.current = requestAnimationFrame(drawWave);
      };
      drawWave();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);
          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
        }
      }
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive]);

  const handleMicClick = () => {
    void handleToggleListening({ micLanguage, clearOnStart: true });
  };

  const handleProcessTranscript = async () => {
    const currentTranscript = transcript.trim();
    if (!currentTranscript) {
      alert("Please speak or type a prescription order.");
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch("/api/doctors/parse-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: currentTranscript }),
      });
      if (!response.ok) throw new Error("Failed to parse prescription.");
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
        setTranscript("");
      } else {
        alert("No medications could be extracted. Please rephrase (e.g., 'Amoxicillin 500mg twice daily for 7 days').");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error processing voice: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual row management (unchanged)
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
      alert("At least one medication is required.");
    }
  };

  const handleChange = (index: number, field: keyof NewMedicationData, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  // Submit handler (unchanged)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validMedications = medications.filter(
      (med) => med.name.trim() && med.dosage.trim()
    );
    if (validMedications.length === 0) {
      alert("Please add at least one medication with name and dosage.");
      return;
    }

    if (patientId && appointmentId) {
      setIsSaving(true);
      setWhatsappStatus(null);

      try {
        const response = await fetch(`/api/ehr/${patientId}/prescriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId,
            medications: validMedications,
            recordedBy: "Doctor",
            sendWhatsApp,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to save prescription");
        }

        if (data.whatsapp) {
          setWhatsappStatus(data.whatsapp);
        }

        alert(`✅ Prescription saved successfully!\n\n📱 WhatsApp Status:\nPatient: ${data.whatsapp?.patient?.sent ? '✅ Sent' : '❌ Failed'}\nPharmacy: ${data.whatsapp?.pharmacy?.sent ? '✅ Sent' : '❌ Failed'}`);

        onAdd(validMedications);
        onClose();

      } catch (error: any) {
        alert(`❌ Error: ${error.message}`);
      } finally {
        setIsSaving(false);
      }
    } else {
      onAdd(validMedications);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white">pill</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Add Medications</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter prescriptions manually or via voice AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Voice dictation section – updated with language selection and interim feedback */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                AI Prescription Dictation
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode("speak")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    inputMode === "speak"
                      ? "bg-[#137fec] text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  🎤 Speak
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    inputMode === "text"
                      ? "bg-[#137fec] text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  ⌨️ Type
                </button>
              </div>
            </div>

            {inputMode === "speak" ? (
              <div className="space-y-3">
                {/* Language Selector & Microphone controls */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-[18px] text-blue-500 shrink-0">globe</span>
                    <select
                      className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer pr-1"
                      value={micLanguage}
                      onChange={(e) => setMicLanguage(e.target.value)}
                      disabled={isActive}
                    >
                      <option value="en-IN">English</option>
                      <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
                      <option value="hi-IN">हिंदी (Hindi / Hinglish)</option>
                    </select>
                  </div>
                  <LiveMicButton
                    status={micStatus}
                    onClick={handleMicClick}
                    size={24}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 disabled:opacity-80 ${
                      isListening
                        ? "bg-rose-500 hover:bg-rose-600 animate-pulse"
                        : isConnecting
                          ? "bg-amber-500 hover:bg-amber-600"
                          : "bg-[#137fec] hover:bg-blue-600"
                    }`}
                  />
                  <div className="flex-1 h-10 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <canvas ref={canvasRef} width={400} height={40} className="w-full h-full"></canvas>
                  </div>
                </div>
                {/* Transcript area with interim feedback */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Transcript</label>
                  <div className="relative">
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono bg-white"
                      placeholder={
                        isConnecting
                          ? "Connecting microphone..."
                          : isListening
                            ? "Listening... speak clearly"
                            : "Click the microphone and say e.g. 'Amoxicillin 500mg twice daily for 7 days'"
                      }
                    />
                    <LiveMicStatusLine
                      status={micStatus}
                      interimText={interimTranscript}
                      className="absolute bottom-0 left-0 right-0 px-3 py-1 bg-amber-50 border-t border-amber-200 text-amber-700 text-xs italic"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Raw Text Order</label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="Type prescription directions, e.g.: 'Azithromycin 250mg once daily for 5 days, and Ibuprofen 400mg every 8 hours as needed'"
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleProcessTranscript}
                disabled={isProcessing || !transcript.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
              >
                {isProcessing ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                    Extract Medications with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Manual medications list (unchanged) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700">Medications to Add ({medications.length})</h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-xs text-[#137fec] font-medium hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span> Add Row
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
                      <option value="">Select</option>
                      <option value="Antibiotic">Antibiotic</option>
                      <option value="Analgesic">Analgesic</option>
                      <option value="Antihypertensive">Antihypertensive</option>
                      <option value="Antidiabetic">Antidiabetic</option>
                      <option value="Other">Other</option>
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
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:text-[#137fec] hover:border-[#137fec] transition flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Add Another Medication
            </button>
          </div>

          {/* WhatsApp Toggle & Status (unchanged) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="sendWhatsApp"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                disabled={!patientId || !appointmentId}
              />
              <label htmlFor="sendWhatsApp" className="text-sm font-medium text-gray-700">
                Send WhatsApp notifications to patient and pharmacy
                {(!patientId || !appointmentId) && (
                  <span className="text-xs text-gray-400 ml-2">(Patient ID & Appointment ID required)</span>
                )}
              </label>
            </div>

            {whatsappStatus && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">📱 WhatsApp Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg ${whatsappStatus.patient.sent ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                    <span className="font-medium text-sm">Patient:</span>
                    {whatsappStatus.patient.sent ? (
                      <span className="text-green-600 ml-2">✅ Sent</span>
                    ) : (
                      <span className="text-red-600 ml-2">❌ {whatsappStatus.patient.error || 'Failed'}</span>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${whatsappStatus.pharmacy.sent ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                    <span className="font-medium text-sm">Pharmacy:</span>
                    {whatsappStatus.pharmacy.sent ? (
                      <span className="text-green-600 ml-2">✅ Sent</span>
                    ) : (
                      <span className="text-red-600 ml-2">❌ {whatsappStatus.pharmacy.error || 'Failed'}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isSaving && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Saving prescription and sending notifications...
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-[#137fec] text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSaving ? 'progress_activity' : 'check'}
              </span>
              {isSaving ? 'Saving...' : 'Save All Medications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}