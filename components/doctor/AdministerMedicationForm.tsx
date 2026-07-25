



// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { X, Loader2, Pill, Clock, Repeat, Search, Mic, MicOff, Sparkles } from 'lucide-react';
// import { useLiveTranscription } from '@/hooks/useLiveTranscription';
// import { LiveMicButton, LiveMicStatusLine } from '@/components/speech/LiveMicButton';

// interface Medication {
//   name: string;
//   dosage: string;
//   frequency: string;
//   route: string;
//   status: string;
//   startDate: string;
//   prescriber: string;
//   prescriberId?: string;
// }

// interface AdministerMedicationFormProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: {
//     medicationName: string;
//     dosage: string;
//     route: string;
//     scheduledTime: string;
//     duration?: string;
//     frequency?: string;
//     notes: string;
//     prescribedBy?: string;
//     prescribedById?: string;
//   }) => Promise<void>;
//   prescriptions: Medication[];
//   patientName?: string;
// }

// export default function AdministerMedicationForm({
//   isOpen,
//   onClose,
//   onSubmit,
//   prescriptions,
//   patientName,
// }: AdministerMedicationFormProps) {
//   const [formData, setFormData] = useState({
//     medicationName: '',
//     dosage: '',
//     route: 'Oral',
//     scheduledTime: '',
//     duration: '',
//     frequency: '',
//     notes: '',
//     prescribedBy: '',
//     prescribedById: '',
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // AI Dictation State
//   const [isAiProcessing, setIsAiProcessing] = useState(false);
//   const [micLanguage, setMicLanguage] = useState('en-IN');

//   const {
//     status: micStatus,
//     isConnecting,
//     isListening: isAiListening,
//     isActive,
//     fullText: aiCommand,
//     interimText,
//     setFullText: setAiCommand,
//     toggle: toggleAiListening,
//   } = useLiveTranscription({
//     onError: (message) => console.error('Microphone error:', message),
//   });

//   const startAiListening = () => {
//     void toggleAiListening({ micLanguage, clearOnStart: true });
//   };

//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const activePrescriptions = prescriptions.filter(m => m.status === 'active');

//   // Filter prescriptions based on search term
//   const filteredPrescriptions = activePrescriptions.filter(m =>
//     m.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const processAiCommand = async () => {
//     if (!aiCommand.trim()) return;
//     setIsAiProcessing(true);
//     try {
//       const response = await fetch('/api/doctors/prescriptions/ai-prescriptions', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ transcript: aiCommand }),
//       });
//       if (!response.ok) throw new Error('AI processing failed');
//       const parsed = await response.json();
      
//       // Auto-fill form
//       setFormData(prev => ({
//         ...prev,
//         medicationName: parsed.medicationName || prev.medicationName,
//         dosage: parsed.dosage || prev.dosage,
//         route: parsed.route || prev.route,
//         scheduledTime: parsed.scheduledTime || prev.scheduledTime,
//         duration: parsed.duration?.toString() || prev.duration,
//         frequency: parsed.frequency || prev.frequency,
//         notes: parsed.notes || prev.notes,
//       }));
//       setAiCommand('');
//     } catch (err) {
//       console.error('AI parse error:', err);
//     } finally {
//       setIsAiProcessing(false);
//     }
//   };

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};
//     if (!formData.medicationName) newErrors.medicationName = 'Medication name is required';
//     if (!formData.dosage) newErrors.dosage = 'Dosage is required';
//     if (!formData.scheduledTime) newErrors.scheduledTime = 'Scheduled time is required';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleMedicationSelect = (med: Medication) => {
//     setFormData(prev => ({
//       ...prev,
//       medicationName: med.name,
//       dosage: med.dosage || prev.dosage,
//       route: med.route || prev.route,
//       frequency: med.frequency || prev.frequency,
//       prescribedBy: med.prescriber || prev.prescribedBy,
//       prescribedById: med.prescriberId || prev.prescribedById,
//     }));
//     setSearchTerm('');
//     setShowDropdown(false);
//   };

//   const handleMedicationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setFormData(prev => ({ ...prev, medicationName: value }));
//     setSearchTerm(value);
//     setShowDropdown(true);
//     if (!activePrescriptions.find(m => m.name === value)) {
//       setFormData(prev => ({ ...prev, prescribedBy: '', prescribedById: '' }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setSubmitting(true);
//     try {
//       await onSubmit(formData);
//       setFormData({ 
//         medicationName: '', dosage: '', route: 'Oral', 
//         scheduledTime: '', duration: '', frequency: '', notes: '',
//         prescribedBy: '', prescribedById: '',
//       });
//       setSearchTerm('');
//     } catch (err) {
//       console.error('Failed to administer medication:', err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   const routeOptions = ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhalation', 'Sublingual', 'Rectal'];
//   const frequencyOptions = [
//     { value: 'OD', label: 'Once Daily (OD)' },
//     { value: 'BD', label: 'Twice Daily (BD)' },
//     { value: 'TID', label: 'Three Times Daily (TID)' },
//     { value: 'QID', label: 'Four Times Daily (QID)' },
//     { value: 'SOS', label: 'As Needed (SOS)' },
//     { value: 'STAT', label: 'Immediately (STAT)' },
//   ];

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-xl">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//               <Pill size={20} className="text-purple-500" />
//               Administer Medication
//             </h2>
//             {patientName && (
//               <p className="text-sm text-gray-500 mt-0.5">Patient: {patientName}</p>
//             )}
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
//             <X size={20} className="text-gray-500" />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-5">
//           {/* AI Dictation Panel */}
//           <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200 mb-2">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm font-semibold text-purple-700 flex items-center gap-1">
//                 <Sparkles size={16} /> AI Voice Medication Entry
//               </span>
//               <div className="flex gap-2">
//                 <select
//                   value={micLanguage}
//                   onChange={(e) => setMicLanguage(e.target.value)}
//                   disabled={isActive}
//                   className="text-xs border rounded-lg px-2 py-1 bg-white"
//                 >
//                   <option value="en-IN">English</option>
//                   <option value="kn-IN">Kannada</option>
//                   <option value="hi-IN">Hindi</option>
//                 </select>
//                 <LiveMicButton
//                   status={micStatus}
//                   onClick={startAiListening}
//                   className={`p-2 rounded-full transition ${
//                     isAiListening
//                       ? 'bg-red-500 text-white animate-pulse'
//                       : isConnecting
//                         ? 'bg-amber-500 text-white'
//                         : 'bg-white border text-purple-600'
//                   }`}
//                 />
//                 <button
//                   type="button"
//                   onClick={processAiCommand}
//                   disabled={isAiProcessing || !aiCommand.trim()}
//                   className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg disabled:opacity-50 flex items-center gap-1"
//                 >
//                   {isAiProcessing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Process
//                 </button>
//               </div>
//             </div>
//             <textarea
//               value={aiCommand}
//               onChange={(e) => setAiCommand(e.target.value)}
//               placeholder="Speak or type: 'Administer 500mg Paracetamol Oral now for fever' or 'Give 40mg Furosemide IV stat with notes check BP'"
//               rows={2}
//               className="w-full px-3 py-2 border rounded-lg text-sm resize-none bg-white"
//             />
//             <LiveMicStatusLine status={micStatus} interimText={interimText} className="text-xs mt-2" />
//           </div>

//           {/* Medication Name - Searchable Input */}
//           <div ref={dropdownRef}>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Medication <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={formData.medicationName}
//                 onChange={handleMedicationInputChange}
//                 onFocus={() => setShowDropdown(true)}
//                 placeholder="Type or select medication..."
//                 className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
//                   errors.medicationName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
//                 }`}
//               />
              
//               {/* Dropdown */}
//               {showDropdown && searchTerm && filteredPrescriptions.length > 0 && (
//                 <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
//                   {filteredPrescriptions.map((med, i) => (
//                     <button
//                       key={i}
//                       type="button"
//                       onClick={() => handleMedicationSelect(med)}
//                       className="w-full text-left px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
//                     >
//                       <p className="font-medium text-sm text-gray-900 dark:text-white">{med.name}</p>
//                       <p className="text-xs text-gray-500">{med.dosage} • {med.frequency} • {med.route}</p>
//                     </button>
//                   ))}
//                 </div>
//               )}
              
//               {showDropdown && searchTerm && filteredPrescriptions.length === 0 && activePrescriptions.length > 0 && (
//                 <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-center">
//                   <p className="text-xs text-gray-500">No matching prescriptions. You can type a new medication name.</p>
//                 </div>
//               )}
//             </div>
//             {errors.medicationName && (
//               <p className="text-xs text-red-500 mt-1">{errors.medicationName}</p>
//             )}
//             {activePrescriptions.length === 0 && (
//               <p className="text-xs text-amber-500 mt-1">No active prescriptions found. Type medication name manually.</p>
//             )}
//             {formData.prescribedBy && (
//               <p className="text-xs text-gray-500 mt-1">
//                 Prescribed by: {formData.prescribedBy}
//                 {formData.prescribedById && ` (ID: ${formData.prescribedById})`}
//               </p>
//             )}
//           </div>

//           {/* Dosage & Route */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Dosage <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.dosage}
//                 onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
//                 placeholder="e.g., 500mg"
//                 className={`w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
//                   errors.dosage ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
//                 }`}
//               />
//               {errors.dosage && (
//                 <p className="text-xs text-red-500 mt-1">{errors.dosage}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Route <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={formData.route}
//                 onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
//                 className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               >
//                 {routeOptions.map(route => (
//                   <option key={route} value={route}>{route}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Scheduled Time & Duration */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 <Clock size={14} className="inline mr-1" />
//                 Scheduled Time <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="time"
//                 value={formData.scheduledTime}
//                 onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
//                 className={`w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
//                   errors.scheduledTime ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
//                 }`}
//               />
//               {errors.scheduledTime && (
//                 <p className="text-xs text-red-500 mt-1">{errors.scheduledTime}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Duration (Days)
//               </label>
//               <input
//                 type="number"
//                 value={formData.duration}
//                 onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
//                 placeholder="e.g., 7"
//                 min="1"
//                 max="90"
//                 className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               />
//             </div>
//           </div>

//           {/* Frequency */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               <Repeat size={14} className="inline mr-1" />
//               Frequency
//             </label>
//             <select
//               value={formData.frequency}
//               onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
//               className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//             >
//               <option value="">Select frequency</option>
//               {frequencyOptions.map(opt => (
//                 <option key={opt.value} value={opt.value}>{opt.label}</option>
//               ))}
//             </select>
//             <p className="text-xs text-gray-400 mt-1">
//               OD=Once | BD=Twice | TID=3x | QID=4x | SOS=As needed | STAT=Immediate
//             </p>
//           </div>

//           {/* Notes */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               Notes
//             </label>
//             <textarea
//               value={formData.notes}
//               onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
//               rows={3}
//               placeholder="Any observations, patient response, or special instructions..."
//               className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
//             />
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-3 justify-end pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
//             >
//               {submitting ? (
//                 <>
//                   <Loader2 size={16} className="animate-spin" />
//                   Recording...
//                 </>
//               ) : (
//                 <>
//                   <Pill size={16} />
//                   Record Administration
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Pill, Clock, Repeat, Search, Mic, Sparkles, StopCircle, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  status: string;
  startDate: string;
  prescriber: string;
  prescriberId?: string;
}

export interface AdministerMedicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    medicationName: string;
    dosage: string;
    route: string;
    scheduledTime: string;
    duration?: string;
    frequency?: string;
    notes: string;
    prescribedBy?: string;
    prescribedById?: string;
  }) => Promise<void>;
  prescriptions: Medication[];
  patientName?: string;
}

export default function AdministerMedicationForm({
  isOpen,
  onClose,
  onSubmit,
  prescriptions,
  patientName,
}: AdministerMedicationFormProps) {
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    route: 'Oral',
    scheduledTime: '',
    duration: '',
    frequency: '',
    notes: '',
    prescribedBy: '',
    prescribedById: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Voice Recording States ---
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [micLanguage, setMicLanguage] = useState('en-IN');
  const [spokenText, setSpokenText] = useState('');
  const [audioBase64, setAudioBase64] = useState<string>('');
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activePrescriptions = prescriptions ? prescriptions.filter(m => m.status === 'active') : [];

  const filteredPrescriptions = activePrescriptions.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Recording Handlers ---
  const startRecording = async () => {
    if (mediaRecorderRef.current) {
      try { await mediaRecorderRef.current.stop(); } catch (e) {}
      mediaRecorderRef.current = null;
    }
    setAudioBase64('');
    setAudioMimeType('audio/webm');
    setIsConnecting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          setAudioBase64(base64);
          setAudioMimeType('audio/webm');
          toast.success('✅ Audio captured. Processing with AI...');
          // Auto-process using the captured audio
          processAiCommandWithData(base64, 'audio/webm');
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsConnecting(false);
      setIsRecording(true);
      toast.success(`🎙️ Recording in ${micLanguage}. Speak medication command clearly.`);
    } catch (err) {
      setIsConnecting(false);
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      toast.error(message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- AI Extraction ---
  const processAiCommandWithData = async (overrideAudioBase64?: string, overrideMimeType?: string) => {
    const trimmedText = spokenText.trim();
    const effectiveAudioBase64 = overrideAudioBase64 || audioBase64;
    const effectiveMimeType = overrideMimeType || audioMimeType;

    if (!trimmedText && !effectiveAudioBase64) {
      toast.error('Please speak into the mic or type a medication command.');
      return;
    }

    setIsAiProcessing(true);
    const loadingToast = toast.loading('🧠 AI is parsing medication command...');

    try {
      const response = await fetch('/api/doctors/prescriptions/ai-prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: trimmedText || undefined,
          audioBase64: effectiveAudioBase64 || undefined,
          mimeType: effectiveMimeType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || 'Failed to parse medication.');
      }

      const parsed = await response.json();
      setFormData(prev => ({
        ...prev,
        medicationName: parsed.medicationName || prev.medicationName,
        dosage: parsed.dosage || prev.dosage,
        route: parsed.route || prev.route,
        scheduledTime: parsed.scheduledTime || prev.scheduledTime,
        duration: parsed.duration?.toString() || prev.duration,
        frequency: parsed.frequency || prev.frequency,
        notes: parsed.notes || prev.notes,
      }));
      setSpokenText('');
      setAudioBase64('');
      toast.success('✅ AI filled medication details. Review and submit.');
    } catch (err: any) {
      toast.error(err.message || 'AI parsing failed.');
    } finally {
      toast.dismiss(loadingToast);
      setIsAiProcessing(false);
    }
  };

  // Manual process (using current state)
  const processAiCommand = () => processAiCommandWithData();

  const clearVoiceInput = () => {
    setSpokenText('');
    setAudioBase64('');
    setAudioMimeType('audio/webm');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- Form handlers ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.medicationName) newErrors.medicationName = 'Medication name is required';
    if (!formData.dosage) newErrors.dosage = 'Dosage is required';
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Scheduled time is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMedicationSelect = (med: Medication) => {
    setFormData(prev => ({
      ...prev,
      medicationName: med.name,
      dosage: med.dosage || prev.dosage,
      route: med.route || prev.route,
      frequency: med.frequency || prev.frequency,
      prescribedBy: med.prescriber || prev.prescribedBy,
      prescribedById: med.prescriberId || prev.prescribedById,
    }));
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleMedicationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, medicationName: value }));
    setSearchTerm(value);
    setShowDropdown(true);
    if (!activePrescriptions.find(m => m.name === value)) {
      setFormData(prev => ({ ...prev, prescribedBy: '', prescribedById: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ 
        medicationName: '', dosage: '', route: 'Oral', 
        scheduledTime: '', duration: '', frequency: '', notes: '',
        prescribedBy: '', prescribedById: '',
      });
      setSearchTerm('');
      setSpokenText('');
      setAudioBase64('');
      toast.success('Medication administration recorded.');
    } catch (err) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const routeOptions = ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhalation', 'Sublingual', 'Rectal'];
  const frequencyOptions = [
    { value: 'OD', label: 'Once Daily (OD)' },
    { value: 'BD', label: 'Twice Daily (BD)' },
    { value: 'TID', label: 'Three Times Daily (TID)' },
    { value: 'QID', label: 'Four Times Daily (QID)' },
    { value: 'SOS', label: 'As Needed (SOS)' },
    { value: 'STAT', label: 'Immediately (STAT)' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Pill size={20} className="text-purple-500" />
              Administer Medication
            </h2>
            {patientName && (
              <p className="text-sm text-gray-500 mt-0.5">Patient: {patientName}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* AI Voice Panel */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-800/50 mb-2">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <Sparkles size={16} /> Voice to AI Medication Entry
              </span>
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg">
                  <Globe className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                  <select
                    className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-transparent border-none outline-none cursor-pointer"
                    value={micLanguage}
                    onChange={(e) => setMicLanguage(e.target.value)}
                    disabled={isRecording || isConnecting}
                  >
                    <option value="en-IN">English</option>
                    <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
                    <option value="hi-IN">हिंदी (Hindi)</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isConnecting || isAiProcessing}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                      : isConnecting
                        ? 'bg-amber-500 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isConnecting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isRecording ? (
                    <StopCircle className="h-3.5 w-3.5" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                  {isConnecting ? 'Connecting...' : isRecording ? 'Stop' : 'Record'}
                </button>
                <button
                  type="button"
                  onClick={processAiCommand}
                  disabled={isAiProcessing || (!audioBase64 && !spokenText.trim())}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 flex items-center gap-1"
                >
                  {isAiProcessing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Process
                </button>
              </div>
            </div>
            <textarea
              value={spokenText}
              onChange={(e) => setSpokenText(e.target.value)}
              placeholder="Speak or type: 'Administer 500mg Paracetamol Oral now for fever' or 'Give 40mg Furosemide IV stat with notes check BP'"
              rows={2}
              className="w-full px-3 py-2 border border-purple-200 dark:border-purple-800 rounded-lg text-sm resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
            {audioBase64 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                ✅ Audio recorded ({Math.round((audioBase64.length * 0.75) / 1024)} KB)
              </p>
            )}
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={clearVoiceInput}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                Clear Voice Input
              </button>
            </div>
          </div>

          {/* Searchable Medication Dropdown */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Medication <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={formData.medicationName}
                onChange={handleMedicationInputChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Type or select medication..."
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 ${
                  errors.medicationName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              
              {showDropdown && searchTerm && filteredPrescriptions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredPrescriptions.map((med, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleMedicationSelect(med)}
                      className="w-full text-left px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{med.name}</p>
                      <p className="text-xs text-gray-500">{med.dosage} • {med.frequency} • {med.route}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.medicationName && (
              <p className="text-xs text-red-500 mt-1">{errors.medicationName}</p>
            )}
            {activePrescriptions.length === 0 && (
              <p className="text-xs text-amber-500 mt-1">No active prescriptions found. Type medication name manually.</p>
            )}
            {formData.prescribedBy && (
              <p className="text-xs text-gray-500 mt-1">
                Prescribed by: {formData.prescribedBy}
                {formData.prescribedById && ` (ID: ${formData.prescribedById})`}
              </p>
            )}
          </div>

          {/* Dosage & Route */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dosage <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 500mg"
                className={`w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white ${
                  errors.dosage ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Route <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.route}
                onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
              >
                {routeOptions.map(route => (
                  <option key={route} value={route}>{route}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Scheduled Time & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock size={14} className="inline mr-1" />
                Scheduled Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className={`w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white ${
                  errors.scheduledTime ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (Days)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 7"
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Repeat size={14} className="inline mr-1" />
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
            >
              <option value="">Select frequency</option>
              {frequencyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Any observations, patient response, or special instructions..."
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Pill size={16} />}
              Record Administration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}