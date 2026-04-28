'use client';

import Link from 'next/link';
import { Search, Filter, ArrowLeft, User, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const patients = [
    { id: 'P001', name: 'John Doe', age: 45, bed: 'ICU-101', status: 'critical', doctor: 'Dr. Smith', diagnosis: 'Pneumonia', admittedDate: '2026-04-25' },
    { id: 'P002', name: 'Mary Smith', age: 32, bed: 'GEN-205', status: 'recovering', doctor: 'Dr. Johnson', diagnosis: 'Appendectomy', admittedDate: '2026-04-27' },
    { id: 'P003', name: 'Robert Wilson', age: 67, bed: 'GEN-206', status: 'stable', doctor: 'Dr. Smith', diagnosis: 'Hypertension', admittedDate: '2026-04-20' },
    { id: 'P004', name: 'Sarah Davis', age: 28, bed: 'OBS-301', status: 'serious', doctor: 'Dr. Patel', diagnosis: 'Pregnancy Complications', admittedDate: '2026-04-26' },
    { id: 'P005', name: 'James Brown', age: 52, bed: 'ICU-102', status: 'critical', doctor: 'Dr. Williams', diagnosis: 'Heart Failure', admittedDate: '2026-04-28' },
    { id: 'P006', name: 'Emily Wilson', age: 24, bed: 'GEN-207', status: 'recovering', doctor: 'Dr. Johnson', diagnosis: 'Fractured Arm', admittedDate: '2026-04-29' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'serious': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'recovering': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'critical': return '🔴 Critical';
      case 'serious': return '🟡 Serious';
      case 'recovering': return '🔵 Recovering';
      default: return '🟢 Stable';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter options for each column
  const columnFilters = {
    patient: ['John Doe', 'Mary Smith', 'Robert Wilson', 'Sarah Davis', 'James Brown', 'Emily Wilson'],
    bed: ['ICU-101', 'GEN-205', 'GEN-206', 'OBS-301', 'ICU-102', 'GEN-207'],
    doctor: ['Dr. Smith', 'Dr. Johnson', 'Dr. Patel', 'Dr. Williams'],
    diagnosis: ['Pneumonia', 'Appendectomy', 'Hypertension', 'Pregnancy Complications', 'Heart Failure', 'Fractured Arm'],
    status: ['critical', 'serious', 'recovering', 'stable'],
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
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    console.log(`Filter ${column} by ${opt}`);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
      
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Patients</h1>
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
            <p className="text-2xl font-bold text-red-600">{patients.filter(p => p.status === 'critical').length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{patients.filter(p => p.status === 'serious').length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Serious</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">{patients.filter(p => p.status === 'stable' || p.status === 'recovering').length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Stable/Recovering</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
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
            <option value="critical">Critical</option>
            <option value="serious">Serious</option>
            <option value="recovering">Recovering</option>
            <option value="stable">Stable</option>
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
                      Bed
                      <FilterPopover column="bed" options={columnFilters.bed} />
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      Doctor
                      <FilterPopover column="doctor" options={columnFilters.doctor} />
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      Diagnosis
                      <FilterPopover column="diagnosis" options={columnFilters.diagnosis} />
                    </div>
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      Status
                      <FilterPopover column="status" options={columnFilters.status} />
                    </div>
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
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <User size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{patient.id} • {patient.age} yrs</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 border border-gray-200 dark:border-slate-700">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">{patient.bed}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 border border-gray-200 dark:border-slate-700">
                      <p className="text-sm text-gray-900 dark:text-white">{patient.doctor}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 border border-gray-200 dark:border-slate-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{patient.diagnosis}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-4 border border-gray-200 dark:border-slate-700">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                        {getStatusBadge(patient.status)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right border border-gray-200 dark:border-slate-700">
                      <Link
                        href={`/nurse/patients/${patient.id}`}
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