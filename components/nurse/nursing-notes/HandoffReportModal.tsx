// components/nurse/nursing-notes/HandoffReportModal.tsx
'use client';

import { Download, Copy, X, Send, AlertCircle } from 'lucide-react';

interface NursingNote {
  id: string;
  patientId: string;
  patientName: string;
  bed: string;
  noteType: 'admission' | 'progress' | 'critical' | 'discharge' | 'post-op' | 'intervention';
  title: string;
  content: string;
  priority: 'routine' | 'urgent' | 'critical';
  createdBy: string;
  createdAt: string;
  tags: string[];
  assessmentFindings?: string;
  interventions?: string;
  patientResponse?: string;
  followUpRequired?: boolean;
}

interface HandoffReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    id: string;
    name: string;
    bed: string;
    status: string;
  } | undefined;
  recentNote: NursingNote | undefined;
}

export default function HandoffReportModal({ isOpen, onClose, patient, recentNote }: HandoffReportModalProps) {
  if (!isOpen) return null;

  const criticalAlerts = [
    { type: 'Vital Signs', alert: 'Blood pressure elevated: 158/92 mmHg', time: '30 minutes ago' },
  ];

  const pendingTasks = [
    { task: 'Administer Lisinopril 10mg PO', time: 'Due: 14:00' },
    { task: 'Monitor wound site for infection', time: 'q4h' },
    { task: 'Encourage ambulation with assistance', time: 'Before discharge' },
  ];

  const generateISBARText = () => {
    const currentDate = new Date().toLocaleString();
    
    return `
═══════════════════════════════════════════════════════════════
                    I-SBAR SHIFT HANDOFF REPORT
═══════════════════════════════════════════════════════════════
Generated: ${currentDate}
Nurse: Nurse Smith | Shift: Day Shift

───────────────────────────────────────────────────────────────
IDENTIFY
───────────────────────────────────────────────────────────────
Patient Name: ${patient?.name || 'N/A'}
Bed Location: ${patient?.bed || 'N/A'}
Patient Status: ${patient?.status?.toUpperCase() || 'N/A'}

───────────────────────────────────────────────────────────────
SITUATION (Current Status)
───────────────────────────────────────────────────────────────
${recentNote ? `Recent Assessment (${recentNote.createdAt}):
${recentNote.content.split('\n').slice(0, 3).join('\n')}

Key Status: ${recentNote.priority?.toUpperCase() || 'ROUTINE'}` : 'No recent notes available'}

Current Concerns:
${criticalAlerts.map(alert => `  • ${alert.type}: ${alert.alert} (${alert.time})`).join('\n')}

───────────────────────────────────────────────────────────────
BACKGROUND (History & Context)
───────────────────────────────────────────────────────────────
${recentNote?.assessmentFindings ? `Assessment Findings:
${recentNote.assessmentFindings}

` : ''}
Clinical History: Patient admitted for ongoing care management

───────────────────────────────────────────────────────────────
ASSESSMENT (Clinical Judgment)
───────────────────────────────────────────────────────────────
Overall Status: STABLE / MONITORING REQUIRED
Key Findings:
${recentNote?.interventions ? `  • Interventions in place: ${recentNote.interventions.split(',')[0]}` : '  • Standard monitoring protocols in place'}
  • Vital signs: Within acceptable range
  • Pain level: Controlled
  • Patient cooperation: Good

Clinical Risk Level: ${patient?.status === 'critical' ? 'HIGH' : patient?.status === 'warning' ? 'MODERATE' : 'LOW'}

───────────────────────────────────────────────────────────────
RECOMMENDATION (Action Items for Incoming Shift)
───────────────────────────────────────────────────────────────
PRIORITY ACTIONS - Perform Immediately:
${pendingTasks.slice(0, 2).map((task, idx) => `  ${idx + 1}. ${task.task} - ${task.time}`).join('\n')}

ONGOING MONITORING:
${pendingTasks.slice(2).map((task, idx) => `  ${idx + 3}. ${task.task} - ${task.time}`).join('\n')}

ESCALATION CRITERIA:
  • Blood pressure > 160/100 mmHg or < 90/60 mmHg
  • Oxygen saturation < 94%
  • Patient reports chest pain or difficulty breathing
  • Decreased consciousness or confusion
  • Immediate physician notification required if any occur

───────────────────────────────────────────────────────────────
ADDITIONAL NOTES
───────────────────────────────────────────────────────────────
${recentNote?.patientResponse ? `Patient Response: ${recentNote.patientResponse}` : 'Patient cooperative and stable'}

Follow-up Required: ${recentNote?.followUpRequired ? 'YES - Physician follow-up needed' : 'Standard monitoring'}

Outgoing Shift Nurse: Nurse Smith
Incoming Shift Nurse: _________________ (Print & Sign)
Time of Handoff: _________________ 

═══════════════════════════════════════════════════════════════
    Acknowledge receipt of handoff report above signature
═══════════════════════════════════════════════════════════════
`;
  };

  const handleDownload = () => {
    const text = generateISBARText();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `ISBAR_${patient?.name?.replace(/\s+/g, '_') || 'handoff'}_${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    const text = generateISBARText();
    navigator.clipboard.writeText(text);
    alert('Handoff report copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 border-b border-purple-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Send size={24} />
              I-SBAR Shift Handoff Report
            </h2>
            <p className="text-purple-100 text-sm mt-1">Standardized handoff communication for {patient?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-purple-500 rounded-lg transition text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Display */}
          <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-96 text-gray-700 dark:text-gray-300">
            {generateISBARText()}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={handleDownload}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download Report
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Copy size={20} />
              Copy to Clipboard
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition"
            >
              Close
            </button>
          </div>

          {/* Clinical Notes */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Clinical Communication Best Practices
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>✓ Read aloud to receiving nurse for verbal confirmation</li>
              <li>✓ Ask receiving nurse for questions or clarifications</li>
              <li>✓ Provide this document as written backup for handoff communication</li>
              <li>✓ Include critical escalation criteria for immediate alerts</li>
              <li>✓ Both nurses sign and date the printed report as acknowledgment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}