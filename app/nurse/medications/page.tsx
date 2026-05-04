


'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Pill, Loader2, RefreshCw, User, Search, ChevronRight } from 'lucide-react';

export default function MedicationsPatientListPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wardInfo, setWardInfo] = useState<any>(null);

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
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Pill size={24} className="text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {wardInfo ? `${wardInfo.name} - Medications` : 'Medication Administration'}
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
                  <tr key={p.patient_id} className={`hover:bg-purple-50 dark:hover:bg-slate-700/50 border-b ${
                    index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'
                  }`}>
                    <td className="px-4 py-3 border-r">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <User size={14} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{p.patient_name}</p>
                          <p className="text-xs text-gray-500">{p.patient_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r text-sm font-mono">{p.bed_number || 'N/A'}</td>
                    <td className="px-4 py-3 border-r text-xs text-gray-500">{p.patient_phone}</td>
                    <td className="px-4 py-3 border-r text-xs text-gray-500">
                      {new Date(p.admission_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 border-r text-xs capitalize">{p.reason || 'N/A'}</td>
                    <td className="px-4 py-3 border-r">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">Active</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => router.push(`/nurse/medications/${p.patient_id}?name=${encodeURIComponent(p.patient_name)}`)}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition flex items-center gap-1 ml-auto"
                      >
                        MAR <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPatients.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <User size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No patients found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}