

// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { useParams, useSearchParams, useRouter } from "next/navigation";
// import { ArrowLeft, Calendar, User, Stethoscope, Pill, Activity, FileText, Clock, Phone, Mail, MapPin, AlertCircle, Printer, Heart, Thermometer, Weight, Droplet, Wind } from "lucide-react";
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
// }

// interface VisitData {
//   diagnosis: string;
//   icd10_code: string;
//   clinical_notes: string;
//   follow_up_date: string;
//   patient_instructions: string;
//   consultation_fee: number;
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
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState(dateParam || new Date().toISOString().split("T")[0]);

//   const todayStr = new Date().toISOString().split("T")[0];
//   const targetDate = dateParam || todayStr;

//   const calculateAge = (dob: string): number => {
//     if (!dob) return 0;
//     const birth = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birth.getFullYear();
//     const m = today.getMonth() - birth.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
//     return age;
//   };

//   const fetchAllData = useCallback(async () => {
//     if (!patientId) return;
//     setLoading(true);
    
//     try {
//       // Fetch patient details
//       const patientRes = await fetch(`/api/registration?patientId=${patientId}`);
//       const patientJson = await patientRes.json();
      
//       if (patientJson.success) {
//         const patientData = patientJson.data;
//         setPatient({
//           id: patientData.patient_id,
//           name: patientData.full_name_en || "Unknown",
//           age: calculateAge(patientData.dob),
//           gender: patientData.gender === "male" ? "Male" : patientData.gender === "female" ? "Female" : "Other",
//           patientId: patientData.patient_id,
//           phone: patientData.phone || "",
//           email: patientData.email || "",
//           city: patientData.city || "",
//           bloodGroup: patientData.blood_group || "",
//           allergies: patientData.allergy ? [patientData.allergy] : patientData.allergies || [],
//           status: patientData.status || "Active",
//         });
//       }

//       // Fetch vitals
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

//       // Fetch prescriptions
//       try {
//         const prescriptionsData = await currentVisitApi.getPrescriptionsByDate(patientId, targetDate);
//         if (Array.isArray(prescriptionsData)) {
//           setMedications(prescriptionsData);
//         } else {
//           setMedications([]);
//         }
//       } catch (err) {
//         console.error("Error fetching prescriptions:", err);
//         setMedications([]);
//       }

//       // Fetch visit data
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
//         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
//                 <ArrowLeft className="w-5 h-5" />
//               </button>
//               <h1 className="text-xl font-bold text-gray-900">Patient Health Record</h1>
//             </div>
//             <div className="flex items-center gap-2">
//               <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
//                 <Printer className="w-4 h-4" />
//                 <span className="text-sm hidden sm:inline">Print</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Date Selector */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//             <div className="flex items-center gap-2">
//               <Calendar className="w-5 h-5 text-blue-600" />
//               <span className="font-medium text-gray-700">Viewing record for:</span>
//               <span className="text-gray-900 font-semibold">{new Date(targetDate).toLocaleDateString()}</span>
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

//         {/* Patient Information Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
//           <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <User className="w-5 h-5 text-blue-600" />
//               Patient Information
//             </h2>
//           </div>
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <p className="text-sm text-gray-500">Full Name</p>
//                 <p className="text-base font-semibold text-gray-900">{patient.name}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Patient ID</p>
//                 <p className="text-base font-semibold text-gray-900">{patient.patientId}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Age / Gender</p>
//                 <p className="text-base text-gray-900">{patient.age} years / {patient.gender}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Blood Group</p>
//                 <p className="text-base text-gray-900">{patient.bloodGroup || "Not specified"}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Phone</p>
//                 <p className="text-base text-gray-900">{patient.phone || "Not specified"}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Email</p>
//                 <p className="text-base text-gray-900">{patient.email || "Not specified"}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">City</p>
//                 <p className="text-base text-gray-900">{patient.city || "Not specified"}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Status</p>
//                 <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
//                   patient.status === "Critical" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
//                 }`}>
//                   {patient.status}
//                 </span>
//               </div>
//             </div>
//             {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== "None" && (
//               <div className="mt-4 p-3 bg-red-50 rounded-lg">
//                 <p className="text-sm font-medium text-red-700 flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4" />
//                   Allergies: {patient.allergies.join(", ")}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Vitals Section */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
//           <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <Heart className="w-5 h-5 text-blue-600" />
//               Vital Signs
//             </h2>
//           </div>
//           <div className="p-6">
//             {latestVitals ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <div className="flex items-center justify-center mb-2">
//                     <Activity className="w-5 h-5 text-blue-500" />
//                   </div>
//                   <p className="text-xs text-gray-500">BP</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.bp}</p>
//                   <p className="text-xs text-gray-400">mmHg</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <div className="flex items-center justify-center mb-2">
//                     <Heart className="w-5 h-5 text-red-500" />
//                   </div>
//                   <p className="text-xs text-gray-500">HR</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.hr}</p>
//                   <p className="text-xs text-gray-400">bpm</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <div className="flex items-center justify-center mb-2">
//                     <Thermometer className="w-5 h-5 text-orange-500" />
//                   </div>
//                   <p className="text-xs text-gray-500">Temp</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.temp}°C</p>
//                   <p className="text-xs text-gray-400">Temperature</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <div className="flex items-center justify-center mb-2">
//                     <Weight className="w-5 h-5 text-green-500" />
//                   </div>
//                   <p className="text-xs text-gray-500">Weight</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.weight} kg</p>
//                   <p className="text-xs text-gray-400">Weight</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <div className="flex items-center justify-center mb-2">
//                     <Wind className="w-5 h-5 text-purple-500" />
//                   </div>
//                   <p className="text-xs text-gray-500">RR</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.rr}</p>
//                   <p className="text-xs text-gray-400">breaths/min</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <div className="flex items-center justify-center mb-2">
//                     <Droplet className="w-5 h-5 text-cyan-500" />
//                   </div>
//                   <p className="text-xs text-gray-500">SpO2</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.spo2}%</p>
//                   <p className="text-xs text-gray-400">Oxygen</p>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-4">No vitals recorded for this visit.</p>
//             )}
//             {vitals.length > 1 && (
//               <div className="mt-4 text-center">
//                 <p className="text-xs text-gray-400">{vitals.length} vital record(s) available for this date</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Diagnosis & Treatment Section */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
//           <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <FileText className="w-5 h-5 text-blue-600" />
//               Diagnosis & Treatment
//             </h2>
//           </div>
//           <div className="p-6">
//             {visitData && visitData.diagnosis ? (
//               <div className="space-y-4">
//                 <div>
//                   <p className="text-sm font-medium text-gray-500">Primary Diagnosis</p>
//                   <p className="text-base text-gray-900 mt-1">{visitData.diagnosis}</p>
//                 </div>
//                 {visitData.icd10_code && (
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">ICD-10 Code</p>
//                     <p className="text-base text-gray-900 mt-1">{visitData.icd10_code}</p>
//                   </div>
//                 )}
//                 {visitData.clinical_notes && (
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Clinical Notes</p>
//                     <div className="mt-1 p-3 bg-gray-50 rounded-lg">
//                       <p className="text-sm text-gray-700 whitespace-pre-wrap">{visitData.clinical_notes}</p>
//                     </div>
//                   </div>
//                 )}
//                 {visitData.patient_instructions && (
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Patient Instructions</p>
//                     <div className="mt-1 p-3 bg-blue-50 rounded-lg">
//                       <p className="text-sm text-gray-700 whitespace-pre-wrap">{visitData.patient_instructions}</p>
//                     </div>
//                   </div>
//                 )}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
//                   {visitData.follow_up_date && (
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Follow-up Date</p>
//                       <p className="text-base text-gray-900 mt-1">{new Date(visitData.follow_up_date).toLocaleDateString()}</p>
//                     </div>
//                   )}
//                   {visitData.consultation_fee > 0 && (
//                     <div>
//                       <p className="text-sm font-medium text-gray-500">Consultation Fee</p>
//                       <p className="text-base font-semibold text-gray-900 mt-1">₹{visitData.consultation_fee}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-4">No diagnosis recorded for this visit.</p>
//             )}
//           </div>
//         </div>

//         {/* Medications Section */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
//           <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <Pill className="w-5 h-5 text-blue-600" />
//               Prescribed Medications
//             </h2>
//           </div>
//           <div className="p-6">
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
//                     {medications.map((med, idx) => (
//                       <tr key={med.id || idx} className="hover:bg-gray-50">
//                         <td className="px-4 py-3 font-medium text-gray-900">{med.name}</td>
//                         <td className="px-4 py-3 text-gray-600">{med.dosage}</td>
//                         <td className="px-4 py-3">
//                           <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
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
//               <p className="text-gray-500 text-center py-4">No medications prescribed for this visit.</p>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
//           <p>Electronic Health Record - Generated on {new Date().toLocaleString()}</p>
//           <p className="mt-1">This is a computer-generated document. No signature required.</p>
//         </div>
//       </div>

//       {/* Print Styles */}
//       <style jsx global>{`
//         @media print {
//           body {
//             background: white;
//           }
//           .sticky, button, .shadow-sm {
//             box-shadow: none !important;
//           }
//           .bg-gray-50, .bg-blue-50 {
//             background: #f9fafb !important;
//             print-color-adjust: exact;
//           }
//           button, .sticky, [class*="sticky"] {
//             display: none !important;
//           }
//           .rounded-xl, .rounded-lg {
//             border-radius: 0 !important;
//           }
//           .border {
//             border: 1px solid #ddd !important;
//           }
//           @page {
//             size: A4;
//             margin: 1.5cm;
//           }
//           body {
//             margin: 0;
//             padding: 0;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

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

export default function EHRSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;
      setLoading(true);
      
      try {
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
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast.error("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient record...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
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
    <div className="min-h-screen bg-white">
      {/* Simple header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm border border-gray-200"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Main Content - No sidebar, no navigation */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Patient Health Record</h1>
          <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Patient Information Card */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Patient Information</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-sm font-medium text-gray-900 col-span-2">{patient.name}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Patient ID</p>
                <p className="text-sm text-gray-900 col-span-2">{patient.patientId}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Age / Gender</p>
                <p className="text-sm text-gray-900 col-span-2">{patient.age} years / {patient.gender}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="text-sm text-gray-900 col-span-2">{patient.bloodGroup || "Not specified"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm text-gray-900 col-span-2">{patient.phone || "Not specified"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm text-gray-900 break-all col-span-2">{patient.email || "Not specified"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-500">City</p>
                <p className="text-sm text-gray-900 col-span-2">{patient.city || "Not specified"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-sm col-span-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                    patient.status === "Critical" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                    {patient.status}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Allergies */}
            {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== "None" && (
              <div className="mt-6 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-700">Allergies</p>
                <p className="text-sm text-red-600 mt-1">{patient.allergies.join(", ")}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">
          <p>This is a computer-generated document. No signature required.</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          button {
            display: none !important;
          }
          .border, .border-b, .border-t {
            border: 1px solid #e5e7eb !important;
          }
          .bg-gray-50, .bg-red-50 {
            background: #f9fafb !important;
            print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
      `}</style>
    </div>
  );
}