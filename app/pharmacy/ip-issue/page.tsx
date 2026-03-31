"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Bed,
  AlertTriangle,
  CheckCircle2,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/pharmacy/Sidebar";
import { admissionsApi } from "@/lib/api/admissions"; // adjust the import path as needed

// Types
interface IPOrderItem {
  id: number;
  medicineId: number;
  medicineName: string;
  prescribedQty: number;
  dispensedQty: number;
  availableQty: number;
}

interface IPOrder {
  id: number;
  patientId?: string; // <-- new field
  patientName: string;
  admissionDate: string;
  admissionId: string;
  ward: string;
  bed: string;
  date: string;
  issueType: "Regular" | "Emergency";
  status: "Pending" | "Completed" | "Partial";
  items: IPOrderItem[];
  walkin_name: string | null;
  stock_updated: boolean;
}

export default function IPIssuePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<IPOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [issueQtys, setIssueQtys] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingAdmission, setLoadingAdmission] = useState(false); // <-- new state

  const order = orders.find((o) => o.id === selectedId);

  // Fetch sales and filter for registered patients
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/pharmacy/sales?delivered=false");
        const data = await res.json();
        if (data.success) {
          // Only registered patients (walkin_name is null)
          const registeredSales = data.data.filter((s: any) => !s.walkin_name);

          const mapped: IPOrder[] = registeredSales.map((s: any) => ({
            id: s.id,
            patientId: s.patient_id, // <-- store patient ID
            patientName: s.patient_name || "Unknown",
            admissionId: "N/A",
            admissionDate: "",
            ward: "N/A",
            bed: "N/A",
            date: s.date || "",
            issueType: "Regular",
            status: s.stock_updated ? "Completed" : "Pending",
            items: Array.isArray(s.items)
              ? s.items.map((it: any) => ({
                  id: it.id,
                  medicineId: it.medicineId,
                  medicineName: it.medicineName,
                  prescribedQty: it.quantity,
                  dispensedQty: 0,
                  availableQty: it.availableQty || 0,
                }))
              : [],
            walkin_name: s.walkin_name,
            stock_updated: s.stock_updated,
          }));
          setOrders(mapped);
        } else {
          toast.error("Failed to load IP orders");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while loading orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Select an order and fetch its admission details
  const selectOrder = async (id: number) => {
  const o = orders.find((ord) => ord.id === id);
  if (!o || o.status !== "Pending") return;

  setSelectedId(id);

  // Reset issue quantities to full prescribed amount
  const qtys: Record<number, number> = {};
  o.items.forEach((item) => {
    qtys[item.medicineId] = item.prescribedQty;
  });
  setIssueQtys(qtys);

  // Fetch admission details if we have a patientId
  if (o.patientId) {
    setLoadingAdmission(true);
    try {
      // ✅ Admission data is directly returned (no response.success)
      const admissionData = await admissionsApi.getActiveAdmission(o.patientId);
      console.log("Fetched admission data:", admissionData);

      // Check if we got valid data (admission_id exists)
      if (admissionData && admissionData.admission_id) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === id
              ? {
                  ...order,
                  admissionId: admissionData.admission_id.toString(),
                  admissionDate: admissionData.admission_date
                    ? new Date(admissionData.admission_date).toLocaleDateString("en-CA")
                    : "N/A",
                  ward: admissionData.ward_name,
                  bed: admissionData.bed_number || "N/A",
                }
              : order
          )
        );
      } else {
        console.warn("No active admission for patient", o.patientId);
      }
    } catch (error) {
      console.error("Failed to fetch admission details:", error);
      toast.error("Could not load ward/bed information");
    } finally {
      setLoadingAdmission(false);
    }
  }
};

  useEffect(() => {
    console.log("🧾 Orders updated:", orders);
  }, [orders]);

  const handleIssue = async () => {
    if (!order) return;

    const itemsToDeliver = order.items
      .filter((item) => (issueQtys[item.medicineId] || 0) > 0)
      .map((item) => ({
        saleItemId: item.id,
        medicineId: item.medicineId,
        quantity: issueQtys[item.medicineId],
      }));

    if (itemsToDeliver.length === 0) {
      toast.error("No items to issue");
      return;
    }

    const payload = {
      saleId: order.id,
      items: itemsToDeliver,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/pharmacy/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: "Completed",
                  items: o.items.map((item) => ({
                    ...item,
                    dispensedQty:
                      item.dispensedQty + (issueQtys[item.medicineId] || 0),
                  })),
                }
              : o,
          ),
        );
        setConfirmOpen(false);
        toast.success("Medicines issued successfully");
        setSelectedId(null);
      } else {
        toast.error(result.message || "Failed to issue medicines");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button and sidebar */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full lg:ml-0 min-w-0">
        <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 lg:hidden"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  IP Medicine Issue (Registered Sales)
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Registered patient sales – ward/bed info not available
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order List */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pending Orders (Registered Patients)
              </h2>
              <div className="space-y-3">
                {orders
                  .filter((o) => o.status === "Pending")
                  .map((o) => (
                    <Card
                      key={o.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedId === o.id
                          ? "border-green-500 dark:border-green-400 ring-1 ring-green-500 dark:ring-green-400"
                          : ""
                      }`}
                      onClick={() => selectOrder(o.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {o.patientName}
                          </span>
                          <Badge
                            className={
                              o.status === "Pending"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }
                          >
                            {o.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Building2 size={12} />
                            {o.ward}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed size={12} />
                            {o.bed}
                          </span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {o.issueType}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {orders.filter((o) => o.status === "Pending").length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No pending registered patient sales
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Issue Panel */}
            <div className="lg:col-span-2">
              {!order ? (
                <Card className="flex items-center justify-center h-64">
                  <CardContent>Select a pending order</CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Patient Info */}
                  <Card>
                    <CardContent className="p-4">
                      {loadingAdmission ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">
                              Admission ID
                            </p>
                            <p className="font-semibold text-gray-900">
                              {order.admissionId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ward / Bed</p>
                            <p className="font-semibold text-gray-900">
                              {order.ward} / {order.bed}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Issue Type</p>
                            <Badge className="bg-blue-100 text-blue-800">
                              {order.issueType}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-semibold text-gray-900">
                              {order.admissionDate}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Items Table */}
                  <div className="rounded-xl border bg-white overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                        <tr>
                          <th className="px-4 py-3">Medicine</th>
                          <th className="px-4 py-3">Prescribed</th>
                          <th className="px-4 py-3">Previously Issued</th>
                          <th className="px-4 py-3">Available</th>
                          <th className="px-4 py-3">Issue Qty</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {order.items.map((item) => {
                          const remaining =
                            item.prescribedQty - item.dispensedQty;
                          const insufficient = item.availableQty < remaining;
                          return (
                            <tr
                              key={item.id}
                              className={insufficient ? "bg-amber-50" : ""}
                            >
                              <td className="px-4 py-3 font-medium">
                                {item.medicineName}
                              </td>
                              <td className="px-4 py-3">
                                {item.prescribedQty}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {item.dispensedQty}
                              </td>
                              <td
                                className={`px-4 py-3 ${
                                  item.availableQty === 0
                                    ? "text-red-600 font-bold"
                                    : ""
                                }`}
                              >
                                {item.availableQty}
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  min={0}
                                  max={Math.min(remaining, item.availableQty)}
                                  value={issueQtys[item.medicineId] || 0}
                                  onChange={(e) =>
                                    setIssueQtys({
                                      ...issueQtys,
                                      [item.medicineId]: Number(e.target.value),
                                    })
                                  }
                                  className="w-20"
                                  disabled={order.status !== "Pending"}
                                />
                              </td>
                              <td className="px-4 py-3">
                                {item.availableQty === 0 ? (
                                  <Badge className="bg-red-100 text-red-800">
                                    No Stock
                                  </Badge>
                                ) : insufficient ? (
                                  <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                                    <AlertTriangle size={12} /> Low
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800">
                                    OK
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Action Buttons */}
                  {order.status === "Pending" && (
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => setConfirmOpen(true)}
                        disabled={submitting}
                      >
                        {submitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Issue Medicines
                      </Button>
                    </div>
                  )}

                  {order.status === "Completed" && (
                    <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg">
                      <CheckCircle2 size={20} className="text-green-600" />
                      <span className="text-sm text-gray-600">
                        This order has been completed
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Modal */}
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Issue</DialogTitle>
              </DialogHeader>
              {order && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Issue to:{" "}
                    <span className="font-medium text-gray-900">
                      {order.patientName}
                    </span>
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item) => {
                      const qty = issueQtys[item.medicineId] || 0;
                      if (qty === 0) return null;
                      return (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm border-b pb-2"
                        >
                          <span className="text-gray-600">
                            {item.medicineName}
                          </span>
                          <span className="font-medium text-gray-900">
                            × {qty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleIssue} disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm Issue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
