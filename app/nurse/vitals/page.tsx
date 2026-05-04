'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Loader2, RefreshCw, User, Search, Filter } from 'lucide-react';

export default function VitalsPatientListPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [wardInfo, setWardInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const staffId = localStorage.getItem('staffId');
      if (!staffId) { setError('Staff ID not found'); setLoading(false); return; }
      
      const response = await fetch(`/api/nurse/ward-patients?nurseId=${staffId}&status=active`);
      const result = await response.json();
      
      if (result?.success) {
        setPatients(result.data || []);
        setWardInfo(result.ward || null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const columnFilters = {
    patient: [...new Set(patients.map(p => p.patient_name))],
    bed: [...new Set(patients.map(p => p.bed_number))],
    reason: [...new Set(patients.map(p => p.reason || p.diagnosis))].filter(Boolean),
  };

  const handleFilterSelect = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
    setOpenFilter(null);
    if (column === 'patient') setSearchQuery(value);
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      !searchQuery ||
      p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bed_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'patient') return p.patient_name === value;
      if (key === 'bed') return p.bed_number === value;
      if (key === 'reason') return (p.reason || p.diagnosis) === value;
      return true;
    });

    return matchesSearch && matchesFilters;
  });

  const FilterPopover = ({ column, options }: { column: string; options: string[] }) => {
    const isOpen = openFilter === column;
    
    return (
      <div className="relative inline-block">
        <button
          onClick={(e) => { e.stopPropagation(); setOpenFilter(isOpen ? null : column); }}
          className="ml-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Filter size={10} className={filters[column] ? 'text-blue-500' : 'text-gray-400'} />
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenFilter(null)} />
            <div className="absolute left-0 top-6 mt-1 z-50 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-2">
              <button
                onClick={() => handleFilterSelect(column, '')}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500"
              >
                Clear filter
              </button>
              <div className="max-h-48 overflow-y-auto">
                {options.filter(Boolean).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleFilterSelect(column, opt)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors ${
                      filters[column] === opt ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

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
              <Activity size={24} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {wardInfo ? `${wardInfo.name} - Vitals` : 'Vitals Entry'}
              </h1>
            </div>
            {wardInfo && (
              <p className="text-sm text-gray-500 mt-1">
                {wardInfo.type} Ward • {patients.length} patient{patients.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button onClick={fetchPatients} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">{error}</div>
        )}

        {/* Search */}
        <div className="mb-6 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID or bed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
          />
          {Object.keys(filters).some(k => filters[k]) && (
            <button
              onClick={() => { setFilters({}); setSearchQuery(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm">
            <p className="text-2xl font-bold">{patients.length}</p>
            <p className="text-xs text-gray-500">Total Patients</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">{patients.length}</p>
            <p className="text-xs text-gray-500">Stable</p>
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-850 border-b-2 border-slate-300 dark:border-slate-600">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      Patient
                      <FilterPopover column="patient" options={columnFilters.patient} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      Bed
                      <FilterPopover column="bed" options={columnFilters.bed} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Admitted</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      Reason
                      <FilterPopover column="reason" options={columnFilters.reason} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, index) => (
                  <tr
                    key={p.patient_id}
                    className={`hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-200 border-b border-slate-200 dark:border-slate-700 ${
                      index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-700">
                          <User size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{p.patient_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.patient_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-300 border-r border-slate-200 dark:border-slate-700">{p.bed_number || 'N/A'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-r border-slate-200 dark:border-slate-700">{p.patient_phone}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-r border-slate-200 dark:border-slate-700">
                      {new Date(p.admission_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-gray-600 dark:text-gray-400 border-r border-slate-200 dark:border-slate-700">{p.reason || p.diagnosis || 'N/A'}</td>
                    <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium border border-green-200 dark:border-green-700">Active</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => router.push(`/nurse/vitals/${p.patient_id}?name=${encodeURIComponent(p.patient_name)}`)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                      >
                        Record Vitals
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPatients.length === 0 && (
            <div className="text-center py-16 border-t border-slate-200 dark:border-slate-700">
              <User size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No patients found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}