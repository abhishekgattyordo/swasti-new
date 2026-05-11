'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Hospital, 
  Save 
} from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Custom Components
import { Field, SectionCard } from '@/components/ui/SectionCard';
import { TriageBadge } from '@/components/ui/TriageBadge';

// Types
import { cn } from '@/lib/utils';

type TriageType = 'Red' | 'Yellow' | 'Green';
type GenderType = 'Male' | 'Female' | 'Other';
type DecisionType = 'Admit' | 'Observe' | 'Discharge Home' | 'Transfer';
type LabStatus = 'Pending' | 'Available' | 'Not Ordered' | 'Not Indicated';
type AssessmentStatus = 'Draft' | 'Completed' | 'Converted to Admission';

interface Lab {
  name: string;
  status: LabStatus;
}

interface Assessment {
  id: string;
  status: AssessmentStatus;
  linkedAdmissionId?: string;
  completedAt?: string;
  
  // Patient Info
  uhid: string;
  patientName: string;
  age: number | '';
  gender: GenderType | '';
  arrivalAt: string;
  
  // Triage & Vitals
  triage: TriageType | '';
  systolic: number | '';
  diastolic: number | '';
  heartRate: number | '';
  respiratoryRate: number | '';
  temperature: number | '';
  tempUnit: 'C' | 'F';
  spo2: number | '';
  painScore: number;
  gcs: number | '';
  
  // Point-of-Care
  rbs: number | '';
  upt?: 'Positive' | 'Negative' | 'Not Done';
  ecgDone: 'Yes' | 'No' | '';
  ecgReportAttached: boolean;
  cxrDone: 'Yes' | 'No' | '';
  cxrReportAttached: boolean;
  usgDone: 'Yes' | 'No' | '';
  usgFindings: string;
  
  // Lab Orders
  labs: Lab[];
  
  // Doctor Assessment
  chiefComplaints: string;
  complaintDuration: string;
  pastHistory: string;
  provisionalDiagnosis: string;
  examFindings: string;
  intervention: string;
  
  // Disposition
  decision: DecisionType | '';
  mainDoctor: string;
  referral: string;
  dutyDoctorName: string;
}


const SPECIALTIES = ['None', 'Medicine', 'Surgery', 'Pediatrics', 'Orthopedics', 'Cardiology'];

function generateAssessmentId(): string {
  const today = new Date();
  const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `EMERG-${yyyymmdd}-${random}`;
}

async function fetchAssessmentById(id: string): Promise<Assessment | null> {
  const res = await fetch(`/api/emergency/assessments?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch assessment');
  }
  const json = await res.json();
  return json.success ? json.data : null;
}

async function createAssessment(data: Assessment): Promise<void> {
  const res = await fetch('/api/emergency/assessments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create assessment');
  }
}

async function updateAssessment(id: string, data: Assessment): Promise<void> {
  const res = await fetch(`/api/emergency/assessments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update assessment');
  }
}

type Errors = Partial<Record<keyof Assessment, string>>;
type SectionId = "A" | "B" | "C" | "D" | "E" | "F";

const SECTIONS: { id: SectionId; label: string; short: string }[] = [
  { id: "A", label: "Patient Info", short: "A" },
  { id: "B", label: "Triage & Vitals", short: "B" },
  { id: "C", label: "Point-of-Care", short: "C" },
  { id: "D", label: "Lab Orders", short: "D" },
  { id: "E", label: "Doctor Assessment", short: "E" },
  { id: "F", label: "Disposition", short: "F" },
];

export default function AssessmentFormPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const isEditing = !!id;
  
  const [assessment, setAssessment] = useState<Assessment>(() => {
    return {
      id: generateAssessmentId(),
      status: 'Draft',
      uhid: '',
      patientName: '',
      age: '',
      gender: '',
      arrivalAt: new Date().toISOString(),
      triage: '',
      systolic: '',
      diastolic: '',
      heartRate: '',
      respiratoryRate: '',
      temperature: '',
      tempUnit: 'C',
      spo2: '',
      painScore: 0,
      gcs: '',
      rbs: '',
      ecgDone: '',
      ecgReportAttached: false,
      cxrDone: '',
      cxrReportAttached: false,
      usgDone: '',
      usgFindings: '',
      labs: [
        { name: 'CBC', status: 'Not Ordered' },
        { name: 'RFT', status: 'Not Ordered' },
        { name: 'LFT', status: 'Not Ordered' },
        { name: 'Electrolytes', status: 'Not Ordered' },
        { name: 'Troponin', status: 'Not Ordered' },
        { name: 'ABG', status: 'Not Ordered' },
      ],
      chiefComplaints: '',
      complaintDuration: '',
      pastHistory: '',
      provisionalDiagnosis: '',
      examFindings: '',
      intervention: '',
      decision: '',
      mainDoctor: '',
      referral: 'None',
      dutyDoctorName: '',
    };
  });
  const [errors, setErrors] = useState<Errors>({});
  const [convertOpen, setConvertOpen] = useState(false);
  const [admissionId, setAdmissionId] = useState("");
  const [activeTab, setActiveTab] = useState<SectionId>("A");
  const [done, setDone] = useState<Record<SectionId, boolean>>({ 
    A: false, B: false, C: false, D: false, E: false, F: false 
  });
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<{ id: number; firstName: string; lastName: string; department?: string }[]>([]);
const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const formRef = useRef<HTMLFormElement>(null);


 useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors');   // ✅ corrected endpoint
      const data = await res.json();
      const doctorsList = data.data || data;
      setDoctors(Array.isArray(doctorsList) ? doctorsList : []);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      toast.error('Could not load doctors list');
    } finally {
      setLoadingDoctors(false);
    }
  };
  fetchDoctors();
}, []);

  useEffect(() => {
    if (id) {
      fetchAssessmentById(id)
        .then(data => {
          if (data) {
            setAssessment(data);
          } else {
            toast.error('Assessment not found');
            router.push('/emergency/assessments');
          }
        })
        .catch(err => {
          console.error(err);
          toast.error('Failed to load assessment');
          router.push('/emergency/assessments');
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, router]);

  const showUPT = assessment.gender === "Female" && 
    typeof assessment.age === "number" && 
    assessment.age >= 15 && 
    assessment.age <= 50;

  function update<K extends keyof Assessment>(k: K, v: Assessment[K]) {
    setAssessment((prev) => ({ ...prev, [k]: v }));
  }

  // ============================================
  // UPDATED VALIDATION FUNCTION
  // ============================================
  function validate(complete: boolean): Errors {
    const e: Errors = {};
    
    // Always required (for both draft and complete)
    if (!assessment.uhid?.trim()) e.uhid = "Required";
    if (!assessment.patientName?.trim()) e.patientName = "Required";
    
    // Age and gender are required only when completing the assessment
    if (complete) {
      if (assessment.age === "" || Number(assessment.age) <= 0) e.age = "Enter a valid age";
      if (!assessment.gender) e.gender = "Required";
    } else {
      // For draft, if age is provided, validate it; otherwise ignore
      if (assessment.age !== "" && Number(assessment.age) <= 0) e.age = "Enter a valid age";
      // Gender is optional for draft – no validation
    }
    
    // Fields always validated if present (for both modes)
    if (assessment.spo2 !== "" && (Number(assessment.spo2) < 0 || Number(assessment.spo2) > 100)) {
      e.spo2 = "0–100 only";
    }
    if (assessment.gcs !== "" && (Number(assessment.gcs) < 3 || Number(assessment.gcs) > 15)) {
      e.gcs = "3–15 only";
    }
    
    // Additional required fields for completion
    if (complete) {
      if (!assessment.triage) e.triage = "Triage is required";
      if (assessment.systolic === "" || assessment.diastolic === "") e.systolic = "BP required";
      if (assessment.heartRate === "") e.heartRate = "Required";
      if (assessment.respiratoryRate === "") e.respiratoryRate = "Required";
      if (assessment.temperature === "") e.temperature = "Required";
      if (assessment.spo2 === "") e.spo2 = "Required";
      if (!assessment.chiefComplaints?.trim()) e.chiefComplaints = "Required";
      if (!assessment.dutyDoctorName?.trim()) e.dutyDoctorName = "Required";
    }
    
    return e;
  }

  function scrollToFirstError() {
    setTimeout(() => {
      const el = formRef.current?.querySelector("[data-invalid='true']") as HTMLElement | null;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  async function handleSaveDraft() {
    const e = validate(false);
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields");
      scrollToFirstError();
      return;
    }
    
    setLoading(true);
    try {
      const dataToSave = { ...assessment, status: 'Draft' as const };
      if (isEditing) {
        await updateAssessment(assessment.id, dataToSave);
      } else {
        await createAssessment(dataToSave);
      }
      toast.success("Draft saved successfully");
      router.push("/emergency/assessments");
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    const e = validate(true);
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please complete all mandatory fields");
      scrollToFirstError();
      return;
    }
    
    setLoading(true);
    try {
      const dataToSave = { 
        ...assessment, 
        status: 'Completed' as const,
        completedAt: assessment.completedAt || new Date().toISOString()
      };
      if (isEditing) {
        await updateAssessment(assessment.id, dataToSave);
      } else {
        await createAssessment(dataToSave);
      }
      toast.success("Assessment completed successfully");
      router.push(`/emergency/assessments/${assessment.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to complete assessment");
    } finally {
      setLoading(false);
    }
  }

  async function handleConvert() {
    if (!admissionId.trim()) {
      toast.error("Please enter an admission ID");
      return;
    }
    
    setLoading(true);
    try {
      const dataToSave = { 
        ...assessment, 
        status: 'Converted to Admission' as const,
        linkedAdmissionId: admissionId.trim(),
        completedAt: assessment.completedAt || new Date().toISOString()
      };
      if (isEditing) {
        await updateAssessment(assessment.id, dataToSave);
      } else {
        await createAssessment(dataToSave);
      }
      setConvertOpen(false);
      toast.success(`Converted to admission ${admissionId}`);
      router.push(`/emergency/assessments/${assessment.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to convert assessment");
    } finally {
      setLoading(false);
    }
  }

  const triageBg = useMemo(() => {
    if (assessment.triage === "Red") return "bg-red-50 dark:bg-red-950/20 border-red-200";
    if (assessment.triage === "Yellow") return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200";
    if (assessment.triage === "Green") return "bg-green-50 dark:bg-green-950/20 border-green-200";
    return "";
  }, [assessment.triage]);

  function validateSection(s: SectionId): string | null {
    if (s === "A") {
      if (!assessment.uhid?.trim() || !assessment.patientName?.trim()) {
        return "UHID and Patient Name are required";
      }
      // Age and gender not required for section completion when drafting
    }
    if (s === "B") {
      if (!assessment.triage || assessment.systolic === "" || assessment.diastolic === "" || 
          assessment.heartRate === "" || assessment.respiratoryRate === "" || 
          assessment.temperature === "" || assessment.spo2 === "") {
        return "Triage and all vitals are required";
      }
    }
    if (s === "E") {
      if (!assessment.chiefComplaints?.trim()) return "Chief complaints required";
    }
    if (s === "F") {
      if (!assessment.dutyDoctorName?.trim()) return "Duty doctor name required";
    }
    return null;
  }

  function markSectionComplete(s: SectionId) {
    const err = validateSection(s);
    if (err) {
      toast.error(err);
      return;
    }
    setDone((d) => ({ ...d, [s]: true }));
    const idx = SECTIONS.findIndex((x) => x.id === s);
    toast.success(`${SECTIONS[idx].label} marked complete`);
    if (idx < SECTIONS.length - 1) setActiveTab(SECTIONS[idx + 1].id);
  }

  const currentIdx = SECTIONS.findIndex((s) => s.id === activeTab);
  const goPrev = () => currentIdx > 0 && setActiveTab(SECTIONS[currentIdx - 1].id);
  const goNext = () => currentIdx < SECTIONS.length - 1 && setActiveTab(SECTIONS[currentIdx + 1].id);

  function toLocalInput(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  if (initialLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-xs font-mono text-muted-foreground">{assessment.id}</p>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? "Edit" : "New"} Emergency Assessment
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button variant="outline" onClick={() => setConvertOpen(true)} disabled={loading}>
            <Hospital className="h-4 w-4 mr-2" /> Convert to Admission
          </Button>
          <Button onClick={handleComplete} disabled={loading}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> Complete
          </Button>
        </div>
      </div>

      {/* Form */}
      <form ref={formRef} className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SectionId)} className="space-y-5">
          {/* Tabs Navigation */}
          <div className="overflow-x-auto">
            <TabsList className="h-auto w-full justify-start gap-1 bg-muted/50 p-1 rounded-lg">
              {SECTIONS.map((s) => (
                <TabsTrigger
                  key={s.id}
                  value={s.id}
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                    done[s.id] 
                      ? "bg-green-500 text-white" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {done[s.id] ? <Check className="h-3 w-3" /> : s.short}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Section A: Patient Information */}
          <TabsContent value="A" className="m-0">
            <SectionCard badge="Section A" title="Patient Information" description="Primary identification details">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Field label="UHID / MRN" required error={errors.uhid}>
                  <Input 
                    data-invalid={!!errors.uhid} 
                    className={cn(errors.uhid && "border-red-500")} 
                    value={assessment.uhid || ''} 
                    onChange={(e) => update("uhid", e.target.value)} 
                    placeholder="e.g. UH-23489" 
                  />
                </Field>
                <Field label="Patient Name" required error={errors.patientName}>
                  <Input 
                    data-invalid={!!errors.patientName} 
                    className={cn(errors.patientName && "border-red-500")} 
                    value={assessment.patientName || ''} 
                    onChange={(e) => update("patientName", e.target.value)} 
                  />
                </Field>
                {/* Age field - not required for draft (error only if invalid number) */}
                <Field label="Age" required={false} error={errors.age}>
                  <Input 
                    type="number" 
                    min={0} 
                    data-invalid={!!errors.age} 
                    className={cn(errors.age && "border-red-500")} 
                    value={assessment.age} 
                    onChange={(e) => update("age", e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))} 
                  />
                </Field>
                {/* Gender field - not required for draft */}
                <Field label="Gender" required={false} error={errors.gender}>
                  <Select 
                    value={assessment.gender || undefined} 
                    onValueChange={(v) => update("gender", v as Assessment["gender"])}
                  >
                    <SelectTrigger 
                      data-invalid={!!errors.gender} 
                      className={cn(errors.gender && "border-red-500")}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Arrival Date & Time" className="md:col-span-2 lg:col-span-1">
                  <Input
                    type="datetime-local"
                    value={toLocalInput(assessment.arrivalAt || new Date().toISOString())}
                    onChange={(e) => update("arrivalAt", new Date(e.target.value).toISOString())}
                  />
                </Field>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Rest of the sections are unchanged – they work as before */}
          {/* Section B: Triage & Vital Signs */}
          <TabsContent value="B" className="m-0">
            <SectionCard 
              badge="Section B" 
              title="Triage & Vital Signs" 
              description="Clinical condition and bedside vitals" 
              className={cn("transition-colors", triageBg)}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Field label="Triage Category" required error={errors.triage}>
                  <Select 
                    value={assessment.triage || undefined} 
                    onValueChange={(v) => update("triage", v as Assessment["triage"])}
                  >
                    <SelectTrigger 
                      data-invalid={!!errors.triage} 
                      className={cn(errors.triage && "border-red-500")}
                    >
                      <SelectValue placeholder="Select triage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Red">Red — Critical</SelectItem>
                      <SelectItem value="Yellow">Yellow — Observation</SelectItem>
                      <SelectItem value="Green">Green — Stable</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2">
                    <TriageBadge value={assessment.triage} />
                  </div>
                </Field>
                <Field label="Blood Pressure (mmHg)" required error={errors.systolic}>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      placeholder="Systolic" 
                      value={assessment.systolic} 
                      onChange={(e) => update("systolic", e.target.value === "" ? "" : Number(e.target.value))} 
                      data-invalid={!!errors.systolic} 
                      className={cn(errors.systolic && "border-red-500")} 
                    />
                    <span className="text-muted-foreground">/</span>
                    <Input 
                      type="number" 
                      placeholder="Diastolic" 
                      value={assessment.diastolic} 
                      onChange={(e) => update("diastolic", e.target.value === "" ? "" : Number(e.target.value))} 
                    />
                  </div>
                </Field>
                <Field label="Heart Rate" required error={errors.heartRate}>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={assessment.heartRate} 
                      onChange={(e) => update("heartRate", e.target.value === "" ? "" : Number(e.target.value))} 
                      data-invalid={!!errors.heartRate} 
                      className={cn(errors.heartRate && "border-red-500")} 
                    />
                    <span className="text-sm text-muted-foreground">bpm</span>
                  </div>
                </Field>
                <Field label="Respiratory Rate" required error={errors.respiratoryRate}>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={assessment.respiratoryRate} 
                      onChange={(e) => update("respiratoryRate", e.target.value === "" ? "" : Number(e.target.value))} 
                      data-invalid={!!errors.respiratoryRate} 
                      className={cn(errors.respiratoryRate && "border-red-500")} 
                    />
                    <span className="text-sm text-muted-foreground">/min</span>
                  </div>
                </Field>
                <Field label="Temperature" required error={errors.temperature}>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={assessment.temperature} 
                      onChange={(e) => update("temperature", e.target.value === "" ? "" : Number(e.target.value))} 
                      data-invalid={!!errors.temperature} 
                      className={cn(errors.temperature && "border-red-500")} 
                    />
                    <Select value={assessment.tempUnit} onValueChange={(v) => update("tempUnit", v as "C" | "F")}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C">°C</SelectItem>
                        <SelectItem value="F">°F</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Field>
                <Field label="SpO₂" required error={errors.spo2}>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min={0} 
                      max={100} 
                      value={assessment.spo2} 
                      onChange={(e) => update("spo2", e.target.value === "" ? "" : Number(e.target.value))} 
                      data-invalid={!!errors.spo2} 
                      className={cn(errors.spo2 && "border-red-500")} 
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </Field>
                <Field label={`Pain Score: ${assessment.painScore}/10`} className="md:col-span-2">
                  <Slider 
                    value={[assessment.painScore]} 
                    onValueChange={(v) => update("painScore", v[0])} 
                    min={0} 
                    max={10} 
                    step={1} 
                  />
                </Field>
                <Field label="GCS (3–15)" hint="Optional" error={errors.gcs}>
                  <Input 
                    type="number" 
                    min={3} 
                    max={15} 
                    value={assessment.gcs} 
                    onChange={(e) => update("gcs", e.target.value === "" ? "" : Number(e.target.value))} 
                    data-invalid={!!errors.gcs} 
                    className={cn(errors.gcs && "border-red-500")} 
                  />
                </Field>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Section C: Point-of-Care Tests */}
          <TabsContent value="C" className="m-0">
            <SectionCard badge="Section C" title="Point-of-Care Tests" description="Bedside investigations">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Random Blood Sugar (mg/dL)">
                  <Input 
                    type="number" 
                    value={assessment.rbs} 
                    onChange={(e) => update("rbs", e.target.value === "" ? "" : Number(e.target.value))} 
                  />
                </Field>
                {showUPT && (
                  <Field label="Urine Pregnancy Test">
                    <Select value={assessment.upt || undefined} onValueChange={(v) => update("upt", v as Assessment["upt"])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Positive">Positive</SelectItem>
                        <SelectItem value="Negative">Negative</SelectItem>
                        <SelectItem value="Not Done">Not Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
                <YesNoBlock
                  label="ECG Done"
                  value={assessment.ecgDone}
                  onChange={(v) => update("ecgDone", v)}
                  extra={
                    assessment.ecgDone === "Yes" && (
                      <label className="mt-2 flex items-center gap-2 text-sm">
                        <Checkbox 
                          checked={assessment.ecgReportAttached} 
                          onCheckedChange={(v) => update("ecgReportAttached", !!v)} 
                        /> 
                        Report attached
                      </label>
                    )
                  }
                />
                <YesNoBlock
                  label="Chest X-ray Done"
                  value={assessment.cxrDone}
                  onChange={(v) => update("cxrDone", v)}
                  extra={
                    assessment.cxrDone === "Yes" && (
                      <label className="mt-2 flex items-center gap-2 text-sm">
                        <Checkbox 
                          checked={assessment.cxrReportAttached} 
                          onCheckedChange={(v) => update("cxrReportAttached", !!v)} 
                        /> 
                        Report attached
                      </label>
                    )
                  }
                />
                <YesNoBlock
                  label="Bedside USG Done"
                  value={assessment.usgDone}
                  onChange={(v) => update("usgDone", v)}
                  extra={
                    assessment.usgDone === "Yes" && (
                      <Textarea 
                        className="mt-2" 
                        placeholder="Findings" 
                        value={assessment.usgFindings} 
                        onChange={(e) => update("usgFindings", e.target.value)} 
                      />
                    )
                  }
                  className="md:col-span-2"
                />
              </div>
            </SectionCard>
          </TabsContent>

          {/* Section D: Lab Orders */}
          <TabsContent value="D" className="m-0">
            <SectionCard badge="Section D" title="Lab Orders" description="Emergency laboratory investigations">
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2">Lab</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.labs?.map((lab, i) => (
                      <tr key={lab.name} className="border-t">
                        <td className="px-4 py-2 font-medium">{lab.name}</td>
                        <td className="px-4 py-2">
                          <Select
                            value={lab.status}
                            onValueChange={(v) => {
                              const next = [...(assessment.labs || [])];
                              next[i] = { ...lab, status: v as LabStatus };
                              update("labs", next);
                            }}
                          >
                            <SelectTrigger className="w-56">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Available">Available</SelectItem>
                              <SelectItem value="Not Ordered">Not Ordered</SelectItem>
                              {lab.name === "Troponin" && (
                                <SelectItem value="Not Indicated">Not Indicated</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Section E: Doctor Assessment */}
          <TabsContent value="E" className="m-0">
            <SectionCard badge="Section E" title="Duty Doctor Assessment" description="Clinical findings and decisions">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Chief Complaints" required error={errors.chiefComplaints} className="md:col-span-2">
                  <Textarea 
                    data-invalid={!!errors.chiefComplaints} 
                    className={cn("min-h-24", errors.chiefComplaints && "border-red-500")} 
                    value={assessment.chiefComplaints || ''} 
                    onChange={(e) => update("chiefComplaints", e.target.value)} 
                  />
                </Field>
                <Field label="Duration of Complaints">
                  <Input 
                    value={assessment.complaintDuration || ''} 
                    onChange={(e) => update("complaintDuration", e.target.value)} 
                    placeholder="e.g. 3 days" 
                  />
                </Field>
                <Field label="Relevant Past History">
                  <Textarea 
                    className="min-h-20" 
                    value={assessment.pastHistory || ''} 
                    onChange={(e) => update("pastHistory", e.target.value)} 
                  />
                </Field>
                <Field label="Provisional Diagnosis" className="md:col-span-2">
                  <Textarea 
                    className="min-h-20" 
                    value={assessment.provisionalDiagnosis || ''} 
                    onChange={(e) => update("provisionalDiagnosis", e.target.value)} 
                  />
                </Field>
                <Field label="Clinical Examination Findings" className="md:col-span-2">
                  <Textarea 
                    className="min-h-24" 
                    value={assessment.examFindings || ''} 
                    onChange={(e) => update("examFindings", e.target.value)} 
                  />
                </Field>
                <Field label="Intervention Given in ER" className="md:col-span-2" hint="e.g. IV fluids, oxygen support, injections">
                  <Textarea 
                    className="min-h-20" 
                    value={assessment.intervention || ''} 
                    onChange={(e) => update("intervention", e.target.value)} 
                  />
                </Field>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Section F: Disposition */}
          {/* Section F: Disposition */}
<TabsContent value="F" className="m-0">
  <SectionCard badge="Section F" title="Disposition" description="Patient outcome after assessment">
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Decision">
        <Select 
          value={assessment.decision || undefined} 
          onValueChange={(v) => update("decision", v as Assessment["decision"])}
        >
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Admit">Admit</SelectItem>
            <SelectItem value="Observe">Observe</SelectItem>
            <SelectItem value="Discharge Home">Discharge Home</SelectItem>
            <SelectItem value="Transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Main Doctor Assignment">
        <Select 
          value={assessment.mainDoctor || undefined} 
          onValueChange={(v) => update("mainDoctor", v)}
          disabled={loadingDoctors}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : "Select doctor"} />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doc) => (
              <SelectItem key={doc.id} value={`Dr. ${doc.firstName} ${doc.lastName}`}>
                Dr. {doc.firstName} {doc.lastName}
              </SelectItem>
            ))}
            {!loadingDoctors && doctors.length === 0 && (
              <SelectItem value="no-doctors" disabled>No doctors found</SelectItem>
            )}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Referral to Specialty">
        <Select 
          value={assessment.referral || undefined} 
          onValueChange={(v) => update("referral", v)}
        >
          <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
          <SelectContent>
            {SPECIALTIES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Duty Doctor Name" required error={errors.dutyDoctorName}>
        <Input 
          data-invalid={!!errors.dutyDoctorName} 
          className={cn(errors.dutyDoctorName && "border-red-500")} 
          value={assessment.dutyDoctorName || ''} 
          onChange={(e) => update("dutyDoctorName", e.target.value)} 
        />
      </Field>
      {assessment.completedAt && (
        <Field label="Completed At" className="md:col-span-2">
          <Input readOnly value={new Date(assessment.completedAt).toLocaleString()} />
        </Field>
      )}
    </div>
  </SectionCard>
</TabsContent>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-3 shadow-sm">
            <Button type="button" variant="ghost" onClick={goPrev} disabled={currentIdx === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <div className="text-xs text-muted-foreground">
              Section {currentIdx + 1} of {SECTIONS.length} · {SECTIONS[currentIdx].label}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={done[activeTab] ? "secondary" : "default"}
                onClick={() => markSectionComplete(activeTab)}
              >
                <Check className="h-4 w-4 mr-2" /> 
                {done[activeTab] ? "Section complete" : "Mark section complete"}
              </Button>
              <Button type="button" variant="outline" onClick={goNext} disabled={currentIdx === SECTIONS.length - 1}>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Tabs>

        {/* Sticky Footer */}
        <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-end gap-2 rounded-xl border bg-card/90 p-3 shadow-sm backdrop-blur">
          <p className="mr-auto text-xs text-muted-foreground">
            Status: <span className="font-medium text-foreground">{assessment.status}</span>
            <span className="ml-2">· Sections done: {Object.values(done).filter(Boolean).length}/{SECTIONS.length}</span>
          </p>
          <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button variant="outline" onClick={() => setConvertOpen(true)} disabled={loading}>
            <Hospital className="h-4 w-4 mr-2" /> Convert
          </Button>
          <Button onClick={handleComplete} disabled={loading}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> Complete
          </Button>
        </div>
      </form>

      {/* Convert Dialog */}
      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Admission</DialogTitle>
            <DialogDescription>
              Enter the hospital admission ID this assessment is linked to.
            </DialogDescription>
          </DialogHeader>
          <Input 
            autoFocus 
            placeholder="e.g. ADM-2026-00451" 
            value={admissionId} 
            onChange={(e) => setAdmissionId(e.target.value)} 
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
            <Button onClick={handleConvert} disabled={loading}>
              <FileText className="h-4 w-4 mr-2" /> Convert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper Component
function YesNoBlock({
  label,
  value,
  onChange,
  extra,
  className,
}: {
  label: string;
  value: "Yes" | "No" | "";
  onChange: (v: "Yes" | "No") => void;
  extra?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <RadioGroup 
        value={value || undefined} 
        onValueChange={(v) => onChange(v as "Yes" | "No")} 
        className="flex gap-4"
      >
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="Yes" /> Yes
        </label>
        <label className="flex items-center gap-2 text-sm">
          <RadioGroupItem value="No" /> No
        </label>
      </RadioGroup>
      {extra}
    </div>
  );
}



