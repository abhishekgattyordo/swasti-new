"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Calendar, X, Filter, DollarSign, CreditCard, Clock } from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, DOCTOR_FEATURES } from "@/lib/feature";
import { useRouter } from "next/navigation";

interface Invoice {
  id: string;
  appointmentId: string;
  patientName: string;
  patientId: string;
  date: string;
  amount: number;
  status: string;
  method: string | null;
  doctorId: number | null;
  doctorName: string | null;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();
  const router = useRouter();

  const isBillingEnabled = isMicroFeatureEnabled(
    MODULE_KEYS.DOCTOR,
    DOCTOR_FEATURES.BILLING
  );

  const [filters, setFilters] = useState({
    invoiceId: "",
    patient: "",
    date: "",
    amount: "",
    status: "",
    method: "",
  });
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!tenantLoading && !isBillingEnabled) {
      router.push("/unauthorized");
    }
  }, [tenantLoading, isBillingEnabled, router]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const id = user.doctor_id || user.id;
        setDoctorId(id);
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!doctorId) return;
    fetchInvoices();
  }, [doctorId, startDate, endDate]);

  useEffect(() => {
    let filtered = [...invoices];
    if (filters.invoiceId) {
      filtered = filtered.filter(inv => inv.id.toLowerCase().includes(filters.invoiceId.toLowerCase()));
    }
    if (filters.patient) {
      filtered = filtered.filter(inv => inv.patientName.toLowerCase().includes(filters.patient.toLowerCase()));
    }
    if (filters.date) {
      filtered = filtered.filter(inv => inv.date.includes(filters.date));
    }
    if (filters.amount) {
      filtered = filtered.filter(inv => inv.amount.toString().includes(filters.amount));
    }
    if (filters.status) {
      filtered = filtered.filter(inv => inv.status.toLowerCase().includes(filters.status.toLowerCase()));
    }
    if (filters.method) {
      filtered = filtered.filter(inv => (inv.method || "").toLowerCase().includes(filters.method.toLowerCase()));
    }
    setFilteredInvoices(filtered);
  }, [invoices, filters]);

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

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let url = `/api/helpdesk/invoices?doctorId=${doctorId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data);
        setFilteredInvoices(data.data);
      } else {
        toast.error("Failed to load invoices");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
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
      invoiceId: '',
      patient: '',
      date: '',
      amount: '',
      status: '',
      method: '',
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
          className={`ml-1 p-1 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors ${value ? 'text-[#7A329F] dark:text-[#9B4DBF]' : 'text-gray-400'}`}
          aria-label={`Filter by ${label}`}
        >
          <Filter className="h-3.5 w-3.5" />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Filter by {label}
              </h4>
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={e => handleFilterChange(column, e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => clearFilter(column)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpenFilter(null)}
                  className="text-xs bg-[#3B1E6F] hover:bg-[#7A329F] text-white px-3 py-1 rounded transition-colors"
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

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = filteredInvoices
    .filter((i) => i.status.toLowerCase() === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filteredInvoices
    .filter((i) => i.status.toLowerCase() === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B1E6F] dark:text-[#7A329F]" />
      </div>
    );
  }

  if (!tenantLoading && !isBillingEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Doctor Billing feature is not enabled for {tenant?.name}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#3B1E6F] dark:text-white">Billing</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage invoices and payments</p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-[#7A329F] dark:text-[#9B4DBF] hover:text-[#3B1E6F] dark:hover:text-[#7A329F] flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear Filters
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-[#3B1E6F] dark:text-[#7A329F]" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payments</p>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">₹{pendingAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{paidAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Date Filter Row */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Date Range:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A329F] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={clearDateFilter}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-700/30">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    Invoice ID
                    <FilterPopover column="invoiceId" placeholder="Filter by ID..." label="Invoice ID" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    Patient
                    <FilterPopover column="patient" placeholder="Filter by name..." label="Patient" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    Date
                    <FilterPopover column="date" placeholder="YYYY-MM-DD" label="Date" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    Amount (₹)
                    <FilterPopover column="amount" placeholder="e.g., 500" label="Amount" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    Status
                    <FilterPopover column="status" placeholder="Paid/Pending" label="Status" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    Method
                    <FilterPopover column="method" placeholder="Cash/Card/UPI" label="Method" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 font-mono text-xs text-gray-900 dark:text-white">{invoice.id}</td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{invoice.patientName}</td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">{invoice.date}</td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 font-medium text-[#3B1E6F] dark:text-[#7A329F]">₹{invoice.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status.toLowerCase() === "paid"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : invoice.status.toLowerCase() === "pending"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{invoice.method || "-"}</td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No invoices found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredInvoices.length} invoices
          </div>
        )}
      </div>
    </div>
  );
}