

// 'use client';

// import React, { useState, useEffect, useRef } from "react";
// import Sidebar from "@/components/patient/Sidebar";
// import {
//   ReceiptLong,
//   Download,
//   Print,
//   FilterList,
//   Search,
//   Warning,
//   Schedule,
//   ArrowForward,
//   PictureAsPdf,
//   Medication,
//   Filter,
//   X,
// } from "@mui/icons-material";
// import { Menu, X as XIcon } from "lucide-react";


// export default function PatientBillingPage() {
//   const [activeTab, setActiveTab] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [dateFilter, setDateFilter] = useState("last6months");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [expandedRow, setExpandedRow] = useState<string | null>(null);

//   const [transactions, setTransactions] = useState<any[]>([]);
//   const [billingSummary, setBillingSummary] = useState({
//     totalBilled: 0,
//     insuranceCovered: 0,
//     patientResponsibility: 0,
//     pendingAmount: 0,
//     dueDate: "",
//     outstanding: 0,
//   });
//   const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Column filters
//   const [filters, setFilters] = useState({
//     invoice: "",
//     date: "",
//     description: "",
//     amount: "",
//     status: "",
//   });
//   const [openFilter, setOpenFilter] = useState<string | null>(null);
//   const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   useEffect(() => {
//     const fetchData = async () => {
//       const user = JSON.parse(localStorage.getItem("user") || "null");
//       if (!user?.patient_id) {
//         setLoading(false);
//         return;
//       }
//       setLoading(true);
//       setError("");
//       try {
//         const res = await fetch(`/api/appointments/patient/billing/transactions?patientId=${user.patient_id}`);
//         const data = await res.json();
//         if (data.success) {
//           setTransactions(data.data.transactions);
//           setBillingSummary(data.data.billingSummary);
//           setUpcomingPayments(data.data.upcomingPayments);
//         } else {
//           setError(data.message || "Failed to load billing data");
//         }
//       } catch (err) {
//         console.error(err);
//         setError("Network error. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Click outside to close filter popover
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (openFilter && filterRefs.current[openFilter] &&
//           !filterRefs.current[openFilter]?.contains(event.target as Node)) {
//         setOpenFilter(null);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [openFilter]);

//   // Filter transactions
//   const filteredTransactions = transactions.filter((tx) => {
//     // Tab filter
//     if (activeTab === "paid" && tx.status !== "paid") return false;
//     if (activeTab === "pending" && !["pending", "partial"].includes(tx.status)) return false;
//     if (activeTab === "overdue" && tx.balance <= 0) return false;
//     // Global search
//     if (searchQuery) {
//       const q = searchQuery.toLowerCase();
//       if (!tx.id.toLowerCase().includes(q) && !tx.description.toLowerCase().includes(q)) return false;
//     }
//     // Column filters
//     if (filters.invoice && !tx.id.toLowerCase().includes(filters.invoice.toLowerCase())) return false;
//     if (filters.date && !tx.date.toLowerCase().includes(filters.date.toLowerCase())) return false;
//     if (filters.description && !tx.description.toLowerCase().includes(filters.description.toLowerCase())) return false;
//     if (filters.amount && !tx.amount.toString().includes(filters.amount)) return false;
//     if (filters.status && !tx.statusText.toLowerCase().includes(filters.status.toLowerCase())) return false;
//     return true;
//   });

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "paid": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
//       case "partial": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
//       case "pending": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
//       default: return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
//     }
//   };

//   const toggleExpand = (id: string) => {
//     setExpandedRow(expandedRow === id ? null : id);
//   };

//   const handleFilterChange = (column: keyof typeof filters, value: string) => {
//     setFilters(prev => ({ ...prev, [column]: value }));
//   };

//   const clearFilter = (column: keyof typeof filters) => {
//     setFilters(prev => ({ ...prev, [column]: '' }));
//     setOpenFilter(null);
//   };

//   const clearAllFilters = () => {
//     setFilters({
//       invoice: '',
//       date: '',
//       description: '',
//       amount: '',
//       status: '',
//     });
//     setOpenFilter(null);
//   };

//   const hasActiveFilters = Object.values(filters).some(v => v !== '');

//   const FilterPopover = ({ column, placeholder, label }: { column: keyof typeof filters; placeholder: string; label: string }) => {
//     const isOpen = openFilter === column;
//     const value = filters[column];

//     return (
//       <div className="relative inline-block" ref={el => { filterRefs.current[column] = el; }}>
//         <button
//           onClick={() => setOpenFilter(isOpen ? null : column)}
//           className={`ml-1 p-1 rounded-md hover:bg-gray-100 transition-colors ${value ? 'text-blue-600' : 'text-gray-400'}`}
//           aria-label={`Filter by ${label}`}
//         >
//           <Filter className="h-3.5 w-3.5" />
//         </button>
//         {isOpen && (
//           <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
//             <div className="space-y-2">
//               <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Filter by {label}
//               </h4>
//               <input
//                 type="text"
//                 placeholder={placeholder}
//                 value={value}
//                 onChange={e => handleFilterChange(column, e.target.value)}
//                 className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 autoFocus
//               />
//               <div className="flex justify-end gap-2">
//                 <button
//                   onClick={() => clearFilter(column)}
//                   className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
//                 >
//                   Clear
//                 </button>
//                 <button
//                   onClick={() => setOpenFilter(null)}
//                   className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
//                 >
//                   Apply
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-50">
//         <div className="w-10 h-10 border-4 border-green-600 border-t-transparent animate-spin rounded-full"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-50">
//         <div className="text-red-600">Error: {error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
//       {/* Mobile menu button */}
//       <button
//         className="lg:hidden fixed bottom-20 right-6 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//       >
//         {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//       </button>
//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//       {isSidebarOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

//       <div className="flex-1 flex flex-col w-full lg:ml-0 min-w-0">
//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
//           <div className="max-w-7xl mx-auto space-y-6">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//               <div>
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
//                     <ReceiptLong className="text-green-600 dark:text-green-400 text-xl" />
//                   </div>
//                   <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
//                 </div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 ml-1">View your statements, payment history, and outstanding balances.</p>
//               </div>
          
//             </div>

//             {/* Summary Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border shadow-sm">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="p-2 rounded-lg bg-blue-50"><ReceiptLong className="text-blue-600 text-lg" /></div>
//                   <span className="text-xs text-gray-500">Lifetime</span>
//                 </div>
//                 <p className="text-sm text-gray-500 mb-1">Total Billed</p>
//                 <p className="text-2xl font-bold">{formatCurrency(billingSummary.totalBilled)}</p>
//               </div>
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border shadow-sm">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="p-2 rounded-lg bg-amber-50"><Warning className="text-amber-600 text-lg" /></div>
//                   <span className="text-xs text-gray-500">YTD</span>
//                 </div>
//                 <p className="text-sm text-gray-500 mb-1">Your Responsibility</p>
//                 <p className="text-2xl font-bold">{formatCurrency(billingSummary.patientResponsibility)}</p>
//               </div>
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border shadow-sm relative overflow-hidden">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="p-2 rounded-lg bg-green-50"><Schedule className="text-green-600 text-lg" /></div>
//                   <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">Due Soon</span>
//                 </div>
//                 <p className="text-sm text-gray-500 mb-1">Current Balance</p>
//                 <p className="text-2xl font-bold">{formatCurrency(billingSummary.outstanding)}</p>
//               </div>
//               <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white">
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//                   </div>
//                   <div><p className="text-xs text-gray-500">Insurance Status</p><p className="text-sm font-semibold">Blue Cross</p></div>
//                 </div>
//                 <div className="flex justify-between"><p className="text-xs">Deductible (Met)</p><p className="text-lg font-bold">$1,200 / $1,500</p></div>
//                 <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden"><div className="h-full w-4/5 bg-green-600 rounded-full"></div></div>
//               </div>
//             </div>

//             {/* Billing History Table with Column Filters */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
//               <div className="px-5 py-4 border-b flex justify-between items-center">
//                 <h2 className="text-base font-semibold flex items-center gap-2"><ReceiptLong className="text-green-600" /> Billing History</h2>
//                 <div className="flex gap-3">
//                   {hasActiveFilters && (
//                     <button
//                       onClick={clearAllFilters}
//                       className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
//                     >
//                       <XIcon className="h-3 w-3" /> Clear Filters
//                     </button>
//                   )}
//                   <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border rounded-lg text-sm">
//                     <option value="last30days">Last 30 Days</option>
//                     <option value="last6months">Last 6 Months</option>
//                     <option value="all">All Time</option>
//                   </select>
//                   <button className="p-2 bg-gray-50 border rounded-lg"><FilterList /></button>
//                 </div>
//               </div>
//               <div className="px-5 pt-2 border-b overflow-x-auto">
//                 <div className="flex space-x-5">
//                   {["all", "paid", "pending", "overdue"].map((tab) => (
//                     <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2.5 px-1 text-sm font-medium ${activeTab === tab ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}>
//                       {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm border-collapse">
//                   <thead className="bg-gray-50 text-gray-500">
//                     <tr className="border-b">
//                       <th className="px-5 py-3 text-left border-r border-gray-200">
//                         <div className="flex items-center gap-1">
//                           Invoice #
//                           <FilterPopover column="invoice" placeholder="Filter by number..." label="Invoice #" />
                          
//                         </div>
//                       </th>
//                       <th className="px-5 py-3 text-left border-r border-gray-200">
//                         <div className="flex items-center gap-1">
//                           Date
//                           <FilterPopover column="date" placeholder="MMM DD, YYYY" label="Date" />
//                         </div>
//                       </th>
//                       <th className="px-5 py-3 text-left border-r border-gray-200">
//                         <div className="flex items-center gap-1">
//                           Description
//                           <FilterPopover column="description" placeholder="Filter description..." label="Description" />
//                         </div>
//                       </th>
//                       <th className="px-5 py-3 text-right border-r border-gray-200">
//                         <div className="flex items-center justify-end gap-1">
//                           Amount
//                           <FilterPopover column="amount" placeholder="e.g., 100" label="Amount" />
//                         </div>
//                       </th>
//                       <th className="px-5 py-3 text-left border-r border-gray-200">
//                         <div className="flex items-center gap-1">
//                           Status
//                           <FilterPopover column="status" placeholder="Paid/Pending/Partial" label="Status" />
//                         </div>
//                       </th>
//                       <th className="px-5 py-3 text-center">Details</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {filteredTransactions.map((tx) => (
//                       <React.Fragment key={tx.id}>
//                         <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(tx.id)}>
//                           <td className="px-5 py-3 border-r border-gray-200 font-mono text-xs">{tx.id}</td>
//                           <td className="px-5 py-3 border-r border-gray-200">{tx.date}</td>
//                           <td className="px-5 py-3 border-r border-gray-200">{tx.description}</td>
//                           <td className="px-5 py-3 text-right border-r border-gray-200 font-semibold">{formatCurrency(tx.amount)}</td>
//                           <td className="px-5 py-3 border-r border-gray-200"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>{tx.statusText}</span></td>
//                           <td className="px-5 py-3 text-center">
//                             <button className="text-green-600 hover:text-green-800">
//                               {expandedRow === tx.id ? "▲" : "▼"}
//                             </button>
//                           </td>
//                         </tr>
//                         {expandedRow === tx.id && tx.items && tx.items.length > 0 && (
//                           <tr className="bg-gray-50">
//                             <td colSpan={6} className="px-5 py-3">
//                               <div className="pl-8">
//                                 <h4 className="font-semibold text-sm mb-2">Itemised Breakdown</h4>
//                                 <table className="w-full text-xs border">
//                                   <thead className="bg-gray-100">
//                                     <tr className="border-b">
//                                       <th className="px-3 py-2 text-left border-r">Item</th>
//                                       <th className="px-3 py-2 text-right border-r">Qty</th>
//                                       <th className="px-3 py-2 text-right border-r">Unit Price</th>
//                                       <th className="px-3 py-2 text-right">Total</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {tx.items.map((item: any, idx: number) => (
//                                       <tr key={idx} className="border-t">
//                                         <td className="px-3 py-2 border-r">{item.medicine_name}</td>
//                                         <td className="px-3 py-2 text-right border-r">{item.quantity}</td>
//                                         <td className="px-3 py-2 text-right border-r">{formatCurrency(item.unit_price)}</td>
//                                         <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total_price)}</td>
//                                       </tr>
//                                     ))}
//                                   </tbody>
//                                 </table>
//                                 {tx.balance > 0 && (
//                                   <p className="mt-2 text-xs text-red-600">Balance due: {formatCurrency(tx.balance)}</p>
//                                 )}
//                               </div>
//                             </td>
//                           </tr>
//                         )}
//                       </React.Fragment>
//                     ))}
//                     {filteredTransactions.length === 0 && (
//                       <tr>
//                         <td colSpan={6} className="px-5 py-12 text-center text-gray-500">No transactions found.</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
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
    if (activeTab === "paid" && tx.status !== "paid") return false;
    if (activeTab === "pending" && !["pending", "partial"].includes(tx.status)) return false;
    if (activeTab === "overdue" && tx.balance <= 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!tx.id.toLowerCase().includes(q) && !tx.description.toLowerCase().includes(q)) return false;
    }
    if (filters.invoice && !tx.id.toLowerCase().includes(filters.invoice.toLowerCase())) return false;
    if (filters.date && !tx.date.toLowerCase().includes(filters.date.toLowerCase())) return false;
    if (filters.description && !tx.description.toLowerCase().includes(filters.description.toLowerCase())) return false;
    if (filters.amount && !tx.amount.toString().includes(filters.amount)) return false;
    if (filters.status && !tx.statusText.toLowerCase().includes(filters.status.toLowerCase())) return false;
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount);
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
        {isSidebarOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                <div className="flex justify-between"><p className="text-xs">Deductible (Met)</p><p className="text-lg font-bold">₹1,200 / ₹1,500</p></div>
                <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden"><div className="h-full w-4/5 bg-green-600 rounded-full"></div></div>
              </div>
            </div>

            {/* Billing History Table */}
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