'use client';

import React, { useEffect, useState } from 'react';
import { Users, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PatientSelectorProps {
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  onOpenAdmissionModal: () => void;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  heartRate: number;
  condition: string;
  rhythm: string;
  prInterval: number;
  qrsDuration: number;
  qtInterval: number;
  qtcInterval: number;
  heartAxis: string;
  status: string;
  description: string;
  triage?: string;
  uhid?: string;
}

export default function PatientSelector({ selectedPatientId, onSelectPatient, onOpenAdmissionModal }: PatientSelectorProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/emergency/assessments');
        const data = await res.json();
        
        if (data.success) {
          // Transform assessments to patient format
          const transformedPatients = data.data
            .filter((a: any) => a.status !== 'Draft')
            .map((a: any) => ({
              id: a.id,
              name: a.patientName || 'Unknown',
              age: a.age || 30,
              gender: a.gender || 'Male',
              heartRate: a.heartRate || 112,
              condition: a.condition || a.decision || 'Under Evaluation',
              rhythm: a.rhythm || 'Normal Sinus Rhythm',
              prInterval: a.prInterval || 0.16,
              qrsDuration: a.qrsDuration || 0.08,
              qtInterval: a.qtInterval || 0.36,
              qtcInterval: a.qtcInterval || 0.40,
              heartAxis: a.heartAxis || 'Normal',
              status: a.status || 'Stable',
              description: a.description || 'No description available',
              triage: a.triage || 'Red',
              uhid: a.uhid || `UHID-${a.id}`
            }));
          
          setPatients(transformedPatients);
        } else {
          toast.error('Failed to fetch patients');
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              Emergency Patients
            </h3>
          </div>
          <button 
            onClick={onOpenAdmissionModal}
            className="text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            + ADMIT PATIENT
          </button>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#2BB2A7]" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-blue-600" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Emergency Patients
          </h3>
        </div>
        <button 
          onClick={onOpenAdmissionModal}
          className="text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-2 py-1 rounded transition-colors cursor-pointer"
        >
          + ADMIT PATIENT
        </button>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {patients.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No patients found in emergency department
          </div>
        ) : (
          patients.map((p) => {
            const isSelected = p.id === selectedPatientId;
            const isHighEmergency = p.condition?.includes('STEMI') || 
                                   p.condition?.includes('Tachycardia') || 
                                   p.triage === 'Red';
            const isWarning = p.condition?.includes('Fibrillation') || 
                             p.condition?.includes('PVC') ||
                             p.triage === 'Yellow';

            let badgeColor = 'bg-slate-100 border-slate-200 text-slate-600';
            if (isHighEmergency) {
              badgeColor = 'bg-rose-50 border-rose-100 text-rose-600 animate-pulse font-bold';
            } else if (isWarning) {
              badgeColor = 'bg-amber-50 border-amber-100 text-amber-600';
            } else if (p.status === 'Stable' || p.triage === 'Green') {
              badgeColor = 'bg-emerald-50 border-emerald-100 text-emerald-600';
            }

            return (
              <button
                key={p.id}
                id={`patient-btn-${p.id}`}
                onClick={() => onSelectPatient(p.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/40 border-blue-500 shadow-sm'
                    : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-semibold text-slate-400">{p.uhid || p.id}</span>
                    <span className="text-xs font-bold text-slate-800">{p.name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                    <span>Age {p.age}</span>
                    <span>•</span>
                    <span>{p.gender}</span>
                    {p.triage && (
                      <>
                        <span>•</span>
                        <span className={`font-semibold ${
                          p.triage === 'Red' ? 'text-red-600' : 
                          p.triage === 'Yellow' ? 'text-amber-600' : 
                          'text-green-600'
                        }`}>
                          {p.triage}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-[150px]">
                    {p.rhythm}
                  </p>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-semibold tracking-tight ${badgeColor}`}>
                    {p.condition?.includes('Normal') ? 'NORMAL' : 'PATHOLOGY'}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <Heart className={`h-3 w-3 ${isHighEmergency ? 'text-rose-500 animate-bounce' : 'text-slate-400'}`} />
                    <span className="font-mono text-xs font-bold text-slate-700">{p.heartRate}</span>
                    <span className="text-[8px] text-slate-400 font-mono">BPM</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}