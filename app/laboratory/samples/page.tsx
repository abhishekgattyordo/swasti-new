

// "use client";

// import { useState, useEffect } from "react";
// import Card from "@/components/laboratory/Card";
// import { supabase } from "@/lib/supabaseClient";

// interface LabOrder {
//   id: string;
//   order_id: string;
//   patient_name: string;
//   patient_id: string;
//   tests: Array<{ id: string; name: string; price: number }>;
//   status: "Ordered" | "Collected" | "Completed" | "Cancelled";
//   order_date: string;
//   collected_date?: string;
//   completed_date?: string;
//   results?: Array<{ test_id: string; result: string; entered_at: string }>;
//   created_at?: string;
// }

// export default function SampleCollectionPage() {
//   const [orders, setOrders] = useState<LabOrder[]>([]);
//   const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
//   const [showResultModal, setShowResultModal] = useState(false);
//   const [results, setResults] = useState<{ [key: string]: string }>({});

//   // ✅ FETCH ORDERS FROM SUPABASE
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     const { data, error } = await supabase
//       .from("lab_orders")
//       .select("*")
//       .in("status", ["Ordered", "Collected"])
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Error fetching orders:", error);
//       return;
//     }

//     setOrders(data || []);
//   };

//   // ✅ MARK AS COLLECTED IN SUPABASE
//   const markAsCollected = async (orderId: string) => {
//     const today = new Date().toISOString().split("T")[0];

//     const { error } = await supabase
//       .from("lab_orders")
//       .update({
//         status: "Collected",
//         collected_date: today,
//       })
//       .eq("id", orderId);

//     if (error) {
//       console.error("Error updating order:", error);
//       alert("Error updating order. Please try again.");
//       return;
//     }

//     alert(`✅ Sample collected for order ${orders.find(o => o.id === orderId)?.order_id}`);
    
//     // Refresh orders
//     await fetchOrders();
//   };

//   // ✅ COMPLETE ORDER WITH RESULTS IN SUPABASE
//   const completeOrder = async () => {
//     if (!selectedOrder) return;

//     // Check if all tests have results
//     const allTestsHaveResults = selectedOrder.tests.every(
//       (test) => results[test.id]?.trim()
//     );
    
//     if (!allTestsHaveResults) {
//       alert("Please enter results for all tests before completing");
//       return;
//     }

//     const today = new Date().toISOString().split("T")[0];

//     const resultsArray = Object.entries(results).map(([test_id, result]) => ({
//       test_id,
//       result,
//       entered_at: new Date().toISOString(),
//     }));

//     const { error } = await supabase
//       .from("lab_orders")
//       .update({
//         status: "Completed",
//         completed_date: today,
//         results: resultsArray,
//       })
//       .eq("id", selectedOrder.id);

//     if (error) {
//       console.error("Error saving results:", error);
//       alert("Error saving results. Please try again.");
//       return;
//     }

//     alert(`✅ Order ${selectedOrder.order_id} completed successfully! Results have been saved.`);

//     // Reset and refresh
//     setShowResultModal(false);
//     setResults({});
//     setSelectedOrder(null);
    
//     await fetchOrders();
//   };

//   const pendingOrders = orders.filter(o => o.status === "Ordered");
//   const collectedOrders = orders.filter(o => o.status === "Collected");

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
//         <h1 className="text-2xl font-semibold text-gray-900">Sample Collection</h1>
//         <p className="text-sm text-gray-500 mt-1">Collect samples and enter test results</p>
//       </div>

//       <div className="p-8">
//         {/* Pending Collection Section */}
//         <div className="mb-8">
//           <div className="flex items-center space-x-2 mb-4">
//             <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
//             <h2 className="text-lg font-semibold text-gray-900">Ready for Collection</h2>
//             <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
//               {pendingOrders.length}
//             </span>
//           </div>
//           <div className="space-y-4">
//             {pendingOrders.map((order) => (
//               <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
//                 <div className="flex justify-between items-start">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-900">{order.patient_name}</h3>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Order: {order.order_id} • ID: {order.patient_id} • {order.order_date}
//                     </p>
//                     <div className="flex flex-wrap gap-2 mt-3">
//                       {order.tests.map((test, idx) => (
//                         <span key={idx} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
//                           {test.name}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => markAsCollected(order.id)}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     Mark Collected
//                   </button>
//                 </div>
//               </Card>
//             ))}
//             {pendingOrders.length === 0 && (
//               <Card className="p-8 text-center">
//                 <p className="text-gray-500">No pending collections</p>
//               </Card>
//             )}
//           </div>
//         </div>

//         {/* Collected Section */}
//         <div>
//           <div className="flex items-center space-x-2 mb-4">
//             <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
//             <h2 className="text-lg font-semibold text-gray-900">Ready for Results</h2>
//             <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
//               {collectedOrders.length}
//             </span>
//           </div>
//           <div className="space-y-4">
//             {collectedOrders.map((order) => (
//               <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
//                 <div className="flex justify-between items-start">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-900">{order.patient_name}</h3>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Order: {order.order_id} • Collected: {order.collected_date}
//                     </p>
//                     <div className="flex flex-wrap gap-2 mt-3">
//                       {order.tests.map((test, idx) => (
//                         <span key={idx} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
//                           {test.name}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setSelectedOrder(order);
//                       // Pre-fill existing results if any
//                       const existingResults: { [key: string]: string } = {};
//                       order.results?.forEach(r => {
//                         existingResults[r.test_id] = r.result;
//                       });
//                       setResults(existingResults);
//                       setShowResultModal(true);
//                     }}
//                     className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
//                   >
//                     Enter Results
//                   </button>
//                 </div>
//               </Card>
//             ))}
//             {collectedOrders.length === 0 && (
//               <Card className="p-8 text-center">
//                 <p className="text-gray-500">No samples ready for results</p>
//               </Card>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Enter Results Modal */}
//       {showResultModal && selectedOrder && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold text-gray-900">Enter Test Results</h2>
//                 <button
//                   onClick={() => {
//                     setShowResultModal(false);
//                     setResults({});
//                   }}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   ✕
//                 </button>
//               </div>

//               <div className="mb-4 p-4 bg-gray-50 rounded-lg">
//                 <p className="text-sm text-gray-600">
//                   Patient: <span className="font-medium text-gray-900">{selectedOrder.patient_name}</span>
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   Order ID: <span className="font-medium text-gray-900">{selectedOrder.order_id}</span>
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   Collected Date: <span className="font-medium text-gray-900">{selectedOrder.collected_date}</span>
//                 </p>
//               </div>

//               <div className="space-y-4 max-h-96 overflow-y-auto">
//                 {selectedOrder.tests.map((test) => (
//                   <div key={test.id}>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       {test.name}
//                     </label>
//                     <textarea
//                       placeholder="Enter result (e.g., Value: 14.2 g/dL - Normal range: 13.5-17.5)"
//                       rows={3}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//                       value={results[test.id] || ""}
//                       onChange={(e) => setResults({ ...results, [test.id]: e.target.value })}
//                     />
//                   </div>
//                 ))}
//               </div>

//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   onClick={() => {
//                     setShowResultModal(false);
//                     setResults({});
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={completeOrder}
//                   className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
//                 >
//                   Complete Order & Save Results
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import Card from "@/components/laboratory/Card";

// interface LabOrder {
//   id: string;
//   order_id: string;
//   patient_name: string;
//   patient_id: string;
//   tests: Array<{ id: string; name: string; price: number }>;
//   status: "Ordered" | "Collected" | "Completed" | "Cancelled";
//   order_date: string;
//   collected_date?: string;
//   completed_date?: string;
//   results?: Array<{ test_id: string; result: string; entered_at: string }>;
//   created_at?: string;
// }

// export default function SampleCollectionPage() {
//   const [orders, setOrders] = useState<LabOrder[]>([]);
//   const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
//   const [showResultModal, setShowResultModal] = useState(false);
//   const [results, setResults] = useState<{ [key: string]: string }>({});
//   const [loading, setLoading] = useState(true);

//   // ✅ FETCH ORDERS FROM API
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("/api/laboratory/orders?pending=true");
//       const result = await response.json();
      
//       if (result.success) {
//         setOrders(result.data);
//       }
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ MARK AS COLLECTED VIA API
//   const markAsCollected = async (orderId: string) => {
//     const today = new Date().toISOString().split("T")[0];

//     try {
//       const response = await fetch("/api/laboratory/orders", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id: orderId,
//           status: "Collected",
//           collected_date: today,
//         }),
//       });
      
//       const result = await response.json();
      
//       if (!result.success) {
//         throw new Error(result.error);
//       }

//       alert(`✅ Sample collected for order ${orders.find(o => o.id === orderId)?.order_id}`);
//       await fetchOrders();
//     } catch (error) {
//       console.error("Error updating order:", error);
//       alert("Error updating order. Please try again.");
//     }
//   };

//   // ✅ COMPLETE ORDER WITH RESULTS VIA API
//   const completeOrder = async () => {
//     if (!selectedOrder) return;

//     const allTestsHaveResults = selectedOrder.tests.every(
//       (test) => results[test.id]?.trim()
//     );
    
//     if (!allTestsHaveResults) {
//       alert("Please enter results for all tests before completing");
//       return;
//     }

//     const today = new Date().toISOString().split("T")[0];

//     const resultsArray = Object.entries(results).map(([test_id, result]) => ({
//       test_id,
//       result,
//       entered_at: new Date().toISOString(),
//     }));

//     try {
//       const response = await fetch("/api/laboratory/orders", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id: selectedOrder.id,
//           status: "Completed",
//           completed_date: today,
//           results: resultsArray,
//         }),
//       });
      
//       const result = await response.json();
      
//       if (!result.success) {
//         throw new Error(result.error);
//       }

//       alert(`✅ Order ${selectedOrder.order_id} completed successfully! Results have been saved.`);

//       setShowResultModal(false);
//       setResults({});
//       setSelectedOrder(null);
//       await fetchOrders();
//     } catch (error) {
//       console.error("Error saving results:", error);
//       alert("Error saving results. Please try again.");
//     }
//   };

//   const pendingOrders = orders.filter(o => o.status === "Ordered");
//   const collectedOrders = orders.filter(o => o.status === "Collected");

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading samples...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
//         <h1 className="text-2xl font-semibold text-gray-900">Sample Collection</h1>
//         <p className="text-sm text-gray-500 mt-1">Collect samples and enter test results</p>
//       </div>

//       <div className="p-8">
//         {/* Pending Collection Section */}
//         <div className="mb-8">
//           <div className="flex items-center space-x-2 mb-4">
//             <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
//             <h2 className="text-lg font-semibold text-gray-900">Ready for Collection</h2>
//             <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
//               {pendingOrders.length}
//             </span>
//           </div>
//           <div className="space-y-4">
//             {pendingOrders.map((order) => (
//               <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
//                 <div className="flex justify-between items-start">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-900">{order.patient_name}</h3>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Order: {order.order_id} • ID: {order.patient_id} • {order.order_date}
//                     </p>
//                     <div className="flex flex-wrap gap-2 mt-3">
//                       {order.tests.map((test, idx) => (
//                         <span key={idx} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
//                           {test.name}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => markAsCollected(order.id)}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     Mark Collected
//                   </button>
//                 </div>
//               </Card>
//             ))}
//             {pendingOrders.length === 0 && (
//               <Card className="p-8 text-center">
//                 <p className="text-gray-500">No pending collections</p>
//               </Card>
//             )}
//           </div>
//         </div>

//         {/* Collected Section */}
//         <div>
//           <div className="flex items-center space-x-2 mb-4">
//             <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
//             <h2 className="text-lg font-semibold text-gray-900">Ready for Results</h2>
//             <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
//               {collectedOrders.length}
//             </span>
//           </div>
//           <div className="space-y-4">
//             {collectedOrders.map((order) => (
//               <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
//                 <div className="flex justify-between items-start">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-900">{order.patient_name}</h3>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Order: {order.order_id} • Collected: {order.collected_date}
//                     </p>
//                     <div className="flex flex-wrap gap-2 mt-3">
//                       {order.tests.map((test, idx) => (
//                         <span key={idx} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
//                           {test.name}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => {
//                       setSelectedOrder(order);
//                       const existingResults: { [key: string]: string } = {};
//                       order.results?.forEach(r => {
//                         existingResults[r.test_id] = r.result;
//                       });
//                       setResults(existingResults);
//                       setShowResultModal(true);
//                     }}
//                     className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
//                   >
//                     Enter Results
//                   </button>
//                 </div>
//               </Card>
//             ))}
//             {collectedOrders.length === 0 && (
//               <Card className="p-8 text-center">
//                 <p className="text-gray-500">No samples ready for results</p>
//               </Card>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Enter Results Modal */}
//       {showResultModal && selectedOrder && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold text-gray-900">Enter Test Results</h2>
//                 <button
//                   onClick={() => {
//                     setShowResultModal(false);
//                     setResults({});
//                   }}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   ✕
//                 </button>
//               </div>

//               <div className="mb-4 p-4 bg-gray-50 rounded-lg">
//                 <p className="text-sm text-gray-600">
//                   Patient: <span className="font-medium text-gray-900">{selectedOrder.patient_name}</span>
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   Order ID: <span className="font-medium text-gray-900">{selectedOrder.order_id}</span>
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   Collected Date: <span className="font-medium text-gray-900">{selectedOrder.collected_date}</span>
//                 </p>
//               </div>

//               <div className="space-y-4 max-h-96 overflow-y-auto">
//                 {selectedOrder.tests.map((test) => (
//                   <div key={test.id}>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       {test.name}
//                     </label>
//                     <textarea
//                       placeholder="Enter result (e.g., Value: 14.2 g/dL - Normal range: 13.5-17.5)"
//                       rows={3}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//                       value={results[test.id] || ""}
//                       onChange={(e) => setResults({ ...results, [test.id]: e.target.value })}
//                     />
//                   </div>
//                 ))}
//               </div>

//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   onClick={() => {
//                     setShowResultModal(false);
//                     setResults({});
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={completeOrder}
//                   className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
//                 >
//                   Complete Order & Save Results
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
import Card from "@/components/laboratory/Card";

interface LabOrder {
  id: string;
  order_id: string;
  patient_name: string;
  patient_id: string;
  tests: Array<{ id: string; name: string; price: number }>;
  status: "Ordered" | "Collected" | "Completed" | "Cancelled";
  order_date: string;
  collected_date?: string;
  completed_date?: string;
  results?: Array<{ test_id: string; result: string; entered_at: string }>;
  created_at?: string;
}

export default function SampleCollectionPage() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [results, setResults] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // ✅ FETCH ORDERS FROM API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/laboratory/samples");
      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MARK AS COLLECTED VIA API
  const markAsCollected = async (orderId: string) => {
    const today = new Date().toISOString().split("T")[0];

    try {
      const response = await fetch("/api/laboratory/samples", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          status: "Collected",
          collected_date: today,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      alert(`✅ Sample collected for order ${orders.find(o => o.id === orderId)?.order_id}`);
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order. Please try again.");
    }
  };

  // ✅ COMPLETE ORDER WITH RESULTS VIA API
  const completeOrder = async () => {
    if (!selectedOrder) return;

    const allTestsHaveResults = selectedOrder.tests.every(
      (test) => results[test.id]?.trim()
    );
    
    if (!allTestsHaveResults) {
      alert("Please enter results for all tests before completing");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const resultsArray = Object.entries(results).map(([test_id, result]) => ({
      test_id,
      result,
      entered_at: new Date().toISOString(),
    }));

    try {
      const response = await fetch("/api/laboratory/samples", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrder.id,
          status: "Completed",
          completed_date: today,
          results: resultsArray,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      alert(`✅ Order ${selectedOrder.order_id} completed successfully! Results have been saved.`);

      setShowResultModal(false);
      setResults({});
      setSelectedOrder(null);
      await fetchOrders();
    } catch (error) {
      console.error("Error saving results:", error);
      alert("Error saving results. Please try again.");
    }
  };

  const pendingOrders = orders.filter(o => o.status === "Ordered");
  const collectedOrders = orders.filter(o => o.status === "Collected");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading samples...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <h1 className="text-2xl font-semibold text-gray-900">Sample Collection</h1>
        <p className="text-sm text-gray-500 mt-1">Collect samples and enter test results</p>
      </div>

      <div className="p-8">
        {/* Pending Collection Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Ready for Collection</h2>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              {pendingOrders.length}
            </span>
          </div>
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{order.patient_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Order: {order.order_id} • ID: {order.patient_id} • {order.order_date}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {order.tests.map((test, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                          {test.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => markAsCollected(order.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Mark Collected
                  </button>
                </div>
              </Card>
            ))}
            {pendingOrders.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No pending collections</p>
              </Card>
            )}
          </div>
        </div>

        {/* Collected Section */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Ready for Results</h2>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {collectedOrders.length}
            </span>
          </div>
          <div className="space-y-4">
            {collectedOrders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{order.patient_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Order: {order.order_id} • Collected: {order.collected_date}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {order.tests.map((test, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                          {test.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      const existingResults: { [key: string]: string } = {};
                      order.results?.forEach(r => {
                        existingResults[r.test_id] = r.result;
                      });
                      setResults(existingResults);
                      setShowResultModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Enter Results
                  </button>
                </div>
              </Card>
            ))}
            {collectedOrders.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No samples ready for results</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Enter Results Modal */}
      {showResultModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Enter Test Results</h2>
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setResults({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Patient: <span className="font-medium text-gray-900">{selectedOrder.patient_name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Order ID: <span className="font-medium text-gray-900">{selectedOrder.order_id}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Collected Date: <span className="font-medium text-gray-900">{selectedOrder.collected_date}</span>
                </p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedOrder.tests.map((test) => (
                  <div key={test.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {test.name}
                    </label>
                    <textarea
                      placeholder="Enter result (e.g., Value: 14.2 g/dL - Normal range: 13.5-17.5)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={results[test.id] || ""}
                      onChange={(e) => setResults({ ...results, [test.id]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setResults({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={completeOrder}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Complete Order & Save Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}