

// 'use client';

// import React, { useState, useEffect, useRef } from "react";
// import Sidebar from "@/components/patient/Sidebar";
// import {
//   ReceiptLong,
//   Warning,
//   Schedule,
//   LocalHospital,
//   Bed,
//   LocalPharmacy,
// } from "@mui/icons-material";
// import { Menu, X as XIcon, Filter } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// export default function PatientBillingPage() {
//   const [activeTab, setActiveTab] = useState("all");
//   const [categoryFilter, setCategoryFilter] = useState<string>("all");
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
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Column filters
//   const [columnFilters, setColumnFilters] = useState<{ column: string; value: string }[]>([]);
//   const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount);
//   };

//   // Helper to assign a category based on transaction description
//   const getCategory = (tx: any): string => {
//     const desc = (tx.description || "").toLowerCase();
//     if (desc.includes("admission") || desc.includes("inpatient") || desc.includes("ward")) return "admission";
//     if (desc.includes("bed") || desc.includes("room rent")) return "bed";
//     if (desc.includes("pharmacy") || desc.includes("medicine") || desc.includes("drug")) return "pharmacy";
//     return "admission";
//   };

//   const categories = [
//     { key: "all", label: "All", icon: ReceiptLong, color: "gray" },
//     { key: "admission", label: "Admission", icon: LocalHospital, color: "blue" },
//     { key: "bed", label: "Bed", icon: Bed, color: "green" },
//     { key: "pharmacy", label: "Pharmacy", icon: LocalPharmacy, color: "orange" },
//   ];

//   const getIconColor = (color: string) => {
//     const colors: Record<string, string> = {
//       blue: "text-blue-600",
//       green: "text-green-600",
//       orange: "text-orange-600",
//       gray: "text-gray-600",
//     };
//     return colors[color] || "text-gray-600";
//   };

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
//         const txRes = await fetch(`/api/appointments/patient/billing/transactions?patientId=${user.patient_id}`);
//         const txData = await txRes.json();
//         if (txData.success) {
//           setTransactions(txData.data.transactions);
//           setBillingSummary(txData.data.billingSummary);
//         } else {
//           setError(txData.message || "Failed to load billing data");
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

//   const allItems = React.useMemo(() => {
//     return transactions.map(tx => ({
//       ...tx,
//       _displayDescription: tx.description,
//       _items: tx.items || [],
//       _category: getCategory(tx),
//     }));
//   }, [transactions]);

//   const filteredTransactions = allItems.filter((tx) => {
//     if (activeTab === "paid" && tx.status !== "paid") return false;
//     if (activeTab === "pending" && !["pending", "partial"].includes(tx.status)) return false;
//     if (activeTab === "overdue" && tx.balance <= 0) return false;
//     if (categoryFilter !== "all" && tx._category !== categoryFilter) return false;
//     if (searchQuery) {
//       const q = searchQuery.toLowerCase();
//       if (!tx.id.toLowerCase().includes(q) && !tx._displayDescription.toLowerCase().includes(q)) return false;
//     }
    
//     // Column filters
//     const matchesColumnFilters = columnFilters.every((filter) => {
//       let value: string | undefined;
//       switch (filter.column) {
//         case "invoice":
//           value = tx.id;
//           break;
//         case "description":
//           value = tx._displayDescription;
//           break;
//         case "amount":
//           value = tx.amount.toString();
//           break;
//         case "status":
//           value = tx.statusText;
//           break;
//         default:
//           return true;
//       }
//       return value?.toLowerCase().includes(filter.value.toLowerCase());
//     });
    
//     // Date filter
//     let matchesDateFilters = true;
//     const dateRange = dateFilters.date;
//     if (dateRange && (dateRange.from || dateRange.to)) {
//       const recordDate = new Date(tx.date);
//       if (dateRange.from && new Date(recordDate) < new Date(dateRange.from)) matchesDateFilters = false;
//       if (dateRange.to && new Date(recordDate) > new Date(dateRange.to)) matchesDateFilters = false;
//     }
    
//     return matchesColumnFilters && matchesDateFilters;
//   });

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "paid": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
//       case "partial": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
//       case "pending": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
//       default: return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
//     }
//   };

//   const toggleExpand = (id: string) => setExpandedRow(expandedRow === id ? null : id);

//   const handleColumnFilter = (column: string, value: string) => {
//     setColumnFilters((prev) => {
//       const filtered = prev.filter((f) => f.column !== column);
//       return value ? [...filtered, { column, value }] : filtered;
//     });
//   };

//   const handleDateRangeFilter = (column: string, from: string, to: string) => {
//     setDateFilters((prev) => {
//       const newFilters = { ...prev };
//       if (from || to) {
//         newFilters[column] = { from, to };
//       } else {
//         delete newFilters[column];
//       }
//       return newFilters;
//     });
//   };

//   const clearAllFilters = () => {
//     setColumnFilters([]);
//     setDateFilters({});
//     setSearchQuery("");
//     setCategoryFilter("all");
//     setActiveTab("all");
//   };

//   const hasActiveFilters = columnFilters.length > 0 || Object.keys(dateFilters).length > 0 || categoryFilter !== "all" || searchQuery !== "";

//   // Column Filter Popover Component
//   const ColumnFilterPopover = ({ column, placeholder, options }: { column: string; placeholder?: string; options?: string[] }) => {
//     const [open, setOpen] = useState(false);
//     const [filterValue, setFilterValue] = useState("");
//     const currentValue = columnFilters.find((f) => f.column === column)?.value || "";

//     const handleApply = () => {
//       handleColumnFilter(column, filterValue);
//       setOpen(false);
//     };

//     const handleClear = () => {
//       setFilterValue("");
//       handleColumnFilter(column, "");
//       setOpen(false);
//     };

//     return (
//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <button
//             className={`ml-1 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
//               currentValue ? "text-green-600 dark:text-green-400" : "text-gray-400"
//             }`}
//           >
//             <Filter className="h-3.5 w-3.5" />
//           </button>
//         </PopoverTrigger>
//         <PopoverContent className="w-64 p-4" align="start">
//           <div className="space-y-4">
//             <h4 className="font-medium text-sm">Filter by {column}</h4>
//             {options ? (
//               <div className="space-y-2 max-h-48 overflow-y-auto">
//                 {options.map((opt) => (
//                   <button
//                     key={opt}
//                     onClick={() => {
//                       setFilterValue(opt);
//                       handleColumnFilter(column, opt);
//                       setOpen(false);
//                     }}
//                     className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                       currentValue === opt ? "bg-green-50 dark:bg-green-900/20 text-green-600" : ""
//                     }`}
//                   >
//                     {opt}
//                   </button>
//                 ))}
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 <Input
//                   placeholder={placeholder}
//                   value={filterValue}
//                   onChange={(e) => setFilterValue(e.target.value)}
//                   className="h-8"
//                 />
//               </div>
//             )}
//             <div className="flex justify-between gap-2">
//               <Button variant="outline" size="sm" onClick={handleClear} className="flex-1">
//                 Clear
//               </Button>
//               <Button size="sm" onClick={handleApply} className="flex-1">
//                 Apply
//               </Button>
//             </div>
//           </div>
//         </PopoverContent>
//       </Popover>
//     );
//   };

//   // Date Range Filter Popover Component
//   const DateRangeFilterPopover = ({ column }: { column: string }) => {
//     const [open, setOpen] = useState(false);
//     const [from, setFrom] = useState("");
//     const [to, setTo] = useState("");
//     const currentRange = dateFilters[column];

//     const handleApply = () => {
//       handleDateRangeFilter(column, from, to);
//       setOpen(false);
//     };

//     const handleClear = () => {
//       setFrom("");
//       setTo("");
//       handleDateRangeFilter(column, "", "");
//       setOpen(false);
//     };

//     return (
//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <button
//             className={`ml-1 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
//               currentRange?.from || currentRange?.to ? "text-green-600 dark:text-green-400" : "text-gray-400"
//             }`}
//           >
//             <Filter className="h-3.5 w-3.5" />
//           </button>
//         </PopoverTrigger>
//         <PopoverContent className="w-64 p-4" align="start">
//           <div className="space-y-4">
//             <h4 className="font-medium text-sm">Date Range</h4>
//             <div className="space-y-2">
//               <div className="space-y-1">
//                 <Label htmlFor="from">From</Label>
//                 <Input
//                   id="from"
//                   type="date"
//                   value={from}
//                   onChange={(e) => setFrom(e.target.value)}
//                   className="h-8"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <Label htmlFor="to">To</Label>
//                 <Input
//                   id="to"
//                   type="date"
//                   value={to}
//                   onChange={(e) => setTo(e.target.value)}
//                   className="h-8"
//                 />
//               </div>
//             </div>
//             <div className="flex justify-between gap-2">
//               <Button variant="outline" size="sm" onClick={handleClear} className="flex-1">
//                 Clear
//               </Button>
//               <Button size="sm" onClick={handleApply} className="flex-1">
//                 Apply
//               </Button>
//             </div>
//           </div>
//         </PopoverContent>
//       </Popover>
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
//       <button className="lg:hidden fixed bottom-20 right-6 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
//         {isSidebarOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//       </button>
//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//       {isSidebarOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

//       <div className="flex-1 flex flex-col w-full lg:ml-0 min-w-0">
//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
//           <div className="max-w-7xl mx-auto space-y-6">
//             {/* Header */}
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
//                   <ReceiptLong className="text-green-600 dark:text-green-400 text-xl" />
//                 </div>
//                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
//               </div>
//               <p className="text-sm text-gray-500 dark:text-gray-400 ml-1">View your statements, payment history, and outstanding balances.</p>
//             </div>

//             {/* Summary Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border shadow-sm">
//                 <div className="flex items-center justify-between mb-3"><div className="p-2 rounded-lg bg-blue-50"><ReceiptLong className="text-blue-600 text-lg" /></div><span className="text-xs text-gray-500">Lifetime</span></div>
//                 <p className="text-sm text-gray-500 mb-1">Total Billed</p>
//                 <p className="text-2xl font-bold">{formatCurrency(billingSummary.totalBilled)}</p>
//               </div>
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border shadow-sm">
//                 <div className="flex items-center justify-between mb-3"><div className="p-2 rounded-lg bg-amber-50"><Warning className="text-amber-600 text-lg" /></div><span className="text-xs text-gray-500">YTD</span></div>
//                 <p className="text-sm text-gray-500 mb-1">Your Responsibility</p>
//                 <p className="text-2xl font-bold">{formatCurrency(billingSummary.patientResponsibility)}</p>
//               </div>
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border shadow-sm relative overflow-hidden">
//                 <div className="flex items-center justify-between mb-3"><div className="p-2 rounded-lg bg-green-50"><Schedule className="text-green-600 text-lg" /></div><span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">Due Soon</span></div>
//                 <p className="text-sm text-gray-500 mb-1">Current Balance</p>
//                 <p className="text-2xl font-bold">{formatCurrency(billingSummary.outstanding)}</p>
//               </div>
//               <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
//                   <div><p className="text-xs text-gray-500">Insurance Status</p><p className="text-sm font-semibold">Blue Cross</p></div>
//                 </div>
//                 <div className="flex justify-between"><p className="text-xs">Deductible (Met)</p><p className="text-lg font-bold"></p></div>
//               </div>
//             </div>

//             {/* Category Filter Chips */}
//             <div className="flex flex-wrap gap-2 border-b pb-3">
//               {categories.map(cat => {
//                 const isActive = categoryFilter === cat.key;
//                 const activeClass = isActive
//                   ? `bg-${cat.color}-600 text-white`
//                   : `bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300`;
//                 return (
//                   <button
//                     key={cat.key}
//                     onClick={() => setCategoryFilter(cat.key)}
//                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeClass}`}
//                   >
//                     {cat.label}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Status Tabs and Search */}
//             <div className="flex flex-col gap-4 mb-6">
//               <div className="overflow-x-auto pb-2 -mx-4 px-4">
//                 <div className="flex space-x-5">
//                   {["all", "paid", "pending", "overdue"].map((tab) => (
//                     <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2.5 px-1 text-sm font-medium ${activeTab === tab ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}>
//                       {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-3">
//                 <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border rounded-lg text-sm w-full sm:w-[160px]">
//                   <option value="last30days">Last 30 Days</option>
//                   <option value="last6months">Last 6 Months</option>
//                   <option value="all">All Time</option>
//                 </select>
//                 <input placeholder="Search by invoice or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
//                 {hasActiveFilters && (
//                   <button onClick={clearAllFilters} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 px-3">
//                     <XIcon className="h-3 w-3" /> Clear Filters
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Billing Table */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm border-collapse">
//                   <thead className="bg-gray-50 text-gray-500">
//                     <tr className="border-b">
//                       <th className="px-5 py-3 text-left border-r border-gray-200">
//                         <div className="flex items-center gap-1">
//                           Invoice #
//                           <ColumnFilterPopover column="invoice" placeholder="Filter by invoice number..." />
//                         </div>
//                       </th>
//                       <th className="px-5 py-3 text-left border-r border-gray-200">
//                         <div className="flex items-center gap-1">
//                           Date
//                           <DateRangeFilterPopover column="date" />
//                         </div>
//                       </th>
//                       <th className="px-5 py-3 text-left border-r border-gray-200">
//                         <div className="flex items-center gap-1">
//                           Description
//                           <ColumnFilterPopover column="description" placeholder="Filter by description..." />
//                         </div>
//                       </th>
//                       <th className="px-5 py-3 text-right border-r border-gray-200">
//                         <div className="flex items-center justify-end gap-1">
//                           Amount
//                           <ColumnFilterPopover column="amount" placeholder="Filter by amount..." />
//                         </div>
//                       </th>
//                       <th className="px-5 py-3 text-left border-r border-gray-200">
//                         <div className="flex items-center gap-1">
//                           Status
//                           <ColumnFilterPopover column="status" options={["Paid", "Pending", "Partial"]} />
//                         </div>
//                       </th>
//                       <th className="px-5 py-3 text-center">Details</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {filteredTransactions.map((tx) => {
//                       const category = categories.find(c => c.key === tx._category) || categories[0];
//                       const Icon = category.icon;
//                       const iconColor = getIconColor(category.color);
//                       return (
//                         <React.Fragment key={tx.id}>
//                           <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(tx.id)}>
//                             <td className="px-5 py-3 border-r border-gray-200">
//                               <div className="flex items-center gap-2">
//                                 <Icon className={`${iconColor} h-4 w-4`} />
//                                 <span className="font-mono text-xs">{tx.id}</span>
//                               </div>
//                             </td>
//                             <td className="px-5 py-3 border-r border-gray-200">{tx.date}</td>
//                             <td className="px-5 py-3 border-r border-gray-200">{tx._displayDescription}</td>
//                             <td className="px-5 py-3 text-right border-r border-gray-200 font-semibold">{formatCurrency(tx.amount)}</td>
//                             <td className="px-5 py-3 border-r border-gray-200">
//                               <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
//                                 {tx.statusText}
//                               </span>
//                             </td>
//                             <td className="px-5 py-3 text-center">
//                               <button className="text-green-600 hover:text-green-800">
//                                 {expandedRow === tx.id ? "▲" : "▼"}
//                               </button>
//                             </td>
//                           </tr>
//                           {expandedRow === tx.id && tx._items && tx._items.length > 0 && (
//                             <tr className="bg-gray-50">
//                               <td colSpan={6} className="px-5 py-3">
//                                 <div className="pl-8">
//                                   <h4 className="font-semibold text-sm mb-2">Itemised Breakdown</h4>
//                                   <table className="w-full text-xs border">
//                                     <thead className="bg-gray-100">
//                                       <tr className="border-b">
//                                         <th className="px-3 py-2 text-left border-r">Item</th>
//                                         <th className="px-3 py-2 text-right border-r">Qty</th>
//                                         <th className="px-3 py-2 text-right border-r">Unit Price</th>
//                                         <th className="px-3 py-2 text-right">Total</th>
//                                       </tr>
//                                     </thead>
//                                     <tbody>
//                                       {tx._items.map((item: any, idx: number) => (
//                                         <tr key={idx} className="border-t">
//                                           <td className="px-3 py-2 border-r">{item.medicine_name || item.name}</td>
//                                           <td className="px-3 py-2 text-right border-r">{item.quantity}</td>
//                                           <td className="px-3 py-2 text-right border-r">{formatCurrency(item.unit_price)}</td>
//                                           <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total_price)}</td>
//                                         </tr>
//                                       ))}
//                                     </tbody>
//                                   </table>
//                                   {tx.balance > 0 && <p className="mt-2 text-xs text-red-600">Balance due: {formatCurrency(tx.balance)}</p>}
//                                 </div>
//                                </td>
//                              </tr>
//                           )}
//                         </React.Fragment>
//                       );
//                     })}
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
  Warning,
  Schedule,
  LocalHospital,
  Bed,
  LocalPharmacy,
} from "@mui/icons-material";
import { Menu, X as XIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function PatientBillingPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Column filters
  const [columnFilters, setColumnFilters] = useState<{ column: string; value: string }[]>([]);
  const [dateFilters, setDateFilters] = useState<Record<string, { from: string; to: string }>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount);
  };

  // Helper to assign a category based on transaction description
  const getCategory = (tx: any): string => {
    const desc = (tx.description || "").toLowerCase();
    if (desc.includes("admission") || desc.includes("inpatient") || desc.includes("ward")) return "admission";
    if (desc.includes("bed") || desc.includes("room rent")) return "bed";
    if (desc.includes("pharmacy") || desc.includes("medicine") || desc.includes("drug")) return "pharmacy";
    return "admission";
  };

  const categories = [
    { key: "all", label: "All", icon: ReceiptLong, color: "gray" },
    { key: "admission", label: "Admission", icon: LocalHospital, color: "teal" },
    { key: "bed", label: "Bed", icon: Bed, color: "green" },
    { key: "pharmacy", label: "Pharmacy", icon: LocalPharmacy, color: "orange" },
  ];

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      teal: "text-[#2BB2A7]",
      green: "text-[#86C94C]",
      orange: "text-orange-600",
      gray: "text-gray-600 dark:text-gray-400",
    };
    return colors[color] || "text-gray-600 dark:text-gray-400";
  };

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
        const txRes = await fetch(`/api/appointments/patient/billing/transactions?patientId=${user.patient_id}`);
        const txData = await txRes.json();
        if (txData.success) {
          setTransactions(txData.data.transactions);
          setBillingSummary(txData.data.billingSummary);
        } else {
          setError(txData.message || "Failed to load billing data");
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

  const allItems = React.useMemo(() => {
    return transactions.map(tx => ({
      ...tx,
      _displayDescription: tx.description,
      _items: tx.items || [],
      _category: getCategory(tx),
    }));
  }, [transactions]);

  const filteredTransactions = allItems.filter((tx) => {
    if (activeTab === "paid" && tx.status !== "paid") return false;
    if (activeTab === "pending" && !["pending", "partial"].includes(tx.status)) return false;
    if (activeTab === "overdue" && tx.balance <= 0) return false;
    if (categoryFilter !== "all" && tx._category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!tx.id.toLowerCase().includes(q) && !tx._displayDescription.toLowerCase().includes(q)) return false;
    }
    
    // Column filters
    const matchesColumnFilters = columnFilters.every((filter) => {
      let value: string | undefined;
      switch (filter.column) {
        case "invoice":
          value = tx.id;
          break;
        case "description":
          value = tx._displayDescription;
          break;
        case "amount":
          value = tx.amount.toString();
          break;
        case "status":
          value = tx.statusText;
          break;
        default:
          return true;
      }
      return value?.toLowerCase().includes(filter.value.toLowerCase());
    });
    
    // Date filter
    let matchesDateFilters = true;
    const dateRange = dateFilters.date;
    if (dateRange && (dateRange.from || dateRange.to)) {
      const recordDate = new Date(tx.date);
      if (dateRange.from && new Date(recordDate) < new Date(dateRange.from)) matchesDateFilters = false;
      if (dateRange.to && new Date(recordDate) > new Date(dateRange.to)) matchesDateFilters = false;
    }
    
    return matchesColumnFilters && matchesDateFilters;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return "bg-[#EAF7F4] text-[#1F8F89] dark:bg-[#1F8F89]/20 dark:text-[#2BB2A7]";
      case "partial": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "pending": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  const toggleExpand = (id: string) => setExpandedRow(expandedRow === id ? null : id);

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.column !== column);
      return value ? [...filtered, { column, value }] : filtered;
    });
  };

  const handleDateRangeFilter = (column: string, from: string, to: string) => {
    setDateFilters((prev) => {
      const newFilters = { ...prev };
      if (from || to) {
        newFilters[column] = { from, to };
      } else {
        delete newFilters[column];
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setColumnFilters([]);
    setDateFilters({});
    setSearchQuery("");
    setCategoryFilter("all");
    setActiveTab("all");
  };

  const hasActiveFilters = columnFilters.length > 0 || Object.keys(dateFilters).length > 0 || categoryFilter !== "all" || searchQuery !== "";

  // Column Filter Popover Component
  const ColumnFilterPopover = ({ column, placeholder, options }: { column: string; placeholder?: string; options?: string[] }) => {
    const [open, setOpen] = useState(false);
    const [filterValue, setFilterValue] = useState("");
    const currentValue = columnFilters.find((f) => f.column === column)?.value || "";

    const handleApply = () => {
      handleColumnFilter(column, filterValue);
      setOpen(false);
    };

    const handleClear = () => {
      setFilterValue("");
      handleColumnFilter(column, "");
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`ml-1 p-1 rounded-md hover:bg-[#EAF7F4] dark:hover:bg-gray-700 transition-colors ${
              currentValue ? "text-[#2BB2A7] dark:text-[#2BB2A7]" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 bg-white dark:bg-gray-800 border border-[#E2EFEA] dark:border-gray-700 shadow-lg" align="start">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Filter by {column}</h4>
            {options ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setFilterValue(opt);
                      handleColumnFilter(column, opt);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-[#EAF7F4] dark:hover:bg-gray-700 ${
                      currentValue === opt ? "bg-[#EAF7F4] dark:bg-[#1F8F89]/20 text-[#2BB2A7] dark:text-[#2BB2A7]" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder={placeholder}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="h-8 focus:ring-[#2BB2A7] focus:border-[#2BB2A7] border-[#E2EFEA] dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
            <div className="flex justify-between gap-2">
              <Button variant="outline" size="sm" onClick={handleClear} className="flex-1 border-[#E2EFEA] dark:border-gray-700 hover:border-[#2BB2A7] dark:hover:border-[#2BB2A7] text-gray-700 dark:text-gray-300">
                Clear
              </Button>
              <Button size="sm" onClick={handleApply} className="flex-1 bg-[#2BB2A7] hover:bg-[#1F8F89] text-white">
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Date Range Filter Popover Component
  const DateRangeFilterPopover = ({ column }: { column: string }) => {
    const [open, setOpen] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const currentRange = dateFilters[column];

    const handleApply = () => {
      handleDateRangeFilter(column, from, to);
      setOpen(false);
    };

    const handleClear = () => {
      setFrom("");
      setTo("");
      handleDateRangeFilter(column, "", "");
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`ml-1 p-1 rounded-md hover:bg-[#EAF7F4] dark:hover:bg-gray-700 transition-colors ${
              currentRange?.from || currentRange?.to ? "text-[#2BB2A7] dark:text-[#2BB2A7]" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 bg-white dark:bg-gray-800 border border-[#E2EFEA] dark:border-gray-700 shadow-lg" align="start">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Date Range</h4>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="from" className="text-gray-700 dark:text-gray-300">From</Label>
                <Input
                  id="from"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-8 focus:ring-[#2BB2A7] focus:border-[#2BB2A7] border-[#E2EFEA] dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="to" className="text-gray-700 dark:text-gray-300">To</Label>
                <Input
                  id="to"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="h-8 focus:ring-[#2BB2A7] focus:border-[#2BB2A7] border-[#E2EFEA] dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="outline" size="sm" onClick={handleClear} className="flex-1 border-[#E2EFEA] dark:border-gray-700 hover:border-[#2BB2A7] dark:hover:border-[#2BB2A7] text-gray-700 dark:text-gray-300">
                Clear
              </Button>
              <Button size="sm" onClick={handleApply} className="flex-1 bg-[#2BB2A7] hover:bg-[#1F8F89] text-white">
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-[#2BB2A7] border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <button 
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] hover:opacity-90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center" 
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
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#EAF7F4] dark:bg-[#1F8F89]/20 flex items-center justify-center">
                  <ReceiptLong className="text-[#2BB2A7] dark:text-[#2BB2A7] text-xl" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-1">View your statements, payment history, and outstanding balances.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-[#E2EFEA] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-[#EAF7F4] dark:bg-[#1F8F89]/20"><ReceiptLong className="text-[#2BB2A7] dark:text-[#2BB2A7] text-lg" /></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Lifetime</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Billed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(billingSummary.totalBilled)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-[#E2EFEA] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20"><Warning className="text-amber-600 dark:text-amber-400 text-lg" /></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">YTD</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Responsibility</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(billingSummary.patientResponsibility)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-[#E2EFEA] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-[#EAF7F4] dark:bg-[#1F8F89]/20"><Schedule className="text-[#2BB2A7] dark:text-[#2BB2A7] text-lg" /></div>
                  <span className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full">Due Soon</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(billingSummary.outstanding)}</p>
              </div>
              <div className="bg-gradient-to-br from-[#EAF7F4] to-[#F4F9F7] dark:from-[#1F8F89]/20 dark:to-[#2BB2A7]/10 rounded-xl p-5 border border-[#2BB2A7]/30 dark:border-[#2BB2A7]/20 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Insurance Status</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Blue Cross</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Deductible (Met)</p>
                  <p className="text-lg font-bold text-[#2BB2A7]">✓</p>
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2 border-b border-[#E2EFEA] dark:border-gray-700 pb-3">
              {categories.map(cat => {
                const isActive = categoryFilter === cat.key;
                const iconColor = getIconColor(cat.color);
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCategoryFilter(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <cat.icon className={`h-4 w-4 ${isActive ? "text-white" : iconColor}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Status Tabs and Search */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex space-x-5">
                  {["all", "paid", "pending", "overdue"].map((tab) => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)} 
                      className={`pb-2.5 px-1 text-sm font-medium transition-colors ${
                        activeTab === tab 
                          ? "text-[#2BB2A7] dark:text-[#2BB2A7] border-b-2 border-[#2BB2A7]" 
                          : "text-gray-500 dark:text-gray-400 hover:text-[#2BB2A7] dark:hover:text-[#2BB2A7]"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)} 
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm w-full sm:w-[160px] focus:ring-2 focus:ring-[#2BB2A7] focus:border-[#2BB2A7] text-gray-900 dark:text-gray-100"
                >
                  <option value="last30days">Last 30 Days</option>
                  <option value="last6months">Last 6 Months</option>
                  <option value="all">All Time</option>
                </select>
                <input 
                  placeholder="Search by invoice or description..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#2BB2A7] focus:border-[#2BB2A7] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500" 
                />
                {hasActiveFilters && (
                  <button 
                    onClick={clearAllFilters} 
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 px-3"
                  >
                    <XIcon className="h-3 w-3" /> Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Billing Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E2EFEA] dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-[#F4F9F7] dark:bg-gray-800/50">
                    <tr className="border-b border-[#E2EFEA] dark:border-gray-700">
                      <th className="px-5 py-3 text-left border-r border-[#E2EFEA] dark:border-gray-700">
                        <div className="flex items-center gap-1 text-[#1F8F89] dark:text-[#2BB2A7]">
                          Invoice #
                          <ColumnFilterPopover column="invoice" placeholder="Filter by invoice number..." />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left border-r border-[#E2EFEA] dark:border-gray-700">
                        <div className="flex items-center gap-1 text-[#1F8F89] dark:text-[#2BB2A7]">
                          Date
                          <DateRangeFilterPopover column="date" />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left border-r border-[#E2EFEA] dark:border-gray-700">
                        <div className="flex items-center gap-1 text-[#1F8F89] dark:text-[#2BB2A7]">
                          Description
                          <ColumnFilterPopover column="description" placeholder="Filter by description..." />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-right border-r border-[#E2EFEA] dark:border-gray-700">
                        <div className="flex items-center justify-end gap-1 text-[#1F8F89] dark:text-[#2BB2A7]">
                          Amount
                          <ColumnFilterPopover column="amount" placeholder="Filter by amount..." />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left border-r border-[#E2EFEA] dark:border-gray-700">
                        <div className="flex items-center gap-1 text-[#1F8F89] dark:text-[#2BB2A7]">
                          Status
                          <ColumnFilterPopover column="status" options={["Paid", "Pending", "Partial"]} />
                        </div>
                      </th>
                      <th className="px-5 py-3 text-center text-[#1F8F89] dark:text-[#2BB2A7]">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2EFEA] dark:divide-gray-700">
                    {filteredTransactions.map((tx) => {
                      const category = categories.find(c => c.key === tx._category) || categories[0];
                      const Icon = category.icon;
                      const iconColor = getIconColor(category.color);
                      return (
                        <React.Fragment key={tx.id}>
                          <tr className="hover:bg-[#EAF7F4]/50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors" onClick={() => toggleExpand(tx.id)}>
                            <td className="px-5 py-3 border-r border-[#E2EFEA] dark:border-gray-700">
                              <div className="flex items-center gap-2">
                                <Icon className={`${iconColor} h-4 w-4`} />
                                <span className="font-mono text-xs text-gray-900 dark:text-white">{tx.id}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 border-r border-[#E2EFEA] dark:border-gray-700 text-gray-600 dark:text-gray-300">{tx.date}</td>
                            <td className="px-5 py-3 border-r border-[#E2EFEA] dark:border-gray-700 text-gray-600 dark:text-gray-300">{tx._displayDescription}</td>
                            <td className="px-5 py-3 text-right border-r border-[#E2EFEA] dark:border-gray-700 font-semibold text-gray-900 dark:text-white">{formatCurrency(tx.amount)}</td>
                            <td className="px-5 py-3 border-r border-[#E2EFEA] dark:border-gray-700">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
                                {tx.statusText}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <button className="text-[#2BB2A7] hover:text-[#1F8F89] dark:hover:text-[#1F8F89] transition-colors">
                                {expandedRow === tx.id ? "▲" : "▼"}
                              </button>
                            </td>
                          </tr>
                          {expandedRow === tx.id && tx._items && tx._items.length > 0 && (
                            <tr className="bg-[#F4F9F7] dark:bg-gray-800/50">
                              <td colSpan={6} className="px-5 py-3">
                                <div className="pl-8">
                                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Itemised Breakdown</h4>
                                  <table className="w-full text-xs border border-[#E2EFEA] dark:border-gray-700">
                                    <thead className="bg-white dark:bg-gray-800">
                                      <tr className="border-b border-[#E2EFEA] dark:border-gray-700">
                                        <th className="px-3 py-2 text-left border-r border-[#E2EFEA] dark:border-gray-700 text-[#1F8F89] dark:text-[#2BB2A7]">Item</th>
                                        <th className="px-3 py-2 text-right border-r border-[#E2EFEA] dark:border-gray-700 text-[#1F8F89] dark:text-[#2BB2A7]">Qty</th>
                                        <th className="px-3 py-2 text-right border-r border-[#E2EFEA] dark:border-gray-700 text-[#1F8F89] dark:text-[#2BB2A7]">Unit Price</th>
                                        <th className="px-3 py-2 text-right text-[#1F8F89] dark:text-[#2BB2A7]">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {tx._items.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-t border-[#E2EFEA] dark:border-gray-700">
                                          <td className="px-3 py-2 border-r border-[#E2EFEA] dark:border-gray-700 text-gray-600 dark:text-gray-300">{item.medicine_name || item.name}</td>
                                          <td className="px-3 py-2 text-right border-r border-[#E2EFEA] dark:border-gray-700 text-gray-600 dark:text-gray-300">{item.quantity}</td>
                                          <td className="px-3 py-2 text-right border-r border-[#E2EFEA] dark:border-gray-700 text-gray-600 dark:text-gray-300">{formatCurrency(item.unit_price)}</td>
                                          <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.total_price)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {tx.balance > 0 && <p className="mt-2 text-xs text-red-600 dark:text-red-400">Balance due: {formatCurrency(tx.balance)}</p>}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">No transactions found.</td>
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