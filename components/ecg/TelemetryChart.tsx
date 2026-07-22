'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Activity, Volume2, VolumeX, Printer, Play, Pause } from 'lucide-react';

interface TelemetryChartProps {
  patientId: string;
  patientName: string;
  condition: string;
  isStreaming: boolean;
  isMuted: boolean;
  onToggleStreaming: () => void;
  onToggleMute: () => void;
  onPrint: () => void;
  intervals: {
    pr: number;
    qrs: number;
    qt: number;
    qtc: number;
    axis: number;
    heartRate: number;
  };
}

// ECG waveform generation function (replacing the utils import)
function getECGValue(timeMs: number, heartRate: number, condition: string, extras: any = {}): number {
  // Base heart rate cycle calculation
  const beatInterval = 60000 / heartRate;
  const positionInBeat = timeMs % beatInterval;
  const normalizedPos = positionInBeat / beatInterval;

  let value = 0;

  // P-wave (atrial depolarization) - occurs at ~10-20% of cycle
  if (normalizedPos > 0.08 && normalizedPos < 0.18) {
    const pProgress = (normalizedPos - 0.08) / 0.10;
    value += 0.15 * Math.sin(pProgress * Math.PI);
  }

  // QRS complex (ventricular depolarization) - occurs at ~35-50% of cycle
  if (normalizedPos > 0.35 && normalizedPos < 0.50) {
    const qrsProgress = (normalizedPos - 0.35) / 0.15;
    // Q wave (negative deflection)
    if (qrsProgress < 0.15) {
      const qPos = qrsProgress / 0.15;
      value -= 0.3 * Math.sin(qPos * Math.PI / 2);
    }
    // R wave (positive deflection)
    else if (qrsProgress < 0.50) {
      const rPos = (qrsProgress - 0.15) / 0.35;
      value += 1.0 * Math.sin(rPos * Math.PI);
    }
    // S wave (negative deflection)
    else {
      const sPos = (qrsProgress - 0.50) / 0.50;
      value -= 0.25 * Math.sin(sPos * Math.PI / 2);
    }
  }

  // T-wave (ventricular repolarization) - occurs at ~60-85% of cycle
  if (normalizedPos > 0.60 && normalizedPos < 0.85) {
    const tProgress = (normalizedPos - 0.60) / 0.25;
    value += 0.4 * Math.sin(tProgress * Math.PI);
  }

  // U-wave (late repolarization) - occurs at ~90-95% of cycle
  if (normalizedPos > 0.90 && normalizedPos < 0.96) {
    const uProgress = (normalizedPos - 0.90) / 0.06;
    value += 0.05 * Math.sin(uProgress * Math.PI);
  }

  // Base noise
  value += (Math.random() - 0.5) * 0.02;

  // Condition-specific modifications
  if (condition === 'STEMI (ST-Elevation Myocardial Infarction)') {
    // ST elevation (T-wave elevation)
    if (normalizedPos > 0.50 && normalizedPos < 0.70) {
      value += 0.2 * Math.sin((normalizedPos - 0.50) / 0.20 * Math.PI);
    }
    // Extra noise for ST elevation
    value += (Math.random() - 0.5) * 0.03;
  }

  if (condition === 'Ventricular Tachycardia') {
    // Wide QRS complex for VT
    if (normalizedPos > 0.30 && normalizedPos < 0.60) {
      const vtPos = (normalizedPos - 0.30) / 0.30;
      value += 0.8 * Math.sin(vtPos * Math.PI * 2) * (1 - vtPos);
    }
    // Fast rate
    value *= 1.2;
    value += (Math.random() - 0.5) * 0.04;
  }

  if (condition === 'Atrial Fibrillation') {
    // Irregular rhythm with no P-waves
    const afib = extras.afibOffset || 0;
    if (normalizedPos > 0.20 && normalizedPos < 0.55) {
      value += 0.1 * Math.sin((normalizedPos - 0.20) / 0.35 * Math.PI * 4) * afib;
    }
    // Baseline wobble
    value += (Math.random() - 0.5) * 0.08;
  }

  if (condition === 'Premature Ventricular Contractions') {
    if (extras.pvcActive) {
      // PVC: Wide, bizarre QRS complex
      if (normalizedPos > 0.30 && normalizedPos < 0.65) {
        const pvcPos = (normalizedPos - 0.30) / 0.35;
        value += 1.2 * Math.sin(pvcPos * Math.PI * 2);
      }
      value += (Math.random() - 0.5) * 0.05;
    }
  }

  if (condition === 'Symptomatic Bradycardia') {
    // Slow rate with prolonged PR interval
    if (normalizedPos > 0.10 && normalizedPos < 0.22) {
      const pPos = (normalizedPos - 0.10) / 0.12;
      value += 0.12 * Math.sin(pPos * Math.PI);
    }
    // T-wave slightly flattened
    if (normalizedPos > 0.65 && normalizedPos < 0.80) {
      const tPos = (normalizedPos - 0.65) / 0.15;
      value += 0.25 * Math.sin(tPos * Math.PI);
    }
  }

  if (condition === 'Normal Sinus Rhythm') {
    // Clean, normal waveform
    // Slightly more pronounced T-wave
    if (normalizedPos > 0.60 && normalizedPos < 0.82) {
      const tPos = (normalizedPos - 0.60) / 0.22;
      value += 0.45 * Math.sin(tPos * Math.PI);
    }
  }

  return value;
}

export default function TelemetryChart({
  patientId,
  patientName,
  condition,
  isStreaming,
  isMuted,
  onToggleStreaming,
  onToggleMute,
  onPrint,
  intervals
}: TelemetryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const currentXRef = useRef<number>(0);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const timeMsRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isSTEMI = condition.includes('STEMI');
  const isVTach = condition.includes('Tachycardia');
  const isCritical = isSTEMI || isVTach;

  // Synthesize cardiac warning pulse sounds
  const playCardiacBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isSTEMI ? 920 : 850, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio synthesis blocked by browser context:', e);
    }
  };

  // Setup sound looping for active emergencies
  useEffect(() => {
    if (isCritical && isStreaming && !isMuted) {
      const interval = setInterval(() => {
        playCardiacBeep();
      }, isSTEMI ? 350 : 280);
      
      return () => clearInterval(interval);
    }
  }, [isCritical, isStreaming, isMuted, patientId, isSTEMI]);

  // Setup Canvas rendering sweep line
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastTime = performance.now();
    currentXRef.current = 0;
    pointsRef.current = [];

    let afibOffset = 0;
    let pvcActive = false;
    let pvcTimer = 0;

    const render = (now: number) => {
      if (!canvas || !ctx) return;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      const deltaTime = now - lastTime;
      lastTime = now;

      // 1. Draw physical red grid paper lines
      ctx.fillStyle = '#0a0d14'; // Off-black dark cathode theme
      ctx.fillRect(0, 0, width, height);

      // Draw millimeter block lines
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)'; // Major grids
      ctx.lineWidth = 1;
      const gridSize = 25; // 25px per large square
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw sub-millimeter grids
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.03)'; // Fine grid lines
      const subGridSize = gridSize / 5;
      for (let x = 0; x < width; x += subGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += subGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isStreaming) {
        timeMsRef.current += deltaTime;

        // Custom condition adjustments
        if (condition === 'Atrial Fibrillation') {
          if (Math.random() < 0.02) {
            afibOffset = (Math.random() - 0.5) * 4;
          }
        }

        if (condition === 'Premature Ventricular Contractions') {
          pvcTimer += deltaTime;
          if (pvcTimer > 4000) {
            pvcActive = true;
            if (pvcTimer > 4700) {
              pvcActive = false;
              pvcTimer = 0;
            }
          }
        } else {
          pvcActive = false;
        }

        const rawVal = getECGValue(timeMsRef.current, intervals.heartRate, condition, { afibOffset, pvcActive });
        const baselineY = height / 2;
        const amplitudeScale = 55;
        const scaledY = baselineY - (rawVal * amplitudeScale);

        const pointSpeed = 2.4; // horizontal speed multiplier
        currentXRef.current = (currentXRef.current + pointSpeed) % width;

        const gapSize = 35;
        pointsRef.current = pointsRef.current.filter(p => {
          const isAtSweepGap = p.x > currentXRef.current && p.x < currentXRef.current + gapSize;
          const isWrappedAtSweepGap = currentXRef.current + gapSize > width && (p.x > currentXRef.current || p.x < (currentXRef.current + gapSize) % width);
          return !(isAtSweepGap || isWrappedAtSweepGap);
        });

        pointsRef.current.push({ x: currentXRef.current, y: scaledY });
        const sortedPoints = [...pointsRef.current].sort((a, b) => a.x - b.x);

        // Render sweep line with glowing trace shadow
        ctx.shadowBlur = 10;
        ctx.shadowColor = isCritical ? '#ef4444' : '#10b981';
        ctx.strokeStyle = isCritical ? '#f43f5e' : '#34d399';
        ctx.lineWidth = 2.2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        let isDrawing = false;
        
        for (let i = 0; i < sortedPoints.length; i++) {
          const pt = sortedPoints[i];
          const nextPt = sortedPoints[i + 1];
          const hasGap = nextPt && Math.abs(nextPt.x - pt.x) > 10;

          if (!isDrawing) {
            ctx.moveTo(pt.x, pt.y);
            isDrawing = true;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }

          if (hasGap) {
            ctx.stroke();
            isDrawing = false;
          }
        }
        ctx.stroke();

        // Clear glows for sweep head circles
        ctx.shadowBlur = 0;

        // Scanning lead dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(currentXRef.current, scaledY, 3.5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = isCritical ? '#f43f5e' : '#34d399';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(currentXRef.current, scaledY, 7, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        ctx.font = '12px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'center';
        ctx.fillText('ECG REAL-TIME SWEEP PAUSED', width / 2, height / 2);
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isStreaming, condition, intervals.heartRate, isCritical]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col space-y-4">
      {/* Header telemetry status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <Activity className={`h-4.5 w-4.5 ${isCritical ? 'text-rose-600 animate-pulse' : 'text-emerald-500'}`} />
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-semibold">Active Bed Conduction Wave</span>
            <span className="text-xs font-bold text-slate-800 uppercase font-mono">{patientName} — {condition}</span>
          </div>
        </div>

        {/* Live Metrics Controls */}
        <div className="flex items-center space-x-3">
          <button
            id="toggle-stream-btn"
            onClick={onToggleStreaming}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border rounded transition-colors cursor-pointer text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            {isStreaming ? (
              <>
                <Pause className="h-3 w-3" /> PAUSE
              </>
            ) : (
              <>
                <Play className="h-3 w-3" /> STREAM
              </>
            )}
          </button>

          <button
            id="toggle-mute-btn"
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border rounded transition-colors cursor-pointer ${
              isMuted 
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-3 w-3" /> MUTED
              </>
            ) : (
              <>
                <Volume2 className="h-3 w-3" /> AUDIO ON
              </>
            )}
          </button>

          <button
            id="print-strip-btn"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border border-blue-200 text-blue-600 bg-blue-50/50 rounded hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <Printer className="h-3 w-3" /> PRINT STRIP
          </button>
        </div>
      </div>

      {/* HTML5 Canvas viewport */}
      <div className="relative w-full h-[220px] rounded-lg border border-slate-200 bg-[#0a0d14] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Diagnostics Measurements Info Grid */}
      <div className="grid grid-cols-6 gap-2 border-t border-slate-100 pt-3 text-center">
        <div className="bg-slate-50/70 p-2 rounded border border-slate-100">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">HEART RATE</span>
          <span className={`text-xs font-black font-mono ${isCritical ? 'text-rose-600' : 'text-slate-700'}`}>
            {intervals.heartRate} BPM
          </span>
        </div>
        <div className="bg-slate-50/70 p-2 rounded border border-slate-100">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">PR INTERVAL</span>
          <span className="text-xs font-bold text-slate-700 font-mono">
            {intervals.pr > 0 ? `${intervals.pr} ms` : 'Absent'}
          </span>
        </div>
        <div className="bg-slate-50/70 p-2 rounded border border-slate-100">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">QRS WIDTH</span>
          <span className="text-xs font-bold text-slate-700 font-mono">
            {intervals.qrs > 0 ? `${intervals.qrs} ms` : 'N/A'}
          </span>
        </div>
        <div className="bg-slate-50/70 p-2 rounded border border-slate-100">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">QT INT</span>
          <span className="text-xs font-bold text-slate-700 font-mono">
            {intervals.qt > 0 ? `${intervals.qt} ms` : 'N/A'}
          </span>
        </div>
        <div className="bg-slate-50/70 p-2 rounded border border-slate-100">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">QTC CORR</span>
          <span className="text-xs font-bold text-slate-700 font-mono">
            {intervals.qtc > 0 ? `${intervals.qtc} ms` : 'N/A'}
          </span>
        </div>
        <div className="bg-slate-50/70 p-2 rounded border border-slate-100">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">HEART AXIS</span>
          <span className="text-xs font-bold text-slate-700 font-mono">
            {intervals.axis}°
          </span>
        </div>
      </div>
    </div>
  );
}