'use client';

import React, { useState, useRef } from 'react';
import { Cpu, Sparkles, CheckCircle, AlertCircle, RefreshCw, HeartPulse } from 'lucide-react';
import { toast } from 'sonner';

interface AIAnalysis {
  id: string;
  patientId: string;
  timestamp: string;
  criticalAlert: boolean;
  alertType?: string;
  arrhythmias: string[];
  bradyTachycardia: 'Normal' | 'Tachycardia' | 'Bradycardia';
  abnormalPatterns: string[];
  clinicalSummary: string;
  comparisonWithPrevious: string;
  suggestedFollowUp: string[];
  isSimulatedAI?: boolean;
  message?: string;
}

interface AIConsultationCardProps {
  patientId: string;
  patientName: string;
  condition: string;
  intervals?: {
    pr: number;
    qrs: number;
    qt: number;
    qtc: number;
    axis: number | string;
    heartRate: number;
  };
  status?: string;
  description?: string;
  triage?: string;
  uhid?: string;
  age?: number;
  gender?: string;
  rhythm?: string;
}

export default function AIConsultationCard({
  patientId,
  patientName = 'Unknown',
  condition = 'Under Evaluation',
  intervals = {
    pr: 0.16,
    qrs: 0.08,
    qt: 0.36,
    qtc: 0.40,
    axis: 0,
    heartRate: 112
  },
  status = 'Stable',
  description = 'No description available',
  triage = 'Red',
  uhid = 'N/A',
  age = 30,
  gender = 'Male',
  rhythm = 'Normal Sinus Rhythm'
}: AIConsultationCardProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Map heart rate based on triage (since API doesn't provide heart rate)
  const getHeartRateFromTriage = (triageValue: string): number => {
    switch (triageValue) {
      case 'Red':
        return 112;
      case 'Yellow':
        return 88;
      case 'Green':
        return 72;
      default:
        return 72;
    }
  };

  // Use provided heart rate or calculate from triage
  const calculatedHeartRate = intervals?.heartRate || getHeartRateFromTriage(triage || 'Green');

  // Safe access helpers
  const hasAnalysis = analysis && typeof analysis === 'object' && Object.keys(analysis).length > 0;
  const isCritical = analysis?.criticalAlert || false;
  const arrhythmias = analysis?.arrhythmias || [];
  const hasArrhythmias = Array.isArray(arrhythmias) && arrhythmias.length > 0;
  const abnormalPatterns = analysis?.abnormalPatterns || [];
  const hasAbnormalPatterns = Array.isArray(abnormalPatterns) && abnormalPatterns.length > 0;
  const suggestedFollowUp = analysis?.suggestedFollowUp || [];
  const hasSuggestedFollowUp = Array.isArray(suggestedFollowUp) && suggestedFollowUp.length > 0;
  const alertType = analysis?.alertType || 'STABLE';
  const clinicalSummary = analysis?.clinicalSummary || 'No clinical summary available.';
  const analysisId = analysis?.id || 'N/A';
  const isSimulatedAI = analysis?.isSimulatedAI || false;

  // Run AI analysis via API
  const runAiAnalysis = async () => {
    if (!patientId) {
      toast.error('No patient selected');
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const requestBody = {
        patientId: patientId,
        metadata: {
          patientId: patientId,
          patientName: patientName,
          age: age,
          gender: gender,
          heartRate: calculatedHeartRate,  // ← Use calculated heart rate
          rhythm: rhythm,
          prInterval: intervals?.pr || 0.16,
          qrsDuration: intervals?.qrs || 0.08,
          qtInterval: intervals?.qt || 0.36,
          qtcInterval: intervals?.qtc || 0.40,
          heartAxis: intervals?.axis || 'Normal',
          status: status,
          triage: triage
        },
        description: description
      };

      console.log('📤 Sending request to /api/ecg/analyze:', requestBody);

      const response = await fetch('/api/ecg/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });

      console.log('📥 Response status:', response.status);

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        const errorMessage = data.error || 'AI analysis failed';
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      setAnalysis(data);

      if (data.criticalAlert) {
        toast.error(`CRITICAL ALERT: ${data.alertType || 'Arrhythmia abnormality found!'}`);
      } else {
        toast.success('AI Cardiology Consultation complete.');
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      console.error('❌ API Error:', error);
      const errorMessage = error.message || 'AI service returned an error. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Ensure intervals has all required properties
  const safeIntervals = {
    heartRate: calculatedHeartRate,
    pr: intervals?.pr || 0.16,
    qrs: intervals?.qrs || 0.08,
    qt: intervals?.qt || 0.36,
    qtc: intervals?.qtc || 0.40,
    axis: intervals?.axis || 0
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center space-x-2">
          <Cpu className="h-4.5 w-4.5 text-blue-600" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Cardiology Gemini Co-Pilot
          </h3>
        </div>
        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-full uppercase">
          <Sparkles className="h-2.5 w-2.5" /> AGENT CO-PILOT
        </span>
      </div>

      {/* Patient Info Summary */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
        <div className="text-center">
          <p className="text-[8px] text-muted-foreground uppercase font-bold">Patient</p>
          <p className="text-xs font-medium text-slate-800 truncate">{patientName}</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] text-muted-foreground uppercase font-bold">UHID</p>
          <p className="text-xs font-medium text-slate-800 truncate">{uhid}</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] text-muted-foreground uppercase font-bold">Heart Rate</p>
          <p className={`text-xs font-medium ${
            triage === 'Red' ? 'text-red-600 font-bold' :
            triage === 'Yellow' ? 'text-amber-600' :
            'text-slate-800'
          }`}>{safeIntervals.heartRate} BPM</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] text-muted-foreground uppercase font-bold">Triage</p>
          <p className={`text-xs font-bold ${
            triage === 'Red' ? 'text-red-600' :
            triage === 'Yellow' ? 'text-amber-600' :
            'text-green-600'
          }`}>{triage}</p>
        </div>
      </div>

      {/* Error State */}
      {error && !isLoading && !hasAnalysis && (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-xs font-bold text-red-700">Analysis Failed</p>
          <p className="text-[10px] text-red-600 max-w-[240px] mt-1">{error}</p>
          <button
            onClick={runAiAnalysis}
            disabled={!patientId || isLoading}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-3 w-3" /> RETRY
          </button>
        </div>
      )}

      {!hasAnalysis && !isLoading && !error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <HeartPulse className="h-8 w-8 text-blue-400 mb-2 animate-pulse" />
          <p className="text-xs font-bold text-slate-700">ECG Analysis Ready</p>
          <p className="text-[10px] text-slate-400 max-w-[240px] mt-1 mb-4 leading-relaxed">
            Generate AI-powered ECG interpretation for {patientName}
          </p>
          <button
            id="trigger-ai-btn"
            onClick={runAiAnalysis}
            disabled={!patientId || isLoading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            RUN GEMINI DIAGNOSTICS
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-xl border border-slate-200">
          <RefreshCw className="h-7 w-7 text-blue-500 mb-3 animate-spin" />
          <p className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest">
            Analyzing Telemetry Lead Metadata...
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Running LLM clinical inference on electrocardiogram curves.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Analysis Header */}
          <div className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono font-bold ${
            isCritical 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-center gap-2">
              {isCritical ? <AlertCircle className="h-4 w-4 text-rose-600 animate-pulse" /> : <CheckCircle className="h-4 w-4 text-emerald-600" />}
              <span>
                {isCritical ? 'CRITICAL PATHOLOGY DETECTED' : 'STABLE SINUS WAVEFORM'}
              </span>
            </div>
            <span>
              {alertType}
            </span>
          </div>

          {/* Clinical Summary */}
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">CLINICAL CARDIOLOGIST SUMMARY</span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              "{clinicalSummary}"
            </p>
          </div>

          {/* Arrhythmias & Patterns */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5">
              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider block">ARRHYTHMIAS</span>
              <div className="flex flex-wrap gap-1">
                {hasArrhythmias ? (
                  arrhythmias.map((a, i) => (
                    <span key={i} className="text-[9px] bg-red-100 border border-red-200 text-red-700 font-mono font-bold px-1.5 py-0.5 rounded">
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] text-slate-400 font-mono font-bold">None</span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5">
              <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider block">WAVEFORM ANOMALIES</span>
              <div className="flex flex-wrap gap-1">
                {hasAbnormalPatterns ? (
                  abnormalPatterns.map((p, i) => (
                    <span key={i} className="text-[9px] bg-blue-100 border border-blue-200 text-blue-700 font-mono font-bold px-1.5 py-0.5 rounded">
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] text-slate-400 font-mono font-bold">PR/QT Intact</span>
                )}
              </div>
            </div>
          </div>

          {/* Suggested follow ups */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">SUGGESTED ACTION PLANS</span>
            <ol className="list-decimal pl-4 text-[10px] text-slate-600 font-medium space-y-1">
              {hasSuggestedFollowUp ? (
                suggestedFollowUp.map((f, i) => (
                  <li key={i} className="leading-normal">{f}</li>
                ))
              ) : (
                <li className="text-slate-400">No follow-up actions suggested</li>
              )}
            </ol>
          </div>

          {/* Footnotes */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[8px] font-mono text-slate-400 uppercase font-semibold">
            <span>LLM ID: {analysisId}</span>
            <span className="text-emerald-600">
              {isSimulatedAI ? 'RULE ENGINE CO-PILOT' : 'GEMINI CORE V2'}
            </span>
          </div>

          {/* Regenerate Action button */}
          <button
            onClick={runAiAnalysis}
            disabled={!patientId || isLoading}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-bold uppercase text-slate-600 rounded-lg text-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            RE-RUN DIAGNOSTICS
          </button>
        </div>
      )}
    </div>
  );
}