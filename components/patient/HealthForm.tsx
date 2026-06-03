// components/patient/HealthForm.tsx
'use client';

import React, { useState } from 'react';
import { Activity, Heart, Thermometer, User, Utensils, Moon, Brain, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================
// TYPES DEFINED IN SAME FILE
// ============================================

export interface PatientData {
  // Personal Information
  age: number;
  gender: string;
  height: number;
  weight: number;
  occupation: string;
  
  // Lifestyle
  lifestyle: string;
  dietType: string;
  sleepHours: number;
  waterIntake: number;
  exerciseFrequency: string;
  stressLevel: number;
  smoking: boolean;
  alcohol: boolean;
  dailySteps: number;
  fitnessGoals: string[];
  
  // Medical History
  diseases: string[];
  allergies: string[];
  medications: string[];
  pastSurgeries: string[];
  familyHistory: string[];
  
  // Vital Signs
  bloodPressure: string;
  bloodSugar: number;
  heartRate: number;
  oxygenSaturation: number;
  cholesterol: number;
  
  // Current Issues
  currentProblems: string;
}

interface HealthFormProps {
  onSubmit: (data: PatientData) => void | Promise<void>;
  isLoading: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function HealthForm({ onSubmit, isLoading }: HealthFormProps) {
  const [formData, setFormData] = useState<PatientData>({
    age: 30,
    gender: 'Other',
    height: 170,
    weight: 70,
    occupation: '',
    lifestyle: 'Sedentary',
    diseases: [],
    bloodPressure: '120/80',
    bloodSugar: 90,
    heartRate: 70,
    oxygenSaturation: 98,
    cholesterol: 180,
    allergies: [],
    medications: [],
    pastSurgeries: [],
    familyHistory: [],
    dietType: 'Balanced',
    sleepHours: 7,
    waterIntake: 2,
    exerciseFrequency: 'Occasionally',
    stressLevel: 5,
    smoking: false,
    alcohol: false,
    dailySteps: 5000,
    fitnessGoals: [],
    currentProblems: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleArrayInput = (name: keyof PatientData, value: string) => {
    if (!value) return;
    setFormData(prev => ({
      ...prev,
      [name]: [...(prev[name] as string[]), value]
    }));
  };

  const removeArrayItem = (name: keyof PatientData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [name]: (prev[name] as string[]).filter((_, i) => i !== index)
    }));
  };

  const [newItem, setNewItem] = useState({ diseases: '', allergies: '', medications: '', goals: '' });

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center space-y-3">
        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em]">Diagnostic Engine</h3>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Patient Health Profile</h2>
        <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed font-medium">Input your biometric data for an AI-calculated personalized wellness roadmap.</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }}
      >
        {/* Personal & Physical Section */}
        <section className="col-span-full bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
            <User className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Physical Foundations</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-100 font-semibold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-100 font-semibold">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-100 font-semibold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-100 font-semibold" />
            </div>
          </div>
        </section>

        {/* Vital Signs */}
        <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
            <Activity className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Vital Sign Metrics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 border-l-2 border-slate-100 pl-4 py-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Blood Pressure</label>
              <input type="text" name="bloodPressure" placeholder="120/80" value={formData.bloodPressure} onChange={handleChange} className="w-full bg-transparent outline-none font-bold text-lg" />
            </div>
            <div className="space-y-1.5 border-l-2 border-slate-100 pl-4 py-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Heart Rate</label>
              <input type="number" name="heartRate" value={formData.heartRate} onChange={handleChange} className="w-full bg-transparent outline-none font-bold text-lg" />
            </div>
            <div className="space-y-1.5 border-l-2 border-slate-100 pl-4 py-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Glucose (mg/dL)</label>
              <input type="number" name="bloodSugar" value={formData.bloodSugar} onChange={handleChange} className="w-full bg-transparent outline-none font-bold text-lg" />
            </div>
            <div className="space-y-1.5 border-l-2 border-slate-100 pl-4 py-1">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">O2 Sat (%)</label>
              <input type="number" name="oxygenSaturation" value={formData.oxygenSaturation} onChange={handleChange} className="w-full bg-transparent outline-none font-bold text-lg" />
            </div>
          </div>
        </section>

        {/* Lifestyle & Habits */}
        <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
            <Utensils className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Habitual Factors</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Exercise Frequency</label>
                <select name="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 rounded-xl outline-none font-semibold text-sm">
                  <option>Never</option>
                  <option>Occasionally</option>
                  <option>1-2 times/week</option>
                  <option>3-5 times/week</option>
                  <option>Daily</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Sleep (hrs)</label>
                <input type="number" name="sleepHours" value={formData.sleepHours} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 rounded-xl outline-none font-semibold text-sm" />
              </div>
            </div>
            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${formData.smoking ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-300'}`}>
                   {formData.smoking && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <input type="checkbox" name="smoking" checked={formData.smoking} onChange={handleCheckbox} className="hidden" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Smoker</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${formData.alcohol ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-300'}`}>
                   {formData.alcohol && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                </div>
                <input type="checkbox" name="alcohol" checked={formData.alcohol} onChange={handleCheckbox} className="hidden" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Alcohol</span>
              </label>
            </div>
          </div>
        </section>

        {/* Medical Registry Section */}
        <section className="col-span-full bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Medical History Registry</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Existing Conditions</label>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g. Type II Diabetes" className="flex-1 px-4 py-2 bg-slate-50 rounded-xl outline-none border border-slate-100 text-sm" value={newItem.diseases} onChange={(e) => setNewItem({ ...newItem, diseases: e.target.value })} />
                <button type="button" onClick={() => { handleArrayInput('diseases', newItem.diseases); setNewItem({ ...newItem, diseases: '' }); }} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.diseases.map((item, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-2">
                    {item}
                    <button type="button" onClick={() => removeArrayItem('diseases', i)} className="hover:text-rose-500 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Current Medications</label>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g. Metformin" className="flex-1 px-4 py-2 bg-slate-50 rounded-xl outline-none border border-slate-100 text-sm" value={newItem.medications} onChange={(e) => setNewItem({ ...newItem, medications: e.target.value })} />
                <button type="button" onClick={() => { handleArrayInput('medications', newItem.medications); setNewItem({ ...newItem, medications: '' }); }} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.medications.map((item, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-2">
                    {item}
                    <button type="button" onClick={() => removeArrayItem('medications', i)} className="hover:text-rose-500 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Current Symptoms Section */}
        <section className="col-span-full bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-50">
            <Brain className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Current Concerns & Symptoms</h3>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Describe what you are feeling</label>
            <textarea 
              name="currentProblems" 
              value={formData.currentProblems} 
              onChange={handleChange}
              placeholder="e.g. Persistent lower back pain for 3 days, frequent headaches in the afternoon..."
              className="w-full px-4 py-4 bg-slate-50 rounded-2xl outline-none border border-slate-100 text-sm min-h-[120px] resize-none focus:ring-2 focus:ring-amber-500/10 transition-all font-medium"
            />
          </div>
        </section>

        <div className="col-span-full pt-6">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-5 rounded-[2rem] font-bold text-sm tracking-[0.2em] uppercase transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Commencing Analysis...
              </span>
            ) : (
              'Generate Strategic Roadmap'
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}