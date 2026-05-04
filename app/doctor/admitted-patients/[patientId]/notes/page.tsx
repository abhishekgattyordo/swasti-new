'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, User, Clock, Loader2, RefreshCw } from 'lucide-react';
import { nurseApi } from '@/lib/api/nurse';

const getTypeColor = (type: string) => {
  switch (type) {
    case 'admission': return 'bg-blue-100 text-blue-700';
    case 'progress': return 'bg-green-100 text-green-700';
    case 'critical': return 'bg-red-100 text-red-700';
    case 'discharge': return 'bg-purple-100 text-purple-700';
    case 'post-op': return 'bg-pink-100 text-pink-700';
    case 'intervention': return 'bg-amber-100 text-amber-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function ClinicalNotesPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId as string;

  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await nurseApi.getNotes(patientId);
      
      console.log('Notes result:', result);
      
      if (result?.success && result?.data) {
        setNotes(result.data);
      } else if (Array.isArray(result)) {
        setNotes(result);
      } else if (result?.data && Array.isArray(result.data)) {
        setNotes(result.data);
      } else {
        setNotes([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch notes:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchNotes();
  }, [patientId]);

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
      <header className="border-b border-slate-200 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-blue-500" />
                <h1 className="text-xl font-bold">Clinical Notes</h1>
              </div>
              <p className="text-sm text-gray-500">{notes.length} notes</p>
            </div>
          </div>
          <button onClick={fetchNotes} className="p-2 hover:bg-gray-100 rounded-lg">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">{error}</div>
        )}

        {notes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No clinical notes found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{note.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(note.noteType)}`}>
                        {note.noteType}
                      </span>
                      {note.priority && note.priority !== 'routine' && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          note.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {note.priority}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User size={12} /> {note.createdBy}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {note.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {note.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {note.followUpRequired && (
                  <div className="mt-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                      Follow-up Required
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}