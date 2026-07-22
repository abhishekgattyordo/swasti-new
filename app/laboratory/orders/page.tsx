

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useTenant } from "@/contexts/TenantContext";
// import { MODULE_KEYS, LABARATORY_FEATURES } from "@/lib/feature";
// import Card from "@/components/laboratory/Card";

// interface LabTest {
//   id: string;
//   test_name: string;
//   test_code: string;
//   category: string;
//   price: number;
//   active: boolean;
// }

// interface LabOrder {
//   id: string;
//   order_id: string;
//   patient_id: string;
//   patient_name: string;
//   visit_type: "OP" | "IP";
//   visit_id: string;
//   tests: Array<{ id: string; name: string; price: number }>;
//   total_amount: number;
//   status: "Ordered" | "Collected" | "Completed" | "Cancelled";
//   order_date: string;
//   collected_date?: string;
//   completed_date?: string;
//   billing_entry_id?: string;
//   admission_id?: string;
//   admission_date?: string;
//   ward_id?: number;
//   bed_id?: number;
//   created_at?: string;
// }

// interface Patient {
//   id: string;
//   name: string;
//   phone: string;
//   registration_id?: string;
//   dob?: string;
//   gender?: string;
// }

// interface AdmissionInfo {
//   isAdmitted: boolean;
//   admission: {
//     admission_id: string | number;
//     admission_date: string;
//     ward_name?: string;
//     bed_number?: string;
//     status: string;
//   } | null;
// }

// export default function LabOrdersPage() {
//   const router = useRouter();
//   const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();
  
//   const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
//   const [showOrderModal, setShowOrderModal] = useState(false);
//   const [selectedTests, setSelectedTests] = useState<string[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
//   const [patientList, setPatientList] = useState<Patient[]>([]);
//   const [showPatientDropdown, setShowPatientDropdown] = useState(false);
//   const [phoneSearch, setPhoneSearch] = useState("");
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchError, setSearchError] = useState("");
//   const [selectedVisitType, setSelectedVisitType] = useState<"OP" | "IP">("OP");
//   const [availableTests, setAvailableTests] = useState<LabTest[]>([]);
//   const [orders, setOrders] = useState<LabOrder[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
//   const [checkingAdmission, setCheckingAdmission] = useState(false);

//   const isLabOrdersEnabled = isMicroFeatureEnabled(
//     MODULE_KEYS.LABARATORY,
//     LABARATORY_FEATURES.LAB_ORDERS
//   );

//   useEffect(() => {
//     if (!tenantLoading && !isLabOrdersEnabled) {
//       router.push("/unauthorized");
//     }
//   }, [tenantLoading, isLabOrdersEnabled, router]);

//   useEffect(() => {
//     if (isLabOrdersEnabled) {
//       fetchData();
//     }
//   }, [isLabOrdersEnabled]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const testsResponse = await fetch("/api/laboratory/tests?active=true");
//       const testsResult = await testsResponse.json();
      
//       if (testsResult.success) {
//         setAvailableTests(testsResult.data);
//       }

//       const ordersResponse = await fetch("/api/laboratory/orders");
//       const ordersResult = await ordersResponse.json();
      
//       if (ordersResult.success) {
//         setOrders(ordersResult.data);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkAdmissionStatus = async (patientId: string) => {
//     setCheckingAdmission(true);
//     try {
//       console.log("Checking admission for patient:", patientId);
//       const response = await fetch(`/api/lab/admission-status?patientId=${patientId}`);
//       const result = await response.json();
      
//       console.log("Admission status response:", result);
      
//       // Handle your API response structure
//       if (result.success && result.data) {
//         // Patient has active admission
//         setAdmissionInfo({
//           isAdmitted: true,
//           admission: {
//             admission_id: result.data.admission_id,
//             admission_date: result.data.admission_date,
//             ward_name: result.data.ward_name,
//             bed_number: result.data.bed_number,
//             status: result.data.status,
//           }
//         });
//         setSelectedVisitType("IP");
//         console.log("Patient is admitted. Admission details:", result.data);
//         return true;
//       } else {
//         // No active admission
//         setAdmissionInfo(null);
//         setSelectedVisitType("OP");
//         console.log("Patient is not admitted");
//         return false;
//       }
//     } catch (error) {
//       console.error("Error checking admission:", error);
//       setAdmissionInfo(null);
//       return false;
//     } finally {
//       setCheckingAdmission(false);
//     }
//   };

//   const searchPatientByPhone = async () => {
//     const cleanPhone = phoneSearch.replace(/\s/g, '').replace(/-/g, '');
    
//     if (!cleanPhone || cleanPhone.length < 10) {
//       setSearchError("Please enter a valid 10-digit phone number");
//       return;
//     }

//     setIsSearching(true);
//     setSearchError("");

//     try {
//       const response = await fetch(`/api/registration?phone=${encodeURIComponent(cleanPhone)}`);
      
//       if (!response.ok) {
//         throw new Error("Patient not found");
//       }

//       const result = await response.json();
      
//       if (result.success === true && result.data && Array.isArray(result.data) && result.data.length > 0) {
//         const patients = result.data.map((patientData: any) => ({
//           id: patientData.patient_id,
//           name: patientData.full_name_en,
//           phone: patientData.phone,
//           registration_id: patientData.registration_id,
//           dob: patientData.dob,
//           gender: patientData.gender,
//         }));
        
//         setPatientList(patients);
//         setShowPatientDropdown(true);
//         setSearchError("");
        
//         if (patients.length === 1) {
//           setSelectedPatient(patients[0]);
//           setShowPatientDropdown(false);
//           await checkAdmissionStatus(patients[0].id);
//         }
//       } else {
//         setSearchError("No patient found with this phone number");
//         setPatientList([]);
//         setSelectedPatient(null);
//         setShowPatientDropdown(false);
//       }
//     } catch (error) {
//       console.error("Error searching patient:", error);
//       setSearchError("Error searching patient. Please try again.");
//       setPatientList([]);
//       setSelectedPatient(null);
//       setShowPatientDropdown(false);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const selectPatient = async (patient: Patient) => {
//     setSelectedPatient(patient);
//     setShowPatientDropdown(false);
//     setPhoneSearch(patient.phone);
//     await checkAdmissionStatus(patient.id);
//   };

//   const handleOrderTest = async () => {
//     if (!selectedPatient || selectedTests.length === 0) {
//       alert("Please select a patient and at least one test");
//       return;
//     }

//     const selectedTestsData = availableTests.filter((t) =>
//       selectedTests.includes(t.id)
//     );
    
//     const totalAmount = selectedTestsData.reduce((sum, t) => {
//       const price = typeof t.price === 'number' ? t.price : Number(t.price) || 0;
//       return sum + price;
//     }, 0);

//     const year = new Date().getFullYear();
//     const randomNum = Math.floor(Math.random() * 1000);
//     const orderId = `LAB-${year}-${String(randomNum).padStart(3, "0")}`;
//     const today = new Date().toISOString().split("T")[0];

//     let visitId = "";
//     let admissionData = {};

//     console.log("=== CREATING ORDER ===");
//     console.log("Selected Visit Type:", selectedVisitType);
//     console.log("Admission Info:", admissionInfo);

//     // Use admission data from your API response
//     if (selectedVisitType === "IP" && admissionInfo?.isAdmitted && admissionInfo.admission) {
//       visitId = `IP-${admissionInfo.admission.admission_id}`;
//       admissionData = {
//         admission_id: String(admissionInfo.admission.admission_id),
//         admission_date: admissionInfo.admission.admission_date,
//         // Note: Your API doesn't return ward_id and bed_id as numbers, 
//         // so we'll use null or extract from ward_name/bed_number if needed
//         ward_id: null,
//         bed_id: null,
//       };
//       console.log("✅ IP Visit - Adding admission data:", admissionData);
//     } else {
//       visitId = selectedPatient.registration_id || `OP-${Date.now()}`;
//       console.log("❌ OP Visit - No admission data");
//     }

//     const testsForDb = selectedTestsData.map((t) => ({
//       id: t.id,
//       name: t.test_name,
//       price: typeof t.price === 'number' ? t.price : Number(t.price),
//     }));

//     const orderData = {
//       order_id: orderId,
//       patient_id: selectedPatient.id,
//       patient_name: selectedPatient.name,
//       visit_type: selectedVisitType,
//       visit_id: visitId,
//       tests: testsForDb,
//       total_amount: totalAmount,
//       status: "Ordered",
//       order_date: today,
//       billing_entry_id: `BILL-${Date.now()}`,
//       ...admissionData,
//     };

//     console.log("=== FINAL ORDER DATA ===");
//     console.log(JSON.stringify(orderData, null, 2));

//     try {
//       const response = await fetch("/api/laboratory/orders", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(orderData),
//       });
      
//       const result = await response.json();
//       console.log("=== API RESPONSE ===");
//       console.log(result);
      
//       if (!result.success) {
//         throw new Error(result.error);
//       }

//       let message = `✅ Order Created Successfully!\n\nOrder ID: ${orderId}\nPatient: ${selectedPatient.name}\nTotal Amount: ₹${totalAmount}`;
      
//       if (selectedVisitType === "IP" && admissionInfo?.isAdmitted && admissionInfo.admission) {
//         message += `\n\n🏥 Admission Details:\nAdmission ID: ${admissionInfo.admission.admission_id}\nAdmission Date: ${admissionInfo.admission.admission_date}`;
//         if (admissionInfo.admission.ward_name) {
//           message += `\nWard: ${admissionInfo.admission.ward_name}`;
//         }
//         if (admissionInfo.admission.bed_number) {
//           message += `\nBed: ${admissionInfo.admission.bed_number}`;
//         }
//       }

//       alert(message);
//       await fetchData();

//       setShowOrderModal(false);
//       setSelectedTests([]);
//       setSelectedPatient(null);
//       setPatientList([]);
//       setPhoneSearch("");
//       setShowPatientDropdown(false);
//       setSelectedVisitType("OP");
//       setAdmissionInfo(null);
//     } catch (error) {
//       console.error("Error creating order:", error);
//       alert("Error creating order. Please try again.");
//     }
//   };

//   const cancelOrder = async (orderId: string) => {
//     const orderToCancel = orders.find((o) => o.id === orderId);
//     if (!orderToCancel) return;

//     if (
//       confirm(
//         `Are you sure you want to cancel this order? This will reverse the billing charge of ₹${orderToCancel.total_amount}.`
//       )
//     ) {
//       try {
//         const response = await fetch("/api/laboratory/orders", {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             id: orderId,
//             status: "Cancelled",
//           }),
//         });
        
//         const result = await response.json();
        
//         if (!result.success) {
//           throw new Error(result.error);
//         }

//         alert(`✅ Order cancelled. Billing charge of ₹${orderToCancel.total_amount} has been reversed.`);
//         await fetchData();
//       } catch (error) {
//         console.error("Error cancelling order:", error);
//         alert("Error cancelling order. Please try again.");
//       }
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     const configs: Record<string, string> = {
//       Ordered: "bg-amber-50 text-amber-700 border-amber-200",
//       Collected: "bg-blue-50 text-blue-700 border-blue-200",
//       Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
//       Cancelled: "bg-red-50 text-red-700 border-red-200",
//     };
//     return configs[status] || configs.Ordered;
//   };

//   const filteredOrders = orders.filter((order) =>
//     activeTab === "pending"
//       ? order.status === "Ordered" || order.status === "Collected"
//       : true
//   );

//   const selectedTestsData = availableTests.filter((t) =>
//     selectedTests.includes(t.id)
//   );
//   const totalAmount = selectedTestsData.reduce((sum, t) => {
//     const price = typeof t.price === 'number' ? t.price : Number(t.price) || 0;
//     return sum + price;
//   }, 0);

//   if (tenantLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isLabOrdersEnabled) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="text-red-500 text-6xl mb-4">🔒</div>
//           <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
//           <p className="text-gray-600">
//             Lab Orders feature is not enabled for {tenant?.name}.
//           </p>
//           <button
//             onClick={() => router.push("/dashboard")}
//             className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
//           >
//             Go to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading orders...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900">Lab Orders</h1>
//             <p className="text-sm text-gray-500 mt-1">
//               Create and manage laboratory orders
//             </p>
//             {tenant && (
//               <p className="text-xs text-gray-400 mt-1">
//                 Tenant: {tenant.name}
//               </p>
//             )}
//           </div>
//           <button
//             onClick={() => setShowOrderModal(true)}
//             className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
//           >
//             + New Order
//           </button>
//         </div>

//         <div className="flex space-x-2 mt-4">
//           <button
//             onClick={() => setActiveTab("pending")}
//             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//               activeTab === "pending"
//                 ? "bg-primary text-white"
//                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//             }`}
//           >
//             Active Orders
//           </button>
//           <button
//             onClick={() => setActiveTab("all")}
//             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//               activeTab === "all"
//                 ? "bg-primary text-white"
//                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//             }`}
//           >
//             All Orders
//           </button>
//         </div>
//       </div>

//       <div className="p-8">
//         <div className="space-y-4">
//           {filteredOrders.map((order) => (
//             <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
//               <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                   <div className="flex items-center space-x-3 mb-2">
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       {order.patient_name}
//                     </h3>
//                     <span className="text-sm text-gray-500">
//                       ID: {order.patient_id}
//                     </span>
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
//                         order.status
//                       )}`}
//                     >
//                       {order.status}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-500 mb-3">
//                     {order.order_id} • {order.visit_type} Visit: {order.visit_id} •{" "}
//                     {order.order_date}
//                   </p>
//                   {order.visit_type === "IP" && order.admission_id && (
//                     <p className="text-xs text-blue-600 mb-2">
//                       🏥 Admission ID: {order.admission_id}
//                     </p>
//                   )}
//                   <div className="flex flex-wrap gap-2">
//                     {order.tests.map((test, idx) => (
//                       <span
//                         key={idx}
//                         className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600"
//                       >
//                         {test.name} (₹{test.price})
//                       </span>
//                     ))}
//                   </div>
//                   {order.billing_entry_id && (
//                     <p className="text-xs text-gray-400 mt-2">
//                       Billing ID: {order.billing_entry_id}
//                     </p>
//                   )}
//                 </div>
//                 <div className="text-right">
//                   <p className="text-2xl font-bold text-gray-900">
//                     ₹{order.total_amount}
//                   </p>
//                   {order.status !== "Completed" && order.status !== "Cancelled" && (
//                     <button
//                       onClick={() => cancelOrder(order.id)}
//                       className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
//                     >
//                       Cancel Order
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </Card>
//           ))}

//           {filteredOrders.length === 0 && (
//             <Card className="p-8 text-center">
//               <p className="text-gray-500">No orders found</p>
//             </Card>
//           )}
//         </div>
//       </div>

//       {/* New Order Modal */}
//       {showOrderModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   New Lab Order
//                 </h2>
//                 <button
//                   onClick={() => {
//                     setShowOrderModal(false);
//                     setSelectedTests([]);
//                     setSelectedPatient(null);
//                     setPatientList([]);
//                     setPhoneSearch("");
//                     setShowPatientDropdown(false);
//                     setSelectedVisitType("OP");
//                     setAdmissionInfo(null);
//                   }}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   ✕
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div className="relative">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Search Patient by Phone Number *
//                   </label>
//                   <div className="flex space-x-2">
//                     <input
//                       type="tel"
//                       placeholder="Enter 10-digit mobile number"
//                       value={phoneSearch}
//                       onChange={(e) => {
//                         const value = e.target.value.replace(/\D/g, '').slice(0, 10);
//                         setPhoneSearch(value);
//                         setSearchError("");
//                         setSelectedPatient(null);
//                         setShowPatientDropdown(false);
//                         setAdmissionInfo(null);
//                       }}
//                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//                       maxLength={10}
//                     />
//                     <button
//                       onClick={searchPatientByPhone}
//                       disabled={isSearching || phoneSearch.length < 10}
//                       className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
//                     >
//                       {isSearching ? "Searching..." : "Search"}
//                     </button>
//                   </div>
//                   {searchError && (
//                     <p className="text-sm text-red-600 mt-1">{searchError}</p>
//                   )}
                  
//                   {showPatientDropdown && patientList.length > 0 && (
//                     <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                       {patientList.map((patient) => (
//                         <button
//                           key={patient.id}
//                           onClick={() => selectPatient(patient)}
//                           className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
//                         >
//                           <div className="font-medium text-gray-900">{patient.name}</div>
//                           <div className="text-sm text-gray-500 mt-0.5">
//                             ID: {patient.id}
//                           </div>
//                           {patient.registration_id && (
//                             <div className="text-xs text-gray-400">
//                               Reg ID: {patient.registration_id}
//                             </div>
//                           )}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {selectedPatient && (
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                     <p className="text-sm font-medium text-green-900 mb-2">
//                       ✅ Patient Selected
//                     </p>
//                     <p className="text-sm">
//                       <span className="font-medium">Name:</span> {selectedPatient.name}
//                     </p>
//                     <p className="text-sm">
//                       <span className="font-medium">Phone:</span> {selectedPatient.phone}
//                     </p>
//                     <p className="text-sm">
//                       <span className="font-medium">Patient ID:</span> {selectedPatient.id}
//                     </p>
//                     {selectedPatient.registration_id && (
//                       <p className="text-sm">
//                         <span className="font-medium">Registration ID:</span> {selectedPatient.registration_id}
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 {checkingAdmission && (
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                     <p className="text-sm text-blue-600">Checking admission status...</p>
//                   </div>
//                 )}

//                 {admissionInfo?.isAdmitted && admissionInfo.admission && selectedPatient && (
//                   <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
//                     <p className="text-sm font-medium text-purple-900 mb-2">
//                       🏥 Patient is Currently Admitted
//                     </p>
//                     <div className="space-y-1">
//                       <p className="text-sm">
//                         <span className="font-medium">Admission ID:</span> {admissionInfo.admission.admission_id}
//                       </p>
//                       <p className="text-sm">
//                         <span className="font-medium">Admission Date:</span> {admissionInfo.admission.admission_date}
//                       </p>
//                       {admissionInfo.admission.ward_name && (
//                         <p className="text-sm">
//                           <span className="font-medium">Ward:</span> {admissionInfo.admission.ward_name}
//                         </p>
//                       )}
//                       {admissionInfo.admission.bed_number && (
//                         <p className="text-sm">
//                           <span className="font-medium">Bed:</span> {admissionInfo.admission.bed_number}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {selectedPatient && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Visit Type *
//                     </label>
//                     <div className="flex space-x-4">
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           value="OP"
//                           checked={selectedVisitType === "OP"}
//                           onChange={(e) =>
//                             setSelectedVisitType(e.target.value as "OP")
//                           }
//                           className="mr-2"
//                           disabled={admissionInfo?.isAdmitted}
//                         />
//                         OP Visit
//                       </label>
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           value="IP"
//                           checked={selectedVisitType === "IP"}
//                           onChange={(e) =>
//                             setSelectedVisitType(e.target.value as "IP")
//                           }
//                           className="mr-2"
//                         />
//                         IP Admission
//                         {admissionInfo?.isAdmitted && (
//                           <span className="ml-2 text-xs text-green-600">(Auto-selected - Patient admitted)</span>
//                         )}
//                       </label>
//                     </div>
//                     {admissionInfo?.isAdmitted && selectedVisitType === "OP" && (
//                       <p className="text-xs text-amber-600 mt-1">
//                         Note: This patient is currently admitted. IP admission is recommended.
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 {selectedPatient && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Select Tests *
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Search tests..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-3"
//                     />
//                     <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
//                       {availableTests
//                         .filter((t) =>
//                           t.test_name.toLowerCase().includes(searchTerm.toLowerCase())
//                         )
//                         .map((test) => (
//                           <label
//                             key={test.id}
//                             className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
//                           >
//                             <div className="flex items-center flex-1">
//                               <input
//                                 type="checkbox"
//                                 checked={selectedTests.includes(test.id)}
//                                 onChange={(e) => {
//                                   if (e.target.checked) {
//                                     setSelectedTests([...selectedTests, test.id]);
//                                   } else {
//                                     setSelectedTests(
//                                       selectedTests.filter((id) => id !== test.id)
//                                     );
//                                   }
//                                 }}
//                                 className="mr-3"
//                               />
//                               <div>
//                                 <p className="text-sm font-medium text-gray-900">
//                                   {test.test_name}
//                                 </p>
//                                 <p className="text-xs text-gray-500">
//                                   {test.test_code}
//                                 </p>
//                               </div>
//                             </div>
//                             <span className="text-sm font-medium text-gray-700">
//                               ₹{test.price}
//                             </span>
//                           </label>
//                         ))}
//                       {availableTests.length === 0 && (
//                         <p className="text-center text-gray-500 py-4">
//                           No active tests found. Please add tests in the Test Catalog.
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {selectedTests.length > 0 && (
//                   <div className="border-t border-gray-200 pt-4">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-sm font-medium text-gray-700">
//                         Selected Tests:
//                       </span>
//                       <span className="text-sm text-gray-500">
//                         {selectedTests.length} items
//                       </span>
//                     </div>
//                     <div className="space-y-1 mb-4">
//                       {selectedTestsData.map((test) => (
//                         <div key={test.id} className="flex justify-between text-sm">
//                           <span className="text-gray-600">{test.test_name}</span>
//                           <span className="text-gray-900">₹{test.price}</span>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="flex justify-between items-center pt-2 border-t border-gray-200">
//                       <span className="font-semibold text-gray-900">
//                         Total Amount
//                       </span>
//                       <span className="text-xl font-bold text-primary">
//                         ₹{totalAmount}
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   onClick={() => {
//                     setShowOrderModal(false);
//                     setSelectedTests([]);
//                     setSelectedPatient(null);
//                     setPatientList([]);
//                     setPhoneSearch("");
//                     setShowPatientDropdown(false);
//                     setSelectedVisitType("OP");
//                     setAdmissionInfo(null);
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleOrderTest}
//                   disabled={!selectedPatient || selectedTests.length === 0}
//                   className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
//                 >
//                   Create Order & Add to Billing
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/context/TenantContext";
import { MODULE_KEYS, LABARATORY_FEATURES } from "@/lib/feature";
import Card from "@/components/laboratory/Card";
import {
  Plus,
  Search,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  FlaskRound,
  User,
  Phone,
  FileText,
  DollarSign,
  Hospital,
  Bed,
  Calendar,
  ChevronRight,
  Microscope,
  Activity,
} from "lucide-react";

interface LabTest {
  id: string;
  test_name: string;
  test_code: string;
  category: string;
  price: number;
  active: boolean;
}

interface LabOrder {
  id: string;
  order_id: string;
  patient_id: string;
  patient_name: string;
  visit_type: "OP" | "IP";
  visit_id: string;
  tests: Array<{ id: string; name: string; price: number }>;
  total_amount: number;
  status: "Ordered" | "Collected" | "Completed" | "Cancelled";
  order_date: string;
  collected_date?: string;
  completed_date?: string;
  billing_entry_id?: string;
  admission_id?: string;
  admission_date?: string;
  ward_id?: number;
  bed_id?: number;
  created_at?: string;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  registration_id?: string;
  dob?: string;
  gender?: string;
}

interface AdmissionInfo {
  isAdmitted: boolean;
  admission: {
    admission_id: string | number;
    admission_date: string;
    ward_name?: string;
    bed_number?: string;
    status: string;
  } | null;
}

export default function LabOrdersPage() {
  const router = useRouter();
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();
  
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedVisitType, setSelectedVisitType] = useState<"OP" | "IP">("OP");
  const [availableTests, setAvailableTests] = useState<LabTest[]>([]);
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo | null>(null);
  const [checkingAdmission, setCheckingAdmission] = useState(false);

  const isLabOrdersEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.LABARATORY,
    LABARATORY_FEATURES.LAB_ORDERS
  );

  useEffect(() => {
    if (!tenantLoading && !isLabOrdersEnabled) {
      router.push("/unauthorized");
    }
  }, [tenantLoading, isLabOrdersEnabled, router]);

  useEffect(() => {
    if (isLabOrdersEnabled) {
      fetchData();
    }
  }, [isLabOrdersEnabled]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const testsResponse = await fetch("/api/laboratory/tests?active=true");
      const testsResult = await testsResponse.json();
      
      if (testsResult.success) {
        setAvailableTests(testsResult.data);
      }

      const ordersResponse = await fetch("/api/laboratory/orders");
      const ordersResult = await ordersResponse.json();
      
      if (ordersResult.success) {
        setOrders(ordersResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdmissionStatus = async (patientId: string) => {
    setCheckingAdmission(true);
    try {
      console.log("Checking admission for patient:", patientId);
      const response = await fetch(`/api/lab/admission-status?patientId=${patientId}`);
      const result = await response.json();
      
      console.log("Admission status response:", result);
      
      if (result.success && result.data) {
        setAdmissionInfo({
          isAdmitted: true,
          admission: {
            admission_id: result.data.admission_id,
            admission_date: result.data.admission_date,
            ward_name: result.data.ward_name,
            bed_number: result.data.bed_number,
            status: result.data.status,
          }
        });
        setSelectedVisitType("IP");
        console.log("Patient is admitted. Admission details:", result.data);
        return true;
      } else {
        setAdmissionInfo(null);
        setSelectedVisitType("OP");
        console.log("Patient is not admitted");
        return false;
      }
    } catch (error) {
      console.error("Error checking admission:", error);
      setAdmissionInfo(null);
      return false;
    } finally {
      setCheckingAdmission(false);
    }
  };

  const searchPatientByPhone = async () => {
    const cleanPhone = phoneSearch.replace(/\s/g, '').replace(/-/g, '');
    
    if (!cleanPhone || cleanPhone.length < 10) {
      setSearchError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const response = await fetch(`/api/registration?phone=${encodeURIComponent(cleanPhone)}`);
      
      if (!response.ok) {
        throw new Error("Patient not found");
      }

      const result = await response.json();
      
      if (result.success === true && result.data && Array.isArray(result.data) && result.data.length > 0) {
        const patients = result.data.map((patientData: any) => ({
          id: patientData.patient_id,
          name: patientData.full_name_en,
          phone: patientData.phone,
          registration_id: patientData.registration_id,
          dob: patientData.dob,
          gender: patientData.gender,
        }));
        
        setPatientList(patients);
        setShowPatientDropdown(true);
        setSearchError("");
        
        if (patients.length === 1) {
          setSelectedPatient(patients[0]);
          setShowPatientDropdown(false);
          await checkAdmissionStatus(patients[0].id);
        }
      } else {
        setSearchError("No patient found with this phone number");
        setPatientList([]);
        setSelectedPatient(null);
        setShowPatientDropdown(false);
      }
    } catch (error) {
      console.error("Error searching patient:", error);
      setSearchError("Error searching patient. Please try again.");
      setPatientList([]);
      setSelectedPatient(null);
      setShowPatientDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDropdown(false);
    setPhoneSearch(patient.phone);
    await checkAdmissionStatus(patient.id);
  };

  const handleOrderTest = async () => {
    if (!selectedPatient || selectedTests.length === 0) {
      alert("Please select a patient and at least one test");
      return;
    }

    const selectedTestsData = availableTests.filter((t) =>
      selectedTests.includes(t.id)
    );
    
    const totalAmount = selectedTestsData.reduce((sum, t) => {
      const price = typeof t.price === 'number' ? t.price : Number(t.price) || 0;
      return sum + price;
    }, 0);

    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000);
    const orderId = `LAB-${year}-${String(randomNum).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];

    let visitId = "";
    let admissionData = {};

    console.log("=== CREATING ORDER ===");
    console.log("Selected Visit Type:", selectedVisitType);
    console.log("Admission Info:", admissionInfo);

    if (selectedVisitType === "IP" && admissionInfo?.isAdmitted && admissionInfo.admission) {
      visitId = `IP-${admissionInfo.admission.admission_id}`;
      admissionData = {
        admission_id: String(admissionInfo.admission.admission_id),
        admission_date: admissionInfo.admission.admission_date,
        ward_id: null,
        bed_id: null,
      };
      console.log("✅ IP Visit - Adding admission data:", admissionData);
    } else {
      visitId = selectedPatient.registration_id || `OP-${Date.now()}`;
      console.log("❌ OP Visit - No admission data");
    }

    const testsForDb = selectedTestsData.map((t) => ({
      id: t.id,
      name: t.test_name,
      price: typeof t.price === 'number' ? t.price : Number(t.price),
    }));

    const orderData = {
      order_id: orderId,
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      visit_type: selectedVisitType,
      visit_id: visitId,
      tests: testsForDb,
      total_amount: totalAmount,
      status: "Ordered",
      order_date: today,
      billing_entry_id: `BILL-${Date.now()}`,
      ...admissionData,
    };

    console.log("=== FINAL ORDER DATA ===");
    console.log(JSON.stringify(orderData, null, 2));

    try {
      const response = await fetch("/api/laboratory/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      console.log("=== API RESPONSE ===");
      console.log(result);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      let message = `✅ Order Created Successfully!\n\nOrder ID: ${orderId}\nPatient: ${selectedPatient.name}\nTotal Amount: ₹${totalAmount}`;
      
      if (selectedVisitType === "IP" && admissionInfo?.isAdmitted && admissionInfo.admission) {
        message += `\n\n🏥 Admission Details:\nAdmission ID: ${admissionInfo.admission.admission_id}\nAdmission Date: ${admissionInfo.admission.admission_date}`;
        if (admissionInfo.admission.ward_name) {
          message += `\nWard: ${admissionInfo.admission.ward_name}`;
        }
        if (admissionInfo.admission.bed_number) {
          message += `\nBed: ${admissionInfo.admission.bed_number}`;
        }
      }

      alert(message);
      await fetchData();

      setShowOrderModal(false);
      setSelectedTests([]);
      setSelectedPatient(null);
      setPatientList([]);
      setPhoneSearch("");
      setShowPatientDropdown(false);
      setSelectedVisitType("OP");
      setAdmissionInfo(null);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
    }
  };

  const cancelOrder = async (orderId: string) => {
    const orderToCancel = orders.find((o) => o.id === orderId);
    if (!orderToCancel) return;

    if (
      confirm(
        `Are you sure you want to cancel this order? This will reverse the billing charge of ₹${orderToCancel.total_amount}.`
      )
    ) {
      try {
        const response = await fetch("/api/laboratory/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: orderId,
            status: "Cancelled",
          }),
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error);
        }

        alert(`✅ Order cancelled. Billing charge of ₹${orderToCancel.total_amount} has been reversed.`);
        await fetchData();
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Error cancelling order. Please try again.");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      Ordered: { 
        bg: "bg-amber-50 dark:bg-amber-900/20", 
        text: "text-amber-700 dark:text-amber-300", 
        icon: <Clock className="w-3.5 h-3.5 inline mr-1" />
      },
      Collected: { 
        bg: "bg-blue-50 dark:bg-blue-900/20", 
        text: "text-blue-700 dark:text-blue-300", 
        icon: <FlaskRound className="w-3.5 h-3.5 inline mr-1" />
      },
      Completed: { 
        bg: "bg-[#EAF7F4] dark:bg-[#1F8F89]/20", 
        text: "text-[#1F8F89] dark:text-[#2BB2A7]", 
        icon: <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
      },
      Cancelled: { 
        bg: "bg-red-50 dark:bg-red-900/20", 
        text: "text-red-700 dark:text-red-300", 
        icon: <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
      },
    };
    return configs[status] || configs.Ordered;
  };

  const filteredOrders = orders.filter((order) =>
    activeTab === "pending"
      ? order.status === "Ordered" || order.status === "Collected"
      : true
  );

  const selectedTestsData = availableTests.filter((t) =>
    selectedTests.includes(t.id)
  );
  const totalAmount = selectedTestsData.reduce((sum, t) => {
    const price = typeof t.price === 'number' ? t.price : Number(t.price) || 0;
    return sum + price;
  }, 0);

  if (tenantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2BB2A7] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLabOrdersEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-[#E2EFEA] dark:border-gray-700">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Lab Orders feature is not enabled for {tenant?.name}.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2BB2A7] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-[#E2EFEA] dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lab Orders</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create and manage laboratory orders
            </p>
          </div>
          <button
            onClick={() => setShowOrderModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-[#2BB2A7] text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Clock className="w-4 h-4" />
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "all"
                ? "bg-[#2BB2A7] text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <FileText className="w-4 h-4" />
            All Orders
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-12 text-center">
              <Microscope className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No orders found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Click "New Order" to create one
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusBadge(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {order.patient_name}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {order.patient_id}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.icon}
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {order.order_id} • {order.visit_type} Visit: {order.visit_id} • {order.order_date}
                      </p>
                      {order.visit_type === "IP" && order.admission_id && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                          <Hospital className="w-3.5 h-3.5" />
                          Admission ID: {order.admission_id}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {order.tests.map((test, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-300"
                          >
                            {test.name} (₹{test.price})
                          </span>
                        ))}
                      </div>
                      {order.billing_entry_id && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Billing ID: {order.billing_entry_id}
                        </p>
                      )}
                    </div>
                    <div className="text-right min-w-[120px]">
                      <p className="text-2xl font-bold text-[#2BB2A7]">
                        ₹{order.total_amount}
                      </p>
                      {order.status !== "Completed" && order.status !== "Cancelled" && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#E2EFEA] dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  New Lab Order
                </h2>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedTests([]);
                    setSelectedPatient(null);
                    setPatientList([]);
                    setPhoneSearch("");
                    setShowPatientDropdown(false);
                    setSelectedVisitType("OP");
                    setAdmissionInfo(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Patient Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Patient by Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phoneSearch}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneSearch(value);
                        setSearchError("");
                        setSelectedPatient(null);
                        setShowPatientDropdown(false);
                        setAdmissionInfo(null);
                      }}
                      className="flex-1 px-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      maxLength={10}
                    />
                    <button
                      onClick={searchPatientByPhone}
                      disabled={isSearching || phoneSearch.length < 10}
                      className="px-4 py-2 bg-[#2BB2A7] text-white rounded-lg hover:bg-[#1F8F89] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </div>
                  {searchError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{searchError}</p>
                  )}
                  
                  {showPatientDropdown && patientList.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-[#E2EFEA] dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {patientList.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => selectPatient(patient)}
                          className="w-full text-left px-4 py-3 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 border-b border-[#E2EFEA] dark:border-gray-700 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{patient.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            ID: {patient.id}
                          </div>
                          {patient.registration_id && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              Reg ID: {patient.registration_id}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPatient && (
                  <div className="bg-[#EAF7F4] dark:bg-[#1F8F89]/20 border border-[#2BB2A7]/30 dark:border-[#2BB2A7]/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-[#1F8F89] dark:text-[#2BB2A7] mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Patient Selected
                    </p>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium text-gray-700 dark:text-gray-300">Name:</span> <span className="text-gray-900 dark:text-white">{selectedPatient.name}</span></p>
                      <p><span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span> <span className="text-gray-900 dark:text-white">{selectedPatient.phone}</span></p>
                      <p><span className="font-medium text-gray-700 dark:text-gray-300">Patient ID:</span> <span className="text-gray-900 dark:text-white">{selectedPatient.id}</span></p>
                      {selectedPatient.registration_id && (
                        <p><span className="font-medium text-gray-700 dark:text-gray-300">Registration ID:</span> <span className="text-gray-900 dark:text-white">{selectedPatient.registration_id}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {checkingAdmission && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-600 dark:text-blue-400">Checking admission status...</p>
                  </div>
                )}

                {admissionInfo?.isAdmitted && admissionInfo.admission && selectedPatient && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-400 mb-2 flex items-center gap-2">
                      <Hospital className="w-4 h-4" />
                      Patient is Currently Admitted
                    </p>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium text-gray-700 dark:text-gray-300">Admission ID:</span> <span className="text-gray-900 dark:text-white">{admissionInfo.admission.admission_id}</span></p>
                      <p><span className="font-medium text-gray-700 dark:text-gray-300">Admission Date:</span> <span className="text-gray-900 dark:text-white">{admissionInfo.admission.admission_date}</span></p>
                      {admissionInfo.admission.ward_name && (
                        <p><span className="font-medium text-gray-700 dark:text-gray-300">Ward:</span> <span className="text-gray-900 dark:text-white">{admissionInfo.admission.ward_name}</span></p>
                      )}
                      {admissionInfo.admission.bed_number && (
                        <p><span className="font-medium text-gray-700 dark:text-gray-300">Bed:</span> <span className="text-gray-900 dark:text-white">{admissionInfo.admission.bed_number}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {selectedPatient && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Visit Type *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="radio"
                          value="OP"
                          checked={selectedVisitType === "OP"}
                          onChange={(e) =>
                            setSelectedVisitType(e.target.value as "OP")
                          }
                          className="mr-2 accent-[#2BB2A7]"
                          disabled={admissionInfo?.isAdmitted}
                        />
                        OP Visit
                      </label>
                      <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="radio"
                          value="IP"
                          checked={selectedVisitType === "IP"}
                          onChange={(e) =>
                            setSelectedVisitType(e.target.value as "IP")
                          }
                          className="mr-2 accent-[#2BB2A7]"
                        />
                        IP Admission
                        {admissionInfo?.isAdmitted && (
                          <span className="ml-2 text-xs text-[#2BB2A7]">(Auto-selected)</span>
                        )}
                      </label>
                    </div>
                    {admissionInfo?.isAdmitted && selectedVisitType === "OP" && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Note: This patient is currently admitted. IP admission is recommended.
                      </p>
                    )}
                  </div>
                )}

                {selectedPatient && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Tests *
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
                      />
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-[#E2EFEA] dark:border-gray-700 rounded-lg p-3">
                      {availableTests
                        .filter((t) =>
                          t.test_name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((test) => (
                          <label
                            key={test.id}
                            className="flex items-center justify-between p-2 hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 rounded-lg cursor-pointer"
                          >
                            <div className="flex items-center flex-1">
                              <input
                                type="checkbox"
                                checked={selectedTests.includes(test.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTests([...selectedTests, test.id]);
                                  } else {
                                    setSelectedTests(
                                      selectedTests.filter((id) => id !== test.id)
                                    );
                                  }
                                }}
                                className="mr-3 accent-[#2BB2A7]"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {test.test_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {test.test_code}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              ₹{test.price}
                            </span>
                          </label>
                        ))}
                      {availableTests.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                          No active tests found. Please add tests in the Test Catalog.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedTests.length > 0 && (
                  <div className="border-t border-[#E2EFEA] dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Selected Tests:
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedTests.length} items
                      </span>
                    </div>
                    <div className="space-y-1 mb-4">
                      {selectedTestsData.map((test) => (
                        <div key={test.id} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{test.test_name}</span>
                          <span className="text-gray-900 dark:text-white">₹{test.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#E2EFEA] dark:border-gray-700">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-[#2BB2A7]">
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedTests([]);
                    setSelectedPatient(null);
                    setPatientList([]);
                    setPhoneSearch("");
                    setShowPatientDropdown(false);
                    setSelectedVisitType("OP");
                    setAdmissionInfo(null);
                  }}
                  className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrderTest}
                  disabled={!selectedPatient || selectedTests.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Order & Add to Billing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}