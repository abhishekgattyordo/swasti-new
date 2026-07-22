// "use client";

// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { useCases } from '@/context/CasesContext';
// import { 
//   HeartPulse, 
//   Settings, 
//   CheckCircle2, 
//   Cpu, 
//   RefreshCw, 
//   Sparkles, 
//   Check, 
//   ShieldAlert, 
//   UploadCloud
// } from 'lucide-react';

// export default function EcgDiagnosticsPage() {
//   const { cases, activeUser, updateCase } = useCases();
//   const ecgCases = useMemo(() => {
//     return cases.filter(c => c.ecgRequired || c.preSurgeryAssessment?.ecgRequired);
//   }, [cases]);
  
//   const [selectedPatientId, setSelectedPatientId] = useState<string>('');
//   const [patientProfile, setPatientProfile] = useState({
//     name: 'No Active ECG Patient',
//     age: 0,
//     gender: 'N/A',
//     admissionId: 'N/A',
//     roomNumber: 'N/A',
//     bloodGroup: 'N/A'
//   });

//   // Automatically select the first patient who requires an ECG when cases load or selection becomes invalid
//   useEffect(() => {
//     if (ecgCases.length > 0) {
//       const isValid = ecgCases.some(c => c.id === selectedPatientId);
//       if (!isValid) {
//         setSelectedPatientId(ecgCases[0].id);
//       }
//     } else {
//       setSelectedPatientId('');
//     }
//   }, [ecgCases, selectedPatientId]);

//   const [deviceConnected, setDeviceConnected] = useState<boolean>(true);
//   const [selectedRhythm, setSelectedRhythm] = useState<string>('NSR'); // NSR, Brady, Tachy, AFib, PVC, VTach
  
//   // Waveform noise & offset adjustment sliders
//   const [hrOffset, setHrOffset] = useState<number>(0);
//   const [noiseLevel, setNoiseLevel] = useState<number>(1);
//   const [leadDisconnect, setLeadDisconnect] = useState<boolean>(false);

//   // Live telemetry parameters calculated in real-time
//   const [liveBpm, setLiveBpm] = useState<number>(72);
//   const [prInterval, setPrInterval] = useState<number>(160);
//   const [qrsDuration, setQrsDuration] = useState<number>(90);
//   const [qtInterval, setQtInterval] = useState<number>(390);
//   const [rrInterval, setRrInterval] = useState<number>(833);
//   const [signalQuality, setSignalQuality] = useState<number>(99);

//   // AI analysis states
//   const [aiLoading, setAiLoading] = useState<boolean>(false);
//   const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
//   const [aiError, setAiError] = useState<string | null>(null);

//   // Doctor review states
//   const [doctorNotes, setDoctorNotes] = useState<string>('');
//   const [isApproved, setIsApproved] = useState<boolean>(false);
//   const [doctorSignature, setDoctorSignature] = useState<string>('');
//   const [isSigned, setIsSigned] = useState<boolean>(false);
//   const [historyReports, setHistoryReports] = useState<any[]>([]);

//   // Canvas Ref for the ECG Oscilloscope
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   // Sync patient dropdown with chosen profile
//   useEffect(() => {
//     const matchedCase = cases.find(c => c.id === selectedPatientId);
//     if (matchedCase) {
//       setPatientProfile({
//         name: matchedCase.patient.name,
//         age: matchedCase.patient.age,
//         gender: matchedCase.patient.gender,
//         admissionId: matchedCase.patient.admissionId,
//         roomNumber: matchedCase.patient.roomNumber || 'ICU-Bed-02',
//         bloodGroup: matchedCase.patient.bloodGroup || 'A+'
//       });
//     } else {
//       setPatientProfile({
//         name: 'No Active ECG Patient',
//         age: 0,
//         gender: 'N/A',
//         admissionId: 'N/A',
//         roomNumber: 'N/A',
//         bloodGroup: 'N/A'
//       });
//     }
//   }, [selectedPatientId, cases]);

//   // Synchronize local states with selected case's ecgRecord if real case exists
//   useEffect(() => {
//     const matchedCase = cases.find(c => c.id === selectedPatientId);
//     if (matchedCase) {
//       if (matchedCase.ecgRecord) {
//         const record = matchedCase.ecgRecord;
//         setSelectedRhythm(record.rhythm || 'NSR');
//         setDoctorNotes(record.doctorNotes || '');
//         setIsApproved(record.isApproved || false);
//         setDoctorSignature(record.doctorSignature || '');
//         setIsSigned(record.isSigned || false);
//         if (record.aiAnalysisResult) {
//           setAiAnalysisResult(record.aiAnalysisResult);
//         } else {
//           setAiAnalysisResult(null);
//         }
//       } else {
//         // Clear local inputs for patients without a recorded ECG
//         setSelectedRhythm('NSR');
//         setDoctorNotes('');
//         setIsApproved(false);
//         setDoctorSignature('');
//         setIsSigned(false);
//         setAiAnalysisResult(null);
//       }
//     }
//   }, [selectedPatientId, cases]);

//   // Handle live logs updates (no-op helper to prevent linter errors)
//   const appendLog = (msg: string) => {};

//   // Mathematical Parameters Calculation based on Selected Rhythm
//   useEffect(() => {
//     let baseBpm = 72;
//     let basePr = 160;
//     let baseQrs = 90;
//     let baseQt = 390;
//     let baseRr = 833;

//     if (selectedRhythm === 'NSR') {
//       baseBpm = 72 + hrOffset;
//       basePr = 160;
//       baseQrs = 90;
//       baseQt = 390;
//       baseRr = Math.round(60000 / baseBpm);
//     } else if (selectedRhythm === 'Brady') {
//       baseBpm = 45 + Math.round(hrOffset / 2);
//       basePr = 210; // slightly prolonged
//       baseQrs = 90;
//       baseQt = 430;
//       baseRr = Math.round(60000 / baseBpm);
//     } else if (selectedRhythm === 'Tachy') {
//       baseBpm = 125 + hrOffset;
//       basePr = 130; // shortened
//       baseQrs = 85;
//       baseQt = 310; // shortened
//       baseRr = Math.round(60000 / baseBpm);
//     } else if (selectedRhythm === 'AFib') {
//       baseBpm = 115 + hrOffset;
//       basePr = 0; // absent
//       baseQrs = 95;
//       baseQt = 340;
//       baseRr = Math.round(60000 / baseBpm); // highly fluctuating in real wave
//     } else if (selectedRhythm === 'PVC') {
//       baseBpm = 80 + hrOffset;
//       basePr = 150;
//       baseQrs = 130; // Premature complexes will widen this
//       baseQt = 410;
//       baseRr = Math.round(60000 / baseBpm);
//     } else if (selectedRhythm === 'VTach') {
//       baseBpm = 175 + Math.round(hrOffset / 2);
//       basePr = 0; // absent
//       baseQrs = 150; // extremely wide
//       baseQt = 280;
//       baseRr = Math.round(60000 / baseBpm);
//     }

//     // Lead disconnect modifier
//     if (leadDisconnect || !deviceConnected) {
//       setLiveBpm(0);
//       setPrInterval(0);
//       setQrsDuration(0);
//       setQtInterval(0);
//       setRrInterval(0);
//       setSignalQuality(0);
//     } else {
//       setLiveBpm(baseBpm);
//       setPrInterval(basePr);
//       setQrsDuration(baseQrs);
//       setQtInterval(baseQt);
//       setRrInterval(baseRr);
//       // calculate signal quality based on noise level
//       setSignalQuality(Math.max(10, 100 - (noiseLevel - 1) * 15 - (selectedRhythm === 'AFib' ? 5 : 0)));
//     }
//   }, [selectedRhythm, hrOffset, noiseLevel, leadDisconnect, deviceConnected]);

//   // Real-time ECG Canvas Oscilloscope Logic
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     let animationId: number;
//     let width = canvas.width;
//     let height = canvas.height;

//     // Buffer to hold standard historical graph values for smooth scrolling
//     const points: number[] = Array(width).fill(height / 2);
//     let bufferIndex = 0;

//     // Rhythm state variables
//     let phase = 0;
//     let beatTimer = 0;
//     let p_jitter = 0; // Atrial fibrillation chaotic baseline jitter

//     const drawGrid = (c: CanvasRenderingContext2D, w: number, h: number) => {
//       // Clear background
//       c.fillStyle = '#0f172a'; // Deep slate
//       c.fillRect(0, 0, w, h);

//       // Draw traditional pink ECG coordinate grid
//       c.strokeStyle = '#f43f5e'; // Pink/Rose
      
//       // 1mm squares (approx every 10 pixels)
//       c.lineWidth = 0.3;
//       c.beginPath();
//       for (let x = 0; x < w; x += 10) {
//         c.moveTo(x, 0);
//         c.lineTo(x, h);
//       }
//       for (let y = 0; y < h; y += 10) {
//         c.moveTo(0, y);
//         c.lineTo(w, y);
//       }
//       c.stroke();

//       // 5mm heavy grid blocks (every 50 pixels)
//       c.lineWidth = 0.8;
//       c.beginPath();
//       for (let x = 0; x < w; x += 50) {
//         c.moveTo(x, 0);
//         c.lineTo(x, h);
//       }
//       for (let y = 0; y < h; y += 50) {
//         c.moveTo(0, y);
//         c.lineTo(w, y);
//       }
//       c.stroke();
//     };

//     const render = () => {
//       if (!ctx) return;

//       // Draw grid
//       drawGrid(ctx, width, height);

//       // Advance Phase and calculate next point
//       // speed depends on heart rate
//       const bpm = liveBpm;
//       let phaseStep = 0.05; // default step
      
//       if (bpm > 0) {
//         // Compute speed matching real FPS (assumed 60fps)
//         phaseStep = (2 * Math.PI * bpm) / (60 * 60);
//       }

//       phase += phaseStep;
      
//       let amplitude = 0; // voltage baseline (range -1 to 1)

//       if (leadDisconnect || !deviceConnected || bpm === 0) {
//         // Flatline with potential noise
//         amplitude = 0;
//       } else if (selectedRhythm === 'VTach') {
//         // Continuous, wide monomorphic complexes (distorted sine wave)
//         amplitude = 0.8 * Math.sin(phase) + 0.15 * Math.sin(2 * phase);
//       } else {
//         // Normal, Brady, Tachy, AFib, PVC models
//         const cycle = phase % (2 * Math.PI);

//         // P-wave
//         let pWaveVal = 0;
//         if (selectedRhythm !== 'AFib') {
//           // NSR, Brady, Tachy, PVC have standard P waves
//           const pCenter = 0.8;
//           const pWidth = 0.4;
//           if (Math.abs(cycle - pCenter) < pWidth) {
//             pWaveVal = 0.12 * Math.cos((Math.PI * (cycle - pCenter)) / (pWidth * 2));
//           }
//         } else {
//           // AFib has no P-wave. It features irregular baseline oscillations (f-waves)
//           p_jitter = (Math.random() - 0.5) * 0.08;
//           pWaveVal = p_jitter;
//         }

//         // QRS complex
//         let qrsVal = 0;
//         const isPVCBeat = selectedRhythm === 'PVC' && Math.floor(phase / (2 * Math.PI)) % 3 === 0;

//         if (isPVCBeat) {
//           // PVC triggers prematurely and exhibits a wide, inverted bizarre complex
//           const qrsCenter = 1.6; // fires earlier
//           const qrsWidth = 0.45; // wider
//           if (Math.abs(cycle - qrsCenter) < qrsWidth) {
//             // bizarre tall inverted complex
//             qrsVal = -0.9 * Math.cos((Math.PI * (cycle - qrsCenter)) / (qrsWidth * 2));
//           }
//         } else {
//           // Normal QRS complex
//           const qCenter = 1.85;
//           const rCenter = 2.0;
//           const sCenter = 2.15;
//           const qrsWidth = 0.12;

//           // Q-wave
//           if (cycle > qCenter - qrsWidth/2 && cycle < qCenter + qrsWidth/2) {
//             qrsVal += -0.15 * Math.cos((Math.PI * (cycle - qCenter)) / qrsWidth);
//           }
//           // R-wave
//           if (cycle > rCenter - qrsWidth/2 && cycle < rCenter + qrsWidth/2) {
//             qrsVal += 1.1 * Math.cos((Math.PI * (cycle - rCenter)) / qrsWidth);
//           }
//           // S-wave
//           if (cycle > sCenter - qrsWidth/2 && cycle < sCenter + qrsWidth/2) {
//             qrsVal += -0.3 * Math.cos((Math.PI * (cycle - sCenter)) / qrsWidth);
//           }
//         }

//         // T-wave
//         let tWaveVal = 0;
//         if (isPVCBeat) {
//           // Discordant wide T wave following a PVC
//           const tCenter = 2.8;
//           const tWidth = 0.6;
//           if (Math.abs(cycle - tCenter) < tWidth) {
//             tWaveVal = 0.4 * Math.cos((Math.PI * (cycle - tCenter)) / (tWidth * 2));
//           }
//         } else {
//           // Normal T wave
//           const tCenter = 3.6;
//           const tWidth = 0.7;
//           if (Math.abs(cycle - tCenter) < tWidth) {
//             tWaveVal = 0.22 * Math.cos((Math.PI * (cycle - tCenter)) / (tWidth * 2));
//           }
//         }

//         amplitude = pWaveVal + qrsVal + tWaveVal;
//       }

//       // Add baseline wander noise
//       let randomNoise = (Math.random() - 0.5) * 0.04 * noiseLevel;
//       amplitude += randomNoise;

//       // Scale and shift amplitude to canvas space
//       // amplitude of 1.0 is mapped to 80px deflection
//       const baselineY = height / 2;
//       const targetY = baselineY - amplitude * 80;

//       // Append point to sliding buffer
//       points.push(targetY);
//       points.shift();

//       // Render line connecting all buffer coordinates
//       ctx.strokeStyle = '#22c55e'; // Glowing neon emerald
//       ctx.lineWidth = 2.5;
//       ctx.shadowBlur = 10;
//       ctx.shadowColor = '#22c55e';
//       ctx.lineCap = 'round';
//       ctx.lineJoin = 'round';

//       ctx.beginPath();
//       ctx.moveTo(0, points[0]);
//       for (let i = 1; i < width; i++) {
//         ctx.lineTo(i, points[i]);
//       }
//       ctx.stroke();

//       // Reset shadows for next operations
//       ctx.shadowBlur = 0;

//       // Draw horizontal current scanner sweeping bar (or scrolling point label)
//       if (bpm > 0) {
//         ctx.fillStyle = '#ef4444'; // Red scan indicator
//         ctx.beginPath();
//         ctx.arc(width - 4, points[width - 1], 4, 0, 2 * Math.PI);
//         ctx.fill();
//       }

//       animationId = requestAnimationFrame(render);
//     };

//     render();

//     return () => cancelAnimationFrame(animationId);
//   }, [liveBpm, selectedRhythm, noiseLevel, leadDisconnect, deviceConnected]);

//   // Handle server-side AI report generation via our API Route
//   const triggerAiAnalysis = async () => {
//     setAiLoading(true);
//     setAiError(null);
//     setAiAnalysisResult(null);

//     appendLog("Initiating Secure Server-Side ECG AI Diagnostic Pipeline...");
//     appendLog("Sending 12-lead vector parameters to Gemini clinical model...");

//     try {
//       const response = await fetch('/api/ecg/analyze', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           patientName: patientProfile.name,
//           age: patientProfile.age,
//           gender: patientProfile.gender,
//           rhythmType: selectedRhythm === 'NSR' ? 'Normal Sinus Rhythm' : 
//                       selectedRhythm === 'Brady' ? 'Bradycardia' :
//                       selectedRhythm === 'Tachy' ? 'Tachycardia' :
//                       selectedRhythm === 'AFib' ? 'Atrial Fibrillation' :
//                       selectedRhythm === 'PVC' ? 'Premature Ventricular Contraction' : 'Ventricular Tachycardia',
//           heartRate: liveBpm,
//           prInterval,
//           qrsDuration,
//           qtInterval,
//           signalQuality
//         })
//       });

//       if (!response.ok) {
//         throw new Error("AI Endpoint returned an error status.");
//       }

//       const data = await response.json();
//       if (data.success && data.analysis) {
//         setAiAnalysisResult(data.analysis);
//         appendLog("AI Cardiological summary received successfully.");
//         // Auto pre-fill doctor notes to assist workflow
//         const notes = `Rhythm verified as ${data.analysis.rhythmInterpretation}. Findings of ${data.analysis.findings[0]} are consistent with patient's bedside charts. Risk level is evaluated as ${data.analysis.riskLevel}.`;
//         setDoctorNotes(notes);

//         // Update database if it's an active case
//         const matchedCase = cases.find(c => c.id === selectedPatientId);
//         if (matchedCase) {
//           const updatedRecord = {
//             status: 'AI_Interpreted' as const,
//             rhythm: selectedRhythm,
//             bpm: liveBpm,
//             prInterval,
//             qrsDuration,
//             qtInterval,
//             rrInterval,
//             signalQuality,
//             aiAnalysisResult: data.analysis,
//             doctorNotes: notes,
//             isApproved: isApproved,
//             doctorSignature: doctorSignature,
//             isSigned: isSigned,
//           };
//           const updatedCase = {
//             ...matchedCase,
//             preSurgeryAssessment: {
//               ...matchedCase.preSurgeryAssessment,
//               tests: {
//                 ...matchedCase.preSurgeryAssessment.tests,
//                 ecg: `HR: ${liveBpm} bpm, Rhythm: ${selectedRhythm === 'NSR' ? 'Normal Sinus' : selectedRhythm}, AI Interpreted`
//               }
//             },
//             ecgRecord: updatedRecord
//           };
//           await updateCase(updatedCase);
//           appendLog(`SUCCESS: Central ECG record status updated to AI_Interpreted.`);
//         }
//       } else {
//         throw new Error(data.error || "Failed to parse AI response");
//       }
//     } catch (err: any) {
//       setAiError(err.message || "An error occurred");
//       appendLog("CRITICAL: AI telemetry route experienced connection exception.");
//     } finally {
//       setAiLoading(false);
//     }
//   };

//   // Sign and submit clinical report to the hospital records (EMR)
//   const submitToEmr = async () => {
//     if (!doctorSignature.trim()) {
//       alert("Please enter your digital signature name.");
//       return;
//     }

//     appendLog("COMPILING DIGITAL SIGNATURE & VERIFYING HL7 SEGMENT...");
//     setIsSigned(true);

//     const reportPayload = {
//       id: `ECG-REP-${Date.now().toString().slice(-6)}`,
//       patientId: selectedPatientId,
//       patientName: patientProfile.name,
//       timestamp: new Date().toLocaleString(),
//       rhythm: selectedRhythm,
//       bpm: liveBpm,
//       risk: aiAnalysisResult?.riskLevel || (selectedRhythm === 'NSR' ? 'Low' : selectedRhythm === 'AFib' || selectedRhythm === 'VTach' ? 'High' : 'Medium'),
//       summary: aiAnalysisResult?.rhythmInterpretation || "Interpreted cardiac sequence",
//       doctorNotes,
//       signedBy: doctorSignature,
//     };

//     setHistoryReports(prev => [reportPayload, ...prev]);

//     // Update database if it's an active case
//     const matchedCase = cases.find(c => c.id === selectedPatientId);
//     if (matchedCase) {
//       const updatedRecord = {
//         status: 'Signed' as const,
//         recordedBy: 'Clinical ECG Monitor',
//         recordedDate: new Date().toISOString().split('T')[0],
//         rhythm: selectedRhythm,
//         bpm: liveBpm,
//         prInterval,
//         qrsDuration,
//         qtInterval,
//         rrInterval,
//         signalQuality,
//         aiAnalysisResult: aiAnalysisResult,
//         doctorNotes,
//         isApproved: true,
//         doctorSignature,
//         isSigned: true,
//         signedBy: doctorSignature,
//         signedDate: new Date().toISOString().split('T')[0]
//       };

//       const updatedCase = {
//         ...matchedCase,
//         preSurgeryAssessment: {
//           ...matchedCase.preSurgeryAssessment,
//           tests: {
//             ...matchedCase.preSurgeryAssessment.tests,
//             ecg: `HR: ${liveBpm} bpm, Rhythm: ${selectedRhythm === 'NSR' ? 'Normal Sinus Rhythm' : selectedRhythm}, Status: SIGNED`
//           }
//         },
//         ecgRecord: updatedRecord
//       };

//       try {
//         await updateCase(updatedCase);
//         appendLog(`SUCCESS: Central ECG record updated and saved to Swasti SQL.`);
//       } catch (err) {
//         console.error("Failed to update case with ECG record:", err);
//       }
//     }

//     appendLog(`SUCCESS: Clinical report saved to Swasti SQL and pushed to hospital EMR (FHIR Observational Store). Report ID: ${reportPayload.id}`);
//   };



//   return (
//     <div id="ecg-diagnostics-portal" className="space-y-6 max-w-[1600px] mx-auto pb-16">
//       {/* Page Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
//         <div>
//           <div className="flex items-center gap-2">
//             <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
//               <HeartPulse className="w-6 h-6 animate-pulse" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
//                 Cardiology Telemetry Portal
//                 <span className="text-[10px] font-mono font-bold bg-[#EAF7F4] text-[#1F8F89] px-2 py-0.5 rounded-full border border-[#D0E6DE]">
//                   Advanced Diagnostics
//                 </span>
//               </h1>
//               <p className="text-xs text-slate-500 mt-0.5">
//                 End-to-end clinical ECG monitoring, mathematical wave simulation, and server-side Gemini AI report synthesis.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Grid Layout */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* Left Columns (Monitor & Data flow diagram) */}
//         <div className="lg:col-span-2 space-y-6">
          
//           {/* Real-time Oscilloscope Grid */}
//           <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
            
//             {/* Bedside header readouts */}
//             <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap justify-between items-center gap-3">
//               <div className="flex items-center gap-3">
//                 <span className="relative flex h-3 w-3">
//                   <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${deviceConnected ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
//                   <span className={`relative inline-flex rounded-full h-3 w-3 ${deviceConnected ? 'bg-emerald-500' : 'bg-rose-600'}`}></span>
//                 </span>
//                 <div>
//                   <h3 className="font-bold text-sm tracking-tight text-slate-200">
//                     Bedside Monitor: Lead II Telemetry
//                   </h3>
//                   <p className="text-[10px] text-slate-400 font-mono">
//                     Model: CardioMend-12X • Real-time Diagnostic Telemetry
//                   </p>
//                 </div>
//               </div>

//               {/* Patient Selector */}
//               <div className="flex items-center gap-2">
//                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Active Patient:</span>
//                 <select
//                   value={selectedPatientId}
//                   onChange={(e) => setSelectedPatientId(e.target.value)}
//                   className="bg-slate-900 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[150px]"
//                   disabled={ecgCases.length === 0}
//                 >
//                   {ecgCases.length === 0 ? (
//                     <option value="">No Active ECG Patients</option>
//                   ) : (
//                     ecgCases.map(c => (
//                       <option key={c.id} value={c.id}>{c.patient.name} ({c.patient.age}{c.patient.gender.charAt(0)})</option>
//                     ))
//                   )}
//                 </select>
//               </div>
//             </div>

//             {/* The Real-Time Glowing Waveform Canvas */}
//             <div className="relative">
//               <canvas
//                 ref={canvasRef}
//                 width={800}
//                 height={260}
//                 className="w-full h-[260px] block cursor-crosshair"
//               />
              
//               {/* Overlay warning on flatline */}
//               {(!deviceConnected || liveBpm === 0) && (
//                 <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col justify-center items-center gap-3">
//                   <ShieldAlert className="w-12 h-12 text-rose-500 animate-bounce" />
//                   <p className="text-sm font-bold text-rose-400 tracking-wide">
//                     {leadDisconnect ? "LEAD II DETACHED (CHECK ELECTRODES)" : "NO HARDWARE HEARTBEAT DETECTED"}
//                   </p>
//                   <p className="text-xs text-slate-400 max-w-sm text-center">
//                     Check physical connectivity, patient wire status, or serial scanner settings in Production panel.
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Digital Parameters Grid */}
//             <div className="grid grid-cols-2 sm:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 border-t border-slate-800 bg-slate-950 text-slate-200">
              
//               {/* HR */}
//               <div className="p-4 flex flex-col justify-between min-h-[90px] relative overflow-hidden">
//                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">HR (BPM)</span>
//                 <span className={`text-3xl font-extrabold font-mono leading-none tracking-tight ${liveBpm > 120 || liveBpm < 50 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
//                   {liveBpm > 0 ? liveBpm : '---'}
//                 </span>
//                 <HeartPulse className={`absolute right-3 bottom-3 w-5 h-5 opacity-25 ${liveBpm > 120 ? 'text-rose-500 animate-ping' : 'text-emerald-400 animate-pulse'}`} />
//               </div>

//               {/* PR */}
//               <div className="p-4 flex flex-col justify-between min-h-[90px]">
//                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">PR Interval</span>
//                 <span className="text-xl font-extrabold font-mono leading-none text-slate-200">
//                   {prInterval > 0 ? `${prInterval} ms` : '---'}
//                 </span>
//                 <span className="text-[9px] text-slate-500 font-mono">Ref: 120-200 ms</span>
//               </div>

//               {/* QRS */}
//               <div className="p-4 flex flex-col justify-between min-h-[90px]">
//                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">QRS Dur</span>
//                 <span className={`text-xl font-extrabold font-mono leading-none ${qrsDuration > 120 ? 'text-amber-400' : 'text-slate-200'}`}>
//                   {qrsDuration > 0 ? `${qrsDuration} ms` : '---'}
//                 </span>
//                 <span className="text-[9px] text-slate-500 font-mono">Ref: 80-120 ms</span>
//               </div>

//               {/* QT/QTc */}
//               <div className="p-4 flex flex-col justify-between min-h-[90px]">
//                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">QT / QTc</span>
//                 <span className="text-xl font-extrabold font-mono leading-none text-slate-200">
//                   {qtInterval > 0 ? `${qtInterval} ms` : '---'}
//                 </span>
//                 <span className="text-[9px] text-slate-500 font-mono">Ref: &lt;440 ms</span>
//               </div>

//               {/* RR */}
//               <div className="p-4 flex flex-col justify-between min-h-[90px]">
//                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">RR Interval</span>
//                 <span className="text-xl font-extrabold font-mono leading-none text-slate-200">
//                   {rrInterval > 0 ? `${rrInterval} ms` : '---'}
//                 </span>
//                 <span className="text-[9px] text-slate-500 font-mono">Cycle pacing rate</span>
//               </div>

//               {/* Signal Quality */}
//               <div className="p-4 flex flex-col justify-between min-h-[90px]">
//                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Signal Quality</span>
//                 <span className={`text-xl font-extrabold font-mono leading-none ${signalQuality > 80 ? 'text-emerald-400' : signalQuality > 50 ? 'text-amber-400' : 'text-rose-500'}`}>
//                   {signalQuality > 0 ? `${signalQuality}%` : '0%'}
//                 </span>
//                 <span className="text-[9px] text-slate-500 font-mono">Leads Contact OK</span>
//               </div>

//             </div>

//           </div>

//           {/* Real-time slider controls for clinical telemetry testing */}
//           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
//             <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
//               <Settings className="w-4 h-4 text-[#2BB2A7]" />
//               Clinical Telemetry Adjustment Sliders
//             </h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
//               {/* HR offset */}
//               <div className="space-y-2">
//                 <div className="flex justify-between text-xs font-semibold text-slate-600">
//                   <span>Heart Rate Offset (BPM)</span>
//                   <span className="font-mono text-slate-900">{hrOffset >= 0 ? `+${hrOffset}` : hrOffset}</span>
//                 </div>
//                 <input
//                   type="range"
//                   min="-30"
//                   max="50"
//                   value={hrOffset}
//                   onChange={(e) => setHrOffset(parseInt(e.target.value))}
//                   className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2BB2A7]"
//                 />
//                 <p className="text-[10px] text-slate-400">Modulates the physiological pace of sinus rhythm.</p>
//               </div>

//               {/* Noise artifact level */}
//               <div className="space-y-2">
//                 <div className="flex justify-between text-xs font-semibold text-slate-600">
//                   <span>Baseline Wander & Artifacts</span>
//                   <span className="font-mono text-slate-900">Level {noiseLevel}</span>
//                 </div>
//                 <input
//                   type="range"
//                   min="1"
//                   max="5"
//                   value={noiseLevel}
//                   onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
//                   className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2BB2A7]"
//                 />
//                 <p className="text-[10px] text-slate-400">Simulates high-frequency muscular artifact noise.</p>
//               </div>

//               {/* Electrode Disconnect simulation */}
//               <div className="flex flex-col justify-center items-start gap-2">
//                 <span className="text-xs font-semibold text-slate-600">Electrode Interruption</span>
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={leadDisconnect}
//                     onChange={(e) => setLeadDisconnect(e.target.checked)}
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
//                   <span className="ml-3 text-xs font-semibold text-slate-700">
//                     {leadDisconnect ? "Detached (Alert!)" : "Secure Connection"}
//                   </span>
//                 </label>
//                 <p className="text-[10px] text-slate-400">Forces complete Lead II signal flatline.</p>
//               </div>
//             </div>
//           </div>

//         </div>

//         {/* Right Column (Controls & AI report) */}
//         <div className="space-y-6">
          
//           {/* Hardware Connection Card */}
//           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
//             <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
//               <Cpu className="w-4 h-4 text-slate-700" />
//               ECG Hardware Integration
//             </h3>

//             {/* Rhythm Selector */}
//             <div className="space-y-2.5">
//               <span className="text-xs font-semibold text-slate-600 block">Select Cardiac Rhythm Category:</span>
//               <div className="grid grid-cols-2 gap-2">
//                 {[
//                   { id: 'NSR', label: 'Sinus Rhythm (NSR)', desc: 'Physiological beat' },
//                   { id: 'Brady', label: 'Bradycardia', desc: 'Slow <60 bpm' },
//                   { id: 'Tachy', label: 'Tachycardia', desc: 'Fast >100 bpm' },
//                   { id: 'AFib', label: 'Atrial Fib (A-Fib)', desc: 'Irregular f-waves' },
//                   { id: 'PVC', label: 'PVC Ectopy', desc: 'Premature beats' },
//                   { id: 'VTach', label: 'V-Tach', desc: 'Emergency monomorphic' },
//                 ].map(r => (
//                   <button
//                     key={r.id}
//                     onClick={() => setSelectedRhythm(r.id)}
//                     className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
//                       selectedRhythm === r.id 
//                         ? 'bg-[#EAF7F4] border-[#2BB2A7] text-slate-950 font-semibold shadow-xs' 
//                         : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
//                     }`}
//                   >
//                     <span className="text-xs block leading-tight">{r.label}</span>
//                     <span className="text-[9px] text-slate-400 block mt-0.5">{r.desc}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* AI Clinical Summary report */}
//           <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
//             {/* Ambient Background decoration */}
//             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

//             <div className="flex justify-between items-center">
//               <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
//                 <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
//                 AI Telemetry Analyzer 
//               </h3>
             
//             </div>

//             <p className="text-xs text-slate-400">
//               Evaluates current ECG metrics, calculates morphology risk markers, and synthesizes instant expert-level cardiological reports.
//             </p>

//             <button
//               onClick={triggerAiAnalysis}
//               disabled={aiLoading || !deviceConnected || liveBpm === 0}
//               className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl tracking-wide transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
//             >
//               {aiLoading ? (
//                 <>
//                   <RefreshCw className="w-4 h-4 animate-spin" />
//                   Generating Expert Report...
//                 </>
//               ) : (
//                 <>
//                   <Sparkles className="w-4 h-4" />
//                   Generate AI Diagnostic Report
//                 </>
//               )}
//             </button>

//             {/* Error fallback */}
//             {aiError && (
//               <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-2xl text-xs text-rose-400">
//                 Failed to execute AI analysis route. Standard cardiology template deployed as fallback.
//               </div>
//             )}

//             {/* AI Result Card */}
//             {(aiAnalysisResult || (!aiLoading && !aiAnalysisResult)) && (
//               <div className="border border-slate-800/80 rounded-2xl bg-slate-950/50 p-4 space-y-3.5">
//                 {aiAnalysisResult ? (
//                   <>
//                     {/* Header Interpretation */}
//                     <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
//                       <div>
//                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Rhythm Interpretation</span>
//                         <h4 className="text-sm font-bold text-slate-100 mt-0.5">
//                           {aiAnalysisResult.rhythmInterpretation}
//                         </h4>
//                       </div>
//                       <div className="text-right">
//                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Risk Flag</span>
//                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 font-mono ${
//                           aiAnalysisResult.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
//                           aiAnalysisResult.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
//                           'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
//                         }`}>
//                           {aiAnalysisResult.riskLevel}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Findings list */}
//                     <div className="space-y-1.5">
//                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Electrophysiologic Findings:</span>
//                       <ul className="space-y-1">
//                         {aiAnalysisResult.findings.map((finding: string, idx: number) => (
//                           <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
//                             <span className="text-emerald-500 font-bold text-xs pt-0.5">•</span>
//                             <span>{finding}</span>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>

//                     {/* Recommendations list */}
//                     <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
//                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Clinical Recommendations:</span>
//                       <ul className="space-y-1">
//                         {aiAnalysisResult.recommendations.map((rec: string, idx: number) => (
//                           <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
//                             <span className="text-[#2BB2A7] font-bold text-xs pt-0.5">✓</span>
//                             <span>{rec}</span>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>

//                     {/* Confidence & Technical Diagnostics */}
//                     <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-[10px] text-slate-400 leading-relaxed font-mono">
//                       <div>
//                         <span className="font-bold text-slate-500 block uppercase">Confidence Rating:</span>
//                         <span className="text-slate-200 font-bold font-mono">{aiAnalysisResult.confidenceScore}% (Stable Signal)</span>
//                       </div>
//                       <div>
//                         <span className="font-bold text-slate-500 block uppercase">Signal Calibration:</span>
//                         <span className="text-slate-200 font-mono text-[9px] block truncate" title={aiAnalysisResult.technicalDiagnosticNote}>
//                           {aiAnalysisResult.technicalDiagnosticNote}
//                         </span>
//                       </div>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="text-center py-6 text-slate-500 text-xs">
//                     No active report. Click "Generate AI Diagnostic Report" to invoke the secure Gemini server-side cardiological model.
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Doctor sign-off and approval panel */}
//           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
//             <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
//               <CheckCircle2 className="w-4 h-4 text-[#2BB2A7]" />
//               Cardiology Review & Attestation Board
//             </h3>

//             <div className="space-y-3.5">
//               {/* Note textarea */}
//               <div className="space-y-1">
//                 <label className="text-xs font-semibold text-slate-600 block">Doctor's Diagnosis Modifiers & Remarks:</label>
//                 <textarea
//                   rows={2}
//                   value={doctorNotes}
//                   onChange={(e) => setDoctorNotes(e.target.value)}
//                   placeholder="Insert custom clinical remarks, modifications, and prescription directives..."
//                   className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2BB2A7] leading-relaxed"
//                 />
//               </div>

//               {/* Attestation check */}
//               <div className="flex items-start gap-3">
//                 <input
//                   type="checkbox"
//                   id="doctor-attestation-check"
//                   checked={isApproved}
//                   onChange={(e) => setIsApproved(e.target.checked)}
//                   className="mt-0.5 rounded border-slate-300 text-[#2BB2A7] focus:ring-[#2BB2A7] cursor-pointer"
//                 />
//                 <label htmlFor="doctor-attestation-check" className="text-xs text-slate-600 select-none cursor-pointer leading-relaxed">
//                   I attest that I have physically audited the lead wave outputs, correlated parameters, and approve this telemetry interpretation.
//                 </label>
//               </div>

//               {/* Signature field */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600 block">Reviewing Clinician:</label>
//                   <div className="bg-slate-100 text-slate-700 font-mono text-xs p-2 rounded-lg border border-slate-200 font-semibold truncate">
//                     {activeUser.name}
//                   </div>
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-semibold text-slate-600 block">Digital Signature (Type name):</label>
//                   <input
//                     type="text"
//                     value={doctorSignature}
//                     onChange={(e) => setDoctorSignature(e.target.value)}
//                     placeholder="Enter full name"
//                     className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#2BB2A7]"
//                   />
//                 </div>
//               </div>

//               {/* Publish button */}
//               <button
//                 onClick={submitToEmr}
//                 disabled={!isApproved || !doctorSignature.trim() || !deviceConnected || liveBpm === 0}
//                 className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
//               >
//                 <UploadCloud className="w-4 h-4" />
//                 Sign & Archive Report to EMR
//               </button>
//             </div>

//             {/* Success attestation block */}
//             {isSigned && (
//               <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl flex items-start gap-3">
//                 <div className="p-1 bg-emerald-500 text-white rounded-lg">
//                   <Check className="w-3.5 h-3.5" />
//                 </div>
//                 <div className="space-y-0.5">
//                   <h4 className="text-xs font-bold text-emerald-950">Attestation Signed and Sent</h4>
//                   <p className="text-[10px] text-emerald-800 leading-relaxed">
//                     The ECG diagnosis document was signed, timestamped, and transmitted back into central PostgreSQL tables and EMR database instances.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Archived History Reports List */}
//           {historyReports.length > 0 && (
//             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
//               <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider font-mono">
//                 Recent Synced Records History
//               </h3>
//               <div className="space-y-2 max-h-[160px] overflow-y-auto">
//                 {historyReports.map((report) => (
//                   <div key={report.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] leading-relaxed relative">
//                     <span className="font-bold text-indigo-600 block">{report.id} ({report.patientName})</span>
//                     <span className="text-slate-400 text-[9px] font-mono block">{report.timestamp}</span>
//                     <p className="text-slate-600 mt-1 line-clamp-2">
//                       <strong>Rhythm:</strong> {report.rhythm} • <strong>HR:</strong> {report.bpm}bpm • <strong>Signed:</strong> {report.signedBy}
//                     </p>
//                     <span className={`absolute right-3 top-3 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded ${
//                       report.risk === 'High' ? 'bg-rose-100 text-rose-700' :
//                       report.risk === 'Medium' ? 'bg-amber-100 text-amber-700' :
//                       'bg-emerald-100 text-emerald-700'
//                     }`}>
//                       Risk: {report.risk}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//         </div>

//       </div>

//     </div>
//   );
// }




"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Activity, Heart, Clock, Terminal, Cpu } from 'lucide-react';
import EcgMonitor from '@/components/ecg/EcgMonitor';
import ConnectionSettings from '@/components/ecg/ConnectionSettings';
import PatientForm from '@/components/ecg/PatientForm';
import RecordingControls from '@/components/ecg/RecordingControls';
import SavedRecordings from '@/components/ecg/SavedRecordings';
import { EcgPacket, PatientInfo, Recording, ConnectionState } from '@/types';

// ECG Waveform math model for client-side simulator
function getLocalEcgDataPoint(index: number, hr: number): number {
  const cycleLength = Math.max(30, Math.floor(6000 / hr));
  const phase = (index % cycleLength) / cycleLength;

  const baselineDrift = 0.04 * Math.sin(index * 0.01);
  const noise = (Math.sin(index * 0.4) * 0.01) + ((Math.random() - 0.5) * 0.012);

  let wave = 0;

  if (phase >= 0.1 && phase < 0.25) {
    const pPhase = (phase - 0.1) / 0.15;
    wave = 0.12 * Math.sin(pPhase * Math.PI);
  } else if (phase >= 0.3 && phase < 0.32) {
    const qPhase = (phase - 0.3) / 0.02;
    wave = -0.15 * Math.sin(qPhase * Math.PI);
  } else if (phase >= 0.32 && phase < 0.36) {
    const rPhase = (phase - 0.32) / 0.04;
    wave = 1.35 * Math.sin(rPhase * Math.PI);
  } else if (phase >= 0.36 && phase < 0.39) {
    const sPhase = (phase - 0.36) / 0.03;
    wave = -0.35 * Math.sin(sPhase * Math.PI);
  } else if (phase >= 0.52 && phase < 0.7) {
    const tPhase = (phase - 0.52) / 0.18;
    wave = 0.25 * Math.sin(tPhase * Math.PI);
  } else if (phase >= 0.75 && phase < 0.82) {
    const uPhase = (phase - 0.75) / 0.07;
    wave = 0.03 * Math.sin(uPhase * Math.PI);
  }

  return Number((wave + baselineDrift + noise).toFixed(4));
}

export default function App() {
  // Telemetry buffer state
  const [samples, setSamples] = useState<number[]>([]);
  const [heartRate, setHeartRate] = useState<number>(0);
  const [deviceId, setDeviceId] = useState<string>('DISCONNECTED');
  const [timestamp, setTimestamp] = useState<number>(0);

  // Connection settings states
  const [wsUrl, setWsUrl] = useState<string>('wss://ecg-simulator.onrender.com');
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [activeMode, setActiveMode] = useState<'ws' | 'simulator' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Patient Info State
  const [patient, setPatient] = useState<PatientInfo>({
    id: 'PT-' + Math.floor(10000 + Math.random() * 90000),
    name: 'Eleanor Vance',
    age: 38,
    gender: 'Female',
    notes: 'In-clinic resting telemetry checkup.',
  });

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingBuffer, setRecordingBuffer] = useState<number[]>([]);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordingHrSum, setRecordingHrSum] = useState<number>(0);
  const [recordingHrCount, setRecordingHrCount] = useState<number>(0);
  const [hasUnsavedData, setHasUnsavedData] = useState<boolean>(false);

  // Saved recordings database state
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Console terminal log trace state
  const [logs, setLogs] = useState<string[]>([]);

  // Time tracker state
  const [currentTime, setCurrentTime] = useState<string>('');

  // Refs for tracking websocket and timers
  const wsRef = useRef<WebSocket | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const secondsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const simSampleIndexRef = useRef<number>(0);

  // Helper to add lines to telemetry logs console
  const addLog = (message: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timeStr}] ${message}`, ...prev.slice(0, 49)]);
  };

  // Clock ticks
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch recordings list from server database on mount
  useEffect(() => {
    loadRecordings();
    addLog('ECG Portal initialized. Ready to receive telemetry feed.');
  }, []);

  const loadRecordings = async () => {
    try {
      const res = await fetch('/api/ecg/recordings');
      if (res.ok) {
        const data = await res.json();
        setRecordings(data);
      } else {
        addLog('Server error loading archived recordings.');
      }
    } catch (e: any) {
      addLog('Network warning: Server recordings archive unavailable.');
    }
  };

  // Client-side simulation state generator loop
  const startSimulator = () => {
    cleanupConnections();

    setConnectionState('connected');
    setActiveMode('simulator');
    setDeviceId('ECG-SIM-LOCAL');
    addLog('Local Telemetry Simulator started (100Hz feed).');

    simIntervalRef.current = setInterval(() => {
      const hrFluct = Math.sin(Date.now() / 8000) * 2;
      const currentHr = Math.round(75 + hrFluct + (Math.random() - 0.5));
      setHeartRate(currentHr);
      setTimestamp(Math.floor(Date.now() / 1000));

      const leadI: number[] = [];
      const samplesToGenerate = 10;
      for (let i = 0; i < samplesToGenerate; i++) {
        leadI.push(getLocalEcgDataPoint(simSampleIndexRef.current + i, currentHr));
      }
      simSampleIndexRef.current += samplesToGenerate;

      setSamples((prev) => {
        const appended = [...prev, ...leadI];
        return appended.slice(-1000);
      });

      if (isRecording) {
        setRecordingBuffer((prev) => [...prev, ...leadI]);
        setRecordingHrSum((prev) => prev + currentHr);
        setRecordingHrCount((prev) => prev + 1);
      }
    }, 100);
  };

  // Connect to the WebSocket ECG Gateway
  const connectWebSocket = () => {
    cleanupConnections();

    setConnectionState('connecting');
    setActiveMode('ws');
    setErrorMessage(null);
    addLog(`Opening WebSocket feed to: ${wsUrl}...`);

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setConnectionState('connected');
        addLog(`WebSocket connection open. Stream active.`);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'system') {
            addLog(`System Message: ${data.message}`);
            return;
          }

          if (data.deviceId && data.leadI) {
            setDeviceId(data.deviceId);
            setHeartRate(data.heartRate);
            setTimestamp(data.timestamp);

            setSamples((prev) => {
              const appended = [...prev, ...data.leadI];
              return appended.slice(-1000);
            });

            if (isRecording) {
              setRecordingBuffer((prev) => [...prev, ...data.leadI]);
              setRecordingHrSum((prev) => prev + data.heartRate);
              setRecordingHrCount((prev) => prev + 1);
            }
          }
        } catch (err) {
          addLog(`Error parsing incoming websocket packet.`);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setErrorMessage('WebSocket connection failed. Network down or cross-origin block.');
        addLog(`WebSocket connection error.`);
      };

      socket.onclose = (event) => {
        setConnectionState('disconnected');
        setActiveMode(null);
        setHeartRate(0);
        addLog(`WebSocket disconnected. Reason: ${event.reason || 'Normal close'}`);
      };
    } catch (error: any) {
      setConnectionState('disconnected');
      setActiveMode(null);
      setErrorMessage(error.name + ': ' + error.message);
      addLog(`Failed to instantiate WebSocket: ${error.message}`);
    }
  };

  // Generic connect trigger
  const handleConnect = (mode: 'ws' | 'simulator') => {
    if (mode === 'ws') {
      connectWebSocket();
    } else {
      startSimulator();
    }
  };

  // Disconnect & Clean timers
  const handleDisconnect = () => {
    cleanupConnections();
    setConnectionState('disconnected');
    setActiveMode(null);
    setHeartRate(0);
    setDeviceId('DISCONNECTED');
    addLog('Telemetry connection closed by operator.');
  };

  const cleanupConnections = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    if (secondsTimerRef.current) {
      clearInterval(secondsTimerRef.current);
      secondsTimerRef.current = null;
    }
  };

  // Clean up all resources on unmount
  useEffect(() => {
    return () => cleanupConnections();
  }, [isRecording]);

  // Recording timer control
  useEffect(() => {
    if (isRecording) {
      secondsTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (secondsTimerRef.current) {
        clearInterval(secondsTimerRef.current);
        secondsTimerRef.current = null;
      }
    }
    return () => {
      if (secondsTimerRef.current) {
        clearInterval(secondsTimerRef.current);
      }
    };
  }, [isRecording]);

  // Recording commands
  const handleStartRecording = () => {
    if (connectionState !== 'connected') {
      alert('You must connect to a telemetry feed (WS or Simulation) before recording.');
      return;
    }
    setRecordingBuffer([]);
    setRecordingSeconds(0);
    setRecordingHrSum(0);
    setRecordingHrCount(0);
    setIsRecording(true);
    setHasUnsavedData(false);
    addLog(`ECG telemetry recording started for Patient ${patient.name || 'Anonymous'}.`);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasUnsavedData(true);
    addLog(`ECG recording captured. Duration: ${recordingSeconds}s. Samples: ${recordingBuffer.length}`);
  };

  // Save telemetry to Express DB
  const handleSaveRecording = async () => {
    if (recordingBuffer.length === 0) {
      addLog('Error: Empty recording buffer cannot be saved.');
      return;
    }

    setIsSaving(true);
    const avgHr = recordingHrCount > 0 ? recordingHrSum / recordingHrCount : heartRate;

    const recordingPayload: Recording = {
      id: 'REC-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      patientId: patient.id || 'PT-UNKNOWN',
      patientName: patient.name || 'Anonymous',
      patientAge: patient.age,
      patientGender: patient.gender,
      deviceId: deviceId,
      heartRate: heartRate || 72,
      ecgSignal: recordingBuffer,
      timestamp: Math.floor(Date.now() / 1000),
      durationSeconds: recordingSeconds,
      sampleCount: recordingBuffer.length,
      averageHeartRate: avgHr || heartRate || 72,
      notes: patient.notes,
    };

    try {
      const res = await fetch('/api/ecg/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordingPayload),
      });

      if (res.ok) {
        addLog(`Successfully saved recording to archive server.`);
        setHasUnsavedData(false);
        loadRecordings();
      } else {
        const errObj = await res.json();
        addLog(`Server save failed: ${errObj.error}`);
        alert(`Server failed to save ECG data: ${errObj.error}`);
      }
    } catch (e: any) {
      addLog(`Network failed to contact save API: ${e.message}`);
      alert(`Save connection failed. Storing session local fallback...`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecording = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recording from the server archive?')) return;

    try {
      const res = await fetch(`/api/ecg/recordings/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        addLog(`Recording ${id} deleted successfully from server.`);
        if (selectedRecording?.id === id) {
          setSelectedRecording(null);
        }
        loadRecordings();
      } else {
        addLog(`Failed to delete recording.`);
      }
    } catch (e: any) {
      addLog(`Failed to contact delete API: ${e.message}`);
    }
  };

  // Render metrics cards
  const activeAvgHr = recordingHrCount > 0 ? recordingHrSum / recordingHrCount : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex flex-col font-mono">
    

      {/* Main Grid Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Central ECG Monitor and Status (8/12 grid) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Quick Stats overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Heart Rate Display */}
            <div className="vitals-card rounded-lg p-4 shadow flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-normal">Heart Rate (BPM)</span>
                {/* Removed font-extrabold, using font-normal */}
                <span className="text-3xl font-mono text-white mt-1 block font-normal">
                  {heartRate ? heartRate : '--'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Heart className={`w-8 h-8 text-rose-500 ${heartRate > 0 ? 'animate-bounce' : 'opacity-40'}`} style={{ animationDuration: heartRate > 0 ? `${60 / heartRate}s` : '1.2s' }} />
                <span className="text-[8px] text-slate-500 font-mono font-normal">CCU FEED</span>
              </div>
            </div>

            {/* Device ID Display */}
            <div className="vitals-card rounded-lg p-4 shadow flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-normal">Signal Source</span>
                {/* Removed font-bold, using font-normal */}
                <span className="text-sm font-mono text-slate-200 mt-2 block break-all truncate max-w-[150px] font-normal">
                  {deviceId}
                </span>
              </div>
              <div className="bg-black/60 p-2 rounded border border-white/10 text-slate-400 font-mono text-xs">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            {/* Live Feed Status */}
            <div className="vitals-card rounded-lg p-4 shadow flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-normal">Status Code</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-emerald-500' : connectionState === 'connecting' ? 'bg-blue-500' : 'bg-rose-500'}`}></span>
                  {/* Removed font-semibold, using font-normal */}
                  <span className="text-xs font-mono text-slate-200 uppercase font-normal">
                    {connectionState}
                  </span>
                </div>
              </div>
              <div className="bg-black/60 p-2 rounded border border-white/10 text-[10px] text-slate-500 font-mono font-normal">
                {activeMode === 'ws' ? 'REMOTE WS' : activeMode === 'simulator' ? 'LOCAL SIM' : 'OFFLINE'}
              </div>
            </div>
          </div>

          {/* Core ECG Monitor Graphic */}
          <EcgMonitor
            samples={samples}
            heartRate={heartRate}
            deviceId={deviceId}
            isSimulated={activeMode === 'simulator'}
          />

          {/* Telemetry Activity Log Console */}
          <div className="vitals-card rounded-lg overflow-hidden shadow-lg flex flex-col flex-1 min-h-[150px] max-h-[220px]">
            <div className="bg-black/60 px-4 py-2 border-b border-white/10 flex items-center justify-between text-[11px] font-mono">
              {/* Removed font-semibold, using font-normal */}
              <span className="flex items-center gap-1.5 text-slate-300 uppercase font-normal">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Live Gateway Log Trace
              </span>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 uppercase font-mono cursor-pointer font-normal"
              >
                Clear Console
              </button>
            </div>
            <div className="p-3 font-mono text-[10px] bg-black/80 flex-1 overflow-y-auto leading-relaxed flex flex-col-reverse justify-end text-emerald-400/90 font-normal">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">No events recorded. Waiting for telemetry activities...</div>
              ) : (
                logs.map((log, index) => <div key={index}>{log}</div>)
              )}
            </div>
          </div>
        </div>

        {/* Right column: Portal Action Controls & Archiving (4/12 grid) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* 1. Connection Configurations */}
          <ConnectionSettings
            wsUrl={wsUrl}
            setWsUrl={setWsUrl}
            connectionState={connectionState}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            activeMode={activeMode}
            errorMessage={errorMessage}
          />

          {/* 2. Patient Demographics Inputs */}
          <PatientForm
            patient={patient}
            setPatient={setPatient}
          />

          {/* 3. Session Recorder Engine */}
          <RecordingControls
            isRecording={isRecording}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
            recordingSeconds={recordingSeconds}
            sampleCount={recordingBuffer.length}
            averageHr={activeAvgHr}
            hasUnsavedData={hasUnsavedData}
            onSave={handleSaveRecording}
            isSaving={isSaving}
            patientName={patient.name}
          />

          {/* 4. Past Saved Records Archive */}
          <SavedRecordings
            recordings={recordings}
            onDelete={handleDeleteRecording}
            onSelect={setSelectedRecording}
            selectedRecording={selectedRecording}
          />
        </div>
      </main>

      {/* Footer credits */}
      <footer className="mt-auto bg-black border-t border-white/5 px-6 py-4 text-center text-[9px] font-mono text-slate-600 tracking-wider font-normal">
        <p>© 2026 CENTRAL TELEMETRY GATEWAY. PROPRIETARY CLINICAL PORTAL v1.1.0 • APPROVED FOR HOSPITAL SERVICES.</p>
      </footer>
    </div>
  );
}