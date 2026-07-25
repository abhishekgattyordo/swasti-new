

'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { currentVisitApi } from "@/lib/api/ehr";
import { LiveTranscriptionSession, mapMicLocale } from "@/lib/speech";
import { AudioRecorder } from "@/lib/audioRecorder";
import toast from "react-hot-toast";
import {
  Sparkles,
  Mic,
  StopCircle,
  List,
  Edit,
  X,
  Save,
  FlaskConical,
  CheckCircle,
  Stethoscope,
  Code,
  FileText,
  Calendar,
  IndianRupee,
  Phone,
  Send,
  Loader2,
  Globe,
  Shield,
  Clipboard,
  CalendarDays,
  Search,
  Minimize2,
  Maximize2,
} from 'lucide-react';

import InsuranceWorkspace, {
  type AnalysisResult,
  type PreAuthForm,
} from "@/components/doctor/InsuranceWorkspace";

interface SoapResponse {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10Codes: Array<{ code: string; description: string }>;
  medications: Array<{ name: string; dosage: string; frequency: string; instructions: string }>;
  followUps: string;
  patientSummary: string;
  confidenceScore: number;
  labOrders?: string[];
  labOrdersDetected?: boolean;
  whatsapp?: { sent: boolean; error: string | null };
  _saved?: boolean;
  _savedId?: number | null;
  chiefComplaint?: string;
  symptoms?: string;
  allergies?: string;
  pastMedications?: string;
  pastSurgeries?: string;
  medicationsTakenToday?: string;
  generalNotes?: string;
}

interface CurrentVisitPageProps {
  patientId?: string;
  appointmentId?: string;
  date?: string | null;
  isRecording?: boolean;
  onRecordingChange?: (recording: boolean) => void;
  onMinimizeChange?: (minimized: boolean) => void; // 👈 added
}

export default function CurrentVisitPage({
  patientId = "P-882910",
  appointmentId = "APT-1002",
  date,
  isRecording: externalIsRecording,
  onRecordingChange,
  onMinimizeChange,
}: CurrentVisitPageProps) {
  // ---- Existing state ----
 const [formData, setFormData] = useState({
  diagnosis: "",
  icd10_code: "",
  clinical_notes: "",
  follow_up_date: "",
  patient_instructions: "",
  consultation_fee: 0,
  // New fields
  chief_complaint: "",
  symptoms: "",
  allergies: "",
  past_medications: "",
  past_surgeries: "",
  medications_taken_today: "",
  general_notes: "",
});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  
  const [labOrders, setLabOrders] = useState<string[]>([]);
  const [labOrdersDetected, setLabOrdersDetected] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<{ sent: boolean; error: string | null } | null>(null);
  
  const [insuranceResult, setInsuranceResult] = useState<AnalysisResult | null>(null);
  const [isInsuranceLoading, setIsInsuranceLoading] = useState(false);
  const [insuranceTab, setInsuranceTab] = useState<"overview" | "form" | "codes" | "checklist" | "json">("overview");
  
  const [adminSignerName, setAdminSignerName] = useState("");
  const [isDigitallySigned, setIsDigitallySigned] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [preAuthId, setPreAuthId] = useState<string | null>(null);
  const [submittingTpa, setSubmittingTpa] = useState(false);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [micLanguage, setMicLanguage] = useState("en-IN");
  const [transcript, setTranscript] = useState("");
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [activeView, setActiveView] = useState<"soap" | "insurance">("soap");
  const [hasRecordedAudio, setHasRecordedAudio] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // ---- Minimize state ----
  const [isMinimized, setIsMinimized] = useState(false);

  // Refs
  const liveSessionRef = useRef<LiveTranscriptionSession | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const recordedAudioRef = useRef<{ base64: string; mimeType: string } | null>(null);
  const finalTranscriptRef = useRef("");
  const timerRef = useRef<any>(null);

  const micLanguageLabels: Record<string, string> = {
    "kn-IN": "Kannada",
    "hi-IN": "Hindi",
    "en-IN": "English",
  };

  const [currentAppointmentId, setCurrentAppointmentId] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");

  // ---- Sync with parent recording state ----
  const isSyncingRef = useRef(false);
  useEffect(() => {
    if (externalIsRecording === undefined) return;
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    if (externalIsRecording) {
      if (!isRecording) {
        startRecording();
      }
    } else {
      if (isRecording) {
        stopRecording();
      }
    }
    isSyncingRef.current = false;
  }, [externalIsRecording]);

  // ---- Notify parent when minimize changes ----
  useEffect(() => {
    if (onMinimizeChange) {
      onMinimizeChange(isMinimized);
    }
  }, [isMinimized, onMinimizeChange]);

  // ---- Data fetching ----
  useEffect(() => {
    if (appointmentId) {
      setCurrentAppointmentId(appointmentId);
    }
  }, [appointmentId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (date) {
          response = await currentVisitApi.getCurrentVisitByDate(patientId, date);
        } else if (appointmentId) {
          response = await currentVisitApi.getCurrentVisit(patientId, appointmentId);
        } else {
          response = await currentVisitApi.getCurrentVisit(patientId);
        }

        const visitData =
          response && typeof response === 'object' && 'success' in response
            ? response.data
            : response;

        if (visitData && typeof visitData === 'object' && Object.keys(visitData).length > 0) {
          const formattedDate = visitData.follow_up_date
            ? visitData.follow_up_date.split("T")[0]
            : "";

        setFormData({
  diagnosis: visitData.diagnosis || "",
  icd10_code: visitData.icd10_code || "",
  clinical_notes: visitData.clinical_notes || "",
  follow_up_date: formattedDate,
  patient_instructions: visitData.patient_instructions || "",
  consultation_fee: visitData.consultation_fee || 0,
  // 👇 New fields
  chief_complaint: visitData.chief_complaint || "",
  symptoms: visitData.symptoms || "",
  allergies: visitData.allergies || "",
  past_medications: visitData.past_medications || "",
  past_surgeries: visitData.past_surgeries || "",
  medications_taken_today: visitData.medications_taken_today || "",
  general_notes: visitData.general_notes || "",
});

          if (visitData.patient_phone) {
            setWhatsappNumber(visitData.patient_phone);
          }
        } else {
       setFormData({
  diagnosis: "",
  icd10_code: "",
  clinical_notes: "",
  follow_up_date: "",
  patient_instructions: "",
  consultation_fee: 0,
  chief_complaint: "",
  symptoms: "",
  allergies: "",
  past_medications: "",
  past_surgeries: "",
  medications_taken_today: "",
  general_notes: "",
});
        }
      } catch (error: any) {
        console.error("Error fetching current visit:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, appointmentId, date]);

  // Restore audio from localStorage
  useEffect(() => {
    try {
      const savedAudio = localStorage.getItem(`stored_voice_${patientId}`);
      if (savedAudio) {
        const parsed = JSON.parse(savedAudio);
        if (parsed && parsed.base64 && parsed.mimeType) {
          recordedAudioRef.current = parsed;
          setRecordedAudioUrl(`data:${parsed.mimeType};base64,${parsed.base64}`);
          setHasRecordedAudio(true);
        }
      }
    } catch (e) {
      console.warn("Could not load stored voice from localStorage", e);
    }
  }, [patientId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      liveSessionRef.current?.cancel();
    };
  }, []);

  // ---- Timer ----
  const startDurationTimer = () => {
    setRecordingDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ---- Recording functions ----
  const startRecording = async () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.cancel();
      liveSessionRef.current = null;
    }
    if (audioRecorderRef.current) {
      try { await audioRecorderRef.current.stop(); } catch (e) {}
      audioRecorderRef.current = null;
    }

    setTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
    setEditableTranscript("");
    recordedAudioRef.current = null;
    setHasRecordedAudio(false);

    const session = new LiveTranscriptionSession();
    liveSessionRef.current = session;

    const recorder = new AudioRecorder();
    audioRecorderRef.current = recorder;

    setIsConnecting(true);

    try {
      await recorder.start();
      try {
        await session.start(
          (state) => {
            finalTranscriptRef.current = state.finalLines.join(" ");
            setTranscript(state.fullText);
            setEditableTranscript(state.fullText);
            setInterimTranscript(state.interimText);
          },
          { language: mapMicLocale(micLanguage) }
        );
      } catch (speechErr) {
        console.warn("Live speech recognition captioning warning:", speechErr);
      }

      setIsConnecting(false);
      setIsRecording(true);
      startDurationTimer();
      if (onRecordingChange) onRecordingChange(true);
      toast.success(
        `🎙️ Direct Voice to AI Recording active (${micLanguageLabels[micLanguage] ?? micLanguage}). Speak directly!`
      );
    } catch (err) {
      liveSessionRef.current = null;
      audioRecorderRef.current = null;
      setIsConnecting(false);
      const message = err instanceof Error ? err.message : "Failed to start recording";
      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
      ) {
        toast.error("Microphone permission denied. Please allow access and try again.");
      } else {
        toast.error(message);
      }
    }
  };

  const stopRecording = async () => {
    const session = liveSessionRef.current;
    const recorder = audioRecorderRef.current;

    if (!session && !recorder) {
      setIsConnecting(false);
      setIsRecording(false);
      stopDurationTimer();
      if (onRecordingChange) onRecordingChange(false);
      return;
    }

    try {
      if (recorder) {
        const audioRes = await recorder.stop();
        const audioDataObj = {
          base64: audioRes.base64,
          mimeType: audioRes.mimeType
        };
        recordedAudioRef.current = audioDataObj;
        const dataUrl = `data:${audioRes.mimeType};base64,${audioRes.base64}`;
        setRecordedAudioUrl(dataUrl);
        setHasRecordedAudio(true);

        try {
          localStorage.setItem(`stored_voice_${patientId}`, JSON.stringify(audioDataObj));
        } catch (e) {
          console.warn("Could not save voice to localStorage", e);
        }
      }
    } catch (recorderErr) {
      console.warn("Audio recorder stop error:", recorderErr);
    }

    if (session) {
      try {
        const state = await session.stop();
        finalTranscriptRef.current = state.finalLines.join(" ");
        setTranscript(state.fullText);
        setEditableTranscript(state.fullText);
        setInterimTranscript("");
      } catch (sessionErr) {
        console.warn("Session stop error:", sessionErr);
      }
    }

    liveSessionRef.current = null;
    audioRecorderRef.current = null;
    setIsConnecting(false);
    setIsRecording(false);
    stopDurationTimer();
    if (onRecordingChange) onRecordingChange(false);
    toast.success("🎙️ Voice recording captured! Ready for direct Voice-to-AI processing.");
  };

  // ---- Other handlers ----
  const clearTranscript = () => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setEditableTranscript("");
    recordedAudioRef.current = null;
    setRecordedAudioUrl(null);
    setHasRecordedAudio(false);
    setLabOrders([]);
    setLabOrdersDetected(false);
    setWhatsappStatus(null);
    try {
      localStorage.removeItem(`stored_voice_${patientId}`);
    } catch (e) {}
    toast.success("Transcript and stored voice recording cleared");
  };

  const openTranscriptDialog = () => {
    const current = transcript || finalTranscriptRef.current || editableTranscript;
    setEditableTranscript(current || formData.clinical_notes || "");
    setEditMode(true);
    setShowTranscriptDialog(true);
  };

  const saveEditedTranscript = () => {
    finalTranscriptRef.current = editableTranscript;
    setTranscript(editableTranscript);
    setEditMode(false);
    toast.success("Transcript updated successfully");
  };

  const handleGenerateFromTranscript = async () => {
    let currentTranscript = transcript || finalTranscriptRef.current || editableTranscript;
    const audioData = recordedAudioRef.current;

    if (!currentTranscript && !audioData && formData.clinical_notes && formData.clinical_notes.trim().length > 0) {
      currentTranscript = formData.clinical_notes;
    }

    if (!currentTranscript && !audioData) {
      toast.error("No audio recording or transcript found. Please speak into the microphone first.");
      return;
    }

    setGeneratingNotes(true);
    const loadingToast = toast.loading(
      audioData 
        ? "🎙️ Analyzing voice audio directly with Gemini AI..." 
        : "Generating clinical notes from conversation..."
    );

    try {
      const response = await fetch("/api/doctors/ai/soap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: currentTranscript || "",
          audioBase64: audioData?.base64,
          mimeType: audioData?.mimeType,
          patientId: patientId,
          userId: 1,
          saveToHistory: true,
           chief_complaint: formData.chief_complaint,
  symptoms: formData.symptoms,
  allergies: formData.allergies,
  past_medications: formData.past_medications,
  past_surgeries: formData.past_surgeries,
  medications_taken_today: formData.medications_taken_today,
  general_notes: formData.general_notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const soapData: SoapResponse = await response.json();
      
      const extractedDiagnosis = extractDiagnosisFromAssessment(soapData.assessment);
      let extractedICD10 = "";
      if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
        extractedICD10 = soapData.icd10Codes[0]?.code || "";
      }
      const formattedNotes = formatSOAPNotesForClinicalNotes(soapData);
      const followUpDate = extractFollowUpDate(soapData.followUps || soapData.plan || "");
      const patientInstructions = soapData.patientSummary || soapData.plan || "";
      
      setFormData((prev) => ({
        ...prev,
        diagnosis: extractedDiagnosis || prev.diagnosis,
        icd10_code: extractedICD10 || prev.icd10_code,
        clinical_notes: formattedNotes || prev.clinical_notes,
        patient_instructions: patientInstructions || prev.patient_instructions,
        follow_up_date: followUpDate || prev.follow_up_date,
        chief_complaint: soapData.chiefComplaint || prev.chief_complaint,
  symptoms: soapData.symptoms || prev.symptoms,
  allergies: soapData.allergies || prev.allergies,
  past_medications: soapData.pastMedications || prev.past_medications,
  past_surgeries: soapData.pastSurgeries || prev.past_surgeries,
  medications_taken_today: soapData.medicationsTakenToday || prev.medications_taken_today,
  general_notes: soapData.generalNotes || prev.general_notes,
      }));

      if (soapData.labOrders && soapData.labOrders.length > 0) {
        setLabOrders(soapData.labOrders);
        setLabOrdersDetected(true);
        
        toast.success(`🧪 Lab Orders Detected: ${soapData.labOrders.join(", ")}`, {
          duration: 5000,
        });

        if (soapData.whatsapp) {
          setWhatsappStatus(soapData.whatsapp);
          if (soapData.whatsapp.sent) {
            toast.success("✅ WhatsApp notification sent to Lab In-charge!", {
              duration: 4000,
            });
          } else {
            toast.error(`❌ WhatsApp failed: ${soapData.whatsapp.error}`, {
              duration: 4000,
            });
          }
        }
      } else {
        setLabOrders([]);
        setLabOrdersDetected(false);
        setWhatsappStatus(null);
      }

      toast.success("SOAP notes generated successfully from direct voice audio!", {
        duration: 4000,
      });

    } catch (error: any) {
      console.error("Error generating SOAP notes:", error);
      toast.error(`Failed to generate notes: ${error.message}`);
    } finally {
      toast.dismiss(loadingToast);
      setGeneratingNotes(false);
    }
  };

  const handleGenerateInsurance = async () => {
    let currentTranscript = transcript || finalTranscriptRef.current || editableTranscript;
    const audioData = recordedAudioRef.current;

    if (!currentTranscript && !audioData && formData.clinical_notes && formData.clinical_notes.trim().length > 0) {
      currentTranscript = formData.clinical_notes;
    }

    if (!currentTranscript && !audioData) {
      toast.error("No audio recording or transcript found. Please speak into the microphone first.");
      return;
    }

    setIsInsuranceLoading(true);
    const loadingToast = toast.loading(
      audioData 
        ? "🎙️ Processing voice audio directly for insurance pre-authorization..." 
        : "Generating insurance pre-authorization data..."
    );

    try {
      const response = await fetch("/api/doctors/ai/insurance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: currentTranscript || "",
          audioBase64: audioData?.base64,
          mimeType: audioData?.mimeType,
          patientId: patientId,
          userId: 1,
          saveToHistory: true,
           chief_complaint: formData.chief_complaint,
  symptoms: formData.symptoms,
  allergies: formData.allergies,
  past_medications: formData.past_medications,
  past_surgeries: formData.past_surgeries,
  medications_taken_today: formData.medications_taken_today,
  general_notes: formData.general_notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const insuranceData = await response.json();

      setInsuranceResult(insuranceData);
      setActiveView("insurance");
      setInsuranceTab("overview");
      
      toast.success("Insurance pre-authorization data generated from voice audio!", {
        duration: 4000,
      });

    } catch (error: any) {
      console.error("Error generating insurance data:", error);
      toast.error(`Failed to generate insurance data: ${error.message}`);
    } finally {
      toast.dismiss(loadingToast);
      setIsInsuranceLoading(false);
    }
  };

  // ---- Helpers (placeholders - actual implementation from earlier) ----
  const extractDiagnosisFromAssessment = (assessment: string): string => {
    if (!assessment) return "";
    const lines = assessment.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      const numberedMatch = trimmedLine.match(/^\d+\.\s*(.+?)(?:\s*[-–—]|\s*\(|$)/);
      if (numberedMatch) {
        const diagnosis = numberedMatch[1].trim();
        if (diagnosis.length > 3 && diagnosis.length < 150) return diagnosis;
      }
      const bulletMatch = trimmedLine.match(/^[-•]\s*(.+?)(?:\s*[-–—]|\s*\(|$)/);
      if (bulletMatch) {
        const diagnosis = bulletMatch[1].trim();
        if (diagnosis.length > 3 && diagnosis.length < 150) return diagnosis;
      }
      if (trimmedLine.toLowerCase().includes("diagnosis") || trimmedLine.toLowerCase().includes("primary")) {
        const colonMatch = trimmedLine.match(/[:]\s*(.+?)(?:\s*[-–—]|$)/);
        if (colonMatch) {
          const diagnosis = colonMatch[1].trim();
          if (diagnosis.length > 3 && diagnosis.length < 150) return diagnosis;
        }
      }
    }
    const firstLine = lines.find(line => line.trim().length > 10);
    return firstLine ? firstLine.trim().substring(0, 100) : "";
  };

  const formatSOAPNotesForClinicalNotes = (soapData: any): string => {
    const sections = [];
    if (soapData.subjective) sections.push("=== SUBJECTIVE ===\n" + soapData.subjective);
    if (soapData.objective) sections.push("=== OBJECTIVE ===\n" + soapData.objective);
    if (soapData.assessment) sections.push("=== ASSESSMENT ===\n" + soapData.assessment);
    if (soapData.plan) sections.push("=== PLAN ===\n" + soapData.plan);
    if (soapData.medications && soapData.medications.length > 0) {
      const medsText = soapData.medications.map((m: any) => 
        `• ${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.frequency ? ` - ${m.frequency}` : ""}`
      ).join("\n");
      sections.push("=== MEDICATIONS ===\n" + medsText);
    }
    if (soapData.icd10Codes && soapData.icd10Codes.length > 0) {
      const codesText = soapData.icd10Codes.map((c: any) => `• ${c.code}: ${c.description}`).join("\n");
      sections.push("=== ICD-10 CODES ===\n" + codesText);
    }
    if (soapData.confidenceScore) sections.push(`=== CONFIDENCE SCORE ===\n${soapData.confidenceScore}%`);
    if (soapData.labOrders && soapData.labOrders.length > 0) {
      sections.push("=== LAB ORDERS ===\n" + soapData.labOrders.map((l: string) => `• ${l}`).join("\n"));
    }
    return sections.join("\n\n");
  };

  const extractFollowUpDate = (followUps: string): string => {
    if (!followUps) return "";
    const dayMatch = followUps.match(/(\d+)\s+days?/i);
    if (dayMatch) {
      const date = new Date();
      date.setDate(date.getDate() + parseInt(dayMatch[1]));
      return date.toISOString().split("T")[0];
    }
    const weekMatch = followUps.match(/(\d+)\s+weeks?/i);
    if (weekMatch) {
      const date = new Date();
      date.setDate(date.getDate() + (parseInt(weekMatch[1]) * 7));
      return date.toISOString().split("T")[0];
    }
    const dateMatch = followUps.match(/\d{4}-\d{2}-\d{2}/);
    return dateMatch ? dateMatch[0] : "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { ...formData };
      if (date) {
        payload.date = date;
      } else if (appointmentId) {
        payload.appointmentId = appointmentId;
      }
      payload.consultation_fee = parseFloat(payload.consultation_fee as any) || 0;

      const response = await currentVisitApi.saveCurrentVisit(patientId, payload);
      const json = response?.data !== undefined ? response.data : response;

      if (json && (json.success || json.appointmentId)) {
        toast.success(json.message || "Current visit saved");
        if (json.appointmentId) {
          setCurrentAppointmentId(json.appointmentId);
        }
      } else {
        toast.error(json?.message || "Save completed");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving visit");
    } finally {
      setSaving(false);
    }
  };

  const handleSendToWhatsApp = async () => {
    if (!currentAppointmentId) {
      toast.error("No appointment selected. Please save the visit first.");
      return;
    }

    if (!whatsappNumber || whatsappNumber.trim() === "") {
      toast.error("Please enter a WhatsApp number.");
      return;
    }

    const loadingToast = toast.loading("Generating prescription PDF...");

    try {
      const res = await fetch(`/api/ehr/${patientId}/prescription-report?appointmentId=${currentAppointmentId}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const reportData = await res.json();
      const data = reportData.data || reportData;

      const pdfRes = await fetch("/api/doctors/prescription-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: data.patient?.name || "Patient",
          patientId: data.patient?.id || patientId,
          doctorName: data.doctor?.name || "Dr. Attending Physician",
          doctorSpecialty: data.doctor?.specialty || "General Practice",
          licenseNo: data.doctor?.licenseNo || "MCI-884920",
          diagnosis: data.clinicalFindings?.diagnosis || formData.diagnosis,
          medications: data.medications || [],
          vitals: data.vitals || "Normal",
          followUp: data.followUp || formData.follow_up_date,
          instructions: data.patientInstructions || formData.patient_instructions,
          documentRef: data.document?.ref || `DOC-${Date.now()}`,
          sealedDate: data.document?.sealedDateTime || new Date().toISOString(),
        }),
      });

      if (!pdfRes.ok) throw new Error("Failed to generate PDF");
      const pdfResult = await pdfRes.json();
      const pdfUrl = pdfResult.url;

      let formattedPhone = whatsappNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.substring(1);
      if (formattedPhone.length === 10 && !formattedPhone.startsWith('91')) formattedPhone = '91' + formattedPhone;
      if (formattedPhone.length < 10) {
        toast.error("Invalid phone number.");
        return;
      }

      let message = `🏥 *St. Mary Advanced Medical Center*\n`;
      message += `Your prescription (Ref: ${data.document?.ref || 'DOC-10293'}) is ready.\n\n`;
      message += `📄 *Download PDF:* ${pdfUrl}\n\n`;
      message += `*Summary:*\n`;
      message += `Diagnosis: ${data.clinicalFindings?.diagnosis || formData.diagnosis || "N/A"}\n`;
      if (data.medications && data.medications.length > 0) {
        message += `Medications: ${data.medications.map((m: any) => m.name).join(", ")}\n`;
      }
      if (data.followUp || formData.follow_up_date) message += `Follow-up: ${data.followUp || formData.follow_up_date}\n`;
      message += `\n🔒 Digitally sealed.\n📞 For queries, contact the hospital.`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");
      toast.success("WhatsApp opened with PDF download link", { duration: 4000 });
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Failed: ${error.message}`);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  // Insurance helper functions
  const calculateCompletionPercentage = () => {
    if (!insuranceResult || !insuranceResult.preAuthForm) return 0;
    const f = insuranceResult.preAuthForm;
    const fields = [
      f.patientInfo?.name,
      f.patientInfo?.age,
      f.patientInfo?.gender,
      f.patientInfo?.address,
      f.patientInfo?.phone,
      f.patientInfo?.policyNumber,
      f.patientInfo?.tpaName,
      f.patientInfo?.insurerName,
      f.diagnosisDetails?.primaryDiagnosis,
      f.diagnosisDetails?.icd10Codes,
      f.diagnosisDetails?.clinicalFindings,
      f.diagnosisDetails?.durationOfIllness,
      f.diagnosisDetails?.pastMedicalHistory,
      f.proposedTreatment?.procedureName,
      f.proposedTreatment?.procedureCode,
      f.proposedTreatment?.treatmentType,
      f.proposedTreatment?.clinicalJustification,
      f.hospitalizationDetails?.hospitalName,
      f.hospitalizationDetails?.providerId,
      f.hospitalizationDetails?.roomCategoryRequested,
      f.hospitalizationDetails?.proposedAdmissionDate,
      f.hospitalizationDetails?.expectedLengthOfStay,
      f.costEstimation?.roomRentPerDay,
      f.costEstimation?.icuCharges,
      f.costEstimation?.investigationCosts,
      f.costEstimation?.surgeryCharges,
      f.costEstimation?.professionalFees,
      f.costEstimation?.medicinesCost,
      f.costEstimation?.totalEstimatedCost,
      f.treatingDoctor?.physicianName,
      f.treatingDoctor?.registrationNumber,
      f.treatingDoctor?.specialization,
      f.treatingDoctor?.contact,
    ];
    const filled = fields.filter((val) => val && val !== "Requires Review" && String(val).trim() !== "");
    return Math.round((filled.length / fields.length) * 100);
  };

  const getMissingFieldsList = () => {
    if (!insuranceResult || !insuranceResult.preAuthForm) return [];
    const missing: string[] = [];
    const f = insuranceResult.preAuthForm;

    if (!f.patientInfo?.name || f.patientInfo?.name === "Requires Review") missing.push("Patient Name");
    if (!f.patientInfo?.phone || f.patientInfo?.phone === "Requires Review") missing.push("Patient Phone Contact");
    if (!f.patientInfo?.policyNumber || f.patientInfo?.policyNumber === "Requires Review") missing.push("Policy Number / Member ID");
    if (!f.patientInfo?.tpaName || f.patientInfo?.tpaName === "Requires Review") missing.push("Third Party Administrator (TPA)");
    if (!f.patientInfo?.insurerName || f.patientInfo?.insurerName === "Requires Review") missing.push("Insurance Carrier Name");
    if (!f.treatingDoctor?.registrationNumber || f.treatingDoctor?.registrationNumber === "Requires Review") missing.push("Physician MCI Registry Number");
    if (!f.hospitalizationDetails?.providerId || f.hospitalizationDetails?.providerId === "Requires Review") missing.push("Hospital ROHINI ID");

    return missing;
  };

  const handleUpdateField = (section: keyof PreAuthForm, field: string, value: string) => {
    if (!insuranceResult) return;
    setInsuranceResult((prev) => {
      if (!prev) return null;
      const updatedForm = { ...prev.preAuthForm };
      const subSection = updatedForm[section] as any;
      if (subSection) {
        subSection[field] = value;
      }
      return {
        ...prev,
        preAuthForm: updatedForm,
      };
    });
  };

  const handleSubmitTpa = () => {
    if (!insuranceResult) return;
    if (!isDigitallySigned) {
      alert("Please review the pre-filled fields and apply your Digital Signature and Clearance Stamp first!");
      return;
    }
    setSubmittingTpa(true);
    setSubmitStep(1);

    setTimeout(() => {
      setSubmitStep(2);
      setTimeout(() => {
        setSubmitStep(3);
        setTimeout(() => {
          setSubmitStep(4);
          setTimeout(() => {
            setSubmitStep(5);
            const codeSuffix = Math.floor(100000 + Math.random() * 900000);
            const generatedAuthId = `SWASTHI-AUTH-${codeSuffix}`;
            setPreAuthId(generatedAuthId);
            setSubmittingTpa(false);
            toast.success("✅ Pre-Authorization submitted successfully!");
          }, 1200);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  // ---- Render ----
  if (loading) return <div className="text-center py-8">Loading current visit data...</div>;

  // ---- Minimized floating bar ----
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[100] bg-white rounded-xl shadow-2xl border border-slate-200 p-4 flex items-center gap-4 min-w-[280px]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-xs font-medium">
            {isRecording ? `Recording... ${recordingDuration}s` : hasRecordedAudio ? 'Audio ready' : 'Not Recording'}
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1 hover:bg-slate-100 rounded transition-colors"
          title="Expand"
        >
          <Maximize2 className="h-4 w-4 text-slate-600" />
        </button>
        {isRecording && (
          <button
            onClick={stopRecording}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
          >
            Stop
          </button>
        )}
        {!isRecording && hasRecordedAudio && (
          <button
            onClick={handleGenerateFromTranscript}
            className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors"
          >
            Create SOAP
          </button>
        )}
        {hasRecordedAudio && (
          <button
            onClick={clearTranscript}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        )}
      </div>
    );
  }

  // ---- Full workspace (main UI) ----
  return (
    <div className="flex flex-col gap-8 text-slate-800">
      {/* View Switcher with Minimize button */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveView("soap")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeView === "soap"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📋 SOAP Notes
        </button>
        <button
          onClick={() => setActiveView("insurance")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeView === "insurance"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🏥 Insurance Pre-Auth
        </button>
        {insuranceResult && (
          <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200">
            ✅ Data Ready
          </span>
        )}
        <button
          onClick={() => setIsMinimized(true)}
          className="ml-auto p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Minimize workspace"
        >
          <Minimize2 className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      {/* Lab Orders Alert Banner */}
      {labOrdersDetected && labOrders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-4 rounded-r-xl shadow-xs">
          <div className="flex items-start gap-3">
            <FlaskConical className="h-6 w-6 text-amber-600 shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-800 flex items-center gap-2">
                🧪 Lab Orders Detected
                {whatsappStatus && (
                  <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${
                    whatsappStatus.sent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {whatsappStatus.sent ? '✅ WhatsApp Sent' : `❌ ${whatsappStatus.error || 'Failed'}`}
                  </span>
                )}
              </h4>
              <ul className="mt-1 list-disc list-inside text-sm text-amber-800">
                {labOrders.map((lab, index) => (
                  <li key={index}>{lab}</li>
                ))}
              </ul>
              {whatsappStatus && whatsappStatus.sent && (
                <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  WhatsApp notification sent to Lab In-charge
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setLabOrders([]);
                setLabOrdersDetected(false);
                setWhatsappStatus(null);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Transcript Dialog Modal - Editable */}
      {showTranscriptDialog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                {editMode ? (
                  <Edit className="h-5 w-5 text-blue-600" />
                ) : (
                  <FileText className="h-5 w-5 text-blue-600" />
                )}
                <h2 className="text-lg font-bold text-slate-900">
                  {editMode ? "Edit Conversation Transcript" : "Conversation Transcript"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {!editMode && (transcript || finalTranscriptRef.current) && (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-blue-600"
                    title="Edit transcript"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                )}
                {editMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setEditableTranscript(transcript || finalTranscriptRef.current);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                    title="Cancel edit"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowTranscriptDialog(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {editMode ? (
                <textarea
                  value={editableTranscript}
                  onChange={(e) => setEditableTranscript(e.target.value)}
                  className="w-full h-full min-h-[350px] rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 resize-none p-4 shadow-xs font-mono"
                  placeholder="Edit the transcript here. You can add, remove, or modify any part of the conversation..."
                />
              ) : (
                <div className="bg-slate-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                    {transcript || finalTranscriptRef.current || "No transcript available. Click the microphone button to start recording."}
                  </pre>
                  {interimTranscript && !editMode && (
                    <div className="text-slate-400 italic mt-2">
                      {interimTranscript}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-slate-200">
              {editMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setEditableTranscript(transcript || finalTranscriptRef.current);
                    }}
                    className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEditedTranscript}
                    className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={clearTranscript}
                    className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={!transcript && !finalTranscriptRef.current}
                  >
                    Clear Transcript
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTranscriptDialog(false)}
                    className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateFromTranscript}
                    disabled={generatingNotes}
                    className="px-4 py-2 text-xs font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate SOAP Notes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Button Section with Multi-Language Microphone */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Clinical Scribe</h3>
              <p className="text-xs text-slate-500">Record consultation in any Indian language (English, Kannada, Hindi)</p>
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap items-center">
            {/* Language Selection Dropdown */}
            <div className="flex items-center gap-1 bg-white border border-purple-200 px-3 py-2 rounded-lg shadow-2xs">
              <Globe className="h-4 w-4 text-blue-500 shrink-0" />
              <select 
                className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer pr-1"
                value={micLanguage}
                onChange={(e) => {
                  setMicLanguage(e.target.value);
                  toast.success(
                    `Language set to: ${micLanguageLabels[e.target.value] ?? e.target.value}`
                  );
                }}
                disabled={isRecording || isConnecting}
              >
                <option value="en-IN">English</option>
                <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
                <option value="hi-IN">हिंदी (Hindi / Hinglish)</option>
              </select>
            </div>

            {/* Record Button */}
            <button
              type="button"
              onClick={() => {
                if (isRecording) {
                  stopRecording();
                } else {
                  startRecording();
                }
              }}
              disabled={isConnecting}
              className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-xs text-xs font-bold disabled:opacity-80 ${
                isRecording 
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
                  : isConnecting
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              <Mic className={`h-4 w-4 ${isConnecting ? "animate-spin" : ""}`} />
              {isConnecting
                ? "Connecting..."
                : isRecording
                  ? `Recording... ${recordingDuration}s`
                  : "Start Recording"}
            </button>
            
            {/* Stop Button */}
            {isRecording && (
              <button
                type="button"
                onClick={stopRecording}
                className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200 flex items-center gap-2 shadow-xs text-xs font-bold"
              >
                <StopCircle className="h-4 w-4" />
                Stop
              </button>
            )}
            
            {/* View/Edit Transcript Button */}
            <button
              type="button"
              onClick={openTranscriptDialog}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-xs text-xs font-bold"
            >
              <List className="h-4 w-4" />
              View/Edit Transcript
              {(transcript || finalTranscriptRef.current) && (
                <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                  {(transcript || finalTranscriptRef.current).split(' ').filter(Boolean).length}
                </span>
              )}
            </button>
            
            {/* Generate SOAP Button */}
            <button
              type="button"
              onClick={handleGenerateFromTranscript}
              disabled={generatingNotes}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-xs text-xs font-bold"
            >
              <Sparkles className={`h-4 w-4 ${generatingNotes ? "animate-spin" : ""}`} />
              {generatingNotes ? "Generating..." : "AI SOAP"}
            </button>
            
            {/* Generate Insurance Button */}
            <button
              type="button"
              onClick={handleGenerateInsurance}
              disabled={isInsuranceLoading}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-xs text-xs font-bold"
            >
              <Shield className={`h-4 w-4 ${isInsuranceLoading ? "animate-spin" : ""}`} />
              {isInsuranceLoading ? "Generating..." : "AI Insurance"}
            </button>
          </div>
        </div>
        
        {/* Recording / connecting status */}
        {hasRecordedAudio && !isRecording && (
          <div className="mt-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-3.5 rounded-xl border border-purple-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 font-bold text-xs text-purple-900">
                <Mic className="h-4 w-4 text-purple-600 animate-pulse" />
                <span>Stored Consultation Voice Recording ({micLanguageLabels[micLanguage] ?? micLanguage})</span>
                <span className="text-[10px] bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Voice-to-AI Stored
                </span>
              </span>
              <div className="flex items-center gap-2">
                {recordedAudioUrl && (
                  <a
                    href={recordedAudioUrl}
                    download={`voice_consultation_${patientId}.webm`}
                    className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 hover:underline"
                  >
                    Download Audio
                  </a>
                )}
                <button
                  onClick={clearTranscript}
                  type="button"
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                >
                  Clear Audio
                </button>
              </div>
            </div>
            {recordedAudioUrl && (
              <audio
                controls
                src={recordedAudioUrl}
                className="w-full h-9 rounded-lg outline-none bg-white border border-purple-200/80 shadow-2xs"
              />
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-purple-200/60 pt-2.5">
              <p className="text-[11px] text-purple-800/80">
                ⚡ Voice recording stored. Click below to generate structured SOAP clinical notes directly from your audio recording.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateFromTranscript}
                  disabled={generatingNotes}
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-xs text-xs font-bold"
                >
                  <Sparkles className={`h-4 w-4 ${generatingNotes ? "animate-spin" : ""}`} />
                  {generatingNotes ? "Processing Voice Audio..." : "Create SOAP from Voice"}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateInsurance}
                  disabled={isInsuranceLoading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-xs text-xs font-bold"
                >
                  <Shield className={`h-4 w-4 ${isInsuranceLoading ? "animate-spin" : ""}`} />
                  {isInsuranceLoading ? "Generating..." : "Insurance Pre-Auth"}
                </button>
              </div>
            </div>
          </div>
        )}
        {isConnecting && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting microphone...</span>
          </div>
        )}
        {isRecording && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
            <span>Listening in <strong>{micLanguageLabels[micLanguage] ?? micLanguage}</strong>. Speak naturally into microphone!</span>
          </div>
        )}
        
        {/* Live Transcript Preview */}
        {(transcript || finalTranscriptRef.current) && !showTranscriptDialog && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Live Transcript Preview:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openTranscriptDialog}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={clearTranscript}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-700 font-mono leading-relaxed bg-slate-50/80 p-2.5 rounded-lg">
              {transcript || finalTranscriptRef.current}
            </p>
          </div>
        )}
      </div>

      {/* Render either SOAP or Insurance view */}
      {activeView === "soap" ? (
        // SOAP form sections (unchanged)
        <>
          {/* ---- Assessment & Diagnosis (with Patient History fields) ---- */}
<section className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-6">
  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
        <Clipboard className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">Assessment & Diagnosis</h3>
        <p className="text-xs text-slate-500">Primary evaluation and clinical findings</p>
      </div>
    </div>
    <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200">
      {saving ? "Saving..." : "Draft ready"}
    </span>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Chief Complaint – full width */}
    <div className="flex flex-col gap-2 md:col-span-2">
      <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
        <span className="text-red-500">*</span> Chief Complaint
      </label>
      <input
        name="chief_complaint"
        value={formData.chief_complaint}
        onChange={handleChange}
        className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 px-4 py-2.5 shadow-2xs"
        placeholder="e.g. Chest pain, shortness of breath"
      />
    </div>

    {/* Symptoms – full width */}
    <div className="flex flex-col gap-2 md:col-span-2">
      <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
        Symptoms
      </label>
      <textarea
        name="symptoms"
        value={formData.symptoms}
        onChange={handleChange}
        rows={2}
        className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 resize-none p-3 shadow-2xs"
        placeholder="List all symptoms reported by the patient..."
      />
    </div>

    {/* Allergies */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
        Allergies
      </label>
      <input
        name="allergies"
        value={formData.allergies}
        onChange={handleChange}
        className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 px-4 py-2.5 shadow-2xs"
        placeholder="e.g. Penicillin, peanuts"
      />
    </div>

    {/* Past Medications */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
        Past Medications
      </label>
      <input
        name="past_medications"
        value={formData.past_medications}
        onChange={handleChange}
        className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 px-4 py-2.5 shadow-2xs"
        placeholder="e.g. Amlodipine, Metformin"
      />
    </div>

    {/* Past Surgeries */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
        Any Surgeries
      </label>
      <input
        name="past_surgeries"
        value={formData.past_surgeries}
        onChange={handleChange}
        className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 px-4 py-2.5 shadow-2xs"
        placeholder="e.g. Appendectomy (2018)"
      />
    </div>

    {/* Medications Taken Today */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
        Medications Taken Today
      </label>
      <input
        name="medications_taken_today"
        value={formData.medications_taken_today}
        onChange={handleChange}
        className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 px-4 py-2.5 shadow-2xs"
        placeholder="e.g. Took Aspirin 81mg this morning"
      />
    </div>

    {/* General Notes – full width */}
    <div className="flex flex-col gap-2 md:col-span-2">
      <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
        General Notes
      </label>
      <textarea
        name="general_notes"
        value={formData.general_notes}
        onChange={handleChange}
        rows={3}
        className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 resize-none p-3 shadow-2xs"
        placeholder="Any additional observations, context, or notes..."
      />
    </div>

    {/* Primary Diagnosis & ICD-10 – unchanged */}
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
        <Stethoscope className="h-4 w-4 text-slate-400" />
        Primary Diagnosis
      </label>
      <div className="relative">
        <input
          name="diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 pl-9 py-2.5 shadow-2xs font-medium"
          placeholder="e.g. Acute Bronchitis"
          type="text"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
        <Code className="h-4 w-4 text-slate-400" />
        ICD-10 Code
      </label>
      <input
        name="icd10_code"
        value={formData.icd10_code}
        onChange={handleChange}
        className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 py-2.5 px-3 shadow-2xs font-mono"
        type="text"
        placeholder="e.g. M54.5"
      />
    </div>
  </div>

  {/* Clinical Notes – unchanged */}
  <div className="flex flex-col gap-2">
    <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
      <FileText className="h-4 w-4 text-slate-400" />
      Clinical Notes
    </label>
    <textarea
      name="clinical_notes"
      value={formData.clinical_notes}
      onChange={handleChange}
      className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 resize-none p-3 shadow-2xs font-mono leading-relaxed"
      placeholder="Enter patient complaints, observations, and assessment details... or record conversation and click 'AI SOAP' to auto-populate"
      rows={10}
    />
  </div>
</section>

          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Follow-up & Instructions</h3>
                <p className="text-xs text-slate-500">Schedule next visit and patient guidance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Follow-up Date
                </label>
                <input
                  name="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 px-3 py-2.5 shadow-2xs"
                  type="date"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  Patient Instructions
                </label>
                <textarea
                  name="patient_instructions"
                  value={formData.patient_instructions}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 resize-none p-3 shadow-2xs"
                  placeholder="Additional instructions..."
                  rows={3}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-5 rounded-xl border border-blue-100 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Consultation Fee</h3>
                <p className="text-xs text-slate-500">Enter the fee for this visit (manually adjustable)</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-w-xs">
              <label className="text-xs font-semibold text-slate-700">Amount (₹)</label>
              <input
                name="consultation_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.consultation_fee}
                onChange={handleChange}
                className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-600 px-3 py-2.5 shadow-2xs font-mono font-bold"
                placeholder="0.00"
              />
            </div>
          </section>

          {/* WhatsApp Send Section */}
          <div className="flex flex-col gap-3 items-end">
            <div className="flex flex-wrap items-center gap-3 w-full justify-end">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-2xs">
                <Phone className="h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="WhatsApp number (e.g., 919876543210)"
                  className="w-64 text-xs font-medium text-slate-700 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-xs"
              >
                <Send className="h-4 w-4" />
                Send Prescription to WhatsApp
              </button>

              <button
                type="button"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 shadow-xs"
                onClick={handleSubmit}
              >
                {saving ? "Saving..." : "Save Visit"}
              </button>
            </div>
          </div>
        </>
      ) : (
        // Insurance Workspace
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {insuranceResult ? (
            <InsuranceWorkspace
              activeTab={insuranceTab}
              setActiveTab={setInsuranceTab}
              result={insuranceResult}
              calculateCompletionPercentage={calculateCompletionPercentage}
              getMissingFieldsList={getMissingFieldsList}
              isDigitallySigned={isDigitallySigned}
              setIsDigitallySigned={setIsDigitallySigned}
              adminSignerName={adminSignerName}
              setAdminSignerName={setAdminSignerName}
              submitStep={submitStep}
              setSubmitStep={setSubmitStep}
              preAuthId={preAuthId}
              setPreAuthId={setPreAuthId}
              submittingTpa={submittingTpa}
              handleSubmitTpa={handleSubmitTpa}
              handleUpdateField={handleUpdateField}
            />
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Insurance Pre-Auth Data Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Record a consultation or view the transcript, then click <strong className="text-slate-800">"AI Insurance"</strong> to extract diagnosis codes, hospital charges, and pre-authorization forms.
              </p>
              <button
                onClick={handleGenerateInsurance}
                disabled={isInsuranceLoading}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                {isInsuranceLoading ? "Generating..." : "Generate AI Insurance Data"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

