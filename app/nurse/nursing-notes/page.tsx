// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link';
// import { ArrowLeft, FileText, Plus, Search, Eye, Trash2, Clock, User, Send, X, Loader2 } from 'lucide-react';
// import { CreateNoteModal, HandoffReportModal } from '@/components/nurse/nursing-notes';
// import { nurseApi, Patient } from '@/lib/api/nurse';
// import toast from 'react-hot-toast';

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
//   updatedAt?: string;
//   tags: string[];
//   assessmentFindings?: string;
//   interventions?: string;
//   patientResponse?: string;
//   followUpRequired?: boolean;
// }

// export default function NursingNotesPage() {
//   const [notes, setNotes] = useState<NursingNote[]>([]);
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [selectedPatient, setSelectedPatient] = useState<string>('');
//   const [loading, setLoading] = useState(true);
//   const [showNewNoteForm, setShowNewNoteForm] = useState(false);
//   const [selectedNote, setSelectedNote] = useState<NursingNote | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState<'all' | NursingNote['noteType']>('all');
//   const [filterPriority, setFilterPriority] = useState<'all' | NursingNote['priority']>('all');
//   const [showHandoffModal, setShowHandoffModal] = useState(false);

//   // Fetch patients
// const fetchPatients = useCallback(async () => {
//   try {
//     const staffId = localStorage.getItem('staffId');
    
//     if (!staffId) {
//       console.error('No staff ID found');
//       return;
//     }
    
//     const result = await nurseApi.getMyWardPatients(staffId, { status: 'active' });
    
//     let allPatients: Patient[] = [];
//     if (result?.success && result?.data) allPatients = result.data;
//     else if (Array.isArray(result)) allPatients = result;
//     else if (result?.data) allPatients = result.data;
    
//     const activePatients = allPatients.filter(p => p.status === 'active');
//     setPatients(activePatients);
    
//     if (activePatients.length > 0 && !selectedPatient) {
//       setSelectedPatient(activePatients[0].patient_id);
//     }
//   } catch (err) {
//     console.error('Failed to fetch patients:', err);
//   }
// }, [selectedPatient]);

//   // Fetch notes for selected patient
//   const fetchNotes = useCallback(async () => {
//     if (!selectedPatient) return;
//     try {
//       setLoading(true);
//       const result = await nurseApi.getNotes(selectedPatient);
      
//       let notesData: any[] = [];
//       if (result?.success && result?.data) notesData = result.data;
//       else if (Array.isArray(result)) notesData = result;
//       else if (result?.data && Array.isArray(result.data)) notesData = result.data;
      
//       setNotes(notesData);
//     } catch (err) {
//       console.error('Failed to fetch notes:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedPatient]);

//   useEffect(() => { fetchPatients(); }, [fetchPatients]);
//   useEffect(() => { if (selectedPatient) fetchNotes(); }, [selectedPatient, fetchNotes]);

//   const selectedPatientObj = patients.find(p => p.patient_id === selectedPatient);

//   const filteredNotes = notes.filter(note => {
//     const matchesSearch = note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          note.content?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesType = filterType === 'all' || note.noteType === filterType;
//     const matchesPriority = filterPriority === 'all' || note.priority === filterPriority;
//     return matchesSearch && matchesType && matchesPriority;
//   });

//   const handleSaveNote = async (newNoteData: Partial<NursingNote>) => {
//     const nurseId = localStorage.getItem('userId') || '';
//     const nurseName = localStorage.getItem('userName') || '';
    
//     try {
//       const result = await nurseApi.createNote({
//         patientId: selectedPatient,
//         patientName: selectedPatientObj?.patient_name || '',
//         bed: selectedPatientObj?.bed_number || '',
//         noteType: newNoteData.noteType || 'progress',
//         title: newNoteData.title || '',
//         content: newNoteData.content || '',
//         priority: newNoteData.priority || 'routine',
//         tags: newNoteData.tags || [],
//         assessmentFindings: newNoteData.assessmentFindings,
//         interventions: newNoteData.interventions,
//         patientResponse: newNoteData.patientResponse,
//         followUpRequired: newNoteData.followUpRequired,
//         nurseId,
//         nurseName,
//       });
      
//       if (result?.success) {
//         toast.success('Note created successfully!');
//         fetchNotes();
//       } else {
//         toast.error(result?.message || 'Failed to create note');
//       }
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to create note');
//     }
//   };

//   const handleDeleteNote = async (noteId: string) => {
//     if (!window.confirm('Are you sure you want to delete this note?')) return;
    
//     try {
//       const result = await nurseApi.deleteNote(noteId);
//       if (result?.success) {
//         toast.success('Note deleted!');
//         fetchNotes();
//         setSelectedNote(null);
//       } else {
//         toast.error(result?.message || 'Failed to delete note');
//       }
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to delete note');
//     }
//   };

//   const getPriorityColor = (priority: NursingNote['priority']) => {
//     switch (priority) {
//       case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
//       case 'urgent': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
//       case 'routine': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
//       default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
//     }
//   };

//   const getNoteTypeColor = (noteType: NursingNote['noteType']) => {
//     switch (noteType) {
//       case 'admission': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
//       case 'progress': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
//       case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
//       case 'discharge': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
//       case 'post-op': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
//       case 'intervention': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
//       default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
//     }
//   };

//   const getRecentNote = () => {
//     return notes
//       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
//   };

//   if (loading && patients.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
//           <p className="mt-2 text-gray-500">Loading patients...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
//       <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
//           <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
//             <ArrowLeft size={20} />
//           </Link>
//           <div className="flex items-center gap-2">
//             <FileText size={24} className="text-blue-600" />
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nursing Notes & Documentation</h1>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
//         {/* Patient Selection */}
//         <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
//           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Patient</h2>
//           {patients.length === 0 ? (
//             <p className="text-gray-500 dark:text-gray-400 text-center py-4">No active patients found</p>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
//               {patients.map(p => (
//                 <button
//                   key={p.patient_id}
//                   onClick={() => setSelectedPatient(p.patient_id)}
//                   className={`p-4 rounded-lg border-2 transition-all ${
//                     selectedPatient === p.patient_id
//                       ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
//                       : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-blue-300'
//                   }`}
//                 >
//                   <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.patient_name}</p>
//                   <p className="text-xs text-gray-600 dark:text-gray-400">{p.bed_number} • {p.ward_name}</p>
//                   <div className="mt-2 inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
//                     Active
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-3 flex-col md:flex-row">
//           <button
//             onClick={() => setShowNewNoteForm(true)}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2"
//           >
//             <Plus size={20} /> Create New Note
//           </button>
//           <button
//             onClick={() => setShowHandoffModal(true)}
//             className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2"
//           >
//             <Send size={20} /> Generate I-SBAR Handoff
//           </button>
//         </div>

//         {/* Create Note Modal */}
//         <CreateNoteModal
//           isOpen={showNewNoteForm}
//           onClose={() => setShowNewNoteForm(false)}
//           onSave={handleSaveNote}
//           patientName={selectedPatientObj?.patient_name || ''}
//           patientBed={selectedPatientObj?.bed_number || ''}
//           patientId={selectedPatient}
//         />

//         {/* Search and Filter */}
//         <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
//           <div className="flex gap-4 flex-col md:flex-row">
//             <div className="flex-1 relative">
//               <Search size={18} className="absolute left-3 top-3 text-gray-400" />
//               <input type="text" placeholder="Search notes..." value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white" />
//             </div>
//             <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}
//               className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white">
//               <option value="all">All Types</option>
//               <option value="admission">Admission</option>
//               <option value="progress">Progress</option>
//               <option value="critical">Critical</option>
//               <option value="discharge">Discharge</option>
//               <option value="post-op">Post-Op</option>
//               <option value="intervention">Intervention</option>
//             </select>
//             <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as any)}
//               className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white">
//               <option value="all">All Priorities</option>
//               <option value="routine">Routine</option>
//               <option value="urgent">Urgent</option>
//               <option value="critical">Critical</option>
//             </select>
//           </div>
//         </div>

//         {/* Notes Display */}
//         <div className="space-y-4">
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//             Notes for {selectedPatientObj?.patient_name || 'Patient'} - {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
//           </h2>
          
//           {loading ? (
//             <div className="text-center py-12">
//               <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
//             </div>
//           ) : filteredNotes.length === 0 ? (
//             <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-12 text-center">
//               <FileText size={48} className="mx-auto mb-4 text-gray-300" />
//               <p className="text-gray-600 dark:text-gray-400">No notes found</p>
//             </div>
//           ) : (
//             filteredNotes.map(note => (
//               <div key={note.id}
//                 className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
//                 onClick={() => setSelectedNote(note)}>
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3 mb-2">
//                       <h3 className="text-lg font-bold text-gray-900 dark:text-white">{note.title}</h3>
//                       <span className={`px-2 py-1 rounded text-xs font-semibold ${getNoteTypeColor(note.noteType)}`}>{note.noteType}</span>
//                       <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(note.priority)}`}>{note.priority}</span>
//                       {note.followUpRequired && (
//                         <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-700">Follow-up</span>
//                       )}
//                     </div>
//                     <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
//                       <User size={14} /> {note.createdBy}
//                       <span className="mx-2">•</span>
//                       <Clock size={14} /> {note.createdAt}
//                     </p>
//                   </div>
//                   <div className="flex gap-2">
//                     <button onClick={(e) => { e.stopPropagation(); setSelectedNote(note); }}
//                       className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><Eye size={18} className="text-blue-600" /></button>
//                     <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
//                       className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"><Trash2 size={18} className="text-red-600" /></button>
//                   </div>
//                 </div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{note.content}</p>
//                 {note.tags?.length > 0 && (
//                   <div className="flex flex-wrap gap-2">
//                     {note.tags.map(tag => (
//                       <span key={tag} className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">#{tag}</span>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>

//         {/* Note Detail View */}
//         {selectedNote && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-white dark:bg-slate-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
//               <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedNote.title}</h2>
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedNote.patientName} • Bed {selectedNote.bed}</p>
//                 </div>
//                 <button onClick={() => setSelectedNote(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
//                   <X size={24} />
//                 </button>
//               </div>
//               <div className="p-6 space-y-6">
//                 <div className="flex flex-wrap gap-2">
//                   <span className={`px-3 py-1 rounded text-sm font-semibold ${getNoteTypeColor(selectedNote.noteType)}`}>{selectedNote.noteType}</span>
//                   <span className={`px-3 py-1 rounded text-sm font-semibold ${getPriorityColor(selectedNote.priority)}`}>{selectedNote.priority}</span>
//                   {selectedNote.followUpRequired && <span className="px-3 py-1 rounded text-sm font-semibold bg-orange-100 text-orange-700">Follow-up Required</span>}
//                 </div>
//                 <div><h3 className="font-semibold mb-2">Created By</h3><p className="text-sm text-gray-600 dark:text-gray-400">{selectedNote.createdBy} • {selectedNote.createdAt}</p></div>
//                 <div><h3 className="font-semibold mb-2">Note Content</h3><div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border whitespace-pre-wrap text-sm">{selectedNote.content}</div></div>
//                 {selectedNote.assessmentFindings && <div><h3 className="font-semibold mb-2">Assessment Findings</h3><p className="text-sm text-gray-600 dark:text-gray-400">{selectedNote.assessmentFindings}</p></div>}
//                 {selectedNote.interventions && <div><h3 className="font-semibold mb-2">Interventions</h3><p className="text-sm text-gray-600 dark:text-gray-400">{selectedNote.interventions}</p></div>}
//                 {selectedNote.patientResponse && <div><h3 className="font-semibold mb-2">Patient Response</h3><p className="text-sm text-gray-600 dark:text-gray-400">{selectedNote.patientResponse}</p></div>}
//                 {selectedNote.tags?.length > 0 && (
//                   <div><h3 className="font-semibold mb-2">Tags</h3><div className="flex flex-wrap gap-2">{selectedNote.tags.map(tag => <span key={tag} className="px-3 py-1 rounded text-xs bg-gray-100 dark:bg-slate-800">#{tag}</span>)}</div></div>
//                 )}
//                 <button onClick={() => setSelectedNote(null)} className="w-full bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition">Close</button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Handoff Report Modal */}
//         <HandoffReportModal
//           isOpen={showHandoffModal}
//           onClose={() => setShowHandoffModal(false)}
//           patient={selectedPatientObj ? { id: selectedPatientObj.patient_id, name: selectedPatientObj.patient_name, bed: selectedPatientObj.bed_number || '', status: 'stable' as const } : null}
//           recentNote={getRecentNote()}
//         />
//       </main>
//     </div>
//   );
// }


'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, RefreshCw, User, Search, ChevronRight } from 'lucide-react';

export default function NursingNotesPatientListPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [wardInfo, setWardInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const staffId = localStorage.getItem('staffId');
      if (!staffId) return;
      
      const response = await fetch(`/api/nurse/ward-patients?nurseId=${staffId}&status=active`);
      const result = await response.json();
      
      if (result?.success) {
        setPatients(result.data || []);
        setWardInfo(result.ward || null);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const filteredPatients = patients.filter(p =>
    p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bed_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {wardInfo ? `${wardInfo.name} - Nursing Notes` : 'Nursing Notes'}
              </h1>
            </div>
            {wardInfo && <p className="text-sm text-gray-500 mt-1">{wardInfo.type} Ward • {patients.length} patients</p>}
          </div>
          <button onClick={fetchPatients} className="p-2 hover:bg-gray-100 rounded-lg">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, ID or bed..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-850 border-b-2 border-slate-300 dark:border-slate-600">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r">Bed</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r">Admitted</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, index) => (
                  <tr key={p.patient_id} className={`hover:bg-blue-50 dark:hover:bg-slate-700/50 border-b ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'}`}>
                    <td className="px-4 py-3 border-r">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><User size={14} className="text-blue-600" /></div>
                        <div><p className="font-medium text-sm">{p.patient_name}</p><p className="text-xs text-gray-500">{p.patient_id}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r text-sm font-mono">{p.bed_number || 'N/A'}</td>
                    <td className="px-4 py-3 border-r text-xs text-gray-500">{p.patient_phone}</td>
                    <td className="px-4 py-3 border-r text-xs text-gray-500">{new Date(p.admission_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-4 py-3 border-r text-xs capitalize">{p.reason || 'N/A'}</td>
                    <td className="px-4 py-3 border-r"><span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">Active</span></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => router.push(`/nurse/nursing-notes/${p.patient_id}?name=${encodeURIComponent(p.patient_name)}`)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition flex items-center gap-1 ml-auto">
                        Notes <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPatients.length === 0 && (
            <div className="text-center py-16 text-gray-500"><User size={48} className="mx-auto mb-3 text-gray-300" /><p>No patients found</p></div>
          )}
        </div>
      </main>
    </div>
  );
}