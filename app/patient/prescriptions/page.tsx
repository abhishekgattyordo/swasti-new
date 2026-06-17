

// "use client";

// import { useState, useEffect } from "react";
// import Sidebar from "@/components/patient/Sidebar";
// import { useRouter } from "next/navigation";
// import {
//   Menu,
//   X,
//   Pill,
//   Download,
//   ShoppingCart,
//   User,
//   FileText,
//   Activity,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { currentVisitApi } from "@/lib/api/ehr";
// import toast from "react-hot-toast";

// // or adjust the path to where the function is defined

// interface Vitals {
//   id?: string;
//   bp_systolic: number;
//   bp_diastolic: number;
//   heart_rate: number;
//   temperature: number;
//   respiratory_rate: number;
//   oxygen_saturation: number;
//   weight?: number;
//   height?: number;
//   recorded_at: string;
// }

// interface Prescription {
//   id: string;
//   medication_name: string;
//   dosage: string;
//   frequency: string;
//   duration: string;
//   instructions?: string;
//   status: "active" | "completed" | "discontinued";
//   prescribed_at: string;
//   doctor_name: string;
//   doctor_specialty?: string;
//   doctor_image?: string | null;
// }

// interface Visit {
//   id: string;
//   appointment_id?: string;
//   visit_date: string;
//   reason?: string;
//   diagnosis?: string;
//   notes?: string;
//   doctor_name: string;
//   doctor_specialty?: string;
//   doctor_image?: string | null;
// }

// export default function PrescriptionsPage() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("active");
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const [visit, setVisit] = useState<Visit | null>(null);
//   const [vitals, setVitals] = useState<Vitals | null>(null);
//   const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
//   const [selectedViewDate, setSelectedViewDate] = useState<string>("");
//   const [prescriptionSearch, setPrescriptionSearch] = useState("");
//   const [availableDates, setAvailableDates] = useState<string[]>([]);
//   const [loadingDates, setLoadingDates] = useState(true);

//   const [activeSection, setActiveSection] = useState<"vitals" | "prescriptions">("vitals");

//   const getPatientId = () => {
//     const user = JSON.parse(localStorage.getItem("user") || "null");
//     return user?.patient_id || String(user?.id);
//   };

//   // Fetch list of dates that have data (visits, vitals, prescriptions)
//  useEffect(() => {
//   const fetchDates = async () => {
//     const patientId = getPatientId();

//     if (!patientId) {
//       toast.error("Please login first");
//       router.push("/login");
//       return;
//     }

//     try {
//       setLoadingDates(true);

//       const visits = await currentVisitApi.getCompletedVisits(patientId);

//       if (Array.isArray(visits)) {
//         const dates = visits.map((visit) =>
//           String(visit.appointment_date)
//         );

//         const uniqueDates = [...new Set(dates)].sort(
//           (a, b) =>
//             new Date(b).getTime() - new Date(a).getTime()
//         );

//         setAvailableDates(uniqueDates);

//         if (uniqueDates.length > 0) {
//           setSelectedViewDate(uniqueDates[0]);
//         } else {
//           setLoading(false);
//         }
//       } else {
//         toast.error("Failed to load visits");
//       }
//     } catch (error) {
//       console.error("Error fetching visits:", error);
//       toast.error("Failed to load available dates");
//     } finally {
//       setLoadingDates(false);
//     }
//   };

//   fetchDates();
// }, [router]);


//   // Fetch data when selected date changes
//   useEffect(() => {
//     const patientId = getPatientId();
//     if (!patientId || !selectedViewDate) return;
//     setLoading(true);
//     fetchDataForDate(patientId, selectedViewDate).finally(() =>
//       setLoading(false)
//     );
//   }, [selectedViewDate]);

//   const fetchDataForDate = async (patientId: string, date: string) => {
//     try {
//       // 1. Visit details
//       const visitRes = await currentVisitApi.getCurrentVisitByDate(patientId, date);
//       let visitData = null;
//       if (visitRes?.success && visitRes.data) {
//         visitData = visitRes.data;
//       } else if (Array.isArray(visitRes)) {
//         visitData = visitRes[0];
//       } else {
//         visitData = visitRes;
//       }
//       setVisit(visitData);

//       // 2. Vitals
//       try {
//         const vitalsRes = await currentVisitApi.getVitalsByDate(patientId, date);
//         let vitalsData = null;
//         if (vitalsRes?.success && vitalsRes.data) {
//           const apiVitals = vitalsRes.data;
//           vitalsData = {
//             bp_systolic: parseInt(apiVitals.bp?.split("/")[0]) || 0,
//             bp_diastolic: parseInt(apiVitals.bp?.split("/")[1]) || 0,
//             heart_rate: apiVitals.hr,
//             temperature: parseFloat(apiVitals.temp),
//             respiratory_rate: apiVitals.rr,
//             oxygen_saturation: apiVitals.spo2,
//             recorded_at: apiVitals.recordedAt,
//             weight: apiVitals.weight ? parseFloat(apiVitals.weight) : undefined,
//           };
//         } else if (Array.isArray(vitalsRes) && vitalsRes.length > 0) {
//           const apiVitals = vitalsRes[0];
//           vitalsData = {
//             bp_systolic: parseInt(apiVitals.bp?.split("/")[0]) || 0,
//             bp_diastolic: parseInt(apiVitals.bp?.split("/")[1]) || 0,
//             heart_rate: apiVitals.hr,
//             temperature: parseFloat(apiVitals.temp),
//             respiratory_rate: apiVitals.rr,
//             oxygen_saturation: apiVitals.spo2,
//             recorded_at: apiVitals.recordedAt,
//             weight: apiVitals.weight ? parseFloat(apiVitals.weight) : undefined,
//           };
//         }
//         setVitals(vitalsData);
//       } catch (err) {
//         console.error("No vitals found for this date", err);
//         setVitals(null);
//       }

//       // 3. Prescriptions
//       try {
//         const prescRes = await currentVisitApi.getPrescriptionsByDate(patientId, date);
//         let prescriptionsData: Prescription[] = [];
//         if (prescRes?.success && Array.isArray(prescRes.data)) {
//           prescriptionsData = prescRes.data.map((item: any) => ({
//             id: item.id,
//             medication_name: item.name,
//             dosage: item.dosage,
//             frequency: item.frequency,
//             status: item.status || "active",
//             prescribed_at: item.prescribed_at || new Date().toISOString(),
//             doctor_name: item.doctor_name || visitData?.doctor_name || "Unknown",
//             doctor_specialty: item.doctor_specialty || visitData?.doctor_specialty,
//             doctor_image: item.doctor_image || visitData?.doctor_image,
//             instructions: item.instructions,
//             duration: item.duration,
//           }));
//         } else if (prescRes?.success && prescRes.data) {
//           const item = prescRes.data;
//           prescriptionsData = [
//             {
//               id: item.id,
//               medication_name: item.name,
//               dosage: item.dosage,
//               frequency: item.frequency,
//               status: item.status || "active",
//               prescribed_at: item.prescribed_at || new Date().toISOString(),
//               doctor_name: item.doctor_name || visitData?.doctor_name || "Unknown",
//               doctor_specialty: item.doctor_specialty || visitData?.doctor_specialty,
//               doctor_image: item.doctor_image || visitData?.doctor_image,
//               instructions: item.instructions,
//               duration: item.duration,
//             },
//           ];
//         } else if (Array.isArray(prescRes)) {
//           prescriptionsData = prescRes.map((item: any) => ({
//             id: item.id,
//             medication_name: item.name,
//             dosage: item.dosage,
//             frequency: item.frequency,
//             status: item.status || "active",
//             prescribed_at: item.prescribed_at || new Date().toISOString(),
//             doctor_name: item.doctor_name || visitData?.doctor_name || "Unknown",
//             doctor_specialty: item.doctor_specialty || visitData?.doctor_specialty,
//             doctor_image: item.doctor_image || visitData?.doctor_image,
//             instructions: item.instructions,
//             duration: item.duration,
//           }));
//         }
//         setPrescriptions(prescriptionsData);
//       } catch (err) {
//         console.error("No prescriptions found for this date", err);
//         setPrescriptions([]);
//       }
//     } catch (error) {
//       console.error("Error fetching data for date:", error);
//     }
//   };

//   const activePrescriptions = prescriptions.filter((p) => p.status === "active");
//   const pastPrescriptions = prescriptions.filter(
//     (p) => p.status === "completed" || p.status === "discontinued"
//   );

//   const filterBySearch = (list: Prescription[]) => {
//     if (!prescriptionSearch) return list;
//     return list.filter((p) =>
//       p.medication_name.toLowerCase().includes(prescriptionSearch.toLowerCase())
//     );
//   };

//   const displayedActive = filterBySearch(activePrescriptions);
//   const displayedPast = filterBySearch(pastPrescriptions);

//   const VitalsCard = () => {
//     if (!vitals)
//       return (
//         <Card>
//           <CardContent className="p-6 text-center text-gray-500">
//             No vitals recorded for this date.
//           </CardContent>
//         </Card>
//       );

//     return (
//       <Card>
//         <CardHeader className="pb-2">
//           <CardTitle className="text-lg flex items-center gap-2">
//             <Activity className="h-5 w-5 text-blue-600" />
//             Vitals
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm border-collapse border border-gray-200 dark:border-gray-700">
//               <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 border-b border-green-200 dark:border-green-900">
//                 <tr>
//                   <th className="px-4 py-2 border border-gray-200 dark:border-gray-700">BP (mmHg)</th>
//                   <th className="px-4 py-2 border border-gray-200 dark:border-gray-700">HR (bpm)</th>
//                   <th className="px-4 py-2 border border-gray-200 dark:border-gray-700">Temp (°C)</th>
//                   <th className="px-4 py-2 border border-gray-200 dark:border-gray-700">SpO₂ (%)</th>
//                   <th className="px-4 py-2 border border-gray-200 dark:border-gray-700">RR (breaths/min)</th>
//                   {vitals.weight !== undefined && (
//                     <th className="px-4 py-2 border border-gray-200 dark:border-gray-700">Weight (kg)</th>
//                   )}
//                   {vitals.height !== undefined && (
//                     <th className="px-4 py-2 border border-gray-200 dark:border-gray-700">Height (cm)</th>
//                   )}
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 font-medium">
//                     {vitals.bp_systolic}/{vitals.bp_diastolic}
//                   </td>
//                   <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">
//                     {vitals.heart_rate}
//                   </td>
//                   <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">
//                     {vitals.temperature}
//                   </td>
//                   <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">
//                     {vitals.oxygen_saturation}
//                   </td>
//                   <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">
//                     {vitals.respiratory_rate || "-"}
//                   </td>
//                   {vitals.weight !== undefined && (
//                     <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">{vitals.weight}</td>
//                   )}
//                   {vitals.height !== undefined && (
//                     <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">{vitals.height}</td>
//                   )}
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//           <div className="mt-2 text-xs text-gray-400">
//             Recorded: {new Date(vitals.recorded_at).toLocaleString()}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
//       <button
//         className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//         aria-label="Toggle menu"
//       >
//         {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//       </button>

//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       <div className="flex-1 flex flex-col w-full lg:ml-0">
//         <main className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
//             <div>
//               <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
//                 Visit Details
//               </h1>
//               <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-0.5">
//                 View visit, vitals, and prescriptions for a specific date.
//               </p>
//             </div>
//             <div className="flex items-center gap-2">
//               {loadingDates ? (
//                 <div className="text-sm text-gray-500">Loading dates...</div>
//               ) : availableDates.length === 0 ? (
//                 <div className="text-sm text-gray-500">No records found</div>
//               ) : (
//                 <select
//                   value={selectedViewDate}
//                   onChange={(e) => setSelectedViewDate(e.target.value)}
//                   className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
//                 >
//                   {availableDates.map((date) => (
//                     <option key={date} value={date}>
//                       {new Date(date).toLocaleDateString(undefined, {
//                         year: "numeric",
//                         month: "long",
//                         day: "numeric",
//                       })}
//                     </option>
//                   ))}
//                 </select>
//               )}
//             </div>
//           </div>

//           {/* Section selector tabs */}
//           <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 w-fit mb-6">
//             <button
//               onClick={() => setActiveSection("vitals")}
//               className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                 activeSection === "vitals"
//                   ? "bg-green-600 text-white shadow-sm"
//                   : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
//               }`}
//             >
//               Vitals
//             </button>
//             <button
//               onClick={() => setActiveSection("prescriptions")}
//               className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                 activeSection === "prescriptions"
//                   ? "bg-green-600 text-white shadow-sm"
//                   : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
//               }`}
//             >
//               Prescriptions
//             </button>
//           </div>

//           {loading ? (
//             <div className="text-center py-12">
//               <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
//               <p className="mt-4 text-gray-600 dark:text-gray-400">
//                 Loading data for {selectedViewDate}...
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {/* Visit Summary (always visible) */}
//               {visit && (
//                 <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm flex flex-wrap items-center gap-x-4 gap-y-2">
//                   <div>
//                     <span className="font-semibold">Diagnosis:</span> {visit.diagnosis || "N/A"}
//                   </div>
//                   <div>
//                     <span className="font-semibold">Doctor:</span> {visit.doctor_name}
//                     {visit.doctor_specialty && (
//                       <span className="text-gray-500"> ({visit.doctor_specialty})</span>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {activeSection === "vitals" && <VitalsCard />}

//               {activeSection === "prescriptions" && (
//                 <>
//                   {prescriptions.length === 0 ? (
//                     <Card>
//                       <CardContent className="p-6 text-center text-gray-500">
//                         No prescriptions found for this date.
//                       </CardContent>
//                     </Card>
//                   ) : (
//                     <div className="space-y-4">
//                       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                           <TabsList className="grid grid-cols-2 w-fit">
//                             <TabsTrigger value="active" className="text-xs md:text-sm py-1.5 px-3">
//                               Active ({displayedActive.length})
//                             </TabsTrigger>
//                             <TabsTrigger value="past" className="text-xs md:text-sm py-1.5 px-3">
//                               Past ({displayedPast.length})
//                             </TabsTrigger>
//                           </TabsList>
//                           <div className="flex items-center gap-2 max-w-sm">
//                             <input
//                               type="text"
//                               placeholder="Search by medication name..."
//                               value={prescriptionSearch}
//                               onChange={(e) => setPrescriptionSearch(e.target.value)}
//                               className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 w-full"
//                             />
//                             {prescriptionSearch && (
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => setPrescriptionSearch("")}
//                                 className="text-gray-500 whitespace-nowrap"
//                               >
//                                 Clear
//                               </Button>
//                             )}
//                           </div>
//                         </div>

//                         <TabsContent value="active" className="mt-4">
//                           <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//                             <div className="overflow-x-auto">
//                               <table className="w-full text-left text-sm border-collapse border border-gray-200 dark:border-gray-700">
//                                 <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 border-b border-green-200 dark:border-green-900">
//                                   <tr>
//                                     <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 font-medium">
//                                       Medication
//                                     </th>
//                                     <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 font-medium">
//                                       Dosage
//                                     </th>
//                                     <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 font-medium">
//                                       Frequency
//                                     </th>
//                                     <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 font-medium">
//                                       Duration
//                                     </th>
//                                     <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 font-medium">
//                                       Status
//                                     </th>
//                                     <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 font-medium">
//                                       Prescribed
//                                     </th>
//                                     <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 font-medium">
//                                       Doctor
//                                     </th>
//                                     {/* <th className="px-4 py-3 border border-gray-200 dark:border-gray-700 font-medium text-right">
//                                       Actions
//                                     </th> */}
//                                   </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//                                   {displayedActive.map((presc) => (
//                                     <tr
//                                       key={presc.id}
//                                       className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
//                                     >
//                                       <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">
//                                         <div className="flex items-center gap-2">
//                                           <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
//                                             <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
//                                           </div>
//                                           <span className="font-medium text-gray-900 dark:text-white">
//                                             {presc.medication_name}
//                                           </span>
//                                         </div>
//                                       </td>
//                                       <td className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
//                                         {presc.dosage}
//                                       </td>
//                                       <td className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
//                                         {presc.frequency}
//                                       </td>
//                                       <td className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
//                                         {presc.duration}
//                                       </td>
//                                       <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">
//                                         <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
//                                           {presc.status}
//                                         </Badge>
//                                       </td>
//                                       <td className="px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
//                                         {new Date(presc.prescribed_at).toLocaleDateString()}
//                                       </td>
//                                       <td className="px-4 py-3 border border-gray-200 dark:border-gray-700">
//                                         <div className="flex items-center gap-1">
//                                           <User className="h-3 w-3 text-gray-400" />
//                                           <span className="text-gray-600 dark:text-gray-300">
//                                             {presc.doctor_name}
//                                           </span>
//                                           {presc.doctor_specialty && (
//                                             <span className="text-xs text-gray-500 dark:text-gray-400">
//                                               ({presc.doctor_specialty})
//                                             </span>
//                                           )}
//                                         </div>
//                                       </td>
                                     
//                                     </tr>
//                                   ))}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                         </TabsContent>

//                         <TabsContent value="past" className="mt-4 space-y-2">
//                           {displayedPast.map((presc) => (
//                             <Card key={presc.id} className="hover:shadow-md transition-shadow">
//                               <CardContent className="p-4">
//                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                                   <div className="flex items-start gap-3">
//                                     <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
//                                       <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
//                                     </div>
//                                     <div>
//                                       <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
//                                         {presc.medication_name}
//                                       </h3>
//                                       <p className="text-xs text-gray-500 dark:text-gray-400">
//                                         {presc.dosage} • {presc.frequency}
//                                       </p>
//                                       <div className="flex items-center gap-2 mt-1">
//                                         <Badge variant="outline" className="text-xs px-2 py-0">
//                                           {presc.status}
//                                         </Badge>
//                                         <span className="text-xs text-gray-500 dark:text-gray-400">
//                                           {new Date(presc.prescribed_at).toLocaleDateString()}
//                                         </span>
//                                       </div>
//                                     </div>
//                                   </div>
//                                   <div className="flex items-center gap-2 ml-11 sm:ml-0">
//                                     <Button variant="outline" size="icon" className="h-7 w-7">
//                                       <Download className="h-3 w-3" />
//                                     </Button>
//                                   </div>
//                                 </div>
//                                 <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
//                                   <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
//                                     <User className="h-3 w-3" />
//                                     <span>{presc.doctor_name}</span>
//                                     {presc.doctor_specialty && (
//                                       <span> • {presc.doctor_specialty}</span>
//                                     )}
//                                   </div>
//                                 </div>
//                               </CardContent>
//                             </Card>
//                           ))}
//                         </TabsContent>
//                       </Tabs>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           )}

//           <footer className="mt-8 text-center">
//             <p className="text-xs text-gray-400 max-w-2xl mx-auto px-2">
//               This information is for the selected date. For complete history,
//               please consult your doctor.
//             </p>
//           </footer>
//         </main>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/patient/Sidebar";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Pill,
  Download,
  ShoppingCart,
  User,
  FileText,
  Activity,
  Stethoscope,
  Calendar,
  Heart,
  Thermometer,
  Wind,
  Droplet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentVisitApi } from "@/lib/api/ehr";
import toast from "react-hot-toast";

interface Vitals {
  id?: string;
  bp_systolic: number;
  bp_diastolic: number;
  heart_rate: number;
  temperature: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  weight?: number;
  height?: number;
  recorded_at: string;
}

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  status: "active" | "completed" | "discontinued";
  prescribed_at: string;
  doctor_name: string;
  doctor_specialty?: string;
  doctor_image?: string | null;
}

interface Visit {
  id: string;
  appointment_id?: string;
  visit_date: string;
  reason?: string;
  diagnosis?: string;
  notes?: string;
  doctor_name: string;
  doctor_specialty?: string;
  doctor_image?: string | null;
}

export default function PrescriptionsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [visit, setVisit] = useState<Visit | null>(null);
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedViewDate, setSelectedViewDate] = useState<string>("");
  const [prescriptionSearch, setPrescriptionSearch] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);

  const [activeSection, setActiveSection] = useState<"vitals" | "prescriptions">("vitals");

  const getPatientId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.patient_id || String(user?.id);
  };

  useEffect(() => {
    const fetchDates = async () => {
      const patientId = getPatientId();

      if (!patientId) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }

      try {
        setLoadingDates(true);

        const visits = await currentVisitApi.getCompletedVisits(patientId);

        if (Array.isArray(visits)) {
          const dates = visits.map((visit) =>
            String(visit.appointment_date)
          );

          const uniqueDates = [...new Set(dates)].sort(
            (a, b) =>
              new Date(b).getTime() - new Date(a).getTime()
          );

          setAvailableDates(uniqueDates);

          if (uniqueDates.length > 0) {
            setSelectedViewDate(uniqueDates[0]);
          } else {
            setLoading(false);
          }
        } else {
          toast.error("Failed to load visits");
        }
      } catch (error) {
        console.error("Error fetching visits:", error);
        toast.error("Failed to load available dates");
      } finally {
        setLoadingDates(false);
      }
    };

    fetchDates();
  }, [router]);

  useEffect(() => {
    const patientId = getPatientId();
    if (!patientId || !selectedViewDate) return;
    setLoading(true);
    fetchDataForDate(patientId, selectedViewDate).finally(() =>
      setLoading(false)
    );
  }, [selectedViewDate]);

  const fetchDataForDate = async (patientId: string, date: string) => {
    try {
      const visitRes = await currentVisitApi.getCurrentVisitByDate(patientId, date);
      let visitData = null;
      if (visitRes?.success && visitRes.data) {
        visitData = visitRes.data;
      } else if (Array.isArray(visitRes)) {
        visitData = visitRes[0];
      } else {
        visitData = visitRes;
      }
      setVisit(visitData);

      try {
        const vitalsRes = await currentVisitApi.getVitalsByDate(patientId, date);
        let vitalsData = null;
        if (vitalsRes?.success && vitalsRes.data) {
          const apiVitals = vitalsRes.data;
          vitalsData = {
            bp_systolic: parseInt(apiVitals.bp?.split("/")[0]) || 0,
            bp_diastolic: parseInt(apiVitals.bp?.split("/")[1]) || 0,
            heart_rate: apiVitals.hr,
            temperature: parseFloat(apiVitals.temp),
            respiratory_rate: apiVitals.rr,
            oxygen_saturation: apiVitals.spo2,
            recorded_at: apiVitals.recordedAt,
            weight: apiVitals.weight ? parseFloat(apiVitals.weight) : undefined,
          };
        } else if (Array.isArray(vitalsRes) && vitalsRes.length > 0) {
          const apiVitals = vitalsRes[0];
          vitalsData = {
            bp_systolic: parseInt(apiVitals.bp?.split("/")[0]) || 0,
            bp_diastolic: parseInt(apiVitals.bp?.split("/")[1]) || 0,
            heart_rate: apiVitals.hr,
            temperature: parseFloat(apiVitals.temp),
            respiratory_rate: apiVitals.rr,
            oxygen_saturation: apiVitals.spo2,
            recorded_at: apiVitals.recordedAt,
            weight: apiVitals.weight ? parseFloat(apiVitals.weight) : undefined,
          };
        }
        setVitals(vitalsData);
      } catch (err) {
        console.error("No vitals found for this date", err);
        setVitals(null);
      }

      try {
        const prescRes = await currentVisitApi.getPrescriptionsByDate(patientId, date);
        let prescriptionsData: Prescription[] = [];
        if (prescRes?.success && Array.isArray(prescRes.data)) {
          prescriptionsData = prescRes.data.map((item: any) => ({
            id: item.id,
            medication_name: item.name,
            dosage: item.dosage,
            frequency: item.frequency,
            status: item.status || "active",
            prescribed_at: item.prescribed_at || new Date().toISOString(),
            doctor_name: item.doctor_name || visitData?.doctor_name || "Unknown",
            doctor_specialty: item.doctor_specialty || visitData?.doctor_specialty,
            doctor_image: item.doctor_image || visitData?.doctor_image,
            instructions: item.instructions,
            duration: item.duration,
          }));
        } else if (prescRes?.success && prescRes.data) {
          const item = prescRes.data;
          prescriptionsData = [
            {
              id: item.id,
              medication_name: item.name,
              dosage: item.dosage,
              frequency: item.frequency,
              status: item.status || "active",
              prescribed_at: item.prescribed_at || new Date().toISOString(),
              doctor_name: item.doctor_name || visitData?.doctor_name || "Unknown",
              doctor_specialty: item.doctor_specialty || visitData?.doctor_specialty,
              doctor_image: item.doctor_image || visitData?.doctor_image,
              instructions: item.instructions,
              duration: item.duration,
            },
          ];
        } else if (Array.isArray(prescRes)) {
          prescriptionsData = prescRes.map((item: any) => ({
            id: item.id,
            medication_name: item.name,
            dosage: item.dosage,
            frequency: item.frequency,
            status: item.status || "active",
            prescribed_at: item.prescribed_at || new Date().toISOString(),
            doctor_name: item.doctor_name || visitData?.doctor_name || "Unknown",
            doctor_specialty: item.doctor_specialty || visitData?.doctor_specialty,
            doctor_image: item.doctor_image || visitData?.doctor_image,
            instructions: item.instructions,
            duration: item.duration,
          }));
        }
        setPrescriptions(prescriptionsData);
      } catch (err) {
        console.error("No prescriptions found for this date", err);
        setPrescriptions([]);
      }
    } catch (error) {
      console.error("Error fetching data for date:", error);
    }
  };

  const activePrescriptions = prescriptions.filter((p) => p.status === "active");
  const pastPrescriptions = prescriptions.filter(
    (p) => p.status === "completed" || p.status === "discontinued"
  );

  const filterBySearch = (list: Prescription[]) => {
    if (!prescriptionSearch) return list;
    return list.filter((p) =>
      p.medication_name.toLowerCase().includes(prescriptionSearch.toLowerCase())
    );
  };

  const displayedActive = filterBySearch(activePrescriptions);
  const displayedPast = filterBySearch(pastPrescriptions);

  const VitalsCard = () => {
    if (!vitals)
      return (
        <Card className="border-[#E2EFEA] dark:border-gray-700">
          <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
            No vitals recorded for this date.
          </CardContent>
        </Card>
      );

    return (
      <Card className="border-[#E2EFEA] dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-[#1F8F89] dark:text-[#2BB2A7]">
            <Heart className="h-5 w-5 text-[#2BB2A7]" />
            Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse border border-[#E2EFEA] dark:border-gray-700">
              <thead className="bg-[#F4F9F7] dark:bg-black/20 text-gray-500 dark:text-gray-400 border-b border-[#E2EFEA] dark:border-green-900">
                <tr>
                  <th className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#1F8F89]">BP (mmHg)</th>
                  <th className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#1F8F89]">HR (bpm)</th>
                  <th className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#1F8F89]">Temp (°C)</th>
                  <th className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#1F8F89]">SpO₂ (%)</th>
                  <th className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#1F8F89]">RR (breaths/min)</th>
                  {vitals.weight !== undefined && (
                    <th className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#1F8F89]">Weight (kg)</th>
                  )}
                  {vitals.height !== undefined && (
                    <th className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#1F8F89]">Height (cm)</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-[#EAF7F4]/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 font-medium text-[#1A1A1A] dark:text-white">
                    {vitals.bp_systolic}/{vitals.bp_diastolic}
                  </td>
                  <td className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#333333] dark:text-gray-300">
                    {vitals.heart_rate}
                  </td>
                  <td className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#333333] dark:text-gray-300">
                    {vitals.temperature}
                  </td>
                  <td className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#333333] dark:text-gray-300">
                    {vitals.oxygen_saturation}
                  </td>
                  <td className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#333333] dark:text-gray-300">
                    {vitals.respiratory_rate || "-"}
                  </td>
                  {vitals.weight !== undefined && (
                    <td className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#333333] dark:text-gray-300">{vitals.weight}</td>
                  )}
                  {vitals.height !== undefined && (
                    <td className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-700 text-[#333333] dark:text-gray-300">{vitals.height}</td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Recorded: {new Date(vitals.recorded_at).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-gray-900">
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full lg:ml-0">
        <main className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1A] dark:text-white">
                Visit Details
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-0.5">
                View visit, vitals, and prescriptions for a specific date.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {loadingDates ? (
                <div className="text-sm text-gray-500">Loading dates...</div>
              ) : availableDates.length === 0 ? (
                <div className="text-sm text-gray-500">No records found</div>
              ) : (
                <select
                  value={selectedViewDate}
                  onChange={(e) => setSelectedViewDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB2A7] focus:border-[#2BB2A7] bg-white dark:bg-gray-800"
                >
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-[#E2EFEA] dark:border-gray-700 w-fit mb-6">
            <button
              onClick={() => setActiveSection("vitals")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSection === "vitals"
                  ? "bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white shadow-sm"
                  : "text-[#333333] hover:text-[#2BB2A7] hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20"
              }`}
            >
              <Heart className="h-4 w-4 inline mr-2" />
              Vitals
            </button>
            <button
              onClick={() => setActiveSection("prescriptions")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSection === "prescriptions"
                  ? "bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white shadow-sm"
                  : "text-[#333333] hover:text-[#2BB2A7] hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20"
              }`}
            >
              <Pill className="h-4 w-4 inline mr-2" />
              Prescriptions
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2BB2A7] border-r-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading data for {selectedViewDate}...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visit Summary */}
              {visit && (
                <div className="bg-[#F4F9F7] dark:bg-gray-800 p-3 rounded-lg text-sm flex flex-wrap items-center gap-x-4 gap-y-2 border border-[#E2EFEA] dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-[#2BB2A7]" />
                    <span className="font-semibold text-[#1A1A1A] dark:text-white">Diagnosis:</span>
                    <span className="text-[#333333] dark:text-gray-300">{visit.diagnosis || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#2BB2A7]" />
                    <span className="font-semibold text-[#1A1A1A] dark:text-white">Doctor:</span>
                    <span className="text-[#333333] dark:text-gray-300">{visit.doctor_name}</span>
                    {visit.doctor_specialty && (
                      <span className="text-gray-500 dark:text-gray-400">({visit.doctor_specialty})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#2BB2A7]" />
                    <span className="text-[#333333] dark:text-gray-300">
                      {new Date(selectedViewDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {activeSection === "vitals" && <VitalsCard />}

              {activeSection === "prescriptions" && (
                <>
                  {prescriptions.length === 0 ? (
                    <Card className="border-[#E2EFEA] dark:border-gray-700">
                      <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
                        No prescriptions found for this date.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <TabsList className="grid grid-cols-2 w-fit bg-[#F4F9F7] dark:bg-gray-800 p-1 rounded-lg border border-[#E2EFEA] dark:border-gray-700">
                            <TabsTrigger 
                              value="active" 
                              className="text-xs md:text-sm py-1.5 px-3 data-[state=active]:bg-[#2BB2A7] data-[state=active]:text-white"
                            >
                              Active ({displayedActive.length})
                            </TabsTrigger>
                            <TabsTrigger 
                              value="past" 
                              className="text-xs md:text-sm py-1.5 px-3 data-[state=active]:bg-[#2BB2A7] data-[state=active]:text-white"
                            >
                              Past ({displayedPast.length})
                            </TabsTrigger>
                          </TabsList>
                          <div className="flex items-center gap-2 max-w-sm">
                            <input
                              type="text"
                              placeholder="Search by medication name..."
                              value={prescriptionSearch}
                              onChange={(e) => setPrescriptionSearch(e.target.value)}
                              className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB2A7] focus:border-[#2BB2A7] bg-white dark:bg-gray-800 w-full"
                            />
                            {prescriptionSearch && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setPrescriptionSearch("")}
                                className="text-gray-500 whitespace-nowrap hover:text-[#2BB2A7]"
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                        </div>

                        <TabsContent value="active" className="mt-4">
                          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#E2EFEA] dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm border-collapse border border-[#E2EFEA] dark:border-gray-700">
                                <thead className="bg-[#F4F9F7] dark:bg-black/20 text-gray-500 dark:text-gray-400 border-b border-[#E2EFEA] dark:border-green-900">
                                  <tr>
                                    <th className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700 font-medium text-[#1F8F89]">
                                      Medication
                                    </th>
                                    <th className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700 font-medium text-[#1F8F89]">
                                      Dosage
                                    </th>
                                    <th className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700 font-medium text-[#1F8F89]">
                                      Frequency
                                    </th>
                                    <th className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700 font-medium text-[#1F8F89]">
                                      Duration
                                    </th>
                                    <th className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700 font-medium text-[#1F8F89]">
                                      Status
                                    </th>
                                    <th className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700 font-medium text-[#1F8F89]">
                                      Prescribed
                                    </th>
                                    <th className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700 font-medium text-[#1F8F89]">
                                      Doctor
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                  {displayedActive.map((presc) => (
                                    <tr
                                      key={presc.id}
                                      className="hover:bg-[#EAF7F4]/50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                      <td className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                          <div className="h-8 w-8 rounded-lg bg-[#EAF7F4] dark:bg-[#1F8F89]/20 flex items-center justify-center">
                                            <Pill className="h-4 w-4 text-[#2BB2A7] dark:text-[#2BB2A7]" />
                                          </div>
                                          <span className="font-medium text-[#1A1A1A] dark:text-white">
                                            {presc.medication_name}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700 text-[#333333] dark:text-gray-300">
                                        {presc.dosage}
                                      </td>
                                      <td className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700 text-[#333333] dark:text-gray-300">
                                        {presc.frequency}
                                      </td>
                                      <td className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700 text-[#333333] dark:text-gray-300">
                                        {presc.duration}
                                      </td>
                                      <td className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700">
                                        <Badge className="bg-[#EAF7F4] text-[#1F8F89] dark:bg-[#1F8F89]/20 dark:text-[#2BB2A7] border-0 text-xs">
                                          {presc.status}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700 text-[#333333] dark:text-gray-300">
                                        {new Date(presc.prescribed_at).toLocaleDateString()}
                                      </td>
                                      <td className="px-4 py-3 border border-[#E2EFEA] dark:border-gray-700">
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3 text-[#2BB2A7]" />
                                          <span className="text-[#333333] dark:text-gray-300">
                                            {presc.doctor_name}
                                          </span>
                                          {presc.doctor_specialty && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              ({presc.doctor_specialty})
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="past" className="mt-4 space-y-2">
                          {displayedPast.map((presc) => (
                            <Card key={presc.id} className="hover:shadow-md transition-shadow border-[#E2EFEA] dark:border-gray-700">
                              <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-[#F4F9F7] dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                      <FileText className="h-4 w-4 text-[#2BB2A7]" />
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-white">
                                        {presc.medication_name}
                                      </h3>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {presc.dosage} • {presc.frequency}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs px-2 py-0 border-[#E2EFEA]">
                                          {presc.status}
                                        </Badge>
                                        <span className="text-xs text-[#333333] dark:text-gray-400">
                                          {new Date(presc.prescribed_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-11 sm:ml-0">
                                    <Button variant="outline" size="icon" className="h-7 w-7 border-[#E2EFEA] hover:border-[#2BB2A7] hover:bg-[#EAF7F4]">
                                      <Download className="h-3 w-3 text-[#2BB2A7]" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-[#E2EFEA] dark:border-gray-800">
                                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                    <User className="h-3 w-3 text-[#2BB2A7]" />
                                    <span className="text-[#333333] dark:text-gray-300">{presc.doctor_name}</span>
                                    {presc.doctor_specialty && (
                                      <span className="text-gray-500 dark:text-gray-400"> • {presc.doctor_specialty}</span>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <footer className="mt-8 text-center">
            <p className="text-xs text-gray-400 max-w-2xl mx-auto px-2">
              This information is for the selected date. For complete history,
              please consult your doctor.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}