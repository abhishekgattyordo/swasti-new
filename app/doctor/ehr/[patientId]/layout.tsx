


// "use client";

// import { useState, createContext, useContext, useEffect } from "react";
// import { useParams, usePathname, useRouter ,useSearchParams } from "next/navigation";
// import Link from "next/link";
// import React from "react";

// // Import modal components
// import VisitHistoryModal from "@/components/doctor/VisitHistoryModal";

// import AddVitalsModal from "@/components/doctor/AddVitalsModal";

// // Import API clients

// import { currentVisitApi } from "@/lib/api/ehr"; // ✅ new import
// import AddMedicationModal, { NewMedicationData } from "@/components/doctor/AddMedicationModal";
// import toast from "react-hot-toast";


// export interface ApiVisit {
//   appointment_id: string;
//   appointment_date: string;
//   appointment_time: string;
//   consultation_type: string;
//   status: string;
//   notes: string;
//   doctor_name: string;
//   doctor_specialty: string;
//   diagnosis: string | null;
//   icd10_code: string | null;
//   clinical_notes: string | null;
//   follow_up_date: string | null;
//   patient_instructions: string | null;
// }
// // Types (unchanged)
// interface Medication {
//   id: number;
//   name: string;
//   category: string;
//   dosage: string;
//   frequency: string;
//   duration: string;
//   instructions: string;
//   color: string;
// }

// interface Vital {
//   id: number;
//   date: string;
//   time: string;
//   bp: string;
//   hr: number;
//   temp: number;
//   weight: number;
//   rr: number;
//   spo2: number;
//   recordedBy: string;
// }

// interface Patient {
//   id: string;
//   name: string;
//   age: number;
//   gender: string;
//   patientId: string;
//   allergies: string[];
//   status: string;
//   phone: string;
//   email: string;
//   city: string;
//   bloodGroup: string;
//   avatar: string;
//   avatarColor: string;
// }

// interface Visit {
//   id: string;
//   date: string;
//   type: string;
//   doctor: string;
//   notes: string;
//   diagnosis: string;
// }
// interface EHRContextType {
//   patient: Patient | null;
//   medications: Medication[];
//   setMedications: React.Dispatch<React.SetStateAction<Medication[]>>;
//   vitals: Vital[];
//   setVitals: React.Dispatch<React.SetStateAction<Vital[]>>;
//   showHistoryModal: boolean;
//   setShowHistoryModal: React.Dispatch<React.SetStateAction<boolean>>;
//   showAddMedicationModal: boolean;
//   setShowAddMedicationModal: React.Dispatch<React.SetStateAction<boolean>>;
//   showAddVitalsModal: boolean;
//   setShowAddVitalsModal: React.Dispatch<React.SetStateAction<boolean>>;
//   handleAddMedication: (medications: NewMedicationData[]) => void;
//   handleAddVitals: (vitalsData: { bp: string; hr: string; temp: string; weight: string; rr: string; spo2: string }) => void;
//   handleDeleteMedication: (id: number) => void;
//   loading: boolean;
//   error: string | null;
// }

// const EHRContext = createContext<EHRContextType | undefined>(undefined);

// export const useEHR = () => {
//   const context = useContext(EHRContext);
//   if (!context) throw new Error("useEHR must be used within EHRProvider");
//   return context;
// };

// // Helper functions (unchanged)
// const calculateAge = (dob: string): number => {
//   if (!dob) return 0;
//   const birth = new Date(dob);
//   const today = new Date();
//   let age = today.getFullYear() - birth.getFullYear();
//   const m = today.getMonth() - birth.getMonth();
//   if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
//   return age;
// };

// const getAvatarColor = (id: string): string => {
//   const colors = ["blue", "green", "purple", "orange", "red"];
//   const lastChar = id.slice(-1);
//   const num = parseInt(lastChar, 10);
//   const index = isNaN(num) ? 0 : num % colors.length;
//   return colors[index];
// };

// const formatGender = (gender: string): string => {
//   if (!gender) return "Other";
//   const g = gender.toLowerCase();
//   if (g === "male") return "M";
//   if (g === "female") return "F";
//   return "Other";
// };

// export default function EHRLayout({ children }: { children: React.ReactNode }) {
//   const params = useParams();
//   const pathname = usePathname();
//   const router = useRouter();
//   const patientId = params.patientId as string;

//   const [patient, setPatient] = useState<Patient | null>(null);
//   const [medications, setMedications] = useState<Medication[]>([]);
//   const [vitals, setVitals] = useState<Vital[]>([]);
//   const [visitHistory, setVisitHistory] = useState<Visit[]>([]);
//   const [appointmentsList, setAppointmentsList] = useState<any[]>([]); // might keep for today's visit

//   const [showHistoryModal, setShowHistoryModal] = useState(false);
//   const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
//   const [showAddVitalsModal, setShowAddVitalsModal] = useState(false);

//   const [newVitals, setNewVitals] = useState({
//     bp: "",
//     hr: "",
//     temp: "",
//     weight: "",
//     rr: "",
//     spo2: "",
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);


//   const searchParams = useSearchParams();
// const currentDate = searchParams.get('date');
// const dateQuery = currentDate ? `?date=${currentDate}` : '';
//   // Fetch patient details and completed visits
  
//   useEffect(() => {
//   console.log("appointmentsList updated:", appointmentsList);
// }, [appointmentsList]);
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!patientId) return;

//       setLoading(true);
//       setError(null);

//       try {
//         // Fetch patient details
//         const patientRes = await fetch(
//           `/api/registration?patientId=${patientId}`,
//         );
//         const patientJson = await patientRes.json();

//         if (!patientJson.success) {
//           throw new Error(patientJson.message || "Failed to fetch patient");
//         }

//         const patientData = patientJson.data;

//         // ✅ Fetch completed visits (only those with visit_details)
//       let completedVisits: ApiVisit[] = [];
//         try {
//           const visitsRes = await currentVisitApi.getCompletedVisits(patientId);
// console.log("visitres",visitsRes)
//        completedVisits = visitsRes;
     
      
//         } catch (visitErr) {
//           console.error("Error fetching completed visits:", visitErr);
//           completedVisits = [];
//         }
//   setAppointmentsList(completedVisits);
//         // Store raw appointments for today's visit detection (optional)
//         // We could also derive from completedVisits if needed
//         setAppointmentsList(completedVisits);

//         // Transform patient data (same as before)
//         const transformedPatient: Patient = {
//           id: patientData.patient_id,
//           name: patientData.full_name_en || "Unknown",
//           age: calculateAge(patientData.dob),
//           gender: formatGender(patientData.gender),
//           patientId: patientData.patient_id,
//           phone: patientData.phone || "",
//           email: patientData.email || "",
//           city: patientData.city || "",
//           bloodGroup: patientData.blood_group || "",
//           allergies: patientData.allergy
//             ? [patientData.allergy]
//             : patientData.allergies || [],
//           status: patientData.status || "Active",
//           avatar:
//             patientData.full_name_en
//               ?.split(" ")
//               .map((n: string) => n[0])
//               .join("")
//               .substring(0, 2)
//               .toUpperCase() || "PT",
//           avatarColor: getAvatarColor(patientData.patient_id),
//         };

//         const history: Visit[] = completedVisits.map((visit: any) => ({
//           id: visit.appointment_id,
//           date: new Date(visit.appointment_date).toLocaleDateString("en-US", {
//             month: "short",
//             day: "numeric",
//             year: "numeric",
//           }),
//           type:
//             visit.consultation_type === "in-person"
//               ? "In-Person"
//               : "Teleconsultation",
//           doctor: visit.doctor_name || "Dr. Unknown",
//           notes: visit.notes || "",
//           diagnosis: visit.diagnosis || "No diagnosis",
//         }));

//         setPatient(transformedPatient);
//         setVisitHistory(history);
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "Failed to load patient data",
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [patientId]);

//   // Handlers (unchanged)
// const handleAddMedication = async (medicationsArray: NewMedicationData[]) => {
//   const colors = ["blue", "amber", "green", "purple", "pink"];
//   const newMeds = medicationsArray.map((med, idx) => ({
//     id: Date.now() + idx,
//     ...med,
//     color: colors[idx % colors.length],
//   }));

//   // Optimistically update local state
//   setMedications([...medications, ...newMeds]);

//   const payload = {
//     date: currentDate || todayStr,
//     recordedBy: "Dr. Sarah Jenkins",
//     medications: medicationsArray,
//   };

//   try {
//     const response = await currentVisitApi.savePrescriptions(patientId, payload);
//    if (response.data?.success) {
//   toast.success(`${medicationsArray.length} medication(s) saved`);
// } else {
//   throw new Error(response.data?.message || "Failed to save");
// }

//   } catch (error) {
//     console.error("Error saving prescriptions:", error);

//     // Rollback optimistic update
//     setMedications(medications);
//   }
// };

//  const handleAddVitals = (vitalsData: { bp: string; hr: string; temp: string; weight: string; rr: string; spo2: string }) => {
//   if (vitalsData.bp && vitalsData.hr && vitalsData.temp) {
//     const today = new Date();
//     const formattedDate = today.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//     const formattedTime = today.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//     setVitals([
//       {
//         id: Date.now(),
//         date: formattedDate,
//         time: formattedTime,
//         bp: vitalsData.bp,
//         hr: parseInt(vitalsData.hr),
//         temp: parseFloat(vitalsData.temp),
//         weight: parseFloat(vitalsData.weight) || 0,
//         rr: parseInt(vitalsData.rr) || 0,
//         spo2: parseInt(vitalsData.spo2) || 0,
//         recordedBy: "Dr. Sarah Jenkins",
//       },
//       ...vitals,
//     ]);
//     setNewVitals({ bp: "", hr: "", temp: "", weight: "", rr: "", spo2: "" });
//     setShowAddVitalsModal(false);
//   }
// };

// const handleDeleteMedication = async (id: number) => {
//   const previousMedications = medications;
//   // Optimistically remove from UI
//   setMedications(medications.filter((med) => med.id !== id));

//   try {
//     const response = await currentVisitApi.deletePrescription(patientId, id.toString());
//       if (response.data?.success) {
//       toast.success('Prescription deleted');
//     } else {
//       throw new Error(response.data?.message || 'Delete failed');
//     }
//   } catch (error) {
//     console.error('Error deleting prescription:', error);
//     toast.error('Failed to delete prescription');
//     // Rollback
//     setMedications(previousMedications);
//   }
// };
//   const avatarColorMap: Record<string, string> = {
//     blue: "bg-blue-600",
//     green: "bg-green-600",
//     purple: "bg-purple-600",
//     orange: "bg-orange-600",
//     red: "bg-red-600",
//     gray: "bg-gray-600",
//   };

//   // Tabs configuration (unchanged)
// const tabs = [
//   { name: "Vitals", href: `/doctor/ehr/${patientId}/vitals${dateQuery}` },
//   { name: "Prescriptions", href: `/doctor/ehr/${patientId}/prescriptions${dateQuery}` },
//    { name: "Current Visit", href: `/doctor/ehr/${patientId}/current-visit${dateQuery}` },
// ];

//   const activeTab = pathname.split("/").pop() || "current-visit";

//   // Today's appointment doctor (if any) – now from completedVisits, not appointmentsApi
//   const todayStr = new Date().toISOString().split("T")[0];
//   const todayAppt = appointmentsList.find(
//     (apt: any) => apt.appointment_date?.split("T")[0] === todayStr,
//   );
//   const todayDoctor = todayAppt ? todayAppt.doctor_name : "";

//   // Loading / error UI (unchanged)
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-[#137fec] border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
//           <p className="text-slate-600 dark:text-slate-400">
//             Loading patient data...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !patient) {
//     return (
//       <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center p-4">
//         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
//           <span className="material-symbols-outlined text-red-500 text-5xl mb-4">
//             error
//           </span>
//           <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
//             Failed to Load Patient
//           </h2>
//           <p className="text-red-600 dark:text-red-300 mb-4">
//             {error || "Patient not found"}
//           </p>
//           <Link
//             href="/doctor/patients"
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//           >
//             Back to Patients
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <EHRContext.Provider
//       value={{
//   patient,
//   medications,
//   setMedications,
//   vitals,
//   setVitals,
//   showHistoryModal,
//   setShowHistoryModal,
//   showAddMedicationModal,
//   setShowAddMedicationModal,
//   showAddVitalsModal,
//   setShowAddVitalsModal,
//   handleAddMedication,
//   handleAddVitals,
//   handleDeleteMedication,
//   loading,
//   error,
// }}
//     >
//       <style jsx global>{`
//         body {
//           font-family:
//             "Inter",
//             system-ui,
//             -apple-system,
//             BlinkMacSystemFont,
//             "Segoe UI",
//             Roboto,
//             "Helvetica Neue",
//             sans-serif;
//         }
//       `}</style>

//       <div className="bg-[#f6f7f8] min-h-screen text-slate-900 antialiased flex flex-col">
//         <main className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-2 py-4 gap-4">
//           {/* Profile Header (unchanged) */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
//             <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
//               <div
//                 className={`w-20 h-20 rounded-full ${avatarColorMap[patient.avatarColor]} flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md`}
//               >
//                 {patient.avatar}
//               </div>
//               <div className="flex flex-col gap-2 flex-1">
//                 <div className="flex flex-wrap items-center gap-3">
//                   <h1 className="text-2xl font-bold text-slate-900 leading-tight">
//                     {patient.name}
//                   </h1>
//                   <span
//                     className={`px-2.5 py-1 rounded-full ${
//                       patient.status === "Critical"
//                         ? "bg-red-50 text-red-700 border-red-100"
//                         : "bg-emerald-50 text-emerald-700 border-emerald-100"
//                     } text-xs font-bold uppercase tracking-wider border`}
//                   >
//                     {patient.status}
//                   </span>
//                 </div>
//                 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600 text-sm">
//                   <span className="flex items-center gap-1.5">
//                     <span className="material-symbols-outlined text-[16px] text-slate-400">
//                       fingerprint
//                     </span>
//                     <span className="font-medium">ID: {patient.patientId}</span>
//                   </span>
//                   <span className="hidden sm:inline text-slate-300">•</span>
//                   <span className="flex items-center gap-1.5">
//                     <span className="material-symbols-outlined text-[16px] text-slate-400">
//                       person
//                     </span>
//                     <span>
//                       {patient.age} Yrs, {patient.gender}
//                     </span>
//                   </span>
//                   {patient.allergies && patient.allergies[0] !== "None" && (
//                     <>
//                       <span className="hidden sm:inline text-slate-300">•</span>
//                       <span className="flex items-center gap-1.5 text-red-600 font-medium">
//                         <span className="material-symbols-outlined text-[16px]">
//                           warning
//                         </span>
//                         Allergies: {patient.allergies.join(", ")}
//                       </span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Layout Grid (unchanged) */}
//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
//             {/* Left Sidebar: Timeline */}
//             <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
//               <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
//                 <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//                   <h3 className="font-bold text-slate-900">Visit History</h3>
//                   <button
//                     onClick={() => setShowHistoryModal(true)}
//                     className="text-[#137fec] text-xs font-semibold hover:underline flex items-center gap-1"
//                   >
//                     View All
//                     <span className="material-symbols-outlined text-[16px]">
//                       chevron_right
//                     </span>
//                   </button>
//                 </div>
//                 <div className="p-4 relative">
//                   <div className="grid grid-cols-[24px_1fr] gap-x-4">
//                     {/* Current Visit */}
//                     <div className="flex flex-col items-center pt-1">
//                       <div className="w-6 h-6 bg-gradient-to-br from-[#137fec] to-blue-600 rounded-full flex items-center justify-center text-white shadow-md shadow-blue-200 z-10">
//                         <span className="material-symbols-outlined text-[14px]">
//                           edit_calendar
//                         </span>
//                       </div>
//                       <div className="w-[2px] bg-gradient-to-b from-blue-200 to-slate-200 h-full -mb-4"></div>
//                     </div>
//                     <div className="pb-8">
//                       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-3 shadow-sm">
//                         <p className="text-[#137fec] font-bold text-sm">
//                           Today's Visit
//                         </p>
//                         <p className="text-slate-600 text-xs mt-0.5">
//                           In Progress • {todayDoctor}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Past visits from completed visits */}
//                     {visitHistory.slice(0, 3).map((visit, idx) => (
//                       <React.Fragment key={`${visit.id}-${idx}`}>
//                         <div className="flex flex-col items-center pt-1">
//                           <div className="w-2 h-2 bg-slate-300 rounded-full z-10"></div>
//                           {idx < 2 && (
//                             <div className="w-[2px] bg-slate-200 h-full -mb-4"></div>
//                           )}
//                         </div>
//                         <div className={idx < 2 ? "pb-6" : "pb-2"}>
//                           <p className="text-slate-900 text-sm font-semibold">
//                             {visit.date}
//                           </p>
//                           <p className="text-slate-500 text-xs">
//                             {visit.type} • {visit.doctor}
//                           </p>
//                         </div>
//                       </React.Fragment>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right Content Area */}
//             <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
//               <div className="bg-white rounded-t-xl border border-slate-200 border-b-0">
//                 <div className="flex items-center px-6 pt-2 border-b border-slate-200 overflow-x-auto bg-slate-50/50">
//                   {tabs.map((tab) => (
//                     <Link
//                       key={tab.name}
//                       href={tab.href}
//                       className={`px-4 py-4 text-sm font-semibold border-b-2 focus:outline-none transition-colors whitespace-nowrap ${
//                         activeTab === tab.href.split("/").pop()
//                           ? "text-[#137fec] border-[#137fec] bg-white"
//                           : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-white"
//                       }`}
//                     >
//                       {tab.name}
//                     </Link>
//                   ))}
//                 </div>
//               </div>
//               <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6 md:p-8">
//                 {children}
//               </div>
//             </div>
//           </div>
//         </main>

//         {/* Modals */}
//         {showHistoryModal && (
//           <VisitHistoryModal
//             history={visitHistory}
//             onClose={() => setShowHistoryModal(false)}
//             onVisitClick={(visit) => {
//               setSelectedDate(visit.date);
//               setShowHistoryModal(false);
//               const [month, dayWithComma, year] = visit.date.split(" ");
//               const day = parseInt(dayWithComma.replace(",", ""), 10);
//               const monthNames = [
//                 "Jan",
//                 "Feb",
//                 "Mar",
//                 "Apr",
//                 "May",
//                 "Jun",
//                 "Jul",
//                 "Aug",
//                 "Sep",
//                 "Oct",
//                 "Nov",
//                 "Dec",
//               ];
//               const monthIndex = monthNames.indexOf(month);
//               if (monthIndex === -1) return;
//               const dateStr = `${year}-${(monthIndex + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
//               router.push(
//                 `/doctor/ehr/${patientId}/current-visit?date=${dateStr}`,
//               );
//             }}
//             onViewVitals={(visit) => {
//               console.log("onViewVitals called with visit:", visit);
//               const [month, dayWithComma, year] = visit.date.split(" ");
//               const day = parseInt(dayWithComma.replace(",", ""), 10);
//               const monthNames = [
//                 "Jan",
//                 "Feb",
//                 "Mar",
//                 "Apr",
//                 "May",
//                 "Jun",
//                 "Jul",
//                 "Aug",
//                 "Sep",
//                 "Oct",
//                 "Nov",
//                 "Dec",
//               ];
//               const monthIndex = monthNames.indexOf(month);
//               if (monthIndex === -1) {
//                 console.error("Month not found:", month);
//                 return;
//               }
//               const dateStr = `${year}-${(monthIndex + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
//               console.log("Navigating to vitals with date:", dateStr);
//               router.push(`/doctor/ehr/${patientId}/vitals?date=${dateStr}`);
//             }}
//           />
//         )}
//        {showAddMedicationModal && (
//   <AddMedicationModal
//     onClose={() => setShowAddMedicationModal(false)}
//     onAdd={handleAddMedication}
//   />
// )}
//        {showAddVitalsModal && (
//   <AddVitalsModal
//     onClose={() => setShowAddVitalsModal(false)}
//     onAdd={handleAddVitals}
//     initialVitals={newVitals}
//   />
// )}
//       </div>

//       <link
//         href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
//         rel="stylesheet"
//       />
//       <link
//         href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
//         rel="stylesheet"
//       />
//       <style jsx global>{`
//         .material-symbols-outlined {
//           font-variation-settings:
//             "FILL" 0,
//             "wght" 400,
//             "GRAD" 0,
//             "opsz" 24;
//         }
//       `}</style>
//     </EHRContext.Provider>
//   );
// }





"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { useParams, usePathname, useRouter ,useSearchParams } from "next/navigation";
import Link from "next/link";
import React from "react";

// Import modal components
import VisitHistoryModal from "@/components/doctor/VisitHistoryModal";
import AddVitalsModal from "@/components/doctor/AddVitalsModal";

// Import API clients
import { currentVisitApi } from "@/lib/api/ehr";
import AddMedicationModal, { NewMedicationData } from "@/components/doctor/AddMedicationModal";
import toast from "react-hot-toast";

// ✅ Import AI Insights component
import ClinicalInsights from "@/components/doctor/ClinicalInsights";

export interface ApiVisit {
  appointment_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  status: string;
  notes: string;
  doctor_name: string;
  doctor_specialty: string;
  diagnosis: string | null;
  icd10_code: string | null;
  clinical_notes: string | null;
  follow_up_date: string | null;
  patient_instructions: string | null;
}
// Types (unchanged)
interface Medication {
  id: number;
  name: string;
  category: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  color: string;
}

interface Vital {
  id: number;
  date: string;
  time: string;
  bp: string;
  hr: number;
  temp: number;
  weight: number;
  rr: number;
  spo2: number;
  recordedBy: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  patientId: string;
  allergies: string[];
  status: string;
  phone: string;
  email: string;
  city: string;
  bloodGroup: string;
  avatar: string;
  avatarColor: string;
}

interface Visit {
  id: string;
  date: string;
  type: string;
  doctor: string;
  notes: string;
  diagnosis: string;
}
interface EHRContextType {
  patient: Patient | null;
  medications: Medication[];
  setMedications: React.Dispatch<React.SetStateAction<Medication[]>>;
  vitals: Vital[];
  setVitals: React.Dispatch<React.SetStateAction<Vital[]>>;
  showHistoryModal: boolean;
  setShowHistoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  showAddMedicationModal: boolean;
  setShowAddMedicationModal: React.Dispatch<React.SetStateAction<boolean>>;
  showAddVitalsModal: boolean;
  setShowAddVitalsModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddMedication: (medications: NewMedicationData[]) => void;
  handleAddVitals: (vitalsData: { bp: string; hr: string; temp: string; weight: string; rr: string; spo2: string }) => void;
  handleDeleteMedication: (id: number) => void;
  loading: boolean;
  error: string | null;
}

const EHRContext = createContext<EHRContextType | undefined>(undefined);

export const useEHR = () => {
  const context = useContext(EHRContext);
  if (!context) throw new Error("useEHR must be used within EHRProvider");
  return context;
};

// Helper functions (unchanged)
const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const getAvatarColor = (id: string): string => {
  const colors = ["blue", "green", "purple", "orange", "red"];
  const lastChar = id.slice(-1);
  const num = parseInt(lastChar, 10);
  const index = isNaN(num) ? 0 : num % colors.length;
  return colors[index];
};

const formatGender = (gender: string): string => {
  if (!gender) return "Other";
  const g = gender.toLowerCase();
  if (g === "male") return "M";
  if (g === "female") return "F";
  return "Other";
};

export default function EHRLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [visitHistory, setVisitHistory] = useState<Visit[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showAddVitalsModal, setShowAddVitalsModal] = useState(false);

  const [newVitals, setNewVitals] = useState({
    bp: "",
    hr: "",
    temp: "",
    weight: "",
    rr: "",
    spo2: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ✅ AI Insights modal state
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [insightsData, setInsightsData] = useState({
    diagnosis: "",
    clinicalNotes: "",
    vitals: { bp: "", hr: "", temp: "", weight: "", rr: "", spo2: "" },
  });
  const [loadingInsights, setLoadingInsights] = useState(false);

  const searchParams = useSearchParams();
  const currentDate = searchParams.get('date');
  const dateQuery = currentDate ? `?date=${currentDate}` : '';
  
  useEffect(() => {
    console.log("appointmentsList updated:", appointmentsList);
  }, [appointmentsList]);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      setLoading(true);
      setError(null);

      try {
        const patientRes = await fetch(`/api/registration?patientId=${patientId}`);
        const patientJson = await patientRes.json();
        if (!patientJson.success) throw new Error(patientJson.message || "Failed to fetch patient");
        const patientData = patientJson.data;

        let completedVisits: ApiVisit[] = [];
        try {
          const visitsRes = await currentVisitApi.getCompletedVisits(patientId);
          completedVisits = visitsRes;
        } catch (visitErr) {
          console.error("Error fetching completed visits:", visitErr);
          completedVisits = [];
        }
        setAppointmentsList(completedVisits);

        const transformedPatient: Patient = {
          id: patientData.patient_id,
          name: patientData.full_name_en || "Unknown",
          age: calculateAge(patientData.dob),
          gender: formatGender(patientData.gender),
          patientId: patientData.patient_id,
          phone: patientData.phone || "",
          email: patientData.email || "",
          city: patientData.city || "",
          bloodGroup: patientData.blood_group || "",
          allergies: patientData.allergy ? [patientData.allergy] : patientData.allergies || [],
          status: patientData.status || "Active",
          avatar: patientData.full_name_en?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "PT",
          avatarColor: getAvatarColor(patientData.patient_id),
        };

        const history: Visit[] = completedVisits.map((visit: any) => ({
          id: visit.appointment_id,
          date: new Date(visit.appointment_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          type: visit.consultation_type === "in-person" ? "In-Person" : "Teleconsultation",
          doctor: visit.doctor_name || "Dr. Unknown",
          notes: visit.notes || "",
          diagnosis: visit.diagnosis || "No diagnosis",
        }));

        setPatient(transformedPatient);
        setVisitHistory(history);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const handleAddMedication = async (medicationsArray: NewMedicationData[]) => {
    const colors = ["blue", "amber", "green", "purple", "pink"];
    const newMeds = medicationsArray.map((med, idx) => ({
      id: Date.now() + idx,
      ...med,
      color: colors[idx % colors.length],
    }));
    setMedications([...medications, ...newMeds]);
    const payload = {
      date: currentDate || todayStr,
      recordedBy: "Dr. Sarah Jenkins",
      medications: medicationsArray,
    };
    try {
      const response = await currentVisitApi.savePrescriptions(patientId, payload);
      if (response.data?.success) {
        toast.success(`${medicationsArray.length} medication(s) saved`);
      } else {
        throw new Error(response.data?.message || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving prescriptions:", error);
      setMedications(medications);
    }
  };

  const handleAddVitals = (vitalsData: { bp: string; hr: string; temp: string; weight: string; rr: string; spo2: string }) => {
    if (vitalsData.bp && vitalsData.hr && vitalsData.temp) {
      const today = new Date();
      const formattedDate = today.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const formattedTime = today.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setVitals([
        {
          id: Date.now(),
          date: formattedDate,
          time: formattedTime,
          bp: vitalsData.bp,
          hr: parseInt(vitalsData.hr),
          temp: parseFloat(vitalsData.temp),
          weight: parseFloat(vitalsData.weight) || 0,
          rr: parseInt(vitalsData.rr) || 0,
          spo2: parseInt(vitalsData.spo2) || 0,
          recordedBy: "Dr. Sarah Jenkins",
        },
        ...vitals,
      ]);
      setNewVitals({ bp: "", hr: "", temp: "", weight: "", rr: "", spo2: "" });
      setShowAddVitalsModal(false);
    }
  };

  const handleDeleteMedication = async (id: number) => {
    const previousMedications = medications;
    setMedications(medications.filter((med) => med.id !== id));
    try {
      const response = await currentVisitApi.deletePrescription(patientId, id.toString());
      if (response.data?.success) {
        toast.success('Prescription deleted');
      } else {
        throw new Error(response.data?.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast.error('Failed to delete prescription');
      setMedications(previousMedications);
    }
  };

  const avatarColorMap: Record<string, string> = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    orange: "bg-orange-600",
    red: "bg-red-600",
    gray: "bg-gray-600",
  };

  const tabs = [
    { name: "Vitals", href: `/doctor/ehr/${patientId}/vitals${dateQuery}` },
    { name: "Prescriptions", href: `/doctor/ehr/${patientId}/prescriptions${dateQuery}` },
    { name: "Current Visit", href: `/doctor/ehr/${patientId}/current-visit${dateQuery}` },
  ];

  const activeTab = pathname.split("/").pop() || "current-visit";

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppt = appointmentsList.find((apt: any) => apt.appointment_date?.split("T")[0] === todayStr);
  const todayDoctor = todayAppt ? todayAppt.doctor_name : "";

  // ✅ Function to load latest data for AI insights
 interface VisitData {
  diagnosis?: string;
  clinical_notes?: string;
  [key: string]: any; // allow other fields
}

const loadInsightsData = async () => {
  if (!patientId) return;
  setLoadingInsights(true);
  try {
    const fetchDate = currentDate || new Date().toISOString().split('T')[0];
    console.log("📅 Fetching data for date:", fetchDate);

    // 1. Fetch current visit (diagnosis, clinical notes)
    let currentVisitRes;
    let visitData: VisitData = {};
    try {
      currentVisitRes = await currentVisitApi.getCurrentVisitByDate(patientId, fetchDate);
      console.log("📡 Raw currentVisitRes:", currentVisitRes);

      if (currentVisitRes?.data) {
        visitData = currentVisitRes.data as VisitData;
      } else if (currentVisitRes?.diagnosis !== undefined) {
        visitData = currentVisitRes as VisitData;
      }
      console.log("✅ Extracted visitData:", visitData);
    } catch (e) {
      console.error("❌ Error fetching current visit:", e);
    }

    // 2. Fetch latest vitals using the same date
    let vitalsList: any[] = [];
    try {
      const vitalsRes = await currentVisitApi.getVitalsByDate(patientId, fetchDate);
      console.log("📡 Raw vitalsRes:", vitalsRes);
      if (vitalsRes?.data && Array.isArray(vitalsRes.data)) {
        vitalsList = vitalsRes.data;
      } else if (Array.isArray(vitalsRes)) {
        vitalsList = vitalsRes;
      }
    } catch (e) {
      console.error("❌ Error fetching vitals:", e);
    }
    const latestVitals = vitalsList.length > 0 ? vitalsList[0] : {};

    setInsightsData({
      diagnosis: visitData.diagnosis || "",
      clinicalNotes: visitData.clinical_notes || "",
      vitals: {
        bp: latestVitals.bp || "",
        hr: latestVitals.hr?.toString() || "",
        temp: latestVitals.temp?.toString() || "",
        weight: latestVitals.weight?.toString() || "",
        rr: latestVitals.rr?.toString() || "",
        spo2: latestVitals.spo2?.toString() || "",
      },
    });
  } catch (err) {
    console.error("Failed to load insights data:", err);
    toast.error("Could not load patient data for AI insights");
  } finally {
    setLoadingInsights(false);
  }
};

  useEffect(() => {
    if (showInsightsModal) {
      loadInsightsData();
    }
  }, [showInsightsModal, patientId]);

  // Loading / error UI (unchanged)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#137fec] border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
          <h2 className="text-xl font-bold text-red-700 mb-2">Failed to Load Patient</h2>
          <p className="text-red-600 mb-4">{error || "Patient not found"}</p>
          <Link href="/doctor/patients" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <EHRContext.Provider
      value={{
        patient,
        medications,
        setMedications,
        vitals,
        setVitals,
        showHistoryModal,
        setShowHistoryModal,
        showAddMedicationModal,
        setShowAddMedicationModal,
        showAddVitalsModal,
        setShowAddVitalsModal,
        handleAddMedication,
        handleAddVitals,
        handleDeleteMedication,
        loading,
        error,
      }}
    >
      <style jsx global>{`
        body { font-family: "Inter", system-ui, sans-serif; }
      `}</style>

      <div className="bg-[#f6f7f8] min-h-screen text-slate-900 antialiased flex flex-col">
        <main className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-2 py-4 gap-4">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className={`w-20 h-20 rounded-full ${avatarColorMap[patient.avatarColor]} flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md`}>
                {patient.avatar}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                  <span className={`px-2.5 py-1 rounded-full ${patient.status === "Critical" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"} text-xs font-bold uppercase border`}>
                    {patient.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                    <span>ID: {patient.patientId}</span>
                  </span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span>{patient.age} Yrs, {patient.gender}</span>
                  </span>
                  {patient.allergies && patient.allergies[0] !== "None" && (
                    <>
                      <span className="hidden sm:inline text-slate-300">•</span>
                      <span className="flex items-center gap-1.5 text-red-600 font-medium">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        Allergies: {patient.allergies.join(", ")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Sidebar: Timeline */}
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-900">Visit History</h3>
                  <button onClick={() => setShowHistoryModal(true)} className="text-[#137fec] text-xs font-semibold hover:underline flex items-center gap-1">
                    View All <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
                <div className="p-4 relative">
                  <div className="grid grid-cols-[24px_1fr] gap-x-4">
                    {/* Current Visit */}
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#137fec] to-blue-600 rounded-full flex items-center justify-center text-white shadow-md z-10">
                        <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
                      </div>
                      <div className="w-[2px] bg-gradient-to-b from-blue-200 to-slate-200 h-full -mb-4"></div>
                    </div>
                    <div className="pb-8">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-3 shadow-sm">
                        <p className="text-[#137fec] font-bold text-sm">Today's Visit</p>
                        <p className="text-slate-600 text-xs mt-0.5">In Progress • {todayDoctor}</p>
                      </div>
                    </div>

                    {/* Past visits */}
                    {visitHistory.slice(0, 3).map((visit, idx) => (
                      <React.Fragment key={`${visit.id}-${idx}`}>
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-2 h-2 bg-slate-300 rounded-full z-10"></div>
                          {idx < 2 && <div className="w-[2px] bg-slate-200 h-full -mb-4"></div>}
                        </div>
                        <div className={idx < 2 ? "pb-6" : "pb-2"}>
                          <p className="text-slate-900 text-sm font-semibold">{visit.date}</p>
                          <p className="text-slate-500 text-xs">{visit.type} • {visit.doctor}</p>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
              <div className="bg-white rounded-t-xl border border-slate-200 border-b-0">
                <div className="flex items-center px-6 pt-2 border-b border-slate-200 overflow-x-auto bg-slate-50/50">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className={`px-4 py-4 text-sm font-semibold border-b-2 whitespace-nowrap ${
                        activeTab === tab.href.split("/").pop()
                          ? "text-[#137fec] border-[#137fec] bg-white"
                          : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-white"
                      }`}
                    >
                      {tab.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6 md:p-8">
                {children}
              </div>
            </div>
          </div>
        </main>

        {/* ✅ Floating AI Assistant Button */}
   <div className="fixed bottom-6 right-6 z-[9999]">
  <button
    onClick={() => {
      console.log("AI button clicked");
      setShowInsightsModal(true);
    }}
    style={{ pointerEvents: 'auto', position: 'relative', cursor: 'pointer' }}
    className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
    title="AI Clinical Assistant"
  >
    <span className="material-symbols-outlined text-2xl">smart_toy</span>
  </button>
</div>
        {/* ✅ AI Insights Modal */}
        {showInsightsModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    {/* No console.log here */}
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600">smart_toy</span>
          <h3 className="text-lg font-semibold text-slate-900">AI Clinical Assistant</h3>
        </div>
        <button onClick={() => setShowInsightsModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="p-6">
        {loadingInsights ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
            <span className="ml-3 text-slate-600">Loading patient data...</span>
          </div>
        ) : (
          <ClinicalInsights
            diagnosis={insightsData.diagnosis}
            clinicalNotes={insightsData.clinicalNotes}
            vitals={insightsData.vitals}
            onCopyToNotes={(insightsText) => {
              navigator.clipboard.writeText(insightsText);
              toast.success("Insights copied to clipboard");
            }}
            onRefresh={loadInsightsData}
          />
        )}
      </div>
    </div>
  </div>
)}

        {/* Existing Modals */}
        {showHistoryModal && (
          <VisitHistoryModal
            history={visitHistory}
            onClose={() => setShowHistoryModal(false)}
            onVisitClick={(visit) => {
              setSelectedDate(visit.date);
              setShowHistoryModal(false);
              const [month, dayWithComma, year] = visit.date.split(" ");
              const day = parseInt(dayWithComma.replace(",", ""), 10);
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const monthIndex = monthNames.indexOf(month);
              if (monthIndex === -1) return;
              const dateStr = `${year}-${(monthIndex + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
              router.push(`/doctor/ehr/${patientId}/current-visit?date=${dateStr}`);
            }}
            onViewVitals={(visit) => {
              const [month, dayWithComma, year] = visit.date.split(" ");
              const day = parseInt(dayWithComma.replace(",", ""), 10);
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const monthIndex = monthNames.indexOf(month);
              if (monthIndex === -1) return;
              const dateStr = `${year}-${(monthIndex + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
              router.push(`/doctor/ehr/${patientId}/vitals?date=${dateStr}`);
            }}
          />
        )}
        {showAddMedicationModal && (
          <AddMedicationModal onClose={() => setShowAddMedicationModal(false)} onAdd={handleAddMedication} />
        )}
        {showAddVitalsModal && (
          <AddVitalsModal
            onClose={() => setShowAddVitalsModal(false)}
            onAdd={handleAddVitals}
            initialVitals={newVitals}
          />
        )}
      </div>

      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style jsx global>{`
        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
        }
      `}</style>
    </EHRContext.Provider>
  );
}