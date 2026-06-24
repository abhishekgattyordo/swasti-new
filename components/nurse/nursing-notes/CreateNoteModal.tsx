'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, Save, FileText, Mic, MicOff, AlertCircle, RotateCcw, 
  Sparkles, Loader2, Wand2, Trash2, Volume2 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLiveTranscription } from '@/hooks/useLiveTranscription';
import { LiveMicStatusLine, liveMicButtonLabel } from '@/components/speech/LiveMicButton';

// ------------------------------------------------------------------
// Types and Templates (same as before)
// ------------------------------------------------------------------
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
  patientId: string;
}

const NOTE_TEMPLATES = {
  admission: { title: 'Admission Note', content: `ADMISSION NOTE\nPatient Name: \nDate/Time of Admission: \nAdmitted from: \nChief Complaint:\nHistory of Present Illness:\nMedical History:\nMedications on admission:\nAllergies:\nPhysical Assessment:\nVital Signs:\nLabs/Diagnostic Results:\nNursing Diagnosis:\nCare Plan:\nPatient/Family Education:` },
  progress: { title: 'Progress Note', content: `PROGRESS NOTE\nDate/Time:\nPatient Status:\nAssessment:\n- Vital Signs:\n- Labs:\n- Physical Findings:\nInterventions Performed:\nPatient Response:\nPlan for Next 24 hours:\nSignature:` },
  critical: { title: 'Critical Event Documentation', content: `CRITICAL EVENT DOCUMENTATION\nDate/Time of Event:\nPatient Status Before Event:\nEvent Description:\nActions Taken:\nResponse to Intervention:\nPhysician Notification:\nTime:\nOrders Received:\nFollow-up Actions:\nSignature:` },
  discharge: { title: 'Discharge Summary', content: `DISCHARGE SUMMARY\nAdmission Date:\nDischarge Date:\nHospital Course Summary:\nDiagnoses:\nProcedures Performed:\nMedications at Discharge:\nActivity Restrictions:\nDiet:\nFollow-up Appointments:\nPatient/Caregiver Education Provided:\nReturn Precautions:\nSignature:` },
  'post-op': { title: 'Post-Operative Note', content: `POST-OPERATIVE NOTE\nDate/Time:\nOperation Performed:\nSurgeon:\nAnesthesia:\nRecovery Time:\nVital Signs:\nOperative Site Assessment:\nPain Level:\nMedications Given:\nFluid Intake/Output:\nActivity Level:\nPatient Instructions:` },
  intervention: { title: 'Intervention Documentation', content: `INTERVENTION DOCUMENTATION\nDate/Time:\nPatient Name:\nIntervention Performed:\nIndication:\nSupplies Used:\nAssessment Before:\nProcedure:\nAssessment After:\nPatient Tolerance:\nComplications:\nFollow-up Plan:` },
};

// Helper function
function capitalize(str: string) {
  if (!str) return '';
  return str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

// ------------------------------------------------------------------
// VoiceInputField (single line with microphone)
// ------------------------------------------------------------------
function VoiceInputField({ value, onChange, placeholder, label, hint }: any) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setTranscript(final || interim);
      if (final) {
        const newValue = value ? value + ' ' + capitalize(final) : capitalize(final);
        onChange(newValue);
        setTimeout(() => { setIsListening(false); setTranscript(""); }, 500);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => { setIsListening(false); setTranscript(""); };
    recognitionRef.current = recognition;
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, [value, onChange]);

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    else { setTranscript(""); try { recognitionRef.current?.start(); setIsListening(true); } catch(e) {} }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-1">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={`pr-10 ${isListening ? 'ring-2 ring-blue-500' : ''}`} />
        <button type="button" onClick={toggleListening}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
      {isListening && <p className="text-xs text-blue-500 mt-1 animate-pulse">🎤 {transcript || "Listening..."}</p>}
      <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

// ------------------------------------------------------------------
// VoiceTextareaField (textarea with microphone)
// ------------------------------------------------------------------
function VoiceTextareaField({ value, onChange, placeholder, label, hint, rows = 3 }: any) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setTranscript(final || interim);
      if (final) {
        const newValue = value ? value + ' ' + capitalize(final) : capitalize(final);
        onChange(newValue);
        setTimeout(() => { setIsListening(false); setTranscript(""); }, 500);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => { setIsListening(false); setTranscript(""); };
    recognitionRef.current = recognition;
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, [value, onChange]);

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    else { setTranscript(""); try { recognitionRef.current?.start(); setIsListening(true); } catch(e) {} }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-1">
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          className={`resize-none pr-10 ${isListening ? 'ring-2 ring-blue-500' : ''}`} />
        <button type="button" onClick={toggleListening}
          className={`absolute right-2 bottom-2 p-1.5 rounded-full transition ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
      {isListening && <p className="text-xs text-blue-500 mt-1 animate-pulse">🎤 {transcript || "Listening..."}</p>}
      <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

// ------------------------------------------------------------------
// Main Modal Component
// ------------------------------------------------------------------
export default function CreateNoteModal({ isOpen, onClose, onSave, patientName, patientBed, patientId }: CreateNoteModalProps) {
  const [activeTab, setActiveTab] = useState<'normal' | 'ai'>('normal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // ---------- AI Voice Dictation (live streaming) ----------
  const [isParsing, setIsParsing] = useState(false);
  const [micLanguage, setMicLanguage] = useState('en-IN');

  const {
    status: micStatus,
    isConnecting,
    isListening,
    isActive,
    fullText: speechTranscript,
    interimText,
    setFullText: setSpeechTranscript,
    toggle: toggleListening,
  } = useLiveTranscription({
    onError: (message) => setError(message),
  });

  const handleToggleListening = () => {
    void toggleListening({ micLanguage, clearOnStart: true });
  };

  // Call Gemini API to parse the transcript and fill all fields
  const handleAIParseVoice = async () => {
    if (!speechTranscript.trim()) {
      setError("Please speak or paste some text before parsing.");
      return;
    }
    setIsParsing(true);
    setError(null);
    try {
      const response = await fetch('/api/nurse/notes/ai-voice-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: speechTranscript,
          patientName,
          patientBed,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Parsing failed');

      // Auto‑populate all form fields
      setFormData({
        title: data.title || '',
        noteType: data.noteType || 'progress',
        priority: data.priority || 'routine',
        assessmentFindings: data.assessmentFindings || '',
        interventions: data.interventions || '',
        patientResponse: data.patientResponse || '',
        content: data.content || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
      });
      setSelectedTemplate(data.noteType || 'progress');
      setSpeechTranscript(''); // clear after successful parse
    } catch (err: any) {
      setError(err.message || 'AI parsing failed. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const PRESET_TRANSCRIPTS = [
    { label: "Routine", text: "Routine morning check: BP 130/80, heart rate 72, oxygen saturation 97% on room air. Lungs clear. Patient denies pain. Administered morning medications as ordered. Patient resting comfortably." },
    { label: "Cardiac", text: "Post-op day 1 after PCI. Groin site clean and dry, pulses intact. Telemetry shows normal sinus rhythm. Administered Clopidogrel and Metoprolol. Patient tolerating well, no chest pain." },
    { label: "Critical", text: "Patient became acutely short of breath. SpO2 dropped to 84% on 2L. Increased oxygen to 6L, administered Albuterol neb. Improved to 91%. Physician notified. Solu-Medrol given. Continues to require close monitoring." },
  ];

  // Existing AI note generation (used in normal mode)
  const handleAIGenerateAndReplace = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const request = {
        patientName,
        patientBed,
        noteType: formData.noteType,
        title: formData.title || `${formData.noteType.charAt(0).toUpperCase() + formData.noteType.slice(1)} Note`,
        assessmentFindings: formData.assessmentFindings || "Routine assessment, stable",
        interventions: formData.interventions || "Standard nursing care",
        patientResponse: formData.patientResponse || "Tolerating well, no distress",
        priority: formData.priority,
      };
      const response = await fetch('/api/nurse/generate-nursing-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI failed to generate note');
      setFormData(prev => ({ ...prev, content: data.content }));
    } catch (error: any) {
      setError(error.message || 'AI service unavailable. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }
    onSave({
      patientId, patientName, bed: patientBed,
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
      title: '', noteType: 'progress', content: '', priority: 'routine',
      tags: '', assessmentFindings: '', interventions: '', patientResponse: '',
    });
    setError(null);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      title: '', noteType: 'progress', content: '', priority: 'routine',
      tags: '', assessmentFindings: '', interventions: '', patientResponse: '',
    });
    setSelectedTemplate('progress');
    setError(null);
  };

  const handleChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

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

  const getTemplateButtonClass = (templateKey: string) => {
    return `p-3 rounded-lg border-2 font-semibold text-sm transition-all ${
      selectedTemplate === templateKey
        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700'
        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-blue-300'
    }`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 z-10">
          <div className="p-6 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Nursing Note</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 pt-4 gap-1 border-b border-gray-200 dark:border-slate-700">
            <button onClick={() => setActiveTab('normal')} className={`px-6 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'normal' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              📝 Normal Mode
            </button>
            <button onClick={() => setActiveTab('ai')} className={`px-6 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'ai' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <Sparkles className="w-4 h-4" /> AI Mode
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>
            </div>
          )}

          {/* Patient Info */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border">
            <p className="text-sm"><span className="font-semibold">Patient:</span> {patientName} (Bed {patientBed})</p>
          </div>

          {/* Template Selection (same for both tabs) */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Template</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(NOTE_TEMPLATES).map(([key, template]) => (
                <button key={key} onClick={() => handleApplyTemplate(key)} className={getTemplateButtonClass(key)}>
                  {template.title}
                </button>
              ))}
            </div>
          </div>

          {/* ========== AI VOICE DICTATION PANEL (only in AI Mode) ========== */}
          {activeTab === 'ai' && (
            <div className="border-2 border-purple-200 dark:border-purple-800/40 rounded-xl p-4 bg-purple-50/30 dark:bg-purple-950/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <Wand2 className="w-4 h-4" /> AI Voice Dictation Scribe
                </h3>
                {isActive && (
                  <span className="text-xs text-rose-500 animate-pulse flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isConnecting ? 'bg-amber-500 animate-ping' : 'bg-rose-500 animate-ping'}`} />
                    {isConnecting ? 'Connecting...' : 'Recording...'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Dictate your entire clinical assessment in a single speech stream. Gemini AI will parse and auto‑fill all fields below.</p>
              <Textarea
                value={speechTranscript}
                onChange={(e) => setSpeechTranscript(e.target.value)}
                placeholder="Or paste a transcribed conversation here..."
                rows={4}
                className="bg-white dark:bg-slate-800"
              />
              <LiveMicStatusLine status={micStatus} interimText={interimText} className="text-xs" />
              <div className="flex flex-wrap gap-2 justify-between">
                <div className="flex gap-2 items-center">
                  <select
                    value={micLanguage}
                    onChange={(e) => setMicLanguage(e.target.value)}
                    disabled={isActive}
                    className="text-xs border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800"
                  >
                    <option value="en-IN">English</option>
                    <option value="kn-IN">Kannada</option>
                    <option value="hi-IN">Hindi</option>
                  </select>
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : isConnecting ? "secondary" : "default"}
                    onClick={handleToggleListening}
                    disabled={isConnecting}
                    className="gap-2"
                  >
                    {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {liveMicButtonLabel(micStatus)}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setSpeechTranscript('')} disabled={!speechTranscript}>
                    <Trash2 className="w-4 h-4 mr-1" /> Clear
                  </Button>
                </div>
                <Button type="button" onClick={handleAIParseVoice} disabled={isParsing || !speechTranscript.trim()} className="bg-purple-600 hover:bg-purple-700 gap-2">
                  {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isParsing ? "Parsing..." : "Parse with Gemini AI"}
                </Button>
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Volume2 className="w-3 h-3" /> Quick Presets</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TRANSCRIPTS.map((preset, i) => (
                    <Button key={i} type="button" variant="outline" size="sm" onClick={() => setSpeechTranscript(preset.text)}>
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Common Form Fields (always visible) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VoiceInputField value={formData.title} onChange={(val: string) => handleChange("title", val)} placeholder="Enter note title" label="Note Title *" hint='Say: "Daily Progress Note"' />
            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(val) => handleChange("priority", val)}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">🟢 Routine</SelectItem>
                  <SelectItem value="urgent">🟠 Urgent</SelectItem>
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Note Type</Label>
            <Select value={formData.noteType} onValueChange={(val) => handleChange("noteType", val)}>
              <SelectTrigger><SelectValue placeholder="Select note type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="progress">Progress Note</SelectItem>
                <SelectItem value="admission">Admission Note</SelectItem>
                <SelectItem value="critical">Critical Event</SelectItem>
                <SelectItem value="discharge">Discharge Summary</SelectItem>
                <SelectItem value="post-op">Post-Operative Note</SelectItem>
                <SelectItem value="intervention">Intervention</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VoiceTextareaField value={formData.assessmentFindings} onChange={(val: string) => handleChange("assessmentFindings", val)} placeholder="Patient assessment findings..." label="Assessment Findings" hint='Say: "Lungs clear, heart rate regular, BP 120/80"' rows={3} />
            <VoiceTextareaField value={formData.interventions} onChange={(val: string) => handleChange("interventions", val)} placeholder="Nursing interventions performed..." label="Interventions" hint='Say: "Administered medication, wound care, patient education"' rows={3} />
          </div>

          <VoiceTextareaField value={formData.patientResponse} onChange={(val: string) => handleChange("patientResponse", val)} placeholder="Patient's response to interventions..." label="Patient Response" hint='Say: "Pain decreased to 1/10, patient resting comfortably"' rows={3} />

          {/* Optional Generate button for AI Mode (traditional) */}
          {activeTab === 'ai' && (
            <div className="flex justify-center">
              <Button type="button" onClick={handleAIGenerateAndReplace} disabled={isGenerating} className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg">
                {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating AI Note...</> : <><Sparkles className="w-5 h-5" /> Generate AI Nursing Note</>}
              </Button>
            </div>
          )}

          {/* Final Note Content */}
          <VoiceTextareaField
            value={formData.content}
            onChange={(val: string) => handleChange("content", val)}
            placeholder={activeTab === 'ai' ? "AI‑generated note will appear here after parsing or generation..." : "Enter detailed nursing notes..."}
            label="Note Content *"
            hint={activeTab === 'ai' ? "AI will fill this field automatically based on your dictation or generation." : "Write or speak your nursing note here"}
            rows={12}
          />

          {/* Tags */}
          <VoiceInputField value={formData.tags} onChange={(val: string) => handleChange("tags", val)} placeholder="e.g., vitals, pain, wound care, post-op" label="Tags (comma-separated)" hint='Say: "vitals pain assessment" - commas added automatically' />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleReset} className="flex-1 gap-2"><RotateCcw className="w-4 h-4" /> Reset Form</Button>
            <Button type="button" onClick={handleSave} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Save className="w-4 h-4" /> Save Nursing Note</Button>
          </div>
        </div>
      </div>
    </div>
  );
}