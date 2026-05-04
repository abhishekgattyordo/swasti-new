'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { FileText, Plus, Search, Eye, Trash2, Clock, User, Send, X, Loader2 } from 'lucide-react';
import { CreateNoteModal, HandoffReportModal } from '@/components/nurse/nursing-notes';
import { nurseApi, Patient } from '@/lib/api/nurse';
import toast from 'react-hot-toast';

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
  updatedAt?: string;
  tags: string[];
  assessmentFindings?: string;
  interventions?: string;
  patientResponse?: string;
  followUpRequired?: boolean;
}

export default function PatientNursingNotesPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const patientId = params?.patientId as string;
  const patientName = searchParams.get('name') || 'Patient';

  const [notes, setNotes] = useState<NursingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NursingNote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | NursingNote['noteType']>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | NursingNote['priority']>('all');
  const [showHandoffModal, setShowHandoffModal] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const result = await nurseApi.getNotes(patientId);
      
      let notesData: any[] = [];
      if (result?.success && result?.data) notesData = result.data;
      else if (Array.isArray(result)) notesData = result;
      else if (result?.data && Array.isArray(result.data)) notesData = result.data;
      
      setNotes(notesData);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || note.noteType === filterType;
    const matchesPriority = filterPriority === 'all' || note.priority === filterPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

  const handleSaveNote = async (newNoteData: Partial<NursingNote>) => {
  const nurseId = localStorage.getItem('userId') || '';
  const nurseName = localStorage.getItem('userName') || '';
  
  try {
    const result = await nurseApi.createNote({
      patientId,
      patientName: patientName,
      bed: '',
      noteType: newNoteData.noteType || 'progress',
      title: newNoteData.title || '',
      content: newNoteData.content || '',
      priority: newNoteData.priority || 'routine',
      tags: newNoteData.tags || [],
      assessmentFindings: newNoteData.assessmentFindings,
      interventions: newNoteData.interventions,
      patientResponse: newNoteData.patientResponse,
      followUpRequired: newNoteData.followUpRequired,
      nurseId,
      nurseName,
    });
    
   // 🔍 Debug log
    
    // Check different possible response structures
    const isSuccess = result?.success || result?.data?.success || result?.id;
    
    if (isSuccess) {
      toast.success('Note created successfully!');
      await fetchNotes();
      return { success: true, data: result?.data || result };
    } else {
      const errorMsg = result?.message || result?.data?.message || 'Failed to create note';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  } catch (err: any) {
    console.error('Create note error:', err);
    toast.error(err.message || 'Failed to create note');
    return { success: false, message: err.message || 'Failed to create note' };
  }
};

  const handleDeleteNote = async (noteId: string) => {
  if (!window.confirm('Are you sure you want to delete this note?')) return;
  
  try {
    const result = await nurseApi.deleteNote(noteId);
   
    
    // Check different possible response structures
    const isSuccess = result?.success || result?.message === 'success' || result?.id === undefined;
    
    if (isSuccess) {
      toast.success('Note deleted!');
      await fetchNotes();
      setSelectedNote(null);
    } else {
      toast.error(result?.message || 'Failed to delete note');
    }
  } catch (err: any) {
    console.error('Delete error:', err);
    toast.error(err.message || 'Failed to delete note');
  }
};

  const getPriorityColor = (priority: NursingNote['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'routine': return 'bg-green-100 text-green-700 border border-green-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getNoteTypeColor = (noteType: NursingNote['noteType']) => {
    switch (noteType) {
      case 'admission': return 'bg-blue-100 text-blue-700';
      case 'progress': return 'bg-cyan-100 text-cyan-700';
      case 'critical': return 'bg-red-100 text-red-700';
      case 'discharge': return 'bg-purple-100 text-purple-700';
      case 'post-op': return 'bg-pink-100 text-pink-700';
      case 'intervention': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRecentNote = () => {
    return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-500">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/nurse/nursing-notes')} className="p-2 hover:bg-gray-100 rounded-lg">
            <FileText size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              <h1 className="text-xl font-bold">{patientName}</h1>
            </div>
            <p className="text-sm text-gray-500">{notes.length} notes</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex gap-3 flex-col md:flex-row">
          <button onClick={() => setShowNewNoteForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2">
            <Plus size={20} /> Create New Note
          </button>
          <button onClick={() => setShowHandoffModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2">
            <Send size={20} /> Generate I-SBAR Handoff
          </button>
        </div>

        <CreateNoteModal
          isOpen={showNewNoteForm}
          onClose={() => setShowNewNoteForm(false)}
          onSave={handleSaveNote}
          patientName={patientName}
          patientBed=""
          patientId={patientId}
        />

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="Search notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-sm" />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-sm">
              <option value="all">All Types</option>
              <option value="admission">Admission</option><option value="progress">Progress</option>
              <option value="critical">Critical</option><option value="discharge">Discharge</option>
              <option value="post-op">Post-Op</option><option value="intervention">Intervention</option>
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as any)} className="px-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-sm">
              <option value="all">All Priorities</option>
              <option value="routine">Routine</option><option value="urgent">Urgent</option><option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Notes - {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}</h2>
          
          {filteredNotes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border p-12 text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No notes found</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div key={note.id} className="bg-white dark:bg-slate-900 rounded-lg border p-6 shadow-sm cursor-pointer" onClick={() => setSelectedNote(note)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{note.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getNoteTypeColor(note.noteType)}`}>{note.noteType}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(note.priority)}`}>{note.priority}</span>
                      {note.followUpRequired && <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-700">Follow-up</span>}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2"><User size={14} /> {note.createdBy} <span className="mx-2">•</span> <Clock size={14} /> {note.createdAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedNote(note); }} className="p-2 hover:bg-gray-100 rounded-lg"><Eye size={18} className="text-blue-600" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="p-2 hover:bg-gray-100 rounded-lg"><Trash2 size={18} className="text-red-600" /></button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{note.content}</p>
                {note.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">{note.tags.map(tag => <span key={tag} className="px-2 py-1 rounded text-xs bg-gray-100">#{tag}</span>)}</div>
                )}
              </div>
            ))
          )}
        </div>

        {selectedNote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border">
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b p-6 flex items-center justify-between">
                <div><h2 className="text-2xl font-bold">{selectedNote.title}</h2><p className="text-sm text-gray-500 mt-1">{selectedNote.patientName} • Bed {selectedNote.bed}</p></div>
                <button onClick={() => setSelectedNote(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${getNoteTypeColor(selectedNote.noteType)}`}>{selectedNote.noteType}</span>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${getPriorityColor(selectedNote.priority)}`}>{selectedNote.priority}</span>
                  {selectedNote.followUpRequired && <span className="px-3 py-1 rounded text-sm font-semibold bg-orange-100 text-orange-700">Follow-up Required</span>}
                </div>
                <div><h3 className="font-semibold mb-2">Created By</h3><p className="text-sm text-gray-500">{selectedNote.createdBy} • {selectedNote.createdAt}</p></div>
                <div><h3 className="font-semibold mb-2">Note Content</h3><div className="bg-gray-50 p-4 rounded-lg border whitespace-pre-wrap text-sm">{selectedNote.content}</div></div>
                {selectedNote.assessmentFindings && <div><h3 className="font-semibold mb-2">Assessment Findings</h3><p className="text-sm text-gray-500">{selectedNote.assessmentFindings}</p></div>}
                {selectedNote.interventions && <div><h3 className="font-semibold mb-2">Interventions</h3><p className="text-sm text-gray-500">{selectedNote.interventions}</p></div>}
                {selectedNote.patientResponse && <div><h3 className="font-semibold mb-2">Patient Response</h3><p className="text-sm text-gray-500">{selectedNote.patientResponse}</p></div>}
                {selectedNote.tags?.length > 0 && <div><h3 className="font-semibold mb-2">Tags</h3><div className="flex flex-wrap gap-2">{selectedNote.tags.map(tag => <span key={tag} className="px-3 py-1 rounded text-xs bg-gray-100">#{tag}</span>)}</div></div>}
                <button onClick={() => setSelectedNote(null)} className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        )}

        <HandoffReportModal
          isOpen={showHandoffModal}
          onClose={() => setShowHandoffModal(false)}
          patient={{ id: patientId, name: patientName, bed: '', status: 'stable' as const }}
          recentNote={getRecentNote()}
        />
      </main>
    </div>
  );
}