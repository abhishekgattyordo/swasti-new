// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { 
//   ArrowLeft, User, Heart, Activity, Thermometer, Wind, Droplet,
//   Calendar, Phone, MapPin, Building2, Bed, Stethoscope,
//   Pill, FileText, ChevronRight, CheckSquare, X, Clock
// } from 'lucide-react';
// import { doctorsApi } from '@/lib/api/doctors';
// import toast from 'react-hot-toast';

// const MOCK_PATIENT = {
//   id: 4,
//   patient_id: '17774534073340313',
//   patient_name: 'Rakesh Rakesh',
//   patient_phone: '+918088197955',
//   dob: '1990-06-15',
//   gender: 'male',
//   blood_group: 'O+',
//   admission_date: '2026-04-29',
//   status: 'active',
//   reason: 'Chest pain and shortness of breath',
//   diagnosis: 'Community Acquired Pneumonia',
//   primary_consultant: 'Dr. Smith',
//   consultant_dept: 'Cardiology',
//   ward_name: 'General Ward',
//   ward_type: 'General',
//   bed_number: 'A-102',
//   address: '123 Medical Center Dr, Mangalore',
//   city: 'Mangalore',
//   state: 'Karnataka',
// };

// const MOCK_VITALS = [
//   { id: 1, bp: '120/80', hr: 72, temp: 36.8, rr: 16, spo2: 98, recorded_by: 'Nurse Samith', recorded_at: '2026-04-30 08:00 AM', status: 'stable' },
//   { id: 2, bp: '130/85', hr: 78, temp: 37.1, rr: 18, spo2: 96, recorded_by: 'Nurse Samith', recorded_at: '2026-04-30 02:00 PM', status: 'stable' },
//   { id: 3, bp: '140/90', hr: 88, temp: 37.4, rr: 20, spo2: 94, recorded_by: 'Nurse Priya', recorded_at: '2026-04-30 08:00 PM', status: 'improving' },
// ];

// export default function PatientOverviewPage() {
//   const router = useRouter();
//   const params = useParams();
//   const patientId = params?.patientId as string;
//   const patient = MOCK_PATIENT;
//   const latestVital = MOCK_VITALS[MOCK_VITALS.length - 1];

//   const [showTaskForm, setShowTaskForm] = useState(false);
//   const [nurses, setNurses] = useState<any[]>([]);
//   const [loadingNurses, setLoadingNurses] = useState(false);
//   const [wardInfo, setWardInfo] = useState<any>(null);
//   const [taskForm, setTaskForm] = useState({
//     taskType: 'vitals',
//     title: '',
//     description: '',
//     priority: 'medium',
//     dueDate: '',
//     dueTime: '',
//     assignedTo: '',
//     notes: '',
//   });

//   const getAge = (dob: string) => new Date().getFullYear() - new Date(dob).getFullYear();

//   // ✅ Fetch nurses in the PATIENT'S WARD
//   const fetchNurses = async () => {
//   try {
//     setLoadingNurses(true);
//     const result = await doctorsApi.getWardNurses(patientId);
    
//     console.log('Ward nurses result:', result);
    
//     // ✅ result IS directly the array
//     if (Array.isArray(result)) {
//       console.log('Setting nurses:', result);
//       setNurses(result);
//     } else if (result?.success && result?.data) {
//       setNurses(result.data);
//       setWardInfo(result.ward);
//     } else if (result?.data && Array.isArray(result.data)) {
//       setNurses(result.data);
//       if (result.ward) setWardInfo(result.ward);
//     } else {
//       setNurses([]);
//     }
//   } catch (err) {
//     console.error('Failed to fetch nurses:', err);
//     setNurses([]);
//   } finally {
//     setLoadingNurses(false);
//   }
// };

//   useEffect(() => {
//     if (showTaskForm) fetchNurses();
//   }, [showTaskForm]);

//   const handleCreateTask = () => {
//     console.log('Creating task:', taskForm);
//     toast.success('Task assigned successfully!');
//     setShowTaskForm(false);
//     setTaskForm({
//       taskType: 'vitals', title: '', description: '', priority: 'medium',
//       dueDate: '', dueTime: '', assignedTo: '', notes: '',
//     });
//   };

  // const tabItems = [
  //   { label: 'Vitals History', count: MOCK_VITALS.length, route: `/doctor/admitted-patients/${patientId}/vitals`, icon: Activity, color: 'text-red-500', bg: 'bg-red-50' },
  //   { label: 'Medications', count: 3, route: `/doctor/admitted-patients/${patientId}/medications`, icon: Pill, color: 'text-purple-500', bg: 'bg-purple-50' },
  //   { label: 'Clinical Notes', count: 2, route: `/doctor/admitted-patients/${patientId}/notes`, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
  //   { label: 'Assign Tasks', count: nurses.length, route: '#', icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-50', onClick: () => setShowTaskForm(true) },
  // ];

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
//       <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
//           <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
//           <div><h1 className="text-xl font-bold">{patient.patient_name}</h1><p className="text-sm text-gray-500">{patient.patient_id} • {patient.diagnosis}</p></div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm"><div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"><User size={22} className="text-blue-600" /></div><div><h3 className="font-semibold">{patient.patient_name}</h3><p className="text-xs text-gray-500 capitalize">{patient.gender} • {getAge(patient.dob)} yrs</p></div></div><div className="space-y-2 text-sm text-gray-600"><div className="flex items-center gap-2"><Phone size={14} /> {patient.patient_phone}</div><div className="flex items-center gap-2"><MapPin size={14} /> {patient.city}, {patient.state}</div>{patient.blood_group && <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200">{patient.blood_group}</span>}</div></div>
//           <div className="bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm"><h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Admission Info</h4><div className="space-y-2 text-sm text-gray-600"><div className="flex items-center gap-2"><Calendar size={14} /> Admitted: {patient.admission_date}</div><div className="flex items-center gap-2"><Building2 size={14} /> {patient.ward_name}</div><div className="flex items-center gap-2"><Bed size={14} /> Bed: {patient.bed_number}</div><span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span></div></div>
//           <div className="bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm"><h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Doctor</h4><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"><Stethoscope size={18} className="text-purple-600" /></div><div><p className="font-semibold text-sm">{patient.primary_consultant}</p><p className="text-xs text-gray-500">{patient.consultant_dept || 'General Medicine'}</p></div></div><div className="mt-2 p-2 bg-blue-50 rounded-lg"><p className="text-xs"><strong>Diagnosis:</strong> {patient.diagnosis || patient.reason}</p></div></div>
//           <div className="bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm"><h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Latest Vitals</h4><div className="grid grid-cols-2 gap-3"><div className="p-2 bg-red-50 rounded-lg text-center"><Heart size={14} className="mx-auto text-red-500 mb-1" /><p className="text-sm font-bold">{latestVital.bp}</p><p className="text-xs text-gray-500">BP</p></div><div className="p-2 bg-pink-50 rounded-lg text-center"><Activity size={14} className="mx-auto text-pink-500 mb-1" /><p className="text-sm font-bold">{latestVital.hr}</p><p className="text-xs text-gray-500">HR</p></div><div className="p-2 bg-orange-50 rounded-lg text-center"><Thermometer size={14} className="mx-auto text-orange-500 mb-1" /><p className="text-sm font-bold">{latestVital.temp}°C</p><p className="text-xs text-gray-500">Temp</p></div><div className="p-2 bg-cyan-50 rounded-lg text-center"><Droplet size={14} className="mx-auto text-cyan-500 mb-1" /><p className="text-sm font-bold">{latestVital.spo2}%</p><p className="text-xs text-gray-500">SpO₂</p></div></div><p className="text-xs text-gray-400 mt-2 text-center">By: {latestVital.recorded_by}</p></div>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {tabItems.map(tab => (
//             <button key={tab.label} onClick={tab.onClick ? tab.onClick : () => router.push(tab.route)} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left">
//               <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg ${tab.bg} flex items-center justify-center`}><tab.icon size={20} className={tab.color} /></div><div><h3 className="font-semibold text-gray-900 dark:text-white">{tab.label}</h3><p className="text-xs text-gray-500">{tab.count} records</p></div></div><ChevronRight size={18} className="text-gray-400" /></div>
//             </button>
//           ))}
//         </div>

//         {showTaskForm && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//               <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-xl">
//                 <div>
//                   <h2 className="text-lg font-semibold flex items-center gap-2"><CheckSquare size={20} className="text-green-500" />Assign Task for {patient.patient_name}</h2>
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     {wardInfo ? `${wardInfo.name} (${wardInfo.type})` : 'Task will be assigned to nurse'}
//                   </p>
//                 </div>
//                 <button onClick={() => setShowTaskForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
//               </div>

//               <form onSubmit={(e) => { e.preventDefault(); handleCreateTask(); }} className="p-6 space-y-4">
//                 <div><label className="block text-sm font-medium mb-2">Task Type *</label><select value={taskForm.taskType} onChange={(e) => setTaskForm(prev => ({ ...prev, taskType: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm"><option value="vitals">❤️ Vitals</option><option value="medication">💊 Medication</option><option value="lab">🔬 Lab Test</option><option value="dressing">🏥 Wound Dressing</option><option value="procedure">🩺 Procedure</option><option value="documentation">📝 Documentation</option></select></div>
//                 <div><label className="block text-sm font-medium mb-2">Task Title *</label><input type="text" value={taskForm.title} onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Record Vital Signs, Administer Medication..." className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm" required /></div>
//                 <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={taskForm.description} onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Task details, instructions..." className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm resize-none" /></div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div><label className="block text-sm font-medium mb-2">Priority</label><select value={taskForm.priority} onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm"><option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option></select></div>
//                   <div>
//                     <label className="block text-sm font-medium mb-2">Assign To ({nurses.length} nurse{nurses.length !== 1 ? 's' : ''} in ward)</label>
//                     <select value={taskForm.assignedTo} onChange={(e) => setTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm" disabled={loadingNurses}>
//                       <option value="">{loadingNurses ? 'Loading...' : 'Select Nurse'}</option>
//                       {nurses.map((nurse: any) => (
//                         <option key={nurse.id} value={`${nurse.first_name} ${nurse.last_name}`}>{nurse.first_name} {nurse.last_name}</option>
//                       ))}
//                     </select>
//                     {!loadingNurses && nurses.length === 0 && (
//                       <p className="text-xs text-amber-500 mt-1">No nurses found in {wardInfo?.name || 'this ward'}</p>
//                     )}
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-2"><Calendar size={14} className="inline mr-1" />Due Date *</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm" required /></div><div><label className="block text-sm font-medium mb-2"><Clock size={14} className="inline mr-1" />Due Time *</label><input type="time" value={taskForm.dueTime} onChange={(e) => setTaskForm(prev => ({ ...prev, dueTime: e.target.value }))} className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm" required /></div></div>
//                 <div><label className="block text-sm font-medium mb-2">Additional Notes</label><textarea value={taskForm.notes} onChange={(e) => setTaskForm(prev => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Special instructions..." className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-slate-800 text-sm resize-none" /></div>
//                 <div className="flex gap-3 justify-end pt-2">
//                   <button type="button" onClick={() => setShowTaskForm(false)} className="px-5 py-2.5 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
//                   <button type="submit" className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"><CheckSquare size={16} /> Assign Task</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }


'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, User, Heart, Activity, Thermometer, Wind, Droplet,
  Calendar, Phone, MapPin, Building2, Bed, Stethoscope,
  Pill, FileText, ChevronRight, CheckSquare, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { nurseApi } from '@/lib/api/nurse';

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

export default function PatientOverviewPage() {
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
      
      // Fetch patient details from ward patients
      const staffId = localStorage.getItem('staffId') || '';
      const patientsResult = await nurseApi.getMyWardPatients(staffId, { status: 'active' });
      
      let patientData: Patient | null = null;
      if (patientsResult?.success && patientsResult?.data) {
        patientData = patientsResult.data.find((p: any) => p.patient_id === patientId);
      } else if (Array.isArray(patientsResult)) {
        patientData = patientsResult.find((p: any) => p.patient_id === patientId);
      }
      
      if (patientData) {
        setPatient(patientData);
      } else {
        toast.error('Patient not found');
      }

      // Fetch vitals
      const vitalsResult = await nurseApi.getVitals(patientId, 24);
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

      // Fetch medications count
      const medsResult = await nurseApi.getMedications(patientId);
      const medsData = medsResult?.data || medsResult;
      setStats(prev => ({ ...prev, medicationsCount: Array.isArray(medsData) ? medsData.length : 0 }));

      // Fetch notes count
      const notesResult = await nurseApi.getNotes(patientId);
      const notesData = notesResult?.data || notesResult;
      setStats(prev => ({ ...prev, notesCount: Array.isArray(notesData) ? notesData.length : 0 }));

      // Fetch tasks count
      const tasksResult = await nurseApi.getTasks(patientId);
      const tasksData = tasksResult?.data || tasksResult;
      setStats(prev => ({ ...prev, tasksCount: Array.isArray(tasksData) ? tasksData.length : 0 }));

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


  //  const tabItems = [
  //   { label: 'Vitals History', count: MOCK_VITALS.length, route: `/doctor/admitted-patients/${patientId}/vitals`, icon: Activity, color: 'text-red-500', bg: 'bg-red-50' },
  //   { label: 'Medications', count: 3, route: `/doctor/admitted-patients/${patientId}/medications`, icon: Pill, color: 'text-purple-500', bg: 'bg-purple-50' },
  //   { label: 'Clinical Notes', count: 2, route: `/doctor/admitted-patients/${patientId}/notes`, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
  //   { label: 'Assign Tasks', count: nurses.length, route: '#', icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-50', onClick: () => setShowTaskForm(true) },
  // ];

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
          <p className="text-gray-500 dark:text-gray-400">Patient not found</p>
          <button 
            onClick={() => router.push('/nurse/patients')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/nurse/patients')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
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
                <Phone size={14} /> {patient.patient_phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} /> {patient.city}, {patient.state}
              </div>
              {patient.blood_group && (
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
                <Building2 size={14} /> {patient.ward_name}
              </div>
              <div className="flex items-center gap-2">
                <Bed size={14} /> Bed: {patient.bed_number}
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                {patient.status}
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
                <strong>Diagnosis:</strong> {patient.diagnosis || patient.reason}
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