
'use client';

import { useState ,useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/pharmacy/Sidebar';
import { purchasesApi } from '@/lib/api/purchasesApi';
import { medicinesApi } from '@/lib/api/medicinesApi';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, PHARMACY_FEATURES } from "@/lib/feature";

// Mock Data - Replace with real API calls later
const suppliers = [
  { id: 1, name: "MediSupply Co." },
  { id: 2, name: "PharmaCorp International" },
  { id: 3, name: "MedTech Equipment" },
];


interface LineItem {
  id: number;
  medicineId: string; // store as string for select value compatibility
  batch: string;
  expiryDate: string;
  qty: string;
  purchasePrice: string;
  mrp: string;
  taxPercent: string;
}

const emptyLine = (id: number): LineItem => ({
  id,
  medicineId: "",
  batch: "",
  expiryDate: "",
  qty: "",
  purchasePrice: "",
  mrp: "",
  taxPercent: "",
});

export default function PurchaseEntryPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading] = useState(false);
  const [medicines, setMedicines] = useState<any[]>([]);
const [medicinesLoading, setMedicinesLoading] = useState(false);

  const [supplier, setSupplier] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [gstNo, setGstNo] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [lines, setLines] = useState<LineItem[]>([emptyLine(1), emptyLine(2), emptyLine(3)]);
  const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isMedicineEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.PHARMACY,
  PHARMACY_FEATURES.MEDICINE
);

useEffect(() => {
  if (!tenantLoading && !isMedicineEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading,isMedicineEnabled,router]);

  const updateLine = (id: number, field: keyof LineItem, value: string) => {
    setLines((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine(prev.length + 1)]);
  const removeLine = (id: number) => setLines((prev) => prev.filter((l) => l.id !== id));

  const lineTotal = (l: LineItem) => {
    const qty = Number(l.qty) || 0;
    const price = Number(l.purchasePrice) || 0;
    const tax = Number(l.taxPercent) || 0;
    const sub = qty * price;
    return sub + sub * (tax / 100);
  };

  const subtotal = lines.reduce((acc, l) => acc + (Number(l.qty) || 0) * (Number(l.purchasePrice) || 0), 0);
  const taxTotal = lines.reduce((acc, l) => {
    const sub = (Number(l.qty) || 0) * (Number(l.purchasePrice) || 0);
    return acc + sub * ((Number(l.taxPercent) || 0) / 100);
  }, 0);
  const grandTotal = subtotal + taxTotal;

  const isExpired = (date: string) => date && new Date(date) < new Date();

  const handleSave = async () => {
    if (!supplier) {
      toast.error("Please select a supplier");
      return;
    }
    if (!invoiceNo) {
      toast.error("Invoice number is required");
      return;
    }

    const items = lines
      .filter(l => l.medicineId && l.qty && l.purchasePrice)
      .map(l => ({
        medicineId: parseInt(l.medicineId),
        batch: l.batch,
        expiryDate: l.expiryDate,
        qty: parseFloat(l.qty),
        purchasePrice: parseFloat(l.purchasePrice),
        mrp: parseFloat(l.mrp) || 0,
        taxPercent: parseFloat(l.taxPercent) || 0,
        total: lineTotal(l),
      }));

    if (items.length === 0) {
      toast.error("At least one valid item is required");
      return;
    }

    const payload = {
      supplierId: parseInt(supplier),
      invoiceNo,
      invoiceDate,
      gstNo: gstNo || undefined,
      paymentMode,
      subtotal,
      taxTotal,
      grandTotal,
      items,
    };

    try {
      const response = await purchasesApi.createPurchase(payload);
      console.log('Save response:', response);

  const isSuccess = (response as any)?.success ?? (response as any)?.data?.success ?? false;
const message = (response as any)?.message ?? (response as any)?.data?.message ?? "";

      if (isSuccess) {
        toast.success("Purchase saved successfully", {
          description: `Invoice ${invoiceNo} has been recorded.`,
        });
        // Optionally reset form or redirect
        // router.push("/pharmacy/purchases");
      } else {
        toast.error(message || "Failed to save purchase");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, lineId: number, isLast: boolean) => {
    if (e.key === "Enter" && isLast) {
      e.preventDefault();
      addLine();
    }
  };

  const fetchMedicines = async () => {
  setMedicinesLoading(true);
  try {
    console.log('Fetching medicines...');

    const response = await medicinesApi.getMedicines({
      page: 1,
      limit: 100, // enough for dropdown
    });

    console.log('Medicines API response:', response);

    const isSuccess = (response as any)?.data?.success ?? (response as any)?.success ?? false;

    const data =
      response?.data?.data ??
      response?.data ??
      [];

    if (isSuccess) {
      setMedicines(data);
    } else {
      toast.error('Failed to load medicines');
    }
  } catch (error) {
    console.error('Medicine fetch error:', error);
    toast.error('Error loading medicines');
  } finally {
    setMedicinesLoading(false);
  }
};

useEffect(() => {
  fetchMedicines();
}, []);

if (!tenantLoading && !isMedicineEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Pharmacy Medicine feature is not enabled for {tenant?.name}.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
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
        {/* Header with View Purchases button */}
        <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 lg:hidden"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Purchase Entry
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Record new inventory purchases
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/pharmacy/purchase/purchaselist')}>
              View Purchases
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Supplier */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <Select value={supplier} onValueChange={setSupplier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Invoice No */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Invoice No <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      placeholder="Enter invoice number"
                    />
                  </div>

                  {/* Invoice Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Invoice Date
                    </label>
                    <Input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                  </div>

                  {/* GST No */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      GST No
                    </label>
                    <Input
                      value={gstNo}
                      onChange={(e) => setGstNo(e.target.value)}
                      placeholder="Enter GST number"
                    />
                  </div>

                  {/* Payment Mode */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Mode
                    </label>
                    <Select value={paymentMode} onValueChange={setPaymentMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Credit">Credit</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items Table - Desktop */}
            <div className="hidden md:block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Medicine</TableHead>
                      <TableHead>Batch No</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>MRP</TableHead>
                      <TableHead>Tax %</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, idx) => (
                      <TableRow key={line.id} className={isExpired(line.expiryDate) ? "bg-red-50 dark:bg-red-900/10" : ""}>
                        <TableCell>
                          <Select
                            value={line.medicineId}
                            onValueChange={(value) => updateLine(line.id, "medicineId", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {medicinesLoading ? (
  <SelectItem value="loading" disabled>
    Loading medicines...
  </SelectItem>
) : medicines.length === 0 ? (
  <SelectItem value="empty" disabled>
    No medicines found
  </SelectItem>
) : (
  medicines.map((m) => (
    <SelectItem key={m.id} value={m.id.toString()}>
      {m.name}
    </SelectItem>
  ))
)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.batch}
                            onChange={(e) => updateLine(line.id, "batch", e.target.value)}
                            className="w-28"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={line.expiryDate}
                            onChange={(e) => updateLine(line.id, "expiryDate", e.target.value)}
                            className={`w-32 ${isExpired(line.expiryDate) ? "border-red-500 text-red-600" : ""}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.qty}
                            onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.purchasePrice}
                            onChange={(e) => updateLine(line.id, "purchasePrice", e.target.value)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.mrp}
                            onChange={(e) => updateLine(line.id, "mrp", e.target.value)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.taxPercent}
                            onChange={(e) => updateLine(line.id, "taxPercent", e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, line.id, idx === lines.length - 1)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-right">
                          ₹{lineTotal(line).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {lines.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={() => removeLine(line.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {lines.map((line, idx) => (
                <Card key={line.id} className={isExpired(line.expiryDate) ? "border-red-200 dark:border-red-800" : ""}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Item #{line.id}</h3>
                      {lines.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => removeLine(line.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {/* Medicine */}
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Medicine</label>
                        <Select
                          value={line.medicineId}
                          onValueChange={(value) => updateLine(line.id, "medicineId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select medicine" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicines.map((m) => (
                              <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Batch No</label>
                          <Input
                            value={line.batch}
                            onChange={(e) => updateLine(line.id, "batch", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Expiry Date</label>
                          <Input
                            type="date"
                            value={line.expiryDate}
                            onChange={(e) => updateLine(line.id, "expiryDate", e.target.value)}
                            className={isExpired(line.expiryDate) ? "border-red-500" : ""}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Qty</label>
                          <Input
                            type="number"
                            value={line.qty}
                            onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Price</label>
                          <Input
                            type="number"
                            value={line.purchasePrice}
                            onChange={(e) => updateLine(line.id, "purchasePrice", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">MRP</label>
                          <Input
                            type="number"
                            value={line.mrp}
                            onChange={(e) => updateLine(line.id, "mrp", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Tax %</label>
                          <Input
                            type="number"
                            value={line.taxPercent}
                            onChange={(e) => updateLine(line.id, "taxPercent", e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, line.id, idx === lines.length - 1)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-sm font-medium">Line Total</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          ₹{lineTotal(line).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full" onClick={addLine}>
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>

            {/* Summary and Save */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-4">
              <div className="flex-1"></div>
              <Card className="w-full md:w-80">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tax</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span>Grand Total</span>
                    <span className="text-green-600 dark:text-green-400">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <Button className="w-full mt-2" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Purchase"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}