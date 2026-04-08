
// "use client";

// import { useState, useEffect } from "react";
// import Card from "@/components/laboratory/Card";

// interface LabTest {
//   id: string;
//   name: string;
//   code: string;
//   price: number;
//   category: string;
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
// }

// export default function LabOrdersPage() {
//   const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
//   const [showOrderModal, setShowOrderModal] = useState(false);
//   const [selectedTests, setSelectedTests] = useState<string[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedPatient, setSelectedPatient] = useState("");
//   const [selectedVisitType, setSelectedVisitType] = useState<"OP" | "IP">("OP");
//   const [availableTests, setAvailableTests] = useState<LabTest[]>([]);
//   const [orders, setOrders] = useState<LabOrder[]>([]);

//   // Load data from localStorage
//   useEffect(() => {
//     const savedTests = localStorage.getItem('lab_tests');
//     if (savedTests) {
//       const tests = JSON.parse(savedTests);
//       setAvailableTests(tests.filter((t: any) => t.active).map((t: any) => ({
//         id: t.id,
//         name: t.test_name,
//         code: t.test_code,
//         price: t.price,
//         category: t.category,
//         active: t.active
//       })));
//     }

//     const savedOrders = localStorage.getItem('lab_orders');
//     if (savedOrders) {
//       setOrders(JSON.parse(savedOrders));
//     }
//   }, []);

//   const generateOrderId = () => {
//     const year = new Date().getFullYear();
//     const count = orders.length + 1;
//     return `LAB-${year}-${String(count).padStart(3, '0')}`;
//   };

//   const handleOrderTest = () => {
//     if (!selectedPatient || selectedTests.length === 0) {
//       alert('Please select a patient and at least one test');
//       return;
//     }

//     const patients = {
//       '1': { name: 'John Doe', id: 'P12345', visit: 'OP-2026-001' },
//       '2': { name: 'Jane Smith', id: 'P12346', visit: 'IP-2026-015' },
//       '3': { name: 'Robert Johnson', id: 'P12347', visit: 'OP-2026-023' },
//     };

//     const patient = patients[selectedPatient as keyof typeof patients];
//     const selectedTestsData = availableTests.filter(t => selectedTests.includes(t.id));
//     const totalAmount = selectedTestsData.reduce((sum, t) => sum + t.price, 0);

//     const newOrder: LabOrder = {
//       id: Date.now().toString(),
//       order_id: generateOrderId(),
//       patient_id: patient.id,
//       patient_name: patient.name,
//       visit_type: selectedVisitType,
//       visit_id: patient.visit,
//       tests: selectedTestsData.map(t => ({ id: t.id, name: t.name, price: t.price })),
//       total_amount: totalAmount,
//       status: "Ordered",
//       order_date: new Date().toISOString().split("T")[0],
//       billing_entry_id: `BILL-${Date.now()}`
//     };

//     const updatedOrders = [newOrder, ...orders];
//     setOrders(updatedOrders);
//     localStorage.setItem('lab_orders', JSON.stringify(updatedOrders));
    
//     // Show billing confirmation
//     alert(`✅ Order Created Successfully!\n\nOrder ID: ${newOrder.order_id}\nTotal Amount: ₹${totalAmount}\nBilling Entry: ${newOrder.billing_entry_id}\n\nAmount added to patient's account.`);
    
//     setShowOrderModal(false);
//     setSelectedTests([]);
//     setSelectedPatient("");
//   };

//   const cancelOrder = (orderId: string) => {
//     if (confirm('Are you sure you want to cancel this order? This will reverse the billing charge.')) {
//       const updatedOrders = orders.map(order => 
//         order.id === orderId 
//           ? { ...order, status: "Cancelled" as const }
//           : order
//       );
//       setOrders(updatedOrders);
//       localStorage.setItem('lab_orders', JSON.stringify(updatedOrders));
//       alert(`✅ Order cancelled. Billing charge of ₹${orders.find(o => o.id === orderId)?.total_amount} has been reversed.`);
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     const configs = {
//       Ordered: "bg-amber-50 text-amber-700 border-amber-200",
//       Collected: "bg-blue-50 text-blue-700 border-blue-200",
//       Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
//       Cancelled: "bg-red-50 text-red-700 border-red-200",
//     };
//     return configs[status as keyof typeof configs] || configs.Ordered;
//   };

//   const filteredOrders = orders.filter(order => 
//     activeTab === "pending" ? order.status === "Ordered" || order.status === "Collected" : true
//   );

//   const selectedTestsData = availableTests.filter(t => selectedTests.includes(t.id));
//   const totalAmount = selectedTestsData.reduce((sum, t) => sum + t.price, 0);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900">Lab Orders</h1>
//             <p className="text-sm text-gray-500 mt-1">Create and manage laboratory orders</p>
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
//                     <h3 className="text-lg font-semibold text-gray-900">{order.patient_name}</h3>
//                     <span className="text-sm text-gray-500">ID: {order.patient_id}</span>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
//                       {order.status}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-500 mb-3">
//                     {order.order_id} • {order.visit_type} Visit: {order.visit_id} • {order.order_date}
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {order.tests.map((test, idx) => (
//                       <span key={idx} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
//                         {test.name} (₹{test.price})
//                       </span>
//                     ))}
//                   </div>
//                   {order.billing_entry_id && (
//                     <p className="text-xs text-gray-400 mt-2">Billing ID: {order.billing_entry_id}</p>
//                   )}
//                 </div>
//                 <div className="text-right">
//                   <p className="text-2xl font-bold text-gray-900">₹{order.total_amount}</p>
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
//                 <h2 className="text-xl font-semibold text-gray-900">New Lab Order</h2>
//                 <button
//                   onClick={() => {
//                     setShowOrderModal(false);
//                     setSelectedTests([]);
//                     setSelectedPatient("");
//                   }}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   ✕
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Select Patient *
//                   </label>
//                   <select
//                     value={selectedPatient}
//                     onChange={(e) => setSelectedPatient(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//                   >
//                     <option value="">Select Patient</option>
//                     <option value="1">John Doe (OP-2026-001)</option>
//                     <option value="2">Jane Smith (IP-2026-015)</option>
//                     <option value="3">Robert Johnson (OP-2026-023)</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Visit Type *
//                   </label>
//                   <div className="flex space-x-4">
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         value="OP"
//                         checked={selectedVisitType === "OP"}
//                         onChange={(e) => setSelectedVisitType(e.target.value as "OP")}
//                         className="mr-2"
//                       />
//                       OP Visit
//                     </label>
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         value="IP"
//                         checked={selectedVisitType === "IP"}
//                         onChange={(e) => setSelectedVisitType(e.target.value as "IP")}
//                         className="mr-2"
//                       />
//                       IP Admission
//                     </label>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Select Tests *
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Search tests..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-3"
//                   />
//                   <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
//                     {availableTests
//                       .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
//                       .map((test) => (
//                         <label key={test.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
//                           <div className="flex items-center flex-1">
//                             <input
//                               type="checkbox"
//                               checked={selectedTests.includes(test.id)}
//                               onChange={(e) => {
//                                 if (e.target.checked) {
//                                   setSelectedTests([...selectedTests, test.id]);
//                                 } else {
//                                   setSelectedTests(selectedTests.filter(id => id !== test.id));
//                                 }
//                               }}
//                               className="mr-3"
//                             />
//                             <div>
//                               <p className="text-sm font-medium text-gray-900">{test.name}</p>
//                               <p className="text-xs text-gray-500">{test.code}</p>
//                             </div>
//                           </div>
//                           <span className="text-sm font-medium text-gray-700">₹{test.price}</span>
//                         </label>
//                       ))}
//                   </div>
//                 </div>

//                 {selectedTests.length > 0 && (
//                   <div className="border-t border-gray-200 pt-4">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-sm font-medium text-gray-700">Selected Tests:</span>
//                       <span className="text-sm text-gray-500">{selectedTests.length} items</span>
//                     </div>
//                     <div className="space-y-1 mb-4">
//                       {selectedTestsData.map((test) => (
//                         <div key={test.id} className="flex justify-between text-sm">
//                           <span className="text-gray-600">{test.name}</span>
//                           <span className="text-gray-900">₹{test.price}</span>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="flex justify-between items-center pt-2 border-t border-gray-200">
//                       <span className="font-semibold text-gray-900">Total Amount</span>
//                       <span className="text-xl font-bold text-primary">₹{totalAmount}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   onClick={() => {
//                     setShowOrderModal(false);
//                     setSelectedTests([]);
//                     setSelectedPatient("");
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
import Card from "@/components/laboratory/Card";
import { supabase } from "@/lib/supabaseClient";

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
  created_at?: string;
}

export default function LabOrdersPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedVisitType, setSelectedVisitType] = useState<"OP" | "IP">("OP");
  const [availableTests, setAvailableTests] = useState<LabTest[]>([]);
  const [orders, setOrders] = useState<LabOrder[]>([]);

  // ✅ FETCH FROM SUPABASE
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch active tests
    const { data: testsData, error: testsError } = await supabase
      .from("lab_tests")
      .select("*")
      .eq("active", true)
      .order("test_name", { ascending: true });

    if (testsError) {
      console.error("Error fetching tests:", testsError);
    } else {
      // Map to expected format
      const formattedTests = (testsData || []).map((t) => ({
        id: t.id,
        test_name: t.test_name,
        test_code: t.test_code,
        category: t.category,
        price: t.price,
        active: t.active,
      }));
      setAvailableTests(formattedTests);
    }

    // Fetch orders
    const { data: ordersData, error: ordersError } = await supabase
      .from("lab_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
    } else {
      setOrders(ordersData || []);
    }
  };

  // ✅ CREATE ORDER IN SUPABASE
  const handleOrderTest = async () => {
    if (!selectedPatient || selectedTests.length === 0) {
      alert("Please select a patient and at least one test");
      return;
    }

    const patients: Record<string, { name: string; id: string; visit: string }> = {
      "1": { name: "John Doe", id: "P12345", visit: "OP-2026-001" },
      "2": { name: "Jane Smith", id: "P12346", visit: "IP-2026-015" },
      "3": { name: "Robert Johnson", id: "P12347", visit: "OP-2026-023" },
    };

    const patient = patients[selectedPatient];
    const selectedTestsData = availableTests.filter((t) =>
      selectedTests.includes(t.id)
    );

    const totalAmount = selectedTestsData.reduce((sum, t) => sum + t.price, 0);

    // Generate order ID
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000);
    const orderId = `LAB-${year}-${String(randomNum).padStart(3, "0")}`;

    const today = new Date().toISOString().split("T")[0];

    // Map tests to the format expected by the database
    const testsForDb = selectedTestsData.map((t) => ({
      id: t.id,
      name: t.test_name,
      price: t.price,
    }));

    const { error } = await supabase.from("lab_orders").insert([
      {
        order_id: orderId,
        patient_id: patient.id,
        patient_name: patient.name,
        visit_type: selectedVisitType,
        visit_id: patient.visit,
        tests: testsForDb,
        total_amount: totalAmount,
        status: "Ordered",
        order_date: today,
        billing_entry_id: `BILL-${Date.now()}`,
      },
    ]);

    if (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Please try again.");
      return;
    }

    alert(`✅ Order Created Successfully!\n\nOrder ID: ${orderId}\nTotal Amount: ₹${totalAmount}\nAmount added to patient's account.`);

    // Refresh data
    await fetchData();

    // Reset modal state
    setShowOrderModal(false);
    setSelectedTests([]);
    setSelectedPatient("");
    setSelectedVisitType("OP");
  };

  // ✅ CANCEL ORDER IN SUPABASE
  const cancelOrder = async (orderId: string) => {
    const orderToCancel = orders.find((o) => o.id === orderId);
    if (!orderToCancel) return;

    if (
      confirm(
        `Are you sure you want to cancel this order? This will reverse the billing charge of ₹${orderToCancel.total_amount}.`
      )
    ) {
      const { error } = await supabase
        .from("lab_orders")
        .update({ status: "Cancelled" })
        .eq("id", orderId);

      if (error) {
        console.error("Error cancelling order:", error);
        alert("Error cancelling order. Please try again.");
        return;
      }

      alert(`✅ Order cancelled. Billing charge of ₹${orderToCancel.total_amount} has been reversed.`);

      // Refresh data
      await fetchData();
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, string> = {
      Ordered: "bg-amber-50 text-amber-700 border-amber-200",
      Collected: "bg-blue-50 text-blue-700 border-blue-200",
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Cancelled: "bg-red-50 text-red-700 border-red-200",
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
  const totalAmount = selectedTestsData.reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lab Orders</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage laboratory orders
            </p>
          </div>
          <button
            onClick={() => setShowOrderModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            + New Order
          </button>
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Orders
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.patient_name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ID: {order.patient_id}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {order.order_id} • {order.visit_type} Visit: {order.visit_id} •{" "}
                    {order.order_date}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.tests.map((test, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600"
                      >
                        {test.name} (₹{test.price})
                      </span>
                    ))}
                  </div>
                  {order.billing_entry_id && (
                    <p className="text-xs text-gray-400 mt-2">
                      Billing ID: {order.billing_entry_id}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{order.total_amount}
                  </p>
                  {order.status !== "Completed" && order.status !== "Cancelled" && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {filteredOrders.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No orders found</p>
            </Card>
          )}
        </div>
      </div>

      {/* New Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  New Lab Order
                </h2>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedTests([]);
                    setSelectedPatient("");
                    setSelectedVisitType("OP");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Patient *
                  </label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Patient</option>
                    <option value="1">John Doe (OP-2026-001)</option>
                    <option value="2">Jane Smith (IP-2026-015)</option>
                    <option value="3">Robert Johnson (OP-2026-023)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visit Type *
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="OP"
                        checked={selectedVisitType === "OP"}
                        onChange={(e) =>
                          setSelectedVisitType(e.target.value as "OP")
                        }
                        className="mr-2"
                      />
                      OP Visit
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="IP"
                        checked={selectedVisitType === "IP"}
                        onChange={(e) =>
                          setSelectedVisitType(e.target.value as "IP")
                        }
                        className="mr-2"
                      />
                      IP Admission
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Tests *
                  </label>
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-3"
                  />
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {availableTests
                      .filter((t) =>
                        t.test_name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((test) => (
                        <label
                          key={test.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
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
                              className="mr-3"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {test.test_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {test.test_code}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            ₹{test.price}
                          </span>
                        </label>
                      ))}
                    {availableTests.length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        No active tests found. Please add tests in the Test Catalog.
                      </p>
                    )}
                  </div>
                </div>

                {selectedTests.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Selected Tests:
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedTests.length} items
                      </span>
                    </div>
                    <div className="space-y-1 mb-4">
                      {selectedTestsData.map((test) => (
                        <div key={test.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{test.test_name}</span>
                          <span className="text-gray-900">₹{test.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-primary">
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setSelectedTests([]);
                    setSelectedPatient("");
                    setSelectedVisitType("OP");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrderTest}
                  disabled={!selectedPatient || selectedTests.length === 0}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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