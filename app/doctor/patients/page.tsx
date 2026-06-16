
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, User, Activity, Calendar } from "lucide-react";
import { useDoctor } from "../layout";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, DOCTOR_FEATURES } from "@/lib/feature";

export default function PatientsPage() {
  const router = useRouter();
  const { patients } = useDoctor();
  const [searchTerm, setSearchTerm] = useState("");

  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

  const isPatientsEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.DOCTOR,
    DOCTOR_FEATURES.PATIENTS
  );

  useEffect(() => {
    if (!tenantLoading && !isPatientsEnabled) {
      router.push("/unauthorized");
    }
  }, [tenantLoading, isPatientsEnabled, router]);

  useEffect(() => {
    console.log("Patients response:", patients);
  }, [patients]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalPatients = patients.length;
  const criticalPatients = patients.filter(p => p.status === 'Critical').length;
  const stablePatients = patients.filter(p => p.status === 'Stable').length;
  const followUpPatients = patients.filter(p => p.status === 'Follow-up').length;

  if (!tenantLoading && !isPatientsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Doctor Patients feature is not enabled for {tenant?.name}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#3B1E6F] dark:text-white">Patients</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your patient list and records</p>
        </div>
        <button
          onClick={() => router.push('/doctor/patients/new')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3B1E6F] to-[#7A329F] text-white rounded-lg text-sm font-medium hover:opacity-90 transition shadow-lg shadow-[#3B1E6F]/20"
        >
          <Plus className="w-4 h-4" />
          Add New Patient
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <User className="w-5 h-5 text-[#3B1E6F] dark:text-[#7A329F]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Patients</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalPatients}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Critical</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{criticalPatients}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Stable</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stablePatients}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Follow-up</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{followUpPatients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search patients by name or condition..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent text-sm sm:text-base text-gray-900 dark:text-white"
        />
      </div>

      {/* Patients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] sm:min-w-full border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-700/30">
              <tr>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">Patient</th>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">Age/Gender</th>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">Condition</th>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">Last Visit</th>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">Status</th>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
                >
                  <td className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#3B1E6F] to-[#7A329F] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-white">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                        {patient.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap border border-gray-200 dark:border-gray-700">
                    {patient.age} / {patient.gender}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[100px] sm:max-w-none border border-gray-200 dark:border-gray-700">
                    {patient.condition}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap border border-gray-200 dark:border-gray-700">
                    {patient.lastVisit}
                  </td>
                  <td className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      patient.status === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      patient.status === 'Stable' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                    <Link href={`/doctor/patient-summary/${patient.id}`}>
                      <button className="text-[#7A329F] dark:text-[#9B4DBF] text-sm hover:text-[#3B1E6F] dark:hover:text-[#7A329F] hover:underline whitespace-nowrap font-medium">
                        View EHR
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No patients found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search</p>
          </div>
        )}
        <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredPatients.length} of {patients.length} patients
        </div>
      </div>
    </div>
  );
}