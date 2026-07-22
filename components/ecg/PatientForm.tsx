'use client';

import React from 'react';
import { User, Clipboard, Edit3 } from 'lucide-react';
import { PatientInfo } from '@/types';

interface PatientFormProps {
  patient: PatientInfo;
  setPatient: React.Dispatch<React.SetStateAction<PatientInfo>>;
}

export default function PatientForm({ patient, setPatient }: PatientFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatient((prev) => ({
      ...prev,
      [name]: name === 'age' ? (value ? parseInt(value, 10) : '') : value,
    }));
  };

  return (
    <div id="patient_demographics_panel" className="vitals-card rounded-lg p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <User className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xs font-bold tracking-widest text-slate-200 uppercase font-sans">
          Patient Demographics
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Patient ID */}
        <div>
          <label className="block text-xs text-slate-400 font-mono mb-1">Patient ID:</label>
          <input
            type="text"
            name="id"
            value={patient.id}
            onChange={handleChange}
            placeholder="PT-90482"
            className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-green-500/50 transition-colors"
          />
        </div>

        {/* Patient Name */}
        <div>
          <label className="block text-xs text-slate-400 font-mono mb-1">Full Name:</label>
          <input
            type="text"
            name="name"
            value={patient.name}
            onChange={handleChange}
            placeholder="Johnathan Doe"
            className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-green-500/50 transition-colors"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs text-slate-400 font-mono mb-1">Age (Years):</label>
          <input
            type="number"
            name="age"
            value={patient.age}
            onChange={handleChange}
            placeholder="45"
            min="0"
            max="125"
            className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-green-500/50 transition-colors"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs text-slate-400 font-mono mb-1">Biological Gender:</label>
          <select
            name="gender"
            value={patient.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-green-500/50 transition-colors"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-xs text-slate-400 font-mono mb-1 flex items-center gap-1">
          <Clipboard className="w-3.5 h-3.5 text-slate-500" />
          Clinical Indications / ECG Notes:
        </label>
        <textarea
          name="notes"
          value={patient.notes}
          onChange={handleChange}
          rows={2}
          placeholder="e.g. Complains of mild palpitation. S3 heart sound clear. Resting ECG telemetry session..."
          className="w-full px-3 py-2 bg-black/80 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-green-500/50 transition-colors resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}