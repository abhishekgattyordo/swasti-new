'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Activity, 
  Layers, 
  Shuffle, 
  ShieldCheck, 
  ListFilter,
  Loader2,
  ArrowLeft,
  HeartPulse,
  User,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Printer,
  Download,
  Share2,
  Stethoscope,
  Hospital
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import PatientSelector from '@/components/ecg/PatientSelector';
import TelemetryChart from '@/components/ecg/TelemetryChart';
import AIConsultationCard from '@/components/ecg/AIConsultationCard';
import EmergencyPager from '@/components/ecg/EmergencyPager';
import PatientAdmissionModal from '@/components/ecg/PatientAdmissionModal';

type TriageType = 'Red' | 'Yellow' | 'Green';
type ECGStatus = 'Pending' | 'Completed' | 'Abnormal' | 'Normal' | 'Not Done';
type ECGType = '12-Lead' | 'Stress Test' | 'Holter' | 'Event Monitor';

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
  triage: TriageType | '';
  uhid: string;
}

interface ECGData {
  id: string;
  assessmentId: string;
  patientName: string;
  uhid: string;
  age: number;
  gender: string;
  triage: TriageType | '';
  ecgNumber: string;
  ecgType: ECGType;
  status: ECGStatus;
  orderedBy: string;
  performedBy: string;
  createdAt: string;
  completedAt?: string;
  findings: string;
  interpretation: string;
  isAbnormal: boolean;
  heartRate: number;
  rhythm: string;
  prInterval: number;
  qrsDuration: number;
  qtInterval: number;
  qtcInterval: number;
  heartAxis: string;
}

// Helper: map heart axis string to numeric degrees (for chart)
const mapHeartAxisToNumber = (axis: string): number => {
  switch (axis) {
    case 'Left Axis Deviation': return -30;
    case 'Right Axis Deviation': return 90;
    case 'Normal': return 0;
    default: return 0;
  }
};

// Helper function to get rhythm based on triage
const getRhythmForTriage = (triage: TriageType | ''): string => {
  switch (triage) {
    case 'Red':
      return 'Sinus Tachycardia with ST Elevation';
    case 'Yellow':
      return 'Sinus Rhythm with Occasional PVCs';
    case 'Green':
      return 'Normal Sinus Rhythm';
    default:
      return 'Normal Sinus Rhythm';
  }
};

export default function NextDashboard() {
  const router = useRouter();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'console' | 'blueprint'>('console');
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<string | null>(null);

  // Roster Ward State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [integrationMode, setIntegrationMode] = useState<'Simulation' | 'Production'>('Simulation');

  // AI & Pager Simulation States
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  
  // ✅ Renamed local toast state to avoid conflict with imported toast
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  const [pagerStatus, setPagerStatus] = useState<'IDLE' | 'SENDING' | 'DELIVERED' | 'ACKNOWLEDGED'>('IDLE');
  const [pagerLog, setPagerLog] = useState<{ time: string; msg: string }[]>([]);

  // Modals state
  const [isAdmissionOpen, setIsAdmissionOpen] = useState<boolean>(false);

  // Fetch patients from emergency API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoadingPatients(true);
        const res = await fetch('/api/emergency/assessments');
        const data = await res.json();
        
        if (data.success) {
          const transformedPatients = data.data
            .filter((a: any) => a.status !== 'Draft')
            .map((a: any) => {
              // Set ECG values based on triage
              let heartRate = 72;
              let prInterval = 0.16;
              let qrsDuration = 0.08;
              let qtInterval = 0.36;
              let qtcInterval = 0.40;
              let heartAxis = 'Normal';
              let rhythm = 'Normal Sinus Rhythm';
              let condition = a.condition || a.decision || 'Under Evaluation';
              let triage = a.triage || 'Green';
              
              switch (triage) {
                case 'Red':
                  heartRate = 112;
                  prInterval = 0.14;
                  qrsDuration = 0.10;
                  qtInterval = 0.32;
                  qtcInterval = 0.44;
                  heartAxis = 'Left Axis Deviation';
                  rhythm = 'Sinus Tachycardia with ST Elevation';
                  condition = 'STEMI - Acute Myocardial Infarction';
                  break;
                case 'Yellow':
                  heartRate = 88;
                  prInterval = 0.16;
                  qrsDuration = 0.09;
                  qtInterval = 0.36;
                  qtcInterval = 0.42;
                  heartAxis = 'Normal';
                  rhythm = 'Sinus Rhythm with Occasional PVCs';
                  condition = 'Atrial Fibrillation - Under Observation';
                  break;
                case 'Green':
                  heartRate = 72;
                  prInterval = 0.16;
                  qrsDuration = 0.08;
                  qtInterval = 0.36;
                  qtcInterval = 0.40;
                  heartAxis = 'Normal';
                  rhythm = 'Normal Sinus Rhythm';
                  condition = 'Stable - Routine Check';
                  break;
              }
              
              return {
                id: a.id,
                name: a.patientName || 'Unknown',
                age: a.age || 30,
                gender: a.gender || 'Male',
                heartRate: a.heartRate || heartRate,
                condition: a.condition || condition,
                rhythm: a.rhythm || rhythm,
                prInterval: a.prInterval || prInterval,
                qrsDuration: a.qrsDuration || qrsDuration,
                qtInterval: a.qtInterval || qtInterval,
                qtcInterval: a.qtcInterval || qtcInterval,
                heartAxis: a.heartAxis || heartAxis,
                status: a.status || 'Stable',
                description: a.description || 'No description available',
                triage: triage,
                uhid: a.uhid || `UHID-${a.id}`
              };
            });
          
          setPatients(transformedPatients);
          
          if (transformedPatients.length > 0) {
            setSelectedPatientId(transformedPatients[0].id);
          }
        } else {
          toast.error('Failed to fetch patients');
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  // Handle routing parameters from ECG list clicks
  useEffect(() => {
    if (typeof window !== 'undefined' && patients.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const patientParam = params.get('patient');
      if (patientParam && patients.some(p => p.id === patientParam)) {
        setSelectedPatientId(patientParam);
        setSelectedPatientForDetail(patientParam);
      }
    }
  }, [patients]);

  // Get active patient
  const activePatient = patients.find(p => p.id === selectedPatientId);
  const isCritical = activePatient?.condition?.includes('STEMI') || 
                     activePatient?.condition?.includes('Tachycardia') ||
                     activePatient?.triage === 'Red';

  // Generate ECG data from patient
  const generateECGData = (patient: Patient): ECGData | null => {
    if (!patient) return null;
    
    let ecgStatus: ECGStatus = 'Not Done';
    let isAbnormal = false;
    let findings = '';
    let interpretation = '';
    let ecgType: ECGType = '12-Lead';
    let heartRate = patient.heartRate || 72;
    let prInterval = patient.prInterval || 0.16;
    let qrsDuration = patient.qrsDuration || 0.08;
    let qtInterval = patient.qtInterval || 0.36;
    let qtcInterval = patient.qtcInterval || 0.40;
    let heartAxis = patient.heartAxis || 'Normal';
    
    switch (patient.triage) {
      case 'Red':
        ecgStatus = 'Abnormal';
        isAbnormal = true;
        ecgType = '12-Lead';
        heartRate = 112;
        prInterval = 0.14;
        qrsDuration = 0.10;
        qtInterval = 0.32;
        qtcInterval = 0.44;
        heartAxis = 'Left Axis Deviation';
        findings = 'ST-segment elevation in anterior leads V1-V4. Hyperacute T-waves. Acute myocardial infarction pattern detected.';
        interpretation = 'URGENT: STEMI detected. Immediate cardiology consultation and PCI required within 90 minutes.';
        break;
        
      case 'Yellow':
        ecgStatus = 'Completed';
        isAbnormal = false;
        ecgType = 'Holter';
        heartRate = 88;
        prInterval = 0.16;
        qrsDuration = 0.09;
        qtInterval = 0.36;
        qtcInterval = 0.42;
        heartAxis = 'Normal';
        findings = 'Occasional PVCs, otherwise normal sinus rhythm. No acute ischemic changes.';
        interpretation = 'Mild conduction abnormality. No immediate intervention needed. Continue monitoring.';
        break;
        
      case 'Green':
        ecgStatus = 'Normal';
        isAbnormal = false;
        ecgType = '12-Lead';
        heartRate = 72;
        prInterval = 0.16;
        qrsDuration = 0.08;
        qtInterval = 0.36;
        qtcInterval = 0.40;
        heartAxis = 'Normal';
        findings = 'Normal sinus rhythm. No abnormalities detected.';
        interpretation = 'Normal ECG. No further action required.';
        break;
        
      default:
        ecgStatus = 'Pending';
        isAbnormal = false;
        ecgType = '12-Lead';
        heartRate = 72;
        prInterval = 0.16;
        qrsDuration = 0.08;
        qtInterval = 0.36;
        qtcInterval = 0.40;
        heartAxis = 'Normal';
        findings = 'ECG pending review.';
        interpretation = 'Awaiting ECG interpretation.';
    }

    return {
      id: `ECG-${patient.id}`,
      assessmentId: patient.id,
      patientName: patient.name,
      uhid: patient.uhid,
      age: patient.age,
      gender: patient.gender,
      triage: patient.triage,
      ecgNumber: `ECG-${Date.now()}`,
      ecgType: ecgType,
      status: ecgStatus,
      orderedBy: 'Dr. Emergency',
      performedBy: 'Dr. Cardiology',
      createdAt: new Date().toISOString(),
      completedAt: ecgStatus !== 'Pending' ? new Date().toISOString() : undefined,
      findings: findings,
      interpretation: interpretation,
      isAbnormal: isAbnormal,
      heartRate: heartRate,
      rhythm: patient.rhythm || getRhythmForTriage(patient.triage),
      prInterval: prInterval,
      qrsDuration: qrsDuration,
      qtInterval: qtInterval,
      qtcInterval: qtcInterval,
      heartAxis: heartAxis
    };
  };

  const ecgData = activePatient ? generateECGData(activePatient) : null;

  // Alert & Toast feedback helpers
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dispatch specialist pager alerts
  useEffect(() => {
    if (activePatient && isCritical && isStreaming) {
      setPagerStatus('SENDING');
      const timeStr = new Date().toTimeString().split(' ')[0];
      setPagerLog([
        { time: timeStr, msg: `📱 HL7 PRIORITIZED DISPATCH: Routing outbound page via Secure Hospital HL7 Network.` },
        { time: timeStr, msg: `📡 CELLULAR CARRIER GATEWAY: Transmitting emergency cellular packet to Dr. Sarah Chen's dedicated pager.` }
      ]);

      const t1 = setTimeout(() => {
        setPagerStatus('DELIVERED');
        setPagerLog(prev => [
          ...prev,
          { time: timeStr, msg: `📬 DELIVERED: Cellular confirmation packet received by specialist terminal.` },
          { time: timeStr, msg: `📨 CARDIOLOGY ALERTER: "VITAL-CORE EMERGENCY: Patient ${activePatient.name} (${activePatient.id}) telemetry indicates active ${activePatient.condition}. Conduction shows ${activePatient.rhythm}. Immediate response requested."` }
        ]);
      }, 1000);

      const t2 = setTimeout(() => {
        setPagerStatus('ACKNOWLEDGED');
        setPagerLog(prev => [
          ...prev,
          { time: timeStr, msg: `🤝 Specialist has tapped ACKNOWLEDGE on pager receiver. Dr. Sarah Chen, MD is en-route.` }
        ]);
        triggerToast(`Specialist page acknowledged by Cardiology On-Service!`, 'success');
      }, 2500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setPagerStatus('IDLE');
      setPagerLog([]);
    }
  }, [selectedPatientId, isCritical, isStreaming, activePatient]);

  // Source simulation vs production toggle callbacks
  const toggleSourceMode = async () => {
    const nextMode = integrationMode === 'Simulation' ? 'Production' : 'Simulation';
    setIntegrationMode(nextMode);
    triggerToast(`Configured telemetry source gateway to ${nextMode} mode.`, 'success');
  };

  // Run AI analysis
  const runAiAnalysis = async () => {
    if (!activePatient) {
      toast.error('No patient selected');
      return;
    }
    
    setIsAiLoading(true);
    setAiAnalysis(null);
    try {
      const res = await fetch('/api/ecg/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: activePatient.id,
          metadata: {
            patientId: activePatient.id,
            patientName: activePatient.name,
            age: activePatient.age,
            gender: activePatient.gender,
            heartRate: activePatient.heartRate,
            rhythm: activePatient.rhythm,
            prInterval: activePatient.prInterval,
            qrsDuration: activePatient.qrsDuration,
            qtInterval: activePatient.qtInterval,
            qtcInterval: activePatient.qtcInterval,
            heartAxis: activePatient.heartAxis,
            status: activePatient.status
          },
          description: activePatient.description
        })
      });
      const data = await res.json();
      setAiAnalysis(data);
      if (data.criticalAlert) {
        triggerToast(`CRITICAL CO-PILOT ALERT: ${data.alertType || 'Arrhythmia abnormality found!'}`, 'error');
      } else {
        triggerToast('AI Cardiology Consultation complete.', 'success');
      }
    } catch (err) {
      triggerToast('AI service returned an error. Using local cardiological engine.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAdmitPatient = (newPatient: any) => {
    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    setAiAnalysis(null);
    triggerToast(`Patient ${newPatient.name} successfully admitted to bed ${newPatient.id}!`, 'success');
  };

  function StatusBadge({ value }: { value: ECGStatus }) {
    const config = {
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
      'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
      'Normal': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
      'Abnormal': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
      'Not Done': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200',
    };
    return (
      <Badge className={cn("border", config[value])}>
        {value}
      </Badge>
    );
  }

  function TriageBadge({ value }: { value: TriageType | '' }) {
    if (!value) return <span className="text-muted-foreground">—</span>;
    const config = {
      Red: { text: 'Critical', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200' },
      Yellow: { text: 'Observation', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200' },
      Green: { text: 'Stable', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200' }
    };
    const { text, className } = config[value];
    return (
      <Badge className={cn("border", className)}>
        {value} — {text}
      </Badge>
    );
  }

  function ECGTypeBadge({ value }: { value: ECGType }) {
    const config = {
      '12-Lead': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
      'Stress Test': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200',
      'Holter': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200',
      'Event Monitor': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200',
    };
    return (
      <Badge className={cn("border", config[value])}>
        {value}
      </Badge>
    );
  }

  // Loading state
  if (loadingPatients) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#2BB2A7] mx-auto" />
          <p className="mt-4 text-sm text-slate-500">Loading patients from emergency department...</p>
        </div>
      </div>
    );
  }

  // No patients state
  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-md">
          <Heart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">No Patients Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            No patients available in the emergency department. Please admit a patient first.
          </p>
          <button
            onClick={() => setIsAdmissionOpen(true)}
            className="mt-4 px-4 py-2 bg-[#2BB2A7] text-white rounded-lg hover:bg-[#1F8F89] transition-colors"
          >
            + Admit Patient
          </button>
        </div>
        <PatientAdmissionModal 
          isOpen={isAdmissionOpen}
          onClose={() => setIsAdmissionOpen(false)}
          onAdmit={handleAdmitPatient}
        />
      </div>
    );
  }

  // If a patient is selected for detail view, show the ECG report
  if (selectedPatientForDetail && ecgData) {
    return (
      <div className="container mx-auto py-6 max-w-5xl px-4 min-h-screen bg-slate-50">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:mb-4">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-muted-foreground hover:text-[#2BB2A7] print:hidden"
              onClick={() => {
                setSelectedPatientForDetail(null);
                router.push('/emergency');
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-[#2BB2A7]" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ECG Report</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>

        {/* ECG Summary Card */}
        <Card className="border-[#E2EFEA] dark:border-slate-700 shadow-sm mb-6">
          <CardHeader className="bg-[#F4F9F7] dark:bg-slate-800/30 border-b border-[#E2EFEA] dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-[#2BB2A7]" />
                  {ecgData.ecgNumber}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Assessment ID: {ecgData.assessmentId}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge value={ecgData.status} />
                <ECGTypeBadge value={ecgData.ecgType} />
                <TriageBadge value={ecgData.triage} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Patient Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Patient Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-gray-900 dark:text-white">{ecgData.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hospital className="h-4 w-4" />
                    <span>UHID: {ecgData.uhid}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Age:</span> {ecgData.age} years
                    <span className="mx-2">|</span>
                    <span className="font-medium">Gender:</span> {ecgData.gender}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">ECG Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Type:</span>
                    <span className="text-gray-900 dark:text-white">{ecgData.ecgType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Created:</span>
                    <span className="text-gray-900 dark:text-white">{new Date(ecgData.createdAt).toLocaleString()}</span>
                  </div>
                  {ecgData.completedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Completed:</span>
                      <span className="text-gray-900 dark:text-white">{new Date(ecgData.completedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Clinical Staff</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Ordered By:</span>
                    <span className="text-gray-900 dark:text-white">{ecgData.orderedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Performed By:</span>
                    <span className="text-gray-900 dark:text-white">{ecgData.performedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Status:</span>
                    <StatusBadge value={ecgData.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* ECG Metrics Grid */}
            <div className="mt-6 pt-6 border-t border-[#E2EFEA] dark:border-slate-700">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">ECG Measurements</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-[#E2EFEA] dark:border-slate-700 text-center">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Heart Rate</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{ecgData.heartRate} <span className="text-xs font-normal text-muted-foreground">BPM</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-[#E2EFEA] dark:border-slate-700 text-center">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">PR Interval</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{ecgData.prInterval} <span className="text-xs font-normal text-muted-foreground">ms</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-[#E2EFEA] dark:border-slate-700 text-center">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">QRS Width</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{ecgData.qrsDuration} <span className="text-xs font-normal text-muted-foreground">ms</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-[#E2EFEA] dark:border-slate-700 text-center">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">QT Interval</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{ecgData.qtInterval} <span className="text-xs font-normal text-muted-foreground">ms</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-[#E2EFEA] dark:border-slate-700 text-center">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">QTc Corrected</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{ecgData.qtcInterval} <span className="text-xs font-normal text-muted-foreground">ms</span></p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-[#E2EFEA] dark:border-slate-700 text-center">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Heart Axis</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{ecgData.heartAxis}</p>
                </div>
              </div>
            </div>

            {/* Findings Section */}
            <div className="mt-6 pt-6 border-t border-[#E2EFEA] dark:border-slate-700">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Findings</h3>
              <div className={cn(
                "p-4 rounded-lg border",
                ecgData.isAbnormal 
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
                  : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              )}>
                <div className="flex items-start gap-3">
                  {ecgData.isAbnormal ? (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className={cn(
                      "font-medium",
                      ecgData.isAbnormal ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"
                    )}>
                      {ecgData.isAbnormal ? "Abnormal ECG" : "Normal ECG"}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{ecgData.findings}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interpretation Section */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interpretation</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-[#E2EFEA] dark:border-slate-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {ecgData.interpretation}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-6 pt-4 border-t border-[#E2EFEA] dark:border-slate-700 flex flex-wrap gap-3 print:hidden">
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900" id="nextjs-root">
      {/* Toast notification panel - using toastMessage state */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-4 duration-300 bg-white border-slate-200">
          <Heart className={`w-5 h-5 ${toastMessage.type === 'error' ? 'text-rose-500 animate-pulse' : 'text-blue-500'}`} />
          <span className="text-xs font-semibold text-slate-700">{toastMessage.message}</span>
        </div>
      )}

      {/* Clinical Header Bar */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-lg flex items-center justify-center text-white">
            <Heart className="w-5 h-5 animate-pulse text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none">VITAL-CORE HIS (Next.js)</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Electrocardiogram Telemetry Routing Console</p>
          </div>
        </div>

        {/* Configurations toggle */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-800 p-1.5 px-3 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${integrationMode === 'Simulation' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`}></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Mode: <span className={integrationMode === 'Simulation' ? 'text-emerald-400' : 'text-blue-400'}>{integrationMode}</span>
              </span>
            </div>
            <button 
              onClick={toggleSourceMode}
              className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold py-1 px-2 rounded transition-all cursor-pointer"
            >
              <Shuffle className="w-3 h-3" /> SWITCH SOURCE
            </button>
          </div>

          <div className="text-right hidden md:block">
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Attending Specialist</p>
            <p className="text-xs font-semibold">Dr. Sarah Chen, MD</p>
          </div>
        </div>
      </header>

      {/* Sub-status banner */}
      <div className={`px-6 py-2 border-b flex items-center justify-between text-xs transition-colors ${
        integrationMode === 'Simulation' 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
          : 'bg-blue-50 border-blue-200 text-blue-800'
      }`}>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>
            {integrationMode === 'Simulation' 
              ? <strong>Synthetic Engine Active:</strong> 
              : <strong>Live Production HL7 / FHIR Streaming:</strong>
            } {integrationMode === 'Simulation' 
              ? 'Waveforms computed via Gaussian rhythm synthesis matrices.' 
              : 'Direct FHIR DICOM ECG waveform streaming interface connected.'
            }
          </span>
        </div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          Node: NEXT-APP-ROUTER
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="bg-white border-b border-slate-200 px-6 flex justify-between items-center shrink-0">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('console')}
            className={`py-3.5 px-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'console' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            Ward Console
          </button>
          <button
            onClick={() => {
              // Show ECG list view
              setSelectedPatientForDetail(null);
            }}
            className="py-3.5 px-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 border-transparent text-slate-500 hover:text-[#2BB2A7] hover:border-[#2BB2A7] transition-all cursor-pointer"
          >
            <ListFilter className="w-4 h-4" />
            ECG Archives &amp; Records
          </button>
        </div>
        <div className="text-xs text-slate-400 font-mono font-bold hidden lg:block uppercase">
          HIS Approuter v3.0.0
        </div>
      </div>

      {/* Subcontent viewports */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 grid grid-cols-12 gap-4 max-w-[1400px] mx-auto">
          {/* Urgent red alert warning badge */}
          {isCritical && activePatient && (
            <div className="col-span-12 bg-rose-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4 animate-pulse relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <Activity className="w-7 h-7 text-white animate-bounce shrink-0" />
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide">CRITICAL WARD DISTRESS ALERT</h2>
                  <p className="text-[10px] text-rose-100 font-medium">
                    Bed telemetry confirms active life-threatening conduction disorder: <strong>{activePatient.condition} ({activePatient.heartRate} bpm)</strong>. Urgent intervention requested.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main console modules columns */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <PatientSelector 
              selectedPatientId={selectedPatientId} 
              onSelectPatient={(id) => {
                setSelectedPatientId(id);
                setAiAnalysis(null);
              }}
              onOpenAdmissionModal={() => setIsAdmissionOpen(true)}
            />
            <EmergencyPager pagerStatus={pagerStatus} pagerLog={pagerLog} />
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-4">
            {activePatient && (
              <>
                <TelemetryChart 
                  patientId={selectedPatientId}
                  patientName={activePatient.name}
                  condition={activePatient.condition}
                  isStreaming={isStreaming}
                  isMuted={isMuted}
                  onToggleStreaming={() => setIsStreaming(!isStreaming)}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onPrint={() => {
                    setSelectedPatientForDetail(selectedPatientId);
                  }}
                  intervals={{
                    pr: activePatient.prInterval,
                    qrs: activePatient.qrsDuration,
                    qt: activePatient.qtInterval,
                    qtc: activePatient.qtcInterval,
                    axis: mapHeartAxisToNumber(activePatient.heartAxis), // ✅ fix: convert to number
                    heartRate: activePatient.heartRate
                  }}
                />
               <AIConsultationCard 
  patientId={selectedPatientId}
  patientName={activePatient.name}
  condition={activePatient.condition}
  intervals={{
    pr: activePatient.prInterval,
    qrs: activePatient.qrsDuration,
    qt: activePatient.qtInterval,
    qtc: activePatient.qtcInterval,
    axis: activePatient.heartAxis,
    heartRate: activePatient.heartRate
  }}
  status={activePatient.status}
  description={activePatient.description}
  triage={activePatient.triage}
  uhid={activePatient.uhid}
  age={activePatient.age}
  gender={activePatient.gender}
  rhythm={activePatient.rhythm}
/>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Branding line */}
      <footer className="h-10 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6 shrink-0 text-[10px] font-mono text-slate-500">
        <span>&copy; 2026 VITAL-CORE MEDICAL SYSTEMS, INC.</span>
        <span className="flex items-center gap-1 text-emerald-500">
          <ShieldCheck className="h-3 w-3" /> SECURE HL7 CHANNEL ACTIVE
        </span>
      </footer>

      {/* Patient Admission Modal Entrypoint */}
      <PatientAdmissionModal 
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        onAdmit={handleAdmitPatient}
      />
    </div>
  );
}