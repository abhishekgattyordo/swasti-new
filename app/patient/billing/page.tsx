
// "use client";

// import { useState, useEffect } from "react"; // ✅ added useEffect
// import Link from "next/link";
// import Sidebar from "@/components/patient/Sidebar";
// import {
//   ReceiptLong,
//   Download,
//   Print,
//   FilterList,
//   Search,
//   CheckCircle,
//   Warning,
//   Schedule,
//   ArrowForward,
//   FilePresent,
//   PictureAsPdf,
//   Description,
//   Medication, // ✅ new icon for medications tab
// } from "@mui/icons-material";
// import { Menu, X } from "lucide-react";

// export default function PatientBillingPage() {
//   const [activeTab, setActiveTab] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [dateFilter, setDateFilter] = useState("last6months");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   // ✅ New state for pharmacy ledger
//   const [ledger, setLedger] = useState<any[]>([]);
//   const [loadingLedger, setLoadingLedger] = useState(false);
//   const [ledgerError, setLedgerError] = useState("");

//   // ✅ Fetch pharmacy ledger on mount
//   useEffect(() => {
//     const fetchLedger = async () => {
//       const user = JSON.parse(localStorage.getItem("user") || "null");
//       if (!user?.patient_id) return;

//       setLoadingLedger(true);
//       setLedgerError("");
//       try {
//         const res = await fetch(`/api/pharmacy/ledger?patientId=${user.patient_id}`);
//         const data = await res.json();
//         if (data.success) {
//           setLedger(data.data);
//         } else {
//           setLedgerError("Failed to load medication history");
//         }
//       } catch (error) {
//         console.error("Error fetching ledger:", error);
//         setLedgerError("Something went wrong");
//       } finally {
//         setLoadingLedger(false);
//       }
//     };

//     fetchLedger();
//   }, []);

//   // Billing summary data
//   const billingSummary = {
//     totalBilled: 2840.5,
//     insuranceCovered: 1950.75,
//     patientResponsibility: 889.75,
//     pendingAmount: 450.0,
//     dueDate: "Mar 15, 2026",
//     outstanding: 439.75,
//   };

//   // Recent transactions / billing history
//   const transactions = [
//     {
//       id: "INV-2026-0124",
//       date: "Feb 24, 2026",
//       serviceDate: "Feb 20, 2026",
//       description: "Cardiology Consultation - Dr. Sarah Jenkins",
//       provider: "Dr. Sarah Jenkins",
//       department: "Cardiology",
//       amount: 350.0,
//       insurancePaid: 245.0,
//       patientPaid: 105.0,
//       balance: 0.0,
//       status: "paid",
//       statusText: "Paid in Full",
//       paymentMethod: "Visa •••• 4242",
//       pdf: true,
//     },
//     {
//       id: "INV-2026-0092",
//       date: "Feb 10, 2026",
//       serviceDate: "Feb 05, 2026",
//       description: "Complete Blood Count (CBC) - Lab Work",
//       provider: "Main Street Lab",
//       department: "Laboratory",
//       amount: 180.5,
//       insurancePaid: 144.4,
//       patientPaid: 36.1,
//       balance: 0.0,
//       status: "paid",
//       statusText: "Paid in Full",
//       paymentMethod: "Insurance + Credit Card",
//       pdf: true,
//     },
//     {
//       id: "INV-2026-0045",
//       date: "Jan 28, 2026",
//       serviceDate: "Jan 25, 2026",
//       description: "Lipid Panel + Metabolic Panel",
//       provider: "Dr. Michael Chen",
//       department: "General Practice",
//       amount: 275.0,
//       insurancePaid: 192.5,
//       patientPaid: 82.5,
//       balance: 0.0,
//       status: "paid",
//       statusText: "Paid in Full",
//       paymentMethod: "Insurance",
//       pdf: true,
//     },
//     {
//       id: "INV-2025-1892",
//       date: "Dec 15, 2025",
//       serviceDate: "Dec 10, 2025",
//       description: "MRI - Lumbar Spine",
//       provider: "Dr. Alan Grant",
//       department: "Radiology",
//       amount: 1250.0,
//       insurancePaid: 875.0,
//       patientPaid: 250.0,
//       balance: 125.0,
//       status: "partial",
//       statusText: "Partial Payment",
//       paymentMethod: "Insurance + Pending",
//       dueDate: "Mar 01, 2026",
//       pdf: true,
//     },
//     {
//       id: "INV-2025-1722",
//       date: "Nov 30, 2025",
//       serviceDate: "Nov 28, 2025",
//       description: "Amoxicillin 500mg - 10 day supply",
//       provider: "Dr. Sarah Jenkins",
//       department: "Pharmacy",
//       amount: 45.0,
//       insurancePaid: 32.5,
//       patientPaid: 12.5,
//       balance: 0.0,
//       status: "paid",
//       statusText: "Paid in Full",
//       paymentMethod: "Insurance",
//       pdf: true,
//     },
//     {
//       id: "INV-2025-1650",
//       date: "Oct 22, 2025",
//       serviceDate: "Oct 18, 2025",
//       description: "Follow-up Consultation",
//       provider: "Dr. Sarah Jenkins",
//       department: "Cardiology",
//       amount: 200.0,
//       insurancePaid: 140.0,
//       patientPaid: 0.0,
//       balance: 60.0,
//       status: "pending",
//       statusText: "Insurance Pending",
//       dueDate: "Mar 30, 2026",
//       pdf: true,
//     },
//     {
//       id: "INV-2025-1512",
//       date: "Sep 05, 2025",
//       serviceDate: "Sep 01, 2025",
//       description: "Annual Physical Examination",
//       provider: "Dr. Michael Chen",
//       department: "General Practice",
//       amount: 540.0,
//       insurancePaid: 378.0,
//       patientPaid: 162.0,
//       balance: 0.0,
//       status: "paid",
//       statusText: "Paid in Full",
//       paymentMethod: "Insurance + HSA",
//       pdf: true,
//     },
//   ];

//   // Upcoming payments / estimated responsibility
//   const upcomingPayments = [
//     {
//       id: 1,
//       description: "MRI - Balance Due",
//       amount: 125.0,
//       dueDate: "Mar 01, 2026",
//       status: "overdue",
//     },
//     {
//       id: 2,
//       description: "Follow-up Consultation",
//       amount: 60.0,
//       dueDate: "Mar 30, 2026",
//       status: "pending",
//     },
//   ];

//   // Filter transactions based on active tab and search
//   const filteredTransactions = transactions.filter((tx) => {
//     // Tab filter
//     if (activeTab === "paid" && tx.status !== "paid") return false;
//     if (
//       activeTab === "pending" &&
//       tx.status !== "pending" &&
//       tx.status !== "partial"
//     )
//       return false;
//     if (activeTab === "overdue" && tx.balance <= 0) return false;

//     // Search filter
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       return (
//         tx.id.toLowerCase().includes(query) ||
//         tx.description.toLowerCase().includes(query) ||
//         tx.provider.toLowerCase().includes(query)
//       );
//     }
//     return true;
//   });

//   // Calculate totals for summary cards
//   const pendingTotal = upcomingPayments.reduce(
//     (sum, item) => sum + item.amount,
//     0,
//   );

//   // Format currency
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//       minimumFractionDigits: 2,
//     }).format(amount);
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
//       {/* Mobile Menu Button - Same as Pharmacy Dashboard */}
//       <button
//             className="lg:hidden fixed bottom-20 right-6 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
//             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//           >
//             {isSidebarOpen ? (
//               <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
//             ) : (
//               <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
//             )}
//           </button>
    
//           {/* Sidebar */}
//           <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    
//           {/* Backdrop for mobile */}
//           {isSidebarOpen && (
//             <div
//               className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
//               onClick={() => setIsSidebarOpen(false)}
//             />
//           )}

//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col w-full lg:ml-0 min-w-0">
//         {/* Scrollable Content */}
//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
//           <div className="max-w-7xl mx-auto space-y-6">
//             {/* Page Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <div>
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
//                     <ReceiptLong className="text-green-600 dark:text-green-400 text-xl" />
//                   </div>
//                   <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                     Billing & Payments
//                   </h1>
//                 </div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 ml-1">
//                   View your statements, payment history, and outstanding balances.
//                 </p>
//               </div>

//               <div className="flex items-center gap-3">
//                 <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
//                   <Print className="text-lg text-gray-500" />
//                   <span className="hidden sm:inline">Print</span>
//                 </button>
//                 <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all active:scale-95">
//                   <Download className="text-lg" />
//                   <span className="hidden sm:inline">Download All</span>
//                 </button>
//               </div>
//             </div>

//             {/* Billing Summary Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               {/* Total Billed */}
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
//                     <ReceiptLong className="text-blue-600 dark:text-blue-400 text-lg" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
//                     Lifetime
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Billed</p>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {formatCurrency(billingSummary.totalBilled)}
//                 </p>
//                 <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
//                   <span className="text-green-600 dark:text-green-400 font-medium">
//                     Insurance covered
//                   </span>{" "}
//                   {formatCurrency(billingSummary.insuranceCovered)}
//                 </div>
//               </div>

//               {/* Your Responsibility */}
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
//                     <Warning className="text-amber-600 dark:text-amber-400 text-lg" />
//                   </div>
//                   <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
//                     YTD
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Responsibility</p>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {formatCurrency(billingSummary.patientResponsibility)}
//                 </p>
//                 <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
//                   <span className="text-green-600 dark:text-green-400 font-medium">
//                     Paid
//                   </span>{" "}
//                   {formatCurrency(
//                     billingSummary.patientResponsibility - billingSummary.outstanding,
//                   )}
//                 </div>
//               </div>

//               {/* Current Balance */}
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
//                 <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -translate-y-8 translate-x-8"></div>
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
//                     <Schedule className="text-green-600 dark:text-green-400 text-lg" />
//                   </div>
//                   <span className="text-xs font-medium px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
//                     Due Soon
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Balance</p>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {formatCurrency(billingSummary.outstanding)}
//                 </p>
//                 <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
//                   Due by{" "}
//                   <span className="font-medium text-gray-900 dark:text-white">
//                     {billingSummary.dueDate}
//                   </span>
//                 </div>
//               </div>

//               {/* Insurance Summary */}
//               <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800/50 shadow-sm">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white shadow-sm">
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       Insurance Status
//                     </p>
//                     <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                       Blue Cross Blue Shield
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       Deductible (Met)
//                     </p>
//                     <p className="text-lg font-bold text-gray-900 dark:text-white">
//                       $1,200 / $1,500
//                     </p>
//                   </div>
//                   <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
//                     <span className="text-sm font-bold text-green-600">80%</span>
//                   </div>
//                 </div>
//                 <div className="mt-3 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                   <div className="h-full w-4/5 bg-green-600 rounded-full"></div>
//                 </div>
//               </div>
//             </div>

//             {/* Outstanding & Payment Reminder */}
//             {upcomingPayments.length > 0 && (
//               <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-900/50 overflow-hidden">
//                 <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-5 py-3 border-b border-amber-200 dark:border-amber-800/50">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
//                       <Warning className="text-sm" />
//                     </div>
//                     <h2 className="font-semibold text-gray-900 dark:text-white">
//                       Outstanding Balance Reminder
//                     </h2>
//                   </div>
//                 </div>
//                 <div className="p-5">
//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                     <div>
//                       <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
//                         Total Amount Due
//                       </p>
//                       <p className="text-3xl font-bold text-gray-900 dark:text-white">
//                         {formatCurrency(pendingTotal)}
//                       </p>
//                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                         Includes {upcomingPayments.length} outstanding{" "}
//                         {upcomingPayments.length === 1 ? "item" : "items"}
//                       </p>
//                     </div>
//                     <div className="flex flex-col sm:flex-row gap-3">
//                       <button className="px-5 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
//                         View Details
//                       </button>
//                       <button className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2">
//                         Pay Now
//                         <ArrowForward className="text-sm" />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Upcoming items */}
//                   <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {upcomingPayments.map((item) => (
//                       <div
//                         key={item.id}
//                         className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
//                       >
//                         <div>
//                           <p className="text-sm font-medium text-gray-900 dark:text-white">
//                             {item.description}
//                           </p>
//                           <div className="flex items-center gap-2 mt-1">
//                             <span className="text-xs text-gray-500 dark:text-gray-400">
//                               Due {item.dueDate}
//                             </span>
//                             <span
//                               className={`text-xs px-2 py-0.5 rounded-full ${
//                                 item.status === "overdue"
//                                   ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
//                                   : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
//                               }`}
//                             >
//                               {item.status === "overdue" ? "Overdue" : "Pending"}
//                             </span>
//                           </div>
//                         </div>
//                         <p className="text-lg font-bold text-gray-900 dark:text-white">
//                           {formatCurrency(item.amount)}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Billing History Section */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
//               {/* Header with filters */}
//               <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                 <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                   <ReceiptLong className="text-green-600 dark:text-green-400 text-lg" />
//                   Billing History
//                 </h2>

//                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//                   {/* Date Filter */}
//                   {activeTab !== "medications" && ( // Hide date filter for medications tab
//                     <select
//                       value={dateFilter}
//                       onChange={(e) => setDateFilter(e.target.value)}
//                       className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-gray-700 dark:text-gray-300"
//                     >
//                       <option value="last30days">Last 30 Days</option>
//                       <option value="last6months">Last 6 Months</option>
//                       <option value="lastyear">Last Year</option>
//                       <option value="all">All Time</option>
//                     </select>
//                   )}
//                   <button className="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
//                     <FilterList className="text-gray-500 dark:text-gray-400 text-lg" />
//                   </button>
//                 </div>
//               </div>

//               {/* Tabs – added "medications" */}
//               <div className="px-5 pt-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
//                 <div className="flex space-x-5">
//                   {["all", "paid", "pending", "overdue", "medications"].map((tab) => (
//                     <button
//                       key={tab}
//                       onClick={() => setActiveTab(tab)}
//                       className={`pb-2.5 px-1 text-sm font-medium transition-colors relative flex items-center gap-1 ${
//                         activeTab === tab
//                           ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
//                           : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
//                       }`}
//                     >
//                       {tab === "medications" && <Medication className="text-base" />}
//                       {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Content Area */}
//               {activeTab === "medications" ? (
//                 // ✅ Medications Tab – real pharmacy ledger data
//                 <div className="p-5">
//                   {loadingLedger ? (
//                     <div className="flex justify-center py-12">
//                       <div className="w-8 h-8 border-4 border-green-500 border-t-transparent animate-spin rounded-full"></div>
//                     </div>
//                   ) : ledgerError ? (
//                     <div className="text-center py-12 text-red-500">{ledgerError}</div>
//                   ) : ledger.length === 0 ? (
//                     <div className="text-center py-12">
//                       <Medication className="text-gray-300 dark:text-gray-600 text-5xl mb-4 mx-auto" />
//                       <p className="text-gray-500 dark:text-gray-400 font-medium">
//                         No medication dispensed yet
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="overflow-x-auto">
//                       <table className="w-full text-sm">
//                         <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
//                           <tr>
//                             <th className="px-4 py-3 text-left">Date</th>
//                             <th className="px-4 py-3 text-left">Medicine</th>
//                             <th className="px-4 py-3 text-left">Batch</th>
//                             <th className="px-4 py-3 text-right">Qty</th>
//                             <th className="px-4 py-3 text-right">Unit Price</th>
//                             <th className="px-4 py-3 text-right">Total</th>
//                             <th className="px-4 py-3 text-center">Status</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                           {ledger.map((item) => (
//                             <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
//                               <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
//                                 {new Date(item.date).toLocaleDateString()}
//                               </td>
//                               <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
//                                 {item.medicine}
//                               </td>
//                               <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
//                                 {item.batch}
//                               </td>
//                               <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
//                                 {item.qty}
//                               </td>
//                               <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
//                                 {formatCurrency(item.unitPrice)}
//                               </td>
//                               <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
//                                 {formatCurrency(item.total)}
//                               </td>
//                               <td className="px-4 py-3 text-center">
//                                 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
//                                   {item.status}
//                                 </span>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 // ✅ Billing/Transactions Tab (existing table)
//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm border-collapse">
//                     <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
//                       <tr>
//                         <th className="px-5 py-3 text-left font-medium border-r border-gray-200 dark:border-gray-700">Invoice #</th>
//                         <th className="px-5 py-3 text-left font-medium border-r border-gray-200 dark:border-gray-700">Date</th>
//                         <th className="px-5 py-3 text-left font-medium border-r border-gray-200 dark:border-gray-700">Description</th>
//                         <th className="px-5 py-3 text-left font-medium border-r border-gray-200 dark:border-gray-700">Provider</th>
//                         <th className="px-5 py-3 text-right font-medium border-r border-gray-200 dark:border-gray-700">Amount</th>
//                         <th className="px-5 py-3 text-left font-medium border-r border-gray-200 dark:border-gray-700">Status</th>
//                         <th className="px-5 py-3 text-center font-medium">Receipt</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                       {filteredTransactions.length > 0 ? (
//                         filteredTransactions.map((tx) => (
//                           <tr
//                             key={tx.id}
//                             className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
//                           >
//                             <td className="px-5 py-3 border-r border-gray-200 dark:border-gray-700">
//                               <span className="font-mono text-xs font-medium text-gray-900 dark:text-white">
//                                 {tx.id}
//                               </span>
//                             </td>
//                             <td className="px-5 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
//                               {tx.date}
//                             </td>
//                             <td className="px-5 py-3 border-r border-gray-200 dark:border-gray-700">
//                               <p className="font-medium text-gray-900 dark:text-white">
//                                 {tx.description}
//                               </p>
//                               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                                 Service: {tx.serviceDate}
//                               </p>
//                             </td>
//                             <td className="px-5 py-3 text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
//                               {tx.provider}
//                             </td>
//                             <td className="px-5 py-3 text-right border-r border-gray-200 dark:border-gray-700">
//                               <span className="font-semibold text-gray-900 dark:text-white">
//                                 {formatCurrency(tx.amount)}
//                               </span>
//                               {tx.balance > 0 && (
//                                 <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
//                                   Balance: {formatCurrency(tx.balance)}
//                                 </p>
//                               )}
//                             </td>
//                             <td className="px-5 py-3 border-r border-gray-200 dark:border-gray-700">
//                               <span
//                                 className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
//                                   tx.status === "paid"
//                                     ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
//                                     : tx.status === "partial"
//                                       ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
//                                       : tx.status === "pending"
//                                         ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
//                                         : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
//                                 }`}
//                               >
//                                 {tx.statusText}
//                               </span>
//                             </td>
//                             <td className="px-5 py-3 text-center">
//                               {tx.pdf && (
//                                 <button className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
//                                   <PictureAsPdf className="text-lg" />
//                                 </button>
//                               )}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan={7} className="px-5 py-12 text-center">
//                             <div className="flex flex-col items-center">
//                               <ReceiptLong className="text-gray-300 dark:text-gray-600 text-5xl mb-4" />
//                               <p className="text-gray-500 dark:text-gray-400 font-medium">
//                                 No transactions found
//                               </p>
//                               <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
//                                 Try adjusting your filters or search term
//                               </p>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               )}

//               {/* Pagination – shown only for non‑medications tabs */}
//               {activeTab !== "medications" && (
//                 <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
//                   <p className="text-xs text-gray-500 dark:text-gray-400">
//                     Showing{" "}
//                     <span className="font-medium text-gray-700 dark:text-gray-300">
//                       {filteredTransactions.length}
//                     </span>{" "}
//                     of{" "}
//                     <span className="font-medium text-gray-700 dark:text-gray-300">
//                       {transactions.length}
//                     </span>{" "}
//                     transactions
//                   </p>
//                   <div className="flex items-center gap-1">
//                     <button className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
//                       Previous
//                     </button>
//                     <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm border border-green-700">
//                       1
//                     </button>
//                     <button className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                       2
//                     </button>
//                     <button className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                       3
//                     </button>
//                     <button className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Billing Address & Payment Methods */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//               {/* Billing Address */}
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//                   <svg
//                     className="w-4 h-4 text-green-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                     />
//                   </svg>
//                   Billing Address
//                 </h3>
//                 <div className="space-y-1.5 text-sm">
//                   <p className="font-medium text-gray-900 dark:text-white">John Doe</p>
//                   <p className="text-gray-600 dark:text-gray-400">123 Medical Street</p>
//                   <p className="text-gray-600 dark:text-gray-400">Apt 4B</p>
//                   <p className="text-gray-600 dark:text-gray-400">Health City, HC 56789</p>
//                   <p className="text-gray-600 dark:text-gray-400">United States</p>
//                   <button className="mt-2 text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1">
//                     Edit Address
//                     <ArrowForward className="text-sm" />
//                   </button>
//                 </div>
//               </div>

//               {/* Payment Methods */}
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//                   <svg
//                     className="w-4 h-4 text-green-600"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
//                     />
//                   </svg>
//                   Saved Payment Methods
//                 </h3>
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
//                         <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
//                           VISA
//                         </span>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                           Visa •••• 4242
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Expires 12/28</p>
//                       </div>
//                     </div>
//                     <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
//                       Default
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
//                         <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
//                           MC
//                         </span>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                           Mastercard •••• 8901
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Expires 10/27</p>
//                       </div>
//                     </div>
//                     <button className="text-xs text-gray-500 hover:text-green-600 dark:hover:text-green-400">
//                       Edit
//                     </button>
//                   </div>
//                   <button className="mt-2 w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2">
//                     <span className="text-lg">+</span>
//                     Add Payment Method
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Disclaimer */}
//             <div className="text-center pt-4">
//               <p className="text-xs text-gray-400 dark:text-gray-500 max-w-2xl mx-auto">
//                 This statement is for informational purposes only. For questions
//                 regarding your bill, please contact our billing department at{" "}
//                 <span className="font-medium text-gray-500 dark:text-gray-400">
//                   billing@healthsync.com
//                 </span>{" "}
//                 or call{" "}
//                 <span className="font-medium text-gray-500 dark:text-gray-400">
//                   (555) 123-4567
//                 </span>
//                 . In case of emergency, please dial 911 immediately.
//               </p>
//               <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
//                 © 2026 HealthSync Patient Portal. All rights reserved.
//               </p>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/patient/Sidebar";
import {
  ReceiptLong,
  Download,
  Print,
  FilterList,
  Search,
  Warning,
  Schedule,
  ArrowForward,
  PictureAsPdf,
  Medication,
  Filter,
  X,
} from "@mui/icons-material";
import { Menu, X as XIcon } from "lucide-react";


export default function PatientBillingPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("last6months");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [billingSummary, setBillingSummary] = useState({
    totalBilled: 0,
    insuranceCovered: 0,
    patientResponsibility: 0,
    pendingAmount: 0,
    dueDate: "",
    outstanding: 0,
  });
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Column filters
  const [filters, setFilters] = useState({
    invoice: "",
    date: "",
    description: "",
    amount: "",
    status: "",
  });
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user?.patient_id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/appointments/patient/billing/transactions?patientId=${user.patient_id}`);
        const data = await res.json();
        if (data.success) {
          setTransactions(data.data.transactions);
          setBillingSummary(data.data.billingSummary);
          setUpcomingPayments(data.data.upcomingPayments);
        } else {
          setError(data.message || "Failed to load billing data");
        }
      } catch (err) {
        console.error(err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Click outside to close filter popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openFilter && filterRefs.current[openFilter] &&
          !filterRefs.current[openFilter]?.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Tab filter
    if (activeTab === "paid" && tx.status !== "paid") return false;
    if (activeTab === "pending" && !["pending", "partial"].includes(tx.status)) return false;
    if (activeTab === "overdue" && tx.balance <= 0) return false;
    // Global search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!tx.id.toLowerCase().includes(q) && !tx.description.toLowerCase().includes(q)) return false;
    }
    // Column filters
    if (filters.invoice && !tx.id.toLowerCase().includes(filters.invoice.toLowerCase())) return false;
    if (filters.date && !tx.date.toLowerCase().includes(filters.date.toLowerCase())) return false;
    if (filters.description && !tx.description.toLowerCase().includes(filters.description.toLowerCase())) return false;
    if (filters.amount && !tx.amount.toString().includes(filters.amount)) return false;
    if (filters.status && !tx.statusText.toLowerCase().includes(filters.status.toLowerCase())) return false;
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "partial": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "pending": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleFilterChange = (column: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const clearFilter = (column: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [column]: '' }));
    setOpenFilter(null);
  };

  const clearAllFilters = () => {
    setFilters({
      invoice: '',
      date: '',
      description: '',
      amount: '',
      status: '',
    });
    setOpenFilter(null);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const FilterPopover = ({ column, placeholder, label }: { column: keyof typeof filters; placeholder: string; label: string }) => {
    const isOpen = openFilter === column;
    const value = filters[column];

    return (
      <div className="relative inline-block" ref={el => { filterRefs.current[column] = el; }}>
        <button
          onClick={() => setOpenFilter(isOpen ? null : column)}
          className={`ml-1 p-1 rounded-md hover:bg-gray-100 transition-colors ${value ? 'text-blue-600' : 'text-gray-400'}`}
          aria-label={`Filter by ${label}`}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filter by {label}
              </h4>
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={e => handleFilterChange(column, e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => clearFilter(column)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpenFilter(null)}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col w-full lg:ml-0 min-w-0">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <ReceiptLong className="text-green-600 dark:text-green-400 text-xl" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-1">View your statements, payment history, and outstanding balances.</p>
              </div>
          
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-50"><ReceiptLong className="text-blue-600 text-lg" /></div>
                  <span className="text-xs text-gray-500">Lifetime</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Billed</p>
                <p className="text-2xl font-bold">{formatCurrency(billingSummary.totalBilled)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-amber-50"><Warning className="text-amber-600 text-lg" /></div>
                  <span className="text-xs text-gray-500">YTD</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">Your Responsibility</p>
                <p className="text-2xl font-bold">{formatCurrency(billingSummary.patientResponsibility)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-green-50"><Schedule className="text-green-600 text-lg" /></div>
                  <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">Due Soon</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">Current Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(billingSummary.outstanding)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div><p className="text-xs text-gray-500">Insurance Status</p><p className="text-sm font-semibold">Blue Cross</p></div>
                </div>
                <div className="flex justify-between"><p className="text-xs">Deductible (Met)</p><p className="text-lg font-bold">$1,200 / $1,500</p></div>
                <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden"><div className="h-full w-4/5 bg-green-600 rounded-full"></div></div>
              </div>
            </div>

            {/* Billing History Table with Column Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b flex justify-between items-center">
                <h2 className="text-base font-semibold flex items-center gap-2"><ReceiptLong className="text-green-600" /> Billing History</h2>
                <div className="flex gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <XIcon className="h-3 w-3" /> Clear Filters
                    </button>
                  )}
                  <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border rounded-lg text-sm">
                    <option value="last30days">Last 30 Days</option>
                    <option value="last6months">Last 6 Months</option>
                    <option value="all">All Time</option>
                  </select>
                  <button className="p-2 bg-gray-50 border rounded-lg"><FilterList /></button>
                </div>
              </div>
              <div className="px-5 pt-2 border-b overflow-x-auto">
                <div className="flex space-x-5">
                  {["all", "paid", "pending", "overdue"].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2.5 px-1 text-sm font-medium ${activeTab === tab ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr className="border-b">
                      <th className="px-5 py-3 text-left border-r border-gray-200">
                        <div className="flex items-center gap-1">
                          Invoice #
                          <FilterPopover column="invoice" placeholder="Filter by number..." label="Invoice #" />
                          
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left border-r border-gray-200">
                        <div className="flex items-center gap-1">
                          Date
                          <FilterPopover column="date" placeholder="MMM DD, YYYY" label="Date" />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left border-r border-gray-200">
                        <div className="flex items-center gap-1">
                          Description
                          <FilterPopover column="description" placeholder="Filter description..." label="Description" />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-right border-r border-gray-200">
                        <div className="flex items-center justify-end gap-1">
                          Amount
                          <FilterPopover column="amount" placeholder="e.g., 100" label="Amount" />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left border-r border-gray-200">
                        <div className="flex items-center gap-1">
                          Status
                          <FilterPopover column="status" placeholder="Paid/Pending/Partial" label="Status" />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-center">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTransactions.map((tx) => (
                      <React.Fragment key={tx.id}>
                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(tx.id)}>
                          <td className="px-5 py-3 border-r border-gray-200 font-mono text-xs">{tx.id}</td>
                          <td className="px-5 py-3 border-r border-gray-200">{tx.date}</td>
                          <td className="px-5 py-3 border-r border-gray-200">{tx.description}</td>
                          <td className="px-5 py-3 text-right border-r border-gray-200 font-semibold">{formatCurrency(tx.amount)}</td>
                          <td className="px-5 py-3 border-r border-gray-200"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>{tx.statusText}</span></td>
                          <td className="px-5 py-3 text-center">
                            <button className="text-green-600 hover:text-green-800">
                              {expandedRow === tx.id ? "▲" : "▼"}
                            </button>
                          </td>
                        </tr>
                        {expandedRow === tx.id && tx.items && tx.items.length > 0 && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-5 py-3">
                              <div className="pl-8">
                                <h4 className="font-semibold text-sm mb-2">Itemised Breakdown</h4>
                                <table className="w-full text-xs border">
                                  <thead className="bg-gray-100">
                                    <tr className="border-b">
                                      <th className="px-3 py-2 text-left border-r">Item</th>
                                      <th className="px-3 py-2 text-right border-r">Qty</th>
                                      <th className="px-3 py-2 text-right border-r">Unit Price</th>
                                      <th className="px-3 py-2 text-right">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tx.items.map((item: any, idx: number) => (
                                      <tr key={idx} className="border-t">
                                        <td className="px-3 py-2 border-r">{item.medicine_name}</td>
                                        <td className="px-3 py-2 text-right border-r">{item.quantity}</td>
                                        <td className="px-3 py-2 text-right border-r">{formatCurrency(item.unit_price)}</td>
                                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total_price)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {tx.balance > 0 && (
                                  <p className="mt-2 text-xs text-red-600">Balance due: {formatCurrency(tx.balance)}</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-gray-500">No transactions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}