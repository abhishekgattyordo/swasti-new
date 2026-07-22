'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, ShieldAlert, Heart } from 'lucide-react';

interface PatientAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmit: (patientData: any) => void;
}

export default function PatientAdmissionModal({ isOpen, onClose, onAdmit }: PatientAdmissionModalProps) {
  const [formData, setFormData] = useState({
    fullNameEn: '',
    fullNameHi: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    bloodGroup: 'O+',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    condition: 'Normal Sinus Rhythm',
    heartRate: 72
  });

  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeErrors: string[] = [];

    if (!formData.fullNameEn) activeErrors.push('Patient Full Name (English) is required.');
    if (!formData.dob) activeErrors.push('Date of Birth is required.');
    if (!formData.phone) activeErrors.push('Contact Phone Number is required.');

    if (activeErrors.length > 0) {
      setErrors(activeErrors);
      return;
    }

    // Set rhythm details depending on selected condition
    let rhythm = 'Normal Sinus Rhythm (NSR)';
    let prInterval = 160;
    let qrsDuration = 85;
    let qtInterval = 390;
    let qtcInterval = 410;
    let heartAxis = 55;
    let status: 'Normal' | 'Abnormal' = 'Normal';
    let description = 'Patient admitted with standard baseline rhythms.';

    if (formData.condition === 'ST-Elevation MI (STEMI)') {
      rhythm = 'Sinus Tachycardia with Acute Anterior ST-Elevation';
      prInterval = 155;
      qrsDuration = 95;
      qtInterval = 380;
      qtcInterval = 450;
      heartAxis = 45;
      status = 'Abnormal';
      description = 'EMERGENCY: Patient shows acute anteroseptal myocardial injury.';
    } else if (formData.condition === 'Atrial Fibrillation') {
      rhythm = 'Atrial Fibrillation (AFib) with Rapid Ventricular Response';
      prInterval = 0;
      qrsDuration = 90;
      qtInterval = 320;
      qtcInterval = 460;
      heartAxis = -15;
      status = 'Abnormal';
      description = 'Patient has chaotic fibrillatory activity with fast pulse values.';
    } else if (formData.condition === 'Ventricular Tachycardia') {
      rhythm = 'Monomorphic Ventricular Tachycardia (VT)';
      prInterval = 0;
      qrsDuration = 160;
      qtInterval = 0;
      qtcInterval = 0;
      heartAxis = -110;
      status = 'Abnormal';
      description = 'CRITICAL: Continuous rapid wide-complex rhythm.';
    } else if (formData.condition === 'Premature Ventricular Contractions') {
      rhythm = 'Sinus Rhythm with Frequent PVCs (Bigeminy)';
      prInterval = 165;
      qrsDuration = 140;
      qtInterval = 400;
      qtcInterval = 430;
      heartAxis = 75;
      status = 'Abnormal';
      description = 'Frequent extra abnormal ventricular conduction cycles.';
    } else if (formData.condition === 'Sinus Bradycardia') {
      rhythm = 'Sinus Bradycardia';
      prInterval = 180;
      qrsDuration = 80;
      qtInterval = 440;
      qtcInterval = 395;
      heartAxis = 65;
      status = 'Normal';
      description = 'Slowed heartbeat sequence. Patient stable.';
    }

    // Map age dynamically from DOB
    const birthYear = new Date(formData.dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    const admittedPatient = {
      id: `PAT-00${Math.floor(Math.random() * 900) + 100}`,
      name: formData.fullNameEn,
      nameHi: formData.fullNameHi || null,
      age,
      gender: formData.gender,
      condition: formData.condition,
      heartRate: Number(formData.heartRate),
      rhythm,
      prInterval,
      qrsDuration,
      qtInterval,
      qtcInterval,
      heartAxis,
      status,
      description,
      bloodGroup: formData.bloodGroup,
      phone: formData.phone,
      email: formData.email,
      address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country} - ${formData.pincode}`
    };

    onAdmit(admittedPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Heart className="h-5 w-5 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">New Clinical Patient Admission</h2>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Ward Registry Entry</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg border border-transparent hover:border-slate-100 cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {errors.length > 0 && (
            <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-rose-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span>Admission Check Failures</span>
              </div>
              <ul className="list-disc pl-5 text-[11px] font-medium">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Patient Core Identity Block */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 font-mono uppercase tracking-wide">Full Name (English) *</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                value={formData.fullNameEn}
                onChange={e => setFormData({ ...formData, fullNameEn: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 font-mono uppercase tracking-wide">Full Name (Hindi Translation)</label>
              <input
                type="text"
                placeholder="उदा. जॉन डो"
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                value={formData.fullNameHi}
                onChange={e => setFormData({ ...formData, fullNameHi: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="font-bold text-slate-600 font-mono uppercase tracking-wide">Date of Birth *</label>
              <input
                type="date"
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-mono font-semibold"
                value={formData.dob}
                onChange={e => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 font-mono uppercase tracking-wide">Gender</label>
              <select
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-bold bg-white"
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 font-mono uppercase tracking-wide">Blood Group</label>
              <select
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-bold bg-white"
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 font-mono uppercase tracking-wide">Mobile Phone *</label>
              <input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 font-mono uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                placeholder="john.doe@hospital.org"
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Physical Location Details */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-600 font-mono uppercase tracking-wide">Residential Address</label>
            <input
              type="text"
              placeholder="Apartment, Street address"
              className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="font-bold text-slate-600 font-mono uppercase tracking-wide">City / Town</label>
              <input
                type="text"
                placeholder="City"
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 font-mono uppercase tracking-wide">Pincode</label>
              <input
                type="text"
                placeholder="Pincode"
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                value={formData.pincode}
                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-600 font-mono uppercase tracking-wide">State</label>
              <input
                type="text"
                placeholder="State"
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          {/* Telemetry Ward Initializer Block */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center space-x-1.5 font-bold text-slate-700">
              <ShieldAlert className="h-4.5 w-4.5 text-blue-600" />
              <span>Initial Telemetry Node State</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600">Starting Heart Rhythm</label>
                <select
                  className="w-full border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-blue-500 font-semibold bg-white"
                  value={formData.condition}
                  onChange={e => {
                    const cond = e.target.value;
                    let defaultHR = 72;
                    if (cond === 'Sinus Bradycardia') defaultHR = 48;
                    else if (cond === 'ST-Elevation MI (STEMI)') defaultHR = 94;
                    else if (cond === 'Atrial Fibrillation') defaultHR = 124;
                    else if (cond === 'Premature Ventricular Contractions') defaultHR = 74;
                    else if (cond === 'Ventricular Tachycardia') defaultHR = 185;

                    setFormData({ ...formData, condition: cond, heartRate: defaultHR });
                  }}
                >
                  <option value="Normal Sinus Rhythm">Normal Sinus Rhythm (NSR)</option>
                  <option value="Sinus Bradycardia">Sinus Bradycardia (Brady)</option>
                  <option value="Atrial Fibrillation">Atrial Fibrillation (AFib)</option>
                  <option value="Premature Ventricular Contractions">Premature Ventricular Contractions (PVCs)</option>
                  <option value="ST-Elevation MI (STEMI)">ST-Elevation MI (STEMI Emergency)</option>
                  <option value="Ventricular Tachycardia">Ventricular Tachycardia (VT Emergency)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-600">Starting Heart Rate (BPM)</label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  className="w-full border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-blue-500 font-mono font-bold"
                  value={formData.heartRate}
                  onChange={e => setFormData({ ...formData, heartRate: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors cursor-pointer"
            >
              ADMIT PATIENT ENTRY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
