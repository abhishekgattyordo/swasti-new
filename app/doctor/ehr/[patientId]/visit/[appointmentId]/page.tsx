"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Types (copy from your layout)
interface Vital {
  id: number;
  date: string;
  time: string;
  bp: string;
  hr: number;
  temp: number;
  weight: number;
  rr: number;
  spo2: number;
  recordedBy: string;
}

interface Medication {
  id: number;
  name: string;
  category: string;
  dosage: string;
  duration: string;
  color: string;
}

export default function PastVisitPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const [vitals, setVitals] = useState<Vital[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitInfo, setVisitInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch appointment details (includes doctor, date, type, notes)
        const aptRes = await fetch(`/api/appointments/${appointmentId}`);
        const aptData = await aptRes.json();
        if (aptData.success) {
          setVisitInfo(aptData.data);
        }

        // Fetch vitals recorded during this appointment
        const vitalsRes = await fetch(`/api/appointments/${appointmentId}/vitals`);
        const vitalsData = await vitalsRes.json();
        if (vitalsData.success) {
          setVitals(vitalsData.data);
        }

        // Fetch prescriptions given during this appointment
        const medsRes = await fetch(`/api/appointments/${appointmentId}/prescriptions`);
        const medsData = await medsRes.json();
        if (medsData.success) {
          setMedications(medsData.data);
        }
      } catch {
        setError("Failed to load visit details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#137fec] border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading visit details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Visit on {visitInfo?.date ? new Date(visitInfo.date).toLocaleDateString() : "Unknown"}
          </h1>
        </div>

        <div className="space-y-6">
          {/* Doctor info and type */}
          {visitInfo && (
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <p className="text-sm text-slate-600">Doctor: {visitInfo.doctor_name}</p>
              <p className="text-sm text-slate-600">Type: {visitInfo.consultation_type}</p>
              {visitInfo.notes && (
                <p className="text-sm text-slate-600 mt-2">Notes: {visitInfo.notes}</p>
              )}
            </div>
          )}

          {/* Vitals section – reuse your vitals UI */}
          <section className="bg-white rounded-xl p-5 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Vitals</h2>
            {vitals.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {vitals.map((v) => (
                  <div key={v.id} className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">BP</p>
                    <p className="text-lg font-bold text-slate-900">{v.bp}</p>
                    <p className="text-[10px] text-slate-400">mmHg</p>
                  </div>
                  // ... add other vital fields (HR, temp, etc.) similarly
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No vitals recorded for this visit.</p>
            )}
          </section>

          {/* Prescriptions section – reuse your prescriptions UI */}
          <section className="bg-white rounded-xl p-5 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Prescriptions</h2>
            {medications.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Medication</th>
                      <th className="px-4 py-2 text-left">Dosage</th>
                      <th className="px-4 py-2 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medications.map((med) => (
                      <tr key={med.id}>
                        <td className="px-4 py-2 font-medium">{med.name}</td>
                        <td className="px-4 py-2">{med.dosage}</td>
                        <td className="px-4 py-2">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500">No prescriptions for this visit.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}