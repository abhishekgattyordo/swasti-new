"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Plus, Edit, DollarSign, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import HelpDeskSidebar from "@/components/helpdesk/HelpDeskSidebar";
import { toast } from "sonner";

type Invoice = {
  id: string;               // display ID (e.g., INV-20260330-0001)
  appointmentId: string;    // original appointment UUID
  patientName: string;
  patientId: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  method?: string;
};

export default function BillingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editMethod, setEditMethod] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/helpdesk/invoices");
        const data = await response.json();
        if (data.success) {
          setInvoices(data.data);
        } else {
          setError(data.message || "Failed to load invoices");
          toast.error(data.message || "Failed to load invoices");
        }
      } catch (err) {
        console.error(err);
        setError("Network error. Please try again.");
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      searchQuery === "" ||
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter((inv) => inv.status === "pending").reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0);

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, bgColor: "bg-blue-100", icon: <DollarSign className="w-5 h-5 text-blue-600" /> },
    { title: "Pending Payments", value: `$${pendingAmount.toFixed(2)}`, bgColor: "bg-amber-100", icon: <Clock className="w-5 h-5 text-amber-600" /> },
    { title: "Paid Invoices", value: `$${paidAmount.toFixed(2)}`, bgColor: "bg-emerald-100", icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
    { title: "Overdue", value: `$${overdueAmount.toFixed(2)}`, bgColor: "bg-rose-100", icon: <AlertCircle className="w-5 h-5 text-rose-600" /> },
  ];

  const handleBillingClick = () => {};
  const handleRoomAvailabilityClick = () => console.log('Room Availability clicked');
  const handleDoctorSlotsClick = () => router.push('/helpdesk/doctor-slots');

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "overdue": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

 

  const handleEditClick = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditStatus(invoice.status);
    setEditMethod(invoice.method || "");
  };

  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/helpdesk/invoices/${editingInvoice.appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, method: editMethod }),
      });
      const data = await response.json();
      if (data.success) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.appointmentId === editingInvoice.appointmentId
              ? { ...inv, status: editStatus as any, method: editMethod }
              : inv
          )
        );
        toast.success("Invoice updated");
        setEditingInvoice(null);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("Error updating invoice");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <HelpDeskSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onBillingClick={handleBillingClick} onRoomAvailabilityClick={handleRoomAvailabilityClick} onDoctorSlotsClick={handleDoctorSlotsClick} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <HelpDeskSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onBillingClick={handleBillingClick} onRoomAvailabilityClick={handleRoomAvailabilityClick} onDoctorSlotsClick={handleDoctorSlotsClick} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <HelpDeskSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onBillingClick={handleBillingClick} onRoomAvailabilityClick={handleRoomAvailabilityClick} onDoctorSlotsClick={handleDoctorSlotsClick} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-gray-100"><span className="material-icons">menu</span></button>
          <h1 className="text-xl font-bold text-gray-800 truncate">Billing</h1>
        </header>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage invoices and payments</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between"><div className={`p-2 rounded-lg ${stat.bgColor}`}>{stat.icon}</div></div>
                  <p className="text-xs text-gray-500 mt-3">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by invoice ID, patient name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">All statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
               
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] lg:min-w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">Invoice ID</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">Patient</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">Date</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">Amount</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">Status</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">Method</th>
                      <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase border border-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.appointmentId} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 border border-gray-200 font-mono text-sm">{inv.id}</td>
                        <td className="p-3 border border-gray-200">
                          <div><p className="font-medium text-gray-900">{inv.patientName}</p><p className="text-xs text-gray-500">{inv.patientId}</p></div>
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                        <td className="p-3 border border-gray-200 text-sm font-medium">${inv.amount.toFixed(2)}</td>
                        <td className="p-3 border border-gray-200"><span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                        <td className="p-3 border border-gray-200 text-sm text-gray-600">{inv.method || "-"}</td>
                        <td className="p-3 border border-gray-200">
                          <button onClick={() => handleEditClick(inv)} className="p-1 rounded-md hover:bg-gray-100 text-amber-600">
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredInvoices.length === 0 && (
                <div className="text-center py-12">
                  <span className="material-icons text-gray-400 text-4xl mb-2">receipt</span>
                  <p className="text-gray-500">No invoices found</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Invoice</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={editMethod}
                  onChange={(e) => setEditMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select method</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Insurance">Insurance</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingInvoice(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateInvoice}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}