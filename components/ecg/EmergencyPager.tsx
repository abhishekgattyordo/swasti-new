'use client';

import React from 'react';
import { Phone, CheckCircle2, RefreshCw, Send, AlertCircle } from 'lucide-react';

interface EmergencyPagerProps {
  pagerStatus: 'IDLE' | 'SENDING' | 'DELIVERED' | 'ACKNOWLEDGED';
  pagerLog: { time: string; msg: string }[];
}

export default function EmergencyPager({ pagerStatus, pagerLog }: EmergencyPagerProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center space-x-2">
          <Phone className={`h-4.5 w-4.5 ${pagerStatus !== 'IDLE' ? 'text-rose-600 animate-bounce' : 'text-slate-500'}`} />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Physician Dispatch Gateway
          </h3>
        </div>
        
        {/* Connection status tag */}
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
          pagerStatus === 'ACKNOWLEDGED' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : pagerStatus === 'DELIVERED'
            ? 'bg-blue-50 text-blue-700 border border-blue-100'
            : pagerStatus === 'SENDING'
            ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
            : 'bg-slate-50 text-slate-400 border border-slate-100'
        }`}>
          {pagerStatus}
        </span>
      </div>

      {pagerStatus === 'IDLE' ? (
        <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-50 rounded-lg border border-slate-100">
          <CheckCircle2 className="h-6 w-6 text-slate-400 mb-1.5" />
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            GATEWAY STANDBY
          </span>
          <p className="text-[9px] text-slate-400 max-w-[200px] mt-1 text-center">
            The hospital pager network is listening. Critical arrhythmias will auto-trigger cellular specialist routing.
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in duration-300">
          {/* Active pager logs */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {pagerLog.map((log, i) => (
              <div key={i} className="text-[10px] font-mono leading-normal bg-slate-50 border border-slate-100 p-2.5 rounded">
                <div className="flex items-center justify-between text-slate-400 mb-1 font-bold">
                  <span>[LOG_GATEWAY_HOP_{i + 1}]</span>
                  <span>{log.time}</span>
                </div>
                <p className="text-slate-700 font-medium">
                  {log.msg}
                </p>
              </div>
            ))}
          </div>

          {/* Graphical Paging Progress bar */}
          <div className="bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                pagerStatus === 'ACKNOWLEDGED' 
                  ? 'w-full bg-emerald-500' 
                  : pagerStatus === 'DELIVERED'
                  ? 'w-2/3 bg-blue-500'
                  : 'w-1/3 bg-amber-500 animate-pulse'
              }`}
            />
          </div>
          
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 font-semibold uppercase">
            <span className="flex items-center gap-1">
              <Send className="h-3 w-3" /> HL7 Priority 1
            </span>
            <span>Cellular Tower Hop #3</span>
          </div>
        </div>
      )}
    </div>
  );
}
