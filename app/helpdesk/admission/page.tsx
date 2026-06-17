


// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Menu, X } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import HelpDeskSidebar from "@/components/helpdesk/HelpDeskSidebar";
// import { admissionsApi } from "@/lib/api/admissions";

// import { useTenant } from "@/contexts/TenantContext";
// import { MODULE_KEYS, HELPDESK_FEATURES } from "@/lib/feature";

// // Types
// interface Patient {
//   patient_id: string;
//   full_name_en?: string;
//   dob?: string;
//   gender?: string;
//   phone?: string;
//   email?: string;
//   address?: string;
//   city?: string;
//   state?: string;
//   pincode?: string;
// }

// interface Ward {
//   id: number;
//   name: string;
// }

// interface Bed {
//   id: number;
//   bed_number: string;
//   room_id: number | null;
//   ward_id?: number;
// }

// interface Doctor {
//   id: number;
//   firstName: string;
//   lastName: string;
//   department: string;
//   specialty?: string;
// }

// interface EmergencyAssessment {
//   id: string;
//   patientName: string;
//   uhid: string;
//   age: number | null;
//   gender: string | null;
//   chiefComplaints: string | null;
//   createdAt: string;
// }

// export default function AdmissionForm() {
//   const router = useRouter();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [mode, setMode] = useState<"new" | "existing">("new");
//   const [phoneSearch, setPhoneSearch] = useState("");
//   const [patientData, setPatientData] = useState<Patient | null>(null);
//   const [loadingPatient, setLoadingPatient] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [doctorSearch, setDoctorSearch] = useState("");
//   const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
//   const doctorDropdownRef = useRef<HTMLDivElement>(null);

//   // Patient selection modal (from phone search)
//   const [searchResults, setSearchResults] = useState<Patient[]>([]);
//   const [showPatientModal, setShowPatientModal] = useState(false);

//   // Emergency assessment integration
//   const [showAssessmentModal, setShowAssessmentModal] = useState(false);
//   const [completedAssessments, setCompletedAssessments] = useState<EmergencyAssessment[]>([]);
//   const [loadingAssessments, setLoadingAssessments] = useState(false);
//   const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
//   // ✅ New: store the patient_id from the loaded emergency assessment
//   const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

//   const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

//   // Form state
//   const [form, setForm] = useState({
//     fullName: "",
//     dob: "",
//     gender: "",
//     address: "",
//     city: "",
//     pincode: "",
//     phone: "",
//     email: "",
//     emergencyName: "",
//     emergencyRelation: "",
//     emergencyPhone: "",
//     reason: "",
//     department: "",
//     physician: "",
//     ward: "",
//     bed: "",
//     admissionDate: new Date().toISOString().split("T")[0],
//     diagnosis: "",
//     state: "",
//   });

//   // Dropdown data
//   const [wards, setWards] = useState<Ward[]>([]);
//   const [beds, setBeds] = useState<Bed[]>([]);

//   const isNewAdmissionEnabled = isMicroFeatureEnabled(
//     MODULE_KEYS.HELPDESK,
//     HELPDESK_FEATURES.NEW_ADMISSION
//   );

//   const resetForm = () => {
//     setForm({
//       fullName: "",
//       dob: "",
//       gender: "",
//       address: "",
//       city: "",
//       pincode: "",
//       phone: "",
//       email: "",
//       emergencyName: "",
//       emergencyRelation: "",
//       emergencyPhone: "",
//       reason: "",
//       department: "",
//       physician: "",
//       ward: "",
//       bed: "",
//       admissionDate: new Date().toISOString().split("T")[0],
//       diagnosis: "",
//       state: "",
//     });
//     setPatientData(null);
//     setPhoneSearch("");
//     setMode("new");
//     setDoctorSearch("");
//     setSelectedAssessmentId(null);
//     setSelectedPatientId(null); // ✅ also reset patient ID
//   };

//   useEffect(() => {
//     if (!tenantLoading && !isNewAdmissionEnabled) {
//       router.push("/unauthorized");
//     }
//   }, [tenantLoading, isNewAdmissionEnabled, router]);

//   // Load wards
//   useEffect(() => {
//     admissionsApi
//       .getWards()
//       .then((res) => {
//         const wardsData = res.data?.data || res.data;
//         setWards(Array.isArray(wardsData) ? wardsData : []);
//       })
//       .catch((err) => console.error("Failed to load wards", err));
//   }, []);

//   // Load beds when ward changes
//   useEffect(() => {
//     if (form.ward) {
//       const wardId = parseInt(form.ward);
//       admissionsApi
//         .getBeds({ ward_id: wardId, status: "available" })
//         .then((res: any) => {
//           let bedsData: Bed[] = [];
//           if (res?.data?.data && Array.isArray(res.data.data)) {
//             bedsData = res.data.data;
//           } else if (res?.data && Array.isArray(res.data)) {
//             bedsData = res.data;
//           } else if (Array.isArray(res)) {
//             bedsData = res;
//           } else if (res?.beds && Array.isArray(res.beds)) {
//             bedsData = res.beds;
//           }
//           bedsData = bedsData.filter((bed) => bed.ward_id === wardId);
//           setBeds(bedsData);
//           setForm((prev) => ({ ...prev, bed: "" }));
//         })
//         .catch((err) => console.error("Failed to load beds", err));
//     } else {
//       setBeds([]);
//       setForm((prev) => ({ ...prev, bed: "" }));
//     }
//   }, [form.ward]);

//   // Load doctors
//   useEffect(() => {
//     admissionsApi
//       .getDoctors()
//       .then((res) => {
//         const data = res.data?.data || res.data;
//         setDoctors(Array.isArray(data) ? data : []);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch doctors", err);
//         toast.error("Failed to load doctors");
//       });
//   }, []);

//   // Filter doctors
//   const filteredDoctors = doctors.filter((doc) => {
//     const searchTerm = doctorSearch.toLowerCase();
//     const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
//     const department = (doc.department || "").toLowerCase();
//     const specialty = (doc.specialty || "").toLowerCase();
//     return (
//       fullName.includes(searchTerm) ||
//       department.includes(searchTerm) ||
//       specialty.includes(searchTerm)
//     );
//   });

//   // Click outside to close doctor dropdown
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         doctorDropdownRef.current &&
//         !doctorDropdownRef.current.contains(event.target as Node)
//       ) {
//         setShowDoctorDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Fetch completed emergency assessments (list)
//   const fetchCompletedAssessments = async () => {
//     setLoadingAssessments(true);
//     try {
//      const res = await fetch("/api/emergency/assessments?status=Completed&linked=null");
//       const data = await res.json();
//       if (data.success) {
//         setCompletedAssessments(data.data);
//         setShowAssessmentModal(true);
//       } else {
//         toast.error("Failed to load emergency assessments");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Error loading assessments");
//     } finally {
//       setLoadingAssessments(false);
//     }
//   };

//   // Fetch full assessment details by ID
//   const fetchFullAssessment = async (id: string) => {
//     try {
//       const res = await fetch(`/api/emergency/assessments?id=${id}`);
//       const data = await res.json();
//       if (data.success) {
//         return data.data;
//       } else {
//         toast.error("Failed to load assessment details");
//         return null;
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Error loading assessment details");
//       return null;
//     }
//   };

//   // Select an emergency assessment and pre‑fill the form with full data
//   const selectEmergencyAssessment = async (assessment: EmergencyAssessment) => {
//     toast.loading("Loading assessment details...");
//     const full = await fetchFullAssessment(assessment.id);
//     toast.dismiss();
//     if (!full) {
//       toast.error("Could not load assessment details");
//       return;
//     }

//     setForm((prev) => ({
//       ...prev,
//       fullName: full.patientName || "",
//       dob: full.age ? `${new Date().getFullYear() - full.age}-01-01` : "",
//       gender: full.gender?.toLowerCase() || "",
//       reason: full.chiefComplaints || "",
//       physician: full.mainDoctor || "",
//     }));
//     setDoctorSearch(full.mainDoctor || "");
//     setSelectedPatientId(full.patient_id);        // ✅ store the existing patient_id
//     setSelectedAssessmentId(assessment.id);
//     setShowAssessmentModal(false);
//     toast.success(`Loaded assessment for ${full.patientName}`);
//   };

//   // Search patient (existing)
//   const searchPatient = async () => {
//     if (!phoneSearch.trim()) {
//       toast.error("Please enter phone number");
//       return;
//     }
//     setLoadingPatient(true);
//     try {
//       const res = await admissionsApi.searchPatient(phoneSearch);
//       const patients = Array.isArray(res.data) ? res.data : [];
//       if (patients.length === 1) {
//         selectPatient(patients[0]);
//       } else if (patients.length > 1) {
//         setSearchResults(patients);
//         setShowPatientModal(true);
//       } else {
//         toast.error("Patient not found");
//         setPatientData(null);
//       }
//     } catch (error: any) {
//       const errorMessage = error?.response?.data?.message || error?.message || "Error searching patient";
//       toast.error(errorMessage);
//     } finally {
//       setLoadingPatient(false);
//     }
//   };

//   const selectPatient = (patient: Patient) => {
//     setPatientData(patient);
//     setForm((prev) => ({
//       ...prev,
//       fullName: patient.full_name_en || "",
//       dob: patient.dob || "",
//       gender: patient.gender || "",
//       phone: patient.phone || "",
//       email: patient.email || "",
//       address: patient.address || "",
//       city: patient.city || "",
//       state: patient.state || "",
//       pincode: patient.pincode || "",
//     }));
//     setShowPatientModal(false);
//     setPhoneSearch("");
//     toast.success("Patient selected");
//   };

//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//     >,
//   ) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setSubmitting(true);

//   // ✅ Determine the correct patient reference
//   let patientPayload;
//   if (selectedPatientId) {
//     // Coming from "Load from Emergency" – use existing patient ID
//     patientPayload = { patientId: selectedPatientId };
//   } else if (mode === "existing") {
//     patientPayload = { patientId: patientData?.patient_id };
//   } else {
//     patientPayload = {
//       patient: {
//         fullName: form.fullName,
//         dob: form.dob,
//         gender: form.gender,
//         phone: form.phone,
//         email: form.email,
//         address: form.address,
//         city: form.city,
//         pincode: form.pincode,
//         state: form.state,
//       },
//     };
//   }

//   const payload: any = {
//     mode: selectedPatientId ? "existing" : mode,
//     ...patientPayload,
//     admission: {
//       admissionDate: form.admissionDate,
//       wardId: form.ward ? parseInt(form.ward) : null,
//       roomId: null,
//       bedId: form.bed ? parseInt(form.bed) : null,
//       reason: form.reason,
//       diagnosis: form.diagnosis,
//       primary_consultant: form.physician || null,
//     },
//     emergency: {
//       name: form.emergencyName,
//       relation: form.emergencyRelation,
//       phone: form.emergencyPhone,
//     },
//   };

//   // If coming from an emergency assessment, include its ID
//   if (selectedAssessmentId) {
//     payload.emergencyAssessmentId = selectedAssessmentId;
//   }

//   // 🔍 Debug logs
//   console.log("=== SUBMITTING ADMISSION ===");
//   console.log("selectedPatientId:", selectedPatientId);
//   console.log("mode (final):", payload.mode);
//   console.log("selectedAssessmentId:", selectedAssessmentId);
//   console.log("Full payload:", JSON.stringify(payload, null, 2));

//   try {
//     const res = await admissionsApi.createAdmission(payload);
//     console.log("Response:", res);
//     if (res?.data?.admissionId) {
//       let successMessage = "Patient admitted successfully";
//       if (!selectedPatientId && mode === "new" && res?.generatedPassword) {
//         successMessage += ` Password: ${res.generatedPassword}`;
//         toast.success(successMessage, { duration: 10000 });
//       } else {
//         toast.success(successMessage);
//       }
//       resetForm();
//       // Optionally refresh the emergency assessments list or redirect

//     } else {
//       toast.error("Failed to admit patient");
//     }
//   } catch (error) {
//     console.error(error);
//     toast.error("Failed to admit patient");
//   } finally {
//     setSubmitting(false);
//   }
// };

//   const handleDiscard = () => {
//     if (confirm("Discard all changes?")) {
//       resetForm();
//       toast.info("Form cleared");
//     }
//   };

//   const handleSaveDraft = () => {
//     localStorage.setItem("admissionDraft", JSON.stringify(form));
//     toast.success("Draft saved locally");
//   };

//   // Load draft
//   useEffect(() => {
//     const draft = localStorage.getItem("admissionDraft");
//     if (draft) {
//       try {
//         const saved = JSON.parse(draft);
//         setForm({
//           ...saved,
//           admissionDate: new Date().toISOString().split("T")[0],
//         });
//       } catch {}
//     }
//   }, []);

//   const handleBillingClick = () => router.push("/helpdesk/billing");
//   const handleRoomAvailabilityClick = () => router.push("/admin/bed-management");
//   const handleDoctorSlotsClick = () => router.push("/helpdesk/doctor-slots");

//   // Patient modal (from phone search)
//   const PatientModal = () => (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
//       <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
//         <h3 className="text-lg font-bold mb-4">Select Patient</h3>
//         <div className="space-y-2 max-h-96 overflow-y-auto">
//           {searchResults.map((patient) => (
//             <button
//               key={patient.patient_id}
//               onClick={() => selectPatient(patient)}
//               className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
//             >
//               <p className="font-medium">{patient.full_name_en || "Unknown"}</p>
//               <p className="text-sm text-gray-500">
//                 DOB: {patient.dob || "N/A"} • ID: {patient.patient_id}
//               </p>
//             </button>
//           ))}
//         </div>
//         <button
//           onClick={() => setShowPatientModal(false)}
//           className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   );

//   // Emergency Assessment modal
//   const AssessmentModal = () => (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
//       <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-xl">
//         <h3 className="text-lg font-bold mb-4">Select Completed Emergency Assessment</h3>
//         {loadingAssessments ? (
//           <div className="text-center py-8">Loading assessments...</div>
//         ) : completedAssessments.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">No completed assessments found.</div>
//         ) : (
//           <div className="space-y-2 max-h-96 overflow-y-auto">
//             {completedAssessments.map((assessment) => (
//               <button
//                 key={assessment.id}
//                 onClick={() => selectEmergencyAssessment(assessment)}
//                 className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
//               >
//                 <p className="font-medium">{assessment.patientName}</p>
//                 <p className="text-sm text-gray-500">
//                   ID: {assessment.id} • UHID: {assessment.uhid} • Age: {assessment.age || "N/A"} • Chief: {assessment.chiefComplaints || "—"}
//                 </p>
//               </button>
//             ))}
//           </div>
//         )}
//         <button
//           onClick={() => setShowAssessmentModal(false)}
//           className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   );

//   if (!tenantLoading && !isNewAdmissionEnabled) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="text-red-500 text-6xl mb-4">🔒</div>
//           <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
//           <p className="text-gray-600">
//             New Admission feature is not enabled for {tenant?.name}.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       <HelpDeskSidebar
//         isOpen={mobileMenuOpen}
//         onClose={() => setMobileMenuOpen(false)}
//         onBillingClick={handleBillingClick}
//         onRoomAvailabilityClick={handleRoomAvailabilityClick}
//         onDoctorSlotsClick={handleDoctorSlotsClick}
//       />

//       <div className="flex-1 flex flex-col min-h-screen">
//         <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
//           <button
//             onClick={() => setMobileMenuOpen(true)}
//             className="p-2 rounded-lg hover:bg-gray-100"
//           >
//             <span className="material-icons">menu</span>
//           </button>
//           <h1 className="text-xl font-bold text-gray-800 truncate">
//             Patient Admission
//           </h1>
//         </header>

//         <button
//           className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
//           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           aria-label="Toggle menu"
//         >
//           {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//         </button>

//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
//           <div className="space-y-6">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Patient Admission</h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 Admit new or existing patients
//               </p>
//             </div>

//             <div className="flex flex-wrap gap-3 items-center">
//               <div className="bg-gray-50 p-1.5 rounded-xl inline-flex items-center gap-1">
//                 <button
//                   type="button"
//                   onClick={() => setMode("new")}
//                   className={`px-6 py-2 font-bold rounded-lg shadow-sm text-sm transition-colors ${
//                     mode === "new"
//                       ? "bg-white text-blue-600"
//                       : "text-gray-500 hover:text-blue-600"
//                   }`}
//                 >
//                   New Admission
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setMode("existing")}
//                   className={`px-6 py-2 font-medium rounded-lg text-sm transition-colors ${
//                     mode === "existing"
//                       ? "bg-white text-blue-600 font-bold shadow-sm"
//                       : "text-gray-500 hover:text-blue-600"
//                   }`}
//                 >
//                   Existing Patient
//                 </button>
//               </div>

//               <button
//                 type="button"
//                 onClick={fetchCompletedAssessments}
//                 className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
//               >
//                 Load from Emergency
//               </button>
//             </div>

//             {mode === "existing" && (
//               <div className="mb-6 p-6 bg-gray-50 rounded-2xl">
//                 <div className="flex flex-row items-end gap-4">
//                   <div className="flex-1">
//                     <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider hidden md:block">
//                       Search by Phone Number
//                     </label>
//                     <input
//                       type="tel"
//                       value={phoneSearch}
//                       onChange={(e) => setPhoneSearch(e.target.value)}
//                       placeholder="Enter patient phone number"
//                       className="w-full bg-white border border-gray-200 rounded-xl px-4 h-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                     />
//                   </div>
//                   <button
//                     onClick={searchPatient}
//                     disabled={loadingPatient}
//                     className="px-6 h-12 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
//                   >
//                     {loadingPatient ? "Searching..." : "Search"}
//                   </button>
//                 </div>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-12">
//               {/* Section 1: Demographics */}
//               <section>
//                 <div className="flex items-center gap-4 mb-8">
//                   <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
//                     01
//                   </div>
//                   <h3 className="text-xl font-bold font-headline text-gray-900">
//                     Personal Demographics
//                   </h3>
//                 </div>
//                 <div className="grid grid-cols-12 gap-6">
//                   <div className="col-span-12 md:col-span-5 flex flex-col gap-2">
//                     <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">
//                       Full Name
//                     </label>
//                     <input
//                       name="fullName"
//                       value={form.fullName}
//                       onChange={handleChange}
//                       placeholder="First and last name"
//                       required
//                       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                     />
//                   </div>
//                   <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
//                     <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">
//                       Date of Birth
//                     </label>
//                     <input
//                       name="dob"
//                       type="date"
//                       value={form.dob}
//                       onChange={handleChange}
//                       required
//                       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                     />
//                   </div>
//                   <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
//                     <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">
//                       Gender Identity
//                     </label>
//                     <select
//                       name="gender"
//                       value={form.gender}
//                       onChange={handleChange}
//                       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                     >
//                       <option value="">Select gender</option>
//                       <option value="male">Male</option>
//                       <option value="female">Female</option>
//                       <option value="non-binary">Non-binary</option>
//                       <option value="prefer-not">Prefer not to say</option>
//                     </select>
//                   </div>
//                   <div className="col-span-12 md:col-span-8 flex flex-col gap-2">
//                     <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">
//                       Residential Address
//                     </label>
//                     <input
//                       name="address"
//                       value={form.address}
//                       onChange={handleChange}
//                       placeholder="Street address, apartment, suite"
//                       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                     />
//                   </div>
//                   <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
//                     <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">
//                       City / Region
//                     </label>
//                     <input
//                       name="city"
//                       value={form.city}
//                       onChange={handleChange}
//                       placeholder="City"
//                       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                     />
//                   </div>
//                   <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
//                     <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">
//                       Pincode
//                     </label>
//                     <input
//                       name="pincode"
//                       value={form.pincode}
//                       onChange={handleChange}
//                       placeholder="Pincode"
//                       required
//                       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                     />
//                   </div>
//                   <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
//                     <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">
//                       State
//                     </label>
//                     <input
//                       name="state"
//                       value={form.state}
//                       onChange={handleChange}
//                       placeholder="State"
//                       required
//                       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                     />
//                   </div>
//                 </div>
//               </section>

//               {/* Section 2: Contact & Emergency */}
//               <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
//                 <div>
//                   <div className="flex items-center gap-4 mb-8">
//                     <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
//                       02
//                     </div>
//                     <h3 className="text-xl font-bold font-headline text-gray-900">
//                       Contact Details
//                     </h3>
//                   </div>
//                   <div className="space-y-6">
//                     <div className="flex flex-col gap-2">
//                       <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">
//                         Phone Number
//                       </label>
//                       <div className="relative">
//                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
//                           +1
//                         </span>
//                         <input
//                           name="phone"
//                           type="tel"
//                           value={form.phone}
//                           onChange={handleChange}
//                           className="pl-10 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                           placeholder="(555) 000-0000"
//                         />
//                       </div>
//                     </div>
//                     <div className="flex flex-col gap-2">
//                       <label className="text-xs font-bold text-gray-600 ml-1 uppercase tracking-wider">
//                         Email Address
//                       </label>
//                       <input
//                         name="email"
//                         type="email"
//                         value={form.email}
//                         onChange={handleChange}
//                         placeholder="patient@example.com"
//                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 rounded-2xl p-8">
//                   <div className="flex items-center gap-4 mb-6">
//                     <h3 className="text-lg font-bold font-headline text-gray-900">
//                       Emergency Contact
//                     </h3>
//                   </div>
//                   <div className="space-y-4">
//                     <div className="flex flex-col gap-1">
//                       <label className="text-[10px] font-bold text-gray-500 uppercase">
//                         Contact Name
//                       </label>
//                       <input
//                         name="emergencyName"
//                         value={form.emergencyName}
//                         onChange={handleChange}
//                         className="!bg-white border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                         placeholder="Legal guardian or relative"
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="flex flex-col gap-1">
//                         <label className="text-[10px] font-bold text-gray-500 uppercase">
//                           Relationship
//                         </label>
//                         <input
//                           name="emergencyRelation"
//                           value={form.emergencyRelation}
//                           onChange={handleChange}
//                           className="!bg-white border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                           placeholder="e.g. Spouse"
//                         />
//                       </div>
//                       <div className="flex flex-col gap-1">
//                         <label className="text-[10px] font-bold text-gray-500 uppercase">
//                           Contact Phone
//                         </label>
//                         <input
//                           name="emergencyPhone"
//                           value={form.emergencyPhone}
//                           onChange={handleChange}
//                           className="!bg-white border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                           placeholder="Phone"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </section>

//               {/* Section 3: Admission Details */}
//               <section className="bg-blue-50 rounded-[2rem] p-10">
//                 <div className="flex items-center gap-4 mb-10">
//                   <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
//                     03
//                   </div>
//                   <h3 className="text-2xl font-bold font-headline text-gray-900">
//                     Clinical Admission Details
//                   </h3>
//                 </div>
//                 <div className="grid grid-cols-12 gap-8">
//                   <div className="col-span-12 flex flex-col gap-2">
//                     <label className="text-xs font-bold text-blue-700 ml-1 uppercase tracking-wider">
//                       Reason for Admission
//                     </label>
//                     <textarea
//                       name="reason"
//                       value={form.reason}
//                       onChange={handleChange}
//                       className="resize-none w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                       placeholder="Primary diagnosis or symptoms justifying admission..."
//                       rows={3}
//                     />
//                   </div>

//                   {/* Assigned Physician */}
//                   <div
//                     className="col-span-12 md:col-span-4 flex flex-col gap-2 relative"
//                     ref={doctorDropdownRef}
//                   >
//                     <label className="text-xs font-bold text-blue-700 ml-1 uppercase tracking-wider">
//                       Assigned Physician
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Search doctor..."
//                       value={doctorSearch}
//                       onChange={(e) => {
//                         setDoctorSearch(e.target.value);
//                         setShowDoctorDropdown(true);
//                       }}
//                       onFocus={() => setShowDoctorDropdown(true)}
//                       className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                     />
//                     {showDoctorDropdown && (
//                       <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
//                         {filteredDoctors.length > 0 ? (
//                           filteredDoctors.map((doc) => (
//                             <div
//                               key={doc.id}
//                               onClick={() => {
//                                 setForm((prev) => ({
//                                   ...prev,
//                                   physician: `${doc.firstName} ${doc.lastName}`,
//                                 }));
//                                 setDoctorSearch(`${doc.firstName} ${doc.lastName}`);
//                                 setShowDoctorDropdown(false);
//                               }}
//                               className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm"
//                             >
//                               <div className="font-medium">
//                                 Dr. {doc.firstName} {doc.lastName}
//                               </div>
//                               <div className="text-xs text-gray-500">
//                                 {doc.department}
//                                 {doc.specialty ? ` • ${doc.specialty}` : ""}
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <div className="px-4 py-3 text-sm text-gray-500">
//                             No doctors found
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   {/* Ward & Bed Allocation */}
//                   <div className="col-span-12 md:col-span-8 flex flex-col gap-2">
//                     <label className="text-xs font-bold text-blue-700 ml-1 uppercase tracking-wider">
//                       Ward &amp; Bed Allocation
//                     </label>
//                     <div className="grid grid-cols-2 gap-2">
//                       <select
//                         name="ward"
//                         value={form.ward}
//                         onChange={handleChange}
//                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                       >
//                         <option value="">Select Ward</option>
//                         {wards.map((ward) => (
//                           <option key={ward.id} value={ward.id}>
//                             {ward.name}
//                           </option>
//                         ))}
//                       </select>
//                       <select
//                         name="bed"
//                         value={form.bed}
//                         onChange={handleChange}
//                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
//                         disabled={!form.ward}
//                       >
//                         <option value="">Select Bed</option>
//                         {beds.map((bed) => (
//                           <option key={bed.id} value={bed.id}>
//                             {bed.bed_number}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               </section>

//               {/* Action Bar */}
//               <div className="flex items-center justify-between pt-8 border-t border-gray-200">
//                 <button
//                   type="button"
//                   onClick={handleDiscard}
//                   className="text-gray-500 font-bold hover:text-gray-800 transition-colors flex items-center gap-2"
//                 >
//                   <span className="material-symbols-outlined">close</span>
//                   Discard Draft
//                 </button>
//                 <div className="flex items-center gap-4">
//                   <button
//                     type="button"
//                     onClick={handleSaveDraft}
//                     className="px-8 py-3 rounded-full text-blue-600 font-bold hover:bg-blue-50 transition-colors"
//                   >
//                     Save as Draft
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={submitting}
//                     className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
//                   >
//                     {submitting ? "Admitting..." : "Complete Admission"}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </main>
//       </div>

//       {showPatientModal && <PatientModal />}
//       {showAssessmentModal && <AssessmentModal />}
//     </div>
//   );
// }




"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import HelpDeskSidebar from "@/components/helpdesk/HelpDeskSidebar";
import { admissionsApi } from "@/lib/api/admissions";
import EnhancedVoiceInput from "@/components/ui/EnhancedVoiceInput";

import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, HELPDESK_FEATURES } from "@/lib/feature";

// Types
interface Patient {
  patient_id: string;
  full_name_en?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface Ward {
  id: number;
  name: string;
}

interface Bed {
  id: number;
  bed_number: string;
  room_id: number | null;
  ward_id?: number;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  specialty?: string;
}

interface EmergencyAssessment {
  id: string;
  patientName: string;
  uhid: string;
  age: number | null;
  gender: string | null;
  chiefComplaints: string | null;
  createdAt: string;
}

export default function AdmissionForm() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const doctorDropdownRef = useRef<HTMLDivElement>(null);

  // Patient selection modal (from phone search)
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showPatientModal, setShowPatientModal] = useState(false);

  // Emergency assessment integration
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [completedAssessments, setCompletedAssessments] = useState<EmergencyAssessment[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

  // Form state
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
    email: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    reason: "",
    department: "",
    physician: "",
    ward: "",
    bed: "",
    admissionDate: new Date().toISOString().split("T")[0],
    diagnosis: "",
    state: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dropdown data
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);

  const isNewAdmissionEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.HELPDESK,
    HELPDESK_FEATURES.NEW_ADMISSION
  );

  const resetForm = () => {
    setForm({
      fullName: "",
      dob: "",
      gender: "",
      address: "",
      city: "",
      pincode: "",
      phone: "",
      email: "",
      emergencyName: "",
      emergencyRelation: "",
      emergencyPhone: "",
      reason: "",
      department: "",
      physician: "",
      ward: "",
      bed: "",
      admissionDate: new Date().toISOString().split("T")[0],
      diagnosis: "",
      state: "",
    });
    setPatientData(null);
    setPhoneSearch("");
    setMode("new");
    setDoctorSearch("");
    setSelectedAssessmentId(null);
    setSelectedPatientId(null);
    setErrors({});
  };

  const handleVoiceInput = (fieldName: string, text: string) => {
    setForm((prev) => ({ ...prev, [fieldName]: text }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  useEffect(() => {
    if (!tenantLoading && !isNewAdmissionEnabled) {
      router.push("/unauthorized");
    }
  }, [tenantLoading, isNewAdmissionEnabled, router]);

  // Load wards
  useEffect(() => {
    admissionsApi
      .getWards()
      .then((res) => {
        const wardsData = res.data?.data || res.data;
        setWards(Array.isArray(wardsData) ? wardsData : []);
      })
      .catch((err) => console.error("Failed to load wards", err));
  }, []);

  // Load beds when ward changes
  useEffect(() => {
    if (form.ward) {
      const wardId = parseInt(form.ward);
      admissionsApi
        .getBeds({ ward_id: wardId, status: "available" })
        .then((res: any) => {
          let bedsData: Bed[] = [];
          if (res?.data?.data && Array.isArray(res.data.data)) {
            bedsData = res.data.data;
          } else if (res?.data && Array.isArray(res.data)) {
            bedsData = res.data;
          } else if (Array.isArray(res)) {
            bedsData = res;
          } else if (res?.beds && Array.isArray(res.beds)) {
            bedsData = res.beds;
          }
          bedsData = bedsData.filter((bed) => bed.ward_id === wardId);
          setBeds(bedsData);
          setForm((prev) => ({ ...prev, bed: "" }));
        })
        .catch((err) => console.error("Failed to load beds", err));
    } else {
      setBeds([]);
      setForm((prev) => ({ ...prev, bed: "" }));
    }
  }, [form.ward]);

  // Load doctors
  useEffect(() => {
    admissionsApi
      .getDoctors()
      .then((res) => {
        const data = res.data?.data || res.data;
        setDoctors(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch doctors", err);
        toast.error("Failed to load doctors");
      });
  }, []);

  // Filter doctors
  const filteredDoctors = doctors.filter((doc) => {
    const searchTerm = doctorSearch.toLowerCase();
    const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
    const department = (doc.department || "").toLowerCase();
    const specialty = (doc.specialty || "").toLowerCase();
    return (
      fullName.includes(searchTerm) ||
      department.includes(searchTerm) ||
      specialty.includes(searchTerm)
    );
  });

  // Click outside to close doctor dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        doctorDropdownRef.current &&
        !doctorDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDoctorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch completed emergency assessments (list)
  const fetchCompletedAssessments = async () => {
    setLoadingAssessments(true);
    try {
      const res = await fetch("/api/emergency/assessments?status=Completed&linked=null");
      const data = await res.json();
      if (data.success) {
        setCompletedAssessments(data.data);
        setShowAssessmentModal(true);
      } else {
        toast.error("Failed to load emergency assessments");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading assessments");
    } finally {
      setLoadingAssessments(false);
    }
  };

  // Fetch full assessment details by ID
  const fetchFullAssessment = async (id: string) => {
    try {
      const res = await fetch(`/api/emergency/assessments?id=${id}`);
      const data = await res.json();
      if (data.success) {
        return data.data;
      } else {
        toast.error("Failed to load assessment details");
        return null;
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading assessment details");
      return null;
    }
  };

  // Select an emergency assessment and pre‑fill the form with full data
  const selectEmergencyAssessment = async (assessment: EmergencyAssessment) => {
    toast.loading("Loading assessment details...");
    const full = await fetchFullAssessment(assessment.id);
    toast.dismiss();
    if (!full) {
      toast.error("Could not load assessment details");
      return;
    }

    setForm((prev) => ({
      ...prev,
      fullName: full.patientName || "",
      dob: full.age ? `${new Date().getFullYear() - full.age}-01-01` : "",
      gender: full.gender?.toLowerCase() || "",
      reason: full.chiefComplaints || "",
      physician: full.mainDoctor || "",
    }));
    setDoctorSearch(full.mainDoctor || "");
    setSelectedPatientId(full.patient_id);
    setSelectedAssessmentId(assessment.id);
    setShowAssessmentModal(false);
    toast.success(`Loaded assessment for ${full.patientName}`);
  };

  // Search patient (existing)
  const searchPatient = async () => {
    if (!phoneSearch.trim()) {
      toast.error("Please enter phone number");
      return;
    }
    setLoadingPatient(true);
    try {
      const res = await admissionsApi.searchPatient(phoneSearch);
      const patients = Array.isArray(res.data) ? res.data : [];
      if (patients.length === 1) {
        selectPatient(patients[0]);
      } else if (patients.length > 1) {
        setSearchResults(patients);
        setShowPatientModal(true);
      } else {
        toast.error("Patient not found");
        setPatientData(null);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error searching patient";
      toast.error(errorMessage);
    } finally {
      setLoadingPatient(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    setPatientData(patient);
    setForm((prev) => ({
      ...prev,
      fullName: patient.full_name_en || "",
      dob: patient.dob || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      city: patient.city || "",
      state: patient.state || "",
      pincode: patient.pincode || "",
    }));
    setShowPatientModal(false);
    setPhoneSearch("");
    toast.success("Patient selected");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let patientPayload;
    if (selectedPatientId) {
      patientPayload = { patientId: selectedPatientId };
    } else if (mode === "existing") {
      patientPayload = { patientId: patientData?.patient_id };
    } else {
      patientPayload = {
        patient: {
          fullName: form.fullName,
          dob: form.dob,
          gender: form.gender,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
          state: form.state,
        },
      };
    }

    const payload: any = {
      mode: selectedPatientId ? "existing" : mode,
      ...patientPayload,
      admission: {
        admissionDate: form.admissionDate,
        wardId: form.ward ? parseInt(form.ward) : null,
        roomId: null,
        bedId: form.bed ? parseInt(form.bed) : null,
        reason: form.reason,
        diagnosis: form.diagnosis,
        primary_consultant: form.physician || null,
      },
      emergency: {
        name: form.emergencyName,
        relation: form.emergencyRelation,
        phone: form.emergencyPhone,
      },
    };

    if (selectedAssessmentId) {
      payload.emergencyAssessmentId = selectedAssessmentId;
    }

    try {
      const res = await admissionsApi.createAdmission(payload);
      if (res?.data?.admissionId) {
        let successMessage = "Patient admitted successfully";
        if (!selectedPatientId && mode === "new" && res?.generatedPassword) {
          successMessage += ` Password: ${res.generatedPassword}`;
          toast.success(successMessage, { duration: 10000 });
        } else {
          toast.success(successMessage);
        }
        resetForm();
      } else {
        toast.error("Failed to admit patient");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to admit patient");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (confirm("Discard all changes?")) {
      resetForm();
      toast.info("Form cleared");
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem("admissionDraft", JSON.stringify(form));
    toast.success("Draft saved locally");
  };

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem("admissionDraft");
    if (draft) {
      try {
        const saved = JSON.parse(draft);
        setForm({
          ...saved,
          admissionDate: new Date().toISOString().split("T")[0],
        });
      } catch {}
    }
  }, []);

  const handleBillingClick = () => router.push("/helpdesk/billing");
  const handleRoomAvailabilityClick = () => router.push("/admin/bed-management");
  const handleDoctorSlotsClick = () => router.push("/helpdesk/doctor-slots");

  // Patient modal
  const PatientModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-[#E2EFEA] dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Patient</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {searchResults.map((patient) => (
            <button
              key={patient.patient_id}
              onClick={() => selectPatient(patient)}
              className="w-full text-left p-3 rounded-lg hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-colors border border-[#E2EFEA] dark:border-gray-700"
            >
              <p className="font-medium text-gray-900 dark:text-white">{patient.full_name_en || "Unknown"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                DOB: {patient.dob || "N/A"} • ID: {patient.patient_id}
              </p>
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowPatientModal(false)}
          className="mt-4 w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Emergency Assessment modal
  const AssessmentModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-xl border border-[#E2EFEA] dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Completed Emergency Assessment</h3>
        {loadingAssessments ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading assessments...</div>
        ) : completedAssessments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No completed assessments found.</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {completedAssessments.map((assessment) => (
              <button
                key={assessment.id}
                onClick={() => selectEmergencyAssessment(assessment)}
                className="w-full text-left p-3 rounded-lg hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-colors border border-[#E2EFEA] dark:border-gray-700"
              >
                <p className="font-medium text-gray-900 dark:text-white">{assessment.patientName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {assessment.id} • UHID: {assessment.uhid} • Age: {assessment.age || "N/A"} • Chief: {assessment.chiefComplaints || "—"}
                </p>
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowAssessmentModal(false)}
          className="mt-4 w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (!tenantLoading && !isNewAdmissionEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-[#E2EFEA] dark:border-gray-700">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            New Admission feature is not enabled for {tenant?.name}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <HelpDeskSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onBillingClick={handleBillingClick}
        onRoomAvailabilityClick={handleRoomAvailabilityClick}
        onDoctorSlotsClick={handleDoctorSlotsClick}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-[#E2EFEA] dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            Patient Admission
          </h1>
        </header>

        <button
          className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Admission</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Admit new or existing patients
                </p>
              </div>
              {/* Voice Mode Toggle */}
              <button
                type="button"
                onClick={() => setVoiceMode(!voiceMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  voiceMode 
                    ? "bg-[#2BB2A7] text-white" 
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <Mic className="w-4 h-4" />
                {voiceMode ? "Voice Mode ON" : "Voice Mode OFF"}
              </button>
            </div>

            {/* Voice Mode Banner */}
            {voiceMode && (
              <div className="bg-[#EAF7F4] dark:bg-[#1F8F89]/20 border border-[#2BB2A7]/30 dark:border-[#2BB2A7]/20 rounded-lg p-3 flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#2BB2A7]" />
                <p className="text-sm text-[#1F8F89] dark:text-[#2BB2A7]">
                  Voice mode is ON! Click the microphone icon next to any field and speak to fill it automatically.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 items-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMode("new")}
                  className={`px-6 py-2 font-bold rounded-lg shadow-sm text-sm transition-colors ${
                    mode === "new"
                      ? "bg-white dark:bg-gray-700 text-[#2BB2A7] dark:text-[#2BB2A7]"
                      : "text-gray-500 dark:text-gray-400 hover:text-[#2BB2A7]"
                  }`}
                >
                  New Admission
                </button>
                <button
                  type="button"
                  onClick={() => setMode("existing")}
                  className={`px-6 py-2 font-medium rounded-lg text-sm transition-colors ${
                    mode === "existing"
                      ? "bg-white dark:bg-gray-700 text-[#2BB2A7] dark:text-[#2BB2A7] font-bold shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-[#2BB2A7]"
                  }`}
                >
                  Existing Patient
                </button>
              </div>

              <button
                type="button"
                onClick={fetchCompletedAssessments}
                className="px-6 py-2 bg-[#2BB2A7] text-white rounded-xl font-medium hover:bg-[#1F8F89] transition-colors"
              >
                Load from Emergency
              </button>
            </div>

            {mode === "existing" && (
              <div className="mb-6 p-6 bg-[#F4F9F7] dark:bg-gray-800/50 rounded-2xl border border-[#E2EFEA] dark:border-gray-700">
                <div className="flex flex-row items-end gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-[#1F8F89] dark:text-[#2BB2A7] ml-1 uppercase tracking-wider hidden md:block">
                      Search by Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phoneSearch}
                        onChange={(e) => setPhoneSearch(e.target.value)}
                        placeholder="Enter patient phone number"
                        className="w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 h-12 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white"
                      />
                      {voiceMode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <EnhancedVoiceInput
                            onTranscript={(text) => {
                              const digits = text.replace(/\D/g, '');
                              setPhoneSearch(digits.slice(0, 10));
                            }}
                            fieldName="phoneSearch"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={searchPatient}
                    disabled={loadingPatient}
                    className="px-6 h-12 bg-[#2BB2A7] text-white rounded-xl font-medium hover:bg-[#1F8F89] transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {loadingPatient ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Section 1: Demographics */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-[#EAF7F4] dark:bg-[#1F8F89]/20 text-[#2BB2A7] dark:text-[#2BB2A7] flex items-center justify-center text-xs font-bold border border-[#2BB2A7]/30 dark:border-[#2BB2A7]/20">
                    01
                  </div>
                  <h3 className="text-xl font-bold font-headline text-gray-900 dark:text-white">
                    Personal Demographics
                  </h3>
                </div>
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-5 flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="First and last name"
                        required
                        className={`w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                          voiceMode ? "pr-12" : ""
                        }`}
                      />
                      {voiceMode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <EnhancedVoiceInput
                            onTranscript={(text) => handleVoiceInput("fullName", text)}
                            fieldName="fullName"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 uppercase tracking-wider">
                      Date of Birth
                    </label>
                    <input
                      name="dob"
                      type="date"
                      value={form.dob}
                      onChange={handleChange}
                      required
                      className="w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 uppercase tracking-wider">
                      Gender Identity
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="col-span-12 md:col-span-8 flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 uppercase tracking-wider">
                      Residential Address
                    </label>
                    <div className="relative">
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Street address, apartment, suite"
                        className={`w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                          voiceMode ? "pr-12" : ""
                        }`}
                      />
                      {voiceMode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <EnhancedVoiceInput
                            onTranscript={(text) => handleVoiceInput("address", text)}
                            fieldName="address"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 uppercase tracking-wider">
                      City / Region
                    </label>
                    <div className="relative">
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="City"
                        className={`w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                          voiceMode ? "pr-12" : ""
                        }`}
                      />
                      {voiceMode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <EnhancedVoiceInput
                            onTranscript={(text) => handleVoiceInput("city", text)}
                            fieldName="city"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 uppercase tracking-wider">
                      Pincode
                    </label>
                    <div className="relative">
                      <input
                        name="pincode"
                        value={form.pincode}
                        onChange={handleChange}
                        placeholder="Pincode"
                        required
                        className={`w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                          voiceMode ? "pr-12" : ""
                        }`}
                      />
                      {voiceMode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <EnhancedVoiceInput
                            onTranscript={(text) => {
                              const digits = text.replace(/\D/g, '');
                              handleVoiceInput("pincode", digits.slice(0, 6));
                            }}
                            fieldName="pincode"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 uppercase tracking-wider">
                      State
                    </label>
                    <div className="relative">
                      <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="State"
                        required
                        className={`w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                          voiceMode ? "pr-12" : ""
                        }`}
                      />
                      {voiceMode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <EnhancedVoiceInput
                            onTranscript={(text) => handleVoiceInput("state", text)}
                            fieldName="state"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Contact & Emergency */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-8 h-8 rounded-full bg-[#EAF7F4] dark:bg-[#1F8F89]/20 text-[#2BB2A7] dark:text-[#2BB2A7] flex items-center justify-center text-xs font-bold border border-[#2BB2A7]/30 dark:border-[#2BB2A7]/20">
                      02
                    </div>
                    <h3 className="text-xl font-bold font-headline text-gray-900 dark:text-white">
                      Contact Details
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          className={`w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                            voiceMode ? "pr-12" : ""
                          }`}
                          placeholder="(555) 000-0000"
                        />
                        {voiceMode && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <EnhancedVoiceInput
                              onTranscript={(text) => {
                                const digits = text.replace(/\D/g, '');
                                handleVoiceInput("phone", digits.slice(0, 10));
                              }}
                              fieldName="phone"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="patient@example.com"
                          className={`w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                            voiceMode ? "pr-12" : ""
                          }`}
                        />
                        {voiceMode && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <EnhancedVoiceInput
                              onTranscript={(text) => {
                                const cleanEmail = text.replace(/\s/g, '').replace(/at/g, '@').replace(/dot/g, '.');
                                handleVoiceInput("email", cleanEmail);
                              }}
                              fieldName="email"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F4F9F7] dark:bg-gray-800/50 rounded-2xl p-8 border border-[#E2EFEA] dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-lg font-bold font-headline text-gray-900 dark:text-white">
                      Emergency Contact
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                        Contact Name
                      </label>
                      <div className="relative">
                        <input
                          name="emergencyName"
                          value={form.emergencyName}
                          onChange={handleChange}
                          className={`!bg-white dark:!bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                            voiceMode ? "pr-12" : ""
                          }`}
                          placeholder="Legal guardian or relative"
                        />
                        {voiceMode && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <EnhancedVoiceInput
                              onTranscript={(text) => handleVoiceInput("emergencyName", text)}
                              fieldName="emergencyName"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                          Relationship
                        </label>
                        <div className="relative">
                          <input
                            name="emergencyRelation"
                            value={form.emergencyRelation}
                            onChange={handleChange}
                            className={`!bg-white dark:!bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                              voiceMode ? "pr-12" : ""
                            }`}
                            placeholder="e.g. Spouse"
                          />
                          {voiceMode && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <EnhancedVoiceInput
                                onTranscript={(text) => handleVoiceInput("emergencyRelation", text)}
                                fieldName="emergencyRelation"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                          Contact Phone
                        </label>
                        <div className="relative">
                          <input
                            name="emergencyPhone"
                            value={form.emergencyPhone}
                            onChange={handleChange}
                            className={`!bg-white dark:!bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                              voiceMode ? "pr-12" : ""
                            }`}
                            placeholder="Phone"
                          />
                          {voiceMode && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <EnhancedVoiceInput
                                onTranscript={(text) => {
                                  const digits = text.replace(/\D/g, '');
                                  handleVoiceInput("emergencyPhone", digits.slice(0, 10));
                                }}
                                fieldName="emergencyPhone"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Admission Details */}
              <section className="bg-[#EAF7F4] dark:bg-[#1F8F89]/10 rounded-[2rem] p-10 border border-[#2BB2A7]/20 dark:border-[#2BB2A7]/10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-8 h-8 rounded-full bg-[#2BB2A7] text-white flex items-center justify-center text-xs font-bold">
                    03
                  </div>
                  <h3 className="text-2xl font-bold font-headline text-gray-900 dark:text-white">
                    Clinical Admission Details
                  </h3>
                </div>
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-12 flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#1F8F89] dark:text-[#2BB2A7] ml-1 uppercase tracking-wider">
                      Reason for Admission
                    </label>
                    <div className="relative">
                      <textarea
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        className={`resize-none w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                          voiceMode ? "pr-12" : ""
                        }`}
                        placeholder="Primary diagnosis or symptoms justifying admission..."
                        rows={3}
                      />
                      {voiceMode && (
                        <div className="absolute right-3 top-3">
                          <EnhancedVoiceInput
                            onTranscript={(text) => handleVoiceInput("reason", text)}
                            fieldName="reason"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assigned Physician */}
                  <div
                    className="col-span-12 md:col-span-4 flex flex-col gap-2 relative"
                    ref={doctorDropdownRef}
                  >
                    <label className="text-xs font-bold text-[#1F8F89] dark:text-[#2BB2A7] ml-1 uppercase tracking-wider">
                      Assigned Physician
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search doctor..."
                        value={doctorSearch}
                        onChange={(e) => {
                          setDoctorSearch(e.target.value);
                          setShowDoctorDropdown(true);
                        }}
                        onFocus={() => setShowDoctorDropdown(true)}
                        className={`w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white ${
                          voiceMode ? "pr-12" : ""
                        }`}
                      />
                      {voiceMode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <EnhancedVoiceInput
                            onTranscript={(text) => {
                              setDoctorSearch(text);
                              setForm(prev => ({ ...prev, physician: text }));
                            }}
                            fieldName="physician"
                          />
                        </div>
                      )}
                    </div>
                    {showDoctorDropdown && (
                      <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
                        {filteredDoctors.length > 0 ? (
                          filteredDoctors.map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  physician: `${doc.firstName} ${doc.lastName}`,
                                }));
                                setDoctorSearch(`${doc.firstName} ${doc.lastName}`);
                                setShowDoctorDropdown(false);
                              }}
                              className="px-4 py-3 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 cursor-pointer text-sm"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">
                                Dr. {doc.firstName} {doc.lastName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {doc.department}
                                {doc.specialty ? ` • ${doc.specialty}` : ""}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            No doctors found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ward & Bed Allocation */}
                  <div className="col-span-12 md:col-span-8 flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#1F8F89] dark:text-[#2BB2A7] ml-1 uppercase tracking-wider">
                      Ward &amp; Bed Allocation
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        name="ward"
                        value={form.ward}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white"
                      >
                        <option value="">Select Ward</option>
                        {wards.map((ward) => (
                          <option key={ward.id} value={ward.id}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                      <select
                        name="bed"
                        value={form.bed}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-gray-700 border border-[#E2EFEA] dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2BB2A7]/20 focus:border-[#2BB2A7] outline-none transition text-gray-900 dark:text-white"
                        disabled={!form.ward}
                      >
                        <option value="">Select Bed</option>
                        {beds.map((bed) => (
                          <option key={bed.id} value={bed.id}>
                            {bed.bed_number}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-8 border-t border-[#E2EFEA] dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="text-gray-500 dark:text-gray-400 font-bold hover:text-gray-800 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">close</span>
                  Discard Draft
                </button>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-8 py-3 rounded-full text-[#2BB2A7] dark:text-[#2BB2A7] font-bold hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/20 transition-colors"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-10 py-4 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-full font-bold shadow-lg shadow-[#2BB2A7]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                  >
                    {submitting ? "Admitting..." : "Complete Admission"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>

      {showPatientModal && <PatientModal />}
      {showAssessmentModal && <AssessmentModal />}
    </div>
  );
}