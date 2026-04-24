


// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useSearchParams } from "next/navigation";
// import { currentVisitApi } from "@/lib/api/ehr";
// import toast from "react-hot-toast";
// import AddVitalsModal, { NewVitalsForm } from "@/components/doctor/AddVitalsModal";

// // ==================== Type Definitions ====================

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

// // ==================== VitalsPage ====================

// export default function VitalsPage() {
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const patientId = params.patientId as string;
//   const dateParam = searchParams.get("date");

//   const [vitals, setVitals] = useState<Vital[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showAddVitalsModal, setShowAddVitalsModal] = useState(false);
//   const [newVitals, setNewVitals] = useState<NewVitalsForm>({
//     bp: "",
//     hr: "",
//     temp: "",
//     weight: "",
//     rr: "",
//     spo2: "",
//   });
//   const [editingVital, setEditingVital] = useState<Vital | null>(null);

//   const todayStr = new Date().toISOString().split("T")[0];
//   const targetDate = dateParam || todayStr;

//   // Helper to check if a vital was recorded today (local date)
//   const isTodayVital = (vital: Vital): boolean => {
//     const vitalDate = new Date(vital.recordedAt);
//     const today = new Date();
//     return (
//       vitalDate.getFullYear() === today.getFullYear() &&
//       vitalDate.getMonth() === today.getMonth() &&
//       vitalDate.getDate() === today.getDate()
//     );
//   };

//   // Fetch vitals based on targetDate
//   useEffect(() => {
//     const fetchVitals = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const response = await currentVisitApi.getVitalsByDate(patientId, targetDate);
//         console.log("Vitals response:", response);

//         if (Array.isArray(response)) {
//           setVitals(response);
//         } else if (response?.data && Array.isArray(response.data)) {
//           setVitals(response.data);
//         } else {
//           setVitals([]);
//           console.warn("Unexpected API response shape:", response);
//         }
//       } catch (err) {
//         console.error("Error fetching vitals:", err);
//         setError("Failed to load vitals");
//         setVitals([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVitals();
//   }, [patientId, targetDate]);

//   const handleSaveVitals = async (vitalsData: NewVitalsForm) => {
//     try {
//       let response;

//       // Get the logged‑in user (doctor) from localStorage
//       const user = JSON.parse(localStorage.getItem("user") || "null");
//       const doctorName = user?.full_name_en || "Doctor";

//       if (editingVital) {
//         const updatePayload = {
//           bp: vitalsData.bp,
//           hr: Number(vitalsData.hr),
//           temp: Number(vitalsData.temp),
//           weight: Number(vitalsData.weight),
//           rr: Number(vitalsData.rr),
//           spo2: Number(vitalsData.spo2),
//           recordedBy: doctorName,
//         };
//         response = await currentVisitApi.updateVital(
//           patientId,
//           editingVital.id.toString(),
//           updatePayload
//         );
//       } else {
//         const payload = {
//           date: targetDate,
//           ...vitalsData,
//           recordedBy: doctorName,
//           _debug: Date.now(),
//         };
//         response = await currentVisitApi.saveVitals(patientId, payload);
//       }

//       const result = response.data;

//       if (result && (result.success || result.appointmentId)) {
//         // Refresh vitals
//         const fetchResponse = await currentVisitApi.getVitalsByDate(patientId, targetDate);
//         if (Array.isArray(fetchResponse)) {
//           setVitals(fetchResponse);
//         } else if (fetchResponse?.data && Array.isArray(fetchResponse.data)) {
//           setVitals(fetchResponse.data);
//         } else {
//           setVitals([]);
//         }
//       } else {
//         console.error(
//           `Failed to ${editingVital ? "update" : "save"} vitals`,
//           result?.message
//         );
//       }

//       setShowAddVitalsModal(false);
//       setEditingVital(null);
//       setNewVitals({ bp: "", hr: "", temp: "", weight: "", rr: "", spo2: "" });
//     } catch (error) {
//       console.error(`Error ${editingVital ? "updating" : "saving"} vitals:`, error);
//     }
//   };

//   const handleDeleteVital = async (vitalId: number) => {
//     if (!confirm("Are you sure you want to delete this vital record?")) return;

//     try {
//       await currentVisitApi.deleteVital(patientId, vitalId.toString());
//       toast.success("Vital record deleted successfully");

//       // Refresh the list after deletion
//       const fetchResponse = await currentVisitApi.getVitalsByDate(patientId, targetDate);
//       if (Array.isArray(fetchResponse)) {
//         setVitals(fetchResponse);
//       } else if (fetchResponse?.data && Array.isArray(fetchResponse.data)) {
//         setVitals(fetchResponse.data);
//       } else {
//         setVitals([]);
//       }
//     } catch (error) {
//       console.error("Error deleting vital:", error);
//       toast.error("Failed to delete vital record");
//     }
//   };

//   const getVitalStatus = (
//     value: number,
//     type: string,
//   ): "normal" | "abnormal" => {
//     if (type === "hr") {
//       return value >= 60 && value <= 100 ? "normal" : "abnormal";
//     }
//     if (type === "temp") {
//       return value >= 36.1 && value <= 37.2 ? "normal" : "abnormal";
//     }
//     if (type === "spo2") {
//       return value >= 95 ? "normal" : "abnormal";
//     }
//     return "normal";
//   };

//   if (loading) {
//     return (
//       <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100 flex justify-center items-center h-64">
//         <div className="w-8 h-8 border-4 border-[#137fec] border-t-transparent animate-spin rounded-full"></div>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
//         <p className="text-red-600 text-center">{error}</p>
//       </section>
//     );
//   }

//   return (
//     <>
//       <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
//               <span className="material-symbols-outlined text-[#137fec]">
//                 monitor_heart
//               </span>
//             </div>
//             <div>
//               <h3 className="text-base font-bold text-slate-900">
//                 Patient Vitals
//               </h3>
//               <p className="text-xs text-slate-500">
//                 Historical vital signs and measurements
//               </p>
//               {dateParam && (
//                 <p className="text-xs text-slate-400 mt-1">
//                   Showing vitals for {new Date(dateParam).toLocaleDateString()}
//                 </p>
//               )}
//             </div>
//           </div>
//           <button
//             onClick={() => {
//               setEditingVital(null);
//               setNewVitals({
//                 bp: "",
//                 hr: "",
//                 temp: "",
//                 weight: "",
//                 rr: "",
//                 spo2: "",
//               });
//               setShowAddVitalsModal(true);
//             }}
//             className="text-[#137fec] bg-transparent hover:bg-blue-50 text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition-all border border-[#137fec]"
//           >
//             <span className="material-symbols-outlined text-[18px]">add</span>
//             Add Vitals
//           </button>
//         </div>

//         {vitals.length === 0 ? (
//           <p className="text-center text-slate-500 py-8">
//             No vitals recorded for this visit.
//           </p>
//         ) : (
//           <div className="space-y-4">
//             {vitals.map((vital) => {
//               const isToday = isTodayVital(vital);
//               return (
//                 <div
//                   key={vital.id}
//                   className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition"
//                 >
//                   <div className="flex items-start justify-between gap-4 mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
//                         <span className="material-symbols-outlined text-[#137fec]">
//                           calendar_month
//                         </span>
//                       </div>
//                       <div>
//                         <p className="font-semibold text-slate-900">
//                           {new Date(vital.recordedAt).toLocaleDateString()} at{" "}
//                           {new Date(vital.recordedAt).toLocaleTimeString()}
//                         </p>
//                         <p className="text-xs text-slate-500">
//                           Recorded by {vital.recordedBy}
//                         </p>
//                       </div>
//                     </div>
//                     {isToday && (
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => {
//                             setEditingVital(vital);
//                             setNewVitals({
//                               bp: vital.bp || "",
//                               hr: vital.hr?.toString() || "",
//                               temp: vital.temp?.toString() || "",
//                               weight: vital.weight?.toString() || "",
//                               rr: vital.rr?.toString() || "",
//                               spo2: vital.spo2?.toString() || "",
//                             });
//                             setShowAddVitalsModal(true);
//                           }}
//                           className="p-2 hover:bg-slate-100 rounded-lg transition"
//                           title="Edit"
//                         >
//                           <span className="material-symbols-outlined text-slate-500">
//                             edit
//                           </span>
//                         </button>
//                         <button
//                           onClick={() => handleDeleteVital(vital.id)}
//                           className="p-2 hover:bg-red-50 rounded-lg transition"
//                           title="Delete"
//                         >
//                           <span className="material-symbols-outlined text-red-500">
//                             delete
//                           </span>
//                         </button>
//                       </div>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//                     <div className="bg-slate-50 p-3 rounded-lg">
//                       <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
//                         <span className="material-symbols-outlined text-[14px] text-red-400">
//                           monitor_heart
//                         </span>
//                         BP
//                       </p>
//                       <p className="text-lg font-bold text-slate-900">
//                         {vital.bp}
//                       </p>
//                       <p className="text-[10px] text-slate-400">mmHg</p>
//                     </div>
//                     <div className="bg-slate-50 p-3 rounded-lg">
//                       <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
//                         <span className="material-symbols-outlined text-[14px] text-red-400">
//                           ecg_heart
//                         </span>
//                         HR
//                       </p>
//                       <div className="flex items-center gap-2">
//                         <p className="text-lg font-bold text-slate-900">
//                           {vital.hr}
//                         </p>
//                         <span
//                           className={`text-[10px] px-1.5 py-0.5 rounded-full ${
//                             getVitalStatus(vital.hr, "hr") === "normal"
//                               ? "bg-green-50 text-green-600"
//                               : "bg-red-50 text-red-600"
//                           }`}
//                         >
//                           {getVitalStatus(vital.hr, "hr") === "normal"
//                             ? "Normal"
//                             : "High"}
//                         </span>
//                       </div>
//                       <p className="text-[10px] text-slate-400">bpm</p>
//                     </div>
//                     <div className="bg-slate-50 p-3 rounded-lg">
//                       <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
//                         <span className="material-symbols-outlined text-[14px] text-amber-400">
//                           thermometer
//                         </span>
//                         Temp
//                       </p>
//                       <div className="flex items-center gap-2">
//                         <p className="text-lg font-bold text-slate-900">
//                           {vital.temp}
//                         </p>
//                         <span
//                           className={`text-[10px] px-1.5 py-0.5 rounded-full ${
//                             getVitalStatus(vital.temp, "temp") === "normal"
//                               ? "bg-green-50 text-green-600"
//                               : "bg-red-50 text-red-600"
//                           }`}
//                         >
//                           {getVitalStatus(vital.temp, "temp") === "normal"
//                             ? "Normal"
//                             : "Fever"}
//                         </span>
//                       </div>
//                       <p className="text-[10px] text-slate-400">°C</p>
//                     </div>
//                     <div className="bg-slate-50 p-3 rounded-lg">
//                       <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
//                         <span className="material-symbols-outlined text-[14px] text-blue-400">
//                           scale
//                         </span>
//                         Weight
//                       </p>
//                       <p className="text-lg font-bold text-slate-900">
//                         {vital.weight}
//                       </p>
//                       <p className="text-[10px] text-slate-400">kg</p>
//                     </div>
//                     <div className="bg-slate-50 p-3 rounded-lg">
//                       <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
//                         <span className="material-symbols-outlined text-[14px] text-green-400">
//                           respiratory_rate
//                         </span>
//                         RR
//                       </p>
//                       <p className="text-lg font-bold text-slate-900">
//                         {vital.rr}
//                       </p>
//                       <p className="text-[10px] text-slate-400">breaths/min</p>
//                     </div>
//                     <div className="bg-slate-50 p-3 rounded-lg">
//                       <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
//                         <span className="material-symbols-outlined text-[14px] text-purple-400">
//                           oxygen_saturation
//                         </span>
//                         SpO2
//                       </p>
//                       <div className="flex items-center gap-2">
//                         <p className="text-lg font-bold text-slate-900">
//                           {vital.spo2}
//                         </p>
//                         <span
//                           className={`text-[10px] px-1.5 py-0.5 rounded-full ${
//                             getVitalStatus(vital.spo2, "spo2") === "normal"
//                               ? "bg-green-50 text-green-600"
//                               : "bg-red-50 text-red-600"
//                           }`}
//                         >
//                           {getVitalStatus(vital.spo2, "spo2") === "normal"
//                             ? "Normal"
//                             : "Low"}
//                         </span>
//                       </div>
//                       <p className="text-[10px] text-slate-400">%</p>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </section>

//       {showAddVitalsModal && (
//         <AddVitalsModal
//           onClose={() => {
//             setShowAddVitalsModal(false);
//             setEditingVital(null);
//             setNewVitals({
//               bp: "",
//               hr: "",
//               temp: "",
//               weight: "",
//               rr: "",
//               spo2: "",
//             });
//           }}
//           onAdd={handleSaveVitals}
//           initialVitals={newVitals}
//           isEditing={!!editingVital}
//         />
//       )}
//     </>
//   );
// }


"use client";

  import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { currentVisitApi } from "@/lib/api/ehr";
import toast from "react-hot-toast";
import AddVitalsModal, { NewVitalsForm } from "@/components/doctor/AddVitalsModal";

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

export default function VitalsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params.patientId as string;
  const dateParam = searchParams.get("date");

  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddVitalsModal, setShowAddVitalsModal] = useState(false);
  const [newVitals, setNewVitals] = useState<NewVitalsForm>({
    bp: "",
    hr: "",
    temp: "",
    weight: "",
    rr: "",
    spo2: "",
  });
  const [editingVital, setEditingVital] = useState<Vital | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const targetDate = dateParam || todayStr;

  // Helper to check if a vital was recorded today (local date)
  const isTodayVital = (vital: Vital): boolean => {
    const vitalDate = new Date(vital.recordedAt);
    const today = new Date();
    return (
      vitalDate.getFullYear() === today.getFullYear() &&
      vitalDate.getMonth() === today.getMonth() &&
      vitalDate.getDate() === today.getDate()
    );
  };

  // Fetch vitals – reusable function
  



// Then wrap fetchVitals with useCallback
const fetchVitals = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await currentVisitApi.getVitalsByDate(patientId, targetDate);
    console.log("Vitals response:", response);

    let vitalsData: Vital[] = [];
    if (Array.isArray(response)) {
      vitalsData = response;
    } else if (response?.data && Array.isArray(response.data)) {
      vitalsData = response.data;
    } else {
      vitalsData = [];
    }
    setVitals(vitalsData);
  } catch (err) {
    console.error("Error fetching vitals:", err);
    setError("Failed to load vitals");
    setVitals([]);
  } finally {
    setLoading(false);
  }
}, [patientId, targetDate]);  // ✅ Dependencies for useCallback
 
useEffect(() => {
  fetchVitals();
}, [fetchVitals]);  // ✅ Now only depends on fetchVitals (stable reference)

  const handleSaveVitals = async (vitalsData: NewVitalsForm) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const doctorName = user?.full_name_en || "Doctor";

      if (editingVital) {
        const updatePayload = {
          bp: vitalsData.bp,
          hr: Number(vitalsData.hr),
          temp: Number(vitalsData.temp),
          weight: Number(vitalsData.weight),
          rr: Number(vitalsData.rr),
          spo2: Number(vitalsData.spo2),
          recordedBy: doctorName,
        };
        await currentVisitApi.updateVital(
          patientId,
          editingVital.id.toString(),
          updatePayload
        );
        toast.success("Vitals updated successfully");
      } else {
        const payload = {
          date: targetDate,
          ...vitalsData,
          recordedBy: doctorName,
        };
        await currentVisitApi.saveVitals(patientId, payload);
        toast.success("Vitals saved successfully");
      }

      // Always refetch after successful save/update
      await fetchVitals();

      // Close modal and reset form
      setShowAddVitalsModal(false);
      setEditingVital(null);
      setNewVitals({ bp: "", hr: "", temp: "", weight: "", rr: "", spo2: "" });
    } catch (error: any) {
      console.error(`Error ${editingVital ? "updating" : "saving"} vitals:`, error);
      toast.error(error?.message || `Failed to ${editingVital ? "update" : "save"} vitals`);
    }
  };

  const handleDeleteVital = async (vitalId: number) => {
    if (!confirm("Are you sure you want to delete this vital record?")) return;

    try {
      await currentVisitApi.deleteVital(patientId, vitalId.toString());
      toast.success("Vital record deleted successfully");
      // Refresh after deletion
      await fetchVitals();
    } catch (error) {
      console.error("Error deleting vital:", error);
      toast.error("Failed to delete vital record");
    }
  };

  const getVitalStatus = (value: number, type: string): "normal" | "abnormal" => {
    if (type === "hr") return value >= 60 && value <= 100 ? "normal" : "abnormal";
    if (type === "temp") return value >= 36.1 && value <= 37.2 ? "normal" : "abnormal";
    if (type === "spo2") return value >= 95 ? "normal" : "abnormal";
    return "normal";
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#137fec] border-t-transparent animate-spin rounded-full"></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
        <p className="text-red-600 text-center">{error}</p>
      </section>
    );
  }

  return (
    <>
      <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#137fec]">monitor_heart</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Vitals</h3>
              <p className="text-xs text-slate-500">Historical vital signs and measurements</p>
              {dateParam && (
                <p className="text-xs text-slate-400 mt-1">
                  Showing vitals for {new Date(dateParam).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setEditingVital(null);
              setNewVitals({ bp: "", hr: "", temp: "", weight: "", rr: "", spo2: "" });
              setShowAddVitalsModal(true);
            }}
            className="text-[#137fec] bg-transparent hover:bg-blue-50 text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition-all border border-[#137fec]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Vitals
          </button>
        </div>

        {vitals.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No vitals recorded for this visit.</p>
        ) : (
          <div className="space-y-4">
            {vitals.map((vital) => {
              const isToday = isTodayVital(vital);
              return (
                <div key={vital.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#137fec]">calendar_month</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {new Date(vital.recordedAt).toLocaleDateString()} at{" "}
                          {new Date(vital.recordedAt).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-slate-500">Recorded by {vital.recordedBy}</p>
                      </div>
                    </div>
                    {isToday && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingVital(vital);
                            setNewVitals({
                              bp: vital.bp || "",
                              hr: vital.hr?.toString() || "",
                              temp: vital.temp?.toString() || "",
                              weight: vital.weight?.toString() || "",
                              rr: vital.rr?.toString() || "",
                              spo2: vital.spo2?.toString() || "",
                            });
                            setShowAddVitalsModal(true);
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-slate-500">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteVital(vital.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-red-500">delete</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[14px] text-red-400">monitor_heart</span> BP
                      </p>
                      <p className="text-lg font-bold text-slate-900">{vital.bp}</p>
                      <p className="text-[10px] text-slate-400">mmHg</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[14px] text-red-400">ecg_heart</span> HR
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-slate-900">{vital.hr}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          getVitalStatus(vital.hr, "hr") === "normal"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {getVitalStatus(vital.hr, "hr") === "normal" ? "Normal" : "High"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">bpm</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[14px] text-amber-400">thermometer</span> Temp
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-slate-900">{vital.temp}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          getVitalStatus(vital.temp, "temp") === "normal"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {getVitalStatus(vital.temp, "temp") === "normal" ? "Normal" : "Fever"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">°C</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[14px] text-blue-400">scale</span> Weight
                      </p>
                      <p className="text-lg font-bold text-slate-900">{vital.weight}</p>
                      <p className="text-[10px] text-slate-400">kg</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[14px] text-green-400">respiratory_rate</span> RR
                      </p>
                      <p className="text-lg font-bold text-slate-900">{vital.rr}</p>
                      <p className="text-[10px] text-slate-400">breaths/min</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[14px] text-purple-400">oxygen_saturation</span> SpO2
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-slate-900">{vital.spo2}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          getVitalStatus(vital.spo2, "spo2") === "normal"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {getVitalStatus(vital.spo2, "spo2") === "normal" ? "Normal" : "Low"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showAddVitalsModal && (
        <AddVitalsModal
          onClose={() => {
            setShowAddVitalsModal(false);
            setEditingVital(null);
            setNewVitals({ bp: "", hr: "", temp: "", weight: "", rr: "", spo2: "" });
          }}
          onAdd={handleSaveVitals}
          initialVitals={newVitals}
          isEditing={!!editingVital}
        />
      )}
    </>
  );
}