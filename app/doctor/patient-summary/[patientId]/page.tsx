


// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { Printer, ArrowLeft, Heart, Pill, FileText, Activity, Thermometer, Weight, Droplet, Wind, Calendar, User, Phone, Mail, MapPin, AlertCircle } from "lucide-react";
// import { currentVisitApi } from "@/lib/api/ehr";
// import toast from "react-hot-toast";

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

// export default function PatientSummaryPage() {
//   const params = useParams();
//   const router = useRouter();
//   const patientId = params.patientId as string;
  
//   const [patient, setPatient] = useState<Patient | null>(null);
//   const [vitals, setVitals] = useState<Vital[]>([]);
//   const [medications, setMedications] = useState<Medication[]>([]);
//   const [visitData, setVisitData] = useState<VisitData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

//   const calculateAge = (dob: string): number => {
//     if (!dob) return 0;
//     const birth = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birth.getFullYear();
//     const m = today.getMonth() - birth.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
//     return age;
//   };

//   const fetchAllData = async (date: string) => {
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

//       // Fetch vitals for the selected date
//       try {
//         const vitalsResponse = await currentVisitApi.getVitalsByDate(patientId, date);
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

//       // Fetch prescriptions for the selected date
//       try {
//         const prescriptionsData = await currentVisitApi.getPrescriptionsByDate(patientId, date);
//         if (Array.isArray(prescriptionsData)) {
//           setMedications(prescriptionsData);
//         } else {
//           setMedications([]);
//         }
//       } catch (err) {
//         console.error("Error fetching prescriptions:", err);
//         setMedications([]);
//       }

//       // Fetch visit data for the selected date
//       try {
//         const visitResponse = await currentVisitApi.getCurrentVisitByDate(patientId, date);
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
//       console.error("Error fetching data:", error);
//       toast.error("Failed to load patient data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData(selectedDate);
//   }, [patientId, selectedDate]);

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
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading patient record...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!patient) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center p-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
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
//       {/* Simple header */}
//       <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
//         <div className="flex justify-between items-center">
//           <button 
//             onClick={() => router.back()}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back
//           </button>
//           <button 
//             onClick={handlePrint}
//             className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm border border-gray-200"
//           >
//             <Printer className="w-4 h-4" />
//             Print
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-4xl mx-auto px-6 py-8">
//         {/* Date Selector */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//             <div className="flex items-center gap-2">
//               <Calendar className="w-5 h-5 text-blue-600" />
//               <span className="font-medium text-gray-700">Viewing record for:</span>
//               <span className="text-gray-900 font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
//             </div>
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
//         </div>

//         {/* Patient Information Section */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
//           <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//               <User className="w-5 h-5 text-blue-600" />
//               Patient Information
//             </h2>
//           </div>
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-3">
//                 <div>
//                   <p className="text-sm text-gray-500">Full Name</p>
//                   <p className="text-base font-semibold text-gray-900">{patient.name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Patient ID</p>
//                   <p className="text-base text-gray-900">{patient.patientId}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Age / Gender</p>
//                   <p className="text-base text-gray-900">{patient.age} years / {patient.gender}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Blood Group</p>
//                   <p className="text-base text-gray-900">{patient.bloodGroup || "Not specified"}</p>
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <div>
//                   <p className="text-sm text-gray-500">Phone</p>
//                   <p className="text-base text-gray-900">{patient.phone || "Not specified"}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Email</p>
//                   <p className="text-base text-gray-900 break-all">{patient.email || "Not specified"}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">City</p>
//                   <p className="text-base text-gray-900">{patient.city || "Not specified"}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Status</p>
//                   <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
//                     patient.status === "Critical" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
//                   }`}>
//                     {patient.status}
//                   </span>
//                 </div>
//               </div>
//             </div>
            
//             {/* Allergies */}
//             {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== "None" && (
//               <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
//                 <p className="text-sm font-medium text-red-700 flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4" />
//                   Allergies: {patient.allergies.join(", ")}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Vitals Section */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
//           <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//               <Heart className="w-5 h-5 text-blue-600" />
//               Vital Signs
//             </h2>
//           </div>
//           <div className="p-6">
//             {latestVitals ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <Activity className="w-5 h-5 text-blue-500 mx-auto mb-2" />
//                   <p className="text-xs text-gray-500">BP</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.bp}</p>
//                   <p className="text-xs text-gray-400">mmHg</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <Heart className="w-5 h-5 text-red-500 mx-auto mb-2" />
//                   <p className="text-xs text-gray-500">HR</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.hr}</p>
//                   <p className="text-xs text-gray-400">bpm</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-2" />
//                   <p className="text-xs text-gray-500">Temp</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.temp}°C</p>
//                   <p className="text-xs text-gray-400">°C</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <Weight className="w-5 h-5 text-green-500 mx-auto mb-2" />
//                   <p className="text-xs text-gray-500">Weight</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.weight} kg</p>
//                   <p className="text-xs text-gray-400">kg</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <Wind className="w-5 h-5 text-purple-500 mx-auto mb-2" />
//                   <p className="text-xs text-gray-500">RR</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.rr}</p>
//                   <p className="text-xs text-gray-400">breaths/min</p>
//                 </div>
//                 <div className="bg-gray-50 p-3 rounded-lg text-center">
//                   <Droplet className="w-5 h-5 text-cyan-500 mx-auto mb-2" />
//                   <p className="text-xs text-gray-500">SpO2</p>
//                   <p className="text-lg font-bold text-gray-900">{latestVitals.spo2}%</p>
//                   <p className="text-xs text-gray-400">%</p>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center py-4">No vitals recorded for this visit.</p>
//             )}
//             {vitals.length > 1 && (
//               <p className="text-xs text-gray-400 mt-3 text-center">{vitals.length} vital record(s) available</p>
//             )}
//           </div>
//         </div>

//         {/* Diagnosis & Treatment Section */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
//           <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
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

//         {/* Prescribed Medications Section */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
//           <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//               <Pill className="w-5 h-5 text-blue-600" />
//               Prescribed Medications
//             </h2>
//           </div>
//           <div className="p-6">
//             {medications.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm border-collapse">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Medication</th>
//                       <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Dosage</th>
//                       <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Frequency</th>
//                       <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Duration</th>
//                       <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Instructions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {medications.map((med, idx) => (
//                       <tr key={med.id || idx} className="hover:bg-gray-50">
//                         <td className="px-4 py-2 border border-gray-200 font-medium text-gray-900">{med.name}</td>
//                         <td className="px-4 py-2 border border-gray-200 text-gray-600">{med.dosage}</td>
//                         <td className="px-4 py-2 border border-gray-200">
//                           <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
//                             {med.frequency}
//                           </span>
//                         </td>
//                         <td className="px-4 py-2 border border-gray-200 text-gray-600">{med.duration}</td>
//                         <td className="px-4 py-2 border border-gray-200 text-gray-500 text-sm">{med.instructions || "-"}</td>
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
//         <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">
//           <p>Electronic Health Record - Generated on {new Date().toLocaleString()}</p>
//           <p className="mt-1">This is a computer-generated document. No signature required.</p>
//         </div>
//       </div>

//       <style jsx global>{`
//         @media print {
//           button {
//             display: none !important;
//           }
//           .border, .border-b, .border-t {
//             border: 1px solid #e5e7eb !important;
//           }
//           .bg-gray-50, .bg-blue-50, .bg-red-50 {
//             background: #f9fafb !important;
//             print-color-adjust: exact;
//           }
//           @page {
//             size: A4;
//             margin: 1.5cm;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, Heart, Pill, FileText, Activity, Thermometer, Weight, Droplet, Wind, Calendar, User, Phone, Mail, MapPin, AlertCircle, ChevronDown } from "lucide-react";
import { currentVisitApi } from "@/lib/api/ehr";
import toast from "react-hot-toast";

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

interface VisitHistoryItem {
  date: string;
  displayDate: string;
}

export default function PatientSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [visitData, setVisitData] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [visitDates, setVisitDates] = useState<VisitHistoryItem[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);

  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // Fetch visit history dates
  useEffect(() => {
    const fetchVisitDates = async () => {
      if (!patientId) return;
      setLoadingDates(true);
      
      try {
        const completedVisits = await currentVisitApi.getCompletedVisits(patientId);
        
        if (Array.isArray(completedVisits) && completedVisits.length > 0) {
          // Extract unique dates from visits
          const dates = completedVisits.map((visit: any) => {
            const date = visit.appointment_date?.split("T")[0];
            return {
              date: date,
              displayDate: new Date(date).toLocaleDateString()
            };
          }).filter((item: VisitHistoryItem) => item.date);
          
          // Remove duplicates and sort by date (newest first)
          const uniqueDates = Array.from(
            new Map(dates.map((item: VisitHistoryItem) => [item.date, item])).values()
          ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setVisitDates(uniqueDates);
          
          // Set latest date as selected if available
          if (uniqueDates.length > 0 && !selectedDate) {
            setSelectedDate(uniqueDates[0].date);
          }
        }
      } catch (err) {
        console.error("Error fetching visit dates:", err);
        setVisitDates([]);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchVisitDates();
  }, [patientId]);

  const fetchAllData = async (date: string) => {
    if (!patientId || !date) return;
    setLoading(true);
    
    try {
      // Fetch patient details (only once)
      if (!patient) {
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
      }

      // Fetch vitals for the selected date
      try {
        const vitalsResponse = await currentVisitApi.getVitalsByDate(patientId, date);
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

      // Fetch prescriptions for the selected date
      try {
        const prescriptionsData = await currentVisitApi.getPrescriptionsByDate(patientId, date);
        if (Array.isArray(prescriptionsData)) {
          setMedications(prescriptionsData);
        } else {
          setMedications([]);
        }
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setMedications([]);
      }

      // Fetch visit data for the selected date
      try {
        const visitResponse = await currentVisitApi.getCurrentVisitByDate(patientId, date);
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
      console.error("Error fetching data:", error);
      toast.error("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAllData(selectedDate);
    }
  }, [selectedDate, patientId]);

  const getLatestVitals = () => {
    if (vitals.length === 0) return null;
    return vitals.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
  };

  const latestVitals = getLatestVitals();

  const handlePrint = () => {
    window.print();
  };

  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  // Get current date display
  const currentDateDisplay = selectedDate ? formatDisplayDate(selectedDate) : "No date selected";

  if (loading && !patient) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Simple header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
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
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Date Selector - Dropdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Viewing record for:</span>
              <span className="text-gray-900 font-semibold">{currentDateDisplay}</span>
            </div>
            
            {visitDates.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                >
                  {visitDates.map((item) => (
                    <option key={item.date} value={item.date}>
                      {item.displayDate}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                Only current date available
              </div>
            )}
          </div>
        </div>

        {/* Patient Information Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Patient Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-base font-semibold text-gray-900">{patient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="text-base text-gray-900">{patient.patientId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age / Gender</p>
                  <p className="text-base text-gray-900">{patient.age} years / {patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="text-base text-gray-900">{patient.bloodGroup || "Not specified"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-base text-gray-900">{patient.phone || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base text-gray-900 break-all">{patient.email || "Not specified"}</p>
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
            </div>
            
            {/* Allergies */}
            {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== "None" && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Allergies: {patient.allergies.join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vitals Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" />
              Vital Signs
            </h2>
          </div>
          <div className="p-6">
            {latestVitals ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Activity className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">BP</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.bp}</p>
                  <p className="text-xs text-gray-400">mmHg</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Heart className="w-5 h-5 text-red-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">HR</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.hr}</p>
                  <p className="text-xs text-gray-400">bpm</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Temp</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.temp}°C</p>
                  <p className="text-xs text-gray-400">°C</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Weight className="w-5 h-5 text-green-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.weight} kg</p>
                  <p className="text-xs text-gray-400">kg</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Wind className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">RR</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.rr}</p>
                  <p className="text-xs text-gray-400">breaths/min</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <Droplet className="w-5 h-5 text-cyan-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">SpO2</p>
                  <p className="text-lg font-bold text-gray-900">{latestVitals.spo2}%</p>
                  <p className="text-xs text-gray-400">%</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No vitals recorded for this visit.</p>
            )}
            {vitals.length > 1 && (
              <p className="text-xs text-gray-400 mt-3 text-center">{vitals.length} vital record(s) available</p>
            )}
          </div>
        </div>

        {/* Diagnosis & Treatment Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
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

        {/* Prescribed Medications Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              Prescribed Medications
            </h2>
          </div>
          <div className="p-6">
            {medications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Medication</th>
                      <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Dosage</th>
                      <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Frequency</th>
                      <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Duration</th>
                      <th className="px-4 py-2 text-left text-gray-600 border border-gray-200">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((med, idx) => (
                      <tr key={med.id || idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border border-gray-200 font-medium text-gray-900">{med.name}</td>
                        <td className="px-4 py-2 border border-gray-200 text-gray-600">{med.dosage}</td>
                        <td className="px-4 py-2 border border-gray-200">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                            {med.frequency}
                          </span>
                        </td>
                        <td className="px-4 py-2 border border-gray-200 text-gray-600">{med.duration}</td>
                        <td className="px-4 py-2 border border-gray-200 text-gray-500 text-sm">{med.instructions || "-"}</td>
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
        <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">
          <p>Electronic Health Record - Generated on {new Date().toLocaleString()}</p>
          <p className="mt-1">This is a computer-generated document. No signature required.</p>
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
          .bg-gray-50, .bg-blue-50, .bg-red-50 {
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