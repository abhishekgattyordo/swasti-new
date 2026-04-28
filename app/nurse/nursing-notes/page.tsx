'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Plus, Save, X, Search, Filter, Eye, Edit2, Trash2, Clock, User, Calendar, Tag, AlertCircle, CheckCircle2, ChevronDown, Download, Send } from 'lucide-react';

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
  updatedAt?: string;
  tags: string[];
  assessmentFindings?: string;
  interventions?: string;
  patientResponse?: string;
  followUpRequired?: boolean;
}

interface Patient {
  id: string;
  name: string;
  bed: string;
  status: 'critical' | 'warning' | 'stable';
}

const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: 'John Doe', bed: 'ICU-101', status: 'critical' },
  { id: 'P002', name: 'Mary Smith', bed: 'ICU-102', status: 'warning' },
  { id: 'P003', name: 'Robert Johnson', bed: 'Ward-201', status: 'stable' },
  { id: 'P004', name: 'Sarah Williams', bed: 'Ward-202', status: 'stable' },
];

const NOTE_TEMPLATES = {
  admission: {
    title: 'Admission Note',
    content: `ADMISSION NOTE
Patient Name: 
Date/Time of Admission: 
Admitted from: 
Chief Complaint:
History of Present Illness:
Medical History:
Medications on admission:
Allergies:
Physical Assessment:
Vital Signs:
Labs/Diagnostic Results:
Nursing Diagnosis:
Care Plan:
Patient/Family Education:`,
  },
  progress: {
    title: 'Progress Note',
    content: `PROGRESS NOTE
Date/Time:
Patient Status:
Assessment:
- Vital Signs:
- Labs:
- Physical Findings:
Interventions Performed:
Patient Response:
Plan for Next 24 hours:
Signature:`,
  },
  critical: {
    title: 'Critical Event Documentation',
    content: `CRITICAL EVENT DOCUMENTATION
Date/Time of Event:
Patient Status Before Event:
Event Description:
Actions Taken:
Response to Intervention:
Physician Notification:
Time:
Orders Received:
Follow-up Actions:
Signature:`,
  },
  discharge: {
    title: 'Discharge Summary',
    content: `DISCHARGE SUMMARY
Admission Date:
Discharge Date:
Hospital Course Summary:
Diagnoses:
Procedures Performed:
Medications at Discharge:
Activity Restrictions:
Diet:
Follow-up Appointments:
Patient/Caregiver Education Provided:
Return Precautions:
Signature:`,
  },
  'post-op': {
    title: 'Post-Operative Note',
    content: `POST-OPERATIVE NOTE
Date/Time:
Operation Performed:
Surgeon:
Anesthesia:
Recovery Time:
Vital Signs:
Operative Site Assessment:
Pain Level:
Medications Given:
Fluid Intake/Output:
Activity Level:
Patient Instructions:`,
  },
  intervention: {
    title: 'Intervention Documentation',
    content: `INTERVENTION DOCUMENTATION
Date/Time:
Patient Name:
Intervention Performed:
Indication:
Supplies Used:
Assessment Before:
Procedure:
Assessment After:
Patient Tolerance:
Complications:
Follow-up Plan:`,
  },
};

const MOCK_NOTES: NursingNote[] = [
  {
    id: 'N001',
    patientId: 'P001',
    patientName: 'John Doe',
    bed: 'ICU-101',
    noteType: 'critical',
    title: 'Critical Event - Hypoxic Episode',
    content: 'Patient experienced sudden oxygen desaturation to 88% at 14:30. Immediate intervention: increased oxygen delivery to 15L non-rebreather. SpO2 improved to 94% within 5 minutes. Physician notified. Continuous monitoring initiated. Patient stable at present.',
    priority: 'critical',
    createdBy: 'Nurse Johnson',
    createdAt: '2026-04-28 14:35',
    tags: ['respiratory', 'critical', 'intervention'],
    assessmentFindings: 'Wheezing, anxiety, tachycardia',
    interventions: 'Supplemental oxygen, positioned upright, vitals monitored q15min',
    patientResponse: 'Improved oxygenation, reduced anxiety',
    followUpRequired: true,
  },
  {
    id: 'N002',
    patientId: 'P002',
    patientName: 'Mary Smith',
    bed: 'ICU-102',
    noteType: 'progress',
    title: 'Morning Progress Note',
    content: 'Patient alert and oriented x3. Vital signs stable throughout night. Pain controlled with current medication regimen. Ambulating with assistance. Tolerating diet well. Wound assessment clean and dry, no signs of infection.',
    priority: 'routine',
    createdBy: 'Nurse Davis',
    createdAt: '2026-04-28 07:00',
    tags: ['routine', 'progress', 'stable'],
    assessmentFindings: 'AOx3, stable vitals, pain 3/10',
    interventions: 'Continue current pain management, encourage ambulation',
    patientResponse: 'Positive, cooperating well',
    followUpRequired: false,
  },
  {
    id: 'N003',
    patientId: 'P003',
    patientName: 'Robert Johnson',
    bed: 'Ward-201',
    noteType: 'admission',
    title: 'Admission Note - Post Procedure',
    content: 'Patient admitted following outpatient endoscopy. Procedure well-tolerated. Mild throat discomfort, managed with lozenges. NPO status maintained as ordered. Vitals stable. Patient resting comfortably. Instructions reinforced regarding post-procedure care.',
    priority: 'routine',
    createdBy: 'Nurse Smith',
    createdAt: '2026-04-28 13:00',
    tags: ['admission', 'post-op', 'procedure'],
    assessmentFindings: 'Post-procedure stable, minimal discomfort',
    interventions: 'Monitor vitals, NPO status, comfort measures',
    patientResponse: 'Well-tolerated, comfortable',
    followUpRequired: false,
  },
  {
    id: 'N004',
    patientId: 'P004',
    patientName: 'Sarah Williams',
    bed: 'Ward-202',
    noteType: 'progress',
    title: 'Afternoon Assessment',
    content: 'Patient reports improved energy levels. Lab results reviewed and within normal limits. Discharge planning discussed with patient and family. Home care instructions provided. Prescriptions prepared.',
    priority: 'routine',
    createdBy: 'Nurse Wilson',
    createdAt: '2026-04-28 15:00',
    tags: ['progress', 'discharge-planning', 'routine'],
    assessmentFindings: 'Patient improving, ready for discharge',
    interventions: 'Discharge education, prescriptions',
    patientResponse: 'Patient and family satisfied',
    followUpRequired: false,
  },
];

export default function NursingNotesPage() {
  const [notes, setNotes] = useState<NursingNote[]>(MOCK_NOTES);
  const [selectedPatient, setSelectedPatient] = useState<string>(MOCK_PATIENTS[0].id);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NursingNote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | NursingNote['noteType']>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | NursingNote['priority']>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<NursingNote['noteType']>('progress');
  const [showHandoffModal, setShowHandoffModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    noteType: 'progress' as NursingNote['noteType'],
    content: '',
    priority: 'routine' as NursingNote['priority'],
    tags: '',
    assessmentFindings: '',
    interventions: '',
    patientResponse: '',
  });

  const patient = MOCK_PATIENTS.find(p => p.id === selectedPatient);

  const filteredNotes = notes.filter(note => {
    const matchesPatient = note.patientId === selectedPatient;
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || note.noteType === filterType;
    const matchesPriority = filterPriority === 'all' || note.priority === filterPriority;
    return matchesPatient && matchesSearch && matchesType && matchesPriority;
  });

  const handleApplyTemplate = (templateType: NursingNote['noteType']) => {
    const template = NOTE_TEMPLATES[templateType];
    setFormData(prev => ({
      ...prev,
      noteType: templateType,
      title: template.title,
      content: template.content,
    }));
    setSelectedTemplate(templateType);
  };

  const handleSaveNote = () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }

    const newNote: NursingNote = {
      id: `N${Date.now()}`,
      patientId: selectedPatient,
      patientName: patient?.name || '',
      bed: patient?.bed || '',
      noteType: formData.noteType,
      title: formData.title,
      content: formData.content,
      priority: formData.priority,
      createdBy: 'Nurse Smith',
      createdAt: new Date().toLocaleString(),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      assessmentFindings: formData.assessmentFindings,
      interventions: formData.interventions,
      patientResponse: formData.patientResponse,
      followUpRequired: formData.priority !== 'routine',
    };

    setNotes([...notes, newNote]);
    setFormData({
      title: '',
      noteType: 'progress',
      content: '',
      priority: 'routine',
      tags: '',
      assessmentFindings: '',
      interventions: '',
      patientResponse: '',
    });
    setShowNewNoteForm(false);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(n => n.id !== noteId));
      setSelectedNote(null);
    }
  };

  const getPriorityColor = (priority: NursingNote['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
      case 'urgent':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
      case 'routine':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const generateISBARHandoff = () => {
    const recentNote = notes
      .filter(n => n.patientId === selectedPatient)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const criticalAlerts = [
      {
        type: 'Vital Signs',
        alert: 'Blood pressure elevated: 158/92 mmHg',
        time: '30 minutes ago',
      },
    ];

    const pendingTasks = [
      { task: 'Administer Lisinopril 10mg PO', time: 'Due: 14:00' },
      { task: 'Monitor wound site for infection', time: 'q4h' },
      { task: 'Encourage ambulation with assistance', time: 'Before discharge' },
    ];

    const now = new Date();
    const handoffTime = now.toLocaleString();

    return {
      patient: patient,
      recentNote: recentNote,
      criticalAlerts: criticalAlerts,
      pendingTasks: pendingTasks,
      time: handoffTime,
    };
  };

  const handleDownloadHandoff = () => {
    const handoffData = generateISBARHandoff();
    const text = generateISBARText(handoffData);
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', `ISBAR_${handoffData.patient?.name.replace(/\s+/g, '_')}_${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateISBARText = (data: any) => {
    return `
═══════════════════════════════════════════════════════════════
                    I-SBAR SHIFT HANDOFF REPORT
═══════════════════════════════════════════════════════════════
Generated: ${data.time}
Nurse: Nurse Smith | Shift: Day Shift

───────────────────────────────────────────────────────────────
IDENTIFY
───────────────────────────────────────────────────────────────
Patient Name: ${data.patient?.name}
Bed Location: ${data.patient?.bed}
Patient Status: ${data.patient?.status.toUpperCase()}
───────────────────────────────────────────────────────────────

───────────────────────────────────────────────────────────────
SITUATION (Current Status)
───────────────────────────────────────────────────────────────
${data.recentNote ? `Recent Assessment (${data.recentNote.createdAt}):
${data.recentNote.content.split('\n').slice(0, 3).join('\n')}

Key Status: ${data.recentNote.priority.toUpperCase()}` : 'No recent notes available'}

Current Concerns:
${data.criticalAlerts.map((alert: any) => `  • ${alert.type}: ${alert.alert} (${alert.time})`).join('\n')}

───────────────────────────────────────────────────────────────
BACKGROUND (History & Context)
───────────────────────────────────────────────────────────────
${data.recentNote?.assessmentFindings ? `Assessment Findings:
${data.recentNote.assessmentFindings}

` : ''}
Clinical History: Patient admitted for ongoing care management

───────────────────────────────────────────────────────────────
ASSESSMENT (Clinical Judgment)
───────────────────────────────────────────────────────────────
Overall Status: STABLE / MONITORING REQUIRED
Key Findings:
${data.recentNote?.interventions ? `  • Interventions in place: ${data.recentNote.interventions.split(',')[0]}` : '  • Standard monitoring protocols in place'}
  • Vital signs: Within acceptable range
  • Pain level: Controlled
  • Patient cooperation: Good

Clinical Risk Level: ${data.patient?.status === 'critical' ? 'HIGH' : data.patient?.status === 'warning' ? 'MODERATE' : 'LOW'}

───────────────────────────────────────────────────────────────
RECOMMENDATION (Action Items for Incoming Shift)
───────────────────────────────────────────────────────────────
PRIORITY ACTIONS - Perform Immediately:
${data.pendingTasks.slice(0, 2).map((task: any, idx: number) => `  ${idx + 1}. ${task.task} - ${task.time}`).join('\n')}

ONGOING MONITORING:
${data.pendingTasks.slice(2).map((task: any, idx: number) => `  ${idx + 3}. ${task.task} - ${task.time}`).join('\n')}

ESCALATION CRITERIA:
  • Blood pressure > 160/100 mmHg or < 90/60 mmHg
  • Oxygen saturation < 94%
  • Patient reports chest pain or difficulty breathing
  • Decreased consciousness or confusion
  • Immediate physician notification required if any occur

───────────────────────────────────────────────────────────────
ADDITIONAL NOTES
───────────────────────────────────────────────────────────────
${data.recentNote?.patientResponse ? `Patient Response: ${data.recentNote.patientResponse}` : 'Patient cooperative and stable'}

Follow-up Required: ${data.recentNote?.followUpRequired ? 'YES - Physician follow-up needed' : 'Standard monitoring'}

Outgoing Shift Nurse: Nurse Smith
Incoming Shift Nurse: _________________ (Print & Sign)
Time of Handoff: _________________ 

═══════════════════════════════════════════════════════════════
    Acknowledge receipt of handoff report above signature
═══════════════════════════════════════════════════════════════
`;
  };

  const getNoteTypeColor = (noteType: NursingNote['noteType']) => {
    switch (noteType) {
      case 'admission':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'progress':
        return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'discharge':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'post-op':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
      case 'intervention':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

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
            <FileText size={24} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nursing Notes & Documentation</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Patient Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Patient</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {MOCK_PATIENTS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPatient === p.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-blue-300'
                }`}
              >
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bed {p.bed}</p>
                <div className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  p.status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  p.status === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-col md:flex-row">
          <button
            onClick={() => setShowNewNoteForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2"
          >
            <Plus size={20} />
            Create New Note
          </button>
          
          <button
            onClick={() => setShowHandoffModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2"
          >
            <Send size={20} />
            Generate I-SBAR Handoff
          </button>
        </div>

        {/* New Note Form Modal */}
        {showNewNoteForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Nursing Note</h2>
                <button
                  onClick={() => setShowNewNoteForm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Template Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Select Template</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(NOTE_TEMPLATES).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => handleApplyTemplate(key as NursingNote['noteType'])}
                        className={`p-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                          selectedTemplate === key
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-blue-300'
                        }`}
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter note title"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as NursingNote['priority'] }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white"
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Note Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter detailed nursing notes..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                  />
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assessment Findings</label>
                    <textarea
                      value={formData.assessmentFindings}
                      onChange={(e) => setFormData(prev => ({ ...prev, assessmentFindings: e.target.value }))}
                      placeholder="Patient assessment findings..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interventions</label>
                    <textarea
                      value={formData.interventions}
                      onChange={(e) => setFormData(prev => ({ ...prev, interventions: e.target.value }))}
                      placeholder="Nursing interventions performed..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patient Response</label>
                  <textarea
                    value={formData.patientResponse}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientResponse: e.target.value }))}
                    placeholder="Patient's response to interventions..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., vitals, pain, wound care"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={handleSaveNote}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Save Note
                  </button>
                  <button
                    onClick={() => setShowNewNoteForm(false)}
                    className="flex-1 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="admission">Admission</option>
              <option value="progress">Progress</option>
              <option value="critical">Critical</option>
              <option value="discharge">Discharge</option>
              <option value="post-op">Post-Op</option>
              <option value="intervention">Intervention</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm font-medium text-gray-900 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Notes Display */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notes for {patient?.name} - {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}</h2>
          
          {filteredNotes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-12 text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 dark:text-gray-400">No notes found</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedNote(note)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{note.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getNoteTypeColor(note.noteType)}`}>
                        {note.noteType}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(note.priority)}`}>
                        {note.priority}
                      </span>
                      {note.followUpRequired && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200">
                          Follow-up Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <User size={14} />
                      {note.createdBy}
                      <span className="mx-2">•</span>
                      <Clock size={14} />
                      {note.createdAt}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNote(note);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                      <Eye size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{note.content}</p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Note Detail View */}
        {selectedNote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedNote.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedNote.patientName} • Bed {selectedNote.bed}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${getNoteTypeColor(selectedNote.noteType)}`}>
                    {selectedNote.noteType}
                  </span>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${getPriorityColor(selectedNote.priority)}`}>
                    {selectedNote.priority}
                  </span>
                  {selectedNote.followUpRequired && (
                    <span className="px-3 py-1 rounded text-sm font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      Follow-up Required
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Created By</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedNote.createdBy} • {selectedNote.createdAt}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Note Content</h3>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {selectedNote.content}
                  </div>
                </div>

                {selectedNote.assessmentFindings && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Assessment Findings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedNote.assessmentFindings}</p>
                  </div>
                )}

                {selectedNote.interventions && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Interventions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedNote.interventions}</p>
                  </div>
                )}

                {selectedNote.patientResponse && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Patient Response</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedNote.patientResponse}</p>
                  </div>
                )}

                {selectedNote.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedNote(null)}
                  className="w-full bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* I-SBAR Handoff Modal */}
        {showHandoffModal && (
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
                <button
                  onClick={() => setShowHandoffModal(false)}
                  className="p-2 hover:bg-purple-500 rounded-lg transition text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* I-SBAR Report Display */}
                <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-96 text-gray-700 dark:text-gray-300">
                  {generateISBARText(generateISBARHandoff())}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={handleDownloadHandoff}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download Report
                  </button>
                  <button
                    onClick={() => {
                      const handoffData = generateISBARHandoff();
                      const text = generateISBARText(handoffData);
                      navigator.clipboard.writeText(text);
                      alert('Handoff report copied to clipboard!');
                    }}
                    className="flex-1 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => setShowHandoffModal(false)}
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
        )}
      </main>
    </div>
  );
}