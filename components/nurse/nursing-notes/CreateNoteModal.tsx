// // components/nurse/nursing-notes/CreateNoteModal.tsx
// 'use client';

// import { useState } from 'react';
// import { X, Save, FileText } from 'lucide-react';

// interface NursingNote {
//   id: string;
//   patientId: string;
//   patientName: string;
//   bed: string;
//   noteType: 'admission' | 'progress' | 'critical' | 'discharge' | 'post-op' | 'intervention';
//   title: string;
//   content: string;
//   priority: 'routine' | 'urgent' | 'critical';
//   createdBy: string;
//   createdAt: string;
//   tags: string[];
//   assessmentFindings?: string;
//   interventions?: string;
//   patientResponse?: string;
//   followUpRequired?: boolean;
// }

// interface CreateNoteModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (note: Partial<NursingNote>) => void;
//   patientName: string;
//   patientBed: string;
//   patientId: string;  // ✅ Make sure this is included
// }

// const NOTE_TEMPLATES = {
//   admission: {
//     title: 'Admission Note',
//     content: `ADMISSION NOTE
// Patient Name: 
// Date/Time of Admission: 
// Admitted from: 
// Chief Complaint:
// History of Present Illness:
// Medical History:
// Medications on admission:
// Allergies:
// Physical Assessment:
// Vital Signs:
// Labs/Diagnostic Results:
// Nursing Diagnosis:
// Care Plan:
// Patient/Family Education:`,
//   },
//   progress: {
//     title: 'Progress Note',
//     content: `PROGRESS NOTE
// Date/Time:
// Patient Status:
// Assessment:
// - Vital Signs:
// - Labs:
// - Physical Findings:
// Interventions Performed:
// Patient Response:
// Plan for Next 24 hours:
// Signature:`,
//   },
//   critical: {
//     title: 'Critical Event Documentation',
//     content: `CRITICAL EVENT DOCUMENTATION
// Date/Time of Event:
// Patient Status Before Event:
// Event Description:
// Actions Taken:
// Response to Intervention:
// Physician Notification:
// Time:
// Orders Received:
// Follow-up Actions:
// Signature:`,
//   },
//   discharge: {
//     title: 'Discharge Summary',
//     content: `DISCHARGE SUMMARY
// Admission Date:
// Discharge Date:
// Hospital Course Summary:
// Diagnoses:
// Procedures Performed:
// Medications at Discharge:
// Activity Restrictions:
// Diet:
// Follow-up Appointments:
// Patient/Caregiver Education Provided:
// Return Precautions:
// Signature:`,
//   },
//   'post-op': {
//     title: 'Post-Operative Note',
//     content: `POST-OPERATIVE NOTE
// Date/Time:
// Operation Performed:
// Surgeon:
// Anesthesia:
// Recovery Time:
// Vital Signs:
// Operative Site Assessment:
// Pain Level:
// Medications Given:
// Fluid Intake/Output:
// Activity Level:
// Patient Instructions:`,
//   },
//   intervention: {
//     title: 'Intervention Documentation',
//     content: `INTERVENTION DOCUMENTATION
// Date/Time:
// Patient Name:
// Intervention Performed:
// Indication:
// Supplies Used:
// Assessment Before:
// Procedure:
// Assessment After:
// Patient Tolerance:
// Complications:
// Follow-up Plan:`,
//   },
// };

// export default function CreateNoteModal({ isOpen, onClose, onSave, patientName, patientBed, patientId }: CreateNoteModalProps) {
//   const [selectedTemplate, setSelectedTemplate] = useState<string>('progress');
//   const [formData, setFormData] = useState({
//     title: '',
//     noteType: 'progress' as NursingNote['noteType'],
//     content: '',
//     priority: 'routine' as NursingNote['priority'],
//     tags: '',
//     assessmentFindings: '',
//     interventions: '',
//     patientResponse: '',
//   });

//   if (!isOpen) return null;

//   const handleApplyTemplate = (templateType: string) => {
//     const template = NOTE_TEMPLATES[templateType as keyof typeof NOTE_TEMPLATES];
//     if (template) {
//       setFormData(prev => ({
//         ...prev,
//         noteType: templateType as NursingNote['noteType'],
//         title: template.title,
//         content: template.content,
//       }));
//       setSelectedTemplate(templateType);
//     }
//   };

//   const handleSave = () => {
//     if (!formData.title || !formData.content) {
//       alert('Please fill in title and content');
//       return;
//     }

//     onSave({
//       patientId: patientId,        // ✅ Now patientId is defined
//       patientName: patientName,
//       bed: patientBed,
//       noteType: formData.noteType,
//       title: formData.title,
//       content: formData.content,
//       priority: formData.priority,
//       tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
//       assessmentFindings: formData.assessmentFindings,
//       interventions: formData.interventions,
//       patientResponse: formData.patientResponse,
//       followUpRequired: formData.priority !== 'routine',
//     });

//     setFormData({
//       title: '',
//       noteType: 'progress',
//       content: '',
//       priority: 'routine',
//       tags: '',
//       assessmentFindings: '',
//       interventions: '',
//       patientResponse: '',
//     });
//     onClose();
//   };

//   const getTemplateButtonClass = (templateKey: string) => {
//     return `p-3 rounded-lg border-2 font-semibold text-sm transition-all ${
//       selectedTemplate === templateKey
//         ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
//         : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-blue-300'
//     }`;
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
//         <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//               <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Nursing Note</h2>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400">
//             <X size={24} />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               <span className="font-semibold">Patient:</span> {patientName} (Bed {patientBed})
//             </p>
//           </div>

//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Select Template</h3>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//               {Object.entries(NOTE_TEMPLATES).map(([key, template]) => (
//                 <button
//                   key={key}
//                   onClick={() => handleApplyTemplate(key)}
//                   className={getTemplateButtonClass(key)}
//                 >
//                   {template.title}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note Title</label>
//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//                 placeholder="Enter note title"
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
//               <select
//                 value={formData.priority}
//                 onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as NursingNote['priority'] }))}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
//               >
//                 <option value="routine">Routine</option>
//                 <option value="urgent">Urgent</option>
//                 <option value="critical">Critical</option>
//               </select>
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note Content</label>
//             <textarea
//               value={formData.content}
//               onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
//               placeholder="Enter detailed nursing notes..."
//               rows={8}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none"
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assessment Findings</label>
//               <textarea
//                 value={formData.assessmentFindings}
//                 onChange={(e) => setFormData(prev => ({ ...prev, assessmentFindings: e.target.value }))}
//                 placeholder="Patient assessment findings..."
//                 rows={3}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interventions</label>
//               <textarea
//                 value={formData.interventions}
//                 onChange={(e) => setFormData(prev => ({ ...prev, interventions: e.target.value }))}
//                 placeholder="Nursing interventions performed..."
//                 rows={3}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patient Response</label>
//             <textarea
//               value={formData.patientResponse}
//               onChange={(e) => setFormData(prev => ({ ...prev, patientResponse: e.target.value }))}
//               placeholder="Patient's response to interventions..."
//               rows={3}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma-separated)</label>
//             <input
//               type="text"
//               value={formData.tags}
//               onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
//               placeholder="e.g., vitals, pain, wound care"
//               className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
//             />
//           </div>

//           <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
//             <button
//               onClick={handleSave}
//               className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
//             >
//               <Save size={20} />
//               Save Note
//             </button>
//             <button
//               onClick={onClose}
//               className="flex-1 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





// // components/nurse/nursing-notes/CreateNoteModal.tsx
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { X, Save, FileText, Mic, MicOff, AlertCircle, RotateCcw } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";

// interface NursingNote {
//   id: string;
//   patientId: string;
//   patientName: string;
//   bed: string;
//   noteType: 'admission' | 'progress' | 'critical' | 'discharge' | 'post-op' | 'intervention';
//   title: string;
//   content: string;
//   priority: 'routine' | 'urgent' | 'critical';
//   createdBy: string;
//   createdAt: string;
//   tags: string[];
//   assessmentFindings?: string;
//   interventions?: string;
//   patientResponse?: string;
//   followUpRequired?: boolean;
// }

// interface CreateNoteModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (note: Partial<NursingNote>) => void;
//   patientName: string;
//   patientBed: string;
//   patientId: string;
// }

// const NOTE_TEMPLATES = {
//   admission: {
//     title: 'Admission Note',
//     content: `ADMISSION NOTE
// Patient Name: 
// Date/Time of Admission: 
// Admitted from: 
// Chief Complaint:
// History of Present Illness:
// Medical History:
// Medications on admission:
// Allergies:
// Physical Assessment:
// Vital Signs:
// Labs/Diagnostic Results:
// Nursing Diagnosis:
// Care Plan:
// Patient/Family Education:`,
//   },
//   progress: {
//     title: 'Progress Note',
//     content: `PROGRESS NOTE
// Date/Time:
// Patient Status:
// Assessment:
// - Vital Signs:
// - Labs:
// - Physical Findings:
// Interventions Performed:
// Patient Response:
// Plan for Next 24 hours:
// Signature:`,
//   },
//   critical: {
//     title: 'Critical Event Documentation',
//     content: `CRITICAL EVENT DOCUMENTATION
// Date/Time of Event:
// Patient Status Before Event:
// Event Description:
// Actions Taken:
// Response to Intervention:
// Physician Notification:
// Time:
// Orders Received:
// Follow-up Actions:
// Signature:`,
//   },
//   discharge: {
//     title: 'Discharge Summary',
//     content: `DISCHARGE SUMMARY
// Admission Date:
// Discharge Date:
// Hospital Course Summary:
// Diagnoses:
// Procedures Performed:
// Medications at Discharge:
// Activity Restrictions:
// Diet:
// Follow-up Appointments:
// Patient/Caregiver Education Provided:
// Return Precautions:
// Signature:`,
//   },
//   'post-op': {
//     title: 'Post-Operative Note',
//     content: `POST-OPERATIVE NOTE
// Date/Time:
// Operation Performed:
// Surgeon:
// Anesthesia:
// Recovery Time:
// Vital Signs:
// Operative Site Assessment:
// Pain Level:
// Medications Given:
// Fluid Intake/Output:
// Activity Level:
// Patient Instructions:`,
//   },
//   intervention: {
//     title: 'Intervention Documentation',
//     content: `INTERVENTION DOCUMENTATION
// Date/Time:
// Patient Name:
// Intervention Performed:
// Indication:
// Supplies Used:
// Assessment Before:
// Procedure:
// Assessment After:
// Patient Tolerance:
// Complications:
// Follow-up Plan:`,
//   },
// };

// // Helper function to capitalize words
// function capitalize(str: string) {
//   return str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
// }

// // Parse transcript for nursing note fields
// function parseTranscript(transcript: string, formData: any) {
//   const t = transcript.toLowerCase().trim();
//   let updated = { ...formData };
//   let updatedFields: string[] = [];

//   // Title parsing
//   const titleMatch = t.match(/(?:title|note title)\s+(.+)/);
//   if (titleMatch) {
//     updated.title = capitalize(titleMatch[1].trim());
//     updatedFields.push("title");
//   }

//   // Priority parsing
//   if (t.includes("priority")) {
//     if (t.includes("critical")) {
//       updated.priority = "critical";
//       updatedFields.push("priority");
//     } else if (t.includes("urgent")) {
//       updated.priority = "urgent";
//       updatedFields.push("priority");
//     } else if (t.includes("routine")) {
//       updated.priority = "routine";
//       updatedFields.push("priority");
//     }
//   }

//   // Note type parsing
//   if (t.includes("note type")) {
//     if (t.includes("admission")) {
//       updated.noteType = "admission";
//       updatedFields.push("noteType");
//     } else if (t.includes("progress")) {
//       updated.noteType = "progress";
//       updatedFields.push("noteType");
//     } else if (t.includes("critical")) {
//       updated.noteType = "critical";
//       updatedFields.push("noteType");
//     } else if (t.includes("discharge")) {
//       updated.noteType = "discharge";
//       updatedFields.push("noteType");
//     } else if (t.includes("post op")) {
//       updated.noteType = "post-op";
//       updatedFields.push("noteType");
//     } else if (t.includes("intervention")) {
//       updated.noteType = "intervention";
//       updatedFields.push("noteType");
//     }
//   }

//   // Content parsing
//   const contentMatch = t.match(/(?:content|note content)\s+(.+)/);
//   if (contentMatch) {
//     updated.content = capitalize(contentMatch[1].trim());
//     updatedFields.push("content");
//   }

//   // Assessment findings parsing
//   const assessmentMatch = t.match(/(?:assessment findings|assessment)\s+(.+?)(?:interventions|patient response|$)/i);
//   if (assessmentMatch) {
//     updated.assessmentFindings = capitalize(assessmentMatch[1].trim());
//     updatedFields.push("assessmentFindings");
//   }

//   // Interventions parsing
//   const interventionsMatch = t.match(/(?:interventions|intervention)\s+(.+?)(?:assessment findings|patient response|$)/i);
//   if (interventionsMatch) {
//     updated.interventions = capitalize(interventionsMatch[1].trim());
//     updatedFields.push("interventions");
//   }

//   // Patient response parsing
//   const responseMatch = t.match(/(?:patient response|response)\s+(.+)/);
//   if (responseMatch) {
//     updated.patientResponse = capitalize(responseMatch[1].trim());
//     updatedFields.push("patientResponse");
//   }

//   // Tags parsing
//   const tagsMatch = t.match(/(?:tags|tag)\s+(.+)/);
//   if (tagsMatch) {
//     updated.tags = tagsMatch[1].trim();
//     updatedFields.push("tags");
//   }

//   return { updated, updatedFields };
// }

// export default function CreateNoteModal({ isOpen, onClose, onSave, patientName, patientBed, patientId }: CreateNoteModalProps) {
//   // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURN
//   const [selectedTemplate, setSelectedTemplate] = useState<string>('progress');
//   const [formData, setFormData] = useState({
//     title: '',
//     noteType: 'progress' as NursingNote['noteType'],
//     content: '',
//     priority: 'routine' as NursingNote['priority'],
//     tags: '',
//     assessmentFindings: '',
//     interventions: '',
//     patientResponse: '',
//   });

//   // Voice dictation states
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [isSupported, setIsSupported] = useState(true);
//   const [permissionDenied, setPermissionDenied] = useState(false);
//   const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());
  
//   const recognitionRef = useRef<any>(null);

//   // Add animation keyframes to document - MUST BE BEFORE CONDITIONAL RETURN
//   useEffect(() => {
//     const style = document.createElement('style');
//     style.textContent = `
//       @keyframes pulse {
//         0%, 100% { opacity: 1; }
//         50% { opacity: 0.5; }
//       }
//       @keyframes highlightPulse {
//         0% { box-shadow: 0 0 0 0px rgba(59, 130, 246, 0.5); border-color: #3b82f6; }
//         50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); border-color: #3b82f6; }
//         100% { box-shadow: 0 0 0 0px rgba(59, 130, 246, 0); }
//       }
//       @keyframes wavePulse {
//         0% { box-shadow: 0 0 0 0px rgba(59, 130, 246, 0.4); }
//         70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
//         100% { box-shadow: 0 0 0 0px rgba(59, 130, 246, 0); }
//       }
//       .wave-pulse {
//         animation: wavePulse 2s infinite;
//       }
//     `;
//     document.head.appendChild(style);
//     return () => {
//       document.head.removeChild(style);
//     };
//   }, []);

//   // Initialize speech recognition - MUST BE BEFORE CONDITIONAL RETURN
//   useEffect(() => {
//     const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
//     if (!SpeechRecognition) {
//       setIsSupported(false);
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = true;
//     recognition.lang = "en-US";

//     recognition.onresult = (event: any) => {
//       let interimTranscript = "";
//       let finalTranscript = "";

//       for (let i = event.resultIndex; i < event.results.length; ++i) {
//         if (event.results[i].isFinal) {
//           finalTranscript += event.results[i][0].transcript;
//         } else {
//           interimTranscript += event.results[i][0].transcript;
//         }
//       }

//       setTranscript(finalTranscript || interimTranscript);

//       if (finalTranscript) {
//         const { updated, updatedFields } = parseTranscript(finalTranscript, formData);
        
//         if (updatedFields.length > 0) {
//           setFormData(prev => ({ ...prev, ...updated }));
//           setHighlightedFields(new Set(updatedFields));
          
//           setTimeout(() => {
//             setHighlightedFields(new Set());
//           }, 1500);
//         }
//       }
//     };

//     recognition.onerror = (event: any) => {
//       if (event.error === 'not-allowed') {
//         setPermissionDenied(true);
//         setIsListening(false);
//       }
//       console.error("Speech recognition error", event.error);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//     };

//     recognitionRef.current = recognition;

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, [formData]);

//   // CONDITIONAL RETURN AFTER ALL HOOKS
//   if (!isOpen) return null;

//   const toggleListening = () => {
//     if (!isSupported) return;
    
//     if (isListening) {
//       recognitionRef.current?.stop();
//       setIsListening(false);
//     } else {
//       setPermissionDenied(false);
//       try {
//         recognitionRef.current?.start();
//         setIsListening(true);
//         setTranscript("");
//       } catch (err) {
//         console.error("Failed to start listening", err);
//       }
//     }
//   };

//   const handleApplyTemplate = (templateType: string) => {
//     const template = NOTE_TEMPLATES[templateType as keyof typeof NOTE_TEMPLATES];
//     if (template) {
//       setFormData(prev => ({
//         ...prev,
//         noteType: templateType as NursingNote['noteType'],
//         title: template.title,
//         content: template.content,
//       }));
//       setSelectedTemplate(templateType);
//     }
//   };

//   const handleSave = () => {
//     if (!formData.title || !formData.content) {
//       alert('Please fill in title and content');
//       return;
//     }

//     onSave({
//       patientId: patientId,
//       patientName: patientName,
//       bed: patientBed,
//       noteType: formData.noteType,
//       title: formData.title,
//       content: formData.content,
//       priority: formData.priority,
//       tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
//       assessmentFindings: formData.assessmentFindings,
//       interventions: formData.interventions,
//       patientResponse: formData.patientResponse,
//       followUpRequired: formData.priority !== 'routine',
//     });

//     setFormData({
//       title: '',
//       noteType: 'progress',
//       content: '',
//       priority: 'routine',
//       tags: '',
//       assessmentFindings: '',
//       interventions: '',
//       patientResponse: '',
//     });
//     onClose();
//   };

//   const handleReset = () => {
//     setFormData({
//       title: '',
//       noteType: 'progress',
//       content: '',
//       priority: 'routine',
//       tags: '',
//       assessmentFindings: '',
//       interventions: '',
//       patientResponse: '',
//     });
//     setSelectedTemplate('progress');
//     setTranscript("");
//   };

//   const handleChange = (field: string, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const getHighlightStyle = (field: string): React.CSSProperties => {
//     return highlightedFields.has(field) ? { animation: "highlightPulse 1.5s ease-out" } : {};
//   };

//   const getTemplateButtonClass = (templateKey: string) => {
//     return `p-3 rounded-lg border-2 font-semibold text-sm transition-all ${
//       selectedTemplate === templateKey
//         ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
//         : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-blue-300'
//     }`;
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
//         <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//               <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Nursing Note</h2>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400">
//             <X size={24} />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           {permissionDenied && (
//             <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg flex items-start gap-3">
//               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
//               <p>Microphone access was denied. Please allow microphone access in your browser settings to use voice features.</p>
//             </div>
//           )}

//           {!isSupported && (
//             <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-sm px-4 py-3 rounded-lg">
//               <p>Your browser doesn't support speech recognition. Please try using Google Chrome for voice dictation.</p>
//             </div>
//           )}

//           {/* Voice Control Section */}
//           <div className="flex flex-col items-center gap-4 py-4">
//             <motion.button
//               onClick={toggleListening}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
//                 isListening 
//                   ? "bg-red-500 text-white wave-pulse" 
//                   : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-slate-600 hover:border-blue-500"
//               }`}
//             >
//               {isListening ? (
//                 <Mic className="w-8 h-8" />
//               ) : (
//                 <MicOff className="w-8 h-8" />
//               )}
//             </motion.button>

//             <div className="text-center min-h-[4rem]">
//               <AnimatePresence mode="wait">
//                 {isListening ? (
//                   <motion.div
//                     key="listening"
//                     initial={{ opacity: 0, y: 5 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -5 }}
//                     className="space-y-2"
//                   >
//                     <p className="text-sm font-medium text-blue-600 dark:text-blue-400 animate-pulse">
//                       Listening for nursing note fields...
//                     </p>
//                     <p className="text-lg italic text-gray-600 dark:text-gray-400">
//                       {transcript || "Speak now..."}
//                     </p>
//                   </motion.div>
//                 ) : (
//                   <motion.p
//                     key="idle"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     className="text-sm text-gray-500 dark:text-gray-500"
//                   >
//                     Click the microphone and say something like "Title Progress Note" or "Patient Response is stable"
//                   </motion.p>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>

//           {/* Patient Info */}
//           <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               <span className="font-semibold">Patient:</span> {patientName} (Bed {patientBed})
//             </p>
//           </div>

//           {/* Template Selection */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Select Template</h3>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//               {Object.entries(NOTE_TEMPLATES).map(([key, template]) => (
//                 <button
//                   key={key}
//                   onClick={() => handleApplyTemplate(key)}
//                   className={getTemplateButtonClass(key)}
//                 >
//                   {template.title}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="title">Note Title</Label>
//               <Input
//                 id="title"
//                 value={formData.title}
//                 onChange={(e) => handleChange("title", e.target.value)}
//                 placeholder="Enter note title"
//                 className="w-full"
//                 style={getHighlightStyle("title")}
//               />
//               <p className="text-[10px] text-muted-foreground mt-1">Say: "Title Progress Note"</p>
//             </div>
//             <div>
//               <Label htmlFor="priority">Priority</Label>
//               <Select value={formData.priority} onValueChange={(val) => handleChange("priority", val)}>
//                 <SelectTrigger style={getHighlightStyle("priority")}>
//                   <SelectValue placeholder="Select priority" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="routine">Routine</SelectItem>
//                   <SelectItem value="urgent">Urgent</SelectItem>
//                   <SelectItem value="critical">Critical</SelectItem>
//                 </SelectContent>
//               </Select>
//               <p className="text-[10px] text-muted-foreground mt-1">Say: "Priority urgent"</p>
//             </div>
//           </div>

//           <div>
//             <Label htmlFor="noteType">Note Type</Label>
//             <Select value={formData.noteType} onValueChange={(val) => handleChange("noteType", val)}>
//               <SelectTrigger style={getHighlightStyle("noteType")}>
//                 <SelectValue placeholder="Select note type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="admission">Admission</SelectItem>
//                 <SelectItem value="progress">Progress</SelectItem>
//                 <SelectItem value="critical">Critical</SelectItem>
//                 <SelectItem value="discharge">Discharge</SelectItem>
//                 <SelectItem value="post-op">Post-Op</SelectItem>
//                 <SelectItem value="intervention">Intervention</SelectItem>
//               </SelectContent>
//             </Select>
//             <p className="text-[10px] text-muted-foreground mt-1">Say: "Note type admission"</p>
//           </div>

//           <div>
//             <Label htmlFor="content">Note Content</Label>
//             <Textarea
//               id="content"
//               value={formData.content}
//               onChange={(e) => handleChange("content", e.target.value)}
//               placeholder="Enter detailed nursing notes..."
//               rows={8}
//               className="resize-none"
//               style={getHighlightStyle("content")}
//             />
//             <p className="text-[10px] text-muted-foreground mt-1">Say: "Content patient is stable and resting comfortably"</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="assessmentFindings">Assessment Findings</Label>
//               <Textarea
//                 id="assessmentFindings"
//                 value={formData.assessmentFindings}
//                 onChange={(e) => handleChange("assessmentFindings", e.target.value)}
//                 placeholder="Patient assessment findings..."
//                 rows={3}
//                 className="resize-none"
//                 style={getHighlightStyle("assessmentFindings")}
//               />
//               <p className="text-[10px] text-muted-foreground mt-1">Say: "Assessment findings lungs clear to auscultation"</p>
//             </div>
//             <div>
//               <Label htmlFor="interventions">Interventions</Label>
//               <Textarea
//                 id="interventions"
//                 value={formData.interventions}
//                 onChange={(e) => handleChange("interventions", e.target.value)}
//                 placeholder="Nursing interventions performed..."
//                 rows={3}
//                 className="resize-none"
//                 style={getHighlightStyle("interventions")}
//               />
//               <p className="text-[10px] text-muted-foreground mt-1">Say: "Interventions administered pain medication"</p>
//             </div>
//           </div>

//           <div>
//             <Label htmlFor="patientResponse">Patient Response</Label>
//             <Textarea
//               id="patientResponse"
//               value={formData.patientResponse}
//               onChange={(e) => handleChange("patientResponse", e.target.value)}
//               placeholder="Patient's response to interventions..."
//               rows={3}
//               className="resize-none"
//               style={getHighlightStyle("patientResponse")}
//             />
//             <p className="text-[10px] text-muted-foreground mt-1">Say: "Patient response pain decreased from 7 to 3"</p>
//           </div>

//           <div>
//             <Label htmlFor="tags">Tags (comma-separated)</Label>
//             <Input
//               id="tags"
//               value={formData.tags}
//               onChange={(e) => handleChange("tags", e.target.value)}
//               placeholder="e.g., vitals, pain, wound care"
//               style={getHighlightStyle("tags")}
//             />
//             <p className="text-[10px] text-muted-foreground mt-1">Say: "Tags vitals pain assessment"</p>
//           </div>

//           <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={handleReset}
//               className="flex-1 gap-2"
//             >
//               <RotateCcw className="w-4 h-4" />
//               Reset Form
//             </Button>
//             <Button
//               type="button"
//               onClick={handleSave}
//               className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
//             >
//               <Save className="w-4 h-4" />
//               Save Nursing Note
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// components/nurse/nursing-notes/CreateNoteModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Save, FileText, Mic, MicOff, AlertCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface NursingNote {
  id: string;
  patientId: string;
  patientName: string;
  bed: string;
  noteType: 'admission' | 'progress' | 'critical' | 'discharge' | 'post-op' | 'intervention';
  title: string;
  content: string;
  priority: 'routine' | 'urgent' | 'critical';
  createdBy: string;
  createdAt: string;
  tags: string[];
  assessmentFindings?: string;
  interventions?: string;
  patientResponse?: string;
  followUpRequired?: boolean;
}

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<NursingNote>) => void;
  patientName: string;
  patientBed: string;
  patientId: string;
}

const NOTE_TEMPLATES = {
  admission: {
    title: 'Admission Note',
    content: `ADMISSION NOTE
Patient Name: 
Date/Time of Admission: 
Admitted from: 
Chief Complaint:
History of Present Illness:
Medical History:
Medications on admission:
Allergies:
Physical Assessment:
Vital Signs:
Labs/Diagnostic Results:
Nursing Diagnosis:
Care Plan:
Patient/Family Education:`,
  },
  progress: {
    title: 'Progress Note',
    content: `PROGRESS NOTE
Date/Time:
Patient Status:
Assessment:
- Vital Signs:
- Labs:
- Physical Findings:
Interventions Performed:
Patient Response:
Plan for Next 24 hours:
Signature:`,
  },
  critical: {
    title: 'Critical Event Documentation',
    content: `CRITICAL EVENT DOCUMENTATION
Date/Time of Event:
Patient Status Before Event:
Event Description:
Actions Taken:
Response to Intervention:
Physician Notification:
Time:
Orders Received:
Follow-up Actions:
Signature:`,
  },
  discharge: {
    title: 'Discharge Summary',
    content: `DISCHARGE SUMMARY
Admission Date:
Discharge Date:
Hospital Course Summary:
Diagnoses:
Procedures Performed:
Medications at Discharge:
Activity Restrictions:
Diet:
Follow-up Appointments:
Patient/Caregiver Education Provided:
Return Precautions:
Signature:`,
  },
  'post-op': {
    title: 'Post-Operative Note',
    content: `POST-OPERATIVE NOTE
Date/Time:
Operation Performed:
Surgeon:
Anesthesia:
Recovery Time:
Vital Signs:
Operative Site Assessment:
Pain Level:
Medications Given:
Fluid Intake/Output:
Activity Level:
Patient Instructions:`,
  },
  intervention: {
    title: 'Intervention Documentation',
    content: `INTERVENTION DOCUMENTATION
Date/Time:
Patient Name:
Intervention Performed:
Indication:
Supplies Used:
Assessment Before:
Procedure:
Assessment After:
Patient Tolerance:
Complications:
Follow-up Plan:`,
  },
};

// Helper function to capitalize words
function capitalize(str: string) {
  if (!str) return '';
  return str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

// VoiceInput Component with individual mic
function VoiceInputField({ 
  value, 
  onChange, 
  placeholder, 
  label,
  hint
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string;
  label: string;
  hint: string;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      if (finalTranscript) {
        const newValue = value ? value + ' ' + capitalize(finalTranscript) : capitalize(finalTranscript);
        onChange(newValue);
        setTimeout(() => {
          setIsListening(false);
          setTranscript("");
        }, 500);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [value, onChange]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start listening:", err);
      }
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${isListening ? 'ring-2 ring-blue-500' : ''}`}
        />
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
      {isListening && (
        <p className="text-xs text-blue-500 mt-1 animate-pulse">
          🎤 {transcript || "Listening..."}
        </p>
      )}
      <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

// VoiceTextarea Component with individual mic
function VoiceTextareaField({ 
  value, 
  onChange, 
  placeholder, 
  label,
  hint,
  rows = 3
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string;
  label: string;
  hint: string;
  rows?: number;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      if (finalTranscript) {
        const newValue = value ? value + ' ' + capitalize(finalTranscript) : capitalize(finalTranscript);
        onChange(newValue);
        setTimeout(() => {
          setIsListening(false);
          setTranscript("");
        }, 500);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [value, onChange]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start listening:", err);
      }
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-1">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`resize-none pr-10 ${isListening ? 'ring-2 ring-blue-500' : ''}`}
        />
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute right-2 bottom-2 p-1.5 rounded-full transition ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
      {isListening && (
        <p className="text-xs text-blue-500 mt-1 animate-pulse">
          🎤 {transcript || "Listening..."}
        </p>
      )}
      <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

export default function CreateNoteModal({ isOpen, onClose, onSave, patientName, patientBed, patientId }: CreateNoteModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('progress');
  const [formData, setFormData] = useState({
    title: '',
    noteType: 'progress' as NursingNote['noteType'],
    content: '',
    priority: 'routine' as NursingNote['priority'],
    tags: '',
    assessmentFindings: '',
    interventions: '',
    patientResponse: '',
  });

  if (!isOpen) return null;

  const handleApplyTemplate = (templateType: string) => {
    const template = NOTE_TEMPLATES[templateType as keyof typeof NOTE_TEMPLATES];
    if (template) {
      setFormData(prev => ({
        ...prev,
        noteType: templateType as NursingNote['noteType'],
        title: template.title,
        content: template.content,
      }));
      setSelectedTemplate(templateType);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }

    onSave({
      patientId: patientId,
      patientName: patientName,
      bed: patientBed,
      noteType: formData.noteType,
      title: formData.title,
      content: formData.content,
      priority: formData.priority,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      assessmentFindings: formData.assessmentFindings,
      interventions: formData.interventions,
      patientResponse: formData.patientResponse,
      followUpRequired: formData.priority !== 'routine',
    });

    setFormData({
      title: '',
      noteType: 'progress',
      content: '',
      priority: 'routine',
      tags: '',
      assessmentFindings: '',
      interventions: '',
      patientResponse: '',
    });
    onClose();
  };

  const handleReset = () => {
    setFormData({
      title: '',
      noteType: 'progress',
      content: '',
      priority: 'routine',
      tags: '',
      assessmentFindings: '',
      interventions: '',
      patientResponse: '',
    });
    setSelectedTemplate('progress');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTemplateButtonClass = (templateKey: string) => {
    return `p-3 rounded-lg border-2 font-semibold text-sm transition-all ${
      selectedTemplate === templateKey
        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-blue-300'
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Nursing Note</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Patient:</span> {patientName} (Bed {patientBed})
            </p>
          </div>

          {/* Template Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Select Template</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(NOTE_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => handleApplyTemplate(key)}
                  className={getTemplateButtonClass(key)}
                >
                  {template.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VoiceInputField
              value={formData.title}
              onChange={(val) => handleChange("title", val)}
              placeholder="Enter note title"
              label="Note Title"
              hint='Say: "Progress Note" or type manually'
            />
            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(val) => handleChange("priority", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">Select from dropdown</p>
            </div>
          </div>

          <div>
            <Label>Note Type</Label>
            <Select value={formData.noteType} onValueChange={(val) => handleChange("noteType", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select note type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admission">Admission</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="discharge">Discharge</SelectItem>
                <SelectItem value="post-op">Post-Op</SelectItem>
                <SelectItem value="intervention">Intervention</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">Select from dropdown</p>
          </div>

          <VoiceTextareaField
            value={formData.content}
            onChange={(val) => handleChange("content", val)}
            placeholder="Enter detailed nursing notes..."
            label="Note Content"
            hint="Click the mic and speak naturally - your words will appear here"
            rows={8}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VoiceTextareaField
              value={formData.assessmentFindings}
              onChange={(val) => handleChange("assessmentFindings", val)}
              placeholder="Patient assessment findings..."
              label="Assessment Findings"
              hint='Say: "Lungs clear, heart rate regular"'
              rows={3}
            />

            <VoiceTextareaField
              value={formData.interventions}
              onChange={(val) => handleChange("interventions", val)}
              placeholder="Nursing interventions performed..."
              label="Interventions"
              hint='Say: "Administered medication, wound care"'
              rows={3}
            />
          </div>

          <VoiceTextareaField
            value={formData.patientResponse}
            onChange={(val) => handleChange("patientResponse", val)}
            placeholder="Patient's response to interventions..."
            label="Patient Response"
            hint='Say: "Pain decreased, patient resting comfortably"'
            rows={3}
          />

          <VoiceInputField
            value={formData.tags}
            onChange={(val) => handleChange("tags", val)}
            placeholder="e.g., vitals, pain, wound care"
            label="Tags"
            hint='Say: "vitals pain assessment" - commas added automatically'
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Form
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4" />
              Save Nursing Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}