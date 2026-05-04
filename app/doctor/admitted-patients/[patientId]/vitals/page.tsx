// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { ArrowLeft, Activity, Clock, Heart, Loader2, RefreshCw } from 'lucide-react';
// import { nurseApi } from '@/lib/api/nurse';

// const getStatusColor = (status: string) => {
//   switch (status) {
//     case 'critical': return 'bg-red-50 border-red-200 text-red-700';
//     case 'improving': return 'bg-blue-50 border-blue-200 text-blue-700';
//     case 'stable': return 'bg-green-50 border-green-200 text-green-700';
//     default: return 'bg-gray-50 border-gray-200 text-gray-700';
//   }
// };

// export default function VitalsHistoryPage() {
//   const router = useRouter();
//   const params = useParams();
//   const patientId = params?.patientId as string;

//   const [vitals, setVitals] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchVitals = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       // Fetch admission vitals (nurse vitals after admission) for last 7 days
//       const result = await nurseApi.getVitals(patientId, 168, 'admission');
      
//       console.log('Vitals result:', result);
      
//       if (result?.success && result?.data) {
//         setVitals(result.data);
//       } else if (Array.isArray(result)) {
//         setVitals(result);
//       } else {
//         setVitals([]);
//       }
//     } catch (err: any) {
//       console.error('Failed to fetch vitals:', err);
//       setError(err.message || 'Failed to load vitals');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (patientId) fetchVitals();
//   }, [patientId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
//           <p className="mt-2 text-gray-500">Loading vitals...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
//       <header className="border-b border-slate-200 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
//               <ArrowLeft size={20} />
//             </button>
//             <div>
//               <div className="flex items-center gap-2">
//                 <Activity size={20} className="text-red-500" />
//                 <h1 className="text-xl font-bold">Vitals History</h1>
//               </div>
//               <p className="text-sm text-gray-500">{vitals.length} records</p>
//             </div>
//           </div>
//           <button onClick={fetchVitals} className="p-2 hover:bg-gray-100 rounded-lg">
//             <RefreshCw size={18} className="text-gray-500" />
//           </button>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 py-8">
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">{error}</div>
//         )}

//         {vitals.length === 0 ? (
//           <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
//             <Activity size={48} className="mx-auto text-gray-300 mb-4" />
//             <p className="text-gray-500">No vitals recorded yet</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {vitals.map((v) => (
//               <div key={v.id} className={`p-5 rounded-xl border ${getStatusColor(v.status || 'stable')} bg-white dark:bg-slate-900`}>
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-2 text-sm">
//                     <Clock size={14} />
//                     <span className="font-medium">{v.timestamp || v.recorded_at}</span>
//                   </div>
//                   <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-white/50">
//                     {v.status || 'stable'}
//                   </span>
//                 </div>
//                 <div className="grid grid-cols-5 gap-4 text-center">
//                   <div>
//                     <p className="text-xs text-gray-500">BP</p>
//                     <p className="text-lg font-bold">
//                       {v.systolic}/{v.diastolic}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">HR</p>
//                     <p className="text-lg font-bold">{v.heartRate}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">Temp</p>
//                     <p className="text-lg font-bold">{v.temperature}°C</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">RR</p>
//                     <p className="text-lg font-bold">{v.respiratoryRate}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500">SpO₂</p>
//                     <p className="text-lg font-bold">{v.spO2}%</p>
//                   </div>
//                 </div>
//                 {v.clinicalNotes && (
//                   <p className="text-xs text-gray-500 mt-3">📝 {v.clinicalNotes}</p>
//                 )}
//                 <p className="text-xs text-gray-400 mt-2">Recorded by: {v.recordedBy}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }



'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Activity, Clock, Heart, Loader2, RefreshCw, Droplet, Thermometer, Wind, ChevronDown, ChevronUp } from 'lucide-react';
import { nurseApi } from '@/lib/api/nurse';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical': return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
    case 'improving': return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
    case 'stable': return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
    default: return 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400';
  }
};

const getVitalStatusColor = (value: number, type: string) => {
  switch (type) {
    case 'bp_systolic':
      if (value > 140) return 'text-red-600 dark:text-red-400';
      if (value > 120) return 'text-orange-500 dark:text-orange-400';
      return 'text-green-600 dark:text-green-400';
    case 'bp_diastolic':
      if (value > 90) return 'text-red-600 dark:text-red-400';
      if (value > 80) return 'text-orange-500 dark:text-orange-400';
      return 'text-green-600 dark:text-green-400';
    case 'hr':
      if (value > 100 || value < 60) return 'text-red-600 dark:text-red-400';
      if (value > 90 || value < 65) return 'text-orange-500 dark:text-orange-400';
      return 'text-green-600 dark:text-green-400';
    case 'temp':
      if (value > 38.5 || value < 36) return 'text-red-600 dark:text-red-400';
      if (value > 37.5 || value < 36.5) return 'text-orange-500 dark:text-orange-400';
      return 'text-green-600 dark:text-green-400';
    case 'rr':
      if (value > 24 || value < 12) return 'text-red-600 dark:text-red-400';
      if (value > 20 || value < 14) return 'text-orange-500 dark:text-orange-400';
      return 'text-green-600 dark:text-green-400';
    case 'spo2':
      if (value < 90) return 'text-red-600 dark:text-red-400';
      if (value < 95) return 'text-orange-500 dark:text-orange-400';
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-gray-700 dark:text-gray-300';
  }
};

export default function VitalsHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId as string;

  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const fetchPatientDetails = async () => {
    try {
      const staffId = localStorage.getItem('staffId') || '';
      const patientsResult = await nurseApi.getMyWardPatients(staffId, { status: 'active' });
      
      let patientData: any = null;
      if (patientsResult?.success && patientsResult?.data) {
        patientData = patientsResult.data.find((p: any) => p.patient_id === patientId);
      } else if (Array.isArray(patientsResult)) {
        patientData = patientsResult.find((p: any) => p.patient_id === patientId);
      }
      
      if (patientData) {
        setPatientName(patientData.patient_name);
      }
    } catch (err) {
      console.error('Failed to fetch patient details:', err);
    }
  };

  const fetchVitals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await nurseApi.getVitals(patientId, 168);
      
      console.log('Vitals result:', result);
      
      if (result?.success && result?.data) {
        setVitals(result.data);
      } else if (Array.isArray(result)) {
        setVitals(result);
      } else {
        setVitals([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch vitals:', err);
      setError(err.message || 'Failed to load vitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
      fetchVitals();
    }
  }, [patientId]);

  const toggleRow = (id: number) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-500">Loading vitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-red-500" />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vitals History</h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {patientName || 'Patient'} • {vitals.length} records
                </p>
              </div>
            </div>
            <button 
              onClick={fetchVitals} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Latest Vitals Summary Bar */}
          {latestVital && (
            <div className="grid grid-cols-5 gap-3 pt-3 border-t border-gray-200 dark:border-slate-700">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Heart size={14} className="text-red-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">BP</span>
                </div>
                <p className={`text-lg font-bold ${getVitalStatusColor(latestVital.systolic, 'bp_systolic')}`}>
                  {latestVital.systolic}/{latestVital.diastolic}
                </p>
                <p className="text-xs text-gray-400">mmHg</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Activity size={14} className="text-pink-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">HR</span>
                </div>
                <p className={`text-lg font-bold ${getVitalStatusColor(latestVital.heartRate, 'hr')}`}>
                  {latestVital.heartRate}
                </p>
                <p className="text-xs text-gray-400">bpm</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Thermometer size={14} className="text-orange-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Temp</span>
                </div>
                <p className={`text-lg font-bold ${getVitalStatusColor(parseFloat(latestVital.temperature), 'temp')}`}>
                  {latestVital.temperature}°C
                </p>
                <p className="text-xs text-gray-400">celsius</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Wind size={14} className="text-cyan-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">RR</span>
                </div>
                <p className={`text-lg font-bold ${getVitalStatusColor(latestVital.respiratoryRate, 'rr')}`}>
                  {latestVital.respiratoryRate}
                </p>
                <p className="text-xs text-gray-400">breaths/min</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Droplet size={14} className="text-blue-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">SpO₂</span>
                </div>
                <p className={`text-lg font-bold ${getVitalStatusColor(latestVital.spO2, 'spo2')}`}>
                  {latestVital.spO2}%
                </p>
                <p className="text-xs text-gray-400">saturation</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {vitals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Activity size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No vitals recorded yet</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">BP (mmHg)</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">HR (bpm)</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Temp (°C)</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">RR (breaths/min)</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">SpO₂ (%)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Recorded By</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {vitals.map((v, idx) => (
                    <Fragment key={v.id || idx}>
                      <tr 
                        className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => toggleRow(v.id)}
                      >
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            <span>{v.timestamp || new Date(v.fullTimestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(v.fullTimestamp).toLocaleDateString()}
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 text-center text-sm font-medium">
                          <span className={getVitalStatusColor(v.systolic, 'bp_systolic')}>
                            {v.systolic}/{v.diastolic}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 text-center text-sm font-medium">
                          <span className={getVitalStatusColor(v.heartRate, 'hr')}>
                            {v.heartRate}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 text-center text-sm font-medium">
                          <span className={getVitalStatusColor(parseFloat(v.temperature), 'temp')}>
                            {v.temperature}°C
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 text-center text-sm font-medium">
                          <span className={getVitalStatusColor(v.respiratoryRate, 'rr')}>
                            {v.respiratoryRate}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 text-center text-sm font-medium">
                          <span className={getVitalStatusColor(v.spO2, 'spo2')}>
                            {v.spO2}%
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(v.status)}`}>
                            {v.status}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {v.recordedBy?.split('(')[0]?.trim() || 'Unknown'}
                        </td>
                        
                        <td className="px-4 py-3 text-center">
                          {v.clinicalNotes && (
                            <div className="flex justify-center">
                              {expandedRow === v.id ? (
                                <ChevronUp size={18} className="text-blue-500 cursor-pointer" onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRow(v.id);
                                }} />
                              ) : (
                                <ChevronDown size={18} className="text-gray-400 cursor-pointer hover:text-blue-500" onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRow(v.id);
                                }} />
                              )}
                            </div>
                          )}
                          {!v.clinicalNotes && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                      
                      {expandedRow === v.id && v.clinicalNotes && (
                        <tr className="bg-gray-50 dark:bg-slate-800/50">
                          <td colSpan={9} className="px-4 py-3">
                            <div className="flex items-start gap-3">
                              <div className="text-lg">📝</div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Clinical Notes</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{v.clinicalNotes}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}