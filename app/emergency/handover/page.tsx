



'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, Send, Download, Copy, 
  CheckCircle2, AlertCircle, Clock, User, 
  ChevronRight, Bell, Loader2
} from 'lucide-react';
import { nurseApi, Patient } from '@/lib/api/nurse';
import toast from 'react-hot-toast';

interface HandoverPatient {
  patientId: string;
  patientName: string;
  bed: string;
  currentStatus: string;
  pendingTasks: string[];
  medicationsDue: string[];
  labTestsPending: string[];
  doctorInstructions: string;
  familyCommunication: string;
  specialNotes: string;
  additionalNotes?: string;
}

interface PendingItem {
  id: number;
  type: 'task' | 'medication';
  category: string;
  name: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
  due_time: string;
  assigned_to: string;
  assigned_by: string;
  notes: string;
  created_at: string;
  current_status: string;
  patient_id?: string;
}

interface PendingData {
  summary: {
    total_pending: number;
    pending_tasks: number;
    pending_medications: number;
    overdue: number;
    priority: {
      high: number;
      medium: number;
      low: number;
    };
  };
  pending_items: PendingItem[];
  overdue_items: PendingItem[];
}

export default function HandoverPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [handoverStarted, setHandoverStarted] = useState(false);
  const [handoverCompleted, setHandoverCompleted] = useState(false);
  const [handoverAcknowledged, setHandoverAcknowledged] = useState(false);
  const [savedHandoverId, setSavedHandoverId] = useState<string>('');
  const [fromShift, setFromShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');
  const [toShift, setToShift] = useState<'Morning' | 'Evening' | 'Night'>('Evening');
  const [toNurse, setToNurse] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState('All equipment functioning normally.');
  const [emergencySupplies, setEmergencySupplies] = useState('Crash cart checked and stocked. Emergency medications available.');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientNotes, setPatientNotes] = useState<Record<string, string>>({});
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  
  const [allPendingData, setAllPendingData] = useState<Record<string, PendingData>>({});
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientSpecificPending, setPatientSpecificPending] = useState<PendingItem[]>([]);
  const [globalSummary, setGlobalSummary] = useState({
    total_pending: 0,
    pending_tasks: 0,
    pending_medications: 0,
    overdue: 0,
    priority: { high: 0, medium: 0, low: 0 }
  });
  // Removed static checklist items - now using only API data

  const currentNurse = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'Current Nurse' : 'Current Nurse';
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  const fetchPendingItemsByPatient = async (patientId: string): Promise<PendingData | null> => {
    try {
      const response = await fetch(`/api/nurse/pending?patientId=${patientId}`);
      const result = await response.json();
      
      console.log(`API Response for ${patientId}:`, result);
      
      if (result?.success && result?.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch pending items for patient ${patientId}:`, error);
      return null;
    }
  };

  const fetchAllPatientsPendingItems = async () => {
    if (patients.length === 0) return;
    
    console.log('Fetching pending items for patients...');
    
    const pendingMap: Record<string, PendingData> = {};
    let totalPending = 0;
    let totalTasks = 0;
    let totalMeds = 0;
    let totalOverdue = 0;
    let totalHigh = 0;
    let totalMedium = 0;
    let totalLow = 0;

    for (const patient of patients) {
      const data = await fetchPendingItemsByPatient(patient.patient_id);
      
      if (data) {
        pendingMap[patient.patient_id] = data;
        totalPending += data.summary.total_pending;
        totalTasks += data.summary.pending_tasks;
        totalMeds += data.summary.pending_medications;
        totalOverdue += data.summary.overdue;
        totalHigh += data.summary.priority.high;
        totalMedium += data.summary.priority.medium;
        totalLow += data.summary.priority.low;
      }
    }

    console.log('Global Summary from API:', {
      total_pending: totalPending,
      pending_tasks: totalTasks,
      pending_medications: totalMeds,
      overdue: totalOverdue,
    });

    setAllPendingData(pendingMap);
    setGlobalSummary({
      total_pending: totalPending,
      pending_tasks: totalTasks,
      pending_medications: totalMeds,
      overdue: totalOverdue,
      priority: { high: totalHigh, medium: totalMedium, low: totalLow }
    });
  };

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const staffId = localStorage.getItem('staffId');
      
      if (!staffId) {
        console.error('No staff ID found');
        setLoading(false);
        return;
      }
      
      const result = await nurseApi.getMyWardPatients(staffId, { status: 'active' });
      
      let allPatients: Patient[] = [];
      if (result?.success && result?.data) allPatients = result.data;
      else if (Array.isArray(result)) allPatients = result;
      else if (result?.data) allPatients = result.data;
      
      setPatients(allPatients.filter(p => p.status === 'active'));
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchPatients(); 
  }, [fetchPatients]);

  const handoverPatients: HandoverPatient[] = patients.map(p => {
    const patientData = allPendingData[p.patient_id];
    const patientPendingItems = patientData?.pending_items || [];
    
    const pendingTasksList = patientPendingItems
      .filter(item => item.type === 'task')
      .map(item => item.current_status === 'overdue' ? `${item.name} (OVERDUE - ${item.due_date})` : item.name);
    
    const medicationsDueList = patientPendingItems
      .filter(item => item.type === 'medication')
      .map(item => `${item.name} - ${item.description} ${item.current_status === 'overdue' ? '(OVERDUE)' : ''}`);
    
    return {
      patientId: p.patient_id,
      patientName: p.patient_name,
      bed: p.bed_number || 'N/A',
      currentStatus: `Active - ${p.reason || 'Under observation'}. ${p.diagnosis ? 'Diagnosis: ' + p.diagnosis : ''}`,
      pendingTasks: pendingTasksList.length > 0 ? pendingTasksList : ['No pending tasks'],
      medicationsDue: medicationsDueList.length > 0 ? medicationsDueList : ['No medications due'],
      labTestsPending: ['Review pending lab orders'],
      doctorInstructions: p.diagnosis ? `Monitor for changes related to ${p.diagnosis}` : 'Continue current treatment plan',
      familyCommunication: 'Update family on condition during visiting hours',
      specialNotes: `Admitted: ${p.admission_date}. Ward: ${p.ward_name || 'N/A'}`,
      additionalNotes: '',
    };
  });

  const handleStartHandover = async () => {
    setHandoverStarted(true);
    await fetchAllPatientsPendingItems();
  };

  const handlePatientSelect = async (patientId: string) => {
    setSelectedPatientId(patientId);
    const data = await fetchPendingItemsByPatient(patientId);
    if (data) {
      setPatientSpecificPending(data.pending_items || []);
    }
  };

  const handleCompleteHandover = async () => {
    if (!toNurse.trim()) {
      toast.error('Please enter receiving nurse name');
      return;
    }

    if (globalSummary.overdue > 0) {
      toast.error(`Please resolve ${globalSummary.overdue} overdue item(s) before handover`);
      return;
    }

    setSubmitting(true);

    try {
      const nurseId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';
      const nurseName = typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : '';

      const result = await nurseApi.createHandover({
        fromNurse: nurseName || currentNurse,
        toNurse: toNurse,
        fromShift: fromShift,
        toShift: toShift,
        generalNotes,
        equipmentStatus,
        emergencySupplies,
        patients: handoverPatients.map(p => ({
          ...p,
          additionalNotes: patientNotes[p.patientId] || '',
        })),
        nurseId,
        nurseName,
      });

      const isSuccess = result?.success === true || 
                        result?.data?.success === true ||
                        (result?.id || result?.data?.id);

      if (isSuccess) {
        setSavedHandoverId(result?.data?.id || result?.id || '');
        setHandoverCompleted(true);
        toast.success('Handover completed successfully!');
      } else {
        toast.error(result?.message || result?.data?.message || 'Failed to complete handover');
      }
    } catch (err: any) {
      console.error('Failed to save handover:', err);
      toast.error(err.message || 'Failed to save handover');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledgeHandover = async () => {
    try {
      const result = await nurseApi.acknowledgeHandover(savedHandoverId, toNurse);
      
      if (result?.success) {
        setHandoverAcknowledged(true);
        setShowAcknowledgeModal(false);
        toast.success('Handover acknowledged successfully!');
      } else {
        toast.error(result?.message || 'Failed to acknowledge');
      }
    } catch (err: any) {
      console.error('Failed to acknowledge:', err);
      toast.error(err.message || 'Failed to acknowledge');
    }
  };

  const handleDownloadHandover = () => {
    const handoverText = generateHandoverText();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(handoverText));
    element.setAttribute('download', `Handover_${currentDate.replace(/\//g, '-')}.txt`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Report downloaded!');
  };

  const handleCopyHandover = () => {
    navigator.clipboard.writeText(generateHandoverText());
    toast.success('Report copied to clipboard!');
  };

  const generateHandoverText = () => {
    let text = `
═══════════════════════════════════════════════════════════════
                    NURSING SHIFT HANDOVER REPORT
═══════════════════════════════════════════════════════════════
Date: ${currentDate}
Time: ${currentTime}
From Nurse: ${currentNurse} (${fromShift} Shift)
To Nurse: ${toNurse || '_______________'} (${toShift} Shift)

───────────────────────────────────────────────────────────────
PENDING ITEMS SUMMARY (FROM API)
───────────────────────────────────────────────────────────────
Total Pending: ${globalSummary.total_pending}
├─ Pending Tasks: ${globalSummary.pending_tasks}
├─ Pending Medications: ${globalSummary.pending_medications}
└─ Overdue Items: ${globalSummary.overdue}

───────────────────────────────────────────────────────────────
GENERAL INFORMATION
───────────────────────────────────────────────────────────────
Total Patients: ${patients.length}

Equipment Status: ${equipmentStatus}
Emergency Supplies: ${emergencySupplies}
General Notes: ${generalNotes || 'No additional notes'}

───────────────────────────────────────────────────────────────
PATIENT HANDOVER DETAILS
───────────────────────────────────────────────────────────────
`;

    handoverPatients.forEach(patient => {
      text += `
PATIENT: ${patient.patientName} | Bed: ${patient.bed}
───────────────────────────────────────────────────────────────
Current Status: ${patient.currentStatus}
Pending Tasks: ${patient.pendingTasks.join(', ')}
Medications Due: ${patient.medicationsDue.join(', ')}
Doctor Instructions: ${patient.doctorInstructions}
Family Communication: ${patient.familyCommunication}
${patientNotes[patient.patientId] ? `Additional Notes: ${patientNotes[patient.patientId]}` : ''}

`;
    });

    text += `
═══════════════════════════════════════════════════════════════
ACKNOWLEDGMENT
═══════════════════════════════════════════════════════════════
I acknowledge that I have received and understood the handover 
report for all patients. I have had the opportunity to ask 
questions and clarify any concerns.

Receiving Nurse Signature: _________________
Date/Time: _________________
═══════════════════════════════════════════════════════════════
`;
    return text;
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-gray-500">Loading patients...</p>
        </div>
      </div>
    );
  }

  // Start Screen
  if (!handoverStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
            </div>
          </div>
        </header>
       <main className="max-w-7xl mx-auto px-4 py-12">
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#E2EFEA] dark:border-slate-700 p-8 shadow-sm text-center max-w-2xl mx-auto hover:shadow-md transition-shadow duration-200">
    <div className="w-20 h-20 bg-[#EAF7F4] dark:bg-[#1F8F89]/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#2BB2A7]/30 dark:border-[#2BB2A7]/20">
      <BookOpen size={40} className="text-[#2BB2A7]" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      {patients.length > 0 ? `Handover ${patients.length} Patient${patients.length !== 1 ? 's' : ''}` : 'Start Shift Handover'}
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      Create a comprehensive handover document to transfer patient care information 
      to the next shift nurse. You have <span className="font-semibold text-[#2BB2A7]">{patients.length}</span> active patient{patients.length !== 1 ? 's' : ''}.
    </p>
    <button 
      onClick={handleStartHandover}
      className="bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2 mx-auto shadow-lg shadow-[#2BB2A7]/20 hover:shadow-xl hover:shadow-[#2BB2A7]/30"
    >
      <Send size={20} /> Begin Handover
    </button>
  </div>
</main>
      </div>
    );
  }

  // Completed - Waiting Acknowledgment
  if (handoverCompleted && !handoverAcknowledged) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <BookOpen size={24} className="text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDownloadHandover} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2">
                <Download size={18} /> Download
              </button>
              <button onClick={handleCopyHandover} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition flex items-center gap-2">
                <Copy size={18} /> Copy
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 text-center">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">Handover Completed!</h2>
            <p className="text-green-600 dark:text-green-400 mb-2">
              Handover to: <strong>{toNurse || 'Incoming Nurse'}</strong> ({toShift} Shift)
            </p>
            <button onClick={() => setShowAcknowledgeModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition mt-4">
              Get Acknowledgment
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Handover Document Preview</h3>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border font-mono text-xs whitespace-pre-wrap overflow-x-auto max-h-96">
              {generateHandoverText()}
            </div>
          </div>
        </main>
        {showAcknowledgeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6 shadow-2xl">
              <div className="text-center mb-4">
                <Bell size={48} className="mx-auto mb-3 text-indigo-600" />
                <h2 className="text-xl font-bold">Acknowledge Handover</h2>
                <p className="text-sm text-gray-500 mt-2">By acknowledging, you confirm receipt and understanding of the handover report.</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5" />
                  Please review all patient information before acknowledging.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAcknowledgeModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleAcknowledgeHandover}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">Acknowledge</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Acknowledged - Complete
  if (handoverAcknowledged) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              <h1 className="text-2xl font-bold">Shift Handover</h1>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 p-8 text-center">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Handover Complete!</h2>
            <p className="text-green-600 mb-4">Shift handover successfully completed and acknowledged.</p>
            <Link href="/nurse" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition inline-block">
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Main Handover Form
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/nurse" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
            </div>
          </div>
          <button onClick={handleCompleteHandover} disabled={submitting || globalSummary.overdue > 0}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 disabled:opacity-50 ${
              globalSummary.overdue === 0
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-400 cursor-not-allowed text-white'
            }`}>
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {submitting ? 'Saving...' : 'Complete Handover'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Pending Items Summary Alert - Based on REAL API Data */}
        {globalSummary.total_pending > 0 && (
          <div className={`rounded-lg p-4 ${globalSummary.overdue > 0 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className={globalSummary.overdue > 0 ? 'text-red-600' : 'text-yellow-600'} />
              <div className="flex-1">
                <h3 className={`font-semibold ${globalSummary.overdue > 0 ? 'text-red-800' : 'text-yellow-800'}`}>
                  {globalSummary.total_pending} Pending Item(s) Need Attention
                </h3>
                <p className="text-sm mt-1 text-gray-600">
                  {globalSummary.pending_tasks} pending tasks · {globalSummary.pending_medications} pending medications
                  {globalSummary.overdue > 0 && ` · ${globalSummary.overdue} overdue items`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Patient Selector for Pending Items */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">View Pending Items by Patient</h2>
          <select 
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
            value={selectedPatientId}
            onChange={(e) => handlePatientSelect(e.target.value)}
          >
            <option value="">Select a patient to view pending items</option>
            {patients.map(patient => (
              <option key={patient.patient_id} value={patient.patient_id}>
                {patient.patient_name} - Bed {patient.bed_number}
              </option>
            ))}
          </select>

          {selectedPatientId && patientSpecificPending.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-sm mb-2">Pending Items:</h3>
              <div className="space-y-2">
                {patientSpecificPending.map((item) => (
                  <div key={item.id} className={`p-3 rounded-lg border ${item.current_status === 'overdue' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        <div className="flex gap-3 mt-2 text-xs">
                          <span className="text-gray-500">Due: {item.due_date} {item.due_time}</span>
                          <span className={`px-2 py-0.5 rounded-full ${item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {item.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full ${item.current_status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                            {item.current_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedPatientId && patientSpecificPending.length === 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <CheckCircle2 size={24} className="mx-auto text-green-600 mb-2" />
              <p className="text-green-700">No pending items for this patient!</p>
            </div>
          )}
        </div>

        {/* Handover Info */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Handover Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From Nurse</label>
              <input type="text" value={currentNurse} readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To Nurse (Receiving) *</label>
              <input type="text" value={toNurse} onChange={(e) => setToNurse(e.target.value)}
                placeholder="Enter receiving nurse name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">From Shift</label>
              <select value={fromShift} onChange={(e) => setFromShift(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm">
                <option value="Morning">Morning (6 AM - 2 PM)</option>
                <option value="Evening">Evening (2 PM - 10 PM)</option>
                <option value="Night">Night (10 PM - 6 AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To Shift</label>
              <select value={toShift} onChange={(e) => setToShift(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm">
                <option value="Morning">Morning (6 AM - 2 PM)</option>
                <option value="Evening">Evening (2 PM - 10 PM)</option>
                <option value="Night">Night (10 PM - 6 AM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* General Notes */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">General Handover Notes</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Equipment Status</label>
              <textarea value={equipmentStatus} onChange={(e) => setEquipmentStatus(e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Emergency Supplies</label>
              <textarea value={emergencySupplies} onChange={(e) => setEmergencySupplies(e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">General Notes / Issues</label>
              <textarea value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} rows={3}
                placeholder="Any general notes about the shift..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm" />
            </div>
          </div>
        </div>

        {/* Patient Handover Details */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Patient Handover Details ({handoverPatients.length} patients)</h2>
          {handoverPatients.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active patients</p>
          ) : (
            <div className="space-y-4">
              {handoverPatients.map(patient => (
                <div key={patient.patientId}
                  className={`border rounded-lg p-4 ${selectedPatient === patient.patientId ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between cursor-pointer"
                    onClick={() => setSelectedPatient(selectedPatient === patient.patientId ? null : patient.patientId)}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <h3 className="font-semibold">{patient.patientName}</h3>
                        <p className="text-xs text-gray-500">Bed {patient.bed}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className={`text-gray-400 transition-transform ${selectedPatient === patient.patientId ? 'rotate-90' : ''}`} />
                  </div>
                  {selectedPatient === patient.patientId && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Status</label>
                        <p className="text-sm text-gray-600 p-2 bg-gray-50 dark:bg-slate-800 rounded">{patient.currentStatus}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Pending Tasks</label>
                        <div className="flex flex-wrap gap-2">
                          {patient.pendingTasks.map((task, idx) => (
                            <span key={idx} className={`px-2 py-1 text-xs rounded-full ${task.includes('OVERDUE') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {task}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Medications Due</label>
                        <div className="flex flex-wrap gap-2">
                          {patient.medicationsDue.map((med, idx) => (
                            <span key={idx} className={`px-2 py-1 text-xs rounded-full ${med.includes('OVERDUE') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Doctor Instructions</label>
                        <p className="text-sm text-gray-600">{patient.doctorInstructions}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Additional Notes</label>
                        <textarea value={patientNotes[patient.patientId] || ''}
                          onChange={(e) => setPatientNotes(prev => ({ ...prev, [patient.patientId]: e.target.value }))}
                          rows={2} placeholder="Add special notes..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Handover Checklist - ONLY FROM API, NO MOCK DATA */}
       {/* Handover Checklist - WITH PENDING TASK DETAILS */}
<div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
  <h2 className="text-lg font-semibold mb-4">Handover Checklist</h2>
  
  {/* Overdue Items Section */}
  <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20">
    <div className="flex items-center gap-3 mb-2">
      <input 
        type="checkbox" 
        checked={globalSummary.overdue === 0}
        readOnly
        className="w-4 h-4 rounded border-gray-300 text-green-600"
      />
      <span className="text-sm font-semibold text-red-700 dark:text-red-400">
        ⚠️ Overdue Items ({globalSummary.overdue} remaining)
      </span>
      {globalSummary.overdue > 0 && (
        <span className="text-xs text-red-600 ml-auto">Must resolve before handover</span>
      )}
    </div>
    
    {/* Show overdue items */}
    {globalSummary.overdue > 0 && (
      <div className="ml-7 space-y-2 mt-2">
        {Object.values(allPendingData).flatMap(data => 
          data.overdue_items.map(item => (
            <div key={item.id} className="text-sm p-2 bg-white dark:bg-slate-800 rounded border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="text-gray-500">Due: {item.due_date} at {item.due_time}</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700">Overdue</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    )}
  </div>

  {/* Pending Tasks Section */}
  <div className="mb-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
    <div className="flex items-center gap-3 mb-2">
      <input 
        type="checkbox" 
        checked={globalSummary.pending_tasks === 0}
        readOnly
        className="w-4 h-4 rounded border-gray-300"
      />
      <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
        📋 Pending Tasks ({globalSummary.pending_tasks} remaining)
      </span>
    </div>
    
    {/* Show pending tasks */}
    {globalSummary.pending_tasks > 0 && (
      <div className="ml-7 space-y-2 mt-2">
        {Object.values(allPendingData).flatMap(data => 
          data.pending_items
            .filter(item => item.type === 'task' && item.current_status !== 'overdue')
            .map(item => (
              <div key={item.id} className="text-sm p-2 bg-white dark:bg-slate-800 rounded border border-yellow-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    <div className="flex gap-3 mt-1 text-xs">
                      <span className="text-gray-500">Due: {item.due_date} at {item.due_time}</span>
                      <span className={`px-1.5 py-0.5 rounded ${item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.priority} priority
                      </span>
                      <span className="text-gray-500">Assigned to: {item.assigned_to}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    )}
  </div>

  {/* Pending Medications Section */}
  <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20">
    <div className="flex items-center gap-3 mb-2">
      <input 
        type="checkbox" 
        checked={globalSummary.pending_medications === 0}
        readOnly
        className="w-4 h-4 rounded border-gray-300"
      />
      <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
        💊 Pending Medications ({globalSummary.pending_medications} remaining)
      </span>
    </div>
    
    {/* Show pending medications */}
    {globalSummary.pending_medications > 0 && (
      <div className="ml-7 space-y-2 mt-2">
        {Object.values(allPendingData).flatMap(data => 
          data.pending_items
            .filter(item => item.type === 'medication')
            .map(item => (
              <div key={item.id} className="text-sm p-2 bg-white dark:bg-slate-800 rounded border border-blue-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-blue-700 dark:text-blue-400">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    <div className="flex gap-3 mt-1 text-xs">
                      <span className="text-gray-500">Scheduled: {item.due_time}</span>
                      <span className="text-gray-500">Prescribed by: {item.assigned_by || 'Doctor'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    )}
  </div>

  {globalSummary.overdue > 0 && (
    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300">
      <p className="text-sm text-red-800 dark:text-red-300 flex items-center gap-2">
        <AlertCircle size={16} />
        Please resolve all overdue items before completing handover
      </p>
    </div>
  )}
</div>
      </main>
    </div>
  );
}