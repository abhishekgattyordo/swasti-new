'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, User, Heart, Activity, Thermometer, Wind, Droplet,
  Calendar, Phone, MapPin, Building2, Bed, Stethoscope,
  Pill, FileText, CheckSquare, ChevronRight, Clock, Loader2
} from 'lucide-react';
import { nurseApi } from '@/lib/api/nurse';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const patientId = params?.patientId as string;
  const patientName = searchParams.get('name') || 'Patient';

  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'medications' | 'tasks' | 'notes'>('overview');
  const [patient, setPatient] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
  if (!patientId) return;
  try {
    setLoading(true);
    
    // Fetch patient details
    const patientsResult = await nurseApi.getMyWardPatients(
      localStorage.getItem('staffId') || '', 
      { status: 'active' }
    );
    
    let patientData: any = null;
    if (patientsResult?.success && patientsResult?.data) {
      patientData = patientsResult.data.find((p: any) => p.patient_id === patientId);
    } else if (Array.isArray(patientsResult)) {
      patientData = patientsResult.find((p: any) => p.patient_id === patientId);
    }
    setPatient(patientData);

    // ✅ FIXED: Removed 'admission' parameter
    const vitalsResult = await nurseApi.getVitals(patientId, 168);
    if (vitalsResult?.success && vitalsResult?.data) setVitals(vitalsResult.data);
    else if (Array.isArray(vitalsResult)) setVitals(vitalsResult);

    // Fetch medications
    const medsResult = await nurseApi.getMedications(patientId);
    if (medsResult?.success && medsResult?.data) setMedications(medsResult.data);
    else if (Array.isArray(medsResult)) setMedications(medsResult);

    // Fetch tasks
    const tasksResult = await nurseApi.getTasks(patientId);
    if (tasksResult?.success && tasksResult?.data) setTasks(tasksResult.data);
    else if (Array.isArray(tasksResult)) setTasks(tasksResult);

    // Fetch notes
    const notesResult = await nurseApi.getNotes(patientId);
    if (notesResult?.success && notesResult?.data) setNotes(notesResult.data);
    else if (Array.isArray(notesResult)) setNotes(notesResult);

  } catch (err) {
    console.error('Failed to fetch patient data:', err);
  } finally {
    setLoading(false);
  }
}, [patientId]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;
  const pendingTasks = tasks.filter((t: any) => t.status === 'pending' || t.status === 'in-progress').length;
  const activeMeds = medications.length;
  const notesCount = notes.length;

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: User },
    { key: 'vitals' as const, label: `Vitals (${vitals.length})`, icon: Activity },
    { key: 'medications' as const, label: `Meds (${activeMeds})`, icon: Pill },
    { key: 'tasks' as const, label: `Tasks (${pendingTasks})`, icon: CheckSquare },
    { key: 'notes' as const, label: `Notes (${notesCount})`, icon: FileText },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'improving': return 'bg-blue-100 text-blue-700';
      case 'stable': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/nurse/patients')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{patient?.patient_name || patientName}</h1>
            <p className="text-sm text-gray-500">{patientId} • {patient?.diagnosis || patient?.reason || 'N/A'}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><User size={18} className="text-blue-600" /></div><div><p className="text-xs text-gray-500">Patient</p><p className="font-semibold text-sm">{patient?.patient_name || 'N/A'}</p><p className="text-xs text-gray-400">{patient?.gender} • {patient?.blood_group || 'N/A'}</p></div></div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><Building2 size={18} className="text-green-600" /></div><div><p className="text-xs text-gray-500">Ward / Bed</p><p className="font-semibold text-sm">{patient?.ward_name || 'N/A'}</p><p className="text-xs text-gray-400">Bed: {patient?.bed_number || 'N/A'}</p></div></div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"><Calendar size={18} className="text-purple-600" /></div><div><p className="text-xs text-gray-500">Admitted</p><p className="font-semibold text-sm">{patient?.admission_date || 'N/A'}</p><p className="text-xs text-gray-400">{patient?.patient_phone || ''}</p></div></div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><Activity size={18} className="text-orange-600" /></div><div><p className="text-xs text-gray-500">Latest Vitals</p><p className="font-semibold text-sm">{latestVital ? `${latestVital.systolic}/${latestVital.diastolic} • HR: ${latestVital.heartRate}` : 'No vitals'}</p><p className="text-xs text-gray-400">{latestVital?.recordedBy || ''}</p></div></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
          <div className="border-b px-4">
            <div className="flex gap-0 overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <tab.icon size={14} className="inline mr-1" />{tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div onClick={() => setActiveTab('vitals')} className="bg-red-50 rounded-lg p-3 cursor-pointer hover:shadow border border-red-200 text-center">
                    <Activity size={20} className="mx-auto text-red-500 mb-1" /><p className="text-xs font-medium">Vitals</p><p className="text-lg font-bold">{vitals.length}</p>
                  </div>
                  <div onClick={() => setActiveTab('medications')} className="bg-purple-50 rounded-lg p-3 cursor-pointer hover:shadow border border-purple-200 text-center">
                    <Pill size={20} className="mx-auto text-purple-500 mb-1" /><p className="text-xs font-medium">Medications</p><p className="text-lg font-bold">{activeMeds}</p>
                  </div>
                  <div onClick={() => setActiveTab('tasks')} className="bg-green-50 rounded-lg p-3 cursor-pointer hover:shadow border border-green-200 text-center">
                    <CheckSquare size={20} className="mx-auto text-green-500 mb-1" /><p className="text-xs font-medium">Tasks</p><p className="text-lg font-bold">{pendingTasks}</p>
                  </div>
                  <div onClick={() => setActiveTab('notes')} className="bg-blue-50 rounded-lg p-3 cursor-pointer hover:shadow border border-blue-200 text-center">
                    <FileText size={20} className="mx-auto text-blue-500 mb-1" /><p className="text-xs font-medium">Notes</p><p className="text-lg font-bold">{notesCount}</p>
                  </div>
                </div>
                <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-sm mb-2">Quick Summary</h3>
                  <p className="text-sm text-gray-600">
                    {patient?.patient_name} is admitted in {patient?.ward_name} (Bed {patient?.bed_number}) since {patient?.admission_date}. 
                    {latestVital ? ` Latest vitals: BP ${latestVital.systolic}/${latestVital.diastolic}, HR ${latestVital.heartRate} bpm.` : ' No vitals recorded yet.'}
                    {pendingTasks > 0 ? ` ${pendingTasks} task${pendingTasks > 1 ? 's' : ''} pending.` : ''}
                    {activeMeds > 0 ? ` ${activeMeds} active medication${activeMeds > 1 ? 's' : ''}.` : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Vitals Tab */}
            {activeTab === 'vitals' && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {vitals.length === 0 ? <p className="text-gray-500 text-center py-8">No vitals recorded</p> : (
                  vitals.map((v: any, i: number) => (
                    <div key={i} className={`p-3 rounded-lg border ${getStatusColor(v.status || 'stable')}`}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{v.timestamp || v.recorded_at}</span><span>{v.recordedBy}</span></div>
                      <div className="grid grid-cols-5 gap-2 text-center text-sm">
                        <span><strong>{v.systolic}/{v.diastolic}</strong><br/><span className="text-xs">BP</span></span>
                        <span><strong>{v.heartRate}</strong><br/><span className="text-xs">HR</span></span>
                        <span><strong>{v.temperature}°C</strong><br/><span className="text-xs">Temp</span></span>
                        <span><strong>{v.respiratoryRate}</strong><br/><span className="text-xs">RR</span></span>
                        <span><strong>{v.spO2}%</strong><br/><span className="text-xs">SpO₂</span></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Medications Tab */}
            {activeTab === 'medications' && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {medications.length === 0 ? <p className="text-gray-500 text-center py-8">No medications</p> : (
                  medications.map((m: any, i: number) => (
                    <div key={i} className="p-3 border rounded-lg flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Pill size={16} className="text-purple-500" />
                        <div><p className="font-medium text-sm">{m.medicationName}</p><p className="text-xs text-gray-500">{m.dosage} • {m.route} {m.frequency && `• ${m.frequency}`}</p></div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.status === 'administered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? <p className="text-gray-500 text-center py-8">No tasks assigned</p> : (
                  tasks.map((t: any, i: number) => (
                    <div key={i} className={`p-3 border rounded-lg ${t.status === 'overdue' ? 'border-red-200 bg-red-50/30' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <CheckSquare size={14} className={t.status === 'completed' ? 'text-green-500' : 'text-yellow-500'} />
                          <div>
                            <p className="font-medium text-sm">{t.title}</p>
                            <p className="text-xs text-gray-500">{t.due_date} {t.due_time} • {t.assigned_to}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          t.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          t.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{t.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notes.length === 0 ? <p className="text-gray-500 text-center py-8">No notes recorded</p> : (
                  notes.map((n: any, i: number) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-sm">{n.title}</p>
                        <span className="text-xs text-gray-500">{n.createdAt}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{n.content}</p>
                      <p className="text-xs text-gray-400 mt-1">By: {n.createdBy}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}