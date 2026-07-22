"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/context/TenantContext";
import { MODULE_KEYS, LABARATORY_FEATURES } from "@/lib/feature";
import Card from "@/components/laboratory/Card";
import {
  FileText,
  Search,
  Download,
  Printer,
  Eye,
  X,
  Calendar,
  User,
  FileCheck,
  BarChart3,
  DollarSign,
  Grid3x3,
  Table2,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

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
  const router = useRouter();
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();
  
  const [selectedReport, setSelectedReport] = useState<CompletedReport | null>(null);
  const [filter, setFilter] = useState("");
  const [reports, setReports] = useState<CompletedReport[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [loading, setLoading] = useState(true);

  const isReportsEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.LABARATORY,
    LABARATORY_FEATURES.REPORTS
  );

  useEffect(() => {
    if (!tenantLoading && !isReportsEnabled) {
      router.push("/unauthorized");
    }
  }, [tenantLoading, isReportsEnabled, router]);

  useEffect(() => {
    if (isReportsEnabled) {
      fetchReports();
    }
  }, [isReportsEnabled]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/laboratory/reports");
      const result = await response.json();
      
      if (result.success) {
        setReports(result.data || []);
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

  const totalRevenue = filteredReports.reduce((sum, report) => {
    const amount = typeof report.total_amount === 'number' 
      ? report.total_amount 
      : Number(report.total_amount) || 0;
    return sum + amount;
  }, 0);

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

  if (!isReportsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-[#E2EFEA] dark:border-gray-700">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Lab Reports feature is not enabled for {tenant?.name}.
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reports...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lab Reports</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View completed test reports</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === "table" 
                    ? "bg-white dark:bg-gray-600 text-[#2BB2A7] dark:text-white shadow-sm" 
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === "cards" 
                    ? "bg-white dark:bg-gray-600 text-[#2BB2A7] dark:text-white shadow-sm" 
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Grid3x3 className="w-3.5 h-3.5" />
                Cards
              </button>
            </div>
            
            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-[#2BB2A7] text-white rounded-lg hover:bg-[#1F8F89] transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name, order ID, or patient ID..."
            className="w-full md:w-96 pl-9 pr-4 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2BB2A7] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EAF7F4] dark:bg-[#1F8F89]/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#2BB2A7]" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredReports.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-900/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-900/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{filteredReports.length > 0 ? Math.round(totalRevenue / filteredReports.length).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        {viewMode === "table" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F4F9F7] dark:bg-gray-700/30 border-b border-[#E2EFEA] dark:border-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Order ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Patient</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Tests</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Amount</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Completed</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-[#1F8F89] dark:text-[#2BB2A7] uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EFEA] dark:divide-gray-700">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        No completed reports found
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900 dark:text-white">
                          {report.order_id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{report.patient_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {report.patient_id}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex flex-wrap gap-1">
                            {report.tests.slice(0, 2).map((test, idx) => (
                              <span key={idx} className="text-xs">
                                {test.name}{idx < Math.min(report.tests.length, 2) - 1 ? "," : ""}
                              </span>
                            ))}
                            {report.tests.length > 2 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                +{report.tests.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#2BB2A7] text-right">
                          ₹{report.total_amount}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                          {report.completed_date}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-3 py-1.5 bg-[#EAF7F4] text-[#1F8F89] hover:bg-[#2BB2A7] hover:text-white rounded-lg transition-colors text-xs font-medium flex items-center gap-1 mx-auto"
                          >
                            <Eye className="w-3 h-3" />
                            View
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
              <div className="px-4 py-3 bg-[#F4F9F7] dark:bg-gray-700/30 border-t border-[#E2EFEA] dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Reports: <span className="font-semibold text-gray-900 dark:text-white">{filteredReports.length}</span>
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Revenue: <span className="font-semibold text-[#2BB2A7]">
                      ₹{totalRevenue.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Card View */}
        {viewMode === "cards" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {report.patient_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {report.order_id} • {report.patient_id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5 inline mr-1" />
                          {report.completed_date}
                        </p>
                        <p className="text-lg font-bold text-[#2BB2A7] mt-1">
                          ₹{report.total_amount}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {report.tests.slice(0, 3).map((test, idx) => (
                        <div key={idx} className="border-l-2 border-[#2BB2A7] pl-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {test.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {test.result || "No result recorded"}
                          </p>
                        </div>
                      ))}
                      {report.tests.length > 3 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          +{report.tests.length - 3} more tests
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedReport(report)}
                      className="w-full mt-2 px-4 py-2 bg-[#F4F9F7] dark:bg-gray-700 text-[#2BB2A7] hover:bg-[#2BB2A7] hover:text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Full Report
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredReports.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700 p-12 text-center col-span-2">
                  <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No completed reports found</p>
                </div>
              )}
            </div>
            
            {/* Summary Row for Card View */}
            {filteredReports.length > 0 && (
              <div className="mt-6 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E2EFEA] dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Reports: <span className="font-semibold text-gray-900 dark:text-white">{filteredReports.length}</span>
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Revenue: <span className="font-semibold text-[#2BB2A7]">
                      ₹{totalRevenue.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#E2EFEA] dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Laboratory Report
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    Generated on {selectedReport.completed_date}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Header */}
              <div className="bg-[#F4F9F7] dark:bg-gray-700/30 rounded-lg p-6 mb-6 border border-[#E2EFEA] dark:border-gray-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <User className="w-3 h-3 inline mr-1" />
                      Patient Name
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                      {selectedReport.patient_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Patient ID
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                      {selectedReport.patient_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order ID
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                      {selectedReport.order_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Report Date
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                      {selectedReport.completed_date}
                    </p>
                  </div>
                  {selectedReport.collected_date && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sample Collected
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                        {selectedReport.collected_date}
                      </p>
                    </div>
                  )}
                  {selectedReport.billing_entry_id && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Billing Reference
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                        {selectedReport.billing_entry_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Results */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#2BB2A7]" />
                  Test Results
                </h3>
                <div className="space-y-4">
                  {selectedReport.tests.map((test, idx) => (
                    <div
                      key={idx}
                      className="border border-[#E2EFEA] dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <div className="bg-[#F4F9F7] dark:bg-gray-700/30 px-4 py-3 border-b border-[#E2EFEA] dark:border-gray-700 flex justify-between items-center">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {test.name}
                        </p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          ₹{test.price}
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {test.result || "Result not available"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#E2EFEA] dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Authorized by</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Lab Technician
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="text-xl font-bold text-[#2BB2A7]">
                      ₹{selectedReport.total_amount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 border border-[#E2EFEA] dark:border-gray-600 rounded-lg hover:bg-[#EAF7F4] dark:hover:bg-[#1F8F89]/10 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gradient-to-r from-[#2BB2A7] to-[#86C94C] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
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