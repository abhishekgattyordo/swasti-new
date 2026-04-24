

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, User, Stethoscope, Menu, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/pharmacy/Sidebar';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, PHARMACY_FEATURES } from "@/lib/feature";

// Types
interface SaleItem {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total: number;
  batchNo?: string | null;
}

interface PendingSale {
  id: number;
  patient_id: string | null;
  patient_name: string;
  doctor_name: string;
  date: string;
  grand_total: number;
  payment_mode: string;
  items: SaleItem[];
  walkin_name: string | null;   // to identify walk‑in sales
}

export default function OPDispensePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState<PendingSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dispensedSuccess, setDispensedSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedItem = items.find((i) => i.id === selectedId);
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isOpDispenseEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.PHARMACY,
  PHARMACY_FEATURES.OP_DISPENSE
);

useEffect(() => {
  if (!tenantLoading && !isOpDispenseEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading,isOpDispenseEnabled,router]);

  // Fetch only pending OTC sales (walk‑in)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/pharmacy/sales?delivered=false');
        const data = await res.json();

        if (data.success) {
          // Filter to keep only walk‑in sales (where walkin_name exists)
          const walkInSales = data.data
            .filter((s: any) => s.walkin_name) // only walk‑ins
            .map((s: any) => ({
              ...s,
              items: Array.isArray(s.items) ? s.items : [],
            }));
          setItems(walkInSales);
        } else {
          toast.error('Failed to load sales');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelivery = async () => {
    if (!selectedItem) return;

    const itemsToDeliver = selectedItem.items.map((it) => ({
      saleItemId: it.id,
      medicineId: it.medicineId,
      quantity: it.quantity,
    }));

    const payload = {
      saleId: selectedItem.id,
      items: itemsToDeliver,
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/pharmacy/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
        setConfirmOpen(false);
        setDispensedSuccess(true);
        toast.success('Sale delivered and stock updated');
      } else {
        toast.error(result.message || 'Delivery failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItemCard = (item: PendingSale) => {
    return (
      <Card
        key={item.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedId === item.id ? 'border-green-500 ring-1 ring-green-500' : ''
        }`}
        onClick={() => {
          setSelectedId(item.id);
          setDispensedSuccess(false);
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {item.patient_name || 'Unknown'}
              </span>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                OTC
              </Badge>
            </div>
            <Badge className="bg-amber-100 text-amber-800">
              Pending
            </Badge>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
            <p>{item.doctor_name || 'Unknown'} • {item.items.length} items</p>
            <p>{item.date}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!tenantLoading && !isOpDispenseEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Pharmacy OP Dispense feature is not enabled for {tenant?.name}.
        </p>
      </div>
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
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col w-full lg:ml-0 min-w-0">
        <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 lg:hidden"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  OTC Sales Delivery
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Walk‑in sales pending stock deduction
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left panel – list of sales */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Pending Deliveries</h2>
              <div className="space-y-3">
                {items.map(renderItemCard)}
                {items.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                      No pending OTC sales
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Right panel – details and deliver */}
            <div className="lg:col-span-2">
              {!selectedItem ? (
                <Card className="flex items-center justify-center h-64">
                  <CardContent>Select a sale from the list</CardContent>
                </Card>
              ) : dispensedSuccess ? (
                <Card className="flex flex-col items-center justify-center h-64 gap-4">
                  <CheckCircle2 size={48} className="text-green-600" />
                  <p className="text-lg font-semibold">Successfully delivered!</p>
                  <Button variant="outline" onClick={() => { setSelectedId(null); setDispensedSuccess(false); }}>
                    Back to List
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Details Card */}
                  <Card>
                    <CardContent className="p-4">
                      <SaleDetails sale={selectedItem} />
                    </CardContent>
                  </Card>

                  {/* Items Table */}
                  <div className="rounded-xl border bg-white dark:bg-gray-800 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-4 py-3 text-left">Medicine</th>
                          <th className="px-4 py-3 text-left">Qty</th>
                          <th className="px-4 py-3 text-left">Unit Price</th>
                          <th className="px-4 py-3 text-left">Tax %</th>
                          <th className="px-4 py-3 text-left">Total</th>
                          <th className="px-4 py-3 text-left">To Process</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedItem.items.map((it) => (
                          <tr key={it.id}>
                            <td className="px-4 py-3 font-medium">{it.medicineName}</td>
                            <td className="px-4 py-3">{it.quantity}</td>
                            <td className="px-4 py-3">₹{it.unitPrice}</td>
                            <td className="px-4 py-3">{it.taxPercent}%</td>
                            <td className="px-4 py-3">₹{it.total.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className="text-green-600 font-medium">{it.quantity}</span>
                              <span className="text-xs text-gray-500 ml-1">(full)</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Action Bar */}
                  <div className="flex justify-end gap-3 sticky bottom-0 bg-gray-50 dark:bg-gray-900 py-3 border-t">
                    <Button variant="outline" onClick={() => setSelectedId(null)}>Cancel</Button>
                    <Button onClick={() => setConfirmOpen(true)} disabled={submitting}>
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Deliver
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Modal */}
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Delivery</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {selectedItem?.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm border-b pb-2">
                    <span>{it.medicineName}</span>
                    <span className="font-medium">× {it.quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-base pt-2">
                  <span>Total</span>
                  <span className="text-green-600">
                    ₹{Number(selectedItem?.grand_total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button onClick={handleDelivery} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}

function SaleDetails({ sale }: { sale: PendingSale }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
      <div className="flex items-center gap-2">
        <User size={16} className="text-purple-600" />
        <div>
          <p className="text-xs text-gray-500">Patient</p>
          <p className="font-semibold">{sale.patient_name || 'Unknown'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Stethoscope size={16} className="text-purple-600" />
        <div>
          <p className="text-xs text-gray-500">Doctor</p>
          <p className="font-semibold">{sale.doctor_name || 'Unknown'}</p>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500">Payment</p>
        <p className="font-semibold">{sale.payment_mode}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Total</p>
        <p className="font-semibold text-green-600">₹{Number(sale.grand_total || 0).toFixed(2)}</p>
      </div>
    </div>
  );
}