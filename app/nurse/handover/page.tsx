'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, Send, Download, Copy, 
  CheckCircle2, AlertCircle, Clock, User, 
  Calendar, FileText, Plus, X, ChevronRight,
  Printer, Mail, Bell, Heart, Activity
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  bed: string;
  age: number;
  diagnosis: string;
  status: 'critical' | 'warning' | 'stable';
  doctor: string;
  admissionDate: string;
}

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
}

interface HandoverDocument {
  id: string;
  fromNurse: string;
  toNurse: string;
  fromShift: 'Morning' | 'Evening' | 'Night';
  toShift: 'Morning' | 'Evening' | 'Night';
  handoverDate: string;
  handoverTime: string;
  patients: HandoverPatient[];
  generalNotes: string;
  equipmentStatus: string;
  emergencySupplies: string;
  status: 'draft' | 'completed' | 'acknowledged';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: 'John Doe', bed: 'ICU-101', age: 45, diagnosis: 'Pneumonia', status: 'critical', doctor: 'Dr. Smith', admissionDate: '2026-04-25' },
  { id: 'P002', name: 'Mary Smith', bed: 'ICU-102', age: 32, diagnosis: 'Appendicitis', status: 'warning', doctor: 'Dr. Johnson', admissionDate: '2026-04-27' },
  { id: 'P003', name: 'Robert Johnson', bed: 'Ward-201', age: 67, diagnosis: 'Hypertension', status: 'stable', doctor: 'Dr. Williams', admissionDate: '2026-04-20' },
  { id: 'P004', name: 'Sarah Williams', bed: 'Ward-202', age: 28, diagnosis: 'Pregnancy', status: 'stable', doctor: 'Dr. Patel', admissionDate: '2026-04-26' },
];

const MOCK_HANDOVER_PATIENTS: HandoverPatient[] = MOCK_PATIENTS.map(p => ({
  patientId: p.id,
  patientName: p.name,
  bed: p.bed,
  currentStatus: p.status === 'critical' ? 'Critical - Requires close monitoring' : 
                  p.status === 'warning' ? 'Warning - Stable but observe' : 
                  'Stable - Routine care',
  pendingTasks: p.status === 'critical' ? ['Monitor vitals q1h', 'Check SpO2 continuously', 'Prepare for evening labs'] :
                 p.status === 'warning' ? ['Record vitals q4h', 'Administer evening medications', 'Assist with ambulation'] :
                 ['Routine vitals check', 'Patient education on discharge'],
  medicationsDue: p.status === 'critical' ? ['Lisinopril 10mg (6 PM)', 'Heparin infusion (ongoing)'] :
                   p.status === 'warning' ? ['Metformin 500mg (8 PM)', 'Paracetamol PRN'] :
                   ['Atorvastatin 20mg (8 PM)'],
  labTestsPending: p.status === 'critical' ? ['CBC (due 8 PM)', 'Blood Culture'] :
                    p.status === 'warning' ? ['LFT (due tomorrow 6 AM)'] : [],
  doctorInstructions: p.status === 'critical' ? 'Call immediately if SpO2 drops below 92%' :
                      p.status === 'warning' ? 'Continue current treatment plan' :
                      'Prepare for discharge planning tomorrow',
  familyCommunication: 'Family updated on condition. Daughter to call for updates.',
  specialNotes: '',
}));

export default function HandoverPage() {
  const [handoverStarted, setHandoverStarted] = useState(false);
  const [handoverCompleted, setHandoverCompleted] = useState(false);
  const [handoverAcknowledged, setHandoverAcknowledged] = useState(false);
  const [fromShift, setFromShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');
  const [toShift, setToShift] = useState<'Morning' | 'Evening' | 'Night'>('Evening');
  const [generalNotes, setGeneralNotes] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState('All equipment functioning normally. Ventilator checked at 2 PM.');
  const [emergencySupplies, setEmergencySupplies] = useState('Crash cart checked and stocked. Emergency medications available.');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientNotes, setPatientNotes] = useState<Record<string, string>>({});
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);

  const currentNurse = 'Nurse Smith';
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  const handleStartHandover = () => {
    setHandoverStarted(true);
  };

  const handleCompleteHandover = () => {
    setHandoverCompleted(true);
  };

  const handleAcknowledgeHandover = () => {
    setHandoverAcknowledged(true);
    setShowAcknowledgeModal(false);
  };

  const handleDownloadHandover = () => {
    const handoverText = generateHandoverText();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(handoverText));
    element.setAttribute('download', `Handover_${currentDate.replace(/\//g, '-')}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyHandover = () => {
    const handoverText = generateHandoverText();
    navigator.clipboard.writeText(handoverText);
    alert('Handover report copied to clipboard!');
  };

  const generateHandoverText = () => {
    let text = `
═══════════════════════════════════════════════════════════════
                    NURSING SHIFT HANDOVER REPORT
═══════════════════════════════════════════════════════════════
Date: ${currentDate}
Time: ${currentTime}
From Nurse: ${currentNurse} (${fromShift} Shift)
To Nurse: _______________ (${toShift} Shift)

───────────────────────────────────────────────────────────────
GENERAL INFORMATION
───────────────────────────────────────────────────────────────
Total Patients: ${MOCK_PATIENTS.length}
Critical Patients: ${MOCK_PATIENTS.filter(p => p.status === 'critical').length}
Warnings: ${MOCK_PATIENTS.filter(p => p.status === 'warning').length}

Equipment Status: ${equipmentStatus}
Emergency Supplies: ${emergencySupplies}

General Notes: ${generalNotes || 'No additional notes'}

───────────────────────────────────────────────────────────────
PATIENT HANDOVER DETAILS
───────────────────────────────────────────────────────────────
`;

    MOCK_HANDOVER_PATIENTS.forEach(patient => {
      text += `
PATIENT: ${patient.patientName} | Bed: ${patient.bed}
───────────────────────────────────────────────────────────────
Current Status: ${patient.currentStatus}
Pending Tasks: ${patient.pendingTasks.join(', ')}
Medications Due: ${patient.medicationsDue.join(', ')}
${patient.labTestsPending.length > 0 ? `Lab Tests Pending: ${patient.labTestsPending.join(', ')}` : ''}
Doctor Instructions: ${patient.doctorInstructions}
Family Communication: ${patient.familyCommunication}
${patientNotes[patient.patientId] ? `Additional Notes: ${patientNotes[patient.patientId]}` : ''}

`;
    });

    text += `
───────────────────────────────────────────────────────────────
HANDOVER CHECKLIST
───────────────────────────────────────────────────────────────
☐ Patient identification verified for all patients
☐ All critical alerts reviewed
☐ Emergency equipment checked
☐ Controlled substances counted and verified
☐ Lab pending list reviewed
☐ Doctor orders reviewed
☐ Family communication documented

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    }
  };

  if (!handoverStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link 
              href="/nurse" 
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-8 shadow-sm text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={40} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Start Shift Handover</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a comprehensive handover document to transfer patient care information 
              to the next shift nurse. This ensures continuity of care and patient safety.
            </p>
            <button
              onClick={handleStartHandover}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2 mx-auto"
            >
              <Send size={20} />
              Begin Handover
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (handoverCompleted && !handoverAcknowledged) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/nurse" 
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <BookOpen size={24} className="text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadHandover}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
              >
                <Download size={18} />
                Download Report
              </button>
              <button
                onClick={handleCopyHandover}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition flex items-center gap-2"
              >
                <Copy size={18} />
                Copy to Clipboard
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6 text-center">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">Handover Completed</h2>
            <p className="text-green-600 dark:text-green-400 mb-4">
              The handover document has been created. Please share it with the incoming nurse.
            </p>
            <button
              onClick={() => setShowAcknowledgeModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Get Acknowledgment from Incoming Nurse
            </button>
          </div>

          {/* Handover Document Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Handover Document Preview</h3>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-96">
              {generateHandoverText()}
            </div>
          </div>
        </main>

        {/* Acknowledgment Modal */}
        {showAcknowledgeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-slate-700">
              <div className="text-center mb-4">
                <Bell size={48} className="mx-auto mb-3 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Acknowledge Handover</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  By acknowledging, you confirm that you have received and understood the handover report.
                </p>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incoming Nurse Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    Please review all patient information and ask clarifying questions before acknowledging.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAcknowledgeModal(false)}
                  className="flex-1 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcknowledgeHandover}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Acknowledge Handover
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (handoverAcknowledged) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link 
              href="/nurse" 
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">Handover Complete</h2>
            <p className="text-green-600 dark:text-green-400 mb-4">
              The shift handover has been successfully completed and acknowledged.
            </p>
            <Link href="/nurse">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                Return to Dashboard
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/nurse" 
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Handover</h1>
            </div>
          </div>
          <button
            onClick={handleCompleteHandover}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-2"
          >
            <Send size={18} />
            Complete Handover
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Handover Info */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Handover Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Shift</label>
              <select
                value={fromShift}
                onChange={(e) => setFromShift(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
              >
                <option value="Morning">Morning Shift (6 AM - 2 PM)</option>
                <option value="Evening">Evening Shift (2 PM - 10 PM)</option>
                <option value="Night">Night Shift (10 PM - 6 AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Shift</label>
              <select
                value={toShift}
                onChange={(e) => setToShift(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
              >
                <option value="Morning">Morning Shift (6 AM - 2 PM)</option>
                <option value="Evening">Evening Shift (2 PM - 10 PM)</option>
                <option value="Night">Night Shift (10 PM - 6 AM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* General Notes */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Handover Notes</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipment Status</label>
              <textarea
                value={equipmentStatus}
                onChange={(e) => setEquipmentStatus(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Supplies</label>
              <textarea
                value={emergencySupplies}
                onChange={(e) => setEmergencySupplies(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">General Notes / Issues</label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                rows={3}
                placeholder="Any general notes about the shift, incidents, or things to be aware of..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Patient Handover Details */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient Handover Details</h2>
          <div className="space-y-4">
            {MOCK_HANDOVER_PATIENTS.map(patient => (
              <div
                key={patient.patientId}
                className={`border rounded-lg p-4 ${selectedPatient === patient.patientId ? 'border-indigo-300 bg-indigo-50/30 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-slate-700'}`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setSelectedPatient(selectedPatient === patient.patientId ? null : patient.patientId)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${patient.currentStatus.includes('Critical') ? 'bg-red-500' : patient.currentStatus.includes('Warning') ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{patient.patientName}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bed {patient.bed}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className={`text-gray-400 transition-transform ${selectedPatient === patient.patientId ? 'rotate-90' : ''}`} />
                </div>

                {selectedPatient === patient.patientId && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Status</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-slate-800 rounded">
                        {patient.currentStatus}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pending Tasks</label>
                      <div className="flex flex-wrap gap-2">
                        {patient.pendingTasks.map((task, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medications Due</label>
                      <div className="flex flex-wrap gap-2">
                        {patient.medicationsDue.map((med, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                            {med}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Notes</label>
                      <textarea
                        value={patientNotes[patient.patientId] || ''}
                        onChange={(e) => setPatientNotes(prev => ({ ...prev, [patient.patientId]: e.target.value }))}
                        placeholder="Add any special notes about this patient..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm placeholder-gray-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Handover Checklist */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Handover Checklist</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Patient identification verified for all patients</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">All critical alerts reviewed and documented</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Emergency equipment checked and stocked</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Controlled substances counted and verified</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Lab pending list reviewed</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Doctor orders reviewed and executed</span>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Family communication documented</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}