'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Pill, Clock, CheckCircle2, AlertCircle, XCircle, Plus, Search, Calendar, RefreshCw, Loader2, User, Zap, Flame } from 'lucide-react';
import AdministerMedicationForm from '@/components/doctor/AdministerMedicationForm';
import { nurseApi } from '@/lib/api/nurse';
import toast from 'react-hot-toast';

export default function PatientMedicationsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const patientId = params?.patientId as string;
  const patientName = searchParams.get('name') || 'Patient';

  const [administrations, setAdministrations] = useState<any[]>([]);
  const [activePrescriptions, setActivePrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'today' | 'history' | 'prescriptions'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'administered' | 'missed' | 'refused'>('all');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showAdminNotes, setShowAdminNotes] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const fetchAdministrations = useCallback(async () => {
    if (!patientId) return;
    try {
      const result = await nurseApi.getMedications(patientId);
      if (result?.success && result?.data) setAdministrations(result.data);
      else if (Array.isArray(result)) setAdministrations(result);
      else if (result?.data && Array.isArray(result.data)) setAdministrations(result.data);
      else setAdministrations([]);
    } catch (err) { console.error('Failed to fetch administrations:', err); }
  }, [patientId]);

  const fetchActivePrescriptions = useCallback(async () => {
    if (!patientId) return;
    try {
      const response = await fetch(`/api/nurse/medications?patientId=${patientId}&active=true`);
      const result = await response.json();
      if (result?.success && result?.data) setActivePrescriptions(result.data.filter((a: any) => a.isActive !== false));
      else if (Array.isArray(result)) setActivePrescriptions(result.filter((a: any) => a.isActive !== false));
      else setActivePrescriptions([]);
    } catch (err) { console.error('Failed to fetch active prescriptions:', err); }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      setLoading(true);
      const timeout = setTimeout(() => setLoading(false), 10000);
      Promise.all([fetchAdministrations(), fetchActivePrescriptions()])
        .finally(() => { setLoading(false); clearTimeout(timeout); });
      return () => clearTimeout(timeout);
    }
  }, [patientId, fetchAdministrations, fetchActivePrescriptions]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => { fetchAdministrations(); fetchActivePrescriptions(); setLastRefresh(new Date()); }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAdministrations, fetchActivePrescriptions]);

  const handleManualRefresh = () => { fetchAdministrations(); fetchActivePrescriptions(); setLastRefresh(new Date()); toast.success('Refreshed!'); };
  const dismissAlert = (adminId: string) => setDismissedAlerts(prev => new Set([...prev, adminId]));

  const statMeds = administrations.filter(a => a.frequency === 'STAT' && a.status === 'pending' && !dismissedAlerts.has(a.id));
  const prnMeds = administrations.filter(a => a.frequency === 'SOS' && a.status === 'pending' && !dismissedAlerts.has(a.id));

  // New medication via modal - creates with pending status
  const handleAdminister = async (data: any) => {
    try {
      const nurseId = localStorage.getItem('userId') || '';
      const nurseName = localStorage.getItem('userName') || '';
      const result = await nurseApi.administerMedication({ patientId, ...data, status: 'pending', nurseId, nurseName });
      if (result?.success) { toast.success('Medication added!'); setShowAdminForm(false); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); fetchAdministrations(); fetchActivePrescriptions(); }
      else toast.error(result?.message || 'Failed');
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  // ✅ UPDATE existing record - mark as administered
  const handleGiveMedication = async (adminId: string) => {
    try {
      const nurseId = localStorage.getItem('userId') || '';
      const nurseName = localStorage.getItem('userName') || '';
      const result = await nurseApi.updateMedicationStatus({ id: adminId, status: 'administered', notes: adminNotes, nurseId, nurseName });
      if (result?.success) { toast.success('Medication administered!'); setShowAdminNotes(null); setAdminNotes(''); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); fetchAdministrations(); fetchActivePrescriptions(); }
      else toast.error(result?.message || 'Failed');
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  // ✅ UPDATE existing record - mark as refused
  const handleRefuseMedication = async (adminId: string) => {
    try {
      const nurseId = localStorage.getItem('userId') || '';
      const nurseName = localStorage.getItem('userName') || '';
      const result = await nurseApi.updateMedicationStatus({ id: adminId, status: 'refused', notes: `REFUSED: ${adminNotes}`, nurseId, nurseName });
      if (result?.success) { toast.success('Refusal recorded!'); setShowAdminNotes(null); setAdminNotes(''); fetchAdministrations(); }
      else toast.error(result?.message || 'Failed');
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  const filteredAdministrations = administrations.filter(adm => {
    const mS = (adm.medicationName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const mSt = selectedStatus === 'all' || adm.status === selectedStatus;
    return mS && mSt;
  });

  const getStatusBadge = (status: string) => {
    switch (status) { case 'administered': return 'bg-green-100 text-green-700 border border-green-200'; case 'pending': return 'bg-yellow-100 text-yellow-700 border border-yellow-200'; case 'missed': return 'bg-red-100 text-red-700 border border-red-200'; case 'refused': return 'bg-orange-100 text-orange-700 border border-orange-200'; default: return 'bg-slate-100 text-slate-700'; }
  };
  const getStatusIcon = (status: string) => {
    switch (status) { case 'administered': return <CheckCircle2 size={16} className="text-green-500" />; case 'pending': return <Clock size={16} className="text-yellow-500" />; case 'missed': return <XCircle size={16} className="text-red-500" />; case 'refused': return <AlertCircle size={16} className="text-orange-500" />; default: return null; }
  };

  const pendingCount = administrations.filter(a => a.status === 'pending').length;
  const administeredCount = administrations.filter(a => a.status === 'administered').length;
  const missedCount = administrations.filter(a => a.status === 'missed' || a.status === 'refused').length;

  if (loading) {
    return (<div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center"><div className="text-center"><Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" /><p className="mt-2 text-gray-500">Loading medications...</p></div></div>);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/nurse/medications')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
            <div><div className="flex items-center gap-2"><Pill size={20} className="text-purple-500" /><h1 className="text-xl font-bold">{patientName}</h1></div><p className="text-sm text-gray-500">{activePrescriptions.length} active • {administeredCount} given • {pendingCount} pending</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleManualRefresh} className="p-2 hover:bg-gray-100 rounded-lg"><RefreshCw size={18} className="text-gray-500" /></button>
            <button onClick={() => setShowAdminForm(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"><Plus size={16} /> Add Medication</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {submitted && (<div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"><CheckCircle2 size={20} className="text-green-600" /><p className="text-green-700 font-medium">Medication recorded successfully!</p></div>)}

        {(statMeds.length > 0 || prnMeds.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {statMeds.length > 0 && (<div className="animate-pulse bg-gradient-to-r from-red-600 to-red-700 border-l-4 border-red-900 rounded-lg p-4 shadow-lg"><div className="flex items-start gap-3"><Flame size={24} className="text-red-100 animate-bounce flex-shrink-0 mt-1" /><div className="flex-1"><h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Zap size={18} />STAT ORDERS - URGENT</h3><p className="text-red-100 text-xs mb-2">{statMeds.length} medication requires immediate action</p>{statMeds.slice(0, 2).map(med => (<div key={med.id} className="bg-red-500/30 backdrop-blur rounded p-2 flex items-center justify-between"><div><p className="font-bold text-white text-xs">{med.medicationName} {med.dosage}</p></div><button onClick={() => dismissAlert(med.id)} className="text-red-200 hover:text-white text-xs">Dismiss</button></div>))}</div></div></div>)}
            {prnMeds.length > 0 && (<div className="bg-gradient-to-r from-orange-500 to-orange-600 border-l-4 border-orange-800 rounded-lg p-4 shadow-lg"><div className="flex items-start gap-3"><AlertCircle size={24} className="text-orange-100 flex-shrink-0 mt-1" /><div className="flex-1"><h3 className="text-lg font-bold text-white mb-1">PRN ORDERS</h3><p className="text-orange-100 text-xs mb-2">{prnMeds.length} as-needed medication available</p>{prnMeds.slice(0, 2).map(med => (<div key={med.id} className="bg-orange-400/30 backdrop-blur rounded p-2 flex items-center justify-between"><div><p className="font-bold text-white text-xs">{med.medicationName} {med.dosage}</p></div><button onClick={() => dismissAlert(med.id)} className="text-orange-200 hover:text-white text-xs">Dismiss</button></div>))}</div></div></div>)}
          </div>
        )}

        {/* <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4"><div className="flex items-center gap-2"><Clock size={16} className="text-gray-600" /><span className="text-sm text-gray-600">Last updated: {lastRefresh.toLocaleTimeString()}</span></div><div className="flex items-center gap-2"><input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="w-4 h-4" /><label className="text-sm text-gray-600 cursor-pointer">Auto-refresh every 30s</label></div></div>
          <button onClick={handleManualRefresh} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"><RefreshCw size={16} /> Refresh Now</button>
        </div> */}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm"><p className="text-2xl font-bold text-yellow-600">{pendingCount}</p><p className="text-xs text-gray-500">Pending</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm"><p className="text-2xl font-bold text-green-600">{administeredCount}</p><p className="text-xs text-gray-500">Administered</p></div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm"><p className="text-2xl font-bold text-red-600">{missedCount}</p><p className="text-xs text-gray-500">Missed/Refused</p></div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm">
          <div className="flex gap-2">
            {(['today', 'history', 'prescriptions'] as const).map(tab => (<button key={tab} onClick={() => setViewType(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewType === tab ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'}`}>{tab === 'today' && "Today's Schedule"}{tab === 'history' && 'History'}{tab === 'prescriptions' && 'Active Rx'}</button>))}
          </div>
        </div>

        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1 relative"><Search size={18} className="absolute left-3 top-2.5 text-gray-400" /><input type="text" placeholder="Search medications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-sm" /></div>
          <div className="flex gap-2">{(['all', 'pending', 'administered', 'missed', 'refused'] as const).map(status => (<button key={status} onClick={() => setSelectedStatus(status)} className={`px-3 py-2 rounded-lg text-sm font-medium ${selectedStatus === status ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</button>))}</div>
        </div>

        <AdministerMedicationForm isOpen={showAdminForm} onClose={() => setShowAdminForm(false)} onSubmit={handleAdminister}
          prescriptions={activePrescriptions.map((a: any) => ({ name: a.medicationName, dosage: a.dosage, frequency: a.frequency, route: a.route, status: 'active', startDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A', prescriber: a.prescribedBy || 'Doctor', prescriberId: a.prescribedById || '' }))} patientName={patientName} />

        {viewType === 'today' && (
          <div className="space-y-3">
            {filteredAdministrations.length === 0 ? (<div className="bg-white dark:bg-slate-900 rounded-lg border p-12 text-center"><Pill size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">No medications scheduled</p></div>) : (
              filteredAdministrations.map(adm => (
                <div key={adm.id} className="bg-white dark:bg-slate-900 rounded-lg border p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${adm.status === 'administered' ? 'bg-green-50' : adm.status === 'pending' ? 'bg-yellow-50' : 'bg-red-50'}`}>{getStatusIcon(adm.status)}</div><div><h3 className="font-semibold">{adm.medicationName}</h3><p className="text-sm text-gray-500">{adm.dosage} • {adm.route} {adm.frequency && `• ${adm.frequency}`}</p></div></div>
                    <div className="text-right"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(adm.status)}`}>{adm.status}</span><p className="text-xs text-gray-400 mt-1"><Clock size={12} className="inline mr-1" />{adm.scheduledTime}{adm.administeredTime && ` → ${adm.administeredTime}`}</p></div>
                  </div>
                  {adm.status === 'pending' && (
                    <div className="mt-3 pt-3 border-t">
                      {showAdminNotes === adm.id ? (
                        <div className="space-y-3">
                          <textarea placeholder="Add administration notes..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-sm h-16 resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => handleGiveMedication(adm.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 rounded-lg text-sm flex items-center justify-center gap-1"><CheckCircle2 size={14} /> Confirm Given</button>
                            <button onClick={() => handleRefuseMedication(adm.id)} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-1.5 rounded-lg text-sm flex items-center justify-center gap-1"><AlertCircle size={14} /> Confirm Refused</button>
                            <button onClick={() => { setShowAdminNotes(null); setAdminNotes(''); }} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => setShowAdminNotes(adm.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Give Medication</button>
                          <button onClick={() => { setShowAdminNotes(adm.id); setAdminNotes(''); }} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-2"><AlertCircle size={16} /> Patient Refused</button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t space-y-1 text-xs text-gray-500">{adm.administeredBy && <p><User size={12} className="inline mr-1" />{adm.administeredBy}</p>}{adm.notes && <p>📝 {adm.notes}</p>}</div>
                </div>
              ))
            )}
          </div>
        )}

        {viewType === 'history' && (
          <div className="space-y-3">
            {filteredAdministrations.length === 0 ? (<div className="bg-white dark:bg-slate-900 rounded-lg border p-12 text-center"><Calendar size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">No administration records</p></div>) : (
              filteredAdministrations.map(adm => (<div key={adm.id} className="bg-white dark:bg-slate-900 rounded-lg border p-4 shadow-sm"><div className="flex items-center justify-between"><div><div className="flex items-center gap-2 mb-1"><h4 className="font-semibold text-sm">{adm.medicationName} ({adm.dosage})</h4><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(adm.status)}`}>{adm.status}</span></div><p className="text-sm text-gray-500">Scheduled: {adm.scheduledTime}{adm.administeredTime && ` • Given: ${adm.administeredTime}`}</p>{adm.administeredBy && <p className="text-xs text-gray-400 mt-1">By: {adm.administeredBy}</p>}{adm.notes && <p className="text-xs text-gray-400">Notes: {adm.notes}</p>}</div></div></div>))
            )}
          </div>
        )}

        {viewType === 'prescriptions' && (
          <div className="space-y-3">
            {activePrescriptions.length === 0 ? (<div className="bg-white dark:bg-slate-900 rounded-lg border p-12 text-center"><Pill size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500">No active prescriptions</p></div>) : (
              activePrescriptions.map((med: any, i: number) => (<div key={med.id || i} className="bg-white dark:bg-slate-900 rounded-lg border p-5 shadow-sm"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Pill size={20} className="text-purple-600" /></div><div><h3 className="font-semibold">{med.medicationName}</h3><p className="text-sm text-gray-500">{med.dosage} • {med.frequency || 'N/A'} • {med.route} {med.durationDays && `• ${med.durationDays} days`}</p></div></div><div className="text-right"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>{med.endDate && <p className="text-xs text-gray-400 mt-1">Ends: {med.endDate}</p>}</div></div><div className="mt-3 pt-3 border-t flex justify-between text-xs text-gray-500"><span><Calendar size={12} className="inline mr-1" />Started: {med.createdAt ? new Date(med.createdAt).toLocaleDateString() : 'N/A'}</span>{med.prescribedBy && <span><User size={12} className="inline mr-1" />{med.prescribedBy}</span>}</div></div>))
            )}
          </div>
        )}
      </main>
    </div>
  );
}