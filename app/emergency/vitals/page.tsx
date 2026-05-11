// app/emergency/vitals/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { 
  Activity, 
  AlertTriangle, 
  Heart, 
  Thermometer, 
  Wind, 
  Droplet,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types (match API response)
type TriageType = 'Red' | 'Yellow' | 'Green';
type AssessmentStatus = 'Draft' | 'Completed' | 'Converted to Admission';

interface Assessment {
  id: string;
  patientName: string;
  uhid: string;
  triage: TriageType | '';
  status: AssessmentStatus;
  dutyDoctorName: string | null;
  createdAt: string;
  updatedAt: string;
  // Vitals
  systolic: number | null;
  diastolic: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  temperature: number | null;
  tempUnit: string;
  spo2: number | null;
  painScore: number;
  // Additional fields for display
  age?: number | null;
  gender?: string | null;
  // We'll compute bed number from id or index
}

async function fetchAssessments(): Promise<Assessment[]> {
  const res = await fetch('/api/emergency/assessments');
  if (!res.ok) throw new Error('Failed to fetch assessments');
  const data = await res.json();
  return data.success ? data.data : [];
}

function getTrendIcon(trend: string) {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-red-500" />;
  if (trend === 'down') return <TrendingDown className="h-3 w-3 text-blue-500" />;
  return <Minus className="h-3 w-3 text-gray-400" />;
}

function VitalSign({ label, value, unit, trend, critical }: any) {
  return (
    <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        <span className="text-xs font-medium">{label}</span>
        {trend && getTrendIcon(trend)}
      </div>
      <div className={cn("text-lg font-bold", critical && "text-red-600")}>
        {value !== null && value !== undefined ? `${value} ${unit}` : '—'} 
      </div>
    </div>
  );
}

// Helper to determine trend (based on previous value – for demo we can randomize or keep static)
function getTrend(current: number | null, previous: number | null = null): 'up' | 'down' | 'stable' {
  if (current === null || previous === null) return 'stable';
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
}

export default function VitalsMonitorPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedTriage, setSelectedTriage] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAssessments();
      // Optionally filter out drafts if you don't want them in vitals monitor
      // For vitals, we might want only Completed or Converted to Admission
      const active = data.filter(a => a.status !== 'Draft'); // or keep all
      setAssessments(active);
      setLastRefresh(new Date());
    } catch (error) {
      console.error(error);
      toast.error('Failed to load vitals data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const filteredPatients = selectedTriage === 'all'
    ? assessments
    : assessments.filter(p => p.triage === selectedTriage);

  const stats = {
    total: assessments.length,
    critical: assessments.filter(p => p.triage === 'Red').length,
    warning: assessments.filter(p => p.triage === 'Yellow').length,
    stable: assessments.filter(p => p.triage === 'Green').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading vitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vitals Monitor</h1>
          <p className="text-sm text-muted-foreground">Real-time patient vital signs monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical (Red)</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Observation (Yellow)</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
            </div>
            <Activity className="h-8 w-8 text-yellow-500 opacity-50" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stable (Green)</p>
              <p className="text-2xl font-bold text-green-600">{stats.stable}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2 flex-wrap">
        <button
          onClick={() => setSelectedTriage('all')}
          className={cn(
            "px-3 py-1 text-sm rounded-md transition-colors",
            selectedTriage === 'all' 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          )}
        >
          All Patients ({stats.total})
        </button>
        <button
          onClick={() => setSelectedTriage('Red')}
          className={cn(
            "px-3 py-1 text-sm rounded-md transition-colors",
            selectedTriage === 'Red' 
              ? "bg-red-500 text-white" 
              : "hover:bg-red-50 text-red-600"
          )}
        >
          🔴 Critical ({stats.critical})
        </button>
        <button
          onClick={() => setSelectedTriage('Yellow')}
          className={cn(
            "px-3 py-1 text-sm rounded-md transition-colors",
            selectedTriage === 'Yellow' 
              ? "bg-yellow-500 text-white" 
              : "hover:bg-yellow-50 text-yellow-600"
          )}
        >
          🟡 Observation ({stats.warning})
        </button>
        <button
          onClick={() => setSelectedTriage('Green')}
          className={cn(
            "px-3 py-1 text-sm rounded-md transition-colors",
            selectedTriage === 'Green' 
              ? "bg-green-500 text-white" 
              : "hover:bg-green-50 text-green-600"
          )}
        >
          🟢 Stable ({stats.stable})
        </button>
      </div>

      {/* Patient Vitals Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredPatients.map((patient, idx) => {
          // Use patient.id to derive a bed number (just for display)
          const bedNo = `ER-${(idx + 1).toString().padStart(2, '0')}`;
          // Generate trends based on vitals? For now, set stable by default
          const trendHeart = patient.heartRate ? (patient.heartRate > 100 ? 'up' : patient.heartRate < 60 ? 'down' : 'stable') : 'stable';
          const trendBP = (patient.systolic && patient.systolic < 90) ? 'down' : 'stable';
          const trendSpO2 = (patient.spo2 && patient.spo2 < 95) ? 'down' : 'stable';

          return (
            <Card 
              key={patient.id} 
              className={cn(
                "overflow-hidden hover:shadow-lg transition-all duration-200",
                patient.triage === 'Red' && "ring-1 ring-red-200"
              )}
            >
              {/* Patient Header */}
              <div className={cn(
                "p-4 text-white",
                patient.triage === 'Red' && "bg-gradient-to-r from-red-600 to-red-700",
                patient.triage === 'Yellow' && "bg-gradient-to-r from-yellow-600 to-yellow-700",
                patient.triage === 'Green' && "bg-gradient-to-r from-green-600 to-green-700"
              )}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{patient.patientName}</h3>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        Bed {bedNo}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-90 mt-1">
                      {patient.uhid} • {patient.dutyDoctorName || 'No doctor assigned'}
                    </p>
                  </div>
                  <Link href={`/emergency/assessments/${patient.id}`}>
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <VitalSign 
                    label="BP" 
                    value={patient.systolic && patient.diastolic ? `${patient.systolic}/${patient.diastolic}` : null} 
                    unit="mmHg"
                    trend={trendBP}
                    critical={patient.systolic !== null && patient.systolic < 90}
                  />
                  <VitalSign 
                    label="HR" 
                    value={patient.heartRate} 
                    unit="bpm"
                    trend={trendHeart}
                    critical={patient.heartRate !== null && patient.heartRate > 100}
                  />
                  <VitalSign 
                    label="RR" 
                    value={patient.respiratoryRate} 
                    unit="/min"
                    critical={patient.respiratoryRate !== null && patient.respiratoryRate > 20}
                  />
                  <VitalSign 
                    label="Temp" 
                    value={patient.temperature} 
                    unit="°C"
                    critical={patient.temperature !== null && patient.temperature > 37.5}
                  />
                  <VitalSign 
                    label="SpO₂" 
                    value={patient.spo2} 
                    unit="%"
                    trend={trendSpO2}
                    critical={patient.spo2 !== null && patient.spo2 < 95}
                  />
                  <VitalSign 
                    label="Pain" 
                    value={patient.painScore} 
                    unit="/10"
                    critical={patient.painScore > 7}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t text-xs text-muted-foreground">
                  <span>Last updated: {new Date(patient.updatedAt).toLocaleString()}</span>
                  <span className={cn(
                    "inline-flex items-center gap-1",
                    patient.triage === 'Red' && "text-red-600 font-medium"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      patient.triage === 'Red' && "bg-red-500",
                      patient.triage === 'Yellow' && "bg-yellow-500",
                      patient.triage === 'Green' && "bg-green-500"
                    )} />
                    {patient.triage === 'Red' ? 'Critical' : patient.triage === 'Yellow' ? 'Monitoring' : 'Stable'}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No patients found in this category</p>
        </div>
      )}
    </div>
  );
}