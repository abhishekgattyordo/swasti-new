"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCases } from '@/context/CasesContext';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  User, 
  Stethoscope, 
  Send, 
  Info, 
  ArrowRight, 
  CheckCircle, 
  Activity
} from 'lucide-react';
import { SurgeryCase, SurgeryType, PriorityLevel } from '@/types';

export default function RecommenderPageClient() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId as string;

  const { addCase, activeUser } = useCases();

  // Form states
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [formBlood, setFormBlood] = useState('');
  const [formBed, setFormBed] = useState('');
  const [formPhone, setFormPhone] = useState('');
  
  const [formSurgery, setFormSurgery] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formType, setFormType] = useState<SurgeryType>('Elective');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('Medium');
  const [formDate, setFormDate] = useState('');
  const [formDuration, setFormDuration] = useState('60');
  const [formNotes, setFormNotes] = useState('');
  const [formDoctor, setFormDoctor] = useState(activeUser.name);

  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load doctors
  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await fetch('/ot/api/doctors');
        if (response.ok) {
          const data = await response.json();
          setDoctorsList(data);
          if (data.length > 0) {
            setFormDoctor(data[0].name);
          }
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    }
    fetchDoctors();
  }, []);

  // Sync doctor with active user role
  useEffect(() => {
    if (activeUser.name) {
      setFormDoctor(activeUser.name);
    }
  }, [activeUser]);

  // Fetch patient data using the API
  useEffect(() => {
    async function fetchPatientData() {
      if (!patientId) {
        setError('No patient ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/patient/admission-status?patientId=${patientId}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch patient data');
        }

        const { patient, admission } = result.data;

        // Populate form with patient data
        setFormName(patient.fullNameEn || '');
        if (patient.dob) {
          const birthDate = new Date(patient.dob);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          setFormAge(age.toString());
        }
        if (patient.gender) {
          const genderMap: Record<string, 'Male' | 'Female' | 'Other'> = {
            male: 'Male',
            female: 'Female',
            other: 'Other',
            prefer_not_to_say: 'Other',
          };
          setFormGender(genderMap[patient.gender.toLowerCase()] || 'Male');
        }
        setFormBlood(patient.bloodGroup || '');
        setFormPhone(patient.phone || '');
        if (admission && admission.diagnosis) {
          setFormDiagnosis(admission.diagnosis);
        } else {
          setFormDiagnosis('');
        }
        if (admission) {
          setFormBed(`Ward ID: ${admission.wardId || 'N/A'}, Bed ID: ${admission.bedId || 'N/A'}`);
        } else {
          setFormBed('Not admitted');
        }
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 3);
        setFormDate(targetDate.toISOString().split('T')[0]);

        const notesParts = [];
        if (patient.address) notesParts.push(`Address: ${patient.address}`);
        if (patient.city) notesParts.push(`City: ${patient.city}`);
        if (patient.state) notesParts.push(`State: ${patient.state}`);
        if (admission && admission.reason) notesParts.push(`Admission Reason: ${admission.reason}`);
        setFormNotes(notesParts.join('\n'));

        setFormSurgery('');

      } catch (err: any) {
        console.error('Error fetching patient:', err);
        setError(err.message || 'Failed to load patient data');
        toast.error(err.message || 'Failed to load patient data');
      } finally {
        setLoading(false);
      }
    }

    fetchPatientData();
  }, [patientId]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSurgery || !formDiagnosis) {
      toast.error('Please fill in the Patient Name, Diagnosis, and Proposed Surgery.');
      return;
    }

    setIsSubmitting(true);
    const newCaseId = `CASE-${Math.floor(100 + Math.random() * 900)}`;

    const newCaseData: Partial<SurgeryCase> = {
      id: newCaseId,
      patient: {
        id: patientId || `P-${Math.floor(500 + Math.random() * 500)}`,
        name: formName,
        age: parseInt(formAge),
        gender: formGender,
        admissionId: `ADM-${Math.floor(9000 + Math.random() * 999)}`,
        roomNumber: formBed,
        phone: formPhone,
        bloodGroup: formBlood
      },
      status: 'Recommended',
      currentStep: 1,
      recommendation: {
        surgeryName: formSurgery,
        diagnosis: formDiagnosis,
        surgeryType: formType,
        expectedDate: formDate,
        priorityLevel: formPriority,
        estimatedDuration: parseInt(formDuration),
        clinicalNotes: formNotes,
        recommendedBy: formDoctor,
        recommendedDate: new Date().toISOString().split('T')[0]
      }
    };

    try {
      await addCase(newCaseData);
      setSubmittedCaseId(newCaseId);
      setIsSuccess(true);
      
      // Show success toast
      toast.success(`✅ Case ${newCaseId} recommended successfully!`, {
        duration: 5000,
        position: 'top-right',
        icon: '🎉',
      });
      
      // Reset only recommendation fields (keep patient demographics)
      setFormSurgery('');
      setFormDiagnosis('');
      setFormNotes('');
      setFormType('Elective');
      setFormPriority('Medium');
      setFormDuration('60');
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 3);
      setFormDate(nextDate.toISOString().split('T')[0]);

    } catch (err: any) {
      console.error(err);
      toast.error('❌ Failed to submit case. Please try again.', {
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-gray-900">Error Loading Patient</h3>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => router.push('/doctor/admitted-patients')}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Back to My Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <div className="inline-flex items-center gap-1 bg-[#EAF7F4] text-[#1F8F89] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Recommending Clinician Workspace
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600" />
            Surgery Recommendation Console
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review patient data and draft surgical recommendation for <strong>{formName || 'Patient'}</strong>.
          </p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            Clinical Recommendation Console
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2.5 py-1 rounded-md">
            Patient ID: {patientId}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section 1: Patient Information */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Patient Demographics & Admission</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Full Name*</label>
                <input 
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Age (Years)*</label>
                <input 
                  type="number"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  placeholder="e.g. 52"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Gender*</label>
                <select 
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Blood Group</label>
                <input 
                  type="text"
                  value={formBlood}
                  onChange={(e) => setFormBlood(e.target.value)}
                  placeholder="e.g. O Positive"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Ward / Bed</label>
                <input 
                  type="text"
                  value={formBed}
                  onChange={(e) => setFormBed(e.target.value)}
                  placeholder="e.g. Ward A, Bed 14"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Phone</label>
                <input 
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Details */}
          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2. Diagnosis & Surgical Plan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Clinical Diagnosis*</label>
                <input 
                  type="text"
                  value={formDiagnosis}
                  onChange={(e) => setFormDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Appendicitis with Localized Peritonitis"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Proposed Surgical Procedure*</label>
                <input 
                  type="text"
                  value={formSurgery}
                  onChange={(e) => setFormSurgery(e.target.value)}
                  placeholder="e.g. Emergency Laparoscopic Appendectomy"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Admission Type</label>
                <select 
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition cursor-pointer"
                >
                  <option value="Elective">Elective</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Day Care">Day Care</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Urgency Priority*</label>
                <select 
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition cursor-pointer font-bold text-amber-700"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Immediate">Immediate (Crash Call)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Target Booking Date</label>
                <input 
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Est. Duration (Mins)</label>
                <input 
                  type="number"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Recommending Clinician */}
          <div className="border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">3. Clinical Justification & Authorization</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Recommending Clinician*</label>
                <select 
                  value={formDoctor}
                  onChange={(e) => setFormDoctor(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition cursor-pointer font-bold"
                  required
                >
                  {doctorsList.length > 0 ? (
                    doctorsList.map((d: any, idx: number) => (
                      <option key={idx} value={d.name}>{d.name} ({d.specialty || 'MD'})</option>
                    ))
                  ) : (
                    <option value="Dr. Devendra Mehta">Dr. Devendra Mehta (Surgeon)</option>
                  )}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 block mb-1">Clinical Notes & Surgical Guidelines</label>
                <textarea 
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  placeholder="Specify patient comorbidities, pre-op medication adjustments, cardiac clearance constraints, or specific positioning requirements..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800 transition"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Block */}
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Clicking submit establishes a persistent relational SQL record and fires real-time broadcast alerts to the OT scheduling desk.</span>
            </div>
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-md shadow-teal-500/10 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-slate-950"></div>
                  Registering Case...
                </>
              ) : (
                <>
                  <Send className="w-4.5 h-4.5" />
                  Recommend & Submit to Operating Theatre
                </>
              )}
            </button>
          </div>

        </form>
      </div>

   
      
    </div>
  );
}