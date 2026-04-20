'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Menu, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/pharmacy/Sidebar';
import { purchasesApi } from '@/lib/api/purchasesApi';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, PHARMACY_FEATURES } from "@/lib/feature";

// Types
interface Medicine {
  id: number;
  name: string;
  isActive: boolean;
}

interface StockBatch {
  id: number;
  medicine_id: number;
  medicineName: string;
  batch: string;
  expiryDate: string;
  availableQty: number;
}

const adjustmentTypes = ["Damage", "Expired", "Correction"];

export default function StockAdjustmentPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Real data states
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stockBatches, setStockBatches] = useState<StockBatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isStockAdjustmentEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.PHARMACY,
  PHARMACY_FEATURES.STOCK_ADJUSTMENT
);

useEffect(() => {
  if (!tenantLoading && !isStockAdjustmentEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading]);

  // Fetch stock data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await purchasesApi.getStock();
        // Normalize response (handles both wrapped and unwrapped)
        const responseData = response?.data?.data ?? response?.data ?? [];
        const stockData: StockBatch[] = responseData;

        setStockBatches(stockData);

        // Derive unique medicines from stock
        const uniqueMedicines: Medicine[] = [];
        const seen = new Set<number>();
        stockData.forEach((item) => {
          if (!seen.has(item.medicine_id)) {
            seen.add(item.medicine_id);
            uniqueMedicines.push({
              id: item.medicine_id,
              name: item.medicineName,
              isActive: true,
            });
          }
        });
        setMedicines(uniqueMedicines);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load stock data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const batches = stockBatches.filter((b) => b.medicine_id === Number(selectedMedicine));
  const currentStock = batches.find((b) => b.batch === selectedBatch);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedMedicine) e.medicine = "Select a medicine";
    if (!selectedBatch) e.batch = "Select a batch";
    if (!adjustmentType) e.type = "Select adjustment type";
    if (!quantity || Number(quantity) <= 0) e.quantity = "Enter valid quantity";
    if (!reason.trim()) e.reason = "Reason is mandatory";
    if (currentStock && Number(quantity) > currentStock.availableQty) e.quantity = "Cannot exceed available stock";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/pharmacy/stock-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: Number(selectedMedicine),
          batch: selectedBatch,
          adjustmentType,
          quantity: Number(quantity),
          reason,
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Stock adjustment recorded', {
          description: `${quantity} units of ${medicines.find(m => m.id === Number(selectedMedicine))?.name} (${selectedBatch}) have been adjusted.`,
        });
        setConfirmOpen(false);
        // Reset form
        setSelectedMedicine("");
        setSelectedBatch("");
        setAdjustmentType("");
        setQuantity("");
        setReason("");
        setErrors({});
      } else {
        toast.error(result.message || 'Adjustment failed');
      }
    } catch (error) {
      console.error('Adjustment error:', error);
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} <span className="text-red-500">*</span>
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!tenantLoading && !isStockAdjustmentEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Pharmacy Stock Adjustment feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Menu Button */}
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
                  Stock Adjustment
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Record damage, expiry, or corrections
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6 space-y-5">
                {/* Medicine Selection */}
                <Field label="Medicine" error={errors.medicine}>
                  <Select
                    value={selectedMedicine}
                    onValueChange={(value) => {
                      setSelectedMedicine(value);
                      setSelectedBatch("");
                    }}
                  >
                    <SelectTrigger className={errors.medicine ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicines.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* Batch Selection */}
                <Field label="Batch" error={errors.batch}>
                  <Select
                    value={selectedBatch}
                    onValueChange={setSelectedBatch}
                    disabled={!selectedMedicine}
                  >
                    <SelectTrigger className={errors.batch ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((b) => (
                        <SelectItem key={b.batch} value={b.batch}>
                          {b.batch} — Exp: {new Date(b.expiryDate).toLocaleDateString()} — Qty: {b.availableQty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* Current Stock Display */}
                {currentStock && (
                  <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Current Available Stock
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {currentStock.availableQty}
                      </span>
                    </div>
                  </div>
                )}

                {/* Adjustment Type */}
                <Field label="Adjustment Type" error={errors.type}>
                  <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                    <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {adjustmentTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* Quantity */}
                <Field label="Quantity" error={errors.quantity}>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={errors.quantity ? "border-red-500" : ""}
                    placeholder="Enter quantity"
                  />
                </Field>

                {/* Reason */}
                <Field label="Reason" error={errors.reason}>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className={errors.reason ? "border-red-500" : ""}
                    placeholder="Provide a detailed reason for this adjustment..."
                  />
                </Field>

                {/* Submit Button */}
                <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Adjustment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Confirmation Dialog */}
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Stock Adjustment</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <p><span className="text-gray-500">Medicine:</span> {medicines.find(m => m.id === Number(selectedMedicine))?.name}</p>
                <p><span className="text-gray-500">Batch:</span> {selectedBatch}</p>
                <p><span className="text-gray-500">Type:</span> {adjustmentType}</p>
                <p><span className="text-gray-500">Quantity:</span> {quantity}</p>
                <p><span className="text-gray-500">Reason:</span> {reason}</p>
                {currentStock && (
                  <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Stock will change from <span className="font-bold">{currentStock.availableQty}</span> →{' '}
                      <span className="font-bold">{currentStock.availableQty - Number(quantity)}</span>
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setConfirmOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleConfirm} disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm Adjustment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}