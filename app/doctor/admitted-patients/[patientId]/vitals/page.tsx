'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Activity, Clock, Heart, Loader2, RefreshCw } from 'lucide-react';
import { nurseApi } from '@/lib/api/nurse';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical': return 'bg-red-50 border-red-200 text-red-700';
    case 'improving': return 'bg-blue-50 border-blue-200 text-blue-700';
    case 'stable': return 'bg-green-50 border-green-200 text-green-700';
    default: return 'bg-gray-50 border-gray-200 text-gray-700';
  }
};

export default function VitalsHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId as string;

  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch admission vitals (nurse vitals after admission) for last 7 days
      const result = await nurseApi.getVitals(patientId, 168, 'admission');
      
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
    if (patientId) fetchVitals();
  }, [patientId]);

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
      <header className="border-b border-slate-200 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-red-500" />
                <h1 className="text-xl font-bold">Vitals History</h1>
              </div>
              <p className="text-sm text-gray-500">{vitals.length} records</p>
            </div>
          </div>
          <button onClick={fetchVitals} className="p-2 hover:bg-gray-100 rounded-lg">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">{error}</div>
        )}

        {vitals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Activity size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No vitals recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vitals.map((v) => (
              <div key={v.id} className={`p-5 rounded-xl border ${getStatusColor(v.status || 'stable')} bg-white dark:bg-slate-900`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} />
                    <span className="font-medium">{v.timestamp || v.recorded_at}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-white/50">
                    {v.status || 'stable'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">BP</p>
                    <p className="text-lg font-bold">
                      {v.systolic}/{v.diastolic}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">HR</p>
                    <p className="text-lg font-bold">{v.heartRate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Temp</p>
                    <p className="text-lg font-bold">{v.temperature}°C</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">RR</p>
                    <p className="text-lg font-bold">{v.respiratoryRate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">SpO₂</p>
                    <p className="text-lg font-bold">{v.spO2}%</p>
                  </div>
                </div>
                {v.clinicalNotes && (
                  <p className="text-xs text-gray-500 mt-3">📝 {v.clinicalNotes}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">Recorded by: {v.recordedBy}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}