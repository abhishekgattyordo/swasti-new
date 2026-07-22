
'use client';

import React from 'react';
import { Play, Square, Save, Download, Clock, BarChart2, ShieldCheck, Heart } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  recordingSeconds: number;
  sampleCount: number;
  averageHr: number;
  hasUnsavedData: boolean;
  onSave: () => void;
  isSaving: boolean;
  patientName: string;
}

export default function RecordingControls({
  isRecording,
  onStart,
  onStop,
  recordingSeconds,
  sampleCount,
  averageHr,
  hasUnsavedData,
  onSave,
  isSaving,
  patientName,
}: RecordingControlsProps) {
  // Format elapsed seconds as MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="recording_dashboard_panel" className="vitals-card rounded-lg p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xs font-bold tracking-widest text-slate-200 uppercase font-sans">
            Signal Recording Engine
          </h2>
        </div>

        {/* Recording status badge */}
        <div>
          {isRecording ? (
            <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block animate-ping"></span>
              REC: {formatTime(recordingSeconds)}
            </span>
          ) : hasUnsavedData ? (
            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold font-mono">
              UNSAVED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold font-mono">
              IDLE
            </span>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!isRecording ? (
          <button
            onClick={onStart}
            disabled={hasUnsavedData}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs uppercase font-mono tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Recording
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs uppercase font-mono tracking-wider transition-all cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop Recording
          </button>
        )}
      </div>

      {/* Recording Stats Readout */}
      <div className="grid grid-cols-3 gap-2 bg-black/40 p-3 rounded-lg border border-white/5 text-center font-mono">
        {/* Duration */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase">Duration</span>
          <span className="text-sm font-bold text-slate-200 mt-1">
            {formatTime(recordingSeconds)}
          </span>
        </div>
        {/* Samples */}
        <div className="flex flex-col border-x border-white/10">
          <span className="text-[10px] text-slate-500 uppercase">Samples</span>
          <span className="text-sm font-bold text-slate-200 mt-1">
            {sampleCount.toLocaleString()}
          </span>
        </div>
        {/* Avg HR */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-0.5">
            <Heart className="w-3 h-3 text-red-500 animate-pulse" /> Avg HR
          </span>
          <span className="text-sm font-bold text-slate-200 mt-1">
            {averageHr ? `${Math.round(averageHr)}` : '--'} <span className="text-[10px] text-slate-500">BPM</span>
          </span>
        </div>
      </div>

      {/* Save Button */}
      {hasUnsavedData && (
        <div className="flex flex-col gap-2 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg animate-fade-in">
          <div className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              ECG telemetry buffer is loaded! Press the button below to persist this session for <strong>{patientName || 'Untitled Patient'}</strong> on the hospital server.
            </span>
          </div>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 active:bg-emerald-500/40 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded transition-all font-mono uppercase tracking-wider cursor-pointer"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving ECG...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Commit Saved Recording
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}