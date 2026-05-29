 


// "use client";

// import React, { useState, useEffect } from "react";
// import { X, User, UserPlus, Calendar, Search, Edit } from "lucide-react";
// import { helpdeskApi } from "@/lib/api/helpdesk";
// import { doctorsApi } from "@/lib/api/doctors";
// import toast from "react-hot-toast";

// type Patient = {
//   id: string;
//   name: string;
//   age: number;
//   gender: string;
//   phone?: string;
//   email?: string;
//   blood_group?: string;
//   allergies?: string;
// };

// type Doctor = {
//   id: string;
//   name: string;
//   specialization: string;
//   availableSlots: { date: string; times: string[] }[];
// };

// type Props = {
//   doctors: Doctor[];
//   onSearchPatientByPhone: (phone: string) => Promise<Patient[]>;
//   onClose: () => void;
//   onCreate: (appointment: any) => void;
// };

// export default function CreateAppointmentModal({
//   doctors,
//   onSearchPatientByPhone,
//   onClose,
//   onCreate,
// }: Props) {
//   const [patientType, setPatientType] = useState<"existing" | "new">("new");
//   const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [availableSlots, setAvailableSlots] = useState<string[]>([]);
//   const [loadingSlots, setLoadingSlots] = useState(false);

//   // Phone search states
//   const [phoneSearchInput, setPhoneSearchInput] = useState("");
//   const [phoneSearchResults, setPhoneSearchResults] = useState<Patient[]>([]);
//   const [isSearching, setIsSearching] = useState(false);
//   const [showSelectedView, setShowSelectedView] = useState(false);

//   const [formData, setFormData] = useState({
//     full_name_en: "",
//     phone: "",
//     email: "",
//     dob: "",
//     gender: "",
//     blood_group: "",
//     allergies: "",
//     appointmentDate: "",
//     appointmentTime: "",
//     doctorId: "",
//     consultationType: "in-person",
//     notes: "",
//   });

//   // Fetch available slots when doctor or date changes
//   useEffect(() => {
//     const fetchSlots = async () => {
//       if (!formData.doctorId || !formData.appointmentDate) return;

//       setLoadingSlots(true);
//       try {
//         const res = await doctorsApi.getSlots(
//           Number(formData.doctorId),
//           formData.appointmentDate
//         );
//         const slots = res.slots || [];
//         setAvailableSlots(slots);
//       } catch (err) {
//         console.error("❌ Error fetching slots:", err);
//         setAvailableSlots([]);
//       } finally {
//         setLoadingSlots(false);
//       }
//     };

//     fetchSlots();
//   }, [formData.doctorId, formData.appointmentDate]);

//   // Manual phone search
//   const handleSearch = async () => {
//     if (!phoneSearchInput || phoneSearchInput.trim().length < 10) {
//       toast.error("Please enter a valid 10-digit phone number");
//       return;
//     }
//     setIsSearching(true);
//     try {
//       const results = await onSearchPatientByPhone(phoneSearchInput);
//       setPhoneSearchResults(results);
//       if (results.length === 0) {
//         toast.error("No patient found with this phone number");
//       }
//     } catch (error) {
//       console.error("Search error:", error);
//       toast.error("Error searching for patient");
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const handleSelectPatient = (patient: Patient) => {
//     setSelectedPatient(patient);
//     setShowSelectedView(true);
//     setPhoneSearchResults([]);
//   };

//   const handleChangePatient = () => {
//     setShowSelectedView(false);
//     setSelectedPatient(null);
//     setPhoneSearchInput("");
//     setPhoneSearchResults([]);
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const payload: any = {
//       doctorId: formData.doctorId,
//       appointmentDate: formData.appointmentDate,
//       appointmentTime: formData.appointmentTime,
//       consultationType: formData.consultationType,
//       notes: formData.notes || undefined,
//     };

//     if (patientType === "existing" && selectedPatient) {
//       payload.patientId = selectedPatient.id;
//     } else if (patientType === "new") {
//       payload.full_name_en = formData.full_name_en;
//       payload.phone = formData.phone;
//       payload.email = formData.email || undefined;
//       payload.dob = formData.dob || undefined;
//       payload.gender = formData.gender || undefined;
//       payload.blood_group = formData.blood_group || undefined;
//       payload.allergies = formData.allergies || undefined;
//     } else {
//       toast.error("Please select or enter patient details");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await helpdeskApi.createAppointment(payload);
//       const result = response?.data !== undefined ? response.data : response;

//       if (result?.appointment) {
//         toast.success("Appointment created successfully 🎉");

//         const newAppointment = {
//           id: result.appointment.id,
//           patientId: result.appointment.patient_id,
//           patientName:
//             result.patient?.full_name_en ||
//             (patientType === "new"
//               ? formData.full_name_en
//               : selectedPatient?.name || ""),
//           age: result.patient?.age || 0,
//           gender: result.patient?.gender || formData.gender || selectedPatient?.gender || "",
//           appointmentDate: result.appointment.appointment_date,
//           appointmentTime: result.appointment.appointment_time,
//           doctorId: result.appointment.doctor_id,
//           doctorName: doctors.find((d) => d.id === result.appointment.doctor_id)?.name || "",
//           status: result.appointment.status,
//           consultationType: result.appointment.consultation_type,
//           notes: result.appointment.notes,
//         };

//         onCreate(newAppointment);
//         onClose();
//       } else {
//         toast.error(result?.message || "Failed to create appointment");
//       }
//     } catch (error) {
//       console.error("❌ Error creating appointment:", error);
//       toast.error("Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold text-gray-800">Create New Appointment</h2>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Patient Type Selection */}
//           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
//             <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//               <User className="w-5 h-5 text-blue-600" />
//               Patient
//             </h3>
//             <div className="flex gap-4 mb-4 flex-wrap">
//               <label className="flex items-center gap-2">
//                 <input
//                   type="radio"
//                   name="patientType"
//                   value="new"
//                   checked={patientType === "new"}
//                   onChange={() => setPatientType("new")}
//                 />
//                 <span className="text-sm">New Patient</span>
//               </label>
//               <label className="flex items-center gap-2">
//                 <input
//                   type="radio"
//                   name="patientType"
//                   value="existing"
//                   checked={patientType === "existing"}
//                   onChange={() => setPatientType("existing")}
//                 />
//                 <span className="text-sm">Existing Patient</span>
//               </label>
//             </div>

//             {patientType === "existing" && (
//               <div>
//                 {!showSelectedView ? (
//                   // Search view
//                   <div className="relative">
//                     <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                       Search by Phone Number
//                     </label>
//                     <div className="flex gap-2">
//                       <input
//                         type="tel"
//                         placeholder="Enter 10-digit phone number..."
//                         value={phoneSearchInput}
//                         onChange={(e) => setPhoneSearchInput(e.target.value)}
//                         onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//                         className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                         required={patientType === "existing"}
//                       />
//                       <button
//                         type="button"
//                         onClick={handleSearch}
//                         disabled={isSearching}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
//                       >
//                         <Search className="w-4 h-4" />
//                         {isSearching ? "Searching..." : "Search"}
//                       </button>
//                     </div>
//                     {isSearching && (
//                       <p className="text-sm text-gray-500 mt-1">Searching...</p>
//                     )}
//                     {phoneSearchResults.length > 0 && (
//                       <div className="absolute left-0 right-0 z-10 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
//                         {phoneSearchResults.map((patient) => (
//                           <div
//                             key={patient.id}
//                             onClick={() => handleSelectPatient(patient)}
//                             className="p-2 hover:bg-gray-100 cursor-pointer"
//                           >
//                             {patient.name} ({patient.age} yrs, {patient.gender}) – {patient.phone}
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   // Selected patient summary
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="font-medium text-gray-900">{selectedPatient?.name}</p>
//                         <p className="text-xs text-gray-500">
//                           {selectedPatient?.age} yrs, {selectedPatient?.gender} • {selectedPatient?.phone}
//                         </p>
//                         {selectedPatient?.blood_group && (
//                           <p className="text-xs text-gray-500 mt-1">Blood: {selectedPatient.blood_group}</p>
//                         )}
//                       </div>
//                       <button
//                         type="button"
//                         onClick={handleChangePatient}
//                         className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"
//                         title="Change patient"
//                       >
//                         <Edit className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* New Patient Information */}
//           {patientType === "new" && (
//             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
//               <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                 <UserPlus className="w-5 h-5 text-blue-600" />
//                 New Patient Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="col-span-1 md:col-span-2">
//                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                     Full Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="full_name_en"
//                     value={formData.full_name_en}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                     placeholder="John Doe"
//                     required={patientType === "new"}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                     Phone *
//                   </label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                     placeholder="+1 234 567 890"
//                     required={patientType === "new"}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                     placeholder="john@example.com"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                     Date of Birth
//                   </label>
//                   <input
//                     type="date"
//                     name="dob"
//                     value={formData.dob}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                     Gender
//                   </label>
//                   <select
//                     name="gender"
//                     value={formData.gender}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                   >
//                     <option value="">Select</option>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                     Blood Group
//                   </label>
//                   <input
//                     type="text"
//                     name="blood_group"
//                     value={formData.blood_group}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                     placeholder="e.g., O+"
//                   />
//                 </div>
//                 <div className="col-span-1 md:col-span-2">
//                   <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                     Allergies
//                   </label>
//                   <input
//                     type="text"
//                     name="allergies"
//                     value={formData.allergies}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                     placeholder="e.g., Penicillin"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Appointment Details */}
//           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
//             <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//               <Calendar className="w-5 h-5 text-blue-600" />
//               Appointment Details
//             </h3>
//             <div className="mb-4">
//               <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                 Select Doctor *
//               </label>
//               <select
//                 name="doctorId"
//                 value={formData.doctorId}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                 required
//               >
//                 <option value="">Select a doctor</option>
//                 {doctors.map((doctor) => (
//                   <option key={doctor.id} value={doctor.id}>
//                     {doctor.name} - {doctor.specialization}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                   Appointment Date *
//                 </label>
//                 <input
//                   type="date"
//                   name="appointmentDate"
//                   value={formData.appointmentDate}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                   Appointment Time *
//                 </label>
//                 {formData.doctorId && formData.appointmentDate ? (
//                   <select
//                     name="appointmentTime"
//                     value={formData.appointmentTime}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                     required
//                   >
//                     <option value="">Select time slot</option>
//                     {availableSlots.map((time) => (
//                       <option key={time} value={time}>
//                         {time}
//                       </option>
//                     ))}
//                   </select>
//                 ) : (
//                   <input
//                     type="time"
//                     name="appointmentTime"
//                     value={formData.appointmentTime}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                     disabled
//                     placeholder="Select doctor & date first"
//                   />
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Consultation Type & Notes */}
//           <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
//             <div className="mb-4">
//               <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                 Consultation Type *
//               </label>
//               <select
//                 name="consultationType"
//                 value={formData.consultationType}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//               >
//                 <option value="in-person">In-Person</option>
//                 <option value="video">Video</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
//                 Notes
//               </label>
//               <textarea
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
//                 rows={3}
//                 placeholder="Any additional notes..."
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={
//                 loading ||
//                 (patientType === "new"
//                   ? !formData.full_name_en || !formData.phone
//                   : !selectedPatient) ||
//                 !formData.doctorId ||
//                 !formData.appointmentDate ||
//                 !formData.appointmentTime
//               }
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//             >
//               {loading ? "Creating..." : "Create Appointment"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect } from "react";
import { X, User, UserPlus, Calendar, Search, Edit, Mic } from "lucide-react";
import { helpdeskApi } from "@/lib/api/helpdesk";
import { doctorsApi } from "@/lib/api/doctors";
import toast from "react-hot-toast";
import EnhancedVoiceInput from "@/components/ui/EnhancedVoiceInput";

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  blood_group?: string;
  allergies?: string;
};

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  availableSlots: { date: string; times: string[] }[];
};

type Props = {
  doctors: Doctor[];
  onSearchPatientByPhone: (phone: string) => Promise<Patient[]>;
  onClose: () => void;
  onCreate: (appointment: any) => void;
};

export default function CreateAppointmentModal({
  doctors,
  onSearchPatientByPhone,
  onClose,
  onCreate,
}: Props) {
  const [patientType, setPatientType] = useState<"existing" | "new">("new");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);

  // Phone search states
  const [phoneSearchInput, setPhoneSearchInput] = useState("");
  const [phoneSearchResults, setPhoneSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSelectedView, setShowSelectedView] = useState(false);

  const [formData, setFormData] = useState({
    full_name_en: "",
    phone: "",
    email: "",
    dob: "",
    gender: "",
    blood_group: "",
    allergies: "",
    appointmentDate: "",
    appointmentTime: "",
    doctorId: "",
    consultationType: "in-person",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.doctorId || !formData.appointmentDate) return;

      setLoadingSlots(true);
      try {
        const res = await doctorsApi.getSlots(
          Number(formData.doctorId),
          formData.appointmentDate
        );
        const slots = res.slots || [];
        setAvailableSlots(slots);
      } catch (err) {
        console.error("❌ Error fetching slots:", err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [formData.doctorId, formData.appointmentDate]);

  const handleVoiceInput = (fieldName: string, text: string) => {
    if (patientType === "new") {
      setFormData((prev) => ({ ...prev, [fieldName]: text }));
    }
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // Manual phone search
  const handleSearch = async () => {
    if (!phoneSearchInput || phoneSearchInput.trim().length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setIsSearching(true);
    try {
      const results = await onSearchPatientByPhone(phoneSearchInput);
      setPhoneSearchResults(results);
      if (results.length === 0) {
        toast.error("No patient found with this phone number");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching for patient");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowSelectedView(true);
    setPhoneSearchResults([]);
  };

  const handleChangePatient = () => {
    setShowSelectedView(false);
    setSelectedPatient(null);
    setPhoneSearchInput("");
    setPhoneSearchResults([]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateNewPatient = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name_en.trim()) newErrors.full_name_en = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let validationErrors: Record<string, string> = {};
    if (patientType === "new") {
      validationErrors = validateNewPatient();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    } else if (patientType === "existing" && !selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    const payload: any = {
      doctorId: formData.doctorId,
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      consultationType: formData.consultationType,
      notes: formData.notes || undefined,
    };

    if (patientType === "existing" && selectedPatient) {
      payload.patientId = selectedPatient.id;
    } else if (patientType === "new") {
      payload.full_name_en = formData.full_name_en;
      payload.phone = formData.phone;
      payload.email = formData.email || undefined;
      payload.dob = formData.dob || undefined;
      payload.gender = formData.gender || undefined;
      payload.blood_group = formData.blood_group || undefined;
      payload.allergies = formData.allergies || undefined;
    } else {
      toast.error("Please select or enter patient details");
      return;
    }

    setLoading(true);

    try {
      const response = await helpdeskApi.createAppointment(payload);
      const result = response?.data !== undefined ? response.data : response;

      if (result?.appointment) {
        toast.success("Appointment created successfully 🎉");

        const newAppointment = {
          id: result.appointment.id,
          patientId: result.appointment.patient_id,
          patientName:
            result.patient?.full_name_en ||
            (patientType === "new"
              ? formData.full_name_en
              : selectedPatient?.name || ""),
          age: result.patient?.age || 0,
          gender: result.patient?.gender || formData.gender || selectedPatient?.gender || "",
          appointmentDate: result.appointment.appointment_date,
          appointmentTime: result.appointment.appointment_time,
          doctorId: result.appointment.doctor_id,
          doctorName: doctors.find((d) => d.id === result.appointment.doctor_id)?.name || "",
          status: result.appointment.status,
          consultationType: result.appointment.consultation_type,
          notes: result.appointment.notes,
        };

        onCreate(newAppointment);
        onClose();
      } else {
        toast.error(result?.message || "Failed to create appointment");
      }
    } catch (error) {
      console.error("❌ Error creating appointment:", error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Create New Appointment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Mode Toggle */}
        <div className="px-6 pt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setVoiceMode(!voiceMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              voiceMode 
                ? "bg-green-500 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Mic className="w-4 h-4" />
            {voiceMode ? "Voice Mode ON" : "Voice Mode OFF"}
          </button>
        </div>

        {/* Voice Mode Banner */}
        {voiceMode && (
          <div className="mx-6 mt-2 mb-4 bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
            <Mic className="w-3 h-3 text-green-600" />
            <p className="text-xs text-green-700">
              Voice mode ON! Click the microphone icon next to any field and speak.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient Type Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Patient
            </h3>
            <div className="flex gap-4 mb-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="patientType"
                  value="new"
                  checked={patientType === "new"}
                  onChange={() => setPatientType("new")}
                />
                <span className="text-sm">New Patient</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="patientType"
                  value="existing"
                  checked={patientType === "existing"}
                  onChange={() => setPatientType("existing")}
                />
                <span className="text-sm">Existing Patient</span>
              </label>
            </div>

            {patientType === "existing" && (
              <div>
                {!showSelectedView ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                      Search by Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          placeholder="Enter 10-digit phone number..."
                          value={phoneSearchInput}
                          onChange={(e) => setPhoneSearchInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                        />
                        {voiceMode && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <EnhancedVoiceInput
                              onTranscript={(text) => {
                                const digits = text.replace(/\D/g, '');
                                setPhoneSearchInput(digits.slice(0, 10));
                              }}
                              fieldName="phoneSearch"
                            />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        {isSearching ? "Searching..." : "Search"}
                      </button>
                    </div>
                    {phoneSearchResults.length > 0 && (
                      <div className="mt-2 border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {phoneSearchResults.map((patient) => (
                          <div
                            key={patient.id}
                            onClick={() => handleSelectPatient(patient)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {patient.name} ({patient.age} yrs, {patient.gender}) – {patient.phone}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{selectedPatient?.name}</p>
                        <p className="text-xs text-gray-500">
                          {selectedPatient?.age} yrs, {selectedPatient?.gender} • {selectedPatient?.phone}
                        </p>
                        {selectedPatient?.blood_group && (
                          <p className="text-xs text-gray-500 mt-1">Blood: {selectedPatient.blood_group}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleChangePatient}
                        className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600"
                        title="Change patient"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* New Patient Information */}
          {patientType === "new" && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                New Patient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="full_name_en"
                      value={formData.full_name_en}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 ${
                        errors.full_name_en ? 'border-red-500' : 'border-slate-200'
                      } ${voiceMode ? "pr-12" : ""}`}
                      placeholder="John Doe"
                    />
                    {voiceMode && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <EnhancedVoiceInput
                          onTranscript={(text) => handleVoiceInput("full_name_en", text)}
                          fieldName="full_name_en"
                        />
                      </div>
                    )}
                  </div>
                  {errors.full_name_en && <p className="text-xs text-red-500 mt-1">{errors.full_name_en}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                    Phone *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 ${
                        errors.phone ? 'border-red-500' : 'border-slate-200'
                      } ${voiceMode ? "pr-12" : ""}`}
                      placeholder="9876543210"
                    />
                    {voiceMode && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
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
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 ${
                        voiceMode ? "pr-12" : ""
                      }`}
                      placeholder="john@example.com"
                    />
                    {voiceMode && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
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

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                    Blood Group
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 ${
                        voiceMode ? "pr-12" : ""
                      }`}
                      placeholder="O+"
                    />
                    {voiceMode && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <EnhancedVoiceInput
                          onTranscript={(text) => {
                            const match = text.toUpperCase().match(/(A|B|AB|O)[+-]/);
                            handleVoiceInput("blood_group", match ? match[0] : text.toUpperCase());
                          }}
                          fieldName="blood_group"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Allergies */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                    Allergies
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 ${
                        voiceMode ? "pr-12" : ""
                      }`}
                      placeholder="Penicillin, dust, pollen"
                    />
                    {voiceMode && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <EnhancedVoiceInput
                          onTranscript={(text) => handleVoiceInput("allergies", text)}
                          fieldName="allergies"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointment Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Appointment Details
            </h3>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                Select Doctor *
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={today}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                  Appointment Time *
                </label>
                {formData.doctorId && formData.appointmentDate ? (
                  <select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                    required
                  >
                    <option value="">Select time slot</option>
                    {loadingSlots ? (
                      <option disabled>Loading slots...</option>
                    ) : (
                      availableSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))
                    )}
                  </select>
                ) : (
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                    disabled
                    placeholder="Select doctor & date first"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Consultation Type & Notes */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                Consultation Type *
              </label>
              <select
                name="consultationType"
                value={formData.consultationType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="in-person">In-Person</option>
                <option value="video">Video Consultation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                Notes
              </label>
              <div className="relative">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 resize-none ${
                    voiceMode ? "pr-12" : ""
                  }`}
                  rows={3}
                  placeholder="Any additional notes..."
                />
                {voiceMode && (
                  <div className="absolute right-2 top-2">
                    <EnhancedVoiceInput
                      onTranscript={(text) => handleVoiceInput("notes", text)}
                      fieldName="notes"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                (patientType === "new"
                  ? !formData.full_name_en || !formData.phone
                  : !selectedPatient) ||
                !formData.doctorId ||
                !formData.appointmentDate ||
                !formData.appointmentTime
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}