'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/patient/Sidebar';
import {
  Person,
  Phone,
  Email,
  CalendarToday,
  Badge,
  Home,
  Wc,
  Bloodtype,
  LocalHospital,
  Info,
  Medication,
} from '@mui/icons-material';
import { Menu, X } from 'lucide-react';
import { patientsApi } from '@/lib/api/registration'; // adjust path
import toast from 'react-hot-toast';

interface PatientData {
  patient_id: string;
  full_name_en: string;
  full_name_hi: string | null;
  dob: string;
  gender: string;
  address: string;
  city: string | null;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  blood_group: string;
  medical_history: Array<{
    allergy: string;
    medications: string;
    chronic_condition: string;
  }>;
  insurance_provider: string | null;
  policy_number: string | null;
  created_at: string;
  // ... other fields if needed
}

export default function PatientProfilePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!user || !user.id) {
        toast.error('Please login first');
        router.push('/login');
        return;
      }
      const patientId = user.patient_id || String(user.id);
      const response = await patientsApi.getRegistration(patientId);
      // API returns { success: true, data: [ ... ] }
      const data = response.data || response.data?.[0];
      if (data) {
        setPatientData(data);
      } else {
        toast.error('Patient data not found');
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely display value or placeholder
  const display = (value: any, placeholder = 'Not provided') => value || placeholder;

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">No patient data available.</p>
        </main>
      </div>
    );
  }

  // Extract medical history (first entry)
  const medicalHistory = patientData.medical_history?.[0] || {};
  const allergies = medicalHistory.allergy ? medicalHistory.allergy.split(',').map(s => s.trim()).filter(Boolean) : [];
  const chronicConditions = medicalHistory.chronic_condition ? medicalHistory.chronic_condition.split(',').map(s => s.trim()).filter(Boolean) : [];
  const medications = medicalHistory.medications ? medicalHistory.medications.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-display antialiased">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                My Profile
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                View your personal and medical information
              </p>
            </div>
          </div>

          {/* Main Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white">
                  <Person className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Patient Information
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Your personal and medical details
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN - Personal & Medical */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Badge className="text-green-600 dark:text-green-400" />
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Full Name
                        </label>
                        <div className="relative">
                          <Person className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={display(patientData.full_name_en)}
                            readOnly
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Email Address
                        </label>
                        <div className="relative">
                          <Email className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            value={display(patientData.email)}
                            readOnly
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            value={display(patientData.phone)}
                            readOnly
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <CalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={formatDate(patientData.dob)}
                            readOnly
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Gender
                        </label>
                        <div className="relative">
                          <Wc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={display(patientData.gender)}
                            readOnly
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Blood Group */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Blood Group
                        </label>
                        <div className="relative">
                          <Bloodtype className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={display(patientData.blood_group)}
                            readOnly
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <LocalHospital className="text-green-600 dark:text-green-400" />
                      Medical Information
                    </h3>

                    {/* Chronic Conditions */}
                    {chronicConditions.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Chronic Conditions
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {chronicConditions.map((cond, idx) => (
                            <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-700 dark:text-slate-300">
                              {cond}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Allergies */}
                    {allergies.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Allergies
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {allergies.map((allergy, idx) => (
                            <span key={idx} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Current Medications */}
                    {medications.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Current Medications
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {medications.map((med, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                              <Medication className="inline mr-1 text-sm" />
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN - Address, Insurance, Account */}
                <div className="space-y-6">
                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Home className="text-green-600 dark:text-green-400" />
                      Address
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={display(patientData.address)}
                          readOnly
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            City
                          </label>
                          <input
                            type="text"
                            value={display(patientData.city)}
                            readOnly
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            State
                          </label>
                          <input
                            type="text"
                            value={display(patientData.state)}
                            readOnly
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={display(patientData.pincode)}
                            readOnly
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Country
                          </label>
                          <input
                            type="text"
                            value={display(patientData.country)}
                            readOnly
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Info className="text-green-600 dark:text-green-400" />
                      Insurance Details
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Insurance Provider
                        </label>
                        <input
                          type="text"
                          value={display(patientData.insurance_provider)}
                          readOnly
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Policy Number
                          </label>
                          <input
                            type="text"
                            value={display(patientData.policy_number)}
                            readOnly
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                        {/* Group number not in API, show placeholder */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Group Number
                          </label>
                          <input
                            type="text"
                            value="Not provided"
                            readOnly
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Badge className="text-green-600 dark:text-green-400" />
                      Account Summary
                    </h3>
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Member Since</span>
                        <span className="text-sm text-slate-900 dark:text-white">{formatDate(patientData.created_at)}</span>
                      </div>
                      {/* Last visit could be fetched from appointments if needed */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}