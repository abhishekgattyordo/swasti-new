

// "use client";

// import React, { useState, useEffect } from "react";

// export interface NewVitalsForm {
//   bp: string;
//   hr: string;
//   temp: string;
//   weight: string;
//   rr: string;
//   spo2: string;
// }

// interface AddVitalsModalProps {
//   onClose: () => void;
//   onAdd: (vitals: NewVitalsForm) => void;
//   initialVitals?: NewVitalsForm;
//   isEditing?: boolean;
// }

// export default function AddVitalsModal({
//   onClose,
//   onAdd,
//   initialVitals = { bp: "", hr: "", temp: "", weight: "", rr: "", spo2: "" },
//   isEditing = false,
// }: AddVitalsModalProps) {
//   const [formData, setFormData] = useState<NewVitalsForm>(initialVitals);

//   useEffect(() => {
//     setFormData(initialVitals);
//   }, [initialVitals]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onAdd(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
//         <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
//           <h2 className="text-lg font-semibold text-slate-900">
//             {isEditing ? "Edit Vitals" : "Add Vitals"}
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-slate-100 rounded-lg"
//           >
//             <span className="material-symbols-outlined text-slate-500">
//               close
//             </span>
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-medium text-slate-500 uppercase mb-2">
//                 BP
//               </label>
//               <input
//                 type="text"
//                 name="bp"
//                 value={formData.bp}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
//                 placeholder="120/80"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-slate-500 uppercase mb-2">
//                 HR
//               </label>
//               <input
//                 type="number"
//                 name="hr"
//                 value={formData.hr}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
//                 placeholder="72"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-medium text-slate-500 uppercase mb-2">
//                 Temp
//               </label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="temp"
//                 value={formData.temp}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
//                 placeholder="36.6"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-slate-500 uppercase mb-2">
//                 Weight
//               </label>
//               <input
//                 type="number"
//                 step="0.1"
//                 name="weight"
//                 value={formData.weight}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
//                 placeholder="68"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-medium text-slate-500 uppercase mb-2">
//                 RR
//               </label>
//               <input
//                 type="number"
//                 name="rr"
//                 value={formData.rr}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
//                 placeholder="16"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-slate-500 uppercase mb-2">
//                 SpO2
//               </label>
//               <input
//                 type="number"
//                 name="spo2"
//                 value={formData.spo2}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
//                 placeholder="98"
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-[#137fec] text-white text-sm font-medium rounded-lg hover:bg-blue-600"
//             >
//               {isEditing ? "Update Vitals" : "Save Vitals"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }



"use client";

import React, { useState, useEffect, useRef } from "react";

export interface NewVitalsForm {
  bp: string;
  hr: string;
  temp: string;
  weight: string;
  rr: string;
  spo2: string;
}

interface AddVitalsModalProps {
  onClose: () => void;
  onAdd: (vitals: NewVitalsForm) => void;
  initialVitals?: NewVitalsForm;
  isEditing?: boolean;
}

export default function AddVitalsModal({
  onClose,
  onAdd,
  initialVitals = { bp: "", hr: "", temp: "", weight: "", rr: "", spo2: "" },
  isEditing = false,
}: AddVitalsModalProps) {
  const [formData, setFormData] = useState<NewVitalsForm>(initialVitals);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setFormData(initialVitals);
  }, [initialVitals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ----- Voice Recording Logic -----
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        // Release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert Blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1]; // remove data:audio/...;base64,

        const response = await fetch("/api/doctors/vitals-process-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: base64Audio,
            mimeType: "audio/webm",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to process audio");
        }

        const data = await response.json();

        // Map extracted vitals to form data (convert numbers to strings)
        const newFormData: NewVitalsForm = {
          bp: data.bp || "",
          hr: data.hr?.toString() || "",
          temp: data.temp?.toString() || "",
          weight: data.weight?.toString() || "",
          rr: data.rr?.toString() || "",
          spo2: data.spo2?.toString() || "",
        };
        setFormData(newFormData);

        // Optional: alert with extra details
        if (data.unrecognizedDetails && data.unrecognizedDetails.trim() !== "") {
          alert(`Additional notes: ${data.unrecognizedDetails}`);
        }
      };
    } catch (error: any) {
      console.error("Audio processing error:", error);
      alert(error.message || "Failed to extract vitals from voice.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "Edit Vitals" : "Add Vitals"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Voice Recording Button */}
          <div className="flex justify-end mb-2">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={isProcessing}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">mic</span>
                {isProcessing ? "Processing..." : "Speak Vitals"}
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 animate-pulse"
              >
                <span className="material-symbols-outlined text-[18px]">stop_circle</span>
                Stop Recording
              </button>
            )}
          </div>

          {/* Vitals Input Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-2">BP</label>
              <input
                type="text"
                name="bp"
                value={formData.bp}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
                placeholder="120/80"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-2">HR</label>
              <input
                type="number"
                name="hr"
                value={formData.hr}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
                placeholder="72"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                name="temp"
                value={formData.temp}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
                placeholder="36.6"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
                placeholder="68.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-2">RR</label>
              <input
                type="number"
                name="rr"
                value={formData.rr}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
                placeholder="16"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-2">SpO₂ (%)</label>
              <input
                type="number"
                name="spo2"
                value={formData.spo2}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm"
                placeholder="98"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#137fec] text-white text-sm font-medium rounded-lg hover:bg-blue-600"
            >
              {isEditing ? "Update Vitals" : "Save Vitals"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}