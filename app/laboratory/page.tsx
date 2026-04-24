


// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Card from "@/components/laboratory/Card";

// export default function LaboratoryDashboard() {
//   const router = useRouter();
//   const [stats, setStats] = useState({
//     totalOrders: 0,
//     pendingCollection: 0,
//     pendingResults: 0,
//     completedToday: 0,
//   });

//   const [recentOrders, setRecentOrders] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("/api/laboratory/dashboard");
//       const result = await response.json();
      
//       if (result.success) {
//         setStats(result.data.stats);
//         setRecentOrders(result.data.recentOrders);
//       }
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusConfig = (status: string) => {
//     const configs: Record<string, { bg: string; text: string; icon: string }> = {
//       Ordered: { bg: "bg-amber-50", text: "text-amber-700", icon: "⏳" },
//       Collected: { bg: "bg-blue-50", text: "text-blue-700", icon: "🧪" },
//       Completed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "✅" },
//       Cancelled: { bg: "bg-red-50", text: "text-red-700", icon: "❌" },
//     };
//     return configs[status] || configs.Ordered;
//   };

//   const navigateTo = (path: string) => {
//     router.push(path);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

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
//                 <p className="text-3xl font-bold text-gray-900">
//                   {stats.totalOrders}
//                 </p>
//                 <p className="text-xs text-green-600 mt-2">All time</p>
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
//                 <p className="text-3xl font-bold text-amber-600">
//                   {stats.pendingCollection}
//                 </p>
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
//                 <p className="text-3xl font-bold text-blue-600">
//                   {stats.pendingResults}
//                 </p>
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
//                 <p className="text-3xl font-bold text-emerald-600">
//                   {stats.completedToday}
//                 </p>
//                 <p className="text-xs text-emerald-600 mt-2">Today's reports</p>
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
//                 {recentOrders.length === 0 ? (
//                   <tr>
//                     <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
//                       No orders found. Create your first order!
//                     </td>
//                   </tr>
//                 ) : (
//                   recentOrders.map((order) => {
//                     const statusConfig = getStatusConfig(order.status);
//                     return (
//                       <tr key={order.id} className="hover:bg-gray-50 transition-colors">
//                         <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_id}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{order.patient_name}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600 text-center">{order.tests?.length || 0}</td>
//                         <td className="px-6 py-4 text-sm font-medium text-gray-900 text-center">₹{order.total_amount}</td>
//                         <td className="px-6 py-4 text-center">
//                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
//                             <span className="mr-1">{statusConfig.icon}</span>
//                             {order.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-500 text-right">{order.order_date}</td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </Card>

//         {/* Quick Actions */}
//         <div>
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <button
//               onClick={() => navigateTo("/laboratory/orders")}
//               className="group text-left p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
//             >
//               <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
//                 <span className="text-2xl">📋</span>
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-1">New Order</h3>
//               <p className="text-sm text-gray-500">Create lab order for patient</p>
//             </button>

//             <button
//               onClick={() => navigateTo("/laboratory/samples")}
//               className="group text-left p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
//             >
//               <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
//                 <span className="text-2xl">🧪</span>
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-1">Sample Collection</h3>
//               <p className="text-sm text-gray-500">Mark samples as collected</p>
//             </button>

//             <button
//               onClick={() => navigateTo("/laboratory/samples")}
//               className="group text-left p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
//             >
//               <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
//                 <span className="text-2xl">📊</span>
//               </div>
//               <h3 className="font-semibold text-gray-900 mb-1">Enter Results</h3>
//               <p className="text-sm text-gray-500">Add test results</p>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, LABARATORY_FEATURES } from "@/lib/feature";
import Card from "@/components/laboratory/Card";

export default function LaboratoryDashboard() {
  const router = useRouter();
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingCollection: 0,
    pendingResults: 0,
    completedToday: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if Dashboard feature is enabled
  const isDashboardEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.LABARATORY,
    LABARATORY_FEATURES.DASHBOARD
  );

  // Redirect if feature is not enabled
  useEffect(() => {
    if (!tenantLoading && !isDashboardEnabled) {
      router.push("/unauthorized");
    }
  }, [tenantLoading, isDashboardEnabled, router]);

  // Fetch dashboard data only if feature is enabled
  useEffect(() => {
    if (isDashboardEnabled) {
      fetchDashboardData();
    }
  }, [isDashboardEnabled]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/laboratory/dashboard");
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data.stats);
        setRecentOrders(result.data.recentOrders);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
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

  const navigateTo = (path: string) => {
    router.push(path);
  };

  // Show loading state while checking tenant and feature flags
  if (tenantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized if feature is not enabled
  if (!isDashboardEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            Laboratory Dashboard feature is not enabled for {tenant?.name}.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Laboratory Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of laboratory operations</p>
          {tenant && (
            <p className="text-xs text-gray-400 mt-1">
              Tenant: {tenant.name}
            </p>
          )}
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
                  {stats.totalOrders}
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
                  {stats.pendingCollection}
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
                  {stats.pendingResults}
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
                  {stats.completedToday}
                </p>
               <p className="text-xs text-emerald-600 mt-2">Todays reports</p>
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
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
  No orders found. Create a new order!
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

        {/* Quick Actions */}
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