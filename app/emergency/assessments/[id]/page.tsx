// app/emergency/assessments/[id]/page.tsx

'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Pencil, 
  Printer, 
  Download,
  Share2,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Brain,
  Calendar,
  User,
  Stethoscope,
  FlaskConical,
  FileText,
  ClipboardList,
  Hospital,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types (updated to match API response)
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
  linkedAdmissionId?: string | null;
  completedAt?: string | null;
  
  // Patient Info
  uhid: string;
  patientName: string;
  age: number | null;
  gender: GenderType | null;
  arrivalAt: string;
  
  // Triage & Vitals
  triage: TriageType | null;
  systolic: number | null;
  diastolic: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  temperature: string | number | null;
  tempUnit: 'C' | 'F';
  spo2: number | null;
  painScore: number;
  gcs: number | null;
  
  // Point-of-Care
  rbs: number | null;
  upt?: 'Positive' | 'Negative' | 'Not Done' | null;
  ecgDone: 'Yes' | 'No' | null;
  ecgReportAttached: boolean;
  cxrDone: 'Yes' | 'No' | null;
  cxrReportAttached: boolean;
  usgDone: 'Yes' | 'No' | null;
  usgFindings: string | null;
  
  // Lab Orders
  labs: Lab[];
  
  // Doctor Assessment
  chiefComplaints: string | null;
  complaintDuration: string | null;
  pastHistory: string | null;
  provisionalDiagnosis: string | null;
  examFindings: string | null;
  intervention: string | null;
  
  // Disposition
  decision: DecisionType | null;
  mainDoctor: string | null;
  referral: string | null;
  dutyDoctorName: string | null;
}

// Fetch single assessment from API
async function fetchAssessment(id: string): Promise<Assessment | null> {
  try {
    const res = await fetch(`/api/emergency/assessments/${id}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch assessment');
    }
    const data = await res.json();
    return data && data.id ? data as Assessment : null;
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return null;
  }
}

// Badge Components
function TriageBadge({ value }: { value: TriageType | null }) {
  if (!value) return null;
  
  const config = {
    Red: { text: 'Critical', className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
    Yellow: { text: 'Observation', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
    Green: { text: 'Stable', className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' }
  };
  
  const { text, className } = config[value];
  
  return (
    <Badge variant="outline" className={cn("font-medium", className)}>
      {value} — {text}
    </Badge>
  );
}

function StatusBadge({ value }: { value: AssessmentStatus | LabStatus }) {
  const config: Record<string, string> = {
    'Draft': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    'Completed': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    'Converted to Admission': 'bg-green-500/10 text-green-700 dark:text-green-400',
    'Pending': 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    'Available': 'bg-green-500/10 text-green-700 dark:text-green-400',
    'Not Ordered': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    'Not Indicated': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  };
  
  return (
    <Badge variant="outline" className={cn("font-medium", config[value])}>
      {value}
    </Badge>
  );
}

// Info Card Component
function InfoCard({ title, icon: Icon, children, className }: { 
  title: string; 
  icon?: any; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="bg-gradient-to-r from-primary/5 to-transparent px-5 py-3 border-b">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          <h3 className="font-semibold text-sm uppercase tracking-wide text-primary">{title}</h3>
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </Card>
  );
}

// Info Row Component
function InfoRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={cn(
      "grid grid-cols-[140px_1fr] gap-3 py-2 text-sm",
      highlight && "bg-primary/5 -mx-2 px-2 rounded-md"
    )}>
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className={cn("text-foreground", !value && "text-muted-foreground italic")}>
        {value || "Not provided"}
      </span>
    </div>
  );
}

// Vital Card Component
function VitalCard({ title, value, unit, icon: Icon, color }: { 
  title: string; 
  value: string | number | null; 
  unit?: string;
  icon: any;
  color: string;
}) {
  if (!value) return null;
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      <div className={cn("p-2 rounded-full", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground uppercase font-medium">{title}</p>
        <p className="text-xl font-bold">
          {value}{unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export default function AssessmentViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAssessment(id).then(data => {
        setAssessment(data);
        setLoading(false);
      }).catch(error => {
        console.error(error);
        toast.error("Failed to load assessment");
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Assessment Not Found</h2>
          <p className="text-muted-foreground mb-4">The assessment you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/emergency/assessments">Back to List</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const formatTemperature = () => {
    if (!assessment.temperature) return null;
    const tempValue = typeof assessment.temperature === 'string' ? parseFloat(assessment.temperature) : assessment.temperature;
    return `${tempValue}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto py-6 space-y-6 max-w-7xl px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-mono text-muted-foreground">{assessment.id}</p>
                <TriageBadge value={assessment.triage} />
                <StatusBadge value={assessment.status} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                {assessment.patientName || "Unnamed patient"}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/emergency/assessments/${assessment.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Link>
            </Button>
           
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Patient Overview Card */}
        <InfoCard title="Patient Information" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="UHID / MRN" value={assessment.uhid} highlight />
            <InfoRow label="Full Name" value={assessment.patientName} />
            <InfoRow label="Age / Gender" value={`${assessment.age || "—"} years · ${assessment.gender || "—"}`} />
            <InfoRow label="Arrival Time" value={
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                {new Date(assessment.arrivalAt).toLocaleString()}
              </div>
            } />
            {assessment.linkedAdmissionId && (
              <InfoRow label="Admission ID" value={
                <Badge variant="secondary" className="font-mono">
                  {assessment.linkedAdmissionId}
                </Badge>
              } />
            )}
            {assessment.completedAt && (
              <InfoRow label="Completed At" value={new Date(assessment.completedAt).toLocaleString()} />
            )}
          </div>
        </InfoCard>

        {/* Vitals Section */}
        <InfoCard title="Vital Signs" icon={Activity}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {assessment.systolic && assessment.diastolic && (
              <VitalCard 
                title="Blood Pressure" 
                value={`${assessment.systolic}/${assessment.diastolic}`} 
                unit="mmHg"
                icon={Heart}
                color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              />
            )}
            {assessment.heartRate && (
              <VitalCard 
                title="Heart Rate" 
                value={assessment.heartRate} 
                unit="bpm"
                icon={Heart}
                color="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
              />
            )}
            {assessment.respiratoryRate && (
              <VitalCard 
                title="Respiratory Rate" 
                value={assessment.respiratoryRate} 
                unit="/min"
                icon={Activity}
                color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              />
            )}
            {assessment.temperature && (
              <VitalCard 
                title="Temperature" 
                value={formatTemperature()} 
                unit={`°${assessment.tempUnit}`}
                icon={Thermometer}
                color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
              />
            )}
            {assessment.spo2 && (
              <VitalCard 
                title="SpO₂" 
                value={assessment.spo2} 
                unit="%"
                icon={Droplets}
                color="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
              />
            )}
            <VitalCard 
              title="Pain Score" 
              value={`${assessment.painScore}/10`} 
              icon={Brain}
              color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            />
          </div>
          {(assessment.gcs || assessment.gcs === 0) && (
            <div className="mt-4 pt-4 border-t">
              <InfoRow label="Glasgow Coma Scale (GCS)" value={`${assessment.gcs} / 15`} highlight />
            </div>
          )}
        </InfoCard>

        {/* Tabs for better organization */}
        <Tabs defaultValue="clinical" className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
            <TabsTrigger value="clinical">Clinical Assessment</TabsTrigger>
            <TabsTrigger value="investigations">Investigations</TabsTrigger>
          </TabsList>

          <TabsContent value="clinical" className="space-y-4">
            {/* Doctor Assessment */}
            <InfoCard title="Doctor's Assessment" icon={Stethoscope}>
              <div className="space-y-3">
                <InfoRow label="Chief Complaints" value={assessment.chiefComplaints} highlight />
                <InfoRow label="Duration" value={assessment.complaintDuration} />
                <InfoRow label="Past Medical History" value={assessment.pastHistory} />
                <Separator className="my-2" />
                <InfoRow label="Provisional Diagnosis" value={assessment.provisionalDiagnosis} highlight />
                <InfoRow label="Examination Findings" value={assessment.examFindings} />
                <InfoRow label="ER Intervention" value={assessment.intervention} />
              </div>
            </InfoCard>

            {/* Disposition */}
            <InfoCard title="Disposition & Plan" icon={Hospital}>
              <div className="space-y-3">
                <InfoRow label="Decision" value={
                  <Badge variant="default" className={cn(
                    assessment.decision === "Admit" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                    assessment.decision === "Observe" && "bg-yellow-100 text-yellow-700",
                    assessment.decision === "Discharge Home" && "bg-green-100 text-green-700"
                  )}>
                    {assessment.decision}
                  </Badge>
                } highlight />
                <InfoRow label="Primary Doctor" value={assessment.mainDoctor} />
                <InfoRow label="Referred To" value={assessment.referral || "None"} />
                <InfoRow label="Duty Doctor" value={assessment.dutyDoctorName} />
              </div>
            </InfoCard>
          </TabsContent>

          <TabsContent value="investigations" className="space-y-4">
            {/* Point of Care */}
            <InfoCard title="Point of Care Testing" icon={FlaskConical}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <InfoRow label="Random Blood Sugar" value={assessment.rbs ? `${assessment.rbs} mg/dL` : null} />
                {assessment.upt && <InfoRow label="Urine Pregnancy Test" value={assessment.upt} />}
                <InfoRow label="ECG" value={
                  assessment.ecgDone === "Yes" 
                    ? `Done${assessment.ecgReportAttached ? " · Report Attached" : ""}` 
                    : assessment.ecgDone
                } />
                <InfoRow label="Chest X-Ray" value={
                  assessment.cxrDone === "Yes" 
                    ? `Done${assessment.cxrReportAttached ? " · Report Attached" : ""}` 
                    : assessment.cxrDone
                } />
                <InfoRow label="Bedside Ultrasound" value={assessment.usgDone || "Not Done"} />
                {assessment.usgFindings && (
                  <InfoRow label="USG Findings" value={assessment.usgFindings} highlight />
                )}
              </div>
            </InfoCard>

            {/* Lab Orders */}
            <InfoCard title="Laboratory Investigations" icon={ClipboardList}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">Investigation</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.labs && assessment.labs.map((lab) => (
                      <tr key={lab.name} className="border-b last:border-0">
                        <td className="py-2 font-medium">{lab.name}</td>
                        <td className="py-2 text-right">
                          <StatusBadge value={lab.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </InfoCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}