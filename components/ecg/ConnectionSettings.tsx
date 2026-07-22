'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  Info,
  Server,
  Network,
  Laptop,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { ConnectionState } from '@/types';

interface ConnectionSettingsProps {
  wsUrl: string;
  setWsUrl: (url: string) => void;
  connectionState: ConnectionState;
  onConnect: (mode: 'ws' | 'simulator') => void;
  onDisconnect: () => void;
  activeMode: 'ws' | 'simulator' | null;
  errorMessage: string | null;
}

export default function ConnectionSettings({
  wsUrl,
  setWsUrl,
  connectionState,
  onConnect,
  onDisconnect,
  activeMode,
  errorMessage,
}: ConnectionSettingsProps) {
  // ✅ Default to the hosted WebSocket simulator (secure wss://)
  const [builtInUrl, setBuiltInUrl] = useState<string>('wss://ecg-simulator.onrender.com');
  const [showWifiGuide, setShowWifiGuide] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      setBuiltInUrl(`${protocol}//${host}/ws`);
    }
  }, []);

  const handlePresetSelect = (url: string) => {
    setWsUrl(url);
  };

  return (
    <div id="connection_settings_panel" className="vitals-card rounded-lg p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xs font-bold tracking-widest text-slate-200 uppercase font-sans">
            Telemetry Connection
          </h2>
        </div>

        {/* Live status badge */}
        <div>
          {connectionState === 'connected' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              CONNECTED
            </span>
          )}
          {connectionState === 'connecting' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              CONNECTING
            </span>
          )}
          {connectionState === 'disconnected' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              DISCONNECTED
            </span>
          )}
        </div>
      </div>

      {/* Main Connection Controls */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs text-slate-400 font-mono mb-1.5 flex items-center justify-between">
            <span>WebSocket Gateway Address:</span>
            <span className="text-[10px] text-slate-500 italic">Cloud Simulator or Local Host</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Network className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                disabled={connectionState !== 'disconnected'}
                placeholder="wss://ecg-simulator.onrender.com"
                className="w-full pl-9 pr-3 py-2 bg-black/80 border border-white/10 rounded-lg text-sm text-slate-200 font-mono focus:outline-none focus:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5">
          {connectionState === 'disconnected' ? (
            <>
              <button
                onClick={() => onConnect('ws')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-semibold text-sm transition-all shadow-none cursor-pointer"
              >
                <Wifi className="w-4 h-4" />
                Connect WS
              </button>
              <button
                onClick={() => onConnect('simulator')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
                title="Use offline browser-side generator fallback"
              >
                <RefreshCw className="w-4 h-4" />
                Simulate
              </button>
            </>
          ) : (
            <button
              onClick={onDisconnect}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-sm transition-all cursor-pointer"
            >
              <WifiOff className="w-4 h-4" />
              Disconnect telemetry
            </button>
          )}
        </div>
      </div>

      {/* Quick Connect presets list */}
      <div className="bg-black/40 border border-white/5 rounded-lg p-3 flex flex-col gap-2">
        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
          <Server className="w-3 h-3 text-slate-500" /> Connection Quick Presets:
        </div>
        <div className="grid grid-cols-1 gap-2">
          {/* Preset – Hosted ECG Simulator */}
          <button
            onClick={() => handlePresetSelect('wss://ecg-simulator.onrender.com')}
            disabled={connectionState !== 'disconnected'}
            className="flex items-start justify-between p-2 bg-black/40 hover:bg-black border border-white/10 rounded text-left transition-all disabled:opacity-50 disabled:hover:bg-black/40 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-500" />
              <div>
                <p className="text-xs font-semibold text-slate-300 font-mono">Cloud ECG Simulator</p>
                <p className="text-[10px] text-slate-500 font-mono">wss://ecg-simulator.onrender.com</p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-emerald-500/70 border border-emerald-500/20 bg-emerald-500/5 px-1.5 py-0.5 rounded">
              REMOTE WS
            </span>
          </button>

          {/* Preset Built-in (auto-detected) */}
          <button
            onClick={() => handlePresetSelect(builtInUrl)}
            disabled={connectionState !== 'disconnected'}
            className="flex items-start justify-between p-2 bg-black/40 hover:bg-black border border-white/10 rounded text-left transition-all disabled:opacity-50 disabled:hover:bg-black/40 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-500" />
              <div>
                <p className="text-xs font-semibold text-slate-300 font-mono">Built-In Sandbox Server</p>
                <p className="text-[10px] text-slate-500 font-mono overflow-hidden text-ellipsis max-w-[150px] sm:max-w-[200px]">
                  {builtInUrl}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-cyan-500/70 border border-cyan-500/20 bg-cyan-500/5 px-1.5 py-0.5 rounded">
              WSS PREVIEW
            </span>
          </button>
        </div>
      </div>

      {/* Wi-Fi / Connection Guide – updated to mention hosted simulator */}
      <div className="border border-white/5 rounded-lg overflow-hidden bg-black/20">
        {/* <button
          onClick={() => setShowWifiGuide(!showWifiGuide)}
          className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 font-mono uppercase tracking-wider transition-all cursor-pointer font-bold"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            Connection Guide
          </span>
          {showWifiGuide ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button> */}

        {showWifiGuide && (
          <div className="p-3 text-xs text-slate-400 font-sans border-t border-white/5 space-y-3 leading-relaxed bg-black/40">
            <div>
              <p className="font-mono text-[10px] uppercase font-bold text-slate-300 mb-1 flex items-center gap-1">
                <span className="bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded text-[8px]">Option 1</span>
                Hosted Cloud Simulator (Recommended)
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
                <li>
                  Use the preset <strong>"Cloud ECG Simulator"</strong> above – it connects to a secure WebSocket server at{' '}
                  <code className="text-emerald-400 font-mono bg-white/5 px-1 py-0.5 rounded">wss://ecg-simulator.onrender.com</code>.
                </li>
                <li>No local network configuration needed – works over the internet.</li>
              </ul>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase font-bold text-slate-300 mb-1 flex items-center gap-1">
                <span className="bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded text-[8px]">Option 2</span>
                Local Laptop Setup (Wi‑Fi)
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
                <li>Ensure host laptop is on your local Wi‑Fi network.</li>
                <li>
                  Find host local IP address:
                  <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-slate-500 font-mono text-[10px]">
                    <li>Windows: <code className="text-slate-300 font-bold bg-white/5 px-1 py-0.5 rounded">ipconfig</code> → IPv4 Address.</li>
                    <li>macOS/Linux: <code className="text-slate-300 font-bold bg-white/5 px-1 py-0.5 rounded">ipconfig getifaddr en0</code> or check Wi‑Fi details.</li>
                  </ul>
                </li>
                <li>
                  Configure the WebSocket URL as <code className="text-emerald-400 font-mono bg-white/5 px-1 py-0.5 rounded">ws://&lt;HOST_IP&gt;:3000/ws</code>.
                </li>
                <li>Make sure your server is running and accepting connections on port 3000.</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-white/5">
              <p className="font-mono text-[10px] uppercase font-bold text-amber-400/90 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                Browser Mixed-Content Restriction
              </p>
              <p className="text-[10px] text-slate-500 leading-normal">
                If your app is served over <strong className="text-slate-400">HTTPS</strong>, the browser may block insecure <code className="text-slate-400 font-mono">ws://</code> connections to local IPs. 
                Use the <strong>Cloud Simulator</strong> (secure <code className="text-slate-400 font-mono">wss://</code>) or run your app locally over HTTP.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Output */}
      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2 text-xs text-rose-400">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="font-mono">
            <span className="font-semibold block mb-0.5">Connection Error:</span>
            {errorMessage}
            {errorMessage.includes('SecurityError') && (
              <span className="block mt-1 text-[10px] text-rose-500/80 leading-normal">
                Notice: Mixed content restrictions block insecure `ws://` connections from an `https://` hosted workspace. Use the "Cloud ECG Simulator" preset (secure `wss://`) to stream data.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}