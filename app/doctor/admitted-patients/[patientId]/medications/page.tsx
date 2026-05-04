'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pill, Plus, CheckCircle2, Clock, XCircle, AlertCircle, User, Calendar, Loader2, RefreshCw } from 'lucide-react';
import AdministerMedicationForm from '@/components/doctor/AdministerMedicationForm';
import { nurseApi } from '@/lib/api/nurse';
import toast from 'react-hot-toast';

// Types for Medication Administration
export interface MedicationAdministrationResponse {
  success?: boolean;
  message?: string;
  id?: string | number;
  data?: {
    id: string | number;
    patientId: string;
    medicationName: string;
    dosage: string;
    route: string;
    scheduledTime: string;
    administeredAt?: string;
    administeredBy?: string;
    status?: string;
    notes?: string;
    [key: string]: any;
  };
  error?: string;
  [key: string]: any;
}

export interface AdministerMedicationData {
  medicationName: string;
  dosage: string;
  route: string;
  scheduledTime: string;
  duration?: string;
  frequency?: string;
  notes: string;
  prescribedBy?: string;
  prescribedById?: string;
}

export interface AdministerMedicationProps {
  patientId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function MedicationsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId as string;

  const [administrations, setAdministrations] = useState<any[]>([]);
  const [activePrescriptions, setActivePrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'prescriptions'>('history');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch medication administrations from API
  const fetchAdministrations = useCallback(async () => {
    try {
      const result = await nurseApi.getMedications(patientId);
      
      if (result?.success && result?.data) {
        setAdministrations(result.data);
      } else if (Array.isArray(result)) {
        setAdministrations(result);
      } else {
        setAdministrations([]);
      }
    } catch (err) {
      console.error('Failed to fetch administrations:', err);
    }
  }, [patientId]);

  // Fetch ACTIVE prescriptions from medication_administrations (based on date)
  const fetchActivePrescriptions = useCallback(async () => {
    try {
      // Fetch only active prescriptions (not expired)
      const result = await nurseApi.getMedications(patientId, 'active=true');
      
      if (result?.success && result?.data) {
        // Filter only active ones (isActive = true)
        const active = result.data.filter((a: any) => a.isActive !== false);
        setActivePrescriptions(active);
      } else if (Array.isArray(result)) {
        const active = result.filter((a: any) => a.isActive !== false);
        setActivePrescriptions(active);
      } else {
        // Fallback: fetch all and filter on frontend
        const allResult = await nurseApi.getMedications(patientId);
        if (allResult?.success && allResult?.data) {
          const now = new Date();
          const active = allResult.data.filter((a: any) => {
            if (!a.durationDays) return true; // No duration = ongoing
            if (!a.createdAt) return true;
            const startDate = new Date(a.createdAt);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + (a.durationDays || 0));
            return endDate >= now;
          });
          setActivePrescriptions(active);
        } else {
          setActivePrescriptions([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch active prescriptions:', err);
      setActivePrescriptions([]);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      setLoading(true);
      Promise.all([fetchAdministrations(), fetchActivePrescriptions()])
        .finally(() => setLoading(false));
    }
  }, [patientId, fetchAdministrations, fetchActivePrescriptions]);

  const handleAdminister = async (data: AdministerMedicationData): Promise<void> => {
  try {
    const nurseId = localStorage.getItem('userId') || '';
    const nurseName = localStorage.getItem('userName') || '';

    const result: MedicationAdministrationResponse = await nurseApi.administerMedication({
      patientId,
      medicationName: data.medicationName,
      dosage: data.dosage,
      route: data.route,
      frequency: data.frequency,
      scheduledTime: data.scheduledTime,
      duration: data.duration,
      notes: data.notes,
      nurseId,
      nurseName,
      prescribedBy: data.prescribedBy,
      prescribedById: data.prescribedById,
    });

    console.log('Medication response:', result); // Debug

    // Check for success in multiple possible response formats
    const isSuccess = 
      result?.success === true ||           // Standard format
      !!result?.id ||                        // Direct data return (has id)
      !!result?.data?.id ||                  // Wrapped in data
      (result && !result?.error);            // Any response without error

    if (isSuccess) {
      toast.success('Medication administered successfully!');
      setShowAdminForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      await fetchAdministrations();           // Wait for refresh
      await fetchActivePrescriptions();      // Wait for refresh
    } else {
      toast.error(result?.message || result?.data?.message || 'Failed to administer medication');
    }
  } catch (err: any) {
    console.error('Administer medication error:', err);
    toast.error(err.message || err.response?.data?.message || 'Failed to administer medication');
  }
};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'administered': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      case 'missed': return <XCircle size={16} className="text-red-500" />;
      case 'refused': return <AlertCircle size={16} className="text-orange-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'administered': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'missed': return 'bg-red-100 text-red-700';
      case 'refused': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const administeredCount = administrations.filter((a: any) => a.status === 'administered').length;
  const pendingCount = administrations.filter((a: any) => a.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
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
                <Pill size={20} className="text-purple-500" />
                <h1 className="text-xl font-bold">Medications</h1>
              </div>
              <p className="text-sm text-gray-500">
                {activePrescriptions.length} active • {administeredCount} given • {pendingCount} pending
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { fetchAdministrations(); fetchActivePrescriptions(); }} className="p-2 hover:bg-gray-100 rounded-lg" title="Refresh">
              <RefreshCw size={18} className="text-gray-500" />
            </button>
            <button
              onClick={() => setShowAdminForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Administer Medication
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-green-600" />
            <p className="text-green-700 font-medium">Medication administration recorded successfully!</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          <div className="border-b border-slate-200 dark:border-slate-800 px-4">
            <div className="flex gap-0">
              {[
                { key: 'history' as const, label: 'Administration History' },
                { key: 'prescriptions' as const, label: 'Active Prescriptions' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Administer Medication Form */}
        <AdministerMedicationForm
          isOpen={showAdminForm}
          onClose={() => setShowAdminForm(false)}
          onSubmit={handleAdminister}
          prescriptions={activePrescriptions.map((a: any) => ({
            name: a.medicationName,
            dosage: a.dosage,
            frequency: a.frequency,
            route: a.route,
            status: 'active',
            startDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A',
            prescriber: a.prescribedBy || 'Doctor',
            prescriberId: a.prescribedById || '',
          }))}
          patientName="Patient"
        />

        {/* Administration History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {administrations.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border p-12 text-center">
                <Pill size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No administration records</p>
              </div>
            ) : (
              administrations.map((admin) => (
                <div key={admin.id} className="bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        admin.status === 'administered' ? 'bg-green-50' : 
                        admin.status === 'pending' ? 'bg-yellow-50' : 'bg-red-50'
                      }`}>
                        {getStatusIcon(admin.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{admin.medicationName}</h3>
                        <p className="text-sm text-gray-500">
                          {admin.dosage} • {admin.route}
                          {admin.frequency && ` • ${admin.frequency}`}
                          {admin.durationDays && ` • ${admin.durationDays} days`}
                          {admin.endDate && ` • Ends: ${admin.endDate}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(admin.status)}`}>
                        {admin.status}
                      </span>
                      {admin.isActive === false && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 ml-1">Expired</span>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        <Clock size={12} className="inline mr-1" />
                        {admin.scheduledTime}
                        {admin.administeredTime && ` → ${admin.administeredTime}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t space-y-1 text-xs text-gray-500">
                    {admin.administeredBy && (
                      <p className="flex items-center gap-1"><User size={12} /> Administered by: {admin.administeredBy}</p>
                    )}
                    {admin.prescribedBy && (
                      <p className="flex items-center gap-1"><User size={12} /> Prescribed by: {admin.prescribedBy}</p>
                    )}
                    {admin.notes && <p>📝 {admin.notes}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Active Prescriptions */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-3">
            {activePrescriptions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border p-12 text-center">
                <Pill size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No active prescriptions</p>
              </div>
            ) : (
              activePrescriptions.map((med: any, i: number) => (
                <div key={med.id || i} className="bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Pill size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{med.medicationName}</h3>
                        <p className="text-sm text-gray-500">
                          {med.dosage} • {med.frequency || 'N/A'} • {med.route}
                          {med.durationDays && ` • ${med.durationDays} days`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                      {med.endDate && (
                        <p className="text-xs text-gray-400 mt-1">Ends: {med.endDate}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> Started: {med.createdAt ? new Date(med.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    {med.prescribedBy && (
                      <span className="flex items-center gap-1"><User size={12} /> {med.prescribedBy}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}