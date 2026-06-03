


// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useParams, useSearchParams } from "next/navigation";
// import { currentVisitApi } from "@/lib/api/ehr";
// import toast from "react-hot-toast";

// declare global {
//   interface Window {
//     SpeechRecognition: any;
//     webkitSpeechRecognition: any;
//   }
// }

// export default function CurrentVisitPage() {
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const patientId = params.patientId as string;
//   const appointmentId = params.appointmentId as string;
//   const date = searchParams.get("date");

//   const [formData, setFormData] = useState({
//     diagnosis: "",
//     icd10_code: "",
//     clinical_notes: "",
//     follow_up_date: "",
//     patient_instructions: "",
//     consultation_fee: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [generatingNotes, setGeneratingNotes] = useState(false);
  
//   // Voice recording states
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
//   const [interimTranscript, setInterimTranscript] = useState("");
//   const [editMode, setEditMode] = useState(false);
//   const [editableTranscript, setEditableTranscript] = useState("");
//   const [restartCount, setRestartCount] = useState(0);
  
//   const recognitionRef = useRef<any>(null);
//   const finalTranscriptRef = useRef("");
//   const shouldRestartRef = useRef(false);
//   const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Store the appointment ID after save
//   const [currentAppointmentId, setCurrentAppointmentId] = useState<string>("");

//   useEffect(() => {
//     if (appointmentId) {
//       setCurrentAppointmentId(appointmentId);
//     }
//   }, [appointmentId]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         let response;

//         if (date) {
//           response = await currentVisitApi.getCurrentVisitByDate(patientId, date);
//         } else if (appointmentId) {
//           response = await currentVisitApi.getCurrentVisit(patientId, appointmentId);
//         } else {
//           response = await currentVisitApi.getCurrentVisit(patientId);
//         }

//         console.log("API response", response);

//         const visitData =
//           response && typeof response === 'object' && 'success' in response
//             ? response.data
//             : response;

//         if (visitData && typeof visitData === 'object' && Object.keys(visitData).length > 0) {
//           const formattedDate = visitData.follow_up_date
//             ? visitData.follow_up_date.split("T")[0]
//             : "";

//           setFormData({
//             diagnosis: visitData.diagnosis || "",
//             icd10_code: visitData.icd10_code || "",
//             clinical_notes: visitData.clinical_notes || "",
//             follow_up_date: formattedDate,
//             patient_instructions: visitData.patient_instructions || "",
//             consultation_fee: visitData.consultation_fee || 0,
//           });
//         } else {
//           setFormData({
//             diagnosis: "",
//             icd10_code: "",
//             clinical_notes: "",
//             follow_up_date: "",
//             patient_instructions: "",
//             consultation_fee: 0,
//           });
//         }
//       } catch (error: any) {
//         console.error("Error fetching current visit:", error);
//         if (error?.response?.status !== 404) {
//           toast.error("Failed to load current visit data");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [patientId, appointmentId, date]);

//   // Initialize speech recognition
//   const initSpeechRecognition = () => {
//     if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
//       toast.error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
//       return null;
//     }

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();
    
//     recognition.continuous = true;
//     recognition.interimResults = true;
//     recognition.lang = 'en-US';
//     recognition.maxAlternatives = 1;
    
//     return recognition;
//   };

//   // Function to actually start the recognition engine
//   const startRecognitionEngine = () => {
//     if (!recognitionRef.current) return;
//     try {
//       recognitionRef.current.start();
//       console.log("Recognition engine started");
//     } catch (err) {
//       console.error("Start error:", err);
//       // If already started, ignore
//     }
//   };

//   // Main start recording (clears previous transcript and starts fresh)
//   const startRecording = async () => {
//     // Request microphone permission
//     try {
//       await navigator.mediaDevices.getUserMedia({ audio: true });
//     } catch (err) {
//       toast.error("Microphone permission denied. Please allow access and try again.");
//       return;
//     }

//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.abort();
//       } catch (e) {}
//     }

//     const recognition = initSpeechRecognition();
//     if (!recognition) return;

//     recognitionRef.current = recognition;
//     // Reset transcript
//     setTranscript("");
//     setInterimTranscript("");
//     finalTranscriptRef.current = "";
//     setEditableTranscript("");
//     setRestartCount(0);
//     shouldRestartRef.current = true;
    
//     recognition.onresult = (event: any) => {
//       let interim = "";
//       let final = "";
      
//       for (let i = event.resultIndex; i < event.results.length; i++) {
//         const transcriptPiece = event.results[i][0].transcript;
//         if (event.results[i].isFinal) {
//           final += transcriptPiece + " ";
//         } else {
//           interim += transcriptPiece;
//         }
//       }
      
//       if (final) {
//         finalTranscriptRef.current += final;
//         setTranscript(finalTranscriptRef.current);
//         setEditableTranscript(finalTranscriptRef.current);
//       }
//       setInterimTranscript(interim);
//     };
    
//     recognition.onerror = (event: any) => {
//       console.error("Speech recognition error:", event.error);
//       if (event.error === 'no-speech') {
//         // No speech detected – this is common; do nothing
//         return;
//       }
//       if (event.error === 'network' || event.error === 'not-allowed') {
//         toast.error(`Recording error: ${event.error}. Please check microphone.`);
//         shouldRestartRef.current = false;
//         setIsRecording(false);
//       }
//       // For other errors, we may still try to restart
//     };
    
//     // ========== FIXED: MUCH FASTER RESTART WITH FALLBACK ==========
//     recognition.onend = () => {
//       if (shouldRestartRef.current) {
//         console.log("Auto-restarting recognition...");
//         setRestartCount(prev => prev + 1);
//         if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
//         restartTimeoutRef.current = setTimeout(() => {
//           if (shouldRestartRef.current && recognitionRef.current) {
//             try {
//               recognitionRef.current.start();
//             } catch (err) {
//               console.error("Failed to restart, creating new instance:", err);
//               // Create a fresh recognition instance and copy over event handlers
//               const newRec = initSpeechRecognition();
//               if (newRec) {
//                 newRec.onresult = recognition.onresult;
//                 newRec.onerror = recognition.onerror;
//                 newRec.onend = recognition.onend;
//                 recognitionRef.current = newRec;
//                 try {
//                   newRec.start();
//                 } catch (e) {
//                   toast.error("Auto-restart failed. Please click 'Restart Mic'.");
//                   shouldRestartRef.current = false;
//                   setIsRecording(false);
//                 }
//               }
//             }
//           }
//         }, 50); // Reduced from 500ms to 50ms – minimises audio loss
//       } else {
//         setIsRecording(false);
//         if (finalTranscriptRef.current) {
//           toast.success("Recording stopped. Click 'View Transcript' to see and edit the conversation.");
//         }
//       }
//     };
    
//     // Start the engine
//     startRecognitionEngine();
//     setIsRecording(true);
//     toast.success("Recording started – will auto-restart to capture long sentences. Speak continuously.");
//   };

//   // Stop recording
//   const stopRecording = () => {
//     shouldRestartRef.current = false;
//     if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
//     if (recognitionRef.current) {
//       try {
//         recognitionRef.current.stop();
//       } catch (e) {
//         console.error("Stop error", e);
//       }
//       setIsRecording(false);
//     }
//   };

//   // Manual restart (without losing existing transcript)
//   const restartRecording = () => {
//     if (isRecording) {
//       stopRecording();
//       setTimeout(() => {
//         startRecording();
//       }, 100);
//     } else {
//       startRecording();
//     }
//   };

//   // Clear transcript
//   const clearTranscript = () => {
//     finalTranscriptRef.current = "";
//     setTranscript("");
//     setInterimTranscript("");
//     setEditableTranscript("");
//     toast.success("Transcript cleared");
//   };

//   // Open dialog with edit mode
//   const openTranscriptDialog = () => {
//     setEditableTranscript(transcript || finalTranscriptRef.current);
//     setEditMode(true);
//     setShowTranscriptDialog(true);
//   };

//   // Save edited transcript
//   const saveEditedTranscript = () => {
//     finalTranscriptRef.current = editableTranscript;
//     setTranscript(editableTranscript);
//     setEditMode(false);
//     toast.success("Transcript updated successfully");
//   };

//   // Generate SOAP notes from transcript
//   const handleGenerateFromTranscript = async () => {
//     const currentTranscript = transcript || finalTranscriptRef.current;
//     if (!currentTranscript || currentTranscript.trim().length === 0) {
//       toast.error("No transcript available. Please record or paste a conversation first.");
//       return;
//     }

//     setGeneratingNotes(true);
//     setShowTranscriptDialog(false);
//     const loadingToast = toast.loading("Generating clinical notes from conversation...");

//     try {
//       const response = await fetch("/api/doctors/ai/soap", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           transcript: currentTranscript,
//           model: "gemini-3.5-flash",
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`API error: ${response.status}`);
//       }

//       const soapData = await response.json();
      
//       console.log("Generated SOAP Notes:", soapData);
      
//       const extractedDiagnosis = extractDiagnosisFromAssessment(soapData.assessment);
//       let extractedICD10 = "";
//       if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
//         extractedICD10 = soapData.icd10Codes[0]?.code || "";
//       }
//       const formattedNotes = formatSOAPNotesForClinicalNotes(soapData);
//       const followUpDate = extractFollowUpDate(soapData.followUps || soapData.plan || "");
//       const patientInstructions = soapData.patientSummary || soapData.plan || "";
      
//       setFormData((prev) => ({
//         ...prev,
//         diagnosis: extractedDiagnosis || prev.diagnosis,
//         icd10_code: extractedICD10 || prev.icd10_code,
//         clinical_notes: formattedNotes || prev.clinical_notes,
//         patient_instructions: patientInstructions || prev.patient_instructions,
//         follow_up_date: followUpDate || prev.follow_up_date,
//       }));

//       toast.success("SOAP notes generated successfully from conversation!", {
//         duration: 4000,
//       });

//     } catch (error: any) {
//       console.error("Error generating SOAP notes:", error);
//       toast.error(`Failed to generate notes: ${error.message}`);
//     } finally {
//       toast.dismiss(loadingToast);
//       setGeneratingNotes(false);
//     }
//   };

//   // Extract diagnosis from assessment
//   const extractDiagnosisFromAssessment = (assessment: string): string => {
//     if (!assessment) return "";
//     const lines = assessment.split("\n");
//     for (const line of lines) {
//       const trimmedLine = line.trim();
//       if (!trimmedLine) continue;
//       const numberedMatch = trimmedLine.match(/^\d+\.\s*(.+?)(?:\s*[-–—]|\s*\(|$)/);
//       if (numberedMatch) {
//         const diagnosis = numberedMatch[1].trim();
//         if (diagnosis.length > 3 && diagnosis.length < 150) return diagnosis;
//       }
//       const bulletMatch = trimmedLine.match(/^[-•]\s*(.+?)(?:\s*[-–—]|\s*\(|$)/);
//       if (bulletMatch) {
//         const diagnosis = bulletMatch[1].trim();
//         if (diagnosis.length > 3 && diagnosis.length < 150) return diagnosis;
//       }
//       if (trimmedLine.toLowerCase().includes("diagnosis") || trimmedLine.toLowerCase().includes("primary")) {
//         const colonMatch = trimmedLine.match(/[:]\s*(.+?)(?:\s*[-–—]|$)/);
//         if (colonMatch) {
//           const diagnosis = colonMatch[1].trim();
//           if (diagnosis.length > 3 && diagnosis.length < 150) return diagnosis;
//         }
//       }
//     }
//     const firstLine = lines.find(line => line.trim().length > 10);
//     return firstLine ? firstLine.trim().substring(0, 100) : "";
//   };

//   // Format SOAP notes
//   const formatSOAPNotesForClinicalNotes = (soapData: any): string => {
//     const sections = [];
//     if (soapData.subjective) sections.push("=== SUBJECTIVE ===\n" + soapData.subjective);
//     if (soapData.objective) sections.push("=== OBJECTIVE ===\n" + soapData.objective);
//     if (soapData.assessment) sections.push("=== ASSESSMENT ===\n" + soapData.assessment);
//     if (soapData.plan) sections.push("=== PLAN ===\n" + soapData.plan);
//     if (soapData.medications && soapData.medications.length > 0) {
//       const medsText = soapData.medications.map((m: any) => 
//         `• ${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? ` - ${m.frequency}` : ""}`
//       ).join("\n");
//       sections.push("=== MEDICATIONS ===\n" + medsText);
//     }
//     if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
//       const codesText = soapData.icd10Codes.map((c: any) => `• ${c.code}: ${c.description}`).join("\n");
//       sections.push("=== ICD-10 CODES ===\n" + codesText);
//     }
//     if (soapData.confidenceScore) sections.push(`=== CONFIDENCE SCORE ===\n${soapData.confidenceScore}%`);
//     return sections.join("\n\n");
//   };

//   // Extract follow-up date
//   const extractFollowUpDate = (followUps: string): string => {
//     if (!followUps) return "";
//     const dayMatch = followUps.match(/(\d+)\s+days?/i);
//     if (dayMatch) {
//       const date = new Date();
//       date.setDate(date.getDate() + parseInt(dayMatch[1]));
//       return date.toISOString().split("T")[0];
//     }
//     const weekMatch = followUps.match(/(\d+)\s+weeks?/i);
//     if (weekMatch) {
//       const date = new Date();
//       date.setDate(date.getDate() + (parseInt(weekMatch[1]) * 7));
//       return date.toISOString().split("T")[0];
//     }
//     const dateMatch = followUps.match(/\d{4}-\d{2}-\d{2}/);
//     return dateMatch ? dateMatch[0] : "";
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const payload: any = { ...formData };
//       if (date) {
//         payload.date = date;
//       } else if (appointmentId) {
//         payload.appointmentId = appointmentId;
//       }
//       payload.consultation_fee = parseFloat(payload.consultation_fee) || 0;

//       const response = await currentVisitApi.saveCurrentVisit(patientId, payload);
//       const json = response.data !== undefined ? response.data : response;

//       if (json && (json.success || json.appointmentId)) {
//         toast.success(json.message || "Current visit saved");
//         if (json.appointmentId) {
//           setCurrentAppointmentId(json.appointmentId);
//         }
//       } else {
//         toast.error(json?.message || "Save failed");
//       }
//     } catch (error) {
//       console.error("Save error:", error);
//       toast.error("Error saving");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send prescription report to WhatsApp
//   const handleSendToWhatsApp = async () => {
//     if (!currentAppointmentId) {
//       toast.error("No appointment selected. Please save the visit first.");
//       return;
//     }

//     const loadingToast = toast.loading("Fetching prescription report...");

//     try {
//       const res = await fetch(
//         `/api/ehr/${patientId}/prescription-report?appointmentId=${currentAppointmentId}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!res.ok) {
//         throw new Error(`API error: ${res.status}`);
//       }

//       const reportData = await res.json();
//       if (!reportData.success) {
//         throw new Error(reportData.message || "Failed to fetch report");
//       }

//       const data = reportData.data;

//       let message = `🏥 *St. Mary Advanced Medical Center*\n`;
//       message += `*Prescription Report* (Ref: ${data.document.ref})\n`;
//       message += `📅 Sealed: ${new Date(data.document.sealedDateTime).toLocaleString()}\n\n`;
//       message += `*Patient:* ${data.patient.name || "N/A"} (ID: ${data.patient.id})\n`;
//       message += `*Doctor:* ${data.doctor.name || "Dr. "} – ${data.doctor.specialty || "General Medicine"}\n`;
//       message += `*License:* ${data.doctor.licenseNo || "N/A"}\n\n`;
//       message += `*Diagnosis:* ${data.clinicalFindings.diagnosis || "Not recorded"}\n`;
//       message += `*Notes:* ${data.clinicalFindings.notes || "No notes"}\n\n`;

//       if (data.medications.length > 0) {
//         message += `*Medications:*\n`;
//         data.medications.forEach((med: any) => {
//           message += `• ${med.name} – ${med.dosage} – ${med.frequency} – ${med.quantity}\n`;
//           message += `  *Instructions:* ${med.instructions}\n`;
//         });
//         message += `\n`;
//       } else {
//         message += `*Medications:* None prescribed\n\n`;
//       }

//       if (data.vitals.length > 0) {
//         const latest = data.vitals[0];
//         message += `*Latest Vitals:*\n`;
//         message += `BP: ${latest.bp || "—"} | HR: ${latest.hr || "—"} bpm | Temp: ${latest.temp || "—"}°C\n`;
//         message += `Weight: ${latest.weight || "—"} kg | SpO2: ${latest.spo2 || "—"}%\n\n`;
//       }

//       if (data.followUp) message += `*Follow‑up:* ${data.followUp}\n`;
//       if (data.patientInstructions) message += `*Instructions:* ${data.patientInstructions}\n\n`;

//       message += `🔒 *Digitally Sealed* – Hash: ${data.signature.hash.substring(0, 20)}...\n`;
//       message += `\n📞 For queries, please contact the hospital.`;

//       const encodedMessage = encodeURIComponent(message);
//       const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
//       window.open(whatsappUrl, "_blank");
//       toast.success("WhatsApp opened with prescription details", { duration: 3000 });
//     } catch (error: any) {
//       console.error("Error sending prescription:", error);
//       toast.error(`Failed to send: ${error.message}`);
//     } finally {
//       toast.dismiss(loadingToast);
//     }
//   };

//   if (loading) return <div className="text-center py-8">Loading...</div>;

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-8">
//       {/* Transcript Dialog Modal - Editable */}
//       {showTranscriptDialog && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b">
//               <div className="flex items-center gap-2">
//                 <span className="material-symbols-outlined text-blue-600">
//                   {editMode ? "edit" : "description"}
//                 </span>
//                 <h2 className="text-xl font-bold text-slate-900">
//                   {editMode ? "Edit Conversation Transcript" : "Conversation Transcript"}
//                 </h2>
//               </div>
//               <div className="flex items-center gap-2">
//                 {!editMode && (transcript || finalTranscriptRef.current) && (
//                   <button
//                     type="button"
//                     onClick={() => setEditMode(true)}
//                     className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-blue-600"
//                     title="Edit transcript"
//                   >
//                     <span className="material-symbols-outlined">edit</span>
//                   </button>
//                 )}
//                 {editMode && (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setEditMode(false);
//                       setEditableTranscript(transcript || finalTranscriptRef.current);
//                     }}
//                     className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-gray-600"
//                     title="Cancel edit"
//                   >
//                     <span className="material-symbols-outlined">close</span>
//                   </button>
//                 )}
//                 <button
//                   type="button"
//                   onClick={() => setShowTranscriptDialog(false)}
//                   className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                 >
//                   <span className="material-symbols-outlined">close</span>
//                 </button>
//               </div>
//             </div>
            
//             <div className="flex-1 overflow-auto p-4">
//               {editMode ? (
//                 <textarea
//                   value={editableTranscript}
//                   onChange={(e) => setEditableTranscript(e.target.value)}
//                   className="w-full h-full min-h-[400px] rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-4 shadow-sm font-mono"
//                   placeholder="Edit the transcript here. You can add, remove, or modify any part of the conversation..."
//                 />
//               ) : (
//                 <div className="bg-slate-50 rounded-lg p-4">
//                   <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
//                     {transcript || finalTranscriptRef.current || "No transcript available. Click the microphone button to start recording."}
//                   </pre>
//                   {interimTranscript && !editMode && (
//                     <div className="text-slate-400 italic mt-2">
//                       {interimTranscript}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
            
//             <div className="flex justify-end gap-3 p-4 border-t">
//               {editMode ? (
//                 <>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setEditMode(false);
//                       setEditableTranscript(transcript || finalTranscriptRef.current);
//                     }}
//                     className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={saveEditedTranscript}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//                   >
//                     <span className="material-symbols-outlined text-[18px]">
//                       save
//                     </span>
//                     Save Changes
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <button
//                     type="button"
//                     onClick={clearTranscript}
//                     className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                     disabled={!transcript && !finalTranscriptRef.current}
//                   >
//                     Clear Transcript
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setShowTranscriptDialog(false)}
//                     className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
//                   >
//                     Close
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleGenerateFromTranscript}
//                     disabled={generatingNotes || (!transcript && !finalTranscriptRef.current)}
//                     className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
//                   >
//                     <span className="material-symbols-outlined text-[18px]">
//                       auto_awesome
//                     </span>
//                     Generate SOAP Notes
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* AI Generate Button Section with Microphone */}
//       <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
//         <div className="flex items-center justify-between flex-wrap gap-4">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
//               <span className="material-symbols-outlined text-purple-600">
//                 auto_awesome
//               </span>
//             </div>
//             <div>
//               <h3 className="text-base font-bold text-slate-900">
//                 AI Clinical Scribe
//               </h3>
//               <p className="text-xs text-slate-500">
//                 Record conversation or generate SOAP notes from transcript
//               </p>
//             </div>
//           </div>
//           <div className="flex gap-2">
//             {/* Microphone Button */}
//             <button
//               type="button"
//               onClick={isRecording ? stopRecording : startRecording}
//               className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md ${
//                 isRecording 
//                   ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
//                   : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
//               }`}
//             >
//               <span className="material-symbols-outlined text-[18px]">
//                 {isRecording ? "mic" : "mic"}
//               </span>
//               {isRecording ? "Recording..." : "Start Recording"}
//             </button>
            
//             {/* Restart Button (visible only when recording) */}
//             {isRecording && (
//               <button
//                 type="button"
//                 onClick={restartRecording}
//                 className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200 flex items-center gap-2 shadow-md"
//                 title="Manually restart the microphone if it stops listening"
//               >
//                 <span className="material-symbols-outlined text-[18px]">refresh</span>
//                 Restart Mic
//               </button>
//             )}
            
//             {/* View/Edit Transcript Button */}
//             <button
//               type="button"
//               onClick={openTranscriptDialog}
//               disabled={!transcript && !finalTranscriptRef.current}
//               className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
//             >
//               <span className="material-symbols-outlined text-[18px]">
//                 view_list
//               </span>
//               View/Edit Transcript
//               {(transcript || finalTranscriptRef.current) && (
//                 <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
//                   {(transcript || finalTranscriptRef.current).split(' ').length}
//                 </span>
//               )}
//             </button>
            
//             {/* Generate Button */}
//             <button
//               type="button"
//               onClick={handleGenerateFromTranscript}
//               disabled={generatingNotes || (!transcript && !finalTranscriptRef.current)}
//               className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
//             >
//               <span className="material-symbols-outlined text-[18px]">
//                 {generatingNotes ? "progress_activity" : "magic"}
//               </span>
//               {generatingNotes ? "Generating..." : "AI Mode"}
//             </button>
//           </div>
//         </div>
        
//         {/* Recording Indicator with restart count */}
//         {isRecording && (
//           <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
//             <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
//             <span>
//               Recording in progress... The microphone will auto‑restart to capture long sentences.
//               {restartCount > 0 && ` (Auto‑restarted ${restartCount} time${restartCount > 1 ? 's' : ''})`}
//             </span>
//           </div>
//         )}
        
//         {/* Transcript Preview with Edit Option */}
//         {(transcript || finalTranscriptRef.current) && !showTranscriptDialog && (
//           <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-xs font-semibold text-slate-500">Latest Transcript Preview:</span>
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={openTranscriptDialog}
//                   className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
//                 >
//                   <span className="material-symbols-outlined text-[14px]">edit</span>
//                   Edit
//                 </button>
//                 <button
//                   type="button"
//                   onClick={clearTranscript}
//                   className="text-xs text-red-500 hover:text-red-700"
//                 >
//                   Clear
//                 </button>
//               </div>
//             </div>
//             <p className="text-sm text-slate-600 line-clamp-2">
//               {(transcript || finalTranscriptRef.current).substring(0, 150)}...
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Diagnosis Section (same as before) */}
//       <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
//               <span className="material-symbols-outlined text-[#137fec]">
//                 clinical_notes
//               </span>
//             </div>
//             <div>
//               <h3 className="text-base font-bold text-slate-900">
//                 Assessment & Diagnosis
//               </h3>
//               <p className="text-xs text-slate-500">
//                 Primary evaluation and clinical findings
//               </p>
//             </div>
//           </div>
//           <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
//             {saving ? "Saving..." : "Draft saved"}
//           </span>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div className="flex flex-col gap-2">
//             <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//               <span className="material-symbols-outlined text-[18px] text-slate-400">
//                 diagnosis
//               </span>
//               Primary Diagnosis
//             </label>
//             <div className="relative">
//               <input
//                 name="diagnosis"
//                 value={formData.diagnosis}
//                 onChange={handleChange}
//                 className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] pl-10 py-3 shadow-sm"
//                 placeholder="e.g. Acute Bronchitis"
//                 type="text"
//               />
//               <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
//                 search
//               </span>
//             </div>
//           </div>

//           <div className="flex flex-col gap-2">
//             <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//               <span className="material-symbols-outlined text-[18px] text-slate-400">
//                 code
//               </span>
//               ICD-10 Code
//             </label>
//             <input
//               name="icd10_code"
//               value={formData.icd10_code}
//               onChange={handleChange}
//               className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] py-3 px-4 shadow-sm"
//               type="text"
//               placeholder="e.g. M54.5"
//             />
//           </div>
//         </div>

//         <div className="flex flex-col gap-2">
//           <div className="flex items-center justify-between">
//             <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//               <span className="material-symbols-outlined text-[18px] text-slate-400">
//                 note
//               </span>
//               Clinical Notes
//             </label>
//           </div>
//           <textarea
//             name="clinical_notes"
//             value={formData.clinical_notes}
//             onChange={handleChange}
//             className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-4 shadow-sm font-mono"
//             placeholder="Enter patient complaints, observations, and assessment details... or record conversation and click 'AI Mode' to auto-populate"
//             rows={12}
//           />
//         </div>
//       </section>

//       {/* Follow Up Section */}
//       <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
//         <div className="flex items-center gap-3 mb-6">
//           <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
//             <span className="material-symbols-outlined text-[#137fec]">
//               event_upcoming
//             </span>
//           </div>
//           <div>
//             <h3 className="text-base font-bold text-slate-900">
//               Follow-up & Instructions
//             </h3>
//             <p className="text-xs text-slate-500">
//               Schedule next visit and patient guidance
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="flex flex-col gap-2">
//             <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//               <span className="material-symbols-outlined text-[18px] text-slate-400">
//                 calendar_month
//               </span>
//               Follow-up Date
//             </label>
//             <input
//               name="follow_up_date"
//               value={formData.follow_up_date}
//               onChange={handleChange}
//               className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] px-4 py-3 shadow-sm"
//               type="date"
//             />
//           </div>

//           <div className="flex flex-col gap-2">
//             <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//               <span className="material-symbols-outlined text-[18px] text-slate-400">
//                 description
//               </span>
//               Patient Instructions
//             </label>
//             <textarea
//               name="patient_instructions"
//               value={formData.patient_instructions}
//               onChange={handleChange}
//               className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-3 shadow-sm"
//               placeholder="Additional instructions..."
//               rows={3}
//             />
//           </div>
//         </div>
//       </section>

//       {/* Consultation Fee Section */}
//       <section className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
//             <span className="material-symbols-outlined text-blue-600">
//               currency_rupee
//             </span>
//           </div>
//           <div>
//             <h3 className="text-base font-bold text-slate-900">
//               Consultation Fee
//             </h3>
//             <p className="text-xs text-slate-500">
//               Enter the fee for this visit (manually adjustable)
//             </p>
//           </div>
//         </div>

//         <div className="flex flex-col gap-2 max-w-xs">
//           <label className="text-sm font-semibold text-slate-700">
//             Amount (₹)
//           </label>
//           <input
//             name="consultation_fee"
//             type="number"
//             step="0.01"
//             min="0"
//             value={formData.consultation_fee}
//             onChange={handleChange}
//             className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] px-4 py-3 shadow-sm"
//             placeholder="0.00"
//           />
//         </div>
//       </section>

//       <div className="flex justify-end gap-3">
//         <button
//           type="button"
//           onClick={handleSendToWhatsApp}
//           disabled={!currentAppointmentId}
//           className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
//         >
//           <span className="material-symbols-outlined text-[18px]">send</span>
//           Send to WhatsApp
//         </button>
//         <button
//           type="submit"
//           disabled={saving}
//           className="px-6 py-2 bg-[#137fec] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
//         >
//           {saving ? "Saving..." : "Save Visit"}
//         </button>
//       </div>
//     </form>
//   );
// }




"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { currentVisitApi } from "@/lib/api/ehr";
import toast from "react-hot-toast";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function CurrentVisitPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params.patientId as string;
  const appointmentId = params.appointmentId as string;
  const date = searchParams.get("date");

  const [formData, setFormData] = useState({
    diagnosis: "",
    icd10_code: "",
    clinical_notes: "",
    follow_up_date: "",
    patient_instructions: "",
    consultation_fee: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState("");
  const [restartCount, setRestartCount] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");
  const shouldRestartRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store the appointment ID after save
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string>("");
  // WhatsApp phone number input
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");

  useEffect(() => {
    if (appointmentId) {
      setCurrentAppointmentId(appointmentId);
    }
  }, [appointmentId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;

        if (date) {
          response = await currentVisitApi.getCurrentVisitByDate(patientId, date);
        } else if (appointmentId) {
          response = await currentVisitApi.getCurrentVisit(patientId, appointmentId);
        } else {
          response = await currentVisitApi.getCurrentVisit(patientId);
        }

        console.log("API response", response);

        const visitData =
          response && typeof response === 'object' && 'success' in response
            ? response.data
            : response;

        if (visitData && typeof visitData === 'object' && Object.keys(visitData).length > 0) {
          const formattedDate = visitData.follow_up_date
            ? visitData.follow_up_date.split("T")[0]
            : "";

          setFormData({
            diagnosis: visitData.diagnosis || "",
            icd10_code: visitData.icd10_code || "",
            clinical_notes: visitData.clinical_notes || "",
            follow_up_date: formattedDate,
            patient_instructions: visitData.patient_instructions || "",
            consultation_fee: visitData.consultation_fee || 0,
          });

          // If patient phone is available, prefill
          if (visitData.patient_phone) {
            setWhatsappNumber(visitData.patient_phone);
          }
        } else {
          setFormData({
            diagnosis: "",
            icd10_code: "",
            clinical_notes: "",
            follow_up_date: "",
            patient_instructions: "",
            consultation_fee: 0,
          });
        }
      } catch (error: any) {
        console.error("Error fetching current visit:", error);
        if (error?.response?.status !== 404) {
          toast.error("Failed to load current visit data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, appointmentId, date]);

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    return recognition;
  };

  // Function to actually start the recognition engine
  const startRecognitionEngine = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      console.log("Recognition engine started");
    } catch (err) {
      console.error("Start error:", err);
      // If already started, ignore
    }
  };

  // Main start recording (clears previous transcript and starts fresh)
  const startRecording = async () => {
    // Request microphone permission
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
    // Reset transcript
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
        // No speech detected – this is common; do nothing
        return;
      }
      if (event.error === 'network' || event.error === 'not-allowed') {
        toast.error(`Recording error: ${event.error}. Please check microphone.`);
        shouldRestartRef.current = false;
        setIsRecording(false);
      }
      // For other errors, we may still try to restart
    };
    
    // ========== FIXED: MUCH FASTER RESTART WITH FALLBACK ==========
    recognition.onend = () => {
      if (shouldRestartRef.current) {
        console.log("Auto-restarting recognition...");
        setRestartCount(prev => prev + 1);
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldRestartRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.error("Failed to restart, creating new instance:", err);
              // Create a fresh recognition instance and copy over event handlers
              const newRec = initSpeechRecognition();
              if (newRec) {
                newRec.onresult = recognition.onresult;
                newRec.onerror = recognition.onerror;
                newRec.onend = recognition.onend;
                recognitionRef.current = newRec;
                try {
                  newRec.start();
                } catch (e) {
                  toast.error("Auto-restart failed. Please click 'Restart Mic'.");
                  shouldRestartRef.current = false;
                  setIsRecording(false);
                }
              }
            }
          }
        }, 50); // Reduced from 500ms to 50ms – minimises audio loss
      } else {
        setIsRecording(false);
        if (finalTranscriptRef.current) {
          toast.success("Recording stopped. Click 'View Transcript' to see and edit the conversation.");
        }
      }
    };
    
    // Start the engine
    startRecognitionEngine();
    setIsRecording(true);
    toast.success("Recording started – will auto-restart to capture long sentences. Speak continuously.");
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
      setIsRecording(false);
    }
  };

  // Manual restart (without losing existing transcript)
  const restartRecording = () => {
    if (isRecording) {
      stopRecording();
      setTimeout(() => {
        startRecording();
      }, 100);
    } else {
      startRecording();
    }
  };

  // Clear transcript
  const clearTranscript = () => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setEditableTranscript("");
    toast.success("Transcript cleared");
  };

  // Open dialog with edit mode
  const openTranscriptDialog = () => {
    setEditableTranscript(transcript || finalTranscriptRef.current);
    setEditMode(true);
    setShowTranscriptDialog(true);
  };

  // Save edited transcript
  const saveEditedTranscript = () => {
    finalTranscriptRef.current = editableTranscript;
    setTranscript(editableTranscript);
    setEditMode(false);
    toast.success("Transcript updated successfully");
  };

  // Generate SOAP notes from transcript
  const handleGenerateFromTranscript = async () => {
    const currentTranscript = transcript || finalTranscriptRef.current;
    if (!currentTranscript || currentTranscript.trim().length === 0) {
      toast.error("No transcript available. Please record or paste a conversation first.");
      return;
    }

    setGeneratingNotes(true);
    setShowTranscriptDialog(false);
    const loadingToast = toast.loading("Generating clinical notes from conversation...");

    try {
      const response = await fetch("/api/doctors/ai/soap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: currentTranscript,
          model: "gemini-3.5-flash",
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const soapData = await response.json();
      
      console.log("Generated SOAP Notes:", soapData);
      
      const extractedDiagnosis = extractDiagnosisFromAssessment(soapData.assessment);
      let extractedICD10 = "";
      if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
        extractedICD10 = soapData.icd10Codes[0]?.code || "";
      }
      const formattedNotes = formatSOAPNotesForClinicalNotes(soapData);
      const followUpDate = extractFollowUpDate(soapData.followUps || soapData.plan || "");
      const patientInstructions = soapData.patientSummary || soapData.plan || "";
      
      setFormData((prev) => ({
        ...prev,
        diagnosis: extractedDiagnosis || prev.diagnosis,
        icd10_code: extractedICD10 || prev.icd10_code,
        clinical_notes: formattedNotes || prev.clinical_notes,
        patient_instructions: patientInstructions || prev.patient_instructions,
        follow_up_date: followUpDate || prev.follow_up_date,
      }));

      toast.success("SOAP notes generated successfully from conversation!", {
        duration: 4000,
      });

    } catch (error: any) {
      console.error("Error generating SOAP notes:", error);
      toast.error(`Failed to generate notes: ${error.message}`);
    } finally {
      toast.dismiss(loadingToast);
      setGeneratingNotes(false);
    }
  };

  // Extract diagnosis from assessment
  const extractDiagnosisFromAssessment = (assessment: string): string => {
    if (!assessment) return "";
    const lines = assessment.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      const numberedMatch = trimmedLine.match(/^\d+\.\s*(.+?)(?:\s*[-–—]|\s*\(|$)/);
      if (numberedMatch) {
        const diagnosis = numberedMatch[1].trim();
        if (diagnosis.length > 3 && diagnosis.length < 150) return diagnosis;
      }
      const bulletMatch = trimmedLine.match(/^[-•]\s*(.+?)(?:\s*[-–—]|\s*\(|$)/);
      if (bulletMatch) {
        const diagnosis = bulletMatch[1].trim();
        if (diagnosis.length > 3 && diagnosis.length < 150) return diagnosis;
      }
      if (trimmedLine.toLowerCase().includes("diagnosis") || trimmedLine.toLowerCase().includes("primary")) {
        const colonMatch = trimmedLine.match(/[:]\s*(.+?)(?:\s*[-–—]|$)/);
        if (colonMatch) {
          const diagnosis = colonMatch[1].trim();
          if (diagnosis.length > 3 && diagnosis.length < 150) return diagnosis;
        }
      }
    }
    const firstLine = lines.find(line => line.trim().length > 10);
    return firstLine ? firstLine.trim().substring(0, 100) : "";
  };

  // Format SOAP notes
  const formatSOAPNotesForClinicalNotes = (soapData: any): string => {
    const sections = [];
    if (soapData.subjective) sections.push("=== SUBJECTIVE ===\n" + soapData.subjective);
    if (soapData.objective) sections.push("=== OBJECTIVE ===\n" + soapData.objective);
    if (soapData.assessment) sections.push("=== ASSESSMENT ===\n" + soapData.assessment);
    if (soapData.plan) sections.push("=== PLAN ===\n" + soapData.plan);
    if (soapData.medications && soapData.medications.length > 0) {
      const medsText = soapData.medications.map((m: any) => 
        `• ${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? ` - ${m.frequency}` : ""}`
      ).join("\n");
      sections.push("=== MEDICATIONS ===\n" + medsText);
    }
    if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
      const codesText = soapData.icd10Codes.map((c: any) => `• ${c.code}: ${c.description}`).join("\n");
      sections.push("=== ICD-10 CODES ===\n" + codesText);
    }
    if (soapData.confidenceScore) sections.push(`=== CONFIDENCE SCORE ===\n${soapData.confidenceScore}%`);
    return sections.join("\n\n");
  };

  // Extract follow-up date
  const extractFollowUpDate = (followUps: string): string => {
    if (!followUps) return "";
    const dayMatch = followUps.match(/(\d+)\s+days?/i);
    if (dayMatch) {
      const date = new Date();
      date.setDate(date.getDate() + parseInt(dayMatch[1]));
      return date.toISOString().split("T")[0];
    }
    const weekMatch = followUps.match(/(\d+)\s+weeks?/i);
    if (weekMatch) {
      const date = new Date();
      date.setDate(date.getDate() + (parseInt(weekMatch[1]) * 7));
      return date.toISOString().split("T")[0];
    }
    const dateMatch = followUps.match(/\d{4}-\d{2}-\d{2}/);
    return dateMatch ? dateMatch[0] : "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...formData };
      if (date) {
        payload.date = date;
      } else if (appointmentId) {
        payload.appointmentId = appointmentId;
      }
      payload.consultation_fee = parseFloat(payload.consultation_fee) || 0;

      const response = await currentVisitApi.saveCurrentVisit(patientId, payload);
      const json = response.data !== undefined ? response.data : response;

      if (json && (json.success || json.appointmentId)) {
        toast.success(json.message || "Current visit saved");
        if (json.appointmentId) {
          setCurrentAppointmentId(json.appointmentId);
        }
      } else {
        toast.error(json?.message || "Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving");
    } finally {
      setSaving(false);
    }
  };


  const handleSendToWhatsApp = async () => {
  if (!currentAppointmentId) {
    toast.error("No appointment selected. Please save the visit first.");
    return;
  }

  if (!whatsappNumber || whatsappNumber.trim() === "") {
    toast.error("Please enter a WhatsApp number.");
    return;
  }

  const loadingToast = toast.loading("Generating prescription PDF...");

  try {
    // Fetch report data
    const res = await fetch(`/api/ehr/${patientId}/prescription-report?appointmentId=${currentAppointmentId}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const reportData = await res.json();
    if (!reportData.success) throw new Error(reportData.message || "Failed to fetch report");
    const data = reportData.data;

    // Generate PDF and get public URL from server
    const pdfRes = await fetch("/api/doctors/prescription-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: data.patient.name,
        patientId: data.patient.id,
        doctorName: data.doctor.name,
        doctorSpecialty: data.doctor.specialty,
        licenseNo: data.doctor.licenseNo,
        diagnosis: data.clinicalFindings.diagnosis,
        medications: data.medications,
        vitals: data.vitals,
        followUp: data.followUp,
        instructions: data.patientInstructions,
        documentRef: data.document.ref,
        sealedDate: data.document.sealedDateTime,
      }),
    });

    if (!pdfRes.ok) throw new Error("Failed to generate PDF");
    const pdfResult = await pdfRes.json();
    if (!pdfResult.success) throw new Error("PDF generation failed");
    const pdfUrl = pdfResult.url;  // public URL (e.g., https://yourdomain.com/uploads/prescription_xxx.pdf)

    // Format phone number
    let formattedPhone = whatsappNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.substring(1);
    if (formattedPhone.length === 10 && !formattedPhone.startsWith('91')) formattedPhone = '91' + formattedPhone;
    if (formattedPhone.length < 10) {
      toast.error("Invalid phone number.");
      return;
    }

    // Build clean WhatsApp message with the public PDF link
    let message = `🏥 *St. Mary Advanced Medical Center*\n`;
    message += `Your prescription (Ref: ${data.document.ref}) is ready.\n\n`;
    message += `📄 *Download PDF:* ${pdfUrl}\n\n`;
    message += `*Summary:*\n`;
    message += `Diagnosis: ${data.clinicalFindings.diagnosis || "N/A"}\n`;
    if (data.medications.length > 0) {
      message += `Medications: ${data.medications.map((m: any) => m.name).join(", ")}\n`;
    }
    if (data.followUp) message += `Follow-up: ${data.followUp}\n`;
    message += `\n🔒 Digitally sealed.\n📞 For queries, contact the hospital.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    toast.success("WhatsApp opened with PDF download link", { duration: 4000 });
  } catch (error: any) {
    console.error("Error:", error);
    toast.error(`Failed: ${error.message}`);
  } finally {
    toast.dismiss(loadingToast);
  }
};

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
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
                {!editMode && (transcript || finalTranscriptRef.current) && (
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
                      setEditableTranscript(transcript || finalTranscriptRef.current);
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
                    {transcript || finalTranscriptRef.current || "No transcript available. Click the microphone button to start recording."}
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
                      setEditableTranscript(transcript || finalTranscriptRef.current);
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
                    disabled={!transcript && !finalTranscriptRef.current}
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
                  <button
                    type="button"
                    onClick={handleGenerateFromTranscript}
                    disabled={generatingNotes || (!transcript && !finalTranscriptRef.current)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      auto_awesome
                    </span>
                    Generate SOAP Notes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Button Section with Microphone */}
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
                Record conversation or generate SOAP notes from transcript
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md ${
                isRecording 
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
                  : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isRecording ? "mic" : "mic"}
              </span>
              {isRecording ? "Recording..." : "Start Recording"}
            </button>
            
            {/* Restart Button (visible only when recording) */}
            {isRecording && (
              <button
                type="button"
                onClick={restartRecording}
                className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200 flex items-center gap-2 shadow-md"
                title="Manually restart the microphone if it stops listening"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Restart Mic
              </button>
            )}
            
            {/* View/Edit Transcript Button */}
            <button
              type="button"
              onClick={openTranscriptDialog}
              disabled={!transcript && !finalTranscriptRef.current}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">
                view_list
              </span>
              View/Edit Transcript
              {(transcript || finalTranscriptRef.current) && (
                <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                  {(transcript || finalTranscriptRef.current).split(' ').length}
                </span>
              )}
            </button>
            
            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerateFromTranscript}
              disabled={generatingNotes || (!transcript && !finalTranscriptRef.current)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">
                {generatingNotes ? "progress_activity" : "magic"}
              </span>
              {generatingNotes ? "Generating..." : "AI Mode"}
            </button>
          </div>
        </div>
        
        {/* Recording Indicator with restart count */}
        {isRecording && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
            <span>
              Recording in progress... The microphone will auto‑restart to capture long sentences.
              {restartCount > 0 && ` (Auto‑restarted ${restartCount} time${restartCount > 1 ? 's' : ''})`}
            </span>
          </div>
        )}
        
        {/* Transcript Preview with Edit Option */}
        {(transcript || finalTranscriptRef.current) && !showTranscriptDialog && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Latest Transcript Preview:</span>
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
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">
              {(transcript || finalTranscriptRef.current).substring(0, 150)}...
            </p>
          </div>
        )}
      </div>

      {/* Diagnosis Section */}
      <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#137fec]">
                clinical_notes
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Assessment & Diagnosis
              </h3>
              <p className="text-xs text-slate-500">
                Primary evaluation and clinical findings
              </p>
            </div>
          </div>
          <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
            {saving ? "Saving..." : "Draft saved"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                diagnosis
              </span>
              Primary Diagnosis
            </label>
            <div className="relative">
              <input
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] pl-10 py-3 shadow-sm"
                placeholder="e.g. Acute Bronchitis"
                type="text"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                code
              </span>
              ICD-10 Code
            </label>
            <input
              name="icd10_code"
              value={formData.icd10_code}
              onChange={handleChange}
              className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] py-3 px-4 shadow-sm"
              type="text"
              placeholder="e.g. M54.5"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                note
              </span>
              Clinical Notes
            </label>
          </div>
          <textarea
            name="clinical_notes"
            value={formData.clinical_notes}
            onChange={handleChange}
            className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-4 shadow-sm font-mono"
            placeholder="Enter patient complaints, observations, and assessment details... or record conversation and click 'AI Mode' to auto-populate"
            rows={12}
          />
        </div>
      </section>

      {/* Follow Up Section */}
      <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#137fec]">
              event_upcoming
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Follow-up & Instructions
            </h3>
            <p className="text-xs text-slate-500">
              Schedule next visit and patient guidance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                calendar_month
              </span>
              Follow-up Date
            </label>
            <input
              name="follow_up_date"
              value={formData.follow_up_date}
              onChange={handleChange}
              className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] px-4 py-3 shadow-sm"
              type="date"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                description
              </span>
              Patient Instructions
            </label>
            <textarea
              name="patient_instructions"
              value={formData.patient_instructions}
              onChange={handleChange}
              className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-3 shadow-sm"
              placeholder="Additional instructions..."
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* Consultation Fee Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600">
              currency_rupee
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Consultation Fee
            </h3>
            <p className="text-xs text-slate-500">
              Enter the fee for this visit (manually adjustable)
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 max-w-xs">
          <label className="text-sm font-semibold text-slate-700">
            Amount (₹)
          </label>
          <input
            name="consultation_fee"
            type="number"
            step="0.01"
            min="0"
            value={formData.consultation_fee}
            onChange={handleChange}
            className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] px-4 py-3 shadow-sm"
            placeholder="0.00"
          />
        </div>
      </section>

      {/* WhatsApp Send Section with Phone Number Input */}
      <div className="flex flex-col gap-3 items-end">
        <div className="flex flex-wrap items-center gap-3 w-full justify-end">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">phone</span>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="WhatsApp number (e.g., 919876543210)"
              className="w-64 text-sm text-slate-700 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSendToWhatsApp}
            disabled={!currentAppointmentId}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            Send to WhatsApp
          </button>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#137fec] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
          >
            {saving ? "Saving..." : "Save Visit"}
          </button>
        </div>
      </div>
    </form>
  );
}