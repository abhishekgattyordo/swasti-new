'use client';

import { useState, useEffect } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Menu, X, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { purchasesApi } from '@/lib/api/purchasesApi';
import { salesApi } from '@/lib/api/salesApi';
import Sidebar from '@/components/pharmacy/Sidebar';
import { useTenant } from "@/contexts/TenantContext";
import { MODULE_KEYS, PHARMACY_FEATURES } from "@/lib/feature";

interface Medicine {
  id: number;
  name: string;
  selling_price: number;
  tax_percent: number;
  stock: number;
}

interface LineItem {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  total: number;
}

const emptyLine = (id: number): LineItem => ({
  id,
  medicineId: 0,
  medicineName: '',
  quantity: 1,
  unitPrice: 0,
  taxPercent: 0,
  total: 0,
});

export default function BillingPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patientType, setPatientType] = useState<'registered' | 'walkin'>('registered');

  // Registered patient fields
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [numericPatientId, setNumericPatientId] = useState<string | null>(null); // now string
  const [doctorName, setDoctorName] = useState('');
  const [fetchingPatient, setFetchingPatient] = useState(false);

  // Walk‑in fields
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinAddress, setWalkinAddress] = useState('');

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [lines, setLines] = useState<LineItem[]>([emptyLine(1)]);
  const [openMedicineId, setOpenMedicineId] = useState<number | null>(null);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [submitting, setSubmitting] = useState(false);
const { tenant, isMicroFeatureEnabled, isLoading: tenantLoading } = useTenant();

const isBillingEnabled = isMicroFeatureEnabled(
  MODULE_KEYS.PHARMACY,
  PHARMACY_FEATURES.BILLING
);

useEffect(() => {
  if (!tenantLoading && !isBillingEnabled) {
    router.push("/unauthorized");
  }
}, [tenantLoading,isBillingEnabled,router]);
  // Fetch medicines with proper error handling
  useEffect(() => {
    const fetchStock = async () => {
      setLoadingMedicines(true);
      try {
        const response = await purchasesApi.getStock();
        const rawData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : null;

        if (!rawData) {
          toast.error('Invalid stock data');
          return;
        }

        // Group by medicine_id to avoid duplicates
        const medicineMap = new Map<number, Medicine>();
        rawData.forEach((item: any) => {
          const medId = item.medicine_id;
          const existing = medicineMap.get(medId);
          const qty = item.availableQty;

          if (existing) {
            existing.stock += qty;
          } else {
            medicineMap.set(medId, {
              id: medId,
              name: item.medicineName,
              selling_price: Number(item.mrp),
              tax_percent: 0,
              stock: qty,
            });
          }
        });

        const medicinesWithStock = Array.from(medicineMap.values()).filter(m => m.stock > 0);
        setMedicines(medicinesWithStock);
      } catch (error) {
        console.error(error);
        toast.error('Could not load stock');
      } finally {
        setLoadingMedicines(false);
      }
    };
    fetchStock();
  }, []);

  // Fetch patient details when patientId changes (debounced)
  useEffect(() => {
    if (!patientId) {
      setPatientName('');
      setNumericPatientId(null);
      return;
    }
    const timer = setTimeout(async () => {
      setFetchingPatient(true);
      try {
        const res = await fetch(`/api/registration?patientId=${patientId}`);
        const data = await res.json();
        console.log('Registration API response:', data); // Debug log
        if (data.success && data.data) {
          setPatientName(data.data.full_name_en || '');
          
          // Extract numeric ID as string – try multiple fields
          const idStr = data.data.patient_id || data.data.id;
          if (idStr) {
            setNumericPatientId(String(idStr)); // ensure string
          } else if (/^\d+$/.test(patientId)) {
            // Fallback: if the input itself is numeric, use it directly
            setNumericPatientId(patientId);
          } else {
            setNumericPatientId(null);
          }
        } else {
          setPatientName('');
          setNumericPatientId(null);
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        toast.error('Failed to fetch patient details');
      } finally {
        setFetchingPatient(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [patientId]);

  const updateLine = (id: number, field: keyof LineItem, value: any) => {
    setLines((prev) => {
      const newLines = prev.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, [field]: value };
        if (field === 'medicineId') {
          const med = medicines.find((m) => m.id === value);
          if (med) {
            updated.medicineName = med.name;
            updated.unitPrice = med.selling_price;
            updated.taxPercent = med.tax_percent;
          }
        }
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxPercent') {
          updated.total = updated.quantity * updated.unitPrice * (1 + updated.taxPercent / 100);
        }
        return updated;
      });
      return newLines;
    });
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine(prev.length + 1)]);
  const removeLine = (id: number) => setLines((prev) => prev.filter((l) => l.id !== id));

  const subtotal = lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
  const taxTotal = lines.reduce(
    (acc, l) => acc + (l.quantity * l.unitPrice * l.taxPercent) / 100,
    0
  );
  const discount = 0;
  const grandTotal = subtotal + taxTotal - discount;

  const handleSubmit = async () => {
    const validItems = lines.filter(l => l.medicineId > 0 && l.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (patientType === 'registered') {
      if (!patientId) {
        toast.error('Please enter patient ID');
        return;
      }
      if (!numericPatientId) {
        toast.error('Could not determine patient ID');
        return;
      }
    } else {
      if (!walkinName) {
        toast.error('Please enter patient name');
        return;
      }
    }

    const payload = {
      // Use the string patient ID for registered patients
      patientId: patientType === 'registered' ? numericPatientId : undefined,
      patientName: patientType === 'registered' ? patientName || undefined : undefined,
      doctorName: doctorName || undefined,
      walkinName: patientType === 'walkin' ? walkinName : undefined,
      walkinPhone: patientType === 'walkin' ? walkinPhone : undefined,
      walkinAddress: patientType === 'walkin' ? walkinAddress : undefined,
      saleDate: new Date().toISOString().split('T')[0],
      subtotal,
      taxTotal,
      discountTotal: discount,
      grandTotal,
      paymentMode,
      items: validItems.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxPercent: item.taxPercent,
      })),
    };

    console.log('Submitting payload:', payload); // Debug log

    setSubmitting(true);
    try {
      const response = await salesApi.createSale(payload);
      console.log('📦 Full response object:', response);
      console.log('📦 response.data:', response.data);

      const isSuccess = response?.data?.success === true || (response as any)?.success === true;
      const message = response?.data?.message || (response as any)?.message;
      const saleId = response?.data?.data?.id || (response as any)?.data?.id;

      if (isSuccess && saleId) {
        toast.success('Sale recorded', {
          description: `Invoice #${saleId}. Stock will be reduced when marked as delivered.`,
        });

        // Reset form for next entry
        setLines([emptyLine(1)]);
        setPatientId('');
        setPatientName('');
        setNumericPatientId(null);
        setDoctorName('');
        setWalkinName('');
        setWalkinPhone('');
        setWalkinAddress('');
      } else {
        console.error('❌ Success condition failed – isSuccess:', isSuccess, 'saleId:', saleId);
        toast.error(message || 'Failed to complete sale');
      }
    } catch (error: any) {
      console.error('🔥 Sale error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!tenantLoading && !isBillingEnabled) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Pharmacy Billing feature is not enabled for {tenant?.name}.
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
        <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex h-16 items-center px-4 md:px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 lg:hidden"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">OTC Billing</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Direct medicine sale</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Patient Selection Card */}
            <Card>
              <CardContent className="p-5">
                <RadioGroup
                  value={patientType}
                  onValueChange={(v: any) => setPatientType(v)}
                  className="flex gap-6 mb-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="registered" id="registered" />
                    <Label htmlFor="registered">Registered Patient</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="walkin" id="walkin" />
                    <Label htmlFor="walkin">Walk-in</Label>
                  </div>
                </RadioGroup>

                {patientType === 'registered' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="patientId">Patient ID *</Label>
                      <Input
                        id="patientId"
                        type="text"
                        placeholder="Enter patient ID"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name</Label>
                      <Input
                        id="patientName"
                        placeholder="Auto‑filled or manual"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className={fetchingPatient ? 'opacity-50' : ''}
                      />
                      {fetchingPatient && <p className="text-xs text-gray-500">Fetching...</p>}
                    </div>
                    {/* Doctor Name field (required) */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="doctorName">Doctor Name *</Label>
                      <Input
                        id="doctorName"
                        placeholder="Prescribing doctor"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Full Name *"
                      value={walkinName}
                      onChange={(e) => setWalkinName(e.target.value)}
                    />
                    <Input
                      placeholder="Phone"
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                    />
                    <Input
                      placeholder="Address"
                      value={walkinAddress}
                      onChange={(e) => setWalkinAddress(e.target.value)}
                    />
                    <Input
                      placeholder="Doctor *"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items Table - Desktop */}
            <div className="hidden md:block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Medicine</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Tax %</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingMedicines ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="mt-2 text-sm text-gray-500">Loading medicines...</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      lines.map((line) => (
                        <TableRow key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <TableCell>
                            <Popover
                              open={openMedicineId === line.id}
                              onOpenChange={(open) => setOpenMedicineId(open ? line.id : null)}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openMedicineId === line.id}
                                  className="w-64 justify-between"
                                >
                                  {line.medicineName || 'Select medicine...'}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-0">
                                <Command>
                                  <CommandInput placeholder="Search medicine..." />
                                  <CommandList>
                                    <CommandEmpty>No medicine found.</CommandEmpty>
                                    <CommandGroup>
                                      {medicines.map((med) => (
                                        <CommandItem
                                          key={med.id}
                                          value={med.name}
                                          onSelect={() => {
                                            updateLine(line.id, 'medicineId', med.id);
                                            setOpenMedicineId(null);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              'mr-2 h-4 w-4',
                                              line.medicineId === med.id ? 'opacity-100' : 'opacity-0'
                                            )}
                                          />
                                          {med.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) => updateLine(line.id, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.unitPrice}
                              onChange={(e) => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.1"
                              value={line.taxPercent}
                              onChange={(e) => updateLine(line.id, 'taxPercent', parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell className="font-medium">₹{line.total.toFixed(2)}</TableCell>
                          <TableCell>
                            {lines.length > 1 && (
                              <Button variant="ghost" size="icon" onClick={() => removeLine(line.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" size="sm" onClick={addLine} disabled={loadingMedicines}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Summary Card */}
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col items-end">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between gap-8">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-8">
                      <span className="text-gray-500 dark:text-gray-400">Tax</span>
                      <span className="font-medium">₹{taxTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-8 font-bold text-base border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <span>Grand Total</span>
                      <span className="text-green-600 dark:text-green-400">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div className="mt-4 w-full md:w-64">
                    <Select value={paymentMode} onValueChange={setPaymentMode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Payment Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" size="sm" onClick={() => router.push('/pharmacy/stock')}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSubmit} disabled={submitting || loadingMedicines}>
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Complete Sale
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

