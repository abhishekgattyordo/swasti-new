


// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Menu, X } from "lucide-react";
// import HelpDeskSidebar from "@/components/helpdesk/HelpDeskSidebar";
// import HelpDeskStats from "@/components/helpdesk/HelpDeskStats";
// import AppointmentsTable, { Appointment } from "@/components/helpdesk/AppointmentsTable";
// import CreateAppointmentModal from "@/components/helpdesk/CreateAppointmentModal";
// import EditAppointmentModal from "@/components/helpdesk/EditAppointmentModal";
// import { doctorsApi } from "@/lib/api/doctors";
// import { patientsApi } from "@/lib/api/registration";
// import { appointmentsApi } from "@/lib/api/appointments"; // 👈 new import
// import toast from "react-hot-toast";
// import { useTenant } from "@/contexts/TenantContext";
// import { MODULE_KEYS, HELPDESK_FEATURES } from "@/lib/feature";

// type Doctor = {
//   id: string;
//   name: string;
//   specialization: string;
//   availableSlots: { date: string; times: string[] }[];
// };

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

// export default function HelpDeskPage() {
//   const router = useRouter();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [loadingAppointments, setLoadingAppointments] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split('T')[0] // today's date in YYYY-MM-DD
//   );

//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
//   const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

//   const isAppointmentsEnabled = isMicroFeatureEnabled(
//   MODULE_KEYS.HELPDESK,
//   HELPDESK_FEATURES.APPOINTMENTS
// );

//   useEffect(() => {
//     if (!tenantLoading && !isAppointmentsEnabled) {
//       router.push("/unauthorized");
//       return;
//     }
//     fetchDoctors();
//   }, [tenantLoading]);

//     useEffect(() => {
//     if (isAppointmentsEnabled) {
//       fetchAppointments(selectedDate);
//     }
//   }, [selectedDate, isAppointmentsEnabled]);


//   // Fetch doctors on mount

//   // Fetch appointments whenever selectedDate changes
 

//   const fetchDoctors = async () => {
//     try {
//       const res = await doctorsApi.getDoctors();
//       const doctorList = res.data.map((doc: any) => ({
//         id: String(doc.id),
//         name: `${doc.firstName} ${doc.lastName}`,
//         specialization: doc.specialty,
//         availableSlots: [],
//       }));
//       setDoctors(doctorList);
//     } catch (error) {
//       console.error("❌ Error fetching doctors:", error);
//       toast.error("Failed to load doctors");
//     }
//   };

//   const fetchAppointments = async (date: string) => {
//     setLoadingAppointments(true);
    
//     try {
//       const response = await appointmentsApi.getAppointmentsByDate(date);
//    const apiData = response.data || [];
  

   
//       const mappedAppointments: Appointment[] = apiData.map((item: any) => ({
//         id: item.appointment_id,
//         patientId: item.patient_id,
//         patientName: item.patient_name || "Unknown",
//         age: calculateAge(item.patient_dob) || 0,
//         gender: item.patient_gender || "Unknown",
//         appointmentDate: item.appointment_date,
//         appointmentTime: item.appointment_time,
//         doctorId: item.doctor_id,
//         doctorName: item.doctor_name || "Unknown",
        
        
//          status:
//     item.status === "BOOKED"
//       ? "pending"
//       : item.status === "CONFIRMED"
//       ? "confirmed"
//       : item.status === "COMPLETED"
//       ? "completed"
//       : item.status === "CANCELLED"
//       ? "cancelled"
//       : "pending",

//   // ✅ FIX TYPE
//   type:
//     item.consultation_type === "in-person"
//       ? "consultation"
//       : item.consultation_type === "emergency"
//       ? "emergency"
//       : item.consultation_type === "followup"
//       ? "followup"
//       : "checkup",

//   notes: item.notes || "",
       
//       }));

//       setAppointments(mappedAppointments);
//       console.log("✅ MAPPED APPOINTMENTS:", mappedAppointments);
//     } catch (error) {
//       console.error("❌ Error fetching appointments:", error);
//       toast.error("Failed to load appointments");
//     } finally {
//       setLoadingAppointments(false);
//     }
//   };

//   const searchPatientByPhone = async (phone: string): Promise<Patient[]> => {
//     if (!phone || phone.trim().length < 10) return [];
//     try {
//       const response = await patientsApi.getPatientsByPhone(phone);
//       const patientsData = response.data;
//       return patientsData.map((p: any) => ({
//         id: p.patient_id,
//         name: p.full_name_en,
//         age: calculateAge(p.dob),
//         gender: p.gender,
//         phone: p.phone,
//         email: p.email,
//         blood_group: p.blood_group,
//         allergies: p.medical_history?.[0]?.allergy || '',
//       }));
//     } catch (error) {
//       console.error('Error searching patient:', error);
//       return [];
//     }
//   };

//   const calculateAge = (dob: string) => {
//     if (!dob) return 0;
//     const birthDate = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const m = today.getMonth() - birthDate.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
//     return age;
//   };

//   const handleConfirm = (id: string) => {
//     setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: "confirmed" } : apt));
//     // TODO: Call API to update status
//   };

//   const handleComplete = (id: string) => {
//     setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: "completed" } : apt));
//     // TODO: Call API to update status
//   };

//   const handleEdit = (id: string) => {
//     const apt = appointments.find(a => a.id === id);
//     if (apt) {
//       setSelectedAppointment(apt);
//       setShowEditModal(true);
//     }
//   };

//   const handleCancel = (id: string) => {
//     setAppointments(prev => prev.filter(apt => apt.id !== id));
//     // TODO: Call API to delete appointment
//   };

//   const handleSaveEdit = (updated: Appointment) => {
//     setAppointments(prev => prev.map(apt => apt.id === updated.id ? updated : apt));
//     setShowEditModal(false);
//     setSelectedAppointment(null);
//     // TODO: Call API to update appointment
//   };

//   const handleCreate = (newAppt: Appointment) => {
//     // After creation, refresh appointments for the selected date
//     fetchAppointments(selectedDate);
//     setShowCreateModal(false);
//   };

//   const getStatusColor = (status: Appointment["status"]) => {
//     switch (status) {
//       case "pending": return "bg-amber-50 text-amber-600";
//       case "confirmed": return "bg-blue-50 text-blue-600";
//       case "completed": return "bg-emerald-50 text-emerald-600";
//       case "cancelled": return "bg-rose-50 text-rose-600";
//       default: return "bg-gray-50 text-gray-600";
//     }
//   };

//   const getTypeColor = (type: Appointment["type"]) => {
//     switch (type) {
//       case "emergency": return "bg-rose-50 text-rose-600";
//       case "consultation": return "bg-indigo-50 text-indigo-600";
//       case "checkup": return "bg-emerald-50 text-emerald-600";
//       case "followup": return "bg-purple-50 text-purple-600";
//       default: return "bg-gray-50 text-gray-600";
//     }
//   };

//   const handleBillingClick = () => router.push('/helpdesk/billing');
//   const handleRoomAvailabilityClick = () => console.log('Room Availability clicked');
//   const handleDoctorSlotsClick = () => router.push('/helpdesk/doctor-slots');

//   if (!tenantLoading && !isAppointmentsEnabled) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="text-red-500 text-6xl mb-4">🔒</div>
//           <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
//           <p className="text-gray-600">
//             Appointments feature is not enabled for {tenant?.name}.
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
//           <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
//             <span className="material-icons">menu</span>
//           </button>
//           <h1 className="text-xl font-bold text-gray-800 truncate">Help Desk</h1>
//         </header>

//         <button
//           className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
//           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           aria-label="Toggle menu"
//         >
//           {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//         </button>

//         <main className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 lg:p-8">
//   <div className="space-y-6 flex-1 flex flex-col min-h-0">
//     <HelpDeskStats />

//     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//       <div className="w-full sm:w-auto">
//         <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
//           Appointments
//         </h2>
//         <p className="text-sm text-gray-500 mt-1">Manage appointments and schedules</p>
//       </div>
//       <div className="flex items-center gap-2 w-full sm:w-auto">
//         <input
//           type="date"
//           value={selectedDate}
//           onChange={(e) => setSelectedDate(e.target.value)}
//           className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
//         />
//         <button
//           onClick={() => setShowCreateModal(true)}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 whitespace-nowrap"
//         >
        
//           New Appointment
//         </button>
//       </div>
//     </div>

//     {/* Scrollable Table Container */}
//     <div className="flex-1 min-h-0 overflow-y-auto">
//       {loadingAppointments ? (
//         <div className="text-center py-8 text-gray-500">Loading appointments...</div>
//       ) : (
//         <AppointmentsTable
//           appointments={appointments}
//           doctors={doctors}
//           onConfirm={handleConfirm}
//           onComplete={handleComplete}
//           onEdit={handleEdit}
//           onCancel={handleCancel}
//           getStatusColor={getStatusColor}
//           getTypeColor={getTypeColor}
//         />
//       )}
//     </div>
//   </div>
// </main>
//       </div>

//       {showCreateModal && (
//         <CreateAppointmentModal
//           doctors={doctors}
//           onSearchPatientByPhone={searchPatientByPhone}
//           onClose={() => setShowCreateModal(false)}
//           onCreate={handleCreate}
//         />
//       )}
//       {showEditModal && selectedAppointment && (
//         <EditAppointmentModal
//           appointment={selectedAppointment}
//           doctors={doctors}
//           onClose={() => setShowEditModal(false)}
//           onSave={handleSaveEdit}
//           onCancelAppointment={handleCancel}
//           getStatusColor={getStatusColor}
//           getTypeColor={getTypeColor}
//         />
//       )}
//     </div>
//   );
// }




"use client";

import { useState, useEffect , useCallback } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Filter } from "lucide-react";
import HelpDeskSidebar from "@/components/helpdesk/HelpDeskSidebar";
import HelpDeskStats from "@/components/helpdesk/HelpDeskStats";
import AppointmentsTable, { Appointment } from "@/components/helpdesk/AppointmentsTable";
import CreateAppointmentModal from "@/components/helpdesk/CreateAppointmentModal";
import EditAppointmentModal from "@/components/helpdesk/EditAppointmentModal";
import { doctorsApi } from "@/lib/api/doctors";
import { patientsApi } from "@/lib/api/registration";
import { appointmentsApi } from "@/lib/api/appointments";
import toast from "react-hot-toast";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, HELPDESK_FEATURES } from "@/lib/feature";

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  availableSlots: { date: string; times: string[] }[];
};

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

// ✅ Filter type
type FilterStatus = "all" | "pending" | "completed";

export default function HelpDeskPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // ✅ New state for filters
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);

  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

  const isAppointmentsEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.HELPDESK,
    HELPDESK_FEATURES.APPOINTMENTS
  );

  useEffect(() => {
    if (!tenantLoading && !isAppointmentsEnabled) {
      router.push("/unauthorized");
      return;
    }
    fetchDoctors();
  }, [tenantLoading,isAppointmentsEnabled,router]);

 

  const fetchDoctors = async () => {
    try {
      const res = await doctorsApi.getDoctors();
      const doctorList = res.data.map((doc: any) => ({
        id: String(doc.id),
        name: `${doc.firstName} ${doc.lastName}`,
        specialization: doc.specialty,
        availableSlots: [],
      }));
      setDoctors(doctorList);
    } catch (error) {
      console.error("❌ Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    }
  };

const fetchAppointments = useCallback(async (date: string) => {
    setLoadingAppointments(true);
    
    try {
      const response = await appointmentsApi.getAppointmentsByDate(date);
      const apiData = response.data || [];

      const mappedAppointments: Appointment[] = apiData.map((item: any) => ({
        id: item.appointment_id,
        patientId: item.patient_id,
        patientName: item.patient_name || "Unknown",
        age: calculateAge(item.patient_dob) || 0,
        gender: item.patient_gender || "Unknown",
        appointmentDate: item.appointment_date,
        appointmentTime: item.appointment_time,
        doctorId: item.doctor_id,
        doctorName: item.doctor_name || "Unknown",
        status: item.status === "BOOKED"
          ? "pending"
          : item.status === "CONFIRMED"
          ? "confirmed"
          : item.status === "COMPLETED"
          ? "completed"
          : item.status === "CANCELLED"
          ? "cancelled"
          : "pending",
        type: item.consultation_type === "in-person"
          ? "consultation"
          : item.consultation_type === "emergency"
          ? "emergency"
          : item.consultation_type === "followup"
          ? "followup"
          : "checkup",
        notes: item.notes || "",
      }));

      setAppointments(mappedAppointments);
      console.log("✅ MAPPED APPOINTMENTS:", mappedAppointments);
    } catch (error) {
      console.error("❌ Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoadingAppointments(false);
    }
 }, []);


  useEffect(() => {
  if (isAppointmentsEnabled) {
    fetchAppointments(selectedDate);
  }
}, [selectedDate, isAppointmentsEnabled, fetchAppointments]);

  const searchPatientByPhone = async (phone: string): Promise<Patient[]> => {
    if (!phone || phone.trim().length < 10) return [];
    try {
      const response = await patientsApi.getPatientsByPhone(phone);
      const patientsData = response.data;
      return patientsData.map((p: any) => ({
        id: p.patient_id,
        name: p.full_name_en,
        age: calculateAge(p.dob),
        gender: p.gender,
        phone: p.phone,
        email: p.email,
        blood_group: p.blood_group,
        allergies: p.medical_history?.[0]?.allergy || '',
      }));
    } catch (error) {
      console.error('Error searching patient:', error);
      return [];
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // ✅ Filtered appointments based on selected filter
  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") {
      return apt.status === "pending" || apt.status === "confirmed";
    }
    if (filterStatus === "completed") {
      return apt.status === "completed";
    }
    return true;
  });

  // ✅ Count pending and completed appointments
  const pendingCount = appointments.filter(
    (apt) => apt.status === "pending" || apt.status === "confirmed"
  ).length;
  const completedCount = appointments.filter(
    (apt) => apt.status === "completed"
  ).length;

  const handleConfirm = (id: string) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: "confirmed" } : apt));
  };

  const handleComplete = (id: string) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: "completed" } : apt));
  };

  const handleEdit = (id: string) => {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      setSelectedAppointment(apt);
      setShowEditModal(true);
    }
  };

  const handleCancel = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  const handleSaveEdit = (updated: Appointment) => {
    setAppointments(prev => prev.map(apt => apt.id === updated.id ? updated : apt));
    setShowEditModal(false);
    setSelectedAppointment(null);
  };

  const handleCreate = (newAppt: Appointment) => {
    fetchAppointments(selectedDate);
    setShowCreateModal(false);
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-600";
      case "confirmed": return "bg-blue-50 text-blue-600";
      case "completed": return "bg-emerald-50 text-emerald-600";
      case "cancelled": return "bg-rose-50 text-rose-600";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const getTypeColor = (type: Appointment["type"]) => {
    switch (type) {
      case "emergency": return "bg-rose-50 text-rose-600";
      case "consultation": return "bg-indigo-50 text-indigo-600";
      case "checkup": return "bg-emerald-50 text-emerald-600";
      case "followup": return "bg-purple-50 text-purple-600";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const handleBillingClick = () => router.push('/helpdesk/billing');
  const handleRoomAvailabilityClick = () => console.log('Room Availability clicked');
  const handleDoctorSlotsClick = () => router.push('/helpdesk/doctor-slots');

  if (!tenantLoading && !isAppointmentsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            Appointments feature is not enabled for {tenant?.name}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <HelpDeskSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onBillingClick={handleBillingClick}
        onRoomAvailabilityClick={handleRoomAvailabilityClick}
        onDoctorSlotsClick={handleDoctorSlotsClick}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <span className="material-icons">menu</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800 truncate">Help Desk</h1>
        </header>

        <button
          className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <main className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <HelpDeskStats />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
                  Appointments
                </h2>
                <p className="text-sm text-gray-500 mt-1">Manage appointments and schedules</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Date Picker */}
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                
                {/* ✅ Filter Button with Counts */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                    {(pendingCount > 0 || completedCount > 0) && (
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                        {filterStatus !== "all" ? filterStatus : "all"}
                      </span>
                    )}
                  </button>
                  
                  {/* ✅ Filter Dropdown */}
                  {showFilters && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setFilterStatus("all");
                            setShowFilters(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                            filterStatus === "all"
                              ? "bg-blue-50 text-blue-600"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          All Appointments ({appointments.length})
                        </button>
                        <button
                          onClick={() => {
                            setFilterStatus("pending");
                            setShowFilters(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                            filterStatus === "pending"
                              ? "bg-amber-50 text-amber-600"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          ⏳ Pending ({pendingCount})
                        </button>
                        <button
                          onClick={() => {
                            setFilterStatus("completed");
                            setShowFilters(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                            filterStatus === "completed"
                              ? "bg-emerald-50 text-emerald-600"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          ✅ Completed ({completedCount})
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  New Appointment
                </button>
              </div>
            </div>

            {/* ✅ Filter Status Indicator */}
            {filterStatus !== "all" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Showing:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  filterStatus === "pending" 
                    ? "bg-amber-100 text-amber-700" 
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {filterStatus === "pending" ? "Pending Appointments" : "Completed Appointments"}
                </span>
                <button
                  onClick={() => setFilterStatus("all")}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Scrollable Table Container */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {loadingAppointments ? (
                <div className="text-center py-8 text-gray-500">Loading appointments...</div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {filterStatus === "all" 
                    ? "No appointments found for this date"
                    : filterStatus === "pending"
                    ? "No pending appointments for this date"
                    : "No completed appointments for this date"}
                </div>
              ) : (
                <AppointmentsTable
                  appointments={filteredAppointments}
                  doctors={doctors}
                  onConfirm={handleConfirm}
                  onComplete={handleComplete}
                  onEdit={handleEdit}
                  onCancel={handleCancel}
                  getStatusColor={getStatusColor}
                  getTypeColor={getTypeColor}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {showCreateModal && (
        <CreateAppointmentModal
          doctors={doctors}
          onSearchPatientByPhone={searchPatientByPhone}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
      {showEditModal && selectedAppointment && (
        <EditAppointmentModal
          appointment={selectedAppointment}
          doctors={doctors}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          onCancelAppointment={handleCancel}
          getStatusColor={getStatusColor}
          getTypeColor={getTypeColor}
        />
      )}
    </div>
  );
}