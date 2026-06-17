


// 'use client';

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { Eye, FilePlus2, Pencil, Printer, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { cn } from "@/lib/utils";

// type TriageType = 'Red' | 'Yellow' | 'Green';
// type AssessmentStatus = 'Draft' | 'Completed' | 'Converted to Admission';
// type DischargeType = 'Regular' | 'LAMA' | 'Referred' | 'Expired' | null;

// interface Assessment {
//   id: string;
//   status: AssessmentStatus;
//   uhid: string;
//   patientName: string;
//   triage: TriageType | '';
//   dutyDoctorName: string;
//   createdAt: string;
//   decision: string;  // Admit, Discharge Home, Observe, Transfer
//   linkedAdmissionId?: string;
//   discharge_details?: {
//     dischargeType: DischargeType;
//     dischargeDate: string;
//     dischargeReason: string;
//   };
// }

// // Fetch all assessments from the API
// async function fetchAssessments(): Promise<Assessment[]> {
//   const res = await fetch('/api/emergency/assessments');
//   if (!res.ok) throw new Error('Failed to fetch assessments');
//   const data = await res.json();
//   return data.success ? data.data : [];
// }

// function TriageBadge({ value }: { value: TriageType | '' }) {
//   if (!value) return <span className="text-muted-foreground">—</span>;
//   const config = {
//     Red: { text: 'Critical', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
//     Yellow: { text: 'Observation', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
//     Green: { text: 'Stable', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
//   };
//   const { text, className } = config[value];
//   return (
//     <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
//       {value} — {text}
//     </span>
//   );
// }

// function StatusBadge({ value }: { value: AssessmentStatus }) {
//   const config = {
//     'Draft': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
//     'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
//     'Converted to Admission': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
//   };
//   return (
//     <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config[value])}>
//       {value}
//     </span>
//   );
// }

// function OutcomeBadge({ assessment }: { assessment: Assessment }) {
//   // Check if converted to admission
//   if (assessment.status === 'Converted to Admission') {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
//         <CheckCircle className="h-3 w-3" />
//         Admitted
//       </span>
//     );
//   }
  
//   // Check if discharged
//   if (assessment.decision === 'Discharge Home') {
//     // Check discharge type if available
//     const dischargeType = assessment.discharge_details?.dischargeType;
//     if (dischargeType === 'LAMA') {
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
//           <AlertCircle className="h-3 w-3" />
//           LAMA Discharge
//         </span>
//       );
//     }
//     if (dischargeType === 'Referred') {
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
//           <AlertCircle className="h-3 w-3" />
//           Referred
//         </span>
//       );
//     }
//     if (dischargeType === 'Expired') {
//       return (
//         <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
//           <XCircle className="h-3 w-3" />
//           Expired
//         </span>
//       );
//     }
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
//         <CheckCircle className="h-3 w-3" />
//         Discharged
//       </span>
//     );
//   }
  
 
  
  
  
//   // For Transfer
//   if (assessment.decision === 'Transfer') {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
//         <AlertCircle className="h-3 w-3" />
//         Transferred
//       </span>
//     );
//   }
  
//   return <span className="text-muted-foreground">—</span>;
// }

// export default function AssessmentsPage() {
//   const [allAssessments, setAllAssessments] = useState<Assessment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [dateFilter, setDateFilter] = useState<string>("");
//   const [outcomeFilter, setOutcomeFilter] = useState<string>("all");

//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         const data = await fetchAssessments();
//         setAllAssessments(data);
//       } catch (error) {
//         console.error(error);
//         toast.error("Failed to load assessments");
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   // Filter out drafts – only show Completed and Converted to Admission
//   const nonDraftAssessments = useMemo(() => {
//     return allAssessments.filter(a => a.status !== 'Draft');
//   }, [allAssessments]);

//   // Apply search, status, date, and outcome filters
//   const filteredAssessments = useMemo(() => {
//     return nonDraftAssessments.filter((assessment) => {
//       const matchesSearch = searchQuery
//         ? [assessment.uhid, assessment.patientName, assessment.id].some((s) =>
//             s?.toLowerCase().includes(searchQuery.toLowerCase())
//           )
//         : true;
//       const matchesStatus = statusFilter === "all" ? true : assessment.status === statusFilter;
//       const matchesDate = dateFilter
//         ? new Date(assessment.createdAt).toISOString().slice(0, 10) === dateFilter
//         : true;
      
//       // Outcome filter logic
//       let matchesOutcome = true;
//       if (outcomeFilter !== "all") {
//         switch (outcomeFilter) {
//           case "admitted":
//             matchesOutcome = assessment.status === 'Converted to Admission';
//             break;
//           case "discharged":
//             matchesOutcome = assessment.decision === 'Discharge Home' && 
//               (!assessment.discharge_details?.dischargeType || 
//                assessment.discharge_details?.dischargeType === 'Regular');
//             break;
//           case "lama":
//             matchesOutcome = assessment.discharge_details?.dischargeType === 'LAMA';
//             break;
//           case "expired":
//             matchesOutcome = assessment.discharge_details?.dischargeType === 'Expired';
//             break;
//           case "referred":
//             matchesOutcome = assessment.discharge_details?.dischargeType === 'Referred';
//             break;
//           case "pending_admission":
//             matchesOutcome = assessment.decision === 'Admit' && assessment.status !== 'Converted to Admission';
//             break;
//           case "observation":
//             matchesOutcome = assessment.decision === 'Observe';
//             break;
//         }
//       }
      
//       return matchesSearch && matchesStatus && matchesDate && matchesOutcome;
//     });
//   }, [nonDraftAssessments, searchQuery, statusFilter, dateFilter, outcomeFilter]);

//   if (loading) {
//     return (
//       <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
//           <p className="mt-2 text-sm text-muted-foreground">Loading assessments...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-6 space-y-6 max-w-7xl">
//       <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
//         <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
//             <p className="text-sm text-muted-foreground">
//               {filteredAssessments.length} of {nonDraftAssessments.length} records (drafts excluded)
//             </p>
//           </div>
//           <Button asChild>
//             <Link href="/emergency/assessments/new">
//               <FilePlus2 className="h-4 w-4 mr-2" /> New Assessment
//             </Link>
//           </Button>
//         </div>
//       </div>

//       {/* Filters Card */}
//       <Card className="border-border/60 p-4 shadow-sm">
//         <div className="grid gap-3 md:grid-cols-[1fr_150px_150px_150px]">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search UHID, name, or assessment ID"
//               className="pl-9"
//             />
//           </div>
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger>
//               <SelectValue placeholder="Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="Completed">Completed</SelectItem>
//               <SelectItem value="Converted to Admission">Converted to Admission</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
//             <SelectTrigger>
//               <SelectValue placeholder="Outcome" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Outcomes</SelectItem>
//               <SelectItem value="admitted">Admitted</SelectItem>
//               <SelectItem value="discharged">Discharged</SelectItem>
//               <SelectItem value="lama">LAMA</SelectItem>
//               <SelectItem value="referred">Referred</SelectItem>
//               <SelectItem value="expired">Expired</SelectItem>
//               <SelectItem value="pending_admission">Pending Admission</SelectItem>
//               <SelectItem value="observation">Under Observation</SelectItem>
//             </SelectContent>
//           </Select>
//           <div className="relative">
//             <Input
//               type="date"
//               value={dateFilter}
//               onChange={(e) => setDateFilter(e.target.value)}
//               placeholder="Filter by date"
//             />
//           </div>
//         </div>
//       </Card>

//       {/* Table Card */}
//       <Card className="border-border/60 overflow-hidden shadow-sm">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader className="bg-muted/30">
//               <TableRow className="border-b-2 border-gray-300 dark:border-gray-700">
//                 <TableHead className="border-r border-gray-200 dark:border-gray-800">Assessment ID</TableHead>
//                 <TableHead className="border-r border-gray-200 dark:border-gray-800">UHID</TableHead>
//                 <TableHead className="border-r border-gray-200 dark:border-gray-800">Patient</TableHead>
//                 <TableHead className="border-r border-gray-200 dark:border-gray-800">Triage</TableHead>
//                 <TableHead className="border-r border-gray-200 dark:border-gray-800">Duty Doctor</TableHead>
//                 <TableHead className="border-r border-gray-200 dark:border-gray-800">Status</TableHead>
//                 <TableHead className="border-r border-gray-200 dark:border-gray-800">Outcome</TableHead>
//                 <TableHead className="border-r border-gray-200 dark:border-gray-800">Date & Time</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredAssessments.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
//                     No matching assessments found.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredAssessments.map((assessment, index) => (
//                   <TableRow
//                     key={assessment.id}
//                     className={cn(
//                       "hover:bg-muted/30 transition-colors",
//                       index !== filteredAssessments.length - 1 && "border-b border-gray-200 dark:border-gray-800"
//                     )}
//                   >
//                     <TableCell className="font-mono text-xs border-r border-gray-200 dark:border-gray-800">
//                       {assessment.id}
//                     </TableCell>
//                     <TableCell className="border-r border-gray-200 dark:border-gray-800">
//                       {assessment.uhid || "—"}
//                     </TableCell>
//                     <TableCell className="font-medium border-r border-gray-200 dark:border-gray-800">
//                       {assessment.patientName || "—"}
//                     </TableCell>
//                     <TableCell className="border-r border-gray-200 dark:border-gray-800">
//                       <TriageBadge value={assessment.triage} />
//                     </TableCell>
//                     <TableCell className="border-r border-gray-200 dark:border-gray-800">
//                       {assessment.dutyDoctorName || "—"}
//                     </TableCell>
//                     <TableCell className="border-r border-gray-200 dark:border-gray-800">
//                       <StatusBadge value={assessment.status} />
//                     </TableCell>
//                     <TableCell className="border-r border-gray-200 dark:border-gray-800">
//                       <OutcomeBadge assessment={assessment} />
//                     </TableCell>
//                     <TableCell className="text-xs text-muted-foreground border-r border-gray-200 dark:border-gray-800">
//                       {new Date(assessment.createdAt).toLocaleString()}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="inline-flex gap-1">
//                         <Button asChild size="icon" variant="ghost" aria-label="View">
//                           <Link href={`/emergency/assessments/${assessment.id}`}>
//                             <Eye className="h-4 w-4" />
//                           </Link>
//                         </Button>
//                         <Button asChild size="icon" variant="ghost" aria-label="Edit">
//                           <Link href={`/emergency/assessments/edit/${assessment.id}`}>
//                             <Pencil className="h-4 w-4" />
//                           </Link>
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </Card>

//       <div className="text-center text-xs text-muted-foreground border-t border-gray-200 dark:border-gray-800 pt-4">
//         Showing {filteredAssessments.length} of {nonDraftAssessments.length} assessments (drafts hidden)
//       </div>
//     </div>
//   );
// }


'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, FilePlus2, Pencil, Printer, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TriageType = 'Red' | 'Yellow' | 'Green';
type AssessmentStatus = 'Draft' | 'Completed' | 'Converted to Admission';
type DischargeType = 'Regular' | 'LAMA' | 'Referred' | 'Expired' | null;

interface Assessment {
  id: string;
  status: AssessmentStatus;
  uhid: string;
  patientName: string;
  triage: TriageType | '';
  dutyDoctorName: string;
  createdAt: string;
  decision: string;
  linkedAdmissionId?: string;
  discharge_details?: {
    dischargeType: DischargeType;
    dischargeDate: string;
    dischargeReason: string;
  };
}

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
    'Completed': 'bg-[#EAF7F4] text-[#1F8F89] dark:bg-[#1F8F89]/20 dark:text-[#2BB2A7]',
    'Converted to Admission': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config[value])}>
      {value}
    </span>
  );
}

function OutcomeBadge({ assessment }: { assessment: Assessment }) {
  if (assessment.status === 'Converted to Admission') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
        <CheckCircle className="h-3 w-3" />
        Admitted
      </span>
    );
  }
  
  if (assessment.decision === 'Discharge Home') {
    const dischargeType = assessment.discharge_details?.dischargeType;
    if (dischargeType === 'LAMA') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
          <AlertCircle className="h-3 w-3" />
          LAMA Discharge
        </span>
      );
    }
    if (dischargeType === 'Referred') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <AlertCircle className="h-3 w-3" />
          Referred
        </span>
      );
    }
    if (dischargeType === 'Expired') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="h-3 w-3" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
        <CheckCircle className="h-3 w-3" />
        Discharged
      </span>
    );
  }
  
  if (assessment.decision === 'Transfer') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
        <AlertCircle className="h-3 w-3" />
        Transferred
      </span>
    );
  }
  
  return <span className="text-muted-foreground">—</span>;
}

export default function AssessmentsPage() {
  const [allAssessments, setAllAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");

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

  const nonDraftAssessments = useMemo(() => {
    return allAssessments.filter(a => a.status !== 'Draft');
  }, [allAssessments]);

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
      
      let matchesOutcome = true;
      if (outcomeFilter !== "all") {
        switch (outcomeFilter) {
          case "admitted":
            matchesOutcome = assessment.status === 'Converted to Admission';
            break;
          case "discharged":
            matchesOutcome = assessment.decision === 'Discharge Home' && 
              (!assessment.discharge_details?.dischargeType || 
               assessment.discharge_details?.dischargeType === 'Regular');
            break;
          case "lama":
            matchesOutcome = assessment.discharge_details?.dischargeType === 'LAMA';
            break;
          case "expired":
            matchesOutcome = assessment.discharge_details?.dischargeType === 'Expired';
            break;
          case "referred":
            matchesOutcome = assessment.discharge_details?.dischargeType === 'Referred';
            break;
          case "pending_admission":
            matchesOutcome = assessment.decision === 'Admit' && assessment.status !== 'Converted to Admission';
            break;
          case "observation":
            matchesOutcome = assessment.decision === 'Observe';
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate && matchesOutcome;
    });
  }, [nonDraftAssessments, searchQuery, statusFilter, dateFilter, outcomeFilter]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2BB2A7] mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="border-b border-[#E2EFEA] dark:border-gray-800 pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Assessments</h1>
            <p className="text-sm text-muted-foreground">
              {filteredAssessments.length} of {nonDraftAssessments.length} records (drafts excluded)
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white shadow-lg shadow-[#2BB2A7]/20">
            <Link href="/emergency/assessments/new">
              <FilePlus2 className="h-4 w-4 mr-2" /> New Assessment
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-[#E2EFEA] dark:border-slate-700 p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_150px_150px_150px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search UHID, name, or assessment ID"
              className="pl-9 focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent border-[#E2EFEA] dark:border-slate-700"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent border-[#E2EFEA] dark:border-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Converted to Admission">Converted to Admission</SelectItem>
            </SelectContent>
          </Select>
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent border-[#E2EFEA] dark:border-slate-700">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="admitted">Admitted</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
              <SelectItem value="lama">LAMA</SelectItem>
              <SelectItem value="referred">Referred</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="pending_admission">Pending Admission</SelectItem>
              <SelectItem value="observation">Under Observation</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date"
              className="focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent border-[#E2EFEA] dark:border-slate-700"
            />
          </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card className="border-[#E2EFEA] dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F4F9F7] dark:bg-slate-800/30">
              <TableRow className="border-b-2 border-[#E2EFEA] dark:border-slate-700">
                <TableHead className="border-r border-[#E2EFEA] dark:border-slate-700 text-[#1F8F89] dark:text-[#2BB2A7]">Assessment ID</TableHead>
                <TableHead className="border-r border-[#E2EFEA] dark:border-slate-700 text-[#1F8F89] dark:text-[#2BB2A7]">UHID</TableHead>
                <TableHead className="border-r border-[#E2EFEA] dark:border-slate-700 text-[#1F8F89] dark:text-[#2BB2A7]">Patient</TableHead>
                <TableHead className="border-r border-[#E2EFEA] dark:border-slate-700 text-[#1F8F89] dark:text-[#2BB2A7]">Triage</TableHead>
                <TableHead className="border-r border-[#E2EFEA] dark:border-slate-700 text-[#1F8F89] dark:text-[#2BB2A7]">Duty Doctor</TableHead>
                <TableHead className="border-r border-[#E2EFEA] dark:border-slate-700 text-[#1F8F89] dark:text-[#2BB2A7]">Status</TableHead>
                <TableHead className="border-r border-[#E2EFEA] dark:border-slate-700 text-[#1F8F89] dark:text-[#2BB2A7]">Outcome</TableHead>
                <TableHead className="border-r border-[#E2EFEA] dark:border-slate-700 text-[#1F8F89] dark:text-[#2BB2A7]">Date & Time</TableHead>
                <TableHead className="text-right text-[#1F8F89] dark:text-[#2BB2A7]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                    No matching assessments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssessments.map((assessment, index) => (
                  <TableRow
                    key={assessment.id}
                    className={cn(
                      "hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-colors",
                      index !== filteredAssessments.length - 1 && "border-b border-[#E2EFEA] dark:border-slate-700"
                    )}
                  >
                    <TableCell className="font-mono text-xs border-r border-[#E2EFEA] dark:border-slate-700 text-gray-900 dark:text-white">
                      {assessment.id}
                    </TableCell>
                    <TableCell className="border-r border-[#E2EFEA] dark:border-slate-700 text-gray-700 dark:text-gray-300">
                      {assessment.uhid || "—"}
                    </TableCell>
                    <TableCell className="font-medium border-r border-[#E2EFEA] dark:border-slate-700 text-gray-900 dark:text-white">
                      {assessment.patientName || "—"}
                    </TableCell>
                    <TableCell className="border-r border-[#E2EFEA] dark:border-slate-700">
                      <TriageBadge value={assessment.triage} />
                    </TableCell>
                    <TableCell className="border-r border-[#E2EFEA] dark:border-slate-700 text-gray-700 dark:text-gray-300">
                      {assessment.dutyDoctorName || "—"}
                    </TableCell>
                    <TableCell className="border-r border-[#E2EFEA] dark:border-slate-700">
                      <StatusBadge value={assessment.status} />
                    </TableCell>
                    <TableCell className="border-r border-[#E2EFEA] dark:border-slate-700">
                      <OutcomeBadge assessment={assessment} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground border-r border-[#E2EFEA] dark:border-slate-700">
                      {new Date(assessment.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button asChild size="icon" variant="ghost" aria-label="View" className="hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20 hover:text-[#2BB2A7]">
                          <Link href={`/emergency/assessments/${assessment.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" aria-label="Edit" className="hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20 hover:text-[#2BB2A7]">
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

      <div className="text-center text-xs text-muted-foreground border-t border-[#E2EFEA] dark:border-gray-800 pt-4">
        Showing {filteredAssessments.length} of {nonDraftAssessments.length} assessments (drafts hidden)
      </div>
    </div>
  );
}