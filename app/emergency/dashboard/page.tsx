// app/emergency/page.tsx

'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, ClipboardList, FilePlus2, Hospital, Search, Clock, User, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types (matches API list response)
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
}

async function fetchAssessments(): Promise<Assessment[]> {
  const res = await fetch('/api/emergency/assessments');
  if (!res.ok) throw new Error('Failed to fetch assessments');
  const data = await res.json();
  return data.success ? data.data : [];
}

function TriageBadge({ value }: { value: TriageType | '' }) {
  if (!value) return null;
  const config = {
    Red: { text: 'Critical', icon: '🔴', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200' },
    Yellow: { text: 'Observation', icon: '🟡', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200' },
    Green: { text: 'Stable', icon: '🟢', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200' }
  };
  const { text, icon, className } = config[value];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border", className)}>
      <span>{icon}</span>
      <span>{value} — {text}</span>
    </span>
  );
}

function StatusBadge({ value }: { value: AssessmentStatus }) {
  const config = {
    'Draft': { icon: '📝', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    'Completed': { icon: '✅', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    'Converted to Admission': { icon: '🏥', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
  };
  const { icon, className } = config[value];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
      <span>{icon}</span>
      <span>{value}</span>
    </span>
  );
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function Dashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchAssessments();
        setAssessments(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const todayKey = new Date().toDateString();
  const stats = useMemo(() => {
    const today = assessments.filter((a) => new Date(a.createdAt).toDateString() === todayKey);
    return {
      today: today.length,
      pending: assessments.filter((a) => a.status === "Draft").length,
      converted: assessments.filter((a) => a.status === "Converted to Admission").length,
      critical: assessments.filter((a) => a.triage === "Red").length,
    };
  }, [assessments, todayKey]);

  const filtered = searchQuery
    ? assessments.filter((a) =>
        [a.uhid, a.patientName, a.id, a.dutyDoctorName].some((s) =>
          s?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : assessments;
  const recent = filtered.slice(0, 6);

  const cards = [
    { label: "Assessments today", value: stats.today, icon: ClipboardList, tone: "info" },
    { label: "Pending (drafts)", value: stats.pending, icon: Activity, tone: "warning" },
    { label: "Converted to admission", value: stats.converted, icon: Hospital, tone: "success" },
    { label: "Critical (Red)", value: stats.critical, icon: AlertTriangle, tone: "critical" },
  ] as const;

  const toneClass: Record<string, string> = {
    info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    warning: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    success: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    critical: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-7xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emergency Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track triage, vitals and admissions in real-time.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/emergency/assessments">
              <ClipboardList className="h-4 w-4 mr-2" /> View all
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
            <Link href="/emergency/assessments/new">
              <FilePlus2 className="h-4 w-4 mr-2" /> New Assessment
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/60 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums">{c.value}</p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass[c.tone]} bg-opacity-10`}>
                <c.icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 overflow-hidden shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div>
            <h2 className="font-semibold text-lg">Recent Assessments</h2>
            <p className="text-xs text-muted-foreground">Latest patients seen in the emergency ward</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, UHID, or doctor..."
              className="pl-9"
            />
          </div>
        </div>

        {recent.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No assessments yet.</p>
            <Button asChild className="mt-4">
              <Link href="/emergency/assessments/new">
                <FilePlus2 className="h-4 w-4 mr-2" /> Create first assessment
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((assessment) => (
              <Link
                key={assessment.id}
                href={`/emergency/assessments/${assessment.id}`}
                className="block hover:bg-muted/30 transition-all duration-200"
              >
                <div className="p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn(
                          "text-sm font-medium",
                          assessment.triage === 'Red' && "bg-red-100 text-red-700",
                          assessment.triage === 'Yellow' && "bg-yellow-100 text-yellow-700",
                          assessment.triage === 'Green' && "bg-green-100 text-green-700"
                        )}>
                          {assessment.patientName?.charAt(0).toUpperCase() || 'P'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base">
                            {assessment.patientName || "Unnamed patient"}
                          </h3>
                          <TriageBadge value={assessment.triage} />
                          <StatusBadge value={assessment.status} />
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {assessment.uhid || "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(assessment.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getRelativeTime(assessment.createdAt)}
                          </span>
                        </div>

                        {assessment.dutyDoctorName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Duty Doctor: {assessment.dutyDoctorName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-13 lg:ml-0">
                      <Button variant="ghost" size="sm" className="gap-1">
                        View Details <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {recent.length > 0 && (
          <div className="border-t p-3 text-center bg-muted/20">
            <Link
              href="/emergency/assessments"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              View all assessments <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}