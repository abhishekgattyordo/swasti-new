// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link';
// import { 
//   ArrowLeft, BookOpen, Send, Download, Copy, 
//   CheckCircle2, AlertCircle, Clock, User, 
//   ChevronRight, Bell, Loader2
// } from 'lucide-react';
// import { nurseApi, Patient } from '@/lib/api/nurse';
// import toast from 'react-hot-toast';

// interface HandoverPatient {
//   patientId: string;
//   patientName: string;
//   bed: string;
//   currentStatus: string;
//   pendingTasks: string[];
//   medicationsDue: string[];
//   labTestsPending: string[];
//   doctorInstructions: string;
//   familyCommunication: string;
//   specialNotes: string;
// }

// export default function HandoverPage() {
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [handoverStarted, setHandoverStarted] = useState(false);
//   const [handoverCompleted, setHandoverCompleted] = useState(false);
//   const [handoverAcknowledged, setHandoverAcknowledged] = useState(false);
//   const [fromShift, setFromShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');
//   const [toShift, setToShift] = useState<'Morning' | 'Evening' | 'Night'>('Evening');
//   const [toNurse, setToNurse] = useState('');
//   const [generalNotes, setGeneralNotes] = useState('');
//   const [equipmentStatus, setEquipmentStatus] = useState('All equipment functioning normally.');
//   const [emergencySupplies, setEmergencySupplies] = useState('Crash cart checked and stocked. Emergency medications available.');
//   const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
//   const [patientNotes, setPatientNotes] = useState<Record<string, string>>({});
//   const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);

//   const currentNurse = localStorage.getItem('userName') || 'Current Nurse';
//   const currentDate = new Date().toLocaleDateString();
//   const currentTime = new Date().toLocaleTimeString();

//   // Fetch real patients
//   const fetchPatients = useCallback(async () => {
//     try {
//       setLoading(true);
//       const result = await nurseApi.getPatients();
//       let allPatients: Patient[] = [];
//       if (result?.success && result?.data) allPatients = result.data;
//       else if (Array.isArray(result)) allPatients = result;
//       else if (result?.data) allPatients = result.data;
      
//       setPatients(allPatients.filter(p => p.status === 'active'));
//     } catch (err) {
//       console.error('Failed to fetch patients:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchPatients(); }, [fetchPatients]);

//   // Generate handover patients from real data
//   const handoverPatients: HandoverPatient[] = patients.map(p => ({
//     patientId: p.patient_id,
//     patientName: p.patient_name,
//     bed: p.bed_number || 'N/A',
//     currentStatus: `Active - ${p.reason || 'Under observation'}. ${p.diagnosis ? 'Diagnosis: ' + p.diagnosis : ''}`,
//     pendingTasks: ['Monitor vitals', 'Administer medications as ordered', 'Document in chart'],
//     medicationsDue: ['Check medication chart for scheduled medications'],
//     labTestsPending: ['Review pending lab orders'],
//     doctorInstructions: p.diagnosis ? `Monitor for changes related to ${p.diagnosis}` : 'Continue current treatment plan',
//     familyCommunication: 'Update family on condition during visiting hours',
//     specialNotes: `Admitted: ${p.admission_date}. Ward: ${p.ward_name || 'N/A'}`,
//   }));

//   const handleStartHandover = () => setHandoverStarted(true);
//   const handleCompleteHandover = () => setHandoverCompleted(true);

//   const handleAcknowledgeHandover = () => {
//     setHandoverAcknowledged(true);
//     setShowAcknowledgeModal(false);
//     toast.success('Handover acknowledged successfully!');
//   };

//   const handleDownloadHandover = () => {
//     const handoverText = generateHandoverText();
//     const element = document.createElement('a');
//     element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(handoverText));
//     element.setAttribute('download', `Handover_${currentDate.replace(/\//g, '-')}.txt`);
//     document.body.appendChild(element);
//     element.click();
//     document.body.removeChild(element);
//     toast.success('Report downloaded!');
//   };

//   const handleCopyHandover = () => {
//     navigator.clipboard.writeText(generateHandoverText());
//     toast.success('Report copied to clipboard!');
//   };

//   const generateHandoverText = () => {
//     let text = `
// ═══════════════════════════════════════════════════════════════
//                     NURSING SHIFT HANDOVER REPORT
// ═══════════════════════════════════════════════════════════════
// Date: ${currentDate}
// Time: ${currentTime}
// From Nurse: ${currentNurse} (${fromShift} Shift)
// To Nurse: ${toNurse || '_______________'} (${toShift} Shift)

// ───────────────────────────────────────────────────────────────
// GENERAL INFORMATION
// ───────────────────────────────────────────────────────────────
// Total Patients: ${patients.length}

// Equipment Status: ${equipmentStatus}
// Emergency Supplies: ${emergencySupplies}
// General Notes: ${generalNotes || 'No additional notes'}

// ───────────────────────────────────────────────────────────────
// PATIENT HANDOVER DETAILS
// ───────────────────────────────────────────────────────────────
// `;

//     handoverPatients.forEach(patient => {
//       text += `
// PATIENT: ${patient.patientName} | Bed: ${patient.bed}
// ───────────────────────────────────────────────────────────────
// Current Status: ${patient.currentStatus}
// Pending Tasks: ${patient.pendingTasks.join(', ')}
// Medications Due: ${patient.medicationsDue.join(', ')}
// ${patient.labTestsPending.length > 0 ? `Lab Tests Pending: ${patient.labTestsPending.join(', ')}` : ''}
// Doctor Instructions: ${patient.doctorInstructions}
// Family Communication: ${patient.familyCommunication}
// ${patientNotes[patient.patientId] ? `Additional Notes: ${patientNotes[patient.patientId]}` : ''}

// `;
//     });

//     text += `
// ───────────────────────────────────────────────────────────────
// HANDOVER CHECKLIST
// ───────────────────────────────────────────────────────────────
// ☐ Patient identification verified for all patients
// ☐ All critical alerts reviewed
// ☐ Emergency equipment checked
// ☐ Controlled substances counted and verified
// ☐ Lab pending list reviewed
// ☐ Doctor orders reviewed
// ☐ Family communication documented

// ═══════════════════════════════════════════════════════════════
// ACKNOWLEDGMENT
// ═══════════════════════════════════════════════════════════════
// I acknowledge that I have received and understood the handover 
// report for all patients. I have had the opportunity to ask 
// questions and clarify any concerns.

// Receiving Nurse Signature: _________________
// Date/Time: _________________
// ═══════════════════════════════════════════════════════════════
// `;
//     return text;
//   };

//   // Loading State
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
//           <p className="mt-2 text-gray-500">Loading patients...</p>
//         </div>
//       </div>
//     );
//   }

//   // Start Screen
//   if (!handoverStarted) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
//         <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
//           <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
//             <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
//               <ArrowLeft size={20} />
//             </Link>
//             <div className="flex items-center gap-2">
//               <BookOpen size={24} className="text-indigo-600" />
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
//             </div>
//           </div>
//         </header>
//         <main className="max-w-7xl mx-auto px-4 py-12">
//           <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8 shadow-sm text-center max-w-2xl mx-auto">
//             <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
//               <BookOpen size={40} className="text-indigo-600" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//               {patients.length > 0 ? `Handover ${patients.length} Patients` : 'Start Shift Handover'}
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 mb-6">
//               Create a comprehensive handover document to transfer patient care information 
//               to the next shift nurse. You have {patients.length} active patient{patients.length !== 1 ? 's' : ''}.
//             </p>
//             <button onClick={handleStartHandover}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2 mx-auto">
//               <Send size={20} /> Begin Handover
//             </button>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // Completed - Waiting Acknowledgment
//   if (handoverCompleted && !handoverAcknowledged) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
//         <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
//           <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
//             <div className="flex items-center gap-4">
//               <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
//                 <ArrowLeft size={20} />
//               </Link>
//               <div className="flex items-center gap-2">
//                 <BookOpen size={24} className="text-indigo-600" />
//                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={handleDownloadHandover} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2">
//                 <Download size={18} /> Download
//               </button>
//               <button onClick={handleCopyHandover} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition flex items-center gap-2">
//                 <Copy size={18} /> Copy
//               </button>
//             </div>
//           </div>
//         </header>
//         <main className="max-w-4xl mx-auto px-4 py-8">
//           <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 text-center">
//             <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
//             <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">Handover Completed!</h2>
//             <p className="text-green-600 dark:text-green-400 mb-2">
//               Handover to: <strong>{toNurse || 'Incoming Nurse'}</strong> ({toShift} Shift)
//             </p>
//             <button onClick={() => setShowAcknowledgeModal(true)}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition mt-4">
//               Get Acknowledgment
//             </button>
//           </div>
//           <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
//             <h3 className="text-lg font-semibold mb-4">Handover Document Preview</h3>
//             <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border font-mono text-xs whitespace-pre-wrap overflow-x-auto max-h-96">
//               {generateHandoverText()}
//             </div>
//           </div>
//         </main>
//         {/* Acknowledgment Modal */}
//         {showAcknowledgeModal && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6 shadow-2xl">
//               <div className="text-center mb-4">
//                 <Bell size={48} className="mx-auto mb-3 text-indigo-600" />
//                 <h2 className="text-xl font-bold">Acknowledge Handover</h2>
//                 <p className="text-sm text-gray-500 mt-2">By acknowledging, you confirm receipt and understanding of the handover report.</p>
//               </div>
//               <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 mb-4">
//                 <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
//                   <AlertCircle size={16} className="mt-0.5" />
//                   Please review all patient information before acknowledging.
//                 </p>
//               </div>
//               <div className="flex gap-3">
//                 <button onClick={() => setShowAcknowledgeModal(false)}
//                   className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//                 <button onClick={handleAcknowledgeHandover}
//                   className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">Acknowledge</button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // Acknowledged - Complete
//   if (handoverAcknowledged) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
//         <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
//           <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
//             <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
//               <ArrowLeft size={20} />
//             </Link>
//             <div className="flex items-center gap-2">
//               <BookOpen size={24} className="text-indigo-600" />
//               <h1 className="text-2xl font-bold">Shift Handover</h1>
//             </div>
//           </div>
//         </header>
//         <main className="max-w-2xl mx-auto px-4 py-12">
//           <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 p-8 text-center">
//             <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
//             <h2 className="text-2xl font-bold text-green-700 mb-2">Handover Complete!</h2>
//             <p className="text-green-600 mb-4">Shift handover successfully completed and acknowledged.</p>
//             <Link href="/nurse" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition inline-block">
//               Return to Dashboard
//             </Link>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // Main Handover Form
//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
//       <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
//           <div className="flex items-center gap-4">
//             <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
//               <ArrowLeft size={20} />
//             </Link>
//             <div className="flex items-center gap-2">
//               <BookOpen size={24} className="text-indigo-600" />
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
//             </div>
//           </div>
//           <button onClick={handleCompleteHandover}
//             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2">
//             <Send size={18} /> Complete Handover
//           </button>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
//         {/* Handover Info */}
//         <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
//           <h2 className="text-lg font-semibold mb-4">Handover Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">From Nurse</label>
//               <input type="text" value={currentNurse} readOnly
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm cursor-not-allowed" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">To Nurse (Receiving) *</label>
//               <input type="text" value={toNurse} onChange={(e) => setToNurse(e.target.value)}
//                 placeholder="Enter receiving nurse name"
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">From Shift</label>
//               <select value={fromShift} onChange={(e) => setFromShift(e.target.value as any)}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm">
//                 <option value="Morning">Morning (6 AM - 2 PM)</option>
//                 <option value="Evening">Evening (2 PM - 10 PM)</option>
//                 <option value="Night">Night (10 PM - 6 AM)</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">To Shift</label>
//               <select value={toShift} onChange={(e) => setToShift(e.target.value as any)}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm">
//                 <option value="Morning">Morning (6 AM - 2 PM)</option>
//                 <option value="Evening">Evening (2 PM - 10 PM)</option>
//                 <option value="Night">Night (10 PM - 6 AM)</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* General Notes */}
//         <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
//           <h2 className="text-lg font-semibold mb-4">General Handover Notes</h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Equipment Status</label>
//               <textarea value={equipmentStatus} onChange={(e) => setEquipmentStatus(e.target.value)} rows={2}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Emergency Supplies</label>
//               <textarea value={emergencySupplies} onChange={(e) => setEmergencySupplies(e.target.value)} rows={2}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">General Notes / Issues</label>
//               <textarea value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} rows={3}
//                 placeholder="Any general notes about the shift..."
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
//             </div>
//           </div>
//         </div>

//         {/* Patient Handover Details - REAL DATA */}
//         <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
//           <h2 className="text-lg font-semibold mb-4">Patient Handover Details ({handoverPatients.length} patients)</h2>
//           {handoverPatients.length === 0 ? (
//             <p className="text-gray-500 text-center py-4">No active patients</p>
//           ) : (
//             <div className="space-y-4">
//               {handoverPatients.map(patient => (
//                 <div key={patient.patientId}
//                   className={`border rounded-lg p-4 ${selectedPatient === patient.patientId ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200'}`}>
//                   <div className="flex items-center justify-between cursor-pointer"
//                     onClick={() => setSelectedPatient(selectedPatient === patient.patientId ? null : patient.patientId)}>
//                     <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 rounded-full bg-green-500" />
//                       <div>
//                         <h3 className="font-semibold">{patient.patientName}</h3>
//                         <p className="text-xs text-gray-500">Bed {patient.bed}</p>
//                       </div>
//                     </div>
//                     <ChevronRight size={18} className={`text-gray-400 transition-transform ${selectedPatient === patient.patientId ? 'rotate-90' : ''}`} />
//                   </div>
//                   {selectedPatient === patient.patientId && (
//                     <div className="mt-4 pt-4 border-t space-y-3">
//                       <div>
//                         <label className="block text-sm font-medium mb-1">Current Status</label>
//                         <p className="text-sm text-gray-600 p-2 bg-gray-50 dark:bg-slate-800 rounded">{patient.currentStatus}</p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium mb-1">Pending Tasks</label>
//                         <div className="flex flex-wrap gap-2">
//                           {patient.pendingTasks.map((task, idx) => (
//                             <span key={idx} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">{task}</span>
//                           ))}
//                         </div>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium mb-1">Medications Due</label>
//                         <div className="flex flex-wrap gap-2">
//                           {patient.medicationsDue.map((med, idx) => (
//                             <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">{med}</span>
//                           ))}
//                         </div>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium mb-1">Doctor Instructions</label>
//                         <p className="text-sm text-gray-600">{patient.doctorInstructions}</p>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium mb-1">Additional Notes</label>
//                         <textarea value={patientNotes[patient.patientId] || ''}
//                           onChange={(e) => setPatientNotes(prev => ({ ...prev, [patient.patientId]: e.target.value }))}
//                           rows={2} placeholder="Add special notes..."
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm" />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Checklist */}
//         <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
//           <h2 className="text-lg font-semibold mb-4">Handover Checklist</h2>
//           <div className="space-y-3">
//             {['Patient identification verified', 'Critical alerts reviewed', 'Emergency equipment checked', 
//               'Controlled substances verified', 'Lab pending list reviewed', 'Doctor orders reviewed', 
//               'Family communication documented'].map((item, i) => (
//               <label key={i} className="flex items-center gap-3 cursor-pointer">
//                 <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
//                 <span className="text-sm">{item}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }


'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, Send, Download, Copy, 
  CheckCircle2, AlertCircle, Clock, User, 
  ChevronRight, Bell, Loader2
} from 'lucide-react';
import { nurseApi, Patient } from '@/lib/api/nurse';
import toast from 'react-hot-toast';

interface HandoverPatient {
  patientId: string;
  patientName: string;
  bed: string;
  currentStatus: string;
  pendingTasks: string[];
  medicationsDue: string[];
  labTestsPending: string[];
  doctorInstructions: string;
  familyCommunication: string;
  specialNotes: string;
  additionalNotes?: string;
}

export default function HandoverPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [handoverStarted, setHandoverStarted] = useState(false);
  const [handoverCompleted, setHandoverCompleted] = useState(false);
  const [handoverAcknowledged, setHandoverAcknowledged] = useState(false);
  const [savedHandoverId, setSavedHandoverId] = useState<string>('');
  const [fromShift, setFromShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');
  const [toShift, setToShift] = useState<'Morning' | 'Evening' | 'Night'>('Evening');
  const [toNurse, setToNurse] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState('All equipment functioning normally.');
  const [emergencySupplies, setEmergencySupplies] = useState('Crash cart checked and stocked. Emergency medications available.');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientNotes, setPatientNotes] = useState<Record<string, string>>({});
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);

  const currentNurse = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Current Nurse' : 'Current Nurse';
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  // Fetch real patients
  const fetchPatients = useCallback(async () => {
  try {
    setLoading(true);
    const staffId = localStorage.getItem('staffId');
    
    if (!staffId) {
      console.error('No staff ID found');
      setLoading(false);
      return;
    }
    
    const result = await nurseApi.getMyWardPatients(staffId, { status: 'active' });
    
    let allPatients: Patient[] = [];
    if (result?.success && result?.data) allPatients = result.data;
    else if (Array.isArray(result)) allPatients = result;
    else if (result?.data) allPatients = result.data;
    
    setPatients(allPatients.filter(p => p.status === 'active'));
  } catch (err) {
    console.error('Failed to fetch patients:', err);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // Generate handover patients from real data
  const handoverPatients: HandoverPatient[] = patients.map(p => ({
    patientId: p.patient_id,
    patientName: p.patient_name,
    bed: p.bed_number || 'N/A',
    currentStatus: `Active - ${p.reason || 'Under observation'}. ${p.diagnosis ? 'Diagnosis: ' + p.diagnosis : ''}`,
    pendingTasks: ['Monitor vitals', 'Administer medications as ordered', 'Document in chart'],
    medicationsDue: ['Check medication chart for scheduled medications'],
    labTestsPending: ['Review pending lab orders'],
    doctorInstructions: p.diagnosis ? `Monitor for changes related to ${p.diagnosis}` : 'Continue current treatment plan',
    familyCommunication: 'Update family on condition during visiting hours',
    specialNotes: `Admitted: ${p.admission_date}. Ward: ${p.ward_name || 'N/A'}`,
    additionalNotes: '',
  }));

  const handleStartHandover = () => setHandoverStarted(true);

  // ✅ API CONNECTED: Complete Handover
  const handleCompleteHandover = async () => {
  if (!toNurse.trim()) {
    toast.error('Please enter receiving nurse name');
    return;
  }

  setSubmitting(true);

  try {
    const nurseId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';
    const nurseName = typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : '';

    const result = await nurseApi.createHandover({
      fromNurse: nurseName || currentNurse,
      toNurse: toNurse,
      fromShift: fromShift,
      toShift: toShift,
      generalNotes,
      equipmentStatus,
      emergencySupplies,
      patients: handoverPatients.map(p => ({
        ...p,
        additionalNotes: patientNotes[p.patientId] || '',
      })),
      nurseId,
      nurseName,
    });

 

    // Check for success in different possible locations
    const isSuccess = result?.success === true || 
                      result?.data?.success === true ||
                      (result?.id || result?.data?.id);

    if (isSuccess) {
      setSavedHandoverId(result?.data?.id || result?.id || '');
      setHandoverCompleted(true);
      toast.success('Handover completed successfully!');
    } else {
      toast.error(result?.message || result?.data?.message || 'Failed to complete handover');
    }
  } catch (err: any) {
    console.error('Failed to save handover:', err);
    toast.error(err.message || 'Failed to save handover');
  } finally {
    setSubmitting(false);
  }
};

  // ✅ API CONNECTED: Acknowledge Handover
  const handleAcknowledgeHandover = async () => {
    try {
      const result = await nurseApi.acknowledgeHandover(savedHandoverId, toNurse);
      
      if (result?.success) {
        setHandoverAcknowledged(true);
        setShowAcknowledgeModal(false);
        toast.success('Handover acknowledged successfully!');
      } else {
        toast.error(result?.message || 'Failed to acknowledge');
      }
    } catch (err: any) {
      console.error('Failed to acknowledge:', err);
      toast.error(err.message || 'Failed to acknowledge');
    }
  };

  const handleDownloadHandover = () => {
    const handoverText = generateHandoverText();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(handoverText));
    element.setAttribute('download', `Handover_${currentDate.replace(/\//g, '-')}.txt`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Report downloaded!');
  };

  const handleCopyHandover = () => {
    navigator.clipboard.writeText(generateHandoverText());
    toast.success('Report copied to clipboard!');
  };

  const generateHandoverText = () => {
    let text = `
═══════════════════════════════════════════════════════════════
                    NURSING SHIFT HANDOVER REPORT
═══════════════════════════════════════════════════════════════
Date: ${currentDate}
Time: ${currentTime}
From Nurse: ${currentNurse} (${fromShift} Shift)
To Nurse: ${toNurse || '_______________'} (${toShift} Shift)

───────────────────────────────────────────────────────────────
GENERAL INFORMATION
───────────────────────────────────────────────────────────────
Total Patients: ${patients.length}

Equipment Status: ${equipmentStatus}
Emergency Supplies: ${emergencySupplies}
General Notes: ${generalNotes || 'No additional notes'}

───────────────────────────────────────────────────────────────
PATIENT HANDOVER DETAILS
───────────────────────────────────────────────────────────────
`;

    handoverPatients.forEach(patient => {
      text += `
PATIENT: ${patient.patientName} | Bed: ${patient.bed}
───────────────────────────────────────────────────────────────
Current Status: ${patient.currentStatus}
Pending Tasks: ${patient.pendingTasks.join(', ')}
Medications Due: ${patient.medicationsDue.join(', ')}
${patient.labTestsPending.length > 0 ? `Lab Tests Pending: ${patient.labTestsPending.join(', ')}` : ''}
Doctor Instructions: ${patient.doctorInstructions}
Family Communication: ${patient.familyCommunication}
${patientNotes[patient.patientId] ? `Additional Notes: ${patientNotes[patient.patientId]}` : ''}

`;
    });

    text += `
───────────────────────────────────────────────────────────────
HANDOVER CHECKLIST
───────────────────────────────────────────────────────────────
☐ Patient identification verified for all patients
☐ All critical alerts reviewed
☐ Emergency equipment checked
☐ Controlled substances counted and verified
☐ Lab pending list reviewed
☐ Doctor orders reviewed
☐ Family communication documented

═══════════════════════════════════════════════════════════════
ACKNOWLEDGMENT
═══════════════════════════════════════════════════════════════
I acknowledge that I have received and understood the handover 
report for all patients. I have had the opportunity to ask 
questions and clarify any concerns.

Receiving Nurse Signature: _________________
Date/Time: _________________
═══════════════════════════════════════════════════════════════
`;
    return text;
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-gray-500">Loading patients...</p>
        </div>
      </div>
    );
  }

  // Start Screen
  if (!handoverStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8 shadow-sm text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={40} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {patients.length > 0 ? `Handover ${patients.length} Patients` : 'Start Shift Handover'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a comprehensive handover document to transfer patient care information 
              to the next shift nurse. You have {patients.length} active patient{patients.length !== 1 ? 's' : ''}.
            </p>
            <button onClick={handleStartHandover}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2 mx-auto">
              <Send size={20} /> Begin Handover
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Completed - Waiting Acknowledgment
  if (handoverCompleted && !handoverAcknowledged) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <BookOpen size={24} className="text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDownloadHandover} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2">
                <Download size={18} /> Download
              </button>
              <button onClick={handleCopyHandover} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition flex items-center gap-2">
                <Copy size={18} /> Copy
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 text-center">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">Handover Completed!</h2>
            <p className="text-green-600 dark:text-green-400 mb-2">
              Handover to: <strong>{toNurse || 'Incoming Nurse'}</strong> ({toShift} Shift)
            </p>
            <button onClick={() => setShowAcknowledgeModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition mt-4">
              Get Acknowledgment
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Handover Document Preview</h3>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border font-mono text-xs whitespace-pre-wrap overflow-x-auto max-h-96">
              {generateHandoverText()}
            </div>
          </div>
        </main>
        {/* Acknowledgment Modal */}
        {showAcknowledgeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6 shadow-2xl">
              <div className="text-center mb-4">
                <Bell size={48} className="mx-auto mb-3 text-indigo-600" />
                <h2 className="text-xl font-bold">Acknowledge Handover</h2>
                <p className="text-sm text-gray-500 mt-2">By acknowledging, you confirm receipt and understanding of the handover report.</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5" />
                  Please review all patient information before acknowledging.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAcknowledgeModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleAcknowledgeHandover}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">Acknowledge</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Acknowledged - Complete
  if (handoverAcknowledged) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              <h1 className="text-2xl font-bold">Shift Handover</h1>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 p-8 text-center">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Handover Complete!</h2>
            <p className="text-green-600 mb-4">Shift handover successfully completed and acknowledged.</p>
            <Link href="/nurse" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition inline-block">
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Main Handover Form
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
            </div>
          </div>
          <button onClick={handleCompleteHandover} disabled={submitting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {submitting ? 'Saving...' : 'Complete Handover'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Handover Info */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Handover Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From Nurse</label>
              <input type="text" value={currentNurse} readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To Nurse (Receiving) *</label>
              <input type="text" value={toNurse} onChange={(e) => setToNurse(e.target.value)}
                placeholder="Enter receiving nurse name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">From Shift</label>
              <select value={fromShift} onChange={(e) => setFromShift(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm">
                <option value="Morning">Morning (6 AM - 2 PM)</option>
                <option value="Evening">Evening (2 PM - 10 PM)</option>
                <option value="Night">Night (10 PM - 6 AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To Shift</label>
              <select value={toShift} onChange={(e) => setToShift(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm">
                <option value="Morning">Morning (6 AM - 2 PM)</option>
                <option value="Evening">Evening (2 PM - 10 PM)</option>
                <option value="Night">Night (10 PM - 6 AM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* General Notes */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">General Handover Notes</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Equipment Status</label>
              <textarea value={equipmentStatus} onChange={(e) => setEquipmentStatus(e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Emergency Supplies</label>
              <textarea value={emergencySupplies} onChange={(e) => setEmergencySupplies(e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">General Notes / Issues</label>
              <textarea value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} rows={3}
                placeholder="Any general notes about the shift..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
            </div>
          </div>
        </div>

        {/* Patient Handover Details */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Patient Handover Details ({handoverPatients.length} patients)</h2>
          {handoverPatients.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active patients</p>
          ) : (
            <div className="space-y-4">
              {handoverPatients.map(patient => (
                <div key={patient.patientId}
                  className={`border rounded-lg p-4 ${selectedPatient === patient.patientId ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between cursor-pointer"
                    onClick={() => setSelectedPatient(selectedPatient === patient.patientId ? null : patient.patientId)}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <h3 className="font-semibold">{patient.patientName}</h3>
                        <p className="text-xs text-gray-500">Bed {patient.bed}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className={`text-gray-400 transition-transform ${selectedPatient === patient.patientId ? 'rotate-90' : ''}`} />
                  </div>
                  {selectedPatient === patient.patientId && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Status</label>
                        <p className="text-sm text-gray-600 p-2 bg-gray-50 dark:bg-slate-800 rounded">{patient.currentStatus}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Pending Tasks</label>
                        <div className="flex flex-wrap gap-2">
                          {patient.pendingTasks.map((task, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">{task}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Medications Due</label>
                        <div className="flex flex-wrap gap-2">
                          {patient.medicationsDue.map((med, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">{med}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Doctor Instructions</label>
                        <p className="text-sm text-gray-600">{patient.doctorInstructions}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Additional Notes</label>
                        <textarea value={patientNotes[patient.patientId] || ''}
                          onChange={(e) => setPatientNotes(prev => ({ ...prev, [patient.patientId]: e.target.value }))}
                          rows={2} placeholder="Add special notes..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checklist */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Handover Checklist</h2>
          <div className="space-y-3">
            {['Patient identification verified', 'Critical alerts reviewed', 'Emergency equipment checked', 
              'Controlled substances verified', 'Lab pending list reviewed', 'Doctor orders reviewed', 
              'Family communication documented'].map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}