// app/nurse/ecg-diagnostics/page.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HeartPulse, 
  Settings, 
  CheckCircle2, 
  Cpu, 
  RefreshCw, 
  Sparkles, 
  Check, 
  ShieldAlert, 
  UploadCloud,
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  Stethoscope,
  Hospital
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NurseTask {
  id: number;
  patient_id: string;
  task_type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
  due_time: string;
  assigned_to: string;
  assigned_by: string;
  result: string | null;
  notes: string | null;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
  patient_name?: string;  // Added patient_name field
}

export default function NurseEcgDiagnosticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ecgTasks, setEcgTasks] = useState<NurseTask[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientProfile, setPatientProfile] = useState({
    name: 'No Active ECG Patient',
    age: 0,
    gender: 'N/A',
    admissionId: 'N/A',
    roomNumber: 'N/A',
    bloodGroup: 'N/A'
  });

  // Fetch ECG tasks for the nurse
  useEffect(() => {
    const fetchEcgTasks = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/nurse/tasks?taskType=ecg');
        const data = await res.json();
        if (data.success) {
          setEcgTasks(data.data);
          if (data.data.length > 0) {
            setSelectedPatientId(data.data[0].patient_id);
          }
        }
      } catch (error) {
        console.error('Error fetching ECG tasks:', error);
        toast.error('Failed to load ECG tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchEcgTasks();
  }, []);

  // Update patient profile when selected patient changes
  useEffect(() => {
    const matchedTask = ecgTasks.find(t => t.patient_id === selectedPatientId);
    if (matchedTask) {
      setPatientProfile({
        name: matchedTask.patient_name || matchedTask.title || 'Unknown Patient',
        age: 0,
        gender: 'N/A',
        admissionId: matchedTask.patient_id || 'N/A',
        roomNumber: 'N/A',
        bloodGroup: 'N/A'
      });
    }
  }, [selectedPatientId, ecgTasks]);

  const [deviceConnected, setDeviceConnected] = useState<boolean>(true);
  const [selectedRhythm, setSelectedRhythm] = useState<string>('NSR');
  
  const [hrOffset, setHrOffset] = useState<number>(0);
  const [noiseLevel, setNoiseLevel] = useState<number>(1);
  const [leadDisconnect, setLeadDisconnect] = useState<boolean>(false);

  const [liveBpm, setLiveBpm] = useState<number>(72);
  const [prInterval, setPrInterval] = useState<number>(160);
  const [qrsDuration, setQrsDuration] = useState<number>(90);
  const [qtInterval, setQtInterval] = useState<number>(390);
  const [rrInterval, setRrInterval] = useState<number>(833);
  const [signalQuality, setSignalQuality] = useState<number>(99);

  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [doctorSignature, setDoctorSignature] = useState<string>('');
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [historyReports, setHistoryReports] = useState<any[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mathematical Parameters Calculation based on Selected Rhythm
  useEffect(() => {
    let baseBpm = 72;
    let basePr = 160;
    let baseQrs = 90;
    let baseQt = 390;
    let baseRr = 833;

    if (selectedRhythm === 'NSR') {
      baseBpm = 72 + hrOffset;
      basePr = 160;
      baseQrs = 90;
      baseQt = 390;
      baseRr = Math.round(60000 / baseBpm);
    } else if (selectedRhythm === 'Brady') {
      baseBpm = 45 + Math.round(hrOffset / 2);
      basePr = 210;
      baseQrs = 90;
      baseQt = 430;
      baseRr = Math.round(60000 / baseBpm);
    } else if (selectedRhythm === 'Tachy') {
      baseBpm = 125 + hrOffset;
      basePr = 130;
      baseQrs = 85;
      baseQt = 310;
      baseRr = Math.round(60000 / baseBpm);
    } else if (selectedRhythm === 'AFib') {
      baseBpm = 115 + hrOffset;
      basePr = 0;
      baseQrs = 95;
      baseQt = 340;
      baseRr = Math.round(60000 / baseBpm);
    } else if (selectedRhythm === 'PVC') {
      baseBpm = 80 + hrOffset;
      basePr = 150;
      baseQrs = 130;
      baseQt = 410;
      baseRr = Math.round(60000 / baseBpm);
    } else if (selectedRhythm === 'VTach') {
      baseBpm = 175 + Math.round(hrOffset / 2);
      basePr = 0;
      baseQrs = 150;
      baseQt = 280;
      baseRr = Math.round(60000 / baseBpm);
    }

    if (leadDisconnect || !deviceConnected) {
      setLiveBpm(0);
      setPrInterval(0);
      setQrsDuration(0);
      setQtInterval(0);
      setRrInterval(0);
      setSignalQuality(0);
    } else {
      setLiveBpm(baseBpm);
      setPrInterval(basePr);
      setQrsDuration(baseQrs);
      setQtInterval(baseQt);
      setRrInterval(baseRr);
      setSignalQuality(Math.max(10, 100 - (noiseLevel - 1) * 15 - (selectedRhythm === 'AFib' ? 5 : 0)));
    }
  }, [selectedRhythm, hrOffset, noiseLevel, leadDisconnect, deviceConnected]);

  // Real-time ECG Canvas Oscilloscope Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width;
    let height = canvas.height;

    const points: number[] = Array(width).fill(height / 2);
    let phase = 0;
    let p_jitter = 0;

    const drawGrid = (c: CanvasRenderingContext2D, w: number, h: number) => {
      c.fillStyle = '#0f172a';
      c.fillRect(0, 0, w, h);
      c.strokeStyle = '#f43f5e';
      c.lineWidth = 0.3;
      c.beginPath();
      for (let x = 0; x < w; x += 10) {
        c.moveTo(x, 0);
        c.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 10) {
        c.moveTo(0, y);
        c.lineTo(w, y);
      }
      c.stroke();
      c.lineWidth = 0.8;
      c.beginPath();
      for (let x = 0; x < w; x += 50) {
        c.moveTo(x, 0);
        c.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 50) {
        c.moveTo(0, y);
        c.lineTo(w, y);
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
      const targetY = baselineY - amplitude * 80;
      points.push(targetY);
      points.shift();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
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

  // Mark ECG task as completed
  const markTaskAsCompleted = async (taskId: number) => {
    try {
      const res = await fetch('/api/nurse/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taskId,
          result: aiAnalysisResult?.rhythmInterpretation || 'ECG completed',
          completedBy: 'Nurse'
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('ECG task marked as completed');
        setEcgTasks(prev => prev.filter(t => t.id !== taskId));
        if (ecgTasks.length > 1) {
          const nextTask = ecgTasks.find(t => t.id !== taskId);
          if (nextTask) setSelectedPatientId(nextTask.patient_id);
        }
      } else {
        toast.error(data.message || 'Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#2BB2A7] mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Loading ECG tasks...</p>
        </div>
      </div>
    );
  }

  if (ecgTasks.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => router.push('/nurse/dashboard')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="py-12 text-center">
            <HeartPulse className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700">No ECG Tasks Assigned</h2>
            <p className="text-muted-foreground mt-2">You don't have any ECG tasks assigned at the moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div id="ecg-diagnostics-portal" className="space-y-6 max-w-[1600px] mx-auto pb-16 pl-6 pr-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                ECG Diagnostics
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Nurse View</Badge>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Perform ECG monitoring and diagnostics for assigned patients
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "px-3 py-1",
            ecgTasks.filter(t => t.status === 'pending').length > 0 
              ? "bg-yellow-100 text-yellow-700 border-yellow-200" 
              : "bg-green-100 text-green-700 border-green-200"
          )}>
            {ecgTasks.filter(t => t.status === 'pending').length} Pending Tasks
          </Badge>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Real-time Oscilloscope Grid */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative">
            
            {/* Bedside header readouts */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${deviceConnected ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${deviceConnected ? 'bg-emerald-500' : 'bg-rose-600'}`}></span>
                </span>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-slate-200">
                    Bedside Monitor: Lead II Telemetry
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Model: CardioMend-12X • Real-time Diagnostic Telemetry
                  </p>
                </div>
              </div>

              {/* 🆕 Patient Selector - Shows Patient Name */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Active Patient:</span>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="bg-slate-900 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[180px]"
                >
                  {ecgTasks.map(t => (
                    <option key={t.id} value={t.patient_id}>
                      {t.patient_name || t.title || 'Unknown Patient'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* The Real-Time Glowing Waveform Canvas */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={260}
                className="w-full h-[260px] block cursor-crosshair"
              />
              
              {/* Overlay warning on flatline */}
              {(!deviceConnected || liveBpm === 0) && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col justify-center items-center gap-3">
                  <ShieldAlert className="w-12 h-12 text-rose-500 animate-bounce" />
                  <p className="text-sm font-bold text-rose-400 tracking-wide">
                    {leadDisconnect ? "LEAD II DETACHED (CHECK ELECTRODES)" : "NO HARDWARE HEARTBEAT DETECTED"}
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm text-center">
                    Check physical connectivity, patient wire status, or serial scanner settings.
                  </p>
                </div>
              )}
            </div>

            {/* Digital Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 border-t border-slate-800 bg-slate-950 text-slate-200">
              
              {/* HR */}
              <div className="p-4 flex flex-col justify-between min-h-[90px] relative overflow-hidden">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">HR (BPM)</span>
                <span className={`text-3xl font-extrabold font-mono leading-none tracking-tight ${liveBpm > 120 || liveBpm < 50 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                  {liveBpm > 0 ? liveBpm : '---'}
                </span>
                <HeartPulse className={`absolute right-3 bottom-3 w-5 h-5 opacity-25 ${liveBpm > 120 ? 'text-rose-500 animate-ping' : 'text-emerald-400 animate-pulse'}`} />
              </div>

              {/* PR */}
              <div className="p-4 flex flex-col justify-between min-h-[90px]">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">PR Interval</span>
                <span className="text-xl font-extrabold font-mono leading-none text-slate-200">
                  {prInterval > 0 ? `${prInterval} ms` : '---'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Ref: 120-200 ms</span>
              </div>

              {/* QRS */}
              <div className="p-4 flex flex-col justify-between min-h-[90px]">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">QRS Dur</span>
                <span className={`text-xl font-extrabold font-mono leading-none ${qrsDuration > 120 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {qrsDuration > 0 ? `${qrsDuration} ms` : '---'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Ref: 80-120 ms</span>
              </div>

              {/* QT/QTc */}
              <div className="p-4 flex flex-col justify-between min-h-[90px]">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">QT / QTc</span>
                <span className="text-xl font-extrabold font-mono leading-none text-slate-200">
                  {qtInterval > 0 ? `${qtInterval} ms` : '---'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Ref: &lt;440 ms</span>
              </div>

              {/* RR */}
              <div className="p-4 flex flex-col justify-between min-h-[90px]">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">RR Interval</span>
                <span className="text-xl font-extrabold font-mono leading-none text-slate-200">
                  {rrInterval > 0 ? `${rrInterval} ms` : '---'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Cycle pacing rate</span>
              </div>

              {/* Signal Quality */}
              <div className="p-4 flex flex-col justify-between min-h-[90px]">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Signal Quality</span>
                <span className={`text-xl font-extrabold font-mono leading-none ${signalQuality > 80 ? 'text-emerald-400' : signalQuality > 50 ? 'text-amber-400' : 'text-rose-500'}`}>
                  {signalQuality > 0 ? `${signalQuality}%` : '0%'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Leads Contact OK</span>
              </div>

            </div>

          </div>

          {/* Real-time slider controls */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#2BB2A7]" />
              Clinical Telemetry Adjustment Sliders
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* HR offset */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Heart Rate Offset (BPM)</span>
                  <span className="font-mono text-slate-900">{hrOffset >= 0 ? `+${hrOffset}` : hrOffset}</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  value={hrOffset}
                  onChange={(e) => setHrOffset(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2BB2A7]"
                />
                <p className="text-[10px] text-slate-400">Modulates the physiological pace of sinus rhythm.</p>
              </div>

              {/* Noise artifact level */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Baseline Wander & Artifacts</span>
                  <span className="font-mono text-slate-900">Level {noiseLevel}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2BB2A7]"
                />
                <p className="text-[10px] text-slate-400">Simulates high-frequency muscular artifact noise.</p>
              </div>

              {/* Electrode Disconnect simulation */}
              <div className="flex flex-col justify-center items-start gap-2">
                <span className="text-xs font-semibold text-slate-600">Electrode Interruption</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leadDisconnect}
                    onChange={(e) => setLeadDisconnect(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                  <span className="ml-3 text-xs font-semibold text-slate-700">
                    {leadDisconnect ? "Detached (Alert!)" : "Secure Connection"}
                  </span>
                </label>
                <p className="text-[10px] text-slate-400">Forces complete Lead II signal flatline.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Rhythm Selector Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-700" />
              Cardiac Rhythm Simulation
            </h3>

            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-600 block">Select Cardiac Rhythm Category:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'NSR', label: 'Sinus Rhythm (NSR)', desc: 'Physiological beat' },
                  { id: 'Brady', label: 'Bradycardia', desc: 'Slow <60 bpm' },
                  { id: 'Tachy', label: 'Tachycardia', desc: 'Fast >100 bpm' },
                  { id: 'AFib', label: 'Atrial Fib (A-Fib)', desc: 'Irregular f-waves' },
                  { id: 'PVC', label: 'PVC Ectopy', desc: 'Premature beats' },
                  { id: 'VTach', label: 'V-Tach', desc: 'Emergency monomorphic' },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRhythm(r.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      selectedRhythm === r.id 
                        ? 'bg-[#EAF7F4] border-[#2BB2A7] text-slate-950 font-semibold shadow-xs' 
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="text-xs block leading-tight">{r.label}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Clinical Summary report */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                AI Telemetry Analyzer
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              Evaluates current ECG metrics, calculates morphology risk markers, and synthesizes instant expert-level cardiological reports.
            </p>

            <button
              onClick={async () => {
                setAiLoading(true);
                setAiError(null);
                setAiAnalysisResult(null);

                try {
                  const response = await fetch('/api/ecg/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      patientName: patientProfile.name,
                      age: patientProfile.age,
                      gender: patientProfile.gender,
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

                  const data = await response.json();
                  if (data.success && data.analysis) {
                    setAiAnalysisResult(data.analysis);
                    toast.success('AI analysis completed');
                  } else {
                    throw new Error(data.error || "Failed to parse AI response");
                  }
                } catch (err: any) {
                  setAiError(err.message || "An error occurred");
                  toast.error('AI analysis failed');
                } finally {
                  setAiLoading(false);
                }
              }}
              disabled={aiLoading || !deviceConnected || liveBpm === 0}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl tracking-wide transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Diagnostic Report
                </>
              )}
            </button>

            {aiError && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-2xl text-xs text-rose-400">
                {aiError}
              </div>
            )}

            {/* AI Result Card */}
            {aiAnalysisResult && (
              <div className="border border-slate-800/80 rounded-2xl bg-slate-950/50 p-4 space-y-3.5">
                <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Rhythm Interpretation</span>
                    <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                      {aiAnalysisResult.rhythmInterpretation}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Risk Flag</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 font-mono ${
                      aiAnalysisResult.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                      aiAnalysisResult.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {aiAnalysisResult.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Findings:</span>
                  <ul className="space-y-1">
                    {aiAnalysisResult.findings?.map((finding: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-500 font-bold text-xs pt-0.5">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block">Recommendations:</span>
                  <ul className="space-y-1 mt-1">
                    {aiAnalysisResult.recommendations?.map((rec: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-[#2BB2A7] font-bold text-xs pt-0.5">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Complete Task Button */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Task Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-600">
                  <strong>Patient:</strong> {ecgTasks.find(t => t.patient_id === selectedPatientId)?.patient_name || 'Unknown'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Task:</strong> {ecgTasks.find(t => t.patient_id === selectedPatientId)?.title || 'ECG Monitoring'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Assigned By:</strong> {ecgTasks.find(t => t.patient_id === selectedPatientId)?.assigned_by || 'N/A'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Due:</strong> {ecgTasks.find(t => t.patient_id === selectedPatientId)?.due_date || 'N/A'} at {ecgTasks.find(t => t.patient_id === selectedPatientId)?.due_time || 'N/A'}
                </p>
              </div>

              <Button 
                onClick={() => {
                  const task = ecgTasks.find(t => t.patient_id === selectedPatientId);
                  if (task) markTaskAsCompleted(task.id);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark ECG as Completed
              </Button>
            </CardContent>
          </Card>

          {/* Task History */}
          {historyReports.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider font-mono">
                Completed ECG Records
              </h3>
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {historyReports.map((report) => (
                  <div key={report.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] leading-relaxed relative">
                    <span className="font-bold text-indigo-600 block">{report.patientName}</span>
                    <span className="text-slate-400 text-[9px] font-mono block">{report.timestamp}</span>
                    <p className="text-slate-600 mt-1 line-clamp-2">
                      <strong>Rhythm:</strong> {report.rhythm} • <strong>HR:</strong> {report.bpm}bpm
                    </p>
                    <span className={`absolute right-3 top-3 text-[8px] font-bold font-mono px-1.5 py-0.5 rounded ${
                      report.risk === 'High' ? 'bg-rose-100 text-rose-700' :
                      report.risk === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      Risk: {report.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}