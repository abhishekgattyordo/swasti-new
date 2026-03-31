// // app/doctor/layout.tsx
// "use client";

// import React, { useState, createContext, useContext, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import DoctorSidebar from "@/components/doctor/DoctorSidebar";
// import {
//   Menu,
//   X,
//   Calendar,
//   LayoutDashboard,
//   Users,
//   CreditCard,
//   User,
// } from "lucide-react";
// import { appointmentsApi } from "@/lib/api/appointments";

// // Types
// export interface Appointment {
//   id: string;
//   time: string;
//   name: string;
//   age: number;
//   gender: string;
//   reason: string;
//   meta: string;
//   type: string;
//   status: string;
//   statusColor: string;
//   action: string;
//   icon: React.ReactNode;
//   highlight?: boolean;
//   notes?: string;
//  patientId?: string;
// }

// export interface Patient {
//   id: string;
//   name: string;
//   age: number;
//   gender: string;
//   lastVisit: string;
//   condition: string;
//   status: string;
//   phone: string;
//   email: string;
// }

// export interface Invoice {
//   id: string;
//   patientName: string;
//   date: string;
//   amount: number;
//   status: string;
//   method?: string;
// }

// interface DoctorContextType {
//   appointments: Appointment[];
//   setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
//   patients: Patient[];
//   setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
//   invoices: Invoice[];
//   setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
//   loading: boolean;
//   error: string | null;
// }

// const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

// export const useDoctor = () => {
//   const context = useContext(DoctorContext);
//   if (!context) throw new Error("useDoctor must be used within DoctorProvider");
//   return context;
// };

// export default function DoctorLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

// const [doctorId, setDoctorId] = useState<number | null>(null);


// useEffect(() => {
//     const fetchDoctorId = async () => {
//       const user = JSON.parse(localStorage.getItem('user') || '{}');
//       let id = user.doctor_id;
//       if (!id) {
//         // fallback to /api/me
//         try {
//           const token = localStorage.getItem('accessToken');
//           if (token) {
//             const res = await fetch('/api/me', {
//               headers: { Authorization: `Bearer ${token}` },
//             });
//             const data = await res.json();
//             if (data.success && data.user?.doctor_id) {
//               id = data.user.doctor_id;
//               // store in localStorage for next time
//               const updatedUser = { ...user, doctor_id: id };
//               localStorage.setItem('user', JSON.stringify(updatedUser));
//             }
//           }
//         } catch (err) {
//           console.error('Failed to fetch doctor ID:', err);
//         }
//       }
//       setDoctorId(id || null);
//       setLoading(false);
//     };
//     fetchDoctorId();
//   }, []);


// useEffect(() => {
//   const userStr = localStorage.getItem("user");
//   if (userStr) {
//     const user = JSON.parse(userStr);
//     setDoctorId(user.id);
//   } else {
//     setError("Not authenticated");
//   }
// }, []);

//   useEffect(() => {

//     if (!doctorId) return;
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const todayStr = new Date().toISOString().split("T")[0];
//         const appointmentsRes =
//           await appointmentsApi.getDoctorAppointmentsByDate(doctorId, todayStr);

//         // Extract data from the nested structure
//         const apiData = appointmentsRes.data?.data || appointmentsRes.data;

//         if (Array.isArray(apiData) && apiData.length > 0) {
//           // Transform appointments
//           const fetchedAppointments = apiData.map((item: any) => {
//             // Calculate age safely
//             let age = 0;
//             if (item.patient_dob) {
//               try {
//                 const birthDate = new Date(item.patient_dob);
//                 age = new Date().getFullYear() - birthDate.getFullYear();
//               } catch (e) {
//                 console.warn("Invalid DOB:", item.patient_dob);
//               }
//             }

//             // Format gender with fallback
//             let genderDisplay = "—";
//             if (item.patient_gender === "male") genderDisplay = "M";
//             else if (item.patient_gender === "female") genderDisplay = "F";

//             // Build meta string (gender initial + consultation type)
//             const genderInitial =
//               item.patient_gender?.charAt(0).toUpperCase() || "?";
//             const meta = `${genderInitial} • ${item.consultation_type || "Consultation"}`;

//             return {
//               id: item.appointment_id, // ✅ unique key
//               time: item.appointment_time || "--:--",
//               name: item.patient_name || "Unknown Patient", // ✅ fallback name
//               age,
//               gender: genderDisplay,
//               reason: item.consultation_type || "Consultation",
//               meta,
//               type: item.consultation_type || "In-Person",
//               status: item.status || "BOOKED",
//               statusColor: getStatusColor(item.status),
//               action: "View",
//               icon: <User className="w-3 h-3" />,
//               notes: item.notes || "",
//               patientId: item.patient_id,
//             };
//           });

//           setAppointments(fetchedAppointments);

//           // Derive unique patients
//           const uniquePatients = new Map();
//           apiData.forEach((item: any) => {
//             if (!item.patient_id) return;
//             if (!uniquePatients.has(item.patient_id)) {
//               uniquePatients.set(item.patient_id, {
//                 id: item.patient_id,
//                 name: item.patient_name || "",
//                 age: calculateAge(item.patient_dob),
//                 gender: item.patient_gender || "Unknown",
//                 lastVisit: item.appointment_date
//                   ? new Date(item.appointment_date).toLocaleDateString()
//                   : "N/A",
//                 condition: "N/A", // Not available from appointments
//                 status: "Active",
//                 phone: item.patient_phone || "",
//                 email: item.patient_email || "",
//               });
//             }
//           });
//           const patientsArray = Array.from(uniquePatients.values());

//           setPatients(patientsArray);
//         } else {
//           console.log("No appointments found for this doctor");
//           setAppointments([]);
//           setPatients([]);
//         }

//         // Fetch all patients added by this doctor
//       let allPatients: Patient[] = [];
//       try {
//         const patientsRes = await fetch(`/api/admin/patients?added_by_doctor_id=${doctorId}`);
//         const patientsData = await patientsRes.json();
//         if (patientsData.success) {
//           allPatients = patientsData.data.map((p: any) => ({
//             id: p.patient_id,
//             name: p.full_name_en || '',
//             age: calculateAge(p.dob),
//             gender: p.gender === 'male' ? 'M' : p.gender === 'female' ? 'F' : 'Other',
//             lastVisit: 'N/A',
//             condition: 'N/A',
//             status: 'Active',
//             phone: p.phone || '',
//             email: p.email || '',
//           }));
//         }
//       } catch (err) {
//         console.error('Error fetching all patients:', err);
//       }

//       // Use the full list if available, otherwise fallback to today's patients
//       setPatients(allPatients.length > 0 ? allPatients : []);

//         // TODO: Fetch invoices if endpoint exists
//         setInvoices([]);
//       } catch (err) {
//         console.error("Error in fetchData:", err);
//         setError("Failed to load data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [doctorId]);

//   // Helper functions
//   const calculateAge = (dob: string) => {
//     if (!dob) return 0;
//     try {
//       const birthDate = new Date(dob);
//       return new Date().getFullYear() - birthDate.getFullYear();
//     } catch {
//       return 0;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "BOOKED":
//         return "text-blue-600 bg-blue-100";
//       case "COMPLETED":
//         return "text-green-600 bg-green-50";
//       case "CANCELLED":
//         return "text-red-600 bg-red-50";
//       default:
//         return "text-gray-600 bg-gray-100";
//     }
//   };

//   // Navigation items
//   const navItems = [
//     {
//       id: "schedule",
//       label: "Schedule",
//       icon: <Calendar className="w-5 h-5" />,
//       badge: appointments.length.toString(),
//     },
//     {
//       id: "dashboard",
//       label: "Dashboard",
//       icon: <LayoutDashboard className="w-5 h-5" />,
//     },
//     {
//       id: "patients",
//       label: "Patients",
//       icon: <Users className="w-5 h-5" />,
//       badge: patients.length.toString(),
//     },
//     {
//       id: "billing",
//       label: "Billing",
//       icon: <CreditCard className="w-5 h-5" />,
//       badge: invoices.filter((i) => i.status === "Pending").length.toString(),
//     },
//   ];

//   const activeSection = pathname.split("/")[2] || "schedule";

//   return (
//     <DoctorContext.Provider
//       value={{
//         appointments,
//         setAppointments,
//         patients,
//         setPatients,
//         invoices,
//         setInvoices,
//         loading,
//         error,
//       }}
//     >
//       <div className="min-h-screen bg-[#f6f7f8] flex font-sans">
//         <style jsx global>{`
//           body {
//             font-family:
//               "Inter",
//               system-ui,
//               -apple-system,
//               BlinkMacSystemFont,
//               "Segoe UI",
//               Roboto,
//               "Helvetica Neue",
//               sans-serif;
//           }
//         `}</style>

//         {/* Mobile Menu Button */}
//         <button
//           className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
//           onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
//           aria-label="Toggle menu"
//         >
//           {mobileSidebarOpen ? (
//             <X className="w-5 h-5" />
//           ) : (
//             <Menu className="w-5 h-5" />
//           )}
//         </button>

//         {/* Sidebar */}
//         <DoctorSidebar
//           isOpen={mobileSidebarOpen}
//           onClose={() => setMobileSidebarOpen(false)}
//         />

//         {/* Backdrop overlay for mobile */}
//         {mobileSidebarOpen && (
//           <div
//             className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
//             onClick={() => setMobileSidebarOpen(false)}
//           />
//         )}

//         <div className="flex-1 flex flex-col overflow-hidden">
//           <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
//             {loading ? (
//               <div className="flex items-center justify-center h-full">
//                 <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
//               </div>
//             ) : error ? (
//               <div className="flex items-center justify-center h-full text-red-600">
//                 {error}
//               </div>
//             ) : (
//               children
//             )}
//           </main>
//         </div>
//       </div>

//       <link
//         href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
//         rel="stylesheet"
//       />
//     </DoctorContext.Provider>
//   );
// }


// app/doctor/layout.tsx
"use client";

import React, { useState, createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import DoctorSidebar from "@/components/doctor/DoctorSidebar";
import {
  Menu,
  X,
  Calendar,
  LayoutDashboard,
  Users,
  CreditCard,
  User,
} from "lucide-react";
import { appointmentsApi } from "@/lib/api/appointments";

// Types
export interface Appointment {
  id: string;
  time: string;
  name: string;
  age: number;
  gender: string;
  reason: string;
  meta: string;
  type: string;
  status: string;
  statusColor: string;
  action: string;
  icon: React.ReactNode;
  highlight?: boolean;
  notes?: string;
  patientId?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  condition: string;
  status: string;
  phone: string;
  email: string;
}

export interface Invoice {
  id: string;
  patientName: string;
  date: string;
  amount: number;
  status: string;
  method?: string;
}

interface DoctorContextType {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  loading: boolean;
  error: string | null;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) throw new Error("useDoctor must be used within DoctorProvider");
  return context;
};

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);

  // 1. Fetch doctor ID once from localStorage or /api/me
  useEffect(() => {
    const fetchDoctorId = async () => {
      // First try localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      let id = user.doctor_id; // use doctor_id field, not user.id

      if (id) {
        setDoctorId(id);
        // Do NOT set loading false here – we still need to fetch data
        return;
      }

      // Fallback to API
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const res = await fetch("/api/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success && data.user?.doctor_id) {
            id = data.user.doctor_id;
            // Save to localStorage for future
            const updatedUser = { ...user, doctor_id: id };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setDoctorId(id);
            return;
          }
        }
        // If no doctor_id found, set error
        setError("Doctor not found. Please contact support.");
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch doctor ID:", err);
        setError("Failed to load doctor data");
        setLoading(false);
      }
    };

    fetchDoctorId();
  }, []);

  // 2. Fetch data (appointments, patients) when doctorId is available
  useEffect(() => {
    if (!doctorId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const appointmentsRes = await appointmentsApi.getDoctorAppointmentsByDate(
          doctorId,
          todayStr
        );

        // Extract data from the nested structure
        const apiData = appointmentsRes.data?.data || appointmentsRes.data;

        if (Array.isArray(apiData) && apiData.length > 0) {
          // Transform appointments
          const fetchedAppointments = apiData.map((item: any) => {
            // Calculate age safely
            let age = 0;
            if (item.patient_dob) {
              try {
                const birthDate = new Date(item.patient_dob);
                age = new Date().getFullYear() - birthDate.getFullYear();
              } catch (e) {
                console.warn("Invalid DOB:", item.patient_dob);
              }
            }

            // Format gender with fallback
            let genderDisplay = "—";
            if (item.patient_gender === "male") genderDisplay = "M";
            else if (item.patient_gender === "female") genderDisplay = "F";

            // Build meta string (gender initial + consultation type)
            const genderInitial = item.patient_gender?.charAt(0).toUpperCase() || "?";
            const meta = `${genderInitial} • ${item.consultation_type || "Consultation"}`;

            return {
              id: item.appointment_id,
              time: item.appointment_time || "--:--",
              name: item.patient_name || "Unknown Patient",
              age,
              gender: genderDisplay,
              reason: item.consultation_type || "Consultation",
              meta,
              type: item.consultation_type || "In-Person",
              status: item.status || "BOOKED",
              statusColor: getStatusColor(item.status),
              action: "View",
              icon: <User className="w-3 h-3" />,
              notes: item.notes || "",
              patientId: item.patient_id,
            };
          });

          setAppointments(fetchedAppointments);

          // Derive unique patients from today's appointments
          const uniquePatients = new Map();
          apiData.forEach((item: any) => {
            if (!item.patient_id) return;
            if (!uniquePatients.has(item.patient_id)) {
              uniquePatients.set(item.patient_id, {
                id: item.patient_id,
                name: item.patient_name || "",
                age: calculateAge(item.patient_dob),
                gender: item.patient_gender || "Unknown",
                lastVisit: item.appointment_date
                  ? new Date(item.appointment_date).toLocaleDateString()
                  : "N/A",
                condition: "N/A",
                status: "Active",
                phone: item.patient_phone || "",
                email: item.patient_email || "",
              });
            }
          });
          const patientsFromAppointments = Array.from(uniquePatients.values());

          // Fetch all patients added by this doctor
          let allPatients: Patient[] = [];
          try {
            const patientsRes = await fetch(`/api/admin/patients?added_by_doctor_id=${doctorId}`);
            const patientsData = await patientsRes.json();
            if (patientsData.success) {
              allPatients = patientsData.data.map((p: any) => ({
                id: p.patient_id,
                name: p.full_name_en || '',
                age: calculateAge(p.dob),
                gender: p.gender === 'male' ? 'M' : p.gender === 'female' ? 'F' : 'Other',
                lastVisit: 'N/A',
                condition: 'N/A',
                status: 'Active',
                phone: p.phone || '',
                email: p.email || '',
              }));
            }
          } catch (err) {
            console.error('Error fetching all patients:', err);
          }

          // Combine unique patients from both sources (prefer from appointments if available)
          const combinedPatients = [...patientsFromAppointments];
          for (const p of allPatients) {
            if (!combinedPatients.some(existing => existing.id === p.id)) {
              combinedPatients.push(p);
            }
          }
          setPatients(combinedPatients);
        } else {
          console.log("No appointments found for this doctor");
          setAppointments([]);
          // Still fetch all patients even if no appointments today
          let allPatients: Patient[] = [];
          try {
            const patientsRes = await fetch(`/api/admin/patients?added_by_doctor_id=${doctorId}`);
            const patientsData = await patientsRes.json();
            if (patientsData.success) {
              allPatients = patientsData.data.map((p: any) => ({
                id: p.patient_id,
                name: p.full_name_en || '',
                age: calculateAge(p.dob),
                gender: p.gender === 'male' ? 'M' : p.gender === 'female' ? 'F' : 'Other',
                lastVisit: 'N/A',
                condition: 'N/A',
                status: 'Active',
                phone: p.phone || '',
                email: p.email || '',
              }));
            }
          } catch (err) {
            console.error('Error fetching all patients:', err);
          }
          setPatients(allPatients);
        }

        // TODO: Fetch invoices if endpoint exists
        setInvoices([]);
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  // Helper functions
  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    try {
      const birthDate = new Date(dob);
      return new Date().getFullYear() - birthDate.getFullYear();
    } catch {
      return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BOOKED":
        return "text-blue-600 bg-blue-100";
      case "COMPLETED":
        return "text-green-600 bg-green-50";
      case "CANCELLED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const activeSection = pathname.split("/")[2] || "schedule";

  return (
    <DoctorContext.Provider
      value={{
        appointments,
        setAppointments,
        patients,
        setPatients,
        invoices,
        setInvoices,
        loading,
        error,
      }}
    >
      <div className="min-h-screen bg-[#f6f7f8] flex font-sans">
        <style jsx global>{`
          body {
            font-family:
              "Inter",
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Roboto,
              "Helvetica Neue",
              sans-serif;
          }
        `}</style>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Toggle menu"
        >
          {mobileSidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Sidebar */}
        <DoctorSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Backdrop overlay for mobile */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-600">
                {error}
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>

      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </DoctorContext.Provider>
  );
}