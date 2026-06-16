// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import toast from "react-hot-toast";
// import Sidebar from "@/components/admin/Sidebar";
// import { BedBulkImportExport } from "@/components/admin/BedBulkImportExport";
// import { useTenant } from "@/contexts/TenantContext";
// import { MODULE_KEYS, ADMIN_FEATURES } from "@/lib/feature";
// import { useRouter } from "next/navigation";

// import {
//   Building2,
//   Plus,
//   Edit,
//   Trash2,
//   Layers,
//   BedDouble,
//   X,
//   Menu,
//   Download,
//   RefreshCw,
// } from "lucide-react";

// // API functions (import as before)
// import {
//   getFloors,
//   createFloor,
//   deleteFloor,
//   updateFloor,
//   getWards,
//   createWard,
//   updateWard,
//   deleteWard,
//   getBeds,
//   createBeds,
//   patchBed,
//   deleteBed,
// } from "@/lib/api/bed-config";

// // Types
// type Floor = {
//   id: number;
//   floor_number: number;
//   name: string | null;
//   created_at: string;
//   updated_at: string;
// };

// type WardType =
//   | "General"
//   | "Semi-Special"
//   | "Special"
//   | "VIP"
//   | "ICU"
//   | "Pediatric"
//   | "Emergency";
// type PatientCategory = "Male" | "Female" | "Children" | "Mixed";
// type BedStatus =
//   | "available"
//   | "occupied"
//   | "cleaning"
//   | "maintenance"
//   | "reserved";

// type Ward = {
//   id: number;
//   floor_id: number;
//   name: string;
//   type: WardType;
//   patient_category: PatientCategory;
//   description: string | null;
//   daily_rate: number;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// };

// type Bed = {
//   id: number;
//   ward_id: number;
//   room_id: number | null;
//   bed_number: string;
//   type: WardType;
//   floor_number: number;
//   status: BedStatus;
//   patient_category: PatientCategory;
//   attributes: Record<string, any> | null;
//   is_active: boolean;
//   created_at: string;
//   updated_at: string;
// };

// // Helper to extract data from API responses
// const safeExtractData = (response: any) => {
//   if (!response?.data) return [];
//   if (Array.isArray(response.data)) return response.data;
//   if (response.data.data && Array.isArray(response.data.data))
//     return response.data.data;
//   if (response.data.success && Array.isArray(response.data.data))
//     return response.data.data;
//   console.warn("Unexpected API response format:", response.data);
//   return [];
// };

// const getResponseData = (response: any) => {
//   if (!response) return null;
//   if (response.data) {
//     if (response.data.data) return response.data.data;
//     return response.data;
//   }
//   return response;
// };

// export default function BedConfigurationPage() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // Data
//   const [floors, setFloors] = useState<Floor[]>([]);
//   const [wards, setWards] = useState<Ward[]>([]);
//   const [beds, setBeds] = useState<Bed[]>([]);
//   const [editWardRate, setEditWardRate] = useState<number>(0);

//   // Selection
//   const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
//   const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
//   const [newWardRate, setNewWardRate] = useState<number>(0);

//   // Inline forms
//   const [newFloorNumber, setNewFloorNumber] = useState("");
//   const [newFloorName, setNewFloorName] = useState("");
//   const [editFloorId, setEditFloorId] = useState<number | null>(null);
//   const [editFloorNumber, setEditFloorNumber] = useState("");
//   const [editFloorName, setEditFloorName] = useState("");

//   const [newWardName, setNewWardName] = useState("");
//   const [newWardType, setNewWardType] = useState<WardType>("General");
//   const [newWardCategory, setNewWardCategory] =
//     useState<PatientCategory>("Mixed");
//   const [newWardDesc, setNewWardDesc] = useState("");
//   const [editWardId, setEditWardId] = useState<number | null>(null);
//   const [editWardName, setEditWardName] = useState("");
//   const [editWardType, setEditWardType] = useState<WardType>("General");
//   const [editWardCategory, setEditWardCategory] =
//     useState<PatientCategory>("Mixed");
//   const [editWardDesc, setEditWardDesc] = useState("");

//   const [newBedCount, setNewBedCount] = useState(5);
//   const [newBedPrefix, setNewBedPrefix] = useState("");
//   const [newRoomNumber, setNewRoomNumber] = useState("");
//   const [newBedCategory, setNewBedCategory] = useState<PatientCategory | "">(
//     "",
//   );

//   const router = useRouter();
// const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

// const isBedConfigEnabled = isMicroFeatureEnabled(
//   MODULE_KEYS.ADMIN,
//   ADMIN_FEATURES.BED_CONFIGURATION
// );

// useEffect(() => {
//   if (!tenantLoading && !isBedConfigEnabled) {
//     router.push("/unauthorized");
//   }
// }, [tenantLoading]);

//   // Load floors on mount
//   useEffect(() => {
//     loadFloors();
//   }, []);

//   // Load wards when floor changes
//   useEffect(() => {
//     if (selectedFloor) {
//       loadWards(selectedFloor.id);
//     } else {
//       setWards([]);
//       setSelectedWard(null);
//     }
//   }, [selectedFloor]);

//   // Load beds when ward changes
//   useEffect(() => {
//     if (selectedWard) {
//       loadBeds(selectedWard.id);
//     } else {
//       setBeds([]);
//     }
//   }, [selectedWard]);

//   // API functions
//   const loadFloors = async () => {
//     try {
//       setIsLoading(true);
//       const res = await getFloors();
//       setFloors(safeExtractData(res));
//     } catch (error) {
//       toast.error("Failed to load floors");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadWards = async (floorId: number) => {
//     try {
//       const res = await getWards(floorId);
//       setWards(safeExtractData(res));
//     } catch (error) {
//       toast.error("Failed to load wards");
//     }
//   };

//   const loadBeds = async (wardId: number) => {
//     try {
//       const res = await getBeds({ ward_id: wardId });
//       setBeds(safeExtractData(res));
//     } catch (error) {
//       toast.error("Failed to load beds");
//     }
//   };

//   // Floor handlers
//   const handleAddFloor = async () => {
//     if (!newFloorNumber) {
//       toast.error("Floor number required");
//       return;
//     }
//     try {
//       setIsLoading(true);
//       const res = await createFloor({
//         floor_number: parseInt(newFloorNumber),
//         name: newFloorName || undefined,
//       });
//       const data = getResponseData(res);
//       if (data?.id) {
//         setFloors([...floors, data]);
//         setNewFloorNumber("");
//         setNewFloorName("");
//         toast.success("Floor added");
//       } else {
//         throw new Error("Failed to add floor");
//       }
//     } catch (error) {
//       toast.error("Failed to add floor");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateFloor = async () => {
//     if (!editFloorId || !editFloorNumber) return;
//     try {
//       setIsLoading(true);
//       const res = await updateFloor(editFloorId, {
//         floor_number: parseInt(editFloorNumber),
//         name: editFloorName || null,
//       });
//       const data = getResponseData(res);
//       if (data?.id) {
//         setFloors(floors.map((f) => (f.id === editFloorId ? data : f)));
//         if (selectedFloor?.id === editFloorId) setSelectedFloor(data);
//         setEditFloorId(null);
//         toast.success("Floor updated");
//       } else {
//         throw new Error("Update failed");
//       }
//     } catch (error) {
//       toast.error("Failed to update floor");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteFloor = async (floorId: number) => {
//     // 🔄 First, make sure we have the latest wards for this floor
//     if (selectedFloor?.id === floorId) {
//       await loadWards(floorId);
//     } else {
//       // If the floor isn't currently selected, load its wards separately
//       try {
//         const res = await getWards(floorId);
//         const freshWards = safeExtractData(res);
//         if (freshWards.length > 0) {
//           toast.error(
//             "Cannot delete floor. Please delete all wards in this floor first.",
//           );
//           return;
//         }
//       } catch (err) {
//         // ignore – we'll rely on the API's own check
//       }
//     }

//     // Now check if any wards exist (using the fresh state)
//     const wardsInFloor = wards.filter((w) => w.floor_id === floorId);
//     if (wardsInFloor.length > 0) {
//       toast.error(
//         "Cannot delete floor. Please delete all wards in this floor first.",
//       );
//       return;
//     }

//     if (
//       !confirm(
//         "Delete this floor? This will also delete all wards and beds in this floor.",
//       )
//     )
//       return;
//     try {
//       setIsLoading(true);
//       await deleteFloor(floorId);
//       setFloors(floors.filter((f) => f.id !== floorId));
//       if (selectedFloor?.id === floorId) {
//         setSelectedFloor(null);
//         setSelectedWard(null);
//       }
//       toast.success("Floor deleted");
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || "Failed to delete floor");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Ward handlers
//   const handleAddWard = async () => {
//     if (!selectedFloor) {
//       toast.error("Select a floor first");
//       return;
//     }
//     if (!newWardName) {
//       toast.error("Ward name required");
//       return;
//     }
//     try {
//       setIsLoading(true);
//       const res = await createWard({
//         floor_id: selectedFloor.id,
//         name: newWardName,
//         type: newWardType,
//         patient_category: newWardCategory,
//         description: newWardDesc || null,
//         daily_rate: newWardRate,
//       });
//       const data = getResponseData(res);
//       if (data?.id) {
//         setWards([...wards, data]);
//         setNewWardName("");
//         setNewWardType("General");
//         setNewWardCategory("Mixed");
//         setNewWardDesc("");
//         toast.success("Ward added");
//       } else {
//         throw new Error("Add failed");
//       }
//     } catch (error) {
//       toast.error("Failed to add ward");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateWard = async () => {
//     if (!editWardId) return;
//     try {
//       setIsLoading(true);
//       const res = await updateWard(editWardId, {
//         name: editWardName,
//         type: editWardType,
//         patient_category: editWardCategory,
//         description: editWardDesc || null,
//         daily_rate: editWardRate,
//       });
//       const data = getResponseData(res);
//       if (data?.id) {
//         setWards(wards.map((w) => (w.id === editWardId ? data : w)));
//         if (selectedWard?.id === editWardId) setSelectedWard(data);
//         setEditWardId(null);
//         toast.success("Ward updated");
//       } else {
//         throw new Error("Update failed");
//       }
//     } catch (error) {
//       toast.error("Failed to update ward");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteWard = async (wardId: number) => {
//     if (!confirm("Delete this ward and all its beds?")) return;
//     try {
//       setIsLoading(true);
//       await deleteWard(wardId);
//       // Reload wards to ensure consistency
//       if (selectedFloor) {
//         await loadWards(selectedFloor.id);
//       } else {
//         // If no floor selected, just filter locally
//         setWards(wards.filter((w) => w.id !== wardId));
//       }
//       if (selectedWard?.id === wardId) setSelectedWard(null);
//       toast.success("Ward deleted");
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || "Failed to delete ward");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Bed handlers
//   const handleAddBeds = async () => {
//     if (!selectedWard) {
//       toast.error("Select a ward first");
//       return;
//     }
//     try {
//       setIsLoading(true);
//       // Prepare attributes – store room number if provided
//       const attributes: Record<string, any> = {};
//       if (newRoomNumber) attributes.room_number = newRoomNumber;
//       if (newBedCategory) attributes.patient_category = newBedCategory;

//       const res = await createBeds({
//         ward_id: selectedWard.id,
//         count: newBedCount,
//         prefix: newBedPrefix || undefined,
//         attributes,
//       });
//       const data = getResponseData(res);
//       if (Array.isArray(data) && data.length) {
//         await loadBeds(selectedWard.id);
//         setNewBedCount(5);
//         setNewBedPrefix("");
//         setNewRoomNumber("");
//         setNewBedCategory("");
//         toast.success(`${data.length} beds added`);
//       } else {
//         throw new Error("No beds created");
//       }
//     } catch (error) {
//       toast.error("Failed to add beds");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpdateBedStatus = async (bedId: number, status: BedStatus) => {
//     const bed = beds.find((b) => b.id === bedId);
//     if (bed?.status === "occupied") {
//       toast.error("Cannot change status of an occupied bed");
//       return;
//     }
//     try {
//       const res = await patchBed(bedId, { status });
//       const data = getResponseData(res);
//       if (data?.id) {
//         setBeds(beds.map((b) => (b.id === bedId ? data : b)));
//         toast.success(`Bed status updated to ${status}`);
//       } else {
//         toast.error("Failed to update bed status");
//       }
//     } catch (error) {
//       toast.error("Failed to update bed status");
//     }
//   };

//   const handleDeleteBed = async (bedId: number) => {
//     if (!confirm("Delete this bed?")) return;
//     try {
//       await deleteBed(bedId);
//       setBeds(beds.filter((b) => b.id !== bedId));
//       toast.success("Bed deleted");
//     } catch (error) {
//       toast.error("Failed to delete bed");
//     }
//   };

//   // Filter wards for selected floor
//   const filteredWards = wards.filter(
//     (w) => w.floor_id === selectedFloor?.id && w.is_active,
//   );
//   const filteredBeds = beds.filter(
//     (b) => b.ward_id === selectedWard?.id && b.is_active,
//   );

//   if (!tenantLoading && !isBedConfigEnabled) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="text-center">
//         <div className="text-red-500 text-6xl mb-4">🔒</div>
//         <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
//         <p className="text-gray-600">
//           Admin Bed Configuration feature is not enabled for {tenant?.name}.
//         </p>
//       </div>
//     </div>
//   );
// }

//   return (
//     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
//       {/* Mobile menu button */}
//       <button
//         className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg"
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//       >
//         {isSidebarOpen ? (
//           <X className="w-5 h-5" />
//         ) : (
//           <Menu className="w-5 h-5" />
//         )}
//       </button>

//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       <main className="flex-1 flex flex-col overflow-y-auto">
//         <div className="p-5 lg:p-6 space-y-6">
//           {/* Header */}
//           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//             <div>
//               <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
//                 Bed Configuration
//               </h2>
//               <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
//                 Define floors, wards, and beds
//               </p>
//             </div>

//             {/* ✅ Bulk Import/Export - only shown when a ward is selected */}
//             <div className="flex-shrink-0">
//               <BedBulkImportExport
//                 wardId={selectedWard?.id}
//                 onImportSuccess={() => {
//                   if (selectedWard) loadBeds(selectedWard.id);
//                 }}
//               />
//             </div>
//           </div>

//           {/* Loading indicator */}
//           {isLoading && (
//             <div className="flex justify-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//             </div>
//           )}

//           {/* Two-column layout */}
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//             {/* Left: Floors */}
//             <Card className="lg:col-span-1">
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-sm font-medium flex items-center justify-between">
//                   <span className="flex items-center">
//                     <Building2 className="h-4 w-4 mr-2" />
//                     Floors
//                   </span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <div className="flex gap-2">
//                     <Input
//                       placeholder="Floor number"
//                       value={newFloorNumber}
//                       onChange={(e) => setNewFloorNumber(e.target.value)}
//                       className="w-24"
//                     />
//                     <Input
//                       placeholder="Name (optional)"
//                       value={newFloorName}
//                       onChange={(e) => setNewFloorName(e.target.value)}
//                       className="flex-1"
//                     />
//                     <Button
//                       size="icon"
//                       onClick={handleAddFloor}
//                       disabled={isLoading}
//                     >
//                       <Plus className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   {floors.length === 0 ? (
//                     <p className="text-sm text-muted-foreground text-center">
//                       No floors yet
//                     </p>
//                   ) : (
//                     floors.map((floor) => (
//                       <div
//                         key={floor.id}
//                         className={`flex items-center justify-between p-2 rounded-md border ${
//                           selectedFloor?.id === floor.id
//                             ? "bg-muted border-primary"
//                             : "bg-card"
//                         }`}
//                       >
//                         <div
//                           className="flex-1 cursor-pointer"
//                           onClick={() => setSelectedFloor(floor)}
//                         >
//                           <p className="font-medium">
//                             Floor {floor.floor_number}
//                           </p>
//                           {floor.name && (
//                             <p className="text-xs text-muted-foreground">
//                               {floor.name}
//                             </p>
//                           )}
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="h-7 w-7"
//                             onClick={() => {
//                               setEditFloorId(floor.id);
//                               setEditFloorNumber(floor.floor_number.toString());
//                               setEditFloorName(floor.name || "");
//                             }}
//                           >
//                             <Edit className="h-3.5 w-3.5" />
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="h-7 w-7"
//                             onClick={() => handleDeleteFloor(floor.id)}
//                           >
//                             <Trash2 className="h-3.5 w-3.5 text-red-500" />
//                           </Button>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Right: Wards and Beds */}
//             <div className="lg:col-span-3 space-y-6">
//               {selectedFloor ? (
//                 <>
//                   {/* Wards */}
//                   <Card>
//                     <CardHeader className="pb-3">
//                       <CardTitle className="text-sm font-medium flex items-center justify-between">
//                         <span className="flex items-center">
//                           <Layers className="h-4 w-4 mr-2" />
//                           Wards on Floor {selectedFloor.floor_number}
//                         </span>
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
//                         <Input
//                           placeholder="Ward name"
//                           value={newWardName}
//                           onChange={(e) => setNewWardName(e.target.value)}
//                           className="w-full"
//                         />
//                         <Select
//                           value={newWardType}
//                           onValueChange={(v) => setNewWardType(v as WardType)}
//                         >
//                           <SelectTrigger className="w-full">
//                             <SelectValue placeholder="Type" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="General">General</SelectItem>
//                             <SelectItem value="Semi-Special">
//                               Semi-Special
//                             </SelectItem>
//                             <SelectItem value="Special">Special</SelectItem>
//                             <SelectItem value="VIP">VIP</SelectItem>
//                             <SelectItem value="ICU">ICU</SelectItem>
//                             <SelectItem value="Pediatric">Pediatric</SelectItem>
//                              <SelectItem value="Emergency">Emergency</SelectItem> 
//                           </SelectContent>
//                         </Select>
//                         <Select
//                           value={newWardCategory}
//                           onValueChange={(v) =>
//                             setNewWardCategory(v as PatientCategory)
//                           }
//                         >
//                           <SelectTrigger className="w-full">
//                             <SelectValue placeholder="Category" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="Male">Male</SelectItem>
//                             <SelectItem value="Female">Female</SelectItem>
//                             <SelectItem value="Children">Children</SelectItem>
//                             <SelectItem value="Mixed">Mixed</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <Input
//                           placeholder="Description"
//                           value={newWardDesc}
//                           onChange={(e) => setNewWardDesc(e.target.value)}
//                           className="w-full"
//                         />
//                         <Input
//                           type="number"
//                           placeholder="Rate (₹/day)"
//                           value={newWardRate}
//                           onChange={(e) =>
//                             setNewWardRate(parseFloat(e.target.value) || 0)
//                           }
//                           className="w-full"
//                         />
//                         <Button
//                           onClick={handleAddWard}
//                           disabled={isLoading}
//                           className="w-full"
//                         >
//                           <Plus className="h-4 w-4 mr-1" /> Add
//                         </Button>
//                       </div>

//                       {filteredWards.length === 0 ? (
//                         <p className="text-sm text-muted-foreground text-center">
//                           No wards. Add one above.
//                         </p>
//                       ) : (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                           {filteredWards.map((ward) => (
//                             <div
//                               key={ward.id}
//                               className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
//                                 selectedWard?.id === ward.id
//                                   ? "border-primary bg-muted"
//                                   : ""
//                               }`}
//                               onClick={() => setSelectedWard(ward)}
//                             >
//                               <div>
//                                 <p className="font-medium">{ward.name}</p>
//                                 <div className="flex gap-2 text-xs text-muted-foreground">
//                                   <span>{ward.type}</span>
//                                   <span>•</span>
//                                   <span>{ward.patient_category}</span>
//                                 </div>
//                                 {ward.description && (
//                                   <p className="text-xs text-muted-foreground mt-1">
//                                     {ward.description}
//                                   </p>
//                                 )}
//                               </div>
//                               <div className="flex items-center gap-1">
//                                 <Button
//                                   variant="ghost"
//                                   size="icon"
//                                   className="h-7 w-7"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setEditWardId(ward.id);
//                                     setEditWardName(ward.name);
//                                     setEditWardType(ward.type);
//                                     setEditWardCategory(ward.patient_category);
//                                     setEditWardDesc(ward.description || "");
//                                     setEditWardRate(ward.daily_rate);
//                                   }}
//                                 >
//                                   <Edit className="h-3.5 w-3.5" />
//                                 </Button>
//                                 <Button
//                                   variant="ghost"
//                                   size="icon"
//                                   className="h-7 w-7"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleDeleteWard(ward.id);
//                                   }}
//                                 >
//                                   <Trash2 className="h-3.5 w-3.5 text-red-500" />
//                                 </Button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>

//                   {/* Beds */}
//                   {selectedWard && (
//                     <Card>
//                       <CardHeader className="pb-3">
//                         <CardTitle className="text-sm font-medium flex items-center justify-between">
//                           <span className="flex items-center">
//                             <BedDouble className="h-4 w-4 mr-2" />
//                             Beds in {selectedWard.name}
//                           </span>
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent className="space-y-4">
//                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
//                           <Input
//                             type="number"
//                             placeholder="Count"
//                             value={newBedCount}
//                             onChange={(e) =>
//                               setNewBedCount(parseInt(e.target.value) || 1)
//                             }
//                           />
//                           <Input
//                             placeholder="Prefix (e.g., ICU-)"
//                             value={newBedPrefix}
//                             onChange={(e) => setNewBedPrefix(e.target.value)}
//                           />
//                           <Input
//                             placeholder="Room number (optional)"
//                             value={newRoomNumber}
//                             onChange={(e) => setNewRoomNumber(e.target.value)}
//                           />
//                           <Select
//                             value={newBedCategory}
//                             onValueChange={(v) =>
//                               setNewBedCategory(v as PatientCategory)
//                             }
//                           >
//                             <SelectTrigger>
//                               <SelectValue placeholder="Category (optional)" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="Male">Male</SelectItem>
//                               <SelectItem value="Female">Female</SelectItem>
//                               <SelectItem value="Children">Children</SelectItem>
//                               <SelectItem value="Mixed">Mixed</SelectItem>
//                             </SelectContent>
//                           </Select>
//                           <Button
//                             onClick={handleAddBeds}
//                             className="sm:col-span-4"
//                           >
//                             <Plus className="h-4 w-4 mr-1" /> Add {newBedCount}{" "}
//                             bed(s)
//                           </Button>
//                         </div>

//                         {filteredBeds.length === 0 ? (
//                           <p className="text-sm text-muted-foreground text-center">
//                             No beds. Add some above.
//                           </p>
//                         ) : (
//                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                             {filteredBeds.map((bed) => (
//                               <div
//                                 key={bed.id}
//                                 className={`border rounded-lg p-3 space-y-2 ${
//                                   bed.status === "occupied"
//                                     ? "border-blue-300 bg-blue-50/50"
//                                     : bed.status === "cleaning"
//                                       ? "border-yellow-300 bg-yellow-50/50"
//                                       : bed.status === "maintenance"
//                                         ? "border-red-300 bg-red-50/50"
//                                         : bed.status === "reserved"
//                                           ? "border-purple-300 bg-purple-50/50"
//                                           : "border-green-300 bg-green-50/50"
//                                 }`}
//                               >
//                                 <div className="flex justify-between items-start">
//                                   <div>
//                                     <p className="font-bold">
//                                       {bed.bed_number}
//                                     </p>
//                                     {bed.attributes?.room_number && (
//                                       <p className="text-xs text-muted-foreground">
//                                         Room {bed.attributes.room_number}
//                                       </p>
//                                     )}
//                                   </div>
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-6 w-6"
//                                     onClick={() => handleDeleteBed(bed.id)}
//                                     disabled={bed.status === "occupied"}
//                                   >
//                                     <Trash2 className="h-3 w-3 text-red-500" />
//                                   </Button>
//                                 </div>
//                                 {bed.status !== "occupied" && (
//                                   <Select
//                                     value={bed.status}
//                                     onValueChange={(v) =>
//                                       handleUpdateBedStatus(
//                                         bed.id,
//                                         v as BedStatus,
//                                       )
//                                     }
//                                   >
//                                     <SelectTrigger className="h-8 text-xs">
//                                       <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                       <SelectItem value="available">
//                                         Available
//                                       </SelectItem>
//                                       <SelectItem value="occupied">
//                                         Occupied
//                                       </SelectItem>
//                                       <SelectItem value="cleaning">
//                                         Cleaning
//                                       </SelectItem>
//                                       <SelectItem value="maintenance">
//                                         Maintenance
//                                       </SelectItem>
//                                       <SelectItem value="reserved">
//                                         Reserved
//                                       </SelectItem>
//                                     </SelectContent>
//                                   </Select>
//                                 )}
//                                 {bed.status === "occupied" &&
//                                   bed.attributes?.currentPatient && (
//                                     <div className="text-xs bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
//                                       <p className="font-semibold">
//                                         👤 Patient Info
//                                       </p>
//                                       <div className="grid grid-cols-2 gap-1 mt-1">
//                                         <span>Name:</span>
//                                         <span className="font-medium">
//                                           {bed.attributes.currentPatient.name ||
//                                             "N/A"}
//                                         </span>
//                                         <span>MRN:</span>
//                                         <span>
//                                           {bed.attributes.currentPatient.mrn ||
//                                             "N/A"}
//                                         </span>
//                                         {bed.attributes.currentPatient
//                                           .diagnosis && (
//                                           <>
//                                             <span>Diagnosis:</span>
//                                             <span>
//                                               {
//                                                 bed.attributes.currentPatient
//                                                   .diagnosis
//                                               }
//                                             </span>
//                                           </>
//                                         )}
//                                       </div>
//                                     </div>
//                                   )}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </CardContent>
//                     </Card>
//                   )}
//                 </>
//               ) : (
//                 <Card className="p-12 text-center text-muted-foreground">
//                   <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
//                   <p>Select a floor to start configuring wards and beds.</p>
//                 </Card>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Edit Floor Dialog */}
//       {editFloorId && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
//             <h3 className="text-lg font-semibold mb-4">Edit Floor</h3>
//             <div className="space-y-4">
//               <div>
//                 <Label>Floor Number *</Label>
//                 <Input
//                   type="number"
//                   value={editFloorNumber}
//                   onChange={(e) => setEditFloorNumber(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label>Floor Name (optional)</Label>
//                 <Input
//                   value={editFloorName}
//                   onChange={(e) => setEditFloorName(e.target.value)}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-6">
//               <Button variant="outline" onClick={() => setEditFloorId(null)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleUpdateFloor} disabled={isLoading}>
//                 Save
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Ward Dialog */}
//       {editWardId && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
//             <h3 className="text-lg font-semibold mb-4">Edit Ward</h3>
//             <div className="space-y-4">
//               <div>
//                 <Label>Ward Name *</Label>
//                 <Input
//                   value={editWardName}
//                   onChange={(e) => setEditWardName(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label>Ward Type</Label>
//                 <Select
//                   value={editWardType}
//                   onValueChange={(v) => setEditWardType(v as WardType)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="General">General</SelectItem>
//                     <SelectItem value="Semi-Special">Semi-Special</SelectItem>
//                     <SelectItem value="Special">Special</SelectItem>
//                     <SelectItem value="VIP">VIP</SelectItem>
//                     <SelectItem value="ICU">ICU</SelectItem>
//                     <SelectItem value="Pediatric">Pediatric</SelectItem>
//                      <SelectItem value="Emergency">Emergency</SelectItem> 
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <Label>Patient Category</Label>
//                 <Select
//                   value={editWardCategory}
//                   onValueChange={(v) =>
//                     setEditWardCategory(v as PatientCategory)
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Male">Male</SelectItem>
//                     <SelectItem value="Female">Female</SelectItem>
//                     <SelectItem value="Children">Children</SelectItem>
//                     <SelectItem value="Mixed">Mixed</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <Label>Description (optional)</Label>
//                 <Input
//                   value={editWardDesc}
//                   onChange={(e) => setEditWardDesc(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <Label>Daily Rate (₹)</Label>
//                 <Input
//                   type="number"
//                   value={editWardRate}
//                   onChange={(e) =>
//                     setEditWardRate(parseFloat(e.target.value) || 0)
//                   }
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-6">
//               <Button variant="outline" onClick={() => setEditWardId(null)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleUpdateWard} disabled={isLoading}>
//                 Save
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import Sidebar from "@/components/admin/Sidebar";
import { BedBulkImportExport } from "@/components/admin/BedBulkImportExport";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, ADMIN_FEATURES } from "@/lib/feature";
import { useRouter } from "next/navigation";

import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Layers,
  BedDouble,
  X,
  Menu,
  Download,
  RefreshCw,
} from "lucide-react";

// API functions
import {
  getFloors,
  createFloor,
  deleteFloor,
  updateFloor,
  getWards,
  createWard,
  updateWard,
  deleteWard,
  getBeds,
  createBeds,
  patchBed,
  deleteBed,
} from "@/lib/api/bed-config";

// Types
type Floor = {
  id: number;
  floor_number: number;
  name: string | null;
  created_at: string;
  updated_at: string;
};

type WardType =
  | "General"
  | "Semi-Special"
  | "Special"
  | "VIP"
  | "ICU"
  | "Pediatric"
  | "Emergency";
type PatientCategory = "Male" | "Female" | "Children" | "Mixed";
type BedStatus =
  | "available"
  | "occupied"
  | "cleaning"
  | "maintenance"
  | "reserved";

type Ward = {
  id: number;
  floor_id: number;
  name: string;
  type: WardType;
  patient_category: PatientCategory;
  description: string | null;
  daily_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Bed = {
  id: number;
  ward_id: number;
  room_id: number | null;
  bed_number: string;
  type: WardType;
  floor_number: number;
  status: BedStatus;
  patient_category: PatientCategory;
  attributes: Record<string, any> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Helper to extract data from API responses
const safeExtractData = (response: any) => {
  if (!response?.data) return [];
  if (Array.isArray(response.data)) return response.data;
  if (response.data.data && Array.isArray(response.data.data))
    return response.data.data;
  if (response.data.success && Array.isArray(response.data.data))
    return response.data.data;
  console.warn("Unexpected API response format:", response.data);
  return [];
};

const getResponseData = (response: any) => {
  if (!response) return null;
  if (response.data) {
    if (response.data.data) return response.data.data;
    return response.data;
  }
  return response;
};

export default function BedConfigurationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [floors, setFloors] = useState<Floor[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [editWardRate, setEditWardRate] = useState<number>(0);

  // Selection
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [newWardRate, setNewWardRate] = useState<number>(0);

  // Inline forms
  const [newFloorNumber, setNewFloorNumber] = useState("");
  const [newFloorName, setNewFloorName] = useState("");
  const [editFloorId, setEditFloorId] = useState<number | null>(null);
  const [editFloorNumber, setEditFloorNumber] = useState("");
  const [editFloorName, setEditFloorName] = useState("");

  const [newWardName, setNewWardName] = useState("");
  const [newWardType, setNewWardType] = useState<WardType>("General");
  const [newWardCategory, setNewWardCategory] =
    useState<PatientCategory>("Mixed");
  const [newWardDesc, setNewWardDesc] = useState("");
  const [editWardId, setEditWardId] = useState<number | null>(null);
  const [editWardName, setEditWardName] = useState("");
  const [editWardType, setEditWardType] = useState<WardType>("General");
  const [editWardCategory, setEditWardCategory] =
    useState<PatientCategory>("Mixed");
  const [editWardDesc, setEditWardDesc] = useState("");

  const [newBedCount, setNewBedCount] = useState(5);
  const [newBedPrefix, setNewBedPrefix] = useState("");
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newBedCategory, setNewBedCategory] = useState<PatientCategory | "">(
    "",
  );

  const router = useRouter();
const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isBedConfigEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.ADMIN,
  ADMIN_FEATURES.BED_CONFIGURATION
);

useEffect(() => {
  if (!tenantLoading && !isBedConfigEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading]);

  // Load floors on mount
  useEffect(() => {
    loadFloors();
  }, []);

  // Load wards when floor changes
  useEffect(() => {
    if (selectedFloor) {
      loadWards(selectedFloor.id);
    } else {
      setWards([]);
      setSelectedWard(null);
    }
  }, [selectedFloor]);

  // Load beds when ward changes
  useEffect(() => {
    if (selectedWard) {
      loadBeds(selectedWard.id);
    } else {
      setBeds([]);
    }
  }, [selectedWard]);

  // API functions
  const loadFloors = async () => {
    try {
      setIsLoading(true);
      const res = await getFloors();
      setFloors(safeExtractData(res));
    } catch (error) {
      toast.error("Failed to load floors");
    } finally {
      setIsLoading(false);
    }
  };

  const loadWards = async (floorId: number) => {
    try {
      const res = await getWards(floorId);
      setWards(safeExtractData(res));
    } catch (error) {
      toast.error("Failed to load wards");
    }
  };

  const loadBeds = async (wardId: number) => {
    try {
      const res = await getBeds({ ward_id: wardId });
      setBeds(safeExtractData(res));
    } catch (error) {
      toast.error("Failed to load beds");
    }
  };

  // Floor handlers
  const handleAddFloor = async () => {
    if (!newFloorNumber) {
      toast.error("Floor number required");
      return;
    }
    try {
      setIsLoading(true);
      const res = await createFloor({
        floor_number: parseInt(newFloorNumber),
        name: newFloorName || undefined,
      });
      const data = getResponseData(res);
      if (data?.id) {
        setFloors([...floors, data]);
        setNewFloorNumber("");
        setNewFloorName("");
        toast.success("Floor added");
      } else {
        throw new Error("Failed to add floor");
      }
    } catch (error) {
      toast.error("Failed to add floor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFloor = async () => {
    if (!editFloorId || !editFloorNumber) return;
    try {
      setIsLoading(true);
      const res = await updateFloor(editFloorId, {
        floor_number: parseInt(editFloorNumber),
        name: editFloorName || null,
      });
      const data = getResponseData(res);
      if (data?.id) {
        setFloors(floors.map((f) => (f.id === editFloorId ? data : f)));
        if (selectedFloor?.id === editFloorId) setSelectedFloor(data);
        setEditFloorId(null);
        toast.success("Floor updated");
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      toast.error("Failed to update floor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFloor = async (floorId: number) => {
    if (selectedFloor?.id === floorId) {
      await loadWards(floorId);
    } else {
      try {
        const res = await getWards(floorId);
        const freshWards = safeExtractData(res);
        if (freshWards.length > 0) {
          toast.error(
            "Cannot delete floor. Please delete all wards in this floor first.",
          );
          return;
        }
      } catch (err) {
        // ignore
      }
    }

    const wardsInFloor = wards.filter((w) => w.floor_id === floorId);
    if (wardsInFloor.length > 0) {
      toast.error(
        "Cannot delete floor. Please delete all wards in this floor first.",
      );
      return;
    }

    if (
      !confirm(
        "Delete this floor? This will also delete all wards and beds in this floor.",
      )
    )
      return;
    try {
      setIsLoading(true);
      await deleteFloor(floorId);
      setFloors(floors.filter((f) => f.id !== floorId));
      if (selectedFloor?.id === floorId) {
        setSelectedFloor(null);
        setSelectedWard(null);
      }
      toast.success("Floor deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete floor");
    } finally {
      setIsLoading(false);
    }
  };

  // Ward handlers
  const handleAddWard = async () => {
    if (!selectedFloor) {
      toast.error("Select a floor first");
      return;
    }
    if (!newWardName) {
      toast.error("Ward name required");
      return;
    }
    try {
      setIsLoading(true);
      const res = await createWard({
        floor_id: selectedFloor.id,
        name: newWardName,
        type: newWardType,
        patient_category: newWardCategory,
        description: newWardDesc || null,
        daily_rate: newWardRate,
      });
      const data = getResponseData(res);
      if (data?.id) {
        setWards([...wards, data]);
        setNewWardName("");
        setNewWardType("General");
        setNewWardCategory("Mixed");
        setNewWardDesc("");
        toast.success("Ward added");
      } else {
        throw new Error("Add failed");
      }
    } catch (error) {
      toast.error("Failed to add ward");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWard = async () => {
    if (!editWardId) return;
    try {
      setIsLoading(true);
      const res = await updateWard(editWardId, {
        name: editWardName,
        type: editWardType,
        patient_category: editWardCategory,
        description: editWardDesc || null,
        daily_rate: editWardRate,
      });
      const data = getResponseData(res);
      if (data?.id) {
        setWards(wards.map((w) => (w.id === editWardId ? data : w)));
        if (selectedWard?.id === editWardId) setSelectedWard(data);
        setEditWardId(null);
        toast.success("Ward updated");
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      toast.error("Failed to update ward");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWard = async (wardId: number) => {
    if (!confirm("Delete this ward and all its beds?")) return;
    try {
      setIsLoading(true);
      await deleteWard(wardId);
      if (selectedFloor) {
        await loadWards(selectedFloor.id);
      } else {
        setWards(wards.filter((w) => w.id !== wardId));
      }
      if (selectedWard?.id === wardId) setSelectedWard(null);
      toast.success("Ward deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete ward");
    } finally {
      setIsLoading(false);
    }
  };

  // Bed handlers
  const handleAddBeds = async () => {
    if (!selectedWard) {
      toast.error("Select a ward first");
      return;
    }
    try {
      setIsLoading(true);
      const attributes: Record<string, any> = {};
      if (newRoomNumber) attributes.room_number = newRoomNumber;
      if (newBedCategory) attributes.patient_category = newBedCategory;

      const res = await createBeds({
        ward_id: selectedWard.id,
        count: newBedCount,
        prefix: newBedPrefix || undefined,
        attributes,
      });
      const data = getResponseData(res);
      if (Array.isArray(data) && data.length) {
        await loadBeds(selectedWard.id);
        setNewBedCount(5);
        setNewBedPrefix("");
        setNewRoomNumber("");
        setNewBedCategory("");
        toast.success(`${data.length} beds added`);
      } else {
        throw new Error("No beds created");
      }
    } catch (error) {
      toast.error("Failed to add beds");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBedStatus = async (bedId: number, status: BedStatus) => {
    const bed = beds.find((b) => b.id === bedId);
    if (bed?.status === "occupied") {
      toast.error("Cannot change status of an occupied bed");
      return;
    }
    try {
      const res = await patchBed(bedId, { status });
      const data = getResponseData(res);
      if (data?.id) {
        setBeds(beds.map((b) => (b.id === bedId ? data : b)));
        toast.success(`Bed status updated to ${status}`);
      } else {
        toast.error("Failed to update bed status");
      }
    } catch (error) {
      toast.error("Failed to update bed status");
    }
  };

  const handleDeleteBed = async (bedId: number) => {
    if (!confirm("Delete this bed?")) return;
    try {
      await deleteBed(bedId);
      setBeds(beds.filter((b) => b.id !== bedId));
      toast.success("Bed deleted");
    } catch (error) {
      toast.error("Failed to delete bed");
    }
  };

  // Filter wards for selected floor
  const filteredWards = wards.filter(
    (w) => w.floor_id === selectedFloor?.id && w.is_active,
  );
  const filteredBeds = beds.filter(
    (b) => b.ward_id === selectedWard?.id && b.is_active,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/20";
      case "occupied":
        return "border-blue-300 bg-blue-50/50 dark:bg-blue-900/20";
      case "cleaning":
        return "border-amber-300 bg-amber-50/50 dark:bg-amber-900/20";
      case "maintenance":
        return "border-red-300 bg-red-50/50 dark:bg-red-900/20";
      case "reserved":
        return "border-purple-300 bg-purple-50/50 dark:bg-purple-900/20";
      default:
        return "border-gray-300 bg-gray-50/50 dark:bg-gray-800/20";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "occupied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "cleaning":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "maintenance":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "reserved":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300";
    }
  };

  if (!tenantLoading && !isBedConfigEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Admin Bed Configuration feature is not enabled for {tenant?.name}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-gradient-to-r from-[#3B1E6F] to-[#7A329F] hover:from-[#7A329F] hover:to-[#0D5CB3] text-white rounded-full shadow-lg transition-all duration-200"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-5 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[#3B1E6F] dark:text-white">
                Bed Configuration
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Define floors, wards, and beds
              </p>
            </div>

            <div className="flex-shrink-0">
              <BedBulkImportExport
                wardId={selectedWard?.id}
                onImportSuccess={() => {
                  if (selectedWard) loadBeds(selectedWard.id);
                }}
              />
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B1E6F]"></div>
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Floors */}
            <Card className="lg:col-span-1 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center text-[#3B1E6F] dark:text-white">
                    <Building2 className="h-4 w-4 mr-2" />
                    Floors
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Floor number"
                      value={newFloorNumber}
                      onChange={(e) => setNewFloorNumber(e.target.value)}
                      className="w-24 focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                    />
                    <Input
                      placeholder="Name (optional)"
                      value={newFloorName}
                      onChange={(e) => setNewFloorName(e.target.value)}
                      className="flex-1 focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                    />
                    <Button
                      size="icon"
                      onClick={handleAddFloor}
                      disabled={isLoading}
                      className="bg-[#3B1E6F] hover:bg-[#7A329F]"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {floors.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">
                      No floors yet
                    </p>
                  ) : (
                    floors.map((floor) => (
                      <div
                        key={floor.id}
                        className={`flex items-center justify-between p-2 rounded-md border ${
                          selectedFloor?.id === floor.id
                            ? "bg-purple-50 dark:bg-purple-900/20 border-[#7A329F]"
                            : "bg-card"
                        }`}
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedFloor(floor)}
                        >
                          <p className="font-medium text-gray-900 dark:text-white">
                            Floor {floor.floor_number}
                          </p>
                          {floor.name && (
                            <p className="text-xs text-muted-foreground">
                              {floor.name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300"
                            onClick={() => {
                              setEditFloorId(floor.id);
                              setEditFloorNumber(floor.floor_number.toString());
                              setEditFloorName(floor.name || "");
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteFloor(floor.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right: Wards and Beds */}
            <div className="lg:col-span-3 space-y-6">
              {selectedFloor ? (
                <>
                  {/* Wards */}
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <span className="flex items-center text-[#3B1E6F] dark:text-white">
                          <Layers className="h-4 w-4 mr-2" />
                          Wards on Floor {selectedFloor.floor_number}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
                        <Input
                          placeholder="Ward name"
                          value={newWardName}
                          onChange={(e) => setNewWardName(e.target.value)}
                          className="w-full focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                        />
                        <Select
                          value={newWardType}
                          onValueChange={(v) => setNewWardType(v as WardType)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Semi-Special">
                              Semi-Special
                            </SelectItem>
                            <SelectItem value="Special">Special</SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                            <SelectItem value="ICU">ICU</SelectItem>
                            <SelectItem value="Pediatric">Pediatric</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={newWardCategory}
                          onValueChange={(v) =>
                            setNewWardCategory(v as PatientCategory)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Children">Children</SelectItem>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Description"
                          value={newWardDesc}
                          onChange={(e) => setNewWardDesc(e.target.value)}
                          className="w-full focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                        />
                        <Input
                          type="number"
                          placeholder="Rate (₹/day)"
                          value={newWardRate}
                          onChange={(e) =>
                            setNewWardRate(parseFloat(e.target.value) || 0)
                          }
                          className="w-full focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                        />
                        <Button
                          onClick={handleAddWard}
                          disabled={isLoading}
                          className="w-full bg-[#3B1E6F] hover:bg-[#7A329F]"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>

                      {filteredWards.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center">
                          No wards. Add one above.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {filteredWards.map((ward) => (
                            <div
                              key={ward.id}
                              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 ${
                                selectedWard?.id === ward.id
                                  ? "border-[#7A329F] bg-purple-50 dark:bg-purple-900/20"
                                  : ""
                              }`}
                              onClick={() => setSelectedWard(ward)}
                            >
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {ward.name}
                                </p>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  <span>{ward.type}</span>
                                  <span>•</span>
                                  <span>{ward.patient_category}</span>
                                </div>
                                {ward.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {ward.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditWardId(ward.id);
                                    setEditWardName(ward.name);
                                    setEditWardType(ward.type);
                                    setEditWardCategory(ward.patient_category);
                                    setEditWardDesc(ward.description || "");
                                    setEditWardRate(ward.daily_rate);
                                  }}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWard(ward.id);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Beds */}
                  {selectedWard && (
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                          <span className="flex items-center text-[#3B1E6F] dark:text-white">
                            <BedDouble className="h-4 w-4 mr-2" />
                            Beds in {selectedWard.name}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <Input
                            type="number"
                            placeholder="Count"
                            value={newBedCount}
                            onChange={(e) =>
                              setNewBedCount(parseInt(e.target.value) || 1)
                            }
                            className="focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                          />
                          <Input
                            placeholder="Prefix (e.g., ICU-)"
                            value={newBedPrefix}
                            onChange={(e) => setNewBedPrefix(e.target.value)}
                            className="focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                          />
                          <Input
                            placeholder="Room number (optional)"
                            value={newRoomNumber}
                            onChange={(e) => setNewRoomNumber(e.target.value)}
                            className="focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                          />
                          <Select
                            value={newBedCategory}
                            onValueChange={(v) =>
                              setNewBedCategory(v as PatientCategory)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Category (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Children">Children</SelectItem>
                              <SelectItem value="Mixed">Mixed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={handleAddBeds}
                            className="sm:col-span-4 bg-[#3B1E6F] hover:bg-[#7A329F]"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add {newBedCount}{" "}
                            bed(s)
                          </Button>
                        </div>

                        {filteredBeds.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center">
                            No beds. Add some above.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredBeds.map((bed) => (
                              <div
                                key={bed.id}
                                className={`border rounded-lg p-3 space-y-2 ${getStatusColor(bed.status)}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                      {bed.bed_number}
                                    </p>
                                    {bed.attributes?.room_number && (
                                      <p className="text-xs text-muted-foreground">
                                        Room {bed.attributes.room_number}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => handleDeleteBed(bed.id)}
                                    disabled={bed.status === "occupied"}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${getStatusBadgeColor(bed.status)} border-0`}>
                                    {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
                                  </Badge>
                                  {bed.status !== "occupied" && (
                                    <Select
                                      value={bed.status}
                                      onValueChange={(v) =>
                                        handleUpdateBedStatus(
                                          bed.id,
                                          v as BedStatus,
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs flex-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="available">
                                          Available
                                        </SelectItem>
                                        <SelectItem value="occupied">
                                          Occupied
                                        </SelectItem>
                                        <SelectItem value="cleaning">
                                          Cleaning
                                        </SelectItem>
                                        <SelectItem value="maintenance">
                                          Maintenance
                                        </SelectItem>
                                        <SelectItem value="reserved">
                                          Reserved
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                                {bed.status === "occupied" &&
                                  bed.attributes?.currentPatient && (
                                    <div className="text-xs bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                                      <p className="font-semibold text-gray-900 dark:text-white">
                                        👤 Patient Info
                                      </p>
                                      <div className="grid grid-cols-2 gap-1 mt-1 text-gray-700 dark:text-gray-300">
                                        <span>Name:</span>
                                        <span className="font-medium">
                                          {bed.attributes.currentPatient.name ||
                                            "N/A"}
                                        </span>
                                        <span>MRN:</span>
                                        <span>
                                          {bed.attributes.currentPatient.mrn ||
                                            "N/A"}
                                        </span>
                                        {bed.attributes.currentPatient
                                          .diagnosis && (
                                          <>
                                            <span>Diagnosis:</span>
                                            <span>
                                              {
                                                bed.attributes.currentPatient
                                                  .diagnosis
                                              }
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="p-12 text-center text-muted-foreground border-gray-200 dark:border-gray-700">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20 text-[#3B1E6F]" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a floor to start configuring wards and beds.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Floor Dialog */}
      {editFloorId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Floor
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Floor Number *
                </Label>
                <Input
                  type="number"
                  value={editFloorNumber}
                  onChange={(e) => setEditFloorNumber(e.target.value)}
                  className="focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Floor Name (optional)
                </Label>
                <Input
                  value={editFloorName}
                  onChange={(e) => setEditFloorName(e.target.value)}
                  className="focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditFloorId(null)}
                className="border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateFloor}
                disabled={isLoading}
                className="bg-[#3B1E6F] hover:bg-[#7A329F]"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ward Dialog */}
      {editWardId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Ward
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Ward Name *
                </Label>
                <Input
                  value={editWardName}
                  onChange={(e) => setEditWardName(e.target.value)}
                  className="focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Ward Type
                </Label>
                <Select
                  value={editWardType}
                  onValueChange={(v) => setEditWardType(v as WardType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Semi-Special">Semi-Special</SelectItem>
                    <SelectItem value="Special">Special</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="Pediatric">Pediatric</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Patient Category
                </Label>
                <Select
                  value={editWardCategory}
                  onValueChange={(v) =>
                    setEditWardCategory(v as PatientCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Children">Children</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Description (optional)
                </Label>
                <Input
                  value={editWardDesc}
                  onChange={(e) => setEditWardDesc(e.target.value)}
                  className="focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">
                  Daily Rate (₹)
                </Label>
                <Input
                  type="number"
                  value={editWardRate}
                  onChange={(e) =>
                    setEditWardRate(parseFloat(e.target.value) || 0)
                  }
                  className="focus:ring-2 focus:ring-[#7A329F] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditWardId(null)}
                className="border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateWard}
                disabled={isLoading}
                className="bg-[#3B1E6F] hover:bg-[#7A329F]"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}