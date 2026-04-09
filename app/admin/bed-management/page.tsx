


// 'use client';

// import { useState, useMemo, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useWardData, Bed, BedStatus } from "../../../data/wardData";
// import { BedCard } from "../../../data/BedCard";
// import { FloorPlan } from "../../../data/FloorPlan";
// import { BedDetailPanel } from "../../../data/BedDetailPanel";
// import { TransferDialog } from "../../../data/ADTDialogs";
// import { OccupancyHeatmap } from "../../../data/OccupancyHeatmap";
// import { ShiftHandover } from "../../../data/ShiftHandover";
// import { PredictiveChart } from "../../../data/PredictiveChart";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import {
//   BedDouble, Activity, Search, LayoutGrid, Map, BarChart3,
//   ClipboardList, TrendingUp, RefreshCw, Loader2, Menu, X
// } from "lucide-react";
// import { patchBed } from "@/lib/api/bed-config";
// import AdminSidebar from "@/components/admin/Sidebar";
// import HelpDeskSidebar from "@/components/helpdesk/HelpDeskSidebar";
// import Header from "@/components/admin/Header";
// import { toast } from "sonner";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";

// type ViewMode = "grid" | "floor";

// export default function WardPage() {
//   const router = useRouter();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [viewMode, setViewMode] = useState<ViewMode>("grid");
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [typeFilter, setTypeFilter] = useState<string>("all");
//   const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
//   const [detailOpen, setDetailOpen] = useState(false);
//   const [transferBed, setTransferBed] = useState<Bed | null>(null);
  
//   // Manual discharge modal state
//   const [manualDischargeBed, setManualDischargeBed] = useState<Bed | null>(null);
//   const [dischargeIdInput, setDischargeIdInput] = useState('');
//   const [dischargeNotesInput, setDischargeNotesInput] = useState('');
//   const [discharging, setDischarging] = useState(false);

//   // Get user role from localStorage
//   const [userRole, setUserRole] = useState<string | null>(null);
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       try {
//         const parsed = JSON.parse(storedUser);
//         setUserRole(parsed.role);
//       } catch (e) {
//         console.error("Failed to parse user", e);
//       }
//     }
//   }, []);

//   const { beds, wards, forecast, loading, error, refresh } = useWardData();
  
//   const [localBeds, setLocalBeds] = useState<Bed[]>([]);

//   useEffect(() => {
//     setLocalBeds(beds);
//   }, [beds]);

//   // Handlers for HelpDeskSidebar props
//   const handleBillingClick = () => router.push('/helpdesk/billing');
//   const handleRoomAvailabilityClick = () => router.push('/admin/bed-management');
//   const handleDoctorSlotsClick = () => router.push('/helpdesk/doctor-slots');

//   const stats = useMemo(() => {
//     const currentBeds = localBeds;
//     const total = currentBeds.length;
//     const occupied = currentBeds.filter(b => b.status === "occupied").length;
//     const available = currentBeds.filter(b => b.status === "available").length;
//     const cleaning = currentBeds.filter(b => b.status === "cleaning").length;
//     const maintenance = currentBeds.filter(b => b.status === "maintenance").length;
//     const reserved = currentBeds.filter(b => b.status === "reserved").length;
    
//     const predictedOccupancy = forecast.length > 0 
//       ? forecast[forecast.length - 1]?.occupancy + "%"
//       : "82%";
    
//     return { total, occupied, available, cleaning, maintenance, reserved, predictedOccupancy };
//   }, [localBeds, forecast]);

//   const filteredBeds = useMemo(() => {
//     return localBeds.filter(b => {
//       if (statusFilter !== "all" && b.status !== statusFilter) return false;
//       if (typeFilter !== "all" && b.type !== typeFilter) return false;
//       if (search) {
//         const q = search.toLowerCase();
//         return b.number.toLowerCase().includes(q) ||
//           b.patient?.name?.toLowerCase().includes(q) ||
//           b.patient?.mrn?.toLowerCase().includes(q) ||
//           b.ward.toLowerCase().includes(q);
//       }
//       return true;
//     });
//   }, [localBeds, statusFilter, typeFilter, search]);

//   const availableBeds = localBeds.filter(b => b.status === "available");

//   const handleSelect = (bed: Bed) => { 
//     setSelectedBed(bed); 
//     setDetailOpen(true); 
//   };

//   // Discharge flow
//   const handleDischarge = (bed: Bed) => {
//     setManualDischargeBed(bed);
//     setDischargeIdInput('');
//     setDischargeNotesInput('');
//   };

//   const performDischarge = async () => {
//     if (!manualDischargeBed) return;
//     if (!dischargeIdInput.trim()) {
//       toast.error('Please enter a discharge ID');
//       return;
//     }

//     setDischarging(true);
//     try {
//       const bedId = manualDischargeBed.id;
//       const admRes = await fetch(`/api/helpdesk/admissions?bedId=${bedId}&status=active`);
//       const admData = await admRes.json();
//       if (!admData.success || admData.data.length === 0) {
//         throw new Error('No active admission found for this bed');
//       }
//       const admissionId = admData.data[0].id;

//       const res = await fetch('/api/helpdesk/admissions/discharge', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           admissionId,
//           dischargeId: dischargeIdInput,
//           dischargeNotes: dischargeNotesInput,
//         }),
//       });
//       const result = await res.json();
//       if (!result.success) throw new Error(result.message);

//       toast.success('Patient discharged successfully');
//       refresh(); // refresh bed data
//       setManualDischargeBed(null);
//     } catch (err: any) {
//       toast.error(err.message || 'Discharge failed');
//     } finally {
//       setDischarging(false);
//     }
//   };

//   // Transfer flow
//   const handleTransfer = async (bed: Bed, destId: string) => {
//   try {
//     setLocalBeds(prev => {
//       const updated = [...prev];
//       const srcIdx = updated.findIndex(b => b.id === bed.id);
//       const dstIdx = updated.findIndex(b => b.id === destId);
      
//       if (srcIdx >= 0 && dstIdx >= 0) {
//         updated[dstIdx] = { 
//           ...updated[dstIdx], 
//           status: "occupied", 
//           patient: updated[srcIdx].patient, 
//           vitals: updated[srcIdx].vitals, 
//           notes: updated[srcIdx].notes, 
//           recentlyChanged: true 
//         };
//         updated[srcIdx] = { 
//           ...updated[srcIdx], 
//           status: "cleaning", 
//           patient: undefined, 
//           vitals: undefined, 
//           notes: [], 
//           recentlyChanged: true 
//         };
//       }
//       return updated;
//     });

//     const srcId = parseInt(bed.id);
//     const dstId = parseInt(destId);
    
//     await patchBed(srcId, { status: "cleaning" });
    
//     if (bed.patient) {
//       await patchBed(dstId, {
//         status: "occupied",
//         // ✅ Remove occupied_by line – backend will handle patient ID from source bed
//         attributes: {
//           patient_name: bed.patient.name,
//           patient_initials: bed.patient.initials,
//           mrn: bed.patient.mrn,
//           admission_date: bed.patient.admissionDate,
//         }
//       });
//     }

//     toast.success("Patient transferred", {
//       description: `Transfer from Bed ${bed.number} complete`
//     });
//   } catch (error) {
//     setLocalBeds(beds);
//     toast.error("Failed to transfer patient");
//   }
// };

//   const handleMarkAvailable = async (bed: Bed) => {
//     try {
//       setLocalBeds(prev => prev.map(b => b.id === bed.id ? { 
//         ...b, 
//         status: "available" as BedStatus, 
//         recentlyChanged: true 
//       } : b));

//       const bedId = parseInt(bed.id);
//       await patchBed(bedId, { status: "available" });

//       toast.success("Bed available", {
//         description: `Bed ${bed.number} is now available`
//       });
//     } catch (error) {
//       setLocalBeds(beds);
//       toast.error("Failed to update bed status");
//     }
//   };

//   const statCards = [
//     { label: "Total Beds", value: stats.total, icon: BedDouble, filter: "all" },
//     { label: "Occupied", value: stats.occupied, icon: Activity, filter: "occupied", color: "text-status-occupied" },
//     { label: "Available", value: stats.available, icon: BedDouble, filter: "available", color: "text-status-available" },
//     { label: "Cleaning", value: stats.cleaning, icon: BedDouble, filter: "cleaning", color: "text-status-cleaning" },
//     { label: "Maintenance", value: stats.maintenance, icon: BedDouble, filter: "maintenance", color: "text-status-maintenance" },
//     { label: "Reserved", value: stats.reserved, icon: BedDouble, filter: "reserved", color: "text-status-reserved" },
//     { label: "Predicted", value: stats.predictedOccupancy, icon: BarChart3, filter: "all" },
//   ];

//   if (loading && localBeds.length === 0) {
//     return (
//       <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
//         {userRole === 'helpdesk' ? (
//           <HelpDeskSidebar
//             isOpen={isSidebarOpen}
//             onClose={() => setIsSidebarOpen(false)}
//             onBillingClick={handleBillingClick}
//             onRoomAvailabilityClick={handleRoomAvailabilityClick}
//             onDoctorSlotsClick={handleDoctorSlotsClick}
//           />
//         ) : (
//           <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//         )}
//         <main className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
//             <p className="text-gray-500 dark:text-gray-400">Loading ward data...</p>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
//       {/* Mobile Menu Button */}
//       <button
//         className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//         aria-label="Toggle menu"
//       >
//         {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//       </button>

//       {/* Conditional Sidebar */}
//       {userRole === 'helpdesk' ? (
//         <HelpDeskSidebar
//           isOpen={isSidebarOpen}
//           onClose={() => setIsSidebarOpen(false)}
//           onBillingClick={handleBillingClick}
//           onRoomAvailabilityClick={handleRoomAvailabilityClick}
//           onDoctorSlotsClick={handleDoctorSlotsClick}
//         />
//       ) : (
//         <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//       )}

//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       <main className="flex-1 flex flex-col overflow-y-auto">
//         <Header />

//         <div className="p-5 lg:p-6 space-y-6">
//           {/* Header with Refresh */}
//           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//             <div>
//               <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
//                 Ward & Bed Management
//               </h2>
//               <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
//                 Real‑time bed availability, occupancy, and ADT workflows
//               </p>
//             </div>
//             <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
//               <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
//               Refresh
//             </Button>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
//             {statCards.map((s) => (
//               <button
//                 key={s.label}
//                 onClick={() => setStatusFilter(s.filter === "all" ? "all" : s.filter)}
//                 className="rounded-lg border bg-background p-2.5 text-left hover:bg-muted/50 transition-colors"
//               >
//                 <div className="flex items-center gap-1.5 mb-1">
//                   <s.icon className={`h-3.5 w-3.5 ${s.color || "text-muted-foreground"}`} />
//                   <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
//                 </div>
//                 <p className={`text-xl font-bold ${s.color || "text-foreground"}`}>{s.value}</p>
//               </button>
//             ))}
//           </div>

//           {/* Tabs and Filters */}
//           <Tabs defaultValue="beds" className="space-y-4">
//             <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
//               <TabsList>
//                 <TabsTrigger value="beds"><BedDouble className="h-4 w-4 mr-1" /> Beds</TabsTrigger>
//                 <TabsTrigger value="heatmap"><BarChart3 className="h-4 w-4 mr-1" /> Heatmap</TabsTrigger>
//                 <TabsTrigger value="handover"><ClipboardList className="h-4 w-4 mr-1" /> Handover</TabsTrigger>
//                 <TabsTrigger value="analytics"><TrendingUp className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
//               </TabsList>

//               <div className="flex flex-col sm:flex-row sm:items-center gap-3">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     placeholder="Search bed, patient, MRN…"
//                     className="pl-9 h-9 w-full"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                   />
//                 </div>

//                 <Select value={statusFilter} onValueChange={setStatusFilter}>
//                   <SelectTrigger className="h-9 w-full sm:w-32">
//                     <SelectValue placeholder="Status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Status</SelectItem>
//                     <SelectItem value="available">Available</SelectItem>
//                     <SelectItem value="occupied">Occupied</SelectItem>
//                     <SelectItem value="cleaning">Cleaning</SelectItem>
//                     <SelectItem value="maintenance">Maintenance</SelectItem>
//                     <SelectItem value="reserved">Reserved</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <Select value={typeFilter} onValueChange={setTypeFilter}>
//                   <SelectTrigger className="h-9 w-full sm:w-32">
//                     <SelectValue placeholder="Type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Types</SelectItem>
//                     <SelectItem value="General">General</SelectItem>
//                     <SelectItem value="ICU">ICU</SelectItem>
//                     <SelectItem value="Pediatric">Pediatric</SelectItem>
//                     <SelectItem value="Emergency">Emergency</SelectItem>
//                     <SelectItem value="Maternity">Maternity</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <div className="flex rounded-md border self-start sm:self-auto">
//                   <Button
//                     variant={viewMode === "grid" ? "default" : "ghost"}
//                     size="icon"
//                     className="h-9 w-9 rounded-r-none"
//                     onClick={() => setViewMode("grid")}
//                   >
//                     <LayoutGrid className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant={viewMode === "floor" ? "default" : "ghost"}
//                     size="icon"
//                     className="h-9 w-9 rounded-l-none"
//                     onClick={() => setViewMode("floor")}
//                   >
//                     <Map className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             <TabsContent value="beds">
//               {viewMode === "grid" ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//                {filteredBeds.map(bed => {
//   console.log("BED DATA:", bed); // ✅ ADD HERE

//   return (
//     <BedCard
//       key={bed.id}
//       bed={bed}
//       onAssign={() => {}}
//       onSelect={handleSelect}
//       onDischarge={handleDischarge}
//       onTransfer={(b) => setTransferBed(b)}
//       onMarkCleaning={handleMarkAvailable}
//     />
//   );
// })}
//                 </div>
//               ) : (
//                 <FloorPlan beds={filteredBeds} onSelect={handleSelect} />
//               )}
//               {filteredBeds.length === 0 && (
//                 <div className="text-center py-12 text-muted-foreground">
//                   No beds match your filters.
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="heatmap">
//               <OccupancyHeatmap wards={wards} />
//             </TabsContent>
//             <TabsContent value="handover">
//               <ShiftHandover beds={localBeds} />
//             </TabsContent>
//             <TabsContent value="analytics">
//               <PredictiveChart forecast={forecast} beds={localBeds} />
//             </TabsContent>
//           </Tabs>
//         </div>
//       </main>

//       {/* Dialogs */}
//       <BedDetailPanel
//         bed={selectedBed}
//         open={detailOpen}
//         onClose={() => setDetailOpen(false)}
//         onDischarge={(b) => { setDetailOpen(false); handleDischarge(b); }}
//         onTransfer={(b) => { setDetailOpen(false); setTransferBed(b); }}
//       />
//       <TransferDialog
//         bed={transferBed}
//         open={!!transferBed}
//         onClose={() => setTransferBed(null)}
//         onSuccess={refresh}
//         availableBeds={availableBeds}
//       />

//       {/* Manual Discharge Modal */}
//       <Dialog open={!!manualDischargeBed} onOpenChange={() => setManualDischargeBed(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Discharge Patient</DialogTitle>
//             <DialogDescription>
//               Enter a unique discharge ID and optional notes.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-2">
//             <div>
//               <Label htmlFor="dischargeId">Discharge ID *</Label>
//               <Input
//                 id="dischargeId"
//                 placeholder="e.g., DISC-1775107620404-1"
//                 value={dischargeIdInput}
//                 onChange={(e) => setDischargeIdInput(e.target.value)}
//               />
//             </div>
//             <div>
//               <Label htmlFor="notes">Discharge Notes (optional)</Label>
//               <Input
//                 id="notes"
//                 placeholder="Clinical notes..."
//                 value={dischargeNotesInput}
//                 onChange={(e) => setDischargeNotesInput(e.target.value)}
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setManualDischargeBed(null)}>Cancel</Button>
//             <Button onClick={performDischarge} disabled={discharging}>
//               {discharging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Confirm Discharge
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

'use client';

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWardData, Bed, BedStatus } from "../../../data/wardData";
import { BedCard } from "../../../data/BedCard";
import { FloorPlan } from "../../../data/FloorPlan";
import { BedDetailPanel } from "../../../data/BedDetailPanel";
import { TransferDialog } from "../../../data/ADTDialogs";
import { OccupancyHeatmap } from "../../../data/OccupancyHeatmap";
import { ShiftHandover } from "../../../data/ShiftHandover";
import { PredictiveChart } from "../../../data/PredictiveChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BedDouble, Activity, Search, LayoutGrid, Map, BarChart3,
  ClipboardList, TrendingUp, RefreshCw, Loader2, Menu, X
} from "lucide-react";
import { patchBed } from "@/lib/api/bed-config";
import AdminSidebar from "@/components/admin/Sidebar";
import HelpDeskSidebar from "@/components/helpdesk/HelpDeskSidebar";
import Header from "@/components/admin/Header";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type ViewMode = "grid" | "floor";

export default function WardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [transferBed, setTransferBed] = useState<Bed | null>(null);
  
  const [manualDischargeBed, setManualDischargeBed] = useState<Bed | null>(null);
  const [dischargeIdInput, setDischargeIdInput] = useState('');
  const [dischargeNotesInput, setDischargeNotesInput] = useState('');
  const [discharging, setDischarging] = useState(false);

  const [userRole, setUserRole] = useState<string | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserRole(parsed.role);
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  const { beds, wards, forecast, loading, error, refresh } = useWardData();
  
  const [localBeds, setLocalBeds] = useState<Bed[]>([]);
  const fetchedPatientRef = useRef<Set<string>>(new Set());

  // Normalize patient data from backend to match BedCard expectations
 const normalizePatient = (patient: any) => {
  if (!patient) return undefined;
  const name = patient.full_name_en || patient.patient_name || patient.name || '—';
  return {
    name,
    initials: patient.initials || name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
    mrn: patient.patient_id || patient.mrn,
    gender: patient.gender || 'Unknown',
    age: patient.age ?? '?',
    phone: patient.phone || '',
    diagnosis: patient.diagnosis || '',
    admissionDate: patient.admission_date || patient.admissionDate,
    // Add missing required fields with empty defaults
    estimatedDischarge: '',
    contact: '',
    specialRequirements: '',
  };
};

  // Enrich a single bed with patient data from API if needed
  const enrichBedWithPatient = async (bed: Bed): Promise<Bed> => {
  // Treat placeholder as missing data – fetch real patient for occupied beds
  const hasPlaceholder = bed.patient && (bed.patient.name === 'Unknown' || bed.patient.name === '—' || bed.patient.name === 'patient');
  
  if (bed.status !== 'occupied') return bed;
  if (!hasPlaceholder && bed.patient) return bed; // already has real patient data
  if (fetchedPatientRef.current.has(bed.id)) return bed;
  fetchedPatientRef.current.add(bed.id);

  try {
    const res = await fetch(`/api/bed-config/beds/${bed.id}/current-patient`);
    const data = await res.json();
    console.log(`📡 API response for bed ${bed.id}:`, data);
    if (data.success && data.data) {
      const patient = normalizePatient(data.data);
      console.log(`👤 Normalized patient for bed ${bed.id}:`, patient);
      return { ...bed, patient };
    } else {
      // No active patient – clear placeholder
      return { ...bed, patient: undefined };
    }
  } catch (err) {
    console.error(`Error fetching patient for bed ${bed.id}:`, err);
    return bed;
  }
};

  // Normalize and enrich beds when they change
  useEffect(() => {
    const processBeds = async () => {
      // First normalize patient data from original beds
      const normalized = beds.map(bed => ({
        ...bed,
        patient: normalizePatient(bed.patient)
      }));
      // Then enrich any occupied beds without patient data
      const enriched = await Promise.all(normalized.map(bed => enrichBedWithPatient(bed)));
      setLocalBeds(enriched);
    };
    if (beds.length) {
      processBeds();
    }
  }, [beds]);

  // Handlers for HelpDeskSidebar props
  const handleBillingClick = () => router.push('/helpdesk/billing');
  const handleRoomAvailabilityClick = () => router.push('/admin/bed-management');
  const handleDoctorSlotsClick = () => router.push('/helpdesk/doctor-slots');

  const stats = useMemo(() => {
    const currentBeds = localBeds;
    const total = currentBeds.length;
    const occupied = currentBeds.filter(b => b.status === "occupied").length;
    const available = currentBeds.filter(b => b.status === "available").length;
    const cleaning = currentBeds.filter(b => b.status === "cleaning").length;
    const maintenance = currentBeds.filter(b => b.status === "maintenance").length;
    const reserved = currentBeds.filter(b => b.status === "reserved").length;
    
    const predictedOccupancy = forecast.length > 0 
      ? forecast[forecast.length - 1]?.occupancy + "%"
      : "82%";
    
    return { total, occupied, available, cleaning, maintenance, reserved, predictedOccupancy };
  }, [localBeds, forecast]);

  const filteredBeds = useMemo(() => {
    return localBeds.filter(b => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (typeFilter !== "all" && b.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return b.number.toLowerCase().includes(q) ||
          b.patient?.name?.toLowerCase().includes(q) ||
          b.patient?.mrn?.toLowerCase().includes(q) ||
          b.ward.toLowerCase().includes(q);
      }
      return true;
    });
  }, [localBeds, statusFilter, typeFilter, search]);

  const availableBeds = localBeds.filter(b => b.status === "available");

  const handleSelect = (bed: Bed) => { 
    setSelectedBed(bed); 
    setDetailOpen(true); 
  };

  const handleDischarge = (bed: Bed) => {
    setManualDischargeBed(bed);
    setDischargeIdInput('');
    setDischargeNotesInput('');
  };

  const performDischarge = async () => {
    if (!manualDischargeBed) return;
    if (!dischargeIdInput.trim()) {
      toast.error('Please enter a discharge ID');
      return;
    }

    setDischarging(true);
    try {
      const bedId = manualDischargeBed.id;
      const admRes = await fetch(`/api/helpdesk/admissions?bedId=${bedId}&status=active`);
      const admData = await admRes.json();
      if (!admData.success || admData.data.length === 0) {
        throw new Error('No active admission found for this bed');
      }
      const admissionId = admData.data[0].id;

      const res = await fetch('/api/helpdesk/admissions/discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admissionId,
          dischargeId: dischargeIdInput,
          dischargeNotes: dischargeNotesInput,
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      toast.success('Patient discharged successfully');
      // Clear cache and refresh
      fetchedPatientRef.current.clear();
      await refresh();
      setManualDischargeBed(null);
    } catch (err: any) {
      toast.error(err.message || 'Discharge failed');
    } finally {
      setDischarging(false);
    }
  };

  const handleTransfer = async (bed: Bed, destId: string) => {
    try {
      setLocalBeds(prev => {
        const updated = [...prev];
        const srcIdx = updated.findIndex(b => b.id === bed.id);
        const dstIdx = updated.findIndex(b => b.id === destId);
        
        if (srcIdx >= 0 && dstIdx >= 0) {
          updated[dstIdx] = { 
            ...updated[dstIdx], 
            status: "occupied", 
            patient: updated[srcIdx].patient, 
            vitals: updated[srcIdx].vitals, 
            notes: updated[srcIdx].notes, 
            recentlyChanged: true 
          };
          updated[srcIdx] = { 
            ...updated[srcIdx], 
            status: "cleaning", 
            patient: undefined, 
            vitals: undefined, 
            notes: [], 
            recentlyChanged: true 
          };
        }
        return updated;
      });

      const srcId = parseInt(bed.id);
      const dstId = parseInt(destId);
      
      await patchBed(srcId, { status: "cleaning" });
      
      if (bed.patient) {
        await patchBed(dstId, {
          status: "occupied",
          attributes: {
            patient_name: bed.patient.name,
            patient_initials: bed.patient.initials,
            mrn: bed.patient.mrn,
            admission_date: bed.patient.admissionDate,
          }
        });
      }

      toast.success("Patient transferred", {
        description: `Transfer from Bed ${bed.number} complete`
      });
      fetchedPatientRef.current.clear();
      await refresh();
    } catch (error) {
      setLocalBeds(beds.map(b => ({ ...b, patient: b.patient })));
      toast.error("Failed to transfer patient");
    }
  };

  const handleMarkAvailable = async (bed: Bed) => {
    try {
      setLocalBeds(prev => prev.map(b => b.id === bed.id ? { 
        ...b, 
        status: "available" as BedStatus, 
        patient: undefined,
        recentlyChanged: true 
      } : b));

      const bedId = parseInt(bed.id);
      await patchBed(bedId, { status: "available" });

      toast.success("Bed available", {
        description: `Bed ${bed.number} is now available`
      });
      fetchedPatientRef.current.clear();
      await refresh();
    } catch (error) {
      setLocalBeds(beds.map(b => ({ ...b, patient: b.patient })));
      toast.error("Failed to update bed status");
    }
  };

  const statCards = [
    { label: "Total Beds", value: stats.total, icon: BedDouble, filter: "all" },
    { label: "Occupied", value: stats.occupied, icon: Activity, filter: "occupied", color: "text-status-occupied" },
    { label: "Available", value: stats.available, icon: BedDouble, filter: "available", color: "text-status-available" },
    { label: "Cleaning", value: stats.cleaning, icon: BedDouble, filter: "cleaning", color: "text-status-cleaning" },
    { label: "Maintenance", value: stats.maintenance, icon: BedDouble, filter: "maintenance", color: "text-status-maintenance" },
    { label: "Reserved", value: stats.reserved, icon: BedDouble, filter: "reserved", color: "text-status-reserved" },
    { label: "Predicted", value: stats.predictedOccupancy, icon: BarChart3, filter: "all" },
  ];

  if (loading && localBeds.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {userRole === 'helpdesk' ? (
          <HelpDeskSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onBillingClick={handleBillingClick}
            onRoomAvailabilityClick={handleRoomAvailabilityClick}
            onDoctorSlotsClick={handleDoctorSlotsClick}
          />
        ) : (
          <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading ward data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {userRole === 'helpdesk' ? (
        <HelpDeskSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onBillingClick={handleBillingClick}
          onRoomAvailabilityClick={handleRoomAvailabilityClick}
          onDoctorSlotsClick={handleDoctorSlotsClick}
        />
      ) : (
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col overflow-y-auto">
        <Header />

        <div className="p-5 lg:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ward & Bed Management
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Real‑time bed availability, occupancy, and ADT workflows
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {statCards.map((s) => (
              <button
                key={s.label}
                onClick={() => setStatusFilter(s.filter === "all" ? "all" : s.filter)}
                className="rounded-lg border bg-background p-2.5 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon className={`h-3.5 w-3.5 ${s.color || "text-muted-foreground"}`} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
                </div>
                <p className={`text-xl font-bold ${s.color || "text-foreground"}`}>{s.value}</p>
              </button>
            ))}
          </div>

          <Tabs defaultValue="beds" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <TabsList>
                <TabsTrigger value="beds"><BedDouble className="h-4 w-4 mr-1" /> Beds</TabsTrigger>
                <TabsTrigger value="heatmap"><BarChart3 className="h-4 w-4 mr-1" /> Heatmap</TabsTrigger>
                <TabsTrigger value="handover"><ClipboardList className="h-4 w-4 mr-1" /> Handover</TabsTrigger>
                <TabsTrigger value="analytics"><TrendingUp className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bed, patient, MRN…"
                    className="pl-9 h-9 w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="Pediatric">Pediatric</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Maternity">Maternity</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex rounded-md border self-start sm:self-auto">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="h-9 w-9 rounded-r-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "floor" ? "default" : "ghost"}
                    size="icon"
                    className="h-9 w-9 rounded-l-none"
                    onClick={() => setViewMode("floor")}
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value="beds">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {filteredBeds.map(bed => (
                    <BedCard
                      key={bed.id}
                      bed={bed}
                      onAssign={() => {}}
                      onSelect={handleSelect}
                      onDischarge={handleDischarge}
                      onTransfer={(b) => setTransferBed(b)}
                      onMarkCleaning={handleMarkAvailable}
                    />
                  ))}
                </div>
              ) : (
                <FloorPlan beds={filteredBeds} onSelect={handleSelect} />
              )}
              {filteredBeds.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No beds match your filters.
                </div>
              )}
            </TabsContent>

            <TabsContent value="heatmap">
              <OccupancyHeatmap wards={wards} />
            </TabsContent>
            <TabsContent value="handover">
              <ShiftHandover beds={localBeds} />
            </TabsContent>
            <TabsContent value="analytics">
              <PredictiveChart forecast={forecast} beds={localBeds} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BedDetailPanel
        bed={selectedBed}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onDischarge={(b) => { setDetailOpen(false); handleDischarge(b); }}
        onTransfer={(b) => { setDetailOpen(false); setTransferBed(b); }}
      />
      <TransferDialog
        bed={transferBed}
        open={!!transferBed}
        onClose={() => setTransferBed(null)}
        onSuccess={refresh}
        availableBeds={availableBeds}
      />

      <Dialog open={!!manualDischargeBed} onOpenChange={() => setManualDischargeBed(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discharge Patient</DialogTitle>
            <DialogDescription>
              Enter a unique discharge ID and optional notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="dischargeId">Discharge ID *</Label>
              <Input
                id="dischargeId"
                placeholder="e.g., DISC-1775107620404-1"
                value={dischargeIdInput}
                onChange={(e) => setDischargeIdInput(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Discharge Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Clinical notes..."
                value={dischargeNotesInput}
                onChange={(e) => setDischargeNotesInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualDischargeBed(null)}>Cancel</Button>
            <Button onClick={performDischarge} disabled={discharging}>
              {discharging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Discharge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}