


'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, User, Heart, Activity, Thermometer, Wind, Droplet,
  Calendar, Phone, MapPin, Building2, Bed, Stethoscope,
  Pill, FileText, ChevronRight, CheckSquare, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Patient {
  id: number;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  dob: string;
  gender: string;
  blood_group: string;
  admission_date: string;
  status: string;
  reason: string;
  diagnosis: string;
  primary_consultant: string;
  consultant_dept: string;
  ward_name: string;
  ward_type: string;
  bed_number: string;
  address: string;
  city: string;
  state: string;
}

interface Vital {
  id: number;
  bp: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  spO2: number;
  recordedBy: string;
  recorded_at: string;
  status: string;
}

export default function DoctorPatientOverviewPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    medicationsCount: 0,
    notesCount: 0,
    tasksCount: 0
  });

  const fetchPatientData = useCallback(async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      
      // Get doctor info from localStorage
      const doctorId = localStorage.getItem('doctorId') || '9';
      
      // Fetch doctor's patients list to find this patient
      const response = await fetch(`/api/doctors/my-patients?doctorId=${doctorId}&status=all`);
      const result = await response.json();
      
      let patientData: Patient | null = null;
      
      if (result?.success && result?.data) {
        // Find the specific patient in doctor's patient list
        patientData = result.data.find((p: any) => p.patient_id === patientId);
      }
      
      if (patientData) {
        setPatient(patientData);
      } else {
        toast.error('Patient not found in your assigned list');
        // Don't redirect immediately, let user see error
      }

      // Fetch vitals for this patient
      try {
        const vitalsRes = await fetch(`/api/nurse/vitals?patientId=${patientId}&hours=24`);
        const vitalsResult = await vitalsRes.json();
        let vitalsData = vitalsResult?.data || vitalsResult;
        
        if (Array.isArray(vitalsData)) {
          const formattedVitals = vitalsData.map((v: any) => ({
            id: v.id,
            bp: v.bp || `${v.systolic || 0}/${v.diastolic || 0}`,
            systolic: v.systolic || 0,
            diastolic: v.diastolic || 0,
            heartRate: v.heartRate || v.hr || 0,
            temperature: v.temperature || v.temp || 0,
            respiratoryRate: v.respiratoryRate || v.rr || 0,
            spO2: v.spO2 || v.spo2 || 0,
            recordedBy: v.recordedBy || v.recorded_by || 'Unknown',
            recorded_at: v.recordedAt || v.recorded_at || new Date().toISOString(),
            status: v.status || 'stable'
          }));
          setVitals(formattedVitals);
        }
      } catch (err) {
        console.error('Error fetching vitals:', err);
      }

      // Fetch medications count
      try {
        const medsRes = await fetch(`/api/nurse/medications?patientId=${patientId}`);
        const medsResult = await medsRes.json();
        const medsData = medsResult?.data || medsResult;
        setStats(prev => ({ ...prev, medicationsCount: Array.isArray(medsData) ? medsData.length : 0 }));
      } catch (err) {
        console.error('Error fetching medications:', err);
      }

      // Fetch notes count
      try {
        const notesRes = await fetch(`/api/nurse/notes?patientId=${patientId}`);
        const notesResult = await notesRes.json();
        const notesData = notesResult?.data || notesResult;
        setStats(prev => ({ ...prev, notesCount: Array.isArray(notesData) ? notesData.length : 0 }));
      } catch (err) {
        console.error('Error fetching notes:', err);
      }

      // Fetch tasks count
      try {
        const tasksRes = await fetch(`/api/doctors/tasks?patientId=${patientId}`);
        const tasksResult = await tasksRes.json();
        const tasksData = tasksResult?.data || tasksResult;
        setStats(prev => ({ ...prev, tasksCount: Array.isArray(tasksData) ? tasksData.length : 0 }));
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }

    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  const getAge = (dob: string) => {
    if (!dob) return 'N/A';
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;

  const tabItems = [
    { 
      label: 'Vitals History', 
      count: vitals.length, 
      route: `/doctor/admitted-patients/${patientId}/vitals`, 
      icon: Activity, 
      color: 'text-red-500', 
      bg: 'bg-red-50' 
    },
    { 
      label: 'Medications', 
      count: stats.medicationsCount, 
      route: `/doctor/admitted-patients/${patientId}/medications`, 
      icon: Pill, 
      color: 'text-purple-500', 
      bg: 'bg-purple-50' 
    },
    { 
      label: 'Clinical Notes', 
      count: stats.notesCount, 
      route: `/doctor/admitted-patients/${patientId}/notes`, 
      icon: FileText, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Tasks', 
      count: stats.tasksCount, 
      route: `/doctor/admitted-patients/${patientId}/assign-task`, 
      icon: CheckSquare, 
      color: 'text-green-500', 
      bg: 'bg-green-50' 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Patient not found in your assigned list</p>
          <button 
            onClick={() => router.push('/doctor/admitted-patients')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to My Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/doctor/admitted-patients')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{patient.patient_name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{patient.patient_id} • {patient.diagnosis || patient.reason}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Patient Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User size={22} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{patient.patient_name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {patient.gender} • {getAge(patient.dob)} yrs
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Phone size={14} /> {patient.patient_phone || 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} /> {patient.city || 'N/A'}, {patient.state || 'N/A'}
              </div>
              {patient.blood_group && patient.blood_group !== 'Unknown' && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                  {patient.blood_group}
                </span>
              )}
            </div>
          </div>

          {/* Admission Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Admission Info</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar size={14} /> Admitted: {patient.admission_date}
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={14} /> {patient.ward_name || 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <Bed size={14} /> Bed: {patient.bed_number || 'N/A'}
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                {patient.status === 'active' ? 'Active' : patient.status || 'Active'}
              </span>
            </div>
          </div>

          {/* Doctor Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Doctor</h4>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Stethoscope size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{patient.primary_consultant || 'Not Assigned'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{patient.consultant_dept || 'General Medicine'}</p>
              </div>
            </div>
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <strong>Diagnosis:</strong> {patient.diagnosis || patient.reason || 'Under evaluation'}
              </p>
            </div>
          </div>

          {/* Latest Vitals Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Latest Vitals</h4>
            {latestVital ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-center">
                    <Heart size={14} className="mx-auto text-red-500 dark:text-red-400 mb-1" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{latestVital.bp}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">BP</p>
                  </div>
                  <div className="p-2 bg-pink-50 dark:bg-pink-900/30 rounded-lg text-center">
                    <Activity size={14} className="mx-auto text-pink-500 dark:text-pink-400 mb-1" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{latestVital.heartRate}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">HR</p>
                  </div>
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-center">
                    <Thermometer size={14} className="mx-auto text-orange-500 dark:text-orange-400 mb-1" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{latestVital.temperature}°C</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Temp</p>
                  </div>
                  <div className="p-2 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg text-center">
                    <Droplet size={14} className="mx-auto text-cyan-500 dark:text-cyan-400 mb-1" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{latestVital.spO2}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">SpO₂</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                  By: {latestVital.recordedBy}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No vitals recorded</p>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tabItems.map(tab => (
            <button
              key={tab.label}
              onClick={() => router.push(tab.route)}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${tab.bg} dark:bg-opacity-20 flex items-center justify-center`}>
                    <tab.icon size={20} className={tab.color} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{tab.label}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tab.count} records</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 dark:text-gray-600" />
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}