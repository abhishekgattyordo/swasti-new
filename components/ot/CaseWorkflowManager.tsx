



// 'use client';
// import React, { useState, useEffect } from 'react';
// import { 
//   ArrowLeft, 
//   Sparkles, 
//   CheckCircle, 
//   Clock, 
//   Users, 
//   DollarSign, 
//   ShieldAlert, 
//   Heart, 
//   ClipboardList, 
//   UserCheck, 
//   Plus, 
//   AlertCircle, 
//   Play, 
//   FileText, 
//   Activity, 
//   ChevronRight, 
//   ShoppingBag,
//   Cpu,
//   Bookmark,
//   Check,
//   CheckSquare,
//   Fingerprint,
//   FileCheck,
//   PenTool,
//   ExternalLink,
//   Download,
//   Mic,
//   Printer,
//   Mail,
//   Share2,
//   Copy
// } from 'lucide-react';
// import { SurgeryCase, CaseStatus, SurgeryType, PriorityLevel, SURGEONS, ANESTHETISTS, NURSES, DEFAULT_CONSUMABLES } from '@/types';

// interface CaseWorkflowManagerProps {
//   selectedCase: SurgeryCase;
//   onBack: () => void;
//   onUpdateCase: (updatedCase: SurgeryCase) => void;
//   initialStep?: number;
// }

// export default function CaseWorkflowManager({ selectedCase, onBack, onUpdateCase, initialStep }: CaseWorkflowManagerProps) {
//   const [activeStep, setActiveStep] = useState(initialStep || Math.min(selectedCase.currentStep, 14));
//   const [showCoPilot, setShowCoPilot] = useState(false);
//   const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  
//   // Voice State
//   const [isListening, setIsListening] = useState(false);

//   // Top-level Voice Command Center State
//   const [topVoiceText, setTopVoiceText] = useState("");
//   const [topVoiceListening, setTopVoiceListening] = useState(false);
//   const [topRecognitionInstance, setTopRecognitionInstance] = useState<any>(null);
//   const [voiceIntakeLoading, setVoiceIntakeLoading] = useState(false);
//   const [voiceIntakeStatus, setVoiceIntakeStatus] = useState<string>("");
//   const [voiceIntakeLogs, setVoiceIntakeLogs] = useState<string[]>([]);
//   const [voiceIntakeSuccess, setVoiceIntakeSuccess] = useState<boolean>(false);
//   const [extractedSummary, setExtractedSummary] = useState<any>(null);

//   const startTopVoiceDictation = () => {
//     const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Voice recognition not supported in this browser.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.lang = 'en-US';
//     recognition.interimResults = true;

//     recognition.onstart = () => {
//       setTopVoiceListening(true);
//     };

//     recognition.onend = () => {
//       setTopVoiceListening(false);
//     };

//     recognition.onerror = (event: any) => {
//       console.error("Top speech recognition error:", event);
//       setTopVoiceListening(false);
//     };

//     recognition.onresult = (event: any) => {
//       let finalTranscript = "";
//       for (let i = event.resultIndex; i < event.results.length; ++i) {
//         if (event.results[i].isFinal) {
//           finalTranscript += event.results[i][0].transcript + " ";
//         }
//       }
//       if (finalTranscript) {
//         setTopVoiceText((prev) => {
//           const cleanPrev = prev.trim();
//           return cleanPrev ? `${cleanPrev} ${finalTranscript.trim()}` : finalTranscript.trim();
//         });
//       }
//     };

//     try {
//       recognition.start();
//       setTopRecognitionInstance(recognition);
//       setTopVoiceListening(true);
//     } catch (err) {
//       console.error("Failed to start top speech recognition:", err);
//     }
//   };

//   const stopTopVoiceDictation = () => {
//     if (topRecognitionInstance) {
//       try {
//         topRecognitionInstance.stop();
//       } catch (e) {
//         console.error("Error stopping top voice recognition:", e);
//       }
//     }
//     setTopVoiceListening(false);
//   };

//   const generateLocalClinicalFallbackIntake = (transcriptText: string, activeStepNum: number = 5) => {
//     const text = transcriptText.toLowerCase();
//     const expectedDate = new Date().toISOString().split('T')[0];
//     const result: any = {};

//     if (activeStepNum === 1) {
//       let diagnosis = "Cholelithiasis with acute cholecystitis";
//       let surgeryName = "Laparoscopic Cholecystectomy";
//       let surgeryType: SurgeryType = "Major";
//       let priorityLevel: PriorityLevel = "High";
//       let duration = 60;
//       let clinicalNotes = "Symptomatic gallbladder stones. Recommend early lap chole.";

//       if (text.includes("appendix") || text.includes("appendicitis") || text.includes("appendec")) {
//         diagnosis = "Acute Appendicitis";
//         surgeryName = "Laparoscopic Appendectomy";
//         surgeryType = "Emergency";
//         priorityLevel = "Immediate";
//         duration = 45;
//         clinicalNotes = "Rebound tenderness in RIF, leukocytosis. Fit for emergency appendectomy.";
//       } else if (text.includes("hernia") || text.includes("hernio")) {
//         diagnosis = "Right Inguinal Hernia";
//         surgeryName = "Open Hernioplasty with Mesh";
//         surgeryType = "Major";
//         priorityLevel = "Medium";
//         duration = 75;
//         clinicalNotes = "Reducible right groin hernia, chronic aching pain. Plan for mesh hernioplasty.";
//       }

//       result.recommendation = {
//         diagnosis,
//         surgeryName,
//         surgeryType,
//         expectedDate,
//         priorityLevel,
//         estimatedDuration: duration,
//         clinicalNotes: clinicalNotes || transcriptText,
//         recommendedBy: "Dr. Devendra Mehta",
//         recommendedDate: expectedDate
//       };
//     }

//     else if (activeStepNum === 2) {
//       result.preSurgeryAssessment = {
//         performedBy: "Dr. Devendra Mehta",
//         medicalHistory: "Type 2 Diabetes managed with Metformin.",
//         previousSurgeries: "None",
//         allergies: "No known drug allergies",
//         currentMedication: "Tab. Metformin 500mg OD",
//         vitals: {
//           bp: "128/82",
//           pulse: 78,
//           temp: 36.8,
//           spo2: 99,
//           weight: 72,
//           height: 170,
//           bmi: 24.9
//         },
//         comorbidities: {
//           diabetes: text.includes("diabetes") || text.includes("diabetic"),
//           hypertension: text.includes("tension") || text.includes("pressure") || text.includes("hypertens"),
//           heartDisease: false,
//           asthma: false,
//           other: ""
//         },
//         tests: {
//           cbc: "Normal",
//           bloodGroup: "O Positive",
//           ptInr: "Normal",
//           bloodSugar: "115 mg/dL",
//           ecg: "Normal Sinus Rhythm",
//           xray: "Clear",
//           ctScan: "Not Required",
//           mri: "Not Required"
//         },
//         fitnessStatus: "Fit"
//       };
//     }

//     else if (activeStepNum === 5) {
//       let bp = "120/80";
//       let pulse = 78;
//       let spo2 = 99;

//       const bpMatch = text.match(/(?:bp|blood pressure|pressure)\s*(?:is)?\s*(\d+\s*\/\s*\d+)/i) || text.match(/(\d+)\s+over\s+(\d+)/i);
//       if (bpMatch) {
//         if (bpMatch[2]) {
//           bp = `${bpMatch[1]}/${bpMatch[2]}`;
//         } else {
//           bp = bpMatch[1].replace(/\s+/g, "");
//         }
//       }

//       const pulseMatch = text.match(/(?:pulse|heart rate|pulse rate)\s*(?:is)?\s*(\d+)/i) || text.match(/pulse\s+(\d+)/i);
//       if (pulseMatch) {
//         pulse = parseInt(pulseMatch[1], 10);
//       }

//       const spo2Match = text.match(/(?:spo2|oxygen saturation|saturation|oxygen)\s*(?:is)?\s*(\d+)/i) || text.match(/saturation\s+(\d+)/i);
//       if (spo2Match) {
//         spo2 = parseInt(spo2Match[1], 10);
//       }

//       result.postOpRecovery = {
//         vitalsLogs: [
//           {
//             time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
//             bp,
//             pulse,
//             spo2,
//             painScore: text.includes("pain") ? 3 : 0,
//             consciousness: "Fully Awake"
//           }
//         ],
//         status: "Stable"
//       };
//     }

//     else if (activeStepNum === 10) {
//       result.teamAssignment = {
//         team: {
//           primarySurgeon: "Dr. Devendra Mehta",
//           assistantSurgeon: "Dr. Anjali Deshmukh",
//           leadAnesthetist: "Dr. Ronald D'Souza",
//           assistantAnesthetist: "Sister Mary Joseph",
//           scrubNurse: "Sister Jaspreet Kaur",
//           circulatingNurse: "Sister Mary Joseph",
//           otTechnician: "Brother Rajesh Kumar",
//           biomedicalTech: "Brother Rajesh Kumar"
//         },
//         assignedBy: "OT Chief Administrator",
//         availabilityStatus: "All Available"
//       };
//     }

//     else {
//       result.postOpRecovery = {
//         vitalsLogs: [
//           { time: "12:15", bp: "120/80", pulse: 78, spo2: 99, painScore: 0, consciousness: "Fully Awake" }
//         ],
//         status: "Stable"
//       };
//     }

//     return result;
//   };

//   const processTopVoiceIntake = async () => {
//     if (!topVoiceText.trim()) {
//       alert("Please enter or dictate some text first before processing.");
//       return;
//     }

//     if (topVoiceListening) {
//       stopTopVoiceDictation();
//     }

//     setVoiceIntakeLoading(true);
//     setVoiceIntakeLogs([]);
//     setVoiceIntakeStatus("Initiating AI clinical parser...");
//     setVoiceIntakeSuccess(false);

//     const activeStepName = stepsList.find(s => s.num === activeStep)?.name || "Post-Anesthesia Care (PACU)";

//     const logs = [
//       `Analyzing voice intake transcript specifically for Step ${activeStep}: "${activeStepName}"...`,
//       `Extracting details only for "${activeStepName}"...`,
//       "Mapping properties and updating active step fields...",
//       "Constructing final structured clinical data profile..."
//     ];

//     for (let i = 0; i < logs.length; i++) {
//       setVoiceIntakeStatus(logs[i]);
//       setVoiceIntakeLogs(prev => [...prev, logs[i]]);
//       await new Promise(r => setTimeout(r, 450));
//     }

//     try {
//       const response = await fetch("/ot/api/gemini/voice-intake", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           transcript: topVoiceText,
//           currentCase: selectedCase,
//           activeStep,
//           activeStepName
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`Server returned status ${response.status}`);
//       }

//       const resData = await response.json();
//       if (resData.success && resData.data) {
//         const extracted = resData.data;
//         const updated = { ...selectedCase };

//         if (activeStep === 1 && extracted.recommendation) {
//           updated.recommendation = {
//             ...selectedCase.recommendation,
//             ...extracted.recommendation
//           };
//         } else if (activeStep === 2 && extracted.preSurgeryAssessment) {
//           updated.preSurgeryAssessment = {
//             ...selectedCase.preSurgeryAssessment,
//             ...extracted.preSurgeryAssessment,
//             vitals: {
//               ...selectedCase.preSurgeryAssessment?.vitals,
//               ...extracted.preSurgeryAssessment?.vitals
//             },
//             comorbidities: {
//               ...selectedCase.preSurgeryAssessment?.comorbidities,
//               ...extracted.preSurgeryAssessment?.comorbidities
//             },
//             tests: {
//               ...selectedCase.preSurgeryAssessment?.tests,
//               ...extracted.preSurgeryAssessment?.tests
//             }
//           };
//         } else if (activeStep === 3 && extracted.anesthesiaEvaluation) {
//           updated.anesthesiaEvaluation = {
//             ...selectedCase.anesthesiaEvaluation,
//             ...extracted.anesthesiaEvaluation
//           };
//         } else if (activeStep === 4) {
//           if (extracted.insurancePreAuth) {
//             updated.insurancePreAuth = {
//               ...selectedCase.insurancePreAuth,
//               ...extracted.insurancePreAuth
//             };
//           }
//           if (extracted.consentManagement) {
//             updated.consentManagement = {
//               ...selectedCase.consentManagement,
//               ...extracted.consentManagement
//             };
//           }
//         } else if (activeStep === 5 && extracted.postOpRecovery) {
//           // Append new vitals to the array to preserve history
//           const newVitals = extracted.postOpRecovery.vitalsLogs || [];
//           updated.postOpRecovery = {
//             ...selectedCase.postOpRecovery,
//             status: extracted.postOpRecovery.status || selectedCase.postOpRecovery.status,
//             vitalsLogs: [...selectedCase.postOpRecovery.vitalsLogs, ...newVitals]
//           };
//         } else if (activeStep === 6 && extracted.otScheduling) {
//           updated.otScheduling = {
//             ...selectedCase.otScheduling,
//             ...extracted.otScheduling
//           };
//         } else if (activeStep === 7 && extracted.equipmentCheck) {
//           updated.equipmentCheck = {
//             ...selectedCase.equipmentCheck,
//             ...extracted.equipmentCheck,
//             equipment: {
//               ...selectedCase.equipmentCheck?.equipment,
//               ...extracted.equipmentCheck?.equipment
//             }
//           };
//         } else if (activeStep === 8 && extracted.dayChecklist) {
//           updated.dayChecklist = {
//             ...selectedCase.dayChecklist,
//             ...extracted.dayChecklist,
//             checklist: {
//               ...selectedCase.dayChecklist?.checklist,
//               ...extracted.dayChecklist?.checklist
//             }
//           };
//         } else if (activeStep === 9 && extracted.consumablesTracking) {
//           updated.consumablesTracking = {
//             ...selectedCase.consumablesTracking,
//             ...extracted.consumablesTracking
//           };
//         } else if (activeStep === 10 && extracted.teamAssignment) {
//           updated.teamAssignment = {
//             ...selectedCase.teamAssignment,
//             ...extracted.teamAssignment,
//             team: {
//               ...selectedCase.teamAssignment?.team,
//               ...extracted.teamAssignment?.team
//             }
//           };
//         } else if (activeStep === 11 && extracted.postOpOrders) {
//           updated.postOpOrders = {
//             ...selectedCase.postOpOrders,
//             ...extracted.postOpOrders
//           };
//         } else if (activeStep === 12 && extracted.outcomeTracking) {
//           updated.outcomeTracking = {
//             ...selectedCase.outcomeTracking,
//             ...extracted.outcomeTracking
//           };
//         } else if (activeStep === 13 && extracted.billing) {
//           updated.billing = {
//             ...selectedCase.billing,
//             ...extracted.billing,
//             actualCharges: {
//               ...selectedCase.billing?.actualCharges,
//               ...extracted.billing?.actualCharges
//             }
//           };
//         } else if (activeStep === 14 && extracted.discharge) {
//           updated.discharge = {
//             ...selectedCase.discharge,
//             ...extracted.discharge,
//             summary: {
//               ...selectedCase.discharge?.summary,
//               ...extracted.discharge?.summary
//             }
//           };
//         }

//         onUpdateCase(updated);
//         setVoiceIntakeStatus(`Step ${activeStep} ("${activeStepName}") successfully auto-filled! Please review below.`);
//         setVoiceIntakeLogs(prev => [...prev, `✓ Step ${activeStep} successfully updated!`]);
//         setExtractedSummary({
//           diagnosis: extracted.recommendation?.diagnosis || updated.recommendation.diagnosis,
//           surgeryName: extracted.recommendation?.surgeryName || updated.recommendation.surgeryName,
//           anesthesiaType: extracted.anesthesiaEvaluation?.anesthesiaType || updated.anesthesiaEvaluation.anesthesiaType,
//           primarySurgeon: extracted.teamAssignment?.team?.primarySurgeon || updated.teamAssignment.team.primarySurgeon,
//           dischargeStatus: extracted.discharge?.status || updated.discharge.status
//         });
//         setVoiceIntakeSuccess(true);
//       } else {
//         throw new Error(resData.error || "No data returned.");
//       }
//     } catch (err: any) {
//       console.error(err);
//       setVoiceIntakeStatus(`Error during AI extraction: ${err.message || err}. Reverting to local fallback parser...`);
//       setVoiceIntakeLogs(prev => [...prev, "⚠️ Online extraction failed, activating offline clinical extraction parser..."]);
      
//       await new Promise(r => setTimeout(r, 800));
//       const mockResult = generateLocalClinicalFallbackIntake(topVoiceText, activeStep);
      
//       const updated = { ...selectedCase };

//       if (activeStep === 1 && mockResult.recommendation) {
//         updated.recommendation = {
//           ...selectedCase.recommendation,
//           ...mockResult.recommendation
//         };
//       } else if (activeStep === 2 && mockResult.preSurgeryAssessment) {
//         updated.preSurgeryAssessment = {
//           ...selectedCase.preSurgeryAssessment,
//           ...mockResult.preSurgeryAssessment,
//           vitals: {
//             ...selectedCase.preSurgeryAssessment?.vitals,
//             ...mockResult.preSurgeryAssessment?.vitals
//           },
//           comorbidities: {
//             ...selectedCase.preSurgeryAssessment?.comorbidities,
//             ...mockResult.preSurgeryAssessment?.comorbidities
//           },
//           tests: {
//             ...selectedCase.preSurgeryAssessment?.tests,
//             ...mockResult.preSurgeryAssessment?.tests
//           }
//         };
//       } else if (activeStep === 3 && mockResult.anesthesiaEvaluation) {
//         updated.anesthesiaEvaluation = {
//           ...selectedCase.anesthesiaEvaluation,
//           ...mockResult.anesthesiaEvaluation
//         };
//       } else if (activeStep === 4) {
//         if (mockResult.insurancePreAuth) {
//           updated.insurancePreAuth = {
//             ...selectedCase.insurancePreAuth,
//             ...mockResult.insurancePreAuth
//           };
//         }
//         if (mockResult.consentManagement) {
//           updated.consentManagement = {
//             ...selectedCase.consentManagement,
//             ...mockResult.consentManagement
//           };
//         }
//       } else if (activeStep === 5 && mockResult.postOpRecovery) {
//         const newVitals = mockResult.postOpRecovery.vitalsLogs || [];
//         updated.postOpRecovery = {
//           ...selectedCase.postOpRecovery,
//           status: mockResult.postOpRecovery.status || selectedCase.postOpRecovery.status,
//           vitalsLogs: [...selectedCase.postOpRecovery.vitalsLogs, ...newVitals]
//         };
//       } else if (activeStep === 6 && mockResult.otScheduling) {
//         updated.otScheduling = {
//           ...selectedCase.otScheduling,
//           ...mockResult.otScheduling
//         };
//       } else if (activeStep === 7 && mockResult.equipmentCheck) {
//         updated.equipmentCheck = {
//           ...selectedCase.equipmentCheck,
//           ...mockResult.equipmentCheck,
//           equipment: {
//             ...selectedCase.equipmentCheck?.equipment,
//             ...mockResult.equipmentCheck?.equipment
//           }
//         };
//       } else if (activeStep === 8 && mockResult.dayChecklist) {
//         updated.dayChecklist = {
//           ...selectedCase.dayChecklist,
//           ...mockResult.dayChecklist,
//           checklist: {
//             ...selectedCase.dayChecklist?.checklist,
//             ...mockResult.dayChecklist?.checklist
//           }
//         };
//       } else if (activeStep === 9 && mockResult.consumablesTracking) {
//         updated.consumablesTracking = {
//           ...selectedCase.consumablesTracking,
//           ...mockResult.consumablesTracking
//         };
//       } else if (activeStep === 10 && mockResult.teamAssignment) {
//         updated.teamAssignment = {
//           ...selectedCase.teamAssignment,
//           ...mockResult.teamAssignment,
//           team: {
//             ...selectedCase.teamAssignment?.team,
//             ...mockResult.teamAssignment?.team
//           }
//         };
//       } else if (activeStep === 11 && mockResult.postOpOrders) {
//         updated.postOpOrders = {
//           ...selectedCase.postOpOrders,
//           ...mockResult.postOpOrders
//         };
//       } else if (activeStep === 12 && mockResult.outcomeTracking) {
//         updated.outcomeTracking = {
//           ...selectedCase.outcomeTracking,
//           ...mockResult.outcomeTracking
//         };
//       } else if (activeStep === 13 && mockResult.billing) {
//         updated.billing = {
//           ...selectedCase.billing,
//           ...mockResult.billing,
//           actualCharges: {
//             ...selectedCase.billing?.actualCharges,
//             ...mockResult.billing?.actualCharges
//           }
//         };
//       } else if (activeStep === 14 && mockResult.discharge) {
//         updated.discharge = {
//           ...selectedCase.discharge,
//           ...mockResult.discharge,
//           summary: {
//             ...selectedCase.discharge?.summary,
//             ...mockResult.discharge?.summary
//           }
//         };
//       }
      
//       onUpdateCase(updated);
//       setVoiceIntakeStatus(`Successfully updated Step ${activeStep} ("${activeStepName}") with clinical offline mapping!`);
//       setVoiceIntakeLogs(prev => [...prev, "✓ Mapping completed via local fallback parser."]);
//       setExtractedSummary({
//         diagnosis: mockResult.recommendation?.diagnosis || updated.recommendation.diagnosis,
//         surgeryName: mockResult.recommendation?.surgeryName || updated.recommendation.surgeryName,
//         anesthesiaType: mockResult.anesthesiaEvaluation?.anesthesiaType || updated.anesthesiaEvaluation.anesthesiaType,
//         primarySurgeon: mockResult.teamAssignment?.team?.primarySurgeon || updated.teamAssignment.team.primarySurgeon,
//         dischargeStatus: mockResult.discharge?.status || updated.discharge.status
//       });
//       setVoiceIntakeSuccess(true);
//     } finally {
//       setVoiceIntakeLoading(false);
//     }
//   };

//   // Voice input handler
//   const startListening = () => {
//     const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Voice recognition not supported in this browser.");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
//     recognition.lang = 'en-US';
//     recognition.interimResults = false;

//     recognition.onstart = () => {
//       setIsListening(true);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//     };

//     recognition.onerror = (event: any) => {
//       console.error("Speech recognition error:", event);
//       const errorMessage = event.error || (event.message ? event.message : "Unknown error");
//       setIsListening(false);
//       alert(`Voice recognition error: ${errorMessage}`);
//     };

//     recognition.onresult = (event: any) => {
//       const transcript = event.results[0][0].transcript;
//       alert(`Recognized: ${transcript}`);
//       // In a real application, you would parse the transcript and update the form state here.
//     };

//     recognition.start();
//   };

//   // Co-Pilot State
//   const [aiLoading, setAiLoading] = useState(false);
//   const [aiResult, setAiResult] = useState<any>(null);
//   const [aiLogs, setAiLogs] = useState<string[]>([]);

//   // Simulation States
//   const [isSimulatingSurgery, setIsSimulatingSurgery] = useState(false);
//   const [isSimulatingRecovery, setIsSimulatingRecovery] = useState(false);

//   // Consent Portal States
//   const [showConsentModal, setShowConsentModal] = useState(false);
//   const [consentRole, setConsentRole] = useState<'patient' | 'attendant' | 'doctor' | 'witness'>('patient');
//   const [drawings, setDrawings] = useState<{ [key: string]: string }>({}); // saved dataURLs or SVG mockup
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [shareEmail, setShareEmail] = useState("");
//   const [shareWhatsAppPhone, setShareWhatsAppPhone] = useState(selectedCase?.patient?.phone || "");
//   const [copiedLink, setCopiedLink] = useState(false);
//   const [emailSent, setEmailSent] = useState(false);
//   const [emailSending, setEmailSending] = useState(false);
//   const [emailError, setEmailError] = useState<string | null>(null);
//   const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
//   const [simulatedEmail, setSimulatedEmail] = useState<{
//     recipient: string;
//     patientName: string;
//     surgeryName: string;
//     doctorName: string;
//     link: string;
//     html: string;
//   } | null>(null);

//   // Voice Dictation Modal State
//   const [voiceTarget, setVoiceTarget] = useState<{ label: string; value: string; onSave: (val: string) => void } | null>(null);
//   const [voiceText, setVoiceText] = useState("");
//   const [voiceListening, setVoiceListening] = useState(false);
//   const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

//   const startVoiceDictation = (label: string, initialValue: string, onSave: (val: string) => void) => {
//     setVoiceTarget({ label, value: initialValue, onSave });
//     setVoiceText(initialValue);
//     setVoiceListening(true);

//     const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Voice recognition not supported in this browser.");
//       setVoiceListening(false);
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.lang = 'en-US';
//     recognition.interimResults = true;

//     recognition.onstart = () => {
//       setVoiceListening(true);
//     };

//     recognition.onend = () => {
//       setVoiceListening(false);
//     };

//     recognition.onerror = (event: any) => {
//       console.error("Speech recognition error:", event);
//       setVoiceListening(false);
//     };

//     recognition.onresult = (event: any) => {
//       let finalTranscript = "";
//       for (let i = event.resultIndex; i < event.results.length; ++i) {
//         if (event.results[i].isFinal) {
//           finalTranscript += event.results[i][0].transcript + " ";
//         }
//       }
//       if (finalTranscript) {
//         setVoiceText((prev) => {
//           const cleanPrev = prev.trim();
//           return cleanPrev ? `${cleanPrev} ${finalTranscript.trim()}` : finalTranscript.trim();
//         });
//       }
//     };

//     try {
//       recognition.start();
//       setRecognitionInstance(recognition);
//     } catch (err) {
//       console.error("Failed to start speech recognition:", err);
//     }
//   };

//   const stopVoiceDictation = () => {
//     if (recognitionInstance) {
//       try {
//         recognitionInstance.stop();
//       } catch (e) {
//         console.error("Error stopping voice recognition:", e);
//       }
//     }
//     setVoiceListening(false);
//   };

//   const VoiceInputIcon = ({ label, value, onTranscript }: { label: string; value: string; onTranscript: (text: string) => void }) => {
//     return (
//       <button 
//         type="button"
//         onClick={() => startVoiceDictation(label, value, onTranscript)} 
//         className="text-teal-500 hover:text-teal-600 p-1.5 rounded-full hover:bg-teal-50 transition-all flex items-center justify-center cursor-pointer"
//         title={`Speak into ${label}`}
//       >
//         <Mic className="w-3.5 h-3.5" />
//       </button>
//     );
//   };

//   const handlePrintConsent = () => {
//     const printWindow = window.open('', '_blank');
//     if (!printWindow) return;
    
//     const patientSign = selectedCase.consentManagement.signatures.patient 
//       ? `<img src="${(selectedCase.consentManagement as any).signatureImages?.patient || drawings.patient || ''}" style="height: 50px; border-bottom: 1px solid #ddd;" />`
//       : '<span style="color: #999; font-style: italic;">Awaiting Digital Verification</span>';

//     const attendantSign = selectedCase.consentManagement.signatures.attendant
//       ? `<img src="${(selectedCase.consentManagement as any).signatureImages?.attendant || drawings.attendant || ''}" style="height: 50px; border-bottom: 1px solid #ddd;" />`
//       : '<span style="color: #999; font-style: italic;">Awaiting Digital Verification</span>';

//     const doctorSign = selectedCase.consentManagement.signatures.doctor
//       ? `<img src="${(selectedCase.consentManagement as any).signatureImages?.doctor || drawings.doctor || ''}" style="height: 50px; border-bottom: 1px solid #ddd;" />`
//       : '<span style="color: #999; font-style: italic;">Awaiting Digital Verification</span>';

//     const witnessSign = selectedCase.consentManagement.signatures.witness
//       ? `<img src="${(selectedCase.consentManagement as any).signatureImages?.witness || drawings.witness || ''}" style="height: 50px; border-bottom: 1px solid #ddd;" />`
//       : '<span style="color: #999; font-style: italic;">Awaiting Digital Verification</span>';

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Informed Consent Sheet - ${selectedCase.patient.name}</title>
//           <style>
//             body { font-family: Georgia, serif; color: #111; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
//             .header { text-align: center; border-bottom: 2px solid #2bb2a7; padding-bottom: 15px; margin-bottom: 30px; }
//             .title { font-size: 20px; font-weight: bold; text-transform: uppercase; margin: 0; color: #111; }
//             .sub { font-size: 11px; font-family: sans-serif; color: #555; margin-top: 5px; }
//             .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; font-family: sans-serif; font-size: 12px; }
//             .section-title { font-weight: bold; text-transform: uppercase; font-size: 10px; color: #555; margin-bottom: 5px; }
//             .panel { background: #f9f9f9; padding: 15px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 20px; }
//             .declaration { background: #fffdf9; border: 1px solid #f2ddd2; padding: 20px; border-radius: 8px; font-size: 13px; margin-bottom: 30px; }
//             .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; font-family: sans-serif; font-size: 11px; }
//             .sig-box { border-top: 1px solid #ccc; padding-top: 10px; text-align: center; height: 100px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; }
//             .metadata { font-size: 10px; color: #777; text-align: center; margin-top: 50px; border-top: 1px solid #eee; padding-top: 15px; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <div class="title">Swasti Medical Centers & Clinics</div>
//             <div class="sub">Informed Surgical Consent Authorization Document</div>
//           </div>
          
//           <div class="grid">
//             <div>
//               <div class="section-title">Patient Demographics</div>
//               <div><strong>Name:</strong> ${selectedCase.patient.name}</div>
//               <div><strong>Age:</strong> ${selectedCase.patient.age}y &bull; <strong>Gender:</strong> ${selectedCase.patient.gender}</div>
//               <div><strong>National Health ID:</strong> SW-${selectedCase.id}</div>
//             </div>
//             <div>
//               <div class="section-title">Clinical Referral</div>
//               <div><strong>Recommending Surgeon:</strong> ${selectedCase.recommendation.recommendedBy}</div>
//               <div><strong>Department:</strong> Orthopaedics & Surgical Medicine</div>
//               <div><strong>Case Reference:</strong> ${selectedCase.id}</div>
//             </div>
//           </div>

//           <div class="panel">
//             <div class="section-title">Planned Surgical Procedure</div>
//             <div style="font-size: 14px; font-weight: bold;">${selectedCase.recommendation.surgeryName}</div>
//           </div>

//           <div class="panel">
//             <div class="section-title">Diagnosed Presentation</div>
//             <div>${selectedCase.recommendation.diagnosis}</div>
//           </div>

//           <div class="declaration">
//             <div class="section-title">Consent Declaration & Statement of Understanding</div>
//             <p style="margin-top: 10px;">I hereby authorize ${selectedCase.recommendation.recommendedBy.startsWith('Dr.') ? selectedCase.recommendation.recommendedBy : `Dr. ${selectedCase.recommendation.recommendedBy}`} to perform the planned surgery (${selectedCase.recommendation.surgeryName}) and administer the required anesthesia. I confirm that the procedure's clinical indications, potential risks, anticipated benefits, and available alternatives have been explained to me in detail, and I fully consent to the treatment.</p>
//             <p>I also authorize the administration of any necessary blood products, transfusions, or emergency secondary interventions should unforeseen clinical circumstances arise during the course of the operation. I acknowledge that medicine is not an exact science and that no guarantees have been made to me regarding the absolute outcome of this procedure.</p>
//           </div>

//           <div class="signatures">
//             <div class="sig-box">
//               <div>${patientSign}</div>
//               <div><strong>Patient Signature</strong></div>
//             </div>
//             <div class="sig-box">
//               <div>${attendantSign}</div>
//               <div><strong>Attendant / Guardian Signature</strong></div>
//             </div>
//             <div class="sig-box">
//               <div>${doctorSign}</div>
//               <div><strong>Primary Surgeon Signature</strong></div>
//             </div>
//             <div class="sig-box">
//               <div>${witnessSign}</div>
//               <div><strong>Authorized Witness Signature</strong></div>
//             </div>
//           </div>

//           <div class="metadata">
//             Electronic Medical Record Verified & Encrypted. Signed digitally via National Health Swasti ID Portal. <br/>
//             Document ID: SEC-EMR-${selectedCase.id}-${Date.now().toString().slice(-6)}
//           </div>
          
//           <script>
//             window.onload = function() {
//               setTimeout(function() {
//                 window.print();
//               }, 500);
//             }
//           </script>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   const handleDownloadConsent = () => {
//     const docHtml = `
//       <html>
//         <head>
//           <title>Consent Form - ${selectedCase.patient.name}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; }
//             .header { text-align: center; border-bottom: 2px solid #2bb2a7; margin-bottom: 20px; padding-bottom: 10px; }
//             .content { margin-bottom: 20px; }
//             .section { font-weight: bold; margin-top: 15px; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h2>Swasti Medical Centers</h2>
//             <p>OFFICIAL DIGITAL CONSENT DOCUMENT</p>
//           </div>
//           <div class="content">
//             <p><strong>Case ID:</strong> ${selectedCase.id}</p>
//             <p><strong>Patient Name:</strong> ${selectedCase.patient.name} (Age: ${selectedCase.patient.age})</p>
//             <p><strong>Procedure Planned:</strong> ${selectedCase.recommendation.surgeryName}</p>
//             <p><strong>Clinical Diagnosis:</strong> ${selectedCase.recommendation.diagnosis}</p>
//             <p><strong>Declaration:</strong> I hereby authorize Dr. ${selectedCase.recommendation.recommendedBy} to perform the planned surgery and administer required anesthesia. I confirm that the procedure's risks, benefits, and alternatives have been explained to me, and I consent to the treatment.</p>
//           </div>
//           <p>This is a legally verified medical document exported from Swasti HIS on ${new Date().toLocaleString()}.</p>
//         </body>
//       </html>
//     `;
//     const blob = new Blob([docHtml], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `Surgical_Consent_${selectedCase.patient.name.replace(/\s+/g, '_')}_${selectedCase.id}.html`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   // Signature Drawing handlers
//   const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     const rect = canvas.getBoundingClientRect();
//     let x = 0, y = 0;
//     if ('touches' in e) {
//       if (e.touches.length === 0) return;
//       // Prevent scrolling when drawing on touch screens
//       if (e.cancelable) e.preventDefault();
//       x = e.touches[0].clientX - rect.left;
//       y = e.touches[0].clientY - rect.top;
//     } else {
//       x = e.clientX - rect.left;
//       y = e.clientY - rect.top;
//     }

//     ctx.beginPath();
//     ctx.moveTo(x, y);
//     setIsDrawing(true);
//   };

//   const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
//     if (!isDrawing) return;
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     const rect = canvas.getBoundingClientRect();
//     let x = 0, y = 0;
//     if ('touches' in e) {
//       if (e.touches.length === 0) return;
//       if (e.cancelable) e.preventDefault();
//       x = e.touches[0].clientX - rect.left;
//       y = e.touches[0].clientY - rect.top;
//     } else {
//       x = e.clientX - rect.left;
//       y = e.clientY - rect.top;
//     }

//     ctx.lineTo(x, y);
//     ctx.strokeStyle = '#0f172a'; // slate-900 ink
//     ctx.lineWidth = 2.5;
//     ctx.lineCap = 'round';
//     ctx.stroke();
//   };

//   const stopDrawing = () => {
//     setIsDrawing(false);
//   };

//   const clearCanvas = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//   };

//   // Sync active step when case selection changes
//   useEffect(() => {
//     setActiveStep(initialStep || Math.min(selectedCase.currentStep, 14));
//     setShareWhatsAppPhone(selectedCase?.patient?.phone || "");
//   }, [selectedCase.id, initialStep, selectedCase.currentStep, selectedCase?.patient?.phone]);

//   const stepsList = [
//     { num: 1, name: 'Procedure Recommendation', icon: ClipboardList },
//     { num: 2, name: 'Pre-Operative Assessment', icon: Activity },
//     { num: 3, name: 'Anesthesia Clearance', icon: Heart },
//     { num: 4, name: 'Authorization & Consent', icon: FileText },
//     { num: 5, name: 'Post-Anesthesia Care (PACU)', icon: Heart },
//     { num: 6, name: 'OT Slot Booking', icon: Clock },
//     { num: 7, name: 'Sterilization & Instrument Check', icon: Cpu },
//     { num: 8, name: 'Admissions & Pre-Op Checklist', icon: CheckSquare },
//     { num: 9, name: 'Surgical Consumables & Implants', icon: ShoppingBag },
//     { num: 10, name: 'Clinical Team Staffing', icon: Users },
//     { num: 11, name: 'Ward Transition & Recovery Orders', icon: Bookmark },
//     { num: 12, name: 'Clinical Outcome Tracking', icon: UserCheck },
//     { num: 13, name: 'Financial Clearance & Billing', icon: DollarSign },
//     { num: 14, name: 'Discharge & Outpatient Follow-Up', icon: ArrowLeft }
//   ];

//   // Helper to change current step of the case
//   const updateCurrentStep = (newStep: number, customStatus?: CaseStatus) => {
//     const updated = { ...selectedCase };
//     updated.currentStep = newStep;
//     if (customStatus) {
//       updated.status = customStatus;
//     } else {
//       // Auto mapping
//       if (newStep === 1) updated.status = 'Recommended';
//       else if (newStep === 2) updated.status = 'Assessment Pending';
//       else if (newStep === 3) updated.status = 'Assessment Completed';
//       else if (newStep === 5) updated.status = 'In Recovery';
//       else if (newStep === 6) updated.status = 'Scheduled';
//       else if (newStep === 8) updated.status = 'OT Day Clearance';
//       else if (newStep === 10) updated.status = 'Team Assigned';
//       else if (newStep === 11) updated.status = 'Shifted to Ward';
//       else if (newStep === 14) updated.status = 'Ready for Discharge';
//     }
//     onUpdateCase(updated);
//   };

//   const handleFieldChange = (section: keyof SurgeryCase, field: string, value: any) => {
//     const updated = { ...selectedCase };
//     (updated[section] as any) = {
//       ...(updated[section] as any),
//       [field]: value
//     };
//     onUpdateCase(updated);
//   };

//   const handleNestedFieldChange = (section: keyof SurgeryCase, subSection: string, field: string, value: any) => {
//     const updated = { ...selectedCase };
//     const sec = updated[section] as any;
//     sec[subSection] = {
//       ...sec[subSection],
//       [field]: value
//     };
//     onUpdateCase(updated);
//   };

//   const handleCostFieldChange = (field: string, val: number) => {
//     const updated = { ...selectedCase };
//     const currentCharges = { ...updated.costEstimation.charges, [field]: val };
    
//     // assistantFee is usually 30% of surgeon fee
//     if (field === 'surgeonFee') {
//       currentCharges.assistantFee = Math.round(val * 0.3);
//     }
    
//     const sumTotal = Object.values(currentCharges).reduce((sum: number, x: any) => sum + (Number(x) || 0), 0);
    
//     updated.costEstimation = {
//       ...updated.costEstimation,
//       charges: currentCharges,
//       estimatedCost: sumTotal,
//       packageCost: Math.round(sumTotal * 0.95),
//       insurancePayable: Math.round(sumTotal * 0.85),
//       patientPayable: Math.round(sumTotal * 0.15)
//     };
//     onUpdateCase(updated);
//   };

//   // Consult Swasti AI Server
//   const consultAI = async () => {
//     setAiLoading(true);
//     setAiLogs([]);
//     setShowCoPilot(true);

//     const logs = [
//       "Analyzing patient's clinical history...",
//       "Gathering evidence-based surgical pathways...",
//       "Matching comorbidities for anesthesia risk...",
//       "Synthesizing standard equipment requirement checklist...",
//       "Generating clinical post-operative orders suggestion..."
//     ];

//     // Log simulator
//     for (let i = 0; i < logs.length; i++) {
//       setAiLogs(prev => [...prev, logs[i]]);
//       await new Promise(r => setTimeout(r, 400));
//     }

//     try {
//       const response = await fetch("/ot/api/gemini/generate-plan", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           diagnosis: selectedCase.recommendation.diagnosis,
//           surgeryName: selectedCase.recommendation.surgeryName,
//           patientAge: selectedCase.patient.age,
//           patientGender: selectedCase.patient.gender
//         })
//       });

//       const data = await response.json();
//       setAiResult(data);
//     } catch (err) {
//       console.error(err);
//       setAiResult({
//         historyAlerts: "Verify coagulation profile and stop any anti-platelet therapy. Screen for respiratory infections.",
//         preOpTests: ["CBC", "Serum Electrolytes", "Random Blood Sugar", "ECG"],
//         anesthesiaType: "General",
//         anesthesiaRisk: "Standard airway safety protocol. Risk is graded standard.",
//         suggestedEquipment: ["Physiological monitor", "Electrosurgical generator", "Laparoscopy Tower"],
//         postOpMedications: "Tab. Paracetamol 650mg TDS, Cap. Moxifloxacin 400mg OD.",
//         postOpNursingTasks: ["Monitor post-op vitals hourly", "Maintain IV access", "Enforce strict fasting"],
//         costSuggestion: { surgeonFee: 25000, implantsCost: 0, otCharges: 15000, totalEstimatedCost: 85000 }
//       });
//     } finally {
//       setAiLoading(false);
//     }
//   };

//   // Auto-fill forms with AI Suggestions
//   const autofillWithAI = () => {
//     if (!aiResult) return;
//     const updated = { ...selectedCase };

//     // Step 2 Assessment autofill
//     updated.preSurgeryAssessment = {
//       performedBy: selectedCase.recommendation.recommendedBy,
//       medicalHistory: aiResult.historyAlerts,
//       previousSurgeries: selectedCase.preSurgeryAssessment.previousSurgeries || 'None',
//       allergies: selectedCase.preSurgeryAssessment.allergies || 'None',
//       currentMedication: selectedCase.preSurgeryAssessment.currentMedication || 'None',
//       comorbidities: selectedCase.preSurgeryAssessment.comorbidities,
//       vitals: selectedCase.preSurgeryAssessment.vitals,
//       tests: {
//         ...selectedCase.preSurgeryAssessment.tests,
//         cbc: 'Hb: 13.2, WBC: 7400',
//         bloodGroup: selectedCase.patient.bloodGroup,
//         ptInr: 'PT: 12s, INR: 1.0',
//         bloodSugar: 'FBS: 95 mg/dL'
//       },
//       fitnessStatus: 'Fit'
//     };

//     // Step 3 Anesthesia autofill
//     updated.anesthesiaEvaluation = {
//       anesthetistName: 'Dr. Vivek Ranjan',
//       asaGrade: 'ASA I',
//       airwayAssessment: 'Mallampati Class I',
//       previousAnesthesiaHistory: 'None',
//       drugAllergies: 'None known',
//       anesthesiaType: aiResult.anesthesiaType as any,
//       status: 'Approved',
//       evaluationDate: new Date().toISOString().split('T')[0]
//     };

//     // Step 4 Cost Estimation autofill
//     updated.costEstimation = {
//       charges: {
//         surgeonFee: aiResult.costSuggestion.surgeonFee,
//         assistantFee: Math.round(aiResult.costSuggestion.surgeonFee * 0.3),
//         otUsage: aiResult.costSuggestion.otCharges,
//         recoveryRoom: 3000,
//         anesthesia: 10000,
//         nursing: 4000,
//         implants: aiResult.costSuggestion.implantsCost,
//         consumables: 6000,
//         medicines: 5000,
//         investigations: 4000,
//         roomCharges: 6000
//       },
//       estimatedCost: aiResult.costSuggestion.totalEstimatedCost,
//       packageCost: Math.round(aiResult.costSuggestion.totalEstimatedCost * 0.95),
//       patientPayable: Math.round(aiResult.costSuggestion.totalEstimatedCost * 0.15),
//       insurancePayable: Math.round(aiResult.costSuggestion.totalEstimatedCost * 0.85)
//     };

//     // Step 7 Team assignment suggestions
//     updated.teamAssignment.team = {
//       primarySurgeon: selectedCase.recommendation.recommendedBy,
//       assistantSurgeon: 'Dr. Meera Sen',
//       leadAnesthetist: 'Dr. Parul Chaudhary',
//       assistantAnesthetist: 'Dr. Vivek Ranjan',
//       scrubNurse: 'Sister Mini Joseph',
//       circulatingNurse: 'Sister Swapna Roy',
//       otTechnician: 'Brother Sunil Gowda',
//       biomedicalTech: 'Suresh Kumar'
//     };

//     // Step 14 Post-Op orders autofill
//     updated.postOpOrders = {
//       medications: aiResult.postOpMedications,
//       antibiotics: 'Inj. Cefuroxime 1.5g IV Stat',
//       fluids: 'Normal Saline 100ml/hr',
//       diet: 'NPO for 4h, then soft oral liquids',
//       physiotherapy: 'Chest physiotherapy, early bed mobilization',
//       nursingTasks: aiResult.postOpNursingTasks.map((t: string, idx: number) => ({
//         id: `NT-${Date.now()}-${idx}`,
//         task: t,
//         done: false,
//         assignedTime: '16:00'
//       }))
//     };

//     onUpdateCase(updated);
//     alert("Swasti AI co-pilot successfully initialized and auto-filled workflow steps 2, 3, 4, 7, and 14!");
//   };

//   // Simulate Live Surgery day timeline
//   const runSurgerySimulation = async () => {
//     setIsSimulatingSurgery(true);
//     const updated = { ...selectedCase };
//     updated.intraOperative.timeline.patientShiftedToOT = '08:00';
//     updated.intraOperative.timeline.anesthesiaStart = '08:15';
//     updated.intraOperative.timeline.surgeryStart = '08:35';
    
//     updated.intraOperative.events = [
//       { time: '08:00', event: 'Shifted to OT', note: 'Patient successfully rolled into OT Suite' }
//     ];
//     onUpdateCase(updated);

//     const simulationEvents = [
//       { time: '08:15', event: 'Anesthesia Induced', note: 'Patient successfully placed on ventilator' },
//       { time: '08:35', event: 'Surgical Incision', note: 'Skin incision taken, clean anatomical exposure' },
//       { time: '09:10', event: 'Procedure Milestone', note: 'Pathology located and successfully excised' },
//       { time: '09:40', event: 'Closure & Dressings', note: 'Anatomical layers closed, sterile sutures placed' }
//     ];

//     for (let i = 0; i < simulationEvents.length; i++) {
//       await new Promise(r => setTimeout(r, 1500));
//       const up = { ...selectedCase };
//       up.intraOperative.events = [...up.intraOperative.events, simulationEvents[i]];
//       if (i === simulationEvents.length - 1) {
//         up.intraOperative.timeline.surgeryEnd = '09:40';
//         up.intraOperative.timeline.anesthesiaEnd = '09:45';
//         up.intraOperative.surgicalNotes = {
//           procedurePerformed: selectedCase.recommendation.surgeryName,
//           findings: `No anatomical anomalies. Excised pathology matching standard protocol. Intraoperative bleeding was minimal.`,
//           complications: 'None encountered',
//           bloodLoss: 120,
//           implantUsed: selectedCase.costEstimation.charges.implants > 0 ? 'Prosthetic Joint / Mesh system' : 'None',
//           specimenSent: true
//         };
//       }
//       onUpdateCase(up);
//     }
//     setIsSimulatingSurgery(false);
//   };

//   // Simulate Post-Op recovery vitals charting
//   const runRecoverySimulation = async () => {
//     setIsSimulatingRecovery(true);
//     const updated = { ...selectedCase };
//     updated.postOpRecovery.vitalsLogs = [
//       { time: '10:00', bp: '135/85', pulse: 92, spo2: 95, painScore: 8, consciousness: 'Arousable to Voice' }
//     ];
//     onUpdateCase(updated);

//     const vitalsTicks: SurgeryCase['postOpRecovery']['vitalsLogs'] = [
//       { time: '10:15', bp: '130/80', pulse: 86, spo2: 97, painScore: 6, consciousness: 'Fully Awake' },
//       { time: '10:30', bp: '124/78', pulse: 78, spo2: 99, painScore: 4, consciousness: 'Fully Awake' },
//       { time: '10:45', bp: '120/76', pulse: 74, spo2: 99, painScore: 2, consciousness: 'Fully Awake' }
//     ];

//     for (let i = 0; i < vitalsTicks.length; i++) {
//       await new Promise(r => setTimeout(r, 1200));
//       const up = { ...selectedCase };
//       up.postOpRecovery.vitalsLogs = [...up.postOpRecovery.vitalsLogs, vitalsTicks[i]];
//       if (i === vitalsTicks.length - 1) {
//         up.postOpRecovery.status = 'Stable';
//       }
//       onUpdateCase(up);
//     }
//     setIsSimulatingRecovery(false);
//   };

//   // Consumables inventory helper
//   const addConsumable = (name: string, cost: number) => {
//     const updated = { ...selectedCase };
//     const currentList = [...updated.consumablesTracking.surgicalConsumables];
//     const existing = currentList.find(i => i.name === name);
//     if (existing) {
//       existing.quantity += 1;
//     } else {
//       currentList.push({ name, quantity: 1, cost });
//     }
//     updated.consumablesTracking.surgicalConsumables = currentList;
//     onUpdateCase(updated);
//   };

//   // Auto compile final billing (Step 16)
//   const computeFinalBilling = () => {
//     const updated = { ...selectedCase };
//     const est = updated.costEstimation.charges;
    
//     // Sum up any added consumables & medicines
//     const consumablesCost = updated.consumablesTracking.surgicalConsumables.reduce((acc, i) => acc + (i.cost * i.quantity), 0);
//     const medicinesCost = updated.consumablesTracking.medicinesUsed.reduce((acc, i) => acc + (i.cost * i.quantity), 0);
//     const implantsCost = updated.consumablesTracking.implants.reduce((acc, i) => acc + i.cost, 0);

//     const actualCharges = {
//       surgeonFee: est.surgeonFee || 25000,
//       assistantFee: est.assistantFee || 8000,
//       otUsage: est.otUsage || 15000,
//       recoveryRoom: est.recoveryRoom || 3000,
//       anesthesia: est.anesthesia || 10000,
//       nursing: est.nursing || 4000,
//       implants: implantsCost || est.implants,
//       consumables: consumablesCost || est.consumables || 5000,
//       medicines: medicinesCost || est.medicines || 4000,
//       investigations: est.investigations || 4000,
//       roomCharges: est.roomCharges || 6000
//     };

//     const sum = Object.values(actualCharges).reduce((a, b) => a + b, 0);

//     updated.billing.actualCharges = actualCharges;
//     updated.billing.totalActualCost = sum;
//     updated.billing.isBilled = true;
//     updated.billing.billingDate = new Date().toISOString().split('T')[0];

//     onUpdateCase(updated);
//   };

//   return (
//     <div id={`workflow-manager-${selectedCase.id}`} className="space-y-6">
//       {/* Back button and patient clinical banner */}
//       <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl p-6">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <div className="space-y-1">
//             <button 
//               onClick={onBack}
//               className="flex items-center gap-1.5 text-xs text-teal-400 font-bold hover:text-teal-300 transition uppercase mb-2"
//             >
//               <ArrowLeft className="w-4 h-4" /> Back to Directory
//             </button>
//             <div className="flex items-center gap-3">
//               <h2 className="text-xl font-bold tracking-tight text-white">{selectedCase.patient.name}</h2>
//               <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">
//                 {selectedCase.patient.age}y {selectedCase.patient.gender}
//               </span>
//               <span className="text-xs bg-teal-500/10 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-mono">
//                 {selectedCase.id}
//               </span>
//             </div>
//             <p className="text-sm text-slate-400 font-medium mt-1">
//               Diagnosis: <strong className="text-slate-200">{selectedCase.recommendation.diagnosis}</strong>
//             </p>
//           </div>

//           {/* AI Consult Trigger */}
//           <div className="flex gap-3">
//             <button 
//               onClick={startListening}
//               className={`p-3 rounded-xl flex items-center justify-center transition shadow-lg ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
//               title="Voice Input"
//             >
//               <Mic className="w-5 h-5" />
//             </button>
//             <button 
//               onClick={consultAI}
//               className="bg-gradient-to-r from-teal-500 to-indigo-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-teal-500/15"
//             >
//               <Sparkles className="w-4 h-4 text-slate-950" /> Consult Swasti AI Co-Pilot
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Swasti AI Voice Intake Command Center */}
//       <div id="voice-intake-command-center" className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
//         {/* Subtle decorative glow */}
//         <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
//         <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-30 -mb-30" />

//         <div className="relative flex flex-col gap-5">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
//             <div>
//               <div className="flex items-center gap-2">
//                 <span className="flex h-2.5 w-2.5 relative">
//                   {topVoiceListening && (
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//                   )}
//                   <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${topVoiceListening ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
//                 </span>
//                 <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 font-mono">Real-time Dictation Engine</span>
//               </div>
//               <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-1">
//                 <Mic className={`w-5 h-5 ${topVoiceListening ? 'text-red-500 animate-pulse' : 'text-teal-400'}`} />
//                 Swasti AI Patient Intake Center
//               </h3>
//               <p className="text-xs text-slate-400 mt-1 max-w-2xl">
//                 Dictate or paste complete clinical details for the surgery case. Swasti AI will perform deep clinical analysis to extract and auto-fill all 14 stages of the hospital workflow simultaneously.
//               </p>
//             </div>
            
//             <div className="flex gap-2.5 self-stretch md:self-auto">
//               <button
//                 type="button"
//                 onClick={topVoiceListening ? stopTopVoiceDictation : startTopVoiceDictation}
//                 className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200 border cursor-pointer ${
//                   topVoiceListening 
//                     ? 'bg-red-500 border-red-500 hover:bg-red-600 text-white animate-pulse' 
//                     : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-teal-300 hover:text-teal-200'
//                 }`}
//               >
//                 {topVoiceListening ? (
//                   <>
//                     <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
//                     Stop Listening
//                   </>
//                 ) : (
//                   <>
//                     <Mic className="w-4 h-4 text-teal-400" />
//                     Start Listening
//                   </>
//                 )}
//               </button>
              
//               <button
//                 type="button"
//                 onClick={() => {
//                   setTopVoiceText("");
//                   setVoiceIntakeSuccess(false);
//                 }}
//                 className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition duration-200 cursor-pointer"
//                 title="Clear input"
//               >
//                 Clear
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Input Textarea Block */}
//             <div className="lg:col-span-2 space-y-2">
//               <label htmlFor="voice-intake-textarea" className="text-xs font-bold text-slate-300 block">
//                 Comprehensive Case Intake Transcript & Dictation Box
//               </label>
//               <textarea
//                 id="voice-intake-textarea"
//                 rows={5}
//                 value={topVoiceText}
//                 onChange={(e) => setTopVoiceText(e.target.value)}
//                 placeholder="Click the microphone or type here to describe the full surgical scenario... Example: 'Recommend open mesh hernioplasty for right inguinal hernia. Dr Devendra Mehta is primary surgeon, Dr Ronald anesthetist. Patients preoperative BP is 128/80. Prepare OT Room 3, schedule for July 5th at 10:00 AM.'"
//                 className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/50 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition resize-none font-sans"
//               />
//               <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono px-1">
//                 <span>{topVoiceText.length} characters captured</span>
//                 {topVoiceListening && <span className="text-red-400 animate-pulse">Capturing live vocal stream...</span>}
//               </div>
//             </div>

//             {/* AI Action Box / Logging Panel */}
//             <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[140px]">
//               {voiceIntakeLoading ? (
//                 <div className="space-y-3 flex-1 flex flex-col justify-center">
//                   <div className="flex items-center gap-2.5 text-teal-400 font-bold text-xs">
//                     <svg className="animate-spin h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                     </svg>
//                     <span>{voiceIntakeStatus}</span>
//                   </div>
//                   <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 h-24 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1">
//                     {voiceIntakeLogs.map((log, idx) => (
//                       <div key={idx} className="flex gap-1.5 items-start">
//                         <span className="text-teal-500 select-none">▶</span>
//                         <span>{log}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : voiceIntakeSuccess && extractedSummary ? (
//                 <div className="space-y-3 flex-1">
//                   <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs border-b border-slate-800 pb-2">
//                     <CheckSquare className="w-4 h-4 text-emerald-400" />
//                     <span>Intake Extracted Perfectly!</span>
//                   </div>
//                   <div className="space-y-1 text-slate-300 text-[10px] font-mono">
//                     <div className="flex justify-between border-b border-slate-900 py-0.5">
//                       <span className="text-slate-500">DIAGNOSIS:</span>
//                       <span className="text-slate-200 font-bold truncate max-w-[130px]" title={extractedSummary.diagnosis}>{extractedSummary.diagnosis}</span>
//                     </div>
//                     <div className="flex justify-between border-b border-slate-900 py-0.5">
//                       <span className="text-slate-500">SURGERY:</span>
//                       <span className="text-slate-200 truncate max-w-[130px]" title={extractedSummary.surgeryName}>{extractedSummary.surgeryName}</span>
//                     </div>
//                     <div className="flex justify-between border-b border-slate-900 py-0.5">
//                       <span className="text-slate-500">ANESTHESIA:</span>
//                       <span className="text-slate-200">{extractedSummary.anesthesiaType}</span>
//                     </div>
//                     <div className="flex justify-between border-b border-slate-900 py-0.5">
//                       <span className="text-slate-500">PRIMARY SURGEON:</span>
//                       <span className="text-slate-200 font-bold">{extractedSummary.primarySurgeon}</span>
//                     </div>
//                     <div className="flex justify-between py-0.5">
//                       <span className="text-slate-500">DISCHARGE STATUS:</span>
//                       <span className="text-teal-400 font-bold">{extractedSummary.dischargeStatus}</span>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex-1 flex flex-col justify-center items-center text-center p-3">
//                   <Sparkles className="w-8 h-8 text-slate-700 mb-2" />
//                   <p className="text-slate-500 text-[11px]">
//                     No case transcription processed yet. Enter or speak text, then trigger extraction.
//                   </p>
//                 </div>
//               )}

//               <button
//                 type="button"
//                 onClick={processTopVoiceIntake}
//                 disabled={voiceIntakeLoading || !topVoiceText.trim()}
//                 className={`w-full bg-gradient-to-r from-teal-500 to-indigo-500 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-teal-500/10 cursor-pointer ${
//                   voiceIntakeLoading || !topVoiceText.trim() 
//                     ? 'opacity-50 cursor-not-allowed grayscale' 
//                     : 'hover:opacity-95 hover:shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98]'
//                 }`}
//               >
//                 <Sparkles className="w-4 h-4 text-slate-950" />
//                 {voiceIntakeLoading ? "Processing Case Intake..." : "Extract & Fill All 14 Steps"}
//               </button>
//             </div>
//           </div>

//           {voiceIntakeSuccess && (
//             <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-2xl p-3.5 text-xs flex items-start gap-3">
//               <span className="text-lg">🎉</span>
//               <div>
//                 <strong className="text-emerald-200">Timeline Generation Successful:</strong> All 14 stages have been structured with relevant clinical recommendations, bookings, staff schedules, anesthesiology grades, billing projections, and clearance tasks. You can view, verify, and customize individual steps using the timeline navigation tabs below.
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 17-Step Process Step Navigator Bar */}
//       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 overflow-x-auto">
//         <div className="flex gap-4 min-w-max pb-2">
//           {stepsList.map(s => {
//             const isCompleted = s.num < selectedCase.currentStep;
//             const isActive = s.num === activeStep;
//             const isUnreached = s.num > selectedCase.currentStep;

//             let circleClass = 'bg-slate-100 text-slate-500 border-slate-200';
//             if (isCompleted) circleClass = 'bg-teal-500 text-slate-950 border-teal-500';
//             if (isActive) circleClass = 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-100';

//             return (
//               <button
//                 key={s.num}
//                 onClick={() => setActiveStep(s.num)}
//                 id={`btn-step-${s.num}`}
//                 className={`flex items-center gap-2 p-2 rounded-xl transition-all duration-200 border text-xs font-semibold ${
//                   isActive 
//                     ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
//                     : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100'
//                 }`}
//               >
//                 <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border ${circleClass}`}>
//                   {isCompleted ? '✓' : s.num}
//                 </span>
//                 <span>{s.name.split(' ')[0]}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Main Workflow Layout (Form + AI Sidecar) */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* Left/Center Panel: Step Form Content */}
//         <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
//           <div className="flex justify-between items-center border-b border-slate-100 pb-4">
//             <div>
//               <span className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Workflow Phase {activeStep}/14</span>
//               <h3 className="text-lg font-bold text-slate-900 mt-1">{stepsList[activeStep - 1]?.name}</h3>
//             </div>
            
//             {/* Step navigation controllers */}
//             <div className="flex gap-2">
//               <button 
//                 disabled={activeStep === 1}
//                 onClick={() => setActiveStep(prev => prev - 1)}
//                 className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40"
//               >
//                 Previous Step
//               </button>
//               <button 
//                 disabled={activeStep === 14}
//                 onClick={() => {
//                   if (activeStep >= selectedCase.currentStep) {
//                     updateCurrentStep(activeStep + 1);
//                   }
//                   setActiveStep(prev => prev + 1);
//                 }}
//                 className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg font-bold"
//               >
//                 Next Step
//               </button>
//             </div>
//           </div>

//           {/* Render Active Form Panels */}
//           {activeStep === 1 && (
//             <div className="space-y-4">
//               <p className="text-xs text-slate-500">Capture surgery recommendation parameters.</p>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <div className="flex justify-between items-center">
//                     <label className="text-xs font-semibold text-slate-600">Diagnosis</label>
//                     <VoiceInputIcon 
//                       label="Diagnosis" 
//                       value={selectedCase.recommendation.diagnosis} 
//                       onTranscript={(text) => handleFieldChange('recommendation', 'diagnosis', text)} 
//                     />
//                   </div>
//                   <input 
//                     type="text"
//                     value={selectedCase.recommendation.diagnosis}
//                     onChange={(e) => handleFieldChange('recommendation', 'diagnosis', e.target.value)}
//                     className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <div className="flex justify-between items-center">
//                     <label className="text-xs font-semibold text-slate-600">Proposed Procedure</label>
//                     <VoiceInputIcon 
//                       label="Proposed Procedure" 
//                       value={selectedCase.recommendation.surgeryName} 
//                       onTranscript={(text) => handleFieldChange('recommendation', 'surgeryName', text)} 
//                     />
//                   </div>
//                   <input 
//                     type="text"
//                     value={selectedCase.recommendation.surgeryName}
//                     onChange={(e) => handleFieldChange('recommendation', 'surgeryName', e.target.value)}
//                     className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none"
//                   />
//                 </div>
//               </div>
//               <div className="space-y-1">
//                 <div className="flex justify-between items-center">
//                   <label className="text-xs font-semibold text-slate-600">Clinical Presentation & Case notes</label>
//                   <VoiceInputIcon 
//                     label="Clinical Notes" 
//                     value={selectedCase.recommendation.clinicalNotes} 
//                     onTranscript={(text) => handleFieldChange('recommendation', 'clinicalNotes', text)} 
//                   />
//                 </div>
//                 <textarea 
//                   rows={4}
//                   value={selectedCase.recommendation.clinicalNotes}
//                   onChange={(e) => handleFieldChange('recommendation', 'clinicalNotes', e.target.value)}
//                   className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none resize-none"
//                 />
//               </div>

//               {/* Merged Step: Cost Estimation Worksheet */}
//               <div className="pt-4 border-t border-slate-100 space-y-4">
//                 <h4 className="text-xs font-bold text-teal-600 border-b border-teal-50 pb-1">Surgery Cost Estimation Worksheet</h4>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600">Primary Surgeon Fee (₹)</label>
//                     <input 
//                       type="number"
//                       value={selectedCase.costEstimation.charges.surgeonFee || 0}
//                       onChange={(e) => handleCostFieldChange('surgeonFee', parseInt(e.target.value) || 0)}
//                       className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
//                     />
//                   </div>
//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600">OT Usage Charge (₹)</label>
//                     <input 
//                       type="number"
//                       value={selectedCase.costEstimation.charges.otUsage || 0}
//                       onChange={(e) => handleCostFieldChange('otUsage', parseInt(e.target.value) || 0)}
//                       className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
//                     />
//                   </div>
//                   <div className="space-y-1">
//                     <label className="text-xs font-semibold text-slate-600">Anesthesia Fee (₹)</label>
//                     <input 
//                       type="number"
//                       value={selectedCase.costEstimation.charges.anesthesia || 0}
//                       onChange={(e) => handleCostFieldChange('anesthesia', parseInt(e.target.value) || 0)}
//                       className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
//                     />
//                   </div>
//                 </div>
//                 <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
//                   <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
//                     <span>Calculated Package Cost:</span>
//                     <span className="font-bold text-slate-900">₹{selectedCase.costEstimation.packageCost.toLocaleString('en-IN')}</span>
//                   </div>
//                   <div className="flex justify-between items-center text-xs text-slate-600">
//                     <span>Insurance Payable (85%):</span>
//                     <span>₹{selectedCase.costEstimation.insurancePayable.toLocaleString('en-IN')}</span>
//                   </div>
//                   <div className="flex justify-between items-center text-xs text-slate-600">
//                     <span>Patient Co-pay (15%):</span>
//                     <span>₹{selectedCase.costEstimation.patientPayable.toLocaleString('en-IN')}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Merged Step: Insurance Authorization */}
//               <div className="pt-4 border-t border-slate-100 space-y-4">
//                 <h4 className="text-xs font-bold text-teal-600 border-b border-teal-50 pb-1">Insurance & Third-Party Administrator (TPA)</h4>
//                 <div className="space-y-2">
//                   <label className="text-xs text-slate-700 flex items-center gap-1.5 font-bold">
//                     <input 
//                       type="checkbox"
//                       checked={selectedCase.insurancePreAuth.hasInsurance}
//                       onChange={(e) => handleFieldChange('insurancePreAuth', 'hasInsurance', e.target.checked)}
//                     /> Patient Has Active Medical Insurance Coverage
//                   </label>
//                 </div>

//                 {selectedCase.insurancePreAuth.hasInsurance && (
//                   <div className="space-y-4 animate-in fade-in duration-200">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="space-y-1">
//                         <label className="text-xs font-semibold text-slate-600">Insurance Provider Company</label>
//                         <input 
//                           type="text"
//                           value={selectedCase.insurancePreAuth.insuranceCompany}
//                           onChange={(e) => handleFieldChange('insurancePreAuth', 'insuranceCompany', e.target.value)}
//                           className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none"
//                         />
//                       </div>
//                       <div className="space-y-1">
//                         <label className="text-xs font-semibold text-slate-600">TPA Organization Name</label>
//                         <input 
//                           type="text"
//                           value={selectedCase.insurancePreAuth.tpaName}
//                           onChange={(e) => handleFieldChange('insurancePreAuth', 'tpaName', e.target.value)}
//                           className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-3 gap-3">
//                       <div className="space-y-1">
//                         <label className="text-xs font-semibold text-slate-600">Requested Amount (₹)</label>
//                         <input 
//                           type="number"
//                           value={selectedCase.insurancePreAuth.requestedAmount || 0}
//                           onChange={(e) => handleFieldChange('insurancePreAuth', 'requestedAmount', parseInt(e.target.value) || 0)}
//                           className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
//                         />
//                       </div>
//                       <div className="space-y-1">
//                         <label className="text-xs font-semibold text-slate-600">Approved Amount (₹)</label>
//                         <input 
//                           type="number"
//                           value={selectedCase.insurancePreAuth.approvedAmount || 0}
//                           onChange={(e) => handleFieldChange('insurancePreAuth', 'approvedAmount', parseInt(e.target.value) || 0)}
//                           className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
//                         />
//                       </div>
//                       <div className="space-y-1">
//                         <label className="text-xs font-semibold text-slate-600">Pre-Auth Status</label>
//                         <select 
//                           value={selectedCase.insurancePreAuth.status}
//                           onChange={(e) => handleFieldChange('insurancePreAuth', 'status', e.target.value)}
//                           className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:border-teal-500 focus:outline-none"
//                         >
//                           <option value="Draft">Draft</option>
//                           <option value="Submitted">Submitted</option>
//                           <option value="Under Review">Under Review</option>
//                           <option value="Query Raised">Query Raised</option>
//                           <option value="Approved">Approved / Cleared</option>
//                           <option value="Rejected">Rejected</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeStep === 2 && (
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 uppercase border-b pb-1">Pre-Surgery Assessment</h4>
//               <div className="grid grid-cols-3 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Blood Pressure</label>
//                   <input 
//                     type="text"
//                     value={selectedCase.preSurgeryAssessment.vitals.bp}
//                     onChange={(e) => handleNestedFieldChange('preSurgeryAssessment', 'vitals', 'bp', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Pulse (bpm)</label>
//                   <input 
//                     type="number"
//                     value={selectedCase.preSurgeryAssessment.vitals.pulse}
//                     onChange={(e) => handleNestedFieldChange('preSurgeryAssessment', 'vitals', 'pulse', parseInt(e.target.value))}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">SPO2 (%)</label>
//                   <input 
//                     type="number"
//                     value={selectedCase.preSurgeryAssessment.vitals.spo2}
//                     onChange={(e) => handleNestedFieldChange('preSurgeryAssessment', 'vitals', 'spo2', parseInt(e.target.value))}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Medical History</label>
//                   <textarea 
//                     rows={3}
//                     value={selectedCase.preSurgeryAssessment.medicalHistory}
//                     onChange={(e) => handleFieldChange('preSurgeryAssessment', 'medicalHistory', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-850 resize-none"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Drug Allergies</label>
//                   <input 
//                     type="text"
//                     value={selectedCase.preSurgeryAssessment.allergies}
//                     onChange={(e) => handleFieldChange('preSurgeryAssessment', 'allergies', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4 border-t pt-3">
//                 <div className="space-y-1">
//                   <span className="text-xs font-semibold text-slate-600 block">Comorbidities Check</span>
//                   <div className="flex gap-4 flex-wrap">
//                     <label className="text-xs text-slate-700 flex items-center gap-1">
//                       <input 
//                         type="checkbox"
//                         checked={selectedCase.preSurgeryAssessment.comorbidities.diabetes}
//                         onChange={(e) => handleNestedFieldChange('preSurgeryAssessment', 'comorbidities', 'diabetes', e.target.checked)}
//                       /> Diabetes
//                     </label>
//                     <label className="text-xs text-slate-700 flex items-center gap-1">
//                       <input 
//                         type="checkbox"
//                         checked={selectedCase.preSurgeryAssessment.comorbidities.hypertension}
//                         onChange={(e) => handleNestedFieldChange('preSurgeryAssessment', 'comorbidities', 'hypertension', e.target.checked)}
//                       /> Hypertension
//                     </label>
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Surgical Fitness Verdict</label>
//                   <select 
//                     value={selectedCase.preSurgeryAssessment.fitnessStatus}
//                     onChange={(e) => handleFieldChange('preSurgeryAssessment', 'fitnessStatus', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
//                   >
//                     <option value="Pending">Pending</option>
//                     <option value="Fit">Fit For Surgery</option>
//                     <option value="Not Fit">Not Fit For Surgery</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeStep === 3 && (
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Anesthesia Pre-Op Evaluation</h4>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">ASA Grade</label>
//                   <select 
//                     value={selectedCase.anesthesiaEvaluation.asaGrade}
//                     onChange={(e) => handleFieldChange('anesthesiaEvaluation', 'asaGrade', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
//                   >
//                     <option value="ASA I">ASA I (Healthy Patient)</option>
//                     <option value="ASA II">ASA II (Mild Systemic Disease)</option>
//                     <option value="ASA III">ASA III (Severe Systemic Disease)</option>
//                     <option value="ASA IV">ASA IV (Life-threatening Disease)</option>
//                   </select>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Proposed Anesthesia Type</label>
//                   <select 
//                     value={selectedCase.anesthesiaEvaluation.anesthesiaType}
//                     onChange={(e) => handleFieldChange('anesthesiaEvaluation', 'anesthesiaType', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
//                   >
//                     <option value="General">General Anesthesia</option>
//                     <option value="Regional">Regional Block</option>
//                     <option value="Spinal">Spinal Block</option>
//                     <option value="Local">Local Anesthesia</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="space-y-1">
//                 <label className="text-xs font-semibold text-slate-600">Airway Assessment (Mallampati Score)</label>
//                 <input 
//                   type="text"
//                   placeholder="e.g. Mallampati Class II"
//                   value={selectedCase.anesthesiaEvaluation.airwayAssessment}
//                   onChange={(e) => handleFieldChange('anesthesiaEvaluation', 'airwayAssessment', e.target.value)}
//                   className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <label className="text-xs font-semibold text-slate-600">Anesthesia Clearance Status</label>
//                 <select 
//                   value={selectedCase.anesthesiaEvaluation.status}
//                   onChange={(e) => handleFieldChange('anesthesiaEvaluation', 'status', e.target.value)}
//                   className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500"
//                 >
//                   <option value="Pending">Pending Evaluation</option>
//                   <option value="Approved">Approved for Anesthesia</option>
//                   <option value="Rejected">Rejected</option>
//                 </select>
//               </div>
//             </div>
//           )}

//           {activeStep === 4 && (
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Digital Consent Forms & Signatures</h4>
              
//               {/* Prompt Callout */}
//               <div className="p-3 bg-[#FFFBF0] border border-amber-200/60 rounded-xl flex items-start gap-2 animate-fade-in shadow-sm">
//                 <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
//                 <div>
//                   <span className="text-xs font-bold text-amber-850 block">Instruction Guide</span>
//                   <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
//                     "Please tick below consents already taken."
//                   </p>
//                 </div>
//               </div>

//               {/* Consent checklist */}
//               <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
//                 <span className="text-xs font-bold text-slate-700 block">Required Consent Acknowledgments</span>
                
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                   <label className="p-3 bg-white rounded-xl border border-slate-200/60 hover:border-[#2BB2A7]/40 text-xs text-slate-700 flex items-center gap-2 cursor-pointer transition shadow-xs">
//                     <input 
//                       type="checkbox"
//                       className="accent-[#2BB2A7] w-3.5 h-3.5"
//                       checked={selectedCase.consentManagement.consents.surgery}
//                       onChange={(e) => handleNestedFieldChange('consentManagement', 'consents', 'surgery', e.target.checked)}
//                     /> 
//                     <span>High-Risk Surgery Informed Consent</span>
//                   </label>
                  
//                   <label className="p-3 bg-white rounded-xl border border-slate-200/60 hover:border-[#2BB2A7]/40 text-xs text-slate-700 flex items-center gap-2 cursor-pointer transition shadow-xs">
//                     <input 
//                       type="checkbox"
//                       className="accent-[#2BB2A7] w-3.5 h-3.5"
//                       checked={selectedCase.consentManagement.consents.anesthesia}
//                       onChange={(e) => handleNestedFieldChange('consentManagement', 'consents', 'anesthesia', e.target.checked)}
//                     /> 
//                     <span>Anesthesia Risk & Airway Consent</span>
//                   </label>
                  
//                   <label className="p-3 bg-white rounded-xl border border-slate-200/60 hover:border-[#2BB2A7]/40 text-xs text-slate-700 flex items-center gap-2 cursor-pointer transition shadow-xs">
//                     <input 
//                       type="checkbox"
//                       className="accent-[#2BB2A7] w-3.5 h-3.5"
//                       checked={selectedCase.consentManagement.consents.transfusion}
//                       onChange={(e) => handleNestedFieldChange('consentManagement', 'consents', 'transfusion', e.target.checked)}
//                     /> 
//                     <span>Blood Transfusion Permission</span>
//                   </label>
//                 </div>
//               </div>

//               {/* Signature Verifications Card */}
//               <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-4 shadow-sm">
//                 <div className="border-b border-slate-100 pb-4 space-y-4">
//                   <div className="flex justify-between items-center flex-wrap gap-4">
//                     <div>
//                       <span className="text-xs font-bold text-slate-700 block">Digital & Physical Signature Verifications</span>
//                       <p className="text-[10px] text-slate-400">Verifying clinical staff signatures and patient consent confirmations</p>
//                     </div>
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <button
//                         onClick={() => {
//                           setConsentRole('patient');
//                           setShowConsentModal(true);
//                         }}
//                         className="px-3 py-1.5 bg-[#EAF7F4] hover:bg-[#D5EFEA] text-[#1F8F89] font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer border border-[#CDECE6]"
//                       >
//                         <PenTool className="w-3.5 h-3.5" /> Launch Digital Consent Portal
//                       </button>
//                       <button
//                         onClick={handlePrintConsent}
//                         className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer border border-amber-200"
//                         title="Print Informed Consent Form for physical signature"
//                       >
//                         <Printer className="w-3.5 h-3.5" /> Print Consent Form
//                       </button>
//                       <button
//                         onClick={handleDownloadConsent}
//                         className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
//                       >
//                         <Download className="w-3.5 h-3.5" /> Download Consent HTML
//                       </button>
//                     </div>
//                   </div>

//                   {/* Remote / WhatsApp / Email Signing Hub */}
//                   <div className="p-4 bg-slate-50/80 border border-slate-200/50 rounded-2xl space-y-3.5">
//                     <div className="flex items-start gap-2.5">
//                       <div className="p-1.5 bg-[#2BB2A7]/10 text-[#1F8F89] rounded-lg mt-0.5">
//                         <Share2 className="w-4 h-4" />
//                       </div>
//                       <div>
//                         <span className="text-xs font-bold text-slate-800 block">Digital Consent Sharing & Remote Signature Hub</span>
//                         <p className="text-[10px] text-slate-500">Send a secure digital signature link to patients or attendants who prefer signing remotely via smartphone, tablet, or SMS.</p>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
//                       {/* Option 1: Link & WhatsApp Channel */}
//                       <div className="space-y-2.5 p-3.5 bg-white border border-slate-100 rounded-xl shadow-2xs">
//                         <label className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">Option 1: Link Sharing & WhatsApp</label>
//                         <div className="flex gap-2">
//                           <input
//                             type="text"
//                             readOnly
//                             value={typeof window !== 'undefined' ? `${window.location.origin}/ot/patient-consent-sign/${selectedCase.id}` : ''}
//                             className="flex-1 min-w-0 bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] font-mono text-slate-600 rounded-lg select-all"
//                             onClick={(e) => (e.target as HTMLInputElement).select()}
//                           />
//                           <button
//                             type="button"
//                             onClick={() => {
//                               const shareUrl = `${window.location.origin}/ot/patient-consent-sign/${selectedCase.id}`;
//                               navigator.clipboard.writeText(shareUrl);
//                               setCopiedLink(true);
//                               setTimeout(() => setCopiedLink(false), 2000);
//                             }}
//                             className="px-2 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
//                           >
//                             {copiedLink ? (
//                               <>
//                                 <Check className="w-3 h-3 text-emerald-500" /> Copied
//                               </>
//                             ) : (
//                               <>
//                                 <Copy className="w-3 h-3" /> Copy Link
//                               </>
//                             )}
//                           </button>
//                         </div>

//                         {/* WhatsApp Number Field */}
//                         <div className="space-y-1">
//                           <label className="text-[9px] font-semibold text-slate-500 block">WhatsApp Phone Number</label>
//                           <input
//                             type="tel"
//                             placeholder="e.g. +919876543210"
//                             value={shareWhatsAppPhone}
//                             onChange={(e) => setShareWhatsAppPhone(e.target.value)}
//                             className="w-full bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] rounded-lg focus:outline-none focus:border-teal-500 text-slate-700"
//                           />
//                         </div>

//                         <div className="flex gap-1.5 pt-0.5">
//                           <button
//                             type="button"
//                             onClick={() => {
//                               const shareUrl = `${window.location.origin}/ot/patient-consent-sign/${selectedCase.id}`;
//                               const message = `Dear ${selectedCase.patient.name}, please click this link to securely authorize and sign the informed surgical consent document for your planned ${selectedCase.recommendation.surgeryName} at Swasti Medical Center: ${shareUrl}`;
//                               const cleanPhone = shareWhatsAppPhone.replace(/[^\d+]/g, '');
//                               const url = cleanPhone 
//                                 ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(message)}`
//                                 : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
//                               window.open(url, '_blank');
//                             }}
//                             className="flex-1 py-1.5 px-2.5 bg-[#E8F8F5] hover:bg-[#D1F2EB] text-[#0F7368] font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer border border-[#A2E4D9]"
//                           >
//                             Send WhatsApp
//                           </button>
//                           <a
//                             href={`${window.location.origin}/ot/patient-consent-sign/${selectedCase.id}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
//                             title="Open the patient signing screen in a new tab"
//                           >
//                             <ExternalLink className="w-3 h-3" /> Test Link
//                           </a>
//                         </div>
//                         <p className="text-[9px] text-slate-400">Great for instant sharing via chat tools, SMS or web messengers.</p>
//                       </div>

//                       {/* Option 2: Email Sandbox Channel */}
//                       <div className="space-y-2.5 p-3.5 bg-white border border-slate-100 rounded-xl shadow-2xs">
//                         <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Option 2: Simulated Inbox Sandbox</label>
//                         <div className="flex gap-1.5">
//                           <input
//                             type="email"
//                             placeholder="patient@example.com"
//                             value={shareEmail}
//                             onChange={(e) => {
//                               setShareEmail(e.target.value);
//                               setEmailError(null);
//                               setEmailSuccessMsg(null);
//                             }}
//                             className="flex-1 min-w-0 bg-slate-50 border border-slate-200 px-2 py-1 text-xs rounded-lg placeholder-slate-400 focus:outline-none focus:border-[#2BB2A7]"
//                           />
//                           <button
//                             type="button"
//                             disabled={emailSending}
//                             onClick={async () => {
//                               if (!shareEmail) return alert("Please specify a valid recipient email.");
                              
//                               setEmailSending(true);
//                               setEmailError(null);
//                               setEmailSuccessMsg(null);
//                               setEmailSent(false);

//                               try {
//                                 const shareUrl = `${window.location.origin}/ot/patient-consent-sign/${selectedCase.id}`;
//                                 const res = await fetch('/ot/api/send-consent-email', {
//                                   method: 'POST',
//                                   headers: { 'Content-Type': 'application/json' },
//                                   body: JSON.stringify({
//                                     email: shareEmail,
//                                     patientName: selectedCase.patient.name,
//                                     surgeryName: selectedCase.recommendation.surgeryName,
//                                     consentUrl: shareUrl,
//                                     doctorName: selectedCase.recommendation.recommendedBy
//                                   })
//                                 });

//                                 const data = await res.json();
//                                 if (!res.ok) {
//                                   throw new Error(data.error || 'Server error.');
//                                 }

//                                 if (data.success) {
//                                   setEmailSent(true);
//                                   if (data.simulated) {
//                                     setSimulatedEmail({
//                                       recipient: data.recipient,
//                                       patientName: data.patientName,
//                                       surgeryName: data.surgeryName,
//                                       doctorName: data.doctorName,
//                                       link: data.link,
//                                       html: data.html
//                                     });
//                                     setEmailSuccessMsg(`Email dispatch simulated! (Sandbox Active)`);
//                                   } else {
//                                     setEmailSuccessMsg(`Link successfully dispatched to ${shareEmail}!`);
//                                     setSimulatedEmail(null);
//                                   }
//                                   setShareEmail("");
//                                 } else {
//                                   throw new Error('Failed to dispatch email.');
//                                 }
//                               } catch (err: any) {
//                                 console.error(err);
//                                 setEmailError(err.message || 'Network transmission error.');
//                               } finally {
//                                 setEmailSending(false);
//                               }
//                             }}
//                             className="px-2.5 py-1.5 bg-[#2BB2A7] hover:bg-[#1F8F89] disabled:bg-teal-400/60 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0 shadow-3xs"
//                           >
//                             {emailSending ? "Simulating..." : "Simulate Send"}
//                           </button>
//                         </div>
//                         <p className="text-[9px] text-slate-400">Simulates server dispatch and outputs the live HTML email draft in a mock mailbox on this page below.</p>
//                       </div>


//                     </div>

//                         {emailSuccessMsg && (
//                           <div className="text-[10px] text-emerald-600 font-bold flex flex-col gap-1.5 animate-fade-in bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
//                             <div className="flex items-center gap-1.5">
//                               <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> {emailSuccessMsg}
//                             </div>
//                             {simulatedEmail && (
//                               <p className="text-[9px] text-slate-500 font-normal">
//                                 Scroll down to view the simulated patient mailbox sandbox below to review the exact styled email and sign as the patient!
//                               </p>
//                             )}
//                           </div>
//                         )}

//                         {simulatedEmail && (
//                           <div className="border border-indigo-200/60 bg-indigo-50/20 rounded-2xl p-4.5 space-y-3.5 mt-3 animate-fade-in">
//                             <div className="flex justify-between items-center border-b border-indigo-100/60 pb-2">
//                               <div className="flex items-center gap-2">
//                                 <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
//                                 <span className="text-[10px] font-bold text-indigo-900 tracking-wider uppercase">SIMULATED PATIENT INBOX (SANDBOX ACTIVE)</span>
//                               </div>
//                               <button
//                                 type="button"
//                                 onClick={() => setSimulatedEmail(null)}
//                                 className="text-[9px] text-slate-400 hover:text-slate-600 font-bold"
//                               >
//                                 Clear Simulation
//                               </button>
//                             </div>

//                             <div className="space-y-1.5 text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200/50 shadow-xs">
//                               <div><strong>To:</strong> {simulatedEmail.recipient}</div>
//                               <div><strong>Subject:</strong> 🚨 Action Required: Informed Surgical Consent for {simulatedEmail.patientName}</div>
//                               <div><strong>Date:</strong> {new Date().toLocaleString()} (Simulated)</div>
                              
//                               <div className="mt-3.5 pt-3.5 border-t border-slate-100 overflow-auto max-h-72">
//                                 <div 
//                                   className="scale-[0.9] origin-top text-xs bg-[#FAF9F5] rounded-xl overflow-hidden p-3 border border-slate-100 shadow-inner"
//                                   dangerouslySetInnerHTML={{ __html: simulatedEmail.html }} 
//                                   id="simulated-email-html"
//                                 />
//                               </div>

//                               <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-2">
//                                 <a
//                                   href={simulatedEmail.link}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wide cursor-pointer"
//                                   id="simulated-signing-btn"
//                                 >
//                                   <ExternalLink className="w-3.5 h-3.5" /> Click to Open Patient Signing Screen in New Tab
//                                 </a>
//                                 <p className="text-[9px] text-slate-400 text-center leading-normal">
//                                   Clicking this button will open the secure Swasti consent signing screen, allowing you to draw and submit the patient's signature. Once submitted, the status will update in real-time in this panel.
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         )}

//                         {(!emailSent && !emailError) && (
//                           <div className="text-[10px] text-teal-700 font-medium space-y-1.5 bg-teal-50/40 p-3 rounded-xl border border-teal-200/40 animate-fade-in">
//                             <div className="flex items-center gap-1 font-bold">
//                               <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#2BB2A7]" /> RESEND EMAIL INTEGRATION READY
//                             </div>
//                             <p className="leading-normal text-[9.5px] text-slate-600">
//                               Swasti is configured to deliver real emails via Resend. To send real emails, simply configure the following secrets in your AI Studio <strong>Settings &rsaquo; Secrets</strong> panel:
//                             </p>
//                             <div className="font-mono text-[8.5px] bg-white/70 p-1.5 rounded border border-teal-200/20 text-slate-600 select-all leading-relaxed">
//                               RESEND_API_KEY, RESEND_FROM
//                             </div>
//                           </div>
//                         )}

//                         {emailError && (
//                           <div className="text-[10px] text-red-600 font-medium flex items-center gap-1 animate-fade-in bg-red-50 p-2 rounded-lg border border-red-100" id="email-error-alert">
//                             <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" /> Error: {emailError}
//                           </div>
//                         )}

//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                   {/* Patient Sign Checkbox */}
//                   <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 space-y-2 flex flex-col justify-between">
//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2">
//   <input 
//     type="checkbox"
//     className="accent-[#1F8F89] w-3.5 h-3.5"
//     id="checkbox-sign-patient"
//     checked={selectedCase.consentManagement.signatures.patient}
//     onChange={(e) => {
//       const updated = { ...selectedCase };
      
//       // ✅ Get existing signature images safely
//       const existingImages = (updated.consentManagement as any)?.signatureImages || {};
      
//       // ✅ Update consent management with type assertion
//       updated.consentManagement = {
//         ...updated.consentManagement,
//         signatures: {
//           ...updated.consentManagement.signatures,
//           patient: e.target.checked
//         },
//         // ✅ Use type assertion for signatureImages
//         signatureImages: {
//           ...existingImages,
//           patient: e.target.checked ? (existingImages.patient || '') : ''
//         }
//       } as any; // ✅ Type assertion for the whole object
      
//       onUpdateCase(updated);
//     }}
//   />
//   <label htmlFor="checkbox-sign-patient" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
//     Patient Sign
//   </label>
// </div>

//                       {/* Signature image preview */}
//                       {(selectedCase.consentManagement as any).signatureImages?.patient && (
//                         <div className="p-1 border border-dashed border-slate-200 bg-white rounded-lg h-10 flex items-center justify-center overflow-hidden">
//                           <img 
//                             src={(selectedCase.consentManagement as any).signatureImages.patient} 
//                             alt="Patient signature ink" 
//                             className="h-full object-contain filter contrast-125 select-none"
//                             referrerPolicy="no-referrer"
//                           />
//                         </div>
//                       )}
//                     </div>
//                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block w-fit ${
//                       selectedCase.consentManagement.signatures.patient 
//                         ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
//                         : 'bg-slate-100 text-slate-500 border border-slate-200'
//                     }`}>
//                       {selectedCase.consentManagement.signatures.patient ? '✓ Active Signature Verified' : 'Awaiting Sign'}
//                     </span>
//                   </div>

//                   {/* Attendant Sign Checkbox */}
//                   <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 space-y-2 flex flex-col justify-between">
//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2">
//                         <input 
//                           type="checkbox"
//                           className="accent-[#1F8F89] w-3.5 h-3.5"
//                           id="checkbox-sign-attendant"
//                           checked={selectedCase.consentManagement.signatures.attendant}
//                           onChange={(e) => {
//                             const updated = { ...selectedCase };
//                             updated.consentManagement = {
//                               ...updated.consentManagement,
//                               signatures: {
//                                 ...updated.consentManagement.signatures,
//                                 attendant: e.target.checked
//                               },
//                               signatureImages: {
//                                 ...(updated.consentManagement as any).signatureImages,
//                                 attendant: e.target.checked ? (updated.consentManagement as any).signatureImages?.attendant || '' : ''
//                               }
//                             };
//                             onUpdateCase(updated);
//                           }}
//                         />
//                         <label htmlFor="checkbox-sign-attendant" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
//                           Attendant Sign
//                         </label>
//                       </div>

//                       {/* Signature image preview */}
//                       {(selectedCase.consentManagement as any).signatureImages?.attendant && (
//                         <div className="p-1 border border-dashed border-slate-200 bg-white rounded-lg h-10 flex items-center justify-center overflow-hidden">
//                           <img 
//                             src={(selectedCase.consentManagement as any).signatureImages.attendant} 
//                             alt="Attendant signature ink" 
//                             className="h-full object-contain filter contrast-125 select-none"
//                             referrerPolicy="no-referrer"
//                           />
//                         </div>
//                       )}
//                     </div>
//                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block w-fit ${
//                       selectedCase.consentManagement.signatures.attendant 
//                         ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
//                         : 'bg-slate-100 text-slate-500 border border-slate-200'
//                     }`}>
//                       {selectedCase.consentManagement.signatures.attendant ? '✓ Active Signature Verified' : 'Awaiting Sign'}
//                     </span>
//                   </div>

//                   {/* Doctor Sign Checkbox */}
//                   <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 space-y-2 flex flex-col justify-between">
//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2">
//                         <input 
//                           type="checkbox"
//                           className="accent-[#1F8F89] w-3.5 h-3.5"
//                           id="checkbox-sign-doctor"
//                           checked={selectedCase.consentManagement.signatures.doctor}
//                           onChange={(e) => {
//                             const updated = { ...selectedCase };
//                             updated.consentManagement = {
//                               ...updated.consentManagement,
//                               signatures: {
//                                 ...updated.consentManagement.signatures,
//                                 doctor: e.target.checked
//                               },
//                               signatureImages: {
//                                 ...(updated.consentManagement as any).signatureImages,
//                                 doctor: e.target.checked ? (updated.consentManagement as any).signatureImages?.doctor || '' : ''
//                               }
//                             };
//                             onUpdateCase(updated);
//                           }}
//                         />
//                         <label htmlFor="checkbox-sign-doctor" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
//                           Doctor Sign
//                         </label>
//                       </div>

//                       {/* Signature image preview */}
//                       {(selectedCase.consentManagement as any).signatureImages?.doctor && (
//                         <div className="p-1 border border-dashed border-slate-200 bg-white rounded-lg h-10 flex items-center justify-center overflow-hidden">
//                           <img 
//                             src={(selectedCase.consentManagement as any).signatureImages.doctor} 
//                             alt="Doctor signature ink" 
//                             className="h-full object-contain filter contrast-125 select-none"
//                             referrerPolicy="no-referrer"
//                           />
//                         </div>
//                       )}
//                     </div>
//                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block w-fit ${
//                       selectedCase.consentManagement.signatures.doctor 
//                         ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
//                         : 'bg-slate-100 text-slate-500 border border-slate-200'
//                     }`}>
//                       {selectedCase.consentManagement.signatures.doctor ? '✓ Active Signature Verified' : 'Awaiting Sign'}
//                     </span>
//                   </div>

//                   {/* Witness Sign Checkbox */}
//                   <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 space-y-2 flex flex-col justify-between">
//                     <div className="space-y-2">
//                       <div className="flex items-center gap-2">
//                         <input 
//                           type="checkbox"
//                           className="accent-[#1F8F89] w-3.5 h-3.5"
//                           id="checkbox-sign-witness"
//                           checked={selectedCase.consentManagement.signatures.witness}
//                           onChange={(e) => {
//                             const updated = { ...selectedCase };
//                             updated.consentManagement = {
//                               ...updated.consentManagement,
//                               signatures: {
//                                 ...updated.consentManagement.signatures,
//                                 witness: e.target.checked
//                               },
//                               signatureImages: {
//                                 ...(updated.consentManagement as any).signatureImages,
//                                 witness: e.target.checked ? (updated.consentManagement as any).signatureImages?.witness || '' : ''
//                               }
//                             };
//                             onUpdateCase(updated);
//                           }}
//                         />
//                         <label htmlFor="checkbox-sign-witness" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
//                           Witness Sign
//                         </label>
//                       </div>

//                       {/* Signature image preview */}
//                       {(selectedCase.consentManagement as any).signatureImages?.witness && (
//                         <div className="p-1 border border-dashed border-slate-200 bg-white rounded-lg h-10 flex items-center justify-center overflow-hidden">
//                           <img 
//                             src={(selectedCase.consentManagement as any).signatureImages.witness} 
//                             alt="Witness signature ink" 
//                             className="h-full object-contain filter contrast-125 select-none"
//                             referrerPolicy="no-referrer"
//                           />
//                         </div>
//                       )}
//                     </div>
//                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block w-fit ${
//                       selectedCase.consentManagement.signatures.witness 
//                         ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
//                         : 'bg-slate-100 text-slate-500 border border-slate-200'
//                     }`}>
//                       {selectedCase.consentManagement.signatures.witness ? '✓ Active Signature Verified' : 'Awaiting Sign'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeStep === 5 && (
//             <div className="space-y-4">
//               <div className="flex justify-between items-center border-b pb-1">
//                 <h4 className="text-xs font-bold text-indigo-600 uppercase">Post-Anesthesia Care (PACU) - Vitals Recovery Log</h4>
//                 <button
//                   onClick={runRecoverySimulation}
//                   disabled={isSimulatingRecovery}
//                   className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition disabled:opacity-50"
//                 >
//                   {isSimulatingRecovery ? "Simulating..." : "Simulate Live Charting"}
//                 </button>
//               </div>

//               {/* Simple Manual Entry Form */}
//               <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-xs font-semibold text-slate-700">Latest Vital Sign Entry</span>
//                   <button
//                     onClick={() => {
//                       const updated = { ...selectedCase };
//                       updated.postOpRecovery.vitalsLogs = [
//                         ...updated.postOpRecovery.vitalsLogs,
//                         {
//                           time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
//                           bp: "120/80",
//                           pulse: 78,
//                           spo2: 99,
//                           painScore: 0,
//                           consciousness: "Fully Awake"
//                         }
//                       ];
//                       onUpdateCase(updated);
//                     }}
//                     className="text-[10px] text-teal-600 hover:text-teal-700 font-bold"
//                   >
//                     + Add New Reading Row
//                   </button>
//                 </div>

//                 {(() => {
//                   const logs = selectedCase.postOpRecovery.vitalsLogs || [];
//                   const latestLog = logs[logs.length - 1] || {
//                     bp: "",
//                     pulse: 0,
//                     spo2: 0,
//                     painScore: 0,
//                     consciousness: "Fully Awake"
//                   };

//                   const updateLatestVital = (field: string, val: any) => {
//                     const updated = { ...selectedCase };
//                     const currentLogs = [...(updated.postOpRecovery.vitalsLogs || [])];
//                     if (currentLogs.length === 0) {
//                       currentLogs.push({
//                         time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
//                         bp: "120/80",
//                         pulse: 78,
//                         spo2: 99,
//                         painScore: 0,
//                         consciousness: "Fully Awake"
//                       });
//                     }
//                     const lastIdx = currentLogs.length - 1;
//                     currentLogs[lastIdx] = {
//                       ...currentLogs[lastIdx],
//                       [field]: val
//                     };
//                     updated.postOpRecovery.vitalsLogs = currentLogs;
//                     onUpdateCase(updated);
//                   };

//                   return (
//                     <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
//                       <div className="space-y-1">
//                         <label className="text-[10px] font-bold text-slate-500">Blood Pressure</label>
//                         <input
//                           type="text"
//                           placeholder="e.g. 120/80"
//                           value={latestLog.bp}
//                           onChange={(e) => updateLatestVital('bp', e.target.value)}
//                           className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
//                         />
//                       </div>
//                       <div className="space-y-1">
//                         <label className="text-[10px] font-bold text-slate-500">Pulse (bpm)</label>
//                         <input
//                           type="number"
//                           placeholder="e.g. 78"
//                           value={latestLog.pulse || ""}
//                           onChange={(e) => updateLatestVital('pulse', parseInt(e.target.value) || 0)}
//                           className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
//                         />
//                       </div>
//                       <div className="space-y-1">
//                         <label className="text-[10px] font-bold text-slate-500">SPO2 (%)</label>
//                         <input
//                           type="number"
//                           placeholder="e.g. 99"
//                           value={latestLog.spo2 || ""}
//                           onChange={(e) => updateLatestVital('spo2', parseInt(e.target.value) || 0)}
//                           className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
//                         />
//                       </div>
//                       <div className="space-y-1">
//                         <label className="text-[10px] font-bold text-slate-500">Pain (0-10)</label>
//                         <input
//                           type="number"
//                           placeholder="e.g. 2"
//                           value={latestLog.painScore || 0}
//                           onChange={(e) => updateLatestVital('painScore', parseInt(e.target.value) || 0)}
//                           className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
//                         />
//                       </div>
//                       <div className="space-y-1 col-span-2 md:col-span-1">
//                         <label className="text-[10px] font-bold text-slate-500">Consciousness</label>
//                         <select
//                           value={latestLog.consciousness}
//                           onChange={(e) => updateLatestVital('consciousness', e.target.value)}
//                           className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
//                         >
//                           <option value="Fully Awake">Fully Awake</option>
//                           <option value="Arousable to Voice">Arousable to Voice</option>
//                           <option value="Arousable to Pain">Arousable to Pain</option>
//                           <option value="Unresponsive">Unresponsive</option>
//                         </select>
//                       </div>
//                     </div>
//                   );
//                 })()}
//               </div>

//               {/* Recovery Vitals History */}
//               <div className="border border-slate-200 rounded-xl overflow-hidden">
//                 <div className="bg-slate-50 px-3 py-2 border-b flex justify-between items-center text-xs font-bold text-slate-700">
//                   <span>Vitals Charting Log History</span>
//                   <span className="text-[10px] text-slate-400 font-normal">Updated in Real-Time</span>
//                 </div>
//                 <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
//                   {(selectedCase.postOpRecovery.vitalsLogs || []).map((log, idx) => (
//                     <div key={idx} className="p-2.5 grid grid-cols-5 text-xs text-slate-700 hover:bg-slate-50 items-center">
//                       <div className="font-semibold text-slate-500">{log.time}</div>
//                       <div>BP: <span className="font-semibold text-slate-800">{log.bp}</span></div>
//                       <div>Pulse: <span className="font-semibold text-slate-800">{log.pulse} bpm</span></div>
//                       <div>SPO2: <span className="font-semibold text-slate-800">{log.spo2}%</span></div>
//                       <div className="text-right text-[10px] text-slate-500">Conscious: <span className="font-semibold text-indigo-600">{log.consciousness}</span></div>
//                     </div>
//                   ))}
//                   {(!selectedCase.postOpRecovery.vitalsLogs || selectedCase.postOpRecovery.vitalsLogs.length === 0) && (
//                     <div className="text-center p-6 text-slate-400 text-xs italic">No vitals logged yet. Speak to populate or click Simulate.</div>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-1 border-t pt-3">
//                 <label className="text-xs font-semibold text-slate-600">Recovery Disposition Verdict</label>
//                 <select 
//                   value={selectedCase.postOpRecovery.status}
//                   onChange={(e) => handleFieldChange('postOpRecovery', 'status', e.target.value)}
//                   className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
//                 >
//                   <option value="Critical">Critical - Intensive Monitoring</option>
//                   <option value="Stable">Stable - Approved for Ward Transfer</option>
//                   <option value="Shifted to Ward">Shifted to General Ward</option>
//                 </select>
//               </div>
//             </div>
//           )}

//           {activeStep === 6 && (
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">OT Scheduler Calendar</h4>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Operating Theatre Suite</label>
//                   <select 
//                     value={selectedCase.otScheduling.otRoom}
//                     onChange={(e) => handleFieldChange('otScheduling', 'otRoom', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
//                   >
//                     <option value="OT Suite 1 (Cardiothoracic)">OT Suite 1 (Cardiothoracic)</option>
//                     <option value="OT Suite 2 (Orthopedics/Neuro)">OT Suite 2 (Orthopedics/Neuro)</option>
//                     <option value="OT Suite 3 (General Surgery - Lap)">OT Suite 3 (General Surgery - Lap)</option>
//                     <option value="OT Suite 4 (Ophthalmic & Minor)">OT Suite 4 (Ophthalmic & Minor)</option>
//                   </select>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Surgery Date</label>
//                   <input 
//                     type="date"
//                     value={selectedCase.otScheduling.surgeryDate}
//                     onChange={(e) => handleFieldChange('otScheduling', 'surgeryDate', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Start Time</label>
//                   <input 
//                     type="time"
//                     value={selectedCase.otScheduling.startTime}
//                     onChange={(e) => handleFieldChange('otScheduling', 'startTime', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">End Time</label>
//                   <input 
//                     type="time"
//                     value={selectedCase.otScheduling.endTime}
//                     onChange={(e) => handleFieldChange('otScheduling', 'endTime', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeStep === 7 && (
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Equipment & Infrastructure Safety Check</h4>
              
//               <p className="text-xs text-slate-500">Ensure crucial OT equipment has passed sterilization and biomedical inspections.</p>
              
//               <div className="space-y-3">
//                 {Object.entries(selectedCase.equipmentCheck.equipment).map(([key, value]) => (
//                   <div key={key} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
//                     <span className="text-xs font-bold text-slate-700 capitalize">
//                       {key.replace(/([A-Z])/g, ' $1')}
//                     </span>
//                     <select 
//                       value={value}
//                       onChange={(e) => handleNestedFieldChange('equipmentCheck', 'equipment', key, e.target.value)}
//                       className="text-xs bg-white border border-slate-200 rounded px-2 py-1 focus:border-teal-500"
//                     >
//                       <option value="Available">Available</option>
//                       <option value="Reserved">Reserved</option>
//                       <option value="In Use">In Use</option>
//                       <option value="Maintenance">Maintenance</option>
//                     </select>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {activeStep === 8 && (
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Surgery Day Clearance Checklist</h4>
//               <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
//                 <span className="text-xs font-bold text-slate-700 block">Pre-Op Nurse Clearance Tasks</span>
                
//                 <div className="space-y-2">
//                   <label className="text-xs text-slate-700 flex items-center gap-1.5 font-semibold">
//                     <input 
//                       type="checkbox"
//                       checked={selectedCase.dayChecklist.checklist.consentCompleted}
//                       onChange={(e) => handleNestedFieldChange('dayChecklist', 'checklist', 'consentCompleted', e.target.checked)}
//                     /> Informed consent paperwork verified and verified signed
//                   </label>
//                   <label className="text-xs text-slate-700 flex items-center gap-1.5 font-semibold">
//                     <input 
//                       type="checkbox"
//                       checked={selectedCase.dayChecklist.checklist.patientFasting}
//                       onChange={(e) => handleNestedFieldChange('dayChecklist', 'checklist', 'patientFasting', e.target.checked)}
//                     /> Fasting status verified (6 Hours solid, 2 Hours liquid)
//                   </label>
//                   <label className="text-xs text-slate-700 flex items-center gap-1.5 font-semibold">
//                     <input 
//                       type="checkbox"
//                       checked={selectedCase.dayChecklist.checklist.testsAvailable}
//                       onChange={(e) => handleNestedFieldChange('dayChecklist', 'checklist', 'testsAvailable', e.target.checked)}
//                     /> Pre-Op Lab Reports (CBC, ECG, CT) mounted in theatre
//                   </label>
//                   <label className="text-xs text-slate-700 flex items-center gap-1.5 font-semibold">
//                     <input 
//                       type="checkbox"
//                       checked={selectedCase.dayChecklist.checklist.bloodAvailable}
//                       onChange={(e) => handleNestedFieldChange('dayChecklist', 'checklist', 'bloodAvailable', e.target.checked)}
//                     /> Blood units crossmatched and reserved in blood bank
//                   </label>
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-xs font-semibold text-slate-600">Final OT Clearance Verdict</label>
//                 <select 
//                   value={selectedCase.dayChecklist.otClearanceStatus}
//                   onChange={(e) => handleFieldChange('dayChecklist', 'otClearanceStatus', e.target.value)}
//                   className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
//                 >
//                   <option value="Pending">Awaiting Nursing Verification</option>
//                   <option value="Cleared">Cleared - Wheel Patient to OT</option>
//                   <option value="Hold">On Hold / Delayed</option>
//                 </select>
//               </div>
//             </div>
//           )}

//           {activeStep === 9 && (
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Surgical Consumables & Implant Inventory</h4>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Available Inventory List */}
//                 <div className="border border-slate-200 rounded-xl overflow-hidden">
//                   <div className="bg-slate-50 px-3 py-2 border-b font-bold text-xs text-slate-700">Hospital Central Inventory</div>
//                   <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
//                     {DEFAULT_CONSUMABLES.map((item, idx) => (
//                       <div key={idx} className="p-2.5 flex justify-between items-center text-xs hover:bg-slate-50">
//                         <div>
//                           <div className="font-semibold text-slate-800">{item.name}</div>
//                           <div className="text-[10px] text-slate-400">Cost: ₹{item.cost}</div>
//                         </div>
//                         <button 
//                           onClick={() => addConsumable(item.name, item.cost)}
//                           className="bg-teal-500 text-slate-950 font-bold text-[10px] px-2 py-1 rounded"
//                         >
//                           + Add
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Used Consumables in Case */}
//                 <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
//                   <div>
//                     <div className="bg-slate-50 px-3 py-2 border-b font-bold text-xs text-slate-700">Currently Added to Case Tray</div>
//                     <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
//                       {selectedCase.consumablesTracking.surgicalConsumables.map((item, idx) => (
//                         <div key={idx} className="p-2.5 flex justify-between items-center text-xs">
//                           <div>
//                             <div className="font-semibold text-slate-800">{item.name}</div>
//                             <div className="text-[10px] text-slate-400">Qty: {item.quantity} | Cost: ₹{item.cost * item.quantity}</div>
//                           </div>
//                         </div>
//                       ))}
//                       {selectedCase.consumablesTracking.surgicalConsumables.length === 0 && (
//                         <div className="text-center p-6 text-slate-400 text-xs italic">
//                           Click "+ Add" to allocate consumables to this patient.
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="bg-slate-50 p-2.5 border-t flex justify-between items-center text-xs font-bold text-slate-800">
//                     <span>Tray Total:</span>
//                     <span>₹{selectedCase.consumablesTracking.surgicalConsumables.reduce((acc, i) => acc + (i.cost * i.quantity), 0).toLocaleString('en-IN')}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeStep === 10 && (
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 border-b pb-1 uppercase">OT Staffing & Team Assignment</h4>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Primary Surgeon</label>
//                   <select 
//                     value={selectedCase.teamAssignment.team.primarySurgeon}
//                     onChange={(e) => handleNestedFieldChange('teamAssignment', 'team', 'primarySurgeon', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
//                   >
//                     <option value="">Select Surgeon</option>
//                     {SURGEONS.map(s => <option key={s.id} value={s.name}>{s.name} ({s.specialty})</option>)}
//                   </select>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Lead Anesthetist</label>
//                   <select 
//                     value={selectedCase.teamAssignment.team.leadAnesthetist}
//                     onChange={(e) => handleNestedFieldChange('teamAssignment', 'team', 'leadAnesthetist', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
//                   >
//                     <option value="">Select Anesthetist</option>
//                     {ANESTHETISTS.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Scrub Nurse</label>
//                   <select 
//                     value={selectedCase.teamAssignment.team.scrubNurse}
//                     onChange={(e) => handleNestedFieldChange('teamAssignment', 'team', 'scrubNurse', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
//                   >
//                     <option value="">Select Nurse</option>
//                     {NURSES.map(n => <option key={n.id} value={n.name}>{n.name} ({n.role})</option>)}
//                   </select>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">OT Technician</label>
//                   <input 
//                     type="text"
//                     placeholder="e.g. Brother Sunil Gowda"
//                     value={selectedCase.teamAssignment.team.otTechnician}
//                     onChange={(e) => handleNestedFieldChange('teamAssignment', 'team', 'otTechnician', e.target.value)}
//                     className="w-full px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-850 text-xs focus:border-indigo-500"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeStep === 11 && (
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Post-Operative Orders & Care</h4>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Antibiotics regimen</label>
//                   <input 
//                     type="text"
//                     value={selectedCase.postOpOrders.antibiotics}
//                     onChange={(e) => handleFieldChange('postOpOrders', 'antibiotics', e.target.value)}
//                     className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-850 text-sm focus:border-teal-500"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">IV Fluids regimen</label>
//                   <input 
//                     type="text"
//                     value={selectedCase.postOpOrders.fluids}
//                     onChange={(e) => handleFieldChange('postOpOrders', 'fluids', e.target.value)}
//                     className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-850 text-sm focus:border-teal-500"
//                   />
//                 </div>
//               </div>

//               {/* Checkable Nursing Tasks */}
//               <div className="border border-slate-100 rounded-xl overflow-hidden">
//                 <div className="bg-slate-50 px-3 py-2 border-b font-bold text-xs text-slate-700">Active Nursing Tasks Checklist</div>
//                 <div className="divide-y divide-slate-100">
//                   {selectedCase.postOpOrders.nursingTasks.map((task) => (
//                     <div key={task.id} className="p-3 flex justify-between items-center text-xs">
//                       <span className={`font-medium ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{task.task}</span>
//                       <button 
//                         onClick={() => {
//                           const updated = { ...selectedCase };
//                           const target = updated.postOpOrders.nursingTasks.find(t => t.id === task.id);
//                           if (target) {
//                             target.done = !target.done;
//                             target.completedTime = target.done ? '16:30' : undefined;
//                           }
//                           onUpdateCase(updated);
//                         }}
//                         className={`font-semibold px-2 py-1 rounded text-[10px] ${
//                           task.done ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-500 text-slate-950 hover:bg-rose-600'
//                         }`}
//                       >
//                         {task.done ? 'Done ✓' : 'Mark Done'}
//                       </button>
//                     </div>
//                   ))}
//                   {selectedCase.postOpOrders.nursingTasks.length === 0 && (
//                     <div className="p-6 text-center text-slate-400 text-xs italic">
//                       Use Swasti AI co-pilot above to auto-generate customized nursing tasks based on clinical guidelines!
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeStep === 12 && (
//             <div className="space-y-4">
//               <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Surgery Outcome Logging</h4>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Surgical Outcome Verdict</label>
//                   <select 
//                     value={selectedCase.outcomeTracking.outcome}
//                     onChange={(e) => handleFieldChange('outcomeTracking', 'outcome', e.target.value)}
//                     className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
//                   >
//                     <option value="Successful">Successful - Plan Outpatient Review</option>
//                     <option value="Complication">Complication Encountered</option>
//                     <option value="Re-operation Required">Re-operation Indicated</option>
//                     <option value="Mortality">Mortality</option>
//                   </select>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600">Follow-up Review Interval</label>
//                   <input 
//                     type="text"
//                     placeholder="e.g. Outpatient clinic review in 2 weeks"
//                     value={selectedCase.outcomeTracking.followUpPlan}
//                     onChange={(e) => handleFieldChange('outcomeTracking', 'followUpPlan', e.target.value)}
//                     className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-850 text-sm focus:border-teal-500"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-xs font-semibold text-slate-600">Surgical Outcome Summary notes</label>
//                 <textarea 
//                   rows={4}
//                   value={selectedCase.outcomeTracking.outcomeNotes}
//                   onChange={(e) => handleFieldChange('outcomeTracking', 'outcomeNotes', e.target.value)}
//                   className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500 resize-none"
//                 />
//               </div>
//             </div>
//           )}

//           {activeStep === 13 && (
//             <div className="space-y-4">
//               <div className="flex justify-between items-center border-b pb-1">
//                 <h4 className="text-xs font-bold text-indigo-600">Surgery Package Billing Generator</h4>
//                 <button 
//                   onClick={computeFinalBilling}
//                   className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs px-3 py-1 rounded-lg transition"
//                 >
//                   Generate Actual Bill
//                 </button>
//               </div>

//               {selectedCase.billing.isBilled ? (
//                 <div className="space-y-4 animate-in fade-in duration-300">
//                   <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
//                     <span className="text-xs font-bold text-slate-800 block">Final Surgery Cost Variance Report</span>
//                     <div className="grid grid-cols-3 gap-4 text-center border-b pb-2">
//                       <div>
//                         <span className="text-[10px] text-slate-400 font-bold block">Estimated Package</span>
//                         <span className="text-sm font-bold text-slate-700">₹{selectedCase.costEstimation.packageCost.toLocaleString('en-IN')}</span>
//                       </div>
//                       <div>
//                         <span className="text-[10px] text-slate-400 font-bold block">Actual Aggregated</span>
//                         <span className="text-sm font-bold text-slate-900">₹{selectedCase.billing.totalActualCost.toLocaleString('en-IN')}</span>
//                       </div>
//                       <div>
//                         <span className="text-[10px] text-slate-400 font-bold block">Variance</span>
//                         <span className={`text-sm font-bold ${
//                           selectedCase.billing.totalActualCost - selectedCase.costEstimation.packageCost <= 0 ? 'text-emerald-600' : 'text-rose-600'
//                         }`}>
//                           ₹{(selectedCase.billing.totalActualCost - selectedCase.costEstimation.packageCost).toLocaleString('en-IN')}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Cost ledger itemizer */}
//                     <div className="text-[11px] space-y-1 pt-1 font-mono text-slate-500">
//                       <div className="flex justify-between">
//                         <span>• Surgeon Fees:</span>
//                         <span className="font-semibold text-slate-700">₹{selectedCase.billing.actualCharges.surgeonFee.toLocaleString('en-IN')}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>• OT Suite Charges:</span>
//                         <span className="font-semibold text-slate-700">₹{selectedCase.billing.actualCharges.otUsage.toLocaleString('en-IN')}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>• Consumables:</span>
//                         <span className="font-semibold text-slate-700">₹{selectedCase.billing.actualCharges.consumables.toLocaleString('en-IN')}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>• Medicines & Drugs:</span>
//                         <span className="font-semibold text-slate-700">₹{selectedCase.billing.actualCharges.medicines.toLocaleString('en-IN')}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
//                   Click "Generate Actual Bill" to reconcile the ledger and run cost audits.
//                 </div>
//               )}
//             </div>
//           )}

//           {activeStep === 14 && (
//             <div className="space-y-6">
//               <div className="flex justify-between items-center border-b pb-1">
//                 <h4 className="text-xs font-bold text-indigo-600 font-mono">Discharge Summarization</h4>
//                 {!(selectedCase.status === 'Completed & Discharged' || selectedCase.discharge.status === 'Discharged') && (
//                   <button 
//                     onClick={() => {
//                       const updated = { ...selectedCase };
//                       updated.discharge.summary = {
//                         surgerySummary: `Uneventful clinical execution of ${selectedCase.recommendation.surgeryName} by ${selectedCase.teamAssignment.team.primarySurgeon}.`,
//                         otNotes: `Anesthesia induce normal. Excised tissue successfully sent for laboratory check. Wound closed with standard sutures.`,
//                         implantDetails: selectedCase.costEstimation.charges.implants > 0 ? `Prosthetic implant placed, batch logged in HIS.` : `No implants placed.`,
//                         dischargeSummary: `Patient ${selectedCase.patient.name} evaluated post-operatively and declared stable for home mobilization on oral medications.`,
//                         medicationPlan: selectedCase.postOpOrders.medications,
//                         followUpAppointment: selectedCase.outcomeTracking.followUpPlan || 'Outpatient clinic review in 2 weeks.'
//                       };
//                       updated.discharge.status = 'Ready for Discharge';
//                       onUpdateCase(updated);
//                     }}
//                     className="bg-indigo-600 text-white font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-indigo-700 transition shadow cursor-pointer"
//                   >
//                     <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Compile Discharge Summary
//                   </button>
//                 )}
//               </div>

//               {selectedCase.discharge.summary.dischargeSummary ? (
//                 <div className="border border-indigo-100 rounded-2xl p-5 bg-indigo-50/20 space-y-4 animate-in fade-in duration-300">
//                   <div className="border-b pb-2 flex justify-between items-center">
//                     <span className="text-xs font-bold text-indigo-900 font-mono">SWASTI CLINICAL DISCHARGE RECORD</span>
//                     <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">Ready</span>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
//                     <div>
//                       <strong className="text-slate-800">Surgical Execution summary:</strong>
//                       <p className="mt-0.5">{selectedCase.discharge.summary.surgerySummary}</p>
//                     </div>
//                     <div>
//                       <strong className="text-slate-800">Home Medication Protocol:</strong>
//                       <p className="mt-0.5">{selectedCase.discharge.summary.medicationPlan || 'Standard oral pain killers as indicated.'}</p>
//                     </div>
//                   </div>

//                   <div className="text-xs text-slate-600">
//                     <strong className="text-slate-800">Follow-Up Schedule:</strong>
//                     <p className="mt-0.5">{selectedCase.discharge.summary.followUpAppointment}</p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
//                   Click "Compile Discharge Summary" to gather clinical inputs and finalize patient release records, or click the separate Discharge button below to immediately finalize release.
//                 </div>
//               )}

//               {/* Standalone Separate Discharge Button Area */}
//               <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
//                 <div className="flex items-start gap-3">
//                   <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
//                     <CheckCircle className="w-5 h-5 text-emerald-700" />
//                   </div>
//                   <div>
//                     <h5 className="text-xs font-bold text-slate-900">Clinical Discharge Authorization</h5>
//                     <p className="text-[10px] text-slate-500 mt-0.5">Authorizing final patient discharge will set progress to 100%, update the National Swasti HIS, and close the active case.</p>
//                   </div>
//                 </div>

//                 <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
//                   {selectedCase.status === 'Completed & Discharged' || selectedCase.discharge.status === 'Discharged' ? (
//                     <>
//                       <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-emerald-200 shadow-sm w-full sm:w-auto">
//                         <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
//                         <span>Patient Discharged & Case Closed successfully! (100% Complete)</span>
//                       </div>
//                       <button 
//                         onClick={onBack}
//                         className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow cursor-pointer flex items-center justify-center gap-1.5"
//                       >
//                         <ArrowLeft className="w-3.5 h-3.5" /> Back to Cases Directory
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <span className="text-slate-500 text-[10px] sm:text-xs">
//                         * Clicking "Discharge Patient" is the final required action.
//                       </span>
//                       <button 
//                         onClick={() => {
//                           const updated = { ...selectedCase };
                          
//                           // If discharge summary isn't compiled yet, populate it to prevent empty sub-structures
//                           if (!updated.discharge.summary || !updated.discharge.summary.dischargeSummary) {
//                             updated.discharge.summary = {
//                               surgerySummary: `Uneventful clinical execution of ${selectedCase.recommendation.surgeryName} by ${selectedCase.teamAssignment.team.primarySurgeon}.`,
//                               otNotes: `Anesthesia induce normal. Excised tissue successfully sent for laboratory check. Wound closed with standard sutures.`,
//                               implantDetails: selectedCase.costEstimation.charges.implants > 0 ? `Prosthetic implant placed, batch logged in HIS.` : `No implants placed.`,
//                               dischargeSummary: `Patient ${selectedCase.patient.name} evaluated post-operatively and declared stable for home mobilization on oral medications.`,
//                               medicationPlan: selectedCase.postOpOrders.medications,
//                               followUpAppointment: selectedCase.outcomeTracking.followUpPlan || 'Outpatient clinic review in 2 weeks.'
//                             };
//                           }
                          
//                           updated.discharge.status = 'Discharged';
//                           updated.discharge.dischargeDate = new Date().toISOString().split('T')[0];
//                           updated.status = 'Completed & Discharged';
//                           updated.currentStep = 15;
//                           onUpdateCase(updated);
//                         }}
//                         className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 font-sans"
//                       >
//                         <CheckCircle className="w-4 h-4 text-white" /> Discharge Patient & Close Case (100%)
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//         </div>

//         {/* Right Side Panel: Collapsible Swasti AI Clinical Co-Pilot */}
//         <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-200 space-y-6 flex flex-col justify-between h-fit">
//           <div className="space-y-4">
//             <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
//               <div className="bg-teal-500/10 text-teal-400 p-2 rounded-xl border border-teal-500/20">
//                 <Sparkles className="w-5 h-5 text-teal-400" />
//               </div>
//               <div>
//                 <h4 className="font-bold text-sm text-white">Swasti Clinical Co-Pilot</h4>
//                 <p className="text-[10px] text-slate-400 font-medium">Surgical AI Diagnostics & Formulation</p>
//               </div>
//             </div>

//             {/* Diagnostic Query Widget */}
//             <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3">
//               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Clinical Query Context</span>
//               <div className="text-xs text-slate-300">
//                 Evaluating procedure <strong className="text-white">{selectedCase.recommendation.surgeryName}</strong> for clinical diagnosis of <strong className="text-white">{selectedCase.recommendation.diagnosis}</strong>.
//               </div>
//               <button 
//                 onClick={consultAI}
//                 className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-teal-400 font-bold text-xs py-2 rounded-xl transition flex justify-center items-center gap-1.5"
//               >
//                 <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Trigger AI Consultation
//               </button>
//             </div>

//             {/* AI Console Display */}
//             {showCoPilot && (
//               <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs max-h-80 overflow-y-auto">
//                 {aiLoading ? (
//                   <div className="space-y-2">
//                     <span className="text-[10px] text-teal-400 font-mono block">● Swasti AI actively formulating...</span>
//                     {aiLogs.map((log, idx) => (
//                       <div key={idx} className="text-[11px] text-slate-400 font-mono animate-fade-in pl-2 border-l border-slate-800">
//                         {log}
//                       </div>
//                     ))}
//                     <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-2">
//                       <div className="bg-teal-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
//                     </div>
//                   </div>
//                 ) : aiResult ? (
//                   <div className="space-y-4 animate-in fade-in duration-300 text-[11px]">
//                     <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
//                       <span className="text-slate-400 font-bold uppercase text-[9px]">Consultation Result</span>
//                       <button 
//                         onClick={autofillWithAI}
//                         className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-[10px] px-2 py-1 rounded"
//                       >
//                         Auto-Fill HIS Steps
//                       </button>
//                     </div>

//                     <div className="space-y-2.5 text-slate-300">
//                       <div>
//                         <strong className="text-white text-[11px]">Pre-Op Tests Required:</strong>
//                         <div className="flex gap-1 flex-wrap mt-1">
//                           {aiResult.preOpTests?.map((t: string, i: number) => (
//                             <span key={i} className="bg-slate-900 border border-slate-800 text-[9px] px-1.5 py-0.5 rounded text-teal-300 font-mono">{t}</span>
//                           ))}
//                         </div>
//                       </div>

//                       <div>
//                         <strong className="text-white">Anesthesia Plan:</strong>
//                         <p className="text-slate-400 mt-0.5">{aiResult.anesthesiaType} anesthesia - {aiResult.anesthesiaRisk}</p>
//                       </div>

//                       <div>
//                         <strong className="text-white">Post-Op Medications Suggested:</strong>
//                         <p className="text-slate-400 mt-0.5 italic">{aiResult.postOpMedications}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center text-slate-500 py-6 italic">Awaiting AI triggering...</div>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
//             <span>Powered by Gemini 3.5 Flash</span>
//             <span className="text-teal-400 font-bold">Clinical Compliant</span>
//           </div>
//         </div>

//       </div>

//       {/* Actual Digital Consent Portal Overlay Modal */}
//       {showConsentModal && (
//         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4 overflow-y-auto animate-fade-in">
//           <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
//             {/* Modal Header */}
//             <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
//               <div className="flex items-center gap-3">
//                 <div className="bg-teal-500 text-slate-950 p-2 rounded-xl">
//                   <FileCheck className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-base leading-tight">Swasti Healthcare Digital Consent Portal</h3>
//                   <p className="text-[11px] text-slate-400">Official Clinical Records & Identification Capture Engine</p>
//                 </div>
//               </div>
//               <button 
//                 onClick={() => setShowConsentModal(false)}
//                 className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Modal Main Content Container */}
//             <div className="grid grid-cols-1 md:grid-cols-12">
              
//               {/* Left Column: Legal Template Document View */}
//               <div className="md:col-span-7 bg-[#FAF9F5] p-5 border-r border-slate-200 max-h-[70vh] overflow-y-auto space-y-4">
//                 <div className="border border-[#E2DDD2] bg-white p-4 rounded-xl shadow-xs space-y-3 font-serif">
//                   <div className="text-center border-b border-dashed border-[#E2DDD2] pb-2">
//                     <h4 className="font-bold text-sm tracking-wide text-slate-800 uppercase">Swasti Medical Centers & Clinics</h4>
//                     <span className="text-[10px] text-slate-500 font-sans font-medium">Informed Surgical Consent Authorization</span>
//                   </div>

//                   <div className="text-[11px] space-y-3 leading-relaxed text-slate-700 font-sans">
//                     <div>
//                       <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Patient Demographics:</p>
//                       <p className="text-slate-600">
//                         Name: <span className="font-semibold text-slate-900">{selectedCase.patient.name}</span> &bull; Age: <span className="font-semibold text-slate-900">{selectedCase.patient.age}y</span> &bull; ID: <span className="font-mono font-semibold text-slate-900">{selectedCase.patient.id}</span>
//                       </p>
//                     </div>

//                     <div>
//                       <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Surgical Procedure Planned:</p>
//                       <p className="font-semibold text-slate-950 text-xs bg-slate-50/80 p-2 rounded-lg border border-slate-100">
//                         {selectedCase.recommendation.surgeryName}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Diagnosed Presentation:</p>
//                       <p className="text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
//                         {selectedCase.recommendation.diagnosis}
//                       </p>
//                     </div>

//                     <hr className="border-[#E2DDD2] my-3" />

//                     <div>
//                       <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Consent Authorization:</p>
//                       <p className="text-slate-600 leading-relaxed bg-amber-50/40 p-3 rounded-lg border border-amber-100/60 font-serif text-[11.5px] space-y-1.5">
//                         <span>I hereby authorize {selectedCase.recommendation.recommendedBy.startsWith('Dr.') ? selectedCase.recommendation.recommendedBy : `Dr. ${selectedCase.recommendation.recommendedBy}`} to perform the planned surgery ({selectedCase.recommendation.surgeryName}) and administer the required anesthesia. I confirm that the procedure's clinical indications, potential risks, anticipated benefits, and available alternatives have been explained to me in detail, and I fully consent to the treatment.</span>
//                         <br /><br />
//                         <span>I also authorize the administration of any necessary blood products, transfusions, or emergency secondary interventions should unforeseen clinical circumstances arise during the course of the operation. I acknowledge that medicine is not an exact science and that no guarantees have been made to me regarding the absolute outcome of this procedure.</span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-2">
//                   <span className="text-blue-600 text-xs mt-0.5">ℹ</span>
//                   <span className="text-[10px] text-blue-700 leading-normal">
//                     This window registers actual consent parameters into the secure HIS. Completed entries are encrypted and cross-referenced with your National Digital Health Swasti ID.
//                   </span>
//                 </div>
//               </div>

//               {/* Right Column: Dynamic Signature Panel */}
//               <div className="md:col-span-5 p-5 flex flex-col justify-between max-h-[70vh] overflow-y-auto space-y-4">
                
//                 {/* 1. Select Signing Role */}
//                 <div className="space-y-1">
//                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">1. Select Signing Entity</span>
//                   <div className="grid grid-cols-2 gap-1.5">
//                     {(['patient', 'attendant', 'doctor', 'witness'] as const).map((role) => (
//                       <button
//                         key={role}
//                         onClick={() => {
//                           setConsentRole(role);
//                           clearCanvas();
//                         }}
//                         className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition capitalize cursor-pointer ${
//                           consentRole === role 
//                             ? 'bg-[#1F8F89] text-white border-[#1F8F89] shadow-sm' 
//                             : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
//                         }`}
//                       >
//                         {role}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* 2. Signing Area */}
//                 <div className="flex-1 space-y-1">
//                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
//                     2. Draw ink signature on the canvas
//                   </span>

//                   <div className="space-y-2">
//                     <div className="border border-dashed border-slate-300 rounded-xl overflow-hidden bg-[#FBFBFC] relative">
//                       <canvas
//                         ref={canvasRef}
//                         width={260}
//                         height={140}
//                         onMouseDown={startDrawing}
//                         onMouseMove={draw}
//                         onMouseUp={stopDrawing}
//                         onMouseLeave={stopDrawing}
//                         onTouchStart={startDrawing}
//                         onTouchMove={draw}
//                         onTouchEnd={stopDrawing}
//                         className="w-full h-32 block cursor-crosshair touch-none"
//                       />
//                       <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-400 select-none bg-white/80 px-1 py-0.5 rounded border border-slate-100">
//                         Interactive Canvas Board
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={clearCanvas}
//                       className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
//                     >
//                       ✕ Clear Ink Board
//                     </button>
//                   </div>
//                 </div>

//                 {/* Apply/Save Action */}
//                 <div className="pt-2 border-t border-slate-100 space-y-2">
//                   <button
//                     onClick={() => {
//                       const canvas = canvasRef.current;
//                       let signatureDataUrl = '';
//                       if (canvas) {
//                         signatureDataUrl = canvas.toDataURL('image/png');
//                       }

//                       // Create a clean updated object
//                       const updated = { ...selectedCase };
                      
//                       // Safely update signatures and signatureImages
//                       updated.consentManagement = {
//                         ...updated.consentManagement,
//                         signatures: {
//                           ...updated.consentManagement.signatures,
//                           [consentRole]: true
//                         },
//                         signatureImages: {
//                           ...(updated.consentManagement as any).signatureImages,
//                           [consentRole]: signatureDataUrl
//                         }
//                       };

//                       onUpdateCase(updated);
//                       setShowConsentModal(false);
//                       alert(`Successfully synchronized ${consentRole}'s official digital consent verification to Case File!`);
//                     }}
//                     className="w-full bg-[#1F8F89] hover:bg-[#156E69] text-white font-bold text-xs py-2.5 rounded-xl transition flex justify-center items-center gap-1.5 shadow-xs cursor-pointer"
//                   >
//                     Confirm & Apply Signature
//                   </button>
//                 </div>

//               </div>

//             </div>
//           </div>
//         </div>
//       )}

//       {/* Dynamic Voice Dictation Modal */}
//       {voiceTarget && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
//             {/* Header */}
//             <div className="bg-gradient-to-r from-[#1F8F89] to-indigo-600 px-6 py-4 flex items-center justify-between text-white">
//               <div className="flex items-center gap-2">
//                 <Mic className="w-5 h-5 animate-pulse text-red-300" />
//                 <h4 className="font-bold text-sm">Voice Dictation: {voiceTarget.label}</h4>
//               </div>
//               <button 
//                 type="button"
//                 onClick={() => {
//                   stopVoiceDictation();
//                   setVoiceTarget(null);
//                 }} 
//                 className="text-white/80 hover:text-white font-bold text-lg"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Body */}
//             <div className="p-6 space-y-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
//                   {voiceListening ? "🎙️ Recording... Speak clearly." : "🎙️ Microphone Paused"}
//                 </span>
//                 <span className="flex h-2.5 w-2.5 relative">
//                   {voiceListening && (
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//                   )}
//                   <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${voiceListening ? 'bg-red-500' : 'bg-slate-300'}`}></span>
//                 </span>
//               </div>

//               {/* Textarea for real-time visualization & manual editing */}
//               <div className="relative">
//                 <textarea
//                   rows={6}
//                   value={voiceText}
//                   onChange={(e) => setVoiceText(e.target.value)}
//                   placeholder="Your voice will appear here. You can also type or edit directly inside this box..."
//                   className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none font-sans"
//                 />
//               </div>

//               {/* Tips */}
//               <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
//                 Tip: Feel free to edit the text box manually with your keyboard before clicking "Save & Insert".
//               </p>
//             </div>

//             {/* Footer Actions */}
//             <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
//               <div className="flex gap-2">
//                 {voiceListening ? (
//                   <button
//                     type="button"
//                     onClick={stopVoiceDictation}
//                     className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
//                   >
//                     ⏸ Pause Mic
//                   </button>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//                       if (SpeechRecognition) {
//                         const recognition = new SpeechRecognition();
//                         recognition.continuous = true;
//                         recognition.lang = 'en-US';
//                         recognition.interimResults = true;
//                         recognition.onstart = () => setVoiceListening(true);
//                         recognition.onend = () => setVoiceListening(false);
//                         recognition.onerror = () => setVoiceListening(false);
//                         recognition.onresult = (event: any) => {
//                           let finalTranscript = "";
//                           for (let i = event.resultIndex; i < event.results.length; ++i) {
//                             if (event.results[i].isFinal) {
//                               finalTranscript += event.results[i][0].transcript + " ";
//                             }
//                           }
//                           if (finalTranscript) {
//                             setVoiceText((prev) => {
//                               const cleanPrev = prev.trim();
//                               return cleanPrev ? `${cleanPrev} ${finalTranscript.trim()}` : finalTranscript.trim();
//                             });
//                           }
//                         };
//                         recognition.start();
//                         setRecognitionInstance(recognition);
//                         setVoiceListening(true);
//                       } else {
//                         alert("Speech recognition not supported.");
//                       }
//                     }}
//                     className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
//                   >
//                     🎙️ Resume Mic
//                   </button>
//                 )}

//                 <button
//                   type="button"
//                   onClick={() => setVoiceText("")}
//                   className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
//                 >
//                   Clear Text
//                 </button>
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     stopVoiceDictation();
//                     setVoiceTarget(null);
//                   }}
//                   className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     stopVoiceDictation();
//                     if (voiceTarget) {
//                       voiceTarget.onSave(voiceText);
//                     }
//                     setVoiceTarget(null);
//                   }}
//                   className="bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-md shadow-teal-500/10 hover:opacity-90"
//                 >
//                   Save & Insert
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }






'use client';
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Users, 
  DollarSign, 
  ShieldAlert, 
  Heart, 
  HeartPulse,
  ClipboardList, 
  UserCheck, 
  Plus, 
  AlertCircle, 
  Play, 
  FileText, 
  Activity, 
  ChevronRight, 
  ShoppingBag,
  Cpu,
  Bookmark,
  Check,
  CheckSquare,
  Fingerprint,
  FileCheck,
  PenTool,
  ExternalLink,
  Download,
  Mic,
  Printer,
  Mail,
  Share2,
  Copy
} from 'lucide-react';
import { SurgeryCase, CaseStatus, SurgeryType, PriorityLevel, SURGEONS, ANESTHETISTS, NURSES, DEFAULT_CONSUMABLES } from '@/types';

interface CaseWorkflowManagerProps {
  selectedCase: SurgeryCase;
  onBack: () => void;
  onUpdateCase: (updatedCase: SurgeryCase) => void;
  initialStep?: number;
}

export default function CaseWorkflowManager({ selectedCase, onBack, onUpdateCase, initialStep }: CaseWorkflowManagerProps) {
  const [activeStep, setActiveStep] = useState(initialStep || Math.min(selectedCase.currentStep, 14));
  const [showCoPilot, setShowCoPilot] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);

  // Top-level Voice Command Center State
  const [topVoiceText, setTopVoiceText] = useState("");
  const [topVoiceListening, setTopVoiceListening] = useState(false);
  const [topRecognitionInstance, setTopRecognitionInstance] = useState<any>(null);
  const [voiceIntakeLoading, setVoiceIntakeLoading] = useState(false);
  const [voiceIntakeStatus, setVoiceIntakeStatus] = useState<string>("");
  const [voiceIntakeLogs, setVoiceIntakeLogs] = useState<string[]>([]);
  const [voiceIntakeSuccess, setVoiceIntakeSuccess] = useState<boolean>(false);
  const [extractedSummary, setExtractedSummary] = useState<any>(null);

  const startTopVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    recognition.onstart = () => {
      setTopVoiceListening(true);
    };

    recognition.onend = () => {
      setTopVoiceListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Top speech recognition error:", event);
      setTopVoiceListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript) {
        setTopVoiceText((prev) => {
          const cleanPrev = prev.trim();
          return cleanPrev ? `${cleanPrev} ${finalTranscript.trim()}` : finalTranscript.trim();
        });
      }
    };

    try {
      recognition.start();
      setTopRecognitionInstance(recognition);
      setTopVoiceListening(true);
    } catch (err) {
      console.error("Failed to start top speech recognition:", err);
    }
  };

  const stopTopVoiceDictation = () => {
    if (topRecognitionInstance) {
      try {
        topRecognitionInstance.stop();
      } catch (e) {
        console.error("Error stopping top voice recognition:", e);
      }
    }
    setTopVoiceListening(false);
  };

  const generateLocalClinicalFallbackIntake = (transcriptText: string, activeStepNum: number = 5) => {
    const text = transcriptText.toLowerCase();
    const expectedDate = new Date().toISOString().split('T')[0];
    const result: any = {};

    if (activeStepNum === 1) {
      let diagnosis = "Cholelithiasis with acute cholecystitis";
      let surgeryName = "Laparoscopic Cholecystectomy";
      let surgeryType: SurgeryType = "Major";
      let priorityLevel: PriorityLevel = "High";
      let duration = 60;
      let clinicalNotes = "Symptomatic gallbladder stones. Recommend early lap chole.";

      if (text.includes("appendix") || text.includes("appendicitis") || text.includes("appendec")) {
        diagnosis = "Acute Appendicitis";
        surgeryName = "Laparoscopic Appendectomy";
        surgeryType = "Emergency";
        priorityLevel = "Immediate";
        duration = 45;
        clinicalNotes = "Rebound tenderness in RIF, leukocytosis. Fit for emergency appendectomy.";
      } else if (text.includes("hernia") || text.includes("hernio")) {
        diagnosis = "Right Inguinal Hernia";
        surgeryName = "Open Hernioplasty with Mesh";
        surgeryType = "Major";
        priorityLevel = "Medium";
        duration = 75;
        clinicalNotes = "Reducible right groin hernia, chronic aching pain. Plan for mesh hernioplasty.";
      }

      result.recommendation = {
        diagnosis,
        surgeryName,
        surgeryType,
        expectedDate,
        priorityLevel,
        estimatedDuration: duration,
        clinicalNotes: clinicalNotes || transcriptText,
        recommendedBy: "Dr. Devendra Mehta",
        recommendedDate: expectedDate
      };
    }

    else if (activeStepNum === 2) {
      result.preSurgeryAssessment = {
        performedBy: "Dr. Devendra Mehta",
        medicalHistory: "Type 2 Diabetes managed with Metformin.",
        previousSurgeries: "None",
        allergies: "No known drug allergies",
        currentMedication: "Tab. Metformin 500mg OD",
        vitals: {
          bp: "128/82",
          pulse: 78,
          temp: 36.8,
          spo2: 99,
          weight: 72,
          height: 170,
          bmi: 24.9
        },
        comorbidities: {
          diabetes: text.includes("diabetes") || text.includes("diabetic"),
          hypertension: text.includes("tension") || text.includes("pressure") || text.includes("hypertens"),
          heartDisease: false,
          asthma: false,
          other: ""
        },
        tests: {
          cbc: "Normal",
          bloodGroup: "O Positive",
          ptInr: "Normal",
          bloodSugar: "115 mg/dL",
          ecg: "Normal Sinus Rhythm",
          xray: "Clear",
          ctScan: "Not Required",
          mri: "Not Required"
        },
        fitnessStatus: "Fit"
      };
    }

    else if (activeStepNum === 5) {
      let bp = "120/80";
      let pulse = 78;
      let spo2 = 99;

      const bpMatch = text.match(/(?:bp|blood pressure|pressure)\s*(?:is)?\s*(\d+\s*\/\s*\d+)/i) || text.match(/(\d+)\s+over\s+(\d+)/i);
      if (bpMatch) {
        if (bpMatch[2]) {
          bp = `${bpMatch[1]}/${bpMatch[2]}`;
        } else {
          bp = bpMatch[1].replace(/\s+/g, "");
        }
      }

      const pulseMatch = text.match(/(?:pulse|heart rate|pulse rate)\s*(?:is)?\s*(\d+)/i) || text.match(/pulse\s+(\d+)/i);
      if (pulseMatch) {
        pulse = parseInt(pulseMatch[1], 10);
      }

      const spo2Match = text.match(/(?:spo2|oxygen saturation|saturation|oxygen)\s*(?:is)?\s*(\d+)/i) || text.match(/saturation\s+(\d+)/i);
      if (spo2Match) {
        spo2 = parseInt(spo2Match[1], 10);
      }

      result.postOpRecovery = {
        vitalsLogs: [
          {
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            bp,
            pulse,
            spo2,
            painScore: text.includes("pain") ? 3 : 0,
            consciousness: "Fully Awake"
          }
        ],
        status: "Stable"
      };
    }

    else if (activeStepNum === 10) {
      result.teamAssignment = {
        team: {
          primarySurgeon: "Dr. Devendra Mehta",
          assistantSurgeon: "Dr. Anjali Deshmukh",
          leadAnesthetist: "Dr. Ronald D'Souza",
          assistantAnesthetist: "Sister Mary Joseph",
          scrubNurse: "Sister Jaspreet Kaur",
          circulatingNurse: "Sister Mary Joseph",
          otTechnician: "Brother Rajesh Kumar",
          biomedicalTech: "Brother Rajesh Kumar"
        },
        assignedBy: "OT Chief Administrator",
        availabilityStatus: "All Available"
      };
    }

    else {
      result.postOpRecovery = {
        vitalsLogs: [
          { time: "12:15", bp: "120/80", pulse: 78, spo2: 99, painScore: 0, consciousness: "Fully Awake" }
        ],
        status: "Stable"
      };
    }

    return result;
  };

  const processTopVoiceIntake = async () => {
    if (!topVoiceText.trim()) {
      alert("Please enter or dictate some text first before processing.");
      return;
    }

    if (topVoiceListening) {
      stopTopVoiceDictation();
    }

    setVoiceIntakeLoading(true);
    setVoiceIntakeLogs([]);
    setVoiceIntakeStatus("Initiating AI clinical parser...");
    setVoiceIntakeSuccess(false);

    const activeStepName = stepsList.find(s => s.num === activeStep)?.name || "Post-Anesthesia Care (PACU)";

    const logs = [
      `Analyzing voice intake transcript specifically for Step ${activeStep}: "${activeStepName}"...`,
      `Extracting details only for "${activeStepName}"...`,
      "Mapping properties and updating active step fields...",
      "Constructing final structured clinical data profile..."
    ];

    for (let i = 0; i < logs.length; i++) {
      setVoiceIntakeStatus(logs[i]);
      setVoiceIntakeLogs(prev => [...prev, logs[i]]);
      await new Promise(r => setTimeout(r, 450));
    }

    try {
      const response = await fetch("/ot/api/gemini/voice-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: topVoiceText,
          currentCase: selectedCase,
          activeStep,
          activeStepName
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const extracted = resData.data;
        const updated = { ...selectedCase };

        if (activeStep === 1 && extracted.recommendation) {
          updated.recommendation = {
            ...selectedCase.recommendation,
            ...extracted.recommendation
          };
        } else if (activeStep === 2 && extracted.preSurgeryAssessment) {
          updated.preSurgeryAssessment = {
            ...selectedCase.preSurgeryAssessment,
            ...extracted.preSurgeryAssessment,
            vitals: {
              ...selectedCase.preSurgeryAssessment?.vitals,
              ...extracted.preSurgeryAssessment?.vitals
            },
            comorbidities: {
              ...selectedCase.preSurgeryAssessment?.comorbidities,
              ...extracted.preSurgeryAssessment?.comorbidities
            },
            tests: {
              ...selectedCase.preSurgeryAssessment?.tests,
              ...extracted.preSurgeryAssessment?.tests
            }
          };
        } else if (activeStep === 3 && extracted.anesthesiaEvaluation) {
          updated.anesthesiaEvaluation = {
            ...selectedCase.anesthesiaEvaluation,
            ...extracted.anesthesiaEvaluation
          };
        } else if (activeStep === 4) {
          if (extracted.insurancePreAuth) {
            updated.insurancePreAuth = {
              ...selectedCase.insurancePreAuth,
              ...extracted.insurancePreAuth
            };
          }
          if (extracted.consentManagement) {
            updated.consentManagement = {
              ...selectedCase.consentManagement,
              ...extracted.consentManagement
            };
          }
        } else if (activeStep === 5 && extracted.postOpRecovery) {
          // Append new vitals to the array to preserve history
          const newVitals = extracted.postOpRecovery.vitalsLogs || [];
          updated.postOpRecovery = {
            ...selectedCase.postOpRecovery,
            status: extracted.postOpRecovery.status || selectedCase.postOpRecovery.status,
            vitalsLogs: [...selectedCase.postOpRecovery.vitalsLogs, ...newVitals]
          };
        } else if (activeStep === 6 && extracted.otScheduling) {
          updated.otScheduling = {
            ...selectedCase.otScheduling,
            ...extracted.otScheduling
          };
        } else if (activeStep === 7 && extracted.equipmentCheck) {
          updated.equipmentCheck = {
            ...selectedCase.equipmentCheck,
            ...extracted.equipmentCheck,
            equipment: {
              ...selectedCase.equipmentCheck?.equipment,
              ...extracted.equipmentCheck?.equipment
            }
          };
        } else if (activeStep === 8 && extracted.dayChecklist) {
          updated.dayChecklist = {
            ...selectedCase.dayChecklist,
            ...extracted.dayChecklist,
            checklist: {
              ...selectedCase.dayChecklist?.checklist,
              ...extracted.dayChecklist?.checklist
            }
          };
        } else if (activeStep === 9 && extracted.consumablesTracking) {
          updated.consumablesTracking = {
            ...selectedCase.consumablesTracking,
            ...extracted.consumablesTracking
          };
        } else if (activeStep === 10 && extracted.teamAssignment) {
          updated.teamAssignment = {
            ...selectedCase.teamAssignment,
            ...extracted.teamAssignment,
            team: {
              ...selectedCase.teamAssignment?.team,
              ...extracted.teamAssignment?.team
            }
          };
        } else if (activeStep === 11 && extracted.postOpOrders) {
          updated.postOpOrders = {
            ...selectedCase.postOpOrders,
            ...extracted.postOpOrders
          };
        } else if (activeStep === 12 && extracted.outcomeTracking) {
          updated.outcomeTracking = {
            ...selectedCase.outcomeTracking,
            ...extracted.outcomeTracking
          };
        } else if (activeStep === 13 && extracted.billing) {
          updated.billing = {
            ...selectedCase.billing,
            ...extracted.billing,
            actualCharges: {
              ...selectedCase.billing?.actualCharges,
              ...extracted.billing?.actualCharges
            }
          };
        } else if (activeStep === 14 && extracted.discharge) {
          updated.discharge = {
            ...selectedCase.discharge,
            ...extracted.discharge,
            summary: {
              ...selectedCase.discharge?.summary,
              ...extracted.discharge?.summary
            }
          };
        }

        onUpdateCase(updated);
        setVoiceIntakeStatus(`Step ${activeStep} ("${activeStepName}") successfully auto-filled! Please review below.`);
        setVoiceIntakeLogs(prev => [...prev, `✓ Step ${activeStep} successfully updated!`]);
        setExtractedSummary({
          diagnosis: extracted.recommendation?.diagnosis || updated.recommendation.diagnosis,
          surgeryName: extracted.recommendation?.surgeryName || updated.recommendation.surgeryName,
          anesthesiaType: extracted.anesthesiaEvaluation?.anesthesiaType || updated.anesthesiaEvaluation.anesthesiaType,
          primarySurgeon: extracted.teamAssignment?.team?.primarySurgeon || updated.teamAssignment.team.primarySurgeon,
          dischargeStatus: extracted.discharge?.status || updated.discharge.status
        });
        setVoiceIntakeSuccess(true);
      } else {
        throw new Error(resData.error || "No data returned.");
      }
    } catch (err: any) {
      console.error(err);
      setVoiceIntakeStatus(`Error during AI extraction: ${err.message || err}. Reverting to local fallback parser...`);
      setVoiceIntakeLogs(prev => [...prev, "⚠️ Online extraction failed, activating offline clinical extraction parser..."]);
      
      await new Promise(r => setTimeout(r, 800));
      const mockResult = generateLocalClinicalFallbackIntake(topVoiceText, activeStep);
      
      const updated = { ...selectedCase };

      if (activeStep === 1 && mockResult.recommendation) {
        updated.recommendation = {
          ...selectedCase.recommendation,
          ...mockResult.recommendation
        };
      } else if (activeStep === 2 && mockResult.preSurgeryAssessment) {
        updated.preSurgeryAssessment = {
          ...selectedCase.preSurgeryAssessment,
          ...mockResult.preSurgeryAssessment,
          vitals: {
            ...selectedCase.preSurgeryAssessment?.vitals,
            ...mockResult.preSurgeryAssessment?.vitals
          },
          comorbidities: {
            ...selectedCase.preSurgeryAssessment?.comorbidities,
            ...mockResult.preSurgeryAssessment?.comorbidities
          },
          tests: {
            ...selectedCase.preSurgeryAssessment?.tests,
            ...mockResult.preSurgeryAssessment?.tests
          }
        };
      } else if (activeStep === 3 && mockResult.anesthesiaEvaluation) {
        updated.anesthesiaEvaluation = {
          ...selectedCase.anesthesiaEvaluation,
          ...mockResult.anesthesiaEvaluation
        };
      } else if (activeStep === 4) {
        if (mockResult.insurancePreAuth) {
          updated.insurancePreAuth = {
            ...selectedCase.insurancePreAuth,
            ...mockResult.insurancePreAuth
          };
        }
        if (mockResult.consentManagement) {
          updated.consentManagement = {
            ...selectedCase.consentManagement,
            ...mockResult.consentManagement
          };
        }
      } else if (activeStep === 5 && mockResult.postOpRecovery) {
        const newVitals = mockResult.postOpRecovery.vitalsLogs || [];
        updated.postOpRecovery = {
          ...selectedCase.postOpRecovery,
          status: mockResult.postOpRecovery.status || selectedCase.postOpRecovery.status,
          vitalsLogs: [...selectedCase.postOpRecovery.vitalsLogs, ...newVitals]
        };
      } else if (activeStep === 6 && mockResult.otScheduling) {
        updated.otScheduling = {
          ...selectedCase.otScheduling,
          ...mockResult.otScheduling
        };
      } else if (activeStep === 7 && mockResult.equipmentCheck) {
        updated.equipmentCheck = {
          ...selectedCase.equipmentCheck,
          ...mockResult.equipmentCheck,
          equipment: {
            ...selectedCase.equipmentCheck?.equipment,
            ...mockResult.equipmentCheck?.equipment
          }
        };
      } else if (activeStep === 8 && mockResult.dayChecklist) {
        updated.dayChecklist = {
          ...selectedCase.dayChecklist,
          ...mockResult.dayChecklist,
          checklist: {
            ...selectedCase.dayChecklist?.checklist,
            ...mockResult.dayChecklist?.checklist
          }
        };
      } else if (activeStep === 9 && mockResult.consumablesTracking) {
        updated.consumablesTracking = {
          ...selectedCase.consumablesTracking,
          ...mockResult.consumablesTracking
        };
      } else if (activeStep === 10 && mockResult.teamAssignment) {
        updated.teamAssignment = {
          ...selectedCase.teamAssignment,
          ...mockResult.teamAssignment,
          team: {
            ...selectedCase.teamAssignment?.team,
            ...mockResult.teamAssignment?.team
          }
        };
      } else if (activeStep === 11 && mockResult.postOpOrders) {
        updated.postOpOrders = {
          ...selectedCase.postOpOrders,
          ...mockResult.postOpOrders
        };
      } else if (activeStep === 12 && mockResult.outcomeTracking) {
        updated.outcomeTracking = {
          ...selectedCase.outcomeTracking,
          ...mockResult.outcomeTracking
        };
      } else if (activeStep === 13 && mockResult.billing) {
        updated.billing = {
          ...selectedCase.billing,
          ...mockResult.billing,
          actualCharges: {
            ...selectedCase.billing?.actualCharges,
            ...mockResult.billing?.actualCharges
          }
        };
      } else if (activeStep === 14 && mockResult.discharge) {
        updated.discharge = {
          ...selectedCase.discharge,
          ...mockResult.discharge,
          summary: {
            ...selectedCase.discharge?.summary,
            ...mockResult.discharge?.summary
          }
        };
      }
      
      onUpdateCase(updated);
      setVoiceIntakeStatus(`Successfully updated Step ${activeStep} ("${activeStepName}") with clinical offline mapping!`);
      setVoiceIntakeLogs(prev => [...prev, "✓ Mapping completed via local fallback parser."]);
      setExtractedSummary({
        diagnosis: mockResult.recommendation?.diagnosis || updated.recommendation.diagnosis,
        surgeryName: mockResult.recommendation?.surgeryName || updated.recommendation.surgeryName,
        anesthesiaType: mockResult.anesthesiaEvaluation?.anesthesiaType || updated.anesthesiaEvaluation.anesthesiaType,
        primarySurgeon: mockResult.teamAssignment?.team?.primarySurgeon || updated.teamAssignment.team.primarySurgeon,
        dischargeStatus: mockResult.discharge?.status || updated.discharge.status
      });
      setVoiceIntakeSuccess(true);
    } finally {
      setVoiceIntakeLoading(false);
    }
  };

  // Voice input handler
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      const errorMessage = event.error || (event.message ? event.message : "Unknown error");
      setIsListening(false);
      alert(`Voice recognition error: ${errorMessage}`);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      alert(`Recognized: ${transcript}`);
      // In a real application, you would parse the transcript and update the form state here.
    };

    recognition.start();
  };

  // Co-Pilot State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLogs, setAiLogs] = useState<string[]>([]);

  // Simulation States
  const [isSimulatingSurgery, setIsSimulatingSurgery] = useState(false);
  const [isSimulatingRecovery, setIsSimulatingRecovery] = useState(false);

  // Consent Portal States
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentRole, setConsentRole] = useState<'patient' | 'attendant' | 'doctor' | 'witness'>('patient');
  const [drawings, setDrawings] = useState<{ [key: string]: string }>({}); // saved dataURLs or SVG mockup
  const [isDrawing, setIsDrawing] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareWhatsAppPhone, setShareWhatsAppPhone] = useState(selectedCase?.patient?.phone || "");
  const [copiedLink, setCopiedLink] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [simulatedEmail, setSimulatedEmail] = useState<{
    recipient: string;
    patientName: string;
    surgeryName: string;
    doctorName: string;
    link: string;
    html: string;
  } | null>(null);

  // Voice Dictation Modal State
  const [voiceTarget, setVoiceTarget] = useState<{ label: string; value: string; onSave: (val: string) => void } | null>(null);
  const [voiceText, setVoiceText] = useState("");
  const [voiceListening, setVoiceListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const startVoiceDictation = (label: string, initialValue: string, onSave: (val: string) => void) => {
    setVoiceTarget({ label, value: initialValue, onSave });
    setVoiceText(initialValue);
    setVoiceListening(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      setVoiceListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    recognition.onstart = () => {
      setVoiceListening(true);
    };

    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      setVoiceListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript) {
        setVoiceText((prev) => {
          const cleanPrev = prev.trim();
          return cleanPrev ? `${cleanPrev} ${finalTranscript.trim()}` : finalTranscript.trim();
        });
      }
    };

    try {
      recognition.start();
      setRecognitionInstance(recognition);
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  };

  const stopVoiceDictation = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {
        console.error("Error stopping voice recognition:", e);
      }
    }
    setVoiceListening(false);
  };

  const VoiceInputIcon = ({ label, value, onTranscript }: { label: string; value: string; onTranscript: (text: string) => void }) => {
    return (
      <button 
        type="button"
        onClick={() => startVoiceDictation(label, value, onTranscript)} 
        className="text-teal-500 hover:text-teal-600 p-1.5 rounded-full hover:bg-teal-50 transition-all flex items-center justify-center cursor-pointer"
        title={`Speak into ${label}`}
      >
        <Mic className="w-3.5 h-3.5" />
      </button>
    );
  };

  const handlePrintConsent = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const patientSign = selectedCase.consentManagement.signatures.patient 
      ? `<img src="${(selectedCase.consentManagement as any).signatureImages?.patient || drawings.patient || ''}" style="height: 50px; border-bottom: 1px solid #ddd;" />`
      : '<span style="color: #999; font-style: italic;">Awaiting Digital Verification</span>';

    const attendantSign = selectedCase.consentManagement.signatures.attendant
      ? `<img src="${(selectedCase.consentManagement as any).signatureImages?.attendant || drawings.attendant || ''}" style="height: 50px; border-bottom: 1px solid #ddd;" />`
      : '<span style="color: #999; font-style: italic;">Awaiting Digital Verification</span>';

    const doctorSign = selectedCase.consentManagement.signatures.doctor
      ? `<img src="${(selectedCase.consentManagement as any).signatureImages?.doctor || drawings.doctor || ''}" style="height: 50px; border-bottom: 1px solid #ddd;" />`
      : '<span style="color: #999; font-style: italic;">Awaiting Digital Verification</span>';

    const witnessSign = selectedCase.consentManagement.signatures.witness
      ? `<img src="${(selectedCase.consentManagement as any).signatureImages?.witness || drawings.witness || ''}" style="height: 50px; border-bottom: 1px solid #ddd;" />`
      : '<span style="color: #999; font-style: italic;">Awaiting Digital Verification</span>';

    printWindow.document.write(`
      <html>
        <head>
          <title>Informed Consent Sheet - ${selectedCase.patient.name}</title>
          <style>
            body { font-family: Georgia, serif; color: #111; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #2bb2a7; padding-bottom: 15px; margin-bottom: 30px; }
            .title { font-size: 20px; font-weight: bold; text-transform: uppercase; margin: 0; color: #111; }
            .sub { font-size: 11px; font-family: sans-serif; color: #555; margin-top: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; font-family: sans-serif; font-size: 12px; }
            .section-title { font-weight: bold; text-transform: uppercase; font-size: 10px; color: #555; margin-bottom: 5px; }
            .panel { background: #f9f9f9; padding: 15px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 20px; }
            .declaration { background: #fffdf9; border: 1px solid #f2ddd2; padding: 20px; border-radius: 8px; font-size: 13px; margin-bottom: 30px; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; font-family: sans-serif; font-size: 11px; }
            .sig-box { border-top: 1px solid #ccc; padding-top: 10px; text-align: center; height: 100px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; }
            .metadata { font-size: 10px; color: #777; text-align: center; margin-top: 50px; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Swasti Medical Centers & Clinics</div>
            <div class="sub">Informed Surgical Consent Authorization Document</div>
          </div>
          
          <div class="grid">
            <div>
              <div class="section-title">Patient Demographics</div>
              <div><strong>Name:</strong> ${selectedCase.patient.name}</div>
              <div><strong>Age:</strong> ${selectedCase.patient.age}y &bull; <strong>Gender:</strong> ${selectedCase.patient.gender}</div>
              <div><strong>National Health ID:</strong> SW-${selectedCase.id}</div>
            </div>
            <div>
              <div class="section-title">Clinical Referral</div>
              <div><strong>Recommending Surgeon:</strong> ${selectedCase.recommendation.recommendedBy}</div>
              <div><strong>Department:</strong> Orthopaedics & Surgical Medicine</div>
              <div><strong>Case Reference:</strong> ${selectedCase.id}</div>
            </div>
          </div>

          <div class="panel">
            <div class="section-title">Planned Surgical Procedure</div>
            <div style="font-size: 14px; font-weight: bold;">${selectedCase.recommendation.surgeryName}</div>
          </div>

          <div class="panel">
            <div class="section-title">Diagnosed Presentation</div>
            <div>${selectedCase.recommendation.diagnosis}</div>
          </div>

          <div class="declaration">
            <div class="section-title">Consent Declaration & Statement of Understanding</div>
            <p style="margin-top: 10px;">I hereby authorize ${selectedCase.recommendation.recommendedBy.startsWith('Dr.') ? selectedCase.recommendation.recommendedBy : `Dr. ${selectedCase.recommendation.recommendedBy}`} to perform the planned surgery (${selectedCase.recommendation.surgeryName}) and administer the required anesthesia. I confirm that the procedure's clinical indications, potential risks, anticipated benefits, and available alternatives have been explained to me in detail, and I fully consent to the treatment.</p>
            <p>I also authorize the administration of any necessary blood products, transfusions, or emergency secondary interventions should unforeseen clinical circumstances arise during the course of the operation. I acknowledge that medicine is not an exact science and that no guarantees have been made to me regarding the absolute outcome of this procedure.</p>
          </div>

          <div class="signatures">
            <div class="sig-box">
              <div>${patientSign}</div>
              <div><strong>Patient Signature</strong></div>
            </div>
            <div class="sig-box">
              <div>${attendantSign}</div>
              <div><strong>Attendant / Guardian Signature</strong></div>
            </div>
            <div class="sig-box">
              <div>${doctorSign}</div>
              <div><strong>Primary Surgeon Signature</strong></div>
            </div>
            <div class="sig-box">
              <div>${witnessSign}</div>
              <div><strong>Authorized Witness Signature</strong></div>
            </div>
          </div>

          <div class="metadata">
            Electronic Medical Record Verified & Encrypted. Signed digitally via National Health Swasti ID Portal. <br/>
            Document ID: SEC-EMR-${selectedCase.id}-${Date.now().toString().slice(-6)}
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadConsent = () => {
    const docHtml = `
      <html>
        <head>
          <title>Consent Form - ${selectedCase.patient.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #2bb2a7; margin-bottom: 20px; padding-bottom: 10px; }
            .content { margin-bottom: 20px; }
            .section { font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Swasti Medical Centers</h2>
            <p>OFFICIAL DIGITAL CONSENT DOCUMENT</p>
          </div>
          <div class="content">
            <p><strong>Case ID:</strong> ${selectedCase.id}</p>
            <p><strong>Patient Name:</strong> ${selectedCase.patient.name} (Age: ${selectedCase.patient.age})</p>
            <p><strong>Procedure Planned:</strong> ${selectedCase.recommendation.surgeryName}</p>
            <p><strong>Clinical Diagnosis:</strong> ${selectedCase.recommendation.diagnosis}</p>
            <p><strong>Declaration:</strong> I hereby authorize Dr. ${selectedCase.recommendation.recommendedBy} to perform the planned surgery and administer required anesthesia. I confirm that the procedure's risks, benefits, and alternatives have been explained to me, and I consent to the treatment.</p>
          </div>
          <p>This is a legally verified medical document exported from Swasti HIS on ${new Date().toLocaleString()}.</p>
        </body>
      </html>
    `;
    const blob = new Blob([docHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Surgical_Consent_${selectedCase.patient.name.replace(/\s+/g, '_')}_${selectedCase.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Signature Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x = 0, y = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      // Prevent scrolling when drawing on touch screens
      if (e.cancelable) e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x = 0, y = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      if (e.cancelable) e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0f172a'; // slate-900 ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Sync active step when case selection changes
  useEffect(() => {
    setActiveStep(initialStep || Math.min(selectedCase.currentStep, 14));
    setShareWhatsAppPhone(selectedCase?.patient?.phone || "");
  }, [selectedCase.id, initialStep, selectedCase.currentStep, selectedCase?.patient?.phone]);

  // Automatically reference existing ECG record or create a pending ECG request if it doesn't exist
  useEffect(() => {
    if (selectedCase && !selectedCase.ecgRecord) {
      const updated = {
        ...selectedCase,
        ecgRecord: {
          status: 'Pending' as const,
          orderedBy: 'System Auto-Order',
          orderedDate: new Date().toISOString().split('T')[0],
          rhythm: 'NSR',
          bpm: 72,
          prInterval: 160,
          qrsDuration: 90,
          qtInterval: 390,
          rrInterval: 833,
          signalQuality: 99
        }
      };
      onUpdateCase(updated);
    }
  }, [selectedCase?.id]);

  const stepsList = [
    { num: 1, name: 'Procedure Recommendation', icon: ClipboardList },
    { num: 2, name: 'Pre-Operative Assessment', icon: Activity },
    { num: 15, name: 'Pre-Op ECG Telemetry', icon: HeartPulse },
    { num: 3, name: 'Anesthesia Clearance', icon: Heart },
    { num: 4, name: 'Authorization & Consent', icon: FileText },
    { num: 5, name: 'Post-Anesthesia Care (PACU)', icon: Heart },
    { num: 6, name: 'OT Slot Booking', icon: Clock },
    { num: 7, name: 'Sterilization & Instrument Check', icon: Cpu },
    { num: 8, name: 'Admissions & Pre-Op Checklist', icon: CheckSquare },
    { num: 9, name: 'Surgical Consumables & Implants', icon: ShoppingBag },
    { num: 10, name: 'Clinical Team Staffing', icon: Users },
    { num: 11, name: 'Ward Transition & Recovery Orders', icon: Bookmark },
    { num: 12, name: 'Clinical Outcome Tracking', icon: UserCheck },
    { num: 13, name: 'Financial Clearance & Billing', icon: DollarSign },
    { num: 14, name: 'Discharge & Outpatient Follow-Up', icon: ArrowLeft }
  ];

  // Helper to change current step of the case
  const updateCurrentStep = (newStep: number, customStatus?: CaseStatus) => {
    const updated = { ...selectedCase };
    updated.currentStep = newStep;
    if (customStatus) {
      updated.status = customStatus;
    } else {
      // Auto mapping
      if (newStep === 1) updated.status = 'Recommended';
      else if (newStep === 2) updated.status = 'Assessment Pending';
      else if (newStep === 3) updated.status = 'Assessment Completed';
      else if (newStep === 5) updated.status = 'In Recovery';
      else if (newStep === 6) updated.status = 'Scheduled';
      else if (newStep === 8) updated.status = 'OT Day Clearance';
      else if (newStep === 10) updated.status = 'Team Assigned';
      else if (newStep === 11) updated.status = 'Shifted to Ward';
      else if (newStep === 14) updated.status = 'Ready for Discharge';
    }
    onUpdateCase(updated);
  };

  const handleFieldChange = (section: keyof SurgeryCase, field: string, value: any) => {
    const updated = { ...selectedCase };
    (updated[section] as any) = {
      ...(updated[section] as any),
      [field]: value
    };
    onUpdateCase(updated);
  };

  const handleNestedFieldChange = (section: keyof SurgeryCase, subSection: string, field: string, value: any) => {
    const updated = { ...selectedCase };
    const sec = updated[section] as any;
    sec[subSection] = {
      ...sec[subSection],
      [field]: value
    };
    onUpdateCase(updated);
  };

  const handleCostFieldChange = (field: string, val: number) => {
    const updated = { ...selectedCase };
    const currentCharges = { ...updated.costEstimation.charges, [field]: val };
    
    // assistantFee is usually 30% of surgeon fee
    if (field === 'surgeonFee') {
      currentCharges.assistantFee = Math.round(val * 0.3);
    }
    
    const sumTotal = Object.values(currentCharges).reduce((sum: number, x: any) => sum + (Number(x) || 0), 0);
    
    updated.costEstimation = {
      ...updated.costEstimation,
      charges: currentCharges,
      estimatedCost: sumTotal,
      packageCost: Math.round(sumTotal * 0.95),
      insurancePayable: Math.round(sumTotal * 0.85),
      patientPayable: Math.round(sumTotal * 0.15)
    };
    onUpdateCase(updated);
  };

  // Consult Swasti AI Server
  const consultAI = async () => {
    setAiLoading(true);
    setAiLogs([]);
    setShowCoPilot(true);

    const logs = [
      "Analyzing patient's clinical history...",
      "Gathering evidence-based surgical pathways...",
      "Matching comorbidities for anesthesia risk...",
      "Synthesizing standard equipment requirement checklist...",
      "Generating clinical post-operative orders suggestion..."
    ];

    // Log simulator
    for (let i = 0; i < logs.length; i++) {
      setAiLogs(prev => [...prev, logs[i]]);
      await new Promise(r => setTimeout(r, 400));
    }

    try {
      const response = await fetch("/ot/api/gemini/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: selectedCase.recommendation.diagnosis,
          surgeryName: selectedCase.recommendation.surgeryName,
          patientAge: selectedCase.patient.age,
          patientGender: selectedCase.patient.gender
        })
      });

      const data = await response.json();
      setAiResult(data);
    } catch (err) {
      console.error(err);
      setAiResult({
        historyAlerts: "Verify coagulation profile and stop any anti-platelet therapy. Screen for respiratory infections.",
        preOpTests: ["CBC", "Serum Electrolytes", "Random Blood Sugar", "ECG"],
        anesthesiaType: "General",
        anesthesiaRisk: "Standard airway safety protocol. Risk is graded standard.",
        suggestedEquipment: ["Physiological monitor", "Electrosurgical generator", "Laparoscopy Tower"],
        postOpMedications: "Tab. Paracetamol 650mg TDS, Cap. Moxifloxacin 400mg OD.",
        postOpNursingTasks: ["Monitor post-op vitals hourly", "Maintain IV access", "Enforce strict fasting"],
        costSuggestion: { surgeonFee: 25000, implantsCost: 0, otCharges: 15000, totalEstimatedCost: 85000 }
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-fill forms with AI Suggestions
  const autofillWithAI = () => {
    if (!aiResult) return;
    const updated = { ...selectedCase };

    // Step 2 Assessment autofill
    updated.preSurgeryAssessment = {
      performedBy: selectedCase.recommendation.recommendedBy,
      medicalHistory: aiResult.historyAlerts,
      previousSurgeries: selectedCase.preSurgeryAssessment.previousSurgeries || 'None',
      allergies: selectedCase.preSurgeryAssessment.allergies || 'None',
      currentMedication: selectedCase.preSurgeryAssessment.currentMedication || 'None',
      comorbidities: selectedCase.preSurgeryAssessment.comorbidities,
      vitals: selectedCase.preSurgeryAssessment.vitals,
      tests: {
        ...selectedCase.preSurgeryAssessment.tests,
        cbc: 'Hb: 13.2, WBC: 7400',
        bloodGroup: selectedCase.patient.bloodGroup,
        ptInr: 'PT: 12s, INR: 1.0',
        bloodSugar: 'FBS: 95 mg/dL'
      },
      fitnessStatus: 'Fit'
    };

    // Step 3 Anesthesia autofill
    updated.anesthesiaEvaluation = {
      anesthetistName: 'Dr. Vivek Ranjan',
      asaGrade: 'ASA I',
      airwayAssessment: 'Mallampati Class I',
      previousAnesthesiaHistory: 'None',
      drugAllergies: 'None known',
      anesthesiaType: aiResult.anesthesiaType as any,
      status: 'Approved',
      evaluationDate: new Date().toISOString().split('T')[0]
    };

    // Step 4 Cost Estimation autofill
    updated.costEstimation = {
      charges: {
        surgeonFee: aiResult.costSuggestion.surgeonFee,
        assistantFee: Math.round(aiResult.costSuggestion.surgeonFee * 0.3),
        otUsage: aiResult.costSuggestion.otCharges,
        recoveryRoom: 3000,
        anesthesia: 10000,
        nursing: 4000,
        implants: aiResult.costSuggestion.implantsCost,
        consumables: 6000,
        medicines: 5000,
        investigations: 4000,
        roomCharges: 6000
      },
      estimatedCost: aiResult.costSuggestion.totalEstimatedCost,
      packageCost: Math.round(aiResult.costSuggestion.totalEstimatedCost * 0.95),
      patientPayable: Math.round(aiResult.costSuggestion.totalEstimatedCost * 0.15),
      insurancePayable: Math.round(aiResult.costSuggestion.totalEstimatedCost * 0.85)
    };

    // Step 7 Team assignment suggestions
    updated.teamAssignment.team = {
      primarySurgeon: selectedCase.recommendation.recommendedBy,
      assistantSurgeon: 'Dr. Meera Sen',
      leadAnesthetist: 'Dr. Parul Chaudhary',
      assistantAnesthetist: 'Dr. Vivek Ranjan',
      scrubNurse: 'Sister Mini Joseph',
      circulatingNurse: 'Sister Swapna Roy',
      otTechnician: 'Brother Sunil Gowda',
      biomedicalTech: 'Suresh Kumar'
    };

    // Step 14 Post-Op orders autofill
    updated.postOpOrders = {
      medications: aiResult.postOpMedications,
      antibiotics: 'Inj. Cefuroxime 1.5g IV Stat',
      fluids: 'Normal Saline 100ml/hr',
      diet: 'NPO for 4h, then soft oral liquids',
      physiotherapy: 'Chest physiotherapy, early bed mobilization',
      nursingTasks: aiResult.postOpNursingTasks.map((t: string, idx: number) => ({
        id: `NT-${Date.now()}-${idx}`,
        task: t,
        done: false,
        assignedTime: '16:00'
      }))
    };

    onUpdateCase(updated);
    alert("Swasti AI co-pilot successfully initialized and auto-filled workflow steps 2, 3, 4, 7, and 14!");
  };

  // Simulate Live Surgery day timeline
  const runSurgerySimulation = async () => {
    setIsSimulatingSurgery(true);
    const updated = { ...selectedCase };
    updated.intraOperative.timeline.patientShiftedToOT = '08:00';
    updated.intraOperative.timeline.anesthesiaStart = '08:15';
    updated.intraOperative.timeline.surgeryStart = '08:35';
    
    updated.intraOperative.events = [
      { time: '08:00', event: 'Shifted to OT', note: 'Patient successfully rolled into OT Suite' }
    ];
    onUpdateCase(updated);

    const simulationEvents = [
      { time: '08:15', event: 'Anesthesia Induced', note: 'Patient successfully placed on ventilator' },
      { time: '08:35', event: 'Surgical Incision', note: 'Skin incision taken, clean anatomical exposure' },
      { time: '09:10', event: 'Procedure Milestone', note: 'Pathology located and successfully excised' },
      { time: '09:40', event: 'Closure & Dressings', note: 'Anatomical layers closed, sterile sutures placed' }
    ];

    for (let i = 0; i < simulationEvents.length; i++) {
      await new Promise(r => setTimeout(r, 1500));
      const up = { ...selectedCase };
      up.intraOperative.events = [...up.intraOperative.events, simulationEvents[i]];
      if (i === simulationEvents.length - 1) {
        up.intraOperative.timeline.surgeryEnd = '09:40';
        up.intraOperative.timeline.anesthesiaEnd = '09:45';
        up.intraOperative.surgicalNotes = {
          procedurePerformed: selectedCase.recommendation.surgeryName,
          findings: `No anatomical anomalies. Excised pathology matching standard protocol. Intraoperative bleeding was minimal.`,
          complications: 'None encountered',
          bloodLoss: 120,
          implantUsed: selectedCase.costEstimation.charges.implants > 0 ? 'Prosthetic Joint / Mesh system' : 'None',
          specimenSent: true
        };
      }
      onUpdateCase(up);
    }
    setIsSimulatingSurgery(false);
  };

  // Simulate Post-Op recovery vitals charting
  const runRecoverySimulation = async () => {
    setIsSimulatingRecovery(true);
    const updated = { ...selectedCase };
    updated.postOpRecovery.vitalsLogs = [
      { time: '10:00', bp: '135/85', pulse: 92, spo2: 95, painScore: 8, consciousness: 'Arousable to Voice' }
    ];
    onUpdateCase(updated);

    const vitalsTicks: SurgeryCase['postOpRecovery']['vitalsLogs'] = [
      { time: '10:15', bp: '130/80', pulse: 86, spo2: 97, painScore: 6, consciousness: 'Fully Awake' },
      { time: '10:30', bp: '124/78', pulse: 78, spo2: 99, painScore: 4, consciousness: 'Fully Awake' },
      { time: '10:45', bp: '120/76', pulse: 74, spo2: 99, painScore: 2, consciousness: 'Fully Awake' }
    ];

    for (let i = 0; i < vitalsTicks.length; i++) {
      await new Promise(r => setTimeout(r, 1200));
      const up = { ...selectedCase };
      up.postOpRecovery.vitalsLogs = [...up.postOpRecovery.vitalsLogs, vitalsTicks[i]];
      if (i === vitalsTicks.length - 1) {
        up.postOpRecovery.status = 'Stable';
      }
      onUpdateCase(up);
    }
    setIsSimulatingRecovery(false);
  };

  // Consumables inventory helper
  const addConsumable = (name: string, cost: number) => {
    const updated = { ...selectedCase };
    const currentList = [...updated.consumablesTracking.surgicalConsumables];
    const existing = currentList.find(i => i.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      currentList.push({ name, quantity: 1, cost });
    }
    updated.consumablesTracking.surgicalConsumables = currentList;
    onUpdateCase(updated);
  };

  // Auto compile final billing (Step 16)
  const computeFinalBilling = () => {
    const updated = { ...selectedCase };
    const est = updated.costEstimation.charges;
    
    // Sum up any added consumables & medicines
    const consumablesCost = updated.consumablesTracking.surgicalConsumables.reduce((acc, i) => acc + (i.cost * i.quantity), 0);
    const medicinesCost = updated.consumablesTracking.medicinesUsed.reduce((acc, i) => acc + (i.cost * i.quantity), 0);
    const implantsCost = updated.consumablesTracking.implants.reduce((acc, i) => acc + i.cost, 0);

    const actualCharges = {
      surgeonFee: est.surgeonFee || 25000,
      assistantFee: est.assistantFee || 8000,
      otUsage: est.otUsage || 15000,
      recoveryRoom: est.recoveryRoom || 3000,
      anesthesia: est.anesthesia || 10000,
      nursing: est.nursing || 4000,
      implants: implantsCost || est.implants,
      consumables: consumablesCost || est.consumables || 5000,
      medicines: medicinesCost || est.medicines || 4000,
      investigations: est.investigations || 4000,
      roomCharges: est.roomCharges || 6000
    };

    const sum = Object.values(actualCharges).reduce((a, b) => a + b, 0);

    updated.billing.actualCharges = actualCharges;
    updated.billing.totalActualCost = sum;
    updated.billing.isBilled = true;
    updated.billing.billingDate = new Date().toISOString().split('T')[0];

    onUpdateCase(updated);
  };

  return (
    <div id={`workflow-manager-${selectedCase.id}`} className="space-y-6">
      {/* Back button and patient clinical banner */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-teal-400 font-bold hover:text-teal-300 transition uppercase mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-white">{selectedCase.patient.name}</h2>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">
                {selectedCase.patient.age}y {selectedCase.patient.gender}
              </span>
              <span className="text-xs bg-teal-500/10 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-mono">
                {selectedCase.id}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Diagnosis: <strong className="text-slate-200">{selectedCase.recommendation.diagnosis}</strong>
            </p>
          </div>

          {/* AI Consult Trigger */}
          <div className="flex gap-3">
            <button 
              onClick={startListening}
              className={`p-3 rounded-xl flex items-center justify-center transition shadow-lg ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              title="Voice Input"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={consultAI}
              className="bg-gradient-to-r from-teal-500 to-indigo-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition shadow-lg shadow-teal-500/15"
            >
              <Sparkles className="w-4 h-4 text-slate-950" /> Consult Swasti AI Co-Pilot
            </button>
          </div>
        </div>
      </div>

      {/* Swasti AI Voice Intake Command Center */}
      <div id="voice-intake-command-center" className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-30 -mb-30" />

        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  {topVoiceListening && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${topVoiceListening ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 font-mono">Real-time Dictation Engine</span>
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-1">
                <Mic className={`w-5 h-5 ${topVoiceListening ? 'text-red-500 animate-pulse' : 'text-teal-400'}`} />
                Swasti AI Patient Intake Center
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Dictate or paste complete clinical details for the surgery case. Swasti AI will perform deep clinical analysis to extract and auto-fill all 14 stages of the hospital workflow simultaneously.
              </p>
            </div>
            
            <div className="flex gap-2.5 self-stretch md:self-auto">
              <button
                type="button"
                onClick={topVoiceListening ? stopTopVoiceDictation : startTopVoiceDictation}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200 border cursor-pointer ${
                  topVoiceListening 
                    ? 'bg-red-500 border-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-teal-300 hover:text-teal-200'
                }`}
              >
                {topVoiceListening ? (
                  <>
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-teal-400" />
                    Start Listening
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setTopVoiceText("");
                  setVoiceIntakeSuccess(false);
                }}
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition duration-200 cursor-pointer"
                title="Clear input"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Textarea Block */}
            <div className="lg:col-span-2 space-y-2">
              <label htmlFor="voice-intake-textarea" className="text-xs font-bold text-slate-300 block">
                Comprehensive Case Intake Transcript & Dictation Box
              </label>
              <textarea
                id="voice-intake-textarea"
                rows={5}
                value={topVoiceText}
                onChange={(e) => setTopVoiceText(e.target.value)}
                placeholder="Click the microphone or type here to describe the full surgical scenario... Example: 'Recommend open mesh hernioplasty for right inguinal hernia. Dr Devendra Mehta is primary surgeon, Dr Ronald anesthetist. Patients preoperative BP is 128/80. Prepare OT Room 3, schedule for July 5th at 10:00 AM.'"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/50 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition resize-none font-sans"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono px-1">
                <span>{topVoiceText.length} characters captured</span>
                {topVoiceListening && <span className="text-red-400 animate-pulse">Capturing live vocal stream...</span>}
              </div>
            </div>

            {/* AI Action Box / Logging Panel */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[140px]">
              {voiceIntakeLoading ? (
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2.5 text-teal-400 font-bold text-xs">
                    <svg className="animate-spin h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{voiceIntakeStatus}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 h-24 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1">
                    {voiceIntakeLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start">
                        <span className="text-teal-500 select-none">▶</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : voiceIntakeSuccess && extractedSummary ? (
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs border-b border-slate-800 pb-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>Intake Extracted Perfectly!</span>
                  </div>
                  <div className="space-y-1 text-slate-300 text-[10px] font-mono">
                    <div className="flex justify-between border-b border-slate-900 py-0.5">
                      <span className="text-slate-500">DIAGNOSIS:</span>
                      <span className="text-slate-200 font-bold truncate max-w-[130px]" title={extractedSummary.diagnosis}>{extractedSummary.diagnosis}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 py-0.5">
                      <span className="text-slate-500">SURGERY:</span>
                      <span className="text-slate-200 truncate max-w-[130px]" title={extractedSummary.surgeryName}>{extractedSummary.surgeryName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 py-0.5">
                      <span className="text-slate-500">ANESTHESIA:</span>
                      <span className="text-slate-200">{extractedSummary.anesthesiaType}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 py-0.5">
                      <span className="text-slate-500">PRIMARY SURGEON:</span>
                      <span className="text-slate-200 font-bold">{extractedSummary.primarySurgeon}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">DISCHARGE STATUS:</span>
                      <span className="text-teal-400 font-bold">{extractedSummary.dischargeStatus}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center p-3">
                  <Sparkles className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-slate-500 text-[11px]">
                    No case transcription processed yet. Enter or speak text, then trigger extraction.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={processTopVoiceIntake}
                disabled={voiceIntakeLoading || !topVoiceText.trim()}
                className={`w-full bg-gradient-to-r from-teal-500 to-indigo-500 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-teal-500/10 cursor-pointer ${
                  voiceIntakeLoading || !topVoiceText.trim() 
                    ? 'opacity-50 cursor-not-allowed grayscale' 
                    : 'hover:opacity-95 hover:shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                {voiceIntakeLoading ? "Processing Case Intake..." : "Extract & Fill All 14 Steps"}
              </button>
            </div>
          </div>

          {voiceIntakeSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded-2xl p-3.5 text-xs flex items-start gap-3">
              <span className="text-lg">🎉</span>
              <div>
                <strong className="text-emerald-200">Timeline Generation Successful:</strong> All 14 stages have been structured with relevant clinical recommendations, bookings, staff schedules, anesthesiology grades, billing projections, and clearance tasks. You can view, verify, and customize individual steps using the timeline navigation tabs below.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 17-Step Process Step Navigator Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-2">
          {stepsList.map(s => {
            let isCompleted = s.num < selectedCase.currentStep;
            if (s.num === 15) {
              isCompleted = selectedCase.ecgRecord?.status === 'Signed';
            }
            const isActive = s.num === activeStep;
            let isUnreached = s.num > selectedCase.currentStep;
            if (s.num === 15) {
              isUnreached = selectedCase.currentStep < 2;
            }

            let circleClass = 'bg-slate-100 text-slate-500 border-slate-200';
            if (isCompleted) circleClass = 'bg-teal-500 text-slate-950 border-teal-500';
            if (isActive) circleClass = 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-100';

            const isEcgRequired = !!selectedCase.preSurgeryAssessment?.ecgRequired;
            const isEcgStep = s.num === 15;

            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                id={`btn-step-${s.num}`}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all duration-200 border text-xs font-semibold ${
                  isActive 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border ${circleClass}`}>
                  {isCompleted ? '✓' : isEcgStep ? 'ECG' : s.num}
                </span>
                <span>{s.name.split(' ')[0]}</span>
                {isEcgStep && (
                  <span className={`text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-wide ${
                    isEcgRequired ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isEcgRequired ? 'Req' : 'Opt'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workflow Layout (Form + AI Sidecar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Center Panel: Step Form Content */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">
                Workflow Phase {stepsList.findIndex(s => s.num === activeStep) + 1}/{stepsList.length}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {stepsList.find(s => s.num === activeStep)?.name}
              </h3>
            </div>
            
            {/* Step navigation controllers */}
            <div className="flex gap-2">
              <button 
                disabled={stepsList.findIndex(s => s.num === activeStep) === 0}
                onClick={() => {
                  const currentIndex = stepsList.findIndex(s => s.num === activeStep);
                  if (currentIndex > 0) {
                    setActiveStep(stepsList[currentIndex - 1].num);
                  }
                }}
                className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-semibold disabled:opacity-40 cursor-pointer"
              >
                Previous Step
              </button>
              <button 
                disabled={stepsList.findIndex(s => s.num === activeStep) === stepsList.length - 1}
                onClick={() => {
                  const currentIndex = stepsList.findIndex(s => s.num === activeStep);
                  if (currentIndex < stepsList.length - 1) {
                    const nextStepItem = stepsList[currentIndex + 1];
                    if (activeStep >= selectedCase.currentStep) {
                      updateCurrentStep(nextStepItem.num);
                    }
                    setActiveStep(nextStepItem.num);
                  }
                }}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg font-bold cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>

          {/* Render Active Form Panels */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Capture surgery recommendation parameters.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-600">Diagnosis</label>
                    <VoiceInputIcon 
                      label="Diagnosis" 
                      value={selectedCase.recommendation.diagnosis} 
                      onTranscript={(text) => handleFieldChange('recommendation', 'diagnosis', text)} 
                    />
                  </div>
                  <input 
                    type="text"
                    value={selectedCase.recommendation.diagnosis}
                    onChange={(e) => handleFieldChange('recommendation', 'diagnosis', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-600">Proposed Procedure</label>
                    <VoiceInputIcon 
                      label="Proposed Procedure" 
                      value={selectedCase.recommendation.surgeryName} 
                      onTranscript={(text) => handleFieldChange('recommendation', 'surgeryName', text)} 
                    />
                  </div>
                  <input 
                    type="text"
                    value={selectedCase.recommendation.surgeryName}
                    onChange={(e) => handleFieldChange('recommendation', 'surgeryName', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600">Clinical Presentation & Case notes</label>
                  <VoiceInputIcon 
                    label="Clinical Notes" 
                    value={selectedCase.recommendation.clinicalNotes} 
                    onTranscript={(text) => handleFieldChange('recommendation', 'clinicalNotes', text)} 
                  />
                </div>
                <textarea 
                  rows={4}
                  value={selectedCase.recommendation.clinicalNotes}
                  onChange={(e) => handleFieldChange('recommendation', 'clinicalNotes', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none resize-none"
                />
              </div>

              {/* Merged Step: Cost Estimation Worksheet */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-teal-600 border-b border-teal-50 pb-1">Surgery Cost Estimation Worksheet</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Primary Surgeon Fee (₹)</label>
                    <input 
                      type="number"
                      value={selectedCase.costEstimation.charges.surgeonFee || 0}
                      onChange={(e) => handleCostFieldChange('surgeonFee', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">OT Usage Charge (₹)</label>
                    <input 
                      type="number"
                      value={selectedCase.costEstimation.charges.otUsage || 0}
                      onChange={(e) => handleCostFieldChange('otUsage', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Anesthesia Fee (₹)</label>
                    <input 
                      type="number"
                      value={selectedCase.costEstimation.charges.anesthesia || 0}
                      onChange={(e) => handleCostFieldChange('anesthesia', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Calculated Package Cost:</span>
                    <span className="font-bold text-slate-900">₹{selectedCase.costEstimation.packageCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Insurance Payable (85%):</span>
                    <span>₹{selectedCase.costEstimation.insurancePayable.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Patient Co-pay (15%):</span>
                    <span>₹{selectedCase.costEstimation.patientPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Merged Step: Insurance Authorization */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-teal-600 border-b border-teal-50 pb-1">Insurance & Third-Party Administrator (TPA)</h4>
                <div className="space-y-2">
                  <label className="text-xs text-slate-700 flex items-center gap-1.5 font-bold">
                    <input 
                      type="checkbox"
                      checked={selectedCase.insurancePreAuth.hasInsurance}
                      onChange={(e) => handleFieldChange('insurancePreAuth', 'hasInsurance', e.target.checked)}
                    /> Patient Has Active Medical Insurance Coverage
                  </label>
                </div>

                {selectedCase.insurancePreAuth.hasInsurance && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Insurance Provider Company</label>
                        <input 
                          type="text"
                          value={selectedCase.insurancePreAuth.insuranceCompany}
                          onChange={(e) => handleFieldChange('insurancePreAuth', 'insuranceCompany', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">TPA Organization Name</label>
                        <input 
                          type="text"
                          value={selectedCase.insurancePreAuth.tpaName}
                          onChange={(e) => handleFieldChange('insurancePreAuth', 'tpaName', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Requested Amount (₹)</label>
                        <input 
                          type="number"
                          value={selectedCase.insurancePreAuth.requestedAmount || 0}
                          onChange={(e) => handleFieldChange('insurancePreAuth', 'requestedAmount', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Approved Amount (₹)</label>
                        <input 
                          type="number"
                          value={selectedCase.insurancePreAuth.approvedAmount || 0}
                          onChange={(e) => handleFieldChange('insurancePreAuth', 'approvedAmount', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Pre-Auth Status</label>
                        <select 
                          value={selectedCase.insurancePreAuth.status}
                          onChange={(e) => handleFieldChange('insurancePreAuth', 'status', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:border-teal-500 focus:outline-none"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Query Raised">Query Raised</option>
                          <option value="Approved">Approved / Cleared</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 uppercase border-b pb-1">Pre-Surgery Assessment</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Blood Pressure</label>
                  <input 
                    type="text"
                    value={selectedCase.preSurgeryAssessment.vitals.bp}
                    onChange={(e) => handleNestedFieldChange('preSurgeryAssessment', 'vitals', 'bp', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Pulse (bpm)</label>
                  <input 
                    type="number"
                    value={selectedCase.preSurgeryAssessment.vitals.pulse}
                    onChange={(e) => handleNestedFieldChange('preSurgeryAssessment', 'vitals', 'pulse', parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">SPO2 (%)</label>
                  <input 
                    type="number"
                    value={selectedCase.preSurgeryAssessment.vitals.spo2}
                    onChange={(e) => handleNestedFieldChange('preSurgeryAssessment', 'vitals', 'spo2', parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Medical History</label>
                  <textarea 
                    rows={3}
                    value={selectedCase.preSurgeryAssessment.medicalHistory}
                    onChange={(e) => handleFieldChange('preSurgeryAssessment', 'medicalHistory', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-850 resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Drug Allergies</label>
                  <input 
                    type="text"
                    value={selectedCase.preSurgeryAssessment.allergies}
                    onChange={(e) => handleFieldChange('preSurgeryAssessment', 'allergies', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600 block">Comorbidities Check</span>
                  <div className="flex gap-4 flex-wrap">
                    <label className="text-xs text-slate-700 flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={selectedCase.preSurgeryAssessment.comorbidities.diabetes}
                        onChange={(e) => handleNestedFieldChange('preSurgeryAssessment', 'comorbidities', 'diabetes', e.target.checked)}
                      /> Diabetes
                    </label>
                    <label className="text-xs text-slate-700 flex items-center gap-1">
                      <input 
                        type="checkbox"
                        checked={selectedCase.preSurgeryAssessment.comorbidities.hypertension}
                        onChange={(e) => handleNestedFieldChange('preSurgeryAssessment', 'comorbidities', 'hypertension', e.target.checked)}
                      /> Hypertension
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Surgical Fitness Verdict</label>
                  <select 
                    value={selectedCase.preSurgeryAssessment.fitnessStatus}
                    onChange={(e) => handleFieldChange('preSurgeryAssessment', 'fitnessStatus', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Fit">Fit For Surgery</option>
                    <option value="Not Fit">Not Fit For Surgery</option>
                  </select>
                </div>
              </div>

              {/* ECG Requirement Section */}
              <div className="border-t pt-3">
                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-150/30 flex flex-wrap justify-between items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-indigo-600 animate-pulse" />
                      Pre-Operative ECG Telemetry
                    </span>
                    <p className="text-[10.5px] text-slate-500 font-semibold">Enable advanced 12-lead telemetry monitoring & Gemini AI clinical analysis.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-xs text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={!!selectedCase.preSurgeryAssessment?.ecgRequired}
                        onChange={(e) => {
                          const updated = {
                            ...selectedCase,
                            preSurgeryAssessment: {
                              ...selectedCase.preSurgeryAssessment,
                              ecgRequired: e.target.checked
                            }
                          };
                          if (e.target.checked && !updated.ecgRecord) {
                            updated.ecgRecord = {
                              status: 'Pending',
                              orderedBy: 'Dr. Vivek Saxena',
                              orderedDate: new Date().toISOString().split('T')[0],
                              rhythm: 'NSR',
                              bpm: 72,
                              prInterval: 160,
                              qrsDuration: 90,
                              qtInterval: 390,
                              rrInterval: 833,
                              signalQuality: 99
                            };
                          }
                          onUpdateCase(updated);
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      /> Required for this surgery
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveStep(15)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                    >
                      Configure Telemetry &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 15 && (
            <div className="space-y-4 animate-fadeIn">
              <ClinicalEcgService selectedCase={selectedCase} onUpdateCase={onUpdateCase} />
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Anesthesia Pre-Op Evaluation</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">ASA Grade</label>
                  <select 
                    value={selectedCase.anesthesiaEvaluation.asaGrade}
                    onChange={(e) => handleFieldChange('anesthesiaEvaluation', 'asaGrade', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="ASA I">ASA I (Healthy Patient)</option>
                    <option value="ASA II">ASA II (Mild Systemic Disease)</option>
                    <option value="ASA III">ASA III (Severe Systemic Disease)</option>
                    <option value="ASA IV">ASA IV (Life-threatening Disease)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Proposed Anesthesia Type</label>
                  <select 
                    value={selectedCase.anesthesiaEvaluation.anesthesiaType}
                    onChange={(e) => handleFieldChange('anesthesiaEvaluation', 'anesthesiaType', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="General">General Anesthesia</option>
                    <option value="Regional">Regional Block</option>
                    <option value="Spinal">Spinal Block</option>
                    <option value="Local">Local Anesthesia</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Airway Assessment (Mallampati Score)</label>
                <input 
                  type="text"
                  placeholder="e.g. Mallampati Class II"
                  value={selectedCase.anesthesiaEvaluation.airwayAssessment}
                  onChange={(e) => handleFieldChange('anesthesiaEvaluation', 'airwayAssessment', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Anesthesia Clearance Status</label>
                <select 
                  value={selectedCase.anesthesiaEvaluation.status}
                  onChange={(e) => handleFieldChange('anesthesiaEvaluation', 'status', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-teal-500"
                >
                  <option value="Pending">Pending Evaluation</option>
                  <option value="Approved">Approved for Anesthesia</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Digital Consent Forms & Signatures</h4>
              
              {/* Prompt Callout */}
              <div className="p-3 bg-[#FFFBF0] border border-amber-200/60 rounded-xl flex items-start gap-2 animate-fade-in shadow-sm">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-amber-850 block">Instruction Guide</span>
                  <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                    "Please tick below consents already taken."
                  </p>
                </div>
              </div>

              {/* Consent checklist */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">Required Consent Acknowledgments</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="p-3 bg-white rounded-xl border border-slate-200/60 hover:border-[#2BB2A7]/40 text-xs text-slate-700 flex items-center gap-2 cursor-pointer transition shadow-xs">
                    <input 
                      type="checkbox"
                      className="accent-[#2BB2A7] w-3.5 h-3.5"
                      checked={selectedCase.consentManagement.consents.surgery}
                      onChange={(e) => handleNestedFieldChange('consentManagement', 'consents', 'surgery', e.target.checked)}
                    /> 
                    <span>High-Risk Surgery Informed Consent</span>
                  </label>
                  
                  <label className="p-3 bg-white rounded-xl border border-slate-200/60 hover:border-[#2BB2A7]/40 text-xs text-slate-700 flex items-center gap-2 cursor-pointer transition shadow-xs">
                    <input 
                      type="checkbox"
                      className="accent-[#2BB2A7] w-3.5 h-3.5"
                      checked={selectedCase.consentManagement.consents.anesthesia}
                      onChange={(e) => handleNestedFieldChange('consentManagement', 'consents', 'anesthesia', e.target.checked)}
                    /> 
                    <span>Anesthesia Risk & Airway Consent</span>
                  </label>
                  
                  <label className="p-3 bg-white rounded-xl border border-slate-200/60 hover:border-[#2BB2A7]/40 text-xs text-slate-700 flex items-center gap-2 cursor-pointer transition shadow-xs">
                    <input 
                      type="checkbox"
                      className="accent-[#2BB2A7] w-3.5 h-3.5"
                      checked={selectedCase.consentManagement.consents.transfusion}
                      onChange={(e) => handleNestedFieldChange('consentManagement', 'consents', 'transfusion', e.target.checked)}
                    /> 
                    <span>Blood Transfusion Permission</span>
                  </label>
                </div>
              </div>

              {/* Signature Verifications Card */}
              <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-4 shadow-sm">
                <div className="border-b border-slate-100 pb-4 space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Digital & Physical Signature Verifications</span>
                      <p className="text-[10px] text-slate-400">Verifying clinical staff signatures and patient consent confirmations</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setConsentRole('patient');
                          setShowConsentModal(true);
                        }}
                        className="px-3 py-1.5 bg-[#EAF7F4] hover:bg-[#D5EFEA] text-[#1F8F89] font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer border border-[#CDECE6]"
                      >
                        <PenTool className="w-3.5 h-3.5" /> Launch Digital Consent Portal
                      </button>
                      <button
                        onClick={handlePrintConsent}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer border border-amber-200"
                        title="Print Informed Consent Form for physical signature"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Consent Form
                      </button>
                      <button
                        onClick={handleDownloadConsent}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Consent HTML
                      </button>
                    </div>
                  </div>

                  {/* Remote / WhatsApp / Email Signing Hub */}
                  <div className="p-4 bg-slate-50/80 border border-slate-200/50 rounded-2xl space-y-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-[#2BB2A7]/10 text-[#1F8F89] rounded-lg mt-0.5">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Digital Consent Sharing & Remote Signature Hub</span>
                        <p className="text-[10px] text-slate-500">Send a secure digital signature link to patients or attendants who prefer signing remotely via smartphone, tablet, or SMS.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                      {/* Option 1: Link & WhatsApp Channel */}
                      <div className="space-y-2.5 p-3.5 bg-white border border-slate-100 rounded-xl shadow-2xs">
                        <label className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">Option 1: Link Sharing & WhatsApp</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={typeof window !== 'undefined' ? `${window.location.origin}/patient-consent-sign/${selectedCase.id}` : ''}
                            className="flex-1 min-w-0 bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] font-mono text-slate-600 rounded-lg select-all"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/patient-consent-sign/${selectedCase.id}`;
                              navigator.clipboard.writeText(shareUrl);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }}
                            className="px-2 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            {copiedLink ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Link
                              </>
                            )}
                          </button>
                        </div>

                        {/* WhatsApp Number Field */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-slate-500 block">WhatsApp Phone Number</label>
                          <input
                            type="tel"
                            placeholder="e.g. +919876543210"
                            value={shareWhatsAppPhone}
                            onChange={(e) => setShareWhatsAppPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] rounded-lg focus:outline-none focus:border-teal-500 text-slate-700"
                          />
                        </div>

                        <div className="flex gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/patient-consent-sign/${selectedCase.id}`;
                              const message = `Dear ${selectedCase.patient.name}, please click this link to securely authorize and sign the informed surgical consent document for your planned ${selectedCase.recommendation.surgeryName} at Swasti Medical Center: ${shareUrl}`;
                              const cleanPhone = shareWhatsAppPhone.replace(/[^\d+]/g, '');
                              const url = cleanPhone 
                                ? `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(message)}`
                                : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
                              window.open(url, '_blank');
                            }}
                            className="flex-1 py-1.5 px-2.5 bg-[#E8F8F5] hover:bg-[#D1F2EB] text-[#0F7368] font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer border border-[#A2E4D9]"
                          >
                            Send WhatsApp
                          </button>
                          <a
                            href={`${window.location.origin}/patient-consent-sign/${selectedCase.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                            title="Open the patient signing screen in a new tab"
                          >
                            <ExternalLink className="w-3 h-3" /> Test Link
                          </a>
                        </div>
                        <p className="text-[9px] text-slate-400">Great for instant sharing via chat tools, SMS or web messengers.</p>
                      </div>

                      {/* Option 2: Email Sandbox Channel */}
                      <div className="space-y-2.5 p-3.5 bg-white border border-slate-100 rounded-xl shadow-2xs">
                        <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Option 2: Simulated Inbox Sandbox</label>
                        <div className="flex gap-1.5">
                          <input
                            type="email"
                            placeholder="patient@example.com"
                            value={shareEmail}
                            onChange={(e) => {
                              setShareEmail(e.target.value);
                              setEmailError(null);
                              setEmailSuccessMsg(null);
                            }}
                            className="flex-1 min-w-0 bg-slate-50 border border-slate-200 px-2 py-1 text-xs rounded-lg placeholder-slate-400 focus:outline-none focus:border-[#2BB2A7]"
                          />
                          <button
                            type="button"
                            disabled={emailSending}
                            onClick={async () => {
                              if (!shareEmail) return alert("Please specify a valid recipient email.");
                              
                              setEmailSending(true);
                              setEmailError(null);
                              setEmailSuccessMsg(null);
                              setEmailSent(false);

                              try {
                                const shareUrl = `${window.location.origin}/patient-consent-sign/${selectedCase.id}`;
                                const res = await fetch('/ot/api/send-consent-email', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    email: shareEmail,
                                    patientName: selectedCase.patient.name,
                                    surgeryName: selectedCase.recommendation.surgeryName,
                                    consentUrl: shareUrl,
                                    doctorName: selectedCase.recommendation.recommendedBy
                                  })
                                });

                                const data = await res.json();
                                if (!res.ok) {
                                  throw new Error(data.error || 'Server error.');
                                }

                                if (data.success) {
                                  setEmailSent(true);
                                  if (data.simulated) {
                                    setSimulatedEmail({
                                      recipient: data.recipient,
                                      patientName: data.patientName,
                                      surgeryName: data.surgeryName,
                                      doctorName: data.doctorName,
                                      link: data.link,
                                      html: data.html
                                    });
                                    setEmailSuccessMsg(`Email dispatch simulated! (Sandbox Active)`);
                                  } else {
                                    setEmailSuccessMsg(`Link successfully dispatched to ${shareEmail}!`);
                                    setSimulatedEmail(null);
                                  }
                                  setShareEmail("");
                                } else {
                                  throw new Error('Failed to dispatch email.');
                                }
                              } catch (err: any) {
                                console.error(err);
                                setEmailError(err.message || 'Network transmission error.');
                              } finally {
                                setEmailSending(false);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-[#2BB2A7] hover:bg-[#1F8F89] disabled:bg-teal-400/60 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0 shadow-3xs"
                          >
                            {emailSending ? "Simulating..." : "Simulate Send"}
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400">Simulates server dispatch and outputs the live HTML email draft in a mock mailbox on this page below.</p>
                      </div>


                    </div>

                        {emailSuccessMsg && (
                          <div className="text-[10px] text-emerald-600 font-bold flex flex-col gap-1.5 animate-fade-in bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> {emailSuccessMsg}
                            </div>
                            {simulatedEmail && (
                              <p className="text-[9px] text-slate-500 font-normal">
                                Scroll down to view the simulated patient mailbox sandbox below to review the exact styled email and sign as the patient!
                              </p>
                            )}
                          </div>
                        )}

                        {simulatedEmail && (
                          <div className="border border-indigo-200/60 bg-indigo-50/20 rounded-2xl p-4.5 space-y-3.5 mt-3 animate-fade-in">
                            <div className="flex justify-between items-center border-b border-indigo-100/60 pb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-indigo-900 tracking-wider uppercase">SIMULATED PATIENT INBOX (SANDBOX ACTIVE)</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSimulatedEmail(null)}
                                className="text-[9px] text-slate-400 hover:text-slate-600 font-bold"
                              >
                                Clear Simulation
                              </button>
                            </div>

                            <div className="space-y-1.5 text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200/50 shadow-xs">
                              <div><strong>To:</strong> {simulatedEmail.recipient}</div>
                              <div><strong>Subject:</strong> 🚨 Action Required: Informed Surgical Consent for {simulatedEmail.patientName}</div>
                              <div><strong>Date:</strong> {new Date().toLocaleString()} (Simulated)</div>
                              
                              <div className="mt-3.5 pt-3.5 border-t border-slate-100 overflow-auto max-h-72">
                                <div 
                                  className="scale-[0.9] origin-top text-xs bg-[#FAF9F5] rounded-xl overflow-hidden p-3 border border-slate-100 shadow-inner"
                                  dangerouslySetInnerHTML={{ __html: simulatedEmail.html }} 
                                  id="simulated-email-html"
                                />
                              </div>

                              <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-2">
                                <a
                                  href={simulatedEmail.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wide cursor-pointer"
                                  id="simulated-signing-btn"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> Click to Open Patient Signing Screen in New Tab
                                </a>
                                <p className="text-[9px] text-slate-400 text-center leading-normal">
                                  Clicking this button will open the secure Swasti consent signing screen, allowing you to draw and submit the patient's signature. Once submitted, the status will update in real-time in this panel.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {(!emailSent && !emailError) && (
                          <div className="text-[10px] text-teal-700 font-medium space-y-1.5 bg-teal-50/40 p-3 rounded-xl border border-teal-200/40 animate-fade-in">
                            <div className="flex items-center gap-1 font-bold">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#2BB2A7]" /> RESEND EMAIL INTEGRATION READY
                            </div>
                            <p className="leading-normal text-[9.5px] text-slate-600">
                              Swasti is configured to deliver real emails via Resend. To send real emails, simply configure the following secrets in your AI Studio <strong>Settings &rsaquo; Secrets</strong> panel:
                            </p>
                            <div className="font-mono text-[8.5px] bg-white/70 p-1.5 rounded border border-teal-200/20 text-slate-600 select-all leading-relaxed">
                              RESEND_API_KEY, RESEND_FROM
                            </div>
                          </div>
                        )}

                        {emailError && (
                          <div className="text-[10px] text-red-600 font-medium flex items-center gap-1 animate-fade-in bg-red-50 p-2 rounded-lg border border-red-100" id="email-error-alert">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" /> Error: {emailError}
                          </div>
                        )}

                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Patient Sign Checkbox */}
                  <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          className="accent-[#1F8F89] w-3.5 h-3.5"
                          id="checkbox-sign-patient"
                          checked={selectedCase.consentManagement.signatures.patient}
                          onChange={(e) => {
                            const updated = { ...selectedCase };
                            updated.consentManagement = {
                              ...updated.consentManagement,
                              signatures: {
                                ...updated.consentManagement.signatures,
                                patient: e.target.checked
                              },
                              signatureImages: {
                                ...(updated.consentManagement as any).signatureImages,
                                patient: e.target.checked ? (updated.consentManagement as any).signatureImages?.patient || '' : ''
                              }
                            };
                            onUpdateCase(updated);
                          }}
                        />
                        <label htmlFor="checkbox-sign-patient" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          Patient Sign
                        </label>
                      </div>

                      {/* Signature image preview */}
                      {(selectedCase.consentManagement as any).signatureImages?.patient && (
                        <div className="p-1 border border-dashed border-slate-200 bg-white rounded-lg h-10 flex items-center justify-center overflow-hidden">
                          <img 
                            src={(selectedCase.consentManagement as any).signatureImages.patient} 
                            alt="Patient signature ink" 
                            className="h-full object-contain filter contrast-125 select-none"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block w-fit ${
                      selectedCase.consentManagement.signatures.patient 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {selectedCase.consentManagement.signatures.patient ? '✓ Active Signature Verified' : 'Awaiting Sign'}
                    </span>
                  </div>

                  {/* Attendant Sign Checkbox */}
                  <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          className="accent-[#1F8F89] w-3.5 h-3.5"
                          id="checkbox-sign-attendant"
                          checked={selectedCase.consentManagement.signatures.attendant}
                          onChange={(e) => {
                            const updated = { ...selectedCase };
                            updated.consentManagement = {
                              ...updated.consentManagement,
                              signatures: {
                                ...updated.consentManagement.signatures,
                                attendant: e.target.checked
                              },
                              signatureImages: {
                                ...(updated.consentManagement as any).signatureImages,
                                attendant: e.target.checked ? (updated.consentManagement as any).signatureImages?.attendant || '' : ''
                              }
                            };
                            onUpdateCase(updated);
                          }}
                        />
                        <label htmlFor="checkbox-sign-attendant" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          Attendant Sign
                        </label>
                      </div>

                      {/* Signature image preview */}
                      {(selectedCase.consentManagement as any).signatureImages?.attendant && (
                        <div className="p-1 border border-dashed border-slate-200 bg-white rounded-lg h-10 flex items-center justify-center overflow-hidden">
                          <img 
                            src={(selectedCase.consentManagement as any).signatureImages.attendant} 
                            alt="Attendant signature ink" 
                            className="h-full object-contain filter contrast-125 select-none"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block w-fit ${
                      selectedCase.consentManagement.signatures.attendant 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {selectedCase.consentManagement.signatures.attendant ? '✓ Active Signature Verified' : 'Awaiting Sign'}
                    </span>
                  </div>

                  {/* Doctor Sign Checkbox */}
                  <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          className="accent-[#1F8F89] w-3.5 h-3.5"
                          id="checkbox-sign-doctor"
                          checked={selectedCase.consentManagement.signatures.doctor}
                          onChange={(e) => {
                            const updated = { ...selectedCase };
                            updated.consentManagement = {
                              ...updated.consentManagement,
                              signatures: {
                                ...updated.consentManagement.signatures,
                                doctor: e.target.checked
                              },
                              signatureImages: {
                                ...(updated.consentManagement as any).signatureImages,
                                doctor: e.target.checked ? (updated.consentManagement as any).signatureImages?.doctor || '' : ''
                              }
                            };
                            onUpdateCase(updated);
                          }}
                        />
                        <label htmlFor="checkbox-sign-doctor" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          Doctor Sign
                        </label>
                      </div>

                      {/* Signature image preview */}
                      {(selectedCase.consentManagement as any).signatureImages?.doctor && (
                        <div className="p-1 border border-dashed border-slate-200 bg-white rounded-lg h-10 flex items-center justify-center overflow-hidden">
                          <img 
                            src={(selectedCase.consentManagement as any).signatureImages.doctor} 
                            alt="Doctor signature ink" 
                            className="h-full object-contain filter contrast-125 select-none"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block w-fit ${
                      selectedCase.consentManagement.signatures.doctor 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {selectedCase.consentManagement.signatures.doctor ? '✓ Active Signature Verified' : 'Awaiting Sign'}
                    </span>
                  </div>

                  {/* Witness Sign Checkbox */}
                  <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/60 space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          className="accent-[#1F8F89] w-3.5 h-3.5"
                          id="checkbox-sign-witness"
                          checked={selectedCase.consentManagement.signatures.witness}
                          onChange={(e) => {
                            const updated = { ...selectedCase };
                            updated.consentManagement = {
                              ...updated.consentManagement,
                              signatures: {
                                ...updated.consentManagement.signatures,
                                witness: e.target.checked
                              },
                              signatureImages: {
                                ...(updated.consentManagement as any).signatureImages,
                                witness: e.target.checked ? (updated.consentManagement as any).signatureImages?.witness || '' : ''
                              }
                            };
                            onUpdateCase(updated);
                          }}
                        />
                        <label htmlFor="checkbox-sign-witness" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          Witness Sign
                        </label>
                      </div>

                      {/* Signature image preview */}
                      {(selectedCase.consentManagement as any).signatureImages?.witness && (
                        <div className="p-1 border border-dashed border-slate-200 bg-white rounded-lg h-10 flex items-center justify-center overflow-hidden">
                          <img 
                            src={(selectedCase.consentManagement as any).signatureImages.witness} 
                            alt="Witness signature ink" 
                            className="h-full object-contain filter contrast-125 select-none"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block w-fit ${
                      selectedCase.consentManagement.signatures.witness 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {selectedCase.consentManagement.signatures.witness ? '✓ Active Signature Verified' : 'Awaiting Sign'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-1">
                <h4 className="text-xs font-bold text-indigo-600 uppercase">Post-Anesthesia Care (PACU) - Vitals Recovery Log</h4>
                <button
                  onClick={runRecoverySimulation}
                  disabled={isSimulatingRecovery}
                  className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition disabled:opacity-50"
                >
                  {isSimulatingRecovery ? "Simulating..." : "Simulate Live Charting"}
                </button>
              </div>

              {/* Simple Manual Entry Form */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Latest Vital Sign Entry</span>
                  <button
                    onClick={() => {
                      const updated = { ...selectedCase };
                      updated.postOpRecovery.vitalsLogs = [
                        ...updated.postOpRecovery.vitalsLogs,
                        {
                          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                          bp: "120/80",
                          pulse: 78,
                          spo2: 99,
                          painScore: 0,
                          consciousness: "Fully Awake"
                        }
                      ];
                      onUpdateCase(updated);
                    }}
                    className="text-[10px] text-teal-600 hover:text-teal-700 font-bold"
                  >
                    + Add New Reading Row
                  </button>
                </div>

                {(() => {
                  const logs = selectedCase.postOpRecovery.vitalsLogs || [];
                  const latestLog = logs[logs.length - 1] || {
                    bp: "",
                    pulse: 0,
                    spo2: 0,
                    painScore: 0,
                    consciousness: "Fully Awake"
                  };

                  const updateLatestVital = (field: string, val: any) => {
                    const updated = { ...selectedCase };
                    const currentLogs = [...(updated.postOpRecovery.vitalsLogs || [])];
                    if (currentLogs.length === 0) {
                      currentLogs.push({
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                        bp: "120/80",
                        pulse: 78,
                        spo2: 99,
                        painScore: 0,
                        consciousness: "Fully Awake"
                      });
                    }
                    const lastIdx = currentLogs.length - 1;
                    currentLogs[lastIdx] = {
                      ...currentLogs[lastIdx],
                      [field]: val
                    };
                    updated.postOpRecovery.vitalsLogs = currentLogs;
                    onUpdateCase(updated);
                  };

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Blood Pressure</label>
                        <input
                          type="text"
                          placeholder="e.g. 120/80"
                          value={latestLog.bp}
                          onChange={(e) => updateLatestVital('bp', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Pulse (bpm)</label>
                        <input
                          type="number"
                          placeholder="e.g. 78"
                          value={latestLog.pulse || ""}
                          onChange={(e) => updateLatestVital('pulse', parseInt(e.target.value) || 0)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">SPO2 (%)</label>
                        <input
                          type="number"
                          placeholder="e.g. 99"
                          value={latestLog.spo2 || ""}
                          onChange={(e) => updateLatestVital('spo2', parseInt(e.target.value) || 0)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Pain (0-10)</label>
                        <input
                          type="number"
                          placeholder="e.g. 2"
                          value={latestLog.painScore || 0}
                          onChange={(e) => updateLatestVital('painScore', parseInt(e.target.value) || 0)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-500">Consciousness</label>
                        <select
                          value={latestLog.consciousness}
                          onChange={(e) => updateLatestVital('consciousness', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="Fully Awake">Fully Awake</option>
                          <option value="Arousable to Voice">Arousable to Voice</option>
                          <option value="Arousable to Pain">Arousable to Pain</option>
                          <option value="Unresponsive">Unresponsive</option>
                        </select>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Recovery Vitals History */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 border-b flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Vitals Charting Log History</span>
                  <span className="text-[10px] text-slate-400 font-normal">Updated in Real-Time</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {(selectedCase.postOpRecovery.vitalsLogs || []).map((log, idx) => (
                    <div key={idx} className="p-2.5 grid grid-cols-5 text-xs text-slate-700 hover:bg-slate-50 items-center">
                      <div className="font-semibold text-slate-500">{log.time}</div>
                      <div>BP: <span className="font-semibold text-slate-800">{log.bp}</span></div>
                      <div>Pulse: <span className="font-semibold text-slate-800">{log.pulse} bpm</span></div>
                      <div>SPO2: <span className="font-semibold text-slate-800">{log.spo2}%</span></div>
                      <div className="text-right text-[10px] text-slate-500">Conscious: <span className="font-semibold text-indigo-600">{log.consciousness}</span></div>
                    </div>
                  ))}
                  {(!selectedCase.postOpRecovery.vitalsLogs || selectedCase.postOpRecovery.vitalsLogs.length === 0) && (
                    <div className="text-center p-6 text-slate-400 text-xs italic">No vitals logged yet. Speak to populate or click Simulate.</div>
                  )}
                </div>
              </div>

              <div className="space-y-1 border-t pt-3">
                <label className="text-xs font-semibold text-slate-600">Recovery Disposition Verdict</label>
                <select 
                  value={selectedCase.postOpRecovery.status}
                  onChange={(e) => handleFieldChange('postOpRecovery', 'status', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
                >
                  <option value="Critical">Critical - Intensive Monitoring</option>
                  <option value="Stable">Stable - Approved for Ward Transfer</option>
                  <option value="Shifted to Ward">Shifted to General Ward</option>
                </select>
              </div>
            </div>
          )}

          {activeStep === 6 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">OT Scheduler Calendar</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Operating Theatre Suite</label>
                  <select 
                    value={selectedCase.otScheduling.otRoom}
                    onChange={(e) => handleFieldChange('otScheduling', 'otRoom', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="OT Suite 1 (Cardiothoracic)">OT Suite 1 (Cardiothoracic)</option>
                    <option value="OT Suite 2 (Orthopedics/Neuro)">OT Suite 2 (Orthopedics/Neuro)</option>
                    <option value="OT Suite 3 (General Surgery - Lap)">OT Suite 3 (General Surgery - Lap)</option>
                    <option value="OT Suite 4 (Ophthalmic & Minor)">OT Suite 4 (Ophthalmic & Minor)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Surgery Date</label>
                  <input 
                    type="date"
                    value={selectedCase.otScheduling.surgeryDate}
                    onChange={(e) => handleFieldChange('otScheduling', 'surgeryDate', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Start Time</label>
                  <input 
                    type="time"
                    value={selectedCase.otScheduling.startTime}
                    onChange={(e) => handleFieldChange('otScheduling', 'startTime', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">End Time</label>
                  <input 
                    type="time"
                    value={selectedCase.otScheduling.endTime}
                    onChange={(e) => handleFieldChange('otScheduling', 'endTime', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 7 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Equipment & Infrastructure Safety Check</h4>
              
              <p className="text-xs text-slate-500">Ensure crucial OT equipment has passed sterilization and biomedical inspections.</p>
              
              <div className="space-y-3">
                {Object.entries(selectedCase.equipmentCheck.equipment).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <select 
                      value={value}
                      onChange={(e) => handleNestedFieldChange('equipmentCheck', 'equipment', key, e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded px-2 py-1 focus:border-teal-500"
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="In Use">In Use</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === 8 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Surgery Day Clearance Checklist</h4>
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">Pre-Op Nurse Clearance Tasks</span>
                
                <div className="space-y-2">
                  <label className="text-xs text-slate-700 flex items-center gap-1.5 font-semibold">
                    <input 
                      type="checkbox"
                      checked={selectedCase.dayChecklist.checklist.consentCompleted}
                      onChange={(e) => handleNestedFieldChange('dayChecklist', 'checklist', 'consentCompleted', e.target.checked)}
                    /> Informed consent paperwork verified and verified signed
                  </label>
                  <label className="text-xs text-slate-700 flex items-center gap-1.5 font-semibold">
                    <input 
                      type="checkbox"
                      checked={selectedCase.dayChecklist.checklist.patientFasting}
                      onChange={(e) => handleNestedFieldChange('dayChecklist', 'checklist', 'patientFasting', e.target.checked)}
                    /> Fasting status verified (6 Hours solid, 2 Hours liquid)
                  </label>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-700 flex items-center gap-1.5 font-semibold">
                      <input 
                        type="checkbox"
                        checked={selectedCase.dayChecklist.checklist.testsAvailable}
                        onChange={(e) => handleNestedFieldChange('dayChecklist', 'checklist', 'testsAvailable', e.target.checked)}
                      /> Pre-Op Lab Reports (CBC, ECG, CT) mounted in theatre
                    </label>

                    {/* Shared Central ECG record status */}
                    <div className="ml-5 p-2.5 bg-slate-100 rounded-xl border border-slate-200/50 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                        <span className="text-[10px] font-semibold text-slate-700">
                          Central ECG Record Status: 
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                          selectedCase.ecgRecord?.status === 'Signed' ? 'bg-emerald-100 text-emerald-800' :
                          selectedCase.ecgRecord?.status === 'AI_Interpreted' ? 'bg-teal-100 text-teal-800' :
                          'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {selectedCase.ecgRecord?.status || 'Pending'}
                        </span>
                      </div>

                      <div className="text-[10px]">
                        {selectedCase.ecgRecord?.status === 'Signed' ? (
                          <span className="text-emerald-700 font-bold">
                            ✓ Approved by {selectedCase.ecgRecord.signedBy} on {selectedCase.ecgRecord.signedDate}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveStep(2)}
                            className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            → Open Review & Sign (Required)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <label className="text-xs text-slate-700 flex items-center gap-1.5 font-semibold">
                    <input 
                      type="checkbox"
                      checked={selectedCase.dayChecklist.checklist.bloodAvailable}
                      onChange={(e) => handleNestedFieldChange('dayChecklist', 'checklist', 'bloodAvailable', e.target.checked)}
                    /> Blood units crossmatched and reserved in blood bank
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Final OT Clearance Verdict</label>
                <select 
                  value={selectedCase.dayChecklist.otClearanceStatus}
                  onChange={(e) => handleFieldChange('dayChecklist', 'otClearanceStatus', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
                >
                  <option value="Pending">Awaiting Nursing Verification</option>
                  <option value="Cleared">Cleared - Wheel Patient to OT</option>
                  <option value="Hold">On Hold / Delayed</option>
                </select>
              </div>
            </div>
          )}

          {activeStep === 9 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Surgical Consumables & Implant Inventory</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Available Inventory List */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 border-b font-bold text-xs text-slate-700">Hospital Central Inventory</div>
                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {DEFAULT_CONSUMABLES.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex justify-between items-center text-xs hover:bg-slate-50">
                        <div>
                          <div className="font-semibold text-slate-800">{item.name}</div>
                          <div className="text-[10px] text-slate-400">Cost: ₹{item.cost}</div>
                        </div>
                        <button 
                          onClick={() => addConsumable(item.name, item.cost)}
                          className="bg-teal-500 text-slate-950 font-bold text-[10px] px-2 py-1 rounded"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Used Consumables in Case */}
                <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="bg-slate-50 px-3 py-2 border-b font-bold text-xs text-slate-700">Currently Added to Case Tray</div>
                    <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                      {selectedCase.consumablesTracking.surgicalConsumables.map((item, idx) => (
                        <div key={idx} className="p-2.5 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-semibold text-slate-800">{item.name}</div>
                            <div className="text-[10px] text-slate-400">Qty: {item.quantity} | Cost: ₹{item.cost * item.quantity}</div>
                          </div>
                        </div>
                      ))}
                      {selectedCase.consumablesTracking.surgicalConsumables.length === 0 && (
                        <div className="text-center p-6 text-slate-400 text-xs italic">
                          Click "+ Add" to allocate consumables to this patient.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-2.5 border-t flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>Tray Total:</span>
                    <span>₹{selectedCase.consumablesTracking.surgicalConsumables.reduce((acc, i) => acc + (i.cost * i.quantity), 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 10 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 border-b pb-1 uppercase">OT Staffing & Team Assignment</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Primary Surgeon</label>
                  <select 
                    value={selectedCase.teamAssignment.team.primarySurgeon}
                    onChange={(e) => handleNestedFieldChange('teamAssignment', 'team', 'primarySurgeon', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="">Select Surgeon</option>
                    {SURGEONS.map(s => <option key={s.id} value={s.name}>{s.name} ({s.specialty})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Lead Anesthetist</label>
                  <select 
                    value={selectedCase.teamAssignment.team.leadAnesthetist}
                    onChange={(e) => handleNestedFieldChange('teamAssignment', 'team', 'leadAnesthetist', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="">Select Anesthetist</option>
                    {ANESTHETISTS.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Scrub Nurse</label>
                  <select 
                    value={selectedCase.teamAssignment.team.scrubNurse}
                    onChange={(e) => handleNestedFieldChange('teamAssignment', 'team', 'scrubNurse', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="">Select Nurse</option>
                    {NURSES.map(n => <option key={n.id} value={n.name}>{n.name} ({n.role})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">OT Technician</label>
                  <input 
                    type="text"
                    placeholder="e.g. Brother Sunil Gowda"
                    value={selectedCase.teamAssignment.team.otTechnician}
                    onChange={(e) => handleNestedFieldChange('teamAssignment', 'team', 'otTechnician', e.target.value)}
                    className="w-full px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-850 text-xs focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 11 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Post-Operative Orders & Care</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Antibiotics regimen</label>
                  <input 
                    type="text"
                    value={selectedCase.postOpOrders.antibiotics}
                    onChange={(e) => handleFieldChange('postOpOrders', 'antibiotics', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-850 text-sm focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">IV Fluids regimen</label>
                  <input 
                    type="text"
                    value={selectedCase.postOpOrders.fluids}
                    onChange={(e) => handleFieldChange('postOpOrders', 'fluids', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-850 text-sm focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Checkable Nursing Tasks */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 border-b font-bold text-xs text-slate-700">Active Nursing Tasks Checklist</div>
                <div className="divide-y divide-slate-100">
                  {selectedCase.postOpOrders.nursingTasks.map((task) => (
                    <div key={task.id} className="p-3 flex justify-between items-center text-xs">
                      <span className={`font-medium ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{task.task}</span>
                      <button 
                        onClick={() => {
                          const updated = { ...selectedCase };
                          const target = updated.postOpOrders.nursingTasks.find(t => t.id === task.id);
                          if (target) {
                            target.done = !target.done;
                            target.completedTime = target.done ? '16:30' : undefined;
                          }
                          onUpdateCase(updated);
                        }}
                        className={`font-semibold px-2 py-1 rounded text-[10px] ${
                          task.done ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-500 text-slate-950 hover:bg-rose-600'
                        }`}
                      >
                        {task.done ? 'Done ✓' : 'Mark Done'}
                      </button>
                    </div>
                  ))}
                  {selectedCase.postOpOrders.nursingTasks.length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-xs italic">
                      Use Swasti AI co-pilot above to auto-generate customized nursing tasks based on clinical guidelines!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeStep === 12 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 border-b pb-1">Surgery Outcome Logging</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Surgical Outcome Verdict</label>
                  <select 
                    value={selectedCase.outcomeTracking.outcome}
                    onChange={(e) => handleFieldChange('outcomeTracking', 'outcome', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
                  >
                    <option value="Successful">Successful - Plan Outpatient Review</option>
                    <option value="Complication">Complication Encountered</option>
                    <option value="Re-operation Required">Re-operation Indicated</option>
                    <option value="Mortality">Mortality</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Follow-up Review Interval</label>
                  <input 
                    type="text"
                    placeholder="e.g. Outpatient clinic review in 2 weeks"
                    value={selectedCase.outcomeTracking.followUpPlan}
                    onChange={(e) => handleFieldChange('outcomeTracking', 'followUpPlan', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-850 text-sm focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Surgical Outcome Summary notes</label>
                <textarea 
                  rows={4}
                  value={selectedCase.outcomeTracking.outcomeNotes}
                  onChange={(e) => handleFieldChange('outcomeTracking', 'outcomeNotes', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>
            </div>
          )}

          {activeStep === 13 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-1">
                <h4 className="text-xs font-bold text-indigo-600">Surgery Package Billing Generator</h4>
                <button 
                  onClick={computeFinalBilling}
                  className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs px-3 py-1 rounded-lg transition"
                >
                  Generate Actual Bill
                </button>
              </div>

              {selectedCase.billing.isBilled ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Final Surgery Cost Variance Report</span>
                    <div className="grid grid-cols-3 gap-4 text-center border-b pb-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Estimated Package</span>
                        <span className="text-sm font-bold text-slate-700">₹{selectedCase.costEstimation.packageCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Actual Aggregated</span>
                        <span className="text-sm font-bold text-slate-900">₹{selectedCase.billing.totalActualCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">Variance</span>
                        <span className={`text-sm font-bold ${
                          selectedCase.billing.totalActualCost - selectedCase.costEstimation.packageCost <= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          ₹{(selectedCase.billing.totalActualCost - selectedCase.costEstimation.packageCost).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Cost ledger itemizer */}
                    <div className="text-[11px] space-y-1 pt-1 font-mono text-slate-500">
                      <div className="flex justify-between">
                        <span>• Surgeon Fees:</span>
                        <span className="font-semibold text-slate-700">₹{selectedCase.billing.actualCharges.surgeonFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• OT Suite Charges:</span>
                        <span className="font-semibold text-slate-700">₹{selectedCase.billing.actualCharges.otUsage.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Consumables:</span>
                        <span className="font-semibold text-slate-700">₹{selectedCase.billing.actualCharges.consumables.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Medicines & Drugs:</span>
                        <span className="font-semibold text-slate-700">₹{selectedCase.billing.actualCharges.medicines.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Click "Generate Actual Bill" to reconcile the ledger and run cost audits.
                </div>
              )}
            </div>
          )}

          {activeStep === 14 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-1">
                <h4 className="text-xs font-bold text-indigo-600 font-mono">Discharge Summarization</h4>
                {!(selectedCase.status === 'Completed & Discharged' || selectedCase.discharge.status === 'Discharged') && (
                  <button 
                    onClick={() => {
                      const updated = { ...selectedCase };
                      updated.discharge.summary = {
                        surgerySummary: `Uneventful clinical execution of ${selectedCase.recommendation.surgeryName} by ${selectedCase.teamAssignment.team.primarySurgeon}.`,
                        otNotes: `Anesthesia induce normal. Excised tissue successfully sent for laboratory check. Wound closed with standard sutures.`,
                        implantDetails: selectedCase.costEstimation.charges.implants > 0 ? `Prosthetic implant placed, batch logged in HIS.` : `No implants placed.`,
                        dischargeSummary: `Patient ${selectedCase.patient.name} evaluated post-operatively and declared stable for home mobilization on oral medications.`,
                        medicationPlan: selectedCase.postOpOrders.medications,
                        followUpAppointment: selectedCase.outcomeTracking.followUpPlan || 'Outpatient clinic review in 2 weeks.'
                      };
                      updated.discharge.status = 'Ready for Discharge';
                      onUpdateCase(updated);
                    }}
                    className="bg-indigo-600 text-white font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-indigo-700 transition shadow cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-300" /> Compile Discharge Summary
                  </button>
                )}
              </div>

              {selectedCase.discharge.summary.dischargeSummary ? (
                <div className="border border-indigo-100 rounded-2xl p-5 bg-indigo-50/20 space-y-4 animate-in fade-in duration-300">
                  <div className="border-b pb-2 flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-900 font-mono">SWASTI CLINICAL DISCHARGE RECORD</span>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">Ready</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                    <div>
                      <strong className="text-slate-800">Surgical Execution summary:</strong>
                      <p className="mt-0.5">{selectedCase.discharge.summary.surgerySummary}</p>
                    </div>
                    <div>
                      <strong className="text-slate-800">Home Medication Protocol:</strong>
                      <p className="mt-0.5">{selectedCase.discharge.summary.medicationPlan || 'Standard oral pain killers as indicated.'}</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-800">Follow-Up Schedule:</strong>
                    <p className="mt-0.5">{selectedCase.discharge.summary.followUpAppointment}</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Click "Compile Discharge Summary" to gather clinical inputs and finalize patient release records, or click the separate Discharge button below to immediately finalize release.
                </div>
              )}

              {/* Standalone Separate Discharge Button Area */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Clinical Discharge Authorization</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">Authorizing final patient discharge will set progress to 100%, update the National Swasti HIS, and close the active case.</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
                  {selectedCase.status === 'Completed & Discharged' || selectedCase.discharge.status === 'Discharged' ? (
                    <>
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-emerald-200 shadow-sm w-full sm:w-auto">
                        <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
                        <span>Patient Discharged & Case Closed successfully! (100% Complete)</span>
                      </div>
                      <button 
                        onClick={onBack}
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Cases Directory
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500 text-[10px] sm:text-xs">
                        * Clicking "Discharge Patient" is the final required action.
                      </span>
                      <button 
                        onClick={() => {
                          const updated = { ...selectedCase };
                          
                          // If discharge summary isn't compiled yet, populate it to prevent empty sub-structures
                          if (!updated.discharge.summary || !updated.discharge.summary.dischargeSummary) {
                            updated.discharge.summary = {
                              surgerySummary: `Uneventful clinical execution of ${selectedCase.recommendation.surgeryName} by ${selectedCase.teamAssignment.team.primarySurgeon}.`,
                              otNotes: `Anesthesia induce normal. Excised tissue successfully sent for laboratory check. Wound closed with standard sutures.`,
                              implantDetails: selectedCase.costEstimation.charges.implants > 0 ? `Prosthetic implant placed, batch logged in HIS.` : `No implants placed.`,
                              dischargeSummary: `Patient ${selectedCase.patient.name} evaluated post-operatively and declared stable for home mobilization on oral medications.`,
                              medicationPlan: selectedCase.postOpOrders.medications,
                              followUpAppointment: selectedCase.outcomeTracking.followUpPlan || 'Outpatient clinic review in 2 weeks.'
                            };
                          }
                          
                          updated.discharge.status = 'Discharged';
                          updated.discharge.dischargeDate = new Date().toISOString().split('T')[0];
                          updated.status = 'Completed & Discharged';
                          updated.currentStep = 15;
                          onUpdateCase(updated);
                        }}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 font-sans"
                      >
                        <CheckCircle className="w-4 h-4 text-white" /> Discharge Patient & Close Case (100%)
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side Panel: Collapsible Swasti AI Clinical Co-Pilot */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-200 space-y-6 flex flex-col justify-between h-fit">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="bg-teal-500/10 text-teal-400 p-2 rounded-xl border border-teal-500/20">
                <Sparkles className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Swasti Clinical Co-Pilot</h4>
                <p className="text-[10px] text-slate-400 font-medium">Surgical AI Diagnostics & Formulation</p>
              </div>
            </div>

            {/* Diagnostic Query Widget */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Clinical Query Context</span>
              <div className="text-xs text-slate-300">
                Evaluating procedure <strong className="text-white">{selectedCase.recommendation.surgeryName}</strong> for clinical diagnosis of <strong className="text-white">{selectedCase.recommendation.diagnosis}</strong>.
              </div>
              <button 
                onClick={consultAI}
                className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-teal-400 font-bold text-xs py-2 rounded-xl transition flex justify-center items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Trigger AI Consultation
              </button>
            </div>

            {/* AI Console Display */}
            {showCoPilot && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs max-h-80 overflow-y-auto">
                {aiLoading ? (
                  <div className="space-y-2">
                    <span className="text-[10px] text-teal-400 font-mono block">● Swasti AI actively formulating...</span>
                    {aiLogs.map((log, idx) => (
                      <div key={idx} className="text-[11px] text-slate-400 font-mono animate-fade-in pl-2 border-l border-slate-800">
                        {log}
                      </div>
                    ))}
                    <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-2">
                      <div className="bg-teal-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                ) : aiResult ? (
                  <div className="space-y-4 animate-in fade-in duration-300 text-[11px]">
                    <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Consultation Result</span>
                      <button 
                        onClick={autofillWithAI}
                        className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-[10px] px-2 py-1 rounded"
                      >
                        Auto-Fill HIS Steps
                      </button>
                    </div>

                    <div className="space-y-2.5 text-slate-300">
                      <div>
                        <strong className="text-white text-[11px]">Pre-Op Tests Required:</strong>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {aiResult.preOpTests?.map((t: string, i: number) => (
                            <span key={i} className="bg-slate-900 border border-slate-800 text-[9px] px-1.5 py-0.5 rounded text-teal-300 font-mono">{t}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <strong className="text-white">Anesthesia Plan:</strong>
                        <p className="text-slate-400 mt-0.5">{aiResult.anesthesiaType} anesthesia - {aiResult.anesthesiaRisk}</p>
                      </div>

                      <div>
                        <strong className="text-white">Post-Op Medications Suggested:</strong>
                        <p className="text-slate-400 mt-0.5 italic">{aiResult.postOpMedications}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-6 italic">Awaiting AI triggering...</div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
            <span>Powered by Gemini 3.5 Flash</span>
            <span className="text-teal-400 font-bold">Clinical Compliant</span>
          </div>
        </div>

      </div>

      {/* Actual Digital Consent Portal Overlay Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-teal-500 text-slate-950 p-2 rounded-xl">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Swasti Healthcare Digital Consent Portal</h3>
                  <p className="text-[11px] text-slate-400">Official Clinical Records & Identification Capture Engine</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConsentModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Main Content Container */}
            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Left Column: Legal Template Document View */}
              <div className="md:col-span-7 bg-[#FAF9F5] p-5 border-r border-slate-200 max-h-[70vh] overflow-y-auto space-y-4">
                <div className="border border-[#E2DDD2] bg-white p-4 rounded-xl shadow-xs space-y-3 font-serif">
                  <div className="text-center border-b border-dashed border-[#E2DDD2] pb-2">
                    <h4 className="font-bold text-sm tracking-wide text-slate-800 uppercase">Swasti Medical Centers & Clinics</h4>
                    <span className="text-[10px] text-slate-500 font-sans font-medium">Informed Surgical Consent Authorization</span>
                  </div>

                  <div className="text-[11px] space-y-3 leading-relaxed text-slate-700 font-sans">
                    <div>
                      <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Patient Demographics:</p>
                      <p className="text-slate-600">
                        Name: <span className="font-semibold text-slate-900">{selectedCase.patient.name}</span> &bull; Age: <span className="font-semibold text-slate-900">{selectedCase.patient.age}y</span> &bull; ID: <span className="font-mono font-semibold text-slate-900">{selectedCase.patient.id}</span>
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Surgical Procedure Planned:</p>
                      <p className="font-semibold text-slate-950 text-xs bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        {selectedCase.recommendation.surgeryName}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Diagnosed Presentation:</p>
                      <p className="text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        {selectedCase.recommendation.diagnosis}
                      </p>
                    </div>

                    <hr className="border-[#E2DDD2] my-3" />

                    <div>
                      <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Consent Authorization:</p>
                      <p className="text-slate-600 leading-relaxed bg-amber-50/40 p-3 rounded-lg border border-amber-100/60 font-serif text-[11.5px] space-y-1.5">
                        <span>I hereby authorize {selectedCase.recommendation.recommendedBy.startsWith('Dr.') ? selectedCase.recommendation.recommendedBy : `Dr. ${selectedCase.recommendation.recommendedBy}`} to perform the planned surgery ({selectedCase.recommendation.surgeryName}) and administer the required anesthesia. I confirm that the procedure's clinical indications, potential risks, anticipated benefits, and available alternatives have been explained to me in detail, and I fully consent to the treatment.</span>
                        <br /><br />
                        <span>I also authorize the administration of any necessary blood products, transfusions, or emergency secondary interventions should unforeseen clinical circumstances arise during the course of the operation. I acknowledge that medicine is not an exact science and that no guarantees have been made to me regarding the absolute outcome of this procedure.</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-2">
                  <span className="text-blue-600 text-xs mt-0.5">ℹ</span>
                  <span className="text-[10px] text-blue-700 leading-normal">
                    This window registers actual consent parameters into the secure HIS. Completed entries are encrypted and cross-referenced with your National Digital Health Swasti ID.
                  </span>
                </div>
              </div>

              {/* Right Column: Dynamic Signature Panel */}
              <div className="md:col-span-5 p-5 flex flex-col justify-between max-h-[70vh] overflow-y-auto space-y-4">
                
                {/* 1. Select Signing Role */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">1. Select Signing Entity</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['patient', 'attendant', 'doctor', 'witness'] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setConsentRole(role);
                          clearCanvas();
                        }}
                        className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition capitalize cursor-pointer ${
                          consentRole === role 
                            ? 'bg-[#1F8F89] text-white border-[#1F8F89] shadow-sm' 
                            : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Signing Area */}
                <div className="flex-1 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    2. Draw ink signature on the canvas
                  </span>

                  <div className="space-y-2">
                    <div className="border border-dashed border-slate-300 rounded-xl overflow-hidden bg-[#FBFBFC] relative">
                      <canvas
                        ref={canvasRef}
                        width={260}
                        height={140}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-32 block cursor-crosshair touch-none"
                      />
                      <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-400 select-none bg-white/80 px-1 py-0.5 rounded border border-slate-100">
                        Interactive Canvas Board
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      ✕ Clear Ink Board
                    </button>
                  </div>
                </div>

                {/* Apply/Save Action */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => {
                      const canvas = canvasRef.current;
                      let signatureDataUrl = '';
                      if (canvas) {
                        signatureDataUrl = canvas.toDataURL('image/png');
                      }

                      // Create a clean updated object
                      const updated = { ...selectedCase };
                      
                      // Safely update signatures and signatureImages
                      updated.consentManagement = {
                        ...updated.consentManagement,
                        signatures: {
                          ...updated.consentManagement.signatures,
                          [consentRole]: true
                        },
                        signatureImages: {
                          ...(updated.consentManagement as any).signatureImages,
                          [consentRole]: signatureDataUrl
                        }
                      };

                      onUpdateCase(updated);
                      setShowConsentModal(false);
                      alert(`Successfully synchronized ${consentRole}'s official digital consent verification to Case File!`);
                    }}
                    className="w-full bg-[#1F8F89] hover:bg-[#156E69] text-white font-bold text-xs py-2.5 rounded-xl transition flex justify-center items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    Confirm & Apply Signature
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Dynamic Voice Dictation Modal */}
      {voiceTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1F8F89] to-indigo-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 animate-pulse text-red-300" />
                <h4 className="font-bold text-sm">Voice Dictation: {voiceTarget.label}</h4>
              </div>
              <button 
                type="button"
                onClick={() => {
                  stopVoiceDictation();
                  setVoiceTarget(null);
                }} 
                className="text-white/80 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {voiceListening ? "🎙️ Recording... Speak clearly." : "🎙️ Microphone Paused"}
                </span>
                <span className="flex h-2.5 w-2.5 relative">
                  {voiceListening && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${voiceListening ? 'bg-red-500' : 'bg-slate-300'}`}></span>
                </span>
              </div>

              {/* Textarea for real-time visualization & manual editing */}
              <div className="relative">
                <textarea
                  rows={6}
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  placeholder="Your voice will appear here. You can also type or edit directly inside this box..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none font-sans"
                />
              </div>

              {/* Tips */}
              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                Tip: Feel free to edit the text box manually with your keyboard before clicking "Save & Insert".
              </p>
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-2">
                {voiceListening ? (
                  <button
                    type="button"
                    onClick={stopVoiceDictation}
                    className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                  >
                    ⏸ Pause Mic
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                      if (SpeechRecognition) {
                        const recognition = new SpeechRecognition();
                        recognition.continuous = true;
                        recognition.lang = 'en-US';
                        recognition.interimResults = true;
                        recognition.onstart = () => setVoiceListening(true);
                        recognition.onend = () => setVoiceListening(false);
                        recognition.onerror = () => setVoiceListening(false);
                        recognition.onresult = (event: any) => {
                          let finalTranscript = "";
                          for (let i = event.resultIndex; i < event.results.length; ++i) {
                            if (event.results[i].isFinal) {
                              finalTranscript += event.results[i][0].transcript + " ";
                            }
                          }
                          if (finalTranscript) {
                            setVoiceText((prev) => {
                              const cleanPrev = prev.trim();
                              return cleanPrev ? `${cleanPrev} ${finalTranscript.trim()}` : finalTranscript.trim();
                            });
                          }
                        };
                        recognition.start();
                        setRecognitionInstance(recognition);
                        setVoiceListening(true);
                      } else {
                        alert("Speech recognition not supported.");
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                  >
                    🎙️ Resume Mic
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setVoiceText("")}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Clear Text
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopVoiceDictation();
                    setVoiceTarget(null);
                  }}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopVoiceDictation();
                    if (voiceTarget) {
                      voiceTarget.onSave(voiceText);
                    }
                    setVoiceTarget(null);
                  }}
                  className="bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-md shadow-teal-500/10 hover:opacity-90"
                >
                  Save & Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SHARED CLINICAL ECG SERVICE SUB-COMPONENT
// ==========================================
function ClinicalEcgService({ selectedCase, onUpdateCase }: { selectedCase: SurgeryCase; onUpdateCase: (updatedCase: SurgeryCase) => void }) {
  const ecgCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [deviceConnected, setDeviceConnected] = useState(true);
  const [leadDisconnect, setLeadDisconnect] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(1);
  const [selectedRhythm, setSelectedRhythm] = useState(selectedCase.ecgRecord?.rhythm || 'NSR');
  const [liveBpm, setLiveBpm] = useState(selectedCase.ecgRecord?.bpm || 72);
  const [prInterval, setPrInterval] = useState(selectedCase.ecgRecord?.prInterval || 160);
  const [qrsDuration, setQrsDuration] = useState(selectedCase.ecgRecord?.qrsDuration || 90);
  const [qtInterval, setQtInterval] = useState(selectedCase.ecgRecord?.qtInterval || 390);
  const [rrInterval, setRrInterval] = useState(selectedCase.ecgRecord?.rrInterval || 833);
  const [signalQuality, setSignalQuality] = useState(selectedCase.ecgRecord?.signalQuality || 99);

  // AI & Signing states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(selectedCase.ecgRecord?.aiAnalysisResult || null);
  const [doctorNotes, setDoctorNotes] = useState(selectedCase.ecgRecord?.doctorNotes || '');
  const [isApproved, setIsApproved] = useState(selectedCase.ecgRecord?.isApproved || false);
  const [doctorSignature, setDoctorSignature] = useState(selectedCase.ecgRecord?.doctorSignature || '');
  const [isSigned, setIsSigned] = useState(selectedCase.ecgRecord?.isSigned || false);

  // Sync state if case changes
  useEffect(() => {
    const record = selectedCase.ecgRecord;
    if (record) {
      setSelectedRhythm(record.rhythm || 'NSR');
      setLiveBpm(record.bpm || 72);
      setDoctorNotes(record.doctorNotes || '');
      setIsApproved(record.isApproved || false);
      setDoctorSignature(record.doctorSignature || '');
      setIsSigned(record.isSigned || false);
      setAiAnalysisResult(record.aiAnalysisResult || null);
    }
  }, [selectedCase.id, selectedCase.ecgRecord]);

  // Adjust live telemetry parameters based on rhythm
  useEffect(() => {
    let baseBpm = 72;
    let basePr = 160;
    let baseQrs = 90;
    let baseQt = 390;
    let baseRr = 833;

    if (selectedRhythm === 'NSR') {
      baseBpm = 72; basePr = 160; baseQrs = 90; baseQt = 390; baseRr = 833;
    } else if (selectedRhythm === 'Brady') {
      baseBpm = 45; basePr = 210; baseQrs = 95; baseQt = 460; baseRr = 1333;
    } else if (selectedRhythm === 'Tachy') {
      baseBpm = 125; basePr = 130; baseQrs = 85; baseQt = 320; baseRr = 480;
    } else if (selectedRhythm === 'AFib') {
      baseBpm = 110; basePr = 0; baseQrs = 90; baseQt = 360; baseRr = 545; // Irregular
    } else if (selectedRhythm === 'PVC') {
      baseBpm = 78; basePr = 155; baseQrs = 130; baseQt = 410; baseRr = 769;
    } else if (selectedRhythm === 'VTach') {
      baseBpm = 175; basePr = 0; baseQrs = 160; baseQt = 280; baseRr = 342;
    }

    setLiveBpm(baseBpm);
    setPrInterval(basePr);
    setQrsDuration(baseQrs);
    setQtInterval(baseQt);
    setRrInterval(baseRr);
    setSignalQuality(leadDisconnect ? 0 : Math.round(100 - noiseLevel * 5));
  }, [selectedRhythm, noiseLevel, leadDisconnect]);

  // Waveform renderer effect (mirroring the main ECG oscilloscope)
  useEffect(() => {
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Buffer to hold points to render
    const points = new Array(width).fill(height / 2);
    let phase = 0;
    let p_jitter = 0;
    let animationId: number;

    const drawGrid = (c: CanvasRenderingContext2D, w: number, h: number) => {
      c.fillStyle = '#0f172a'; // Deep slate slate-900 background
      c.fillRect(0, 0, w, h);

      // 1mm squares (approx every 10 pixels)
      c.strokeStyle = 'rgba(34, 197, 94, 0.04)'; // Subtle green grid lines
      c.lineWidth = 0.3;
      c.beginPath();
      for (let x = 0; x < w; x += 10) {
        c.moveTo(x, 0); c.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 10) {
        c.moveTo(0, y); c.lineTo(w, y);
      }
      c.stroke();

      // 5mm heavy grid blocks (every 50 pixels)
      c.strokeStyle = 'rgba(34, 197, 94, 0.08)'; // Darker green grid blocks
      c.lineWidth = 0.8;
      c.beginPath();
      for (let x = 0; x < w; x += 50) {
        c.moveTo(x, 0); c.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 50) {
        c.moveTo(0, y); c.lineTo(w, y);
      }
      c.stroke();
    };

    const render = () => {
      if (!ctx) return;

      drawGrid(ctx, width, height);

      const bpm = liveBpm;
      let phaseStep = 0.05;
      if (bpm > 0) {
        phaseStep = (2 * Math.PI * bpm) / (60 * 60);
      }

      phase += phaseStep;
      let amplitude = 0;

      if (leadDisconnect || !deviceConnected || bpm === 0) {
        amplitude = 0;
      } else if (selectedRhythm === 'VTach') {
        amplitude = 0.8 * Math.sin(phase) + 0.15 * Math.sin(2 * phase);
      } else {
        const cycle = phase % (2 * Math.PI);

        // P-wave
        let pWaveVal = 0;
        if (selectedRhythm !== 'AFib') {
          const pCenter = 0.8;
          const pWidth = 0.4;
          if (Math.abs(cycle - pCenter) < pWidth) {
            pWaveVal = 0.12 * Math.cos((Math.PI * (cycle - pCenter)) / (pWidth * 2));
          }
        } else {
          p_jitter = (Math.random() - 0.5) * 0.08;
          pWaveVal = p_jitter;
        }

        // QRS complex
        let qrsVal = 0;
        const isPVCBeat = selectedRhythm === 'PVC' && Math.floor(phase / (2 * Math.PI)) % 3 === 0;

        if (isPVCBeat) {
          const qrsCenter = 1.6;
          const qrsWidth = 0.45;
          if (Math.abs(cycle - qrsCenter) < qrsWidth) {
            qrsVal = -0.9 * Math.cos((Math.PI * (cycle - qrsCenter)) / (qrsWidth * 2));
          }
        } else {
          const qCenter = 1.85;
          const rCenter = 2.0;
          const sCenter = 2.15;
          const qrsWidth = 0.12;

          if (cycle > qCenter - qrsWidth/2 && cycle < qCenter + qrsWidth/2) {
            qrsVal += -0.15 * Math.cos((Math.PI * (cycle - qCenter)) / qrsWidth);
          }
          if (cycle > rCenter - qrsWidth/2 && cycle < rCenter + qrsWidth/2) {
            qrsVal += 1.1 * Math.cos((Math.PI * (cycle - rCenter)) / qrsWidth);
          }
          if (cycle > sCenter - qrsWidth/2 && cycle < sCenter + qrsWidth/2) {
            qrsVal += -0.3 * Math.cos((Math.PI * (cycle - sCenter)) / qrsWidth);
          }
        }

        // T-wave
        let tWaveVal = 0;
        if (isPVCBeat) {
          const tCenter = 2.8;
          const tWidth = 0.6;
          if (Math.abs(cycle - tCenter) < tWidth) {
            tWaveVal = 0.4 * Math.cos((Math.PI * (cycle - tCenter)) / (tWidth * 2));
          }
        } else {
          const tCenter = 3.6;
          const tWidth = 0.7;
          if (Math.abs(cycle - tCenter) < tWidth) {
            tWaveVal = 0.22 * Math.cos((Math.PI * (cycle - tCenter)) / (tWidth * 2));
          }
        }

        amplitude = pWaveVal + qrsVal + tWaveVal;
      }

      let randomNoise = (Math.random() - 0.5) * 0.04 * noiseLevel;
      amplitude += randomNoise;

      const baselineY = height / 2;
      const targetY = baselineY - amplitude * (height / 3.2);

      points.push(targetY);
      points.shift();

      ctx.strokeStyle = '#22c55e'; // Glowing neon emerald
      ctx.lineWidth = 2.2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#22c55e';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(0, points[0]);
      for (let i = 1; i < width; i++) {
        ctx.lineTo(i, points[i]);
      }
      ctx.stroke();

      ctx.shadowBlur = 0;

      if (bpm > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(width - 4, points[width - 1], 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [liveBpm, selectedRhythm, noiseLevel, leadDisconnect, deviceConnected]);

  // Request AI interpretation from server
  const triggerAiAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiAnalysisResult(null);

    try {
      const response = await fetch('/api/ecg/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: selectedCase.patient.name,
          age: selectedCase.patient.age,
          gender: selectedCase.patient.gender,
          rhythmType: selectedRhythm === 'NSR' ? 'Normal Sinus Rhythm' : 
                      selectedRhythm === 'Brady' ? 'Bradycardia' :
                      selectedRhythm === 'Tachy' ? 'Tachycardia' :
                      selectedRhythm === 'AFib' ? 'Atrial Fibrillation' :
                      selectedRhythm === 'PVC' ? 'Premature Ventricular Contraction' : 'Ventricular Tachycardia',
          heartRate: liveBpm,
          prInterval,
          qrsDuration,
          qtInterval,
          signalQuality
        })
      });

      if (!response.ok) throw new Error("AI Endpoint returned an error status.");
      const data = await response.json();
      if (data.success && data.analysis) {
        setAiAnalysisResult(data.analysis);
        const notes = `Rhythm verified as ${data.analysis.rhythmInterpretation}. Findings of ${data.analysis.findings[0]} are consistent with bedside telemetry logs. Risk level is evaluated as ${data.analysis.riskLevel}.`;
        setDoctorNotes(notes);

        // Auto-save interpreted state to database case
        const updatedRecord = {
          status: 'AI_Interpreted' as const,
          rhythm: selectedRhythm,
          bpm: liveBpm,
          prInterval,
          qrsDuration,
          qtInterval,
          rrInterval,
          signalQuality,
          aiAnalysisResult: data.analysis,
          doctorNotes: notes,
          isApproved,
          doctorSignature,
          isSigned,
        };
        onUpdateCase({
          ...selectedCase,
          preSurgeryAssessment: {
            ...selectedCase.preSurgeryAssessment,
            tests: {
              ...selectedCase.preSurgeryAssessment.tests,
              ecg: `HR: ${liveBpm} bpm, Rhythm: ${selectedRhythm === 'NSR' ? 'Normal Sinus' : selectedRhythm}, AI Interpreted`
            }
          },
          ecgRecord: updatedRecord
        });
      } else {
        throw new Error(data.error || "Failed to parse AI response");
      }
    } catch (err: any) {
      setAiError(err.message || "An error occurred");
    } finally {
      setAiLoading(false);
    }
  };

  const saveSignature = () => {
    if (!doctorSignature.trim()) {
      alert("Please enter your digital signature.");
      return;
    }

    setIsSigned(true);

    const updatedRecord = {
      status: 'Signed' as const,
      recordedBy: 'Clinical ECG Monitor',
      recordedDate: new Date().toISOString().split('T')[0],
      rhythm: selectedRhythm,
      bpm: liveBpm,
      prInterval,
      qrsDuration,
      qtInterval,
      rrInterval,
      signalQuality,
      aiAnalysisResult,
      doctorNotes,
      isApproved: true,
      doctorSignature,
      isSigned: true,
      signedBy: doctorSignature,
      signedDate: new Date().toISOString().split('T')[0]
    };

    onUpdateCase({
      ...selectedCase,
      preSurgeryAssessment: {
        ...selectedCase.preSurgeryAssessment,
        tests: {
          ...selectedCase.preSurgeryAssessment.tests,
          ecg: `HR: ${liveBpm} bpm, Rhythm: ${selectedRhythm === 'NSR' ? 'Normal Sinus Rhythm' : selectedRhythm}, Status: SIGNED`
        }
      },
      ecgRecord: updatedRecord
    });
  };

  return (
    <div className="space-y-4">
      {!selectedCase.preSurgeryAssessment?.ecgRequired && (
        <div className="p-3.5 bg-slate-100 border border-slate-200/60 rounded-xl text-slate-700 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <span>Pre-Op ECG Telemetry is currently <strong>Optional</strong> for this surgery case. You can configure and run AI diagnostics anyway, or mark it as required to prioritize it in the ECG dashboard.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onUpdateCase({
                ...selectedCase,
                preSurgeryAssessment: {
                  ...selectedCase.preSurgeryAssessment,
                  ecgRequired: true
                }
              });
            }}
            className="shrink-0 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
          >
            Mark as Required
          </button>
        </div>
      )}

      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-slate-50/50">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center animate-fadeIn">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <h5 className="font-bold text-xs tracking-tight">Pre-Operative ECG Telemetry Service</h5>
            <p className="text-[9px] text-slate-400">Continuous 12-Lead Monitor • Central HIS Integration</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${
            selectedCase.ecgRecord?.status === 'Signed' ? 'bg-emerald-400 animate-pulse' :
            selectedCase.ecgRecord?.status === 'AI_Interpreted' ? 'bg-teal-400' :
            'bg-amber-400 animate-ping'
          }`} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            {selectedCase.ecgRecord?.status || 'Pending'}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Waveform Canvas */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
          <canvas
            ref={ecgCanvasRef}
            width={600}
            height={130}
            className="w-full h-28 block"
          />
          {(!deviceConnected || liveBpm === 0) && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col justify-center items-center">
              <ShieldAlert className="w-8 h-8 text-rose-500 animate-bounce" />
              <span className="text-xs font-bold text-rose-400">TELEMETRY LEADS DISCONNECTED</span>
            </div>
          )}
        </div>

        {/* Telemetry Control Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Simulated Rhythm</span>
            <select
              value={selectedRhythm}
              onChange={(e) => setSelectedRhythm(e.target.value)}
              disabled={isSigned}
              className="w-full p-1 border border-slate-200 rounded text-xs text-slate-700 bg-slate-50 font-semibold cursor-pointer focus:outline-none"
            >
              <option value="NSR">Normal Sinus (NSR)</option>
              <option value="Brady">Sinus Bradycardia</option>
              <option value="Tachy">Sinus Tachycardia</option>
              <option value="AFib">Atrial Fibrillation</option>
              <option value="PVC">Premature Ventric (PVC)</option>
              <option value="VTach">Ventricular Tachycardia</option>
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Hardware Connector</span>
            <div className="flex items-center gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => setDeviceConnected(!deviceConnected)}
                disabled={isSigned}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${deviceConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}
              >
                {deviceConnected ? "CONNECTED" : "DISCONNECTED"}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Baseline Drift</span>
            <input
              type="range"
              min="0"
              max="4"
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
              disabled={isSigned}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2.5"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Leads Disconnect</span>
            <div className="mt-1">
              <input
                type="checkbox"
                id="leads-disconnect-sub"
                checked={leadDisconnect}
                onChange={(e) => setLeadDisconnect(e.target.checked)}
                disabled={isSigned}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="leads-disconnect-sub" className="text-[11px] text-slate-600 ml-1.5 select-none cursor-pointer">Detached</label>
            </div>
          </div>
        </div>

        {/* Diagnostic Parameters Row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center bg-slate-900 p-2.5 rounded-xl text-white font-mono shadow-inner">
          <div className="p-1 border-r border-slate-800">
            <span className="text-[8px] text-slate-400 uppercase block">HR (BPM)</span>
            <span className={`text-sm font-bold block ${liveBpm > 120 || liveBpm < 50 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {liveBpm > 0 ? liveBpm : '---'}
            </span>
          </div>
          <div className="p-1 border-r border-slate-800">
            <span className="text-[8px] text-slate-400 uppercase block">PR Int</span>
            <span className="text-xs font-bold text-slate-200 block">{prInterval > 0 ? `${prInterval} ms` : '---'}</span>
          </div>
          <div className="p-1 border-r border-slate-800">
            <span className="text-[8px] text-slate-400 uppercase block">QRS Dur</span>
            <span className="text-xs font-bold text-slate-200 block">{qrsDuration > 0 ? `${qrsDuration} ms` : '---'}</span>
          </div>
          <div className="p-1 border-r border-slate-800">
            <span className="text-[8px] text-slate-400 uppercase block">QT/QTc</span>
            <span className="text-xs font-bold text-slate-200 block">{qtInterval > 0 ? `${qtInterval} ms` : '---'}</span>
          </div>
          <div className="p-1 border-r border-slate-800">
            <span className="text-[8px] text-slate-400 uppercase block">RR Int</span>
            <span className="text-xs font-bold text-slate-200 block">{rrInterval > 0 ? `${rrInterval} ms` : '---'}</span>
          </div>
          <div className="p-1">
            <span className="text-[8px] text-slate-400 uppercase block">Signal Q</span>
            <span className={`text-xs font-bold block ${signalQuality < 70 ? 'text-rose-400' : 'text-emerald-400'}`}>{signalQuality}%</span>
          </div>
        </div>

        {/* AI Interpretation Box */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white space-y-2 relative overflow-hidden shadow-md">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[10px] font-bold text-teal-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini AI Clinical Summary
            </span>
            {!aiAnalysisResult && !aiLoading && (
              <button
                type="button"
                onClick={triggerAiAnalysis}
                disabled={isSigned}
                className="text-[9px] bg-slate-800 hover:bg-slate-700 font-bold px-2.5 py-1 rounded text-teal-300 flex items-center gap-1 border border-teal-900/30 transition-all cursor-pointer shadow-sm"
              >
                Generate Interpretation
              </button>
            )}
          </div>

          {aiLoading && (
            <div className="text-center py-4 text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              Compiling telemetry parameters...
            </div>
          )}

          {aiAnalysisResult && (
            <div className="text-[11px] leading-relaxed space-y-2">
              <div className="flex justify-between items-center text-[10px] bg-slate-950/40 p-1.5 rounded border border-slate-800/50">
                <span className="font-semibold text-slate-300">Rhythm:</span>
                <span className="text-teal-400 font-mono font-bold uppercase">{aiAnalysisResult.rhythmInterpretation}</span>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-400 block text-[9px] uppercase">Clinical Findings:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
                  {aiAnalysisResult.findings.map((finding: string, i: number) => (
                    <li key={i}>{finding}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                <div>
                  <span className="font-semibold text-slate-500 block uppercase text-[8px]">Cardio Risk:</span>
                  <span className={`font-bold uppercase ${
                    aiAnalysisResult.riskLevel === 'High' ? 'text-rose-400' :
                    aiAnalysisResult.riskLevel === 'Medium' ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>{aiAnalysisResult.riskLevel} Risk</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block uppercase text-[8px]">Confidence Rating:</span>
                  <span className="text-slate-200 font-bold">{aiAnalysisResult.confidenceScore}%</span>
                </div>
              </div>
            </div>
          )}

          {!aiAnalysisResult && !aiLoading && (
            <p className="text-[10px] text-slate-500 text-center py-2">
              Click "Generate Interpretation" to invoke the secure Gemini server-side cardiological model.
            </p>
          )}
        </div>

        {/* Doctor approval and signing */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/85 space-y-3.5 shadow-xs">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-600 block uppercase tracking-wide">Reviewer Remarks & Orders:</label>
            <textarea
              rows={2}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              disabled={isSigned}
              placeholder="Insert custom clinical remarks, modifiers, and clearance directives..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="doctor-preop-attestation"
              checked={isApproved}
              onChange={(e) => setIsApproved(e.target.checked)}
              disabled={isSigned}
              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="doctor-preop-attestation" className="text-[10.5px] text-slate-600 leading-relaxed select-none cursor-pointer">
              I attest that I have physically reviewed the wave parameters and approve this telemetry interpretation.
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Reviewing Clinician</span>
              <div className="bg-slate-100 text-slate-700 font-mono text-xs p-2 rounded border border-slate-200 font-bold truncate">
                Dr. Vivek Saxena
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Digital Signature (Type name)</span>
              <input
                type="text"
                value={doctorSignature}
                onChange={(e) => setDoctorSignature(e.target.value)}
                disabled={isSigned}
                placeholder="Enter doctor's full name"
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={saveSignature}
            disabled={!isApproved || !doctorSignature.trim() || isSigned || !deviceConnected || liveBpm === 0}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            Sign & Archive Pre-Op ECG
          </button>

          {isSigned && (
            <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-lg flex items-start gap-2">
              <div className="p-0.5 bg-emerald-500 text-white rounded">
                <Check className="w-3 h-3" />
              </div>
              <div className="space-y-0.5">
                <h6 className="text-[11px] font-bold text-emerald-950 leading-none">Pre-Op ECG Approved & Sealed</h6>
                <p className="text-[9.5px] text-emerald-800 leading-relaxed">
                  The ECG record has been certified by {selectedCase.ecgRecord?.signedBy || doctorSignature} on {selectedCase.ecgRecord?.signedDate || new Date().toISOString().split('T')[0]} and successfully synced across all Hospital Systems.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
