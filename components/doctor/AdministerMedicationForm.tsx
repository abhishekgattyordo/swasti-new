// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { X, Loader2, Pill, Clock, Repeat, Search } from 'lucide-react';

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
//     // Clear prescribedBy when typing manually (not selecting from list)
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
              
//               {/* No results */}
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
import { X, Loader2, Pill, Clock, Repeat, Search, Mic, MicOff, Sparkles } from 'lucide-react';
import { LiveTranscriptionSession, mapMicLocale } from '@/lib/speech';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  status: string;
  startDate: string;
  prescriber: string;
  prescriberId?: string;
}

interface AdministerMedicationFormProps {
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
  
  // AI Dictation State
  const [aiCommand, setAiCommand] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isAiListening, setIsAiListening] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [micLanguage, setMicLanguage] = useState('en-IN');
  const liveSessionRef = useRef<LiveTranscriptionSession | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activePrescriptions = prescriptions.filter(m => m.status === 'active');

  // Filter prescriptions based on search term
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

  useEffect(() => {
    return () => {
      liveSessionRef.current?.cancel();
    };
  }, []);

  const startAiListening = async () => {
    if (isAiListening) {
      const session = liveSessionRef.current;
      if (session) {
        try {
          const state = await session.stop();
          setAiCommand(state.fullText);
          setInterimText('');
        } catch (err) {
          console.error('Stop error:', err);
        }
      }
      liveSessionRef.current = null;
      setIsAiListening(false);
      return;
    }

    liveSessionRef.current?.cancel();
    setAiCommand('');
    setInterimText('');

    const session = new LiveTranscriptionSession();
    liveSessionRef.current = session;

    try {
      await session.start(
        (state) => {
          setAiCommand(state.fullText);
          setInterimText(state.interimText);
        },
        { language: mapMicLocale(micLanguage) }
      );
      setIsAiListening(true);
    } catch (err) {
      liveSessionRef.current = null;
      console.error('Microphone error:', err);
    }
  };

  const processAiCommand = async () => {
    if (!aiCommand.trim()) return;
    setIsAiProcessing(true);
    try {
      const response = await fetch('/api/doctors/prescriptions/ai-prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: aiCommand }),
      });
      if (!response.ok) throw new Error('AI processing failed');
      const parsed = await response.json();
      
      // Auto-fill form
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
      setAiCommand('');
    } catch (err) {
      console.error('AI parse error:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

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
    } catch (err) {
      console.error('Failed to administer medication:', err);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-xl">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* AI Dictation Panel */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-purple-700 flex items-center gap-1">
                <Sparkles size={16} /> AI Voice Medication Entry
              </span>
              <div className="flex gap-2">
                <select
                  value={micLanguage}
                  onChange={(e) => setMicLanguage(e.target.value)}
                  disabled={isAiListening}
                  className="text-xs border rounded-lg px-2 py-1 bg-white"
                >
                  <option value="en-IN">English</option>
                  <option value="kn-IN">Kannada</option>
                  <option value="hi-IN">Hindi</option>
                </select>
                <button
                  type="button"
                  onClick={() => void startAiListening()}
                  className={`p-2 rounded-full transition ${isAiListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white border text-purple-600'}`}
                >
                  {isAiListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button
                  type="button"
                  onClick={processAiCommand}
                  disabled={isAiProcessing || !aiCommand.trim()}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg disabled:opacity-50 flex items-center gap-1"
                >
                  {isAiProcessing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Process
                </button>
              </div>
            </div>
            <textarea
              value={aiCommand}
              onChange={(e) => setAiCommand(e.target.value)}
              placeholder="Speak or type: 'Administer 500mg Paracetamol Oral now for fever' or 'Give 40mg Furosemide IV stat with notes check BP'"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none bg-white"
            />
            {isAiListening && (
              <p className="text-xs text-purple-600 mt-2 animate-pulse flex items-center gap-1">
                <Mic size={12} /> Listening... {interimText || 'Speak your medication order'}
              </p>
            )}
          </div>

          {/* Medication Name - Searchable Input */}
          <div ref={dropdownRef}>
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
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.medicationName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              
              {/* Dropdown */}
              {showDropdown && searchTerm && filteredPrescriptions.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredPrescriptions.map((med, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleMedicationSelect(med)}
                      className="w-full text-left px-4 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{med.name}</p>
                      <p className="text-xs text-gray-500">{med.dosage} • {med.frequency} • {med.route}</p>
                    </button>
                  ))}
                </div>
              )}
              
              {showDropdown && searchTerm && filteredPrescriptions.length === 0 && activePrescriptions.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-center">
                  <p className="text-xs text-gray-500">No matching prescriptions. You can type a new medication name.</p>
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
                className={`w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.dosage ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              {errors.dosage && (
                <p className="text-xs text-red-500 mt-1">{errors.dosage}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Route <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.route}
                onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className={`w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.scheduledTime ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              {errors.scheduledTime && (
                <p className="text-xs text-red-500 mt-1">{errors.scheduledTime}</p>
              )}
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
                min="1"
                max="90"
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select frequency</option>
              {frequencyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              OD=Once | BD=Twice | TID=3x | QID=4x | SOS=As needed | STAT=Immediate
            </p>
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
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Pill size={16} />
                  Record Administration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}