'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, TrendingUp, AlertCircle, Heart, Wind, Droplet, Thermometer, Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

interface VitalReading {
  timestamp: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  spO2: number;
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  bed: string;
  status: 'critical' | 'warning' | 'stable';
}

const REFERENCE_RANGES = {
  systolic: { min: 90, max: 140, normal: '90-140' },
  diastolic: { min: 60, max: 90, normal: '60-90' },
  heartRate: { min: 60, max: 100, normal: '60-100' },
  temperature: { min: 36.1, max: 37.2, normal: '36.1-37.2°C' },
  respiratoryRate: { min: 12, max: 20, normal: '12-20' },
  spO2: { min: 95, max: 100, normal: '95-100%' },
};

const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: 'John Doe', bed: 'ICU-101', status: 'critical' },
  { id: 'P002', name: 'Mary Smith', bed: 'ICU-102', status: 'warning' },
  { id: 'P003', name: 'Robert Johnson', bed: 'Ward-201', status: 'stable' },
  { id: 'P004', name: 'Sarah Williams', bed: 'Ward-202', status: 'stable' },
];

const generateMockVitalHistory = () => {
  const history: VitalReading[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    history.push({
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systolic: 110 + Math.random() * 30,
      diastolic: 70 + Math.random() * 20,
      heartRate: 75 + Math.random() * 20,
      temperature: 36.8 + Math.random() * 1.2,
      respiratoryRate: 16 + Math.random() * 8,
      spO2: 97 + Math.random() * 3,
    });
  }
  return history;
};

export default function VitalsPage() {
  const [selectedPatient, setSelectedPatient] = useState<string>(MOCK_PATIENTS[0].id);
  const [vitalHistory, setVitalHistory] = useState<VitalReading[]>(generateMockVitalHistory());
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    spO2: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [chartTab, setChartTab] = useState<'24h' | 'trends'>('24h');

  const patient = MOCK_PATIENTS.find(p => p.id === selectedPatient);
  const latestReading = vitalHistory[vitalHistory.length - 1];

  const isValueCritical = (key: keyof typeof REFERENCE_RANGES, value: number) => {
    const range = REFERENCE_RANGES[key];
    return value < range.min || value > range.max;
  };

  const getStatusColor = (key: keyof typeof REFERENCE_RANGES, value: number) => {
    if (!value) return 'text-slate-600';
    if (isValueCritical(key, value)) return 'text-red-600 font-bold';
    return 'text-green-600';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newReading: VitalReading = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systolic: parseFloat(formData.systolic) || 0,
      diastolic: parseFloat(formData.diastolic) || 0,
      heartRate: parseFloat(formData.heartRate) || 0,
      temperature: parseFloat(formData.temperature) || 0,
      respiratoryRate: parseFloat(formData.respiratoryRate) || 0,
      spO2: parseFloat(formData.spO2) || 0,
      notes: formData.notes,
    };

    setVitalHistory(prev => [...prev.slice(1), newReading]);
    setFormData({
      systolic: '',
      diastolic: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      spO2: '',
      notes: '',
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
         
          <div className="flex items-center gap-2">
            <Activity size={24} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vitals Entry & Monitoring</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <Check size={20} className="text-green-600" />
            <p className="text-green-700 dark:text-green-300 font-medium">Vitals recorded successfully!</p>
          </div>
        )}

        {/* Patient Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Patient</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {MOCK_PATIENTS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPatient === p.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-blue-300'
                }`}
              >
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bed {p.bed}</p>
                <div className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  p.status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  p.status === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Entry Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Record Vitals</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Blood Pressure */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Heart size={16} className="text-red-600" />
                    Blood Pressure (mmHg)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="systolic"
                      placeholder="Systolic"
                      value={formData.systolic}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                      step="0.1"
                    />
                    <span className="px-2 py-2 text-gray-600 dark:text-gray-400">/</span>
                    <input
                      type="number"
                      name="diastolic"
                      placeholder="Diastolic"
                      value={formData.diastolic}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                      step="0.1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Normal: {REFERENCE_RANGES.systolic.normal}</p>
                </div>

                {/* Heart Rate */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Heart size={16} className="text-pink-600" />
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    name="heartRate"
                    placeholder="Enter heart rate"
                    value={formData.heartRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Normal: {REFERENCE_RANGES.heartRate.normal}</p>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Thermometer size={16} className="text-orange-600" />
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    name="temperature"
                    placeholder="Enter temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Normal: {REFERENCE_RANGES.temperature.normal}</p>
                </div>

                {/* Respiratory Rate */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Wind size={16} className="text-blue-600" />
                    Respiratory Rate (breaths/min)
                  </label>
                  <input
                    type="number"
                    name="respiratoryRate"
                    placeholder="Enter respiratory rate"
                    value={formData.respiratoryRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Normal: {REFERENCE_RANGES.respiratoryRate.normal}</p>
                </div>

                {/* SpO2 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Droplet size={16} className="text-cyan-600" />
                    SpO₂ (%)
                  </label>
                  <input
                    type="number"
                    name="spO2"
                    placeholder="Enter oxygen saturation"
                    value={formData.spO2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Normal: {REFERENCE_RANGES.spO2.normal}</p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Clinical Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Additional observations..."
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 h-20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Save Vitals
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Charts and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Latest Vitals Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Latest Readings - {patient?.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Blood Pressure</p>
                  <p className={`text-2xl font-bold ${getStatusColor('systolic', latestReading.systolic)}`}>
                    {latestReading.systolic.toFixed(0)}/{latestReading.diastolic.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">mmHg</p>
                </div>
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Heart Rate</p>
                  <p className={`text-2xl font-bold ${getStatusColor('heartRate', latestReading.heartRate)}`}>
                    {latestReading.heartRate.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">bpm</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Temperature</p>
                  <p className={`text-2xl font-bold ${getStatusColor('temperature', latestReading.temperature)}`}>
                    {latestReading.temperature.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">°C</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Resp. Rate</p>
                  <p className={`text-2xl font-bold ${getStatusColor('respiratoryRate', latestReading.respiratoryRate)}`}>
                    {latestReading.respiratoryRate.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">breaths/min</p>
                </div>
                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">SpO₂</p>
                  <p className={`text-2xl font-bold ${getStatusColor('spO2', latestReading.spO2)}`}>
                    {latestReading.spO2.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">%</p>
                </div>
              </div>
            </div>

            {/* Critical Alerts */}
            {Object.entries(formData).some(([key, value]) => {
              const numValue = parseFloat(value);
              if (key === 'notes' || !value) return false;
              const refKey = key as keyof typeof REFERENCE_RANGES;
              return isValueCritical(refKey, numValue);
            }) && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-700 dark:text-red-300 mb-1">Critical Values Detected</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">One or more vital signs are outside normal ranges. Please review and consider escalation if needed.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  24-Hour Trends
                </h2>
              </div>

              {/* Heart Rate Chart */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Heart Rate (bpm)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={vitalHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="timestamp" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartRate" stroke="#ec4899" dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Blood Pressure Chart */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Blood Pressure (mmHg)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={vitalHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="timestamp" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="systolic" fill="#dc2626" isAnimationActive={false} />
                    <Line type="monotone" dataKey="diastolic" stroke="#059669" isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* SpO2 and Temperature Chart */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">SpO₂ (%) & Temperature (°C)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={vitalHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="timestamp" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" yAxisId="left" />
                    <YAxis stroke="#94a3b8" yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="spO2" stroke="#06b6d4" name="SpO₂ %" isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#f59e0b" name="Temp (°C)" isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}