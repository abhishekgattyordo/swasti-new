// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useSearchParams } from "next/navigation";
// import { useEHR } from "../layout";
// import { currentVisitApi } from "@/lib/api/ehr";

// export default function PrescriptionsPage() {
//   const { medications, setMedications, setShowAddMedicationModal, handleDeleteMedication } = useEHR();
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const patientId = params.patientId as string;
//   const dateParam = searchParams.get("date");

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const targetDate = dateParam || new Date().toISOString().split("T")[0];

//   useEffect(() => {
//     const fetchPrescriptions = async () => {
//       if (!patientId) return;
//       setLoading(true);
//       setError(null);
//       try {
//         const data = await currentVisitApi.getPrescriptionsByDate(patientId, targetDate);
//         console.log("Fetched prescriptions:", data);

//         if (Array.isArray(data)) {
//           // Add color property for UI styling
//           const colors = ["blue", "amber", "green", "purple", "pink"];
//           const medsWithColor = data.map((med: any, idx: number) => ({
//             ...med,
//             color: colors[idx % colors.length],
//           }));
//           setMedications(medsWithColor);
//         } else {
//           setMedications([]);
//         }
//       } catch (err) {
//         console.error("Error fetching prescriptions:", err);
//         setError("Failed to load prescriptions");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPrescriptions();
//   }, [patientId, targetDate, setMedications]);

//   if (loading) {
//     return (
//       <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100 flex justify-center items-center h-64">
//         <div className="w-8 h-8 border-4 border-[#137fec] border-t-transparent animate-spin rounded-full"></div>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100 text-center py-12">
//         <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
//         <p className="text-red-600">{error}</p>
//       </section>
//     );
//   }

//   return (
//     <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
//             <span className="material-symbols-outlined text-[#137fec]">pill</span>
//           </div>
//           <div>
//             <h3 className="text-base font-bold text-slate-900">Prescribed Medications</h3>
//             <p className="text-xs text-slate-500">Current medications and dosage information</p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowAddMedicationModal(true)}
//           className="text-[#137fec] bg-transparent hover:bg-blue-50 text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition-all border border-[#137fec]"
//         >
//           <span className="material-symbols-outlined text-[18px]">add</span>
//           Add Medication
//         </button>
//       </div>

//       {medications.length === 0 ? (
//         <p className="text-center text-slate-500 py-8">No prescriptions found for this visit.</p>
//       ) : (
//         <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-gradient-to-r from-slate-50 to-white text-slate-600 font-semibold">
//               <tr>
//                 <th className="px-6 py-4">Medication</th>
//                 <th className="px-6 py-4">Dosage</th>
//                 <th className="px-6 py-4">Duration</th>
//                 <th className="px-6 py-4 w-10"></th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {medications.map((med) => (
//                 <tr key={med.id} className="bg-white hover:bg-slate-50 transition-colors">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className={`w-8 h-8 rounded-md bg-${med.color || 'blue'}-50 flex items-center justify-center`}>
//                         <span className={`material-symbols-outlined text-${med.color || 'blue'}-500 text-[16px]`}>medication</span>
//                       </div>
//                       <div>
//                         <p className="font-semibold text-slate-900">{med.name}</p>
//                         <p className="text-xs text-slate-500">{med.category}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className={`bg-${med.color || 'blue'}-50 text-${med.color || 'blue'}-700 text-xs font-medium px-3 py-1 rounded-full w-fit`}>
//                       {med.dosage}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-slate-600">{med.duration}</td>
//                   <td className="px-6 py-4 text-right">
//                     <button
//                       onClick={() => handleDeleteMedication(med.id)}
//                       className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
//                     >
//                       <span className="material-symbols-outlined text-[20px]">delete</span>
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </section>
//   );
// }



"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useEHR } from "../layout";
import { currentVisitApi } from "@/lib/api/ehr";
import { LiveTranscriptionSession } from "@/lib/speech";
import type { NewMedicationData } from "@/components/doctor/AddMedicationModal";
import toast from "react-hot-toast";

const MIC_LANGUAGE_LABELS: Record<string, string> = {
  "kn-IN": "Kannada",
  "hi-IN": "Hindi",
  "ta-IN": "Tamil",
  "ml-IN": "Malayalam",
  tulu: "Tulu",
  "en-IN": "Indian English",
  "en-US": "US English",
};

function mapMicLanguage(micLang: string): string {
  if (micLang === "kn-IN" || micLang === "tulu") return "kn";
  if (micLang === "hi-IN") return "hi";
  if (micLang === "ta-IN") return "ta";
  if (micLang === "ml-IN") return "ml";
  if (micLang === "en-IN" || micLang === "en-US") return "en";
  return "multi";
}

export default function PrescriptionsPage() {
  const {
    medications,
    setMedications,
    setShowAddMedicationModal,
    handleDeleteMedication,
    handleAddMedication,
  } = useEHR();
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params.patientId as string;
  const dateParam = searchParams.get("date");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const [micLanguage, setMicLanguage] = useState("en-IN");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isParsing, setIsParsing] = useState(false);

  const liveSessionRef = useRef<LiveTranscriptionSession | null>(null);
  const finalTranscriptRef = useRef("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const targetDate = dateParam || new Date().toISOString().split("T")[0];

  const fetchPrescriptions = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await currentVisitApi.getPrescriptionsByDate(patientId, targetDate);
      console.log("Fetched prescriptions:", data);

      if (Array.isArray(data)) {
        const colors = ["blue", "amber", "green", "purple", "pink"];
        const medsWithColor = data.map((med: any, idx: number) => ({
          ...med,
          color: colors[idx % colors.length],
        }));
        setMedications(medsWithColor);
      } else {
        setMedications([]);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  }, [patientId, targetDate, setMedications]);

  // Initial fetch and whenever refreshTrigger changes
  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions, refreshTrigger]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      liveSessionRef.current?.cancel();
    };
  }, []);

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

  const startRecording = async () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.cancel();
      liveSessionRef.current = null;
    }

    setTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";

    const session = new LiveTranscriptionSession();
    liveSessionRef.current = session;

    try {
      await session.start(
        (state) => {
          finalTranscriptRef.current = state.finalLines.join(" ");
          setTranscript(state.fullText);
          setInterimTranscript(state.interimText);
        },
        { language: mapMicLanguage(micLanguage) }
      );

      setIsRecording(true);
      startDurationTimer();
      toast.success(
        `Recording in ${MIC_LANGUAGE_LABELS[micLanguage] ?? micLanguage}. Dictate prescriptions clearly.`
      );
    } catch (err) {
      liveSessionRef.current = null;
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
    const session = liveSessionRef.current;
    if (!session) {
      setIsRecording(false);
      stopDurationTimer();
      return;
    }

    try {
      const state = await session.stop();
      finalTranscriptRef.current = state.finalLines.join(" ");
      setTranscript(state.fullText);
      setInterimTranscript("");
    } catch (err) {
      console.error("Stop error:", err);
    } finally {
      liveSessionRef.current = null;
      setIsRecording(false);
      stopDurationTimer();
    }
  };

  const handleParseAndAdd = async () => {
    const text = (transcript || finalTranscriptRef.current).trim();
    if (!text) {
      toast.error("Record a prescription order first.");
      return;
    }

    setIsParsing(true);
    try {
      const response = await fetch("/api/doctors/parse-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse prescription");
      }

      const parsedMeds = await response.json();
      if (!Array.isArray(parsedMeds) || parsedMeds.length === 0) {
        toast.error("No medications found. Try rephrasing your order.");
        return;
      }

      const newMeds: NewMedicationData[] = parsedMeds.map((med: Record<string, string>) => ({
        name: med.name || "",
        category: med.category || "Other",
        dosage: med.dosage || "",
        frequency: med.frequency || "Once daily",
        duration: med.duration || "7 days",
        instructions: med.instructions || "",
      }));

      await handleAddMedication(newMeds);
      setTranscript("");
      setInterimTranscript("");
      finalTranscriptRef.current = "";
      setRefreshTrigger((prev) => prev + 1);
      toast.success(`${newMeds.length} medication(s) added from voice`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process prescription";
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  };

  // Wrap delete to also refresh after deletion
  const handleDelete = async (medicationId: number) => {
    await handleDeleteMedication(medicationId);
    // Refresh the list after deletion
    setRefreshTrigger(prev => prev + 1);
    toast.success("Medication deleted");
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#137fec] border-t-transparent animate-spin rounded-full"></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100 text-center py-12">
        <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
        <p className="text-red-600">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 text-sm text-[#137fec] hover:underline"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#137fec]">pill</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Prescribed Medications</h3>
            <p className="text-xs text-slate-500">Current medications and dosage information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-slate-500 hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition"
            title="Refresh"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
          </button>
          <button
            onClick={() => setShowAddMedicationModal(true)}
            className="text-[#137fec] bg-transparent hover:bg-blue-50 text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition-all border border-[#137fec]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Medication
          </button>
        </div>
      </div>

      <div className="mb-6 bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Voice Prescription</h4>
            <p className="text-xs text-slate-500">
              Dictate medications — e.g. &quot;Amoxicillin 500mg twice daily for 7 days&quot;
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
              <span className="material-symbols-outlined text-[18px] text-blue-500">language</span>
              <select
                className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
                value={micLanguage}
                onChange={(e) => {
                  setMicLanguage(e.target.value);
                  toast.success(
                    `Language set to: ${MIC_LANGUAGE_LABELS[e.target.value] ?? e.target.value}`
                  );
                }}
                disabled={isRecording}
              >
                <option value="en-IN">Indian English</option>
                <option value="en-US">US English</option>
                <option value="kn-IN">Kannada</option>
                <option value="hi-IN">Hindi</option>
                <option value="ta-IN">Tamil</option>
                <option value="ml-IN">Malayalam</option>
                <option value="tulu">Tulu</option>
              </select>
            </div>
            <button
              type="button"
              onClick={isRecording ? () => void stopRecording() : () => void startRecording()}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
              {isRecording ? `Recording ${recordingDuration}s` : "Start Dictation"}
            </button>
            {isRecording && (
              <button
                type="button"
                onClick={() => void stopRecording()}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold"
              >
                Stop
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleParseAndAdd()}
              disabled={isParsing || isRecording || (!transcript && !finalTranscriptRef.current)}
              className="px-4 py-2 rounded-lg bg-[#137fec] text-white text-xs font-bold disabled:opacity-50"
            >
              {isParsing ? "Parsing..." : "Parse & Add"}
            </button>
          </div>
        </div>

        {(isRecording || transcript || interimTranscript) && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 min-h-[3rem]">
            {isRecording && (
              <p className="text-xs text-red-600 mb-1">
                Listening... {MIC_LANGUAGE_LABELS[micLanguage] ?? micLanguage}
              </p>
            )}
            <p>{transcript || finalTranscriptRef.current}</p>
            {interimTranscript && (
              <p className="text-blue-600 italic mt-1">{interimTranscript}</p>
            )}
          </div>
        )}
      </div>

      {medications.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No prescriptions found for this visit.</p>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-slate-50 to-white text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Medication</th>
                <th className="px-6 py-4">Dosage</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medications.map((med) => (
                <tr key={med.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-md bg-${med.color || 'blue'}-50 flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-${med.color || 'blue'}-500 text-[16px]`}>medication</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{med.name}</p>
                        <p className="text-xs text-slate-500">{med.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`bg-${med.color || 'blue'}-50 text-${med.color || 'blue'}-700 text-xs font-medium px-3 py-1 rounded-full w-fit`}>
                      {med.dosage}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{med.duration}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}