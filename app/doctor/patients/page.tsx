"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
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
}, [tenantLoading, isPatientsEnabled, router]);;

  useEffect(() => {
    console.log("Patients response:", patients);
  }, [patients]);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );



  // const handleViewEHRClick = (e: React.MouseEvent, patientId: string) => {
  //   e.stopPropagation();
  //   router.push(`/doctor/ehr/${patientId}/current-visit`);
  // };
if (!tenantLoading && !isPatientsEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Doctor Patients feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with responsive layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Patients</h2>
        <button
          onClick={() => router.push('/doctor/patients/new')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add New Patient
        </button>
      </div>

      {/* Search - full width on mobile */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search patients by name or condition..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base"
        />
      </div>

      {/* Patients Table with grid lines */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] sm:min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 uppercase border border-gray-200">Patient</th>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 uppercase border border-gray-200">Age/Gender</th>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 uppercase border border-gray-200">Condition</th>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 uppercase border border-gray-200">Last Visit</th>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 uppercase border border-gray-200">Status</th>
                <th className="text-left p-3 sm:p-4 text-xs font-medium text-gray-500 uppercase border border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  // onClick={() => handleRowClick(patient.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="p-3 sm:p-4 border border-gray-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-600">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                        {patient.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-gray-600 whitespace-nowrap border border-gray-200">
                    {patient.age} / {patient.gender}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-gray-600 truncate max-w-[100px] sm:max-w-none border border-gray-200">
                    {patient.condition}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-gray-600 whitespace-nowrap border border-gray-200">
                    {patient.lastVisit}
                  </td>
                  <td className="p-3 sm:p-4 border border-gray-200">
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      patient.status === 'Critical' ? 'bg-red-100 text-red-600' :
                      patient.status === 'Stable' ? 'bg-green-100 text-green-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 border border-gray-200">
                    <button
                      // onClick={(e) => handleViewEHRClick(e, patient.id)}
                      className="text-blue-600 text-sm hover:text-blue-800 hover:underline whitespace-nowrap"
                    >
                   
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}