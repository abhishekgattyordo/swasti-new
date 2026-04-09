// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useSearchParams } from "next/navigation";
// import { useEHR } from "../layout";
// import { currentVisitApi } from "@/lib/api/ehr";

// export default function PrescriptionsPage() {
//   const { medications, setMedications, setShowAddMedicationModal, handleDeleteMedication } = useEHR();
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const patientId = params.patientId as string;
//   const dateParam = searchParams.get("date");

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const targetDate = dateParam || new Date().toISOString().split("T")[0];

//   useEffect(() => {
//     const fetchPrescriptions = async () => {
//       if (!patientId) return;
//       setLoading(true);
//       setError(null);
//       try {
//         const data = await currentVisitApi.getPrescriptionsByDate(patientId, targetDate);
//         console.log("Fetched prescriptions:", data);

//         if (Array.isArray(data)) {
//           // Add color property for UI styling
//           const colors = ["blue", "amber", "green", "purple", "pink"];
//           const medsWithColor = data.map((med: any, idx: number) => ({
//             ...med,
//             color: colors[idx % colors.length],
//           }));
//           setMedications(medsWithColor);
//         } else {
//           setMedications([]);
//         }
//       } catch (err) {
//         console.error("Error fetching prescriptions:", err);
//         setError("Failed to load prescriptions");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPrescriptions();
//   }, [patientId, targetDate, setMedications]);

//   if (loading) {
//     return (
//       <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100 flex justify-center items-center h-64">
//         <div className="w-8 h-8 border-4 border-[#137fec] border-t-transparent animate-spin rounded-full"></div>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100 text-center py-12">
//         <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
//         <p className="text-red-600">{error}</p>
//       </section>
//     );
//   }

//   return (
//     <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
//             <span className="material-symbols-outlined text-[#137fec]">pill</span>
//           </div>
//           <div>
//             <h3 className="text-base font-bold text-slate-900">Prescribed Medications</h3>
//             <p className="text-xs text-slate-500">Current medications and dosage information</p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowAddMedicationModal(true)}
//           className="text-[#137fec] bg-transparent hover:bg-blue-50 text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition-all border border-[#137fec]"
//         >
//           <span className="material-symbols-outlined text-[18px]">add</span>
//           Add Medication
//         </button>
//       </div>

//       {medications.length === 0 ? (
//         <p className="text-center text-slate-500 py-8">No prescriptions found for this visit.</p>
//       ) : (
//         <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-gradient-to-r from-slate-50 to-white text-slate-600 font-semibold">
//               <tr>
//                 <th className="px-6 py-4">Medication</th>
//                 <th className="px-6 py-4">Dosage</th>
//                 <th className="px-6 py-4">Duration</th>
//                 <th className="px-6 py-4 w-10"></th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {medications.map((med) => (
//                 <tr key={med.id} className="bg-white hover:bg-slate-50 transition-colors">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className={`w-8 h-8 rounded-md bg-${med.color || 'blue'}-50 flex items-center justify-center`}>
//                         <span className={`material-symbols-outlined text-${med.color || 'blue'}-500 text-[16px]`}>medication</span>
//                       </div>
//                       <div>
//                         <p className="font-semibold text-slate-900">{med.name}</p>
//                         <p className="text-xs text-slate-500">{med.category}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className={`bg-${med.color || 'blue'}-50 text-${med.color || 'blue'}-700 text-xs font-medium px-3 py-1 rounded-full w-fit`}>
//                       {med.dosage}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-slate-600">{med.duration}</td>
//                   <td className="px-6 py-4 text-right">
//                     <button
//                       onClick={() => handleDeleteMedication(med.id)}
//                       className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
//                     >
//                       <span className="material-symbols-outlined text-[20px]">delete</span>
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </section>
//   );
// }

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useEHR } from "../layout";
import { currentVisitApi } from "@/lib/api/ehr";
import toast from "react-hot-toast";

export default function PrescriptionsPage() {
  const { medications, setMedications, setShowAddMedicationModal, handleDeleteMedication } = useEHR();
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params.patientId as string;
  const dateParam = searchParams.get("date");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const targetDate = dateParam || new Date().toISOString().split("T")[0];

  const fetchPrescriptions = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await currentVisitApi.getPrescriptionsByDate(patientId, targetDate);
      console.log("Fetched prescriptions:", data);

      if (Array.isArray(data)) {
        const colors = ["blue", "amber", "green", "purple", "pink"];
        const medsWithColor = data.map((med: any, idx: number) => ({
          ...med,
          color: colors[idx % colors.length],
        }));
        setMedications(medsWithColor);
      } else {
        setMedications([]);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  }, [patientId, targetDate, setMedications]);

  // Initial fetch and whenever refreshTrigger changes
  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions, refreshTrigger]);

  // Wrap delete to also refresh after deletion
  const handleDelete = async (medicationId: number) => {
    await handleDeleteMedication(medicationId);
    // Refresh the list after deletion
    setRefreshTrigger(prev => prev + 1);
    toast.success("Medication deleted");
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
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
      <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100 text-center py-12">
        <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
        <p className="text-red-600">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 text-sm text-[#137fec] hover:underline"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-xl border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#137fec]">pill</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Prescribed Medications</h3>
            <p className="text-xs text-slate-500">Current medications and dosage information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-slate-500 hover:text-[#137fec] hover:bg-blue-50 rounded-lg transition"
            title="Refresh"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
          </button>
          <button
            onClick={() => setShowAddMedicationModal(true)}
            className="text-[#137fec] bg-transparent hover:bg-blue-50 text-sm font-bold flex items-center gap-2 px-4 py-2 rounded-lg transition-all border border-[#137fec]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Medication
          </button>
        </div>
      </div>

      {medications.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No prescriptions found for this visit.</p>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-slate-50 to-white text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Medication</th>
                <th className="px-6 py-4">Dosage</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medications.map((med) => (
                <tr key={med.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-md bg-${med.color || 'blue'}-50 flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-${med.color || 'blue'}-500 text-[16px]`}>medication</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{med.name}</p>
                        <p className="text-xs text-slate-500">{med.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`bg-${med.color || 'blue'}-50 text-${med.color || 'blue'}-700 text-xs font-medium px-3 py-1 rounded-full w-fit`}>
                      {med.dosage}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{med.duration}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}