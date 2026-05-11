// app/emergency/drafts/page.tsx

'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, FilePlus2, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  updatedAt: string;
}

// Fetch assessments – request only drafts, then filter again for safety
async function fetchDrafts(): Promise<Assessment[]> {
  const res = await fetch('/api/emergency/assessments?status=Draft');
  if (!res.ok) throw new Error('Failed to fetch drafts');
  const data = await res.json();
  const all = data.success ? data.data : [];
  // Enforce status === 'Draft' (in case API misbehaves)
  const draftsOnly = all.filter((a: Assessment) => a.status === 'Draft');
  if (draftsOnly.length !== all.length) {
    console.warn('API returned non-draft assessments – forced client‑side filter');
  }
  return draftsOnly;
}

async function deleteAssessment(id: string): Promise<void> {
  const res = await fetch(`/api/emergency/assessments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete assessment');
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

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchDrafts();
        setDrafts(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load drafts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refresh]);

  const filteredDrafts = searchQuery
    ? drafts.filter((a) =>
        [a.uhid, a.patientName, a.id].some((s) =>
          s?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : drafts;

  const handleDelete = async (id: string) => {
    try {
      await deleteAssessment(id);
      toast.success("Draft deleted");
      setRefresh(prev => prev + 1);
    } catch {
      toast.error("Failed to delete draft");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading drafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Draft Assessments</h1>
            <p className="text-sm text-muted-foreground">
              {filteredDrafts.length} draft{filteredDrafts.length === 1 ? "" : "s"} pending completion
            </p>
          </div>
          <Button asChild>
            <Link href="/emergency/assessments/new">
              <FilePlus2 className="h-4 w-4 mr-2" /> New Assessment
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-border/60 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search UHID, name, or assessment ID"
            className="pl-9"
          />
        </div>
      </Card>

      <Card className="border-border/60 overflow-hidden shadow-sm">
        {filteredDrafts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">No draft assessments found.</p>
            {searchQuery ? (
              <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            ) : (
              <Button asChild variant="outline" className="mt-4">
                <Link href="/emergency/assessments/new">
                  <FilePlus2 className="h-4 w-4 mr-2" /> Start a new assessment
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b-2 border-gray-300 dark:border-gray-700">
                  <TableHead className="border-r border-gray-200 dark:border-gray-800">Assessment ID</TableHead>
                  <TableHead className="border-r border-gray-200 dark:border-gray-800">UHID</TableHead>
                  <TableHead className="border-r border-gray-200 dark:border-gray-800">Patient</TableHead>
                  <TableHead className="border-r border-gray-200 dark:border-gray-800">Triage</TableHead>
                  <TableHead className="border-r border-gray-200 dark:border-gray-800">Last updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrafts.map((assessment, idx) => (
                  <TableRow
                    key={assessment.id}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      idx !== filteredDrafts.length - 1 && "border-b border-gray-200 dark:border-gray-800"
                    )}
                  >
                    <TableCell className="font-mono text-xs border-r border-gray-200 dark:border-gray-800">
                      {assessment.id}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-gray-800">
                      {assessment.uhid || "—"}
                    </TableCell>
                    <TableCell className="font-medium border-r border-gray-200 dark:border-gray-800">
                      {assessment.patientName || "Unnamed patient"}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 dark:border-gray-800">
                      <TriageBadge value={assessment.triage} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground border-r border-gray-200 dark:border-gray-800">
                      {new Date(assessment.updatedAt || assessment.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button asChild size="icon" variant="ghost" aria-label="View">
                          <Link href={`/emergency/assessments/${assessment.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" aria-label="Continue editing">
                          <Link href={`/emergency/assessments/edit/${assessment.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label="Delete">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {assessment.id} — {assessment.patientName || "Unnamed patient"}.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(assessment.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="text-center text-xs text-muted-foreground border-t border-gray-200 dark:border-gray-800 pt-4">
        Showing {filteredDrafts.length} draft{filteredDrafts.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}