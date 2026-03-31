
// "use client";

// import { useState } from "react";
// import Card from "@/components/laboratory/Card";

// interface CompletedReport {
//   id: string;
//   order_id: string;
//   patient_name: string;
//   patient_id: string;
//   tests: Array<{ name: string; result: string }>;
//   total_amount: number;
//   completed_date: string;
// }

// export default function ReportsPage() {
//   const [selectedReport, setSelectedReport] = useState<CompletedReport | null>(null);
//   const [filter, setFilter] = useState("all");

//   const reports: CompletedReport[] = [
//     {
//       id: "1",
//       order_id: "LAB-2026-001",
//       patient_name: "John Doe",
//       patient_id: "P12345",
//       tests: [
//         { name: "Complete Blood Count", result: "Hemoglobin: 14.2 g/dL, WBC: 7.5, Platelets: 250" },
//         { name: "Blood Glucose", result: "Fasting: 95 mg/dL - Normal" },
//       ],
//       total_amount: 650,
//       completed_date: "2026-03-30",
//     },
//     {
//       id: "2",
//       order_id: "LAB-2026-003",
//       patient_name: "Robert Johnson",
//       patient_id: "P12347",
//       tests: [
//         { name: "Lipid Profile", result: "Total Cholesterol: 188 mg/dL, HDL: 45, LDL: 120" },
//         { name: "Thyroid Profile", result: "TSH: 2.5 mIU/L, T3: 1.2, T4: 8.5" },
//       ],
//       total_amount: 1000,
//       completed_date: "2026-03-29",
//     },
//   ];

//   const filteredReports = filter === "all" ? reports : reports.filter(r => r.patient_name.toLowerCase().includes(filter.toLowerCase()));

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-semibold text-gray-900">Lab Reports</h1>
//             <p className="text-sm text-gray-500 mt-1">View completed test reports</p>
//           </div>
//           <input
//             type="text"
//             placeholder="Search by patient name..."
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64"
//             value={filter === "all" ? "" : filter}
//             onChange={(e) => setFilter(e.target.value || "all")}
//           />
//         </div>
//       </div>

//       <div className="p-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {filteredReports.map((report) => (
//             <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
//               <div className="p-6">
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-900">{report.patient_name}</h3>
//                     <p className="text-sm text-gray-500 mt-1">
//                       {report.order_id} • {report.patient_id}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-gray-500">{report.completed_date}</p>
//                     <p className="text-lg font-bold text-primary mt-1">₹{report.total_amount}</p>
//                   </div>
//                 </div>
                
//                 <div className="space-y-3 mb-4">
//                   {report.tests.map((test, idx) => (
//                     <div key={idx} className="border-l-2 border-primary pl-3">
//                       <p className="text-sm font-medium text-gray-900">{test.name}</p>
//                       <p className="text-xs text-gray-600 mt-1 line-clamp-2">{test.result}</p>
//                     </div>
//                   ))}
//                 </div>

//                 <button
//                   onClick={() => setSelectedReport(report)}
//                   className="w-full mt-2 px-4 py-2 bg-gray-50 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors text-sm font-medium"
//                 >
//                   View Full Report
//                 </button>
//               </div>
//             </Card>
//           ))}
//         </div>
//       </div>

//       {/* Report Details Modal */}
//       {selectedReport && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
//             <div className="p-8">
//               <div className="flex justify-between items-start mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">Laboratory Report</h2>
//                   <p className="text-sm text-gray-500 mt-1">Generated on {selectedReport.completed_date}</p>
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
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">Patient Name</p>
//                     <p className="text-base font-semibold text-gray-900 mt-1">{selectedReport.patient_name}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">Patient ID</p>
//                     <p className="text-base font-semibold text-gray-900 mt-1">{selectedReport.patient_id}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
//                     <p className="text-base font-semibold text-gray-900 mt-1">{selectedReport.order_id}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 uppercase tracking-wider">Report Date</p>
//                     <p className="text-base font-semibold text-gray-900 mt-1">{selectedReport.completed_date}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Test Results */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
//                 <div className="space-y-4">
//                   {selectedReport.tests.map((test, idx) => (
//                     <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
//                       <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
//                         <p className="font-semibold text-gray-900">{test.name}</p>
//                       </div>
//                       <div className="p-4">
//                         <p className="text-gray-700 whitespace-pre-wrap">{test.result}</p>
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
//                     <p className="text-sm font-medium text-gray-900">Lab Technician</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-gray-500">Total Amount</p>
//                     <p className="text-xl font-bold text-primary">₹{selectedReport.total_amount}</p>
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
//                   onClick={() => window.print()}
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

  useEffect(() => {
    const savedOrders = localStorage.getItem('lab_orders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      const completedOrders = allOrders.filter((order: any) => order.status === "Completed");
      
      const formattedReports = completedOrders.map((order: any) => ({
        id: order.id,
        order_id: order.order_id,
        patient_name: order.patient_name,
        patient_id: order.patient_id,
        tests: order.tests.map((test: any) => ({
          id: test.id,
          name: test.name,
          price: test.price,
          result: order.results?.find((r: any) => r.test_id === test.id)?.result || "Result not available"
        })),
        total_amount: order.total_amount,
        completed_date: order.completed_date,
        collected_date: order.collected_date,
        billing_entry_id: order.billing_entry_id
      }));
      
      setReports(formattedReports);
    }
  }, []);

  const filteredReports = filter 
    ? reports.filter(r => r.patient_name.toLowerCase().includes(filter.toLowerCase()))
    : reports;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lab Reports</h1>
            <p className="text-sm text-gray-500 mt-1">View completed test reports</p>
          </div>
          <input
            type="text"
            placeholder="Search by patient name..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{report.patient_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {report.order_id} • {report.patient_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Completed: {report.completed_date}</p>
                    <p className="text-lg font-bold text-primary mt-1">₹{report.total_amount}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  {report.tests.map((test, idx) => (
                    <div key={idx} className="border-l-2 border-primary pl-3">
                      <p className="text-sm font-medium text-gray-900">{test.name}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{test.result || "No result recorded"}</p>
                    </div>
                  ))}
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
        </div>
        
        {filteredReports.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No completed reports found</p>
          </Card>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Laboratory Report</h2>
                  <p className="text-sm text-gray-500 mt-1">Generated on {selectedReport.completed_date}</p>
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
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Patient Name</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedReport.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Patient ID</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedReport.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedReport.order_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Report Date</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedReport.completed_date}</p>
                  </div>
                  {selectedReport.collected_date && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Sample Collected</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{selectedReport.collected_date}</p>
                    </div>
                  )}
                  {selectedReport.billing_entry_id && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Billing Reference</p>
                      <p className="text-base font-semibold text-gray-900 mt-1">{selectedReport.billing_entry_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Results */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
                <div className="space-y-4">
                  {selectedReport.tests.map((test, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <p className="font-semibold text-gray-900">{test.name}</p>
                        <p className="text-sm font-medium text-gray-700">₹{test.price}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{test.result || "Result not available"}</p>
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
                    <p className="text-sm font-medium text-gray-900">Lab Technician</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-primary">₹{selectedReport.total_amount}</p>
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