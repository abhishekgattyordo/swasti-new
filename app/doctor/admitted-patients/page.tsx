'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  User, Search, RefreshCw, Loader2, 
  Filter, ChevronRight, Stethoscope, Building2, Bed, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Patient {
  id: number;
  patient_id: string;
  admission_date: string;
  discharge_date: string | null;
  status: string;
  reason: string;
  diagnosis: string | null;
  primary_consultant: string;
  consultant_dept: string | null;
  patient_name: string;
  patient_phone: string;
  dob: string;
  gender: string;
  blood_group: string | null;
  ward_name: string;
  ward_type: string;
  bed_number: string;
  bed_id: number;
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [stats, setStats] = useState({ total_patients: '0', active_patients: '0', discharged_patients: '0' });
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const doctorId = typeof window !== 'undefined' 
        ? localStorage.getItem('doctorId') || '9' 
        : '9';
      
      const response = await fetch(`/api/doctors/my-patients?doctorId=${doctorId}&status=${statusFilter}`);
      const result = await response.json();
      
      if (result?.success && result?.data) {
        setPatients(result.data);
        setStats(result.stats || { total_patients: '0', active_patients: '0', discharged_patients: '0' });
      } else if (Array.isArray(result)) {
        setPatients(result);
      } else {
        setPatients([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch patients:', err);
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const filteredPatients = patients.filter(p =>
    p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bed_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columnFilters = {
    patient: [...new Set(patients.map(p => p.patient_name))],
    diagnosis: [...new Set(patients.map(p => p.diagnosis))].filter(Boolean) as string[],
    ward: [...new Set(patients.map(p => p.ward_name))],
    bed: [...new Set(patients.map(p => p.bed_number))],
    status: ['active', 'discharged'],
  };

  const FilterPopover = ({ column, options }: { column: string; options: string[] }) => {
    const isOpen = openFilter === column;
    
    return (
      <div className="relative inline-block">
        <button
          onClick={(e) => { e.stopPropagation(); setOpenFilter(isOpen ? null : column); }}
          className="ml-1 p-0.5 rounded hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
        >
          <Filter size={10} className="text-gray-400" />
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenFilter(null)} />
            <div className="absolute left-0 top-6 mt-1 z-50 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-2">
              <div className="max-h-48 overflow-y-auto">
                {options.filter(Boolean).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSearchQuery(opt); setOpenFilter(null); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded text-gray-700 dark:text-gray-300"
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
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B1E6F] dark:text-[#7A329F] mx-auto" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope size={24} className="text-[#3B1E6F] dark:text-[#7A329F]" />
              <h1 className="text-2xl font-bold text-[#3B1E6F] dark:text-white">My Patients</h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Active: {stats.active_patients} • Discharged: {stats.discharged_patients} • Total: {stats.total_patients}
            </p>
          </div>
          <button 
            onClick={fetchPatients} 
            className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-2xl font-bold text-[#3B1E6F] dark:text-white">{stats.total_patients}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Patients</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active_patients}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-500 dark:text-gray-400">{stats.discharged_patients}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Discharged</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, bed or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>

        {/* Patients Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-purple-50 to-slate-50 dark:from-purple-900/20 dark:to-slate-800 border-b-2 border-slate-300 dark:border-slate-600">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1 text-[#3B1E6F] dark:text-white">Patient <FilterPopover column="patient" options={columnFilters.patient} /></div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-slate-200 dark:border-slate-700 text-[#3B1E6F] dark:text-white">Age/Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1 text-[#3B1E6F] dark:text-white">Diagnosis <FilterPopover column="diagnosis" options={columnFilters.diagnosis} /></div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1 text-[#3B1E6F] dark:text-white">Ward/Bed <FilterPopover column="ward" options={columnFilters.ward} /></div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-slate-200 dark:border-slate-700 text-[#3B1E6F] dark:text-white">Admitted</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-slate-200 dark:border-slate-700 text-[#3B1E6F] dark:text-white">Blood Group</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r border-slate-200 dark:border-slate-700 text-[#3B1E6F] dark:text-white">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[#3B1E6F] dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p, index) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 border-b border-slate-200 dark:border-slate-700 ${
                      index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B1E6F] to-[#7A329F] flex items-center justify-center flex-shrink-0 border border-purple-200 dark:border-purple-800">
                          <User size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{p.patient_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.patient_id} • {p.patient_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-slate-200 dark:border-slate-700">
                      <p className="text-gray-700 dark:text-gray-300">
                        {p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : 'N/A'} yrs
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{p.gender}</p>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{p.diagnosis || p.reason || 'N/A'}</p>
                      {p.consultant_dept && (
                        <p className="text-xs text-gray-500">{p.consultant_dept}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1">
                        <Building2 size={12} className="text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{p.ward_name}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Bed size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{p.bed_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 border-r border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(p.admission_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                      {p.blood_group ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                          {p.blood_group}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-700">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        p.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                      }`}>
                        {p.status === 'active' ? 'Active' : 'Discharged'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/doctor/admitted-patients/${p.patient_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#3B1E6F] to-[#7A329F] text-white rounded-lg text-xs font-medium hover:opacity-90 transition shadow-sm"
                      >
                        View <ChevronRight size={14} />
                      </Link>
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