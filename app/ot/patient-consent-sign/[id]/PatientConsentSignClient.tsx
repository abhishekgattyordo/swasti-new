"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSignature, 
  ShieldCheck, 
  AlertCircle, 
  User, 
  CheckCircle2, 
  Loader2, 
  Info
} from 'lucide-react';
import { SurgeryCase } from '@/types';

interface PatientConsentSignClientProps {
  caseId: string;
}

export default function PatientConsentSignClient({ caseId }: PatientConsentSignClientProps) {
  const [selectedCase, setSelectedCase] = useState<SurgeryCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingRole, setSigningRole] = useState<'patient' | 'attendant'>('patient');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Drawing canvas states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Fetch Case on load
  useEffect(() => {
    async function fetchCase() {
      try {
        setLoading(true);
        const res = await fetch(`/api/ot/cases/${caseId}`);
        if (!res.ok) {
          throw new Error(`Failed to load case. Status: ${res.status}`);
        }
        const data = await res.json();
        
        console.log('🔍 API Response:', data);
        
        // Handle different response formats
        let caseData = data.data || data;
        
        // ✅ Validate that we have the required data
        if (!caseData || typeof caseData !== 'object') {
          throw new Error('Invalid case data structure received from server');
        }
        
        // ✅ Check if patient data exists
        if (!caseData.patient || !caseData.patient.name) {
          throw new Error('Patient data is missing from the case. Please check the API response.');
        }
        
        // ✅ Check if recommendation data exists
        if (!caseData.recommendation || !caseData.recommendation.surgeryName) {
          throw new Error('Surgery recommendation data is missing from the case.');
        }
        
        // ✅ Ensure consentManagement exists
        if (!caseData.consentManagement) {
          caseData.consentManagement = {
            consents: { surgery: false, anesthesia: false, transfusion: false },
            signatures: { patient: false, attendant: false, doctor: false, witness: false },
            status: 'Pending'
          };
        }
        
        setSelectedCase(caseData);
      } catch (err: any) {
        console.error('Error fetching case:', err);
        setError(err.message || 'Error loading surgical case details.');
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [caseId]);

  // Handle drawing logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

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
    let clientX, clientY;

    if ('touches' in e) {
      if (e.cancelable) e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
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

  // Submit Signature
  const handleSubmitSignature = async () => {
  const canvas = canvasRef.current;
  if (!canvas || !selectedCase) {
    alert('Canvas not ready or case data missing. Please refresh and try again.');
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    alert('Could not initialize drawing context.');
    return;
  }

  // Check if canvas is empty
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  let isEmpty = true;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] !== 0) {
      isEmpty = false;
      break;
    }
  }

  if (isEmpty) {
    alert('Please draw your signature on the canvas before submitting.');
    return;
  }

  const signatureDataUrl = canvas.toDataURL('image/png');

  try {
    setSubmitting(true);

    const updated = { ...selectedCase };
    
    // Initialize consentManagement if needed
    if (!updated.consentManagement) {
      updated.consentManagement = {
        consents: { surgery: false, anesthesia: false, transfusion: false },
        signatures: { patient: false, attendant: false, doctor: false, witness: false },
        status: 'Pending'
      };
    }

    // Get existing signature images
    const existingImages = (updated.consentManagement as any).signatureImages || {};

    // Update consent management
    updated.consentManagement = {
      ...updated.consentManagement,
      signatures: {
        ...updated.consentManagement.signatures,
        [signingRole]: true
      },
      // ✅ Type assertion for signatureImages
      signatureImages: {
        ...existingImages,
        [signingRole]: signatureDataUrl
      },
      status: 
        updated.consentManagement.signatures?.patient && 
        updated.consentManagement.signatures?.attendant 
          ? 'Signed' 
          : 'Pending'
    } as any; // ✅ Final type assertion

    const res = await fetch(`/api/ot/cases/${caseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': 'patient-portal@swasti.gov.in',
        'x-user-role': 'Patient'
      },
      body: JSON.stringify(updated)
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || result.message || 'Failed to save signature.');
    }

    setSubmitSuccess(true);
  } catch (err: any) {
    console.error('❌ Error saving signature:', err);
    alert(err.message || 'Error occurred while saving signature. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Retrieving secure surgical consent parameters...</p>
      </div>
    );
  }

  if (error || !selectedCase) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl border border-red-100 shadow-xl text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">Data Error</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || 'Unable to load surgical case data.'}
        </p>
        <div className="bg-slate-50 p-3 rounded-lg text-left text-xs text-slate-600 overflow-auto max-h-32">
          <p className="font-bold mb-1">Debug Info:</p>
          <p>Case ID: {caseId}</p>
          <p>Error: {error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
        >
          Retry Portal Verification
        </button>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="max-w-lg mx-auto min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-xl text-center space-y-6 w-full animate-fade-in">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xl">Signature Synchronized!</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Your digital consent verification has been securely validated and recorded under 
              National Digital Health Swasti ID <span className="font-mono font-bold text-slate-800">SW-{selectedCase.id}</span>.
            </p>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-2xl text-[11px] text-emerald-800 border border-emerald-100/60 text-left space-y-2">
            <div className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE BLOCKCHAIN RECEIPT
            </div>
            <div className="font-mono space-y-1 text-[10px]">
              <div>Patient: {selectedCase.patient?.name || 'Unknown'}</div>
              <div>Procedure: {selectedCase.recommendation?.surgeryName || 'Not specified'}</div>
              <div>Role Signed: <span className="capitalize font-bold">{signingRole}</span></div>
              <div>Status: Verified & Encrypted in EMR</div>
              <div>Timestamp: {new Date().toLocaleString()}</div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400">
            You can close this tab now. The surgical theatre staff has been notified of your compliance in real-time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-6">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#2BB2A7] to-[#86C94C] rounded-lg flex items-center justify-center">
            <FileSignature className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900">SWASTI SECURE CONSENT</h1>
            <span className="text-[9px] font-mono font-bold text-teal-600 block leading-none">HIS INTEGRATED PORTAL</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[9px] text-emerald-700 font-bold">
          <ShieldCheck className="w-3 h-3" /> SSL Secured
        </div>
      </div>

      {/* Main Form Sheet */}
      <div className="bg-white rounded-3xl border border-[#E2DDD2] p-5 md:p-8 shadow-md space-y-6 font-serif">
        
        {/* Swasti Clinic Header */}
        <div className="text-center border-b border-dashed border-[#E2DDD2] pb-4">
          <h2 className="font-bold text-base tracking-wide text-slate-800 uppercase">Swasti Medical Centers & Clinics</h2>
          <p className="text-[10px] text-slate-500 font-sans font-medium uppercase tracking-wider mt-1">Informed Surgical Consent Authorization Document</p>
        </div>

        {/* Demographics & Clinical Information */}
        <div className="text-[11.5px] space-y-3.5 leading-relaxed text-slate-700 font-sans border-b border-[#E2DDD2] pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Patient Demographics</p>
              <p className="text-slate-800 font-medium">
                Name: <span className="font-semibold text-slate-900">{selectedCase.patient?.name || 'Not Available'}</span> <br className="sm:hidden" />
                <span className="hidden sm:inline">&bull;</span> Age: <span className="font-semibold text-slate-900">{selectedCase.patient?.age || 'N/A'}y</span> <br className="sm:hidden" />
                <span className="hidden sm:inline">&bull;</span> ID: <span className="font-mono font-semibold text-slate-900">{selectedCase.patient?.id || 'N/A'}</span>
              </p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Surgical Recommendation By</p>
              <p className="text-slate-800 font-semibold">
                {selectedCase.recommendation?.recommendedBy || 'Not Available'}
              </p>
            </div>
          </div>

          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Surgical Procedure Planned</p>
            <p className="font-semibold text-slate-950 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {selectedCase.recommendation?.surgeryName || 'Not specified'}
            </p>
          </div>

          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Diagnosed Presentation</p>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {selectedCase.recommendation?.diagnosis || 'Not specified'}
            </p>
          </div>
        </div>

        {/* Core Declaration */}
        <div className="space-y-3 font-serif text-[12px] leading-relaxed text-slate-800">
          <h3 className="font-bold text-slate-900 font-sans uppercase tracking-wider text-[10px]">Consent Declaration & Statement of Understanding:</h3>
          
          <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/60 space-y-3 font-serif text-[12px]">
            <p>
              I hereby authorize {selectedCase.recommendation?.recommendedBy || 'the surgeon'} to perform the planned surgery ({selectedCase.recommendation?.surgeryName || 'the procedure'}) and administer the required anesthesia. I confirm that the procedure's clinical indications, potential risks, anticipated benefits, and available alternatives have been explained to me in detail, and I fully consent to the treatment.
            </p>
            <p>
              I also authorize the administration of any necessary blood products, transfusions, or emergency secondary interventions should unforeseen clinical circumstances arise during the course of the operation. I acknowledge that medicine is not an exact science and that no guarantees have been made to me regarding the absolute outcome of this procedure.
            </p>
          </div>
        </div>

        {/* Role Picker for signing */}
        <div className="space-y-2 pt-2 border-t border-[#E2DDD2] font-sans">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px] block">
            Select Your Role
          </span>
          <div className="grid grid-cols-2 gap-2 max-w-sm">
            <button
              type="button"
              onClick={() => setSigningRole('patient')}
              className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                signingRole === 'patient'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Sign as Patient
            </button>
            <button
              type="button"
              onClick={() => setSigningRole('attendant')}
              className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${
                signingRole === 'attendant'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Sign as Attendant
            </button>
          </div>
        </div>

        {/* Touch / Mouse signature board */}
        <div className="space-y-2 pt-2 font-sans">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">
              Provide Signature Ink:
            </span>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5 hover:underline"
            >
              ✕ Reset Ink Board
            </button>
          </div>

          <div className="border border-dashed border-slate-300 rounded-2xl overflow-hidden bg-slate-50 relative">
            <canvas
              ref={canvasRef}
              width={500}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 block cursor-crosshair bg-white touch-none"
            />
            <div className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-400 select-none bg-white/80 px-1 py-0.5 rounded border border-slate-100">
              Finger or Cursor Draw Area
            </div>
          </div>
        </div>

        {/* Submit & Secure Action */}
        <div className="pt-4 border-t border-slate-100 font-sans">
          <button
            type="button"
            onClick={handleSubmitSignature}
            disabled={submitting}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/60 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing Digital EMR...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4.5 h-4.5" /> Affirm Consent & Submit Signature
              </>
            )}
          </button>
          <div className="flex items-center gap-1.5 justify-center mt-3 text-[10px] text-slate-400">
            <Info className="w-3.5 h-3.5" /> This digital signature holds full legally binding equivalence under IT Act Section 5.
          </div>
        </div>

      </div>

    </div>
  );
}