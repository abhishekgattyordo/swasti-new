
// "use client";

// import { useState } from "react";
// import Card from "@/components/laboratory/Card";

// export default function LaboratoryDashboard() {
//   const [stats] = useState({
//     totalOrders: 124,
//     pendingCollection: 8,
//     pendingResults: 5,
//     completedToday: 12,
//   });

//   const [recentOrders] = useState([
//     { id: "LAB-001", patient: "John Doe", tests: 2, status: "Ordered", date: "2026-03-31", amount: 650 },
//     { id: "LAB-002", patient: "Jane Smith", tests: 1, status: "Collected", date: "2026-03-31", amount: 200 },
//     { id: "LAB-003", patient: "Robert Johnson", tests: 3, status: "Completed", date: "2026-03-30", amount: 1200 },
//   ]);

//   const getStatusConfig = (status: string) => {
//     const configs = {
//       Ordered: { bg: "bg-amber-50", text: "text-amber-700", icon: "⏳" },
//       Collected: { bg: "bg-blue-50", text: "text-blue-700", icon: "🧪" },
//       Completed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "✅" },
//     };
//     return configs[status as keyof typeof configs] || configs.Ordered;
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Laboratory Dashboard</h1>
//           <p className="text-sm text-gray-500 mt-1">Overview of laboratory operations</p>
//         </div>
//       </div>

//       <div className="p-8">
//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <Card className="p-6 hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
//                 <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
//                 <p className="text-xs text-green-600 mt-2">+12% from last month</p>
//               </div>
//               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                 <span className="text-2xl">📋</span>
//               </div>
//             </div>
//           </Card>

//           <Card className="p-6 hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 mb-1">Pending Collection</p>
//                 <p className="text-3xl font-bold text-amber-600">{stats.pendingCollection}</p>
//                 <p className="text-xs text-gray-500 mt-2">Ready for collection</p>
//               </div>
//               <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
//                 <span className="text-2xl">🧪</span>
//               </div>
//             </div>
//           </Card>

//           <Card className="p-6 hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 mb-1">Pending Results</p>
//                 <p className="text-3xl font-bold text-blue-600">{stats.pendingResults}</p>
//                 <p className="text-xs text-gray-500 mt-2">Awaiting results entry</p>
//               </div>
//               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                 <span className="text-2xl">📊</span>
//               </div>
//             </div>
//           </Card>

//           <Card className="p-6 hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-500 mb-1">Completed Today</p>
//                 <p className="text-3xl font-bold text-emerald-600">{stats.completedToday}</p>
//                 <p className="text-xs text-emerald-600 mt-2">+3 from yesterday</p>
//               </div>
//               <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
//                 <span className="text-2xl">✅</span>
//               </div>
//             </div>
//           </Card>
//         </div>

//         {/* Recent Orders Table */}
//         <Card className="overflow-hidden mb-8">
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//             <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
//                   <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
//                   <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
//                   <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                   <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {recentOrders.map((order) => {
//                   const statusConfig = getStatusConfig(order.status);
//                   return (
//                     <tr key={order.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
//                       <td className="px-6 py-4 text-sm text-gray-600">{order.patient}</td>
//                       <td className="px-6 py-4 text-sm text-gray-600 text-center">{order.tests}</td>
//                       <td className="px-6 py-4 text-sm font-medium text-gray-900 text-center">₹{order.amount}</td>
//                       <td className="px-6 py-4 text-center">
//                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
//                           <span className="mr-1">{statusConfig.icon}</span>
//                           {order.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-500 text-right">{order.date}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </Card>

//         {/* Quick Actions */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
//             <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
//               <span className="text-2xl">📋</span>
//             </div>
//             <h3 className="font-semibold text-gray-900 mb-1">New Order</h3>
//             <p className="text-sm text-gray-500">Create lab order for patient</p>
//           </div>

//           <div className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
//             <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
//               <span className="text-2xl">🧪</span>
//             </div>
//             <h3 className="font-semibold text-gray-900 mb-1">Sample Collection</h3>
//             <p className="text-sm text-gray-500">Mark samples as collected</p>
//           </div>

//           <div className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer">
//             <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
//               <span className="text-2xl">📊</span>
//             </div>
//             <h3 className="font-semibold text-gray-900 mb-1">Enter Results</h3>
//             <p className="text-sm text-gray-500">Add test results</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/laboratory/Card";
import { supabase } from "@/lib/supabaseClient";

export default function LaboratoryDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingCollection: 0,
    pendingResults: 0,
    completedToday: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    // Fetch all orders
    const { data, error } = await supabase
      .from("lab_orders")
      .select("*");

    if (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const totalOrders = data?.length || 0;
    const pendingCollection = data?.filter((o: any) => o.status === "Ordered").length || 0;
    const pendingResults = data?.filter((o: any) => o.status === "Collected").length || 0;
    const completedToday = data?.filter(
      (o: any) => o.status === "Completed" && o.completed_date === today
    ).length || 0;

    setStats({
      totalOrders,
      pendingCollection,
      pendingResults,
      completedToday,
    });

    // Recent Orders (last 5)
    const recent = (data || [])
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);

    setRecentOrders(recent);
    setLoading(false);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: string }> = {
      Ordered: { bg: "bg-amber-50", text: "text-amber-700", icon: "⏳" },
      Collected: { bg: "bg-blue-50", text: "text-blue-700", icon: "🧪" },
      Completed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "✅" },
      Cancelled: { bg: "bg-red-50", text: "text-red-700", icon: "❌" },
    };
    return configs[status] || configs.Ordered;
  };

  // Navigation handlers
  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Laboratory Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of laboratory operations</p>
        </div>
      </div>

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalOrders}
                </p>
                <p className="text-xs text-green-600 mt-2">All time</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pending Collection</p>
                <p className="text-3xl font-bold text-amber-600">
                  {loading ? "..." : stats.pendingCollection}
                </p>
                <p className="text-xs text-gray-500 mt-2">Ready for collection</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🧪</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pending Results</p>
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? "..." : stats.pendingResults}
                </p>
                <p className="text-xs text-gray-500 mt-2">Awaiting results entry</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Completed Today</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {loading ? "..." : stats.completedToday}
                </p>
                <p className="text-xs text-emerald-600 mt-2">Today's reports</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card className="overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No orders found. Create your first order!
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.patient_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-center">{order.tests?.length || 0}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-center">₹{order.total_amount}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            <span className="mr-1">{statusConfig.icon}</span>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right">{order.order_date}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions - NOW WORKING */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigateTo("/laboratory/orders")}
              className="group text-left p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">New Order</h3>
              <p className="text-sm text-gray-500">Create lab order for patient</p>
            </button>

            <button
              onClick={() => navigateTo("/laboratory/samples")}
              className="group text-left p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                <span className="text-2xl">🧪</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Sample Collection</h3>
              <p className="text-sm text-gray-500">Mark samples as collected</p>
            </button>

            <button
              onClick={() => navigateTo("/laboratory/samples")}
              className="group text-left p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Enter Results</h3>
              <p className="text-sm text-gray-500">Add test results</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}