


// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useSearchParams } from "next/navigation";
// import { currentVisitApi } from "@/lib/api/ehr";
// import toast from "react-hot-toast";

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
//     consultation_fee: 0, // new field
//   });
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

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

//         // Safely extract visit data
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
//             consultation_fee: visitData.consultation_fee || 0, // load existing fee if any
//           });
//         } else {
//           // No data – reset form
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

//       // Ensure consultation_fee is sent as a number
//       payload.consultation_fee = parseFloat(payload.consultation_fee) || 0;

//       const response = await currentVisitApi.saveCurrentVisit(patientId, payload);
//       const json = response.data !== undefined ? response.data : response;

//       if (json && (json.success || json.appointmentId)) {
//         toast.success(json.message || "Current visit saved");
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

//   if (loading) return <div className="text-center py-8">Loading...</div>;

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-8">
//       {/* Diagnosis Section (unchanged) */}
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
//             />
//           </div>
//         </div>

//         <div className="flex flex-col gap-2">
//           <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//             <span className="material-symbols-outlined text-[18px] text-slate-400">
//               note
//             </span>
//             Clinical Notes
//           </label>
//           <textarea
//             name="clinical_notes"
//             value={formData.clinical_notes}
//             onChange={handleChange}
//             className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-4 shadow-sm"
//             placeholder="Enter patient complaints, observations, and assessment details..."
//             rows={5}
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

//       {/* Consultation Fee Section (new) */}
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

//       <div className="flex justify-end">
//         <button
//           type="submit"
//           disabled={saving}
//           className="px-6 py-2 bg-[#137fec] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
//         >
//           {saving ? "Saving..." : "Save"}
//         </button>
//       </div>
//     </form>
//   );
// }




// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useSearchParams } from "next/navigation";
// import { currentVisitApi } from "@/lib/api/ehr";
// import toast from "react-hot-toast";

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

//   // IMPROVED: Better diagnosis extraction from assessment
//   const extractDiagnosisFromAssessment = (assessment: string): string => {
//     if (!assessment) return "";
    
//     console.log("Extracting diagnosis from:", assessment);
    
//     // Try to find the primary diagnosis from the assessment text
//     const lines = assessment.split("\n");
    
//     for (const line of lines) {
//       const trimmedLine = line.trim();
//       if (!trimmedLine) continue;
      
//       // Look for lines that start with numbers (1., 2., etc.)
//       const numberedMatch = trimmedLine.match(/^\d+\.\s*(.+?)(?:\s*[-–—]|\s*\(|$)/);
//       if (numberedMatch) {
//         const diagnosis = numberedMatch[1].trim();
//         if (diagnosis.length > 3 && diagnosis.length < 150) {
//           console.log("Found numbered diagnosis:", diagnosis);
//           return diagnosis;
//         }
//       }
      
//       // Look for lines that start with bullet points
//       const bulletMatch = trimmedLine.match(/^[-•]\s*(.+?)(?:\s*[-–—]|\s*\(|$)/);
//       if (bulletMatch) {
//         const diagnosis = bulletMatch[1].trim();
//         if (diagnosis.length > 3 && diagnosis.length < 150) {
//           console.log("Found bullet diagnosis:", diagnosis);
//           return diagnosis;
//         }
//       }
      
//       // Look for lines containing "Diagnosis" or "Primary"
//       if (trimmedLine.toLowerCase().includes("diagnosis") || 
//           trimmedLine.toLowerCase().includes("primary")) {
//         // Extract after colon or dash
//         const colonMatch = trimmedLine.match(/[:]\s*(.+?)(?:\s*[-–—]|$)/);
//         if (colonMatch) {
//           const diagnosis = colonMatch[1].trim();
//           if (diagnosis.length > 3 && diagnosis.length < 150) {
//             console.log("Found diagnosis from label:", diagnosis);
//             return diagnosis;
//           }
//         }
//       }
//     }
    
//     // If no structured format found, try to get the first meaningful sentence
//     const firstLine = lines.find(line => line.trim().length > 10);
//     if (firstLine) {
//       const shortDiagnosis = firstLine.trim().substring(0, 100);
//       console.log("Using first line as diagnosis:", shortDiagnosis);
//       return shortDiagnosis;
//     }
    
//     return "";
//   };

//   // IMPROVED: Format SOAP notes with better structure
//   const formatSOAPNotesForClinicalNotes = (soapData: any): string => {
//     const sections = [];
    
//     if (soapData.subjective) {
//       sections.push("=== SUBJECTIVE ===\n" + soapData.subjective);
//     }
    
//     if (soapData.objective) {
//       sections.push("=== OBJECTIVE ===\n" + soapData.objective);
//     }
    
//     if (soapData.assessment) {
//       sections.push("=== ASSESSMENT ===\n" + soapData.assessment);
//     }
    
//     if (soapData.plan) {
//       sections.push("=== PLAN ===\n" + soapData.plan);
//     }
    
//     if (soapData.medications && soapData.medications.length > 0) {
//       const medsText = soapData.medications.map((m: any) => 
//         `• ${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? ` - ${m.frequency}` : ""}${m.instructions ? `\n  ${m.instructions}` : ""}`
//       ).join("\n");
//       sections.push("=== MEDICATIONS ===\n" + medsText);
//     }
    
//     if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
//       const codesText = soapData.icd10Codes.map((c: any) => 
//         `• ${c.code}: ${c.description}`
//       ).join("\n");
//       sections.push("=== ICD-10 CODES ===\n" + codesText);
//     }
    
//     if (soapData.patientSummary) {
//       sections.push("=== PATIENT SUMMARY ===\n" + soapData.patientSummary);
//     }
    
//     if (soapData.confidenceScore) {
//       sections.push(`=== CONFIDENCE SCORE ===\n${soapData.confidenceScore}%`);
//     }
    
//     return sections.join("\n\n");
//   };

//   // Helper function to extract follow-up date
//   const extractFollowUpDate = (followUps: string): string => {
//     if (!followUps) return "";
    
//     // Look for patterns like "in 7 days", "in 2 weeks", "on 2024-12-25"
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
//     if (dateMatch) return dateMatch[0];
    
//     return "";
//   };

//   // Helper function to show SOAP summary
//   const showSOAPSummary = (soapData: any) => {
//     const diagnosis = extractDiagnosisFromAssessment(soapData.assessment);
//     console.log("Extracted diagnosis for summary:", diagnosis);
    
//     const summary = `Generated SOAP Notes Summary:

// 📋 Diagnosis: ${diagnosis || "Not specified"}

// 💊 Medications: ${soapData.medications?.length || 0} prescribed

// 📊 Confidence Score: ${soapData.confidenceScore || "N/A"}%

// The clinical notes have been automatically filled. Please review and edit as needed.`;
    
//     toast.success(summary, { duration: 6000 });
//   };

//   // Function to generate SOAP notes from transcript
//   const handleGenerateSOAPNotes = async () => {
//     // Get transcript from localStorage or prompt user
//     const transcript = localStorage.getItem("consultation_transcript") || 
//                       prompt("Please paste the doctor-patient conversation transcript:");

//     if (!transcript || transcript.trim().length === 0) {
//       toast.error("Please provide a conversation transcript");
//       return;
//     }

//     setGeneratingNotes(true);
//     const loadingToast = toast.loading("Generating clinical notes from transcript...");

//     try {
//       const response = await fetch("/api/doctors/ai/soap", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           transcript: transcript,
//           model: "gemini-3.5-flash",
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`API error: ${response.status}`);
//       }

//       const soapData = await response.json();
      
//       console.log("Generated SOAP Notes:", soapData);
//       console.log("Assessment text:", soapData.assessment);
      
//       // Extract diagnosis from assessment
//       const extractedDiagnosis = extractDiagnosisFromAssessment(soapData.assessment);
//       console.log("Extracted diagnosis:", extractedDiagnosis);
      
//       // Extract ICD-10 code (prefer first code, or look for primary)
//       let extractedICD10 = "";
//       if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
//         // Try to find the primary/most relevant code
//         const primaryCode = soapData.icd10Codes.find((code: any) => 
//           code.description?.toLowerCase().includes(extractedDiagnosis?.toLowerCase().substring(0, 20)) ||
//           code.code?.startsWith("M54") || // Back pain codes
//           code.code?.startsWith("I10")     // Hypertension codes
//         );
//         extractedICD10 = primaryCode?.code || soapData.icd10Codes[0]?.code || "";
//       }
      
//       // Format clinical notes
//       const formattedNotes = formatSOAPNotesForClinicalNotes(soapData);
      
//       // Extract follow-up date
//       const followUpDate = extractFollowUpDate(soapData.followUps || soapData.plan || "");
      
//       // Extract patient instructions (prefer patientSummary, then plan)
//       const patientInstructions = soapData.patientSummary || soapData.plan || "";
      
//       // Auto-fill the form with generated data
//       setFormData((prev) => ({
//         ...prev,
//         diagnosis: extractedDiagnosis || prev.diagnosis,
//         icd10_code: extractedICD10 || prev.icd10_code,
//         clinical_notes: formattedNotes || prev.clinical_notes,
//         patient_instructions: patientInstructions || prev.patient_instructions,
//         follow_up_date: followUpDate || prev.follow_up_date,
//       }));

//       toast.success("SOAP notes generated and applied successfully!", {
//         duration: 4000,
//       });

//       // Show summary
//       showSOAPSummary(soapData);

//     } catch (error: any) {
//       console.error("Error generating SOAP notes:", error);
//       toast.error(`Failed to generate notes: ${error.message}`);
//     } finally {
//       toast.dismiss(loadingToast);
//       setGeneratingNotes(false);
//     }
//   };

//   if (loading) return <div className="text-center py-8">Loading...</div>;

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-8">
//       {/* AI Generate Button Section */}
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
//                 Generate SOAP notes from conversation transcript
//               </p>
//             </div>
//           </div>
//           <button
//             type="button"
//             onClick={handleGenerateSOAPNotes}
//             disabled={generatingNotes}
//             className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
//           >
//             <span className="material-symbols-outlined text-[18px]">
//               {generatingNotes ? "progress_activity" : "magic"}
//             </span>
//             {generatingNotes ? "Generating..." : "Generate with AI"}
//           </button>
//         </div>
//       </div>

//       {/* Diagnosis Section */}
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
//             <button
//               type="button"
//               onClick={handleGenerateSOAPNotes}
//               disabled={generatingNotes}
//               className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
//             >
//               <span className="material-symbols-outlined text-[14px]">
//                 auto_awesome
//               </span>
//               Regenerate with AI
//             </button>
//           </div>
//           <textarea
//             name="clinical_notes"
//             value={formData.clinical_notes}
//             onChange={handleChange}
//             className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-4 shadow-sm font-mono"
//             placeholder="Enter patient complaints, observations, and assessment details... or click 'Generate with AI' to auto-populate from transcript"
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
//           onClick={handleGenerateSOAPNotes}
//           disabled={generatingNotes}
//           className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
//         >
//           <span className="material-symbols-outlined text-[18px]">
//             auto_awesome
//           </span>
//           {generatingNotes ? "Generating..." : "Generate SOAP Notes"}
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
  
//   const recognitionRef = useRef<any>(null);
//   const [finalTranscript, setFinalTranscript] = useState("");

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
    
//     return recognition;
//   };

//   // Start recording
//   const startRecording = () => {
//     const recognition = initSpeechRecognition();
//     if (!recognition) return;

//     recognitionRef.current = recognition;
//     setTranscript("");
//     setInterimTranscript("");
//     setFinalTranscript("");
    
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
//         setFinalTranscript(prev => prev + final);
//         setTranscript(prev => prev + final);
//       }
//       setInterimTranscript(interim);
//     };
    
//     recognition.onerror = (event: any) => {
//       console.error("Speech recognition error:", event.error);
//       toast.error(`Recording error: ${event.error}`);
//       setIsRecording(false);
//     };
    
//     recognition.onend = () => {
//       setIsRecording(false);
//       if (transcript || finalTranscript) {
//         toast.success("Recording stopped. Click 'View Transcript' to see the conversation.");
//       }
//     };
    
//     recognition.start();
//     setIsRecording(true);
//     toast.success("Recording started... Speak clearly");
//   };

//   // Stop recording
//   const stopRecording = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   // Clear transcript
//   const clearTranscript = () => {
//     setTranscript("");
//     setFinalTranscript("");
//     setInterimTranscript("");
//     toast.success("Transcript cleared");
//   };

//   // Generate SOAP notes from transcript
//   const handleGenerateFromTranscript = async () => {
//     if (!transcript || transcript.trim().length === 0) {
//       toast.error("No transcript available. Please record a conversation first.");
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
//           transcript: transcript,
//           model: "gemini-3.5-flash",
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`API error: ${response.status}`);
//       }

//       const soapData = await response.json();
      
//       console.log("Generated SOAP Notes:", soapData);
      
//       // Extract diagnosis from assessment
//       const extractedDiagnosis = extractDiagnosisFromAssessment(soapData.assessment);
      
//       // Extract ICD-10 code
//       let extractedICD10 = "";
//       if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
//         extractedICD10 = soapData.icd10Codes[0]?.code || "";
//       }
      
//       // Format clinical notes
//       const formattedNotes = formatSOAPNotesForClinicalNotes(soapData);
      
//       // Extract follow-up date
//       const followUpDate = extractFollowUpDate(soapData.followUps || soapData.plan || "");
      
//       // Extract patient instructions
//       const patientInstructions = soapData.patientSummary || soapData.plan || "";
      
//       // Auto-fill the form with generated data
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
//         if (diagnosis.length > 3 && diagnosis.length < 150) {
//           return diagnosis;
//         }
//       }
      
//       const bulletMatch = trimmedLine.match(/^[-•]\s*(.+?)(?:\s*[-–—]|\s*\(|$)/);
//       if (bulletMatch) {
//         const diagnosis = bulletMatch[1].trim();
//         if (diagnosis.length > 3 && diagnosis.length < 150) {
//           return diagnosis;
//         }
//       }
      
//       if (trimmedLine.toLowerCase().includes("diagnosis") || 
//           trimmedLine.toLowerCase().includes("primary")) {
//         const colonMatch = trimmedLine.match(/[:]\s*(.+?)(?:\s*[-–—]|$)/);
//         if (colonMatch) {
//           const diagnosis = colonMatch[1].trim();
//           if (diagnosis.length > 3 && diagnosis.length < 150) {
//             return diagnosis;
//           }
//         }
//       }
//     }
    
//     const firstLine = lines.find(line => line.trim().length > 10);
//     if (firstLine) {
//       return firstLine.trim().substring(0, 100);
//     }
    
//     return "";
//   };

//   // Format SOAP notes
//   const formatSOAPNotesForClinicalNotes = (soapData: any): string => {
//     const sections = [];
    
//     if (soapData.subjective) {
//       sections.push("=== SUBJECTIVE ===\n" + soapData.subjective);
//     }
    
//     if (soapData.objective) {
//       sections.push("=== OBJECTIVE ===\n" + soapData.objective);
//     }
    
//     if (soapData.assessment) {
//       sections.push("=== ASSESSMENT ===\n" + soapData.assessment);
//     }
    
//     if (soapData.plan) {
//       sections.push("=== PLAN ===\n" + soapData.plan);
//     }
    
//     if (soapData.medications && soapData.medications.length > 0) {
//       const medsText = soapData.medications.map((m: any) => 
//         `• ${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? ` - ${m.frequency}` : ""}`
//       ).join("\n");
//       sections.push("=== MEDICATIONS ===\n" + medsText);
//     }
    
//     if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
//       const codesText = soapData.icd10Codes.map((c: any) => 
//         `• ${c.code}: ${c.description}`
//       ).join("\n");
//       sections.push("=== ICD-10 CODES ===\n" + codesText);
//     }
    
//     if (soapData.confidenceScore) {
//       sections.push(`=== CONFIDENCE SCORE ===\n${soapData.confidenceScore}%`);
//     }
    
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
//     if (dateMatch) return dateMatch[0];
    
//     return "";
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

//   if (loading) return <div className="text-center py-8">Loading...</div>;

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-8">
//       {/* Transcript Dialog Modal */}
//       {showTranscriptDialog && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
//             <div className="flex items-center justify-between p-4 border-b">
//               <div className="flex items-center gap-2">
//                 <span className="material-symbols-outlined text-blue-600">
//                   description
//                 </span>
//                 <h2 className="text-xl font-bold text-slate-900">
//                   Conversation Transcript
//                 </h2>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setShowTranscriptDialog(false)}
//                 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//               >
//                 <span className="material-symbols-outlined">close</span>
//               </button>
//             </div>
            
//             <div className="flex-1 overflow-auto p-4">
//               <div className="bg-slate-50 rounded-lg p-4">
//                 <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
//                   {transcript || "No transcript available. Click the microphone button to start recording."}
//                 </pre>
//                 {interimTranscript && (
//                   <div className="text-slate-400 italic mt-2">
//                     {interimTranscript}
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             <div className="flex justify-end gap-3 p-4 border-t">
//               <button
//                 type="button"
//                 onClick={clearTranscript}
//                 className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//               >
//                 Clear Transcript
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowTranscriptDialog(false)}
//                 className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
//               >
//                 Close
//               </button>
//               <button
//                 type="button"
//                 onClick={handleGenerateFromTranscript}
//                 disabled={generatingNotes || !transcript}
//                 className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
//               >
//                 <span className="material-symbols-outlined text-[18px]">
//                   auto_awesome
//                 </span>
//                 Generate SOAP Notes
//               </button>
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
            
//             {/* View Transcript Button */}
//             <button
//               type="button"
//               onClick={() => setShowTranscriptDialog(true)}
//               disabled={!transcript && !finalTranscript}
//               className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
//             >
//               <span className="material-symbols-outlined text-[18px]">
//                 view_list
//               </span>
//               View Transcript
//               {(transcript || finalTranscript) && (
//                 <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
//                   {(transcript || finalTranscript).split(' ').length}
//                 </span>
//               )}
//             </button>
            
//             {/* Generate Button */}
//             <button
//               type="button"
//               onClick={handleGenerateFromTranscript}
//               disabled={generatingNotes || (!transcript && !finalTranscript)}
//               className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
//             >
//               <span className="material-symbols-outlined text-[18px]">
//                 {generatingNotes ? "progress_activity" : "magic"}
//               </span>
//               {generatingNotes ? "Generating..." : "AI Mode"}
//             </button>
//           </div>
//         </div>
        
//         {/* Recording Indicator */}
//         {isRecording && (
//           <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
//             <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
//             <span>Recording in progress... Speak clearly. Click stop when done.</span>
//           </div>
//         )}
        
//         {/* Transcript Preview */}
//         {(transcript || finalTranscript) && !showTranscriptDialog && (
//           <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-xs font-semibold text-slate-500">Latest Transcript Preview:</span>
//               <button
//                 type="button"
//                 onClick={clearTranscript}
//                 className="text-xs text-red-500 hover:text-red-700"
//               >
//                 Clear
//               </button>
//             </div>
//             <p className="text-sm text-slate-600 line-clamp-2">
//               {(transcript || finalTranscript).substring(0, 150)}...
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Diagnosis Section */}
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
  
  const recognitionRef = useRef<any>(null);
  const [finalTranscript, setFinalTranscript] = useState("");

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
    
    return recognition;
  };

  // Start recording
  const startRecording = () => {
    const recognition = initSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setTranscript("");
    setInterimTranscript("");
    setFinalTranscript("");
    setEditableTranscript("");
    
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
        setFinalTranscript(prev => prev + final);
        setTranscript(prev => prev + final);
        setEditableTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      toast.error(`Recording error: ${event.error}`);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
      if (transcript || finalTranscript) {
        toast.success("Recording stopped. Click 'View Transcript' to see and edit the conversation.");
      }
    };
    
    recognition.start();
    setIsRecording(true);
    toast.success("Recording started... Speak clearly");
  };

  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Clear transcript
  const clearTranscript = () => {
    setTranscript("");
    setFinalTranscript("");
    setInterimTranscript("");
    setEditableTranscript("");
    toast.success("Transcript cleared");
  };

  // Open dialog with edit mode
  const openTranscriptDialog = () => {
    setEditableTranscript(transcript || finalTranscript);
    setEditMode(true);
    setShowTranscriptDialog(true);
  };

  // Save edited transcript
  const saveEditedTranscript = () => {
    setTranscript(editableTranscript);
    setFinalTranscript(editableTranscript);
    setEditMode(false);
    toast.success("Transcript updated successfully");
  };

  // Generate SOAP notes from transcript
  const handleGenerateFromTranscript = async () => {
    const currentTranscript = transcript || finalTranscript;
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
      
      // Extract diagnosis from assessment
      const extractedDiagnosis = extractDiagnosisFromAssessment(soapData.assessment);
      
      // Extract ICD-10 code
      let extractedICD10 = "";
      if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
        extractedICD10 = soapData.icd10Codes[0]?.code || "";
      }
      
      // Format clinical notes
      const formattedNotes = formatSOAPNotesForClinicalNotes(soapData);
      
      // Extract follow-up date
      const followUpDate = extractFollowUpDate(soapData.followUps || soapData.plan || "");
      
      // Extract patient instructions
      const patientInstructions = soapData.patientSummary || soapData.plan || "";
      
      // Auto-fill the form with generated data
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
        if (diagnosis.length > 3 && diagnosis.length < 150) {
          return diagnosis;
        }
      }
      
      const bulletMatch = trimmedLine.match(/^[-•]\s*(.+?)(?:\s*[-–—]|\s*\(|$)/);
      if (bulletMatch) {
        const diagnosis = bulletMatch[1].trim();
        if (diagnosis.length > 3 && diagnosis.length < 150) {
          return diagnosis;
        }
      }
      
      if (trimmedLine.toLowerCase().includes("diagnosis") || 
          trimmedLine.toLowerCase().includes("primary")) {
        const colonMatch = trimmedLine.match(/[:]\s*(.+?)(?:\s*[-–—]|$)/);
        if (colonMatch) {
          const diagnosis = colonMatch[1].trim();
          if (diagnosis.length > 3 && diagnosis.length < 150) {
            return diagnosis;
          }
        }
      }
    }
    
    const firstLine = lines.find(line => line.trim().length > 10);
    if (firstLine) {
      return firstLine.trim().substring(0, 100);
    }
    
    return "";
  };

  // Format SOAP notes
  const formatSOAPNotesForClinicalNotes = (soapData: any): string => {
    const sections = [];
    
    if (soapData.subjective) {
      sections.push("=== SUBJECTIVE ===\n" + soapData.subjective);
    }
    
    if (soapData.objective) {
      sections.push("=== OBJECTIVE ===\n" + soapData.objective);
    }
    
    if (soapData.assessment) {
      sections.push("=== ASSESSMENT ===\n" + soapData.assessment);
    }
    
    if (soapData.plan) {
      sections.push("=== PLAN ===\n" + soapData.plan);
    }
    
    if (soapData.medications && soapData.medications.length > 0) {
      const medsText = soapData.medications.map((m: any) => 
        `• ${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? ` - ${m.frequency}` : ""}`
      ).join("\n");
      sections.push("=== MEDICATIONS ===\n" + medsText);
    }
    
    if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
      const codesText = soapData.icd10Codes.map((c: any) => 
        `• ${c.code}: ${c.description}`
      ).join("\n");
      sections.push("=== ICD-10 CODES ===\n" + codesText);
    }
    
    if (soapData.confidenceScore) {
      sections.push(`=== CONFIDENCE SCORE ===\n${soapData.confidenceScore}%`);
    }
    
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
    if (dateMatch) return dateMatch[0];
    
    return "";
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
                {!editMode && (transcript || finalTranscript) && (
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
                      setEditableTranscript(transcript || finalTranscript);
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
                    {transcript || finalTranscript || "No transcript available. Click the microphone button to start recording."}
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
                      setEditableTranscript(transcript || finalTranscript);
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
                    disabled={!transcript && !finalTranscript}
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
                    disabled={generatingNotes || (!transcript && !finalTranscript)}
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
            
            {/* View/Edit Transcript Button */}
            <button
              type="button"
              onClick={openTranscriptDialog}
              disabled={!transcript && !finalTranscript}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">
                view_list
              </span>
              View/Edit Transcript
              {(transcript || finalTranscript) && (
                <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                  {(transcript || finalTranscript).split(' ').length}
                </span>
              )}
            </button>
            
            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerateFromTranscript}
              disabled={generatingNotes || (!transcript && !finalTranscript)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">
                {generatingNotes ? "progress_activity" : "magic"}
              </span>
              {generatingNotes ? "Generating..." : "AI Mode"}
            </button>
          </div>
        </div>
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
            <span>Recording in progress... Speak clearly. Click stop when done.</span>
          </div>
        )}
        
        {/* Transcript Preview with Edit Option */}
        {(transcript || finalTranscript) && !showTranscriptDialog && (
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
              {(transcript || finalTranscript).substring(0, 150)}...
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

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-[#137fec] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
        >
          {saving ? "Saving..." : "Save Visit"}
        </button>
      </div>
    </form>
  );
}