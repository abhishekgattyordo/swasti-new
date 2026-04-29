// components/nurse/nursing-notes/CreateNoteModal.tsx
'use client';

import { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';

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

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<NursingNote>) => void;
  patientName: string;
  patientBed: string;
  patientId: string;  // ✅ Make sure this is included
}

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

export default function CreateNoteModal({ isOpen, onClose, onSave, patientName, patientBed, patientId }: CreateNoteModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('progress');
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

  if (!isOpen) return null;

  const handleApplyTemplate = (templateType: string) => {
    const template = NOTE_TEMPLATES[templateType as keyof typeof NOTE_TEMPLATES];
    if (template) {
      setFormData(prev => ({
        ...prev,
        noteType: templateType as NursingNote['noteType'],
        title: template.title,
        content: template.content,
      }));
      setSelectedTemplate(templateType);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }

    onSave({
      patientId: patientId,        // ✅ Now patientId is defined
      patientName: patientName,
      bed: patientBed,
      noteType: formData.noteType,
      title: formData.title,
      content: formData.content,
      priority: formData.priority,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      assessmentFindings: formData.assessmentFindings,
      interventions: formData.interventions,
      patientResponse: formData.patientResponse,
      followUpRequired: formData.priority !== 'routine',
    });

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
    onClose();
  };

  const getTemplateButtonClass = (templateKey: string) => {
    return `p-3 rounded-lg border-2 font-semibold text-sm transition-all ${
      selectedTemplate === templateKey
        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-blue-300'
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Nursing Note</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition text-gray-600 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Patient:</span> {patientName} (Bed {patientBed})
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Select Template</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(NOTE_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => handleApplyTemplate(key)}
                  className={getTemplateButtonClass(key)}
                >
                  {template.title}
                </button>
              ))}
            </div>
          </div>

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

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Save Note
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}