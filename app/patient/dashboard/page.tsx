// // "use client";

// // import { useState, useEffect, useRef } from "react";
// // import Link from "next/link";
// // import Sidebar from "@/components/patient/Sidebar";
// // import { useRouter } from "next/navigation";
// // import { Menu, X, Filter } from "lucide-react";
// // import toast from "react-hot-toast";
// // import { appointmentsApi } from "@/lib/api/appointments";
// // import RescheduleModal from "@/components/patient/RescheduleModal";

// // interface Appointment {
// //   id: string;
// //   date: string;
// //   time: string;
// //   type: string;
// //   status: string;
// //   notes: string;
// //   doctor_id: string;
// //   doctor_name: string;
// //   doctor_specialty: string;
// //   doctor_image: string | null;
// //   fee: number;
// // }

// // export default function HomePage() {
// //   const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "canceled">("upcoming");
// //   const [consultationType, setConsultationType] = useState("All Types");
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
// //   const [appointments, setAppointments] = useState<Appointment[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [userName, setUserName] = useState("Patient");
// //   const [selectedDate, setSelectedDate] = useState("");
// //   const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
// // const [showRescheduleModal, setShowRescheduleModal] = useState(false);
// //   const router = useRouter();

// //   // Column filters (date and status removed)
// //   const [filters, setFilters] = useState({
// //     doctor: "",
// //     time: "",
// //     type: "",
// //   });

// //   const [openFilter, setOpenFilter] = useState<string | null>(null);
// //   const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

// //   useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (
// //         openFilter &&
// //         filterRefs.current[openFilter] &&
// //         !filterRefs.current[openFilter]?.contains(event.target as Node)
// //       ) {
// //         setOpenFilter(null);
// //       }
// //     };
// //     document.addEventListener("mousedown", handleClickOutside);
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, [openFilter]);

// //   // Helper to get full datetime from appointment
// //   const getFullDateTime = (apt: Appointment): Date => {
// //     const [year, month, day] = apt.date.split('T')[0].split('-').map(Number);
// //     let hours = 0, minutes = 0;
// //     if (apt.time.includes(' ')) {
// //       const [time, modifier] = apt.time.split(' ');
// //       let [h, m] = time.split(':').map(Number);
// //       if (modifier.toUpperCase() === 'PM' && h !== 12) h += 12;
// //       if (modifier.toUpperCase() === 'AM' && h === 12) h = 0;
// //       hours = h;
// //       minutes = m;
// //     } else {
// //       [hours, minutes] = apt.time.split(':').map(Number);
// //     }
// //     return new Date(year, month - 1, day, hours, minutes, 0);
// //   };

// //   const now = new Date();

// //   const upcoming = appointments.filter(apt => {
// //     if (apt.status !== "BOOKED") return false;
// //     const aptDateTime = getFullDateTime(apt);
// //     return aptDateTime >= now;
// //   });

// //   const past = appointments.filter(apt => {
// //     if (apt.status === "CANCELLED") return false;
// //     if (apt.status === "COMPLETED") return true;
// //     if (apt.status === "BOOKED") {
// //       const aptDateTime = getFullDateTime(apt);
// //       return aptDateTime < now;
// //     }
// //     return false;
// //   });

// //   const canceled = appointments.filter(apt => apt.status === "CANCELLED");

// //   const filterByConsultationType = (list: Appointment[]) => {
// //     if (consultationType === "All Types") return list;
// //     return list.filter(apt => apt.type?.toLowerCase() === consultationType.toLowerCase());
// //   };

// //   const baseDisplayed = (() => {
// //     switch (activeTab) {
// //       case "upcoming": return filterByConsultationType(upcoming);
// //       case "past": return filterByConsultationType(past);
// //       case "canceled": return filterByConsultationType(canceled);
// //       default: return [];
// //     }
// //   })();

// //   // Apply column filters (date and status removed)
// //   const displayedAppointments = baseDisplayed.filter(apt => {
// //     const matchDoctor = !filters.doctor || apt.doctor_name.toLowerCase().includes(filters.doctor.toLowerCase());
// //     const matchTime = !filters.time || apt.time.toLowerCase().includes(filters.time.toLowerCase());
// //     const matchType = !filters.type || apt.type?.toLowerCase() === filters.type.toLowerCase();
// //     return matchDoctor && matchTime && matchType;
// //   });

// //   const isEditable = (apt: Appointment): boolean => {
// //     if (apt.status !== "BOOKED") return false;
// //     const aptDate = new Date(apt.date);
// //     const today = new Date();
// //     const aptDay = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
// //     const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
// //     return aptDay >= todayDay;
// //   };

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const user = JSON.parse(localStorage.getItem("user") || "null");
// //         if (!user || !user.id) {
// //           toast.error("Please login first");
// //           router.push("/login");
// //           return;
// //         }
// //         setUserName(user.full_name_en || user.name || "Patient");
// //         const patientId = user.patient_id || String(user.id);
// //         await fetchAppointments(patientId, selectedDate || undefined);
// //       } catch (error) {
// //         toast.error("Failed to load user data");
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, [router, selectedDate]);

// //   const fetchAppointments = async (patientId: string, date?: string) => {
// //     try {
// //       setLoading(true);
// //       const response = await appointmentsApi.getPatientAppointmentsByDate(patientId, date);
// //       const result = response.data;

// //       let apts: Appointment[] = [];
// //       if (Array.isArray(result)) {
// //         apts = result;
// //       } else if (result?.success && Array.isArray(result.data)) {
// //         apts = result.data;
// //       } else {
// //         setAppointments([]);
// //         setLoading(false);
// //         return;
// //       }

// //       setAppointments(apts);

// //       const upcomingCount = apts.filter(apt => {
// //         if (apt.status !== "BOOKED") return false;
// //         const aptDateTime = getFullDateTime(apt);
// //         return aptDateTime >= now;
// //       }).length;

// //       const pastCount = apts.filter(apt => {
// //         if (apt.status === "CANCELLED") return false;
// //         if (apt.status === "COMPLETED") return true;
// //         if (apt.status === "BOOKED") {
// //           const aptDateTime = getFullDateTime(apt);
// //           return aptDateTime < now;
// //         }
// //         return false;
// //       }).length;

// //       const canceledCount = apts.filter(apt => apt.status === "CANCELLED").length;

// //       if (activeTab === "upcoming" && upcomingCount === 0 && (pastCount > 0 || canceledCount > 0)) {
// //         if (pastCount > 0) setActiveTab("past");
// //         else if (canceledCount > 0) setActiveTab("canceled");
// //       } else if (activeTab === "past" && pastCount === 0 && (upcomingCount > 0 || canceledCount > 0)) {
// //         if (upcomingCount > 0) setActiveTab("upcoming");
// //         else if (canceledCount > 0) setActiveTab("canceled");
// //       } else if (activeTab === "canceled" && canceledCount === 0 && (upcomingCount > 0 || pastCount > 0)) {
// //         if (upcomingCount > 0) setActiveTab("upcoming");
// //         else if (pastCount > 0) setActiveTab("past");
// //       }
// //     } catch (error) {
// //       setAppointments([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleCancel = async (appointmentId: string) => {
// //     if (!confirm("Are you sure you want to cancel this appointment?")) return;
// //     try {
// //       await appointmentsApi.updateAppointment(appointmentId, { status: "CANCELLED" });
// //       toast.success("Appointment cancelled successfully");
// //       const user = JSON.parse(localStorage.getItem("user") || "null");
// //       if (user) {
// //         const patientId = user.patient_id || String(user.id);
// //         await fetchAppointments(patientId, selectedDate || undefined);
// //       }
// //     } catch (error) {
// //       console.error("Cancel error:", error);
// //       toast.error("Failed to cancel appointment");
// //     }
// //   };

// // const handleReschedule = (appointment: Appointment) => {
// //   setRescheduleAppointment(appointment);
// //   setShowRescheduleModal(true);
// // };

// //   const handleFilterChange = (column: keyof typeof filters, value: string) => {
// //     setFilters(prev => ({ ...prev, [column]: value }));
// //   };

// //   // FilterPopover with local state and Apply button
// //   const FilterPopover = ({ column, placeholder }: { column: keyof typeof filters; placeholder: string }) => {
// //     const isOpen = openFilter === column;
// //     const [localValue, setLocalValue] = useState(filters[column]);

// //     useEffect(() => {
// //       if (isOpen) {
// //         setLocalValue(filters[column]);
// //       }
// //     }, [isOpen, filters, column]);

// //     const handleApply = () => {
// //       handleFilterChange(column, localValue);
// //       setOpenFilter(null);
// //     };

// //     const handleClear = () => {
// //       setLocalValue("");
// //       handleFilterChange(column, "");
// //       setOpenFilter(null);
// //     };

// //     const handleKeyDown = (e: React.KeyboardEvent) => {
// //       if (e.key === 'Enter') {
// //         handleApply();
// //       }
// //     };

// //     return (
// //       <div
// //         className="relative inline-block"
// //         ref={(el) => {
// //           filterRefs.current[column] = el;
// //         }}
// //       >
// //         <button
// //           onClick={() => setOpenFilter(isOpen ? null : column)}
// //           className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${filters[column] ? "text-blue-600" : "text-gray-400"}`}
// //           aria-label={`Filter by ${column}`}
// //         >
// //           <Filter className="h-3.5 w-3.5" />
// //         </button>
// //         {isOpen && (
// //           <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
// //             <div className="space-y-2">
// //               <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Filter by {column}
// //               </h4>
// //               <input
// //                 type="text"
// //                 placeholder={placeholder}
// //                 value={localValue}
// //                 onChange={(e) => setLocalValue(e.target.value)}
// //                 onKeyDown={handleKeyDown}
// //                 className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-900"
// //                 autoFocus
// //               />
// //               <div className="flex justify-end gap-2">
// //                 <button
// //                   onClick={handleClear}
// //                   className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
// //                 >
// //                   Clear
// //                 </button>
// //                 <button
// //                   onClick={handleApply}
// //                   className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
// //                 >
// //                   Apply
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     );
// //   };

// //   const formatDate = (dateStr: string) => {
// //     const date = new Date(dateStr);
// //     return {
// //       day: date.getDate().toString().padStart(2, '0'),
// //       month: date.toLocaleDateString('en-US', { month: 'short' }),
// //       full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
// //     };
// //   };

// //   const getStatusColor = (status: string) => {
// //     switch (status) {
// //       case "BOOKED": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
// //       case "COMPLETED": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
// //       case "CANCELLED": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
// //       default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
// //     }
// //   };

// //   const getStatusText = (status: string) => {
// //     switch (status) {
// //       case "BOOKED": return "Confirmed";
// //       case "COMPLETED": return "Completed";
// //       case "CANCELLED": return "Cancelled";
// //       default: return status;
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-display antialiased">
// //       <style jsx global>{`
// //         @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
// //         @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");
// //         @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
// //         :root { --font-inter: "Inter", sans-serif; }
// //         body { font-family: var(--font-inter); }
// //       `}</style>

// //       <button
// //         className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
// //         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
// //         aria-label="Toggle menu"
// //       >
// //         {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
// //       </button>

// //       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
// //       {isSidebarOpen && (
// //         <div
// //           className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
// //           onClick={() => setIsSidebarOpen(false)}
// //         />
// //       )}

// //       <main className="flex-1 flex flex-col h-screen overflow-hidden">
// //         <div className="flex-1 overflow-y-auto p-6 md:p-8">
// //           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
// //             <div>
// //               <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
// //                 Welcome, <span className="text-green-600">{userName}</span> 👋
// //               </h1>
// //               <p className="text-gray-500 dark:text-gray-400 text-sm">
// //                 Here's a quick look at your appointments.
// //               </p>
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <input
// //                 type="date"
// //                 value={selectedDate}
// //                 onChange={(e) => setSelectedDate(e.target.value)}
// //                 className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
// //               />
// //               <Link href="/doctor-selection">
// //                 <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap">
// //                   <span className="material-icons text-lg">add</span>
// //                   Book New
// //                 </button>
// //               </Link>
// //             </div>
// //           </div>

// //           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
// //             {[
// //               { name: "Doctor Consultation", icon: "local_hospital", path: "/appointments" },
// //               { name: "Medical Records", icon: "folder", path: "/patient/medical-records" },
// //               { name: "History", icon: "history", path: "/patient/admission-summary" },
// //               { name: "Diagnostics", icon: "biotech", path: "/diagnostics" },
// //             ].map((service) => (
// //               <div
// //                 key={service.name}
// //                 onClick={() => router.push(service.path)}
// //                 className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-900 shadow-sm hover:shadow-md hover:border-green-400 dark:hover:border-green-700 transition-all cursor-pointer flex flex-col items-center text-center"
// //               >
// //                 <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
// //                   <span className="material-icons text-green-600 dark:text-green-400 text-2xl">
// //                     {service.icon}
// //                   </span>
// //                 </div>
// //                 <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
// //                   {service.name}
// //                 </h3>
// //               </div>
// //             ))}
// //           </div>

// //           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-green-200 dark:border-green-900 pb-4 mb-8 gap-4">
// //             <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-green-200 dark:border-green-900">
// //               <button
// //                 onClick={() => setActiveTab("upcoming")}
// //                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
// //                   activeTab === "upcoming"
// //                     ? "bg-green-600 text-white shadow-sm"
// //                     : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
// //                 }`}
// //               >
// //                 Upcoming ({upcoming.length})
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("past")}
// //                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
// //                   activeTab === "past"
// //                     ? "bg-green-600 text-white shadow-sm"
// //                     : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
// //                 }`}
// //               >
// //                 Past ({past.length})
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("canceled")}
// //                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
// //                   activeTab === "canceled"
// //                     ? "bg-green-600 text-white shadow-sm"
// //                     : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
// //                 }`}
// //               >
// //                 Canceled ({canceled.length})
// //               </button>
// //             </div>

// //             <div className="flex items-center gap-2">
// //               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">
// //                 Filter by:
// //               </span>
// //               <select
// //                 value={consultationType}
// //                 onChange={(e) => setConsultationType(e.target.value)}
// //                 className="form-select bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 py-1.5 pl-3 pr-8"
// //               >
// //                 <option>All Types</option>
// //                 <option>teleconsultation</option>
// //                 <option>in-person</option>
// //               </select>
// //             </div>
// //           </div>

// //           {loading && (
// //             <div className="text-center py-12">
// //               <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
// //               <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your appointments...</p>
// //             </div>
// //           )}

// //           {!loading && displayedAppointments.length === 0 && (
// //             <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
// //               <span className="material-icons text-5xl text-gray-400 mb-3">event_busy</span>
// //               <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
// //                 No {activeTab} appointments
// //               </h3>
// //               <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
// //                 {activeTab === "upcoming"
// //                   ? "You don't have any upcoming appointments."
// //                   : activeTab === "past"
// //                   ? "No past appointments found."
// //                   : "No canceled appointments."}
// //               </p>
// //               {activeTab === "upcoming" && (
// //                 <Link href="/doctor-selection">
// //                   <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
// //                     Book an Appointment
// //                   </button>
// //                 </Link>
// //               )}
// //             </div>
// //           )}

// //           {!loading && displayedAppointments.length > 0 && (
// //             <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
// //               <div className="overflow-x-auto">
// //                 <table className="w-full text-left text-sm border-collapse border border-gray-200 dark:border-gray-700">
// //                   <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400">
// //                     <tr>
// //                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
// //                         <div className="flex items-center gap-2">
// //                           <span>Doctor</span>
// //                           <FilterPopover column="doctor" placeholder="Filter by doctor..." />
// //                         </div>
// //                       </th>
// //                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
// //                         Date
// //                       </th>
// //                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
// //                         <div className="flex items-center gap-2">
// //                           <span>Time</span>
// //                           <FilterPopover column="time" placeholder="Filter by time..." />
// //                         </div>
// //                       </th>
// //                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
// //                         <div className="flex items-center gap-2">
// //                           <span>Type</span>
// //                           <FilterPopover column="type" placeholder="Filter by type..." />
// //                         </div>
// //                       </th>
// //                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
// //                         Status
// //                       </th>
// //                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium text-right">
// //                         Actions
// //                       </th>
// //                     </tr>
// //                   </thead>
// //                   <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
// //                     {displayedAppointments.map((apt) => {
// //                       const formattedDate = formatDate(apt.date);
// //                       return (
// //                         <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
// //                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700">
// //                             <div className="flex items-center gap-3">
// //                               {apt.doctor_image ? (
// //                                 <img
// //                                   src={apt.doctor_image}
// //                                   alt={apt.doctor_name}
// //                                   className="w-10 h-10 rounded-full object-cover"
// //                                   onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/40")}
// //                                 />
// //                               ) : (
// //                                 <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
// //                                   <span className="material-icons text-xl">medication</span>
// //                                 </div>
// //                               )}
// //                               <div>
// //                                 <p className="font-medium text-gray-900 dark:text-white">
// //                                   {apt.doctor_name}
// //                                 </p>
// //                                 <p className="text-xs text-gray-500 dark:text-gray-400">
// //                                   {apt.doctor_specialty}
// //                                 </p>
// //                               </div>
// //                             </div>
// //                           </td>
// //                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
// //                             {formattedDate.full}
// //                           </td>
// //                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
// //                             {apt.time}
// //                           </td>
// //                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
// //                             {apt.type === "teleconsultation" ? "Teleconsult" : "In-Person"}
// //                           </td>
// //                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700">
// //                             <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(apt.status)}`}>
// //                               {getStatusText(apt.status)}
// //                             </span>
// //                           </td>
// //                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-right">
// //                             {isEditable(apt) ? (
// //                               <div className="flex justify-end gap-2">
// //                                <button
// //   onClick={() => handleReschedule(apt)}
// //   className="p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
// //   title="Reschedule"
// // >
// //   <span className="material-icons text-xl">edit_calendar</span>
// // </button>
// //                                 <button
// //                                   onClick={() => handleCancel(apt.id)}
// //                                   className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
// //                                   title="Cancel"
// //                                 >
// //                                   <span className="material-icons text-xl">cancel</span>
// //                                 </button>
// //                               </div>
// //                             ) : apt.status === "COMPLETED" ? (
// //                               <Link
// //                                 href={`/ehr/${apt.doctor_id}`}
// //                                 className="inline-flex p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
// //                                 title="View Summary"
// //                               >
// //                                 <span className="material-icons text-xl">description</span>
// //                               </Link>
// //                             ) : apt.status === "CANCELLED" ? (
// //                               <Link
// //                                 href={`/ehr/${apt.doctor_id}`}
// //                                 className="inline-flex p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
// //                                 title="View Details"
// //                               >
// //                                 <span className="material-icons text-xl">visibility</span>
// //                               </Link>
// //                             ) : (
// //                               <span className="text-gray-400 text-xs">Not editable</span>
// //                             )}
// //                           </td>
// //                         </tr>
// //                       );
// //                     })}
// //                   </tbody>
// //                 </table>
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }



// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import Sidebar from "@/components/patient/Sidebar";
// import { useRouter } from "next/navigation";
// import { Menu, X, Filter } from "lucide-react";
// import toast from "react-hot-toast";
// import { appointmentsApi } from "@/lib/api/appointments";
// import RescheduleModal from "@/components/patient/RescheduleModal";
// import { Video } from "lucide-react";

// interface Appointment {
//   id: string;
//   date: string;
//   time: string;
//   type: string;
//   status: string;
//   notes: string;
//   doctor_id: string;
//   doctor_name: string;
//   doctor_specialty: string;
//   doctor_image: string | null;
//   fee: number;
// }

// export default function HomePage() {
//   const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "canceled">(
//     "upcoming",
//   );
//   const [consultationType, setConsultationType] = useState("All Types");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [userName, setUserName] = useState("Patient");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [rescheduleAppointment, setRescheduleAppointment] =
//     useState<Appointment | null>(null);
//   const [showRescheduleModal, setShowRescheduleModal] = useState(false);
//   const router = useRouter();

//   // Column filters (date and status removed)
//   const [filters, setFilters] = useState({
//     doctor: "",
//     time: "",
//     type: "",
//   });

//   const [openFilter, setOpenFilter] = useState<string | null>(null);
//   const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         openFilter &&
//         filterRefs.current[openFilter] &&
//         !filterRefs.current[openFilter]?.contains(event.target as Node)
//       ) {
//         setOpenFilter(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [openFilter]);

//   // Helper to get full datetime from appointment
//   const getFullDateTime = (apt: Appointment): Date => {
//     const dateObj = new Date(apt.date);

//     let hours = 0,
//       minutes = 0;

//     if (apt.time.includes(" ")) {
//       const [time, modifier] = apt.time.split(" ");
//       let [h, m] = time.split(":").map(Number);

//       if (modifier.toUpperCase() === "PM" && h !== 12) h += 12;
//       if (modifier.toUpperCase() === "AM" && h === 12) h = 0;

//       hours = h;
//       minutes = m;
//     } else {
//       [hours, minutes] = apt.time.split(":").map(Number);
//     }

//     dateObj.setHours(hours, minutes, 0, 0);

//     return dateObj;
//   };

//   const now = new Date();

//   const upcoming = appointments.filter((apt) => {
//     if (apt.status !== "BOOKED") return false;
//     const aptDateTime = getFullDateTime(apt);
//     return aptDateTime >= new Date();
//   });

//   const past = appointments.filter((apt) => {
//     if (apt.status === "CANCELLED") return false;
//     if (apt.status === "COMPLETED") return true;

//     if (apt.status === "BOOKED") {
//       const aptDateTime = getFullDateTime(apt);
//       return aptDateTime < new Date();
//     }

//     return false;
//   });

//   const canceled = appointments.filter((apt) => apt.status === "CANCELLED");

//   const filterByConsultationType = (list: Appointment[]) => {
//     if (consultationType === "All Types") return list;
//     return list.filter(
//       (apt) => apt.type?.toLowerCase() === consultationType.toLowerCase(),
//     );
//   };

//   const baseDisplayed = (() => {
//     switch (activeTab) {
//       case "upcoming":
//         return filterByConsultationType(upcoming);
//       case "past":
//         return filterByConsultationType(past);
//       case "canceled":
//         return filterByConsultationType(canceled);
//       default:
//         return [];
//     }
//   })();

//   // Apply column filters (date and status removed)
//   const displayedAppointments = baseDisplayed.filter((apt) => {
//     const matchDoctor =
//       !filters.doctor ||
//       apt.doctor_name.toLowerCase().includes(filters.doctor.toLowerCase());
//     const matchTime =
//       !filters.time ||
//       apt.time.toLowerCase().includes(filters.time.toLowerCase());
//     const matchType =
//       !filters.type || apt.type?.toLowerCase() === filters.type.toLowerCase();
//     return matchDoctor && matchTime && matchType;
//   });

//   const isEditable = (apt: Appointment): boolean => {
//     if (apt.status !== "BOOKED") return false;
//     const aptDate = getFullDateTime(apt);
//     const today = new Date();
//     const aptDay = new Date(
//       aptDate.getFullYear(),
//       aptDate.getMonth(),
//       aptDate.getDate(),
//     );
//     const todayDay = new Date(
//       today.getFullYear(),
//       today.getMonth(),
//       today.getDate(),
//     );
//     return aptDay >= todayDay;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const user = JSON.parse(localStorage.getItem("user") || "null");

//         setUserName(user.full_name_en || user.name || "Patient");
//         const patientId = user.patient_id || String(user.id);
//         await fetchAppointments(patientId, selectedDate || undefined);
//       } catch (error) {
//         toast.error("Failed to load user data");
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [router, selectedDate]);

//   const fetchAppointments = async (patientId: string, date?: string) => {
//     try {
//       setLoading(true);
//       const response = await appointmentsApi.getPatientAppointmentsByDate(
//         patientId,
//         date,
//       );
//       const result = response.data;

//       let apts: Appointment[] = [];
//       if (Array.isArray(result)) {
//         apts = result;
//       } else if (result?.success && Array.isArray(result.data)) {
//         apts = result.data;
//       } else {
//         setAppointments([]);
//         setLoading(false);
//         return;
//       }

//       setAppointments(apts);

//       const upcomingCount = apts.filter((apt) => {
//         if (apt.status !== "BOOKED") return false;
//         const aptDateTime = getFullDateTime(apt);
//         return aptDateTime >= now;
//       }).length;

//       const pastCount = apts.filter((apt) => {
//         if (apt.status === "CANCELLED") return false;
//         if (apt.status === "COMPLETED") return true;
//         if (apt.status === "BOOKED") {
//           const aptDateTime = getFullDateTime(apt);
//           return aptDateTime < now;
//         }
//         return false;
//       }).length;

//       const canceledCount = apts.filter(
//         (apt) => apt.status === "CANCELLED",
//       ).length;

//       if (
//         activeTab === "upcoming" &&
//         upcomingCount === 0 &&
//         (pastCount > 0 || canceledCount > 0)
//       ) {
//         if (pastCount > 0) setActiveTab("past");
//         else if (canceledCount > 0) setActiveTab("canceled");
//       } else if (
//         activeTab === "past" &&
//         pastCount === 0 &&
//         (upcomingCount > 0 || canceledCount > 0)
//       ) {
//         if (upcomingCount > 0) setActiveTab("upcoming");
//         else if (canceledCount > 0) setActiveTab("canceled");
//       } else if (
//         activeTab === "canceled" &&
//         canceledCount === 0 &&
//         (upcomingCount > 0 || pastCount > 0)
//       ) {
//         if (upcomingCount > 0) setActiveTab("upcoming");
//         else if (pastCount > 0) setActiveTab("past");
//       }
//     } catch (error) {
//       setAppointments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = async (appointmentId: string) => {
//     if (!confirm("Are you sure you want to cancel this appointment?")) return;
//     try {
//       await appointmentsApi.updateAppointment(appointmentId, {
//         status: "CANCELLED",
//       });
//       toast.success("Appointment cancelled successfully");
//       const user = JSON.parse(localStorage.getItem("user") || "null");
//       if (user) {
//         const patientId = user.patient_id || String(user.id);
//         await fetchAppointments(patientId, selectedDate || undefined);
//       }
//     } catch (error) {
//       console.error("Cancel error:", error);
//       toast.error("Failed to cancel appointment");
//     }
//   };

//   const handleReschedule = (appointment: Appointment) => {
//     setRescheduleAppointment(appointment);
//     setShowRescheduleModal(true);
//   };

//   const handleFilterChange = (column: keyof typeof filters, value: string) => {
//     setFilters((prev) => ({ ...prev, [column]: value }));
//   };

//   // FilterPopover with local state and Apply button
//   const FilterPopover = ({
//     column,
//     placeholder,
//   }: {
//     column: keyof typeof filters;
//     placeholder: string;
//   }) => {
//     const isOpen = openFilter === column;
//     const [localValue, setLocalValue] = useState(filters[column]);

//     useEffect(() => {
//       if (isOpen) {
//         setLocalValue(filters[column]);
//       }
//     }, [isOpen, filters, column]);

//     const handleApply = () => {
//       handleFilterChange(column, localValue);
//       setOpenFilter(null);
//     };

//     const handleClear = () => {
//       setLocalValue("");
//       handleFilterChange(column, "");
//       setOpenFilter(null);
//     };

//     const handleKeyDown = (e: React.KeyboardEvent) => {
//       if (e.key === "Enter") {
//         handleApply();
//       }
//     };

//     return (
//       <div
//         className="relative inline-block"
//         ref={(el) => {
//           filterRefs.current[column] = el;
//         }}
//       >
//         <button
//           onClick={() => setOpenFilter(isOpen ? null : column)}
//           className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${filters[column] ? "text-blue-600" : "text-gray-400"}`}
//           aria-label={`Filter by ${column}`}
//         >
//           <Filter className="h-3.5 w-3.5" />
//         </button>
//         {isOpen && (
//           <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
//             <div className="space-y-2">
//               <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Filter by {column}
//               </h4>
//               <input
//                 type="text"
//                 placeholder={placeholder}
//                 value={localValue}
//                 onChange={(e) => setLocalValue(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-900"
//                 autoFocus
//               />
//               <div className="flex justify-end gap-2">
//                 <button
//                   onClick={handleClear}
//                   className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
//                 >
//                   Clear
//                 </button>
//                 <button
//                   onClick={handleApply}
//                   className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
//                 >
//                   Apply
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const formatDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     return {
//       day: date.getDate().toString().padStart(2, "0"),
//       month: date.toLocaleDateString("en-US", { month: "short" }),
//       full: date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric",
//       }),
//     };
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "BOOKED":
//         return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
//       case "COMPLETED":
//         return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
//       case "CANCELLED":
//         return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
//       default:
//         return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case "BOOKED":
//         return "Confirmed";
//       case "COMPLETED":
//         return "Completed";
//       case "CANCELLED":
//         return "Cancelled";
//       default:
//         return status;
//     }
//   };

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-display antialiased">
//       <style jsx global>{`
//         @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
//         @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");
//         @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
//         :root {
//           --font-inter: "Inter", sans-serif;
//         }
//         body {
//           font-family: var(--font-inter);
//         }
//       `}</style>

//       <button
//         className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//         aria-label="Toggle menu"
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

//       <main className="flex-1 flex flex-col h-screen overflow-hidden">
//         <div className="flex-1 overflow-y-auto p-6 md:p-8">
//           {/* Header */}
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
//                 Welcome, <span className="text-green-600">{userName}</span> 👋
//               </h1>
//               <p className="text-gray-500 dark:text-gray-400 text-sm">
//                 Here's a quick look at your appointments.
//               </p>
//             </div>
//             <div className="flex items-center gap-2">
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
//               />
//               <Link href="/doctor-selection">
//                 <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap">
//                   <span className="material-icons text-lg">add</span>
//                   Book New
//                 </button>
//               </Link>
//             </div>
//           </div>

//           {/* Service Cards */}
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
//             {[
//               {
//                 name: "Doctor Consultation",
//                 icon: "local_hospital",
//                 path: "/appointments",
//               },
//               {
//                 name: "Medical Records",
//                 icon: "folder",
//                 path: "/patient/medical-records",
//               },
//               {
//                 name: "History",
//                 icon: "history",
//                 path: "/patient/admission-summary",
//               },
//               { name: "Diagnostics", icon: "biotech", path: "/diagnostics" },
//             ].map((service) => (
//               <div
//                 key={service.name}
//                 onClick={() => router.push(service.path)}
//                 className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-900 shadow-sm hover:shadow-md hover:border-green-400 dark:hover:border-green-700 transition-all cursor-pointer flex flex-col items-center text-center"
//               >
//                 <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
//                   <span className="material-icons text-green-600 dark:text-green-400 text-2xl">
//                     {service.icon}
//                   </span>
//                 </div>
//                 <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
//                   {service.name}
//                 </h3>
//               </div>
//             ))}
//           </div>

//           {/* Tabs & Consultation Type Filter */}
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-green-200 dark:border-green-900 pb-4 mb-8 gap-4">
//             <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-green-200 dark:border-green-900">
//               <button
//                 onClick={() => setActiveTab("upcoming")}
//                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                   activeTab === "upcoming"
//                     ? "bg-green-600 text-white shadow-sm"
//                     : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
//                 }`}
//               >
//                 Upcoming ({upcoming.length})
//               </button>
//               <button
//                 onClick={() => setActiveTab("past")}
//                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                   activeTab === "past"
//                     ? "bg-green-600 text-white shadow-sm"
//                     : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
//                 }`}
//               >
//                 Past ({past.length})
//               </button>
//               <button
//                 onClick={() => setActiveTab("canceled")}
//                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                   activeTab === "canceled"
//                     ? "bg-green-600 text-white shadow-sm"
//                     : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
//                 }`}
//               >
//                 Canceled ({canceled.length})
//               </button>
//             </div>

//             <div className="flex items-center gap-2">
//               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">
//                 Filter by:
//               </span>
//               <select
//                 value={consultationType}
//                 onChange={(e) => setConsultationType(e.target.value)}
//                 className="form-select bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 py-1.5 pl-3 pr-8"
//               >
//                 <option>All Types</option>
//                 <option>teleconsultation</option>
//                 <option>in-person</option>
//               </select>
//             </div>
//           </div>

//           {loading && (
//             <div className="text-center py-12">
//               <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
//               <p className="mt-4 text-gray-600 dark:text-gray-400">
//                 Loading your appointments...
//               </p>
//             </div>
//           )}

//           {!loading && displayedAppointments.length === 0 && (
//             <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
//               <span className="material-icons text-5xl text-gray-400 mb-3">
//                 event_busy
//               </span>
//               <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
//                 No {activeTab} appointments
//               </h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
//                 {activeTab === "upcoming"
//                   ? "You don't have any upcoming appointments."
//                   : activeTab === "past"
//                     ? "No past appointments found."
//                     : "No canceled appointments."}
//               </p>
//               {activeTab === "upcoming" && (
//                 <Link href="/doctor-selection">
//                   <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
//                     Book an Appointment
//                   </button>
//                 </Link>
//               )}
//             </div>
//           )}

//           {!loading && displayedAppointments.length > 0 && (
//             <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left text-sm border-collapse border border-gray-200 dark:border-gray-700">
//                   <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400">
//                     <tr>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
//                         <div className="flex items-center gap-2">
//                           <span>Doctor</span>
//                           <FilterPopover
//                             column="doctor"
//                             placeholder="Filter by doctor..."
//                           />
//                         </div>
//                       </th>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
//                         Date
//                       </th>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
//                         <div className="flex items-center gap-2">
//                           <span>Time</span>
//                           <FilterPopover
//                             column="time"
//                             placeholder="Filter by time..."
//                           />
//                         </div>
//                       </th>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
//                         <div className="flex items-center gap-2">
//                           <span>Type</span>
//                           <FilterPopover
//                             column="type"
//                             placeholder="Filter by type..."
//                           />
//                         </div>
//                       </th>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
//                         Status
//                       </th>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium text-right">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//                     {displayedAppointments.map((apt) => {
//                       const formattedDate = formatDate(apt.date);
//                       return (
//                         <tr
//                           key={apt.id}
//                           className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
//                         >
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700">
//                             <div className="flex items-center gap-3">
//                               {apt.doctor_image ? (
//                                 <img
//                                   src={apt.doctor_image}
//                                   alt={apt.doctor_name}
//                                   className="w-10 h-10 rounded-full object-cover"
//                                   onError={(e) =>
//                                     (e.currentTarget.src =
//                                       "https://via.placeholder.com/40")
//                                   }
//                                 />
//                               ) : (
//                                 <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
//                                   <span className="material-icons text-xl">
//                                     medication
//                                   </span>
//                                 </div>
//                               )}
//                               <div>
//                                 <p className="font-medium text-gray-900 dark:text-white">
//                                   {apt.doctor_name}
//                                 </p>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                                   {apt.doctor_specialty}
//                                 </p>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
//                             {formattedDate.full}
//                           </td>
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
//                             {apt.time}
//                           </td>
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-center">
//                             {apt.type === "teleconsultation" ? (
//                               <button
//                                 onClick={() => {
//                                   // 👉 Replace with your meeting link logic
//                                   window.open(
//                                     `/patient/teleconsultation/${apt.id}`,
//                                     "_blank",
//                                   );
//                                 }}
//                                 className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
//                                 title="Join Video Call"
//                               >
//                                 <Video className="w-4 h-4" />
//                               </button>
//                             ) : (
//                               <span className="text-gray-400 text-xs">—</span>
//                             )}
//                           </td>
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700">
//                             <span
//                               className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(apt.status)}`}
//                             >
//                               {getStatusText(apt.status)}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-right">
//                             {isEditable(apt) ? (
//                               <div className="flex justify-end gap-2">
//                                 <button
//                                   onClick={() => handleReschedule(apt)}
//                                   className="p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
//                                   title="Reschedule"
//                                 >
//                                   <span className="material-icons text-xl">
//                                     edit_calendar
//                                   </span>
//                                 </button>
//                                 <button
//                                   onClick={() => handleCancel(apt.id)}
//                                   className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
//                                   title="Cancel"
//                                 >
//                                   <span className="material-icons text-xl">
//                                     cancel
//                                   </span>
//                                 </button>
//                               </div>
//                             ) : apt.status === "COMPLETED" ? (
//                               <Link
//                                 href={`/ehr/${apt.doctor_id}`}
//                                 className="inline-flex p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
//                                 title="View Summary"
//                               >
//                                 <span className="material-icons text-xl">
//                                   description
//                                 </span>
//                               </Link>
//                             ) : apt.status === "CANCELLED" ? (
//                               <Link
//                                 href={`/ehr/${apt.doctor_id}`}
//                                 className="inline-flex p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
//                                 title="View Details"
//                               >
//                                 <span className="material-icons text-xl">
//                                   visibility
//                                 </span>
//                               </Link>
//                             ) : (
//                               <span className="text-gray-400 text-xs">
//                                 Not editable
//                               </span>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>

//       {/* Reschedule Modal */}
//       <RescheduleModal
//         isOpen={showRescheduleModal}
//         onClose={() => setShowRescheduleModal(false)}
//         appointment={rescheduleAppointment}
//         onReschedule={() => {
//           // Refresh appointments after reschedule
//           const user = JSON.parse(localStorage.getItem("user") || "null");
//           if (user) {
//             const patientId = user.patient_id || String(user.id);
//             fetchAppointments(patientId, selectedDate || undefined);
//           }
//         }}
//       />
//     </div>
//   );
// }



// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import Sidebar from "@/components/patient/Sidebar";
// import { useRouter } from "next/navigation";
// import { Menu, X, Filter } from "lucide-react";
// import toast from "react-hot-toast";
// import { appointmentsApi } from "@/lib/api/appointments";
// import RescheduleModal from "@/components/patient/RescheduleModal";

// interface Appointment {
//   id: string;
//   date: string;
//   time: string;
//   type: string;
//   status: string;
//   notes: string;
//   doctor_id: string;
//   doctor_name: string;
//   doctor_specialty: string;
//   doctor_image: string | null;
//   fee: number;
// }

// export default function HomePage() {
//   const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "canceled">("upcoming");
//   const [consultationType, setConsultationType] = useState("All Types");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [userName, setUserName] = useState("Patient");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);
// const [showRescheduleModal, setShowRescheduleModal] = useState(false);
//   const router = useRouter();

//   // Column filters (date and status removed)
//   const [filters, setFilters] = useState({
//     doctor: "",
//     time: "",
//     type: "",
//   });

//   const [openFilter, setOpenFilter] = useState<string | null>(null);
//   const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         openFilter &&
//         filterRefs.current[openFilter] &&
//         !filterRefs.current[openFilter]?.contains(event.target as Node)
//       ) {
//         setOpenFilter(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [openFilter]);

//   // Helper to get full datetime from appointment
//   const getFullDateTime = (apt: Appointment): Date => {
//     const [year, month, day] = apt.date.split('T')[0].split('-').map(Number);
//     let hours = 0, minutes = 0;
//     if (apt.time.includes(' ')) {
//       const [time, modifier] = apt.time.split(' ');
//       let [h, m] = time.split(':').map(Number);
//       if (modifier.toUpperCase() === 'PM' && h !== 12) h += 12;
//       if (modifier.toUpperCase() === 'AM' && h === 12) h = 0;
//       hours = h;
//       minutes = m;
//     } else {
//       [hours, minutes] = apt.time.split(':').map(Number);
//     }
//     return new Date(year, month - 1, day, hours, minutes, 0);
//   };

//   const now = new Date();

//   const upcoming = appointments.filter(apt => {
//     if (apt.status !== "BOOKED") return false;
//     const aptDateTime = getFullDateTime(apt);
//     return aptDateTime >= now;
//   });

//   const past = appointments.filter(apt => {
//     if (apt.status === "CANCELLED") return false;
//     if (apt.status === "COMPLETED") return true;
//     if (apt.status === "BOOKED") {
//       const aptDateTime = getFullDateTime(apt);
//       return aptDateTime < now;
//     }
//     return false;
//   });

//   const canceled = appointments.filter(apt => apt.status === "CANCELLED");

//   const filterByConsultationType = (list: Appointment[]) => {
//     if (consultationType === "All Types") return list;
//     return list.filter(apt => apt.type?.toLowerCase() === consultationType.toLowerCase());
//   };

//   const baseDisplayed = (() => {
//     switch (activeTab) {
//       case "upcoming": return filterByConsultationType(upcoming);
//       case "past": return filterByConsultationType(past);
//       case "canceled": return filterByConsultationType(canceled);
//       default: return [];
//     }
//   })();

//   // Apply column filters (date and status removed)
//   const displayedAppointments = baseDisplayed.filter(apt => {
//     const matchDoctor = !filters.doctor || apt.doctor_name.toLowerCase().includes(filters.doctor.toLowerCase());
//     const matchTime = !filters.time || apt.time.toLowerCase().includes(filters.time.toLowerCase());
//     const matchType = !filters.type || apt.type?.toLowerCase() === filters.type.toLowerCase();
//     return matchDoctor && matchTime && matchType;
//   });

//   const isEditable = (apt: Appointment): boolean => {
//     if (apt.status !== "BOOKED") return false;
//     const aptDate = new Date(apt.date);
//     const today = new Date();
//     const aptDay = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
//     const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
//     return aptDay >= todayDay;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const user = JSON.parse(localStorage.getItem("user") || "null");
//         if (!user || !user.id) {
//           toast.error("Please login first");
//           router.push("/login");
//           return;
//         }
//         setUserName(user.full_name_en || user.name || "Patient");
//         const patientId = user.patient_id || String(user.id);
//         await fetchAppointments(patientId, selectedDate || undefined);
//       } catch (error) {
//         toast.error("Failed to load user data");
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [router, selectedDate]);

//   const fetchAppointments = async (patientId: string, date?: string) => {
//     try {
//       setLoading(true);
//       const response = await appointmentsApi.getPatientAppointmentsByDate(patientId, date);
//       const result = response.data;

//       let apts: Appointment[] = [];
//       if (Array.isArray(result)) {
//         apts = result;
//       } else if (result?.success && Array.isArray(result.data)) {
//         apts = result.data;
//       } else {
//         setAppointments([]);
//         setLoading(false);
//         return;
//       }

//       setAppointments(apts);

//       const upcomingCount = apts.filter(apt => {
//         if (apt.status !== "BOOKED") return false;
//         const aptDateTime = getFullDateTime(apt);
//         return aptDateTime >= now;
//       }).length;

//       const pastCount = apts.filter(apt => {
//         if (apt.status === "CANCELLED") return false;
//         if (apt.status === "COMPLETED") return true;
//         if (apt.status === "BOOKED") {
//           const aptDateTime = getFullDateTime(apt);
//           return aptDateTime < now;
//         }
//         return false;
//       }).length;

//       const canceledCount = apts.filter(apt => apt.status === "CANCELLED").length;

//       if (activeTab === "upcoming" && upcomingCount === 0 && (pastCount > 0 || canceledCount > 0)) {
//         if (pastCount > 0) setActiveTab("past");
//         else if (canceledCount > 0) setActiveTab("canceled");
//       } else if (activeTab === "past" && pastCount === 0 && (upcomingCount > 0 || canceledCount > 0)) {
//         if (upcomingCount > 0) setActiveTab("upcoming");
//         else if (canceledCount > 0) setActiveTab("canceled");
//       } else if (activeTab === "canceled" && canceledCount === 0 && (upcomingCount > 0 || pastCount > 0)) {
//         if (upcomingCount > 0) setActiveTab("upcoming");
//         else if (pastCount > 0) setActiveTab("past");
//       }
//     } catch (error) {
//       setAppointments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = async (appointmentId: string) => {
//     if (!confirm("Are you sure you want to cancel this appointment?")) return;
//     try {
//       await appointmentsApi.updateAppointment(appointmentId, { status: "CANCELLED" });
//       toast.success("Appointment cancelled successfully");
//       const user = JSON.parse(localStorage.getItem("user") || "null");
//       if (user) {
//         const patientId = user.patient_id || String(user.id);
//         await fetchAppointments(patientId, selectedDate || undefined);
//       }
//     } catch (error) {
//       console.error("Cancel error:", error);
//       toast.error("Failed to cancel appointment");
//     }
//   };

// const handleReschedule = (appointment: Appointment) => {
//   setRescheduleAppointment(appointment);
//   setShowRescheduleModal(true);
// };

//   const handleFilterChange = (column: keyof typeof filters, value: string) => {
//     setFilters(prev => ({ ...prev, [column]: value }));
//   };

//   // FilterPopover with local state and Apply button
//   const FilterPopover = ({ column, placeholder }: { column: keyof typeof filters; placeholder: string }) => {
//     const isOpen = openFilter === column;
//     const [localValue, setLocalValue] = useState(filters[column]);

//     useEffect(() => {
//       if (isOpen) {
//         setLocalValue(filters[column]);
//       }
//     }, [isOpen, filters, column]);

//     const handleApply = () => {
//       handleFilterChange(column, localValue);
//       setOpenFilter(null);
//     };

//     const handleClear = () => {
//       setLocalValue("");
//       handleFilterChange(column, "");
//       setOpenFilter(null);
//     };

//     const handleKeyDown = (e: React.KeyboardEvent) => {
//       if (e.key === 'Enter') {
//         handleApply();
//       }
//     };

//     return (
//       <div
//         className="relative inline-block"
//         ref={(el) => {
//           filterRefs.current[column] = el;
//         }}
//       >
//         <button
//           onClick={() => setOpenFilter(isOpen ? null : column)}
//           className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${filters[column] ? "text-blue-600" : "text-gray-400"}`}
//           aria-label={`Filter by ${column}`}
//         >
//           <Filter className="h-3.5 w-3.5" />
//         </button>
//         {isOpen && (
//           <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
//             <div className="space-y-2">
//               <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Filter by {column}
//               </h4>
//               <input
//                 type="text"
//                 placeholder={placeholder}
//                 value={localValue}
//                 onChange={(e) => setLocalValue(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-900"
//                 autoFocus
//               />
//               <div className="flex justify-end gap-2">
//                 <button
//                   onClick={handleClear}
//                   className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
//                 >
//                   Clear
//                 </button>
//                 <button
//                   onClick={handleApply}
//                   className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
//                 >
//                   Apply
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const formatDate = (dateStr: string) => {
//     const date = new Date(dateStr);
//     return {
//       day: date.getDate().toString().padStart(2, '0'),
//       month: date.toLocaleDateString('en-US', { month: 'short' }),
//       full: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
//     };
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "BOOKED": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
//       case "COMPLETED": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
//       case "CANCELLED": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
//       default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case "BOOKED": return "Confirmed";
//       case "COMPLETED": return "Completed";
//       case "CANCELLED": return "Cancelled";
//       default: return status;
//     }
//   };

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-display antialiased">
//       <style jsx global>{`
//         @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
//         @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");
//         @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
//         :root { --font-inter: "Inter", sans-serif; }
//         body { font-family: var(--font-inter); }
//       `}</style>

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

//       <main className="flex-1 flex flex-col h-screen overflow-hidden">
//         <div className="flex-1 overflow-y-auto p-6 md:p-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
//                 Welcome, <span className="text-green-600">{userName}</span> 👋
//               </h1>
//               <p className="text-gray-500 dark:text-gray-400 text-sm">
//                 Here's a quick look at your appointments.
//               </p>
//             </div>
//             <div className="flex items-center gap-2">
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
//               />
//               <Link href="/doctor-selection">
//                 <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap">
//                   <span className="material-icons text-lg">add</span>
//                   Book New
//                 </button>
//               </Link>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
//             {[
//               { name: "Doctor Consultation", icon: "local_hospital", path: "/appointments" },
//               { name: "Medical Records", icon: "folder", path: "/patient/medical-records" },
//               { name: "History", icon: "history", path: "/patient/admission-summary" },
//               { name: "Diagnostics", icon: "biotech", path: "/diagnostics" },
//             ].map((service) => (
//               <div
//                 key={service.name}
//                 onClick={() => router.push(service.path)}
//                 className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-900 shadow-sm hover:shadow-md hover:border-green-400 dark:hover:border-green-700 transition-all cursor-pointer flex flex-col items-center text-center"
//               >
//                 <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
//                   <span className="material-icons text-green-600 dark:text-green-400 text-2xl">
//                     {service.icon}
//                   </span>
//                 </div>
//                 <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
//                   {service.name}
//                 </h3>
//               </div>
//             ))}
//           </div>

//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-green-200 dark:border-green-900 pb-4 mb-8 gap-4">
//             <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-green-200 dark:border-green-900">
//               <button
//                 onClick={() => setActiveTab("upcoming")}
//                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                   activeTab === "upcoming"
//                     ? "bg-green-600 text-white shadow-sm"
//                     : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
//                 }`}
//               >
//                 Upcoming ({upcoming.length})
//               </button>
//               <button
//                 onClick={() => setActiveTab("past")}
//                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                   activeTab === "past"
//                     ? "bg-green-600 text-white shadow-sm"
//                     : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
//                 }`}
//               >
//                 Past ({past.length})
//               </button>
//               <button
//                 onClick={() => setActiveTab("canceled")}
//                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                   activeTab === "canceled"
//                     ? "bg-green-600 text-white shadow-sm"
//                     : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
//                 }`}
//               >
//                 Canceled ({canceled.length})
//               </button>
//             </div>

//             <div className="flex items-center gap-2">
//               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">
//                 Filter by:
//               </span>
//               <select
//                 value={consultationType}
//                 onChange={(e) => setConsultationType(e.target.value)}
//                 className="form-select bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 py-1.5 pl-3 pr-8"
//               >
//                 <option>All Types</option>
//                 <option>teleconsultation</option>
//                 <option>in-person</option>
//               </select>
//             </div>
//           </div>

//           {loading && (
//             <div className="text-center py-12">
//               <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
//               <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your appointments...</p>
//             </div>
//           )}

//           {!loading && displayedAppointments.length === 0 && (
//             <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
//               <span className="material-icons text-5xl text-gray-400 mb-3">event_busy</span>
//               <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
//                 No {activeTab} appointments
//               </h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
//                 {activeTab === "upcoming"
//                   ? "You don't have any upcoming appointments."
//                   : activeTab === "past"
//                   ? "No past appointments found."
//                   : "No canceled appointments."}
//               </p>
//               {activeTab === "upcoming" && (
//                 <Link href="/doctor-selection">
//                   <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
//                     Book an Appointment
//                   </button>
//                 </Link>
//               )}
//             </div>
//           )}

//           {!loading && displayedAppointments.length > 0 && (
//             <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left text-sm border-collapse border border-gray-200 dark:border-gray-700">
//                   <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400">
//                     <tr>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
//                         <div className="flex items-center gap-2">
//                           <span>Doctor</span>
//                           <FilterPopover column="doctor" placeholder="Filter by doctor..." />
//                         </div>
//                       </th>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
//                         Date
//                       </th>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
//                         <div className="flex items-center gap-2">
//                           <span>Time</span>
//                           <FilterPopover column="time" placeholder="Filter by time..." />
//                         </div>
//                       </th>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
//                         <div className="flex items-center gap-2">
//                           <span>Type</span>
//                           <FilterPopover column="type" placeholder="Filter by type..." />
//                         </div>
//                       </th>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
//                         Status
//                       </th>
//                       <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium text-right">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//                     {displayedAppointments.map((apt) => {
//                       const formattedDate = formatDate(apt.date);
//                       return (
//                         <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700">
//                             <div className="flex items-center gap-3">
//                               {apt.doctor_image ? (
//                                 <img
//                                   src={apt.doctor_image}
//                                   alt={apt.doctor_name}
//                                   className="w-10 h-10 rounded-full object-cover"
//                                   onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/40")}
//                                 />
//                               ) : (
//                                 <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
//                                   <span className="material-icons text-xl">medication</span>
//                                 </div>
//                               )}
//                               <div>
//                                 <p className="font-medium text-gray-900 dark:text-white">
//                                   {apt.doctor_name}
//                                 </p>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                                   {apt.doctor_specialty}
//                                 </p>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
//                             {formattedDate.full}
//                           </td>
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
//                             {apt.time}
//                           </td>
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
//                             {apt.type === "teleconsultation" ? "Teleconsult" : "In-Person"}
//                           </td>
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700">
//                             <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(apt.status)}`}>
//                               {getStatusText(apt.status)}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-right">
//                             {isEditable(apt) ? (
//                               <div className="flex justify-end gap-2">
//                                <button
//   onClick={() => handleReschedule(apt)}
//   className="p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
//   title="Reschedule"
// >
//   <span className="material-icons text-xl">edit_calendar</span>
// </button>
//                                 <button
//                                   onClick={() => handleCancel(apt.id)}
//                                   className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
//                                   title="Cancel"
//                                 >
//                                   <span className="material-icons text-xl">cancel</span>
//                                 </button>
//                               </div>
//                             ) : apt.status === "COMPLETED" ? (
//                               <Link
//                                 href={`/ehr/${apt.doctor_id}`}
//                                 className="inline-flex p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
//                                 title="View Summary"
//                               >
//                                 <span className="material-icons text-xl">description</span>
//                               </Link>
//                             ) : apt.status === "CANCELLED" ? (
//                               <Link
//                                 href={`/ehr/${apt.doctor_id}`}
//                                 className="inline-flex p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
//                                 title="View Details"
//                               >
//                                 <span className="material-icons text-xl">visibility</span>
//                               </Link>
//                             ) : (
//                               <span className="text-gray-400 text-xs">Not editable</span>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }



"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Sidebar from "@/components/patient/Sidebar";
import { useRouter } from "next/navigation";
import { Menu, X, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { appointmentsApi } from "@/lib/api/appointments";
import RescheduleModal from "@/components/patient/RescheduleModal";
import { Video } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, PATIENT_FEATURES } from "@/lib/feature";

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes: string;
  doctor_id: string;
  doctor_name: string;
  doctor_specialty: string;
  doctor_image: string | null;
  fee: number;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "canceled">(
    "upcoming",
  );
  const [consultationType, setConsultationType] = useState("All Types");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Patient");
  const [selectedDate, setSelectedDate] = useState("");
  const [rescheduleAppointment, setRescheduleAppointment] =
    useState<Appointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const router = useRouter();
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

  const isDashboardEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.PATIENT,
  PATIENT_FEATURES.DASHBOARD
);

  // Column filters (date and status removed)
  const [filters, setFilters] = useState({
    doctor: "",
    time: "",
    type: "",
  });

  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
  if (!tenantLoading && !isDashboardEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openFilter &&
        filterRefs.current[openFilter] &&
        !filterRefs.current[openFilter]?.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openFilter]);

  // Helper to get full datetime from appointment
  const getFullDateTime = (apt: Appointment): Date => {
    const dateObj = new Date(apt.date);

    let hours = 0,
      minutes = 0;

    if (apt.time.includes(" ")) {
      const [time, modifier] = apt.time.split(" ");
      let [h, m] = time.split(":").map(Number);

      if (modifier.toUpperCase() === "PM" && h !== 12) h += 12;
      if (modifier.toUpperCase() === "AM" && h === 12) h = 0;

      hours = h;
      minutes = m;
    } else {
      [hours, minutes] = apt.time.split(":").map(Number);
    }

    dateObj.setHours(hours, minutes, 0, 0);

    return dateObj;
  };

  const now = new Date();

  const upcoming = appointments.filter((apt) => {
    if (apt.status !== "BOOKED") return false;
    const aptDateTime = getFullDateTime(apt);
    return aptDateTime >= new Date();
  });

  const past = appointments.filter((apt) => {
    if (apt.status === "CANCELLED") return false;
    if (apt.status === "COMPLETED") return true;

    if (apt.status === "BOOKED") {
      const aptDateTime = getFullDateTime(apt);
      return aptDateTime < new Date();
    }

    return false;
  });

  const canceled = appointments.filter((apt) => apt.status === "CANCELLED");

  const filterByConsultationType = (list: Appointment[]) => {
    if (consultationType === "All Types") return list;
    return list.filter(
      (apt) => apt.type?.toLowerCase() === consultationType.toLowerCase(),
    );
  };

  const baseDisplayed = (() => {
    switch (activeTab) {
      case "upcoming":
        return filterByConsultationType(upcoming);
      case "past":
        return filterByConsultationType(past);
      case "canceled":
        return filterByConsultationType(canceled);
      default:
        return [];
    }
  })();

  // Apply column filters (date and status removed)
  const displayedAppointments = baseDisplayed.filter((apt) => {
    const matchDoctor =
      !filters.doctor ||
      apt.doctor_name.toLowerCase().includes(filters.doctor.toLowerCase());
    const matchTime =
      !filters.time ||
      apt.time.toLowerCase().includes(filters.time.toLowerCase());
    const matchType =
      !filters.type || apt.type?.toLowerCase() === filters.type.toLowerCase();
    return matchDoctor && matchTime && matchType;
  });

  const isEditable = (apt: Appointment): boolean => {
    if (apt.status !== "BOOKED") return false;
    const aptDate = getFullDateTime(apt);
    const today = new Date();
    const aptDay = new Date(
      aptDate.getFullYear(),
      aptDate.getMonth(),
      aptDate.getDate(),
    );
    const todayDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    return aptDay >= todayDay;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");

        setUserName(user.full_name_en || user.name || "Patient");
        const patientId = user.patient_id || String(user.id);
        await fetchAppointments(patientId, selectedDate || undefined);
      } catch (error) {
        toast.error("Failed to load user data");
        setLoading(false);
      }
    };
    fetchData();
  }, [router, selectedDate]);

  const fetchAppointments = async (patientId: string, date?: string) => {
    try {
      setLoading(true);
      const response = await appointmentsApi.getPatientAppointmentsByDate(
        patientId,
        date,
      );
      const result = response.data;

      let apts: Appointment[] = [];
      if (Array.isArray(result)) {
        apts = result;
      } else if (result?.success && Array.isArray(result.data)) {
        apts = result.data;
      } else {
        setAppointments([]);
        setLoading(false);
        return;
      }

      setAppointments(apts);

      const upcomingCount = apts.filter((apt) => {
        if (apt.status !== "BOOKED") return false;
        const aptDateTime = getFullDateTime(apt);
        return aptDateTime >= now;
      }).length;

      const pastCount = apts.filter((apt) => {
        if (apt.status === "CANCELLED") return false;
        if (apt.status === "COMPLETED") return true;
        if (apt.status === "BOOKED") {
          const aptDateTime = getFullDateTime(apt);
          return aptDateTime < now;
        }
        return false;
      }).length;

      const canceledCount = apts.filter(
        (apt) => apt.status === "CANCELLED",
      ).length;

      if (
        activeTab === "upcoming" &&
        upcomingCount === 0 &&
        (pastCount > 0 || canceledCount > 0)
      ) {
        if (pastCount > 0) setActiveTab("past");
        else if (canceledCount > 0) setActiveTab("canceled");
      } else if (
        activeTab === "past" &&
        pastCount === 0 &&
        (upcomingCount > 0 || canceledCount > 0)
      ) {
        if (upcomingCount > 0) setActiveTab("upcoming");
        else if (canceledCount > 0) setActiveTab("canceled");
      } else if (
        activeTab === "canceled" &&
        canceledCount === 0 &&
        (upcomingCount > 0 || pastCount > 0)
      ) {
        if (upcomingCount > 0) setActiveTab("upcoming");
        else if (pastCount > 0) setActiveTab("past");
      }
    } catch (error) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentsApi.updateAppointment(appointmentId, {
        status: "CANCELLED",
      });
      toast.success("Appointment cancelled successfully");
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user) {
        const patientId = user.patient_id || String(user.id);
        await fetchAppointments(patientId, selectedDate || undefined);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  const handleReschedule = (appointment: Appointment) => {
    setRescheduleAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleFilterChange = (column: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
  };

  // FilterPopover with local state and Apply button
  const FilterPopover = ({
    column,
    placeholder,
  }: {
    column: keyof typeof filters;
    placeholder: string;
  }) => {
    const isOpen = openFilter === column;
    const [localValue, setLocalValue] = useState(filters[column]);

    useEffect(() => {
      if (isOpen) {
        setLocalValue(filters[column]);
      }
    }, [isOpen, filters, column]);

    const handleApply = () => {
      handleFilterChange(column, localValue);
      setOpenFilter(null);
    };

    const handleClear = () => {
      setLocalValue("");
      handleFilterChange(column, "");
      setOpenFilter(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleApply();
      }
    };

    return (
      <div
        className="relative inline-block"
        ref={(el) => {
          filterRefs.current[column] = el;
        }}
      >
        <button
          onClick={() => setOpenFilter(isOpen ? null : column)}
          className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${filters[column] ? "text-blue-600" : "text-gray-400"}`}
          aria-label={`Filter by ${column}`}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filter by {column}
              </h4>
              <input
                type="text"
                placeholder={placeholder}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-900"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Clear
                </button>
                <button
                  onClick={handleApply}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      full: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BOOKED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "BOOKED":
        return "Confirmed";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Add this after the useEffect and before the loading check
if (!tenantLoading && !isDashboardEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Patient Dashboard is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-display antialiased">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/icon?family=Material+Icons");
        @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
        :root {
          --font-inter: "Inter", sans-serif;
        }
        body {
          font-family: var(--font-inter);
        }
      `}</style>

      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
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

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Welcome, <span className="text-green-600">{userName}</span> 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Here's a quick look at your appointments.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800"
              />
              <Link href="/doctor-selection">
                <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap">
                  <span className="material-icons text-lg">add</span>
                  Book New
                </button>
              </Link>
            </div>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                name: "Doctor Consultation",
                icon: "local_hospital",
                path: "/appointments",
              },
              {
                name: "Medical Records",
                icon: "folder",
                path: "/patient/medical-records",
              },
              {
                name: "History",
                icon: "history",
                path: "/patient/admission-summary",
              },
              { name: "Diagnostics", icon: "biotech", path: "/diagnostics" },
            ].map((service) => (
              <div
                key={service.name}
                onClick={() => router.push(service.path)}
                className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-900 shadow-sm hover:shadow-md hover:border-green-400 dark:hover:border-green-700 transition-all cursor-pointer flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-icons text-green-600 dark:text-green-400 text-2xl">
                    {service.icon}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {service.name}
                </h3>
              </div>
            ))}
          </div>

          {/* Tabs & Consultation Type Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-green-200 dark:border-green-900 pb-4 mb-8 gap-4">
            <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-green-200 dark:border-green-900">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "upcoming"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                }`}
              >
                Upcoming ({upcoming.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "past"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                }`}
              >
                Past ({past.length})
              </button>
              <button
                onClick={() => setActiveTab("canceled")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "canceled"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                }`}
              >
                Canceled ({canceled.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">
                Filter by:
              </span>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
                className="form-select bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 py-1.5 pl-3 pr-8"
              >
                <option>All Types</option>
                <option>teleconsultation</option>
                <option>in-person</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading your appointments...
              </p>
            </div>
          )}

          {!loading && displayedAppointments.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <span className="material-icons text-5xl text-gray-400 mb-3">
                event_busy
              </span>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                No {activeTab} appointments
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {activeTab === "upcoming"
                  ? "You don't have any upcoming appointments."
                  : activeTab === "past"
                    ? "No past appointments found."
                    : "No canceled appointments."}
              </p>
              {activeTab === "upcoming" && (
                <Link href="/doctor-selection">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
                    Book an Appointment
                  </button>
                </Link>
              )}
            </div>
          )}

          {!loading && displayedAppointments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse border border-gray-200 dark:border-gray-700">
                  <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
                        <div className="flex items-center gap-2">
                          <span>Doctor</span>
                          <FilterPopover
                            column="doctor"
                            placeholder="Filter by doctor..."
                          />
                        </div>
                      </th>
                      <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
                        Date
                      </th>
                      <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
                        <div className="flex items-center gap-2">
                          <span>Time</span>
                          <FilterPopover
                            column="time"
                            placeholder="Filter by time..."
                          />
                        </div>
                      </th>
                      <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
                        <div className="flex items-center gap-2">
                          <span>Type</span>
                          <FilterPopover
                            column="type"
                            placeholder="Filter by type..."
                          />
                        </div>
                      </th>
                      <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium">
                        Status
                      </th>
                      <th className="px-6 py-4 border border-gray-200 dark:border-gray-700 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {displayedAppointments.map((apt) => {
                      const formattedDate = formatDate(apt.date);
                      return (
                        <tr
                          key={apt.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              {apt.doctor_image ? (
                                <img
                                  src={apt.doctor_image}
                                  alt={apt.doctor_name}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) =>
                                    (e.currentTarget.src =
                                      "https://via.placeholder.com/40")
                                  }
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                                  <span className="material-icons text-xl">
                                    medication
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {apt.doctor_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {apt.doctor_specialty}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                            {formattedDate.full}
                          </td>
                          <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                            {apt.time}
                          </td>
                          <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-center">
                            {apt.type === "teleconsultation" ? (
                              <button
                                onClick={() => {
                                  // 👉 Replace with your meeting link logic
                                  window.open(
                                    `/patient/teleconsultation/${apt.id}`,
                                    "_blank",
                                  );
                                }}
                                className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                                title="Join Video Call"
                              >
                                <Video className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 border border-gray-200 dark:border-gray-700">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(apt.status)}`}
                            >
                              {getStatusText(apt.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 border border-gray-200 dark:border-gray-700 text-right">
                            {isEditable(apt) ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleReschedule(apt)}
                                  className="p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
                                  title="Reschedule"
                                >
                                  <span className="material-icons text-xl">
                                    edit_calendar
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleCancel(apt.id)}
                                  className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                                  title="Cancel"
                                >
                                  <span className="material-icons text-xl">
                                    cancel
                                  </span>
                                </button>
                              </div>
                            ) : apt.status === "COMPLETED" ? (
                              <Link
                                href={`/ehr/${apt.doctor_id}`}
                                className="inline-flex p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
                                title="View Summary"
                              >
                                <span className="material-icons text-xl">
                                  description
                                </span>
                              </Link>
                            ) : apt.status === "CANCELLED" ? (
                              <Link
                                href={`/ehr/${apt.doctor_id}`}
                                className="inline-flex p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                title="View Details"
                              >
                                <span className="material-icons text-xl">
                                  visibility
                                </span>
                              </Link>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                Not editable
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        appointment={rescheduleAppointment}
        onReschedule={() => {
          // Refresh appointments after reschedule
          const user = JSON.parse(localStorage.getItem("user") || "null");
          if (user) {
            const patientId = user.patient_id || String(user.id);
            fetchAppointments(patientId, selectedDate || undefined);
          }
        }}
      />
    </div>
  );
}
