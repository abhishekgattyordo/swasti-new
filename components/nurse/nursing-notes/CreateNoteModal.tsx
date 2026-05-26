

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
//   if (!str) return '';
//   return str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
// }

// // VoiceInput Component with individual mic
// function VoiceInputField({ 
//   value, 
//   onChange, 
//   placeholder, 
//   label,
//   hint
// }: { 
//   value: string; 
//   onChange: (val: string) => void; 
//   placeholder: string;
//   label: string;
//   hint: string;
// }) {
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const recognitionRef = useRef<any>(null);

//   useEffect(() => {
//     const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) return;

//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
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

//       const currentTranscript = finalTranscript || interimTranscript;
//       setTranscript(currentTranscript);

//       if (finalTranscript) {
//         const newValue = value ? value + ' ' + capitalize(finalTranscript) : capitalize(finalTranscript);
//         onChange(newValue);
//         setTimeout(() => {
//           setIsListening(false);
//           setTranscript("");
//         }, 500);
//       }
//     };

//     recognition.onerror = (event: any) => {
//       console.error("Speech recognition error", event.error);
//       setIsListening(false);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//       setTranscript("");
//     };

//     recognitionRef.current = recognition;

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, [value, onChange]);

//   const toggleListening = () => {
//     if (isListening) {
//       recognitionRef.current?.stop();
//       setIsListening(false);
//     } else {
//       setTranscript("");
//       try {
//         recognitionRef.current?.start();
//         setIsListening(true);
//       } catch (err) {
//         console.error("Failed to start listening:", err);
//       }
//     }
//   };

//   return (
//     <div>
//       <Label>{label}</Label>
//       <div className="relative mt-1">
//         <Input
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           placeholder={placeholder}
//           className={`pr-10 ${isListening ? 'ring-2 ring-blue-500' : ''}`}
//         />
//         <button
//           type="button"
//           onClick={toggleListening}
//           className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition ${
//             isListening 
//               ? 'bg-red-500 text-white animate-pulse' 
//               : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
//           }`}
//         >
//           {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
//         </button>
//       </div>
//       {isListening && (
//         <p className="text-xs text-blue-500 mt-1 animate-pulse">
//           🎤 {transcript || "Listening..."}
//         </p>
//       )}
//       <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
//     </div>
//   );
// }

// // VoiceTextarea Component with individual mic
// function VoiceTextareaField({ 
//   value, 
//   onChange, 
//   placeholder, 
//   label,
//   hint,
//   rows = 3
// }: { 
//   value: string; 
//   onChange: (val: string) => void; 
//   placeholder: string;
//   label: string;
//   hint: string;
//   rows?: number;
// }) {
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const recognitionRef = useRef<any>(null);

//   useEffect(() => {
//     const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) return;

//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
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

//       const currentTranscript = finalTranscript || interimTranscript;
//       setTranscript(currentTranscript);

//       if (finalTranscript) {
//         const newValue = value ? value + ' ' + capitalize(finalTranscript) : capitalize(finalTranscript);
//         onChange(newValue);
//         setTimeout(() => {
//           setIsListening(false);
//           setTranscript("");
//         }, 500);
//       }
//     };

//     recognition.onerror = (event: any) => {
//       console.error("Speech recognition error", event.error);
//       setIsListening(false);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//       setTranscript("");
//     };

//     recognitionRef.current = recognition;

//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, [value, onChange]);

//   const toggleListening = () => {
//     if (isListening) {
//       recognitionRef.current?.stop();
//       setIsListening(false);
//     } else {
//       setTranscript("");
//       try {
//         recognitionRef.current?.start();
//         setIsListening(true);
//       } catch (err) {
//         console.error("Failed to start listening:", err);
//       }
//     }
//   };

//   return (
//     <div>
//       <Label>{label}</Label>
//       <div className="relative mt-1">
//         <Textarea
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           placeholder={placeholder}
//           rows={rows}
//           className={`resize-none pr-10 ${isListening ? 'ring-2 ring-blue-500' : ''}`}
//         />
//         <button
//           type="button"
//           onClick={toggleListening}
//           className={`absolute right-2 bottom-2 p-1.5 rounded-full transition ${
//             isListening 
//               ? 'bg-red-500 text-white animate-pulse' 
//               : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
//           }`}
//         >
//           {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
//         </button>
//       </div>
//       {isListening && (
//         <p className="text-xs text-blue-500 mt-1 animate-pulse">
//           🎤 {transcript || "Listening..."}
//         </p>
//       )}
//       <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
//     </div>
//   );
// }

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
//   };

//   const handleChange = (field: string, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
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
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white"></h2>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400">
//             <X size={24} />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
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
//             <VoiceInputField
//               value={formData.title}
//               onChange={(val) => handleChange("title", val)}
//               placeholder="Enter note title"
//               label="Note Title"
//               hint='Say: "Progress Note" or type manually'
//             />
//             <div>
//               <Label>Priority</Label>
//               <Select value={formData.priority} onValueChange={(val) => handleChange("priority", val)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select priority" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="routine">Routine</SelectItem>
//                   <SelectItem value="urgent">Urgent</SelectItem>
//                   <SelectItem value="critical">Critical</SelectItem>
//                 </SelectContent>
//               </Select>
//               <p className="text-[10px] text-muted-foreground mt-1">Select from dropdown</p>
//             </div>
//           </div>

//           <div>
//             <Label>Note Type</Label>
//             <Select value={formData.noteType} onValueChange={(val) => handleChange("noteType", val)}>
//               <SelectTrigger>
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
//             <p className="text-[10px] text-muted-foreground mt-1">Select from dropdown</p>
//           </div>

//           <VoiceTextareaField
//             value={formData.content}
//             onChange={(val) => handleChange("content", val)}
//             placeholder="Enter detailed nursing notes..."
//             label="Note Content"
//             hint="Click the mic and speak naturally - your words will appear here"
//             rows={8}
//           />

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <VoiceTextareaField
//               value={formData.assessmentFindings}
//               onChange={(val) => handleChange("assessmentFindings", val)}
//               placeholder="Patient assessment findings..."
//               label="Assessment Findings"
//               hint='Say: "Lungs clear, heart rate regular"'
//               rows={3}
//             />

//             <VoiceTextareaField
//               value={formData.interventions}
//               onChange={(val) => handleChange("interventions", val)}
//               placeholder="Nursing interventions performed..."
//               label="Interventions"
//               hint='Say: "Administered medication, wound care"'
//               rows={3}
//             />
//           </div>

//           <VoiceTextareaField
//             value={formData.patientResponse}
//             onChange={(val) => handleChange("patientResponse", val)}
//             placeholder="Patient's response to interventions..."
//             label="Patient Response"
//             hint='Say: "Pain decreased, patient resting comfortably"'
//             rows={3}
//           />

//           <VoiceInputField
//             value={formData.tags}
//             onChange={(val) => handleChange("tags", val)}
//             placeholder="e.g., vitals, pain, wound care"
//             label="Tags"
//             hint='Say: "vitals pain assessment" - commas added automatically'
//           />

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
import { X, Save, FileText, Mic, MicOff, AlertCircle, RotateCcw, Sparkles, Loader2, Wand2, Trash2, RefreshCw } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'normal' | 'ai'>('normal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Generate AI content and directly replace the Note Content field
  const handleAIGenerateAndReplace = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const request = {
        patientName,
        patientBed,
        noteType: formData.noteType,
        title: formData.title || `${formData.noteType.charAt(0).toUpperCase() + formData.noteType.slice(1)} Note`,
        assessmentFindings: formData.assessmentFindings || "Routine assessment, stable",
        interventions: formData.interventions || "Standard nursing care",
        patientResponse: formData.patientResponse || "Tolerating well, no distress",
        priority: formData.priority,
      };

      const response = await fetch('/api/nurse/generate-nursing-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI failed to generate note');
      }

      // Directly replace the Note Content field with AI generated content
      setFormData(prev => ({ ...prev, content: data.content }));
      
    } catch (error) {
      console.error('AI Generation error:', error);
      setError(error instanceof Error ? error.message : 'AI service unavailable. Please try again.');
    } finally {
      setIsGenerating(false);
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
    setError(null);
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
    setError(null);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const getTemplateButtonClass = (templateKey: string) => {
    return `p-3 rounded-lg border-2 font-semibold text-sm transition-all ${
      selectedTemplate === templateKey
        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-blue-300'
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 z-10">
          <div className="p-6 pb-0 flex items-center justify-between">
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

          {/* Tabs */}
          <div className="flex px-6 pt-4 gap-1 border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('normal')}
              className={`px-6 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === 'normal'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              📝 Normal Mode
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-6 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === 'ai'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Mode
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* Patient Info */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Patient:</span> {patientName} (Bed {patientBed})
            </p>
          </div>

          {/* Template Selection - Same for both modes */}
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

          {/* Common Fields - Same for both modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VoiceInputField
              value={formData.title}
              onChange={(val) => handleChange("title", val)}
              placeholder="Enter note title"
              label="Note Title *"
              hint='Say: "Daily Progress Note" or type manually'
            />
            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(val) => handleChange("priority", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">🟢 Routine</SelectItem>
                  <SelectItem value="urgent">🟠 Urgent</SelectItem>
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Note Type</Label>
            <Select value={formData.noteType} onValueChange={(val) => handleChange("noteType", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select note type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress">Progress Note</SelectItem>
                <SelectItem value="admission">Admission Note</SelectItem>
                <SelectItem value="critical">Critical Event</SelectItem>
                <SelectItem value="discharge">Discharge Summary</SelectItem>
                <SelectItem value="post-op">Post-Operative Note</SelectItem>
                <SelectItem value="intervention">Intervention</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assessment, Interventions, Patient Response - Same for both modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VoiceTextareaField
              value={formData.assessmentFindings}
              onChange={(val) => handleChange("assessmentFindings", val)}
              placeholder="Patient assessment findings..."
              label="Assessment Findings"
              hint='Say: "Lungs clear, heart rate regular, BP 120/80"'
              rows={3}
            />

            <VoiceTextareaField
              value={formData.interventions}
              onChange={(val) => handleChange("interventions", val)}
              placeholder="Nursing interventions performed..."
              label="Interventions"
              hint='Say: "Administered medication, wound care, patient education"'
              rows={3}
            />
          </div>

          <VoiceTextareaField
            value={formData.patientResponse}
            onChange={(val) => handleChange("patientResponse", val)}
            placeholder="Patient's response to interventions..."
            label="Patient Response"
            hint='Say: "Pain decreased to 1/10, patient resting comfortably"'
            rows={3}
          />

          {/* AI Specific Section - Only shows Generate button (no preview) */}
          {activeTab === 'ai' && (
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleAIGenerateAndReplace}
                disabled={isGenerating}
                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating AI Note...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate AI Nursing Note
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Note Content */}
          <VoiceTextareaField
            value={formData.content}
            onChange={(val) => handleChange("content", val)}
            placeholder={activeTab === 'ai' ? "Click 'Generate AI Nursing Note' to create professional content..." : "Enter detailed nursing notes..."}
            label="Note Content *"
            hint={activeTab === 'ai' ? "AI will generate professional content based on your inputs above and place it directly here" : "Write or speak your nursing note here"}
            rows={12}
          />

          {/* Tags */}
          <VoiceInputField
            value={formData.tags}
            onChange={(val) => handleChange("tags", val)}
            placeholder="e.g., vitals, pain, wound care, post-op"
            label="Tags (comma-separated)"
            hint='Say: "vitals pain assessment" - commas added automatically'
          />

          {/* Action Buttons */}
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