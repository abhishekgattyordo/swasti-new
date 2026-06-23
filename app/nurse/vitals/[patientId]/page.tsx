// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter, useParams, useSearchParams } from 'next/navigation';
// import { Activity, TrendingUp, Heart, Wind, Droplet, Thermometer, Check, Loader2, RefreshCw, Calendar, Clock, ChevronLeft } from 'lucide-react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
// import { nurseApi } from '@/lib/api/nurse';
// import toast from 'react-hot-toast';

// const REFERENCE_RANGES = {
//   systolic: { min: 90, max: 140, normal: '90-140' },
//   diastolic: { min: 60, max: 90, normal: '60-90' },
//   heartRate: { min: 60, max: 100, normal: '60-100' },
//   temperature: { min: 36.1, max: 37.2, normal: '36.1-37.2°C' },
//   respiratoryRate: { min: 12, max: 20, normal: '12-20' },
//   spO2: { min: 95, max: 100, normal: '95-100%' },
// };

// export default function VitalsEntryPage() {
//   const router = useRouter();
//   const params = useParams();
//   const searchParams = useSearchParams();
  
//   const patientId = params?.patientId as string;
//   const patientName = searchParams.get('name') || 'Patient';

//   const [vitalHistory, setVitalHistory] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [viewMode, setViewMode] = useState<'24h' | 'date'>('24h');
//   const [selectedDate, setSelectedDate] = useState<string>('');

//   const [formData, setFormData] = useState({
//     systolic: '', diastolic: '', heartRate: '', temperature: '',
//     respiratoryRate: '', spO2: '', notes: '', status: 'stable',
//   });

//   const fetchVitals = useCallback(async () => {
//     if (!patientId) return;
//     try {
//       setLoading(true);
//       let result;
//       if (viewMode === 'date' && selectedDate) {
//         result = await nurseApi.getVitals(patientId, undefined, undefined, selectedDate);
//       } else {
//         result = await nurseApi.getVitals(patientId, 24);
//       }
      
//       let vitalsData: any[] = [];
//       if (result?.success && result?.data) vitalsData = result.data;
//       else if (Array.isArray(result)) vitalsData = result;
      
//       setVitalHistory(vitalsData.length > 0 ? vitalsData.map((v: any) => ({
//         timestamp: v.timestamp, systolic: v.systolic || 0, diastolic: v.diastolic || 0,
//         heartRate: v.heartRate || 0, temperature: v.temperature || 0,
//         respiratoryRate: v.respiratoryRate || 0, spO2: v.spO2 || 0,
//         clinicalNotes: v.clinicalNotes || '', status: v.status || 'stable', recordedBy: v.recordedBy || '',
//       })) : []);
//     } catch (err) { setVitalHistory([]); }
//     finally { setLoading(false); }
//   }, [patientId, viewMode, selectedDate]);

//   useEffect(() => { fetchVitals(); }, [fetchVitals]);

//   const latestReading = vitalHistory.length > 0 ? vitalHistory[vitalHistory.length - 1] : null;

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setSubmitting(true);
//   try {
//     const nurseId = localStorage.getItem('userId') || '';
//     const nurseName = localStorage.getItem('userName') || '';
    
//     const result = await nurseApi.recordVitals({
//       patientId,
//       systolic: parseFloat(formData.systolic) || 0,
//       diastolic: parseFloat(formData.diastolic) || 0,
//       heartRate: parseFloat(formData.heartRate) || 0,
//       temperature: parseFloat(formData.temperature) || 0,
//       respiratoryRate: parseFloat(formData.respiratoryRate) || 0,
//       spO2: parseFloat(formData.spO2) || 0,
//       clinicalNotes: formData.notes, 
//       status: formData.status as 'stable' | 'critical' | 'improving' | 'deteriorating' | 'normal', 
//       nurseId, 
//       nurseName,
//     });
    
//     console.log('Full API response:', result);
    
//     // ✅ Check for success based on actual response structure
//     // Success if we get back an object with an 'id' (vitals record created)
//     const isSuccess = result && (result.id || result.success === true);
    
//     if (isSuccess) {
//       await fetchVitals(); // Refresh the vitals list
//       setFormData({ 
//         systolic: '', diastolic: '', heartRate: '', temperature: '', 
//         respiratoryRate: '', spO2: '', notes: '', status: 'stable' 
//       });
//       setSubmitted(true); 
//       setTimeout(() => setSubmitted(false), 3000);
//       toast.success('Vitals recorded successfully!');
//     } else {
//       // Check if there's an error message in the response
//       const errorMsg = result?.message || 'Failed to record vitals';
//       toast.error(errorMsg);
//     }
//   } catch (err: any) { 
//     console.error('Error recording vitals:', err);
//     toast.error(err.message || 'Failed to record vitals'); 
//   } finally { 
//     setSubmitting(false); 
//   }
// };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-950 dark:to-slate-900">
//       <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
//               <ChevronLeft size={20} />
//             </button>
//             <div>
//               <h1 className="text-xl font-bold text-gray-900 dark:text-white">{patientName}</h1>
//               <p className="text-sm text-gray-500">Vitals Entry & Monitoring</p>
//             </div>
//           </div>
//           <button onClick={fetchVitals} className="p-2 hover:bg-gray-100 rounded-lg">
//             <RefreshCw size={18} className="text-gray-500" />
//           </button>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
//         {submitted && (
//           <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
//             <Check size={20} className="text-green-600" />
//             <p className="text-green-700 font-medium">Vitals recorded successfully!</p>
//           </div>
//         )}

//         {/* Date Filter */}
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
//             <button onClick={() => { setViewMode('24h'); setSelectedDate(''); }}
//               className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === '24h' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
//               <Clock size={14} className="inline mr-1" />Last 24h
//             </button>
//             <button onClick={() => setViewMode('date')}
//               className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'date' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
//               <Calendar size={14} className="inline mr-1" />By Date
//             </button>
//           </div>
//           {viewMode === 'date' && (
//             <div className="flex items-center gap-2">
//               <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
//                 max={new Date().toISOString().split('T')[0]}
//                 className="px-3 py-1.5 border rounded-lg bg-white text-sm" />
//               <button onClick={fetchVitals} disabled={!selectedDate}
//                 className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Fetch</button>
//             </div>
//           )}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Entry Form */}
//           <div className="lg:col-span-1">
//             <div className="bg-white dark:bg-slate-900 rounded-lg border p-6 shadow-sm sticky top-24">
//               <h2 className="text-lg font-semibold mb-4">Record Vitals</h2>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium flex items-center gap-2"><Heart size={16} className="text-red-600" />BP (mmHg)</label>
//                   <div className="flex gap-2">
//                     <input type="number" name="systolic" placeholder="Systolic" value={formData.systolic} onChange={(e) => setFormData(prev => ({ ...prev, systolic: e.target.value }))} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
//                     <span className="py-2">/</span>
//                     <input type="number" name="diastolic" placeholder="Diastolic" value={formData.diastolic} onChange={(e) => setFormData(prev => ({ ...prev, diastolic: e.target.value }))} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
//                   </div>
//                   <p className="text-xs text-gray-500">Normal: {REFERENCE_RANGES.systolic.normal}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium flex items-center gap-2"><Heart size={16} className="text-pink-600" />Heart Rate (bpm)</label>
//                   <input type="number" name="heartRate" value={formData.heartRate} onChange={(e) => setFormData(prev => ({ ...prev, heartRate: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
//                   <p className="text-xs text-gray-500">Normal: {REFERENCE_RANGES.heartRate.normal}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium flex items-center gap-2"><Thermometer size={16} className="text-orange-600" />Temp (°C)</label>
//                   <input type="number" name="temperature" value={formData.temperature} onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
//                   <p className="text-xs text-gray-500">Normal: {REFERENCE_RANGES.temperature.normal}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium flex items-center gap-2"><Wind size={16} className="text-blue-600" />Resp Rate</label>
//                   <input type="number" name="respiratoryRate" value={formData.respiratoryRate} onChange={(e) => setFormData(prev => ({ ...prev, respiratoryRate: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
//                   <p className="text-xs text-gray-500">Normal: {REFERENCE_RANGES.respiratoryRate.normal}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium flex items-center gap-2"><Droplet size={16} className="text-cyan-600" />SpO₂ (%)</label>
//                   <input type="number" name="spO2" value={formData.spO2} onChange={(e) => setFormData(prev => ({ ...prev, spO2: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
//                   <p className="text-xs text-gray-500">Normal: {REFERENCE_RANGES.spO2.normal}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Status</label>
//                   <select name="status" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm">
//                     <option value="stable">Stable</option><option value="improving">Improving</option>
//                     <option value="deteriorating">Deteriorating</option><option value="critical">Critical</option>
//                     <option value="normal">Normal</option>
//                   </select>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Clinical Notes</label>
//                   <textarea name="notes" value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none" />
//                 </div>
//                 <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
//                   {submitting ? <><Loader2 size={16} className="animate-spin" />Saving...</> : 'Save Vitals'}
//                 </button>
//               </form>
//             </div>
//           </div>

//           {/* Charts */}
//           <div className="lg:col-span-2 space-y-6">
//             {latestReading ? (
//               <div className="bg-white dark:bg-slate-900 rounded-lg border p-6 shadow-sm">
//                 <h2 className="text-lg font-semibold mb-4">Latest Readings</h2>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                   {[
//                     { label: 'BP', value: `${latestReading.systolic}/${latestReading.diastolic}`, unit: 'mmHg', bg: 'from-red-50 to-red-100', border: 'border-red-200' },
//                     { label: 'HR', value: latestReading.heartRate, unit: 'bpm', bg: 'from-pink-50 to-pink-100', border: 'border-pink-200' },
//                     { label: 'Temp', value: latestReading.temperature, unit: '°C', bg: 'from-orange-50 to-orange-100', border: 'border-orange-200' },
//                     { label: 'Resp', value: latestReading.respiratoryRate, unit: 'b/min', bg: 'from-blue-50 to-blue-100', border: 'border-blue-200' },
//                     { label: 'SpO₂', value: latestReading.spO2, unit: '%', bg: 'from-cyan-50 to-cyan-100', border: 'border-cyan-200' },
//                   ].map((card, i) => (
//                     <div key={i} className={`p-4 bg-gradient-to-br ${card.bg} rounded-lg border ${card.border}`}>
//                       <p className="text-xs text-gray-500 mb-1">{card.label}</p>
//                       <p className="text-2xl font-bold">{card.value}</p>
//                       <p className="text-xs text-gray-500 mt-1">{card.unit}</p>
//                     </div>
//                   ))}
//                 </div>
//                 {latestReading.clinicalNotes && (
//                   <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//                     <p className="text-xs text-gray-500">Notes: {latestReading.clinicalNotes}</p>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="bg-white dark:bg-slate-900 rounded-lg border p-12 text-center">
//                 <Activity size={48} className="mx-auto text-gray-400 mb-4" />
//                 <p className="text-gray-500">No vitals recorded yet</p>
//               </div>
//             )}

//             {vitalHistory.length > 0 && (
//               <div className="bg-white dark:bg-slate-900 rounded-lg border p-6 shadow-sm">
//                 <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
//                   <TrendingUp size={20} className="text-blue-600" />
//                   {viewMode === 'date' && selectedDate ? `Vitals for ${selectedDate}` : '24-Hour Trends'}
//                   <span className="text-sm font-normal text-gray-500">({vitalHistory.length} readings)</span>
//                 </h2>
//                 <div className="mb-8">
//                   <h3 className="text-sm font-semibold mb-4">Heart Rate (bpm)</h3>
//                   <ResponsiveContainer width="100%" height={200}>
//                     <LineChart data={vitalHistory}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="timestamp" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Line type="monotone" dataKey="heartRate" stroke="#ec4899" dot={false} /></LineChart>
//                   </ResponsiveContainer>
//                 </div>
//                 <div className="mb-8">
//                   <h3 className="text-sm font-semibold mb-4">Blood Pressure (mmHg)</h3>
//                   <ResponsiveContainer width="100%" height={200}>
//                     <ComposedChart data={vitalHistory}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="timestamp" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Legend /><Bar dataKey="systolic" fill="#dc2626" /><Line type="monotone" dataKey="diastolic" stroke="#059669" /></ComposedChart>
//                   </ResponsiveContainer>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-semibold mb-4">SpO₂ (%) & Temperature (°C)</h3>
//                   <ResponsiveContainer width="100%" height={200}>
//                     <LineChart data={vitalHistory}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="timestamp" stroke="#94a3b8" /><YAxis stroke="#94a3b8" yAxisId="left" /><YAxis stroke="#94a3b8" yAxisId="right" orientation="right" /><Tooltip /><Legend /><Line yAxisId="left" type="monotone" dataKey="spO2" stroke="#06b6d4" name="SpO₂ %" /><Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#f59e0b" name="Temp (°C)" /></LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }



'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { 
  Activity, TrendingUp, Heart, Wind, Droplet, Thermometer, Check, 
  Loader2, RefreshCw, Calendar, Clock, ChevronLeft, Mic, MicOff, 
  Sparkles, Trash2, Volume2 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { nurseApi } from '@/lib/api/nurse';
import { LiveTranscriptionSession, mapMicLocale } from '@/lib/speech';
import toast from 'react-hot-toast';

const REFERENCE_RANGES = {
  systolic: { min: 90, max: 140, normal: '90-140' },
  diastolic: { min: 60, max: 90, normal: '60-90' },
  heartRate: { min: 60, max: 100, normal: '60-100' },
  temperature: { min: 36.1, max: 37.2, normal: '36.1-37.2°C' },
  respiratoryRate: { min: 12, max: 20, normal: '12-20' },
  spO2: { min: 95, max: 100, normal: '95-100%' },
};

export default function VitalsEntryPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const patientId = params?.patientId as string;
  const patientName = searchParams.get('name') || 'Patient';

  const [vitalHistory, setVitalHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState<'24h' | 'date'>('24h');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [formData, setFormData] = useState({
    systolic: '', diastolic: '', heartRate: '', temperature: '',
    respiratoryRate: '', spO2: '', notes: '', status: 'stable',
  });

  // --- AI Voice Dictation States ---
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [micLanguage, setMicLanguage] = useState('en-IN');
  const [highlightedFields, setHighlightedFields] = useState<Record<string, boolean>>({});
  const liveSessionRef = useRef<LiveTranscriptionSession | null>(null);

  useEffect(() => {
    return () => {
      liveSessionRef.current?.cancel();
    };
  }, []);

  const handleMicToggle = async () => {
    if (isListening) {
      const session = liveSessionRef.current;
      if (session) {
        try {
          const state = await session.stop();
          setSpokenText(state.fullText);
          setInterimText('');
          toast.success('Stopped listening. Click "Parse with AI" to extract values.');
        } catch (err) {
          console.error('Stop error:', err);
        }
      }
      liveSessionRef.current = null;
      setIsListening(false);
      return;
    }

    liveSessionRef.current?.cancel();
    setSpokenText('');
    setInterimText('');

    const session = new LiveTranscriptionSession();
    liveSessionRef.current = session;

    try {
      await session.start(
        (state) => {
          setSpokenText(state.fullText);
          setInterimText(state.interimText);
        },
        { language: mapMicLocale(micLanguage) }
      );
      setIsListening(true);
      toast.success('Listening... Speak vitals clearly.');
    } catch (err) {
      liveSessionRef.current = null;
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      if (
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
      ) {
        toast.error('Microphone permission denied. Use presets or type manually.');
      } else {
        toast.error(message);
      }
    }
  };

  const extractVitalsWithAI = async (transcript: string) => {
    const response = await fetch('/api/nurse/vitals/ai-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to extract vitals');
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data;
  };

  const handleExtractWithAI = async () => {
    if (!spokenText.trim()) {
      toast.error('Please speak or type some text first.');
      return;
    }
    setIsParsing(true);
    try {
      const data = await extractVitalsWithAI(spokenText);
      const updated: Partial<typeof formData> = {};
      const tracks: Record<string, boolean> = {};

      if (data.systolic) { updated.systolic = String(data.systolic); tracks.systolic = true; }
      if (data.diastolic) { updated.diastolic = String(data.diastolic); tracks.diastolic = true; }
      if (data.heartRate) { updated.heartRate = String(data.heartRate); tracks.heartRate = true; }
      if (data.temperature) { updated.temperature = String(Number(data.temperature).toFixed(1)); tracks.temperature = true; }
      if (data.respiratoryRate) { updated.respiratoryRate = String(data.respiratoryRate); tracks.respiratoryRate = true; }
      if (data.spO2) { updated.spO2 = String(data.spO2); tracks.spO2 = true; }
      if (data.clinicalNotes) { updated.notes = data.clinicalNotes; tracks.notes = true; }
      if (data.status) { updated.status = data.status; tracks.status = true; }

      setFormData(prev => ({ ...prev, ...updated }));
      setHighlightedFields(tracks);
      toast.success('AI extracted values! Review and save.');
      setTimeout(() => setHighlightedFields({}), 4000);
    } catch (err: any) {
      toast.error(err.message || 'AI extraction failed.');
    } finally {
      setIsParsing(false);
    }
  };

  // Helper for glowing fields
  const getHighlightClass = (field: string) => {
    return highlightedFields[field] ? 'ring-2 ring-emerald-500 border-emerald-500' : '';
  };

  // Preset dictations for quick testing
  const PRESET_DICTATIONS = [
    { label: 'Post‑Op Stable', text: 'Blood pressure 118 over 75, pulse 68, respiration 14, temperature 36.8 Celsius, oxygen 99%. Patient comfortable.' },
    { label: 'High Fever', text: 'BP 142/95, heart rate 112, respiratory rate 24, oxygen 91%, temperature 101.4 Fahrenheit. Request urgent consult.' },
    { label: 'Normal Breathing', text: 'BP 115/72, heart rate 65, respiration 12, temperature 36.5 Celsius, oxygen 99%. Asthma stable.' },
  ];

  // --- Existing fetch and submit handlers (unchanged) ---
  const fetchVitals = useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      let result;
      if (viewMode === 'date' && selectedDate) {
        result = await nurseApi.getVitals(patientId, undefined, undefined, selectedDate);
      } else {
        result = await nurseApi.getVitals(patientId, 24);
      }
      
      let vitalsData: any[] = [];
      if (result?.success && result?.data) vitalsData = result.data;
      else if (Array.isArray(result)) vitalsData = result;
      
      setVitalHistory(vitalsData.length > 0 ? vitalsData.map((v: any) => ({
        timestamp: v.timestamp, systolic: v.systolic || 0, diastolic: v.diastolic || 0,
        heartRate: v.heartRate || 0, temperature: v.temperature || 0,
        respiratoryRate: v.respiratoryRate || 0, spO2: v.spO2 || 0,
        clinicalNotes: v.clinicalNotes || '', status: v.status || 'stable', recordedBy: v.recordedBy || '',
      })) : []);
    } catch (err) { setVitalHistory([]); }
    finally { setLoading(false); }
  }, [patientId, viewMode, selectedDate]);

  useEffect(() => { fetchVitals(); }, [fetchVitals]);

  const latestReading = vitalHistory.length > 0 ? vitalHistory[vitalHistory.length - 1] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const nurseId = localStorage.getItem('userId') || '';
      const nurseName = localStorage.getItem('userName') || '';
      
      const result = await nurseApi.recordVitals({
        patientId,
        systolic: parseFloat(formData.systolic) || 0,
        diastolic: parseFloat(formData.diastolic) || 0,
        heartRate: parseFloat(formData.heartRate) || 0,
        temperature: parseFloat(formData.temperature) || 0,
        respiratoryRate: parseFloat(formData.respiratoryRate) || 0,
        spO2: parseFloat(formData.spO2) || 0,
        clinicalNotes: formData.notes, 
        status: formData.status as any, 
        nurseId, 
        nurseName,
      });
      
      const isSuccess = result && (result.id || result.success === true);
      if (isSuccess) {
        await fetchVitals();
        setFormData({ 
          systolic: '', diastolic: '', heartRate: '', temperature: '', 
          respiratoryRate: '', spO2: '', notes: '', status: 'stable' 
        });
        setSubmitted(true); 
        setTimeout(() => setSubmitted(false), 3000);
        toast.success('Vitals recorded successfully!');
      } else {
        toast.error(result?.message || 'Failed to record vitals');
      }
    } catch (err: any) { 
      toast.error(err.message || 'Failed to record vitals'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{patientName}</h1>
              <p className="text-sm text-gray-500">Vitals Entry & Monitoring</p>
            </div>
          </div>
          <button onClick={fetchVitals} className="p-2 hover:bg-gray-100 rounded-lg">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check size={20} className="text-green-600" />
            <p className="text-green-700 font-medium">Vitals recorded successfully!</p>
          </div>
        )}

        {/* Date Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button onClick={() => { setViewMode('24h'); setSelectedDate(''); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === '24h' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
              <Clock size={14} className="inline mr-1" />Last 24h
            </button>
            <button onClick={() => setViewMode('date')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'date' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
              <Calendar size={14} className="inline mr-1" />By Date
            </button>
          </div>
          {viewMode === 'date' && (
            <div className="flex items-center gap-2">
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="px-3 py-1.5 border rounded-lg bg-white text-sm" />
              <button onClick={fetchVitals} disabled={!selectedDate}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Fetch</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Voice + Manual Form */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Voice Card */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-600" />
                  <h2 className="text-sm font-semibold">AI Voice Entry</h2>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={micLanguage}
                    onChange={(e) => setMicLanguage(e.target.value)}
                    disabled={isListening}
                    className="text-xs border rounded-lg px-2 py-1 bg-white"
                  >
                    <option value="en-IN">English</option>
                    <option value="kn-IN">Kannada</option>
                    <option value="hi-IN">Hindi</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => void handleMicToggle()}
                    className={`p-2 rounded-full transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-100 text-blue-600'}`}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                </div>
              </div>
              <textarea
                value={spokenText}
                onChange={(e) => setSpokenText(e.target.value)}
                placeholder="Speak or type vitals: 'BP 120 over 80, heart rate 72, temperature 36.8...'"
                className="w-full p-3 border rounded-lg text-sm h-24 resize-none"
              />
              {isListening && interimText && (
                <p className="text-xs text-blue-600 italic mt-1">{interimText}</p>
              )}
              <div className="flex justify-between mt-3 gap-2">
                <button
                  onClick={() => setSpokenText('')}
                  className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-50"
                >
                  <Trash2 size={12} className="inline mr-1" /> Clear
                </button>
                <button
                  onClick={handleExtractWithAI}
                  disabled={isParsing || !spokenText.trim()}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs disabled:opacity-50 flex items-center gap-1"
                >
                  {isParsing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {isParsing ? 'Parsing...' : 'Parse with AI'}
                </button>
              </div>
              {/* Presets */}
              <div className="mt-4 pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Volume2 size={12} /> Quick Presets</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_DICTATIONS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSpokenText(preset.text)}
                      className="px-2 py-1 text-xs bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Entry Form */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Record Vitals</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Heart size={16} className="text-red-600" />BP (mmHg)</label>
                  <div className="flex gap-2">
                    <input type="number" name="systolic" placeholder="Systolic" value={formData.systolic} onChange={(e) => setFormData(prev => ({ ...prev, systolic: e.target.value }))} className={`flex-1 px-3 py-2 border rounded-lg text-sm ${getHighlightClass('systolic')}`} />
                    <span className="py-2">/</span>
                    <input type="number" name="diastolic" placeholder="Diastolic" value={formData.diastolic} onChange={(e) => setFormData(prev => ({ ...prev, diastolic: e.target.value }))} className={`flex-1 px-3 py-2 border rounded-lg text-sm ${getHighlightClass('diastolic')}`} />
                  </div>
                  <p className="text-xs text-gray-500">Normal: {REFERENCE_RANGES.systolic.normal}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Heart size={16} className="text-pink-600" />Heart Rate (bpm)</label>
                  <input type="number" name="heartRate" value={formData.heartRate} onChange={(e) => setFormData(prev => ({ ...prev, heartRate: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg text-sm ${getHighlightClass('heartRate')}`} />
                  <p className="text-xs text-gray-500">Normal: {REFERENCE_RANGES.heartRate.normal}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Thermometer size={16} className="text-orange-600" />Temp (°C)</label>
                  <input type="number" name="temperature" value={formData.temperature} onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg text-sm ${getHighlightClass('temperature')}`} />
                  <p className="text-xs text-gray-500">Normal: {REFERENCE_RANGES.temperature.normal}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Wind size={16} className="text-blue-600" />Resp Rate</label>
                  <input type="number" name="respiratoryRate" value={formData.respiratoryRate} onChange={(e) => setFormData(prev => ({ ...prev, respiratoryRate: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg text-sm ${getHighlightClass('respiratoryRate')}`} />
                  <p className="text-xs text-gray-500">Normal: {REFERENCE_RANGES.respiratoryRate.normal}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Droplet size={16} className="text-cyan-600" />SpO₂ (%)</label>
                  <input type="number" name="spO2" value={formData.spO2} onChange={(e) => setFormData(prev => ({ ...prev, spO2: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg text-sm ${getHighlightClass('spO2')}`} />
                  <p className="text-xs text-gray-500">Normal: {REFERENCE_RANGES.spO2.normal}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select name="status" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg text-sm ${getHighlightClass('status')}`}>
                    <option value="stable">Stable</option><option value="improving">Improving</option>
                    <option value="deteriorating">Deteriorating</option><option value="critical">Critical</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Clinical Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none ${getHighlightClass('notes')}`} />
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 size={16} className="animate-spin" />Saving...</> : 'Save Vitals'}
                </button>
              </form>
            </div>
          </div>

          {/* Charts & History (unchanged) */}
          <div className="lg:col-span-2 space-y-6">
            {latestReading ? (
              <div className="bg-white dark:bg-slate-900 rounded-lg border p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Latest Readings</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'BP', value: `${latestReading.systolic}/${latestReading.diastolic}`, unit: 'mmHg', bg: 'from-red-50 to-red-100', border: 'border-red-200' },
                    { label: 'HR', value: latestReading.heartRate, unit: 'bpm', bg: 'from-pink-50 to-pink-100', border: 'border-pink-200' },
                    { label: 'Temp', value: latestReading.temperature, unit: '°C', bg: 'from-orange-50 to-orange-100', border: 'border-orange-200' },
                    { label: 'Resp', value: latestReading.respiratoryRate, unit: 'b/min', bg: 'from-blue-50 to-blue-100', border: 'border-blue-200' },
                    { label: 'SpO₂', value: latestReading.spO2, unit: '%', bg: 'from-cyan-50 to-cyan-100', border: 'border-cyan-200' },
                  ].map((card, i) => (
                    <div key={i} className={`p-4 bg-gradient-to-br ${card.bg} rounded-lg border ${card.border}`}>
                      <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                      <p className="text-2xl font-bold">{card.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{card.unit}</p>
                    </div>
                  ))}
                </div>
                {latestReading.clinicalNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Notes: {latestReading.clinicalNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-lg border p-12 text-center">
                <Activity size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No vitals recorded yet</p>
              </div>
            )}

            {vitalHistory.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border p-6 shadow-sm">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <TrendingUp size={20} className="text-blue-600" />
                  {viewMode === 'date' && selectedDate ? `Vitals for ${selectedDate}` : '24-Hour Trends'}
                  <span className="text-sm font-normal text-gray-500">({vitalHistory.length} readings)</span>
                </h2>
                <div className="mb-8">
                  <h3 className="text-sm font-semibold mb-4">Heart Rate (bpm)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={vitalHistory}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="timestamp" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Line type="monotone" dataKey="heartRate" stroke="#ec4899" dot={false} /></LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mb-8">
                  <h3 className="text-sm font-semibold mb-4">Blood Pressure (mmHg)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={vitalHistory}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="timestamp" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Legend /><Bar dataKey="systolic" fill="#dc2626" /><Line type="monotone" dataKey="diastolic" stroke="#059669" /></ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-4">SpO₂ (%) & Temperature (°C)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={vitalHistory}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="timestamp" stroke="#94a3b8" /><YAxis stroke="#94a3b8" yAxisId="left" /><YAxis stroke="#94a3b8" yAxisId="right" orientation="right" /><Tooltip /><Legend /><Line yAxisId="left" type="monotone" dataKey="spO2" stroke="#06b6d4" name="SpO₂ %" /><Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#f59e0b" name="Temp (°C)" /></LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}