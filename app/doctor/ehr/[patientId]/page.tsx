// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { useParams, useSearchParams, useRouter } from "next/navigation";
// import { ArrowLeft, Calendar, User, Stethoscope, Pill, Activity, FileText, Clock, Video, Phone, Mail, MapPin, AlertCircle, ChevronRight, Download, Printer } from "lucide-react";
// import { currentVisitApi } from "@/lib/api/ehr";
// import toast from "react-hot-toast";
// import Link from "next/link";

// // Types
// interface Patient {
//   id: string;
//   name: string;
//   age: number;
//   gender: string;
//   patientId: string;
//   phone: string;
//   email: string;
//   city: string;
//   bloodGroup: string;
//   allergies: string[];
//   status: string;
//   avatar: string;
// }

// interface Vital {
//   id: number;
//   bp: string;
//   hr: number;
//   temp: number;
//   weight: number;
//   rr: number;
//   spo2: number;
//   recordedBy: string;
//   recordedAt: string;
// }

// interface Medication {
//   id: number;
//   name: string;
//   dosage: string;
//   duration: string;
//   frequency: string;
//   instructions: string;
//   color: string;
// }

// interface VisitData {
//   diagnosis: string;
//   icd10_code: string;
//   clinical_notes: string;
//   follow_up_date: string;
//   patient_instructions: string;
//   consultation_fee: number;
// }

// interface Appointment {
//   id: string;
//   date: string;
//   time: string;
//   doctor_name: string;
//   doctor_specialty: string;
//   consultation_type: string;
//   status: string;
// }

// export default function UnifiedEHRPage() {
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const patientId = params.patientId as string;
//   const dateParam = searchParams.get("date");
  
//   const [patient, setPatient] = useState<Patient | null>(null);
//   const [vitals, setVitals] = useState<Vital[]>([]);
//   const [medications, setMedications] = useState<Medication[]>([]);
//   const [visitData, setVisitData] = useState<VisitData | null>(null);
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeSection, setActiveSection] = useState("overview");
//   const [selectedDate, setSelectedDate] = useState(dateParam || new Date().toISOString().split("T")[0]);

//   const todayStr = new Date().toISOString().split("T")[0];
//   const targetDate = dateParam || todayStr;

//   // Calculate age from DOB
//   const calculateAge = (dob: string): number => {
//     if (!dob) return 0;
//     const birth = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birth.getFullYear();
//     const m = today.getMonth() - birth.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
//     return age;
//   };

//   // Get avatar color based on patient ID
//   const getAvatarColor = (id: string): string => {
//     const colors = ["bg-blue-600", "bg-green-600", "bg-purple-600", "bg-orange-600", "bg-red-600"];
//     const lastChar = id.slice(-1);
//     const num = parseInt(lastChar, 10);
//     const index = isNaN(num) ? 0 : num % colors.length;
//     return colors[index];
//   };

//   // Fetch all data
//   const fetchAllData = useCallback(async () => {
//     if (!patientId) return;
//     setLoading(true);
    
//     try {
//       // 1. Fetch patient details
//       const patientRes = await fetch(`/api/registration?patientId=${patientId}`);
//       const patientJson = await patientRes.json();
      
//       if (patientJson.success) {
//         const patientData = patientJson.data;
//         setPatient({
//           id: patientData.patient_id,
//           name: patientData.full_name_en || "Unknown",
//           age: calculateAge(patientData.dob),
//           gender: patientData.gender === "male" ? "M" : patientData.gender === "female" ? "F" : "Other",
//           patientId: patientData.patient_id,
//           phone: patientData.phone || "",
//           email: patientData.email || "",
//           city: patientData.city || "",
//           bloodGroup: patientData.blood_group || "",
//           allergies: patientData.allergy ? [patientData.allergy] : patientData.allergies || [],
//           status: patientData.status || "Active",
//           avatar: patientData.full_name_en?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "PT",
//         });
//       }

//       // 2. Fetch vitals for the selected date
//       try {
//         const vitalsResponse = await currentVisitApi.getVitalsByDate(patientId, targetDate);
//         if (Array.isArray(vitalsResponse)) {
//           setVitals(vitalsResponse);
//         } else if (vitalsResponse?.data && Array.isArray(vitalsResponse.data)) {
//           setVitals(vitalsResponse.data);
//         } else {
//           setVitals([]);
//         }
//       } catch (err) {
//         console.error("Error fetching vitals:", err);
//         setVitals([]);
//       }

//       // 3. Fetch prescriptions for the selected date
//       try {
//         const prescriptionsData = await currentVisitApi.getPrescriptionsByDate(patientId, targetDate);
//         if (Array.isArray(prescriptionsData)) {
//           const colors = ["blue", "amber", "green", "purple", "pink"];
//           const medsWithColor = prescriptionsData.map((med: any, idx: number) => ({
//             ...med,
//             color: colors[idx % colors.length],
//           }));
//           setMedications(medsWithColor);
//         } else {
//           setMedications([]);
//         }
//       } catch (err) {
//         console.error("Error fetching prescriptions:", err);
//         setMedications([]);
//       }

//       // 4. Fetch current visit data
//       try {
//         let visitResponse;
//         if (dateParam) {
//           visitResponse = await currentVisitApi.getCurrentVisitByDate(patientId, targetDate);
//         } else {
//           visitResponse = await currentVisitApi.getCurrentVisit(patientId);
//         }
        
//         const visitDataResult = visitResponse?.data || visitResponse;
//         if (visitDataResult && Object.keys(visitDataResult).length > 0) {
//           setVisitData({
//             diagnosis: visitDataResult.diagnosis || "",
//             icd10_code: visitDataResult.icd10_code || "",
//             clinical_notes: visitDataResult.clinical_notes || "",
//             follow_up_date: visitDataResult.follow_up_date?.split("T")[0] || "",
//             patient_instructions: visitDataResult.patient_instructions || "",
//             consultation_fee: visitDataResult.consultation_fee || 0,
//           });
//         } else {
//           setVisitData(null);
//         }
//       } catch (err) {
//         console.error("Error fetching visit data:", err);
//         setVisitData(null);
//       }

//       // 5. Fetch appointments history
//       try {
//         const completedVisits = await currentVisitApi.getCompletedVisits(patientId);
//         if (Array.isArray(completedVisits)) {
//           setAppointments(completedVisits);
//         } else {
//           setAppointments([]);
//         }
//       } catch (err) {
//         console.error("Error fetching appointments:", err);
//         setAppointments([]);
//       }

//     } catch (error) {
//       console.error("Error fetching EHR data:", error);
//       toast.error("Failed to load patient data");
//     } finally {
//       setLoading(false);
//     }
//   }, [patientId, targetDate, dateParam]);

//   useEffect(() => {
//     fetchAllData();
//   }, [fetchAllData]);

//   const getVitalStatus = (value: number, type: string): "normal" | "abnormal" => {
//     if (type === "hr") return value >= 60 && value <= 100 ? "normal" : "abnormal";
//     if (type === "temp") return value >= 36.1 && value <= 37.2 ? "normal" : "abnormal";
//     if (type === "spo2") return value >= 95 ? "normal" : "abnormal";
//     return "normal";
//   };

//   const getLatestVitals = () => {
//     if (vitals.length === 0) return null;
//     return vitals.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
//   };

//   const latestVitals = getLatestVitals();

//   const handlePrint = () => {
//     window.print();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading patient data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!patient) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-bold text-red-700 mb-2">Patient Not Found</h2>
//           <p className="text-red-600 mb-4">Unable to load patient information.</p>
//           <button onClick={() => router.back()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
//                 <ArrowLeft className="w-5 h-5" />
//               </button>
//               <h1 className="text-xl font-bold text-gray-900">Electronic Health Record</h1>
//             </div>
//             <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
//               <Printer className="w-4 h-4" />
//               <span className="text-sm hidden sm:inline">Print</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Patient Profile Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//           <div className="flex flex-col md:flex-row gap-6">
//             <div className={`w-24 h-24 rounded-full ${getAvatarColor(patient.id)} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
//               {patient.avatar}
//             </div>
//             <div className="flex-1">
//               <div className="flex flex-wrap items-center gap-3 mb-2">
//                 <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
//                 <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
//                   patient.status === "Critical" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
//                 }`}>
//                   {patient.status}
//                 </span>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
//                 <div className="flex items-center gap-2 text-gray-600">
//                   <User className="w-4 h-4 text-gray-400" />
//                   <span>{patient.age} years, {patient.gender}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-600">
//                   <Calendar className="w-4 h-4 text-gray-400" />
//                   <span>ID: {patient.patientId}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-600">
//                   <Phone className="w-4 h-4 text-gray-400" />
//                   <span>{patient.phone || "N/A"}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-600">
//                   <Mail className="w-4 h-4 text-gray-400" />
//                   <span>{patient.email || "N/A"}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-600">
//                   <MapPin className="w-4 h-4 text-gray-400" />
//                   <span>{patient.city || "N/A"}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-600">
//                   <Activity className="w-4 h-4 text-gray-400" />
//                   <span>Blood: {patient.bloodGroup || "N/A"}</span>
//                 </div>
//               </div>
//               {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== "None" && (
//                 <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
//                   <AlertCircle className="w-4 h-4" />
//                   <span className="font-medium">Allergies:</span>
//                   <span>{patient.allergies.join(", ")}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Date Selector */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//             <div className="flex items-center gap-2">
//               <Calendar className="w-5 h-5 text-blue-600" />
//               <span className="font-medium text-gray-700">Viewing data for:</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => {
//                   setSelectedDate(e.target.value);
//                   router.push(`/doctor/ehr/${patientId}?date=${e.target.value}`);
//                 }}
//                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//               {dateParam && dateParam !== todayStr && (
//                 <Link href={`/doctor/ehr/${patientId}`}>
//                   <button className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition">
//                     View Today
//                   </button>
//                 </Link>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Navigation Tabs */}
//         <div className="bg-white rounded-t-xl border border-gray-200 border-b-0 mb-6">
//           <div className="flex overflow-x-auto">
//             {[
//               { id: "overview", label: "Overview", icon: Activity },
//               { id: "vitals", label: "Vitals", icon: Activity },
//               { id: "prescriptions", label: "Prescriptions", icon: Pill },
//               { id: "visit", label: "Current Visit", icon: FileText },
//               { id: "history", label: "History", icon: Calendar },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveSection(tab.id)}
//                 className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
//                   activeSection === tab.id
//                     ? "text-blue-600 border-blue-600"
//                     : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
//                 }`}
//               >
//                 <tab.icon className="w-4 h-4" />
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Overview Section */}
//         {activeSection === "overview" && (
//           <div className="space-y-6">
//             {/* Vitals Summary */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-gray-900">Latest Vitals</h3>
//                 <button onClick={() => setActiveSection("vitals")} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
//                   View All <ChevronRight className="w-4 h-4" />
//                 </button>
//               </div>
//               {latestVitals ? (
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//                   <div className="bg-gray-50 p-3 rounded-lg">
//                     <p className="text-xs text-gray-500">BP</p>
//                     <p className="text-lg font-bold text-gray-900">{latestVitals.bp}</p>
//                     <p className="text-xs text-gray-400">mmHg</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded-lg">
//                     <p className="text-xs text-gray-500">HR</p>
//                     <p className="text-lg font-bold text-gray-900">{latestVitals.hr}</p>
//                     <p className="text-xs text-gray-400">bpm</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded-lg">
//                     <p className="text-xs text-gray-500">Temp</p>
//                     <p className="text-lg font-bold text-gray-900">{latestVitals.temp}°C</p>
//                     <p className="text-xs text-gray-400">Temperature</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded-lg">
//                     <p className="text-xs text-gray-500">Weight</p>
//                     <p className="text-lg font-bold text-gray-900">{latestVitals.weight} kg</p>
//                     <p className="text-xs text-gray-400">Weight</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded-lg">
//                     <p className="text-xs text-gray-500">RR</p>
//                     <p className="text-lg font-bold text-gray-900">{latestVitals.rr}</p>
//                     <p className="text-xs text-gray-400">breaths/min</p>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded-lg">
//                     <p className="text-xs text-gray-500">SpO2</p>
//                     <p className="text-lg font-bold text-gray-900">{latestVitals.spo2}%</p>
//                     <p className="text-xs text-gray-400">Oxygen</p>
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-gray-500 text-center py-4">No vitals recorded for this visit.</p>
//               )}
//             </div>

//             {/* Prescriptions Summary */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-gray-900">Current Prescriptions</h3>
//                 <button onClick={() => setActiveSection("prescriptions")} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
//                   View All <ChevronRight className="w-4 h-4" />
//                 </button>
//               </div>
//               {medications.length > 0 ? (
//                 <div className="space-y-3">
//                   {medications.slice(0, 3).map((med) => (
//                     <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <p className="font-medium text-gray-900">{med.name}</p>
//                         <p className="text-sm text-gray-500">{med.dosage} • {med.duration}</p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${med.color}-100 text-${med.color}-700`}>
//                         {med.frequency}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-gray-500 text-center py-4">No prescriptions for this visit.</p>
//               )}
//             </div>

//             {/* Visit Summary */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-gray-900">Current Visit Summary</h3>
//                 <button onClick={() => setActiveSection("visit")} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
//                   View Details <ChevronRight className="w-4 h-4" />
//                 </button>
//               </div>
//               {visitData && visitData.diagnosis ? (
//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Diagnosis</p>
//                     <p className="text-gray-900">{visitData.diagnosis}</p>
//                   </div>
//                   {visitData.clinical_notes && (
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Clinical Notes</p>
//                       <p className="text-gray-900 text-sm">{visitData.clinical_notes.substring(0, 150)}...</p>
//                     </div>
//                   )}
//                   {visitData.follow_up_date && (
//                     <div className="flex items-center gap-2 text-sm">
//                       <Calendar className="w-4 h-4 text-gray-400" />
//                       <span className="text-gray-600">Follow-up: {new Date(visitData.follow_up_date).toLocaleDateString()}</span>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <p className="text-gray-500 text-center py-4">No visit data recorded for this date.</p>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Vitals Section */}
//         {activeSection === "vitals" && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-lg font-semibold text-gray-900">Vital Signs History</h3>
//               <Link href={`/doctor/ehr/${patientId}/vitals?date=${targetDate}`}>
//                 <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
//                   Add Vitals
//                 </button>
//               </Link>
//             </div>
//             {vitals.length > 0 ? (
//               <div className="space-y-4">
//                 {vitals.map((vital) => (
//                   <div key={vital.id} className="border border-gray-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between mb-3">
//                       <p className="text-sm text-gray-500">
//                         Recorded on {new Date(vital.recordedAt).toLocaleDateString()} at {new Date(vital.recordedAt).toLocaleTimeString()}
//                       </p>
//                       <p className="text-xs text-gray-400">by {vital.recordedBy}</p>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//                       <div>
//                         <p className="text-xs text-gray-500">BP</p>
//                         <p className="font-semibold text-gray-900">{vital.bp} mmHg</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-500">HR</p>
//                         <p className="font-semibold text-gray-900">{vital.hr} bpm</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-500">Temp</p>
//                         <p className="font-semibold text-gray-900">{vital.temp}°C</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-500">Weight</p>
//                         <p className="font-semibold text-gray-900">{vital.weight} kg</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-500">RR</p>
//                         <p className="font-semibold text-gray-900">{vital.rr} /min</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-500">SpO2</p>
//                         <p className="font-semibold text-gray-900">{vital.spo2}%</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-8">No vitals recorded for this visit.</p>
//             )}
//           </div>
//         )}

//         {/* Prescriptions Section */}
//         {activeSection === "prescriptions" && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-lg font-semibold text-gray-900">Prescribed Medications</h3>
//               <Link href={`/doctor/ehr/${patientId}/prescriptions?date=${targetDate}`}>
//                 <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
//                   Add Medication
//                 </button>
//               </Link>
//             </div>
//             {medications.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-gray-600">Medication</th>
//                       <th className="px-4 py-3 text-left text-gray-600">Dosage</th>
//                       <th className="px-4 py-3 text-left text-gray-600">Frequency</th>
//                       <th className="px-4 py-3 text-left text-gray-600">Duration</th>
//                       <th className="px-4 py-3 text-left text-gray-600">Instructions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {medications.map((med) => (
//                       <tr key={med.id} className="hover:bg-gray-50">
//                         <td className="px-4 py-3 font-medium text-gray-900">{med.name}</td>
//                         <td className="px-4 py-3 text-gray-600">{med.dosage}</td>
//                         <td className="px-4 py-3">
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${med.color}-100 text-${med.color}-700`}>
//                             {med.frequency}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-gray-600">{med.duration}</td>
//                         <td className="px-4 py-3 text-gray-500 text-sm">{med.instructions || "-"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-8">No prescriptions for this visit.</p>
//             )}
//           </div>
//         )}

//         {/* Current Visit Section */}
//         {activeSection === "visit" && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-lg font-semibold text-gray-900">Visit Details</h3>
//               <Link href={`/doctor/ehr/${patientId}/current-visit?date=${targetDate}`}>
//                 <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
//                   Edit Visit
//                 </button>
//               </Link>
//             </div>
//             {visitData && (visitData.diagnosis || visitData.clinical_notes) ? (
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-500 mb-1">Diagnosis</label>
//                     <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{visitData.diagnosis || "-"}</p>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-500 mb-1">ICD-10 Code</label>
//                     <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{visitData.icd10_code || "-"}</p>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-500 mb-1">Clinical Notes</label>
//                   <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
//                     <p className="text-gray-900">{visitData.clinical_notes || "-"}</p>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-500 mb-1">Patient Instructions</label>
//                   <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
//                     <p className="text-gray-900">{visitData.patient_instructions || "-"}</p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-500 mb-1">Follow-up Date</label>
//                     <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
//                       {visitData.follow_up_date ? new Date(visitData.follow_up_date).toLocaleDateString() : "-"}
//                     </p>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-500 mb-1">Consultation Fee</label>
//                     <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">₹{visitData.consultation_fee || 0}</p>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-8">No visit data recorded for this date.</p>
//             )}
//           </div>
//         )}

//         {/* History Section */}
//         {activeSection === "history" && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">Visit History</h3>
//             {appointments.length > 0 ? (
//               <div className="space-y-4">
//                 {appointments.map((apt) => (
//                   <div key={apt.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
//                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
//                           <Stethoscope className="w-5 h-5 text-blue-600" />
//                         </div>
//                         <div>
//                           <p className="font-semibold text-gray-900">{new Date(apt.date).toLocaleDateString()}</p>
//                           <p className="text-sm text-gray-500">{apt.consultation_type === "teleconsultation" ? "Teleconsultation" : "In-Person"} • {apt.doctor_name}</p>
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => router.push(`/doctor/ehr/${patientId}?date=${apt.date.split("T")[0]}`)}
//                         className="text-sm text-blue-600 hover:text-blue-700"
//                       >
//                         View Details →
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-8">No visit history found.</p>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Print Styles */}
//       <style jsx global>{`
//         @media print {
//           body * {
//             visibility: hidden;
//           }
//           .min-h-screen, .min-h-screen > * {
//             visibility: visible;
//           }
//           .bg-white, .rounded-xl, .shadow-sm {
//             box-shadow: none;
//             border: 1px solid #ddd;
//           }
//           button, .sticky {
//             display: none !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Stethoscope, Pill, Activity, FileText, Clock, Phone, Mail, MapPin, AlertCircle, Printer, Heart, Thermometer, Weight, Droplet, Wind } from "lucide-react";
import { currentVisitApi } from "@/lib/api/ehr";
import toast from "react-hot-toast";
import Link from "next/link";

// Types
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  patientId: string;
  phone: string;
  email: string;
  city: string;
  bloodGroup: string;
  allergies: string[];
  status: string;
}

interface Vital {
  id: number;
  bp: string;
  hr: number;
  temp: number;
  weight: number;
  rr: number;
  spo2: number;
  recordedBy: string;
  recordedAt: string;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  duration: string;
  frequency: string;
  instructions: string;
}

interface VisitData {
  diagnosis: string;
  icd10_code: string;
  clinical_notes: string;
  follow_up_date: string;
  patient_instructions: string;
  consultation_fee: number;
}

export default function UnifiedEHRPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const dateParam = searchParams.get("date");
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [visitData, setVisitData] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dateParam || new Date().toISOString().split("T")[0]);

  const todayStr = new Date().toISOString().split("T")[0];
  const targetDate = dateParam || todayStr;

  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const fetchAllData = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    
    try {
      // Fetch patient details
      const patientRes = await fetch(`/api/registration?patientId=${patientId}`);
      const patientJson = await patientRes.json();
      
      if (patientJson.success) {
        const patientData = patientJson.data;
        setPatient({
          id: patientData.patient_id,
          name: patientData.full_name_en || "Unknown",
          age: calculateAge(patientData.dob),
          gender: patientData.gender === "male" ? "Male" : patientData.gender === "female" ? "Female" : "Other",
          patientId: patientData.patient_id,
          phone: patientData.phone || "",
          email: patientData.email || "",
          city: patientData.city || "",
          bloodGroup: patientData.blood_group || "",
          allergies: patientData.allergy ? [patientData.allergy] : patientData.allergies || [],
          status: patientData.status || "Active",
        });
      }

      // Fetch vitals
      try {
        const vitalsResponse = await currentVisitApi.getVitalsByDate(patientId, targetDate);
        if (Array.isArray(vitalsResponse)) {
          setVitals(vitalsResponse);
        } else if (vitalsResponse?.data && Array.isArray(vitalsResponse.data)) {
          setVitals(vitalsResponse.data);
        } else {
          setVitals([]);
        }
      } catch (err) {
        console.error("Error fetching vitals:", err);
        setVitals([]);
      }

      // Fetch prescriptions
      try {
        const prescriptionsData = await currentVisitApi.getPrescriptionsByDate(patientId, targetDate);
        if (Array.isArray(prescriptionsData)) {
          setMedications(prescriptionsData);
        } else {
          setMedications([]);
        }
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setMedications([]);
      }

      // Fetch visit data
      try {
        let visitResponse;
        if (dateParam) {
          visitResponse = await currentVisitApi.getCurrentVisitByDate(patientId, targetDate);
        } else {
          visitResponse = await currentVisitApi.getCurrentVisit(patientId);
        }
        
        const visitDataResult = visitResponse?.data || visitResponse;
        if (visitDataResult && Object.keys(visitDataResult).length > 0) {
          setVisitData({
            diagnosis: visitDataResult.diagnosis || "",
            icd10_code: visitDataResult.icd10_code || "",
            clinical_notes: visitDataResult.clinical_notes || "",
            follow_up_date: visitDataResult.follow_up_date?.split("T")[0] || "",
            patient_instructions: visitDataResult.patient_instructions || "",
            consultation_fee: visitDataResult.consultation_fee || 0,
          });
        } else {
          setVisitData(null);
        }
      } catch (err) {
        console.error("Error fetching visit data:", err);
        setVisitData(null);
      }

    } catch (error) {
      console.error("Error fetching EHR data:", error);
      toast.error("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  }, [patientId, targetDate, dateParam]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getLatestVitals = () => {
    if (vitals.length === 0) return null;
    return vitals.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
  };

  const latestVitals = getLatestVitals();

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Patient Not Found</h2>
          <p className="text-red-600 mb-4">Unable to load patient information.</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Patient Health Record</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Printer className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Viewing record for:</span>
              <span className="text-gray-900 font-semibold">{new Date(targetDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  router.push(`/doctor/ehr/${patientId}?date=${e.target.value}`);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {dateParam && dateParam !== todayStr && (
                <Link href={`/doctor/ehr/${patientId}`}>
                  <button className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    View Today
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Patient Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Patient Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-base font-semibold text-gray-900">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Patient ID</p>
                <p className="text-base font-semibold text-gray-900">{patient.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age / Gender</p>
                <p className="text-base text-gray-900">{patient.age} years / {patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="text-base text-gray-900">{patient.bloodGroup || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-base text-gray-900">{patient.phone || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base text-gray-900">{patient.email || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="text-base text-gray-900">{patient.city || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                  patient.status === "Critical" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}>
                  {patient.status}
                </span>
              </div>
            </div>
            {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== "None" && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Allergies: {patient.allergies.join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vitals Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" />
              Vital Signs
            </h2>
          </div>
          <div className="p-6">
            {latestVitals ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500">BP</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.bp}</p>
                  <p className="text-xs text-gray-400">mmHg</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-xs text-gray-500">HR</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.hr}</p>
                  <p className="text-xs text-gray-400">bpm</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-xs text-gray-500">Temp</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.temp}°C</p>
                  <p className="text-xs text-gray-400">Temperature</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Weight className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.weight} kg</p>
                  <p className="text-xs text-gray-400">Weight</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Wind className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-xs text-gray-500">RR</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.rr}</p>
                  <p className="text-xs text-gray-400">breaths/min</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Droplet className="w-5 h-5 text-cyan-500" />
                  </div>
                  <p className="text-xs text-gray-500">SpO2</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.spo2}%</p>
                  <p className="text-xs text-gray-400">Oxygen</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No vitals recorded for this visit.</p>
            )}
            {vitals.length > 1 && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">{vitals.length} vital record(s) available for this date</p>
              </div>
            )}
          </div>
        </div>

        {/* Diagnosis & Treatment Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Diagnosis & Treatment
            </h2>
          </div>
          <div className="p-6">
            {visitData && visitData.diagnosis ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Primary Diagnosis</p>
                  <p className="text-base text-gray-900 mt-1">{visitData.diagnosis}</p>
                </div>
                {visitData.icd10_code && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">ICD-10 Code</p>
                    <p className="text-base text-gray-900 mt-1">{visitData.icd10_code}</p>
                  </div>
                )}
                {visitData.clinical_notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Clinical Notes</p>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{visitData.clinical_notes}</p>
                    </div>
                  </div>
                )}
                {visitData.patient_instructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Patient Instructions</p>
                    <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{visitData.patient_instructions}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {visitData.follow_up_date && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Follow-up Date</p>
                      <p className="text-base text-gray-900 mt-1">{new Date(visitData.follow_up_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {visitData.consultation_fee > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Consultation Fee</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">₹{visitData.consultation_fee}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No diagnosis recorded for this visit.</p>
            )}
          </div>
        </div>

        {/* Medications Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              Prescribed Medications
            </h2>
          </div>
          <div className="p-6">
            {medications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600">Medication</th>
                      <th className="px-4 py-3 text-left text-gray-600">Dosage</th>
                      <th className="px-4 py-3 text-left text-gray-600">Frequency</th>
                      <th className="px-4 py-3 text-left text-gray-600">Duration</th>
                      <th className="px-4 py-3 text-left text-gray-600">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {medications.map((med, idx) => (
                      <tr key={med.id || idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{med.name}</td>
                        <td className="px-4 py-3 text-gray-600">{med.dosage}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {med.frequency}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{med.duration}</td>
                        <td className="px-4 py-3 text-gray-500 text-sm">{med.instructions || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No medications prescribed for this visit.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
          <p>Electronic Health Record - Generated on {new Date().toLocaleString()}</p>
          <p className="mt-1">This is a computer-generated document. No signature required.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .sticky, button, .shadow-sm {
            box-shadow: none !important;
          }
          .bg-gray-50, .bg-blue-50 {
            background: #f9fafb !important;
            print-color-adjust: exact;
          }
          button, .sticky, [class*="sticky"] {
            display: none !important;
          }
          .rounded-xl, .rounded-lg {
            border-radius: 0 !important;
          }
          .border {
            border: 1px solid #ddd !important;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}