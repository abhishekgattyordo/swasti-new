"use client";

import { useEffect, useState, useRef } from "react";
import { currentVisitApi } from "@/lib/api/ehr";
import { LiveTranscriptionSession, mapMicLocale } from "@/lib/speech";
import toast from "react-hot-toast";

// ✅ Import Insurance components
import InsuranceWorkspace, {
  type AnalysisResult,
  type PreAuthForm,
} from "@/components/doctor/InsuranceWorkspace";

// Types for SOAP response
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
}

// ✅ Accept props instead of reading from URL
interface CurrentVisitPageProps {
  patientId: string;
  appointmentId: string;
  date?: string | null;
}

export default function CurrentVisitPage({ patientId, appointmentId, date }: CurrentVisitPageProps) {
  // All existing state, refs, and logic – exactly as you had, but using props instead of params
  const [formData, setFormData] = useState({
    diagnosis: "",
    icd10_code: "",
    clinical_notes: "",
    follow_up_date: "",
    patient_instructions: "",
    consultation_fee: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  
  // Lab orders state
  const [labOrders, setLabOrders] = useState<string[]>([]);
  const [labOrdersDetected, setLabOrdersDetected] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<{ sent: boolean; error: string | null } | null>(null);
  
  // Insurance states
  const [insuranceResult, setInsuranceResult] = useState<AnalysisResult | null>(null);
  const [isInsuranceLoading, setIsInsuranceLoading] = useState(false);
  const [insuranceTab, setInsuranceTab] = useState<"overview" | "form" | "codes" | "checklist" | "json">("overview");
  
  // Insurance workspace states
  const [adminSignerName, setAdminSignerName] = useState("");
  const [isDigitallySigned, setIsDigitallySigned] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [preAuthId, setPreAuthId] = useState<string | null>(null);
  const [submittingTpa, setSubmittingTpa] = useState(false);
  
  // Multi-Language Voice Recording States
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

  const liveSessionRef = useRef<LiveTranscriptionSession | null>(null);
  const finalTranscriptRef = useRef("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const micLanguageLabels: Record<string, string> = {
    "kn-IN": "Kannada",
    "hi-IN": "Hindi",
    "en-IN": "English",
  };

  const [currentAppointmentId, setCurrentAppointmentId] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");

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

        console.log("API response", response);

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
          });
        }
      } catch (error: any) {
        console.error("Error fetching current visit:", error);
        if (error?.response?.status !== 404) {
          toast.error("Failed to load current visit data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, appointmentId, date]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      liveSessionRef.current?.cancel();
    };
  }, []);

  // Timer functions for recording duration
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

  const startRecording = async () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.cancel();
      liveSessionRef.current = null;
    }

    setTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
    setEditableTranscript("");

    const session = new LiveTranscriptionSession();
    liveSessionRef.current = session;
    setIsConnecting(true);

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

      setIsConnecting(false);
      setIsRecording(true);
      startDurationTimer();
      toast.success(
        `🎤 Recording in ${micLanguageLabels[micLanguage] ?? micLanguage}. Speak continuously!`
      );
    } catch (err) {
      liveSessionRef.current = null;
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
    if (!session) {
      setIsConnecting(false);
      setIsRecording(false);
      stopDurationTimer();
      return;
    }

    try {
      const state = await session.stop();
      finalTranscriptRef.current = state.finalLines.join(" ");
      setTranscript(state.fullText);
      setEditableTranscript(state.fullText);
      setInterimTranscript("");
      if (state.fullText.trim()) {
        toast.success("Recording stopped. Click 'View Transcript' to see and edit the conversation.");
      }
    } catch (err) {
      console.error("Stop error:", err);
    } finally {
      liveSessionRef.current = null;
      setIsConnecting(false);
      setIsRecording(false);
      stopDurationTimer();
    }
  };

  const restartRecording = () => {
    if (isRecording) {
      void stopRecording().then(() => {
        setTimeout(() => {
          void startRecording();
        }, 100);
      });
    } else {
      void startRecording();
    }
  };

  // Clear transcript
  const clearTranscript = () => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setEditableTranscript("");
    setLabOrders([]);
    setLabOrdersDetected(false);
    setWhatsappStatus(null);
    toast.success("Transcript cleared");
  };

  // Open transcript dialog
  const openTranscriptDialog = () => {
    setEditableTranscript(transcript || finalTranscriptRef.current);
    setEditMode(true);
    setShowTranscriptDialog(true);
  };

  // Save edited transcript
  const saveEditedTranscript = () => {
    finalTranscriptRef.current = editableTranscript;
    setTranscript(editableTranscript);
    setEditMode(false);
    toast.success("Transcript updated successfully");
  };

  // Handle SOAP generation with lab orders
  const handleGenerateFromTranscript = async () => {
    const currentTranscript = transcript || finalTranscriptRef.current;
    if (!currentTranscript || currentTranscript.trim().length === 0) {
      toast.error("No transcript available. Please record or paste a conversation first.");
      return;
    }

    setGeneratingNotes(true);
    const loadingToast = toast.loading("Generating clinical notes from conversation...");

    try {
      const response = await fetch("/api/doctors/ai/soap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: currentTranscript,
          patientId: patientId,
          userId: 1,
          saveToHistory: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const soapData: SoapResponse = await response.json();
      
      console.log("Generated SOAP Notes:", soapData);
      
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

      toast.success("SOAP notes generated successfully from conversation!", {
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

  // Handle Insurance Generation
  const handleGenerateInsurance = async () => {
    const currentTranscript = transcript || finalTranscriptRef.current;
    if (!currentTranscript || currentTranscript.trim().length === 0) {
      toast.error("No transcript available. Please record or paste a conversation first.");
      return;
    }

    setIsInsuranceLoading(true);
    const loadingToast = toast.loading("Generating insurance pre-authorization data...");

    try {
      const response = await fetch("/api/doctors/ai/insurance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: currentTranscript,
          patientId: patientId,
          userId: 1,
          saveToHistory: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const insuranceData = await response.json();
      console.log("Generated Insurance Data:", insuranceData);

      setInsuranceResult(insuranceData);
      setActiveView("insurance");
      setInsuranceTab("overview");
      
      toast.success("Insurance pre-authorization data generated successfully!", {
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
      payload.consultation_fee = parseFloat(payload.consultation_fee) || 0;

      const response = await currentVisitApi.saveCurrentVisit(patientId, payload);
      const json = response.data !== undefined ? response.data : response;

      if (json && (json.success || json.appointmentId)) {
        toast.success(json.message || "Current visit saved");
        if (json.appointmentId) {
          setCurrentAppointmentId(json.appointmentId);
        }
      } else {
        toast.error(json?.message || "Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving");
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
      if (!reportData.success) throw new Error(reportData.message || "Failed to fetch report");
      const data = reportData.data;

      const pdfRes = await fetch("/api/doctors/prescription-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: data.patient.name,
          patientId: data.patient.id,
          doctorName: data.doctor.name,
          doctorSpecialty: data.doctor.specialty,
          licenseNo: data.doctor.licenseNo,
          diagnosis: data.clinicalFindings.diagnosis,
          medications: data.medications,
          vitals: data.vitals,
          followUp: data.followUp,
          instructions: data.patientInstructions,
          documentRef: data.document.ref,
          sealedDate: data.document.sealedDateTime,
        }),
      });

      if (!pdfRes.ok) throw new Error("Failed to generate PDF");
      const pdfResult = await pdfRes.json();
      if (!pdfResult.success) throw new Error("PDF generation failed");
      const pdfUrl = pdfResult.url;

      let formattedPhone = whatsappNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.substring(1);
      if (formattedPhone.length === 10 && !formattedPhone.startsWith('91')) formattedPhone = '91' + formattedPhone;
      if (formattedPhone.length < 10) {
        toast.error("Invalid phone number.");
        return;
      }

      let message = `🏥 *St. Mary Advanced Medical Center*\n`;
      message += `Your prescription (Ref: ${data.document.ref}) is ready.\n\n`;
      message += `📄 *Download PDF:* ${pdfUrl}\n\n`;
      message += `*Summary:*\n`;
      message += `Diagnosis: ${data.clinicalFindings.diagnosis || "N/A"}\n`;
      if (data.medications.length > 0) {
        message += `Medications: ${data.medications.map((m: any) => m.name).join(", ")}\n`;
      }
      if (data.followUp) message += `Follow-up: ${data.followUp}\n`;
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
      f.patientInfo.name,
      f.patientInfo.age,
      f.patientInfo.gender,
      f.patientInfo.address,
      f.patientInfo.phone,
      f.patientInfo.policyNumber,
      f.patientInfo.tpaName,
      f.patientInfo.insurerName,
      f.diagnosisDetails.primaryDiagnosis,
      f.diagnosisDetails.icd10Codes,
      f.diagnosisDetails.clinicalFindings,
      f.diagnosisDetails.durationOfIllness,
      f.diagnosisDetails.pastMedicalHistory,
      f.proposedTreatment.procedureName,
      f.proposedTreatment.procedureCode,
      f.proposedTreatment.treatmentType,
      f.proposedTreatment.clinicalJustification,
      f.hospitalizationDetails.hospitalName,
      f.hospitalizationDetails.providerId,
      f.hospitalizationDetails.roomCategoryRequested,
      f.hospitalizationDetails.proposedAdmissionDate,
      f.hospitalizationDetails.expectedLengthOfStay,
      f.costEstimation.roomRentPerDay,
      f.costEstimation.icuCharges,
      f.costEstimation.investigationCosts,
      f.costEstimation.surgeryCharges,
      f.costEstimation.professionalFees,
      f.costEstimation.medicinesCost,
      f.costEstimation.totalEstimatedCost,
      f.treatingDoctor.physicianName,
      f.treatingDoctor.registrationNumber,
      f.treatingDoctor.specialization,
      f.treatingDoctor.contact,
    ];
    const filled = fields.filter((val) => val && val !== "Requires Review" && val.trim() !== "");
    return Math.round((filled.length / fields.length) * 100);
  };

  const getMissingFieldsList = () => {
    if (!insuranceResult || !insuranceResult.preAuthForm) return [];
    const missing: string[] = [];
    const f = insuranceResult.preAuthForm;

    if (!f.patientInfo.name || f.patientInfo.name === "Requires Review") missing.push("Patient Name");
    if (!f.patientInfo.phone || f.patientInfo.phone === "Requires Review") missing.push("Patient Phone Contact");
    if (!f.patientInfo.policyNumber || f.patientInfo.policyNumber === "Requires Review") missing.push("Policy Number / Member ID");
    if (!f.patientInfo.tpaName || f.patientInfo.tpaName === "Requires Review") missing.push("Third Party Administrator (TPA)");
    if (!f.patientInfo.insurerName || f.patientInfo.insurerName === "Requires Review") missing.push("Insurance Carrier Name");
    if (!f.treatingDoctor.registrationNumber || f.treatingDoctor.registrationNumber === "Requires Review") missing.push("Physician MCI Registry Number");
    if (!f.hospitalizationDetails.providerId || f.hospitalizationDetails.providerId === "Requires Review") missing.push("Hospital ROHINI ID");

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

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="flex flex-col gap-8">
      {/* View Switcher */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveView("soap")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeView === "soap"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          📋 SOAP Notes
        </button>
        <button
          onClick={() => setActiveView("insurance")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeView === "insurance"
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🏥 Insurance Pre-Auth
        </button>
        {insuranceResult && (
          <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            ✅ Data Ready
          </span>
        )}
      </div>

      {/* Lab Orders Alert Banner */}
      {labOrdersDetected && labOrders.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-yellow-600 text-2xl">science</span>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
                🧪 Lab Orders Detected
                {whatsappStatus && (
                  <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${
                    whatsappStatus.sent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {whatsappStatus.sent ? '✅ WhatsApp Sent' : `❌ ${whatsappStatus.error || 'Failed'}`}
                  </span>
                )}
              </h4>
              <ul className="mt-1 list-disc list-inside text-sm text-yellow-700">
                {labOrders.map((lab, index) => (
                  <li key={index}>{lab}</li>
                ))}
              </ul>
              {whatsappStatus && whatsappStatus.sent && (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
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
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Transcript Dialog Modal - Editable */}
      {showTranscriptDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">
                  {editMode ? "edit" : "description"}
                </span>
                <h2 className="text-xl font-bold text-slate-900">
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
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                )}
                {editMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setEditableTranscript(transcript || finalTranscriptRef.current);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-gray-600"
                    title="Cancel edit"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowTranscriptDialog(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {editMode ? (
                <textarea
                  value={editableTranscript}
                  onChange={(e) => setEditableTranscript(e.target.value)}
                  className="w-full h-full min-h-[400px] rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-4 shadow-sm font-mono"
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
            
            <div className="flex justify-end gap-3 p-4 border-t">
              {editMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setEditableTranscript(transcript || finalTranscriptRef.current);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEditedTranscript}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      save
                    </span>
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={clearTranscript}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={!transcript && !finalTranscriptRef.current}
                  >
                    Clear Transcript
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTranscriptDialog(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateFromTranscript}
                    disabled={generatingNotes || (!transcript && !finalTranscriptRef.current)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      auto_awesome
                    </span>
                    Generate SOAP Notes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Button Section with Multi-Language Microphone */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Clinical Scribe</h3>
              <p className="text-xs text-slate-500">Record consultation in any Indian language</p>
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap items-center">
            {/* Language Selection Dropdown */}
            <div className="flex items-center gap-1 bg-white border border-purple-200 px-3 py-2 rounded-lg shadow-2xs">
              <span className="material-symbols-outlined text-[18px] text-blue-500 shrink-0">globe</span>
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
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isConnecting}
              className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md text-xs font-bold disabled:opacity-80 ${
                isRecording 
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
                  : isConnecting
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isConnecting ? "animate-spin" : ""}`}>
                {isConnecting ? "progress_activity" : "mic"}
              </span>
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
                className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200 flex items-center gap-2 shadow-md text-xs font-bold"
              >
                <span className="material-symbols-outlined text-[18px]">stop</span>
                Stop
              </button>
            )}
            
            {/* View/Edit Transcript Button */}
            <button
              type="button"
              onClick={openTranscriptDialog}
              disabled={!transcript && !finalTranscriptRef.current}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">
                view_list
              </span>
              View/Edit Transcript
              {(transcript || finalTranscriptRef.current) && (
                <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                  {(transcript || finalTranscriptRef.current).split(' ').length}
                </span>
              )}
            </button>
            
            {/* Generate SOAP Button */}
            <button
              type="button"
              onClick={handleGenerateFromTranscript}
              disabled={generatingNotes || (!transcript && !finalTranscriptRef.current)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">
                {generatingNotes ? "progress_activity" : "magic"}
              </span>
              {generatingNotes ? "Generating..." : "AI SOAP"}
            </button>
            
            {/* Generate Insurance Button */}
            <button
              type="button"
              onClick={handleGenerateInsurance}
              disabled={isInsuranceLoading || (!transcript && !finalTranscriptRef.current)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isInsuranceLoading ? "progress_activity" : "shield"}
              </span>
              {isInsuranceLoading ? "Generating..." : "AI Insurance"}
            </button>
          </div>
        </div>
        
        {/* Recording / connecting status */}
        {isConnecting && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            <span>Connecting microphone...</span>
          </div>
        )}
        {isRecording && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
            <span>Listening... <strong>{micLanguageLabels[micLanguage] ?? micLanguage}</strong>. Speak naturally!</span>
          </div>
        )}
        
        {/* Live Transcript Preview */}
        {(transcript || finalTranscriptRef.current) && !showTranscriptDialog && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 shadow-3xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Live Transcript Preview:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openTranscriptDialog}
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
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
            <p className="text-sm text-slate-600 line-clamp-3 font-mono leading-relaxed bg-slate-50/50 p-2.5 rounded-lg">
              {transcript || finalTranscriptRef.current}
            </p>
          </div>
        )}
      </div>

      {/* Render either SOAP or Insurance view */}
      {activeView === "soap" ? (
        // SOAP form sections
        <>
          {/* Diagnosis Section */}
          <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#137fec]">clinical_notes</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Assessment & Diagnosis</h3>
                  <p className="text-xs text-slate-500">Primary evaluation and clinical findings</p>
                </div>
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
                {saving ? "Saving..." : "Draft saved"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">diagnosis</span>
                  Primary Diagnosis
                </label>
                <div className="relative">
                  <input
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] pl-10 py-3 shadow-sm"
                    placeholder="e.g. Acute Bronchitis"
                    type="text"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">code</span>
                  ICD-10 Code
                </label>
                <input
                  name="icd10_code"
                  value={formData.icd10_code}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] py-3 px-4 shadow-sm"
                  type="text"
                  placeholder="e.g. M54.5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">note</span>
                  Clinical Notes
                </label>
              </div>
              <textarea
                name="clinical_notes"
                value={formData.clinical_notes}
                onChange={handleChange}
                className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-4 shadow-sm font-mono"
                placeholder="Enter patient complaints, observations, and assessment details... or record conversation and click 'AI Mode' to auto-populate"
                rows={12}
              />
            </div>
          </section>

          {/* Follow Up Section */}
          <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#137fec]">event_upcoming</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Follow-up & Instructions</h3>
                <p className="text-xs text-slate-500">Schedule next visit and patient guidance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>
                  Follow-up Date
                </label>
                <input
                  name="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] px-4 py-3 shadow-sm"
                  type="date"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">description</span>
                  Patient Instructions
                </label>
                <textarea
                  name="patient_instructions"
                  value={formData.patient_instructions}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] resize-none p-3 shadow-sm"
                  placeholder="Additional instructions..."
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Consultation Fee Section */}
          <section className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">currency_rupee</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Consultation Fee</h3>
                <p className="text-xs text-slate-500">Enter the fee for this visit (manually adjustable)</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-w-xs">
              <label className="text-sm font-semibold text-slate-700">Amount (₹)</label>
              <input
                name="consultation_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.consultation_fee}
                onChange={handleChange}
                className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#137fec] px-4 py-3 shadow-sm"
                placeholder="0.00"
              />
            </div>
          </section>

          {/* WhatsApp Send Section */}
          <div className="flex flex-col gap-3 items-end">
            <div className="flex flex-wrap items-center gap-3 w-full justify-end">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">phone</span>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="WhatsApp number (e.g., 919876543210)"
                  className="w-64 text-sm text-slate-700 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                disabled={!currentAppointmentId}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                Send to WhatsApp
              </button>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#137fec] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
                onClick={handleSubmit}
              >
                {saving ? "Saving..." : "Save Visit"}
              </button>
            </div>
          </div>
        </>
      ) : (
        // Insurance Workspace
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏥</div>
              <h3 className="text-lg font-semibold text-slate-700">No Insurance Data</h3>
              <p className="text-sm text-slate-500 mt-2">
                Record a consultation and click <strong>"AI Insurance"</strong> to generate pre-authorization data.
              </p>
              <button
                onClick={handleGenerateInsurance}
                disabled={isInsuranceLoading || (!transcript && !finalTranscriptRef.current)}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isInsuranceLoading ? "Generating..." : "Generate Insurance Data"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}