

"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Calendar, X, Filter } from "lucide-react";
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



  // Column filters
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
}, [tenantLoading]);

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
    // Apply column filters
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
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

if (!tenantLoading && !isBillingEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Doctor Billing feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Billing</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear Filters
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Pending Payments</p>
          <p className="text-2xl font-bold text-orange-600">₹{pendingAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Paid</p>
          <p className="text-2xl font-bold text-green-600">₹{paidAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Date Filter Row */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Date Range:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={clearDateFilter}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Invoices Table with borders and column filters */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-r border-gray-200">
                  <div className="flex items-center gap-1">
                    Invoice ID
                    <FilterPopover column="invoiceId" placeholder="Filter by ID..." label="Invoice ID" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-r border-gray-200">
                  <div className="flex items-center gap-1">
                    Patient
                    <FilterPopover column="patient" placeholder="Filter by name..." label="Patient" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-r border-gray-200">
                  <div className="flex items-center gap-1">
                    Date
                    <FilterPopover column="date" placeholder="YYYY-MM-DD" label="Date" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-r border-gray-200">
                  <div className="flex items-center gap-1">
                    Amount (₹)
                    <FilterPopover column="amount" placeholder="e.g., 500" label="Amount" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 border-r border-gray-200">
                  <div className="flex items-center gap-1">
                    Status
                    <FilterPopover column="status" placeholder="Paid/Pending" label="Status" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  <div className="flex items-center gap-1">
                    Method
                    <FilterPopover column="method" placeholder="Cash/Card/UPI" label="Method" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-r border-gray-200 font-mono text-xs">{invoice.id}</td>
                  <td className="px-4 py-3 border-r border-gray-200">{invoice.patientName}</td>
                  <td className="px-4 py-3 border-r border-gray-200">{invoice.date}</td>
                  <td className="px-4 py-3 border-r border-gray-200 font-medium">₹{invoice.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      invoice.status.toLowerCase() === "paid"
                        ? "bg-green-100 text-green-600"
                        : invoice.status.toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{invoice.method || "-"}</td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No invoices found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}