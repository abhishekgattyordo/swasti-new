'use client';

import React, { useState } from 'react';
import { Database, Trash2, Calendar, FileText, Search, UserCheck, Heart, AlertTriangle } from 'lucide-react';
import { Recording } from '@/types';

interface SavedRecordingsProps {
  recordings: Recording[];
  onDelete: (id: string) => void;
  onSelect: (recording: Recording) => void;
  selectedRecording: Recording | null;
}

export default function SavedRecordings({
  recordings,
  onDelete,
  onSelect,
  selectedRecording,
}: SavedRecordingsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Format date nicely
  const formatDate = (timestampSeconds: number) => {
    const date = new Date(timestampSeconds * 1000);
    return date.toLocaleString();
  };

  const filtered = recordings.filter((rec) => {
    const term = searchTerm.toLowerCase();
    return (
      rec.patientName.toLowerCase().includes(term) ||
      rec.patientId.toLowerCase().includes(term) ||
      rec.deviceId.toLowerCase().includes(term)
    );
  });

  return (
    <div id="saved_recordings_panel" className="vitals-card rounded-lg p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Database className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xs font-bold tracking-widest text-slate-200 uppercase font-sans">
          ECG Archive Directory ({recordings.length})
        </h2>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Patient Name, ID, or Device..."
          className="w-full pl-9 pr-3 py-1.5 bg-black/80 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-green-500/50 transition-colors"
        />
      </div>

      {/* Recordings List */}
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-white/10 rounded-lg">
            <p>No telemetry records found</p>
          </div>
        ) : (
          filtered.map((rec) => {
            const isSelected = selectedRecording?.id === rec.id;
            return (
              <div
                key={rec.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border transition-all text-left gap-2 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-black/40 hover:bg-black/60 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Info block */}
                <div
                  className="flex-1 cursor-pointer w-full"
                  onClick={() => onSelect(rec)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-200">
                      {rec.patientName || 'Anonymous'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ID: {rec.patientId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(rec.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500/80" />
                      Avg: {Math.round(rec.averageHeartRate)} BPM
                    </span>
                    <span className="text-slate-500">
                      Dev: {rec.deviceId}
                    </span>
                    <span className="text-slate-500">
                      Samples: {rec.sampleCount} ({rec.durationSeconds}s)
                    </span>
                  </div>

                  {rec.notes && (
                    <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">
                      Note: {rec.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onSelect(rec)}
                    className={`px-2 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {isSelected ? 'INSPECTING' : 'INSPECT'}
                  </button>
                  <button
                    onClick={() => onDelete(rec.id)}
                    className="p-1.5 rounded bg-white/5 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Delete record from server"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Recording Static Inspector Panel */}
      {selectedRecording && (
        <div className="border-t border-white/10 pt-3 flex flex-col gap-2 bg-black/40 p-3 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
              <FileText className="w-3.5 h-3.5" />
              ARCHIVE ANALYSIS: {selectedRecording.id}
            </span>
            <button
              onClick={() => onSelect(null as any)}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-mono cursor-pointer"
            >
              CLOSE
            </button>
          </div>

          <div className="text-[11px] text-slate-300 font-mono leading-relaxed bg-black p-2.5 rounded border border-white/5 flex flex-col gap-1">
            <div>
              <span className="text-slate-500">Patient:</span>{' '}
              <strong className="text-slate-200">{selectedRecording.patientName}</strong> (
              {selectedRecording.patientAge}yo, {selectedRecording.patientGender})
            </div>
            <div>
              <span className="text-slate-500">Record Date:</span>{' '}
              {formatDate(selectedRecording.timestamp)}
            </div>
            <div>
              <span className="text-slate-500">Hardware Feed:</span>{' '}
              {selectedRecording.deviceId}
            </div>
            <div>
              <span className="text-slate-500">Telemetry Stats:</span>{' '}
              {selectedRecording.sampleCount} points | {selectedRecording.durationSeconds}s | Avg{' '}
              <strong>{Math.round(selectedRecording.averageHeartRate)} BPM</strong>
            </div>
            {selectedRecording.notes && (
              <div className="mt-1 border-t border-slate-900 pt-1">
                <span className="text-slate-500">Clinical notes:</span>{' '}
                <p className="text-[10px] text-slate-400 leading-normal bg-slate-900/60 p-1.5 rounded mt-0.5 border border-slate-800/20">
                  {selectedRecording.notes}
                </p>
              </div>
            )}
          </div>

          {/* Render miniature static wave graph of the recording */}
          <div className="bg-black border border-white/10 rounded h-16 relative overflow-hidden">
            {/* Simple static grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:5px_5px]"></div>
            
            {/* Draw static waveform as inline SVG */}
            <svg className="w-full h-full absolute inset-0 text-emerald-400" viewBox="0 0 400 64" preserveAspectRatio="none">
              <path
                d={(() => {
                  const data = selectedRecording.ecgSignal;
                  // Downsample if too large, say max 200 points to fit svg cleanly
                  const step = Math.max(1, Math.floor(data.length / 200));
                  const points: string[] = [];
                  for (let i = 0; i < data.length; i += step) {
                    const x = (i / data.length) * 400;
                    // Max amplitude maps to 10 - 54 height
                    const y = 32 - data[i] * 20;
                    points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
                  }
                  return points.join(' ');
                })()}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
            <div className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-500 bg-black/80 px-1 rounded">
              Compressed Waveform (Static View)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}