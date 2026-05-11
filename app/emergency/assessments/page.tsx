// app/emergency/assessments/page.tsx

'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, FilePlus2, Pencil, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TriageType = 'Red' | 'Yellow' | 'Green';
type AssessmentStatus = 'Draft' | 'Completed' | 'Converted to Admission';

interface Assessment {
  id: string;
  status: AssessmentStatus;
  uhid: string;
  patientName: string;
  triage: TriageType | '';
  dutyDoctorName: string;
  createdAt: string;
}

// Fetch all assessments from the API
async function fetchAssessments(): Promise<Assessment[]> {
  const res = await fetch('/api/emergency/assessments');
  if (!res.ok) throw new Error('Failed to fetch assessments');
  const data = await res.json();
  return data.success ? data.data : [];
}

function TriageBadge({ value }: { value: TriageType | '' }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const config = {
    Red: { text: 'Critical', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    Yellow: { text: 'Observation', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    Green: { text: 'Stable', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
  };
  const { text, className } = config[value];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
      {value} — {text}
    </span>
  );
}

function StatusBadge({ value }: { value: AssessmentStatus }) {
  const config = {
    'Draft': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Converted to Admission': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config[value])}>
      {value}
    </span>
  );
}

export default function AssessmentsPage() {
  const [allAssessments, setAllAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchAssessments();
        setAllAssessments(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load assessments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter out drafts – only show Completed and Converted to Admission
  const nonDraftAssessments = useMemo(() => {
    return allAssessments.filter(a => a.status !== 'Draft');
  }, [allAssessments]);

  // Apply search, status, and date filters on the non‑draft list
  const filteredAssessments = useMemo(() => {
    return nonDraftAssessments.filter((assessment) => {
      const matchesSearch = searchQuery
        ? [assessment.uhid, assessment.patientName, assessment.id].some((s) =>
            s?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : true;
      const matchesStatus = statusFilter === "all" ? true : assessment.status === statusFilter;
      const matchesDate = dateFilter
        ? new Date(assessment.createdAt).toISOString().slice(0, 10) === dateFilter
        : true;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [nonDraftAssessments, searchQuery, statusFilter, dateFilter]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
            <p className="text-sm text-muted-foreground">
              {filteredAssessments.length} of {nonDraftAssessments.length} records (drafts excluded)
            </p>
          </div>
          <Button asChild>
            <Link href="/emergency/assessments/new">
              <FilePlus2 className="h-4 w-4 mr-2" /> New Assessment
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-border/60 p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search UHID, name, or assessment ID"
              className="pl-9"
            />
          </div>
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="ml-3 md:ml-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (excl. Draft)</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Converted to Admission">Converted to Admission</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="ml-3 md:ml-0"
            />
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card className="border-border/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b-2 border-gray-300 dark:border-gray-700">
                <TableHead className="border-r border-gray-200 dark:border-gray-800">Assessment ID</TableHead>
                <TableHead className="border-r border-gray-200 dark:border-gray-800">UHID</TableHead>
                <TableHead className="border-r border-gray-200 dark:border-gray-800">Patient</TableHead>
                <TableHead className="border-r border-gray-200 dark:border-gray-800">Triage</TableHead>
                <TableHead className="border-r border-gray-200 dark:border-gray-800">Duty Doctor</TableHead>
                <TableHead className="border-r border-gray-200 dark:border-gray-800">Status</TableHead>
                <TableHead className="border-r border-gray-200 dark:border-gray-800">Date & Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    No matching assessments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssessments.map((assessment, index) => (
                  <TableRow
                    key={assessment.id}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      index !== filteredAssessments.length - 1 && "border-b border-gray-200 dark:border-gray-800"
                    )}
                  >
                    <TableCell className="font-mono text-xs border-r border-gray-200 dark:border-gray-800">
                      {assessment.id}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-gray-800">
                      {assessment.uhid || "—"}
                    </TableCell>
                    <TableCell className="font-medium border-r border-gray-200 dark:border-gray-800">
                      {assessment.patientName || "—"}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-gray-800">
                      <TriageBadge value={assessment.triage} />
                    </TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-gray-800">
                      {assessment.dutyDoctorName || "—"}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-gray-800">
                      <StatusBadge value={assessment.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground border-r border-gray-200 dark:border-gray-800">
                      {new Date(assessment.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button asChild size="icon" variant="ghost" aria-label="View">
                          <Link href={`/emergency/assessments/${assessment.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" aria-label="Edit">
                          <Link href={`/emergency/assessments/edit/${assessment.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                       
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="text-center text-xs text-muted-foreground border-t border-gray-200 dark:border-gray-800 pt-4">
        Showing {filteredAssessments.length} of {nonDraftAssessments.length} assessments (drafts hidden)
      </div>
    </div>
  );
}