

// "use client";

// import { useState, useEffect } from "react";
// import Card from "@/components/laboratory/Card";
// import { supabase } from "@/lib/supabaseClient";

// interface CompletedReport {
//   id: string;
//   order_id: string;
//   patient_name: string;
//   patient_id: string;
//   tests: Array<{ id: string; name: string; price: number; result?: string }>;
//   total_amount: number;
//   completed_date: string;
//   collected_date?: string;
//   billing_entry_id?: string;
// }

// export default function ReportsPage() {
//   const [selectedReport, setSelectedReport] = useState<CompletedReport | null>(null);
//   const [filter, setFilter] = useState("");
//   const [reports, setReports] = useState<CompletedReport[]>([]);
//   const [viewMode, setViewMode] = useState<"table" | "cards">("table");

//   // ✅ FETCH COMPLETED REPORTS FROM SUPABASE
//   useEffect(() => {
//     fetchReports();
//   }, []);

//   const fetchReports = async () => {
//     const { data, error } = await supabase
//       .from("lab_orders")
//       .select("*")
//       .eq("status", "Completed")
//       .order("completed_date", { ascending: false });

//     if (error) {
//       console.error("Error fetching reports:", error);
//       return;
//     }

//     const formattedReports = (data || []).map((order: any) => ({
//       id: order.id,
//       order_id: order.order_id,
//       patient_name: order.patient_name,
//       patient_id: order.patient_id,
//       tests: order.tests.map((test: any) => ({
//         id: test.id,
//         name: test.name,
//         price: test.price,
//         result:
//           order.results?.find((r: any) => r.test_id === test.id)?.result ||
//           "Result not available",
//       })),
//       total_amount: order.total_amount,
//       completed_date: order.completed_date,
//       collected_date: order.collected_date,
//       billing_entry_id: order.billing_entry_id,
//     }));

//     setReports(formattedReports);
//   };

//   const filteredReports = filter
//     ? reports.filter((r) =>
//         r.patient_name.toLowerCase().includes(filter.toLowerCase()) ||
//         r.order_id.toLowerCase().includes(filter.toLowerCase()) ||
//         r.patient_id.toLowerCase().includes(filter.toLowerCase())
//       )
//     : reports;

//   const handlePrint = () => {
//     window.print();
//   };

//   const exportToCSV = () => {
//     const headers = ["Order ID", "Patient Name", "Patient ID", "Tests", "Total Amount", "Completed Date", "Collected Date", "Billing ID"];
//     const csvData = filteredReports.map(report => [
//       report.order_id,
//       report.patient_name,
//       report.patient_id,
//       report.tests.map(t => t.name).join("; "),
//       report.total_amount,
//       report.completed_date,
//       report.collected_date || "-",
//       report.billing_entry_id || "-"
//     ]);
    
//     const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `lab_reports_${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
//         <div className="flex justify-between items-center flex-wrap gap-4">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900">Lab Reports</h1>
//             <p className="text-sm text-gray-500 mt-1">View completed test reports</p>
//           </div>
//           <div className="flex items-center space-x-3">
//             {/* View Toggle */}
//             <div className="flex bg-gray-100 rounded-lg p-1">
//               <button
//                 onClick={() => setViewMode("table")}
//                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
//                   viewMode === "table" 
//                     ? "bg-white text-primary shadow-sm" 
//                     : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 📋 Table View
//               </button>
//               <button
//                 onClick={() => setViewMode("cards")}
//                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
//                   viewMode === "cards" 
//                     ? "bg-white text-primary shadow-sm" 
//                     : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 🃏 Card View
//               </button>
//             </div>
            
//             {/* Export Button */}
//             <button
//               onClick={exportToCSV}
//               className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
//             >
//               📥 Export CSV
//             </button>
//           </div>
//         </div>
        
//         {/* Search Bar */}
//         <div className="mt-4">
//           <input
//             type="text"
//             placeholder="Search by patient name, order ID, or patient ID..."
//             className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="p-8">
//         {/* Table View */}
//         {viewMode === "table" && (
//           <Card className="overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b border-gray-200">
//                   <tr>
//                     <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
//                     <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
//                     <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
//                     <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
//                     <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                     <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
//                     <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filteredReports.length === 0 ? (
//                     <tr>
//                       <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
//                         No completed reports found
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredReports.map((report) => (
//                       <tr key={report.id} className="hover:bg-gray-50 transition-colors">
//                         <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">
//                           {report.order_id}
//                         </td>
//                         <td className="px-6 py-4 text-sm font-medium text-gray-900">
//                           {report.patient_name}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-500">
//                           {report.patient_id}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-600">
//                           <div className="flex flex-wrap gap-1">
//                             {report.tests.slice(0, 2).map((test, idx) => (
//                               <span key={idx} className="text-xs">
//                                 {test.name}{idx < Math.min(report.tests.length, 2) - 1 ? "," : ""}
//                               </span>
//                             ))}
//                             {report.tests.length > 2 && (
//                               <span className="text-xs text-gray-400">
//                                 +{report.tests.length - 2} more
//                               </span>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
//                           ₹{report.total_amount}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-500 text-center">
//                           {report.completed_date}
//                         </td>
//                         <td className="px-6 py-4 text-center">
//                           <button
//                             onClick={() => setSelectedReport(report)}
//                             className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors text-xs font-medium"
//                           >
//                             View Details
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
            
//             {/* Summary Row */}
//             {filteredReports.length > 0 && (
//               <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">
//                     Total Reports: <span className="font-semibold text-gray-900">{filteredReports.length}</span>
//                   </span>
//                   <span className="text-sm text-gray-600">
//                     Total Revenue: <span className="font-semibold text-primary">
//                       ₹{filteredReports.reduce((sum, r) => sum + r.total_amount, 0).toLocaleString()}
//                     </span>
//                   </span>
//                 </div>
//               </div>
//             )}
//           </Card>
//         )}

//         {/* Card View (Original) */}
//         {viewMode === "cards" && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {filteredReports.map((report) => (
//               <Card
//                 key={report.id}
//                 className="overflow-hidden hover:shadow-lg transition-all duration-300"
//               >
//                 <div className="p-6">
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900">
//                         {report.patient_name}
//                       </h3>
//                       <p className="text-sm text-gray-500 mt-1">
//                         {report.order_id} • {report.patient_id}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm text-gray-500">
//                         Completed: {report.completed_date}
//                       </p>
//                       <p className="text-lg font-bold text-primary mt-1">
//                         ₹{report.total_amount}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="space-y-3 mb-4">
//                     {report.tests.slice(0, 3).map((test, idx) => (
//                       <div key={idx} className="border-l-2 border-primary pl-3">
//                         <p className="text-sm font-medium text-gray-900">
//                           {test.name}
//                         </p>
//                         <p className="text-xs text-gray-600 mt-1 line-clamp-2">
//                           {test.result || "No result recorded"}
//                         </p>
//                       </div>
//                     ))}
//                     {report.tests.length > 3 && (
//                       <p className="text-xs text-gray-400">
//                         +{report.tests.length - 3} more tests
//                       </p>
//                     )}
//                   </div>

//                   <button
//                     onClick={() => setSelectedReport(report)}
//                     className="w-full mt-2 px-4 py-2 bg-gray-50 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors text-sm font-medium"
//                   >
//                     View Full Report
//                   </button>
//                 </div>
//               </Card>
//             ))}
            
//             {filteredReports.length === 0 && (
//               <Card className="p-8 text-center col-span-2">
//                 <p className="text-gray-500">No completed reports found</p>
//               </Card>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Report Details Modal - Same as before */}
//       {selectedReport && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="p-8">
//               <div className="flex justify-between items-start mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     Laboratory Report
//                   </h2>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Generated on {selectedReport.completed_date}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setSelectedReport(null)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   ✕
//                 </button>
//               </div>

//               {/* Header */}
//               <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 mb-6">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">
//                       Patient Name
//                     </p>
//                     <p className="text-base font-semibold text-gray-900 mt-1">
//                       {selectedReport.patient_name}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">
//                       Patient ID
//                     </p>
//                     <p className="text-base font-semibold text-gray-900 mt-1">
//                       {selectedReport.patient_id}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">
//                       Order ID
//                     </p>
//                     <p className="text-base font-semibold text-gray-900 mt-1">
//                       {selectedReport.order_id}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">
//                       Report Date
//                     </p>
//                     <p className="text-base font-semibold text-gray-900 mt-1">
//                       {selectedReport.completed_date}
//                     </p>
//                   </div>
//                   {selectedReport.collected_date && (
//                     <div>
//                       <p className="text-xs text-gray-500 uppercase tracking-wider">
//                         Sample Collected
//                       </p>
//                       <p className="text-base font-semibold text-gray-900 mt-1">
//                         {selectedReport.collected_date}
//                       </p>
//                     </div>
//                   )}
//                   {selectedReport.billing_entry_id && (
//                     <div>
//                       <p className="text-xs text-gray-500 uppercase tracking-wider">
//                         Billing Reference
//                       </p>
//                       <p className="text-base font-semibold text-gray-900 mt-1">
//                         {selectedReport.billing_entry_id}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Test Results */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   Test Results
//                 </h3>
//                 <div className="space-y-4">
//                   {selectedReport.tests.map((test, idx) => (
//                     <div
//                       key={idx}
//                       className="border border-gray-200 rounded-lg overflow-hidden"
//                     >
//                       <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
//                         <p className="font-semibold text-gray-900">
//                           {test.name}
//                         </p>
//                         <p className="text-sm font-medium text-gray-700">
//                           ₹{test.price}
//                         </p>
//                       </div>
//                       <div className="p-4">
//                         <p className="text-gray-700 whitespace-pre-wrap">
//                           {test.result || "Result not available"}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="border-t border-gray-200 pt-4">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="text-sm text-gray-500">Authorized by</p>
//                     <p className="text-sm font-medium text-gray-900">
//                       Lab Technician
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-gray-500">Total Amount</p>
//                     <p className="text-xl font-bold text-primary">
//                       ₹{selectedReport.total_amount}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   onClick={() => setSelectedReport(null)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Close
//                 </button>
//                 <button
//                   onClick={handlePrint}
//                   className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
//                 >
//                   Print Report
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

interface CompletedReport {
  id: string;
  order_id: string;
  patient_name: string;
  patient_id: string;
  tests: Array<{ id: string; name: string; price: number; result?: string }>;
  total_amount: number;
  completed_date: string;
  collected_date?: string;
  billing_entry_id?: string;
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<CompletedReport | null>(null);
  const [filter, setFilter] = useState("");
  const [reports, setReports] = useState<CompletedReport[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [loading, setLoading] = useState(true);

  // ✅ FETCH COMPLETED REPORTS FROM API
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/laboratory/reports");
      const result = await response.json();
      
      if (result.success) {
        setReports(result.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = filter
    ? reports.filter((r) =>
        r.patient_name.toLowerCase().includes(filter.toLowerCase()) ||
        r.order_id.toLowerCase().includes(filter.toLowerCase()) ||
        r.patient_id.toLowerCase().includes(filter.toLowerCase())
      )
    : reports;

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    const headers = ["Order ID", "Patient Name", "Patient ID", "Tests", "Total Amount", "Completed Date", "Collected Date", "Billing ID"];
    const csvData = filteredReports.map(report => [
      report.order_id,
      report.patient_name,
      report.patient_id,
      report.tests.map(t => t.name).join("; "),
      report.total_amount,
      report.completed_date,
      report.collected_date || "-",
      report.billing_entry_id || "-"
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lab_reports_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lab Reports</h1>
            <p className="text-sm text-gray-500 mt-1">View completed test reports</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "table" 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📋 Table View
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "cards" 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🃏 Card View
              </button>
            </div>
            
            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by patient name, order ID, or patient ID..."
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="p-8">
        {/* Table View */}
        {viewMode === "table" && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No completed reports found
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">
                          {report.order_id}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {report.patient_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {report.patient_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {report.tests.slice(0, 2).map((test, idx) => (
                              <span key={idx} className="text-xs">
                                {test.name}{idx < Math.min(report.tests.length, 2) - 1 ? "," : ""}
                              </span>
                            ))}
                            {report.tests.length > 2 && (
                              <span className="text-xs text-gray-400">
                                +{report.tests.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                          ₹{report.total_amount}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-center">
                          {report.completed_date}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors text-xs font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Summary Row */}
            {filteredReports.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Total Reports: <span className="font-semibold text-gray-900">{filteredReports.length}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Total Revenue: <span className="font-semibold text-primary">
                      ₹{filteredReports.reduce((sum, r) => sum + r.total_amount, 0).toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Card View */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => (
              <Card
                key={report.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.patient_name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {report.order_id} • {report.patient_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Completed: {report.completed_date}
                      </p>
                      <p className="text-lg font-bold text-primary mt-1">
                        ₹{report.total_amount}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {report.tests.slice(0, 3).map((test, idx) => (
                      <div key={idx} className="border-l-2 border-primary pl-3">
                        <p className="text-sm font-medium text-gray-900">
                          {test.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {test.result || "No result recorded"}
                        </p>
                      </div>
                    ))}
                    {report.tests.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{report.tests.length - 3} more tests
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedReport(report)}
                    className="w-full mt-2 px-4 py-2 bg-gray-50 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    View Full Report
                  </button>
                </div>
              </Card>
            ))}
            
            {filteredReports.length === 0 && (
              <Card className="p-8 text-center col-span-2">
                <p className="text-gray-500">No completed reports found</p>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Laboratory Report
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Generated on {selectedReport.completed_date}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </p>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedReport.patient_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Patient ID
                    </p>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedReport.patient_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Order ID
                    </p>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedReport.order_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Report Date
                    </p>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedReport.completed_date}
                    </p>
                  </div>
                  {selectedReport.collected_date && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Sample Collected
                      </p>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {selectedReport.collected_date}
                      </p>
                    </div>
                  )}
                  {selectedReport.billing_entry_id && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Billing Reference
                      </p>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {selectedReport.billing_entry_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Results */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Test Results
                </h3>
                <div className="space-y-4">
                  {selectedReport.tests.map((test, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <p className="font-semibold text-gray-900">
                          {test.name}
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          ₹{test.price}
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {test.result || "Result not available"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Authorized by</p>
                    <p className="text-sm font-medium text-gray-900">
                      Lab Technician
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-primary">
                      ₹{selectedReport.total_amount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}