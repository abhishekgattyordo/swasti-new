'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Activity, ShieldAlert, Sliders, Eye, Grid3X3, Zap, Info } from 'lucide-react';

interface EcgMonitorProps {
  samples: number[];
  heartRate: number;
  deviceId: string;
  isSimulated: boolean;
}

export default function EcgMonitor({ samples, heartRate, deviceId, isSimulated }: EcgMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Configuration states
  const [gain, setGain] = useState<number>(1.0); // 0.5x, 1x, 2x
  const [speed, setSpeed] = useState<number>(300); // number of samples to show on screen (lower = faster sweep)
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [enableFilter, setEnableFilter] = useState<boolean>(true); // Low-pass filter to smooth signal
  const [theme, setTheme] = useState<'emerald' | 'amber' | 'cyan'>('emerald');

  // Track canvas size dynamically
  const [dimensions, setDimensions] = useState({ width: 800, height: 350 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height || 350, 250),
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Moving average filter for the ECG signals
  const filterSamples = (rawSamples: number[]) => {
    if (!enableFilter || rawSamples.length < 3) return rawSamples;
    const filtered: number[] = [];
    for (let i = 0; i < rawSamples.length; i++) {
      if (i === 0) {
        filtered.push((rawSamples[0] + rawSamples[1]) / 2);
      } else if (i === rawSamples.length - 1) {
        filtered.push((rawSamples[i - 1] + rawSamples[i]) / 2);
      } else {
        // 3-point moving average
        filtered.push((rawSamples[i - 1] + rawSamples[i] + rawSamples[i + 1]) / 3);
      }
    }
    return filtered;
  };

  // Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = dimensions.width;
    const height = dimensions.height;

    // Apply high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Get samples to display
    const displaySamplesCount = speed;
    const rawDisplayList = samples.slice(-displaySamplesCount);
    const displayList = filterSamples(rawDisplayList);

    // Theme definitions
    const colors = {
      emerald: {
        bg: '#050c0a',
        gridMinor: 'rgba(16, 185, 129, 0.05)',
        gridMajor: 'rgba(16, 185, 129, 0.18)',
        trace: '#10b981',
        traceGlow: '#059669',
        text: '#34d399',
      },
      amber: {
        bg: '#0c0802',
        gridMinor: 'rgba(245, 158, 11, 0.05)',
        gridMajor: 'rgba(245, 158, 11, 0.18)',
        trace: '#f59e0b',
        traceGlow: '#d97706',
        text: '#fbbf24',
      },
      cyan: {
        bg: '#01090f',
        gridMinor: 'rgba(6, 182, 212, 0.05)',
        gridMajor: 'rgba(6, 182, 212, 0.18)',
        trace: '#06b6d4',
        traceGlow: '#0891b2',
        text: '#22d3ee',
      },
    }[theme];

    // 1. Draw Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw ECG Grid Lines
    if (showGrid) {
      // Minor lines (every 10px)
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = colors.gridMinor;
      ctx.beginPath();
      for (let x = 0; x < width; x += 12) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 12) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Major lines (every 60px - equivalent to 5mm ECG boxes)
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = colors.gridMajor;
      ctx.beginPath();
      for (let x = 0; x < width; x += 60) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 60) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    }

    // 3. Draw Calibration Pulse at the left if there is space
    const calOffset = 30;
    if (showGrid) {
      ctx.strokeStyle = colors.gridMajor;
      ctx.lineWidth = 1;
      ctx.strokeRect(5, height - 40, 20, 30);
      ctx.fillStyle = colors.text;
      ctx.font = '10px monospace';
      ctx.fillText('1mV', 6, height - 45);
    }

    // 4. Draw Waveform Trace
    if (displayList.length > 1) {
      ctx.strokeStyle = colors.trace;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // CRT Phosphorus phosphor effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = colors.traceGlow;

      ctx.beginPath();

      const usableWidth = width - calOffset;
      const step = usableWidth / (displaySamplesCount - 1);
      const centerY = height / 2;
      const scaleY = 90 * gain;

      displayList.forEach((val, i) => {
        const x = calOffset + i * step;
        const y = centerY - val * scaleY;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 5. Draw overlay telemetry status text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '11px monospace';
    ctx.fillText(
      `Lead I  |  Filter: ${enableFilter ? 'ON (0.5-40Hz)' : 'OFF'}  |  Gain: ${gain}x  |  Speed: ${speed === 200 ? '25mm/s' : '50mm/s'}`,
      calOffset + 10,
      20
    );

    // Draw scanning heart rhythm dot at the current end of wave
    if (displayList.length > 0) {
      const usableWidth = width - calOffset;
      const lastIdx = displayList.length - 1;
      const step = usableWidth / (displaySamplesCount - 1);
      const dotX = calOffset + lastIdx * step;
      const dotY = height / 2 - displayList[lastIdx] * (90 * gain);

      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = colors.trace;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [samples, gain, speed, showGrid, enableFilter, theme, dimensions]);

  return (
    <div id="ecg_monitor_panel" className="vitals-card rounded-lg overflow-hidden shadow-2xl flex flex-col">
      {/* Monitor Header */}
      <div className="bg-black/40 px-4 py-3 border-b border-white/10 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Activity
            className={`w-5 h-5 animate-pulse ${
              theme === 'emerald' ? 'text-emerald-500' : theme === 'amber' ? 'text-amber-500' : 'text-cyan-500'
            }`}
          />
          <span className="font-mono text-xs font-bold tracking-widest text-slate-200">
            LIVE TELEMETRY MONITOR
          </span>
          <span className="text-[10px] bg-white/5 border border-white/10 text-slate-400 font-mono px-2 py-0.5 rounded">
            DEV_ID: {deviceId}
          </span>
          {isSimulated && (
            <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono px-2 py-0.5 rounded flex items-center gap-1 animate-pulse font-bold tracking-tighter">
              <Zap className="w-3 h-3" /> LOCAL SIMULATED DATA
            </span>
          )}
        </div>

        {/* Quick controls inside header */}
        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setTheme('emerald')}
              className={`px-2 py-1 rounded transition-colors font-mono ${
                theme === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Green CRT Theme"
            >
              CRT-G
            </button>
            <button
              onClick={() => setTheme('amber')}
              className={`px-2 py-1 rounded transition-colors font-mono ${
                theme === 'amber' ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Amber CRT Theme"
            >
              CRT-A
            </button>
            <button
              onClick={() => setTheme('cyan')}
              className={`px-2 py-1 rounded transition-colors font-mono ${
                theme === 'cyan' ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cyan CRT Theme"
            >
              CRT-C
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-xs bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg">
            <span className="text-slate-500 font-mono text-[10px] uppercase font-bold tracking-wider">Sweep:</span>
            <span
              className={`font-mono font-bold ${
                heartRate > 100 || heartRate < 50 ? 'text-rose-500 animate-bounce' : 'text-slate-200'
              }`}
            >
              {heartRate || '--'} BPM
            </span>
          </div>
        </div>
      </div>

      {/* Actual Canvas Container */}
      <div ref={containerRef} className="relative flex-1 min-h-[300px] md:min-h-[350px] bg-black">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          className="cursor-crosshair"
        />

        {/* Empty status message */}
        {samples.length === 0 && (
          <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 bg-slate-950/95 text-slate-400 p-6 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-600 animate-bounce mb-2" />
            <p className="font-mono text-slate-200 font-semibold">NO ECG SIGNAL INCOMING</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Please check your WebSocket configurations and click <strong>"Connect"</strong> to establish an active telemetry
              feed.
            </p>
          </div>
        )}
      </div>

      {/* Monitor Footer Controls Panel */}
      <div className="bg-black/60 border-t border-white/10 px-4 py-3 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        {/* Sweep Rate */}
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400 font-mono">Sweep Speed:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="flex-1 bg-black/80 border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-green-500/50"
          >
            <option value={200}>25 mm/s (Fast)</option>
            <option value={350}>50 mm/s (Standard)</option>
            <option value={500}>100 mm/s (High-Res)</option>
          </select>
        </div>

        {/* Amplitude Gain */}
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400 font-mono">Voltage Gain:</span>
          <select
            value={gain}
            onChange={(e) => setGain(Number(e.target.value))}
            className="flex-1 bg-black/80 border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-green-500/50"
          >
            <option value={0.5}>0.5x (Half Scale)</option>
            <option value={1.0}>1.0x (Normal Scale)</option>
            <option value={1.5}>1.5x (Enlarged)</option>
            <option value={2.0}>2.0x (Double Scale)</option>
          </select>
        </div>

        {/* Toggle Grid */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all text-xs font-mono w-full sm:w-auto justify-center cursor-pointer ${
              showGrid
                ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                : 'bg-black/40 border-transparent text-slate-500 hover:border-white/5'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            Grid: {showGrid ? 'SHOW' : 'HIDE'}
          </button>
        </div>

        {/* Low pass digital filter */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <button
            onClick={() => setEnableFilter(!enableFilter)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all text-xs font-mono w-full sm:w-auto justify-center cursor-pointer ${
              enableFilter
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-black/40 border-transparent text-slate-500 hover:border-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            DSP Filter: {enableFilter ? 'ACTIVE' : 'RAW'}
          </button>
        </div>
      </div>
    </div>
  );
}