'use client';

import Link from 'next/link';
import { Search, Filter, User, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { nurseApi, Patient } from '@/lib/api/nurse';

interface Admission {
  id: number;
  patient_id: string;
  admission_date: string;
  discharge_date: string | null;
  status: string;
  reason: string;
  diagnosis: string | null;
  patient_name: string;
  patient_phone: string;
  ward_name: string;
  bed_number: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  // Fetch patients using the API client
  const fetchPatients = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    const staffId = localStorage.getItem('staffId');
    const userId = localStorage.getItem('userId');
    
    console.log('staffId:', staffId, 'userId:', userId);
    
    if (!staffId) {
      setError('Staff ID not found. Please log in again.');
      setLoading(false);
      return;
    }
    
    const result = await nurseApi.getMyWardPatients(staffId, { status: 'active' });
    console.log("Ward patients result:", result);
    
    // FIX: Handle different response structures
    if (result && result.success && result.data) {
      setPatients(result.data);
    } else if (Array.isArray(result)) {
      setPatients(result);  // ✅ Direct array
    } else if (result && result.data) {
      setPatients(result.data);
    } else {
      setPatients([]);
    }
  } catch (err: any) {
    console.error('Failed to fetch ward patients:', err);
    setError(err.message || 'Failed to fetch patients');
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Determine patient condition
  const getPatientStatus = (patient: Admission): string => {
    if (patient.status === 'discharged') return 'discharged';
    
    const reason = patient.reason?.toLowerCase() || '';
    
    if (reason.includes('emergency') || reason.includes('critical')) {
      return 'critical';
    }
    if (reason.includes('surgery') || reason.includes('fracture')) {
      return 'serious';
    }
    if (patient.status === 'active') {
      return 'recovering';
    }
    return 'stable';
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'serious': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'recovering': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'discharged': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
  };

  const getStatusBadge = (patient: Admission) => {
    if (patient.status === 'discharged') return '✅ Discharged';
    
    const condition = getPatientStatus(patient);
    switch(condition) {
      case 'critical': return '🔴 Critical';
      case 'serious': return '🟡 Serious';
      case 'recovering': return '🔵 Recovering';
      default: return '🟢 Stable';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.ward_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.bed_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const activePatients = patients.filter(p => p.status === 'active');
  const dischargedPatients = patients.filter(p => p.status === 'discharged');
  const criticalPatients = patients.filter(p => getPatientStatus(p) === 'critical');

  // Dynamic filter options
  const columnFilters = {
    patient: [...new Set(patients.map(p => p.patient_name))],
    bed: [...new Set(patients.map(p => p.bed_number))],
    ward: [...new Set(patients.map(p => p.ward_name))],
    reason: [...new Set(patients.map(p => p.reason || 'N/A'))],
  };

  const FilterPopover = ({ column, options }: { column: string; options: string[] }) => {
    const isOpen = openFilter === column;
    
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setOpenFilter(isOpen ? null : column)}
          className="ml-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Filter size={10} className="text-gray-400" />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-6 mt-1 z-50 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-2">
            <div className="max-h-48 overflow-y-auto">
              {options.filter(Boolean).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSearchQuery(opt);
                    setOpenFilter(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors text-gray-700 dark:text-gray-300"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-500">Loading patients...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchPatients}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Patients</h1>
          <button
            onClick={fetchPatients}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Patients</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{activePatients.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-2xl font-bold text-red-600">{criticalPatients.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-600">{dischargedPatients.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discharged</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, ward or bed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>

        {/* Patients Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      Patient
                      <FilterPopover column="patient" options={columnFilters.patient} />
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      Bed/Ward
                      <FilterPopover column="bed" options={columnFilters.bed} />
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      Reason
                      <FilterPopover column="reason" options={columnFilters.reason} />
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-slate-700">
                    Admitted
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-slate-700">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 sm:px-6 py-4 border border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{patient.patient_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {patient.patient_id} • {patient.patient_phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 border border-gray-200 dark:border-slate-700">
                      <div>
                        <p className="text-sm font-mono text-gray-900 dark:text-white">{patient.bed_number}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{patient.ward_name}</p>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 border border-gray-200 dark:border-slate-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{patient.reason || patient.diagnosis || 'N/A'}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(patient.admission_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 sm:px-6 py-4 border border-gray-200 dark:border-slate-700">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getPatientStatus(patient))}`}>
                        {getStatusBadge(patient)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right border border-gray-200 dark:border-slate-700">
                      <Link
                        href={`/nurse/patients/${patient.patient_id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Details
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No patients found</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}